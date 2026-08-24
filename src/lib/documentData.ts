// ─────────────────────────────────────────────────────────────────────────────
// documentData.ts — AA-branded business document templates
// Arhitectura Afacerii · Victor Morar
// ─────────────────────────────────────────────────────────────────────────────

export interface DocQuestion {
  id: string;
  label: string;
  placeholder: string;
  type: 'text' | 'textarea' | 'date';
  hint?: string;
}

export interface DocWizardStep {
  title: string;
  subtitle?: string;
  questions: DocQuestion[];
}

export interface PlatformDocument {
  id: string;
  /**
   * Cursul căruia îi aparține documentul. Lipsa lui înseamnă 'business' — toate
   * documentele existente (Doc 01…13) sunt din practicumul de Business.
   */
  courseId?: string;
  lessonIds: string[];
  docNumber: string;
  title: string;
  shortTitle: string;
  description: string;
  downloadUrl: string;
  topic: string;
  color: 'green' | 'red' | 'gold';
  steps: DocWizardStep[];
  generate: (answers: Record<string, string>) => string;
}

// ─── Print window utility ────────────────────────────────────────────────────

export function openPrintWindow(html: string): void {
  // Use a Blob URL so the browser fully loads the document before we trigger print().
  // Writing via document.write + immediate win.print() races on desktop browsers
  // (Chrome/Safari) and often prints a blank page or shows nothing.
  const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const win = window.open(url, '_blank');

  if (!win) {
    // Popup blocked — fall back to opening in same tab / downloading.
    const a = document.createElement('a');
    a.href = url;
    a.target = '_blank';
    a.rel = 'noopener';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(url), 60_000);
    return;
  }

  // Trigger print after the new window has finished loading.
  const triggerPrint = () => {
    try { win.focus(); win.print(); } catch {}
  };
  try {
    win.addEventListener('load', triggerPrint, { once: true });
  } catch {
    setTimeout(triggerPrint, 800);
  }
  // Safety net in case 'load' never fires (some browsers with Blob URLs).
  setTimeout(triggerPrint, 1500);
  setTimeout(() => URL.revokeObjectURL(url), 60_000);
}

// ─── Shared HTML helpers ─────────────────────────────────────────────────────

export const FONTS = `<link href="https://fonts.googleapis.com/css2?family=Aboreto&family=Arimo:ital,wght@0,400;0,500;0,600;0,700;1,400&display=swap" rel="stylesheet">`;

// AA Monogram SVG — two interlocking A shapes
export const MONOGRAM_SVG = (height = 40, fill1 = '#C9A96E', fill2 = 'rgba(201,169,110,0.45)') =>
  `<svg height="${height}" viewBox="0 0 303 240" fill="none" xmlns="http://www.w3.org/2000/svg" style="display:block;flex-shrink:0">
    <path d="M93.6414 229.092L194.246 4.82955L214.537 5.94268L290.006 239.864L266.115 238.554L231.422 128.981L157.13 124.906L117.532 230.403L93.6414 229.092ZM195.603 21.9735L159.852 117.177L228.907 120.965L197.567 22.0812L195.603 21.9735Z" fill="${fill1}"/>
    <path d="M208.932 229.092L108.328 4.82955L88.037 5.94268L12.5678 239.864L36.4588 238.554L71.152 128.981L145.443 124.906L185.041 230.403L208.932 229.092ZM106.971 21.9735L142.721 117.177L73.6666 120.965L105.007 22.0812L106.971 21.9735Z" fill="${fill2}"/>
  </svg>`;


export const BASE_STYLES = `
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  @page {
    size: A4;
    margin: 0;
  }
  :root {
    --green: #1A5C38;
    --green-light: #2a7a4f;
    --red: #8B1A1A;
    --red-light: #a82020;
    --gold: #C9A96E;
    --gold-dark: #a07840;
    --ink: #1C1410;
    --ink-light: #3a2e26;
    --paper: #FDFAF6;
    --paper-dark: #f2ece2;
    --line: #ddd5c8;
    --muted: #7a6e64;
  }
  html, body {
    font-family: 'Arimo', Arial, sans-serif;
    background: #e8e0d5;
    color: var(--ink);
    font-size: 13px;
    line-height: 1.55;
    print-color-adjust: exact;
    -webkit-print-color-adjust: exact;
  }
  .page {
    width: 210mm;
    height: 297mm;
    margin: 0 auto 24px;
    background: var(--paper);
    box-shadow: 0 4px 32px rgba(0,0,0,0.18);
    display: flex;
    flex-direction: column;
    overflow: hidden;
    position: relative;
  }
  @media print {
    html, body {
      background: white;
      print-color-adjust: exact;
      -webkit-print-color-adjust: exact;
    }
    .page {
      box-shadow: none;
      margin: 0;
      width: 210mm;
      height: 297mm;
      page-break-after: always;
      break-after: page;
      overflow: hidden;
    }
    .no-print { display: none !important; }
  }

  /* ── AA Header ── */
  .aa-header {
    background: var(--ink);
    padding: 16px 28px;
    display: flex;
    align-items: center;
    gap: 16px;
  }
  .aa-header-text { flex: 1; min-width: 0; }
  .aa-header-brand {
    font-family: 'Aboreto', serif;
    font-size: 9px;
    letter-spacing: 0.28em;
    color: rgba(255,255,255,0.72);
    text-transform: uppercase;
    margin-bottom: 3px;
  }
  .aa-header-subtitle {
    font-size: 8px;
    color: rgba(255,255,255,0.35);
    letter-spacing: 0.1em;
  }
  .aa-header-accent {
    height: 2px;
    background: linear-gradient(90deg, var(--gold), rgba(201,169,110,0.18) 65%, transparent);
  }
  .aa-doc-tag {
    font-family: 'Arimo', sans-serif;
    font-size: 7.5px;
    color: rgba(201,169,110,0.65);
    border: 1px solid rgba(201,169,110,0.22);
    padding: 3px 10px;
    border-radius: 99px;
    letter-spacing: 0.14em;
    text-transform: uppercase;
    white-space: nowrap;
  }

  /* ── AA Footer ── */
  .aa-footer-sep {
    height: 1px;
    background: linear-gradient(90deg, transparent, var(--gold) 25%, rgba(201,169,110,0.2) 75%, transparent);
    margin-top: 28px;
  }
  .aa-footer {
    background: var(--ink);
    padding: 12px 28px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 16px;
  }
  .aa-footer-left { display: flex; align-items: center; gap: 12px; }
  .aa-footer-brand {
    font-family: 'Aboreto', serif;
    font-size: 7.5px;
    letter-spacing: 0.22em;
    color: rgba(255,255,255,0.32);
    text-transform: uppercase;
  }
  .aa-footer-right {
    font-size: 7.5px;
    color: rgba(255,255,255,0.25);
    letter-spacing: 0.06em;
    text-align: right;
  }

  /* ── Title Band ── */
  .title-band {
    padding: 22px 28px 20px;
    color: white;
  }
  .title-band .doc-num {
    font-family: 'Aboreto', serif;
    font-size: 10px;
    letter-spacing: 3px;
    opacity: 0.75;
    margin-bottom: 6px;
  }
  .title-band h1 {
    font-family: 'Aboreto', serif;
    font-size: 17px;
    letter-spacing: 0.5px;
    line-height: 1.35;
    font-weight: normal;
  }
  .title-band .topic-tag {
    display: inline-block;
    margin-top: 10px;
    font-size: 10px;
    letter-spacing: 2px;
    text-transform: uppercase;
    padding: 3px 10px;
    border: 1px solid rgba(255,255,255,0.35);
    border-radius: 20px;
    opacity: 0.8;
  }

  /* ── Body content ── */
  .doc-body { padding: 24px 28px 32px; }

  .section-block {
    margin-bottom: 22px;
    break-inside: avoid;
  }
  .section-title {
    font-family: 'Aboreto', serif;
    font-size: 10px;
    letter-spacing: 2.5px;
    text-transform: uppercase;
    padding: 6px 10px;
    margin-bottom: 12px;
    border-radius: 3px;
  }
  .section-subtitle {
    font-size: 10.5px;
    color: var(--muted);
    margin-top: -8px;
    margin-bottom: 10px;
    padding-left: 10px;
    font-style: italic;
  }

  .field-row {
    display: flex;
    gap: 16px;
    margin-bottom: 10px;
  }
  .field-row.single { display: block; }

  .field {
    flex: 1;
    min-width: 0;
  }
  .field-label {
    font-size: 10px;
    font-weight: 700;
    letter-spacing: 0.5px;
    color: var(--muted);
    text-transform: uppercase;
    margin-bottom: 3px;
  }
  .field-value {
    font-size: 12.5px;
    color: var(--ink);
    border-bottom: 1px solid var(--line);
    padding-bottom: 4px;
    min-height: 22px;
    word-break: break-word;
    white-space: pre-wrap;
  }
  .field-value.empty {
    border-bottom: 1.5px dotted var(--gold);
    min-height: 42px;
    margin-bottom: 4px;
  }
  .field-value.multiline {
    border: 1px solid var(--line);
    border-radius: 3px;
    padding: 7px 9px;
    min-height: 48px;
    background: var(--paper-dark);
    font-size: 12px;
  }
  .field-value.multiline.empty {
    border: 1px solid var(--line);
    border-radius: 6px;
    background: var(--paper-dark);
    background-image: repeating-linear-gradient(transparent, transparent 34px, rgba(201, 169, 110, 0.22) 34px, rgba(201, 169, 110, 0.22) 35px);
    line-height: 35px;
    min-height: 280px; /* 8 lines for generous handwriting space */
    padding: 4px 12px;
    margin-bottom: 6px;
  }
  .field-hint {
    font-size: 10px;
    color: var(--muted);
    font-style: italic;
    margin-top: 2px;
  }

  /* ── Two-column partner grid ── */
  .partner-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 16px;
    margin-bottom: 14px;
  }
  .partner-card {
    border: 1px solid var(--line);
    border-radius: 5px;
    padding: 12px 14px;
    background: var(--paper-dark);
  }
  .partner-card-title {
    font-family: 'Aboreto', serif;
    font-size: 9px;
    letter-spacing: 2px;
    text-transform: uppercase;
    margin-bottom: 10px;
    padding-bottom: 6px;
    border-bottom: 1px solid var(--line);
  }

  /* ── Signature block ── */
  .signature-block {
    margin-top: 32px;
    padding-top: 20px;
    border-top: 2px solid var(--line);
    break-inside: avoid;
  }
  .signature-block .sig-title {
    font-family: 'Aboreto', serif;
    font-size: 9px;
    letter-spacing: 2px;
    text-transform: uppercase;
    color: var(--muted);
    margin-bottom: 16px;
  }
  .sig-row {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 24px;
    margin-bottom: 20px;
  }
  .sig-col .sig-name-line {
    border-bottom: 1px solid var(--ink);
    height: 32px;
    margin-bottom: 5px;
  }
  .sig-col .sig-label {
    font-size: 10px;
    color: var(--muted);
    letter-spacing: 0.5px;
  }
  .sig-date-row {
    display: flex;
    gap: 24px;
    margin-top: 4px;
  }
  .sig-date-field {
    flex: 1;
    border-bottom: 1px solid var(--line);
    height: 32px;
  }
  .sig-date-label {
    font-size: 10px;
    color: var(--muted);
    margin-top: 4px;
  }

  /* ── Disclaimer (inside body, above footer bar) ── */
  .doc-disclaimer {
    margin: 20px 0 0;
    padding: 10px 12px;
    border: 1px solid var(--line);
    border-radius: 4px;
    background: var(--paper-dark);
    font-size: 9px;
    color: var(--muted);
    letter-spacing: 0.3px;
    line-height: 1.55;
  }
  .doc-disclaimer strong { color: var(--ink-light); }
`;

export function htmlShell(
  styles: string,
  body: string,
  title: string
): string {
  return `<!DOCTYPE html>
<html lang="ro">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${title} · Arhitectura Afacerii</title>
  ${FONTS}
  <style>
    ${BASE_STYLES}
    ${styles}
  </style>
</head>
<body>
  ${body}
</body>
</html>`;
}

function renderPage(
  docNum: string,
  topic: string,
  pageIndex: number,
  totalPages: number,
  content: string,
  topContent = ''
): string {
  return `
    <div class="page">
      ${aaHeader(docNum, topic)}
      ${topContent}
      <div class="doc-body" style="flex: 1; display: flex; flex-direction: column;">
        ${content}
      </div>
      ${aaFooter(docNum, `Pagina ${pageIndex} / ${totalPages}`)}
    </div>`;
}

// Safely render an answer — empty if blank
function ans(answers: Record<string, string>, key: string): string {
  return (answers[key] || '').trim();
}

// Render a simple single-line field
function field(
  label: string,
  value: string,
  hint?: string
): string {
  const isEmpty = !value || value.trim() === '';
  const hintHtml = hint
    ? `<div class="field-hint">${hint}</div>`
    : '';
  return `
    <div class="field">
      <div class="field-label">${label}</div>
      <div class="field-value${isEmpty ? ' empty' : ''}">${isEmpty ? '&nbsp;' : value}</div>
      ${hintHtml}
    </div>`;
}

// Render a multiline (textarea) field
function fieldMulti(
  label: string,
  value: string,
  hint?: string
): string {
  const isEmpty = !value || value.trim() === '';
  const hintHtml = hint
    ? `<div class="field-hint">${hint}</div>`
    : '';
  return `
    <div class="field field-row single" style="margin-bottom:10px;">
      <div class="field-label">${label}</div>
      <div class="field-value multiline${isEmpty ? ' empty' : ''}">${isEmpty ? '&nbsp;' : value}</div>
      ${hintHtml}
    </div>`;
}

// Two fields side by side
function fieldRow(...fields: string[]): string {
  return `<div class="field-row">${fields.join('')}</div>`;
}

// Section block wrapper
function section(
  title: string,
  subtitle: string | undefined,
  titleBg: string,
  titleColor: string,
  content: string
): string {
  const subtitleHtml = subtitle
    ? `<div class="section-subtitle">${subtitle}</div>`
    : '';
  return `
    <div class="section-block">
      <div class="section-title" style="background:${titleBg};color:${titleColor};">${title}</div>
      ${subtitleHtml}
      ${content}
    </div>`;
}

export function aaHeader(docNum: string, topic: string): string {
  return `
    <div class="aa-header">
      ${MONOGRAM_SVG(40, '#C9A96E', 'rgba(201,169,110,0.4)')}
      <div class="aa-header-text">
        <div class="aa-header-brand">Arhitectura Afacerii</div>
        <div class="aa-header-subtitle">Program de Mentorat</div>
      </div>
      <div class="aa-doc-tag">Doc ${docNum} · ${topic}</div>
    </div>
    <div class="aa-header-accent"></div>`;
}

export function aaFooter(_docNum: string, pageInfo = ''): string {
  return `
    <div class="aa-footer-sep"></div>
    <div class="aa-footer">
      <div class="aa-footer-left">
        ${MONOGRAM_SVG(22, 'rgba(255,255,255,0.22)', 'rgba(255,255,255,0.1)')}
        <div class="aa-footer-brand">Arhitectura Afacerii</div>
      </div>
      <div class="aa-footer-right">
        ${pageInfo ? pageInfo + ' · ' : ''}Document Confidențial · Uz Personal
      </div>
    </div>`;
}

function signatureBlock(
  partnerALabel: string,
  partnerBLabel: string,
  date?: string
): string {
  const dateVal = date && date !== '—' ? date : '';
  return `
    <div class="signature-block">
      <div class="sig-title">Semnături</div>
      <div class="sig-row">
        <div class="sig-col">
          <div class="sig-name-line"></div>
          <div class="sig-label">${partnerALabel}</div>
        </div>
        <div class="sig-col">
          <div class="sig-name-line"></div>
          <div class="sig-label">${partnerBLabel}</div>
        </div>
      </div>
      <div class="sig-date-row">
        <div style="flex:1;">
          <div class="sig-date-field" style="padding-top:4px;font-size:12px;color:#555;">${dateVal}</div>
          <div class="sig-date-label">Data</div>
        </div>
        <div style="flex:1;">
          <div class="sig-date-field"></div>
          <div class="sig-date-label">Locul</div>
        </div>
      </div>
    </div>`;
}

function docFooter(): string {
  return `<div class="doc-disclaimer">Generat cu <strong>Arhitectura Afacerii</strong> · Program de Mentorat. Document confidențial, generat local — datele nu se transmit pe niciun server.</div>`;
}

// ─────────────────────────────────────────────────────────────────────────────
// DOCUMENT 1 — Cele 10 Conversații Obligatorii Înainte de Orice Parteneriat
// ─────────────────────────────────────────────────────────────────────────────

const doc1Steps: DocWizardStep[] = [
  {
    title: 'Parteneri și Context',
    subtitle: 'Cine semnează și despre ce afacere vorbim',
    questions: [
      { id: 'partener_a_nume',   label: 'Numele Partenerului A',   placeholder: 'ex: Ion Popescu',            type: 'text' },
      { id: 'partener_a_rol',    label: 'Rolul Partenerului A',    placeholder: 'ex: Fondator / CEO',         type: 'text' },
      { id: 'partener_b_nume',   label: 'Numele Partenerului B',   placeholder: 'ex: Maria Ionescu',          type: 'text' },
      { id: 'partener_b_rol',    label: 'Rolul Partenerului B',    placeholder: 'ex: Co-fondator / COO',      type: 'text' },
      { id: 'afacere_nume',      label: 'Numele afacerii',         placeholder: 'ex: Firma SRL',              type: 'text' },
      { id: 'afacere_domeniu',   label: 'Domeniu de activitate',   placeholder: 'ex: Retail / Servicii IT',   type: 'text' },
      { id: 'data_discutie',     label: 'Data discuției',          placeholder: '',                           type: 'date' },
    ],
  },
  {
    title: 'Viziunea și Conducerea',
    subtitle: 'Alinierea pe direcția afacerii și cine conduce',
    questions: [
      { id: 'viziune_3_ani_a',   label: 'Viziunea Partenerului A pentru afacere în 3 ani', placeholder: 'Descrie viziunea ta...', type: 'textarea' },
      { id: 'viziune_3_ani_b',   label: 'Viziunea Partenerului B pentru afacere în 3 ani', placeholder: 'Descrie viziunea ta...', type: 'textarea' },
      { id: 'cine_este_ceo',     label: 'Cine are decizia finală în afacere?',              placeholder: 'ex: Partenerul A este CEO', type: 'text' },
      { id: 'domenii_veto',      label: 'Decizii care necesită acordul ambilor parteneri', placeholder: 'ex: investiții >50.000 RON, angajare management...', type: 'textarea' },
    ],
  },
  {
    title: 'Contribuția și Banii',
    subtitle: 'Ce aduce fiecare și cum se împarte profitul',
    questions: [
      { id: 'capital_a',      label: 'Capital investit — Partener A (RON/€)', placeholder: 'ex: 50.000 RON', type: 'text' },
      { id: 'capital_b',      label: 'Capital investit — Partener B (RON/€)', placeholder: 'ex: 50.000 RON', type: 'text' },
      { id: 'timp_a',         label: 'Ore/săptămână — Partener A',            placeholder: 'ex: 40 ore/săptămână', type: 'text' },
      { id: 'timp_b',         label: 'Ore/săptămână — Partener B',            placeholder: 'ex: 20 ore/săptămână', type: 'text' },
      { id: 'profit_split',   label: 'Distribuția profitului',                placeholder: 'ex: 50/50 sau 60/40', type: 'text' },
      { id: 'salariu_a',      label: 'Salariu lunar — Partener A (RON)',      placeholder: 'ex: 8.000 RON net', type: 'text' },
      { id: 'salariu_b',      label: 'Salariu lunar — Partener B (RON)',      placeholder: 'ex: 6.000 RON net', type: 'text' },
    ],
  },
  {
    title: 'Roluri și Familie',
    subtitle: 'Responsabilități clare și situația familiei',
    questions: [
      { id: 'rol_a_detaliat',      label: 'Responsabilitățile complete ale Partenerului A', placeholder: 'Lista completă...', type: 'textarea' },
      { id: 'rol_b_detaliat',      label: 'Responsabilitățile complete ale Partenerului B', placeholder: 'Lista completă...', type: 'textarea' },
      { id: 'implicare_familie_a', label: 'Membrii familiei Partenerului A implicați în afacere', placeholder: 'ex: soția — contabilitate, sau nimeni', type: 'textarea' },
      { id: 'implicare_familie_b', label: 'Membrii familiei Partenerului B implicați în afacere', placeholder: 'ex: fiul — marketing, sau nimeni', type: 'textarea' },
      { id: 'reguli_familie',      label: 'Reguli agreate privind implicarea familiei',          placeholder: 'ex: membrii familiei nu pot ocupa roluri de conducere fără acord mutual', type: 'textarea' },
    ],
  },
  {
    title: 'Conflicte și Ieșire',
    subtitle: 'Cum rezolvăm dezacordurile și cum plecăm decent',
    questions: [
      { id: 'metoda_conflict',     label: 'Metoda de rezolvare a conflictelor', placeholder: 'ex: mediator agreat de comun acord, vot etc.',   type: 'textarea' },
      { id: 'preaviz_iesire',      label: 'Preaviz minim pentru intenția de ieșire (zile)', placeholder: 'ex: 90 de zile',                     type: 'text' },
      { id: 'metoda_evaluare',     label: 'Cine evaluează afacerea la ieșire?', placeholder: 'ex: expert contabil independent agreat mutual', type: 'text' },
      { id: 'drept_preemptiune',   label: 'Drept de preempțiune la ieșire',    placeholder: 'ex: Partenerul rămas are dreptul primul',        type: 'text' },
      { id: 'non_concurenta',      label: 'Clauza de non-concurență (ani)',     placeholder: 'ex: 2 ani în același domeniu',                  type: 'text' },
    ],
  },
  {
    title: 'Scenarii și Revizuire',
    subtitle: 'Ce facem în criză și când revizuim acordul',
    questions: [
      { id: 'scenariu_pierderi',       label: 'Scenariu: pierderi 3 luni consecutive',      placeholder: 'ex: injectăm capital / reducem cheltuieli...', type: 'textarea' },
      { id: 'scenariu_dezacord_major', label: 'Scenariu: dezacord major nerezolvat',         placeholder: 'ex: apelăm la mediator în 30 de zile...', type: 'textarea' },
      { id: 'data_revizuire_anuala',   label: 'Luna revizuirii anuale a acordului',          placeholder: 'ex: Ianuarie', type: 'text' },
      { id: 'angajament_final_a',      label: 'Angajamentul personal al Partenerului A',    placeholder: 'Scrie angajamentul tău față de acest acord...', type: 'textarea' },
      { id: 'angajament_final_b',      label: 'Angajamentul personal al Partenerului B',    placeholder: 'Scrie angajamentul tău față de acest acord...', type: 'textarea' },
    ],
  },
];

function generateDoc1(answers: Record<string, string>): string {
  const a = (k: string) => ans(answers, k);
  const pA = a('partener_a_nume') || 'Partener A';
  const pB = a('partener_b_nume') || 'Partener B';

  const sectionBg = '#eaf3ed';
  const sectionColor = '#1A5C38';

  const titleBand = `
    <div class="title-band" style="background: linear-gradient(135deg, #1A5C38 0%, #2a7a4f 100%);">
      <div class="doc-num">DOCUMENT 01</div>
      <h1>Cele 10 Conversații Obligatorii<br/>Înainte de Orice Parteneriat</h1>
      <span class="topic-tag">Parteneriatul</span>
    </div>`;

  const sec1 = section(
    'Parteneri și Context',
    'Cine semnează și despre ce afacere vorbim',
    sectionBg, sectionColor,
    `<div class="partner-grid">
      <div class="partner-card">
        <div class="partner-card-title" style="color:#1A5C38;">Partener A</div>
        ${field('Nume', a('partener_a_nume'))}
        ${field('Rol', a('partener_a_rol'))}
      </div>
      <div class="partner-card">
        <div class="partner-card-title" style="color:#1A5C38;">Partener B</div>
        ${field('Nume', a('partener_b_nume'))}
        ${field('Rol', a('partener_b_rol'))}
      </div>
    </div>
    ${fieldRow(
      field('Afacerea', a('afacere_nume')),
      field('Domeniu', a('afacere_domeniu')),
      field('Data discuției', a('data_discutie'))
    )}`
  );

  const sec2 = section(
    'Viziunea și Conducerea',
    'Alinierea pe direcția afacerii și cine conduce',
    sectionBg, sectionColor,
    `${fieldMulti(`Viziunea ${pA} pentru 3 ani`, a('viziune_3_ani_a'))}
     ${fieldMulti(`Viziunea ${pB} pentru 3 ani`, a('viziune_3_ani_b'))}
     ${fieldRow(field('Cine are decizia finală (CEO)?', a('cine_este_ceo')))}
     ${fieldMulti('Decizii care necesită acordul ambilor parteneri', a('domenii_veto'))}`
  );

  const sec3 = section(
    'Contribuția și Banii',
    'Ce aduce fiecare și cum se împarte profitul',
    sectionBg, sectionColor,
    `<div class="partner-grid">
      <div class="partner-card">
        <div class="partner-card-title" style="color:#1A5C38;">Partener A — ${pA}</div>
        ${field('Capital investit', a('capital_a'))}
        ${field('Ore/săptămână', a('timp_a'))}
        ${field('Salariu lunar', a('salariu_a'))}
      </div>
      <div class="partner-card">
        <div class="partner-card-title" style="color:#1A5C38;">Partener B — ${pB}</div>
        ${field('Capital investit', a('capital_b'))}
        ${field('Ore/săptămână', a('timp_b'))}
        ${field('Salariu lunar', a('salariu_b'))}
      </div>
    </div>
    ${fieldRow(field('Distribuția profitului', a('profit_split')))}`
  );

  const sec4Part1 = section(
    'Roluri și Familie',
    'Responsabilități clare și situația familiei',
    sectionBg, sectionColor,
    `${fieldMulti(`Responsabilitățile lui ${pA}`, a('rol_a_detaliat'))}
     ${fieldMulti(`Responsabilitățile lui ${pB}`, a('rol_b_detaliat'))}
     <div class="partner-grid">
      <div class="partner-card">
        <div class="partner-card-title" style="color:#1A5C38;">Familie — ${pA}</div>
        <div class="field-value multiline${!a('implicare_familie_a') ? ' empty' : ''}">${a('implicare_familie_a') || '&nbsp;'}</div>
      </div>
      <div class="partner-card">
        <div class="partner-card-title" style="color:#1A5C38;">Familie — ${pB}</div>
        <div class="field-value multiline${!a('implicare_familie_b') ? ' empty' : ''}">${a('implicare_familie_b') || '&nbsp;'}</div>
      </div>
     </div>`
  );

  const sec4Part2 = section(
    'Reguli Familie',
    'Reguli agreate privind implicarea familiei',
    sectionBg, sectionColor,
    `${fieldMulti('Reguli privind implicarea familiei', a('reguli_familie'))}`
  );

  const sec5 = section(
    'Conflicte și Ieșire',
    'Cum rezolvăm dezacordurile și cum plecăm decent',
    sectionBg, sectionColor,
    `${fieldMulti('Metoda de rezolvare a conflictelor', a('metoda_conflict'))}
     ${fieldRow(
       field('Preaviz minim (zile)', a('preaviz_iesire')),
       field('Evaluarea afacerii la ieșire', a('metoda_evaluare'))
     )}
     ${fieldRow(
       field('Drept de preempțiune', a('drept_preemptiune')),
       field('Non-concurență (ani)', a('non_concurenta'))
     )}`
  );

  const sec6Part1 = section(
    'Scenarii și Revizuire',
    'Ce facem în criză și când revizuim acordul',
    sectionBg, sectionColor,
    `${fieldMulti('Scenariu: pierderi 3 luni consecutive', a('scenariu_pierderi'))}
     ${fieldMulti('Scenariu: dezacord major nerezolvat', a('scenariu_dezacord_major'))}
     ${fieldRow(field('Luna revizuirii anuale', a('data_revizuire_anuala')))}`
  );

  const sec6Part2 = section(
    'Angajamente Parteneri',
    'Angajamentul personal al fiecărui partener față de acest acord',
    sectionBg, sectionColor,
    `<div class="partner-grid">
      <div class="partner-card">
        <div class="partner-card-title" style="color:#1A5C38;">Angajament — ${pA}</div>
        <div class="field-value multiline${!a('angajament_final_a') ? ' empty' : ''}">${a('angajament_final_a') || '&nbsp;'}</div>
      </div>
      <div class="partner-card">
        <div class="partner-card-title" style="color:#1A5C38;">Angajament — ${pB}</div>
        <div class="field-value multiline${!a('angajament_final_b') ? ' empty' : ''}">${a('angajament_final_b') || '&nbsp;'}</div>
      </div>
     </div>`
  );

  const totalPages = 7;
  const pagesHtml = [
    renderPage('01', 'Parteneriatul', 1, totalPages, sec1, titleBand),
    renderPage('01', 'Parteneriatul', 2, totalPages, sec2),
    renderPage('01', 'Parteneriatul', 3, totalPages, sec3),
    renderPage('01', 'Parteneriatul', 4, totalPages, sec4Part1),
    renderPage('01', 'Parteneriatul', 5, totalPages, `${sec4Part2}${sec5}`),
    renderPage('01', 'Parteneriatul', 6, totalPages, sec6Part1),
    renderPage('01', 'Parteneriatul', 7, totalPages, `${sec6Part2}${signatureBlock(pA, pB, a('data_discutie'))}${docFooter()}`)
  ].join('');

  return htmlShell('', pagesHtml, 'Cele 10 Conversații Obligatorii Înainte de Orice Parteneriat');
}

// ─────────────────────────────────────────────────────────────────────────────
// DOCUMENT 2 — Protocol de Ieșire sau Restructurare a Parteneriatului
// ─────────────────────────────────────────────────────────────────────────────

const doc2Steps: DocWizardStep[] = [
  {
    title: 'Identificarea Situației',
    subtitle: 'Care este tipul de parteneriat și care este problema reală',
    questions: [
      {
        id: 'tip_parteneriat',
        label: 'Tipul parteneriatului',
        placeholder: 'selectează sau descrie tipul...',
        type: 'text',
        hint: 'Ex: Ambii activi fără CEO / CEO + Investitor Pasiv / CEO + Partener Operațional / Familie / Inegal / Viziuni Divergente',
      },
      { id: 'descriere_problema', label: 'Problema principală',              placeholder: 'Descrie în 2-3 fraze concrete...', type: 'textarea' },
      { id: 'de_cand_problema',   label: 'De când durează această situație?', placeholder: 'ex: 6 luni, 1 an...', type: 'text' },
      { id: 'ai_incercat',        label: 'Ce ai încercat deja să rezolvi?',  placeholder: 'Listează pașii anteriori...', type: 'textarea' },
    ],
  },
  {
    title: 'Faza 1 — Diagnostic',
    subtitle: 'Confirmă că problema este reală și persistentă',
    questions: [
      { id: 'incident_1',    label: 'Incident concret #1', placeholder: 'Data, ce s-a întâmplat, consecința...', type: 'textarea' },
      { id: 'incident_2',    label: 'Incident concret #2', placeholder: 'Data, ce s-a întâmplat, consecința...', type: 'textarea' },
      { id: 'incident_3',    label: 'Incident concret #3', placeholder: 'Data, ce s-a întâmplat, consecința...', type: 'textarea' },
      { id: 'test_6_luni',   label: 'Test 6 luni: unde va fi afacerea dacă situația rămâne identică?', placeholder: 'Descrie scenariul realist...', type: 'textarea' },
      { id: 'tert_neutru',   label: 'Consultant / mentor terț identificat', placeholder: 'Numele persoanei / firmei', type: 'text' },
    ],
  },
  {
    title: 'Faza 2 — Conversația Directă',
    subtitle: 'Pregătește conversația cu demnitate',
    questions: [
      { id: 'data_conversatiei',  label: 'Data conversației planificate', placeholder: '', type: 'date' },
      { id: 'persoane_prezente',  label: 'Cine va fi prezent?',           placeholder: 'ex: ambii parteneri + mediator', type: 'text' },
      { id: 'mesajul_principal',  label: 'Cum vei deschide conversația?', placeholder: 'Scrie exact ce vei spune (primul paragraf)...', type: 'textarea' },
      { id: 'cele_3_optiuni',     label: 'Cele 3 opțiuni propuse',        placeholder: '1. Restructurare\n2. Răscumpărare\n3. Dizolvare', type: 'textarea' },
      { id: 'termen_raspuns',     label: 'Termen de răspuns acordat (zile)', placeholder: 'ex: 14 zile', type: 'text' },
    ],
  },
  {
    title: 'Faza 3 — Execuție Legală',
    subtitle: 'Separare curată, fără răni deschise',
    questions: [
      { id: 'avocat_contactat',       label: 'Avocatul specializat identificat',                 placeholder: 'Nume / firmă de avocatură', type: 'text' },
      { id: 'data_evaluare',          label: 'Data evaluării independente a afacerii',           placeholder: '', type: 'date' },
      { id: 'valoare_estimata',       label: 'Valoarea estimată a afacerii (RON/€)',             placeholder: 'ex: 350.000 RON', type: 'text' },
      { id: 'plan_tranzitie_zile',    label: 'Durata planului de tranziție (zile)',              placeholder: 'ex: 60 de zile', type: 'text' },
      { id: 'comunicare_angajati',    label: 'Mesajul planificat pentru angajați',              placeholder: 'Schița mesajului...', type: 'textarea' },
      { id: 'comunicare_clienti',     label: 'Mesajul planificat pentru clienți cheie',         placeholder: 'Schița mesajului...', type: 'textarea' },
      { id: 'data_finalizare',        label: 'Data țintă pentru finalizarea separării',          placeholder: '', type: 'date' },
    ],
  },
];

function generateDoc2(answers: Record<string, string>): string {
  const a = (k: string) => ans(answers, k);

  const sectionBg = '#f9eded';
  const sectionColor = '#8B1A1A';

  const titleBand = `
    <div class="title-band" style="background: linear-gradient(135deg, #6b1010 0%, #8B1A1A 60%, #a82020 100%);">
      <div class="doc-num">DOCUMENT 02</div>
      <h1>Protocol de Ieșire sau<br/>Restructurare a Parteneriatului</h1>
      <span class="topic-tag">Parteneriatul</span>
    </div>`;

  const sec1 = section(
    'Identificarea Situației',
    'Care este tipul de parteneriat și care este problema reală',
    sectionBg, sectionColor,
    `${fieldRow(
       field('Tipul parteneriatului', a('tip_parteneriat'), 'Ex: Ambii activi fără CEO / CEO + Investitor Pasiv / Familie / Viziuni Divergente'),
       field('Durata problemei', a('de_cand_problema'))
     )}
     ${fieldMulti('Problema principală', a('descriere_problema'))}
     ${fieldMulti('Ce ai încact deja?', a('ai_incercat'))}`
  );

  const sec2Part1 = section(
    'Faza 1 — Diagnostic (Partea 1)',
    'Confirmă că problema este reală și persistentă — Incidente',
    sectionBg, sectionColor,
    `${fieldMulti('Incident concret #1 (dată, ce s-a întâmplat, consecință)', a('incident_1'))}
     ${fieldMulti('Incident concret #2', a('incident_2'))}`
  );

  const sec2Part2 = section(
    'Faza 1 — Diagnostic (Partea 2)',
    'Analiza pe termen lung și sprijin extern',
    sectionBg, sectionColor,
    `${fieldMulti('Incident concret #3', a('incident_3'))}
     ${fieldMulti('Test 6 luni: unde va fi afacerea dacă nimic nu se schimbă?', a('test_6_luni'))}
     ${fieldRow(field('Consultant / mentor terț identificat', a('tert_neutru')))}`
  );

  const sec3 = section(
    'Faza 2 — Conversația Directă',
    'Pregătește conversația cu demnitate',
    sectionBg, sectionColor,
    `${fieldRow(
       field('Data conversației', a('data_conversatiei')),
       field('Persoane prezente', a('persoane_prezente')),
       field('Termen de răspuns (zile)', a('termen_raspuns'))
     )}
     ${fieldMulti('Cum deschizi conversația? (exact ce vei spune)', a('mesajul_principal'))}
     ${fieldMulti('Cele 3 opțiuni propuse (Restructurare / Răscumpărare / Dizolvare)', a('cele_3_optiuni'))}`
  );

  const sec4 = section(
    'Faza 3 — Execuție Legală',
    'Separare curată, fără răni deschise',
    sectionBg, sectionColor,
    `${fieldRow(
       field('Avocatul specializat', a('avocat_contactat')),
       field('Data evaluării afacerii', a('data_evaluare')),
       field('Valoarea estimată', a('valoare_estimata'))
     )}
     ${fieldRow(
       field('Durata tranziției (zile)', a('plan_tranzitie_zile')),
       field('Data finalizării separării', a('data_finalizare'))
     )}
     ${fieldMulti('Mesajul pentru angajați', a('comunicare_angajati'))}
     ${fieldMulti('Mesajul pentru clienți cheie', a('comunicare_clienti'))}`
  );

  const totalPages = 5;
  const pagesHtml = [
    renderPage('02', 'Parteneriatul', 1, totalPages, sec1, titleBand),
    renderPage('02', 'Parteneriatul', 2, totalPages, sec2Part1),
    renderPage('02', 'Parteneriatul', 3, totalPages, sec2Part2),
    renderPage('02', 'Parteneriatul', 4, totalPages, sec3),
    renderPage('02', 'Parteneriatul', 5, totalPages, `${sec4}${signatureBlock('Inițiatorul protocolului', 'Partenerul notificat', a('data_conversatiei'))}${docFooter()}`)
  ].join('');

  return htmlShell('', pagesHtml, 'Protocol de Ieșire sau Restructurare a Parteneriatului');
}

// ─────────────────────────────────────────────────────────────────────────────
// DOCUMENT 3 — Acord de Parteneriat Minimal
// ─────────────────────────────────────────────────────────────────────────────

const doc3Steps: DocWizardStep[] = [
  {
    title: 'Identitatea Partenerilor',
    subtitle: 'Cine semnează acest acord',
    questions: [
      { id: 'partener_a_nume', label: 'Numele Partenerului A', placeholder: 'ex: Ion Popescu', type: 'text' },
      { id: 'partener_a_rol',  label: 'Rolul propus al Partenerului A', placeholder: 'ex: CEO / Fondator', type: 'text' },
      { id: 'partener_b_nume', label: 'Numele Partenerului B', placeholder: 'ex: Maria Ionescu', type: 'text' },
      { id: 'partener_b_rol',  label: 'Rolul propus al Partenerului B', placeholder: 'ex: COO / Co-fondator', type: 'text' },
      { id: 'afacere_nume',    label: 'Numele afacerii', placeholder: 'ex: Firma SRL', type: 'text' },
      { id: 'data_semnarii',   label: 'Data semnării', placeholder: '', type: 'date' },
    ],
  },
  {
    title: 'Clauza 1 — CEO și Conducerea',
    subtitle: 'Cine are decizia finală',
    questions: [
      { id: 'ceo_este',    label: 'CEO-ul afacerii',                                            placeholder: 'Partenerul A sau B?', type: 'text' },
      { id: 'veto_suma',   label: 'Investiții care necesită acordul ambilor (prag RON)',         placeholder: 'ex: 10.000 RON', type: 'text' },
      { id: 'veto_alte',   label: 'Alte decizii care necesită acordul ambilor parteneri',       placeholder: 'Lista deciziilor...', type: 'textarea' },
    ],
  },
  {
    title: 'Clauza 2 — Contribuția',
    subtitle: 'Ce aduce fiecare partener',
    questions: [
      { id: 'capital_a',     label: 'Capital investit — Partener A (RON)',  placeholder: 'ex: 30.000 RON', type: 'text' },
      { id: 'timp_a',        label: 'Ore/săptămână — Partener A',           placeholder: 'ex: 40', type: 'text' },
      { id: 'expertiza_a',   label: 'Expertiză / active — Partener A',      placeholder: 'ex: experiență vânzări B2B, rețea clienți', type: 'text' },
      { id: 'capital_b',     label: 'Capital investit — Partener B (RON)',  placeholder: 'ex: 30.000 RON', type: 'text' },
      { id: 'timp_b',        label: 'Ore/săptămână — Partener B',           placeholder: 'ex: 20', type: 'text' },
      { id: 'expertiza_b',   label: 'Expertiză / active — Partener B',      placeholder: 'ex: tehnologie, produs', type: 'text' },
      { id: 'profit_a_pct',  label: '% profit — Partener A',                placeholder: 'ex: 50%', type: 'text' },
      { id: 'profit_b_pct',  label: '% profit — Partener B',                placeholder: 'ex: 50%', type: 'text' },
    ],
  },
  {
    title: 'Clauza 3 — Ieșirea',
    subtitle: 'Cum plecăm decent dacă ajungem acolo',
    questions: [
      { id: 'preaviz_zile',         label: 'Preaviz minim pentru intenția de ieșire (zile)', placeholder: 'ex: 90 zile', type: 'text' },
      { id: 'buyback_zile',         label: 'Termen de răscumpărare după notificare (zile)',  placeholder: 'ex: 60 zile', type: 'text' },
      { id: 'non_concurenta_ani',   label: 'Clauza de non-concurență (ani)',                 placeholder: 'ex: 2 ani', type: 'text' },
      { id: 'metoda_evaluare',      label: 'Metoda de evaluare la ieșire',                   placeholder: 'ex: expert contabil independent', type: 'text' },
    ],
  },
  {
    title: 'Clauza 4 — Pierderi și Criză',
    subtitle: 'Ce facem dacă afacerea pierde bani 3 luni',
    questions: [
      { id: 'injectie_zile',            label: 'Termen pentru injectare capital suplimentar (zile)', placeholder: 'ex: 30 zile', type: 'text' },
      { id: 'reducere_cheltuieli_pct',  label: 'Reducere minimă cheltuieli fixe (%)',                placeholder: 'ex: 20%', type: 'text' },
      { id: 'protocol_neacord',         label: 'Ce se întâmplă dacă nu ajungem la acord în 30 de zile?', placeholder: 'ex: activăm clauza de ieșire...', type: 'textarea' },
    ],
  },
  {
    title: 'Clauzele 5 & 6 — Remunerație și Revizuire',
    subtitle: 'Bani și calendar',
    questions: [
      { id: 'salariu_a',          label: 'Salariu lunar — Partener A (RON)',   placeholder: 'ex: 8.000 RON net', type: 'text' },
      { id: 'salariu_b',          label: 'Salariu lunar — Partener B (RON)',   placeholder: 'ex: 6.000 RON net', type: 'text' },
      { id: 'dividend_frecventa', label: 'Dividende distribuite',              placeholder: 'ex: trimestrial', type: 'text' },
      { id: 'luna_revizuire',     label: 'Luna revizuirii anuale',             placeholder: 'ex: Ianuarie', type: 'text' },
      { id: 'angajament_a',       label: 'Angajamentul personal al Partenerului A', placeholder: 'Scrie angajamentul tău...', type: 'textarea' },
      { id: 'angajament_b',       label: 'Angajamentul personal al Partenerului B', placeholder: 'Scrie angajamentul tău...', type: 'textarea' },
    ],
  },
];

function generateDoc3(answers: Record<string, string>): string {
  const a = (k: string) => ans(answers, k);
  const pA = a('partener_a_nume') || 'Partener A';
  const pB = a('partener_b_nume') || 'Partener B';

  const sectionBg = '#fdf6ea';
  const sectionColor = '#7a5010';

  const doc3ExtraStyles = `
    .title-band-doc3 {
      padding: 22px 28px 20px;
      background: linear-gradient(135deg, #3a2005 0%, #7a5010 50%, #C9A96E 100%);
      color: white;
    }
    .clause-badge {
      display: inline-block;
      background: var(--gold);
      color: var(--ink);
      font-family: 'Aboreto', serif;
      font-size: 9px;
      letter-spacing: 2px;
      padding: 3px 10px;
      border-radius: 2px;
      margin-bottom: 6px;
    }
  `;

  const titleBand = `
    <div class="title-band title-band-doc3">
      <div class="doc-num">DOCUMENT 03</div>
      <h1>Acord de Parteneriat Minimal</h1>
      <span class="topic-tag">Parteneriatul</span>
    </div>`;

  const sec1 = section(
    'Identitatea Partenerilor',
    'Cine semnează acest acord',
    sectionBg, sectionColor,
    `<div class="partner-grid">
      <div class="partner-card">
        <div class="partner-card-title" style="color:#7a5010;">Partener A</div>
        ${field('Nume', pA)}
        ${field('Rol', a('partener_a_rol'))}
      </div>
      <div class="partner-card">
        <div class="partner-card-title" style="color:#7a5010;">Partener B</div>
        ${field('Nume', pB)}
        ${field('Rol', a('partener_b_rol'))}
      </div>
    </div>
    ${fieldRow(
      field('Afacerea', a('afacere_nume')),
      field('Data semnării', a('data_semnarii'))
    )}`
  );

  const sec2 = section(
    'Clauza 1 — CEO și Conducerea',
    'Cine are decizia finală',
    sectionBg, sectionColor,
    `${fieldRow(
       field('CEO-ul afacerii', a('ceo_este')),
       field('Prag investiții — acord bilateral (RON)', a('veto_suma'))
     )}
     ${fieldMulti('Alte decizii care necesită acordul ambilor parteneri', a('veto_alte'))}`
  );

  const sec3 = section(
    'Clauza 2 — Contribuția',
    'Ce aduce fiecare partener',
    sectionBg, sectionColor,
    `<div class="partner-grid">
      <div class="partner-card">
        <div class="partner-card-title" style="color:#7a5010;">Partener A — ${pA}</div>
        ${field('Capital investit', a('capital_a'))}
        ${field('Ore/săptămână', a('timp_a'))}
        ${field('Expertiză / active', a('expertiza_a'))}
        ${field('% profit', a('profit_a_pct'))}
      </div>
      <div class="partner-card">
        <div class="partner-card-title" style="color:#7a5010;">Partener B — ${pB}</div>
        ${field('Capital investit', a('capital_b'))}
        ${field('Ore/săptămână', a('timp_b'))}
        ${field('Expertiză / active', a('expertiza_b'))}
        ${field('% profit', a('profit_b_pct'))}
      </div>
    </div>`
  );

  const sec4 = section(
    'Clauza 3 — Ieșirea',
    'Cum plecăm decent dacă ajungem acolo',
    sectionBg, sectionColor,
    `${fieldRow(
       field('Preaviz minim (zile)', a('preaviz_zile')),
       field('Termen răscumpărare (zile)', a('buyback_zile'))
     )}
     ${fieldRow(
       field('Non-concurență (ani)', a('non_concurenta_ani')),
       field('Metoda de evaluare la ieșire', a('metoda_evaluare'))
     )}`
  );

  const sec5 = section(
    'Clauza 4 — Pierderi și Criză',
    'Ce facem dacă afacerea pierde bani 3 luni consecutive',
    sectionBg, sectionColor,
    `${fieldRow(
       field('Termen injectare capital (zile)', a('injectie_zile')),
       field('Reducere cheltuieli fixe (%)', a('reducere_cheltuieli_pct'))
     )}
     ${fieldMulti('Protocol neacord (dacă nu ajungem la acord în 30 de zile)', a('protocol_neacord'))}`
  );

  const sec6Part1 = section(
    'Clauza 5 — Remunerație și Revizuire',
    'Bani și calendar',
    sectionBg, sectionColor,
    `<div class="partner-grid">
      <div class="partner-card">
        <div class="partner-card-title" style="color:#7a5010;">Remunerație — ${pA}</div>
        ${field('Salariu lunar', a('salariu_a'))}
      </div>
      <div class="partner-card">
        <div class="partner-card-title" style="color:#7a5010;">Remunerație — ${pB}</div>
        ${field('Salariu lunar', a('salariu_b'))}
      </div>
    </div>
    ${fieldRow(
      field('Frecvența dividendelor', a('dividend_frecventa')),
      field('Luna revizuirii anuale', a('luna_revizuire'))
    )}`
  );

  const sec6Part2 = section(
    'Clauza 6 — Angajamente Parteneri',
    'Angajamentul personal al fiecărui partener față de acest acord',
    sectionBg, sectionColor,
    `<div class="partner-grid">
      <div class="partner-card">
        <div class="partner-card-title" style="color:#7a5010;">Angajament — ${pA}</div>
        <div class="field-value multiline${!a('angajament_a') ? ' empty' : ''}">${a('angajament_a') || '&nbsp;'}</div>
      </div>
      <div class="partner-card">
        <div class="partner-card-title" style="color:#7a5010;">Angajament — ${pB}</div>
        <div class="field-value multiline${!a('angajament_b') ? ' empty' : ''}">${a('angajament_b') || '&nbsp;'}</div>
      </div>
     </div>`
  );

  const totalPages = 4;
  const pagesHtml = [
    renderPage('03', 'Parteneriatul', 1, totalPages, `${sec1}${sec2}`, titleBand),
    renderPage('03', 'Parteneriatul', 2, totalPages, sec3),
    renderPage('03', 'Parteneriatul', 3, totalPages, `${sec4}${sec5}`),
    renderPage('03', 'Parteneriatul', 4, totalPages, `${sec6Part1}${sec6Part2}${signatureBlock(pA, pB, a('data_semnarii'))}<div style="margin-top:14px;padding:10px 14px;background:#fdf6ea;border:1px solid #e8d5a8;border-radius:4px;font-size:10.5px;color:#7a5010;line-height:1.6;"><strong>Notă legală:</strong> Acest acord pre-legal nu înlocuiește actele constitutive sau un contract notarial. Recomandăm consultarea unui avocat înainte de semnarea documentelor oficiale.</div>${docFooter()}`)
  ].join('');

  return htmlShell(doc3ExtraStyles, pagesHtml, 'Acord de Parteneriat Minimal');
}

// ─────────────────────────────────────────────────────────────────────────────
// DOCUMENT 4 — SOP · Procedură Standard
// ─────────────────────────────────────────────────────────────────────────────

const doc4Steps: DocWizardStep[] = [
  {
    title: 'Identificare',
    subtitle: 'Titlu, responsabil, versiune',
    questions: [
      { id: 'sop_cod',         label: 'Cod / număr SOP',          placeholder: 'ex: SOP-001',                       type: 'text' },
      { id: 'sop_titlu',       label: 'Titlul procesului',         placeholder: 'ex: Producerea unei lecții',        type: 'text' },
      { id: 'sop_responsabil', label: 'Responsabil principal',     placeholder: 'ex: Nume Prenume',                  type: 'text' },
      { id: 'sop_functie',     label: 'Funcția în care se înscrie', placeholder: 'ex: Producție / Serviciu',         type: 'text' },
      { id: 'sop_versiune',    label: 'Versiunea documentului',    placeholder: 'ex: v1.0',                          type: 'text' },
      { id: 'sop_data',        label: 'Data emiterii',             placeholder: '',                                  type: 'date' },
    ],
  },
  {
    title: 'Scopul',
    subtitle: 'De ce există procesul și ce rezultat asigură',
    questions: [
      { id: 'sop_scop', label: 'Scopul (1–2 fraze)', placeholder: 'De ce există procesul. Ce rezultat asigură.', type: 'textarea' },
      { id: 'sop_tip',  label: 'Tipul SOP (Liniar / Decizional)', placeholder: 'ex: Liniar', type: 'text' },
    ],
  },
  {
    title: 'Roluri implicate',
    subtitle: 'NU numele — rolurile',
    questions: [
      { id: 'sop_roluri', label: 'Lista rolurilor implicate (unul pe linie)', placeholder: 'Coordonator producție\nEditor video\nDesigner\n...', type: 'textarea' },
    ],
  },
  {
    title: 'Pașii procesului',
    subtitle: 'Nr · Responsabil · Acțiunea · Output (până la 10 pași)',
    questions: [
      { id: 'sop_pas1',  label: 'Pasul 1',  placeholder: 'Resp: ... — Acțiunea: ... — Output: ...', type: 'textarea' },
      { id: 'sop_pas2',  label: 'Pasul 2',  placeholder: 'Resp: ... — Acțiunea: ... — Output: ...', type: 'textarea' },
      { id: 'sop_pas3',  label: 'Pasul 3',  placeholder: 'Resp: ... — Acțiunea: ... — Output: ...', type: 'textarea' },
      { id: 'sop_pas4',  label: 'Pasul 4',  placeholder: 'Resp: ... — Acțiunea: ... — Output: ...', type: 'textarea' },
      { id: 'sop_pas5',  label: 'Pasul 5',  placeholder: 'Resp: ... — Acțiunea: ... — Output: ...', type: 'textarea' },
      { id: 'sop_pas6',  label: 'Pasul 6 (opțional)', placeholder: 'Resp: ... — Acțiunea: ... — Output: ...', type: 'textarea' },
      { id: 'sop_pas7',  label: 'Pasul 7 (opțional)', placeholder: 'Resp: ... — Acțiunea: ... — Output: ...', type: 'textarea' },
      { id: 'sop_pas8',  label: 'Pasul 8 (opțional)', placeholder: 'Resp: ... — Acțiunea: ... — Output: ...', type: 'textarea' },
      { id: 'sop_pas9',  label: 'Pasul 9 (opțional)', placeholder: 'Resp: ... — Acțiunea: ... — Output: ...', type: 'textarea' },
      { id: 'sop_pas10', label: 'Pasul 10 (opțional)', placeholder: 'Resp: ... — Acțiunea: ... — Output: ...', type: 'textarea' },
    ],
  },
  {
    title: 'Criteriul de calitate',
    subtitle: 'Cum confirmi că procesul a mers bine',
    questions: [
      { id: 'sop_calitate', label: 'Criteriul de calitate (2–3 condiții obiective)', placeholder: '1. Deadline respectat\n2. Output validat de coordonator\n3. Fără greșeli majore', type: 'textarea' },
      { id: 'sop_observatii', label: 'Observații / excepții (opțional)', placeholder: 'Cazuri speciale, excepții, note adiționale...', type: 'textarea' },
    ],
  },
];

function generateDoc4(answers: Record<string, string>): string {
  const a = (k: string) => ans(answers, k);

  const sectionBg = '#eaf3ed';
  const sectionColor = '#1A5C38';

  const titleBand = `
    <div class="title-band" style="background: linear-gradient(135deg, #1A5C38 0%, #2a7a4f 100%);">
      <div class="doc-num">DOCUMENT 04 · ${a('sop_cod') || 'SOP'}</div>
      <h1>${a('sop_titlu') || 'Procedură Standard de Operare'}</h1>
      <span class="topic-tag">Instalațiile · Procese</span>
    </div>`;

  const secIdentificare = section(
    'Identificare',
    'Titlu, responsabil, versiune',
    sectionBg, sectionColor,
    `${fieldRow(
        field('Cod / număr SOP', a('sop_cod')),
        field('Versiune', a('sop_versiune')),
        field('Data emiterii', a('sop_data'))
      )}
      ${fieldRow(
        field('Titlul procesului', a('sop_titlu')),
      )}
      ${fieldRow(
        field('Responsabil principal', a('sop_responsabil')),
        field('Funcția', a('sop_functie')),
        field('Tipul SOP', a('sop_tip'))
      )}`
  );

  const secScop = section(
    'Scopul',
    'De ce există procesul și ce rezultat asigură',
    sectionBg, sectionColor,
    `${fieldMulti('Scop', a('sop_scop'))}`
  );

  const secRoluri = section(
    'Roluri implicate',
    'Nu persoanele — rolurile care execută procesul',
    sectionBg, sectionColor,
    `${fieldMulti('Rolurile implicate', a('sop_roluri'))}`
  );

  // Build the steps list — only render non-empty
  const stepIds = ['sop_pas1','sop_pas2','sop_pas3','sop_pas4','sop_pas5','sop_pas6','sop_pas7','sop_pas8','sop_pas9','sop_pas10'];
  const stepBlocks = stepIds
    .map((id, idx) => ({ idx: idx + 1, val: a(id) }))
    .filter(s => s.val !== '')
    .map(s => `
      <div style="display:flex;gap:12px;margin-bottom:10px;padding:10px 12px;border:1px solid var(--line);border-radius:4px;background:var(--paper-dark);">
        <div style="flex-shrink:0;width:28px;height:28px;border-radius:50%;background:#1A5C38;color:#fff;display:flex;align-items:center;justify-content:center;font-family:'Aboreto',serif;font-size:11px;">${s.idx}</div>
        <div style="flex:1;font-size:12.5px;line-height:1.55;white-space:pre-wrap;color:var(--ink);">${s.val}</div>
      </div>`)
    .join('');

  const stepsContent = stepBlocks || `<div class="field-value multiline empty">&nbsp;</div>`;

  const secPasi = section(
    'Pașii procesului',
    'Nr · Responsabil · Acțiunea · Output',
    sectionBg, sectionColor,
    stepsContent
  );

  const secCalitate = section(
    'Criteriul de calitate',
    'Cum confirmi că procesul a mers bine',
    sectionBg, sectionColor,
    `${fieldMulti('Criteriul de calitate', a('sop_calitate'))}
     ${a('sop_observatii') ? fieldMulti('Observații / excepții', a('sop_observatii')) : ''}`
  );

  const secSemnatura = `
    <div class="signature-block">
      <div class="sig-title">Aprobat și pus în aplicare</div>
      <div class="sig-row">
        <div class="sig-col">
          <div class="sig-name-line"></div>
          <div class="sig-label">${a('sop_responsabil') || 'Responsabil proces'}</div>
        </div>
        <div class="sig-col">
          <div class="sig-name-line"></div>
          <div class="sig-label">CEO / Manager</div>
        </div>
      </div>
      <div class="sig-date-row">
        <div style="flex:1;">
          <div class="sig-date-field" style="padding-top:4px;font-size:12px;color:#555;">${a('sop_data') || ''}</div>
          <div class="sig-date-label">Data emiterii</div>
        </div>
        <div style="flex:1;">
          <div class="sig-date-field" style="padding-top:4px;font-size:12px;color:#555;">${a('sop_versiune') || ''}</div>
          <div class="sig-date-label">Versiune</div>
        </div>
      </div>
    </div>`;

  const totalPages = 3;
  const pagesHtml = [
    renderPage('04', 'Instalațiile', 1, totalPages, `${secIdentificare}${secScop}${secRoluri}`, titleBand),
    renderPage('04', 'Instalațiile', 2, totalPages, secPasi),
    renderPage('04', 'Instalațiile', 3, totalPages, `${secCalitate}${secSemnatura}${docFooter()}`),
  ].join('');

  return htmlShell('', pagesHtml, `${a('sop_cod') || 'SOP'} · ${a('sop_titlu') || 'Procedură Standard'}`);
}


// ─────────────────────────────────────────────────────────────────────────────
// DOCUMENT 5 — Fișă de Post
// ─────────────────────────────────────────────────────────────────────────────

const doc5Steps: DocWizardStep[] = [
  {
    title: 'Identificare rol',
    subtitle: 'Cine, unde, când',
    questions: [
      { id: 'fp_firma',          label: 'Numele firmei',         placeholder: 'ex: Firma SRL',                       type: 'text' },
      { id: 'fp_versiune',       label: 'Versiunea',             placeholder: 'ex: v1.0',                            type: 'text' },
      { id: 'fp_data',           label: 'Data emiterii',         placeholder: '',                                    type: 'date' },
      { id: 'fp_titlu',          label: 'Titlul rolului',        placeholder: 'ex: Director Marketing și Comunitate', type: 'text' },
      { id: 'fp_departament',    label: 'Departamentul',         placeholder: 'ex: Marketing și Vânzări',            type: 'text' },
      { id: 'fp_raporteaza',     label: 'Raportează către',      placeholder: 'ex: CEO',                             type: 'text' },
      { id: 'fp_loc',            label: 'Locul de muncă',        placeholder: 'ex: Remote / Hibrid / Sediu',         type: 'text' },
      { id: 'fp_data_vigoare',   label: 'Data intrării în vigoare', placeholder: '',                                 type: 'date' },
      { id: 'fp_tip_angajare',   label: 'Tip angajare',          placeholder: 'ex: Full-time / Part-time',           type: 'text' },
    ],
  },
  {
    title: '1 · Scopul rolului',
    subtitle: 'De ce există acest rol în firmă (2–3 fraze)',
    questions: [
      { id: 'fp_scop', label: 'Scopul rolului', placeholder: 'Rolul există pentru a...', type: 'textarea' },
    ],
  },
  {
    title: '2 · Produsul rolului',
    subtitle: 'Ce produce concret și măsurabil (substantive, nu verbe)',
    questions: [
      { id: 'fp_produs', label: 'Produsele rolului (unul pe linie)', placeholder: '1. ...\n2. ...\n3. ...\n4. ...', type: 'textarea' },
    ],
  },
  {
    title: '3 · Criteriul de evaluare',
    subtitle: 'Cum știi că și-a făcut bine treaba',
    questions: [
      { id: 'fp_evaluare', label: 'Criterii de evaluare (unul pe linie)', placeholder: '1. ...\n2. ...\n3. ...', type: 'textarea' },
    ],
  },
  {
    title: '4 · Cum lucrează',
    subtitle: 'Fluxul de input / output al rolului',
    questions: [
      { id: 'fp_primeste',    label: 'Primește de la',  placeholder: 'De la cine și ce primește...',  type: 'textarea' },
      { id: 'fp_coordoneaza', label: 'Coordonează',     placeholder: 'Pe cine coordonează și ce...',  type: 'textarea' },
      { id: 'fp_preda',       label: 'Predă către',     placeholder: 'Către cine și ce livrează...',  type: 'textarea' },
      { id: 'fp_colaboreaza', label: 'Colaborează cu',  placeholder: 'Cu cine colaborează...',         type: 'textarea' },
      { id: 'fp_raporteaza_cum', label: 'Raportează',   placeholder: 'Către cine, când și cum...',     type: 'textarea' },
    ],
  },
  {
    title: '5 · Studii și experiență',
    subtitle: 'Cerințele minime pentru rol',
    questions: [
      { id: 'fp_studii',          label: 'Nivel de studii',          placeholder: 'ex: Studii superioare finalizate...', type: 'text' },
      { id: 'fp_experienta',      label: 'Experiență minimă',         placeholder: 'ex: Minim 2 ani...',                  type: 'text' },
      { id: 'fp_cunostinte',      label: 'Cunoștințe tehnice specifice', placeholder: 'Liste de tooluri, platforme...',    type: 'textarea' },
      { id: 'fp_certificari',     label: 'Certificări (dacă există)', placeholder: 'ex: Nu sunt obligatorii. ... avantaj.', type: 'text' },
    ],
  },
  {
    title: '6 · Condiții de muncă',
    subtitle: 'Programul, tools, deplasări',
    questions: [
      { id: 'fp_loc_munca',   label: 'Locul de muncă',        placeholder: 'Remote / Hibrid / detaliile...',  type: 'text' },
      { id: 'fp_program',     label: 'Programul de lucru',    placeholder: 'ex: Full-time, program flexibil...', type: 'text' },
      { id: 'fp_tools',       label: 'Tooluri și platforme',  placeholder: 'ex: Instagram, CapCut, Drive...', type: 'textarea' },
      { id: 'fp_deplasari',   label: 'Deplasări / alte condiții', placeholder: 'Sesiuni lunare în..., deplasări ocazionale...', type: 'textarea' },
    ],
  },
  {
    title: '7 · Calitățile necesare',
    subtitle: '6 calități cheie cu scurtă descriere',
    questions: [
      { id: 'fp_calitati', label: 'Calități (una pe linie, format: Calitate — descriere scurtă)', placeholder: '1. Autonomie — inițiază și execută fără confirmare constantă.\n2. Creativitate practică — ...\n3. ...', type: 'textarea' },
    ],
  },
  {
    title: '8 · Salariul',
    subtitle: 'Componenta fixă, variabilă, condiția de bonus',
    questions: [
      { id: 'fp_salariu_fix',    label: 'Componenta fixă (lunar)',   placeholder: 'ex: [sumă] EUR — echivalent în MDL/RON',  type: 'text' },
      { id: 'fp_salariu_var',    label: 'Componenta variabilă',       placeholder: 'ex: [sumă] EUR condiționat de KPI...',   type: 'text' },
      { id: 'fp_bonus_conditie', label: 'Condiția de bonus',          placeholder: 'ex: Ambii KPI atinși (minim 85%) timp de 2 luni...', type: 'textarea' },
      { id: 'fp_plata',          label: 'Modalitate de plată',        placeholder: 'ex: Transfer bancar până pe data de 5...', type: 'text' },
    ],
  },
  {
    title: '9 · KPI-ul rolului',
    subtitle: 'Maxim 3 indicatori — fiecare cu target și interval',
    questions: [
      { id: 'fp_kpi1', label: 'KPI 1', placeholder: 'Indicator — Target — Interval (ex: Rata aderenței calendar — Minim 85% — Lunar)', type: 'textarea' },
      { id: 'fp_kpi2', label: 'KPI 2', placeholder: 'Indicator — Target — Interval', type: 'textarea' },
      { id: 'fp_kpi3', label: 'KPI 3 (opțional)', placeholder: 'Indicator — Target — Interval', type: 'textarea' },
    ],
  },
  {
    title: '10 · Limitele de autoritate',
    subtitle: 'Ce decide singur vs ce escaladează',
    questions: [
      { id: 'fp_decide',     label: 'Decide singur (unul pe linie)',         placeholder: '1. ...\n2. ...\n3. ...', type: 'textarea' },
      { id: 'fp_escaladeaza', label: 'Escaladează către CEO (unul pe linie)', placeholder: '1. ...\n2. ...\n3. ...', type: 'textarea' },
    ],
  },
  {
    title: '11 · Resurse la dispoziție',
    subtitle: 'Acces, buget, echipamente',
    questions: [
      { id: 'fp_acces',      label: 'Acces la sisteme și conturi', placeholder: 'Liste conturi și platforme...',        type: 'textarea' },
      { id: 'fp_buget',      label: 'Buget la dispoziție',         placeholder: 'ex: [sumă] EUR lunar pentru...',       type: 'textarea' },
      { id: 'fp_echipamente', label: 'Echipamente',                placeholder: 'ex: Laptop personal. Echipament foto-video...', type: 'textarea' },
      { id: 'fp_alte_resurse', label: 'Alte resurse',              placeholder: 'ex: Bibliotecă de conținut, brand guidelines...', type: 'textarea' },
    ],
  },
];

function generateDoc5(answers: Record<string, string>): string {
  const a = (k: string) => ans(answers, k);
  const sectionBg = '#eaf3ed';
  const sectionColor = '#1A5C38';

  const firma = a('fp_firma') || '[Numele firmei]';
  const versiune = a('fp_versiune') || 'v1.0';
  const data = a('fp_data') || '';

  const titleBand = `
    <div class="title-band" style="background: linear-gradient(135deg, #1A5C38 0%, #2a7a4f 100%);">
      <div class="doc-num">DOCUMENT 05 · FIȘĂ DE POST</div>
      <h1>${a('fp_titlu') || 'Fișă de Post'}</h1>
      <span class="topic-tag">${firma} · ${versiune}${data ? ' · ' + data : ''}</span>
    </div>`;

  const secIdent = section(
    'Identificare rol',
    'Cine, unde, când',
    sectionBg, sectionColor,
    `${fieldRow(
        field('Titlul rolului', a('fp_titlu')),
        field('Departamentul', a('fp_departament')),
      )}
      ${fieldRow(
        field('Raportează către', a('fp_raporteaza')),
        field('Locul de muncă', a('fp_loc')),
      )}
      ${fieldRow(
        field('Data intrării în vigoare', a('fp_data_vigoare')),
        field('Tip angajare', a('fp_tip_angajare')),
      )}`
  );

  const secScop = section('1 · Scopul rolului', 'De ce există acest rol', sectionBg, sectionColor,
    `${fieldMulti('Scopul rolului', a('fp_scop'))}`);

  const secProdus = section('2 · Produsul rolului', 'Ce produce concret și măsurabil', sectionBg, sectionColor,
    `${fieldMulti('Produsele rolului', a('fp_produs'))}`);

  const secEval = section('3 · Criteriul de evaluare', 'Cum știi că și-a făcut bine treaba', sectionBg, sectionColor,
    `${fieldMulti('Criterii de evaluare', a('fp_evaluare'))}`);

  const secLucru = section('4 · Cum lucrează', 'Fluxul de input / output al rolului', sectionBg, sectionColor,
    `${fieldMulti('Primește de la', a('fp_primeste'))}
     ${fieldMulti('Coordonează', a('fp_coordoneaza'))}
     ${fieldMulti('Predă către', a('fp_preda'))}
     ${fieldMulti('Colaborează cu', a('fp_colaboreaza'))}
     ${fieldMulti('Raportează', a('fp_raporteaza_cum'))}`);

  const secStudii = section('5 · Studii și experiență necesare', undefined, sectionBg, sectionColor,
    `${fieldRow(field('Nivel de studii', a('fp_studii')))}
     ${fieldRow(field('Experiență minimă', a('fp_experienta')))}
     ${fieldMulti('Cunoștințe tehnice specifice', a('fp_cunostinte'))}
     ${fieldRow(field('Certificări', a('fp_certificari')))}`);

  const secCond = section('6 · Condiții de muncă', undefined, sectionBg, sectionColor,
    `${fieldRow(
        field('Locul de muncă', a('fp_loc_munca')),
        field('Programul', a('fp_program')),
      )}
     ${fieldMulti('Tooluri și platforme', a('fp_tools'))}
     ${fieldMulti('Deplasări / alte condiții', a('fp_deplasari'))}`);

  const secCalit = section('7 · Calitățile necesare rolului', '6 calități cheie cu descriere scurtă', sectionBg, sectionColor,
    `${fieldMulti('Calitățile necesare', a('fp_calitati'))}`);

  const secSalariu = section('8 · Salariul', undefined, sectionBg, sectionColor,
    `${fieldRow(
        field('Componenta fixă (lunar)', a('fp_salariu_fix')),
        field('Componenta variabilă', a('fp_salariu_var')),
      )}
     ${fieldMulti('Condiția de bonus', a('fp_bonus_conditie'))}
     ${fieldRow(field('Modalitate de plată', a('fp_plata')))}`);

  const kpiRows = ['fp_kpi1','fp_kpi2','fp_kpi3']
    .map((id, idx) => ({ idx: idx + 1, val: a(id) }))
    .filter(s => s.val !== '')
    .map(s => `
      <div style="display:flex;gap:12px;margin-bottom:8px;padding:10px 12px;border:1px solid var(--line);border-radius:4px;background:var(--paper-dark);">
        <div style="flex-shrink:0;width:24px;height:24px;border-radius:50%;background:#1A5C38;color:#fff;display:flex;align-items:center;justify-content:center;font-family:'Aboreto',serif;font-size:10px;">${s.idx}</div>
        <div style="flex:1;font-size:12px;line-height:1.5;white-space:pre-wrap;color:var(--ink);">${s.val}</div>
      </div>`).join('');
  const secKpi = section('9 · KPI-ul rolului', 'Maxim 3 indicatori — fiecare cu target și interval', sectionBg, sectionColor,
    kpiRows || `<div class="field-value multiline empty">&nbsp;</div>`);

  const secLimite = section('10 · Limitele de autoritate', 'Decide singur vs escaladează', sectionBg, sectionColor,
    `<div class="partner-grid">
       <div class="partner-card">
         <div class="partner-card-title" style="color:#1A5C38;">Decide singur</div>
         <div class="field-value multiline${!a('fp_decide') ? ' empty' : ''}">${a('fp_decide') || '&nbsp;'}</div>
       </div>
       <div class="partner-card">
         <div class="partner-card-title" style="color:#1A5C38;">Escaladează către CEO</div>
         <div class="field-value multiline${!a('fp_escaladeaza') ? ' empty' : ''}">${a('fp_escaladeaza') || '&nbsp;'}</div>
       </div>
     </div>`);

  const secResurse = section('11 · Resurse la dispoziție', undefined, sectionBg, sectionColor,
    `${fieldMulti('Acces la sisteme și conturi', a('fp_acces'))}
     ${fieldMulti('Buget la dispoziție', a('fp_buget'))}
     ${fieldMulti('Echipamente', a('fp_echipamente'))}
     ${fieldMulti('Alte resurse', a('fp_alte_resurse'))}`);

  const secSign = `
    <div class="signature-block">
      <div class="sig-title">Semnături</div>
      <div class="sig-row">
        <div class="sig-col">
          <div class="sig-name-line"></div>
          <div class="sig-label">CEO / Manager — ${firma}</div>
        </div>
        <div class="sig-col">
          <div class="sig-name-line"></div>
          <div class="sig-label">${a('fp_titlu') || 'Titularul rolului'}</div>
        </div>
      </div>
      <div class="sig-date-row">
        <div style="flex:1;"><div class="sig-date-field" style="padding-top:4px;font-size:12px;color:#555;">${data}</div><div class="sig-date-label">Data</div></div>
        <div style="flex:1;"><div class="sig-date-field"></div><div class="sig-date-label">Data titular</div></div>
      </div>
    </div>`;

  const totalPages = 4;
  const pagesHtml = [
    renderPage('05', 'Oamenii', 1, totalPages, `${secIdent}${secScop}${secProdus}${secEval}`, titleBand),
    renderPage('05', 'Oamenii', 2, totalPages, `${secLucru}${secStudii}`),
    renderPage('05', 'Oamenii', 3, totalPages, `${secCond}${secCalit}${secSalariu}`),
    renderPage('05', 'Oamenii', 4, totalPages, `${secKpi}${secLimite}${secResurse}${secSign}${docFooter()}`),
  ].join('');

  return htmlShell('', pagesHtml, `Fișă de Post · ${a('fp_titlu') || 'Rol'}`);
}

// ─────────────────────────────────────────────────────────────────────────────
// DOCUMENT 6 — Instrucțiune de Lucru
// ─────────────────────────────────────────────────────────────────────────────

const doc6Steps: DocWizardStep[] = [
  {
    title: 'Identificare',
    subtitle: 'Cod, versiune, rol care o folosește',
    questions: [
      { id: 'ins_firma',       label: 'Numele firmei',         placeholder: 'ex: Firma SRL',          type: 'text' },
      { id: 'ins_cod',         label: 'Cod instrucțiune',       placeholder: 'ex: DM-INS-001',        type: 'text' },
      { id: 'ins_versiune',    label: 'Versiunea',              placeholder: 'ex: v1.0',              type: 'text' },
      { id: 'ins_data',        label: 'Data emiterii',          placeholder: '',                      type: 'date' },
      { id: 'ins_titlu',       label: 'Titlul instrucțiunii',   placeholder: 'ex: Cum editezi și publici un reel pe Instagram', type: 'text' },
      { id: 'ins_departament', label: 'Departamentul',          placeholder: 'ex: Marketing și Vânzări', type: 'text' },
      { id: 'ins_rol',         label: 'Rolul care o folosește', placeholder: 'ex: Creator de Conținut', type: 'text' },
      { id: 'ins_aprobat',     label: 'Aprobat de',             placeholder: 'ex: CEO',               type: 'text' },
    ],
  },
  {
    title: '1 · Scopul instrucțiunii',
    subtitle: 'De ce există și ce garantează când e urmată (maxim 2 fraze)',
    questions: [
      { id: 'ins_scop', label: 'Scopul instrucțiunii', placeholder: 'Această instrucțiune garantează că...', type: 'textarea' },
    ],
  },
  {
    title: '2 · Cine o folosește și când',
    subtitle: 'Rolul executant și momentul de deschidere',
    questions: [
      { id: 'ins_rol_exec', label: 'Rolul care execută',  placeholder: 'ex: Creator de Conținut',                   type: 'text' },
      { id: 'ins_cand',     label: 'Când o deschide',     placeholder: 'ex: De fiecare dată când are de publicat un reel...', type: 'textarea' },
    ],
  },
  {
    title: '3 · Materiale și tooluri necesare',
    subtitle: 'Tot ce trebuie să aibă înainte să înceapă',
    questions: [
      { id: 'ins_materiale', label: 'Lista materialelor și toolurilor (una pe linie)', placeholder: '1. CapCut instalat...\n2. Acces Google Drive...\n3. ...', type: 'textarea' },
    ],
  },
  {
    title: '4 · Pașii de executat',
    subtitle: 'Până la 11 pași — fiecare: Acțiunea — Cum exact — Output',
    questions: Array.from({ length: 11 }, (_, i) => ({
      id: `ins_pas${i + 1}`,
      label: `Pasul ${i + 1}${i >= 5 ? ' (opțional)' : ''}`,
      placeholder: 'Acțiunea — Cum exact (la persoana a doua) — Output',
      type: 'textarea' as const,
    })),
  },
  {
    title: '5 · Criterii de calitate',
    subtitle: 'Cum știi că sarcina a fost executată corect (verificabile)',
    questions: [
      { id: 'ins_calitate', label: 'Criterii de calitate (unul pe linie)', placeholder: '1. ...\n2. ...\n3. ...', type: 'textarea' },
    ],
  },
  {
    title: '6 · Greșeli frecvente',
    subtitle: 'Greșeala — Cum o eviți (una pe linie, separator „ — ")',
    questions: [
      { id: 'ins_greseli', label: 'Greșeli frecvente', placeholder: 'Greșeală 1 — Cum o eviți\nGreșeală 2 — Cum o eviți\n...', type: 'textarea' },
    ],
  },
  {
    title: '7 · Ce faci dacă ceva nu merge',
    subtitle: 'Situații de excepție și răspunsul corect',
    questions: [
      { id: 'ins_exceptii', label: 'Situații de excepție (Situație — Ce faci, una pe linie)', placeholder: 'Fișierul lipsește din Drive — Trimiți mesaj către...\n...', type: 'textarea' },
    ],
  },
  {
    title: '8 · Documente conexe',
    subtitle: 'Documentul — Locația în Drive',
    questions: [
      { id: 'ins_documente', label: 'Documente conexe (Document — Locație, una pe linie)', placeholder: 'SOP Publicare Reel — Drive / ...\nChecklist — Drive / ...\n...', type: 'textarea' },
    ],
  },
];

function generateDoc6(answers: Record<string, string>): string {
  const a = (k: string) => ans(answers, k);
  const sectionBg = '#eaf3ed';
  const sectionColor = '#1A5C38';

  const firma = a('ins_firma') || '[Numele firmei]';
  const cod = a('ins_cod') || 'INS-001';
  const versiune = a('ins_versiune') || 'v1.0';
  const data = a('ins_data') || '';

  const titleBand = `
    <div class="title-band" style="background: linear-gradient(135deg, #1A5C38 0%, #2a7a4f 100%);">
      <div class="doc-num">DOCUMENT 06 · INSTRUCȚIUNE DE LUCRU · ${cod}</div>
      <h1>${a('ins_titlu') || 'Instrucțiune de Lucru'}</h1>
      <span class="topic-tag">${firma} · ${versiune}${data ? ' · ' + data : ''}</span>
    </div>`;

  const secIdent = section('Identificare', 'Cod, versiune, rol care o folosește', sectionBg, sectionColor,
    `${fieldRow(field('Titlul instrucțiunii', a('ins_titlu')))}
     ${fieldRow(
        field('Departamentul', a('ins_departament')),
        field('Rolul care o folosește', a('ins_rol')),
      )}
     ${fieldRow(
        field('Cod', cod),
        field('Versiunea', versiune),
        field('Data', data),
      )}
     ${fieldRow(field('Aprobat de', a('ins_aprobat')))}`);

  const secScop = section('1 · Scopul instrucțiunii', undefined, sectionBg, sectionColor,
    `${fieldMulti('Scopul', a('ins_scop'))}`);

  const secCine = section('2 · Cine o folosește și când', undefined, sectionBg, sectionColor,
    `${fieldRow(field('Rolul care execută', a('ins_rol_exec')))}
     ${fieldMulti('Când o deschide', a('ins_cand'))}`);

  const secMat = section('3 · Materiale și tooluri necesare', 'Tot ce trebuie să aibă la dispoziție înainte', sectionBg, sectionColor,
    `${fieldMulti('Materiale și tooluri', a('ins_materiale'))}`);

  const stepIds = Array.from({ length: 11 }, (_, i) => `ins_pas${i + 1}`);
  const stepBlocks = stepIds
    .map((id, idx) => ({ idx: idx + 1, val: a(id) }))
    .filter(s => s.val !== '')
    .map(s => `
      <div style="display:flex;gap:12px;margin-bottom:10px;padding:10px 12px;border:1px solid var(--line);border-radius:4px;background:var(--paper-dark);">
        <div style="flex-shrink:0;width:28px;height:28px;border-radius:50%;background:#1A5C38;color:#fff;display:flex;align-items:center;justify-content:center;font-family:'Aboreto',serif;font-size:11px;">${s.idx}</div>
        <div style="flex:1;font-size:12.5px;line-height:1.55;white-space:pre-wrap;color:var(--ink);">${s.val}</div>
      </div>`).join('');
  const secPasi = section('4 · Pașii de executat', 'Acțiune · Cum exact · Output', sectionBg, sectionColor,
    stepBlocks || `<div class="field-value multiline empty">&nbsp;</div>`);

  const secCalit = section('5 · Criterii de calitate', 'Cum știi că sarcina a fost executată corect', sectionBg, sectionColor,
    `${fieldMulti('Criterii de calitate', a('ins_calitate'))}`);

  const renderTwoCol = (raw: string, headLeft: string, headRight: string) => {
    const rows = raw.split('\n').map(l => l.trim()).filter(Boolean).map(l => {
      const parts = l.split(/\s+—\s+|\s+-\s+/);
      const left = parts[0] || '';
      const right = parts.slice(1).join(' — ') || '';
      return `<tr><td style="padding:8px 10px;border:1px solid var(--line);font-size:12px;vertical-align:top;width:42%;">${left}</td><td style="padding:8px 10px;border:1px solid var(--line);font-size:12px;vertical-align:top;">${right}</td></tr>`;
    }).join('');
    if (!rows) return `<div class="field-value multiline empty">&nbsp;</div>`;
    return `<table style="width:100%;border-collapse:collapse;margin-top:4px;">
      <thead><tr>
        <th style="text-align:left;padding:8px 10px;background:#1A5C38;color:#fff;font-family:'Aboreto',serif;font-size:10px;letter-spacing:1.5px;text-transform:uppercase;border:1px solid #1A5C38;">${headLeft}</th>
        <th style="text-align:left;padding:8px 10px;background:#1A5C38;color:#fff;font-family:'Aboreto',serif;font-size:10px;letter-spacing:1.5px;text-transform:uppercase;border:1px solid #1A5C38;">${headRight}</th>
      </tr></thead>
      <tbody>${rows}</tbody>
    </table>`;
  };

  const secGreseli = section('6 · Greșeli frecvente și cum le eviți', undefined, sectionBg, sectionColor,
    renderTwoCol(a('ins_greseli'), 'Greșeala frecventă', 'Cum o eviți'));

  const secExceptii = section('7 · Ce faci dacă ceva nu merge', undefined, sectionBg, sectionColor,
    renderTwoCol(a('ins_exceptii'), 'Situația de excepție', 'Ce faci'));

  const secDocuments = section('8 · Documente conexe', undefined, sectionBg, sectionColor,
    renderTwoCol(a('ins_documente'), 'Documentul', 'Locația în Drive'));

  const secSign = `
    <div class="signature-block">
      <div class="sig-title">Aprobare și confirmare</div>
      <div class="sig-row">
        <div class="sig-col">
          <div class="sig-name-line"></div>
          <div class="sig-label">Aprobat de — ${a('ins_aprobat') || 'CEO / Manager'}</div>
        </div>
        <div class="sig-col">
          <div class="sig-name-line"></div>
          <div class="sig-label">Confirmat de — ${a('ins_rol') || 'Titularul rolului'}</div>
        </div>
      </div>
      <div class="sig-date-row">
        <div style="flex:1;"><div class="sig-date-field" style="padding-top:4px;font-size:12px;color:#555;">${data}</div><div class="sig-date-label">Data aprobării</div></div>
        <div style="flex:1;"><div class="sig-date-field"></div><div class="sig-date-label">Data confirmării</div></div>
      </div>
    </div>`;

  const totalPages = 4;
  const pagesHtml = [
    renderPage('06', 'Instrucțiune', 1, totalPages, `${secIdent}${secScop}${secCine}${secMat}`, titleBand),
    renderPage('06', 'Instrucțiune', 2, totalPages, secPasi),
    renderPage('06', 'Instrucțiune', 3, totalPages, `${secCalit}${secGreseli}${secExceptii}`),
    renderPage('06', 'Instrucțiune', 4, totalPages, `${secDocuments}${secSign}${docFooter()}`),
  ].join('');

  return htmlShell('', pagesHtml, `${cod} · ${a('ins_titlu') || 'Instrucțiune de Lucru'}`);
}


// ─────────────────────────────────────────────────────────────────────────────
// DOCUMENT 7 — Fișa KPI (L15 · Contoarele)
// ─────────────────────────────────────────────────────────────────────────────

const doc7Steps: DocWizardStep[] = [
  {
    title: 'Identificare',
    subtitle: 'Firma, rolul, produsul funcției',
    questions: [
      { id: 'kpi_firma',   label: 'Numele firmei',       placeholder: 'ex: Firma SRL',            type: 'text' },
      { id: 'kpi_data',    label: 'Data',                 placeholder: '',                          type: 'date' },
      { id: 'kpi_rol',     label: 'Rolul',                placeholder: 'ex: Director de Vânzări',   type: 'text' },
      { id: 'kpi_functia', label: 'Funcția',              placeholder: 'ex: Vânzări',               type: 'text' },
      { id: 'kpi_produs',  label: 'Produsul rolului',     placeholder: 'Ce livrează concret rolul, în cifre.', type: 'textarea' },
    ],
  },
  {
    title: 'Cele 6 elemente ale KPI-ului',
    subtitle: 'Un KPI complet — verifică lanțul produs → strategie → guideline → KPI',
    questions: [
      { id: 'kpi_e1', label: '1 · Numele indicatorului',           placeholder: 'Doi oameni ar număra același lucru?', type: 'textarea' },
      { id: 'kpi_e2', label: '2 · Legătura cu produsul funcției',  placeholder: 'Dacă KPI-ul e atins, apare garantat produsul funcției?', type: 'textarea' },
      { id: 'kpi_e3', label: '3 · Unitatea de măsură',             placeholder: 'nr / procent / lei / ore / zile',       type: 'text' },
      { id: 'kpi_e4', label: '4 · Ținta',                          placeholder: 'ex: 20 contracte / lună',              type: 'text' },
      { id: 'kpi_e5', label: '5 · Frecvența',                      placeholder: 'ex: săptămânal / lunar',                type: 'text' },
      { id: 'kpi_e6', label: '6 · Cine răspunde / cine verifică',  placeholder: 'Un singur responsabil + verificator.', type: 'text' },
    ],
  },
  {
    title: 'Testul final și verificarea',
    subtitle: '„Dacă atinge KPI-ul dar firma nu câștigă — e posibil?"',
    questions: [
      { id: 'kpi_test', label: 'Răspunsul la testul final',
        placeholder: 'NU, e imposibil — KPI corect. / DA, e posibil — reia Elementul 2.',
        type: 'textarea' },
      { id: 'kpi_notite', label: 'Notițe / concluzii', placeholder: 'Ce ai învățat construind acest KPI. Ce reglezi la Elementul 2 dacă e cazul.', type: 'textarea' },
    ],
  },
];

function generateDoc7(answers: Record<string, string>): string {
  const a = (k: string) => ans(answers, k);
  const sectionBg = '#f5eddb';
  const sectionColor = '#a07840';

  const firma = a('kpi_firma') || '[Numele firmei]';
  const data = a('kpi_data') || '';
  const rol = a('kpi_rol') || '[Rolul]';
  const functia = a('kpi_functia') || '[Funcția]';

  const titleBand = `
    <div class="title-band" style="background: linear-gradient(135deg, #a07840 0%, #C9A96E 100%);">
      <div class="doc-num">DOCUMENT 07 · FIȘA KPI</div>
      <h1>Indicator cheie de performanță</h1>
      <span class="topic-tag">${firma}${data ? ' · ' + data : ''}</span>
    </div>`;

  const secIdent = section('Identificare', 'Rolul și produsul funcției', sectionBg, sectionColor,
    `${fieldRow(field('Rolul', rol), field('Funcția', functia))}
     ${fieldMulti('Produsul rolului', a('kpi_produs'))}`);

  const elemBlock = (num: number, title: string, hint: string, val: string, question: string) => `
    <div style="margin-bottom:10px;padding:10px 12px;border:1px solid var(--line);border-radius:4px;background:var(--paper-dark);">
      <div style="display:flex;gap:10px;align-items:center;margin-bottom:6px;">
        <div style="width:26px;height:26px;border-radius:50%;background:#a07840;color:#fff;display:flex;align-items:center;justify-content:center;font-family:'Aboreto',serif;font-size:12px;">${num}</div>
        <div style="font-family:'Aboreto',serif;font-size:12px;letter-spacing:1.5px;text-transform:uppercase;color:var(--ink);">${title}</div>
      </div>
      <div style="font-size:11px;color:var(--muted);font-style:italic;margin-bottom:4px;">ℹ ${hint}</div>
      <div style="font-size:11px;color:var(--muted);font-style:italic;margin-bottom:6px;">? ${question}</div>
      <div class="field-value multiline${!val ? ' empty' : ''}" style="white-space:pre-wrap;">${val || '&nbsp;'}</div>
    </div>`;

  const sec6a = section('Cele 6 elemente · 1-3', undefined, sectionBg, sectionColor,
    elemBlock(1, 'Numele indicatorului', 'Ce măsori exact.', a('kpi_e1'), 'Doi oameni diferiți vor număra același lucru?') +
    elemBlock(2, 'Legătura cu produsul funcției', 'Veriga care ține lanțul întreg. Nu sări.', a('kpi_e2'), 'Dacă KPI-ul e atins, apare garantat produsul funcției?') +
    elemBlock(3, 'Unitatea de măsură', 'Număr, procent, lei, ore, zile.', a('kpi_e3'), 'E clar în ce unitate măsor?'));

  const sec6b = section('Cele 6 elemente · 4-6', undefined, sectionBg, sectionColor,
    elemBlock(4, 'Ținta', 'Cât înseamnă „bine". Fără țintă, o cifră nu înseamnă nimic.', a('kpi_e4'), 'Am decis concret cât înseamnă bine? E realistă?') +
    elemBlock(5, 'Frecvența', 'Cât de des măsori.', a('kpi_e5'), 'Îmi dă timp să intervin dacă merge prost?') +
    elemBlock(6, 'Cine răspunde', 'Un singur responsabil + cine verifică.', a('kpi_e6'), 'Omul poate mișca direct această cifră prin munca lui?'));

  const secTest = section('Testul final', '„Dacă atinge KPI-ul dar firma nu câștigă — e posibil?"', sectionBg, sectionColor,
    `${fieldMulti('Răspunsul tău', a('kpi_test'))}
     ${fieldMulti('Notițe / concluzii', a('kpi_notite'))}`);

  const secVerif = `
    <div class="section-block">
      <div class="section-title" style="background:${sectionBg};color:${sectionColor};">Verificare finală · cele 4 criterii</div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-top:6px;">
        <div style="padding:10px 12px;border:1px solid var(--line);border-radius:4px;font-size:12px;">☐ <strong>Măsurabil</strong> — e o cifră clară, nu o dorință</div>
        <div style="padding:10px 12px;border:1px solid var(--line);border-radius:4px;font-size:12px;">☐ <strong>În puterea omului</strong> — o poate mișca direct</div>
        <div style="padding:10px 12px;border:1px solid var(--line);border-radius:4px;font-size:12px;">☐ <strong>Legat de strategie</strong> — măsoară produsul funcției</div>
        <div style="padding:10px 12px;border:1px solid var(--line);border-radius:4px;font-size:12px;">☐ <strong>Cu prag de calitate</strong> — numără lucrurile bune</div>
      </div>
    </div>`;

  const totalPages = 3;
  const pagesHtml = [
    renderPage('07', 'Contoarele', 1, totalPages, `${secIdent}${sec6a}`, titleBand),
    renderPage('07', 'Contoarele', 2, totalPages, `${sec6b}`),
    renderPage('07', 'Contoarele', 3, totalPages, `${secTest}${secVerif}${docFooter()}`),
  ].join('');

  return htmlShell('', pagesHtml, `Fișa KPI · ${rol}`);
}


// ─────────────────────────────────────────────────────────────────────────────
// DOCUMENT 8 — Fișa KPI Viu (L16)
// ─────────────────────────────────────────────────────────────────────────────

const doc8Steps: DocWizardStep[] = [
  {
    title: 'Identificare',
    questions: [
      { id: 'viu_firma',   label: 'Numele firmei',    placeholder: 'ex: Firma SRL',            type: 'text' },
      { id: 'viu_data',    label: 'Data',              placeholder: '',                          type: 'date' },
      { id: 'viu_rol',     label: 'Rolul',             placeholder: 'ex: Director de Vânzări',   type: 'text' },
      { id: 'viu_functia', label: 'Funcția',           placeholder: 'ex: Vânzări',               type: 'text' },
      { id: 'viu_produs',  label: 'Produsul rolului',  placeholder: 'Ce livrează concret rolul.', type: 'textarea' },
    ],
  },
  {
    title: 'Cele 6 elemente',
    questions: [
      { id: 'viu_e1', label: '1 · Numele indicatorului',           placeholder: '', type: 'textarea' },
      { id: 'viu_e2', label: '2 · Legătura cu produsul funcției',  placeholder: '', type: 'textarea' },
      { id: 'viu_e3', label: '3 · Unitatea de măsură',             placeholder: '', type: 'text' },
      { id: 'viu_e4', label: '4 · Ținta',                          placeholder: '', type: 'text' },
      { id: 'viu_e5', label: '5 · Frecvența',                      placeholder: '', type: 'text' },
      { id: 'viu_e6', label: '6 · Cine răspunde / verifică',       placeholder: '', type: 'text' },
    ],
  },
  {
    title: 'Poarta de calitate',
    subtitle: 'Ce condiție trebuie să îndeplinească un rezultat ca să se numere',
    questions: [
      { id: 'viu_poarta', label: 'Se numără doar rezultatele care îndeplinesc:', placeholder: 'ex: vânzări peste 200 lei / proiecte fără refacere', type: 'textarea' },
    ],
  },
  {
    title: 'Cele 3 praguri (față de țintă)',
    subtitle: 'Sub țintă = roșu · La țintă = galben · Peste țintă = verde',
    questions: [
      { id: 'viu_rosu_nivel',    label: '🔴 ROȘU · nivelul cifrei',      placeholder: 'ex: sub 15', type: 'text' },
      { id: 'viu_rosu_actiune',  label: '🔴 ROȘU · ce se întâmplă',      placeholder: 'ex: doar fixul, plan de recuperare', type: 'textarea' },
      { id: 'viu_galben_nivel',  label: '🟡 GALBEN · nivelul cifrei',    placeholder: 'ex: 15–20', type: 'text' },
      { id: 'viu_galben_actiune',label: '🟡 GALBEN · ce se întâmplă',    placeholder: 'ex: fix + bonus întreg', type: 'textarea' },
      { id: 'viu_verde_nivel',   label: '🟢 VERDE · nivelul cifrei',     placeholder: 'ex: peste 20', type: 'text' },
      { id: 'viu_verde_actiune', label: '🟢 VERDE · ce se întâmplă',     placeholder: 'ex: fix + bonus + stimulent depășire', type: 'textarea' },
    ],
  },
  {
    title: 'Legătura cu salariul',
    subtitle: 'Legi bani DOAR de un KPI complet în puterea omului',
    questions: [
      { id: 'viu_fix',        label: 'Componenta fixă',            placeholder: 'ex: 800 EUR', type: 'text' },
      { id: 'viu_var',        label: 'Componenta variabilă max',    placeholder: 'ex: 400 EUR (~33%)', type: 'text' },
      { id: 'viu_rosu_pay',   label: '🔴 ROȘU → primește',          placeholder: 'ex: doar fixul', type: 'text' },
      { id: 'viu_galben_pay', label: '🟡 GALBEN → primește',        placeholder: 'ex: fix + bonus întreg', type: 'text' },
      { id: 'viu_verde_pay',  label: '🟢 VERDE → primește',         placeholder: 'ex: fix + bonus + X lei/unitate peste țintă', type: 'text' },
    ],
  },
];

function generateDoc8(answers: Record<string, string>): string {
  const a = (k: string) => ans(answers, k);
  const sectionBg = '#f7ecec';
  const sectionColor = '#8B1A1A';
  const firma = a('viu_firma') || '[Numele firmei]';
  const data = a('viu_data') || '';
  const rol = a('viu_rol') || '[Rolul]';

  const titleBand = `
    <div class="title-band" style="background: linear-gradient(135deg, #8B1A1A 0%, #a82020 100%);">
      <div class="doc-num">DOCUMENT 08 · FIȘA KPI VIU</div>
      <h1>De la o cifră la un sistem care mișcă oameni</h1>
      <span class="topic-tag">${firma}${data ? ' · ' + data : ''}</span>
    </div>`;

  const secIdent = section('Identificare', undefined, sectionBg, sectionColor,
    `${fieldRow(field('Rolul', rol), field('Funcția', a('viu_functia')))}
     ${fieldMulti('Produsul rolului', a('viu_produs'))}`);

  const sec6 = section('Partea 1 · Cele 6 elemente', undefined, sectionBg, sectionColor,
    `${fieldRow(field('1 · Nume', a('viu_e1')))}
     ${fieldMulti('2 · Legătura cu produsul funcției', a('viu_e2'))}
     ${fieldRow(field('3 · Unitate', a('viu_e3')), field('4 · Ținta', a('viu_e4')))}
     ${fieldRow(field('5 · Frecvența', a('viu_e5')), field('6 · Cine răspunde', a('viu_e6')))}`);

  const secPoarta = section('Partea 2 · Poarta de calitate', 'Se numără doar ce respectă standardul', sectionBg, sectionColor,
    `${fieldMulti('Condiția de calitate', a('viu_poarta'))}`);

  const pragRow = (color: string, bg: string, name: string, nivel: string, act: string) => `
    <tr>
      <td style="padding:10px 12px;border:1px solid var(--line);background:${bg};color:${color};font-family:'Aboreto',serif;font-size:11px;letter-spacing:1.5px;vertical-align:top;width:22%;">${name}</td>
      <td style="padding:10px 12px;border:1px solid var(--line);font-size:12px;vertical-align:top;width:28%;">${nivel || '&nbsp;'}</td>
      <td style="padding:10px 12px;border:1px solid var(--line);font-size:12px;vertical-align:top;white-space:pre-wrap;">${act || '&nbsp;'}</td>
    </tr>`;

  const secPraguri = section('Partea 3 · Cele 3 praguri', 'Sub țintă = roșu · la țintă = galben · peste țintă = verde', sectionBg, sectionColor, `
    <table style="width:100%;border-collapse:collapse;margin-top:4px;">
      <thead><tr>
        <th style="text-align:left;padding:8px 10px;background:#8B1A1A;color:#fff;font-family:'Aboreto',serif;font-size:10px;letter-spacing:1.5px;text-transform:uppercase;border:1px solid #8B1A1A;">Prag</th>
        <th style="text-align:left;padding:8px 10px;background:#8B1A1A;color:#fff;font-family:'Aboreto',serif;font-size:10px;letter-spacing:1.5px;text-transform:uppercase;border:1px solid #8B1A1A;">Nivelul cifrei</th>
        <th style="text-align:left;padding:8px 10px;background:#8B1A1A;color:#fff;font-family:'Aboreto',serif;font-size:10px;letter-spacing:1.5px;text-transform:uppercase;border:1px solid #8B1A1A;">Ce se întâmplă</th>
      </tr></thead>
      <tbody>
        ${pragRow('#8B1A1A', '#fce8e8', 'ROȘU · sub țintă', a('viu_rosu_nivel'), a('viu_rosu_actiune'))}
        ${pragRow('#8a6d1a', '#fdf3d0', 'GALBEN · la țintă', a('viu_galben_nivel'), a('viu_galben_actiune'))}
        ${pragRow('#1A5C38', '#dff0e5', 'VERDE · peste țintă', a('viu_verde_nivel'), a('viu_verde_actiune'))}
      </tbody>
    </table>`);

  const secSalariu = section('Partea 4 · Legătura cu salariul', 'Legi bani DOAR de un KPI complet în puterea omului', sectionBg, sectionColor,
    `${fieldRow(field('Componenta fixă', a('viu_fix')), field('Componenta variabilă max', a('viu_var')))}
     <table style="width:100%;border-collapse:collapse;margin-top:8px;">
       <thead><tr>
         <th style="text-align:left;padding:8px 10px;background:#8B1A1A;color:#fff;font-family:'Aboreto',serif;font-size:10px;letter-spacing:1.5px;text-transform:uppercase;border:1px solid #8B1A1A;">Prag</th>
         <th style="text-align:left;padding:8px 10px;background:#8B1A1A;color:#fff;font-family:'Aboreto',serif;font-size:10px;letter-spacing:1.5px;text-transform:uppercase;border:1px solid #8B1A1A;">Regula</th>
         <th style="text-align:left;padding:8px 10px;background:#8B1A1A;color:#fff;font-family:'Aboreto',serif;font-size:10px;letter-spacing:1.5px;text-transform:uppercase;border:1px solid #8B1A1A;">Ce primește</th>
       </tr></thead>
       <tbody>
         <tr><td style="padding:10px 12px;border:1px solid var(--line);background:#fce8e8;color:#8B1A1A;font-family:'Aboreto',serif;font-size:11px;">ROȘU</td><td style="padding:10px 12px;border:1px solid var(--line);font-size:12px;">Doar fixul, fără bonus</td><td style="padding:10px 12px;border:1px solid var(--line);font-size:12px;">${a('viu_rosu_pay') || '&nbsp;'}</td></tr>
         <tr><td style="padding:10px 12px;border:1px solid var(--line);background:#fdf3d0;color:#8a6d1a;font-family:'Aboreto',serif;font-size:11px;">GALBEN</td><td style="padding:10px 12px;border:1px solid var(--line);font-size:12px;">Fix + bonus întreg</td><td style="padding:10px 12px;border:1px solid var(--line);font-size:12px;">${a('viu_galben_pay') || '&nbsp;'}</td></tr>
         <tr><td style="padding:10px 12px;border:1px solid var(--line);background:#dff0e5;color:#1A5C38;font-family:'Aboreto',serif;font-size:11px;">VERDE</td><td style="padding:10px 12px;border:1px solid var(--line);font-size:12px;">Fix + bonus + stimulent depășire</td><td style="padding:10px 12px;border:1px solid var(--line);font-size:12px;">${a('viu_verde_pay') || '&nbsp;'}</td></tr>
       </tbody>
     </table>`);

  const secVerif = `
    <div class="section-block">
      <div class="section-title" style="background:${sectionBg};color:${sectionColor};">Verificare finală · 6 criterii</div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-top:6px;">
        <div style="padding:10px 12px;border:1px solid var(--line);border-radius:4px;font-size:12px;">☐ Numele e măsurabil</div>
        <div style="padding:10px 12px;border:1px solid var(--line);border-radius:4px;font-size:12px;">☐ Are poartă de calitate</div>
        <div style="padding:10px 12px;border:1px solid var(--line);border-radius:4px;font-size:12px;">☐ Are cele 3 praguri față de țintă</div>
        <div style="padding:10px 12px;border:1px solid var(--line);border-radius:4px;font-size:12px;">☐ KPI-ul e complet în puterea omului</div>
        <div style="padding:10px 12px;border:1px solid var(--line);border-radius:4px;font-size:12px;">☐ Nu plătesc bonus sub țintă</div>
        <div style="padding:10px 12px;border:1px solid var(--line);border-radius:4px;font-size:12px;">☐ Omul poate calcula singur cât primește</div>
      </div>
    </div>`;

  const totalPages = 3;
  const pagesHtml = [
    renderPage('08', 'Contoarele', 1, totalPages, `${secIdent}${sec6}${secPoarta}`, titleBand),
    renderPage('08', 'Contoarele', 2, totalPages, `${secPraguri}${secSalariu}`),
    renderPage('08', 'Contoarele', 3, totalPages, `${secVerif}${docFooter()}`),
  ].join('');

  return htmlShell('', pagesHtml, `Fișa KPI Viu · ${rol}`);
}


// ─────────────────────────────────────────────────────────────────────────────
// DOCUMENT 9 — Tabloul de bord (L17)
// ─────────────────────────────────────────────────────────────────────────────

const doc9Steps: DocWizardStep[] = [
  {
    title: 'Identificare',
    questions: [
      { id: 'tb_firma',     label: 'Numele firmei', placeholder: 'ex: Firma SRL',            type: 'text' },
      { id: 'tb_saptamana', label: 'Săptămâna',      placeholder: 'ex: 20–26 iulie 2026',    type: 'text' },
    ],
  },
  {
    title: 'Cele 7 funcții — indicatorii de rezultat',
    subtitle: 'Un singur indicator pe fiecare funcție',
    questions: ([1,2,3,4,5,6,7] as const).flatMap(i => [
      { id: `tb_f${i}_ind`,   label: `${i} · Indicator`,   placeholder: '', type: 'text' as const },
      { id: `tb_f${i}_tinta`, label: `${i} · Ținta`,        placeholder: '', type: 'text' as const },
      { id: `tb_f${i}_real`,  label: `${i} · Realizat`,     placeholder: '', type: 'text' as const },
      { id: `tb_f${i}_resp`,  label: `${i} · Responsabil`,  placeholder: '', type: 'text' as const },
    ]),
  },
  {
    title: 'Sistemul de raportare',
    questions: [
      { id: 'tb_cine',      label: 'Cine completează',     placeholder: 'ex: Fiecare responsabil își pune propria cifră', type: 'text' },
      { id: 'tb_cand',      label: 'Când (termen limită)', placeholder: 'ex: Vineri, 18:00',                              type: 'text' },
      { id: 'tb_intrebari', label: 'Cele 3 întrebări lângă cifră', placeholder: '1. Ce s-a făcut?\n2. Ce rezultat?\n3. Ce blocaje?', type: 'textarea' },
    ],
  },
];

function generateDoc9(answers: Record<string, string>): string {
  const a = (k: string) => ans(answers, k);
  const sectionBg = '#eaf3ed';
  const sectionColor = '#1A5C38';
  const firma = a('tb_firma') || '[Numele firmei]';
  const saptamana = a('tb_saptamana') || '';

  const FUNCTII = [
    '1 · Construcția echipei',
    '2 · Marketing și Vânzări',
    '3 · Finanțe',
    '4 · Producție / Serviciu',
    '5 · Calitatea',
    '6 · PR și Imaginea',
    '7 · Conducerea',
  ];

  const stareBadge = (tinta: string, real: string) => {
    const t = parseFloat((tinta || '').replace(/[^0-9.,-]/g, '').replace(',', '.'));
    const r = parseFloat((real || '').replace(/[^0-9.,-]/g, '').replace(',', '.'));
    if (isNaN(t) || isNaN(r) || !tinta || !real) return `<span style="color:var(--muted);">—</span>`;
    if (r < t) return `<span style="display:inline-block;padding:2px 8px;border-radius:3px;background:#fce8e8;color:#8B1A1A;font-family:'Aboreto',serif;font-size:10px;letter-spacing:1px;">ROȘU</span>`;
    if (r > t) return `<span style="display:inline-block;padding:2px 8px;border-radius:3px;background:#dff0e5;color:#1A5C38;font-family:'Aboreto',serif;font-size:10px;letter-spacing:1px;">VERDE</span>`;
    return `<span style="display:inline-block;padding:2px 8px;border-radius:3px;background:#fdf3d0;color:#8a6d1a;font-family:'Aboreto',serif;font-size:10px;letter-spacing:1px;">GALBEN</span>`;
  };

  const titleBand = `
    <div class="title-band" style="background: linear-gradient(135deg, #1A5C38 0%, #2a7a4f 100%);">
      <div class="doc-num">DOCUMENT 09 · TABLOUL DE BORD</div>
      <h1>Cele 7 funcții · un indicator de rezultat fiecare</h1>
      <span class="topic-tag">${firma}${saptamana ? ' · ' + saptamana : ''}</span>
    </div>`;

  const rows = FUNCTII.map((f, idx) => {
    const i = idx + 1;
    const ind = a(`tb_f${i}_ind`);
    const tinta = a(`tb_f${i}_tinta`);
    const real = a(`tb_f${i}_real`);
    const resp = a(`tb_f${i}_resp`);
    return `<tr>
      <td style="padding:10px 12px;border:1px solid var(--line);font-size:12px;vertical-align:top;background:var(--paper-dark);"><strong>${f}</strong><br><span style="color:var(--muted);font-size:11px;">${ind || '&nbsp;'}</span></td>
      <td style="padding:10px 12px;border:1px solid var(--line);font-size:12px;vertical-align:top;text-align:center;">${tinta || '&nbsp;'}</td>
      <td style="padding:10px 12px;border:1px solid var(--line);font-size:12px;vertical-align:top;text-align:center;">${real || '&nbsp;'}</td>
      <td style="padding:10px 12px;border:1px solid var(--line);font-size:12px;vertical-align:top;text-align:center;">${stareBadge(tinta, real)}</td>
      <td style="padding:10px 12px;border:1px solid var(--line);font-size:12px;vertical-align:top;">${resp || '&nbsp;'}</td>
    </tr>`;
  }).join('');

  const secTablou = section('Tabloul de bord', 'Sub țintă = roșu · La țintă = galben · Peste țintă = verde', sectionBg, sectionColor, `
    <table style="width:100%;border-collapse:collapse;margin-top:4px;">
      <thead><tr>
        <th style="text-align:left;padding:8px 10px;background:#1A5C38;color:#fff;font-family:'Aboreto',serif;font-size:10px;letter-spacing:1.5px;text-transform:uppercase;border:1px solid #1A5C38;">Funcția / Indicator</th>
        <th style="text-align:center;padding:8px 10px;background:#1A5C38;color:#fff;font-family:'Aboreto',serif;font-size:10px;letter-spacing:1.5px;text-transform:uppercase;border:1px solid #1A5C38;">Țintă</th>
        <th style="text-align:center;padding:8px 10px;background:#1A5C38;color:#fff;font-family:'Aboreto',serif;font-size:10px;letter-spacing:1.5px;text-transform:uppercase;border:1px solid #1A5C38;">Realizat</th>
        <th style="text-align:center;padding:8px 10px;background:#1A5C38;color:#fff;font-family:'Aboreto',serif;font-size:10px;letter-spacing:1.5px;text-transform:uppercase;border:1px solid #1A5C38;">Stare</th>
        <th style="text-align:left;padding:8px 10px;background:#1A5C38;color:#fff;font-family:'Aboreto',serif;font-size:10px;letter-spacing:1.5px;text-transform:uppercase;border:1px solid #1A5C38;">Responsabil</th>
      </tr></thead>
      <tbody>${rows}</tbody>
    </table>`);

  const secRaport = section('Sistemul de raportare', undefined, sectionBg, sectionColor,
    `${fieldRow(field('Cine completează', a('tb_cine')), field('Termen', a('tb_cand')))}
     ${fieldMulti('Cele 3 întrebări lângă cifră', a('tb_intrebari'))}`);

  const secRegula = `
    <div class="section-block">
      <div class="section-title" style="background:${sectionBg};color:${sectionColor};">Regula desfacerii</div>
      <div style="padding:12px 14px;font-size:12px;line-height:1.6;color:var(--ink);">
        Atât timp cât un indicator e <strong>verde</strong>, nu te uiți mai adânc. Când devine <strong>roșu</strong>, îl desfaci ca să vezi unde s-a rupt lanțul.
        Exemplu la vânzări: puține lead-uri calificate → problemă la <em>marketing</em>. Multe lead-uri, conversie mică → problemă la <em>vânzare</em>.
        Desfaci doar ca să diagnostichezi, NU ca să monitorizezi zilnic.
      </div>
    </div>`;

  const totalPages = 2;
  const pagesHtml = [
    renderPage('09', 'Contoarele', 1, totalPages, `${secTablou}`, titleBand),
    renderPage('09', 'Contoarele', 2, totalPages, `${secRegula}${secRaport}${docFooter()}`),
  ].join('');

  return htmlShell('', pagesHtml, `Tabloul de bord · ${firma}`);
}


// ─────────────────────────────────────────────────────────────────────────────
// DOCUMENT 10 — Planul de predare a unui proces (L19 · Predarea Cheilor)
// ─────────────────────────────────────────────────────────────────────────────

const doc10Steps: DocWizardStep[] = [
  {
    title: 'Procesul și responsabilul',
    subtitle: 'Un singur proces — primul. Nu începe al doilea până acesta nu merge stabil fără tine.',
    questions: [
      { id: 'pp_firma',       label: 'Numele firmei',            placeholder: 'ex: Firma SRL',                    type: 'text' },
      { id: 'pp_proces',      label: 'Numele procesului',        placeholder: 'ex: Gestiunea stocurilor',         type: 'text' },
      { id: 'pp_data_start',  label: 'Data începerii predării',  placeholder: '',                                  type: 'date' },
      { id: 'pp_responsabil', label: 'Responsabilul căruia îi predau', placeholder: 'ex: Andrei — Șef de depozit', type: 'text' },
    ],
  },
  {
    title: '1 · Alegerea procesului',
    subtitle: 'Trece cele 3 criterii? Dacă vreunul nu e bifat, alege alt proces pentru început.',
    questions: [
      { id: 'pp_c1', label: 'Risc controlat — de ce firma nu se scufundă dacă omul greșește la început?', placeholder: 'ex: erorile de stoc se corectează în aceeași zi, fără pierdere de clienți.', type: 'textarea' },
      { id: 'pp_c2', label: 'Om aproape gata — cine îl preia și de ce e pregătit?', placeholder: 'ex: Andrei lucrează în depozit de 2 ani, cunoaște produsele.', type: 'textarea' },
      { id: 'pp_c3', label: 'Ușor de scris — se poate pune pe hârtie?', placeholder: 'ex: da, SOP-ul are 9 pași, fără excepții complicate.', type: 'textarea' },
    ],
  },
  {
    title: '2 · Transferul complet',
    subtitle: 'Un transfer incomplet e cauza numărul unu a eșecului',
    questions: [
      { id: 'pp_t1', label: 'Cunoștințele — procesul e scris (SOP), îl poate reciti fără mine', placeholder: 'Ce am / ce mai lipsește.', type: 'textarea' },
      { id: 'pp_t2', label: 'Accesul — instrumente, conturi, date din prima zi',                 placeholder: 'Ce am / ce mai lipsește.', type: 'textarea' },
      { id: 'pp_t3', label: 'KPI și raportare — ce cifră și când raportează',                     placeholder: 'Ce am / ce mai lipsește.', type: 'textarea' },
      { id: 'pp_t4', label: 'Supravegherea — cât de des verific la început',                      placeholder: 'Ce am / ce mai lipsește.', type: 'textarea' },
    ],
  },
  {
    title: '3 · Confirmarea (rodajul)',
    subtitle: 'În primele săptămâni ești aproape, nu deasupra',
    questions: [
      { id: 'pp_rodaj',     label: 'Cât durează perioada de rodaj', placeholder: 'ex: 3 săptămâni', type: 'text' },
      { id: 'pp_goluri',    label: 'Ce goluri din transfer au apărut și le-am astupat', placeholder: 'Ce a lipsit din SOP, acces sau înțelegere.', type: 'textarea' },
      { id: 'pp_intrebari', label: 'Ce întrebări a avut responsabilul cel mai des',      placeholder: 'Astea arată unde procesul nu era clar.', type: 'textarea' },
    ],
  },
  {
    title: '4 · Pasul înapoi',
    subtitle: 'Te retragi când cifra e bună constant, fără tine — nu când te simți gata',
    questions: [
      { id: 'pp_cifra',    label: 'Cifra din tablou care îmi spune că procesul merge fără mine', placeholder: 'ex: zero rupturi de stoc pe produsele cheie', type: 'text' },
      { id: 'pp_cicluri',  label: 'Câte cicluri bune la rând aștept înainte să mă retrag',        placeholder: 'ex: 4 săptămâni consecutive',              type: 'text' },
      { id: 'pp_data_pas', label: 'Data la care am făcut pasul înapoi complet',                    placeholder: '',                                          type: 'date' },
    ],
  },
];

function generateDoc10(answers: Record<string, string>): string {
  const a = (k: string) => ans(answers, k);
  const sectionBg = '#e7f0ea';
  const sectionColor = '#1A5C38';

  const firma = a('pp_firma') || '[Numele firmei]';
  const proces = a('pp_proces') || '[Numele procesului]';

  const titleBand = `
    <div class="title-band" style="background: linear-gradient(135deg, #1A5C38 0%, #2a7a4f 100%);">
      <div class="doc-num">DOCUMENT 10 · PREDAREA CHEILOR</div>
      <h1>Planul de predare a unui proces</h1>
      <span class="topic-tag">${firma}${a('pp_data_start') ? ' · ' + a('pp_data_start') : ''}</span>
    </div>`;

  const intro = `
    <div style="margin-bottom:18px;padding:11px 13px;border:1px solid var(--line);border-left:3px solid ${sectionColor};border-radius:4px;background:var(--paper-dark);font-size:11.5px;line-height:1.6;color:var(--ink-light);">
      <strong>Regula de aur:</strong> predai un proces câte unul. Nu începe al doilea până primul nu merge stabil fără tine.
      Completezi cele patru secțiuni în ordine — ele urmează exact formula din Lecția 19: alegi procesul, transferi complet, confirmi, faci pasul înapoi.
    </div>`;

  const secIdent = section('Procesul și responsabilul', undefined, sectionBg, sectionColor,
    `${fieldRow(field('Numele procesului', proces), field('Data începerii', a('pp_data_start')))}
     ${fieldRow(field('Responsabilul căruia îi predau', a('pp_responsabil')))}`);

  const critRow = (label: string, val: string) => `
    <div style="display:flex;gap:10px;align-items:flex-start;margin-bottom:9px;padding:9px 11px;border:1px solid var(--line);border-radius:4px;background:var(--paper-dark);">
      <div style="width:15px;height:15px;border:1.5px solid ${sectionColor};border-radius:3px;flex-shrink:0;margin-top:2px;"></div>
      <div style="flex:1;min-width:0;">
        <div style="font-size:11.5px;font-weight:700;color:var(--ink);margin-bottom:4px;">${label}</div>
        <div style="font-size:11.5px;color:var(--ink-light);white-space:pre-wrap;border-bottom:1px solid var(--line);min-height:20px;padding-bottom:3px;">${val || '&nbsp;'}</div>
      </div>
    </div>`;

  const sec1 = section('1 · Alegerea procesului', 'Trece cele 3 criterii — bifează toate trei', sectionBg, sectionColor,
    critRow('Risc controlat — dacă omul greșește la început, firma nu se scufundă', a('pp_c1')) +
    critRow('Om aproape gata — am deja pe cineva care îl poate prelua', a('pp_c2')) +
    critRow('Ușor de scris — procesul se poate pune pe hârtie', a('pp_c3')) +
    `<div style="font-size:10.5px;color:var(--muted);font-style:italic;margin-top:2px;">Exemplu: Gestiunea stocurilor → predată șefului de depozit. Risc controlat, om deja bun pe poziție, proces ușor de scris.</div>`);

  const trRow = (label: string, sub: string, val: string) => `
    <tr>
      <td style="width:26px;padding:9px 8px;border:1px solid var(--line);text-align:center;vertical-align:top;">
        <div style="width:14px;height:14px;border:1.5px solid ${sectionColor};border-radius:3px;margin:2px auto;"></div>
      </td>
      <td style="width:34%;padding:9px 11px;border:1px solid var(--line);vertical-align:top;background:var(--paper-dark);">
        <div style="font-size:11.5px;font-weight:700;color:var(--ink);">${label}</div>
        <div style="font-size:10.5px;color:var(--muted);margin-top:2px;">${sub}</div>
      </td>
      <td style="padding:9px 11px;border:1px solid var(--line);font-size:11.5px;vertical-align:top;white-space:pre-wrap;min-height:36px;">${val || '&nbsp;'}</td>
    </tr>`;

  const sec2 = section('2 · Transferul complet · cele 4 lucruri', 'Un transfer incomplet e cauza numărul unu a eșecului', sectionBg, sectionColor, `
    <table style="width:100%;border-collapse:collapse;">
      <thead><tr>
        <th style="padding:7px 8px;background:${sectionColor};color:#fff;border:1px solid ${sectionColor};font-size:10px;">✓</th>
        <th style="text-align:left;padding:7px 10px;background:${sectionColor};color:#fff;border:1px solid ${sectionColor};font-family:'Aboreto',serif;font-size:10px;letter-spacing:1.4px;text-transform:uppercase;">Ce transfer</th>
        <th style="text-align:left;padding:7px 10px;background:${sectionColor};color:#fff;border:1px solid ${sectionColor};font-family:'Aboreto',serif;font-size:10px;letter-spacing:1.4px;text-transform:uppercase;">Concret, la procesul meu</th>
      </tr></thead>
      <tbody>
        ${trRow('Cunoștințele', 'Procesul e scris (SOP), îl poate reciti fără mine', a('pp_t1'))}
        ${trRow('Accesul', 'Are instrumentele, conturile, datele din prima zi', a('pp_t2'))}
        ${trRow('KPI și raportare', 'Știm amândoi ce cifră și când raportează', a('pp_t3'))}
        ${trRow('Supravegherea', 'Am stabilit cât de des verific la început', a('pp_t4'))}
      </tbody>
    </table>`);

  const sec3 = section('3 · Confirmarea · perioada de rodaj', 'Ești aproape, nu deasupra. Corectați golurile cât sunt mici.', sectionBg, sectionColor,
    `${fieldRow(field('Cât durează rodajul', a('pp_rodaj')))}
     ${fieldMulti('Ce goluri din transfer au apărut și le-am astupat', a('pp_goluri'))}
     ${fieldMulti('Ce întrebări a avut responsabilul cel mai des', a('pp_intrebari'))}`);

  const sec4 = section('4 · Pasul înapoi · când mă retrag complet', 'Nu te retragi când te simți gata — te retragi când cifra e bună constant, fără tine', sectionBg, sectionColor,
    `${fieldRow(field('Cifra care îmi spune că procesul merge fără mine', a('pp_cifra')), field('Câte cicluri bune la rând aștept', a('pp_cicluri')))}
     <div style="margin-top:12px;">
       <div class="field-label">Verificarea finală înainte de pasul înapoi</div>
       <div style="display:flex;flex-direction:column;gap:7px;margin-top:6px;">
         <div style="padding:9px 12px;border:1px solid var(--line);border-radius:4px;font-size:11.5px;">☐ Cifra a fost bună mai multe cicluri la rând, fără intervenția mea</div>
         <div style="padding:9px 12px;border:1px solid var(--line);border-radius:4px;font-size:11.5px;">☐ Responsabilul a rezolvat singur situațiile care au apărut</div>
         <div style="padding:9px 12px;border:1px solid var(--line);border-radius:4px;font-size:11.5px;">☐ Nu am mai fost întrebat despre decizii care sunt acum ale lui</div>
       </div>
     </div>
     <div style="margin-top:12px;">${field('Data la care am făcut pasul înapoi complet', a('pp_data_pas'))}</div>`);

  const secFinal = `
    <div style="margin-top:14px;padding:13px 15px;border:1px solid ${sectionColor};border-radius:5px;background:#e7f0ea;">
      <div style="font-family:'Aboreto',serif;font-size:12px;letter-spacing:1.6px;text-transform:uppercase;color:${sectionColor};margin-bottom:5px;">Ai predat o cheie</div>
      <div style="font-size:11.5px;color:var(--ink-light);line-height:1.6;">Acum treci la următorul proces și iei o copie nouă a acestui plan. Unul câte unul, până ai predat toate cheile.</div>
    </div>`;

  const totalPages = 4;
  const pagesHtml = [
    renderPage('10', 'Predarea Cheilor', 1, totalPages, `${intro}${secIdent}${sec1}`, titleBand),
    renderPage('10', 'Predarea Cheilor', 2, totalPages, `${sec2}`),
    renderPage('10', 'Predarea Cheilor', 3, totalPages, `${sec3}`),
    renderPage('10', 'Predarea Cheilor', 4, totalPages, `${sec4}${secFinal}${docFooter()}`),
  ].join('');

  return htmlShell('', pagesHtml, `Plan de predare · ${proces}`);
}


// ─────────────────────────────────────────────────────────────────────────────
// DOCUMENT 11 — Registrul de greșeli (L20 · Predarea Cheilor)
// ─────────────────────────────────────────────────────────────────────────────

const doc11Steps: DocWizardStep[] = [
  {
    title: 'Identificare',
    subtitle: 'Registrul îl ții deschis, la vedere — o linie la fiecare greșeală importantă',
    questions: [
      { id: 'rg_firma', label: 'Numele firmei', placeholder: 'ex: Firma SRL', type: 'text' },
      { id: 'rg_data',  label: 'Data',          placeholder: '',              type: 'date' },
    ],
  },
  {
    title: 'Linia 1',
    subtitle: 'Nu ții evidența vinovaților. Ții evidența îmbunătățirilor.',
    questions: [
      { id: 'rg_1_data',  label: 'Data',                        placeholder: 'ex: 12.03',                              type: 'text' },
      { id: 'rg_1_ce',    label: 'Ce s-a întâmplat',            placeholder: 'ex: Clientul a primit alt produs decât cel comandat.', type: 'textarea' },
      { id: 'rg_1_cauza', label: 'Cauza reală (cei 5 de ce)',   placeholder: 'ex: Două produse asemănătoare stau pe raft fără etichetă; nimeni nu răspunde de organizarea depozitului.', type: 'textarea' },
      { id: 'rg_1_rep',   label: 'Ce am reparat în sistem',     placeholder: 'ex: Etichetat raftul; regulă de aranjare; depozitul dat în responsabilitatea șefului de depozit.', type: 'textarea' },
      { id: 'rg_1_sop',   label: 'SOP actualizat',              placeholder: 'ex: SOP Expediere — pas de verificare adăugat', type: 'text' },
    ],
  },
  {
    title: 'Linia 2',
    questions: [
      { id: 'rg_2_data',  label: 'Data',                      placeholder: '', type: 'text' },
      { id: 'rg_2_ce',    label: 'Ce s-a întâmplat',          placeholder: '', type: 'textarea' },
      { id: 'rg_2_cauza', label: 'Cauza reală (cei 5 de ce)', placeholder: '', type: 'textarea' },
      { id: 'rg_2_rep',   label: 'Ce am reparat în sistem',   placeholder: '', type: 'textarea' },
      { id: 'rg_2_sop',   label: 'SOP actualizat',            placeholder: '', type: 'text' },
    ],
  },
  {
    title: 'Linia 3',
    questions: [
      { id: 'rg_3_data',  label: 'Data',                      placeholder: '', type: 'text' },
      { id: 'rg_3_ce',    label: 'Ce s-a întâmplat',          placeholder: '', type: 'textarea' },
      { id: 'rg_3_cauza', label: 'Cauza reală (cei 5 de ce)', placeholder: '', type: 'textarea' },
      { id: 'rg_3_rep',   label: 'Ce am reparat în sistem',   placeholder: '', type: 'textarea' },
      { id: 'rg_3_sop',   label: 'SOP actualizat',            placeholder: '', type: 'text' },
    ],
  },
];

function generateDoc11(answers: Record<string, string>): string {
  const a = (k: string) => ans(answers, k);
  const sectionBg = '#f7ecec';
  const sectionColor = '#8B1A1A';
  const firma = a('rg_firma') || '[Numele firmei]';

  const titleBand = `
    <div class="title-band" style="background: linear-gradient(135deg, #8B1A1A 0%, #a82020 100%);">
      <div class="doc-num">DOCUMENT 11 · PREDAREA CHEILOR</div>
      <h1>Registrul de greșeli</h1>
      <span class="topic-tag">${firma}${a('rg_data') ? ' · ' + a('rg_data') : ''}</span>
    </div>`;

  const intro = `
    <div style="margin-bottom:16px;padding:11px 13px;border:1px solid var(--line);border-left:3px solid ${sectionColor};border-radius:4px;background:var(--paper-dark);font-size:11.5px;line-height:1.6;color:var(--ink-light);">
      <strong>Nu ții evidența vinovaților. Ții evidența îmbunătățirilor.</strong> La fiecare greșeală importantă adaugi o linie — nu ca să notezi cine a greșit, ci ce ai reparat în sistem ca să nu se mai repete. Îl completezi împreună cu responsabilul, calm, căutând cauza.
    </div>
    <div style="margin-bottom:16px;padding:11px 13px;border:1px solid var(--line);border-radius:4px;font-size:11.5px;line-height:1.6;color:var(--ink);text-align:center;">
      <span style="font-family:'Aboreto',serif;font-size:10px;letter-spacing:1.6px;text-transform:uppercase;color:${sectionColor};display:block;margin-bottom:5px;">Bucla la fiecare greșeală</span>
      Apare → Sapi (cei 5 de ce) → Repari sistemul și actualizezi SOP-ul → Notezi aici → Nu se mai repetă
      <div style="font-size:10.5px;color:var(--muted);font-style:italic;margin-top:6px;">Pasul pe care aproape toți îl sar: actualizarea SOP-ului. Fără el, reparația se pierde.</div>
    </div>`;

  const th = (label: string, w: string) =>
    `<th style="width:${w};text-align:left;padding:7px 9px;background:${sectionColor};color:#fff;border:1px solid ${sectionColor};font-family:'Aboreto',serif;font-size:9.5px;letter-spacing:1.2px;text-transform:uppercase;">${label}</th>`;

  const td = (val: string, minH = 60) =>
    `<td style="padding:8px 9px;border:1px solid var(--line);font-size:11px;vertical-align:top;white-space:pre-wrap;height:${minH}px;">${val || '&nbsp;'}</td>`;

  const row = (n: string) => `<tr>
      ${td(a(`rg_${n}_data`))}
      ${td(a(`rg_${n}_ce`))}
      ${td(a(`rg_${n}_cauza`))}
      ${td(a(`rg_${n}_rep`))}
      ${td(a(`rg_${n}_sop`))}
    </tr>`;

  const emptyRow = () => `<tr>${td('')}${td('')}${td('')}${td('')}${td('')}</tr>`;

  const tableHead = `<thead><tr>
      ${th('Data', '10%')}${th('Ce s-a întâmplat', '23%')}${th('Cauza reală (5 de ce)', '25%')}${th('Ce am reparat în sistem', '25%')}${th('SOP actualizat', '17%')}
    </tr></thead>`;

  const secExemplu = section('Exemplu completat', undefined, sectionBg, sectionColor, `
    <table style="width:100%;border-collapse:collapse;table-layout:fixed;">
      ${tableHead}
      <tbody><tr>
        ${td('12.03', 50)}
        ${td('Clientul a primit alt produs decât cel comandat.', 50)}
        ${td('Două produse asemănătoare stau pe raft fără etichetă; nimeni nu răspunde de organizarea depozitului.', 50)}
        ${td('Etichetat raftul; regulă de aranjare; depozitul dat în responsabilitatea șefului de depozit.', 50)}
        ${td('SOP Expediere — pas de verificare adăugat', 50)}
      </tr></tbody>
    </table>`);

  const secRegistru = section('Registrul tău', 'Completează o linie la fiecare greșeală importantă', sectionBg, sectionColor, `
    <table style="width:100%;border-collapse:collapse;table-layout:fixed;">
      ${tableHead}
      <tbody>
        ${row('1')}
        ${row('2')}
        ${row('3')}
      </tbody>
    </table>`);

  const secGol = section('Linii libere', 'Tipărește pagina de câte ori ai nevoie', sectionBg, sectionColor, `
    <table style="width:100%;border-collapse:collapse;table-layout:fixed;">
      ${tableHead}
      <tbody>
        ${emptyRow()}${emptyRow()}${emptyRow()}${emptyRow()}${emptyRow()}
      </tbody>
    </table>`);

  const secTest = `
    <div style="margin-top:14px;padding:12px 14px;border:1px solid ${sectionColor};border-radius:5px;background:#f7ecec;font-size:11.5px;line-height:1.6;color:var(--ink-light);">
      <strong>⚑ Testul reparației:</strong> înainte să închizi o linie, întreabă-te — după reparația asta, greșeala se mai poate întâmpla cu următorul om care face procesul? Dacă da, nu ai reparat sistemul, doar ai cârpit omul. Sapă mai adânc.
    </div>`;

  const totalPages = 2;
  const pagesHtml = [
    renderPage('11', 'Predarea Cheilor', 1, totalPages, `${intro}${secExemplu}${secRegistru}`, titleBand),
    renderPage('11', 'Predarea Cheilor', 2, totalPages, `${secGol}${secTest}${docFooter()}`),
  ].join('');

  return htmlShell('', pagesHtml, `Registrul de greșeli · ${firma}`);
}

// ─── Doc 12 · Fișa de recepție finală ────────────────────────────────────────

const doc12Steps: DocWizardStep[] = [
  {
    title: 'Identificare',
    subtitle: 'Recepția finală — nu mai construiești nimic nou, verifici că totul lucrează împreună',
    questions: [
      { id: 'rf_firma', label: 'Numele firmei', placeholder: 'ex: Firma SRL', type: 'text' },
      { id: 'rf_data', label: 'Data recepției', placeholder: '', type: 'date' },
      { id: 'rf_flux', label: 'Fluxul pe care îl verific', placeholder: 'ex: de la lead la încasare', type: 'text' },
    ],
  },
  {
    title: 'Testul de flux',
    subtitle: 'Urmărește fluxul pas cu pas: curge de la un capăt la altul fără să se oprească în tine?',
    questions: [
      { id: 'rf_p1_pas', label: 'Pasul 1', placeholder: 'ex: Lead-ul intră pe site', type: 'text' },
      { id: 'rf_p1_cine', label: 'Cine îl face / se blochează în mine?', placeholder: 'ex: Vânzătorul · NU', type: 'text' },
      { id: 'rf_p2_pas', label: 'Pasul 2', placeholder: '', type: 'text' },
      { id: 'rf_p2_cine', label: 'Cine îl face / se blochează în mine?', placeholder: '', type: 'text' },
      { id: 'rf_p3_pas', label: 'Pasul 3', placeholder: '', type: 'text' },
      { id: 'rf_p3_cine', label: 'Cine îl face / se blochează în mine?', placeholder: '', type: 'text' },
      { id: 'rf_p4_pas', label: 'Pasul 4', placeholder: '', type: 'text' },
      { id: 'rf_p4_cine', label: 'Cine îl face / se blochează în mine?', placeholder: '', type: 'text' },
      { id: 'rf_blocaje', label: 'Unde s-a oprit fluxul în mine', placeholder: 'Punctele concrete în care eu am fost liantul.', type: 'textarea' },
    ],
  },
  {
    title: 'Planul de întărire',
    subtitle: 'Pentru fiecare semn nebifat, la ce etapă te întorci și ce faci concret',
    questions: [
      { id: 'rf_i1_semn', label: 'Semnul nebifat 1', placeholder: 'ex: Deciziile tot vin la mine', type: 'text' },
      { id: 'rf_i1_plan', label: 'Etapa + ce fac concret + până când', placeholder: 'ex: Delegarea (S7) — scriu autoritatea în acordul de responsabilitate, până pe 15.09', type: 'textarea' },
      { id: 'rf_i2_semn', label: 'Semnul nebifat 2', placeholder: '', type: 'text' },
      { id: 'rf_i2_plan', label: 'Etapa + ce fac concret + până când', placeholder: '', type: 'textarea' },
      { id: 'rf_i3_semn', label: 'Semnul nebifat 3', placeholder: '', type: 'text' },
      { id: 'rf_i3_plan', label: 'Etapa + ce fac concret + până când', placeholder: '', type: 'textarea' },
    ],
  },
  {
    title: 'Noul tău rol',
    subtitle: 'Nu ești inutil când firma merge fără tine. Ești liber. Maxim 5 zone rămân ale tale.',
    questions: [
      { id: 'rf_rol', label: 'Cum arată noul meu rol de proprietar', placeholder: 'Ce fac, ce nu mai fac, cu ce îmi umplu ziua.', type: 'textarea' },
      { id: 'rf_z1', label: 'Zona 1', placeholder: 'ex: Strategie — 4h/săptămână', type: 'text' },
      { id: 'rf_z2', label: 'Zona 2', placeholder: '', type: 'text' },
      { id: 'rf_z3', label: 'Zona 3', placeholder: '', type: 'text' },
      { id: 'rf_z4', label: 'Zona 4', placeholder: '', type: 'text' },
      { id: 'rf_z5', label: 'Zona 5', placeholder: '', type: 'text' },
      { id: 'rf_absenta', label: 'Ce s-ar rupe dacă aș pleca 2 săptămâni, azi', placeholder: 'Fii cinstit. Ce mai scârțâie și la ce etapă e legat.', type: 'textarea' },
    ],
  },
];

function generateDoc12(answers: Record<string, string>): string {
  const a = (k: string) => ans(answers, k);
  const sectionBg = '#f0f4f0';
  const sectionColor = '#2F5233';
  const firma = a('rf_firma') || '[Numele firmei]';

  const titleBand = `
    <div class="title-band" style="background: linear-gradient(135deg, #2F5233 0%, #3d6b42 100%);">
      <div class="doc-num">DOCUMENT 12 · RECEPȚIA FINALĂ</div>
      <h1>Fișa de recepție finală</h1>
      <span class="topic-tag">${firma}${a('rf_data') ? ' · ' + a('rf_data') : ''}</span>
    </div>`;

  const intro = `
    <div style="margin-bottom:16px;padding:11px 13px;border:1px solid var(--line);border-left:3px solid ${sectionColor};border-radius:4px;background:var(--paper-dark);font-size:11.5px;line-height:1.6;color:var(--ink-light);">
      <strong>Astăzi nu mai construiești nimic nou.</strong> Verifici că piesele construite în cele cinci etape lucrează împreună, ca un singur organism. La final ai o radiografie clară: ce merge, ce mai ai de întărit și cine devii de acum.
    </div>`;

  const th = (label: string, w: string) =>
    `<th style="width:${w};text-align:left;padding:7px 9px;background:${sectionColor};color:#fff;border:1px solid ${sectionColor};font-family:'Aboreto',serif;font-size:9.5px;letter-spacing:1.2px;text-transform:uppercase;">${label}</th>`;

  const td = (val: string, minH = 44) =>
    `<td style="padding:8px 9px;border:1px solid var(--line);font-size:11px;vertical-align:top;white-space:pre-wrap;height:${minH}px;">${val || '&nbsp;'}</td>`;

  const secFlux = section('1 · Testul de flux', `Fluxul verificat: ${a('rf_flux') || '_______________'}`, sectionBg, sectionColor, `
    <table style="width:100%;border-collapse:collapse;table-layout:fixed;">
      <thead><tr>${th('Pasul', '52%')}${th('Cine îl face · se blochează în mine?', '48%')}</tr></thead>
      <tbody>
        <tr>${td(a('rf_p1_pas'))}${td(a('rf_p1_cine'))}</tr>
        <tr>${td(a('rf_p2_pas'))}${td(a('rf_p2_cine'))}</tr>
        <tr>${td(a('rf_p3_pas'))}${td(a('rf_p3_cine'))}</tr>
        <tr>${td(a('rf_p4_pas'))}${td(a('rf_p4_cine'))}</tr>
      </tbody>
    </table>
    ${field('Unde s-a oprit fluxul în mine', a('rf_blocaje'))}`);

  const semne = [
    'Deciziile zilnice se iau fără mine — oamenii au autoritate și o folosesc',
    'Cifrele vin la mine singure, în tablou — nu le mai adun eu întrebând',
    'Când apare o problemă, responsabilul funcției o rezolvă, nu eu',
    'Pot lipsi câteva zile și firma merge',
    'Ziua mea nu mai e plină de operațional — am timp să gândesc direcția',
    'Nu mai sunt singura sursă de adevăr despre cum merge firma',
  ]
    .map(
      (s) =>
        `<div style="display:flex;gap:9px;align-items:flex-start;padding:7px 0;border-bottom:1px dashed var(--line);font-size:11.5px;line-height:1.5;">
          <span style="display:inline-block;width:13px;height:13px;border:1.4px solid ${sectionColor};border-radius:2px;flex-shrink:0;margin-top:2px;"></span>
          <span>${s}</span>
        </div>`
    )
    .join('');

  const secSemne = section('2 · Cele 6 semne ale recepției reușite', 'Bifează doar ce e adevărat astăzi, nu ce ți-ai dori', sectionBg, sectionColor, semne);

  const secHarta = section('3 · Harta de întărire', 'Un semn nebifat nu e un eșec. E o hartă.', sectionBg, sectionColor, `
    <table style="width:100%;border-collapse:collapse;table-layout:fixed;margin-bottom:12px;">
      <thead><tr>${th('Dacă semnul lipsește...', '50%')}${th('...întoarce-te la etapa asta', '50%')}</tr></thead>
      <tbody>
        <tr>${td('Deciziile tot vin la tine', 26)}${td('Delegarea, S7 — lipsește autoritatea', 26)}</tr>
        <tr>${td('Nu vezi cum merge firma fără să întrebi', 26)}${td('Contoarele, S6 — tabloul e incomplet', 26)}</tr>
        <tr>${td('Oamenii nu știu cum se face o treabă', 26)}${td('Instalațiile, S4 — lipsește un SOP', 26)}</tr>
        <tr>${td('Nu e clar cine răspunde de ce', 26)}${td('Pereții, S3 — rol neclar în organigramă', 26)}</tr>
        <tr>${td('Aluneci mereu înapoi în operațional', 26)}${td('Fundația, S1 — rolul tău nu e scris clar', 26)}</tr>
      </tbody>
    </table>
    <table style="width:100%;border-collapse:collapse;table-layout:fixed;">
      <thead><tr>${th('Semnul nebifat', '38%')}${th('Etapa · ce fac concret · până când', '62%')}</tr></thead>
      <tbody>
        <tr>${td(a('rf_i1_semn'))}${td(a('rf_i1_plan'))}</tr>
        <tr>${td(a('rf_i2_semn'))}${td(a('rf_i2_plan'))}</tr>
        <tr>${td(a('rf_i3_semn'))}${td(a('rf_i3_plan'))}</tr>
      </tbody>
    </table>`);

  const zone = ['rf_z1', 'rf_z2', 'rf_z3', 'rf_z4', 'rf_z5']
    .map((k, i) => `<tr>${td(String(i + 1), 24)}${td(a(k), 24)}</tr>`)
    .join('');

  const secRol = section('4 · Noul meu rol de proprietar', 'Nu ești inutil când firma merge fără tine. Ești liber.', sectionBg, sectionColor, `
    ${field('Cum arată noul meu rol', a('rf_rol'))}
    <table style="width:100%;border-collapse:collapse;table-layout:fixed;margin-top:10px;">
      <thead><tr>${th('#', '8%')}${th('Zonele care rămân ale mele (maxim 5)', '92%')}</tr></thead>
      <tbody>${zone}</tbody>
    </table>`);

  const secTest = `
    <div style="margin-top:14px;padding:12px 14px;border:1px solid ${sectionColor};border-radius:5px;background:${sectionBg};font-size:11.5px;line-height:1.6;color:var(--ink-light);">
      <strong>⚑ Testul adevărat:</strong> dacă ai pleca două săptămâni, complet deconectat — ce s-ar rupe? Dacă răspunsul e „nimic esențial", ai reușit ce încearcă majoritatea antreprenorilor toată viața.
    </div>
    ${field('Ce s-ar rupe dacă aș pleca 2 săptămâni, azi', a('rf_absenta'))}`;

  const totalPages12 = 3;
  const pagesHtml12 = [
    renderPage('12', 'Recepția Finală', 1, totalPages12, `${intro}${secFlux}${secSemne}`, titleBand),
    renderPage('12', 'Recepția Finală', 2, totalPages12, secHarta),
    renderPage('12', 'Recepția Finală', 3, totalPages12, `${secRol}${secTest}${docFooter()}`),
  ].join('');

  return htmlShell('', pagesHtml12, `Fișa de recepție finală · ${firma}`);
}

// ─── Doc 13 · Ritmul de conducere ────────────────────────────────────────────

const doc13Steps: DocWizardStep[] = [
  {
    title: 'Identificare',
    subtitle: 'Dacă nu e în calendar, nu există',
    questions: [
      { id: 'rc_firma', label: 'Numele firmei', placeholder: 'ex: Firma SRL', type: 'text' },
      { id: 'rc_data', label: 'Data', placeholder: '', type: 'date' },
    ],
  },
  {
    title: 'Ședința săptămânală',
    subtitle: 'Inima ritmului — 30–60 de minute, aceeași zi, aceeași agendă',
    questions: [
      { id: 'rc_sed_zi', label: 'Ziua și ora', placeholder: 'ex: Luni, 09:00', type: 'text' },
      { id: 'rc_sed_durata', label: 'Durata', placeholder: 'ex: 45 minute', type: 'text' },
      { id: 'rc_sed_cine', label: 'Cine participă', placeholder: 'Responsabilii de funcții, nu toată echipa.', type: 'textarea' },
    ],
  },
  {
    title: 'Analiza lunară',
    subtitle: 'Săptămânal repari ce arde. Lunar repari ce face lucrurile să ardă.',
    questions: [
      { id: 'rc_luna_zi', label: 'Ce zi din lună', placeholder: 'ex: prima vineri a lunii', type: 'text' },
      { id: 'rc_luna_q1', label: '1 · Ce a fost roșu repetat?', placeholder: '', type: 'textarea' },
      { id: 'rc_luna_q2', label: '2 · Ce arată registrul de greșeli?', placeholder: '', type: 'textarea' },
      { id: 'rc_luna_q3', label: '3 · Țintele mai sunt corecte?', placeholder: '', type: 'textarea' },
      { id: 'rc_luna_q4', label: '4 · Unde mă trage înapoi firma?', placeholder: '', type: 'textarea' },
    ],
  },
  {
    title: 'Calendarul și disciplina',
    subtitle: 'Blocul de gândire e cel pe care îl sare toată lumea și e cel mai valoros',
    questions: [
      { id: 'rc_b_tablou', label: 'Privirea la tablou — când', placeholder: 'ex: zilnic, 08:30, 5 min', type: 'text' },
      { id: 'rc_b_sedinta', label: 'Ședința de conducere — când', placeholder: 'ex: luni, 09:00, 45 min', type: 'text' },
      { id: 'rc_b_unu', label: 'Unu la unu cu responsabilii — când', placeholder: 'ex: prima săptămână din lună, 30 min fiecare', type: 'text' },
      { id: 'rc_b_analiza', label: 'Analiza lunară — când', placeholder: 'ex: prima vineri, 10:00–12:00', type: 'text' },
      { id: 'rc_b_gandire', label: 'Timp de gândire — când (2 ore, singur, fără telefon)', placeholder: 'ex: vineri, 15:00–17:00', type: 'text' },
      { id: 'rc_regula', label: 'Regula mea de disciplină', placeholder: 'ex: Când vine o decizie care nu e a mea, nu o iau. „Asta o decide [rolul]."', type: 'textarea' },
    ],
  },
];

function generateDoc13(answers: Record<string, string>): string {
  const a = (k: string) => ans(answers, k);
  const sectionBg = '#f6f1e7';
  const sectionColor = '#8A6D2F';
  const firma = a('rc_firma') || '[Numele firmei]';

  const titleBand = `
    <div class="title-band" style="background: linear-gradient(135deg, #8A6D2F 0%, #C9A96E 100%);">
      <div class="doc-num">DOCUMENT 13 · RECEPȚIA FINALĂ</div>
      <h1>Ritmul de conducere</h1>
      <span class="topic-tag">${firma}${a('rc_data') ? ' · ' + a('rc_data') : ''}</span>
    </div>`;

  const intro = `
    <div style="margin-bottom:16px;padding:11px 13px;border:1px solid var(--line);border-left:3px solid ${sectionColor};border-radius:4px;background:var(--paper-dark);font-size:11.5px;line-height:1.6;color:var(--ink-light);">
      <strong>Un rol nou fără un ritm nou se pierde.</strong> Golul lăsat de operațional se umple cu operațional dacă nu îl umpli tu cu conducere. Dacă nu e în calendar, nu există.
    </div>`;

  const th = (label: string, w: string) =>
    `<th style="width:${w};text-align:left;padding:7px 9px;background:${sectionColor};color:#fff;border:1px solid ${sectionColor};font-family:'Aboreto',serif;font-size:9.5px;letter-spacing:1.2px;text-transform:uppercase;">${label}</th>`;

  const td = (val: string, minH = 30) =>
    `<td style="padding:8px 9px;border:1px solid var(--line);font-size:11px;vertical-align:top;white-space:pre-wrap;height:${minH}px;">${val || '&nbsp;'}</td>`;

  const agenda = [
    ['1', 'Deschizi tabloul', '5 minute. Toți văd aceleași cifre. Fără comentarii.'],
    ['2', 'Treci doar pe rândurile roșii', 'Pentru fiecare: ce s-a făcut, ce rezultat a ieșit, ce te-a blocat.'],
    ['3', 'Deciziile care se cer de la tine', 'Doar cele care nu sunt ale lor.'],
    ['4', 'Cine ce face până săptămâna viitoare', 'Acțiune + responsabil, notate.'],
  ]
    .map(([n, t, d]) => `<tr>${td(n, 24)}${td(`<strong>${t}</strong>`, 24)}${td(d, 24)}</tr>`)
    .join('');

  const secSedinta = section('1 · Ședința săptămânală', 'Inima ritmului', sectionBg, sectionColor, `
    ${field('Ziua și ora', a('rc_sed_zi'))}
    ${field('Durata', a('rc_sed_durata'))}
    ${field('Cine participă', a('rc_sed_cine'))}
    <table style="width:100%;border-collapse:collapse;table-layout:fixed;margin-top:10px;">
      <thead><tr>${th('#', '7%')}${th('Pasul', '32%')}${th('Ce faci', '61%')}</tr></thead>
      <tbody>${agenda}</tbody>
    </table>
    <div style="margin-top:9px;font-size:10.5px;color:var(--muted);font-style:italic;">Ce NU se face: nu le rezolvi tu problemele, nu cobori în detalii operaționale, nu vânezi vinovați la roșu — cauți ce a lipsit din sistem.</div>`);

  const secLuna = section('2 · Analiza lunară', `1–2 ore, ${a('rc_luna_zi') || '_______________'}`, sectionBg, sectionColor, `
    ${field('1 · Ce a fost roșu repetat?', a('rc_luna_q1'))}
    ${field('2 · Ce arată registrul de greșeli?', a('rc_luna_q2'))}
    ${field('3 · Țintele mai sunt corecte?', a('rc_luna_q3'))}
    ${field('4 · Unde mă trage înapoi firma?', a('rc_luna_q4'))}`);

  const blocuri = [
    ['Privirea la tablou', 'Zilnic, 5 min', a('rc_b_tablou')],
    ['Ședința de conducere', 'Săptămânal, 30–60 min', a('rc_b_sedinta')],
    ['Unu la unu cu responsabilii', 'Lunar, 30 min fiecare', a('rc_b_unu')],
    ['Analiza lunară', 'Lunar, 1–2 ore', a('rc_b_analiza')],
    ['Timp de gândire', 'Săptămânal, 2 ore, singur', a('rc_b_gandire')],
  ]
    .map(([b, f, v]) => `<tr>${td(`<strong>${b}</strong>`)}${td(f)}${td(v)}</tr>`)
    .join('');

  const secCalendar = section('3 · Calendarul de conducere', 'Un bloc pe care îl muți mereu nu există', sectionBg, sectionColor, `
    <table style="width:100%;border-collapse:collapse;table-layout:fixed;">
      <thead><tr>${th('Blocul', '32%')}${th('Cât de des', '28%')}${th('Când, în calendarul meu', '40%')}</tr></thead>
      <tbody>${blocuri}</tbody>
    </table>
    <div style="margin-top:9px;font-size:10.5px;color:var(--muted);font-style:italic;">Blocul de gândire e singura activitate pe care nu o poate face nimeni altcineva pentru tine. Tratează-l ca pe o ședință cu cea mai importantă persoană din firmă — pentru că este.</div>`);

  const semnale = [
    'Răspund la întrebări care nu sunt ale mele — și mi se pare normal',
    'Iau decizii peste responsabili, „ca să meargă mai repede"',
    'Ședința săptămânală se amână sau se anulează pentru că „e aglomerat"',
    'Nu mai am timp de blocul de gândire, săptămână după săptămână',
    'Mă uit la tablou mai rar, pentru că oricum știu eu ce se întâmplă',
    'Oamenii au început iar să vină la mine, nu la responsabilul lor',
  ]
    .map(
      (s) =>
        `<div style="display:flex;gap:9px;align-items:flex-start;padding:7px 0;border-bottom:1px dashed var(--line);font-size:11.5px;line-height:1.5;">
          <span style="display:inline-block;width:13px;height:13px;border:1.4px solid ${sectionColor};border-radius:2px;flex-shrink:0;margin-top:2px;"></span>
          <span>${s}</span>
        </div>`
    )
    .join('');

  const secSemnale = section('4 · Semnalele de alunecare', 'Alunecarea e ușor de oprit la început și grea după trei luni', sectionBg, sectionColor, semnale);

  const secRegula = `
    <div style="margin-top:14px;padding:14px 16px;border:1.5px solid ${sectionColor};border-radius:5px;background:${sectionBg};text-align:center;">
      <span style="font-family:'Aboreto',serif;font-size:10px;letter-spacing:1.6px;text-transform:uppercase;color:${sectionColor};display:block;margin-bottom:7px;">Regula de disciplină — ține-o la vedere</span>
      <div style="font-size:12.5px;line-height:1.6;color:var(--ink);">${a('rc_regula') || 'Când vine o decizie care nu e a mea, nu o iau. „Asta o decide [rolul], vorbește cu el." De fiecare dată.'}</div>
    </div>`;

  const totalPages13 = 3;
  const pagesHtml13 = [
    renderPage('13', 'Recepția Finală', 1, totalPages13, `${intro}${secSedinta}`, titleBand),
    renderPage('13', 'Recepția Finală', 2, totalPages13, secLuna),
    renderPage('13', 'Recepția Finală', 3, totalPages13, `${secCalendar}${secSemnale}${secRegula}${docFooter()}`),
  ].join('');

  return htmlShell('', pagesHtml13, `Ritmul de conducere · ${firma}`);
}


// ─────────────────────────────────────────────────────────────────────────────
// PLATFORM_DOCUMENTS export
// ─────────────────────────────────────────────────────────────────────────────



export const PLATFORM_DOCUMENTS: PlatformDocument[] = [
  {
    id: 'doc-1',
    lessonIds: ['l-0-3', 'l-0-ex-5'],
    docNumber: '01',
    title: 'Cele 10 Conversații Obligatorii Înainte de Orice Parteneriat',
    shortTitle: 'Înainte de Parteneriat',
    description:
      'Ghid complet cu întrebările esențiale de discutat cu un potențial partener înainte de a semna orice document oficial.',
    downloadUrl: '/docs/AA_Doc1_Inainte_Parteneriat.pdf',
    topic: 'Parteneriatul',
    color: 'green',
    steps: doc1Steps,
    generate: generateDoc1,
  },
  {
    id: 'doc-2',
    lessonIds: ['l-0-3', 'l-0-ex-5'],
    docNumber: '02',
    title: 'Protocol de Ieșire sau Restructurare a Parteneriatului',
    shortTitle: 'Protocol de Ieșire',
    description:
      'Pași clari pentru diagnosticarea, discuția directă și execuția legală a ieșirii sau restructurării unui parteneriat.',
    downloadUrl: '/docs/AA_Doc2_Iesire_Parteneriat.pdf',
    topic: 'Parteneriatul',
    color: 'red',
    steps: doc2Steps,
    generate: generateDoc2,
  },
  {
    id: 'doc-3',
    lessonIds: ['l-0-3', 'l-0-ex-5'],
    docNumber: '03',
    title: 'Acord de Parteneriat Minimal',
    shortTitle: 'Acord Minimal',
    description:
      'Contract pre-legal simplu, semnat înainte de notar. Forțează conversațiile esențiale și stabilește regulile de bază.',
    downloadUrl: '/docs/AA_Doc3_Acord_Parteneriat_Minimal.pdf',
    topic: 'Parteneriatul',
    color: 'gold',
    steps: doc3Steps,
    generate: generateDoc3,
  },
  {
    id: 'sop-procedura',
    lessonIds: ['l-3-2', 'l-3-4'],
    docNumber: '04',
    title: 'SOP · Procedură Standard de Operare',
    shortTitle: 'SOP — Procedură Standard',
    description:
      'Template tipăribil pentru documentarea unui proces: identificare, scop, roluri, pași (Nr/Responsabil/Acțiune/Output) și criteriu de calitate. Companion pentru Exercițiul „Primul SOP documentat" din Săptămâna 4.',
    downloadUrl: '',
    topic: 'Instalațiile',
    color: 'green',
    steps: doc4Steps,
    generate: generateDoc4,
  },
  {
    id: 'doc-fisa-post',
    lessonIds: ['l-4-1', 'l-4-2', 'l-4-3'],
    docNumber: '05',
    title: 'Fișă de Post',
    shortTitle: 'Fișă de Post',
    description:
      'Template tipăribil pentru fișa de post: scopul rolului, produsul, criteriul de evaluare, KPI, limite de autoritate, salariu și resurse. Companion pentru Săptămâna 5 — Contoarele.',
    downloadUrl: '',
    topic: 'Oamenii',
    color: 'gold',
    steps: doc5Steps,
    generate: generateDoc5,
  },
  {
    id: 'doc-instructiune',
    lessonIds: ['l-4-1', 'l-4-2', 'l-4-3'],
    docNumber: '06',
    title: 'Instrucțiune de Lucru',
    shortTitle: 'Instrucțiune de Lucru',
    description:
      'Template tipăribil pentru instrucțiuni operaționale: scop, materiale necesare, pași concreți, criterii de calitate, greșeli frecvente și situații de excepție. Companion pentru Săptămâna 5.',
    downloadUrl: '',
    topic: 'Instrucțiune',
    color: 'red',
    steps: doc6Steps,
    generate: generateDoc6,
  },
  {
    id: 'doc-kpi',
    lessonIds: ['l-4-4', 'l-4-ex-1'],
    docNumber: '07',
    title: 'Fișa KPI',
    shortTitle: 'Fișa KPI',
    description:
      'Template tipăribil pentru un KPI complet: rol, produsul funcției, cele 6 elemente (nume, legătura cu produsul, unitate, țintă, frecvență, responsabil) + testul final. Companion pentru Lecția 15.',
    downloadUrl: '',
    topic: 'KPI',
    color: 'gold',
    steps: doc7Steps,
    generate: generateDoc7,
  },
  {
    id: 'doc-kpi-viu',
    lessonIds: ['l-4-5', 'l-4-ex-2'],
    docNumber: '08',
    title: 'Fișa KPI Viu',
    shortTitle: 'KPI Viu',
    description:
      'Template tipăribil pentru un KPI viu: cele 6 elemente + poarta de calitate + cele 3 praguri (roșu / galben / verde) + legătura cu salariul (fix + variabil pe prag). Companion pentru Lecția 16.',
    downloadUrl: '',
    topic: 'KPI Viu',
    color: 'red',
    steps: doc8Steps,
    generate: generateDoc8,
  },
  {
    id: 'doc-tablou-bord',
    lessonIds: ['l-4-6', 'l-4-ex-3'],
    docNumber: '09',
    title: 'Tabloul de bord',
    shortTitle: 'Tabloul de bord',
    description:
      'Template tipăribil cu cele 7 funcții ale firmei: indicator, țintă, realizat, stare (roșu / galben / verde) și responsabil. Plus regula desfacerii și sistemul de raportare săptămânal. Companion pentru Lecția 17.',
    downloadUrl: '',
    topic: 'Tablou de bord',
    color: 'green',
    steps: doc9Steps,
    generate: generateDoc9,
  },
  {
    id: 'doc-plan-predare',
    lessonIds: ['l-5-2', 'l-5-ex-2'],
    docNumber: '10',
    title: 'Planul de predare a unui proces',
    shortTitle: 'Plan de predare',
    description:
      'Template tipăribil pentru predarea unui proces: alegerea prin cele 3 criterii, transferul complet (cunoștințe, acces, KPI, supraveghere), rodajul și pasul înapoi. Companion pentru Lecția 19.',
    downloadUrl: '',
    topic: 'Predarea Cheilor',
    color: 'green',
    steps: doc10Steps,
    generate: generateDoc10,
  },
  {
    id: 'doc-registru-greseli',
    lessonIds: ['l-5-3', 'l-5-ex-3'],
    docNumber: '11',
    title: 'Registrul de greșeli',
    shortTitle: 'Registrul de greșeli',
    description:
      'Template tipăribil unde fiecare greșeală devine o îmbunătățire permanentă: ce s-a întâmplat, cauza reală (cei 5 de ce), ce ai reparat în sistem și ce SOP ai actualizat. Companion pentru Lecția 20.',
    downloadUrl: '',
    topic: 'Predarea Cheilor',
    color: 'red',
    steps: doc11Steps,
    generate: generateDoc11,
  },
  {
    id: 'doc-receptie-finala',
    lessonIds: ['l-6-1', 'l-6-ex-1'],
    docNumber: '12',
    title: 'Fișa de recepție finală',
    shortTitle: 'Recepția finală',
    description:
      'Template tipăribil pentru recepția firmei: testul de flux de la lead la încasare, cele 6 semne ale recepției reușite, harta de întărire pe etape și fișa noului tău rol de proprietar. Companion pentru Lecția 21.',
    downloadUrl: '',
    topic: 'Recepția Finală',
    color: 'green',
    steps: doc12Steps,
    generate: generateDoc12,
  },
  {
    id: 'doc-ritm-conducere',
    lessonIds: ['l-6-2', 'l-6-ex-2'],
    docNumber: '13',
    title: 'Ritmul de conducere',
    shortTitle: 'Ritmul de conducere',
    description:
      'Template tipăribil cu ritmul tău de proprietar: ședința săptămânală cu agendă fixă, analiza lunară cu cele 4 întrebări, blocurile din calendar și regula de disciplină împotriva alunecării. Companion pentru Lecția 22.',
    downloadUrl: '',
    topic: 'Recepția Finală',
    color: 'gold',
    steps: doc13Steps,
    generate: generateDoc13,
  },
];

/** Documentele unei singure ramuri. Fiecare curs își are setul lui de printabile. */
export function documentsForCourse(courseId: string | null | undefined): PlatformDocument[] {
  if (!courseId) return [];
  return PLATFORM_DOCUMENTS.filter(doc => (doc.courseId || 'business') === courseId);
}

export function documentBelongsToCourse(doc: PlatformDocument | undefined, courseId: string | null | undefined): boolean {
  return !!doc && !!courseId && (doc.courseId || 'business') === courseId;
}
