export type SpatialBoundingBox = {
  minX: number;
  maxX: number;
  minY: number;
  maxY: number;
  minZ: number;
  maxZ: number;
};

export type SpatialRestrictedZone = {
  id: string;
  label: string;
  minX: number;
  maxX: number;
  minZ: number;
  maxZ: number;
};

export type SpatialPathNode = {
  id: string;
  label: string;
  role: "entrance" | "waypoint" | "focal" | "exit";
  position: [number, number, number];
  yawDeg: number;
  pitchDeg: number;
  connectedIds: string[];
};

export type SpatialAnchorKind =
  | "buddha-statue"
  | "altar-table"
  | "incense-burner"
  | "offering-lamp"
  | "flower-vase"
  | "prayer-mat";

export type SpatialInteractiveAnchor = {
  id: string;
  kind: SpatialAnchorKind;
  label: string;
  position: [number, number, number];
  radius: number;
  colorHex: string;
  interactionHint: string;
  reservedState: "placeholder-anchor";
};

export type SpatialCameraPoseSpec = {
  position: [number, number, number];
  yawDeg: number;
  pitchDeg: number;
};

export type SpatialSceneSpec = {
  id: string;
  title: string;
  subtitle: string;
  traditionScope: "shared" | "buddhist" | "daoist";
  asset: {
    url: string;
    format: "spz" | "ply" | "splat" | "ksplat" | "sog" | "unknown";
    approxSizeLabel: string;
    isLocalAsset: boolean;
    isTempleScan: boolean;
    sourceOrigin: string;
    license: string;
    attributionNote: string;
  };
  transform: {
    /** OpenCV -> Three.js Y-up flip typically uses [1, 0, 0, 0] */
    quaternion: [number, number, number, number];
    position: [number, number, number];
    scale: number;
  };
  navigation: {
    initialPose: SpatialCameraPoseSpec;
    defaultSpeed: number;
    minSpeed: number;
    maxSpeed: number;
    walkableBounds: SpatialBoundingBox;
    restrictedZones: SpatialRestrictedZone[];
    pathNodes: SpatialPathNode[];
    entranceNodeId: string;
    exitNodeId: string;
    targetSceneLink?: string;
    /** 明确标明当前仅实现配置式包围盒限制，未声明完整 3D 网格自动碰撞 */
    collisionImplementation: "configured-aabb-bounds-only";
  };
  interactiveAnchors: SpatialInteractiveAnchor[];
};

export const DEFAULT_TEMPLE_FUTURE_ANCHORS: SpatialInteractiveAnchor[] = [
  {
    id: "anchor-buddha",
    kind: "buddha-statue",
    label: "圣像主尊预留位",
    position: [0, 0.45, -1.85],
    radius: 0.42,
    colorHex: "#e5c17c",
    interactionHint: "未来可绑定礼佛瞻仰视角与独立碰撞体",
    reservedState: "placeholder-anchor",
  },
  {
    id: "anchor-altar",
    kind: "altar-table",
    label: "供桌区域预留位",
    position: [0, -0.25, -1.05],
    radius: 0.55,
    colorHex: "#c98b4e",
    interactionHint: "未来供品容器父节点，承载香炉/供灯/花瓶",
    reservedState: "placeholder-anchor",
  },
  {
    id: "anchor-incense",
    kind: "incense-burner",
    label: "香炉互动位",
    position: [0, 0.02, -1.02],
    radius: 0.16,
    colorHex: "#ef8a4b",
    interactionHint: "未来点击上香与烟雾粒子锚点",
    reservedState: "placeholder-anchor",
  },
  {
    id: "anchor-lamp",
    kind: "offering-lamp",
    label: "供灯互动位",
    position: [0.36, 0.02, -1.02],
    radius: 0.14,
    colorHex: "#f4d06f",
    interactionHint: "未来供灯点亮与局部点光源锚点",
    reservedState: "placeholder-anchor",
  },
  {
    id: "anchor-flower",
    kind: "flower-vase",
    label: "花瓶供花位",
    position: [-0.36, 0.02, -1.02],
    radius: 0.14,
    colorHex: "#7ec49f",
    interactionHint: "未来净瓶供花切换锚点",
    reservedState: "placeholder-anchor",
  },
  {
    id: "anchor-prayer",
    kind: "prayer-mat",
    label: "礼拜祈愿区",
    position: [0, -0.55, -0.15],
    radius: 0.46,
    colorHex: "#8fb7d8",
    interactionHint: "未来拜垫礼敬与祈愿交互触发区",
    reservedState: "placeholder-anchor",
  },
];

export const SPATIAL_LAB_SCENES: SpatialSceneSpec[] = [
  {
    id: "spark-fireplace",
    title: "室内壁炉空间（本地 3DGS 测试场景）",
    subtitle: "真实室内空间扫描 · 验证近距离前后穿行、左右环顾与空间边界约束",
    traditionScope: "shared",
    asset: {
      url: "/splats/fireplace.spz",
      format: "spz",
      approxSizeLabel: "4.2 MB",
      isLocalAsset: true,
      isTempleScan: false,
      sourceOrigin: "World Labs Spark 官方开源示例资产（已本地托管于 public/splats/fireplace.spz）",
      license: "MIT License (sparkjsdev/spark 示例资源)",
      attributionNote:
        "合法公开测试 3DGS 场景，仅用于验证连续空间漫游技术底层；非真实佛寺建筑扫描。",
    },
    transform: {
      quaternion: [1, 0, 0, 0],
      position: [0, 0, 0],
      scale: 1,
    },
    navigation: {
      initialPose: { position: [0, 0.1, 1.9], yawDeg: 0, pitchDeg: -3 },
      defaultSpeed: 1.4,
      minSpeed: 0.4,
      maxSpeed: 3.6,
      walkableBounds: {
        minX: -2.6,
        maxX: 2.6,
        minY: -0.45,
        maxY: 1.15,
        minZ: -1.65,
        maxZ: 3.2,
      },
      restrictedZones: [
        {
          id: "hearth-barrier",
          label: "前方主焦点禁入区（模拟供桌/壁炉前止步边界）",
          minX: -0.85,
          maxX: 0.85,
          minZ: -2.0,
          maxZ: -0.88,
        },
      ],
      pathNodes: [
        {
          id: "node-entrance",
          label: "入口起点",
          role: "entrance",
          position: [0, 0.1, 2.3],
          yawDeg: 0,
          pitchDeg: -2,
          connectedIds: ["node-center"],
        },
        {
          id: "node-center",
          label: "室内中段",
          role: "waypoint",
          position: [0, 0.08, 0.85],
          yawDeg: 0,
          pitchDeg: -4,
          connectedIds: ["node-entrance", "node-focal"],
        },
        {
          id: "node-focal",
          label: "焦点正前",
          role: "focal",
          position: [0, 0.05, -0.65],
          yawDeg: 0,
          pitchDeg: -6,
          connectedIds: ["node-center"],
        },
      ],
      entranceNodeId: "node-entrance",
      exitNodeId: "node-entrance",
      targetSceneLink: "/worlds/buddhist?scene=buddhist-daxiong",
      collisionImplementation: "configured-aabb-bounds-only",
    },
    interactiveAnchors: DEFAULT_TEMPLE_FUTURE_ANCHORS,
  },
  {
    id: "spark-valley",
    title: "山谷开阔空间（远程 3DGS 测试场景）",
    subtitle: "大尺度室外地形扫描 · 验证远近景深度视差与大范围连续移动",
    traditionScope: "shared",
    asset: {
      url: "https://sparkjs.dev/assets/splats/valley.spz",
      format: "spz",
      approxSizeLabel: "6.4 MB",
      isLocalAsset: false,
      isTempleScan: false,
      sourceOrigin: "https://sparkjs.dev/assets/splats/valley.spz (World Labs Spark)",
      license: "MIT License (sparkjsdev/spark 示例资源)",
      attributionNote:
        "外部 HTTPS 测试资源（CORS 允许跨域）；若离线环境加载失败，请切回本地托管的室内壁炉场景。",
    },
    transform: {
      quaternion: [1, 0, 0, 0],
      position: [0, 0, 0],
      scale: 1,
    },
    navigation: {
      initialPose: { position: [0, 0.25, 2.6], yawDeg: 0, pitchDeg: -4 },
      defaultSpeed: 1.8,
      minSpeed: 0.5,
      maxSpeed: 4.5,
      walkableBounds: {
        minX: -6,
        maxX: 6,
        minY: -0.6,
        maxY: 2.8,
        minZ: -6,
        maxZ: 6,
      },
      restrictedZones: [],
      pathNodes: [
        {
          id: "valley-start",
          label: "外山起点",
          role: "entrance",
          position: [0, 0.25, 2.8],
          yawDeg: 0,
          pitchDeg: -4,
          connectedIds: ["valley-mid"],
        },
        {
          id: "valley-mid",
          label: "山谷中道",
          role: "waypoint",
          position: [0, 0.2, 0.6],
          yawDeg: 10,
          pitchDeg: -5,
          connectedIds: ["valley-start", "valley-end"],
        },
        {
          id: "valley-end",
          label: "深谷观景点",
          role: "focal",
          position: [-0.4, 0.15, -1.6],
          yawDeg: -12,
          pitchDeg: -4,
          connectedIds: ["valley-mid"],
        },
      ],
      entranceNodeId: "valley-start",
      exitNodeId: "valley-start",
      collisionImplementation: "configured-aabb-bounds-only",
    },
    interactiveAnchors: DEFAULT_TEMPLE_FUTURE_ANCHORS,
  },
  {
    id: "spark-snow-street",
    title: "雪街建筑通道（远程 3DGS 测试场景）",
    subtitle: "室外建筑纵深环境 · 验证沿建筑通道行进时的比例稳定性",
    traditionScope: "shared",
    asset: {
      url: "https://sparkjs.dev/assets/splats/snow-street.spz",
      format: "spz",
      approxSizeLabel: "9.5 MB",
      isLocalAsset: false,
      isTempleScan: false,
      sourceOrigin: "https://sparkjs.dev/assets/splats/snow-street.spz (World Labs Spark)",
      license: "MIT License (sparkjsdev/spark 示例资源)",
      attributionNote:
        "外部 HTTPS 测试资源（9.5 MB）；适合测试建筑纵深走道与左右转头观察。",
    },
    transform: {
      quaternion: [1, 0, 0, 0],
      position: [0, 0, 0],
      scale: 1,
    },
    navigation: {
      initialPose: { position: [0, 0.15, 2.2], yawDeg: 0, pitchDeg: -2 },
      defaultSpeed: 1.6,
      minSpeed: 0.4,
      maxSpeed: 4.0,
      walkableBounds: {
        minX: -5,
        maxX: 5,
        minY: -0.5,
        maxY: 2.2,
        minZ: -5,
        maxZ: 5,
      },
      restrictedZones: [],
      pathNodes: [
        {
          id: "street-start",
          label: "街口起点",
          role: "entrance",
          position: [0, 0.15, 2.2],
          yawDeg: 0,
          pitchDeg: -2,
          connectedIds: ["street-mid"],
        },
        {
          id: "street-mid",
          label: "中段走道",
          role: "waypoint",
          position: [0, 0.15, 0.2],
          yawDeg: 0,
          pitchDeg: -2,
          connectedIds: ["street-start", "street-far"],
        },
        {
          id: "street-far",
          label: "前段建筑",
          role: "focal",
          position: [0, 0.15, -1.8],
          yawDeg: 0,
          pitchDeg: -2,
          connectedIds: ["street-mid"],
        },
      ],
      entranceNodeId: "street-start",
      exitNodeId: "street-start",
      collisionImplementation: "configured-aabb-bounds-only",
    },
    interactiveAnchors: DEFAULT_TEMPLE_FUTURE_ANCHORS,
  },
];

export function detectSplatFormatFromName(
  nameOrUrl: string,
): SpatialSceneSpec["asset"]["format"] {
  const clean = nameOrUrl.split("?")[0].toLowerCase();
  if (clean.endsWith(".spz")) return "spz";
  if (clean.endsWith(".ply")) return "ply";
  if (clean.endsWith(".ksplat")) return "ksplat";
  if (clean.endsWith(".splat")) return "splat";
  if (clean.endsWith(".sog")) return "sog";
  return "unknown";
}

export function createCustomSpatialSceneSpec({
  title,
  url,
  fileName,
  sizeBytes,
}: {
  title: string;
  url: string;
  fileName?: string;
  sizeBytes?: number;
}): SpatialSceneSpec {
  const format = detectSplatFormatFromName(fileName || url);
  const sizeMb =
    typeof sizeBytes === "number" && sizeBytes > 0
      ? `${(sizeBytes / (1024 * 1024)).toFixed(1)} MB`
      : "自定义大小";

  return {
    id: `custom-${Date.now()}`,
    title,
    subtitle: "用户自定义 3DGS 场景验证（支持 .spz / .ply / .splat / .ksplat / .sog）",
    traditionScope: "shared",
    asset: {
      url,
      format,
      approxSizeLabel: sizeMb,
      isLocalAsset: Boolean(fileName),
      isTempleScan: false,
      sourceOrigin: fileName ? `本地导入文件：${fileName}` : url,
      license: "用户自行导入测试素材",
      attributionNote: "直接交由 Spark SplatMesh 真实解析渲染，无图片替代。",
    },
    transform: {
      quaternion: [1, 0, 0, 0],
      position: [0, 0, 0],
      scale: 1,
    },
    navigation: {
      initialPose: { position: [0, 0.2, 2.5], yawDeg: 0, pitchDeg: -3 },
      defaultSpeed: 1.6,
      minSpeed: 0.4,
      maxSpeed: 5.0,
      walkableBounds: {
        minX: -12,
        maxX: 12,
        minY: -2,
        maxY: 6,
        minZ: -12,
        maxZ: 12,
      },
      restrictedZones: [],
      pathNodes: [
        {
          id: "custom-origin",
          label: "初始观察位",
          role: "entrance",
          position: [0, 0.2, 2.5],
          yawDeg: 0,
          pitchDeg: -3,
          connectedIds: ["custom-center"],
        },
        {
          id: "custom-center",
          label: "空间中心",
          role: "focal",
          position: [0, 0.2, 0.4],
          yawDeg: 0,
          pitchDeg: -3,
          connectedIds: ["custom-origin"],
        },
      ],
      entranceNodeId: "custom-origin",
      exitNodeId: "custom-origin",
      collisionImplementation: "configured-aabb-bounds-only",
    },
    interactiveAnchors: DEFAULT_TEMPLE_FUTURE_ANCHORS,
  };
}
