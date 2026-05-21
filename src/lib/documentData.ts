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
  const win = window.open('', '_blank', 'width=900,height=700,scrollbars=yes');
  if (!win) {
    // Fallback if popups blocked — download as HTML
    const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'document.html';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    return;
  }
  win.document.write(html);
  win.document.close();
  // Automatically trigger browser print dialog
  win.print();
}

// ─── Shared HTML helpers ─────────────────────────────────────────────────────

const FONTS = `<link href="https://fonts.googleapis.com/css2?family=Aboreto&family=Arimo:ital,wght@0,400;0,500;0,600;0,700;1,400&display=swap" rel="stylesheet">`;

// AA Monogram SVG — two interlocking A shapes
const MONOGRAM_SVG = (height = 40, fill1 = '#C9A96E', fill2 = 'rgba(201,169,110,0.45)') =>
  `<svg height="${height}" viewBox="0 0 303 240" fill="none" xmlns="http://www.w3.org/2000/svg" style="display:block;flex-shrink:0">
    <path d="M93.6414 229.092L194.246 4.82955L214.537 5.94268L290.006 239.864L266.115 238.554L231.422 128.981L157.13 124.906L117.532 230.403L93.6414 229.092ZM195.603 21.9735L159.852 117.177L228.907 120.965L197.567 22.0812L195.603 21.9735Z" fill="${fill1}"/>
    <path d="M208.932 229.092L108.328 4.82955L88.037 5.94268L12.5678 239.864L36.4588 238.554L71.152 128.981L145.443 124.906L185.041 230.403L208.932 229.092ZM106.971 21.9735L142.721 117.177L73.6666 120.965L105.007 22.0812L106.971 21.9735Z" fill="${fill2}"/>
  </svg>`;


const BASE_STYLES = `
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

function htmlShell(
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

function aaHeader(docNum: string, topic: string): string {
  return `
    <div class="aa-header">
      ${MONOGRAM_SVG(40, '#C9A96E', 'rgba(201,169,110,0.4)')}
      <div class="aa-header-text">
        <div class="aa-header-brand">Arhitectura Afacerii</div>
        <div class="aa-header-subtitle">Victor Morar · Program de Mentorat</div>
      </div>
      <div class="aa-doc-tag">Doc ${docNum} · ${topic}</div>
    </div>
    <div class="aa-header-accent"></div>`;
}

function aaFooter(_docNum: string, pageInfo = ''): string {
  return `
    <div class="aa-footer-sep"></div>
    <div class="aa-footer">
      <div class="aa-footer-left">
        ${MONOGRAM_SVG(22, 'rgba(255,255,255,0.22)', 'rgba(255,255,255,0.1)')}
        <div class="aa-footer-brand">Arhitectura Afacerii · Victor Morar</div>
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
  return `<div class="doc-disclaimer">Generat cu <strong>Arhitectura Afacerii</strong> · Victor Morar · Program de Mentorat. Document confidențial, generat local — datele nu se transmit pe niciun server.</div>`;
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
];
