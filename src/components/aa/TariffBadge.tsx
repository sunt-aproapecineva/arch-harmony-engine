import React from 'react';
import { Tariff } from '../../lib/types';
import { getTier, tierLabelAnywhere, TIER_ACCENT } from '../../lib/courses';

interface TariffBadgeProps {
  tariff: Tariff;
  /** Programul din care vine treapta. Fără el, insigna caută în toate programele. */
  courseId?: string | null;
  compact?: boolean;
}

/**
 * Insigna de treaptă.
 *
 * Înainte avea un dicționar fix cu Student / Designer / Arhitect și cădea pe „Student"
 * pentru orice altceva — deci un elev de la START, pe treapta Ultra, apărea drept
 * „Tarif Student". Culorile și numele vin acum din definiția programului.
 */
export const TariffBadge: React.FC<TariffBadgeProps> = ({ tariff, courseId, compact = false }) => {
  const tier = getTier(courseId, tariff);
  const label = tier?.label || tierLabelAnywhere(tariff);
  const a = TIER_ACCENT[tier?.accent || 'neutral'];
  return (
    <span
      style={{
        display: 'inline-flex', alignItems: 'center', gap: 4,
        fontSize: compact ? 10 : 11, fontWeight: 600,
        padding: compact ? '1px 7px' : '3px 9px', borderRadius: 99,
        background: a.bg, border: '1px solid var(--border-hi)', color: a.fg,
        whiteSpace: 'nowrap', letterSpacing: '0.02em',
      }}
    >
      {label}
    </span>
  );
};
