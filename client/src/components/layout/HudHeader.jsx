import React, { useState, useEffect } from 'react';
import {
  Volume2,
  VolumeX,
  EyeOff,
  Radio,
  BatteryCharging,
  BatteryMedium,
  Wifi,
  AlertTriangle,
  Smartphone,
  LogOut,
  LogIn,
  UserCheck
} from 'lucide-react';
import { useSecurity } from '../../context/SecurityContext';
import { tacticalAudio } from '../../services/audioService';
import BrandLogo from '../common/BrandLogo';
import StatusBadge from '../common/StatusBadge';

export default function HudHeader() {
  const {
    currentUser,
    logoutUser,
    armedState,
    systemStatus,
    soundEnabled,
    toggleSound,
    telemetry,
    deviceBattery,
    networkPing,
    setStealthMode,
    activeTab,
    setActiveTab,
    recentShakeCount,
    simulateShake
  } = useSecurity();

  const [timeStr, setTimeStr] = useState('');

  // Live clock updating every second
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTimeStr(
        now.toLocaleTimeString('en-US', {
          hour12: false,
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit'
        })
      );
    };
    updateTime();
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, []);

  const isArmed = armedState === 'ARMED';

  const handleAudioToggle = () => {
    tacticalAudio.playAlertChirp();
    toggleSound();
  };

  const handleLogout = () => {
    tacticalAudio.playClick();
    if (window.confirm("Are you sure you want to log out of Suraksha AI?")) {
      logoutUser();
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-rose-500/15 bg-[#0c0d14]/90 backdrop-blur-xl px-4 py-2.5 transition-colors duration-300">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
        {/* Brand Logo & Functional Status */}
        <div className="flex items-center gap-3.5">
          <button
            onClick={() => {
              setActiveTab('hero');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className="cursor-pointer focus:outline-none"
          >
            <BrandLogo isArmed={isArmed} />
          </button>

          {/* Real Functional System Status Badge */}
          <div className="hidden md:flex items-center pl-3 border-l border-white/10">
            <StatusBadge
              label={systemStatus}
              status={isArmed ? 'critical' : 'safe'}
              pulse={isArmed}
            />
          </div>
        </div>

        {/* Live Hardware & Browser Telemetry Strip */}
        <div className="hidden lg:flex items-center gap-6 font-mono text-xs text-slate-300">
          {/* Dynamic GPS Status */}
          <div className="flex items-center gap-2">
            <Radio
              className={`w-3.5 h-3.5 ${
                telemetry.status === 'LOCKED' ? 'text-rose-400 animate-pulse' : 'text-slate-500'
              }`}
            />
            <span className="text-slate-400">GPS:</span>
            {telemetry.status === 'LOCKED' ? (
              <span className="text-rose-200 font-semibold">
                {telemetry.latitude.toFixed(3)}°N, {telemetry.longitude.toFixed(3)}°E
                <span className="text-[10px] text-emerald-400 bg-emerald-950/40 px-1.5 py-0.5 rounded border border-emerald-500/30 ml-1.5 font-normal">
                  ±{telemetry.accuracy}m
                </span>
              </span>
            ) : telemetry.status === 'PENDING' ? (
              <span className="text-amber-300 font-semibold animate-pulse">
                ACQUIRING FIX...
              </span>
            ) : (
              <span className="text-slate-400">
                {telemetry.latitude.toFixed(3)}°N, {telemetry.longitude.toFixed(3)}°E
                <span className="text-[10px] text-slate-400 bg-black/40 px-1 py-0.5 rounded border border-white/10 ml-1.5">
                  CACHED
                </span>
              </span>
            )}
          </div>

          {/* Dynamic Battery / Latency Fallback */}
          <div className="flex items-center gap-1.5">
            {deviceBattery.isSupported ? (
              <>
                {deviceBattery.charging ? (
                  <BatteryCharging className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
                ) : (
                  <BatteryMedium className="w-3.5 h-3.5 text-emerald-400" />
                )}
                <span>
                  {deviceBattery.level}%
                  {deviceBattery.charging && (
                    <span className="text-[9px] text-emerald-400 ml-1 font-mono">CHRG</span>
                  )}
                </span>
              </>
            ) : (
              <>
                <Wifi className="w-3.5 h-3.5 text-indigo-400" />
                <span>ONLINE // {networkPing}ms</span>
              </>
            )}
          </div>

          {/* Live UTC/Local Clock */}
          <div className="flex items-baseline gap-1 text-slate-200">
            <span className="text-slate-400">LOCAL:</span>
            <span className="font-bold text-rose-300 tracking-wider">{timeStr}</span>
          </div>
        </div>

        {/* Action Controls: Quick SOS, Shake Simulator, User Profile & Logout */}
        <div className="flex items-center gap-2">
          {/* Quick SOS Shortcut Pill if not in SOS tab */}
          {activeTab !== 'sos' && (
            <button
              onClick={() => {
                setActiveTab('sos');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-tactical font-bold tracking-wider uppercase transition-all cursor-pointer ${
                isArmed
                  ? 'bg-rose-600 text-white animate-pulse shadow-[0_0_15px_rgba(244,63,94,0.8)]'
                  : 'bg-rose-500/15 border border-rose-500/50 text-rose-300 hover:bg-rose-600 hover:text-white'
              }`}
            >
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>{isArmed ? 'SOS ACTIVE' : 'SOS'}</span>
            </button>
          )}

          {/* Shake-to-SOS Quick Status & Simulator Trigger */}
          <button
            onClick={() => simulateShake()}
            title="Shake Device 3x for SOS (Click to simulate a physical shake)"
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border transition-all cursor-pointer ${
              recentShakeCount > 0
                ? 'bg-rose-500/25 border-rose-400 text-rose-200 shadow-[0_0_15px_rgba(244,63,94,0.5)]'
                : 'bg-white/5 border-white/15 text-slate-300 hover:border-rose-400/50 hover:text-rose-300'
            }`}
          >
            <Smartphone className={`w-3.5 h-3.5 ${recentShakeCount > 0 ? 'text-rose-400 animate-phone-shake' : 'text-slate-400'}`} />
            <span className="hidden sm:inline font-mono text-xs">
              {recentShakeCount > 0 ? `SHAKE ${recentShakeCount}/3` : 'SHAKE SOS'}
            </span>
          </button>

          {/* Sound Synthesizer Test & Mute Button */}
          <button
            onClick={handleAudioToggle}
            title={soundEnabled ? 'Audio Synthesizer Active (Click to test / mute)' : 'Unmute Audio Synthesizer'}
            className={`p-2 rounded-lg border transition-all cursor-pointer ${
              soundEnabled
                ? 'bg-rose-500/10 border-rose-500/30 text-rose-300 hover:border-rose-300'
                : 'bg-white/5 border-white/10 text-slate-500'
            }`}
          >
            {soundEnabled ? (
              <Volume2 className="w-4 h-4 text-rose-400" />
            ) : (
              <VolumeX className="w-4 h-4 text-slate-500" />
            )}
          </button>

          {/* Stealth Camouflage Cloak Button */}
          <button
            onClick={() => setStealthMode(true)}
            title="Engage Stealth Cloak (Disguises console as working calculator)"
            className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-white/5 border border-white/15 text-slate-300 hover:border-rose-500/40 hover:text-rose-300 transition-all text-xs font-mono cursor-pointer"
          >
            <EyeOff className="w-3.5 h-3.5" />
            <span>CLOAK</span>
          </button>

          {/* User Profile Pill */}
          {currentUser && (
            <button
              onClick={() => {
                setActiveTab('account');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              title={`Logged in as ${currentUser.name || currentUser.email}. Click to view account.`}
              className="hidden md:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-white/5 border border-white/15 hover:border-rose-400/40 text-slate-300 hover:text-white text-xs font-mono cursor-pointer transition-colors"
            >
              <div className="w-4 h-4 rounded-full bg-rose-500/30 text-rose-300 flex items-center justify-center text-[10px] font-bold">
                {(currentUser.name || currentUser.email || 'U')[0].toUpperCase()}
              </div>
              <span className="truncate max-w-[90px]">
                {currentUser.name ? currentUser.name.split(' ')[0] : 'Defender'}
              </span>
            </button>
          )}

          {/* LOGOUT / LOGIN Button */}
          {currentUser ? (
            <button
              onClick={handleLogout}
              title="Sign out of Suraksha AI"
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-rose-500/15 border border-rose-500/40 text-rose-300 hover:bg-rose-600 hover:text-white hover:border-rose-400 transition-all text-xs font-mono font-bold cursor-pointer shadow-[0_0_12px_rgba(244,63,94,0.2)]"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="uppercase tracking-wider">LOGOUT</span>
            </button>
          ) : (
            <button
              onClick={() => {
                setActiveTab('account');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              title="Sign in with your defender credentials"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-mono text-xs font-bold transition-all cursor-pointer shadow-[0_0_15px_rgba(244,63,94,0.4)]"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span className="uppercase tracking-wider">LOGIN</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
