# Arhitectura Afacerii — Logica platformei

Document de referință pentru un agent (ex. Claude Code) care trebuie să înțeleagă
**cum funcționează fiecare proces** din platformă, nu doar unde stă codul.

Stack: TanStack Start (React 19 + Vite), TanStack Router (file-based în `src/routes`),
Supabase (Lovable Cloud) pentru auth + date, CSS custom cu tokens (fără Tailwind config legacy).

---

## Tabelul proceselor

| # | Proces | Intrare | Sursa de adevăr | Fișiere cheie |
|---|--------|---------|-----------------|---------------|
| 1 | Autentificare & sesiune | login/register | Supabase Auth + `profiles`/`user_roles` | `context/AuthContext.tsx`, `lib/sessionPersistence.ts` |
| 2 | „Ține-mă minte" 12h | checkbox la login | cookie + localStorage `aa_remember_mode` | `lib/sessionPersistence.ts` |
| 3 | Whitelist & tarife | email admin | `whitelist` (per curs), trigger `handle_new_user` | DB, `AuthContext.register` |
| 4 | Conținut (module/lecții) | cod static + DB overlay | 3 straturi, per curs (vezi §4) | `lib/content/*`, `lib/contentSnapshot.ts`, `context/LiveContentContext.tsx` |
| 5 | Numerotare lecții X.Y | structura modulului | calcul la runtime | `lib/lessonNumbering.ts` |
| 6 | Progres lecții | click „am terminat" | `progress` | `hooks/useProgress.ts` |
| 7 | Exerciții interactive | input elev | local-first + `exercise_responses` | `components/exercises/ExerciseBlock.tsx`, `lib/exerciseSync.ts`, `lib/exerciseData.ts` |
| 8 | Finalizare exercițiu | buton | `progress` + `exercise_completions` | `hooks/useProgress.ts`, `pages/LessonPage.tsx` |
| 9 | Notițe la lecție | textarea | `lesson_notes` (autosave) | `hooks/useLessonNote.ts` |
| 10 | Documente printabile | wizard | definiții statice + răspunsuri | `lib/documentData.ts`, `pages/DocumentWizardPage.tsx` |
| 11 | Materialele mele (export) | buton descărcare | agregare răspunsuri | `lib/materialsExport.ts`, `pages/MaterialsPage.tsx` |
| 12 | Bibliotecă | — | conținut static | `lib/libraryData.ts`, `pages/library/articles/*` |
| 13 | Onboarding quiz (per curs) | răspunsuri elev | `quiz_responses` (user+curs) + flag local | `pages/OnboardingQuiz.tsx`, `lib/quizProfile.ts`, `lib/access.ts` |
| 14 | Activity log | evenimente app | `activity_log` | `lib/activity.ts` |
| 15 | Admin / Supervisor cockpit | date agregate | `student_insights`, `supervisor_notes` | `lib/studentInsights.functions.ts`, `lib/studentScoring.ts`, `pages/admin/*` |
| 16 | Reset parolă (OTP) | email | Supabase Auth OTP | `pages/ForgotPassword.tsx`, `pages/ResetPassword.tsx` |
| 17 | Rutare & gating | URL | `_app` / `admin` guards | `src/routes/*` |
| 18 | Infrastructură email | evenimente auth/app | coadă pgmq + pg_cron | `src/routes/lovable/email/queue/process.ts` |
| 19 | Onboarding wizard & anunțuri | prima vizită / anunț admin | flag local + tabelul `announcements` | `pages/OnboardingWizard.tsx`, `components/aa/NotificationBanner.tsx`, `lib/announcements.ts` |
| 20 | Recuperare răspunsuri (admin) | export local al elevului | `exercise_responses` | `lib/adminRecovery.functions.ts` |
| 21 | Căutare globală | Cmd/Ctrl+K | conținutul cursului curent | `components/aa/SearchModal.tsx` |
| 22 | Cursuri & înscrieri | admin | `courses`, `enrollments` | `lib/courses.ts`, `lib/enrollments.ts`, `context/CourseContext.tsx` |
| 23 | Ecranul general de selecție | login | înscrierile elevului | `pages/CoursesHub.tsx`, `lib/navigation.ts` |

---

## 1. Autentificare & sesiune

`AuthProvider` este singura sursă de adevăr pentru „cine e logat".

1. La mount: `supabase.auth.getSession()`.
2. Dacă fereastra de 12h a expirat (§2) → `signOut()` și `user = null`.
3. Dacă nu există sesiune dar există backup valid → `supabase.auth.setSession(backup)`.
4. `hydrateUser()` face 3 query-uri în paralel: `profiles`, `user_roles`, `quiz_responses`
   și compune obiectul `User` (`role`, `tariff`, `quiz_completed`, `avatar_url`).
5. Dacă hidratarea eșuează (rețea proastă) → `buildFallbackUser()` din datele sesiunii.
   **Regulă:** o eroare de rețea nu are voie să blocheze aplicația într-un ecran de loading.

`onAuthStateChange` reacționează **doar** la `SIGNED_IN`, `SIGNED_OUT`, `USER_UPDATED`.
`INITIAL_SESSION` și `TOKEN_REFRESHED` sunt ignorate intenționat — altfel re-hidratarea
periodică făcea `quiz_completed=false` pentru o clipă și ascundea lecția în spatele
gate-ului de onboarding. Un contor `hydrationSeq` anulează rezultatele hidratărilor vechi.

## 2. Fereastra „ține-mă minte" de 12 ore

Problema: Safari pe iOS șterge intrarea Supabase din localStorage la închiderea browserului.

Soluția: la login cu bifa, `startRememberWindow()` scrie **deadline-ul absolut** (epoch ms)
în `aa_remember_mode`, în **cookie + localStorage**, iar tokenurile în `aa_session_backup`.
- Deadline-ul e stocat în flag, deci un refresh de token **nu poate prelungi** fereastra.
- `saveSessionBackup()` doar actualizează tokenurile, păstrând deadline-ul.
- Verificare la boot, la interval de 30s, pe `visibilitychange` și pe `focus`
  (timerele îngheață în taburile de background pe mobil).
- La expirare: `clearSessionBackup()` + `signOut()`.

## 3. Whitelist & tarife

Înregistrarea e permisă doar pentru emailuri din `whitelist`. Verificare dublă:
RPC `is_email_whitelisted` în UI (mesaj prietenos) + trigger `handle_new_user` în DB
(sursa reală, aruncă excepție). Triggerul creează `profiles` cu tariful din whitelist
și rolul `student` în `user_roles`.

Whitelist-ul e **per curs**: un rând per `(email, course_id)`, deci adminul preautorizează
separat fiecare produs. `is_email_whitelisted` rămâne „are acces la măcar un curs".
La înregistrare, `handle_new_user` creează câte o **înscriere** (`enrollments`) pentru
fiecare curs la care emailul e preautorizat.

Tarife: `student | designer | arhitect` — gating de conținut, stocat **pe înscriere**,
nu pe profil (§22). `profiles.tariff` rămâne în bază doar ca plasă de migrație.
Roluri: `student | admin`, în tabel separat, citite prin `has_role()` (SECURITY DEFINER).
`prevent_tariff_self_escalation` blochează modificarea propriului tarif/email de către non-admini;
`prevent_enrollment_self_grant` face același lucru pentru înscrieri (un elev nu se poate
înscrie singur la un curs neplătit).
`lock_admin_role` permite rolul `admin` doar pentru 3 UUID-uri hardcodate.

## 4. Conținutul (module + lecții) — 3 straturi

Cel mai important proces pentru fiabilitate. Lecțiile **dispăreau** înainte pentru elevi;
acum există trei straturi suprapuse, în ordine:

1. **Static** — `src/lib/content/<curs>.ts`: structura completă a fiecărui curs (module,
   lecții, linkuri YouTube, durate, exerciții inline în timeline). Funcționează offline,
   instant, fără auth. Se cere prin `getCourseModules(courseId)` din `@/lib/content`;
   **nu există** un export global `MODULES` — orice consumator spune explicit cărui curs
   îi cere conținutul, ca două metodologii să nu ajungă în aceleași procente.
2. **Snapshot** — `src/lib/contentSnapshot.ts`: export JSON al conținutului publicat,
   aplicat peste static la **încărcarea modulului**, înainte de orice apel de rețea.
3. **DB overlay** — `LiveContentContext`: citește `modules` + `lessons` din Supabase
   și le suprapune peste `MODULES` (mutație in-place).

Reguli de overlay (`overlayContent`):
- Rândurile din DB se grupează **întâi pe `course_id`** (lipsa lui = `business`, rândurile
  de dinainte de multicurs). Fără asta, modulul cu `order_index` 0 din Start ar suprascrie
  modulul 0 din Business — fiecare curs își numerotează modulele de la zero.
- În interiorul cursului, modulele se potrivesc după `order_index`.
- Lecțiile se potrivesc **după titlu normalizat** (lowercase, fără diacritice, fără punctuație);
  abia apoi, pentru ce a rămas, pozițional. Potrivirea pur pozițională muta linkurile
  video pe lecția greșită când se adăuga/ștergea o lecție.
- Câmpurile goale din DB **nu suprascriu** valorile statice (`video_url`, `pdf_url` doar dacă non-empty).
- `is_published` din DB nu poate ascunde o lecție care are deja video în cod:
  `sl.is_published = db.is_published || !!sl.video_url`.

Reziliență: payload-ul se cache-uiește în `localStorage` (`aa_content_overlay_v1`) și se
aplică la boot; fetch-ul are 5 încercări cu backoff exponențial; un eșec **nu șterge**
niciodată ce e deja aplicat; re-sync la `visibilitychange`/`online` dacă au trecut >5 min.
`version` crește doar când payload-ul chiar s-a schimbat (remount controlat al arborelui).

## 5. Numerotare lecții (X.Y)

`lessonNumbering.ts`: X = numărul modulului (extras din `etapa`, fallback `order_index`).
Y = poziția între elementele **trackabile** ale modulului — exercițiu sau lecție cu video.
Lecțiile-placeholder fără video nu consumă numere și nu intră în procentele de progres.

## 6. Progres lecții

`useProgress` scrie în `progress` (insert + delete, fără UPDATE). Anularea e expusă în UI:
pe pagina lecției, cardul „Lecție finalizată / Exercițiu finalizat" are acțiunea
**„Anulează finalizarea"** (`unmarkComplete`, plus `unmarkExerciseComplete` pentru exerciții).
RLS: elevul vede/scrie doar rândurile proprii, adminul poate citi tot.
Procentele de completare exclud lecțiile fără video.

**Per curs.** Rândurile din `progress` sunt globale (id-urile de lecție sunt unice între
cursuri), dar procentele nu au voie să fie: `useProgress()` citește cursul din rută și
raportează totul la modulele lui. `getOverallProgressFor(courseId)` calculează pentru un
curs oarecare — îl folosește ecranul de selecție. Un elev cu Business terminat și Start
abia început nu are voie să apară la 50%.

## 7. Exerciții interactive — local-first

`exerciseData.ts` definește șabloanele; `ExerciseBlock.tsx` randează tipurile:
`text`, `checkboxes`, `dynamic-table`, `quiz-mcq`, `function-roles`, `miro-org`,
`decision-matrix` (cu adăugare/ștergere dinamică de roluri) etc.

Ciclul de salvare:
1. Fiecare tastare scrie **imediat** în `localStorage` (nu se pierde nimic la refresh).
2. `pushExerciseResponse()` face upsert debounced (1s) în `exercise_responses`,
   cheie `(user_id, exercise_id)`, cu `updated_at`.
3. Debounce-ul e per `(user, exerciseId)`; dacă sesiunea s-a schimbat între timp,
   scrierea e abandonată (nu scriem datele unui elev în contul altuia).
4. La montare se face reconciliere: se compară `updated_at` din cloud cu timestampul
   local și câștigă cel mai recent — de aceea completările „nu mai dispar" între dispozitive.
5. `flushExerciseResponse()` forțează scrierea sincronă (la submit/print).
6. `subscribeExerciseSync()` alimentează indicatorul de status „salvat / eroare".

## 8. Finalizarea exercițiilor

Butonul „Marchează exercițiul ca finalizat" din `LessonPage` scrie **două** rânduri:
1. `progress` pe id-ul paginii-exercițiu (sursa procentelor de progres);
2. `exercise_completions` pe `exercise_id` (bifa independentă de conținutul răspunsului).

Ambele se scriu prin `useProgress` (`markComplete` + `markExerciseComplete`), iar
`isExerciseDone` citește `exercise_completions`. Anularea șterge din ambele.
Hook-ul `useExerciseCompletions.ts` a fost eliminat — era cod mort, nu îl reintroduce.

## 9. Notițe

`useLessonNote`: autosave debounced în `lesson_notes` (`user_id`, `lesson_id`), trigger
`touch_updated_at`. Notițele sunt incluse în exporturile de materiale.

## 10. Documente printabile

`documentData.ts` conține definițiile (Doc 01…13): secțiuni, câmpuri, și un generator HTML
brandat (header negru, monogramă, accente aurii) transformat în PDF prin print.
Fluxul: `/documents` (listă) → `/documents/$docId/fill` (wizard) → previzualizare → print/PDF.
Documentele completate sunt **local-first cu cloud** (ca exercițiile): `lib/documentSync.ts`
ține lista în `localStorage` (`aa_my_docs_<userId>`) și o sincronizează în
`document_responses` (`document_id = '__my_docs__'`), cu reconciliere pe timestamp la montare.
Astfel nu se mai pierd la schimbarea browserului/dispozitivului.
**Fiecare curs își are setul lui de printabile**: `PlatformDocument.courseId`
(lipsa lui = `business`), filtrat prin `documentsForCourse(courseId)`; wizardul refuză un
document care nu aparține cursului din URL.

Două moduri: șablon gol printabil sau completat pe platformă și printat deja completat.
Paginarea e controlată manual (page-breaks explicite) pentru că secțiuni lungi
se tăiau la finalul paginii.

## 11. Materialele mele

`materialsExport.ts` agregă răspunsurile la exerciții + notițele și le randează cu **același**
template brandat ca documentele (nu text brut), cu etichete lizibile în loc de chei tehnice.
Export individual sau în bloc. Pagina arată **doar materialele cursului curent** (filtrare
pe modulele lui), iar exportul în bloc respectă același filtru.

## 12. Bibliotecă

Conținut static suplimentar (articole text/video în afara programei), afișat ca bento grid
în `LibraryPage`; fiecare articol e o componentă React animată (`pages/library/articles/*`),
nu markdown. Restricție de brand: nicio mențiune de autori terți.

**Fiecare curs își are biblioteca lui**: `LibraryItem.courseId` (lipsa lui = `business`),
filtrat prin `libraryItemsForCourse(courseId)`. Un articol din altă ramură nu se deschide
sub cursul din URL.

## 13. Onboarding quiz

**Fiecare curs are diagnosticul lui**, obligatoriu înainte de practicum. `quiz_responses`
e cheiat pe `(user_id, course_id)` — vechea constrângere `UNIQUE(user_id)` a căzut.
Răspunsurile merg acolo (+ profil calculat de `quizProfile.ts`).

Flagul local devine `aa_quiz_done_<userId>_<courseId>`, iar gating-ul se face cu
`hasCompletedOnboarding(user, courseId)` din `lib/access.ts`. Cheia veche fără curs
(`aa_quiz_done_<userId>`) e acceptată **doar pentru Business**, cursul care exista când a
fost scrisă — altfel un elev de Business ar sări gratis peste diagnosticul de Start.

Fiecare metodologie își cere propriul calcul de profil: cel din `quizProfile.ts` e
calibrat pe diagnosticul de business și nu se refolosește pe o audiență de începători.

## 14. Activity log

`lib/activity.ts` scrie evenimente tipizate în `activity_log`. Toate tipurile declarate sunt
efectiv scrise:

| Tip | Unde se scrie |
|---|---|
| `login` / `logout` | `AuthContext.login` / `AuthContext.logout` |
| `lesson_view`, `module_view` | `LessonPage` la deschiderea lecției |
| `lesson_complete`, `exercise_complete` | `LessonPage.handleComplete` |
| `note_saved` | `useLessonNote` după salvarea în cloud |
| `quiz_complete` | `OnboardingQuiz` |

Semnalele de frecvență mare (`login`, `lesson_view`, `module_view`, `note_saved`) trec prin
`logActivityOnce(key, event)` — maximum o scriere pe zi per cheie, ca `activity_log` să
rămână un semnal curat de „ultima activitate" fără să umple tabelul.
**Important:** „Activi azi", `last_activity` și `studentScoring.daysSinceLastActive` (deci
statusul din Attention Queue și briefingul AI) se bazează pe acest tabel — orice acțiune nouă
care înseamnă „elevul lucrează" trebuie să logheze un eveniment, altfel elevii activi apar
fals ca inactivi. Identitatea (email/nume) e completată
server-side de triggerul `activity_log_set_identity` — clientul nu o poate falsifica.
Insert-only; elevul își vede doar propriile evenimente, adminul le vede pe toate.

## 15. Admin & Supervisor cockpit

Cockpitul e **per curs**: scorurile, coada de atenție și briefingul se raportează la o
singură metodologie. Domeniul vine din parametrul `?curs=` (`useAdminCourseScope()`),
implicit primul curs activ. Server-funcțiile primesc `courseId` și filtrează
`modules`, `quiz_responses` și `student_insights` pe el.

- `adminData.ts` — agregări pentru dashboard, progres, utilizatori.
- `AdminUsers` — gestionează tarife și roluri (inclusiv ale altor admini), limitat de
  `lock_admin_role` pentru rolul de admin.
- `studentScoring.ts` — scoruri deterministe (progres, ritm, blocaje) → `AttentionQueueCard`.
- `studentInsights.functions.ts` — server function care generează, prin Lovable AI, un
  **briefing** înainte de apelul cu elevul: 6 categorii de întrebări, fiecare însoțită de
  răspunsurile deja date de elev (supervizorul nu mai caută prin platformă). Rezultatul e
  persistat în `student_insights` (admin-only prin RLS).
- `supervisor_notes` — notițe per elev; un admin poate edita/șterge doar notele proprii.

## 16. Reset parolă (OTP)

Flux în 3 pași în `ForgotPassword.tsx`: email → cod OTP din 6 cifre → parolă nouă.
`ResetPassword.tsx` mai acceptă și linkurile clasice (PKCE / token hash) pentru
compatibilitate. Nu se face niciodată reset doar pe baza prezenței în whitelist
(ar permite preluarea contului).

## 17. Rutare & gating

Toate rutele de studiu trăiesc sub **`/c/<slug-curs>/`**. Cursul stă în URL, nu în state
global: un elev poate ține două cursuri deschise în două taburi fără să se calce, iar
linkurile trimise pe Telegram duc exact unde trebuie.

- `src/routes/index.tsx` → `resolveLandingPath(user)`: fără cont → `/login`; **un singur
  curs → direct în el**; zero sau mai multe → `/cursuri`.
- `_app.tsx` — layout protejat: așteaptă `auth.loading` **și** `LiveContent.ready`,
  apoi randează `Layout` (sidebar + header). Fără user → `/login`.
- `_app.c.$courseSlug.tsx` — **poarta de curs**: validează slug-ul, cursul activ și
  înscrierea, apoi pune cursul în `CourseContext`. Singurul loc unde se verifică accesul
  la un produs. Adminul poate deschide orice curs, ca să verifice conținutul.
- `/cursuri` — ecranul general (§23), în afara `_app` pentru că sidebar-ul e legat de curs.
- `/c/<slug>/quiz` — pagină pe tot ecranul, cu poartă proprie, în afara `_app`.
- `admin.tsx` — gate suplimentar pe rol. Paginile de admin nu au `CourseContext`; domeniul
  de vizualizare vine din `?curs=` prin `useAdminCourseScope()`.
- Rutele vechi (`/dashboard`, `/lesson/$id`, `/module/$id`, `/documents`, `/library`,
  `/materials`, `/quiz`) au rămas ca **redirecturi**, ca linkurile deja trimise să nu moară.
  Pentru `/lesson/$id` și `/module/$id` cursul se deduce din prefixul id-ului.
- Rute publice: `/login`, `/register`, `/forgot-password`, `/reset-password`, `/welcome`.
- `src/lib/router-compat.tsx` oferă `Navigate`/helpers în stil react-router peste TanStack Router
  (moștenire din migrare) — **nu** se instalează `react-router-dom`.

## 18. Infrastructura de email

Emailurile (auth + tranzacționale) intră într-o coadă **pgmq** din DB; un job **pg_cron**
apelează endpointul public `src/routes/lovable/email/queue/process.ts`, care le trimite prin
`@lovable.dev/email-js` de pe domeniul verificat `notificari.live.morarvictor.com`.
Jobul cron și secretul din vault sunt configurate **în afara migrațiilor** (nu se regăsesc în
`supabase/migrations`), deci un reset de DB nu le recreează automat.

## 19. Onboarding wizard & anunțuri

`/welcome` (`OnboardingWizard.tsx`) rulează o singură dată per utilizator, marcat de flagul
local `aa_wizard_done`; nu e un gate de rută, ci un tur ghidat.

Anunțurile sunt **server-side**: adminul publică din `AdminDashboard` în tabelul
`announcements` (mesaj, tip, `expires_at`), iar `NotificationBanner` citește anunțul activ
prin `lib/announcements.ts` și îl arată tuturor elevilor. Închiderea bannerului e per sesiune
(`sessionStorage`, cheie = id-ul anunțului). Un anunț nou nu mai cere deploy.

## 20. Recuperarea răspunsurilor (admin)

`adminRecovery.functions.ts` permite adminului să importe în `exercise_responses` un export
din `localStorage`-ul elevului (cazuri în care sincronizarea cloud a eșuat pe dispozitivul lui).
Este server function protejată, cu verificare de rol admin.

## 21. Căutare globală

`SearchModal` (Cmd/Ctrl+K) caută în modulele, lecțiile, documentele și articolele deja
încărcate în memorie (nu face query în DB) — de aceea rezultatele respectă exact
straturile de conținut din §4. Caută **doar în cursul curent**, iar indexul se
construiește la deschidere, nu la încărcarea fișierului: overlay-ul din DB mutează
modulele după boot, iar un index construit prea devreme ar căuta prin titlurile vechi.

## 22. Cursuri & înscrieri

`src/lib/courses.ts` e registrul: id, slug, titluri, accent (token de design), `idPrefix`,
`hasQuiz`, `is_active`. Conținutul fiecărui curs stă în `src/lib/content/<curs>.ts`.

**REGULA ID-URILOR.** Fiecare curs are un `idPrefix`, iar toate id-urile lui de module /
lecții / exerciții încep cu el. Business păstrează prefixul **gol**, pentru că id-urile lui
(`m-0`, `l-1-1`, `e-0-1`) sunt deja scrise în datele elevilor. Orice curs nou primește
prefix ne-gol (`st-` pentru Start). Așa id-urile rămân unice global și cele patru tabele
grele — `progress`, `exercise_responses`, `lesson_notes`, `document_responses` — **nu au
nevoie de nicio migrație** la adăugarea unui curs. `courseIdFromContentId()` deduce cursul
dintr-un id, ceea ce face posibile redirecturile de la linkurile vechi.

**Înscrierile** (`enrollments`, cheie `(user_id, course_id)`) spun la ce produse are acces
elevul și cu ce tarif. Tariful stă aici pentru că un elev poate fi `arhitect` la Business și
`student` la Start — o singură coloană pe profil nu poate exprima asta. Citirea e
local-first (`lib/enrollments.ts`): lista se oglindește în `localStorage`, iar o eroare de
rețea întoarce cache-ul, nu o listă goală — altfel un elev plătitor ar vedea „nu ai acces".
Cache-ul se șterge la logout, ca următorul cont de pe același dispozitiv să nu vadă
cursurile celui dinainte.

`CourseContext` expune cursul rutei curente, modulele, evenimentele live și tariful **la
acel curs**. `useRequiredCourse()` cade zgomotos dacă e folosit în afara unei rute de curs.

## 23. Ecranul general de selecție

`/cursuri` (`pages/CoursesHub.tsx`) arată **doar cursurile la care elevul are acces**, cu
procentul din fiecare. Elevul cu un singur curs nu ajunge aici — `resolveLandingPath()` îl
duce direct în el, ca să nu plătească un click în plus la fiecare intrare. Comutatorul
permanent din sidebar apare doar dacă are unde comuta. Adminul vede toate cursurile active.
Un curs fără conținut apare ca „în pregătire", nu ca un card mort.

---

## Notă importantă despre ID-urile exercițiilor

Tabelul DB `exercises` are UUID-uri generate, dar răspunsurile elevilor se salvează pe
**ID-urile din cod** (`e-0-1`, `ex-8-1-…`). Orice agregare (scoring, briefing, cozi de atenție)
trebuie să numere exercițiile din `src/lib/staticExercises.ts` (derivat din `src/lib/content/`),
**nu** din tabelul `exercises`; altfel raportează 0 exerciții completate.
`staticExercisesByModuleOrder(courseId)` și `allStaticExercises(courseId)` cer explicit cursul.

Căutările **după id** (`materialsExport`, `MaterialsPage`) pot folosi `allModulesFlat()`,
pentru că id-urile sunt unice între cursuri. Agregările nu au voie — acelea sunt per curs.

---

## Invariante de respectat la orice modificare

1. Conținutul publicat nu are voie să dispară: orice lecție nouă se scrie în **cod**
   (`data.ts` + `contentSnapshot.ts`) **și** în DB, nu doar în DB.
   *Precizare:* `contentSnapshot.ts` conține **intenționat** doar lecțiile video publicate
   (≈24), nu toate intrările din `data.ts` (≈51). Exercițiile și lecțiile fără video sunt
   excluse prin construcție, la fel ca în overlay-ul din DB. Nu e o desincronizare.
2. Nicio scriere de date de elev fără verificarea sesiunii curente.
3. Local-first: UI-ul salvează instant local, cloud-ul e best-effort cu reconciliere pe timestamp.
4. Rolurile stau doar în `user_roles`, verificate prin `has_role()`; niciodată pe `profiles`.
5. Orice tabel nou în `public`: `CREATE TABLE` → `GRANT` → `ENABLE RLS` → policies.
6. Fără culori hardcodate în componente — doar tokenii de design din `src/styles.css`.
   Paleta include acum tokeni de stare cu variantă light/dark: `--ok`, `--ok-soft`,
   `--warn`, `--warn-strong`, `--error`, `--info` (plus variantele `*-dim`).
   Valorile literale `#4ade80`, `#f87171`, `#a78bfa` etc. au fost înlocuite cu acești tokeni.
7. Documentele și exporturile folosesc același template brandat; niciun stil nou ad-hoc.
   Excepție conștientă: HTML-ul generat pentru PDF nu poate folosi `var(--token)`
   (rulează în afara contextului CSS al aplicației) — acolo culorile brandului rămân literale.
8. Exercițiile se numără din cod (`staticExercises.ts`), niciodată din tabelul `exercises`.
9. **Id-urile de conținut ale unui curs nou primesc prefixul cursului** (`idPrefix` din
   `courses.ts`). Business rămâne fără prefix. Fără asta, răspunsurile a doi elevi din
   cursuri diferite s-ar suprapune pe aceleași chei text din DB.
10. **Orice procent, scor sau agregare se raportează la un singur curs.** Căutarea după id
   poate trece peste cursuri; numărătoarea, niciodată.
11. Conținutul secundar (bibliotecă, documente) are `courseId`; lipsa lui înseamnă
   `business`, nu „toate cursurile".
12. Accesul la un produs se verifică într-un singur loc — poarta `_app.c.$courseSlug.tsx` —
   pe baza tabelului `enrollments`, niciodată pe baza tarifului de pe profil.

