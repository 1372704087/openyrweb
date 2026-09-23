/**
 * SidebarTabs — 侧栏四页签（禁用/激活/闪烁三态帧，250ms 闪）。
 *
 * 由 gui/screen/game/component/hud/SidebarTabs.ts.js
 * 重写为 TS（行为完全一致）。
 */
import * as jsxModule from "gui/jsx/jsx"; // 孪生
import * as UiObjectModule from "gui/UiObject"; // 孪生
import * as UiComponentModule from "gui/jsx/UiComponent"; // 孪生

/* eslint-disable @typescript-eslint/no-explicit-any */

// 孪生 any-shim
const jsx: any = (jsxModule as any).jsx;
const UiObject: any = (UiObjectModule as any).UiObject;
const UiComponent: any = (UiComponentModule as any).UiComponent;

/** 侧栏页签。 */
export class SidebarTabs extends UiComponent {
  /** 页签对象数组（预留，与孪生一致）。 */
  tabObjects: any[] = [];
  /** 是否处于闪烁亮帧。 */
  flashing = false;
  /** 上次闪烁切换时间。 */
  lastFlashUpdate: number | undefined;

  /** 构造时初始化。 */
  constructor(...args: any[]) {
    super(...args);
    this.tabObjects = [];
    this.flashing = false;
  }

  /** 根对象。 */
  createUiObject(): any {
    const obj = new UiObject(new THREE.Object3D());
    obj.setPosition(this.props.x || 0, this.props.y || 0);
    return obj;
  }

  /** 四个页签 sprite。 */
  defineChildren(): any {
    const {
      aggregatedImageData,
      images,
      palette,
      tabSpacing,
      onTabClick,
      sidebarModel,
      strings,
    } = this.props;
    const nodes: any[] = [];
    for (let i = 0; i < 4; i++) {
      const img = images[i];
      const base = this.props.aggregatedImageData.imageIndexes.get(img);
      if (base === void 0) {
        throw new Error(`Tab ${i} image not found in aggregated file`);
      }
      nodes.push(
        jsx("sprite", {
          image: aggregatedImageData.file,
          palette,
          x: (tabSpacing + img.width) * i,
          tooltip: strings.get("Tip:Tab" + (i + 1)),
          onClick: (e: any) => {
            if (e.button !== 0) return;
            const tab = sidebarModel.tabs[i];
            if (!tab.disabled) onTabClick?.(tab);
          },
          onFrame: (now: number, sprite: any) => this.handleFrame(now, sprite, sidebarModel.tabs[i], base),
        }),
      );
    }
    return nodes;
  }

  /**
   * 计算并设置帧。
   * @param now 帧时间
   * @param sprite 精灵
   * @param tab 页签模型
   * @param base 基础帧索引
   */
  handleFrame(now: number, sprite: any, tab: any, base: number): void {
    if (!this.lastFlashUpdate || now - this.lastFlashUpdate >= 250) {
      this.lastFlashUpdate = now;
      this.flashing = !this.flashing;
    }
    let frame = tab.disabled ? 2 : this.props.sidebarModel.activeTab === tab ? 1 : 0;
    if (tab.flashing && this.flashing) frame = 3;
    sprite.setFrame(base + frame);
  }
}
