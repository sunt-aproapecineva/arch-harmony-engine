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

export interface MCQOption {
  label: string;
  correct: boolean;
  explanation?: string;
}

export interface MCQSituation {
  id: string;
  title?: string;
  text: string;
  options: MCQOption[];
}

export interface DMExampleRow {
  role: string;
  alone: string[];
  manager: string[];
  ceo: string[];
}

export interface ExerciseTemplate {
  exerciseId: string;
  type: 'checklist' | 'form-fields' | 'quiz' | 'text-input' | 'rating-grid' | 'dynamic-table'
      | 'activity-audit' | 'bottleneck-map' | 'absence-test' | 'diagnostic-grid'
      | 'partnership-diagnostic'
      | 'foundation-manifest' | 'quality-checklist' | 'team-feedback-report' | 'manifest-preview'
      | 'quiz-mcq' | 'function-roles' | 'miro-org' | 'decision-matrix';
  title: string;
  instructions: string;
  items?: ChecklistItem[];
  fields?: FormField[];
  questions?: QuizQuestionItem[];
  // quiz-mcq
  situations?: MCQSituation[];
  scoringTiers?: { min: number; max: number; label: string; tone: 'good' | 'ok' | 'bad' }[];
  // miro-org
  miroTemplateUrl?: string;
  colorLegend?: { color: string; name: string; meaning: string; action: string }[];
  // decision-matrix
  dmExample?: DMExampleRow[];
  dmRolesCount?: number;
  dmReflection?: { id: string; label: string; placeholder?: string }[];
  // function-roles
  functionOptions?: { value: string; label: string; sampleProduct: string }[];
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

  // e-2-1..e-2-5 → definite mai jos cu noile tipuri (function-roles, quiz-mcq, miro-org, decision-matrix)

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
    title: 'Misiunea Viziunea Valorile',
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

  // ─── SĂPTĂMÂNA 3 — Etapa 2 · Pereții Portanți ─────────────────────────────────

  // e-2-1: Funcția, Rolul și Produsul final → function-roles
  {
    exerciseId: 'e-2-1',
    type: 'function-roles',
    title: 'Funcția, Rolul și Produsul final',
    instructions:
      'Citește mai întâi explicația și exemplele. Apoi alege una din cele 7 funcții și completează rolurile, persoanele și produsele pentru firma ta.',
    functionOptions: [
      { value: '1', label: '1. Conducere / Strategie', sampleProduct: 'Direcție clară, decizii majore luate la timp, viziune comunicată echipei.' },
      { value: '2', label: '2. Marketing și Vânzări', sampleProduct: 'Clienți noi plătitori și venituri lunare conform targetului.' },
      { value: '3', label: '3. Financiar / Contabilitate', sampleProduct: 'Cash-flow pozitiv, plăți la termen, rapoarte financiare lunare exacte.' },
      { value: '4', label: '4. Producție / Serviciu', sampleProduct: 'Produs sau serviciu livrat la calitate, la termen și la costul planificat.' },
      { value: '5', label: '5. Calitate / Mulțumire Client', sampleProduct: 'Clienți mulțumiți care revin și recomandă — NPS ≥ țintă.' },
      { value: '6', label: '6. HR / Resurse Umane', sampleProduct: 'Echipă completă, motivată, cu fluctuație < țintă și roluri acoperite.' },
      { value: '7', label: '7. Dezvoltare / Extindere', sampleProduct: 'Produse, piețe sau canale noi lansate conform planului anual.' },
    ],
  },

  // e-2-2: Quiz Organigramă → quiz-mcq (5 situații, 4 opțiuni)
  {
    exerciseId: 'e-2-2',
    type: 'quiz-mcq',
    title: 'Quiz · Înțelegi organigrama?',
    instructions:
      'Citește fiecare situație și bifează răspunsul pe care îl crezi corect. La final vezi scorul și explicațiile.',
    scoringTiers: [
      { min: 5, max: 5, label: 'Excelent. Ai înțeles organigrama complet.', tone: 'good' },
      { min: 3, max: 4, label: 'Bine. Recitește secțiunile unde ai greșit din Lecția 6.', tone: 'ok' },
      { min: 0, max: 2, label: 'Revezi Lecția 6 înainte de a construi organigrama.', tone: 'bad' },
    ],
    situations: [
      {
        id: 's1',
        title: 'Situația 1 — Cum construiești organigrama',
        text: 'Ai o firmă de 5 oameni. Maria face vânzări și contabilitate. Ion face livrări și HR. Tu faci tot restul. Cum construiești organigrama?',
        options: [
          { label: 'Pui 5 blocuri — unul pentru fiecare om din firmă.', correct: false, explanation: 'Greșit — construiești în jurul oamenilor, nu al funcțiilor. Când pleacă unul, totul se prăbușește.' },
          { label: 'Pui cele 7 funcții de bază. Lângă fiecare funcție scrii cine o face acum — chiar dacă un om apare la mai multe funcții.', correct: true, explanation: 'Corect. Funcțiile sunt stabile, oamenii se schimbă. Vezi clar suprapunerile.' },
          { label: 'Pui doar funcțiile care sunt ocupate — cele goale nu au rost să apară.', correct: false, explanation: 'Greșit — funcțiile goale sunt exact lista ta de angajări viitoare.' },
          { label: 'Pui 3 blocuri: tu, Maria și Ion — că așa sunt oamenii.', correct: false, explanation: 'Greșit — asta nu e organigramă, e listă de oameni.' },
        ],
      },
      {
        id: 's2',
        title: 'Situația 2 — Funcția sau omul?',
        text: 'Angajatul tău cel mai bun, Ion, pleacă din firmă. Organigrama ta era construită în jurul lui — el era în 3 blocuri. Ce se întâmplă?',
        options: [
          { label: 'Nimic — organigrama rămâne valabilă. Pui alt nume în locul lui Ion.', correct: false, explanation: 'Doar dacă funcțiile erau definite. Dacă blocurile erau "Ion", nu funcții — nu ai cum să pui alt nume.' },
          { label: 'Organigrama se prăbușește — era construită în jurul lui Ion, nu al funcțiilor.', correct: true, explanation: 'Corect. De aceea organigrama trebuie pe funcții, nu pe persoane.' },
          { label: 'Ștergi cele 3 blocuri și refaci organigrama de la zero.', correct: false, explanation: 'Greșit — funcțiile nu dispar pentru că omul a plecat.' },
          { label: 'Organigrama nu contează — oamenii își știu treaba oricum.', correct: false, explanation: 'Greșit. Fără organigramă nu știi cine răspunde de ce când apare o problemă.' },
        ],
      },
      {
        id: 's3',
        title: 'Situația 3 — Actuală vs. vizată',
        text: 'Un antreprenor a făcut o singură organigramă — cea vizată, cum vrea să fie firma în 3 ani. Ce problemă are?',
        options: [
          { label: 'Nicio problemă — e mai bine să te concentrezi pe viitor.', correct: false, explanation: 'Greșit — fără punct de pornire nu poți măsura progresul.' },
          { label: 'Nu știe de unde pornește. Fără organigrama actuală nu poate măsura distanța și nu știe care e primul pas.', correct: true, explanation: 'Corect. Ai nevoie de ambele — actuală (de unde pornești) și vizată (unde mergi).' },
          { label: 'Trebuia să facă mai întâi organigrama vizată și după cea actuală.', correct: false, explanation: 'Ordinea nu e atât de importantă — important e să existe ambele.' },
          { label: 'Organigrama vizată nu e necesară — ajunge cea actuală.', correct: false, explanation: 'Greșit — fără cea vizată nu știi în ce direcție recrutezi.' },
        ],
      },
      {
        id: 's4',
        title: 'Situația 4 — Codul de culori',
        text: 'În organigrama ta actuală, blocul Marketing și Vânzări e marcat cu roșu. Ce înseamnă asta?',
        options: [
          { label: 'Roșu înseamnă că departamentul merge prost. Trebuie să îmbunătățești vânzările.', correct: false, explanation: 'Greșit — roșul nu e indicator de performanță în acest cod.' },
          { label: 'Roșu înseamnă că tu ocupi această funcție acum. Prioritatea ta e să găsești pe cineva care să o preia.', correct: true, explanation: 'Corect. Roșu = TU ești acolo. Prioritatea ta: înlocuitor.' },
          { label: 'Roșu înseamnă că funcția e goală — nu are nimeni asignat.', correct: false, explanation: 'Greșit — funcția goală e marcată cu gri punctat.' },
          { label: 'Roșu înseamnă că un om face mai multe funcții simultan.', correct: false, explanation: 'Asta e portocaliu — un om suprapus pe mai multe funcții.' },
        ],
      },
      {
        id: 's5',
        title: 'Situația 5 — Pozițiile goale',
        text: 'În organigrama vizată ai 4 blocuri marcate cu gri punctat. Cum interpretezi asta?',
        options: [
          { label: 'Organigrama e incompletă — trebuie să o refaci când ai toți oamenii.', correct: false, explanation: 'Greșit — organigrama vizată ARE pozițiile goale. Asta e scopul ei.' },
          { label: 'Cele 4 poziții goale sunt lista ta de angajări viitoare. Știi exact ce să recrutezi și în ce ordine.', correct: true, explanation: 'Corect. Pozițiile goale sunt planul tău de recrutare.' },
          { label: 'Gri înseamnă că acele funcții nu sunt necesare firmei tale.', correct: false, explanation: 'Greșit — dacă nu erau necesare, nu apăreau în organigrama vizată.' },
          { label: 'Trebuie să angajezi urgent toți 4 oamenii înainte să lansezi organigrama.', correct: false, explanation: 'Greșit — angajezi în ordinea priorității, nu toți deodată.' },
        ],
      },
    ],
  },

  // e-2-3: Organigrama în Miro → miro-org
  {
    exerciseId: 'e-2-3',
    type: 'miro-org',
    title: 'Construiește organigrama firmei tale în Miro',
    instructions:
      'Deschizi template-ul Miro de mai jos, îl copiezi în contul tău și construiești 2 organigrame — actuală și vizată. Codul de culori este obligatoriu. Fiecare bloc conține: Rolul + Persoana + Produsul final.',
    miroTemplateUrl: 'https://miro.com/app/board/uXjVHMYB6CI=/?share_link_id=356253360599',
    colorLegend: [
      { color: '#1F6B3A', name: 'Verde închis', meaning: 'Conducere — tu', action: 'Ești CEO. Apari doar aici.' },
      { color: '#4ADE80', name: 'Verde', meaning: 'Funcție ocupată OK', action: 'Un om dedicat, cu produs final clar.' },
      { color: '#EF4444', name: 'Roșu', meaning: 'Tu ești acolo acum', action: 'Prioritatea ta: găsești un înlocuitor.' },
      { color: '#F59E0B', name: 'Portocaliu', meaning: 'Un om, mai multe funcții', action: 'Supraîncărcat — clarifici sau angajezi.' },
      { color: '#9CA3AF', name: 'Gri punctat', meaning: 'Funcție lipsă', action: 'Lista ta de angajări viitoare.' },
    ],
  },

  // e-2-4: Quiz Linii → quiz-mcq (6 situații, 2 opțiuni — binar)
  {
    exerciseId: 'e-2-4',
    type: 'quiz-mcq',
    title: 'Quiz · Linii de conducere sau comunicare directă?',
    instructions:
      'Linie de CONDUCERE: între CEO/manager și echipă (obiective, instrucțiuni, raportări). Linie de COMUNICARE DIRECTĂ: între două funcții, fără să treacă prin șefi (probleme zilnice). Decide pentru fiecare situație.',
    scoringTiers: [
      { min: 6, max: 6, label: 'Perfect. Știi exact cum circulă informația în firmă.', tone: 'good' },
      { min: 4, max: 5, label: 'Bine. Revezi definițiile de mai sus.', tone: 'ok' },
      { min: 0, max: 3, label: 'Recitește secțiunea despre linii din Lecția 6.', tone: 'bad' },
    ],
    situations: [
      {
        id: 'l1',
        title: 'Situația 1',
        text: 'Directorul de vânzări îi spune agentului: "Obiectivul tău pe luna aceasta este 15 contracte noi."',
        options: [
          { label: 'Linie de CONDUCERE', correct: true, explanation: 'Director → Agent, obiectiv setat de sus în jos.' },
          { label: 'Linie de COMUNICARE DIRECTĂ', correct: false },
        ],
      },
      {
        id: 'l2',
        title: 'Situația 2',
        text: 'Agentul de vânzări îi scrie contabilului: "Am nevoie de extrasul de cont al clientului X pentru întâlnirea de mâine."',
        options: [
          { label: 'Linie de CONDUCERE', correct: false },
          { label: 'Linie de COMUNICARE DIRECTĂ', correct: true, explanation: 'Două funcții la același nivel rezolvă o problemă zilnică, fără șefi.' },
        ],
      },
      {
        id: 'l3',
        title: 'Situația 3',
        text: 'Agentul de vânzări îi raportează managerului: "Am încheiat 12 contracte luna aceasta, mai am 3 în negociere."',
        options: [
          { label: 'Linie de CONDUCERE', correct: true, explanation: 'Raportare de jos în sus pe linia ierarhică.' },
          { label: 'Linie de COMUNICARE DIRECTĂ', correct: false },
        ],
      },
      {
        id: 'l4',
        title: 'Situația 4',
        text: 'Managerul de producție îi cere depozitarului: "Verifică stocul de materie primă și spune-mi câți avem."',
        options: [
          { label: 'Linie de CONDUCERE', correct: false },
          { label: 'Linie de COMUNICARE DIRECTĂ', correct: true, explanation: 'Operațional zilnic, între două funcții care colaborează.' },
        ],
      },
      {
        id: 'l5',
        title: 'Situația 5',
        text: 'Designerul îi trimite marketerului fișierele pentru campania de săptămâna viitoare.',
        options: [
          { label: 'Linie de CONDUCERE', correct: false },
          { label: 'Linie de COMUNICARE DIRECTĂ', correct: true, explanation: 'Predare de livrabil între două funcții la același nivel.' },
        ],
      },
      {
        id: 'l6',
        title: 'Situația 6',
        text: 'CEO-ul anunță echipa: "De luna viitoare schimbăm strategia de preț — reducerile maxime sunt de 10%."',
        options: [
          { label: 'Linie de CONDUCERE', correct: true, explanation: 'Decizie strategică transmisă de CEO către întreaga echipă.' },
          { label: 'Linie de COMUNICARE DIRECTĂ', correct: false },
        ],
      },
    ],
  },

  // e-2-5: Matricea decizională → decision-matrix
  {
    exerciseId: 'e-2-5',
    type: 'decision-matrix',
    title: 'Matricea decizională — cine decide ce în firma ta',
    instructions:
      'Studiază exemplul complet. Apoi completează matricea pentru 2 roluri din firma ta. Pentru fiecare rol scrii ce decizii ia singur, ce trec prin manager, ce ajung la CEO.',
    dmRolesCount: 2,
    dmExample: [
      {
        role: 'Agent vânzări',
        alone: ['Reducere până la 5%', 'Reprogramează o întâlnire', 'Trimite oferta standard'],
        manager: ['Reducere 5–15%', 'Condiții speciale client', 'Prelungește termen plată'],
        ceo: ['Reducere peste 15%', 'Refuză un client', 'Contract nou strategic'],
      },
      {
        role: 'Designer',
        alone: ['Alege fontul și culorile', 'Cere feedback intern', 'Revizuiește un design'],
        manager: ['Livrează design spre client', 'Schimbă direcția vizuală', 'Refuză o revizie client'],
        ceo: ['Schimbă brandul vizual', 'Cumpără soft nou (>500€)', 'Externalizează design'],
      },
      {
        role: 'SMM Manager',
        alone: ['Postează conform calendarului', 'Răspunde la comentarii', 'Alege ora de postare'],
        manager: ['Schimbă formatul conținutului', 'Răspunde la criză de imagine', 'Activează reclame plătite'],
        ceo: ['Schimbă strategia de brand', 'Buget reclame >1.000€', 'Colaborare influenceri'],
      },
    ],
    dmReflection: [
      { id: 'r1', label: 'Cum a reacționat echipa când ai prezentat matricea?', placeholder: 'Reacția lor inițială, întrebări, rezistențe...' },
      { id: 'r2', label: 'Ce decizii au continuat să vină la tine deși erau în coloana 1?', placeholder: 'Listează deciziile care încă urcă la tine...' },
      { id: 'r3', label: 'Câte întrebări pe zi ai eliminat după prima săptămână?', placeholder: 'Estimare: ___ întrebări/zi mai puțin' },
    ],
  },

  // ─── SĂPTĂMÂNA 4 — Etapa 2 + Etapa 3 ──────────────────────────────────────
  // (mod-2: e-2-6 · mod-3: e-3-6 / e-3-7 / e-3-8)

  // e-2-6: Profilul primei angajări → form-fields
  {
    exerciseId: 'e-2-6',
    type: 'form-fields',
    title: 'Profilul primei angajări',
    instructions:
      'Pornind de la organigrama vizată construită în Săptămâna 3, definești complet prima poziție pe care trebuie să o ocupi: profil, anunț de angajare și plan de integrare.',
    fields: [
      {
        id: 'pa_info',
        type: 'info',
        text: 'Pasul 1 — Identifică poziția prioritară din organigrama vizată (cea marcată cu gri pe care trebuie să o ocupi cel mai urgent).',
      },
      { id: 'pa_functie', type: 'input', label: 'Funcția de angajat', placeholder: 'Ex: Specialist marketing / Coordonator producție' },
      { id: 'pa_dece', type: 'textarea', label: 'De ce această funcție și nu alta?', placeholder: 'Justificarea ta — de ce e prioritară acum.' },
      { id: 'pa_cand', type: 'input', label: 'Până când ai nevoie de ea?', placeholder: 'Ex: 30.07.2026' },

      {
        id: 'pa_info2',
        type: 'info',
        text: 'Pasul 2 — Construiește profilul complet al funcției.',
      },
      { id: 'pa_produs', type: 'textarea', label: 'Produsul final al funcției (ce măsurabil produce lunar)', placeholder: 'Ex: 20 de articole publicate / lună cu engagement > 3%.' },
      { id: 'pa_criteriu', type: 'textarea', label: 'Criteriul de evaluare (după ce îl măsori)', placeholder: 'Ce cifră / rezultat verifică performanța.' },
      { id: 'pa_context', type: 'textarea', label: 'Cum lucrează (context real, ce primește, cu cine)', placeholder: 'Cine îi dă input, cine primește output, ce tooluri folosește.' },
      { id: 'pa_salariu', type: 'textarea', label: 'Salariul (fix + bonus + condiția de bonus)', placeholder: 'Ex: 5000 RON fix + 1000 RON bonus dacă target atins.' },
      { id: 'pa_calitati', type: 'textarea', label: 'Calități necesare (potrivite cu funcția)', placeholder: 'Listează calitățile-cheie — nu generice ("muncitor"), ci specifice.' },
      { id: 'pa_kpi', type: 'textarea', label: 'KPI-ul principal (1–2 indicatori clari)', placeholder: 'Ex: număr leaduri calificate / lună; rata de conversie.' },

      {
        id: 'pa_info3',
        type: 'info',
        text: 'Pasul 3 — Construiește anunțul de angajare pe baza celor 4 componente din Lecția 8.',
      },
      { id: 'pa_an_produc', type: 'textarea', label: '1. CE PRODUCI (rezultatul concret al jobului)', placeholder: 'Cum se va vedea succesul în această poziție.' },
      { id: 'pa_an_lucru', type: 'textarea', label: '2. CUM LUCREZI (mediu, echipă, instrumente)', placeholder: 'Cu cine, în ce ritm, în ce sistem.' },
      { id: 'pa_an_evalu', type: 'textarea', label: '3. CUM EȘTI EVALUAT (criterii clare)', placeholder: 'Cifrele după care e judecat.' },
      { id: 'pa_an_salar', type: 'textarea', label: '4. SALARIUL (transparent, complet)', placeholder: 'Pachet financiar complet — fără surprize.' },

      {
        id: 'pa_info4',
        type: 'info',
        text: 'Pasul 4 — Planul de integrare. Ce pregătești cu o săptămână înainte să vină omul.',
      },
      { id: 'pa_pregatire', type: 'textarea', label: 'Pregătirea înainte de prima zi', placeholder: '1. Acces sisteme și tooluri: ...\n2. Echipament necesar: ...\n3. Cont email, badge, etc.: ...' },
      { id: 'pa_sarcini', type: 'textarea', label: 'Primele 5 sarcini concrete + deadline pentru prima săptămână', placeholder: '1. ... — deadline: ...\n2. ... — deadline: ...\n3. ...' },
      { id: 'pa_intalniri', type: 'textarea', label: 'Întâlniri programate cu echipa în prima săptămână', placeholder: 'Ex: Luni 10:00 cu CEO, Marți 14:00 cu echipa de marketing...' },
    ],
  },

  // e-3-6: Primul tău SOP documentat → form-fields
  {
    exerciseId: 'e-3-6',
    type: 'form-fields',
    title: 'Primul tău SOP documentat',
    instructions:
      'Documentezi UN proces de bază din firma ta complet și corect — cu toate cele 5 componente ale SOP-ului. La final ai un document pe care îl poți preda echipei.',
    fields: [
      {
        id: 'sop_info1',
        type: 'info',
        text: 'Pasul 1 — Alege procesul potrivit. Răspunde la 3 întrebări și ia procesul care apare la toate 3. Apoi deschide Template-ul SOP din pagina Documente pentru forma finală tipăribilă.',
      },
      { id: 'sop_i1', type: 'textarea', label: '1. Care e procesul pe care îl faci cel mai des + implică mai mult de o persoană?', placeholder: 'Răspuns scurt și concret.' },
      { id: 'sop_i2', type: 'textarea', label: '2. Care e procesul care, dacă e greșit, afectează cel mai mult calitatea sau clientul?', placeholder: 'Răspuns scurt și concret.' },
      { id: 'sop_i3', type: 'textarea', label: '3. Care e procesul pe care îl explici cel mai des echipei de la zero?', placeholder: 'Răspuns scurt și concret.' },
      { id: 'sop_ales', type: 'input', label: 'Procesul ales (concluzia)', placeholder: 'Numele clar al procesului.' },
      { id: 'sop_tip', type: 'input', label: 'Tipul SOP (Liniar sau Decizional)', placeholder: 'Liniar / Decizional' },

      {
        id: 'sop_info2',
        type: 'info',
        text: 'Pasul 2 — Completează cele 5 componente ale SOP-ului. Pentru exportul final tipăribil, intră în Documente → "SOP — Procedură Standard".',
      },
      { id: 'sop_titlu', type: 'input', label: '1. Titlu + responsabil + versiune', placeholder: 'Ex: SOP-001 · Producerea unei lecții · Resp: Victor · v1.0' },
      { id: 'sop_scop', type: 'textarea', label: '2. Scopul (1–2 fraze)', placeholder: 'De ce există procesul. Ce rezultat asigură.' },
      { id: 'sop_roluri', type: 'textarea', label: '3. Rolurile implicate (NU numele — rolurile)', placeholder: 'Ex: Coordonator producție, Editor video, Designer...' },
      { id: 'sop_pasi', type: 'textarea', label: '4. Pașii (Nr / Responsabil / Acțiunea / Output)', placeholder: '1. Resp: ... — Acțiunea: ... — Output: ...\n2. Resp: ... — Acțiunea: ... — Output: ...\n3. ...' },
      { id: 'sop_calitate', type: 'textarea', label: '5. Criteriul de calitate (2–3 condiții care confirmă că procesul a mers bine)', placeholder: 'Ex: deadline respectat, output validat de coordonator, fără greșeli majore.' },

      {
        id: 'sop_info3',
        type: 'info',
        text: 'Pasul 3 — Prezintă SOP-ul echipei. Răspunde la cele 2 întrebări după prezentare.',
      },
      { id: 'sop_reactie', type: 'textarea', label: 'Cum a reacționat echipa când a văzut procesul documentat? Ce întrebări au avut?', placeholder: 'Scrie reacțiile și întrebările.' },
      { id: 'sop_descoperire', type: 'textarea', label: 'Ce ai descoperit documentând procesul pe care nu îl știai înainte?', placeholder: 'Aspecte invizibile, ineficiențe, suprapuneri.' },
    ],
  },

  // e-3-7: Harta proceselor → dynamic-table
  {
    exerciseId: 'e-3-7',
    type: 'dynamic-table',
    title: 'Harta completă a proceselor firmei tale',
    instructions:
      'Treci prin fiecare din cele 7 funcții și notează procesele repetabile și importante. Pentru fiecare proces alege Tip SOP (Liniar/Decizional) și Prioritate (Critică/Înaltă/Medie). Adaugă rânduri pentru câte procese ai nevoie.',
    fields: [
      {
        id: 'hp_info',
        type: 'info',
        text: 'Folosește structura celor 7 funcții: 1) Construcția echipei, 2) Marketing și Vânzări, 3) Finanțe, 4) Producție / Serviciu, 5) Calitate, 6) PR și Imagine, 7) Conducere. Prioritizează: Critică = Impact mare + Efort mic/mediu · Înaltă = Impact mare + Efort mare · Medie = Impact mic.',
      },
      {
        id: 'hp_table',
        type: 'dynamic-table',
        columns: ['Funcția', 'Procesul', 'Tip SOP (Liniar/Decizional)', 'Prioritate (Critică/Înaltă/Medie)'],
        addLabel: 'Adaugă proces',
      },
    ],
  },

  // e-3-8: Primul flux vizual în Miro → form-fields
  {
    exerciseId: 'e-3-8',
    type: 'form-fields',
    title: 'Primul tău flux vizual în Miro',
    instructions:
      'Vizualizezi SOP-ul din Exercițiul 2 ca flux pe coloane per rol în Miro. Folosește ghidul "Ghid Miro · Fluxuri Vizuale" din Bibliotecă pentru pașii detaliați.',
    fields: [
      {
        id: 'mf_info1',
        type: 'info',
        text: 'Pasul 1 — Pregătire înainte de Miro. Completează tabelul înainte să deschizi board-ul.',
      },
      { id: 'mf_proces', type: 'input', label: 'Procesul din SOP (din Exercițiul 2)', placeholder: 'Numele procesului ales.' },
      { id: 'mf_tip', type: 'input', label: 'Tipul fluxului (Liniar sau Decizional)', placeholder: 'Liniar / Decizional' },
      { id: 'mf_roluri', type: 'textarea', label: 'Rolurile implicate = coloanele fluxului', placeholder: '1. ...\n2. ...\n3. ...\n4. ...' },
      { id: 'mf_paralel', type: 'textarea', label: 'Există acțiuni care merg în paralel? Care?', placeholder: 'Ex: Editor montează video în paralel cu Designerul care face grafica.' },
      { id: 'mf_decizie', type: 'textarea', label: 'Punct de decizie (doar pentru flux decizional)', placeholder: 'Întrebarea din romb: ...\nDA → ...\nNU → ...' },

      {
        id: 'mf_info2',
        type: 'info',
        text: 'Pasul 2 — Construiește fluxul în Miro urmând Ghidul Miro din Bibliotecă. La final, lipește link-ul board-ului mai jos.',
      },
      { id: 'mf_url', type: 'input', label: 'Link-ul către board-ul Miro construit', placeholder: 'https://miro.com/app/board/...' },
      { id: 'mf_descoperire', type: 'textarea', label: 'Ce ai descoperit construind fluxul vizual pe care nu ai văzut în SOP?', placeholder: 'Suprapuneri, pași inutili, decizii ascunse...' },
    ],
  },

  // ═══════════════════════════════════════════════════════════════════
  // SĂPTĂMÂNA 6 · CONTOARELE — L15/L16/L17 (KPI, KPI Viu, Tabloul de bord)
  // ═══════════════════════════════════════════════════════════════════

  // ex-6-1-kpi-fisa — L15 „Contoarele" · Cele 6 elemente + testul final
  {
    exerciseId: 'ex-6-1-kpi-fisa',
    type: 'form-fields',
    title: 'Fișa KPI · Cele 6 elemente',
    instructions:
      'Un KPI măsoară produsul funcției, nu o activitate la întâmplare. Pornește de la produsul rolului și verifică lanțul: produsul funcției → strategia → guideline → KPI.',
    fields: [
      { id: 'kpi_info', type: 'info', text: 'Înainte să completezi: alege UN rol din firma ta și produsul lui finit. Vei construi un singur KPI de la zero. Poți relua fișa pentru fiecare rol cheie.' },
      { id: 'kpi_rol', type: 'input', label: 'Rolul', placeholder: 'ex: Director de Vânzări' },
      { id: 'kpi_functia', type: 'input', label: 'Funcția', placeholder: 'ex: Vânzări' },
      { id: 'kpi_produs', type: 'textarea', label: 'Produsul rolului', placeholder: 'Ce livrează concret rolul, în cifre. Ex: „Contracte semnate luna asta".' },

      { id: 'kpi_e1_info', type: 'info', text: 'ELEMENTUL 1 · Numele indicatorului — ce măsori exact. Un nume clar pe care oricine îl citește îl înțelege la fel.' },
      { id: 'kpi_e1', type: 'textarea', label: '1 · Numele indicatorului', placeholder: 'Control: dacă dau acest nume la doi oameni diferiți, vor număra același lucru?' },

      { id: 'kpi_e2_info', type: 'info', text: 'ELEMENTUL 2 · Legătura cu produsul funcției — veriga care ține lanțul întreg. NU sări acest element.' },
      { id: 'kpi_e2', type: 'textarea', label: '2 · Legătura cu produsul funcției', placeholder: 'Control: dacă KPI-ul e atins, apare garantat produsul funcției? Sau poate fi atins pe lângă el?' },

      { id: 'kpi_e3_info', type: 'info', text: 'ELEMENTUL 3 · Unitatea de măsură — număr, procent, lei, ore, zile.' },
      { id: 'kpi_e3', type: 'input', label: '3 · Unitatea de măsură', placeholder: 'Control: e clar în ce unitate măsor, ca să nu numere doi oameni diferit?' },

      { id: 'kpi_e4_info', type: 'info', text: 'ELEMENTUL 4 · Ținta — cât trebuie să fie cifra ca să spunem că e bine. Fără țintă, o cifră nu înseamnă nimic.' },
      { id: 'kpi_e4', type: 'input', label: '4 · Ținta', placeholder: 'Control: am decis concret cât înseamnă „bine"? E realistă pentru acest rol?' },

      { id: 'kpi_e5_info', type: 'info', text: 'ELEMENTUL 5 · Frecvența — cât de des măsori. Depinde de cât de repede vrei să reacționezi.' },
      { id: 'kpi_e5', type: 'input', label: '5 · Frecvența', placeholder: 'ex: săptămânal / lunar. Control: frecvența îmi dă timp să intervin dacă merge prost?' },

      { id: 'kpi_e6_info', type: 'info', text: 'ELEMENTUL 6 · Cine răspunde — un singur om responsabil să îl urmărească și să îl raporteze. Și cine verifică.' },
      { id: 'kpi_e6', type: 'input', label: '6 · Cine răspunde / cine verifică', placeholder: 'Control: omul care răspunde poate, prin munca lui, să miște direct această cifră?' },

      { id: 'kpi_test_info', type: 'info', text: 'TESTUL FINAL — răspunde cinstit: „Dacă omul atinge perfect acest KPI, dar firma nu câștigă nimic din asta — e posibil?" Dacă răspunsul e DA, KPI-ul e dezlegat de strategie: reia Elementul 2 înainte să continui.' },
      { id: 'kpi_test', type: 'textarea', label: 'Testul final — răspunsul tău', placeholder: 'NU, e imposibil / DA, e posibil — și ce corectezi.' },

      { id: 'kpi_verif_info', type: 'info', text: 'VERIFICARE FINALĂ — cele 4 criterii: (1) Măsurabil — e o cifră clară, nu o dorință. (2) În puterea omului — el o poate mișca direct prin munca lui. (3) Legat de strategie — măsoară produsul funcției. (4) Cu prag de calitate — numără lucrurile bune, nu doar lucrurile.' },
    ],
  },

  // ex-6-2-kpi-viu — L16 „Cum construiești un KPI viu"
  {
    exerciseId: 'ex-6-2-kpi-viu',
    type: 'form-fields',
    title: 'KPI Viu · De la o cifră la un sistem care mișcă oameni',
    instructions:
      'Un KPI viu are 4 părți: cele 6 elemente + poarta de calitate + cele 3 praguri (roșu/galben/verde față de țintă) + legătura cu salariul. Reia KPI-ul din Fișa KPI (L15) sau construiește unul nou.',
    fields: [
      { id: 'viu_rol', type: 'input', label: 'Rolul', placeholder: 'ex: Director de Vânzări' },
      { id: 'viu_functia', type: 'input', label: 'Funcția', placeholder: 'ex: Vânzări' },
      { id: 'viu_produs', type: 'textarea', label: 'Produsul rolului', placeholder: 'Ce livrează rolul, în cifre.' },

      // Partea 1 — cele 6 elemente (concis)
      { id: 'viu_p1_info', type: 'info', text: 'PARTEA 1 · Cele 6 elemente — reia pe scurt (dacă vii din Fișa KPI, le poți copia).' },
      { id: 'viu_e1', type: 'input', label: '1 · Numele indicatorului', placeholder: 'ex: Contracte semnate luna asta' },
      { id: 'viu_e2', type: 'textarea', label: '2 · Legătura cu produsul funcției', placeholder: 'De ce contribuie direct la produsul rolului?' },
      { id: 'viu_e3', type: 'input', label: '3 · Unitatea de măsură', placeholder: 'nr / procent / lei / ore' },
      { id: 'viu_e4', type: 'input', label: '4 · Ținta', placeholder: 'ex: 20 contracte / lună' },
      { id: 'viu_e5', type: 'input', label: '5 · Frecvența', placeholder: 'ex: săptămânal' },
      { id: 'viu_e6', type: 'input', label: '6 · Cine răspunde / cine verifică', placeholder: 'Un singur responsabil + verificator.' },

      // Partea 2 — poarta de calitate
      { id: 'viu_p2_info', type: 'info', text: 'PARTEA 2 · Poarta de calitate — ce condiție trebuie să îndeplinească un rezultat ca să se NUMERE la KPI. Se numără doar ce respectă standardul, nu orice.' },
      { id: 'viu_poarta', type: 'textarea', label: 'Se numără doar rezultatele care îndeplinesc:', placeholder: 'ex: vânzări peste 200 lei / proiecte acceptate fără refacere / clienți care au plătit avansul.' },

      // Partea 3 — cele 3 praguri
      { id: 'viu_p3_info', type: 'info', text: 'PARTEA 3 · Cele 3 praguri — regula universală: sub țintă = ROȘU, la țintă = GALBEN, peste țintă = VERDE. Definește nivelul cifrei și ce se întâmplă la fiecare prag.' },
      { id: 'viu_rosu_nivel', type: 'input', label: '🔴 ROȘU · nivelul cifrei', placeholder: 'ex: sub 15 contracte / lună' },
      { id: 'viu_rosu_actiune', type: 'textarea', label: '🔴 ROȘU · ce se întâmplă', placeholder: 'ex: doar fixul, fără bonus + plan de recuperare săptămâna următoare.' },
      { id: 'viu_galben_nivel', type: 'input', label: '🟡 GALBEN · nivelul cifrei', placeholder: 'ex: 15–20 contracte / lună' },
      { id: 'viu_galben_actiune', type: 'textarea', label: '🟡 GALBEN · ce se întâmplă', placeholder: 'ex: fix + bonus întreg.' },
      { id: 'viu_verde_nivel', type: 'input', label: '🟢 VERDE · nivelul cifrei', placeholder: 'ex: peste 20 contracte / lună' },
      { id: 'viu_verde_actiune', type: 'textarea', label: '🟢 VERDE · ce se întâmplă', placeholder: 'ex: fix + bonus + stimulent depășire (X lei per contract în plus).' },

      // Partea 4 — legătura cu salariul
      { id: 'viu_p4_info', type: 'info', text: 'PARTEA 4 · Legătura cu salariul — legi de bani DOAR un KPI complet în puterea omului. Proporții orientative: vânzător variabilă 30–50%, roluri de mijloc ~20%, roluri de suport (contabil) variabilă ~10%.' },
      { id: 'viu_fix', type: 'input', label: 'Componenta fixă (lunar)', placeholder: 'ex: 800 EUR echivalent' },
      { id: 'viu_var', type: 'input', label: 'Componenta variabilă maximă', placeholder: 'ex: 400 EUR (~33% din total)' },
      { id: 'viu_rosu_pay', type: 'input', label: '🔴 ROȘU → primește', placeholder: 'ex: doar fixul (800 EUR)' },
      { id: 'viu_galben_pay', type: 'input', label: '🟡 GALBEN → primește', placeholder: 'ex: fix + bonus întreg (1200 EUR)' },
      { id: 'viu_verde_pay', type: 'input', label: '🟢 VERDE → primește', placeholder: 'ex: fix + bonus + 15 EUR/contract peste țintă' },

      { id: 'viu_verif_info', type: 'info', text: 'VERIFICARE FINALĂ · bifează în minte: (1) numele e măsurabil, (2) are poartă de calitate, (3) are cele 3 praguri față de țintă, (4) KPI-ul de care leg banii e complet în puterea omului, (5) nu plătesc bonus sub țintă — doar fixul la roșu, (6) omul poate calcula singur, din pragul lui, cât va primi.' },
    ],
  },

  // ex-6-3-tablou-bord — L17 „Tabloul de bord"
  {
    exerciseId: 'ex-6-3-tablou-bord',
    type: 'form-fields',
    title: 'Tabloul de bord · Cele 7 funcții',
    instructions:
      'Un singur indicator de rezultat pe fiecare din cele 7 funcții ale firmei. Țintă + Realizat + Responsabil pentru fiecare. Când o cifră devine roșie, o desfaci — dar nu monitorizezi zilnic sub-indicatorii.',
    fields: [
      { id: 'tb_firma', type: 'input', label: 'Numele firmei', placeholder: 'ex: Firma SRL' },
      { id: 'tb_saptamana', type: 'input', label: 'Săptămâna', placeholder: 'ex: 20–26 iulie 2026' },

      { id: 'tb_exemplu_info', type: 'info', text: 'EXEMPLU (o firmă cu toate funcțiile active): 1·Echipă — Retenție 90% țintă / 93% realizat 🟢 · 2·Vânzări — Venit 400k țintă / 356k 🔴 · 3·Finanțe — Cash >200k / 245k 🟢 · 4·Producție — Livrări la timp 95% / 91% 🟡 · 5·Calitate — Reclamații <5 / 3 🟢 · 6·PR — Creștere +800 / +610 🟡 · 7·Conducere — Profit net 80k / 61k 🔴. Ochiul merge direct la cele două roșii. Nu citești numere, vezi unde arde.' },

      { id: 'tb_f1_info', type: 'info', text: '1 · CONSTRUCȚIA ECHIPEI — indicator de rezultat pentru cum ține echipa (ex: rata de retenție).' },
      { id: 'tb_f1_ind', type: 'input', label: '1 · Indicatorul', placeholder: 'ex: Rata de retenție a angajaților' },
      { id: 'tb_f1_tinta', type: 'input', label: '1 · Ținta', placeholder: 'ex: 90%' },
      { id: 'tb_f1_real', type: 'input', label: '1 · Realizat', placeholder: 'ex: 93%' },
      { id: 'tb_f1_resp', type: 'input', label: '1 · Responsabil', placeholder: 'Cine completează această cifră.' },

      { id: 'tb_f2_info', type: 'info', text: '2 · MARKETING ȘI VÂNZĂRI — un singur indicator (venit din vânzări). Când e roșu, îl desfaci: lead-uri calificate + conversie.' },
      { id: 'tb_f2_ind', type: 'input', label: '2 · Indicatorul', placeholder: 'ex: Venit din vânzări pe lună' },
      { id: 'tb_f2_tinta', type: 'input', label: '2 · Ținta', placeholder: 'ex: 400.000' },
      { id: 'tb_f2_real', type: 'input', label: '2 · Realizat', placeholder: 'ex: 356.000' },
      { id: 'tb_f2_resp', type: 'input', label: '2 · Responsabil', placeholder: '' },

      { id: 'tb_f3_info', type: 'info', text: '3 · FINANȚE — indicator de sănătate financiară (ex: cash flow disponibil).' },
      { id: 'tb_f3_ind', type: 'input', label: '3 · Indicatorul', placeholder: 'ex: Cash flow disponibil' },
      { id: 'tb_f3_tinta', type: 'input', label: '3 · Ținta', placeholder: 'ex: > 200.000' },
      { id: 'tb_f3_real', type: 'input', label: '3 · Realizat', placeholder: 'ex: 245.000' },
      { id: 'tb_f3_resp', type: 'input', label: '3 · Responsabil', placeholder: '' },

      { id: 'tb_f4_info', type: 'info', text: '4 · PRODUCȚIE / SERVICIU — livrări la timp și la calitate.' },
      { id: 'tb_f4_ind', type: 'input', label: '4 · Indicatorul', placeholder: 'ex: % livrări la timp și la calitate' },
      { id: 'tb_f4_tinta', type: 'input', label: '4 · Ținta', placeholder: 'ex: 95%' },
      { id: 'tb_f4_real', type: 'input', label: '4 · Realizat', placeholder: 'ex: 91%' },
      { id: 'tb_f4_resp', type: 'input', label: '4 · Responsabil', placeholder: '' },

      { id: 'tb_f5_info', type: 'info', text: '5 · CALITATEA — reclamații / retururi / refaceri.' },
      { id: 'tb_f5_ind', type: 'input', label: '5 · Indicatorul', placeholder: 'ex: Reclamații pe lună' },
      { id: 'tb_f5_tinta', type: 'input', label: '5 · Ținta', placeholder: 'ex: < 5' },
      { id: 'tb_f5_real', type: 'input', label: '5 · Realizat', placeholder: 'ex: 3' },
      { id: 'tb_f5_resp', type: 'input', label: '5 · Responsabil', placeholder: '' },

      { id: 'tb_f6_info', type: 'info', text: '6 · PR ȘI IMAGINEA — creștere audiență relevantă / mențiuni / reach.' },
      { id: 'tb_f6_ind', type: 'input', label: '6 · Indicatorul', placeholder: 'ex: Creștere audiență relevantă' },
      { id: 'tb_f6_tinta', type: 'input', label: '6 · Ținta', placeholder: 'ex: +800' },
      { id: 'tb_f6_real', type: 'input', label: '6 · Realizat', placeholder: 'ex: +610' },
      { id: 'tb_f6_resp', type: 'input', label: '6 · Responsabil', placeholder: '' },

      { id: 'tb_f7_info', type: 'info', text: '7 · CONDUCEREA — profit net / marjă / obiectiv strategic.' },
      { id: 'tb_f7_ind', type: 'input', label: '7 · Indicatorul', placeholder: 'ex: Profit net lunar' },
      { id: 'tb_f7_tinta', type: 'input', label: '7 · Ținta', placeholder: 'ex: 80.000' },
      { id: 'tb_f7_real', type: 'input', label: '7 · Realizat', placeholder: 'ex: 61.000' },
      { id: 'tb_f7_resp', type: 'input', label: '7 · Responsabil', placeholder: '' },

      { id: 'tb_desfacere_info', type: 'info', text: 'REGULA DESFACERII — când un indicator e roșu, îl desfaci ca să vezi unde s-a rupt lanțul. Ex: Vânzări roșu → puține lead-uri = problemă la marketing; multe lead-uri + conversie mică = problemă la vânzare. Desfaci doar ca să diagnostichezi, NU ca să monitorizezi zilnic.' },
      { id: 'tb_desfacere', type: 'textarea', label: 'Aplică regula pentru firma ta: ce indicator e roșu acum și cum îl desfaci?', placeholder: 'Indicator roșu: ...\nCum îl desfac (2–3 sub-indicatori): ...' },

      { id: 'tb_raport_info', type: 'info', text: 'SISTEMUL DE RAPORTARE — fiecare responsabil își pune propria cifră (nu proprietarul), până la un moment fix înainte de ședința săptămânală. Lângă cifră, 3 întrebări: ce s-a făcut, ce rezultat, ce blocaje.' },
      { id: 'tb_cine', type: 'input', label: 'Cine completează', placeholder: 'ex: Fiecare responsabil își pune propria cifră' },
      { id: 'tb_cand', type: 'input', label: 'Când (termen limită)', placeholder: 'ex: Vineri, 18:00' },
      { id: 'tb_intrebari', type: 'textarea', label: 'Cele 3 întrebări lângă cifră', placeholder: '1. Ce s-a făcut?\n2. Ce rezultat?\n3. Ce blocaje?' },
    ],
  },
];

export function getExerciseTemplate(exerciseId: string): ExerciseTemplate | undefined {
  return EXERCISE_TEMPLATES.find((t) => t.exerciseId === exerciseId);
}
