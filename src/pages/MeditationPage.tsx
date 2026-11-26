import {
  ArrowLeft,
  ArrowRight,
  Clock,
  FileAudio,
  Music,
  Play,
  Repeat,
  SlidersHorizontal,
  Sparkles,
  Users,
  Volume2,
  VolumeX,
} from "lucide-react";
import { useEffect, useRef, useState, type ChangeEvent } from "react";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { AppShell } from "@/components/AppShell";
import { ImmersiveRetreatSession } from "@/components/ImmersiveRetreatSession";
import { ResilientImage } from "@/components/ResilientImage";
import {
  BreathingGuideWidget,
  RetreatBeadsPanel,
  RetreatNianfoPanel,
  RetreatWoodfishPanel,
} from "@/components/RetreatInteractions";
import { RetreatSceneAtmosphere } from "@/components/RetreatSceneAtmosphere";
import { SacredEnvironmentLayer } from "@/components/SacredAtmosphere";
import {
  SpatialViewport2D5,
  useSpatialWalkController,
} from "@/components/SpatialViewport2D5";
import { useAppState } from "@/context/AppContext";
import {
  type BreathModeId,
  type BreathVisualId,
  DAOIST_RETREAT_CULTURE,
  DURATION_PRESETS,
  getRetreatSceneById,
  getRetreatScenesByRealm,
  NIANFO_PHRASES,
  RETREAT_AUDIO_CATALOG,
  RETREAT_BELL_LABELS,
  RETREAT_HERO,
  RETREAT_REALMS,
  type RetreatRealmId,
  type RetreatSceneConfig,
} from "@/data/retreatScenes";
import {
  getSpatialNode,
  type SpatialConnection,
  type SpatialNode,
} from "@/data/spatialGraph";
import {
  playBellByType,
  soundManager,
  type NatureSoundType,
} from "@/lib/audio";

type HomeDrawer = "records" | "audio" | "duration" | null;

export function MeditationPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();

  const {
    chantingTracks,
    totalChantingMinutes,
    chantingSessionsCount,
    chantingLogs,
    settings,
    updateSettings,
    recordChantingSession,
  } = useAppState();

  // Derive initial realm/scene from URL params cleanly
  const paramRealm = searchParams.get("realm") as RetreatRealmId | null;
  const paramScene = searchParams.get("scene");
  const initialSceneObj = paramScene ? getRetreatSceneById(paramScene) : undefined;
  const initialRealm: RetreatRealmId | null =
    initialSceneObj?.category ||
    (paramRealm && ["buddhist", "daoist", "nature"].includes(paramRealm)
      ? paramRealm
      : null);

  const [activeRealm, setActiveRealm] = useState<RetreatRealmId | null>(
    initialRealm,
  );
  const [selectedSceneId, setSelectedSceneId] = useState<string>(
    initialSceneObj?.sceneId ||
      (initialRealm
        ? getRetreatScenesByRealm(initialRealm)[0].sceneId
        : "retreat-buddhist-chan"),
  );

  // Sync URL query params cleanly if navigated back/forward
  useEffect(() => {
    const r = searchParams.get("realm") as RetreatRealmId | null;
    const s = searchParams.get("scene");
    if (s) {
      const matched = getRetreatSceneById(s);
      if (matched) {
        setActiveRealm(matched.category);
        setSelectedSceneId(matched.sceneId);
        return;
      }
    }
    if (r && ["buddhist", "daoist", "nature"].includes(r)) {
      setActiveRealm(r);
      setSelectedSceneId((curr) => {
        const list = getRetreatScenesByRealm(r);
        return list.some((item) => item.sceneId === curr)
          ? curr
          : list[0].sceneId;
      });
    } else if (!r && !s) {
      setActiveRealm(null);
    }
  }, [searchParams]);

  // Also accept legacy route state scriptureId -> open Buddhist Nianfo scene gently
  useEffect(() => {
    const state = location.state as { scriptureId?: string } | null;
    if (state?.scriptureId) {
      setActiveRealm("buddhist");
      setSelectedSceneId("retreat-buddhist-nianfo");
    }
  }, [location.state]);

  const activeScene: RetreatSceneConfig =
    getRetreatSceneById(selectedSceneId) ||
    getRetreatScenesByRealm(activeRealm || "buddhist")[0];

  // Retreat Configuration States
  const [durationMinutes, setDurationMinutes] = useState<number>(
    settings.defaultRetreatMinutes || 15,
  );
  const [customMinutesInput, setCustomMinutesInput] = useState<string>("");
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [soundType, setSoundType] = useState<NatureSoundType>(
    activeScene.audioConfig.defaultSound,
  );
  const [volume, setVolume] = useState<number>(settings.defaultVolume);
  const [previewPlaying, setPreviewPlaying] = useState<boolean>(false);

  // Breathing Config States
  const [breathEnabled, setBreathEnabled] = useState<boolean>(
    activeScene.breathingConfig.defaultEnabled,
  );
  const [breathMode, setBreathMode] = useState<BreathModeId>(
    activeScene.breathingConfig.defaultMode,
  );
  const [breathVisual, setBreathVisual] = useState<BreathVisualId>(
    activeScene.breathingConfig.defaultVisual,
  );
  const [inhaleSec, setInhaleSec] = useState<number>(5);
  const [exhaleSec, setExhaleSec] = useState<number>(5);

  // Scene-specific states
  const [selectedPhraseId, setSelectedPhraseId] = useState<string>(
    NIANFO_PHRASES[0].id,
  );
  const [naturalViewId, setNaturalViewId] = useState<string>("valley");

  // External / local custom track states
  const [customAudioUrl, setCustomAudioUrl] = useState<string>("");
  const [customAudioTitle, setCustomAudioTitle] = useState<string>("");
  const [loopAudio, setLoopAudio] = useState<boolean>(true);
  const [audioLoadError, setAudioLoadError] = useState<string | null>(null);
  const localObjectUrlRef = useRef<string | null>(null);

  // Bottom utility drawer on Home view
  const [homeDrawer, setHomeDrawer] = useState<HomeDrawer>(null);

  // Full-screen immersive session active flag
  const [inImmersiveSession, setInImmersiveSession] = useState<boolean>(false);
  const {
    activeWalk,
    settlingFade,
    startWalk,
    handleWalkMidpoint,
    handleWalkComplete,
    handleWalkCancel,
  } = useSpatialWalkController();

  const realmScenes = getRetreatScenesByRealm(activeScene.category);
  const currentIdx = realmScenes.findIndex(
    (s) => s.sceneId === activeScene.sceneId,
  );
  const prevSibling = currentIdx > 0 ? realmScenes[currentIdx - 1] : null;
  const nextSibling =
    currentIdx >= 0 && currentIdx < realmScenes.length - 1
      ? realmScenes[currentIdx + 1]
      : null;

  const activeSpatialNode: SpatialNode = getSpatialNode(activeScene.sceneId) || {
    sceneId: activeScene.sceneId,
    realm: activeScene.category,
    title: activeScene.sceneName,
    subtitle: activeScene.subtitle,
    coordinates: { x: currentIdx * 24, y: 0, z: currentIdx * 36 },
    entrances: prevSibling ? [prevSibling.sceneId] : [],
    exits: nextSibling ? [nextSibling.sceneId] : [],
    connections: [
      ...(prevSibling
        ? [
            {
              targetSceneId: prevSibling.sceneId,
              label: `退步回看 · ${prevSibling.sceneName}`,
              direction: "back" as const,
              transitionType: "pull-back" as const,
            },
          ]
        : []),
      ...(nextSibling
        ? [
            {
              targetSceneId: nextSibling.sceneId,
              label: `向前漫步 · ${nextSibling.sceneName}`,
              direction: "forward" as const,
              transitionType: "push-in" as const,
            },
          ]
        : []),
    ],
    audioConfig: {
      ambient: activeScene.audioConfig.defaultSound,
      religious:
        activeScene.category === "buddhist"
          ? "buddhist"
          : activeScene.category === "daoist"
            ? "daoist"
            : "none",
      suggestedMusic: settings.musicTrackId,
    },
    visualConfig: {
      horizonYPercent: 50,
      parallaxStrength: 1.05,
      foregroundFrame:
        activeScene.category === "buddhist" ? "temple-eaves" : "mist-canopy",
    },
    transitionType: "push-in",
  };

  // Update scene defaults cleanly when switching scenes (zero leftover state)
  const applySceneSelection = (scene: RetreatSceneConfig) => {
    soundManager.stopAllStreams();
    setPreviewPlaying(false);
    setSelectedSceneId(scene.sceneId);
    setActiveRealm(scene.category);
    setSoundType(scene.audioConfig.defaultSound);
    setBreathEnabled(scene.breathingConfig.defaultEnabled);
    setBreathMode(scene.breathingConfig.defaultMode);
    setBreathVisual(scene.breathingConfig.defaultVisual);
    setSearchParams({ realm: scene.category, scene: scene.sceneId });
  };

  const handleWalkToScene = (
    nextScene: RetreatSceneConfig,
    direction: SpatialConnection["direction"] = "forward",
    label?: string,
  ) => {
    if (nextScene.sceneId === activeScene.sceneId) return;
    startWalk(
      {
        mode: activeScene.category === "nature" ? "trail-walk" : "courtyard-walk",
        tradition: activeScene.category,
        sceneId: activeScene.sceneId,
        fromTitle: activeScene.sceneName,
        toTitle: nextScene.sceneName,
        label: label || `漫步前往 · ${nextScene.sceneName}`,
        exteriorImage: activeScene.primaryImage,
        interiorImage: nextScene.primaryImage,
        targetImage: nextScene.primaryImage,
        durationMs: activeScene.category === "nature" ? 12200 : 11800,
        direction,
      },
      {
        onArrive: () => applySceneSelection(nextScene),
      },
    );
  };

  const handleWalkToConnection = (conn: SpatialConnection) => {
    const nextScene = getRetreatSceneById(conn.targetSceneId);
    if (!nextScene) return;
    handleWalkToScene(nextScene, conn.direction, conn.label);
  };

  const enterRealm = (realm: RetreatRealmId) => {
    const first = getRetreatScenesByRealm(realm)[0];
    applySceneSelection(first);
  };

  const returnToRetreatHome = () => {
    soundManager.stopAllStreams();
    setPreviewPlaying(false);
    setInImmersiveSession(false);
    setActiveRealm(null);
    setSearchParams({});
  };

  // Stop any sound preview when unmounting
  useEffect(() => {
    return () => {
      soundManager.stopAllStreams();
      if (localObjectUrlRef.current) {
        URL.revokeObjectURL(localObjectUrlRef.current);
      }
    };
  }, []);

  const handleTogglePreviewSound = (targetType: NatureSoundType) => {
    if (previewPlaying && soundType === targetType) {
      soundManager.stopAllStreams();
      setPreviewPlaying(false);
      return;
    }
    setSoundType(targetType);
    const religious =
      activeScene.category === "buddhist"
        ? "buddhist"
        : activeScene.category === "daoist"
          ? "daoist"
          : "none";
    soundManager.applySceneProfile(
      {
        ambient: targetType,
        religious,
        music: settings.musicTrackId,
      },
      { startIfUnlocked: true },
    );
    soundManager.setAmbientOverrideVolume(soundEnabled ? volume : 0.05);
    setPreviewPlaying(true);
  };

  const handleVolumeChange = (nextVol: number) => {
    setVolume(nextVol);
    if (previewPlaying) {
      soundManager.setAmbientOverrideVolume(soundEnabled ? nextVol : 0.01);
    }
  };

  const handleSelectLocalAudio = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    if (localObjectUrlRef.current) {
      URL.revokeObjectURL(localObjectUrlRef.current);
    }
    const url = URL.createObjectURL(file);
    localObjectUrlRef.current = url;
    setAudioLoadError(null);
    setCustomAudioUrl(url);
    setCustomAudioTitle(file.name.replace(/\.[^.]+$/, ""));
  };

  const handleApplyCustomMinutes = () => {
    const parsed = Number.parseInt(customMinutesInput.trim(), 10);
    if (!Number.isNaN(parsed) && parsed >= 1 && parsed <= 180) {
      setDurationMinutes(parsed);
      setCustomMinutesInput("");
    }
  };

  const handleStartImmersive = () => {
    soundManager.stopAllStreams();
    setPreviewPlaying(false);
    if (soundEnabled) {
      playBellByType(activeScene.audioConfig.bellType, volume);
    }
    setInImmersiveSession(true);
  };

  const handleCompleteSession = (completedMinutes: number) => {
    void recordChantingSession(
      completedMinutes,
      activeScene.sceneId,
      activeScene.sceneName,
      { category: activeScene.category },
    );
  };

  const realmTone =
    activeRealm === "daoist" ? "daoist" : "default";

  // Category-filtered audio tracks for current realm
  const filteredAudioCatalog = RETREAT_AUDIO_CATALOG.filter((item) => {
    if (!activeRealm) return true;
    if (activeRealm === "buddhist") return item.category !== "daoist";
    if (activeRealm === "daoist") return item.category !== "buddhist";
    return item.category === "nature";
  });

  const filteredCloudTracks = chantingTracks.filter((track) => {
    if (activeRealm === "buddhist") return track.parkSlug === "buddhist";
    if (activeRealm === "daoist") return track.parkSlug === "daoist";
    return track.parkSlug === "culture";
  });

  return (
    <AppShell forceActivePath="/meditation" realmTone={realmTone}>
      {/* Full-Screen Distraction-Free Immersive View */}
      {inImmersiveSession && (
        <ImmersiveRetreatSession
          scene={activeScene}
          durationMinutes={durationMinutes}
          initialSoundEnabled={soundEnabled}
          initialSoundType={soundType}
          initialVolume={volume}
          initialBreathEnabled={breathEnabled}
          initialBreathMode={breathMode}
          initialBreathVisual={breathVisual}
          initialInhaleSec={inhaleSec}
          initialExhaleSec={exhaleSec}
          initialPhraseId={selectedPhraseId}
          customAudioUrl={customAudioUrl}
          customAudioTitle={customAudioTitle}
          initialLoopAudio={loopAudio}
          onCompleteSession={handleCompleteSession}
          onCloseSession={() => setInImmersiveSession(false)}
          onExitToHome={returnToRetreatHome}
        />
      )}

      {/* =========================================================
       * VIEW 1: 云上静修独立首页（3 个清晰入口 + 底部辅助栏）
       * ========================================================= */}
      {!activeRealm ? (
        <div className="space-y-8">
          {/* Atmospheric Hero */}
          <section className="relative overflow-hidden rounded-3xl border border-[#e2d7c5] bg-[#1a2426] dark:border-[#332922]">
            <div className="relative h-64 sm:h-72 md:h-80">
              <ResilientImage
                src={RETREAT_HERO.image}
                alt="云海山岚间的东方静修意境"
                tone="neutral"
                fallbackTitle="云上静修"
                fallbackGradient={RETREAT_HERO.fallbackGradient}
                className="animate-camera-push h-full w-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/84 via-black/40 to-transparent" />
              <SacredEnvironmentLayer
                variant="meditation"
                showLantern={false}
                showLotus={false}
              />
              <div className="absolute inset-x-0 bottom-0 flex flex-wrap items-end justify-between gap-4 p-6 md:p-9">
                <div className="max-w-xl">
                  <p className="text-xs font-medium tracking-[0.2em] text-[#e5c17c]">
                    {RETREAT_HERO.tagline}
                  </p>
                  <h1 className="mt-1.5 font-serif-display text-3xl font-bold text-[#fff8eb] md:text-4xl">
                    {RETREAT_HERO.title}
                  </h1>
                  <p className="mt-2 text-sm leading-relaxed text-[#f5ece0]/90 md:text-base">
                    {RETREAT_HERO.subtitle}
                  </p>
                </div>

                <div className="flex items-center gap-3 text-xs text-[#f5ece0]/85 tabular-nums">
                  <span>当前默认 {durationMinutes} 分钟</span>
                  <span>·</span>
                  <span>
                    累计 {totalChantingMinutes} 分钟（{chantingSessionsCount} 次）
                  </span>
                </div>
              </div>
            </div>
          </section>

          {/* 3 Realm Portals */}
          <section>
            <div className="mb-4 flex items-baseline justify-between gap-2">
              <div>
                <h2 className="font-serif-display text-xl font-bold text-[#2c221e] dark:text-[#efe7da] md:text-2xl">
                  选择静修之境
                </h2>
                <p className="mt-1 text-xs text-[#6e5d4f] dark:text-[#b2a18f] md:text-sm">
                  佛道双境独立营造，自然之境无门槛开放；点选即可直接进入对应场景群
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
              {RETREAT_REALMS.map((realm) => {
                const count = getRetreatScenesByRealm(realm.id).length;
                return (
                  <button
                    key={realm.id}
                    type="button"
                    onClick={() => enterRealm(realm.id)}
                    className="group relative flex min-h-[300px] flex-col justify-end overflow-hidden rounded-2xl border border-[#e2d7c5] bg-[#1e2324] text-left transition-all duration-200 hover:-translate-y-0.5 active:scale-[0.99] cursor-pointer dark:border-[#332922]"
                  >
                    <ResilientImage
                      src={realm.image}
                      alt={realm.title}
                      tone={realm.id}
                      fallbackTitle={realm.title}
                      fallbackGradient={realm.fallbackGradient}
                      className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.04]"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/88 via-black/42 to-transparent" />
                    <div className="relative z-10 p-6">
                      <p className={`text-xs font-medium tracking-wider ${realm.accentClass}`}>
                        {realm.englishSubtitle} · {count} 个场景
                      </p>
                      <h3 className="mt-1.5 font-serif-display text-2xl font-bold text-[#fff8eb]">
                        {realm.title}
                      </h3>
                      <p className="mt-2 text-xs leading-relaxed text-[#f5ece0]/88">
                        {realm.description}
                      </p>
                      <span className={`mt-4 inline-flex items-center gap-1.5 text-xs font-bold ${realm.accentClass}`}>
                        <span>进入{realm.title}</span>
                        <ArrowRight size={14} />
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </section>

          {/* Bottom Utility Bar: 静修记录 / 声音设置 / 时长设置 */}
          <section className="rounded-2xl border border-[#e2d7c5] bg-[#fcf9f2] p-5 dark:border-[#332922] dark:bg-[#1d1815]">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              <button
                type="button"
                onClick={() =>
                  setHomeDrawer((d) => (d === "records" ? null : "records"))
                }
                className={`flex min-h-[54px] items-center justify-between rounded-xl border px-4 py-3 text-left text-xs font-bold transition-colors cursor-pointer ${
                  homeDrawer === "records"
                    ? "border-[#922e25] bg-[#922e25] text-[#fff8eb]"
                    : "border-[#e2d7c5] bg-[#f6f1e7] text-[#2c221e] hover:bg-[#ebe2d2] dark:border-[#332922] dark:bg-[#241d19] dark:text-[#efe7da]"
                }`}
              >
                <span className="flex items-center gap-2">
                  <Clock size={16} />
                  <span>静修记录</span>
                </span>
                <span className="opacity-80 tabular-nums">
                  {chantingSessionsCount} 次
                </span>
              </button>

              <button
                type="button"
                onClick={() =>
                  setHomeDrawer((d) => (d === "audio" ? null : "audio"))
                }
                className={`flex min-h-[54px] items-center justify-between rounded-xl border px-4 py-3 text-left text-xs font-bold transition-colors cursor-pointer ${
                  homeDrawer === "audio"
                    ? "border-[#1f4e45] bg-[#1f4e45] text-[#f3f8f5]"
                    : "border-[#e2d7c5] bg-[#f6f1e7] text-[#2c221e] hover:bg-[#ebe2d2] dark:border-[#332922] dark:bg-[#241d19] dark:text-[#efe7da]"
                }`}
              >
                <span className="flex items-center gap-2">
                  {soundEnabled ? <Volume2 size={16} /> : <VolumeX size={16} />}
                  <span>声音设置</span>
                </span>
                <span className="opacity-80 tabular-nums">
                  {soundEnabled ? `${Math.round(volume * 100)}%` : "已静音"}
                </span>
              </button>

              <button
                type="button"
                onClick={() =>
                  setHomeDrawer((d) => (d === "duration" ? null : "duration"))
                }
                className={`flex min-h-[54px] items-center justify-between rounded-xl border px-4 py-3 text-left text-xs font-bold transition-colors cursor-pointer ${
                  homeDrawer === "duration"
                    ? "border-[#b88b44] bg-[#b88b44] text-[#1f1612]"
                    : "border-[#e2d7c5] bg-[#f6f1e7] text-[#2c221e] hover:bg-[#ebe2d2] dark:border-[#332922] dark:bg-[#241d19] dark:text-[#efe7da]"
                }`}
              >
                <span className="flex items-center gap-2">
                  <SlidersHorizontal size={16} />
                  <span>时长设置</span>
                </span>
                <span className="opacity-80 tabular-nums">
                  {durationMinutes} 分钟
                </span>
              </button>
            </div>

            {/* Expandable Utility Drawer Content */}
            {homeDrawer === "records" && (
              <div className="mt-4 border-t border-[#e2d7c5] pt-4 dark:border-[#332922]">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="text-xs text-[#6e5d4f] dark:text-[#b2a18f]">
                    仅保存于本地或本人验证账号，不设连续天数压力或功德排行榜。
                  </p>
                  <button
                    type="button"
                    onClick={() =>
                      updateSettings({
                        recordRetreatLogs: !(settings.recordRetreatLogs ?? true),
                      })
                    }
                    className={`rounded-lg px-3 py-1.5 text-xs font-semibold cursor-pointer ${
                      (settings.recordRetreatLogs ?? true)
                        ? "bg-[#1f4e45] text-[#f3f8f5]"
                        : "bg-[#ebe2d2] text-[#4c362a] dark:bg-[#2a221d] dark:text-[#dccbb6]"
                    }`}
                  >
                    {(settings.recordRetreatLogs ?? true)
                      ? "记录功能：开启"
                      : "记录功能：已关闭"}
                  </button>
                </div>

                {chantingLogs.length === 0 ? (
                  <p className="mt-3 rounded-xl bg-[#f6f1e7] p-4 text-center text-xs text-[#6e5d4f] dark:bg-[#241d19] dark:text-[#b2a18f]">
                    尚无静修记录，选一处喜欢之境安静停留片刻即可。
                  </p>
                ) : (
                  <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
                    {chantingLogs.slice(0, 6).map((log) => (
                      <div
                        key={log.id}
                        className="flex items-center justify-between rounded-xl bg-[#f6f1e7] px-3.5 py-2.5 text-xs dark:bg-[#241d19]"
                      >
                        <span className="truncate pr-2 font-semibold text-[#2c221e] dark:text-[#efe7da]">
                          {log.scriptureTitle}
                        </span>
                        <span className="shrink-0 text-[#6e5d4f] tabular-nums dark:text-[#b2a18f]">
                          {log.minutes} 分钟 ·{" "}
                          {new Date(log.createdAtMs).toLocaleDateString("zh-CN")}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {homeDrawer === "audio" && (
              <div className="mt-4 space-y-3 border-t border-[#e2d7c5] pt-4 dark:border-[#332922]">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <button
                      type="button"
                      onClick={() => setSoundEnabled((s) => !s)}
                      className="rounded-lg bg-[#ebe2d2] px-3 py-1.5 text-xs font-bold text-[#2c221e] cursor-pointer dark:bg-[#2a221d] dark:text-[#efe7da]"
                    >
                      {soundEnabled ? "当前：有声" : "当前：静音"}
                    </button>
                    <input
                      type="range"
                      min={0.1}
                      max={1}
                      step={0.05}
                      value={volume}
                      onChange={(e) => handleVolumeChange(Number(e.target.value))}
                      aria-label="音量"
                      className="w-32 accent-[#1f4e45] cursor-pointer"
                    />
                    <span className="text-xs text-[#6e5d4f] tabular-nums dark:text-[#b2a18f]">
                      {Math.round(volume * 100)}%
                    </span>
                  </div>

                  <p className="text-[11px] text-[#6e5d4f] dark:text-[#b2a18f]">
                    点击下方任意声景试听（绝不自动播放）
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">
                  {RETREAT_AUDIO_CATALOG.map((sound) => {
                    const active = previewPlaying && soundType === sound.id;
                    return (
                      <button
                        key={sound.id}
                        type="button"
                        onClick={() => handleTogglePreviewSound(sound.id)}
                        className={`rounded-xl border px-3 py-2 text-left text-xs transition-colors cursor-pointer ${
                          active
                            ? "border-[#1f4e45] bg-[#1f4e45] text-[#f3f8f5]"
                            : "border-[#e2d7c5] bg-[#f6f1e7] text-[#2c221e] dark:border-[#332922] dark:bg-[#241d19] dark:text-[#efe7da]"
                        }`}
                      >
                        <p className="font-semibold">{sound.label}</p>
                        <p className="mt-0.5 text-[10px] opacity-80">
                          {active ? "试听中 · 点击暂停" : sound.desc}
                        </p>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {homeDrawer === "duration" && (
              <div className="mt-4 space-y-3 border-t border-[#e2d7c5] pt-4 dark:border-[#332922]">
                <div className="flex flex-wrap items-center gap-2">
                  {DURATION_PRESETS.map((min) => (
                    <button
                      key={min}
                      type="button"
                      onClick={() => {
                        setDurationMinutes(min);
                        updateSettings({ defaultRetreatMinutes: min });
                      }}
                      className={`min-h-[38px] rounded-xl px-4 text-xs font-semibold tabular-nums cursor-pointer ${
                        durationMinutes === min
                          ? "bg-[#922e25] text-[#fff8eb]"
                          : "bg-[#f6f1e7] text-[#4c362a] dark:bg-[#241d19] dark:text-[#dccbb6]"
                      }`}
                    >
                      {min} 分钟
                    </button>
                  ))}
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <input
                    type="number"
                    min={1}
                    max={180}
                    value={customMinutesInput}
                    onChange={(e) => setCustomMinutesInput(e.target.value)}
                    placeholder="自定义时长 (1-180 分钟)"
                    className="min-h-[38px] w-48 rounded-xl border border-[#e2d7c5] bg-[#f6f1e7] px-3 text-xs text-[#2c221e] focus:outline-none dark:border-[#332922] dark:bg-[#241d19] dark:text-[#efe7da]"
                  />
                  <button
                    type="button"
                    onClick={handleApplyCustomMinutes}
                    className="min-h-[38px] rounded-xl bg-[#ebe2d2] px-4 text-xs font-bold text-[#4c362a] cursor-pointer dark:bg-[#2a221d] dark:text-[#dccbb6]"
                  >
                    应用时长
                  </button>
                </div>
              </div>
            )}
          </section>

          {/* Subtle link to shared community schedule */}
          <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-[#e2d7c5] bg-[#fcf9f2] px-5 py-4 dark:border-[#332922] dark:bg-[#1d1815]">
            <div>
              <p className="flex items-center gap-1.5 text-sm font-bold text-[#2c221e] dark:text-[#efe7da]">
                <Users size={15} className="text-[#922e25] dark:text-[#d4a85d]" />
                <span>同心共修安排</span>
              </p>
              <p className="mt-0.5 text-xs text-[#6e5d4f] dark:text-[#b2a18f]">
                可自愿报名固定时段安静同行，无任何社交聊天或打卡排名压力。
              </p>
            </div>
            <button
              type="button"
              onClick={() => navigate("/community")}
              className="inline-flex min-h-[38px] items-center gap-1.5 rounded-xl bg-[#ebe2d2] px-4 text-xs font-bold text-[#4c362a] hover:opacity-90 cursor-pointer dark:bg-[#2a221d] dark:text-[#dccbb6]"
            >
              <span>查看共修</span>
              <ArrowRight size={13} />
            </button>
          </div>
        </div>
      ) : (
        /* =========================================================
         * VIEW 2: 专属静修领域界面（佛境 6 场景 / 道境 5 场景 / 自然 6 场景）
         * ========================================================= */
        <div className="space-y-6">
          {/* Top Navigation Bar inside Realm */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <button
              type="button"
              onClick={returnToRetreatHome}
              className="inline-flex min-h-[40px] items-center gap-1.5 rounded-xl border border-[#e2d7c5] bg-[#fcf9f2] px-3.5 py-2 text-xs font-bold text-[#2c221e] hover:bg-[#ebe2d2] cursor-pointer dark:border-[#332922] dark:bg-[#1d1815] dark:text-[#efe7da]"
            >
              <ArrowLeft size={14} />
              <span>返回云上静修首页</span>
            </button>

            <div className="flex gap-1.5 rounded-xl bg-[#ebe2d2] p-1 dark:bg-[#2a221d]">
              {RETREAT_REALMS.map((realm) => (
                <button
                  key={realm.id}
                  type="button"
                  onClick={() => enterRealm(realm.id)}
                  className={`min-h-[36px] rounded-lg px-3.5 py-1.5 text-xs font-bold whitespace-nowrap cursor-pointer ${
                    activeRealm === realm.id
                      ? realm.id === "daoist"
                        ? "bg-[#1f4e45] text-[#f3f8f5]"
                        : "bg-[#922e25] text-[#fff8eb]"
                      : "text-[#4c362a] dark:text-[#dccbb6]"
                  }`}
                >
                  {realm.title}
                </button>
              ))}
            </div>
          </div>

          {/* Distinct Scene Selector Strip (every scene shows its own dedicated visual!) */}
          <div className="no-scrollbar flex gap-3 overflow-x-auto pb-1">
            {getRetreatScenesByRealm(activeRealm).map((scene) => {
              const selected = scene.sceneId === activeScene.sceneId;
              return (
                <button
                  key={scene.sceneId}
                  type="button"
                  onClick={() => handleWalkToScene(scene)}
                  className={`group relative flex w-44 shrink-0 flex-col overflow-hidden rounded-2xl border text-left transition-all cursor-pointer ${
                    selected
                      ? "border-[#b88b44] ring-2 ring-[#b88b44]/35"
                      : "border-[#e2d7c5] opacity-85 hover:opacity-100 dark:border-[#332922]"
                  }`}
                >
                  <div className="relative h-24 w-full">
                    <ResilientImage
                      src={scene.primaryImage}
                      alt={scene.sceneName}
                      tone={scene.category}
                      fallbackTitle={scene.sceneName}
                      fallbackGradient={scene.fallbackGradient}
                      className="h-full w-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-transparent to-transparent" />
                    <span className="absolute right-2.5 bottom-2 left-2.5 truncate font-serif-display text-sm font-bold text-[#fff8eb]">
                      {scene.sceneName}
                    </span>
                  </div>
                  <div className="bg-[#fcf9f2] px-3 py-2 dark:bg-[#1d1815]">
                    <p className="truncate text-[11px] text-[#6e5d4f] dark:text-[#b2a18f]">
                      {scene.subtitle}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Main Workspace Split */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
            {/* Left 7 Cols: Scene Preview + Scene-Specific Interactive Practice */}
            <div className="space-y-5 lg:col-span-7">
              <section className="overflow-hidden rounded-3xl border border-[#e2d7c5] bg-[#161c1d] dark:border-[#332922]">
                <SpatialViewport2D5
                  realm={activeScene.category}
                  spatialNode={activeSpatialNode}
                  activeWalk={activeWalk}
                  settlingFade={settlingFade}
                  onWalkMidpoint={handleWalkMidpoint}
                  onWalkComplete={handleWalkComplete}
                  onWalkCancel={handleWalkCancel}
                  onWalkToConnection={handleWalkToConnection}
                >
                  <div className="relative h-72 sm:h-80 md:h-96">
                    <ResilientImage
                      src={activeScene.primaryImage}
                      alt={activeScene.sceneName}
                      tone={activeScene.category}
                      fallbackTitle={activeScene.sceneName}
                      fallbackGradient={activeScene.fallbackGradient}
                      className="h-full w-full object-cover"
                    />
                    <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/84 via-black/30 to-transparent" />
                    <RetreatSceneAtmosphere
                      category={activeScene.category}
                      effects={activeScene.animationConfig.effects}
                      mistDensity={activeScene.animationConfig.mistDensity}
                    />

                    <div className="absolute inset-x-0 bottom-0 p-6">
                      <p className="text-xs font-medium tracking-wider text-[#e5c17c]">
                        {activeScene.categoryLabel} · {activeScene.subtitle}
                      </p>
                      <h2 className="mt-1 font-serif-display text-2xl font-bold text-[#fff8eb] md:text-3xl">
                        {activeScene.sceneName}
                      </h2>
                      <p className="mt-2 max-w-2xl text-xs leading-relaxed text-[#f5ece0]/90 sm:text-sm">
                        {activeScene.description}
                      </p>

                      <div className="mt-4 flex flex-wrap items-center gap-3">
                        <button
                          type="button"
                          onClick={handleStartImmersive}
                          className="inline-flex min-h-[46px] items-center gap-2 rounded-xl bg-[#922e25] px-6 py-2.5 text-sm font-bold text-[#fff8eb] shadow-md transition-transform hover:opacity-95 active:scale-[0.98] cursor-pointer"
                        >
                          <Play size={16} />
                          <span>开始沉浸静修（{durationMinutes} 分钟）</span>
                        </button>
                        <span className="text-xs text-[#f5ece0]/75">
                          全屏无打扰 · 结束音：{RETREAT_BELL_LABELS[activeScene.audioConfig.bellType]}
                        </span>
                      </div>
                    </div>
                  </div>
                </SpatialViewport2D5>
              </section>

              {/* Scene Cultural Context & Special Scene Modes */}
              {activeScene.featureConfig.mode === "woodfish" && (
                <RetreatWoodfishPanel
                  volume={volume}
                  soundEnabled={soundEnabled}
                  onToggleSound={() => setSoundEnabled((s) => !s)}
                />
              )}

              {activeScene.featureConfig.mode === "beads" && (
                <RetreatBeadsPanel
                  volume={volume}
                  soundEnabled={soundEnabled}
                  onToggleSound={() => setSoundEnabled((s) => !s)}
                />
              )}

              {activeScene.featureConfig.mode === "nianfo" && (
                <RetreatNianfoPanel
                  selectedPhraseId={selectedPhraseId}
                  onSelectPhrase={setSelectedPhraseId}
                />
              )}

              {activeScene.featureConfig.naturalViews && (
                <div className="rounded-2xl border border-[#e2d7c5] bg-[#fcf9f2] p-5 dark:border-[#332922] dark:bg-[#1d1815]">
                  <p className="text-xs font-bold text-[#1f4e45] dark:text-[#86bfb0]">
                    切换观静视角
                  </p>
                  <div className="mt-2.5 flex flex-wrap gap-2">
                    {activeScene.featureConfig.naturalViews.map((view) => (
                      <button
                        key={view.id}
                        type="button"
                        onClick={() => setNaturalViewId(view.id)}
                        className={`min-h-[36px] rounded-xl px-3.5 text-xs font-semibold cursor-pointer ${
                          naturalViewId === view.id
                            ? "bg-[#1f4e45] text-[#f3f8f5]"
                            : "bg-[#f6f1e7] text-[#4c362a] dark:bg-[#241d19] dark:text-[#dccbb6]"
                        }`}
                      >
                        {view.label}
                      </button>
                    ))}
                  </div>
                  <p className="mt-3 font-serif-display text-sm leading-relaxed text-[#2c221e] dark:text-[#efe7da]">
                    “
                    {
                      (
                        activeScene.featureConfig.naturalViews.find(
                          (v) => v.id === naturalViewId,
                        ) || activeScene.featureConfig.naturalViews[0]
                      ).prompt
                    }
                    ”
                  </p>
                </div>
              )}

              <div className="rounded-2xl border border-[#e2d7c5] bg-[#fcf9f2] p-5 dark:border-[#332922] dark:bg-[#1d1815]">
                <h3 className="flex items-center gap-1.5 text-sm font-bold text-[#2c221e] dark:text-[#efe7da]">
                  <Sparkles size={15} className="text-[#b88b44]" />
                  <span>场景说明与文化背景</span>
                </h3>
                <p className="mt-2 text-xs leading-relaxed text-[#4c362a] dark:text-[#dccbb6]">
                  {activeScene.culturalNote}
                </p>

                {activeScene.featureConfig.helperNote && (
                  <p className="mt-2.5 rounded-xl bg-[#f6f1e7] px-3.5 py-2.5 text-xs text-[#6e5d4f] dark:bg-[#241d19] dark:text-[#b2a18f]">
                    {activeScene.featureConfig.helperNote}
                  </p>
                )}

                {activeRealm === "daoist" && (
                  <div className="mt-4 border-t border-[#e2d7c5] pt-3 dark:border-[#332922]">
                    <p className="text-xs font-bold text-[#1f4e45] dark:text-[#86bfb0]">
                      {DAOIST_RETREAT_CULTURE.title}
                    </p>
                    {DAOIST_RETREAT_CULTURE.paragraphs.map((p, i) => (
                      <p
                        key={i}
                        className="mt-1.5 text-xs leading-relaxed text-[#6e5d4f] dark:text-[#b2a18f]"
                      >
                        {p}
                      </p>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Right 5 Cols: Time, Breathing, and Audio Configuration */}
            <aside className="space-y-5 lg:col-span-5">
              {/* 1. 时长设置 */}
              <section className="rounded-2xl border border-[#e2d7c5] bg-[#fcf9f2] p-5 dark:border-[#332922] dark:bg-[#1d1815]">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-[#2c221e] dark:text-[#efe7da]">
                    静修时长设置
                  </h3>
                  <span className="font-serif-display text-base font-bold text-[#922e25] tabular-nums dark:text-[#d4a85d]">
                    {durationMinutes} 分钟
                  </span>
                </div>

                <div className="mt-3 grid grid-cols-3 gap-2">
                  {DURATION_PRESETS.map((min) => (
                    <button
                      key={min}
                      type="button"
                      onClick={() => setDurationMinutes(min)}
                      className={`min-h-[40px] rounded-xl text-xs font-semibold tabular-nums cursor-pointer ${
                        durationMinutes === min
                          ? "bg-[#922e25] text-[#fff8eb]"
                          : "bg-[#f6f1e7] text-[#4c362a] dark:bg-[#241d19] dark:text-[#dccbb6]"
                      }`}
                    >
                      {min} 分钟
                    </button>
                  ))}
                </div>

                <div className="mt-3 flex gap-2">
                  <input
                    type="number"
                    min={1}
                    max={180}
                    value={customMinutesInput}
                    onChange={(e) => setCustomMinutesInput(e.target.value)}
                    placeholder="自定义 (1-180分)"
                    className="min-h-[38px] flex-1 rounded-xl border border-[#e2d7c5] bg-[#f6f1e7] px-3 text-xs text-[#2c221e] focus:outline-none dark:border-[#332922] dark:bg-[#241d19] dark:text-[#efe7da]"
                  />
                  <button
                    type="button"
                    onClick={handleApplyCustomMinutes}
                    className="min-h-[38px] rounded-xl bg-[#ebe2d2] px-3.5 text-xs font-bold text-[#4c362a] cursor-pointer dark:bg-[#2a221d] dark:text-[#dccbb6]"
                  >
                    确定
                  </button>
                </div>
              </section>

              {/* 2. 呼吸引导配置 */}
              <section className="rounded-2xl border border-[#e2d7c5] bg-[#fcf9f2] p-5 dark:border-[#332922] dark:bg-[#1d1815]">
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
                  active={false}
                  tone={activeScene.category}
                />
              </section>

              {/* 3. 声音与背景音轨配置 */}
              <section className="rounded-2xl border border-[#e2d7c5] bg-[#fcf9f2] p-5 dark:border-[#332922] dark:bg-[#1d1815]">
                <div className="flex items-center justify-between gap-2">
                  <h3 className="text-sm font-bold text-[#2c221e] dark:text-[#efe7da]">
                    静修声景与音量
                  </h3>
                  <button
                    type="button"
                    onClick={() => {
                      const next = !soundEnabled;
                      setSoundEnabled(next);
                      if (!next && previewPlaying) {
                        soundManager.stopAllStreams();
                        setPreviewPlaying(false);
                      }
                    }}
                    className={`inline-flex min-h-[32px] items-center gap-1 rounded-lg px-2.5 text-xs font-semibold cursor-pointer ${
                      soundEnabled
                        ? "bg-[#1f4e45] text-[#f3f8f5]"
                        : "bg-[#ebe2d2] text-[#4c362a] dark:bg-[#2a221d] dark:text-[#dccbb6]"
                    }`}
                  >
                    {soundEnabled ? <Volume2 size={14} /> : <VolumeX size={14} />}
                    <span>{soundEnabled ? "已开启" : "已静音"}</span>
                  </button>
                </div>

                <div className="mt-3 flex items-center gap-3">
                  <span className="text-xs text-[#6e5d4f] dark:text-[#b2a18f]">
                    音量
                  </span>
                  <input
                    type="range"
                    min={0.1}
                    max={1}
                    step={0.05}
                    value={volume}
                    onChange={(e) => handleVolumeChange(Number(e.target.value))}
                    className="flex-1 accent-[#922e25] cursor-pointer"
                  />
                  <span className="w-10 text-right text-xs text-[#6e5d4f] tabular-nums dark:text-[#b2a18f]">
                    {Math.round(volume * 100)}%
                  </span>
                </div>

                <div className="mt-3 grid grid-cols-2 gap-2">
                  {filteredAudioCatalog.map((sound) => {
                    const selected = soundType === sound.id;
                    const playingThis = previewPlaying && selected;
                    return (
                      <button
                        key={sound.id}
                        type="button"
                        onClick={() => handleTogglePreviewSound(sound.id)}
                        className={`rounded-xl border px-3 py-2 text-left text-xs transition-colors cursor-pointer ${
                          selected
                            ? "border-[#1f4e45] bg-[#e7f0eb] text-[#16362f] dark:border-[#2d6a5e] dark:bg-[#192d29] dark:text-[#d4efe6]"
                            : "border-[#e2d7c5] bg-[#f6f1e7] text-[#2c221e] dark:border-[#332922] dark:bg-[#241d19] dark:text-[#efe7da]"
                        }`}
                      >
                        <p className="font-semibold">{sound.label}</p>
                        <p className="mt-0.5 text-[10px] opacity-75">
                          {playingThis ? "正在试听 · 点击暂停" : sound.desc}
                        </p>
                      </button>
                    );
                  })}
                </div>

                {/* Optional Cloud / Local Audio Track */}
                <div className="mt-4 border-t border-[#e2d7c5] pt-3 dark:border-[#332922]">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="flex items-center gap-1 text-xs font-semibold text-[#2c221e] dark:text-[#efe7da]">
                      <Music size={14} className="text-[#b88b44]" />
                      <span>背景伴奏（可选）</span>
                    </span>
                    <div className="flex items-center gap-2">
                      {customAudioUrl && (
                        <button
                          type="button"
                          onClick={() => setLoopAudio((l) => !l)}
                          className={`inline-flex min-h-[30px] items-center gap-1 rounded-lg px-2 text-[11px] font-semibold cursor-pointer ${
                            loopAudio
                              ? "bg-[#922e25] text-[#fff8eb]"
                              : "bg-[#ebe2d2] text-[#4c362a] dark:bg-[#2a221d] dark:text-[#dccbb6]"
                          }`}
                        >
                          <Repeat size={11} />
                          <span>{loopAudio ? "循环" : "单次"}</span>
                        </button>
                      )}
                      <label className="inline-flex min-h-[30px] items-center gap-1 rounded-lg bg-[#ebe2d2] px-2.5 text-[11px] font-bold text-[#922e25] cursor-pointer dark:bg-[#2a221d] dark:text-[#d4a85d]">
                        <FileAudio size={12} />
                        <span>本地音频</span>
                        <input
                          type="file"
                          accept="audio/*"
                          onChange={handleSelectLocalAudio}
                          className="hidden"
                        />
                      </label>
                    </div>
                  </div>

                  {filteredCloudTracks.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {filteredCloudTracks.map((track) => (
                        <button
                          key={track.id}
                          type="button"
                          onClick={() => {
                            setAudioLoadError(null);
                            setCustomAudioUrl(track.audioUrl);
                            setCustomAudioTitle(track.title);
                          }}
                          className={`rounded-lg px-2.5 py-1 text-[11px] font-medium cursor-pointer ${
                            customAudioUrl === track.audioUrl
                              ? "bg-[#922e25] text-[#fff8eb]"
                              : "bg-[#f6f1e7] text-[#4c362a] dark:bg-[#241d19] dark:text-[#dccbb6]"
                          }`}
                        >
                          {track.title}
                        </button>
                      ))}
                    </div>
                  )}

                  {customAudioUrl && (
                    <div className="mt-2 flex items-center justify-between rounded-xl bg-[#f6f1e7] px-3 py-2 text-xs dark:bg-[#241d19]">
                      <span className="truncate pr-2 font-medium text-[#2c221e] dark:text-[#efe7da]">
                        已选伴奏：{customAudioTitle}
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          setCustomAudioUrl("");
                          setCustomAudioTitle("");
                        }}
                        className="shrink-0 text-[11px] text-[#922e25] hover:underline cursor-pointer dark:text-[#d4a85d]"
                      >
                        清除
                      </button>
                    </div>
                  )}

                  {audioLoadError && (
                    <p className="mt-2 text-xs text-[#922e25] dark:text-[#e5a89f]">
                      {audioLoadError}
                    </p>
                  )}
                </div>
              </section>
            </aside>
          </div>
        </div>
      )}
    </AppShell>
  );
}
