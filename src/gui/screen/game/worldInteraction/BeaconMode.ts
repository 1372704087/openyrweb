/**
 * BeaconMode — 放置信标交互模式。
 *
 * 由 gui/screen/game/worldInteraction/BeaconMode.ts.js
 * 重写为 TS（行为完全一致）。
 *
 * 两个文件并存期间，本文件才是修改目标：tools/repack.mjs 打包时优先采用 .ts 模块的编译产物。
 */
import * as PointerTypeModule from "engine/type/PointerType"; // 孪生
import { EventDispatcher } from "util/event"; // 已转换

/* eslint-disable @typescript-eslint/no-explicit-any */

// 孪生 any-shim：取命名空间成员
const PointerType: any = (PointerTypeModule as any).PointerType;

/** 信标放置模式。 */
export class BeaconMode {
  /** 指针。 */
  pointer: any;
  /** 渲染器。 */
  renderer: any;
  /** 执行事件源。 */
  private _onExecute = new EventDispatcher();
  /** 当前悬停 tile。 */
  currentTile: any;
  /** 上次已刷新的 tile。 */
  lastTile: any;
  /** 上次刷新时间。 */
  lastUpdate: number | undefined;
  /** 帧回调。 */
  onFrame: (now: number) => void;

  /** 放置完成事件。 */
  get onExecute() {
    return this._onExecute.asEvent();
  }

  /**
   * 工厂。
   * @param pointer 指针
   * @param renderer 渲染器
   */
  static factory(pointer: any, renderer: any): BeaconMode {
    return new this(pointer, renderer);
  }

  /**
   * @param pointer 指针
   * @param renderer 渲染器
   */
  constructor(pointer: any, renderer: any) {
    this.pointer = pointer;
    this.renderer = renderer;
    this._onExecute = new EventDispatcher();
    this.onFrame = (now: number) => {
      if (
        this.lastTile !== this.currentTile ||
        !this.lastUpdate ||
        now - this.lastUpdate >= 1e3 / 15
      ) {
        this.lastTile = this.currentTile;
        this.lastUpdate = now;
        const tile = this.currentTile;
        this.pointer.setPointerType(tile ? PointerType.Beacon : PointerType.Default);
      }
    };
  }

  /** 进入模式：清状态并订阅帧。 */
  enter(): void {
    this.currentTile = void 0;
    this.lastTile = void 0;
    this.lastUpdate = void 0;
    this.renderer.onFrame.subscribe(this.onFrame);
  }

  /**
   * 悬停更新（右键不更新）。
   * @param hover 悬停信息
   * @param secondary 是否右键
   */
  hover(hover: any, secondary: boolean): void {
    if (!secondary) this.currentTile = hover?.tile;
  }

  /**
   * 执行：无 tile 或右键则 false；否则广播并结束。
   * @param hover 悬停
   * @param secondary 是否右键
   */
  execute(hover: any, secondary: boolean): boolean {
    if (secondary) return false;
    const tile = hover?.tile;
    if (!tile) return false;
    this._onExecute.dispatch(this, tile);
    this.end();
    return void 0 as any;
  }

  /** 取消=结束。 */
  cancel(): void {
    this.end();
  }

  /** 退订帧。 */
  end(): void {
    this.renderer.onFrame.unsubscribe(this.onFrame);
  }

  /** 释放=结束。 */
  dispose(): void {
    this.end();
  }
}
