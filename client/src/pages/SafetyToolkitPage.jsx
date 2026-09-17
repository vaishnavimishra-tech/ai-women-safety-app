import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  PhoneCall,
  PhoneOff,
  PhoneForwarded,
  Shield,
  Navigation,
  AlertOctagon,
  Sparkles,
  Volume2,
  CheckCircle2,
  Share2,
  UserCheck,
  Compass,
  ArrowRight
} from 'lucide-react';
import { useSecurity } from '../context/SecurityContext';
import { tacticalAudio } from '../services/audioService';
import GlassCard from '../components/common/GlassCard';
import TacticalButton from '../components/common/TacticalButton';
import TelemetryText from '../components/common/TelemetryText';
import StatusBadge from '../components/common/StatusBadge';

export default function SafetyToolkitPage() {
  const { triggerFakeCall, logEvent } = useSecurity();

  // Decoy Call Customizer State
  const [callerName, setCallerName] = useState('Mom');
  const [callerNumber, setCallerNumber] = useState('+91 98765 00001');
  const [callDelaySec, setCallDelaySec] = useState(0); // 0 = instant

  // Safe Route State
  const [selectedRoute, setSelectedRoute] = useState('safe'); // 'safe' | 'fast'

  // Safety tip flip card index
  const [activeTipIdx, setActiveTipIdx] = useState(0);

  const emergencyNumbers = [
    { name: "National Emergency / PCR", number: "112", badge: "24/7 POLICE", color: "border-rose-500/50" },
    { name: "Women In Distress Helpline", number: "1091", badge: "CRISIS CELL", color: "border-purple-500/50" },
    { name: "Women Helpline (Domestic Abuse)", number: "181", badge: "LEGAL & SHELTER", color: "border-amber-500/50" },
    { name: "National Ambulance Service", number: "108", badge: "EMERGENCY MEDICAL", color: "border-emerald-500/50" },
    { name: "Cyber Crime Reporting", number: "1930", badge: "CYBER CELL", color: "border-cyan-500/50" },
    { name: "Railway Passenger Security", number: "139", badge: "TRANSIT POLICE", color: "border-sky-500/50" }
  ];

  const safetyTips = [
    {
      title: "Transit De-Escalation & Ride Verification",
      category: "MOBILITY",
      desc: "Always verify license plate, driver photo, and ride PIN before opening car doors. Keep the app's Live Radar Beacon enabled to stream your vector to your guardians.",
      action: "Turn on Ride Watchdog"
    },
    {
      title: "Acoustic Hotword Trigger in High Danger",
      category: "CONCEALED SOS",
      desc: "If your device is inside your purse or pocket, speak clearly: 'SURAKSHA' or 'HELP'. The neural audio analyzer activates silent emergency dispatch without touching the screen.",
      action: "Calibrate Sensitivity"
    },
    {
      title: "Stealth Calculator Cloaking",
      category: "INSPECTION DEFENSE",
      desc: "If forced to unlock your phone, tap 'CLOAK' or triple-tap back. Suraksha AI disguises itself as a fully functional scientific calculator. Type '1091=' to restore console.",
      action: "Test Calculator Cloak"
    }
  ];

  const handleLaunchFakeCall = () => {
    tacticalAudio.playClick();
    if (callDelaySec === 0) {
      triggerFakeCall({ name: callerName, number: callerNumber });
    } else {
      alert(`Decoy call scheduled in ${callDelaySec} seconds.`);
      setTimeout(() => {
        triggerFakeCall({ name: callerName, number: callerNumber });
      }, callDelaySec * 1000);
    }
  };

  return (
    <div className="relative min-h-screen pb-28 pt-4 px-4 max-w-6xl mx-auto flex flex-col gap-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-cyan-500/20 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-emerald-400" />
            <h1 className="font-tactical font-bold text-3xl md:text-4xl text-white tracking-wider">
              TACTICAL SAFETY TOOLKIT
            </h1>
          </div>
          <p className="text-xs font-mono text-slate-400 mt-1">
            RAPID INTERVENTION SUITE // DECOY GENERATOR & AI ROUTE NAVIGATION
          </p>
        </div>

        <StatusBadge label="UTILITIES NOMINAL" status="safe" />
      </div>

      {/* Grid: Decoy Call + Safe Route + Emergency Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Decoy Fake Call Generator */}
        <div className="lg:col-span-6 flex flex-col gap-6">
          <GlassCard variant="cyan" className="p-6">
            <div className="flex items-center justify-between border-b border-cyan-500/20 pb-3 mb-4">
              <div className="flex items-center gap-2">
                <PhoneCall className="w-4 h-4 text-cyan-400" />
                <span className="font-tactical font-bold text-lg text-white">
                  DECOY FAKE CALL GENERATOR
                </span>
              </div>
              <span className="text-[10px] font-mono text-cyan-400">ESCAPE TOOL</span>
            </div>

            <p className="text-xs font-mono text-slate-300 leading-relaxed mb-4">
              Simulates an authentic, realistic incoming phone call with ringtone audio to gracefully excuse yourself from uncomfortable, threatening, or suspicious situations.
            </p>

            <div className="space-y-3.5">
              <div>
                <label className="text-[10px] font-mono uppercase tracking-wider text-slate-400 block mb-1">
                  Caller Identity Preset
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {["Mom", "Father", "Office Security", "Cab Dispatcher", "Roommate", "Lawyer"].map((preset) => (
                    <button
                      key={preset}
                      onClick={() => {
                        setCallerName(preset);
                        if (preset === 'Mom') setCallerNumber('+91 98765 00001');
                        if (preset === 'Office Security') setCallerNumber('+91 11 2659 0011');
                        if (preset === 'Cab Dispatcher') setCallerNumber('+91 99000 12345');
                      }}
                      className={`py-1.5 px-2 rounded-lg text-xs font-mono text-center border transition-all cursor-pointer ${
                        callerName === preset
                          ? 'bg-cyan-500/25 border-cyan-400 text-cyan-300'
                          : 'bg-white/5 border-white/5 text-slate-400 hover:text-white'
                      }`}
                    >
                      {preset}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-mono uppercase tracking-wider text-slate-400 block mb-1">
                    Caller Name
                  </label>
                  <input
                    type="text"
                    value={callerName}
                    onChange={(e) => setCallerName(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-black/50 border border-cyan-500/30 text-white font-mono text-xs focus:outline-none focus:border-cyan-400"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-mono uppercase tracking-wider text-slate-400 block mb-1">
                    Delay (Seconds)
                  </label>
                  <select
                    value={callDelaySec}
                    onChange={(e) => setCallDelaySec(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-lg bg-black/50 border border-cyan-500/30 text-white font-mono text-xs focus:outline-none focus:border-cyan-400"
                  >
                    <option value={0}>Immediate (0s)</option>
                    <option value={5}>In 5 Seconds</option>
                    <option value={15}>In 15 Seconds</option>
                    <option value={30}>In 30 Seconds</option>
                  </select>
                </div>
              </div>

              <div className="pt-2">
                <TacticalButton
                  variant="cyan"
                  size="md"
                  icon={PhoneCall}
                  onClick={handleLaunchFakeCall}
                  className="w-full text-sm"
                >
                  TRIGGER REALISTIC CALL NOW
                </TacticalButton>
              </div>
            </div>
          </GlassCard>

          {/* Safe Route AI Navigator */}
          <GlassCard variant="cyan" className="p-6">
            <div className="flex items-center justify-between border-b border-cyan-500/20 pb-3 mb-4">
              <div className="flex items-center gap-2">
                <Navigation className="w-4 h-4 text-emerald-400" />
                <span className="font-tactical font-bold text-lg text-white">
                  SAFE ROUTE AI NAVIGATOR
                </span>
              </div>
              <span className="text-[10px] font-mono text-emerald-400">ILLUMINATION ANALYZER</span>
            </div>

            {/* Route comparison selector */}
            <div className="grid grid-cols-2 gap-3 mb-4">
              <button
                onClick={() => setSelectedRoute('safe')}
                className={`p-3 rounded-lg border text-left cursor-pointer transition-all ${
                  selectedRoute === 'safe'
                    ? 'bg-emerald-950/40 border-emerald-400 text-emerald-300 shadow-[0_0_15px_rgba(0,230,118,0.2)]'
                    : 'bg-white/5 border-white/5 text-slate-400'
                }`}
              >
                <div className="flex items-center justify-between text-xs font-mono mb-1">
                  <span className="font-bold text-emerald-400">SAFEST CORRIDOR</span>
                  <span className="text-emerald-300 font-bold">98% SCORE</span>
                </div>
                <span className="text-[11px] font-mono block">1.8 km • 14 mins</span>
                <span className="text-[10px] opacity-80 block mt-1">
                  100% Street-lit, 6 CCTV nodes, Police Booth #4
                </span>
              </button>

              <button
                onClick={() => setSelectedRoute('fast')}
                className={`p-3 rounded-lg border text-left cursor-pointer transition-all ${
                  selectedRoute === 'fast'
                    ? 'bg-amber-950/40 border-amber-400 text-amber-300'
                    : 'bg-white/5 border-white/5 text-slate-400'
                }`}
              >
                <div className="flex items-center justify-between text-xs font-mono mb-1">
                  <span className="font-bold text-amber-400">SHORTEST PATH</span>
                  <span className="text-amber-400 font-bold">44% SCORE</span>
                </div>
                <span className="text-[11px] font-mono block">1.2 km • 9 mins</span>
                <span className="text-[10px] opacity-80 block mt-1 text-rose-300">
                  ⚠️ Low lighting, alleyways, 0 cameras
                </span>
              </button>
            </div>

            {/* Simulated Route Vector Graphic */}
            <div className="p-4 rounded-xl bg-black/60 border border-white/10 flex flex-col gap-2 font-mono text-xs">
              <div className="flex items-center justify-between text-[11px] text-slate-400">
                <span>SECTOR: CONNAUGHT PLAZA → RESIDENTIAL GATE 2</span>
                <span className="text-emerald-400">ACTIVE GUIDANCE</span>
              </div>
              <div className="h-2 w-full rounded-full bg-slate-800 overflow-hidden flex">
                <div
                  className={`h-full ${
                    selectedRoute === 'safe'
                      ? 'w-[98%] bg-emerald-400 shadow-[0_0_8px_#00e676]'
                      : 'w-[44%] bg-amber-400'
                  }`}
                />
              </div>
              <span className="text-[10px] text-slate-400">
                {selectedRoute === 'safe'
                  ? 'Recommended: Follows main arterial avenue with continuous patrol coverage.'
                  : 'Hazard warning: Back alleyway has 3 reported unlit stretches.'}
              </span>
            </div>
          </GlassCard>
        </div>

        {/* Right Column: Quick-Dial Emergency Array & Flip Cards */}
        <div className="lg:col-span-6 flex flex-col gap-6">
          <GlassCard variant="cyan" className="p-6">
            <div className="flex items-center justify-between border-b border-cyan-500/20 pb-3 mb-4">
              <div className="flex items-center gap-2">
                <AlertOctagon className="w-4 h-4 text-rose-400" />
                <span className="font-tactical font-bold text-lg text-white">
                  SPEED-DIAL DISPATCH ARRAY
                </span>
              </div>
              <span className="text-[10px] font-mono text-rose-400">DIRECT TAP</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {emergencyNumbers.map((item, idx) => (
                <a
                  key={idx}
                  href={`tel:${item.number}`}
                  className={`p-3.5 rounded-xl bg-white/5 border ${item.color} hover:bg-white/10 transition-all flex flex-col justify-between group`}
                >
                  <div className="flex items-center justify-between text-xs font-mono mb-1.5">
                    <span className="text-[10px] font-semibold text-slate-400 tracking-wider">
                      {item.badge}
                    </span>
                    <PhoneForwarded className="w-3.5 h-3.5 text-cyan-400 group-hover:translate-x-0.5 transition-transform" />
                  </div>
                  <span className="font-tactical font-bold text-2xl text-white tracking-wider my-0.5">
                    {item.number}
                  </span>
                  <span className="text-[11px] font-mono text-slate-300">
                    {item.name}
                  </span>
                </a>
              ))}
            </div>
          </GlassCard>

          {/* Tactical Defense & Threat Matrix Interactive Cards */}
          <GlassCard variant="cyan" className="p-6">
            <div className="flex items-center justify-between border-b border-cyan-500/20 pb-3 mb-4">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-cyan-400" />
                <span className="font-tactical font-bold text-lg text-white">
                  SITUATIONAL DE-ESCALATION PROTOCOLS
                </span>
              </div>
              <span className="text-[10px] font-mono text-slate-400">
                {activeTipIdx + 1}/{safetyTips.length}
              </span>
            </div>

            <div className="p-4 rounded-xl bg-black/40 border border-cyan-500/20 flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono text-cyan-400 tracking-widest uppercase">
                  {safetyTips[activeTipIdx].category}
                </span>
              </div>
              <h3 className="font-tactical font-bold text-lg text-white">
                {safetyTips[activeTipIdx].title}
              </h3>
              <p className="text-xs font-mono text-slate-300 leading-relaxed">
                {safetyTips[activeTipIdx].desc}
              </p>
            </div>

            {/* Carousel navigation buttons */}
            <div className="flex items-center justify-between mt-4 pt-3 border-t border-white/10">
              <button
                onClick={() =>
                  setActiveTipIdx((prev) =>
                    prev === 0 ? safetyTips.length - 1 : prev - 1
                  )
                }
                className="text-xs font-mono text-cyan-400 hover:text-white cursor-pointer"
              >
                ← PREVIOUS PROTOCOL
              </button>
              <button
                onClick={() =>
                  setActiveTipIdx((prev) => (prev + 1) % safetyTips.length)
                }
                className="text-xs font-mono text-cyan-400 hover:text-white cursor-pointer"
              >
                NEXT PROTOCOL →
              </button>
            </div>
          </GlassCard>
        </div>
      </div>
    </div>
  );
}
