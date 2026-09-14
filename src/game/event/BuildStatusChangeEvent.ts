/**
 * BuildStatusChangeEvent — 建筑建造状态变化事件。
 *
 * 建筑状态切换（成形/就绪/拆除收起）完成时经事件总线广播，UI（如
 * 建筑是否可用的提示）与逻辑系统订阅响应。
 *
 * 由 game/event/BuildStatusChangeEvent.ts.js 重写为 TS（行为完全一致）。
 * 两个文件并存期间，本文件才是修改目标：tools/repack.mjs 打包时优先
 * 采用 .ts 模块的编译产物。
 */
import { EventType } from "game/event/EventType";

export class BuildStatusChangeEvent {
  /** 状态变化的建筑。 */
  target: any;
  /** 新状态（Building 侧 BuildStatus 枚举值）。 */
  status: number;
  type: number;

  constructor(target: any, status: number) {
    this.target = target;
    this.status = status;
    this.type = EventType.BuildStatusChange;
  }
}
