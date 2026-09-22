/**
 * C4ChargeTrait — C4 定时爆破 charge trait。
 *
 * setCharge 引信启动后，每 tick 推进 Timer；到点时若目标无敌则跳过，
 * 桥堡（cabHutTrait）触发 demolishBridge，否则标 DeathType.Demolish
 * 并 world.destroyObject。
 *
 * 由 game/gameobject/trait/C4ChargeTrait.ts.js 重写为 TS
 * （行为完全一致）。两个文件并存期间，本文件才是修改目标：
 * tools/repack.mjs 打包时优先采用 .ts 模块的编译产物。
 */
import { DeathType } from "game/gameobject/common/DeathType"; // 未转换（any-shim）
import { Timer } from "game/gameobject/unit/Timer"; // 未转换（any-shim）
import * as NotifyTickModule from "game/gameobject/trait/interface/NotifyTick"; // 已转换

/* eslint-disable @typescript-eslint/no-explicit-any */
export class C4ChargeTrait {
  /** 引信定时器。 */
  timer: Timer;
  /** 触发时的攻击者信息（destroyObject 用）。 */
  attackerInfo: any;

  constructor() {
    this.timer = new Timer();
  }

  /** 当前是否仍有未爆 charge。 */
  hasCharge(): boolean {
    return this.timer.isActive();
  }

  /** 设定引信时长并记录攻击者；已有 charge 时忽略。 */
  setCharge(ticks: number, attackerInfo: any): void {
    if (!this.hasCharge()) {
      this.timer.setActiveFor(ticks, undefined);
      this.attackerInfo = attackerInfo;
    }
  }

  /** 每 tick 推进引信；到点后引爆/拆桥。 */
  [NotifyTickModule.NotifyTick.onTick](gameObject: any, world: any): void {
    if (this.timer.isActive() && !0 === this.timer.tick(world.currentTick)) {
      if (gameObject.invulnerableTrait.isActive()) return;
      if (gameObject.isBuilding() && gameObject.cabHutTrait) {
        gameObject.cabHutTrait.demolishBridge(world, this.attackerInfo);
      } else {
        gameObject.deathType = DeathType.Demolish;
        world.destroyObject(gameObject, this.attackerInfo, !0);
      }
    }
  }
}
