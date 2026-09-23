/**
 * SuperWeaponEffect — 超武特效基类与生命周期状态。
 *
 * 每次超武激活会在 SuperWeaponsTrait.effects 中挂一个本类（子类）实例：
 *  - status：NotStarted → onStart → Running → onTick → Finished；
 *  - onStart(world)：结算时的一次性逻辑（套盾、开图、生成弹体等）；
 *  - onTick(world)：返回 true 表示效果结束，false 表示仍在跑。
 *
 * 由 game/superweapon/SuperWeaponEffect.ts.js 重写为 TS（行为完全一致，
 * 枚举值脚本提取自原文件）。两个文件并存期间，本文件才是修改目标：
 * tools/repack.mjs 打包时优先采用 .ts 模块的编译产物。
 */

/* eslint-disable @typescript-eslint/no-explicit-any */

/** 超武特效生命周期状态。 */
export enum EffectStatus {
  /** 已创建，尚未 onStart。 */
  NotStarted = 0,
  /** 正在运行。 */
  Running = 1,
  /** 已结束。 */
  Finished = 2,
}

export class SuperWeaponEffect {
  /** 对应 SuperWeaponType。 */
  type: any;
  /** 发动者玩家。 */
  owner: any;
  /** 目标/中心 tile。 */
  tile: any;
  /** 当前状态。 */
  status: EffectStatus;

  constructor(type: any, owner: any, tile: any) {
    this.type = type;
    this.owner = owner;
    this.tile = tile;
    this.status = EffectStatus.NotStarted;
  }

  /** 首次进入 Running 时调用（默认无操作）。 */
  onStart(_world: any): void {}

  /** 每逻辑 tick；返回 true 表示效果已完成。 */
  onTick(_world: any): boolean {
    return true;
  }
}
