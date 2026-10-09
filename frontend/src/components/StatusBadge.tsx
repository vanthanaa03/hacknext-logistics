import React from 'react';

interface StatusBadgeProps {
  status: string;
  size?: 'sm' | 'md' | 'lg';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, size = 'md' }) => {
  let bg = 'bg-slate-100 text-slate-700 border-slate-200';
  let dot = 'bg-slate-400';

  const normalized = status.toUpperCase();

  if (['CRITICAL', 'DISRUPTED', 'HIGH'].includes(normalized)) {
    bg = 'bg-red-50 text-red-700 border-red-200';
    dot = 'bg-red-500 animate-pulse';
  } else if (['AT_RISK', 'WARNING', 'MEDIUM', 'SIMULATING'].includes(normalized)) {
    bg = 'bg-amber-50 text-amber-700 border-amber-200';
    dot = 'bg-amber-500 animate-ping';
  } else if (['NORMAL', 'RESOLVED', 'COMPLETED', 'DELIVERED', 'ON_DUTY'].includes(normalized)) {
    bg = 'bg-emerald-50 text-emerald-700 border-emerald-200';
    dot = 'bg-emerald-500';
  } else if (['INFO', 'ACTIVE', 'OUT_FOR_DELIVERY', 'PENDING'].includes(normalized)) {
    bg = 'bg-blue-50 text-blue-700 border-blue-200';
    dot = 'bg-blue-500';
  }

  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5 space-x-1',
    md: 'text-xs px-2.5 py-1 space-x-1.5 font-medium',
    lg: 'text-sm px-3 py-1.5 space-x-2 font-semibold'
  }[size];

  return (
    <span className={`inline-flex items-center rounded-full border ${bg} ${sizeClasses}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${dot}`} />
      <span>{status.replace(/_/g, ' ')}</span>
    </span>
  );
};
