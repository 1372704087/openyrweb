/**
 * ChangeHouseExecutor — 将目标对象改属到指定阵营。
 *
 * houseId = params[1]。若 houseId 落在 [4475, 4475+起始点数) 区间，
 * 视为"按起始点索引找玩家"；否则按 country.id 找。已失败的 house
 * 在开启资产再分配时改取其第一个盟友，否则放弃。对 targets 中每个
 * 存活 GameObject 调 world.changeObjectOwner。
 *
 * 由 game/trigger/executor/ChangeHouseExecutor.ts.js 重写为 TS
 * （行为完全一致）。两个文件并存期间，本文件才是修改目标：
 * tools/repack.mjs 打包时优先采用 .ts 模块的编译产物。
 */
import { GameObject } from "game/gameobject/GameObject"; // 已转换
import { TriggerExecutor } from "game/trigger/TriggerExecutor"; // 已转换

/* eslint-disable @typescript-eslint/no-explicit-any */
export class ChangeHouseExecutor extends TriggerExecutor {
  /** 目标阵营 country.id 或起始点偏移编码（params[1]）。 */
  houseId: number;

  constructor(action: any, trigger: any) {
    super(action, trigger);
    this.houseId = Number(action.params[1]);
  }

  /** 解析目标 house 并改属全部 targets 中的存活对象。 */
  execute(world: any, targets: any[]): void {
    let house: any;
    if (
      this.houseId >= ChangeHouseExecutor.locationHouseIdBegin &&
      this.houseId < ChangeHouseExecutor.locationHouseIdBegin + world.map.startingLocations.length
    ) {
      const startIdx = this.houseId - ChangeHouseExecutor.locationHouseIdBegin;
      house = world.getAllPlayers().find((p: any) => p.startLocation === startIdx);
    } else house = world.getAllPlayers().find((p: any) => p.country?.id === this.houseId);
    if (
      (house?.defeated && (house = world.isAssetRedistributionEnabled() ? world.alliances.getAllies(house)[0] : undefined)),
      house
    )
      for (const t of targets) if (t instanceof GameObject && t.isSpawned) world.changeObjectOwner(t, house);
  }

  /** 起始点编码区间起始值（houseId ≥ 此值按 startLocation 查找）。 */
  static locationHouseIdBegin = 4475;
}
