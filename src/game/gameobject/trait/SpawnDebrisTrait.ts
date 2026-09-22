/**
 * SpawnDebrisTrait — 死亡/坠机产生碎屑 trait。
 *
 * 建筑/车辆/Overlay 被摧毁或坠毁时，按 minDebris~maxDebris 随机数量
 * 产生 Debris 对象（从 debrisTypes/debrisAnims/metallicDebris 中随机选
 * VoxelAnim/Animation），放置在死亡位置（含 tileElevation）。
 *  - temporal 弹头摧毁、坠毁中、Sink 死亡、非 Spawned 对象跳过；
 *  - Overlay 用 bridgeVoxelMax 作上限、数量下限 0、类型列表为空；
 *  - 出生前检查 isWithinHardBounds，越界不生成。
 *
 * 由 game/gameobject/trait/SpawnDebrisTrait.ts.js 重写为 TS（行为完全一致）。
 * 两个文件并存期间，本文件才是修改目标：tools/repack.mjs 打包时优先
 * 采用 .ts 模块的编译产物。
 */
import { ObjectType } from "engine/type/ObjectType"; // 孪生
import { DeathType } from "game/gameobject/common/DeathType"; // 孪生
import * as NotifyCrashModule from "game/gameobject/trait/interface/NotifyCrash"; // 已转换
import * as NotifyDestroyModule from "game/gameobject/trait/interface/NotifyDestroy"; // 本组新写

export class SpawnDebrisTrait {
  /** 坠机时同样产生碎屑（复用 handleDestroy）。 */
  [NotifyCrashModule.NotifyCrash.onCrash](object: any, world: any): void {
    this.handleDestroy(object, world);
  }

  /**
   * 摧毁时产生碎屑。跳过：temporal 弹头、坠毁中、Sink 死亡、非 Spawned
   * 对象（与孪生锁步一致）。
   */
  [NotifyDestroyModule.NotifyDestroy.onDestroy](
    object: any,
    attacker: any,
    world: any,
  ): void {
    if (attacker?.weapon?.warhead.rules.temporal) return;
    if (object.isCrashing) return;
    if (object.deathType !== DeathType.Sink && object.isSpawned) {
      this.handleDestroy(object, world);
    }
  }

  /** 按类型选 min/max 数量范围随机，>0 则 spawnDebris。 */
  handleDestroy(object: any, world: any): void {
    if (!(object.isVehicle() || object.isBuilding() || object.isOverlay())) return;
    const min = object.isOverlay() ? 0 : object.rules.minDebris;
    const max = object.isOverlay()
      ? world.rules.general.bridgeVoxelMax
      : object.rules.maxDebris;
    const count = world.generateRandomInt(min, max);
    if (0 < count) this.spawnDebris(object, world, count);
  }

  /** 在死亡位置生成 count 个 Debris 对象并 spawn 到地图。 */
  spawnDebris(object: any, world: any, count: number): void {
    const pos = object.position.getMapPosition();
    if (!world.map.isWithinHardBounds(pos)) return;
    let types: any[] = object.isOverlay()
      ? []
      : object.isVehicle()
        ? object.rules.debrisTypes
        : object.rules.debrisAnims;
    if (!types.length) types = world.rules.audioVisual.metallicDebris;
    types = types.filter(
      (t) =>
        world.rules.hasObject(t, ObjectType.VoxelAnim) ||
        world.art.hasObject(t, ObjectType.Animation),
    );
    new Array(count)
      .fill(0)
      .map(() => types[world.generateRandomInt(0, types.length - 1)])
      .map((t) => world.createObject(ObjectType.Debris, t))
      .forEach((debris) => {
        debris.position.moveToLeptons(pos);
        debris.position.tileElevation = object.position.tileElevation;
        world.spawnObject(debris, debris.position.tile);
      });
  }
}
