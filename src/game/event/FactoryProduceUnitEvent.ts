/**
 * FactoryProduceUnitEvent — 工厂产出单位事件。
 *
 * 由 game/event/FactoryProduceUnitEvent.ts.js 重写为 TS（行为完全一致）。
 * 两个文件并存期间，本文件才是修改目标：tools/repack.mjs 打包时优先
 * 采用 .ts 模块的编译产物。
 */
import { EventType } from "game/event/EventType";

export class FactoryProduceUnitEvent {
  /** 产出的单位对象。 */
  readonly target: any;
  readonly type: number = EventType.FactoryProduceUnit;

  constructor(target: any) {
    this.target = target;
  }
}
