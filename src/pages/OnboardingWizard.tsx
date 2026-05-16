import React, { useState } from 'react';
import { useNavigate } from '@/lib/router-compat';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, Play, FileText, Award } from 'lucide-react';
import { useAuthContext } from '../context/AuthContext';

// ─── Building Blocks Animation ────────────────────────────────────────────────
const BuildingBlocks: React.FC = () => {
  const blocks = [
    { num: 0, label: 'Diagnostic', color: '#C4F0E4' },
    { num: 1, label: 'Fundație', color: '#C9A96E' },
    { num: 2, label: 'Structură', color: '#a78bfa' },
    { num: 3, label: 'Procese', color: '#93c5fd' },
    { num: 4, label: 'Control', color: '#fca5a5' },
    { num: 5, label: 'Delegare', color: '#6ee7b7' },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6, alignItems: 'center', margin: '24px 0' }}>
      {blocks.map((b, i) => (
        <motion.div
          key={b.num}
          initial={{ opacity: 0, y: 20, scaleX: 0.7 }}
          animate={{ opacity: 1, y: 0, scaleX: 1 }}
          transition={{ delay: i * 0.12, duration: 0.4, ease: 'easeOut' }}
          style={{
            display: 'flex', alignItems: 'center', gap: 12,
            padding: '8px 20px', borderRadius: 10, width: `${100 - i * 6}%`,
            background: `${b.color}14`,
            border: `1px solid ${b.color}30`,
          }}
        >
          <div style={{
            width: 22, height: 22, borderRadius: 6, flexShrink: 0,
            background: `${b.color}20`, border: `1px solid ${b.color}40`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 11, fontWeight: 700, color: b.color,
          }}>
            {b.num}
          </div>
          <span style={{ fontSize: 13, color: b.color, fontWeight: 500 }}>{b.label}</span>
        </motion.div>
      ))}
    </div>
  );
};

// ─── How It Works Cards ───────────────────────────────────────────────────────
const HowItWorksStep: React.FC<{
  icon: React.ReactNode;
  title: string;
  description: string;
  delay: number;
  color: string;
}> = ({ icon, title, description, delay, color }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay, duration: 0.35 }}
    style={{
      background: `${color}08`,
      border: `1px solid ${color}20`,
      borderRadius: 16, padding: '20px 20px',
      display: 'flex', flexDirection: 'column', gap: 10,
    }}
  >
    <div style={{
      width: 40, height: 40, borderRadius: 12,
      background: `${color}15`, border: `1px solid ${color}30`,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      color: color,
    }}>
      {icon}
    </div>
    <div>
      <div style={{ fontSize: 14, fontWeight: 700, color: '#fff', marginBottom: 4 }}>{title}</div>
      <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', lineHeight: 1.6 }}>{description}</div>
    </div>
  </motion.div>
);

// ─── Step 1 ───────────────────────────────────────────────────────────────────
const Step1: React.FC<{ onNext: () => void }> = ({ onNext }) => (
  <div>
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
      <h1 className="font-aboreto" style={{
        fontSize: 'clamp(1.7rem,4vw,2.6rem)', color: '#fff',
        letterSpacing: '-0.02em', lineHeight: 1.1, marginBottom: 16,
      }}>
        Bun venit în<br />Arhitectura Afacerii
      </h1>
      <blockquote style={{
        fontSize: 'clamp(1rem,2.5vw,1.2rem)', color: '#C4F0E4',
        fontStyle: 'italic', lineHeight: 1.6, marginBottom: 4,
        borderLeft: '3px solid rgba(196,240,228,0.4)', paddingLeft: 16,
      }}>
        "Afacerea ta nu are nevoie de mai mult efort. Are nevoie de sistem."
      </blockquote>
      <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.3)', marginBottom: 24, paddingLeft: 20 }}>— Victor Morar</p>
    </motion.div>

    <BuildingBlocks />

    <motion.p
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.8 }}
      style={{ fontSize: 14, color: 'rgba(255,255,255,0.5)', lineHeight: 1.7, marginBottom: 28 }}
    >
      În 8 săptămâni construim împreună fundația unui business care funcționează
      fără să depindă de tine zilnic.
    </motion.p>

    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.0 }}>
      <button
        onClick={onNext}
        style={{
          display: 'inline-flex', alignItems: 'center', gap: 10,
          padding: '14px 32px', background: '#C4F0E4', color: '#0D0907',
          border: 'none', borderRadius: 12, cursor: 'pointer',
          fontSize: 15, fontWeight: 700, transition: 'filter 0.15s',
        }}
        onMouseEnter={e => (e.currentTarget.style.filter = 'brightness(1.05)')}
        onMouseLeave={e => (e.currentTarget.style.filter = '')}
      >
        Continuă <ChevronRight size={16} />
      </button>
    </motion.div>
  </div>
);

// ─── Step 2 ───────────────────────────────────────────────────────────────────
const Step2: React.FC<{ onNext: () => void; onBack: () => void }> = ({ onNext, onBack }) => (
  <div>
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
      <div className="font-aboreto" style={{ fontSize: 10, letterSpacing: '0.12em', color: 'rgba(255,255,255,0.3)', marginBottom: 12, textTransform: 'uppercase' }}>
        Pasul 2 din 3
      </div>
      <h1 className="font-aboreto" style={{
        fontSize: 'clamp(1.5rem,3.5vw,2.2rem)', color: '#fff',
        letterSpacing: '-0.02em', lineHeight: 1.1, marginBottom: 8,
      }}>
        Cum funcționează practicumul
      </h1>
      <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.45)', marginBottom: 28, lineHeight: 1.6 }}>
        Fiecare etapă se construiește pe precedenta. Totul e secvențial — cu un motiv.
      </p>
    </motion.div>

    <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 32 }}>
      <HowItWorksStep
        icon={<Play size={18} />}
        title="Lecții video"
        description="Scurte, dense, fără padding. Fiecare lecție are un singur concept central pe care îl poți aplica imediat."
        delay={0.1}
        color="#C4F0E4"
      />
      <HowItWorksStep
        icon={<FileText size={18} />}
        title="Exerciții practice"
        description="Nu teorie — acțiune. Fiecare exercițiu produce un document real pe care îl folosești în afacerea ta."
        delay={0.2}
        color="#C9A96E"
      />
      <HowItWorksStep
        icon={<Award size={18} />}
        title="Livrabilul etapei"
        description="Nu treci la etapa următoare fără livrabilul etapei curente. Aceasta este regula #1 a practicumului."
        delay={0.3}
        color="#a78bfa"
      />
    </div>

    <div style={{ display: 'flex', gap: 12 }}>
      <button
        onClick={onBack}
        style={{
          display: 'flex', alignItems: 'center', gap: 6, padding: '12px 20px',
          background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)',
          borderRadius: 10, cursor: 'pointer', color: 'rgba(255,255,255,0.6)',
          fontSize: 13, fontWeight: 500, transition: 'all 0.15s',
        }}
      >
        Înapoi
      </button>
      <button
        onClick={onNext}
        style={{
          flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
          padding: '12px 24px', background: '#C4F0E4', color: '#0D0907',
          border: 'none', borderRadius: 10, cursor: 'pointer',
          fontSize: 14, fontWeight: 700, transition: 'filter 0.15s',
        }}
        onMouseEnter={e => (e.currentTarget.style.filter = 'brightness(1.05)')}
        onMouseLeave={e => (e.currentTarget.style.filter = '')}
      >
        Continuă <ChevronRight size={15} />
      </button>
    </div>
  </div>
);

// ─── Step 3 ───────────────────────────────────────────────────────────────────
const Step3: React.FC<{ onFinish: () => void; onBack: () => void }> = ({ onFinish, onBack }) => (
  <div>
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
      <div className="font-aboreto" style={{ fontSize: 10, letterSpacing: '0.12em', color: 'rgba(255,255,255,0.3)', marginBottom: 12, textTransform: 'uppercase' }}>
        Pasul 3 din 3
      </div>
      <h1 className="font-aboreto" style={{
        fontSize: 'clamp(1.5rem,3.5vw,2.2rem)', color: '#fff',
        letterSpacing: '-0.02em', lineHeight: 1.1, marginBottom: 24,
      }}>
        Regula #1
      </h1>
    </motion.div>

    <motion.div
      initial={{ opacity: 0, scale: 0.97 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: 0.1, duration: 0.4 }}
      style={{
        background: '#111',
        border: '1px solid rgba(255,255,255,0.12)',
        borderLeft: '3px solid #C9A96E',
        borderRadius: 16, padding: '28px 24px', marginBottom: 24,
      }}
    >
      <p style={{ fontSize: 'clamp(1rem,2.5vw,1.2rem)', color: '#fff', lineHeight: 1.6, fontWeight: 500 }}>
        "Nu treci la etapa următoare fără livrabilul etapei curente."
      </p>
      <div style={{ marginTop: 12, fontSize: 12, color: 'rgba(255,255,255,0.35)' }}>
        Aceasta nu e o recomandare. E singura regulă.
      </div>
    </motion.div>

    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.25 }}
      style={{
        background: 'rgba(196,240,228,0.06)',
        border: '1px solid rgba(196,240,228,0.15)',
        borderRadius: 12, padding: '16px 20px', marginBottom: 28,
        fontSize: 14, color: 'rgba(255,255,255,0.6)', lineHeight: 1.7,
      }}
    >
      Modulul 0 te așteaptă. Hai să construim.
    </motion.div>

    <div style={{ display: 'flex', gap: 12 }}>
      <button
        onClick={onBack}
        style={{
          display: 'flex', alignItems: 'center', gap: 6, padding: '12px 20px',
          background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)',
          borderRadius: 10, cursor: 'pointer', color: 'rgba(255,255,255,0.6)',
          fontSize: 13, fontWeight: 500,
        }}
      >
        Înapoi
      </button>
      <button
        onClick={onFinish}
        style={{
          flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
          padding: '13px 24px', background: '#C4F0E4', color: '#0D0907',
          border: 'none', borderRadius: 10, cursor: 'pointer',
          fontSize: 14, fontWeight: 700, transition: 'filter 0.15s',
        }}
        onMouseEnter={e => (e.currentTarget.style.filter = 'brightness(1.05)')}
        onMouseLeave={e => (e.currentTarget.style.filter = '')}
      >
        Completează profilul <ChevronRight size={15} />
      </button>
    </div>
  </div>
);

// ─── Main ─────────────────────────────────────────────────────────────────────
export const OnboardingWizard: React.FC = () => {
  const [step, setStep] = useState(0);
  const [direction, setDirection] = useState(1);
  const navigate = useNavigate();
  const { user } = useAuthContext();

  const goNext = () => {
    setDirection(1);
    setStep(s => s + 1);
  };
  const goBack = () => {
    setDirection(-1);
    setStep(s => s - 1);
  };

  const finish = () => {
    if (user) {
      localStorage.setItem(`aa_wizard_done_${user.id}`, '1');
      localStorage.setItem(`aa_welcome_shown_${user.id}`, '1');
    }
    localStorage.setItem('aa_wizard_done', '1');
    navigate('/quiz');
  };

  const steps = [
    <Step1 key="s1" onNext={goNext} />,
    <Step2 key="s2" onNext={goNext} onBack={goBack} />,
    <Step3 key="s3" onFinish={finish} onBack={goBack} />,
  ];

  return (
    <div style={{
      minHeight: '100vh', background: '#0D0907',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '32px 16px',
    }}>
      {/* Progress dots */}
      <div style={{ position: 'fixed', top: 24, left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: 8, zIndex: 10 }}>
        {[0, 1, 2].map(i => (
          <div key={i} style={{
            width: i === step ? 20 : 6, height: 6, borderRadius: 3,
            background: i === step ? '#C4F0E4' : i < step ? 'rgba(196,240,228,0.4)' : 'rgba(255,255,255,0.15)',
            transition: 'all 0.3s',
          }} />
        ))}
      </div>

      <div style={{ maxWidth: 580, width: '100%' }}>
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={step}
            custom={direction}
            initial={{ opacity: 0, x: direction * 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: direction * -50 }}
            transition={{ duration: 0.3 }}
          >
            {steps[step]}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};
