/**
 * KeyboardHandler — 键位命令注册与按下/抬起分发（含扩展命令拉取）。
 *
 * 由 gui/screen/game/worldInteraction/keyboard/KeyboardHandler.ts.js
 * 重写为 TS（行为完全一致）。
 *
 * 两个文件并存期间，本文件才是修改目标：tools/repack.mjs 打包时优先采用 .ts 模块的编译产物。
 */
import { KeyCommandType } from "gui/screen/game/worldInteraction/keyboard/KeyCommandType"; // 已转换
import { TriggerMode } from "gui/screen/game/worldInteraction/keyboard/KeyCommand"; // 已转换

/* eslint-disable @typescript-eslint/no-explicit-any */

/** 键盘命令处理器。 */
export class KeyboardHandler {
  /** 键位表。 */
  keyBinds: any;
  /** 开发者模式（放行 F5/F12）。 */
  devMode: any;
  /** 命令 → 处理器。 */
  commands = new Map<string, any>();
  /** 是否暂停。 */
  isPaused = false;

  /** 允许无修饰键触发的命令列表。 */
  static anyModifierCommands = [KeyCommandType.PlanningMode];

  /**
   * @param keyBinds 键位表
   * @param devMode 开发者模式
   */
  constructor(keyBinds: any, devMode: any) {
    this.keyBinds = keyBinds;
    this.devMode = devMode;
    this.commands = new Map();
    this.isPaused = false;
    // 把「键位命令注册器」挂到 globalThis，供扩展宿主（extensions/ExtensionHost）在
    // 不引入模块依赖的前提下注册自定义热键命令 —— 避免给这个已有循环依赖的代码库
    // 再加一条模块边（ExtensionHost -> GUI 是反向依赖，容易成环）。
    (globalThis as any).__openyrweb_keyCmdRegistrar = (cmd: string, fn: any) =>
      this.registerCommand(cmd, fn);
    // 主动**拉取**扩展已登记的命令处理函数（宿主的 ExtensionHost.registerKeyCommand
    // 把它登记在 globalThis.__openyrweb_keyCommandHandlers）。
    //
    // 为什么必须「构造时拉」而不是「让宿主推」：registrar 是个全局句柄，本 handler
    // 被 dispose 后它**不会被清理**。于是第二局开局时，宿主看到的仍是上一局那个已废弃
    // 的 registrar，命令会被注册进废弃 handler，本局的 commands 表反而是空的 ⇒
    // 不刷新页面就无法使用扩展热键（实测复现过）。每局新建 handler 时拉一次，
    // 天然覆盖「每局重新注册」的需求（且 handler 闭包捕获的是本局的 game）。
    const pending = (globalThis as any).__openyrweb_keyCommandHandlers;
    if (pending && typeof pending.forEach === "function") {
      pending.forEach((fn: any, cmd: string) => {
        if (this.commands.has(cmd)) return;
        try {
          this.registerCommand(cmd, fn);
        } catch {
          /* 重复注册：忽略（本局已有同命令） */
        }
      });
    }
    // 注意：keyBinds 实例由 KeyBinds.load() 末尾挂到 globalThis.__openyrweb_keyBinds，
    // 不在这里重复挂 —— 本 handler 要到开局才创建，而扩展补默认键发生在前、
    // 且「键盘设置」页在主菜单，靠这里挂就晚了。
  }

  /**
   * 注册命令（不可重复）。
   * @param command 命令 id
   * @param fn 处理器
   */
  registerCommand(command: string, fn: any): void {
    if (this.commands.has(command)) throw new Error("Duplicate command " + command);
    this.commands.set(command, fn);
  }

  /**
   * 注销命令。
   * @param command 命令 id
   */
  unregisterCommand(command: string): void {
    this.commands.delete(command);
  }

  /**
   * 执行命令（按 triggerMode 分发）。
   * @param command 命令 id
   */
  executeCommand(command: string): void {
    const handler = this.commands.get(command);
    if (!handler || this.isPaused) return;
    if (typeof handler === "function") {
      handler();
    } else if (handler.triggerMode !== TriggerMode.KeyDownUp) {
      handler.execute(handler.triggerMode === TriggerMode.KeyUp);
    } else {
      handler.execute(false);
      handler.execute(true);
    }
  }

  /**
   * 按下：阻止 Backspace；跳过 repeat/F5/F12(dev)。
   * @param e 键事件
   */
  handleKeyDown(e: KeyboardEvent): void {
    if (e.key === "Backspace") {
      e.preventDefault();
      e.stopPropagation();
    }
    if (e.repeat || (["F5", "F12"].includes(e.key) && this.devMode)) return;
    let command = this.keyBinds.getCommandType(e);
    if (command === void 0) command = this.getNoModCmdType(e.keyCode);
    if (command === void 0) return;
    e.preventDefault();
    e.stopPropagation();
    const handler = this.commands.get(command);
    if (!handler || this.isPaused) return;
    if (typeof handler === "function") {
      handler();
    } else if (handler.triggerMode !== TriggerMode.KeyUp) {
      handler.execute(false);
    }
  }

  /**
   * 抬起：阻止 Alt；KeyUp/KeyDownUp 触发 execute(true)。
   * @param e 键事件
   */
  handleKeyUp(e: KeyboardEvent): void {
    if (e.key === "Alt") {
      e.preventDefault();
      e.stopPropagation();
      return;
    }
    if (this.isPaused) return;
    let command = this.keyBinds.getCommandType(e);
    if (command === void 0) command = this.getNoModCmdType(e.keyCode);
    if (command === void 0) return;
    const handler = this.commands.get(command);
    if (!handler || typeof handler === "function") return;
    if (handler.triggerMode !== TriggerMode.KeyUp && handler.triggerMode !== TriggerMode.KeyDownUp) {
      return;
    }
    handler.execute(true);
  }

  /**
   * 无修饰键位（仅 anyModifierCommands 白名单）。
   * @param keyCode 主键码
   */
  getNoModCmdType(keyCode: number): string | undefined {
    const command = this.keyBinds.getCommandType({
      keyCode,
      altKey: false,
      ctrlKey: false,
      shiftKey: false,
      metaKey: false,
    });
    if (command) {
      const handler = this.commands.get(command);
      if (handler && typeof handler !== "function" && KeyboardHandler.anyModifierCommands.includes(command)) {
        return command;
      }
    }
    return void 0;
  }

  /** 暂停分发。 */
  pause(): void {
    this.isPaused = true;
  }

  /** 恢复分发。 */
  unpause(): void {
    this.isPaused = false;
  }

  /** 清命令表。 */
  dispose(): void {
    this.commands.clear();
  }
}
