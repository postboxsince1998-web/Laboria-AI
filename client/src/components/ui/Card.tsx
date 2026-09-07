import React from 'react';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
  glow?: boolean;
}

export const Card: React.FC<CardProps> = ({ children, className = '', glow = false, ...props }) => {
  return (
    <div
      className={`glass-card rounded-xl p-5 transition-all duration-300 ${
        glow ? 'shadow-glow-sm hover:shadow-glow-md border-brand-500/30' : ''
      } ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

export const CardHeader: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => (
  <div className={`flex items-center justify-between pb-4 border-b border-gray-800/60 mb-4 ${className}`}>
    {children}
  </div>
);

export const CardTitle: React.FC<{ children: React.ReactNode; className?: string; icon?: React.ReactNode }> = ({
  children,
  className = '',
  icon,
}) => (
  <h3 className={`text-lg font-semibold font-display text-white flex items-center gap-2.5 ${className}`}>
    {icon && <span className="text-brand-400">{icon}</span>}
    {children}
  </h3>
);
