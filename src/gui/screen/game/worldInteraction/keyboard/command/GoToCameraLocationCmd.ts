/**
 * GoToCameraLocationCmd — 跳转到保存机位（优先槽位，否则默认机位）。
 *
 * 由 gui/screen/game/worldInteraction/keyboard/command/GoToCameraLocationCmd.ts.js
 * 重写为 TS（行为完全一致）。
 *
 * 两个文件并存期间，本文件才是修改目标：tools/repack.mjs 打包时优先采用 .ts 模块的编译产物。
 */

/* eslint-disable @typescript-eslint/no-explicit-any */

/** 读取机位命令：locations[idx] || defaultLocation，存在则 setPan。 */
export class GoToCameraLocationCmd {
  /** 镜头平移控制器。 */
  cameraPan: any;
  /** 机位存储表。 */
  cameraLocations: any;
  /** 机位槽下标。 */
  idx: any;
  /** 默认机位（槽位为空时回退）。 */
  defaultLocation: any;

  /**
   * @param cameraPan 镜头平移
   * @param cameraLocations 机位存储
   * @param idx 槽下标
   * @param defaultLocation 默认机位
   */
  constructor(cameraPan: any, cameraLocations: any, idx: any, defaultLocation: any) {
    this.cameraPan = cameraPan;
    this.cameraLocations = cameraLocations;
    this.idx = idx;
    this.defaultLocation = defaultLocation;
  }

  /** 执行跳转。 */
  execute(): void {
    const loc = this.cameraLocations.get(this.idx) || this.defaultLocation;
    if (loc) this.cameraPan.setPan(loc);
  }
}
