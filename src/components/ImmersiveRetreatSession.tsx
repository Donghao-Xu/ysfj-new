import {
  ArrowLeft,
  Eye,
  EyeOff,
  Pause,
  Play,
  Repeat,
  RotateCcw,
  Sparkles,
  Volume2,
  VolumeX,
  Wind,
} from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { ResilientImage } from "@/components/ResilientImage";
import {
  BreathingGuideWidget,
  RetreatBeadsPanel,
  RetreatNianfoPanel,
  RetreatWoodfishPanel,
} from "@/components/RetreatInteractions";
import { RetreatSceneAtmosphere } from "@/components/RetreatSceneAtmosphere";
import { SacredChantingAura } from "@/components/SacredInteractions";
import {
  type BreathModeId,
  type BreathVisualId,
  RETREAT_AUDIO_CATALOG,
  type RetreatSceneConfig,
} from "@/data/retreatScenes";
import {
  RETREAT_MUSIC_LIBRARY,
  playBellByType,
  soundManager,
  type NatureSoundType,
  type RetreatMusicTrackId,
} from "@/lib/audio";
import { useAppState } from "@/context/AppContext";

export type ImmersiveSessionProps = {
  scene: RetreatSceneConfig;
  durationMinutes: number;
  initialSoundEnabled: boolean;
  initialSoundType: NatureSoundType;
  initialVolume: number;
  initialBreathEnabled: boolean;
  initialBreathMode: BreathModeId;
  initialBreathVisual: BreathVisualId;
  initialInhaleSec: number;
  initialExhaleSec: number;
  initialPhraseId: string;
  customAudioUrl: string;
  customAudioTitle: string;
  initialLoopAudio: boolean;
  onCompleteSession: (completedMinutes: number) => void;
  onExitToHome: () => void;
  onCloseSession: () => void;
};

export function ImmersiveRetreatSession({
  scene,
  durationMinutes,
  initialSoundEnabled,
  initialSoundType,
  initialVolume,
  initialBreathEnabled,
  initialBreathMode,
  initialBreathVisual,
  initialInhaleSec,
  initialExhaleSec,
  initialPhraseId,
  customAudioUrl,
  customAudioTitle,
  initialLoopAudio,
  onCompleteSession,
  onExitToHome,
  onCloseSession,
}: ImmersiveSessionProps) {
  const totalSeconds = Math.max(60, Math.round(durationMinutes) * 60);

  const [secondsLeft, setSecondsLeft] = useState(totalSeconds);
  const [isRunning, setIsRunning] = useState(true);
  const [completed, setCompleted] = useState(false);

  // Audio controls
  const [soundEnabled, setSoundEnabled] = useState(initialSoundEnabled);
  const [soundType, setSoundType] = useState<NatureSoundType>(initialSoundType);
  const [volume, setVolume] = useState(initialVolume);
  const [useCustomAudio, setUseCustomAudio] = useState(Boolean(customAudioUrl));
  const [loopCustom, setLoopCustom] = useState(initialLoopAudio);
  const [audioError, setAudioError] = useState<string | null>(null);
  const [showAudioDrawer, setShowAudioDrawer] = useState(false);

  // Breathing & scene interaction state
  const [breathEnabled, setBreathEnabled] = useState(initialBreathEnabled);
  const [breathMode, setBreathMode] = useState<BreathModeId>(initialBreathMode);
  const [breathVisual, setBreathVisual] = useState<BreathVisualId>(
    initialBreathVisual,
  );
  const [inhaleSec, setInhaleSec] = useState(initialInhaleSec);
  const [exhaleSec, setExhaleSec] = useState(initialExhaleSec);
  const [phraseId, setPhraseId] = useState(initialPhraseId);
  const [quietUi, setQuietUi] = useState(false);

  const { settings, updateSettings } = useAppState();
  const [musicTrack, setMusicTrack] = useState<RetreatMusicTrackId>(
    settings.musicTrackId,
  );
  // Drift-free timer anchors
  const endTimeMsRef = useRef<number>(Date.now() + totalSeconds * 1000);
  const pausedRemainingRef = useRef<number>(totalSeconds);
  const recordedRef = useRef(false);
  const audioElRef = useRef<HTMLAudioElement | null>(null);

  const religiousType =
    scene.category === "buddhist"
      ? "buddhist"
      : scene.category === "daoist"
        ? "daoist"
        : "none";

  // Start / synchronize unified 5-layer audio (single-source lock!)
  useEffect(() => {
    if (completed || !isRunning || !soundEnabled) {
      soundManager.stopAllStreams();
      return;
    }

    if (useCustomAudio && customAudioUrl) {
      soundManager.stopAllStreams();
      return;
    }

    soundManager.applySceneProfile(
      {
        ambient: soundType,
        religious: religiousType,
        music: musicTrack,
      },
      { startIfUnlocked: true },
    );
    soundManager.setAmbientOverrideVolume(volume);

    return () => {
      soundManager.stopAllStreams();
    };
  }, [
    completed,
    isRunning,
    soundEnabled,
    soundType,
    religiousType,
    musicTrack,
    useCustomAudio,
    customAudioUrl,
    volume,
  ]);

  // Adjust volume live without restarting stream
  useEffect(() => {
    if (soundEnabled && !useCustomAudio) {
      soundManager.setAmbientOverrideVolume(volume);
    }
    if (audioElRef.current) {
      audioElRef.current.volume = soundEnabled ? volume : 0;
    }
  }, [volume, soundEnabled, useCustomAudio]);

  // Manage optional external/local <audio> track cleanly (single active source)
  useEffect(() => {
    const el = audioElRef.current;
    if (!el) return;
    if (!useCustomAudio || !customAudioUrl || completed || !isRunning || !soundEnabled) {
      el.pause();
      return;
    }
    el.volume = volume;
    void el.play().catch(() => {
      setAudioError("曲目播放受限或加载失败，已自动为您保留离线自然声景。");
      setUseCustomAudio(false);
    });
  }, [useCustomAudio, customAudioUrl, completed, isRunning, soundEnabled, volume]);

  // Cleanup everything on unmount
  useEffect(() => {
    return () => {
      soundManager.stopAllStreams();
      if (audioElRef.current) {
        audioElRef.current.pause();
      }
    };
  }, []);

  // Drift-safe countdown interval
  useEffect(() => {
    if (!isRunning || completed) return undefined;
    endTimeMsRef.current = Date.now() + pausedRemainingRef.current * 1000;

    const id = window.setInterval(() => {
      const remaining = Math.max(
        0,
        Math.ceil((endTimeMsRef.current - Date.now()) / 1000),
      );
      pausedRemainingRef.current = remaining;
      setSecondsLeft(remaining);
      if (remaining === 0) {
        window.clearInterval(id);
      }
    }, 500);

    return () => window.clearInterval(id);
  }, [isRunning, completed]);

  const finishSession = useCallback(
    (manualEarly = false) => {
      if (recordedRef.current) return;
      recordedRef.current = true;
      setIsRunning(false);
      setCompleted(true);
      soundManager.stopAllStreams();
      if (audioElRef.current) audioElRef.current.pause();

      if (soundEnabled) {
        playBellByType(scene.audioConfig.bellType, volume);
      }

      const elapsedSec = totalSeconds - pausedRemainingRef.current;
      const completedMins = manualEarly
        ? Math.floor(elapsedSec / 60)
        : durationMinutes;
      if (completedMins >= 1) {
        onCompleteSession(completedMins);
      }
    },
    [
      durationMinutes,
      onCompleteSession,
      scene.audioConfig.bellType,
      soundEnabled,
      totalSeconds,
      volume,
    ],
  );

  // Trigger natural completion at zero
  useEffect(() => {
    if (secondsLeft === 0 && !completed) {
      finishSession(false);
    }
  }, [secondsLeft, completed, finishSession]);

  const togglePause = () => {
    if (completed) return;
    if (isRunning) {
      const rem = Math.max(
        0,
        Math.ceil((endTimeMsRef.current - Date.now()) / 1000),
      );
      pausedRemainingRef.current = rem;
      setSecondsLeft(rem);
      setIsRunning(false);
    } else {
      setIsRunning(true);
    }
  };

  const restartSession = () => {
    recordedRef.current = false;
    pausedRemainingRef.current = totalSeconds;
    endTimeMsRef.current = Date.now() + totalSeconds * 1000;
    setSecondsLeft(totalSeconds);
    setCompleted(false);
    setIsRunning(true);
  };

  const displayTime = `${String(Math.floor(secondsLeft / 60)).padStart(
    2,
    "0",
  )}:${String(secondsLeft % 60).padStart(2, "0")}`;

  const progress = Math.min(
    100,
    Math.max(0, ((totalSeconds - secondsLeft) / totalSeconds) * 100),
  );

  const visibleSounds = RETREAT_AUDIO_CATALOG.filter(
    (s) =>
      scene.audioConfig.allowedSounds.includes(s.id) ||
      s.category === "nature" ||
      (scene.category === "buddhist" && s.category === "buddhist") ||
      (scene.category === "daoist" && s.category === "daoist"),
  );

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col justify-between overflow-y-auto bg-[#0f1414] text-[#fff8eb]"
      onClick={() => {
        if (quietUi) setQuietUi(false);
      }}
    >
      {/* Full-bleed Scene Visual Backdrop */}
      <div className="pointer-events-none fixed inset-0">
        <ResilientImage
          src={scene.primaryImage}
          alt={scene.sceneName}
          tone={scene.category}
          fallbackTitle={scene.sceneName}
          fallbackGradient={scene.fallbackGradient}
          className="h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/58 via-black/38 to-black/80" />
        <RetreatSceneAtmosphere
          category={scene.category}
          effects={scene.animationConfig.effects}
          mistDensity={scene.animationConfig.mistDensity}
          immersive
        />
        {scene.featureConfig.mode === "nianfo" && (
          <SacredChantingAura playing={isRunning && !completed} tone="buddhist" />
        )}
      </div>

      {/* Hidden managed custom audio element */}
      {customAudioUrl && (
        <audio
          ref={audioElRef}
          src={customAudioUrl}
          loop={loopCustom}
          onError={() => {
            setAudioError("外部或本地音频加载受阻，已切回离线自然声景。");
            setUseCustomAudio(false);
          }}
        />
      )}

      {/* Top Minimal Header */}
      <header
        className={`relative z-10 flex items-center justify-between gap-3 px-4 py-4 transition-opacity duration-500 sm:px-8 ${
          quietUi && !completed ? "opacity-15 hover:opacity-100" : "opacity-100"
        }`}
      >
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            soundManager.stopAllStreams();
            onCloseSession();
          }}
          className="inline-flex min-h-[40px] items-center gap-1.5 rounded-xl bg-black/45 px-3.5 py-2 text-xs font-semibold text-[#fff8eb] backdrop-blur-md hover:bg-black/65 cursor-pointer"
        >
          <ArrowLeft size={15} />
          <span>退出静修</span>
        </button>

        <div className="text-center">
          <p className="text-[11px] tracking-widest text-[#d4b679]">
            {scene.categoryLabel}
          </p>
          <h2 className="font-serif-display text-base font-bold sm:text-lg">
            {scene.sceneName}
          </h2>
        </div>

        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            setQuietUi((q) => !q);
          }}
          title={quietUi ? "显示控制界面" : "极简画面模式"}
          className="inline-flex min-h-[40px] items-center gap-1.5 rounded-xl bg-black/45 px-3 py-2 text-xs font-medium text-[#fff8eb]/90 backdrop-blur-md hover:bg-black/65 cursor-pointer"
        >
          {quietUi ? <Eye size={15} /> : <EyeOff size={15} />}
          <span className="hidden sm:inline">
            {quietUi ? "显示控制" : "画面极简"}
          </span>
        </button>
      </header>

      {/* Center Stage */}
      <main
        className="relative z-10 mx-auto flex w-full max-w-2xl flex-1 flex-col items-center justify-center px-4 py-4"
        onClick={(e) => e.stopPropagation()}
      >
        {completed ? (
          <div className="animate-panel-up w-full max-w-md rounded-3xl border border-white/20 bg-black/65 p-7 text-center backdrop-blur-lg">
            <Sparkles size={28} className="mx-auto text-[#e5c17c]" />
            <h3 className="mt-3 font-serif-display text-2xl font-bold text-[#fff8eb]">
              静心已结束
            </h3>
            <p className="mt-2 font-serif-display text-base leading-relaxed text-[#f5ece0]/90">
              愿你带着平静回到生活。
            </p>
            <p className="mt-2 text-xs text-[#d4b679]/90">
              {scene.sceneName} · {scene.categoryLabel}
            </p>

            <div className="mt-6 flex flex-col gap-2.5 sm:flex-row">
              <button
                type="button"
                onClick={restartSession}
                className="inline-flex min-h-[44px] flex-1 items-center justify-center gap-2 rounded-xl bg-[#922e25] px-5 py-2.5 text-sm font-bold text-[#fff8eb] hover:opacity-90 cursor-pointer"
              >
                <RotateCcw size={15} />
                <span>再静修一次</span>
              </button>
              <button
                type="button"
                onClick={onExitToHome}
                className="inline-flex min-h-[44px] flex-1 items-center justify-center gap-2 rounded-xl bg-white/15 px-5 py-2.5 text-sm font-semibold text-[#fff8eb] hover:bg-white/25 cursor-pointer"
              >
                <span>返回静修首页</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="w-full space-y-5">
            {scene.featureConfig.mode === "woodfish" && (
              <RetreatWoodfishPanel
                volume={volume}
                soundEnabled={soundEnabled}
                onToggleSound={() => setSoundEnabled((s) => !s)}
                darkOverlay
              />
            )}

            {scene.featureConfig.mode === "beads" && (
              <RetreatBeadsPanel
                volume={volume}
                soundEnabled={soundEnabled}
                onToggleSound={() => setSoundEnabled((s) => !s)}
                darkOverlay
              />
            )}

            {scene.featureConfig.mode === "nianfo" && (
              <RetreatNianfoPanel
                selectedPhraseId={phraseId}
                onSelectPhrase={setPhraseId}
                darkOverlay
              />
            )}

            {scene.featureConfig.mode === "taiji" && (
              <div className="mx-auto max-w-md rounded-2xl border border-white/15 bg-black/35 px-4 py-2.5 text-center backdrop-blur-xs">
                <p className="text-xs font-medium text-[#cbe8dd]">
                  第一阶段意境体验 · 观太极流转，随呼吸归于宁静
                </p>
              </div>
            )}

            {(scene.featureConfig.mode === "standard" ||
              scene.featureConfig.mode === "taiji" ||
              breathEnabled) && (
              <BreathingGuideWidget
                enabled={breathEnabled}
                onToggleEnabled={() => setBreathEnabled((e) => !e)}
                mode={breathMode}
                onModeChange={setBreathMode}
                visual={breathVisual}
                onVisualChange={setBreathVisual}
                inhaleSec={inhaleSec}
                exhaleSec={exhaleSec}
                onCustomSecChange={(i, ex) => {
                  setInhaleSec(i);
                  setExhaleSec(ex);
                }}
                active={isRunning}
                tone={scene.category}
                compact
              />
            )}
          </div>
        )}
      </main>

      {/* Bottom Dock */}
      {!completed && (
        <footer
          onClick={(e) => e.stopPropagation()}
          className={`relative z-10 mx-auto w-full max-w-2xl px-4 pb-6 transition-opacity duration-500 ${
            quietUi ? "opacity-15 hover:opacity-100" : "opacity-100"
          }`}
        >
          {audioError && (
            <div className="mb-2.5 rounded-xl bg-black/75 px-3.5 py-2 text-center text-xs text-[#ffd79e]">
              {audioError}
            </div>
          )}

          {showAudioDrawer && (
            <div className="mb-3 rounded-2xl border border-white/15 bg-black/75 p-4 backdrop-blur-lg">
              <div className="mb-2.5 flex items-center justify-between text-xs">
                <span className="font-semibold text-[#e5c17c]">
                  静修声音设置（单一声源切换，无重叠）
                </span>
                <button
                  type="button"
                  onClick={() => setShowAudioDrawer(false)}
                  className="text-white/70 hover:text-white cursor-pointer"
                >
                  收起
                </button>
              </div>

              <div className="no-scrollbar flex gap-1.5 overflow-x-auto pb-2">
                {visibleSounds.map((item) => {
                  const selected = !useCustomAudio && soundType === item.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => {
                        setAudioError(null);
                        setUseCustomAudio(false);
                        setSoundType(item.id);
                      }}
                      className={`min-h-[34px] shrink-0 rounded-lg px-3 py-1 text-xs font-medium whitespace-nowrap cursor-pointer ${
                        selected
                          ? "bg-[#1f4e45] text-[#f3f8f5]"
                          : "bg-white/10 text-[#fff8eb]/85"
                      }`}
                    >
                      {item.label}
                    </button>
                  );
                })}
                {customAudioUrl && (
                  <button
                    type="button"
                    onClick={() => {
                      setAudioError(null);
                      setUseCustomAudio(true);
                    }}
                    className={`min-h-[34px] shrink-0 rounded-lg px-3 py-1 text-xs font-medium whitespace-nowrap cursor-pointer ${
                      useCustomAudio
                        ? "bg-[#922e25] text-[#fff8eb]"
                        : "bg-white/10 text-[#fff8eb]/85"
                    }`}
                  >
                    曲目：{customAudioTitle || "自定义音频"}
                  </button>
                )}
              </div>

              {!useCustomAudio && (
                <div className="no-scrollbar mt-1 flex gap-1.5 overflow-x-auto border-t border-white/10 pt-2 pb-1">
                  {RETREAT_MUSIC_LIBRARY.map((track) => {
                    const active = musicTrack === track.id;
                    return (
                      <button
                        key={track.id}
                        type="button"
                        onClick={() => {
                          setMusicTrack(track.id);
                          updateSettings({ musicTrackId: track.id });
                        }}
                        className={`min-h-[30px] shrink-0 rounded-lg px-2.5 py-1 text-[11px] font-medium whitespace-nowrap cursor-pointer ${
                          active
                            ? "bg-[#b88b44] text-[#1f1612] font-semibold"
                            : "bg-white/10 text-[#fff8eb]/80"
                        }`}
                      >
                        {track.label}
                      </button>
                    );
                  })}
                </div>
              )}

              <div className="mt-2 flex flex-wrap items-center justify-between gap-3">
                <div className="flex flex-1 items-center gap-2.5">
                  <Volume2 size={15} className="shrink-0 text-[#e5c17c]" />
                  <input
                    type="range"
                    min={0.05}
                    max={1}
                    step={0.05}
                    value={volume}
                    onChange={(e) => setVolume(Number(e.target.value))}
                    aria-label="音量"
                    className="w-full max-w-[180px] accent-[#d4a85d] cursor-pointer"
                  />
                  <span className="text-[11px] text-white/75 tabular-nums">
                    {Math.round(volume * 100)}%
                  </span>
                </div>

                {useCustomAudio && (
                  <button
                    type="button"
                    onClick={() => setLoopCustom((l) => !l)}
                    className={`inline-flex min-h-[32px] items-center gap-1 rounded-lg px-2.5 text-[11px] font-medium cursor-pointer ${
                      loopCustom
                        ? "bg-[#b88b44] text-[#1f1612]"
                        : "bg-white/10 text-white/80"
                    }`}
                  >
                    <Repeat size={12} />
                    <span>{loopCustom ? "循环" : "单次"}</span>
                  </button>
                )}
              </div>
            </div>
          )}

          <div className="rounded-2xl border border-white/15 bg-black/60 p-4 backdrop-blur-lg">
            {/* Progress Track */}
            <div className="mb-3 h-1 w-full overflow-hidden rounded-full bg-white/15">
              <div
                className="h-full bg-[#d4a85d] transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3">
              {/* Countdown */}
              <div>
                <p
                  aria-live="polite"
                  className="font-serif-display text-3xl font-bold tracking-wider text-[#fff8eb] tabular-nums"
                >
                  {displayTime}
                </p>
                <p className="text-[11px] text-[#e5c17c]/85">
                  {isRunning ? "安住静修中" : "已暂停 · 可随时恢复或结束"}
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => setBreathEnabled((b) => !b)}
                  aria-label="呼吸引导开关"
                  className={`inline-flex min-h-[40px] items-center gap-1 rounded-xl px-3 text-xs font-medium cursor-pointer ${
                    breathEnabled
                      ? "bg-[#1f4e45] text-[#f3f8f5]"
                      : "bg-white/12 text-white/80"
                  }`}
                >
                  <Wind size={14} />
                  <span className="hidden sm:inline">呼吸</span>
                </button>

                <button
                  type="button"
                  onClick={() => setSoundEnabled((s) => !s)}
                  aria-label={soundEnabled ? "静音" : "开启声音"}
                  className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/12 text-[#fff8eb] cursor-pointer"
                >
                  {soundEnabled ? <Volume2 size={16} /> : <VolumeX size={16} />}
                </button>

                <button
                  type="button"
                  onClick={() => setShowAudioDrawer((v) => !v)}
                  className="min-h-[40px] rounded-xl bg-white/12 px-3 text-xs font-medium text-[#fff8eb] hover:bg-white/20 cursor-pointer"
                >
                  声景
                </button>

                <button
                  type="button"
                  onClick={togglePause}
                  className="inline-flex min-h-[40px] items-center gap-1.5 rounded-xl bg-[#b88b44] px-4 text-xs font-bold text-[#1f1612] hover:opacity-90 cursor-pointer"
                >
                  {isRunning ? <Pause size={14} /> : <Play size={14} />}
                  <span>{isRunning ? "暂停" : "继续"}</span>
                </button>

                <button
                  type="button"
                  onClick={() => finishSession(true)}
                  className="min-h-[40px] rounded-xl bg-white/15 px-3 text-xs font-medium text-[#fff8eb] hover:bg-white/25 cursor-pointer"
                >
                  结束
                </button>
              </div>
            </div>
          </div>
        </footer>
      )}
    </div>
  );
}
