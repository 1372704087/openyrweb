/**
 * GameMenuController — 游戏内菜单栈控制器（侧栏按钮 + 内容区）。
 *
 * 由 gui/screen/game/gameMenu/GameMenuController.ts.js
 * 重写为 TS（行为完全一致）。
 *
 * 两个文件并存期间，本文件才是修改目标：tools/repack.mjs 打包时优先采用 .ts 模块的编译产物。
 */
import { Controller } from "gui/screen/Controller"; // 已转换

/* eslint-disable @typescript-eslint/no-explicit-any */

/** 游戏菜单控制器。 */
export class GameMenuController extends Controller {
  /** HUD 引用。 */
  hud: any;
  /** 内容区是否可见。 */
  contentAreaVisible = false;
  /** 当前侧栏按钮组。 */
  sidebarButtons: any;
  /** 当前主内容组件。 */
  mainContentComponent: any;

  /**
   * @param hud HUD
   */
  constructor(hud: any) {
    super();
    this.hud = hud;
    this.contentAreaVisible = false;
  }

  /**
   * 阻塞切屏（转发父类）。
   * @param args 屏参数
   */
  async goToScreenBlocking(...args: any[]): Promise<any> {
    const [type, params] = args;
    return super.goToScreenBlocking(type, params);
  }

  /**
   * 切屏。
   * @param args 屏参数
   */
  goToScreen(...args: any[]): any {
    const [type, params] = args;
    return super.goToScreen(type, params);
  }

  /**
   * 入栈切屏。
   * @param args 屏参数
   */
  async pushScreen(...args: any[]): Promise<void> {
    const [type, params] = args;
    this.setMainComponent();
    await super.pushScreen(type, params);
  }

  /**
   * 出栈。
   * @param e 参数
   */
  async popScreen(e?: any): Promise<void> {
    this.setMainComponent();
    await super.popScreen(e);
  }

  /** 清空整栈。 */
  async close(): Promise<void> {
    while (this.screenStack.length) await this.popScreen();
  }

  /**
   * 设置 HUD。
   * @param hud HUD
   */
  setHud(hud: any): void {
    this.hud = hud;
  }

  /**
   * 设置侧栏按钮组（未显示）。
   * @param buttons 按钮
   */
  setSidebarButtons(buttons: any): void {
    this.sidebarButtons = buttons;
  }

  /** 显示侧栏按钮（须先 set）。 */
  showSidebarButtons(): void {
    if (this.sidebarButtons === void 0) {
      throw new Error("Sidebar buttons should be set first");
    }
    this.hud.showSidebarMenu(this.sidebarButtons);
  }

  /** 隐藏侧栏按钮。 */
  hideSidebarButtons(): void {
    this.sidebarButtons = void 0;
    this.hud.hideSidebarMenu();
  }

  /**
   * 设置主内容组件（可空=清空）。
   * @param component 组件
   */
  setMainComponent(component?: any): void {
    this.mainContentComponent = component;
    this.hud.setMenuContentComponent(this.mainContentComponent);
  }

  /**
   * 切换内容区可见性。
   * @param visible 是否可见
   */
  toggleContentAreaVisibility(visible: boolean): void {
    this.contentAreaVisible = visible;
    this.hud.toggleMenuContentVisibility(visible);
  }

  /** 父类重渲染后同步侧栏与内容区。 */
  rerenderCurrentScreen(): void {
    super.rerenderCurrentScreen();
    if (this.sidebarButtons) this.hud.showSidebarMenu(this.sidebarButtons);
    this.hud.setMenuContentComponent(this.mainContentComponent);
    this.hud.toggleMenuContentVisibility(this.contentAreaVisible);
  }

  /** 销毁时清内容。 */
  destroy(): void {
    super.destroy();
    this.setMainComponent(void 0);
  }
}
