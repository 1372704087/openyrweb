/**
 * EvacuateTransportTask — 运输载具/驻军建筑卸载乘员。
 *
 * 状态：None / OnlyPassengers / All（forceEvac 强制全部）。
 *  - onStart：有乘员时按 gunner 规则决定卸乘客还是连炮手一起；
 *  - onTick：空中等待落地；取最后一名乘员，找身后疏散格；
 *    载具先 TurnTask 对准出口方向（建筑不转）；
 *  - evacuateUnit：有落点 → unlimbo + Move/Scatter + WaitTicks + LeaveTransportEvent；
 *    无落点且非 soft → 强制在原地 destroy。
 *  - InfantryAbsorb（生物反应堆）同步清理 garrisonedAt 并广播 BuildingEvacuateEvent。
 *
 * 由 game/gameobject/task/EvacuateTransportTask.ts.js 重写为 TS（行为完全
 * 一致）。两个文件并存期间，本文件才是修改目标。
 */
import * as LeaveTransportEventModule from "game/event/LeaveTransportEvent"; // 未转换（any-shim）
import * as FacingUtilModule from "game/gameobject/unit/FacingUtil"; // 未转换（any-shim）
import * as MovePositionHelperModule from "game/gameobject/unit/MovePositionHelper"; // 未转换（any-shim）
import * as MoveTaskModule from "game/gameobject/task/move/MoveTask"; // 已转换
import * as ScatterTaskModule from "game/gameobject/task/ScatterTask"; // 已转换
import { Task } from "game/gameobject/task/system/Task"; // 已转换
import * as TurnTaskModule from "game/gameobject/task/TurnTask"; // 已转换
import * as WaitMinutesTaskModule from "game/gameobject/task/system/WaitMinutesTask"; // 已转换
import { ZoneType } from "game/gameobject/unit/ZoneType"; // 已转换
import * as CallbackTaskModule from "game/gameobject/task/system/CallbackTask"; // 已转换
import * as WaitTicksTaskModule from "game/gameobject/task/system/WaitTicksTask"; // 已转换
import { GameSpeed } from "game/GameSpeed"; // 已转换
import * as BuildingEvacuateEventModule from "game/event/BuildingEvacuateEvent"; // 未转换（any-shim）

/** 疏散状态。 */
export const EvacState = {
  None: 0,
  OnlyPassengers: 1,
  All: 2,
} as const;

const EVAC_WAIT_TICKS = 2 * GameSpeed.BASE_TICKS_PER_SECOND;

/* eslint-disable @typescript-eslint/no-explicit-any */
export class EvacuateTransportTask extends Task {
  game: any;
  soft: any;
  evacState: number;
  evacTries: number;
  turnPerformed: boolean;

  constructor(game: any, soft: any) {
    super();
    this.game = game;
    this.soft = soft;
    this.evacState = EvacState.None;
    this.evacTries = 0;
    this.turnPerformed = false;
    this.preventLanding = false;
  }

  forceEvac(): void {
    this.evacState = EvacState.All;
  }

  onStart(object: any): void {
    if (!object.transportTrait) {
      throw new Error(`Object "${object.name}" is not a valid transport`);
    }
    const transport = object.transportTrait;
    if (transport.units.length > 0) {
      this.evacState =
        (this.evacState !== EvacState.OnlyPassengers && transport.units.length !== 1) ||
        !object.rules.gunner
          ? EvacState.OnlyPassengers
          : EvacState.All;
    }
  }

  onTick(object: any): boolean {
    if (this.isCancelling() || this.evacState === EvacState.None) return true;
    if (object.zone === ZoneType.Air) {
      this.children.push(new CallbackTaskModule.CallbackTask(() => object.zone !== ZoneType.Air));
      return false;
    }
    const units = object.transportTrait.units;
    if (!units.length || (object.rules.gunner && units.length === 1 && this.evacState !== EvacState.All)) {
      return true;
    }
    const unit = units[units.length - 1];
    const evacTarget = this.findValidEvacTarget(object, unit);
    // 建筑（生物反应堆）静止，不下发 TurnTask。
    if (evacTarget && !this.turnPerformed && object.moveTrait) {
      this.turnPerformed = true;
      const facing = (evacTarget.dir + 180) % 360;
      if (object.direction !== facing) {
        this.children.push(new TurnTaskModule.TurnTask(facing));
        return false;
      }
    }
    if (this.evacuateUnit(unit, object, evacTarget)) {
      units.pop();
      this.children.push(new WaitMinutesTaskModule.WaitMinutesTask(1 / 60));
      return false;
    }
    this.evacTries++;
    if (this.evacTries > 3) return true;
    this.children.push(new WaitMinutesTaskModule.WaitMinutesTask(0.05));
    return false;
  }

  evacuateUnit(unit: any, transport: any, evacTarget: any): boolean {
    const isAbsorb = !!transport.rules?.infantryAbsorb;
    if (!evacTarget) {
      if (this.soft) return false;
      unit.position.tile = transport.tile;
      unit.position.tileElevation = transport.tileElevation;
      unit.onBridge = transport.onBridge;
      unit.zone = transport.zone;
      unit.transport = undefined;
      if (isAbsorb) unit.garrisonedAt = undefined;
      this.game.destroyObject(unit, { player: unit.owner });
      return true;
    }
    const { spawnNode, moveNode } = evacTarget;
    unit.position.tileElevation = spawnNode.onBridge?.tileElevation ?? 0;
    unit.onBridge = !!spawnNode.onBridge;
    unit.zone = this.game.map.getTileZone(spawnNode.tile, !spawnNode.onBridge);
    unit.transport = undefined;
    if (isAbsorb) {
      unit.garrisonedAt = undefined;
      // 孪生只传 target；player 缺省为 undefined（与 .ts.js 运行时一致）
      this.game.events.dispatch(new BuildingEvacuateEventModule.BuildingEvacuateEvent(transport, undefined));
    }
    this.game.unlimboObject(unit, spawnNode.tile);
    unit.unitOrderTrait.unmarkNextQueuedOrder();
    if (moveNode) {
      unit.unitOrderTrait.addTask(
        new MoveTaskModule.MoveTask(this.game, moveNode.tile, !!moveNode.onBridge),
      );
    } else {
      unit.unitOrderTrait.addTask(new ScatterTaskModule.ScatterTask(this.game));
    }
    unit.unitOrderTrait.addTask(new WaitTicksTaskModule.WaitTicksTask(EVAC_WAIT_TICKS));
    this.game.events.dispatch(new LeaveTransportEventModule.LeaveTransportEvent(transport));
    return true;
  }

  findValidEvacTarget(transport: any, unit: any): any {
    const map = this.game.map;
    const helper = new MovePositionHelperModule.MovePositionHelper(map);
    const startBridge = transport.onBridge
      ? map.tileOccupation.getBridgeOnTile(transport.tile)
      : undefined;
    const backDir = (transport.direction + 180) % 360;
    let fallback: any;
    for (let offset = 0; offset <= 180; offset += 45) {
      const dirs = offset && offset < 180 ? [backDir + offset, backDir - offset] : [backDir + offset];
      for (const dir of dirs) {
        const mapDir = FacingUtilModule.FacingUtil.toMapCoords(dir);
        let tile = transport.tile;
        let bridge = startBridge;
        let nearNode: any;
        for (let dist = 1; dist <= 2; dist++) {
          if (dist === 2) {
            if (!nearNode) break;
            tile = nearNode.tile;
            bridge = nearNode.onBridge;
          }
          const rx = transport.tile.rx + Math.sign(mapDir.x) * dist;
          const ry = transport.tile.ry + Math.sign(mapDir.y) * dist;
          const candidate = map.tiles.getByMapCoords(rx, ry);
          if (!candidate || !map.mapBounds.isWithinBounds(candidate)) break;
          const bridges = [map.tileOccupation.getBridgeOnTile(candidate)];
          if (bridges[0]) bridges.push(undefined);
          for (const candBridge of bridges) {
            if (
              map.terrain.getPassableSpeed(
                candidate,
                unit.rules.speedType,
                unit.isInfantry(),
                !!candBridge,
              ) > 0 &&
              helper.isEligibleTile(candidate, candBridge, bridge, tile) &&
              !map.terrain.findObstacles({ tile: candidate, onBridge: candBridge }, unit).length
            ) {
              if (dist !== 1) {
                return { spawnNode: nearNode, moveNode: { tile: candidate, onBridge: candBridge }, dir };
              }
              nearNode = { tile: candidate, onBridge: candBridge };
              fallback = { spawnNode: nearNode, moveNode: undefined, dir };
            }
          }
        }
      }
    }
    return fallback;
  }
}
