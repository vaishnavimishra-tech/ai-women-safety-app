import React, { useRef, useEffect } from 'react';
import { useSecurity } from '../../context/SecurityContext';

export default function ParticleBackground() {
  const canvasRef = useRef(null);
  const { armedState } = useSecurity();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animationFrameId;

    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const isArmed = armedState === 'ARMED';
    const primaryColor = isArmed ? 'rgba(255, 23, 68, ' : 'rgba(0, 229, 255, ';
    const secondaryColor = isArmed ? 'rgba(255, 160, 0, ' : 'rgba(124, 77, 255, ';

    const isMobile = width < 768;
    const particleCount = isMobile ? 40 : 85;

    // Volumetric 3D drifting dust
    const particles = Array.from({ length: particleCount }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      z: Math.random() * 2 + 0.5,
      vx: (Math.random() - 0.5) * 0.3,
      vy: (Math.random() - 0.5) * 0.3 - 0.1,
      radius: Math.random() * 1.6 + 0.6,
      alpha: Math.random() * 0.45 + 0.15,
      color: Math.random() > 0.3 ? primaryColor : secondaryColor
    }));

    let gridOffset = 0;

    const handleResize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      // --- 1. PERSPECTIVE CYBER GRID FLOOR ---
      const horizonY = height * 0.55;
      const fov = 300;

      // Horizon glow
      const horizonGradient = ctx.createLinearGradient(0, horizonY - 40, 0, horizonY + 80);
      horizonGradient.addColorStop(0, 'rgba(0, 0, 0, 0)');
      horizonGradient.addColorStop(0.3, `${primaryColor}0.04)`);
      horizonGradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = horizonGradient;
      ctx.fillRect(0, horizonY - 40, width, 120);

      // Perspective Lines radiating from vanishing point
      ctx.lineWidth = 1;
      const numLines = isMobile ? 14 : 26;
      const centerX = width * 0.5;

      for (let i = -numLines; i <= numLines; i++) {
        const xBottom = centerX + i * (width / numLines) * 1.5;
        const lineGrad = ctx.createLinearGradient(centerX, horizonY, xBottom, height);
        lineGrad.addColorStop(0, `${primaryColor}0)`);
        lineGrad.addColorStop(0.5, `${primaryColor}0.035)`);
        lineGrad.addColorStop(1, `${primaryColor}0.01)`);
        ctx.strokeStyle = lineGrad;

        ctx.beginPath();
        ctx.moveTo(centerX, horizonY);
        ctx.lineTo(xBottom, height);
        ctx.stroke();
      }

      // Moving Horizontal Depth Lines (Grid scroll simulation)
      gridOffset = (gridOffset + 0.35) % 40;
      for (let d = 15; d < height - horizonY; d += 35) {
        const y = horizonY + Math.pow(d / (height - horizonY), 1.8) * (height - horizonY);
        const depthAlpha = Math.min(0.045, (d / (height - horizonY)) * 0.05);
        ctx.strokeStyle = `${primaryColor}${depthAlpha})`;

        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }

      // --- 2. CONNECTING CONSTELLATION LINES ---
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 100) {
            const lineAlpha = (1 - dist / 100) * 0.12;
            ctx.strokeStyle = `${primaryColor}${lineAlpha})`;
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.stroke();
          }
        }
      }

      // --- 3. 3D DRIFTING VOLUMETRIC PARTICLES ---
      particles.forEach((p) => {
        p.x += p.vx * p.z;
        p.y += p.vy * p.z;

        if (p.x < 0) p.x = width;
        if (p.x > width) p.x = 0;
        if (p.y < 0) p.y = height;
        if (p.y > height) p.y = 0;

        ctx.fillStyle = `${p.color}${p.alpha})`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius * p.z, 0, Math.PI * 2);
        ctx.fill();
      });

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, [armedState]);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-0 opacity-80"
    />
  );
}
