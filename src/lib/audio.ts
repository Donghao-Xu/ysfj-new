let audioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (!audioCtx) {
    const Ctx =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext?: typeof AudioContext })
        .webkitAudioContext;
    if (Ctx) audioCtx = new Ctx();
  }
  if (audioCtx && audioCtx.state === "suspended") {
    void audioCtx.resume();
  }
  return audioCtx;
}

export function playWoodenFishSound(volume = 0.8) {
  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;
  const vol = Math.max(0.03, Math.min(1, volume));

  // Primary hollow camphor-wood resonance
  const bodyOsc = ctx.createOscillator();
  const bodyGain = ctx.createGain();
  bodyOsc.type = "triangle";
  bodyOsc.frequency.setValueAtTime(640, now);
  bodyOsc.frequency.exponentialRampToValueAtTime(295, now + 0.095);

  bodyGain.gain.setValueAtTime(0.001, now);
  bodyGain.gain.linearRampToValueAtTime(0.32 * vol, now + 0.006);
  bodyGain.gain.exponentialRampToValueAtTime(0.001, now + 0.21);

  bodyOsc.connect(bodyGain);
  bodyGain.connect(ctx.destination);
  bodyOsc.start(now);
  bodyOsc.stop(now + 0.23);

  // Subtle mallet-on-wood overtone transient
  const rimOsc = ctx.createOscillator();
  const rimGain = ctx.createGain();
  rimOsc.type = "sine";
  rimOsc.frequency.setValueAtTime(1120, now);
  rimOsc.frequency.exponentialRampToValueAtTime(520, now + 0.045);

  rimGain.gain.setValueAtTime(0.001, now);
  rimGain.gain.linearRampToValueAtTime(0.14 * vol, now + 0.004);
  rimGain.gain.exponentialRampToValueAtTime(0.001, now + 0.07);

  rimOsc.connect(rimGain);
  rimGain.connect(ctx.destination);
  rimOsc.start(now);
  rimOsc.stop(now + 0.08);
}

/**
 * 轻柔檀木念珠拨动声：短促温润、低延迟
 */
export function playBeadClickSound(volume = 0.7) {
  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;
  const vol = Math.max(0.03, Math.min(1, volume));

  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = "sine";
  osc.frequency.setValueAtTime(920, now);
  osc.frequency.exponentialRampToValueAtTime(340, now + 0.038);

  gain.gain.setValueAtTime(0.001, now);
  gain.gain.linearRampToValueAtTime(0.19 * vol, now + 0.003);
  gain.gain.exponentialRampToValueAtTime(0.0008, now + 0.065);

  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start(now);
  osc.stop(now + 0.075);
}

export function playSingingBowlChime(volume = 0.8) {
  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;
  const scale = Math.max(0.05, volume);
  const partials = [
    { freq: 432, amp: 0.22 * scale, decay: 2.8 },
    { freq: 864, amp: 0.08 * scale, decay: 2.0 },
    { freq: 1296, amp: 0.04 * scale, decay: 1.4 },
  ];

  partials.forEach((p) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sine";
    osc.frequency.setValueAtTime(p.freq, now);

    gain.gain.setValueAtTime(0.001, now);
    gain.gain.linearRampToValueAtTime(p.amp, now + 0.03);
    gain.gain.exponentialRampToValueAtTime(0.0008, now + p.decay);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + p.decay + 0.05);
  });
}

export function playTempleBellSound(volume = 0.75) {
  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;
  const scale = Math.max(0.05, volume);
  const partials = [
    { freq: 216, amp: 0.24 * scale, decay: 3.6 },
    { freq: 432, amp: 0.12 * scale, decay: 2.8 },
    { freq: 648, amp: 0.06 * scale, decay: 1.9 },
  ];

  partials.forEach((p) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sine";
    osc.frequency.setValueAtTime(p.freq, now);

    gain.gain.setValueAtTime(0.001, now);
    gain.gain.linearRampToValueAtTime(p.amp, now + 0.04);
    gain.gain.exponentialRampToValueAtTime(0.0006, now + p.decay);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + p.decay + 0.06);
  });
}

export function playJadeChimeSound(volume = 0.75) {
  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;
  const scale = Math.max(0.05, volume);
  const partials = [
    { freq: 528, amp: 0.18 * scale, decay: 2.4 },
    { freq: 1056, amp: 0.07 * scale, decay: 1.8 },
  ];

  partials.forEach((p) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sine";
    osc.frequency.setValueAtTime(p.freq, now);

    gain.gain.setValueAtTime(0.001, now);
    gain.gain.linearRampToValueAtTime(p.amp, now + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0008, now + p.decay);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + p.decay + 0.05);
  });
}

/**
 * 佛殿清磬：清越绵长、平稳收敛
 */
export function playQingBellSound(volume = 0.75) {
  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;
  const scale = Math.max(0.05, volume);
  const partials = [
    { freq: 587, amp: 0.19 * scale, decay: 2.7 },
    { freq: 1174, amp: 0.08 * scale, decay: 1.9 },
    { freq: 1761, amp: 0.03 * scale, decay: 1.2 },
  ];

  partials.forEach((p) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sine";
    osc.frequency.setValueAtTime(p.freq, now);

    gain.gain.setValueAtTime(0.001, now);
    gain.gain.linearRampToValueAtTime(p.amp, now + 0.018);
    gain.gain.exponentialRampToValueAtTime(0.0007, now + p.decay);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + p.decay + 0.05);
  });
}

export function playBellByType(
  bellType: "temple-bell" | "singing-bowl" | "jade-chime" | "qing-bell" | "none",
  volume = 0.75,
) {
  if (bellType === "none") return;
  if (bellType === "temple-bell") playTempleBellSound(volume);
  else if (bellType === "jade-chime") playJadeChimeSound(volume);
  else if (bellType === "qing-bell") playQingBellSound(volume);
  else playSingingBowlChime(volume);
}

export type NatureSoundType =
  | "wind"
  | "rain"
  | "bamboo-rain"
  | "stream"
  | "lake"
  | "pine"
  | "birds"
  | "night"
  | "temple"
  | "daoist";

const SOUND_GAIN_MULT: Record<NatureSoundType, number> = {
  wind: 0.42,
  pine: 0.4,
  rain: 0.36,
  "bamboo-rain": 0.34,
  stream: 0.42,
  lake: 0.38,
  birds: 0.28,
  night: 0.26,
  temple: 0.3,
  daoist: 0.32,
};

class NatureSoundEngine {
  private sourceNode: AudioBufferSourceNode | null = null;
  private droneOsc: OscillatorNode | null = null;
  private droneGain: GainNode | null = null;
  private masterGain: GainNode | null = null;
  private lfoNode: OscillatorNode | null = null;
  private accentTimer: number | null = null;
  private activeType: NatureSoundType | null = null;
  private playToken = 0;

  getActiveType(): NatureSoundType | null {
    return this.activeType;
  }

  start(type: NatureSoundType, volume = 0.5) {
    this.stop();
    const ctx = getAudioContext();
    if (!ctx) return;

    this.playToken += 1;
    const token = this.playToken;
    this.activeType = type;

    const bufferSize = ctx.sampleRate * 4;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);

    let lastOut = 0;
    const smoothFactor =
      type === "rain" || type === "bamboo-rain"
        ? 0.055
        : type === "lake" || type === "night"
          ? 0.018
          : 0.028;

    for (let i = 0; i < bufferSize; i += 1) {
      const white = Math.random() * 2 - 1;
      lastOut = (lastOut + smoothFactor * white) / (1 + smoothFactor);
      data[i] = lastOut * (smoothFactor < 0.03 ? 3.1 : 2.1);
    }

    const noise = ctx.createBufferSource();
    noise.buffer = buffer;
    noise.loop = true;

    const filter = ctx.createBiquadFilter();
    const gain = ctx.createGain();
    const mult = SOUND_GAIN_MULT[type] ?? 0.38;
    const targetGain = Math.max(0.008, Math.min(1, volume) * mult);

    // Smooth fade-in to avoid abrupt clicks during scene switches
    gain.gain.setValueAtTime(0.001, ctx.currentTime);
    gain.gain.setTargetAtTime(targetGain, ctx.currentTime, 0.32);

    if (type === "wind" || type === "daoist") {
      filter.type = "lowpass";
      filter.frequency.setValueAtTime(type === "daoist" ? 340 : 380, ctx.currentTime);
      const lfo = ctx.createOscillator();
      const lfoGain = ctx.createGain();
      lfo.frequency.setValueAtTime(type === "daoist" ? 0.11 : 0.14, ctx.currentTime);
      lfoGain.gain.setValueAtTime(165, ctx.currentTime);
      lfo.connect(lfoGain);
      lfoGain.connect(filter.frequency);
      lfo.start();
      this.lfoNode = lfo;
    } else if (type === "pine") {
      filter.type = "bandpass";
      filter.frequency.setValueAtTime(490, ctx.currentTime);
      filter.Q.setValueAtTime(0.75, ctx.currentTime);
      const lfo = ctx.createOscillator();
      const lfoGain = ctx.createGain();
      lfo.frequency.setValueAtTime(0.16, ctx.currentTime);
      lfoGain.gain.setValueAtTime(210, ctx.currentTime);
      lfo.connect(lfoGain);
      lfoGain.connect(filter.frequency);
      lfo.start();
      this.lfoNode = lfo;
    } else if (type === "rain" || type === "bamboo-rain") {
      filter.type = "bandpass";
      filter.frequency.setValueAtTime(type === "bamboo-rain" ? 1280 : 1120, ctx.currentTime);
      filter.Q.setValueAtTime(0.65, ctx.currentTime);
      if (type === "bamboo-rain") {
        this.scheduleDropletPlink(volume, token);
      }
    } else if (type === "stream") {
      filter.type = "bandpass";
      filter.frequency.setValueAtTime(600, ctx.currentTime);
      filter.Q.setValueAtTime(1.05, ctx.currentTime);
      const lfo = ctx.createOscillator();
      const lfoGain = ctx.createGain();
      lfo.frequency.setValueAtTime(0.36, ctx.currentTime);
      lfoGain.gain.setValueAtTime(150, ctx.currentTime);
      lfo.connect(lfoGain);
      lfoGain.connect(filter.frequency);
      lfo.start();
      this.lfoNode = lfo;
    } else if (type === "lake") {
      filter.type = "lowpass";
      filter.frequency.setValueAtTime(260, ctx.currentTime);
      const lfo = ctx.createOscillator();
      const lfoGain = ctx.createGain();
      lfo.frequency.setValueAtTime(0.18, ctx.currentTime);
      lfoGain.gain.setValueAtTime(95, ctx.currentTime);
      lfo.connect(lfoGain);
      lfoGain.connect(filter.frequency);
      lfo.start();
      this.lfoNode = lfo;
    } else if (type === "night") {
      filter.type = "lowpass";
      filter.frequency.setValueAtTime(210, ctx.currentTime);
      this.scheduleNightShimmer(volume, token);
    } else if (type === "temple") {
      filter.type = "lowpass";
      filter.frequency.setValueAtTime(300, ctx.currentTime);
      // Warm gentle monastery low drone undertone
      const drone = ctx.createOscillator();
      const dGain = ctx.createGain();
      drone.type = "sine";
      drone.frequency.setValueAtTime(144, ctx.currentTime);
      dGain.gain.setValueAtTime(0.001, ctx.currentTime);
      dGain.gain.setTargetAtTime(Math.max(0.004, volume * 0.04), ctx.currentTime, 0.5);
      drone.connect(dGain);
      dGain.connect(ctx.destination);
      drone.start();
      this.droneOsc = drone;
      this.droneGain = dGain;
    } else {
      // birds
      filter.type = "lowpass";
      filter.frequency.setValueAtTime(310, ctx.currentTime);
      this.scheduleBirdChirp(volume, token);
    }

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);
    noise.start();

    this.sourceNode = noise;
    this.masterGain = gain;
  }

  private scheduleDropletPlink(volume: number, token: number) {
    if (this.playToken !== token || this.activeType !== "bamboo-rain") return;
    const delay = 420 + Math.random() * 1450;
    this.accentTimer = window.setTimeout(() => {
      if (this.playToken !== token || this.activeType !== "bamboo-rain") return;
      const ctx = getAudioContext();
      if (ctx) {
        const now = ctx.currentTime;
        const osc = ctx.createOscillator();
        const g = ctx.createGain();
        const f = 1350 + Math.random() * 850;
        osc.type = "sine";
        osc.frequency.setValueAtTime(f, now);
        osc.frequency.exponentialRampToValueAtTime(f * 1.18, now + 0.045);

        g.gain.setValueAtTime(0.001, now);
        g.gain.linearRampToValueAtTime(0.035 * Math.max(0.1, volume), now + 0.006);
        g.gain.exponentialRampToValueAtTime(0.0005, now + 0.08);

        osc.connect(g);
        g.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.09);
      }
      this.scheduleDropletPlink(volume, token);
    }, delay);
  }

  private scheduleNightShimmer(volume: number, token: number) {
    if (this.playToken !== token || this.activeType !== "night") return;
    const delay = 3600 + Math.random() * 4400;
    this.accentTimer = window.setTimeout(() => {
      if (this.playToken !== token || this.activeType !== "night") return;
      const ctx = getAudioContext();
      if (ctx) {
        const now = ctx.currentTime;
        const osc = ctx.createOscillator();
        const g = ctx.createGain();
        osc.type = "sine";
        osc.frequency.setValueAtTime(792, now);
        g.gain.setValueAtTime(0.0005, now);
        g.gain.linearRampToValueAtTime(0.028 * Math.max(0.1, volume), now + 0.12);
        g.gain.exponentialRampToValueAtTime(0.0004, now + 1.4);
        osc.connect(g);
        g.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 1.45);
      }
      this.scheduleNightShimmer(volume, token);
    }, delay);
  }

  private scheduleBirdChirp(volume: number, token: number) {
    if (this.playToken !== token || this.activeType !== "birds") return;
    const delay = 2200 + Math.random() * 3400;
    this.accentTimer = window.setTimeout(() => {
      if (this.playToken !== token || this.activeType !== "birds") return;
      const ctx = getAudioContext();
      if (ctx) {
        const now = ctx.currentTime;
        const baseFreq = 1850 + Math.random() * 750;
        const osc = ctx.createOscillator();
        const g = ctx.createGain();
        osc.type = "sine";
        osc.frequency.setValueAtTime(baseFreq, now);
        osc.frequency.exponentialRampToValueAtTime(baseFreq * 1.24, now + 0.08);
        osc.frequency.exponentialRampToValueAtTime(baseFreq * 0.92, now + 0.16);

        g.gain.setValueAtTime(0.001, now);
        g.gain.linearRampToValueAtTime(0.055 * Math.max(0.1, volume), now + 0.03);
        g.gain.exponentialRampToValueAtTime(0.0005, now + 0.18);

        osc.connect(g);
        g.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.2);
      }
      this.scheduleBirdChirp(volume, token);
    }, delay);
  }

  setVolume(volume: number) {
    const ctx = getAudioContext();
    if (!ctx) return;
    if (this.masterGain && this.activeType) {
      const mult = SOUND_GAIN_MULT[this.activeType] ?? 0.38;
      this.masterGain.gain.setTargetAtTime(
        Math.max(0.001, Math.min(1, volume) * mult),
        ctx.currentTime,
        0.1,
      );
    }
    if (this.droneGain) {
      this.droneGain.gain.setTargetAtTime(
        Math.max(0.001, Math.min(1, volume) * 0.04),
        ctx.currentTime,
        0.1,
      );
    }
  }

  stop() {
    this.playToken += 1;
    this.activeType = null;
    if (this.accentTimer !== null) {
      window.clearTimeout(this.accentTimer);
      this.accentTimer = null;
    }

    const oldSource = this.sourceNode;
    const oldLfo = this.lfoNode;
    const oldGain = this.masterGain;
    const oldDrone = this.droneOsc;
    const oldDroneGain = this.droneGain;

    this.sourceNode = null;
    this.lfoNode = null;
    this.masterGain = null;
    this.droneOsc = null;
    this.droneGain = null;

    const ctx = getAudioContext();
    if (ctx && (oldGain || oldDroneGain)) {
      const now = ctx.currentTime;
      try {
        oldGain?.gain.setTargetAtTime(0.0005, now, 0.06);
        oldDroneGain?.gain.setTargetAtTime(0.0005, now, 0.06);
      } catch {
        // ignore
      }
      window.setTimeout(() => {
        try {
          oldSource?.stop();
          oldSource?.disconnect();
        } catch {
          // ignore
        }
        try {
          oldLfo?.stop();
          oldLfo?.disconnect();
        } catch {
          // ignore
        }
        try {
          oldDrone?.stop();
          oldDrone?.disconnect();
        } catch {
          // ignore
        }
        try {
          oldGain?.disconnect();
          oldDroneGain?.disconnect();
        } catch {
          // ignore
        }
      }, 160);
      return;
    }

    try {
      oldSource?.stop();
      oldSource?.disconnect();
      oldLfo?.stop();
      oldLfo?.disconnect();
      oldDrone?.stop();
      oldDrone?.disconnect();
      oldGain?.disconnect();
      oldDroneGain?.disconnect();
    } catch {
      // ignore
    }
  }
}

export const natureAudio = new NatureSoundEngine();
