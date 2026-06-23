import { createFileRoute } from '@tanstack/react-router';
import { BriefingMarkdown } from '@/components/admin/StudentBriefingPanel';

const sample = `## 1. Cine e elevul
Elevul test este un antreprenor din domeniul HoReCa, cu 1-3 ani de experiență, 4-10 angajați, cifră de afaceri anuală >500.000 lei.

## 2. Nivelul de maturitate
Se află în stadiul "conducere manuală", recunoscând că totul depinde de el și lipsesc procesele scrise.

## 3. Ce a făcut concret
A parcurs 6 din 22 lecții și a completat 3 din 26 exerciții în Etapa 0. Calitatea răspunsurilor este medie, cu răspunsuri trunchiate la e-0-1 și e-0-2.

## 4. Unde e blocat
Blocat în Etapa 0, inactiv de 32 de zile. Problema principală este lipsa timpului și dificultatea de a delega.

## 5. Recomandări pentru supervizor
1. Sună-l pentru a afla blocajul concret din Etapa 0.\n2. Verifică exercițiile e-0-1 și e-0-2.\n3. Propune un prim pas mic pentru revenire.

## 6. Întrebări pentru apelul de tracking

### A. Blocaje și progres concret
**Întrebare:** Ce anume te-a oprit să continui cu lecțiile și exercițiile din Etapa 0, având în vedere că ai început bine?

_Context elev:_ Ultima activitate a fost acum 32 de zile, iar progresul este blocat la Etapa 0, cu doar 6 lecții și 3 exerciții completate.

**Întrebare:** Ce dificultăți ai întâmpinat la exercițiile e-0-1 și e-0-2, unde ai trunchiat unele răspunsuri?

_Context elev:_ Răspunsurile la exercițiile e-0-1 ("Capacitatea de dezvoltare...") și e-0-2 ("Multe linii de afacere...") sunt trunchiate.

### B. Înțelegerea conceptelor cheie
**Întrebare:** Cum ai descrie, în propriile cuvinte, conceptul de "claritate" și "procese scrise" pe care ți-ai propus să le implementezi?

_Context elev:_ La exercițiul e-0-4, ai menționat "Sa creez claritate, in scris procese, si sa invat cum sa IMPLEMENTEZ corect sistemul."

**Întrebare:** Ce înseamnă pentru tine "să am o echipă care funcționează fără mine zilnic" și cum crezi că te poate ajuta programul să ajungi acolo?

_Context elev:_ Ai indicat "Să am o echipă care funcționează fără mine zilnic" ca un obiectiv cheie în quiz.

### C. Aplicarea în business (implementare reală)
**Întrebare:** Ai reușit să aplici în afacerea ta vreun concept sau idee din lecțiile parcurse până acum?

_Context elev:_ Ai completat 6 lecții din Etapa 0, dar nu ai notițe scrise și nu ai trecut la alte etape.

### D. Suport și ajutor necesar
**Întrebare:** Ce tip de suport suplimentar te-ar ajuta să depășești blocajul actual și să reiei activitatea în program?

_Context elev:_ (fără date — întrebare exploratorie)

### E. Platforma și calitatea informației
**Întrebare:** Cum ți s-au părut până acum lecțiile și exercițiile din Etapa 0 din punct de vedere al clarității și utilității?

_Context elev:_ Ai parcurs 6 lecții și 3 exerciții, dar ai un scor de înțelegere de 53/100.

### F. Motivație, timp și pași următori
**Întrebare:** Cât timp aloci săptămânal pentru program și ce ți-ar crește motivația să continui constant?

_Context elev:_ Scorul de consistență este 0/100, iar ultima activitate a fost acum 32 de zile.`;

export const Route = createFileRoute('/test-briefing')({
  component: TestBriefing,
});


function TestBriefing() {
  return (
    <div style={{ padding: 32, maxWidth: 900, margin: '0 auto' }}>
      <h1 style={{ color: 'var(--fg)', marginBottom: 24 }}>Test formatare briefing</h1>
      <BriefingMarkdown text={sample} />
    </div>
  );
}
