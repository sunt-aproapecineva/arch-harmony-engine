import React from 'react';
import { renderToString } from 'react-dom/server';
import { BriefingMarkdown } from '@/components/admin/StudentBriefingPanel';

const sample = `## 6. Întrebări pentru apelul de tracking

### A. Blocaje și progres concret
**Întrebare:** Ce anume te-a oprit să continui cu lecțiile și exercițiile din Etapa 0, având în vedere că ai început bine?

_Context elev:_ Ultima activitate a fost acum 32 de zile, iar progresul este blocat la Etapa 0, cu doar 6 lecții și 3 exerciții completate.

### B. Înțelegerea conceptelor cheie
**Întrebare:** Cum ai descrie, în propriile cuvinte, conceptul de "claritate"?

_Context elev:_ La exercițiul e-0-4, ai menționat claritate.`;

const html = renderToString(<BriefingMarkdown text={sample} />);
console.log(html);
