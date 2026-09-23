/**
 * CrateFxHandler — 宝箱拾取特效处理器。
 *
 * 订阅 CratePickup：若 target.animName 存在，则 createTransientAnim，
 * 摆到地块中心 +1 高度，renderOrder=1e6。
 *
 * 由 engine/renderable/fx/handler/CrateFxHandler.ts.js 重写为 TS（行为完全一致）。
 * 两个文件并存期间，本文件才是修改目标：tools/repack.mjs 打包时优先
 * 采用 .ts 模块的编译产物。
 */
import { EventType } from "game/event/EventType"; // 已转换
import { CompositeDisposable } from "util/disposable/CompositeDisposable"; // 已转换
import { Coords } from "game/Coords"; // 已转换

/* eslint-disable @typescript-eslint/no-explicit-any */

/**
 * 宝箱特效处理器。
 */
export class CrateFxHandler {
  /** 游戏。 */
  game: any;
  /** 渲染管理器。 */
  renderableManager: any;
  /** 复合可释放。 */
  disposables: any;

  /**
   * @param game - 游戏
   * @param renderableManager - 渲染管理器
   */
  constructor(game: any, renderableManager: any) {
    this.game = game;
    this.renderableManager = renderableManager;
    this.disposables = new CompositeDisposable();
  }

  /** 订阅 CratePickup。 */
  init(): void {
    this.disposables.add(
      this.game.events.subscribe(EventType.CratePickup, (ev: any) => {
        const animName = ev.target.animName;
        if (animName) {
          this.renderableManager.createTransientAnim(animName, (anim: any) => {
            anim.setPosition(Coords.tile3dToWorld(ev.tile.rx, ev.tile.ry, ev.tile.z + 1));
            anim.setRenderOrder(1e6);
          });
        }
      }),
    );
  }

  /** 释放订阅。 */
  dispose(): void {
    this.disposables.dispose();
  }
}
