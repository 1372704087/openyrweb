/**
 * MapScrollHandler — 地图边缘/强制滚屏驱动（帧节流 60fps）。
 *
 * 由 gui/screen/game/worldInteraction/MapScrollHandler.ts.js
 * 重写为 TS（行为完全一致）。
 *
 * 两个文件并存期间，本文件才是修改目标：tools/repack.mjs 打包时优先采用 .ts 模块的编译产物。
 */
import { pointEquals } from "util/geometry"; // 已转换
import { clamp } from "util/math"; // 已转换
import * as PointerTypeModule from "engine/type/PointerType"; // 孪生

/* eslint-disable @typescript-eslint/no-explicit-any */

// 孪生 any-shim：取命名空间成员
const PointerType: any = (PointerTypeModule as any).PointerType;

/** 地图滚屏处理器。 */
export class MapScrollHandler {
  /** 画布。 */
  canvas: any;
  /** 镜头平移。 */
  cameraPan: any;
  /** 指针。 */
  pointer: any;
  /** 滚速 BoxedVar。 */
  scrollRate: any;
  /** 世界场景。 */
  worldScene: any;
  /** 是否在滚。 */
  isActive = false;
  /** 是否暂停。 */
  paused = false;
  /** 强制滚动取消请求。 */
  forceScrollCancelRequested = false;
  /** 边缘滚方向（-1/0/1 分量）。 */
  panDirection: THREE.Vector2 | undefined;
  /** 强制滚方向。 */
  forceScrollDirection: { x: number; y: number } | undefined;
  /** 指针动画帧号。 */
  pointerFrameNo: number | undefined;
  /** 上次帧时间。 */
  lastUpdate: number | undefined;
  /** 镜头更新前回调。 */
  onFrame: (now: number) => void;

  /**
   * @param canvas 画布
   * @param cameraPan 镜头平移
   * @param pointer 指针
   * @param scrollRate 滚速
   * @param worldScene 世界场景
   */
  constructor(canvas: any, cameraPan: any, pointer: any, scrollRate: any, worldScene: any) {
    this.canvas = canvas;
    this.cameraPan = cameraPan;
    this.pointer = pointer;
    this.scrollRate = scrollRate;
    this.worldScene = worldScene;
    this.isActive = false;
    this.paused = false;
    this.forceScrollCancelRequested = false;
    this.onFrame = (now: number) => {
      if (this.paused) return;
      if (!this.isActive || (this.lastUpdate && now - this.lastUpdate < 1e3 / 60)) return;
      this.lastUpdate = now;
      const pan = this.cameraPan.getPan();
      const limits = this.cameraPan.getPanLimits();
      let next: { x: number; y: number } | undefined;
      let edgeMoved = false;
      if (this.panDirection?.x || this.panDirection?.y) {
        let speed = (this.scrollRate.value / 5) * 10;
        next = {
          x: clamp(pan.x + this.panDirection.x * speed, limits.x, limits.x + limits.width),
          y: clamp(pan.y + this.panDirection.y * speed, limits.y, limits.y + limits.height),
        };
        const moved = !pointEquals(next, pan);
        this.pointer.setPointerType(
          moved ? PointerType.Scroll : PointerType.NoScroll,
          this.pointerFrameNo,
        );
        if (moved) edgeMoved = true;
      }
      let forceDir = this.forceScrollDirection;
      let forceMoved = false;
      if (forceDir) {
        next = {
          x: clamp(pan.x + 30 * forceDir.x, limits.x, limits.x + limits.width),
          y: clamp(pan.y + 30 * forceDir.y, limits.y, limits.y + limits.height),
        };
        if (!pointEquals(next, pan)) forceMoved = true;
      }
      this.isActive = edgeMoved || forceMoved;
      if (next) this.cameraPan.setPan({ x: next.x, y: next.y });
      if (!this.isActive) this.worldScene.onBeforeCameraUpdate.unsubscribe(this.onFrame);
      if (this.forceScrollCancelRequested) {
        this.forceScrollCancelRequested = false;
        this.forceScrollDirection = void 0;
      }
    };
  }

  /** 是否存在非零边缘滚方向。 */
  isScrolling(): boolean {
    return !(!this.panDirection || (!this.panDirection.x && !this.panDirection.y));
  }

  /**
   * 请求强制滚动（自定义滚屏）。
   * @param dir 方向 {x,y}
   */
  requestForceScroll(dir: { x: number; y: number }): void {
    this.forceScrollDirection = dir;
    this.forceScrollCancelRequested = false;
    if (!this.isActive) {
      this.isActive = true;
      this.worldScene.onBeforeCameraUpdate.subscribe(this.onFrame);
    }
  }

  /** 标记下一帧取消强制滚动。 */
  cancelForceScroll(): void {
    this.forceScrollCancelRequested = true;
  }

  /**
   * 根据指针位置更新边缘滚方向（3px 边缘 + 中部 1/3 死区）。
   * @param pos 指针相对画布坐标
   */
  update(pos: { x: number; y: number }): void {
    const height = this.canvas.height;
    const width = this.canvas.width;
    let dx = pos.x < 3 ? -1 : pos.x > width - 1 - 3 ? 1 : 0;
    let dy = pos.y < 3 ? -1 : pos.y > height - 1 - 3 ? 1 : 0;
    if (dx) {
      if (pos.y < Math.min(300, height / 3)) dy = -1;
      else if (pos.y > Math.max(height - 300, (2 * height) / 3)) dy = 1;
    } else if (dy) {
      if (pos.x < Math.min(300, width / 3)) dx = -1;
      else if (pos.x > Math.max(width - 300, (2 * width) / 3)) dx = 1;
    }
    this.panDirection = new THREE.Vector2(dx, dy);
    this.pointerFrameNo = ((THREE.Math.radToDeg(this.panDirection.angle()) + 90) % 360) / 45;
    if (!this.isActive) {
      this.isActive = true;
      this.worldScene.onBeforeCameraUpdate.subscribe(this.onFrame);
    }
  }

  /** 取消强制滚动并停帧订阅。 */
  cancel(): void {
    this.cancelForceScroll();
    if (this.isActive) {
      this.worldScene.onBeforeCameraUpdate.unsubscribe(this.onFrame);
      this.isActive = false;
    }
  }

  /**
   * 暂停/恢复帧滚动。
   * @param paused 是否暂停
   */
  setPaused(paused: boolean): void {
    this.paused = paused;
  }

  /** 等价 cancel。 */
  dispose(): void {
    this.cancel();
  }
}
