import React, { useState, useEffect } from 'react';
import { getContacts, addContact } from '../services/api';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Users,
  UserPlus,
  Trash2,
  Send,
  Radio,
  Battery,
  Clock,
  Shield,
  Phone,
  MessageSquare,
  Sparkles,
  CheckCircle2
} from 'lucide-react';
import { useSecurity } from '../context/SecurityContext';
import { tacticalAudio } from '../services/audioService';
import GlassCard from '../components/common/GlassCard';
import TacticalButton from '../components/common/TacticalButton';
import TelemetryText from '../components/common/TelemetryText';
import StatusBadge from '../components/common/StatusBadge';

export default function GuardianNetworkPage() {
  const {
    guardians,
    addGuardian,
    removeGuardian,
    pingGuardian,
    telemetry
  } = useSecurity();
  const [mongoContacts, setMongoContacts] = useState([]);

  useEffect(() => {
    const savedUser = localStorage.getItem('suraksha_user');
    if (!savedUser) return;
    try {
      const user = JSON.parse(savedUser);
      if (!user.id) return;
      const loadContacts = async () => {
        try {
          const data = await getContacts(user.id);
          setMongoContacts(data || []);
        } catch (error) {
          console.error("Failed to load emergency contacts:", error);
        }
      };
      loadContacts();
    } catch {}
  }, []);

  const [showAddModal, setShowAddModal] = useState(false);
  const [newGuardian, setNewGuardian] = useState({
    name: '',
    relation: '',
    phone: ''
  });
  const [pingSuccessId, setPingSuccessId] = useState(null);

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!newGuardian.name || !newGuardian.phone) return;

    try {
      const savedUser = localStorage.getItem('suraksha_user');
      if (!savedUser) {
        alert("Please login again.");
        return;
      }
      const user = JSON.parse(savedUser);

      const contact = await addContact(
        user.id,
        newGuardian.name,
        newGuardian.phone,
        newGuardian.relation
      );

      setMongoContacts((prev) => [...prev, contact]);
      setNewGuardian({ name: '', relation: '', phone: '' });
      setShowAddModal(false);
    } catch (error) {
      console.error("Failed to save contact:", error);
      alert(error.message);
    }
  };

  const handlePing = (id) => {
    pingGuardian(id);
    setPingSuccessId(id);
    setTimeout(() => setPingSuccessId(null), 2500);
  };

  const broadcastSmsPreview = `[SURAKSHA AI EMERGENCY ALERT]
I am triggering an automated SOS from Suraksha AI.
Current Location: [${telemetry.latitude.toFixed(4)}°N, ${telemetry.longitude.toFixed(4)}°E]
Track Live Beacon: https://suraksha.ai/beacon?id=user-live&lat=${telemetry.latitude}&lng=${telemetry.longitude}
Battery: 94% | Accuracy: ±${telemetry.accuracy}m`;

  const activeContactsList = mongoContacts.length > 0 ? mongoContacts : guardians;

  return (
    <div className="relative min-h-screen pb-28 pt-4 px-4 max-w-6xl mx-auto flex flex-col gap-8">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-rose-500/20 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-indigo-400" />
            <h1 className="font-tactical font-bold text-3xl md:text-4xl text-white tracking-wider">
              GUARDIAN MESH & ORBITAL GRAPH
            </h1>
          </div>
          <p className="text-xs font-mono text-slate-400 mt-1">
            ENCRYPTED RELAY ARRAY // REAL-TIME HEARTBEAT TELEMETRY
          </p>
        </div>

        <div className="flex items-center gap-3">
          <TacticalButton
            size="sm"
            variant="rose"
            icon={UserPlus}
            onClick={() => setShowAddModal(true)}
          >
            ENROLL GUARDIAN
          </TacticalButton>
          <StatusBadge
            label={`${activeContactsList.length} NODES ACTIVE`}
            status="safe"
            pulse={true}
          />
        </div>
      </div>

      {/* Main Grid: Visual Network Graph & Guardian Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left: SVG Orbital Network Graph Visualizer */}
        <div className="lg:col-span-6 flex flex-col items-center">
          <GlassCard variant="violet" className="w-full p-6 flex flex-col items-center relative overflow-hidden">
            <div className="w-full flex items-center justify-between mb-2 text-xs font-mono text-indigo-300">
              <span>CYBERNETIC MESH TOPOLOGY</span>
              <span>256-BIT SYNC</span>
            </div>

            {/* Orbital Canvas SVG */}
            <div className="relative w-[320px] h-[320px] sm:w-[360px] sm:h-[360px] flex items-center justify-center my-4">
              {/* Outer dashed orbit rings */}
              <div className="absolute w-[280px] h-[280px] rounded-full border border-dashed border-indigo-500/25 pointer-events-none" />
              <div className="absolute w-[200px] h-[200px] rounded-full border border-indigo-500/20 pointer-events-none" />

              {/* Dynamic SVG connecting lines */}
              <svg className="absolute inset-0 w-full h-full pointer-events-none">
                {activeContactsList.map((g, idx) => {
                  const total = activeContactsList.length || 1;
                  const angle = (idx / total) * Math.PI * 2 - Math.PI / 2;
                  const cx = 180;
                  const cy = 180;
                  const x = cx + Math.cos(angle) * 120;
                  const y = cy + Math.sin(angle) * 120;
                  return (
                    <g key={g._id || g.id}>
                      <line
                        x1={cx}
                        y1={cy}
                        x2={x}
                        y2={y}
                        stroke="rgba(129, 140, 248, 0.4)"
                        strokeWidth="1.5"
                        strokeDasharray="4 4"
                      />
                      {/* Pulse packet traveling to node */}
                      <circle cx={x} cy={y} r="3" fill="#f43f5e" className="animate-ping" />
                    </g>
                  );
                })}
              </svg>

              {/* Central "YOU" Node */}
              <div className="relative z-20 flex flex-col items-center">
                <span className="absolute w-16 h-16 rounded-full bg-rose-500/20 animate-ping pointer-events-none" />
                <div className="w-12 h-12 rounded-full bg-rose-500/20 border-2 border-rose-400 flex items-center justify-center text-rose-300 shadow-[0_0_20px_rgba(244,63,94,0.7)]">
                  <Shield className="w-6 h-6" />
                </div>
                <span className="text-[10px] font-mono text-rose-200 font-bold mt-1 tracking-widest">
                  YOU
                </span>
              </div>

              {/* Orbiting Guardian Nodes */}
              {activeContactsList.map((g, idx) => {
                const total = activeContactsList.length || 1;
                const angle = (idx / total) * Math.PI * 2 - Math.PI / 2;
                const radius = 120;
                const x = Math.cos(angle) * radius;
                const y = Math.sin(angle) * radius;

                return (
                  <motion.div
                    key={g._id || g.id}
                    style={{
                      transform: `translate(${x}px, ${y}px)`
                    }}
                    className="absolute z-20 flex flex-col items-center group cursor-pointer"
                  >
                    <div className="w-9 h-9 rounded-full bg-indigo-950 border-2 border-indigo-400 text-indigo-200 flex items-center justify-center text-xs font-mono font-bold shadow-[0_0_15px_rgba(129,140,248,0.5)] group-hover:scale-110 transition-transform">
                      {(g.name || 'G').charAt(0)}
                    </div>
                    <span className="text-[9px] font-mono text-indigo-300 bg-black/80 px-1.5 py-0.5 rounded mt-0.5 whitespace-nowrap">
                      {(g.name || 'Node').split(' ')[0]}
                    </span>
                  </motion.div>
                );
              })}
            </div>

            {/* Footer summary */}
            <div className="w-full text-xs font-mono text-slate-400 flex items-center justify-between border-t border-indigo-500/20 pt-3">
              <span>ACTIVE MESH PROTOCOL</span>
              <span className="text-emerald-400">100% REACHABLE</span>
            </div>
          </GlassCard>

          {/* Broadcast Message Preview Card */}
          <GlassCard variant="rose" className="w-full p-6 mt-6">
            <div className="flex items-center justify-between mb-3 border-b border-rose-500/20 pb-2">
              <div className="flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-rose-400" />
                <span className="font-tactical font-bold text-sm text-white">
                  AUTOMATED SOS BROADCAST TEMPLATE
                </span>
              </div>
              <span className="text-[10px] font-mono text-rose-400">SMS / WHATSAPP</span>
            </div>
            <pre className="text-[11px] font-mono text-slate-300 bg-black/50 p-3 rounded-lg whitespace-pre-wrap border border-white/5 leading-relaxed">
              {broadcastSmsPreview}
            </pre>
          </GlassCard>
        </div>

        {/* Right: Guardian CRUD List */}
        <div className="lg:col-span-6 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono uppercase tracking-widest text-slate-400">
              REGISTERED EMERGENCY GUARDIANS ({activeContactsList.length})
            </span>
          </div>

          <div className="space-y-3">
            {activeContactsList.map((guardian) => (
              <GlassCard
                key={guardian._id || guardian.id}
                variant="violet"
                className="p-5 flex flex-col gap-3 relative"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-indigo-500/20 border border-indigo-400/40 flex items-center justify-center font-tactical font-bold text-lg text-indigo-300">
                      {(guardian.name || 'G').charAt(0)}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-tactical font-bold text-base text-white">
                          {guardian.name}
                        </h3>
                        {guardian.isPrimary && (
                          <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                            PRIMARY
                          </span>
                        )}
                      </div>
                      <span className="text-xs font-mono text-slate-400">
                        {guardian.relationship || guardian.relation} • {guardian.phone}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => removeGuardian(guardian._id || guardian.id)}
                    title="Remove Guardian"
                    className="text-slate-500 hover:text-rose-400 p-1.5 rounded-lg hover:bg-rose-500/10 transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                {/* Telemetry Chips */}
                <div className="grid grid-cols-3 gap-2 py-2 border-y border-white/5 text-[11px] font-mono text-slate-300">
                  <div className="flex items-center gap-1.5">
                    <Battery className="w-3.5 h-3.5 text-emerald-400" />
                    <span>{guardian.battery || 90}%</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Radio className="w-3.5 h-3.5 text-rose-400" />
                    <span>{guardian.latency || '18ms'}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    <span>{guardian.lastPing || 'Just now'}</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-between pt-1">
                  <span className="text-[10px] font-mono text-emerald-400 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" />
                    {guardian.status || 'REACHABLE'}
                  </span>

                  <TacticalButton
                    size="sm"
                    variant={pingSuccessId === (guardian._id || guardian.id) ? "safe" : "outline"}
                    icon={Send}
                    onClick={() => handlePing(guardian._id || guardian.id)}
                  >
                    {pingSuccessId === (guardian._id || guardian.id) ? "PONG (14ms OK)" : "PING HEARTBEAT"}
                  </TacticalButton>
                </div>
              </GlassCard>
            ))}
          </div>
        </div>
      </div>

      {/* Enroll Guardian Modal */}
      <AnimatePresence>
        {showAddModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-md"
            >
              <GlassCard variant="rose" className="p-6">
                <div className="flex items-center justify-between border-b border-rose-500/20 pb-3 mb-4">
                  <div className="flex items-center gap-2">
                    <UserPlus className="w-5 h-5 text-rose-400" />
                    <h3 className="font-tactical font-bold text-xl text-white">
                      ENROLL NEW GUARDIAN
                    </h3>
                  </div>
                  <button
                    onClick={() => setShowAddModal(false)}
                    className="text-slate-400 hover:text-white cursor-pointer"
                  >
                    ✕
                  </button>
                </div>

                <form onSubmit={handleAdd} className="space-y-4">
                  <div>
                    <label className="text-[11px] font-mono uppercase tracking-wider text-slate-400 block mb-1">
                      Full Name
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Priya Sharma"
                      value={newGuardian.name}
                      onChange={(e) =>
                        setNewGuardian({ ...newGuardian, name: e.target.value })
                      }
                      className="w-full px-3 py-2 rounded-lg bg-black/50 border border-rose-500/30 text-white font-mono text-sm focus:outline-none focus:border-rose-400"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-mono uppercase tracking-wider text-slate-400 block mb-1">
                      Relationship
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Sister, Mother, Partner, Friend"
                      value={newGuardian.relation}
                      onChange={(e) =>
                        setNewGuardian({ ...newGuardian, relation: e.target.value })
                      }
                      className="w-full px-3 py-2 rounded-lg bg-black/50 border border-rose-500/30 text-white font-mono text-sm focus:outline-none focus:border-rose-400"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-mono uppercase tracking-wider text-slate-400 block mb-1">
                      Phone Number (SMS / WhatsApp)
                    </label>
                    <input
                      type="tel"
                      required
                      placeholder="+91 98765 43210"
                      value={newGuardian.phone}
                      onChange={(e) =>
                        setNewGuardian({ ...newGuardian, phone: e.target.value })
                      }
                      className="w-full px-3 py-2 rounded-lg bg-black/50 border border-rose-500/30 text-white font-mono text-sm focus:outline-none focus:border-rose-400"
                    />
                  </div>

                  <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10">
                    <TacticalButton
                      type="button"
                      variant="ghost"
                      onClick={() => setShowAddModal(false)}
                    >
                      CANCEL
                    </TacticalButton>
                    <TacticalButton type="submit" variant="rose">
                      LINK NODE TO MESH
                    </TacticalButton>
                  </div>
                </form>
              </GlassCard>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
