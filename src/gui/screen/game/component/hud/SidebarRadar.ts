/**
 * SidebarRadar — 侧栏雷达罩开合 + 小地图容器。
 *
 * 由 gui/screen/game/component/hud/SidebarRadar.ts.js
 * 重写为 TS（行为完全一致）。
 *
 * 两个文件并存期间，本文件才是修改目标：tools/repack.mjs 打包时优先采用 .ts 模块的编译产物。
 */
import * as jsxModule from "gui/jsx/jsx"; // 孪生
import * as UiObjectModule from "gui/UiObject"; // 孪生
import * as UiComponentModule from "gui/jsx/UiComponent"; // 孪生
import * as HtmlContainerModule from "gui/HtmlContainer"; // 孪生
import * as SidebarRadarAnimRunnerModule from "gui/screen/game/component/hud/SidebarRadarAnimRunner"; // 孪生

/* eslint-disable @typescript-eslint/no-explicit-any */

// 孪生 any-shim
const jsx: any = (jsxModule as any).jsx;
const UiObject: any = (UiObjectModule as any).UiObject;
const UiComponent: any = (UiComponentModule as any).UiComponent;
const HtmlContainer: any = (HtmlContainerModule as any).HtmlContainer;
const SidebarRadarAnimationRunner: any = (SidebarRadarAnimRunnerModule as any)
  .SidebarRadarAnimationRunner;

/** 侧栏雷达。 */
export class SidebarRadar extends UiComponent {
  /** 是否可见。 */
  visible = true;
  /** 罩动画精灵。 */
  cover: any;
  /** 小地图容器。 */
  minimapContainer: any;
  /** 当前小地图。 */
  minimap: any;
  /** 罩当前开合态。 */
  coverOpen: boolean | undefined;

  /** 构造初始化。 */
  constructor(...args: any[]) {
    super(...args);
    this.visible = true;
  }

  /** 根对象。 */
  createUiObject(): any {
    const obj = new UiObject(new THREE.Object3D(), new HtmlContainer());
    obj.setPosition(this.props.x || 0, this.props.y || 0);
    return obj;
  }

  /** 罩 sprite + 隐藏小地图容器。 */
  defineChildren(): any {
    return jsx(
      "fragment",
      null,
      jsx("sprite", {
        image: this.props.image,
        palette: this.props.palette,
        zIndex: this.props.zIndex,
        ref: (e: any) => (this.cover = e),
        animationRunner: new SidebarRadarAnimationRunner(this.props.image),
      }),
      jsx("container", { ref: (e: any) => (this.minimapContainer = e), hidden: true, x: 13 }),
    );
  }

  /**
   * 同步可见与 radarEnabled 开合。
   * @param _now 帧时间
   */
  onFrame(_now: number): void {
    const root = this.getUiObject().get3DObject();
    root.visible = this.visible;
    const enabled = this.props["sidebarModel"]?.radarEnabled ?? true;
    if (enabled !== this.coverOpen) {
      this.toggleCover(enabled, this.coverOpen === void 0);
      this.coverOpen = enabled;
    }
    const runner = this.cover.getAnimationRunner();
    if (runner.isStopped()) this.minimapContainer.setVisible(this.coverOpen);
  }

  /**
   * 开/关罩。
   * @param open 是否打开
   * @param instant 是否跳过动画
   */
  toggleCover(open: boolean, instant = false): void {
    const runner = this.cover.getAnimationRunner();
    if (open) runner.radarOn(instant);
    else runner.radarOff(instant);
    this.minimapContainer.setVisible(!!instant && open);
  }

  /**
   * 挂载小地图并适配尺寸。
   * @param minimap 小地图（可空）
   */
  setMinimap(minimap: any): void {
    if (this.minimap) this.minimapContainer.remove(this.minimap);
    this.minimap = minimap;
    if (minimap) {
      minimap.setFitSize(this.getMinimapAvailSpace());
      this.minimapContainer.add(minimap);
      minimap.setZIndex(this.props.zIndex + 1);
    }
  }

  /** 可用空间（减去左右边距）。 */
  getMinimapAvailSpace(): { width: number; height: number } {
    return {
      width: this.props.image.width - 13 - 15,
      height: this.props.image.height,
    };
  }

  /** 隐藏整个雷达。 */
  hide(): void {
    this.visible = false;
  }

  /** 显示整个雷达。 */
  show(): void {
    this.visible = true;
  }
}
