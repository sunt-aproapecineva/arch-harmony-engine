import React from 'react';
import { motion } from 'framer-motion';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  children: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  loading = false,
  children,
  className = '',
  disabled,
  style,
  ...props
}) => {
  const sizeStyles: Record<string, React.CSSProperties> = {
    sm: { padding: '6px 12px', fontSize: 12, borderRadius: 8 },
    md: { padding: '9px 16px', fontSize: 13, borderRadius: 10 },
    lg: { padding: '12px 24px', fontSize: 14, borderRadius: 12 },
  };

  const variantStyles: Record<string, React.CSSProperties> = {
    primary: {
      background: 'var(--accent)',
      color: '#0D0907',
      border: 'none',
      fontWeight: 700,
    },
    secondary: {
      background: 'transparent',
      color: 'var(--fg-2)',
      border: '1px solid var(--border)',
      fontWeight: 500,
    },
    ghost: {
      background: 'transparent',
      color: 'var(--fg-2)',
      border: 'none',
      fontWeight: 500,
    },
    danger: {
      background: 'rgba(248,113,113,0.12)',
      color: '#f87171',
      border: '1px solid rgba(248,113,113,0.2)',
      fontWeight: 500,
    },
  };

  const baseStyle: React.CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    cursor: disabled || loading ? 'not-allowed' : 'pointer',
    opacity: disabled || loading ? 0.6 : 1,
    transition: 'all 0.2s',
    userSelect: 'none',
    ...sizeStyles[size],
    ...variantStyles[variant],
    ...style,
  };

  return (
    <motion.button
      whileTap={{ scale: disabled || loading ? 1 : 0.97 }}
      style={baseStyle}
      disabled={disabled || loading}
      className={className}
      onMouseEnter={e => {
        if (disabled || loading) return;
        const el = e.currentTarget as HTMLButtonElement;
        if (variant === 'primary') el.style.filter = 'brightness(1.07)';
        if (variant === 'secondary') el.style.borderColor = 'var(--border-hi)';
        if (variant === 'ghost') el.style.background = 'var(--bg-3)';
      }}
      onMouseLeave={e => {
        const el = e.currentTarget as HTMLButtonElement;
        el.style.filter = '';
        if (variant === 'secondary') el.style.borderColor = 'var(--border)';
        if (variant === 'ghost') el.style.background = 'transparent';
      }}
      {...(props as React.ComponentProps<typeof motion.button>)}
    >
      {loading ? (
        <span style={{ width: 14, height: 14, border: '2px solid currentColor', borderTopColor: 'transparent', borderRadius: '50%', display: 'inline-block', animation: 'spin 0.7s linear infinite' }} />
      ) : null}
      {children}
    </motion.button>
  );
};
