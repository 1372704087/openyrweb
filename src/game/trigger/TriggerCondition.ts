/**
 * TriggerCondition — 所有触发器条件的抽象基类。
 *
 * 由 game/trigger/TriggerCondition.ts.js 重写为 TS（行为完全一致）。
 * 两个文件并存期间，本文件才是修改目标：tools/repack.mjs 打包时优先
 * 采用 .ts 模块的编译产物。
 *
 * 职责：绑定一条触发器事件与其所属 TriggerInstance；init 时按
 * trigger.houseName 解析归属玩家；check 由子类实现；setTargets 注入
 * 标签目标集合；reset 供状态型条件在触发后清理（基类空实现）。
 */
/* eslint-disable @typescript-eslint/no-explicit-any */

export class TriggerCondition {
  /** 本条件对应的触发器事件记录（含 type/params/triggerId/eventIndex）。 */
  event: any;
  /** 所属触发器实例。 */
  trigger: any;
  /** 是否为阻塞条件（同步检查路径，非事件队列异步匹配）。 */
  blocking: boolean;
  /** 标签绑定的目标对象集合（由 TriggerInstance 注入）。 */
  targets: any[];
  /** 按 houseName 解析到的归属玩家；init 后可能仍为 undefined。 */
  player: any;

  constructor(event: any, trigger: any) {
    this.event = event;
    this.trigger = trigger;
    this.blocking = !1;
    this.targets = [];
  }

  /**
   * 初始化：在全体玩家中按国家名匹配触发器归属方。
   *
   * @param world 提供 getAllPlayers() 的世界上下文。
   */
  init(world: any): void {
    const found = world.getAllPlayers().find((p: any) => p.country?.name === this.trigger.houseName);
    if (found) this.player = found;
  }

  /** 设置标签目标集合（覆盖写入，与孪生一致）。 */
  setTargets(targets: any[]): void {
    this.targets = targets;
  }

  /** 重置条件内部状态（基类空实现，与孪生一致）。 */
  reset(): void {}

  /** 调试名：`triggerId[eventIndex] (触发器名).` */
  getDebugName(): string {
    return `${this.event.triggerId}[${this.event.eventIndex}] (${this.trigger.name}).`;
  }
}

/**
 * 类型-only 合并：基类运行时不提供 check（与孪生一致），
 * 但 TriggerManager 等按 `condition.check(...)` 静态调用需要此签名。
 * 接口合并不产生运行时字段，避免破坏键集合比对。
 */
export interface TriggerCondition {
  /** 子类实现的检查入口。 */
  check(context?: any, events?: any): any;
}
