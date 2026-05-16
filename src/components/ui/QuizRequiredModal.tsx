import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from '@/lib/router-compat';
import { ClipboardList, X, ArrowRight, Lock } from 'lucide-react';

interface Props { open: boolean; onClose: () => void; }

export const QuizRequiredModal: React.FC<Props> = ({ open, onClose }) => {
  const navigate = useNavigate();
  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={onClose}
            style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', zIndex: 100, backdropFilter: 'blur(4px)' }}
          />
          {/* Modal card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.88, y: 24 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 12 }}
            transition={{ type: 'spring', damping: 24, stiffness: 300 }}
            style={{
              position: 'fixed', top: '50%', left: '50%',
              transform: 'translate(-50%, -50%)',
              zIndex: 101, width: '90%', maxWidth: 440,
              background: 'var(--bg-3)', borderRadius: 24,
              border: '1px solid var(--border-hi)',
              boxShadow: '0 32px 80px rgba(0,0,0,0.6)',
              padding: '36px 32px',
              textAlign: 'center',
            }}
          >
            {/* Close */}
            <button onClick={onClose} style={{ position: 'absolute', top: 16, right: 16, background: 'none', border: 'none', cursor: 'pointer', color: 'var(--fg-3)', padding: 4, borderRadius: 8, display: 'flex', alignItems: 'center', transition: 'color 0.15s' }}
              onMouseEnter={e => e.currentTarget.style.color = 'var(--fg)'}
              onMouseLeave={e => e.currentTarget.style.color = 'var(--fg-3)'}
            >
              <X size={16} />
            </button>

            {/* Icon */}
            <div style={{ width: 64, height: 64, borderRadius: 18, background: 'rgba(196,240,228,0.1)', border: '1px solid rgba(196,240,228,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
              <ClipboardList size={28} style={{ color: 'var(--accent)' }} />
            </div>

            {/* Lock badge */}
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 10, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--gold)', background: 'var(--gold-dim)', border: '1px solid rgba(201,169,110,0.25)', padding: '3px 12px', borderRadius: 99, marginBottom: 16 }}>
              <Lock size={9} /> Acces restricționat
            </div>

            <h2 className="font-aboreto" style={{ fontSize: 22, color: 'var(--fg)', marginBottom: 12, letterSpacing: '-0.01em', lineHeight: 1.2 }}>
              Completează formularul de acces
            </h2>
            <p style={{ fontSize: 14, color: 'var(--fg-3)', lineHeight: 1.65, marginBottom: 28 }}>
              Înainte de a accesa lecțiile, trebuie să completezi <strong style={{ color: 'var(--fg-2)' }}>formularul de onboarding</strong>. Acesta ne ajută să personalizăm parcursul tău de studiu.
            </p>
            <p style={{ fontSize: 12, color: 'var(--fg-3)', marginBottom: 24, lineHeight: 1.5 }}>
              Durează aproximativ <strong style={{ color: 'var(--accent)' }}>5 minute</strong> și se completează o singură dată.
            </p>

            <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
              <button
                onClick={onClose}
                style={{ padding: '10px 20px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border)', borderRadius: 10, cursor: 'pointer', fontSize: 13, color: 'var(--fg-3)', transition: 'all 0.15s' }}
                onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.08)'}
                onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
              >
                Înapoi
              </button>
              <button
                onClick={() => { onClose(); navigate('/quiz'); }}
                style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '10px 22px', background: 'var(--accent)', color: '#0D0907', border: 'none', borderRadius: 10, cursor: 'pointer', fontSize: 13, fontWeight: 700, boxShadow: '0 4px 20px rgba(196,240,228,0.25)', transition: 'filter 0.15s' }}
                onMouseEnter={e => e.currentTarget.style.filter = 'brightness(1.08)'}
                onMouseLeave={e => e.currentTarget.style.filter = ''}
              >
                Completează formularul <ArrowRight size={14} />
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
