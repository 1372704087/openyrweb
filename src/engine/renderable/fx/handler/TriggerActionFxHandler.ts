/**
 * TriggerActionFxHandler — 触发器动作特效处理器。
 *
 * 订阅全量事件，仅处理 EventType.TriggerAnim：按 ev.name 创建瞬时动画，
 * 摆到 (rx+0.5, ry+0.5, z)。
 *
 * 由 engine/renderable/fx/handler/TriggerActionFxHandler.ts.js 重写为 TS（行为完全一致）。
 * 两个文件并存期间，本文件才是修改目标：tools/repack.mjs 打包时优先
 * 采用 .ts 模块的编译产物。
 */
import { CompositeDisposable } from "util/disposable/CompositeDisposable"; // 已转换
import { Coords } from "game/Coords"; // 已转换
import { EventType } from "game/event/EventType"; // 已转换

/* eslint-disable @typescript-eslint/no-explicit-any */

/**
 * 触发器动作特效处理器。
 */
export class TriggerActionFxHandler {
  /** 游戏。 */
  game: any;
  /** 渲染管理器。 */
  renderableManager: any;
  /** 复合可释放。 */
  disposables: any;
  /** 事件回调（构造时绑定）。 */
  handleEvent: (ev: any) => void;

  /**
   * @param game - 游戏
   * @param renderableManager - 渲染管理器
   */
  constructor(game: any, renderableManager: any) {
    this.game = game;
    this.renderableManager = renderableManager;
    this.disposables = new CompositeDisposable();

    this.handleEvent = (ev: any) => {
      switch (ev.type) {
        case EventType.TriggerAnim: {
          const e = ev as any;
          const name = e.name;
          this.renderableManager.createTransientAnim(name, (anim: any) => {
            const pos = Coords.tile3dToWorld(e.tile.rx + 0.5, e.tile.ry + 0.5, e.tile.z);
            anim.setPosition(pos);
          });
          break;
        }
      }
    };
  }

  /** 订阅事件总线。 */
  init(): void {
    this.disposables.add(this.game.events.subscribe(this.handleEvent));
  }

  /** 释放订阅。 */
  dispose(): void {
    this.disposables.dispose();
  }
}
