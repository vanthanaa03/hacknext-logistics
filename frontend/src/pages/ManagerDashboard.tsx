import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import { Sidebar } from '../components/Sidebar';
import { StatCard } from '../components/StatCard';
import { StatusBadge } from '../components/StatusBadge';
import { LeafletMap } from '../components/LeafletMap';
import { RippleEffectGraph } from '../components/RippleEffectGraph';
import { WhatIfModal } from '../components/WhatIfModal';
import { SettingsModal } from '../components/SettingsModal';
import type { Disruption } from '../types';
import {
  AlertTriangle,
  Clock,
  Sparkles,
  ChevronRight,
  Search,
  RefreshCw,
  TrendingUp,
  Package,
  Truck,
  Cpu,
  BarChart3,
  Sliders,
  Play,
  AlertOctagon,
  X
} from 'lucide-react';

export const ManagerDashboard: React.FC = () => {
  const {
    vehicles,
    disruptions,
    deliveries,
    selectedVehicle,
    setSelectedVehicle,
    activeDisruption,
    setActiveDisruption,
    isSimulatingGPS,
    startGPSSimulation,
    disruptGPSSimulation,
    stopGPSSimulation,
    confirmManagerPlan,
    refreshData
  } = useApp();

  const { loginAsRole } = useAuth();

  const [activeTab, setActiveTab] = useState<string>('live-ops');
  const [isWhatIfOpen, setIsWhatIfOpen] = useState<boolean>(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');

  const vehicleT07 = vehicles.find((v) => v.code === 'T-07') || (vehicles[0] || null);
  const currentFocusVehicle = selectedVehicle || vehicleT07;
  const targetDisruption = activeDisruption || disruptions.find((d) => d.status === 'AT_RISK' || d.status === 'ACTIVE') || disruptions[0] || null;

  // Filtered lists based on search bar query
  const filteredVehicles = vehicles.filter(
    (v) =>
      v.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.driver_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.route_code.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredDeliveries = deliveries.filter(
    (d) =>
      d.tracking_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.customer_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.items_description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredDisruptions = disruptions.filter(
    (dis) =>
      dis.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      dis.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      dis.vehicle_code.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSelectDisruption = (disrupt: Disruption) => {
    setActiveDisruption(disrupt);
    const linkedVeh = vehicles.find((v) => v.code === disrupt.vehicle_code);
    if (linkedVeh) setSelectedVehicle(linkedVeh);
  };

  return (
    <div className="flex bg-slate-100 min-h-[calc(100vh-4rem)]">
      
      {/* Sidebar Navigation */}
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Main Workspace Area */}
      <main className="flex-1 p-6 space-y-6 overflow-y-auto max-w-7xl mx-auto">
        
        {/* Top Control & Search Bar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-black text-slate-900 tracking-tight uppercase">
              OPERATIONS COMMAND CENTER
            </h1>
            <p className="text-xs text-slate-500">
              Continuous GPS Tracking & Automated Disruption Decisioning Engine
            </p>
          </div>

          <div className="flex items-center space-x-3">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Filter by vehicle, route, order #..."
                className="pl-9 pr-8 py-2 bg-white border border-slate-200 rounded-lg text-xs font-medium focus:ring-2 focus:ring-blue-500 focus:outline-hidden w-64 shadow-2xs"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600"
                  title="Clear Search"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
            <button
              onClick={() => refreshData()}
              className="p-2 bg-white border border-slate-200 rounded-lg text-slate-600 hover:text-slate-900 transition flex items-center space-x-1"
              title="Refresh Stream Data"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Overview & Live-Ops Main View */}
        {(activeTab === 'overview' || activeTab === 'live-ops') && (
          <div className="space-y-6">
            
            {/* Stat Summary Row */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div onClick={() => setActiveTab('disruptions')} className="cursor-pointer">
                <StatCard
                  label="ACTIVE DISRUPTIONS"
                  value={disruptions.filter(d => d.status !== 'RESOLVED').length || "03"}
                  subtext="01 Mechanical / 02 Traffic"
                  color="red"
                  icon={<AlertTriangle className="w-5 h-5 text-red-500" />}
                />
              </div>
              <div onClick={() => setActiveTab('deliveries')} className="cursor-pointer">
                <StatCard
                  label="DELIVERIES AT RISK"
                  value={deliveries.filter(d => d.delay_minutes > 0 || d.status === 'AT_RISK').length || "08"}
                  subtext="8 Consignments in Route R-12"
                  color="amber"
                  icon={<Package className="w-5 h-5 text-amber-500" />}
                />
              </div>
              <div onClick={() => setActiveTab('vehicles')} className="cursor-pointer">
                <StatCard
                  label="VEHICLES AFFECTED"
                  value={vehicles.filter(v => v.status !== 'NORMAL').length || "02"}
                  subtext="T-07 (Stationary) & T-09 (Rerouting)"
                  color="blue"
                  icon={<TrendingUp className="w-5 h-5 text-blue-500" />}
                />
              </div>
              <div onClick={() => setIsSettingsOpen(true)} className="cursor-pointer">
                <StatCard
                  label="INACTIVITY THRESHOLD"
                  value="60s"
                  subtext="Configurable Threshold (Active)"
                  color="emerald"
                  icon={<Sliders className="w-5 h-5 text-emerald-500" />}
                />
              </div>
            </div>

            {/* Map & Disruption Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              
              {/* Left Column (8 cols): Leaflet GIS Operations Map */}
              <div className="lg:col-span-8 space-y-4">
                <div className="bg-white rounded-xl border border-slate-200 p-4 space-y-3 shadow-xs">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <h2 className="text-sm font-bold text-slate-900 uppercase tracking-tight">LIVE OPERATIONS MAP</h2>
                      <span className="text-[10px] font-bold px-2 py-0.5 bg-blue-50 text-blue-700 rounded-full border border-blue-200">
                        OpenStreetMap GIS
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      {!isSimulatingGPS ? (
                        <button
                          onClick={startGPSSimulation}
                          className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-md shadow-xs transition flex items-center space-x-1"
                        >
                          <Play className="w-3.5 h-3.5" />
                          <span>Start GPS Sim</span>
                        </button>
                      ) : (
                        <button
                          onClick={disruptGPSSimulation}
                          className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-md shadow-xs transition animate-pulse flex items-center space-x-1"
                        >
                          <AlertOctagon className="w-3.5 h-3.5" />
                          <span>Simulate Disruption (T-07 Stop)</span>
                        </button>
                      )}
                    </div>
                  </div>

                  <LeafletMap
                    vehicles={filteredVehicles}
                    deliveries={filteredDeliveries}
                    selectedVehicle={currentFocusVehicle}
                    onSelectVehicle={setSelectedVehicle}
                    onOpenDisruptionWorkspace={() => setIsWhatIfOpen(true)}
                  />
                </div>

                <RippleEffectGraph
                  disruptionTitle={targetDisruption?.title || "Vehicle Breakdown (T-07)"}
                  vehicleCode={targetDisruption?.vehicle_code || "T-07"}
                  routeCode={targetDisruption?.route_code || "R-12"}
                  affectedDeliveriesCount={targetDisruption?.affected_deliveries_count || 8}
                  priorityCustomersCount={3}
                />
              </div>

              {/* Right Column (4 cols): Disruption Incident Panel */}
              <div className="lg:col-span-4 space-y-4">
                
                <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-4 shadow-xs">
                  <div className="flex items-center justify-between border-b pb-3 border-slate-100">
                    <div>
                      <span className="text-[10px] font-extrabold uppercase tracking-wider text-red-600">INCIDENT PANEL</span>
                      <h3 className="text-sm font-extrabold text-slate-900">
                        {targetDisruption?.code || "INC-2026-08"}
                      </h3>
                    </div>
                    <StatusBadge status={targetDisruption?.severity || "CRITICAL"} size="md" />
                  </div>

                  <div className="space-y-2">
                    <div className="text-sm font-bold text-slate-800">
                      {targetDisruption?.title || "Vehicle T-07 Breakdown / Inactivity"}
                    </div>
                    <div className="flex items-center space-x-2 text-xs text-slate-500">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      <span>Detected: 01:42 ago (Stationary)</span>
                    </div>
                  </div>

                  <div className="bg-slate-50 p-3 rounded-lg border border-slate-200/80 space-y-1.5 text-xs">
                    <div className="flex justify-between text-slate-700">
                      <span>Affected Deliveries:</span>
                      <span className="font-bold text-slate-900">8 Orders</span>
                    </div>
                    <div className="flex justify-between text-slate-700">
                      <span>Priority VIP Clients:</span>
                      <span className="font-bold text-red-600">3 Priority Customers</span>
                    </div>
                    <div className="flex justify-between text-slate-700">
                      <span>Estimated Delay:</span>
                      <span className="font-bold text-amber-600">60 Minutes</span>
                    </div>
                  </div>

                  {targetDisruption?.driver_report && (
                    <div className="bg-amber-50/70 border border-amber-200 p-3 rounded-lg space-y-1 text-xs">
                      <div className="font-bold text-amber-900 uppercase text-[10px]">Driver Field Report</div>
                      <p className="text-amber-950 font-medium italic">
                        "{targetDisruption.driver_report.message}"
                      </p>
                    </div>
                  )}

                  <div className="bg-blue-50/80 border border-blue-200 p-4 rounded-xl space-y-2 text-xs">
                    <div className="flex items-center justify-between text-blue-900 font-extrabold text-xs">
                      <div className="flex items-center space-x-1">
                        <Sparkles className="w-4 h-4 text-blue-600" />
                        <span>AI ANALYSIS SUMMARY</span>
                      </div>
                      <span className="text-[10px] bg-white text-blue-700 px-2 py-0.5 rounded border border-blue-200 font-bold">
                        High Confidence (94%)
                      </span>
                    </div>

                    <div className="space-y-1 text-slate-700">
                      <div>Problem: <span className="font-bold text-slate-900">{targetDisruption?.ai_analysis?.problem_type || "Vehicle Breakdown"}</span></div>
                      <div>Suggested Action: <span className="font-bold text-slate-900">{targetDisruption?.ai_analysis?.suggested_action || "Assign backup vehicle or transfer packages to T-09"}</span></div>
                    </div>
                  </div>

                  <div className="pt-2">
                    <button
                      onClick={() => setIsWhatIfOpen(true)}
                      className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs rounded-xl shadow-md transition flex items-center justify-center space-x-2"
                    >
                      <Sparkles className="w-4 h-4" />
                      <span>SIMULATE & COMPARE RESPONSE PLANS</span>
                      <ChevronRight className="w-4 h-4" />
                    </button>
                    <p className="text-[10px] text-slate-400 text-center mt-1.5 font-medium">
                      AI RECOMMENDS — MANAGER DECIDES
                    </p>
                  </div>

                </div>

                {/* Active Incidents List */}
                <div className="bg-white rounded-xl border border-slate-200 p-4 space-y-3 shadow-xs">
                  <div className="flex items-center justify-between border-b pb-2 border-slate-100">
                    <h3 className="text-xs font-bold uppercase text-slate-900">Active Incidents List</h3>
                    <span className="text-xs text-slate-500 font-semibold">{filteredDisruptions.length} Incidents</span>
                  </div>

                  <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
                    {filteredDisruptions.map((disrupt) => (
                      <div
                        key={disrupt.id}
                        onClick={() => handleSelectDisruption(disrupt)}
                        className={`p-3 rounded-lg border text-xs cursor-pointer transition ${
                          targetDisruption?.id === disrupt.id
                            ? 'bg-blue-50/80 border-blue-500 text-slate-900 shadow-2xs'
                            : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-extrabold text-slate-900">{disrupt.code}</span>
                          <StatusBadge status={disrupt.status} size="sm" />
                        </div>
                        <div className="font-semibold text-slate-800 truncate">{disrupt.title}</div>
                        <div className="text-[10px] text-slate-500 mt-1 flex justify-between">
                          <span>Vehicle: {disrupt.vehicle_code}</span>
                          <span>{disrupt.affected_deliveries_count} Deliveries</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

              </div>

            </div>
          </div>
        )}

        {/* Tab: Disruptions */}
        {activeTab === 'disruptions' && (
          <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-4 shadow-xs">
            <div className="flex items-center justify-between border-b pb-4 border-slate-100">
              <div>
                <h2 className="text-lg font-bold text-slate-900">INCIDENT DISRUPTION MANAGEMENT</h2>
                <p className="text-xs text-slate-500">Full audit log of active, investigating, and resolved operational disruptions.</p>
              </div>
              <button
                onClick={disruptGPSSimulation}
                className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-lg shadow-xs transition"
              >
                + Trigger Test Disruption (T-07)
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50 text-slate-500 font-bold uppercase border-b border-slate-200">
                    <th className="p-3">Incident Code</th>
                    <th className="p-3">Disruption Title</th>
                    <th className="p-3">Vehicle</th>
                    <th className="p-3">Route</th>
                    <th className="p-3">Stationary Duration</th>
                    <th className="p-3">Severity</th>
                    <th className="p-3">Status</th>
                    <th className="p-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredDisruptions.map((disrupt) => (
                    <tr key={disrupt.id} className="hover:bg-slate-50 transition">
                      <td className="p-3 font-bold text-slate-900">{disrupt.code}</td>
                      <td className="p-3 font-semibold text-slate-800">{disrupt.title}</td>
                      <td className="p-3 text-slate-700 font-bold">{disrupt.vehicle_code}</td>
                      <td className="p-3 text-slate-700">{disrupt.route_code}</td>
                      <td className="p-3 text-slate-700">
                        {Math.floor(disrupt.stationary_duration_secs / 60)}m {disrupt.stationary_duration_secs % 60}s
                      </td>
                      <td className="p-3">
                        <StatusBadge status={disrupt.severity} size="sm" />
                      </td>
                      <td className="p-3">
                        <StatusBadge status={disrupt.status} size="sm" />
                      </td>
                      <td className="p-3 text-right">
                        <button
                          onClick={() => {
                            handleSelectDisruption(disrupt);
                            setIsWhatIfOpen(true);
                          }}
                          className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded text-xs transition"
                        >
                          Simulate Plan
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab: Deliveries */}
        {activeTab === 'deliveries' && (
          <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-4 shadow-xs">
            <div className="flex items-center justify-between border-b pb-4 border-slate-100">
              <div>
                <h2 className="text-lg font-bold text-slate-900">DELIVERY CONSIGNMENTS ROSTER</h2>
                <p className="text-xs text-slate-500">Live SLA monitoring and customer delivery ETA updates.</p>
              </div>
              <span className="text-xs font-bold text-blue-700 bg-blue-50 px-3 py-1 rounded-full border border-blue-200">
                {filteredDeliveries.length} Consignments Tracked
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50 text-slate-500 font-bold uppercase border-b border-slate-200">
                    <th className="p-3">Order #</th>
                    <th className="p-3">Customer</th>
                    <th className="p-3">Items Description</th>
                    <th className="p-3">Address</th>
                    <th className="p-3">Priority</th>
                    <th className="p-3">Assigned Vehicle</th>
                    <th className="p-3">Original ETA</th>
                    <th className="p-3">Estimated ETA</th>
                    <th className="p-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredDeliveries.map((del) => (
                    <tr key={del.id} className="hover:bg-slate-50 transition">
                      <td className="p-3 font-bold text-blue-600">{del.tracking_number}</td>
                      <td className="p-3 font-semibold text-slate-900">{del.customer_name}</td>
                      <td className="p-3 text-slate-600">{del.items_description}</td>
                      <td className="p-3 text-slate-600 truncate max-w-[180px]">{del.delivery_address}</td>
                      <td className="p-3">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          del.priority === 'CRITICAL' ? 'bg-red-100 text-red-700' : 'bg-slate-100 text-slate-700'
                        }`}>
                          {del.priority}
                        </span>
                      </td>
                      <td className="p-3 font-bold text-slate-800">{del.vehicle_code}</td>
                      <td className="p-3 text-slate-500">{del.original_eta}</td>
                      <td className={`p-3 font-bold ${del.delay_minutes > 0 ? 'text-amber-600' : 'text-slate-900'}`}>
                        {del.estimated_eta} {del.delay_minutes > 0 && `(+${del.delay_minutes}m)`}
                      </td>
                      <td className="p-3">
                        <StatusBadge status={del.status} size="sm" />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab: Vehicles */}
        {activeTab === 'vehicles' && (
          <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-4 shadow-xs">
            <div className="flex items-center justify-between border-b pb-4 border-slate-100">
              <div>
                <h2 className="text-lg font-bold text-slate-900">FLEET VEHICLE MONITORING</h2>
                <p className="text-xs text-slate-500">Live speed, capacity, driver assignment, and GPS coordinates.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {filteredVehicles.map((v) => (
                <div
                  key={v.id}
                  onClick={() => {
                    setSelectedVehicle(v);
                    setActiveTab('live-ops');
                  }}
                  className="cursor-pointer border border-slate-200 rounded-xl p-4 bg-slate-50 hover:bg-white hover:border-blue-500 transition space-y-3 shadow-2xs"
                >
                  <div className="flex items-center justify-between border-b pb-2 border-slate-200">
                    <div className="font-extrabold text-slate-900 flex items-center space-x-2">
                      <Truck className="w-4 h-4 text-blue-600" />
                      <span>VEHICLE {v.code}</span>
                    </div>
                    <StatusBadge status={v.status} size="sm" />
                  </div>

                  <div className="space-y-1.5 text-xs text-slate-700">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Driver:</span>
                      <span className="font-bold text-slate-900">{v.driver_name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Active Route:</span>
                      <span className="font-bold text-slate-900">{v.route_code}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Current Speed:</span>
                      <span className="font-bold text-slate-900">{v.current_speed_kmh} km/h</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Stationary Timer:</span>
                      <span className={`font-bold ${v.stationary_duration_secs > 60 ? 'text-red-600' : 'text-slate-900'}`}>
                        {Math.floor(v.stationary_duration_secs / 60)}m {v.stationary_duration_secs % 60}s
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedVehicle(v);
                      setActiveTab('live-ops');
                    }}
                    className="w-full py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-lg transition text-center"
                  >
                    Locate on Live Map
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab: Drivers */}
        {activeTab === 'drivers' && (
          <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-4 shadow-xs">
            <div className="flex items-center justify-between border-b pb-4 border-slate-100">
              <div>
                <h2 className="text-lg font-bold text-slate-900">FIELD DRIVERS ROSTER</h2>
                <p className="text-xs text-slate-500">Active field delivery executives and assigned vehicles.</p>
              </div>
              <button
                onClick={() => loginAsRole('DRIVER')}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-lg shadow-xs transition"
              >
                Switch to Driver App View
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="border border-slate-200 rounded-xl p-4 bg-slate-50 space-y-3">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center text-sm">
                    AK
                  </div>
                  <div>
                    <div className="font-bold text-slate-900 text-sm">Arun Kumar</div>
                    <div className="text-xs text-slate-500">License: TN-38-2022-9481</div>
                  </div>
                </div>
                <div className="text-xs space-y-1 text-slate-700 pt-2 border-t border-slate-200">
                  <div className="flex justify-between"><span>Assigned Vehicle:</span><span className="font-bold">Vehicle T-07</span></div>
                  <div className="flex justify-between"><span>Rating:</span><span className="font-bold text-amber-600">4.9 ★</span></div>
                  <div className="flex justify-between"><span>Phone:</span><span className="font-bold">+91 97890 54321</span></div>
                </div>
              </div>

              <div className="border border-slate-200 rounded-xl p-4 bg-slate-50 space-y-3">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-full bg-emerald-600 text-white font-bold flex items-center justify-center text-sm">
                    MN
                  </div>
                  <div>
                    <div className="font-bold text-slate-900 text-sm">Meera Nair</div>
                    <div className="text-xs text-slate-500">License: TN-37-2021-3810</div>
                  </div>
                </div>
                <div className="text-xs space-y-1 text-slate-700 pt-2 border-t border-slate-200">
                  <div className="flex justify-between"><span>Assigned Vehicle:</span><span className="font-bold">Vehicle T-09</span></div>
                  <div className="flex justify-between"><span>Rating:</span><span className="font-bold text-amber-600">4.85 ★</span></div>
                  <div className="flex justify-between"><span>Phone:</span><span className="font-bold">+91 98940 98765</span></div>
                </div>
              </div>

              <div className="border border-slate-200 rounded-xl p-4 bg-slate-50 space-y-3">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-full bg-purple-600 text-white font-bold flex items-center justify-center text-sm">
                    RM
                  </div>
                  <div>
                    <div className="font-bold text-slate-900 text-sm">Rahul Menon</div>
                    <div className="text-xs text-slate-500">License: TN-39-2020-1192</div>
                  </div>
                </div>
                <div className="text-xs space-y-1 text-slate-700 pt-2 border-t border-slate-200">
                  <div className="flex justify-between"><span>Assigned Vehicle:</span><span className="font-bold">Vehicle T-12</span></div>
                  <div className="flex justify-between"><span>Rating:</span><span className="font-bold text-amber-600">4.92 ★</span></div>
                  <div className="flex justify-between"><span>Phone:</span><span className="font-bold">+91 97910 11223</span></div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab: Simulations */}
        {activeTab === 'simulations' && (
          <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-5 shadow-xs">
            <div className="flex items-center justify-between border-b pb-4 border-slate-100">
              <div>
                <h2 className="text-lg font-bold text-slate-900 flex items-center space-x-2">
                  <Cpu className="w-5 h-5 text-blue-600" />
                  <span>GPS DISRUPTION SIMULATION CONTROL</span>
                </h2>
                <p className="text-xs text-slate-500">Interactive testing environment for evaluating disruption detection and What-If plan execution.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl space-y-3">
                <div className="font-bold text-blue-900 text-sm">Step 1: Normal GPS Movement</div>
                <p className="text-xs text-slate-600">Start vehicle T-07 moving along predefined route R-12 waypoints on the Leaflet GIS map.</p>
                <button
                  onClick={startGPSSimulation}
                  className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-lg transition"
                >
                  START GPS SIMULATION
                </button>
              </div>

              <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl space-y-3">
                <div className="font-bold text-amber-900 text-sm">Step 2: Trigger Disruption</div>
                <p className="text-xs text-slate-600">Halt vehicle T-07 immediately. Inactivity timer exceeds 60s threshold, creating AT RISK event.</p>
                <button
                  onClick={disruptGPSSimulation}
                  className="w-full py-2.5 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-lg transition animate-pulse"
                >
                  SIMULATE DISRUPTION (T-07)
                </button>
              </div>

              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
                <div className="font-bold text-slate-900 text-sm">Step 3: Reset Environment</div>
                <p className="text-xs text-slate-600">Reset vehicle status and stationary timers back to normal operational baseline.</p>
                <button
                  onClick={stopGPSSimulation}
                  className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-lg transition"
                >
                  RESET SIMULATION
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Tab: Reports */}
        {activeTab === 'reports' && (
          <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-5 shadow-xs">
            <div className="border-b pb-3 border-slate-100">
              <h2 className="text-lg font-bold text-slate-900 flex items-center space-x-2">
                <BarChart3 className="w-5 h-5 text-blue-600" />
                <span>OPERATIONAL ANALYTICS & SLA PERFORMANCE</span>
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-1">
                <span className="text-xs font-bold text-slate-500 uppercase">On-Time Delivery SLA</span>
                <div className="text-2xl font-black text-emerald-600">98.4%</div>
                <span className="text-[11px] text-slate-400">Target: 95.0%</span>
              </div>
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-1">
                <span className="text-xs font-bold text-slate-500 uppercase">Avg Disruption Recovery Time</span>
                <div className="text-2xl font-black text-blue-600">14.2 Mins</div>
                <span className="text-[11px] text-slate-400">Previous Avg: 45 Mins</span>
              </div>
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-1">
                <span className="text-xs font-bold text-slate-500 uppercase">Est. Cost Saved (AI Triaging)</span>
                <div className="text-2xl font-black text-purple-600">₹42,500</div>
                <span className="text-[11px] text-slate-400">Last 30 Days</span>
              </div>
            </div>
          </div>
        )}

        {/* Tab: Settings */}
        {activeTab === 'settings' && (
          <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-4 shadow-xs">
            <div className="border-b pb-3 border-slate-100">
              <h2 className="text-lg font-bold text-slate-900 flex items-center space-x-2">
                <Sliders className="w-5 h-5 text-blue-600" />
                <span>SYSTEM & DISRUPTION ENGINE SETTINGS</span>
              </h2>
            </div>

            <button
              onClick={() => setIsSettingsOpen(true)}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-md transition"
            >
              Configure Inactivity Threshold & Operational Settings
            </button>
          </div>
        )}

      </main>

      {/* What-If Compare Response Plans Modal Workspace */}
      {isWhatIfOpen && (
        <WhatIfModal
          disruptionId={targetDisruption?.id || 1}
          recommendations={targetDisruption?.recommendations || []}
          onConfirmPlan={async (selectedOptionCode) => {
            const targetId = targetDisruption?.id || 1;
            await confirmManagerPlan(targetId, selectedOptionCode);
          }}
          onClose={() => setIsWhatIfOpen(false)}
        />
      )}

      {/* Manager Settings Modal */}
      {isSettingsOpen && <SettingsModal onClose={() => setIsSettingsOpen(false)} />}

    </div>
  );
};
