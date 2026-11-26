import { LogOut, Play, RotateCcw } from "lucide-react";
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { DaxiongWalkInVideoPlayer } from "@/components/DaxiongWalkInVideoPlayer";
import { useAppState } from "@/context/AppContext";
import {
  DAXIONG_REAL_STATIONS,
  DAXIONG_WALK_VIDEO_ASSET,
} from "@/data/daxiongRealSpace";
import { playSingingBowlChime } from "@/lib/audio";

type VideoPlaybackMode = "none" | "official" | "test-placeholder";

/**
 * 大雄宝殿实景与连续步入视频视口（V2.2.1）：
 * - 已彻底移除基于多张静态图叠加、透视拉伸或缩放产生的重影动画。
 * - 若接入了正式连续步入视频（hasOfficialWalkVideo: true），点击入殿时播放独立 <video>；
 * - 若当前尚无正式视频素材，点击「步入大雄宝殿」直接采用原有纯净静态切换入殿，
 *   并在底部提供明确的「验证步入视频（测试占位）」入口用于验证视频播放器控制与入殿衔接。
 */
export function DaxiongRealSpaceViewport({
  isInsideHall,
  walkSignal = 0,
  onEnterInterior,
  onExitInterior,
  onNavigateScene,
  volume,
  children,
}: {
  isInsideHall: boolean;
  /** 父层（如右侧文化卡片按钮）触发入殿的递增信号 */
  walkSignal?: number;
  onEnterInterior: () => void;
  onExitInterior: () => void;
  onNavigateScene: (targetSceneId: string) => void;
  volume: number;
  children: ReactNode;
}) {
  const { settings } = useAppState();
  const [videoMode, setVideoMode] = useState<VideoPlaybackMode>("none");
  const [videoKey, setVideoKey] = useState(0);
  const [imageError, setImageError] = useState(false);
  const lastWalkSignalRef = useRef(walkSignal);

  const reducedMotion = settings.animationMode !== "full";
  const exteriorStation = DAXIONG_REAL_STATIONS["courtyard-far"];
  const hasOfficialVideo = Boolean(
    DAXIONG_WALK_VIDEO_ASSET.hasOfficialWalkVideo &&
      DAXIONG_WALK_VIDEO_ASSET.officialVideoSrc,
  );
  const isVideoActive = videoMode !== "none";

  const handleStartEntry = useCallback(() => {
    if (hasOfficialVideo && !reducedMotion) {
      if (isInsideHall) {
        onExitInterior();
      }
      setVideoKey((k) => k + 1);
      setVideoMode("official");
      return;
    }

    // 当前无正式连续步入视频时，直接进入现有大殿静态互动模式（绝不伪造拉伸或重影动画）
    setVideoMode("none");
    onEnterInterior();
    playSingingBowlChime(volume * 0.55);
  }, [
    hasOfficialVideo,
    reducedMotion,
    isInsideHall,
    onEnterInterior,
    onExitInterior,
    volume,
  ]);

  const handleStartTestVideo = useCallback(() => {
    if (isInsideHall) {
      onExitInterior();
    }
    setVideoKey((k) => k + 1);
    setVideoMode("test-placeholder");
  }, [isInsideHall, onExitInterior]);

  // 响应右侧文化卡片按钮触发入殿
  useEffect(() => {
    if (walkSignal !== lastWalkSignalRef.current) {
      lastWalkSignalRef.current = walkSignal;
      if (walkSignal > 0) {
        handleStartEntry();
      }
    }
  }, [walkSignal, handleStartEntry]);

  const handleVideoComplete = useCallback(() => {
    setVideoMode("none");
    onEnterInterior();
    playSingingBowlChime(volume * 0.6);
  }, [onEnterInterior, volume]);

  const handleVideoExit = useCallback(() => {
    setVideoMode("none");
  }, []);

  const activeVideoSrc =
    videoMode === "official"
      ? DAXIONG_WALK_VIDEO_ASSET.officialVideoSrc ||
        DAXIONG_WALK_VIDEO_ASSET.testPlaceholderVideoSrc
      : DAXIONG_WALK_VIDEO_ASSET.testPlaceholderVideoSrc;

  return (
    <div className="flex flex-col">
      {isVideoActive ? (
        /* 视频播放期间独占舞台，不与任何静态图或环境层叠加，避免重影 */
        <DaxiongWalkInVideoPlayer
          key={videoKey}
          videoSrc={activeVideoSrc}
          webmSrc={
            videoMode === "official"
              ? DAXIONG_WALK_VIDEO_ASSET.officialWebmSrc
              : null
          }
          posterSrc={DAXIONG_WALK_VIDEO_ASSET.posterImage}
          isTestPlaceholder={videoMode === "test-placeholder"}
          mutedByDefault={DAXIONG_WALK_VIDEO_ASSET.mutedByDefault}
          onComplete={handleVideoComplete}
          onExit={handleVideoExit}
        />
      ) : (
        <div className="relative min-h-[300px] w-full aspect-[4/3] sm:aspect-[16/10] lg:aspect-[16/9] overflow-hidden bg-[#1c1310]">
          {isInsideHall ? (
            /* 殿内静态礼敬模式：完整保留 SceneStageImage + BuddhistHallStage */
            children
          ) : (
            <>
              <div className="absolute inset-0">
                {imageError ? (
                  <div
                    role="img"
                    aria-label={exteriorStation.imageAlt}
                    className="flex h-full w-full flex-col items-center justify-center bg-[#2a1814] p-6 text-center text-[#fff8eb]"
                  >
                    <p className="text-xs tracking-widest text-[#e5c17c]">
                      佛教梵境 · 大雄宝殿
                    </p>
                    <p className="mt-1 font-serif-display text-xl font-bold">
                      寺院院落入口
                    </p>
                  </div>
                ) : (
                  <img
                    src={exteriorStation.image}
                    alt={exteriorStation.imageAlt}
                    referrerPolicy="no-referrer"
                    onError={() => setImageError(true)}
                    className="h-full w-full object-cover object-center"
                  />
                )}
              </div>

              {children}

              {/* 初始入口界面：简洁入殿控制（无游戏圆点与浮动热点） */}
              <div className="pointer-events-none absolute inset-x-0 bottom-4 z-30 flex justify-center px-4">
                <button
                  type="button"
                  onClick={handleStartEntry}
                  className="pointer-events-auto inline-flex min-h-[44px] items-center justify-center rounded-lg border border-[#e5c17c]/55 bg-[#1a110e]/78 px-6 py-2 text-xs font-semibold tracking-widest text-[#fff8eb] backdrop-blur-xs transition-colors hover:border-[#e5c17c] hover:bg-[#2a1b16]/90 active:scale-[0.98] cursor-pointer"
                >
                  {hasOfficialVideo ? "缓步入殿" : "步入大雄宝殿"}
                </button>
              </div>
            </>
          )}
        </div>
      )}

      {/* 底部极简场景辅助栏：视频播放期间自动隐藏 */}
      {!isVideoActive && (
        <div className="flex flex-wrap items-center justify-between gap-2 border-t border-[#432d26] bg-[#1e1411] px-4 py-2.5 text-xs text-[#f5ece0]">
          <span className="text-[11px] text-[#d8cab8]">
            {isInsideHall
              ? "大雄宝殿 · 殿内释迦牟尼佛前"
              : "大雄宝殿 · 寺院院落正面"}
          </span>

          <div className="flex flex-wrap items-center gap-2">
            {isInsideHall ? (
              <>
                {hasOfficialVideo && (
                  <button
                    type="button"
                    onClick={handleStartEntry}
                    className="inline-flex min-h-[32px] items-center gap-1 rounded-md bg-white/10 px-2.5 text-[11px] text-[#f5ece0] hover:bg-white/18 cursor-pointer"
                  >
                    <RotateCcw size={12} />
                    <span>重温步入视频</span>
                  </button>
                )}
                <button
                  type="button"
                  onClick={onExitInterior}
                  className="inline-flex min-h-[32px] items-center gap-1 rounded-md bg-white/10 px-2.5 text-[11px] text-[#f5ece0] hover:bg-white/18 cursor-pointer"
                >
                  <LogOut size={12} />
                  <span>退回院落</span>
                </button>
              </>
            ) : (
              <>
                {!hasOfficialVideo && (
                  <button
                    type="button"
                    onClick={handleStartTestVideo}
                    className="inline-flex min-h-[32px] items-center gap-1 rounded-md border border-[#e5c17c]/30 bg-[#2a1b16] px-2.5 text-[11px] text-[#e5c17c] hover:bg-[#38241d] cursor-pointer"
                  >
                    <Play size={11} />
                    <span>测试步入视频（占位）</span>
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => onNavigateScene("buddhist-guanyin")}
                  className="min-h-[32px] px-2 text-[11px] text-[#d8cab8] hover:text-[#e5c17c] cursor-pointer"
                >
                  西侧 · 观音殿
                </button>
                <button
                  type="button"
                  onClick={() => onNavigateScene("buddhist-culture")}
                  className="min-h-[32px] px-2 text-[11px] text-[#d8cab8] hover:text-[#e5c17c] cursor-pointer"
                >
                  东侧 · 藏经阁
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
