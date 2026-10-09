import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Navigation, Smartphone, Eye, ArrowRight, Activity, Zap } from 'lucide-react';

export const LandingPage: React.FC = () => {
  const { loginAsRole } = useAuth();

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between selection:bg-blue-600 selection:text-white">
      <header className="px-6 py-6 border-b border-slate-800 max-w-7xl mx-auto w-full flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="bg-blue-600 p-2.5 rounded-xl text-white font-black tracking-wider text-2xl flex items-center shadow-md">
            <Navigation className="w-6 h-6 mr-1.5" />
            DROVA
          </div>
          <span className="text-xs font-semibold px-2.5 py-1 bg-slate-800 text-slate-300 rounded-full border border-slate-700">
            Enterprise SaaS Platform
          </span>
        </div>
        <div className="text-xs text-slate-400 font-semibold hidden sm:block">
          Continuous GPS Monitoring & AI Triaging Platform
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-12 flex-1 flex flex-col justify-center space-y-12">
        <div className="text-center space-y-4 max-w-3xl mx-auto">
          <div className="inline-flex items-center space-x-2 px-3 py-1 bg-blue-500/10 text-blue-400 rounded-full border border-blue-500/20 text-xs font-bold uppercase tracking-wider mb-2">
            <Zap className="w-3.5 h-3.5" />
            <span>Disruption-Aware Logistics Technology</span>
          </div>
          <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-white leading-tight">
            Understand. Decide. Adapt.
          </h1>
          <p className="text-slate-400 text-base sm:text-lg leading-relaxed">
            A disruption-aware logistics decision platform that connects operations teams, drivers, and customers to respond intelligently when delivery plans change.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4 max-w-5xl mx-auto w-full">
          <div
            onClick={() => loginAsRole('MANAGER')}
            className="group cursor-pointer bg-slate-900 border border-slate-800 hover:border-blue-500/50 p-6 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 flex flex-col justify-between space-y-6"
          >
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-xl bg-blue-600/20 border border-blue-500/30 text-blue-400 flex items-center justify-center font-bold">
                <Activity className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white group-hover:text-blue-400 transition">Logistics Manager</h3>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                  Dense operational command center. Live Leaflet GIS map, AI triaging, What-If response simulations, and automated fleet dispatching.
                </p>
              </div>
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                loginAsRole('MANAGER');
              }}
              className="w-full py-2.5 bg-blue-600 group-hover:bg-blue-500 text-white font-bold text-xs rounded-xl flex items-center justify-center space-x-2 transition shadow-md"
            >
              <span>Enter Operations Command</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          <div
            onClick={() => loginAsRole('DRIVER')}
            className="group cursor-pointer bg-slate-900 border border-slate-800 hover:border-amber-500/50 p-6 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 flex flex-col justify-between space-y-6"
          >
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-xl bg-amber-500/20 border border-amber-500/30 text-amber-400 flex items-center justify-center font-bold">
                <Smartphone className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white group-hover:text-amber-400 transition">Delivery Executive</h3>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                  Mobile-first field application. GPS tracking, automated inactivity detection prompts, natural language problem reporting, and live rerouting instructions.
                </p>
              </div>
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                loginAsRole('DRIVER');
              }}
              className="w-full py-2.5 bg-slate-800 group-hover:bg-amber-600 text-slate-200 group-hover:text-slate-950 font-bold text-xs rounded-xl flex items-center justify-center space-x-2 transition shadow-md"
            >
              <span>Open Driver App (Arun)</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          <div
            onClick={() => loginAsRole('CUSTOMER')}
            className="group cursor-pointer bg-slate-900 border border-slate-800 hover:border-emerald-500/50 p-6 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 flex flex-col justify-between space-y-6"
          >
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-xl bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 flex items-center justify-center font-bold">
                <Eye className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white group-hover:text-emerald-400 transition">Customer</h3>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                  Simple and trustworthy delivery portal. Real-time ETA updates, order status timeline, and transparent delay breakdown.
                </p>
              </div>
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                loginAsRole('CUSTOMER');
              }}
              className="w-full py-2.5 bg-slate-800 group-hover:bg-emerald-600 text-slate-200 group-hover:text-slate-950 font-bold text-xs rounded-xl flex items-center justify-center space-x-2 transition shadow-md"
            >
              <span>Track Order #1045</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="pt-8 border-t border-slate-800/80 max-w-4xl mx-auto w-full grid grid-cols-2 md:grid-cols-4 gap-4 text-center text-xs text-slate-400">
          <div className="p-3 bg-slate-900/50 rounded-lg border border-slate-800">
            <span className="block font-bold text-white">TRACK</span> Continuous GPS GIS
          </div>
          <div className="p-3 bg-slate-900/50 rounded-lg border border-slate-800">
            <span className="block font-bold text-white">DETECT</span> Smart Context Logic
          </div>
          <div className="p-3 bg-slate-900/50 rounded-lg border border-slate-800">
            <span className="block font-bold text-white">DECIDE</span> What-If Simulations
          </div>
          <div className="p-3 bg-slate-900/50 rounded-lg border border-slate-800">
            <span className="block font-bold text-white">INFORM</span> Real-Time WebSockets
          </div>
        </div>
      </main>

      <footer className="px-6 py-4 border-t border-slate-800 text-center text-xs text-slate-500">
        DROVA Platform &copy; 2026. Built with React, TypeScript, Tailwind CSS, FastAPI, WebSockets & PostgreSQL.
      </footer>
    </div>
  );
};
