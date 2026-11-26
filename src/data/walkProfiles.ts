import type { SpatialDirection } from "@/data/spatialGraph";

export type WalkMode =
  | "enter-hall"
  | "exit-hall"
  | "courtyard-walk"
  | "trail-walk";

export type WalkTradition = "buddhist" | "daoist" | "nature";

export type WalkStageIndex = 1 | 2 | 3 | 4 | 5 | 6 | 7;

export type WalkStageMeta = {
  stage: WalkStageIndex;
  code:
    | "courtyard-start"
    | "walk-start"
    | "approach-hall"
    | "approach-doorway"
    | "pass-doorway"
    | "enter-interior"
    | "arrive-settle";
  title: string;
  detail: string;
};

export type WalkRequest = {
  id: number;
  mode: WalkMode;
  tradition: WalkTradition;
  sceneId: string;
  fromTitle: string;
  toTitle: string;
  label: string;
  exteriorImage: string;
  interiorImage: string;
  targetImage?: string;
  durationMs: number;
  direction: SpatialDirection;
};

/**
 * 统一 7 阶段缓步朝圣阶段解析器：
 * 1 庭院起始 -> 2 开始缓步 -> 3 接近大殿 -> 4 接近门口 -> 5 穿越门洞 -> 6 进入殿内 -> 7 停稳
 */
export function getWalkStageMeta(
  progress: number,
  mode: WalkMode,
): WalkStageMeta {
  const p = Math.max(0, Math.min(1, progress));

  if (mode === "exit-hall") {
    if (p < 0.08) {
      return {
        stage: 1,
        code: "courtyard-start",
        title: "殿内起身退步",
        detail: "收摄礼敬仪态，稳立殿内中轴面向殿门",
      };
    }
    if (p < 0.25) {
      return {
        stage: 2,
        code: "walk-start",
        title: "沿金砖缓步后退",
        detail: "供桌与朱柱自两侧缓缓后移，殿门渐近",
      };
    }
    if (p < 0.44) {
      return {
        stage: 3,
        code: "approach-hall",
        title: "接近殿门内檐",
        detail: "宫灯余晖在身后渐远，门外天光微显",
      };
    }
    if (p < 0.6) {
      return {
        stage: 4,
        code: "approach-doorway",
        title: "步至木门槛前",
        detail: "雕花门扇与红漆门框正对视野两侧",
      };
    }
    if (p < 0.76) {
      return {
        stage: 5,
        code: "pass-doorway",
        title: "退过门槛门洞",
        detail: "从容跨出高门槛，步下前廊白石月台",
      };
    }
    if (p < 0.92) {
      return {
        stage: 6,
        code: "enter-interior",
        title: "步下石阶返庭院",
        detail: "重檐琉璃屋脊与大雄宝殿金匾再次展露",
      };
    }
    return {
      stage: 7,
      code: "arrive-settle",
      title: "庭院停稳回望",
      detail: "自然减速归零，端立庭院正面瞻仰全貌",
    };
  }

  if (mode === "courtyard-walk") {
    if (p < 0.08) {
      return {
        stage: 1,
        code: "courtyard-start",
        title: "庭院起点立定",
        detail: "青石路径向前延展，确定前往方向",
      };
    }
    if (p < 0.26) {
      return {
        stage: 2,
        code: "walk-start",
        title: "开始缓步前行",
        detail: "足下石砖随从容步频平稳向后移动",
      };
    }
    if (p < 0.48) {
      return {
        stage: 3,
        code: "approach-hall",
        title: "沿庭院中轴前行",
        detail: "前庭古树与石阶轮廓逐步靠近",
      };
    }
    if (p < 0.66) {
      return {
        stage: 4,
        code: "approach-doorway",
        title: "转入前方殿庭",
        detail: "目标殿宇正立面与台阶视野展开",
      };
    }
    if (p < 0.8) {
      return {
        stage: 5,
        code: "pass-doorway",
        title: "步过廊道界碑",
        detail: "庭院门廊景致从两侧自然掠过",
      };
    }
    if (p < 0.92) {
      return {
        stage: 6,
        code: "enter-interior",
        title: "正对新殿前庭",
        detail: "新殿屋宇与白石庭院清晰呈现",
      };
    }
    return {
      stage: 7,
      code: "arrive-settle",
      title: "抵达停稳",
      detail: "步伐温和归零，端立前方庭院中轴",
    };
  }

  if (mode === "trail-walk") {
    if (p < 0.08) {
      return {
        stage: 1,
        code: "courtyard-start",
        title: "林径起始",
        detail: "幽林青石小径向前伸展，静听松风鸟语",
      };
    }
    if (p < 0.28) {
      return {
        stage: 2,
        code: "walk-start",
        title: "缓步入林",
        detail: "砂石小径从脚下缓缓延展，步履轻稳",
      };
    }
    if (p < 0.5) {
      return {
        stage: 3,
        code: "approach-hall",
        title: "穿行竹影水畔",
        detail: "近处枝叶缓退，远山烟岚明晰",
      };
    }
    if (p < 0.68) {
      return {
        stage: 4,
        code: "approach-doorway",
        title: "接近静修渡口",
        detail: "水岸风物随自然视线舒展铺开",
      };
    }
    if (p < 0.82) {
      return {
        stage: 5,
        code: "pass-doorway",
        title: "步过幽篁松影",
        detail: "两侧林荫近景轻柔掠过身侧",
      };
    }
    if (p < 0.93) {
      return {
        stage: 6,
        code: "enter-interior",
        title: "渐入静谧水境",
        detail: "当前静修全境正对中心展开",
      };
    }
    return {
      stage: 7,
      code: "arrive-settle",
      title: "安住停稳",
      detail: "零晃动静立，安享当下静修境",
    };
  }

  // Default: enter-hall (Exact 7 stages requested in V2.4)
  if (p < 0.08) {
    return {
      stage: 1,
      code: "courtyard-start",
      title: "庭院起始",
      detail: "端立庭院青石地面，远观重檐殿宇与石阶入口",
    };
  }
  if (p < 0.25) {
    return {
      stage: 2,
      code: "walk-start",
      title: "开始缓步",
      detail: "沿青石步道与下层石阶缓步向前，铜鼎渐近",
    };
  }
  if (p < 0.48) {
    return {
      stage: 3,
      code: "approach-hall",
      title: "接近大殿",
      detail: "步上白石月台，飞檐金匾与红柱轮廓逐步清晰",
    };
  }
  if (p < 0.64) {
    return {
      stage: 4,
      code: "approach-doorway",
      title: "接近门口",
      detail: "步入前廊朱柱下，正对敞开的雕花木门与高门槛",
    };
  }
  if (p < 0.78) {
    return {
      stage: 5,
      code: "pass-doorway",
      title: "穿越门洞",
      detail: "缓步跨过门槛，雕花门扇与红漆门框掠过两侧",
    };
  }
  if (p < 0.92) {
    return {
      stage: 6,
      code: "enter-interior",
      title: "进入殿内",
      detail: "踏入清凉金砖殿堂，宫灯暖光与佛像供桌正对前方",
    };
  }
  return {
    stage: 7,
    code: "arrive-settle",
    title: "停稳",
    detail: "自然减速归零，端立大殿供桌前静心礼敬",
  };
}

const LUT_STEPS = 256;
const WALK_CURVE_LUT = new Float32Array(LUT_STEPS + 1);
const WALK_VEL_LUT = new Float32Array(LUT_STEPS + 1);

function smooth01(x: number): number {
  const c = Math.max(0, Math.min(1, x));
  return c * c * (3 - 2 * c);
}

(function initWalkCurveLut() {
  // Velocity profile v(t):
  // - Slow respectful start (~2.4s smooth acceleration)
  // - Calm steady stroll (~1.25 m/s)
  // - Gentle reverent slowdown crossing threshold sill (t ≈ 0.67)
  // - Extended silky deceleration to exact 0 velocity (0.83 -> 1.0)
  let accum = 0;
  let maxVel = 0;
  for (let i = 0; i <= LUT_STEPS; i += 1) {
    const t = i / LUT_STEPS;
    const accel = smooth01(t / 0.16);
    const decel = 1 - smooth01((t - 0.78) / 0.21);
    const thresholdEase =
      1 - 0.28 * Math.exp(-Math.pow((t - 0.67) / 0.08, 2));
    const v = accel * decel * thresholdEase;
    WALK_VEL_LUT[i] = v;
    if (v > maxVel) maxVel = v;
    if (i > 0) {
      accum += (WALK_VEL_LUT[i - 1] + v) * 0.5;
    }
    WALK_CURVE_LUT[i] = accum;
  }

  if (accum > 0) {
    for (let i = 0; i <= LUT_STEPS; i += 1) {
      WALK_CURVE_LUT[i] /= accum;
      if (maxVel > 0) {
        WALK_VEL_LUT[i] /= maxVel;
      }
    }
  }
  WALK_CURVE_LUT[0] = 0;
  WALK_CURVE_LUT[LUT_STEPS] = 1;
})();

/**
 * 7 阶段缓步朝圣位移曲线（缓慢加速 -> 稳定缓步 -> 跨槛微缓 -> 丝滑归零停稳）
 */
export function evaluateNaturalWalkCurve(rawT: number): number {
  const t = Math.max(0, Math.min(1, rawT));
  const scaled = t * LUT_STEPS;
  const idx = Math.min(LUT_STEPS - 1, Math.floor(scaled));
  const frac = scaled - idx;
  return (
    WALK_CURVE_LUT[idx] +
    (WALK_CURVE_LUT[idx + 1] - WALK_CURVE_LUT[idx]) * frac
  );
}

/**
 * 当前时刻归一化步行速率 [0, 1]，与脚步节奏、微动步态严格同步
 */
export function getNaturalWalkVelocity(rawT: number): number {
  const t = Math.max(0, Math.min(1, rawT));
  const scaled = t * LUT_STEPS;
  const idx = Math.min(LUT_STEPS - 1, Math.floor(scaled));
  const frac = scaled - idx;
  return (
    WALK_VEL_LUT[idx] +
    (WALK_VEL_LUT[idx + 1] - WALK_VEL_LUT[idx]) * frac
  );
}
