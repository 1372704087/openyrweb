/**
 * GameMenuHomeScreen — 游戏内暂停菜单主页（选项/全屏/中止/继续）。
 *
 * 由 gui/screen/game/gameMenu/GameMenuHomeScreen.ts.js
 * 重写为 TS（行为完全一致）。
 */
import { ScreenType } from "gui/screen/game/gameMenu/ScreenType"; // 已转换
import * as FullScreenModule from "gui/FullScreen"; // 孪生
import { getHumanReadableKey } from "gui/screen/options/component/getHumanReadableKey"; // 已转换
import { GameMenuScreen } from "gui/screen/game/GameMenuScreen"; // 已转换

/* eslint-disable @typescript-eslint/no-explicit-any */

// 孪生 any-shim
const FullScreen: any = FullScreenModule as any;

/** 菜单主页。 */
export class GameMenuHomeScreen extends GameMenuScreen {
  /** 字符串。 */
  strings: any;
  /** 全屏。 */
  fullScreen: any;
  /** 进入参数。 */
  params: any;

  /**
   * @param strings 字符串
   * @param fullScreen 全屏
   */
  constructor(strings: any, fullScreen: any) {
    super();
    this.strings = strings;
    this.fullScreen = fullScreen;
  }

  /**
   * 进入：显示内容区并建按钮。
   * @param params 含 onCancel 等
   */
  onEnter(params: any): void {
    this.params = params;
    this.controller.toggleContentAreaVisibility(true);
    this.initView(params);
  }

  /**
   * 构建侧栏按钮。
   * @param params 进入参数
   */
  initView(params: any): void {
    const t = this.strings;
    const buttons = [
      {
        label: t.get("GUI:Options"),
        onClick: () => {
          this.controller?.pushScreen(ScreenType.Options);
        },
      },
      {
        label: t.get("GUI:Fullscreen", getHumanReadableKey(FullScreen.hotKey)),
        tooltip: t.get("STT:Fullscreen"),
        disabled: !this.fullScreen.isAvailable(),
        onClick: () => this.fullScreen.toggle(),
      },
      {
        label: t.get("GUI:AbortMission"),
        onClick: () => {
          this.controller?.pushScreen(ScreenType.QuitConfirm, this.params);
        },
      },
      { label: t.get("GUI:ResumeMission"), isBottom: true, onClick: params.onCancel },
    ];
    this.controller.setSidebarButtons(buttons);
    this.controller.showSidebarButtons();
  }

  /** 离开：隐藏侧栏与内容区。 */
  async onLeave(): Promise<void> {
    this.controller.hideSidebarButtons();
    this.controller.toggleContentAreaVisibility(false);
  }

  /** 被上层压栈时隐藏侧栏。 */
  async onStack(): Promise<void> {
    this.controller.hideSidebarButtons();
  }

  /** 出栈回来时重建按钮。 */
  onUnstack(): void {
    this.initView(this.params);
  }
}
