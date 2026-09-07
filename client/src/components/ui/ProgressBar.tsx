import React from 'react';

interface ProgressBarProps {
  value: number; // 0 to 100
  label?: string;
  showValue?: boolean;
  color?: 'brand' | 'teal' | 'emerald' | 'amber' | 'rose' | 'purple';
  height?: 'sm' | 'md' | 'lg';
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  value,
  label,
  showValue = true,
  color = 'brand',
  height = 'md',
}) => {
  const colorGradients = {
    brand: 'from-brand-600 to-brand-400',
    teal: 'from-accent-teal to-accent-cyan',
    emerald: 'from-emerald-600 to-emerald-400',
    amber: 'from-amber-600 to-amber-400',
    rose: 'from-rose-600 to-rose-400',
    purple: 'from-purple-600 to-purple-400',
  };

  const heights = {
    sm: 'h-1.5',
    md: 'h-2.5',
    lg: 'h-4',
  };

  const safeVal = Math.min(100, Math.max(0, value));

  return (
    <div className="w-full">
      {(label || showValue) && (
        <div className="flex justify-between items-center text-xs text-gray-300 mb-1 font-medium">
          <span>{label}</span>
          {showValue && <span>{safeVal}%</span>}
        </div>
      )}
      <div className={`w-full bg-gray-800 rounded-full overflow-hidden ${heights[height]}`}>
        <div
          className={`h-full bg-gradient-to-r ${colorGradients[color]} transition-all duration-500 rounded-full`}
          style={{ width: `${safeVal}%` }}
        />
      </div>
    </div>
  );
};
