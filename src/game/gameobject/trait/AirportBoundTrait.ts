/**
 * AirportBoundTrait — 机场绑定（记录可用机场名列表，供返航逻辑查找 Dock 机场）。
 *
 * 由 game/gameobject/trait/AirportBoundTrait.ts.js 重写为 TS（行为完全一致）。
 * 本文件为修改目标：tools/repack.mjs 打包时优先采用 .ts 模块的编译产物。
 */

/* eslint-disable @typescript-eslint/no-explicit-any */
export class AirportBoundTrait {
  airportNames: any;

  constructor(airportNames: any) {
    this.airportNames = airportNames;
  }
  findAvailableAirport(obj: any) {
    return [...obj.owner.buildings].find(
      (building: any) =>
        building.dockTrait &&
        this.airportNames.includes(building.name) &&
        0 < building.dockTrait.getAvailableDockCount(),
    );
  }
}
