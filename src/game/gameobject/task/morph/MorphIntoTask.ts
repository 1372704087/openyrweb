/**
 * MorphIntoTask — 变形任务的基类（部署/解除部署、建筑↔载具切换）。
 *
 * morphInto 由子类在 onStart 前写入（DeployIntoTask / UndeployIntoTask
 * 分别从 rules.deploysInto / rules.undeploysInto 解析）。本类驱动
 * 完整变形流程：
 *
 * onStart：
 *  - 建筑且未在 BuildDown 且目标不是建筑 → 先挂 PackBuildingTask；
 *  - 载具且目标是建筑 → 先挂 TurnTask(180)（车头朝北再展开）。
 *
 * onTick：
 *  - 建筑形态：寄生中的载具且未被登车 → 不变形；施工员无法在原 tile
 *    放置目标建筑 → 完成但不放置；否则标记矿场奴隶 morph、派发
 *    deploy 音效、unspawn+dispose 后 placeAt 新建筑并继承血量；
 *  - 非建筑形态：先过滤并暂存当前单位的 MoveTask；标记矿场奴隶
 *    morph、派发 undeploy 音效、unspawn+dispose 后 createUnitForPlayer
 *    （方向 180、继承血量），按 art.foundationCenter 偏移 spawn，并把
 *    暂存的移动任务挂回新单位；
 *  - 收尾：继承 purchaseValue，写 replacedBy，恢复选中/编组，
 *    派发 ObjectMorphEvent，返回 true。
 *
 * 由 game/gameobject/task/morph/MorphIntoTask.ts.js 重写为 TS（行为
 * 完全一致）。两个文件并存期间，本文件才是修改目标。
 */
import { Task } from "game/gameobject/task/system/Task"; // 已转换
import { ObjectType } from "engine/type/ObjectType"; // 已转换
import { BuildStatus } from "game/gameobject/Building"; // 已转换
import { MoveTask } from "game/gameobject/task/move/MoveTask"; // 已转换
import { TurnTask } from "game/gameobject/task/TurnTask"; // 已转换
import { PackBuildingTask } from "game/gameobject/task/morph/PackBuildingTask"; // 已转换
import * as ObjectMorphEventModule from "game/event/ObjectMorphEvent"; // 未转换（any-shim）
import * as UnitDeployUndeployEventModule from "game/event/UnitDeployUndeployEvent"; // 未转换（any-shim）

/* eslint-disable @typescript-eslint/no-explicit-any */
export class MorphIntoTask extends Task {
  // 字段一律不带初始化器：孪生构造函数按固定顺序赋值。
  game: any;
  /** 变形目标类型（ObjectRules），由子类在 onStart 前写入。 */
  morphInto: any;

  constructor(game: any) {
    super();
    this.game = game;
  }

  /** 启动：按源/目标形态决定是否先打包建筑或掉头。 */
  onStart(object: any): void {
    if (!this.morphInto) throw new Error("morphInto not set");
    if (
      object.isBuilding() &&
      object.buildStatus !== BuildStatus.BuildDown &&
      this.morphInto.type !== ObjectType.Building
    ) {
      this.children.push(new PackBuildingTask(this.game));
    }
    if (object.isVehicle() && this.morphInto.type === ObjectType.Building) {
      this.children.push(new TurnTask(180));
    }
  }

  /** 每 tick：执行一次变形（unspawn → 重建/放置 → 恢复选中与事件），恒返回 true。 */
  onTick(object: any): boolean {
    if (!this.morphInto) throw new Error("morphInto not set");
    const selection = this.game.getUnitSelection();
    const wasSelected = selection.isSelected(object);
    const controlGroup = selection.getOrCreateSelectionModel(object).getControlGroupNumber();
    const morphInto = this.morphInto;
    let morphed: any;
    if (morphInto.type === ObjectType.Building) {
      if (object.isVehicle() && object.parasiteableTrait?.isInfested() && !object.parasiteableTrait.beingBoarded)
        return true;
      const tile = object.tile;
      const constructionWorker = this.game.getConstructionWorker(object.owner);
      if (!constructionWorker.canPlaceAt(this.morphInto.name, tile, { ignoreAdjacent: true, ignoreObjects: [object] }))
        return true;
      // mark slave-miner morph so its SlaveMinerTrait.NotifyUnspawn silently
      // recalls slaves instead of liberating them to the civilian player on a mere
      // deploy/undeploy (the building is being re-spawned as another form, not sold).
      // VEHICLE→BUILDING (deploy): the vehicle holds slaves inside (SlaveMinerVehicleTrait);
      // set its _morphInFlight so it stashes the slave pool on game._pendingMinerSlaves
      // for the new building's SlaveMinerTrait.NotifySpawn to re-enter onto the map.
      if (object.slaveMinerTrait) object.slaveMinerTrait._morphInFlight = true;
      if (object.slaveMinerVehicleTrait) object.slaveMinerVehicleTrait._stashSlavesForMorph(this.game);
      // Dispatch deploy/undeploy sound BEFORE unspawn (vehicle still alive, can play sound).
      this.game.events.dispatch(new UnitDeployUndeployEventModule.UnitDeployUndeployEvent(object, "deploy"));
      this.game.unspawnObject(object);
      object.dispose();
      [morphed] = constructionWorker.placeAt(this.morphInto.name, tile);
      morphed.healthTrait.health = object.healthTrait.health;
    } else {
      const pendingMoveTasks = object.unitOrderTrait.getTasks().filter((task: any) => task instanceof MoveTask);
      if (object.slaveMinerTrait) object.slaveMinerTrait._morphInFlight = true;
      // Dispatch deploy/undeploy sound BEFORE unspawn (unit still alive, can play sound).
      this.game.events.dispatch(new UnitDeployUndeployEventModule.UnitDeployUndeployEvent(object, "undeploy"));
      this.game.unspawnObject(object);
      object.dispose();
      morphed = this.game.createUnitForPlayer(this.morphInto, object.owner);
      morphed.direction = 180;
      morphed.healthTrait.health = object.healthTrait.health;
      const foundationCenter = object.art.foundationCenter;
      this.game.spawnObject(
        morphed,
        this.game.map.tiles.getByMapCoords(object.tile.rx + foundationCenter.x, object.tile.ry + foundationCenter.y),
      );
      pendingMoveTasks.forEach((task: any) => morphed.unitOrderTrait.addTask(task));
    }
    morphed.purchaseValue = object.purchaseValue;
    object.replacedBy = morphed;
    if (wasSelected) selection.addToSelection(morphed);
    if (undefined !== controlGroup) selection.addUnitsToGroup(controlGroup, [morphed], false);
    this.game.events.dispatch(new ObjectMorphEventModule.ObjectMorphEvent(object, morphed));
    return true;
  }
}
