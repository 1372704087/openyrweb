/**
 * SelectUnitsAction — 更新玩家选择集的动作。
 *
 * unserialize 读 unitIds（uint32 数组；按下标写回使 setter 截断被撑开——
 * 与孪生一致实际不截断，见 unserialize 注释）；
 * process 将仍存在的己方/世界 techno 写入 OrderActionContext 对应选择集。
 *
 * 由 game/action/SelectUnitsAction.ts.js 重写为 TS（行为完全一致）。两个
 * 文件并存期间，本文件才是修改目标：tools/repack.mjs 打包时优先采用
 * .ts 模块的编译产物。
 *
 * 两个文件并存期间，本文件才是修改目标：tools/repack.mjs 打包时优先采用 .ts 模块的编译产物。
 */
import { Action } from "game/action/Action"; // 已转换
import { ActionType } from "game/action/ActionType"; // 已转换
import * as DataStreamModule from "data/DataStream"; // 未转换（any-shim）
import { ORDER_UNIT_LIMIT } from "game/action/OrderUnitsAction"; // 已转换

/* eslint-disable @typescript-eslint/no-explicit-any */
export class SelectUnitsAction extends Action {
  // 字段一律不带初始化器：孪生构造函数按固定顺序赋值。
  game: any;
  orderActionContext: any;
  player: any;
  _unitIds: number[];

  get unitIds(): number[] {
    return this._unitIds;
  }

  set unitIds(value: number[]) {
    this._unitIds = value.slice(0, ORDER_UNIT_LIMIT);
  }

  constructor(game: any, orderActionContext: any) {
    super(ActionType.SelectUnits);
    this.game = game;
    this.orderActionContext = orderActionContext;
  }

  unserialize(data: any): void {
    const stream = new DataStreamModule.DataStream(data);
    // 还原孪生写法（需定夺→按迁移等价）：先经 setter 赋长数组（slice 截断到
    // ORDER_UNIT_LIMIT），再按下标逐个写回——i ≥ LIMIT 会把 _unitIds 重新撑开，
    // 实际不截断。>128 id 载荷与锁步基线保持一致（原 TS 本地读满再整体赋值
    // 会真截断，>128 时 lockstep 分叉；若要保留修 bug 语义需单独立项同步发送端）。
    this.unitIds = new Array(data.byteLength / 4);
    for (let i = 0; i < data.byteLength / 4; i++) {
      this.unitIds[i] = stream.readUint32();
    }
  }

  serialize(): Uint8Array {
    const stream = new DataStreamModule.DataStream(4 * this.unitIds.length);
    stream.dynamicSize = false;
    for (const id of this.unitIds) stream.writeUint32(id);
    return stream.toUint8Array();
  }

  print(): string {
    return `Select unit(s) [${this.unitIds.join(",")}]`;
  }

  process(): void {
    const player = this.player;
    const selected: any[] = [];
    for (const id of this.unitIds) {
      let obj = player.getOwnedObjectById(id);
      if (!obj && this.game.getWorld().hasObjectId(id)) {
        const worldObj = this.game.getWorld().getObjectById(id);
        if (worldObj.isTechno()) obj = worldObj;
      }
      if (obj) selected.push(obj);
    }
    this.orderActionContext.getOrCreateSelection(player).update(selected);
  }
}
