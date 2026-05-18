import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CheckCircle2, UserPlus, ListChecks, LayoutDashboard, BookOpen, PenSquare, LifeBuoy } from 'lucide-react';

interface Props {
  open: boolean;
  onClose: () => void;
}

interface Step {
  icon: React.ReactNode;
  title: string;
  body: React.ReactNode;
}

const steps: Step[] = [
  {
    icon: <UserPlus size={18} />,
    title: 'Pasul 1 — Creează-ți contul (30 de secunde)',
    body: (
      <>
        Ești deja pe lista de acces. Introdu emailul, apasă <b>"Verifică accesul"</b>, apoi completează numele și o parolă (min. 6 caractere) și apasă <b>"Creează cont"</b>. Gata — ești în platformă.
      </>
    ),
  },
  {
    icon: <ListChecks size={18} />,
    title: 'Pasul 2 — Quiz de onboarding (3-5 min)',
    body: <>10 întrebări scurte. Nu e un test — îmi arată mie (ca mentor) în ce etapă ești ca să te pot ghida mai bine. Răspunde sincer.</>,
  },
  {
    icon: <LayoutDashboard size={18} />,
    title: 'Pasul 3 — Explorează Dashboard-ul',
    body: <>Vezi <b>modulele</b>, <b>progresul tău</b> și butonul către <b>grupul Telegram</b> pentru suport rapid.</>,
  },
  {
    icon: <BookOpen size={18} />,
    title: 'Pasul 4 — Parcurge lecțiile în ordine',
    body: <>Platforma e secvențială — nu sări peste etape. Vei avea lecții <b>video</b>, <b>teoretice</b> și <b>practice</b>.</>,
  },
  {
    icon: <PenSquare size={18} />,
    title: 'Pasul 5 — Completează exercițiile practice',
    body: <>Completezi tabele și răspunzi la întrebări din afacerea ta. Salvarea e automată. Când ești gata, apeși <b>"Finalizează"</b> și răspunsurile ajung direct la mine.</>,
  },
  {
    icon: <LifeBuoy size={18} />,
    title: 'Ai nevoie de ajutor?',
    body: <>Fă un screenshot și scrie-mi pe <b>Telegram</b> sau pe email. Rezolv în cel mai scurt timp.</>,
  },
];

export const OnboardingGuideModal: React.FC<Props> = ({ open, onClose }) => {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.removeEventListener('keydown', onKey); document.body.style.overflow = prev; };
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          onClick={onClose}
          style={{
            position: 'fixed', inset: 0, zIndex: 100,
            background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(6px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: 16,
          }}
        >
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.98 }}
            transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
            onClick={e => e.stopPropagation()}
            role="dialog" aria-modal="true" aria-labelledby="guide-title"
            style={{
              position: 'relative',
              width: '100%', maxWidth: 640, maxHeight: '90vh',
              background: 'var(--bg-2, #14110f)',
              border: '1px solid var(--border)',
              borderRadius: 16,
              boxShadow: '0 24px 60px rgba(0,0,0,0.45)',
              display: 'flex', flexDirection: 'column',
              overflow: 'hidden',
            }}
          >
            {/* Header */}
            <div style={{
              padding: '20px 24px 16px',
              borderBottom: '1px solid var(--border)',
              background: 'linear-gradient(135deg, rgba(26,92,56,0.18), rgba(15,61,34,0.05))',
              flexShrink: 0,
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10 }}>
                <div style={{
                  width: 36, height: 36, borderRadius: 10,
                  background: 'linear-gradient(135deg, #1A5C38, #0f3d22)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  boxShadow: '0 4px 16px rgba(26,92,56,0.35)', flexShrink: 0,
                }}>
                  <span className="font-aboreto" style={{ fontSize: 12, color: '#C4F0E4' }}>AA</span>
                </div>
                <div style={{ minWidth: 0, flex: 1 }}>
                  <div className="font-aboreto" style={{ fontSize: 10, letterSpacing: '0.14em', color: 'var(--fg-3)' }}>
                    ARHITECTURA AFACERII
                  </div>
                  <h2 id="guide-title" className="font-aboreto" style={{
                    fontSize: 18, color: 'var(--fg)', margin: '2px 0 0', lineHeight: 1.2, letterSpacing: '-0.01em',
                  }}>
                    Ghid de utilizare — pas cu pas
                  </h2>
                </div>
              </div>
              <p style={{ fontSize: 13, color: 'var(--fg-3)', margin: 0, lineHeight: 1.5 }}>
                Tot ce trebuie să știi ca să începi în mai puțin de 10 minute.
              </p>
              <button
                onClick={onClose}
                aria-label="Închide"
                style={{
                  position: 'absolute', top: 14, right: 14,
                  width: 32, height: 32, borderRadius: 8,
                  background: 'var(--bg-3, rgba(255,255,255,0.04))',
                  border: '1px solid var(--border)',
                  color: 'var(--fg-2)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  cursor: 'pointer', transition: 'background 0.15s, color 0.15s',
                }}
                onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = 'rgba(248,113,113,0.12)'; (e.currentTarget as HTMLButtonElement).style.color = '#f87171'; }}
                onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = 'var(--bg-3, rgba(255,255,255,0.04))'; (e.currentTarget as HTMLButtonElement).style.color = 'var(--fg-2)'; }}
              >
                <X size={16} />
              </button>
            </div>

            {/* Body */}
            <div style={{ overflowY: 'auto', padding: '18px 24px 8px', flex: 1 }}>
              <ol style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: 14 }}>
                {steps.map((s, i) => (
                  <li key={i} style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                    <div style={{
                      width: 32, height: 32, borderRadius: 8, flexShrink: 0,
                      background: 'rgba(196,240,228,0.08)',
                      border: '1px solid rgba(196,240,228,0.15)',
                      color: 'var(--accent)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      marginTop: 2,
                    }}>
                      {s.icon}
                    </div>
                    <div style={{ minWidth: 0, flex: 1 }}>
                      <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--fg)', marginBottom: 3, lineHeight: 1.35 }}>
                        {s.title}
                      </div>
                      <div style={{ fontSize: 13, color: 'var(--fg-2)', lineHeight: 1.6 }}>
                        {s.body}
                      </div>
                    </div>
                  </li>
                ))}
              </ol>

              <div style={{
                marginTop: 18, padding: '12px 14px',
                background: 'rgba(196,240,228,0.06)',
                border: '1px solid rgba(196,240,228,0.14)',
                borderRadius: 10,
                display: 'flex', gap: 10, alignItems: 'flex-start',
              }}>
                <CheckCircle2 size={16} style={{ color: 'var(--accent)', flexShrink: 0, marginTop: 2 }} />
                <div style={{ fontSize: 12.5, color: 'var(--fg-2)', lineHeight: 1.6 }}>
                  <b style={{ color: 'var(--fg)' }}>Checklist:</b> înregistrare → quiz → grup Telegram → prima lecție → primul exercițiu finalizat.
                </div>
              </div>
            </div>

            {/* Footer */}
            <div style={{
              padding: '14px 24px',
              borderTop: '1px solid var(--border)',
              display: 'flex', justifyContent: 'flex-end', gap: 10,
              flexShrink: 0, background: 'var(--bg-2, #14110f)',
            }}>
              <button
                onClick={onClose}
                style={{
                  padding: '9px 18px',
                  background: 'var(--accent)', color: '#0D0907',
                  border: 'none', borderRadius: 9,
                  fontSize: 13, fontWeight: 700, cursor: 'pointer',
                  transition: 'filter 0.15s',
                }}
              >
                Am înțeles, hai să începem
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
