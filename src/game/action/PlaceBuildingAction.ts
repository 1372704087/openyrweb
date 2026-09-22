/**
 * PlaceBuildingAction — 放置建筑的动作。
 *
 * unserialize 读 buildingRules（内部 id → TechnoRules）与 tile 坐标；
 * process 校验格子存在后尝试放置：成功则通知 NotifyPlaceBuilding 并派发
 * BuildingPlaceEvent，失败派发 BuildingFailedPlaceEvent。
 *
 * tryPlaceBuilding：生产队列 Ready 且首条目匹配、建材可用、建筑工人
 * canPlaceAt 通过时 placeAt 落成，扣队列并把主工厂标为 Delivering。
 *
 * 由 game/action/PlaceBuildingAction.ts.js 重写为 TS（行为完全一致）。
 * 两个文件并存期间，本文件才是修改目标：tools/repack.mjs 打包时优先
 * 采用 .ts 模块的编译产物。
 */
import * as DataStreamModule from "data/DataStream"; // 未转换（any-shim）
import { ObjectType } from "engine/type/ObjectType"; // 已转换
import { FactoryStatus } from "game/gameobject/trait/FactoryTrait"; // 已转换
import { QueueType, QueueStatus } from "game/player/production/ProductionQueue"; // 已转换
import { Action } from "game/action/Action"; // 已转换
import * as BuildingPlaceEventModule from "game/event/BuildingPlaceEvent"; // 未转换（any-shim）
import { FactoryType } from "game/rules/TechnoRules"; // 已转换
import { ActionType } from "game/action/ActionType"; // 已转换
import * as NotifyPlaceBuildingModule from "game/trait/interface/NotifyPlaceBuilding"; // 未转换（any-shim）
import * as BuildingFailedPlaceEventModule from "game/event/BuildingFailedPlaceEvent"; // 未转换（any-shim）

/* eslint-disable @typescript-eslint/no-explicit-any */
export class PlaceBuildingAction extends Action {
  // 字段一律不带初始化器：孪生构造函数按固定顺序赋值。
  game: any;
  player: any;
  buildingRules: any;
  tile: any;

  constructor(game: any) {
    super(ActionType.PlaceBuilding);
    this.game = game;
  }

  unserialize(data: any): void {
    const stream = new DataStreamModule.DataStream(data);
    this.buildingRules = this.game.rules.getTechnoByInternalId(
      stream.readUint32(),
      ObjectType.Building,
    );
    this.tile = { x: stream.readUint16(), y: stream.readUint16() };
  }

  serialize(): Uint8Array {
    const stream = new DataStreamModule.DataStream(8);
    stream.writeUint32(this.buildingRules.index);
    stream.writeUint16(this.tile.x);
    stream.writeUint16(this.tile.y);
    return stream.toUint8Array();
  }

  print(): string {
    return `Place building ${this.buildingRules.name} at tile (${this.tile.x}, ${this.tile.y})`;
  }

  process(): void {
    const mapTile = this.game.map.tiles.getByMapCoords(
      this.tile.x,
      this.tile.y,
    );
    if (!mapTile) {
      console.warn(`Tile ${this.tile.x},${this.tile.y} doesn't exist`);
      return;
    }
    const player = this.player;
    const placed = this.tryPlaceBuilding(player, mapTile);
    if (placed) {
      this.game.traits
        .filter(NotifyPlaceBuildingModule.NotifyPlaceBuilding)
        .forEach((trait: any) => {
          trait[NotifyPlaceBuildingModule.NotifyPlaceBuilding.onPlace](
            placed,
            this.game,
          );
        });
      this.game.events.dispatch(
        new BuildingPlaceEventModule.BuildingPlaceEvent(placed),
      );
    } else {
      this.game.events.dispatch(
        new BuildingFailedPlaceEventModule.BuildingFailedPlaceEvent(
          this.buildingRules.name,
          player,
          mapTile,
        ),
      );
    }
  }

  /** 生产就绪且建材/工人校验通过时落成建筑，返回新对象或 undefined。 */
  tryPlaceBuilding(player: any, mapTile: any): any {
    const rules = this.buildingRules;
    if (!player.production) return;
    const queue = player.production.getQueueForObject(rules);
    const first = queue?.getFirst();
    if (
      !queue ||
      queue.status !== QueueStatus.Ready ||
      !first ||
      first.rules !== rules
    )
      return;
    const worker = this.game.getConstructionWorker(player);
    if (!player.production.isAvailableForProduction(rules)) return;
    if (!worker.canPlaceAt(rules.name, mapTile, { normalizedTile: true }))
      return;

    const placed = worker.placeAt(rules.name, mapTile, true);
    player.addUnitsBuilt(rules, 1);
    queue.shift(rules, 1);
    const primaryFactory = player.production.getPrimaryFactory(
      FactoryType.BuildingType,
    );
    if (primaryFactory)
      primaryFactory.factoryTrait.status = FactoryStatus.Delivering;
    return placed[0];
  }
}
