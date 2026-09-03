import React from 'react';
import { MapPin, Navigation, Compass, RefreshCw } from 'lucide-react';

export default function Location({ currentLocation, onRefreshLocation }) {
  return (
    <div className="max-w-2xl mx-auto p-4 md:p-6 space-y-6">
      <div className="border-b border-slate-800 pb-4 flex justify-between items-center">
        <div>
          <h2 className="text-xl md:text-2xl font-bold text-slate-100 flex items-center gap-2">
            <MapPin className="w-6 h-6 text-rose-500" /> Live Telemetry
          </h2>
          <p className="text-xs text-slate-400 mt-1 font-mono">Continuous GPS tracking active</p>
        </div>
        <button
          onClick={onRefreshLocation}
          className="p-2 rounded-lg bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-300 flex items-center gap-1.5 text-xs font-mono"
        >
          <RefreshCw className="w-3.5 h-3.5" /> Ping
        </button>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl">
          <p className="text-xs text-slate-400 font-mono">LATITUDE</p>
          <p className="text-lg font-bold text-slate-100 font-mono mt-1">{currentLocation?.lat?.toFixed(5) || '28.6139'}</p>
        </div>
        <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl">
          <p className="text-xs text-slate-400 font-mono">LONGITUDE</p>
          <p className="text-lg font-bold text-slate-100 font-mono mt-1">{currentLocation?.lng?.toFixed(5) || '77.2090'}</p>
        </div>
      </div>

      <div className="p-4 bg-slate-900/60 border border-slate-800 rounded-xl flex items-center gap-3">
        <Navigation className="w-5 h-5 text-emerald-400 shrink-0" />
        <div>
          <p className="text-xs text-slate-400 font-mono">RESOLVED ADDRESS</p>
          <p className="text-sm font-semibold text-slate-200 mt-0.5">{currentLocation?.address || 'Locating...'}</p>
        </div>
      </div>
    </div>
  );
}
