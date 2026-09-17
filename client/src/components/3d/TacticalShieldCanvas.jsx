import React, { useRef, useEffect, useState } from 'react';
import * as THREE from 'three';
import { useSecurity } from '../../context/SecurityContext';
import { tacticalAudio } from '../../services/audioService';

// Lightweight 2D/SVG animated fallback for mobile (< 768px) to protect battery and 60fps
function MobileShieldFallback({ isArmed }) {
  return (
    <div className="relative w-full h-full flex items-center justify-center select-none">
      {/* Concentric pulsing rings */}
      <div
        className={`absolute w-52 h-52 rounded-full border-2 transition-colors duration-500 animate-pulse ${
          isArmed ? 'border-rose-500/40 bg-rose-950/20' : 'border-cyan-400/30 bg-cyan-950/20'
        }`}
      />
      <div
        className={`absolute w-40 h-40 rounded-full border border-dashed animate-spin ${
          isArmed ? 'border-rose-400/50' : 'border-cyan-300/40'
        }`}
        style={{ animationDuration: '14s' }}
      />
      <div
        className={`absolute w-28 h-28 rounded-full border ${
          isArmed ? 'border-rose-500/60' : 'border-purple-400/40'
        } animate-ping`}
        style={{ animationDuration: '3s' }}
      />

      {/* Center glowing faceted SVG shield mark */}
      <div
        className={`relative w-20 h-20 rounded-2xl flex items-center justify-center border shadow-2xl transition-all ${
          isArmed
            ? 'bg-rose-600/30 border-rose-400 shadow-[0_0_30px_rgba(255,23,68,0.6)] text-rose-300'
            : 'bg-cyan-500/20 border-cyan-300 shadow-[0_0_30px_rgba(0,229,255,0.5)] text-cyan-300'
        }`}
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" className="w-10 h-10">
          <path d="M12 2L4 6V12C4 17 7.5 21 12 22C16.5 21 20 17 20 12V6L12 2Z" />
          <circle cx="12" cy="12" r="3" fill="currentColor" className="animate-pulse" />
        </svg>
      </div>

      <div className="absolute bottom-3 text-[9px] font-mono tracking-widest text-cyan-400/60 uppercase">
        MOBILE PERFORMANCE MODE // ACTIVE
      </div>
    </div>
  );
}

export default function TacticalShieldCanvas({ className = "w-full h-full" }) {
  const mountRef = useRef(null);
  const { armedState } = useSecurity();
  const [isMobile, setIsMobile] = useState(() => (typeof window !== 'undefined' ? window.innerWidth < 768 : false));
  const shockwaveTriggerRef = useRef(null);

  const isArmed = armedState === 'ARMED';

  useEffect(() => {
    const handleResizeCheck = () => {
      setIsMobile(window.innerWidth < 768);
    };
    window.addEventListener('resize', handleResizeCheck);
    return () => window.removeEventListener('resize', handleResizeCheck);
  }, []);

  useEffect(() => {
    if (isMobile) return;
    const mount = mountRef.current;
    if (!mount) return;

    const width = mount.clientWidth || 400;
    const height = mount.clientHeight || 400;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(42, width / height, 0.1, 1000);
    camera.position.z = 5.2;

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: "high-performance"
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    mount.appendChild(renderer.domElement);

    // Color definitions
    const primaryColor = isArmed ? 0xff1744 : 0x00e5ff;
    const secondaryColor = isArmed ? 0xff5252 : 0x7c4dff;
    const accentColor = isArmed ? 0xffa000 : 0x00e676;

    // Master Group (Subject to idle bob & cursor parallax)
    const masterGroup = new THREE.Group();
    scene.add(masterGroup);

    // --- 1. CORE MULTI-LAYER COMPOSITION ---
    const coreGroup = new THREE.Group();
    masterGroup.add(coreGroup);

    // Layer 1A: Inner Solid-Glow Crystalline Core (MeshPhysicalMaterial with Fresnel edge glow)
    const innerCrystalGeo = new THREE.OctahedronGeometry(0.8, 0);
    const innerCrystalMat = new THREE.MeshPhysicalMaterial({
      color: primaryColor,
      emissive: primaryColor,
      emissiveIntensity: 0.55,
      roughness: 0.12,
      metalness: 0.2,
      transmission: 0.55,
      ior: 1.5,
      clearcoat: 1.0,
      clearcoatRoughness: 0.1,
      transparent: true,
      opacity: 0.85
    });
    const innerCrystal = new THREE.Mesh(innerCrystalGeo, innerCrystalMat);
    coreGroup.add(innerCrystal);

    // Layer 1B: High-Refraction Mid-Layer Geodesic Lattice
    const midLatticeGeo = new THREE.IcosahedronGeometry(1.22, 1);
    const midLatticeMat = new THREE.MeshStandardMaterial({
      color: primaryColor,
      metalness: 0.95,
      roughness: 0.05,
      wireframe: true,
      transparent: true,
      opacity: 0.9
    });
    const midLattice = new THREE.Mesh(midLatticeGeo, midLatticeMat);
    coreGroup.add(midLattice);

    // Layer 1C: Outer Hexagonal Defense Canopy
    const hexCanopyGeo = new THREE.IcosahedronGeometry(1.62, 2);
    const hexCanopyMat = new THREE.MeshBasicMaterial({
      color: secondaryColor,
      wireframe: true,
      transparent: true,
      opacity: 0.22
    });
    const hexCanopy = new THREE.Mesh(hexCanopyGeo, hexCanopyMat);
    coreGroup.add(hexCanopy);

    // Deep luminous core center point
    const deepCoreGeo = new THREE.SphereGeometry(0.28, 16, 16);
    const deepCoreMat = new THREE.MeshBasicMaterial({
      color: isArmed ? 0xff3355 : 0xffffff
    });
    const deepCore = new THREE.Mesh(deepCoreGeo, deepCoreMat);
    coreGroup.add(deepCore);

    // --- 2. PHYSICALLY PLAUSIBLE ORBITAL RINGS (Elliptical tilt, variable speed) ---
    const ringGroup = new THREE.Group();
    masterGroup.add(ringGroup);

    // Ring 1 (Titanium Gimbal with laser tick marks)
    const ring1Geo = new THREE.TorusGeometry(1.98, 0.022, 16, 120);
    const ring1Mat = new THREE.MeshStandardMaterial({
      color: primaryColor,
      metalness: 0.92,
      roughness: 0.1,
      emissive: isArmed ? 0x660011 : 0x002244,
      emissiveIntensity: 0.4
    });
    const ring1 = new THREE.Mesh(ring1Geo, ring1Mat);
    ring1.rotation.x = Math.PI / 3.2;
    ringGroup.add(ring1);

    // Ring 2 (Counter-precessing inclined ring)
    const ring2Geo = new THREE.TorusGeometry(2.32, 0.016, 16, 120);
    const ring2Mat = new THREE.MeshStandardMaterial({
      color: secondaryColor,
      metalness: 0.9,
      roughness: 0.1,
      emissive: 0x220044,
      emissiveIntensity: 0.35
    });
    const ring2 = new THREE.Mesh(ring2Geo, ring2Mat);
    ring2.rotation.y = Math.PI / 3.8;
    ring2.rotation.z = Math.PI / 6;
    ringGroup.add(ring2);

    // Ring 3 (Outer precision telemetry rim)
    const ring3Geo = new THREE.TorusGeometry(2.65, 0.01, 16, 120);
    const ring3Mat = new THREE.MeshBasicMaterial({
      color: accentColor,
      transparent: true,
      opacity: 0.4
    });
    const ring3 = new THREE.Mesh(ring3Geo, ring3Mat);
    ring3.rotation.x = -Math.PI / 4;
    ringGroup.add(ring3);

    // --- 3. ORBITING SATELLITE NODES & LASER LINK ARCS ---
    const satGroup = new THREE.Group();
    masterGroup.add(satGroup);

    const satCount = 6;
    const satellites = [];
    const laserArcs = [];
    const satGeo = new THREE.OctahedronGeometry(0.08, 0);
    const satMat = new THREE.MeshBasicMaterial({ color: primaryColor });

    for (let i = 0; i < satCount; i++) {
      const sat = new THREE.Mesh(satGeo, satMat);
      satGroup.add(sat);
      satellites.push({
        mesh: sat,
        angle: (i / satCount) * Math.PI * 2,
        speed: 0.35 + (i % 2) * 0.2,
        radius: 2.1 + (i % 3) * 0.25,
        tilt: (i % 2 === 0 ? 1 : -1) * (Math.PI / 4)
      });

      // Laser Line
      const lineMat = new THREE.LineBasicMaterial({
        color: i % 2 === 0 ? primaryColor : secondaryColor,
        transparent: true,
        opacity: 0.3
      });
      const lineGeo = new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(0, 0, 0),
        new THREE.Vector3(0, 0, 0)
      ]);
      const line = new THREE.Line(lineGeo, lineMat);
      satGroup.add(line);
      laserArcs.push(line);
    }

    // --- 4. BACKGROUND DEPTH PARTICLES (300 Points with Depth Separation) ---
    const depthParticleCount = 320;
    const depthPositions = new Float32Array(depthParticleCount * 3);
    const depthColors = new Float32Array(depthParticleCount * 3);
    const colorA = new THREE.Color(primaryColor);
    const colorB = new THREE.Color(secondaryColor);

    for (let i = 0; i < depthParticleCount; i++) {
      const idx = i * 3;
      // Drifting behind main core
      depthPositions[idx] = (Math.random() - 0.5) * 8;
      depthPositions[idx + 1] = (Math.random() - 0.5) * 6;
      depthPositions[idx + 2] = -1.5 - Math.random() * 4.5; // Z depth separation

      const col = Math.random() > 0.4 ? colorA : colorB;
      depthColors[idx] = col.r;
      depthColors[idx + 1] = col.g;
      depthColors[idx + 2] = col.b;
    }

    const depthParticleGeo = new THREE.BufferGeometry();
    depthParticleGeo.setAttribute('position', new THREE.BufferAttribute(depthPositions, 3));
    depthParticleGeo.setAttribute('color', new THREE.BufferAttribute(depthColors, 3));

    const depthParticleMat = new THREE.PointsMaterial({
      size: 0.035,
      vertexColors: true,
      transparent: true,
      opacity: 0.65
    });
    const depthParticles = new THREE.Points(depthParticleGeo, depthParticleMat);
    scene.add(depthParticles);

    // --- 5. INTERACTIVE CLICK SHOCKWAVE PULSE ---
    const shockwaveGeo = new THREE.RingGeometry(0.1, 0.16, 64);
    const shockwaveMat = new THREE.MeshBasicMaterial({
      color: primaryColor,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0
    });
    const shockwaveMesh = new THREE.Mesh(shockwaveGeo, shockwaveMat);
    masterGroup.add(shockwaveMesh);

    let shockwaveScale = 0;
    let shockwaveActive = false;

    shockwaveTriggerRef.current = () => {
      shockwaveScale = 0.1;
      shockwaveActive = true;
      shockwaveMat.opacity = 0.9;
      tacticalAudio.playClick();
    };

    // --- 6. DYNAMIC MOVING ORBITING LIGHTS ---
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
    scene.add(ambientLight);

    // Moving Key Light (Cyan)
    const movingLightCyan = new THREE.PointLight(primaryColor, 3.2, 18);
    scene.add(movingLightCyan);

    // Moving Fill Light (Violet)
    const movingLightViolet = new THREE.PointLight(secondaryColor, 2.6, 16);
    scene.add(movingLightViolet);

    // Subtle Fixed Rim Light
    const rimLight = new THREE.PointLight(0xffffff, 1.2, 10);
    rimLight.position.set(0, 4, 3);
    scene.add(rimLight);

    // --- 7. MOUSE PARALLAX TRACKING ---
    let targetX = 0;
    let targetY = 0;
    const handleMouseMove = (e) => {
      const rect = mount.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const y = -(((e.clientY - rect.top) / rect.height) * 2 - 1);
      targetX = x * 0.35; // gentle tilt (few degrees max)
      targetY = y * 0.35;
    };
    window.addEventListener('mousemove', handleMouseMove);

    // --- 8. ANIMATION LOOP ---
    let animationFrameId;
    const startTime = performance.now();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const elapsed = (performance.now() - startTime) * 0.001;

      // 1. Continuous Idle Motion: Vertical floating bob + smooth rotation
      const idleBob = Math.sin(elapsed * 1.5) * 0.1;
      masterGroup.position.y = idleBob;

      // Core rotations
      innerCrystal.rotation.x = elapsed * 0.35;
      innerCrystal.rotation.y = elapsed * 0.45;
      midLattice.rotation.x = -elapsed * 0.25;
      midLattice.rotation.y = elapsed * 0.3;
      hexCanopy.rotation.z = elapsed * 0.15;
      hexCanopy.rotation.y = -elapsed * 0.2;

      // 2. Gimbal Rings with elliptical precession
      ring1.rotation.z = elapsed * 0.32;
      ring1.rotation.y = Math.sin(elapsed * 0.4) * 0.15;

      ring2.rotation.x = -elapsed * 0.26;
      ring2.rotation.z = Math.cos(elapsed * 0.3) * 0.15;

      ring3.rotation.y = elapsed * 0.18;

      // 3. Orbiting Satellites and Laser Arcs
      satellites.forEach((sat, i) => {
        const curAngle = sat.angle + elapsed * sat.speed;
        const x = Math.cos(curAngle) * sat.radius;
        const y = Math.sin(curAngle) * sat.radius * Math.cos(sat.tilt);
        const z = Math.sin(curAngle) * sat.radius * Math.sin(sat.tilt);

        sat.mesh.position.set(x, y, z);
        sat.mesh.rotation.y = elapsed * 2;

        const positions = laserArcs[i].geometry.attributes.position.array;
        positions[0] = 0;
        positions[1] = 0;
        positions[2] = 0;
        positions[3] = x;
        positions[4] = y;
        positions[5] = z;
        laserArcs[i].geometry.attributes.position.needsUpdate = true;
      });

      // 4. Moving Point Lights (3D Lissajous orbit paths)
      movingLightCyan.position.set(
        Math.cos(elapsed * 0.75) * 4.2,
        Math.sin(elapsed * 0.55) * 3.0,
        Math.sin(elapsed * 0.75) * 4.2
      );
      movingLightViolet.position.set(
        Math.cos(-elapsed * 0.65) * 3.8,
        Math.sin(-elapsed * 0.45) * 3.5,
        Math.cos(elapsed * 0.65) * 3.8
      );

      // 5. Background Depth Particles slow drift
      depthParticles.rotation.y = elapsed * 0.03;

      // 6. Shockwave Ring
      if (shockwaveActive) {
        shockwaveScale += 0.12;
        shockwaveMesh.scale.set(shockwaveScale, shockwaveScale, shockwaveScale);
        shockwaveMat.opacity = Math.max(0, 0.9 - shockwaveScale * 0.22);
        if (shockwaveScale > 4.2) {
          shockwaveActive = false;
          shockwaveMat.opacity = 0;
        }
      }

      // 7. Mouse Parallax with smooth spring damping
      masterGroup.rotation.y += (targetX - masterGroup.rotation.y) * 0.05;
      masterGroup.rotation.x += (-targetY - masterGroup.rotation.x) * 0.05;

      renderer.render(scene, camera);
    };

    animate();

    const handleResize = () => {
      if (!mount) return;
      const newW = mount.clientWidth;
      const newH = mount.clientHeight;
      camera.aspect = newW / newH;
      camera.updateProjectionMatrix();
      renderer.setSize(newW, newH);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
      if (mount && renderer.domElement) {
        mount.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, [isArmed, isMobile]);

  const handleCanvasClick = () => {
    if (shockwaveTriggerRef.current) {
      shockwaveTriggerRef.current();
    }
  };

  if (isMobile) {
    return (
      <div className={`relative flex items-center justify-center overflow-hidden rounded-2xl ${className}`}>
        <MobileShieldFallback isArmed={isArmed} />
      </div>
    );
  }

  return (
    <div
      onClick={handleCanvasClick}
      className={`relative flex items-center justify-center overflow-hidden rounded-2xl cursor-pointer group select-none ${className}`}
    >
      <div ref={mountRef} className="w-full h-full" />

      {/* Decorative HUD Crosshairs */}
      <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
        <div className="w-56 h-56 border border-cyan-500/15 rounded-full animate-pulse group-hover:border-cyan-400/30 transition-colors" />
        <div className="absolute w-72 h-72 border border-dashed border-cyan-500/20 rounded-full" />
      </div>

      {/* Real-Time Hardware Telemetry Tag */}
      <div className="absolute top-3 left-3 pointer-events-none flex flex-col gap-0.5 text-[9px] font-mono tracking-widest text-cyan-400/70">
        <div className="flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" />
          <span>GL ENGINE // 60 FPS</span>
        </div>
        <span className="text-slate-400 text-[8px]">PHYSICAL SHIELD • HW-ACCEL</span>
      </div>

      {/* Tap-to-Pulse Prompt */}
      <div className="absolute top-3 right-3 pointer-events-none text-[9px] font-mono text-cyan-300/80 bg-black/50 px-2 py-0.5 rounded border border-cyan-500/20">
        CLICK TO EMIT PULSE
      </div>
    </div>
  );
}
