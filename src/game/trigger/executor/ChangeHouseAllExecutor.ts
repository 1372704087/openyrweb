/**
 * ChangeHouseAllExecutor — 把源阵营全部单位转移给目标阵营。
 *
 * 目标 id 支持两种编码：
 *  - [4475, 4475+startingLocations.length) → 按 startLocation 下标找目标玩家
 *  - 否则按 country.id
 * 目标已败北时：若开启资产再分配则改给源阵营第一个盟友，否则放弃转移。
 *
 * 由 game/trigger/executor/ChangeHouseAllExecutor.ts.js 重写为 TS。
 *
 * 两个文件并存期间，本文件才是修改目标：tools/repack.mjs 打包时优先采用 .ts 模块的编译产物。
 */
import { TriggerExecutor } from "game/trigger/TriggerExecutor"; // 本组已写

/* eslint-disable @typescript-eslint/no-explicit-any */
export class ChangeHouseAllExecutor extends TriggerExecutor {
  /** 出生点编码起点（RA2/YR Action=AllChangeHouse 的 house 参数偏移）。 */
  static locationHouseIdBegin = 4475;

  execute(game: any): void {
    const source = game.getAllPlayers().find((p) => p.country?.name === this.trigger.houseName);
    if (!source) return;
    const raw = Number(this.action.params[1]);
    let target: any;
    if (
      raw >= ChangeHouseAllExecutor.locationHouseIdBegin &&
      raw < ChangeHouseAllExecutor.locationHouseIdBegin + game.map.startingLocations.length
    ) {
      const loc = raw - ChangeHouseAllExecutor.locationHouseIdBegin;
      target = game.getAllPlayers().find((p) => p.startLocation === loc);
    } else {
      target = game.getAllPlayers().find((p) => p.country?.id === raw);
    }
    // 目标已败北 → 资产再分配或放弃
    if (target?.defeated) {
      target = game.isAssetRedistributionEnabled() ? game.alliances.getAllies(source)[0] : undefined;
    }
    if (!target) return;
    for (const obj of source.getOwnedObjects(true)) {
      game.changeObjectOwner(obj, target);
    }
  }
}
