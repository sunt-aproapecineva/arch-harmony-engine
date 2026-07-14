# Plan îmbunătățiri UX platformă

Analiză pe fiecare cerere: **ce vrea elevul**, **ce avem deja**, **complexitate**, **cum executăm**. Le-am grupat pe priorități ca să livrăm în valuri, nu tot deodată (fiecare val = ~1 sesiune de lucru).

---

## VAL 1 — Quick wins (impact mare, efort mic)

### 1.1 Numerotare lecții „6.1 / 6.2" ⭐
- **Ce vrea:** claritate — „Lecția 1 din Etapa 6".
- **Avem:** `MODULES[].order_index` + `lessons[].order_index` (excluzând exerciții).
- **Complexitate:** XS.
- **Execuție:** un singur helper `formatLessonNumber(module, lesson)` → afișat în `ModuleCard`, `LessonPage` header, timeline, sidebar breadcrumb, Dashboard. Fără migrație DB — pur UI.

### 1.2 Autosave „draft" universal pe toate câmpurile text ⭐
- **Ce vrea:** „scriu ceva, vin alte idei, nicăieri nu se salvează" — teamă că pierde ce a scris.
- **Avem:** exerciții deja salvează local+cloud (ok). Dar **notițele lecției** (`lesson_notes`) și **răspunsurile quiz** nu au feedback vizual de „salvat".
- **Complexitate:** S.
- **Execuție:**
  - Indicator vizibil „Se salvează… / Salvat acum 3s" pe fiecare card de notiță și exercițiu (reuse pattern din `exerciseSync`).
  - Debounce 800ms → localStorage instant + cloud sync cu status.
  - Warning „Ai modificări nesalvate" la close tab dacă e ceva pending.

### 1.3 Retry quiz cu istoric note
- **Ce vrea:** dacă a luat 4/5 să poată reface pentru scor mai bun.
- **Avem:** `quiz_responses` — o singură rândă per user (upsert).
- **Complexitate:** S-M.
- **Execuție:**
  - Adăugăm `quiz_attempts` (user_id, quiz_id, score, answers jsonb, created_at) — istoric complet.
  - Buton „Refă quiz-ul" pe pagina de rezultate.
  - Afișăm cel mai bun scor + timeline încercări („Ai făcut de 3 ori: 3/5 → 4/5 → 5/5").
  - **Excepție onboarding quiz** (profilul de maturitate) — acela rămâne one-shot ca să nu strice `studentInsights`; sau permitem re-editare dar re-generăm briefing-ul admin. Decide-tu.

---

## VAL 2 — Materialele mele (hub central) ⭐⭐

### 2.1 Pagină nouă `/materialele-mele`
- **Ce vor:** „toate într-un loc" — download exerciții completate, notițe, documente generate, PDF-uri lecție.
- **Complexitate:** M.
- **Execuție:**
  - Rută nouă `_app.materials.index.tsx` — link în Sidebar sub „Biblioteca".
  - 4 taburi:
    1. **Exerciții completate** — listă cu buton „Descarcă PDF" per exercițiu, filtrat pe săptămână/modul.
    2. **Notițe** — toate `lesson_notes` grupate pe lecție, buton „Descarcă toate ca PDF" + „.md".
    3. **Documente** — templatele deja completate în DocumentsPage (deja există, doar link).
    4. **Resurse curs** — PDF-uri / rezumate lecție (vezi 3.1).
  - Buton mare „📦 Descarcă TOT (ZIP)" — generează un ZIP cu toate PDF-urile.

### 2.2 Export PDF per exercițiu completat
- **Ce vor:** print / arhivare.
- **Avem:** deja avem generatoare HTML→print pentru documente (Manifest, SOP, Fișă Post).
- **Complexitate:** M.
- **Execuție:**
  - Extindem pattern-ul existent din `DocumentsPage`: un template HTML per tip exercițiu (quiz-mcq, function-roles, decision-matrix etc.) cu răspunsurile elevului injectate.
  - Buton „Printează" (window.print cu CSS `@media print`) — fără librărie nouă, gratis.
  - Alternativ: `jspdf` + `html2canvas` pentru download direct (dar print e mai fiabil).

### 2.3 Export ZIP total
- **Complexitate:** M.
- **Execuție:** `jszip` (30kb) — client-side, adună HTML-urile generate + notițele markdown → download ca `arhitectura-afacerii-{nume}-{data}.zip`. Fără backend.

---

## VAL 3 — Rezumate & resurse per lecție

### 3.1 Rezumat text + slide-uri per lecție
- **Ce vor:** ceva de citit/revizuit fără să reia videoul.
- **Complexitate:** M-L (depinde cine scrie conținutul).
- **Execuție tehnică:**
  - Adăugăm `lessons.summary_md` (text markdown) + `lessons.slides_url` (PDF/link) în DB.
  - Afișăm pe `LessonPage` un tab „📝 Rezumat" + „🎞️ Slide-uri".
  - Admin poate edita din `AdminLessons`.
- **Execuție conținut:** două opțiuni:
  - (a) Tu scrii manual rezumatele — control total, timp mare.
  - (b) Generăm draft cu AI (transcript YouTube → Gemini Flash) → tu verifici și publici. Rapid, dar necesită revizie.
  - Recomand (b) pentru bootstrap, apoi editezi.

### 3.2 Notițe descărcabile
- **Complexitate:** XS (parte din 2.1 tab 2).

---

## VAL 4 — Nice-to-have (după feedback val 1-3)

- **Ordonare exerciții după completare** — badge „✓ Completat 12 iun" în timeline.
- **Resume video** (deja pe roadmap) — `progress` cu `last_position_sec`.
- **Notificări „materiale noi"** — când adaugi rezumat/slide la o lecție veche, elevul vede badge.

---

## Complexitate totală & ordine sugerată

| Val | Ce livrează | Efort | Impact vizibil |
|-----|-------------|-------|----------------|
| 1   | Numerotare + autosave feedback + retry quiz | ~1 sesiune | Mare — rezolvă frustrări zilnice |
| 2   | Hub „Materialele mele" + export PDF/ZIP | ~1-2 sesiuni | Foarte mare — feature nou vizibil |
| 3   | Rezumate + slide-uri per lecție | ~1 sesiune tehnic + timp conținut | Mare — depinde de conținut |
| 4   | Polish | ad-hoc | Mediu |

## Decizii de luat înainte să încep

1. **Onboarding quiz** — permitem retry (cu re-generare briefing) sau blocăm?
2. **Rezumate lecție** — vrei să generez draft-uri cu AI din transcript YouTube, sau le scrii tu?
3. **Format export exerciții** — print-friendly HTML (rapid) sau PDF descărcabil (necesită `jspdf`)?
4. **Începem cu Val 1 (quick wins) sau sari direct la Val 2 (hub materiale)** — care e mai urgent pentru elevi?
