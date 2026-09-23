/**
 * PatchNotesScreen — 更新日志页（iframe + 返回按钮）。
 *
 * 由 gui/screen/mainMenu/patchNotes/PatchNotesScreen.ts.js 重写为 TS。
 * 两个文件并存期间，本文件才是修改目标。
 */
import { jsx } from "gui/jsx/jsx"; // 孪生
import { HtmlView } from "gui/jsx/HtmlView"; // 孪生
import { Iframe } from "gui/screen/mainMenu/component/Iframe"; // 孪生（本组内一并转换）
import { MainMenuScreen } from "gui/screen/mainMenu/MainMenuScreen"; // 孪生（本组内一并转换）

/* eslint-disable @typescript-eslint/no-explicit-any */

export class PatchNotesScreen extends MainMenuScreen {
  /** i18n 字典。 */
  strings: any;
  /** JSX 渲染器。 */
  jsxRenderer: any;
  /** 更新日志 URL。 */
  patchNotesUrl: any;

  constructor(strings: any, jsxRenderer: any, patchNotesUrl: any) {
    super();
    this.strings = strings;
    this.jsxRenderer = jsxRenderer;
    this.patchNotesUrl = patchNotesUrl;
    this.title = this.strings.get("TS:PatchNotes");
  }

  onEnter(): void {
    this.controller.setSidebarButtons([
      {
        label: this.strings.get("GUI:Back"),
        isBottom: true,
        onClick: () => {
          this.controller?.leaveCurrentScreen();
        },
      },
    ]);
    this.controller.showSidebarButtons();
    this.controller.toggleMainVideo(false);
    var [el] = this.jsxRenderer.render(
      jsx(HtmlView as any, {
        width: "100%",
        height: "100%",
        component: Iframe,
        props: { src: this.patchNotesUrl, className: "patch-notes" },
      }),
    );
    this.controller.setMainComponent(el);
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
