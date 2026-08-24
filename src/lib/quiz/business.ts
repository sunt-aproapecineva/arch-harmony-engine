// Diagnosticul cursului Business — 15 întrebări despre o afacere care deja există.
// Extras din pages/OnboardingQuiz.tsx la trecerea platformei pe mai multe cursuri.
import type { QuizDefinition, QuizQuestion } from './types';
import { generateProfile } from '../quizProfile';

const BUSINESS_QUESTIONS: QuizQuestion[] = [
  {
    id: 'q1', block: 'Contextul Afacerii', blockNum: 1,
    question: 'În ce domeniu activezi?',
    type: 'select',
    options: ['Retail / Comerț', 'HoReCa', 'Producție', 'Servicii B2B', 'Servicii B2C', 'E-commerce', 'Construcții / Imobiliare', 'Sănătate / Frumusețe', 'Educație', 'Altul'],
    allowOther: true,
  },
  {
    id: 'q2', block: 'Contextul Afacerii', blockNum: 1,
    question: 'De câți ani conduci această afacere?',
    type: 'radio',
    options: ['Sub 1 an', '1–3 ani', '3–7 ani', 'Peste 7 ani'],
  },
  {
    id: 'q3', block: 'Contextul Afacerii', blockNum: 1,
    question: 'Afacerea ta are asociați sau parteneri?',
    type: 'radio',
    options: ['Nu, conduc singur', 'Da, cu partener egal (50/50)', 'Da, cu parteneri, dar eu conduc', 'Da, am investitor pasiv'],
  },
  {
    id: 'q4', block: 'Scala Financiară', blockNum: 2,
    question: 'Care este cifra de afaceri lunară aproximativă a firmei tale?',
    type: 'radio',
    options: ['Sub 20.000 lei', '20.000–50.000 lei', '50.000–150.000 lei', '150.000–500.000 lei', 'Peste 500.000 lei'],
  },
  {
    id: 'q5', block: 'Scala Financiară', blockNum: 2,
    question: 'Cheltuielile lunare totale ale firmei sunt aproximativ:',
    type: 'radio',
    options: ['Sub 15.000 lei', '15.000–40.000 lei', '40.000–120.000 lei', '120.000–400.000 lei', 'Peste 400.000 lei'],
  },
  {
    id: 'q6', block: 'Scala Financiară', blockNum: 2,
    question: 'Estimezi că știi câți bani rămân net în firmă în fiecare lună?',
    type: 'radio',
    options: ['Da, știu exact', 'Aproximativ, ±20%', 'Nu prea știu', 'Nu știu deloc'],
  },
  {
    id: 'q7', block: 'Structura și Oamenii', blockNum: 3,
    question: 'Câți angajați sau colaboratori activi are firma ta?',
    type: 'radio',
    options: ['Lucrez singur', '1–3', '4–10', '11–30', 'Peste 30'],
  },
  {
    id: 'q8', block: 'Structura și Oamenii', blockNum: 3,
    question: 'Câți dintre angajații tăi vin la tine zilnic cu întrebări sau probleme de rezolvat?',
    type: 'radio',
    options: ['Nimeni', '1–2', '3–5', 'Aproape toți'],
  },
  {
    id: 'q9', block: 'Structura și Oamenii', blockNum: 3,
    question: 'Ai o organigramă clară, cu roluri și responsabilități scrise?',
    type: 'radio',
    options: ['Da, funcțională și actualizată', 'Da, există dar e depășită', 'Parțial, câteva roluri sunt clare', 'Nu există'],
  },
  {
    id: 'q10', block: 'Timp și Operațional', blockNum: 4,
    question: 'Câte ore pe zi lucrezi efectiv ÎN afacere (execuți, rezolvi, ești prezent operațional)?',
    type: 'radio',
    options: ['Sub 4 ore', '4–6 ore', '6–10 ore', 'Peste 10 ore'],
  },
  {
    id: 'q11', block: 'Timp și Operațional', blockNum: 4,
    question: 'Ai reușit să pleci în vacanță (minimum 5 zile fără telefon de business) în ultimele 12 luni?',
    type: 'radio',
    options: ['Da, fără probleme', 'Da, dar am răspuns la telefon zilnic', 'Nu am plecat deloc', 'Nu mi-am permis din cauza businessului'],
  },
  {
    id: 'q12', block: 'Timp și Operațional', blockNum: 4,
    question: 'Există procese scrise pe care angajații le urmează fără să te întrebe pe tine?',
    type: 'radio',
    options: ['Da, pentru majoritatea activităților', 'Da, pentru câteva zone', 'Câteva notițe informale', 'Nu există nimic scris'],
  },
  {
    id: 'q13', block: 'Blocajul și Obiectivul', blockNum: 5,
    question: 'Care este cel mai mare blocaj al afacerii tale în acest moment? (max. 5 opțiuni)',
    type: 'multi', maxSelect: 5,
    options: [
      'Nu am timp pentru strategie, stau în operațional',
      'Echipa nu răspunde de rezultate',
      'Nu știu exact cum stă firma financiar',
      'Nu am procese clare, totul depinde de mine',
      'Nu am structură organizațională clară',
      'Nu știu cui și cum să deleg',
      'Conflicte sau lipsă de claritate cu asociatul/partenerii',
    ],
    allowOther: true,
  },
  {
    id: 'q14', block: 'Blocajul și Obiectivul', blockNum: 5,
    question: 'Ce vrei să obții concret în urma acestui practicum?',
    type: 'multi', minSelect: 2, maxSelect: 5,
    options: [
      'Să ies din operațional și să am timp liber real',
      'Să am o echipă care funcționează fără mine zilnic',
      'Să construiesc procese clare și să pot scala',
      'Să am control real pe cifre și performanță',
      'Să pot delega o zonă întreagă fără să mai intervin',
      'Să construiesc fundația corectă pentru o creștere sustenabilă',
    ],
  },
  {
    id: 'q15', block: 'Blocajul și Obiectivul', blockNum: 5,
    question: 'Pe o scală de la 1 la 10, cât de urgent este pentru tine să rezolvi această problemă?',
    type: 'slider', min: 1, max: 10,
    labels: { 1: 'Pot amâna, nu arde', 10: 'Dacă nu rezolv în 90 de zile, businessul meu suferă' },
  },
];

export const BUSINESS_QUIZ: QuizDefinition = {
  courseId: 'business',
  introTitle: 'Diagnosticul afacerii tale',
  introSubtitle: 'Cincisprezece întrebări despre unde se află firma ta acum. Practicumul se calibrează pe răspunsurile tale.',
  questions: BUSINESS_QUESTIONS,
  summaryFields: [
    { label: 'Domeniu', questionId: 'q1' },
    { label: 'Experiență', questionId: 'q2' },
    { label: 'Echipă', questionId: 'q7' },
    { label: 'Principal blocaj', questionId: 'q13' },
    { label: 'Obiectiv', questionId: 'q14' },
    { label: 'Urgență', questionId: 'q15' },
  ],
  // Semnătura veche primea doar string | string[]; slider-ele ajung ca number,
  // exact ca înainte de extragere (quizProfile parsează cu parseInt).
  generateProfile: (answers) => generateProfile(answers as Record<string, string | string[]>),
};
