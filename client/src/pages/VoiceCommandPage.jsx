import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Mic,
  MicOff,
  Volume2,
  AlertTriangle,
  Radio,
  Sparkles,
  CheckCircle,
  XCircle,
  Activity,
  Zap
} from 'lucide-react';
import { useSecurity } from '../context/SecurityContext';
import { speechService, TRIGGER_WORDS } from '../services/speechService';
import { tacticalAudio } from '../services/audioService';
import GlassCard from '../components/common/GlassCard';
import TacticalButton from '../components/common/TacticalButton';
import TelemetryText from '../components/common/TelemetryText';
import StatusBadge from '../components/common/StatusBadge';

export default function VoiceCommandPage() {
  const {
    armSos,
    logEvent,
    isHotwordListening,
    setIsHotwordListening
  } = useSecurity();

  const [transcript, setTranscript] = useState('');
  const [noiseLevel, setNoiseLevel] = useState(42);
  const [frequencies, setFrequencies] = useState([20, 45, 60, 30, 80, 65, 40, 90, 50, 75, 40, 85, 30, 60, 45, 35]);
  const [detectedWord, setDetectedWord] = useState(null);
  const [countdown, setCountdown] = useState(null);
  const countdownTimerRef = useRef(null);

  // Toggle voice recognition
  const toggleListening = () => {
    if (isHotwordListening) {
      speechService.stopListening();
      setIsHotwordListening(false);
      tacticalAudio.playClick();
    } else {
      tacticalAudio.playClick();
      setIsHotwordListening(true);
      speechService.startListening({
        onHotword: (word) => handleTriggerDetected(word),
        onTranscript: (text, isFinal) => {
          setTranscript(text);
        },
        onNoiseLevel: (db, freqArray) => {
          setNoiseLevel(db);
          if (freqArray && freqArray.length > 0) {
            setFrequencies(freqArray);
          }
        }
      });
    }
  };

  const handleTriggerDetected = (word) => {
    tacticalAudio.playHotwordTrigger();
    setDetectedWord(word);
    setCountdown(5); // 5 second cancelable window

    logEvent(
      "HOTWORD_ACOUSTIC_TRIGGER",
      `Trigger Word Detected: "${word}"`,
      `Acoustic sensor registered phrase. Commencing 5s automated dispatch sequence.`,
      "CRITICAL"
    );

    let timeLeft = 5;
    if (countdownTimerRef.current) clearInterval(countdownTimerRef.current);
    countdownTimerRef.current = setInterval(() => {
      timeLeft -= 1;
      setCountdown(timeLeft);
      if (timeLeft <= 0) {
        clearInterval(countdownTimerRef.current);
        setDetectedWord(null);
        setCountdown(null);
        armSos(`VOICE_HOTWORD_${word}`);
      }
    }, 1000);
  };

  const cancelCountdown = () => {
    if (countdownTimerRef.current) {
      clearInterval(countdownTimerRef.current);
      countdownTimerRef.current = null;
    }
    setDetectedWord(null);
    setCountdown(null);
    tacticalAudio.playDisarmChime();
    logEvent("HOTWORD_DISMISSED", "Voice Dispatch Canceled", "User aborted hotword countdown.", "SAFE");
  };

  useEffect(() => {
    return () => {
      if (countdownTimerRef.current) clearInterval(countdownTimerRef.current);
      speechService.stopListening();
    };
  }, []);

  return (
    <div className="relative min-h-screen pb-28 pt-4 px-4 max-w-6xl mx-auto flex flex-col gap-8">
      {/* Detected Hotword High-Alert Banner */}
      <AnimatePresence>
        {detectedWord && countdown !== null && (
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="p-6 rounded-2xl bg-rose-950/90 border-2 border-rose-500 shadow-[0_0_50px_rgba(255,23,68,0.7)] flex flex-col sm:flex-row items-center justify-between gap-6"
          >
            <div className="flex items-center gap-4 text-center sm:text-left">
              <div className="w-14 h-14 rounded-full bg-rose-600 flex items-center justify-center text-white text-2xl font-bold animate-ping" />
              <div>
                <span className="text-xs font-mono uppercase tracking-widest text-rose-300 block">
                  ACOUSTIC HOTWORD RECOGNIZED // DISPATCH IN {countdown}S
                </span>
                <h2 className="font-tactical font-extrabold text-2xl md:text-3xl text-white">
                  KEYWORD DETECTED: "{detectedWord}"
                </h2>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <TacticalButton
                variant="safe"
                size="lg"
                icon={XCircle}
                onClick={cancelCountdown}
              >
                ABORT DISPATCH
              </TacticalButton>
              <TacticalButton
                variant="danger"
                size="lg"
                onClick={() => {
                  cancelCountdown();
                  armSos(`INSTANT_VOICE_${detectedWord}`);
                }}
              >
                DISPATCH NOW
              </TacticalButton>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-cyan-500/20 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <Mic className={`w-5 h-5 ${isHotwordListening ? 'text-cyan-400 animate-pulse' : 'text-slate-400'}`} />
            <h1 className="font-tactical font-bold text-3xl md:text-4xl text-white tracking-wider">
              VOICE HOTWORD & ACOUSTIC RADAR
            </h1>
          </div>
          <p className="text-xs font-mono text-slate-400 mt-1">
            NEURAL SPEECH RECOGNITION // HANDS-FREE DISTRESS RECOGNITION
          </p>
        </div>

        <div className="flex items-center gap-3">
          <TacticalButton
            size="sm"
            variant={isHotwordListening ? 'danger' : 'cyan'}
            icon={isHotwordListening ? MicOff : Mic}
            onClick={toggleListening}
          >
            {isHotwordListening ? 'TERMINATE MIC' : 'ARM MICROPHONE'}
          </TacticalButton>
          <StatusBadge
            label={isHotwordListening ? 'LISTENING (ARMED)' : 'MIC OFFLINE'}
            status={isHotwordListening ? 'active' : 'normal'}
            pulse={isHotwordListening}
          />
        </div>
      </div>

      {/* Main Grid: Waveform Visualizer & Hotword Matrix */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Live Audio Waveform & Ambient Sensor */}
        <div className="lg:col-span-7 flex flex-col gap-6">
          <GlassCard variant="cyan" className="p-8 flex flex-col items-center relative overflow-hidden">
            <div className="w-full flex items-center justify-between mb-4 text-xs font-mono">
              <span className="text-slate-400">ACOUSTIC SPECTRUM ANALYZER</span>
              <span className="text-cyan-300 font-bold">{noiseLevel} dB SPL</span>
            </div>

            {/* Central Animated Audio Frequency Waveform Visualizer */}
            <div className="w-full h-40 flex items-end justify-center gap-1.5 sm:gap-2 px-2 my-4">
              {frequencies.map((val, idx) => {
                // Height percentage based on frequency value or simulated bounce
                const heightPercent = isHotwordListening
                  ? Math.max(15, Math.min(100, (val / 255) * 100))
                  : 10;

                return (
                  <motion.div
                    key={idx}
                    animate={{
                      height: `${heightPercent}%`
                    }}
                    transition={{ type: 'spring', damping: 15, stiffness: 200 }}
                    className="flex-1 max-w-[14px] rounded-t-sm bg-gradient-to-t from-cyan-600 via-sky-400 to-indigo-300 shadow-[0_0_8px_rgba(0,229,255,0.4)]"
                  />
                );
              })}
            </div>

            {/* Status & Live Transcript */}
            <div className="w-full pt-4 border-t border-cyan-500/15 flex flex-col items-center text-center gap-2">
              <div className="flex items-center gap-2 text-xs font-mono text-cyan-400">
                <span className={`w-2 h-2 rounded-full ${isHotwordListening ? 'bg-cyan-400 animate-ping' : 'bg-slate-600'}`} />
                <span>
                  {isHotwordListening
                    ? 'NEURAL SPEECH ENGINE LISTENING FOR DISTRESS PHRASES...'
                    : 'TAP "ARM MICROPHONE" TO ACTIVATE SENSOR'}
                </span>
              </div>

              {transcript && (
                <div className="mt-2 p-3 rounded-lg bg-black/50 border border-white/10 w-full text-xs font-mono text-slate-300">
                  <span className="text-[10px] text-slate-500 block mb-1">INTERIM TRANSCRIPT:</span>
                  <span className="text-cyan-200">"{transcript}"</span>
                </div>
              )}
            </div>
          </GlassCard>

          {/* Simulated Trigger Buttons (For testing without talking aloud) */}
          <GlassCard variant="cyan" className="p-6">
            <span className="text-xs font-mono uppercase tracking-widest text-slate-400 block mb-3">
              SIMULATE HOTWORD DETECTION (TESTING SUITE)
            </span>
            <div className="flex flex-wrap gap-2.5">
              {TRIGGER_WORDS.map((word) => (
                <button
                  key={word}
                  onClick={() => handleTriggerDetected(word)}
                  className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-rose-500/20 border border-white/10 hover:border-rose-400/50 text-xs font-mono text-slate-200 hover:text-white transition-all cursor-pointer"
                >
                  TRIGGER: "{word}"
                </button>
              ))}
            </div>
          </GlassCard>
        </div>

        {/* Right Column: Trigger Words Dossier */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          <GlassCard variant="cyan" className="p-6">
            <div className="flex items-center justify-between border-b border-cyan-500/20 pb-3 mb-4">
              <div className="flex items-center gap-2">
                <Radio className="w-4 h-4 text-cyan-400" />
                <span className="font-tactical font-bold text-lg text-white">
                  CALIBRATED TRIGGER KEYWORDS
                </span>
              </div>
              <span className="text-[10px] font-mono text-emerald-400">
                {TRIGGER_WORDS.length} ACTIVE
              </span>
            </div>

            <p className="text-xs font-mono text-slate-300 leading-relaxed mb-4">
              The acoustic neural layer recognizes both English and Hindi emergency keywords with low false-positive acoustic thresholds:
            </p>

            <div className="space-y-2.5">
              {TRIGGER_WORDS.map((word, i) => (
                <div
                  key={i}
                  className="p-3 rounded-lg bg-white/5 border border-white/5 flex items-center justify-between font-mono text-xs"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-slate-500">0{i + 1}</span>
                    <span className="font-bold text-cyan-300">"{word}"</span>
                  </div>
                  <span className="text-[10px] text-emerald-400 bg-emerald-950/40 px-2 py-0.5 rounded border border-emerald-500/30">
                    SENSITIVITY: HIGH
                  </span>
                </div>
              ))}
            </div>

            <div className="mt-4 pt-4 border-t border-white/10 text-xs font-mono text-slate-400 flex items-center justify-between">
              <span>VOICE LATENCY: &lt; 200ms</span>
              <span className="text-cyan-400">ON-DEVICE NATIVE</span>
            </div>
          </GlassCard>
        </div>
      </div>
    </div>
  );
}
