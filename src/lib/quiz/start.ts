// Diagnosticul cursului START.
//
// Audiență complet diferită de Business: oameni care nu au încă o afacere funcțională.
// Întrebările nu măsoară maturitatea unei firme, ci trei lucruri: în care dintre cele
// 3 segmente din metodologie se încadrează omul, cât de departe e de o validare reală,
// și dacă e de fapt eligibil pentru START sau ar trebui să meargă direct în BUSINESS.
//
// Câteva întrebări au răspuns liber intenționat. Ele nu se scorează — sunt materialul
// cu care mentorul intră în primul apel fără să mai sape prin platformă.
import type { QuizDefinition, QuizQuestion } from './types';
import { generateStartProfile } from '../startQuizProfile';

const START_QUESTIONS: QuizQuestion[] = [
  // ── Bloc 1 · Unde ești acum ────────────────────────────────────────────────
  {
    id: 's1', block: 'Unde ești acum', blockNum: 1,
    question: 'Care descrie cel mai bine situația ta în momentul ăsta?',
    type: 'radio',
    options: [
      'Am o idee, dar n-am executat încă nimic concret',
      'Am un skill sau o meserie și lucrez pe cont propriu cu clienți',
      'Construiesc un produs digital — aplicație, platformă, tool',
      'Am pornit ceva înainte, n-a mers, vreau s-o iau corect de la capăt',
      'Am deja o afacere cu venituri recurente și clienți stabili',
    ],
  },
  {
    id: 's2', block: 'Unde ești acum', blockNum: 1,
    question: 'Ai încasat vreodată bani din ideea asta?',
    type: 'radio',
    options: [
      'Nu, niciodată',
      'Am primit interes și laude, dar nicio plată',
      'Am făcut 1–3 vânzări',
      'Vând constant, am clienți care revin',
    ],
  },
  {
    id: 's3', block: 'Unde ești acum', blockNum: 1,
    question: 'De cât timp te gândești sau lucrezi la ideea asta?',
    type: 'radio',
    options: ['Sub 3 luni', '3–12 luni', '1–3 ani', 'Peste 3 ani'],
  },
  {
    id: 's4', block: 'Unde ești acum', blockNum: 1,
    question: 'Din ce trăiești acum?',
    type: 'select',
    options: ['Sunt angajat', 'Freelancing / proiecte', 'Sunt student', 'Am firma mea', 'Nu am venit stabil acum'],
    allowOther: true,
  },

  // ── Bloc 2 · Ideea și piața ────────────────────────────────────────────────
  {
    id: 's5', block: 'Ideea și piața', blockNum: 2,
    question: 'Descrie în două-trei propoziții ce vrei să construiești.',
    type: 'text',
  },
  {
    id: 's6', block: 'Ideea și piața', blockNum: 2,
    question: 'Cu câți oameni din publicul tău țintă ai vorbit efectiv despre problema pe care o rezolvi?',
    type: 'radio',
    options: [
      'Cu niciunul',
      'Cu 1–3, mai mult prieteni și cunoscuți',
      'Cu 4–9 persoane din afara cercului meu',
      'Cu 10 sau mai mulți',
    ],
  },
  {
    id: 's7', block: 'Ideea și piața', blockNum: 2,
    question: 'Ce dovezi ai, până acum, că piața asta există?',
    type: 'multi', maxSelect: 5, minSelect: 1,
    options: [
      'Există concurenți activi care vând deja',
      'Am găsit grupuri online unde oamenii discută problema',
      'Am citit recenzii negative la soluțiile existente',
      'Cineva mi-a spus direct că ar plăti',
      'Nu am încă nicio dovadă — merg pe intuiție',
    ],
  },
  {
    id: 's8', block: 'Ideea și piața', blockNum: 2,
    question: 'Cui i-ai vinde, cel mai concret cu putință?',
    type: 'radio',
    options: [
      'Oricui are nevoie de asta',
      'Unui grup larg, dar știu aproximativ cine',
      'Unui segment îngust, pe care îl pot descrie exact',
    ],
  },

  // ── Bloc 3 · Ce te-a oprit ─────────────────────────────────────────────────
  {
    id: 's9', block: 'Ce te-a oprit', blockNum: 3,
    question: 'Care e frica ta principală în legătură cu pornirea?',
    type: 'radio',
    options: [
      'Să pornesc greșit și să pierd tot ce investesc — timp, bani, energie',
      'Că fără mine nu există venituri, oricât aș construi',
      'Că cineva îmi ia ideea înainte s-o lansez',
      'Că nu sunt suficient de bun ca să concurez cu cei mari',
      'Că o să muncesc mult și n-o să iasă nimic, ca data trecută',
    ],
  },
  {
    id: 's10', block: 'Ce te-a oprit', blockNum: 3,
    question: 'Ce te-a ținut pe loc până acum?',
    type: 'multi', maxSelect: 3, minSelect: 1,
    options: [
      'Nu știu de unde să încep — ce fac primul, ce fac al doilea',
      'Nu am bani de investit',
      'Nu am timp — jobul îmi ia tot',
      'Simt că mai am de învățat înainte să încep',
      'Mi-e frică de eșec',
      'Am încercat și n-a mers, nu știu ce am greșit',
    ],
  },
  {
    id: 's11', block: 'Ce te-a oprit', blockNum: 3,
    question: 'Dacă ai mai pornit ceva care nu a mers, ce crezi acum că s-a întâmplat? (dacă nu e cazul, scrie „nu e cazul")',
    type: 'text',
  },

  // ── Bloc 4 · Cum lucrezi ───────────────────────────────────────────────────
  {
    id: 's12', block: 'Cum lucrezi', blockNum: 4,
    question: 'Ai scris vreodată, pe hârtie sau digital, cum funcționează ce faci — pas cu pas?',
    type: 'radio',
    options: [
      'Nu, totul e în capul meu',
      'Am niște notițe răzlețe',
      'Am scris unul-două procese',
      'Da, am procesele documentate',
    ],
  },
  {
    id: 's13', block: 'Cum lucrezi', blockNum: 4,
    question: 'Cum folosești AI-ul acum în munca ta?',
    type: 'radio',
    options: [
      'Deloc',
      'Ocazional, când îmi amintesc',
      'Zilnic, pentru task-uri simple',
      'Am procese construite în jurul lui',
    ],
  },
  {
    id: 's14', block: 'Cum lucrezi', blockNum: 4,
    question: 'Câte ore pe săptămână poți aloca real acestui program? Fii sincer — programul cere execuție, nu doar vizionare.',
    type: 'slider', min: 2, max: 25,
    labels: { 2: '2 ore — foarte puțin', 25: '25 ore — e prioritatea mea' },
  },

  // ── Bloc 5 · Ce vrei din program ───────────────────────────────────────────
  {
    id: 's15', block: 'Ce vrei din program', blockNum: 5,
    question: 'Ce vrei să ai în mână la finalul celor 12 săptămâni?',
    type: 'multi', maxSelect: 2, minSelect: 1,
    options: [
      'Primele vânzări reale, nu promisiuni',
      'Claritate despre ce construiesc de fapt',
      'Un sistem documentat, nu haos în cap',
      'Să știu sigur dacă ideea mea merită sau nu',
      'Un plan de marketing pe care să-l pot executa singur',
      'Structura financiară pusă la punct',
    ],
  },
  {
    id: 's16', block: 'Ce vrei din program', blockNum: 5,
    question: 'La finalul Modulului 2 afli, din conversații cu oameni reali, că ideea ta nu are piață. Ce faci?',
    type: 'radio',
    options: [
      'Schimb ideea — informația asta mă scutește de luni pierdute',
      'Mai insist puțin, poate n-am vorbit cu oamenii potriviți',
      'Nu știu, m-ar da peste cap',
      'Nu cred că se poate întâmpla asta',
    ],
  },
  {
    id: 's17', block: 'Ce vrei din program', blockNum: 5,
    question: 'Cât de urgent e pentru tine să pornești?',
    type: 'slider', min: 1, max: 10,
    labels: { 1: 'Explorez, nu mă grăbesc', 10: 'Dacă nu pornesc în 90 de zile, renunț la idee' },
  },
];

export const START_QUIZ: QuizDefinition = {
  courseId: 'start',
  introTitle: 'De unde pornești',
  introSubtitle:
    'Șaptesprezece întrebări despre unde te afli acum. Nu există răspunsuri greșite — există doar răspunsuri sincere, care fac programul să lucreze pentru tine.',
  questions: START_QUESTIONS,
  summaryFields: [
    { label: 'Situația ta', questionId: 's1' },
    { label: 'Ai încasat', questionId: 's2' },
    { label: 'Conversații purtate', questionId: 's6' },
    { label: 'Frica principală', questionId: 's9' },
    { label: 'Ce te-a oprit', questionId: 's10' },
    { label: 'Ce vrei la final', questionId: 's15' },
    { label: 'Urgență', questionId: 's17' },
  ],
  generateProfile: generateStartProfile,
};
