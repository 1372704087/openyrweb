/**
 * ObjectSpawnEvent — 对象生成事件（新对象加入世界）。
 *
 * 开局部署、空投、生产完成出场等场景派发。
 *
 * 由 game/event/ObjectSpawnEvent.ts.js 重写为 TS（行为完全一致）。
 * 两个文件并存期间，本文件才是修改目标：tools/repack.mjs 打包时优先
 * 采用 .ts 模块的编译产物。
 */
import { EventType } from "game/event/EventType"; // 孪生

export class ObjectSpawnEvent {
  /** 新加入世界的游戏对象。 */
  readonly gameObject: any;
  readonly type: number;

  constructor(gameObject: any) {
    this.gameObject = gameObject;
    this.type = EventType.ObjectSpawn;
  }
}
