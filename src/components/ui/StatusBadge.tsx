import React from 'react';

export type StatusBadgeVariant = 'success' | 'warning' | 'error' | 'info' | 'neutral';

export interface StatusBadgeProps {
  status: string;
  variant: StatusBadgeVariant;
  showDot?: boolean;
  className?: string;
}

const variantStyles = {
  success: {
    container: 'bg-lime-500/10 border-lime-500/30 text-lime-700',
    dot: 'bg-lime-500',
  },
  warning: {
    container: 'bg-amber-500/10 border-amber-500/30 text-amber-700',
    dot: 'bg-amber-500',
  },
  error: {
    container: 'bg-red-500/10 border-red-500/30 text-red-600',
    dot: 'bg-red-500',
  },
  info: {
    container: 'bg-blue-500/10 border-blue-500/30 text-blue-700',
    dot: 'bg-blue-500',
  },
  neutral: {
    container: 'bg-gray-500/10 border-gray-500/30 text-gray-700',
    dot: 'bg-gray-500',
  },
};

export function StatusBadge({
  status,
  variant,
  showDot = true,
  className = '',
}: StatusBadgeProps) {
  const styles = variantStyles[variant];

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-xs font-medium ${styles.container} ${className}`}
    >
      {showDot && (
        <span className={`w-1.5 h-1.5 rounded-full ${styles.dot}`} />
      )}
      {status}
    </span>
  );
}

export default StatusBadge;
