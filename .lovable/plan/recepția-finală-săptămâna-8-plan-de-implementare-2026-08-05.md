# Recepția Finală (Săptămâna 8) — plan de implementare

## Ce spun materialele

Cele trei scripturi conțin exact 2 livrabile grele + o închidere:

- **Lecția 21 — De la a construi la a conduce**: test de flux (lead → încasare), lista celor 6 semne ale recepției reușite, plan de întărire pentru semnele nebifate, descrierea noului rol de proprietar.
- **Lecția 22 — Ritmul de conducere**: ședința săptămânală cu agendă fixă în 4 pași, analiza lunară cu 4 întrebări, blocurile din calendarul de proprietar, regula de disciplină + semnalele de alunecare.
- **Lecția 23 — Scalarea și închiderea**: fără unelte noi. Doar: ce crești primul (citit din tablou), cele 3 feluri de creștere, privirea înapoi peste cele 6 etape, încurajare + ușă deschisă.

## Ce există deja

Modulul 6 are 3 lecții video corecte și 4 exerciții vechi (`e-6-1` … `e-6-4`) care nu urmează scripturile: „Fișa Noului Tău Rol", „Calendarul Săptămânii", „Calendarul Trimestrial", „Vacanța-Test". Nu există niciun document printabil pentru Săptămâna 8 (ultimul e Doc 11 · Registrul de greșeli).

## Ce construim

### 1. Exerciții rescrise, legate de lecții (`src/lib/exerciseData.ts` + `src/lib/data.ts`)

**Lecția 21 → `ex-8-1 · Recepția finală a firmei tale`** (înlocuiește e-6-1)
- pas 1: alegi un flux și notezi în ce puncte se oprește în tine (dynamic-table: pas / cine face / se blochează în mine? da-nu)
- pas 2: checklist cu cele 6 semne ale recepției reușite
- pas 3: pentru fiecare semn nebifat — la ce etapă te întorci (câmp condiționat, alegere din cele 6 etape)
- pas 4: „noul meu rol" — text scurt, cu 5 zone de responsabilitate

**Lecția 22 → `ex-8-2 · Ritmul meu de conducere`** (înlocuiește e-6-2/e-6-3)
- ședința săptămânală: zi, oră, participanți + agenda fixă în 4 pași afișată ca reper
- analiza lunară: ziua din lună + răspuns la cele 4 întrebări
- blocuri de calendar: privirea zilnică la tablou, unu-la-unu, 2 ore de gândire
- regula de disciplină (o frază) + checklist cu semnalele de alunecare

**Lecția 23 → `ex-8-3 · Unde ai ajuns și ce crești primul`** (înlocuiește e-6-4)
- ce crești primul, citit din tablou (alegere + motiv)
- ce fel de creștere alegi: mai mult din același / servicii noi / locație nouă — cu ce cere fiecare de la sistem
- retrospectiva celor 6 etape: pentru fiecare, un rând cu ce ai construit efectiv
- închidere: „cine am devenit în 8 săptămâni" — text liber

### 2. Două documente printabile noi (`src/lib/documentData.ts`)

- **Doc 12 · Fișa de recepție finală** — flux verificat, cele 6 semne bifate, plan de întărire, noul rol. Paginat pe 2 pagini.
- **Doc 13 · Ritmul de conducere** — agenda fixă a ședinței, cele 4 întrebări lunare, calendarul de proprietar, regula de disciplină. Format „de pus pe perete", 2 pagini.

Ambele urmează exact structura existentă (antet negru cu monogramă, accente aurii, câmpuri completabile pe platformă + export PDF), deci nu apar tipare noi de design.

### 3. Legături și consistență

- exercițiile apar în timeline-ul modulului sub lecția lor (ca la Modulul 3/5), nu ca listă separată
- documentele noi apar în „Documente" și linkate din exercițiile 8-1 și 8-2
- răspunsurile intră automat în „Materialele mele" (export PDF branded) prin `materialsExport.ts`
- Modulul 6 primește un card de final de practicum după ultimul exercițiu (mesaj de felicitare + trimitere la Bibliotecă și Materiale), în stilul cardului „Livrabilul etapei"

## Detalii tehnice

- tipuri de câmpuri refolosite: `checklist`, `checkboxes`, `dynamic-table`, `form-fields`, `radio` — toate există deja în `ExerciseBlock.tsx`, nu e nevoie de tipuri noi
- migrare: exercițiile vechi `e-6-1…e-6-4` se înlocuiesc cu ID-uri noi; răspunsurile vechi rămân în `exercise_responses` fără să strice nimic (citirea e pe `exercise_id`)
- `src/lib/data.ts` + `src/lib/contentSnapshot.ts` se actualizează împreună, ca lecțiile/exercițiile să fie disponibile și offline
- fără schimbări de schemă în bază

## Ordinea livrării

1. exercițiile 8-1, 8-2, 8-3 + integrarea în timeline
2. Doc 12 și Doc 13 cu export PDF verificat pe pagini
3. cardul de final de practicum
