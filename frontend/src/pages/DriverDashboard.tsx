import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { DriverAlertBanner } from '../components/DriverAlertBanner';
import { DriverReportModal } from '../components/DriverReportModal';
import { StatusBadge } from '../components/StatusBadge';
import { api } from '../services/api';
import type { DriverInstruction } from '../types';
import {
  Truck,
  MapPin,
  Clock,
  Navigation,
  AlertTriangle,
  Package,
  Phone,
  Volume2,
  X,
  CheckCircle2
} from 'lucide-react';

export const DriverDashboard: React.FC = () => {
  const { vehicles, submitDriverReport } = useApp();
  const [instructions, setInstructions] = useState<DriverInstruction[]>([]);
  const [isReportOpen, setIsReportOpen] = useState(false);
  const [isRouteModalOpen, setIsRouteModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('VEHICLE_PROBLEM');

  const vehicleT07 = vehicles.find((v) => v.code === 'T-07') || {
    code: 'T-07',
    driver_name: 'Arun Kumar',
    current_speed_kmh: 32.0,
    status: 'NORMAL',
    stationary_duration_secs: 0
  };

  const isStationaryAlert = vehicleT07.stationary_duration_secs >= 60 || vehicleT07.status === 'AT_RISK';

  const fetchInstructions = async () => {
    try {
      const res = await api.get('/api/driver/instructions?vehicle_code=T-07');
      setInstructions(res.data);
    } catch (e) {
      console.error("Error fetching driver instructions:", e);
    }
  };

  const handleAcknowledge = async (id: number) => {
    try {
      await api.post(`/api/driver/instructions/${id}/acknowledge`);
      fetchInstructions();
    } catch (e) {
      console.error("Error acknowledging instruction:", e);
    }
  };

  useEffect(() => {
    fetchInstructions();
    const interval = setInterval(fetchInstructions, 4000);
    return () => clearInterval(interval);
  }, []);

  const openReportWithCategory = (cat: string) => {
    setSelectedCategory(cat);
    setIsReportOpen(true);
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-slate-100 p-4 max-w-md mx-auto space-y-5 selection:bg-blue-600">
      
      {/* Mobile Header Card */}
      <div className="bg-slate-900 text-white p-5 rounded-2xl shadow-xl flex items-center justify-between">
        <div>
          <div className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400">FIELD EXECUTIVE APP</div>
          <div className="text-lg font-black tracking-tight">GOOD MORNING, ARUN</div>
          <div className="text-xs text-slate-300 font-semibold flex items-center space-x-1.5 mt-0.5">
            <Truck className="w-3.5 h-3.5 text-blue-400" />
            <span>Vehicle T-07 (TN-38-A-7421)</span>
          </div>
        </div>
        <div className="text-right">
          <span className="inline-flex items-center space-x-1 px-2.5 py-1 bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 rounded-full text-xs font-bold">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>GPS ACTIVE</span>
          </span>
          <div className="text-[11px] text-slate-400 font-bold mt-1">
            {vehicleT07.current_speed_kmh > 0 ? `${vehicleT07.current_speed_kmh} km/h` : '0 km/h (Stationary)'}
          </div>
        </div>
      </div>

      {/* Active Operational Instructions */}
      {instructions.length > 0 && instructions.some((i) => !i.is_acknowledged) && (
        <div className="space-y-3">
          {instructions
            .filter((i) => !i.is_acknowledged)
            .map((inst) => (
              <div key={inst.id} className="bg-blue-600 text-white p-5 rounded-2xl shadow-xl border-2 border-blue-400 space-y-3">
                <div className="flex items-center space-x-2">
                  <Volume2 className="w-6 h-6 text-yellow-300 shrink-0 animate-bounce" />
                  <div>
                    <div className="text-xs font-black uppercase tracking-wider text-blue-200">OPERATIONS INSTRUCTION</div>
                    <div className="text-base font-extrabold">{inst.title}</div>
                  </div>
                </div>

                <p className="text-xs text-blue-50 leading-relaxed font-medium bg-blue-700/50 p-3 rounded-xl border border-blue-500/50">
                  {inst.body}
                </p>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  {inst.avoid_route && (
                    <div className="bg-blue-800/80 p-2 rounded-lg">
                      <span className="text-[10px] text-blue-300 block font-bold uppercase">Avoid</span>
                      <span className="font-bold text-red-200">{inst.avoid_route}</span>
                    </div>
                  )}
                  {inst.take_route && (
                    <div className="bg-blue-800/80 p-2 rounded-lg">
                      <span className="text-[10px] text-blue-300 block font-bold uppercase">Take Route</span>
                      <span className="font-bold text-emerald-200">{inst.take_route}</span>
                    </div>
                  )}
                  {inst.new_eta && (
                    <div className="bg-blue-800/80 p-2 rounded-lg col-span-2">
                      <span className="text-[10px] text-blue-300 block font-bold uppercase">Updated Arrival ETA</span>
                      <span className="font-bold text-yellow-300">{inst.new_eta}</span>
                    </div>
                  )}
                </div>

                <button
                  onClick={() => handleAcknowledge(inst.id)}
                  className="w-full py-3 bg-white text-blue-900 font-black text-xs uppercase tracking-wider rounded-xl shadow-md hover:bg-blue-50 active:scale-95 transition"
                >
                  ACKNOWLEDGE INSTRUCTION
                </button>
              </div>
            ))}
        </div>
      )}

      {/* Inactivity Alert Banner */}
      {isStationaryAlert && (
        <DriverAlertBanner
          onQuickReport={openReportWithCategory}
          onOpenFullReport={() => openReportWithCategory('VEHICLE_PROBLEM')}
        />
      )}

      {/* Current Task Delivery Card */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-md space-y-4">
        <div className="flex items-center justify-between border-b pb-3 border-slate-100">
          <div>
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-blue-600">CURRENT TASK</span>
            <div className="text-lg font-extrabold text-slate-900">ORDER #1045</div>
          </div>
          <StatusBadge status="OUT_FOR_DELIVERY" size="md" />
        </div>

        <div className="space-y-2 text-xs">
          <div className="flex items-start space-x-2 text-slate-700">
            <MapPin className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-slate-900 block">Priya Sharma</span>
              <span className="text-slate-500">Flat 402, HighTech Tech Park, Sector 4</span>
            </div>
          </div>

          <div className="flex items-center space-x-2 text-slate-700">
            <Clock className="w-4 h-4 text-slate-400 shrink-0" />
            <span>Target Arrival ETA: <span className="font-extrabold text-blue-600">4:20 PM</span></span>
          </div>

          <div className="flex items-center space-x-2 text-slate-700">
            <Package className="w-4 h-4 text-slate-400 shrink-0" />
            <span>Items: Sensor Array & Microcontrollers</span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 pt-2">
          <button
            onClick={() => setIsRouteModalOpen(true)}
            className="py-3 bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs rounded-xl shadow-md flex items-center justify-center space-x-1.5 transition"
          >
            <Navigation className="w-4 h-4" />
            <span>VIEW ROUTE</span>
          </button>
          <a
            href="tel:+919600088776"
            className="py-3 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs rounded-xl border border-slate-200 flex items-center justify-center space-x-1.5 transition text-center"
          >
            <Phone className="w-4 h-4 text-slate-600" />
            <span>CALL CUSTOMER</span>
          </a>
        </div>
      </div>

      {/* Large Touch Target: REPORT A PROBLEM */}
      <button
        onClick={() => openReportWithCategory('VEHICLE_PROBLEM')}
        className="w-full py-4 bg-red-600 hover:bg-red-700 active:scale-98 text-white font-black text-sm uppercase tracking-wider rounded-2xl shadow-lg border-2 border-red-500 flex items-center justify-center space-x-2 transition"
      >
        <AlertTriangle className="w-5 h-5" />
        <span>REPORT A PROBLEM TO OPERATIONS</span>
      </button>

      {/* Today's Remaining Deliveries */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-md space-y-3">
        <div className="flex items-center justify-between border-b pb-2 border-slate-100">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900">Today's Remaining Deliveries</h3>
          <span className="text-xs font-extrabold text-slate-500">4 Orders</span>
        </div>

        <div className="space-y-2 text-xs">
          <button
            onClick={() => setIsRouteModalOpen(true)}
            className="w-full text-left p-3 bg-slate-50 hover:bg-blue-50/60 rounded-xl border border-slate-200/80 hover:border-blue-300 flex items-center justify-between transition cursor-pointer"
          >
            <div>
              <span className="font-extrabold text-slate-900 block">#1046 — Apex Medical Clinic</span>
              <span className="text-[11px] text-slate-500">Diagnostic Reagents (Cold Chain)</span>
            </div>
            <span className="font-bold text-red-600 text-xs px-2 py-0.5 bg-red-50 rounded">CRITICAL</span>
          </button>

          <button
            onClick={() => setIsRouteModalOpen(true)}
            className="w-full text-left p-3 bg-slate-50 hover:bg-blue-50/60 rounded-xl border border-slate-200/80 hover:border-blue-300 flex items-center justify-between transition cursor-pointer"
          >
            <div>
              <span className="font-extrabold text-slate-900 block">#1047 — Bosch Tech Solutions</span>
              <span className="text-[11px] text-slate-500">Automotive Micro-actuators</span>
            </div>
            <span className="font-bold text-slate-600 text-xs px-2 py-0.5 bg-slate-100 rounded">MEDIUM</span>
          </button>

          <button
            onClick={() => setIsRouteModalOpen(true)}
            className="w-full text-left p-3 bg-slate-50 hover:bg-blue-50/60 rounded-xl border border-slate-200/80 hover:border-blue-300 flex items-center justify-between transition cursor-pointer"
          >
            <div>
              <span className="font-extrabold text-slate-900 block">#1048 — Metro Retail Mart</span>
              <span className="text-[11px] text-slate-500">POS Hardware Spares</span>
            </div>
            <span className="font-bold text-slate-600 text-xs px-2 py-0.5 bg-slate-100 rounded">LOW</span>
          </button>
        </div>
      </div>

      {/* Report Problem Modal Drawer */}
      {isReportOpen && (
        <DriverReportModal
          initialCategory={selectedCategory}
          onSubmitReport={submitDriverReport}
          onClose={() => setIsReportOpen(false)}
        />
      )}

      {/* Interactive Route Details Modal */}
      {isRouteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-sm w-full p-5 space-y-4">
            <div className="flex items-center justify-between border-b pb-3 border-slate-100">
              <div className="flex items-center space-x-2 text-slate-900 font-bold text-sm">
                <Navigation className="w-4 h-4 text-blue-600" />
                <span>ROUTE R-12 NAVIGATION</span>
              </div>
              <button onClick={() => setIsRouteModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-1">
                <div className="font-bold text-slate-900">Route R-12 Waypoints</div>
                <p className="text-slate-500">Logistics Depot → Industrial Park → Bypass Ring Road → Tech Park</p>
                <div className="pt-1 flex items-center justify-between font-semibold text-slate-700">
                  <span>Total Distance: 18.5 km</span>
                  <span className="text-blue-600 font-bold">Est. 45 Mins</span>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>Depot departure completed (11:30 AM)</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>North Flyover Junction passed (02:15 PM)</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="w-4 h-4 rounded-full bg-blue-600 text-white text-[10px] font-bold flex items-center justify-center shrink-0">→</span>
                  <span className="font-bold text-blue-900">Sector 4 Industrial Park (En Route)</span>
                </div>
              </div>
            </div>

            <button
              onClick={() => setIsRouteModalOpen(false)}
              className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl transition shadow-xs"
            >
              CLOSE NAVIGATION MAP
            </button>
          </div>
        </div>
      )}

    </div>
  );
};
