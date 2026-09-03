import React from 'react';
import { History, ShieldAlert, CheckCircle } from 'lucide-react';

export default function Logs({ logs = [] }) {
  return (
    <div className="max-w-2xl mx-auto p-4 md:p-6 space-y-6">
      <div className="border-b border-slate-800 pb-4">
        <h2 className="text-xl md:text-2xl font-bold text-slate-100 flex items-center gap-2">
          <History className="w-6 h-6 text-rose-500" /> Incident Logs
        </h2>
        <p className="text-xs text-slate-400 mt-1 font-mono">Historical records of alarms and SOS triggers</p>
      </div>

      {logs.length === 0 ? (
        <div className="text-center py-12 border border-dashed border-slate-800 rounded-2xl">
          <CheckCircle className="w-10 h-10 text-emerald-500/50 mx-auto mb-2" />
          <p className="text-sm text-slate-400">All systems clear. No incidents reported.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {logs.map((log, index) => (
            <div key={index} className="p-4 bg-slate-900 border border-slate-800 rounded-xl flex items-start gap-3">
              <ShieldAlert className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-semibold text-slate-200">{log.type || 'SOS Alert'}</p>
                <p className="text-xs text-slate-400 font-mono mt-1">{log.time || log.date || 'Just now'}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
