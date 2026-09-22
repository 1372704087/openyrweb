/**
 * HoverBobTrait — 悬浮单位上下浮动（bob）trait。
 *
 * 悬浮载具（如 Hover Tank、Disk）在地面/桥面上按正弦曲线轻微起伏：
 *  - 出生时记录 spawnTick 并锁定基准高度（地面或桥面 + 悬浮规则高度）；
 *  - 地形/桥面变化（onTileChange）时重置浮动相位并重算基准；
 *  - 每 tick 按 (now-spawnTick)/(60×bob×TPS) 的相位求 sin 振幅，
 *    与上一帧振幅差值叠加到当前 tileElevation，实现连续 bob；
 *  - disabled=true（如 Robot Tank 麻痹）时压回地面高度、不参与浮动。
 *
 * 由 game/gameobject/trait/HoverBobTrait.ts.js 重写为 TS（行为完全一致）。
 * 两个文件并存期间，本文件才是修改目标：tools/repack.mjs 打包时优先
 * 采用 .ts 模块的编译产物。
 */
import { GameSpeed } from "game/GameSpeed"; // 已转换
import * as NotifyTickModule from "game/gameobject/trait/interface/NotifyTick"; // 已转换
import * as NotifySpawnModule from "game/gameobject/trait/interface/NotifySpawn"; // 已转换
import { Coords } from "game/Coords"; // 孪生
import * as NotifyTileChangeModule from "game/gameobject/trait/interface/NotifyTileChange"; // 已转换
import { GameMath } from "game/math/GameMath"; // 孪生

export class HoverBobTrait {
  /** 上一帧的 bob 振幅（世界高度单位），用于差分叠加。 */
  prevHoverBobLeptons: number;
  /** 出生时的逻辑 tick，作为正弦相位零点。 */
  spawnTick: number;
  /** 禁用开关（如 Robot Tank 麻痹时置 true，压回地面）。 */
  disabled: boolean;

  constructor() {
    this.prevHoverBobLeptons = 0;
    this.spawnTick = 0;
    this.disabled = false;
  }

  /** 出生：锁定基准悬浮高度并记录相位起点 tick。 */
  [NotifySpawnModule.NotifySpawn.onSpawn](object: any, world: any): void {
    this.setBaseElevation(object, world);
    this.spawnTick = world.currentTick;
  }

  /** 地形/桥面变化：重置浮动相位并重算基准高度。 */
  [NotifyTileChangeModule.NotifyTileChange.onTileChange](
    object: any,
    world: any,
    _oldTile: any,
    _bridgeChanged?: boolean,
  ): void {
    // 第四个参数为桥面切换标志；发生切换时需重新贴地。
    if (_bridgeChanged) {
      this.prevHoverBobLeptons = 0;
      this.setBaseElevation(object, world);
    }
  }

  /**
   * 设定基准悬浮高度：桥上取桥面 elevation，否则 0，再叠加
   * 规则 hover.height 换算的 tile 高度。disabled 时不修改。
   */
  setBaseElevation(object: any, world: any): void {
    if (this.disabled) return;
    object.position.tileElevation =
      (object.onBridge
        ? (world.map.tileOccupation.getBridgeOnTile(object.tile)?.tileElevation ?? 0)
        : 0) + Coords.worldToTileHeight(world.rules.general.hover.height);
  }

  /**
   * 每 tick 推进 bob：
   *  - disabled 时压回地面（桥面 elevation），不叠加振幅；
   *  - 否则求当前期望 bob 振幅，与上帧差分后叠加到 tileElevation。
   */
  [NotifyTickModule.NotifyTick.onTick](object: any, world: any): void {
    if (this.disabled) {
      const ground = object.onBridge
        ? (world.map.tileOccupation.getBridgeOnTile(object.tile)?.tileElevation ?? 0)
        : 0;
      object.position.tileElevation = ground;
      return;
    }
    let leptons = this.computeHoverBobLeptons(world.currentTick, world.rules.general.hover);
    const delta = leptons - this.prevHoverBobLeptons;
    this.prevHoverBobLeptons = leptons;
    leptons = Coords.tileHeightToWorld(object.position.tileElevation);
    object.position.tileElevation = Coords.worldToTileHeight(leptons + delta);
  }

  /**
   * 按 (now-spawnTick) 相位求正弦 bob 振幅（世界高度单位）：
   *   phase = (now-spawnTick)/(TPS×60×bob)
   *   leptons = 0.1 × height × sin(2π×phase)
   */
  computeHoverBobLeptons(nowTick: number, hoverRules: any): number {
    const phase = (nowTick - this.spawnTick) / GameSpeed.BASE_TICKS_PER_SECOND / (60 * hoverRules.bob);
    return 0.1 * hoverRules.height * GameMath.sin(2 * phase * Math.PI);
  }
}
