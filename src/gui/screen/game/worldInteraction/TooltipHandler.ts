/**
 * TooltipHandler — 悬停延迟显示 Tooltip（实体 800ms / UI 400ms）。
 *
 * 由 gui/screen/game/worldInteraction/TooltipHandler.ts.js
 * 重写为 TS（行为完全一致）。
 *
 * 两个文件并存期间，本文件才是修改目标：tools/repack.mjs 打包时优先采用 .ts 模块的编译产物。
 */
import { CompositeDisposable } from "util/disposable/CompositeDisposable"; // 已转换
import { Tooltip } from "gui/screen/game/worldInteraction/Tooltip"; // 已转换

/* eslint-disable @typescript-eslint/no-explicit-any */

/** 悬停目标快照。 */
class HoverSnapshot {
  /** 实体。 */
  entity: any;
  /** UI 对象。 */
  uiObject: any;

  /**
   * 是否同一目标。
   * @param other 另一快照
   */
  equals(other: HoverSnapshot): boolean {
    return (this.entity ?? this.uiObject) === (other.entity ?? other.uiObject);
  }

  /**
   * 复制字段。
   * @param other 源
   */
  copy(other: HoverSnapshot): void {
    this.entity = other.entity;
    this.uiObject = other.uiObject;
  }
}

/** Tooltip 管理器。 */
export class TooltipHandler {
  /** 地图悬停。 */
  mapHoverHandler: any;
  /** 文本色。 */
  textColor: any;
  /** 指针。 */
  pointer: any;
  /** UI 场景。 */
  uiScene: any;
  /** 渲染器。 */
  renderer: any;
  /** 字符串表。 */
  strings: any;
  /** 调试文本开关。 */
  debugText: any;
  /** 释放容器。 */
  disposables = new CompositeDisposable();
  /** 当前悬停。 */
  currentHover = new HoverSnapshot();
  /** 上次悬停。 */
  lastHover = new HoverSnapshot();
  /** 是否触屏。 */
  isTouch = false;
  /** 是否需重置悬停起始时间。 */
  needsHoverTimeReset = false;
  /** 是否暂停。 */
  paused = false;
  /** 悬停开始时间。 */
  hoverStartTime: number | undefined;
  /** 当前 tooltip。 */
  tooltip: any;
  /** 上次帧。 */
  lastUpdate: number | undefined;
  /** UI 鼠标移动。 */
  handleUiMouseMove: (e: any) => void;
  /** 按下暂停。 */
  handleMouseDown: () => void;
  /** 抬起恢复。 */
  handleMouseUp: (e: any) => void;
  /** 滚轮重置。 */
  handleMouseWheel: () => void;
  /** 帧回调。 */
  onFrame: (now: number) => void;

  /**
   * @param mapHoverHandler 悬停
   * @param textColor 色
   * @param pointer 指针
   * @param uiScene UI 场景
   * @param renderer 渲染器
   * @param strings 字符串
   * @param debugText 调试开关
   */
  constructor(
    mapHoverHandler: any,
    textColor: any,
    pointer: any,
    uiScene: any,
    renderer: any,
    strings: any,
    debugText: any,
  ) {
    this.mapHoverHandler = mapHoverHandler;
    this.textColor = textColor;
    this.pointer = pointer;
    this.uiScene = uiScene;
    this.renderer = renderer;
    this.strings = strings;
    this.debugText = debugText;
    this.disposables = new CompositeDisposable();
    this.currentHover = new HoverSnapshot();
    this.lastHover = new HoverSnapshot();
    this.isTouch = false;
    this.needsHoverTimeReset = false;
    this.paused = false;
    this.handleUiMouseMove = (e: any) => {
      const hitObject = e.intersection?.object;
      let node = hitObject;
      while (node?.userData.tooltip === void 0 && ((node = node?.parent), node)) {
        // 向上找带 tooltip 的祖先
      }
      this.currentHover.uiObject = node ?? hitObject;
      if (this.hoverStartTime) this.needsHoverTimeReset = true;
      this.isTouch = e.isTouch;
    };
    this.handleMouseDown = () => {
      this.paused = true;
      this.reset();
    };
    this.handleMouseUp = (e: any) => {
      this.paused = false;
      this.isTouch = e.isTouch;
    };
    this.handleMouseWheel = () => {
      this.reset();
    };
    this.onFrame = (now: number) => {
      if (this.lastUpdate && now - this.lastUpdate < 1e3 / 15) return;
      this.lastUpdate = now;
      const entity = this.mapHoverHandler.getCurrentHover()?.entity;
      this.currentHover.entity = entity;
      if (this.paused) return;
      if (this.currentHover.equals(this.lastHover)) {
        if (this.needsHoverTimeReset) {
          this.needsHoverTimeReset = false;
          this.hoverStartTime = now;
        }
        const delay = this.currentHover.entity ? 800 : 400;
        if (
          this.hoverStartTime &&
          now - this.hoverStartTime > delay &&
          this.getTooltipText(this.currentHover) &&
          !this.tooltip &&
          !this.isTouch
        ) {
          this.tooltip = new Tooltip(
            this.getTooltipText(this.currentHover),
            this.textColor,
            this.pointer,
            this.uiScene.viewport,
          );
          this.tooltip.setZIndex(TooltipHandler.ZINDEX);
          this.uiScene.add(this.tooltip);
        }
      } else {
        this.lastHover.copy(this.currentHover);
        this.hoverStartTime = void 0;
        this.destroyTooltip();
        if (this.getTooltipText(this.currentHover) !== void 0) {
          this.hoverStartTime = now;
        }
      }
    };
  }

  /** 订阅指针与帧。 */
  init(): void {
    this.disposables.add(
      this.pointer.pointerEvents.addEventListener(
        this.uiScene.get3DObject(),
        "mousemove",
        this.handleUiMouseMove,
      ),
    );
    this.disposables.add(
      this.pointer.pointerEvents.addEventListener("canvas", "mousedown", this.handleMouseDown),
      this.pointer.pointerEvents.addEventListener("canvas", "wheel", this.handleMouseWheel),
      this.pointer.pointerEvents.addEventListener("canvas", "mouseup", this.handleMouseUp),
    );
    this.renderer.onFrame.subscribe(this.onFrame);
    this.disposables.add(() => this.renderer.onFrame.unsubscribe(this.onFrame));
  }

  /** 销毁并请求重置计时。 */
  reset(): void {
    this.destroyTooltip();
    if (this.hoverStartTime) this.needsHoverTimeReset = true;
  }

  /**
   * 从实体/UI 取 tooltip 文本。
   * @param hover 悬停
   */
  getTooltipText(hover: HoverSnapshot): string | undefined {
    let text: string | undefined;
    if (hover.entity) {
      const raw = hover.entity.getUiName?.();
      if (raw !== void 0 && raw !== "") {
        if (raw.indexOf("{") !== -1) {
          text = raw.replace(/\{([^}]+)\}/g, (_m, key) => this.strings.get(key));
        } else if (this.strings.has(raw) || raw.match(/^NOSTR:/i)) {
          text = this.strings.get(keyOf(raw));
        }
      }
      if (this.debugText.value) {
        text += ` (ID: ${hover.entity.gameObject.id})`;
      }
    } else if (hover.uiObject) {
      text = hover.uiObject.userData.tooltip;
    }
    return text;
  }

  /** 从场景移除并销毁 tooltip。 */
  destroyTooltip(): void {
    if (this.tooltip) {
      this.uiScene.remove(this.tooltip);
      this.tooltip?.destroy();
      this.tooltip = void 0;
    }
  }

  /** 释放。 */
  dispose(): void {
    this.disposables.dispose();
    this.destroyTooltip();
  }

  /** Tooltip 层级。 */
  static ZINDEX = 100;
}

/**
 * strings.get 的 key（与孪生一致：有值时直接传 key）。
 * @param k 原始 key
 */
function keyOf(k: string): string {
  return k;
}
