
# Update Admin: „Supervisor Cockpit"

Scopul e ca tu (supervizorul) să intri în platformă și în 30 de secunde să știi despre fiecare elev: unde e blocat, ce a completat real, ce a înțeles, ce nu, și ce intervenție concretă să faci. Toată informația pe care elevii o introduc (quiz, exerciții, notițe) e deja stocată — o vom transforma în claritate.

## 1. Profil elev: trei tab-uri clare

Pagina `admin/student/$userId` se reorganizează din listă lungă în trei tab-uri:

**a) „Briefing supervizor"** (tab default, nou)
- Card de sus: nume, tarif, scor global, status („activ săptămâna asta" / „inactiv 5 zile" / „blocat la Modulul X").
- **Rezumat AI generat** (3-5 paragrafe), structurat fix:
  1. *Cine e elevul* — domeniu, vechime, cifră de afaceri, echipă (sintetizate din quiz).
  2. *Nivelul de maturitate* — startup / manual / illusion / systemic, cu o frază de context.
  3. *Ce a făcut concret* — câte lecții, câte exerciții completate vs lăsate goale, calitatea răspunsurilor (scurte / superficiale / detaliate).
  4. *Unde e blocat acum* — pe baza ultimei activități și a exercițiilor neîncepute.
  5. *Recomandări pentru supervizor* — 3 acțiuni concrete („sună-l despre Modulul 2", „verifică exercițiul X unde a răspuns confuz", „felicită-l pentru progres pe Y").
- Buton „Regenerează rezumat" (cache 24h ca să nu cheltuim credite degeaba).
- **Indicatori-cheie** sub rezumat: scor maturitate, scor implicare, scor înțelegere, scor consistență (vezi punctul 3).

**b) „Date brute"** (ce există acum)
- Quiz onboarding cu toate răspunsurile.
- Toate exercițiile cu răspunsurile elevului, lecție cu lecție.
- Toate notițele.
- Activitate cronologică.

**c) „Note supervizor"** (nou)
- Câmp privat unde tu scrii observații despre elev după apeluri / sesiuni.
- Listă cronologică, doar admin vede.

## 2. Dashboard admin: vedere de ansamblu

Pe `/admin` (sau `/admin/users`) adaug:
- **Coadă de atenție**: top 5 elevi care necesită intervenție acum (inactivi recent, blocați la același modul de N zile, exerciții cu calitate scăzută).
- **Heatmap săptămânal**: cine a fost activ în ultimele 7 zile.
- **Filtre rapide**: „blocați la M1 / M2 / M3", „n-au început quiz-ul", „n-au terminat niciun exercițiu", „inactivi 7+ zile".
- Coloane noi în tabel: ultima activitate, scor implicare, status („pe drum" / „lent" / „blocat" / „terminat").

## 3. Scoruri (calcul determinist, nu AI)

Patru scoruri vizibile per elev, calculate din datele existente:

- **Implicare (0-100)** = pondere între lecții vizionate, exerciții completate, notițe scrise, zile active. 
- **Înțelegere (0-100)** = bazat pe câmpurile umplute la exerciții (gol vs scurt vs detaliat), bifări checklist, medii la grilele diagnostice (d1..d50).
- **Consistență (0-100)** = câte zile distincte a intrat în platformă în ultimele 30 zile, fără găuri lungi.
- **Maturitate** = deja există din quiz (startup/manual/illusion/systemic).

Scorurile sunt afișate cu bare colorate și o estimare globală „Progres real" (medie ponderată).

## 4. Rezumatul AI — cum funcționează

- Server function nouă, doar admin (verifică rolul cu `has_role`).
- Trimite la Lovable AI Gateway (`google/gemini-2.5-flash`, ieftin, suficient): quiz answers + listă exerciții completate + sample de răspunsuri lungi + scoruri calculate.
- Prompt strict în română, format fix pe 5 secțiuni, ton constructiv, fără jargon.
- Rezultatul se salvează în tabel nou `student_insights` (cache 24h + buton refresh manual).
- Dacă AI Gateway returnează 429/402, afișăm fallback cu scorurile + datele brute.

## 5. Backend (migrații necesare)

Două tabele noi:

```
student_insights         supervisor_notes
-----------------        ------------------
user_id (FK profiles)    user_id (FK profiles)
summary (text)           author_id (admin)
scores (jsonb)           note (text)
generated_at             created_at
model_used
```

Ambele: RLS doar pentru admin (`has_role(auth.uid(), 'admin')`), GRANT pe authenticated + service_role.

Server functions noi (toate cu `requireSupabaseAuth` + verificare admin):
- `generateStudentInsight({ studentId })` — apel AI, salvează în `student_insights`.
- `getStudentInsight({ studentId })` — citește cache.
- `addSupervisorNote / listSupervisorNotes / deleteSupervisorNote`.
- `getAttentionQueue()` — calculează top elevi care necesită atenție.

## 6. Ce NU schimbăm

- Vederea elevului rămâne identică, fără indicii că e analizat.
- Datele brute (răspunsuri, notițe, quiz) nu se modifică, doar le re-prezentăm.
- Restul aplicației (lecții, exerciții, documente) — neatinse.

## Ordinea de implementare

1. Migrații: `student_insights`, `supervisor_notes` + RLS.
2. Funcții de scoring (deterministe, fără AI) + afișare pe profil elev.
3. Tab-urile noi pe pagina elevului (Briefing / Date brute / Note).
4. Server function pentru rezumat AI + cache.
5. „Coadă de atenție" + filtre noi pe dashboard admin.
6. Note supervizor (CRUD simplu).

La final: o privire pe profilul oricărui elev = claritate completă fără să sapi.
