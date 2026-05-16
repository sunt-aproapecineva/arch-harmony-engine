import React, { useState, useEffect } from 'react';
import { X, Info, CheckCircle2, AlertTriangle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface NotificationData {
  message: string;
  type: 'info' | 'success' | 'warning';
  exp: number;
}

const DISMISSED_KEY = 'aa_notification_dismissed';

export const NotificationBanner: React.FC = () => {
  const [notification, setNotification] = useState<NotificationData | null>(null);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem('aa_notification');
      if (!raw) return;
      const data: NotificationData = JSON.parse(raw);
      if (data.exp && Date.now() > data.exp) {
        localStorage.removeItem('aa_notification');
        return;
      }
      const dismissedVal = sessionStorage.getItem(DISMISSED_KEY);
      if (dismissedVal === raw) {
        setDismissed(true);
        return;
      }
      setNotification(data);
    } catch {
      // ignore
    }
  }, []);

  const handleDismiss = () => {
    try {
      const raw = localStorage.getItem('aa_notification');
      if (raw) sessionStorage.setItem(DISMISSED_KEY, raw);
    } catch {}
    setDismissed(true);
  };

  if (!notification || dismissed) return null;

  const { type, message } = notification;

  const styles: Record<string, { bg: string; border: string; color: string; icon: React.ReactNode }> = {
    info: {
      bg: 'rgba(59,130,246,0.12)',
      border: 'rgba(59,130,246,0.3)',
      color: '#93c5fd',
      icon: <Info size={15} />,
    },
    success: {
      bg: 'rgba(196,240,228,0.12)',
      border: 'rgba(196,240,228,0.3)',
      color: 'var(--accent)',
      icon: <CheckCircle2 size={15} />,
    },
    warning: {
      bg: 'rgba(201,169,110,0.12)',
      border: 'rgba(201,169,110,0.3)',
      color: 'var(--gold)',
      icon: <AlertTriangle size={15} />,
    },
  };

  const s = styles[type] || styles.info;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ height: 0, opacity: 0 }}
        animate={{ height: 'auto', opacity: 1 }}
        exit={{ height: 0, opacity: 0 }}
        transition={{ duration: 0.25 }}
        style={{ overflow: 'hidden' }}
      >
        <div
          style={{
            background: s.bg,
            borderBottom: `1px solid ${s.border}`,
            padding: '9px 20px',
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            fontSize: 13,
            color: s.color,
          }}
        >
          <span style={{ flexShrink: 0 }}>{s.icon}</span>
          <span style={{ flex: 1, lineHeight: 1.5 }}>{message}</span>
          <button
            onClick={handleDismiss}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: s.color,
              opacity: 0.7,
              padding: 2,
              display: 'flex',
              alignItems: 'center',
              flexShrink: 0,
              transition: 'opacity 0.15s',
            }}
            onMouseEnter={e => (e.currentTarget.style.opacity = '1')}
            onMouseLeave={e => (e.currentTarget.style.opacity = '0.7')}
          >
            <X size={14} />
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};
