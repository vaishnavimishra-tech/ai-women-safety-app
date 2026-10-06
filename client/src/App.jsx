import React, { useState } from 'react';
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
    activeTab, stealthMode, armedState,
    sosNotice, dismissSosNotice,
    shakeCountdown, cancelShakeCountdown
  } = useSecurity();
  
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
      default:
        return <LandingHeroPage />;
    }
  };

  const isArmed = armedState === 'ARMED';

  return (
    <div
      className={`min-h-screen relative font-sans text-slate-100 overflow-x-hidden transition-colors duration-500 ${
        isArmed ? 'bg-[#0f0407]' : 'bg-[#07070b]'
      }`}
    >
      {/* Background Cybernetic Particle Constellation */}
      <ParticleBackground />

      {/* CRT Scanline Visual Filter Overlay */}
      <div className="scanlines fixed inset-0 pointer-events-none z-30 opacity-40" />

      {/* Top HUD Mission Header */}
      <HudHeader />

      {/* Shake trigger: 5s cancel window before SOS is sent */}
      {shakeCountdown !== null && (
        <div className="fixed top-20 inset-x-3 z-50 max-w-xl mx-auto p-4 rounded-xl bg-rose-950/95 border-2 border-rose-500 text-white flex items-center justify-between gap-3">
          <div>
            <p className="text-xs font-mono text-rose-300">SHAKE EMERGENCY DETECTED</p>
            <p className="font-bold">Sending SOS in {shakeCountdown}s...</p>
          </div>
          <button
            onClick={cancelShakeCountdown}
            className="px-4 py-2 rounded-lg bg-emerald-500 text-black font-bold"
          >
            CANCEL
          </button>
        </div>
      )}

      {/* SOS result: delivered / no contacts saved / failed */}
      {sosNotice && (
        <div
          className={`fixed top-20 inset-x-3 z-50 max-w-xl mx-auto p-4 rounded-xl border-2 text-white flex items-start justify-between gap-3 ${
            sosNotice.type === 'success'
              ? 'bg-emerald-950/95 border-emerald-500'
              : sosNotice.type === 'warning'
              ? 'bg-amber-950/95 border-amber-500'
              : 'bg-rose-950/95 border-rose-500'
          }`}
          role="alert"
        >
          <p className="text-sm">{sosNotice.message}</p>
          <button onClick={dismissSosNotice} className="text-xs font-mono underline shrink-0">
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
  const [currentUser, setCurrentUser] = useState(() => {
    const savedUser = localStorage.getItem('suraksha_user');
    return savedUser ? JSON.parse(savedUser) : null;
  });

  return (
    <ErrorBoundary>
      {currentUser ? (
        <SecurityProvider>
          <MainApp />
        </SecurityProvider>
      ) : (
        <Auth
          currentUser={currentUser}
          setCurrentUser={setCurrentUser}
        />
      )}
    </ErrorBoundary>
  );
}