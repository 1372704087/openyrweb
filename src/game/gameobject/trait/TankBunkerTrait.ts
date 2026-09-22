/**
 * TankBunkerTrait — 坦克碉堡（伤害转移、武器加成、进出校验、出售/摧毁疏散）。
 *
 * 与 DockTrait 协作：车辆物理驶入 dock 格保持可见。伤害由碉堡建筑吸收
 * （PenetratesBunker 除外的规则在调用方）；车在碉堡内享
 * BunkerDamageMultiplier/ROF/RangeBonus。tick 校验 bunkeredVehicle 仍有效；
 * destroy/sell 时 undock 并（destroy 且连带摧毁参数时）destroyObject。
 *
 * 由 game/gameobject/trait/TankBunkerTrait.ts.js 重写为 TS（行为完全一
 * 致）。两个文件并存期间，本文件才是修改目标：tools/repack.mjs 打包时优先
 * 采用 .ts 模块的编译产物。
 */
import * as NotifyTickModule from "game/gameobject/trait/interface/NotifyTick"; // 已转换
import * as NotifyDestroyModule from "game/gameobject/trait/interface/NotifyDestroy"; // 已转换
import * as NotifyDamageModule from "game/gameobject/trait/interface/NotifyDamage"; // 已转换
import * as NotifySellModule from "game/gameobject/trait/interface/NotifySell"; // 已转换
import * as LocomotorTypeModule from "game/type/LocomotorType"; // 已转换
import * as SpeedTypeModule from "game/type/SpeedType"; // 未转换（any-shim）
import * as math from "util/math"; // 已转换

/* eslint-disable @typescript-eslint/no-explicit-any */
export class TankBunkerTrait {
  /** 所属碉堡建筑。 */
  building: any;
  /** 当前驻守车辆（空则 undefined）。 */
  bunkeredVehicle: any;
  /** 上一 tick 的 docked 计数。 */
  _prevDockedCount: number;

  constructor(building: any) {
    this.building = building;
    // 由轮询 DockTrait.getDockedUnits() 维护；DockTrait 负责实际进出港。
    this.bunkeredVehicle = undefined;
    this._prevDockedCount = 0;
  }

  /**
   * 入堡资格：地面车辆、Bunkerable、有炮塔/OmniFire、有主武器、
   * Size≥1、非运输、非寄生/心灵控制。
   */
  canVehicleEnter(vehicle: any) {
    if (!vehicle || !vehicle.isVehicle()) return false;
    if (vehicle.rules.locomotor !== LocomotorTypeModule.LocomotorType.Vehicle) return false;
    if (vehicle.rules.bunkerable === false) return false;
    const hasTurret = !!vehicle.rules.turret;
    const hasOmniFire = !!vehicle.rules.omniFire;
    if (!hasTurret && !hasOmniFire) return false;
    if (!vehicle.rules.primary) return false;
    if (vehicle.rules.size < 1) return false;
    if (vehicle.transportTrait) return false;
    if (vehicle.parasiteableTrait && vehicle.parasiteableTrait.isInfested()) return false;
    if (vehicle.mindControllableTrait && vehicle.mindControllableTrait.isActive()) return false;
    if (vehicle.mindControllerTrait && vehicle.mindControllerTrait.isActive()) return false;
    return true;
  }

  /** 该车是否正驻守本堡。 */
  isVehicleBunkered(vehicle: any) {
    return this.bunkeredVehicle === vehicle;
  }

  /** 当前驻守车辆。 */
  getBunkeredVehicle() {
    return this.bunkeredVehicle;
  }

  /** 碉堡伤害倍率（combatDamage.bunkerDamageMultiplier，默认 1）。 */
  getDamageMultiplier() {
    return this.building.game?.rules?.combatDamage?.bunkerDamageMultiplier ?? 1;
  }

  /** 碉堡射速倍率。 */
  getROFMultiplier() {
    return this.building.game?.rules?.combatDamage?.bunkerROFMultiplier ?? 1;
  }

  /** 碉堡射程加成。 */
  getRangeBonus() {
    return this.building.game?.rules?.combatDamage?.bunkerWeaponRangeBonus ?? 0;
  }

  /** 每 tick：驻守车已毁/已释放则清引用。 */
  [NotifyTickModule.NotifyTick.onTick]() {
    if (this.bunkeredVehicle) {
      if (
        this.bunkeredVehicle.isDestroyed ||
        this.bunkeredVehicle.isDisposed ||
        !this.bunkeredVehicle.isSpawned
      ) {
        this.bunkeredVehicle.bunkeredAt = undefined;
        this.bunkeredVehicle = undefined;
      }
    }
  }

  /** 受伤：原版不因受伤自动疏散（保留钩子）。 */
  [NotifyDamageModule.NotifyDamage.onDamage](_object: any, _world: any) {
    // vanilla YR: no auto-evac on damage
  }

  /** 碉堡摧毁：疏散；连带摧毁参数时随堡同毁，否则 undock。 */
  [NotifyDestroyModule.NotifyDestroy.onDestroy](object: any, world: any, attackerInfo: any, destroyWithBunker: any) {
    if (this.bunkeredVehicle) {
      const vehicle = this.bunkeredVehicle;
      vehicle.bunkeredAt = undefined;
      this.bunkeredVehicle = undefined;
      if (vehicle.moveTrait) {
        vehicle.moveTrait.setDisabled(false);
      }
      if (destroyWithBunker) {
        if (!vehicle.isDestroyed) {
          world.destroyObject(vehicle, attackerInfo, destroyWithBunker);
        }
      } else if (this.building.dockTrait) {
        this.building.dockTrait.undockUnit(vehicle);
      }
    }
  }

  /** 出售：先 undock 疏散驻守车。 */
  [NotifySellModule.NotifySell.onSell](_object: any, world: any) {
    if (this.bunkeredVehicle && this.building.dockTrait) {
      const vehicle = this.bunkeredVehicle;
      vehicle.bunkeredAt = undefined;
      this.bunkeredVehicle = undefined;
      if (vehicle.moveTrait) {
        vehicle.moveTrait.setDisabled(false);
      }
      this.building.dockTrait.undockUnit(vehicle);
    }
  }

  /** 对局哈希：驻守车状态。 */
  getHash() {
    return math.fnv32a(this.bunkeredVehicle ? [this.bunkeredVehicle.getHash()] : []);
  }

  /** 调试状态。 */
  debugGetState() {
    return { bunkeredVehicle: this.bunkeredVehicle?.debugGetState() };
  }

  /** 释放建筑引用。 */
  dispose() {
    this.building = undefined;
  }
}
