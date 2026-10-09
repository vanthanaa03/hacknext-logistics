import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useApp } from '../context/AppContext';
import { Play, AlertOctagon, Square, Settings, Navigation } from 'lucide-react';
import { SettingsModal } from './SettingsModal';

export const Navbar: React.FC = () => {
  const { activeRole, user, loginAsRole } = useAuth();
  const { isSimulatingGPS, startGPSSimulation, disruptGPSSimulation, stopGPSSimulation } = useApp();
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const handleRoleChange = (role: 'MANAGER' | 'DRIVER' | 'CUSTOMER') => {
    loginAsRole(role);
  };

  return (
    <>
      <header className="bg-slate-900 text-white border-b border-slate-800 sticky top-0 z-30 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            
            <div className="flex items-center space-x-3">
              <div className="bg-blue-600 p-2 rounded-lg text-white font-black tracking-wider text-xl flex items-center shadow-xs">
                <Navigation className="w-5 h-5 mr-1" />
                DROVA
              </div>
              <div className="hidden sm:block border-l border-slate-700 pl-3">
                <div className="text-xs font-semibold text-slate-300 tracking-wider uppercase">Disruption-Aware Logistics</div>
                <div className="text-[11px] text-slate-400 italic">Understand. Decide. Adapt.</div>
              </div>
            </div>

            <div className="hidden lg:flex items-center space-x-2 bg-slate-800/80 p-1.5 rounded-lg border border-slate-700">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider px-2">GPS Demo:</span>
              {!isSimulatingGPS ? (
                <button
                  onClick={startGPSSimulation}
                  className="flex items-center space-x-1 px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded shadow-xs transition"
                >
                  <Play className="w-3.5 h-3.5" />
                  <span>Start GPS Simulation</span>
                </button>
              ) : (
                <>
                  <button
                    onClick={disruptGPSSimulation}
                    className="flex items-center space-x-1 px-3 py-1 bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold rounded shadow-xs transition animate-pulse"
                  >
                    <AlertOctagon className="w-3.5 h-3.5" />
                    <span>Simulate Disruption (T-07 Stop)</span>
                  </button>
                  <button
                    onClick={stopGPSSimulation}
                    className="flex items-center space-x-1 px-3 py-1 bg-slate-700 hover:bg-slate-600 text-slate-200 text-xs font-semibold rounded shadow-xs transition"
                  >
                    <Square className="w-3.5 h-3.5" />
                    <span>Reset</span>
                  </button>
                </>
              )}
            </div>

            <div className="flex items-center space-x-3">
              <div className="flex bg-slate-800 p-1 rounded-lg border border-slate-700">
                <button
                  onClick={() => handleRoleChange('MANAGER')}
                  className={`px-3 py-1 text-xs font-medium rounded-md transition ${
                    activeRole === 'MANAGER'
                      ? 'bg-blue-600 text-white font-semibold shadow-xs'
                      : 'text-slate-300 hover:text-white'
                  }`}
                >
                  Manager
                </button>
                <button
                  onClick={() => handleRoleChange('DRIVER')}
                  className={`px-3 py-1 text-xs font-medium rounded-md transition ${
                    activeRole === 'DRIVER'
                      ? 'bg-blue-600 text-white font-semibold shadow-xs'
                      : 'text-slate-300 hover:text-white'
                  }`}
                >
                  Driver App
                </button>
                <button
                  onClick={() => handleRoleChange('CUSTOMER')}
                  className={`px-3 py-1 text-xs font-medium rounded-md transition ${
                    activeRole === 'CUSTOMER'
                      ? 'bg-blue-600 text-white font-semibold shadow-xs'
                      : 'text-slate-300 hover:text-white'
                  }`}
                >
                  Customer
                </button>
              </div>

              {activeRole === 'MANAGER' && (
                <button
                  onClick={() => setIsSettingsOpen(true)}
                  className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition"
                  title="Manager Settings"
                >
                  <Settings className="w-5 h-5" />
                </button>
              )}

              <div className="hidden sm:flex items-center space-x-2 pl-2 border-l border-slate-800">
                <div className="w-8 h-8 rounded-full bg-slate-700 text-white flex items-center justify-center font-bold text-xs">
                  {user?.full_name ? user.full_name.charAt(0) : 'U'}
                </div>
                <div className="text-left text-xs">
                  <div className="font-semibold text-slate-200">{user?.full_name || 'User'}</div>
                  <div className="text-[10px] text-slate-400 uppercase">{activeRole}</div>
                </div>
              </div>

            </div>

          </div>
        </div>
      </header>

      {isSettingsOpen && <SettingsModal onClose={() => setIsSettingsOpen(false)} />}
    </>
  );
};
