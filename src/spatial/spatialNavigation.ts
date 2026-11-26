import type {
  SpatialBoundingBox,
  SpatialCameraPoseSpec,
  SpatialPathNode,
  SpatialRestrictedZone,
} from "@/spatial/spatialSceneConfig";

export type SpatialCameraPose = {
  x: number;
  y: number;
  z: number;
  yawDeg: number;
  pitchDeg: number;
};

export type SpatialMovementInput = {
  forward: number; // -1..1
  right: number; // -1..1
  up: number; // -1..1
  sprint: boolean;
};

export type NavigationStepResult = {
  pose: SpatialCameraPose;
  moved: boolean;
  clampedByBounds: boolean;
  blockedByZoneLabel: string | null;
};

export function createPoseFromSpec(
  spec: SpatialCameraPoseSpec,
): SpatialCameraPose {
  return {
    x: spec.position[0],
    y: spec.position[1],
    z: spec.position[2],
    yawDeg: spec.yawDeg,
    pitchDeg: spec.pitchDeg,
  };
}

export function clampPitchDeg(pitchDeg: number): number {
  return Math.max(-72, Math.min(72, pitchDeg));
}

export function normalizeYawDeg(yawDeg: number): number {
  let y = yawDeg % 360;
  if (y > 180) y -= 360;
  if (y < -180) y += 360;
  return y;
}

/**
 * 空间导航层（与视觉渲染层完全分离）：
 * - 基于朝向角在水平面计算前后/左右步行向量
 * - 应用速度倍率并限制于配置式可行走包围盒（walkableBounds）
 * - 执行禁入区域（restrictedZones）的 XZ 轴向推出，防止穿入圣像/供桌保留区
 * - 注：当前仅实现配置式包围盒与禁入区约束，非 3DGS 自动点云网格碰撞
 */
export function stepSpatialNavigation({
  current,
  input,
  dtSec,
  speedMetersPerSec,
  bounds,
  restrictedZones,
}: {
  current: SpatialCameraPose;
  input: SpatialMovementInput;
  dtSec: number;
  speedMetersPerSec: number;
  bounds: SpatialBoundingBox;
  restrictedZones: SpatialRestrictedZone[];
}): NavigationStepResult {
  const f = Math.max(-1, Math.min(1, input.forward));
  const r = Math.max(-1, Math.min(1, input.right));
  const u = Math.max(-1, Math.min(1, input.up));

  if (Math.abs(f) < 0.001 && Math.abs(r) < 0.001 && Math.abs(u) < 0.001) {
    return {
      pose: current,
      moved: false,
      clampedByBounds: false,
      blockedByZoneLabel: null,
    };
  }

  // Three.js camera looks down -Z when yaw = 0; positive yaw rotates left (+CCW around +Y)
  const yawRad = (current.yawDeg * Math.PI) / 180;
  const fwdX = -Math.sin(yawRad);
  const fwdZ = -Math.cos(yawRad);
  const rightX = Math.cos(yawRad);
  const rightZ = -Math.sin(yawRad);

  let moveX = fwdX * f + rightX * r;
  let moveZ = fwdZ * f + rightZ * r;
  const horizLen = Math.hypot(moveX, moveZ);
  if (horizLen > 1) {
    moveX /= horizLen;
    moveZ /= horizLen;
  }

  const speed = speedMetersPerSec * (input.sprint ? 1.55 : 1.0);
  const stepDist = speed * Math.min(dtSec, 0.1);

  let nextX = current.x + moveX * stepDist;
  let nextY = current.y + u * stepDist * 0.65;
  let nextZ = current.z + moveZ * stepDist;

  let clampedByBounds = false;
  const clampAxis = (val: number, min: number, max: number) => {
    if (val < min) {
      clampedByBounds = true;
      return min;
    }
    if (val > max) {
      clampedByBounds = true;
      return max;
    }
    return val;
  };

  nextX = clampAxis(nextX, bounds.minX, bounds.maxX);
  nextY = clampAxis(nextY, bounds.minY, bounds.maxY);
  nextZ = clampAxis(nextZ, bounds.minZ, bounds.maxZ);

  let blockedByZoneLabel: string | null = null;
  const pad = 0.08;
  for (const zone of restrictedZones) {
    const minX = zone.minX - pad;
    const maxX = zone.maxX + pad;
    const minZ = zone.minZ - pad;
    const maxZ = zone.maxZ + pad;

    if (nextX > minX && nextX < maxX && nextZ > minZ && nextZ < maxZ) {
      blockedByZoneLabel = zone.label;
      const dLeft = Math.abs(nextX - minX);
      const dRight = Math.abs(maxX - nextX);
      const dBack = Math.abs(nextZ - minZ);
      const dFront = Math.abs(maxZ - nextZ);
      const minD = Math.min(dLeft, dRight, dBack, dFront);

      if (minD === dLeft) nextX = minX;
      else if (minD === dRight) nextX = maxX;
      else if (minD === dBack) nextZ = minZ;
      else nextZ = maxZ;
    }
  }

  const moved =
    Math.abs(nextX - current.x) > 1e-5 ||
    Math.abs(nextY - current.y) > 1e-5 ||
    Math.abs(nextZ - current.z) > 1e-5;

  return {
    pose: {
      x: nextX,
      y: nextY,
      z: nextZ,
      yawDeg: current.yawDeg,
      pitchDeg: current.pitchDeg,
    },
    moved,
    clampedByBounds,
    blockedByZoneLabel,
  };
}

export function getNearestPathNodeId(
  pose: SpatialCameraPose,
  nodes: SpatialPathNode[],
): string | null {
  let bestId: string | null = null;
  let bestDist = Infinity;
  for (const n of nodes) {
    const d = Math.hypot(
      pose.x - n.position[0],
      pose.y - n.position[1],
      pose.z - n.position[2],
    );
    if (d < bestDist) {
      bestDist = d;
      bestId = n.id;
    }
  }
  return bestId;
}

export function interpolatePose(
  from: SpatialCameraPose,
  to: SpatialPathNode,
  alpha: number,
): SpatialCameraPose {
  const t = Math.max(0, Math.min(1, alpha));
  const smooth = t * t * (3 - 2 * t);

  let deltaYaw = normalizeYawDeg(to.yawDeg - from.yawDeg);
  if (deltaYaw > 180) deltaYaw -= 360;
  if (deltaYaw < -180) deltaYaw += 360;

  return {
    x: from.x + (to.position[0] - from.x) * smooth,
    y: from.y + (to.position[1] - from.y) * smooth,
    z: from.z + (to.position[2] - from.z) * smooth,
    yawDeg: normalizeYawDeg(from.yawDeg + deltaYaw * smooth),
    pitchDeg: clampPitchDeg(from.pitchDeg + (to.pitchDeg - from.pitchDeg) * smooth),
  };
}
