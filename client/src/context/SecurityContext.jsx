import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { tacticalAudio } from '../services/audioService';
import { geoService, DEFAULT_TACTICAL_COORDS } from '../services/geolocationService';
import { addContact, triggerSOSRequest } from '../services/api';
import { shakeService } from '../services/shakeService';

const SecurityContext = createContext(null);

const DEFAULT_GUARDIANS = [
  {
    id: "g-1",
    name: "Aditi Sharma",
    relation: "Sister",
    phone: "+91 98765 43210",
    status: "REACHABLE",
    battery: 92,
    latency: "18ms",
    isPrimary: true,
    lastPing: "2m ago"
  },
  {
    id: "g-2",
    name: "Rajesh Sharma",
    relation: "Father",
    phone: "+91 98111 22334",
    status: "REACHABLE",
    battery: 67,
    latency: "24ms",
    isPrimary: false,
    lastPing: "8m ago"
  },
  {
    id: "g-3",
    name: "Pooja Verma",
    relation: "Roommate / Colleague",
    phone: "+91 99223 88441",
    status: "REACHABLE",
    battery: 84,
    latency: "12ms",
    isPrimary: false,
    lastPing: "14m ago"
  },
  {
    id: "g-4",
    name: "Campus Security Rapid Response",
    relation: "Institutional Escort",
    phone: "+91 11 2659 1000",
    status: "STANDBY 24/7",
    battery: 100,
    latency: "6ms",
    isPrimary: false,
    lastPing: "Just now"
  }
];

const INITIAL_LOGS = [
  {
    id: "log-1",
    timestamp: new Date(Date.now() - 3600000).toISOString(),
    event: "SYSTEM_INITIALIZE",
    title: "Suraksha Tactical Grid Initialized",
    details: "DEFCON 5 Standby. Encrypted telemetry relay verified across 4 satellites.",
    severity: "INFO",
    hash: "0x4f8e91a2"
  },
  {
    id: "log-2",
    timestamp: new Date(Date.now() - 1800000).toISOString(),
    event: "GUARDIAN_HANDSHAKE",
    title: "Guardian Mesh Network Synced",
    details: "4/4 contacts acknowledged cryptographic heartbeat. Latency nominal (15ms avg).",
    severity: "SAFE",
    hash: "0x7bc2301f"
  },
  {
    id: "log-3",
    timestamp: new Date(Date.now() - 600000).toISOString(),
    event: "GEOFENCE_CHECK",
    title: "Safe Corridor Geofence Active",
    details: "Tracking sector [28.6139°N, 77.2090°E]. 4 verified police booths within 1km radius.",
    severity: "INFO",
    hash: "0x91d4e08c"
  }
];

export function SecurityProvider({ children }) {
  // User Authentication State
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const saved = localStorage.getItem('suraksha_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [activeTab, setActiveTab] = useState('hero');
  const [armedState, setArmedState] = useState('STANDBY'); // STANDBY, ARMED, DISPATCHED
  const [defconLevel, setDefconLevel] = useState(5); // 5 (Nominal) -> 1 (SOS Armed)
  const [stealthMode, setStealthMode] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(() => {
    return typeof window !== 'undefined' ? localStorage.getItem('suraksha_sfx_muted') !== 'true' : true;
  });
  
  const [telemetry, setTelemetry] = useState(DEFAULT_TACTICAL_COORDS);
  const [deviceBattery, setDeviceBattery] = useState({
    level: 100,
    charging: false,
    isSupported: false
  });
  const [networkPing, setNetworkPing] = useState(14);
  const [guardians, setGuardians] = useState(() => {
    try {
      const saved = localStorage.getItem('suraksha_guardians');
      return saved ? JSON.parse(saved) : DEFAULT_GUARDIANS;
    } catch {
      return DEFAULT_GUARDIANS;
    }
  });

  const [auditLogs, setAuditLogs] = useState(() => {
    try {
      const saved = localStorage.getItem('suraksha_logs');
      return saved ? JSON.parse(saved) : INITIAL_LOGS;
    } catch {
      return INITIAL_LOGS;
    }
  });

  // Functional System Status (Empathetic & Human-Centric)
  const systemStatus = armedState === 'ARMED'
    ? 'EMERGENCY SOS BROADCAST ACTIVE'
    : `SHIELD ACTIVE // ${guardians.length} GUARDIANS CONNECTED`;

  // Shake-to-SOS State & Accelerometer Hooks
  const [shakeToSosEnabled, setShakeToSosEnabled] = useState(() => {
    return typeof window !== 'undefined' ? localStorage.getItem('suraksha_shake_sos_enabled') !== 'false' : true;
  });
  const [recentShakeCount, setRecentShakeCount] = useState(0);
  const [shakeStatusMessage, setShakeStatusMessage] = useState('');
  const [motionPermission, setMotionPermission] = useState('prompt');

  const lastAccRef = useRef({ x: 0, y: 0, z: 0 });
  const lastShakeTimestampRef = useRef(0);
  const shakeResetTimerRef = useRef(null);

  // Hotword state
  const [isHotwordListening, setIsHotwordListening] = useState(false);

  // Result of the last SOS dispatch (shown as a banner: sent / no contacts / failed)
  const [sosNotice, setSosNotice] = useState(null);

  // Shake-to-SOS: setting persisted in localStorage, 5s cancel window before sending
  const [shakeEnabled, setShakeEnabled] = useState(() => {
    try { return localStorage.getItem('suraksha_shake_enabled') === 'true'; } catch { return false; }
  });
  const [shakeSupported] = useState(() => shakeService.isSupported());
  const [shakeCountdown, setShakeCountdown] = useState(null);
  const shakeTimerRef = useRef(null);
  const armSosRef = useRef(null);

  // Fake Call trigger modal state
  const [fakeCallActive, setFakeCallActive] = useState(false);
  const [fakeCaller, setFakeCaller] = useState({ name: "Mom", number: "+91 98765 00001" });

  // Init Geolocation Tracking & Battery API
  useEffect(() => {
    geoService.startTracking();
    const unsub = geoService.subscribe((coords) => {
      setTelemetry((prev) => ({ ...prev, ...coords }));
    });

    // Real Battery API
    if (typeof navigator !== 'undefined' && 'getBattery' in navigator) {
      navigator.getBattery().then((battery) => {
        const updateBattery = () => {
          setDeviceBattery({
            level: Math.round(battery.level * 100),
            charging: battery.charging,
            isSupported: true
          });
        };
        updateBattery();
        battery.addEventListener('levelchange', updateBattery);
        battery.addEventListener('chargingchange', updateBattery);
      }).catch(() => {});
    }

    // Live network latency simulation (12ms - 18ms nominal ping)
    const pingTimer = setInterval(() => {
      setNetworkPing(Math.floor(12 + Math.random() * 6));
    }, 4000);

    return () => {
      unsub();
      geoService.stopTracking();
      clearInterval(pingTimer);
    };
  }, []);

  // Save guardians
  useEffect(() => {
    try {
      localStorage.setItem('suraksha_guardians', JSON.stringify(guardians));
    } catch {}
  }, [guardians]);

  // Save logs
  useEffect(() => {
    try {
      localStorage.setItem('suraksha_logs', JSON.stringify(auditLogs));
    } catch {}
  }, [auditLogs]);

  // Audio mute sync
  const toggleSound = () => {
    const next = !soundEnabled;
    setSoundEnabled(next);
    tacticalAudio.setMuted(!next);
  };

  const logEvent = (event, title, details, severity = "INFO") => {
    const newLog = {
      id: "log-" + Date.now(),
      timestamp: new Date().toISOString(),
      event,
      title,
      details,
      severity,
      hash: "0x" + Math.random().toString(16).substring(2, 10)
    };
    setAuditLogs((prev) => [newLog, ...prev.slice(0, 49)]); // Keep last 50
    return newLog;
  };

  // SOS ARMING
  // Single entry point for every trigger (button, shake, voice).
  // Flow: siren + vibration -> POST /api/sos (backend sends SMS to all contacts,
  // saves alert history) -> show result to the user -> write audit log.
  const armSos = async (triggerSource = "MANUAL_HOLD") => {
    if (armedState === 'ARMED') return; // ignore duplicate triggers while SOS is active

    setArmedState('ARMED');
    setDefconLevel(1);
    tacticalAudio.startSosSiren();

    if (typeof window !== 'undefined' && navigator.vibrate) {
      navigator.vibrate([300, 100, 300, 100, 500]);
    }

    const { latitude, longitude, isReal } = telemetry;
    const coordText = `[${latitude.toFixed(4)}, ${longitude.toFixed(4)}]`;
    let notice;

    try {
      const result = await triggerSOSRequest({ latitude, longitude, triggerSource });
      const demo = result.mode === 'demo';
      const partial = result.contactsNotified < result.contactsTotal;

      notice = {
        type: partial ? 'warning' : 'success',
        message: demo
          ? `SOS processed in DEMO mode for ${result.contactsNotified} contact(s). No real SMS was sent.`
          : `SOS SMS delivered to ${result.contactsNotified} of ${result.contactsTotal} contact(s).`
      };

      logEvent(
        "SOS_EMERGENCY_ARMED",
        "CRITICAL: EMERGENCY SOS BROADCAST TRIGGERED",
        `Source: ${triggerSource}. Coordinates ${coordText}${isReal ? '' : ' (GPS not locked - default position)'}. ` +
        `SMS ${demo ? 'simulated' : 'sent'} to ${result.contactsNotified}/${result.contactsTotal} contacts.`,
        "CRITICAL"
      );
    } catch (error) {
      console.error("SOS backend error:", error);

      notice = {
        type: 'error',
        message: error.code === 'NO_CONTACTS'
          ? "No emergency contacts saved. Add at least one guardian so SOS alerts can reach someone. Call 112 now if you are in danger."
          : `SOS alert could not be delivered: ${error.message}. Call 112 now if you are in danger.`
      };

      logEvent(
        "SOS_DISPATCH_FAILED",
        error.code === 'NO_CONTACTS' ? "SOS Raised - No Contacts Saved" : "SOS Dispatch Failed",
        `Source: ${triggerSource}. ${error.message}`,
        "CRITICAL"
      );
    }

    setSosNotice(notice);
  };

  const dismissSosNotice = () => setSosNotice(null);

  // ---- Shake trigger with countdown ----
  const cancelShakeCountdown = () => {
    if (shakeTimerRef.current) {
      clearInterval(shakeTimerRef.current);
      shakeTimerRef.current = null;
    }
    setShakeCountdown(null);
  };

  // 3 shakes detected -> 5 second cancel window (guards against accidental shakes) -> SOS
  const handleShakeDetected = () => {
    if (shakeTimerRef.current) return;
    tacticalAudio.playHotwordTrigger();
    if (navigator.vibrate) navigator.vibrate([200, 100, 200]);
    logEvent("SHAKE_TRIGGER_DETECTED", "Emergency Shake Detected",
      "3 rapid shakes registered. SOS will dispatch in 5s unless cancelled.", "CRITICAL");

    let left = 5;
    setShakeCountdown(left);
    shakeTimerRef.current = setInterval(() => {
      left -= 1;
      if (left <= 0) {
        cancelShakeCountdown();
        armSosRef.current?.("SHAKE_TRIGGER");
      } else {
        setShakeCountdown(left);
      }
    }, 1000);
  };

  // Turn shake detection on/off. Must be called from a click (iOS permission).
  const toggleShake = async () => {
    if (shakeEnabled) {
      shakeService.stop();
      setShakeEnabled(false);
      try { localStorage.setItem('suraksha_shake_enabled', 'false'); } catch {}
      return { ok: true };
    }
    if (!shakeService.isSupported()) {
      return { ok: false, error: "Motion sensor not available on this device/browser." };
    }
    const granted = await shakeService.requestPermission();
    if (!granted) {
      return { ok: false, error: "Motion permission denied." };
    }
    shakeService.start(handleShakeDetected);
    setShakeEnabled(true);
    try { localStorage.setItem('suraksha_shake_enabled', 'true'); } catch {}
    return { ok: true };
  };

  // Always point the shake timer at the latest armSos
  armSosRef.current = armSos;

  // Re-start shake detection after a page reload (works directly on Android)
  useEffect(() => {
    if (shakeEnabled && shakeSupported && !shakeService.needsPermission()) {
      shakeService.start(handleShakeDetected);
    }
    return () => {
      shakeService.stop();
      if (shakeTimerRef.current) clearInterval(shakeTimerRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Shake-to-SOS Interactive Feedback Handlers
  const registerShake = () => {
    if (!shakeToSosEnabled || armedState === 'ARMED') return;

    if (shakeResetTimerRef.current) {
      clearTimeout(shakeResetTimerRef.current);
    }

    setRecentShakeCount((prev) => {
      const next = prev + 1;
      if (next === 1) {
        tacticalAudio.playShakeTone(1);
        if (typeof window !== 'undefined' && navigator.vibrate) navigator.vibrate(100);
        setShakeStatusMessage('Shake 1/3 detected');
      } else if (next === 2) {
        tacticalAudio.playShakeTone(2);
        if (typeof window !== 'undefined' && navigator.vibrate) navigator.vibrate([120, 60, 120]);
        setShakeStatusMessage('Shake 2/3 detected — Shake once more to trigger SOS!');
      } else if (next >= 3) {
        tacticalAudio.playShakeTone(3);
        if (typeof window !== 'undefined' && navigator.vibrate) navigator.vibrate([200, 100, 300]);
        setShakeStatusMessage('Shake 3/3 — SOS Signal Broadcasted!');
        armSos("DEVICE_SHAKE_3X");
        
        setTimeout(() => {
          setRecentShakeCount(0);
          setShakeStatusMessage('');
        }, 2000);
        return 3;
      }

      // Rolling 2.8s reset window
      shakeResetTimerRef.current = setTimeout(() => {
        setRecentShakeCount(0);
        setShakeStatusMessage('');
      }, 2800);

      return next;
    });
  };

  const simulateShake = () => {
    registerShake();
  };

  const simulateFullShakeSequence = () => {
    registerShake();
    setTimeout(() => {
      registerShake();
      setTimeout(() => {
        registerShake();
      }, 400);
    }, 400);
  };

  const requestMotionPermission = async () => {
    if (typeof DeviceMotionEvent !== 'undefined' && typeof DeviceMotionEvent.requestPermission === 'function') {
      try {
        const response = await DeviceMotionEvent.requestPermission();
        setMotionPermission(response);
        return response === 'granted';
      } catch (err) {
        setMotionPermission('denied');
        return false;
      }
    }
    setMotionPermission('granted');
    return true;
  };

  // Save Shake setting
  useEffect(() => {
    try {
      localStorage.setItem('suraksha_shake_sos_enabled', shakeToSosEnabled ? 'true' : 'false');
    } catch {}
  }, [shakeToSosEnabled]);

  // Accelerometer Event Listener
  useEffect(() => {
    if (!shakeToSosEnabled || typeof window === 'undefined') return;

    const handleDeviceMotion = (e) => {
      if (armedState === 'ARMED') return;
      const acc = e.accelerationIncludingGravity || e.acceleration;
      if (!acc || acc.x === null) return;

      const now = Date.now();
      if (now - lastShakeTimestampRef.current < 280) return; // cooldown debounce

      const deltaX = Math.abs(acc.x - (lastAccRef.current.x || 0));
      const deltaY = Math.abs(acc.y - (lastAccRef.current.y || 0));
      const deltaZ = Math.abs(acc.z - (lastAccRef.current.z || 0));
      const totalDelta = deltaX + deltaY + deltaZ;

      lastAccRef.current = { x: acc.x, y: acc.y, z: acc.z };

      if (totalDelta > 16.5) {
        lastShakeTimestampRef.current = now;
        registerShake();
      }
    };

    window.addEventListener('devicemotion', handleDeviceMotion, { passive: true });
    return () => {
      window.removeEventListener('devicemotion', handleDeviceMotion);
      if (shakeResetTimerRef.current) clearTimeout(shakeResetTimerRef.current);
    };
  }, [shakeToSosEnabled, armedState]);

  // SOS DISARM
  const disarmSos = (enteredPin) => {
    const CORRECT_PIN = "1234";
    const DURESS_PIN = "9999"; // Silent duress code that pretends to disarm but silently flags distress

    if (enteredPin === DURESS_PIN) {
      tacticalAudio.stopSosSiren();
      tacticalAudio.playDisarmChime();
      setArmedState('STANDBY');
      setDefconLevel(5);
      logEvent(
        "SILENT_DURESS_TRIGGERED",
        "SILENT DURESS PROTOCOL ACTIVATED",
        "Console appeared to disarm normally under duress. High-priority silent covert tracking relay engaged.",
        "CRITICAL"
      );
      return { success: true, duress: true };
    }

    if (enteredPin === CORRECT_PIN) {
      tacticalAudio.stopSosSiren();
      tacticalAudio.playDisarmChime();
      setArmedState('STANDBY');
      setDefconLevel(5);
      logEvent(
        "SOS_DISARMED",
        "Emergency SOS Stood Down",
        "Valid authentication PIN verified. System returned to DEFCON 5 Nominal Standby.",
        "SAFE"
      );
      return { success: true, duress: false };
    }

    // Invalid PIN
    tacticalAudio.playArmCountdown(1);
    return { success: false, error: "Invalid Disarm PIN" };
  };

  const addGuardian = async (newG) => {
    try {
      const userId = JSON.parse(localStorage.getItem('suraksha_user'))?.id;

      if (!userId) {
        throw new Error('User ID not found. Please log in first.');
      }

      await addContact(
        userId,
        newG.name,
        newG.phone,
        newG.relation
      );
      const guardian = {
        id: "g-" + Date.now(),
        status: "REACHABLE",
        battery: 90,
        latency: "20ms",
        lastPing: "Just now",
        isPrimary: guardians.length === 0,
        ...newG
      };

      setGuardians((prev) => [...prev, guardian]);

      logEvent(
        "GUARDIAN_ADDED",
        `Guardian Enrolled: ${guardian.name}`,
        `Phone: ${guardian.phone} | Relation: ${guardian.relation}`,
        "SAFE"
      );

      tacticalAudio.playClick();
    } catch (error) {
      console.error("Add guardian error:", error);

      logEvent(
        "GUARDIAN_ADD_FAILED",
        "Guardian Enrollment Failed",
        error.message,
        "CRITICAL"
      );
    }
  };

  const removeGuardian = (id) => {
    const g = guardians.find((x) => x.id === id);
    setGuardians((prev) => prev.filter((x) => x.id !== id));
    if (g) {
      logEvent("GUARDIAN_REMOVED", `Guardian Removed: ${g.name}`, `Node disconnected from telemetry mesh.`, "INFO");
    }
    tacticalAudio.playClick();
  };

  const pingGuardian = (id) => {
    tacticalAudio.playRadarPing();
    const g = guardians.find((x) => x.id === id);
    setGuardians((prev) =>
      prev.map((item) =>
        item.id === id
          ? { ...item, lastPing: "Just now", latency: `${Math.floor(8 + Math.random() * 15)}ms` }
          : item
      )
    );
    if (g) {
      logEvent("GUARDIAN_PING", `Telemetry Ping Delivered to ${g.name}`, `Packet round-trip: 14ms. Cryptographic receipt verified.`, "SAFE");
    }
  };

  const triggerFakeCall = (callerInfo) => {
    if (callerInfo) setFakeCaller(callerInfo);
    setFakeCallActive(true);
    tacticalAudio.startPhoneRingtone();
    logEvent("DECOY_CALL_LAUNCHED", "Decoy Fake Call Triggered", `Caller ID: ${callerInfo?.name || fakeCaller.name}`, "INFO");
  };

  const dismissFakeCall = () => {
    setFakeCallActive(false);
    tacticalAudio.stopPhoneRingtone();
  };

  // User Logout Action
  const logoutUser = () => {
    try {
      localStorage.removeItem('suraksha_user');
    } catch {}
    setCurrentUser(null);
    tacticalAudio.playDisarmChime();
    logEvent("USER_LOGOUT", "User Session Terminated", "Guardian logged out of tactical console.", "INFO");
  };

  return (
    <SecurityContext.Provider
      value={{
        currentUser,
        setCurrentUser,
        logoutUser,
        activeTab,
        setActiveTab,
        armedState,
        defconLevel,
        armSos,
        disarmSos,
        stealthMode,
        setStealthMode,
        soundEnabled,
        toggleSound,
        telemetry,
        deviceBattery,
        networkPing,
        systemStatus,
        guardians,
        addGuardian,
        removeGuardian,
        pingGuardian,
        auditLogs,
        logEvent,
        isHotwordListening,
        setIsHotwordListening,
        fakeCallActive,
        fakeCaller,
        triggerFakeCall,
        dismissFakeCall,
        sosNotice,
        dismissSosNotice,
        shakeEnabled,
        shakeSupported,
        shakeCountdown,
        toggleShake,
        cancelShakeCountdown,
        shakeToSosEnabled,
        setShakeToSosEnabled,
        recentShakeCount,
        shakeStatusMessage,
        simulateShake,
        simulateFullShakeSequence,
        motionPermission,
        requestMotionPermission
      }}
    >
      {children}
    </SecurityContext.Provider>
  );
}

export function useSecurity() {
  const context = useContext(SecurityContext);
  if (!context) {
    throw new Error('useSecurity must be used within a SecurityProvider');
  }
  return context;
}
