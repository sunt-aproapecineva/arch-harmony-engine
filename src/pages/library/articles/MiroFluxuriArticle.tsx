// @ts-nocheck
import React from 'react';
import { motion } from 'framer-motion';
import {
  Section, SectionHeader, Lead, Pull, Card, Grid,
  Layers, ListChecks, Target, Clock, BookOpen, CheckCircle2,
} from '../../LibraryArticlePage';

const PREP = [
  { n: 1, title: 'Rolurile implicate', body: 'Fiecare rol = o coloană verticală. Dacă ai 4 roluri, ai 4 coloane.' },
  { n: 2, title: 'Acțiuni în paralel?', body: 'Uită-te în SOP. Sunt pași care pot merge simultan? Marchează-i clar.' },
  { n: 3, title: 'Liniar sau Decizional?', body: 'Liniar: toți parcurg același drum. Decizional: există un punct unde drumul se ramifică.' },
];

const LINEAR_STEPS = [
  { n: 1, title: 'Deschide Miro și copiază template-ul', body: 'Intri pe miro.com, conectezi contul. "+" → "New board" și cauți template-ul "Flowchart", sau deschizi board-ul primit. Apeși "Use template" / "Duplicate" — nu lucra în original.' },
  { n: 2, title: 'Adaugă coloanele pentru roluri', body: 'Fiecare rol = o coloană. Dublu-click pe titlul coloanei și scrii numele rolului. Culori recomandate: Verde — proprietar/CEO, Albastru — coordonator, Portocaliu — specialist, Gri — extern.' },
  { n: 3, title: 'Adaugă blocurile cu acțiunile', body: 'Tasta R sau iconița de forme → desenezi dreptunghiuri în coloana rolului care execută acțiunea. Dublu-click și scrii scurt și concret („Filmează lecția", „Editează video"). Detaliile rămân în SOP.' },
  { n: 4, title: 'Conectează blocurile cu săgeți', body: 'Treci cu mouse-ul peste un bloc → apar puncte albastre. Tragi din punctul de jos către blocul următor. Sageți verticale pentru ordinea în aceeași coloană, orizontale pentru transmiterea către alt rol.' },
  { n: 5, title: 'Marchează paralelele', body: 'Acțiunile simultane → la același nivel pe verticală în coloane diferite. Adaugi o linie punctată sau un sticky note „Merg simultan".' },
  { n: 6, title: 'Criteriul de calitate la final', body: 'Bloc verde la finalul fluxului cu „Criteriu de calitate" / „Checkpoint final" — 2-3 condiții care confirmă că procesul a mers bine.' },
];

const DECISION_STEPS = [
  { n: 5, title: 'Nodul de decizie — rombul', body: 'În punctul de decizie adaugi un romb (Shape → Diamond/Rhombus). Înăuntru scrii întrebarea: „Clientul e interesat?", „Plătește?". Folosește portocaliu pentru vizibilitate.' },
  { n: 6, title: 'Ramurile DA și NU', body: 'Din romb ies două săgeți: una etichetată „DA" → varianta pozitivă, alta „NU" / „Obiecție" → varianta alternativă. Dublu-click pe săgeată ca să scrii eticheta.' },
  { n: 7, title: 'Construiește fiecare ramură separat', body: 'Ramura DA: pașii când clientul e interesat. Ramura NU: pașii de gestionare a obiecției. Pot converge la final într-un bloc comun. Nu mai mult de 2 niveluri de decizie într-un singur flux.' },
];

const CHECKLIST = [
  'Fiecare rol implicat are propria coloană.',
  'Fiecare acțiune e într-un bloc clar, în coloana rolului responsabil.',
  'Săgețile arată ordinea corectă.',
  'Paralelele sunt marcate vizibil.',
  'Fluxul spune același lucru ca SOP-ul — nu mai mult, nu mai puțin.',
  'Criteriul de calitate e la final.',
];

const FAQ = [
  { q: 'Cum șterg un element?', a: 'Îl selectezi cu click și apeși Delete sau Backspace.' },
  { q: 'Cum mut un bloc între coloane?', a: 'Selectezi, ții apăsat și tragi. Săgețile se actualizează automat.' },
  { q: 'Nu îmi apare rombul în forme.', a: 'Caută „Shape" în bara stângă sau apasă C și caută „diamond".' },
  { q: 'Fluxul e prea aglomerat.', a: 'Mărești zoom-ul cu Ctrl+scroll sau faci coloanele mai late.' },
  { q: 'Cum adaug o coloană nouă?', a: 'Copiezi o coloană existentă (Ctrl+C, Ctrl+V) și schimbi titlul și culoarea.' },
  { q: 'Pot lucra în echipă?', a: 'Da. Share → „Can edit" și toți pot edita simultan.' },
];

export const MiroFluxuriArticle: React.FC = () => {
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
          Ghid · Săptămâna 4 · Bibliotecă
        </div>
        <h1 className="font-aboreto" style={{
          fontSize: 'clamp(1.8rem, 4vw, 2.8rem)', lineHeight: 1.1, letterSpacing: '-0.015em',
          color: 'var(--fg)', marginBottom: 16, fontWeight: 400,
        }}>
          Ghid Miro · Cum construiești un flux vizual pas cu pas
        </h1>
        <p style={{ fontSize: 15, color: 'var(--fg-2)', lineHeight: 1.6, marginBottom: 20 }}>
          Treci SOP-ul din Lecția 9 într-un flux vizual pe coloane per rol. 30-45 de minute, cont Miro gratuit, SOP-ul tău documentat în față.
        </p>
        <div style={{ display: 'flex', gap: 22, flexWrap: 'wrap', fontSize: 12, color: 'var(--fg-3)' }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}><Clock size={13} /> 30–45 minute</span>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}><BookOpen size={13} /> miro.com (cont gratuit)</span>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}><Target size={13} /> Necesar: SOP din Exercițiul „Primul SOP documentat"</span>
        </div>
      </motion.header>

      {/* A. Pregătire */}
      <Section>
        <SectionHeader kicker="A · Înainte de Miro" title="Pregătire — 3 lucruri de clarificat" icon={<ListChecks size={20} />} />
        <Lead>Înainte să deschizi board-ul, clarifici 3 lucruri din SOP-ul tău:</Lead>
        <Grid min={240}>
          {PREP.map(p => <Card key={p.n} number={p.n} title={p.title}>{p.body}</Card>)}
        </Grid>
      </Section>

      {/* B. Flux liniar */}
      <Section>
        <SectionHeader kicker="B · Flux liniar" title="Pașii pentru un flux LINIAR" icon={<Layers size={20} />} />
        <Lead>Pentru procese de producție, livrare, onboarding. Un singur fir de execuție, cu sau fără paralele.</Lead>
        <Grid min={280}>
          {LINEAR_STEPS.map(s => <Card key={s.n} number={s.n} title={s.title}>{s.body}</Card>)}
        </Grid>
        <Pull accent="green">Detaliile rămân în SOP. În Miro pui doar acțiunea — scurt și concret.</Pull>
      </Section>

      {/* C. Flux decizional */}
      <Section>
        <SectionHeader kicker="C · Flux decizional" title="Pașii pentru un flux DECIZIONAL" icon={<Layers size={20} />} />
        <Lead>Pentru scripturi de vânzare, gestionare obiecții, procese de aprobare, escaladare. Pașii 1–4 sunt identici cu fluxul liniar. Diferența apare la punctul de decizie.</Lead>
        <Grid min={280}>
          {DECISION_STEPS.map(s => <Card key={s.n} number={s.n} title={s.title} tone="warn">{s.body}</Card>)}
        </Grid>
      </Section>

      {/* D. Finalizare */}
      <Section>
        <SectionHeader kicker="D · Finalizare" title="Verifică și partajează" icon={<CheckCircle2 size={20} />} />
        <Lead>Checklist înainte să dai fluxul echipei:</Lead>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 24 }}>
          {CHECKLIST.map((item, i) => (
            <div key={i} style={{
              display: 'flex', gap: 12, padding: '12px 16px',
              background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 10,
            }}>
              <CheckCircle2 size={16} style={{ color: '#7ad6a6', flexShrink: 0, marginTop: 2 }} />
              <span style={{ fontSize: 13.5, color: 'var(--fg-2)', lineHeight: 1.6 }}>{item}</span>
            </div>
          ))}
        </div>
        <Grid min={260}>
          <Card title="Partajare prin link">
            Share (dreapta sus) → „Can view" sau „Can edit" → copiezi link-ul → îl pui în Google Drive sau îl trimiți echipei.
          </Card>
          <Card title="Export imagine">
            „..." (dreapta sus) → Export → PNG sau PDF → salvezi în Google Drive, folderul <em>03 Instalațiile</em>.
          </Card>
          <Card title="Index linkuri Miro">
            În Drive (folderul 03 Instalațiile), creezi un Google Docs „Linkuri Miro — Fluxuri" cu numele procesului, link-ul și data — toate fluxurile într-un singur loc.
          </Card>
        </Grid>
      </Section>

      {/* E. FAQ */}
      <Section>
        <SectionHeader kicker="E · Întrebări frecvente" title="Răspunsuri rapide" />
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {FAQ.map((f, i) => (
            <div key={i} style={{
              padding: '14px 18px', borderRadius: 12,
              background: 'var(--bg-card)', border: '1px solid var(--border)',
            }}>
              <div className="font-aboreto" style={{ fontSize: 12, color: 'var(--gold)', marginBottom: 6, letterSpacing: '0.04em' }}>{f.q}</div>
              <div style={{ fontSize: 13.5, color: 'var(--fg-2)', lineHeight: 1.6 }}>{f.a}</div>
            </div>
          ))}
        </div>
        <Pull>Dacă te blochezi — notezi întrebarea și o aduci la sesiunea live. Fluxul nu trebuie să fie perfect din prima.</Pull>
      </Section>
    </article>
  );
};
