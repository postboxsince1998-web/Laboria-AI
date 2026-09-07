import React from 'react';

interface BadgeProps {
  variant?: 'match-high' | 'match-mid' | 'match-low' | 'info' | 'success' | 'warning' | 'purple';
  children: React.ReactNode;
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({ variant = 'info', children, className = '' }) => {
  const styles = {
    'match-high': 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
    'match-mid': 'bg-amber-500/15 text-amber-400 border-amber-500/30',
    'match-low': 'bg-rose-500/15 text-rose-400 border-rose-500/30',
    info: 'bg-brand-500/15 text-brand-300 border-brand-500/30',
    success: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
    warning: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
    purple: 'bg-purple-500/15 text-purple-300 border-purple-500/30',
  };

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${styles[variant]} ${className}`}
    >
      {children}
    </span>
  );
};
