# Instrucțiune de actualizare pentru Lovable

Acest document explică **ce s-a schimbat, de ce, și în ce ordine trebuie executat**.
Citește-l înainte de a atinge codul. Multe dintre schimbări repară lucruri care
*păreau* corecte, deci o „curățare" bine intenționată le poate strica la loc.

Actualizarea face un singur lucru mare: **platforma nu mai este un curs, ci o
platformă cu mai multe cursuri.** Tot restul decurge din asta.

---

## 0. Ordinea de execuție — nu o schimba

```
1. Aplică migrațiile SQL, în ordine cronologică (vezi §1)
2. Abia apoi rulează build-ul / deploy-ul
3. Verifică lista din §7
```

**De ce în ordinea asta:** codul are plase de siguranță care detectează schema veche
(codurile Postgres `42P01` tabel inexistent, `42703` coloană inexistentă, `PGRST200`
relație inexistentă) și cad înapoi pe comportamentul de dinainte. Deci aplicația
**nu crapă** dacă faci deploy fără migrații — dar fluxurile, grupele și tarifele per
program rămân moarte, iar tu ai crede că sunt implementate greșit. Nu sunt: le
lipsește schema.

---

## 1. Migrațiile SQL

Trei fișiere, în ordine. Primele două există deja în repo; a treia e nouă.

| # | Fișier | Ce face |
|---|---|---|
| 1 | `20260824074920_...sql` | `announcements`, `document_responses` (era deja în repo, posibil neaplicată) |
| 2 | `20260824130000_multicurs_fundatia.sql` | `courses`, `enrollments`; adaugă `course_id` pe `modules`, `whitelist`, `quiz_responses`, `student_insights` |
| 3 | `20260824160000_fluxuri_si_grupe.sql` | `flows`, `flow_events`, `groups`, `group_members`, `group_flow_assignments`; adaugă `flow_id`, `access_until`, `source_group_id` pe `enrollments` |

Sunt idempotente (`IF NOT EXISTS`, `DROP CONSTRAINT IF EXISTS`) și **nu șterg date**.
Migrația 2 face și o înscriere retroactivă: fiecare utilizator existent primește
automat o înscriere la `business` cu tariful lui de pe profil. Nimeni nu-și pierde
accesul.

### Trei capcane pe care le-am rezolvat deja în SQL — nu le reintroduce

1. **`prevent_enrollment_self_grant` ar fi blocat înregistrarea.** Trigger-ul
   împiedică un elev să-și acorde singur o înscriere. Dar la semnare, `handle_new_user`
   rulează cu `auth.uid()` **NULL** (nu există încă sesiune), deci trigger-ul refuza
   propria noastră inserare și înregistrarea eșua. Rezolvarea:
   `IF auth.uid() IS NULL OR has_role(...) THEN RETURN COALESCE(NEW, OLD)`.
   Dacă „simplifici" condiția asta, semnarea se rupe.

2. **`max_tariff` trebuie definită înainte de `apply_group_to_flow`.** Postgres nu
   rezolvă înainte funcții necunoscute în corpul altei funcții la momentul creării în
   același script. Ordinea din fișier e intenționată.

3. **`ON CONFLICT` se referă la coloana neprefixată** (`enrollments.tariff`, nu
   `public.enrollments.tariff`). Cu prefix, Postgres refuză.

---

## 2. Regula de aur: PREFIXUL DE ID

Aceasta este decizia din care iese toată eleganța restului. Citește-o de două ori.

Fiecare curs are un `idPrefix` în `src/lib/courses.ts`:

```ts
business → idPrefix: ''     // 'm-0', 'l-1-1', 'e-0-1'
start    → idPrefix: 'st-'  // 'st-m-0', 'st-l-1-1', 'st-e-0-1'
```

**De ce prefixul lui Business e gol:** id-urile lui sunt deja scrise în datele reale
ale elevilor — în `progress.lesson_id`, `exercise_responses.exercise_id`,
`lesson_notes.lesson_id`, `document_responses.document_id`. Toate patru sunt coloane
`text`. Dacă am fi prefixat Business cu `bus-`, ar fi trebuit o migrație de date peste
progresul tuturor elevilor, cu risc de pierdere. Lăsându-l gol, **cele patru tabele
n-au avut nevoie de nicio migrație.**

**Consecința pentru tine:** orice curs nou trebuie să aibă prefix ne-gol. Nu redenumi
id-urile existente. Nu „normaliza" prefixul lui Business.

Funcția `courseIdFromContentId()` potrivește prefixul **cel mai lung**, ca prefixul gol
al lui Business să rămână doar fallback și să nu „fure" id-urile celorlalte cursuri.

---

## 3. Cursurile — noua structură

### Fișiere noi
- `src/lib/courses.ts` — **singura sursă de adevăr** pentru „ce cursuri există".
  Conține și treptele de preț ale fiecărui program.
- `src/lib/content/business.ts`, `src/lib/content/start.ts`, `src/lib/content/index.ts`
  — conținutul, separat pe cursuri.
- `src/context/CourseContext.tsx` — cursul privit acum de elev.
- `src/lib/navigation.ts` — construiește căile `/c/<slug>/...`.

### Nu mai există `MODULES` global
Înainte, `src/lib/data.ts` exporta un `MODULES` global. **A fost eliminat intenționat.**
Cere conținutul prin `getCourseModules(courseId)`. Un export global ar fi făcut din nou
posibil ca o pagină să afișeze modulele altui curs fără să-și dea seama — exact bug-ul
pe care îl reparăm.

`allModulesFlat()` există **doar** pentru căutarea unui id, niciodată pentru afișare.

### Rutele elevului sunt acum sub `/c/<courseSlug>/`
`/dashboard` → `/c/business/dashboard`, `/c/start/dashboard`. Rutele vechi rămân și
redirecționează, ca linkurile trimise elevilor să nu moară.

Ecranul nou `/cursuri` e locul unde elevul alege programul. Vede **doar** produsele la
care are acces.

### ⚠ Regresie de care să te ferești
În `src/routes/_app.tsx`, **`CourseProvider` trebuie să fie DEASUPRA lui `Layout`**:

```tsx
<CourseProvider courseSlug={courseSlug}>
  <Layout />
</CourseProvider>
```

Dacă îl muți sub `Layout`, bara laterală a elevului se golește complet — `Layout`
citește contextul înainte să existe. S-a întâmplat o dată; nu era evident din cod.

### Aterizarea după login — `resolveLandingPath()`

Ordinea deciziei, în `src/lib/navigation.ts`:

```
fără cont                              → /login
admin                                  → /cursuri (vede tot, nu e elevul niciunui program)
un program, fără diagnostic            → /c/<slug>/quiz
un program, cu diagnostic              → /c/<slug>/dashboard
zero sau mai multe programe            → /cursuri
```

**Logica pasului 3, care e miezul:** un elev ajunge pe platformă doar pentru că adminul
l-a înscris, iar înscrierea spune deja **la ce program**. Deci în clipa în care își face
contul, platforma știe care diagnostic i se cuvine și îl duce direct acolo. Nu are ce
alege și n-are rost să treacă printr-un dashboard pe care oricum nu-l poate folosi
înainte de quiz.

Înainte ateriza pe dashboard, unde un banner îl anunța că are de dat un diagnostic, iar
fiecare click pe un modul îi deschidea un modal care îl trimitea tot la quiz — doi pași
în plus pentru o singură intenție.

**Adminul NU e trimis în quiz.** El nu e elevul programului, iar un diagnostic dat de el
ar polua datele mentorului.

### Accesul e binar, nu gradat

Ecranul `/cursuri` arată **doar** programele la care elevul are acces. Dacă n-are acces,
programul pur și simplu nu apare — nu apare stins, nu apare cu lacăt.

Înainte, un program fără lecții filmate era arătat estompat, cu lacăt și fără buton
(*„Structura e gata — lecțiile se filmează"*). Asta transforma o stare de **producție
internă** într-un refuz către elev, deși omul plătise și avea acces. Numărul de lecții
filmate e acum doar o cifră pe card, nu o poartă.

Adminul vede ambele programe, ca să poată verifica conținutul.

---

## 4. Tarifele: trepte per program, nu globale

**Ce era greșit:** tipul `Tariff` conținea trei valori fixe (`student`/`designer`/
`arhitect`), iar accesul la bibliotecă se verifica prin șirul literal `'arhitect'`.

**De ce e o problemă:** START vinde alte trepte — Singur 397€ / PRO 597€ / Ultra 997€ —
și acolo biblioteca e inclusă **din prima treaptă**. Verificarea `tariff === 'arhitect'`
ar fi refuzat biblioteca tuturor elevilor de la START.

**Cum e rezolvat:** `Tariff` e acum `string` (coloanele din DB sunt `text`, deci zero
migrație), iar gating-ul se face pe **capabilități**, nu pe nume:

```ts
tierGrants(courseId, tierId, 'library')   // nu: tariff === 'arhitect'
```

Fiecare treaptă declară ce deblochează (`library`, `mentor`, `oneOnOne`). Un program
nou nu mai cere niciun `if` prin aplicație.

**Nu reintroduce comparații cu numele treptei.** Sunt corecte exact pentru un singur
program și tăcut greșite pentru toate celelalte.

---

## 5. FLUX vs GRUPĂ — două concepte, deliberat separate

Aceasta e distincția pe care e cel mai ușor s-o strici printr-o „simplificare".

### FLUXUL = unitatea de **livrare**
Decide **ce vede elevul și când**: data de start, canalul de Telegram, calendarul de
întâlniri, anunțurile primite, fereastra de acces.
Un elev aparține **unui singur flux per training** — altfel n-am putea răspunde la
întrebarea „ce orar are omul ăsta".

### GRUPA = unitatea de **administrare**
O grupă e **doar o listă de oameni**. Nu are orar, nu are canal, nu dă acces prin ea
însăși. Accesul apare abia când **aloci grupa unui flux**.
Aceeași grupă poate fi alocată mai multor fluxuri, inclusiv din traininguri diferite.

**Nu contopi cele două.** Fluxurile sunt necesare pentru că sunt modalitatea prin care
se distinge informația la care are acces fiecare elev. Grupele sunt un instrument în
plus, care ușurează munca adminului. Una nu o înlocuiește pe cealaltă.

### Un flux NU e o copie a cursului
Conținutul rămâne unul singur. Ce diferă între fluxuri e **calendarul**, nu materialul.

Mecanica: modulul cu `unlockWeek = N` se deschide la `flow.starts_on + N × 7 zile`.

**De ce s-a schimbat asta:** înainte, modulele aveau `unlockDate` — o dată **absolută**.
Funcționa pentru Fluxul 1 și se prăbușea pentru oricine altcineva: un elev care intra
în ianuarie găsea tot practicumul deschis din prima zi, pentru că toate datele
absolute erau deja în trecut. Deblocarea relativă la data de start a fluxului rezolvă
asta fără să dubleze nimic.

---

## 6. Panoul de admin: programul e un FILTRU, nu un MOD

**Ce era greșit:** bara laterală avea un comutator Business/Start. Adminul „intra în"
un program, iar paginile arătau doar jumătate din realitate. Efecte concrete:

- Lista de acces era interogată cu `.eq('course_id', courseId)` — vedeai doar jumătate.
- Chipurile de filtrare erau literalmente `['all','student','designer','arhitect']`,
  desenate și peste elevii de la START. Apăsai „Student" pe o listă plină de oameni cu
  treapta „Singur" și primeai *„Niciun utilizator corespunde filtrului"*.
- Un om înscris la ambele programe avea două adevăruri diferite, după poziția
  comutatorului — și niciunul complet.

**Cum e rezolvat:** adminul vede tot; decupajul se face în pagină, pe trei axe —
**program · flux · treaptă** — printr-o bară comună, `AdminScopeBar`, sincronizată în
query string (`?curs=&flux=&tarif=`), deci partajabilă prin link.

### Detalii de implementare care contează

- `fetchAdminUsers()` nu mai primește `courseId`. Întoarce **toate înscrierile** unui
  om. Filtrarea se face pe client, cu `matchesScope()`.
- `matchesScope()` aplică fluxul și treapta pe **aceeași înscriere**. Altfel, un om
  înscris la `Business/Flux 1` și `START/Ultra` ar trece de filtrul „Flux 1 + Ultra",
  pentru că are, pe undeva, și un Flux 1, și un Ultra. Adminii au nevoie de răspunsul
  corect, nu de unul generos.
- Filtrul de treaptă are valoarea **`"program:treaptă"`**, nu doar numele treptei. Azi
  id-urile nu se ciocnesc, dar e noroc, nu garanție: primul program care refolosește un
  id ar amesteca tăcut elevii a două metodologii.
- Paginile care **nu pot** agrega două programe — matricea de progres (are o coloană per
  modul) și editorul de lecții (scrie în module) — cer un program explicit
  (`requireCourse`). Nu e o inconsecvență: un procent mediu între două metodologii ar fi
  un număr fără sens.
- Alocarea unei grupe la un flux cere **treapta programului acelui flux**. Înainte cădea
  tăcut pe `'student'` — corect la Business, inexistent la START, iar omul rezultat nu
  mai trecea de niciun filtru.

---

## 7. Progresul se numără din COD, niciodată din tabelul `modules`

Un bug subtil care făcea ca matricea de progres să arate **0% peste tot**.

Paginile de admin citeau modulele din tabelul `modules`, ale cărui rânduri au id-uri
**UUID**, și le comparau cu `progress.lesson_id`, care conține id-urile **din cod**
(`'l-1-1'`, `'st-e-2-1'`). Nu se potriveau niciodată.

Un al doilea bug din aceeași familie: procentul general număra rândurile de progres ale
elevului din **toate** cursurile și le împărțea la lecțiile **unui singur** curs — putea
trece de 100%.

`src/lib/adminProgress.ts` există exact pentru asta. **Regula: se numără din cod.**

Legat: numai lecțiile *trackabile* intră la numitor — cele cu video, plus exercițiile.
Lecțiile-substituent goale nu. Înainte, dashboard-ul avea două numitoare diferite pe
același ecran („3/24 lecții" lângă „6% progres").

---

## 8. Puntea dintre cod și bază: `contentSync.ts`

Conținutul trăiește în trei straturi: **cod** → `contentSnapshot.ts` → **overlay din DB**.

Modulele și lecțiile unui program nou (START) există în cod, dar n-au rânduri în
`modules`/`lessons`, deci editorul din admin n-are ce să arate.
`planCourseStructure()` / `publishCourseStructure()` fac puntea: potrivesc modulele după
`order_index` și lecțiile după titlu normalizat.

**`publishCourseStructure` adaugă doar ce lipsește. Nu șterge niciodată nimic.** Dacă o
rescrii ca sincronizare bidirecțională, editările făcute din admin se pierd.

---

## 9. Ce să NU „repari"

| Arată ca o problemă | Este intenționat, pentru că |
|---|---|
| `idPrefix: ''` la Business | Evită migrația datelor de progres ale tuturor elevilor (§2) |
| `Tariff = string` în loc de union | Coloanele DB sunt `text`; un union ar exclude treptele oricărui program nou (§4) |
| Fallback-urile pe `42P01`/`42703`/`PGRST200` | Țin platforma vie înainte de migrații. Dispar de la sine după (§0) |
| Flux **și** grupă, ca lucruri diferite | Nu sunt redundante: una e livrare, cealaltă administrare (§5) |
| Rute duplicate `/dashboard` și `/c/:slug/dashboard` | Cele vechi redirecționează, ca linkurile trimise elevilor să nu moară |
| `requireCourse` doar pe unele pagini de admin | Doar cele care chiar nu pot agrega două programe (§6) |
| ~54 fișiere cu `// @ts-nocheck` | Moștenite din exportul inițial. Se pot curăța, dar nu în același pas cu asta |
| `.env` este urmărit de git | Conține doar cheia **publicabilă** Supabase (`role: anon`), care ajunge oricum în bundle-ul client. Niciun `service_role`. Secretele reale se pun în `.env.local` |

---

## 10. Verificare după deploy

1. Un elev nou, abia înscris de admin → după crearea contului aterizează **direct în
   quizul programului său**, nu pe dashboard. După quiz, intră în practicum.
2. Ecranul `/cursuri` are în antet **numele elevului**, nu „Alege programul". Niciun
   card nu are lacăt sau text despre filmare.
3. Un elev fără flux → modulele **nu** se deschid toate. Dacă se deschid, migrația
   fluxurilor nu s-a aplicat.
4. Admin → *Utilizatori* → filtrul **Program: Start** + **Treaptă: Singur** returnează
   oameni, nu listă goală. Ăsta era simptomul principal.
5. Admin → *Progres* → matricea are procente, nu 0% peste tot.
6. Admin → *Grupe* → alocarea unei grupe la un flux START oferă treptele
   Singur/PRO/Ultra, nu Student/Designer/Arhitect.
7. O lecție video pe desktop (≥1024px) → cuprinsul modulului stă **în dreapta**, nu sub
   butoanele de navigare.

---

## 11. Rămase de făcut (nu blochează deploy-ul)

- `SUPPORT_EMAIL` din `src/lib/courses.ts` e provizoriu
  (`contact@arhitecturaafacerii.ro`) și apare live ca `mailto:` pe login și înregistrare.
- `MOCK_WHITELIST_ENTRIES` din `src/lib/data.ts` e cod mort cu emailuri reale. Nefolosit
  de aplicație; merită șters.
- Versionarea conținutului pe fluxuri (materiale diferite pentru Fluxul 1 vs 2) e
  amânată deliberat. Astăzi conținutul e comun; doar calendarul diferă.
