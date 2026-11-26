export type NatureSoundType =
  | "wind"
  | "rain"
  | "bamboo-rain"
  | "stream"
  | "lake"
  | "pine"
  | "birds"
  | "night"
  | "clouds"
  | "temple"
  | "daoist";

export type ReligiousAudioType = "none" | "buddhist" | "daoist";

export type RetreatMusicTrackId =
  | "none"
  | "guqin-zen"
  | "minimal-pad"
  | "mountain-stream-score"
  | "sleep-drift";

export type SoundLayerKey =
  | "ambient"
  | "music"
  | "religious"
  | "sfx"
  | "spatial";

export type SoundLayerConfig = {
  enabled: boolean;
  volume: number; // 0..1
};

export type SoundMixerState = {
  masterMuted: boolean;
  layers: Record<SoundLayerKey, SoundLayerConfig>;
  musicTrackId: RetreatMusicTrackId;
};

export type SceneAudioProfile = {
  ambient: NatureSoundType | null;
  religious: ReligiousAudioType;
  music?: RetreatMusicTrackId | null;
};

export type SpatialAudioCue =
  | "footstep"
  | "gate-pass"
  | "hall-enter"
  | "hall-exit"
  | "wind-chime"
  | "distant-bell"
  | "transition-glide";

export type SfxAudioCue =
  | "woodfish"
  | "beads"
  | "singing-bowl"
  | "temple-bell"
  | "jade-chime"
  | "qing-bell"
  | "incense"
  | "lamp"
  | "flower"
  | "bow"
  | "ui-tap"
  | "complete";

export const RETREAT_MUSIC_LIBRARY: {
  id: RetreatMusicTrackId;
  label: string;
  desc: string;
  tradition: "all" | "buddhist" | "daoist" | "nature";
}[] = [
  {
    id: "none",
    label: "纯自然声景（无配乐）",
    desc: "仅保留自然环境与建筑氛围声",
    tradition: "all",
  },
  {
    id: "guqin-zen",
    label: "空山古琴 · 五音泛音",
    desc: "原创羽调式轻拨泛音，疏朗清雅",
    tradition: "all",
  },
  {
    id: "minimal-pad",
    label: "极简净心 · 长韵铺底",
    desc: "低频温暖缓息和弦，安顿纷扰",
    tradition: "all",
  },
  {
    id: "mountain-stream-score",
    label: "山林清籁 · 漫游长曲",
    desc: "松风流水间稀疏铃音与缓拍",
    tradition: "nature",
  },
  {
    id: "sleep-drift",
    label: "夜静安神 · 眠境微澜",
    desc: "极缓 432Hz 柔波，适合睡前静息",
    tradition: "all",
  },
];

export const SOUND_LAYER_META: {
  key: SoundLayerKey;
  label: string;
  shortDesc: string;
}[] = [
  { key: "ambient", label: "自然环境音", shortDesc: "风声、松涛、雨声、溪流、鸟鸣" },
  { key: "religious", label: "宗教氛围音", shortDesc: "佛境与道境严格独立的场域共鸣" },
  { key: "music", label: "静修背景音乐", shortDesc: "古琴五音、极简缓韵与自然长曲" },
  { key: "sfx", label: "互动音效", shortDesc: "木鱼、念珠、上香、点灯与礼敬反馈" },
  { key: "spatial", label: "空间漫游音", shortDesc: "脚步声、门廊穿梭与远近钟磬" },
];

const SOUND_GAIN_MULT: Record<NatureSoundType, number> = {
  wind: 0.42,
  pine: 0.4,
  rain: 0.36,
  "bamboo-rain": 0.34,
  stream: 0.42,
  lake: 0.38,
  clouds: 0.34,
  birds: 0.28,
  night: 0.26,
  temple: 0.3,
  daoist: 0.32,
};

export const DEFAULT_SOUND_MIXER_STATE: SoundMixerState = {
  masterMuted: false,
  layers: {
    ambient: { enabled: true, volume: 0.72 },
    religious: { enabled: true, volume: 0.65 },
    music: { enabled: true, volume: 0.48 },
    sfx: { enabled: true, volume: 0.8 },
    spatial: { enabled: true, volume: 0.68 },
  },
  musicTrackId: "guqin-zen",
};

class UnifiedSoundManager {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private layerGains: Partial<Record<SoundLayerKey, GainNode>> = {};
  private state: SoundMixerState = {
    masterMuted: DEFAULT_SOUND_MIXER_STATE.masterMuted,
    layers: {
      ambient: { ...DEFAULT_SOUND_MIXER_STATE.layers.ambient },
      religious: { ...DEFAULT_SOUND_MIXER_STATE.layers.religious },
      music: { ...DEFAULT_SOUND_MIXER_STATE.layers.music },
      sfx: { ...DEFAULT_SOUND_MIXER_STATE.layers.sfx },
      spatial: { ...DEFAULT_SOUND_MIXER_STATE.layers.spatial },
    },
    musicTrackId: DEFAULT_SOUND_MIXER_STATE.musicTrackId,
  };

  // L1 Ambient handles
  private ambientToken = 0;
  private activeAmbientType: NatureSoundType | null = null;
  private ambientOverrideVolume: number | null = null;
  private ambientSource: AudioBufferSourceNode | null = null;
  private ambientLfo: OscillatorNode | null = null;
  private ambientGain: GainNode | null = null;
  private ambientTimer: number | null = null;

  // L2 Religious atmosphere handles (strictly separated: Buddhist vs Daoist)
  private religiousToken = 0;
  private activeReligiousType: ReligiousAudioType = "none";
  private religiousOscs: OscillatorNode[] = [];
  private religiousGain: GainNode | null = null;
  private religiousTimer: number | null = null;

  // L3 Music engine handles
  private musicToken = 0;
  private activeMusicTrack: RetreatMusicTrackId = "none";
  private musicActiveFlag = false;
  private musicOscs: OscillatorNode[] = [];
  private musicGain: GainNode | null = null;
  private musicTimer: number | null = null;

  private listeners = new Set<() => void>();
  private unlockBound = false;

  constructor() {
    if (typeof window !== "undefined") {
      this.bindAutoUnlock();
    }
  }

  private bindAutoUnlock() {
    if (this.unlockBound) return;
    this.unlockBound = true;
    const unlock = () => {
      if (this.ctx && this.ctx.state === "suspended") {
        void this.ctx.resume();
      }
    };
    window.addEventListener("pointerdown", unlock, { passive: true });
    window.addEventListener("keydown", unlock, { passive: true });
  }

  subscribe(listener: () => void) {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notify() {
    this.listeners.forEach((fn) => fn());
  }

  private ensureGraph(): AudioContext | null {
    if (typeof window === "undefined") return null;
    if (!this.ctx) {
      const Ctx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext?: typeof AudioContext })
          .webkitAudioContext;
      if (!Ctx) return null;
      this.ctx = new Ctx();
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(
        this.state.masterMuted ? 0 : 1,
        this.ctx.currentTime,
      );
      this.masterGain.connect(this.ctx.destination);

      (Object.keys(this.state.layers) as SoundLayerKey[]).forEach((key) => {
        if (!this.ctx || !this.masterGain) return;
        const g = this.ctx.createGain();
        const cfg = this.state.layers[key];
        g.gain.setValueAtTime(
          cfg.enabled ? cfg.volume : 0,
          this.ctx.currentTime,
        );
        g.connect(this.masterGain);
        this.layerGains[key] = g;
      });
    }
    if (this.ctx.state === "suspended") {
      void this.ctx.resume();
    }
    return this.ctx;
  }

  private getLayerDestination(layer: SoundLayerKey): AudioNode | null {
    const ctx = this.ensureGraph();
    if (!ctx) return null;
    return this.layerGains[layer] ?? this.masterGain ?? ctx.destination;
  }

  getState(): SoundMixerState {
    return this.state;
  }

  getActiveStatus() {
    return {
      ambient: this.activeAmbientType,
      religious: this.activeReligiousType,
      music: this.musicActiveFlag ? this.activeMusicTrack : ("none" as const),
      masterMuted: this.state.masterMuted,
    };
  }

  syncMixerState(next: Partial<SoundMixerState>) {
    const prevMuted = this.state.masterMuted;
    const prevTrack = this.state.musicTrackId;
    if (typeof next.masterMuted === "boolean") {
      this.state.masterMuted = next.masterMuted;
    }
    if (next.layers) {
      (Object.keys(next.layers) as SoundLayerKey[]).forEach((key) => {
        const incoming = next.layers?.[key];
        if (incoming) {
          this.state.layers[key] = {
            enabled: Boolean(incoming.enabled),
            volume: Math.max(0, Math.min(1, incoming.volume)),
          };
        }
      });
    }
    if (next.musicTrackId) {
      this.state.musicTrackId = next.musicTrackId;
    }

    if (this.ctx && this.masterGain) {
      const now = this.ctx.currentTime;
      if (prevMuted !== this.state.masterMuted) {
        this.masterGain.gain.setTargetAtTime(
          this.state.masterMuted ? 0 : 1,
          now,
          0.08,
        );
      }
      (Object.keys(this.state.layers) as SoundLayerKey[]).forEach((key) => {
        const node = this.layerGains[key];
        if (!node) return;
        const cfg = this.state.layers[key];
        node.gain.setTargetAtTime(cfg.enabled ? cfg.volume : 0, now, 0.1);
      });
    }

    if (this.musicActiveFlag && prevTrack !== this.state.musicTrackId) {
      this.startMusic(this.state.musicTrackId);
    }

    this.notify();
  }

  isLayerAudible(layer: SoundLayerKey): boolean {
    if (this.state.masterMuted) return false;
    const cfg = this.state.layers[layer];
    return cfg.enabled && cfg.volume > 0.01;
  }

  // ==================== Unified Scene Crossfade Controller ====================
  applySceneProfile(
    profile: SceneAudioProfile,
    options?: { startIfUnlocked?: boolean },
  ) {
    if (options?.startIfUnlocked) {
      if (profile.ambient) {
        this.startAmbient(profile.ambient);
      } else {
        this.stopAmbient();
      }
      this.startReligiousAtmosphere(profile.religious);
      if (profile.music !== undefined) {
        const track = profile.music ?? this.state.musicTrackId;
        if (track && track !== "none") {
          this.startMusic(track);
        } else {
          this.stopMusic();
        }
      }
    } else {
      // Smooth switch ONLY for already active streams (respecting non-autoplay defaults)
      if (this.activeAmbientType && profile.ambient) {
        this.startAmbient(profile.ambient);
      }
      if (this.activeReligiousType !== "none" && profile.religious !== "none") {
        this.startReligiousAtmosphere(profile.religious);
      } else if (profile.religious === "none") {
        this.stopReligiousAtmosphere();
      }
    }
  }

  // ==================== L1: Natural Ambient Engine ====================
  startAmbient(type: NatureSoundType, overrideVol?: number) {
    if (
      this.activeAmbientType === type &&
      this.sourceRunning() &&
      overrideVol === undefined
    ) {
      return;
    }

    this.stopAmbient();
    const ctx = this.ensureGraph();
    const dest = this.getLayerDestination("ambient");
    if (!ctx || !dest) return;

    this.ambientToken += 1;
    const token = this.ambientToken;
    this.activeAmbientType = type;
    this.ambientOverrideVolume =
      typeof overrideVol === "number"
        ? Math.max(0.02, Math.min(1, overrideVol))
        : null;

    const bufferSize = ctx.sampleRate * 4;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);

    let lastOut = 0;
    const smoothFactor =
      type === "rain" || type === "bamboo-rain"
        ? 0.055
        : type === "lake" || type === "night" || type === "clouds"
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
    const mult = SOUND_GAIN_MULT[type] ?? 0.36;
    const localScale = this.ambientOverrideVolume ?? 1;
    const targetGain = Math.max(0.008, localScale * mult);

    gain.gain.setValueAtTime(0.0008, ctx.currentTime);
    gain.gain.setTargetAtTime(targetGain, ctx.currentTime, 0.42);

    if (type === "wind" || type === "daoist" || type === "clouds") {
      filter.type = "lowpass";
      filter.frequency.setValueAtTime(
        type === "clouds" ? 290 : type === "daoist" ? 330 : 380,
        ctx.currentTime,
      );
      const lfo = ctx.createOscillator();
      const lfoGain = ctx.createGain();
      lfo.frequency.setValueAtTime(
        type === "clouds" ? 0.09 : type === "daoist" ? 0.11 : 0.14,
        ctx.currentTime,
      );
      lfoGain.gain.setValueAtTime(145, ctx.currentTime);
      lfo.connect(lfoGain);
      lfoGain.connect(filter.frequency);
      lfo.start();
      this.ambientLfo = lfo;
    } else if (type === "pine") {
      filter.type = "bandpass";
      filter.frequency.setValueAtTime(490, ctx.currentTime);
      filter.Q.setValueAtTime(0.75, ctx.currentTime);
      const lfo = ctx.createOscillator();
      const lfoGain = ctx.createGain();
      lfo.frequency.setValueAtTime(0.16, ctx.currentTime);
      lfoGain.gain.setValueAtTime(200, ctx.currentTime);
      lfo.connect(lfoGain);
      lfoGain.connect(filter.frequency);
      lfo.start();
      this.ambientLfo = lfo;
    } else if (type === "rain" || type === "bamboo-rain") {
      filter.type = "bandpass";
      filter.frequency.setValueAtTime(
        type === "bamboo-rain" ? 1280 : 1100,
        ctx.currentTime,
      );
      filter.Q.setValueAtTime(0.65, ctx.currentTime);
      if (type === "bamboo-rain") {
        this.scheduleAmbientAccent("bamboo-rain", token);
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
      this.ambientLfo = lfo;
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
      this.ambientLfo = lfo;
    } else if (type === "night") {
      filter.type = "lowpass";
      filter.frequency.setValueAtTime(210, ctx.currentTime);
      this.scheduleAmbientAccent("night", token);
    } else if (type === "temple") {
      filter.type = "lowpass";
      filter.frequency.setValueAtTime(300, ctx.currentTime);
    } else {
      filter.type = "lowpass";
      filter.frequency.setValueAtTime(310, ctx.currentTime);
      this.scheduleAmbientAccent("birds", token);
    }

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(dest);
    noise.start();

    this.ambientSource = noise;
    this.ambientGain = gain;
    this.notify();
  }

  private sourceRunning(): boolean {
    return this.ambientSource !== null;
  }

  private scheduleAmbientAccent(
    kind: "bamboo-rain" | "night" | "birds",
    token: number,
  ) {
    if (this.ambientToken !== token) return;
    const delay =
      kind === "bamboo-rain"
        ? 480 + Math.random() * 1450
        : kind === "night"
          ? 3600 + Math.random() * 4400
          : 2300 + Math.random() * 3400;

    this.ambientTimer = window.setTimeout(() => {
      if (this.ambientToken !== token) return;
      const ctx = this.ctx;
      const dest = this.getLayerDestination("ambient");
      if (ctx && dest) {
        const now = ctx.currentTime;
        const osc = ctx.createOscillator();
        const g = ctx.createGain();
        osc.type = "sine";

        if (kind === "bamboo-rain") {
          const f = 1350 + Math.random() * 820;
          osc.frequency.setValueAtTime(f, now);
          osc.frequency.exponentialRampToValueAtTime(f * 1.18, now + 0.045);
          g.gain.setValueAtTime(0.001, now);
          g.gain.linearRampToValueAtTime(0.036, now + 0.006);
          g.gain.exponentialRampToValueAtTime(0.0005, now + 0.085);
          osc.connect(g);
          g.connect(dest);
          osc.start(now);
          osc.stop(now + 0.09);
        } else if (kind === "night") {
          osc.frequency.setValueAtTime(792, now);
          g.gain.setValueAtTime(0.0005, now);
          g.gain.linearRampToValueAtTime(0.025, now + 0.12);
          g.gain.exponentialRampToValueAtTime(0.0004, now + 1.4);
          osc.connect(g);
          g.connect(dest);
          osc.start(now);
          osc.stop(now + 1.45);
        } else {
          const baseFreq = 1850 + Math.random() * 750;
          osc.frequency.setValueAtTime(baseFreq, now);
          osc.frequency.exponentialRampToValueAtTime(
            baseFreq * 1.24,
            now + 0.08,
          );
          osc.frequency.exponentialRampToValueAtTime(
            baseFreq * 0.92,
            now + 0.16,
          );
          g.gain.setValueAtTime(0.001, now);
          g.gain.linearRampToValueAtTime(0.052, now + 0.03);
          g.gain.exponentialRampToValueAtTime(0.0005, now + 0.18);
          osc.connect(g);
          g.connect(dest);
          osc.start(now);
          osc.stop(now + 0.2);
        }
      }
      this.scheduleAmbientAccent(kind, token);
    }, delay);
  }

  setAmbientOverrideVolume(volume: number) {
    this.ambientOverrideVolume = Math.max(0.02, Math.min(1, volume));
    if (this.ctx && this.ambientGain && this.activeAmbientType) {
      const mult = SOUND_GAIN_MULT[this.activeAmbientType] ?? 0.36;
      this.ambientGain.gain.setTargetAtTime(
        Math.max(0.002, this.ambientOverrideVolume * mult),
        this.ctx.currentTime,
        0.12,
      );
    }
  }

  stopAmbient() {
    this.ambientToken += 1;
    this.activeAmbientType = null;
    if (this.ambientTimer !== null) {
      window.clearTimeout(this.ambientTimer);
      this.ambientTimer = null;
    }

    const oldSource = this.ambientSource;
    const oldLfo = this.ambientLfo;
    const oldGain = this.ambientGain;

    this.ambientSource = null;
    this.ambientLfo = null;
    this.ambientGain = null;

    if (this.ctx && oldGain) {
      const now = this.ctx.currentTime;
      try {
        oldGain.gain.setTargetAtTime(0.0004, now, 0.08);
      } catch {
        // ignore
      }
      window.setTimeout(() => {
        try {
          oldSource?.stop();
          oldSource?.disconnect();
          oldLfo?.stop();
          oldLfo?.disconnect();
          oldGain.disconnect();
        } catch {
          // ignore
        }
      }, 220);
    } else {
      try {
        oldSource?.stop();
        oldSource?.disconnect();
        oldLfo?.stop();
        oldLfo?.disconnect();
        oldGain?.disconnect();
      } catch {
        // ignore
      }
    }
    this.notify();
  }

  // ==================== L2: Religious Atmosphere (Strict Tradition Isolation) ====================
  startReligiousAtmosphere(tradition: ReligiousAudioType) {
    if (tradition === "none") {
      this.stopReligiousAtmosphere();
      return;
    }
    if (this.activeReligiousType === tradition && this.religiousGain) {
      return;
    }

    this.stopReligiousAtmosphere();
    const ctx = this.ensureGraph();
    const dest = this.getLayerDestination("religious");
    if (!ctx || !dest) return;

    this.religiousToken += 1;
    const token = this.religiousToken;
    this.activeReligiousType = tradition;

    const groupGain = ctx.createGain();
    groupGain.gain.setValueAtTime(0.0006, ctx.currentTime);
    groupGain.gain.setTargetAtTime(1, ctx.currentTime, 0.55);
    groupGain.connect(dest);
    this.religiousGain = groupGain;

    const freqs =
      tradition === "buddhist"
        ? [108, 216, 324] // Warm Buddhist hall fundamental 108Hz + soft harmonics
        : [132, 264, 396]; // Clear mountain-courtyard Daoist quintessence

    freqs.forEach((f, idx) => {
      const osc = ctx.createOscillator();
      const g = ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(f, ctx.currentTime);
      g.gain.setValueAtTime(
        idx === 0 ? 0.055 : idx === 1 ? 0.025 : 0.01,
        ctx.currentTime,
      );
      osc.connect(g);
      g.connect(groupGain);
      osc.start();
      this.religiousOscs.push(osc);
    });

    this.scheduleReligiousChime(tradition, token);
    this.notify();
  }

  private scheduleReligiousChime(
    tradition: Exclude<ReligiousAudioType, "none">,
    token: number,
  ) {
    if (this.religiousToken !== token) return;
    const delay = 6800 + Math.random() * 6200;
    this.religiousTimer = window.setTimeout(() => {
      if (this.religiousToken !== token) return;
      const ctx = this.ctx;
      const dest = this.getLayerDestination("religious");
      if (ctx && dest) {
        const now = ctx.currentTime;
        const base = tradition === "buddhist" ? 432 : 528;
        [1, 2].forEach((mult, idx) => {
          const osc = ctx.createOscillator();
          const g = ctx.createGain();
          osc.type = "sine";
          osc.frequency.setValueAtTime(base * mult, now);
          g.gain.setValueAtTime(0.0008, now);
          g.gain.linearRampToValueAtTime(idx === 0 ? 0.055 : 0.018, now + 0.04);
          g.gain.exponentialRampToValueAtTime(0.0005, now + 3.1);
          osc.connect(g);
          g.connect(dest);
          osc.start(now);
          osc.stop(now + 3.2);
        });
      }
      this.scheduleReligiousChime(tradition, token);
    }, delay);
  }

  stopReligiousAtmosphere() {
    this.religiousToken += 1;
    this.activeReligiousType = "none";
    if (this.religiousTimer !== null) {
      window.clearTimeout(this.religiousTimer);
      this.religiousTimer = null;
    }

    const oldOscs = this.religiousOscs;
    const oldGain = this.religiousGain;
    this.religiousOscs = [];
    this.religiousGain = null;

    if (this.ctx && oldGain) {
      try {
        oldGain.gain.setTargetAtTime(0.0004, this.ctx.currentTime, 0.12);
      } catch {
        // ignore
      }
      window.setTimeout(() => {
        oldOscs.forEach((o) => {
          try {
            o.stop();
            o.disconnect();
          } catch {
            // ignore
          }
        });
        try {
          oldGain.disconnect();
        } catch {
          // ignore
        }
      }, 280);
    }
    this.notify();
  }

  // ==================== L3: Retreat / Background Music Library ====================
  startMusic(trackId?: RetreatMusicTrackId) {
    const targetTrack = trackId ?? this.state.musicTrackId;
    if (targetTrack === "none") {
      this.stopMusic();
      return;
    }
    if (this.musicActiveFlag && this.activeMusicTrack === targetTrack) {
      return;
    }

    this.stopMusic();
    const ctx = this.ensureGraph();
    const dest = this.getLayerDestination("music");
    if (!ctx || !dest) return;

    this.musicToken += 1;
    const token = this.musicToken;
    this.activeMusicTrack = targetTrack;
    this.musicActiveFlag = true;

    const groupGain = ctx.createGain();
    groupGain.gain.setValueAtTime(0.0005, ctx.currentTime);
    groupGain.gain.setTargetAtTime(1, ctx.currentTime, 0.65);
    groupGain.connect(dest);
    this.musicGain = groupGain;

    // Warm harmonic foundation per track
    const droneFreqs =
      targetTrack === "sleep-drift"
        ? [108, 162]
        : targetTrack === "minimal-pad"
          ? [130.81, 196, 261.63] // C3-G3-C4 warm fifth
          : [146.83, 220]; // D3-A3 open guqin fifth

    droneFreqs.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const g = ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(freq, ctx.currentTime);
      g.gain.setValueAtTime(idx === 0 ? 0.05 : 0.025, ctx.currentTime);
      osc.connect(g);
      g.connect(groupGain);
      osc.start();
      this.musicOscs.push(osc);
    });

    if (
      targetTrack === "guqin-zen" ||
      targetTrack === "mountain-stream-score"
    ) {
      this.schedulePentatonicNote(targetTrack, token);
    }

    this.notify();
  }

  private schedulePentatonicNote(
    track: "guqin-zen" | "mountain-stream-score",
    token: number,
  ) {
    if (this.musicToken !== token || !this.musicActiveFlag) return;
    // Traditional Chinese Yu / Zhi pentatonic frequencies (D4, F4, G4, A4, C5, D5, F5)
    const scale =
      track === "guqin-zen"
        ? [293.66, 329.63, 392.0, 440.0, 523.25, 587.33]
        : [392.0, 440.0, 523.25, 587.33, 659.25, 783.99];
    const delay =
      track === "guqin-zen"
        ? 1900 + Math.random() * 2100
        : 2400 + Math.random() * 2600;

    this.musicTimer = window.setTimeout(() => {
      if (this.musicToken !== token || !this.musicActiveFlag) return;
      const ctx = this.ctx;
      const dest = this.musicGain;
      if (ctx && dest) {
        const now = ctx.currentTime;
        const noteFreq = scale[Math.floor(Math.random() * scale.length)];
        const osc = ctx.createOscillator();
        const overtone = ctx.createOscillator();
        const g = ctx.createGain();

        osc.type = "sine";
        osc.frequency.setValueAtTime(noteFreq, now);
        overtone.type = "sine";
        overtone.frequency.setValueAtTime(noteFreq * 2, now);

        const otGain = ctx.createGain();
        otGain.gain.setValueAtTime(0.18, now);

        g.gain.setValueAtTime(0.0008, now);
        g.gain.linearRampToValueAtTime(0.068, now + 0.035);
        g.gain.exponentialRampToValueAtTime(0.0005, now + 3.4);

        osc.connect(g);
        overtone.connect(otGain);
        otGain.connect(g);
        g.connect(dest);

        osc.start(now);
        overtone.start(now);
        osc.stop(now + 3.5);
        overtone.stop(now + 3.5);
      }
      this.schedulePentatonicNote(track, token);
    }, delay);
  }

  stopMusic() {
    this.musicToken += 1;
    this.musicActiveFlag = false;
    this.activeMusicTrack = "none";
    if (this.musicTimer !== null) {
      window.clearTimeout(this.musicTimer);
      this.musicTimer = null;
    }

    const oldOscs = this.musicOscs;
    const oldGain = this.musicGain;
    this.musicOscs = [];
    this.musicGain = null;

    if (this.ctx && oldGain) {
      try {
        oldGain.gain.setTargetAtTime(0.0004, this.ctx.currentTime, 0.14);
      } catch {
        // ignore
      }
      window.setTimeout(() => {
        oldOscs.forEach((o) => {
          try {
            o.stop();
            o.disconnect();
          } catch {
            // ignore
          }
        });
        try {
          oldGain.disconnect();
        } catch {
          // ignore
        }
      }, 300);
    }
    this.notify();
  }

  // ==================== L4: Interaction SFX ====================
  playSfx(cue: SfxAudioCue, localVolume = 0.8) {
    if (!this.isLayerAudible("sfx")) return;
    const ctx = this.ensureGraph();
    const dest = this.getLayerDestination("sfx");
    if (!ctx || !dest) return;

    const now = ctx.currentTime;
    const vol = Math.max(0.03, Math.min(1, localVolume));

    if (cue === "woodfish") {
      const bodyOsc = ctx.createOscillator();
      const bodyGain = ctx.createGain();
      bodyOsc.type = "triangle";
      bodyOsc.frequency.setValueAtTime(640, now);
      bodyOsc.frequency.exponentialRampToValueAtTime(295, now + 0.095);
      bodyGain.gain.setValueAtTime(0.001, now);
      bodyGain.gain.linearRampToValueAtTime(0.32 * vol, now + 0.006);
      bodyGain.gain.exponentialRampToValueAtTime(0.001, now + 0.21);
      bodyOsc.connect(bodyGain);
      bodyGain.connect(dest);
      bodyOsc.start(now);
      bodyOsc.stop(now + 0.23);

      const rimOsc = ctx.createOscillator();
      const rimGain = ctx.createGain();
      rimOsc.type = "sine";
      rimOsc.frequency.setValueAtTime(1120, now);
      rimOsc.frequency.exponentialRampToValueAtTime(520, now + 0.045);
      rimGain.gain.setValueAtTime(0.001, now);
      rimGain.gain.linearRampToValueAtTime(0.14 * vol, now + 0.004);
      rimGain.gain.exponentialRampToValueAtTime(0.001, now + 0.07);
      rimOsc.connect(rimGain);
      rimGain.connect(dest);
      rimOsc.start(now);
      rimOsc.stop(now + 0.08);
      return;
    }

    if (cue === "beads" || cue === "ui-tap") {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(cue === "ui-tap" ? 680 : 920, now);
      osc.frequency.exponentialRampToValueAtTime(
        cue === "ui-tap" ? 410 : 340,
        now + 0.038,
      );
      gain.gain.setValueAtTime(0.001, now);
      gain.gain.linearRampToValueAtTime(
        (cue === "ui-tap" ? 0.09 : 0.19) * vol,
        now + 0.003,
      );
      gain.gain.exponentialRampToValueAtTime(0.0008, now + 0.065);
      osc.connect(gain);
      gain.connect(dest);
      osc.start(now);
      osc.stop(now + 0.075);
      return;
    }

    if (cue === "incense") {
      // Soft match ember shimmer + light airy strike
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(540, now);
      osc.frequency.exponentialRampToValueAtTime(810, now + 0.12);
      gain.gain.setValueAtTime(0.001, now);
      gain.gain.linearRampToValueAtTime(0.1 * vol, now + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0006, now + 0.42);
      osc.connect(gain);
      gain.connect(dest);
      osc.start(now);
      osc.stop(now + 0.45);
      return;
    }

    if (cue === "lamp") {
      // Warm rising chord bloom
      [528, 792].forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "sine";
        osc.frequency.setValueAtTime(freq, now + idx * 0.05);
        gain.gain.setValueAtTime(0.001, now + idx * 0.05);
        gain.gain.linearRampToValueAtTime(
          (idx === 0 ? 0.13 : 0.07) * vol,
          now + idx * 0.05 + 0.04,
        );
        gain.gain.exponentialRampToValueAtTime(0.0006, now + 1.4);
        osc.connect(gain);
        gain.connect(dest);
        osc.start(now + idx * 0.05);
        osc.stop(now + 1.45);
      });
      return;
    }

    if (cue === "flower") {
      // Soft petal chime triad
      [660, 880].forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "sine";
        osc.frequency.setValueAtTime(freq, now + idx * 0.065);
        gain.gain.setValueAtTime(0.001, now + idx * 0.065);
        gain.gain.linearRampToValueAtTime(
          0.11 * vol,
          now + idx * 0.065 + 0.02,
        );
        gain.gain.exponentialRampToValueAtTime(0.0006, now + 0.9);
        osc.connect(gain);
        gain.connect(dest);
        osc.start(now + idx * 0.065);
        osc.stop(now + 0.95);
      });
      return;
    }

    if (cue === "bow") {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(432, now);
      gain.gain.setValueAtTime(0.001, now);
      gain.gain.linearRampToValueAtTime(0.12 * vol, now + 0.03);
      gain.gain.exponentialRampToValueAtTime(0.0007, now + 1.3);
      osc.connect(gain);
      gain.connect(dest);
      osc.start(now);
      osc.stop(now + 1.35);
      return;
    }

    // Bells & Chimes
    const spec =
      cue === "temple-bell"
        ? [
            { freq: 216, amp: 0.24 * vol, decay: 3.6 },
            { freq: 432, amp: 0.12 * vol, decay: 2.8 },
            { freq: 648, amp: 0.06 * vol, decay: 1.9 },
          ]
        : cue === "jade-chime"
          ? [
              { freq: 528, amp: 0.18 * vol, decay: 2.4 },
              { freq: 1056, amp: 0.07 * vol, decay: 1.8 },
            ]
          : cue === "qing-bell" || cue === "complete"
            ? [
                { freq: 587, amp: 0.19 * vol, decay: 2.7 },
                { freq: 1174, amp: 0.08 * vol, decay: 1.9 },
                { freq: 1761, amp: 0.03 * vol, decay: 1.2 },
              ]
            : [
                { freq: 432, amp: 0.22 * vol, decay: 2.8 },
                { freq: 864, amp: 0.08 * vol, decay: 2.0 },
                { freq: 1296, amp: 0.04 * vol, decay: 1.4 },
              ];

    spec.forEach((p) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(p.freq, now);
      gain.gain.setValueAtTime(0.001, now);
      gain.gain.linearRampToValueAtTime(p.amp, now + 0.025);
      gain.gain.exponentialRampToValueAtTime(0.0006, now + p.decay);
      osc.connect(gain);
      gain.connect(dest);
      osc.start(now);
      osc.stop(now + p.decay + 0.06);
    });
  }

  // ==================== L5: Spatial Navigation Audio ====================
  playSpatialCue(cue: SpatialAudioCue, steps = 1) {
    if (!this.isLayerAudible("spatial")) return;
    const ctx = this.ensureGraph();
    const dest = this.getLayerDestination("spatial");
    if (!ctx || !dest) return;

    const now = ctx.currentTime;

    if (cue === "footstep") {
      this.playFootstepSurface("stone", steps);
      return;
    }

    if (cue === "hall-enter" || cue === "gate-pass") {
      // Subtle acoustic warmth swell + soft threshold chime
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(cue === "hall-enter" ? 324 : 396, now);
      gain.gain.setValueAtTime(0.0008, now);
      gain.gain.linearRampToValueAtTime(0.09, now + 0.08);
      gain.gain.exponentialRampToValueAtTime(0.0005, now + 1.45);
      osc.connect(gain);
      gain.connect(dest);
      osc.start(now);
      osc.stop(now + 1.5);
      return;
    }

    if (cue === "hall-exit" || cue === "transition-glide") {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(288, now);
      osc.frequency.exponentialRampToValueAtTime(220, now + 0.45);
      gain.gain.setValueAtTime(0.0008, now);
      gain.gain.linearRampToValueAtTime(0.055, now + 0.06);
      gain.gain.exponentialRampToValueAtTime(0.0005, now + 0.55);
      osc.connect(gain);
      gain.connect(dest);
      osc.start(now);
      osc.stop(now + 0.6);
      return;
    }

    if (cue === "wind-chime") {
      [784, 987.77, 1174.66].forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "sine";
        osc.frequency.setValueAtTime(freq, now + idx * 0.09);
        gain.gain.setValueAtTime(0.0006, now + idx * 0.09);
        gain.gain.linearRampToValueAtTime(0.045, now + idx * 0.09 + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.0004, now + 1.2 + idx * 0.12);
        osc.connect(gain);
        gain.connect(dest);
        osc.start(now + idx * 0.09);
        osc.stop(now + 1.4 + idx * 0.12);
      });
      return;
    }

    if (cue === "distant-bell") {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(216, now);
      gain.gain.setValueAtTime(0.0006, now);
      gain.gain.linearRampToValueAtTime(0.075, now + 0.08);
      gain.gain.exponentialRampToValueAtTime(0.0004, now + 2.8);
      osc.connect(gain);
      gain.connect(dest);
      osc.start(now);
      osc.stop(now + 2.9);
    }
  }

  private footstepNoiseBuffer: AudioBuffer | null = null;
  private footstepAlt = 0;

  private getFootstepNoiseBuffer(ctx: AudioContext): AudioBuffer {
    if (
      this.footstepNoiseBuffer &&
      this.footstepNoiseBuffer.sampleRate === ctx.sampleRate
    ) {
      return this.footstepNoiseBuffer;
    }
    const len = Math.floor(ctx.sampleRate * 0.08);
    const buf = ctx.createBuffer(1, len, ctx.sampleRate);
    const ch = buf.getChannelData(0);
    let last = 0;
    for (let i = 0; i < len; i += 1) {
      const w = Math.random() * 2 - 1;
      last = (last + 0.14 * w) / 1.14;
      ch[i] = last * 2.4;
    }
    this.footstepNoiseBuffer = buf;
    return buf;
  }

  /**
   * 步行表面质感脚步声（室外青石板 / 门槛木阶 / 殿内金砖 / 山径砂土）：
   * 采用短促带通摩擦瞬态 + 柔和低频落地共振，随缓步节奏交替触发，停步即止
   */
  playFootstepSurface(
    surface: "stone" | "wood" | "jinzhuan" | "earth" = "stone",
    steps = 1,
    intensity = 1,
  ) {
    if (!this.isLayerAudible("spatial")) return;
    const ctx = this.ensureGraph();
    const dest = this.getLayerDestination("spatial");
    if (!ctx || !dest) return;

    const now = ctx.currentTime;
    const count = Math.max(1, Math.min(4, steps));
    const amp = Math.max(0.04, Math.min(1, intensity));
    const noiseBuf = this.getFootstepNoiseBuffer(ctx);

    for (let i = 0; i < count; i += 1) {
      this.footstepAlt = (this.footstepAlt + 1) % 2;
      const lrShift = this.footstepAlt === 0 ? 1.0 : 0.94;
      const offset = i * 0.72;
      const start = now + offset;

      // 1. Soft sole contact grit/scrape transient (filtered noise)
      const noiseSrc = ctx.createBufferSource();
      noiseSrc.buffer = noiseBuf;
      const noiseFilter = ctx.createBiquadFilter();
      noiseFilter.type = "bandpass";
      const freqCenter =
        surface === "earth"
          ? 660
          : surface === "wood"
            ? 320
            : surface === "jinzhuan"
              ? 410
              : 520;
      noiseFilter.frequency.setValueAtTime(freqCenter * lrShift, start);
      noiseFilter.Q.setValueAtTime(
        surface === "jinzhuan" ? 1.3 : surface === "stone" ? 1.1 : 0.85,
        start,
      );

      const noiseGain = ctx.createGain();
      const noisePeak =
        (surface === "earth"
          ? 0.038
          : surface === "wood"
            ? 0.022
            : surface === "jinzhuan"
              ? 0.024
              : 0.034) * amp;
      noiseGain.gain.setValueAtTime(0.0005, start);
      noiseGain.gain.linearRampToValueAtTime(noisePeak, start + 0.008);
      noiseGain.gain.exponentialRampToValueAtTime(0.0003, start + 0.048);

      noiseSrc.connect(noiseFilter);
      noiseFilter.connect(noiseGain);
      noiseGain.connect(dest);
      noiseSrc.start(start);
      noiseSrc.stop(start + 0.06);

      // 2. Muted heel weight thud (low resonant body; indoor Jinzhuan has warmer hall decay)
      const osc = ctx.createOscillator();
      const thudGain = ctx.createGain();
      osc.type = "sine";
      const baseFreq =
        (surface === "wood"
          ? 70
          : surface === "earth"
            ? 66
            : surface === "jinzhuan"
              ? 78
              : 88) * lrShift;
      osc.frequency.setValueAtTime(baseFreq, start);
      osc.frequency.exponentialRampToValueAtTime(
        surface === "wood" ? 35 : surface === "jinzhuan" ? 38 : 42,
        start + 0.07,
      );

      const thudPeak =
        (surface === "wood"
          ? 0.062
          : surface === "earth"
            ? 0.044
            : surface === "jinzhuan"
              ? 0.048
              : 0.052) * amp;
      const decaySec = surface === "jinzhuan" ? 0.135 : 0.095;
      thudGain.gain.setValueAtTime(0.0006, start);
      thudGain.gain.linearRampToValueAtTime(thudPeak, start + 0.012);
      thudGain.gain.exponentialRampToValueAtTime(0.0003, start + decaySec);

      osc.connect(thudGain);
      thudGain.connect(dest);
      osc.start(start);
      osc.stop(start + decaySec + 0.02);
    }
  }

  /**
   * 根据 7 阶段步行进度动态调制室外环境音衰减与殿内宗教共鸣渐入，绝不产生突兀断音
   */
  updateWalkAudioProgression(
    progress: number,
    mode: "enter-hall" | "exit-hall" | "courtyard-walk" | "trail-walk",
    tradition: "buddhist" | "daoist" | "nature",
  ) {
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    const p = Math.max(0, Math.min(1, progress));

    if (this.ambientGain && this.activeAmbientType) {
      const mult = SOUND_GAIN_MULT[this.activeAmbientType] ?? 0.36;
      const baseScale = this.ambientOverrideVolume ?? 1;
      let enclosureAttenuation = 1;
      if (mode === "enter-hall") {
        const indoorRatio = Math.max(0, Math.min(1, (p - 0.5) / 0.38));
        enclosureAttenuation = 1 - indoorRatio * 0.52;
      } else if (mode === "exit-hall") {
        const outdoorRatio = Math.max(0, Math.min(1, (p - 0.18) / 0.52));
        enclosureAttenuation = 0.48 + outdoorRatio * 0.52;
      }
      this.ambientGain.gain.setTargetAtTime(
        Math.max(0.002, baseScale * mult * enclosureAttenuation),
        now,
        0.2,
      );
    }

    if (this.religiousGain && tradition !== "nature") {
      let resonanceLevel = 1;
      if (mode === "enter-hall") {
        const indoorRatio = Math.max(0, Math.min(1, (p - 0.52) / 0.38));
        resonanceLevel = 0.56 + indoorRatio * 0.6;
      } else if (mode === "exit-hall") {
        const outdoorRatio = Math.max(0, Math.min(1, (p - 0.18) / 0.56));
        resonanceLevel = 1.16 - outdoorRatio * 0.52;
      }
      this.religiousGain.gain.setTargetAtTime(resonanceLevel, now, 0.22);
    }
  }

  resetWalkAudioModifiers() {
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    if (this.ambientGain && this.activeAmbientType) {
      const mult = SOUND_GAIN_MULT[this.activeAmbientType] ?? 0.36;
      const baseScale = this.ambientOverrideVolume ?? 1;
      this.ambientGain.gain.setTargetAtTime(
        Math.max(0.002, baseScale * mult),
        now,
        0.2,
      );
    }
    if (this.religiousGain) {
      this.religiousGain.gain.setTargetAtTime(1, now, 0.2);
    }
  }

  stopAllStreams() {
    this.stopAmbient();
    this.stopReligiousAtmosphere();
    this.stopMusic();
  }
}

export const soundManager = new UnifiedSoundManager();

// ==================== Backwards-Compatible Exports ====================
export function playWoodenFishSound(volume = 0.8) {
  soundManager.playSfx("woodfish", volume);
}

export function playBeadClickSound(volume = 0.7) {
  soundManager.playSfx("beads", volume);
}

export function playSingingBowlChime(volume = 0.8) {
  soundManager.playSfx("singing-bowl", volume);
}

export function playTempleBellSound(volume = 0.75) {
  soundManager.playSfx("temple-bell", volume);
}

export function playJadeChimeSound(volume = 0.75) {
  soundManager.playSfx("jade-chime", volume);
}

export function playQingBellSound(volume = 0.75) {
  soundManager.playSfx("qing-bell", volume);
}

export function playBellByType(
  bellType: "temple-bell" | "singing-bowl" | "jade-chime" | "qing-bell" | "none",
  volume = 0.75,
) {
  if (bellType === "none") return;
  soundManager.playSfx(bellType, volume);
}

export const natureAudio = {
  getActiveType(): NatureSoundType | null {
    return soundManager.getActiveStatus().ambient;
  },
  start(type: NatureSoundType, volume = 0.5) {
    soundManager.startAmbient(type, volume);
  },
  setVolume(volume: number) {
    soundManager.setAmbientOverrideVolume(volume);
  },
  stop() {
    soundManager.stopAmbient();
  },
};
