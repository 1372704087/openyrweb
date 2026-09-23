/**
 * PointerEvents — 画布/3D 对象指针事件分发（hover 路径、click 路径、触摸仿真）。
 *
 * 鼠标/触摸/滚轮 → 归一化 → Raycaster 命中 → 沿祖先链 notify；
 * mousedown/up 记 clickPaths 求交集派发 click；dispose 解绑。
 *
 * 由 gui/PointerEvents.ts.js 重写为 TS（行为完全一致）。
 * 两个文件并存期间，本文件才是修改目标：tools/repack.mjs 打包时优先采用 .ts 模块的编译产物。
 */
import { CompositeDisposable } from "util/disposable/CompositeDisposable"; // 已转换
import { equals as arrayEquals } from "util/array"; // 已转换
import { clamp } from "util/math"; // 已转换

declare const THREE: any;

/* eslint-disable @typescript-eslint/no-explicit-any */

/** obj 是否 visible 且在 root 子树内（含 root 自身）。 */
function isVisibleIn(obj: any, root: any): boolean {
  if (!obj.visible) return false;
  if (obj === root) return true;
  if (obj.parent) return isVisibleIn(obj.parent, root);
  return false;
}

/** 事件上下文（handlers Map）。 */
interface EventContext {
  handlers: Map<string, { callback: any; useCapture: boolean }[]>;
}

/** 指针事件总线。 */
export class PointerEvents {
  /** 渲染器。 */
  renderer: any;
  /** 锁定模式下的指针坐标源。 */
  lockModePointer: any;
  /** document。 */
  document: any;
  /** 画布几何。 */
  canvasMetrics: any;
  /** 一次性回调。 */
  disposables: CompositeDisposable;
  /** "canvas" 命名上下文。 */
  canvasContext: EventContext;
  /** Object3D → 上下文。 */
  objectContexts = new Map<any, EventContext>();
  /** 是否启用 3D 命中。 */
  intersectionsEnabled = true;
  /** 按钮 → 按下时祖先路径。 */
  clickPaths = new Map<number, any[]>();
  /** 触摸手指数。 */
  touchFingers = 0;
  /** 当前 hover 祖先路径。 */
  currentHoverPath?: any[];
  /** 触摸起点事件。 */
  initialTouchEvent?: any;
  /** 触摸缓冲定时器。 */
  touchStartBuffer?: { cb: () => void; timeoutId: any };

  /** dblclick 处理器。 */
  onDblClick: (ev: any) => void;
  /** mousemove 处理器。 */
  onMouseMove: (ev: any) => void;
  /** mousedown 处理器。 */
  onMouseDown: (ev: any) => void;
  /** mouseup 处理器。 */
  onMouseUp: (ev: any) => void;
  /** wheel 处理器。 */
  onMouseWheel: (ev: any) => void;
  /** touchmove 处理器。 */
  onTouchMove: (ev: any) => void;
  /** touchstart 处理器。 */
  onTouchStart: (ev: any) => void;
  /** touchend 处理器。 */
  onTouchEnd: (ev: any) => void;

  /**
   * @param renderer - 渲染器
   * @param lockModePointer - 锁定坐标源
   * @param document - document
   * @param canvasMetrics - 画布几何
   */
  constructor(renderer: any, lockModePointer: any, document: any, canvasMetrics: any) {
    this.renderer = renderer;
    this.lockModePointer = lockModePointer;
    this.document = document;
    this.canvasMetrics = canvasMetrics;
    this.disposables = new CompositeDisposable();
    this.canvasContext = { handlers: new Map() };
    this.objectContexts = new Map();
    this.intersectionsEnabled = true;
    this.clickPaths = new Map();
    this.touchFingers = 0;

    this.onDblClick = (ev: any) => {
      if (ev.button === 0) this.onMouseEvent("dblclick", ev);
    };

    this.onMouseMove = (ev: any) => {
      const pointer = this.getPointerPosition(ev);
      if (this.intersectionsEnabled) {
        const prev = this.currentHoverPath ? [...this.currentHoverPath] : undefined;
        const prevTop = prev?.[0];
        const hit = this.findObjectUnderPointer(pointer);
        const obj = hit?.object;
        this.currentHoverPath = undefined;
        if (obj) {
          this.currentHoverPath = [obj];
          obj.traverseAncestors((ancestor: any) => {
            this.currentHoverPath!.push(ancestor);
          });
        }
        if (!arrayEquals(this.currentHoverPath ?? [], prev ?? [])) {
          if (prev) {
            for (const old of prev) {
              if (!this.currentHoverPath || !this.currentHoverPath.includes(old)) {
                this.notify("mouseleave", old, pointer, ev, undefined, false);
              }
            }
          }
          if (this.currentHoverPath) {
            for (const next of this.currentHoverPath) {
              if (!prev || !prev.includes(next)) {
                this.notify("mouseenter", next, pointer, ev, hit, false);
              }
            }
          }
          if (prevTop) this.notify("mouseout", prevTop, pointer, ev);
          if (obj) this.notify("mouseover", obj, pointer, ev, hit);
        }
        if (obj) {
          this.notify("mousemove", obj, pointer, ev, hit);
        } else {
          this.renderer.getScenes().forEach((scene: any) =>
            this.notify("mousemove", scene.get3DObject(), pointer, ev),
          );
        }
      }
      this.notify("mousemove", "canvas", pointer, ev);
    };

    this.onMouseDown = (ev: any) => {
      this.onMouseEvent("mousedown", ev);
    };
    this.onMouseUp = (ev: any) => {
      this.onMouseEvent("mouseup", ev);
    };
    this.onMouseWheel = (ev: any) => {
      this.onMouseEvent("wheel", ev);
    };

    this.onTouchMove = (ev: any) => {
      ev.preventDefault();
      if (this.initialTouchEvent?.touches) {
        const origin = this.initialTouchEvent.touches[0];
        let touch = [...ev.changedTouches].find((t: any) => origin.identifier === t.identifier);
        if (touch) {
          if (this.touchStartBuffer) {
            clearTimeout(this.touchStartBuffer.timeoutId);
            this.touchStartBuffer.cb();
            this.touchStartBuffer = undefined;
          }
          touch = this.fakeMouseEventFromTouch(touch, ev);
          this.onMouseMove(touch);
        }
      }
    };

    this.onTouchStart = (ev: any) => {
      ev.preventDefault();
      const touches = ev.touches;
      let origin: any;
      let mapped: any;
      if (touches.length > 1) {
        if (
          this.touchFingers > 0 ||
          (touches[0].target === this.renderer.getCanvas() &&
            touches.length === 2)
        ) {
          if (this.touchStartBuffer) {
            clearTimeout(this.touchStartBuffer.timeoutId);
            this.touchStartBuffer = undefined;
          }
          if (touches[0].target === this.renderer.getCanvas() && touches.length === 2) {
            this.touchFingers = 2;
            if (!this.initialTouchEvent) this.initialTouchEvent = ev;
            origin = this.initialTouchEvent.touches[0];
            mapped = this.fakeMouseEventFromTouch(origin, ev, 2);
            this.onMouseEvent("mousedown", mapped);
          }
        }
      } else {
        const fire = () => {
          this.touchFingers = 1;
          const fake = this.fakeMouseEventFromTouch(touches[0], ev);
          this.onMouseEvent("mousedown", fake);
        };
        const timeoutId = setTimeout(fire, 50);
        this.touchStartBuffer = { cb: fire, timeoutId };
        this.initialTouchEvent = ev;
      }
    };

    this.onTouchEnd = (ev: any) => {
      ev.preventDefault();
      if (this.initialTouchEvent?.touches) {
        const origin = this.initialTouchEvent.touches[0];
        const touch = [...ev.changedTouches].find((t: any) => origin.identifier === t.identifier);
        if (touch) {
          if (this.touchStartBuffer) {
            clearTimeout(this.touchStartBuffer.timeoutId);
            this.touchStartBuffer.cb();
            this.touchStartBuffer = undefined;
          }
          const button = this.touchFingers === 2 ? 2 : 0;
          const fake = this.fakeMouseEventFromTouch(touch, ev, button);
          fake.touchDuration = ev.timeStamp - this.initialTouchEvent.timeStamp;
          this.touchFingers = 0;
          this.initialTouchEvent = undefined;
          this.onMouseEvent("mouseup", fake);
        }
      }
    };

    const canvas = renderer.getCanvas();
    canvas.addEventListener("dblclick", this.onDblClick, false);
    canvas.addEventListener("mousemove", this.onMouseMove, false);
    canvas.addEventListener("mousedown", this.onMouseDown, false);
    canvas.addEventListener("mouseup", this.onMouseUp, false);
    canvas.addEventListener("touchmove", this.onTouchMove, false);
    canvas.addEventListener("touchstart", this.onTouchStart, false);
    canvas.addEventListener("touchend", this.onTouchEnd, false);
    canvas.addEventListener("wheel", this.onMouseWheel, { passive: true });
    this.disposables.add(() => {
      canvas.removeEventListener("dblclick", this.onDblClick, false);
      canvas.removeEventListener("mousemove", this.onMouseMove, false);
      canvas.removeEventListener("mousedown", this.onMouseDown, false);
      canvas.removeEventListener("mouseup", this.onMouseUp, false);
      canvas.removeEventListener("touchmove", this.onTouchMove, false);
      canvas.removeEventListener("touchstart", this.onTouchStart, false);
      canvas.removeEventListener("touchend", this.onTouchEnd, false);
      canvas.removeEventListener("wheel", this.onMouseWheel, false as any);
    });
  }

  /**
   * 注册监听。
   * @param type - "canvas" 或 Object3D
   * @param key - 监听键
   * @param callback - 回调
   * @param useCapture - 捕获
   * @returns 解绑函数
   */
  addEventListener(type: any, key: string, callback: any, useCapture = false): () => void {
    const ctx = type === "canvas" ? this.canvasContext : this.getOrCreateObjectContext(type);
    let list = ctx.handlers.get(key);
    if (!list) {
      list = [];
      ctx.handlers.set(key, list);
    }
    list.push({ callback, useCapture });
    return () => this.removeEventListener(type, key, callback, useCapture);
  }

  /**
   * 移除监听。
   * @param type - "canvas" 或 Object3D
   * @param key - 监听键
   * @param callback - 回调
   * @param useCapture - 捕获
   */
  removeEventListener(type: any, key: string, callback: any, useCapture = false): void {
    const ctx = type === "canvas" ? this.canvasContext : this.objectContexts.get(type);
    if (ctx && ctx.handlers.has(key)) {
      let list = ctx.handlers.get(key)!;
      list = list.filter((h) => !(h.callback === callback && h.useCapture === useCapture));
      if (list.length) ctx.handlers.set(key, list);
      else ctx.handlers.delete(key);
      if (!ctx.handlers.size && type !== "canvas") this.objectContexts.delete(type);
    }
  }

  /**
   * 取或建 Object3D 上下文。
   * @param obj - Object3D
   */
  getOrCreateObjectContext(obj: any): EventContext {
    if (!obj) throw new Error("Undefined Object3D instance.");
    let ctx = this.objectContexts.get(obj);
    if (!ctx) {
      ctx = { handlers: new Map() };
      this.objectContexts.set(obj, ctx);
    }
    return ctx;
  }

  /**
   * 触摸 → 伪 mouse 事件。
   * @param touch - Touch
   * @param source - 源事件
   * @param button - 按钮
   */
  fakeMouseEventFromTouch(touch: any, source: any, button = 0): any {
    const pos = this.computeTouchPosition(touch);
    return {
      offsetX: pos.x,
      offsetY: pos.y,
      button,
      isTouch: true,
      detail: 1,
      altKey: source.altKey,
      ctrlKey: source.ctrlKey,
      metaKey: source.metaKey,
      shiftKey: source.shiftKey,
      timeStamp: source.timeStamp,
    };
  }

  /**
   * page → 画布内坐标并 clamp。
   * @param touch - Touch
   */
  computeTouchPosition(touch: any): { x: number; y: number } {
    const pos = { x: touch.pageX - this.canvasMetrics.x, y: touch.pageY - this.canvasMetrics.y };
    pos.x = clamp(pos.x, 0, this.canvasMetrics.width - 1);
    pos.y = clamp(pos.y, 0, this.canvasMetrics.height - 1);
    return pos;
  }

  /**
   * 鼠标事件：命中 → 目标/canvas notify；down/up 维护 click 路径并求交。
   * @param type - 事件名
   * @param ev - 源事件
   */
  onMouseEvent(type: string, ev: any): void {
    const pointer = this.getPointerPosition(ev);
    const hit = this.findObjectUnderPointer(pointer);
    if (hit) {
      this.notify(type, hit.object, pointer, ev, hit);
    } else {
      this.renderer.getScenes().forEach((scene: any) =>
        this.notify(type, scene.get3DObject(), pointer, ev),
      );
    }
    this.notify(type, "canvas", pointer, ev);
    if (type === "mousedown" || type === "mouseup") {
      const obj = hit?.object;
      let path: any[] = [];
      if (obj) {
        path = [obj];
        obj.traverseAncestors((ancestor: any) => {
          path.push(ancestor);
        });
      }
      if (type === "mousedown") {
        this.clickPaths.set(ev.button, path);
      } else {
        const downPath = this.clickPaths.get(ev.button);
        this.clickPaths.delete(ev.button);
        let matched = false;
        for (const node of path) {
          if (downPath?.includes(node)) {
            this.notify("click", node, pointer, ev, hit);
            matched = true;
            break;
          }
        }
        if (!matched) {
          this.renderer.getScenes().forEach((scene: any) =>
            this.notify("click", scene.get3DObject(), pointer, ev),
          );
        }
        this.notify("click", "canvas", pointer, ev);
      }
    }
  }

  /**
   * 指针坐标（锁态用 lockModePointer，否则 offsetX/Y）。
   * @param ev - 鼠标事件
   */
  getPointerPosition(ev: any): { x: number; y: number } {
    return this.document.pointerLockElement ? this.lockModePointer : { x: ev.offsetX, y: ev.offsetY };
  }

  /**
   * 自顶向底场景 Raycaster 命中（剔除 root 外不可见链）。
   * @param pointer - 画布坐标
   */
  findObjectUnderPointer(pointer: { x: number; y: number }): any {
    const scenes = this.renderer.getScenes();
    const grouped = this.groupObjectsByScene();
    for (let i = scenes.length - 1; i >= 0; i--) {
      const ray = new THREE.Raycaster();
      const ndc = this.normalizePointer(pointer, scenes[i].viewport);
      ray.setFromCamera(ndc, scenes[i].camera);
      const candidates = grouped.get(scenes[i].scene).filter((o: any) => isVisibleIn(o, scenes[i].get3DObject()));
      const hits = ray.intersectObjects(candidates, true);
      if (hits.length) {
        if (hits.length === 1) return hits[0];
        // 去掉祖先也在命中集里的节点，取最前
        const set = new Set(hits.map((h: any) => h.object));
        hits.forEach((h: any) => {
          h.object.traverseAncestors((anc: any) => {
            if (set.has(anc)) set.delete(anc);
          });
        });
        return hits.filter((h: any) => set.has(h.object))[0];
      }
    }
    return undefined;
  }

  /**
   * 画布坐标 → NDC。
   * @param pointer - 画布坐标
   * @param viewport - 视口
   */
  normalizePointer(pointer: { x: number; y: number }, viewport: any): { x: number; y: number } {
    return {
      x: ((pointer.x - viewport.x) / viewport.width) * 2 - 1,
      y: 2 * -((pointer.y - viewport.y) / viewport.height) + 1,
    };
  }

  /** 按场景分组 objectContexts 中的 Object3D（上溯到 Scene）。 */
  groupObjectsByScene(): Map<any, any[]> {
    const map = new Map<any, any[]>();
    this.renderer.getScenes().forEach((s: any) => map.set(s.get3DObject(), []));
    [...this.objectContexts.keys()].forEach((obj) => {
      if (obj.type !== "Scene") {
        let root = obj;
        while (root.parent) root = root.parent;
        if (root.type === "Scene") map.get(root)!.push(obj);
      }
    });
    return map;
  }

  /**
   * 沿祖先链派发事件（capture / stopPropagation 语义与孪生一致）。
   * @param type - 事件名
   * @param target - "canvas" 或 Object3D
   * @param pointer - 坐标
   * @param source - 源事件
   * @param intersection - 命中
   * @param bubble - 是否向父冒泡
   */
  notify(type: string, target: any, pointer: any, source: any, intersection?: any, bubble = true): void {
    const ctx = target === "canvas" ? this.canvasContext : this.objectContexts.get(target);
    const listeners = ctx?.handlers.get(type);
    // 孪生逗号表达式：无监听时先向父冒泡（有监听则交给 forEach 后再冒泡）
    if (!(listeners && listeners.length) && target !== "canvas" && target.parent && bubble) {
      this.notify(type, target.parent, pointer, source, intersection);
    }
    listeners?.forEach((entry) => {
      let cont = true;
      entry.callback({
        type,
        target: target !== "canvas" ? target : undefined,
        pointer: { ...pointer },
        intersection,
        button: source.button,
        isTouch: !!source.isTouch,
        touchDuration: source.touchDuration,
        clicks: source.detail,
        altKey: source.altKey,
        ctrlKey: source.ctrlKey,
        metaKey: source.metaKey,
        shiftKey: source.shiftKey,
        timeStamp: source.timeStamp,
        wheelDeltaY: source.deltaY ?? 0,
        stopPropagation: () => {
          cont = false;
        },
      });
      if (cont && target !== "canvas" && !entry.useCapture && target.parent && bubble) {
        this.notify(type, target.parent, pointer, source, intersection);
      }
    });
  }

  /** 清触摸缓冲并解绑。 */
  dispose(): void {
    if (this.touchStartBuffer) {
      clearTimeout(this.touchStartBuffer.timeoutId);
      this.touchStartBuffer = undefined;
    }
    this.disposables.dispose();
  }
}
