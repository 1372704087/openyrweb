/**
 * MainMenuRootScreen — 主菜单根屏幕（建 MainMenu/控制器 + CDN 预取）。
 *
 * 预取：先 sleep 5s，再并行 15s 后若未完成则显示进度条；
 * onLeave 销毁控制器与 MainMenu。
 *
 * 由 gui/screen/mainMenu/MainMenuRootScreen.ts.js 重写为 TS。
 * 两个文件并存期间，本文件才是修改目标。
 */
import { jsx } from "gui/jsx/jsx"; // 孪生
import { MainMenu } from "gui/screen/mainMenu/component/MainMenu"; // 孪生（本组内一并转换）
import { MainMenuController } from "gui/screen/mainMenu/MainMenuController"; // 孪生（本组内一并转换）
import { ScreenType } from "gui/screen/mainMenu/ScreenType"; // 孪生（本组内一并转换）
import * as resourceConfigs from "engine/resourceConfigs"; // 孪生
import { CompositeDisposable } from "util/disposable/CompositeDisposable"; // 已转换
import { Task } from "@puzzl/core/lib/async/Task"; // 已转换
import { OperationCanceledError } from "@puzzl/core/lib/async/cancellation"; // 已转换
import { HtmlView } from "gui/jsx/HtmlView"; // 孪生
import { PrefetchProgress } from "gui/screen/mainMenu/component/PrefetchProgress"; // 孪生（本组内一并转换）
import { sleep } from "@puzzl/core/lib/async/sleep"; // 已转换
import { RootScreen } from "gui/screen/RootScreen"; // 孪生（本组内一并转换）

// 孪生 any-shim：未转换模块的具名导出不可用，取命名空间成员
const resourcesForPrefetch: any = (resourceConfigs as any).resourcesForPrefetch;

/* eslint-disable @typescript-eslint/no-explicit-any */

export class MainMenuRootScreen extends RootScreen {
  /** 子屏幕注册表。 */
  subScreens: any;
  /** UI 场景。 */
  uiScene: any;
  /** 游戏资源配置。 */
  gameResConfig: any;
  /** i18n 字典。 */
  strings: any;
  /** 图片资源。 */
  images: any;
  /** JSX 渲染器。 */
  jsxRenderer: any;
  /** 背景视频 URL。 */
  videoSrc: any;
  /** CDN 资源加载器。 */
  cdnResourceLoader: any;
  /** 音效。 */
  sound: any;
  /** 音乐。 */
  music: any;
  /** Sentry。 */
  sentry: any;
  /** 是否已发起预取。 */
  prefetched = false;
  /** 清理器。 */
  disposables = new CompositeDisposable();
  /** 主菜单 UI。 */
  mainMenu?: any;
  /** 主菜单控制器。 */
  mainMenuCtrl?: any;
  /** 预取进度条元素。 */
  prefetchProgressEl?: any;
  /** 预取进度视图。 */
  prefetchProgressView?: any;

  constructor(
    subScreens: any,
    uiScene: any,
    gameResConfig: any,
    strings: any,
    images: any,
    jsxRenderer: any,
    videoSrc: any,
    cdnResourceLoader: any,
    sound: any,
    music: any,
    sentry: any,
  ) {
    super();
    this.subScreens = subScreens;
    this.uiScene = uiScene;
    this.gameResConfig = gameResConfig;
    this.strings = strings;
    this.images = images;
    this.jsxRenderer = jsxRenderer;
    this.videoSrc = videoSrc;
    this.cdnResourceLoader = cdnResourceLoader;
    this.sound = sound;
    this.music = music;
    this.sentry = sentry;
    this.prefetched = false;
    this.disposables = new CompositeDisposable();
  }

  /** 创建 MainMenu；CDN 模式下首次建预取进度条。 */
  createView(): void {
    var el: any;
    this.mainMenu = new MainMenu(
      this.uiScene.menuViewport,
      this.images,
      this.jsxRenderer,
      this.videoSrc,
    );
    if (!this.prefetched && this.gameResConfig.isCdn()) {
      [el] = this.jsxRenderer.render(
        jsx(HtmlView as any, {
          component: PrefetchProgress,
          ref: (e: any) => (this.prefetchProgressView = e),
          props: {
            progress: 0,
            statusText: this.strings.get("TS:Preloading"),
          },
        }),
      );
      this.prefetchProgressEl = el;
      this.prefetched = true;
      this.updatePrefetchProgressViewport();
    }
  }

  /** 建视图 + 控制器并挂 sentry 面包屑。 */
  createViewAndController(): any {
    return this.createView(),
      (this.mainMenuCtrl = new MainMenuController(
        this.mainMenu,
        this.sound,
        this.music,
      )),
      this.mainMenuCtrl.onScreenChange.subscribe((type: any) =>
        this.sentry?.addBreadcrumb({
          category: "ui",
          message:
            void 0 !== type
              ? "Navigated to screen " + ScreenType[type]
              : "Navigated to previous screen",
          level: "info",
        }),
      ),
      this.mainMenuCtrl;
  }

  onViewportChange(): void {
    this.mainMenu.setViewport(this.uiScene.menuViewport);
    this.mainMenuCtrl?.rerenderCurrentScreen();
    this.updatePrefetchProgressViewport();
  }

  onEnter(params?: any): void {
    let ctrl = this.createViewAndController();
    for (const [type, screen] of this.subScreens) ctrl.addScreen(type, screen);
    this.uiScene.add(this.mainMenu);
    setTimeout(() => {
      if (params?.route)
        ctrl.goToScreen(params.route.screenType, params.route.params);
      else ctrl.goToScreen(ScreenType.Home);
    });
    if (this.prefetchProgressEl) {
      let done = false;
      let task = new Task(async (cancel) => {
        await sleep(5000, cancel);
        sleep(15000, cancel)
          .then(() => {
            if (!done) this.uiScene.add(this.prefetchProgressEl);
          })
          .catch((e) => {
            if (!(e instanceof OperationCanceledError)) throw e;
          });
        await this.cdnResourceLoader.loadResources(
          resourcesForPrefetch,
          cancel,
          (p: number) => {
            this.prefetchProgressView
              .getElement()
              .applyOptions((opts: any) => (opts.progress = p));
          },
        );
        done = true;
        this.uiScene.remove(this.prefetchProgressEl);
      });
      task
        .start()
        .catch((e) => {
          if (this.prefetchProgressEl) this.uiScene.remove(this.prefetchProgressEl);
          done = true;
          if (!(e instanceof OperationCanceledError)) console.error(e);
        })
        .then(() => (task = void 0 as any));
      this.disposables.add(() => {
        task?.cancel();
        this.prefetchProgressEl.destroy();
        this.prefetchProgressEl = void 0;
        this.prefetchProgressView = void 0;
      });
    }
  }

  /** 同步预取进度条宽度到 viewport。 */
  updatePrefetchProgressViewport(): void {
    this.prefetchProgressEl
      ?.getHtmlContainer()
      ?.setSize(this.uiScene.viewport.width, 0);
  }

  async onLeave(): Promise<void> {
    if (this.mainMenuCtrl) {
      this.mainMenuCtrl.toggleMainVideo(false);
      await this.mainMenuCtrl.leaveCurrentScreen();
      this.mainMenuCtrl.destroy();
      this.mainMenuCtrl = void 0;
    }
    this.uiScene.remove(this.mainMenu);
    this.mainMenu.destroy();
    this.mainMenu = void 0;
    this.disposables.dispose();
  }
}
