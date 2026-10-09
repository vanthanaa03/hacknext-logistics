import React from 'react';

interface StatCardProps {
  label: string;
  value: string | number;
  subtext?: string;
  color?: 'red' | 'amber' | 'emerald' | 'blue' | 'neutral';
  icon?: React.ReactNode;
}

export const StatCard: React.FC<StatCardProps> = ({
  label,
  value,
  subtext,
  color = 'neutral',
  icon
}) => {
  const borderColors = {
    red: 'border-l-4 border-l-red-500 bg-white',
    amber: 'border-l-4 border-l-amber-500 bg-white',
    emerald: 'border-l-4 border-l-emerald-500 bg-white',
    blue: 'border-l-4 border-l-blue-500 bg-white',
    neutral: 'border border-slate-200 bg-white'
  }[color];

  const valueColors = {
    red: 'text-red-600',
    amber: 'text-amber-600',
    emerald: 'text-emerald-600',
    blue: 'text-blue-600',
    neutral: 'text-slate-900'
  }[color];

  return (
    <div className={`p-4 rounded-lg shadow-xs border border-slate-200/80 ${borderColors}`}>
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">{label}</span>
        {icon && <div className="text-slate-400">{icon}</div>}
      </div>
      <div className={`text-2xl font-bold mt-1 tracking-tight ${valueColors}`}>
        {typeof value === 'number' && value < 10 ? `0${value}` : value}
      </div>
      {subtext && <div className="text-xs text-slate-500 mt-1">{subtext}</div>}
    </div>
  );
};
