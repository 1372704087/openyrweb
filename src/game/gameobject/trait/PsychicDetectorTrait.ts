/**
 * PsychicDetectorTrait — 心灵感应探测器 trait。
 *
 * 挂在探测器建筑上：周期性扫描敌方（非同盟）单位的攻击目标/移动路径，
 * 生成 detectionLines 供 UI 绘制「探测线」。
 *  - 低电力（isLowPower）或超武失效（onWarpChange inactive）→ 清空线并
 *    置 nextScan=0（下次立刻重扫）；
 *  - 每 TPS tick 扫一次（nextScan 倒数），扫描半径 radiusTiles（tile）；
 *  - 扫描源：敌方有 currentTarget 的攻击者，或有 targetLinesConfig
 *    （手动目标/路径节点）的单位；距离用 RangeHelper.distance2。
 *
 * 由 game/gameobject/trait/PsychicDetectorTrait.ts.js 重写为 TS（行为完全一致）。
 * 两个文件并存期间，本文件才是修改目标：tools/repack.mjs 打包时优先
 * 采用 .ts 模块的编译产物。
 */
import { Coords } from "game/Coords"; // 孪生
import { GameSpeed } from "game/GameSpeed"; // 已转换
import * as RangeHelperModule from "game/gameobject/unit/RangeHelper"; // 未转换（any-shim）
import * as NotifyTickModule from "game/gameobject/trait/interface/NotifyTick"; // 已转换
import * as NotifyWarpChangeModule from "game/gameobject/trait/interface/NotifyWarpChange"; // 已转换

/** 扫描周期（tick），= 1 秒。 */
const SCAN_PERIOD_TICKS = GameSpeed.BASE_TICKS_PER_SECOND;

export class PsychicDetectorTrait {
  /** 探测半径（tile）。 */
  readonly radiusTiles: number;
  /** 当前周期扫描出的探测线列表（source→target）。 */
  detectionLines: any[];
  /** 距下次扫描的剩余 tick。 */
  nextScan: number;

  constructor(radiusTiles: number) {
    this.radiusTiles = radiusTiles;
    this.detectionLines = [];
    this.nextScan = SCAN_PERIOD_TICKS;
  }

  /**
   * 每 tick：低电力则 disable；否则倒数 nextScan，归零时重置为
   * SCAN_PERIOD_TICKS 并重扫 detectionLines。
   */
  [NotifyTickModule.NotifyTick.onTick](object: any, world: any): void {
    if (object.owner.powerTrait?.isLowPower()) {
      this.disable();
    } else {
      if (0 < this.nextScan) this.nextScan--;
      if (this.nextScan <= 0) {
        this.nextScan = SCAN_PERIOD_TICKS;
        this.detectionLines = this.scan(object, world);
      }
    }
  }

  /** 超武失效（warp 变为 inactive）时清空探测线。 */
  [NotifyWarpChangeModule.NotifyWarpChange.onChange](
    _object: any,
    _oldValue: any,
    inactive?: boolean,
  ): void {
    if (inactive) this.disable();
  }

  /** 清空探测线并置 nextScan=0（下次立刻重扫）。 */
  disable(): void {
    if (this.detectionLines.length) {
      this.detectionLines = [];
      this.nextScan = 0;
    }
  }

  /**
   * 扫描全部非同盟战斗方对象：
   *  - 有 attackTrait.currentTarget → 距离内推入 {source, target}；
   *  - 否则是 unit 且有 targetLinesConfig：有手动目标则推入；否则取
   *    pathNodes[0] 路径节点推入。
   * 距离判断：RangeHelper.distance2/LEPTONS_PER_TILE ≤ radiusTiles。
   */
  scan(self: any, world: any): any[] {
    const enemies = world
      .getCombatants()
      .filter((p: any) => p !== self.owner && !world.alliances.areAllied(p, self.owner));
    const lines: any[] = [];
    const helper = new RangeHelperModule.RangeHelper(world.map.tileOccupation);
    const inRange = (pos: any) =>
      helper.distance2(pos, self) / Coords.LEPTONS_PER_TILE <= this.radiusTiles;

    for (const player of enemies) {
      for (const obj of player.getOwnedObjects()) {
        if (obj.attackTrait?.currentTarget) {
          const t = obj.attackTrait.currentTarget;
          if (inRange(t.obj ?? t.tile)) lines.push({ source: obj, target: t });
        } else if (
          obj.isUnit() &&
          obj.unitOrderTrait.targetLinesConfig
        ) {
          const cfg = obj.unitOrderTrait.targetLinesConfig;
          if (cfg.target) {
            if (inRange(cfg.target)) {
              const t = world.createTarget(cfg.target, cfg.target.tile);
              lines.push({ source: obj, target: t });
            }
          } else if (cfg.pathNodes[0]) {
            const node = cfg.pathNodes[0];
            if (inRange(node.tile)) {
              const t = world.createTarget(node.onBridge, node.tile);
              lines.push({ source: obj, target: t });
            }
          }
        }
      }
    }
    return lines;
  }
}
