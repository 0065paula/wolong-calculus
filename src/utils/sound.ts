import type { SoundType } from '../types';

// Sound effect URLs using Web Audio API synthesized sounds
// In a production app, these would be actual audio files

class SoundManager {
  private context: AudioContext | null = null;
  private enabled: boolean = true;
  private volume: number = 0.5;

  constructor() {
    this.enabled = localStorage.getItem('wolong-sound-enabled') !== 'false';
    this.volume = parseFloat(localStorage.getItem('wolong-sound-volume') || '0.5');
  }

  private getContext(): AudioContext {
    if (!this.context) {
      this.context = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    return this.context;
  }

  setEnabled(enabled: boolean): void {
    this.enabled = enabled;
    localStorage.setItem('wolong-sound-enabled', String(enabled));
  }

  setVolume(volume: number): void {
    this.volume = Math.max(0, Math.min(1, volume));
    localStorage.setItem('wolong-sound-volume', String(this.volume));
  }

  play(type: SoundType): void {
    if (!this.enabled) return;

    try {
      const ctx = this.getContext();
      
      switch (type) {
        case 'click':
          this.playTone(ctx, 800, 0.05, 'sine');
          break;
        case 'success':
          this.playArpeggio(ctx, [523.25, 659.25, 783.99, 1046.50], 0.1);
          break;
        case 'error':
          this.playTone(ctx, 200, 0.15, 'sawtooth');
          break;
        case 'merge':
          this.playSweep(ctx, 400, 800, 0.2);
          break;
        case 'split':
          this.playSweep(ctx, 600, 300, 0.15);
          break;
        case 'metal-hit':
          this.playNoise(ctx, 0.1, 'highpass');
          break;
        case 'smoke':
          this.playNoise(ctx, 0.3, 'lowpass');
          break;
        case 'block-stack':
          this.playTone(ctx, 300, 0.08, 'triangle');
          break;
        case 'bridge-creak':
          this.playNoise(ctx, 0.2, 'bandpass');
          break;
        case 'level-complete':
          this.playArpeggio(ctx, [523.25, 659.25, 783.99, 1046.50, 1318.51], 0.15);
          break;
        case 'achievement':
          this.playArpeggio(ctx, [659.25, 783.99, 987.77, 1318.51], 0.2);
          break;
      }
    } catch (error) {
      console.warn('Sound playback failed:', error);
    }
  }

  private playTone(
    ctx: AudioContext,
    frequency: number,
    duration: number,
    type: OscillatorType
  ): void {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    
    osc.type = type;
    osc.frequency.setValueAtTime(frequency, ctx.currentTime);
    
    gain.gain.setValueAtTime(this.volume * 0.3, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + duration);
    
    osc.connect(gain);
    gain.connect(ctx.destination);
    
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + duration);
  }

  private playSweep(
    ctx: AudioContext,
    startFreq: number,
    endFreq: number,
    duration: number
  ): void {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    
    osc.frequency.setValueAtTime(startFreq, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(endFreq, ctx.currentTime + duration);
    
    gain.gain.setValueAtTime(this.volume * 0.3, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + duration);
    
    osc.connect(gain);
    gain.connect(ctx.destination);
    
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + duration);
  }

  private playNoise(
    ctx: AudioContext,
    duration: number,
    filterType: BiquadFilterType
  ): void {
    const bufferSize = ctx.sampleRate * duration;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }
    
    const noise = ctx.createBufferSource();
    noise.buffer = buffer;
    
    const filter = ctx.createBiquadFilter();
    filter.type = filterType;
    filter.frequency.value = 1000;
    
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(this.volume * 0.2, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + duration);
    
    noise.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);
    
    noise.start(ctx.currentTime);
  }

  private playArpeggio(
    ctx: AudioContext,
    frequencies: number[],
    noteDuration: number
  ): void {
    frequencies.forEach((freq, index) => {
      setTimeout(() => {
        this.playTone(ctx, freq, noteDuration, 'sine');
      }, index * noteDuration * 1000);
    });
  }

  // Preload sounds by initializing context
  preload(): void {
    this.getContext();
  }
}

export const soundManager = new SoundManager();
export default soundManager;
