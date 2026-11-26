import { ArrowRight, Pause, Play, RotateCcw } from "lucide-react";
import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
} from "react";
import * as THREE from "three";
import {
  buildWalkWaypointsForRequest,
  type WalkSurfaceKind,
  type WalkWaypointFrame,
} from "@/data/sceneAssets";
import {
  evaluateNaturalWalkCurve,
  getNaturalWalkVelocity,
  getWalkStageMeta,
  type WalkRequest,
} from "@/data/walkProfiles";
import { soundManager } from "@/lib/audio";

const VERTEX_SHADER = `
  varying vec2 vScreenUv;
  void main() {
    vScreenUv = uv;
    gl_Position = vec4(position.xy, 0.0, 1.0);
  }
`;

const FRAGMENT_SHADER = `
  precision highp float;

  varying vec2 vScreenUv;

  uniform sampler2D uTexA;
  uniform sampler2D uTexB;
  uniform float uTexAspectA;
  uniform float uTexAspectB;
  uniform float uViewAspect;

  uniform float uLocalT;
  uniform float uAdvA;
  uniform float uAdvB;

  uniform float uVanishXA;
  uniform float uHorizonYA;
  uniform float uPortalHalfWA;
  uniform float uPortalTopYA;
  uniform float uPortalBotYA;
  uniform float uFlankPowerA;

  uniform float uVanishXB;
  uniform float uHorizonYB;
  uniform float uPortalHalfWB;
  uniform float uPortalTopYB;
  uniform float uPortalBotYB;
  uniform float uFlankPowerB;

  uniform float uDoorOcclusion;
  uniform float uPortalBias;
  uniform float uInteriorWarmth;
  uniform vec2 uLookShift;
  uniform float uGaitBobY;
  uniform float uGaitSwayX;
  uniform float uStepDipA;
  uniform float uStepDipB;

  vec2 toCoverUv(vec2 screenUv, float viewAspect, float texAspect) {
    vec2 scale = vec2(1.0);
    if (viewAspect > texAspect) {
      scale.y = texAspect / viewAspect;
    } else {
      scale.x = viewAspect / texAspect;
    }
    return (screenUv - 0.5) * scale + 0.5;
  }

  vec2 projectOpticalDepth(
    vec2 coverUv,
    float advance,
    float vanishX,
    float horizonY,
    float portalHalfW,
    float portalTopY,
    float portalBotY,
    float flankPower,
    float stepDip
  ) {
    vec2 vp = vec2(vanishX, horizonY);
    vec2 delta = coverUv - vp;

    // 1. Ground proximity below horizon (bluestone / steps / Jinzhuan floor moves fastest under feet)
    float floorNorm = clamp((horizonY - coverUv.y) / max(horizonY, 0.08), 0.0, 1.0);
    float floorDepth = pow(floorNorm, 1.38) * 1.55;

    // 2. Lateral foreground proximity (railings, pines, portico pillars, carved doorframe jambs)
    float latDist = abs(coverUv.x - vanishX);
    float innerZone = portalHalfW * 0.55;
    float flankNorm = clamp((latDist - innerZone) / max(0.5 - innerZone, 0.12), 0.0, 1.0);
    float flankDepth = pow(flankNorm, 1.2) * flankPower;

    // 3. Overhead roof eaves / portico lintel sweeping above viewer
    float eaveNorm = clamp((coverUv.y - portalTopY) / max(1.0 - portalTopY, 0.08), 0.0, 1.0);
    float eaveDepth = pow(eaveNorm, 1.25) * 1.15;

    // 4. Threshold / lower balustrade proximity at bottom portal edge
    float sillNorm = clamp((portalBotY - coverUv.y) / max(portalBotY, 0.08), 0.0, 1.0);
    float sillDepth = pow(sillNorm, 1.3) * 1.35;

    // Central altar/Buddha corridor advances serenely without distortion
    float depthW = max(0.22, max(floorDepth, max(flankDepth, max(eaveDepth, sillDepth))));

    float denom = max(0.36, 1.0 + advance * depthW);
    vec2 p = vp + delta / denom;

    // Micro human gait + look offset weighted by depth (zero when stopped)
    float motionWeight = 0.25 + 0.75 * clamp(depthW * 0.65, 0.0, 1.0);
    p.x += (uLookShift.x + uGaitSwayX) * motionWeight;
    p.y += (uLookShift.y + uGaitBobY) * motionWeight + stepDip * (0.3 + 0.7 * floorNorm);

    return clamp(p, vec2(0.002), vec2(0.998));
  }

  void main() {
    vec2 coverA = toCoverUv(vScreenUv, uViewAspect, uTexAspectA);
    vec2 coverB = toCoverUv(vScreenUv, uViewAspect, uTexAspectB);

    vec2 uvA = projectOpticalDepth(
      coverA,
      uAdvA,
      uVanishXA,
      uHorizonYA,
      uPortalHalfWA,
      uPortalTopYA,
      uPortalBotYA,
      uFlankPowerA,
      uStepDipA
    );

    vec2 uvB = projectOpticalDepth(
      coverB,
      uAdvB,
      uVanishXB,
      uHorizonYB,
      uPortalHalfWB,
      uPortalTopYB,
      uPortalBotYB,
      uFlankPowerB,
      uStepDipB
    );

    vec3 colA = texture2D(uTexA, uvA).rgb;
    vec3 colB = texture2D(uTexB, uvB).rgb;

    // Spatial portal blend: inner doorway & floor advance slightly earlier than outer frame jambs
    float dx = abs(coverA.x - uVanishXA) / max(uPortalHalfWA, 0.06);
    float dyTop = max(0.0, (coverA.y - uPortalTopYA) / max(1.0 - uPortalTopYA, 0.08));
    float dyBot = max(0.0, (uPortalBotYA - coverA.y) / max(uPortalBotYA, 0.08));
    float portalEdge = clamp(max(dx, max(dyTop * 1.15, dyBot * 0.85)), 0.0, 1.6);
    float isOuterFrame = smoothstep(0.78, 1.25, portalEdge);

    float delay = isOuterFrame * uPortalBias;
    float span = max(0.28, 1.0 - delay);
    float localBlend = smoothstep(0.0, 1.0, clamp((uLocalT - delay) / span, 0.0, 1.0));

    vec3 color = mix(colA, colB, localBlend);

    // Subtle spatial doorframe shadow & warm lantern threshold light adaptation while crossing doorway
    float crossPulse = sin(clamp(uLocalT, 0.0, 1.0) * 3.14159265) * uDoorOcclusion;
    float edgeShadow = smoothstep(0.55, 1.35, portalEdge) * crossPulse * 0.22;
    color *= (1.0 - edgeShadow);

    // Gentle morning-to-sanctuary warmth balance (keeps photoreal colors natural)
    vec3 warmFilter = vec3(1.015, 1.0, 0.975);
    color *= mix(vec3(1.0), warmFilter, uInteriorWarmth * 0.55);

    gl_FragColor = vec4(color, 1.0);
  }
`;

function detectWebGLSupport(): { supported: boolean; software: boolean } {
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

function interpolateWaypoints(
  waypoints: WalkWaypointFrame[],
  progress: number,
): {
  idxA: number;
  idxB: number;
  localT: number;
  wpA: WalkWaypointFrame;
  wpB: WalkWaypointFrame;
} {
  if (waypoints.length <= 1) {
    const only = waypoints[0];
    return { idxA: 0, idxB: 0, localT: 0, wpA: only, wpB: only };
  }
  const p = Math.max(0, Math.min(1, progress));
  for (let i = 0; i < waypoints.length - 1; i += 1) {
    const a = waypoints[i];
    const b = waypoints[i + 1];
    if (p <= b.anchorT || i === waypoints.length - 2) {
      const span = Math.max(0.0001, b.anchorT - a.anchorT);
      const localT = Math.max(0, Math.min(1, (p - a.anchorT) / span));
      return { idxA: i, idxB: i + 1, localT, wpA: a, wpB: b };
    }
  }
  const last = waypoints.length - 1;
  return {
    idxA: last,
    idxB: last,
    localT: 1,
    wpA: waypoints[last],
    wpB: waypoints[last],
  };
}

/**
 * @deprecated V3.0 阶段0 已停用此旧版 2D 纹理透视变形/多图混合步行引擎。
 * 保留文件仅用于历史参考与兼容回退，不再作为默认空间漫游技术；
 * 真实空间漫游验证已迁移至独立模块 /spatial-lab (SpatialWalkLab)。
 */
export function PhotorealWalkViewport({
  request,
  onComplete,
  onCancel,
  onStageMidpoint,
}: {
  request: WalkRequest;
  onComplete: () => void;
  onCancel: () => void;
  onStageMidpoint?: () => void;
}) {
  const hostRef = useRef<HTMLDivElement | null>(null);
  const [paused, setPaused] = useState(false);
  const [progressUi, setProgressUi] = useState(0);
  const [texturesReady, setTexturesReady] = useState(false);
  const [webglUnavailable, setWebglUnavailable] = useState(false);

  const waypoints = useMemo(
    () =>
      buildWalkWaypointsForRequest({
        sceneId: request.sceneId,
        mode: request.mode,
        exteriorImage: request.exteriorImage,
        interiorImage: request.interiorImage,
        targetImage: request.targetImage,
      }),
    [
      request.sceneId,
      request.mode,
      request.exteriorImage,
      request.interiorImage,
      request.targetImage,
    ],
  );

  const pausedRef = useRef(false);
  const finishedRef = useRef(false);
  const midpointFiredRef = useRef(false);
  const speedBoostRef = useRef(1);
  const lookTargetRef = useRef({ x: 0, y: 0 });
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
    if (!host || waypoints.length === 0) return;

    const probe = detectWebGLSupport();
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
    renderer.domElement.style.display = "block";
    renderer.domElement.style.width = "100%";
    renderer.domElement.style.height = "100%";
    host.appendChild(renderer.domElement);

    const maxAniso = Math.min(8, renderer.capabilities.getMaxAnisotropy());
    const loader = new THREE.TextureLoader();
    const textures: THREE.Texture[] = [];
    const texAspects: number[] = new Array(waypoints.length).fill(16 / 9);
    let readyCount = 0;

    let disposed = false;
    waypoints.forEach((wp, idx) => {
      const tex = loader.load(wp.image, (loaded) => {
        if (disposed) return;
        const img = loaded.image as
          | { naturalWidth?: number; naturalHeight?: number; width?: number; height?: number }
          | undefined;
        const w = img?.naturalWidth || img?.width || 16;
        const h = img?.naturalHeight || img?.height || 9;
        texAspects[idx] = w / Math.max(1, h);
        readyCount += 1;
        if (readyCount >= Math.min(2, waypoints.length)) {
          setTexturesReady(true);
        }
      });
      tex.colorSpace = THREE.SRGBColorSpace;
      tex.minFilter = THREE.LinearMipmapLinearFilter;
      tex.magFilter = THREE.LinearFilter;
      tex.anisotropy = maxAniso;
      tex.wrapS = THREE.ClampToEdgeWrapping;
      tex.wrapT = THREE.ClampToEdgeWrapping;
      textures.push(tex);
    });

    const orthoCam = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
    const quadScene = new THREE.Scene();
    const quadGeo = new THREE.PlaneGeometry(2, 2);

    const firstWp = waypoints[0];
    const secondWp = waypoints[Math.min(1, waypoints.length - 1)];

    const uniforms = {
      uTexA: { value: textures[0] },
      uTexB: { value: textures[Math.min(1, textures.length - 1)] },
      uTexAspectA: { value: 16 / 9 },
      uTexAspectB: { value: 16 / 9 },
      uViewAspect: { value: initW / initH },

      uLocalT: { value: 0 },
      uAdvA: { value: 0 },
      uAdvB: { value: 0 },

      uVanishXA: { value: firstWp.vanishingX },
      uHorizonYA: { value: firstWp.horizonY },
      uPortalHalfWA: { value: firstWp.portalHalfW },
      uPortalTopYA: { value: firstWp.portalTopY },
      uPortalBotYA: { value: firstWp.portalBotY },
      uFlankPowerA: { value: firstWp.flankPower },

      uVanishXB: { value: secondWp.vanishingX },
      uHorizonYB: { value: secondWp.horizonY },
      uPortalHalfWB: { value: secondWp.portalHalfW },
      uPortalTopYB: { value: secondWp.portalTopY },
      uPortalBotYB: { value: secondWp.portalBotY },
      uFlankPowerB: { value: secondWp.flankPower },

      uDoorOcclusion: { value: 0 },
      uPortalBias: { value: 0.24 },
      uInteriorWarmth: { value: firstWp.interiorWarmth },
      uLookShift: { value: new THREE.Vector2(0, 0) },
      uGaitBobY: { value: 0 },
      uGaitSwayX: { value: 0 },
      uStepDipA: { value: 0 },
      uStepDipB: { value: 0 },
    };

    const material = new THREE.ShaderMaterial({
      vertexShader: VERTEX_SHADER,
      fragmentShader: FRAGMENT_SHADER,
      uniforms,
      depthTest: false,
      depthWrite: false,
    });

    const mesh = new THREE.Mesh(quadGeo, material);
    quadScene.add(mesh);

    const resizeObs = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const w = Math.max(240, Math.round(entry.contentRect.width));
        const h = Math.max(180, Math.round(entry.contentRect.height));
        uniforms.uViewAspect.value = w / h;
        renderer.setSize(w, h);
      }
    });
    resizeObs.observe(host);

    // Gentle pace & pause keyboard controls
    const onKeyDown = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement | null)?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA") return;
      const k = e.key.toLowerCase();
      if (k === "w" || e.key === "ArrowUp") {
        speedBoostRef.current = 1.3;
      } else if (k === "s" || e.key === "ArrowDown") {
        speedBoostRef.current = 0.55;
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

    let frameId = 0;
    let lastTime = performance.now();
    let elapsedWalkMs = 0;
    let prevDistMeters = 0;
    let distSinceStep = 0.48; // First step triggers naturally after start acceleration
    let doorwayChimePlayed = false;
    let lastUiUpdateMs = 0;
    let currentLookX = 0;
    let currentLookY = 0;

    const totalVirtualMeters =
      waypoints.length >= 4 ? 22 : request.mode === "trail-walk" ? 16 : 18;
    const strideMeters = 0.84; // ~1.18 steps/sec during calm stroll -> slow, unhurried pace
    const isMultiWaypoint = waypoints.length >= 4;

    const tick = () => {
      if (disposed) return;
      const now = performance.now();
      const dtSec = Math.min((now - lastTime) / 1000, 0.05);
      lastTime = now;

      if (!pausedRef.current && !finishedRef.current && readyCount >= 1) {
        elapsedWalkMs += dtSec * 1000 * speedBoostRef.current;
      }

      const rawT = Math.max(0, Math.min(1, elapsedWalkMs / request.durationMs));
      const easedT = evaluateNaturalWalkCurve(rawT);
      const vel = getNaturalWalkVelocity(rawT);

      const { idxA, idxB, localT, wpA, wpB } = interpolateWaypoints(
        waypoints,
        easedT,
      );

      // True depth-projected advancement per waypoint segment
      const isExit = request.mode === "exit-hall";
      const fwdSpan = isMultiWaypoint ? 0.36 : 0.42;
      const backSpan = isMultiWaypoint ? -0.14 : -0.16;

      uniforms.uTexA.value = textures[idxA];
      uniforms.uTexB.value = textures[idxB];
      uniforms.uTexAspectA.value = texAspects[idxA];
      uniforms.uTexAspectB.value = texAspects[idxB];
      uniforms.uLocalT.value = localT;

      if (isExit) {
        // Walking smoothly backward down the axis
        uniforms.uAdvA.value = -localT * (isMultiWaypoint ? 0.11 : 0.14);
        uniforms.uAdvB.value = (1 - localT) * (isMultiWaypoint ? 0.24 : 0.28);
      } else {
        uniforms.uAdvA.value = localT * fwdSpan;
        uniforms.uAdvB.value = (1 - localT) * backSpan;
      }

      uniforms.uVanishXA.value = wpA.vanishingX;
      uniforms.uHorizonYA.value = wpA.horizonY;
      uniforms.uPortalHalfWA.value = wpA.portalHalfW;
      uniforms.uPortalTopYA.value = wpA.portalTopY;
      uniforms.uPortalBotYA.value = wpA.portalBotY;
      uniforms.uFlankPowerA.value = wpA.flankPower;

      uniforms.uVanishXB.value = wpB.vanishingX;
      uniforms.uHorizonYB.value = wpB.horizonY;
      uniforms.uPortalHalfWB.value = wpB.portalHalfW;
      uniforms.uPortalTopYB.value = wpB.portalTopY;
      uniforms.uPortalBotYB.value = wpB.portalBotY;
      uniforms.uFlankPowerB.value = wpB.flankPower;

      uniforms.uDoorOcclusion.value = Math.max(
        wpA.doorOcclusion,
        wpB.doorOcclusion,
      );
      uniforms.uPortalBias.value =
        Math.max(wpA.doorOcclusion, wpB.doorOcclusion) > 0.35 ? 0.34 : 0.16;
      uniforms.uInteriorWarmth.value = THREE.MathUtils.lerp(
        wpA.interiorWarmth,
        wpB.interiorWarmth,
        localT,
      );

      // Gentle pointer-drag look damping
      if (!pointerDragRef.current) {
        lookTargetRef.current.x = THREE.MathUtils.damp(
          lookTargetRef.current.x,
          0,
          3.2,
          dtSec,
        );
        lookTargetRef.current.y = THREE.MathUtils.damp(
          lookTargetRef.current.y,
          0,
          3.2,
          dtSec,
        );
      }
      currentLookX = THREE.MathUtils.damp(
        currentLookX,
        lookTargetRef.current.x,
        7.5,
        dtSec,
      );
      currentLookY = THREE.MathUtils.damp(
        currentLookY,
        lookTargetRef.current.y,
        7.5,
        dtSec,
      );
      uniforms.uLookShift.value.set(currentLookX, currentLookY);

      // Ultra-subtle natural pilgrimage gait locked to actual distance & velocity (zero dizziness)
      const distMeters = easedT * totalVirtualMeters;
      const gaitPhase = distMeters * (Math.PI / strideMeters);
      uniforms.uGaitBobY.value = Math.sin(gaitPhase * 2) * 0.0024 * vel;
      uniforms.uGaitSwayX.value = Math.cos(gaitPhase) * 0.0012 * vel;

      // Subtle stair / threshold step rise cue during outdoor stair ascent
      const stairFactor =
        Math.abs(wpB.stepElevation - wpA.stepElevation) > 0.05
          ? Math.sin(localT * Math.PI) * 0.004 * vel
          : 0;
      uniforms.uStepDipA.value = -stairFactor;
      uniforms.uStepDipB.value = stairFactor * 0.5;

      // Synchronized slow-pilgrimage surface footsteps
      if (
        !pausedRef.current &&
        !finishedRef.current &&
        vel > 0.14 &&
        rawT < 0.93
      ) {
        distSinceStep += Math.abs(distMeters - prevDistMeters);
        if (distSinceStep >= strideMeters) {
          distSinceStep = 0;
          const activeSurface: WalkSurfaceKind =
            localT < 0.5 ? wpA.surface : wpB.surface;
          const paceGain = 0.42 + 0.44 * vel;
          soundManager.playFootstepSurface(activeSurface, 1, paceGain);
        }
      }
      prevDistMeters = distMeters;

      // Continuous outdoor-to-indoor spatial audio progression
      if (!pausedRef.current && !finishedRef.current) {
        soundManager.updateWalkAudioProgression(
          rawT,
          request.mode,
          request.tradition,
        );
      }

      if (!doorwayChimePlayed && rawT >= 0.65) {
        doorwayChimePlayed = true;
        if (request.mode === "enter-hall") {
          soundManager.playSpatialCue("hall-enter");
        } else if (request.mode === "exit-hall") {
          soundManager.playSpatialCue("hall-exit");
        } else {
          soundManager.playSpatialCue("gate-pass");
        }
      }

      if (!midpointFiredRef.current && rawT >= 0.9) {
        midpointFiredRef.current = true;
        onMidpointRef.current?.();
      }

      renderer.render(quadScene, orthoCam);

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
        frameId = window.setTimeout(tick, 45);
      } else {
        frameId = window.requestAnimationFrame(tick);
      }
    };

    if (probe.software) {
      frameId = window.setTimeout(tick, 20);
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
      quadGeo.dispose();
      material.dispose();
      textures.forEach((t) => t.dispose());
      renderer.dispose();
      if (renderer.domElement.parentNode === host) {
        host.removeChild(renderer.domElement);
      }
    };
  }, [request, waypoints]);

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
    lookTargetRef.current.x = THREE.MathUtils.clamp(
      lookTargetRef.current.x - dx * 0.00018,
      -0.026,
      0.026,
    );
    lookTargetRef.current.y = THREE.MathUtils.clamp(
      lookTargetRef.current.y + dy * 0.00014,
      -0.018,
      0.018,
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

  const startPreviewSrc =
    request.mode === "exit-hall"
      ? request.interiorImage
      : request.exteriorImage;

  return (
    <div className="relative h-full w-full select-none overflow-hidden bg-[#120d0b]">
      {/* Underlying seamless keyframe-0 preview until GPU textures upload (<60ms) */}
      {!texturesReady && (
        <img
          src={startPreviewSrc}
          alt=""
          aria-hidden="true"
          referrerPolicy="no-referrer"
          className="pointer-events-none absolute inset-0 h-full w-full object-cover object-center"
        />
      )}

      {/* Real-time GLSL Depth-Parallax & Continuous Portal Viewport */}
      <div
        ref={hostRef}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        className="h-full w-full cursor-grab active:cursor-grabbing touch-none"
      />

      {/* Minimal non-intrusive bottom strip HUD */}
      <div
        className={`absolute inset-x-0 bottom-0 z-30 border-t px-3.5 py-2.5 ${barBg}`}
      >
        {/* Continuous 7-stage thin progress track */}
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
                {stageMeta.stage}/7 · {stageMeta.title}
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
