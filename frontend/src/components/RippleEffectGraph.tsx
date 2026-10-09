import React, { useState } from 'react';
import { AlertOctagon, Truck, Route as RouteIcon, Package, Users, ArrowRight } from 'lucide-react';

interface RippleEffectProps {
  disruptionTitle?: string;
  vehicleCode?: string;
  routeCode?: string;
  affectedDeliveriesCount?: number;
  priorityCustomersCount?: number;
}

export const RippleEffectGraph: React.FC<RippleEffectProps> = ({
  disruptionTitle = "Vehicle Breakdown / Inactivity",
  vehicleCode = "T-07",
  routeCode = "R-12",
  affectedDeliveriesCount = 8,
  priorityCustomersCount = 3
}) => {
  const [activeNode, setActiveNode] = useState<string>('disruption');

  const getNodeDetails = () => {
    switch (activeNode) {
      case 'disruption':
        return {
          title: "Root Disruption Incident",
          subtitle: "Unusual Inactivity / Mechanical Failure",
          details: [
            { label: "Detected At", value: "14:15 PM" },
            { label: "Stationary Duration", value: "01:42 min" },
            { label: "AI Severity", value: "CRITICAL (Confidence 94%)" }
          ]
        };
      case 'vehicle':
        return {
          title: `Primary Vehicle (${vehicleCode})`,
          subtitle: "Freight Cargo Truck - TN-38-A-7421",
          details: [
            { label: "Driver", value: "Arun Kumar (D-04)" },
            { label: "Current Speed", value: "0 km/h (Stationary)" },
            { label: "Capacity Loaded", value: "1,450 kg / 1,800 kg" }
          ]
        };
      case 'route':
        return {
          title: `Affected Route (${routeCode})`,
          subtitle: "Depot -> Industrial Park -> Bypass Ring Road",
          details: [
            { label: "Distance", value: "18.5 km" },
            { label: "Congestion Factor", value: "Severe (Grade F)" },
            { label: "Bypass Alternative", value: "Route R-15 (Ring Bypass)" }
          ]
        };
      case 'deliveries':
        return {
          title: `${affectedDeliveriesCount} Affected Orders`,
          subtitle: "In-Transit Consignments at Risk of SLA Breach",
          details: [
            { label: "High Priority", value: "3 Consignments (#1045, #1046, #1049)" },
            { label: "Original ETA", value: "04:20 PM" },
            { label: "Estimated Delay", value: "+30 to 60 Minutes" }
          ]
        };
      case 'customers':
        return {
          title: `${priorityCustomersCount} Priority Customer Accounts`,
          subtitle: "VIP SLA Clients Impacted",
          details: [
            { label: "Apex Medical Clinic", value: "Diagnostic Reagents (#1046)" },
            { label: "Priya Sharma", value: "High-Precision Sensors (#1045)" },
            { label: "Bosch Tech", value: "Automotive Micro-actuators (#1047)" }
          ]
        };
      default:
        return null;
    }
  };

  const nodeData = getNodeDetails();

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-5 space-y-4">
      <div className="flex items-center justify-between border-b pb-3 border-slate-100">
        <div>
          <h3 className="text-sm font-bold text-slate-900 tracking-tight flex items-center space-x-2">
            <span className="w-2 h-2 rounded-full bg-red-500 animate-ping inline-block" />
            <span>VISUAL RIPPLE EFFECT IMPACT GRAPH</span>
          </h3>
          <p className="text-xs text-slate-500">Interactive operational dependency cascade. Click any node to inspect details.</p>
        </div>
        <span className="text-xs font-semibold px-2.5 py-1 bg-red-50 text-red-700 rounded-full border border-red-200">
          Cascading Risk: HIGH
        </span>
      </div>

      <div className="flex items-center justify-between overflow-x-auto py-3 px-1 gap-2">
        <button
          onClick={() => setActiveNode('disruption')}
          className={`ripple-node flex flex-col items-center p-3 rounded-lg border text-center transition min-w-[120px] ${
            activeNode === 'disruption'
              ? 'bg-red-50 border-red-500 text-red-900 ring-2 ring-red-200 shadow-xs'
              : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
          }`}
        >
          <div className="w-10 h-10 rounded-full bg-red-100 text-red-600 flex items-center justify-center font-bold mb-1.5">
            <AlertOctagon className="w-5 h-5" />
          </div>
          <span className="text-[11px] font-bold uppercase tracking-wider">Disruption</span>
          <span className="text-xs font-semibold mt-0.5 truncate max-w-[100px]">{disruptionTitle}</span>
        </button>

        <ArrowRight className="w-5 h-5 text-slate-300 shrink-0" />

        <button
          onClick={() => setActiveNode('vehicle')}
          className={`ripple-node flex flex-col items-center p-3 rounded-lg border text-center transition min-w-[120px] ${
            activeNode === 'vehicle'
              ? 'bg-blue-50 border-blue-500 text-blue-900 ring-2 ring-blue-200 shadow-xs'
              : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
          }`}
        >
          <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold mb-1.5">
            <Truck className="w-5 h-5" />
          </div>
          <span className="text-[11px] font-bold uppercase tracking-wider">Vehicle</span>
          <span className="text-xs font-semibold mt-0.5">{vehicleCode}</span>
        </button>

        <ArrowRight className="w-5 h-5 text-slate-300 shrink-0" />

        <button
          onClick={() => setActiveNode('route')}
          className={`ripple-node flex flex-col items-center p-3 rounded-lg border text-center transition min-w-[120px] ${
            activeNode === 'route'
              ? 'bg-amber-50 border-amber-500 text-amber-900 ring-2 ring-amber-200 shadow-xs'
              : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
          }`}
        >
          <div className="w-10 h-10 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center font-bold mb-1.5">
            <RouteIcon className="w-5 h-5" />
          </div>
          <span className="text-[11px] font-bold uppercase tracking-wider">Route</span>
          <span className="text-xs font-semibold mt-0.5">{routeCode}</span>
        </button>

        <ArrowRight className="w-5 h-5 text-slate-300 shrink-0" />

        <button
          onClick={() => setActiveNode('deliveries')}
          className={`ripple-node flex flex-col items-center p-3 rounded-lg border text-center transition min-w-[120px] ${
            activeNode === 'deliveries'
              ? 'bg-purple-50 border-purple-500 text-purple-900 ring-2 ring-purple-200 shadow-xs'
              : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
          }`}
        >
          <div className="w-10 h-10 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center font-bold mb-1.5">
            <Package className="w-5 h-5" />
          </div>
          <span className="text-[11px] font-bold uppercase tracking-wider">Deliveries</span>
          <span className="text-xs font-semibold mt-0.5">{affectedDeliveriesCount} Orders</span>
        </button>

        <ArrowRight className="w-5 h-5 text-slate-300 shrink-0" />

        <button
          onClick={() => setActiveNode('customers')}
          className={`ripple-node flex flex-col items-center p-3 rounded-lg border text-center transition min-w-[120px] ${
            activeNode === 'customers'
              ? 'bg-emerald-50 border-emerald-500 text-emerald-900 ring-2 ring-emerald-200 shadow-xs'
              : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
          }`}
        >
          <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center font-bold mb-1.5">
            <Users className="w-5 h-5" />
          </div>
          <span className="text-[11px] font-bold uppercase tracking-wider">Impact</span>
          <span className="text-xs font-semibold mt-0.5">{priorityCustomersCount} Priority VIPs</span>
        </button>

      </div>

      {nodeData && (
        <div className="bg-slate-50 border border-slate-200/80 rounded-lg p-4 space-y-2">
          <div className="flex items-center justify-between border-b pb-2 border-slate-200">
            <div>
              <div className="text-xs font-extrabold text-slate-900">{nodeData.title}</div>
              <div className="text-[11px] text-slate-500">{nodeData.subtitle}</div>
            </div>
            <span className="text-[10px] font-bold tracking-wider text-slate-400 uppercase">Selected Node</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
            {nodeData.details.map((item, idx) => (
              <div key={idx} className="bg-white p-2.5 rounded-md border border-slate-200/60">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">{item.label}</span>
                <span className="text-xs font-bold text-slate-800">{item.value}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
