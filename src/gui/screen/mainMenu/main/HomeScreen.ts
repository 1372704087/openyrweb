/**
 * HomeScreen — 主菜单主页侧栏。
 *
 * CustomMatch→Login；SinglePlayer/Replays/Extensions/Options/PatchNotes；
 * 底部全屏切换。musicType=Intro；显示版本号。
 *
 * 由 gui/screen/mainMenu/main/HomeScreen.ts.js 重写为 TS。
 * 两个文件并存期间，本文件才是修改目标。
 */
import { ScreenType } from "gui/screen/mainMenu/ScreenType"; // 孪生（本组内一并转换）
import { FullScreen } from "gui/FullScreen"; // 已转换
import { MusicType } from "engine/sound/Music"; // 已转换
import { getHumanReadableKey } from "gui/screen/options/component/getHumanReadableKey"; // 孪生（本组内一并转换）
import type { MessageBoxApi } from "gui/component/MessageBoxApi"; // 已转换（仅类型）
import { MainMenuScreen } from "gui/screen/mainMenu/MainMenuScreen"; // 孪生（本组内一并转换）
import { MainMenuRoute } from "gui/screen/mainMenu/MainMenuRoute"; // 孪生（本组内一并转换）

/* eslint-disable @typescript-eslint/no-explicit-any */

export class HomeScreen extends MainMenuScreen {
  /** i18n 字典。 */
  strings: any;
  /** 全屏管理。 */
  fullScreen: any;
  /** 应用版本。 */
  appVersion: any;
  /** 消息框 API。 */
  messageBoxApi: MessageBoxApi | any;
  /** 背景音乐类型。 */
  musicType?: any;

  constructor(
    strings: any,
    fullScreen: any,
    appVersion: any,
    _storageEnabled: any,
    _quickMatchEnabled: any,
    mb: any,
  ) {
    super();
    this.strings = strings;
    this.fullScreen = fullScreen;
    this.appVersion = appVersion;
    // r = storageEnabled（保留位以兼容 Gui.ts.js 调用，但 Mods 入口已移除）
    // s = quickMatchEnabled（保留位以兼容 Gui.ts.js 调用，但 Quick Match 入口已移除）
    this.messageBoxApi = mb;
    this.title = this.strings.get("GUI:MainMenu");
    this.musicType = MusicType.Intro;
  }

  onEnter(): void {
    let s = this.strings;
    this.controller.setSidebarButtons([
      {
        // 多人大廳：登录 → 大厅（连接 WoL 服务器，进 Login/CustomGame 流程）
        label: s.get("GUI:CustomMatch"),
        tooltip: s.get("TS:MultiLobbyTip"),
        onClick: () => {
          this.controller?.goToScreen(ScreenType.Login, {
            afterLogin: (messages: any) =>
              new MainMenuRoute(ScreenType.CustomGame, { messages }),
          });
        },
      },
      {
        // 单机模式：进入单机大厅（战役 + 遭遇战）
        label: s.get("GUI:SinglePlayer"),
        tooltip: s.get("STT:SinglePlayer"),
        onClick: () => {
          this.controller?.goToScreen(ScreenType.SinglePlayer);
        },
      },
      {
        label: s.get("GUI:Replays"),
        tooltip: s.get("STT:Replays"),
        onClick: () => {
          this.controller?.pushScreen(ScreenType.ReplaySelection);
        },
      },
      {
        label: s.get("TS:Extensions"),
        tooltip: s.get("STT:Extensions"),
        onClick: () => {
          this.controller?.pushScreen(ScreenType.Extensions);
        },
      },
      {
        label: s.get("GUI:Options"),
        tooltip: s.get("STT:MainButtonOptions"),
        onClick: () => {
          this.controller?.pushScreen(ScreenType.Options);
        },
      },
      {
        label: s.get("TS:PatchNotes"),
        tooltip: s.get("STT:PatchNotes"),
        onClick: () => {
          this.controller?.pushScreen(ScreenType.PatchNotes);
        },
      },
      {
        label: s.get(
          "GUI:Fullscreen",
          getHumanReadableKey((FullScreen as any).hotKey),
        ),
        tooltip: s.get("STT:Fullscreen"),
        isBottom: true,
        disabled: !this.fullScreen.isAvailable(),
        onClick: () => this.fullScreen.toggle(),
      },
    ]);
    this.controller.showSidebarButtons();
    this.controller.toggleMainVideo(true);
    this.controller.showVersion(this.appVersion);
  }

  async onLeave(): Promise<void> {
    this.controller.hideVersion();
    await this.controller.hideSidebarButtons();
  }

  async onStack(): Promise<void> {
    await this.onLeave();
  }

  onUnstack(): void {
    this.onEnter();
  }
}
