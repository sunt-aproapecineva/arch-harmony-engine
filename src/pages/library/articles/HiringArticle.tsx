// @ts-nocheck
import React from 'react';
import { motion } from 'framer-motion';
import {
  Section, SectionHeader, Lead, Pull, Card, Grid,
  AlertTriangle, CheckCircle2, XCircle, Target, Users, TrendingDown, Layers, ListChecks, Clock, BookOpen,
} from '../../LibraryArticlePage';

const CRITERIA = [
  { n: 1, title: 'Productivitatea', body: 'Ce a produs în trecut — nu ce a făcut. Întrebare cheie: „Care a fost cel mai mare rezultat produs în ultimul job?" Activități = semnal rău. Rezultate concrete = semnal bun.' },
  { n: 2, title: 'Calitățile personale', body: 'Trebuie să se potrivească cu funcția. Vânzătorul: comunicativ, nu îi e frică de refuz. Omul pe rutină: precis, disciplinat. Orice calitate puternică are un opozit.' },
  { n: 3, title: 'Motivația', body: '„De ce ai ales această profesie?" Dacă „era aproape de casă" — caută mai departe. Un om motivat cu competențe medii bate un om nemotivat cu competențe excelente.' },
  { n: 4, title: 'Competențele — ultimul loc', body: 'Contează, dar se pot învăța. Productivitatea, calitățile și motivația sunt greu de schimbat. Angajează mai întâi pentru ce nu poți schimba.' },
];

const TRAPS = [
  { n: 1, title: 'Nu am timp să angajez acum.', body: 'Ești prea ocupat pentru că nu ai angajat. E un cerc închis. Adevărul: ești ocupat EXACT pentru că nu ai angajat. Cu cât amâni mai mult, cu atât devine mai greu să ieși.' },
  { n: 2, title: 'Nu îmi permit acum financiar.', body: 'Nu ai bani pentru că nu ai angajat. Nu angajezi pentru că nu ai bani. Adevărul: nu îți permiți să NU angajezi. Fiecare zi în care faci munca altcuiva e o zi în care nu te ocupi de ce produce creștere.' },
  { n: 3, title: 'Nu găsesc oameni buni.', body: 'În 90% din cazuri — nu pentru că omul era slab. Ci pentru că nu aveai funcție clară, produs final clar, proces de integrare. Soluția: faci mai întâi munca din Săptămâna 3 — organigramă, produs final. Abia după angajezi.' },
  { n: 4, title: 'Angajații existenți nu vor pe cineva nou.', body: 'Rezistența apare pentru că noul angajat le poate amenința poziția. Soluția: implici echipa în proces. Nu îi întrebi dacă vor — îi întrebi cum ar trebui să arate omul potrivit.' },
  { n: 5, title: 'Dacă angajez, îmi scade profitul.', body: 'Adevărat pe termen scurt. Fals pe termen lung. Calculul corect: nu profit pe angajat — ci profit total. Și ce faci TU cu timpul eliberat.' },
];

const MISTAKES = [
  { n: 1, title: 'Angajezi fără să știi ce va produce omul.', body: 'Pui un anunț: „caut om pentru marketing". Omul vine. Nu știți nici tu nici el ce trebuie să producă. Soluția: definești produsul final al funcției ÎNAINTE să pui anunțul.' },
  { n: 2, title: 'Nu îi oferi instrumentele necesare.', body: 'Marketologul vine și descoperă că nu are acces la Instagram, site, buget de reclame, tool de design. Soluția: înainte să vină — listă cu tot ce are nevoie din prima zi.' },
  { n: 3, title: 'Angajezi fără claritate financiară.', body: 'Salariu agreat. După 3 luni — el crede că salariul crește automat. Tu nu te-ai gândit. Soluția: la angajare stabilești clar salariul fix, bonusurile, cum se evaluează performanța, traseul de creștere.' },
  { n: 4, title: 'Angajezi în panică — cercul vicios.', body: 'Angajezi rapid → nu integrezi → performează prost → îl dai afară → ești la fel de ocupat + dezamăgit → angajezi din nou în panică. Soluția: angajezi ÎNAINTE să ai urgență.' },
  { n: 5, title: 'Nu pregătești locul de muncă.', body: 'Omul vine în prima zi. Nu are calculator, nu are acces, nu știe ce să facă. Oamenii productivi nu iubesc să stea fără lucru. Dacă în prima săptămână nu are ce face — în luna a doua pleacă.' },
  { n: 6, title: 'Nu îi arăți organigrama.', body: 'Omul vine, începe să lucreze, nu știe cum funcționează firma. Vine la tine pentru orice. Soluția: prima zi = o oră cu organigrama. Cine răspunde de ce. Cum circulă comunicarea.' },
];


const CHECKLIST = [
  'Am identificat funcția goală în organigramă — știu exact ce poziție ocupă.',
  'Am definit produsul final al acelei funcții — concret, măsurabil.',
  'Am scris calitățile necesare pentru acel produs final — specific, nu generic.',
  'Am pregătit locul de muncă — spațiu, acces, echipamente.',
  'Am pregătit primele 5 sarcini concrete pentru prima săptămână.',
  'Am stabilit clar salariul, bonusurile și condițiile de evaluare.',
  'Am pregătit ora de onboarding cu organigrama firmei.',
  'La interviu testez: productivitate, calități, motivație — în această ordine.',
  'Nu angajez în panică — am timp să fac lucrurile corect.',
  'Am implicat echipa existentă în proces.',
];

export const HiringArticle: React.FC = () => {
  return (
    <article style={{ maxWidth: 760, margin: '0 auto', padding: '24px 24px 80px', color: 'var(--fg)' }}>
      {/* HERO */}
      <motion.header
        initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        style={{ padding: '40px 0 28px', borderBottom: '1px solid var(--border)', marginBottom: 36 }}
      >
        <div className="font-aboreto" style={{
          fontSize: 10, letterSpacing: '0.2em', textTransform: 'uppercase',
          color: 'var(--gold)', marginBottom: 18,
        }}>
          Sesiune Live · Practicum de Sistematizare
        </div>

        <h1 className="font-aboreto" style={{
          fontSize: 'clamp(2.2rem, 5.5vw, 3.8rem)',
          lineHeight: 1.02, letterSpacing: '-0.025em',
          margin: 0, marginBottom: 16, fontWeight: 400,
        }}>
          Cum angajăm corect.
        </h1>

        <p style={{
          fontSize: 'clamp(0.95rem, 1.4vw, 1.05rem)',
          color: 'var(--fg-2)', lineHeight: 1.6, maxWidth: 580,
          fontStyle: 'italic',
        }}>
          5 capcane · 6 greșeli · 4 criterii · Outsource vs. Angajat
        </p>

        <div style={{
          display: 'flex', gap: 18, marginTop: 28, flexWrap: 'wrap',
          fontSize: 12, color: 'var(--fg-3)',
        }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
            <Clock size={12} /> 14 min de lectură
          </span>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
            <BookOpen size={12} /> Notițe — Sesiune Live
          </span>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
            <Users size={12} /> Victor Morar
          </span>
        </div>
      </motion.header>

      {/* INTRO PULL */}
      <Pull>
        „Nu angajați un om într-un vid. Angajați un om într-un sistem."
      </Pull>

      {/* SECȚIUNEA 1 — Capcane */}
      <Section>
        <SectionHeader kicker="Secțiunea 1" title="Cele 5 capcane care te țin pe loc." icon={<AlertTriangle size={18} />} />
        <Lead>
          Înainte să angajezi — există 5 capcane mentale care te opresc. Toate au o soluție.
          Dar soluția începe cu recunoașterea capcanei.
        </Lead>
        <Grid>
          {TRAPS.map((t) => (
            <Card key={t.n} number={`Capcana ${t.n}`} title={t.title} tone="warn">{t.body}</Card>
          ))}
        </Grid>
        <Pull accent="gold">Oricare din cele 5 capcane te ține pe loc. Toate au o soluție.</Pull>
      </Section>

      {/* SECȚIUNEA 2 — Mindset */}
      <Section>
        <SectionHeader kicker="Secțiunea 2" title={'Mindsetul „mai bine fac singur".'} icon={<Target size={18} />} />
        <Lead>
          Cel mai subtil mindset. Nu sună ca o capcană — sună ca eficiență.
        </Lead>
        <Pull>„Fac eu mai repede. Durează 20 de minute. Nu merită să explic."</Pull>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 14, margin: '20px 0' }}>
          <Card title={'„Mai bine fac singur"'} tone="warn">
            <p style={{ margin: '0 0 10px' }}>20 min × 3× / săptămână = 60 min / săptămână</p>
            <p className="font-aboreto" style={{ fontSize: 18, color: '#e08585', margin: 0 }}>
              = 48 ore pierdute / an
            </p>
          </Card>
          <Card title="Delegi o dată" tone="good">
            <p style={{ margin: '0 0 10px' }}>40 min investite o singură dată = nu mai faci TU niciodată</p>
            <p className="font-aboreto" style={{ fontSize: 18, color: '#7ad6a6', margin: 0 }}>
              = 48 ore economisite / an
            </p>
          </Card>
        </div>

        <p style={{ fontSize: 13.5, color: 'var(--fg-2)', lineHeight: 1.7 }}>
          De ce alegem varianta greșită: beneficiul e imediat (20 min câștigate azi), costul e amânat
          (48 ore pe an).
        </p>
        <Pull accent="gold">Time management e soluția pentru problema greșită. Soluția corectă e delegarea.</Pull>
      </Section>

      {/* SECȚIUNEA 3 — Cand e momentul */}
      <Section>
        <SectionHeader kicker="Secțiunea 3" title="Când e momentul să angajezi." icon={<CheckCircle2 size={18} />} />
        <Lead><strong style={{ color: 'var(--fg)' }}>3 semnale clare</strong> că e momentul:</Lead>
        <Grid min={220}>
          <Card number="Semnalul 1" title="Faci constant lucruri care nu sunt ale tale." tone="good">
            Mai mult de 50% din ziua ta sunt activități pe care ar trebui să le facă altcineva.
            Operaționale și repetitive, nu strategie.
          </Card>
          <Card number="Semnalul 2" title="Ai o funcție goală care blochează creșterea." tone="good">
            O funcție lipsă din organigramă face ca firma să nu poată scala. Organigrama ta din
            Săptămâna 3 îți arată exact ce poziții goale ai.
          </Card>
          <Card number="Semnalul 3" title="Creșterea e blocată de lipsa de oameni." tone="good">
            Ai clienți sau potențial. Dar nu poți deservi mai mult.{' '}
            <em>Atenție: dacă nu ai cerere — problema e de marketing, nu de angajare.</em>
          </Card>
        </Grid>

        <div style={{ marginTop: 28 }}>
          <h4 className="font-aboreto" style={{
            fontSize: 12, letterSpacing: '0.15em', textTransform: 'uppercase',
            color: '#e08585', marginBottom: 12,
          }}>
            Când NU e momentul
          </h4>
          <div style={{
            padding: 18, borderRadius: 12,
            background: 'rgba(139,26,26,0.05)',
            border: '1px solid rgba(224,133,133,0.2)',
            display: 'flex', flexDirection: 'column', gap: 10,
          }}>
            {[
              'Când angajezi din panică — ai prea mult de lucru azi.',
              'Când angajezi fără funcție clară și produs final definit.',
              'Când angajezi ca să rezolvi o problemă de management.',
            ].map((t, i) => (
              <div key={i} style={{ display: 'flex', gap: 10, alignItems: 'flex-start', fontSize: 13.5, color: 'var(--fg-2)' }}>
                <XCircle size={14} style={{ color: '#e08585', marginTop: 2, flexShrink: 0 }} />
                <span>{t}</span>
              </div>
            ))}
          </div>
        </div>
      </Section>

      {/* SECȚIUNEA 4 — De ce pierzi din profit */}
      <Section>
        <SectionHeader kicker="Secțiunea 4" title="De ce pierzi din profit când angajezi — și de ce e normal." icon={<TrendingDown size={18} />} />
        <Pull>Orice creștere reală necesită o investiție care temporar reduce profitul.</Pull>

        <h4 className="font-aboreto" style={{
          fontSize: 12, letterSpacing: '0.15em', textTransform: 'uppercase',
          color: 'var(--gold)', marginTop: 24, marginBottom: 14,
        }}>
          Calculul costului neangajării
        </h4>

        <div style={{
          padding: 24, borderRadius: 14,
          background: 'linear-gradient(135deg, rgba(201,169,110,0.10), rgba(201,169,110,0.02))',
          border: '1px solid rgba(201,169,110,0.25)',
        }}>
          {[
            ['Sarcină pe care o faci tu', '3 ore / zi × 22 zile', '66 ore / lună'],
            ['Ora ta valorată la', '50 €', '3.300 € / lună'],
            ['Angajatul ar costa', '—', '800 € / lună'],
          ].map(([l, m, r], i) => (
            <div key={i} style={{
              display: 'grid', gridTemplateColumns: '1.4fr 1fr auto', gap: 14, alignItems: 'baseline',
              padding: '10px 0',
              borderBottom: i < 2 ? '1px solid rgba(201,169,110,0.15)' : 'none',
            }}>
              <span style={{ fontSize: 13, color: 'var(--fg-2)' }}>{l}</span>
              <span style={{ fontSize: 12, color: 'var(--fg-3)' }}>{m}</span>
              <span className="font-aboreto" style={{ fontSize: 14, color: 'var(--fg)' }}>{r}</span>
            </div>
          ))}
          <div style={{
            marginTop: 18, paddingTop: 16, borderTop: '1px solid rgba(201,169,110,0.3)',
            display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', flexWrap: 'wrap', gap: 10,
          }}>
            <span className="font-aboreto" style={{ fontSize: 13, color: 'var(--gold)', letterSpacing: '0.05em' }}>
              DIFERENȚA
            </span>
            <span className="font-aboreto" style={{ fontSize: 'clamp(1.5rem, 3vw, 2rem)', color: '#e08585', letterSpacing: '-0.01em' }}>
              2.500 € / lună pierduți
            </span>
          </div>
          <p style={{ fontSize: 12, color: 'var(--fg-3)', fontStyle: 'italic', marginTop: 10 }}>
            + oportunitățile la care ai renunțat pentru că erai ocupat.
          </p>
        </div>
      </Section>

      {/* SECȚIUNEA 5 — Greșeli */}
      <Section>
        <SectionHeader kicker="Secțiunea 5" title="Cele 6 greșeli ale angajărilor haotice." icon={<XCircle size={18} />} />
        <Grid>
          {MISTAKES.map((m) => (
            <Card key={m.n} number={`Greșeala ${m.n}`} title={m.title} tone="warn">{m.body}</Card>
          ))}
        </Grid>
      </Section>

      {/* SECȚIUNEA 6 — Outsource vs Angajat */}
      <Section>
        <SectionHeader kicker="Secțiunea 6" title="Outsource vs. Angajat — care e diferența." icon={<Users size={18} />} />
        <Pull>Angajatul face parte din sistemul tău. Agenția are propriul sistem.</Pull>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 14, margin: '20px 0' }}>
          <Card title="Angajat" tone="good">
            <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 7 }}>
              {['Exclusiv pentru tine', 'Intră în organigrama ta', 'Poți integra în cultura firmei', 'Instruiești cum vrei tu', 'Cost fix lunar — predictibil', 'Crește odată cu firma'].map((t, i) => (
                <li key={i} style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
                  <CheckCircle2 size={13} style={{ color: '#7ad6a6', marginTop: 3, flexShrink: 0 }} /> {t}
                </li>
              ))}
            </ul>
          </Card>
          <Card title="Agenție / Freelancer" tone="warn">
            <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 7 }}>
              {['Lucrează pentru mai mulți clienți', 'Nu intră în organigramă — e furnizor', 'Nu controlezi procesul intern', 'Controlezi doar output-ul', 'Cost variabil — plătești livrabilul', 'Fără loialitate pe termen lung'].map((t, i) => (
                <li key={i} style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
                  <XCircle size={13} style={{ color: '#e08585', marginTop: 3, flexShrink: 0 }} /> {t}
                </li>
              ))}
            </ul>
          </Card>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 14, marginTop: 20 }}>
          <div>
            <h4 className="font-aboreto" style={{ fontSize: 12, letterSpacing: '0.15em', textTransform: 'uppercase', color: '#7ad6a6', marginBottom: 10 }}>
              Când are sens outsource-ul
            </h4>
            {['Funcția nu e critică pentru identitatea firmei (contabilitate, IT, curățenie).', 'Nu ai volumul care să justifice un angajat full-time.', 'Vrei să testezi o funcție înainte să o internalizezi.'].map((t, i) => (
              <p key={i} style={{ fontSize: 13, color: 'var(--fg-2)', lineHeight: 1.6, marginBottom: 8 }}>→ {t}</p>
            ))}
          </div>
          <div>
            <h4 className="font-aboreto" style={{ fontSize: 12, letterSpacing: '0.15em', textTransform: 'uppercase', color: '#e08585', marginBottom: 10 }}>
              Când outsource-ul e o capcană
            </h4>
            {['Externalizezi funcții din core-ul business-ului tău.', 'Nu ai un produs final clar definit pentru agenție.', 'Costul agenției depășește costul unui angajat dedicat.', 'Te bazezi pe agenție pentru lucruri urgente și critice.'].map((t, i) => (
              <p key={i} style={{ fontSize: 13, color: 'var(--fg-2)', lineHeight: 1.6, marginBottom: 8 }}>→ {t}</p>
            ))}
          </div>
        </div>

        <Pull accent="gold">
          Dacă funcția apare în organigrama vizată ca poziție permanentă — internalizezi.
          Outsource-ul e temporar, nu structural.
        </Pull>
      </Section>

      {/* CHECKLIST */}
      <Section>
        <SectionHeader kicker="Checklist" title="Înainte de următoarea angajare — bifezi tot." icon={<ListChecks size={18} />} />
        <div style={{
          padding: 24, borderRadius: 14,
          background: 'var(--bg-card)', border: '1px solid rgba(201,169,110,0.25)',
        }}>
          {CHECKLIST.map((t, i) => (
            <motion.label key={i}
              initial={{ opacity: 0, x: -8 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.3, delay: i * 0.03 }}
              style={{
                display: 'flex', gap: 12, alignItems: 'flex-start',
                padding: '10px 0',
                borderBottom: i < CHECKLIST.length - 1 ? '1px solid var(--border)' : 'none',
                cursor: 'pointer',
              }}
            >
              <CheckboxToggle />
              <span style={{ fontSize: 13.5, color: 'var(--fg-2)', lineHeight: 1.55 }}>{t}</span>
            </motion.label>
          ))}
        </div>
      </Section>

      {/* CLOSING */}
      <motion.footer
        initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        style={{
          marginTop: 64, paddingTop: 32, borderTop: '1px solid var(--border)',
          textAlign: 'center',
        }}
      >
        <p className="font-aboreto" style={{
          fontSize: 'clamp(1.1rem, 2vw, 1.4rem)', color: 'var(--fg)',
          lineHeight: 1.35, margin: '0 0 16px', letterSpacing: '-0.005em',
        }}>
          Să transformăm antreprenorii prizonieri în lideri liberi.
        </p>
        <p style={{ fontSize: 11, color: 'var(--fg-3)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
          Arhitectura Afacerii · Victor Morar
        </p>
      </motion.footer>
    </article>
  );
};

// Interactive checklist toggle
const CheckboxToggle: React.FC = () => {
  const [on, setOn] = React.useState(false);
  return (
    <span
      onClick={(e) => { e.preventDefault(); setOn(v => !v); }}
      style={{
        width: 18, height: 18, borderRadius: 5, flexShrink: 0, marginTop: 1,
        border: `1.5px solid ${on ? 'var(--gold)' : 'var(--border-hi)'}`,
        background: on ? 'var(--gold)' : 'transparent',
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
        transition: 'all 0.15s',
      }}
    >
      {on && <CheckCircle2 size={12} style={{ color: '#1C1410' }} />}
    </span>
  );
};
