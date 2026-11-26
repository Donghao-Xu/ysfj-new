import type { SceneInteractionConfig } from "@/data/scenes";
import type { WalkSurfaceKind } from "@/data/sceneAssets";
import type { NatureSoundType, ReligiousAudioType, RetreatMusicTrackId } from "@/lib/audio";

export type TempleZone =
  | "entrance"
  | "core"
  | "hall"
  | "nature"
  | "connector";

export type TempleNodeType =
  | "mountain-entry"
  | "stone-stairway"
  | "temple-gate"
  | "courtyard"
  | "buddhist-hall"
  | "corridor"
  | "lotus-pond"
  | "bamboo-grove"
  | "mountain-trail"
  | "cloud-viewpoint"
  | "meditation-pavilion"
  | "waterside";

export type TemplePathType =
  | "main-flagstone"
  | "corridor"
  | "corner-corridor"
  | "forest-trail"
  | "bamboo-trail"
  | "stone-steps"
  | "gentle-slope"
  | "small-bridge"
  | "courtyard-link"
  | "waterside-path";

export type AssetReadinessStatus =
  | "verified-sequence"
  | "single-frame-pending-sequence"
  | "planned";

export type ShotChecklistSlot = {
  slotId: string;
  label: string;
  category:
    | "far-view"
    | "near-view"
    | "exterior"
    | "approach"
    | "doorway"
    | "pass-through"
    | "interior-entry"
    | "interior-stable"
    | "interactive"
    | "panorama-360"
    | "connector";
  aspectRatio: "16:9" | "equirectangular-2:1";
  status: "verified" | "pending-production";
  assetNote: string;
};

export type TempleAnimationLayer =
  | "cloud-mist"
  | "candle-flame"
  | "incense-smoke"
  | "water-ripple"
  | "foliage-sway"
  | "light-shadow"
  | "lotus-bloom"
  | "scene-transition"
  | "gentle-walk";

export type TempleMasterNode = {
  nodeId: string;
  nodeName: string;
  nodeType: TempleNodeType;
  zone: TempleZone;
  coordinates: { x: number; y: number; z: number };
  linkedSceneId?: string;
  assetStatus: AssetReadinessStatus;
  mainVisualSpec: string;
  panoramaOptionalSpec: string;
  enterVisualSpec: string;
  exitVisualSpec: string;
  fallbackVisualSpec: string;
  assetChecklist: ShotChecklistSlot[];
  audioProfile: {
    ambient: NatureSoundType;
    religious: ReligiousAudioType;
    suggestedMusic: RetreatMusicTrackId;
    ambientGainNote: string;
  };
  animationLayers: TempleAnimationLayer[];
  interactionConfig: SceneInteractionConfig & {
    allowGazeMeditation: boolean;
    allowBreathingGuide: boolean;
    allowSeatedTimer: boolean;
  };
  outgoingPathIds: string[];
};

export type TempleConnectionPath = {
  pathId: string;
  fromNodeId: string;
  toNodeId: string;
  label: string;
  pathType: TemplePathType;
  pathVisualSpec: string;
  requiredWaypoints: string[];
  assetStatus: "verified" | "pending-formal-assets";
  entryPerspective: string;
  exitPerspective: string;
  walkDurationMs: number;
  paceMetersPerSec: number;
  stepSurface: WalkSurfaceKind;
  audioTransitionRule: string;
  motionConfig: {
    strideMeters: number;
    depthParallax: boolean;
    foregroundOcclusion: boolean;
    forbidZoomOnly: true;
  };
  transitionRule: string;
};

export const V3_VISUAL_STANDARDS = {
  aspectRatio: "16:9",
  style: "中国传统山林佛寺真实摄影级写实影像，庄严、清净、古朴、优雅",
  forbidStyles: [
    "低多边形游戏3D模型拼接",
    "卡通/二次元/夸张特效",
    "整图简单放大缩小伪漫步",
    "不同建筑跨场景图片强行拼接",
    "不合理按钮直接瞬间跳切",
  ],
  consistencyLocks: [
    "同一建筑跨视角屋顶形制、飞檐瓦色完全一致",
    "红褐色/深木色柱网位置与柱础比例固定不变",
    "门框、雕花木门与门槛高低关系在入殿全程保持连续",
    "青石板庭院、花岗岩台阶与殿内金砖地面材质一脉相承",
    "佛像位置、供桌位置与尺寸比例恒定（不悬浮、不遮挡）",
    "自然光线方向与成人平视视线高度（1.64m）全程统一",
  ],
} as const;

export const TEMPLE_ZONE_LABELS: Record<TempleZone, string> = {
  entrance: "入口空间",
  core: "核心寺院",
  hall: "独立佛殿",
  nature: "自然静修",
  connector: "回廊与路径节点",
};

export const PATH_TYPE_LABELS: Record<TemplePathType, string> = {
  "main-flagstone": "主石板路",
  corridor: "回廊",
  "corner-corridor": "转角回廊",
  "forest-trail": "林间小路",
  "bamboo-trail": "竹林小路",
  "stone-steps": "石阶",
  "gentle-slope": "缓坡",
  "small-bridge": "小桥",
  "courtyard-link": "庭院连接",
  "waterside-path": "水边路径",
};

const NO_WORSHIP: TempleMasterNode["interactionConfig"] = {
  enableWorship: false,
  enableGongShou: false,
  enableWoodfish: false,
  enableWish: false,
  allowIncense: false,
  allowLamp: false,
  allowFlower: false,
  allowGazeMeditation: true,
  allowBreathingGuide: false,
  allowSeatedTimer: false,
};

const FULL_HALL_WORSHIP: TempleMasterNode["interactionConfig"] = {
  enableWorship: true,
  enableGongShou: false,
  enableWoodfish: true,
  enableWish: true,
  allowIncense: true,
  allowLamp: true,
  allowFlower: true,
  allowGazeMeditation: true,
  allowBreathingGuide: true,
  allowSeatedTimer: false,
};

export const TEMPLE_MASTER_NODES: Record<string, TempleMasterNode> = {
  // ==================== 1. 入口空间 ====================
  "mountain-forest-entry": {
    nodeId: "mountain-forest-entry",
    nodeName: "山林入口",
    nodeType: "mountain-entry",
    zone: "entrance",
    coordinates: { x: 0, y: -6, z: -48 },
    assetStatus: "planned",
    mainVisualSpec: "古松石径初入山林远眺山门全景（16:9 自然晨雾摄影级）",
    panoramaOptionalSpec: "山门外林荫松涛环视静态全景（预留）",
    enterVisualSpec: "林荫石径向山门石阶方向缓步推进序列",
    exitVisualSpec: "回望山麓云林退步序列",
    fallbackVisualSpec: "山林墨青渐变与古松线描架构占位",
    assetChecklist: [
      {
        slotId: "entry-far",
        label: "山林入口远景",
        category: "far-view",
        aspectRatio: "16:9",
        status: "pending-production",
        assetNote: "清晨山岚、青石起端与古松掩映下的山门远影",
      },
      {
        slotId: "entry-path",
        label: "上山石径连接视角",
        category: "connector",
        aspectRatio: "16:9",
        status: "pending-production",
        assetNote: "石径向山门前石阶延展的连续视线",
      },
    ],
    audioProfile: {
      ambient: "birds",
      religious: "buddhist",
      suggestedMusic: "guqin-zen",
      ambientGainNote: "松风鸟鸣为主，远传稀疏古刹暮钟",
    },
    animationLayers: ["cloud-mist", "foliage-sway", "light-shadow", "gentle-walk"],
    interactionConfig: { ...NO_WORSHIP, allowBreathingGuide: true },
    outgoingPathIds: ["path-entry-to-gate-steps"],
  },

  "gate-stone-steps": {
    nodeId: "gate-stone-steps",
    nodeName: "山门前石阶",
    nodeType: "stone-stairway",
    zone: "entrance",
    coordinates: { x: 0, y: -3, z: -24 },
    assetStatus: "planned",
    mainVisualSpec: "青石古阶拾级仰望山门正立面（16:9）",
    panoramaOptionalSpec: "无",
    enterVisualSpec: "沿花岗岩长阶稳步上行至山门前平台序列",
    exitVisualSpec: "沿石阶下行返望山林入口序列",
    fallbackVisualSpec: "青石阶渐变占位",
    assetChecklist: [
      {
        slotId: "gate-steps-up",
        label: "拾级仰望山门视角",
        category: "approach",
        aspectRatio: "16:9",
        status: "pending-production",
        assetNote: "1.64m 成人平视略仰角，古柏分列石栏两侧",
      },
      {
        slotId: "gate-steps-top",
        label: "石阶顶端平台近景",
        category: "near-view",
        aspectRatio: "16:9",
        status: "pending-production",
        assetNote: "衔接山门门外正面视角",
      },
    ],
    audioProfile: {
      ambient: "wind",
      religious: "buddhist",
      suggestedMusic: "guqin-zen",
      ambientGainNote: "风拂松枝渐清，脚步触石阶声清晰沉稳",
    },
    animationLayers: ["cloud-mist", "foliage-sway", "gentle-walk"],
    interactionConfig: NO_WORSHIP,
    outgoingPathIds: ["path-gate-steps-to-temple-gate", "path-gate-steps-to-entry"],
  },

  "temple-gate": {
    nodeId: "temple-gate",
    nodeName: "山门",
    nodeType: "temple-gate",
    zone: "entrance",
    coordinates: { x: 0, y: 0, z: 0 },
    linkedSceneId: "buddhist-gate",
    assetStatus: "single-frame-pending-sequence",
    mainVisualSpec: "中国传统寺院重檐三门木构山门正视图（16:9）",
    panoramaOptionalSpec: "山门内外广场可选 360° 全景（预留）",
    enterVisualSpec: "山门远景 -> 山门近景 -> 门外视角 -> 穿门视角 -> 门内视角",
    exitVisualSpec: "门内回退穿门返山门广场序列",
    fallbackVisualSpec: "现有 buddhist_cloud_gate 单帧外观仅作基础参照，Phase 2 制作统一五段序列",
    assetChecklist: [
      {
        slotId: "gate-far",
        label: "山门远景",
        category: "far-view",
        aspectRatio: "16:9",
        status: "pending-production",
        assetNote: "与主寺青灰琉璃瓦、深红木构同一建筑语言",
      },
      {
        slotId: "gate-near",
        label: "山门近景",
        category: "near-view",
        aspectRatio: "16:9",
        status: "pending-production",
        assetNote: "可见木门槛、斗拱匾额与门后内庭院",
      },
      {
        slotId: "gate-outside",
        label: "门外视角",
        category: "exterior",
        aspectRatio: "16:9",
        status: "pending-production",
        assetNote: "立于正门石阶前平视门洞",
      },
      {
        slotId: "gate-pass",
        label: "穿门视角",
        category: "pass-through",
        aspectRatio: "16:9",
        status: "pending-production",
        assetNote: "两侧朱门框与头顶门楣近景遮挡",
      },
      {
        slotId: "gate-inside",
        label: "门内视角",
        category: "interior-entry",
        aspectRatio: "16:9",
        status: "pending-production",
        assetNote: "穿门后正对山门内庭院与主石板中轴",
      },
    ],
    audioProfile: {
      ambient: "wind",
      religious: "buddhist",
      suggestedMusic: "guqin-zen",
      ambientGainNote: "山门松风配远殿微磬，穿门时有空间遮蔽感",
    },
    animationLayers: ["cloud-mist", "foliage-sway", "light-shadow", "scene-transition", "gentle-walk"],
    interactionConfig: NO_WORSHIP,
    outgoingPathIds: ["path-gate-to-inner-courtyard", "path-gate-to-steps"],
  },

  "inner-gate-courtyard": {
    nodeId: "inner-gate-courtyard",
    nodeName: "山门内庭院",
    nodeType: "courtyard",
    zone: "entrance",
    coordinates: { x: 0, y: 0, z: 20 },
    assetStatus: "planned",
    mainVisualSpec: "入山门后前庭石板广场与古柏对称格局（16:9）",
    panoramaOptionalSpec: "前庭环视全景（预留）",
    enterVisualSpec: "沿主石板路缓步望向主庭院与大雄宝殿远檐",
    exitVisualSpec: "回身返望山门背面门洞序列",
    fallbackVisualSpec: "前庭青石占位",
    assetChecklist: [
      {
        slotId: "inner-gate-axis",
        label: "前庭中轴视角",
        category: "exterior",
        aspectRatio: "16:9",
        status: "pending-production",
        assetNote: "青石中轴向主庭院铺展，远处大雄宝殿重檐初现",
      },
      {
        slotId: "inner-gate-link",
        label: "主石板路连接素材",
        category: "connector",
        aspectRatio: "16:9",
        status: "pending-production",
        assetNote: "前庭衔接主庭院连续中景帧",
      },
    ],
    audioProfile: {
      ambient: "birds",
      religious: "buddhist",
      suggestedMusic: "guqin-zen",
      ambientGainNote: "入寺后喧嚣褪去，仅闻树鸟与足下青石步音",
    },
    animationLayers: ["cloud-mist", "foliage-sway", "light-shadow", "gentle-walk"],
    interactionConfig: NO_WORSHIP,
    outgoingPathIds: ["path-inner-to-main-courtyard", "path-inner-to-temple-gate"],
  },

  // ==================== 2. 核心寺院空间 ====================
  "main-courtyard": {
    nodeId: "main-courtyard",
    nodeName: "主庭院",
    nodeType: "courtyard",
    zone: "core",
    coordinates: { x: 0, y: 0, z: 42 },
    assetStatus: "planned",
    mainVisualSpec: "主庭院中央青石广场、铜鼎香炉与两侧回廊、正前方大雄宝殿全景（16:9）",
    panoramaOptionalSpec: "主庭院中心 360° 全景（可选，串起大雄宝殿与左右回廊）",
    enterVisualSpec: "自山门内庭院步入主庭院并望向大雄宝殿白石月台",
    exitVisualSpec: "回返山门内庭院序列",
    fallbackVisualSpec: "主庭院青石与建筑轮廓占位",
    assetChecklist: [
      {
        slotId: "courtyard-far",
        label: "庭院远景",
        category: "far-view",
        aspectRatio: "16:9",
        status: "pending-production",
        assetNote: "涵盖左右回廊翼角与大雄宝殿全景",
      },
      {
        slotId: "courtyard-near",
        label: "庭院近景",
        category: "near-view",
        aspectRatio: "16:9",
        status: "pending-production",
        assetNote: "青石铺面、白石栏杆与古松局部",
      },
      {
        slotId: "courtyard-axis",
        label: "中央路径视角",
        category: "approach",
        aspectRatio: "16:9",
        status: "pending-production",
        assetNote: "直指大雄宝殿中央石阶与香炉",
      },
      {
        slotId: "courtyard-left",
        label: "庭院左侧视角（望左侧回廊）",
        category: "connector",
        aspectRatio: "16:9",
        status: "pending-production",
        assetNote: "同光线转向左侧朱柱长廊入口",
      },
      {
        slotId: "courtyard-right",
        label: "庭院右侧视角（望右侧回廊）",
        category: "connector",
        aspectRatio: "16:9",
        status: "pending-production",
        assetNote: "同光线转向右侧朱柱长廊与藏经阁侧路",
      },
    ],
    audioProfile: {
      ambient: "wind",
      religious: "buddhist",
      suggestedMusic: "minimal-pad",
      ambientGainNote: "开阔庭院晨风，可闻大殿微弱钟磬共鸣",
    },
    animationLayers: ["cloud-mist", "incense-smoke", "foliage-sway", "light-shadow", "gentle-walk"],
    interactionConfig: NO_WORSHIP,
    outgoingPathIds: [
      "path-courtyard-to-daxiong",
      "path-courtyard-to-left-corridor",
      "path-courtyard-to-right-corridor",
      "path-courtyard-to-inner-gate",
    ],
  },

  "daxiong-hall": {
    nodeId: "daxiong-hall",
    nodeName: "大雄宝殿",
    nodeType: "buddhist-hall",
    zone: "core",
    coordinates: { x: 0, y: 1, z: 68 },
    linkedSceneId: "buddhist-daxiong",
    assetStatus: "verified-sequence",
    mainVisualSpec: "大雄宝殿正面外观与殿内释迦牟尼佛主坛（已建立 6 关键帧统一建筑视觉序列）",
    panoramaOptionalSpec: "殿内中轴供桌前 360° 全景预留位（可选）",
    enterVisualSpec: "庭院起始 -> 登阶过铜炉 -> 月台牌匾前 -> 廊下敞开门框与门槛 -> 步入金砖中道 -> 正对供桌停稳",
    exitVisualSpec: "殿内金砖退步 -> 跨过木门槛 -> 步下月台石阶 -> 回返主庭院",
    fallbackVisualSpec: "大雄宝殿专属外观/内景稳定图",
    assetChecklist: [
      {
        slotId: "daxiong-exterior",
        label: "大殿外部",
        category: "exterior",
        aspectRatio: "16:9",
        status: "verified",
        assetNote: "已定型：daxiong_front_exterior_1795627359651.jpg",
      },
      {
        slotId: "daxiong-steps",
        label: "登阶过铜炉",
        category: "near-view",
        aspectRatio: "16:9",
        status: "verified",
        assetNote: "已定型：daxiong_seq_steps_1795723641350.jpg",
      },
      {
        slotId: "daxiong-approach",
        label: "接近大殿（无遮挡牌匾前）",
        category: "approach",
        aspectRatio: "16:9",
        status: "verified",
        assetNote: "已定型：daxiong_seq_approach_v2_1795723997946.jpg",
      },
      {
        slotId: "daxiong-doorway",
        label: "门口与门槛穿门",
        category: "doorway",
        aspectRatio: "16:9",
        status: "verified",
        assetNote: "已定型：daxiong_seq_doorway_final_1795723658008.jpg",
      },
      {
        slotId: "daxiong-nave",
        label: "殿内入口（金砖中道）",
        category: "interior-entry",
        aspectRatio: "16:9",
        status: "verified",
        assetNote: "已定型：daxiong_seq_nave_1795723621058.jpg",
      },
      {
        slotId: "daxiong-stable",
        label: "殿内稳定互动视角",
        category: "interior-stable",
        aspectRatio: "16:9",
        status: "verified",
        assetNote: "已定型：daxiong_altar_v2_1795630776095.jpg（供桌精确定位）",
      },
      {
        slotId: "daxiong-360",
        label: "可选 360° 全景",
        category: "panorama-360",
        aspectRatio: "equirectangular-2:1",
        status: "pending-production",
        assetNote: "预留未来殿内环顾全景扩展",
      },
    ],
    audioProfile: {
      ambient: "wind",
      religious: "buddhist",
      suggestedMusic: "minimal-pad",
      ambientGainNote: "室外晨风入殿后自然衰减 52%，佛教殿堂木鱼磬音渐入",
    },
    animationLayers: [
      "candle-flame",
      "incense-smoke",
      "lotus-bloom",
      "light-shadow",
      "scene-transition",
      "gentle-walk",
    ],
    interactionConfig: FULL_HALL_WORSHIP,
    outgoingPathIds: [
      "path-daxiong-to-side-courtyard",
      "path-daxiong-to-main-courtyard",
    ],
  },

  "left-corridor": {
    nodeId: "left-corridor",
    nodeName: "左侧回廊",
    nodeType: "corridor",
    zone: "connector",
    coordinates: { x: -24, y: 0, z: 50 },
    assetStatus: "planned",
    mainVisualSpec: "深红木柱青石地砖长廊，右侧露庭院天光，前方转角接观音殿院落（16:9）",
    panoramaOptionalSpec: "无",
    enterVisualSpec: "由主庭院左转步入长廊廊檐下",
    exitVisualSpec: "沿回廊转角步出至观音殿前院",
    fallbackVisualSpec: "朱柱长廊剪影占位",
    assetChecklist: [
      {
        slotId: "lcorr-long",
        label: "左侧长廊纵深",
        category: "connector",
        aspectRatio: "16:9",
        status: "pending-production",
        assetNote: "深红木柱列阵、卷棚木椽、青石走廊地砖",
      },
      {
        slotId: "lcorr-corner",
        label: "转角回廊衔接观音殿",
        category: "approach",
        aspectRatio: "16:9",
        status: "pending-production",
        assetNote: "90度转角光影过渡至观音殿清雅院落",
      },
    ],
    audioProfile: {
      ambient: "birds",
      religious: "buddhist",
      suggestedMusic: "guqin-zen",
      ambientGainNote: "半室外檐下回声与侧院泉鸟微响",
    },
    animationLayers: ["light-shadow", "foliage-sway", "gentle-walk"],
    interactionConfig: NO_WORSHIP,
    outgoingPathIds: ["path-left-corridor-to-guanyin", "path-left-corridor-to-courtyard"],
  },

  "right-corridor": {
    nodeId: "right-corridor",
    nodeName: "右侧回廊",
    nodeType: "corridor",
    zone: "connector",
    coordinates: { x: 24, y: 0, z: 50 },
    assetStatus: "planned",
    mainVisualSpec: "东侧朱柱长廊与漏窗花格，直通静谧侧院、藏经阁及地藏殿（16:9）",
    panoramaOptionalSpec: "无",
    enterVisualSpec: "自大雄宝殿或主庭院右转进入东廊",
    exitVisualSpec: "沿东廊转出侧院",
    fallbackVisualSpec: "东廊木构占位",
    assetChecklist: [
      {
        slotId: "rcorr-long",
        label: "右侧长廊纵深",
        category: "connector",
        aspectRatio: "16:9",
        status: "pending-production",
        assetNote: "与左侧回廊严格对称的木构比例与光线方向",
      },
      {
        slotId: "rcorr-corner",
        label: "转角连侧院",
        category: "connector",
        aspectRatio: "16:9",
        status: "pending-production",
        assetNote: "出廊衔接松柏侧院入口",
      },
    ],
    audioProfile: {
      ambient: "rain",
      religious: "buddhist",
      suggestedMusic: "guqin-zen",
      ambientGainNote: "廊下步声微响伴随古松清风",
    },
    animationLayers: ["light-shadow", "foliage-sway", "gentle-walk"],
    interactionConfig: NO_WORSHIP,
    outgoingPathIds: [
      "path-right-corridor-to-side-courtyard",
      "path-right-corridor-to-cangjing",
      "path-right-corridor-to-courtyard",
    ],
  },

  "side-courtyard": {
    nodeId: "side-courtyard",
    nodeName: "侧院（静谧别院）",
    nodeType: "courtyard",
    zone: "core",
    coordinates: { x: 28, y: 0, z: 72 },
    assetStatus: "planned",
    mainVisualSpec: "古松石灯掩映的幽静侧院，衔接大殿后路、地藏殿、莲池与竹林入口（16:9）",
    panoramaOptionalSpec: "侧院静谧环视全景（预留）",
    enterVisualSpec: "自大雄宝殿侧方或东回廊步入",
    exitVisualSpec: "分流前往地藏殿、莲池或竹林",
    fallbackVisualSpec: "侧院松影石庭占位",
    assetChecklist: [
      {
        slotId: "side-court-main",
        label: "侧院全景",
        category: "exterior",
        aspectRatio: "16:9",
        status: "pending-production",
        assetNote: "连接后山园林与地藏偏殿的安静枢纽",
      },
      {
        slotId: "side-court-garden-gate",
        label: "通往莲池/竹林月洞门",
        category: "connector",
        aspectRatio: "16:9",
        status: "pending-production",
        assetNote: "传统白墙灰瓦月洞门隔开殿院与园林",
      },
    ],
    audioProfile: {
      ambient: "stream",
      religious: "buddhist",
      suggestedMusic: "guqin-zen",
      ambientGainNote: "松风与远方水声交融",
    },
    animationLayers: ["cloud-mist", "foliage-sway", "light-shadow", "gentle-walk"],
    interactionConfig: { ...NO_WORSHIP, allowBreathingGuide: true },
    outgoingPathIds: [
      "path-side-courtyard-to-dizang",
      "path-side-courtyard-to-lotus-pond",
      "path-side-courtyard-to-bamboo",
      "path-side-courtyard-to-right-corridor",
    ],
  },

  // ==================== 3. 独立佛殿 ====================
  "guanyin-hall": {
    nodeId: "guanyin-hall",
    nodeName: "观音殿",
    nodeType: "buddhist-hall",
    zone: "hall",
    coordinates: { x: -34, y: 0, z: 68 },
    linkedSceneId: "buddhist-guanyin",
    assetStatus: "single-frame-pending-sequence",
    mainVisualSpec: "观音殿独立外观与观世音菩萨殿内礼敬空间（16:9，独立视觉素材严禁混用他殿）",
    panoramaOptionalSpec: "观音殿内 360° 预留",
    enterVisualSpec: "左回廊出口 -> 观音殿庭前 -> 门口穿门 -> 殿内稳定视角（Phase 5 正式序列）",
    exitVisualSpec: "殿内退步返左回廊连接点",
    fallbackVisualSpec: "观音殿专属外观/内景图",
    assetChecklist: [
      {
        slotId: "guanyin-ext",
        label: "观音殿外部",
        category: "exterior",
        aspectRatio: "16:9",
        status: "verified",
        assetNote: "现有独立外观：guanyin_front_exterior_1795627360318.jpg",
      },
      {
        slotId: "guanyin-entry",
        label: "观音殿入口与穿门序列",
        category: "doorway",
        aspectRatio: "16:9",
        status: "pending-production",
        assetNote: "Phase 5 补齐接近与穿门连续帧",
      },
      {
        slotId: "guanyin-int",
        label: "观音殿内与供桌互动视角",
        category: "interior-stable",
        aspectRatio: "16:9",
        status: "verified",
        assetNote: "现有独立内景：guanyin_altar_v2_1795630777155.jpg",
      },
    ],
    audioProfile: {
      ambient: "stream",
      religious: "buddhist",
      suggestedMusic: "guqin-zen",
      ambientGainNote: "净瓶清泉与慈柔磬声",
    },
    animationLayers: ["candle-flame", "incense-smoke", "lotus-bloom", "light-shadow", "gentle-walk"],
    interactionConfig: FULL_HALL_WORSHIP,
    outgoingPathIds: ["path-guanyin-to-left-corridor"],
  },

  "dizang-hall": {
    nodeId: "dizang-hall",
    nodeName: "地藏殿",
    nodeType: "buddhist-hall",
    zone: "hall",
    coordinates: { x: 38, y: 0, z: 68 },
    linkedSceneId: "buddhist-dizang",
    assetStatus: "single-frame-pending-sequence",
    mainVisualSpec: "地藏殿古松肃穆外观与地藏菩萨殿内礼敬空间（16:9，独立素材）",
    panoramaOptionalSpec: "地藏殿内 360° 预留",
    enterVisualSpec: "侧院接入 -> 地藏殿石阶 -> 门口穿门 -> 殿内稳定视角（Phase 5 正式序列）",
    exitVisualSpec: "殿内退步返侧院",
    fallbackVisualSpec: "地藏殿专属外观/内景图",
    assetChecklist: [
      {
        slotId: "dizang-ext",
        label: "地藏殿外部",
        category: "exterior",
        aspectRatio: "16:9",
        status: "verified",
        assetNote: "现有独立外观：dizang_front_exterior_1795627361982.jpg",
      },
      {
        slotId: "dizang-entry",
        label: "地藏殿入口与穿门序列",
        category: "doorway",
        aspectRatio: "16:9",
        status: "pending-production",
        assetNote: "Phase 5 补齐同架构地藏殿接近及穿门帧",
      },
      {
        slotId: "dizang-int",
        label: "地藏殿内与供桌互动视角",
        category: "interior-stable",
        aspectRatio: "16:9",
        status: "verified",
        assetNote: "现有独立内景：dizang_altar_v2_1795630778075.jpg",
      },
    ],
    audioProfile: {
      ambient: "rain",
      religious: "buddhist",
      suggestedMusic: "minimal-pad",
      ambientGainNote: "禅院细雨配低沉古寺幽钟",
    },
    animationLayers: ["candle-flame", "incense-smoke", "light-shadow", "gentle-walk"],
    interactionConfig: FULL_HALL_WORSHIP,
    outgoingPathIds: ["path-dizang-to-side-courtyard"],
  },

  "cangjing-library": {
    nodeId: "cangjing-library",
    nodeName: "藏经阁",
    nodeType: "buddhist-hall",
    zone: "hall",
    coordinates: { x: 34, y: 1, z: 46 },
    linkedSceneId: "buddhist-culture",
    assetStatus: "single-frame-pending-sequence",
    mainVisualSpec: "藏经阁重楼外景与木质书阁典籍空间（16:9）",
    panoramaOptionalSpec: "藏经阁书廊全景预留",
    enterVisualSpec: "东回廊步入藏经阁典籍空间",
    exitVisualSpec: "退返东回廊",
    fallbackVisualSpec: "藏经阁木构内景占位",
    assetChecklist: [
      {
        slotId: "cangjing-ext",
        label: "藏经阁外部",
        category: "exterior",
        aspectRatio: "16:9",
        status: "pending-production",
        assetNote: "独立重檐楼阁外观待制作（不借用山门图）",
      },
      {
        slotId: "cangjing-int",
        label: "藏经阁内书架经案",
        category: "interior-stable",
        aspectRatio: "16:9",
        status: "verified",
        assetNote: "现有内景：culture_altar_interior_1795630248619.jpg",
      },
    ],
    audioProfile: {
      ambient: "birds",
      religious: "buddhist",
      suggestedMusic: "guqin-zen",
      ambientGainNote: "晨鸟微风与木鱼静读氛围",
    },
    animationLayers: ["light-shadow", "incense-smoke", "gentle-walk"],
    interactionConfig: {
      ...NO_WORSHIP,
      enableWoodfish: true,
      enableWish: true,
      allowIncense: true,
    },
    outgoingPathIds: ["path-cangjing-to-right-corridor"],
  },

  "yaoshi-hall-reserved": {
    nodeId: "yaoshi-hall-reserved",
    nodeName: "药师殿（扩展预留）",
    nodeType: "buddhist-hall",
    zone: "hall",
    coordinates: { x: -34, y: 0, z: 44 },
    assetStatus: "planned",
    mainVisualSpec: "预留药师佛殿独立外观与药师佛、十二药叉护法内景位（16:9）",
    panoramaOptionalSpec: "药师殿内全景预留",
    enterVisualSpec: "左前侧院 -> 药师殿入口 -> 殿内",
    exitVisualSpec: "药师殿退返左侧回廊",
    fallbackVisualSpec: "尚未建殿，严格禁止复用他殿图文",
    assetChecklist: [
      {
        slotId: "yaoshi-ext",
        label: "药师殿外部",
        category: "exterior",
        aspectRatio: "16:9",
        status: "pending-production",
        assetNote: "后续独立扩展佛殿（绝不借用大雄/观音/地藏图像）",
      },
      {
        slotId: "yaoshi-int",
        label: "药师殿内部",
        category: "interior-stable",
        aspectRatio: "16:9",
        status: "pending-production",
        assetNote: "东方净琉璃药师佛造像与供桌",
      },
    ],
    audioProfile: {
      ambient: "wind",
      religious: "buddhist",
      suggestedMusic: "guqin-zen",
      ambientGainNote: "药师如来清净长韵",
    },
    animationLayers: ["candle-flame", "incense-smoke", "light-shadow"],
    interactionConfig: FULL_HALL_WORSHIP,
    outgoingPathIds: [],
  },

  // ==================== 4. 自然与静修空间 ====================
  "lotus-pond": {
    nodeId: "lotus-pond",
    nodeName: "莲池",
    nodeType: "lotus-pond",
    zone: "nature",
    coordinates: { x: 6, y: 0, z: 96 },
    linkedSceneId: "buddhist-pureland",
    assetStatus: "single-frame-pending-sequence",
    mainVisualSpec: "寺后清净莲池、石栏水榭与荷叶莲华（16:9 写实水景）",
    panoramaOptionalSpec: "莲池畔 360° 全景预留",
    enterVisualSpec: "莲池远景 -> 莲池近景 -> 池畔石径与小桥",
    exitVisualSpec: "沿水边回返侧院或步向静修亭",
    fallbackVisualSpec: "净土莲池图占位",
    assetChecklist: [
      {
        slotId: "lotus-far",
        label: "莲池远景",
        category: "far-view",
        aspectRatio: "16:9",
        status: "verified",
        assetNote: "现有基础莲池图：buddhist_pureland_lotus_1795549669802.jpg",
      },
      {
        slotId: "lotus-near",
        label: "莲池近景",
        category: "near-view",
        aspectRatio: "16:9",
        status: "pending-production",
        assetNote: "Phase 6 制作池畔青石、水波与粉白清莲特写",
      },
      {
        slotId: "lotus-bridge",
        label: "石曲小桥",
        category: "connector",
        aspectRatio: "16:9",
        status: "pending-production",
        assetNote: "跨莲池小桥连接对岸水边小路与静修亭",
      },
    ],
    audioProfile: {
      ambient: "stream",
      religious: "buddhist",
      suggestedMusic: "minimal-pad",
      ambientGainNote: "清泉细水伴微弱莲风",
    },
    animationLayers: ["water-ripple", "lotus-bloom", "light-shadow", "gentle-walk"],
    interactionConfig: {
      ...NO_WORSHIP,
      enableWoodfish: true,
      allowLamp: true,
      allowFlower: true,
      allowBreathingGuide: true,
      allowSeatedTimer: true,
    },
    outgoingPathIds: [
      "path-lotus-to-waterside",
      "path-lotus-to-bamboo",
      "path-lotus-to-side-courtyard",
    ],
  },

  "waterside-space": {
    nodeId: "waterside-space",
    nodeName: "水边空间",
    nodeType: "waterside",
    zone: "nature",
    coordinates: { x: 24, y: 0, z: 112 },
    assetStatus: "planned",
    mainVisualSpec: "莲池下游溪石浅滩、石砌水阶与木亭水影（16:9）",
    panoramaOptionalSpec: "无",
    enterVisualSpec: "过莲池石桥沿水边青石路行至静修亭阶前",
    exitVisualSpec: "退返莲池石桥",
    fallbackVisualSpec: "水影青石占位",
    assetChecklist: [
      {
        slotId: "waterside-path",
        label: "水边路径视角",
        category: "connector",
        aspectRatio: "16:9",
        status: "pending-production",
        assetNote: "临水石径与静修亭倒影",
      },
    ],
    audioProfile: {
      ambient: "lake",
      religious: "none",
      suggestedMusic: "mountain-stream-score",
      ambientGainNote: "水波轻拍岸石，纯自然无宗教声干扰",
    },
    animationLayers: ["water-ripple", "foliage-sway", "light-shadow", "gentle-walk"],
    interactionConfig: {
      ...NO_WORSHIP,
      allowBreathingGuide: true,
      allowSeatedTimer: true,
    },
    outgoingPathIds: ["path-waterside-to-pavilion", "path-waterside-to-lotus"],
  },

  "bamboo-grove": {
    nodeId: "bamboo-grove",
    nodeName: "竹林",
    nodeType: "bamboo-grove",
    zone: "nature",
    coordinates: { x: -12, y: 2, z: 108 },
    assetStatus: "planned",
    mainVisualSpec: "寺院后山幽篁翠竹、青苔石径与斑驳天光（16:9）",
    panoramaOptionalSpec: "竹林深处环视全景（可选）",
    enterVisualSpec: "竹林入口 -> 竹林小路 -> 竹林深处 -> 静修视角",
    exitVisualSpec: "循竹径返莲池或侧院",
    fallbackVisualSpec: "翠竹晨光占位",
    assetChecklist: [
      {
        slotId: "bamboo-entry",
        label: "竹林入口",
        category: "exterior",
        aspectRatio: "16:9",
        status: "pending-production",
        assetNote: "月洞门外初见成片修竹与青苔石阶",
      },
      {
        slotId: "bamboo-trail",
        label: "竹林小路",
        category: "connector",
        aspectRatio: "16:9",
        status: "pending-production",
        assetNote: "两侧竹竿交错前景遮挡，石径蜿蜒向前",
      },
      {
        slotId: "bamboo-deep",
        label: "竹林深处静修视角",
        category: "interior-stable",
        aspectRatio: "16:9",
        status: "pending-production",
        assetNote: "林间石台静坐听风声视角",
      },
    ],
    audioProfile: {
      ambient: "bamboo-rain",
      religious: "none",
      suggestedMusic: "minimal-pad",
      ambientGainNote: "风动竹叶飒飒，伴随微雨或蝉鸣细响",
    },
    animationLayers: ["foliage-sway", "light-shadow", "cloud-mist", "gentle-walk"],
    interactionConfig: {
      ...NO_WORSHIP,
      enableWoodfish: true,
      allowBreathingGuide: true,
      allowSeatedTimer: true,
    },
    outgoingPathIds: [
      "path-bamboo-to-pavilion",
      "path-bamboo-to-mountain-path",
      "path-bamboo-to-lotus",
    ],
  },

  "meditation-pavilion": {
    nodeId: "meditation-pavilion",
    nodeName: "静修亭",
    nodeType: "meditation-pavilion",
    zone: "nature",
    coordinates: { x: 10, y: 2, z: 126 },
    assetStatus: "planned",
    mainVisualSpec: "临水背竹的素雅原木方亭（无多余彩绘），面向莲池群山（16:9）",
    panoramaOptionalSpec: "亭内静坐 360° 环视预留",
    enterVisualSpec: "亭外石径 -> 步入木亭台 -> 蒲团静坐观景视角",
    exitVisualSpec: "起身离亭返水边或竹林",
    fallbackVisualSpec: "素雅木亭占位",
    assetChecklist: [
      {
        slotId: "pavilion-ext",
        label: "静修亭外景",
        category: "exterior",
        aspectRatio: "16:9",
        status: "pending-production",
        assetNote: "与主寺青瓦灰砖风格一致的简朴木亭",
      },
      {
        slotId: "pavilion-enter",
        label: "步入亭内视角",
        category: "interior-entry",
        aspectRatio: "16:9",
        status: "pending-production",
        assetNote: "木柱遮挡进入，见原木长凳与素色蒲团",
      },
      {
        slotId: "pavilion-sit",
        label: "亭内静坐观水听风视角",
        category: "interactive",
        aspectRatio: "16:9",
        status: "pending-production",
        assetNote: "低视角平稳凝望莲池水波与远山云影",
      },
    ],
    audioProfile: {
      ambient: "lake",
      religious: "none",
      suggestedMusic: "guqin-zen",
      ambientGainNote: "极静水声与疏朗古琴泛音，支持呼吸与计时",
    },
    animationLayers: ["water-ripple", "cloud-mist", "foliage-sway", "light-shadow"],
    interactionConfig: {
      ...NO_WORSHIP,
      enableWoodfish: true,
      allowBreathingGuide: true,
      allowSeatedTimer: true,
    },
    outgoingPathIds: ["path-pavilion-to-waterside", "path-pavilion-to-bamboo"],
  },

  "mountain-path": {
    nodeId: "mountain-path",
    nodeName: "山间路径",
    nodeType: "mountain-trail",
    zone: "nature",
    coordinates: { x: -24, y: 8, z: 136 },
    assetStatus: "planned",
    mainVisualSpec: "古树根系、野石阶与缓坡穿林上行小径（16:9）",
    panoramaOptionalSpec: "无",
    enterVisualSpec: "石阶 -> 缓坡 -> 山林小路连续上行",
    exitVisualSpec: "沿坡道缓步下山返竹林",
    fallbackVisualSpec: "山林石阶占位",
    assetChecklist: [
      {
        slotId: "mpath-steps",
        label: "山间石阶",
        category: "connector",
        aspectRatio: "16:9",
        status: "pending-production",
        assetNote: "自然风化青石与苔藓石级",
      },
      {
        slotId: "mpath-slope",
        label: "林间缓坡小路",
        category: "connector",
        aspectRatio: "16:9",
        status: "pending-production",
        assetNote: "透出山谷晨雾与远方云海轮廓",
      },
    ],
    audioProfile: {
      ambient: "pine",
      religious: "none",
      suggestedMusic: "mountain-stream-score",
      ambientGainNote: "山松涛声配砂石土径轻缓脚步",
    },
    animationLayers: ["cloud-mist", "foliage-sway", "light-shadow", "gentle-walk"],
    interactionConfig: { ...NO_WORSHIP, allowBreathingGuide: true },
    outgoingPathIds: ["path-mountain-to-cloud-view", "path-mountain-to-bamboo"],
  },

  "cloud-viewpoint": {
    nodeId: "cloud-viewpoint",
    nodeName: "云海观景处",
    nodeType: "cloud-viewpoint",
    zone: "nature",
    coordinates: { x: -26, y: 18, z: 168 },
    assetStatus: "planned",
    mainVisualSpec: "山巅青石观景台，俯瞰古寺飞檐掩映于无垠云海峰峦之间（16:9）",
    panoramaOptionalSpec: "山巅云海 360° 环视全景（预留）",
    enterVisualSpec: "自山间石阶步出林冠，豁然见云海日出",
    exitVisualSpec: "转身沿山径缓步返回竹林",
    fallbackVisualSpec: "云海远峰占位",
    assetChecklist: [
      {
        slotId: "cloud-vista",
        label: "云海远眺主视角",
        category: "far-view",
        aspectRatio: "16:9",
        status: "pending-production",
        assetNote: "高处回望山林佛寺屋脊与流云",
      },
      {
        slotId: "cloud-sit",
        label: "观景静坐视角",
        category: "interactive",
        aspectRatio: "16:9",
        status: "pending-production",
        assetNote: "低视角山石静观云海流动与微风声",
      },
    ],
    audioProfile: {
      ambient: "clouds",
      religious: "none",
      suggestedMusic: "minimal-pad",
      ambientGainNote: "高空舒缓山风与偶发极远古寺钟声",
    },
    animationLayers: ["cloud-mist", "light-shadow"],
    interactionConfig: {
      ...NO_WORSHIP,
      allowBreathingGuide: true,
      allowSeatedTimer: true,
    },
    outgoingPathIds: ["path-cloud-view-to-mountain"],
  },
};

export const TEMPLE_CONNECTION_PATHS: TempleConnectionPath[] = [
  {
    pathId: "path-entry-to-gate-steps",
    fromNodeId: "mountain-forest-entry",
    toNodeId: "gate-stone-steps",
    label: "沿山林小路步向山门石阶",
    pathType: "forest-trail",
    pathVisualSpec: "古松碎石路渐接规整花岗岩台阶序列（16:9）",
    requiredWaypoints: ["入口远景", "林中石径中景", "石阶底端平台"],
    assetStatus: "pending-formal-assets",
    entryPerspective: "平视入林青石小径",
    exitPerspective: "仰望山门前长阶",
    walkDurationMs: 12000,
    paceMetersPerSec: 1.2,
    stepSurface: "earth",
    audioTransitionRule: "砂土脚步声自然切换为石阶起步声，松风渐显",
    motionConfig: { strideMeters: 0.84, depthParallax: true, foregroundOcclusion: true, forbidZoomOnly: true },
    transitionRule: "严格采用林径连续关键帧 + 光流深度推移，严禁按钮跳切",
  },
  {
    pathId: "path-gate-steps-to-temple-gate",
    fromNodeId: "gate-stone-steps",
    toNodeId: "temple-gate",
    label: "拾级登临 · 步至山门前",
    pathType: "stone-steps",
    pathVisualSpec: "花岗岩长阶逐步登高接近重檐山门正门序列",
    requiredWaypoints: ["石阶中段", "山门门前平台"],
    assetStatus: "pending-formal-assets",
    entryPerspective: "沿台阶缓步向上平视山门",
    exitPerspective: "立于山门门外石台上",
    walkDurationMs: 11800,
    paceMetersPerSec: 1.15,
    stepSurface: "stone",
    audioTransitionRule: "石阶沉稳脚步配合微弱古寺钟声远传",
    motionConfig: { strideMeters: 0.78, depthParallax: true, foregroundOcclusion: true, forbidZoomOnly: true },
    transitionRule: "依台阶抬升视线高度，禁止平推缩放",
  },
  {
    pathId: "path-gate-to-inner-courtyard",
    fromNodeId: "temple-gate",
    toNodeId: "inner-gate-courtyard",
    label: "穿过山门 · 步入前庭",
    pathType: "main-flagstone",
    pathVisualSpec: "山门外 -> 穿门遮挡 -> 山门内庭院连续五帧（Phase 3 优先制作）",
    requiredWaypoints: ["山门远景", "山门近景", "门外视角", "穿门视角", "门内前庭视角"],
    assetStatus: "pending-formal-assets",
    entryPerspective: "正对山门门洞",
    exitPerspective: "立于山门内庭院中轴",
    walkDurationMs: 14500,
    paceMetersPerSec: 1.25,
    stepSurface: "stone",
    audioTransitionRule: "过门檐时外部山风瞬时收拢，门内清寂鸟鸣展开",
    motionConfig: { strideMeters: 0.82, depthParallax: true, foregroundOcclusion: true, forbidZoomOnly: true },
    transitionRule: "采用大雄宝殿同款光流门框遮挡穿越逻辑",
  },
  {
    pathId: "path-inner-to-main-courtyard",
    fromNodeId: "inner-gate-courtyard",
    toNodeId: "main-courtyard",
    label: "沿主石板路前往主庭院",
    pathType: "main-flagstone",
    pathVisualSpec: "青石中轴甬道直贯主庭院开阔广场序列",
    requiredWaypoints: ["前庭中轴", "青石甬道中段", "主庭院入口"],
    assetStatus: "pending-formal-assets",
    entryPerspective: "山门内沿中轴石道前行",
    exitPerspective: "主庭院全景（正对大雄宝殿）",
    walkDurationMs: 12800,
    paceMetersPerSec: 1.28,
    stepSurface: "stone",
    audioTransitionRule: "青石板清脆步频过渡至主庭院晨风香炉氛围",
    motionConfig: { strideMeters: 0.84, depthParallax: true, foregroundOcclusion: true, forbidZoomOnly: true },
    transitionRule: "中央石板近景移动速度高于远景殿檐",
  },
  {
    pathId: "path-courtyard-to-daxiong",
    fromNodeId: "main-courtyard",
    toNodeId: "daxiong-hall",
    label: "沿白石阶步入大雄宝殿",
    pathType: "main-flagstone",
    pathVisualSpec: "已实现 V2.4 样板路线：6 关键帧统一实景序列（外观 -> 登阶 -> 月台 -> 门口 -> 殿内中道 -> 供桌正前）",
    requiredWaypoints: [
      "庭院起始（daxiong_front_exterior）",
      "登阶过铜炉（daxiong_seq_steps）",
      "白石月台牌匾前（daxiong_seq_approach_v2）",
      "廊下敞开门框与门槛（daxiong_seq_doorway_final）",
      "殿内金砖中道（daxiong_seq_nave）",
      "供桌前停稳（daxiong_altar_v2）",
    ],
    assetStatus: "verified",
    entryPerspective: "主庭院中轴远观重檐大雄宝殿",
    exitPerspective: "大殿内金砖正中平视供桌与释迦牟尼佛",
    walkDurationMs: 17600,
    paceMetersPerSec: 1.25,
    stepSurface: "stone",
    audioTransitionRule: "青石->木门槛->金砖三段质感脚步；穿门后外风减半，殿内共振渐入",
    motionConfig: { strideMeters: 0.82, depthParallax: true, foregroundOcclusion: true, forbidZoomOnly: true },
    transitionRule: "光流深度投影 + 门框外缘穿门阴影脉冲，零黑屏、零跳变",
  },
  {
    pathId: "path-courtyard-to-left-corridor",
    fromNodeId: "main-courtyard",
    toNodeId: "left-corridor",
    label: "步向左侧回廊",
    pathType: "corridor",
    pathVisualSpec: "主庭院左转入西侧朱柱长廊入口序列",
    requiredWaypoints: ["庭院左侧视角", "西回廊入口石阶", "西回廊纵深起始"],
    assetStatus: "pending-formal-assets",
    entryPerspective: "庭院面向西廊",
    exitPerspective: "正对左侧长廊深处",
    walkDurationMs: 11200,
    paceMetersPerSec: 1.22,
    stepSurface: "stone",
    audioTransitionRule: "入檐下后空间反射微增",
    motionConfig: { strideMeters: 0.82, depthParallax: true, foregroundOcclusion: true, forbidZoomOnly: true },
    transitionRule: "需先步向回廊口再入廊内，禁止侧向闪切",
  },
  {
    pathId: "path-left-corridor-to-guanyin",
    fromNodeId: "left-corridor",
    toNodeId: "guanyin-hall",
    label: "沿左侧回廊前往观音殿",
    pathType: "corner-corridor",
    pathVisualSpec: "西长廊行进 -> 转角回廊 -> 观音殿庭前序列",
    requiredWaypoints: ["西长廊中段", "回廊转角", "观音殿庭院外观"],
    assetStatus: "pending-formal-assets",
    entryPerspective: "廊下深红木柱列阵前行",
    exitPerspective: "正对观音殿外观与清莲前庭",
    walkDurationMs: 13000,
    paceMetersPerSec: 1.22,
    stepSurface: "stone",
    audioTransitionRule: "廊步轻声渐入观音殿清泉环境音",
    motionConfig: { strideMeters: 0.82, depthParallax: true, foregroundOcclusion: true, forbidZoomOnly: true },
    transitionRule: "廊柱两侧近景掠过并自然转出庭院",
  },
  {
    pathId: "path-courtyard-to-right-corridor",
    fromNodeId: "main-courtyard",
    toNodeId: "right-corridor",
    label: "步向右侧回廊",
    pathType: "corridor",
    pathVisualSpec: "主庭院右转入东侧朱柱长廊序列",
    requiredWaypoints: ["庭院右侧视角", "东回廊入口石阶", "东回廊纵深起始"],
    assetStatus: "pending-formal-assets",
    entryPerspective: "庭院面向东廊",
    exitPerspective: "正对右侧长廊纵深",
    walkDurationMs: 11200,
    paceMetersPerSec: 1.22,
    stepSurface: "stone",
    audioTransitionRule: "入廊檐空间声微变",
    motionConfig: { strideMeters: 0.82, depthParallax: true, foregroundOcclusion: true, forbidZoomOnly: true },
    transitionRule: "统一柱网光影过渡",
  },
  {
    pathId: "path-right-corridor-to-side-courtyard",
    fromNodeId: "right-corridor",
    toNodeId: "side-courtyard",
    label: "经东廊转角进入侧院",
    pathType: "corner-corridor",
    pathVisualSpec: "东长廊行进 -> 转角出廊 -> 静谧侧院序列",
    requiredWaypoints: ["东长廊中段", "东廊出口转角", "侧院入口"],
    assetStatus: "pending-formal-assets",
    entryPerspective: "沿东廊稳步向前",
    exitPerspective: "侧院古松石庭全景",
    walkDurationMs: 12400,
    paceMetersPerSec: 1.22,
    stepSurface: "stone",
    audioTransitionRule: "长廊步音转为松院微风流水声",
    motionConfig: { strideMeters: 0.82, depthParallax: true, foregroundOcclusion: true, forbidZoomOnly: true },
    transitionRule: "通过廊道转角自然连接",
  },
  {
    pathId: "path-right-corridor-to-cangjing",
    fromNodeId: "right-corridor",
    toNodeId: "cangjing-library",
    label: "步向藏经阁",
    pathType: "courtyard-link",
    pathVisualSpec: "东廊侧门 -> 藏经阁前石阶 -> 阁内典籍廊",
    requiredWaypoints: ["东廊侧门", "藏经阁外部", "阁门穿门", "经橱内景"],
    assetStatus: "pending-formal-assets",
    entryPerspective: "东廊面向藏经阁重楼",
    exitPerspective: "藏经阁线装书橱空间",
    walkDurationMs: 12800,
    paceMetersPerSec: 1.2,
    stepSurface: "wood",
    audioTransitionRule: "木梯地板声微响，入阁后归于沉静",
    motionConfig: { strideMeters: 0.8, depthParallax: true, foregroundOcclusion: true, forbidZoomOnly: true },
    transitionRule: "独立藏经阁外观衔接内景，绝不复用山门图",
  },
  {
    pathId: "path-daxiong-to-side-courtyard",
    fromNodeId: "daxiong-hall",
    toNodeId: "side-courtyard",
    label: "由大殿后侧步往静谧侧院",
    pathType: "courtyard-link",
    pathVisualSpec: "大雄宝殿侧台 -> 后廊石径 -> 静谧侧院序列",
    requiredWaypoints: ["大殿东侧白石月台", "后庭月洞石径", "静谧侧院"],
    assetStatus: "pending-formal-assets",
    entryPerspective: "沿大殿东侧檐道向后庭走去",
    exitPerspective: "侧院古松月洞门",
    walkDurationMs: 12200,
    paceMetersPerSec: 1.22,
    stepSurface: "stone",
    audioTransitionRule: "大殿肃穆磬声渐弱，侧院水风渐起",
    motionConfig: { strideMeters: 0.82, depthParallax: true, foregroundOcclusion: true, forbidZoomOnly: true },
    transitionRule: "绕行殿侧石道，禁止穿墙直达",
  },
  {
    pathId: "path-side-courtyard-to-dizang",
    fromNodeId: "side-courtyard",
    toNodeId: "dizang-hall",
    label: "穿过侧院前往地藏殿",
    pathType: "courtyard-link",
    pathVisualSpec: "侧院青石径 -> 古松石阶 -> 地藏殿正门序列",
    requiredWaypoints: ["侧院面向地藏殿", "地藏殿阶前", "地藏殿门口", "地藏殿内"],
    assetStatus: "pending-formal-assets",
    entryPerspective: "古松掩映下的侧院石径",
    exitPerspective: "正对地藏菩萨庄严圣像",
    walkDurationMs: 13600,
    paceMetersPerSec: 1.2,
    stepSurface: "stone",
    audioTransitionRule: "细雨松风过渡为地藏殿肃穆深钟",
    motionConfig: { strideMeters: 0.8, depthParallax: true, foregroundOcclusion: true, forbidZoomOnly: true },
    transitionRule: "仅使用地藏殿独立素材",
  },
  {
    pathId: "path-side-courtyard-to-lotus-pond",
    fromNodeId: "side-courtyard",
    toNodeId: "lotus-pond",
    label: "穿月洞门前往莲池",
    pathType: "courtyard-link",
    pathVisualSpec: "侧院月洞门 -> 石砌小阶 -> 莲池远景序列",
    requiredWaypoints: ["白墙月洞门外", "穿月洞门遮挡", "初见莲池水面"],
    assetStatus: "pending-formal-assets",
    entryPerspective: "正对侧院通往后园的圆弧月洞门",
    exitPerspective: "豁然开朗的清净莲池全貌",
    walkDurationMs: 12000,
    paceMetersPerSec: 1.18,
    stepSurface: "stone",
    audioTransitionRule: "宗教殿堂音淡出，自然水波鸟语自然流淌",
    motionConfig: { strideMeters: 0.82, depthParallax: true, foregroundOcclusion: true, forbidZoomOnly: true },
    transitionRule: "月洞门门框边缘遮挡过渡至山水园林",
  },
  {
    pathId: "path-side-courtyard-to-bamboo",
    fromNodeId: "side-courtyard",
    toNodeId: "bamboo-grove",
    label: "步入寺后竹林小路",
    pathType: "bamboo-trail",
    pathVisualSpec: "侧院西边竹门 -> 翠竹石阶 -> 竹林入口序列",
    requiredWaypoints: ["侧院竹门", "竹林入口石径"],
    assetStatus: "pending-formal-assets",
    entryPerspective: "石墙掩映翠竹枝梢",
    exitPerspective: "步入幽静竹林小径",
    walkDurationMs: 11800,
    paceMetersPerSec: 1.15,
    stepSurface: "earth",
    audioTransitionRule: "石声转砂径与竹叶风声",
    motionConfig: { strideMeters: 0.8, depthParallax: true, foregroundOcclusion: true, forbidZoomOnly: true },
    transitionRule: "前景竹枝随前行从两侧缓掠",
  },
  {
    pathId: "path-lotus-to-waterside",
    fromNodeId: "lotus-pond",
    toNodeId: "waterside-space",
    label: "过小桥 · 沿水边路径漫步",
    pathType: "small-bridge",
    pathVisualSpec: "莲池畔 -> 扁平青石曲桥 -> 对岸水边小路序列",
    requiredWaypoints: ["莲池石岸", "踏上石桥", "桥心看水", "水边石径"],
    assetStatus: "pending-formal-assets",
    entryPerspective: "平视石桥拱面与莲池倒影",
    exitPerspective: "沿水岸青石径缓步前行",
    walkDurationMs: 12600,
    paceMetersPerSec: 1.12,
    stepSurface: "stone",
    audioTransitionRule: "桥上流水声双侧渐近，过桥后转为岸石水波声",
    motionConfig: { strideMeters: 0.78, depthParallax: true, foregroundOcclusion: true, forbidZoomOnly: true },
    transitionRule: "真实小桥透视推移 + 水面微澜轻动画",
  },
  {
    pathId: "path-waterside-to-pavilion",
    fromNodeId: "waterside-space",
    toNodeId: "meditation-pavilion",
    label: "沿水边路径步入静修亭",
    pathType: "waterside-path",
    pathVisualSpec: "水岸石道 -> 亭前木阶 -> 步入素木静修亭序列",
    requiredWaypoints: ["水边回望亭影", "亭前石阶", "木亭内部坐席"],
    assetStatus: "pending-formal-assets",
    entryPerspective: "水岸路径尽头素雅木亭",
    exitPerspective: "入亭静坐面向莲池水景",
    walkDurationMs: 11600,
    paceMetersPerSec: 1.1,
    stepSurface: "wood",
    audioTransitionRule: "石径步声踏上木亭台板，入座后脚步全止",
    motionConfig: { strideMeters: 0.78, depthParallax: true, foregroundOcclusion: true, forbidZoomOnly: true },
    transitionRule: "木亭立柱前景遮挡入内后平稳落座",
  },
  {
    pathId: "path-lotus-to-bamboo",
    fromNodeId: "lotus-pond",
    toNodeId: "bamboo-grove",
    label: "沿竹林小路前往竹林",
    pathType: "bamboo-trail",
    pathVisualSpec: "池畔石径转入幽篁竹海序列",
    requiredWaypoints: ["莲池西岸", "竹林入口", "竹林小路"],
    assetStatus: "pending-formal-assets",
    entryPerspective: "由水景步入绿竹阴翳",
    exitPerspective: "清凉竹林小路纵深",
    walkDurationMs: 12200,
    paceMetersPerSec: 1.15,
    stepSurface: "earth",
    audioTransitionRule: "水声缓弱，风吹竹涛声渐明",
    motionConfig: { strideMeters: 0.8, depthParallax: true, foregroundOcclusion: true, forbidZoomOnly: true },
    transitionRule: "自然林荫过渡，禁止瞬间切换",
  },
  {
    pathId: "path-bamboo-to-pavilion",
    fromNodeId: "bamboo-grove",
    toNodeId: "meditation-pavilion",
    label: "穿竹林小路赴静修亭",
    pathType: "bamboo-trail",
    pathVisualSpec: "竹林深处出林见亭序列",
    requiredWaypoints: ["竹林深处", "竹林出口", "静修亭外景"],
    assetStatus: "pending-formal-assets",
    entryPerspective: "翠竹掩映前方木亭飞檐",
    exitPerspective: "立于静修亭阶前",
    walkDurationMs: 11800,
    paceMetersPerSec: 1.12,
    stepSurface: "earth",
    audioTransitionRule: "竹风配合远水微澜渐显",
    motionConfig: { strideMeters: 0.8, depthParallax: true, foregroundOcclusion: true, forbidZoomOnly: true },
    transitionRule: "出林视野自然豁朗",
  },
  {
    pathId: "path-bamboo-to-mountain-path",
    fromNodeId: "bamboo-grove",
    toNodeId: "mountain-path",
    label: "循山间石阶上行",
    pathType: "stone-steps",
    pathVisualSpec: "竹林北侧青苔野石阶接山林缓坡序列",
    requiredWaypoints: ["竹林石阶起点", "林中缓坡", "古松石道"],
    assetStatus: "pending-formal-assets",
    entryPerspective: "循竹根野石阶缓缓向上",
    exitPerspective: "山间石径穿古松林立",
    walkDurationMs: 12800,
    paceMetersPerSec: 1.08,
    stepSurface: "stone",
    audioTransitionRule: "平缓上坡慢节奏脚步配松风",
    motionConfig: { strideMeters: 0.76, depthParallax: true, foregroundOcclusion: true, forbidZoomOnly: true },
    transitionRule: "坡度视平线顺滑微抬",
  },
  {
    pathId: "path-mountain-to-cloud-view",
    fromNodeId: "mountain-path",
    toNodeId: "cloud-viewpoint",
    label: "沿缓坡登临云海观景处",
    pathType: "gentle-slope",
    pathVisualSpec: "林间缓坡出松林登顶俯瞰云海山寺全景序列",
    requiredWaypoints: ["山间缓坡", "林冠豁口初见云海", "青石观景台停稳"],
    assetStatus: "pending-formal-assets",
    entryPerspective: "穿出高林树梢见明亮云天",
    exitPerspective: "俯瞰山林云海与远方古刹飞檐",
    walkDurationMs: 13200,
    paceMetersPerSec: 1.08,
    stepSurface: "stone",
    audioTransitionRule: "林鸟淡出，高空松涛长风与极远寺钟余韵留白",
    motionConfig: { strideMeters: 0.78, depthParallax: true, foregroundOcclusion: true, forbidZoomOnly: true },
    transitionRule: "出林瞬间天光云海逐渐展开",
  },
];

export type ProductionPhaseItem = {
  phase: string;
  title: string;
  status: "completed" | "in-progress" | "planned";
  deliverables: string;
};

export const V3_DEVELOPMENT_ROADMAP: ProductionPhaseItem[] = [
  {
    phase: "第一阶段",
    title: "空间规划、节点系统、连接路径与素材清单（当前阶段）",
    status: "completed",
    deliverables:
      "确立 19 个寺院空间节点、20 条实景连接路径、独立素材/音频/互动字段与 16:9 一致性约束",
  },
  {
    phase: "第二阶段",
    title: "核心样板实景素材制作（大雄宝殿已定型，待补山门/主庭院/回廊/莲池/竹林）",
    status: "in-progress",
    deliverables:
      "按同一青灰琉璃瓦与深红褐色木构身份，分批次生产并审核通过各核心节点正式 16:9 实景序列",
  },
  {
    phase: "第三阶段",
    title: "打通「山门 -> 主石板路 -> 主庭院 -> 大雄宝殿」精品入口轴线",
    status: "planned",
    deliverables: "山门五帧序列与主庭院连接帧导入清单，实现入寺全中轴连续步行",
  },
  {
    phase: "第四阶段",
    title: "完成主庭院与左右回廊连接",
    status: "planned",
    deliverables: "主庭院左右视角及回廊转角纵深序列接入光流漫步引擎",
  },
  {
    phase: "第五阶段",
    title: "接入观音殿、地藏殿与侧院独立序列",
    status: "planned",
    deliverables: "严格独立制作观音殿与地藏殿接近/穿门/入殿连续图组，绝不跨殿混用",
  },
  {
    phase: "第六阶段",
    title: "贯通莲池、竹林、小桥、静修亭与云海观景空间",
    status: "planned",
    deliverables: "后山自然园林与水岸步石、山间石阶、静坐观景全部接入统一路径引擎",
  },
  {
    phase: "第七阶段",
    title: "统一轻量互动层全殿校准",
    status: "in-progress",
    deliverables: "大雄/观音/地藏殿供桌落位已统一，后续新殿与自然静修亭按基准坐标对齐",
  },
  {
    phase: "第八阶段",
    title: "轻量动画与五层连续音频全域调优",
    status: "in-progress",
    deliverables: "水波、云雾、树叶微风、门檐声场遮蔽及跨区音色自然切换",
  },
  {
    phase: "第九阶段",
    title: "全路线实机运行核验与逐段打磨",
    status: "planned",
    deliverables: "电脑端与手机端全路径实景漫步及音频交互连贯性验收",
  },
];

export const V3_FORMAL_ASSET_IMPORT_WORKFLOW = [
  "1. 按单节点建筑身份（同屋顶、柱网、石材、1.64m平视、自然右前晨光）分段生成或拍摄 16:9 连续关键帧。",
  "2. 将核验无变形、无多余门柱遮挡的正式图像存入 /src/assets/images/ 并命以节点与序号前缀。",
  "3. 在 src/data/sceneAssets.ts 注册该节点或连接路径的 WalkWaypointFrame[]，设定 vanishingX/horizonY/portal 边界与步面材质。",
  "4. 在 templeMasterPlan.ts 将对应资产槽位标记为 verified 并绑定至连接路径，无需改动渲染组件即可直接启用实时深度漫步。",
] as const;

export function getMasterNodeById(
  nodeId: string,
): TempleMasterNode | undefined {
  return TEMPLE_MASTER_NODES[nodeId];
}

export function getOutgoingPathsForNode(
  nodeId: string,
): TempleConnectionPath[] {
  return TEMPLE_CONNECTION_PATHS.filter((p) => p.fromNodeId === nodeId);
}

export function getMasterPlanSummaryStats() {
  const nodes = Object.values(TEMPLE_MASTER_NODES);
  const paths = TEMPLE_CONNECTION_PATHS;
  const totalChecklistSlots = nodes.reduce(
    (sum, n) => sum + n.assetChecklist.length,
    0,
  );
  const verifiedSlots = nodes.reduce(
    (sum, n) =>
      sum + n.assetChecklist.filter((s) => s.status === "verified").length,
    0,
  );
  const verifiedPaths = paths.filter((p) => p.assetStatus === "verified").length;
  return {
    nodeCount: nodes.length,
    pathCount: paths.length,
    totalChecklistSlots,
    verifiedSlots,
    verifiedPaths,
  };
}
