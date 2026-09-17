import React, { useState } from 'react';
import {
  Settings,
  Shield,
  Bell,
  Mic,
  MapPin,
  Battery,
  Lock,
  Volume2,
  Cpu,
  Smartphone,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { useSecurity } from '../context/SecurityContext';
import { tacticalAudio } from '../services/audioService';
import GlassCard from '../components/common/GlassCard';
import TacticalButton from '../components/common/TacticalButton';
import TelemetryText from '../components/common/TelemetryText';
import StatusBadge from '../components/common/StatusBadge';

export default function SettingsPage() {
  const { soundEnabled, toggleSound, setStealthMode } = useSecurity();

  const [autoRecordAudio, setAutoRecordAudio] = useState(true);
  const [shakeToTrigger, setShakeToTrigger] = useState(true);
  const [hapticFeedback, setHapticFeedback] = useState(true);
  const [lowPower3d, setLowPower3d] = useState(false);
  const [disarmPin, setDisarmPin] = useState('1234');
  const [duressPin, setDuressPin] = useState('9999');

  const permissions = [
    {
      name: "High-Precision GPS Telemetry",
      status: "GRANTED",
      detail: "Hardware GPS locked with ±3.8m accuracy",
      icon: MapPin,
      ok: true
    },
    {
      name: "Acoustic Neural Microphone",
      status: "ARMED",
      detail: "Continuous zero-touch hotword detection enabled",
      icon: Mic,
      ok: true
    },
    {
      name: "Emergency Push Broadcasts",
      status: "PERMITTED",
      detail: "Instant background override for incoming alert pings",
      icon: Bell,
      ok: true
    },
    {
      name: "Background Battery Optimization",
      status: "UNRESTRICTED",
      detail: "App excluded from OS aggressive process termination",
      icon: Battery,
      ok: true
    }
  ];

  return (
    <div className="relative min-h-screen pb-28 pt-4 px-4 max-w-6xl mx-auto flex flex-col gap-8">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-cyan-500/20 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <Settings className="w-5 h-5 text-cyan-400" />
            <h1 className="font-tactical font-bold text-3xl md:text-4xl text-white tracking-wider">
              TACTICAL CONFIGURATION & PERMISSIONS
            </h1>
          </div>
          <p className="text-xs font-mono text-slate-400 mt-1">
            HARDWARE DIAGNOSTICS // PROTOCOL TUNING & SECURITY CODES
          </p>
        </div>

        <StatusBadge label="DIAGNOSTICS PASSED" status="safe" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left: Tactical Toggles & Hardware Diagnostic */}
        <div className="lg:col-span-7 flex flex-col gap-6">
          {/* Hardware Permissions Cards */}
          <GlassCard variant="cyan" className="p-6">
            <div className="flex items-center justify-between border-b border-cyan-500/20 pb-3 mb-4">
              <div className="flex items-center gap-2">
                <Cpu className="w-4 h-4 text-cyan-400" />
                <span className="font-tactical font-bold text-lg text-white">
                  HARDWARE & SENSOR DIAGNOSTICS
                </span>
              </div>
              <span className="text-[10px] font-mono text-emerald-400">ALL NOMINAL</span>
            </div>

            <div className="space-y-3">
              {permissions.map((perm, idx) => {
                const Icon = perm.icon;
                return (
                  <div
                    key={idx}
                    className="p-3.5 rounded-xl bg-white/5 border border-white/5 flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
                        <Icon className="w-4 h-4" />
                      </div>
                      <div>
                        <h4 className="font-tactical font-bold text-sm text-white">
                          {perm.name}
                        </h4>
                        <p className="text-[11px] font-mono text-slate-400">
                          {perm.detail}
                        </p>
                      </div>
                    </div>

                    <span className="text-[10px] font-mono font-bold text-emerald-400 bg-emerald-950/40 px-2 py-1 rounded border border-emerald-500/30 flex items-center gap-1">
                      <CheckCircle className="w-3 h-3" />
                      {perm.status}
                    </span>
                  </div>
                );
              })}
            </div>
          </GlassCard>

          {/* Micro-Interaction Toggles */}
          <GlassCard variant="cyan" className="p-6">
            <span className="text-xs font-mono uppercase tracking-widest text-slate-400 block mb-4">
              TACTICAL SYSTEM AUTOMATION
            </span>

            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/5">
                <div>
                  <h4 className="font-tactical font-bold text-base text-white">
                    Auto-Record Ambient Audio on SOS
                  </h4>
                  <p className="text-[11px] font-mono text-slate-400">
                    Captures encrypted audio stream immediately upon SOS actuation.
                  </p>
                </div>
                <button
                  onClick={() => {
                    tacticalAudio.playClick();
                    setAutoRecordAudio(!autoRecordAudio);
                  }}
                  className={`w-12 h-6 rounded-full transition-colors relative cursor-pointer ${
                    autoRecordAudio ? 'bg-cyan-500 shadow-[0_0_10px_#00e5ff]' : 'bg-slate-700'
                  }`}
                >
                  <span
                    className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white transition-transform ${
                      autoRecordAudio ? 'translate-x-6' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/5">
                <div>
                  <h4 className="font-tactical font-bold text-base text-white">
                    Shake-To-Trigger Accelerometer Sensor
                  </h4>
                  <p className="text-[11px] font-mono text-slate-400">
                    Arms emergency protocol when device experiences high G-force shake.
                  </p>
                </div>
                <button
                  onClick={() => {
                    tacticalAudio.playClick();
                    setShakeToTrigger(!shakeToTrigger);
                  }}
                  className={`w-12 h-6 rounded-full transition-colors relative cursor-pointer ${
                    shakeToTrigger ? 'bg-cyan-500 shadow-[0_0_10px_#00e5ff]' : 'bg-slate-700'
                  }`}
                >
                  <span
                    className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white transition-transform ${
                      shakeToTrigger ? 'translate-x-6' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/5">
                <div>
                  <h4 className="font-tactical font-bold text-base text-white">
                    Tactical Audio Feedback & Sound Synthesizer
                  </h4>
                  <p className="text-[11px] font-mono text-slate-400">
                    Plays HUD beeps, countdown tension ramps, and siren alarms.
                  </p>
                </div>
                <button
                  onClick={toggleSound}
                  className={`w-12 h-6 rounded-full transition-colors relative cursor-pointer ${
                    soundEnabled ? 'bg-cyan-500 shadow-[0_0_10px_#00e5ff]' : 'bg-slate-700'
                  }`}
                >
                  <span
                    className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white transition-transform ${
                      soundEnabled ? 'translate-x-6' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>
            </div>
          </GlassCard>
        </div>

        {/* Right: Security PINs & Stealth Test */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          <GlassCard variant="danger" className="p-6">
            <div className="flex items-center justify-between border-b border-rose-500/20 pb-3 mb-4">
              <div className="flex items-center gap-2">
                <Lock className="w-4 h-4 text-rose-400" />
                <span className="font-tactical font-bold text-lg text-white">
                  SECURITY DISARM & DURESS CODES
                </span>
              </div>
              <span className="text-[10px] font-mono text-rose-400">HIGH DEFENSE</span>
            </div>

            <div className="space-y-4 font-mono text-xs">
              <div>
                <label className="text-[10px] text-slate-400 uppercase tracking-wider block mb-1">
                  Master Disarm PIN
                </label>
                <input
                  type="password"
                  maxLength={4}
                  value={disarmPin}
                  onChange={(e) => setDisarmPin(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-black/60 border border-rose-500/40 text-white font-mono text-center tracking-widest text-lg focus:outline-none"
                />
                <span className="text-[10px] text-slate-400 block mt-1">
                  Default: 1234 (Used to safely stand down SOS)
                </span>
              </div>

              <div>
                <label className="text-[10px] text-slate-400 uppercase tracking-wider block mb-1">
                  Covert Silent Duress PIN
                </label>
                <input
                  type="password"
                  maxLength={4}
                  value={duressPin}
                  onChange={(e) => setDuressPin(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-black/60 border border-rose-500/40 text-white font-mono text-center tracking-widest text-lg focus:outline-none"
                />
                <span className="text-[10px] text-slate-400 block mt-1">
                  Default: 9999 (Pretends to disarm, but silently alerts police)
                </span>
              </div>
            </div>
          </GlassCard>

          {/* Test Stealth Cloak */}
          <GlassCard variant="violet" className="p-6">
            <span className="text-xs font-mono uppercase tracking-widest text-purple-300 block mb-2">
              STEALTH CAMOUFLAGE TEST
            </span>
            <p className="text-xs font-mono text-slate-300 mb-4 leading-relaxed">
              Activate the covert calculator disguise immediately. To uncloak later, enter <strong>1091=</strong> or <strong>1234=</strong>.
            </p>
            <TacticalButton
              variant="cyan"
              className="w-full"
              onClick={() => {
                tacticalAudio.playClick();
                setStealthMode(true);
              }}
            >
              ENGAGE STEALTH CALCULATOR
            </TacticalButton>
          </GlassCard>
        </div>
      </div>
    </div>
  );
}
