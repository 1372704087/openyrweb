/**
 * SoundOptsScreen — 声音选项屏（离开时写 Mixer/MusicOpts）。
 *
 * 由 gui/screen/options/SoundOptsScreen.ts.js 重写为 TS。
 * 两个文件并存期间，本文件才是修改目标。
 */
import { jsx } from "gui/jsx/jsx"; // 孪生
import { HtmlView } from "gui/jsx/HtmlView"; // 孪生
import { SoundOpts } from "gui/screen/options/component/SoundOpts"; // 孪生（本组内一并转换）
import { StorageKey } from "LocalPrefs"; // 已转换

/* eslint-disable @typescript-eslint/no-explicit-any */

export class SoundOptsScreen {
  /** i18n 字典。 */
  strings: any;
  /** JSX 渲染器。 */
  jsxRenderer: any;
  /** 混音器。 */
  mixer: any;
  /** 音乐控制器。 */
  music: any;
  /** 本地偏好。 */
  localPrefs: any;
  /** 侧栏标题。 */
  title: any;
  /** 控制器。 */
  controller?: any;
  /** 进入时混音器序列化基线。 */
  initialSettings?: string;

  constructor(
    strings: any,
    jsxRenderer: any,
    mixer: any,
    music: any,
    localPrefs: any,
  ) {
    this.strings = strings;
    this.jsxRenderer = jsxRenderer;
    this.mixer = mixer;
    this.music = music;
    this.localPrefs = localPrefs;
    this.title = this.strings.get("GUI:Sound");
  }

  setController(controller: any): void {
    this.controller = controller;
  }

  onEnter(): void {
    this.initialSettings = this.mixer.serialize();
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
        component: SoundOpts,
        props: { mixer: this.mixer, music: this.music, strings: this.strings },
      }),
    );
    this.controller.setMainComponent(el);
  }

  async onLeave(): Promise<void> {
    var settings = this.mixer.serialize();
    if (settings !== this.initialSettings)
      this.localPrefs.setItem(StorageKey.Mixer, settings);
    if (this.music) {
      const musicOpts = this.music.serializeOptions();
      this.localPrefs.setItem(StorageKey.MusicOpts, musicOpts);
    }
    await this.controller.hideSidebarButtons();
  }
}
