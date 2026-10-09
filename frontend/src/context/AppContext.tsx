import React, { createContext, useContext, useState, useEffect } from 'react';
import type { Vehicle, Disruption, Delivery, AppNotification } from '../types';
import { api } from '../services/api';
import { wsService } from '../services/websocket';

interface AppContextType {
  vehicles: Vehicle[];
  disruptions: Disruption[];
  deliveries: Delivery[];
  notifications: AppNotification[];
  selectedVehicle: Vehicle | null;
  activeDisruption: Disruption | null;
  isSimulatingGPS: boolean;
  inactivityThreshold: number;
  setInactivityThreshold: (val: number) => void;
  setSelectedVehicle: (vehicle: Vehicle | null) => void;
  setActiveDisruption: (disruption: Disruption | null) => void;
  refreshData: () => Promise<void>;
  startGPSSimulation: () => Promise<void>;
  disruptGPSSimulation: () => Promise<void>;
  stopGPSSimulation: () => Promise<void>;
  submitDriverReport: (category: string, message: string) => Promise<any>;
  confirmManagerPlan: (disruptionId: number, selectedOptionCode: string, notes?: string) => Promise<any>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [disruptions, setDisruptions] = useState<Disruption[]>([]);
  const [deliveries, setDeliveries] = useState<Delivery[]>([]);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  const [activeDisruption, setActiveDisruption] = useState<Disruption | null>(null);
  const [isSimulatingGPS, setIsSimulatingGPS] = useState<boolean>(false);
  const [inactivityThreshold, setInactivityThresholdState] = useState<number>(60);

  const refreshData = async () => {
    try {
      const [vRes, dRes, delRes, nRes, setRes] = await Promise.all([
        api.get('/api/vehicles'),
        api.get('/api/disruptions'),
        api.get('/api/deliveries'),
        api.get('/api/notifications'),
        api.get('/api/manager/settings')
      ]);

      setVehicles(vRes.data);
      setDisruptions(dRes.data);
      setDeliveries(delRes.data);
      setNotifications(nRes.data);
      if (setRes.data?.inactivity_threshold_seconds) {
        setInactivityThresholdState(setRes.data.inactivity_threshold_seconds);
      }

      const active = dRes.data.find((d: Disruption) => d.status === 'AT_RISK' || d.status === 'ACTIVE');
      if (active) {
        fetchDisruptionDetail(active.id);
      }
    } catch (e) {
      console.error("Error refreshing data:", e);
    }
  };

  const fetchDisruptionDetail = async (id: number) => {
    try {
      const res = await api.get(`/api/disruptions/${id}`);
      setActiveDisruption(res.data);
    } catch (e) {
      console.error("Error fetching disruption detail:", e);
    }
  };

  const setInactivityThreshold = async (val: number) => {
    setInactivityThresholdState(val);
    try {
      await api.post('/api/manager/settings/inactivity-threshold', { threshold_seconds: val });
    } catch (e) {
      console.error("Error updating settings:", e);
    }
  };

  const startGPSSimulation = async () => {
    try {
      await api.post('/api/gps/simulate/start', { vehicle_code: "T-07" });
      setIsSimulatingGPS(true);
    } catch (e) {
      console.error("Error starting simulation:", e);
    }
  };

  const disruptGPSSimulation = async () => {
    try {
      const res = await api.post('/api/gps/simulate/disrupt', { vehicle_code: "T-07" });
      setIsSimulatingGPS(true);
      if (res.data?.disruption_id) {
        await fetchDisruptionDetail(res.data.disruption_id);
      }
      await refreshData();
    } catch (e) {
      console.error("Error simulating disruption:", e);
    }
  };

  const stopGPSSimulation = async () => {
    try {
      await api.post('/api/gps/simulate/stop');
      setIsSimulatingGPS(false);
      await refreshData();
    } catch (e) {
      console.error("Error stopping simulation:", e);
    }
  };

  const submitDriverReport = async (category: string, message: string) => {
    try {
      const res = await api.post('/api/driver/report', {
        vehicle_code: "T-07",
        category,
        raw_message: message
      });
      if (res.data?.disruption_id) {
        await fetchDisruptionDetail(res.data.disruption_id);
      }
      await refreshData();
      return res.data;
    } catch (e) {
      console.error("Error submitting report:", e);
      throw e;
    }
  };

  const confirmManagerPlan = async (disruptionId: number, selectedOptionCode: string, notes?: string) => {
    try {
      const res = await api.post('/api/manager/decision', {
        disruption_id: disruptionId,
        selected_option_code: selectedOptionCode,
        decision_notes: notes || "Manager confirmed plan"
      });
      await fetchDisruptionDetail(disruptionId);
      await refreshData();
      return res.data;
    } catch (e) {
      console.error("Error confirming manager decision:", e);
      throw e;
    }
  };

  useEffect(() => {
    refreshData();
    wsService.connect();

    const unsubscribe = wsService.subscribe((event) => {
      if (event.type === 'GPS_UPDATE') {
        setVehicles((prev) =>
          prev.map((v) =>
            v.code === event.vehicle_code
              ? {
                  ...v,
                  current_lat: event.lat,
                  current_lng: event.lng,
                  current_speed_kmh: event.speed,
                  status: event.status,
                  stationary_duration_secs: event.stationary_duration
                }
              : v
          )
        );
      } else if (
        event.type === 'DISRUPTION_DETECTED' ||
        event.type === 'SIMULATION_DISRUPTED' ||
        event.type === 'DRIVER_REPORT_SUBMITTED' ||
        event.type === 'MANAGER_DECISION_CONFIRMED'
      ) {
        refreshData();
      }
    });

    return () => {
      unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (!isSimulatingGPS) return;

    const timer = setInterval(() => {
      api.post('/api/gps/simulate/step').catch(() => {});
    }, 2500);

    return () => clearInterval(timer);
  }, [isSimulatingGPS]);

  return (
    <AppContext.Provider
      value={{
        vehicles,
        disruptions,
        deliveries,
        notifications,
        selectedVehicle,
        activeDisruption,
        isSimulatingGPS,
        inactivityThreshold,
        setInactivityThreshold,
        setSelectedVehicle,
        setActiveDisruption,
        refreshData,
        startGPSSimulation,
        disruptGPSSimulation,
        stopGPSSimulation,
        submitDriverReport,
        confirmManagerPlan
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
};
