/**
 * MapGenScreen — 生成地图（随机地图）子屏。
 *
 * 由自定义地图屏（MapSelScreen）侧栏"生成地图"按钮 push 进入；
 * 布局仿原版"产生地图"对话框：主区为参数表单（MapGen），侧栏为
 * 使用地图 / 取消，预览区保持空（黑底）。
 * 随机地图生成器本体尚未实现：生成地图 暂以弹窗提示，
 * 使用地图 因此保持禁用，待生成器移植后接 popScreen(result) 回传。
 *
 * 新增文件（无孪生）。
 */
import { jsx } from "gui/jsx/jsx"; // 孪生
import { HtmlView } from "gui/jsx/HtmlView"; // 孪生
import { MapGen } from "gui/screen/mainMenu/mapSel/component/MapGen"; // 新增
import { MainMenuScreen } from "gui/screen/mainMenu/MainMenuScreen"; // 孪生（本组内一并转换）

/* eslint-disable @typescript-eslint/no-explicit-any */

export class MapGenScreen extends MainMenuScreen {
  strings: any;
  jsxRenderer: any;
  messageBoxApi: any;
  form?: any;

  constructor(strings: any, jsxRenderer: any, messageBoxApi: any) {
    super();
    this.strings = strings;
    this.jsxRenderer = jsxRenderer;
    this.messageBoxApi = messageBoxApi;
    this.title = this.strings.get("GUI:GenerateMap");
  }

  get backgroundImageName() {
    // 与自定义地图屏共用同一张背景（原版两屏同图）
    return "mnscrnlcustomizebattle.shp";
  }

  onEnter(): void {
    this.initSidebar();
    this.initForm();
    // 预览区留空（黑底）；返回选图屏时由其 onUnstack 恢复
    this.controller.setSidebarPreview();
  }

  initForm(): void {
    this.controller.setMainComponent(
      this.jsxRenderer.render(
        jsx(HtmlView as any, {
          innerRef: (e: any) => (this.form = e),
          component: MapGen,
          props: {
            strings: this.strings,
            onGenerate: (options: any) => this.handleGenerate(options),
          },
        }),
      )[0],
    );
  }

  initSidebar(): void {
    this.controller.setSidebarButtons([
      {
        label: this.strings.get("GUI:UseMap"),
        tooltip: this.strings.get("STT:GenerateButtonUseMap"),
        disabled: true,
        onClick: () => {
          /* 生成器未实现，无图可用 */
        },
      },
      {
        label: this.strings.get("GUI:Cancel"),
        tooltip: this.strings.get("STT:GenerateButtonCancel"),
        isBottom: true,
        onClick: () => {
          this.controller?.popScreen();
        },
      },
    ]);
    this.controller.showSidebarButtons();
  }

  handleGenerate(options: any): void {
    // TODO: 接入随机地图生成器（含 Format5 编码）后改为生成 +
    // 启用使用地图，popScreen 回传清单给 MapSelScreen 入库
    this.messageBoxApi.alert(
      this.strings.get("NOSTR:随机地图生成器尚未实现"),
      this.strings.get("GUI:Ok"),
    );
  }

  async onLeave(): Promise<void> {
    this.form = void 0;
    this.messageBoxApi.destroy();
    this.controller.setMainComponent();
    await this.controller.hideSidebarButtons();
  }
}
