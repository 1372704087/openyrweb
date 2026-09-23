/**
 * OptionsScreen — 通用选项屏（键盘/存储入口 + 离开写回）。
 *
 * 支持 MainMenuController 与 GameMenuController 双上下文；
 * onLeave 序列化 options/mixer/music 并与基线比对写 LocalPrefs。
 *
 * 由 gui/screen/options/OptionsScreen.ts.js 重写为 TS。
 * 两个文件并存期间，本文件才是修改目标。
 */
import { jsx } from "gui/jsx/jsx"; // 孪生
import { MainMenuController } from "gui/screen/mainMenu/MainMenuController"; // 孪生（本组内一并转换）
import * as GameMenuControllerNs from "gui/screen/game/gameMenu/GameMenuController"; // 孪生
import * as GameMenuScreenTypeNs from "gui/screen/game/gameMenu/ScreenType"; // 孪生
import { ScreenType as MainMenuScreenType } from "gui/screen/mainMenu/ScreenType"; // 孪生（本组内一并转换）
import { StorageKey } from "LocalPrefs"; // 已转换
import { HtmlView } from "gui/jsx/HtmlView"; // 孪生
import { GeneralOpts } from "gui/screen/options/component/GeneralOpts"; // 孪生（本组内一并转换）

// 孪生 any-shim：未转换模块的具名导出不可用，取命名空间成员
const GameMenuController: any = (GameMenuControllerNs as any).GameMenuController;
const gameMenuScreenType: any = (GameMenuScreenTypeNs as any).ScreenType;

/* eslint-disable @typescript-eslint/no-explicit-any */

export class OptionsScreen {
  /** i18n 字典。 */
  strings: any;
  /** JSX 渲染器。 */
  jsxRenderer: any;
  /** 通用选项模型。 */
  options: any;
  /** 本地偏好。 */
  localPrefs: any;
  /** 全屏。 */
  fullScreen: any;
  /** 是否对局内。 */
  inGame: any;
  /** 是否显示存储页入口。 */
  storageOptsEnabled: any;
  /** 混音器（可选）。 */
  mixer: any;
  /** 音乐（可选）。 */
  music: any;
  /** 侧栏标题。 */
  title: any;
  /** 控制器。 */
  controller?: any;
  /** 进入时 options 基线。 */
  initialOptionsStr?: string;
  /** 进入时 mixer 基线。 */
  initialMixerStr?: string;

  constructor(
    strings: any,
    jsxRenderer: any,
    options: any,
    localPrefs: any,
    fullScreen: any,
    inGame: any,
    storageOptsEnabled: any,
    mixer: any,
    music: any,
  ) {
    this.strings = strings;
    this.jsxRenderer = jsxRenderer;
    this.options = options;
    this.localPrefs = localPrefs;
    this.fullScreen = fullScreen;
    this.inGame = inGame;
    this.storageOptsEnabled = storageOptsEnabled;
    this.mixer = mixer;
    this.music = music;
    this.title = this.strings.get("GUI:Options");
  }

  setController(controller: any): void {
    this.controller = controller;
  }

  onEnter(): void {
    this.initialOptionsStr = this.options.serialize();
    this.initialMixerStr = this.mixer?.serialize();
    if (this.controller instanceof MainMenuController)
      this.controller.toggleMainVideo(false);
    this.controller.setSidebarButtons([
      {
        label: this.strings.get("GUI:Keyboard"),
        onClick: () => {
          if (this.controller instanceof GameMenuController)
            this.controller.pushScreen(gameMenuScreenType.OptionsKeyboard);
          else this.controller?.pushScreen(MainMenuScreenType.OptionsKeyboard);
        },
      },
      ...(this.controller instanceof MainMenuController && this.storageOptsEnabled
        ? [
            {
              label: this.strings.get("GUI:Storage"),
              onClick: () => {
                this.controller.pushScreen(MainMenuScreenType.OptionsStorage, {});
              },
            },
          ]
        : []),
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
        component: GeneralOpts,
        props: {
          options: this.options,
          fullScreen: this.fullScreen,
          strings: this.strings,
          inGame: this.inGame,
          mixer: this.mixer,
          music: this.music,
        },
      }),
    );
    this.controller.setMainComponent(el);
  }

  async onLeave(): Promise<void> {
    var optionsJson = this.options.serialize();
    if (optionsJson !== this.initialOptionsStr)
      this.localPrefs.setItem(StorageKey.Options, optionsJson);
    if (this.mixer) {
      var mixerJson = this.mixer.serialize();
      if (mixerJson !== this.initialMixerStr)
        this.localPrefs.setItem(StorageKey.Mixer, mixerJson);
      if (this.music) {
        const musicOpts = this.music.serializeOptions();
        this.localPrefs.setItem(StorageKey.MusicOpts, musicOpts);
      }
    }
    await this.controller.hideSidebarButtons();
  }

  async onStack(): Promise<void> {
    await this.onLeave();
  }

  onUnstack(): void {
    this.onEnter();
  }
}
