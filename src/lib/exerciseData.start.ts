// Livrabilele cursului START — câte unul per modul.
//
// Metodologia cere ca fiecare modul să producă un rezultat concret, nu cunoștințe
// (Principiul 2: „dovada vine dinăuntrul programului"). De aceea fiecare exercițiu de
// aici e livrabilul modulului, nu o temă de reflecție.
//
// Refolosim exclusiv tipuri existente din ExerciseBlock — niciun tipar nou de design.
import type { ExerciseTemplate } from './exerciseData';

export const START_EXERCISE_TEMPLATES: ExerciseTemplate[] = [
  // ── Etapa 0 ────────────────────────────────────────────────────────────────
  {
    exerciseId: 'st-e-0-1',
    type: 'form-fields',
    title: 'Ce construiesc de fapt',
    instructions:
      'Trei răspunsuri scurte. Dacă nu poți scrie primul, încă nu știi ce construiești — și e în regulă, exact de asta ești aici.',
    fields: [
      { id: 'info', type: 'info', text: 'Un freelancer vinde timp. Un antreprenor construiește un sistem. Un om cu firmă proprie poate fi, de fapt, tot angajat — al lui însuși.' },
      { id: 'descriere', type: 'textarea', label: 'Descrierea afacerii mele în 3 propoziții', placeholder: 'Ce livrez, cui, și de ce ar plăti pentru asta.' },
      { id: 'unde_sunt', type: 'checkboxes', label: 'Unde mă aflu acum, sincer', options: ['Freelancer — câștig doar când lucrez', 'Job cu firmă proprie — sunt angajatul meu', 'Am o idee, nu am executat nimic', 'Am construit ceva, nu am vândut încă'] },
      { id: 'unde_vreau', type: 'textarea', label: 'În care categorie vreau să fiu la finalul programului și de ce', placeholder: 'Scrie ce se schimbă concret, nu cum te simți.' },
      { id: 'factor_risc', type: 'checkboxes', label: 'În care din cei 3 factori de eșec mă aflu acum', options: ['Pornesc fără validare', 'Construiesc fără sistem', 'Vând fără strategie'] },
      { id: 'factor_de_ce', type: 'textarea', label: 'De ce am bifat asta', placeholder: 'Un exemplu concret din ce ai făcut în ultimele 3 luni.' },
      { id: 'convingeri', type: 'dynamic-table', label: '3 convingeri despre business pe care le am acum și pe care programul s-ar putea să le schimbe', columns: ['Convingerea mea', 'De unde o am'], addLabel: 'Adaugă o convingere' },
    ],
  },

  // ── Modulul 1 · Nișa ───────────────────────────────────────────────────────
  {
    exerciseId: 'st-e-1-1',
    type: 'form-fields',
    title: 'Nișa aleasă cu metodă',
    instructions:
      'Nu completa din cap. Fiecare rând trebuie să aibă în spate ceva ce ai văzut: o postare, un comentariu, o recenzie, o conversație.',
    fields: [
      { id: 'probleme', type: 'dynamic-table', label: '5 probleme reale pe care le-ai observat și pentru care oamenii au cheltuit bani', columns: ['Problema', 'Unde am văzut-o', 'Cine plătește deja pentru o soluție'], addLabel: 'Adaugă o problemă' },
      { id: 'info_matrice', type: 'info', text: 'Matricea nișei are 3 axe. Cerere: există piață sau trebuie s-o creezi? Competiție: absența ei nu e un semn bun, e îngrijorător. Capacitate: nu e despre ce știi, e despre cu ce poți fi credibil.' },
      { id: 'matrice', type: 'dynamic-table', label: 'Matricea aplicată pe top 3 idei', columns: ['Ideea', 'Cerere (1–5)', 'Competiție (1–5)', 'Capacitatea mea (1–5)', 'Concluzia'], addLabel: 'Adaugă o idee' },
      { id: 'dovezi', type: 'checkboxes', label: 'Testul de 72 de ore — ce am verificat efectiv', options: ['Am găsit concurenți activi', 'Am găsit grupuri online unde publicul discută problema', 'Am citit recenzii negative la concurenți', 'Am găsit anunțuri de angajare în industrie', 'Am vorbit informal cu 3 persoane din publicul țintă'] },
      { id: 'raport', type: 'textarea', label: 'Raportul de 1 pagină despre nișa selectată', placeholder: 'Ce nișă am ales, ce dovezi am că piața există, ce m-a surprins.' },
      { id: 'pozitionare', type: 'input', label: 'Poziționarea mea într-o singură propoziție', placeholder: 'Pentru [cine], rezolv [ce problemă], prin [ce anume te face credibil].' },
      { id: 'reactii', type: 'dynamic-table', label: 'Poziționarea testată pe 3 persoane din publicul țintă', columns: ['Cine', 'Reacția exactă (cuvintele lui)', 'Ce am schimbat după'], addLabel: 'Adaugă o reacție' },
    ],
  },

  // ── Modulul 2 · Validarea ★ ────────────────────────────────────────────────
  {
    exerciseId: 'st-e-2-1',
    type: 'form-fields',
    title: 'Jurnalul de validare',
    instructions:
      'Livrabilul cel mai important din tot programul. Minimum 10 conversații, documentate în cuvintele lor, nu în interpretarea ta. Nu ai voie să treci la Modulul 3 până nu completezi raportul de la final.',
    fields: [
      { id: 'info_ierarhie', type: 'info', text: 'Ierarhia dovezilor: complimentul nu valorează nimic · interesul valorează puțin · pre-comanda valorează mult · plata e singura validare reală. Prietenii te mint involuntar — nu vor să te descurajeze, dar asta te costă luni.' },
      { id: 'mvp', type: 'textarea', label: 'MVP-ul meu în 3 propoziții', placeholder: 'Minimul necesar ca să obții o dovadă de plată. Dacă durează mai mult de 2 săptămâni, e prea complex.' },
      { id: 'metoda', type: 'checkboxes', label: 'Metoda de validare pe care o execut săptămâna asta', options: ['Conversații directe (10 oameni)', 'Pre-vânzarea cu prețul real', 'Post de testare pe social media', 'Landing page + 20–50€ trafic', 'Propunere directă la 5 companii'] },
      { id: 'info_jurnal', type: 'info', text: 'Regula conversației: explorezi problema LOR fără să menționezi soluția TA. Întrebările care aduc adevărul — „Povestește-mi cum gestionezi acum asta." „Cât te costă lunar, în timp sau bani?" „Ai mai căutat soluții? De ce nu ai cumpărat?"' },
      { id: 'jurnal', type: 'dynamic-table', label: 'Jurnalul conversațiilor', columns: ['Nume / cum l-am găsit', 'Problema în cuvintele lui', 'Cheltuiește deja pe o soluție? Cât?', 'A spus că ar plăti?', 'A plătit sau s-a angajat ferm?'], addLabel: 'Adaugă o conversație' },
      { id: 'semnale_da', type: 'checkboxes', label: 'Semnale că ideea are piață', options: ['Oamenii au descris problema fără să o menționez eu', 'Cineva a plătit sau a promis ferm că plătește', 'Oamenii cheltuiesc deja bani pe soluții alternative'] },
      { id: 'semnale_nu', type: 'checkboxes', label: 'Semnale că ideea nu are piață', options: ['Toți zic că ar cumpăra, nimeni nu plătește', 'Problema nu e urgentă pentru ei', 'Nu am găsit 10 persoane care au problema'] },
      { id: 'raport', type: 'textarea', label: 'Raportul de validare — ce am testat, cu cine, ce am aflat', placeholder: 'Fii brutal de sincer. Un rezultat negativ aflat acum te costă o săptămână. Aflat peste 8 luni te costă firma.' },
      { id: 'decizie', type: 'checkboxes', label: 'Decizia mea', options: ['Merg mai departe — am dovezi de plată', 'Pivotez nișa', 'Pivotez problema', 'Pivotez formatul soluției'] },
    ],
  },

  // ── Modulul 3 · Sistematizare ──────────────────────────────────────────────
  {
    exerciseId: 'st-e-3-1',
    type: 'form-fields',
    title: 'Cele 3 documente și arhitectura afacerii',
    instructions:
      'Nu trebuie să fie perfecte. Trebuie să existe. Un document scris prost e infinit mai util decât unul perfect care e încă în capul tău.',
    fields: [
      { id: 'flux', type: 'dynamic-table', label: 'Fluxul complet al unui client — de la prima interacțiune la feedback', columns: ['Pasul', 'Cine face', 'Ce iese din pas', 'Se blochează în mine?'], addLabel: 'Adaugă un pas' },
      { id: 'doc1', type: 'textarea', label: 'Document 1 · Fișa produsului sau serviciului', placeholder: 'Ce livrez exact, în ce format, în cât timp, la ce standard, cu ce garanții.' },
      { id: 'doc2', type: 'textarea', label: 'Document 2 · Procesul de vânzare', placeholder: 'Pașii de la primul contact până la plată. Cine face ce. Ce se spune la fiecare etapă.' },
      { id: 'doc3', type: 'textarea', label: 'Document 3 · Onboardingul clientului', placeholder: 'Ce se întâmplă după plată. Ce primește, când, cine îi răspunde.' },
      { id: 'info_functii', type: 'info', text: 'Cele 4 funcții obligatorii ale oricărei afaceri: producție/livrare · vânzare și marketing · operațional și administrativ · finanțe. Acum ești tu în toate patru.' },
      { id: 'organigrama', type: 'dynamic-table', label: 'Organigrama mea de azi și planul de ieșire', columns: ['Funcția', 'Cine o face acum', 'Din care vreau să ies primul (1–4)'], addLabel: 'Adaugă o funcție' },
      { id: 'automatizare', type: 'textarea', label: '1 proces pe care l-aș automatiza — scris mai întâi complet manual', placeholder: 'Dacă nu poți explica procesul unui angajat, nu îl poți explica nici unui AI.' },
      { id: 'gata', type: 'checkboxes', label: 'Checklist „gata de prima vânzare"', options: ['Cele 3 documente sunt scrise', 'Modalitatea de plată funcționează', 'Canalul de comunicare cu clienții e definit', 'Răspunsul la cele mai frecvente 5 întrebări e scris', 'Procesul de livrare a fost testat o dată, cap-coadă'] },
    ],
  },

  // ── Modulul 4 · Primele vânzări ────────────────────────────────────────────
  {
    exerciseId: 'st-e-4-1',
    type: 'form-fields',
    title: 'Tracker-ul primelor vânzări',
    instructions:
      'Modulul cel mai practic. Lista de 20, segmentată, contactată. Completează tabelul pe măsură ce vorbești cu oamenii — nu la final, din memorie.',
    fields: [
      { id: 'pret_metode', type: 'dynamic-table', label: 'Prețul calculat pe cele 3 metode', columns: ['Metoda', 'Rezultatul', 'Ce presupune'], addLabel: 'Adaugă o metodă' },
      { id: 'pret_final', type: 'input', label: 'Prețul meu de lansare', placeholder: 'Cifra + moneda' },
      { id: 'pret_argument', type: 'textarea', label: 'De ce acest preț — argumentele scrise', placeholder: 'Sub ce prag lucrez în pierdere. De ce nu merg mai jos.' },
      { id: 'info_lista', type: 'info', text: 'Primul client ideal nu e cel mai profitabil — e cel mai ușor de convertit și cel mai probabil să dea testimonial și referrals.' },
      { id: 'lista', type: 'dynamic-table', label: 'Lista de contactat', columns: ['Nume', 'De unde îl știu', 'Probabilitate (ridicată / medie / scăzută)', 'Contactat la', 'Rezultat'], addLabel: 'Adaugă o persoană' },
      { id: 'obiectii', type: 'dynamic-table', label: 'Obiecțiile pe care le-am auzit efectiv', columns: ['Obiecția, în cuvintele lui', 'Ce am răspuns', 'A funcționat?'], addLabel: 'Adaugă o obiecție' },
      { id: 'vanzari', type: 'input', label: 'Câte vânzări reale am făcut în program', placeholder: 'Un număr. Zero e un răspuns valid — arată unde trebuie lucrat.' },
      { id: 'after_sale', type: 'textarea', label: 'Procesul meu de after-sale', placeholder: 'Ce se întâmplă în primele 24 de ore după plată. Când cer feedback. Când cer testimonial.' },
      { id: 'ce_a_mers', type: 'textarea', label: 'Ce a funcționat și ce nu în conversațiile de vânzare', placeholder: 'Documentează acum, ca următoarea conversație să fie mai bună.' },
    ],
  },

  // ── Modulul 5 · Marketing ──────────────────────────────────────────────────
  {
    exerciseId: 'st-e-5-1',
    type: 'form-fields',
    title: 'Planul de marketing pe 60 de zile',
    instructions:
      'Semnalul că ești gata de marketing: ai 2–3 clienți plătitori și știi ce spui care convinge. Dacă nu ai, întoarce-te la Modulul 4.',
    fields: [
      { id: 'audit', type: 'dynamic-table', label: 'Auditul prezenței mele online', columns: ['Canal', 'Există?', 'Ce lipsește / ce e greșit', 'Prioritate (1–3)'], addLabel: 'Adaugă un canal' },
      { id: 'bio', type: 'textarea', label: 'Bio-ul rescris', placeholder: 'Cine ești · pentru cine lucrezi · ce faci · cum te contactează.' },
      { id: 'piloni', type: 'dynamic-table', label: 'Pilonii de conținut și primele 3 postări', columns: ['Pilonul', 'Ideea postării', 'Publicată la'], addLabel: 'Adaugă o postare' },
      { id: 'info_ads', type: 'info', text: 'Nu faci ads dacă postarea organică n-a funcționat deja. Ads amplifică ce există, nu repară ce nu merge. Buget de test: 20–50€.' },
      { id: 'boost', type: 'textarea', label: 'Setul de boost pregătit', placeholder: 'Care postare, ce audiență, ce buget, câte zile. Ce măsor.' },
      { id: 'greseli', type: 'checkboxes', label: 'Greșeli de marketing pe care le-am comis deja', options: ['Am făcut ads înainte să știu ce mesaj convertește', 'Am promovat produsul înainte de problemă', 'Am targetat prea larg', 'Nu am urmărit cifrele', 'Am schimbat strategia prea repede', 'Am așteptat rezultate mari din buget mic'] },
      { id: 'plan60', type: 'textarea', label: 'Planul meu pe 60 de zile', placeholder: 'Ce fac săptămânal, concret, singur, cu bugetul pe care îl am.' },
    ],
  },

  // ── Modulul 6 · AI ─────────────────────────────────────────────────────────
  {
    exerciseId: 'st-e-6-1',
    type: 'form-fields',
    title: 'Cele 3 procese asistate de AI',
    instructions:
      'Regula de aur: dacă nu poți explica procesul unui angajat, nu îl poți explica nici AI-ului. Pornește de la procesele scrise în Modulul 3.',
    fields: [
      { id: 'taskuri', type: 'dynamic-table', label: '5 task-uri din săptămâna mea pe care le-aș putea delega parțial AI-ului', columns: ['Task-ul', 'Cât timp îmi ia acum', 'Ce anume ar prelua AI-ul'], addLabel: 'Adaugă un task' },
      { id: 'procese', type: 'dynamic-table', label: 'Cele 3 procese pe care le-am asistat efectiv', columns: ['Procesul', 'Tool-ul folosit', 'Timp înainte', 'Timp după', 'Ce verific eu manual'], addLabel: 'Adaugă un proces' },
      { id: 'prompturi', type: 'dynamic-table', label: 'Prompturi testate — versiunea simplă vs. versiunea cu context', columns: ['Task-ul', 'Prompt simplu — rezultat', 'Prompt cu context și rol — rezultat'], addLabel: 'Adaugă un prompt' },
      { id: 'limite', type: 'textarea', label: 'Unde AI-ul m-a dezamăgit sau a inventat date', placeholder: 'AI e un junior talentat care lucrează rapid. Tu ești senior-ul care verifică și decide.' },
    ],
  },

  // ── Modulul 7 · Primul angajat ─────────────────────────────────────────────
  {
    exerciseId: 'st-e-7-1',
    type: 'form-fields',
    title: 'Ești gata să angajezi?',
    instructions:
      'Oboseala nu e semnalul de angajare — e semnalul de reorganizare a priorităților. Verifică cele 3 criterii onest.',
    fields: [
      { id: 'criterii', type: 'checkboxes', label: 'Cele 3 semnale concrete', options: ['Am refuzat sau am pierdut clienți din lipsă de capacitate', 'Am un task repetitiv de minimum 10 ore/săptămână pe care îl pot documenta complet', 'Venitul actual acoperă costul unui angajat plus 20% marjă'] },
      { id: 'concluzie', type: 'textarea', label: 'Concluzia mea și data estimată dacă nu sunt încă acolo', placeholder: 'Dacă nu bifezi toate trei, scrie ce trebuie să se schimbe și până când.' },
      { id: 'rol', type: 'textarea', label: 'Descrierea rolului primului angajat', placeholder: 'Responsabilități · output așteptat · competențe necesare. Nu „un om de toate".' },
      { id: 'anunt', type: 'textarea', label: 'Anunțul de angajare', placeholder: 'Ce face concret · ce am nevoie de la el · ce ofer · cum aplică. Include un task mic de testare.' },
      { id: 'onboarding', type: 'dynamic-table', label: 'Planul de onboarding pe 30 de zile', columns: ['Săptămâna', 'Obiectiv', 'Cum verific că s-a atins'], addLabel: 'Adaugă o săptămână' },
    ],
  },

  // ── Modulul 8 · Finanțe ────────────────────────────────────────────────────
  {
    exerciseId: 'st-e-8-1',
    type: 'form-fields',
    title: 'Structura financiară minimă',
    instructions:
      'Afacerile profitabile mor din cash flow, nu din lipsă de clienți. Nu estima — calculează.',
    fields: [
      { id: 'separare', type: 'checkboxes', label: 'Separarea banilor', options: ['Am cont de business separat', 'Mi-am stabilit un salariu fix din firmă', 'Cheltuielile personale nu mai trec prin firmă'] },
      { id: 'salariu', type: 'input', label: 'Salariul meu lunar din firmă', placeholder: 'Cifra + moneda' },
      { id: 'cashflow', type: 'dynamic-table', label: 'Cash flow pe următoarele 4 săptămâni', columns: ['Data', 'Intrare', 'Ieșire', 'Sold'], addLabel: 'Adaugă o linie' },
      { id: 'costuri_fixe', type: 'input', label: 'Costuri fixe lunare', placeholder: 'Ce plătesc indiferent de vânzări' },
      { id: 'pret_unitar', type: 'input', label: 'Preț per unitate / client', placeholder: 'Cifra' },
      { id: 'cost_variabil', type: 'input', label: 'Cost variabil per unitate', placeholder: 'Cifra' },
      { id: 'prag', type: 'input', label: 'Pragul meu de rentabilitate', placeholder: 'costuri fixe ÷ (preț − cost variabil) = câți clienți lunar' },
      { id: 'comparatie', type: 'textarea', label: 'Cum stau față de prag acum', placeholder: 'Tot ce e sub prag e pierdere. Câți clienți îmi mai lipsesc?' },
      { id: 'politica', type: 'textarea', label: 'Politica mea de distribuție a profitului pentru primul an', placeholder: 'Regula pentru afaceri tinere: 50% rămâne în firmă, 50% e al tău. Ce faci tu și de ce.' },
    ],
  },

  // ── Modulul 9 · Investiții ─────────────────────────────────────────────────
  {
    exerciseId: 'st-e-9-1',
    type: 'form-fields',
    title: 'Executive summary și autoevaluarea de investabilitate',
    instructions:
      'Poate nu cauți investiție mâine. Dar dacă nu știi cum funcționează acum, vei lua decizii proaste când momentul vine.',
    fields: [
      { id: 'capital', type: 'checkboxes', label: 'Tipul de capital potrivit pentru stadiul meu', options: ['Credit bancar', 'Grant / program public', 'Investiție cu diluare de equity', 'Parteneriat strategic', 'Accelerator / incubator', 'Crowdfunding sau pre-vânzare', 'Familie și prieteni — cu contract'] },
      { id: 'capital_de_ce', type: 'textarea', label: 'De ce acesta și nu altul', placeholder: 'Ce dau și ce primesc. Ce mă costă pe termen lung.' },
      { id: 'evaluare', type: 'input', label: 'Evaluarea mea prin Revenue Multiple', placeholder: 'venit anual proiectat la 12 luni × multiplicator (2–4x pentru servicii)' },
      { id: 'info_criterii', type: 'info', text: 'La early stage investitorii finanțează oameni, nu produse. Dar sistemul contează: dacă afacerea funcționează doar cu tine, valoarea ei pentru orice terț e aproape zero. Exact de aceea Modulul 3 nu e teoretic.' },
      { id: 'criterii', type: 'dynamic-table', label: 'Autoevaluare pe cele 6 criterii', columns: ['Criteriul', 'Unde sunt (1–5)', 'Ce îmi lipsește concret'], addLabel: 'Adaugă un criteriu' },
      { id: 'exec_summary', type: 'textarea', label: 'Executive summary — 1 pagină', placeholder: 'Problemă · soluție · piață · model de business · tracțiune · echipă · ce ceri.' },
      { id: 'risc', type: 'textarea', label: 'Riscul principal al afacerii mele în fața unui investitor și cum îl adresez', placeholder: 'Due diligence-ul descoperă orice mizerie. Mai bine o știi tu întâi.' },
    ],
  },
];
