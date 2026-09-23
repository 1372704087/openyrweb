/**
 * MainMenuController — 主菜单屏幕栈控制器。
 *
 * push/pop 时同步 sidebar title/背景/音乐；show/hide 按钮带滑入滑出音效。
 * hideSidebarButtons 在折叠时返回 undefined（孪生无 return）。
 *
 * 由 gui/screen/mainMenu/MainMenuController.ts.js 重写为 TS。
 * 两个文件并存期间，本文件才是修改目标。
 */
import { Controller } from "gui/screen/Controller"; // 孪生（本组内一并转换）
import { SoundKey } from "engine/sound/SoundKey"; // 已转换
import { ChannelType } from "engine/sound/ChannelType"; // 已转换

/* eslint-disable @typescript-eslint/no-explicit-any */

export class MainMenuController extends Controller {
  /** 主菜单 UI。 */
  mainMenu: any;
  /** 音效。 */
  sound: any;
  /** 音乐。 */
  music: any;

  constructor(mainMenu: any, sound: any, music: any) {
    super();
    this.mainMenu = mainMenu;
    this.sound = sound;
    this.music = music;
  }

  async goToScreenBlocking(...args: any[]): Promise<void> {
    var [type, params] = args;
    return super.goToScreenBlocking(type, params);
  }

  goToScreen(...args: any[]): void {
    var [type, params] = args;
    return super.goToScreen(type, params);
  }

  async pushScreen(...args: any[]): Promise<void> {
    var [type, params] = args;
    this.setMainComponent();
    this.mainMenu.setSidebarTitle("");
    await super.pushScreen(type, params);
    let screen = this.screens.get(type);
    if (screen.title) this.mainMenu.setSidebarTitle(screen.title);
    if (screen.backgroundImageName)
      this.mainMenu.setBackgroundImageName(screen.backgroundImageName);
    if (void 0 !== screen.musicType) await this.music?.play(screen.musicType);
  }

  async popScreen(reason?: any): Promise<void> {
    this.setMainComponent();
    this.mainMenu.setSidebarTitle("");
    await super.popScreen(reason);
    var screen = this.getCurrentScreen();
    if (screen?.title) this.mainMenu.setSidebarTitle(screen.title);
    if (screen?.backgroundImageName)
      this.mainMenu.setBackgroundImageName(screen.backgroundImageName);
  }

  setSidebarButtons(buttons: any, mpEnabled = false): void {
    this.mainMenu.setButtons(buttons, mpEnabled);
  }

  showSidebarButtons(): void {
    if (this.mainMenu.isSidebarCollapsed()) {
      this.sound.play(SoundKey.GUIMoveInSound, ChannelType.Ui);
      this.mainMenu.showButtons();
    }
  }

  setSidebarMpContent(content: any): void {
    this.mainMenu.setSidebarMpContent(content);
  }

  /** 折叠时返回 undefined（贴孪生）。 */
  hideSidebarButtons(): Promise<void> | undefined {
    if (!this.mainMenu.isSidebarCollapsed()) {
      this.sound.play(SoundKey.GUIMoveOutSound, ChannelType.Ui);
      return new Promise((resolve) => {
        let unsub = () => {
          this.mainMenu.onSidebarToggle.unsubscribe(unsub);
          resolve();
        };
        this.mainMenu.onSidebarToggle.subscribe(unsub);
        this.mainMenu.hideButtons();
      });
    }
  }

  toggleSidebarPreview(open: boolean): void {
    this.mainMenu.toggleSidebarPreview(open);
  }

  setSidebarPreview(view?: any): void {
    this.mainMenu.setSidebarPreview(view);
  }

  getSidebarPreviewSize() {
    return this.mainMenu.getSidebarPreviewSize();
  }

  toggleMainVideo(visible: boolean): void {
    this.mainMenu.toggleVideo(visible);
  }

  showVersion(value: any): void {
    this.mainMenu.showVersion(value);
  }

  hideVersion(): void {
    this.mainMenu.hideVersion();
  }

  setMainComponent(view?: any): void {
    this.mainMenu.setContentComponent(view);
  }

  destroy(): void {
    this.setMainComponent(void 0);
    super.destroy();
  }
}
