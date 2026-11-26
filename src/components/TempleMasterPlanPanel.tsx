import {
  ArrowRight,
  CheckCircle2,
  Clock,
  Compass,
  FileCheck2,
  Footprints,
  MapPin,
  Route,
  Volume2,
} from "lucide-react";
import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  PATH_TYPE_LABELS,
  TEMPLE_CONNECTION_PATHS,
  TEMPLE_MASTER_NODES,
  TEMPLE_ZONE_LABELS,
  V3_DEVELOPMENT_ROADMAP,
  V3_FORMAL_ASSET_IMPORT_WORKFLOW,
  V3_VISUAL_STANDARDS,
  getMasterNodeById,
  getMasterPlanSummaryStats,
  getOutgoingPathsForNode,
  type AssetReadinessStatus,
  type TempleMasterNode,
  type TempleZone,
} from "@/data/templeMasterPlan";

const STATUS_LABELS: Record<AssetReadinessStatus, string> = {
  "verified-sequence": "已定型实景序列",
  "single-frame-pending-sequence": "单帧待扩序列",
  planned: "规划节点",
};

const NODE_TYPE_LABELS: Record<TempleMasterNode["nodeType"], string> = {
  "mountain-entry": "山林入口",
  "stone-stairway": "石阶步梯",
  "temple-gate": "寺院山门",
  courtyard: "庭院广场",
  "buddhist-hall": "独立佛殿",
  corridor: "连廊通道",
  "lotus-pond": "净土莲池",
  "bamboo-grove": "幽篁竹林",
  "mountain-trail": "山间林径",
  "cloud-viewpoint": "云海高台",
  "meditation-pavilion": "静修木亭",
  waterside: "水岸路径",
};

const ZONE_ORDER: TempleZone[] = [
  "entrance",
  "core",
  "connector",
  "hall",
  "nature",
];

const SURFACE_LABELS: Record<string, string> = {
  stone: "青石台阶 / 石板",
  wood: "实木门槛 / 廊板",
  jinzhuan: "殿内金砖地面",
  earth: "林间碎石土径",
};

export function TempleMasterPlanPanel() {
  const navigate = useNavigate();
  const [activeView, setActiveView] = useState<"blueprint" | "roadmap">(
    "blueprint",
  );
  const [zoneFilter, setZoneFilter] = useState<TempleZone | "all">("all");
  const [selectedNodeId, setSelectedNodeId] = useState<string>("daxiong-hall");

  const stats = useMemo(() => getMasterPlanSummaryStats(), []);
  const allNodes = useMemo(() => Object.values(TEMPLE_MASTER_NODES), []);

  const visibleNodes = useMemo(() => {
    if (zoneFilter === "all") return allNodes;
    return allNodes.filter((node) => node.zone === zoneFilter);
  }, [allNodes, zoneFilter]);

  const selectedNode = useMemo(
    () =>
      getMasterNodeById(selectedNodeId) ??
      visibleNodes[0] ??
      TEMPLE_MASTER_NODES["daxiong-hall"],
    [selectedNodeId, visibleNodes],
  );

  const outgoingPaths = useMemo(
    () => getOutgoingPathsForNode(selectedNode.nodeId),
    [selectedNode.nodeId],
  );

  const incomingPaths = useMemo(
    () =>
      TEMPLE_CONNECTION_PATHS.filter(
        (path) => path.toNodeId === selectedNode.nodeId,
      ),
    [selectedNode.nodeId],
  );

  const selectedVerifiedCount = selectedNode.assetChecklist.filter(
    (slot) => slot.status === "verified",
  ).length;

  const handleZoneChange = (nextZone: TempleZone | "all") => {
    setZoneFilter(nextZone);
    if (nextZone !== "all") {
      const firstInZone = allNodes.find((n) => n.zone === nextZone);
      if (firstInZone && selectedNode.zone !== nextZone) {
        setSelectedNodeId(firstInZone.nodeId);
      }
    }
  };

  return (
    <section
      aria-labelledby="temple-master-plan-heading"
      className="mt-10 border-t border-[#e4d8c3] pt-8 dark:border-[#332922]"
    >
      {/* Editorial Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-xs font-semibold tracking-widest text-[#922e25] dark:text-[#d4a85d]">
            数字寺院空间规划与实景资产清单 · 第一阶段
          </p>
          <h3
            id="temple-master-plan-heading"
            className="mt-1.5 font-serif-display text-xl font-bold text-[#39251d] md:text-2xl dark:text-[#efe7da]"
          >
            第一座数字山林佛寺 · 空间架构蓝图
          </h3>
          <p className="mt-2 flex flex-wrap items-center gap-x-2.5 gap-y-1 text-xs text-[#6f5b49] tabular-nums dark:text-[#b7a795]">
            <span>{stats.nodeCount} 个空间节点</span>
            <span aria-hidden="true">·</span>
            <span>{stats.pathCount} 条连接路径</span>
            <span aria-hidden="true">·</span>
            <span>
              {stats.verifiedSlots}/{stats.totalChecklistSlots} 实景机位已核验
            </span>
            <span aria-hidden="true">·</span>
            <span>
              {stats.verifiedPaths}/{stats.pathCount} 条连贯路径已就绪
            </span>
          </p>
        </div>

        {/* View Mode Switcher */}
        <div
          role="tablist"
          aria-label="蓝图视图切换"
          className="inline-flex w-fit shrink-0 items-center gap-1 rounded-lg bg-[#eadfc9] p-1 dark:bg-[#2a211c]"
        >
          <button
            type="button"
            role="tab"
            aria-selected={activeView === "blueprint"}
            onClick={() => setActiveView("blueprint")}
            className={`whitespace-nowrap rounded-md px-3.5 py-2 text-xs font-semibold transition-colors cursor-pointer ${
              activeView === "blueprint"
                ? "bg-[#fffaf1] text-[#39251d] shadow-xs dark:bg-[#1f1a17] dark:text-[#efe7da]"
                : "text-[#6f5b49] hover:text-[#39251d] dark:text-[#a79886] dark:hover:text-[#efe7da]"
            }`}
          >
            空间节点与连接路径
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={activeView === "roadmap"}
            onClick={() => setActiveView("roadmap")}
            className={`whitespace-nowrap rounded-md px-3.5 py-2 text-xs font-semibold transition-colors cursor-pointer ${
              activeView === "roadmap"
                ? "bg-[#fffaf1] text-[#39251d] shadow-xs dark:bg-[#1f1a17] dark:text-[#efe7da]"
                : "text-[#6f5b49] hover:text-[#39251d] dark:text-[#a79886] dark:hover:text-[#efe7da]"
            }`}
          >
            统一视觉规范与导入流程
          </button>
        </div>
      </div>

      {activeView === "blueprint" ? (
        <div className="mt-6">
          {/* Zone Filters */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              aria-pressed={zoneFilter === "all"}
              onClick={() => handleZoneChange("all")}
              className={`whitespace-nowrap rounded-lg px-3.5 py-2 text-xs font-semibold transition-colors cursor-pointer tabular-nums ${
                zoneFilter === "all"
                  ? "bg-[#922e25] text-[#fff8eb]"
                  : "bg-[#eadfc9] text-[#563b2c] hover:bg-[#e1d2b6] dark:bg-[#2a211c] dark:text-[#d8cab8]"
              }`}
            >
              全部节点 ({allNodes.length})
            </button>
            {ZONE_ORDER.map((zone) => {
              const count = allNodes.filter((n) => n.zone === zone).length;
              const selected = zoneFilter === zone;
              return (
                <button
                  key={zone}
                  type="button"
                  aria-pressed={selected}
                  onClick={() => handleZoneChange(zone)}
                  className={`whitespace-nowrap rounded-lg px-3.5 py-2 text-xs font-semibold transition-colors cursor-pointer tabular-nums ${
                    selected
                      ? "bg-[#922e25] text-[#fff8eb]"
                      : "bg-[#eadfc9] text-[#563b2c] hover:bg-[#e1d2b6] dark:bg-[#2a211c] dark:text-[#d8cab8]"
                  }`}
                >
                  {TEMPLE_ZONE_LABELS[zone]} ({count})
                </button>
              );
            })}
          </div>

          {/* Two-Column Spatial Node Index & Detail Panel */}
          <div className="mt-5 grid grid-cols-1 gap-6 lg:grid-cols-12 lg:items-start">
            {/* Left Node Directory */}
            <div className="overflow-hidden rounded-xl border border-[#e4d8c3] bg-[#fffaf1] lg:col-span-5 dark:border-[#332922] dark:bg-[#1f1a17]">
              <div className="border-b border-[#e4d8c3] px-4 py-3 dark:border-[#332922]">
                <p className="text-xs font-semibold text-[#39251d] dark:text-[#efe7da]">
                  寺院空间节点目录（点击检视详细素材清单）
                </p>
              </div>
              <div className="divide-y divide-[#eee4d2] dark:divide-[#2e251f]">
                {visibleNodes.map((node, idx) => {
                  const isSelected = node.nodeId === selectedNode.nodeId;
                  const verified = node.assetChecklist.filter(
                    (s) => s.status === "verified",
                  ).length;
                  return (
                    <button
                      key={node.nodeId}
                      type="button"
                      onClick={() => setSelectedNodeId(node.nodeId)}
                      className={`flex w-full items-center justify-between gap-3 px-4 py-3.5 text-left transition-colors cursor-pointer ${
                        isSelected
                          ? "bg-[#f3e9d6] dark:bg-[#2d231d]"
                          : "hover:bg-[#faf3e4] dark:hover:bg-[#261e19]"
                      }`}
                    >
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-[11px] font-semibold text-[#857362] tabular-nums dark:text-[#a79886]">
                            {String(idx + 1).padStart(2, "0")}
                          </span>
                          <span className="truncate font-serif-display text-sm font-bold text-[#39251d] dark:text-[#efe7da]">
                            {node.nodeName}
                          </span>
                        </div>
                        <p className="mt-0.5 flex items-center gap-1.5 text-[11px] text-[#857362] dark:text-[#a79886]">
                          <span>{TEMPLE_ZONE_LABELS[node.zone]}</span>
                          <span aria-hidden="true">/</span>
                          <span>{NODE_TYPE_LABELS[node.nodeType]}</span>
                          <span aria-hidden="true">·</span>
                          <span
                            className={
                              node.assetStatus === "verified-sequence"
                                ? "font-semibold text-[#2d6a4f] dark:text-[#8fd1a8]"
                                : node.assetStatus ===
                                    "single-frame-pending-sequence"
                                  ? "font-medium text-[#9a6324] dark:text-[#d4a85d]"
                                  : ""
                            }
                          >
                            {STATUS_LABELS[node.assetStatus]}
                          </span>
                        </p>
                      </div>

                      <div className="shrink-0 text-right">
                        <span className="text-xs font-semibold text-[#39251d] tabular-nums dark:text-[#efe7da]">
                          {verified}/{node.assetChecklist.length}
                        </span>
                        <p className="text-[10px] text-[#857362] dark:text-[#a79886]">
                          机位就绪
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Right Selected Node Inspector */}
            <div className="rounded-xl border border-[#e4d8c3] bg-[#fffaf1] p-5 md:p-6 lg:col-span-7 dark:border-[#332922] dark:bg-[#1f1a17]">
              {/* Node Header */}
              <div className="flex flex-wrap items-start justify-between gap-4 border-b border-[#e4d8c3] pb-4 dark:border-[#332922]">
                <div>
                  <p className="flex flex-wrap items-center gap-2 text-xs text-[#857362] tabular-nums dark:text-[#a79886]">
                    <span>{TEMPLE_ZONE_LABELS[selectedNode.zone]}</span>
                    <span aria-hidden="true">·</span>
                    <span>{NODE_TYPE_LABELS[selectedNode.nodeType]}</span>
                    <span aria-hidden="true">·</span>
                    <span>
                      空间坐标 ({selectedNode.coordinates.x}, {selectedNode.coordinates.y},{" "}
                      {selectedNode.coordinates.z})
                    </span>
                  </p>
                  <h4 className="mt-1.5 font-serif-display text-xl font-bold text-[#39251d] dark:text-[#efe7da]">
                    {selectedNode.nodeName}
                  </h4>
                  <p className="mt-1 text-xs font-medium text-[#6f5b49] dark:text-[#cfc2b2]">
                    状态：{STATUS_LABELS[selectedNode.assetStatus]} · 节点标识：
                    <span className="font-mono">{selectedNode.nodeId}</span>
                  </p>
                </div>

                {selectedNode.linkedSceneId && (
                  <button
                    type="button"
                    onClick={() =>
                      navigate(
                        `/worlds/buddhist?scene=${selectedNode.linkedSceneId}`,
                      )
                    }
                    className="inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-lg bg-[#922e25] px-4 py-2 text-xs font-semibold text-[#fff8eb] transition-opacity hover:opacity-90 cursor-pointer"
                  >
                    <span>进入对应场景</span>
                    <ArrowRight size={14} />
                  </button>
                )}
              </div>

              {/* Visual Specifications */}
              <dl className="mt-4 divide-y divide-[#eee4d2] text-xs dark:divide-[#2e251f]">
                <div className="grid grid-cols-1 gap-1 py-2.5 sm:grid-cols-4">
                  <dt className="font-semibold text-[#6f5b49] dark:text-[#b7a795]">
                    主视觉素材规范
                  </dt>
                  <dd className="text-[#39251d] sm:col-span-3 dark:text-[#efe7da]">
                    {selectedNode.mainVisualSpec}
                  </dd>
                </div>
                <div className="grid grid-cols-1 gap-1 py-2.5 sm:grid-cols-4">
                  <dt className="font-semibold text-[#6f5b49] dark:text-[#b7a795]">
                    进入 / 离开序列
                  </dt>
                  <dd className="space-y-1 text-[#39251d] sm:col-span-3 dark:text-[#efe7da]">
                    <p>进入：{selectedNode.enterVisualSpec}</p>
                    <p className="text-[#6f5b49] dark:text-[#cfc2b2]">
                      离开：{selectedNode.exitVisualSpec}
                    </p>
                  </dd>
                </div>
                <div className="grid grid-cols-1 gap-1 py-2.5 sm:grid-cols-4">
                  <dt className="font-semibold text-[#6f5b49] dark:text-[#b7a795]">
                    360° 全景预留
                  </dt>
                  <dd className="text-[#39251d] sm:col-span-3 dark:text-[#efe7da]">
                    {selectedNode.panoramaOptionalSpec}
                  </dd>
                </div>
                <div className="grid grid-cols-1 gap-1 py-2.5 sm:grid-cols-4">
                  <dt className="font-semibold text-[#6f5b49] dark:text-[#b7a795]">
                    回退保护策略
                  </dt>
                  <dd className="text-[#6f5b49] sm:col-span-3 dark:text-[#cfc2b2]">
                    {selectedNode.fallbackVisualSpec}
                  </dd>
                </div>
              </dl>

              {/* Shot Checklist */}
              <div className="mt-5 border-t border-[#e4d8c3] pt-4 dark:border-[#332922]">
                <div className="flex items-center justify-between">
                  <h5 className="inline-flex items-center gap-1.5 text-sm font-bold text-[#39251d] dark:text-[#efe7da]">
                    <FileCheck2 size={15} className="text-[#922e25] dark:text-[#d4a85d]" />
                    <span>空间专属实景素材清单</span>
                  </h5>
                  <span className="text-xs font-semibold text-[#6f5b49] tabular-nums dark:text-[#b7a795]">
                    {selectedVerifiedCount} / {selectedNode.assetChecklist.length} 已定型
                  </span>
                </div>

                <div className="mt-3 divide-y divide-[#eee4d2] rounded-lg border border-[#e4d8c3] dark:divide-[#2e251f] dark:border-[#332922]">
                  {selectedNode.assetChecklist.map((slot) => (
                    <div
                      key={slot.slotId}
                      className="flex flex-col gap-1 px-3.5 py-2.5 sm:flex-row sm:items-center sm:justify-between"
                    >
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          {slot.status === "verified" ? (
                            <CheckCircle2
                              size={14}
                              className="shrink-0 text-[#2d6a4f] dark:text-[#8fd1a8]"
                            />
                          ) : (
                            <Clock
                              size={14}
                              className="shrink-0 text-[#9a6324] dark:text-[#d4a85d]"
                            />
                          )}
                          <span className="text-xs font-semibold text-[#39251d] dark:text-[#efe7da]">
                            {slot.label}
                          </span>
                          <span className="text-[11px] text-[#857362] tabular-nums dark:text-[#a79886]">
                            {slot.aspectRatio}
                          </span>
                        </div>
                        <p className="mt-0.5 pl-5 text-[11px] text-[#6f5b49] dark:text-[#b7a795]">
                          {slot.assetNote}
                        </p>
                      </div>
                      <span
                        className={`shrink-0 pl-5 text-[11px] font-semibold sm:pl-0 ${
                          slot.status === "verified"
                            ? "text-[#2d6a4f] dark:text-[#8fd1a8]"
                            : "text-[#9a6324] dark:text-[#d4a85d]"
                        }`}
                      >
                        {slot.status === "verified" ? "已核验定型" : "待正式制作"}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Connected Paths */}
              <div className="mt-5 border-t border-[#e4d8c3] pt-4 dark:border-[#332922]">
                <h5 className="inline-flex items-center gap-1.5 text-sm font-bold text-[#39251d] dark:text-[#efe7da]">
                  <Route size={15} className="text-[#922e25] dark:text-[#d4a85d]" />
                  <span>空间连接路径（支持双向检视跳转）</span>
                </h5>

                {outgoingPaths.length === 0 && incomingPaths.length === 0 ? (
                  <p className="mt-2 text-xs text-[#857362] dark:text-[#a79886]">
                    此节点为独立扩展预留空间，后续接入廊道路径。
                  </p>
                ) : (
                  <div className="mt-3 space-y-2.5">
                    {outgoingPaths.map((path) => {
                      const target = getMasterNodeById(path.toNodeId);
                      return (
                        <div
                          key={path.pathId}
                          className="rounded-lg border border-[#e4d8c3] px-3.5 py-3 dark:border-[#332922]"
                        >
                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <div className="min-w-0">
                              <p className="text-xs font-bold text-[#39251d] dark:text-[#efe7da]">
                                去往：{target?.nodeName ?? path.toNodeId} ·{" "}
                                {path.label}
                              </p>
                              <p className="mt-0.5 text-[11px] text-[#857362] tabular-nums dark:text-[#a79886]">
                                {PATH_TYPE_LABELS[path.pathType]} · 缓步{" "}
                                {(path.walkDurationMs / 1000).toFixed(1)} 秒 ·{" "}
                                {path.paceMetersPerSec.toFixed(2)} m/s ·{" "}
                                {SURFACE_LABELS[path.stepSurface] ??
                                  path.stepSurface}
                              </p>
                            </div>
                            {target && (
                              <button
                                type="button"
                                onClick={() => setSelectedNodeId(target.nodeId)}
                                className="inline-flex shrink-0 items-center gap-1 whitespace-nowrap text-xs font-semibold text-[#922e25] hover:underline cursor-pointer dark:text-[#d4a85d]"
                              >
                                <span>检视下一节点</span>
                                <ArrowRight size={12} />
                              </button>
                            )}
                          </div>
                          <p className="mt-2 text-[11px] leading-relaxed text-[#6f5b49] dark:text-[#cfc2b2]">
                            关键帧：{path.requiredWaypoints.join(" → ")}
                          </p>
                          <p className="mt-1 text-[11px] text-[#857362] dark:text-[#a79886]">
                            过渡与声场：{path.transitionRule}；
                            {path.audioTransitionRule}
                          </p>
                        </div>
                      );
                    })}

                    {incomingPaths.map((path) => {
                      const source = getMasterNodeById(path.fromNodeId);
                      return (
                        <div
                          key={`in-${path.pathId}`}
                          className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-dashed border-[#dfd0b8] px-3.5 py-2.5 text-xs dark:border-[#3a2f27]"
                        >
                          <span className="text-[#6f5b49] dark:text-[#cfc2b2]">
                            来路：{source?.nodeName ?? path.fromNodeId}（
                            {PATH_TYPE_LABELS[path.pathType]}）→ 本节点
                          </span>
                          {source && (
                            <button
                              type="button"
                              onClick={() => setSelectedNodeId(source.nodeId)}
                              className="whitespace-nowrap text-xs font-semibold text-[#922e25] hover:underline cursor-pointer dark:text-[#d4a85d]"
                            >
                              回溯至{source.nodeName}
                            </button>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Audio & Interaction Layers */}
              <div className="mt-5 grid grid-cols-1 gap-4 border-t border-[#e4d8c3] pt-4 text-xs sm:grid-cols-2 dark:border-[#332922]">
                <div>
                  <p className="inline-flex items-center gap-1.5 font-semibold text-[#39251d] dark:text-[#efe7da]">
                    <Volume2 size={14} className="text-[#922e25] dark:text-[#d4a85d]" />
                    <span>连续声场配置</span>
                  </p>
                  <p className="mt-1.5 leading-relaxed text-[#6f5b49] dark:text-[#cfc2b2]">
                    {selectedNode.audioProfile.ambientGainNote}
                  </p>
                  <p className="mt-1 text-[11px] text-[#857362] dark:text-[#a79886]">
                    环境音：{selectedNode.audioProfile.ambient} · 宗教层：
                    {selectedNode.audioProfile.religious} · 静修曲目：
                    {selectedNode.audioProfile.suggestedMusic}
                  </p>
                </div>

                <div>
                  <p className="inline-flex items-center gap-1.5 font-semibold text-[#39251d] dark:text-[#efe7da]">
                    <Footprints size={14} className="text-[#922e25] dark:text-[#d4a85d]" />
                    <span>轻量动画与互动层</span>
                  </p>
                  <p className="mt-1.5 leading-relaxed text-[#6f5b49] dark:text-[#cfc2b2]">
                    动画层：{selectedNode.animationLayers.join(" · ")}
                  </p>
                  <p className="mt-1 text-[11px] text-[#857362] dark:text-[#a79886]">
                    支持互动：
                    {[
                      selectedNode.interactionConfig.allowIncense && "上香",
                      selectedNode.interactionConfig.allowLamp && "供灯",
                      selectedNode.interactionConfig.allowFlower && "供花",
                      selectedNode.interactionConfig.enableWorship && "礼佛",
                      selectedNode.interactionConfig.enableWoodfish && "木鱼",
                      selectedNode.interactionConfig.allowBreathingGuide &&
                        "呼吸引导",
                      selectedNode.interactionConfig.allowSeatedTimer &&
                        "静坐计时",
                    ]
                      .filter(Boolean)
                      .join(" · ") || "静观漫步"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* Roadmap & Formal Production Standards View */
        <div className="mt-6 space-y-6">
          {/* Visual Standards */}
          <div className="rounded-xl border border-[#e4d8c3] bg-[#fffaf1] p-5 md:p-6 dark:border-[#332922] dark:bg-[#1f1a17]">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h4 className="inline-flex items-center gap-1.5 font-serif-display text-base font-bold text-[#39251d] dark:text-[#efe7da]">
                <Compass size={16} className="text-[#922e25] dark:text-[#d4a85d]" />
                <span>V3.0 统一实景视觉标准与禁止项</span>
              </h4>
              <span className="text-xs font-semibold text-[#857362] tabular-nums dark:text-[#a79886]">
                统一画幅 {V3_VISUAL_STANDARDS.aspectRatio}
              </span>
            </div>
            <p className="mt-2 text-xs leading-relaxed text-[#6f5b49] dark:text-[#cfc2b2]">
              {V3_VISUAL_STANDARDS.style}
            </p>

            <div className="mt-4 grid grid-cols-1 gap-6 border-t border-[#e4d8c3] pt-4 md:grid-cols-2 dark:border-[#332922]">
              <div>
                <p className="text-xs font-bold text-[#39251d] dark:text-[#efe7da]">
                  六项建筑与光影连续性锁定
                </p>
                <ul className="mt-2 space-y-1.5 text-xs leading-relaxed text-[#563b2c] dark:text-[#cfc2b2]">
                  {V3_VISUAL_STANDARDS.consistencyLocks.map((lock, i) => (
                    <li key={lock} className="tabular-nums">
                      0{i + 1}. {lock}
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <p className="text-xs font-bold text-[#922e25] dark:text-[#d4a85d]">
                  严禁视觉路线
                </p>
                <ul className="mt-2 space-y-1.5 text-xs leading-relaxed text-[#6f5b49] dark:text-[#b7a795]">
                  {V3_VISUAL_STANDARDS.forbidStyles.map((item) => (
                    <li key={item}>— {item}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* 9-Phase Roadmap */}
          <div className="rounded-xl border border-[#e4d8c3] bg-[#fffaf1] p-5 md:p-6 dark:border-[#332922] dark:bg-[#1f1a17]">
            <h4 className="font-serif-display text-base font-bold text-[#39251d] dark:text-[#efe7da]">
              九阶段数字寺院实施路线图
            </h4>
            <div className="mt-3 divide-y divide-[#eee4d2] dark:divide-[#2e251f]">
              {V3_DEVELOPMENT_ROADMAP.map((step) => (
                <div
                  key={step.phase}
                  className="flex flex-col gap-1.5 py-3 sm:flex-row sm:items-start sm:justify-between"
                >
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-[#39251d] dark:text-[#efe7da]">
                      {step.phase} · {step.title}
                    </p>
                    <p className="mt-0.5 text-xs text-[#6f5b49] dark:text-[#cfc2b2]">
                      {step.deliverables}
                    </p>
                  </div>
                  <span
                    className={`shrink-0 text-xs font-semibold ${
                      step.status === "completed"
                        ? "text-[#2d6a4f] dark:text-[#8fd1a8]"
                        : step.status === "in-progress"
                          ? "text-[#922e25] dark:text-[#d4a85d]"
                          : "text-[#857362] dark:text-[#a79886]"
                    }`}
                  >
                    {step.status === "completed"
                      ? "已完成"
                      : step.status === "in-progress"
                        ? "进行中"
                        : "待排期"}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Formal Import Workflow */}
          <div className="rounded-xl border border-[#e4d8c3] bg-[#fffaf1] p-5 md:p-6 dark:border-[#332922] dark:bg-[#1f1a17]">
            <h4 className="inline-flex items-center gap-1.5 font-serif-display text-base font-bold text-[#39251d] dark:text-[#efe7da]">
              <MapPin size={16} className="text-[#922e25] dark:text-[#d4a85d]" />
              <span>正式素材生产与系统导入规范（Phase 2 起按需执行）</span>
            </h4>
            <ol className="mt-3 space-y-2 text-xs leading-relaxed text-[#563b2c] dark:text-[#cfc2b2]">
              {V3_FORMAL_ASSET_IMPORT_WORKFLOW.map((step) => (
                <li key={step}>{step}</li>
              ))}
            </ol>
          </div>
        </div>
      )}
    </section>
  );
}
