import React from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import {
  ShieldAlert,
  Radar,
  Radio,
  Users,
  Mic,
  Lock,
  Zap,
  Activity,
  ChevronRight,
  ShieldCheck,
  Compass,
  PhoneCall,
  Bell,
  Navigation,
  CheckCircle2,
  HardDrive
} from 'lucide-react';
import { useSecurity } from '../context/SecurityContext';
import TacticalShieldCanvas from '../components/3d/TacticalShieldCanvas';
import GlassCard from '../components/common/GlassCard';
import TacticalButton from '../components/common/TacticalButton';
import TelemetryText from '../components/common/TelemetryText';

export default function LandingHeroPage() {
  const { setActiveTab, telemetry, armedState, guardians } = useSecurity();
  const { scrollYProgress } = useScroll();

  // HUD Camera Pull-back Motion on 3D Centerpiece
  const hero3dScale = useTransform(scrollYProgress, [0, 0.25], [1, 0.76]);
  const hero3dOpacity = useTransform(scrollYProgress, [0, 0.22, 0.45], [1, 0.9, 0.35]);
  const hero3dY = useTransform(scrollYProgress, [0, 0.25], [0, 45]);
  const hero3dRotate = useTransform(scrollYProgress, [0, 0.25], [0, -3]);

  const isArmed = armedState === 'ARMED';

  const telemetryStats = [
    { label: "DISPATCH LATENCY", value: "1.2", unit: "SEC", variant: "rose" },
    { label: "SHAKE DETECTION", value: "3X SHAKE", unit: "ACTIVE", variant: "rose" },
    { label: "GUARDIAN MESH", value: `${guardians.length}`, unit: "CONNECTED", variant: "lavender" },
    { label: "PROTECTION STATE", value: isArmed ? "ALERT" : "SAFE", unit: "", variant: isArmed ? "red" : "green" }
  ];

  const howItWorksSteps = [
    {
      step: "01",
      title: "Activate",
      subtitle: "Hold or 3x Shake",
      desc: "Trigger emergency dispatch by vigorously shaking your phone 3 times, a 2.2-second press-and-hold, or hands-free voice hotwords.",
      icon: ShieldAlert,
      color: "text-rose-400 border-rose-500/30 bg-rose-950/20"
    },
    {
      step: "02",
      title: "Sound & Signal",
      subtitle: "Local Audio & GPS",
      desc: "Synthesizes high-decibel audible emergency sirens through the Web Audio API and generates real-time GPS coordinate packets.",
      icon: Bell,
      color: "text-amber-400 border-amber-500/30 bg-amber-950/20"
    },
    {
      step: "03",
      title: "Connect",
      subtitle: "Offline Guardian Relay",
      desc: "Generates direct SMS & WhatsApp emergency dispatch packets with live coordinates for your trusted mesh contacts.",
      icon: Users,
      color: "text-indigo-400 border-indigo-500/30 bg-indigo-950/20"
    },
    {
      step: "04",
      title: "Navigate",
      subtitle: "Safe Haven Guidance",
      desc: "Engages continuous 360° radar sweep, mapping nearby 24/7 police booths and high-illumination safe corridors.",
      icon: Navigation,
      color: "text-emerald-400 border-emerald-500/30 bg-emerald-950/20"
    }
  ];

  const tacticalModules = [
    {
      id: "sos",
      title: "Tactical SOS Hub",
      code: "MODULE-01",
      desc: "Instant high-tension 2.2s press-and-hold trigger with multi-agency emergency dispatch and false-duress PIN keypad.",
      icon: ShieldAlert,
      badge: "MISSION CRITICAL",
      color: "danger"
    },
    {
      id: "radar",
      title: "Sonar Radar & Safe Corridor",
      code: "MODULE-02",
      desc: "Continuous 360° rotating radar sweep mapping nearby 24/7 police booths, pink patrols, and high-illumination safe havens.",
      icon: Radar,
      badge: "LIVE TELEMETRY",
      color: "rose"
    },
    {
      id: "network",
      title: "Guardian Orbital Mesh",
      code: "MODULE-03",
      desc: "Offline-first emergency contact network with real-time heartbeat pings, battery tracking, and SMS/WhatsApp broadcast relay.",
      icon: Users,
      badge: "MESH ACTIVE",
      color: "violet"
    },
    {
      id: "voice",
      title: "Acoustic Hotword AI",
      code: "MODULE-04",
      desc: "Zero-touch voice detection listening for trigger phrases ('HELP', 'SURAKSHA', 'BACHAO') with real-time decibel analysis.",
      icon: Mic,
      badge: "NEURAL LISTEN",
      color: "rose"
    },
    {
      id: "toolkit",
      title: "Safety Toolkit",
      code: "MODULE-05",
      desc: "Decoy fake incoming call simulator with realistic audio, AI safe-route navigator, and speed-dial emergency dispatch array.",
      icon: PhoneCall,
      badge: "UTILITY SUITE",
      color: "safe"
    },
    {
      id: "logs",
      title: "Tamper-Proof Audit Trail",
      code: "MODULE-06",
      desc: "Immutable incident log feed with simulated SHA-256 cryptographic hashes and exportable formal police documentation.",
      icon: Activity,
      badge: "ENCRYPTED LOGS",
      color: "rose"
    }
  ];

  // Motion reveal variants for staggered grids
  const staggerContainerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.12,
        delayChildren: 0.05
      }
    }
  };

  const cardRevealVariants = {
    hidden: { opacity: 0, y: 22, scale: 0.95 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: { duration: 0.45, ease: [0.16, 1, 0.3, 1] }
    }
  };

  const handleScrollToHowItWorks = () => {
    const el = document.getElementById('how-it-works');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleNavigateToSos = () => {
    setActiveTab('sos');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="relative min-h-screen pb-40 pt-4 px-4 max-w-7xl mx-auto flex flex-col gap-16">
      {/* Tactical Scroll-Linked HUD Progress Line */}
      <div className="fixed top-0 right-0 h-full w-[3px] bg-white/5 pointer-events-none z-50">
        <motion.div
          style={{ scaleY: scrollYProgress }}
          className="w-full h-full origin-top bg-gradient-to-b from-rose-400 via-rose-300 to-indigo-400 shadow-[0_0_12px_rgba(244,63,94,0.6)]"
        />
      </div>

      {/* 1. HERO SECTION */}
      <section className="relative min-h-[75vh] flex flex-col lg:flex-row items-center justify-between gap-8 sm:gap-12">
        {/* Left Hero Briefing */}
        <div className="flex-1 flex flex-col gap-5 z-10 text-left">
          {/* Badge: Grounded & Professional */}
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-rose-950/40 border border-rose-500/30 w-fit">
            <span className="w-2 h-2 rounded-full bg-rose-400 animate-ping" />
            <span className="text-xs font-mono font-semibold tracking-widest text-rose-300 uppercase">
              AI-POWERED PERSONAL SAFETY
            </span>
          </div>

          {/* Headline: Solid clean accent */}
          <h1 className="font-sans font-extrabold text-4xl sm:text-5xl lg:text-6xl tracking-tight text-white leading-none">
            UNCOMPROMISED <br />
            <span className="text-rose-400">
              PROTECTION.
            </span>
            <br />
            ZERO AMBIGUITY.
          </h1>

          {/* Architecture description */}
          <p className="text-slate-300 text-sm sm:text-base md:text-lg max-w-xl font-normal leading-relaxed">
            Suraksha is an offline-first personal safety console. Features real-time GPS telemetry broadcast, browser-native emergency audio alarms, Web Speech API hotword detection, and direct SMS/WhatsApp emergency dispatch without requiring an account or cloud dependency.
          </p>

          {/* Local-First Trust Indicator */}
          <div className="inline-flex items-center gap-2 py-1 px-3 rounded-lg bg-emerald-950/30 border border-emerald-500/30 text-emerald-300 text-xs font-mono w-fit">
            <HardDrive className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            <span>100% Local-First — No Data Leaves Your Device • Works Fully Offline</span>
          </div>

          {/* Primary Action Buttons */}
          <div className="flex flex-wrap items-center gap-4 pt-1">
            <TacticalButton
              size="lg"
              variant="danger"
              icon={ShieldAlert}
              onClick={handleNavigateToSos}
              className="text-base shadow-lg shadow-rose-900/30"
            >
              INITIALIZE SOS HUB
            </TacticalButton>

            <TacticalButton
              size="lg"
              variant="outline"
              icon={Compass}
              onClick={handleScrollToHowItWorks}
            >
              SEE HOW IT WORKS
            </TacticalButton>
          </div>

          {/* Telemetry Quick Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-5 border-t border-rose-500/20">
            {telemetryStats.map((stat, i) => (
              <TelemetryText
                key={i}
                label={stat.label}
                value={stat.value}
                unit={stat.unit}
                variant={stat.variant}
              />
            ))}
          </div>
        </div>

        {/* Right Centerpiece: High-Production 3D Shield Canvas */}
        <motion.div
          style={{
            scale: hero3dScale,
            opacity: hero3dOpacity,
            y: hero3dY,
            rotate: hero3dRotate
          }}
          className="flex-1 w-full h-[280px] sm:h-[360px] lg:h-[440px] max-h-[50vh] relative flex items-center justify-center pointer-events-auto"
        >
          <TacticalShieldCanvas className="w-full h-full" />
        </motion.div>
      </section>

      {/* 2. HOW IT WORKS / 4-STEP STAGGERED REVEAL */}
      <section id="how-it-works" className="flex flex-col gap-8 scroll-mt-20">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-rose-500/20 pb-4">
          <div>
            <span className="text-xs font-mono uppercase tracking-widest text-rose-400">
              OPERATIONAL PROTOCOL
            </span>
            <h2 className="font-tactical font-bold text-3xl md:text-4xl text-white tracking-wide mt-1">
              HOW SURAKSHA WORKS
            </h2>
          </div>
          <p className="text-xs font-mono text-slate-400 max-w-sm">
            Four rapid, failsafe stages designed to operate instantly during high-stress scenarios.
          </p>
        </div>

        <motion.div
          variants={staggerContainerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.15 }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
        >
          {howItWorksSteps.map((s, idx) => {
            const Icon = s.icon;
            return (
              <motion.div key={idx} variants={cardRevealVariants} className="h-full">
                <GlassCard
                  variant="rose"
                  className="p-5 flex flex-col justify-between relative group h-full"
                >
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <div className={`p-2.5 rounded-lg border ${s.color}`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <span className="font-mono text-lg font-bold text-slate-500 group-hover:text-rose-400 transition-colors">
                        {s.step}
                      </span>
                    </div>

                    <h3 className="font-tactical font-bold text-xl text-white mb-0.5">
                      {s.title}
                    </h3>
                    <span className="text-[11px] font-mono text-rose-400 block mb-2 font-semibold">
                      {s.subtitle}
                    </span>
                    <p className="text-xs text-slate-300 leading-relaxed font-sans">
                      {s.desc}
                    </p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-white/10 flex items-center gap-1 text-[11px] font-mono text-slate-400">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span>Verified Browser-Native</span>
                  </div>
                </GlassCard>
              </motion.div>
            );
          })}
        </motion.div>
      </section>

      {/* 3. COMMAND MATRIX CAPABILITIES / STAGGERED REVEAL */}
      <section className="flex flex-col gap-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-rose-500/20 pb-4">
          <div>
            <span className="text-xs font-mono uppercase tracking-widest text-rose-400">
              CONSOLE SUBSYSTEMS
            </span>
            <h2 className="font-tactical font-bold text-3xl md:text-4xl text-white tracking-wide mt-1">
              COMMAND MATRIX CAPABILITIES
            </h2>
          </div>
          <p className="text-xs font-mono text-slate-400 max-w-sm">
            Access any module directly from this console or via the bottom navigation dock.
          </p>
        </div>

        {/* Feature Cards Grid with Staggered Reveal */}
        <motion.div
          variants={staggerContainerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.15 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5"
        >
          {tacticalModules.map((module) => {
            const Icon = module.icon;
            return (
              <motion.div key={module.id} variants={cardRevealVariants} className="h-full">
                <GlassCard
                  variant={module.color}
                  interactive={true}
                  onClick={() => {
                    setActiveTab(module.id);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="p-6 flex flex-col justify-between group h-full"
                >
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <div className="p-2.5 rounded-lg bg-white/5 border border-white/10 group-hover:border-rose-400/50 transition-colors">
                        <Icon className="w-5 h-5 text-rose-300 group-hover:text-rose-200" />
                      </div>
                      <span className="text-[10px] font-mono tracking-widest text-slate-400 px-2 py-0.5 rounded bg-black/40 border border-white/5">
                        {module.code}
                      </span>
                    </div>

                    <h3 className="font-tactical font-bold text-xl text-white mb-2 tracking-wide group-hover:text-rose-300 transition-colors">
                      {module.title}
                    </h3>
                    <p className="text-xs text-slate-300/90 leading-relaxed font-sans">
                      {module.desc}
                    </p>
                  </div>

                  <div className="mt-6 pt-4 border-t border-white/10 flex items-center justify-between text-xs font-mono text-rose-400">
                    <span className="text-[10px] tracking-widest text-slate-400">
                      {module.badge}
                    </span>
                    <div className="flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                      <span>OPEN</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </div>
                  </div>
                </GlassCard>
              </motion.div>
            );
          })}
        </motion.div>
      </section>

      {/* 4. TRUST & ARCHITECTURAL CREDIBILITY */}
      <motion.section
        initial={{ opacity: 0, y: 24, scale: 0.98 }}
        whileInView={{ opacity: 1, y: 0, scale: 1 }}
        viewport={{ once: true, amount: 0.2 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="rounded-2xl bg-gradient-to-r from-[#140b10] via-[#1a0f18] to-[#120b16] border border-rose-500/25 p-8 md:p-12 relative overflow-hidden shadow-2xl"
      >
        <div className="absolute -right-20 -bottom-20 w-80 h-80 bg-rose-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-8">
          <div className="space-y-4 max-w-2xl">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-emerald-400" />
              <span className="text-xs font-mono uppercase tracking-widest text-emerald-400">
                OFFLINE-FIRST PRIVACY ARCHITECTURE
              </span>
            </div>
            <h3 className="font-tactical font-bold text-2xl md:text-3xl text-white">
              DIRECT EMERGENCY LINKAGE WITHOUT CLOUD BOTTLENECK
            </h3>
            <p className="text-sm text-slate-300 font-sans leading-relaxed">
              Suraksha executes entirely on your device using browser APIs (Geolocation, Web Audio, Web Speech, and localStorage). No sign-up, no passwords, and zero tracking cookies. Links directly with national emergency numbers (112, 1091, 1930) and your chosen guardian mesh.
            </p>
          </div>

          <div className="shrink-0 flex flex-col sm:flex-row gap-4">
            <TacticalButton
              size="lg"
              variant="rose"
              icon={Compass}
              onClick={() => {
                setActiveTab('toolkit');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
            >
              EXPLORE TOOLKIT
            </TacticalButton>
            <TacticalButton
              size="lg"
              variant="safe"
              icon={Zap}
              onClick={() => {
                setActiveTab('network');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
            >
              SYNC GUARDIANS
            </TacticalButton>
          </div>
        </div>
      </motion.section>
    </div>
  );
}
