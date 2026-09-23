/**
 * UiObject — UI 场景图节点（3D Object + 可选 HtmlContainer + 渲染容器）。
 *
 * 管理位置/ zIndex /可见性/tooltip、PointerEvents 监听、父子 add/remove、
 * create3DObject 一次性装配、update 推帧派发 onFrame、destroy 清理并派发 onDispose。
 *
 * 由 gui/UiObject.ts.js 重写为 TS（行为完全一致）。
 * 两个文件并存期间，本文件才是修改目标：tools/repack.mjs 打包时优先采用 .ts 模块的编译产物。
 */
import { WithPosition } from "engine/renderable/WithPosition"; // 已转换
import { RenderableContainer } from "engine/gfx/RenderableContainer"; // 已转换
import { EventDispatcher } from "util/event"; // 已转换
import { WithVisibility } from "engine/renderable/WithVisibility"; // 已转换

/* eslint-disable @typescript-eslint/no-explicit-any */

/** UI 对象。 */
export class UiObject {
  /** 帧事件派发器。 */
  private _onFrame = new EventDispatcher();
  /** 销毁事件派发器。 */
  private _onDispose = new EventDispatcher();
  /** 是否已 create3DObject。 */
  rendered = false;
  /** 挂起的事件监听。 */
  eventHandlers: any[] = [];
  /** 三维目标。 */
  target?: any;
  /** HTML 容器（可选）。 */
  htmlContainer?: any;
  /** 位置同步组件。 */
  withPosition: WithPosition;
  /** 可见性同步组件。 */
  withVisibility: WithVisibility;
  /** 渲染容器。 */
  container: RenderableContainer;
  /** 指针事件总线（setPointerEvents 注入）。 */
  pointerEvents?: any;
  /** tooltip 文案。 */
  tooltip?: any;

  /** 帧事件。 */
  get onFrame() {
    return this._onFrame.asEvent();
  }

  /** 销毁事件。 */
  get onDispose() {
    return this._onDispose.asEvent();
  }

  /**
   * zIndex → 世界 z（取反，越大越靠前）。
   * @param zIndex - UI 层级
   */
  static zIndexToWorld(zIndex: number): number {
    return -zIndex;
  }

  /**
   * @param object3d - 可选三维目标
   * @param htmlContainer - 可选 HTML 容器
   */
  constructor(object3d?: any, htmlContainer?: any) {
    this.rendered = false;
    this.eventHandlers = [];
    this._onFrame = new EventDispatcher();
    this._onDispose = new EventDispatcher();
    if (object3d) this.set3DObject(object3d);
    if (htmlContainer) this.setHtmlContainer(htmlContainer);
    this.withPosition = new WithPosition();
    this.withVisibility = new WithVisibility();
    this.container = new RenderableContainer();
  }

  /** 三维目标。 */
  get3DObject(): any {
    return this.target;
  }

  /**
   * 设置三维目标并关掉自动矩阵更新。
   * @param object3d - Object3D
   */
  set3DObject(object3d: any): void {
    this.target = object3d;
    this.target.matrixAutoUpdate = false;
  }

  /** 渲染容器。 */
  getRenderableContainer(): RenderableContainer {
    return this.container;
  }

  /** HTML 容器。 */
  getHtmlContainer(): any {
    return this.htmlContainer;
  }

  /**
   * 设置 HTML 容器。
   * @param container - HtmlContainer
   */
  setHtmlContainer(container: any): void {
    this.htmlContainer = container;
  }

  /**
   * 设置 2D 位置（保留 z）。
   * @param x - x
   * @param y - y
   */
  setPosition(x: number, y: number): void {
    const z = this.withPosition.getPosition().z || 0;
    this.withPosition.setPosition(x, y, z);
    this.htmlContainer?.setPosition(x, y);
  }

  /** 当前 2D 位置。 */
  getPosition(): { x: number; y: number } {
    const { x, y } = this.withPosition.getPosition();
    return { x, y };
  }

  /**
   * 设置 UI zIndex。
   * @param zIndex - 层级
   */
  setZIndex(zIndex: number): void {
    const pos = this.withPosition.getPosition();
    this.withPosition.setPosition(pos.x, pos.y, UiObject.zIndexToWorld(zIndex));
  }

  /**
   * 设置可见性。
   * @param visible - 可见
   */
  setVisible(visible: boolean): void {
    this.withVisibility.setVisible(visible);
    this.htmlContainer?.setVisible(visible);
  }

  /** 是否可见。 */
  isVisible(): boolean {
    return this.withVisibility.isVisible();
  }

  /**
   * 设置 tooltip。
   * @param tooltip - 文案
   */
  setTooltip(tooltip: any): void {
    this.tooltip = tooltip;
    this.updateTooltip();
  }

  /** 写入 Object3D.userData.tooltip。 */
  updateTooltip(): void {
    const obj = this.get3DObject();
    if (obj) obj.userData.tooltip = this.tooltip;
  }

  /**
   * 注入 PointerEvents 总线（只能设一次）。
   * @param pointerEvents - PointerEvents
   */
  setPointerEvents(pointerEvents: any): void {
    if (this.pointerEvents) throw new Error("A PointerEvents instance is already set");
    this.pointerEvents = pointerEvents;
  }

  /**
   * 注册指针事件（已渲染则立即生效）。
   * @param eventName - 事件名
   * @param handler - 回调
   * @returns 解绑函数
   */
  addEventListener(eventName: string, handler: any): () => void {
    this.eventHandlers.push({ eventName, handler });
    if (this.rendered) this.setupEventListener(eventName, handler);
    return () => this.removeEventListener(eventName, handler);
  }

  /**
   * 移除监听并调用其 disposer。
   * @param eventName - 事件名
   * @param handler - 回调
   */
  removeEventListener(eventName: string, handler: any): void {
    const idx = this.eventHandlers.findIndex((h) => eventName === h.eventName && handler === h.handler);
    if (idx !== -1) {
      this.eventHandlers[idx].disposer?.();
      this.eventHandlers.splice(idx, 1);
    }
  }

  /**
   * 向 PointerEvents 挂接并记录 disposer。
   * @param eventName - 事件名
   * @param handler - 回调
   */
  setupEventListener(eventName: string, handler: any): void {
    if (!this.pointerEvents) {
      throw new Error("A PointerEvents object must be provided prior to setting up an event listener");
    }
    const disposer = this.pointerEvents.addEventListener(this.get3DObject(), eventName, handler);
    const record = this.eventHandlers.find((h) => eventName === h.eventName && handler === h.handler);
    if (record) record.disposer = disposer;
  }

  /** 一次性装配 3D/HTML/容器/事件。 */
  create3DObject(): void {
    if (!this.get3DObject()) throw new Error("Expecting a THREE.Object3D to have been set by now");
    if (!this.rendered) {
      this.rendered = true;
      this.withPosition.matrixUpdate = true;
      this.withPosition.applyTo(this);
      this.withVisibility.applyTo(this);
      this.htmlContainer?.render();
      this.htmlContainer?.setPosition(this.withPosition.getPosition().x, this.withPosition.getPosition().y);
      this.htmlContainer?.setVisible(this.withVisibility.isVisible());
      this.container.set3DObject(this.get3DObject());
      this.container.create3DObject();
      this.updateTooltip();
      this.eventHandlers.forEach((h) => this.setupEventListener(h.eventName, h.handler));
    }
  }

  /**
   * 推进子渲染并派发 onFrame。
   * @param tick - 帧时钟
   */
  update(tick?: any): void {
    this.container.update(tick);
    this._onFrame.dispatch(this, tick);
  }

  /**
   * 挂子节点（含 HTML 子容器约束）。
   * @param children - 子 UiObject
   */
  add(...children: any[]): void {
    this.container.add(...children);
    children
      .map((c) => c.getHtmlContainer())
      .forEach((html) => {
        if (html) {
          if (!this.htmlContainer) {
            throw new Error(
              "Can't add an UiObject that defines an HTMLContainer to a parent that doesn't provide an HTML container.",
            );
          }
          this.htmlContainer.add(html);
        }
      });
  }

  /**
   * 摘子节点。
   * @param children - 子 UiObject
   */
  remove(...children: any[]): void {
    children
      .map((c) => c.getHtmlContainer())
      .forEach((html) => html && this.htmlContainer?.remove(html));
    this.container.remove(...children);
  }

  /** 清空容器子节点。 */
  removeAll(): void {
    this.container.removeAll();
  }

  /** 销毁子树、HTML、事件并派发 onDispose。 */
  destroy(): void {
    this.container.getChildren().forEach((c) => (c as any).destroy?.());
    this.htmlContainer?.unrender();
    this.eventHandlers.forEach((h) => h.disposer?.());
    this.eventHandlers.length = 0;
    this._onFrame = new EventDispatcher();
    this._onDispose.dispatch(undefined);
    this._onDispose = new EventDispatcher();
  }
}
