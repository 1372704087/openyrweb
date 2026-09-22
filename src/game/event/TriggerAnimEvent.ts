/**
 * TriggerAnimEvent — 触发器动画事件。
 *
 * 地图触发器在指定格播放/触发一段动画（或动画命名事件）时派发，
 * 渲染与触发器条件系统据此响应。
 *
 * 由 game/event/TriggerAnimEvent.ts.js 重写为 TS（行为完全一致）。
 * 两个文件并存期间，本文件才是修改目标：tools/repack.mjs 打包时优先
 * 采用 .ts 模块的编译产物。
 */
import { EventType } from "game/event/EventType";

export class TriggerAnimEvent {
  /** 动画/效果的注册名。 */
  readonly name: string;
  /** 动画关联的地图格。 */
  readonly tile: any;
  readonly type: number;

  constructor(name: string, tile: any) {
    this.name = name;
    this.tile = tile;
    this.type = EventType.TriggerAnim;
  }
}
