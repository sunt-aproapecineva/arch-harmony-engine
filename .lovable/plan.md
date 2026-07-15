# Exerciții Săptămâna 6 — Contoarele, KPI Viu, Tabloul de bord

Reutilizez 100% sistemul UI/UX existent (tipuri de exerciții, tokens de culoare, `documentData.ts` shell, `materialsExport.ts`). Zero componente vizuale noi — doar compun ce am deja.

## Contextul lecțiilor (din DOCX-urile trimise)

- **L15 · Contoarele** — cele 6 elemente ale unui KPI (nume, legătură cu produsul funcției, unitate, țintă, frecvență, responsabil) + testul final „dacă KPI-ul e atins perfect, firma poate să nu câștige nimic?" + 4 criterii de verificare.
- **L16 · KPI Viu** — reia cele 6 elemente + Poarta de calitate + 3 praguri (roșu/galben/verde față de țintă) + Legătura cu salariul (fix + variabil pe prag, cu proporții pe rol) + checklist final 6 puncte.
- **L17 · Tabloul de bord** — un singur indicator de rezultat pe cele 7 funcții, cu țintă / realizat / tendință / stare pe culori + regula desfacerii + sistem de raportare.

## Ce am deja și reutilizez

- **Tipuri exerciții:** `form-fields`, `checklist`, `quiz-mcq`, `dynamic-table` (folosite deja la Manifest, Fișa de Post, Matricea decizională, Instrucțiune).
- **Sablon Doc:** `documentData.ts` cu `htmlShell`, `aaHeader`, `aaFooter`, tipografie Aboreto+Arimo, monogramă, accent auriu (Doc 04-06 sunt exemplele vii).
- **Culori praguri:** deja am `success`/`warning`/`danger` în `Badge.tsx` cu variante identice cu roșu/galben/verde din Word.
- **Autosave + hidratare cloud:** deja funcționează pe toate `form-fields` prin `exerciseSync`.
- **Export PDF branded:** `materialsExport.ts` mapează automat răspunsurile.

## Cele 3 exerciții (câte unul per lecție, atașate ca `l-4-4`, `l-4-5`, `l-4-6`)

### Exercițiul 6.1 · „Construiește primul tău KPI" (lecția 15)

- **Tip:** `form-fields` — un singur exercițiu, 9 câmpuri.
- **Structura (identică cu Word):**
  1. Header `input`: Rol · Funcție · Produsul rolului (3 câmpuri).
  2. Cele 6 elemente — fiecare = un `textarea` cu `label` = numele elementului, `helper` = descrierea (ℹ) din Word, `placeholder` = întrebarea de control (?).
  3. Testul final = `checklist` cu 1 opțiune „Da, imposibil să-l atingă fără ca firma să câștige" (elevul o bifează când e sigur).
  4. Verificare finală = `checklist` cu cele 4 criterii din Word.
- **Zero componente noi.** Layout-ul îl dă `form-fields` deja stilizat.
- **Buton „+ Adaugă încă un KPI"** = reutilizez pattern-ul dinamic din `decision-matrix` (deja există) — elevul poate defini 2-3 KPI succesive.

### Exercițiul 6.2 · „KPI Viu — de la cifră la sistem" (lecția 16)

- **Tip:** combinație de secțiuni `form-fields` + `dynamic-table` + `checklist` — exact structura din Word (Partea 1-4).
- **Partea 1 · Cele 6 elemente** = `form-fields` (identic cu 6.1, redus la label-uri scurte pentru că elevul le știe deja).
- **Partea 2 · Poarta de calitate** = un singur `textarea` cu 3 exemple în placeholder.
- **Partea 3 · Cele 3 praguri** = `dynamic-table` fix 3 rânduri × 2 coloane (Rând-uri pre-populate: ROȘU / GALBEN / VERDE ca text, coloane: „La ce nivel de cifră" + „Ce se întâmplă"). Culorile rândurilor = badge-urile `danger`/`warning`/`success` deja existente.
- **Partea 4 · Legătura cu salariul** = `form-fields` cu 2 inputuri (fix / variabil) + `dynamic-table` 3 rânduri × 2 coloane (Prag / Ce primește) cu regula pre-scrisă în label.
- **Verificare finală** = `checklist` cu cele 6 criterii din Word.
- **Zero componente noi**, zero simulatoare — respect cererea de a rămâne în sistemul existent.

### Exercițiul 6.3 · „Tabloul de bord al firmei tale" (lecția 17)

- **Tip:** `dynamic-table` fix 7 rânduri × 5 coloane (Funcție / Indicator / Țintă / Realizat / Responsabil).
- **Rânduri pre-populate imutabil** cu numele celor 7 funcții (elevul completează doar restul) — reutilizez logica din `decision-matrix` unde primul rând e read-only.
- **Coloana Stare** = calculată în render (dacă Realizat < Țintă → badge `danger`, egal → `warning`, peste → `success`) folosind exact `Badge.tsx` existent. E o coloană afișată, nu editabilă — nici o componentă nouă, doar un helper mic în `ExerciseBlock.tsx` care randează badge-ul potrivit în coloana finală când tipul e `dynamic-table` cu flag-ul `computed-status: true`.
- **Bloc informativ deasupra** cu exemplul din Word = `info` field (tip existent).
- **Regula desfacerii** = `quiz-mcq` cu 1 întrebare aplicată: „Vânzările sunt roșu. Ce faci întâi?" — 3 opțiuni + feedback din lecție.
- **Sistem raportare** = 3 `input`-uri (cine / când / 3 întrebări) sub tabel.

## Documentele printabile (Doc 07, 08, 09)

Le fac în același val, cu shell-ul existent din `documentData.ts` (așa cum sunt Doc 04-06):

- **Doc 07 · Fișă KPI** — sablon printabil identic cu Word L15, wizard de completare pe platformă cu autosave, print cu răspunsurile pre-completate. Reutilizează exact `htmlShell`, `aaHeader`, `aaFooter`.
- **Doc 08 · Fișă KPI Viu** — sablon printabil identic cu Word L16 (4 părți).
- **Doc 09 · Tabloul de bord** — sablon printabil cu exemplul + tabelul gol + legenda culorilor + sistemul de raportare.

Toate 3 cu buton pe DocumentsPage (cardul e identic cu Doc 05/06).

## Fișiere modificate

- `src/lib/exerciseData.ts` — 3 template-uri noi (ID: `ex-6-1-kpi-fisa`, `ex-6-2-kpi-viu`, `ex-6-3-tablou-bord`).
- `src/lib/data.ts` — cablaj exercițiu ↔ lecție pe `l-4-4`, `l-4-5`, `l-4-6`.
- `src/components/exercises/ExerciseBlock.tsx` — 1 modificare mică: în `dynamic-table` adaug suportul pentru flag-ul `computedStatus` (randează Badge-ul din `Badge.tsx`). Nici un tip nou.
- `src/lib/documentData.ts` — 3 documente noi (Doc 07/08/09) folosind shell-ul existent.
- `src/pages/DocumentsPage.tsx` — 3 carduri noi (identice ca stil cu 05/06).

## Ordinea execuției

1. Template-urile celor 3 exerciții în `exerciseData.ts`.
2. Cablarea în `data.ts`.
3. Micul flag `computedStatus` în `ExerciseBlock.tsx` pentru coloana Stare din 6.3.
4. Cele 3 documente în `documentData.ts` + carduri în `DocumentsPage.tsx`.
5. Verificare vizuală (Playwright screenshot) pe una din lecții ca să confirm că nimic nu iese din sistem.
