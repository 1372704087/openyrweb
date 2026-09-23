/**
 * SidebarCard — 侧栏生产卡槽网格（cameo/进度/数量/翻页）。
 *
 * 由 gui/screen/game/component/hud/SidebarCard.ts.js
 * 重写为 TS（行为完全一致）。
 *
 * 两个文件并存期间，本文件才是修改目标：tools/repack.mjs 打包时优先采用 .ts 模块的编译产物。
 */
import * as jsxModule from "gui/jsx/jsx"; // 孪生
import { SidebarItemStatus, SidebarItemTargetType } from "gui/screen/game/component/hud/viewmodel/SidebarModel"; // 已转换
import * as UiObjectModule from "gui/UiObject"; // 孪生
import * as UiComponentModule from "gui/jsx/UiComponent"; // 孪生
import * as OverlayUtilsModule from "engine/gfx/OverlayUtils"; // 孪生
import * as HtmlContainerModule from "gui/HtmlContainer"; // 孪生
import { clamp } from "util/math"; // 已转换
import { CombatantSidebarModel } from "gui/screen/game/component/hud/viewmodel/CombatantSidebarModel"; // 已转换
import * as ObjectArtModule from "game/art/ObjectArt"; // 孪生

/* eslint-disable @typescript-eslint/no-explicit-any */

// 孪生 any-shim
const jsx: any = (jsxModule as any).jsx;
const UiObject: any = (UiObjectModule as any).UiObject;
const UiComponent: any = (UiComponentModule as any).UiComponent;
const OverlayUtils: any = OverlayUtilsModule as any;
const HtmlContainer: any = (HtmlContainerModule as any).HtmlContainer;
const ObjectArt: any = (ObjectArtModule as any).ObjectArt ?? ObjectArtModule;

/** 状态标签帧。 */
enum StatusLabel {
  /** 就绪 */
  Ready = 0,
  /** 暂停 */
  OnHold = 1,
}

/** 生产卡槽区。 */
export class SidebarCard extends UiComponent {
  /** 槽容器。 */
  slotContainers: any[] = [];
  /** cameo 精灵。 */
  slotObjects: any[] = [];
  /** 进度盖。 */
  progressOverlays: any[] = [];
  /** 是否可见。 */
  visible = true;
  /** 状态标签精灵。 */
  labelObjects: any[] = [];
  /** 数量精灵。 */
  quantityObjects: any[] = [];
  /** 首帧标记。 */
  justCreated = true;
  /** 上次条目数。 */
  lastItemCount = 0;
  /** 翻页偏移。 */
  pagingOffset = 0;
  /** 悬停槽。 */
  hoverSlotIndex: number | undefined;
  /** 上次激活页。 */
  lastActiveTab: any;
  /** 悬停框。 */
  slotOutline: any;
  /** 标签图缓存。 */
  labelImages: any;
  /** 数量图缓存。 */
  quantityImages: any;
  /** 滚轮翻页。 */
  handleWheel: (e: any) => void;

  /** 最大显示数量帧数。 */
  static MAX_QUANTITY = 99;
  /** 标签图缓存。 */
  static labelImageCache = new Map<string, any>();
  /** 数量图缓存。 */
  static quantityImageCache = new Map<string, any>();

  /** 构造初始化。 */
  constructor(...args: any[]) {
    super(...args);
    this.slotContainers = [];
    this.slotObjects = [];
    this.progressOverlays = [];
    this.visible = true;
    this.labelObjects = [];
    this.quantityObjects = [];
    this.justCreated = true;
    this.lastItemCount = 0;
    this.pagingOffset = 0;
    this.handleWheel = (e: any) => {
      this.scrollToOffset(this.pagingOffset + (e.wheelDeltaY > 0 ? 2 : -2));
    };
  }

  /** 根对象 + 悬停框 + 标签图缓存。 */
  createUiObject(): any {
    const obj = new UiObject(new THREE.Object3D(), new HtmlContainer());
    obj.setPosition(this.props.x || 0, this.props.y || 0);
    obj.onFrame.subscribe(() => this.handleFrame());
    this.slotOutline = new UiObject(this.createSlotOutline());
    this.slotOutline.setVisible(false);
    this.slotOutline.setZIndex((this.props.zIndex ?? 0) + 1);
    obj.add(this.slotOutline);
    let label = SidebarCard.labelImageCache.get(this.props.textColor);
    if (!label) {
      label = this.createLabelImages(this.props.textColor);
      SidebarCard.labelImageCache.set(this.props.textColor, label);
    }
    this.labelImages = label;
    let quantity = SidebarCard.quantityImageCache.get(this.props.textColor);
    if (!quantity) {
      quantity = this.createQuantityImages(this.props.textColor);
      SidebarCard.quantityImageCache.set(this.props.textColor, quantity);
    }
    this.quantityImages = quantity;
    return obj;
  }

  /** 创建全部槽容器。 */
  defineChildren(): any {
    const {
      slots,
      cameoImages,
      cameoPalette,
      sidebarModel,
      onSlotClick,
      zIndex,
    } = this.props;
    const size = this.getCameoSize();
    const padX = 3;
    const padY = 2;
    const nodes: any[] = [];
    for (let slot = 0; slot < slots; slot++) {
      const pos = {
        x: (padX + size.width) * (slot % 2),
        y: (padY + size.height) * Math.floor(slot / 2),
      };
      nodes.push(
        jsx(
          "container",
          {
            x: pos.x,
            y: pos.y,
            zIndex,
            ref: (e: any) => this.slotContainers.push(e),
            onWheel: this.handleWheel,
            onClick: (e: any) => {
              const item = sidebarModel.activeTab.items[this.getItemIndexAtSlot(slot)];
              if (item && !item.disabled) {
                onSlotClick?.(this.createSlotClickEvent(item, e));
              }
            },
            onMouseEnter: () => {
              const item = sidebarModel.activeTab.items[this.getItemIndexAtSlot(slot)];
              if (!item) return;
              if (!item.disabled) this.slotOutline.setPosition(pos.x, pos.y);
              this.slotOutline.setVisible(!item.disabled);
              this.hoverSlotIndex = slot;
            },
            onMouseLeave: () => {
              if (this.hoverSlotIndex === slot) {
                this.slotOutline.setVisible(false);
                this.hoverSlotIndex = void 0;
              }
            },
          },
          jsx("sprite", {
            image: "gclock2.shp",
            palette: "sidebar.pal",
            zIndex: 1,
            frame: 0,
            opacity: 0.5,
            transparent: true,
            ref: (e: any) => this.progressOverlays.push(e),
          }),
          jsx("sprite", {
            images: this.labelImages,
            zIndex: 2,
            x: size.width / 2,
            transparent: true,
            ref: (e: any) => this.labelObjects.push(e),
          }),
          jsx("sprite", {
            images: this.quantityImages,
            zIndex: 2,
            x: size.width,
            alignX: 1,
            alignY: -1,
            transparent: true,
            ref: (e: any) => this.quantityObjects.push(e),
          }),
          jsx("sprite", {
            image: cameoImages,
            palette: cameoPalette,
            ref: (e: any) => this.slotObjects.push(e),
          }),
        ),
      );
    }
    return nodes;
  }

  /**
   * 组装点击事件。
   * @param item 条目
   * @param e 原始事件
   */
  createSlotClickEvent(item: any, e: any): any {
    return {
      target: item.target,
      button: e.button,
      altKey: e.altKey,
      ctrlKey: e.ctrlKey,
      metaKey: e.metaKey,
      shiftKey: e.shiftKey,
      isTouch: e.isTouch,
      touchDuration: e.touchDuration,
    };
  }

  /** 页签/数量变化时刷新槽。 */
  handleFrame(): void {
    const { sidebarModel, slots } = this.props;
    const root = this.getUiObject().get3DObject();
    root.visible = this.visible;
    if (
      this.justCreated ||
      sidebarModel.activeTab.needsUpdate ||
      this.lastActiveTab !== sidebarModel.activeTab
    ) {
      this.justCreated = false;
      const count = sidebarModel.activeTab.items.length;
      if (this.lastActiveTab !== sidebarModel.activeTab || this.lastItemCount !== count) {
        if (this.lastItemCount > count) this.pagingOffset = 0;
        this.lastItemCount = count;
      }
      this.lastActiveTab = sidebarModel.activeTab;
      sidebarModel.activeTab.needsUpdate = false;
      this.updateSlots(sidebarModel.activeTab.items, slots);
    }
  }

  /**
   * 刷新全部槽。
   * @param items 条目
   * @param slotCount 槽数
   */
  updateSlots(items: any[], slotCount: number): void {
    for (let slot = 0; slot < slotCount; slot++) {
      const item = items[this.getItemIndexAtSlot(slot)];
      const cameo = this.slotObjects[slot];
      const progress = this.progressOverlays[slot];
      const label = this.labelObjects[slot];
      const quantity = this.quantityObjects[slot];
      if (items.length - this.pagingOffset <= slot) {
        cameo.get3DObject().visible = false;
        progress.get3DObject().visible = false;
        label.get3DObject().visible = false;
        quantity.get3DObject().visible = false;
      } else {
        this.updateCameo(item, cameo);
        this.updateProgressOverlay(item, progress);
        this.updateStatusText(item, label);
        this.updateQuantities(item, quantity);
        this.updateTooltip(item, this.slotContainers[slot]);
      }
    }
  }

  /**
   * 设 cameo 帧与禁用亮度。
   * @param item 条目
   * @param sprite 精灵
   */
  updateCameo(item: any, sprite: any): void {
    const map = this.props["cameoNameToIdMap"];
    let key = item.cameo + ".shp";
    let id = map.get(key);
    if (id === void 0) {
      key = ObjectArt.MISSING_CAMEO + ".shp";
      id = map.get(key);
    }
    if (id === void 0) {
      throw new Error(`Missing cameo placeholder image "${ObjectArt.MISSING_CAMEO}.shp"`);
    }
    sprite.setFrame(id);
    sprite.get3DObject().visible = true;
    sprite.setLightMult(item.disabled ? 0.5 : 1);
  }

  /**
   * 生产进度盖。
   * @param item 条目
   * @param sprite 精灵
   */
  updateProgressOverlay(item: any, sprite: any): void {
    let frame = 0;
    if (
      [SidebarItemStatus.Started, SidebarItemStatus.OnHold].includes(item.status)
    ) {
      const max = sprite.getFrameCount();
      frame = Math.max(1, Math.ceil(item.progress * (max - 1))) % max;
    }
    sprite.setFrame(frame);
    sprite.get3DObject().visible = frame > 0;
  }

  /**
   * Ready/OnHold 标签。
   * @param item 条目
   * @param sprite 精灵
   */
  updateStatusText(item: any, sprite: any): void {
    sprite.get3DObject().visible = [SidebarItemStatus.Ready, SidebarItemStatus.OnHold].includes(
      item.status,
    );
    if (item.status === SidebarItemStatus.Ready) {
      sprite.setFrame(StatusLabel.Ready);
      sprite.setPosition(this.getCameoSize().width / 2, sprite.getPosition().y);
      sprite.builder.setAlign(0, -1);
    } else if (item.status === SidebarItemStatus.OnHold) {
      sprite.setFrame(StatusLabel.OnHold);
      sprite.setPosition(
        item.quantity > 1 ? 0 : this.getCameoSize().width / 2,
        sprite.getPosition().y,
      );
      sprite.builder.setAlign(item.quantity > 1 ? -1 : 0, -1);
    }
  }

  /**
   * 数量徽标。
   * @param item 条目
   * @param sprite 精灵
   */
  updateQuantities(item: any, sprite: any): void {
    const min = item.status === SidebarItemStatus.InQueue ? 0 : 1;
    if (item.quantity > min) {
      sprite.setFrame(
        item.quantity > SidebarCard.MAX_QUANTITY
          ? SidebarCard.MAX_QUANTITY
          : item.quantity - 1,
      );
      sprite.setVisible(true);
    } else {
      sprite.setVisible(false);
    }
  }

  /**
   * 设置 tooltip 文本。
   * @param item 条目
   * @param container 容器
   */
  updateTooltip(item: any, container: any): void {
    let text: string;
    if (item.target.type === SidebarItemTargetType.Techno) {
      let cost = item.target.rules.cost;
      if (this.props.sidebarModel instanceof CombatantSidebarModel) {
        cost = (this.props.sidebarModel as CombatantSidebarModel).computePurchaseCost(
          item.target.rules,
        );
      }
      text = this.props.strings.get(item.target.rules.uiName) + "\n$" + cost;
    } else if (item.target.type === SidebarItemTargetType.Special) {
      text = this.props.strings.get(item.target.rules.uiName);
    } else {
      throw new Error(`Type "${item.target.type}" not implemented`);
    }
    container.setTooltip(text);
  }

  /**
   * 槽 → 条目下标。
   * @param slot 槽
   */
  getItemIndexAtSlot(slot: number): number {
    return slot + this.pagingOffset;
  }

  /** cameo 尺寸。 */
  getCameoSize(): { width: number; height: number } {
    return {
      width: this.props.cameoImages.width,
      height: this.props.cameoImages.height,
    };
  }

  /** 悬停线框。 */
  createSlotOutline(): any {
    const { width, height } = this.getCameoSize();
    const geometry = new THREE.Geometry();
    geometry.vertices.push(
      new THREE.Vector3(0, 0, 0),
      new THREE.Vector3(0, height, 0),
      new THREE.Vector3(width, height, 0),
      new THREE.Vector3(width, 0, 0),
      new THREE.Vector3(0, 0, 0),
    );
    const material = new THREE.LineBasicMaterial({
      color: this.props.textColor,
      transparent: true,
      side: THREE.DoubleSide,
    });
    return new THREE.Line(geometry, material);
  }

  /** 隐藏。 */
  hide(): void {
    this.visible = false;
  }

  /** 显示。 */
  show(): void {
    this.visible = true;
  }

  /**
   * 翻页到偏移（偶对齐）。
   * @param offset 新偏移
   */
  scrollToOffset(offset: number): boolean {
    const prev = this.pagingOffset;
    const max = Math.max(
      0,
      this.props.sidebarModel.activeTab.items.length - this.props.slots,
    );
    this.pagingOffset = clamp(offset, 0, max);
    if (this.pagingOffset % 2) this.pagingOffset++;
    this.updateSlots(this.props.sidebarModel.activeTab.items, this.props.slots);
    return prev !== this.pagingOffset;
  }

  /** 下一页。 */
  pageDown(): boolean {
    return this.scrollToOffset(this.pagingOffset + this.props.slots);
  }

  /** 上一页。 */
  pageUp(): boolean {
    return this.scrollToOffset(this.pagingOffset - this.props.slots);
  }

  /**
   * Ready/Hold 标签图。
   * @param color 色
   */
  createLabelImages(color: string): any[] {
    const entries = [
      { text: this.props.strings.get("TXT_READY"), type: StatusLabel.Ready },
      { text: this.props.strings.get("TXT_HOLD"), type: StatusLabel.OnHold },
    ];
    return entries.map((e) => this.createTextBox(e.text, color));
  }

  /**
   * 数量数字图 1..99 + ∞。
   * @param color 色
   */
  createQuantityImages(color: string): any[] {
    const extra = { paddingRight: 2 };
    const list = new Array(SidebarCard.MAX_QUANTITY)
      .fill(0)
      .map((_, i) => this.createTextBox("" + (i + 1), color, extra));
    list.push(this.createTextBox("∞", color, extra));
    return list;
  }

  /**
   * 单行文本图。
   * @param text 文本
   * @param color 色
   * @param extra 额外样式
   */
  createTextBox(text: string, color: string, extra?: any): any {
    return OverlayUtils.createTextBox(text, {
      color,
      backgroundColor: "rgba(0, 0, 0, .5)",
      fontFamily: "'Fira Sans Condensed', Arial, sans-serif",
      fontSize: 14,
      fontWeight: "500",
      paddingTop: 6,
      paddingBottom: 6,
      paddingLeft: 2,
      paddingRight: 2,
      ...extra,
    });
  }
}
