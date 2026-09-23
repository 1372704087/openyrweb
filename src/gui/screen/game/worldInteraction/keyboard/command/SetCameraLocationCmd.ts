/**
 * SetCameraLocationCmd — 将当前镜头位置写入保存机位槽。
 *
 * 由 gui/screen/game/worldInteraction/keyboard/command/SetCameraLocationCmd.ts.js
 * 重写为 TS（行为完全一致）。
 */

/* eslint-disable @typescript-eslint/no-explicit-any */

/** 保存机位命令：把 cameraPan 当前 pan 写入 cameraLocations[idx]。 */
export class SetCameraLocationCmd {
  /** 镜头平移控制器。 */
  cameraPan: any;
  /** 机位存储表（Map/数组均可，由孪生 set 接口驱动）。 */
  cameraLocations: any;
  /** 机位槽下标。 */
  idx: any;

  /**
   * @param cameraPan 镜头平移
   * @param cameraLocations 机位存储
   * @param idx 槽下标
   */
  constructor(cameraPan: any, cameraLocations: any, idx: any) {
    this.cameraPan = cameraPan;
    this.cameraLocations = cameraLocations;
    this.idx = idx;
  }

  /** 写入当前 pan 到槽位。 */
  execute(): void {
    this.cameraLocations.set(this.idx, this.cameraPan.getPan());
  }
}
