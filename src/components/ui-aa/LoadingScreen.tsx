import React, { useEffect, useState, useRef } from 'react';
import { AnimatePresence, motion } from 'framer-motion';

interface LoadingScreenProps {
  onComplete: () => void;
}

const WORDS = ['Sistematizare', 'Claritate', 'Libertate'];

export const LoadingScreen: React.FC<LoadingScreenProps> = ({ onComplete }) => {
  const [wordIndex, setWordIndex] = useState(0);
  const [counter, setCounter] = useState(0);
  const [barWidth, setBarWidth] = useState(0);
  const [fadeOut, setFadeOut] = useState(false);
  const startTime = useRef(Date.now());

  // Word cycling
  useEffect(() => {
    const interval = setInterval(() => {
      setWordIndex(prev => (prev + 1) % WORDS.length);
    }, 900);
    return () => clearInterval(interval);
  }, []);

  // Counter & bar fill over 2.7s
  useEffect(() => {
    const duration = 2700;
    const tickInterval = 30;
    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime.current;
      const pct = Math.min(100, Math.round((elapsed / duration) * 100));
      setCounter(pct);
      setBarWidth(pct);
      if (pct >= 100) clearInterval(interval);
    }, tickInterval);
    return () => clearInterval(interval);
  }, []);

  // Fade out at 2.8s, call onComplete at 3.2s
  useEffect(() => {
    const t1 = setTimeout(() => setFadeOut(true), 2800);
    const t2 = setTimeout(() => onComplete(), 3200);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, [onComplete]);

  return (
    <motion.div
      style={{
        position: 'fixed', inset: 0, zIndex: 9999, display: 'flex', flexDirection: 'column', overflow: 'hidden',
        background: '#0D0907',
      }}
      animate={{ opacity: fadeOut ? 0 : 1 }}
      transition={{ duration: 0.4 }}
    >
      {/* Top-left branding */}
      <motion.div
        style={{ position: 'absolute', top: 32, left: 32 }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.2 }}
      >
        <span
          className="font-aboreto"
          style={{ fontSize: 10, letterSpacing: '0.3em', textTransform: 'uppercase', color: 'rgba(196,240,228,0.4)' }}
        >
          Arhitectura Afacerii
        </span>
      </motion.div>

      {/* Center: cycling words */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <AnimatePresence mode="wait">
          <motion.h1
            key={wordIndex}
            className="font-aboreto"
            style={{ color: '#C4F0E4', fontSize: 'clamp(2.5rem,7vw,4rem)', letterSpacing: '-0.02em' }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.35, ease: 'easeInOut' }}
          >
            {WORDS[wordIndex]}
          </motion.h1>
        </AnimatePresence>
      </div>

      {/* Bottom */}
      <div style={{ position: 'absolute', bottom: 32, left: 32, right: 32, display: 'flex', flexDirection: 'column', gap: 12 }}>
        {/* Progress bar */}
        <div style={{ width: '100%', borderRadius: 1, overflow: 'hidden', height: 1, background: 'rgba(196,240,228,0.08)' }}>
          <motion.div
            style={{
              height: '100%',
              background: 'linear-gradient(90deg, #C4F0E4, #C9A96E)',
              width: `${barWidth}%`,
            }}
            transition={{ duration: 0.03 }}
          />
        </div>

        {/* Labels */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontFamily: 'monospace', fontSize: 11, color: 'rgba(196,240,228,0.25)' }}>
            Inițializare sistem
          </span>
          <span style={{ fontFamily: 'monospace', fontSize: 13, color: 'rgba(196,240,228,0.5)', fontVariantNumeric: 'tabular-nums' }}>
            {String(counter).padStart(3, '0')}
          </span>
        </div>
      </div>
    </motion.div>
  );
};
