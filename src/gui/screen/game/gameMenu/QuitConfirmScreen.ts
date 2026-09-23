/**
 * QuitConfirmScreen — 退出/观察确认侧栏菜单屏。
 *
 * 由 gui/screen/game/gameMenu/QuitConfirmScreen.ts.js
 * 重写为 TS（行为完全一致）。
 *
 * 两个文件并存期间，本文件才是修改目标：tools/repack.mjs 打包时优先采用 .ts 模块的编译产物。
 */
import { GameMenuScreen } from "gui/screen/game/GameMenuScreen"; // 已转换

/* eslint-disable @typescript-eslint/no-explicit-any */

/** 退出确认屏。 */
export class QuitConfirmScreen extends GameMenuScreen {
  /** 字符串表。 */
  strings: any;

  /**
   * @param strings 字符串表
   */
  constructor(strings: any) {
    super();
    this.strings = strings;
  }

  /**
   * 进入屏：初始化侧栏按钮。
   * @param params 含 onQuit/onObserve/onCancel/observeAllowed
   */
  onEnter(params: any): void {
    this.initView(params);
  }

  /**
   * 构建 Quit / Observe? / ResumeMission 按钮。
   * @param params 回调与 observeAllowed
   */
  initView(params: any): void {
    const t = this.strings;
    const buttons = [
      { label: t.get("GUI:Quit"), onClick: params.onQuit },
      ...(params.observeAllowed
        ? [{ label: t.get("GUI:Observe"), onClick: params.onObserve }]
        : []),
      { label: t.get("GUI:ResumeMission"), isBottom: true, onClick: params.onCancel },
    ];
    this.controller.setSidebarButtons(buttons);
    this.controller.showSidebarButtons();
  }

  /** 离开时隐藏侧栏按钮。 */
  async onLeave(): Promise<void> {
    this.controller.hideSidebarButtons();
  }
}
