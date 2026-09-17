import React from 'react';
import { motion } from 'framer-motion';
import { tacticalAudio } from '../../services/audioService';

export default function TacticalButton({
  children,
  onClick,
  variant = "cyan", // 'cyan' | 'danger' | 'safe' | 'outline' | 'ghost'
  size = "md", // 'sm' | 'md' | 'lg'
  icon: Icon,
  disabled = false,
  className = "",
  playAudio = true
}) {
  const handleClick = (e) => {
    if (disabled) return;
    if (playAudio) {
      tacticalAudio.playClick();
    }
    if (onClick) onClick(e);
  };

  const sizeClasses = {
    sm: "px-3 py-1.5 text-xs font-mono tracking-wider",
    md: "px-5 py-2.5 text-sm font-tactical font-semibold tracking-wider",
    lg: "px-8 py-3.5 text-base font-tactical font-bold tracking-widest"
  }[size];

  const variantClasses = {
    cyan: "bg-cyan-500/15 border border-cyan-400/50 text-cyan-300 hover:bg-cyan-500/30 hover:border-cyan-300 shadow-[0_0_15px_rgba(0,229,255,0.2)] hover:shadow-[0_0_25px_rgba(0,229,255,0.5)] active:shadow-[0_0_35px_rgba(0,229,255,0.7)]",
    danger: "bg-rose-600/20 border border-rose-500/70 text-rose-300 hover:bg-rose-600/40 hover:border-rose-400 shadow-[0_0_20px_rgba(255,23,68,0.3)] hover:shadow-[0_0_35px_rgba(255,23,68,0.6)] active:shadow-[0_0_45px_rgba(255,23,68,0.8)]",
    safe: "bg-emerald-500/20 border border-emerald-400/60 text-emerald-300 hover:bg-emerald-500/35 hover:border-emerald-300 shadow-[0_0_15px_rgba(0,230,118,0.25)] hover:shadow-[0_0_25px_rgba(0,230,118,0.5)]",
    outline: "bg-transparent border border-slate-700 text-slate-300 hover:border-cyan-400/60 hover:text-cyan-300 hover:shadow-[0_0_15px_rgba(0,229,255,0.25)]",
    ghost: "bg-transparent text-slate-400 hover:text-white hover:bg-white/5 border border-transparent"
  }[variant];

  return (
    <motion.button
      whileHover={disabled ? {} : { scale: 1.04, y: -1 }}
      whileTap={disabled ? {} : { scale: 0.96, y: 0 }}
      transition={{ type: "spring", stiffness: 400, damping: 17 }}
      disabled={disabled}
      onClick={handleClick}
      className={`group relative inline-flex items-center justify-center gap-2 rounded-lg uppercase select-none overflow-hidden ${sizeClasses} ${variantClasses} ${
        disabled ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'
      } ${className}`}
    >
      {/* Animated light-sweep highlight traveling across the button perimeter on hover */}
      <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-out bg-gradient-to-r from-transparent via-white/20 to-transparent pointer-events-none" />

      {/* Corner cut tactical highlight */}
      <span className="absolute top-0 left-0 w-1.5 h-1.5 border-t border-l border-white/40 group-hover:border-white transition-colors" />
      <span className="absolute bottom-0 right-0 w-1.5 h-1.5 border-b border-r border-white/40 group-hover:border-white transition-colors" />

      {Icon && <Icon className="w-4 h-4 shrink-0 transition-transform group-hover:scale-110" />}
      <span className="relative z-10">{children}</span>
    </motion.button>
  );
}
