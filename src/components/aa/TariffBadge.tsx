import React from 'react';
import { Tariff } from '../../lib/types';

interface TariffBadgeProps {
  tariff: Tariff;
  compact?: boolean;
}

const TARIFF_CONFIG: Record<Tariff, { label: string; bg: string; border: string; color: string }> = {
  student: {
    label: 'Tarif Student',
    bg: 'rgba(122,110,103,0.12)',
    border: 'rgba(122,110,103,0.25)',
    color: 'var(--fg-3)',
  },
  designer: {
    label: 'Tarif Designer',
    bg: 'var(--accent-dim)',
    border: 'rgba(196,240,228,0.25)',
    color: 'var(--accent)',
  },
  arhitect: {
    label: 'Tarif Arhitect',
    bg: 'var(--gold-dim)',
    border: 'rgba(201,169,110,0.25)',
    color: 'var(--gold)',
  },
};

export const TariffBadge: React.FC<TariffBadgeProps> = ({ tariff, compact = false }) => {
  const cfg = TARIFF_CONFIG[tariff] || TARIFF_CONFIG.student;
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 4,
        fontSize: compact ? 10 : 11,
        fontWeight: 600,
        padding: compact ? '1px 7px' : '3px 9px',
        borderRadius: 99,
        background: cfg.bg,
        border: `1px solid ${cfg.border}`,
        color: cfg.color,
        whiteSpace: 'nowrap',
        letterSpacing: '0.02em',
      }}
    >
      {cfg.label}
    </span>
  );
};
