/**
 * BattleControlApi — 世界交互控制门面（平移/键盘/开关监听）。
 *
 * 私有字段与孪生 WeakMap 对齐：toggles=监听器 Set、world=当前世界引用。
 * world 经 _setWorldInteraction 写入；requestPan/cancelPan/executeKeyCommand/
 * applyKeyModifiers 全部走可选链转发，未绑定世界时为 no-op。
 *
 * 由 BattleControlApi.ts.js 重写为 TS（行为完全一致）。两个文件并存期间，
 * 本文件才是修改目标：tools/repack.mjs 打包时优先采用 .ts 模块的编译产物。
 */

/** 可注入的自定义滚动处理（鸭子类型，与 world 对齐）。 */
export interface CustomScrollHandlerLike {
  /** 按世界坐标发起滚动平移。 */
  requestScroll(target: any): void;
  /** 取消进行中的平移。 */
  cancel(): void;
}

/** 可注入的键盘处理（鸭子类型）。 */
export interface KeyboardHandlerLike {
  /** 执行具名键盘命令。 */
  executeCommand(command: string): void;
}

/** 世界对象的最小接口：仅 BattleControlApi 实际触达的成员。 */
export interface WorldLike {
  customScrollHandler?: CustomScrollHandlerLike;
  keyboardHandler?: KeyboardHandlerLike;
  /** 应用键盘修饰键状态（可选）。 */
  applyKeyModifiers?(modifiers: unknown): void;
}

/** 开关变化监听：enabled=true 表示允许世界交互。 */
export type ToggleListener = (enabled: boolean) => void;

export class BattleControlApi {
  /** 全部开关监听器（与孪生 WeakMap i 等价的私有 Set）。 */
  private readonly toggles = new Set<ToggleListener>();
  /** 当前世界引用（与孪生 WeakMap r 等价；未绑定时转发均为 no-op）。 */
  private world?: WorldLike;

  /**
   * 内部：写入世界交互目标（孪生 _setWorldInteraction 仅赋值 r 字段，
   * 不广播；名字保留贴孪生）。
   */
  private _setWorldInteraction(world: WorldLike | undefined): void {
    this.world = world;
  }

  /** 内部：向所有监听器广播（单个抛错被捕获并 console.error）。 */
  private _notifyToggle(enabled: boolean): void {
    for (const listener of this.toggles) {
      try {
        listener(enabled);
      } catch (e) {
        console.error(e);
      }
    }
  }

  /**
   * 订阅世界交互开关变化。
   * @param listener - 开关回调
   * @returns 取消订阅函数
   */
  onToggle(listener: ToggleListener): () => void {
    this.toggles.add(listener);
    return () => {
      this.toggles.delete(listener);
    };
  }

  /** 按世界坐标请求平移滚动（未绑定世界时 no-op）。 */
  requestPan(x: number, y: number): void {
    // 孪生构造 THREE.Vector2 后交给 customScrollHandler.requestScroll。
    const target = new (THREE as any).Vector2(x, y);
    this.world?.customScrollHandler?.requestScroll(target);
  }

  /** 取消进行中的平移。 */
  cancelPan(): void {
    this.world?.customScrollHandler?.cancel();
  }

  /** 执行具名键盘命令。 */
  executeKeyCommand(command: string): void {
    this.world?.keyboardHandler?.executeCommand(command);
  }

  /** 应用键盘修饰键（透传给世界；孪生为 world?.applyKeyModifiers(e)）。 */
  applyKeyModifiers(modifiers: unknown): void {
    this.world?.applyKeyModifiers?.(modifiers);
  }
}

// 模块内私有辅助挂到类上无意义——孪生把 _setWorldInteraction/_notifyToggle
// 放在类体；TS 中以 private 方法保留。对外不导出二者（与孪生一致）。
// 为满足「方法存在且可被类内调用」，将它们声明为类成员（见上）。

declare const THREE: any;
