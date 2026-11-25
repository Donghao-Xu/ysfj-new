import {
  ArrowLeft,
  ArrowRight,
  ChevronRight,
  Compass,
  DoorOpen,
  Flame,
  Flower2,
  HandHeart,
  Heart,
  LogOut,
  Pause,
  Play,
  Sparkles,
  Volume2,
  VolumeX,
} from "lucide-react";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { AppShell } from "@/components/AppShell";
import { BuddhistHallStage } from "@/components/BuddhistHallStage";
import {
  SacredEnvironmentLayer,
  SceneTransitionCurtain,
} from "@/components/SacredAtmosphere";
import {
  FlowerOfferVisual,
  IncenseOfferVisual,
  LampOfferVisual,
  SacredChantingAura,
  WoodenFishInstrument,
  type FlowerStyle,
  type LampStyle,
} from "@/components/SacredInteractions";
import { SceneStageImage } from "@/components/SceneStageImage";
import {
  SpatialViewport2D5,
  type RoamingTransitionState,
} from "@/components/SpatialViewport2D5";
import { useAppState } from "@/context/AppContext";
import {
  BUDDHIST_GATE_SCENE,
  BUDDHIST_SCENES,
  type SceneConfig,
} from "@/data/scenes";
import { getSpatialNode, type SpatialConnection } from "@/data/spatialGraph";
import {
  playSingingBowlChime,
  playTempleBellSound,
  soundManager,
} from "@/lib/audio";
import {
  ACTION_LABELS,
  useScenePresence,
  type PractitionerAction,
} from "@/lib/presence";

const lampOptions: { id: LampStyle; name: string; meaning: string }[] = [
  { id: "lotus", name: "莲花心灯", meaning: "出尘不染，心境清朗" },
  { id: "liuli", name: "琉璃明灯", meaning: "通透澄明，照见本心" },
  { id: "butter", name: "长明酥油灯", meaning: "温暖相伴，绵延善意" },
];

const flowerOptions: { id: FlowerStyle; name: string; meaning: string }[] = [
  { id: "lotus", name: "清净莲花", meaning: "洁净庄严" },
  { id: "chrysanthemum", name: "秋庭清菊", meaning: "淡泊守静" },
  { id: "jasmine", name: "素馨茉莉", meaning: "清芬柔和" },
];

const BUDDHIST_DISPLAY_SCENES: SceneConfig[] = [
  ...BUDDHIST_SCENES,
  BUDDHIST_GATE_SCENE,
];

function resolveBuddhistScene(sceneParam: string | null): SceneConfig {
  if (!sceneParam) {
    return BUDDHIST_SCENES[0];
  }
  return (
    BUDDHIST_DISPLAY_SCENES.find((s) => s.sceneId === sceneParam) ||
    BUDDHIST_SCENES[0]
  );
}

export function BuddhistRealmPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const {
    settings,
    scriptures,
    chantingTracks,
    woodfishTotal,
    offeringsCount,
    incrementWoodfish,
    recordOffering,
    addPersonalWish,
  } = useAppState();

  const activeScene = resolveBuddhistScene(searchParams.get("scene"));
  const [enteredHall, setEnteredHall] = useState(false);
  const isInsideHall = Boolean(activeScene.hasInterior && enteredHall);

  const [transitionSeq, setTransitionSeq] = useState(0);
  const [ambientOn, setAmbientOn] = useState(false);
  const [volume, setVolume] = useState(settings.defaultVolume);
  const [roamTransition, setRoamTransition] = useState<RoamingTransitionState>({
    active: false,
    kind: "push-in",
    phase: "idle",
  });

  // Respectful worship interactions + animation sequence counters
  const [incenseLit, setIncenseLit] = useState<0 | 1 | 3>(0);
  const [incenseSeq, setIncenseSeq] = useState(0);
  const [selectedLamp, setSelectedLamp] = useState<LampStyle>("lotus");
  const [lampLit, setLampLit] = useState(false);
  const [lampSeq, setLampSeq] = useState(0);
  const [selectedFlower, setSelectedFlower] = useState<FlowerStyle>("lotus");
  const [flowerOffered, setFlowerOffered] = useState(false);
  const [flowerSeq, setFlowerSeq] = useState(0);
  const [sessionWoodfish, setSessionWoodfish] = useState(0);
  const [woodfishSeq, setWoodfishSeq] = useState(0);
  const [chantingPlaying, setChantingPlaying] = useState(false);
  const [manualAction, setManualAction] = useState<PractitionerAction | null>(
    null,
  );
  const [wishText, setWishText] = useState("");
  const [wishNotice, setWishNotice] = useState("");

  const manualActionTimerRef = useRef<number | null>(null);
  const wishTimerRef = useRef<number | null>(null);
  const roamTimerRef = useRef<number | null>(null);
  const roamSettleTimerRef = useRef<number | null>(null);
  const chantingAudioRef = useRef<HTMLAudioElement | null>(null);

  const spatialNode = getSpatialNode(activeScene.sceneId);

  const effectiveAction: PractitionerAction =
    manualAction ?? (chantingPlaying ? "chanting" : "idle");

  // Co-presence strictly activates only inside an entered hall interior
  const { peers, totalInScene } = useScenePresence({
    sceneId: activeScene.sceneId,
    religionType: "buddhist",
    currentAction: effectiveAction,
    enabled: isInsideHall,
  });

  const triggerAvatarAction = (
    action: PractitionerAction,
    durationMs = 2400,
  ) => {
    setManualAction(action);
    if (manualActionTimerRef.current) {
      window.clearTimeout(manualActionTimerRef.current);
    }
    manualActionTimerRef.current = window.setTimeout(() => {
      setManualAction(null);
    }, durationMs);
  };

  useEffect(() => {
    return () => {
      soundManager.stopAllStreams();
      if (manualActionTimerRef.current) {
        window.clearTimeout(manualActionTimerRef.current);
      }
      if (wishTimerRef.current) window.clearTimeout(wishTimerRef.current);
      if (roamTimerRef.current) window.clearTimeout(roamTimerRef.current);
      if (roamSettleTimerRef.current) {
        window.clearTimeout(roamSettleTimerRef.current);
      }
    };
  }, []);

  // Sync active 5-layer soundscape smoothly when switching Buddhist scenes (only if user already enabled sound)
  useEffect(() => {
    if (ambientOn) {
      soundManager.applySceneProfile(
        {
          ambient: activeScene.audioConfig.natureType,
          religious: "buddhist",
        },
        { startIfUnlocked: true },
      );
      soundManager.setAmbientOverrideVolume(volume);
    }
  }, [activeScene.sceneId, activeScene.audioConfig.natureType, ambientOn, volume]);

  const resetHallRitualState = () => {
    if (manualActionTimerRef.current) {
      window.clearTimeout(manualActionTimerRef.current);
    }
    setManualAction(null);
    setIncenseLit(0);
    setLampLit(false);
    setFlowerOffered(false);
    setChantingPlaying(false);
    if (chantingAudioRef.current) {
      chantingAudioRef.current.pause();
    }
  };

  const runSpatialSequence = (
    kind: RoamingTransitionState["kind"],
    label: string,
    onMidpoint: () => void,
    spatialCue: "gate-pass" | "hall-enter" | "hall-exit" = "gate-pass",
  ) => {
    if (roamTimerRef.current) window.clearTimeout(roamTimerRef.current);
    if (roamSettleTimerRef.current) {
      window.clearTimeout(roamSettleTimerRef.current);
    }

    soundManager.playSpatialCue("footstep", 3);
    soundManager.playSpatialCue(spatialCue);

    setRoamTransition({ active: true, kind, phase: "depart", label });
    roamTimerRef.current = window.setTimeout(() => {
      onMidpoint();
      setRoamTransition({ active: true, kind, phase: "arrive" });
      roamSettleTimerRef.current = window.setTimeout(() => {
        setRoamTransition({ active: false, kind: "push-in", phase: "idle" });
      }, 420);
    }, 440);
  };

  const selectScene = (nextSceneId: string) => {
    if (nextSceneId === activeScene.sceneId) return;
    resetHallRitualState();
    setEnteredHall(false);
    setSearchParams(
      nextSceneId === BUDDHIST_SCENES[0].sceneId ? {} : { scene: nextSceneId },
      { replace: false },
    );
    setTransitionSeq((s) => s + 1);
  };

  const handleWalkToConnection = (conn: SpatialConnection) => {
    runSpatialSequence(
      conn.transitionType,
      conn.label,
      () => selectScene(conn.targetSceneId),
      "gate-pass",
    );
  };

  const handleEnterHall = () => {
    if (!activeScene.hasInterior) return;
    runSpatialSequence(
      "push-in",
      `步入${activeScene.sceneName}`,
      () => {
        setEnteredHall(true);
        setTransitionSeq((s) => s + 1);
        playSingingBowlChime(volume * 0.65);
      },
      "hall-enter",
    );
  };

  const handleExitHall = () => {
    runSpatialSequence(
      "pull-back",
      "退至殿外正面",
      () => {
        resetHallRitualState();
        setEnteredHall(false);
        setTransitionSeq((s) => s + 1);
      },
      "hall-exit",
    );
  };

  const toggleAmbient = () => {
    if (ambientOn) {
      soundManager.stopAllStreams();
      setAmbientOn(false);
    } else {
      soundManager.applySceneProfile(
        {
          ambient: activeScene.audioConfig.natureType,
          religious: "buddhist",
          music: settings.musicTrackId,
        },
        { startIfUnlocked: true },
      );
      soundManager.setAmbientOverrideVolume(volume);
      setAmbientOn(true);
    }
  };

  const handleVolumeChange = (next: number) => {
    setVolume(next);
    if (ambientOn) {
      soundManager.setAmbientOverrideVolume(next);
    }
  };

  const handleSelectHall = (hallSceneId: string) => {
    if (hallSceneId === activeScene.sceneId) return;
    const target = BUDDHIST_DISPLAY_SCENES.find((s) => s.sceneId === hallSceneId);
    runSpatialSequence(
      "push-in",
      `前往${target?.sceneName || "佛殿"}`,
      () => selectScene(hallSceneId),
      "gate-pass",
    );
  };

  const handleHezhang = () => {
    if (!isInsideHall) return;
    triggerAvatarAction("hezhang", 2200);
    recordOffering("bow");
    soundManager.playSfx("bow", volume * 0.65);
  };

  const handleLifo = () => {
    if (!isInsideHall) return;
    triggerAvatarAction("lifo", 2600);
    recordOffering("bow");
    playTempleBellSound(volume * 0.55);
  };

  const handleLightIncense = (sticks: 1 | 3) => {
    if (!isInsideHall) return;
    setIncenseLit(sticks);
    setIncenseSeq((s) => s + 1);
    triggerAvatarAction("incense", 2400);
    recordOffering("incense");
    soundManager.playSfx("incense", volume * 0.75);
  };

  const handleLightIncenseFromBar = () => {
    if (!isInsideHall) return;
    if (incenseLit > 0) {
      handleLightIncense(incenseLit === 3 ? 1 : 3);
      return;
    }
    handleLightIncense(3);
  };

  const handleLightLamp = () => {
    if (!isInsideHall) return;
    setLampLit(true);
    setLampSeq((s) => s + 1);
    triggerAvatarAction("lamp", 2400);
    recordOffering("lamp");
    soundManager.playSfx("lamp", volume * 0.72);
  };

  const handleLightLampFromBar = () => {
    if (!isInsideHall) return;
    if (lampLit) {
      const idx = lampOptions.findIndex((item) => item.id === selectedLamp);
      const nextLamp = lampOptions[(idx + 1) % lampOptions.length].id;
      setSelectedLamp(nextLamp);
    }
    handleLightLamp();
  };

  const handleOfferFlower = () => {
    if (!isInsideHall) return;
    setFlowerOffered(true);
    setFlowerSeq((s) => s + 1);
    triggerAvatarAction("flower", 2400);
    recordOffering("flower");
    soundManager.playSfx("flower", volume * 0.72);
  };

  const handleOfferFlowerFromBar = () => {
    if (!isInsideHall) return;
    if (flowerOffered) {
      const idx = flowerOptions.findIndex((item) => item.id === selectedFlower);
      const nextFlower = flowerOptions[(idx + 1) % flowerOptions.length].id;
      setSelectedFlower(nextFlower);
    }
    handleOfferFlower();
  };

  const buddhistChantScripture =
    scriptures.find((s) => s.parkSlug === "buddhist") || scriptures[0];
  const buddhistChantTrack =
    chantingTracks.find((t) => t.parkSlug === "buddhist") || chantingTracks[0];

  const handleToggleChanting = () => {
    if (!isInsideHall) return;
    const next = !chantingPlaying;
    setChantingPlaying(next);
    if (next) {
      if (manualActionTimerRef.current) {
        window.clearTimeout(manualActionTimerRef.current);
      }
      setManualAction(null);
    }
    if (chantingAudioRef.current) {
      if (next) {
        chantingAudioRef.current.volume = volume;
        void chantingAudioRef.current.play().catch(() => {
          // Visual chanting aura continues smoothly even if track unavailable
        });
      } else {
        chantingAudioRef.current.pause();
      }
    }
  };

  const handleTapWoodfish = () => {
    if (!isInsideHall) return;
    setSessionWoodfish((c) => c + 1);
    setWoodfishSeq((s) => s + 1);
    triggerAvatarAction("woodfish", 1500);
    incrementWoodfish();
  };

  const handleSaveWish = (e: FormEvent) => {
    e.preventDefault();
    if (!wishText.trim()) return;
    addPersonalWish("buddhist", wishText);
    setWishText("");
    setWishNotice("心愿已安全记录在您的私人本地空间（仅自己可见）。");
    if (wishTimerRef.current) window.clearTimeout(wishTimerRef.current);
    wishTimerRef.current = window.setTimeout(() => setWishNotice(""), 3500);
  };

  const activeHallIndex = BUDDHIST_DISPLAY_SCENES.findIndex(
    (s) => s.sceneId === activeScene.sceneId,
  );
  const prevHall =
    activeHallIndex > 0 ? BUDDHIST_DISPLAY_SCENES[activeHallIndex - 1] : null;
  const nextHall =
    activeHallIndex >= 0 && activeHallIndex < BUDDHIST_DISPLAY_SCENES.length - 1
      ? BUDDHIST_DISPLAY_SCENES[activeHallIndex + 1]
      : null;

  const { interactionConfig, audioConfig } = activeScene;

  return (
    <AppShell forceActivePath="/worlds" realmTone="buddhist">
      <SceneTransitionCurtain
        type="buddhist-light"
        transitionKey={transitionSeq}
      />

      {/* Breadcrumb + Ambient Audio Control */}
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2.5">
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() =>
              isInsideHall ? handleExitHall() : navigate("/")
            }
            className="inline-flex min-h-[40px] items-center gap-1.5 text-sm font-medium text-[#4c362a] hover:text-[#922e25] cursor-pointer dark:text-[#dccbb6]"
          >
            <ArrowLeft size={16} />
            <span>{isInsideHall ? "退回殿外正面" : "返回首页"}</span>
          </button>

          <nav
            aria-label="层级路径"
            className="hidden items-center gap-1 text-xs text-[#857362] sm:flex dark:text-[#a79886]"
          >
            <button
              type="button"
              onClick={() => navigate("/")}
              className="hover:text-[#922e25] cursor-pointer"
            >
              首页
            </button>
            <ChevronRight size={12} />
            <button
              type="button"
              onClick={() => navigate("/worlds")}
              className="hover:text-[#922e25] cursor-pointer"
            >
              佛教梵境
            </button>
            <ChevronRight size={12} />
            <span className="font-semibold text-[#922e25] dark:text-[#d4a85d]">
              {activeScene.sceneName}（{isInsideHall ? "殿内礼敬" : "正面外观"}）
            </span>
          </nav>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-2 rounded-xl border border-[#e2d7c5] bg-[#fcf9f2] px-2.5 py-1 dark:border-[#332922] dark:bg-[#1d1815]">
            <button
              type="button"
              onClick={toggleAmbient}
              className={`inline-flex min-h-[32px] items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-medium transition-colors cursor-pointer ${
                ambientOn
                  ? "bg-[#922e25] text-[#fff8eb]"
                  : "text-[#4c362a] dark:text-[#dccbb6]"
              }`}
            >
              {ambientOn ? <Volume2 size={14} /> : <VolumeX size={14} />}
              <span>
                {ambientOn
                  ? `${audioConfig.natureLabel}：开`
                  : audioConfig.natureLabel}
              </span>
            </button>
            <input
              type="range"
              min={0.1}
              max={1}
              step={0.05}
              value={volume}
              onChange={(e) => handleVolumeChange(Number(e.target.value))}
              aria-label="佛教梵境音量"
              className="w-16 accent-[#922e25] cursor-pointer"
            />
          </div>
        </div>
      </div>

      <div className="animate-page-enter space-y-4">
        {/* Hall Selector Bar */}
        <section className="rounded-2xl border border-[#e2d7c5] bg-[#fcf9f2] px-4 py-3 dark:border-[#332922] dark:bg-[#1d1815]">
          <div className="mb-2.5 flex flex-wrap items-center justify-between gap-2">
            <div>
              <p className="text-xs font-medium text-[#922e25] dark:text-[#e5a89f]">
                佛教梵境 · {isInsideHall ? "殿内礼敬空间" : "殿外正面瞻礼（先观外观，步入大殿后再行礼敬）"}
              </p>
              <h1 className="font-serif-display text-lg font-bold leading-snug text-[#2c221e] sm:text-xl dark:text-[#efe7da]">
                {activeScene.sceneName}
              </h1>
            </div>
            <button
              type="button"
              onClick={() => navigate("/parks/buddhist")}
              className="inline-flex min-h-[38px] items-center gap-1.5 rounded-xl bg-[#ebe2d2] px-3.5 py-1.5 text-xs font-semibold text-[#4c362a] hover:opacity-90 cursor-pointer dark:bg-[#2a221d] dark:text-[#dccbb6]"
            >
              <Compass size={14} />
              <span>寺院建筑档案</span>
            </button>
          </div>

          <div className="no-scrollbar flex gap-2 overflow-x-auto pb-0.5">
            {BUDDHIST_DISPLAY_SCENES.map((scene) => {
              const active = scene.sceneId === activeScene.sceneId;
              return (
                <button
                  key={scene.sceneId}
                  type="button"
                  aria-current={active ? "page" : undefined}
                  onClick={() => handleSelectHall(scene.sceneId)}
                  className={`min-h-[40px] shrink-0 rounded-xl px-4 py-1.5 text-xs font-semibold whitespace-nowrap transition-all active:scale-[0.97] cursor-pointer ${
                    active
                      ? "bg-[#922e25] text-[#fff8eb] dark:bg-[#b5453a]"
                      : "bg-[#f6f1e7] text-[#4c362a] hover:bg-[#ebe2d2] dark:bg-[#241d19] dark:text-[#dccbb6]"
                  }`}
                >
                  {scene.sceneName}
                </button>
              );
            })}
          </div>
        </section>

        {/* Active Hall Visual Stage (Exterior: Pure Grand Architecture; Interior: Interactive Stage) */}
        <section className="grid grid-cols-1 items-start gap-6 lg:grid-cols-12">
          <div className="flex flex-col overflow-hidden rounded-2xl border border-[#e2d7c5] bg-[#2a1915] lg:col-span-7 dark:border-[#332922]">
            <SpatialViewport2D5
              realm="buddhist"
              spatialNode={spatialNode}
              isInsideHall={isInsideHall}
              transitionState={roamTransition}
              onWalkToConnection={handleWalkToConnection}
              onEnterInterior={activeScene.hasInterior ? handleEnterHall : undefined}
              onExitInterior={isInsideHall ? handleExitHall : undefined}
            >
              <div className="relative min-h-[300px] w-full aspect-[4/3] sm:aspect-[16/10] lg:aspect-[16/9] overflow-hidden">
                <div className="absolute inset-0">
                  <SceneStageImage
                    scene={activeScene}
                    imageMode={isInsideHall ? "interior" : "exterior"}
                    disableZoomMotion={isInsideHall}
                    className="h-full w-full object-cover object-center"
                  />
                </div>
                <div
                  className={`pointer-events-none absolute inset-0 ${
                    isInsideHall
                      ? "bg-gradient-to-b from-black/38 via-transparent to-black/24"
                      : "bg-gradient-to-b from-black/48 via-transparent to-black/75"
                  }`}
                />

                {/* 殿外瞻仰保留环境氛围光影；所有佛殿进入殿内后统一保持净洁空间，绝无漂浮提示或遮挡气泡 */}
                {!isInsideHall && (
                  <SacredEnvironmentLayer
                    variant="buddhist"
                    showLantern={false}
                    showLotus={false}
                  />
                )}

                {isInsideHall && (
                  <BuddhistHallStage
                    scene={activeScene}
                    selfAction={effectiveAction}
                    peers={peers}
                    incenseLit={incenseLit}
                    incenseSeq={incenseSeq}
                    lampLit={lampLit}
                    lampSeq={lampSeq}
                    selectedLamp={selectedLamp}
                    flowerOffered={flowerOffered}
                    flowerSeq={flowerSeq}
                    selectedFlower={selectedFlower}
                    woodfishSeq={woodfishSeq}
                    chantingPlaying={chantingPlaying}
                  />
                )}

                {/* 顶部安全渐变标题区（保证安全内边距与行高，适配手机/电脑且永不被裁切） */}
                <div className="pointer-events-none absolute inset-x-0 top-0 z-30 flex items-start justify-between gap-3 bg-gradient-to-b from-black/72 via-black/30 to-transparent px-4 pt-4 pb-8 sm:px-5 sm:pt-4.5">
                  <div className="min-w-0 flex-1 pr-2">
                    <p className="truncate text-[11px] leading-normal font-medium tracking-wider text-[#e5c17c] drop-shadow">
                      {activeScene.subtitle}
                    </p>
                    <h2 className="mt-0.5 pt-0.5 font-serif-display text-lg leading-[1.38] font-bold text-[#fff8eb] drop-shadow sm:text-xl md:text-2xl">
                      {activeScene.sceneName}
                    </h2>
                  </div>

                  {isInsideHall && (
                    <button
                      type="button"
                      onClick={handleExitHall}
                      className="pointer-events-auto inline-flex min-h-[36px] shrink-0 items-center gap-1.5 rounded-xl border border-[#e5c17c]/45 bg-[#1b120e]/80 px-3 py-1.5 text-[11px] font-semibold text-[#fff8eb] backdrop-blur-sm transition-colors hover:bg-[#2c1d16] cursor-pointer"
                    >
                      <LogOut size={13} />
                      <span>退至殿外</span>
                    </button>
                  )}
                </div>

                {/* Exterior Primary Entry CTA (Zero interactions shown on exterior!) */}
                {!isInsideHall && (
                  <div className="absolute inset-x-0 bottom-5 z-20 flex flex-col items-center px-4 text-center">
                    {activeScene.hasInterior ? (
                      <button
                        type="button"
                        onClick={handleEnterHall}
                        className="inline-flex min-h-[48px] items-center gap-2 rounded-xl bg-[#b88b44] px-7 py-3 text-sm font-bold text-[#1f1612] shadow-lg transition-all hover:opacity-95 active:scale-[0.97] cursor-pointer"
                      >
                        <DoorOpen size={17} />
                        <span>步入{activeScene.sceneName}（进入大殿）</span>
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handleSelectHall(BUDDHIST_SCENES[0].sceneId)}
                        className="inline-flex min-h-[48px] items-center gap-2 rounded-xl bg-[#b88b44] px-7 py-3 text-sm font-bold text-[#1f1612] shadow-lg transition-all hover:opacity-95 active:scale-[0.97] cursor-pointer"
                      >
                        <span>前往主殿 · 大雄宝殿</span>
                        <ArrowRight size={17} />
                      </button>
                    )}
                  </div>
                )}
              </div>
            </SpatialViewport2D5>

            {/* Instant Action Bar ONLY rendered inside hall interior */}
            {isInsideHall && (
              <div className="flex flex-wrap items-center justify-between gap-2.5 border-t border-[#432d26] bg-[#1e1411] px-4 py-3 text-xs">
                <div className="flex items-center gap-2 text-[11px]">
                  <span className="font-medium text-[#e5c17c]">
                    {ACTION_LABELS[effectiveAction]}
                  </span>
                  {totalInScene > 1 && (
                    <span className="text-[#c5b39c]/80 tabular-nums">
                      · 同殿共修 {totalInScene} 人
                    </span>
                  )}
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {interactionConfig.enableWorship && (
                    <>
                      <button
                        type="button"
                        onClick={handleHezhang}
                        className={`min-h-[38px] rounded-lg px-3 py-1.5 text-xs font-semibold transition-all active:scale-95 cursor-pointer ${
                          effectiveAction === "hezhang"
                            ? "bg-[#b88b44] text-[#1f1612]"
                            : "bg-[#30201b] text-[#f5ece0] hover:bg-[#3f2b24]"
                        }`}
                      >
                        合掌
                      </button>
                      <button
                        type="button"
                        onClick={handleLifo}
                        className={`min-h-[38px] rounded-lg px-3 py-1.5 text-xs font-semibold transition-all active:scale-95 cursor-pointer ${
                          effectiveAction === "lifo"
                            ? "bg-[#b88b44] text-[#1f1612]"
                            : "bg-[#30201b] text-[#f5ece0] hover:bg-[#3f2b24]"
                        }`}
                      >
                        礼佛
                      </button>
                    </>
                  )}
                  {interactionConfig.allowIncense && (
                    <button
                      type="button"
                      onClick={handleLightIncenseFromBar}
                      className={`min-h-[38px] rounded-lg px-3 py-1.5 text-xs font-semibold transition-all active:scale-95 cursor-pointer ${
                        effectiveAction === "incense"
                          ? "bg-[#b88b44] text-[#1f1612]"
                          : incenseLit > 0
                            ? "border border-[#b88b44]/60 bg-[#3a261f] text-[#fae4b8] hover:bg-[#493027]"
                            : "bg-[#30201b] text-[#f5ece0] hover:bg-[#3f2b24]"
                      }`}
                    >
                      上香
                    </button>
                  )}
                  {interactionConfig.allowLamp && (
                    <button
                      type="button"
                      onClick={handleLightLampFromBar}
                      className={`min-h-[38px] rounded-lg px-3 py-1.5 text-xs font-semibold transition-all active:scale-95 cursor-pointer ${
                        effectiveAction === "lamp"
                          ? "bg-[#b88b44] text-[#1f1612]"
                          : lampLit
                            ? "border border-[#b88b44]/60 bg-[#3a261f] text-[#fae4b8] hover:bg-[#493027]"
                            : "bg-[#30201b] text-[#f5ece0] hover:bg-[#3f2b24]"
                      }`}
                    >
                      点灯
                    </button>
                  )}
                  {interactionConfig.allowFlower && (
                    <button
                      type="button"
                      onClick={handleOfferFlowerFromBar}
                      className={`min-h-[38px] rounded-lg px-3 py-1.5 text-xs font-semibold transition-all active:scale-95 cursor-pointer ${
                        effectiveAction === "flower"
                          ? "bg-[#b88b44] text-[#1f1612]"
                          : flowerOffered
                            ? "border border-[#b88b44]/60 bg-[#3a261f] text-[#fae4b8] hover:bg-[#493027]"
                            : "bg-[#30201b] text-[#f5ece0] hover:bg-[#3f2b24]"
                      }`}
                    >
                      供花
                    </button>
                  )}
                  {interactionConfig.enableWoodfish && (
                    <button
                      type="button"
                      onClick={handleTapWoodfish}
                      className={`min-h-[38px] rounded-lg px-3 py-1.5 text-xs font-semibold transition-all active:scale-95 cursor-pointer ${
                        effectiveAction === "woodfish"
                          ? "bg-[#b88b44] text-[#1f1612]"
                          : "bg-[#30201b] text-[#f5ece0] hover:bg-[#3f2b24]"
                      }`}
                    >
                      敲木鱼
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Cultural Context Card */}
          <div className="flex flex-col justify-between rounded-2xl border border-[#e2d7c5] bg-[#fcf9f2] p-6 lg:col-span-5 dark:border-[#332922] dark:bg-[#1d1815]">
            <div className="space-y-4">
              <div>
                <h3 className="text-xs font-semibold tracking-wider text-[#922e25] dark:text-[#e5a89f]">
                  殿堂文化意涵
                </h3>
                <p className="mt-1.5 text-sm leading-relaxed text-[#2c221e] dark:text-[#efe7da]">
                  {activeScene.description}
                </p>
              </div>
              <div className="border-t border-[#e2d7c5] pt-3 dark:border-[#332922]">
                <h3 className="text-xs font-semibold tracking-wider text-[#6e5d4f] dark:text-[#b2a18f]">
                  建筑与艺术脉络
                </h3>
                <p className="mt-1 text-xs leading-relaxed text-[#4c362a] dark:text-[#dccbb6]">
                  {activeScene.culturalNotes}
                </p>
              </div>
              <div className="border-t border-[#e2d7c5] pt-3 dark:border-[#332922]">
                <h3 className="text-xs font-semibold tracking-wider text-[#6e5d4f] dark:text-[#b2a18f]">
                  传统礼敬仪轨
                </h3>
                <p className="mt-1 text-xs leading-relaxed text-[#4c362a] dark:text-[#dccbb6]">
                  {activeScene.traditionPractice}
                </p>
              </div>
            </div>

            <div className="mt-5 space-y-2.5 border-t border-[#e2d7c5] pt-4 dark:border-[#332922]">
              {activeScene.hasInterior ? (
                !isInsideHall ? (
                  <button
                    type="button"
                    onClick={handleEnterHall}
                    className="inline-flex min-h-[46px] w-full items-center justify-center gap-2 rounded-xl bg-[#b88b44] px-4 py-2.5 text-xs font-bold text-[#1f1612] transition-all hover:opacity-90 active:scale-[0.98] cursor-pointer"
                  >
                    <DoorOpen size={15} />
                    <span>步入{activeScene.sceneName}，开启殿内礼敬与共修</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleExitHall}
                    className="inline-flex min-h-[44px] w-full items-center justify-center gap-2 rounded-xl border border-[#e2d7c5] bg-[#f6f1e7] px-4 py-2 text-xs font-semibold text-[#4c362a] transition-colors hover:bg-[#ebe2d2] cursor-pointer dark:border-[#332922] dark:bg-[#241d19] dark:text-[#dccbb6]"
                  >
                    <LogOut size={14} />
                    <span>退至殿外，瞻仰{activeScene.sceneName}正面外观</span>
                  </button>
                )
              ) : (
                <button
                  type="button"
                  onClick={() => handleSelectHall(BUDDHIST_SCENES[0].sceneId)}
                  className="inline-flex min-h-[46px] w-full items-center justify-center gap-2 rounded-xl bg-[#b88b44] px-4 py-2.5 text-xs font-bold text-[#1f1612] transition-all hover:opacity-90 active:scale-[0.98] cursor-pointer"
                >
                  <span>前往大雄宝殿</span>
                  <ArrowRight size={14} />
                </button>
              )}

              <div className="flex items-center justify-between gap-2">
                <button
                  type="button"
                  disabled={!prevHall}
                  onClick={() => prevHall && handleSelectHall(prevHall.sceneId)}
                  className="inline-flex min-h-[38px] items-center gap-1 rounded-xl border border-[#e2d7c5] bg-[#f6f1e7] px-3 py-1.5 text-xs font-medium text-[#4c362a] disabled:opacity-40 cursor-pointer dark:border-[#332922] dark:bg-[#241d19] dark:text-[#dccbb6]"
                >
                  <ArrowLeft size={13} />
                  <span>{prevHall ? prevHall.sceneName : "已为首殿"}</span>
                </button>
                <button
                  type="button"
                  disabled={!nextHall}
                  onClick={() => nextHall && handleSelectHall(nextHall.sceneId)}
                  className="inline-flex min-h-[38px] items-center gap-1 rounded-xl border border-[#e2d7c5] bg-[#f6f1e7] px-3 py-1.5 text-xs font-medium text-[#4c362a] disabled:opacity-40 cursor-pointer dark:border-[#332922] dark:bg-[#241d19] dark:text-[#dccbb6]"
                >
                  <span>{nextHall ? `下一殿：${nextHall.sceneName}` : "已至末处"}</span>
                  <ArrowRight size={13} />
                </button>
              </div>

              {activeScene.linkedBuildingId ? (
                <button
                  type="button"
                  onClick={() =>
                    navigate(`/parks/buildings/${activeScene.linkedBuildingId}`)
                  }
                  className="inline-flex min-h-[42px] w-full items-center justify-center gap-1.5 rounded-xl bg-[#922e25] px-4 py-2 text-xs font-bold text-[#fff8eb] transition-transform active:scale-[0.98] hover:opacity-90 cursor-pointer dark:bg-[#b5453a]"
                >
                  <span>建筑档案：{activeScene.sceneName}详览</span>
                  <ArrowRight size={14} />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => navigate("/parks/buddhist")}
                  className="inline-flex min-h-[42px] w-full items-center justify-center gap-1.5 rounded-xl bg-[#922e25] px-4 py-2 text-xs font-bold text-[#fff8eb] transition-transform active:scale-[0.98] hover:opacity-90 cursor-pointer dark:bg-[#b5453a]"
                >
                  <span>前往寺院建筑档案全览</span>
                  <ArrowRight size={14} />
                </button>
              )}
            </div>
          </div>
        </section>

        {/* Interactive Worship Panel strictly visible ONLY after entering the hall interior */}
        {isInsideHall && (
          <section className="rounded-2xl border border-[#e2d7c5] bg-[#fcf9f2] p-6 dark:border-[#332922] dark:bg-[#1d1815]">
            <div className="mb-5 flex flex-wrap items-baseline justify-between gap-2 border-b border-[#e2d7c5] pb-4 dark:border-[#332922]">
              <div>
                <h2 className="font-serif-display text-xl font-bold text-[#2c221e] dark:text-[#efe7da]">
                  {activeScene.sceneName} · 殿内礼敬与静心互动
                </h2>
                <p className="mt-1 text-xs text-[#6e5d4f] dark:text-[#b2a18f]">
                  全部礼敬互动均为免费文化与静心体验，重在反观自心，不作功德买卖或排行。
                </p>
              </div>
              <span className="text-xs text-[#6e5d4f] tabular-nums dark:text-[#b2a18f]">
                累计合掌 {offeringsCount.bow} · 敬香 {offeringsCount.incense} · 供灯{" "}
                {offeringsCount.lamp} · 供花 {offeringsCount.flower}
              </span>
            </div>

            <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
              {/* 1. 合掌、礼佛与上香 */}
              {(interactionConfig.enableWorship || interactionConfig.allowIncense) && (
                <div className="flex flex-col justify-between rounded-xl border border-[#e2d7c5] bg-[#f6f1e7] p-4 dark:border-[#332922] dark:bg-[#241d19]">
                  <div>
                    <h3 className="text-sm font-bold text-[#2c221e] dark:text-[#efe7da]">
                      合掌 · 礼佛 · 上香
                    </h3>
                    <p className="mt-1 text-xs text-[#6e5d4f] dark:text-[#b2a18f]">
                      合掌收摄心念，礼佛致诚问讯，燃香轻烟徐徐上升。
                    </p>
                  </div>

                  {/* 内嵌香炉动态预览 */}
                  {interactionConfig.allowIncense && (
                    <div className="my-3 flex justify-center rounded-xl border border-[#e2d7c5]/80 bg-[#fcf9f2] py-2 dark:border-[#332922] dark:bg-[#1d1815]">
                      <IncenseOfferVisual
                        sticks={incenseLit}
                        incenseSeq={incenseSeq}
                        compact
                      />
                    </div>
                  )}

                  <div className="space-y-2.5">
                    {interactionConfig.enableWorship && (
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          type="button"
                          onClick={handleHezhang}
                          className="flex min-h-[42px] items-center justify-center gap-1.5 rounded-xl bg-[#922e25] px-3 py-2 text-xs font-bold text-[#fff8eb] transition-all hover:opacity-90 active:scale-[0.97] cursor-pointer dark:bg-[#b5453a]"
                        >
                          <HandHeart size={15} />
                          <span>合掌</span>
                        </button>
                        <button
                          type="button"
                          onClick={handleLifo}
                          className="flex min-h-[42px] items-center justify-center gap-1.5 rounded-xl border border-[#922e25] bg-[#fcf9f2] px-3 py-2 text-xs font-bold text-[#922e25] transition-all hover:bg-[#ebe2d2] active:scale-[0.97] cursor-pointer dark:border-[#d4a85d] dark:bg-[#1d1815] dark:text-[#d4a85d]"
                        >
                          <Sparkles size={15} />
                          <span>礼佛</span>
                        </button>
                      </div>
                    )}
                    {interactionConfig.allowIncense && (
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          type="button"
                          onClick={() => handleLightIncense(1)}
                          className={`min-h-[40px] rounded-xl px-3 py-2 text-xs font-semibold transition-all active:scale-[0.97] cursor-pointer ${
                            incenseLit === 1
                              ? "bg-[#b88b44] text-[#1f1612]"
                              : "border border-[#e2d7c5] bg-[#fcf9f2] text-[#4c362a] dark:border-[#332922] dark:bg-[#1d1815] dark:text-[#dccbb6]"
                          }`}
                        >
                          上香 · 一柱
                        </button>
                        <button
                          type="button"
                          onClick={() => handleLightIncense(3)}
                          className={`min-h-[40px] rounded-xl px-3 py-2 text-xs font-semibold transition-all active:scale-[0.97] cursor-pointer ${
                            incenseLit === 3
                              ? "bg-[#b88b44] text-[#1f1612]"
                              : "border border-[#e2d7c5] bg-[#fcf9f2] text-[#4c362a] dark:border-[#332922] dark:bg-[#1d1815] dark:text-[#dccbb6]"
                          }`}
                        >
                          上香 · 三柱
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* 2. 供灯互动 */}
              {interactionConfig.allowLamp && (
                <div className="flex flex-col justify-between rounded-xl border border-[#e2d7c5] bg-[#f6f1e7] p-4 dark:border-[#332922] dark:bg-[#241d19]">
                  <div>
                    <h3 className="text-sm font-bold text-[#2c221e] dark:text-[#efe7da]">
                      供灯（渐亮与温暖光晕）
                    </h3>
                    <p className="mt-1 text-xs text-[#6e5d4f] dark:text-[#b2a18f]">
                      点击后灯火逐渐点亮，散开温和光明：
                    </p>
                    <div className="mt-2.5 flex justify-center rounded-xl border border-[#e2d7c5]/80 bg-[#fcf9f2] py-2 dark:border-[#332922] dark:bg-[#1d1815]">
                      <LampOfferVisual
                        lit={lampLit}
                        lampSeq={lampSeq}
                        selectedLamp={selectedLamp}
                        compact
                      />
                    </div>
                    <div className="mt-2.5 grid grid-cols-3 gap-1.5">
                      {lampOptions.map((lamp) => (
                        <button
                          key={lamp.id}
                          type="button"
                          onClick={() => setSelectedLamp(lamp.id)}
                          className={`min-h-[36px] rounded-lg px-2 py-1 text-[11px] font-medium transition-colors cursor-pointer ${
                            selectedLamp === lamp.id
                              ? "bg-[#922e25] text-[#fff8eb]"
                              : "bg-[#fcf9f2] text-[#4c362a] dark:bg-[#1d1815] dark:text-[#dccbb6]"
                          }`}
                        >
                          {lamp.name}
                        </button>
                      ))}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={handleLightLamp}
                    className="mt-3 flex min-h-[42px] w-full items-center justify-center gap-2 rounded-xl bg-[#b88b44] px-4 py-2 text-xs font-bold text-[#1f1612] transition-all hover:opacity-90 active:scale-[0.97] cursor-pointer"
                  >
                    <Flame size={15} className={lampLit ? "animate-flame" : ""} />
                    <span>{lampLit ? "再添一盏心灯" : "点亮此灯"}</span>
                  </button>
                </div>
              )}

              {/* 3. 供花互动 */}
              {interactionConfig.allowFlower && (
                <div className="flex flex-col justify-between rounded-xl border border-[#e2d7c5] bg-[#f6f1e7] p-4 dark:border-[#332922] dark:bg-[#241d19]">
                  <div>
                    <h3 className="text-sm font-bold text-[#2c221e] dark:text-[#efe7da]">
                      供花（花瓣逐次绽放）
                    </h3>
                    <p className="mt-1 text-xs text-[#6e5d4f] dark:text-[#b2a18f]">
                      点击后花朵出现并逐渐舒展绽放于殿前：
                    </p>
                    <div className="mt-2.5 flex justify-center rounded-xl border border-[#e2d7c5]/80 bg-[#fcf9f2] py-2 dark:border-[#332922] dark:bg-[#1d1815]">
                      <FlowerOfferVisual
                        offered={flowerOffered}
                        flowerSeq={flowerSeq}
                        selectedFlower={selectedFlower}
                        compact
                      />
                    </div>
                    <div className="mt-2.5 grid grid-cols-3 gap-1.5">
                      {flowerOptions.map((flower) => (
                        <button
                          key={flower.id}
                          type="button"
                          onClick={() => setSelectedFlower(flower.id)}
                          className={`min-h-[36px] rounded-lg px-2 py-1 text-[11px] font-medium transition-colors cursor-pointer ${
                            selectedFlower === flower.id
                              ? "bg-[#922e25] text-[#fff8eb]"
                              : "bg-[#fcf9f2] text-[#4c362a] dark:bg-[#1d1815] dark:text-[#dccbb6]"
                          }`}
                        >
                          {flower.name}
                        </button>
                      ))}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={handleOfferFlower}
                    className="mt-3 flex min-h-[42px] w-full items-center justify-center gap-2 rounded-xl border border-[#922e25] bg-[#fcf9f2] px-4 py-2 text-xs font-bold text-[#922e25] transition-all hover:bg-[#ebe2d2] active:scale-[0.97] cursor-pointer dark:border-[#d4a85d] dark:bg-[#1d1815] dark:text-[#d4a85d]"
                  >
                    <Flower2 size={15} />
                    <span>{flowerOffered ? "再献一枝清花" : "恭敬献花"}</span>
                  </button>
                </div>
              )}
            </div>

            {/* 4. 木鱼敲击 + 殿前诵经光影 + 私人祈愿 */}
            <div className="mt-5 grid grid-cols-1 gap-5 lg:grid-cols-3">
              {interactionConfig.enableWoodfish && (
                <WoodenFishInstrument
                  sessionCount={sessionWoodfish}
                  totalCount={woodfishTotal}
                  volume={volume}
                  onTap={handleTapWoodfish}
                  tone="buddhist"
                />
              )}

              {/* 5. 诵经：播放时出现柔和动态光影，暂停时动画同步停止 */}
              <div className="relative flex flex-col justify-between overflow-hidden rounded-xl border border-[#e2d7c5] bg-[#f6f1e7] p-5 dark:border-[#332922] dark:bg-[#241d19]">
                <SacredChantingAura playing={chantingPlaying} tone="buddhist" />
                <div className="relative z-10">
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="text-sm font-bold text-[#2c221e] dark:text-[#efe7da]">
                      殿前诵经（柔光同步）
                    </h3>
                    <span
                      className={`h-2.5 w-2.5 rounded-full ${
                        chantingPlaying
                          ? "animate-flame bg-[#b88b44]"
                          : "bg-[#6e5d4f]/40"
                      }`}
                    />
                  </div>
                  <p className="mt-1 text-xs text-[#6e5d4f] dark:text-[#b2a18f]">
                    播放时殿堂与经文四周浮现柔和动态光影；点击暂停，光影动画同步静止。
                  </p>
                  <div className="mt-3 rounded-xl border border-[#e2d7c5]/90 bg-[#fcf9f2]/90 p-3.5 dark:border-[#332922] dark:bg-[#1d1815]/90">
                    <p className="text-[11px] font-semibold text-[#922e25] dark:text-[#d4a85d]">
                      {buddhistChantTrack
                        ? `曲目：${buddhistChantTrack.title}`
                        : buddhistChantScripture?.title || "般若波罗蜜多心经"}
                    </p>
                    <p className="mt-1 font-serif-display text-xs leading-relaxed text-[#2c221e] dark:text-[#efe7da]">
                      “{buddhistChantScripture?.excerpt || "照见五蕴皆空，度一切苦厄。"}”
                    </p>
                  </div>
                  {buddhistChantTrack && (
                    <audio
                      ref={chantingAudioRef}
                      src={buddhistChantTrack.audioUrl}
                      loop
                      onPlay={() => setChantingPlaying(true)}
                      onPause={() => setChantingPlaying(false)}
                      onEnded={() => setChantingPlaying(false)}
                      className="hidden"
                    />
                  )}
                </div>

                <div className="relative z-10 mt-4 flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={handleToggleChanting}
                    className={`flex min-h-[44px] flex-1 items-center justify-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition-all active:scale-[0.97] cursor-pointer ${
                      chantingPlaying
                        ? "bg-[#b88b44] text-[#1f1612]"
                        : "bg-[#922e25] text-[#fff8eb] dark:bg-[#b5453a]"
                    }`}
                  >
                    {chantingPlaying ? <Pause size={15} /> : <Play size={15} />}
                    <span>{chantingPlaying ? "暂停诵经" : "开始诵经"}</span>
                  </button>
                </div>
              </div>

              {interactionConfig.enableWish && (
                <form
                  onSubmit={handleSaveWish}
                  className="flex flex-col justify-between rounded-xl border border-[#e2d7c5] bg-[#f6f1e7] p-5 dark:border-[#332922] dark:bg-[#241d19]"
                >
                  <div>
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-bold text-[#2c221e] dark:text-[#efe7da]">
                        写下私人心愿（仅自己可见）
                      </h3>
                      <Heart size={15} className="text-[#922e25] dark:text-[#d4a85d]" />
                    </div>
                    <p className="mt-1 text-xs text-[#6e5d4f] dark:text-[#b2a18f]">
                      心愿只保存在您自己的设备中，不公开、不排名。
                    </p>
                    <input
                      type="text"
                      maxLength={300}
                      value={wishText}
                      onChange={(e) => setWishText(e.target.value)}
                      placeholder="例如：愿家人平安健康，自己少一分急躁…"
                      className="mt-3 min-h-[44px] w-full rounded-xl border border-[#e2d7c5] bg-[#fcf9f2] px-3.5 text-xs text-[#2c221e] focus:border-[#922e25] focus:outline-none dark:border-[#332922] dark:bg-[#1d1815] dark:text-[#efe7da]"
                    />
                    {wishNotice && (
                      <p className="mt-2 flex items-center gap-1 text-[11px] font-medium text-[#922e25] dark:text-[#d4a85d]">
                        <Sparkles size={12} />
                        <span>{wishNotice}</span>
                      </p>
                    )}
                  </div>
                  <button
                    type="submit"
                    disabled={!wishText.trim()}
                    className="mt-3 min-h-[44px] w-full rounded-xl bg-[#ebe2d2] px-4 py-2 text-xs font-bold text-[#2c221e] transition-all hover:opacity-90 active:scale-[0.98] disabled:opacity-50 cursor-pointer dark:bg-[#2a221d] dark:text-[#efe7da]"
                  >
                    存入私人祈愿录
                  </button>
                </form>
              )}
            </div>
          </section>
        )}
      </div>
    </AppShell>
  );
}
