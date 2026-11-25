import { useEffect, useId, useRef, useState } from "react";
import { PractitionerFigure } from "@/components/PractitionerStage";
import {
  SacredChantingAura,
  type FlowerStyle,
  type LampStyle,
} from "@/components/SacredInteractions";
import type { SceneConfig } from "@/data/scenes";
import type { PractitionerAction, ScenePeer } from "@/lib/presence";

/**
 * 佛殿统一四层实景融合互动舞台（覆盖地藏殿、大雄宝殿、观音殿、净土莲坛、藏经阁及后续佛殿）：
 * 1. 第一层（实景殿堂与融入光影的真实木质供桌）：保留各殿独立佛像、建筑与透视融合木桌
 * 2. 第二层（供桌桌面统一定位区域 `tabletopBox`）：先按 16:9 实景图锁定各殿供桌的有效桌面区域，
 *    所有供奉物品（花瓶底座、三足铜香炉足底、供灯底座）均以桌面底边 `bottom: 0px` 精确落位，绝不悬浮
 * 3. 第三层（殿内地面空间融合人物层）：人物背对镜头面向圣像，稳居殿内清净地面走道且全流程不遮挡供桌物品与佛像
 * 4. 第四层（地面拜垫与落地木鱼）：与人物立位同轴协调锚定，绝无漂浮提示或遮挡气泡
 */

type HallTone = "daxiong" | "guanyin" | "dizang" | "pureland" | "culture";

type TabletopZone = {
  leftPct: number; // 供桌有效桌面左沿（16:9 实景图横向百分比）
  widthPct: number; // 供桌有效桌面宽度（16:9 实景图横向百分比）
  bottomPct: number; // 供桌木质桌面承物平面的真实位置（距 16:9 实景图底边百分比）
};

type HallAltarPlacementConfig = {
  tone: HallTone;
  scale: number;
  tabletopBox: TabletopZone;
  tableLeftEdge: number; // 供桌整体外沿（含翘头）左边界，用于人物严格避让
  tableRightEdge: number; // 供桌整体外沿（含翘头）右边界
  flowerX: number; // 供花在 tabletopBox 内的横向百分比（0–100）
  incenseX: number; // 香炉在 tabletopBox 内的横向百分比（0–100）
  lampX: number; // 供灯在 tabletopBox 内的横向百分比（0–100）
  floorRest: { left: number; bottom: number }; // 殿内常态站位（16:9 基准坐标）
  floorActionSteps: {
    flower: { left: number; bottom: number };
    incense: { left: number; bottom: number };
    lamp: { left: number; bottom: number };
  };
  peerSlots?: { left: number; bottom: number; scale: number }[];
};

const HALL_ALTAR_PLACEMENTS: Record<string, HallAltarPlacementConfig> = {
  "buddhist-daxiong": {
    tone: "daxiong",
    scale: 0.94,
    tabletopBox: { leftPct: 35.5, widthPct: 29, bottomPct: 29.2 },
    tableLeftEdge: 33.5,
    tableRightEdge: 66.5,
    flowerX: 20,
    incenseX: 50,
    lampX: 80,
    floorRest: { left: 24.5, bottom: 8 },
    floorActionSteps: {
      flower: { left: 28, bottom: 10.5 },
      incense: { left: 29, bottom: 11 },
      lamp: { left: 71, bottom: 10.5 },
    },
  },
  "buddhist-guanyin": {
    tone: "guanyin",
    scale: 0.9,
    tabletopBox: { leftPct: 36.5, widthPct: 27, bottomPct: 34.0 },
    tableLeftEdge: 34.5,
    tableRightEdge: 65.5,
    flowerX: 17,
    incenseX: 50,
    lampX: 83,
    floorRest: { left: 25.5, bottom: 7.5 },
    floorActionSteps: {
      flower: { left: 29, bottom: 10.5 },
      incense: { left: 30, bottom: 11 },
      lamp: { left: 70.5, bottom: 10.5 },
    },
  },
  "buddhist-dizang": {
    tone: "dizang",
    scale: 0.94,
    // 精准对应地藏殿黑檀木供桌平直桌面区域（34.5%–65.5%，桌面承物平面 bottom = 36.8%）
    tabletopBox: { leftPct: 34.5, widthPct: 31, bottomPct: 36.8 },
    tableLeftEdge: 31.5,
    tableRightEdge: 68.5,
    // 18% 落在左胁侍与地藏主尊之间；50% 居中对正地藏圣像莲座下方；82% 落在右胁侍与主尊之间
    flowerX: 18,
    incenseX: 50,
    lampX: 82,
    // 人物立于左侧宽阔木地走道，动作全程不进入 31.5%–68.5% 供桌正前方，彻底避免遮挡
    floorRest: { left: 23.5, bottom: 7.5 },
    floorActionSteps: {
      flower: { left: 27, bottom: 10.2 },
      incense: { left: 28, bottom: 10.8 },
      lamp: { left: 72.5, bottom: 10.2 },
    },
  },
  "buddhist-pureland": {
    tone: "pureland",
    scale: 0.78,
    tabletopBox: { leftPct: 41.5, widthPct: 17, bottomPct: 36.8 },
    tableLeftEdge: 40.5,
    tableRightEdge: 59.5,
    flowerX: 18,
    incenseX: 50,
    lampX: 82,
    floorRest: { left: 36.5, bottom: 7.5 },
    floorActionSteps: {
      flower: { left: 38, bottom: 10.2 },
      incense: { left: 38.5, bottom: 10.5 },
      lamp: { left: 61.5, bottom: 10.2 },
    },
    peerSlots: [
      { left: 33.5, bottom: 37, scale: 0.58 },
      { left: 66.5, bottom: 37, scale: 0.58 },
      { left: 62.5, bottom: 9, scale: 0.74 },
      { left: 30, bottom: 37, scale: 0.56 },
      { left: 70, bottom: 37, scale: 0.56 },
    ],
  },
  "buddhist-culture": {
    tone: "culture",
    scale: 0.95,
    tabletopBox: { leftPct: 38.5, widthPct: 23, bottomPct: 30.2 },
    tableLeftEdge: 37.5,
    tableRightEdge: 64,
    flowerX: 14,
    incenseX: 35,
    lampX: 68,
    floorRest: { left: 27.5, bottom: 8 },
    floorActionSteps: {
      flower: { left: 31, bottom: 10.2 },
      incense: { left: 32, bottom: 10.8 },
      lamp: { left: 68, bottom: 10.2 },
    },
  },
};

const DEFAULT_ALTAR_PLACEMENT: HallAltarPlacementConfig = {
  tone: "daxiong",
  scale: 0.94,
  tabletopBox: { leftPct: 35.5, widthPct: 29, bottomPct: 30.5 },
  tableLeftEdge: 33.5,
  tableRightEdge: 66.5,
  flowerX: 20,
  incenseX: 50,
  lampX: 80,
  floorRest: { left: 24.5, bottom: 8 },
  floorActionSteps: {
    flower: { left: 28, bottom: 10.5 },
    incense: { left: 29, bottom: 11 },
    lamp: { left: 71, bottom: 10.5 },
  },
};

const FLANK_PEER_SLOTS: { left: number; bottom: number; scale: number }[] = [
  { left: 15, bottom: 14.5, scale: 0.72 },
  { left: 85, bottom: 14.5, scale: 0.72 },
  { left: 18, bottom: 20, scale: 0.66 },
  { left: 82, bottom: 20, scale: 0.66 },
  { left: 79, bottom: 10, scale: 0.76 },
  { left: 13.5, bottom: 9.5, scale: 0.76 },
];

type StageGeometry = {
  coverW: number;
  coverH: number;
  stageW: number;
  stageH: number;
};

/**
 * 将 16:9 实景图上的横向百分比映射为当前可视舞台横向百分比，
 * 并结合供桌左右边界确保手机窄屏下人物既不出画，也绝不遮挡桌面供品。
 */
function projectCoverXToStage(
  coverLeftPct: number,
  geometry: StageGeometry | null,
  sideConstraint?: { avoidSide: "left" | "right"; tableEdgeCoverPct: number },
): number {
  if (!geometry || geometry.stageW <= 0) {
    return Math.min(84, Math.max(16, coverLeftPct));
  }
  const { coverW, stageW } = geometry;
  const offsetX = (stageW - coverW) / 2;
  let px = offsetX + (coverLeftPct / 100) * coverW;

  if (sideConstraint) {
    const tableEdgePx = offsetX + (sideConstraint.tableEdgeCoverPct / 100) * coverW;
    const minMarginPx = Math.max(42, stageW * 0.12);
    if (sideConstraint.avoidSide === "left") {
      const maxClearPx = Math.max(minMarginPx, tableEdgePx - 26);
      px = Math.min(px, maxClearPx);
    } else {
      const minClearPx = Math.min(stageW - minMarginPx, tableEdgePx + 26);
      px = Math.max(px, minClearPx);
    }
  }

  const pct = (px / stageW) * 100;
  return Math.min(86, Math.max(14, pct));
}

export function getUnifiedBuddhistSelfCoords(
  action: PractitionerAction,
  sceneId = "buddhist-daxiong",
  geometry: StageGeometry | null = null,
): {
  left: number;
  bottom: number;
  perspectiveScale: number;
} {
  const cfg = HALL_ALTAR_PLACEMENTS[sceneId] || DEFAULT_ALTAR_PLACEMENT;

  if (action === "flower") {
    return {
      left: projectCoverXToStage(cfg.floorActionSteps.flower.left, geometry, {
        avoidSide: "left",
        tableEdgeCoverPct: cfg.tableLeftEdge,
      }),
      bottom: cfg.floorActionSteps.flower.bottom,
      perspectiveScale: 0.94,
    };
  }
  if (action === "incense") {
    return {
      left: projectCoverXToStage(cfg.floorActionSteps.incense.left, geometry, {
        avoidSide: "left",
        tableEdgeCoverPct: cfg.tableLeftEdge,
      }),
      bottom: cfg.floorActionSteps.incense.bottom,
      perspectiveScale: 0.93,
    };
  }
  if (action === "lamp") {
    return {
      left: projectCoverXToStage(cfg.floorActionSteps.lamp.left, geometry, {
        avoidSide: "right",
        tableEdgeCoverPct: cfg.tableRightEdge,
      }),
      bottom: cfg.floorActionSteps.lamp.bottom,
      perspectiveScale: 0.94,
    };
  }
  if (action === "lifo") {
    return {
      left: projectCoverXToStage(cfg.floorRest.left, geometry, {
        avoidSide: "left",
        tableEdgeCoverPct: cfg.tableLeftEdge,
      }),
      bottom: Math.max(5.5, cfg.floorRest.bottom - 0.8),
      perspectiveScale: 1,
    };
  }
  if (action === "woodfish" || action === "chanting") {
    return {
      left: projectCoverXToStage(cfg.floorRest.left, geometry, {
        avoidSide: "left",
        tableEdgeCoverPct: cfg.tableLeftEdge,
      }),
      bottom: cfg.floorRest.bottom,
      perspectiveScale: 1,
    };
  }

  return {
    left: projectCoverXToStage(cfg.floorRest.left, geometry, {
      avoidSide: "left",
      tableEdgeCoverPct: cfg.tableLeftEdge,
    }),
    bottom: cfg.floorRest.bottom,
    perspectiveScale: 1,
  };
}

function AltarFlowerSVG({
  style,
  hallTone,
}: {
  style: FlowerStyle;
  hallTone: HallTone;
}) {
  const uid = useId().replace(/[^a-zA-Z0-9_-]/g, "");
  const sunlitBoost = hallTone === "guanyin" || hallTone === "culture";

  if (style === "chrysanthemum") {
    return (
      <svg
        viewBox="0 0 72 78"
        className="h-12 w-10 sm:h-14 sm:w-12 overflow-visible drop-shadow-[0_3px_5px_rgba(0,0,0,0.5)]"
      >
        <defs>
          <linearGradient id={`chry-stem-${uid}`} x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#66986f" />
            <stop offset="100%" stopColor="#2e5035" />
          </linearGradient>
          <radialGradient id={`chry-petal-${uid}`} cx="45%" cy="22%" r="80%">
            <stop offset="0%" stopColor={sunlitBoost ? "#fff8d4" : "#fff1b8"} />
            <stop offset="52%" stopColor="#e6bd52" />
            <stop offset="100%" stopColor="#ab781d" />
          </radialGradient>
        </defs>
        <path
          d="M35 78 C34 58 34 45 33 29"
          stroke={`url(#chry-stem-${uid})`}
          strokeWidth="2.3"
          strokeLinecap="round"
          fill="none"
        />
        <path
          d="M34 56 C41 47 47 41 51 32"
          stroke="#46724e"
          strokeWidth="1.7"
          strokeLinecap="round"
          fill="none"
        />
        <path d="M34 60 Q21 53 17 44 Q28 47 34 56 Z" fill="#46734f" />
        <path d="M34 54 Q46 47 50 38 Q39 42 34 51 Z" fill="#355a3d" />
        <path d="M35 45 Q24 39 21 32 Q30 35 34 42 Z" fill="#51805a" />

        <g transform="translate(51, 30) scale(0.56)" className="animate-petal-center">
          {[0, 45, 90, 135, 180, 225, 270, 315].map((deg) => (
            <ellipse
              key={deg}
              cx="0"
              cy="-7.5"
              rx="2.6"
              ry="8.2"
              transform={`rotate(${deg})`}
              fill={`url(#chry-petal-${uid})`}
              opacity="0.92"
            />
          ))}
          <circle cx="0" cy="0" r="3.6" fill="#c27d18" />
        </g>

        <g transform="translate(33, 27)" className="animate-petal-center">
          {[0, 25, 50, 75, 100, 125, 150, 175, 200, 225, 250, 275, 300, 325].map(
            (deg) => (
              <ellipse
                key={deg}
                cx="0"
                cy="-9.5"
                rx="2.7"
                ry="10.2"
                transform={`rotate(${deg})`}
                fill={`url(#chry-petal-${uid})`}
                opacity={deg % 50 === 0 ? "0.98" : "0.86"}
              />
            ),
          )}
          <circle cx="0" cy="0" r="4.6" fill="#be7a16" />
          <circle cx="-0.7" cy="-0.8" r="2.1" fill="#fce79e" />
        </g>
      </svg>
    );
  }

  if (style === "jasmine") {
    return (
      <svg
        viewBox="0 0 72 78"
        className="h-12 w-10 sm:h-14 sm:w-12 overflow-visible drop-shadow-[0_3px_5px_rgba(0,0,0,0.5)]"
      >
        <defs>
          <radialGradient id={`jas-petal-${uid}`} cx="42%" cy="24%" r="76%">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="68%" stopColor="#f1e9d8" />
            <stop offset="100%" stopColor="#c7baa1" />
          </radialGradient>
        </defs>
        <path
          d="M35 78 C34 59 35 46 33 30"
          stroke="#3e6a49"
          strokeWidth="2.1"
          strokeLinecap="round"
          fill="none"
        />
        <path
          d="M34 52 C27 43 22 36 19 27"
          stroke="#4b7b57"
          strokeWidth="1.7"
          strokeLinecap="round"
          fill="none"
        />
        <path
          d="M35 48 C43 40 48 34 51 26"
          stroke="#3b6345"
          strokeWidth="1.7"
          strokeLinecap="round"
          fill="none"
        />
        <path d="M34 60 Q23 53 18 46 Q27 48 34 56 Z" fill="#467250" />
        <path d="M35 56 Q45 49 51 42 Q41 44 35 52 Z" fill="#355a3d" />
        <path d="M27 42 Q21 37 19 32 Q25 34 29 39 Z" fill="#52825c" />
        {[
          { x: 33, y: 26, scale: 1.02 },
          { x: 19, y: 25, scale: 0.78 },
          { x: 51, y: 24, scale: 0.74 },
        ].map((blossom, idx) => (
          <g
            key={idx}
            transform={`translate(${blossom.x}, ${blossom.y}) scale(${blossom.scale})`}
            className="animate-petal-center"
          >
            {[0, 72, 144, 216, 288].map((deg) => (
              <ellipse
                key={deg}
                cx="0"
                cy="-6"
                rx="3.1"
                ry="6.4"
                transform={`rotate(${deg})`}
                fill={`url(#jas-petal-${uid})`}
              />
            ))}
            <circle cx="0" cy="0" r="2.3" fill="#dfb956" />
          </g>
        ))}
      </svg>
    );
  }

  return (
    <svg
      viewBox="0 0 72 78"
      className="h-12 w-10 sm:h-14 sm:w-12 overflow-visible drop-shadow-[0_3px_5px_rgba(0,0,0,0.5)]"
    >
      <defs>
        <linearGradient id={`lotus-outer-${uid}`} x1="0" y1="0" x2="0.2" y2="1">
          <stop offset="0%" stopColor={sunlitBoost ? "#fde0ea" : "#fbd4e0"} />
          <stop offset="55%" stopColor="#e58eab" />
          <stop offset="100%" stopColor="#ae5271" />
        </linearGradient>
        <linearGradient id={`lotus-inner-${uid}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#fff7fa" />
          <stop offset="65%" stopColor="#f5b8cb" />
          <stop offset="100%" stopColor="#cf708f" />
        </linearGradient>
      </defs>
      <path
        d="M34 78 C33 59 34 48 33 35"
        stroke="#436f4d"
        strokeWidth="2.3"
        strokeLinecap="round"
        fill="none"
      />
      <path
        d="M34 57 C42 47 48 40 53 31"
        stroke="#396042"
        strokeWidth="1.7"
        strokeLinecap="round"
        fill="none"
      />
      <path d="M34 60 Q21 52 16 42 Q27 46 34 55 Z" fill="#467351" />
      <path d="M34 56 Q46 49 52 40 Q41 44 34 52 Z" fill="#34593c" />
      <ellipse
        cx="21"
        cy="42"
        rx="8.5"
        ry="3.2"
        transform="rotate(-16 21 42)"
        fill="#4d7b56"
      />
      <g transform="translate(53, 28) rotate(16)">
        <path
          d="M0 -8 C-4.2 -3 -4 4 0 5 C4 4 4.2 -3 0 -8 Z"
          fill={`url(#lotus-inner-${uid})`}
        />
        <path
          d="M-3.5 1 Q0 5 3.5 1"
          fill="none"
          stroke="#467351"
          strokeWidth="1.4"
        />
      </g>
      <g transform="translate(1, 0)">
        <path
          d="M33 38 C23 37 16 31 15 22 C22 23 29 29 33 38 Z"
          fill={`url(#lotus-outer-${uid})`}
          className="animate-petal-outer-left"
        />
        <path
          d="M33 38 C43 37 50 31 51 22 C44 23 37 29 33 38 Z"
          fill={`url(#lotus-outer-${uid})`}
          className="animate-petal-outer-right"
        />
        <path
          d="M33 38 C25 33 22 24 23 15 C28 19 32 27 33 38 Z"
          fill={`url(#lotus-inner-${uid})`}
          className="animate-petal-left"
        />
        <path
          d="M33 38 C41 33 44 24 43 15 C38 19 34 27 33 38 Z"
          fill={`url(#lotus-inner-${uid})`}
          className="animate-petal-right"
        />
        <path
          d="M33 11 C27.5 20 27.5 30 33 38 C38.5 30 38.5 20 33 11 Z"
          fill="#fff9fb"
          className="animate-petal-center"
        />
        <circle cx="33" cy="27" r="2.5" fill="#ebbd52" />
      </g>
    </svg>
  );
}

/**
 * 写实青瓷花瓶：底座最下沿精确对齐 SVG 最底端 y=50（0px 留白），确保稳稳接触桌面
 */
function AltarPorcelainVase({ hallTone }: { hallTone: HallTone }) {
  const uid = useId().replace(/[^a-zA-Z0-9_-]/g, "");
  const glazeId = `vase-glaze-${uid}`;
  const specId = `vase-spec-${uid}`;
  const purelandTone = hallTone === "pureland";
  const sunlitTone = hallTone === "guanyin" || hallTone === "culture";
  const solemnTone = hallTone === "dizang";

  return (
    <div className="relative flex flex-col items-center">
      <svg
        viewBox="0 0 46 50"
        className="relative h-9 w-8 sm:h-10 sm:w-9 overflow-visible"
      >
        <defs>
          <linearGradient id={glazeId} x1="0" y1="0" x2="1" y2="0.18">
            <stop
              offset="0%"
              stopColor={
                solemnTone
                  ? "#66857b"
                  : purelandTone
                    ? "#93b5aa"
                    : sunlitTone
                      ? "#8dad9e"
                      : "#7d9f94"
              }
            />
            <stop
              offset="28%"
              stopColor={
                solemnTone
                  ? "#bdd3cc"
                  : purelandTone
                    ? "#ecf4f1"
                    : sunlitTone
                      ? "#e9f2ed"
                      : "#dae8e2"
              }
            />
            <stop
              offset="65%"
              stopColor={
                solemnTone
                  ? "#7f9d94"
                  : purelandTone
                    ? "#abc5bd"
                    : "#97b4ab"
              }
            />
            <stop
              offset="100%"
              stopColor={solemnTone ? "#354942" : "#456057"}
            />
          </linearGradient>
          <linearGradient id={specId} x1="0" y1="0" x2="0" y2="1">
            <stop
              offset="0%"
              stopColor={
                sunlitTone ? "rgba(255,252,238,0.78)" : "rgba(255,255,255,0.62)"
              }
            />
            <stop offset="100%" stopColor="rgba(255,255,255,0.04)" />
          </linearGradient>
        </defs>

        {/* 桌面接触接地阴影（直接压在红木底座与桌面交界处 y=49） */}
        <ellipse
          cx="23.5"
          cy="49.5"
          rx="14.5"
          ry="3.2"
          fill="rgba(4, 2, 1, 0.86)"
        />

        {/* 红木小托座底沿严格落于 y=49.5（无任何下方悬空） */}
        <path
          d="M14 46 L32 46 L33.5 49 Q23 50.5 12.5 49 Z"
          fill="#26140d"
        />
        <ellipse cx="23" cy="45.9" rx="9" ry="1.8" fill="#46281c" />

        {/* 青瓷瓶体 */}
        <path
          d="M17 12 Q23 14.5 29 12 L27 19 Q35 26.5 33 39.5 L29 45.3 Q23 46.8 17 45.3 L13 39.5 Q11 26.5 19 19 Z"
          fill={`url(#${glazeId})`}
        />
        <path
          d="M17.5 21 Q23 22.8 28.5 21"
          fill="none"
          stroke="rgba(70, 96, 87, 0.35)"
          strokeWidth="0.9"
        />
        <path
          d="M19.2 17.5 C16 24.5 15.2 31.5 17.5 41"
          fill="none"
          stroke={`url(#${specId})`}
          strokeWidth="1.9"
          strokeLinecap="round"
        />
        <ellipse cx="23" cy="12" rx="6.2" ry="2.1" fill="#dcebe5" />
        <ellipse cx="23" cy="12.2" rx="4.6" ry="1.3" fill="#435b53" />
      </svg>
    </div>
  );
}

/**
 * 写实供灯：铜质底座最下沿精确对齐 SVG 底端 y=60（0px 留白），确保与桌面零缝隙接触
 */
function AltarLampVessel({
  style,
  lit,
  lampSeq,
  hallTone,
}: {
  style: LampStyle;
  lit: boolean;
  lampSeq: number;
  hallTone: HallTone;
}) {
  const uid = useId().replace(/[^a-zA-Z0-9_-]/g, "");
  const brassId = `lamp-brass-${uid}`;
  const cupId = `lamp-cup-${uid}`;
  const darkHall = hallTone === "dizang" || hallTone === "daxiong";

  return (
    <div className="relative flex flex-col items-center">
      {lit && (
        <div
          key={`lamp-surface-glow-${lampSeq}`}
          aria-hidden="true"
          className="pointer-events-none absolute -bottom-1.5 h-5 w-18 rounded-full blur-[2px]"
          style={{
            background: darkHall
              ? "radial-gradient(ellipse at center, rgba(255,198,92,0.52) 0%, rgba(244,158,52,0.18) 52%, transparent 82%)"
              : "radial-gradient(ellipse at center, rgba(255,212,126,0.42) 0%, rgba(255,180,72,0.14) 52%, transparent 80%)",
          }}
        />
      )}

      {lit && (
        <div
          key={`lamp-halo-${lampSeq}`}
          aria-hidden="true"
          className="animate-warm-halo pointer-events-none absolute -top-5 h-14 w-14 rounded-full"
          style={{
            background:
              style === "liuli"
                ? "radial-gradient(circle, rgba(255,232,158,0.55) 0%, rgba(168,218,242,0.2) 45%, transparent 74%)"
                : "radial-gradient(circle, rgba(255,214,120,0.62) 0%, rgba(232,148,58,0.18) 48%, transparent 75%)",
          }}
        />
      )}

      <svg
        viewBox="0 0 60 60"
        className="relative h-9.5 w-9 sm:h-10.5 sm:w-10 overflow-visible"
      >
        <defs>
          <linearGradient id={brassId} x1="0" y1="0" x2="1" y2="0.12">
            <stop offset="0%" stopColor="#855c20" />
            <stop offset="28%" stopColor="#e5be6a" />
            <stop offset="65%" stopColor="#aa7b31" />
            <stop offset="100%" stopColor="#4f350f" />
          </linearGradient>
          <linearGradient id={cupId} x1="0" y1="0" x2="1" y2="0.1">
            <stop
              offset="0%"
              stopColor={
                style === "liuli"
                  ? "#6399ae"
                  : style === "butter"
                    ? "#946b27"
                    : "#a87484"
              }
            />
            <stop
              offset="34%"
              stopColor={
                style === "liuli"
                  ? lit
                    ? "#d8f2fa"
                    : "#9ec7d7"
                  : style === "butter"
                    ? lit
                      ? "#f4d07e"
                      : "#c79b49"
                    : lit
                      ? "#fde5ec"
                      : "#d6aeb9"
              }
            />
            <stop
              offset="100%"
              stopColor={
                style === "liuli"
                  ? "#457283"
                  : style === "butter"
                    ? "#684714"
                    : "#764b58"
              }
            />
          </linearGradient>
        </defs>

        {/* 桌面接触环境光遮蔽阴影（紧贴铜灯座底缘 y=57.5–60） */}
        <ellipse
          cx="30.5"
          cy="58.5"
          rx="15.5"
          ry="3.2"
          fill="rgba(4, 2, 1, 0.86)"
        />

        {lit ? (
          <g key={`flame-${lampSeq}`} className="animate-lamp-ignite">
            <ellipse
              cx="30"
              cy="19"
              rx="9"
              ry="11"
              fill="rgba(255, 224, 130, 0.28)"
              className="animate-flame"
            />
            <path
              d="M30 5 C34.5 13 34.5 21 30 24.5 C25.5 21 25.5 13 30 5 Z"
              fill="#ffb636"
              className="animate-flame"
            />
            <path
              d="M30 10 C32.6 15 32.6 20.5 30 23 C27.4 20.5 27.4 15 30 10 Z"
              fill="#fff8d6"
              className="animate-flame"
            />
          </g>
        ) : (
          <line
            x1="30"
            y1="24"
            x2="30"
            y2="29"
            stroke="#4c3823"
            strokeWidth="1.4"
            strokeLinecap="round"
          />
        )}

        {style === "liuli" ? (
          <>
            <path
              d="M17 30 Q30 35.5 43 30 L39 44.5 Q30 48 21 44.5 Z"
              fill={`url(#${cupId})`}
            />
            <path
              d="M21 32 C20 37 21 41 22.5 43.5"
              fill="none"
              stroke="rgba(255,255,255,0.45)"
              strokeWidth="1.2"
              strokeLinecap="round"
            />
            <ellipse
              cx="30"
              cy="30"
              rx="13"
              ry="2.6"
              fill={lit ? "rgba(255,244,205,0.68)" : "rgba(210,235,245,0.35)"}
            />
            <rect
              x="26.5"
              y="44.5"
              width="7"
              height="9.5"
              rx="1"
              fill={`url(#${brassId})`}
            />
            <ellipse cx="30" cy="56.5" rx="13.5" ry="3.4" fill={`url(#${brassId})`} />
          </>
        ) : style === "butter" ? (
          <>
            <path
              d="M16 30 L44 30 L40 43.5 Q30 46.5 20 43.5 Z"
              fill={`url(#${cupId})`}
            />
            <ellipse
              cx="30"
              cy="30"
              rx="14"
              ry="2.5"
              fill={lit ? "#f6d78a" : "#bf984b"}
            />
            <path d="M27 43.5 L33 43.5 L35 54.5 L25 54.5 Z" fill={`url(#${brassId})`} />
            <ellipse cx="30" cy="56.5" rx="13.5" ry="3.4" fill={`url(#${brassId})`} />
          </>
        ) : (
          <>
            <path
              d="M17 31 Q21 23 26 31 Q30 22 34 31 Q39 23 43 31 Q40 43.5 30 45.5 Q20 43.5 17 31 Z"
              fill={`url(#${cupId})`}
            />
            <path d="M26 44.5 L34 44.5 L35 54.5 L25 54.5 Z" fill={`url(#${brassId})`} />
            <ellipse cx="30" cy="56.5" rx="13.5" ry="3.4" fill={`url(#${brassId})`} />
          </>
        )}
      </svg>
    </div>
  );
}

/**
 * 写实三足铜香炉 + 清晰香灰池 + 插入炉内檀香香体 + 顶端微弱余烬与淡灰白轻烟：
 * - 三足足底严格落地于 SVG 底缘 y=104（无下方空白）
 * - 炉内香灰呈现自然高对比浅灰白隆起，明确显示香体插入点
 * - 檀香香体在暗色大殿背景下具清晰双层木质高光轮廓与细红香脚，绝不穿模、不悬空、不遮佛面
 */
function AltarCenserVessel({
  incenseLit,
  showIncense,
  settledIncenseSeq,
  hallTone,
}: {
  incenseLit: 0 | 1 | 3;
  showIncense: boolean;
  settledIncenseSeq: number;
  hallTone: HallTone;
}) {
  const uid = useId().replace(/[^a-zA-Z0-9_-]/g, "");
  const bronzeId = `censer-bronze-${uid}`;
  const rimId = `censer-rim-${uid}`;
  const smokeClipId = `censer-ash-clip-${uid}`;
  const solemn = hallTone === "dizang";
  const sunlit = hallTone === "guanyin" || hallTone === "culture";

  const incenseSticks =
    incenseLit === 1
      ? [{ baseX: 48, topX: 48, topY: 22 }]
      : incenseLit === 3
        ? [
            { baseX: 40.5, topX: 38, topY: 23.5 },
            { baseX: 48, topX: 48, topY: 20.5 },
            { baseX: 55.5, topX: 58, topY: 23.5 },
          ]
        : [];

  return (
    <div className="relative flex flex-col items-center">
      <svg
        viewBox="0 0 96 106"
        className="relative h-20 w-18 sm:h-22 sm:w-20 overflow-visible"
      >
        <defs>
          <linearGradient id={bronzeId} x1="0" y1="0" x2="1" y2="0.2">
            <stop offset="0%" stopColor={solemn ? "#563b19" : "#61431e"} />
            <stop
              offset="30%"
              stopColor={sunlit ? "#d0a560" : solemn ? "#b08647" : "#bc904f"}
            />
            <stop offset="66%" stopColor={solemn ? "#654720" : "#785528"} />
            <stop offset="100%" stopColor="#35220e" />
          </linearGradient>
          <linearGradient id={rimId} x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#775428" />
            <stop offset="35%" stopColor={sunlit ? "#e0b770" : "#d5a962"} />
            <stop offset="100%" stopColor="#4f3515" />
          </linearGradient>
          {/* 炉口香灰区域遮罩：确保香体底部自然插入香灰之中，绝不穿出炉底或桌面 */}
          <clipPath id={smokeClipId}>
            <rect x="0" y="-40" width="96" height="106.2" />
          </clipPath>
        </defs>

        {/* 三足落地接触供桌面的环境光遮蔽（严丝合缝贴在桌面 y=103.5） */}
        <ellipse
          cx="48.5"
          cy="103.5"
          rx="23.5"
          ry="4.2"
          fill="rgba(4, 2, 1, 0.88)"
        />

        {/* 铜炉后半圈口沿与浅灰白细香灰隆起（在香体之后绘制，体现香体插在灰池中） */}
        <ellipse cx="48" cy="65.8" rx="22" ry="4.6" fill={`url(#${rimId})`} />
        <ellipse cx="48" cy="65.6" rx="18" ry="3.2" fill="#9a8f7a" />
        <path
          d="M32.5 65.8 Q48 60.5 63.5 65.8 Q48 68.4 32.5 65.8 Z"
          fill="#d9cfbc"
        />

        {/* 清晰可见的檀香香体（在暗木背景前具备明确亮度层次，底部稳插入香灰 y=66） */}
        {showIncense && (
          <g
            key={`altar-incense-${settledIncenseSeq}-${incenseLit}`}
            clipPath={`url(#${smokeClipId})`}
          >
            {incenseSticks.map((stick, idx) => {
              // 计算香脚（底部 7 单位为绛红竹脚，上方为天然原木檀香，顶端 2 单位为微白燃灰）
              const dx = stick.topX - stick.baseX;
              const dy = stick.topY - 66;
              const footX = stick.baseX + dx * 0.16;
              const footY = 66 + dy * 0.16;
              const tipAshX = stick.topX - dx * 0.05;
              const tipAshY = stick.topY - dy * 0.05;

              return (
                <g key={stick.baseX} className="animate-incense-insert">
                  {/* 香灰插入点微暗小孔阴影，明确接触关系 */}
                  <ellipse
                    cx={stick.baseX}
                    cy="65.8"
                    rx="1.6"
                    ry="0.7"
                    fill="rgba(42, 32, 22, 0.72)"
                  />
                  {/* 暗木背景轮廓分离阴影（极细微暗边保证香体清晰识别而不显卡通） */}
                  <line
                    x1={stick.baseX}
                    y1="66"
                    x2={stick.topX}
                    y2={stick.topY}
                    stroke="rgba(18, 10, 6, 0.65)"
                    strokeWidth="3.1"
                    strokeLinecap="round"
                  />
                  {/* 绛红竹制香脚插入香灰 */}
                  <line
                    x1={stick.baseX}
                    y1="66"
                    x2={footX}
                    y2={footY}
                    stroke="#983c2b"
                    strokeWidth="1.9"
                    strokeLinecap="round"
                  />
                  {/* 天然檀木香体主干 */}
                  <line
                    x1={footX}
                    y1={footY}
                    x2={tipAshX}
                    y2={tipAshY}
                    stroke="#d29c60"
                    strokeWidth="2.1"
                    strokeLinecap="round"
                  />
                  {/* 左侧受光高光丝，增强细圆柱立体真实感 */}
                  <line
                    x1={footX - 0.35}
                    y1={footY}
                    x2={tipAshX - 0.35}
                    y2={tipAshY}
                    stroke="#edd0a3"
                    strokeWidth="0.75"
                    strokeLinecap="round"
                  />
                  {/* 顶端少量燃尽白灰 */}
                  <line
                    x1={tipAshX}
                    y1={tipAshY}
                    x2={stick.topX}
                    y2={stick.topY}
                    stroke="#cfc9be"
                    strokeWidth="1.9"
                    strokeLinecap="round"
                  />
                  {/* 顶端微弱火星余烬（适度柔和，严禁过亮火焰） */}
                  <circle
                    cx={stick.topX}
                    cy={stick.topY}
                    r="1.6"
                    fill="#d95b26"
                    className="animate-ember"
                  />
                  <circle
                    cx={stick.topX}
                    cy={stick.topY}
                    r="0.8"
                    fill="#ffbc75"
                  />
                  {/* 从香体燃烧顶端缓缓升起的淡灰白轻烟（克制高度不遮挡地藏菩萨面部） */}
                  <path
                    d={`M${stick.topX} ${stick.topY - 1.5} C${stick.topX - 3.2} ${stick.topY - 10}, ${stick.topX + 3.6} ${stick.topY - 19}, ${stick.topX - 1.5} ${stick.topY - 28}`}
                    fill="none"
                    stroke="rgba(236, 234, 228, 0.44)"
                    strokeWidth="1.45"
                    strokeLinecap="round"
                    style={{
                      animationDelay: `${idx * 0.45}s`,
                      filter: "blur(0.55px)",
                    }}
                    className={
                      idx % 2 === 0 ? "animate-incense" : "animate-incense-alt"
                    }
                  />
                </g>
              );
            })}
          </g>
        )}

        {/* 前半圈铜炉口沿遮挡香脚根部，使香体真正“插在炉内” */}
        <path
          d="M26 65.8 Q48 70.6 70 65.8 Q48 68.4 26 65.8 Z"
          fill={`url(#${rimId})`}
        />

        {/* 双耳（左侧受光稍亮，右侧背光微暗） */}
        <path
          d="M26 67 C18.5 67 18.5 78.5 27 78.5"
          fill="none"
          stroke={sunlit ? "#b5894b" : "#9c743d"}
          strokeWidth="2.9"
          strokeLinecap="round"
        />
        <path
          d="M70 67 C77.5 67 77.5 78.5 69 78.5"
          fill="none"
          stroke="#593e1b"
          strokeWidth="2.9"
          strokeLinecap="round"
        />

        {/* 三足（足底精准落至 y=103，紧贴接地阴影） */}
        <path
          d="M32 88 L28.5 103 M48 90 L48 103.5 M64 88 L67.5 103"
          stroke="#4c3315"
          strokeWidth="3.6"
          strokeLinecap="round"
        />
        <path
          d="M32 88 L29 102.5"
          stroke="rgba(186, 142, 78, 0.35)"
          strokeWidth="1"
          strokeLinecap="round"
        />

        {/* 铜鼎炉身（古铜厚重质感） */}
        <path
          d="M26 66 Q48 70.4 70 66 C72 80.5 63.5 91.5 48 91.5 C32.5 91.5 24 80.5 26 66 Z"
          fill={`url(#${bronzeId})`}
        />
        {/* 炉腹古典双弦纹 */}
        <path
          d="M29 73.5 Q48 77.2 67 73.5"
          fill="none"
          stroke="rgba(226, 186, 114, 0.36)"
          strokeWidth="0.95"
        />
        <path
          d="M31.5 78.2 Q48 82 64.5 78.2"
          fill="none"
          stroke="rgba(42, 26, 10, 0.48)"
          strokeWidth="0.95"
        />
      </svg>
    </div>
  );
}

export function BuddhistHallStage({
  scene,
  selfAction,
  peers,
  incenseLit,
  incenseSeq,
  lampLit,
  lampSeq,
  selectedLamp,
  flowerOffered,
  flowerSeq,
  selectedFlower,
  woodfishSeq,
  chantingPlaying,
}: {
  scene: SceneConfig;
  selfAction: PractitionerAction;
  peers: ScenePeer[];
  incenseLit: 0 | 1 | 3;
  incenseSeq: number;
  lampLit: boolean;
  lampSeq: number;
  selectedLamp: LampStyle;
  flowerOffered: boolean;
  flowerSeq: number;
  selectedFlower: FlowerStyle;
  woodfishSeq: number;
  chantingPlaying: boolean;
}) {
  const stageRef = useRef<HTMLDivElement | null>(null);
  const [geometry, setGeometry] = useState<StageGeometry | null>(null);

  useEffect(() => {
    const el = stageRef.current;
    if (!el || typeof ResizeObserver === "undefined") return;

    const updateSize = () => {
      const rect = el.getBoundingClientRect();
      if (!rect.width || !rect.height) return;
      const imgAspect = 16 / 9;
      const boxAspect = rect.width / rect.height;
      const coverW =
        boxAspect > imgAspect ? rect.width : rect.height * imgAspect;
      const coverH =
        boxAspect > imgAspect ? rect.width / imgAspect : rect.height;
      setGeometry({
        coverW,
        coverH,
        stageW: rect.width,
        stageH: rect.height,
      });
    };

    updateSize();
    const observer = new ResizeObserver(updateSize);
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const placement =
    HALL_ALTAR_PLACEMENTS[scene.sceneId] || DEFAULT_ALTAR_PLACEMENT;
  const {
    allowFlower,
    allowIncense,
    allowLamp,
    enableWorship,
    enableWoodfish,
  } = scene.interactionConfig;

  const [settledFlowerSeq, setSettledFlowerSeq] = useState(0);
  const [settledIncenseSeq, setSettledIncenseSeq] = useState(0);
  const [settledLampSeq, setSettledLampSeq] = useState(0);

  useEffect(() => {
    if (!flowerOffered || flowerSeq === 0) {
      setSettledFlowerSeq(0);
      return;
    }
    const timer = window.setTimeout(() => {
      setSettledFlowerSeq(flowerSeq);
    }, 340);
    return () => window.clearTimeout(timer);
  }, [flowerOffered, flowerSeq]);

  useEffect(() => {
    if (incenseLit === 0 || incenseSeq === 0) {
      setSettledIncenseSeq(0);
      return;
    }
    // 先由人物抬香礼敬，约 480ms 后香体稳稳落插于香炉灰池并升起轻烟
    const timer = window.setTimeout(() => {
      setSettledIncenseSeq(incenseSeq);
    }, 480);
    return () => window.clearTimeout(timer);
  }, [incenseLit, incenseSeq]);

  useEffect(() => {
    if (!lampLit || lampSeq === 0) {
      setSettledLampSeq(0);
      return;
    }
    const timer = window.setTimeout(() => {
      setSettledLampSeq(lampSeq);
    }, 360);
    return () => window.clearTimeout(timer);
  }, [lampLit, lampSeq]);

  const showFlower = allowFlower && flowerOffered && settledFlowerSeq > 0;
  const showIncense = allowIncense && incenseLit > 0 && settledIncenseSeq > 0;
  const showLampFlame = allowLamp && lampLit && settledLampSeq > 0;

  const selfCoords = getUnifiedBuddhistSelfCoords(
    selfAction,
    scene.sceneId,
    geometry,
  );
  const restFloorLeft = projectCoverXToStage(
    placement.floorRest.left,
    geometry,
    {
      avoidSide: "left",
      tableEdgeCoverPct: placement.tableLeftEdge,
    },
  );
  const restFloorBottom = placement.floorRest.bottom;
  const woodfishOffsetLeft = projectCoverXToStage(
    placement.floorRest.left + 4.4,
    geometry,
    {
      avoidSide: "left",
      tableEdgeCoverPct: placement.tableLeftEdge,
    },
  );
  const activePeerSlots = placement.peerSlots || FLANK_PEER_SLOTS;

  return (
    <div
      ref={stageRef}
      className="pointer-events-none absolute inset-0 overflow-hidden"
    >
      {/* ==================== 第一层延伸：供灯暖晕与诵经微光 ==================== */}
      {showLampFlame && (
        <div
          key={`${scene.sceneId}-ambient-halo-${settledLampSeq}`}
          aria-hidden="true"
          className="animate-warm-halo pointer-events-none absolute inset-x-0 bottom-[16%] h-1/2"
          style={{
            background:
              "radial-gradient(ellipse at 60% 62%, rgba(255, 204, 110, 0.2) 0%, rgba(255, 182, 76, 0.07) 46%, transparent 76%)",
          }}
        />
      )}
      <SacredChantingAura playing={chantingPlaying} tone="buddhist" />

      {/* ==================== 第二层：16:9 等比锁定背景 + 供桌桌面统一定位区域 ==================== */}
      <div
        style={
          geometry
            ? { width: `${geometry.coverW}px`, height: `${geometry.coverH}px` }
            : undefined
        }
        className={`pointer-events-none absolute top-1/2 left-1/2 z-10 -translate-x-1/2 -translate-y-1/2 ${
          geometry ? "" : "min-h-full min-w-full aspect-[16/9]"
        }`}
      >
        {/* 统一供桌桌面基准域：所有供品均相对此桌面区域落底于 bottom: 0 */}
        <div
          data-altar-tabletop={scene.sceneId}
          style={{
            left: `${placement.tabletopBox.leftPct}%`,
            width: `${placement.tabletopBox.widthPct}%`,
            bottom: `${placement.tabletopBox.bottomPct}%`,
          }}
          className="pointer-events-none absolute h-0"
        >
          {allowFlower && (
            <div
              style={{
                left: `${placement.flowerX}%`,
                bottom: "0px",
                transform: `translateX(-50%) scale(${placement.scale})`,
              }}
              className="absolute origin-bottom flex flex-col items-center"
            >
              {showFlower && (
                <div
                  key={`altar-flower-${settledFlowerSeq}-${selectedFlower}`}
                  className="animate-lotus-bloom -mb-3.5 z-10"
                >
                  <AltarFlowerSVG
                    style={selectedFlower}
                    hallTone={placement.tone}
                  />
                </div>
              )}
              <AltarPorcelainVase hallTone={placement.tone} />
            </div>
          )}

          {allowIncense && (
            <div
              style={{
                left: `${placement.incenseX}%`,
                bottom: "0px",
                transform: `translateX(-50%) scale(${placement.scale})`,
              }}
              className="absolute origin-bottom flex flex-col items-center"
            >
              <AltarCenserVessel
                incenseLit={incenseLit}
                showIncense={showIncense}
                settledIncenseSeq={settledIncenseSeq}
                hallTone={placement.tone}
              />
            </div>
          )}

          {allowLamp && (
            <div
              style={{
                left: `${placement.lampX}%`,
                bottom: "0px",
                transform: `translateX(-50%) scale(${placement.scale})`,
              }}
              className="absolute origin-bottom"
            >
              <AltarLampVessel
                style={selectedLamp}
                lit={showLampFlame}
                lampSeq={settledLampSeq}
                hallTone={placement.tone}
              />
            </div>
          )}
        </div>
      </div>

      {/* ==================== 第四层：地面拜垫与落地木鱼（位于左侧通道，绝不触碰供桌与供品） ==================== */}
      {enableWorship && (
        <div
          aria-hidden="true"
          style={{
            left: `${restFloorLeft}%`,
            bottom: `${Math.max(4.5, restFloorBottom - 1)}%`,
          }}
          className="pointer-events-none absolute z-10 -translate-x-1/2 transition-all duration-500"
        >
          <svg viewBox="0 0 88 26" className="h-5 w-16 sm:h-6 sm:w-20">
            <defs>
              <radialGradient id="mat-fabric" cx="45%" cy="35%" r="65%">
                <stop offset="0%" stopColor="#943f32" />
                <stop offset="65%" stopColor="#6a2920" />
                <stop offset="100%" stopColor="#421711" />
              </radialGradient>
            </defs>
            <ellipse cx="44" cy="17.5" rx="38" ry="7.2" fill="rgba(0,0,0,0.56)" />
            <ellipse cx="44" cy="14" rx="34" ry="6.2" fill="url(#mat-fabric)" />
            <ellipse
              cx="44"
              cy="12.5"
              rx="28"
              ry="4.4"
              fill="none"
              stroke="rgba(205, 162, 88, 0.45)"
              strokeWidth="0.9"
            />
          </svg>
        </div>
      )}

      {enableWoodfish && (
        <div
          aria-hidden="true"
          style={{
            left: `${woodfishOffsetLeft}%`,
            bottom: `${restFloorBottom + 0.5}%`,
          }}
          className="pointer-events-none absolute z-10 -translate-x-1/2 transition-all duration-500"
        >
          <div className="relative flex items-center justify-center">
            {woodfishSeq > 0 && selfAction === "woodfish" && (
              <span
                key={`wf-ring-${woodfishSeq}`}
                className="animate-sound-ring absolute h-12 w-12 rounded-full border border-[#f0c97a]/75"
              />
            )}
            <svg
              key={`wf-ground-${woodfishSeq}`}
              viewBox="0 0 44 30"
              className={`h-6 w-9 sm:h-7 sm:w-10 drop-shadow-[0_3px_4px_rgba(0,0,0,0.55)] ${
                woodfishSeq > 0 && selfAction === "woodfish"
                  ? "animate-wooden-fish"
                  : ""
              }`}
            >
              <defs>
                <radialGradient id="camphor-wood" cx="40%" cy="32%" r="68%">
                  <stop offset="0%" stopColor="#c78343" />
                  <stop offset="55%" stopColor="#945521" />
                  <stop offset="100%" stopColor="#4f290c" />
                </radialGradient>
              </defs>
              <ellipse cx="22" cy="24.2" rx="18" ry="4" fill="#5e241b" />
              <ellipse
                cx="22"
                cy="15"
                rx="13"
                ry="9"
                fill="url(#camphor-wood)"
              />
              <path
                d="M13 15 Q22 18.2 31 15"
                stroke="#331706"
                strokeWidth="1.6"
                strokeLinecap="round"
                fill="none"
              />
            </svg>
          </div>
        </div>
      )}

      {/* ==================== 第三层：修行者人物（背对观众，全程不遮挡供桌、供品与佛像） ==================== */}
      <div className="pointer-events-none absolute inset-0 z-20">
        {peers.map((peer) => {
          const slot = activePeerSlots[peer.slotIndex % activePeerSlots.length];
          const peerLeft = projectCoverXToStage(slot.left, geometry);
          return (
            <div
              key={peer.uid}
              style={{
                left: `${peerLeft}%`,
                bottom: `${slot.bottom}%`,
                transform: `translateX(-50%) scale(${slot.scale})`,
              }}
              className="absolute origin-bottom transition-all duration-700 ease-out"
            >
              <PractitionerFigure
                tradition={peer.religionType}
                action={peer.action}
                label={peer.alias}
                hideLabel
                hideStageProps
                sizeClass="h-24 w-14 sm:h-28 sm:w-16 opacity-88"
              />
            </div>
          );
        })}

        <div
          style={{
            left: `${selfCoords.left}%`,
            bottom: `${selfCoords.bottom}%`,
            transform: `translateX(-50%) scale(${selfCoords.perspectiveScale})`,
          }}
          className="absolute origin-bottom transition-all duration-700 ease-out"
        >
          <div
            aria-hidden="true"
            className="pointer-events-none absolute bottom-0.5 left-1/2 h-3.5 w-14 -translate-x-1/2 rounded-full bg-black/55 blur-[4px]"
          />
          <PractitionerFigure
            tradition="buddhist"
            action={selfAction}
            isSelf
            label="我"
            hideLabel
            hideStageProps
            sizeClass="h-24 w-14 sm:h-28 sm:w-17 md:h-30 md:w-18"
          />
        </div>
      </div>
    </div>
  );
}
