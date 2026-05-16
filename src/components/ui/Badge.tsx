import React from 'react';

type BadgeVariant = 'accent' | 'gold' | 'muted' | 'success' | 'warning' | 'danger';

interface BadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
  size?: 'sm' | 'md';
  className?: string;
}

const variantStyles: Record<BadgeVariant, React.CSSProperties> = {
  accent:  { background: 'rgba(196,240,228,0.12)', color: '#C4F0E4',  borderColor: 'rgba(196,240,228,0.25)' },
  gold:    { background: 'rgba(201,169,110,0.12)', color: '#C9A96E',  borderColor: 'rgba(201,169,110,0.25)' },
  muted:   { background: 'rgba(138,122,112,0.15)', color: '#8a7a70',  borderColor: 'rgba(138,122,112,0.25)' },
  success: { background: 'rgba(74,222,128,0.12)',  color: '#4ade80',  borderColor: 'rgba(74,222,128,0.25)' },
  warning: { background: 'rgba(251,191,36,0.12)',  color: '#fbbf24',  borderColor: 'rgba(251,191,36,0.25)' },
  danger:  { background: 'rgba(248,113,113,0.12)', color: '#f87171',  borderColor: 'rgba(248,113,113,0.25)' },
};

const sizes = {
  sm: 'px-2 py-0.5 text-xs',
  md: 'px-3 py-1 text-sm',
};

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'accent',
  size = 'sm',
  className = '',
}) => {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full font-medium border ${sizes[size]} ${className}`}
      style={variantStyles[variant]}
    >
      {children}
    </span>
  );
};
