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
| 3 | Whitelist & tarife | email admin | tabelul `whitelist`, trigger `handle_new_user` | DB, `AuthContext.register` |
| 4 | Conținut (module/lecții) | cod static + DB overlay | 3 straturi (vezi §4) | `lib/data.ts`, `lib/contentSnapshot.ts`, `context/LiveContentContext.tsx` |
| 5 | Numerotare lecții X.Y | structura modulului | calcul la runtime | `lib/lessonNumbering.ts` |
| 6 | Progres lecții | click „am terminat" | `progress` | `hooks/useProgress.ts` |
| 7 | Exerciții interactive | input elev | local-first + `exercise_responses` | `components/exercises/ExerciseBlock.tsx`, `lib/exerciseSync.ts`, `lib/exerciseData.ts` |
| 8 | Finalizare exercițiu | buton | `exercise_completions` | `hooks/useExerciseCompletions.ts` |
| 9 | Notițe la lecție | textarea | `lesson_notes` (autosave) | `hooks/useLessonNote.ts` |
| 10 | Documente printabile | wizard | definiții statice + răspunsuri | `lib/documentData.ts`, `pages/DocumentWizardPage.tsx` |
| 11 | Materialele mele (export) | buton descărcare | agregare răspunsuri | `lib/materialsExport.ts`, `pages/MaterialsPage.tsx` |
| 12 | Bibliotecă | — | conținut static | `lib/libraryData.ts`, `pages/library/articles/*` |
| 13 | Onboarding quiz | răspunsuri elev | `quiz_responses` + flag local | `pages/OnboardingQuiz.tsx`, `lib/quizProfile.ts`, `lib/access.ts` |
| 14 | Activity log | evenimente app | `activity_log` | `lib/activity.ts` |
| 15 | Admin / Supervisor cockpit | date agregate | `student_insights`, `supervisor_notes` | `lib/studentInsights.functions.ts`, `lib/studentScoring.ts`, `pages/admin/*` |
| 16 | Reset parolă (OTP) | email | Supabase Auth OTP | `pages/ForgotPassword.tsx`, `pages/ResetPassword.tsx` |
| 17 | Rutare & gating | URL | `_app` / `admin` guards | `src/routes/*` |
| 18 | Infrastructură email | evenimente auth/app | coadă pgmq + pg_cron | `src/routes/lovable/email/queue/process.ts` |
| 19 | Onboarding wizard & anunțuri | prima vizită / update-uri | flag local + config static | `pages/OnboardingWizard.tsx`, `components/aa/NotificationBanner.tsx` |
| 20 | Recuperare răspunsuri (admin) | export local al elevului | `exercise_responses` | `lib/adminRecovery.functions.ts` |
| 21 | Căutare globală | Cmd/Ctrl+K | conținut în memorie | `components/aa/SearchModal.tsx` |

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

Tarife: `student | designer | arhitect` — gating de conținut.
Roluri: `student | admin`, în tabel separat, citite prin `has_role()` (SECURITY DEFINER).
`prevent_tariff_self_escalation` blochează modificarea propriului tarif/email de către non-admini.
`lock_admin_role` permite rolul `admin` doar pentru 3 UUID-uri hardcodate.

## 4. Conținutul (module + lecții) — 3 straturi

Cel mai important proces pentru fiabilitate. Lecțiile **dispăreau** înainte pentru elevi;
acum există trei straturi suprapuse, în ordine:

1. **Static** — `src/lib/data.ts`: structura completă (module, lecții, linkuri YouTube,
   durate, exerciții inline în timeline). Funcționează offline, instant, fără auth.
2. **Snapshot** — `src/lib/contentSnapshot.ts`: export JSON al conținutului publicat,
   aplicat peste static la **încărcarea modulului**, înainte de orice apel de rețea.
3. **DB overlay** — `LiveContentContext`: citește `modules` + `lessons` din Supabase
   și le suprapune peste `MODULES` (mutație in-place).

Reguli de overlay (`overlayContent`):
- Modulele se potrivesc după `order_index`.
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

`useProgress` scrie în `progress` (insert-only; „necompletat" = ștergere de rând; nu există UPDATE).
RLS: elevul vede/scrie doar rândurile proprii, adminul poate citi tot.
Procentele de completare exclud lecțiile fără video.

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

`exercise_completions` = tabel separat, insert/delete (fără update), independent de conținutul
răspunsului. Astfel „am completat" rămâne bifat chiar dacă elevul continuă să editeze textul.

## 9. Notițe

`useLessonNote`: autosave debounced în `lesson_notes` (`user_id`, `lesson_id`), trigger
`touch_updated_at`. Notițele sunt incluse în exporturile de materiale.

## 10. Documente printabile

`documentData.ts` conține definițiile (Doc 01…13): secțiuni, câmpuri, și un generator HTML
brandat (header negru, monogramă, accente aurii) transformat în PDF prin print.
Fluxul: `/documents` (listă) → `/documents/$docId/fill` (wizard) → previzualizare → print/PDF.
Două moduri: șablon gol printabil sau completat pe platformă și printat deja completat.
Paginarea e controlată manual (page-breaks explicite) pentru că secțiuni lungi
se tăiau la finalul paginii.

## 11. Materialele mele

`materialsExport.ts` agregă răspunsurile la exerciții + notițele și le randează cu **același**
template brandat ca documentele (nu text brut), cu etichete lizibile în loc de chei tehnice.
Export individual sau în bloc.

## 12. Bibliotecă

Conținut static suplimentar (articole text/video în afara programei), afișat ca bento grid
în `LibraryPage`; fiecare articol e o componentă React animată (`pages/library/articles/*`),
nu markdown. Restricție de brand: nicio mențiune de autori terți.

## 13. Onboarding quiz

Răspunsurile merg în `quiz_responses` (+ profil calculat de `quizProfile.ts`).
Un flag local `aa_quiz_done_<userId>` oglindește starea pentru gating instant
(`lib/access.ts → hasCompletedOnboarding`), ca elevul să nu fie blocat de o citire lentă.

## 14. Activity log

`lib/activity.ts` scrie evenimente tipizate (`login`, `lesson_complete`, `exercise_complete`,
`note_saved`, `quiz_complete`…) în `activity_log`. Identitatea (email/nume) e completată
server-side de triggerul `activity_log_set_identity` — clientul nu o poate falsifica.
Insert-only; elevul își vede doar propriile evenimente, adminul le vede pe toate.

## 15. Admin & Supervisor cockpit

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

- `src/routes/index.tsx` → redirect: `/dashboard` dacă e logat, altfel `/login`.
- `_app.tsx` — layout protejat: așteaptă `auth.loading` **și** `LiveContent.ready`,
  apoi randează `Layout` (sidebar + header). Fără user → `/login`.
- `admin.tsx` — gate suplimentar pe rol.
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
local `aa_wizard_done`; nu e un gate de rută, ci un tur ghidat. `NotificationBanner` +
`OnboardingGuideModal` afișează anunțuri/carduri de update definite static în cod
(fără tabel în DB), deci un anunț nou = un deploy.

## 20. Recuperarea răspunsurilor (admin)

`adminRecovery.functions.ts` permite adminului să importe în `exercise_responses` un export
din `localStorage`-ul elevului (cazuri în care sincronizarea cloud a eșuat pe dispozitivul lui).
Este server function protejată, cu verificare de rol admin.

## 21. Căutare globală

`SearchModal` (Cmd/Ctrl+K) caută în modulele, lecțiile, documentele și articolele deja
încărcate în memorie (nu face query în DB) — de aceea rezultatele respectă exact
straturile de conținut din §4.

## Notă importantă despre ID-urile exercițiilor

Tabelul DB `exercises` are UUID-uri generate, dar răspunsurile elevilor se salvează pe
**ID-urile din cod** (`e-0-1`, `ex-8-1-…`). Orice agregare (scoring, briefing, cozi de atenție)
trebuie să numere exercițiile din `src/lib/staticExercises.ts` (derivat din `data.ts`),
**nu** din tabelul `exercises`; altfel raportează 0 exerciții completate.

---

## Invariante de respectat la orice modificare

1. Conținutul publicat nu are voie să dispară: orice lecție nouă se scrie în **cod**
   (`data.ts` + `contentSnapshot.ts`) **și** în DB, nu doar în DB.
2. Nicio scriere de date de elev fără verificarea sesiunii curente.
3. Local-first: UI-ul salvează instant local, cloud-ul e best-effort cu reconciliere pe timestamp.
4. Rolurile stau doar în `user_roles`, verificate prin `has_role()`; niciodată pe `profiles`.
5. Orice tabel nou în `public`: `CREATE TABLE` → `GRANT` → `ENABLE RLS` → policies.
6. Fără culori hardcodate în componente — doar tokenii de design.
7. Documentele și exporturile folosesc același template brandat; niciun stil nou ad-hoc.
8. Exercițiile se numără din cod (`staticExercises.ts`), niciodată din tabelul `exercises`.
