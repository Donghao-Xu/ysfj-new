import {
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  ArrowUp,
  Compass,
  Footprints,
  Navigation,
} from "lucide-react";
import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { Link } from "react-router-dom";
import { PhotorealWalkViewport } from "@/components/PhotorealWalkViewport";
import { useAppState } from "@/context/AppContext";
import type {
  SpatialConnection,
  SpatialNode,
  SpatialRealmType,
  SpatialTransitionKind,
} from "@/data/spatialGraph";
import type { WalkRequest } from "@/data/walkProfiles";
import { soundManager } from "@/lib/audio";

export type RoamingTransitionState = {
  active: boolean;
  kind: SpatialTransitionKind;
  phase: "depart" | "arrive" | "idle";
  label?: string;
};

/** V3.0 阶段0：停用旧版图片透视拉伸与多图 Shader 混合步行引擎 */
const LEGACY_SHADER_WALK_ENABLED = false;

export function useSpatialMotionEnabled() {
  const { settings } = useAppState();
  const [osReduced, setOsReduced] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined" || !window.matchMedia) return;
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setOsReduced(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  return (
    LEGACY_SHADER_WALK_ENABLED &&
    settings.roamingMotionEnabled &&
    settings.animationMode === "full" &&
    !osReduced
  );
}

type WalkCallbacks = {
  onArrive: () => void;
  onAfterSettle?: () => void;
};

/**
 * 全项目统一步行状态控制器：
 * 统一驱动佛教殿堂、道教宫观、自然静修步道的 7 阶段连续实景步行过渡与取消逻辑。
 */
export function useSpatialWalkController() {
  const motionEnabled = useSpatialMotionEnabled();
  const [activeWalk, setActiveWalk] = useState<WalkRequest | null>(null);
  const [settlingFade, setSettlingFade] = useState(false);
  const callbacksRef = useRef<WalkCallbacks | null>(null);
  const arrivedRef = useRef(false);
  const fadeTimerRef = useRef<number | null>(null);
  const walkIdSeqRef = useRef(0);

  const clearTimers = useCallback(() => {
    if (fadeTimerRef.current !== null) {
      window.clearTimeout(fadeTimerRef.current);
      fadeTimerRef.current = null;
    }
  }, []);

  useEffect(() => {
    return () => {
      clearTimers();
      soundManager.resetWalkAudioModifiers();
    };
  }, [clearTimers]);

  const startWalk = useCallback(
    (
      spec: Omit<WalkRequest, "id">,
      callbacks: WalkCallbacks,
    ) => {
      clearTimers();
      if (!motionEnabled) {
        soundManager.playSpatialCue("footstep", 2);
        callbacks.onArrive();
        callbacks.onAfterSettle?.();
        return;
      }

      walkIdSeqRef.current += 1;
      arrivedRef.current = false;
      callbacksRef.current = callbacks;
      setSettlingFade(false);
      setActiveWalk({
        ...spec,
        id: walkIdSeqRef.current,
      });
    },
    [clearTimers, motionEnabled],
  );

  const handleWalkMidpoint = useCallback(() => {
    if (arrivedRef.current) return;
    arrivedRef.current = true;
    callbacksRef.current?.onArrive();
  }, []);

  const handleWalkComplete = useCallback(() => {
    if (!arrivedRef.current) {
      arrivedRef.current = true;
      callbacksRef.current?.onArrive();
    }
    callbacksRef.current?.onAfterSettle?.();
    setSettlingFade(true);
    clearTimers();
    fadeTimerRef.current = window.setTimeout(() => {
      setActiveWalk(null);
      setSettlingFade(false);
      callbacksRef.current = null;
    }, 420);
  }, [clearTimers]);

  const handleWalkCancel = useCallback(() => {
    clearTimers();
    soundManager.resetWalkAudioModifiers();
    setActiveWalk(null);
    setSettlingFade(false);
    arrivedRef.current = false;
    callbacksRef.current = null;
  }, [clearTimers]);

  return {
    activeWalk,
    settlingFade,
    startWalk,
    handleWalkMidpoint,
    handleWalkComplete,
    handleWalkCancel,
  };
}

/**
 * 统一实景深度漫游容器：
 * - 平时稳定呈现交互场景（确保佛殿供桌、供品、人物 1:1 精确对齐）。
 * - 当进入大殿、退至殿外或沿路径漫步时，原地启动统一实景序列 + 光流深度透视步行引擎。
 * - 底部停靠式控制栏保持 100% 洁净无遮挡，支持路径直达与自由漫步键盘/触控步进。
 */
export function SpatialViewport2D5({
  realm,
  spatialNode,
  isInsideHall = false,
  activeWalk = null,
  settlingFade = false,
  onWalkMidpoint,
  onWalkComplete,
  onWalkCancel,
  onWalkToConnection,
  onEnterInterior,
  onExitInterior,
  children,
}: {
  realm: SpatialRealmType;
  spatialNode?: SpatialNode;
  isInsideHall?: boolean;
  activeWalk?: WalkRequest | null;
  settlingFade?: boolean;
  onWalkMidpoint?: () => void;
  onWalkComplete?: () => void;
  onWalkCancel?: () => void;
  transitionState?: RoamingTransitionState;
  onWalkToConnection?: (conn: SpatialConnection) => void;
  onEnterInterior?: () => void;
  onExitInterior?: () => void;
  children: ReactNode;
}) {
  const { settings, updateSettings } = useAppState();
  const motionEnabled = useSpatialMotionEnabled();
  const freeRoam = settings.roamingMode === "free";
  const connections = spatialNode?.connections || [];
  const isWalking = Boolean(activeWalk && motionEnabled);

  const triggerDirectionStep = useCallback(
    (dir: "forward" | "back" | "left" | "right") => {
      if (isWalking) return;
      if (dir === "forward") {
        if (!isInsideHall && onEnterInterior) {
          onEnterInterior();
          return;
        }
        const fwd = connections.find((c) => c.direction === "forward");
        if (fwd && onWalkToConnection) {
          onWalkToConnection(fwd);
        }
        return;
      }
      if (dir === "back") {
        if (isInsideHall && onExitInterior) {
          onExitInterior();
          return;
        }
        const back = connections.find((c) => c.direction === "back");
        if (back && onWalkToConnection) {
          onWalkToConnection(back);
        }
        return;
      }
      const side = connections.find((c) => c.direction === dir);
      if (side && onWalkToConnection) {
        onWalkToConnection(side);
      }
    },
    [
      isWalking,
      isInsideHall,
      onEnterInterior,
      onExitInterior,
      connections,
      onWalkToConnection,
    ],
  );

  // Desktop keyboard WASD / Arrow navigation when Free-Roam active and not currently walking
  useEffect(() => {
    if (!freeRoam || isWalking) return;
    const onKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      if (
        target &&
        (target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          target.isContentEditable)
      ) {
        return;
      }
      const k = e.key.toLowerCase();
      if (k === "w" || e.key === "ArrowUp") {
        e.preventDefault();
        triggerDirectionStep("forward");
      } else if (k === "s" || e.key === "ArrowDown") {
        e.preventDefault();
        triggerDirectionStep("back");
      } else if (k === "a" || e.key === "ArrowLeft") {
        e.preventDefault();
        triggerDirectionStep("left");
      } else if (k === "d" || e.key === "ArrowRight") {
        e.preventDefault();
        triggerDirectionStep("right");
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [freeRoam, isWalking, triggerDirectionStep]);

  const themeAccent =
    realm === "daoist"
      ? "bg-[#1f4e45] text-[#f3f8f5]"
      : realm === "nature"
        ? "bg-[#234d4a] text-[#f2faf8]"
        : "bg-[#922e25] text-[#fff8eb]";

  const dockBg =
    realm === "daoist"
      ? "border-[#223c36] bg-[#0e1f1c] text-[#e6f3ee]"
      : realm === "nature"
        ? "border-[#243d3e] bg-[#112022] text-[#e6f3f2]"
        : "border-[#432d26] bg-[#1e1411] text-[#f5ece0]";

  const hasForward =
    (!isInsideHall && Boolean(onEnterInterior)) ||
    connections.some((c) => c.direction === "forward");
  const hasBack =
    (isInsideHall && Boolean(onExitInterior)) ||
    connections.some((c) => c.direction === "back");
  const hasLeft = connections.some((c) => c.direction === "left");
  const hasRight = connections.some((c) => c.direction === "right");

  return (
    <div className="flex flex-col">
      {/* Unified Stage + Real-Time Photorealistic Depth Walk Viewport */}
      <div className="relative w-full overflow-hidden">
        {children}

        {isWalking && activeWalk && onWalkComplete && onWalkCancel && (
          <div
            className={`absolute inset-0 z-40 transition-opacity duration-[420ms] ease-out ${
              settlingFade ? "opacity-0 pointer-events-none" : "opacity-100"
            }`}
          >
            <PhotorealWalkViewport
              key={activeWalk.id}
              request={activeWalk}
              onStageMidpoint={onWalkMidpoint}
              onComplete={onWalkComplete}
              onCancel={onWalkCancel}
            />
          </div>
        )}
      </div>

      {/* =========================================================
       * 停靠式空间漫游控制栏（位于画面下方，绝不遮挡佛像与供桌）
       * ========================================================= */}
      <div className={`border-t px-3.5 py-2.5 text-xs ${dockBg}`}>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Compass size={14} className="shrink-0 text-[#d4a85d]" />
            <span className="font-semibold text-[#e5c17c]">
              云上步行漫游 · {freeRoam ? "自由漫步" : "路径引导"}
            </span>
            {spatialNode && (
              <span className="hidden text-[11px] opacity-75 sm:inline tabular-nums">
                · {spatialNode.title} ({spatialNode.coordinates.x},{" "}
                {spatialNode.coordinates.z})
              </span>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-1.5">
            <button
              type="button"
              onClick={() =>
                updateSettings({
                  roamingMode: freeRoam ? "auto" : "free",
                })
              }
              className={`inline-flex min-h-[30px] items-center gap-1 rounded-lg px-2.5 text-[11px] font-semibold transition-colors cursor-pointer ${
                freeRoam ? themeAccent : "bg-white/10 hover:bg-white/15"
              }`}
            >
              <Navigation size={12} />
              <span>{freeRoam ? "切回路径引导" : "开启自由漫步"}</span>
            </button>

            <span
              title="V3.0 阶段0 已停用图片拉伸步入，保持纯净静态切换"
              className="inline-flex min-h-[30px] items-center gap-1 rounded-lg bg-white/8 px-2.5 text-[11px] text-[#d8cab8]"
            >
              <Footprints size={12} />
              <span>纯净静态切换</span>
            </span>

            <Link
              to="/spatial-lab"
              className="inline-flex min-h-[30px] items-center gap-1 rounded-lg border border-[#e5c17c]/35 bg-[#b88b44]/18 px-2.5 text-[11px] font-medium text-[#e5c17c] hover:bg-[#b88b44]/28"
            >
              <span>3DGS 空间实验室</span>
            </Link>
          </div>
        </div>

        {/* Clickable Spatial Path Connections */}
        {(connections.length > 0 || onEnterInterior || onExitInterior) && (
          <div className="mt-2 flex flex-wrap items-center gap-1.5">
            {connections.map((conn) => (
              <button
                key={`${conn.targetSceneId}-${conn.direction}`}
                type="button"
                disabled={isWalking}
                onClick={() => onWalkToConnection?.(conn)}
                className="inline-flex min-h-[32px] items-center gap-1 rounded-lg bg-white/10 px-2.5 py-1 text-[11px] font-medium hover:bg-white/20 active:scale-95 disabled:opacity-50 transition-all cursor-pointer"
              >
                {conn.direction === "left" && <ArrowLeft size={12} />}
                {conn.direction === "right" && <ArrowRight size={12} />}
                {conn.direction === "forward" && <ArrowUp size={12} />}
                {conn.direction === "back" && <ArrowDown size={12} />}
                <span>{conn.label}</span>
              </button>
            ))}

            {!isInsideHall && onEnterInterior && (
              <button
                type="button"
                disabled={isWalking}
                onClick={onEnterInterior}
                className={`inline-flex min-h-[32px] items-center gap-1 rounded-lg px-2.5 py-1 text-[11px] font-bold disabled:opacity-50 cursor-pointer ${themeAccent}`}
              >
                <ArrowUp size={12} />
                <span>沿石阶步入殿内</span>
              </button>
            )}
            {isInsideHall && onExitInterior && (
              <button
                type="button"
                disabled={isWalking}
                onClick={onExitInterior}
                className="inline-flex min-h-[32px] items-center gap-1 rounded-lg bg-white/10 px-2.5 py-1 text-[11px] font-medium hover:bg-white/20 disabled:opacity-50 cursor-pointer"
              >
                <ArrowDown size={12} />
                <span>穿门退至殿外</span>
              </button>
            )}
          </div>
        )}

        {/* Free-Roam Controls (Keyboard WASD + Touch Directional Pad triggering real 3D walk) */}
        {freeRoam && (
          <div className="mt-2 flex flex-wrap items-center justify-between gap-2 border-t border-white/10 pt-2">
            <span className="text-[11px] opacity-80">
              {isWalking
                ? "步行中：鼠标/单指拖拽可微转环顾 · W/S 调速 · 空格停步"
                : "电脑按 W/A/S/D 或方向键步行前往 · 手机点按方向图标"}
            </span>

            <div className="flex items-center gap-1">
              <button
                type="button"
                disabled={!hasLeft || isWalking}
                onClick={() => triggerDirectionStep("left")}
                aria-label="向左廊步行"
                className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/12 hover:bg-white/20 disabled:opacity-30 active:scale-95 cursor-pointer"
              >
                <ArrowLeft size={14} />
              </button>
              <button
                type="button"
                disabled={!hasForward || isWalking}
                onClick={() => triggerDirectionStep("forward")}
                aria-label="向前步入"
                className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/12 hover:bg-white/20 disabled:opacity-30 active:scale-95 cursor-pointer"
              >
                <ArrowUp size={14} />
              </button>
              <button
                type="button"
                disabled={!hasBack || isWalking}
                onClick={() => triggerDirectionStep("back")}
                aria-label="向后退步"
                className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/12 hover:bg-white/20 disabled:opacity-30 active:scale-95 cursor-pointer"
              >
                <ArrowDown size={14} />
              </button>
              <button
                type="button"
                disabled={!hasRight || isWalking}
                onClick={() => triggerDirectionStep("right")}
                aria-label="向右廊步行"
                className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/12 hover:bg-white/20 disabled:opacity-30 active:scale-95 cursor-pointer"
              >
                <ArrowRight size={14} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
