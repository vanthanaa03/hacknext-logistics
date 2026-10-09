import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, Tooltip, useMap } from 'react-leaflet';
import L from 'leaflet';
import type { Vehicle, Delivery } from '../types';
import { StatusBadge } from './StatusBadge';
import { Truck, Clock, MapPin } from 'lucide-react';

delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

const createVehicleIcon = (status: string, code: string) => {
  let color = '#2563eb';
  if (['AT_RISK', 'DISRUPTED', 'CRITICAL'].includes(status)) {
    color = '#dc2626';
  } else if (status === 'RESOLVED') {
    color = '#10b981';
  }

  const html = `
    <div style="background-color: ${color}; width: 34px; height: 34px; border-radius: 50%; border: 3px solid white; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.3); display: flex; items-center; justify-content: center; color: white; font-weight: bold; font-size: 11px;">
      ${code}
    </div>
  `;
  return L.divIcon({
    html,
    className: 'custom-vehicle-marker',
    iconSize: [34, 34],
    iconAnchor: [17, 17],
  });
};

interface LeafletMapProps {
  vehicles: Vehicle[];
  deliveries: Delivery[];
  selectedVehicle: Vehicle | null;
  onSelectVehicle: (v: Vehicle) => void;
  onOpenDisruptionWorkspace?: () => void;
}

const MapRecenter: React.FC<{ lat: number; lng: number }> = ({ lat, lng }) => {
  const map = useMap();
  useEffect(() => {
    map.panTo([lat, lng], { animate: true });
  }, [lat, lng, map]);
  return null;
};

export const LeafletMap: React.FC<LeafletMapProps> = ({
  vehicles,
  deliveries,
  selectedVehicle,
  onSelectVehicle,
  onOpenDisruptionWorkspace
}) => {
  const routeR12Coordinates: [number, number][] = [
    [11.0168, 76.9558],
    [11.0195, 76.9582],
    [11.0220, 76.9615],
    [11.0255, 76.9650],
    [11.0290, 76.9690]
  ];

  const routeR15AlternativeCoordinates: [number, number][] = [
    [11.0195, 76.9582],
    [11.0280, 76.9710],
    [11.0310, 76.9740],
    [11.0290, 76.9690]
  ];

  const isDisruptedR12 = vehicles.some((v) => v.code === 'T-07' && ['AT_RISK', 'DISRUPTED', 'CRITICAL'].includes(v.status));

  return (
    <div className="relative w-full h-[520px] rounded-xl overflow-hidden border border-slate-200 shadow-xs">
      <MapContainer
        center={[11.0220, 76.9615]}
        zoom={14}
        scrollWheelZoom={true}
        className="w-full h-full"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {selectedVehicle && (
          <MapRecenter lat={selectedVehicle.current_lat} lng={selectedVehicle.current_lng} />
        )}

        <Polyline
          positions={routeR12Coordinates}
          pathOptions={{
            color: isDisruptedR12 ? '#dc2626' : '#2563eb',
            weight: 5,
            dashArray: isDisruptedR12 ? '8, 8' : undefined,
            opacity: 0.85
          }}
        />

        <Polyline
          positions={routeR15AlternativeCoordinates}
          pathOptions={{
            color: '#10b981',
            weight: 4,
            dashArray: '5, 5',
            opacity: 0.8
          }}
        />

        {deliveries.map((del) => (
          <Marker
            key={del.id}
            position={[del.lat, del.lng]}
          >
            <Popup>
              <div className="p-1 space-y-1 text-xs">
                <div className="font-bold text-slate-800">Order {del.tracking_number}</div>
                <div className="text-slate-600">{del.customer_name}</div>
                <div className="text-[10px] text-slate-500">{del.items_description}</div>
                <div className="pt-1 flex items-center justify-between">
                  <span className="font-semibold text-blue-600">ETA: {del.estimated_eta}</span>
                  <StatusBadge status={del.status} size="sm" />
                </div>
              </div>
            </Popup>
            <Tooltip direction="top" offset={[0, -10]} opacity={0.9}>
              <span>Order {del.tracking_number} ({del.customer_name})</span>
            </Tooltip>
          </Marker>
        ))}

        {vehicles.map((v) => (
          <Marker
            key={v.id}
            position={[v.current_lat, v.current_lng]}
            icon={createVehicleIcon(v.status, v.code)}
            eventHandlers={{
              click: () => onSelectVehicle(v)
            }}
          >
            <Popup>
              <div className="p-2 space-y-2 text-xs min-w-[200px]">
                <div className="flex items-center justify-between border-b pb-1 border-slate-100">
                  <span className="font-bold text-slate-900 text-sm">VEHICLE {v.code}</span>
                  <StatusBadge status={v.status} size="sm" />
                </div>
                <div className="text-slate-700">Driver: <span className="font-semibold">{v.driver_name}</span></div>
                <div className="text-slate-700">Route: <span className="font-semibold">{v.route_code}</span></div>
                <div className="text-slate-700">Speed: <span className="font-semibold">{v.current_speed_kmh} km/h</span></div>
                {v.stationary_duration_secs > 0 && (
                  <div className="text-red-600 font-semibold flex items-center space-x-1">
                    <Clock className="w-3.5 h-3.5" />
                    <span>Stationary: {Math.floor(v.stationary_duration_secs / 60)}m {v.stationary_duration_secs % 60}s</span>
                  </div>
                )}
                <button
                  onClick={() => {
                    onSelectVehicle(v);
                    if (onOpenDisruptionWorkspace) onOpenDisruptionWorkspace();
                  }}
                  className="w-full mt-2 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded text-center block"
                >
                  View Details
                </button>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>

      <div className="absolute top-3 right-3 z-20 bg-white/95 backdrop-blur-xs p-3 rounded-lg border border-slate-200 shadow-md text-xs space-y-2">
        <div className="font-bold text-slate-800 border-b pb-1 border-slate-100">Live Map Legend</div>
        <div className="flex items-center space-x-2">
          <span className="w-3 h-3 rounded-full bg-blue-600 inline-block" />
          <span className="text-slate-700 font-medium">Active Vehicle (Normal)</span>
        </div>
        <div className="flex items-center space-x-2">
          <span className="w-3 h-3 rounded-full bg-red-600 inline-block animate-pulse" />
          <span className="text-slate-700 font-medium">Disrupted / At Risk</span>
        </div>
        <div className="flex items-center space-x-2">
          <span className="w-6 h-1 bg-blue-600 inline-block rounded-xs" />
          <span className="text-slate-700 font-medium">Primary Route R-12</span>
        </div>
        <div className="flex items-center space-x-2">
          <span className="w-6 h-1 bg-emerald-500 inline-block rounded-xs border-b border-dashed" />
          <span className="text-slate-700 font-medium">Bypass Route R-15</span>
        </div>
      </div>

      {selectedVehicle && (
        <div className="absolute bottom-4 left-4 z-20 bg-white/95 backdrop-blur-xs p-4 rounded-lg border border-slate-200 shadow-xl max-w-sm w-full space-y-3">
          <div className="flex items-center justify-between border-b pb-2 border-slate-100">
            <div>
              <div className="text-xs uppercase font-bold text-slate-400">Selected Vehicle</div>
              <div className="text-base font-extrabold text-slate-900 flex items-center space-x-2">
                <Truck className="w-4 h-4 text-blue-600" />
                <span>VEHICLE {selectedVehicle.code}</span>
              </div>
            </div>
            <StatusBadge status={selectedVehicle.status} size="md" />
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="bg-slate-50 p-2 rounded-md">
              <span className="text-slate-400 block text-[10px] uppercase font-semibold">Driver</span>
              <span className="font-bold text-slate-800">{selectedVehicle.driver_name}</span>
            </div>
            <div className="bg-slate-50 p-2 rounded-md">
              <span className="text-slate-400 block text-[10px] uppercase font-semibold">Active Route</span>
              <span className="font-bold text-slate-800">{selectedVehicle.route_code}</span>
            </div>
            <div className="bg-slate-50 p-2 rounded-md">
              <span className="text-slate-400 block text-[10px] uppercase font-semibold">Current Speed</span>
              <span className="font-bold text-slate-800">{selectedVehicle.current_speed_kmh} km/h</span>
            </div>
            <div className="bg-slate-50 p-2 rounded-md">
              <span className="text-slate-400 block text-[10px] uppercase font-semibold">Stationary Time</span>
              <span className={`font-bold ${selectedVehicle.stationary_duration_secs > 60 ? 'text-red-600' : 'text-slate-800'}`}>
                {Math.floor(selectedVehicle.stationary_duration_secs / 60)}m {selectedVehicle.stationary_duration_secs % 60}s
              </span>
            </div>
          </div>

          <div className="text-xs text-slate-600 flex items-center space-x-1">
            <MapPin className="w-3.5 h-3.5 text-slate-400" />
            <span>GPS: {selectedVehicle.current_lat.toFixed(4)}, {selectedVehicle.current_lng.toFixed(4)}</span>
          </div>

          <button
            onClick={() => onOpenDisruptionWorkspace && onOpenDisruptionWorkspace()}
            className="w-full py-2 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs rounded-lg transition text-center shadow-xs"
          >
            Open Disruption Workspace
          </button>
        </div>
      )}
    </div>
  );
};
