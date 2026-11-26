import {
  clampPitchDeg,
  normalizeYawDeg,
  type SpatialCameraPose,
  type SpatialMovementInput,
} from "@/spatial/spatialNavigation";

export type CameraControllerCallbacks = {
  onPoseLookChange: (yawDeg: number, pitchDeg: number) => void;
  onPointerLockChange: (locked: boolean) => void;
  onTogglePause: () => void;
  onResetPose: () => void;
  onInspectAnchorAtNdc?: (ndcX: number, ndcY: number) => void;
};

/**
 * 独立相机输入控制器（SpatialCameraController）：
 * - 桌面端：WASD / 方向键移动、Q/E 升降、Shift 加速、鼠标拖拽或 Pointer Lock 转向、Esc 退出锁定
 * - 移动端：单指在画布内滑动转向（touch-none 防止页面误滚动），配合虚拟方向垫控制移动
 * - 不劫持普通网页滚轮滚动，保证页面可正常上下浏览
 */
export class SpatialCameraController {
  private canvas: HTMLCanvasElement;
  private callbacks: CameraControllerCallbacks;
  private getPose: () => SpatialCameraPose;
  private isPaused: () => boolean;

  private keys = new Set<string>();
  private virtualInput: SpatialMovementInput = {
    forward: 0,
    right: 0,
    up: 0,
    sprint: false,
  };

  private activePointerId: number | null = null;
  private dragStartX = 0;
  private dragStartY = 0;
  private lastDragX = 0;
  private lastDragY = 0;
  private draggedDistance = 0;
  private disposed = false;

  constructor({
    canvas,
    getPose,
    isPaused,
    callbacks,
  }: {
    canvas: HTMLCanvasElement;
    getPose: () => SpatialCameraPose;
    isPaused: () => boolean;
    callbacks: CameraControllerCallbacks;
  }) {
    this.canvas = canvas;
    this.getPose = getPose;
    this.isPaused = isPaused;
    this.callbacks = callbacks;

    window.addEventListener("keydown", this.onKeyDown);
    window.addEventListener("keyup", this.onKeyUp);
    window.addEventListener("blur", this.onWindowBlur);
    document.addEventListener("pointerlockchange", this.onPointerLockChange);

    this.canvas.addEventListener("pointerdown", this.onPointerDown);
    window.addEventListener("pointermove", this.onPointerMove);
    window.addEventListener("pointerup", this.onPointerUp);
    window.addEventListener("pointercancel", this.onPointerUp);
    this.canvas.addEventListener("mousemove", this.onPointerLockedMouseMove);
  }

  public setVirtualMovement(next: Partial<SpatialMovementInput>) {
    this.virtualInput = { ...this.virtualInput, ...next };
  }

  public requestPointerLock() {
    if (this.disposed) return;
    if (document.pointerLockElement !== this.canvas) {
      try {
        void this.canvas.requestPointerLock?.();
      } catch {
        // Ignore if environment forbids pointer lock (e.g. restricted iframe)
      }
    }
  }

  public exitPointerLock() {
    if (document.pointerLockElement === this.canvas) {
      document.exitPointerLock?.();
    }
  }

  public getMovementInput(): SpatialMovementInput {
    if (this.isPaused()) {
      return { forward: 0, right: 0, up: 0, sprint: false };
    }

    let forward = this.virtualInput.forward;
    let right = this.virtualInput.right;
    let up = this.virtualInput.up;

    if (this.keys.has("KeyW") || this.keys.has("ArrowUp")) forward += 1;
    if (this.keys.has("KeyS") || this.keys.has("ArrowDown")) forward -= 1;
    if (this.keys.has("KeyD") || this.keys.has("ArrowRight")) right += 1;
    if (this.keys.has("KeyA") || this.keys.has("ArrowLeft")) right -= 1;
    if (this.keys.has("KeyE")) up += 1;
    if (this.keys.has("KeyQ")) up -= 1;

    const sprint =
      this.virtualInput.sprint ||
      this.keys.has("ShiftLeft") ||
      this.keys.has("ShiftRight");

    return {
      forward: Math.max(-1, Math.min(1, forward)),
      right: Math.max(-1, Math.min(1, right)),
      up: Math.max(-1, Math.min(1, up)),
      sprint,
    };
  }

  private onKeyDown = (e: KeyboardEvent) => {
    const activeEl = document.activeElement as HTMLElement | null;
    if (
      activeEl &&
      (activeEl.tagName === "INPUT" ||
        activeEl.tagName === "TEXTAREA" ||
        activeEl.tagName === "SELECT" ||
        activeEl.isContentEditable)
    ) {
      return;
    }

    if (
      e.code === "ArrowUp" ||
      e.code === "ArrowDown" ||
      e.code === "ArrowLeft" ||
      e.code === "ArrowRight" ||
      e.code === "Space"
    ) {
      e.preventDefault();
    }

    if (e.code === "Space" && !e.repeat) {
      this.callbacks.onTogglePause();
      return;
    }
    if (e.code === "KeyR" && !e.repeat) {
      this.callbacks.onResetPose();
      return;
    }
    if (e.code === "Escape") {
      this.exitPointerLock();
      this.keys.clear();
      return;
    }

    this.keys.add(e.code);
  };

  private onKeyUp = (e: KeyboardEvent) => {
    this.keys.delete(e.code);
  };

  private onWindowBlur = () => {
    this.keys.clear();
    this.activePointerId = null;
    this.virtualInput = { forward: 0, right: 0, up: 0, sprint: false };
  };

  private onPointerLockChange = () => {
    const locked = document.pointerLockElement === this.canvas;
    this.callbacks.onPointerLockChange(locked);
  };

  private onPointerDown = (e: PointerEvent) => {
    if (document.pointerLockElement === this.canvas) return;
    if (e.button !== 0 && e.pointerType === "mouse") return;
    this.activePointerId = e.pointerId;
    this.dragStartX = e.clientX;
    this.dragStartY = e.clientY;
    this.lastDragX = e.clientX;
    this.lastDragY = e.clientY;
    this.draggedDistance = 0;
  };

  private onPointerMove = (e: PointerEvent) => {
    if (
      this.activePointerId === null ||
      e.pointerId !== this.activePointerId ||
      document.pointerLockElement === this.canvas
    ) {
      return;
    }
    const dx = e.clientX - this.lastDragX;
    const dy = e.clientY - this.lastDragY;
    this.lastDragX = e.clientX;
    this.lastDragY = e.clientY;
    this.draggedDistance += Math.hypot(dx, dy);

    if (this.isPaused()) return;
    const sensitivity = e.pointerType === "touch" ? 0.24 : 0.18;
    const pose = this.getPose();
    const nextYaw = normalizeYawDeg(pose.yawDeg - dx * sensitivity);
    const nextPitch = clampPitchDeg(pose.pitchDeg - dy * sensitivity);
    this.callbacks.onPoseLookChange(nextYaw, nextPitch);
  };

  private onPointerUp = (e: PointerEvent) => {
    if (this.activePointerId !== e.pointerId) return;
    const wasClick = this.draggedDistance < 6;
    const clientX = this.dragStartX;
    const clientY = this.dragStartY;
    this.activePointerId = null;

    if (wasClick && this.callbacks.onInspectAnchorAtNdc) {
      const rect = this.canvas.getBoundingClientRect();
      if (rect.width > 0 && rect.height > 0) {
        const ndcX = ((clientX - rect.left) / rect.width) * 2 - 1;
        const ndcY = -(((clientY - rect.top) / rect.height) * 2 - 1);
        this.callbacks.onInspectAnchorAtNdc(ndcX, ndcY);
      }
    }
  };

  private onPointerLockedMouseMove = (e: MouseEvent) => {
    if (document.pointerLockElement !== this.canvas || this.isPaused()) return;
    const sensitivity = 0.14;
    const pose = this.getPose();
    const nextYaw = normalizeYawDeg(pose.yawDeg - e.movementX * sensitivity);
    const nextPitch = clampPitchDeg(pose.pitchDeg - e.movementY * sensitivity);
    this.callbacks.onPoseLookChange(nextYaw, nextPitch);
  };

  public dispose() {
    this.disposed = true;
    this.exitPointerLock();
    window.removeEventListener("keydown", this.onKeyDown);
    window.removeEventListener("keyup", this.onKeyUp);
    window.removeEventListener("blur", this.onWindowBlur);
    document.removeEventListener("pointerlockchange", this.onPointerLockChange);

    this.canvas.removeEventListener("pointerdown", this.onPointerDown);
    window.removeEventListener("pointermove", this.onPointerMove);
    window.removeEventListener("pointerup", this.onPointerUp);
    window.removeEventListener("pointercancel", this.onPointerUp);
    this.canvas.removeEventListener("mousemove", this.onPointerLockedMouseMove);
  }
}
