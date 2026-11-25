import {
  ArrowLeft,
  ArrowRight,
  ChevronRight,
  Compass,
  DoorOpen,
  Droplets,
  Flame,
  LogOut,
  Mountain,
  Pause,
  Play,
  Sparkles,
  Volume2,
  VolumeX,
} from "lucide-react";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { AppShell } from "@/components/AppShell";
import { HallInteractiveStageOverlay } from "@/components/PractitionerStage";
import {
  SacredEnvironmentLayer,
  SceneTransitionCurtain,
} from "@/components/SacredAtmosphere";
import {
  DaoistRitualStage,
  SacredChantingAura,
} from "@/components/SacredInteractions";
import { SceneStageImage } from "@/components/SceneStageImage";
import { useAppState } from "@/context/AppContext";
import {
  DAOIST_MOUNTAIN_SCENE,
  DAOIST_SCENES,
  type SceneConfig,
} from "@/data/scenes";
import {
  natureAudio,
  playJadeChimeSound,
  type NatureSoundType,
} from "@/lib/audio";
import {
  ACTION_LABELS,
  useScenePresence,
  type PractitionerAction,
} from "@/lib/presence";

const DAOIST_DISPLAY_SCENES: SceneConfig[] = [
  ...DAOIST_SCENES,
  DAOIST_MOUNTAIN_SCENE,
];

function resolveDaoistScene(sceneParam: string | null): SceneConfig {
  if (!sceneParam) {
    return DAOIST_SCENES[0];
  }
  return (
    DAOIST_DISPLAY_SCENES.find((s) => s.sceneId === sceneParam) ||
    DAOIST_SCENES[0]
  );
}

export function DaoistRealmPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { settings, addPersonalWish } = useAppState();

  const activeScene = resolveDaoistScene(searchParams.get("scene"));
  const [enteredHall, setEnteredHall] = useState(false);
  const isInsideHall = Boolean(activeScene.hasInterior && enteredHall);

  const [transitionSeq, setTransitionSeq] = useState(0);
  const [activeSound, setActiveSound] = useState<NatureSoundType | null>(null);
  const [gongShouAck, setGongShouAck] = useState(false);
  const [gongShouSeq, setGongShouSeq] = useState(0);
  const [daoIncenseActive, setDaoIncenseActive] = useState(false);
  const [daoChanting, setDaoChanting] = useState(false);
  const [manualAction, setManualAction] = useState<PractitionerAction | null>(
    null,
  );
  const [wishText, setWishText] = useState("");
  const [wishNotice, setWishNotice] = useState("");

  const gongShouTimerRef = useRef<number | null>(null);
  const manualActionTimerRef = useRef<number | null>(null);
  const wishTimerRef = useRef<number | null>(null);

  const effectiveAction: PractitionerAction =
    manualAction ?? (daoChanting ? "chanting" : "idle");

  // Co-presence strictly enabled only inside entered hall interior
  const { peers, canPublish, totalInScene } = useScenePresence({
    sceneId: activeScene.sceneId,
    religionType: "daoist",
    currentAction: effectiveAction,
    enabled: isInsideHall,
  });

  const triggerAvatarAction = (
    action: PractitionerAction,
    durationMs = 3000,
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
      natureAudio.stop();
      if (gongShouTimerRef.current) window.clearTimeout(gongShouTimerRef.current);
      if (manualActionTimerRef.current) {
        window.clearTimeout(manualActionTimerRef.current);
      }
      if (wishTimerRef.current) window.clearTimeout(wishTimerRef.current);
    };
  }, []);

  // Sync natural soundscape cleanly when switching Daoist scenes if user already turned sound on
  useEffect(() => {
    if (activeSound) {
      const targetType = activeScene.audioConfig.natureType;
      natureAudio.start(targetType, settings.defaultVolume * 0.7);
      if (activeSound !== targetType) {
        setActiveSound(targetType);
      }
    }
  }, [activeScene.sceneId, activeScene.audioConfig.natureType, activeSound, settings.defaultVolume]);

  const resetHallRitualState = () => {
    if (manualActionTimerRef.current) {
      window.clearTimeout(manualActionTimerRef.current);
    }
    if (gongShouTimerRef.current) {
      window.clearTimeout(gongShouTimerRef.current);
    }
    setManualAction(null);
    setGongShouAck(false);
    setDaoIncenseActive(false);
    setDaoChanting(false);
  };

  const selectScene = (nextSceneId: string) => {
    if (nextSceneId === activeScene.sceneId) return;
    resetHallRitualState();
    setEnteredHall(false);
    setSearchParams(
      nextSceneId === DAOIST_SCENES[0].sceneId ? {} : { scene: nextSceneId },
      { replace: false },
    );
    setTransitionSeq((s) => s + 1);
  };

  const handleEnterHall = () => {
    if (!activeScene.hasInterior) return;
    setEnteredHall(true);
    setTransitionSeq((s) => s + 1);
    playJadeChimeSound(settings.defaultVolume * 0.75);
  };

  const handleExitHall = () => {
    resetHallRitualState();
    setEnteredHall(false);
    setTransitionSeq((s) => s + 1);
  };

  const handleSelectHall = (hallSceneId: string) => {
    selectScene(hallSceneId);
  };

  const toggleSound = (type: NatureSoundType) => {
    if (activeSound === type) {
      natureAudio.stop();
      setActiveSound(null);
    } else {
      natureAudio.start(type, settings.defaultVolume * 0.7);
      setActiveSound(type);
    }
  };

  const handleGongShou = () => {
    if (!isInsideHall) return;
    setGongShouAck(true);
    setGongShouSeq((s) => s + 1);
    triggerAvatarAction("gongshou", 2800);
    playJadeChimeSound(settings.defaultVolume * 0.65);
    if (gongShouTimerRef.current) window.clearTimeout(gongShouTimerRef.current);
    gongShouTimerRef.current = window.setTimeout(
      () => setGongShouAck(false),
      2600,
    );
  };

  const handleDaoIncense = () => {
    if (!isInsideHall) return;
    setDaoIncenseActive(true);
    triggerAvatarAction("incense", 3200);
  };

  const handleToggleDaoChanting = () => {
    if (!isInsideHall) return;
    const next = !daoChanting;
    setDaoChanting(next);
    if (next) {
      if (manualActionTimerRef.current) {
        window.clearTimeout(manualActionTimerRef.current);
      }
      setManualAction(null);
    }
  };

  const handleSceneHotspot = (action: PractitionerAction) => {
    if (!isInsideHall) return;
    if (action === "gongshou") handleGongShou();
    else if (action === "incense") handleDaoIncense();
    else if (action === "chanting") handleToggleDaoChanting();
  };

  const handleSaveReflection = (e: FormEvent) => {
    e.preventDefault();
    if (!wishText.trim()) return;
    addPersonalWish("daoist", wishText);
    setWishText("");
    setWishNotice("随笔已保存至您的私人空间（仅自己可见）。");
    if (wishTimerRef.current) window.clearTimeout(wishTimerRef.current);
    wishTimerRef.current = window.setTimeout(() => setWishNotice(""), 3500);
  };

  const activeHallIndex = DAOIST_DISPLAY_SCENES.findIndex(
    (s) => s.sceneId === activeScene.sceneId,
  );
  const prevHall =
    activeHallIndex > 0 ? DAOIST_DISPLAY_SCENES[activeHallIndex - 1] : null;
  const nextHall =
    activeHallIndex >= 0 && activeHallIndex < DAOIST_DISPLAY_SCENES.length - 1
      ? DAOIST_DISPLAY_SCENES[activeHallIndex + 1]
      : null;

  return (
    <AppShell forceActivePath="/worlds" realmTone="daoist">
      <SceneTransitionCurtain
        type="daoist-mist"
        transitionKey={transitionSeq}
      />

      {/* Top Breadcrumb & Nature Sound Toggle */}
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => (isInsideHall ? handleExitHall() : navigate("/"))}
            className="inline-flex min-h-[40px] items-center gap-1.5 text-sm font-medium text-[#2c443e] hover:text-[#1f4e45] cursor-pointer dark:text-[#c7dcd5]"
          >
            <ArrowLeft size={16} />
            <span>{isInsideHall ? "退回殿外正面" : "返回首页"}</span>
          </button>

          <nav
            aria-label="层级路径"
            className="hidden items-center gap-1 text-xs text-[#4b6b63] sm:flex dark:text-[#96b5ab]"
          >
            <button
              type="button"
              onClick={() => navigate("/")}
              className="hover:text-[#1f4e45] cursor-pointer"
            >
              首页
            </button>
            <ChevronRight size={12} />
            <button
              type="button"
              onClick={() => navigate("/worlds")}
              className="hover:text-[#1f4e45] cursor-pointer"
            >
              道教仙境
            </button>
            <ChevronRight size={12} />
            <span className="font-semibold text-[#1f4e45] dark:text-[#b8ded1]">
              {activeScene.sceneName}（{isInsideHall ? "殿内致敬" : "正面外观"}）
            </span>
          </nav>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => toggleSound(activeScene.audioConfig.natureType)}
            className={`inline-flex min-h-[40px] items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-medium transition-colors cursor-pointer ${
              activeSound === activeScene.audioConfig.natureType
                ? "bg-[#1f4e45] text-[#f3f8f5]"
                : "border border-[#c7d6ce] bg-[#f7faf8] text-[#2c443e] dark:border-[#243a34] dark:bg-[#13221f] dark:text-[#c7dcd5]"
            }`}
          >
            {activeSound === activeScene.audioConfig.natureType ? (
              <Volume2 size={14} />
            ) : (
              <VolumeX size={14} />
            )}
            <span>
              {activeSound === activeScene.audioConfig.natureType
                ? `${activeScene.audioConfig.natureLabel}：开`
                : activeScene.audioConfig.natureLabel}
            </span>
          </button>
          <button
            type="button"
            onClick={() => toggleSound("stream")}
            className={`inline-flex min-h-[40px] items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-medium transition-colors cursor-pointer ${
              activeSound === "stream"
                ? "bg-[#1f4e45] text-[#f3f8f5]"
                : "border border-[#c7d6ce] bg-[#f7faf8] text-[#2c443e] dark:border-[#243a34] dark:bg-[#13221f] dark:text-[#c7dcd5]"
            }`}
          >
            <Droplets size={14} />
            <span>{activeSound === "stream" ? "溪流声：开" : "山涧溪流"}</span>
          </button>
        </div>
      </div>

      <div className="animate-page-enter space-y-6">
        {/* Hall Selector */}
        <section className="rounded-2xl border border-[#c7d6ce] bg-[#f7faf8] p-4 dark:border-[#243a34] dark:bg-[#13221f]">
          <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
            <div>
              <p className="text-xs font-medium text-[#1f4e45] dark:text-[#86bfb0]">
                道教仙境 ·{" "}
                {isInsideHall
                  ? "殿内致敬空间"
                  : "殿外正面瞻仰（先赏宫观气象，步入大殿后再行道教礼仪）"}
              </p>
              <h1 className="font-serif-display text-xl font-bold text-[#19302b] dark:text-[#e5f1ec]">
                {activeScene.sceneName}
              </h1>
            </div>
            <button
              type="button"
              onClick={() => navigate("/parks/daoist")}
              className="inline-flex min-h-[40px] items-center gap-1.5 rounded-xl bg-[#e1ebe5] px-3.5 py-2 text-xs font-semibold text-[#1f4e45] hover:opacity-90 cursor-pointer dark:bg-[#1b312c] dark:text-[#b8ded1]"
            >
              <Compass size={14} />
              <span>宫观建筑档案</span>
            </button>
          </div>

          <div className="no-scrollbar flex gap-2 overflow-x-auto pb-1">
            {DAOIST_DISPLAY_SCENES.map((scene) => {
              const active = scene.sceneId === activeScene.sceneId;
              return (
                <button
                  key={scene.sceneId}
                  type="button"
                  aria-current={active ? "page" : undefined}
                  onClick={() => handleSelectHall(scene.sceneId)}
                  className={`min-h-[42px] shrink-0 rounded-xl px-4 py-2 text-xs font-semibold whitespace-nowrap transition-all active:scale-[0.97] cursor-pointer ${
                    active
                      ? "bg-[#1f4e45] text-[#f3f8f5] dark:bg-[#2d6a5e]"
                      : "bg-[#e7f0eb] text-[#2c443e] hover:bg-[#d7e5dd] dark:bg-[#192d29] dark:text-[#c7dcd5]"
                  }`}
                >
                  {scene.sceneName}
                </button>
              );
            })}
          </div>
        </section>

        {/* Active Daoist Hall Presentation */}
        <section className="grid grid-cols-1 items-stretch gap-6 lg:grid-cols-12">
          <div className="flex flex-col overflow-hidden rounded-2xl border border-[#c7d6ce] bg-[#132622] lg:col-span-7 dark:border-[#243a34]">
            <div className="relative min-h-[380px] w-full flex-1 sm:min-h-[440px] md:min-h-[500px]">
              <SceneStageImage
                scene={activeScene}
                imageMode={isInsideHall ? "interior" : "exterior"}
                className="h-full w-full object-cover"
              />
              <div
                className={`pointer-events-none absolute inset-0 ${
                  isInsideHall
                    ? "bg-gradient-to-b from-[#091815]/65 via-transparent to-[#091815]/62"
                    : "bg-gradient-to-b from-[#091815]/52 via-transparent to-[#091815]/76"
                }`}
              />

              {/* Subtle mountain clouds outside; full palace lanterns + rituals + character ONLY inside */}
              <SacredEnvironmentLayer
                variant="daoist"
                showLantern={isInsideHall}
                showLotus={false}
              />

              {isInsideHall && (
                <>
                  <SacredChantingAura playing={daoChanting} tone="daoist" />

                  <DaoistRitualStage
                    gongShouSeq={gongShouSeq}
                    gongShouActive={gongShouAck}
                  />

                  <HallInteractiveStageOverlay
                    tradition="daoist"
                    selfAction={effectiveAction}
                    peers={peers}
                    canPublish={canPublish}
                    totalInScene={totalInScene}
                    onSelectHotspot={handleSceneHotspot}
                  />
                </>
              )}

              <div className="pointer-events-none absolute top-4 left-4 z-20 max-w-[70%]">
                <p className="text-[11px] font-medium tracking-wider text-[#b8ded1] drop-shadow">
                  {activeScene.subtitle}
                </p>
                <h2 className="mt-0.5 font-serif-display text-xl font-bold text-[#f3f8f5] drop-shadow md:text-2xl">
                  {activeScene.sceneName}
                </h2>
              </div>

              {isInsideHall && (
                <button
                  type="button"
                  onClick={handleExitHall}
                  className="absolute top-4 right-4 z-20 inline-flex min-h-[36px] items-center gap-1.5 rounded-xl border border-[#b8ded1]/45 bg-[#0e1f1c]/80 px-3 py-1.5 text-[11px] font-semibold text-[#f3f8f5] backdrop-blur-sm transition-colors hover:bg-[#19342f] cursor-pointer"
                >
                  <LogOut size={13} />
                  <span>退至殿外</span>
                </button>
              )}

              {/* Exterior Primary Entry CTA (Zero interactions shown on exterior!) */}
              {!isInsideHall && (
                <div className="absolute inset-x-0 bottom-5 z-20 flex flex-col items-center px-4 text-center">
                  {activeScene.hasInterior ? (
                    <button
                      type="button"
                      onClick={handleEnterHall}
                      className="inline-flex min-h-[48px] items-center gap-2 rounded-xl bg-[#b58d46] px-7 py-3 text-sm font-bold text-[#101c19] shadow-lg transition-all hover:opacity-95 active:scale-[0.97] cursor-pointer"
                    >
                      <DoorOpen size={17} />
                      <span>步入{activeScene.sceneName}（进入大殿）</span>
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => handleSelectHall(DAOIST_SCENES[0].sceneId)}
                      className="inline-flex min-h-[48px] items-center gap-2 rounded-xl bg-[#b58d46] px-7 py-3 text-sm font-bold text-[#101c19] shadow-lg transition-all hover:opacity-95 active:scale-[0.97] cursor-pointer"
                    >
                      <span>前往主殿 · 三清殿</span>
                      <ArrowRight size={17} />
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* Instant Action Bar ONLY rendered inside hall interior */}
            {isInsideHall && (
              <div className="flex flex-wrap items-center justify-between gap-2 border-t border-[#223c36] bg-[#0e1f1c] px-4 py-3 text-xs">
                <span className="text-[11px] text-[#b8ded1]">
                  我的动作：{ACTION_LABELS[effectiveAction]}
                </span>
                <div className="flex flex-wrap gap-1.5">
                  <button
                    type="button"
                    onClick={handleGongShou}
                    className={`rounded-lg px-2.5 py-1.5 text-[11px] font-semibold transition-all active:scale-95 cursor-pointer ${
                      effectiveAction === "gongshou"
                        ? "bg-[#b58d46] text-[#101c19]"
                        : "bg-[#1a332e] text-[#e6f3ee] hover:bg-[#23433d]"
                    }`}
                  >
                    拱手礼
                  </button>
                  <button
                    type="button"
                    onClick={handleDaoIncense}
                    className={`rounded-lg px-2.5 py-1.5 text-[11px] font-semibold transition-all active:scale-95 cursor-pointer ${
                      effectiveAction === "incense"
                        ? "bg-[#b58d46] text-[#101c19]"
                        : "bg-[#1a332e] text-[#e6f3ee] hover:bg-[#23433d]"
                    }`}
                  >
                    清香静思
                  </button>
                  <button
                    type="button"
                    onClick={handleToggleDaoChanting}
                    className={`rounded-lg px-2.5 py-1.5 text-[11px] font-semibold transition-all active:scale-95 cursor-pointer ${
                      daoChanting
                        ? "bg-[#b58d46] text-[#101c19]"
                        : "bg-[#1a332e] text-[#e6f3ee] hover:bg-[#23433d]"
                    }`}
                  >
                    {daoChanting ? "暂停诵读" : "静诵道经"}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Cultural Context Card */}
          <div className="flex flex-col justify-between rounded-2xl border border-[#c7d6ce] bg-[#f7faf8] p-6 lg:col-span-5 dark:border-[#243a34] dark:bg-[#13221f]">
            <div className="space-y-4">
              <div>
                <h3 className="text-xs font-semibold tracking-wider text-[#1f4e45] dark:text-[#86bfb0]">
                  殿宇与道教传统
                </h3>
                <p className="mt-1.5 text-sm leading-relaxed text-[#19302b] dark:text-[#e5f1ec]">
                  {activeScene.description}
                </p>
              </div>
              <div className="border-t border-[#d4e2da] pt-3 dark:border-[#243a34]">
                <h3 className="text-xs font-semibold tracking-wider text-[#4b6b63] dark:text-[#96b5ab]">
                  宫观格局与文献脉络
                </h3>
                <p className="mt-1 text-xs leading-relaxed text-[#2c443e] dark:text-[#c7dcd5]">
                  {activeScene.culturalNotes}
                </p>
              </div>
              <div className="border-t border-[#d4e2da] pt-3 dark:border-[#243a34]">
                <h3 className="text-xs font-semibold tracking-wider text-[#4b6b63] dark:text-[#96b5ab]">
                  道教礼仪与体悟
                </h3>
                <p className="mt-1 text-xs leading-relaxed text-[#2c443e] dark:text-[#c7dcd5]">
                  {activeScene.traditionPractice}
                </p>
              </div>
            </div>

            <div className="mt-5 space-y-2.5 border-t border-[#d4e2da] pt-4 dark:border-[#243a34]">
              {activeScene.hasInterior ? (
                !isInsideHall ? (
                  <button
                    type="button"
                    onClick={handleEnterHall}
                    className="inline-flex min-h-[46px] w-full items-center justify-center gap-2 rounded-xl bg-[#b58d46] px-4 py-2.5 text-xs font-bold text-[#101c19] transition-all hover:opacity-90 active:scale-[0.98] cursor-pointer"
                  >
                    <DoorOpen size={15} />
                    <span>步入{activeScene.sceneName}，开启殿内致敬</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleExitHall}
                    className="inline-flex min-h-[44px] w-full items-center justify-center gap-2 rounded-xl border border-[#c7d6ce] bg-[#eef3f0] px-4 py-2 text-xs font-semibold text-[#2c443e] transition-colors hover:bg-[#e1ebe5] cursor-pointer dark:border-[#243a34] dark:bg-[#192d29] dark:text-[#c7dcd5]"
                  >
                    <LogOut size={14} />
                    <span>退至殿外，瞻仰{activeScene.sceneName}正面外观</span>
                  </button>
                )
              ) : (
                <button
                  type="button"
                  onClick={() => handleSelectHall(DAOIST_SCENES[0].sceneId)}
                  className="inline-flex min-h-[46px] w-full items-center justify-center gap-2 rounded-xl bg-[#b58d46] px-4 py-2.5 text-xs font-bold text-[#101c19] transition-all hover:opacity-90 active:scale-[0.98] cursor-pointer"
                >
                  <span>前往三清殿</span>
                  <ArrowRight size={14} />
                </button>
              )}

              <div className="flex items-center justify-between gap-2">
                <button
                  type="button"
                  disabled={!prevHall}
                  onClick={() => prevHall && handleSelectHall(prevHall.sceneId)}
                  className="inline-flex min-h-[38px] items-center gap-1 rounded-xl border border-[#c7d6ce] bg-[#eef3f0] px-3 py-1.5 text-xs font-medium text-[#2c443e] disabled:opacity-40 cursor-pointer dark:border-[#243a34] dark:bg-[#192d29] dark:text-[#c7dcd5]"
                >
                  <ArrowLeft size={13} />
                  <span>{prevHall ? prevHall.sceneName : "已为首殿"}</span>
                </button>
                <button
                  type="button"
                  disabled={!nextHall}
                  onClick={() => nextHall && handleSelectHall(nextHall.sceneId)}
                  className="inline-flex min-h-[38px] items-center gap-1 rounded-xl border border-[#c7d6ce] bg-[#eef3f0] px-3 py-1.5 text-xs font-medium text-[#2c443e] disabled:opacity-40 cursor-pointer dark:border-[#243a34] dark:bg-[#192d29] dark:text-[#c7dcd5]"
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
                  className="inline-flex min-h-[42px] w-full items-center justify-center gap-1.5 rounded-xl bg-[#1f4e45] px-4 py-2 text-xs font-bold text-[#f3f8f5] transition-transform active:scale-[0.98] hover:opacity-90 cursor-pointer dark:bg-[#2d6a5e]"
                >
                  <span>建筑档案：{activeScene.sceneName}详览</span>
                  <ArrowRight size={14} />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => navigate("/parks/daoist")}
                  className="inline-flex min-h-[42px] w-full items-center justify-center gap-1.5 rounded-xl bg-[#1f4e45] px-4 py-2 text-xs font-bold text-[#f3f8f5] transition-transform active:scale-[0.98] hover:opacity-90 cursor-pointer dark:bg-[#2d6a5e]"
                >
                  <span>前往宫观建筑档案全览</span>
                  <ArrowRight size={14} />
                </button>
              )}
            </div>
          </div>
        </section>

        {/* Daoist Etiquette & Reflection strictly visible ONLY inside hall interior */}
        {isInsideHall && (
          <section className="grid grid-cols-1 gap-5 md:grid-cols-2">
            {activeScene.interactionConfig.enableGongShou && (
              <div className="relative flex flex-col justify-between overflow-hidden rounded-2xl border border-[#c7d6ce] bg-[#f7faf8] p-6 dark:border-[#243a34] dark:bg-[#13221f]">
                <SacredChantingAura playing={daoChanting} tone="daoist" />
                <div className="relative z-10">
                  <h2 className="font-serif-display text-lg font-bold text-[#19302b] dark:text-[#e5f1ec]">
                    {activeScene.sceneName} · 殿内拱手礼 · 清香静思
                  </h2>
                  <p className="mt-1.5 text-xs leading-relaxed text-[#4b6b63] dark:text-[#96b5ab]">
                    遵循道教敬天法祖、顺应自然的传统，行传统拱手礼、点清香静思，或伴随柔光静诵《道德经》，人物动作与同境共修者实时同步（止语不对话）。
                  </p>
                  {daoIncenseActive && (
                    <p className="mt-2.5 inline-flex items-center gap-1.5 rounded-lg bg-[#e1ebe5] px-3 py-1 text-[11px] font-medium text-[#1f4e45] dark:bg-[#1b312c] dark:text-[#b8ded1]">
                      <Flame size={13} />
                      <span>清香已燃起，炉烟缓升，守静笃行</span>
                    </p>
                  )}
                </div>
                <div className="relative z-10 mt-4 grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={handleGongShou}
                    className="inline-flex min-h-[44px] items-center justify-center gap-1.5 rounded-xl bg-[#1f4e45] px-3 py-2.5 text-xs font-bold text-[#f3f8f5] transition-all hover:opacity-90 active:scale-[0.97] cursor-pointer dark:bg-[#2d6a5e]"
                  >
                    <Mountain size={15} />
                    <span>行拱手礼</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleDaoIncense}
                    className="inline-flex min-h-[44px] items-center justify-center gap-1.5 rounded-xl border border-[#c7d6ce] bg-[#e7f0eb] px-3 py-2.5 text-xs font-semibold text-[#1f4e45] transition-transform active:scale-[0.97] hover:opacity-90 cursor-pointer dark:border-[#243a34] dark:bg-[#192d29] dark:text-[#c7dcd5]"
                  >
                    <Flame size={15} />
                    <span>清香静思</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleToggleDaoChanting}
                    className={`inline-flex min-h-[44px] items-center justify-center gap-1.5 rounded-xl px-3 py-2.5 text-xs font-bold transition-all active:scale-[0.97] cursor-pointer ${
                      daoChanting
                        ? "bg-[#b58d46] text-[#101c19]"
                        : "border border-[#c7d6ce] bg-[#e7f0eb] text-[#1f4e45] dark:border-[#243a34] dark:bg-[#192d29] dark:text-[#c7dcd5]"
                    }`}
                  >
                    {daoChanting ? <Pause size={15} /> : <Play size={15} />}
                    <span>{daoChanting ? "暂停诵读" : "静诵道经"}</span>
                  </button>
                </div>
              </div>
            )}

            {activeScene.interactionConfig.enableWish && (
              <form
                onSubmit={handleSaveReflection}
                className="flex flex-col justify-between rounded-2xl border border-[#c7d6ce] bg-[#f7faf8] p-6 dark:border-[#243a34] dark:bg-[#13221f]"
              >
                <div>
                  <h2 className="font-serif-display text-lg font-bold text-[#19302b] dark:text-[#e5f1ec]">
                    道境清思录（仅自己可见）
                  </h2>
                  <p className="mt-1 text-xs text-[#4b6b63] dark:text-[#96b5ab]">
                    记下一句此刻的心境或感悟，数据仅保存在您的本地设备中。
                  </p>
                  <input
                    type="text"
                    maxLength={300}
                    value={wishText}
                    onChange={(e) => setWishText(e.target.value)}
                    placeholder="例如：致虚极，守静笃，愿今日行事从容柔和…"
                    className="mt-3 min-h-[44px] w-full rounded-xl border border-[#c7d6ce] bg-[#eef3f0] px-3.5 text-xs text-[#19302b] focus:border-[#1f4e45] focus:outline-none dark:border-[#243a34] dark:bg-[#101917] dark:text-[#e5f1ec]"
                  />
                  {wishNotice && (
                    <p className="mt-2 flex items-center gap-1 text-[11px] font-medium text-[#1f4e45] dark:text-[#86bfb0]">
                      <Sparkles size={12} />
                      <span>{wishNotice}</span>
                    </p>
                  )}
                </div>
                <button
                  type="submit"
                  disabled={!wishText.trim()}
                  className="mt-3 min-h-[44px] w-full rounded-xl bg-[#b58d46] px-4 py-2 text-xs font-bold text-[#101c19] transition-all hover:opacity-90 active:scale-[0.98] disabled:opacity-50 cursor-pointer"
                >
                  保存私人清思
                </button>
              </form>
            )}
          </section>
        )}
      </div>
    </AppShell>
  );
}
