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

  // Cele 4 exerciții ale Săptămânii 1 (Fișa de Start) — câte unul pentru lecțiile
  // 0.0, 0.2, 0.3 și 0.4. Lecția 0.1 nu are exercițiu: testul vânzării e un
  // instrument mental, aplicat la nișă în săptămâna 2.
  {
    exerciseId: 'st-e-0-2',
    type: 'form-fields',
    title: 'Contractul cu tine însuți',
    instructions:
      'Legat de Lecția 0.0. Ai terminat prima lecție. Înainte să treci mai departe, scrie-ți contractul cu tine însuți. Nu-l face perfect — scrie-l onest, în două minute. Îl vei reciti la finalul practicumului.',
    fields: [
      { id: 'info', type: 'info', text: 'Răspunsurile sunt private. Le recitești în Săptămâna 8, la reflecția finală — de aceea contează onestitatea, nu formularea frumoasă.' },
      { id: 'data', type: 'input', label: '1. Data de azi', placeholder: 'ex: 18.09.2026' },
      { id: 'motiv', type: 'textarea', label: '2. Cel mai onest motiv pentru care încep acum, nu peste șase luni', placeholder: 'Scrie motivul real, nu cel pe care l-ai spune altcuiva.' },
      { id: 'program', type: 'dynamic-table', label: '3. Câte ore pe săptămână aloc practicumului, pe zile', columns: ['Ziua', 'Ore alocate', 'Intervalul orar'], addLabel: 'Adaugă o zi' },
      { id: 'total_ore', type: 'input', label: 'Total ore pe săptămână', placeholder: 'ex: 4' },
    ],
  },
  {
    exerciseId: 'st-e-0-3',
    type: 'form-fields',
    title: 'Lista celor 10 cheltuieli',
    instructions:
      'Legat de Lecția 0.2. Scrie 10 lucruri pe care crezi că trebuie să le faci sau să le cumperi ca să pornești (sau ca să crești, dacă ai deja ceva). Pentru fiecare, notează dacă poate aștepta până după prima vânzare, sau chiar trebuie înainte.',
    fields: [
      { id: 'info', type: 'info', text: 'Regulă din lecție: aproape tot ce ține de formă — logo, site, spațiu, stoc, branding — merge în coloana „După". Dacă ai mai mult de 3 rânduri marcate „Înainte", verifică din nou: majoritatea acestor cheltuieli pot aștepta.' },
      { id: 'cheltuieli', type: 'dynamic-table', label: 'Cele 10 cheltuieli', columns: ['Cheltuiala', 'Cost estimat', 'Înainte sau După prima vânzare', 'De ce — într-o propoziție'], addLabel: 'Adaugă o cheltuială' },
      { id: 'nr_inainte', type: 'input', label: 'Câte rânduri ai marcat „Înainte"', placeholder: 'ex: 2' },
      { id: 'suma_evitata', type: 'input', label: 'O singură cifră: câți bani ai fi cheltuit dacă n-ai fi făcut exercițiul ăsta', placeholder: 'ex: 18 000 MDL' },
      { id: 'prima_cheltuiala', type: 'textarea', label: 'Prima cheltuială pe care o faci efectiv și ce trebuie să fie adevărat ca s-o faci', placeholder: 'ex: „Plătesc materia primă doar după ce am 3 comenzi confirmate."' },
    ],
  },
  {
    exerciseId: 'st-e-0-4',
    type: 'form-fields',
    title: 'Două erori și două semnale',
    instructions:
      'Legat de Lecția 0.3. Alege exact 2 erori în care te recunoști cel mai mult. Pentru fiecare, scrie un semnal concret, verificabil — nu o intenție de tipul „voi fi mai atent", ci ceva ce poate fi doar adevărat sau fals mâine dimineață.',
    fields: [
      { id: 'erori', type: 'checkboxes', label: 'Bifează exact 2 erori în care te recunoști', options: ['Pasiunea ca singur criteriu', 'Energia ca înlocuitor pentru sistem', 'Pregătirea infinită', 'Viteza fără ordine', 'Decizia neasumată dintre supraviețuire și scalare'] },
      { id: 'info', type: 'info', text: 'Exemple de semnal bun: „Au trecut 14 zile și n-am vorbit cu niciun om nou despre ideea mea." · „Am făcut același lucru a cincea oară fără să-l scriu nicăieri." · „Sunt pe cale să plătesc ceva ce nimeni nu mi-a cerut încă." Fiecare conține o cifră sau o unitate de timp.' },
      { id: 'eroare_1', type: 'input', label: 'Eroarea 1 aleasă', placeholder: 'Scrie numele erorii bifate.' },
      { id: 'semnal_1', type: 'textarea', label: 'Semnalul meu pentru eroarea 1 — verificabil, cu cifră sau interval de timp', placeholder: 'ex: „Au trecut 10 zile și n-am trimis niciun mesaj unui client potențial."' },
      { id: 'eroare_2', type: 'input', label: 'Eroarea 2 aleasă', placeholder: 'Scrie numele celei de-a doua erori bifate.' },
      { id: 'semnal_2', type: 'textarea', label: 'Semnalul meu pentru eroarea 2 — verificabil, cu cifră sau interval de timp', placeholder: 'ex: „Am refăcut logo-ul a treia oară fără să fi vândut nimic."' },
      { id: 'actiune_7_zile', type: 'textarea', label: 'Un singur lucru concret pe care-l fac în următoarele 7 zile ca să ies din tiparul dominant', placeholder: 'O acțiune cu dată și rezultat observabil.' },
    ],
  },
  {
    exerciseId: 'st-e-0-5',
    type: 'form-fields',
    title: 'Plasarea pe hartă',
    instructions:
      'Legat de Lecția 0.4. Bifează doar criteriile adevărate azi, nu cele la care lucrezi. Bifele se citesc de sus în jos: ultimul criteriu adevărat arată stadiul real în care ești.',
    fields: [
      { id: 'criterii', type: 'checkboxes', label: 'Bifează ce e adevărat astăzi', options: ['N-am făcut încă nicio vânzare', 'Am vândut, dar sporadic, fără repetiție', 'Am vânzări repetate, de la clienți diferiți', 'Am cel puțin un om care lucrează cu mine', 'Le spun eu direct fiecăruia ce are de făcut', 'Am pe cineva care coordonează alți oameni', 'Există lucruri scrise pe care alții le urmează fără mine', 'Pot lipsi două săptămâni și lucrurile merg mai departe', 'Am mai mult de un punct de lucru sau o afacere'] },
      { id: 'info', type: 'info', text: 'Grila de citire: primele două bife → stadiul de pornire; vânzări repetate → stadiul de tracțiune; primii oameni coordonați direct → stadiul de echipă; lucruri scrise urmate fără tine → stadiul de sistem; absența ta de două săptămâni fără efect → stadiul de scalare.' },
      { id: 'stadiu', type: 'input', label: '1. Stadiul meu e…', placeholder: 'ex: tracțiune' },
      { id: 'stadiu_de_ce', type: 'textarea', label: 'Pentru că (o singură propoziție)', placeholder: 'Argumentul concret, legat de bifele de mai sus.' },
      { id: 'criteriu_trecere', type: 'textarea', label: '2. Criteriul prin care voi ști că am trecut la următorul stadiu', placeholder: 'Ceva măsurabil, nu o senzație.' },
      { id: 'de_amanat', type: 'dynamic-table', label: '3. Trei lucruri pe care am fost tentat să le fac, dar aparțin unui stadiu mai avansat — deci le amân', columns: ['Lucrul tentant', 'Cărui stadiu aparține', 'Când îl reiau'], addLabel: 'Adaugă un lucru amânat' },
    ],
  },



  // ── Modulul 1 · Nișa ───────────────────────────────────────────────────────
  // Cele 5 exerciții practice ale Săptămânii 2 (Dosarul Oportunității). Fiecare e
  // legat de o lecție și construiește materia primă pentru următorul — de aceea sunt
  // exerciții separate, nu un singur formular lung.
  {
    exerciseId: 'st-e-1-1',
    type: 'form-fields',
    title: 'Harta problemelor — ce merită explorat',
    instructions:
      'Legat de Lecția 1.1. Scrie 10 probleme observabile, formulate ca situații ale unui om sau ale unei companii — fără să numești încă produsul pe care l-ai vinde. Evită „oamenii vor servicii mai bune"; descrie ce se întâmplă concret.',
    fields: [
      { id: 'info', type: 'info', text: 'Criteriul de acceptare: 10 probleme distincte, cel puțin 7 formulate fără numele unui produs, fiecare cu un om/companie și un rezultat dorit.' },
      { id: 'probleme', type: 'dynamic-table', label: 'Cele 10 probleme observate', columns: ['Problema — ce se întâmplă acum', 'Cine o trăiește', 'Rezultatul dorit', 'Costul principal (bani / timp / efort-stres)', 'Observația ta — de ce merită explorată'], addLabel: 'Adaugă o problemă' },
      { id: 'concluzie', type: 'textarea', label: 'Ce ai observat comparând problemele între ele', placeholder: 'Care se repetă, care produc cel mai mare cost, care ți-au atras atenția și de ce.' },
    ],
  },

  {
    exerciseId: 'st-e-1-2',
    type: 'form-fields',
    title: 'Harta avantajului de start — unde pornesc cu un pas înainte',
    instructions:
      'Legat de Lecția 1.2. Nu alegi încă nișa. Inventariezi ce ai deja și legi resursele de problemele din exercițiul anterior, ca să vezi unde startul e mai rapid, mai ieftin sau mai puțin riscant.',
    fields: [
      { id: 'experienta', type: 'textarea', label: 'Ce știu să fac și ce am văzut din interior', placeholder: 'Experiențe și competențe folosibile într-o afacere.' },
      { id: 'acces', type: 'textarea', label: 'La ce oameni, piețe sau companii pot ajunge direct sau prin relații', placeholder: 'Comunități, tipuri de clienți, canale la care ai deja acces.' },
      { id: 'resurse', type: 'textarea', label: 'Ce resurse pot folosi fără să le construiesc de la zero', placeholder: 'Timp, bani, echipamente, spațiu, tehnologie, furnizori, echipă, infrastructură.' },
      { id: 'credibilitate', type: 'textarea', label: 'De ce ar avea cineva încredere în mine', placeholder: 'Rezultate anterioare, portofoliu, reputație, relații de încredere.' },
      { id: 'info_directii', type: 'info', text: 'Minimum 2 direcții, fiecare susținută de ceva real pe care îl ai deja — nu de interes sau pasiune. Nu declara încă nișa finală.' },
      { id: 'directii', type: 'dynamic-table', label: 'Direcțiile unde avantajul e cel mai clar', columns: ['Direcția (problema din Exercițiul 1)', 'Avantajul meu concret', 'Pe ce anume real se sprijină'], addLabel: 'Adaugă o direcție' },
    ],
  },

  {
    exerciseId: 'st-e-1-3',
    type: 'form-fields',
    title: 'Harta segmentelor — pentru cine exact există problema',
    instructions:
      'Legat de Lecția 1.3. Transformi o piață largă în 5–7 grupuri concrete. Fiecare segment se formulează prin cine + situație/context + problemă. Evită segmentele pur demografice, de tip „femei 25–45" sau „antreprenori".',
    fields: [
      { id: 'probleme_alese', type: 'textarea', label: 'Ce 1–3 probleme duci mai departe din exercițiile precedente', placeholder: 'Scrie-le exact așa cum le-ai formulat, ca să poți compara segmentele pe aceeași bază.' },
      { id: 'segmente', type: 'dynamic-table', label: 'Cele 5–7 segmente concrete', columns: ['Denumirea internă', 'Cine', 'Situația / contextul', 'Problema concretă', 'Momentul / ocazia', 'Așteptarea principală (rapiditate, preț, confort, premium, personalizare…)'], addLabel: 'Adaugă un segment' },
      { id: 'verificare', type: 'checkboxes', label: 'Verificarea segmentelor', options: ['Am 5–7 segmente distincte', 'Fiecare segment poate fi imaginat ca un om sau o companie într-o situație reală', 'Fiecare formulare include problema, nu doar categoria demografică', 'Segmentele sunt suficient de diferite ca să poată fi comparate'] },
    ],
  },

  {
    exerciseId: 'st-e-1-4',
    type: 'form-fields',
    title: 'Realitatea pieței — soluția actuală și observația de teren',
    instructions:
      'Legat de Lecțiile 1.4 și 1.5. Minimum 3 segmente. Partea A: cu ce concurezi în realitate. Partea B: ce ai văzut efectiv. Ține faptele separate de interpretare și adună dovezi din cel puțin două surse: teren, ce cumpără oamenii, ce spun public.',
    fields: [
      { id: 'info_a', type: 'info', text: 'Partea A — Soluția actuală. Dacă omul nu face nimic, scrie explicit că acceptă sau amână problema; și asta e o soluție actuală.' },
      { id: 'solutii', type: 'dynamic-table', label: 'Harta soluțiilor actuale (minimum 3 segmente)', columns: ['Segment', 'Simptomul vizibil', 'Problema din spate', 'Soluția actuală / alternativa reală', 'Limita ei', 'De ce nu schimbă', 'Rezultatul dorit'], addLabel: 'Adaugă un segment' },
      { id: 'info_b', type: 'info', text: 'Partea B — Observația. Un fapt e ceva ce ai putut vedea, număra sau cita. Restul e interpretare.' },
      { id: 'observatii', type: 'dynamic-table', label: 'Fișa de observație a pieței', columns: ['Segment', 'Unde și când am observat', 'Ce am văzut efectiv (fapt)', 'Cantități / frecvențe / prețuri', 'Formulări folosite de oameni', 'Sursa (teren / cumpărături / public)', 'Interpretarea mea'], addLabel: 'Adaugă o observație' },
      { id: 'surprize', type: 'textarea', label: 'Ce presupuneam înainte și ce m-a surprins după observație', placeholder: 'Scrie ipoteza inițială și ce a contrazis-o realitatea.' },
      { id: 'gol', type: 'textarea', label: 'Cel puțin un gol concret între ce primește clientul azi și ce și-ar dori', placeholder: 'Formulează-l ca diferență observabilă, nu ca oportunitate generală.' },
    ],
  },

  {
    exerciseId: 'st-e-1-5',
    type: 'form-fields',
    title: 'Matricea nișei — alegerea oportunității de testat',
    instructions:
      'Legat de Lecția 1.6. Selectezi exact 3 segmente și le compari pe aceleași criterii. Dacă nu ai informație pentru un criteriu, scrie „necunoscut" — nu inventa. Alegerea nu e un verdict definitiv, e nișa pe care o validezi în Săptămâna 3.',
    fields: [
      { id: 'info_eliminatorii', type: 'info', text: 'Două criterii eliminatorii: problema produce suficientă acțiune și poți ajunge efectiv la client pentru testare. Ce nu trece de ele iese din comparație, oricât de atrăgător ar părea.' },
      { id: 'matrice', type: 'dynamic-table', label: 'Matricea de decizie — cele 3 nișe pe aceleași criterii', columns: ['Nișa (cine + situație + problemă)', 'Problema produce acțiune? (eliminatoriu)', 'Pot ajunge la client? (eliminatoriu)', 'Golul soluției actuale', 'Avantajul meu de start', 'Spațiu de creștere', 'Dovezi disponibile acum'], addLabel: 'Adaugă o nișă' },
      { id: 'nisa_aleasa', type: 'input', label: 'Nișa aleasă — cine + situație + problemă', placeholder: 'Ex.: proprietari de cafenele mici din Chișinău care pierd comenzi în orele de vârf.' },
      { id: 'motiv', type: 'textarea', label: 'De ce această nișă e mai bună de testat acum decât celelalte două (maximum 5 propoziții)', placeholder: 'Sprijină-te pe dovezile din săptămână, nu pe preferință.' },
      { id: 'ipoteza', type: 'textarea', label: 'Cel mai mare lucru pe care încă nu îl știu și trebuie validat în Săptămâna 3', placeholder: 'O singură ipoteză, formulată ca afirmație verificabilă.' },
      { id: 'praguri', type: 'dynamic-table', label: 'Ce dovadă mă face să continui și ce dovadă mă face să pivotez', columns: ['Tipul dovezii', 'Continuu dacă…', 'Pivotez dacă…'], addLabel: 'Adaugă un prag' },
      { id: 'propozitie', type: 'input', label: 'Propoziția finală a Dosarului Oportunității', placeholder: 'Aleg să testez [cine + situație + problemă], pentru că [dovezile principale].' },
    ],
  },


  // ── Modulul 2 · Clientul și Validarea ★ ────────────────────────────────────
  {
    exerciseId: 'st-e-2-1',
    type: 'form-fields',
    title: 'Filtrul clientului',
    instructions:
      'Legat de Lecția 2.1. Alegi oamenii ale căror experiențe pot testa ipoteza ta, nu oamenii ușor accesibili. Lista trebuie să fie suficient de mare încât să obții minimum 10 conversații reale la Exercițiul 2.5, chiar dacă o parte nu răspund.',
    fields: [
      { id: 'ipoteza', type: 'textarea', label: 'Problema și situația pe care vreau să le testez (o singură propoziție)', placeholder: 'Ex.: proprietarii de cafenele mici pierd comenzi în orele de vârf pentru că iau comenzile manual.' },
      { id: 'info_filtru', type: 'info', text: 'Filtrul se scrie pe cinci dimensiuni: problemă, situație, comportament, potrivire practică și excluderi. Fiecare criteriu trebuie să poată fi verificat înainte de conversație.' },
      { id: 'filtru', type: 'dynamic-table', label: 'A. Filtrul clientului', columns: ['Dimensiune (problemă / situație / comportament / potrivire practică / excluderi)', 'Criteriul meu', 'Cum îl pot verifica?'], addLabel: 'Adaugă o dimensiune' },
      { id: 'lista', type: 'dynamic-table', label: 'B. Lista oamenilor potriviți', columns: ['Nume / cod', 'De ce trece filtrul?', 'Rol în decizie', 'Canal de contact', 'Status'], addLabel: 'Adaugă o persoană' },
      { id: 'control', type: 'checkboxes', label: 'Control final', options: ['Pot explica de ce fiecare persoană de pe listă este relevantă', 'Am inclus oameni cu comportament real legat de problemă', 'Am separat prietenii și cunoștințele care ar răspunde prea politicos, dacă nu trec filtrul', 'Lista îmi permite să ajung la minimum 10 conversații reale'] },
    ],
  },

  {
    exerciseId: 'st-e-2-2',
    type: 'form-fields',
    title: 'Harta schimbării',
    instructions:
      'Legat de Lecția 2.2. Formulezi ipotezele despre momentul care activează problema și despre forțele care împing sau frânează schimbarea. Totul rămâne IPOTEZĂ până când e susținut de conversații sau de comportament real.',
    fields: [
      { id: 'problema_latenta', type: 'textarea', label: 'Problema latentă, în cuvinte simple', placeholder: 'Cum arată problema atunci când omul încă nu face nimic în privința ei.' },
      { id: 'declansatoare', type: 'dynamic-table', label: '2–3 declanșatoare care ar face problema relevantă acum', columns: ['Declanșatorul', 'Ce se schimbă în viața / munca omului în acel moment', 'Cât de des apare'], addLabel: 'Adaugă un declanșator' },
      { id: 'info_forte', type: 'info', text: 'Cele patru forțe: presiunea situației actuale și atracția rezultatului nou împing spre schimbare; teama de schimbare și obișnuința cu soluția actuală o frânează.' },
      { id: 'forte', type: 'dynamic-table', label: 'Cele patru forțe', columns: ['Forța (presiune / atracție / teamă / obișnuință)', 'Ipoteza mea', 'Ce dovadă ar confirma?', 'Ce dovadă ar contrazice?'], addLabel: 'Adaugă o forță' },
      { id: 'necunoscute', type: 'dynamic-table', label: 'Întrebări pe care vreau să le clarific în interviuri', columns: ['Întrebare / necunoscut', 'De ce contează pentru business?'], addLabel: 'Adaugă o întrebare' },
    ],
  },

  {
    exerciseId: 'st-e-2-3',
    type: 'form-fields',
    title: 'Harta deciziei de cumpărare',
    instructions:
      'Legat de Lecția 2.3. Completezi numai rolurile care există în realitate. Dacă o singură persoană are mai multe roluri, scrie același nume — nu complica artificial harta.',
    fields: [
      { id: 'cumpararea', type: 'textarea', label: 'Cumpărarea reală pe care vreau s-o testez', placeholder: 'Ce anume cumpără omul, în ce moment și pentru ce rezultat.' },
      { id: 'roluri', type: 'dynamic-table', label: 'Rolurile din decizie', columns: ['Rol (om cu problema / utilizator / influențator / decident / plătitor / blocator)', 'Nume / tip de persoană', 'Ce îl interesează?', 'Ce poate bloca?', 'Ce trebuie să aflu?'], addLabel: 'Adaugă un rol' },
      { id: 'traseu', type: 'dynamic-table', label: 'Traseul cumpărării', columns: ['Pas', 'Cine intervine?', 'Ce trebuie să se întâmple ca procesul să meargă mai departe?'], addLabel: 'Adaugă un pas' },
      { id: 'control', type: 'checkboxes', label: 'Control final', options: ['Am marcat cine plătește efectiv', 'Am identificat cine poate bloca decizia', 'Știu de la cine am nevoie de dovadă în conversații'] },
    ],
  },

  {
    exerciseId: 'st-e-2-4',
    type: 'form-fields',
    title: 'Scriptul Customer Development',
    instructions:
      'Pregătești o conversație care scoate la suprafață episoade, comportamente și decizii reale, fără să sugereze răspunsul. Elimini orice întrebare care conține beneficiul soluției tale sau care cere persoanei să-ți evalueze ideea.',
    fields: [
      { id: 'deschidere', type: 'textarea', label: 'Deschiderea mea — ce investighez și de ce vreau să înțeleg experiența persoanei', placeholder: 'Scurt și transparent. Fără pitch.' },
      { id: 'structura', type: 'checkboxes', label: 'Structura interviului — bifez ce am pregătit', options: ['Context: ce se întâmplă în jurul problemei', 'Ultimul episod: povestește-mi despre ultima dată când…', 'Ce s-a întâmplat înainte de episod', 'Ce ai făcut prima dată', 'Ce ai încercat după', 'Ce soluție ai folosit în final', 'Ce te-a costat în timp, bani, energie sau risc', 'Ce a făcut problema importantă atunci', 'Cine a mai participat la alegere', 'Ce te-a făcut să alegi soluția respectivă', 'Ce te-a făcut să eziți sau să amâni', 'Ce am înțeles greșit sau ce ar trebui să mai știu'] },
      { id: 'intrebari', type: 'dynamic-table', label: 'Întrebările mele, în ordinea în care le pun', columns: ['Întrebarea', 'Ce vreau să aflu din ea', 'Follow-up dacă răspunsul e vag'], addLabel: 'Adaugă o întrebare' },
      { id: 'info_rescriere', type: 'info', text: 'O întrebare slabă sună așa: „Ți-ar plăcea o aplicație care…?". Varianta bună întreabă despre ultimul episod real: „Când ai avut ultima dată situația asta, ce ai făcut concret?".' },
      { id: 'rescriere', type: 'dynamic-table', label: 'Rescrierea întrebărilor slabe', columns: ['Întrebarea mea inițială', 'De ce poate influența răspunsul?', 'Varianta despre comportament / episod real'], addLabel: 'Adaugă o rescriere' },
    ],
  },

  {
    exerciseId: 'st-e-2-5',
    type: 'form-fields',
    title: 'Conversațiile și dovezile',
    instructions:
      'Minimum 10 conversații cu persoane care trec filtrul din 2.1. După fiecare conversație notează faptele imediat, separat de interpretarea ta. Abia la final cauți tipare și scrii excepțiile.',
    fields: [
      { id: 'info_ierarhie', type: 'info', text: 'Ierarhia dovezilor: complimentul nu valorează nimic · interesul valorează puțin · pre-comanda valorează mult · plata e singura validare reală. Prietenii te mint involuntar — nu vor să te descurajeze, dar asta te costă luni.' },
      { id: 'conversatii', type: 'dynamic-table', label: 'Tabelul conversațiilor (minimum 10 rânduri)', columns: ['Persoană / de ce trece filtrul', 'Ultimul episod concret', 'Soluția folosită acum', 'Acțiunea / efortul făcut', 'Cost / consecință', 'Declanșator + roluri în decizie', 'Ce susține ipoteza', 'Ce contrazice ipoteza'], addLabel: 'Adaugă o conversație' },
      { id: 'tipare', type: 'dynamic-table', label: 'Tiparele care se repetă', columns: ['Tiparul observat', 'În câte conversații apare', 'Faptul care îl susține (citat / comportament / cifră)'], addLabel: 'Adaugă un tipar' },
      { id: 'sustin', type: 'textarea', label: 'Top 3 dovezi care SUSȚIN ipoteza', placeholder: 'Fapte, nu impresii. Câte una pe rând.' },
      { id: 'contrazic', type: 'textarea', label: 'Top 3 dovezi care CONTRAZIC ipoteza', placeholder: 'Excepțiile și contradicțiile. Dacă nu găsești niciuna, cel mai probabil nu ai ascultat destul.' },
      { id: 'control', type: 'checkboxes', label: 'Control final', options: ['Am minimum 10 conversații finalizate', 'Toate persoanele trec filtrul din 2.1', 'Faptele sunt scrise separat de interpretarea mea', 'Am notat cel puțin o dovadă care mă contrazice'] },
    ],
  },

  {
    exerciseId: 'st-e-2-6',
    type: 'form-fields',
    title: 'Testul de angajament și verdictul',
    instructions:
      'Ceri o acțiune cu miză reală și decizi pe baza pragurilor stabilite ÎNAINTE de rezultate. Notează răspunsul exact, fără să transformi refuzul într-o negociere.',
    fields: [
      { id: 'info_angajament', type: 'info', text: 'Angajamentul e cea mai mică acțiune realistă care seamănă cu următorul pas din cumpărarea adevărată: timp, acces, pilot, programare, cerere de ofertă, rezervare, avans sau cumpărare.' },
      { id: 'praguri', type: 'dynamic-table', label: 'A. Pragurile stabilite înainte de test', columns: ['Angajamentul cerut', 'De ce este relevant?', 'Pragul MERG', 'Pragul PIVOT / STOP'], addLabel: 'Adaugă un prag' },
      { id: 'rezultate', type: 'dynamic-table', label: 'B. Rezultate', columns: ['Persoană / rol', 'Angajamentul cerut', 'Răspuns / acțiune', 'Ce a blocat?', 'Greutatea dovezii'], addLabel: 'Adaugă un rezultat' },
      { id: 'raport_ipoteza', type: 'textarea', label: 'C. Raportul de validare — ipoteza pe care am testat-o', placeholder: 'Formulată ca afirmație verificabilă.' },
      { id: 'raport_cine', type: 'textarea', label: 'Cine a fost testat și de ce', placeholder: 'Câte persoane, din ce segmente, pe ce criterii au trecut filtrul.' },
      { id: 'raport_tipare', type: 'textarea', label: 'Tiparele principale din conversații', placeholder: 'Ce se repetă și ce contrazice, pe scurt.' },
      { id: 'verdict', type: 'checkboxes', label: 'Verdictul', options: ['MERG — angajamentele au atins pragul stabilit', 'PIVOTEZ nișa', 'PIVOTEZ problema', 'PIVOTEZ formatul soluției sau angajamentul cerut', 'OPRESC IPOTEZA curentă'] },
      { id: 'motiv', type: 'textarea', label: 'Pe ce dovezi se sprijină verdictul și care e următorul pas concret', placeholder: 'Un rezultat negativ aflat acum te costă o săptămână. Aflat peste 8 luni te costă firma.' },
    ],
  },


  // ── Modulul 3 · Oferta și Fundația ─────────────────────────────────────────
  {
    exerciseId: 'st-e-3-1',
    type: 'form-fields',
    title: 'Fișa ofertei',
    instructions:
      'Legat de Lecția 3.1. Alege segmentul și problema care au primit cele mai puternice dovezi în Săptămâna 3. Oferta se scrie pentru un client și o situație clară, nu pentru „toată lumea". Păstrează ipotezele separate de dovezi.',
    fields: [
      { id: 'client', type: 'input', label: 'Clientul pentru care construiesc', placeholder: 'Cine + situație, exact ca în nișa validată.' },
      { id: 'situatie', type: 'textarea', label: 'Situația / declanșatorul relevant', placeholder: 'Momentul în care problema devine urgentă pentru el.' },
      { id: 'problema', type: 'textarea', label: 'Problema validată', placeholder: 'Formulată în cuvintele oamenilor cu care ai vorbit.' },
      { id: 'rezultat', type: 'textarea', label: 'Rezultatul principal dorit', placeholder: 'Ce caută clientul de fapt — un rezultat, nu o listă de funcții.' },
      { id: 'solutie', type: 'textarea', label: 'Soluția pe care o propun acum', placeholder: 'Ce poți livra efectiv în forma actuală, nu peste 6 luni.' },
      { id: 'oferta', type: 'textarea', label: 'Prima mea ofertă testabilă (o propoziție)', placeholder: 'Ajut [client] care [situație] să obțină [rezultat] prin [soluție].' },
      { id: 'dovada', type: 'textarea', label: 'Dovada din S3 care justifică această ofertă', placeholder: 'Fapte, citate, comportamente — nu impresii.' },
      { id: 'control', type: 'checkboxes', label: 'Control final', options: ['Propoziția include clientul', 'Include situația', 'Include rezultatul', 'Include soluția', 'Se sprijină pe o dovadă reală din validare'] },
    ],
  },

  {
    exerciseId: 'st-e-3-2',
    type: 'form-fields',
    title: 'Structura pachetului inițial',
    instructions:
      'Legat de Lecția 3.2. Prima ofertă trebuie să livreze rezultatul principal fără supraîncărcare. Ce nu e obligatoriu pentru rezultat sau pentru încredere se mută în backlog.',
    fields: [
      { id: 'rezultat', type: 'textarea', label: 'Rezultatul principal (copiat din Fișa ofertei)', placeholder: 'Un singur rezultat.' },
      { id: 'elemente', type: 'dynamic-table', label: 'Elementele ofertei', columns: ['Elementul', 'Obligatoriu sau secundar?', 'Dovada care îl justifică', 'Contribuie la rezultat sau la încredere?'], addLabel: 'Adaugă un element' },
      { id: 'backlog', type: 'dynamic-table', label: 'Backlog — elemente pentru mai târziu', columns: ['Elementul amânat', 'Ce dovadă îl aduce înapoi în ofertă?'], addLabel: 'Adaugă în backlog' },
      { id: 'exclus', type: 'textarea', label: 'Ce este exclus explicit din prima ofertă', placeholder: 'Scris clar, ca să nu creezi așteptări pe care nu le poți livra.' },
      { id: 'limita', type: 'textarea', label: 'Limita ofertei', placeholder: 'Până unde merge responsabilitatea ta: volum, durată, număr de revizuiri, acoperire.' },
      { id: 'structura', type: 'textarea', label: 'Structura finală a pachetului', placeholder: 'Enumeră, în ordine, ce primește clientul.' },
    ],
  },

  {
    exerciseId: 'st-e-3-3',
    type: 'form-fields',
    title: 'Planul MVP / pilot',
    instructions:
      'Legat de Lecția 3.3. Alegi cea mai mică formă de soluție care poate testa ipoteza critică prin comportament real. Manual e permis și de multe ori preferabil — nu construiești ce încă nu are dovadă.',
    fields: [
      { id: 'ipoteza', type: 'textarea', label: 'Ipoteza critică pe care o testez', placeholder: 'Afirmație verificabilă: dacă asta e falsă, oferta nu are sens.' },
      { id: 'forma', type: 'checkboxes', label: 'Forma testului', options: ['Prototip', 'MVP', 'Pilot cu un client real', 'Livrare 100% manuală', 'Combinație'] },
      { id: 'primeste', type: 'textarea', label: 'Ce primește clientul concret', placeholder: 'Descrie livrabilul, nu intenția.' },
      { id: 'functioneze', type: 'textarea', label: 'Ce trebuie să funcționeze pentru ca rezultatul să fie credibil', placeholder: 'Minimul de calitate fără de care testul nu e valid.' },
      { id: 'manual', type: 'dynamic-table', label: 'Ce fac manual și ce amân', columns: ['Activitatea', 'Manual acum / amânată', 'De ce'], addLabel: 'Adaugă o activitate' },
      { id: 'masor', type: 'textarea', label: 'Comportamentul sau rezultatul pe care îl măsor', placeholder: 'Un comportament observabil, nu o părere.' },
      { id: 'criteriu', type: 'textarea', label: 'Criteriul de succes / dovada care îmi dă dreptul la următorul nivel', placeholder: 'Ex.: 3 clienți plătesc avansul în 14 zile.' },
    ],
  },

  {
    exerciseId: 'st-e-3-4',
    type: 'form-fields',
    title: 'Ipoteza de preț',
    instructions:
      'Legat de Lecția 3.4. Prețul inițial nu e definitiv — e o ipoteză argumentată, suficient de realistă ca să fie testată în vânzări reale. Se sprijină pe alternativele clientului și pe valoarea rezultatului.',
    fields: [
      { id: 'alternative', type: 'dynamic-table', label: 'Alternativele pe care clientul le folosește acum', columns: ['Alternativa', 'Cât îl costă (bani)', 'Cât îl costă (timp / efort / risc)', 'Ce nu rezolvă'], addLabel: 'Adaugă o alternativă' },
      { id: 'valoare', type: 'textarea', label: 'Valoarea rezultatului pentru client', placeholder: 'Ce câștigă sau ce nu mai pierde, exprimat cât mai concret.' },
      { id: 'pozitionare', type: 'textarea', label: 'Poziționarea primei oferte', placeholder: 'Sub, la nivelul sau peste alternative — și de ce.' },
      { id: 'pret', type: 'input', label: 'Prețul propus', placeholder: 'O cifră, nu un interval vag.' },
      { id: 'conditie', type: 'textarea', label: 'Condiția de plată', placeholder: 'Avans, integral, în rate, la livrare. Când intră banii efectiv.' },
      { id: 'primeste', type: 'textarea', label: 'Ce primește clientul pentru acest preț', placeholder: 'Legat direct de structura pachetului din 3.2.' },
      { id: 'pastrez', type: 'textarea', label: 'Dovada care mă face să păstrez prețul', placeholder: 'Ex.: oamenii plătesc fără să negocieze.' },
      { id: 'reevaluez', type: 'textarea', label: 'Semnalul care mă face să reevaluez prețul', placeholder: 'Ex.: toți cer reducere sau amână decizia din cauza prețului.' },
    ],
  },

  {
    exerciseId: 'st-e-3-5',
    type: 'form-fields',
    title: 'Harta livrării',
    instructions:
      'Legat de Lecția 3.5. Vezi întregul traseu de la comandă la rezultat și identifici riscurile ÎNAINTE de prima vânzare. Fiecare pas al clientului are o acțiune vizibilă și una din spate.',
    fields: [
      { id: 'trasee', type: 'dynamic-table', label: 'Traseul livrării', columns: ['Pasul clientului', 'Acțiunea vizibilă a afacerii', 'Acțiunea din spate', 'Cât durează'], addLabel: 'Adaugă un pas' },
      { id: 'resurse', type: 'dynamic-table', label: 'Resurse și furnizori de care depind', columns: ['Resursa / furnizorul', 'Pentru ce pas', 'Ce se întâmplă dacă lipsește'], addLabel: 'Adaugă o resursă' },
      { id: 'riscuri', type: 'dynamic-table', label: 'Punctele de risc', columns: ['Riscul', 'Unde apare în traseu', 'Soluția minimă de rezervă'], addLabel: 'Adaugă un risc' },
      { id: 'standard', type: 'textarea', label: 'Standardul minim de livrare', placeholder: 'Sub acest nivel nu livrez, oricât de grăbit aș fi.' },
      { id: 'control', type: 'checkboxes', label: 'Control final', options: ['Traseul e complet, de la comandă la rezultat', 'Fiecare pas are un responsabil', 'Riscurile principale au un plan B', 'Pot executa traseul mâine, cu ce am acum'] },
    ],
  },

  {
    exerciseId: 'st-e-3-6',
    type: 'form-fields',
    title: 'Checklistul ofertei gata de vânzare',
    instructions:
      'Legat de Lecția 3.6. Verifici dacă poți accepta mâine un client, încasa banii și livra — fără investiții premature. Aspectele juridice și fiscale se confirmă local, cu specialistul potrivit.',
    fields: [
      { id: 'produs', type: 'textarea', label: 'Produs / pilot gata — ce anume e livrabil azi', placeholder: 'Legat de planul MVP din 3.3.' },
      { id: 'pret', type: 'textarea', label: 'Preț și condiții', placeholder: 'Copiate din 3.4, în forma pe care o comunici clientului.' },
      { id: 'plata', type: 'textarea', label: 'Metoda efectivă de încasare', placeholder: 'Cont, transfer, link de plată, numerar. Testată sau nu?' },
      { id: 'admin', type: 'dynamic-table', label: 'Aspecte administrative de verificat local', columns: ['Ce trebuie verificat', 'Cu cine confirm', 'Termen'], addLabel: 'Adaugă o verificare' },
      { id: 'mesaj', type: 'textarea', label: 'Mesajul de confirmare și următorul pas pentru client', placeholder: 'Ce primește imediat după ce spune „da".' },
      { id: 'start', type: 'input', label: 'Data sau modul de începere', placeholder: 'Ex.: în maximum 48 de ore de la plată.' },
      { id: 'livrare', type: 'checkboxes', label: 'Livrarea poate fi executată', options: ['Harta livrării e completă', 'Resursele necesare există', 'Am testat cel puțin o dată traseul, cap-coadă', 'Standardul minim e definit'] },
      { id: 'risc', type: 'textarea', label: 'Riscul principal și planul B', placeholder: 'Ce te poate opri și ce faci atunci.' },
      { id: 'aman', type: 'dynamic-table', label: 'Ce amân până după dovadă', columns: ['Investiția amânată', 'Ce dovadă o deblochează'], addLabel: 'Adaugă o investiție' },
      { id: 'verdict', type: 'checkboxes', label: 'Verdict', options: ['GATA — pot accepta un client mâine', 'MAI AM DE REZOLVAT'] },
      { id: 'motiv', type: 'textarea', label: 'Ce mai am de rezolvat și până când', placeholder: 'Dacă verdictul e GATA, scrie prima persoană căreia îi faci oferta.' },
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
