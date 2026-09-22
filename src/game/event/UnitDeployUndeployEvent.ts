/**
 * UnitDeployUndeployEvent — 单位展开/收起事件。
 *
 * 基地车展开为建筑、坦克架设、气垫船登陆态切换等场景派发。
 *
 * 由 game/event/UnitDeployUndeployEvent.ts.js 重写为 TS（行为完全一致）。
 * 两个文件并存期间，本文件才是修改目标：tools/repack.mjs 打包时优先
 * 采用 .ts 模块的编译产物。
 */
import { EventType } from "game/event/EventType"; // 孪生

export class UnitDeployUndeployEvent {
  /** 执行展开/收起的单位。 */
  readonly unit: any;
  /** 展开类型（展开/收起的判别值，语义由调用方约定）。 */
  readonly deployType: any;
  readonly type: number;

  constructor(unit: any, deployType: any) {
    this.unit = unit;
    this.deployType = deployType;
    this.type = EventType.UnitDeployUndeploy;
  }
}
