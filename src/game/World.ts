/**
 * World — 全局对象容器（按 id 索引全部 GameObject）。
 *
 * 职责很薄：持有 allObjects: Map<id, obj>，在 spawn/remove 时校验幂等性
 * 并派发 onObjectSpawned / onObjectRemoved 事件；查询走 getObjectById /
 * getAllObjects。对象的 tile 占用、更新列表等仍在 Game / GameMap 侧。
 *
 * 由 game/World.ts.js 重写为 TS（行为完全一致）。两个文件并存期间，
 * 本文件才是修改目标：tools/repack.mjs 打包时优先采用 .ts 模块的编译产物。
 */
import { EventDispatcher } from "util/event"; // 已转换

/* eslint-disable @typescript-eslint/no-explicit-any */
export class World {
  /** 全部存活对象：id → 对象。 */
  allObjects = new Map<any, any>();
  /** 对象生成事件分发器。 */
  private _onObjectSpawned = new EventDispatcher();
  /** 对象移除事件分发器。 */
  private _onObjectRemoved = new EventDispatcher();

  /** 对象生成事件（只读暴露）。 */
  get onObjectSpawned() {
    return this._onObjectSpawned.asEvent();
  }

  /** 对象移除事件（只读暴露）。 */
  get onObjectRemoved() {
    return this._onObjectRemoved.asEvent();
  }

  /** 将对象登记进全局表；id 已存在则抛错。 */
  spawnObject(obj: any): void {
    if (this.allObjects.has(obj.id)) throw new Error("Trying to add an already existing object");
    this.allObjects.set(obj.id, obj);
    this._onObjectSpawned.dispatch(this, obj);
  }

  /** 从全局表移除对象；id 不存在则抛错。 */
  removeObject(obj: any): void {
    if (!this.allObjects.has(obj.id)) throw new Error("Trying to remove non-existent object");
    this.allObjects.delete(obj.id);
    this._onObjectRemoved.dispatch(this, obj);
  }

  /** 该 id 是否已登记。 */
  hasObjectId(id: any): boolean {
    return this.allObjects.has(id);
  }

  /** 按 id 取对象；不存在则抛错。 */
  getObjectById(id: any): any {
    if (!this.allObjects.has(id)) throw new Error(`Object with id ${id} doesn't exist`);
    return this.allObjects.get(id);
  }

  /** 当前全部对象的浅拷贝数组。 */
  getAllObjects(): any[] {
    return [...this.allObjects.values()];
  }
}
