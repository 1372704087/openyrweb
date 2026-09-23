/**
 * CameraPanHandler — 鼠标拖拽镜头平移（普通缩放感应 / sticky 绝对位移）。
 *
 * 由 gui/screen/game/worldInteraction/CameraPanHandler.ts.js
 * 重写为 TS（行为完全一致）。
 */
import { pointEquals } from "util/geometry"; // 已转换
import * as PointerTypeModule from "engine/type/PointerType"; // 孪生
import { clamp } from "util/math"; // 已转换

/* eslint-disable @typescript-eslint/no-explicit-any */

// 孪生 any-shim：取命名空间成员
const PointerType: any = (PointerTypeModule as any).PointerType;

/** 镜头拖拽平移。 */
export class CameraPanHandler {
  /** 镜头平移。 */
  cameraPan: any;
  /** 指针。 */
  pointer: any;
  /** 平移速率 BoxedVar。 */
  panRate: any;
  /** 自由镜头 BoxedVar。 */
  freeCamera: any;
  /** 世界场景。 */
  worldScene: any;
  /** 是否在拖。 */
  isPanning = false;
  /** 是否暂停。 */
  paused = false;
  /** sticky（右键绝对位移）模式。 */
  stickyMode = false;
  /** 起始指针。 */
  startPos: { x: number; y: number } | undefined;
  /** sticky 初始 pan。 */
  initialPan: { x: number; y: number } | undefined;
  /** 本帧平移向量。 */
  panVector = new THREE.Vector2();
  /** 上次帧时间。 */
  lastUpdate: number | undefined;
  /** 帧回调。 */
  onFrame: (now: number) => void;

  /**
   * @param cameraPan 镜头平移
   * @param pointer 指针
   * @param panRate 平移速率
   * @param freeCamera 自由镜头开关
   * @param worldScene 世界场景
   */
  constructor(cameraPan: any, pointer: any, panRate: any, freeCamera: any, worldScene: any) {
    this.cameraPan = cameraPan;
    this.pointer = pointer;
    this.panRate = panRate;
    this.freeCamera = freeCamera;
    this.worldScene = worldScene;
    this.isPanning = false;
    this.paused = false;
    this.stickyMode = false;
    this.onFrame = (now: number) => {
      if (this.paused) return;
      if (!this.isPanning || (this.lastUpdate && now - this.lastUpdate < 1e3 / 60)) return;
      this.lastUpdate = now;
      if (this.panVector.x || this.panVector.y) {
        const base = this.stickyMode ? this.initialPan : this.cameraPan.getPan();
        const limits = this.cameraPan.getPanLimits();
        let next = {
          x: clamp(base.x + this.panVector.x, limits.x, limits.x + limits.width),
          y: clamp(base.y + this.panVector.y, limits.y, limits.y + limits.height),
        };
        if (this.freeCamera.value) {
          next = { x: base.x + this.panVector.x, y: base.y + this.panVector.y };
        }
        const moved = !pointEquals(next, base);
        const hitX = !!(this.panVector.x && next.x === base.x);
        const hitY = !!(this.panVector.y && next.y === base.y);
        let frame = 0;
        if (hitX || hitY) {
          const n = new THREE.Vector2(
            hitX ? Math.sign(this.panVector.x) : 0,
            hitY ? Math.sign(this.panVector.y) : 0,
          );
          frame = 1 + ((THREE.Math.radToDeg(n.angle()) + 90) % 360) / 45;
        }
        this.pointer.setPointerType(PointerType.Pan, frame);
        if (moved) this.cameraPan.setPan({ x: next.x, y: next.y });
        this.isPanning = moved;
      } else {
        this.pointer.setPointerType(PointerType.Pan);
      }
    };
  }

  /**
   * 开始拖拽。
   * @param pos 起始指针坐标
   */
  start(pos: { x: number; y: number }): void {
    this.startPos = pos;
    this.isPanning = false;
    this.panVector = new THREE.Vector2(0, 0);
    this.worldScene.onBeforeCameraUpdate.subscribe(this.onFrame);
  }

  /**
   * 更新拖拽向量。
   * @param pos 当前指针
   * @param sticky true=相对起始绝对位移；false=速率缩放
   */
  update(pos: { x: number; y: number }, sticky: boolean): void {
    if (sticky) {
      this.initialPan ||= this.cameraPan.getPan();
      this.panVector.x = this.startPos.x - pos.x;
      this.panVector.y = this.startPos.y - pos.y;
    } else {
      const maxStep = (this.panRate.value / 5) * 100;
      this.panVector.x = Math.floor((maxStep * clamp(pos.x - this.startPos.x, -600, 600)) / 600);
      this.panVector.y = Math.floor((maxStep * clamp(pos.y - this.startPos.y, -600, 600)) / 600);
    }
    this.isPanning = true;
    this.stickyMode = sticky;
  }

  /** 结束拖拽：退订帧、恢复默认指针。 */
  finish(): void {
    this.worldScene.onBeforeCameraUpdate.unsubscribe(this.onFrame);
    this.pointer.setPointerType(PointerType.Default);
    this.initialPan = void 0;
  }

  /**
   * 暂停/恢复。
   * @param paused 是否暂停
   */
  setPaused(paused: boolean): void {
    this.paused = paused;
  }

  /** 释放=finish。 */
  dispose(): void {
    this.finish();
  }
}
