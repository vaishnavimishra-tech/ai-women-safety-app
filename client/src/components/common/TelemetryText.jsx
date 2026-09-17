import React, { useState, useEffect, useRef } from 'react';

export default function TelemetryText({
  label,
  value,
  unit = "",
  variant = "cyan", // 'cyan' | 'red' | 'green' | 'amber'
  className = ""
}) {
  const [displayValue, setDisplayValue] = useState(value);
  const elementRef = useRef(null);
  const hasAnimated = useRef(false);

  useEffect(() => {
    // Check if value is numeric (e.g. "1.2", "99.98%", "4", 84)
    const match = String(value).match(/^([0-9.]+)(.*)$/);
    if (!match) {
      setDisplayValue(value);
      return;
    }

    const targetNum = parseFloat(match[1]);
    const suffix = match[2] || "";
    const isFloat = match[1].includes('.');
    const decimals = isFloat ? match[1].split('.')[1].length : 0;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !hasAnimated.current) {
          hasAnimated.current = true;
          const duration = 1200; // 1.2s animation
          const startTime = performance.now();

          const step = (currentTime) => {
            const progress = Math.min((currentTime - startTime) / duration, 1);
            // Ease-out cubic
            const easeProgress = 1 - Math.pow(1 - progress, 3);
            const currentVal = easeProgress * targetNum;
            setDisplayValue(currentVal.toFixed(decimals) + suffix);

            if (progress < 1) {
              requestAnimationFrame(step);
            } else {
              setDisplayValue(value);
            }
          };

          requestAnimationFrame(step);
        }
      },
      { threshold: 0.1 }
    );

    if (elementRef.current) {
      observer.observe(elementRef.current);
    }

    return () => observer.disconnect();
  }, [value]);

  const colorClasses = {
    cyan: "text-cyan-400 text-glow-cyan",
    red: "text-rose-400 text-glow-red",
    green: "text-emerald-400 text-glow-emerald",
    amber: "text-amber-400"
  }[variant] || "text-cyan-400";

  return (
    <div ref={elementRef} className={`flex flex-col font-mono select-none ${className}`}>
      <span className="text-[10px] uppercase tracking-widest text-slate-400/80 mb-0.5">
        {label}
      </span>
      <span className={`text-sm md:text-base font-bold tracking-wider ${colorClasses}`}>
        {displayValue}
        {unit && <span className="text-xs ml-1 font-normal opacity-75">{unit}</span>}
      </span>
    </div>
  );
}
