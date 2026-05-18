import React from 'react';

interface TelegramButtonProps {
  compact?: boolean;
}

export const TelegramButton: React.FC<TelegramButtonProps> = ({ compact = false }) => (
  <a
    href="https://t.me/+f2YYXZlVWjVhMzcy"
    target="_blank"
    rel="noopener noreferrer"
    style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: compact ? 6 : 8,
      padding: compact ? '6px 12px' : '10px 18px',
      background: '#2AABEE',
      color: '#fff',
      borderRadius: 10,
      fontWeight: 600,
      fontSize: compact ? 12 : 14,
      textDecoration: 'none',
      transition: 'opacity 0.2s',
      whiteSpace: 'nowrap',
    }}
    onMouseEnter={e => (e.currentTarget.style.opacity = '0.85')}
    onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
  >
    <svg width={compact ? 14 : 18} height={compact ? 14 : 18} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.894 8.221l-1.97 9.28c-.145.658-.537.818-1.084.508l-3-2.21-1.447 1.394c-.16.16-.295.295-.605.295l.213-3.053 5.56-5.023c.242-.213-.054-.333-.373-.12l-6.871 4.326-2.962-.924c-.643-.204-.657-.643.136-.953l11.57-4.461c.537-.194 1.006.131.833.941z" />
    </svg>
    {compact ? 'Telegram' : 'Grup Telegram'}
  </a>
);
