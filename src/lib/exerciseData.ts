export interface QuizQuestionItem {
  id: string;
  text: string;
  type: 'scale5' | 'yesno';
}

export interface ChecklistItem {
  id: string;
  label: string;
}

export interface FormField {
  id: string;
  type: 'info' | 'textarea' | 'input' | 'dynamic-table';
  label?: string;
  placeholder?: string;
  text?: string;
  columns?: string[];
  addLabel?: string;
}

export interface ExerciseTemplate {
  exerciseId: string;
  type: 'checklist' | 'form-fields' | 'quiz' | 'text-input' | 'rating-grid' | 'dynamic-table'
      | 'activity-audit' | 'bottleneck-map' | 'absence-test' | 'diagnostic-grid'
      | 'partnership-diagnostic'
      | 'foundation-manifest' | 'quality-checklist' | 'team-feedback-report' | 'manifest-preview';
  title: string;
  instructions: string;
  items?: ChecklistItem[];
  fields?: FormField[];
  questions?: QuizQuestionItem[];
}

export const EXERCISE_TEMPLATES: ExerciseTemplate[] = [
  // e-0-1: Auditul Activităților → activity-audit
  {
    exerciseId: 'e-0-1',
    type: 'activity-audit',
    title: 'Auditul Activităților Tale',
    instructions:
      'Scrie TOT ce faci în mod obișnuit în firma ta. Estimează % din timp și clasifică fiecare activitate: S (Specialist), D (Director) sau P (Proprietar). Totalul trebuie să fie 100%.',
  },

  // e-0-2: Harta Gâturilor de Sticlă → bottleneck-map
  {
    exerciseId: 'e-0-2',
    type: 'bottleneck-map',
    title: 'Harta Gâturilor de Sticlă',
    instructions:
      'Listează toate deciziile și situațiile din ultima săptămână care au ajuns la tine. Oricât de mici. Oricât de banale. Răspunde: chiar trebuia să fii tu implicat?',
  },

  // e-0-3: Testul de Absență → absence-test
  {
    exerciseId: 'e-0-3',
    type: 'absence-test',
    title: 'Testul de Absență',
    instructions:
      'Dacă ai pleca mâine 2 zile și nu ai răspunde la niciun mesaj — ce s-ar întâmpla? Scrie TOATE scenariile care îți vin în cap. Nu le filtra.',
  },

  // e-0-4: Diagnosticul Complet (50 întrebări) → diagnostic-grid
  {
    exerciseId: 'e-0-4',
    type: 'diagnostic-grid',
    title: 'Diagnosticul Complet · 50 de Întrebări',
    instructions:
      '50 de întrebări pe 6 dimensiuni ale sistematizării. Scala 1–5. Fii sincer — răspunsurile incomode sunt cele mai valoroase. Nu cum vrei să fie — cum e acum.',
  },

  // e-0-5: Diagnosticul Parteneriatului → partnership-diagnostic
  {
    exerciseId: 'e-0-5',
    type: 'partnership-diagnostic',
    title: 'Diagnosticul Parteneriatului',
    instructions:
      'Dacă ești singur în afacere, poți sări acest exercițiu. Dacă ai un partener — acesta e exercițiul cel mai important din Etapa 0.',
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

  // ─── SĂPTĂMÂNA 2 — Etapa 1 · Fundația ────────────────────────────────────────

  // e-1-s2-1: Misiunea · Viziunea · Valorile → foundation-manifest
  {
    exerciseId: 'e-1-s2-1',
    type: 'foundation-manifest',
    title: 'Misiunea · Viziunea · Valorile',
    instructions:
      'Construiești cei 3 piloni ai Fundației afacerii tale. Răspunsuri concrete, nu generice. Scrie cum e acum sau cum vrei să fie cu adevărat — răspunsurile oneste sunt mai valoroase decât cele care sună bine.',
  },

  // e-1-s2-2: Checklist de Calitate → quality-checklist
  {
    exerciseId: 'e-1-s2-2',
    type: 'quality-checklist',
    title: 'Checklist de Calitate',
    instructions:
      'Parcurgi fiecare punct. Dacă nu poți bifa — revizuiești înainte să mergi mai departe.',
  },

  // e-1-s2-3: Feedback din Ședința cu Echipa → team-feedback-report
  {
    exerciseId: 'e-1-s2-3',
    type: 'team-feedback-report',
    title: 'Feedback-ul din Ședința cu Echipa',
    instructions:
      'Completezi după ședința cu echipa ta. Prezinți Manifestul element cu element și notezi imediat ce s-a întâmplat.',
  },

  // e-1-s2-liv: Manifestul Fundației · Livrabil → manifest-preview
  {
    exerciseId: 'e-1-s2-liv',
    type: 'manifest-preview',
    title: 'Manifestul Fundației · Livrabil Final',
    instructions:
      'Aceasta este pagina ta A4. Se populează automat din răspunsurile tale din Exercițiul 1. Tipărește-o. Pune-o pe peretele biroului tău. E fundația pe care construim tot ce urmează.',
  },
];

export function getExerciseTemplate(exerciseId: string): ExerciseTemplate | undefined {
  return EXERCISE_TEMPLATES.find((t) => t.exerciseId === exerciseId);
}
