// Profilul de start — ce iese din diagnosticul cursului START.
//
// Spre deosebire de Business, unde profilul măsoară maturitatea unei firme existente,
// aici răspundem la patru întrebări:
//   1. În care dintre cele 3 segmente din metodologie se încadrează omul?
//   2. Cât de departe e de o validare reală?
//   3. E de fapt eligibil pentru START, sau ar trebui în BUSINESS?
//   4. Ce trebuie să știe mentorul înainte de primul apel?
//
// Nimic aici nu blochează accesul. Eligibilitatea e un semnal pentru echipă, nu un gard.

export type StartSegment = 'idee-nevalidata' | 'specialist' | 'tech-digital' | 'reluare' | 'deja-in-business';
export type ValidationStage = 'zero' | 'cerc-apropiat' | 'conversatii-reale' | 'plata-dovedita';
export type RiskFactor = 'fara-validare' | 'fara-sistem' | 'fara-strategie';

export interface StartProfile {
  segment: StartSegment;
  segmentLabel: string;
  validationStage: ValidationStage;
  validationLabel: string;
  riskFactor: RiskFactor;
  riskLabel: string;
  /** 0–100. Cât de pregătit e omul să execute, nu cât de multe știe. */
  readiness: number;
  /** Semnal pentru echipă: omul pare să aparțină altui program. */
  belongsInBusiness: boolean;
  /** Cât de dispus e să schimbe ideea când datele o contrazic. */
  coachability: 'ridicata' | 'medie' | 'scazuta';
  hoursPerWeek: number;
  urgency: number;
  priorityModules: string[];
  riskFlags: string[];
  /** Trei-patru fraze pentru mentor, înainte de primul apel. */
  mentorBriefing: string;
  ideaText: string;
  pastFailureText: string;
}

const SEGMENT_LABEL: Record<StartSegment, string> = {
  'idee-nevalidata': 'Începător cu idee nevalidată',
  'specialist': 'Specialist care vrea să devină antreprenor',
  'tech-digital': 'Fondator cu produs digital',
  'reluare': 'A mai încercat — reia corect',
  'deja-in-business': 'Are deja afacere cu venituri',
};

const VALIDATION_LABEL: Record<ValidationStage, string> = {
  'zero': 'Nicio conversație — validare zero',
  'cerc-apropiat': 'Doar cercul apropiat — nu contează ca dovadă',
  'conversatii-reale': 'Conversații reale în desfășurare',
  'plata-dovedita': 'Are dovadă de plată',
};

const RISK_LABEL: Record<RiskFactor, string> = {
  'fara-validare': 'Pornește fără validare',
  'fara-sistem': 'Construiește fără sistem',
  'fara-strategie': 'Vinde fără strategie',
};

export function generateStartProfile(answers: Record<string, any>): StartProfile {
  const s = (id: string): string => (typeof answers[id] === 'string' ? answers[id] : '') || '';
  const arr = (id: string): string[] => (Array.isArray(answers[id]) ? answers[id] : []);
  const num = (id: string, fallback: number): number => {
    const v = Number(answers[id]);
    return Number.isFinite(v) ? v : fallback;
  };

  // ── Segment ───────────────────────────────────────────────────────────────
  const situatie = s('s1');
  let segment: StartSegment = 'idee-nevalidata';
  if (situatie.startsWith('Am un skill')) segment = 'specialist';
  else if (situatie.startsWith('Construiesc un produs digital')) segment = 'tech-digital';
  else if (situatie.startsWith('Am pornit ceva înainte')) segment = 'reluare';
  else if (situatie.startsWith('Am deja o afacere')) segment = 'deja-in-business';

  // ── Stadiul validării ─────────────────────────────────────────────────────
  const incasari = s('s2');
  const conversatii = s('s6');
  let validationStage: ValidationStage = 'zero';
  if (incasari.startsWith('Vând constant') || incasari.startsWith('Am făcut 1–3')) validationStage = 'plata-dovedita';
  else if (conversatii.startsWith('Cu 10') || conversatii.startsWith('Cu 4–9')) validationStage = 'conversatii-reale';
  else if (conversatii.startsWith('Cu 1–3')) validationStage = 'cerc-apropiat';

  // ── Factorul de risc dominant ─────────────────────────────────────────────
  // Ordinea contează: lipsa validării bate orice altceva, pentru că e prima
  // în logica programului. Nu are rost să discuți sistemul cu cineva care încă
  // nu știe dacă are piață.
  const procese = s('s12');
  let riskFactor: RiskFactor = 'fara-validare';
  if (validationStage === 'plata-dovedita') {
    riskFactor = procese.startsWith('Nu, totul e în capul meu') || procese.startsWith('Am niște notițe')
      ? 'fara-sistem'
      : 'fara-strategie';
  } else if (validationStage === 'conversatii-reale') {
    riskFactor = 'fara-validare';
  }

  // ── Eligibilitate ─────────────────────────────────────────────────────────
  // Metodologia e explicită: cine are venituri validate și clienți recurenți
  // merge în BUSINESS, nu în START.
  const belongsInBusiness =
    segment === 'deja-in-business' && incasari.startsWith('Vând constant');

  // ── Deschiderea la pivot ──────────────────────────────────────────────────
  const pivot = s('s16');
  const coachability: StartProfile['coachability'] =
    pivot.startsWith('Schimb ideea') ? 'ridicata'
    : pivot.startsWith('Mai insist') || pivot.startsWith('Nu știu') ? 'medie'
    : 'scazuta';

  const hoursPerWeek = num('s14', 8);
  const urgency = num('s17', 5);

  // ── Scor de pregătire ─────────────────────────────────────────────────────
  // Măsoară capacitatea de execuție, nu cunoștințele. Un om cu multe ore
  // disponibile și deschis la pivot execută; unul care „mai are de învățat" nu.
  let readiness = 40;
  if (validationStage === 'conversatii-reale') readiness += 15;
  if (validationStage === 'plata-dovedita') readiness += 25;
  if (coachability === 'ridicata') readiness += 15;
  if (coachability === 'scazuta') readiness -= 15;
  if (hoursPerWeek >= 10) readiness += 10;
  if (hoursPerWeek < 5) readiness -= 15;
  if (urgency >= 8) readiness += 10;
  if (arr('s10').some(x => x.startsWith('Simt că mai am de învățat'))) readiness -= 10;
  if (s('s8').startsWith('Oricui are nevoie')) readiness -= 10;
  readiness = Math.max(0, Math.min(100, readiness));

  // ── Semnale de atenție pentru mentor ──────────────────────────────────────
  const riskFlags: string[] = [];
  if (s('s8').startsWith('Oricui are nevoie')) riskFlags.push('Se adresează tuturor — eroarea de nișă numărul 1');
  if (arr('s7').some(x => x.startsWith('Nu am încă nicio dovadă'))) riskFlags.push('Zero dovezi de piață — merge pe intuiție');
  if (coachability === 'scazuta') riskFlags.push('Nu ia în calcul că ideea ar putea să nu aibă piață');
  if (hoursPerWeek < 5) riskFlags.push(`Doar ${hoursPerWeek} ore pe săptămână — risc de abandon`);
  if (s('s3').startsWith('Peste 3 ani') && validationStage === 'zero') riskFlags.push('Peste 3 ani de gândit, zero execuție — capcana pregătirii infinite');
  if (arr('s10').some(x => x.startsWith('Simt că mai am de învățat'))) riskFlags.push('Capcana pregătirii infinite, declarată explicit');
  if (segment === 'tech-digital' && validationStage === 'zero') riskFlags.push('Construiește produs fără validare — tiparul clasic al fondatorului tehnic');
  if (belongsInBusiness) riskFlags.push('Are venituri recurente — de verificat dacă locul lui e în BUSINESS');

  // ── Modulele de accentuat ─────────────────────────────────────────────────
  const priorityModules: string[] = [];
  if (validationStage !== 'plata-dovedita') priorityModules.push('st-m-2');
  if (segment === 'specialist') priorityModules.push('st-m-3', 'st-m-8');
  if (segment === 'tech-digital') priorityModules.push('st-m-2', 'st-m-5');
  if (segment === 'idee-nevalidata') priorityModules.push('st-m-1', 'st-m-2');
  if (segment === 'reluare') priorityModules.push('st-m-0', 'st-m-2');
  if (validationStage === 'plata-dovedita') priorityModules.push('st-m-3', 'st-m-4');
  const uniqueModules = [...new Set(priorityModules)];

  // ── Briefingul pentru mentor ──────────────────────────────────────────────
  const ideaText = s('s5').trim();
  const pastFailureText = s('s11').trim();
  const briefingParts: string[] = [];
  briefingParts.push(`${SEGMENT_LABEL[segment]}. ${VALIDATION_LABEL[validationStage]}.`);
  if (ideaText) briefingParts.push(`Vrea să construiască: „${ideaText}"`);
  briefingParts.push(`Frica declarată: ${s('s9') || 'nedeclarată'}.`);
  briefingParts.push(`Deschidere la pivot: ${coachability}. ${hoursPerWeek}h/săptămână disponibile, urgență ${urgency}/10.`);
  if (pastFailureText && !/^nu e cazul/i.test(pastFailureText)) {
    briefingParts.push(`Despre eșecul anterior: „${pastFailureText}"`);
  }
  if (riskFlags.length) briefingParts.push(`De urmărit: ${riskFlags.join('; ')}.`);

  return {
    segment,
    segmentLabel: SEGMENT_LABEL[segment],
    validationStage,
    validationLabel: VALIDATION_LABEL[validationStage],
    riskFactor,
    riskLabel: RISK_LABEL[riskFactor],
    readiness,
    belongsInBusiness,
    coachability,
    hoursPerWeek,
    urgency,
    priorityModules: uniqueModules,
    riskFlags,
    mentorBriefing: briefingParts.join(' '),
    ideaText,
    pastFailureText,
  };
}
