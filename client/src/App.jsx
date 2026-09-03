import React, { useState, useEffect, useRef } from 'react';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Contacts from './pages/Contacts';
import Location from './pages/Location';
import Logs from './pages/Logs';
import Auth from './pages/Auth';
import soundAlert from './utils/audioAlert';
import {
  getContacts,
  fetchLocationLogs,
  getUserProfile,
  recordLocationLog,
} from './services/api';

export default function App() {
  const [activeTab, setActiveTab] = useState('home');
  const [currentUser, setCurrentUser] = useState(null);
  const [contacts, setContacts] = useState([]);
  const [logs, setLogs] = useState([]);
  const [currentLocation, setCurrentLocation] = useState({
    lat: 28.6139,
    lng: 77.2090,
    accuracy: 10,
    speed: 0,
    altitude: 216,
    address: 'Connaught Place, New Delhi, India',
  });

  const [isSirenPlaying, setIsSirenPlaying] = useState(false);
  const [isVoiceListening, setIsVoiceListening] = useState(false);
  const [speechTranscript, setSpeechTranscript] = useState('');
  const recognitionRef = useRef(null);

  useEffect(() => {
    async function loadData() {
      try {
        const [profileData, contactsData, logsData] = await Promise.all([
          getUserProfile(),
          getContacts(),
          fetchLocationLogs(),
        ]);
        setCurrentUser(profileData);
        setContacts(contactsData);
        setLogs(logsData);
      } catch (err) {
        console.error('Error loading initial data:', err);
      }
    }
    loadData();
  }, []);

  const toggleVoice = () => {
    setIsVoiceListening((prev) => !prev);
  };

  const toggleSiren = () => {
    if (isSirenPlaying) {
      soundAlert.stopEmergencySiren();
      setIsSirenPlaying(false);
    } else {
      soundAlert.startEmergencySiren();
      setIsSirenPlaying(true);
    }
  };

  const handleSosDispatched = (newIncident) => {
    setLogs((prev) => [newIncident, ...prev]);
  };

  const refreshLocation = () => Promise.resolve(currentLocation);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-rose-500 selection:text-white">
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        contactsCount={contacts.length}
        logsCount={logs.length}
        isVoiceListening={isVoiceListening}
        isSirenPlaying={isSirenPlaying}
        toggleSiren={toggleSiren}
        toggleVoice={toggleVoice}
        currentUser={currentUser}
      />
      <main className="flex-1 w-full animate-in fade-in duration-300">
        {activeTab === 'home' && (
          <Home
            currentUser={currentUser}
            contacts={contacts}
            currentLocation={currentLocation}
            isVoiceListening={isVoiceListening}
            toggleVoice={toggleVoice}
            speechTranscript={speechTranscript}
            onSosDispatched={handleSosDispatched}
          />
        )}
        {activeTab === 'contacts' && (
          <Contacts
            contacts={contacts}
            setContacts={setContacts}
            currentUser={currentUser}
            currentLocation={currentLocation}
          />
        )}
        {activeTab === 'location' && (
          <Location
            currentLocation={currentLocation}
            onRefreshLocation={refreshLocation}
            currentUser={currentUser}
          />
        )}
        {activeTab === 'logs' && <Logs logs={logs} setLogs={setLogs} />}
        {activeTab === 'auth' && (
          <Auth currentUser={currentUser} setCurrentUser={setCurrentUser} />
        )}
      </main>
    </div>
  );
}
