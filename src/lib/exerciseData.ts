export interface QuizQuestionItem {
  id: string;
  text: string;
  type: 'scale5' | 'yesno';
  /** Optional grouping (used by 'diagnostic' templates to render dimension headers and scores). */
  dimension?: string;
}

export interface ChecklistItem {
  id: string;
  label: string;
}

/** Column for a dynamic-table field. Plain string label (free-text column) or object spec with select options. */
export type DynamicTableColumn = string | { name: string; options?: string[]; width?: string };

export interface FormField {
  id: string;
  type: 'info' | 'textarea' | 'input' | 'dynamic-table';
  label?: string;
  placeholder?: string;
  text?: string;
  /** For dynamic-table: simple list of column labels. */
  columns?: string[];
  /** For dynamic-table: richer column specs (select options, custom width). When set, overrides `columns`. */
  columnsSpec?: DynamicTableColumn[];
  addLabel?: string;
  minRows?: number;
}

export interface ExerciseTemplate {
  exerciseId: string;
  type: 'checklist' | 'form-fields' | 'quiz' | 'text-input' | 'rating-grid' | 'dynamic-table' | 'diagnostic';
  title: string;
  instructions: string;
  items?: ChecklistItem[];
  fields?: FormField[];
  questions?: QuizQuestionItem[];
  /** Diagnostic-specific: ordered list of dimension labels. */
  dimensions?: string[];
}


export const EXERCISE_TEMPLATES: ExerciseTemplate[] = [
  // ─── ETAPA 0 — PROIECTUL CASEI ───────────────────────────────────────────────

  // e-0-1: Auditul activităților tale → dynamic-table cu select pe Categorie
  {
    exerciseId: 'e-0-1',
    type: 'dynamic-table',
    title: 'Auditul activităților tale',
    instructions:
      'Scrii TOT ce faci în mod obișnuit în firma ta — nu ce ar trebui, ci ce faci efectiv. Estimezi % din timp pentru fiecare. La final clasifici: Specialist, Director sau Proprietar. Regula: totalul = 100%.',
    fields: [
      {
        id: 'aa_info',
        type: 'info',
        text: 'Specialist = execuți tu (livrezi munca). Director = coordonezi și decizi pe operațional. Proprietar = strategie, oameni cheie, viziune. Totalul % trebuie să dea 100.',
      },
      {
        id: 'aa_table',
        type: 'dynamic-table',
        columnsSpec: [
          { name: 'Activitatea', width: '46%' },
          { name: '% din timp', width: '16%' },
          { name: 'Categorie', width: '32%', options: ['Specialist', 'Director', 'Proprietar'] },
        ],
        addLabel: 'Adaugă activitate',
        minRows: 5,
      },
    ],
  },

  // e-0-2: Harta gâturilor de sticlă → dynamic-table cu select Da/Nu
  {
    exerciseId: 'e-0-2',
    type: 'dynamic-table',
    title: 'Harta gâturilor de sticlă',
    instructions:
      'Listezi toate deciziile și situațiile din ultima săptămână care au ajuns la tine. Pentru fiecare: chiar trebuia să fii TU sau e o lipsă a sistemului? Și cât timp ți-a luat.',
    fields: [
      {
        id: 'hg_info',
        type: 'info',
        text: 'Notează tot ce a trecut prin tine — aprobări, întrebări, decizii mici. Cu cât lista e mai lungă, cu atât diagnosticul e mai precis.',
      },
      {
        id: 'hg_table',
        type: 'dynamic-table',
        columnsSpec: [
          { name: 'Decizia / situația', width: '40%' },
          { name: 'Chiar trebuia tu?', width: '18%', options: ['Da', 'Nu'] },
          { name: 'Cauza reală', width: '28%' },
          { name: 'Timp (min)', width: '14%' },
        ],
        addLabel: 'Adaugă rând',
        minRows: 5,
      },
    ],
  },

  // e-0-3: Testul de absență → dynamic-table cu select gravitate
  {
    exerciseId: 'e-0-3',
    type: 'dynamic-table',
    title: 'Testul de absență',
    instructions:
      'Dacă ai pleca mâine 2 zile și nu ai răspunde la niciun mesaj — ce s-ar întâmpla? Scrii TOATE scenariile fără filtru. Pentru fiecare: gravitatea și cauza reală.',
    fields: [
      {
        id: 'ta_info',
        type: 'info',
        text: 'Vei vedea că majoritatea fricilor sunt cauzate de lipsă de sisteme, nu de tine personal. Asta e exact ce vrem să descoperi.',
      },
      {
        id: 'ta_table',
        type: 'dynamic-table',
        columnsSpec: [
          { name: 'Scenariul (ce s-ar întâmpla)', width: '50%' },
          { name: 'Gravitate', width: '20%', options: ['1 – minor', '2 – mic', '3 – mediu', '4 – mare', '5 – critic'] },
          { name: 'Cauza reală (sistem sau persoană?)', width: '30%' },
        ],
        addLabel: 'Adaugă scenariu',
        minRows: 5,
      },
    ],
  },

  // e-0-4: Diagnosticul complet → 50 întrebări pe 6 dimensiuni
  {
    exerciseId: 'e-0-4',
    type: 'diagnostic',
    title: 'Diagnosticul complet · 50 întrebări',
    instructions:
      'Te evaluezi pe scala 1–5 la 50 de întrebări împărțite pe 6 dimensiuni. Rezultatul: scor pe fiecare dimensiune și cele 3 priorități de unde începi.',
    dimensions: [
      'Claritate & Rol',
      'Structură & Oameni',
      'Procese',
      'Control & KPI',
      'Delegare',
      'Management & Scalare',
    ],
    questions: [
      // Claritate & Rol (8)
      { id: 'd1', dimension: 'Claritate & Rol', type: 'scale5', text: 'Știu exact care e rolul meu de proprietar (nu de operator) în firmă.' },
      { id: 'd2', dimension: 'Claritate & Rol', type: 'scale5', text: 'Misiunea companiei e scrisă și o cunoaște toată echipa.' },
      { id: 'd3', dimension: 'Claritate & Rol', type: 'scale5', text: 'Viziunea la 3 ani e scrisă cu cifre concrete (CA, oameni, profit).' },
      { id: 'd4', dimension: 'Claritate & Rol', type: 'scale5', text: 'Valorile companiei sunt traduse în comportamente clare, nu doar slogane.' },
      { id: 'd5', dimension: 'Claritate & Rol', type: 'scale5', text: 'Pot răspunde în 2 propoziții la întrebarea „de ce există firma ta?".' },
      { id: 'd6', dimension: 'Claritate & Rol', type: 'scale5', text: 'Echipa știe ce NU faci tu (și ce nu trebuie să-mi mai aducă).' },
      { id: 'd7', dimension: 'Claritate & Rol', type: 'scale5', text: 'Identitatea companiei e clară și folosită în recrutare și vânzări.' },
      { id: 'd8', dimension: 'Claritate & Rol', type: 'scale5', text: 'Am criterii clare după care iau deciziile mari (nu „pe simțite").' },

      // Structură & Oameni (9)
      { id: 'd9', dimension: 'Structură & Oameni', type: 'scale5', text: 'Există o organigramă actualizată cu nume reale, nu doar titluri.' },
      { id: 'd10', dimension: 'Structură & Oameni', type: 'scale5', text: 'Există o organigramă-țintă la 3 ani (cu rolurile încă neacoperite).' },
      { id: 'd11', dimension: 'Structură & Oameni', type: 'scale5', text: 'Cele 7 funcții obligatorii (vânzări, operațional, financiar, HR, marketing, livrare, conducere) sunt acoperite, fie și parțial.' },
      { id: 'd12', dimension: 'Structură & Oameni', type: 'scale5', text: 'Fiecare angajat cheie are o fișă de rol scrisă, cu scop și indicatori.' },
      { id: 'd13', dimension: 'Structură & Oameni', type: 'scale5', text: 'Angajații știu exact ce decizii pot lua singuri, fără mine.' },
      { id: 'd14', dimension: 'Structură & Oameni', type: 'scale5', text: 'Am identificat oamenii cheie pe care nu mi-i permit să-i pierd.' },
      { id: 'd15', dimension: 'Structură & Oameni', type: 'scale5', text: 'Recrutarea pentru roluri-cheie se face pe baza unor criterii scrise.' },
      { id: 'd16', dimension: 'Structură & Oameni', type: 'scale5', text: 'Angajații noi învață rolul fără să fie nevoie de mine.' },
      { id: 'd17', dimension: 'Structură & Oameni', type: 'scale5', text: 'Există un manager intermediar real (nu doar pe hârtie).' },

      // Procese (8)
      { id: 'd18', dimension: 'Procese', type: 'scale5', text: 'Procesele cheie (vânzare, livrare, facturare) sunt documentate în scris.' },
      { id: 'd19', dimension: 'Procese', type: 'scale5', text: 'Documentația e scrisă „cum SE face", nu „cum ar trebui".' },
      { id: 'd20', dimension: 'Procese', type: 'scale5', text: 'Un coleg nou ar putea executa procesul citind doar documentul.' },
      { id: 'd21', dimension: 'Procese', type: 'scale5', text: 'Există o matrice decizională: cine decide ce, până la ce nivel.' },
      { id: 'd22', dimension: 'Procese', type: 'scale5', text: 'Excepțiile (situațiile speciale) sunt documentate, nu rezolvate ad-hoc.' },
      { id: 'd23', dimension: 'Procese', type: 'scale5', text: 'Procesele sunt revizuite periodic și actualizate.' },
      { id: 'd24', dimension: 'Procese', type: 'scale5', text: 'Reclamațiile / problemele au un flux standard de tratare.' },
      { id: 'd25', dimension: 'Procese', type: 'scale5', text: 'Există un onboarding standardizat pentru clienți noi.' },

      // Control & KPI (9)
      { id: 'd26', dimension: 'Control & KPI', type: 'scale5', text: 'Am un tablou de bord cu maxim 10 cifre cheie pe care îl verific săptămânal.' },
      { id: 'd27', dimension: 'Control & KPI', type: 'scale5', text: 'Fiecare rol cheie are 3–5 indicatori măsurabili.' },
      { id: 'd28', dimension: 'Control & KPI', type: 'scale5', text: 'Indicatorii sunt cifre verificabile, asupra cărora omul are control real.' },
      { id: 'd29', dimension: 'Control & KPI', type: 'scale5', text: 'Există un raport săptămânal standard pe care îl primesc.' },
      { id: 'd30', dimension: 'Control & KPI', type: 'scale5', text: 'Știu în orice moment care linii de business sunt profitabile și care nu.' },
      { id: 'd31', dimension: 'Control & KPI', type: 'scale5', text: 'Am cifre clare pe cash-flow la 30, 60, 90 zile.' },
      { id: 'd32', dimension: 'Control & KPI', type: 'scale5', text: 'Pot vedea performanța oamenilor fără să-i întreb.' },
      { id: 'd33', dimension: 'Control & KPI', type: 'scale5', text: 'Există un ritm fix de raportare (zi/oră prestabilite).' },
      { id: 'd34', dimension: 'Control & KPI', type: 'scale5', text: 'Deciziile mari le iau pe baza cifrelor, nu a impresiilor.' },

      // Delegare (8)
      { id: 'd35', dimension: 'Delegare', type: 'scale5', text: 'Am delegat cel puțin o zonă completă (responsabilitate, nu doar sarcini).' },
      { id: 'd36', dimension: 'Delegare', type: 'scale5', text: 'Persoana căreia i-am delegat are autoritatea de decizie scrisă.' },
      { id: 'd37', dimension: 'Delegare', type: 'scale5', text: 'Există un acord de responsabilitate semnat pentru zona delegată.' },
      { id: 'd38', dimension: 'Delegare', type: 'scale5', text: 'Am stabilit explicit ce greșeli sunt acceptabile și care sunt linii roșii.' },
      { id: 'd39', dimension: 'Delegare', type: 'scale5', text: 'Când apare o greșeală, repar sistemul, nu cert omul.' },
      { id: 'd40', dimension: 'Delegare', type: 'scale5', text: 'Nu mă mai implic în operațional pe zona delegată.' },
      { id: 'd41', dimension: 'Delegare', type: 'scale5', text: 'Am un plan scris pentru următoarele 2 zone pe care le voi deleg.' },
      { id: 'd42', dimension: 'Delegare', type: 'scale5', text: 'Pot lipsi 2 săptămâni fără să se oprească operațiunile.' },

      // Management & Scalare (8)
      { id: 'd43', dimension: 'Management & Scalare', type: 'scale5', text: 'Am o săptămână tipică de proprietar (nu de operator) scrisă în calendar.' },
      { id: 'd44', dimension: 'Management & Scalare', type: 'scale5', text: 'Petrec cel puțin 20% din timp pe strategie și oameni cheie.' },
      { id: 'd45', dimension: 'Management & Scalare', type: 'scale5', text: 'Există ședințe trimestriale fixe de revizuire procese și indicatori.' },
      { id: 'd46', dimension: 'Management & Scalare', type: 'scale5', text: 'Am un plan clar pentru creștere pe următoarele 12 luni.' },
      { id: 'd47', dimension: 'Management & Scalare', type: 'scale5', text: 'Echipa poate funcționa și crește fără implicarea mea zilnică.' },
      { id: 'd48', dimension: 'Management & Scalare', type: 'scale5', text: 'Am un sistem de feedback colectat de la echipă în mod regulat.' },
      { id: 'd49', dimension: 'Management & Scalare', type: 'scale5', text: 'Pot să-mi planific o vacanță-test de 1–2 săptămâni fără frică.' },
      { id: 'd50', dimension: 'Management & Scalare', type: 'scale5', text: 'Firma e construită să poată fi vândută sau condusă de altcineva.' },
    ],
  },

  // e-1-1: Lista Rolului Tău → form-fields
  {
    exerciseId: 'e-1-1',
    type: 'form-fields',
    title: 'Lista Rolului Tău',
    instructions:
      'Completează minim 15 activități în fiecare coloană. Bazează-te pe datele din Auditul de Timp.',
    fields: [
      {
        id: 'lr_info',
        type: 'info',
        text: 'Completează minim 15 activități în fiecare coloană. Bazează-te pe datele din Auditul de Timp.',
      },
      {
        id: 'lr_a',
        type: 'textarea',
        label: 'Coloana A: Ce faci TU acum (minim 15 activități, una per rând)',
        placeholder: '1. Aprob fiecare factură\n2. Răspund la emailuri clienți\n3. ...',
      },
      {
        id: 'lr_b',
        type: 'textarea',
        label: 'Coloana B: Ce NU mai faci TU (minim 15 activități cu persoana responsabilă și termenul)',
        placeholder: '1. Aprobarea facturilor → Maria → din 01.06\n2. ...',
      },
    ],
  },

  // e-1-2: Manifestul Fundației → form-fields
  {
    exerciseId: 'e-1-2',
    type: 'form-fields',
    title: 'Manifestul Fundației',
    instructions:
      'Completează toate cele 4 secțiuni. Documentul final va fi imprimat și pus pe peretele biroului.',
    fields: [
      {
        id: 'mf_misiune',
        type: 'textarea',
        label: 'Misiunea companiei',
        placeholder: 'De ce există compania ta? (max 2 propoziții, înțelese de oricine)',
      },
      {
        id: 'mf_viziune',
        type: 'textarea',
        label: 'Viziunea la 3 ani (cu cifre reale)',
        placeholder: 'În [an], compania [Nume] va atinge [CA], cu [X] angajați, servind [piețe]...',
      },
      {
        id: 'mf_valori',
        type: 'textarea',
        label: 'Cele 5 valori cu comportamentele asociate',
        placeholder:
          '1. [Valoare]: Comportament care o respectă: ... / Care o încalcă: ...\n2. ...',
      },
      {
        id: 'mf_rol',
        type: 'textarea',
        label: 'Rolul tău rescris (ce faci și ce NU mai faci)',
        placeholder: 'Fac: strategie, decizii mari, parteneri cheie...\nNU mai fac: ...',
      },
    ],
  },

  // e-2-1: Organigrama Actuală → form-fields
  {
    exerciseId: 'e-2-1',
    type: 'form-fields',
    title: 'Organigrama Actuală',
    instructions:
      'Desenezi cu NUME REALE, nu cu titluri ideale. Marchezi: cine răspunde de ce, cine nu răspunde de nimic.',
    fields: [
      {
        id: 'oa_info',
        type: 'info',
        text: 'Desenează organigrama cu NUME REALE. Include toate rolurile pe care le porți TU personal — vei vedea 4–5 ori același nume.',
      },
      {
        id: 'oa_text',
        type: 'textarea',
        label: 'Descrie structura actuală (sau lipsa ei)',
        placeholder:
          'Exemplu:\nDirector General (eu) → Marketing (eu), Vânzări (Andrei), Operațional (eu), Financiar (eu)...',
      },
      {
        id: 'oa_obs',
        type: 'textarea',
        label: 'Observații: ce roluri sunt descoperite sau suprapuse?',
        placeholder: 'Ex: Marketingul și operaționalul stau ambele pe mine, fără înlocuitor...',
      },
    ],
  },

  // e-2-2: Organigrama Finală → form-fields
  {
    exerciseId: 'e-2-2',
    type: 'form-fields',
    title: 'Organigrama Finală la 3 ani',
    instructions:
      'Cum trebuie să arate compania ta când ajungi la viziunea din Etapa 1. Toate căsuțele, chiar dacă acum sunt goale.',
    fields: [
      {
        id: 'of_structura',
        type: 'textarea',
        label: 'Structura organizațională vizată la 3 ani',
        placeholder: 'CEO → COO → Departamente...',
      },
      {
        id: 'of_roluri_goale',
        type: 'textarea',
        label: 'Roluri goale acum (cu termenul estimat de acoperire)',
        placeholder: 'Director Marketing → recrutare planificată Q3 2025\nFinanciar → până în dec 2025...',
      },
    ],
  },

  // e-2-3: Fișele de Rol → form-fields
  {
    exerciseId: 'e-2-3',
    type: 'form-fields',
    title: 'Fișele de Rol pentru 3 Poziții Pilot',
    instructions:
      'Alege cele 3 poziții care te dor cel mai tare. Pentru fiecare: scop, responsabilități, indicatori, decizii autonome.',
    fields: [
      {
        id: 'fr_info',
        type: 'info',
        text: 'Completează câte o fișă pentru fiecare dintre cele 3 poziții pilot alese.',
      },
      {
        id: 'fr1_titlu',
        type: 'input',
        label: 'Rolul #1 — Titlu',
        placeholder: 'Ex: Manager Vânzări',
      },
      {
        id: 'fr1_scop',
        type: 'textarea',
        label: 'Scop rol #1',
        placeholder: 'Ce rezultat principal livrează acest rol?',
      },
      {
        id: 'fr1_resp',
        type: 'textarea',
        label: 'Responsabilități rol #1',
        placeholder: '1. ...\n2. ...\n3. ...',
      },
      {
        id: 'fr1_kpi',
        type: 'textarea',
        label: 'Indicatori (3–5) rol #1',
        placeholder: '1. Nr. contracte noi/lună ≥ 10\n2. ...',
      },
      {
        id: 'fr1_decizii',
        type: 'textarea',
        label: 'Decizii autonome rol #1',
        placeholder: 'Ce poate decide singur, fără să vină la tine?',
      },
      {
        id: 'fr2_titlu',
        type: 'input',
        label: 'Rolul #2 — Titlu',
        placeholder: 'Ex: Responsabil Operațional',
      },
      {
        id: 'fr2_scop',
        type: 'textarea',
        label: 'Scop rol #2',
        placeholder: 'Ce rezultat principal livrează acest rol?',
      },
      {
        id: 'fr2_resp',
        type: 'textarea',
        label: 'Responsabilități rol #2',
        placeholder: '1. ...\n2. ...\n3. ...',
      },
      {
        id: 'fr2_kpi',
        type: 'textarea',
        label: 'Indicatori (3–5) rol #2',
        placeholder: '1. ...\n2. ...',
      },
      {
        id: 'fr2_decizii',
        type: 'textarea',
        label: 'Decizii autonome rol #2',
        placeholder: 'Ce poate decide singur, fără să vină la tine?',
      },
      {
        id: 'fr3_titlu',
        type: 'input',
        label: 'Rolul #3 — Titlu',
        placeholder: 'Ex: Responsabil Financiar',
      },
      {
        id: 'fr3_scop',
        type: 'textarea',
        label: 'Scop rol #3',
        placeholder: 'Ce rezultat principal livrează acest rol?',
      },
      {
        id: 'fr3_resp',
        type: 'textarea',
        label: 'Responsabilități rol #3',
        placeholder: '1. ...\n2. ...\n3. ...',
      },
      {
        id: 'fr3_kpi',
        type: 'textarea',
        label: 'Indicatori (3–5) rol #3',
        placeholder: '1. ...\n2. ...',
      },
      {
        id: 'fr3_decizii',
        type: 'textarea',
        label: 'Decizii autonome rol #3',
        placeholder: 'Ce poate decide singur, fără să vină la tine?',
      },
    ],
  },

  // e-3-1: Inventarul Proceselor → checklist
  {
    exerciseId: 'e-3-1',
    type: 'checklist',
    title: 'Inventarul Proceselor',
    instructions:
      'Listează toate procesele firmei (de obicei 20–40). Le scorezi pe 2 axe: impact financiar și frecvență. Tai tot ce nu e în top.',
    items: [
      { id: 'ip1', label: 'Am listat toate procesele repetitive din firmă (minim 20)' },
      { id: 'ip2', label: 'Am scorat fiecare proces pe impact financiar (1–5)' },
      { id: 'ip3', label: 'Am scorat fiecare proces pe frecvență (1–5)' },
      { id: 'ip4', label: 'Am calculat scorul total (impact × frecvență)' },
      { id: 'ip5', label: 'Am selectat Top 5–7 procese de documentat' },
      { id: 'ip6', label: 'Am eliminat din listă tot ce nu e în top' },
    ],
  },

  // e-3-2: Cartografierea unui Proces Real → form-fields
  {
    exerciseId: 'e-3-2',
    type: 'form-fields',
    title: 'Cartografierea unui Proces Real',
    instructions:
      'Alege 1 proces din top 5. Desenează-l cu pașii REALI — cine face ce, cu ce documente intră, ce documente ies.',
    fields: [
      {
        id: 'cp_proces',
        type: 'input',
        label: 'Numele procesului ales',
        placeholder: 'Ex: Procesul de vânzare B2B',
      },
      {
        id: 'cp_input',
        type: 'textarea',
        label: 'Ce intră în proces (input)',
        placeholder: 'Ex: Cerere client, email/telefon...',
      },
      {
        id: 'cp_pasi',
        type: 'textarea',
        label: 'Pașii reali ai procesului (cine face ce)',
        placeholder: '1. Client trimite cerere → primit de Andrei\n2. Andrei contactează clientul în max 2h\n3. ...',
      },
      {
        id: 'cp_output',
        type: 'textarea',
        label: 'Ce iese din proces (output)',
        placeholder: 'Ex: Contract semnat, factură proformă...',
      },
      {
        id: 'cp_blocaje',
        type: 'textarea',
        label: 'Unde trece OBLIGATORIU prin tine și de ce',
        placeholder: 'Ex: Aprobarea discount-ului peste 10% — trece prin mine...',
      },
    ],
  },

  // e-3-3: Documentezi 2 Procese → form-fields
  {
    exerciseId: 'e-3-3',
    type: 'form-fields',
    title: 'Documentezi 2 Procese Pas cu Pas',
    instructions:
      'Metodă recomandată: filmezi cu telefonul în timp ce execuți, apoi transcrii. 20 minute de filmat = 1 oră de scris economisită.',
    fields: [
      {
        id: 'dp1_titlu',
        type: 'input',
        label: 'Procesul #1 — Titlu',
        placeholder: 'Ex: Procesul de onboarding client nou',
      },
      {
        id: 'dp1_doc',
        type: 'textarea',
        label: 'Documentație completă Procesul #1',
        placeholder:
          'Input: ...\nPas 1: ...\nPas 2: ...\nOutput: ...\nResponsabil: ...\nIndicator de calitate: ...',
      },
      {
        id: 'dp2_titlu',
        type: 'input',
        label: 'Procesul #2 — Titlu',
        placeholder: 'Ex: Procesul de gestionare reclamații',
      },
      {
        id: 'dp2_doc',
        type: 'textarea',
        label: 'Documentație completă Procesul #2',
        placeholder:
          'Input: ...\nPas 1: ...\nPas 2: ...\nOutput: ...\nResponsabil: ...\nIndicator de calitate: ...',
      },
    ],
  },

  // e-3-4: Matricea Decizională → dynamic-table
  {
    exerciseId: 'e-3-4',
    type: 'dynamic-table',
    title: 'Matricea Decizională pentru Procese',
    instructions:
      'Pentru cele mai frecvente 5 decizii din fiecare proces documentat: cine decide și până la ce nivel de autoritate.',
    fields: [
      {
        id: 'md_table',
        type: 'dynamic-table',
        columns: ['Decizia', 'Nivel 1 (Angajat)', 'Nivel 2 (Manager)', 'Nivel 3 (Tu)'],
        addLabel: 'Adaugă decizie',
      },
    ],
  },

  // e-3-5: Testul Instrucțiunii → checklist
  {
    exerciseId: 'e-3-5',
    type: 'checklist',
    title: 'Testul Instrucțiunii',
    instructions:
      'Dai instrucțiunea unui coleg sau prieten care NU lucrează în acel rol. El o execută doar pe baza documentului tău.',
    items: [
      { id: 'ti1', label: 'Am ales o persoană din afara rolului pentru test' },
      { id: 'ti2', label: 'I-am dat instrucțiunea fără explicații verbale' },
      { id: 'ti3', label: 'A executat instrucțiunea fără să mă întrebe nimic' },
      { id: 'ti4', label: 'Am notat toate întrebările sau blocajele apărute' },
      { id: 'ti5', label: 'Am revizuit instrucțiunea pe baza feedback-ului' },
      { id: 'ti6', label: 'Al doilea test: 0 întrebări adresate mie' },
    ],
  },

  // e-4-1: Produsul Finit al Fiecărui Rol → form-fields
  {
    exerciseId: 'e-4-1',
    type: 'form-fields',
    title: 'Produsul Finit al Fiecărui Rol',
    instructions:
      'Pentru cele 5 roluri cheie din organigrama ta: ce livrează concret rolul? Trebuie să fie o cifră sau un rezultat măsurabil.',
    fields: [
      {
        id: 'pf_info',
        type: 'info',
        text: 'Exemplu greșit: "răspunde la clienți". Exemplu corect: "20 de cereri procesate pe zi, timp de răspuns max 2h".',
      },
      {
        id: 'pf_rol1',
        type: 'input',
        label: 'Rolul #1',
        placeholder: 'Titlul rolului',
      },
      { id: 'pf_pf1', type: 'textarea', label: 'Produsul finit al Rolului #1', placeholder: 'Ce livrează concret, în cifre?' },
      { id: 'pf_rol2', type: 'input', label: 'Rolul #2', placeholder: 'Titlul rolului' },
      { id: 'pf_pf2', type: 'textarea', label: 'Produsul finit al Rolului #2', placeholder: 'Ce livrează concret, în cifre?' },
      { id: 'pf_rol3', type: 'input', label: 'Rolul #3', placeholder: 'Titlul rolului' },
      { id: 'pf_pf3', type: 'textarea', label: 'Produsul finit al Rolului #3', placeholder: 'Ce livrează concret, în cifre?' },
      { id: 'pf_rol4', type: 'input', label: 'Rolul #4', placeholder: 'Titlul rolului' },
      { id: 'pf_pf4', type: 'textarea', label: 'Produsul finit al Rolului #4', placeholder: 'Ce livrează concret, în cifre?' },
      { id: 'pf_rol5', type: 'input', label: 'Rolul #5', placeholder: 'Titlul rolului' },
      { id: 'pf_pf5', type: 'textarea', label: 'Produsul finit al Rolului #5', placeholder: 'Ce livrează concret, în cifre?' },
    ],
  },

  // e-4-2: Cei 3–5 Indicatori per Rol → form-fields
  {
    exerciseId: 'e-4-2',
    type: 'form-fields',
    title: 'Cei 3–5 Indicatori per Rol',
    instructions:
      'Testul celor 3 condiții: e o cifră? e verificabilă? omul are control asupra ei? Dacă nu trece toate 3 — nu e indicator.',
    fields: [
      {
        id: 'ir_info',
        type: 'info',
        text: 'Dacă nu trece toate cele 3 condiții — nu e indicator, e iluzie de control.',
      },
      {
        id: 'ir_rol1',
        type: 'input',
        label: 'Rolul #1',
        placeholder: 'Titlul rolului',
      },
      { id: 'ir_kpi1', type: 'textarea', label: 'Indicatorii Rolului #1 (3–5)', placeholder: '1. ...\n2. ...\n3. ...' },
      { id: 'ir_rol2', type: 'input', label: 'Rolul #2', placeholder: 'Titlul rolului' },
      { id: 'ir_kpi2', type: 'textarea', label: 'Indicatorii Rolului #2 (3–5)', placeholder: '1. ...\n2. ...\n3. ...' },
      { id: 'ir_rol3', type: 'input', label: 'Rolul #3', placeholder: 'Titlul rolului' },
      { id: 'ir_kpi3', type: 'textarea', label: 'Indicatorii Rolului #3 (3–5)', placeholder: '1. ...\n2. ...\n3. ...' },
    ],
  },

  // e-4-3: Tabloul de Bord → dynamic-table
  {
    exerciseId: 'e-4-3',
    type: 'dynamic-table',
    title: 'Tabloul de Bord în Excel (1 pagină)',
    instructions:
      'Maxim 10 cifre pe care le deschizi luni dimineața. Test: în 5 minute știi cum a fost săptămâna trecută?',
    fields: [
      {
        id: 'tb_table',
        type: 'dynamic-table',
        columns: ['Rol/Zonă', 'Indicator', 'Valoare target', 'Valoare actuală'],
        addLabel: 'Adaugă indicator',
      },
    ],
  },

  // e-4-4: Testul de Absență → checklist + form-fields
  {
    exerciseId: 'e-4-4',
    type: 'checklist',
    title: 'Testul de Absență de 2 Zile',
    instructions:
      'Pleci de la birou 2 zile lucrătoare fără să suni pe nimeni. Te uiți DOAR la rapoarte și tabloul de bord la întoarcere.',
    items: [
      { id: 'ta1', label: 'Am comunicat echipei că sunt absent 2 zile' },
      { id: 'ta2', label: 'Nu am sunat pe nimeni din birou în cele 2 zile' },
      { id: 'ta3', label: 'La întoarcere am citit DOAR rapoartele și tabloul de bord' },
      { id: 'ta4', label: 'Am notat ce a lipsit din rapoarte (ce a trebuit să sun ca să aflu)' },
      { id: 'ta5', label: 'Am notat ce decizii s-au luat fără mine' },
      { id: 'ta6', label: 'Am actualizat sistemul de raportare pe baza observațiilor' },
    ],
  },

  // e-5-1: Lista de Eliberare → form-fields
  {
    exerciseId: 'e-5-1',
    type: 'form-fields',
    title: 'Lista de Eliberare',
    instructions:
      '20 de lucruri pe care le faci tu acum și pe care altcineva le-ar putea face. Scorezi pe 2 axe, alegi 1 zonă de delegat.',
    fields: [
      {
        id: 'le_info',
        type: 'info',
        text: 'Scorează fiecare activitate: cât de mult te doare să predai (1–5) și cât de greu e tehnic (1–5). Alege zona cu scorul cel mai mic.',
      },
      {
        id: 'le_lista',
        type: 'textarea',
        label: 'Lista activităților (minim 20)',
        placeholder:
          '1. Aprobarea facturilor — durere: 3, dificultate: 2\n2. Întâlnirile săptămânale cu echipa — durere: 4, dificultate: 3\n3. ...',
      },
      {
        id: 'le_zona',
        type: 'textarea',
        label: 'Zona completă aleasă pentru delegare în această etapă',
        placeholder: 'Zona: ...\nPersoana: ...\nTermenul de predare: ...',
      },
    ],
  },

  // e-5-2: Acordul de Responsabilitate → form-fields
  {
    exerciseId: 'e-5-2',
    type: 'form-fields',
    title: 'Acordul de Responsabilitate',
    instructions:
      'Ce rezultat aștepți, până când. Ce autoritate are persoana. Semnezi fizic cu omul respectiv — ambele părți.',
    fields: [
      { id: 'ar_persoana', type: 'input', label: 'Persoana', placeholder: 'Numele persoanei căreia delegi' },
      { id: 'ar_zona', type: 'input', label: 'Zona / Rolul', placeholder: 'Ce zonă preia complet' },
      { id: 'ar_rezultat', type: 'textarea', label: 'Rezultatul așteptat', placeholder: 'Ce trebuie să livreze și până când' },
      { id: 'ar_autoritate', type: 'textarea', label: 'Autoritatea de decizie', placeholder: 'Ce poate decide singur și până la ce nivel' },
      { id: 'ar_raportare', type: 'textarea', label: 'Cum și când raportează', placeholder: 'Frecvență, format, canal...' },
      { id: 'ar_semnat', type: 'input', label: 'Data semnării acordului', placeholder: 'DD.MM.YYYY' },
    ],
  },

  // e-5-3: Zona Greșelii Admise → form-fields
  {
    exerciseId: 'e-5-3',
    type: 'form-fields',
    title: 'Zona Greșelii Admise',
    instructions:
      'Ce greșeli sunt acceptabile (din care omul învață). Ce greșeli sunt linii roșii. Scris și comunicat explicit.',
    fields: [
      {
        id: 'zg_admise',
        type: 'textarea',
        label: 'Greșeli acceptabile (din care se învață)',
        placeholder:
          '1. Client nemulțumit dacă s-a respectat procesul\n2. Eroare de calcul corectată în aceeași zi\n3. ...',
      },
      {
        id: 'zg_rosii',
        type: 'textarea',
        label: 'Linii roșii (necesită intervenția mea imediată)',
        placeholder:
          '1. Discount peste 20% fără aprobare\n2. Angajarea / concedierea fără consultare\n3. ...',
      },
    ],
  },

  // e-5-4: Planul de Retragere → checklist
  {
    exerciseId: 'e-5-4',
    type: 'checklist',
    title: 'Planul de Retragere pe 30 de Zile',
    instructions:
      '4 săptămâni cu nivel de implicare descrescând. Urmărește și bifează fiecare etapă.',
    items: [
      { id: 'pr1', label: 'Săptămâna 1: Am monitorizat zilnic și am dat feedback imediat' },
      { id: 'pr2', label: 'Săptămâna 1: Am documentat toate intervențiile mele' },
      { id: 'pr3', label: 'Săptămâna 2: Feedback dat doar la cerere sau la raportul săptămânal' },
      { id: 'pr4', label: 'Săptămâna 2: Nu am intervenit fără să fiu solicitat' },
      { id: 'pr5', label: 'Săptămâna 3: Mă uit doar la rapoarte, nu intervin' },
      { id: 'pr6', label: 'Săptămâna 3: Zero apeluri inițiate de mine' },
      { id: 'pr7', label: 'Săptămâna 4: Invizibil — omul conduce zona complet singur' },
      { id: 'pr8', label: 'Săptămâna 4: Am verificat că tabloul de bord reflectă realitatea' },
    ],
  },

  // e-5-5: Analiza Primei Greșeli → form-fields
  {
    exerciseId: 'e-5-5',
    type: 'form-fields',
    title: 'Analiza Primei Greșeli',
    instructions:
      'Când apare prima greșeală — nu îl cerți pe om. Repari sistemul, nu omul.',
    fields: [
      { id: 'ag_greseala', type: 'textarea', label: 'Ce greșeală a apărut', placeholder: 'Descrie situația obiectiv...' },
      { id: 'ag_proces', type: 'textarea', label: 'Ce lipsea în proces?', placeholder: 'Pasul care lipsea sau era neclar...' },
      { id: 'ag_training', type: 'textarea', label: 'Ce lipsea în training?', placeholder: 'Ce nu știa sau nu a înțeles persoana...' },
      { id: 'ag_claritate', type: 'textarea', label: 'Ce nu era clar?', placeholder: 'Criteriu de succes lipsă, autoritate neclară...' },
      { id: 'ag_actiune', type: 'textarea', label: 'Acțiunea de remediere a sistemului', placeholder: 'Ce modifici în proces/instrucțiune...' },
    ],
  },

  // e-6-1: Fișa Noului Tău Rol → form-fields
  {
    exerciseId: 'e-6-1',
    type: 'form-fields',
    title: 'Fișa Noului Tău Rol',
    instructions:
      'Ce faci TU de luni încolo — maxim 5 zone de responsabilitate. Orice activitate din afara celor 5 zone — o delegi sau o tai.',
    fields: [
      {
        id: 'fnr_info',
        type: 'info',
        text: 'Maxim 5 zone: strategie, oameni cheie, decizii mari, parteneriate, viziune.',
      },
      { id: 'fnr_zona1', type: 'input', label: 'Zona #1', placeholder: 'Ex: Strategie și direcție' },
      { id: 'fnr_desc1', type: 'textarea', label: 'Ce faci în Zona #1', placeholder: 'Activități specifice, frecvență...' },
      { id: 'fnr_zona2', type: 'input', label: 'Zona #2', placeholder: 'Ex: Oameni cheie' },
      { id: 'fnr_desc2', type: 'textarea', label: 'Ce faci în Zona #2', placeholder: 'Activități specifice, frecvență...' },
      { id: 'fnr_zona3', type: 'input', label: 'Zona #3', placeholder: 'Ex: Decizii majore' },
      { id: 'fnr_desc3', type: 'textarea', label: 'Ce faci în Zona #3', placeholder: 'Activități specifice, frecvență...' },
      { id: 'fnr_zona4', type: 'input', label: 'Zona #4', placeholder: 'Ex: Parteneriate strategice' },
      { id: 'fnr_desc4', type: 'textarea', label: 'Ce faci în Zona #4', placeholder: 'Activități specifice, frecvență...' },
      { id: 'fnr_zona5', type: 'input', label: 'Zona #5', placeholder: 'Ex: Viziune și cultură' },
      { id: 'fnr_desc5', type: 'textarea', label: 'Ce faci în Zona #5', placeholder: 'Activități specifice, frecvență...' },
    ],
  },

  // e-6-2: Calendarul Săptămânii → form-fields
  {
    exerciseId: 'e-6-2',
    type: 'form-fields',
    title: 'Calendarul Săptămânii Tale de Proprietar',
    instructions:
      'Cum arată o săptămână normală a ta de acum încolo. Calendarul devine standardul.',
    fields: [
      { id: 'cs_luni', type: 'textarea', label: 'Luni', placeholder: 'Ex: 9:00–10:00 Review tablou de bord, 10:00–12:00 Strategie...' },
      { id: 'cs_marti', type: 'textarea', label: 'Marți', placeholder: 'Ex: 9:00–11:00 Întâlniri oameni cheie...' },
      { id: 'cs_miercuri', type: 'textarea', label: 'Miercuri', placeholder: '' },
      { id: 'cs_joi', type: 'textarea', label: 'Joi', placeholder: '' },
      { id: 'cs_vineri', type: 'textarea', label: 'Vineri', placeholder: 'Ex: 14:00–16:00 Review săptămânal, 16:00–17:00 Planificare...' },
      { id: 'cs_total', type: 'input', label: 'Total ore/săptămână în rol de proprietar (nu operator)', placeholder: 'Ex: 20 ore' },
    ],
  },

  // e-6-3: Calendarul Trimestrial → checklist
  {
    exerciseId: 'e-6-3',
    type: 'checklist',
    title: 'Calendarul Trimestrial de Revizuire',
    instructions:
      'Date fixe în calendar pentru revizuirea proceselor și indicatorilor. Fără dată fixă — nu se întâmplă niciodată.',
    items: [
      { id: 'ct1', label: 'Am setat data pentru revizuirea Q1 în calendar' },
      { id: 'ct2', label: 'Am setat data pentru revizuirea Q2 în calendar' },
      { id: 'ct3', label: 'Am setat data pentru revizuirea Q3 în calendar' },
      { id: 'ct4', label: 'Am setat data pentru revizuirea Q4 în calendar' },
      { id: 'ct5', label: 'Am stabilit cine convoacă și cine participă' },
      { id: 'ct6', label: 'Am creat formatul de colectare feedback echipă' },
      { id: 'ct7', label: 'Am stabilit cine decide modificările aprobate' },
    ],
  },

  // e-6-4: Planificarea Vacanței-Test → form-fields
  {
    exerciseId: 'e-6-4',
    type: 'form-fields',
    title: 'Planificarea Vacanței-Test',
    instructions:
      'Planifici o absență de 1–2 săptămâni în următoarele 60 de zile. Nu opțional — este testul final al sistemului.',
    fields: [
      { id: 'vt_data', type: 'input', label: 'Data planificată a vacanței-test', placeholder: 'Ex: 15.07.2025 – 29.07.2025' },
      { id: 'vt_pregatire', type: 'textarea', label: 'Ce pregătesc înainte de plecare', placeholder: '1. Tabloul de bord actualizat\n2. Rapoarte automate setate\n3. ...' },
      { id: 'vt_contact', type: 'textarea', label: 'Persoana de contact în absența mea (și pentru ce)', placeholder: 'Persoana: ...\nPentru situații de tip: ...' },
      { id: 'vt_rezultat', type: 'textarea', label: 'La întoarcere: ce s-a întâmplat (completezi după)', placeholder: 'Ce decizii s-au luat fără mine, ce a mers, ce a crăpat...' },
    ],
  },
];

export function getExerciseTemplate(exerciseId: string): ExerciseTemplate | undefined {
  return EXERCISE_TEMPLATES.find((t) => t.exerciseId === exerciseId);
}
