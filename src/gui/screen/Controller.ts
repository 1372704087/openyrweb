/**
 * Controller — 屏幕栈控制器。
 *
 * screens: ScreenType → 实例；screenStack: 自底向上的屏幕栈；
 * onScreenChange: 进栈时 dispatch(type)，出栈到底时 dispatch(undefined)。
 * goToScreen 先排空栈再 push；destroy 解绑全部控制器引用。
 *
 * 由 gui/screen/Controller.ts.js 重写为 TS（行为完全一致）。
 * 两个文件并存期间，本文件才是修改目标：tools/repack.mjs 打包时优先
 * 采用 .ts 模块的编译产物。
 */
import { EventDispatcher } from "util/event"; // 已转换

/* eslint-disable @typescript-eslint/no-explicit-any */

export class Controller {
  /** 已注册屏幕：类型 → 实例。 */
  readonly screens = new Map<any, any>();
  /** 当前屏幕栈（底 → 顶）。 */
  readonly screenStack: any[] = [];
  private readonly _onScreenChange = new EventDispatcher();

  /** 屏幕切换事件（栈顶变化时触发）。 */
  get onScreenChange() {
    return this._onScreenChange.asEvent();
  }

  /** 注册屏幕并挂上本控制器。 */
  addScreen(type: any, screen: any): void {
    this.screens.set(type, screen);
    screen.setController(this);
  }

  /** 是否已注册该类型屏幕。 */
  hasScreen(type: any): boolean {
    return this.screens.has(type);
  }

  /** 离开当前栈顶屏幕。 */
  async leaveCurrentScreen(): Promise<void> {
    await this.popScreen();
  }

  /** 阻塞跳转：排空栈后压入目标屏。 */
  async goToScreenBlocking(type: any, params?: any): Promise<void> {
    for (; this.screenStack.length; ) await this.leaveCurrentScreen();
    await this.pushScreen(type, params);
  }

  /** 非阻塞跳转（不 await 孪生行为）。 */
  goToScreen(type: any, params?: any): void {
    this.goToScreenBlocking(type, params);
  }

  /** 压栈：先通知旧顶 onStack，再 dispatch 并 onEnter。 */
  async pushScreen(type: any, params?: any): Promise<void> {
    let screen = this.screens.get(type);
    if (!screen) throw new Error("Invalid screen type " + type);
    this.screenStack.length &&
      (await this.screenStack[this.screenStack.length - 1].onStack?.());
    this.screenStack.push(screen);
    this._onScreenChange.dispatch(this, type);
    screen.onEnter(params);
  }

  /** 弹栈：onLeave + dispatch(undefined)，再通知新顶 onUnstack。 */
  async popScreen(reason?: any): Promise<void> {
    this.screenStack.length &&
      (await this.screenStack.pop().onLeave(),
        this._onScreenChange.dispatch(this, void 0));
    this.screenStack.length &&
      this.screenStack[this.screenStack.length - 1].onUnstack?.(reason);
  }

  /** 视口变化时转发到当前栈顶。 */
  rerenderCurrentScreen(): void {
    this.screenStack.length &&
      this.screenStack[this.screenStack.length - 1].onViewportChange?.();
  }

  /** 当前栈顶屏幕（空栈为 undefined）。 */
  getCurrentScreen(): any {
    return this.screenStack.length
      ? this.screenStack[this.screenStack.length - 1]
      : void 0;
  }

  /** 解绑全部屏幕控制器引用并清空注册表/栈。 */
  destroy(): void {
    for (var screen of this.screens.values()) screen.setController(void 0);
    this.screens.clear();
    this.screenStack.length = 0;
  }
}
