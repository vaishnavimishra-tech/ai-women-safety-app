import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';

export default function GlassCard({
  children,
  className = "",
  variant = "cyan", // 'cyan' | 'danger' | 'safe' | 'violet'
  interactive = false,
  onClick = null
}) {
  const cardRef = useRef(null);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const [sheenPos, setSheenPos] = useState({ x: 50, y: 50 });
  const [isHovered, setIsHovered] = useState(false);

  const variantStyles = {
    cyan: "border-cyan-500/25 shadow-[0_4px_28px_rgba(0,0,0,0.5)] hover:border-cyan-400/60 hover:shadow-[0_0_25px_rgba(0,229,255,0.15)]",
    danger: "border-rose-500/40 shadow-[0_0_30px_rgba(255,23,68,0.2)] bg-rose-950/20 hover:border-rose-400/80 hover:shadow-[0_0_30px_rgba(255,23,68,0.3)]",
    safe: "border-emerald-500/30 shadow-[0_4px_28px_rgba(0,0,0,0.5)] hover:border-emerald-400/70 hover:shadow-[0_0_25px_rgba(0,230,118,0.15)]",
    violet: "border-purple-500/30 shadow-[0_4px_28px_rgba(0,0,0,0.5)] hover:border-purple-400/70 hover:shadow-[0_0_25px_rgba(168,85,247,0.15)]"
  };

  const cornerColor = {
    cyan: "border-cyan-400",
    danger: "border-rose-500",
    safe: "border-emerald-400",
    violet: "border-purple-400"
  }[variant] || "border-cyan-400";

  const handleMouseMove = (e) => {
    if (!interactive || !cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const rotateX = -((y - centerY) / centerY) * 4; // max 4 deg
    const rotateY = ((x - centerX) / centerX) * 4;

    setTilt({ x: rotateX, y: rotateY });
    setSheenPos({
      x: Math.round((x / rect.width) * 100),
      y: Math.round((y / rect.height) * 100)
    });
  };

  const handleMouseEnter = () => {
    if (interactive) setIsHovered(true);
  };

  const handleMouseLeave = () => {
    if (interactive) {
      setIsHovered(false);
      setTilt({ x: 0, y: 0 });
    }
  };

  return (
    <motion.div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={onClick}
      style={{
        transformStyle: 'preserve-3d',
        transform: interactive && isHovered
          ? `perspective(1000px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg) translateY(-2px)`
          : 'perspective(1000px) rotateX(0deg) rotateY(0deg) translateY(0px)'
      }}
      className={`relative rounded-xl bg-[#0b0f19]/80 backdrop-blur-xl border transition-transform duration-200 ease-out overflow-hidden ${variantStyles[variant]} ${
        interactive ? 'cursor-pointer' : ''
      } ${className}`}
    >
      {/* Dynamic Cursor Spotlight Glass Sheen */}
      {interactive && isHovered && (
        <div
          className="absolute inset-0 pointer-events-none transition-opacity duration-300"
          style={{
            background: `radial-gradient(circle 240px at ${sheenPos.x}% ${sheenPos.y}%, rgba(0, 229, 255, 0.12), transparent 75%)`
          }}
        />
      )}

      {/* Tactical Corner Accents */}
      <div className={`absolute -top-[1px] -left-[1px] w-2.5 h-2.5 border-t-2 border-l-2 ${cornerColor} rounded-tl-sm pointer-events-none z-10`} />
      <div className={`absolute -top-[1px] -right-[1px] w-2.5 h-2.5 border-t-2 border-r-2 ${cornerColor} rounded-tr-sm pointer-events-none z-10`} />
      <div className={`absolute -bottom-[1px] -left-[1px] w-2.5 h-2.5 border-b-2 border-l-2 ${cornerColor} rounded-bl-sm pointer-events-none z-10`} />
      <div className={`absolute -bottom-[1px] -right-[1px] w-2.5 h-2.5 border-b-2 border-r-2 ${cornerColor} rounded-br-sm pointer-events-none z-10`} />

      {/* Subtle top edge specular highlight */}
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent pointer-events-none z-10" />

      {/* Card Content with slight 3D elevation */}
      <div className="relative z-10" style={{ transform: interactive && isHovered ? 'translateZ(10px)' : 'none' }}>
        {children}
      </div>
    </motion.div>
  );
}
