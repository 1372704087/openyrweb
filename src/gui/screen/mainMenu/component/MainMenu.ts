/**
 * MainMenu — 主菜单 UI 根对象（背景/侧栏/视频/按钮槽位动画）。
 *
 * 侧栏折叠展开走 MenuSlotAnimationRunner；动画停止后在 update 中
 * 刷新按钮可见性并 dispatch onSidebarToggle。
 *
 * 由 gui/screen/mainMenu/component/MainMenu.ts.js 重写为 TS。
 * 两个文件并存期间，本文件才是修改目标。
 */
import { jsx } from "gui/jsx/jsx"; // 孪生
import { UiObject } from "gui/UiObject"; // 孪生
import { HtmlContainer } from "gui/HtmlContainer"; // 孪生
import { MenuVideo } from "gui/screen/mainMenu/component/MenuVideo"; // 孪生（本组内一并转换）
import { MenuButton } from "gui/component/MenuButton"; // 已转换
import { EventDispatcher } from "util/event"; // 已转换
import {
  MenuButtonState,
  MenuSlotAnimationRunner,
} from "gui/screen/mainMenu/component/MenuSlotAnimationRunner"; // 孪生（本组内一并转换）
import { HtmlView } from "gui/jsx/HtmlView"; // 孪生
import { MenuMpSlotAnimRunner } from "gui/screen/mainMenu/component/MenuMpSlotAnimRunner"; // 孪生（本组内一并转换）
import { MenuMpSlotText } from "gui/screen/mainMenu/component/MenuMpSlotText"; // 孪生（本组内一并转换）
import { SidebarPreview } from "gui/screen/mainMenu/component/SidebarPreview"; // 孪生（本组内一并转换）
import { MenuTooltip } from "gui/screen/mainMenu/component/MenuTooltip"; // 孪生（本组内一并转换）
import { VersionString } from "gui/screen/mainMenu/component/VersionString"; // 孪生（本组内一并转换）

/* eslint-disable @typescript-eslint/no-explicit-any */

export class MainMenu extends UiObject {
  /** 当前视口。 */
  viewport: any;
  /** 图片资源表。 */
  images: any;
  /** JSX 渲染器。 */
  jsxRenderer: any;
  /** 背景视频 URL。 */
  videoSrc: any;
  /** 根级 UI 对象。 */
  rootObjects: any[] = [];
  /** 侧栏 UI 对象。 */
  sidebarObjects: any[] = [];
  /** 按钮动画精灵。 */
  sidebarSlots: any[] = [];
  /** 是否启用多人槽位。 */
  sidebarMpSlotEnabled = false;
  /** 侧栏按钮视图。 */
  sidebarButtons: any[] = [];
  /** 侧栏按钮配置。 */
  sidebarButtonConfigs: any[] = [];
  /** 侧栏是否折叠。 */
  sidebarCollapsed = true;
  /** 默认背景图名。 */
  readonly defaultBackgroundImageName = "mnscrnl.shp";
  /** 当前背景图名。 */
  backgroundImageName: string;
  /** 侧栏开合事件分发。 */
  private readonly _onSidebarToggle = new EventDispatcher();
  /** 是否需要刷新侧栏。 */
  sidebarNeedsRefresh?: boolean;
  /** 原始按钮配置。 */
  sidebarButtonsRawConfigs?: any[];
  /** 主内容容器。 */
  mainContainer?: any;
  /** 状态栏容器。 */
  statusBar?: any;
  /** 侧栏容器。 */
  sidebarContainer?: any;
  /** 背景精灵。 */
  backgroundSprite?: any;
  /** 背景覆盖层。 */
  backgroundOverlay?: any;
  /** 视频视图。 */
  menuVideo?: any;
  /** 侧栏预览。 */
  sidebarPreview?: any;
  /** 版本视图。 */
  version?: any;
  /** 当前内容组件。 */
  contentComponent?: any;
  /** 多人槽位容器。 */
  sidebarMpSlotContainer?: any;
  /** 多人槽位精灵。 */
  sidebarMpSlot?: any;
  /** 多人槽位文案视图。 */
  sidebarMpSlotContentEl?: any;
  /** 多人槽位文案内容。 */
  sidebarMpSlotContent?: any;
  /** 预览内层对象。 */
  sidebarPreviewInner?: any;

  constructor(viewport: any, images: any, jsxRenderer: any, videoSrc: any) {
    super(new THREE.Object3D(), new HtmlContainer());
    this.viewport = viewport;
    this.images = images;
    this.jsxRenderer = jsxRenderer;
    this.videoSrc = videoSrc;
    this.backgroundImageName = this.defaultBackgroundImageName;
    this.create3DObject();
  }

  /** 侧栏开合事件。 */
  get onSidebarToggle() {
    return this._onSidebarToggle;
  }

  /** 视口变化：重排状态栏与侧栏按钮。 */
  setViewport(viewport: any): void {
    this.viewport = viewport;
    this.setPosition(this.viewport.x, this.viewport.y);
    var barImg = this.getImage("lwscrnl.shp");
    this.statusBar.setPosition(0, this.viewport.height - barImg.height);
    var sdtp = this.getImage("sdtp.shp");
    var sidebarBox = this.computeSidebarViewport(sdtp);
    this.sidebarContainer.setPosition(sidebarBox.x, sidebarBox.y);
    this.sidebarContainer.remove(...this.sidebarObjects);
    this.sidebarObjects.forEach((o) => o.destroy());
    this.createSidebarButtons(this.computeSidebarButtonsViewport(sdtp));
    this.updateButtons(this.sidebarButtonsRawConfigs ?? []);
    if (!this.sidebarCollapsed) this.showButtons();
  }

  /** 替换主内容区组件。 */
  setContentComponent(view?: any): void {
    let main = this.mainContainer;
    if (this.contentComponent) {
      main.remove(this.contentComponent);
      this.contentComponent.destroy();
      this.contentComponent = void 0;
    }
    if (view) {
      main.add(view);
      this.contentComponent = view;
    }
  }

  /** 配置槽位可见数量（mp=多人槽启用）。 */
  setSlots(activeCount: number, hasBottom: boolean, mp = false): void {
    let n = this.sidebarSlots.length;
    if (!n) throw new Error("Cannot call setButtons prior to render");
    this.sidebarMpSlotContainer.setVisible(mp);
    this.sidebarSlots[0].setVisible(!mp);
    this.sidebarSlots.forEach((slot, idx) => {
      let runner = slot.getAnimationRunner();
      if (idx < activeCount + (mp ? 1 : 0))
        runner.buttonState = MenuButtonState.Unlit;
      else if (idx === n - 1)
        runner.buttonState = hasBottom
          ? MenuButtonState.Unlit
          : MenuButtonState.Hidden;
      else runner.buttonState = MenuButtonState.Hidden;
    });
  }

  /** 设置侧栏按钮（mp=多人槽）。 */
  setButtons(configs: any[], mp = false): void {
    this.sidebarButtonsRawConfigs = configs;
    this.sidebarMpSlotEnabled = mp;
    this.updateButtons(configs);
  }

  /** 按配置刷新按钮槽与文案。 */
  updateButtons(configs: any[]): void {
    let mp = this.sidebarMpSlotEnabled;
    var hasBottom = !!configs.find((c) => !!c.isBottom);
    this.setSlots(configs.length - (hasBottom ? 1 : 0), hasBottom, mp);
    this.updateSidebarMpContent();
    this.sidebarButtons.forEach((b) =>
      b.applyOptions((o: any) => (o.buttonConfig = void 0)),
    );
    configs.forEach((cfg, idx) => {
      var slotIdx = cfg.isBottom
        ? this.sidebarButtons.length - 1
        : mp
          ? idx + 1
          : idx;
      this.sidebarButtonConfigs[slotIdx] = cfg;
      this.sidebarButtons[slotIdx]?.applyOptions(
        (o: any) =>
          (o.buttonConfig = {
            label: cfg.label,
            tooltip: cfg.tooltip,
            disabled: !!cfg.disabled,
          }),
      );
    });
    this.sidebarNeedsRefresh = true;
  }

  /** 侧栏是否折叠。 */
  isSidebarCollapsed(): boolean {
    return this.sidebarCollapsed;
  }

  /** 展开侧栏（触发滑入动画）。 */
  showButtons(): void {
    this.sidebarCollapsed = false;
    this.sidebarNeedsRefresh = true;
    this.sidebarMpSlot.getAnimationRunner().slideIn();
    this.sidebarSlots.forEach((slot) => {
      let runner = slot.getAnimationRunner();
      runner.slideIn();
    });
  }

  /** 折叠侧栏（触发滑出动画）。 */
  hideButtons(): void {
    this.sidebarCollapsed = true;
    this.updateSidebarButtons();
    this.sidebarNeedsRefresh = true;
    this.sidebarMpSlot.getAnimationRunner().slideOut();
    this.sidebarSlots.forEach((slot) => {
      let runner = slot.getAnimationRunner();
      runner.slideOut();
    });
  }

  setSidebarTitle(title: any): void {
    this.sidebarPreview.setTitle(title);
  }

  toggleSidebarPreview(open: boolean): void {
    this.sidebarPreview.toggleSidebarPreview(open);
  }

  setSidebarPreview(view?: any): void {
    if (this.sidebarPreviewInner) this.sidebarPreviewInner.destroy();
    this.sidebarPreview.setPreview(view);
    this.sidebarPreviewInner = view;
  }

  getSidebarPreviewSize() {
    return this.sidebarPreview.getPreviewSize();
  }

  toggleVideo(visible: boolean): void {
    if (!this.menuVideo)
      throw new Error("Cannot call toggleVideo prior to render");
    this.menuVideo.getUiObject().setVisible(visible);
  }

  showVersion(value: any): void {
    this.version.getUiObject().setVisible(true);
    this.version.getElement().applyOptions(
      (o: any) => (o.value = value),
    );
  }

  hideVersion(): void {
    this.version.getUiObject().setVisible(false);
  }

  setSidebarMpContent(content?: any): void {
    this.sidebarMpSlotContent = content;
    this.updateSidebarMpContent();
  }

  updateSidebarMpContent(): void {
    this.sidebarMpSlotContentEl.applyOptions((o: any) => {
      if (this.sidebarMpSlotContent) {
        o.text = this.sidebarMpSlotContent.text;
        o.icon = this.sidebarMpSlotContent.icon;
        o.tooltip = this.sidebarMpSlotContent.tooltip;
      }
    });
  }

  getImage(name: string) {
    var img = this.images.get(name);
    if (!img) throw new Error(`Missing image "${name}"`);
    return img;
  }

  /** 切换背景精灵（默认图仅记名）。 */
  setBackgroundImageName(name: string): void {
    if (this.backgroundImageName === name) return;
    this.backgroundOverlay.setVisible(false);
    if (name === this.defaultBackgroundImageName) {
      this.backgroundImageName = name;
      return;
    }
    try {
      var palette = name.replace(/\.shp$/i, ".pal");
      var image = this.getImage(name);
      var [sprite] = this.jsxRenderer.render(
        jsx("sprite" as any, { image, palette, zIndex: 1 }),
      );
      this.mainContainer.remove(this.backgroundOverlay);
      this.backgroundOverlay.destroy();
      this.mainContainer.add(sprite);
      this.backgroundOverlay = sprite;
      this.backgroundImageName = name;
      this.backgroundOverlay.setVisible(true);
    } catch (e) {
      console.error("Failed to load background image " + name, e);
      this.mainContainer.remove(this.backgroundOverlay);
      this.backgroundOverlay.destroy();
      this.backgroundImageName = this.defaultBackgroundImageName;
    }
  }

  create3DObject(): void {
    super.create3DObject();
    if (this.rootObjects.length) return;
    this.setPosition(this.viewport.x, this.viewport.y);
    var bg = this.getImage("mnscrnl.shp");
    var bottom = this.getImage("lwscrnl.shp");
    var sdtp = this.getImage("sdtp.shp");
    var sdwrn = this.getImage("sdwrnanm.shp");
    var sidebarBox = this.computeSidebarViewport(sdtp);
    this.rootObjects = this.jsxRenderer.render(
      jsx(
        "fragment" as any,
        null,
        jsx(
          "container" as any,
          {
            width: bg.width,
            height: bg.height,
            ref: (e: any) => (this.mainContainer = e),
          },
          jsx("sprite" as any, {
            image: bg,
            palette: "shell.pal",
            ref: (e: any) => (this.backgroundSprite = e),
          }),
          jsx("sprite" as any, {
            image: bg,
            palette: "shell.pal",
            hidden: true,
            zIndex: 1,
            ref: (e: any) => (this.backgroundOverlay = e),
          }),
          jsx(HtmlView as any, {
            component: MenuVideo,
            props: { src: this.videoSrc },
            hidden: true,
            ref: (e: any) => (this.menuVideo = e),
          }),
        ),
        jsx(
          "container" as any,
          {
            x: 0,
            y: this.viewport.height - bottom.height,
            ref: (e: any) => (this.statusBar = e),
          },
          jsx("sprite" as any, { image: bottom, palette: "shell.pal" }),
          jsx(HtmlView as any, {
            component: MenuTooltip,
            props: { monitorContainer: this.getHtmlContainer() },
            width: bottom.width,
            height: bottom.height,
          }),
        ),
        jsx(
          "container" as any,
          {
            x: sidebarBox.x,
            y: sidebarBox.y,
            ref: (e: any) => (this.sidebarContainer = e),
          },
          jsx(SidebarPreview, {
            sdtpImg: sdtp,
            sdtpAnimImg: sdwrn,
            closed: true,
            ref: (e: any) => (this.sidebarPreview = e),
          }),
          jsx(HtmlView as any, {
            component: VersionString,
            props: { value: "" },
            width: sidebarBox.width,
            y: sidebarBox.height - 20,
            ref: (e: any) => (this.version = e),
            hidden: true,
          }),
        ),
      ),
    );
    this.add(...this.rootObjects);
    this.createSidebarButtons(this.computeSidebarButtonsViewport(sdtp));
  }

  /** 按视口高度创建按钮槽与动画。 */
  createSidebarButtons(box: any): void {
    let bkg = this.getImage("sdbtnbkgd.shp");
    let anim = this.getImage("sdbtnanm.shp");
    var count = Math.floor(box.height / bkg.height);
    let bottomImg = this.getImage("sdbtm.shp");
    var leftover = box.height - bkg.height * count;
    leftover = bottomImg.clip(bottomImg.width, leftover);
    this.sidebarSlots = [];
    this.sidebarButtons = [];
    this.sidebarObjects = this.jsxRenderer.render(
      jsx(
        "fragment" as any,
        null,
        new Array(count).fill(0).map((_v, idx) => {
          let runner = new MenuSlotAnimationRunner(idx);
          return jsx(
            "fragment" as any,
            null,
            jsx(
              "container" as any,
              { x: box.x, y: box.y + bkg.height * idx },
              jsx("sprite" as any, { image: bkg, palette: "shell2.pal" }),
              idx
                ? []
                : jsx(
                    "container" as any,
                    {
                      zIndex: 1,
                      hidden: true,
                      ref: (e: any) => (this.sidebarMpSlotContainer = e),
                      x: 12,
                      y: -bkg.height,
                    },
                    jsx("sprite" as any, {
                      image: "sdmpbtn.shp",
                      palette: "shell.pal",
                      ref: (e: any) => (this.sidebarMpSlot = e),
                      animationRunner: new MenuMpSlotAnimRunner(),
                    }),
                    jsx(HtmlView as any, {
                      component: MenuMpSlotText,
                      props: { text: "" },
                      width: 146,
                      height: 2 * bkg.height,
                      innerRef: (e: any) =>
                        (this.sidebarMpSlotContentEl = e),
                    }),
                  ),
              jsx("sprite" as any, {
                image: anim,
                palette: "sdbtnanm.pal",
                ref: (e: any) => this.sidebarSlots.push(e),
                x: 12,
                animationRunner: runner,
              }),
              jsx(HtmlView as any, {
                x: 12,
                hidden: true,
                innerRef: (e: any) => this.sidebarButtons.push(e),
                component: MenuButton,
                props: {
                  box: { x: 0, y: 0, width: 146, height: anim.height },
                  onMouseDown: () => {
                    runner.buttonState = MenuButtonState.Active;
                    let onUp = () => {
                      runner.buttonState = MenuButtonState.Normal;
                      document.removeEventListener("mouseup", onUp);
                    };
                    document.addEventListener("mouseup", onUp);
                  },
                  onClick: () => {
                    this.onSidebarButtonClick(idx);
                  },
                },
              }),
            ),
          );
        }),
        jsx("sprite" as any, {
          image: leftover,
          palette: "shell.pal",
          x: box.x,
          y: box.y + bkg.height * count,
        }),
      ),
    );
    this.sidebarContainer.add(...this.sidebarObjects);
  }

  computeSidebarViewport(sdtp: any) {
    return {
      x: this.viewport.width - sdtp.width,
      y: 0,
      width: sdtp.width,
      height: this.viewport.height,
    };
  }

  computeSidebarButtonsViewport(sdtp: any) {
    return {
      x: 0,
      y: sdtp.height,
      width: sdtp.width,
      height: this.viewport.height - sdtp.height,
    };
  }

  update(now: number): void {
    super.update(now);
    if (this.sidebarNeedsRefresh) {
      let last = this.sidebarSlots[this.sidebarSlots.length - 1];
      let runner = last.getAnimationRunner();
      if (runner.isStopped()) {
        this.updateSidebarButtons();
        this._onSidebarToggle.dispatch(this, !this.sidebarCollapsed);
      }
    }
  }

  /** 根据折叠态刷新按钮显示/状态。 */
  updateSidebarButtons(): void {
    if (this.sidebarCollapsed) {
      this.sidebarButtons.forEach((b) => b.hide());
      this.sidebarMpSlotContentEl.hide();
      this.sidebarSlots.forEach((slot) => {
        let runner = slot.getAnimationRunner();
        if (runner.buttonState !== MenuButtonState.Hidden)
          runner.buttonState = MenuButtonState.Unlit;
      });
    } else {
      this.sidebarButtons.forEach((b) => b.show());
      this.sidebarMpSlotContentEl.show();
      this.sidebarSlots.forEach((slot, idx) => {
        let runner = slot.getAnimationRunner();
        if (
          runner.buttonState !== MenuButtonState.Hidden &&
          runner.buttonState !== MenuButtonState.Active
        )
          runner.buttonState = this.sidebarButtonConfigs[idx]?.flashing
            ? MenuButtonState.Flashing
            : MenuButtonState.Normal;
      });
    }
    this.sidebarNeedsRefresh = false;
  }

  /** 触发配置 onClick。 */
  onSidebarButtonClick(index: number): void {
    const onClick = this.sidebarButtonConfigs[index].onClick;
    if (onClick) onClick();
  }

  destroy(): void {
    this.sidebarButtons.length = 0;
    this.remove(...this.rootObjects);
    this.rootObjects.forEach((o) => o.destroy());
    this.rootObjects.length = 0;
    super.destroy();
  }
}
