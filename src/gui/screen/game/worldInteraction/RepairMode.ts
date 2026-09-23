/**
 * RepairMode — 维修模式：查找可修建筑并广播。
 *
 * 由 gui/screen/game/worldInteraction/RepairMode.ts.js
 * 重写为 TS（行为完全一致）。
 *
 * 两个文件并存期间，本文件才是修改目标：tools/repack.mjs 打包时优先采用 .ts 模块的编译产物。
 */
import * as PointerTypeModule from "engine/type/PointerType"; // 孪生
import { EventDispatcher } from "util/event"; // 已转换

/* eslint-disable @typescript-eslint/no-explicit-any */

// 孪生 any-shim：取命名空间成员
const PointerType: any = (PointerTypeModule as any).PointerType;

/** 维修交互模式。 */
export class RepairMode {
  /** 游戏。 */
  game: any;
  /** 玩家。 */
  player: any;
  /** 侧栏模型。 */
  sidebarModel: any;
  /** 指针。 */
  pointer: any;
  /** 渲染器。 */
  renderer: any;
  /** 执行事件源。 */
  private _onExecute = new EventDispatcher();
  /** 当前悬停 tile。 */
  currentTile: any;
  /** 上次 tile。 */
  lastTile: any;
  /** 上次刷新时间。 */
  lastUpdate: number | undefined;
  /** 帧回调。 */
  onFrame: (now: number) => void;

  /** 找到可修建筑时广播。 */
  get onExecute() {
    return this._onExecute.asEvent();
  }

  /**
   * 工厂。
   * @param game 游戏
   * @param player 玩家
   * @param sidebarModel 侧栏
   * @param pointer 指针
   * @param renderer 渲染器
   */
  static factory(game: any, player: any, sidebarModel: any, pointer: any, renderer: any): RepairMode {
    return new this(game, player, sidebarModel, pointer, renderer);
  }

  /**
   * @param game 游戏
   * @param player 玩家
   * @param sidebarModel 侧栏
   * @param pointer 指针
   * @param renderer 渲染器
   */
  constructor(game: any, player: any, sidebarModel: any, pointer: any, renderer: any) {
    this.game = game;
    this.player = player;
    this.sidebarModel = sidebarModel;
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
        const canRepair = !!tile && !!this.findRepairableBuilding(tile);
        this.pointer.setPointerType(
          tile
            ? canRepair
              ? PointerType.SideRepair
              : PointerType.NoRepair
            : PointerType.Default,
        );
      }
    };
  }

  /** 进入：置侧栏维修标志并订阅帧。 */
  enter(): void {
    this.sidebarModel.repairMode = true;
    this.currentTile = void 0;
    this.lastTile = void 0;
    this.lastUpdate = void 0;
    this.renderer.onFrame.subscribe(this.onFrame);
  }

  /**
   * 悬停更新 tile。
   * @param hover 悬停
   * @param secondary 是否右键
   */
  hover(hover: any, secondary: boolean): void {
    if (!secondary) this.currentTile = hover?.tile;
  }

  /**
   * 查找 tile 上己方可修建筑。
   * @param tile 目标 tile
   */
  findRepairableBuilding(tile: any): any {
    return this.game.map
      .getObjectsOnTile(tile)
      .find(
        (o: any) =>
          o.isBuilding() &&
          o.owner === this.player &&
          o.healthTrait.health < 100 &&
          o.rules.repairable &&
          o.rules.clickRepairable,
      );
  }

  /**
   * 执行：找到则广播；恒返回 false（不吞点击语义与孪生一致）。
   * @param hover 悬停
   * @param secondary 是否右键
   */
  execute(hover: any, secondary: boolean): boolean {
    if (secondary) return false;
    const tile = hover?.tile;
    if (!tile) return false;
    const building = this.findRepairableBuilding(tile);
    if (building) this._onExecute.dispatch(this, building);
    return false;
  }

  /** 取消=结束。 */
  cancel(): void {
    this.end();
  }

  /** 清侧栏标志并退订帧。 */
  end(): void {
    this.sidebarModel.repairMode = false;
    this.renderer.onFrame.unsubscribe(this.onFrame);
  }

  /** 释放=结束。 */
  dispose(): void {
    this.end();
  }
}
