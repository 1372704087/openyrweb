/**
 * ParasiteSparkFxHandler — 寄生虫火花特效处理器。
 *
 * 订阅 InflictDamage：当受害者是载具/飞机且攻击者非 organic、且满足
 * parasiteable 条件、血量仍 >0 时，在目标世界位置上方播一发白色 SparkFx，
 * 发射时长 = 20 / BASE_TICKS_PER_SECOND。
 *
 * 由 engine/renderable/fx/handler/ParasiteSparkFxHandler.ts.js 重写为 TS（行为完全一致）。
 * 两个文件并存期间，本文件才是修改目标：tools/repack.mjs 打包时优先
 * 采用 .ts 模块的编译产物。
 */
import { EventType } from "game/event/EventType"; // 已转换
import { CompositeDisposable } from "util/disposable/CompositeDisposable"; // 已转换
import { Coords } from "game/Coords"; // 已转换
import { GameSpeed } from "game/GameSpeed"; // 已转换
import { SparkFx } from "engine/renderable/fx/SparkFx"; // 已转换

/* eslint-disable @typescript-eslint/no-explicit-any */

/**
 * 寄生虫火花特效处理器。
 */
export class ParasiteSparkFxHandler {
  /** 游戏。 */
  game: any;
  /** 渲染管理器。 */
  renderableManager: any;
  /** 复合可释放。 */
  disposables: any;
  /** 受伤回调。 */
  handleObjectDamaged: (ev: any) => void;

  /**
   * @param game - 游戏
   * @param renderableManager - 渲染管理器
   */
  constructor(game: any, renderableManager: any) {
    this.game = game;
    this.renderableManager = renderableManager;
    this.disposables = new CompositeDisposable();

    this.handleObjectDamaged = (ev: any) => {
      if (
        (ev.target.isVehicle() || ev.target.isAircraft()) &&
        ev.attacker?.obj &&
        !ev.attacker.obj.rules.organic &&
        (ev.target.parasiteableTrait?.getParasite() === ev.attacker.obj || ev.target === ev.attacker.obj) &&
        ev.target.healthTrait.health > 0
      ) {
        const world = ev.target.position.worldPosition.clone();
        world.y += Coords.tileHeightToWorld(0.5);
        // 20 帧 → 秒
        const duration = 20 / GameSpeed.BASE_TICKS_PER_SECOND;
        const spark = new SparkFx(world, new THREE.Color(1, 1, 1), duration, this.game.speed);
        this.renderableManager.addEffect(spark);
      }
    };
  }

  /** 订阅 InflictDamage。 */
  init(): void {
    this.disposables.add(this.game.events.subscribe(EventType.InflictDamage, this.handleObjectDamaged));
  }

  /** 释放订阅。 */
  dispose(): void {
    this.disposables.dispose();
  }
}
