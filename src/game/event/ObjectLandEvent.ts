/**
 * ObjectLandEvent — 飞行器着陆事件。
 *
 * 飞行单位完成着陆（由空中转入地面态）时派发，与 ObjectLiftOffEvent
 * 相对，用于动画切换与状态机推进。
 *
 * 由 game/event/ObjectLandEvent.ts.js 重写为 TS（行为完全一致）。
 * 两个文件并存期间，本文件才是修改目标：tools/repack.mjs 打包时优先
 * 采用 .ts 模块的编译产物。
 */
import { EventType } from "game/event/EventType";

export class ObjectLandEvent {
  /** 完成着陆的游戏对象。 */
  readonly gameObject: any;
  readonly type: number;

  constructor(gameObject: any) {
    this.gameObject = gameObject;
    this.type = EventType.ObjectLand;
  }
}
