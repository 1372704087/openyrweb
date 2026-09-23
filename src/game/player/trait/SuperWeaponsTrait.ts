/**
 * SuperWeaponsTrait — 玩家超武名称集合（挂在 Player 上）。
 *
 * 以超武 INI 名（name）为键维护 Map，提供 getAll/add/has/get/remove。
 * 与 game/trait/SuperWeaponsTrait（世界级效果调度）配套：PlayerFactory
 * 创建战斗玩家时实例化本 trait 并 add 到 player.traits。
 *
 * 由 game/player/trait/SuperWeaponsTrait.ts.js 重写为 TS（行为完全一致）。
 * 两个文件并存期间，本文件才是修改目标：tools/repack.mjs 打包时优先
 * 采用 .ts 模块的编译产物。
 */

/* eslint-disable @typescript-eslint/no-explicit-any */

export class SuperWeaponsTrait {
  /** 超武 INI 名 → 超武实例。 */
  superWeapons: Map<string, any>;

  constructor() {
    this.superWeapons = new Map();
  }

  /** 取全部超武实例（按 Map 插入序）。 */
  getAll(): any[] {
    return [...this.superWeapons.values()];
  }

  /** 登记一座超武（按 e.name 覆盖同名）。 */
  add(sw: any): void {
    this.superWeapons.set(sw.name, sw);
  }

  /** 是否已登记该名超武。 */
  has(name: string): boolean {
    return this.superWeapons.has(name);
  }

  /** 按名取超武，不存在返回 undefined。 */
  get(name: string): any {
    return this.superWeapons.get(name);
  }

  /** 按名移除超武。 */
  remove(name: string): void {
    this.superWeapons.delete(name);
  }
}
