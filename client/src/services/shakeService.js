// services/shakeService.js
// Emergency shake trigger: shaking the phone 3 times quickly fires the SOS flow.
//
// Flow:  devicemotion -> 3 strong shakes within 2s -> onShake() -> countdown -> armSos -> /api/sos
//
// Notes
//  - Needs a phone/tablet with a motion sensor (desktop browsers have none).
//  - iOS Safari requires a user tap to grant motion permission, so
//    requestPermission() must be called from a button click.
//  - Page must be served over HTTPS (or localhost) for sensors to work.

const SHAKE_THRESHOLD = 18;     // m/s^2 change between readings that counts as a "shake"
const SHAKES_REQUIRED = 3;      // 3 shakes = emergency
const WINDOW_MS = 2000;         // all shakes must happen within this window
const MIN_GAP_MS = 250;         // ignore readings of the same shake

class ShakeService {
  constructor() {
    this.active = false;
    this.onShake = null;
    this.last = null;
    this.shakeTimes = [];
    this.handler = this.handleMotion.bind(this);
  }

  isSupported() {
    return typeof window !== 'undefined' && 'DeviceMotionEvent' in window;
  }

  needsPermission() {
    return (
      this.isSupported() &&
      typeof DeviceMotionEvent.requestPermission === 'function'
    );
  }

  // Must be called from a click handler on iOS. Returns true if allowed.
  async requestPermission() {
    if (!this.isSupported()) return false;
    if (!this.needsPermission()) return true;
    try {
      return (await DeviceMotionEvent.requestPermission()) === 'granted';
    } catch {
      return false;
    }
  }

  start(onShake) {
    if (!this.isSupported() || this.active) return false;
    this.onShake = onShake;
    this.last = null;
    this.shakeTimes = [];
    window.addEventListener('devicemotion', this.handler);
    this.active = true;
    return true;
  }

  stop() {
    if (typeof window !== 'undefined') {
      window.removeEventListener('devicemotion', this.handler);
    }
    this.active = false;
    this.shakeTimes = [];
    this.last = null;
  }

  handleMotion(event) {
    const a = event.accelerationIncludingGravity;
    if (!a || a.x == null) return;

    const cur = { x: a.x, y: a.y, z: a.z };
    if (this.last) {
      const delta =
        Math.abs(cur.x - this.last.x) +
        Math.abs(cur.y - this.last.y) +
        Math.abs(cur.z - this.last.z);

      if (delta > SHAKE_THRESHOLD) {
        const now = Date.now();
        const prev = this.shakeTimes[this.shakeTimes.length - 1];
        if (!prev || now - prev > MIN_GAP_MS) {
          this.shakeTimes.push(now);
          this.shakeTimes = this.shakeTimes.filter((t) => now - t <= WINDOW_MS);

          if (this.shakeTimes.length >= SHAKES_REQUIRED) {
            this.shakeTimes = [];
            if (this.onShake) this.onShake();
          }
        }
      }
    }
    this.last = cur;
  }
}

export const shakeService = new ShakeService();
