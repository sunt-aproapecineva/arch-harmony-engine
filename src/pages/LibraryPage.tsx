// @ts-nocheck
import React from 'react';
import { useNavigate } from '@/lib/router-compat';
import { motion } from 'framer-motion';
import { BookOpen, Clock, Lock, ArrowRight, Sparkles, FileText, Film, Wrench, Briefcase } from 'lucide-react';
import { LIBRARY_ITEMS, LIBRARY_ACCENT, LibraryItem } from '../lib/libraryData';
import { useAuthContext } from '../context/AuthContext';

const TYPE_ICON: Record<string, React.ReactNode> = {
  article: <FileText size={12} />,
  video: <Film size={12} />,
  tool: <Wrench size={12} />,
  caz: <Briefcase size={12} />,
};
const TYPE_LABEL: Record<string, string> = {
  article: 'Articol',
  video: 'Video',
  tool: 'Instrument',
  caz: 'Studiu de caz',
};

function spanStyle(span: LibraryItem['span']): React.CSSProperties {
  switch (span) {
    case 'feature': return { gridColumn: 'span 2', gridRow: 'span 2' };
    case 'wide':    return { gridColumn: 'span 2' };
    case 'tall':    return { gridRow: 'span 2' };
    default:        return {};
  }
}

const Card: React.FC<{ item: LibraryItem; index: number }> = ({ item, index }) => {
  const navigate = useNavigate();
  const c = LIBRARY_ACCENT[item.accent];
  const isFeature = item.span === 'feature';
  const disabled = !item.available;

  return (
    <motion.button
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: index * 0.07, ease: [0.22, 1, 0.36, 1] }}
      whileHover={disabled ? {} : { y: -3 }}
      onClick={() => !disabled && navigate(`/library/${item.slug}`)}
      style={{
        ...spanStyle(item.span),
        position: 'relative',
        textAlign: 'left',
        cursor: disabled ? 'default' : 'pointer',
        background: 'var(--bg-card)',
        backgroundImage: isFeature
          ? `radial-gradient(120% 100% at 0% 0%, ${c.bg} 0%, transparent 55%)`
          : `linear-gradient(180deg, ${c.bg} 0%, transparent 70%)`,
        border: `1px solid ${disabled ? 'var(--border)' : c.border}`,
        borderRadius: 18,
        padding: isFeature ? '28px 28px 24px' : '20px',
        display: 'flex', flexDirection: 'column',
        minHeight: isFeature ? 280 : 180,
        overflow: 'hidden',
        transition: 'border-color 0.2s, transform 0.2s',
        opacity: disabled ? 0.55 : 1,
        color: 'inherit',
        font: 'inherit',
      }}
      onMouseEnter={e => { if (!disabled) (e.currentTarget as HTMLButtonElement).style.borderColor = c.fg; }}
      onMouseLeave={e => { if (!disabled) (e.currentTarget as HTMLButtonElement).style.borderColor = c.border; }}
    >
      {/* eyebrow / meta row */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
        <span style={{
          display: 'inline-flex', alignItems: 'center', gap: 6,
          padding: '4px 10px', borderRadius: 99,
          background: c.bg, border: `1px solid ${c.border}`,
          fontSize: 10, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase',
          color: c.fg,
        }}>
          {TYPE_ICON[item.type]} {TYPE_LABEL[item.type]}
        </span>
        {disabled ? (
          <Lock size={13} style={{ color: 'var(--fg-3)' }} />
        ) : (
          <ArrowRight size={15} style={{ color: c.fg }} />
        )}
      </div>

      {item.eyebrow && (
        <div className="font-aboreto" style={{
          fontSize: 10, letterSpacing: '0.16em', textTransform: 'uppercase',
          color: 'var(--fg-3)', marginBottom: 8,
        }}>
          {item.eyebrow}
        </div>
      )}

      <h3 className={isFeature ? 'font-aboreto' : ''} style={{
        fontSize: isFeature ? 'clamp(1.4rem, 2.2vw, 1.9rem)' : 16,
        lineHeight: 1.2, color: 'var(--fg)',
        margin: 0, marginBottom: 10, fontWeight: isFeature ? 400 : 600,
        letterSpacing: isFeature ? '-0.01em' : 0,
      }}>
        {item.title}
      </h3>

      <p style={{
        fontSize: isFeature ? 13.5 : 12.5,
        color: 'var(--fg-2)', lineHeight: 1.6, margin: 0,
        flex: 1,
      }}>
        {item.summary}
      </p>

      {/* footer */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 12, marginTop: 16,
        paddingTop: 12, borderTop: `1px solid ${c.border}`,
        fontSize: 11, color: 'var(--fg-3)',
      }}>
        {item.readingTime && (
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}>
            <Clock size={11} /> {item.readingTime}
          </span>
        )}
        {item.topic && (
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}>
            <BookOpen size={11} /> {item.topic}
          </span>
        )}
        {disabled && (
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, marginLeft: 'auto' }}>
            <Sparkles size={11} /> În curând
          </span>
        )}
      </div>
    </motion.button>
  );
};

export const LibraryPage: React.FC = () => {
  const { user } = useAuthContext();
  const isArchitect = user?.tariff === 'arhitect';

  if (!isArchitect) {
    return (
      <div style={{ maxWidth: 600, margin: '0 auto', padding: '64px 24px', textAlign: 'center' }}>
        <Lock size={36} style={{ color: 'var(--gold)', marginBottom: 18 }} />
        <h1 className="font-aboreto" style={{ fontSize: '1.8rem', color: 'var(--fg)', marginBottom: 12, letterSpacing: '-0.01em' }}>
          Biblioteca · Acces Arhitect
        </h1>
        <p style={{ fontSize: 13.5, color: 'var(--fg-2)', lineHeight: 1.7 }}>
          Această secțiune conține materiale bonus disponibile pentru participanții la tariful{' '}
          <strong style={{ color: 'var(--gold)' }}>Arhitect</strong>: lecții suplimentare,
          studii de caz și instrumente care nu fac parte din programa principală.
        </p>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto', padding: '32px 24px 80px' }}>
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, ease: 'easeOut' }}
        style={{ marginBottom: 36 }}
      >
        <div className="font-aboreto" style={{
          fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.16em',
          color: 'var(--fg-3)', marginBottom: 10,
        }}>
          Serie Bonus · Arhitectura Afacerii
        </div>
        <h1 className="font-aboreto" style={{
          fontSize: 'clamp(1.8rem, 4vw, 2.6rem)',
          color: 'var(--fg)', lineHeight: 1.1, letterSpacing: '-0.01em', marginBottom: 12,
        }}>
          Biblioteca
        </h1>
        <p style={{ fontSize: 14, color: 'var(--fg-2)', lineHeight: 1.7, maxWidth: 580 }}>
          Materiale suplimentare, dincolo de programă. Lecții, sesiuni live, instrumente și studii
          de caz care îți ajută înțelegerea sistemelor de afacere — disponibile exclusiv pentru
          participanții la tariful Arhitect.
        </p>
      </motion.div>

      {/* Bento grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
        gridAutoRows: '180px',
        gap: 16,
      }}>
        {LIBRARY_ITEMS.map((item, i) => (
          <Card key={item.slug} item={item} index={i} />
        ))}
      </div>
    </div>
  );
};
