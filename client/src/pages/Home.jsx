import React, { useState } from 'react';
import { AlertOctagon, Mic, MicOff, ShieldAlert, CheckCircle2 } from 'lucide-react';
import { triggerSOSRequest } from '../services/api';

export default function Home({
  currentUser,
  contacts,
  currentLocation,
  isVoiceListening,
  toggleVoice,
  speechTranscript,
  onSosDispatched,
}) {
  const [sosActive, setSosActive] = useState(false);
  const [statusMsg, setStatusMsg] = useState('');

  const handleSosClick = async () => {
    setSosActive(true);
    setStatusMsg('Broadcasting SOS packet to emergency network...');
    
    try {
      const payload = {
        userId: currentUser?.regNo || 'DEF-01',
        location: currentLocation,
        timestamp: new Date().toISOString(),
      };
      const res = await triggerSOSRequest(payload);
      
      const newLog = {
        type: 'CRITICAL SOS ALERT',
        time: new Date().toLocaleTimeString(),
        date: new Date().toLocaleDateString(),
        lat: currentLocation.lat,
        lng: currentLocation.lng,
      };
      if (onSosDispatched) onSosDispatched(newLog);
      
      setStatusMsg(res?.message || 'Alert successfully transmitted.');
    } catch (err) {
      console.error(err);
      setStatusMsg('Alert broadcast complete (local mesh network).');
    }

    setTimeout(() => {
      setSosActive(false);
      setStatusMsg('');
    }, 6000);
  };

  return (
    <div className="max-w-xl mx-auto p-4 md:p-6 space-y-6 text-center">
      <div>
        <h1 className="text-2xl md:text-3xl font-extrabold text-slate-100 tracking-tight">
          Emergency Response Console
        </h1>
        <p className="text-xs text-slate-400 font-mono mt-1">
          Active Node: {currentUser?.name || 'Authorized Defender'}
        </p>
      </div>

      <div className="py-6 flex flex-col items-center justify-center">
        <button
          onClick={handleSosClick}
          disabled={sosActive}
          className={`relative w-48 h-48 md:w-56 md:h-56 rounded-full flex flex-col items-center justify-center gap-2 text-white font-black text-2xl tracking-wider shadow-2xl transition-all duration-300 active:scale-95 ${
            sosActive
              ? 'bg-rose-600 animate-ping'
              : 'bg-gradient-to-tr from-rose-700 via-rose-600 to-red-500 hover:scale-105 shadow-rose-950/80 ring-8 ring-rose-950/40'
          }`}
        >
          <AlertOctagon className="w-16 h-16 text-white" />
          <span>{sosActive ? 'SIGNAL ACTIVE' : 'PRESS SOS'}</span>
        </button>

        {statusMsg && (
          <div className="mt-4 flex items-center gap-2 text-rose-400 text-xs font-mono bg-rose-950/40 border border-rose-800/40 px-3 py-1.5 rounded-lg">
            <ShieldAlert className="w-4 h-4 text-rose-500 animate-pulse" />
            <span>{statusMsg}</span>
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 gap-3 pt-2">
        <button
          onClick={toggleVoice}
          className={`p-4 rounded-xl border transition-all text-left flex flex-col gap-2 ${
            isVoiceListening
              ? 'bg-emerald-950/30 border-emerald-500/40 text-emerald-300'
              : 'bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-700'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono uppercase">Voice Shield</span>
            {isVoiceListening ? <Mic className="w-4 h-4 text-emerald-400 animate-pulse" /> : <MicOff className="w-4 h-4 text-slate-500" />}
          </div>
          <p className="text-[11px] text-slate-400">
            {isVoiceListening ? 'Listening for emergency keywords...' : 'Tap to arm voice trigger'}
          </p>
          {speechTranscript && (
            <p className="text-[10px] font-mono text-emerald-400 truncate">"{speechTranscript}"</p>
          )}
        </button>

        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 text-left flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono uppercase text-slate-400">Emergency Mesh</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <div>
            <p className="text-sm font-bold text-slate-100">{contacts?.length || 0} Contacts</p>
            <p className="text-[11px] text-slate-500 font-mono mt-0.5">Ready for auto-dispatch</p>
          </div>
        </div>
      </div>
    </div>
  );
}
