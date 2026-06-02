import { Module, User, WhitelistEntry } from './types';

export type EventType = 'zoom' | 'workshop';

export interface LiveEvent {
  id: string;
  title: string;
  type: EventType;
  date: string;
  time: string;
  duration: string;
  description: string;
  workshopThemes?: string[];
}

export const LIVE_EVENTS: LiveEvent[] = [
  {
    id: 'ev-1',
    type: 'zoom',
    title: 'Zoom de Grup #1 · Victor Morar',
    date: '2026-05-21',
    time: '19:00',
    duration: '90 min',
    description: 'Sesiune live de grup. Prezentare, întrebări, dialog deschis între participanți și Victor Morar.',
  },
  {
    id: 'ev-2',
    type: 'workshop',
    title: 'Workshop Tematic #1',
    date: '2026-05-29',
    time: '19:00',
    duration: '90 min',
    description: 'Workshop interactiv. Victor prezintă în detaliu tema aleasă de grup.',
    workshopThemes: ['Tema #1', 'Tema #2', 'Tema #3', 'Tema #4', 'Tema #5'],
  },
  {
    id: 'ev-3',
    type: 'zoom',
    title: 'Zoom de Grup #2 · Victor Morar',
    date: '2026-06-04',
    time: '19:00',
    duration: '90 min',
    description: 'Sesiune live de grup. Discutăm progresul, blocajele și pașii următori.',
  },
  {
    id: 'ev-4',
    type: 'workshop',
    title: 'Workshop Tematic #2',
    date: '2026-06-12',
    time: '19:00',
    duration: '90 min',
    description: 'Workshop interactiv pe tema aleasă de participanți.',
    workshopThemes: ['Tema #1', 'Tema #2', 'Tema #3', 'Tema #4', 'Tema #5'],
  },
  {
    id: 'ev-5',
    type: 'zoom',
    title: 'Zoom de Grup #3 · Victor Morar',
    date: '2026-06-18',
    time: '19:00',
    duration: '90 min',
    description: 'Sesiune live de grup. Review etape, feedback individual.',
  },
  {
    id: 'ev-6',
    type: 'workshop',
    title: 'Workshop Tematic #3',
    date: '2026-06-26',
    time: '19:00',
    duration: '90 min',
    description: 'Workshop interactiv. Tema aleasă de grup, prezentare extinsă.',
    workshopThemes: ['Tema #1', 'Tema #2', 'Tema #3', 'Tema #4', 'Tema #5'],
  },
  {
    id: 'ev-7',
    type: 'zoom',
    title: 'Zoom de Grup #4 · Victor Morar',
    date: '2026-07-02',
    time: '19:00',
    duration: '90 min',
    description: 'Sesiune live de grup. Pregătire finală și recepție.',
  },
  {
    id: 'ev-8',
    type: 'workshop',
    title: 'Workshop Tematic #4 · Final',
    date: '2026-07-10',
    time: '19:00',
    duration: '90 min',
    description: 'Workshop final. Recepție, prezentare dosare, certificare.',
    workshopThemes: ['Tema #1', 'Tema #2', 'Tema #3', 'Tema #4', 'Tema #5'],
  },
];

export const MODULES: Module[] = [
  {
    id: 'mod-0',
    title: 'Proiectul Casei',
    subtitle: 'Diagnostică & Plan',
    description:
      'Înainte să sapi fundația, desenezi proiectul. Fără pasul ăsta intri în practicum în orb.',
    order_index: 0,
    etapa: 'Etapa 0',
    saptamana: 'Săptămâna 0',
    unlockDate: '2026-05-18',
    deliverable:
      'Raport diagnostic de 1–2 pagini + Plan personalizat pe 8 săptămâni. Fără acest raport nu se intră în Etapa 1.',
    lessons: [
      {
        id: 'l-0-1',
        module_id: 'mod-0',
        title: 'Bun venit. Hai să începem.',
        description:
          'Cine este Victor Morar, de ce a creat acest practicum, ce construim împreună în 8 săptămâni și ce se așteaptă de la tine.',
        video_url: '',
        pdf_url: '',
        duration_min: 20,
        order_index: 1,
        is_published: false,
      },
      {
        id: 'l-0-2',
        module_id: 'mod-0',
        title: 'Unde ești și de ce ești blocat acolo',
        description:
          'Cele 3 roluri (Specialist, Director, Proprietar), cele 5 stadii de maturitate ale unei afaceri și de ce nu ieși din operațional.',
        video_url: '',
        pdf_url: '',
        duration_min: 18,
        order_index: 2,
        is_published: false,
      },
      {
        id: 'l-0-3',
        module_id: 'mod-0',
        title: 'Parteneriatul.',
        description:
          '6 tipuri de parteneriate, de ce fiecare e problematic și cum îl rezolvi. Dacă ești singur în afacere poți sări această lecție.',
        video_url: '',
        duration_min: 38,
        order_index: 3,
        is_published: false,
        documents: [
          {
            docNumber: '01',
            title: 'Cele 10 Conversații Obligatorii Înainte de Orice Parteneriat',
            description: 'Ghid complet cu întrebările esențiale pe care trebuie să le discuți cu un potențial partener înainte de a semna orice.',
            url: '/docs/AA_Doc1_Inainte_Parteneriat.pdf',
          },
          {
            docNumber: '02',
            title: 'Protocol de Ieșire sau Restructurare a Parteneriatului',
            description: 'Pași clari pentru fiecare tip de parteneriat — de la diagnosticare la conversația directă și execuția legală.',
            url: '/docs/AA_Doc2_Iesire_Parteneriat.pdf',
          },
          {
            docNumber: '03',
            title: 'Acord de Parteneriat Minimal',
            description: 'Contract pre-legal simplu (1 pagină) pe care doi parteneri îl semnează înainte să meargă la notar.',
            url: '/docs/AA_Doc3_Acord_Parteneriat_Minimal.pdf',
          },
        ],
      },
      {
        id: 'l-0-ex-1',
        module_id: 'mod-0',
        title: 'Auditul Activităților Tale',
        description: 'Scrie TOT ce faci în firma ta, estimează % din timp și clasifică fiecare activitate ca Specialist (S), Director (D) sau Proprietar (P). Vei vedea negru pe alb câte % din timp ești angajat și nu proprietar.',
        video_url: '',
        duration_min: 25,
        order_index: 4,
        is_published: true,
        type: 'exercise',
        exercise_id: 'e-0-1',
      },
      {
        id: 'l-0-ex-2',
        module_id: 'mod-0',
        title: 'Harta Gâturilor de Sticlă',
        description: 'Listează toate deciziile din ultima săptămână care au ajuns la tine. Clasifică: chiar trebuia să fii tu implicat sau e o scuză a sistemului? Calculezi exact câte minute/săptămână pierzi ca gât de sticlă.',
        video_url: '',
        duration_min: 30,
        order_index: 5,
        is_published: true,
        type: 'exercise',
        exercise_id: 'e-0-2',
      },
      {
        id: 'l-0-ex-3',
        module_id: 'mod-0',
        title: 'Testul de Absență',
        description: 'Dacă ai pleca mâine 2 zile fără telefon — ce s-ar întâmpla? Listezi toate scenariile, le clasifici după gravitate și identifici dacă frica e de lipsa ta sau de lipsa sistemului.',
        video_url: '',
        duration_min: 20,
        order_index: 6,
        is_published: true,
        type: 'exercise',
        exercise_id: 'e-0-3',
      },
      {
        id: 'l-0-ex-4',
        module_id: 'mod-0',
        title: 'Diagnosticul Complet · 50 de Întrebări',
        description: '50 de întrebări pe 6 dimensiuni ale sistematizării, scală 1–5. Îți arată exact pe ce treaptă ești, unde ai găurile și care sunt cele 3 priorități de atacat în practicumul de față.',
        video_url: '',
        duration_min: 45,
        order_index: 7,
        is_published: true,
        type: 'exercise',
        exercise_id: 'e-0-4',
      },
      {
        id: 'l-0-ex-5',
        module_id: 'mod-0',
        title: 'Diagnosticul Parteneriatului',
        description: 'Identifici tipul tău de parteneriat, diagnostichezi problema reală, stabilești primul pas concret și completezi blanks-urile cu partenerul tău (sau individual dacă ești singur în afacere).',
        video_url: '',
        duration_min: 25,
        order_index: 8,
        is_published: true,
        type: 'exercise',
        exercise_id: 'e-0-5',
        documents: [
          {
            docNumber: '01',
            title: 'Cele 10 Conversații Înainte de Parteneriat',
            description: 'Ghid cu întrebările esențiale de discutat înainte de orice parteneriat.',
            url: '/docs/AA_Doc1_Inainte_Parteneriat.pdf',
          },
          {
            docNumber: '02',
            title: 'Protocol de Ieșire sau Restructurare',
            description: 'Pași clari pentru fiecare tip de parteneriat — diagnosticare și execuție.',
            url: '/docs/AA_Doc2_Iesire_Parteneriat.pdf',
          },
          {
            docNumber: '03',
            title: 'Acord de Parteneriat Minimal',
            description: 'Contract pre-legal simplu de semnat înainte de notar.',
            url: '/docs/AA_Doc3_Acord_Parteneriat_Minimal.pdf',
          },
        ],
      },
    ],
    exercises: [
      {
        id: 'e-0-1',
        module_id: 'mod-0',
        title: 'Auditul Activităților Tale',
        description:
          'Scrie tot ce faci în firma ta și clasifică fiecare activitate ca Specialist, Director sau Proprietar. Vei vedea negru pe alb câte % din timp ești angajat vs proprietar.',
        order_index: 1,
      },
      {
        id: 'e-0-2',
        module_id: 'mod-0',
        title: 'Harta Gâturilor de Sticlă',
        description:
          'Listezi toate deciziile din săptămâna trecută care au trecut prin tine. Le clasifici: chiar trebuia să fii tu? Calculezi exact câte minute/săptămână pierzi ca gât de sticlă.',
        order_index: 2,
      },
      {
        id: 'e-0-3',
        module_id: 'mod-0',
        title: 'Testul de Absență',
        description:
          'Dacă ai pleca 2 zile fără telefon — ce s-ar întâmpla? Listezi toate scenariile și identifici dacă frica e de lipsa ta sau de lipsa sistemului.',
        order_index: 3,
      },
      {
        id: 'e-0-4',
        module_id: 'mod-0',
        title: 'Diagnosticul Complet · 50 de Întrebări',
        description:
          '50 de întrebări pe 6 dimensiuni: Claritate, Structură, Procese, Control, Delegare, Scalare. Scala 1–5. Îți arată exact unde ai găurile și care sunt cele 3 priorități de atacat.',
        order_index: 4,
      },
      {
        id: 'e-0-5',
        module_id: 'mod-0',
        title: 'Diagnosticul Parteneriatului',
        description:
          'Identifici tipul tău de parteneriat, diagnostichezi problema reală și stabilești primul pas. Sari această lecție dacă ești singur în afacere.',
        order_index: 5,
      },
    ],
  },
  {
    id: 'mod-1',
    title: 'Fundația',
    subtitle: 'Claritate & Poziționare',
    description:
      'Dacă fundația e strâmbă, toată casa e strâmbă. La finalul acestei săptămâni ai pe hârtie cine ești tu în afacerea ta.',
    order_index: 1,
    etapa: 'Etapa 1',
    saptamana: 'Săptămâna 1',
    unlockDate: '2026-05-25',
    deliverable:
      'Manifestul Fundației — 1 pagină A4. Imprimat și pus pe perete în birou. Devine documentul-mamă al afacerii.',
    lessons: [
      {
        id: 'l-1-1',
        module_id: 'mod-1',
        title: 'Misiunea Viziunea Valorile',
        description:
          'Cei 3 piloni ai Fundației. Misiunea — de ce există firma ta. Viziunea — unde ești în 3 ani, cu cifre reale. Valorile — regulile echipei când tu nu ești în cameră.',
        video_url: '',
        pdf_url: '',
        duration_min: 0,
        order_index: 1,
        is_published: false,
      },
      {
        id: 'l-1-2',
        module_id: 'mod-1',
        title: 'Cum comunici echipei, Fundația companiei?',
        description:
          'Cum prezinți Misiunea, Viziunea și Valorile echipei tale astfel încât să fie înțelese, asumate și aplicate zilnic — nu doar afișate pe perete.',
        video_url: '',
        pdf_url: '',
        duration_min: 0,
        order_index: 2,
        is_published: false,
      },
      // ─── Exercițiile Săptămânii 2 ───────────────────────────────────────────
      {
        id: 'l-1-ex-1',
        module_id: 'mod-1',
        title: 'Misiunea · Viziunea · Valorile',
        description:
          'Construiești cei 3 piloni ai Fundației afacerii tale. Misiunea — de ce există firma ta. Viziunea — unde ești în 3 ani, cu cifre reale. Valorile — regulile echipei când tu nu ești în cameră.',
        video_url: '',
        duration_min: 45,
        order_index: 6,
        is_published: true,
        type: 'exercise',
        exercise_id: 'e-1-s2-1',
      },
      {
        id: 'l-1-ex-2',
        module_id: 'mod-1',
        title: 'Checklist de Calitate',
        description:
          'Verifici că ce ai scris e clar, concret și testat. 16 criterii bifabile grupate pe Misiune, Viziune, Valori și General. Bifezi înainte de a preda.',
        video_url: '',
        duration_min: 15,
        order_index: 7,
        is_published: true,
        type: 'exercise',
        exercise_id: 'e-1-s2-2',
      },
      {
        id: 'l-1-ex-3',
        module_id: 'mod-1',
        title: 'Feedback din Ședința cu Echipa',
        description:
          'Completezi după ședința cu echipa ta. Prezinți Manifestul element cu element și notezi imediat obiecțiile, ce a rezonat și primul ritual concret pe care îl introduci.',
        video_url: '',
        duration_min: 30,
        order_index: 8,
        is_published: true,
        type: 'exercise',
        exercise_id: 'e-1-s2-3',
      },
      {
        id: 'l-1-ex-liv',
        module_id: 'mod-1',
        title: 'Manifestul Fundației · Livrabil Final',
        description:
          'Pagina ta A4. Se populează automat din răspunsurile tale din Exercițiul 1. Tipărește-o. Pune-o pe peretele biroului. E fundația pe care construim tot ce urmează.',
        video_url: '',
        duration_min: 10,
        order_index: 9,
        is_published: true,
        type: 'exercise',
        exercise_id: 'e-1-s2-liv',
      },
    ],
    exercises: [
      {
        id: 'e-1-1',
        module_id: 'mod-1',
        title: 'Lista Rolului Tău',
        description:
          'Coloana A: ce faci TU acum (minim 15 itemi, cu datele din auditul de timp). Coloana B: ce NU mai faci TU de săptămâna viitoare (minim 15 itemi). Pentru fiecare item din B: cui predai și până când. Regula: dacă nu poți scrie un nume real și o dată reală — nu e delegabil încă.',
        order_index: 1,
      },
      {
        id: 'e-1-2',
        module_id: 'mod-1',
        title: 'Manifestul Fundației',
        description:
          'Misiunea: scrii 5 variante, tai 4, rămâne una. Test: o înțelege și un angajat nou? Viziunea: cifra de afaceri, număr angajați, profit lunar, piețe — la 3 ani, cu cifre reale. Valorile: maxim 5, cu comportamentele asociate. Rolul tău: maxim 1 pagină, ce faci și ce nu mai faci.',
        order_index: 2,
      },
    ],
  },
  {
    id: 'mod-2',
    title: 'Pereții Portanți',
    subtitle: 'Structură Organizațională',
    description:
      'Pereții portanți împart casa în camere și o țin în picioare când vine cutremurul.',
    order_index: 2,
    etapa: 'Etapa 2',
    saptamana: 'Săptămâna 2',
    unlockDate: '2026-06-01',
    deliverable:
      'Pachetul Structurii: 2 organigrame + fișe de rol pentru 3 poziții pilot + matrice decizională.',
    lessons: [
      {
        id: 'l-2-1',
        module_id: 'mod-2',
        title: 'Produsul final al fiecărei funcții.',
        description:
          'De ce desenezi VIITORUL, nu prezentul. Organigrama actuală vs organigrama la 3 ani.',
        video_url: 'https://youtu.be/9ZOKyML5_pk',
        pdf_url: '',
        duration_min: 60,
        order_index: 1,
        is_published: true,
      },
      {
        id: 'l-2-2',
        module_id: 'mod-2',
        title: 'Organigrama',
        description:
          'De la 5 la 500 de angajați, aceleași 7 funcții există. Cum le identifici și cum le acoperi în stadiul tău actual.',
        video_url: 'https://youtu.be/qSiLBz9nwIU',
        pdf_url: '',
        duration_min: 46,
        order_index: 2,
        is_published: true,
      },
      {
        id: 'l-2-2b',
        module_id: 'mod-2',
        title: 'Cele 7 funcții obligatorii — partea 2',
        description:
          'Continuarea lecției despre cele 7 funcții obligatorii: aplicare practică și exemple.',
        video_url: 'https://youtu.be/xBzMNDdn5qU',
        pdf_url: '',
        duration_min: 12,
        order_index: 3,
        is_published: true,
      },
      {
        id: 'l-2-3',
        module_id: 'mod-2',
        title: 'Fișa de rol funcțională',
        description:
          'De ce fără indicatori e o foaie albă. Structura corectă: scop, responsabilități, indicatori, decizii autonome.',
        video_url: '',
        pdf_url: '',
        duration_min: 10,
        order_index: 4,
        is_published: false,
      },
      {
        id: 'l-2-ex-1',
        module_id: 'mod-2',
        title: 'Funcția, Rolul și Produsul final',
        description:
          'Alegi una din cele 7 funcții obligatorii și completezi rolurile, persoanele și produsele pentru firma ta.',
        video_url: '',
        duration_min: 20,
        order_index: 5,
        is_published: true,
        type: 'exercise',
        exercise_id: 'e-2-1',
      },
      {
        id: 'l-2-ex-2',
        module_id: 'mod-2',
        title: 'Quiz · Înțelegi organigrama?',
        description:
          '5 situații cu scor. Testezi codul de culori, diferența între actuală și vizată.',
        video_url: '',
        duration_min: 10,
        order_index: 6,
        is_published: true,
        type: 'exercise',
        exercise_id: 'e-2-2',
      },
      {
        id: 'l-2-ex-3',
        module_id: 'mod-2',
        title: 'Construiește organigrama firmei tale în Miro',
        description:
          'Folosești template-ul Miro. 2 organigrame — actuală și vizată — cu codul de culori obligatoriu.',
        video_url: '',
        duration_min: 45,
        order_index: 7,
        is_published: true,
        type: 'exercise',
        exercise_id: 'e-2-3',
      },
      {
        id: 'l-2-ex-4',
        module_id: 'mod-2',
        title: 'Quiz · Linii de conducere sau de comunicare directă?',
        description:
          '6 situații cu scor. Înveți să distingi linia ierarhică de comunicarea directă.',
        video_url: '',
        duration_min: 10,
        order_index: 8,
        is_published: true,
        type: 'exercise',
        exercise_id: 'e-2-4',
      },
      {
        id: 'l-2-ex-5',
        module_id: 'mod-2',
        title: 'Matricea decizională — cine decide ce',
        description:
          'Pentru 2 roluri din firma ta: ce decide singur, ce trec prin manager, ce ajung la tine.',
        video_url: '',
        duration_min: 25,
        order_index: 9,
        is_published: true,
        type: 'exercise',
        exercise_id: 'e-2-5',
      },
    ],
    exercises: [],
  },
  {
    id: 'mod-3',
    title: 'Instalațiile',
    subtitle: 'Procese Operaționale',
    description:
      'Fără țevi, fără curent, fără gaz — nu poți locui în casă. Aici începe eliberarea ta reală.',
    order_index: 3,
    etapa: 'Etapa 3',
    saptamana: 'Săptămânile 3–4',
    unlockDate: '2026-06-08',
    deliverable:
      'Mapa de Operare: minimum 2 procese cheie documentate complet + 1 instrucțiune testată de altcineva.',
    lessons: [
      {
        id: 'l-3-1',
        module_id: 'mod-3',
        title: 'Cum identifici cele 5–7 procese care chiar contează',
        description:
          'Nu toate procesele sunt egale. Cum le scorezi pe impact financiar și frecvență și alegi pe care să le documentezi acum.',
        video_url: '',
        pdf_url: '',
        duration_min: 10,
        order_index: 1,
        is_published: false,
      },
      {
        id: 'l-3-2',
        module_id: 'mod-3',
        title: 'Cum scrii un proces exact așa cum SE FACE',
        description:
          'Nu cum ar trebui să fie — cum se face azi. Diferența critică: "contactează rapid clientul" vs "sună clientul în maxim 2 ore de la primirea cererii".',
        video_url: '',
        pdf_url: '',
        duration_min: 18,
        order_index: 2,
        is_published: false,
      },
      {
        id: 'l-3-3',
        module_id: 'mod-3',
        title: 'Standardizarea deciziilor',
        description:
          'Cum scoți butonul tău de OK din mijlocul firmei. Matricea decizională: cine decide ce și până la ce nivel de autoritate.',
        video_url: '',
        pdf_url: '',
        duration_min: 14,
        order_index: 3,
        is_published: false,
      },
      {
        id: 'l-3-4',
        module_id: 'mod-3',
        title: 'Instrucțiunea pas cu pas',
        description:
          'Instrucțiunea care nu lasă loc de interpretare. Format standard: input → pași numerotați → output → responsabil → indicator de calitate.',
        video_url: '',
        pdf_url: '',
        duration_min: 12,
        order_index: 4,
        is_published: false,
      },
    ],
    exercises: [
      {
        id: 'e-3-1',
        module_id: 'mod-3',
        title: 'Inventarul Proceselor',
        description:
          'Listezi toate procesele firmei (de obicei 20–40). Le scorezi pe 2 axe: impact financiar și frecvență. Tai tot ce nu e în top și alegi 5–7 pe care le documentezi acum.',
        order_index: 1,
      },
      {
        id: 'e-3-2',
        module_id: 'mod-3',
        title: 'Cartografierea unui Proces Real',
        description:
          'Alegi 1 proces din top 5. Îl desenezi cu pașii REALI — cine face ce, cu ce documente intră, ce documente ies, unde apar întârzierile. Marchezi: care pași trec OBLIGATORIU prin tine și de ce.',
        order_index: 2,
      },
      {
        id: 'e-3-3',
        module_id: 'mod-3',
        title: 'Documentezi 2 Procese Pas cu Pas',
        description:
          'Metoda recomandată: filmezi cu telefonul în timp ce execuți, apoi transcrii. 20 de minute de filmat = 1 oră de scris economisită.',
        order_index: 3,
      },
      {
        id: 'e-3-4',
        module_id: 'mod-3',
        title: 'Matricea Decizională pentru Procese',
        description:
          'Pentru cele mai frecvente 5 decizii din fiecare proces documentat: cine poate decide singur, când escaladează, până unde merge autoritatea fiecărui nivel. Exemplu real: discount până la 10% — vânzătorul singur; 10–20% — manager; peste 20% — tu.',
        order_index: 4,
      },
      {
        id: 'e-3-5',
        module_id: 'mod-3',
        title: 'Testul Instrucțiunii',
        description:
          'Dai instrucțiunea unui coleg sau prieten care NU lucrează în acel rol. El o execută doar pe baza documentului tău, fără să te întrebe nimic. Dacă pune o singură întrebare de tip "dar dacă..." — instrucțiunea are găuri. Refaci până când se poate executa fără nicio întrebare adresată ție.',
        order_index: 5,
      },
    ],
  },
  {
    id: 'mod-4',
    title: 'Contoarele',
    subtitle: 'Control & KPI',
    description:
      'Cum știi că apa curge bine în toată casa? Te uiți la contoare. Fără control nu există delegare reală.',
    order_index: 4,
    etapa: 'Etapa 4',
    saptamana: 'Săptămâna 5',
    unlockDate: '2026-06-22',
    deliverable:
      'Sistemul de Control: tablou de bord gata + format raport săptămânal + ritm fix + rezultatul testului de 2 zile.',
    lessons: [
      {
        id: 'l-4-1',
        module_id: 'mod-4',
        title: 'Produsul finit al fiecărui rol',
        description:
          'Cum îl identifici și de ce contează. Test: poți măsura asta în cifre? Dacă nu — nu e produs finit, e activitate.',
        video_url: '',
        pdf_url: '',
        duration_min: 12,
        order_index: 1,
        is_published: false,
      },
      {
        id: 'l-4-2',
        module_id: 'mod-4',
        title: 'De ce indicatorii complicați nu se folosesc',
        description:
          'Și cei simpli, da. Testul celor 3 condiții: e o cifră? e verificabilă? omul are control asupra ei?',
        video_url: '',
        pdf_url: '',
        duration_min: 10,
        order_index: 2,
        is_published: false,
      },
      {
        id: 'l-4-3',
        module_id: 'mod-4',
        title: 'Sistemul de raportare în 3 întrebări',
        description:
          'Ce s-a întâmplat? Ce a cauzat asta? Ce fac diferit săptămâna viitoare? Tabloul de bord în 1 pagină, citit în 5 minute luni dimineața.',
        video_url: '',
        pdf_url: '',
        duration_min: 11,
        order_index: 3,
        is_published: false,
      },
    ],
    exercises: [
      {
        id: 'e-4-1',
        module_id: 'mod-4',
        title: 'Produsul Finit al Fiecărui Rol',
        description:
          'Pentru cele 5 roluri cheie din organigrama ta: ce livrează concret rolul? Exemplu greșit: "răspunde la clienți". Exemplu corect: "20 de cereri procesate pe zi, timp de răspuns max 2h".',
        order_index: 1,
      },
      {
        id: 'e-4-2',
        module_id: 'mod-4',
        title: 'Cei 3–5 Indicatori per Rol',
        description:
          'Pentru fiecare rol cheie: 3–5 cifre care îți arată dacă rolul îți face treaba. Testul celor 3 condiții: e o cifră? e verificabilă? omul are control asupra ei? Dacă nu trece toate 3 — nu e indicator, e iluzie de control.',
        order_index: 2,
      },
      {
        id: 'e-4-3',
        module_id: 'mod-4',
        title: 'Tabloul de Bord în Excel (1 pagină)',
        description:
          'Maxim 10 cifre pe care le deschizi luni dimineața. Test: în 5 minute știi cum a fost săptămâna trecută, fără să suni pe nimeni? Dacă ai nevoie de mai mult de 5 minute — tabloul are prea multe cifre.',
        order_index: 3,
      },
      {
        id: 'e-4-4',
        module_id: 'mod-4',
        title: 'Testul de Absență de 2 Zile',
        description:
          'Pleci de la birou 2 zile lucrătoare fără să suni pe nimeni. Te uiți DOAR la rapoarte și tabloul de bord la întoarcere. Notezi: ce ai pierdut, ce nu ai pierdut, ce decizii s-au luat fără tine. Acesta e primul test real că contoarele funcționează.',
        order_index: 4,
      },
    ],
  },
  {
    id: 'mod-5',
    title: 'Predarea Cheilor',
    subtitle: 'Delegare Reală',
    description:
      'Constructorul nu locuiește în casa pe care a construit-o. Aici predai cheile.',
    order_index: 5,
    etapa: 'Etapa 5',
    saptamana: 'Săptămânile 6–7',
    unlockDate: '2026-06-29',
    deliverable:
      'Dovada Delegării Reale: 1 proces complet predat + acord de responsabilitate semnat de ambele părți + jurnalul primelor 2 săptămâni.',
    lessons: [
      {
        id: 'l-5-1',
        module_id: 'mod-5',
        title: 'Diferența dintre a delega o sarcină și a delega un rezultat',
        description:
          'De ce 9 din 10 antreprenori cred că deleagă, dar de fapt distribuie taskuri. Diferența care schimbă tot.',
        video_url: '',
        pdf_url: '',
        duration_min: 16,
        order_index: 1,
        is_published: false,
      },
      {
        id: 'l-5-2',
        module_id: 'mod-5',
        title: 'Greșelile controlate',
        description:
          'De ce, dacă echipa ta nu greșește niciodată, înseamnă că nu ai delegat. Zona greșelii admise vs liniile roșii.',
        video_url: '',
        pdf_url: '',
        duration_min: 14,
        order_index: 2,
        is_published: false,
      },
      {
        id: 'l-5-3',
        module_id: 'mod-5',
        title: 'Ieșirea treptată din operațional',
        description:
          'Planul de retragere pe 30 de zile. 4 săptămâni cu nivel de implicare descrescând.',
        video_url: '',
        pdf_url: '',
        duration_min: 15,
        order_index: 3,
        is_published: false,
      },
      {
        id: 'l-5-4',
        module_id: 'mod-5',
        title: 'Studiu de caz: cum am ieșit eu din operațional',
        description:
          'Și ce am stricat în prima încercare. Lecțiile reale din retragerea din una dintre afacerile lui Victor Morar.',
        video_url: '',
        pdf_url: '',
        duration_min: 20,
        order_index: 4,
        is_published: false,
      },
    ],
    exercises: [
      {
        id: 'e-5-1',
        module_id: 'mod-5',
        title: 'Lista de Eliberare',
        description:
          '20 de lucruri pe care le faci tu acum și pe care altcineva le-ar putea face. Le scorezi pe 2 axe: cât de mult mă doare să predau și cât de greu e tehnic. Alegi 1 zonă completă de delegat în această etapă.',
        order_index: 1,
      },
      {
        id: 'e-5-2',
        module_id: 'mod-5',
        title: 'Acordul de Responsabilitate',
        description:
          'Ce rezultat aștepți, până când. Ce autoritate de decizie are persoana. Cum și când raportează. Semnezi fizic cu omul respectiv — ambele părți. Semnătura contează psihologic.',
        order_index: 2,
      },
      {
        id: 'e-5-3',
        module_id: 'mod-5',
        title: 'Zona Greșelii Admise',
        description:
          'Ce greșeli sunt acceptabile (din care omul învață). Ce greșeli sunt linii roșii (care necesită intervenția ta imediată). Scris și comunicat explicit, nu asumat.',
        order_index: 3,
      },
      {
        id: 'e-5-4',
        module_id: 'mod-5',
        title: 'Planul de Retragere pe 30 de Zile',
        description:
          'Săpt. 1: monitorizezi zilnic, dai feedback imediat. Săpt. 2: feedback doar la cerere sau la raportul săptămânal. Săpt. 3: te uiți doar la rapoarte, nu intervii. Săpt. 4: invizibil — omul conduce zona complet singur.',
        order_index: 4,
      },
      {
        id: 'e-5-5',
        module_id: 'mod-5',
        title: 'Analiza Primei Greșeli',
        description:
          'Când apare prima greșeală (și va apărea) — nu îl cerți pe om. Întrebi: ce lipsea în proces? ce lipsea în training? ce nu era clar? Repari sistemul, nu omul.',
        order_index: 5,
      },
    ],
  },
  {
    id: 'mod-6',
    title: 'Recepția Finală',
    subtitle: 'Management & Scalare',
    description:
      'La recepție treci prin fiecare cameră, verifici că totul funcționează și semnezi. De aici începe scalarea reală.',
    order_index: 6,
    etapa: 'Etapa 6',
    saptamana: 'Săptămâna 8',
    unlockDate: '2026-07-06',
    deliverable:
      'Dosarul Complet "Arhitectura Afacerii Mele" — toate livrabilele etapelor 0–6 compilate.',
    lessons: [
      {
        id: 'l-6-1',
        module_id: 'mod-6',
        title: 'Nivelul de management',
        description:
          'Când îl introduci și cum recunoști momentul. Diferența dintre manager de oameni și manager de sistem.',
        video_url: '',
        pdf_url: '',
        duration_min: 13,
        order_index: 1,
        is_published: false,
      },
      {
        id: 'l-6-2',
        module_id: 'mod-6',
        title: 'Owner de sistem',
        description:
          'Ce faci tu de luni încolo. Maxim 5 zone de responsabilitate. Tot restul nu mai e treaba ta.',
        video_url: '',
        pdf_url: '',
        duration_min: 12,
        order_index: 2,
        is_published: false,
      },
      {
        id: 'l-6-3',
        module_id: 'mod-6',
        title: 'Optimizarea continuă',
        description:
          'Revizuirea trimestrială a proceselor. Fără dată fixă în calendar — nu se întâmplă niciodată.',
        video_url: '',
        pdf_url: '',
        duration_min: 10,
        order_index: 3,
        is_published: false,
      },
      {
        id: 'l-6-4',
        module_id: 'mod-6',
        title: 'Măsurarea corectă a succesului',
        description:
          'Testul de absență de 2 săptămâni. Ce decizii s-au luat fără tine, ce a mers, ce a crăpat. Dacă crapă ceva — știi exact ce mai trebuie construit.',
        video_url: '',
        pdf_url: '',
        duration_min: 14,
        order_index: 4,
        is_published: false,
      },
    ],
    exercises: [
      {
        id: 'e-6-1',
        module_id: 'mod-6',
        title: 'Fișa Noului Tău Rol',
        description:
          'Ce faci TU de luni încolo — maxim 5 zone de responsabilitate: strategie, oameni cheie, decizii mari, parteneriate, viziune. Orice activitate care nu se încadrează în cele 5 zone — o delegi sau o tai.',
        order_index: 1,
      },
      {
        id: 'e-6-2',
        module_id: 'mod-6',
        title: 'Calendarul Săptămânii Tale de Proprietar',
        description:
          'Cum arată o săptămână normală a ta de acum încolo. Câte ore pe strategie, câte pe oameni cheie, câte pe învățare, câte pentru tine. Calendarul devine standardul — nu ce vrei să faci, ce FACI efectiv.',
        order_index: 2,
      },
      {
        id: 'e-6-3',
        module_id: 'mod-6',
        title: 'Calendarul Trimestrial de Revizuire',
        description:
          'Date fixe în calendar pentru revizuirea proceselor și indicatorilor. Cine convoacă, cum se colectează feedback-ul echipei, cine decide modificările. Sistemele se învechesc — revizuirea trimestrială le menține vii.',
        order_index: 3,
      },
      {
        id: 'e-6-4',
        module_id: 'mod-6',
        title: 'Planificarea Vacanței-Test',
        description:
          'Planifici o absență de 1–2 săptămâni în următoarele 60 de zile. Nu opțional — este testul final al sistemului. La întoarcere: ce decizii s-au luat fără tine, ce a mers, ce a crăpat.',
        order_index: 4,
      },
    ],
  },
];

export const MOCK_WHITELIST_ENTRIES: WhitelistEntry[] = [
  { email: 'babaradumi@gmail.com', tariff: 'arhitect' },
  { email: 'victor@arhitecturaafacerii.ro', tariff: 'arhitect' },
];

// Keep for backwards compatibility
export const MOCK_WHITELIST: string[] = MOCK_WHITELIST_ENTRIES.map(e => e.email);

export const MOCK_ADMIN: User = {
  id: 'admin-1',
  email: 'babaradumi@gmail.com',
  full_name: 'Admin',
  role: 'admin',
  tariff: 'arhitect',
  created_at: new Date().toISOString(),
};
