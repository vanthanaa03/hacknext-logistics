import React from 'react';
import { AlertOctagon, ArrowRight } from 'lucide-react';

interface DriverAlertBannerProps {
  onQuickReport: (category: string) => void;
  onOpenFullReport: () => void;
}

export const DriverAlertBanner: React.FC<DriverAlertBannerProps> = ({
  onQuickReport,
  onOpenFullReport
}) => {
  const options = [
    { label: 'TRAFFIC', cat: 'TRAFFIC' },
    { label: 'VEHICLE PROBLEM', cat: 'VEHICLE_PROBLEM' },
    { label: 'ROAD BLOCKED', cat: 'ROAD_BLOCKED' },
    { label: 'CUSTOMER ISSUE', cat: 'CUSTOMER_ISSUE' },
    { label: 'WAREHOUSE DELAY', cat: 'WAREHOUSE_DELAY' },
    { label: 'OTHER', cat: 'OTHER' }
  ];

  return (
    <div className="bg-amber-500 text-slate-950 p-4 rounded-2xl shadow-lg border-2 border-amber-400 space-y-3 animate-pulse">
      <div className="flex items-center space-x-2">
        <AlertOctagon className="w-6 h-6 text-slate-950 shrink-0" />
        <div>
          <div className="text-xs font-black uppercase tracking-wider text-slate-900">⚠️ UNEXPECTED STOP DETECTED</div>
          <div className="text-sm font-bold text-slate-950">Your vehicle appears to have remained stationary longer than expected.</div>
        </div>
      </div>

      <div className="text-xs font-bold text-slate-900">Are you facing a problem?</div>

      {/* Quick Category Buttons */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-1">
        {options.map((opt) => (
          <button
            key={opt.cat}
            onClick={() => onQuickReport(opt.cat)}
            className="py-2.5 px-2 bg-slate-900 text-white font-bold text-xs rounded-xl shadow-xs hover:bg-slate-800 active:scale-95 transition text-center"
          >
            {opt.label}
          </button>
        ))}
      </div>

      <div className="pt-2 flex justify-end">
        <button
          onClick={onOpenFullReport}
          className="flex items-center space-x-1 py-2 px-4 bg-white text-slate-900 font-extrabold text-xs rounded-xl shadow-md hover:bg-slate-100"
        >
          <span>TYPE NATURAL LANGUAGE REPORT</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
