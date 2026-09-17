import React from 'react';
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
  const { activeTab, stealthMode, armedState } = useSecurity();

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
