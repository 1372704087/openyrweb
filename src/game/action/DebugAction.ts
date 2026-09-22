/**
 * DebugAction — 调试指令（全局/单位调试文本）。
 *
 * DebugCommandType：SetGlobalDebugText=0、SetUnitDebugText=1。
 * 序列化：u8 type + 载荷（单位指令为 unitId(u32)+label(cstring)，
 * 全局指令为 text(cstring)）。process 按 type 写入对象 debugLabel
 * 或 game.debugText.value。
 *
 * 由 game/action/DebugAction.ts.js 重写为 TS（行为完全一致）。
 * 两个文件并存期间，本文件才是修改目标：tools/repack.mjs 打包时
 * 优先采用 .ts 模块的编译产物。
 */
import * as DataStreamModule from "data/DataStream"; // 未转换（any-shim）
import * as ActionTypeModule from "game/action/ActionType"; // 已转换
import * as ActionModule from "game/action/Action"; // 已转换
export enum DebugCommandType {
  SetGlobalDebugText = 0,
  SetUnitDebugText = 1,
}

export class DebugCommand {
  type: any;
  params: any;

  constructor(type: any, params: any) {
    this.type = type;
    this.params = params;
  }
}

export class DebugAction extends ActionModule.Action {
  // 字段一律不带初始化器：孪生构造函数按固定顺序赋值。
  game: any;
  command: any;

  constructor(game: any) {
    super(ActionTypeModule.ActionType.DebugCommand);
    this.game = game;
  }

  unserialize(data: any): void {
    const stream = new DataStreamModule.DataStream(data);
    const commandType = stream.readUint8();
    if (commandType === DebugCommandType.SetUnitDebugText) {
      this.command = new DebugCommand(commandType, {
        unitId: stream.readUint32(),
        label: stream.readCString() || void 0,
      });
    } else if (commandType === DebugCommandType.SetGlobalDebugText) {
      this.command = new DebugCommand(commandType, {
        text: stream.readCString(),
      });
    } else {
      console.warn(`Debug command ${commandType} not implemented`);
    }
  }

  serialize(): any {
    const stream = new DataStreamModule.DataStream();
    stream.writeUint8(this.command.type);
    if (this.command.type === DebugCommandType.SetUnitDebugText) {
      const params = this.command.params;
      stream.writeUint32(params.unitId);
      stream.writeCString(params.label || "");
    } else {
      if (this.command.type !== DebugCommandType.SetGlobalDebugText)
        throw new Error(`Debug command ${this.command.type} not implemented`);
      const params = this.command.params;
      stream.writeCString(params.text);
    }
    return stream.toUint8Array();
  }

  process(): void {
    if (!this.command) return;
    if (this.command.type === DebugCommandType.SetUnitDebugText) {
      const { unitId, label } = this.command.params;
      if (this.game.getWorld().hasObjectId(unitId)) {
        const obj = this.game.getObjectById(unitId);
        if (obj.isTechno()) obj.debugLabel = label;
      }
    } else if (this.command.type === DebugCommandType.SetGlobalDebugText) {
      const text = this.command.params["text"];
      this.game.debugText.value = text;
    } else {
      console.warn(`Debug command ${this.command.type} not implemented`);
    }
  }
}
