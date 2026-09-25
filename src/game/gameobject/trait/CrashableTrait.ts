/**
 * CrashableTrait — 飞行器坠毁物理（Jumpjet/Winged 各自坠毁轨迹 + 落地摧毁）。
 *
 * 由 game/gameobject/trait/CrashableTrait.ts.js 重写为 TS（行为完全一致）。
 * 本文件为修改目标：tools/repack.mjs 打包时优先采用 .ts 模块的编译产物。
 *
 * 两个文件并存期间，本文件才是修改目标：tools/repack.mjs 打包时优先采用 .ts 模块的编译产物。
 */
import * as ObjectCrashingEventModule from "game/event/ObjectCrashingEvent"; // 未转换（any-shim）
import * as LocomotorTypeModule from "game/type/LocomotorType"; // 未转换（any-shim）
import * as NotifyTickModule from "game/gameobject/trait/interface/NotifyTick"; // 已转换
import * as JumpjetLocomotorModule from "game/gameobject/locomotor/JumpjetLocomotor"; // 未转换（any-shim）
import * as WingedLocomotorModule from "game/gameobject/locomotor/WingedLocomotor"; // 未转换（any-shim）
import * as NotifyCrashModule from "game/gameobject/trait/interface/NotifyCrash"; // 未转换（any-shim）

/* eslint-disable @typescript-eslint/no-explicit-any */
export class CrashableTrait {
  gameObject: any;
  crashingEvtSent: any;
  crashState: any;
  attackerInfo: any;

  constructor(gameObject: any) {
    this.gameObject = gameObject;
    this.crashingEvtSent = false;
    this.crashState = {};
  }
  [NotifyTickModule.NotifyTick.onTick](obj: any, world: any) {
    if (!obj.isCrashing) return;
    if (!this.crashingEvtSent) {
      this.crashingEvtSent = true;
      obj.traits.filter(NotifyCrashModule.NotifyCrash).forEach((trait: any) =>
        trait[NotifyCrashModule.NotifyCrash.onCrash](obj, world),
      );
      world.events.dispatch(new ObjectCrashingEventModule.ObjectCrashingEvent(obj));
    }
    const locomotor = obj.rules.locomotor;
    if (
      locomotor !== LocomotorTypeModule.LocomotorType.Jumpjet &&
      locomotor !== LocomotorTypeModule.LocomotorType.Aircraft
    ) {
      throw new Error("Crashing logic not implemented for locomotor " + LocomotorTypeModule.LocomotorType[locomotor]);
    }
    let delta;
    if (locomotor === LocomotorTypeModule.LocomotorType.Jumpjet) {
      delta = JumpjetLocomotorModule.JumpjetLocomotor.tickCrash(obj, world, this.crashState);
    } else {
      if (locomotor !== LocomotorTypeModule.LocomotorType.Aircraft) {
        throw new Error(`Unhandled locomotor type "${locomotor}"`);
      }
      if (!obj.isAircraft()) throw new Error(`Obj "${obj.name}#${obj.id} is not an aircraft`);
      delta = WingedLocomotorModule.WingedLocomotor.tickCrash(obj, world, this.crashState);
    }
    let landed = false;
    const nextWorldPos = delta.clone().add(obj.position.worldPosition);
    if (world.map.isWithinHardBounds(nextWorldPos)) {
      const previousTile = obj.tile;
      const previousElevation = obj.tileElevation;
      obj.position.moveByLeptons3(delta);
      if (obj.tile !== previousTile) obj.moveTrait.handleTileChange(previousTile, void 0, false, world);
      const bridge = obj.tile.onBridgeLandType ? world.map.tileOccupation.getBridgeOnTile(obj.tile) : void 0;
      const bridgeElevation = bridge?.tileElevation ?? 0;
      obj.position.tileElevation = Math.max(obj.position.tileElevation, bridgeElevation);
      if (obj.position.tileElevation === bridgeElevation) {
        obj.zone = world.map.getTileZone(obj.tile);
        obj.onBridge = !!bridge;
        landed = true;
      }
      if (obj.tileElevation !== previousElevation) obj.moveTrait.handleElevationChange(previousElevation, world);
    } else {
      landed = true;
    }
    if (landed) world.destroyObject(obj, this.attackerInfo);
  }
  crash(attackerInfo: any) {
    this.attackerInfo = attackerInfo;
    this.gameObject.isCrashing = true;
    this.gameObject.cachedTraits.tick.length = 0;
    this.gameObject.cachedTraits.tick = [this];
  }
  dispose() {
    this.gameObject = void 0;
  }
}
