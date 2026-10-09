import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { X, Sliders, Check } from 'lucide-react';

interface SettingsModalProps {
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ onClose }) => {
  const { inactivityThreshold, setInactivityThreshold } = useApp();
  const [val, setVal] = useState(inactivityThreshold);
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setInactivityThreshold(val);
    setSaved(true);
    setTimeout(() => {
      setSaved(false);
      onClose();
    }, 800);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
      <div className="bg-white rounded-xl shadow-2xl border border-slate-200 max-w-md w-full overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b border-slate-100 bg-slate-50">
          <div className="flex items-center space-x-2 text-slate-800 font-bold text-sm">
            <Sliders className="w-4 h-4 text-blue-600" />
            <span>Manager Operational Settings</span>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-5">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
              Default Disruption Inactivity Threshold
            </label>
            <p className="text-xs text-slate-500 mb-3">
              Vehicle stationary duration (in seconds) before system automatically flags an AT RISK event.
            </p>
            <div className="flex items-center space-x-3">
              <input
                type="number"
                min="10"
                max="600"
                value={val}
                onChange={(e) => setVal(Number(e.target.value))}
                className="w-24 px-3 py-2 border border-slate-300 rounded-lg text-sm font-bold text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
              />
              <span className="text-xs font-semibold text-slate-600">Seconds (Default: 60s)</span>
            </div>
          </div>

          <div className="border-t border-slate-100 pt-4 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-600">GPS Context Check:</span>
              <span className="text-emerald-600 font-bold">ACTIVE (Expected Stops Ignored)</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-600">AI Triaging Engine:</span>
              <span className="text-blue-600 font-bold">AUTOMATIC</span>
            </div>
          </div>
        </div>

        <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="flex items-center space-x-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg shadow-xs transition"
          >
            {saved ? <Check className="w-4 h-4 text-white" /> : null}
            <span>{saved ? 'Saved!' : 'Save Configuration'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
