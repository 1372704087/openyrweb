/**
 * TilterTrait — 地形坡度倾斜 trait。
 *
 * 出生/换格时按 tile.rampType 计算 pitch/yaw：
 *  - rampType 0 或 ≥17：水平（0,0）；
 *  - ≤4：pitch=25，yaw=-90×rampType；
 *  - 其余：pitch=25，yaw=225-((rampType-1)%4)×90。
 *
 * 由 game/gameobject/trait/TilterTrait.ts.js 重写为 TS
 * （行为完全一致）。两个文件并存期间，本文件才是修改目标：
 * tools/repack.mjs 打包时优先采用 .ts 模块的编译产物。
 */
import * as NotifySpawnModule from "game/gameobject/trait/interface/NotifySpawn"; // 已转换
import * as NotifyTileChangeModule from "game/gameobject/trait/interface/NotifyTileChange"; // 已转换

/** 倾斜角（度）。 */
export interface Tilt {
  pitch: number;
  yaw: number;
}

/* eslint-disable @typescript-eslint/no-explicit-any */
export class TilterTrait {
  /** 当前倾斜状态。 */
  tilt: Tilt;

  constructor() {
    this.tilt = { pitch: 0, yaw: 0 };
  }

  /** 出生：按初始格 rampType 计算倾斜。 */
  [NotifySpawnModule.NotifySpawn.onSpawn](obj: any): void {
    this.tilt = this.computeTilt(obj.tile.rampType);
  }

  /** 换格：按新格 rampType 重算倾斜。 */
  [NotifyTileChangeModule.NotifyTileChange.onTileChange](obj: any): void {
    this.tilt = this.computeTilt(obj.tile.rampType);
  }

  /** 由 rampType 推导 pitch/yaw（与孪生逐分支一致）。 */
  computeTilt(rampType: number): Tilt {
    let pitch: number;
    let yaw: number;
    if (0 === rampType || 17 <= rampType) {
      pitch = 0;
      yaw = 0;
    } else {
      yaw = rampType <= 4 ? ((pitch = 25), -90 * rampType) : ((pitch = 25), 225 - ((rampType - 1) % 4) * 90);
    }
    return { pitch, yaw };
  }
}
