/**
 * tools/DevToolsApi — 控制台调试命令/运行时变量注册表。
 *
 * 静态 API：把命令（getter 触发执行）与 BoxedVar 风格运行时变量
 * （getter/setter 读写 .value）暴露到 window.r 命名空间；
 * 已注册再注册 / 未注册注销均 console.error。
 *
 * 由 tools/DevToolsApi.ts.js 重写为 TS（行为完全一致）。两个文件并存期间，
 * 本文件才是修改目标：tools/repack.mjs 打包时优先采用 .ts 模块的编译产物。
 */

/** 命令处理函数（无参，返回任意）。 */
export type CommandHandler = () => unknown;

/** 运行时变量容器（BoxedVar 兼容：有可读写 value）。 */
export interface RuntimeVarLike {
  value: unknown;
}

export class DevToolsApi {
  /** 命令名 → 处理器（静态共享）。 */
  static readonly cmdHandlers = new Map<string, CommandHandler>();
  /** 变量名 → 容器（静态共享）。 */
  static readonly runtimeVars = new Map<string, RuntimeVarLike>();

  /**
   * 取得（或创建）window.r 公共命名空间。
   * 孪生：`window.r = window.r || Object.create(null)`。
   */
  static getPublicNamespace(): Record<string, any> {
    return ((window as any).r = (window as any).r || Object.create(null));
  }

  /**
   * 注册命令：在公共命名空间上 defineProperty get → 调用 handler()。
   * 已存在同名键则 console.error 并跳过。
   */
  static registerCommand(name: string, handler: CommandHandler): void {
    const ns = this.getPublicNamespace();
    if (ns[name]) {
      console.error(`Command ${name} is already registered`);
    } else {
      this.cmdHandlers.set(name, handler);
      Object.defineProperty(ns, name, { configurable: true, get: () => this.cmdHandlers.get(name)!() });
    }
  }

  /** 注销命令：删除 Map 项并 delete 公共键；未注册则 console.error。 */
  static unregisterCommand(name: string): void {
    if (this.cmdHandlers.has(name)) {
      this.cmdHandlers.delete(name);
      const ns = this.getPublicNamespace();
      delete ns[name];
    } else console.error(`Command ${name} is not registered`);
  }

  /**
   * 注册运行时变量：公共键 get → var.value、set → var.value = v。
   * 已存在同名键则 console.error 并跳过。
   */
  static registerVar(name: string, variable: RuntimeVarLike): void {
    const ns = this.getPublicNamespace();
    if (ns[name]) {
      console.error(`Runtime variable ${name} is already registered`);
    } else {
      this.runtimeVars.set(name, variable);
      Object.defineProperty(ns, name, {
        configurable: true,
        get: () => this.runtimeVars.get(name)!.value,
        set: (v) => {
          this.runtimeVars.get(name)!.value = v;
        },
      });
    }
  }

  /** 注销运行时变量：删除 Map 项并 delete 公共键；未注册则 console.error。 */
  static unregisterVar(name: string): void {
    if (this.runtimeVars.has(name)) {
      this.runtimeVars.delete(name);
      const ns = this.getPublicNamespace();
      delete ns[name];
    } else console.error(`Runtime variable ${name} is not registered`);
  }

  /** 已注册变量名迭代器。 */
  static listVars(): IterableIterator<string> {
    return this.runtimeVars.keys();
  }

  /** 已注册命令名迭代器。 */
  static listCommands(): IterableIterator<string> {
    return this.cmdHandlers.keys();
  }
}
