import React from 'react';

export default function BrandLogo({ className = "", isArmed = false }) {
  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      {/* Minimal geometric shield silhouette with center status pulse dot */}
      <div
        className={`relative w-8 h-8 rounded-lg flex items-center justify-center transition-colors duration-200 border ${
          isArmed
            ? 'bg-rose-500/15 border-rose-500 text-rose-400'
            : 'bg-white/5 border-cyan-500/30 text-cyan-400 hover:border-cyan-400'
        }`}
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.75"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="w-4.5 h-4.5"
        >
          {/* Architectural minimal shield outline */}
          <path d="M12 3L4 7V12C4 16.5 7.5 20.2 12 21.5C16.5 20.2 20 16.5 20 12V7L12 3Z" />
        </svg>

        {/* Live center pulse dot */}
        <span
          className={`absolute w-1.5 h-1.5 rounded-full ${
            isArmed ? 'bg-rose-500 animate-ping' : 'bg-cyan-400'
          }`}
        />
      </div>

      <div className="flex flex-col text-left leading-none">
        <span className="font-tactical font-bold text-lg tracking-wider text-white">
          SURAKSHA
        </span>
        <span className="text-[9px] font-mono tracking-widest text-slate-400 mt-0.5">
          PERSONAL SAFETY CONSOLE
        </span>
      </div>
    </div>
  );
}
