import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Phone,
  PhoneOff,
  Mic,
  Volume2,
  Grid,
  User,
  ShieldCheck,
  Video
} from 'lucide-react';
import { useSecurity } from '../../context/SecurityContext';
import { tacticalAudio } from '../../services/audioService';

export default function FakeCallModal() {
  const { fakeCallActive, fakeCaller, dismissFakeCall } = useSecurity();
  const [callAnswered, setCallAnswered] = useState(false);
  const [elapsedSec, setElapsedSec] = useState(0);

  useEffect(() => {
    let timer;
    if (callAnswered) {
      tacticalAudio.stopPhoneRingtone();
      timer = setInterval(() => {
        setElapsedSec((s) => s + 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [callAnswered]);

  if (!fakeCallActive) return null;

  const handleAccept = () => {
    tacticalAudio.playClick();
    setCallAnswered(true);
  };

  const handleDecline = () => {
    tacticalAudio.playClick();
    setCallAnswered(false);
    setElapsedSec(0);
    dismissFakeCall();
  };

  const formatTimer = (secs) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#0a0a0e] text-white flex flex-col justify-between p-6 sm:p-12 font-sans select-none">
      {/* Top Bar / Status */}
      <div className="flex flex-col items-center pt-8">
        <span className="text-xs tracking-widest text-neutral-400 uppercase font-mono mb-2">
          {callAnswered ? 'CALL IN PROGRESS' : 'INCOMING SECURE CALL...'}
        </span>

        {/* Big Avatar */}
        <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-neutral-800 to-neutral-700 border-2 border-neutral-600 flex items-center justify-center my-4 shadow-2xl">
          <User className="w-12 h-12 text-neutral-300" />
        </div>

        <h1 className="text-3xl font-semibold tracking-tight text-white mb-1">
          {fakeCaller?.name || 'Mom'}
        </h1>
        <p className="text-sm font-mono text-neutral-400">
          {callAnswered ? formatTimer(elapsedSec) : fakeCaller?.number || '+91 98765 00001'}
        </p>
      </div>

      {/* Center Body */}
      {callAnswered ? (
        <div className="flex flex-col items-center gap-8 my-auto">
          {/* Animated voice spectrum simulation */}
          <div className="flex items-center gap-1.5 h-12">
            {[40, 70, 100, 60, 80, 50, 90, 65, 45].map((h, idx) => (
              <motion.div
                key={idx}
                animate={{ height: ['25%', `${h}%`, '30%'] }}
                transition={{
                  repeat: Infinity,
                  duration: 0.5,
                  delay: idx * 0.08,
                  ease: 'easeInOut'
                }}
                className="w-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px_#00e676]"
              />
            ))}
          </div>

          <div className="grid grid-cols-3 gap-6 text-center text-xs text-neutral-300">
            <div className="flex flex-col items-center gap-2">
              <div className="w-14 h-14 rounded-full bg-white/10 flex items-center justify-center">
                <Mic className="w-6 h-6" />
              </div>
              <span>Mute</span>
            </div>
            <div className="flex flex-col items-center gap-2">
              <div className="w-14 h-14 rounded-full bg-white/10 flex items-center justify-center">
                <Grid className="w-6 h-6" />
              </div>
              <span>Keypad</span>
            </div>
            <div className="flex flex-col items-center gap-2">
              <div className="w-14 h-14 rounded-full bg-white/10 flex items-center justify-center">
                <Volume2 className="w-6 h-6" />
              </div>
              <span>Speaker</span>
            </div>
          </div>
        </div>
      ) : (
        <div className="my-auto flex flex-col items-center">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs font-mono text-neutral-400">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Decoy Caller Identity Verified</span>
          </div>
        </div>
      )}

      {/* Bottom Action Controls */}
      <div className="flex items-center justify-around pb-10 max-w-sm mx-auto w-full">
        {callAnswered ? (
          <button
            onClick={handleDecline}
            className="w-20 h-20 rounded-full bg-rose-600 hover:bg-rose-500 text-white flex items-center justify-center shadow-[0_0_30px_rgba(255,23,68,0.6)] cursor-pointer"
          >
            <PhoneOff className="w-8 h-8" />
          </button>
        ) : (
          <>
            <div className="flex flex-col items-center gap-2">
              <button
                onClick={handleDecline}
                className="w-18 h-18 rounded-full bg-rose-600 hover:bg-rose-500 text-white flex items-center justify-center shadow-lg transition-transform hover:scale-105 cursor-pointer"
              >
                <PhoneOff className="w-8 h-8" />
              </button>
              <span className="text-xs text-neutral-400 font-medium">Decline</span>
            </div>

            <div className="flex flex-col items-center gap-2">
              <button
                onClick={handleAccept}
                className="w-18 h-18 rounded-full bg-emerald-500 hover:bg-emerald-400 text-white flex items-center justify-center shadow-[0_0_25px_rgba(0,230,118,0.6)] animate-pulse transition-transform hover:scale-105 cursor-pointer"
              >
                <Phone className="w-8 h-8" />
              </button>
              <span className="text-xs text-neutral-400 font-medium">Accept</span>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
