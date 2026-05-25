import React from 'react';
import { useNavigate } from '@/lib/router-compat';
import { motion } from 'framer-motion';
import { Lock, CheckCircle2, ChevronRight, BookOpen, Pencil } from 'lucide-react';
import { Module } from '../../lib/types';

interface Props {
  module: Module;
  progress: number;
  locked: boolean;
  active: boolean;
  index: number;
}

export const ModuleCard: React.FC<Props> = ({ module: mod, progress, locked, active, index }) => {
  const navigate = useNavigate();
  const done = progress === 100;

  const borderColor = done
    ? 'rgba(74,222,128,0.4)'
    : active
    ? 'rgba(196,240,228,0.3)'
    : 'var(--border)';

  const statusColor = done ? '#4ade80' : active ? 'var(--accent)' : 'var(--gold)';

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.06 }}
      whileHover={!locked ? { y: -2 } : undefined}
      onClick={() => !locked && navigate(`/module/${mod.id}`)}
      style={{
        background: 'var(--bg-card)',
        border: `1px solid ${borderColor}`,
        borderRadius: 16,
        padding: 20,
        cursor: locked ? 'not-allowed' : 'pointer',
        opacity: locked ? 0.55 : 1,
        position: 'relative',
        overflow: 'hidden',
        transition: 'border-color 0.2s, box-shadow 0.2s',
        boxShadow: active ? '0 0 0 1px rgba(196,240,228,0.1)' : 'none',
      }}
      onMouseEnter={e => {
        if (!locked) (e.currentTarget as HTMLDivElement).style.boxShadow = 'var(--shadow)';
      }}
      onMouseLeave={e => {
        (e.currentTarget as HTMLDivElement).style.boxShadow = active ? '0 0 0 1px rgba(196,240,228,0.1)' : 'none';
      }}
    >
      {/* Ghost number */}
      <div
        className="font-aboreto"
        style={{
          position: 'absolute', right: -4, bottom: -12, fontSize: 88, lineHeight: 1,
          color: 'rgba(255,255,255,0.03)', fontWeight: 800, userSelect: 'none', pointerEvents: 'none',
        }}
      >
        {mod.order_index}
      </div>

      <div style={{ position: 'relative', zIndex: 1 }}>
        {/* Top row */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
            <span style={{
              fontSize: 10, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase',
              color: statusColor,
              background: `${statusColor}18`,
              border: `1px solid ${statusColor}30`,
              padding: '2px 8px', borderRadius: 99,
            }}>
              {mod.etapa}
            </span>
            {active && !done && (
              <span style={{
                fontSize: 10, color: 'var(--accent)', background: 'var(--accent-dim)',
                border: '1px solid rgba(196,240,228,0.2)', padding: '2px 8px', borderRadius: 99, fontWeight: 600,
              }}>
                ÎN CURS
              </span>
            )}
          </div>
          <div style={{ flexShrink: 0 }}>
            {locked
              ? <Lock size={14} style={{ color: 'var(--fg-3)' }} />
              : done
              ? <CheckCircle2 size={16} style={{ color: '#4ade80' }} />
              : <ChevronRight size={16} style={{ color: 'var(--fg-3)' }} />
            }
          </div>
        </div>

        {/* Title */}
        <h3 className="font-aboreto" style={{ fontSize: 17, color: 'var(--fg)', letterSpacing: '-0.01em', marginBottom: 4, lineHeight: 1.2 }}>
          {mod.title}
        </h3>
        <p style={{ fontSize: 12, color: 'var(--fg-3)', marginBottom: 14 }}>{mod.subtitle}</p>

        {/* Meta */}
        <div style={{ display: 'flex', gap: 14, marginBottom: 14 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 11, color: 'var(--fg-3)' }}>
            <BookOpen size={12} />{mod.lessons.length} lecții
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 11, color: 'var(--fg-3)' }}>
            <Pencil size={12} />{mod.exercises.length} exerciții
          </div>
        </div>

        {/* Progress bar */}
        <div style={{ height: 3, background: 'var(--border)', borderRadius: 2, overflow: 'hidden', marginBottom: 10 }}>
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.8, delay: index * 0.06 + 0.2, ease: 'easeOut' }}
            style={{
              height: '100%',
              background: done ? '#4ade80' : active ? 'var(--accent)' : 'var(--fg-3)',
              borderRadius: 2,
            }}
          />
        </div>

        {/* CTA button row */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
          {locked ? (
            <div
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 6,
                padding: '6px 14px', borderRadius: 8, fontSize: 11, fontWeight: 600,
                background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
                color: 'var(--fg-3)', cursor: 'not-allowed', userSelect: 'none',
              }}
            >
              <Lock size={11} />
              {mod.unlockDate
                ? `Se deblochează ${new Date(mod.unlockDate).toLocaleDateString('ro-RO', { day: 'numeric', month: 'short' })}`
                : 'Indisponibil'}
            </div>
          ) : (
            <div
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 5,
                padding: '6px 14px', borderRadius: 8, fontSize: 11, fontWeight: 700,
                background: done ? 'rgba(74,222,128,0.1)' : 'rgba(196,240,228,0.1)',
                border: `1px solid ${done ? 'rgba(74,222,128,0.25)' : 'rgba(196,240,228,0.25)'}`,
                color: done ? '#4ade80' : 'var(--accent)',
              }}
            >
              {done ? 'Revizuiește' : 'Continuă'}
              <ChevronRight size={11} />
            </div>
          )}
          <span style={{ fontSize: 10, color: 'var(--fg-3)' }}>{mod.saptamana}</span>
        </div>
      </div>
    </motion.div>
  );
};
