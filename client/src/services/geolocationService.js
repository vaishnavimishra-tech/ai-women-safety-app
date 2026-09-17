// Geolocation Service for Suraksha AI Tactical Console
// Provides live GPS coordinates, simulated fallback, accuracy radius, and nearest safe haven calculation

export const DEFAULT_TACTICAL_COORDS = {
  latitude: 28.6139, // New Delhi Command Sector default
  longitude: 77.2090,
  accuracy: 3.8,
  speed: 0,
  altitude: 216,
  heading: 42,
  timestamp: Date.now(),
  address: "Sector 4, Cyber Gateway, New Delhi (Grid 28.61°N, 77.21°E)"
};

export const NEARBY_SAFE_HAVENS = [
  {
    id: "haven-1",
    name: "Central Police Assistance Booth #4",
    type: "police",
    distance: "140m",
    bearing: 45,
    coords: { lat: 28.6148, lng: 77.2102 },
    status: "ACTIVE 24/7",
    phone: "112"
  },
  {
    id: "haven-2",
    name: "Pink Patrol Mobile Unit Alpha",
    type: "patrol",
    distance: "280m",
    bearing: 130,
    coords: { lat: 28.6125, lng: 77.2115 },
    status: "ON PATROL (ETA 1m)",
    phone: "1091"
  },
  {
    id: "haven-3",
    name: "Apollo Metro Emergency Kiosk",
    type: "transit",
    distance: "420m",
    bearing: 220,
    coords: { lat: 28.6118, lng: 77.2065 },
    status: "WELL-LIT / CCTV 100%",
    phone: "112"
  },
  {
    id: "haven-4",
    name: "Fortis Trauma & Crisis Center",
    type: "hospital",
    distance: "750m",
    bearing: 310,
    coords: { lat: 28.6175, lng: 77.2052 },
    status: "OPEN 24/7",
    phone: "108"
  }
];

class GeolocationService {
  constructor() {
    this.watchId = null;
    this.currentCoords = {
      ...DEFAULT_TACTICAL_COORDS,
      status: 'PENDING',
      isReal: false
    };
    this.listeners = new Set();
  }

  startTracking() {
    if (typeof window === 'undefined' || !navigator.geolocation) {
      this.currentCoords.status = 'UNSUPPORTED';
      this.notify();
      return;
    }

    // Fast initial request
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        this.updateCoords(pos, true);
      },
      (err) => {
        console.warn('Initial geolocation warning:', err.message);
        this.currentCoords.status = err.code === 1 ? 'DENIED' : 'UNAVAILABLE';
        this.notify();
      },
      { enableHighAccuracy: true, timeout: 8000, maximumAge: 0 }
    );

    // Continuous watch
    this.watchId = navigator.geolocation.watchPosition(
      (pos) => {
        this.updateCoords(pos, true);
      },
      (err) => {
        if (!this.currentCoords.isReal) {
          this.currentCoords.status = err.code === 1 ? 'DENIED' : 'UNAVAILABLE';
          this.notify();
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 5000
      }
    );
  }

  updateCoords(pos, isReal = true) {
    this.currentCoords = {
      latitude: pos.coords.latitude,
      longitude: pos.coords.longitude,
      accuracy: Math.round(pos.coords.accuracy * 10) / 10,
      speed: pos.coords.speed ? Math.round(pos.coords.speed * 3.6) : 0,
      altitude: pos.coords.altitude ? Math.round(pos.coords.altitude) : 210,
      heading: pos.coords.heading || 0,
      timestamp: pos.timestamp || Date.now(),
      address: `Grid [${pos.coords.latitude.toFixed(4)}°N, ${pos.coords.longitude.toFixed(4)}°E]`,
      status: 'LOCKED',
      isReal
    };
    this.notify();
  }

  stopTracking() {
    if (this.watchId !== null && navigator.geolocation) {
      navigator.geolocation.clearWatch(this.watchId);
      this.watchId = null;
    }
  }

  subscribe(listener) {
    this.listeners.add(listener);
    listener(this.currentCoords);
    return () => this.listeners.delete(listener);
  }

  notify() {
    this.listeners.forEach((fn) => fn(this.currentCoords));
  }

  getCurrent() {
    return this.currentCoords;
  }
}

export const geoService = new GeolocationService();
