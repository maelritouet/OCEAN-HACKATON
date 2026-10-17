export function getSstColor(tempC: number): string {
  if (tempC >= 28.0) return '#be123c';
  if (tempC >= 26.5) return '#e11d48';
  if (tempC >= 24.5) return '#f97316';
  if (tempC >= 22.0) return '#f59e0b';
  if (tempC >= 19.5) return '#eab308';
  if (tempC >= 17.5) return '#10b981';
  return '#0ea5e9';
}

export class UnderwaterAudioEngine {
  ctx: AudioContext | null = null;
  isPlaying = false;
  masterGain: GainNode | null = null;
  pingInterval: ReturnType<typeof setInterval> | null = null;
  whiteNoise: AudioBufferSourceNode | undefined;
  lfo: OscillatorNode | undefined;

  start() {
    if (this.isPlaying) return;
    try {
      const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
      this.ctx = new AudioContext();
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(0.01, this.ctx.currentTime);
      this.masterGain.gain.exponentialRampToValueAtTime(0.18, this.ctx.currentTime + 1.5);
      this.masterGain.connect(this.ctx.destination);

      const bufferSize = 2 * this.ctx.sampleRate;
      const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const output = noiseBuffer.getChannelData(0);
      let lastOut = 0.0;
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        output[i] = (lastOut + 0.02 * white) / 1.02;
        lastOut = output[i];
        output[i] *= 2.5;
      }

      this.whiteNoise = this.ctx.createBufferSource();
      this.whiteNoise.buffer = noiseBuffer;
      this.whiteNoise.loop = true;

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(160, this.ctx.currentTime);

      const lfo = this.ctx.createOscillator();
      lfo.frequency.value = 0.14;
      const lfoGain = this.ctx.createGain();
      lfoGain.gain.value = 70;
      lfo.connect(lfoGain);
      lfoGain.connect(filter.frequency);

      this.whiteNoise.connect(filter);
      filter.connect(this.masterGain);

      this.whiteNoise.start(0);
      lfo.start(0);
      this.lfo = lfo;

      this.pingInterval = setInterval(() => {
        if (!this.ctx || !this.isPlaying || !this.masterGain) return;
        const osc = this.ctx.createOscillator();
        const pingGain = this.ctx.createGain();
        const freqs = [396, 528, 639, 432];
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freqs[Math.floor(Math.random() * freqs.length)], this.ctx.currentTime);
        pingGain.gain.setValueAtTime(0.001, this.ctx.currentTime);
        pingGain.gain.exponentialRampToValueAtTime(0.035, this.ctx.currentTime + 0.4);
        pingGain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + 3.2);
        osc.connect(pingGain);
        pingGain.connect(this.masterGain);
        osc.start();
        osc.stop(this.ctx.currentTime + 3.3);
      }, 5500);

      this.isPlaying = true;
    } catch (e) {
      console.warn('Web Audio API bloquée:', e);
    }
  }

  stop() {
    if (!this.isPlaying) return;
    if (this.pingInterval) clearInterval(this.pingInterval);
    if (this.ctx) this.ctx.close();
    this.isPlaying = false;
  }
}