import React from 'react';
import { motion } from 'framer-motion';

export default function StatusBadge({
  label,
  status = "normal", // 'normal' | 'active' | 'warning' | 'critical' | 'safe'
  pulse = true,
  className = ""
}) {
  const configs = {
    normal: {
      dot: "bg-cyan-400",
      halo: "bg-cyan-400/30",
      bg: "bg-cyan-950/40 text-cyan-300 border-cyan-500/30"
    },
    active: {
      dot: "bg-cyan-300",
      halo: "bg-cyan-400/40",
      bg: "bg-cyan-900/50 text-cyan-200 border-cyan-400/50 shadow-[0_0_10px_rgba(0,229,255,0.2)]"
    },
    warning: {
      dot: "bg-amber-400",
      halo: "bg-amber-400/35",
      bg: "bg-amber-950/40 text-amber-300 border-amber-500/40"
    },
    critical: {
      dot: "bg-rose-500",
      halo: "bg-rose-500/50",
      bg: "bg-rose-950/60 text-rose-300 border-rose-500/60 shadow-[0_0_15px_rgba(255,23,68,0.4)]"
    },
    safe: {
      dot: "bg-emerald-400",
      halo: "bg-emerald-400/30",
      bg: "bg-emerald-950/40 text-emerald-300 border-emerald-500/30"
    }
  }[status] || configs.normal;

  return (
    <span
      className={`inline-flex items-center gap-2 px-2.5 py-1 rounded-full text-[11px] font-mono font-semibold border uppercase tracking-wider select-none ${configs.bg} ${className}`}
    >
      <span className="relative flex h-2 w-2 items-center justify-center">
        {/* Soft breathing halo */}
        <motion.span
          animate={{ scale: [1, 1.8, 1], opacity: [0.6, 0.1, 0.6] }}
          transition={{ repeat: Infinity, duration: 2.2, ease: "easeInOut" }}
          className={`absolute inline-flex h-full w-full rounded-full ${configs.halo}`}
        />
        {/* Breathing live center dot */}
        <motion.span
          animate={{ scale: [0.9, 1.15, 0.9], opacity: [0.85, 1, 0.85] }}
          transition={{ repeat: Infinity, duration: 1.8, ease: "easeInOut" }}
          className={`relative inline-flex rounded-full h-2 w-2 shadow-sm ${configs.dot}`}
        />
      </span>
      {label}
    </span>
  );
}
