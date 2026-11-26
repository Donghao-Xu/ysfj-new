import daxiongAltV2Img from "@/assets/images/daxiong_altar_v2_1795630776095.jpg";
import daxiongExteriorImg from "@/assets/images/daxiong_front_exterior_1795627359651.jpg";
import daxiongSeqApproachImg from "@/assets/images/daxiong_seq_approach_v2_1795723997946.jpg";
import daxiongSeqDoorwayImg from "@/assets/images/daxiong_seq_doorway_final_1795723658008.jpg";
import daxiongSeqStepsImg from "@/assets/images/daxiong_seq_steps_1795723641350.jpg";
import type { WalkSurfaceKind } from "@/data/sceneAssets";

export type DaxiongStationId =
  | "courtyard-far"
  | "marble-steps"
  | "plaque-terrace"
  | "doorway-threshold"
  | "hall-interior";

export type DaxiongWalkVideoAsset = {
  /** 正式连续步入视频地址（建议 16:9 1920x1080 MP4，H.264 编码）；为 null 表示尚无正式视频 */
  officialVideoSrc: string | null;
  /** 可选正式 WebM 编码备选源 */
  officialWebmSrc?: string | null;
  /** 明确标识的测试占位视频资源，仅用于验证播放器播放/暂停/退出与入殿结束回调 */
  testPlaceholderVideoSrc: string;
  /** 视频加载前的封面参考图（播放时绝不与视频叠层） */
  posterImage: string;
  /** 是否已配置正式寺院步入连续视频；为 false 时默认保留静态入殿，不伪造拉伸/重影动画 */
  hasOfficialWalkVideo: boolean;
  /** 默认静音播放以保障桌面与移动端自动播放兼容性 */
  mutedByDefault: boolean;
  /** 素材状态与替换指引 */
  sourceNote: string;
};

/**
 * 大雄宝殿独立连续步入视频素材接口：
 * 后续只需将正式实拍/连续路径渲染的 16:9 视频放置到 public/videos/ 并更新此处配置，
 * 无需修改播放组件或原有空间结构。
 */
export const DAXIONG_WALK_VIDEO_ASSET: DaxiongWalkVideoAsset = {
  officialVideoSrc: null,
  officialWebmSrc: null,
  testPlaceholderVideoSrc: "/videos/daxiong-walk-test-placeholder.mp4",
  posterImage: daxiongExteriorImg,
  hasOfficialWalkVideo: false,
  mutedByDefault: true,
  sourceNote:
    "当前尚未提供大雄宝殿实拍连续步入视频（默认使用正常静态入殿，停用任何图片拉伸或重影动画）；配置 officialVideoSrc 并设置 hasOfficialWalkVideo: true 即可直接切换为正式步入视频。",
};

export type RealSpaceHotspotAction =
  | { type: "station"; targetStationId: DaxiongStationId }
  | { type: "scene"; targetSceneId: string; sceneLabel: string };

export type RealSpaceHotspot = {
  id: string;
  label: string;
  hint?: string;
  /** 16:9 实景图横向锚点百分比 (0–100) */
  xPct: number;
  /** 16:9 实景图纵向锚点百分比 (0–100) */
  yPct: number;
  /** 建筑结构关联说明 */
  landmark: string;
  action: RealSpaceHotspotAction;
};

export type SphericalPanoramaHotspot = {
  id: string;
  label: string;
  yawDeg: number;
  pitchDeg: number;
  action: RealSpaceHotspotAction;
};

export type Panorama360AssetSlot = {
  /** 正式 2:1 等距柱状投影全景图地址；为 null 表示当前尚无真实全景素材，仅启用标定测试占位 */
  equirectangularSrc: string | null;
  /** 是否为测试占位素材（严禁拿普通 16:9 平面图冒充 360° 全景） */
  isTestPlaceholder: boolean;
  initialYawDeg: number;
  initialPitchDeg: number;
  minPitchDeg: number;
  maxPitchDeg: number;
  sphericalHotspots: SphericalPanoramaHotspot[];
  sourceNote: string;
};

export type DaxiongRealStation = {
  id: DaxiongStationId;
  title: string;
  shortTitle: string;
  zoneLabel: "殿外庭院" | "月台阶前" | "殿门廊下" | "殿内主坛";
  isInterior: boolean;
  image: string;
  imageAlt: string;
  aspectRatio: "16:9";
  surface: WalkSurfaceKind;
  caption: string;
  /** 16:9 实景机位上的有限低干扰建筑热点 */
  hotspots: RealSpaceHotspot[];
  /** 标准化 360° 全景接口槽位（待正式 2:1 全景摄影素材制作完成后直接替换） */
  panorama360: Panorama360AssetSlot;
};

export const DAXIONG_STATION_ORDER: DaxiongStationId[] = [
  "courtyard-far",
  "marble-steps",
  "plaque-terrace",
  "doorway-threshold",
  "hall-interior",
];

export const DAXIONG_REAL_STATIONS: Record<DaxiongStationId, DaxiongRealStation> =
  {
    "courtyard-far": {
      id: "courtyard-far",
      title: "庭院远观 · 重檐全貌",
      shortTitle: "庭院远观",
      zoneLabel: "殿外庭院",
      isInterior: false,
      image: daxiongExteriorImg,
      imageAlt: "大雄宝殿传统重檐木构与青石庭院正面实景",
      aspectRatio: "16:9",
      surface: "stone",
      caption:
        "立于青石庭院中轴，远观大雄宝殿重檐青瓦与白石月台。可点击台阶或两侧庭院路径前往对应空间。",
      hotspots: [
        {
          id: "far-to-steps",
          label: "沿石阶上行",
          hint: "前往铜炉与白石台阶前",
          xPct: 50,
          yPct: 78,
          landmark: "中央白石台阶",
          action: { type: "station", targetStationId: "marble-steps" },
        },
        {
          id: "far-to-guanyin",
          label: "西侧 · 观音殿",
          hint: "前往观音殿清莲庭院",
          xPct: 14,
          yPct: 84,
          landmark: "西侧青石庭路",
          action: {
            type: "scene",
            targetSceneId: "buddhist-guanyin",
            sceneLabel: "观音殿",
          },
        },
        {
          id: "far-to-culture",
          label: "东侧 · 藏经阁",
          hint: "前往寺院建筑文化与藏经阁",
          xPct: 86,
          yPct: 84,
          landmark: "东侧青石庭路",
          action: {
            type: "scene",
            targetSceneId: "buddhist-culture",
            sceneLabel: "藏经阁",
          },
        },
      ],
      panorama360: {
        equirectangularSrc: null,
        isTestPlaceholder: true,
        initialYawDeg: 0,
        initialPitchDeg: 0,
        minPitchDeg: -34,
        maxPitchDeg: 38,
        sphericalHotspots: [
          {
            id: "pano-far-steps",
            label: "沿石阶登月台",
            yawDeg: 0,
            pitchDeg: -6,
            action: { type: "station", targetStationId: "marble-steps" },
          },
          {
            id: "pano-far-west",
            label: "西侧庭院 · 观音殿",
            yawDeg: -58,
            pitchDeg: -4,
            action: {
              type: "scene",
              targetSceneId: "buddhist-guanyin",
              sceneLabel: "观音殿",
            },
          },
          {
            id: "pano-far-east",
            label: "东侧庭院 · 藏经阁",
            yawDeg: 58,
            pitchDeg: -4,
            action: {
              type: "scene",
              targetSceneId: "buddhist-culture",
              sceneLabel: "藏经阁",
            },
          },
        ],
        sourceNote:
          "当前未包含真实 2:1 庭院全景图，此视图为 360° 全景接口标定测试占位；正式素材就位后替换 equirectangularSrc 即可。",
      },
    },

    "marble-steps": {
      id: "marble-steps",
      title: "白石阶前 · 铜炉香烟",
      shortTitle: "白石阶前",
      zoneLabel: "月台阶前",
      isInterior: false,
      image: daxiongSeqStepsImg,
      imageAlt: "大雄宝殿白石台阶与青铜三足香炉实景",
      aspectRatio: "16:9",
      surface: "stone",
      caption:
        "拾级而上立于三足铜鼎香炉前，透过敞开正门已可遥见殿内释迦牟尼佛莲座金身。",
      hotspots: [
        {
          id: "steps-to-terrace",
          label: "登临月台",
          hint: "前往「大雄寶殿」匾额下",
          xPct: 50,
          yPct: 57,
          landmark: "月台上部石阶",
          action: { type: "station", targetStationId: "plaque-terrace" },
        },
        {
          id: "steps-back-far",
          label: "退回庭院",
          hint: "回到庭院远观大殿全景",
          xPct: 50,
          yPct: 89,
          landmark: "下层青石平台",
          action: { type: "station", targetStationId: "courtyard-far" },
        },
      ],
      panorama360: {
        equirectangularSrc: null,
        isTestPlaceholder: true,
        initialYawDeg: 0,
        initialPitchDeg: 2,
        minPitchDeg: -32,
        maxPitchDeg: 38,
        sphericalHotspots: [
          {
            id: "pano-steps-terrace",
            label: "登临月台匾前",
            yawDeg: 0,
            pitchDeg: 2,
            action: { type: "station", targetStationId: "plaque-terrace" },
          },
          {
            id: "pano-steps-back",
            label: "回望庭院",
            yawDeg: 180,
            pitchDeg: -6,
            action: { type: "station", targetStationId: "courtyard-far" },
          },
        ],
        sourceNote: "月台石阶 360° 全景预留接口（测试占位）。",
      },
    },

    "plaque-terrace": {
      id: "plaque-terrace",
      title: "月台檐下 · 正门牌匾",
      shortTitle: "月台匾前",
      zoneLabel: "月台阶前",
      isInterior: false,
      image: daxiongSeqApproachImg,
      imageAlt: "大雄宝殿月台正面与黑底金字匾额实景",
      aspectRatio: "16:9",
      surface: "stone",
      caption:
        "立于白石月台正中，「大雄寶殿」匾额高悬檐下，两侧楹联规整，殿门完全敞开。",
      hotspots: [
        {
          id: "terrace-to-doorway",
          label: "走近殿门",
          hint: "前往雕花木门与实木门槛",
          xPct: 50,
          yPct: 60,
          landmark: "中央敞开正门",
          action: { type: "station", targetStationId: "doorway-threshold" },
        },
        {
          id: "terrace-back-steps",
          label: "退回石阶",
          xPct: 50,
          yPct: 89,
          landmark: "月台下阶沿",
          action: { type: "station", targetStationId: "marble-steps" },
        },
      ],
      panorama360: {
        equirectangularSrc: null,
        isTestPlaceholder: true,
        initialYawDeg: 0,
        initialPitchDeg: 0,
        minPitchDeg: -34,
        maxPitchDeg: 36,
        sphericalHotspots: [
          {
            id: "pano-terrace-door",
            label: "走近殿门门槛",
            yawDeg: 0,
            pitchDeg: -2,
            action: { type: "station", targetStationId: "doorway-threshold" },
          },
          {
            id: "pano-terrace-back",
            label: "回望月台外庭院",
            yawDeg: 180,
            pitchDeg: -5,
            action: { type: "station", targetStationId: "marble-steps" },
          },
        ],
        sourceNote: "月台檐下 360° 全景预留接口（测试占位）。",
      },
    },

    "doorway-threshold": {
      id: "doorway-threshold",
      title: "殿门廊下 · 雕花门槛",
      shortTitle: "殿门门槛",
      zoneLabel: "殿门廊下",
      isInterior: false,
      image: daxiongSeqDoorwayImg,
      imageAlt: "大雄宝殿正门敞开木门与门槛内外衔接实景",
      aspectRatio: "16:9",
      surface: "wood",
      caption:
        "驻足红木门框与门槛外，门内金砖地面与紫檀供桌静立其间，跨过门槛即可入殿礼敬。",
      hotspots: [
        {
          id: "doorway-enter-hall",
          label: "跨槛入殿礼佛",
          hint: "进入大雄宝殿殿内主坛",
          xPct: 50,
          yPct: 65,
          landmark: "门槛内金砖中道",
          action: { type: "station", targetStationId: "hall-interior" },
        },
        {
          id: "doorway-back-terrace",
          label: "退回月台",
          xPct: 50,
          yPct: 90,
          landmark: "廊下花岗岩地面",
          action: { type: "station", targetStationId: "plaque-terrace" },
        },
      ],
      panorama360: {
        equirectangularSrc: null,
        isTestPlaceholder: true,
        initialYawDeg: 0,
        initialPitchDeg: -2,
        minPitchDeg: -34,
        maxPitchDeg: 34,
        sphericalHotspots: [
          {
            id: "pano-door-in",
            label: "步入大殿主坛",
            yawDeg: 0,
            pitchDeg: -4,
            action: { type: "station", targetStationId: "hall-interior" },
          },
          {
            id: "pano-door-out",
            label: "转身回看月台庭院",
            yawDeg: 180,
            pitchDeg: -3,
            action: { type: "station", targetStationId: "plaque-terrace" },
          },
        ],
        sourceNote: "门槛廊下 360° 全景预留接口（测试占位）。",
      },
    },

    "hall-interior": {
      id: "hall-interior",
      title: "殿内主坛 · 释迦牟尼佛",
      shortTitle: "殿内主坛",
      zoneLabel: "殿内主坛",
      isInterior: true,
      image: daxiongAltV2Img,
      imageAlt: "大雄宝殿殿内释迦牟尼佛金身莲座与传统木质供桌实景",
      aspectRatio: "16:9",
      surface: "jinzhuan",
      caption:
        "殿内正中释迦牟尼佛安详端坐，紫檀供桌与金砖地面比例庄严。可在下方或面板进行上香、点灯、供花与礼佛。",
      hotspots: [
        {
          id: "interior-exit-door",
          label: "退至殿门外",
          hint: "返回大殿门口与庭院",
          xPct: 86,
          yPct: 82,
          landmark: "殿右侧出廊通道",
          action: { type: "station", targetStationId: "doorway-threshold" },
        },
      ],
      panorama360: {
        equirectangularSrc: null,
        isTestPlaceholder: true,
        initialYawDeg: 0,
        initialPitchDeg: 0,
        minPitchDeg: -34,
        maxPitchDeg: 38,
        sphericalHotspots: [
          {
            id: "pano-hall-exit",
            label: "回身出正门返月台",
            yawDeg: 180,
            pitchDeg: -4,
            action: { type: "station", targetStationId: "doorway-threshold" },
          },
        ],
        sourceNote:
          "殿内主坛 360° 全景预留接口（当前为标定测试图，待正式拍摄/渲染 2:1 殿内全景后直接替换）。",
      },
    },
  };

/**
 * 生成严格符合 2:1 等距柱状投影（Equirectangular）的标定测试占位纹理：
 * 明确标识“测试占位图”与四方方位，绝不使用普通 16:9 平面图冒充 360° 全景。
 */
export function buildEquirectangularTestTextureCanvas(
  station: DaxiongRealStation,
): HTMLCanvasElement | null {
  if (typeof document === "undefined") return null;
  const width = 2048;
  const height = 1024;
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;

  // Sky / ceiling & stone / jinzhuan floor gradient
  const grad = ctx.createLinearGradient(0, 0, 0, height);
  if (station.isInterior) {
    grad.addColorStop(0, "#1c1310");
    grad.addColorStop(0.46, "#3a241b");
    grad.addColorStop(0.5, "#4c3224");
    grad.addColorStop(0.54, "#242220");
    grad.addColorStop(1, "#141312");
  } else {
    grad.addColorStop(0, "#243442");
    grad.addColorStop(0.36, "#4d616e");
    grad.addColorStop(0.49, "#8a7f70");
    grad.addColorStop(0.51, "#5c5750");
    grad.addColorStop(1, "#2b2824");
  }
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, width, height);

  // Subtle equirectangular longitude/latitude calibration lines
  ctx.strokeStyle = "rgba(229, 193, 124, 0.24)";
  ctx.lineWidth = 1.5;
  for (let lon = 0; lon <= 12; lon += 1) {
    const x = (lon / 12) * width;
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, height);
    ctx.stroke();
  }
  for (let lat = 1; lat < 6; lat += 1) {
    const y = (lat / 6) * height;
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(width, y);
    ctx.stroke();
  }

  // Horizon line
  ctx.strokeStyle = "rgba(229, 193, 124, 0.65)";
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.moveTo(0, height / 2);
  ctx.lineTo(width, height / 2);
  ctx.stroke();

  // Cardinal bearings mapped cleanly along 360° azimuth
  // Note: Three.js SphereGeometry with scale(-1, 1, 1) maps u=0.5 near -Z / +X depending on camera rotation;
  // we align yaw=0° at u=0.5 (center of texture)
  const bearings = [
    { u: 0.5, title: "正前方 0° · 大雄宝殿中轴", sub: station.title },
    { u: 0.75, title: "东侧 +90° · 东回廊 / 藏经阁", sub: "东侧方位标定" },
    { u: 0.25, title: "西侧 -90° · 西回廊 / 观音殿", sub: "西侧方位标定" },
    { u: 0.0, title: "正后方 ±180° · 退回方向", sub: "山门 / 庭院回望" },
    { u: 1.0, title: "正后方 ±180° · 退回方向", sub: "山门 / 庭院回望" },
  ];

  ctx.textAlign = "center";
  bearings.forEach((b) => {
    const x = b.u * width;
    ctx.fillStyle = "rgba(20, 14, 11, 0.72)";
    ctx.fillRect(x - 160, height / 2 - 58, 320, 92);
    ctx.strokeStyle = "rgba(229, 193, 124, 0.55)";
    ctx.strokeRect(x - 160, height / 2 - 58, 320, 92);

    ctx.fillStyle = "#f5e6c8";
    ctx.font = "bold 22px serif";
    ctx.fillText(b.title, x, height / 2 - 20);

    ctx.fillStyle = "#c9b89c";
    ctx.font = "16px sans-serif";
    ctx.fillText(b.sub, x, height / 2 + 12);
  });

  // Top explicit watermark banner so placeholder status is unmistakable
  ctx.fillStyle = "rgba(20, 14, 11, 0.78)";
  ctx.fillRect(width / 2 - 360, 130, 720, 74);
  ctx.fillStyle = "#e5c17c";
  ctx.font = "bold 22px sans-serif";
  ctx.fillText(
    "360° 等距柱状投影全景接口 · 标定测试占位视图",
    width / 2,
    164,
  );
  ctx.fillStyle = "#dfd2bf";
  ctx.font = "15px sans-serif";
  ctx.fillText(
    "请勿以普通 16:9 照片冒充全景；正式 2:1 全景图替换后将自动切换为真实摄影环顾",
    width / 2,
    190,
  );

  return canvas;
}
