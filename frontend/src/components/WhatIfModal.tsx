import React, { useState } from 'react';
import type { RecommendationPlan } from '../types';
import { X, Sparkles, CheckCircle2, ArrowRight, DollarSign, Clock, PackageCheck } from 'lucide-react';

interface WhatIfModalProps {
  disruptionId: number;
  recommendations: RecommendationPlan[];
  onConfirmPlan: (optionCode: string) => Promise<void>;
  onClose: () => void;
}

export const WhatIfModal: React.FC<WhatIfModalProps> = ({
  recommendations,
  onConfirmPlan,
  onClose
}) => {
  const [selectedOptionCode, setSelectedOptionCode] = useState<string>('OPTION_B');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const defaultRecs: RecommendationPlan[] = [
    {
      id: 1,
      option_code: 'OPTION_A',
      title: 'Assign Backup Vehicle',
      description: 'Dispatch dedicated emergency relief van (V-02) from central hub to handle remaining 8 deliveries.',
      cost_inr: 500,
      delay_mins: 15,
      deliveries_saved: 7,
      customer_impact_level: 'Low',
      operational_risk_level: 'Low',
      is_ai_recommended: false
    },
    {
      id: 2,
      option_code: 'OPTION_B',
      title: 'Transfer Packages to Vehicle T-09',
      description: 'Reroute nearby active vehicle T-09 (currently 1.2 km away) to take 8 packages and merge route R-15.',
      cost_inr: 300,
      delay_mins: 25,
      deliveries_saved: 6,
      customer_impact_level: 'Medium',
      operational_risk_level: 'Low',
      is_ai_recommended: true
    },
    {
      id: 3,
      option_code: 'OPTION_C',
      title: 'Wait for Roadside Repair',
      description: 'Wait for roadside assistance crew to repair vehicle T-07 on site. High vulnerability to cumulative SLA breach.',
      cost_inr: 0,
      delay_mins: 90,
      deliveries_saved: 2,
      customer_impact_level: 'High',
      operational_risk_level: 'High',
      is_ai_recommended: false
    }
  ];

  const plans = recommendations && recommendations.length > 0 ? recommendations : defaultRecs;

  const handleConfirm = async () => {
    setIsSubmitting(true);
    try {
      await onConfirmPlan(selectedOptionCode);
      setIsSuccess(true);
      setTimeout(() => {
        onClose();
      }, 1800);
    } catch (e) {
      console.error("Error executing manager decision:", e);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-4xl w-full overflow-hidden my-8">
        
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-900 text-white">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-600/30 text-blue-400 rounded-lg border border-blue-500/40">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-extrabold tracking-tight">COMPARE RESPONSE PLANS — WHAT-IF SIMULATION</h2>
              <p className="text-xs text-slate-400">AI RECOMMENDS — MANAGER DECIDES. Select optimal operational recovery plan.</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-1 rounded-lg transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        {isSuccess ? (
          <div className="p-12 text-center space-y-4">
            <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-inner animate-bounce">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <h3 className="text-xl font-bold text-slate-900">PLAN CONFIRMED & EXECUTED</h3>
            <p className="text-sm text-slate-600 max-w-md mx-auto">
              Operations have been updated successfully. Database records updated, vehicle assignment reassigned to T-09, driver instruction dispatched, and customer ETAs updated.
            </p>
            <div className="inline-block px-4 py-1.5 bg-emerald-50 text-emerald-700 text-xs font-bold rounded-full border border-emerald-200">
              DISRUPTION STATUS: RESOLVED
            </div>
          </div>
        ) : (
          <div className="p-6 space-y-6">
            
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-3 h-3 rounded-full bg-blue-600 animate-ping" />
                <span className="text-xs font-semibold text-blue-900">
                  Target Disruption: <span className="font-extrabold">Vehicle Breakdown (T-07)</span> — 8 Deliveries Affected
                </span>
              </div>
              <span className="text-xs font-bold px-2.5 py-1 bg-white text-blue-700 rounded-md border border-blue-200 shadow-2xs">
                3 Plans Evaluated
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {plans.map((plan) => {
                const isSelected = selectedOptionCode === plan.option_code;
                return (
                  <div
                    key={plan.option_code}
                    onClick={() => setSelectedOptionCode(plan.option_code)}
                    className={`relative cursor-pointer rounded-xl border p-5 flex flex-col justify-between transition-all ${
                      isSelected
                        ? 'bg-white border-blue-600 ring-2 ring-blue-500/20 shadow-lg scale-[1.01]'
                        : 'bg-slate-50 border-slate-200 hover:border-slate-300 hover:bg-white'
                    }`}
                  >
                    {plan.is_ai_recommended && (
                      <div className="absolute -top-3 left-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full shadow-xs flex items-center space-x-1">
                        <Sparkles className="w-3 h-3" />
                        <span>AI Recommended</span>
                      </div>
                    )}

                    <div className="space-y-3">
                      <div className="flex items-center justify-between pt-1">
                        <span className="text-xs font-extrabold text-slate-400 uppercase tracking-wider">{plan.option_code.replace('_', ' ')}</span>
                        <input
                          type="radio"
                          name="plan_selection"
                          checked={isSelected}
                          onChange={() => setSelectedOptionCode(plan.option_code)}
                          className="w-4 h-4 text-blue-600 focus:ring-blue-500"
                        />
                      </div>

                      <h4 className="text-sm font-extrabold text-slate-900 leading-snug">{plan.title}</h4>
                      <p className="text-xs text-slate-500 leading-relaxed min-h-[48px]">{plan.description}</p>

                      <div className="space-y-2 pt-2 border-t border-slate-100">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-slate-500 flex items-center">
                            <Clock className="w-3.5 h-3.5 text-slate-400 mr-1" />
                            Estimated Delay:
                          </span>
                          <span className={`font-bold ${plan.delay_mins > 45 ? 'text-red-600' : 'text-slate-800'}`}>
                            {plan.delay_mins} min
                          </span>
                        </div>

                        <div className="flex items-center justify-between text-xs">
                          <span className="text-slate-500 flex items-center">
                            <DollarSign className="w-3.5 h-3.5 text-slate-400 mr-0.5" />
                            Operational Cost:
                          </span>
                          <span className="font-bold text-slate-800">
                            ₹{plan.cost_inr}
                          </span>
                        </div>

                        <div className="flex items-center justify-between text-xs">
                          <span className="text-slate-500 flex items-center">
                            <PackageCheck className="w-3.5 h-3.5 text-slate-400 mr-1" />
                            Deliveries Saved:
                          </span>
                          <span className="font-bold text-emerald-600">
                            {plan.deliveries_saved} / 8
                          </span>
                        </div>

                        <div className="flex items-center justify-between text-xs">
                          <span className="text-slate-500">Customer Impact:</span>
                          <span className={`font-bold px-2 py-0.5 rounded text-[10px] ${
                            plan.customer_impact_level === 'Low' ? 'bg-emerald-50 text-emerald-700' :
                            plan.customer_impact_level === 'Medium' ? 'bg-amber-50 text-amber-700' : 'bg-red-50 text-red-700'
                          }`}>
                            {plan.customer_impact_level}
                          </span>
                        </div>

                        <div className="flex items-center justify-between text-xs">
                          <span className="text-slate-500">Operational Risk:</span>
                          <span className={`font-bold px-2 py-0.5 rounded text-[10px] ${
                            plan.operational_risk_level === 'Low' ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'
                          }`}>
                            {plan.operational_risk_level}
                          </span>
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => setSelectedOptionCode(plan.option_code)}
                      className={`w-full mt-4 py-2 text-xs font-bold rounded-lg border transition ${
                        isSelected
                          ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                          : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {isSelected ? 'SELECTED PLAN' : 'SELECT PLAN'}
                    </button>
                  </div>
                );
              })}
            </div>

            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 flex items-center justify-between">
              <div className="text-xs text-slate-600">
                Selected Plan: <span className="font-extrabold text-slate-900">{plans.find(p => p.option_code === selectedOptionCode)?.title}</span>
              </div>

              <div className="flex items-center space-x-3">
                <button
                  onClick={onClose}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirm}
                  disabled={isSubmitting}
                  className="flex items-center space-x-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-lg shadow-md transition disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <span>Executing Plan...</span>
                  ) : (
                    <>
                      <span>CONFIRM & EXECUTE PLAN</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </div>

          </div>
        )}

      </div>
    </div>
  );
};
