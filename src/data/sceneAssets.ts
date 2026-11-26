import daxiongSeqStepsImg from "@/assets/images/daxiong_seq_steps_1795723641350.jpg";
import daxiongSeqApproachImg from "@/assets/images/daxiong_seq_approach_v2_1795723997946.jpg";
import daxiongSeqDoorwayImg from "@/assets/images/daxiong_seq_doorway_final_1795723658008.jpg";
import daxiongSeqNaveImg from "@/assets/images/daxiong_seq_nave_1795723621058.jpg";
import type {
  AssetReadinessStatus,
} from "@/data/templeMasterPlan";
import {
  ALL_SCENES_BY_ID,
  type SceneAudioConfig,
  type SceneConfig,
  type SceneInteractionConfig,
} from "@/data/scenes";

export type WalkSurfaceKind = "stone" | "wood" | "jinzhuan" | "earth";

export type WalkWaypointFrame = {
  id: string;
  stageTitle: string;
  image: string;
  /** Progress anchor in [0, 1] along forward entry sequence */
  anchorT: number;
  /** Horizontal & vertical vanishing point in GLSL UV space (0..1, bottom-up y) */
  vanishingX: number;
  horizonY: number;
  /** Opening corridor where depth advances smoothly without side wall stretch */
  portalHalfW: number;
  portalTopY: number;
  portalBotY: number;
  /** Flanking foreground parallax strength */
  flankPower: number;
  /** Subtle step elevation bias when climbing stairs / crossing sill */
  stepElevation: number;
  /** Acoustic surface underfoot around this waypoint */
  surface: WalkSurfaceKind;
  /** Doorframe peripheral occlusion intensity around doorway passage */
  doorOcclusion: number;
  /** Indoor sanctuary warm lighting balance (0 outdoor morning -> 1 warm interior) */
  interiorWarmth: number;
};

export type SceneAssetType =
  | "buddhist-hall"
  | "buddhist-gate"
  | "daoist-hall"
  | "daoist-gate"
  | "nature-retreat";

export type ArchitecturalIdentitySpec = {
  /** 建筑主体木构与柱础形制 */
  architectureStyle: string;
  /** 屋顶与屋檐形制 */
  roofAndEaves: string;
  /** 木柱材质与色彩 */
  columns: string;
  /** 门框、门扇与门槛结构 */
  doorwayAndThreshold: string;
  /** 庭院石板、石阶与殿内地面材质 */
  groundAndSteps: string;
  /** 室内固定主尊造像 */
  buddhaStatue: string;
  /** 室内固定传统供桌（及桌面对齐比例锁定） */
  altarTable: string;
  /** 光影方向与色温规范 */
  lightingAndTone: string;
  /** 镜头视线高度与画幅标准 */
  cameraSpec: string;
};

export const DAXIONG_ARCHITECTURAL_IDENTITY: ArchitecturalIdentitySpec = {
  architectureStyle:
    "传统中国佛教寺院中轴对称木构主殿，庄严古朴、真实比例、不过度浮夸装饰",
  roofAndEaves:
    "重檐青灰琉璃瓦传统屋顶配稳重斗拱挑檐，正中悬黑底金字「大雄寶殿」匾额",
  columns: "深红褐色原木立柱配白石柱础，室内外柱网中轴对齐",
  doorwayAndThreshold:
    "中央完全敞开宽阔双开雕花木门，红褐色实木门框配低矮实木门槛（门槛）",
  groundAndSteps:
    "庭院天然青石板铺装、花岗岩礼佛石阶、殿内哑光深灰金砖地面一脉相承",
  buddhaStatue:
    "大殿正中莲台固定供奉释迦牟尼佛金身坐像，全流程中轴位置与比例恒定不变",
  altarTable:
    "佛像前方固定安放传统深色紫檀翘头供桌（桌面基准区 35.5%–64.5% / 底沿 29.2%）",
  lightingAndTone:
    "自然山林晨光自右前上方洒入庭院，经敞开殿门柔和过渡至殿内清净自然暖光",
  cameraSpec:
    "16:9 宽屏真实摄影视角，自然成人平视视线高度（约 1.64m），无低多边形或夸张特效",
};

export const BUDDHIST_SCENE_TO_MASTER_NODE: Record<string, string> = {
  "buddhist-gate": "temple-gate",
  "buddhist-daxiong": "daxiong-hall",
  "buddhist-guanyin": "guanyin-hall",
  "buddhist-dizang": "dizang-hall",
  "buddhist-pureland": "lotus-pond",
  "buddhist-culture": "cangjing-library",
};

const MASTER_NODE_OUTGOING_PATHS: Record<string, string[]> = {
  "temple-gate": ["path-gate-to-inner-courtyard"],
  "daxiong-hall": ["path-daxiong-to-side-courtyard"],
  "guanyin-hall": ["path-left-corridor-to-guanyin"],
  "dizang-hall": ["path-side-courtyard-to-dizang"],
  "lotus-pond": ["path-lotus-to-waterside", "path-lotus-to-bamboo"],
  "cangjing-library": ["path-right-corridor-to-cangjing"],
};

export type SceneAssetManifest = {
  sceneId: string;
  sceneName: string;
  sceneType: SceneAssetType;
  /** 对应 V3.0 数字寺院总体规划空间节点 ID */
  masterNodeId?: string;
  /** 资产就绪状态（未制作完整序列的节点严禁虚标） */
  assetStatus: AssetReadinessStatus;
  /** 规划中关联的连接路径 ID 列表 */
  plannedOutgoingPathIds?: string[];
  /** 可选 360° 全景扩展说明 */
  panoramaOptionalSpec?: string;
  /** 庭院 / 外观主视觉素材 */
  primaryVisual: string;
  /** 殿内 / 稳定场景互动视觉素材 */
  stableSceneVisual: string;
  /** 加载异常备用视觉素材 */
  fallbackVisual: string;
  /** 统一建筑视觉身份规范（确保所有序列阶段同属一座建筑） */
  visualIdentity?: ArchitecturalIdentitySpec;
  /** 连续视角进入序列素材（统一建筑视觉身份） */
  entrySequence: WalkWaypointFrame[];
  /** 统一音频配置 */
  audioProfile: SceneAudioConfig & {
    tradition: "buddhist" | "daoist" | "nature";
  };
  /** 缓步动画节奏与步距配置 */
  animationProfile: {
    enterDurationMs: number;
    exitDurationMs: number;
    courtyardDurationMs: number;
    strideMeters: number;
    virtualDistanceMeters: number;
  };
  /** 殿内互动配置 */
  interactionConfig: SceneInteractionConfig;
};

/**
 * 大雄宝殿旗舰样板路线连续视觉序列（严格同一座建筑、同一中轴、同一光线材质体系）：
 * 庭院青石中轴 -> 登阶过铜炉 -> 白石月台牌匾前 -> 廊下雕花门框与门槛 -> 跨槛步入殿内中道 -> 正对供桌佛像停稳
 */
export function buildDaxiongEntrySequence(
  exteriorImage: string,
  interiorImage: string,
): WalkWaypointFrame[] {
  return [
    {
      id: "daxiong-k0-courtyard",
      stageTitle: "庭院起始",
      image: exteriorImage,
      anchorT: 0.0,
      vanishingX: 0.5,
      horizonY: 0.53,
      portalHalfW: 0.09,
      portalTopY: 0.58,
      portalBotY: 0.34,
      flankPower: 0.95,
      stepElevation: 0.0,
      surface: "stone",
      doorOcclusion: 0.0,
      interiorWarmth: 0.0,
    },
    {
      id: "daxiong-k1-steps",
      stageTitle: "开始缓步",
      image: daxiongSeqStepsImg,
      anchorT: 0.22,
      vanishingX: 0.5,
      horizonY: 0.53,
      portalHalfW: 0.12,
      portalTopY: 0.62,
      portalBotY: 0.32,
      flankPower: 1.08,
      stepElevation: 0.35,
      surface: "stone",
      doorOcclusion: 0.06,
      interiorWarmth: 0.14,
    },
    {
      id: "daxiong-k2-approach",
      stageTitle: "接近大殿",
      image: daxiongSeqApproachImg,
      anchorT: 0.45,
      vanishingX: 0.5,
      horizonY: 0.5,
      portalHalfW: 0.18,
      portalTopY: 0.66,
      portalBotY: 0.24,
      flankPower: 1.18,
      stepElevation: 0.72,
      surface: "stone",
      doorOcclusion: 0.22,
      interiorWarmth: 0.34,
    },
    {
      id: "daxiong-k3-doorway",
      stageTitle: "接近门口 · 穿越门洞",
      image: daxiongSeqDoorwayImg,
      anchorT: 0.65,
      vanishingX: 0.5,
      horizonY: 0.49,
      portalHalfW: 0.3,
      portalTopY: 0.78,
      portalBotY: 0.14,
      flankPower: 1.38,
      stepElevation: 0.96,
      surface: "wood",
      doorOcclusion: 0.88,
      interiorWarmth: 0.64,
    },
    {
      id: "daxiong-k4-nave",
      stageTitle: "进入殿内",
      image: daxiongSeqNaveImg,
      anchorT: 0.84,
      vanishingX: 0.5,
      horizonY: 0.49,
      portalHalfW: 0.36,
      portalTopY: 0.86,
      portalBotY: 0.12,
      flankPower: 1.06,
      stepElevation: 1.0,
      surface: "jinzhuan",
      doorOcclusion: 0.16,
      interiorWarmth: 0.94,
    },
    {
      id: "daxiong-k5-altar",
      stageTitle: "稳步停立",
      image: interiorImage,
      anchorT: 1.0,
      vanishingX: 0.5,
      horizonY: 0.49,
      portalHalfW: 0.4,
      portalTopY: 0.88,
      portalBotY: 0.12,
      flankPower: 0.85,
      stepElevation: 1.0,
      surface: "jinzhuan",
      doorOcclusion: 0.0,
      interiorWarmth: 1.0,
    },
  ];
}

function createSceneManifest(scene: SceneConfig): SceneAssetManifest {
  const isDaoist = scene.religionType === "daoist";
  const sceneType: SceneAssetType = !scene.hasInterior
    ? isDaoist
      ? "daoist-gate"
      : "buddhist-gate"
    : isDaoist
      ? "daoist-hall"
      : "buddhist-hall";

  const entrySequence: WalkWaypointFrame[] =
    scene.sceneId === "buddhist-daxiong"
      ? buildDaxiongEntrySequence(scene.exteriorImage, scene.mainImage)
      : scene.hasInterior
        ? [
            {
              id: `${scene.sceneId}-exterior`,
              stageTitle: "庭院起始",
              image: scene.exteriorImage,
              anchorT: 0,
              vanishingX: 0.5,
              horizonY: 0.52,
              portalHalfW: 0.14,
              portalTopY: 0.62,
              portalBotY: 0.28,
              flankPower: 1.05,
              stepElevation: 0,
              surface: "stone",
              doorOcclusion: 0.15,
              interiorWarmth: 0.1,
            },
            {
              id: `${scene.sceneId}-interior`,
              stageTitle: "步入殿内",
              image: scene.mainImage,
              anchorT: 1,
              vanishingX: 0.5,
              horizonY: 0.49,
              portalHalfW: 0.36,
              portalTopY: 0.84,
              portalBotY: 0.14,
              flankPower: 0.9,
              stepElevation: 1,
              surface: "jinzhuan",
              doorOcclusion: 0,
              interiorWarmth: 1,
            },
          ]
        : [
            {
              id: `${scene.sceneId}-exterior`,
              stageTitle: "山门瞻望",
              image: scene.exteriorImage,
              anchorT: 0,
              vanishingX: 0.5,
              horizonY: 0.52,
              portalHalfW: 0.2,
              portalTopY: 0.72,
              portalBotY: 0.2,
              flankPower: 0.95,
              stepElevation: 0,
              surface: "stone",
              doorOcclusion: 0,
              interiorWarmth: 0,
            },
          ];

  const masterNodeId = BUDDHIST_SCENE_TO_MASTER_NODE[scene.sceneId];
  const assetStatus: AssetReadinessStatus =
    scene.sceneId === "buddhist-daxiong"
      ? "verified-sequence"
      : "single-frame-pending-sequence";

  return {
    sceneId: scene.sceneId,
    sceneName: scene.sceneName,
    sceneType,
    masterNodeId,
    assetStatus,
    plannedOutgoingPathIds: masterNodeId
      ? MASTER_NODE_OUTGOING_PATHS[masterNodeId]
      : undefined,
    panoramaOptionalSpec:
      scene.sceneId === "buddhist-daxiong"
        ? "殿内中轴供桌前 360° 全景预留位（可选）"
        : undefined,
    primaryVisual: scene.exteriorImage,
    stableSceneVisual: scene.mainImage,
    fallbackVisual: scene.backgroundImage,
    visualIdentity:
      scene.sceneId === "buddhist-daxiong"
        ? DAXIONG_ARCHITECTURAL_IDENTITY
        : undefined,
    entrySequence,
    audioProfile: {
      ...scene.audioConfig,
      tradition: isDaoist ? "daoist" : "buddhist",
    },
    animationProfile: {
      // 大雄宝殿 6 阶段缓步朝圣（约 17.6s 完成 22m 缓步入殿，速度约 1.25 m/s）
      enterDurationMs: scene.sceneId === "buddhist-daxiong" ? 17600 : 14200,
      exitDurationMs: scene.sceneId === "buddhist-daxiong" ? 15200 : 12600,
      courtyardDurationMs: 12400,
      strideMeters: 0.82,
      virtualDistanceMeters: scene.sceneId === "buddhist-daxiong" ? 22 : 16,
    },
    interactionConfig: scene.interactionConfig,
  };
}

export const SCENE_ASSET_REGISTRY: Record<string, SceneAssetManifest> =
  Object.fromEntries(
    Object.values(ALL_SCENES_BY_ID).map((scene) => [
      scene.sceneId,
      createSceneManifest(scene),
    ]),
  );

/**
 * 正式实景连续序列导入接口（供 Phase 2–6 审核定型后的 16:9 素材接入，无需改动渲染器）：
 * - 仅接受经过建筑一致性核验的 WalkWaypointFrame[]
 * - 自动更新 SCENE_ASSET_REGISTRY 中对应场景的 entrySequence 与就绪状态
 */
export const FORMAL_SEQUENCE_IMPORTS: Record<string, WalkWaypointFrame[]> = {};

export function registerFormalWalkSequence(
  sceneId: string,
  waypoints: WalkWaypointFrame[],
  options?: {
    visualIdentity?: ArchitecturalIdentitySpec;
    enterDurationMs?: number;
    exitDurationMs?: number;
  },
): boolean {
  const manifest = SCENE_ASSET_REGISTRY[sceneId];
  if (!manifest || waypoints.length < 2) return false;
  FORMAL_SEQUENCE_IMPORTS[sceneId] = waypoints;
  manifest.entrySequence = waypoints;
  manifest.assetStatus = "verified-sequence";
  if (options?.visualIdentity) {
    manifest.visualIdentity = options.visualIdentity;
  }
  if (options?.enterDurationMs) {
    manifest.animationProfile.enterDurationMs = options.enterDurationMs;
  }
  if (options?.exitDurationMs) {
    manifest.animationProfile.exitDurationMs = options.exitDurationMs;
  }
  return true;
}

export function getSceneAssetManifest(
  sceneId: string,
): SceneAssetManifest | undefined {
  return SCENE_ASSET_REGISTRY[sceneId];
}

export function buildWalkWaypointsForRequest(params: {
  sceneId: string;
  mode: "enter-hall" | "exit-hall" | "courtyard-walk" | "trail-walk";
  exteriorImage: string;
  interiorImage: string;
  targetImage?: string;
}): WalkWaypointFrame[] {
  const manifest = SCENE_ASSET_REGISTRY[params.sceneId];

  if (params.mode === "enter-hall" || params.mode === "exit-hall") {
    const seq =
      manifest && manifest.entrySequence.length >= 2
        ? manifest.entrySequence
        : [
            {
              id: `${params.sceneId}-start`,
              stageTitle: "庭院起始",
              image: params.exteriorImage,
              anchorT: 0,
              vanishingX: 0.5,
              horizonY: 0.52,
              portalHalfW: 0.14,
              portalTopY: 0.62,
              portalBotY: 0.28,
              flankPower: 1.05,
              stepElevation: 0,
              surface: "stone" as const,
              doorOcclusion: 0.15,
              interiorWarmth: 0.1,
            },
            {
              id: `${params.sceneId}-end`,
              stageTitle: "步入殿内",
              image: params.interiorImage,
              anchorT: 1,
              vanishingX: 0.5,
              horizonY: 0.49,
              portalHalfW: 0.36,
              portalTopY: 0.84,
              portalBotY: 0.14,
              flankPower: 0.9,
              stepElevation: 1,
              surface: "jinzhuan" as const,
              doorOcclusion: 0,
              interiorWarmth: 1,
            },
          ];

    if (params.mode === "exit-hall") {
      return [...seq].reverse().map((wp) => ({
        ...wp,
        anchorT: 1 - wp.anchorT,
      }));
    }
    return seq;
  }

  // Courtyard or nature trail transition: only uses current & target scene's own authentic visuals
  const destImg = params.targetImage || params.exteriorImage;
  const isNature = params.mode === "trail-walk";
  return [
    {
      id: `${params.sceneId}-depart`,
      stageTitle: isNature ? "林径起始" : "庭院起始",
      image: params.exteriorImage,
      anchorT: 0,
      vanishingX: 0.5,
      horizonY: 0.5,
      portalHalfW: 0.22,
      portalTopY: 0.72,
      portalBotY: 0.2,
      flankPower: 1.05,
      stepElevation: 0,
      surface: isNature ? "earth" : "stone",
      doorOcclusion: 0,
      interiorWarmth: 0,
    },
    {
      id: `${params.sceneId}-arrive`,
      stageTitle: isNature ? "渐入静境" : "抵达新殿",
      image: destImg,
      anchorT: 1,
      vanishingX: 0.5,
      horizonY: 0.51,
      portalHalfW: 0.24,
      portalTopY: 0.74,
      portalBotY: 0.2,
      flankPower: 0.95,
      stepElevation: 0,
      surface: isNature ? "earth" : "stone",
      doorOcclusion: 0,
      interiorWarmth: 0.05,
    },
  ];
}
