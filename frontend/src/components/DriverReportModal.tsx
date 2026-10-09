import React, { useState } from 'react';
import { X, Sparkles, Send, CheckCircle2, AlertTriangle } from 'lucide-react';

interface DriverReportModalProps {
  initialCategory?: string;
  onSubmitReport: (category: string, message: string) => Promise<any>;
  onClose: () => void;
}

export const DriverReportModal: React.FC<DriverReportModalProps> = ({
  initialCategory = 'VEHICLE_PROBLEM',
  onSubmitReport,
  onClose
}) => {
  const [category, setCategory] = useState<string>(initialCategory);
  const [message, setMessage] = useState<string>(
    initialCategory === 'VEHICLE_PROBLEM'
      ? "Truck has broken down near Route 12. I cannot continue."
      : "Traffic is very heavy near the bridge. I may be 30 minutes late."
  );
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [aiPreview, setAiPreview] = useState<any>(null);
  const [isDone, setIsDone] = useState<boolean>(false);

  const categories = [
    { id: 'TRAFFIC', label: 'Traffic Gridlock' },
    { id: 'VEHICLE_PROBLEM', label: 'Vehicle Problem / Breakdown' },
    { id: 'ROAD_BLOCKED', label: 'Road Blocked / Construction' },
    { id: 'CUSTOMER_ISSUE', label: 'Customer Issue / Unavailable' },
    { id: 'WAREHOUSE_DELAY', label: 'Warehouse Delay' },
    { id: 'OTHER', label: 'Other Unexpected Situation' }
  ];

  const handleAnalyzeAndSubmit = async () => {
    if (!message.trim()) return;

    setIsAnalyzing(true);
    try {
      const res = await onSubmitReport(category, message);
      setAiPreview(res.ai_analysis);
      setIsDone(true);
      setTimeout(() => {
        onClose();
      }, 2000);
    } catch (e) {
      console.error("Error submitting report:", e);
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-lg w-full overflow-hidden my-6">
        
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 bg-slate-900 text-white">
          <div className="flex items-center space-x-2">
            <AlertTriangle className="w-5 h-5 text-amber-400" />
            <h3 className="text-sm font-extrabold uppercase tracking-wide">REPORT FIELD PROBLEM TO OPERATIONS</h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-1">
            <X className="w-5 h-5" />
          </button>
        </div>

        {isDone ? (
          <div className="p-8 text-center space-y-4">
            <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h4 className="text-lg font-bold text-slate-900">REPORT SUBMITTED TO OPERATIONS</h4>
            <div className="bg-slate-50 p-4 rounded-xl border text-left space-y-2 text-xs">
              <div className="flex items-center justify-between font-bold">
                <span className="text-slate-500">PROBLEM DETECTED:</span>
                <span className="text-red-600">{aiPreview?.problem_type || 'Vehicle Breakdown'}</span>
              </div>
              <div className="flex items-center justify-between font-bold">
                <span className="text-slate-500">URGENCY:</span>
                <span className="text-amber-600">{aiPreview?.urgency || 'CRITICAL'}</span>
              </div>
              <div className="flex items-center justify-between font-bold">
                <span className="text-slate-500">ESTIMATED DELAY:</span>
                <span className="text-slate-900">{aiPreview?.estimated_delay_mins || 60} Minutes</span>
              </div>
            </div>
            <p className="text-xs text-slate-500">Logistics Manager has been notified and AI response plans are being computed.</p>
          </div>
        ) : (
          <div className="p-5 space-y-4">
            
            {/* Category Selector */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                Problem Category
              </label>
              <div className="grid grid-cols-2 gap-2">
                {categories.map((cat) => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setCategory(cat.id)}
                    className={`p-2.5 rounded-xl border text-xs font-bold text-left transition ${
                      category === cat.id
                        ? 'bg-blue-50 border-blue-600 text-blue-900 ring-2 ring-blue-200'
                        : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-white'
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Natural Language Message Box */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                Describe What Happened (Natural Language)
              </label>
              <textarea
                rows={3}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="e.g. Truck has broken down near Route 12. Engine overheating..."
                className="w-full p-3 border border-slate-300 rounded-xl text-xs font-medium text-slate-800 focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
              />
            </div>

            {/* AI Triaging Hint */}
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 flex items-center space-x-2 text-xs text-slate-600">
              <Sparkles className="w-4 h-4 text-blue-600 shrink-0" />
              <span>AI will extract urgency, impact duration, and recommend response options to Operations Manager.</span>
            </div>

            {/* Submit Action */}
            <div className="pt-2 flex items-center justify-end space-x-3">
              <button
                onClick={onClose}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900"
              >
                Cancel
              </button>
              <button
                onClick={handleAnalyzeAndSubmit}
                disabled={isAnalyzing || !message.trim()}
                className="flex items-center space-x-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-md transition disabled:opacity-50"
              >
                {isAnalyzing ? (
                  <span>ANALYZING REPORT...</span>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>SUBMIT TO OPERATIONS</span>
                  </>
                )}
              </button>
            </div>

          </div>
        )}

      </div>
    </div>
  );
};
