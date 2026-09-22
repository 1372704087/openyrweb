/**
 * DelayedKillTrait — 延迟击杀 trait。
 *
 * 给单位挂一个可激活的倒计时（Timer）；倒计时结束后若单位仍可被杀
 * （非 invulnerable、非 CAB 占领建筑），则直接 world.destroyObject 销毁，
 * 并把激活时记录的 attackerInfo 作为击杀者回传（用于功劳/经验归属）。
 *
 * 典型用途：Timed Destruction（如 C4/辐射尘埃延迟爆炸）。
 *
 * 由 game/gameobject/trait/DelayedKillTrait.ts.js 重写为 TS（行为完全一致）。
 * 两个文件并存期间，本文件才是修改目标：tools/repack.mjs 打包时优先
 * 采用 .ts 模块的编译产物。
 */
import { Timer } from "game/gameobject/unit/Timer"; // 已转换
import * as NotifyTickModule from "game/gameobject/trait/interface/NotifyTick"; // 已转换

export class DelayedKillTrait {
  /** 延迟击杀倒计时。 */
  timer: Timer;
  /** 激活时记录的击杀者信息（destroyObject 第二参透传）。 */
  attackerInfo?: any;

  constructor() {
    this.timer = new Timer();
  }

  /** 倒计时是否在跑。 */
  isActive(): boolean {
    return this.timer.isActive();
  }

  /** 激活倒计时（单位已有时忽略）；同时记录 attackerInfo 供到期销毁用。 */
  activate(duration: number, attackerInfo?: any): void {
    if (!this.isActive()) {
      this.timer.setActiveFor(duration, undefined);
      this.attackerInfo = attackerInfo;
    }
  }

  /**
   * 每 tick：倒计时归零时销毁目标——但若目标正处无敌（invulnerableTrait）
   * 或是 CAB 小屋建筑（cabHutTrait），则跳过销毁（原版锁步例外）。
   */
  [NotifyTickModule.NotifyTick.onTick](object: any, world: any): void {
    if (this.timer.isActive() && true === this.timer.tick(world.currentTick)) {
      if (
        object.invulnerableTrait.isActive() ||
        (object.isBuilding() && object.cabHutTrait)
      ) {
        return;
      }
      world.destroyObject(object, this.attackerInfo, true, true);
    }
  }
}
