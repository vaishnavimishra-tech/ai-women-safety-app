import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Radar,
  MapPin,
  Shield,
  Navigation,
  Compass,
  Building,
  Phone,
  Radio,
  Filter,
  Eye
} from 'lucide-react';
import { useSecurity } from '../context/SecurityContext';
import { NEARBY_SAFE_HAVENS } from '../services/geolocationService';
import { tacticalAudio } from '../services/audioService';
import GlassCard from '../components/common/GlassCard';
import TacticalButton from '../components/common/TacticalButton';
import TelemetryText from '../components/common/TelemetryText';
import StatusBadge from '../components/common/StatusBadge';

export default function RadarMapPage() {
  const { telemetry, logEvent } = useSecurity();
  const [selectedHaven, setSelectedHaven] = useState(NEARBY_SAFE_HAVENS[0]);
  const [safeCorridorActive, setSafeCorridorActive] = useState(true);
  const [radarFilter, setRadarFilter] = useState('ALL'); // 'ALL' | 'POLICE' | 'HOSPITAL' | 'PATROL'

  const handlePingRadar = () => {
    tacticalAudio.playRadarPing();
    logEvent("RADAR_SWEEP_PULSE", "Tactical Sonar Sweep Executed", "Detected 4 verified safe havens in 800m quadrant.", "INFO");
  };

  const filteredHavens = NEARBY_SAFE_HAVENS.filter((h) => {
    if (radarFilter === 'ALL') return true;
    if (radarFilter === 'POLICE') return h.type === 'police' || h.type === 'patrol';
    if (radarFilter === 'HOSPITAL') return h.type === 'hospital';
    return true;
  });

  return (
    <div className="relative min-h-screen pb-28 pt-4 px-4 max-w-6xl mx-auto flex flex-col gap-8">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-cyan-500/20 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <Radar className="w-5 h-5 text-cyan-400 animate-spin" style={{ animationDuration: '6s' }} />
            <h1 className="font-tactical font-bold text-3xl md:text-4xl text-white tracking-wider">
              SONAR RADAR & GEOSPACIAL HAVENS
            </h1>
          </div>
          <p className="text-xs font-mono text-slate-400 mt-1">
            CONTINUOUS 360° ACOUSTIC SCAN // HIGH-ILLUMINATION SAFETY CORRIDORS
          </p>
        </div>

        <div className="flex items-center gap-3">
          <TacticalButton
            size="sm"
            variant="cyan"
            icon={Radar}
            onClick={handlePingRadar}
          >
            PING SONAR
          </TacticalButton>
          <StatusBadge label="RADAR ACTIVE" status="safe" pulse={true} />
        </div>
      </div>

      {/* Main Grid: 360° Radar Visualizer & Safe Haven Dossier */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Interactive Circular Sonar Radar Canvas */}
        <div className="lg:col-span-7 flex flex-col items-center">
          <GlassCard variant="cyan" className="w-full p-6 flex flex-col items-center relative overflow-hidden">
            {/* Header filters */}
            <div className="w-full flex items-center justify-between mb-4 text-xs font-mono">
              <div className="flex items-center gap-1.5 text-cyan-400">
                <Compass className="w-4 h-4 animate-pulse" />
                <span>GRID [28.6139°N, 77.2090°E]</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setRadarFilter('ALL')}
                  className={`px-2 py-0.5 rounded text-[10px] cursor-pointer ${
                    radarFilter === 'ALL'
                      ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-400/40'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  ALL
                </button>
                <button
                  onClick={() => setRadarFilter('POLICE')}
                  className={`px-2 py-0.5 rounded text-[10px] cursor-pointer ${
                    radarFilter === 'POLICE'
                      ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-400/40'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  POLICE
                </button>
                <button
                  onClick={() => setRadarFilter('HOSPITAL')}
                  className={`px-2 py-0.5 rounded text-[10px] cursor-pointer ${
                    radarFilter === 'HOSPITAL'
                      ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-400/40'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  MEDICAL
                </button>
              </div>
            </div>

            {/* The Tactical Radar Display Screen */}
            <div className="relative w-[320px] h-[320px] sm:w-[380px] sm:h-[380px] rounded-full bg-[#070b14] border-2 border-cyan-500/40 flex items-center justify-center overflow-hidden shadow-[0_0_50px_rgba(0,229,255,0.15)] my-2">
              {/* Concentric Distance Rings */}
              <div className="absolute w-[25%] h-[25%] rounded-full border border-cyan-500/25 pointer-events-none" />
              <div className="absolute w-[50%] h-[50%] rounded-full border border-cyan-500/20 pointer-events-none" />
              <div className="absolute w-[75%] h-[75%] rounded-full border border-cyan-500/15 pointer-events-none" />
              <div className="absolute w-[95%] h-[95%] rounded-full border border-dashed border-cyan-500/20 pointer-events-none" />

              {/* Crosshair Axes */}
              <div className="absolute inset-x-0 h-px bg-cyan-500/20 pointer-events-none" />
              <div className="absolute inset-y-0 w-px bg-cyan-500/20 pointer-events-none" />

              {/* Distance Labels */}
              <span className="absolute top-2 text-[9px] font-mono text-cyan-400/60 pointer-events-none">
                NORTH // 1000m
              </span>
              <span className="absolute right-3 text-[9px] font-mono text-cyan-400/60 pointer-events-none">
                EAST
              </span>
              <span className="absolute bottom-2 text-[9px] font-mono text-cyan-400/60 pointer-events-none">
                SOUTH
              </span>
              <span className="absolute left-3 text-[9px] font-mono text-cyan-400/60 pointer-events-none">
                WEST
              </span>

              {/* Safe Corridor glowing visual trail */}
              {safeCorridorActive && (
                <div className="absolute w-44 h-1.5 bg-gradient-to-r from-emerald-500/40 via-cyan-400/50 to-transparent rotate-45 rounded-full blur-[1px] pointer-events-none" />
              )}

              {/* Central User Location Marker */}
              <div className="relative z-20 flex items-center justify-center">
                <span className="absolute w-8 h-8 rounded-full bg-cyan-500/30 animate-ping" />
                <div className="w-3.5 h-3.5 rounded-full bg-cyan-400 border-2 border-white shadow-[0_0_15px_rgba(0,229,255,1)]" />
                <span className="absolute -bottom-5 text-[9px] font-mono text-cyan-300 font-bold tracking-wider">
                  YOU
                </span>
              </div>

              {/* Continuous Rotating 360-Degree Sonar Sweep Beam */}
              <div
                className="absolute inset-0 pointer-events-none animate-radar-sweep origin-center"
                style={{
                  background:
                    'conic-gradient(from 0deg at 50% 50%, rgba(0, 229, 255, 0.4) 0deg, rgba(0, 229, 255, 0.08) 45deg, transparent 90deg)'
                }}
              />

              {/* Radar Blips for Safe Havens */}
              {filteredHavens.map((haven) => {
                // Approximate radial position based on distance and bearing
                const rad = ((haven.bearing - 90) * Math.PI) / 180;
                const distanceVal = parseInt(haven.distance, 10);
                const radiusPx = (distanceVal / 800) * 140; // Max 140px offset
                const x = Math.cos(rad) * radiusPx;
                const y = Math.sin(rad) * radiusPx;

                const isSelected = selectedHaven?.id === haven.id;
                const blipColor =
                  haven.type === 'hospital'
                    ? 'bg-emerald-400'
                    : haven.type === 'patrol'
                    ? 'bg-purple-400'
                    : 'bg-cyan-400';

                return (
                  <button
                    key={haven.id}
                    onClick={() => {
                      tacticalAudio.playClick();
                      setSelectedHaven(haven);
                    }}
                    style={{
                      transform: `translate(${x}px, ${y}px)`
                    }}
                    className="absolute z-30 group cursor-pointer focus:outline-none"
                  >
                    <span
                      className={`absolute -inset-1 rounded-full ${blipColor} opacity-75 animate-ping`}
                    />
                    <div
                      className={`w-3 h-3 rounded-full ${blipColor} border border-white transition-transform ${
                        isSelected ? 'scale-150 shadow-[0_0_15px_#fff]' : 'group-hover:scale-125'
                      }`}
                    />
                    <span className="absolute left-4 -top-2 text-[9px] font-mono bg-black/80 px-1.5 py-0.5 rounded text-white whitespace-nowrap border border-white/20 hidden group-hover:block z-40">
                      {haven.name} ({haven.distance})
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Radar status footer */}
            <div className="w-full mt-4 flex items-center justify-between text-xs font-mono text-slate-400 border-t border-cyan-500/15 pt-3">
              <span className="flex items-center gap-1.5 text-emerald-400">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                {filteredHavens.length} VERIFIED HAVENS LOCKED
              </span>
              <button
                onClick={() => setSafeCorridorActive(!safeCorridorActive)}
                className="text-cyan-400 hover:underline cursor-pointer"
              >
                SAFE CORRIDOR: {safeCorridorActive ? 'ENGAGED' : 'OFF'}
              </button>
            </div>
          </GlassCard>
        </div>

        {/* Right Column: Safe Haven Dossier & Rapid Transit */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          {/* Selected Haven Dossier Card */}
          {selectedHaven && (
            <GlassCard variant="cyan" className="p-6">
              <div className="flex items-center justify-between border-b border-cyan-500/20 pb-3 mb-4">
                <div className="flex items-center gap-2">
                  <Shield className="w-4 h-4 text-cyan-400" />
                  <span className="font-tactical font-bold text-lg text-white">
                    SAFE HAVEN DOSSIER
                  </span>
                </div>
                <StatusBadge label={selectedHaven.status} status="safe" />
              </div>

              <h2 className="font-tactical font-bold text-xl text-cyan-300 mb-1">
                {selectedHaven.name}
              </h2>
              <p className="text-xs font-mono text-slate-400 mb-4">
                SECTOR DISPATCH // TYPE: {selectedHaven.type.toUpperCase()}
              </p>

              <div className="grid grid-cols-2 gap-3 mb-4">
                <TelemetryText
                  label="PROXIMITY"
                  value={selectedHaven.distance}
                  variant="green"
                />
                <TelemetryText
                  label="BEARING"
                  value={`${selectedHaven.bearing}°`}
                  unit="RADIAL"
                />
                <TelemetryText
                  label="COORDINATES"
                  value={`${selectedHaven.coords.lat.toFixed(4)}`}
                  unit="LAT"
                />
                <TelemetryText
                  label="DIRECT LINE"
                  value={selectedHaven.phone}
                  unit="TAP TO DIAL"
                  variant="cyan"
                />
              </div>

              <div className="flex flex-col sm:flex-row gap-3 pt-3 border-t border-white/10">
                <TacticalButton
                  variant="safe"
                  icon={Navigation}
                  onClick={() => {
                    tacticalAudio.playClick();
                    alert(`Navigating along verified CCTV corridor to: ${selectedHaven.name}`);
                  }}
                  className="flex-1"
                >
                  ROUTE TO HAVEN
                </TacticalButton>

                <a
                  href={`tel:${selectedHaven.phone}`}
                  className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-cyan-500/20 border border-cyan-400/60 text-cyan-300 hover:bg-cyan-500/30 text-xs font-tactical font-bold uppercase transition-colors"
                >
                  <Phone className="w-4 h-4" />
                  CALL DISPATCH
                </a>
              </div>
            </GlassCard>
          )}

          {/* List of all Safe Havens in range */}
          <GlassCard variant="cyan" className="p-6">
            <span className="text-xs font-mono uppercase tracking-widest text-slate-400 block mb-3">
              SURROUNDING RESPONSE CHECKPOINTS ({filteredHavens.length})
            </span>

            <div className="space-y-2.5">
              {filteredHavens.map((h) => (
                <div
                  key={h.id}
                  onClick={() => {
                    tacticalAudio.playClick();
                    setSelectedHaven(h);
                  }}
                  className={`p-3 rounded-lg border flex items-center justify-between cursor-pointer transition-all ${
                    selectedHaven?.id === h.id
                      ? 'bg-cyan-500/15 border-cyan-400/50'
                      : 'bg-white/5 border-white/5 hover:border-white/20'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Building className="w-4 h-4 text-cyan-400 shrink-0" />
                    <div>
                      <h3 className="font-tactical font-semibold text-sm text-white leading-tight">
                        {h.name}
                      </h3>
                      <span className="text-[10px] font-mono text-slate-400">
                        {h.distance} away • {h.status}
                      </span>
                    </div>
                  </div>
                  <span className="text-xs font-mono text-cyan-400 font-bold">
                    {h.distance}
                  </span>
                </div>
              ))}
            </div>
          </GlassCard>
        </div>
      </div>
    </div>
  );
}
