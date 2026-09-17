import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ShieldAlert,
  AlertTriangle,
  Radio,
  MapPin,
  Lock,
  Unlock,
  Volume2,
  CheckCircle2,
  PhoneCall,
  Activity,
  Send,
  Battery
} from 'lucide-react';
import { useSecurity } from '../context/SecurityContext';
import { tacticalAudio } from '../services/audioService';
import GlassCard from '../components/common/GlassCard';
import TacticalButton from '../components/common/TacticalButton';
import TelemetryText from '../components/common/TelemetryText';
import StatusBadge from '../components/common/StatusBadge';

export default function PanicHubPage() {
  const {
    armedState,
    armSos,
    disarmSos,
    telemetry,
    guardians,
    logEvent
  } = useSecurity();

  const isArmed = armedState === 'ARMED';

  // Press and hold state (2.5 seconds to arm)
  const [holdProgress, setHoldProgress] = useState(0);
  const [isHolding, setIsHolding] = useState(false);
  const holdIntervalRef = useRef(null);

  // Disarm Keypad State
  const [pinInput, setPinInput] = useState('');
  const [pinError, setPinError] = useState('');
  const [duressActive, setDuressActive] = useState(false);

  // Dispatch progress timer when armed
  const [dispatchStage, setDispatchStage] = useState(0);

  // Handle Press and Hold
  const startHold = () => {
    if (isArmed) return;
    setIsHolding(true);
    setHoldProgress(0);
    tacticalAudio.playArmCountdown(0.1);

    const startTime = Date.now();
    const duration = 2200; // 2.2 seconds

    holdIntervalRef.current = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      setHoldProgress(progress);
      tacticalAudio.playArmCountdown(progress);

      if (progress >= 1) {
        clearInterval(holdIntervalRef.current);
        setIsHolding(false);
        setHoldProgress(0);
        armSos('PRESS_AND_HOLD_TRIGGER');
      }
    }, 50);
  };

  const cancelHold = () => {
    if (holdIntervalRef.current) {
      clearInterval(holdIntervalRef.current);
      holdIntervalRef.current = null;
    }
    setIsHolding(false);
    setHoldProgress(0);
  };

  // Quick Trigger
  const handleQuickTrigger = () => {
    if (!isArmed) {
      armSos('QUICK_TRIGGER_BUTTON');
    }
  };

  // Disarm PIN Submit
  const handleDisarmSubmit = (digit) => {
    const nextPin = pinInput + digit;
    setPinError('');

    if (nextPin.length === 4) {
      const result = disarmSos(nextPin);
      if (result.success) {
        setPinInput('');
        setPinError('');
        if (result.duress) {
          setDuressActive(true);
        }
      } else {
        setPinError('INVALID PIN. ENTER 1234');
        setPinInput('');
      }
    } else {
      setPinInput(nextPin);
    }
  };

  const handleClearPin = () => {
    setPinInput('');
    setPinError('');
  };

  // Dispatch stage animation when armed
  useEffect(() => {
    if (isArmed) {
      setDispatchStage(1);
      const t1 = setTimeout(() => setDispatchStage(2), 800);
      const t2 = setTimeout(() => setDispatchStage(3), 1600);
      const t3 = setTimeout(() => setDispatchStage(4), 2400);
      return () => {
        clearTimeout(t1);
        clearTimeout(t2);
        clearTimeout(t3);
      };
    } else {
      setDispatchStage(0);
      setPinInput('');
    }
  }, [isArmed]);

  return (
    <div className="relative min-h-screen pb-28 pt-4 px-4 max-w-6xl mx-auto flex flex-col gap-8">
      {/* Header telemetry ribbon */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-cyan-500/20 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <ShieldAlert className={`w-5 h-5 ${isArmed ? 'text-rose-500 animate-bounce' : 'text-cyan-400'}`} />
            <h1 className="font-tactical font-bold text-3xl md:text-4xl text-white tracking-wider">
              TACTICAL SOS MISSION CENTER
            </h1>
          </div>
          <p className="text-xs font-mono text-slate-400 mt-1">
            DEFENSE PROTOCOL // DUAL-STAGE HIGH PRESSURE DISPATCH
          </p>
        </div>

        <div className="flex items-center gap-3">
          <StatusBadge
            label={isArmed ? 'EMERGENCY ARMED' : 'STANDBY READY'}
            status={isArmed ? 'critical' : 'safe'}
            pulse={isArmed}
          />
          <span className="text-xs font-mono text-slate-400 px-3 py-1 rounded bg-black/40 border border-white/10">
            DISARM CODE: 1234
          </span>
        </div>
      </div>

      {/* Main Grid: SOS Trigger & Telemetry */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Big SOS Action Terminal */}
        <div className="lg:col-span-7 flex flex-col items-center justify-center">
          <GlassCard
            variant={isArmed ? 'danger' : 'cyan'}
            className="w-full p-8 flex flex-col items-center justify-center relative overflow-hidden"
          >
            {/* Background warning strobes when armed */}
            {isArmed && (
              <div className="absolute inset-0 bg-rose-600/15 animate-strobe pointer-events-none" />
            )}

            <div className="relative z-10 flex flex-col items-center text-center">
              <span className="text-xs font-mono tracking-widest text-slate-400 uppercase mb-2">
                {isArmed ? 'TACTICAL ARMED STATE ENGAGED' : 'HIGH-TENSION DISPATCH ACTUATOR'}
              </span>

              {/* Central Big SOS Button with Circular Progress Meter */}
              <div className="relative my-8 select-none flex items-center justify-center">
                {/* Outer animated radar pulse rings */}
                <div
                  className={`absolute -inset-8 rounded-full border-2 transition-all duration-300 pointer-events-none ${
                    isArmed
                      ? 'border-rose-500/60 animate-ping'
                      : isHolding
                      ? 'border-cyan-400/80 animate-pulse'
                      : 'border-cyan-500/20'
                  }`}
                />
                <div
                  className={`absolute -inset-16 rounded-full border border-dashed transition-all duration-300 pointer-events-none ${
                    isArmed ? 'border-rose-500/40 animate-spin' : 'border-cyan-500/10'
                  }`}
                  style={{ animationDuration: '10s' }}
                />

                {/* SVG Progress Circle for Hold */}
                <svg className="absolute -inset-4 w-[232px] h-[232px] -rotate-90 pointer-events-none">
                  <circle
                    cx="116"
                    cy="116"
                    r="104"
                    fill="none"
                    stroke="rgba(255, 255, 255, 0.08)"
                    strokeWidth="6"
                  />
                  <circle
                    cx="116"
                    cy="116"
                    r="104"
                    fill="none"
                    stroke={isArmed ? '#ff1744' : '#00e5ff'}
                    strokeWidth="8"
                    strokeDasharray={2 * Math.PI * 104}
                    strokeDashoffset={2 * Math.PI * 104 * (1 - holdProgress)}
                    strokeLinecap="round"
                    className="transition-all duration-75"
                  />
                </svg>

                {/* The Main SOS Touch/Hold Target */}
                <button
                  onMouseDown={startHold}
                  onMouseUp={cancelHold}
                  onMouseLeave={cancelHold}
                  onTouchStart={startHold}
                  onTouchEnd={cancelHold}
                  disabled={isArmed}
                  className={`relative w-48 h-48 rounded-full flex flex-col items-center justify-center transition-all duration-200 cursor-pointer shadow-2xl select-none ${
                    isArmed
                      ? 'bg-gradient-to-b from-rose-600 to-rose-900 border-4 border-white text-white shadow-[0_0_60px_rgba(255,23,68,0.9)]'
                      : isHolding
                      ? 'scale-95 bg-gradient-to-b from-cyan-500 to-blue-700 text-white shadow-[0_0_45px_rgba(0,229,255,0.7)]'
                      : 'bg-gradient-to-b from-rose-600/90 to-rose-950 border-4 border-rose-500/60 text-white hover:border-rose-400 shadow-[0_0_35px_rgba(255,23,68,0.4)] active:scale-95'
                  }`}
                >
                  <AlertTriangle
                    className={`w-12 h-12 mb-1 ${
                      isArmed ? 'animate-bounce text-white' : 'text-rose-200'
                    }`}
                  />
                  <span className="font-tactical font-extrabold text-3xl tracking-widest leading-none">
                    {isArmed ? 'ARMED' : 'SOS'}
                  </span>
                  <span className="text-[10px] font-mono tracking-wider mt-1 opacity-90">
                    {isArmed
                      ? 'BROADCASTING'
                      : isHolding
                      ? `${Math.round(holdProgress * 100)}% HOLDING`
                      : 'HOLD 2.2s'}
                  </span>
                </button>
              </div>

              {/* Instructions and Quick Bypass */}
              <div className="flex flex-col items-center gap-3">
                <p className="text-xs text-slate-300 font-mono max-w-sm">
                  {isArmed
                    ? '⚠️ CRITICAL ALERT: Emergency broadcast actively transmitting to nearest PCR units & guardian mesh.'
                    : 'Press and hold for 2.2s to arm SOS and dispatch automated emergency telemetry.'}
                </p>

                {!isArmed && (
                  <div className="flex items-center gap-3 pt-2">
                    <button
                      onClick={handleQuickTrigger}
                      className="text-xs font-mono text-rose-400 hover:text-rose-300 underline underline-offset-4 cursor-pointer"
                    >
                      [ QUICK TAP OVERRIDE (1-TAP ARM) ]
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Siren Waveform Animation */}
            {isArmed && (
              <div className="w-full mt-6 pt-6 border-t border-rose-500/30 flex flex-col items-center gap-2">
                <div className="flex items-center gap-2 text-rose-400 font-mono text-xs">
                  <Volume2 className="w-4 h-4 animate-pulse" />
                  <span>ACOUSTIC SIREN & BROADCAST PULSE ACTIVE</span>
                </div>
                <div className="flex items-end justify-center gap-1.5 h-10 w-full max-w-xs">
                  {[40, 85, 60, 100, 75, 90, 50, 95, 70, 100, 60, 80].map((h, i) => (
                    <motion.div
                      key={i}
                      animate={{ height: ['20%', `${h}%`, '30%'] }}
                      transition={{
                        repeat: Infinity,
                        duration: 0.6,
                        delay: i * 0.05,
                        ease: 'easeInOut'
                      }}
                      className="w-2 rounded-t bg-gradient-to-t from-rose-700 to-rose-400"
                    />
                  ))}
                </div>
              </div>
            )}
          </GlassCard>
        </div>

        {/* Right Column: Dispatch Status & Disarm Keypad */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          {/* If Armed: Show Disarm Keypad */}
          {isArmed ? (
            <GlassCard variant="danger" className="p-6 flex flex-col items-center">
              <div className="flex items-center gap-2 text-rose-300 font-tactical font-bold text-xl mb-1">
                <Lock className="w-5 h-5" />
                <span>DISARM SECURITY KEYPAD</span>
              </div>
              <p className="text-xs font-mono text-slate-400 mb-4 text-center">
                Enter 4-digit master PIN (Default: 1234) or Duress code (9999)
              </p>

              {/* PIN Digits Display */}
              <div className="flex items-center justify-center gap-3 my-2">
                {[0, 1, 2, 3].map((idx) => (
                  <div
                    key={idx}
                    className={`w-10 h-12 rounded-lg border-2 flex items-center justify-center text-xl font-mono font-bold ${
                      pinInput.length > idx
                        ? 'bg-rose-500/20 border-rose-400 text-white'
                        : 'bg-black/40 border-slate-700 text-slate-600'
                    }`}
                  >
                    {pinInput.length > idx ? '●' : '—'}
                  </div>
                ))}
              </div>

              {pinError && (
                <div className="text-xs font-mono text-rose-400 font-bold mt-2 animate-bounce">
                  {pinError}
                </div>
              )}

              {/* Keypad Grid */}
              <div className="grid grid-cols-3 gap-2.5 w-full max-w-[240px] mt-4">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
                  <button
                    key={num}
                    onClick={() => handleDisarmSubmit(String(num))}
                    className="h-12 rounded-lg bg-white/5 hover:bg-rose-500/20 border border-white/10 hover:border-rose-400 font-tactical font-bold text-lg text-white transition-colors cursor-pointer"
                  >
                    {num}
                  </button>
                ))}
                <button
                  onClick={handleClearPin}
                  className="h-12 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 font-mono text-xs text-slate-400 transition-colors cursor-pointer"
                >
                  CLR
                </button>
                <button
                  onClick={() => handleDisarmSubmit('0')}
                  className="h-12 rounded-lg bg-white/5 hover:bg-rose-500/20 border border-white/10 hover:border-rose-400 font-tactical font-bold text-lg text-white transition-colors cursor-pointer"
                >
                  0
                </button>
                <button
                  onClick={() => handleDisarmSubmit('')}
                  className="h-12 rounded-lg bg-white/5 hover:bg-emerald-500/20 border border-white/10 font-mono text-xs text-emerald-400 transition-colors cursor-pointer"
                >
                  OK
                </button>
              </div>
            </GlassCard>
          ) : (
            /* Standing By: Live Location & Dispatch Readiness Card */
            <GlassCard variant="cyan" className="p-6 flex flex-col gap-4">
              <div className="flex items-center justify-between border-b border-cyan-500/20 pb-3">
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-cyan-400 animate-pulse" />
                  <span className="font-tactical font-bold text-lg text-white">
                    LIVE LOCATION TELEMETRY
                  </span>
                </div>
                <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/40 px-2 py-0.5 rounded border border-emerald-500/30">
                  LOCK NOMINAL
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <TelemetryText
                  label="LATITUDE"
                  value={telemetry.latitude.toFixed(4)}
                  unit="°N"
                />
                <TelemetryText
                  label="LONGITUDE"
                  value={telemetry.longitude.toFixed(4)}
                  unit="°E"
                />
                <TelemetryText
                  label="GPS ACCURACY"
                  value={`±${telemetry.accuracy}`}
                  unit="METERS"
                  variant="green"
                />
                <TelemetryText
                  label="ALTITUDE"
                  value={telemetry.altitude}
                  unit="M"
                />
              </div>

              <div className="p-3 rounded-lg bg-black/40 border border-white/5 flex items-start gap-2 text-xs font-mono text-slate-300">
                <Radio className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                <div>
                  <span className="text-slate-400 block text-[10px]">ADDRESS SECTOR:</span>
                  <span>{telemetry.address}</span>
                </div>
              </div>
            </GlassCard>
          )}

          {/* Automated Dispatch Packet Status */}
          <GlassCard variant={isArmed ? 'danger' : 'safe'} className="p-6">
            <div className="flex items-center justify-between mb-4 border-b border-white/10 pb-3">
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-cyan-400" />
                <span className="font-tactical font-bold text-base text-white">
                  AUTOMATED DISPATCH ARRAY
                </span>
              </div>
              <span className="text-[10px] font-mono text-slate-400">
                {guardians.length} GUARDIANS
              </span>
            </div>

            <div className="space-y-3 font-mono text-xs">
              <div className="flex items-center justify-between p-2 rounded bg-white/5 border border-white/5">
                <div className="flex items-center gap-2">
                  <PhoneCall className="w-3.5 h-3.5 text-rose-400" />
                  <span className="text-slate-200">National Police 112:</span>
                </div>
                <span
                  className={
                    dispatchStage >= 2
                      ? 'text-rose-400 font-bold'
                      : 'text-slate-400'
                  }
                >
                  {dispatchStage >= 2 ? 'PACKET TRANSMITTED' : 'STANDBY (READY)'}
                </span>
              </div>

              <div className="flex items-center justify-between p-2 rounded bg-white/5 border border-white/5">
                <div className="flex items-center gap-2">
                  <PhoneCall className="w-3.5 h-3.5 text-amber-400" />
                  <span className="text-slate-200">Women Helpline 1091:</span>
                </div>
                <span
                  className={
                    dispatchStage >= 3
                      ? 'text-amber-400 font-bold'
                      : 'text-slate-400'
                  }
                >
                  {dispatchStage >= 3 ? 'TELEMETRY SYNCED' : 'STANDBY (READY)'}
                </span>
              </div>

              <div className="flex items-center justify-between p-2 rounded bg-white/5 border border-white/5">
                <div className="flex items-center gap-2">
                  <Send className="w-3.5 h-3.5 text-cyan-400" />
                  <span className="text-slate-200">Guardian SMS Relay:</span>
                </div>
                <span
                  className={
                    dispatchStage >= 4
                      ? 'text-emerald-400 font-bold'
                      : 'text-slate-400'
                  }
                >
                  {dispatchStage >= 4
                    ? `${guardians.length}/${guardians.length} BROADCASTED`
                    : 'ARM TO BROADCAST'}
                </span>
              </div>
            </div>
          </GlassCard>
        </div>
      </div>
    </div>
  );
}
