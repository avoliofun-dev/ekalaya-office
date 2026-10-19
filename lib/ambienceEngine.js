// MODUL SUARA LATAR KANTOR (OFFICE AMBIENCE SOUND ENGINE)
// Menggunakan Web Audio API sintetis: Tanpa file MP3 berat, ringan, zero-lag, dan bebas copyright.

export class OfficeAmbienceEngine {
  constructor() {
    this.audioCtx = null;
    this.isPlaying = false;
    this.masterGain = null;
    this.humGain = null;
    this.typingInterval = null;
    this.chatterInterval = null;
    this.mouseInterval = null;
  }

  init() {
    if (this.audioCtx) return;
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextClass) return;

    this.audioCtx = new AudioContextClass();
    this.masterGain = this.audioCtx.createGain();
    this.masterGain.gain.setValueAtTime(0.3, this.audioCtx.currentTime); // Volume nyaman & tidak bising
    this.masterGain.connect(this.audioCtx.destination);
  }

  start() {
    this.init();
    if (!this.audioCtx) return;

    if (this.audioCtx.state === "suspended") {
      this.audioCtx.resume();
    }

    if (this.isPlaying) return;
    this.isPlaying = true;

    // 1. DENGUNGAN LEMBUT SUASANA KANTOR (Air Conditioner / Room Tone Noise)
    this.startRoomHum();

    // 2. SUARA KETIKAN KEYBOARD PEKERJA DI MEJA
    this.startKeyboardTypingLoop();

    // 3. SUARA KLIK MOUSE SPORADIK
    this.startMouseClickLoop();

    // 4. SUARA BISIK DISKUSI / MURMUR KANTOR DI KEJAUHAN
    this.startOfficeMurmurLoop();
  }

  stop() {
    this.isPlaying = false;
    if (this.typingInterval) clearInterval(this.typingInterval);
    if (this.chatterInterval) clearInterval(this.chatterInterval);
    if (this.mouseInterval) clearInterval(this.mouseInterval);

    if (this.humSource) {
      try {
        this.humSource.stop();
        this.humSource.disconnect();
      } catch (e) {}
      this.humSource = null;
    }

    if (this.audioCtx && this.audioCtx.state === "running") {
      this.audioCtx.suspend();
    }
  }

  toggle() {
    if (this.isPlaying) {
      this.stop();
      return false;
    } else {
      this.start();
      return true;
    }
  }

  // DENGUNGAN AC RUANG KERJA (Pink/Brown noise filter)
  startRoomHum() {
    if (!this.audioCtx) return;
    const bufferSize = this.audioCtx.sampleRate * 2;
    const noiseBuffer = this.audioCtx.createBuffer(1, bufferSize, this.audioCtx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    let b0 = 0, b1 = 0, b2 = 0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      b0 = 0.99886 * b0 + white * 0.0555179;
      b1 = 0.99332 * b1 + white * 0.0750759;
      b2 = 0.96900 * b2 + white * 0.1538520;
      output[i] = (b0 + b1 + b2) * 0.035; // Suara dengungan sangat halus
    }

    const whiteNoise = this.audioCtx.createBufferSource();
    whiteNoise.buffer = noiseBuffer;
    whiteNoise.loop = true;

    const filter = this.audioCtx.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.setValueAtTime(320, this.audioCtx.currentTime);

    this.humGain = this.audioCtx.createGain();
    this.humGain.gain.setValueAtTime(0.2, this.audioCtx.currentTime);

    whiteNoise.connect(filter);
    filter.connect(this.humGain);
    this.humGain.connect(this.masterGain);
    whiteNoise.start(0);
    this.humSource = whiteNoise;
  }

  // SUARA KETIKAN KEYBOARD MEKANIKAL / LAPTOP
  playKeyClick() {
    if (!this.audioCtx || !this.isPlaying) return;
    const t = this.audioCtx.currentTime;

    const osc = this.audioCtx.createOscillator();
    const gain = this.audioCtx.createGain();
    const filter = this.audioCtx.createBiquadFilter();

    // Frekuensi tuts keyboard (800Hz - 2200Hz)
    const baseFreq = 900 + Math.random() * 900;
    osc.type = "sine";
    osc.frequency.setValueAtTime(baseFreq, t);
    osc.frequency.exponentialRampToValueAtTime(baseFreq * 0.4, t + 0.035);

    filter.type = "bandpass";
    filter.frequency.setValueAtTime(baseFreq, t);
    filter.Q.setValueAtTime(3.0, t);

    // Envelope sangat cepat (klik tuts)
    gain.gain.setValueAtTime(0.08 + Math.random() * 0.06, t);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.04);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);

    osc.start(t);
    osc.stop(t + 0.045);
  }

  // BURST KETIKAN (Orang mengetik kalimat 3-10 ketukan)
  startKeyboardTypingLoop() {
    const doTypingBurst = () => {
      if (!this.isPlaying) return;
      const strokes = Math.floor(Math.random() * 7) + 3;
      for (let i = 0; i < strokes; i++) {
        setTimeout(() => {
          if (this.isPlaying) this.playKeyClick();
        }, i * (75 + Math.random() * 85));
      }

      // Interval jeda antar kalimat berikutnya (0.8s - 3s)
      const nextDelay = 800 + Math.random() * 2200;
      this.typingInterval = setTimeout(doTypingBurst, nextDelay);
    };
    doTypingBurst();
  }

  // SUARA KLIK MOUSE
  playMouseClick() {
    if (!this.audioCtx || !this.isPlaying) return;
    const t = this.audioCtx.currentTime;

    const osc = this.audioCtx.createOscillator();
    const gain = this.audioCtx.createGain();

    osc.type = "triangle";
    osc.frequency.setValueAtTime(2400, t);
    osc.frequency.exponentialRampToValueAtTime(600, t + 0.02);

    gain.gain.setValueAtTime(0.05, t);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.025);

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.start(t);
    osc.stop(t + 0.03);
  }

  startMouseClickLoop() {
    const doMouseClick = () => {
      if (!this.isPlaying) return;
      this.playMouseClick();
      // Dobel klik acak
      if (Math.random() > 0.6) {
        setTimeout(() => this.playMouseClick(), 110);
      }
      const nextDelay = 1500 + Math.random() * 3500;
      this.mouseInterval = setTimeout(doMouseClick, nextDelay);
    };
    doMouseClick();
  }

  // SUARA BISIK / MURMUR OBROLAN KANTOR DI KEJAUHAN (Soft Formant Filter)
  playSoftMurmur() {
    if (!this.audioCtx || !this.isPlaying) return;
    const t = this.audioCtx.currentTime;

    const osc = this.audioCtx.createOscillator();
    const gain = this.audioCtx.createGain();
    const filter = this.audioCtx.createBiquadFilter();

    osc.type = "sawtooth";
    const voicePitch = 120 + Math.random() * 80; // Vokal manusia di kejauhan
    osc.frequency.setValueAtTime(voicePitch, t);
    osc.frequency.linearRampToValueAtTime(voicePitch + (Math.random() * 30 - 15), t + 0.4);

    filter.type = "bandpass";
    filter.frequency.setValueAtTime(450 + Math.random() * 400, t);
    filter.Q.setValueAtTime(4.0, t);

    gain.gain.setValueAtTime(0.0001, t);
    gain.gain.linearRampToValueAtTime(0.012, t + 0.1);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.5);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);

    osc.start(t);
    osc.stop(t + 0.55);
  }

  startOfficeMurmurLoop() {
    const doMurmur = () => {
      if (!this.isPlaying) return;
      if (Math.random() > 0.4) {
        this.playSoftMurmur();
        setTimeout(() => this.playSoftMurmur(), 300);
      }
      const nextDelay = 3000 + Math.random() * 5000;
      this.chatterInterval = setTimeout(doMurmur, nextDelay);
    };
    doMurmur();
  }
}
