/**
 * SinglePlayerScreen — 单人入口（战役暂屏蔽，仅遭遇战 + 返回）。
 *
 * musicType = Intro；Campaign 按钮在孪生中已注释移除。
 *
 * 由 gui/screen/mainMenu/main/SinglePlayerScreen.ts.js 重写为 TS。
 * 两个文件并存期间，本文件才是修改目标。
 */
import { ScreenType } from "gui/screen/mainMenu/ScreenType"; // 孪生（本组内一并转换）
import { MusicType } from "engine/sound/Music"; // 已转换
import { MainMenuScreen } from "gui/screen/mainMenu/MainMenuScreen"; // 孪生（本组内一并转换）

/* eslint-disable @typescript-eslint/no-explicit-any */

export class SinglePlayerScreen extends MainMenuScreen {
  /** i18n 字典。 */
  strings: any;
  /** 背景音乐类型。 */
  musicType?: any;

  constructor(strings: any) {
    super();
    this.strings = strings;
    this.title = this.strings.get("GUI:SinglePlayer");
    this.musicType = MusicType.Intro;
  }

  onEnter(): void {
    let s = this.strings;
    this.controller.setSidebarButtons([
      // 战役入口暂屏蔽（战役功能尚未完善）
      // {
      //   label: s.get("GUI:Campaign"),
      //   tooltip: s.get("STT:Campaign"),
      //   onClick: () => {
      //     this.controller?.goToScreen(ScreenType.Campaign);
      //   },
      // },
      {
        label: s.get("GUI:SkirmishGame"),
        tooltip: s.get("STT:Demo"),
        onClick: () => {
          this.controller?.goToScreen(ScreenType.Skirmish);
        },
      },
      {
        label: s.get("GUI:Back"),
        isBottom: true,
        onClick: () => {
          this.controller?.goToScreen(ScreenType.Home);
        },
      },
    ]);
    this.controller.toggleMainVideo(true);
    this.controller.showSidebarButtons();
  }

  async onLeave(): Promise<void> {
    await this.controller.hideSidebarButtons();
  }

  async onStack(): Promise<void> {
    await this.onLeave();
  }

  onUnstack(): void {
    this.onEnter();
  }
}
