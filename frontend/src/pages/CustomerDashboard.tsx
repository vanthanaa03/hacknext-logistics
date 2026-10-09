import React, { useState, useEffect } from 'react';
import { CustomerTrackingCard } from '../components/CustomerTrackingCard';
import type { CustomerOrderData } from '../types';
import { api } from '../services/api';
import { Search } from 'lucide-react';

export const CustomerDashboard: React.FC = () => {
  const [trackingNumber, setTrackingNumber] = useState<string>('#1045');
  const [orderData, setOrderData] = useState<CustomerOrderData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const fetchOrderData = async (tn: string) => {
    setIsLoading(true);
    try {
      const res = await api.get(`/api/customer/orders/${tn.replace('#', '')}`);
      setOrderData(res.data);
    } catch (e) {
      console.error("Error fetching order data:", e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOrderData(trackingNumber);
    const interval = setInterval(() => fetchOrderData(trackingNumber), 4000);
    return () => clearInterval(interval);
  }, [trackingNumber]);

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-slate-100 p-4 sm:p-8 space-y-6">
      <div className="max-w-lg mx-auto space-y-4">
        <div className="text-center space-y-1">
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">DELIVERY TRANSPARENCY PORTAL</h1>
          <p className="text-xs text-slate-500">Real-time GPS delivery tracking powered by DROVA Logistics Engine</p>
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            fetchOrderData(trackingNumber);
          }}
          className="relative"
        >
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            value={trackingNumber}
            onChange={(e) => setTrackingNumber(e.target.value)}
            placeholder="Enter Order # (e.g. #1045)..."
            className="w-full pl-10 pr-24 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-800 shadow-2xs focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
          />
          <button
            type="submit"
            className="absolute right-1.5 top-1.5 px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-lg transition"
          >
            TRACK
          </button>
        </form>

        <div className="flex items-center justify-center space-x-2 text-xs">
          <span className="text-slate-400 font-semibold">Quick Track:</span>
          {['#1045', '#1046', '#1047'].map((num) => (
            <button
              key={num}
              onClick={() => {
                setTrackingNumber(num);
                fetchOrderData(num);
              }}
              className={`px-2.5 py-1 rounded-md text-xs font-bold transition ${
                trackingNumber === num
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-slate-700 hover:bg-slate-200 border border-slate-200'
              }`}
            >
              {num}
            </button>
          ))}
        </div>
      </div>

      {isLoading && !orderData ? (
        <div className="p-12 text-center text-xs font-semibold text-slate-500">
          Loading live delivery tracking status...
        </div>
      ) : orderData ? (
        <CustomerTrackingCard orderData={orderData} />
      ) : (
        <div className="p-8 text-center text-xs text-slate-500 bg-white rounded-xl max-w-md mx-auto border border-slate-200">
          No active order found for tracking number {trackingNumber}. Try searching for #1045.
        </div>
      )}
    </div>
  );
};
