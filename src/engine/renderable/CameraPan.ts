/**
 * CameraPan — 自由相机平移（带可选矩形钳制与 freeCamera 旁路）。
 *
 * 由 engine/renderable/CameraPan.ts.js 重写为 TS（行为完全一致）。
 * 两个文件并存期间，本文件才是修改目标：tools/repack.mjs 打包时优先
 * 采用 .ts 模块的编译产物。
 */
import { clamp } from "util/math"; // 已转换

/** 平移点（逻辑屏幕/世界偏移）。 */
export interface PanPoint {
  x: number;
  y: number;
}

/** 矩形钳制区域。 */
export interface PanLimits {
  x: number;
  y: number;
  width: number;
  height: number;
}

/** 持有 freeCamera 标志的最小形状（value 为真时跳过钳制）。 */
export interface FreeCameraLike {
  value: boolean;
}

/**
 * 相机平移控制器。
 * setPan 在有 panLimits 且非 freeCamera 时把 x/y 钳到矩形内。
 */
export class CameraPan {
  /** 当前平移量。 */
  pan: PanPoint;

  /** 可选钳制矩形。 */
  private panLimits?: PanLimits;

  /**
   * @param freeCamera - 自由相机开关（value 为真时 setPan 不钳制）
   */
  constructor(private freeCamera: FreeCameraLike) {
    (this.freeCamera = freeCamera), (this.pan = { x: 0, y: 0 });
  }

  /**
   * 设置平移钳制矩形，并用当前 pan 立即重钳一次。
   * @param e - 矩形区域
   */
  setPanLimits(e: PanLimits): void {
    (this.panLimits = e), this.setPan({ x: this.pan.x, y: this.pan.y });
  }

  /** 读取钳制矩形的浅拷贝。 */
  getPanLimits(): PanLimits {
    return { ...this.panLimits! };
  }

  /** 读取当前 pan 的浅拷贝。 */
  getPan(): PanPoint {
    return { ...this.pan };
  }

  /**
   * 设置平移（可选钳制后写入 this.pan）。
   * @param e - 目标点（就地可能被钳制改写）
   */
  setPan(e: PanPoint): void {
    if (this.panLimits && !this.freeCamera.value) {
      (e.x = clamp(e.x, this.panLimits.x, this.panLimits.x + this.panLimits.width)),
        (e.y = clamp(e.y, this.panLimits.y, this.panLimits.y + this.panLimits.height));
    }
    this.pan = { x: e.x, y: e.y };
  }
}
