import React from 'react';
import {
  ShieldAlert,
  Radar,
  Users,
  Mic,
  FileText,
  Briefcase,
  Settings,
  Terminal
} from 'lucide-react';
import { useSecurity } from '../../context/SecurityContext';
import { tacticalAudio } from '../../services/audioService';

export default function TacticalDock() {
  const { activeTab, setActiveTab, armedState } = useSecurity();
  const isArmed = armedState === 'ARMED';

  const navItems = [
    { id: 'hero', label: 'Console', icon: Terminal },
    { id: 'radar', label: 'Radar', icon: Radar },
    { id: 'network', label: 'Guardians', icon: Users },
    {
      id: 'sos',
      label: 'SOS HUB',
      icon: ShieldAlert,
      isSpecial: true
    },
    { id: 'voice', label: 'Voice AI', icon: Mic },
    { id: 'toolkit', label: 'Toolkit', icon: Briefcase },
    { id: 'logs', label: 'Logs', icon: FileText },
    { id: 'settings', label: 'Config', icon: Settings }
  ];

  const handleSelect = (id) => {
    tacticalAudio.playClick();
    setActiveTab(id);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <nav className="fixed bottom-3 left-1/2 -translate-x-1/2 z-40 w-[95%] max-w-2xl px-2 py-2 rounded-2xl bg-[#0b0f19]/90 backdrop-blur-2xl border border-cyan-500/25 shadow-[0_10px_35px_rgba(0,0,0,0.7)] flex items-center justify-between transition-all">
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = activeTab === item.id;

        if (item.isSpecial) {
          return (
            <button
              key={item.id}
              onClick={() => handleSelect(item.id)}
              className="relative -top-4 px-3 py-2 flex flex-col items-center group cursor-pointer focus:outline-none"
            >
              {/* Outer pulsing ring */}
              <span
                className={`absolute inset-0 rounded-full blur-md transition-all ${
                  isArmed
                    ? 'bg-rose-600/70 animate-ping'
                    : 'bg-rose-500/30 group-hover:bg-rose-500/50'
                }`}
              />

              <div
                className={`relative w-13 h-13 rounded-full flex items-center justify-center border-2 transition-transform duration-200 group-hover:scale-105 group-active:scale-95 shadow-xl ${
                  isArmed
                    ? 'bg-rose-600 border-white text-white shadow-[0_0_25px_rgba(255,23,68,0.9)] animate-bounce'
                    : isActive
                    ? 'bg-rose-600 border-rose-400 text-white shadow-[0_0_20px_rgba(255,23,68,0.6)]'
                    : 'bg-rose-950/80 border-rose-500 text-rose-300 shadow-[0_0_15px_rgba(255,23,68,0.3)]'
                }`}
              >
                <Icon className="w-6 h-6" />
              </div>
              <span
                className={`text-[10px] font-tactical font-bold uppercase tracking-wider mt-1 ${
                  isArmed || isActive ? 'text-rose-400 font-extrabold' : 'text-slate-300'
                }`}
              >
                {isArmed ? 'ARMED' : item.label}
              </span>
            </button>
          );
        }

        return (
          <button
            key={item.id}
            onClick={() => handleSelect(item.id)}
            className={`flex flex-col items-center justify-center py-1 px-1.5 rounded-xl transition-all duration-150 cursor-pointer ${
              isActive
                ? 'text-cyan-300 bg-cyan-500/15 border border-cyan-400/30 shadow-[0_0_10px_rgba(0,229,255,0.2)]'
                : 'text-slate-400 hover:text-slate-200 hover:bg-white/5 border border-transparent'
            }`}
          >
            <Icon className={`w-4 h-4 md:w-5 md:h-5 ${isActive ? 'text-cyan-300' : ''}`} />
            <span
              className={`text-[9px] md:text-[10px] font-mono tracking-tight mt-0.5 ${
                isActive ? 'font-semibold text-cyan-300' : 'text-slate-400'
              }`}
            >
              {item.label}
            </span>
          </button>
        );
      })}
    </nav>
  );
}
