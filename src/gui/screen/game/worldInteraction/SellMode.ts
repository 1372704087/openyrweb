/**
 * SellMode — 出售模式：判定可返还对象并广播。
 *
 * 由 gui/screen/game/worldInteraction/SellMode.ts.js
 * 重写为 TS（行为完全一致）。
 *
 * 两个文件并存期间，本文件才是修改目标：tools/repack.mjs 打包时优先采用 .ts 模块的编译产物。
 */
import * as PointerTypeModule from "engine/type/PointerType"; // 孪生
import { EventDispatcher } from "util/event"; // 已转换
import * as BuildingModule from "game/gameobject/Building"; // 孪生
import * as DockableTraitModule from "game/gameobject/trait/DockableTrait"; // 孪生

/* eslint-disable @typescript-eslint/no-explicit-any */

// 孪生 any-shim：取命名空间成员
const PointerType: any = (PointerTypeModule as any).PointerType;
const BuildStatus: any = (BuildingModule as any).BuildStatus ?? (BuildingModule as any);
const DockableTrait: any = (DockableTraitModule as any).DockableTrait;

/** 出售交互模式。 */
export class SellMode {
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
  /** 当前悬停。 */
  currentHover: any;
  /** 上次悬停。 */
  lastHover: any;
  /** 上次刷新时间。 */
  lastUpdate: number | undefined;
  /** 帧回调。 */
  onFrame: (now: number) => void;

  /** 命中可卖对象时广播。 */
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
  static factory(game: any, player: any, sidebarModel: any, pointer: any, renderer: any): SellMode {
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
        this.lastHover?.tile !== this.currentHover?.tile ||
        this.lastHover?.gameObject !== this.currentHover?.gameObject ||
        !this.lastUpdate ||
        now - this.lastUpdate >= 1e3 / 15
      ) {
        this.lastHover = this.currentHover;
        this.lastUpdate = now;
        let type = PointerType.Default;
        if (this.currentHover?.tile) {
          const obj = this.currentHover.gameObject;
          type =
            obj && this.isRefundableObject(obj)
              ? obj.isBuilding()
                ? PointerType.Sell
                : PointerType.SellMini
              : PointerType.NoSell;
        }
        this.pointer.setPointerType(type);
      }
    };
  }

  /** 进入：置侧栏出售标志并订阅帧。 */
  enter(): void {
    this.sidebarModel.sellMode = true;
    this.currentHover = void 0;
    this.lastHover = void 0;
    this.lastUpdate = void 0;
    this.renderer.onFrame.subscribe(this.onFrame);
  }

  /**
   * 悬停更新。
   * @param hover 悬停信息
   * @param secondary 是否右键
   */
  hover(hover: any, secondary: boolean): void {
    if (!secondary) this.currentHover = hover;
  }

  /**
   * 是否可出售并返还。
   * @param obj 目标对象
   */
  isRefundableObject(obj: any): boolean {
    return !!(
      obj.isTechno() &&
      obj.owner === this.player &&
      !obj.rules.unsellable &&
      this.game.sellTrait.computeRefundValue(obj) > 0 &&
      (obj.isBuilding()
        ? obj.buildStatus === BuildStatus.Ready && !obj.warpedOutTrait.isActive()
        : obj.traits.find(DockableTrait)?.dock?.rules.unitSell)
    );
  }

  /**
   * 执行：可卖则广播；恒返回 false。
   * @param hover 悬停
   * @param secondary 是否右键
   */
  execute(hover: any, secondary: boolean): boolean {
    if (secondary) return false;
    const obj = hover?.gameObject;
    if (obj && this.isRefundableObject(obj)) this._onExecute.dispatch(this, obj);
    return false;
  }

  /** 取消=结束。 */
  cancel(): void {
    this.end();
  }

  /** 清侧栏标志并退订帧。 */
  end(): void {
    this.sidebarModel.sellMode = false;
    this.renderer.onFrame.unsubscribe(this.onFrame);
  }

  /** 释放=结束。 */
  dispose(): void {
    this.end();
  }
}
