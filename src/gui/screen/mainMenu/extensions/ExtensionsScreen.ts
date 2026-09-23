/**
 * ExtensionsScreen — 源码内置扩展管理页。
 *
 * 进入时快照 ExtensionHost JSON；离开时若有变更写 LocalPrefs.Extensions。
 *
 * 由 gui/screen/mainMenu/extensions/ExtensionsScreen.ts.js 重写为 TS。
 * 两个文件并存期间，本文件才是修改目标。
 */
import { jsx } from "gui/jsx/jsx"; // 孪生
import { MainMenuScreen } from "gui/screen/mainMenu/MainMenuScreen"; // 孪生（本组内一并转换）
import { HtmlView } from "gui/jsx/HtmlView"; // 孪生
import { ExtensionsOpts } from "gui/screen/mainMenu/extensions/component/ExtensionsOpts"; // 孪生（本组内一并转换）
import { StorageKey } from "LocalPrefs"; // 已转换
import { ExtensionHost } from "extensions/ExtensionHost"; // 已转换

/* eslint-disable @typescript-eslint/no-explicit-any */

export class ExtensionsScreen extends MainMenuScreen {
  /** i18n 字典。 */
  strings: any;
  /** JSX 渲染器。 */
  jsxRenderer: any;
  /** 本地偏好存储。 */
  localPrefs: any;
  /** 进入时的配置 JSON 基线。 */
  initialConfigJson?: string;

  constructor(strings: any, jsxRenderer: any, localPrefs: any) {
    super();
    this.strings = strings;
    this.jsxRenderer = jsxRenderer;
    this.localPrefs = localPrefs;
    this.title = this.strings.get("TS:Extensions");
  }

  onEnter(): void {
    this.initialConfigJson = ExtensionHost.getConfig().toJson();
    this.controller.toggleMainVideo(false);
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
    var [el] = this.jsxRenderer.render(
      jsx(HtmlView as any, {
        width: "100%",
        height: "100%",
        component: ExtensionsOpts,
        props: { strings: this.strings },
      }),
    );
    this.controller.setMainComponent(el);
  }

  async onLeave(): Promise<void> {
    var json = ExtensionHost.getConfig().toJson();
    if (json !== this.initialConfigJson)
      this.localPrefs?.setItem(StorageKey.Extensions, json);
    await this.controller.hideSidebarButtons();
  }

  async onStack(): Promise<void> {
    await this.onLeave();
  }

  onUnstack(): void {
    this.onEnter();
  }
}
