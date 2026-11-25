import {
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  ArrowUp,
  Compass,
  Footprints,
  Navigation,
} from "lucide-react";
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type PointerEvent,
  type ReactNode,
} from "react";
import { useAppState } from "@/context/AppContext";
import type {
  SpatialConnection,
  SpatialNode,
  SpatialRealmType,
  SpatialTransitionKind,
} from "@/data/spatialGraph";
import { soundManager } from "@/lib/audio";

export type RoamingTransitionState = {
  active: boolean;
  kind: SpatialTransitionKind;
  phase: "depart" | "arrive" | "idle";
  label?: string;
};

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
    settings.roamingMotionEnabled &&
    settings.animationMode === "full" &&
    !osReduced
  );
}

/**
 * 2.5D 统一空间相机与视差容器：
 * - 将底图、环境氛围、殿堂供桌与人物叠加层统一包裹在同一相机矩阵层内，确保镜头推进/微移时供品与桌面 1:1 严丝合缝锁定。
 * - 支持前景遮挡视差（檐角/松枝/云雾边框 1.45x 移动）与进退景深过渡。
 * - 支持模式 A（点击路径自动漫步）与模式 B（键盘 WASD/方向键 + 触控拖拽/方向垫自由漫步）。
 */
export function SpatialViewport2D5({
  realm,
  spatialNode,
  isInsideHall = false,
  transitionState,
  onWalkToConnection,
  onEnterInterior,
  onExitInterior,
  children,
}: {
  realm: SpatialRealmType;
  spatialNode?: SpatialNode;
  isInsideHall?: boolean;
  transitionState: RoamingTransitionState;
  onWalkToConnection?: (conn: SpatialConnection) => void;
  onEnterInterior?: () => void;
  onExitInterior?: () => void;
  children: ReactNode;
}) {
  const { settings, updateSettings } = useAppState();
  const motionEnabled = useSpatialMotionEnabled();
  const freeRoam = settings.roamingMode === "free";

  // Subtle camera state (bounded so zero distortion & zero nausea)
  const [camOffset, setCamOffset] = useState({ x: 0, y: 0, z: 1 });
  const [stepPulse, setStepPulse] = useState(0);
  const pointerDraggingRef = useRef<{ x: number; y: number } | null>(null);
  const lastStepSoundMsRef = useRef(0);

  // Reset camera to neutral on scene/hall change
  useEffect(() => {
    setCamOffset({ x: 0, y: 0, z: 1 });
  }, [spatialNode?.sceneId, isInsideHall]);

  const playThrottledFootstep = useCallback(() => {
    const now = Date.now();
    if (now - lastStepSoundMsRef.current > 290) {
      lastStepSoundMsRef.current = now;
      soundManager.playSpatialCue("footstep", 1);
      setStepPulse((p) => p + 1);
    }
  }, []);

  const stepFreeCamera = useCallback(
    (dx: number, dz: number, dy = 0) => {
      if (!motionEnabled) {
        if (dz > 0 && !isInsideHall && onEnterInterior) {
          onEnterInterior();
        }
        return;
      }
      playThrottledFootstep();
      setCamOffset((prev) => {
        const nextZ = Math.max(0.96, Math.min(1.13, prev.z + dz));
        const nextX = Math.max(-3.8, Math.min(3.8, prev.x + dx));
        const nextY = Math.max(-2.2, Math.min(2.2, prev.y + dy));
        return { x: nextX, y: nextY, z: nextZ };
      });
    },
    [motionEnabled, isInsideHall, onEnterInterior, playThrottledFootstep],
  );

  // Desktop keyboard WASD / Arrow navigation when Free-Roam active
  useEffect(() => {
    if (!freeRoam) return;
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
        stepFreeCamera(0, 0.032, 0.25);
      } else if (k === "s" || e.key === "ArrowDown") {
        e.preventDefault();
        stepFreeCamera(0, -0.032, -0.25);
      } else if (k === "a" || e.key === "ArrowLeft") {
        e.preventDefault();
        stepFreeCamera(1.1, 0, 0);
      } else if (k === "d" || e.key === "ArrowRight") {
        e.preventDefault();
        stepFreeCamera(-1.1, 0, 0);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [freeRoam, stepFreeCamera]);

  // Subtle pointer look in Free-Roam mode (drag on touch/mouse, or gentle hover look)
  const handlePointerDown = (e: PointerEvent<HTMLDivElement>) => {
    if (!freeRoam || !motionEnabled) return;
    pointerDraggingRef.current = { x: e.clientX, y: e.clientY };
  };

  const handlePointerMove = (e: PointerEvent<HTMLDivElement>) => {
    if (!freeRoam || !motionEnabled) return;
    if (pointerDraggingRef.current) {
      const dx = (e.clientX - pointerDraggingRef.current.x) * 0.025;
      const dy = (e.clientY - pointerDraggingRef.current.y) * 0.015;
      pointerDraggingRef.current = { x: e.clientX, y: e.clientY };
      setCamOffset((prev) => ({
        ...prev,
        x: Math.max(-3.8, Math.min(3.8, prev.x + dx)),
        y: Math.max(-2.2, Math.min(2.2, prev.y + dy)),
      }));
    }
  };

  const handlePointerUp = () => {
    pointerDraggingRef.current = null;
  };

  // Compute transition camera transform during Mode A auto-walk
  let tx = camOffset.x;
  let ty = camOffset.y;
  let scale = camOffset.z;

  if (motionEnabled && transitionState.active) {
    if (transitionState.phase === "depart") {
      if (transitionState.kind === "push-in") {
        scale = 1.11;
        ty = -1.2;
      } else if (transitionState.kind === "pull-back") {
        scale = 0.94;
        ty = 1.2;
      } else if (transitionState.kind === "lateral-left") {
        tx = 4.2;
        scale = 1.04;
      } else if (transitionState.kind === "lateral-right") {
        tx = -4.2;
        scale = 1.04;
      } else {
        scale = 1.07;
      }
    } else if (transitionState.phase === "arrive") {
      scale = 1.0;
      tx = 0;
      ty = 0;
    }
  }

  // Subtle natural walking cadence micro-bob during transitions or steps
  const bobClass =
    motionEnabled && transitionState.active
      ? "animate-spatial-walk-bob"
      : "";

  // Foreground occlusion frame parallax moves faster than midground (1.45x)
  const fgX = tx * 1.45;
  const fgY = ty * 1.45;
  const fgScale = 1 + (scale - 1) * 1.45;

  const connections = spatialNode?.connections || [];

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

  return (
    <div className="flex flex-col">
      {/* 2.5D Camera Viewport */}
      <div
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        className={`relative w-full overflow-hidden ${
          freeRoam && motionEnabled ? "cursor-grab active:cursor-grabbing" : ""
        }`}
      >
        {/* Unified Midground Camera Matrix Container (Image + Tabletop Offerings Lockstep!) */}
        <div
          key={`cam-${stepPulse > 0 ? "s" : "0"}`}
          className={`relative h-full w-full transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] will-change-transform ${bobClass}`}
          style={{
            transform: `translate3d(${tx.toFixed(2)}%, ${ty.toFixed(2)}%, 0) scale(${scale.toFixed(3)})`,
          }}
        >
          {children}
        </div>

        {/* Foreground Depth Occlusion Frame (1.45x Parallax: Temple Eaves / Pine Silhouettes / Mist Vignette) */}
        {motionEnabled && !isInsideHall && (
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 z-25 overflow-hidden transition-transform duration-700 ease-out"
            style={{
              transform: `translate3d(${fgX.toFixed(2)}%, ${fgY.toFixed(2)}%, 0) scale(${fgScale.toFixed(3)})`,
            }}
          >
            {realm === "buddhist" && (
              <>
                <div className="absolute -top-3 -left-3 h-20 w-24 rounded-br-3xl bg-gradient-to-br from-[#1b0e0b]/45 via-[#2a1510]/15 to-transparent" />
                <div className="absolute -top-3 -right-3 h-20 w-24 rounded-bl-3xl bg-gradient-to-bl from-[#1b0e0b]/45 via-[#2a1510]/15 to-transparent" />
              </>
            )}
            {realm !== "buddhist" && (
              <>
                <div className="absolute -top-3 -left-3 h-24 w-28 rounded-br-full bg-gradient-to-br from-[#0c1d19]/40 via-[#153029]/12 to-transparent" />
                <div className="absolute -top-3 -right-3 h-24 w-28 rounded-bl-full bg-gradient-to-bl from-[#0c1d19]/40 via-[#153029]/12 to-transparent" />
              </>
            )}
          </div>
        )}

        {/* Spatial Doorway / Foliage Pass-Through Occlusion Curtain during Mode A Auto-Walk */}
        {transitionState.active && (
          <div
            aria-hidden="true"
            className={`pointer-events-none absolute inset-0 z-35 transition-opacity duration-500 ${
              transitionState.phase === "depart" ? "opacity-90" : "opacity-0"
            }`}
            style={{
              background:
                realm === "buddhist"
                  ? "radial-gradient(circle at center, rgba(240, 200, 128, 0.25) 0%, rgba(28, 15, 11, 0.68) 72%)"
                  : "radial-gradient(circle at center, rgba(210, 236, 226, 0.28) 0%, rgba(12, 26, 23, 0.66) 72%)",
            }}
          >
            {transitionState.label && (
              <div className="flex h-full items-center justify-center">
                <span className="rounded-xl bg-black/45 px-4 py-2 font-serif-display text-sm font-semibold tracking-wider text-[#fff8eb] backdrop-blur-sm">
                  {transitionState.label}
                </span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* =========================================================
       * 2.5D Spatial Roaming Dock (Docked cleanly below stage, ZERO scene overlay clutter!)
       * ========================================================= */}
      <div className={`border-t px-3.5 py-2.5 text-xs ${dockBg}`}>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Compass size={14} className="shrink-0 text-[#d4a85d]" />
            <span className="font-semibold text-[#e5c17c]">
              云上漫游 · {freeRoam ? "自由漫步" : "路径漫步"}
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
              <span>{freeRoam ? "切回路径漫步" : "开启自由漫步"}</span>
            </button>

            <button
              type="button"
              onClick={() =>
                updateSettings({
                  roamingMotionEnabled: !settings.roamingMotionEnabled,
                })
              }
              title="随时减弱或开启漫游镜头推进动态"
              className={`inline-flex min-h-[30px] items-center gap-1 rounded-lg px-2.5 text-[11px] font-medium transition-colors cursor-pointer ${
                settings.roamingMotionEnabled
                  ? "bg-white/10 hover:bg-white/15"
                  : "bg-[#b88b44] text-[#1f1612] font-semibold"
              }`}
            >
              <Footprints size={12} />
              <span>
                {settings.roamingMotionEnabled ? "镜头动态：开" : "镜头：静止"}
              </span>
            </button>
          </div>
        </div>

        {/* Mode A: Clickable Spatial Connections along Current Path */}
        {connections.length > 0 && onWalkToConnection && (
          <div className="mt-2 flex flex-wrap items-center gap-1.5">
            {connections.map((conn) => (
              <button
                key={`${conn.targetSceneId}-${conn.direction}`}
                type="button"
                onClick={() => onWalkToConnection(conn)}
                className="inline-flex min-h-[32px] items-center gap-1 rounded-lg bg-white/10 px-2.5 py-1 text-[11px] font-medium hover:bg-white/20 active:scale-95 transition-all cursor-pointer"
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
                onClick={onEnterInterior}
                className={`inline-flex min-h-[32px] items-center gap-1 rounded-lg px-2.5 py-1 text-[11px] font-bold cursor-pointer ${themeAccent}`}
              >
                <ArrowUp size={12} />
                <span>推门步入殿内</span>
              </button>
            )}
            {isInsideHall && onExitInterior && (
              <button
                type="button"
                onClick={onExitInterior}
                className="inline-flex min-h-[32px] items-center gap-1 rounded-lg bg-white/10 px-2.5 py-1 text-[11px] font-medium hover:bg-white/20 cursor-pointer"
              >
                <ArrowDown size={12} />
                <span>退步出殿</span>
              </button>
            )}
          </div>
        )}

        {/* Mode B: Free-Roam Controls (Keyboard WASD hint + Touch Directional Pad) */}
        {freeRoam && (
          <div className="mt-2 flex flex-wrap items-center justify-between gap-2 border-t border-white/10 pt-2">
            <span className="text-[11px] opacity-80">
              电脑支持 WASD / 方向键漫步 · 手机可拖拽画面或点按方向步进
            </span>

            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => stepFreeCamera(1.2, 0, 0)}
                aria-label="向左平移漫步"
                className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/12 hover:bg-white/20 active:scale-95 cursor-pointer"
              >
                <ArrowLeft size={14} />
              </button>
              <button
                type="button"
                onClick={() => stepFreeCamera(0, 0.035, 0.3)}
                aria-label="向前走近"
                className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/12 hover:bg-white/20 active:scale-95 cursor-pointer"
              >
                <ArrowUp size={14} />
              </button>
              <button
                type="button"
                onClick={() => stepFreeCamera(0, -0.035, -0.3)}
                aria-label="向后退步"
                className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/12 hover:bg-white/20 active:scale-95 cursor-pointer"
              >
                <ArrowDown size={14} />
              </button>
              <button
                type="button"
                onClick={() => stepFreeCamera(-1.2, 0, 0)}
                aria-label="向右平移漫步"
                className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/12 hover:bg-white/20 active:scale-95 cursor-pointer"
              >
                <ArrowRight size={14} />
              </button>
              {(camOffset.x !== 0 || camOffset.y !== 0 || camOffset.z !== 1) && (
                <button
                  type="button"
                  onClick={() => setCamOffset({ x: 0, y: 0, z: 1 })}
                  className="ml-1 rounded-lg bg-white/10 px-2 py-1 text-[10px] hover:bg-white/20 cursor-pointer"
                >
                  回正视角
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
