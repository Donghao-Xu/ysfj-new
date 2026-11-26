import {
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  ArrowUp,
  Compass,
  FolderOpen,
  Lock,
  Maximize2,
  Minimize2,
  Pause,
  Play,
  RotateCcw,
  Sparkles,
  Unlock,
} from "lucide-react";
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type ChangeEvent,
  type FormEvent,
} from "react";
import { useNavigate } from "react-router-dom";
import {
  SpatialSceneRenderer,
  type SpatialRenderMetrics,
  type SpatialRendererStatus,
  type SpatialSceneRendererHandle,
} from "@/components/SpatialSceneRenderer";
import { probeSpatialWebCapabilities } from "@/spatial/spatialAssetLoader";
import {
  SPATIAL_LAB_SCENES,
  createCustomSpatialSceneSpec,
  type SpatialInteractiveAnchor,
  type SpatialSceneSpec,
} from "@/spatial/spatialSceneConfig";

const SPEED_OPTIONS = [
  { id: "slow", label: "缓步 0.6m/s", value: 0.6 },
  { id: "normal", label: "常步 1.4m/s", value: 1.4 },
  { id: "fast", label: "快步 2.6m/s", value: 2.6 },
] as const;

export function SpatialWalkLabPage() {
  const navigate = useNavigate();
  const stageWrapperRef = useRef<HTMLDivElement | null>(null);
  const rendererRef = useRef<SpatialSceneRendererHandle | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [activeSpec, setActiveSpec] = useState<SpatialSceneSpec>(
    SPATIAL_LAB_SCENES[0],
  );
  const [customFileBytes, setCustomFileBytes] = useState<Uint8Array | null>(
    null,
  );
  const [customFileName, setCustomFileName] = useState<string>("");
  const [customUrlInput, setCustomUrlInput] = useState<string>("");
  const [reloadToken, setReloadToken] = useState(0);

  const [status, setStatus] = useState<SpatialRendererStatus>({
    state: "loading",
    progressPct: 0,
    message: "正在初始化 3D Gaussian Splatting 空间渲染器…",
  });
  const [metrics, setMetrics] = useState<SpatialRenderMetrics>(() => ({
    fps: 0,
    splatCount: 0,
    loadTimeMs: 0,
    pose: {
      x: SPATIAL_LAB_SCENES[0].navigation.initialPose.position[0],
      y: SPATIAL_LAB_SCENES[0].navigation.initialPose.position[1],
      z: SPATIAL_LAB_SCENES[0].navigation.initialPose.position[2],
      yawDeg: SPATIAL_LAB_SCENES[0].navigation.initialPose.yawDeg,
      pitchDeg: SPATIAL_LAB_SCENES[0].navigation.initialPose.pitchDeg,
    },
    boundaryNotice: null,
    contextLost: false,
    capabilities: probeSpatialWebCapabilities(),
  }));

  const [paused, setPaused] = useState(false);
  const [speedValue, setSpeedValue] = useState<number>(1.4);
  const [pointerLocked, setPointerLocked] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showAnchors, setShowAnchors] = useState(false);
  const [selectedAnchor, setSelectedAnchor] =
    useState<SpatialInteractiveAnchor | null>(null);

  useEffect(() => {
    const onFsChange = () => {
      setIsFullscreen(Boolean(document.fullscreenElement));
    };
    document.addEventListener("fullscreenchange", onFsChange);
    return () => document.removeEventListener("fullscreenchange", onFsChange);
  }, []);

  const selectPresetScene = (spec: SpatialSceneSpec) => {
    setCustomFileBytes(null);
    setCustomFileName("");
    setPaused(false);
    setSpeedValue(spec.navigation.defaultSpeed);
    setActiveSpec(spec);
    setReloadToken((n) => n + 1);
  };

  const handleFileImport = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const buffer = await file.arrayBuffer();
    const bytes = new Uint8Array(buffer);
    const customSpec = createCustomSpatialSceneSpec({
      title: file.name,
      url: file.name,
      fileName: file.name,
      sizeBytes: file.size,
    });
    setCustomFileBytes(bytes);
    setCustomFileName(file.name);
    setPaused(false);
    setSpeedValue(customSpec.navigation.defaultSpeed);
    setActiveSpec(customSpec);
    setReloadToken((n) => n + 1);
    e.target.value = "";
  };

  const handleLoadCustomUrl = (e: FormEvent) => {
    e.preventDefault();
    const trimmed = customUrlInput.trim();
    if (!trimmed) return;
    const customSpec = createCustomSpatialSceneSpec({
      title: "远程 3DGS 场景",
      url: trimmed,
    });
    setCustomFileBytes(null);
    setCustomFileName("");
    setPaused(false);
    setSpeedValue(customSpec.navigation.defaultSpeed);
    setActiveSpec(customSpec);
    setReloadToken((n) => n + 1);
  };

  const toggleFullscreen = useCallback(async () => {
    const el = stageWrapperRef.current;
    if (!el) return;
    try {
      if (document.fullscreenElement) {
        await document.exitFullscreen();
      } else {
        await el.requestFullscreen();
      }
    } catch {
      // Ignore fullscreen denial in restricted iframe contexts
    }
  }, []);

  const bindHoldMove = (patch: {
    forward?: number;
    right?: number;
    up?: number;
  }) => ({
    onPointerDown: () => rendererRef.current?.setVirtualMovement(patch),
    onPointerUp: () =>
      rendererRef.current?.setVirtualMovement({ forward: 0, right: 0, up: 0 }),
    onPointerLeave: () =>
      rendererRef.current?.setVirtualMovement({ forward: 0, right: 0, up: 0 }),
    onPointerCancel: () =>
      rendererRef.current?.setVirtualMovement({ forward: 0, right: 0, up: 0 }),
  });

  return (
    <div className="min-h-screen bg-[#f5efe6] text-[#241c18] dark:bg-[#14110f] dark:text-[#efe7da]">
      {/* Minimal Top Header */}
      <header className="border-b border-[#dfd4c4] bg-[#fbf8f3] px-4 py-3 sm:px-6 dark:border-[#2e2621] dark:bg-[#191412]">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => navigate("/worlds/buddhist")}
              className="inline-flex min-h-[40px] items-center gap-1.5 rounded-lg border border-[#d8cbb8] bg-white px-3 text-xs font-semibold text-[#3c2d25] hover:bg-[#f2ebe0] whitespace-nowrap shrink-0 cursor-pointer dark:border-[#3a2f28] dark:bg-[#221c18] dark:text-[#e6dac8] dark:hover:bg-[#2c241f]"
            >
              <ArrowLeft size={14} />
              <span>返回云上梵境</span>
            </button>
            <div>
              <h1 className="font-serif-display text-base font-bold sm:text-lg">
                云上梵境 · 真实空间漫游实验室（SpatialWalkLab）
              </h1>
              <p className="text-xs text-[#6f5e50] dark:text-[#a89989]">
                V3.0 技术验证原型 · Three.js + @sparkjsdev/spark 3D Gaussian
                Splatting
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 text-xs text-[#6f5e50] tabular-nums dark:text-[#b2a18f]">
            <span>
              WebGL2：{metrics.capabilities.webgl2Supported ? "支持" : "不支持"}
            </span>
            <span aria-hidden="true">·</span>
            <span>
              WebGPU：{metrics.capabilities.webgpuSupported ? "可用" : "未启用"}
            </span>
            <span aria-hidden="true">·</span>
            <span>FPS：{metrics.fps || "--"}</span>
            {metrics.splatCount > 0 && (
              <>
                <span aria-hidden="true">·</span>
                <span>
                  点云：{metrics.splatCount.toLocaleString()} splats
                </span>
              </>
            )}
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl space-y-5 px-4 py-5 sm:px-6">
        {/* Scene Selector Bar */}
        <section className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-[#dfd4c4] bg-[#fbf8f3] p-3.5 dark:border-[#2e2621] dark:bg-[#1b1614]">
          <div className="flex flex-wrap items-center gap-2">
            {SPATIAL_LAB_SCENES.map((scene) => {
              const active = activeSpec.id === scene.id;
              return (
                <button
                  key={scene.id}
                  type="button"
                  onClick={() => selectPresetScene(scene)}
                  className={`min-h-[40px] rounded-lg px-3.5 py-2 text-xs font-semibold whitespace-nowrap shrink-0 transition-colors cursor-pointer ${
                    active
                      ? "bg-[#922e25] text-[#fff8eb]"
                      : "bg-[#ede4d6] text-[#3f3028] hover:bg-[#e3d7c4] dark:bg-[#28211d] dark:text-[#dfd3c2] dark:hover:bg-[#332a25]"
                  }`}
                >
                  {scene.title.split("（")[0]} · {scene.asset.approxSizeLabel}
                </button>
              );
            })}

            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="inline-flex min-h-[40px] items-center gap-1.5 rounded-lg border border-[#d0c2ad] bg-white px-3.5 py-2 text-xs font-medium text-[#3c2d25] hover:bg-[#f2ebe0] whitespace-nowrap shrink-0 cursor-pointer dark:border-[#3c312a] dark:bg-[#221c18] dark:text-[#e6dac8]"
            >
              <FolderOpen size={14} />
              <span>导入本地 .spz / .ply / .splat</span>
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept=".spz,.ply,.splat,.ksplat,.sog"
              onChange={handleFileImport}
              className="hidden"
            />
          </div>

          <form
            onSubmit={handleLoadCustomUrl}
            className="flex min-w-[240px] flex-1 items-center gap-2 sm:max-w-sm"
          >
            <input
              type="url"
              value={customUrlInput}
              onChange={(e) => setCustomUrlInput(e.target.value)}
              placeholder="输入外部 3DGS URL (.spz / .ply / .splat)"
              className="min-h-[40px] flex-1 rounded-lg border border-[#d6c9b6] bg-white px-3 text-xs text-[#241c18] outline-none focus:border-[#922e25] dark:border-[#3b3029] dark:bg-[#14110f] dark:text-[#efe7da]"
            />
            <button
              type="submit"
              className="min-h-[40px] rounded-lg bg-[#3c2d25] px-3.5 text-xs font-semibold text-[#fff8eb] hover:opacity-90 whitespace-nowrap shrink-0 cursor-pointer dark:bg-[#b88b44] dark:text-[#1a130f]"
            >
              加载
            </button>
          </form>
        </section>

        {/* Main 3DGS Viewport Stage */}
        <section
          ref={stageWrapperRef}
          className={`flex flex-col overflow-hidden rounded-xl border border-[#43352c] bg-[#14110f] ${
            isFullscreen ? "h-screen w-screen rounded-none border-none" : ""
          }`}
        >
          <div
            className={`relative w-full overflow-hidden ${
              isFullscreen
                ? "flex-1"
                : "min-h-[340px] aspect-[4/3] sm:aspect-[16/10] lg:aspect-[16/9]"
            }`}
          >
            <SpatialSceneRenderer
              ref={rendererRef}
              sceneSpec={activeSpec}
              customFileBytes={customFileBytes}
              customFileName={customFileName}
              reloadToken={reloadToken}
              paused={paused}
              speedMetersPerSec={speedValue}
              showInteractionAnchors={showAnchors}
              onStatusChange={setStatus}
              onMetricsUpdate={setMetrics}
              onPointerLockChange={setPointerLocked}
              onTogglePause={() => setPaused((p) => !p)}
              onSelectAnchor={setSelectedAnchor}
            />

            {/* Top Minimal HUD (Solid dark surface, no backdrop-filter over WebGL) */}
            <div className="pointer-events-none absolute inset-x-0 top-0 z-20 flex flex-wrap items-start justify-between gap-2 p-3">
              <div className="pointer-events-auto rounded-lg border border-white/12 bg-[#161210]/90 px-3 py-2 text-xs text-[#f5ece0]">
                <div className="font-semibold text-[#e5c17c]">
                  {activeSpec.title}
                </div>
                <div className="mt-0.5 text-[11px] text-[#cbbba8] tabular-nums">
                  位置 ({metrics.pose.x.toFixed(2)}, {metrics.pose.y.toFixed(2)},{" "}
                  {metrics.pose.z.toFixed(2)}) · 朝向{" "}
                  {Math.round(metrics.pose.yawDeg)}° / 俯仰{" "}
                  {Math.round(metrics.pose.pitchDeg)}°
                </div>
              </div>

              <div className="pointer-events-auto flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() =>
                    pointerLocked
                      ? rendererRef.current?.exitPointerLock()
                      : rendererRef.current?.requestPointerLock()
                  }
                  className="hidden sm:inline-flex min-h-[38px] items-center gap-1.5 rounded-lg border border-white/15 bg-[#161210]/90 px-3 text-xs font-medium text-[#fff8eb] hover:bg-[#271e1a] whitespace-nowrap shrink-0 cursor-pointer"
                >
                  {pointerLocked ? <Lock size={13} /> : <Unlock size={13} />}
                  <span>
                    {pointerLocked ? "已锁定视角 (Esc退出)" : "锁定鼠标视角"}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={toggleFullscreen}
                  aria-label={isFullscreen ? "退出全屏" : "全屏浏览"}
                  className="inline-flex min-h-[38px] items-center gap-1.5 rounded-lg border border-white/15 bg-[#161210]/90 px-3 text-xs font-medium text-[#fff8eb] hover:bg-[#271e1a] whitespace-nowrap shrink-0 cursor-pointer"
                >
                  {isFullscreen ? (
                    <Minimize2 size={14} />
                  ) : (
                    <Maximize2 size={14} />
                  )}
                  <span>{isFullscreen ? "退出全屏" : "全屏"}</span>
                </button>
              </div>
            </div>

            {/* Boundary / Restricted Zone Notice */}
            {metrics.boundaryNotice && status.state === "ready" && (
              <div className="pointer-events-none absolute top-20 left-1/2 z-20 -translate-x-1/2 rounded-lg border border-[#e5c17c]/35 bg-[#161210]/92 px-3 py-1.5 text-xs text-[#e5c17c]">
                {metrics.boundaryNotice}
              </div>
            )}

            {/* Selected Future Interactive Anchor Card */}
            {selectedAnchor && showAnchors && (
              <div className="absolute bottom-4 left-3 z-20 max-w-xs rounded-lg border border-[#e5c17c]/40 bg-[#161210]/94 p-3 text-xs text-[#f5ece0]">
                <div className="flex items-center justify-between gap-3">
                  <span className="font-semibold text-[#e5c17c]">
                    {selectedAnchor.label}
                  </span>
                  <button
                    type="button"
                    onClick={() => setSelectedAnchor(null)}
                    className="text-[11px] text-[#cbbba8] hover:text-white cursor-pointer"
                  >
                    关闭
                  </button>
                </div>
                <p className="mt-1 text-[11px] text-[#d8cab8]">
                  {selectedAnchor.interactionHint}
                </p>
                <p className="mt-1 text-[11px] text-[#9b8d7e] tabular-nums">
                  空间坐标 ({selectedAnchor.position.join(", ")}) · 状态：预留锚点
                </p>
              </div>
            )}

            {/* Loading Overlay */}
            {status.state === "loading" && (
              <div className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-[#14110f]/94 p-6 text-center text-[#f5ece0]">
                <p className="text-sm font-semibold text-[#e5c17c]">
                  {status.message}
                </p>
                <div className="mt-3 h-1.5 w-64 max-w-full overflow-hidden rounded-full bg-white/15">
                  <div
                    className="h-full bg-[#e5c17c] transition-[width] duration-150"
                    style={{
                      width: `${status.progressPct ?? 35}%`,
                    }}
                  />
                </div>
                <p className="mt-2 text-xs text-[#b8aa98]">
                  {activeSpec.asset.sourceOrigin}
                </p>
              </div>
            )}

            {/* Explicit Load Error State (Never fakes success) */}
            {status.state === "error" && (
              <div className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-[#14110f]/96 p-6 text-center text-[#f5ece0]">
                <p className="text-base font-bold text-[#f08b7d]">
                  3DGS 场景加载失败
                </p>
                <p className="mt-2 max-w-md text-xs leading-relaxed text-[#d8cab8]">
                  {status.message}
                </p>
                <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
                  <button
                    type="button"
                    onClick={() => setReloadToken((n) => n + 1)}
                    className="min-h-[40px] rounded-lg bg-[#922e25] px-4 text-xs font-semibold text-[#fff8eb] hover:opacity-90 cursor-pointer"
                  >
                    重新加载当前场景
                  </button>
                  <button
                    type="button"
                    onClick={() => selectPresetScene(SPATIAL_LAB_SCENES[0])}
                    className="min-h-[40px] rounded-lg border border-white/20 bg-[#221c18] px-4 text-xs font-medium text-[#f5ece0] hover:bg-[#2d2520] cursor-pointer"
                  >
                    切回本地壁炉测试场景
                  </button>
                </div>
              </div>
            )}

            {/* Context Lost Warning */}
            {metrics.contextLost && (
              <div className="absolute inset-0 z-40 flex items-center justify-center bg-[#14110f]/92 p-4 text-center text-xs text-[#f08b7d]">
                WebGL 上下文已挂起或丢失，正在等待浏览器恢复 GPU 资源…
              </div>
            )}
          </div>

          {/* Bottom Unified Dock (Controls + Mobile Touch Pad) */}
          <div className="border-t border-[#342923] bg-[#1a1412] p-3.5 text-xs text-[#f5ece0]">
            <div className="flex flex-wrap items-center justify-between gap-3">
              {/* Playback & Speed Controls */}
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => setPaused((p) => !p)}
                  className="inline-flex min-h-[40px] items-center gap-1.5 rounded-lg bg-[#922e25] px-3.5 font-semibold text-[#fff8eb] hover:opacity-90 whitespace-nowrap shrink-0 cursor-pointer"
                >
                  {paused ? <Play size={14} /> : <Pause size={14} />}
                  <span>{paused ? "恢复控制" : "暂停"}</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setPaused(false);
                    rendererRef.current?.resetToInitialPose();
                  }}
                  className="inline-flex min-h-[40px] items-center gap-1.5 rounded-lg border border-white/15 bg-white/10 px-3 font-medium hover:bg-white/18 whitespace-nowrap shrink-0 cursor-pointer"
                >
                  <RotateCcw size={14} />
                  <span>重新定位</span>
                </button>

                <div className="flex items-center gap-1 rounded-lg bg-white/8 p-1">
                  {SPEED_OPTIONS.map((opt) => (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => setSpeedValue(opt.value)}
                      className={`min-h-[32px] rounded-md px-2.5 text-[11px] font-medium whitespace-nowrap shrink-0 cursor-pointer ${
                        Math.abs(speedValue - opt.value) < 0.05
                          ? "bg-[#b88b44] text-[#1a130f] font-semibold"
                          : "text-[#d8cab8] hover:text-white"
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={() => setShowAnchors((v) => !v)}
                  className={`inline-flex min-h-[40px] items-center gap-1.5 rounded-lg border px-3 text-xs font-medium whitespace-nowrap shrink-0 cursor-pointer ${
                    showAnchors
                      ? "border-[#e5c17c]/60 bg-[#b88b44]/25 text-[#e5c17c]"
                      : "border-white/15 bg-white/8 text-[#d8cab8] hover:bg-white/15"
                  }`}
                >
                  <Sparkles size={13} />
                  <span>
                    未来互动锚点层：{showAnchors ? "显示" : "隐藏"}
                  </span>
                </button>
              </div>

              {/* Guided Path Waypoints (SpatialNavigation) */}
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="inline-flex items-center gap-1 text-[11px] text-[#cbbba8]">
                  <Compass size={13} className="text-[#e5c17c]" />
                  <span>路径节点：</span>
                </span>
                {activeSpec.navigation.pathNodes.map((node) => (
                  <button
                    key={node.id}
                    type="button"
                    onClick={() => {
                      setPaused(false);
                      rendererRef.current?.travelToPathNode(node);
                    }}
                    className="min-h-[36px] rounded-lg bg-white/10 px-3 text-[11px] font-medium text-[#f5ece0] hover:bg-white/20 whitespace-nowrap shrink-0 cursor-pointer"
                  >
                    {node.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Desktop Shortcut Legend + Mobile Touch Movement Pad */}
            <div className="mt-3 flex flex-wrap items-center justify-between gap-3 border-t border-white/10 pt-3">
              <div className="space-y-0.5 text-[11px] text-[#cbbba8]">
                <p>
                  桌面端：W/A/S/D 或方向键连续前后左右移动 · Q/E 调整高度 · Shift
                  加速 · 鼠标拖拽（或点击上方锁定视角）环顾 · 空格暂停 · R 复位
                </p>
                <p>
                  移动端：单指在画面内滑动转向 · 按住下方方向键连续前进、后退与左右平移（已禁用画面内浏览器误滚动）
                </p>
              </div>

              <div className="flex items-center gap-1.5 select-none touch-none">
                <button
                  type="button"
                  aria-label="向左移动"
                  {...bindHoldMove({ right: -1 })}
                  className="flex h-11 w-11 items-center justify-center rounded-lg border border-white/15 bg-white/12 text-[#fff8eb] active:bg-[#b88b44] active:text-[#1a130f] cursor-pointer"
                >
                  <ArrowLeft size={16} />
                </button>
                <button
                  type="button"
                  aria-label="向前移动"
                  {...bindHoldMove({ forward: 1 })}
                  className="flex h-11 w-14 items-center justify-center rounded-lg border border-[#e5c17c]/40 bg-[#922e25] text-[#fff8eb] active:opacity-85 cursor-pointer"
                >
                  <ArrowUp size={16} />
                </button>
                <button
                  type="button"
                  aria-label="向后移动"
                  {...bindHoldMove({ forward: -1 })}
                  className="flex h-11 w-14 items-center justify-center rounded-lg border border-white/15 bg-white/12 text-[#fff8eb] active:bg-[#b88b44] active:text-[#1a130f] cursor-pointer"
                >
                  <ArrowDown size={16} />
                </button>
                <button
                  type="button"
                  aria-label="向右移动"
                  {...bindHoldMove({ right: 1 })}
                  className="flex h-11 w-11 items-center justify-center rounded-lg border border-white/15 bg-white/12 text-[#fff8eb] active:bg-[#b88b44] active:text-[#1a130f] cursor-pointer"
                >
                  <ArrowRight size={16} />
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Engineering Transparency & Replacement Guide (Normal Scrollable Page Area) */}
        <section className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="rounded-xl border border-[#dfd4c4] bg-[#fbf8f3] p-4 dark:border-[#2e2621] dark:bg-[#1b1614]">
            <h2 className="font-serif-display text-sm font-bold text-[#241c18] dark:text-[#efe7da]">
              当前测试素材来源、许可与格式说明
            </h2>
            <dl className="mt-3 space-y-2 text-xs">
              <div className="flex flex-wrap justify-between gap-2 border-b border-[#ece3d5] pb-1.5 dark:border-[#2b231e]">
                <dt className="text-[#6f5e50] dark:text-[#a89989]">当前素材</dt>
                <dd className="font-medium text-right">
                  {activeSpec.asset.format.toUpperCase()} ·{" "}
                  {activeSpec.asset.approxSizeLabel}
                </dd>
              </div>
              <div className="flex flex-wrap justify-between gap-2 border-b border-[#ece3d5] pb-1.5 dark:border-[#2b231e]">
                <dt className="text-[#6f5e50] dark:text-[#a89989]">来源渠道</dt>
                <dd className="max-w-sm text-right">
                  {activeSpec.asset.sourceOrigin}
                </dd>
              </div>
              <div className="flex flex-wrap justify-between gap-2 border-b border-[#ece3d5] pb-1.5 dark:border-[#2b231e]">
                <dt className="text-[#6f5e50] dark:text-[#a89989]">开源许可</dt>
                <dd className="text-right">{activeSpec.asset.license}</dd>
              </div>
              <div className="flex flex-wrap justify-between gap-2">
                <dt className="text-[#6f5e50] dark:text-[#a89989]">
                  是否真实佛寺扫描
                </dt>
                <dd className="font-semibold text-[#922e25] dark:text-[#e5a89f]">
                  {activeSpec.asset.isTempleScan
                    ? "是（正式寺院扫描）"
                    : "否（开源通用 3DGS 测试场景）"}
                </dd>
              </div>
            </dl>
            <p className="mt-3 text-[11px] leading-relaxed text-[#6f5e50] dark:text-[#a89989]">
              {activeSpec.asset.attributionNote}
            </p>
          </div>

          <div className="rounded-xl border border-[#dfd4c4] bg-[#fbf8f3] p-4 dark:border-[#2e2621] dark:bg-[#1b1614]">
            <h2 className="font-serif-display text-sm font-bold text-[#241c18] dark:text-[#efe7da]">
              导航边界、设备兼容与尚未完成模块说明
            </h2>
            <ul className="mt-3 space-y-2 text-xs leading-relaxed text-[#4f4137] dark:text-[#cabaa7]">
              <li>
                · <strong>渲染底层</strong>：采用 Three.js 0.187 +{" "}
                <code>@sparkjsdev/spark</code> 2.4.0（MIT），基于 WebGL2
                直接渲染 3DGS 点云，无需 COOP/COEP 跨源隔离头，兼容现有
                Firebase 弹窗登录与移动端浏览器。
              </li>
              <li>
                · <strong>碰撞与导航状态</strong>：当前已实现独立模块{" "}
                <code>spatialNavigation.ts</code>{" "}
                的配置式可行走包围盒（AABB）限制与禁入区推出逻辑；
                <strong>尚未实现</strong>
                基于真实建筑网格/点云碰撞体的自动避障与上下台阶地面高度贴合。
              </li>
              <li>
                · <strong>GPU / 运行环境</strong>：当前检测渲染器为{" "}
                <code>{metrics.capabilities.rendererLabel}</code>
                {metrics.capabilities.isSoftwareGl
                  ? "（软件光栅化环境，已自动限制像素比并启用节流绘制）"
                  : ""}
                。
              </li>
              <li>
                · <strong>替换正式寺院素材</strong>：采集并导出寺院{" "}
                <code>.spz / .ply / .sog</code> 资产后，放入{" "}
                <code>public/splats/</code> 并在{" "}
                <code>src/spatial/spatialSceneConfig.ts</code>{" "}
                中替换对应场景配置、校准坐标与路径节点即可直接运行。
              </li>
            </ul>
          </div>
        </section>
      </main>
    </div>
  );
}
