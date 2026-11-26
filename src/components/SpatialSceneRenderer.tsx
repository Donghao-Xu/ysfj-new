import { SparkRenderer, type SplatMesh } from "@sparkjsdev/spark";
import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
} from "react";
import * as THREE from "three";
import {
  loadSpatialSplatAsset,
  probeSpatialWebCapabilities,
  type WebGLCapabilityReport,
} from "@/spatial/spatialAssetLoader";
import { SpatialCameraController } from "@/spatial/spatialCameraController";
import {
  createSpatialInteractionLayer,
  type SpatialInteractionLayerHandle,
} from "@/spatial/spatialInteractionLayer";
import {
  createPoseFromSpec,
  interpolatePose,
  stepSpatialNavigation,
  type SpatialCameraPose,
  type SpatialMovementInput,
} from "@/spatial/spatialNavigation";
import type {
  SpatialInteractiveAnchor,
  SpatialPathNode,
  SpatialSceneSpec,
} from "@/spatial/spatialSceneConfig";

export type SpatialRenderMetrics = {
  fps: number;
  splatCount: number;
  loadTimeMs: number;
  pose: SpatialCameraPose;
  boundaryNotice: string | null;
  contextLost: boolean;
  capabilities: WebGLCapabilityReport;
};

export type SpatialRendererStatus =
  | { state: "loading"; progressPct: number | null; message: string }
  | { state: "ready" }
  | { state: "error"; message: string };

export type SpatialSceneRendererHandle = {
  setVirtualMovement: (next: Partial<SpatialMovementInput>) => void;
  resetToInitialPose: () => void;
  travelToPathNode: (node: SpatialPathNode) => void;
  requestPointerLock: () => void;
  exitPointerLock: () => void;
};

type Props = {
  sceneSpec: SpatialSceneSpec;
  customFileBytes?: Uint8Array | null;
  customFileName?: string;
  reloadToken: number;
  paused: boolean;
  speedMetersPerSec: number;
  showInteractionAnchors: boolean;
  onStatusChange: (status: SpatialRendererStatus) => void;
  onMetricsUpdate: (metrics: SpatialRenderMetrics) => void;
  onPointerLockChange: (locked: boolean) => void;
  onTogglePause: () => void;
  onSelectAnchor: (anchor: SpatialInteractiveAnchor | null) => void;
};

const _euler = new THREE.Euler(0, 0, 0, "YXZ");

export const SpatialSceneRenderer = forwardRef<SpatialSceneRendererHandle, Props>(
  function SpatialSceneRenderer(
    {
      sceneSpec,
      customFileBytes,
      customFileName,
      reloadToken,
      paused,
      speedMetersPerSec,
      showInteractionAnchors,
      onStatusChange,
      onMetricsUpdate,
      onPointerLockChange,
      onTogglePause,
      onSelectAnchor,
    },
    ref,
  ) {
    const mountRef = useRef<HTMLDivElement | null>(null);
    const controllerRef = useRef<SpatialCameraController | null>(null);
    const interactionRef = useRef<SpatialInteractionLayerHandle | null>(null);
    const sceneThreeRef = useRef<THREE.Scene | null>(null);
    const activeSplatRef = useRef<SplatMesh | null>(null);
    const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
    const poseRef = useRef<SpatialCameraPose>(
      createPoseFromSpec(sceneSpec.navigation.initialPose),
    );
    const travelRef = useRef<{
      from: SpatialCameraPose;
      to: SpatialPathNode;
      elapsed: number;
      duration: number;
    } | null>(null);

    const specRef = useRef(sceneSpec);
    const pausedRef = useRef(paused);
    const speedRef = useRef(speedMetersPerSec);
    const showAnchorsRef = useRef(showInteractionAnchors);
    const splatCountRef = useRef(0);
    const loadTimeRef = useRef(0);
    const boundaryNoticeRef = useRef<string | null>(null);
    const contextLostRef = useRef(false);
    const capabilitiesRef = useRef<WebGLCapabilityReport>(
      probeSpatialWebCapabilities(),
    );

    const callbacksRef = useRef({
      onStatusChange,
      onMetricsUpdate,
      onPointerLockChange,
      onTogglePause,
      onSelectAnchor,
    });
    callbacksRef.current = {
      onStatusChange,
      onMetricsUpdate,
      onPointerLockChange,
      onTogglePause,
      onSelectAnchor,
    };

    specRef.current = sceneSpec;
    pausedRef.current = paused;
    speedRef.current = speedMetersPerSec;
    showAnchorsRef.current = showInteractionAnchors;

    useImperativeHandle(
      ref,
      () => ({
        setVirtualMovement: (next) => {
          if (
            (next.forward && Math.abs(next.forward) > 0) ||
            (next.right && Math.abs(next.right) > 0) ||
            (next.up && Math.abs(next.up) > 0)
          ) {
            travelRef.current = null;
          }
          controllerRef.current?.setVirtualMovement(next);
        },
        resetToInitialPose: () => {
          travelRef.current = null;
          poseRef.current = createPoseFromSpec(
            specRef.current.navigation.initialPose,
          );
          boundaryNoticeRef.current = null;
        },
        travelToPathNode: (node) => {
          const from = { ...poseRef.current };
          const dist = Math.hypot(
            node.position[0] - from.x,
            node.position[1] - from.y,
            node.position[2] - from.z,
          );
          travelRef.current = {
            from,
            to: node,
            elapsed: 0,
            duration: Math.max(0.65, Math.min(2.8, dist * 0.75 + 0.45)),
          };
          boundaryNoticeRef.current = null;
        },
        requestPointerLock: () => {
          controllerRef.current?.requestPointerLock();
        },
        exitPointerLock: () => {
          controllerRef.current?.exitPointerLock();
        },
      }),
      [],
    );

    // Initialize isolated WebGL2 + SparkRenderer once per mount
    useEffect(() => {
      const mount = mountRef.current;
      if (!mount) return;

      const caps = probeSpatialWebCapabilities();
      capabilitiesRef.current = caps;

      if (!caps.webgl2Supported) {
        callbacksRef.current.onStatusChange({
          state: "error",
          message:
            "当前浏览器或设备不支持 WebGL2，无法运行 3D Gaussian Splatting 真实空间渲染。",
        });
        callbacksRef.current.onMetricsUpdate({
          fps: 0,
          splatCount: 0,
          loadTimeMs: 0,
          pose: poseRef.current,
          boundaryNotice: null,
          contextLost: false,
          capabilities: caps,
        });
        return;
      }

      const rect = mount.getBoundingClientRect();
      const initW = Math.max(320, Math.round(rect.width || 960));
      const initH = Math.max(240, Math.round(rect.height || 540));

      // Per SparkRenderer best practice: antialias: false improves splat performance
      let renderer: THREE.WebGLRenderer;
      try {
        renderer = new THREE.WebGLRenderer({
          antialias: false,
          powerPreference: "high-performance",
          alpha: false,
        });
      } catch {
        callbacksRef.current.onStatusChange({
          state: "error",
          message: "WebGL2 渲染上下文创建失败，请检查硬件加速设置或刷新重试。",
        });
        return;
      }

      renderer.setPixelRatio(
        caps.isSoftwareGl ? 1 : Math.min(window.devicePixelRatio || 1, 2),
      );
      renderer.setSize(initW, initH);
      renderer.outputColorSpace = THREE.SRGBColorSpace;
      renderer.setClearColor(0x14110f, 1);
      renderer.domElement.style.display = "block";
      renderer.domElement.style.width = "100%";
      renderer.domElement.style.height = "100%";
      mount.appendChild(renderer.domElement);

      const threeScene = new THREE.Scene();
      threeScene.background = new THREE.Color(0x14110f);
      sceneThreeRef.current = threeScene;

      const camera = new THREE.PerspectiveCamera(65, initW / initH, 0.05, 400);
      cameraRef.current = camera;

      const spark = new SparkRenderer({
        renderer,
        sortRadial: true,
        minSortIntervalMs: caps.isSoftwareGl ? 40 : 0,
      });
      threeScene.add(spark);

      const controller = new SpatialCameraController({
        canvas: renderer.domElement,
        getPose: () => poseRef.current,
        isPaused: () => pausedRef.current,
        callbacks: {
          onPoseLookChange: (yawDeg, pitchDeg) => {
            travelRef.current = null;
            poseRef.current = { ...poseRef.current, yawDeg, pitchDeg };
          },
          onPointerLockChange: (locked) => {
            callbacksRef.current.onPointerLockChange(locked);
          },
          onTogglePause: () => {
            callbacksRef.current.onTogglePause();
          },
          onResetPose: () => {
            travelRef.current = null;
            poseRef.current = createPoseFromSpec(
              specRef.current.navigation.initialPose,
            );
            boundaryNoticeRef.current = null;
          },
          onInspectAnchorAtNdc: (ndcX, ndcY) => {
            const hit =
              interactionRef.current?.raycastAnchorAtNdc(ndcX, ndcY, camera) ??
              null;
            interactionRef.current?.highlightAnchor(hit?.id ?? null);
            callbacksRef.current.onSelectAnchor(hit);
          },
        },
      });
      controllerRef.current = controller;

      const onContextLost = (e: Event) => {
        e.preventDefault();
        contextLostRef.current = true;
      };
      const onContextRestored = () => {
        contextLostRef.current = false;
      };
      renderer.domElement.addEventListener("webglcontextlost", onContextLost);
      renderer.domElement.addEventListener(
        "webglcontextrestored",
        onContextRestored,
      );

      const resizeObs = new ResizeObserver((entries) => {
        for (const entry of entries) {
          const w = Math.max(240, Math.round(entry.contentRect.width));
          const h = Math.max(180, Math.round(entry.contentRect.height));
          camera.aspect = w / h;
          camera.updateProjectionMatrix();
          renderer.setSize(w, h);
        }
      });
      resizeObs.observe(mount);

      let disposed = false;
      let frameId = 0;
      let lastTimeMs = performance.now();
      let fpsAccumTime = 0;
      let fpsFrameCount = 0;
      let measuredFps = 0;
      let lastMetricsEmitMs = 0;

      const afterDraw = (cb: () => void) => {
        const gl = renderer.getContext() as WebGL2RenderingContext;
        const sync = gl.fenceSync?.(gl.SYNC_GPU_COMMANDS_COMPLETE, 0);
        gl.flush();
        if (!sync) {
          frameId = window.setTimeout(cb, 75);
          return;
        }
        const poll = () => {
          if (disposed) {
            gl.deleteSync(sync);
            return;
          }
          const state = gl.getSyncParameter(sync, gl.SYNC_STATUS);
          if (state === gl.UNSIGNALED) {
            frameId = window.setTimeout(poll, 6);
          } else {
            gl.deleteSync(sync);
            frameId = window.setTimeout(cb, 70);
          }
        };
        frameId = window.setTimeout(poll, 6);
      };

      const tick = () => {
        if (disposed) return;
        const now = performance.now();
        const dtSec = Math.min((now - lastTimeMs) / 1000, 0.1);
        lastTimeMs = now;

        fpsAccumTime += dtSec;
        fpsFrameCount += 1;
        if (fpsAccumTime >= 0.5) {
          measuredFps = Math.round(fpsFrameCount / fpsAccumTime);
          fpsAccumTime = 0;
          fpsFrameCount = 0;
        }

        const spec = specRef.current;

        // Smooth guided path-node travel OR direct free movement via SpatialNavigation
        if (!pausedRef.current && travelRef.current) {
          const input = controller.getMovementInput();
          if (
            Math.abs(input.forward) > 0.05 ||
            Math.abs(input.right) > 0.05
          ) {
            travelRef.current = null;
          } else {
            travelRef.current.elapsed += dtSec;
            const alpha =
              travelRef.current.elapsed / travelRef.current.duration;
            poseRef.current = interpolatePose(
              travelRef.current.from,
              travelRef.current.to,
              alpha,
            );
            if (alpha >= 1) {
              travelRef.current = null;
            }
          }
        }

        if (!pausedRef.current && !travelRef.current) {
          const input = controller.getMovementInput();
          const stepResult = stepSpatialNavigation({
            current: poseRef.current,
            input,
            dtSec,
            speedMetersPerSec: speedRef.current,
            bounds: spec.navigation.walkableBounds,
            restrictedZones: spec.navigation.restrictedZones,
          });
          poseRef.current = stepResult.pose;
          if (stepResult.blockedByZoneLabel) {
            boundaryNoticeRef.current = `已抵达限制区边界：${stepResult.blockedByZoneLabel}`;
          } else if (stepResult.clampedByBounds) {
            boundaryNoticeRef.current = "已抵达当前测试空间边界";
          } else if (stepResult.moved) {
            boundaryNoticeRef.current = null;
          }
        }

        const p = poseRef.current;
        camera.position.set(p.x, p.y, p.z);
        _euler.set(
          THREE.MathUtils.degToRad(p.pitchDeg),
          THREE.MathUtils.degToRad(p.yawDeg),
          0,
          "YXZ",
        );
        camera.quaternion.setFromEuler(_euler);

        if (!contextLostRef.current) {
          renderer.render(threeScene, camera);
        }

        if (now - lastMetricsEmitMs > 180) {
          lastMetricsEmitMs = now;
          callbacksRef.current.onMetricsUpdate({
            fps: measuredFps,
            splatCount: splatCountRef.current,
            loadTimeMs: loadTimeRef.current,
            pose: { ...p },
            boundaryNotice: boundaryNoticeRef.current,
            contextLost: contextLostRef.current,
            capabilities: caps,
          });
        }

        if (caps.isSoftwareGl) {
          afterDraw(tick);
        } else {
          frameId = window.requestAnimationFrame(tick);
        }
      };

      if (caps.isSoftwareGl) {
        frameId = window.setTimeout(tick, 16);
      } else {
        frameId = window.requestAnimationFrame(tick);
      }

      return () => {
        disposed = true;
        window.cancelAnimationFrame(frameId);
        window.clearTimeout(frameId);
        resizeObs.disconnect();

        renderer.domElement.removeEventListener(
          "webglcontextlost",
          onContextLost,
        );
        renderer.domElement.removeEventListener(
          "webglcontextrestored",
          onContextRestored,
        );

        controller.dispose();
        controllerRef.current = null;

        if (activeSplatRef.current) {
          threeScene.remove(activeSplatRef.current);
          activeSplatRef.current.dispose();
          activeSplatRef.current = null;
        }
        if (interactionRef.current) {
          threeScene.remove(interactionRef.current.group);
          interactionRef.current.dispose();
          interactionRef.current = null;
        }

        threeScene.remove(spark);
        spark.dispose();
        renderer.dispose();

        if (renderer.domElement.parentNode === mount) {
          mount.removeChild(renderer.domElement);
        }
        sceneThreeRef.current = null;
        cameraRef.current = null;
      };
    }, []);

    // Load 3DGS SplatMesh + rebuild decoupled interaction layer whenever sceneSpec or reloadToken changes
    useEffect(() => {
      const threeScene = sceneThreeRef.current;
      if (!threeScene || !capabilitiesRef.current.webgl2Supported) return;

      const abortController = new AbortController();

      // Dispose previous splat & interaction anchors cleanly before loading next
      if (activeSplatRef.current) {
        threeScene.remove(activeSplatRef.current);
        activeSplatRef.current.dispose();
        activeSplatRef.current = null;
      }
      if (interactionRef.current) {
        threeScene.remove(interactionRef.current.group);
        interactionRef.current.dispose();
        interactionRef.current = null;
      }

      splatCountRef.current = 0;
      loadTimeRef.current = 0;
      travelRef.current = null;
      boundaryNoticeRef.current = null;
      poseRef.current = createPoseFromSpec(sceneSpec.navigation.initialPose);

      const interactionLayer = createSpatialInteractionLayer(
        sceneSpec.interactiveAnchors,
      );
      interactionLayer.setVisible(showAnchorsRef.current);
      threeScene.add(interactionLayer.group);
      interactionRef.current = interactionLayer;

      callbacksRef.current.onSelectAnchor(null);
      callbacksRef.current.onStatusChange({
        state: "loading",
        progressPct: 0,
        message: `正在加载 3DGS 场景「${sceneSpec.title}」…`,
      });

      void loadSpatialSplatAsset({
        sceneSpec,
        customFileBytes,
        customFileName,
        signal: abortController.signal,
        onProgress: (pct, message) => {
          if (abortController.signal.aborted) return;
          callbacksRef.current.onStatusChange({
            state: "loading",
            progressPct: pct,
            message,
          });
        },
      })
        .then((result) => {
          if (abortController.signal.aborted) {
            result.mesh.dispose();
            return;
          }
          activeSplatRef.current = result.mesh;
          splatCountRef.current = result.splatCount;
          loadTimeRef.current = result.loadTimeMs;
          threeScene.add(result.mesh);
          callbacksRef.current.onStatusChange({ state: "ready" });
        })
        .catch((err) => {
          if (abortController.signal.aborted) return;
          const msg =
            err instanceof Error
              ? err.message
              : "3DGS 场景加载失败，请检查网络连接或资产格式。";
          callbacksRef.current.onStatusChange({
            state: "error",
            message: msg,
          });
        });

      return () => {
        abortController.abort();
      };
    }, [sceneSpec, customFileBytes, customFileName, reloadToken]);

    // Sync interaction anchors layer visibility independently without reloading splats
    useEffect(() => {
      interactionRef.current?.setVisible(showInteractionAnchors);
    }, [showInteractionAnchors]);

    return (
      <div
        ref={mountRef}
        className="h-full w-full touch-none select-none cursor-grab active:cursor-grabbing"
      />
    );
  },
);
