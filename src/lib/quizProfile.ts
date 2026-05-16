export interface QuizProfile {
  // Summary
  domain: string;
  years: string;
  teamSize: string;
  revenueRange: string;
  mainBlocker: string;
  objective: string;
  urgencyScore: number; // 1-10 from Q15
  // Derived
  maturityLevel: 'startup' | 'manual' | 'illusion' | 'systemic';
  maturityLabel: string;
  priorityModules: string[];   // module IDs to focus on
  riskFlags: string[];         // warning areas
  profileSummary: string;      // 2-3 sentence AI-like summary
  recommendedPath: string;     // recommended learning path
}

export function generateProfile(answers: Record<string, string | string[]>): QuizProfile {
  const q = (id: string) => (answers[id] as string) || '';
  const qArr = (id: string): string[] => Array.isArray(answers[id]) ? answers[id] as string[] : [];
  const urgency = parseInt(answers['q15'] as string) || 5;

  // Domain
  const domain = q('q1') || 'Nedefinit';

  // Years → maturity hint
  const years = q('q2');
  const teamSize = q('q7');
  const revenue = q('q4');
  const hasProcesses = q('q12');
  const orgChart = q('q9');
  const knowsFinancials = q('q6');
  const peopleAskDaily = q('q8');

  // Derive maturity level
  let maturityLevel: QuizProfile['maturityLevel'] = 'manual';
  if (years === 'Sub 1 an') maturityLevel = 'startup';
  else if (hasProcesses === 'Da, pentru majoritatea activităților' && orgChart.startsWith('Da, funcțională')) maturityLevel = 'systemic';
  else if (hasProcesses === 'Câteva notițe informale' || hasProcesses === 'Nu există nimic scris') {
    maturityLevel = peopleAskDaily === 'Aproape toți' || peopleAskDaily === '3–5' ? 'manual' : 'illusion';
  } else maturityLevel = 'illusion';

  const maturityLabels: Record<QuizProfile['maturityLevel'], string> = {
    startup: 'Stadiul 1 — Startup',
    manual: 'Stadiul 2 — Conducere Manuală',
    illusion: 'Stadiul 3 — Iluzia Sistemului',
    systemic: 'Stadiul 4 — Business Sistemic',
  };

  // Priority modules
  const priorityModules: string[] = ['mod-0', 'mod-1'];
  if (!orgChart.startsWith('Da, funcțională')) priorityModules.push('mod-2');
  if (!hasProcesses.startsWith('Da, pentru')) priorityModules.push('mod-3');
  if (knowsFinancials.includes('Nu') || knowsFinancials.includes('Aproximativ')) priorityModules.push('mod-4');
  if (peopleAskDaily === 'Aproape toți' || peopleAskDaily === '3–5') priorityModules.push('mod-5');

  // Risk flags
  const riskFlags: string[] = [];
  if (urgency >= 8) riskFlags.push('Urgență ridicată — risc de burnout');
  if (peopleAskDaily === 'Aproape toți') riskFlags.push('Dependență totală operațională');
  if (q('q11') === 'Nu am plecat deloc' || q('q11').includes('Nu mi-am permis')) riskFlags.push('Nu a reușit vacanță în ultimul an');
  if (knowsFinancials === 'Nu știu deloc') riskFlags.push('Control financiar inexistent');
  if (maturityLevel === 'manual' || maturityLevel === 'illusion') riskFlags.push('Blocat în Stadiul 2–3 de maturitate');
  const blockers = qArr('q13');
  if (blockers.includes('Conflicte sau lipsă de claritate cu asociatul/partenerii')) riskFlags.push('Conflict sau ambiguitate la nivel de ownership');

  // Profile summary
  const summaryParts: string[] = [];
  summaryParts.push(`Antreprenor în ${domain} cu ${years.toLowerCase()} experiență, ${teamSize} angajați.`);
  if (maturityLevel === 'manual') summaryParts.push('Afacerea funcționează, dar totul trece prin fondator. Blocajul principal este lipsa proceselor și a structurii clare de delegare.');
  else if (maturityLevel === 'illusion') summaryParts.push('Există structuri parțiale, dar sistemul nu este complet. Crește în volum dar nu în libertate.');
  else if (maturityLevel === 'startup') summaryParts.push('În faza de validare și construcție inițială. Fundația corectă acum va economisi luni de refăcut mai târziu.');
  else summaryParts.push('A atins un nivel de maturitate sistemic. Prioritatea este optimizarea și scalarea controlată.');
  if (urgency >= 8) summaryParts.push(`Nivelul de urgență declarat este ${urgency}/10 — există motivație puternică să implementeze schimbările rapid.`);

  return {
    domain,
    years,
    teamSize,
    revenueRange: revenue,
    mainBlocker: blockers.join(', ') || q('q13') || 'Nedefinit',
    objective: q('q14') || 'Nedefinit',
    urgencyScore: urgency,
    maturityLevel,
    maturityLabel: maturityLabels[maturityLevel],
    priorityModules: [...new Set(priorityModules)],
    riskFlags,
    profileSummary: summaryParts.join(' '),
    recommendedPath: priorityModules.length > 4 ? 'Complet, cu accent pe Etapele 1–4' : `Accent pe ${priorityModules.slice(2).map(m => m.replace('mod-', 'Modul ')).join(', ')}`,
  };
}

export function getQuizAnswersForUser(userId: string): Record<string, string | string[]> | null {
  try {
    const s = localStorage.getItem(`aa_quiz_answers_${userId}`);
    return s ? JSON.parse(s) : null;
  } catch { return null; }
}

export function getAllQuizAnswers(): Array<{ userId: string; answers: Record<string, string | string[]>; profile: QuizProfile }> {
  const results: Array<{ userId: string; answers: Record<string, string | string[]>; profile: QuizProfile }> = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key?.startsWith('aa_quiz_answers_') && !key.endsWith('_current')) {
      const userId = key.replace('aa_quiz_answers_', '');
      try {
        const answers = JSON.parse(localStorage.getItem(key)!);
        results.push({ userId, answers, profile: generateProfile(answers) });
      } catch {}
    }
  }
  return results;
}
