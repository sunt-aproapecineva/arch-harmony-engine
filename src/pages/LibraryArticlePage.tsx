// @ts-nocheck
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from '@/lib/router-compat';
import { motion, useScroll, useSpring } from 'framer-motion';
import { ArrowLeft, Clock, BookOpen, Quote, AlertTriangle, CheckCircle2, XCircle, Target, Users, TrendingDown, Layers, ListChecks } from 'lucide-react';
import { useAuthContext } from '../context/AuthContext';
import { getLibraryItem } from '../lib/libraryData';
import { HiringArticle } from './library/articles/HiringArticle';
import { MiroFluxuriArticle } from './library/articles/MiroFluxuriArticle';

const REGISTRY: Record<string, React.FC> = {
  'cum-angajam-corect': HiringArticle,
  'ghid-miro-fluxuri': MiroFluxuriArticle,
};

export const LibraryArticlePage: React.FC = () => {
  const { slug } = useParams() as { slug: string };
  const navigate = useNavigate();
  const { user } = useAuthContext();
  const item = getLibraryItem(slug);
  const Article = REGISTRY[slug];

  // Reading progress bar
  const { scrollYProgress } = useScroll();
  const progress = useSpring(scrollYProgress, { stiffness: 120, damping: 30 });

  useEffect(() => { window.scrollTo({ top: 0 }); }, [slug]);

  if (user?.tariff !== 'arhitect') {
    return (
      <div style={{ padding: '64px 24px', textAlign: 'center' }}>
        <h2 style={{ color: 'var(--fg)' }}>Acces restricționat</h2>
        <p style={{ color: 'var(--fg-3)', marginTop: 8 }}>Biblioteca este disponibilă pentru tariful Arhitect.</p>
      </div>
    );
  }

  if (!item || !Article) {
    return (
      <div style={{ padding: '64px 24px', textAlign: 'center' }}>
        <h2 style={{ color: 'var(--fg)' }}>Material indisponibil</h2>
        <button onClick={() => navigate('/library')} style={{
          marginTop: 16, padding: '8px 16px', borderRadius: 8,
          background: 'var(--bg-3)', border: '1px solid var(--border)', color: 'var(--fg-2)', cursor: 'pointer',
        }}>
          Înapoi la Bibliotecă
        </button>
      </div>
    );
  }

  return (
    <>
      {/* Sticky reading progress */}
      <motion.div style={{
        position: 'fixed', top: 0, left: 0, right: 0, height: 2,
        background: 'var(--gold)', transformOrigin: '0%', scaleX: progress,
        zIndex: 60,
      }} />

      <div style={{ background: 'var(--bg)', minHeight: '100vh' }}>
        {/* Back link */}
        <div style={{ maxWidth: 760, margin: '0 auto', padding: '24px 24px 0' }}>
          <button onClick={() => navigate('/library')} style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            background: 'transparent', border: 'none', cursor: 'pointer',
            color: 'var(--fg-3)', fontSize: 12, padding: 0,
          }}
            onMouseEnter={e => (e.currentTarget.style.color = 'var(--gold)')}
            onMouseLeave={e => (e.currentTarget.style.color = 'var(--fg-3)')}
          >
            <ArrowLeft size={13} /> Biblioteca
          </button>
        </div>

        <Article />
      </div>
    </>
  );
};

// ─── Shared building blocks used by article components ────────────────────────

export const Section: React.FC<{ children: React.ReactNode; id?: string }> = ({ children, id }) => (
  <motion.section
    id={id}
    initial={{ opacity: 0, y: 24 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, margin: '-80px' }}
    transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
    style={{ margin: '56px 0' }}
  >
    {children}
  </motion.section>
);

export const SectionHeader: React.FC<{ kicker: string; title: string; icon?: React.ReactNode }> = ({ kicker, title, icon }) => (
  <div style={{ marginBottom: 28, display: 'flex', alignItems: 'flex-start', gap: 14 }}>
    {icon && (
      <div style={{
        width: 40, height: 40, borderRadius: 10, flexShrink: 0,
        background: 'var(--gold-dim)', border: '1px solid rgba(201,169,110,0.3)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        color: 'var(--gold)',
      }}>{icon}</div>
    )}
    <div>
      <div className="font-aboreto" style={{
        fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.18em',
        color: 'var(--gold)', marginBottom: 6,
      }}>
        {kicker}
      </div>
      <h2 className="font-aboreto" style={{
        fontSize: 'clamp(1.4rem, 2.6vw, 2rem)', color: 'var(--fg)',
        margin: 0, lineHeight: 1.15, letterSpacing: '-0.01em', fontWeight: 400,
      }}>
        {title}
      </h2>
    </div>
  </div>
);

export const Lead: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <p style={{ fontSize: 15, color: 'var(--fg-2)', lineHeight: 1.75, marginBottom: 28 }}>
    {children}
  </p>
);

export const Pull: React.FC<{ children: React.ReactNode; accent?: 'gold' | 'green' | 'red' }> = ({ children, accent = 'gold' }) => {
  const color = accent === 'gold' ? '#C9A96E' : accent === 'green' ? '#7ad6a6' : '#e08585';
  return (
    <motion.blockquote
      initial={{ opacity: 0, scale: 0.97 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.45 }}
      style={{
        margin: '32px 0',
        padding: '24px 28px',
        borderLeft: `3px solid ${color}`,
        background: 'linear-gradient(90deg, rgba(201,169,110,0.07), transparent)',
        borderRadius: '0 12px 12px 0',
      }}
    >
      <Quote size={18} style={{ color, marginBottom: 10, opacity: 0.7 }} />
      <p className="font-aboreto" style={{
        fontSize: 'clamp(1.05rem, 1.6vw, 1.25rem)',
        color: 'var(--fg)', lineHeight: 1.45, margin: 0, letterSpacing: '-0.005em',
      }}>
        {children}
      </p>
    </motion.blockquote>
  );
};

export const Card: React.FC<{
  number?: string | number;
  title: string;
  children: React.ReactNode;
  tone?: 'neutral' | 'warn' | 'good';
}> = ({ number, title, children, tone = 'neutral' }) => {
  const tones = {
    neutral: { border: 'var(--border)', accent: 'var(--gold)', bg: 'var(--bg-card)' },
    warn:    { border: 'rgba(224,133,133,0.25)', accent: '#e08585', bg: 'rgba(139,26,26,0.05)' },
    good:    { border: 'rgba(122,214,166,0.25)', accent: '#7ad6a6', bg: 'rgba(26,92,56,0.05)' },
  }[tone];

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4 }}
      style={{
        padding: 22, borderRadius: 14,
        background: tones.bg,
        border: `1px solid ${tones.border}`,
        position: 'relative', overflow: 'hidden',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 12, marginBottom: 10 }}>
        {number !== undefined && (
          <span className="font-aboreto" style={{
            fontSize: 11, letterSpacing: '0.15em', color: tones.accent, fontWeight: 600,
          }}>
            {String(number).padStart(2, '0')}
          </span>
        )}
        <h3 className="font-aboreto" style={{
          fontSize: 15, color: 'var(--fg)', margin: 0, fontWeight: 500, letterSpacing: '0.005em',
        }}>
          {title}
        </h3>
      </div>
      <div style={{ fontSize: 13.5, color: 'var(--fg-2)', lineHeight: 1.65 }}>
        {children}
      </div>
    </motion.div>
  );
};

export const Grid: React.FC<{ children: React.ReactNode; min?: number }> = ({ children, min = 260 }) => (
  <div style={{
    display: 'grid',
    gridTemplateColumns: `repeat(auto-fit, minmax(${min}px, 1fr))`,
    gap: 14,
  }}>
    {children}
  </div>
);

// re-export icons used by articles
export { AlertTriangle, CheckCircle2, XCircle, Target, Users, TrendingDown, Layers, ListChecks, Clock, BookOpen };
