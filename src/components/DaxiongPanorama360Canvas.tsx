import { RotateCcw } from "lucide-react";
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
} from "react";
import * as THREE from "three";
import {
  buildEquirectangularTestTextureCanvas,
  type DaxiongRealStation,
  type RealSpaceHotspotAction,
} from "@/data/daxiongRealSpace";

type ProjectedHotspot = {
  id: string;
  label: string;
  x: number;
  y: number;
  visible: boolean;
  action: RealSpaceHotspotAction;
};

function detectWebGLAvailable(): boolean {
  if (typeof document === "undefined") return false;
  try {
    const c = document.createElement("canvas");
    const gl = c.getContext("webgl2") || c.getContext("webgl");
    if (!gl) return false;
    const ext = gl.getExtension("WEBGL_lose_context");
    ext?.loseContext();
    return true;
  } catch {
    return false;
  }
}

/**
 * 轻量级 Three.js 360° 等距柱状投影（Equirectangular 2:1）全景浏览组件：
 * - 仅用于真实的 2:1 全景素材或明确标注的 2:1 标定测试图，绝不将普通 16:9 照片拉伸伪装成全景。
 * - 支持桌面鼠标拖动与移动端单指触摸拖动，带自然阻尼与合理的俯仰角限制。
 * - 将球面空间热点（yaw/pitch）实时投影到视口坐标，跟随环顾转动。
 */
export function DaxiongPanorama360Canvas({
  station,
  overrideSrc,
  onTriggerAction,
}: {
  station: DaxiongRealStation;
  overrideSrc?: string | null;
  onTriggerAction: (action: RealSpaceHotspotAction) => void;
}) {
  const hostRef = useRef<HTMLDivElement | null>(null);
  const [webglOk, setWebglOk] = useState(true);
  const [projectedHotspots, setProjectedHotspots] = useState<
    ProjectedHotspot[]
  >([]);
  const [bearingDeg, setBearingDeg] = useState(station.panorama360.initialYawDeg);
  const [loadError, setLoadError] = useState<string | null>(null);

  const yawRef = useRef(station.panorama360.initialYawDeg);
  const pitchRef = useRef(station.panorama360.initialPitchDeg);
  const targetYawRef = useRef(station.panorama360.initialYawDeg);
  const targetPitchRef = useRef(station.panorama360.initialPitchDeg);
  const dragRef = useRef<{
    pointerId: number;
    x: number;
    y: number;
    moved: boolean;
  } | null>(null);

  const activeSrc = overrideSrc || station.panorama360.equirectangularSrc;
  const isShowingTestPlaceholder = !activeSrc;

  useEffect(() => {
    yawRef.current = station.panorama360.initialYawDeg;
    pitchRef.current = station.panorama360.initialPitchDeg;
    targetYawRef.current = station.panorama360.initialYawDeg;
    targetPitchRef.current = station.panorama360.initialPitchDeg;
    setBearingDeg(station.panorama360.initialYawDeg);
  }, [station]);

  const resetView = useCallback(() => {
    targetYawRef.current = station.panorama360.initialYawDeg;
    targetPitchRef.current = station.panorama360.initialPitchDeg;
  }, [station]);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;
    if (!detectWebGLAvailable()) {
      setWebglOk(false);
      return;
    }

    setLoadError(null);
    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({
        antialias: true,
        powerPreference: "high-performance",
      });
    } catch {
      setWebglOk(false);
      return;
    }

    const rect = host.getBoundingClientRect();
    const initW = Math.max(300, rect.width || 640);
    const initH = Math.max(220, rect.height || 360);

    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setSize(initW, initH);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.domElement.style.display = "block";
    renderer.domElement.style.width = "100%";
    renderer.domElement.style.height = "100%";
    host.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(68, initW / initH, 0.1, 1100);
    camera.position.set(0, 0, 0);

    // Inverted sphere for equirectangular interior view; center (u=0.5) aligned to yaw=0° (-Z)
    const sphereGeo = new THREE.SphereGeometry(500, 60, 40);
    sphereGeo.scale(-1, 1, 1);

    let activeTexture: THREE.Texture;
    if (activeSrc) {
      const loader = new THREE.TextureLoader();
      activeTexture = loader.load(
        activeSrc,
        (tex) => {
          const img = tex.image as
            | { naturalWidth?: number; naturalHeight?: number }
            | undefined;
          const aspect =
            img && img.naturalWidth && img.naturalHeight
              ? img.naturalWidth / img.naturalHeight
              : 2;
          if (aspect < 1.85) {
            setLoadError(
              "所选图片宽高比非 2:1 等距柱状全景格式，已保留标定提示避免拉伸失真。",
            );
          }
        },
        undefined,
        () => {
          setLoadError("全景素材加载失败，已回退至安全显示。");
        },
      );
    } else {
      const testCanvas = buildEquirectangularTestTextureCanvas(station);
      activeTexture = testCanvas
        ? new THREE.CanvasTexture(testCanvas)
        : new THREE.Texture();
    }

    activeTexture.colorSpace = THREE.SRGBColorSpace;
    activeTexture.minFilter = THREE.LinearFilter;
    activeTexture.magFilter = THREE.LinearFilter;

    const material = new THREE.MeshBasicMaterial({ map: activeTexture });
    const mesh = new THREE.Mesh(sphereGeo, material);
    // Align u=0.5 directly ahead at yaw=0° (looking down -Z)
    mesh.rotation.y = Math.PI / 2;
    scene.add(mesh);

    const sizeRef = { w: initW, h: initH };
    const resizeObs = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const w = Math.max(240, Math.round(entry.contentRect.width));
        const h = Math.max(180, Math.round(entry.contentRect.height));
        sizeRef.w = w;
        sizeRef.h = h;
        camera.aspect = w / h;
        camera.updateProjectionMatrix();
        renderer.setSize(w, h);
      }
    });
    resizeObs.observe(host);

    let disposed = false;
    let frameId = 0;
    let lastTime = performance.now();
    let lastUiSync = 0;
    const lookTarget = new THREE.Vector3();
    const tmpVec = new THREE.Vector3();

    const tick = () => {
      if (disposed) return;
      const now = performance.now();
      const dt = Math.min((now - lastTime) / 1000, 0.05);
      lastTime = now;

      yawRef.current = THREE.MathUtils.damp(
        yawRef.current,
        targetYawRef.current,
        10,
        dt,
      );
      pitchRef.current = THREE.MathUtils.damp(
        pitchRef.current,
        targetPitchRef.current,
        10,
        dt,
      );

      const phi = THREE.MathUtils.degToRad(90 - pitchRef.current);
      const theta = THREE.MathUtils.degToRad(yawRef.current - 90);

      lookTarget.x = 400 * Math.sin(phi) * Math.cos(theta);
      lookTarget.y = 400 * Math.cos(phi);
      lookTarget.z = 400 * Math.sin(phi) * Math.sin(theta);
      camera.lookAt(lookTarget);

      renderer.render(scene, camera);

      if (now - lastUiSync > 32) {
        lastUiSync = now;
        const normalizedYaw = Math.round(
          ((yawRef.current % 360) + 540) % 360 - 180,
        );
        setBearingDeg(normalizedYaw);

        const nextProjected = station.panorama360.sphericalHotspots.map((hs) => {
          const hsPhi = THREE.MathUtils.degToRad(90 - hs.pitchDeg);
          const hsTheta = THREE.MathUtils.degToRad(hs.yawDeg - 90);
          tmpVec.set(
            300 * Math.sin(hsPhi) * Math.cos(hsTheta),
            300 * Math.cos(hsPhi),
            300 * Math.sin(hsPhi) * Math.sin(hsTheta),
          );
          const toPoint = tmpVec.clone().normalize();
          const camDir = new THREE.Vector3();
          camera.getWorldDirection(camDir);
          const inFront = toPoint.dot(camDir) > 0.25;

          tmpVec.project(camera);
          const x = (tmpVec.x * 0.5 + 0.5) * sizeRef.w;
          const y = (-tmpVec.y * 0.5 + 0.5) * sizeRef.h;
          const inBounds =
            inFront &&
            x >= 28 &&
            x <= sizeRef.w - 28 &&
            y >= 48 &&
            y <= sizeRef.h - 48;

          return {
            id: hs.id,
            label: hs.label,
            x,
            y,
            visible: inBounds,
            action: hs.action,
          };
        });
        setProjectedHotspots(nextProjected);
      }

      frameId = window.requestAnimationFrame(tick);
    };

    frameId = window.requestAnimationFrame(tick);

    return () => {
      disposed = true;
      window.cancelAnimationFrame(frameId);
      resizeObs.disconnect();
      sphereGeo.dispose();
      material.dispose();
      activeTexture.dispose();
      renderer.dispose();
      if (renderer.domElement.parentNode === host) {
        host.removeChild(renderer.domElement);
      }
    };
  }, [activeSrc, station]);

  const handlePointerDown = (e: ReactPointerEvent<HTMLDivElement>) => {
    (e.currentTarget as HTMLElement).setPointerCapture?.(e.pointerId);
    dragRef.current = {
      pointerId: e.pointerId,
      x: e.clientX,
      y: e.clientY,
      moved: false,
    };
  };

  const handlePointerMove = (e: ReactPointerEvent<HTMLDivElement>) => {
    const drag = dragRef.current;
    if (!drag || drag.pointerId !== e.pointerId) return;
    const dx = e.clientX - drag.x;
    const dy = e.clientY - drag.y;
    if (Math.abs(dx) > 2 || Math.abs(dy) > 2) {
      drag.moved = true;
    }
    drag.x = e.clientX;
    drag.y = e.clientY;

    targetYawRef.current -= dx * 0.22;
    targetPitchRef.current = Math.max(
      station.panorama360.minPitchDeg,
      Math.min(station.panorama360.maxPitchDeg, targetPitchRef.current + dy * 0.18),
    );
  };

  const handlePointerUp = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (dragRef.current?.pointerId === e.pointerId) {
      dragRef.current = null;
    }
  };

  if (!webglOk) {
    return (
      <div className="flex h-full w-full flex-col items-center justify-center bg-[#1e1512] p-6 text-center text-xs text-[#f5ece0]">
        <p className="font-semibold">当前设备浏览器暂不支持 WebGL 360° 球面渲染</p>
        <p className="mt-1 text-[#d4c4b0]">
          已为您保留「16:9 实景机位 + 热点导航」模式正常游览大雄宝殿。
        </p>
      </div>
    );
  }

  return (
    <div className="relative h-full w-full overflow-hidden bg-[#16100e] select-none">
      <div
        ref={hostRef}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        onDoubleClick={resetView}
        className="h-full w-full cursor-grab active:cursor-grabbing touch-none"
      />

      {/* 3D Spherical Projected Hotspots */}
      <div className="pointer-events-none absolute inset-0 z-20">
        {projectedHotspots.map((hs) =>
          hs.visible ? (
            <button
              key={hs.id}
              type="button"
              onClick={() => onTriggerAction(hs.action)}
              style={{
                left: `${hs.x}px`,
                top: `${hs.y}px`,
                transform: "translate(-50%, -50%)",
              }}
              className="pointer-events-auto absolute inline-flex min-h-[40px] items-center gap-2 rounded-full border border-[#e5c17c]/75 bg-[#1b120e]/85 px-3.5 py-1.5 text-xs font-medium text-[#fff8eb] shadow-md backdrop-blur-xs transition-transform hover:scale-105 cursor-pointer"
            >
              <span className="h-2 w-2 rounded-full bg-[#e5c17c]" />
              <span className="whitespace-nowrap">{hs.label}</span>
            </button>
          ) : null,
        )}
      </div>

      {/* Explicit Placeholder / Error Notice */}
      <div className="pointer-events-none absolute inset-x-3 bottom-3 z-20 flex flex-wrap items-center justify-between gap-2">
        <div className="rounded-lg border border-[#e5c17c]/40 bg-[#18100d]/85 px-3 py-1.5 text-[11px] text-[#f5ece0] backdrop-blur-xs">
          <span>
            {isShowingTestPlaceholder
              ? "360° 全景测试占位模式（拖动环顾方位 · 双击回正）"
              : "已加载 2:1 实景全景（拖动环顾环境 · 双击回正）"}
          </span>
          <span className="ml-2 text-[#e5c17c] tabular-nums">
            方位 {bearingDeg > 0 ? `+${bearingDeg}` : bearingDeg}°
          </span>
          {loadError && (
            <span className="ml-2 text-[#f4b393]">· {loadError}</span>
          )}
        </div>

        <button
          type="button"
          onClick={resetView}
          className="pointer-events-auto inline-flex min-h-[34px] items-center gap-1 rounded-lg border border-[#e5c17c]/45 bg-[#18100d]/88 px-2.5 text-[11px] font-medium text-[#f5ece0] hover:bg-[#2a1d17] cursor-pointer"
        >
          <RotateCcw size={12} />
          <span>视角回正</span>
        </button>
      </div>
    </div>
  );
}
