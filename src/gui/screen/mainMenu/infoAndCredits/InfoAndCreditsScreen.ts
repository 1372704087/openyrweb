/**
 * InfoAndCreditsScreen — 信息与制作人员入口页。
 *
 * 侧栏按配置动态拼：PatchNotes / ReportBug / Donate / Credits / Back。
 * ReportBug 经 messageBoxApi 弹层；Donate 开新窗并打 gtag。
 *
 * 由 gui/screen/mainMenu/infoAndCredits/InfoAndCreditsScreen.ts.js
 * 重写为 TS（行为完全一致）。
 * 两个文件并存期间，本文件才是修改目标。
 */
import React from "react"; // 孪生（react 外部依赖）
import { ReportBug } from "gui/screen/mainMenu/main/ReportBug"; // 孪生（本组内一并转换）
import { MainMenuScreen } from "gui/screen/mainMenu/MainMenuScreen"; // 孪生（本组内一并转换）
import { ScreenType } from "gui/screen/mainMenu/ScreenType"; // 孪生（本组内一并转换）

/* eslint-disable @typescript-eslint/no-explicit-any */

export class InfoAndCreditsScreen extends MainMenuScreen {
  /** i18n 字典。 */
  strings: any;
  /** 配置（discordUrl/donateUrl 等）。 */
  config: any;
  /** 消息框 API。 */
  messageBoxApi: any;

  constructor(strings: any, config: any, messageBoxApi: any) {
    super();
    this.strings = strings;
    this.config = config;
    this.messageBoxApi = messageBoxApi;
    this.title = this.strings.get("TS:InfoAndCredits");
  }

  onEnter(): void {
    let s = this.strings;
    const discordUrl = this.config.discordUrl;
    const donateUrl = this.config.donateUrl;
    this.controller.setSidebarButtons([
      ...(this.controller.hasScreen(ScreenType.PatchNotes)
        ? [
            {
              label: s.get("TS:PatchNotes"),
              tooltip: s.get("STT:PatchNotes"),
              onClick: () => {
                this.controller?.pushScreen(ScreenType.PatchNotes);
              },
            },
          ]
        : []),
      ...(discordUrl
        ? [
            {
              label: s.get("TS:ReportBug"),
              tooltip: s.get("TS:ReportBugTT"),
              onClick: () => {
                this.messageBoxApi.show(
                  React.createElement(ReportBug, {
                    discordUrl,
                    strings: this.strings,
                  }),
                  this.strings.get("GUI:OK"),
                );
              },
            },
          ]
        : []),
      ...(donateUrl
        ? [
            {
              label: s.get("TS:Donate"),
              onClick: () => {
                window.open(donateUrl, "_blank");
                (window as any).gtag?.("event", "donate_click");
              },
            },
          ]
        : []),
      {
        label: s.get("GUI:ViewCredits"),
        onClick: () => {
          this.controller?.pushScreen(ScreenType.Credits);
        },
      },
      {
        label: this.strings.get("GUI:Back"),
        isBottom: true,
        onClick: () => {
          this.controller?.leaveCurrentScreen();
        },
      },
    ]);
    this.controller.showSidebarButtons();
    this.controller.toggleMainVideo(true);
    this.controller.setMainComponent();
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
