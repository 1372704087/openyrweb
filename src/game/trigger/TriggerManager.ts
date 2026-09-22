/**
 * TriggerManager — 触发器运行时状态机（世界级）。
 *
 * 职责与状态流转：
 *  1. init(game)
 *     - 扫 map 初始 technos 的 tag 字段 → targetsByTag
 *     - 扫 CellTags → targetsByTag（越界 warn 跳过）
 *     - clone 地图 Variables → localVariables
 *     - 对每个 Trigger createTriggerInstance → triggerInstances
 *     - 订阅 game.events，把事件写入 pendingGameEvents 队列
 *  2. update(game) —— 每帧主循环
 *     a. 取出本帧 pendingGameEvents（splice 清空）
 *     b. 遍历未 finished 且未 disabled 的实例：
 *        - 顺序 check 各条件；boolean false → 失败；数组 → 累积命中目标；
 *          blocking 条件失败则 break
 *        - 全部成功：
 *          · 先 reset 各条件
 *          · OnceAll：从 remainingTargets 删除命中目标，未清空则 continue
 *                    （本帧不执行）；清空后只取最后一个命中目标
 *          · 其他 repeat：targets 全量
 *          · executeActions；非 Repeat → finished=true
 *  3. 控制接口：setTriggerEnabled / forceTrigger / destroyTrigger / destroyTag
 *  4. 动态目标：attachTargetToTag / detachTargetFromTag（与 targetsByTag 同引用）
 *  5. 全局/局部变量：get/toggleGlobalVariable、get/toggleLocalVariable
 *
 * 由 game/trigger/TriggerManager.ts.js 重写为 TS（行为完全一致）。
 * 两个文件并存期间，本文件才是修改目标：tools/repack.mjs 打包时优先
 * 采用 .ts 模块的编译产物。
 */
import { TagRepeatType } from "data/map/tag/TagRepeatType"; // 孪生
import { TriggerExecutorFactory } from "game/trigger/TriggerExecutorFactory"; // 孪生
import { TriggerConditionFactory } from "game/trigger/TriggerConditionFactory"; // 孪生
import { CompositeDisposable } from "util/disposable/CompositeDisposable"; // 孪生
import * as VariableModule from "data/map/Variable"; // 未转换（any-shim）
import type { TriggerInstance } from "game/trigger/TriggerInstance"; // 本组已写

/* eslint-disable @typescript-eslint/no-explicit-any */
export class TriggerManager {
  /** 订阅生命周期（events.subscribe 等）的可释放集合。 */
  readonly disposables: CompositeDisposable;
  /** triggerId → 运行时实例。 */
  readonly triggerInstances: Map<string, TriggerInstance>;
  /** tagId → 目标对象数组（与各实例 conditions.targets 同引用）。 */
  readonly targetsByTag: Map<string, any[]>;
  readonly conditionFactory: TriggerConditionFactory;
  readonly executorFactory: TriggerExecutorFactory;
  /** 本帧待处理的游戏事件队列（由 events 订阅写入，update 时 splice）。 */
  readonly pendingGameEvents: any[];
  /** 全局变量 idx → Variable。 */
  readonly globalVariables: Map<number, any>;
  /** 局部变量 idx → Variable（init 时从地图 clone）。 */
  readonly localVariables: Map<number, any>;

  constructor() {
    this.disposables = new CompositeDisposable();
    this.triggerInstances = new Map();
    this.targetsByTag = new Map();
    this.conditionFactory = new TriggerConditionFactory();
    this.executorFactory = new TriggerExecutorFactory();
    this.pendingGameEvents = [];
    this.globalVariables = new Map();
    this.localVariables = new Map();
  }

  /**
   * 初始化状态机：
   * 建立 tag→目标索引、克隆局部变量、创建全部触发实例、订阅事件总线。
   */
  init(game: any): void {
    const technos = game.map.getInitialMapObjects()["technos"];
    // 1) 初始单位自带的 tag 绑定
    for (const info of technos) {
      if (!info.tag) continue;
      let list = this.targetsByTag.get(info.tag);
      if (!list) {
        list = [];
        this.targetsByTag.set(info.tag, list);
      }
      const tile = game.map.tiles.getByMapCoords(info.rx, info.ry);
      if (!tile) continue;
      const obj = game.map.getObjectsOnTile(tile).find((o) => o.name === info.name && o.type === info.type);
      if (obj) list.push(obj);
    }
    // 2) CellTags 段绑定
    for (const ct of game.map.getCellTags()) {
      const tile = game.map.tiles.getByMapCoords(ct.coords.x, ct.coords.y);
      if (tile) {
        let list = this.targetsByTag.get(ct.tagId);
        if (!list) {
          list = [];
          this.targetsByTag.set(ct.tagId, list);
        }
        list.push(tile);
      } else {
        console.warn(`CellTag out of bounds at (${ct.coords.x}, ${ct.coords.y}). Skipping.`);
      }
    }
    // 3) 局部变量快照
    for (const [idx, v] of game.map.getVariables()) {
      this.localVariables.set(idx, v.clone());
    }
    // 4) 创建触发实例
    for (const trigger of game.map.getTriggers()) {
      this.triggerInstances.set(trigger.id, this.createTriggerInstance(trigger, game));
    }
    // 5) 订阅事件 → pending 队列
    this.disposables.add(game.events.subscribe((ev) => this.pendingGameEvents.push(ev)));
  }

  /**
   * 为单个 Trigger 构建运行时实例：
   * 条件按 blocking 降序排序；OnceAll 时 remainingTargets 预填全量目标。
   */
  createTriggerInstance(trigger: any, game: any): TriggerInstance {
    const targets = this.targetsByTag.get(trigger.tag.id) ?? [];
    return {
      trigger,
      conditions: trigger.events
        .map((ev) => {
          const cond = this.conditionFactory.create(ev, trigger);
          cond.setTargets(targets);
          cond.init(game);
          return cond;
        })
        .sort((a, b) => Number(b.blocking) - Number(a.blocking)),
      targets,
      remainingTargets: new Set((trigger.tag as any).repeatType === TagRepeatType.OnceAll ? targets : []),
      disabled: trigger.disabled,
      finished: false,
    };
  }

  /**
   * 每帧状态机主更新：
   * 取出 pending 事件 → 逐实例 check → 命中则 reset/分发目标/executeActions。
   * OnceAll 未清空 remainingTargets 时 continue（跳过执行与 finished）。
   */
  update(game: any): void {
    const events = this.pendingGameEvents.splice(0, this.pendingGameEvents.length);
    for (const inst of this.triggerInstances.values()) {
      if (inst.finished || inst.disabled) continue;
      let allOk = true;
      const hitTargets: any[] = [];
      for (const cond of inst.conditions) {
        const r = cond.check(game, events);
        if (typeof r === "boolean") {
          if (!r) allOk = false;
        } else if (r.length) {
          hitTargets.push(...r);
        } else {
          allOk = false;
        }
        // blocking 条件失败 → 短路
        if (cond.blocking && !allOk) break;
      }
      if (!allOk) continue;
      const trigger = inst.trigger;
      inst.conditions.forEach((c) => c.reset?.());
      let actionTargets: any[] = [];
      if ((trigger.tag as any).repeatType === TagRepeatType.OnceAll) {
        // 消耗命中目标；尚未全部命中 → 本帧不执行
        for (const t of hitTargets) inst.remainingTargets.delete(t);
        if (inst.remainingTargets.size) continue;
        // 全部命中后只取最后一次命中（与孪生一致）
        actionTargets = hitTargets.length ? [hitTargets[hitTargets.length - 1]] : [];
      } else {
        actionTargets = inst.targets;
      }
      this.executeActions(trigger, actionTargets, game);
      if ((trigger.tag as any).repeatType !== TagRepeatType.Repeat) {
        inst.finished = true;
      }
    }
  }

  /** 按动作列表逐条 create executor 并执行。 */
  executeActions(trigger: any, targets: any[], game: any): void {
    for (const action of trigger.actions) {
      const exec = this.executorFactory.create(action, trigger);
      exec.execute(game, targets);
    }
  }

  /** Enable/Disable Trigger：disabled = !enabled。 */
  setTriggerEnabled(triggerId: string, enabled: boolean): void {
    const inst = this.triggerInstances.get(triggerId);
    if (inst) inst.disabled = !enabled;
  }

  /** ForceTrigger：无视条件直接执行该实例的全部动作。 */
  forceTrigger(triggerId: string, game: any): void {
    const inst = this.triggerInstances.get(triggerId);
    if (inst) this.executeActions(inst.trigger, inst.targets, game);
  }

  /** 从运行时移除单个触发器。 */
  destroyTrigger(triggerId: string): void {
    this.triggerInstances.delete(triggerId);
  }

  /** 销毁绑定到指定 tag 的全部触发器。 */
  destroyTag(tagId: string): void {
    const ids: string[] = [];
    for (const [id, inst] of this.triggerInstances) {
      if ((inst.trigger.tag as any).id === tagId) ids.push(id);
    }
    for (const id of ids) this.destroyTrigger(id);
  }

  /**
   * 动态注册标记目标（ScenarioTeamRuntime 队伍 tag 调用）。
   * targetsByTag 的数组与 createTriggerInstance 里 setTargets 传入的是同一引用，
   * 因此 push/splice 会自动同步到已创建触发实例的 conditions.targets / instances.targets；
   * 额外的 remainingTargets 维护 OnceAll 语义。
   */
  attachTargetToTag(tagId: string, target: any): void {
    let list = this.targetsByTag.get(tagId);
    if (!list) {
      list = [];
      this.targetsByTag.set(tagId, list);
    }
    if (!list.includes(target)) {
      list.push(target);
      for (const inst of this.triggerInstances.values()) {
        if ((inst.trigger.tag as any)?.id === tagId && inst.remainingTargets) {
          inst.remainingTargets.add(target);
        }
      }
    }
  }

  /** 动态解绑标记目标；同步从数组与 remainingTargets 移除。 */
  detachTargetFromTag(tagId: string, target: any): void {
    const list = this.targetsByTag.get(tagId);
    if (list) {
      const idx = list.indexOf(target);
      if (idx !== -1) list.splice(idx, 1);
    }
    for (const inst of this.triggerInstances.values()) {
      if ((inst.trigger.tag as any)?.id === tagId) inst.remainingTargets?.delete(target);
    }
  }

  /** 读全局变量（缺失或 falsy → false）。 */
  getGlobalVariable(idx: number): boolean {
    return !!this.globalVariables.get(idx)?.value;
  }

  /** 写/建全局变量。 */
  toggleGlobalVariable(idx: number, value: boolean): void {
    const v = this.globalVariables.get(idx);
    if (v === undefined) {
      this.globalVariables.set(idx, new (VariableModule as any).Variable("No name", value));
    } else {
      v.value = value;
    }
  }

  /** 读局部变量（缺失或 falsy → false）。 */
  getLocalVariable(idx: number): boolean {
    return !!this.localVariables.get(idx)?.value;
  }

  /** 写/建局部变量。 */
  toggleLocalVariable(idx: number, value: boolean): void {
    const v = this.localVariables.get(idx);
    if (v === undefined) {
      this.localVariables.set(idx, new (VariableModule as any).Variable("No name", value));
    } else {
      v.value = value;
    }
  }

  /** 释放全部订阅。 */
  dispose(): void {
    this.disposables.dispose();
  }
}
