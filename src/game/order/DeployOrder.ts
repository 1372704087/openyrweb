/**
 * DeployOrder — 部署指令（D 键 / 部署选中）。
 *
 * targeted=true 时 orderType=DeploySelected，要求目标即自身；false 时
 * Deploy 且目标可选。覆盖步兵 deployer、载具 deployer/deploysInto/
 * transportTrait 卸员、建筑 primary factory、驻军撤离、坦克碉堡驶出。
 *
 * onAdd：建筑 factory 直接 setPrimaryFactory 并返回 false；运输载具
 * 若已有 EvacuateTransportTask 则 forceEvac 复用。
 *
 * 由 game/order/DeployOrder.ts.js 重写为 TS（行为完全一致）。
 * 两个文件并存期间，本文件才是修改目标：tools/repack.mjs 打包时优先
 * 采用 .ts 模块的编译产物。
 */
import * as OrderModule from "game/order/Order"; // 已转换
import { OrderType } from "game/order/OrderType"; // 已转换
import * as PointerTypeModule from "engine/type/PointerType"; // 未转换（any-shim）
import { DeployIntoTask } from "game/gameobject/task/morph/DeployIntoTask"; // 已转换
import { StanceType } from "game/gameobject/infantry/StanceType"; // 已转换
import { CallbackTask } from "game/gameobject/task/system/CallbackTask"; // 已转换
import * as UnitDeployUndeployEventModule from "game/event/UnitDeployUndeployEvent"; // 未转换（any-shim）
import * as PrimaryFactoryChangeEventModule from "game/event/PrimaryFactoryChangeEvent"; // 未转换（any-shim）
import { EvacuateTransportTask } from "game/gameobject/task/EvacuateTransportTask"; // 已转换
import { MoveTask } from "game/gameobject/task/move/MoveTask"; // 已转换
import { SpeedType } from "game/type/SpeedType"; // 已转换
import { Vector2 } from "game/math/Vector2"; // 已转换

/* eslint-disable @typescript-eslint/no-explicit-any */
export class DeployOrder extends OrderModule.Order {
  // 字段一律不带初始化器：孪生构造函数按固定顺序赋值。
  game: any;
  targeted: any;
  getPointerType: any;

  constructor(game: any, targeted: any) {
    super(targeted ? OrderType.Deploy : OrderType.DeploySelected);
    this.game = game;
    this.targeted = targeted;
    this.minimapAllowed = false;
    this.getPointerType = () => (this.isAllowed() ? PointerTypeModule.PointerType.Deploy : PointerTypeModule.PointerType.NoDeploy);
    this.targetOptional = !targeted;
    this.singleSelectionRequired = targeted;
  }

  isValid(): boolean {
    if (this.targeted && (!this.target.obj || this.target.obj !== this.sourceObject)) return false;
    const unit = this.sourceObject;
    return !!(
      (unit.isInfantry() && unit.deployerTrait && ![StanceType.Cheer].includes(unit.stance)) ||
      (unit.isVehicle() && unit.deployerTrait) ||
      (unit.isVehicle() && unit.rules.deploysInto) ||
      (unit.isVehicle() && unit.transportTrait) ||
      (unit.isBuilding() && unit.rules.factory && !unit.owner.production?.isPrimaryFactory(unit)) ||
      (unit.isBuilding() && unit.garrisonTrait?.units.length) ||
      // bunkered vehicle can deploy to exit (select tank + press D).
      (unit.isUnit() && unit.bunkeredAt?.tankBunkerTrait?.bunkeredVehicle === unit)
    );
  }

  isAllowed(): boolean {
    const unit = this.sourceObject;
    if (unit.isVehicle() && unit.transportTrait)
      return !!(
        unit.transportTrait.units.length &&
        0 < this.game.map.terrain.getPassableSpeed(unit.tile, SpeedType.Foot, false, unit.onBridge)
      );
    if ((unit.isInfantry() || unit.isVehicle()) && unit.deployerTrait) return true;
    if (unit.isVehicle() && unit.rules.deploysInto) {
      if (unit.parasiteableTrait?.isInfested() && !unit.parasiteableTrait.beingBoarded) return false;
      const worker = this.game.getConstructionWorker(unit.owner);
      if (unit.moveTrait.currentWaypoint?.onBridge) return false;
      const placeTile = unit.moveTrait.currentWaypoint?.tile ?? unit.tile;
      return worker.canPlaceAt(unit.rules.deploysInto, placeTile, {
        ignoreObjects: [unit],
        ignoreAdjacent: true,
      });
    }
    if (unit.isBuilding() && unit.rules.factory) return true;
    if (unit.isBuilding() && unit.garrisonTrait?.units.length) return true;
    // bunkered vehicle can deploy to exit (select tank + press D).
    if (unit.isUnit() && unit.bunkeredAt?.tankBunkerTrait?.bunkeredVehicle === unit) return true;
    throw new Error("Shouldn't reach this point. Missed a case.");
  }

  process(): any {
    const unit = this.sourceObject;
    return unit.isVehicle() && unit.transportTrait
      ? [new EvacuateTransportTask(this.game, true)]
      : unit.isBuilding() && unit.rules.factory
        ? void 0
        : unit.isVehicle() && unit.rules.deploysInto
          ? [new DeployIntoTask(this.game)]
          : (unit.isInfantry() || unit.isVehicle()) && unit.deployerTrait
            ? [
                new CallbackTask(() => {
                  unit.deployerTrait.toggleDeployed();
                  this.game.events.dispatch(
                    new UnitDeployUndeployEventModule.UnitDeployUndeployEvent(
                      unit,
                      unit.deployerTrait.isDeployed() ? "undeploy" : "deploy",
                    ),
                  );
                }),
              ]
            : unit.isBuilding() && unit.garrisonTrait?.units.length
              ? [
                  new CallbackTask(() => {
                    unit.garrisonTrait.evacuate(this.game, true);
                  }),
                ]
              : unit.isUnit() && unit.bunkeredAt
                ? [
                    new CallbackTask(() => {
                      // Tank Bunker evacuation — eject the bunkered vehicle.
                      // source can be the bunker building or the bunkered tank itself.
                      const bunker = unit.isBuilding() ? unit : unit.bunkeredAt;
                      const v = bunker?.tankBunkerTrait?.bunkeredVehicle;
                      if (v && bunker) {
                        v.bunkeredAt = void 0;
                        bunker.tankBunkerTrait.bunkeredVehicle = void 0;
                        if (v.moveTrait) v.moveTrait.setDisabled(false);
                        // Cancel any active tasks (AttackTask, etc.) so exit MoveTasks run immediately
                        if (v.unitOrderTrait) {
                          v.unitOrderTrait.clearOrders();
                          v.unitOrderTrait.cancelAllTasks();
                        }
                        // Step 1: drive forward (South / +ry) out of the building
                        const s1Rx = bunker.tile.rx;
                        const s1Ry = bunker.tile.ry + (bunker.getFoundation() ? bunker.getFoundation().height : 1);
                        const s1Tile = this.game.map.tiles.getByMapCoords(s1Rx, s1Ry);
                        if (s1Tile) {
                          v.unitOrderTrait?.addTask(
                            new MoveTask(this.game, s1Tile, false, {
                              closeEnoughTiles: 0,
                              ignoredBlockers: [bunker],
                              targetOffset: new Vector2(128, 0),
                            }),
                          );
                        }
                        // Step 2: drive West (-rx, 180° - 90°) away from the bunker
                        const s2Rx = s1Rx - 2;
                        const s2Tile = this.game.map.tiles.getByMapCoords(s2Rx, s1Ry);
                        if (s2Tile) {
                          v.unitOrderTrait?.addTask(
                            new MoveTask(this.game, s2Tile, false, {
                              closeEnoughTiles: 0,
                            }),
                          );
                        }
                      }
                    }),
                  ]
                : void 0;
  }

  onAdd(tasks: any, skip: any): boolean {
    const unit = this.sourceObject;
    if (unit.isBuilding() && unit.rules.factory)
      return (
        unit.owner.production.setPrimaryFactory(unit),
        this.game.events.dispatch(new PrimaryFactoryChangeEventModule.PrimaryFactoryChangeEvent(unit)),
        false
      );
    if (unit.isVehicle() && unit.transportTrait && !skip && this.isValid() && this.isAllowed()) {
      const existing = tasks.find(
        (task: any) => task.constructor === EvacuateTransportTask && !task.isCancelling(),
      );
      if (existing) return (existing.forceEvac(), false);
    }
    return true;
  }
}
