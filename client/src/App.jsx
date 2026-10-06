import React from 'react';
import Auth from './pages/Auth';
import ErrorBoundary from './components/common/ErrorBoundary';
import { SecurityProvider, useSecurity } from './context/SecurityContext';
import ParticleBackground from './components/3d/ParticleBackground';
import HudHeader from './components/layout/HudHeader';
import TacticalDock from './components/layout/TacticalDock';
import StealthCalculator from './components/layout/StealthCalculator';
import FakeCallModal from './components/toolkit/FakeCallModal';

import LandingHeroPage from './pages/LandingHeroPage';
import PanicHubPage from './pages/PanicHubPage';
import RadarMapPage from './pages/RadarMapPage';
import GuardianNetworkPage from './pages/GuardianNetworkPage';
import VoiceCommandPage from './pages/VoiceCommandPage';
import IncidentLogsPage from './pages/IncidentLogsPage';
import SafetyToolkitPage from './pages/SafetyToolkitPage';
import SettingsPage from './pages/SettingsPage';

function MainApp() {
  const {
    currentUser,
    activeTab,
    stealthMode,
    armedState,
    sosNotice,
    dismissSosNotice,
    shakeCountdown,
    cancelShakeCountdown,
    recentShakeCount
  } = useSecurity();

  // If user is not logged in, render the Auth (Login/Signup) page as gate
  if (!currentUser) {
    return (
      <div className="min-h-screen relative font-sans text-slate-100 bg-[#0c0d14] overflow-x-hidden">
        <ParticleBackground />
        <div className="scanlines fixed inset-0 pointer-events-none z-30 opacity-20" />
        <Auth />
      </div>
    );
  }

  if (stealthMode) {
    return <StealthCalculator />;
  }

  const renderActiveTab = () => {
    switch (activeTab) {
      case 'hero':
        return <LandingHeroPage />;
      case 'sos':
        return <PanicHubPage />;
      case 'radar':
        return <RadarMapPage />;
      case 'network':
      case 'guardians':
        return <GuardianNetworkPage />;
      case 'voice':
        return <VoiceCommandPage />;
      case 'toolkit':
        return <SafetyToolkitPage />;
      case 'logs':
        return <IncidentLogsPage />;
      case 'settings':
        return <SettingsPage />;
      case 'auth':
      case 'account':
        return <Auth />;
      default:
        return <LandingHeroPage />;
    }
  };

  const isArmed = armedState === 'ARMED';

  return (
    <div
      className={`min-h-screen relative font-sans text-slate-100 overflow-x-hidden transition-colors duration-700 ${
        isArmed ? 'bg-[#18070d]' : 'bg-[#0c0d14]'
      }`}
    >
      {/* Background Cybernetic Particle Constellation */}
      <ParticleBackground />

      {/* Atmospheric Soft Light Overlay */}
      <div className="scanlines fixed inset-0 pointer-events-none z-30 opacity-20" />

      {/* Global Interactive Shake Toast Indicator */}
      {recentShakeCount > 0 && (
        <div className="fixed top-18 left-1/2 -translate-x-1/2 z-50 transition-all duration-300">
          <div className="px-4 py-2 rounded-full bg-rose-600/95 text-white font-medium text-xs sm:text-sm tracking-wide shadow-[0_0_35px_rgba(244,63,94,0.65)] backdrop-blur-xl border border-rose-300/80 flex items-center gap-2.5 animate-pulse">
            <span className="w-2.5 h-2.5 rounded-full bg-white animate-ping" />
            <span className="font-bold tracking-wider font-tactical text-sm uppercase">SHAKE SOS [{recentShakeCount}/3]</span>
            <span className="text-rose-100 font-sans text-xs">
              {recentShakeCount === 1 ? 'Shake twice more!' : recentShakeCount === 2 ? 'Shake once more for emergency!' : 'SOS Broadcasted!'}
            </span>
          </div>
        </div>
      )}

      {/* Top HUD Mission Header with Logout Button */}
      <HudHeader />

      {/* Shake trigger: 5s cancel window before SOS is sent */}
      {shakeCountdown !== null && (
        <div className="fixed top-20 inset-x-3 z-50 max-w-xl mx-auto p-4 rounded-xl bg-rose-950/95 border-2 border-rose-500 text-white flex items-center justify-between gap-3 shadow-[0_0_40px_rgba(244,63,94,0.6)]">
          <div>
            <p className="text-xs font-mono text-rose-300 uppercase tracking-wider font-bold">SHAKE EMERGENCY DETECTED</p>
            <p className="font-bold text-sm">Automated SOS dispatching in {shakeCountdown}s...</p>
          </div>
          <button
            onClick={cancelShakeCountdown}
            className="px-4 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-xs uppercase font-mono tracking-wider transition-all"
          >
            CANCEL
          </button>
        </div>
      )}

      {/* SOS result: delivered / no contacts saved / failed */}
      {sosNotice && (
        <div
          className={`fixed top-20 inset-x-3 z-50 max-w-xl mx-auto p-4 rounded-xl border-2 text-white flex items-start justify-between gap-3 shadow-2xl ${
            sosNotice.type === 'success'
              ? 'bg-emerald-950/95 border-emerald-500'
              : sosNotice.type === 'warning'
              ? 'bg-amber-950/95 border-amber-500'
              : 'bg-rose-950/95 border-rose-500'
          }`}
          role="alert"
        >
          <p className="text-sm font-sans">{sosNotice.message}</p>
          <button onClick={dismissSosNotice} className="text-xs font-mono underline shrink-0 cursor-pointer hover:text-white">
            DISMISS
          </button>
        </div>
      )}

      {/* Main Page Content Container */}
      <main className="relative z-10 pb-36 sm:pb-40">{renderActiveTab()}</main>

      {/* Floating Tactical Bottom Dock */}
      <TacticalDock />

      {/* Decoy Fake Phone Call Modal */}
      <FakeCallModal />
    </div>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <SecurityProvider>
        <MainApp />
      </SecurityProvider>
    </ErrorBoundary>
  );
}