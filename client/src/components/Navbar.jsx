import React from 'react';
import { Shield, Home, Users, MapPin, History, User, Volume2, VolumeX, Mic, MicOff } from 'lucide-react';

export default function Navbar({
  activeTab,
  setActiveTab,
  contactsCount = 0,
  logsCount = 0,
  isVoiceListening,
  isSirenPlaying,
  toggleSiren,
  toggleVoice,
  currentUser,
}) {
  const navItems = [
    { id: 'home', label: 'Emergency', icon: Home },
    { id: 'contacts', label: 'Guardians', icon: Users, badge: contactsCount },
    { id: 'location', label: 'GPS Live', icon: MapPin },
    { id: 'logs', label: 'History', icon: History, badge: logsCount },
    { id: 'auth', label: 'Defender ID', icon: User },
  ];

  return (
    <header className="sticky top-0 z-50 bg-slate-950/80 backdrop-blur-md border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo & Status */}
        <div className="flex items-center gap-3">
          <div className="p-2 bg-rose-600/10 border border-rose-500/20 rounded-xl text-rose-500">
            <Shield className="w-5 h-5" />
          </div>
          <div>
            <span className="font-black tracking-wider text-slate-100 text-base md:text-lg">
              SURAKSHA <span className="text-rose-500">AI</span>
            </span>
            <span className="hidden sm:inline-block ml-2 text-[10px] font-mono text-emerald-400 bg-emerald-950/40 border border-emerald-500/20 px-2 py-0.5 rounded-full">
              SHIELD ONLINE
            </span>
          </div>
        </div>

        {/* Quick Alarm & Voice Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={toggleSiren}
            className={`p-2 rounded-xl border text-xs font-mono flex items-center gap-1.5 transition-all ${
              isSirenPlaying
                ? 'bg-rose-600 border-rose-500 text-white animate-pulse'
                : 'bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-700'
            }`}
            title="Toggle Loud Alarm Siren"
          >
            {isSirenPlaying ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            <span className="hidden sm:inline">{isSirenPlaying ? 'SIREN ON' : 'SIREN'}</span>
          </button>

          <button
            onClick={toggleVoice}
            className={`p-2 rounded-xl border text-xs font-mono flex items-center gap-1.5 transition-all ${
              isVoiceListening
                ? 'bg-emerald-600 border-emerald-500 text-white animate-pulse'
                : 'bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-700'
            }`}
            title="Toggle Hands-Free Voice Shield"
          >
            {isVoiceListening ? <Mic className="w-4 h-4" /> : <MicOff className="w-4 h-4" />}
            <span className="hidden sm:inline">{isVoiceListening ? 'VOICE ON' : 'VOICE'}</span>
          </button>
        </div>
      </div>

      {/* Navigation Links Bar */}
      <nav className="flex justify-center border-t border-slate-900 bg-slate-950/90 px-2 py-1.5 gap-1 md:gap-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all relative ${
                isActive
                  ? 'bg-rose-600 text-white shadow-lg shadow-rose-950/50'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{item.label}</span>
              {item.badge !== undefined && item.badge > 0 && (
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                    isActive ? 'bg-black/40 text-white' : 'bg-slate-800 text-slate-300'
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>
    </header>
  );
}