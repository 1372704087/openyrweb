/**
 * GunnerTrait — IFV（多功能步兵车）炮手/模式切换 trait。
 *
 * 当运输舱内载员数量从 0↔1 变化时，按载员的 ifvMode 切换 IFV 炮塔索引
 * 并通知 armedTrait 选择对应特殊武器（精英级优先）：
 *  - lastHadGunner 记录上帧「是否有炮手」，边沿触发（仅在变化时动作）；
 *  - turretIndexesByIfvMode 映射 ifvMode → 炮塔索引，索引须 < turretCount；
 *  - 若为 Elite 级则 selectSpecialWeapon 传 isElite=true。
 *
 * 另提供 UI 名称解析：0=火箭、1=维修、2/4/5=机枪，其余回落为
 * "name:" + mode 小写。
 *
 * 由 game/gameobject/trait/GunnerTrait.ts.js 重写为 TS（行为完全一致）。
 * 两个文件并存期间，本文件才是修改目标：tools/repack.mjs 打包时优先
 * 采用 .ts 模块的编译产物。
 */
import { VeteranLevel } from "game/gameobject/unit/VeteranLevel"; // 已转换
import * as NotifyTickModule from "game/gameobject/trait/interface/NotifyTick"; // 已转换

export class GunnerTrait {
  /** 上一帧运输舱是否有人（边沿触发用）；未初始化时 undefined。 */
  lastHadGunner?: boolean;

  /**
   * 每 tick：检测载员数量从「有人↔无人」边沿，切换 IFV 炮塔并选武器。
   * 锁步：仅在布尔边沿触发一次，与孪生一致。
   */
  [NotifyTickModule.NotifyTick.onTick](object: any): void {
    const hasGunner = !!object.transportTrait.units.length;
    if (hasGunner !== this.lastHadGunner) {
      this.lastHadGunner = !!object.transportTrait.units.length;
      const ifvMode = object.transportTrait.units[0]?.rules.ifvMode ?? 0;
      const turretIndex = object.rules.turretIndexesByIfvMode.get(ifvMode) ?? 0;
      if (turretIndex < object.rules.turretCount) {
        object.turretNo = turretIndex;
        object.armedTrait?.selectSpecialWeapon(
          ifvMode,
          object.veteranLevel === VeteranLevel.Elite,
        );
      }
    }
  }

  /** 按 ifvMode 返回 UI 提示 key（0 火箭 / 1 维修 / 2·4·5 机枪 / 其余 name:mode）。 */
  getUiNameForIfvMode(mode: number, fallback?: string): string | undefined {
    switch (mode) {
      case 0:
        return "tip:rocket";
      case 1:
        return "tip:repair";
      case 2:
      case 4:
      case 5:
        return "tip:machinegun";
      default:
        return fallback ? "name:" + fallback.toLowerCase() : undefined;
    }
  }
}
