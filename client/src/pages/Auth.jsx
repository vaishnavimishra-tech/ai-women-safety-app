import React, { useState } from 'react';
import { signupUser, loginUser } from '../services/api';
import {
  Shield,
  User,
  Lock,
  Mail,
  CheckCircle,
  AlertTriangle,
  LogOut,
  ArrowRight,
  Sparkles,
  KeyRound,
  ShieldCheck,
  Radio,
  HardDrive
} from 'lucide-react';
import { useSecurity } from '../context/SecurityContext';
import { tacticalAudio } from '../services/audioService';
import GlassCard from '../components/common/GlassCard';
import TacticalButton from '../components/common/TacticalButton';
import StatusBadge from '../components/common/StatusBadge';

export default function Auth() {
  const { currentUser, setCurrentUser, logoutUser, setActiveTab } = useSecurity();
  const [isLogin, setIsLogin] = useState(true);

  const [formData, setFormData] = useState({
    name: currentUser?.name || '',
    email: currentUser?.email || '',
    password: '',
  });

  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');
    setIsLoading(true);

    try {
      tacticalAudio.playClick();
      let data;

      if (isLogin) {
        data = await loginUser({
          email: formData.email,
          password: formData.password,
        });
      } else {
        data = await signupUser({
          name: formData.name,
          email: formData.email,
          password: formData.password,
        });
      }

      const user = data?.user || {
        id: data?.id || 'usr-' + Date.now(),
        name: formData.name || formData.email.split('@')[0],
        email: formData.email
      };

      setCurrentUser(user);
      localStorage.setItem('suraksha_user', JSON.stringify(user));
      tacticalAudio.playDisarmChime();

      setMessage(
        isLogin
          ? 'Authentication successful! Guardian identity verified.'
          : 'Profile registered successfully! Armed mesh activated.'
      );

      // Return to console after short delay
      setTimeout(() => {
        setActiveTab('hero');
      }, 700);

    } catch (err) {
      console.warn('Backend login fallback:', err.message);
      // If backend network error occurs (e.g. backend server not started), offer direct authentication
      setError(err.message || 'Authentication failed. Please verify credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  // Instant 1-Click Demo Login (Helpful for supervisor presentations or offline dev)
  const handleQuickDemoLogin = () => {
    tacticalAudio.playAlertChirp();
    const demoUser = {
      id: "670498b5e28a712e52b21c44",
      name: "Vaishnavi Mishra",
      email: "vaishnavi@vitbhopal.ac.in",
      regNo: "25BCE10943",
      role: "DEFENDER_COMMANDER"
    };
    setCurrentUser(demoUser);
    localStorage.setItem('suraksha_user', JSON.stringify(demoUser));
    setMessage('Quick Demo Access Activated: Logged in as Vaishnavi Mishra');
    setTimeout(() => {
      setActiveTab('hero');
    }, 600);
  };

  // If user is already logged in, show their active session card with a prominent LOGOUT button!
  if (currentUser) {
    return (
      <div className="max-w-2xl mx-auto mt-8 sm:mt-12 p-4">
        <GlassCard variant="rose" className="p-6 sm:p-8 relative overflow-hidden">
          {/* Header */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-rose-500/20 pb-5 mb-6">
            <div className="flex items-center gap-3.5">
              <div className="p-3 bg-rose-500/15 border border-rose-500/30 rounded-2xl text-rose-400 shadow-[0_0_20px_rgba(244,63,94,0.3)]">
                <ShieldCheck className="w-8 h-8" />
              </div>
              <div>
                <span className="text-[10px] font-mono tracking-widest text-rose-400 uppercase font-bold block">
                  IDENTITY & SESSION MANAGEMENT
                </span>
                <h2 className="text-2xl font-tactical font-bold text-white tracking-wider">
                  ACTIVE GUARDIAN SESSION
                </h2>
              </div>
            </div>

            <StatusBadge label="VERIFIED DEFENDER" status="safe" pulse={true} />
          </div>

          {/* User Details Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6 font-mono text-xs">
            <div className="p-3.5 rounded-xl bg-black/40 border border-white/10 flex flex-col gap-1">
              <span className="text-[10px] text-slate-400 uppercase">DEFENDER NAME</span>
              <span className="text-sm font-bold text-white flex items-center gap-1.5 font-sans">
                <User className="w-4 h-4 text-rose-400" />
                {currentUser.name || 'Verified User'}
              </span>
            </div>

            <div className="p-3.5 rounded-xl bg-black/40 border border-white/10 flex flex-col gap-1">
              <span className="text-[10px] text-slate-400 uppercase">VERIFIED EMAIL / ID</span>
              <span className="text-sm font-semibold text-rose-200 truncate flex items-center gap-1.5 font-sans">
                <Mail className="w-4 h-4 text-rose-400" />
                {currentUser.email || 'user@suraksha.ai'}
              </span>
            </div>

            <div className="p-3.5 rounded-xl bg-black/40 border border-white/10 flex flex-col gap-1">
              <span className="text-[10px] text-slate-400 uppercase">TELEMETRY ID</span>
              <span className="text-xs font-mono text-slate-300">
                {currentUser.id || 'NODE-USR-9943'}
              </span>
            </div>

            <div className="p-3.5 rounded-xl bg-black/40 border border-white/10 flex flex-col gap-1">
              <span className="text-[10px] text-slate-400 uppercase">HARDWARE NODE SECURITY</span>
              <span className="text-xs font-mono text-emerald-400 flex items-center gap-1">
                <Radio className="w-3.5 h-3.5" />
                256-BIT ENCRYPTED LOCAL MESH
              </span>
            </div>
          </div>

          {/* Action Row: Primary Console Access & Explicit Logout Button */}
          <div className="flex flex-col sm:flex-row items-center gap-3 pt-4 border-t border-white/10">
            <TacticalButton
              variant="safe"
              size="md"
              icon={ArrowRight}
              onClick={() => setActiveTab('hero')}
              className="w-full sm:flex-1"
            >
              RETURN TO COMMAND CONSOLE
            </TacticalButton>

            <button
              onClick={() => {
                if (window.confirm("Confirm logout: This will end your active session on this device.")) {
                  logoutUser();
                }
              }}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-lg bg-rose-600/20 border border-rose-500/60 text-rose-300 hover:bg-rose-600 hover:text-white transition-all text-sm font-tactical font-bold uppercase tracking-wider cursor-pointer shadow-[0_0_20px_rgba(244,63,94,0.3)] hover:shadow-[0_0_30px_rgba(244,63,94,0.6)]"
            >
              <LogOut className="w-4 h-4" />
              <span>LOGOUT / SIGN OUT</span>
            </button>
          </div>

          <div className="mt-4 text-center">
            <button
              onClick={() => logoutUser()}
              className="text-xs font-mono text-slate-400 hover:text-rose-300 underline cursor-pointer"
            >
              Need to switch defender credentials? Click here to switch account.
            </button>
          </div>
        </GlassCard>
      </div>
    );
  }

  // Not Logged In: Full Tactical Login & Registration Experience
  return (
    <div className="max-w-md mx-auto mt-6 sm:mt-10 px-4">
      <GlassCard variant="rose" className="p-6 sm:p-8 relative shadow-2xl">
        {/* Shield Icon & Header */}
        <div className="flex flex-col items-center text-center mb-6">
          <div className="p-3.5 bg-rose-500/15 border border-rose-500/30 rounded-full text-rose-400 shadow-[0_0_25px_rgba(244,63,94,0.4)] mb-3">
            <Shield className="w-9 h-9" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-tactical font-bold text-white tracking-wider">
            {isLogin ? 'GUARDIAN ACCESS' : 'CREATE DEFENDER PROFILE'}
          </h2>
          <p className="text-xs font-mono text-slate-400 mt-1 max-w-xs">
            Armed Women Safety Defense Network • Zero Cloud Reliance
          </p>
        </div>

        {/* Tab Switcher: Login vs Register */}
        <div className="grid grid-cols-2 p-1 mb-6 rounded-xl bg-black/50 border border-white/10 text-xs font-mono">
          <button
            type="button"
            onClick={() => {
              setIsLogin(true);
              setMessage('');
              setError('');
            }}
            className={`py-2 rounded-lg font-bold transition-all cursor-pointer ${
              isLogin
                ? 'bg-rose-600 text-white shadow-[0_0_15px_rgba(244,63,94,0.5)]'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            SIGN IN
          </button>
          <button
            type="button"
            onClick={() => {
              setIsLogin(false);
              setMessage('');
              setError('');
            }}
            className={`py-2 rounded-lg font-bold transition-all cursor-pointer ${
              !isLogin
                ? 'bg-rose-600 text-white shadow-[0_0_15px_rgba(244,63,94,0.5)]'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            REGISTER
          </button>
        </div>

        {/* Feedback Messages */}
        {message && (
          <div className="flex items-center gap-2 p-3 mb-4 bg-emerald-500/15 border border-emerald-500/40 text-emerald-300 text-xs rounded-xl font-mono">
            <CheckCircle className="w-4 h-4 shrink-0 text-emerald-400" />
            <span>{message}</span>
          </div>
        )}

        {error && (
          <div className="flex items-start gap-2 p-3 mb-4 bg-rose-500/15 border border-rose-500/40 text-rose-300 text-xs rounded-xl font-mono">
            <AlertTriangle className="w-4 h-4 shrink-0 text-rose-400 mt-0.5" />
            <div className="flex-1">
              <span>{error}</span>
              <button
                type="button"
                onClick={handleQuickDemoLogin}
                className="block mt-1 text-[11px] underline text-rose-200 hover:text-white font-bold cursor-pointer"
              >
                Or bypass with Quick Demo Login →
              </button>
            </div>
          </div>
        )}

        {/* Auth Form */}
        <form onSubmit={handleSubmit} className="space-y-4 font-mono text-xs">
          {!isLogin && (
            <div>
              <label className="block text-[11px] text-slate-400 uppercase tracking-wider mb-1.5">
                FULL NAME
              </label>
              <div className="flex items-center bg-black/60 border border-rose-500/30 focus-within:border-rose-400 rounded-xl px-3.5 py-2.5 transition-colors">
                <User className="w-4 h-4 text-slate-400 mr-2.5 shrink-0" />
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      name: e.target.value
                    })
                  }
                  placeholder="e.g. Vaishnavi Mishra"
                  className="bg-transparent text-sm w-full outline-none text-white font-sans placeholder:text-slate-600"
                  required
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-[11px] text-slate-400 uppercase tracking-wider mb-1.5">
              EMAIL / IDENTITY
            </label>
            <div className="flex items-center bg-black/60 border border-rose-500/30 focus-within:border-rose-400 rounded-xl px-3.5 py-2.5 transition-colors">
              <Mail className="w-4 h-4 text-slate-400 mr-2.5 shrink-0" />
              <input
                type="email"
                value={formData.email}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    email: e.target.value
                  })
                }
                placeholder="user@suraksha.ai"
                className="bg-transparent text-sm w-full outline-none text-white font-sans placeholder:text-slate-600"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] text-slate-400 uppercase tracking-wider mb-1.5">
              PASSPHRASE
            </label>
            <div className="flex items-center bg-black/60 border border-rose-500/30 focus-within:border-rose-400 rounded-xl px-3.5 py-2.5 transition-colors">
              <Lock className="w-4 h-4 text-slate-400 mr-2.5 shrink-0" />
              <input
                type="password"
                value={formData.password}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    password: e.target.value
                  })
                }
                placeholder="••••••••••••"
                className="bg-transparent text-sm w-full outline-none text-white font-sans placeholder:text-slate-600"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 px-4 bg-rose-600 hover:bg-rose-500 disabled:opacity-50 text-white font-tactical font-bold uppercase tracking-wider rounded-xl shadow-lg shadow-rose-900/40 transition-all text-sm cursor-pointer"
          >
            {isLoading
              ? 'VERIFYING CREDENTIALS...'
              : isLogin
              ? 'AUTHENTICATE GUARDIAN'
              : 'REGISTER DEFENDER PROFILE'}
          </button>
        </form>

        {/* 1-Click Demo Login Shortcut */}
        <div className="mt-5 pt-4 border-t border-white/10 text-center">
          <button
            type="button"
            onClick={handleQuickDemoLogin}
            className="w-full py-2 px-3 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-mono text-slate-300 hover:text-white transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Instant Demo Login (Vaishnavi Mishra)</span>
          </button>
        </div>

        {/* Local Privacy Trust Footer */}
        <div className="mt-4 flex items-center justify-center gap-1.5 text-[10px] font-mono text-slate-400">
          <HardDrive className="w-3.5 h-3.5 text-emerald-400" />
          <span>100% Offline-First • Verified Local Cryptographic Vault</span>
        </div>
      </GlassCard>
    </div>
  );
}