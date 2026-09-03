// Web Audio API Sound Synthesizer for Suraksha AI
// Pure native browser oscillator synthesis - zero external audio files required.

class SoundAlertSystem {
  constructor() {
    this.audioCtx = null;
    this.sirenOscillator = null;
    this.sirenGainNode = null;
    this.sirenLfo = null;
    this.sirenLfoGain = null;
    this.isSirenPlaying = false;
  }

  // Ensure AudioContext is initialized on user interaction
  initContext() {
    if (!this.audioCtx) {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (AudioContextClass) {
        this.audioCtx = new AudioContextClass();
      }
    }
    if (this.audioCtx && this.audioCtx.state === 'suspended') {
      this.audioCtx.resume();
    }
  }

  /**
   * Starts a continuous, piercing high-frequency emergency siren
   * Uses frequency modulation (LFO) between 700Hz and 1400Hz
   */
  startEmergencySiren() {
    try {
      this.initContext();
      if (!this.audioCtx) return;

      if (this.isSirenPlaying) {
        this.stopEmergencySiren();
      }

      const now = this.audioCtx.currentTime;

      // Master carrier oscillator (the loud tone)
      this.sirenOscillator = this.audioCtx.createOscillator();
      this.sirenOscillator.type = 'sawtooth';
      this.sirenOscillator.frequency.setValueAtTime(950, now);

      // LFO (Low Frequency Oscillator) to modulate pitch up and down rapidly
      this.sirenLfo = this.audioCtx.createOscillator();
      this.sirenLfo.type = 'sine';
      this.sirenLfo.frequency.setValueAtTime(2.5, now); // 2.5 sweeps per second

      // LFO Depth (modulates pitch by +/- 350 Hz)
      this.sirenLfoGain = this.audioCtx.createGain();
      this.sirenLfoGain.gain.setValueAtTime(350, now);

      // Connect LFO -> Oscillator frequency parameter
      this.sirenLfo.connect(this.sirenLfoGain);
      this.sirenLfoGain.connect(this.sirenOscillator.frequency);

      // Master Gain for volume
      this.sirenGainNode = this.audioCtx.createGain();
      this.sirenGainNode.gain.setValueAtTime(0.01, now);
      // Smooth ramp-up to prevent clipping
      this.sirenGainNode.gain.exponentialRampToValueAtTime(0.4, now + 0.15);

      // Connect Carrier -> Gain -> Audio Output
      this.sirenOscillator.connect(this.sirenGainNode);
      this.sirenGainNode.connect(this.audioCtx.destination);

      this.sirenLfo.start(now);
      this.sirenOscillator.start(now);
      this.isSirenPlaying = true;
    } catch (err) {
      console.error('Failed to start Web Audio emergency siren:', err);
    }
  }

  /**
   * Stops the active emergency siren smoothly
   */
  stopEmergencySiren() {
    try {
      if (!this.isSirenPlaying || !this.audioCtx) return;

      const now = this.audioCtx.currentTime;
      if (this.sirenGainNode) {
        this.sirenGainNode.gain.cancelScheduledValues(now);
        this.sirenGainNode.gain.setValueAtTime(this.sirenGainNode.gain.value, now);
        this.sirenGainNode.gain.exponentialRampToValueAtTime(0.0001, now + 0.1);
      }

      setTimeout(() => {
        if (this.sirenOscillator) {
          try { this.sirenOscillator.stop(); this.sirenOscillator.disconnect(); } catch (_) {}
          this.sirenOscillator = null;
        }
        if (this.sirenLfo) {
          try { this.sirenLfo.stop(); this.sirenLfo.disconnect(); } catch (_) {}
          this.sirenLfo = null;
        }
        if (this.sirenGainNode) {
          try { this.sirenGainNode.disconnect(); } catch (_) {}
          this.sirenGainNode = null;
        }
        this.isSirenPlaying = false;
      }, 120);
    } catch (err) {
      console.error('Failed to stop emergency siren:', err);
      this.isSirenPlaying = false;
    }
  }

  /**
   * Plays a crisp high-pitch countdown tick for the 3-second abort timer
   * @param {number} remainingSeconds (3, 2, or 1)
   */
  playCountdownBeep(remainingSeconds) {
    try {
      this.initContext();
      if (!this.audioCtx) return;

      const now = this.audioCtx.currentTime;
      const osc = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();

      // Pitch rises as time runs out
      const freq = remainingSeconds === 1 ? 1200 : remainingSeconds === 2 ? 980 : 800;
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, now);

      gain.gain.setValueAtTime(0.3, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);

      osc.connect(gain);
      gain.connect(this.audioCtx.destination);

      osc.start(now);
      osc.stop(now + 0.2);
    } catch (err) {
      console.error('Error playing countdown beep:', err);
    }
  }

  /**
   * Plays a distinct harmonic chime upon successful SOS dispatch
   */
  playSuccessChime() {
    try {
      this.initContext();
      if (!this.audioCtx) return;

      const now = this.audioCtx.currentTime;
      const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6 (Major triad flourish)

      notes.forEach((freq, index) => {
        const osc = this.audioCtx.createOscillator();
        const gain = this.audioCtx.createGain();
        const startTime = now + (index * 0.08);

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, startTime);

        gain.gain.setValueAtTime(0.25, startTime);
        gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.35);

        osc.connect(gain);
        gain.connect(this.audioCtx.destination);

        osc.start(startTime);
        osc.stop(startTime + 0.4);
      });
    } catch (err) {
      console.error('Error playing success chime:', err);
    }
  }

  /**
   * Plays a low descending abort tone when an emergency trigger is cancelled
   */
  playAbortTone() {
    try {
      this.initContext();
      if (!this.audioCtx) return;

      const now = this.audioCtx.currentTime;
      const osc = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(450, now);
      osc.frequency.exponentialRampToValueAtTime(220, now + 0.25);

      gain.gain.setValueAtTime(0.25, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);

      osc.connect(gain);
      gain.connect(this.audioCtx.destination);

      osc.start(now);
      osc.stop(now + 0.26);
    } catch (err) {
      console.error('Error playing abort tone:', err);
    }
  }
}

export const soundAlert = new SoundAlertSystem();
export default soundAlert;