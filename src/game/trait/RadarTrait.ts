/**
 * RadarTrait — 雷达开关/攻击警报 trait（挂在玩家上）。
 *
 * 管理玩家雷达可用性（无雷达建筑/低电力/闪电风暴敌方超武 → 禁用），
 * 以及攻击警报事件（基地受袭/矿车受袭，带范围抑制与持续时间）：
 *  - 建筑 spawn/unspawn/换主/电力/warp 变化 → updateRadarForPlayer；
 *  - LightningStorm 激活/失效 → 以 activeLightningStrikes 计数，
 *    激活时禁用敌方雷达，失效归零后恢复全部；
 *  - onAttack：建筑受袭→BaseUnderAttack，矿车受袭→HarvesterUnderAttack，
 *    经 addEventForPlayer 去重（同类型+抑制距离内不重复派发）。
 *
 * 由 game/trait/RadarTrait.ts.js 重写为 TS（行为完全一致）。
 * 两个文件并存期间，本文件才是修改目标：tools/repack.mjs 打包时优先
 * 采用 .ts 模块的编译产物。
 */
import * as NotifySpawnModule from "game/trait/interface/NotifySpawn"; // 孪生
import * as NotifyUnspawnModule from "game/trait/interface/NotifyUnspawn"; // 孪生
import * as NotifyPowerModule from "game/trait/interface/NotifyPower"; // 已转换
import { PowerLevel } from "game/player/trait/PowerTrait"; // 孪生
import * as RadarOnOffEventModule from "game/event/RadarOnOffEvent"; // 孪生
import * as NotifyOwnerChangeModule from "game/trait/interface/NotifyOwnerChange"; // 本组新写
import * as RangeHelperModule from "game/gameobject/unit/RangeHelper"; // 未转换（any-shim）
import { RadarRules, RadarEventType } from "game/rules/general/RadarRules"; // 孪生
import * as RadarEventModule from "game/event/RadarEvent"; // 孪生
import * as NotifyAttackModule from "game/trait/interface/NotifyAttack"; // 孪生
import * as NotifyWarpChangeModule from "game/trait/interface/NotifyWarpChange"; // 孪生
import * as NotifySuperWeaponActivateModule from "game/trait/interface/NotifySuperWeaponActivate"; // 本组新写
import { SuperWeaponType } from "game/type/SuperWeaponType"; // 孪生
import * as NotifySuperWeaponDeactivateModule from "game/trait/interface/NotifySuperWeaponDeactivate"; // 孪生

export class RadarTrait {
  /** 闪电风暴激活计数（key=发动者玩家；多个风暴可叠加）。 */
  activeLightningStrikes: Map<any, number>;

  constructor() {
    this.activeLightningStrikes = new Map();
  }

  /** 雷达建筑出生：刷新该玩家雷达状态。 */
  [NotifySpawnModule.NotifySpawn.onSpawn](object: any, world: any): void {
    if (object.isBuilding() && object.rules.radar) {
      this.updateRadarForPlayer(object.owner, world);
    }
  }

  /** 雷达建筑离场：刷新该玩家雷达状态。 */
  [NotifyUnspawnModule.NotifyUnspawn.onUnspawn](object: any, world: any): void {
    if (object.isBuilding() && object.rules.radar) {
      this.updateRadarForPlayer(object.owner, world);
    }
  }

  /** 进入低电力：刷新雷达（低电禁用）。 */
  [NotifyPowerModule.NotifyPower.onPowerLow](player: any, world: any): void {
    this.updateRadarForPlayer(player, world);
  }

  /** 电力恢复：刷新雷达。 */
  [NotifyPowerModule.NotifyPower.onPowerRestore](player: any, world: any): void {
    this.updateRadarForPlayer(player, world);
  }

  /** 电力数值变化：雷达已在 onPowerLow/Restore 处理，此处空实现。 */
  [NotifyPowerModule.NotifyPower.onPowerChange](): void {}

  /** 雷达建筑换主：新旧双方都刷新。 */
  [NotifyOwnerChangeModule.NotifyOwnerChange.onChange](
    object: any,
    oldOwner: any,
    world: any,
  ): void {
    if (object.rules.radar) {
      this.updateRadarForPlayer(oldOwner, world);
      this.updateRadarForPlayer(object.owner, world);
    }
  }

  /** warp 变化：刷新该玩家雷达。 */
  [NotifyWarpChangeModule.NotifyWarpChange.onChange](object: any, world: any): void {
    if (object.rules.radar) this.updateRadarForPlayer(object.owner, world);
  }

  /**
   * 闪电风暴激活：为发动者计数+1，并禁用所有非同盟战斗方雷达。
   */
  [NotifySuperWeaponActivateModule.NotifySuperWeaponActivate.onActivate](
    type: number,
    activator: any,
    world: any,
  ): void {
    if (type === SuperWeaponType.LightningStorm) {
      this.activeLightningStrikes.set(
        activator,
        (this.activeLightningStrikes.get(activator) ?? 0) + 1,
      );
      for (const player of world.getCombatants()) {
        if (player === activator || world.alliances.areAllied(player, activator)) continue;
        this.updateRadarForPlayer(player, world);
      }
    }
  }

  /**
   * 闪电风暴失效：计数-1；归零删除；若 ≤0 则恢复全部战斗方雷达。
   */
  [NotifySuperWeaponDeactivateModule.NotifySuperWeaponDeactivate.onDeactivate](
    type: number,
    activator: any,
    world: any,
  ): void {
    if (type === SuperWeaponType.LightningStorm) {
      const count = (this.activeLightningStrikes.get(activator) ?? 0) - 1;
      if (0 < count) this.activeLightningStrikes.set(activator, count);
      else this.activeLightningStrikes.delete(activator);
      if (count <= 0) {
        for (const player of world.getCombatants()) {
          this.updateRadarForPlayer(player, world);
        }
      }
    }
  }

  /**
   * 刷新玩家雷达禁用状态。禁用条件（任一）：
   *  - 无可用雷达建筑（无 radar 规则或全部 warpedOut）；
   *  - 电力等级 Low；
   *  - 存在非同盟玩家的闪电风暴进行中。
   * 状态变化时派发 RadarOnOffEvent。
   */
  updateRadarForPlayer(player: any, world: any): void {
    if (!player.radarTrait) return;
    const wasDisabled = player.radarTrait?.isDisabled();
    const disabled =
      ![...player.buildings].find((b) => b.rules.radar && !b.warpedOutTrait.isActive()) ||
      player.powerTrait.level === PowerLevel.Low ||
      [...this.activeLightningStrikes.entries()].some(
        ([owner, count]) => count && owner !== player && !world.alliances.areAllied(owner, player),
      );
    player.radarTrait.setDisabled(disabled);
    if (wasDisabled !== disabled) {
      world.events.dispatch(new RadarOnOffEventModule.RadarOnOffEvent(player, !disabled));
    }
  }

  /**
   * 受击警报：Techno 受袭时——
   *  - 建筑（可占领/需工程师的除外判定在分支内）→ BaseUnderAttack；
   *  - 载具矿车 → HarvesterUnderAttack。
   */
  [NotifyAttackModule.NotifyAttack.onAttack](object: any, _attacker: any, world: any): void {
    if (!object.isTechno()) return;
    if (
      !object.isBuilding() ||
      object.rules.canBeOccupied ||
      object.rules.needsEngineer
    ) {
      if (object.isVehicle() && object.harvesterTrait) {
        this.addEventForPlayer(
          RadarEventType.HarvesterUnderAttack,
          object.owner,
          object.tile,
          world,
        );
      }
    } else {
      this.addEventForPlayer(
        RadarEventType.BaseUnderAttack,
        object.owner,
        object.tile,
        world,
      );
    }
  }

  /**
   * 向玩家雷达添加警报事件：先滤掉过期事件；若同类型事件仍在
   * 抑制距离内则不重复；否则 push 新事件并派发 RadarEvent。
   */
  addEventForPlayer(type: number, player: any, tile: any, world: any): void {
    const radar = player.radarTrait;
    if (!radar) return;
    const rules = world.rules.general.radar;
    radar.activeEvents = radar.activeEvents.filter(
      (e: any) => world.currentTick - e.startTick < rules.getEventDuration(e.type),
    );
    const helper = new RangeHelperModule.RangeHelper(world.map.tileOccupation);
    const suppressed = !!radar.activeEvents.find(
      (e: any) =>
        e.type === type &&
        helper.isInTileRange(tile, e.tile, 0, rules.getEventSuppresionDistance(e.type)),
    );
    if (!suppressed) {
      radar.activeEvents.push({ startTick: world.currentTick, tile, type });
      world.events.dispatch(new RadarEventModule.RadarEvent(player, type, tile));
    }
  }
}
