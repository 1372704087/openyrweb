/**
 * ChronoFxHandler — 时间传送（Chronoshift）特效处理器。
 *
 * ObjectTeleport(isChronoshift)：在原位与目标位各播一次 warpOut，
 * 按目标 tileOffset 换算子格偏移。
 * ObjectDestroy(deathType===Temporal)：播 warpAway；建筑用 centerTile，
 * 单位用 position 的 tileOffset。
 *
 * 由 engine/renderable/fx/handler/ChronoFxHandler.ts.js 重写为 TS（行为完全一致）。
 * 两个文件并存期间，本文件才是修改目标：tools/repack.mjs 打包时优先
 * 采用 .ts 模块的编译产物。
 */
import { EventType } from "game/event/EventType"; // 已转换
import { CompositeDisposable } from "util/disposable/CompositeDisposable"; // 已转换
import { Coords } from "game/Coords"; // 已转换
import { DeathType } from "game/gameobject/common/DeathType"; // 已转换

/* eslint-disable @typescript-eslint/no-explicit-any */

/**
 * 时间传送特效处理器。
 */
export class ChronoFxHandler {
  /** 游戏。 */
  game: any;
  /** 渲染管理器。 */
  renderableManager: any;
  /** 复合可释放。 */
  disposables: any;
  /** 传送事件回调。 */
  handleObjectTeleport: (ev: any) => void;
  /** 销毁事件回调。 */
  handleObjectDestroy: (ev: any) => void;

  /**
   * @param game - 游戏
   * @param renderableManager - 渲染管理器
   */
  constructor(game: any, renderableManager: any) {
    this.game = game;
    this.renderableManager = renderableManager;
    this.disposables = new CompositeDisposable();

    this.handleObjectTeleport = (ev: any) => {
      if (ev.isChronoshift) {
        // 目标对象子格偏移 → tile 单位
        const off = ev.target.position.getTileOffset().multiplyScalar(1 / Coords.LEPTONS_PER_TILE);
        this.renderableManager.createTransientAnim(this.game.rules.audioVisual.warpOut, (a: any) => {
          a.setPosition(Coords.tile3dToWorld(ev.prevTile.rx + off.x, ev.prevTile.ry + off.y, ev.prevTile.z));
        });
        this.renderableManager.createTransientAnim(this.game.rules.audioVisual.warpOut, (a: any) => {
          const t = ev.target.tile;
          a.setPosition(Coords.tile3dToWorld(t.rx + off.x, t.ry + off.y, t.z));
        });
      }
    };

    this.handleObjectDestroy = (ev: any) => {
      if (ev.target.deathType === DeathType.Temporal) {
        // 建筑用中心格 + (0.5,0.5)；单位用位置偏移
        const tile = ev.target.isBuilding() ? ev.target.centerTile : ev.target.tile;
        const off = ev.target.isBuilding()
          ? new THREE.Vector2(0.5, 0.5)
          : ev.target.position.getTileOffset().multiplyScalar(1 / Coords.LEPTONS_PER_TILE);
        this.renderableManager.createTransientAnim(this.game.rules.audioVisual.warpAway, (a: any) => {
          a.setPosition(Coords.tile3dToWorld(tile.rx + off.x, tile.ry + off.y, tile.z));
        });
      }
    };
  }

  /** 订阅传送与销毁事件。 */
  init(): void {
    this.disposables.add(
      this.game.events.subscribe(EventType.ObjectTeleport, this.handleObjectTeleport),
      this.game.events.subscribe(EventType.ObjectDestroy, this.handleObjectDestroy),
    );
  }

  /** 释放订阅。 */
  dispose(): void {
    this.disposables.dispose();
  }
}
