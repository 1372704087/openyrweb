/**
 * CreditsScreen — 制作人员滚动页（读 credits.txt + creditscd.txt）。
 *
 * 用 creditscd 替换 credits 中的 {CRD:CREDITS} 占位后交给 Credits 组件渲染。
 *
 * 由 gui/screen/mainMenu/credits/CreditsScreen.ts.js 重写为 TS。
 * 两个文件并存期间，本文件才是修改目标。
 */
import { jsx } from "gui/jsx/jsx"; // 孪生
import { HtmlView } from "gui/jsx/HtmlView"; // 孪生
import { Credits } from "gui/screen/mainMenu/credits/Credits"; // 孪生（本组内一并转换）
import { Engine } from "engine/Engine"; // 已转换
import { MainMenuScreen } from "gui/screen/mainMenu/MainMenuScreen"; // 孪生（本组内一并转换）

/* eslint-disable @typescript-eslint/no-explicit-any */

export class CreditsScreen extends MainMenuScreen {
  /** i18n 字典。 */
  strings: any;
  /** JSX 渲染器。 */
  jsxRenderer: any;

  constructor(strings: any, jsxRenderer: any) {
    super();
    this.strings = strings;
    this.jsxRenderer = jsxRenderer;
    this.title = this.strings.get("GUI:Credits");
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
    var cd =
      Engine.vfs?.openFile("creditscd.txt").readAsString("utf-8") ?? "";
    let base = Engine.vfs?.openFile("credits.txt").readAsString() ?? "";
    var tpl = base.replace(/\s+\{CRD:CREDITS\}\s+/, cd);
    var [el] = this.jsxRenderer.render(
      jsx(HtmlView as any, {
        width: "100%",
        height: "100%",
        component: Credits,
        props: { contentTpl: tpl, strings: this.strings },
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
