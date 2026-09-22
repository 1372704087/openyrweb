/**
 * OccupiableGarrisonTrait — 可被驻军的平民建筑 trait。
 *
 * 继承 GarrisonTrait，额外处理「平民可驻军建筑」：
 *  - 构造时传入疏散阈值 evacThreshold（血量低于 100×阈值则疏散）；
 *  - canBeOccupied：血量必须高于阈值才允许入驻；
 *  - onDamage：仅非军事建筑（!isBaseDefense）且从平民占领而来、
 *    血量跌破阈值时自动 evacuate；
 *  - onSell：出售时强制 evacuate；
 *  - _afterEvacuate：所有驻军离开且建筑仍属「从平民占领」时，
 *    把建筑还给平民玩家。
 *
 * 由 game/gameobject/trait/OccupiableGarrisonTrait.ts.js 重写为 TS（行为完全一致）。
 * 两个文件并存期间，本文件才是修改目标：tools/repack.mjs 打包时优先
 * 采用 .ts 模块的编译产物。
 */
import { GarrisonTrait } from "game/gameobject/trait/GarrisonTrait"; // 孪生
import * as NotifyDamageModule from "game/gameobject/trait/interface/NotifyDamage"; // 本组新写
import * as NotifySellModule from "game/gameobject/trait/interface/NotifySell"; // 已转换

export class OccupiableGarrisonTrait extends GarrisonTrait {
  /** 血量疏散阈值（0~1；血量 ≤ 100×阈值 时疏散）。 */
  readonly evacThreshold: number;

  constructor(building: any, evacThreshold: number, world: any) {
    super(building, world);
    this.evacThreshold = evacThreshold;
  }

  /** 血量高于阈值才允许入驻。 */
  canBeOccupied(): boolean {
    return this.building.healthTrait.health > 100 * this.evacThreshold;
  }

  /**
   * 受击：仅平民可驻军建筑（非军事防御、从平民占领而来）在红血时
   * 疏散；军事建筑（isBaseDefense）不疏散。
   */
  [NotifyDamageModule.NotifyDamage.onDamage](object: any, world: any): void {
    if (
      !object.rules.isBaseDefense &&
      object.wasCapturedFromCivilian &&
      object.healthTrait.health <= 100 * this.evacThreshold
    ) {
      this.evacuate(world);
    }
  }

  /** 出售时强制疏散驻军。 */
  [NotifySellModule.NotifySell.onSell](_object: any, world: any): void {
    this.evacuate(world);
  }

  /**
   * 疏散后钩子：当所有驻军离开且建筑原从平民占领而来时，
   * 把建筑还给平民玩家。
   */
  _afterEvacuate(world: any): void {
    const building = this.building;
    const units = this.units;
    if (0 === units.length && !building.isDestroyed && building.wasCapturedFromCivilian) {
      world.changeObjectOwner(building, world.getCivilianPlayer());
    }
  }
}
