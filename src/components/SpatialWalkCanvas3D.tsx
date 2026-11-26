import { ArrowRight, Pause, Play, RotateCcw } from "lucide-react";
import {
  useEffect,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
} from "react";
import * as THREE from "three";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";
import {
  evaluateNaturalWalkCurve,
  getNaturalWalkVelocity,
  getWalkStageMeta,
  type WalkRequest,
} from "@/data/walkProfiles";
import { soundManager } from "@/lib/audio";
import { buildWalkScene } from "@/lib/threeWalkBuilders";
import {
  createWalkTextureSet,
  loadSceneTexture,
} from "@/lib/threeWalkTextures";

function detectSoftwareWebGL(): { supported: boolean; software: boolean } {
  if (typeof document === "undefined") {
    return { supported: false, software: true };
  }
  try {
    const probe = document.createElement("canvas");
    const gl =
      (probe.getContext("webgl2") as WebGLRenderingContext | null) ||
      (probe.getContext("webgl") as WebGLRenderingContext | null);
    if (!gl) return { supported: false, software: true };
    const ext = gl.getExtension("WEBGL_debug_renderer_info");
    const rendererStr = ext
      ? String(gl.getParameter(ext.UNMASKED_RENDERER_WEBGL) || "")
      : "";
    const isSoft = /SwiftShader|llvmpipe|Software|Basic Render|WARP/i.test(
      rendererStr,
    );
    const loseExt = gl.getExtension("WEBGL_lose_context");
    loseExt?.loseContext();
    return { supported: true, software: isSoft };
  } catch {
    return { supported: false, software: true };
  }
}

export function SpatialWalkCanvas3D({
  request,
  onComplete,
  onCancel,
  onStageMidpoint,
}: {
  request: WalkRequest;
  onComplete: () => void;
  onCancel: () => void;
  /** Optional hook called around Stage 5-6 when interior view is ready */
  onStageMidpoint?: () => void;
}) {
  const hostRef = useRef<HTMLDivElement | null>(null);
  const [paused, setPaused] = useState(false);
  const [progressUi, setProgressUi] = useState(0);
  const [webglUnavailable, setWebglUnavailable] = useState(false);

  const pausedRef = useRef(false);
  const finishedRef = useRef(false);
  const midpointFiredRef = useRef(false);
  const speedBoostRef = useRef(1);
  const lookTargetRef = useRef({ yaw: 0, pitch: 0 });
  const pointerDragRef = useRef<{ x: number; y: number } | null>(null);

  const onCompleteRef = useRef(onComplete);
  const onCancelRef = useRef(onCancel);
  const onMidpointRef = useRef(onStageMidpoint);
  onCompleteRef.current = onComplete;
  onCancelRef.current = onCancel;
  onMidpointRef.current = onStageMidpoint;

  useEffect(() => {
    pausedRef.current = paused;
  }, [paused]);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;

    const probe = detectSoftwareWebGL();
    if (!probe.supported) {
      setWebglUnavailable(true);
      return;
    }

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({
        antialias: !probe.software,
        powerPreference: "high-performance",
        alpha: false,
      });
    } catch {
      setWebglUnavailable(true);
      return;
    }

    const rect = host.getBoundingClientRect();
    const initW = Math.max(320, rect.width || 640);
    const initH = Math.max(220, rect.height || 360);

    renderer.setPixelRatio(
      Math.min(window.devicePixelRatio || 1, probe.software ? 1 : 2),
    );
    renderer.setSize(initW, initH);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.02;
    renderer.domElement.style.display = "block";
    renderer.domElement.style.width = "100%";
    renderer.domElement.style.height = "100%";
    host.appendChild(renderer.domElement);

    const pmrem = new THREE.PMREMGenerator(renderer);
    const roomEnv = new RoomEnvironment();
    const envTarget = pmrem.fromScene(roomEnv, 0.04);

    const maxAniso = renderer.capabilities.getMaxAnisotropy();
    const texSet = createWalkTextureSet(request.tradition, maxAniso);
    const exteriorTex = loadSceneTexture(request.exteriorImage, maxAniso);
    const interiorTex = loadSceneTexture(request.interiorImage, maxAniso);
    const targetTex = loadSceneTexture(
      request.targetImage || request.exteriorImage,
      maxAniso,
    );

    const built = buildWalkScene(
      request,
      texSet,
      exteriorTex,
      interiorTex,
      targetTex,
    );
    built.scene.environment = envTarget.texture;
    built.scene.environmentIntensity = 0.5;

    // Natural 46° human-eye architectural lens prevents fish-eye wall stretching
    const camera = new THREE.PerspectiveCamera(46, initW / initH, 0.1, 140);
    const isExit = request.mode === "exit-hall";
    const startZ = isExit ? built.cameraEndZ : built.cameraStartZ;
    const endZ = isExit ? built.cameraStartZ : built.cameraEndZ;

    // Gentle centered lateral offset for left/right courtyard passages
    const startX =
      request.mode === "courtyard-walk" || request.mode === "trail-walk"
        ? request.direction === "left"
          ? -1.4
          : request.direction === "right"
            ? 1.4
            : 0
        : 0;

    camera.position.set(
      startX,
      isExit ? built.cameraEndY : built.cameraStartY,
      startZ,
    );
    camera.lookAt(0, camera.position.y + 0.08, camera.position.z - 8);

    if (!probe.software) {
      renderer.compile(built.scene, camera);
    }

    // ResizeObserver for crisp responsive sizing on mobile/desktop
    const resizeObs = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const w = Math.max(240, Math.round(entry.contentRect.width));
        const h = Math.max(180, Math.round(entry.contentRect.height));
        camera.aspect = w / h;
        camera.updateProjectionMatrix();
        renderer.setSize(w, h);
      }
    });
    resizeObs.observe(host);

    // Gentle pace keys while walking (W/Up mild 1.35x, S/Down 0.5x extra slow, Space pause)
    const onKeyDown = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement | null)?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA") return;
      const k = e.key.toLowerCase();
      if (k === "w" || e.key === "ArrowUp") {
        speedBoostRef.current = 1.35;
      } else if (k === "s" || e.key === "ArrowDown") {
        speedBoostRef.current = 0.5;
      } else if (k === " ") {
        e.preventDefault();
        setPaused((p) => !p);
      } else if (k === "escape") {
        onCancelRef.current();
      }
    };
    const onKeyUp = (e: KeyboardEvent) => {
      const k = e.key.toLowerCase();
      if (
        k === "w" ||
        k === "s" ||
        e.key === "ArrowUp" ||
        e.key === "ArrowDown"
      ) {
        speedBoostRef.current = 1;
      }
    };
    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);

    // Animation state (zero allocations inside tick)
    let frameId = 0;
    let disposed = false;
    let lastTime = performance.now();
    let elapsedWalkMs = 0;
    let totalElapsedSec = 0;
    let prevZ = startZ;
    let distSinceStep = 0.42; // First calm step lands smoothly once moving
    let doorwayChimePlayed = false;
    let lastUiUpdateMs = 0;
    let currentYaw = 0;
    let currentPitch = 0;
    const lookTargetVec = new THREE.Vector3();

    function afterDraw(cb: () => void) {
      const gl = renderer.getContext() as WebGL2RenderingContext;
      if (!gl || typeof gl.fenceSync !== "function") {
        frameId = window.setTimeout(cb, 80);
        return;
      }
      const sync = gl.fenceSync(gl.SYNC_GPU_COMMANDS_COMPLETE, 0);
      gl.flush();
      const poll = () => {
        if (disposed) {
          if (sync) gl.deleteSync(sync);
          return;
        }
        const state = sync && gl.getSyncParameter(sync, gl.SYNC_STATUS);
        if (state === gl.UNSIGNALED) {
          frameId = window.setTimeout(poll, 5);
        } else {
          if (sync) gl.deleteSync(sync);
          frameId = window.setTimeout(cb, 80);
        }
      };
      frameId = window.setTimeout(poll, 5);
    }

    const tick = () => {
      if (disposed) return;
      const now = performance.now();
      const dtSec = Math.min((now - lastTime) / 1000, 0.05);
      lastTime = now;
      totalElapsedSec += dtSec;

      if (!pausedRef.current && !finishedRef.current) {
        elapsedWalkMs += dtSec * 1000 * speedBoostRef.current;
      }

      const rawT = Math.max(0, Math.min(1, elapsedWalkMs / request.durationMs));
      const easedT = evaluateNaturalWalkCurve(rawT);
      const vel = getNaturalWalkVelocity(rawT);

      // Update camera Z & X along authentic 3D spatial path
      const z = THREE.MathUtils.lerp(startZ, endZ, easedT);
      const xCurve = startX * Math.pow(1 - easedT, 1.8);

      // Elevation follows granite staircase seamlessly if hall has stairs
      let baseEyeY = 1.64;
      if (built.stepsTopY > 0 && built.stepsStartZ > built.stepsEndZ) {
        const stairRatio = THREE.MathUtils.clamp(
          (built.stepsStartZ - z) / (built.stepsStartZ - built.stepsEndZ),
          0,
          1,
        );
        const smoothStair = stairRatio * stairRatio * (3 - 2 * stairRatio);
        baseEyeY = 1.64 + smoothStair * built.stepsTopY;
      }

      // Ultra-restrained, dizziness-free natural stroll cadence tied to actual stride distance
      const gaitPhase = Math.abs(z - startZ) * (Math.PI / 0.78);
      const gaitBob = Math.sin(gaitPhase * 2) * 0.007 * vel;
      const gaitSway = Math.cos(gaitPhase) * 0.004 * vel;
      const gaitNod = Math.sin(gaitPhase * 2 + 0.4) * 0.0011 * vel;

      camera.position.set(xCurve + gaitSway, baseEyeY + gaitBob, z);

      // Smooth exponential damping on user look offset
      if (!pointerDragRef.current) {
        lookTargetRef.current.yaw = THREE.MathUtils.damp(
          lookTargetRef.current.yaw,
          0,
          3.2,
          dtSec,
        );
        lookTargetRef.current.pitch = THREE.MathUtils.damp(
          lookTargetRef.current.pitch,
          0,
          3.2,
          dtSec,
        );
      }
      currentYaw = THREE.MathUtils.damp(
        currentYaw,
        lookTargetRef.current.yaw,
        7.5,
        dtSec,
      );
      currentPitch = THREE.MathUtils.damp(
        currentPitch,
        lookTargetRef.current.pitch,
        7.5,
        dtSec,
      );

      // Level eye-line gaze (gentle architectural appreciation outside, level sanctuary focus inside)
      const subtleArchitecturalPitch =
        request.mode === "enter-hall"
          ? (1 - THREE.MathUtils.smoothstep(rawT, 0.35, 0.85)) * 0.02
          : 0.01;
      const lookDist = 8;
      lookTargetVec.set(
        camera.position.x + Math.sin(currentYaw) * lookDist,
        baseEyeY +
          gaitNod +
          (subtleArchitecturalPitch + Math.sin(currentPitch) * 0.65) * lookDist,
        z - Math.cos(currentYaw) * lookDist,
      );
      camera.lookAt(lookTargetVec);

      // Synchronized slow-pilgrimage footsteps (0.78m stride -> ~1.5 steps/sec, stops immediately on pause/settle)
      if (!pausedRef.current && !finishedRef.current && vel > 0.16 && rawT < 0.91) {
        distSinceStep += Math.abs(z - prevZ);
        if (distSinceStep >= 0.78) {
          distSinceStep = 0;
          const surface =
            request.mode === "trail-walk"
              ? "earth"
              : z < built.doorZ
                ? "wood"
                : "stone";
          const paceGain = 0.45 + 0.45 * vel;
          soundManager.playFootstepSurface(surface, 1, paceGain);
        }
      }
      prevZ = z;

      // Continuous acoustic attenuation & indoor resonance swell across threshold
      if (!pausedRef.current && !finishedRef.current) {
        soundManager.updateWalkAudioProgression(
          rawT,
          request.mode,
          request.tradition,
        );
      }

      if (!doorwayChimePlayed && rawT >= 0.62) {
        doorwayChimePlayed = true;
        if (request.mode === "enter-hall") {
          soundManager.playSpatialCue("hall-enter");
        } else if (request.mode === "exit-hall") {
          soundManager.playSpatialCue("hall-exit");
        } else {
          soundManager.playSpatialCue("gate-pass");
        }
      }

      if (!midpointFiredRef.current && rawT >= 0.88) {
        midpointFiredRef.current = true;
        onMidpointRef.current?.();
      }

      built.update(rawT, totalElapsedSec, camera.aspect);
      renderer.render(built.scene, camera);

      if (now - lastUiUpdateMs > 60 || rawT >= 1) {
        lastUiUpdateMs = now;
        setProgressUi(rawT);
      }

      if (rawT >= 1 && !finishedRef.current) {
        finishedRef.current = true;
        soundManager.resetWalkAudioModifiers();
        onCompleteRef.current();
        return;
      }

      if (probe.software) {
        afterDraw(tick);
      } else {
        frameId = window.requestAnimationFrame(tick);
      }
    };

    if (probe.software) {
      frameId = window.setTimeout(tick, 16);
    } else {
      frameId = window.requestAnimationFrame(tick);
    }

    return () => {
      disposed = true;
      window.cancelAnimationFrame(frameId);
      window.clearTimeout(frameId);
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
      resizeObs.disconnect();
      soundManager.resetWalkAudioModifiers();
      built.dispose();
      texSet.dispose();
      roomEnv.dispose();
      envTarget.dispose();
      pmrem.dispose();
      renderer.dispose();
      if (renderer.domElement.parentNode === host) {
        host.removeChild(renderer.domElement);
      }
    };
  }, [request]);

  // Fallback timer only if WebGL itself cannot initialize on a legacy device
  useEffect(() => {
    if (!webglUnavailable) return;
    const t1 = window.setTimeout(() => onMidpointRef.current?.(), 420);
    const t2 = window.setTimeout(() => onCompleteRef.current(), 900);
    return () => {
      window.clearTimeout(t1);
      window.clearTimeout(t2);
    };
  }, [webglUnavailable]);

  const handlePointerDown = (e: ReactPointerEvent<HTMLDivElement>) => {
    pointerDragRef.current = { x: e.clientX, y: e.clientY };
  };

  const handlePointerMove = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (!pointerDragRef.current) return;
    const dx = e.clientX - pointerDragRef.current.x;
    const dy = e.clientY - pointerDragRef.current.y;
    pointerDragRef.current = { x: e.clientX, y: e.clientY };
    lookTargetRef.current.yaw = THREE.MathUtils.clamp(
      lookTargetRef.current.yaw - dx * 0.0028,
      -0.28,
      0.28,
    );
    lookTargetRef.current.pitch = THREE.MathUtils.clamp(
      lookTargetRef.current.pitch - dy * 0.002,
      -0.12,
      0.12,
    );
  };

  const handlePointerUp = () => {
    pointerDragRef.current = null;
  };

  const stageMeta = getWalkStageMeta(progressUi, request.mode);

  const accentBtn =
    request.tradition === "daoist"
      ? "bg-[#1f4e45] text-[#f3f8f5]"
      : request.tradition === "nature"
        ? "bg-[#234d4a] text-[#f2faf8]"
        : "bg-[#b88b44] text-[#1f1612]";

  const barBg =
    request.tradition === "daoist"
      ? "bg-[#0d1c19]/95 border-[#223c36] text-[#e6f3ee]"
      : request.tradition === "nature"
        ? "bg-[#101c1e]/95 border-[#243d3e] text-[#e6f3f2]"
        : "bg-[#18100d]/95 border-[#432d26] text-[#f5ece0]";

  if (webglUnavailable) {
    return (
      <div className="flex h-full w-full items-center justify-center bg-[#18120f] px-4 text-center text-xs text-[#f5ece0]">
        <span>正在进入 {request.toTitle}…</span>
      </div>
    );
  }

  return (
    <div className="relative h-full w-full select-none overflow-hidden bg-[#120d0b]">
      {/* Real-time 3D WebGL Viewport (zero backdrop-blur overlays above canvas) */}
      <div
        ref={hostRef}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        className="h-full w-full cursor-grab active:cursor-grabbing touch-none"
      />

      {/* Minimal non-intrusive bottom strip HUD (no floating bubbles, no backdrop-blur) */}
      <div
        className={`absolute inset-x-0 bottom-0 z-30 border-t px-3.5 py-2.5 ${barBg}`}
      >
        {/* Continuous 6-stage thin progress track */}
        <div className="mb-2 h-1 w-full overflow-hidden rounded-full bg-white/15">
          <div
            className="h-full rounded-full bg-[#d4a85d] transition-[width] duration-75"
            style={{ width: `${Math.round(progressUi * 100)}%` }}
          />
        </div>

        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 text-xs font-semibold">
              <span className="shrink-0 text-[#e5c17c] tabular-nums">
                {stageMeta.stage}/6 · {stageMeta.title}
              </span>
              <span className="hidden truncate text-[11px] opacity-80 sm:inline">
                {stageMeta.detail}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => setPaused((p) => !p)}
              className="inline-flex min-h-[30px] items-center gap-1 rounded-lg bg-white/12 px-2.5 text-[11px] font-medium hover:bg-white/20 cursor-pointer"
            >
              {paused ? <Play size={12} /> : <Pause size={12} />}
              <span>{paused ? "继续" : "停步"}</span>
            </button>

            <button
              type="button"
              onClick={() => {
                soundManager.resetWalkAudioModifiers();
                onCancel();
              }}
              className="inline-flex min-h-[30px] items-center gap-1 rounded-lg bg-white/12 px-2.5 text-[11px] font-medium hover:bg-white/20 cursor-pointer"
            >
              <RotateCcw size={12} />
              <span>取消返回</span>
            </button>

            <button
              type="button"
              onClick={() => {
                soundManager.resetWalkAudioModifiers();
                onMidpointRef.current?.();
                onComplete();
              }}
              className={`inline-flex min-h-[30px] items-center gap-1 rounded-lg px-2.5 text-[11px] font-bold hover:opacity-90 cursor-pointer ${accentBtn}`}
            >
              <span>直达目的地</span>
              <ArrowRight size={12} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
