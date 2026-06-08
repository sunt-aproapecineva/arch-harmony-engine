
# Plan implementare — Exerciții Săptămâna 4

## 1. Ce am verificat din ce există deja (și funcționează bine)

**Pattern-uri solide pe care le voi refolosi 1:1, fără să le ating:**

- **Tipuri de exerciții** definite în `src/lib/exerciseData.ts` (`ExerciseTemplate.type`):
  - `form-fields` — câmpuri text/textarea/input/info (folosit la e-1-1, e-1-2, e-3-2, e-3-3, e-4-1)
  - `dynamic-table` — tabel cu rânduri pe care utilizatorul le adaugă (e-3-4, e-4-3)
  - `checklist` — bife (e-3-1, e-3-5, e-4-4)
  - `decision-matrix` — special pentru roluri (e-2-5 Matricea decizională)
- **Persistență**: `pushExerciseResponse`/`loadExerciseResponse` în `src/lib/exerciseSync.ts` — debounced upsert pe `exercise_responses`, deja folosit de toate variantele.
- **Marcare „finalizat"**: `useExerciseCompletions` — merge pentru toate tipurile.
- **Rendering**: `ExerciseBlock.tsx` dispatch-uiește pe `type` — adăugarea unui exercițiu nou e doar o intrare în array, fără cod nou pe UI dacă reutilizez tipuri existente.
- **Documente cu wizard**: `documentData.ts` are deja `DocWizardStep[]` + `generate(answers)` cu HTML brand-uit AA (header, footer, secțiuni colorate). Pattern-ul Acord Parteneriat (Doc1/2/3) e exact ce-mi trebuie pentru SOP.
- **Bibliotecă**: `libraryData.ts` + articole React în `src/pages/library/articles/` (vezi `HiringArticle.tsx` ca model).

## 2. Maparea Săptămâna 4 → module (fără ștergeri)

Din `Exercitii_Saptamana_4_FINAL.md`:

| # | Exercițiu nou | Lecția | Module destinație |
|---|---|---|---|
| 1 | Profilul primei angajări | L8 — Cum angajezi corect | **mod-2** (Pereții Portanți) → `e-2-6` |
| 2 | Primul tău SOP documentat | L9 — Ce este un proces | **mod-3** (Instalațiile) → `e-3-6` |
| 3 | Harta completă a proceselor | L10 — Harta proceselor | **mod-3** → `e-3-7` |
| 4 | Primul flux vizual în Miro | L11 — Ce este un flux | **mod-3** → `e-3-8` |

**Nimic existent nu se șterge.** `e-2-1..e-2-5` și `e-3-1..e-3-5` rămân pe loc, exact cum sunt acum.

## 3. Ce adaug, concret

### A. `src/lib/exerciseData.ts` — 4 template-uri noi

1. **`e-2-6` — Profilul primei angajări** → tip `form-fields`
   - Pasul 1: funcția prioritară (input + 2 textarea-uri „de ce" / „până când")
   - Pasul 2: 6 textarea-uri (produs final, criteriu evaluare, context, salariu, calități, KPI)
   - Pasul 3: 4 textarea-uri (cele 4 componente anunț)
   - Pasul 4: checklist de pregătire integrare (refolosesc `info` + textarea pentru cele 5 sarcini)
   - Buton CTA la final: link spre Matricea decizională (`e-2-5`) ca „bonus"

2. **`e-3-6` — Primul SOP documentat** → tip `form-fields`
   - Pasul 1: 3 textarea-uri de filtrare + concluzia + radio Liniar/Decizional (folosesc 2 input-uri marcate)
   - Pasul 2: câmpuri pentru cele 5 componente SOP (titlu, scop, roluri, pași, criteriu)
   - Pasul 3: 2 textarea-uri reacție echipă
   - CTA: „Deschide template-ul SOP" → `/documents/sop-producere/fill` (vezi B.)

3. **`e-3-7` — Harta proceselor** → tip `dynamic-table`
   - Coloane: `Funcția | Proces | Tip SOP (Liniar/Decizional) | Prioritate (Critică/Înaltă/Medie)`
   - Pre-completat cu 7 rânduri-șablon (cele 7 funcții) — utilizatorul completează procese, poate adăuga mai multe
   - CTA: link spre template Google Sheets (dacă există URL) + spre `e-3-6` pentru a doc

4. **`e-3-8` — Flux vizual în Miro** → tip `form-fields`
   - Pasul 1 pregătire: 4 input-uri (proces, tip flux, roluri/coloane, punct decizie)
   - Pasul 2: 6 itemi checklist „am construit fluxul în Miro" (refolosesc tip `checklist`? — NU, păstrez `form-fields` cu un câmp dedicat de URL Miro)
   - Câmp final: URL board Miro + textarea „ce am descoperit construindu-l"
   - CTA: link spre articolul „Ghid Miro Fluxuri" din Bibliotecă

### B. `src/lib/documentData.ts` — 1 document nou

**`sop-producere`** — Template SOP (model: Doc1 Parteneriat)
- 5 pași de wizard corespunzând celor 5 componente: Titlu/Versiune, Scop, Roluri, Pași (10 câmpuri numerotate), Criteriu calitate
- `generate(answers)` produce HTML A4 brand-uit (header AA + footer + secțiuni verzi — culoarea `green` ca în Doc1)
- `docNumber: 'AA-DOC-04 · SOP'`, `lessonIds: ['l-3-2', 'l-3-4']`

### C. `src/lib/libraryData.ts` — 1 articol nou

**`ghid-miro-fluxuri`** (înlocuiește placeholder-ul `__soon-2`)
- `type: 'article'`, `accent: 'green'`, `span: 'wide'`, `available: true`
- Conținut React în `src/pages/library/articles/MiroFluxuriArticle.tsx` — pași cu screenshot-uri pentru construirea unui flux pe coloane per rol, bazat pe `Ghid_Miro_Fluxuri_FINAL.md`
- Wire în `src/pages/LibraryArticlePage.tsx` (după modelul `HiringArticle`)

### D. `src/lib/data.ts` — `mod-2.exercises` și `mod-3.exercises`

Adaug intrările `{ id, module_id, title, description, order_index }` pentru `e-2-6`, `e-3-6`, `e-3-7`, `e-3-8`. Restul module-ului rămâne identic.

## 4. Ordine recomandată de implementare (commit-uri mici)

1. Adaug `e-2-6` în `exerciseData.ts` + `data.ts` (form-fields, 0 cod nou)
2. Adaug `e-3-6`, `e-3-7`, `e-3-8` în `exerciseData.ts` + `data.ts`
3. Adaug documentul `sop-producere` în `documentData.ts` (riguros pe template Doc1)
4. Adaug articolul Miro: `MiroFluxuriArticle.tsx` + intrare în `libraryData.ts` + branch în `LibraryArticlePage.tsx`
5. Adaug CTA-urile cross-link (din `e-3-6` spre wizardul SOP, din `e-3-8` spre articolul Miro) — modificare minimă în `ExerciseBlock` pentru a renderiza un câmp `info` cu link, sau adaug câmp `info` cu HTML.

## 5. Ce NU fac (explicit)

- Nu șterg `e-3-1..e-3-5` și niciun template existent.
- Nu modific `client.ts`, `types.ts`, migrațiile, sau structura BD — exercițiile noi se salvează automat pe `exercise_responses` cu `exercise_id` nou, fără migrație.
- Nu schimb numărul de lecții al mod-3 (rămâne 4) — exercițiile pot exista chiar dacă lecția dedicată e separată; user-ul le vede pe pagina modulului.
- Nu ating Documente vechi (Doc1/2/3 Parteneriat) și nici `cum-angajam-corect` din Bibliotecă.

## Detalii tehnice

- Toate exercițiile noi folosesc tipuri deja procesate de `ExerciseBlock` → 0 cod nou pe componente, doar date.
- Pentru CTA-urile spre `/documents/.../fill` și `/library/ghid-miro-fluxuri`: rutele există deja (`_app.documents.$docId.fill.tsx` și `_app.library.$slug.tsx`). Folosesc `<Link to="...">` din `@tanstack/react-router`.
- Pentru articolul nou: pattern identic cu `HiringArticle.tsx`; lazy în `LibraryArticlePage` printr-un `switch(slug)`.
- Brand-ul SOP: refolosesc `BASE_STYLES` și `htmlShell` din `documentData.ts` — culoare `green` (`--green: #1A5C38`), ca diferențiere vizuală față de Parteneriat (`red`).

Confirmi planul și încep implementarea în ordinea de mai sus?
