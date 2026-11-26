import type { TemplePathType } from "@/data/templeMasterPlan";
import type { NatureSoundType, ReligiousAudioType, RetreatMusicTrackId } from "@/lib/audio";

export type SpatialRealmType = "buddhist" | "daoist" | "nature";

export type SpatialDirection =
  | "forward"
  | "back"
  | "left"
  | "right"
  | "enter"
  | "exit";

export type SpatialTransitionKind =
  | "push-in"
  | "pull-back"
  | "lateral-left"
  | "lateral-right"
  | "mist-glide";

export type SpatialConnection = {
  targetSceneId: string;
  label: string;
  direction: SpatialDirection;
  transitionType: SpatialTransitionKind;
  /** 对应 V3.0 规划连接路径 ID */
  pathId?: string;
  /** 对应路径传统空间类型 */
  pathType?: TemplePathType;
  /** 规划缓步时长（ms） */
  walkDurationMs?: number;
};

export type SpatialNode = {
  sceneId: string;
  /** 对应 V3.0 数字寺院总体规划空间节点 ID */
  masterNodeId?: string;
  realm: SpatialRealmType;
  title: string;
  subtitle: string;
  /** Logical 3D world coordinates prepared for future 3D scene upgrading */
  coordinates: { x: number; y: number; z: number };
  entrances: string[];
  exits: string[];
  connections: SpatialConnection[];
  audioConfig: {
    ambient: NatureSoundType;
    religious: ReligiousAudioType;
    suggestedMusic: RetreatMusicTrackId;
  };
  visualConfig: {
    horizonYPercent: number;
    parallaxStrength: number;
    foregroundFrame: "temple-eaves" | "mountain-pine" | "mist-canopy";
  };
  transitionType: SpatialTransitionKind;
};

/**
 * 佛道自然三套完全独立的空间漫游图谱（未来可平滑对接 3D 引擎）：
 * - 佛教路径：山门 -> 大雄宝殿 -> 地藏殿 -> 观音殿 -> 净土极乐 -> 文化长廊
 * - 道教路径：仙山远眺 -> 道观山门 -> 三清殿 -> 玉皇殿 -> 老君殿 -> 道教文化廊
 * - 自然静修路径：流水 -> 竹雨 -> 松风 -> 平湖 -> 云海 -> 星空
 */
export const SPATIAL_GRAPH: Record<string, SpatialNode> = {
  // ==================== 佛教梵境空间路径 ====================
  "buddhist-gate": {
    sceneId: "buddhist-gate",
    masterNodeId: "temple-gate",
    realm: "buddhist",
    title: "山门初入",
    subtitle: "石阶钟声 · 红墙古柏",
    coordinates: { x: 0, y: 0, z: 0 },
    entrances: ["mountain-trail"],
    exits: ["buddhist-daxiong"],
    connections: [
      {
        targetSceneId: "buddhist-daxiong",
        label: "沿石阶向前 · 大雄宝殿",
        direction: "forward",
        transitionType: "push-in",
        pathId: "path-courtyard-to-daxiong",
        pathType: "main-flagstone",
        walkDurationMs: 17600,
      },
      {
        targetSceneId: "buddhist-culture",
        label: "步向东侧 · 禅院文化廊",
        direction: "right",
        transitionType: "lateral-right",
        pathId: "path-right-corridor-to-cangjing",
        pathType: "courtyard-link",
        walkDurationMs: 12800,
      },
    ],
    audioConfig: {
      ambient: "birds",
      religious: "buddhist",
      suggestedMusic: "guqin-zen",
    },
    visualConfig: {
      horizonYPercent: 52,
      parallaxStrength: 1.0,
      foregroundFrame: "temple-eaves",
    },
    transitionType: "push-in",
  },
  "buddhist-daxiong": {
    sceneId: "buddhist-daxiong",
    masterNodeId: "daxiong-hall",
    realm: "buddhist",
    title: "大雄宝殿",
    subtitle: "中轴主殿 · 庄严宏阔",
    coordinates: { x: 0, y: 0, z: 40 },
    entrances: ["buddhist-gate", "buddhist-dizang"],
    exits: ["buddhist-gate", "buddhist-dizang", "buddhist-guanyin"],
    connections: [
      {
        targetSceneId: "buddhist-gate",
        label: "回望山门广场",
        direction: "back",
        transitionType: "pull-back",
        pathId: "path-inner-to-main-courtyard",
        pathType: "main-flagstone",
        walkDurationMs: 12800,
      },
      {
        targetSceneId: "buddhist-dizang",
        label: "向左穿廊 · 地藏殿",
        direction: "left",
        transitionType: "lateral-left",
        pathId: "path-side-courtyard-to-dizang",
        pathType: "courtyard-link",
        walkDurationMs: 13600,
      },
      {
        targetSceneId: "buddhist-guanyin",
        label: "向右穿廊 · 观音殿",
        direction: "right",
        transitionType: "lateral-right",
        pathId: "path-left-corridor-to-guanyin",
        pathType: "corner-corridor",
        walkDurationMs: 13000,
      },
      {
        targetSceneId: "buddhist-pureland",
        label: "继续向前 · 净土极乐",
        direction: "forward",
        transitionType: "push-in",
        pathId: "path-side-courtyard-to-lotus-pond",
        pathType: "courtyard-link",
        walkDurationMs: 12000,
      },
    ],
    audioConfig: {
      ambient: "temple",
      religious: "buddhist",
      suggestedMusic: "minimal-pad",
    },
    visualConfig: {
      horizonYPercent: 50,
      parallaxStrength: 0.9,
      foregroundFrame: "temple-eaves",
    },
    transitionType: "push-in",
  },
  "buddhist-dizang": {
    sceneId: "buddhist-dizang",
    masterNodeId: "dizang-hall",
    realm: "buddhist",
    title: "地藏殿",
    subtitle: "厚德重檐 · 静思孝念",
    coordinates: { x: -32, y: 0, z: 52 },
    entrances: ["buddhist-daxiong"],
    exits: ["buddhist-daxiong", "buddhist-guanyin"],
    connections: [
      {
        targetSceneId: "buddhist-daxiong",
        label: "向右回廊 · 大雄宝殿",
        direction: "right",
        transitionType: "lateral-right",
        pathId: "path-right-corridor-to-side-courtyard",
        pathType: "corner-corridor",
        walkDurationMs: 12400,
      },
      {
        targetSceneId: "buddhist-guanyin",
        label: "穿庭而过 · 观音殿",
        direction: "forward",
        transitionType: "push-in",
        pathId: "path-left-corridor-to-guanyin",
        pathType: "corner-corridor",
        walkDurationMs: 13000,
      },
    ],
    audioConfig: {
      ambient: "temple",
      religious: "buddhist",
      suggestedMusic: "guqin-zen",
    },
    visualConfig: {
      horizonYPercent: 48,
      parallaxStrength: 0.9,
      foregroundFrame: "temple-eaves",
    },
    transitionType: "lateral-left",
  },
  "buddhist-guanyin": {
    sceneId: "buddhist-guanyin",
    masterNodeId: "guanyin-hall",
    realm: "buddhist",
    title: "观音殿",
    subtitle: "静雅别院 · 清莲慈照",
    coordinates: { x: 32, y: 0, z: 52 },
    entrances: ["buddhist-daxiong", "buddhist-dizang"],
    exits: ["buddhist-daxiong", "buddhist-pureland"],
    connections: [
      {
        targetSceneId: "buddhist-daxiong",
        label: "向左回廊 · 大雄宝殿",
        direction: "left",
        transitionType: "lateral-left",
        pathId: "path-courtyard-to-left-corridor",
        pathType: "corridor",
        walkDurationMs: 11200,
      },
      {
        targetSceneId: "buddhist-pureland",
        label: "向前穿庭 · 净土极乐",
        direction: "forward",
        transitionType: "push-in",
        pathId: "path-side-courtyard-to-lotus-pond",
        pathType: "courtyard-link",
        walkDurationMs: 12000,
      },
    ],
    audioConfig: {
      ambient: "stream",
      religious: "buddhist",
      suggestedMusic: "guqin-zen",
    },
    visualConfig: {
      horizonYPercent: 49,
      parallaxStrength: 0.95,
      foregroundFrame: "temple-eaves",
    },
    transitionType: "lateral-right",
  },
  "buddhist-pureland": {
    sceneId: "buddhist-pureland",
    masterNodeId: "lotus-pond",
    realm: "buddhist",
    title: "西方极乐静境",
    subtitle: "莲池亭台 · 光华清净",
    coordinates: { x: 0, y: 2, z: 92 },
    entrances: ["buddhist-daxiong", "buddhist-guanyin"],
    exits: ["buddhist-guanyin", "buddhist-culture"],
    connections: [
      {
        targetSceneId: "buddhist-guanyin",
        label: "退回观音莲庭",
        direction: "back",
        transitionType: "pull-back",
        pathId: "path-left-corridor-to-guanyin",
        pathType: "corner-corridor",
        walkDurationMs: 13000,
      },
      {
        targetSceneId: "buddhist-culture",
        label: "漫步前往 · 禅院文化廊",
        direction: "right",
        transitionType: "lateral-right",
        pathId: "path-right-corridor-to-cangjing",
        pathType: "courtyard-link",
        walkDurationMs: 12800,
      },
    ],
    audioConfig: {
      ambient: "temple",
      religious: "buddhist",
      suggestedMusic: "minimal-pad",
    },
    visualConfig: {
      horizonYPercent: 52,
      parallaxStrength: 1.0,
      foregroundFrame: "temple-eaves",
    },
    transitionType: "push-in",
  },
  "buddhist-culture": {
    sceneId: "buddhist-culture",
    masterNodeId: "cangjing-library",
    realm: "buddhist",
    title: "寺院建筑文化与历史",
    subtitle: "飞檐斗拱 · 古刹文脉",
    coordinates: { x: 46, y: 0, z: 26 },
    entrances: ["buddhist-gate", "buddhist-pureland"],
    exits: ["buddhist-gate", "buddhist-daxiong"],
    connections: [
      {
        targetSceneId: "buddhist-gate",
        label: "返回山门广场",
        direction: "left",
        transitionType: "lateral-left",
        pathId: "path-gate-to-inner-courtyard",
        pathType: "main-flagstone",
        walkDurationMs: 14500,
      },
      {
        targetSceneId: "buddhist-daxiong",
        label: "向前走入 · 大雄宝殿",
        direction: "forward",
        transitionType: "push-in",
        pathId: "path-courtyard-to-daxiong",
        pathType: "main-flagstone",
        walkDurationMs: 17600,
      },
    ],
    audioConfig: {
      ambient: "rain",
      religious: "buddhist",
      suggestedMusic: "guqin-zen",
    },
    visualConfig: {
      horizonYPercent: 50,
      parallaxStrength: 1.0,
      foregroundFrame: "temple-eaves",
    },
    transitionType: "lateral-right",
  },

  // ==================== 道教仙境空间路径 ====================
  "daoist-mountain": {
    sceneId: "daoist-mountain",
    realm: "daoist",
    title: "仙山远眺",
    subtitle: "松风谷雾 · 登临问道",
    coordinates: { x: 0, y: -4, z: 0 },
    entrances: ["mountain-trail"],
    exits: ["daoist-gate"],
    connections: [
      {
        targetSceneId: "daoist-gate",
        label: "踏云拾级 · 步向道观山门",
        direction: "forward",
        transitionType: "push-in",
      },
      {
        targetSceneId: "daoist-sanqing",
        label: "直抵中庭 · 三清殿",
        direction: "right",
        transitionType: "mist-glide",
      },
    ],
    audioConfig: {
      ambient: "pine",
      religious: "daoist",
      suggestedMusic: "mountain-stream-score",
    },
    visualConfig: {
      horizonYPercent: 48,
      parallaxStrength: 1.15,
      foregroundFrame: "mountain-pine",
    },
    transitionType: "push-in",
  },
  "daoist-gate": {
    sceneId: "daoist-gate",
    realm: "daoist",
    title: "道观山门",
    subtitle: "石阶凌云 · 道法自然",
    coordinates: { x: 0, y: 0, z: 32 },
    entrances: ["daoist-mountain"],
    exits: ["daoist-mountain", "daoist-sanqing"],
    connections: [
      {
        targetSceneId: "daoist-mountain",
        label: "回望仙山云海",
        direction: "back",
        transitionType: "pull-back",
      },
      {
        targetSceneId: "daoist-sanqing",
        label: "穿过山门 · 三清殿",
        direction: "forward",
        transitionType: "push-in",
      },
      {
        targetSceneId: "daoist-culture",
        label: "转入东庑 · 道教文化廊",
        direction: "right",
        transitionType: "lateral-right",
      },
    ],
    audioConfig: {
      ambient: "wind",
      religious: "daoist",
      suggestedMusic: "guqin-zen",
    },
    visualConfig: {
      horizonYPercent: 52,
      parallaxStrength: 1.05,
      foregroundFrame: "mountain-pine",
    },
    transitionType: "push-in",
  },
  "daoist-sanqing": {
    sceneId: "daoist-sanqing",
    realm: "daoist",
    title: "三清殿",
    subtitle: "清静古柏 · 山观主庭",
    coordinates: { x: 0, y: 2, z: 68 },
    entrances: ["daoist-gate"],
    exits: ["daoist-gate", "daoist-yuhuang", "daoist-laojun"],
    connections: [
      {
        targetSceneId: "daoist-gate",
        label: "退步回望 · 道观山门",
        direction: "back",
        transitionType: "pull-back",
      },
      {
        targetSceneId: "daoist-yuhuang",
        label: "向左登高 · 玉皇殿",
        direction: "left",
        transitionType: "lateral-left",
      },
      {
        targetSceneId: "daoist-laojun",
        label: "向右寻幽 · 老君殿",
        direction: "right",
        transitionType: "lateral-right",
      },
    ],
    audioConfig: {
      ambient: "daoist",
      religious: "daoist",
      suggestedMusic: "guqin-zen",
    },
    visualConfig: {
      horizonYPercent: 50,
      parallaxStrength: 0.95,
      foregroundFrame: "mountain-pine",
    },
    transitionType: "push-in",
  },
  "daoist-yuhuang": {
    sceneId: "daoist-yuhuang",
    realm: "daoist",
    title: "玉皇殿",
    subtitle: "高崖碧瓦 · 云霭缭绕",
    coordinates: { x: -34, y: 8, z: 96 },
    entrances: ["daoist-sanqing"],
    exits: ["daoist-sanqing", "daoist-laojun"],
    connections: [
      {
        targetSceneId: "daoist-sanqing",
        label: "向右回庭 · 三清殿",
        direction: "right",
        transitionType: "lateral-right",
      },
      {
        targetSceneId: "daoist-laojun",
        label: "沿崖穿行 · 老君殿",
        direction: "forward",
        transitionType: "mist-glide",
      },
    ],
    audioConfig: {
      ambient: "wind",
      religious: "daoist",
      suggestedMusic: "minimal-pad",
    },
    visualConfig: {
      horizonYPercent: 46,
      parallaxStrength: 1.05,
      foregroundFrame: "mountain-pine",
    },
    transitionType: "lateral-left",
  },
  "daoist-laojun": {
    sceneId: "daoist-laojun",
    realm: "daoist",
    title: "老君殿",
    subtitle: "苍松翠石 · 无为恬淡",
    coordinates: { x: 34, y: 4, z: 96 },
    entrances: ["daoist-sanqing", "daoist-yuhuang"],
    exits: ["daoist-sanqing", "daoist-culture"],
    connections: [
      {
        targetSceneId: "daoist-sanqing",
        label: "向左回庭 · 三清殿",
        direction: "left",
        transitionType: "lateral-left",
      },
      {
        targetSceneId: "daoist-culture",
        label: "步入竹影 · 道教文化廊",
        direction: "forward",
        transitionType: "push-in",
      },
    ],
    audioConfig: {
      ambient: "pine",
      religious: "daoist",
      suggestedMusic: "guqin-zen",
    },
    visualConfig: {
      horizonYPercent: 50,
      parallaxStrength: 1.0,
      foregroundFrame: "mountain-pine",
    },
    transitionType: "lateral-right",
  },
  "daoist-culture": {
    sceneId: "daoist-culture",
    realm: "daoist",
    title: "道教文化与宫观建筑",
    subtitle: "仙山长廊 · 古籍源流",
    coordinates: { x: 48, y: 0, z: 44 },
    entrances: ["daoist-gate", "daoist-laojun"],
    exits: ["daoist-gate", "daoist-sanqing"],
    connections: [
      {
        targetSceneId: "daoist-gate",
        label: "返回道观山门",
        direction: "left",
        transitionType: "lateral-left",
      },
      {
        targetSceneId: "daoist-sanqing",
        label: "漫步前往 · 三清殿",
        direction: "forward",
        transitionType: "push-in",
      },
    ],
    audioConfig: {
      ambient: "stream",
      religious: "daoist",
      suggestedMusic: "guqin-zen",
    },
    visualConfig: {
      horizonYPercent: 50,
      parallaxStrength: 1.0,
      foregroundFrame: "mountain-pine",
    },
    transitionType: "lateral-right",
  },

  // ==================== 自然静修山林路径 ====================
  "retreat-nature-stream": {
    sceneId: "retreat-nature-stream",
    realm: "nature",
    title: "山间流水",
    subtitle: "清泉石上 · 潺潺水韵",
    coordinates: { x: 0, y: 0, z: 0 },
    entrances: ["trail-start"],
    exits: ["retreat-nature-bamboo-rain"],
    connections: [
      {
        targetSceneId: "retreat-nature-bamboo-rain",
        label: "沿溪漫步 · 雨落竹林",
        direction: "forward",
        transitionType: "push-in",
      },
      {
        targetSceneId: "retreat-nature-lake",
        label: "顺流而下 · 湖畔静坐",
        direction: "right",
        transitionType: "lateral-right",
      },
    ],
    audioConfig: {
      ambient: "stream",
      religious: "none",
      suggestedMusic: "mountain-stream-score",
    },
    visualConfig: {
      horizonYPercent: 52,
      parallaxStrength: 1.15,
      foregroundFrame: "mist-canopy",
    },
    transitionType: "push-in",
  },
  "retreat-nature-bamboo-rain": {
    sceneId: "retreat-nature-bamboo-rain",
    realm: "nature",
    title: "雨落竹林",
    subtitle: "翠竹听雨 · 清凉雾气",
    coordinates: { x: 0, y: 2, z: 36 },
    entrances: ["retreat-nature-stream"],
    exits: ["retreat-nature-stream", "retreat-nature-pine-wind"],
    connections: [
      {
        targetSceneId: "retreat-nature-stream",
        label: "退回溪畔 · 山间流水",
        direction: "back",
        transitionType: "pull-back",
      },
      {
        targetSceneId: "retreat-nature-pine-wind",
        label: "穿过竹径 · 松林风声",
        direction: "forward",
        transitionType: "push-in",
      },
    ],
    audioConfig: {
      ambient: "bamboo-rain",
      religious: "none",
      suggestedMusic: "minimal-pad",
    },
    visualConfig: {
      horizonYPercent: 50,
      parallaxStrength: 1.2,
      foregroundFrame: "mist-canopy",
    },
    transitionType: "push-in",
  },
  "retreat-nature-pine-wind": {
    sceneId: "retreat-nature-pine-wind",
    realm: "nature",
    title: "松林风声",
    subtitle: "万壑松涛 · 山风清朗",
    coordinates: { x: 0, y: 6, z: 72 },
    entrances: ["retreat-nature-bamboo-rain"],
    exits: ["retreat-nature-bamboo-rain", "retreat-nature-lake"],
    connections: [
      {
        targetSceneId: "retreat-nature-bamboo-rain",
        label: "回望翠竹林",
        direction: "back",
        transitionType: "pull-back",
      },
      {
        targetSceneId: "retreat-nature-lake",
        label: "出林见水 · 湖畔静坐",
        direction: "forward",
        transitionType: "push-in",
      },
    ],
    audioConfig: {
      ambient: "pine",
      religious: "none",
      suggestedMusic: "guqin-zen",
    },
    visualConfig: {
      horizonYPercent: 52,
      parallaxStrength: 1.15,
      foregroundFrame: "mountain-pine",
    },
    transitionType: "push-in",
  },
  "retreat-nature-lake": {
    sceneId: "retreat-nature-lake",
    realm: "nature",
    title: "湖畔静坐",
    subtitle: "明镜平湖 · 岸边微澜",
    coordinates: { x: 24, y: 4, z: 108 },
    entrances: ["retreat-nature-pine-wind"],
    exits: ["retreat-nature-pine-wind", "retreat-nature-cloud-view"],
    connections: [
      {
        targetSceneId: "retreat-nature-pine-wind",
        label: "退回松林小径",
        direction: "back",
        transitionType: "pull-back",
      },
      {
        targetSceneId: "retreat-nature-cloud-view",
        label: "登高远眺 · 云海观景",
        direction: "forward",
        transitionType: "mist-glide",
      },
    ],
    audioConfig: {
      ambient: "lake",
      religious: "none",
      suggestedMusic: "minimal-pad",
    },
    visualConfig: {
      horizonYPercent: 54,
      parallaxStrength: 1.05,
      foregroundFrame: "mist-canopy",
    },
    transitionType: "push-in",
  },
  "retreat-nature-cloud-view": {
    sceneId: "retreat-nature-cloud-view",
    realm: "nature",
    title: "云海观景",
    subtitle: "高远山巅 · 无垠云涛",
    coordinates: { x: 0, y: 14, z: 148 },
    entrances: ["retreat-nature-lake"],
    exits: ["retreat-nature-lake", "retreat-nature-starlight"],
    connections: [
      {
        targetSceneId: "retreat-nature-lake",
        label: "下行返湖 · 湖畔静坐",
        direction: "back",
        transitionType: "pull-back",
      },
      {
        targetSceneId: "retreat-nature-starlight",
        label: "入夜守静 · 星空静心",
        direction: "forward",
        transitionType: "mist-glide",
      },
    ],
    audioConfig: {
      ambient: "clouds",
      religious: "none",
      suggestedMusic: "minimal-pad",
    },
    visualConfig: {
      horizonYPercent: 50,
      parallaxStrength: 1.2,
      foregroundFrame: "mist-canopy",
    },
    transitionType: "mist-glide",
  },
  "retreat-nature-starlight": {
    sceneId: "retreat-nature-starlight",
    realm: "nature",
    title: "星空静心",
    subtitle: "深夜微星 · 静谧夜色",
    coordinates: { x: 0, y: 16, z: 180 },
    entrances: ["retreat-nature-cloud-view"],
    exits: ["retreat-nature-cloud-view", "retreat-nature-stream"],
    connections: [
      {
        targetSceneId: "retreat-nature-cloud-view",
        label: "回望云海暮色",
        direction: "back",
        transitionType: "pull-back",
      },
      {
        targetSceneId: "retreat-nature-stream",
        label: "拂晓巡环 · 山间流水",
        direction: "right",
        transitionType: "mist-glide",
      },
    ],
    audioConfig: {
      ambient: "night",
      religious: "none",
      suggestedMusic: "sleep-drift",
    },
    visualConfig: {
      horizonYPercent: 48,
      parallaxStrength: 1.0,
      foregroundFrame: "mist-canopy",
    },
    transitionType: "mist-glide",
  },
};

export function getSpatialNode(sceneId: string): SpatialNode | undefined {
  return SPATIAL_GRAPH[sceneId];
}
