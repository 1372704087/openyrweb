/**
 * PrimaryFactoryChangeEvent — 主工厂变更事件。
 *
 * 决定同类型新生产单位从哪个工厂出场（如多个战车工厂时切换主厂）。
 *
 * 由 game/event/PrimaryFactoryChangeEvent.ts.js 重写为 TS（行为完全一致）。
 * 两个文件并存期间，本文件才是修改目标：tools/repack.mjs 打包时优先
 * 采用 .ts 模块的编译产物。
 */
import { EventType } from "game/event/EventType"; // 孪生

export class PrimaryFactoryChangeEvent {
  /** 成为/取消主工厂的工厂对象，或相关玩家。 */
  readonly target: any;
  readonly type: number;

  constructor(target: any) {
    this.target = target;
    this.type = EventType.PrimaryFactoryChange;
  }
}
