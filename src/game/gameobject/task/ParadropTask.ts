/**
 * ParadropTask — 空降下落任务（运输机抛下的步兵/单位落地）。
 *
 * 每 tick 把单位按 parachuteMaxFallRate 下压；落到目标地块高度（桥上
 * 取桥面 elevation）时结束任务，姿态复位 None。落点不可通行则
 * infDeathType=None 并 destroyObject（空降失败）。
 *
 * 由 game/gameobject/task/ParadropTask.ts.js 重写为 TS（行为完全一致）。
 * 两个文件并存期间，本文件才是修改目标：tools/repack.mjs 打包时优先
 * 采用 .ts 模块的编译产物。
 */
import { Coords } from "game/Coords"; // 已转换
import { Vector3 } from "game/math/Vector3"; // 已转换
import { InfDeathType } from "game/gameobject/infantry/InfDeathType"; // 已转换
import { StanceType } from "game/gameobject/infantry/StanceType"; // 已转换
import { Task } from "game/gameobject/task/system/Task"; // 已转换

/* eslint-disable @typescript-eslint/no-explicit-any */
export class ParadropTask extends Task {
  game: any;

  constructor(game: any) {
    super();
    this.game = game;
  }

  onTick(object: any): boolean {
    const maxFallRate = Math.abs(this.game.rules.general.parachuteMaxFallRate);
    const targetElevation = object.tile.onBridgeLandType
      ? this.game.map.tileOccupation.getBridgeOnTile(object.tile).tileElevation
      : 0;
    const targetWorldHeight = Coords.tileHeightToWorld(targetElevation);
    const startElevation = object.tileElevation;
    const startWorldHeight = Coords.tileHeightToWorld(startElevation);
    return targetWorldHeight < Math.max(targetWorldHeight, startWorldHeight - maxFallRate)
      ? (object.position.moveByLeptons3(new Vector3(0, -maxFallRate, 0)),
        object.moveTrait.handleElevationChange(startElevation, this.game),
        false)
      : ((object.position.tileElevation = targetElevation),
        (object.stance = StanceType.None),
        this.game.map.terrain.getPassableSpeed(
          object.tile,
          object.rules.speedType,
          object.isInfantry(),
          object.onBridge,
        ) ||
          ((object.infDeathType = InfDeathType.None), this.game.destroyObject(object, undefined, true)),
        true);
  }
}
