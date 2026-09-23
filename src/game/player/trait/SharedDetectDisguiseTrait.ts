/**
 * SharedDetectDisguiseTrait — 玩家级共享反伪装探测集合（挂在 Player 上）。
 *
 * 记录本玩家（及经 alliance 共享）当前被探测到的伪装单位：add/delete/has
 * 包装一个 Set，dispose 时清空。与 game/trait/SharedDetectDisguiseTrait
 * （挂在对象上的探测器逻辑）配套使用。
 *
 * 由 game/player/trait/SharedDetectDisguiseTrait.ts.js 重写为 TS（行为
 * 完全一致）。两个文件并存期间，本文件才是修改目标：tools/repack.mjs
 * 打包时优先采用 .ts 模块的编译产物。
 */

/* eslint-disable @typescript-eslint/no-explicit-any */

export class SharedDetectDisguiseTrait {
  /** 当前可被本玩家感知到的伪装单位集合。 */
  objects: Set<any>;

  constructor() {
    this.objects = new Set();
  }

  /** 登记一个被探测到的伪装单位。 */
  add(object: any): void {
    this.objects.add(object);
  }

  /** 移除一个伪装单位（脱离范围/销毁时）。 */
  delete(object: any): void {
    this.objects.delete(object);
  }

  /** 查询该单位是否在本玩家的反伪装集合中。 */
  has(object: any): boolean {
    return this.objects.has(object);
  }

  /** 清空集合（玩家销毁时）。 */
  dispose(): void {
    this.objects.clear();
  }
}
