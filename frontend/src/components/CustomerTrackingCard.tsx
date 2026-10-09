import React, { useState } from 'react';
import type { CustomerOrderData } from '../types';
import { StatusBadge } from './StatusBadge';
import { Package, Clock, MapPin, ChevronDown, ChevronUp, ShieldCheck, CheckCircle2, AlertCircle } from 'lucide-react';

interface CustomerTrackingCardProps {
  orderData: CustomerOrderData;
}

export const CustomerTrackingCard: React.FC<CustomerTrackingCardProps> = ({ orderData }) => {
  const [isWhyExpanded, setIsWhyExpanded] = useState<boolean>(false);

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-lg p-6 max-w-lg mx-auto space-y-6">
      
      {/* Top Order Overview */}
      <div className="flex items-center justify-between border-b pb-4 border-slate-100">
        <div>
          <div className="text-xs font-bold uppercase tracking-wider text-slate-400">Order Tracking</div>
          <div className="text-xl font-extrabold text-slate-900 tracking-tight flex items-center space-x-2">
            <Package className="w-5 h-5 text-blue-600" />
            <span>ORDER {orderData.tracking_number}</span>
          </div>
          <div className="text-xs text-slate-500 mt-0.5">{orderData.items_description}</div>
        </div>
        <StatusBadge status={orderData.status} size="lg" />
      </div>

      {/* ETA Highlight Card */}
      <div className={`p-5 rounded-xl border flex items-center justify-between ${
        orderData.is_delayed
          ? 'bg-amber-50/80 border-amber-200 text-amber-950'
          : 'bg-blue-50/80 border-blue-200 text-blue-950'
      }`}>
        <div>
          <div className="text-xs font-extrabold uppercase tracking-wider text-slate-500">Estimated Arrival</div>
          <div className="text-3xl font-black tracking-tight mt-0.5">{orderData.estimated_eta}</div>
          <div className="text-xs text-slate-600 mt-1 flex items-center space-x-1">
            <Clock className="w-3.5 h-3.5" />
            <span>{orderData.is_delayed ? `Updated (Original: ${orderData.original_eta})` : 'On Schedule'}</span>
          </div>
        </div>
        <div className="text-right">
          {orderData.is_delayed ? (
            <span className="text-xs font-bold px-3 py-1 bg-amber-200 text-amber-900 rounded-full border border-amber-300">
              +{orderData.delay_minutes} min delay
            </span>
          ) : (
            <span className="text-xs font-bold px-3 py-1 bg-emerald-100 text-emerald-800 rounded-full">
              On Time
            </span>
          )}
        </div>
      </div>

      {/* Disruption Alert Reassuring Banner */}
      {orderData.is_delayed && (
        <div className="bg-slate-50 border border-amber-200 rounded-xl p-4 space-y-2">
          <div className="flex items-center space-x-2 text-amber-700 font-bold text-xs uppercase tracking-wide">
            <AlertCircle className="w-4 h-4 text-amber-600" />
            <span>DELIVERY UPDATE</span>
          </div>
          <p className="text-xs text-slate-700 font-medium">
            Your delivery is taking a little longer than expected.
          </p>
          <div className="grid grid-cols-2 gap-2 pt-1 text-xs">
            <div>
              <span className="text-slate-400 block text-[10px] font-bold uppercase">Reason</span>
              <span className="font-semibold text-slate-800">{orderData.transparent_update.reason}</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px] font-bold uppercase">Updated Arrival</span>
              <span className="font-semibold text-slate-800">{orderData.transparent_update.updated_arrival}</span>
            </div>
          </div>
        </div>
      )}

      {/* Progress Timeline */}
      <div className="space-y-3">
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">Live Delivery Progress</h4>
        <div className="space-y-2">
          {orderData.timeline.map((item, idx) => (
            <div key={idx} className="flex items-center space-x-3">
              <div className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs ${
                item.completed ? 'bg-emerald-500 text-white' : 'bg-slate-200 text-slate-400'
              }`}>
                {item.completed ? <CheckCircle2 className="w-4 h-4" /> : '○'}
              </div>
              <div className="flex-1 flex items-center justify-between">
                <span className={`text-xs font-semibold ${item.completed ? 'text-slate-900' : 'text-slate-400'}`}>
                  {item.step}
                </span>
                <span className="text-[11px] text-slate-400">{item.time}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Expandable "Why is my delivery delayed?" Accordion */}
      {orderData.is_delayed && (
        <div className="border border-slate-200 rounded-xl overflow-hidden">
          <button
            onClick={() => setIsWhyExpanded(!isWhyExpanded)}
            className="w-full p-4 bg-slate-50 hover:bg-slate-100 flex items-center justify-between text-xs font-bold text-slate-800 transition"
          >
            <span>Why is my delivery delayed?</span>
            {isWhyExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
          {isWhyExpanded && (
            <div className="p-4 bg-white text-xs text-slate-600 leading-relaxed border-t border-slate-200 space-y-2">
              <p>{orderData.transparent_update.explanation}</p>
              <div className="flex items-center space-x-1.5 text-emerald-700 font-semibold text-[11px] pt-1">
                <ShieldCheck className="w-4 h-4" />
                <span>Our operations team has actively optimized your route for safe arrival.</span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Delivery Destination */}
      <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 flex items-center space-x-3 text-xs">
        <MapPin className="w-4 h-4 text-slate-400 shrink-0" />
        <div>
          <span className="text-slate-400 block text-[10px] font-bold uppercase">Destination Address</span>
          <span className="font-semibold text-slate-800">{orderData.delivery_address}</span>
        </div>
      </div>

    </div>
  );
};
