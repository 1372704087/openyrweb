/**
 * KeyboardScreen — 键盘设置屏（KeyOpts + 离开时脏检查保存）。
 *
 * 由 gui/screen/options/KeyboardScreen.ts.js 重写为 TS。
 * 两个文件并存期间，本文件才是修改目标。
 */
import { jsx } from "gui/jsx/jsx"; // 孪生
import { HtmlView } from "gui/jsx/HtmlView"; // 孪生
import { KeyOpts } from "gui/screen/options/component/KeyOpts"; // 孪生（本组内一并转换）

/* eslint-disable @typescript-eslint/no-explicit-any */

export class KeyboardScreen {
  /** i18n 字典。 */
  strings: any;
  /** JSX 渲染器。 */
  jsxRenderer: any;
  /** 键位绑定。 */
  keyBinds: any;
  /** 侧栏标题。 */
  title: any;
  /** 控制器。 */
  controller?: any;
  /** 是否有未保存变更。 */
  isDirty?: boolean;

  constructor(strings: any, jsxRenderer: any, keyBinds: any) {
    this.strings = strings;
    this.jsxRenderer = jsxRenderer;
    this.keyBinds = keyBinds;
    this.title = this.strings.get("GUI:KeyboardOptions");
  }

  setController(controller: any): void {
    this.controller = controller;
  }

  onEnter(): void {
    this.isDirty = false;
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
        component: KeyOpts,
        props: {
          keyBinds: this.keyBinds,
          strings: this.strings,
          onHotKeyChange: (cmd: any, combo: any) => {
            this.keyBinds.changeHotKey(cmd, combo);
            this.isDirty = true;
          },
          onResetAll: async () => {
            try {
              await this.keyBinds.resetAndReload();
            } catch (e) {
              console.error(e);
            }
          },
        },
      }),
    );
    this.controller.setMainComponent(el);
  }

  async onLeave(): Promise<void> {
    await this.controller.hideSidebarButtons();
    if (this.isDirty) {
      this.isDirty = false;
      try {
        await this.keyBinds.save();
      } catch (e) {
        console.error(e);
      }
    }
  }
}
