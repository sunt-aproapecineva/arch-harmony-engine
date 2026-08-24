// @ts-nocheck
// Panoul stâng al paginilor de autentificare.
//
// Structura urmează reperul cerut (erou pe stânga, formular pe dreapta), dar conținutul
// e al brandului: fără videoclip extern, fără culori din alt sistem. Vizualul e desenat
// din tokeni — un plan de arhitectură, metafora pe care e construit tot programul
// (Proiectul Casei, Fundația, Pereții Portanți, Instalațiile…).
import React, { useEffect, useRef, useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { Check } from 'lucide-react';

/**
 * Aceleași trei videoclipuri ca pe pagina de prezentare, în aceeași ordine.
 * Continuitatea contează: omul vine de pe landing și regăsește exact imaginea și
 * promisiunea care l-au adus aici.
 */
const HERO_SLIDES = [
  'https://res.cloudinary.com/dvhjqysr4/video/upload/v1783005948/SEEDANCE_PROMPT___s__mcaff0.mp4',
  'https://res.cloudinary.com/dvhjqysr4/video/upload/v1783005948/SEEDANCE_PROMPT___s__2_sedeoq.mp4',
  'https://res.cloudinary.com/dvhjqysr4/video/upload/v1783005947/SEEDANCE_PROMPT___s__1_on4h6u.mp4',
];

/** Cuvântul care se schimbă odată cu fiecare videoclip. Aceeași ordine ca slide-urile. */
const ROTATING_WORDS = ['liniște', 'timp', 'ordine'];

/** Dacă `ended` nu vine (buffer, stream lent), avansăm oricum. */
const FALLBACK_MS = 9000;

export interface HeroStep {
  label: string;
  state: 'done' | 'active' | 'todo';
}

interface AuthHeroProps {
  eyebrow?: string;
  title: React.ReactNode;
  subtitle: string;
  steps: HeroStep[];
  footnote?: string;
  /** Rulează slideshow-ul de pe landing, cu titlul al cărui ultim cuvânt se rotește. */
  film?: boolean;
}

export const AuthHero: React.FC<AuthHeroProps> = ({ eyebrow, title, subtitle, steps, footnote, film = false }) => {
  const reduce = useReducedMotion();
  // Panoul e ascuns prin CSS sub 1024px, dar `display: none` NU oprește preîncărcarea
  // videoclipurilor: pe telefon s-ar consuma trafic pentru ceva ce nu se vede.
  const wide = useMinWidth(1024);
  const playing = film && wide && !reduce;
  const slide = useHeroSlideshow(playing);

  /** Intrare eșalonată, fiecare element cu întârzierea lui. */
  const rise = (i: number) => ({
    initial: reduce ? false : { opacity: 0, y: 10 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.5, delay: reduce ? 0 : 0.15 + i * 0.12, ease: [0.22, 1, 0.36, 1] as const },
  });

  return (
    <aside
      className="aa-auth-hero"
      style={{
        position: 'relative', width: '52%', flexShrink: 0,
        // `display` e controlat de clasă (.aa-auth-hero), nu inline: altfel stilul
        // inline ar învinge media query-ul și panoul ar apărea și pe telefon.
        flexDirection: 'column', justifyContent: 'flex-end',
        padding: 'clamp(32px, 4vw, 56px)', borderRadius: 24, overflow: 'hidden',
        background: 'var(--bg-2)', border: '1px solid var(--border)',
      }}
    >
      {/* Slideshow-ul de pe landing. Nu pornește la mișcare redusă — atunci rămâne
          planul desenat, care e oricum stratul de bază. */}
      {playing && HERO_SLIDES.map((src, k) => (
        <video
          key={src}
          ref={slide.register(k)}
          src={src}
          aria-hidden
          muted
          playsInline
          // Doar clipul curent și următorul se descarcă. Trei descărcări simultane
          // concurează pentru bandă și niciunul nu ajunge redabil la timp. Controlăm
          // preîncărcarea, nu `src` — scoaterea lui poate goli cadrul deja afișat.
          preload={slide.shouldLoad(k) ? 'auto' : 'none'}
          autoPlay={k === 0}
          onEnded={() => slide.onEnded(k)}
          style={{
            position: 'absolute', inset: 0, width: '100%', height: '100%',
            objectFit: 'cover', pointerEvents: 'none',
            opacity: k === slide.index ? 1 : 0,
            transform: k === slide.index ? 'scale(1)' : 'scale(1.045)',
            transition: 'opacity 1.4s ease, transform 1.4s ease',
            willChange: 'opacity',
          }}
        />
      ))}

      {/* Voal de lizibilitate. Reperul cerea video fără mască, dar acolo nu era text
          peste el — aici sunt titlul și pașii, care trebuie să rămână citibili
          indiferent de cadrul care rulează. Folosim fundalul din tokeni, nu negru. */}
      <div aria-hidden style={{
        position: 'absolute', inset: 0, pointerEvents: 'none',
        background: 'linear-gradient(105deg, var(--bg) 0%, rgba(0,0,0,0.55) 45%, rgba(0,0,0,0.25) 100%)',
      }} />

      <Blueprint />

      <div aria-hidden style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
        <div className="dash-glow" style={{ width: 460, height: 460, top: '-18%', left: '-12%', background: 'var(--accent-glow)' }} />
        <div className="dash-glow" style={{ width: 380, height: 380, bottom: '-14%', right: '-10%', background: 'var(--gold-dim)' }} />
      </div>

      <div style={{ position: 'relative', zIndex: 1, width: '100%', maxWidth: 460, display: 'flex', flexDirection: 'column', gap: 28 }}>
        <motion.div {...rise(0)} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 30, height: 30, borderRadius: 8, display: 'grid', placeItems: 'center',
            background: 'var(--accent-dim)', border: '1px solid var(--border-hi)',
          }}>
            <span className="font-aboreto" style={{ fontSize: 11, color: 'var(--accent)', letterSpacing: 1 }}>AA</span>
          </div>
          <span className="font-aboreto" style={{ fontSize: 12, letterSpacing: '0.16em', color: 'var(--fg-2)' }}>
            ARHITECTURA AFACERII
          </span>
        </motion.div>

        <motion.div {...rise(1)}>
          {eyebrow && (
            <p style={{ fontSize: 11, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--gold)', marginBottom: 12 }}>
              {eyebrow}
            </p>
          )}
          <h2 className="font-aboreto" style={{
            fontSize: film ? 'clamp(1.5rem, 2.3vw, 2.15rem)' : 'clamp(1.7rem, 2.6vw, 2.4rem)',
            color: 'var(--fg)', lineHeight: 1.14, letterSpacing: '-0.02em', margin: 0,
            textWrap: 'balance',
          }}>
            {film && wide ? (
              <>
                Hai să construim afaceri,<br />care îți oferă{' '}
                <span key={slide.index} aria-label={slide.word} style={{ color: 'var(--gold)', display: 'inline-block', whiteSpace: 'nowrap' }}>
                  {slide.word.split('').map((ch, k) => (
                    <span key={k} className="aa-wf-letter" style={{ display: 'inline-block', animationDelay: `${k * 0.04}s` }}>{ch}</span>
                  ))}
                </span>.
              </>
            ) : title}
          </h2>
          <p style={{ fontSize: 14, color: 'var(--fg-3)', lineHeight: 1.7, marginTop: 14, maxWidth: 360 }}>
            {subtitle}
          </p>
        </motion.div>

        <motion.ol {...rise(2)} style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: 8 }}>
          {steps.map((s, i) => (
            <StepItem key={s.label} number={i + 1} label={s.label} state={s.state} />
          ))}
        </motion.ol>

        {footnote && (
          <motion.p {...rise(3)} style={{ fontSize: 12, color: 'var(--fg-3)', lineHeight: 1.65, margin: 0, maxWidth: 380 }}>
            {footnote}
          </motion.p>
        )}
      </div>
    </aside>
  );
};

/** Un pas din parcurs. Cel activ e plin, ca să se vadă de la distanță unde ești. */
const StepItem: React.FC<{ number: number; label: string; state: HeroStep['state'] }> = ({ number, label, state }) => {
  const active = state === 'active';
  const done = state === 'done';
  return (
    <li style={{
      display: 'flex', alignItems: 'center', gap: 12,
      padding: '11px 14px', borderRadius: 12,
      background: active ? 'var(--accent)' : 'var(--bg-3)',
      border: `1px solid ${active ? 'var(--accent)' : 'var(--border)'}`,
      transition: 'background 0.25s, border-color 0.25s',
    }}>
      <span style={{
        width: 22, height: 22, borderRadius: '50%', flexShrink: 0,
        display: 'grid', placeItems: 'center', fontSize: 11, fontWeight: 700,
        background: active ? 'var(--bg)' : done ? 'var(--ok-dim)' : 'var(--bg-4)',
        color: active ? 'var(--accent)' : done ? 'var(--ok)' : 'var(--fg-3)',
      }}>
        {done ? <Check size={12} /> : number}
      </span>
      <span style={{
        fontSize: 13, fontWeight: active ? 600 : 400,
        color: active ? 'var(--bg)' : done ? 'var(--fg-2)' : 'var(--fg-3)',
      }}>
        {label}
      </span>
    </li>
  );
};

/**
 * Fundalul: un plan de arhitectură în linii subțiri.
 * Înlocuiește videoclipul din reper — e al brandului, se încarcă instant, arată la fel
 * offline și nu depinde de contul altcuiva.
 */
const Blueprint: React.FC = () => (
  <svg
    aria-hidden
    viewBox="0 0 600 700"
    preserveAspectRatio="xMidYMid slice"
    style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', opacity: 0.35, pointerEvents: 'none' }}
  >
    <defs>
      <pattern id="aa-grid" width="28" height="28" patternUnits="userSpaceOnUse">
        <path d="M28 0H0V28" fill="none" stroke="var(--border-hi)" strokeWidth="1" />
      </pattern>
      <linearGradient id="aa-fade" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="white" stopOpacity="0.85" />
        <stop offset="68%" stopColor="white" stopOpacity="0.14" />
        <stop offset="100%" stopColor="white" stopOpacity="0" />
      </linearGradient>
      <mask id="aa-mask"><rect width="600" height="700" fill="url(#aa-fade)" /></mask>
    </defs>

    <g mask="url(#aa-mask)">
      <rect width="600" height="700" fill="url(#aa-grid)" />
      <g fill="none" stroke="var(--accent)" strokeWidth="1.5" strokeLinejoin="round">
        <path d="M300 96 L512 236 L512 520 L88 520 L88 236 Z" strokeOpacity="0.3" />
        <path d="M88 236 L300 96 L512 236" strokeOpacity="0.45" />
        <path d="M88 316 H512" strokeOpacity="0.16" />
        <path d="M88 388 H512" strokeOpacity="0.16" />
        <path d="M88 452 H512" strokeOpacity="0.16" />
        <path d="M232 452 V520 H368 V452" strokeOpacity="0.3" />
        <rect x="150" y="336" width="62" height="42" strokeOpacity="0.2" />
        <rect x="388" y="336" width="62" height="42" strokeOpacity="0.2" />
      </g>
      <g fill="none" stroke="var(--gold)" strokeWidth="1">
        <path d="M88 520 H512" strokeOpacity="0.32" />
        <path d="M64 546 H536" strokeOpacity="0.16" />
      </g>
    </g>
  </svg>
);

/**
 * Rotația videoclipurilor și a cuvântului.
 * Avansează când se termină clipul curent; dacă `ended` întârzie (buffer), un
 * temporizator de rezervă îl împinge oricum mai departe.
 */
function useHeroSlideshow(enabled: boolean) {
  const [index, setIndex] = useState(0);
  const refs = useRef<(HTMLVideoElement | null)[]>([]);

  useEffect(() => {
    if (!enabled) return;
    refs.current.forEach((el, k) => { if (el && k !== index) el.pause(); });
    const current = refs.current[index];
    if (current) {
      current.currentTime = 0;
      current.play().catch(() => { /* autoplay refuzat — rămâne cadrul static */ });
    }
    const t = setTimeout(() => setIndex(p => (p + 1) % HERO_SLIDES.length), FALLBACK_MS);
    return () => clearTimeout(t);
  }, [index, enabled]);

  const next = (index + 1) % HERO_SLIDES.length;
  return {
    index,
    word: ROTATING_WORDS[index % ROTATING_WORDS.length] || '',
    shouldLoad: (k: number) => k === index || k === next,
    register: (k: number) => (el: HTMLVideoElement | null) => { refs.current[k] = el; },
    onEnded: (k: number) => { if (k === index) setIndex(p => (p + 1) % HERO_SLIDES.length); },
  };
}

/** True cât timp fereastra e cel puțin de lățimea dată. Sigur la randarea pe server. */
function useMinWidth(px: number): boolean {
  const [ok, setOk] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia(`(min-width: ${px}px)`);
    const sync = () => setOk(mq.matches);
    sync();
    mq.addEventListener('change', sync);
    return () => mq.removeEventListener('change', sync);
  }, [px]);
  return ok;
}
