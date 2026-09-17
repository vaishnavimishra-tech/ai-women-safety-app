// Web Speech & Audio Frequency Analyser for Suraksha AI Hotword Visualizer

export const TRIGGER_WORDS = ["HELP", "SURAKSHA", "EMERGENCY", "BACHAO", "CODE RED", "SAVE ME"];

class SpeechService {
  constructor() {
    this.recognition = null;
    this.isListening = false;
    this.audioContext = null;
    this.analyser = null;
    this.mediaStream = null;
    this.onHotwordCallback = null;
    this.onTranscriptCallback = null;
    this.onNoiseLevelCallback = null;
    this.noiseInterval = null;
  }

  initSpeechRecognition() {
    if (typeof window === 'undefined') return false;
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      console.warn("Web Speech API not supported in this browser. Simulation mode active.");
      return false;
    }

    try {
      this.recognition = new SpeechRecognition();
      this.recognition.continuous = true;
      this.recognition.interimResults = true;
      this.recognition.lang = 'en-IN';

      this.recognition.onresult = (event) => {
        let interim = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          const transcript = event.results[i][0].transcript.toUpperCase();
          if (event.results[i].isFinal) {
            this.checkTriggerWords(transcript);
            if (this.onTranscriptCallback) this.onTranscriptCallback(transcript, true);
          } else {
            interim += transcript;
            this.checkTriggerWords(interim);
            if (this.onTranscriptCallback) this.onTranscriptCallback(interim, false);
          }
        }
      };

      this.recognition.onerror = (event) => {
        console.warn("Speech recognition notice:", event.error);
      };

      this.recognition.onend = () => {
        if (this.isListening && this.recognition) {
          try {
            this.recognition.start();
          } catch {}
        }
      };

      return true;
    } catch {
      return false;
    }
  }

  checkTriggerWords(text) {
    for (const word of TRIGGER_WORDS) {
      if (text.includes(word)) {
        if (this.onHotwordCallback) {
          this.onHotwordCallback(word);
        }
        break;
      }
    }
  }

  async startListening({ onHotword, onTranscript, onNoiseLevel }) {
    this.onHotwordCallback = onHotword;
    this.onTranscriptCallback = onTranscript;
    this.onNoiseLevelCallback = onNoiseLevel;
    this.isListening = true;

    // Start Web Audio analyser if possible
    try {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        this.mediaStream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
        const AudioCtx = window.AudioContext || window.webkitAudioContext;
        this.audioContext = new AudioCtx();
        const source = this.audioContext.createMediaStreamSource(this.mediaStream);
        this.analyser = this.audioContext.createAnalyser();
        this.analyser.fftSize = 64;
        source.connect(this.analyser);

        const dataArray = new Uint8Array(this.analyser.frequencyBinCount);
        this.noiseInterval = setInterval(() => {
          if (!this.analyser || !this.isListening) return;
          this.analyser.getByteFrequencyData(dataArray);
          let sum = 0;
          for (let i = 0; i < dataArray.length; i++) {
            sum += dataArray[i];
          }
          const avg = sum / dataArray.length;
          const db = Math.round(30 + (avg / 255) * 60); // approx 30dB to 90dB
          if (this.onNoiseLevelCallback) {
            this.onNoiseLevelCallback(db, Array.from(dataArray.slice(0, 16)));
          }
        }, 80);
      }
    } catch (err) {
      console.warn("Microphone stream not accessible, running simulated telemetry visualizer:", err.message);
      // Fallback simulated noise level
      this.noiseInterval = setInterval(() => {
        if (!this.isListening) return;
        const fakeDb = Math.floor(40 + Math.random() * 25);
        const fakeFrequencies = Array.from({ length: 16 }, () => Math.floor(20 + Math.random() * 180));
        if (this.onNoiseLevelCallback) {
          this.onNoiseLevelCallback(fakeDb, fakeFrequencies);
        }
      }, 90);
    }

    // Start recognition
    const hasNative = this.initSpeechRecognition();
    if (hasNative && this.recognition) {
      try {
        this.recognition.start();
      } catch {}
    }
  }

  stopListening() {
    this.isListening = false;
    if (this.noiseInterval) {
      clearInterval(this.noiseInterval);
      this.noiseInterval = null;
    }
    if (this.recognition) {
      try {
        this.recognition.stop();
      } catch {}
    }
    if (this.mediaStream) {
      this.mediaStream.getTracks().forEach((t) => t.stop());
      this.mediaStream = null;
    }
    if (this.audioContext) {
      try {
        this.audioContext.close();
      } catch {}
      this.audioContext = null;
    }
  }
}

export const speechService = new SpeechService();
