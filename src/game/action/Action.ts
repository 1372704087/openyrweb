/**
 * Action — 游戏动作基类（网络消息/回放中的一条玩家或系统动作）。
 *
 * 全部具体动作（PlaceBuilding / OrderUnits / SelectUnits / …）的公共骨架：
 * 持有 actionType，提供 unserialize / serialize / print / process 四个可覆写钩子。
 * 子类按需读写二进制载荷，并在 process 中落地到游戏状态。
 * player 由 lockstep / 队列在 process 前外部注入。
 *
 * 由 game/action/Action.ts.js 重写为 TS。两个文件并存期间，
 * 本文件才是修改目标：tools/repack.mjs 打包时优先采用 .ts 模块的编译产物。
 */
import { ActionType } from "game/action/ActionType"; // 已转换

/* eslint-disable @typescript-eslint/no-explicit-any */
export class Action {
  // 字段一律不带初始化器：孪生构造函数按固定顺序赋值，TS 的字段
  // 初始化器会被提升到 super() 之后立刻执行，改变 Object.keys() 顺序。
  actionType: ActionType;
  /** 处理时由 Action 队列/lockstep 外部注入（孪生基类无此字段声明）。 */
  player: any;

  constructor(actionType: ActionType) {
    this.actionType = actionType;
  }

  /** 从二进制载荷反序列化字段（子类覆写）。 */
  unserialize(_data: any): void {}

  /** 序列化为网络/回放字节流（子类覆写）。 */
  serialize(): Uint8Array {
    return new Uint8Array();
  }

  /** 调试/日志用人类可读描述（子类覆写）。 */
  print(): string {
    return "";
  }

  /** 将动作落地到游戏状态（子类覆写；基类默认 no-op）。 */
  process(): void {}
}
