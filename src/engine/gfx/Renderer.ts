/**
 * Renderer — WebGL 渲染器封装：多场景视口、stats 面板、上下文丢失恢复。
 *
 * 由 engine/gfx/Renderer.ts.js 重写为 TS（行为完全一致）。两个文件
 * 并存期间，本文件才是修改目标：tools/repack.mjs 打包时优先采用 .ts
 * 模块的编译产物。
 */
import * as StatsModule from "stats.js"; // 孪生
import { EventDispatcher } from "util/event"; // 已转换
import { RendererError } from "engine/gfx/RendererError"; // 孪生（本批内一并转换）

declare const THREE: any;

// 孪生 any-shim：stats.js 未转换为 TS，取命名空间上的可用导出
const Stats: any = (StatsModule as any).default ?? StatsModule;

/* eslint-disable @typescript-eslint/no-explicit-any */

/** 场景最小形状。 */
export interface SceneLike {
  create3DObject(): void;
  update(delta?: any, time?: any): void;
  viewport: { x: number; y: number; width: number; height: number };
  scene: any;
  camera: any;
}

/** Renderer。 */
export class Renderer {
  width: number;
  height: number;
  scenes: Set<SceneLike> = new Set();
  renderer?: any;
  stats?: any;
  isContextLost: boolean = false;

  private _onFrame = new EventDispatcher();

  /** webglcontextlost 处理器（ctor 赋值）。 */
  handleContextLost: (ev: any) => void;
  /** webglcontextrestored 处理器。 */
  handleContextRestored: () => void;

  constructor(width: number, height: number) {
    this.width = width;
    this.height = height;
    this.handleContextLost = (ev: any) => {
      ev.preventDefault();
      this.isContextLost = true;
    };
    this.handleContextRestored = () => {
      const canvas = this.renderer.domElement;
      this.renderer.dispose();
      this.renderer = this.createGlRenderer(canvas);
      this.isContextLost = false;
    };
  }

  /** 帧事件（subscribe/unsubscribe）。 */
  get onFrame() {
    return this._onFrame.asEvent();
  }

  getCanvas(): any {
    return this.renderer.domElement;
  }

  getStats(): any {
    return this.stats;
  }

  /** 检查 ANGLE_instanced_arrays 扩展；未 init 抛错。 */
  supportsInstancing(): boolean {
    if (!this.renderer) throw new Error("Renderer not yet initialized");
    return !!this.renderer.extensions.get("ANGLE_instanced_arrays");
  }

  /** 挂 stats.js 面板到 parent（仅一次）。 */
  initStats(parent: HTMLElement): void {
    if (!this.stats) {
      this.stats = new Stats();
      this.stats.showPanel(0);
      this.stats.dom.style.top = "auto";
      this.stats.dom.style.bottom = "0px";
      this.stats.dom.classList.add("stats-layer");
      parent.appendChild(this.stats.dom);
    }
  }

  destroyStats(): void {
    if (this.stats) {
      this.stats.dom.parentNode.removeChild(this.stats.dom);
      this.stats = undefined;
    }
  }

  /** 创建 WebGLRenderer 并挂到 parent，注册右键/wheel/上下文事件。 */
  init(parent: HTMLElement): void {
    const gl = this.createGlRenderer();
    parent.appendChild(gl.domElement);
    gl.domElement.addEventListener("contextmenu", (ev: Event) => {
      ev.preventDefault();
    });
    gl.domElement.addEventListener("mousedown", (ev: Event) => {
      ev.preventDefault();
    });
    gl.domElement.addEventListener(
      "wheel",
      (ev: Event) => {
        ev.stopPropagation();
      },
      { passive: true },
    );
    gl.domElement.addEventListener("webglcontextlost", this.handleContextLost);
    gl.domElement.addEventListener("webglcontextrestored", this.handleContextRestored);
    this.renderer = gl;
  }

  /**
   * 创建 WebGLRenderer（失败包 RendererError）并配置尺寸/阴影/裁剪/toneMapping。
   * @param canvas 复用已有 canvas（上下文恢复路径）。
   */
  createGlRenderer(canvas?: any): any {
    let gl: any;
    try {
      gl = new THREE.WebGLRenderer({
        canvas,
        preserveDrawingBuffer: true,
        powerPreference: "high-performance",
      });
    } catch (e) {
      const err = new RendererError("Failed to initialize WebGL renderer");
      (err as any).cause = e;
      throw err;
    }
    gl.setSize(this.width, this.height);
    gl.autoClear = false;
    gl.autoClearDepth = false;
    gl.shadowMap.enabled = true;
    gl.localClippingEnabled = true;
    gl.toneMapping = THREE.NoToneMapping;
    return gl;
  }

  setViewportSize(width: number, height: number): void {
    this.width = width;
    this.height = height;
    if (this.renderer) this.renderer.setSize(width, height);
  }

  addScene(scene: SceneLike): void {
    this.scenes.add(scene);
    scene.create3DObject();
  }

  removeScene(scene: SceneLike): void {
    this.scenes.delete(scene);
  }

  getScenes(): SceneLike[] {
    return [...this.scenes];
  }

  /** 每场景 update + 广播 onFrame（listener 收到 (nowMs, this)）。 */
  update(nowMs: number, delta?: any): void {
    this.scenes.forEach((scene) => {
      scene.update(delta, nowMs);
    });
    this._onFrame.dispatch(this, nowMs);
  }

  /** clear → 每场景 clearDepth + setViewport + render。 */
  render(): void {
    if (this.isContextLost) return;
    this.renderer.clear();
    this.scenes.forEach((scene) => {
      this.renderer.clearDepth();
      this.renderer.setViewport(
        scene.viewport.x,
        scene.viewport.y,
        scene.viewport.width,
        scene.viewport.height,
      );
      this.renderer.render(scene.scene, scene.camera);
    });
  }

  flush(): void {
    this.renderer.renderLists.dispose();
  }

  /** 移除 canvas、注销事件、dispose 渲染器与 stats。 */
  destroy(): void {
    this.renderer.domElement.remove();
    this.renderer.domElement.removeEventListener("webglcontextlost", this.handleContextLost);
    this.renderer.domElement.removeEventListener("webglcontextrestored", this.handleContextRestored);
    this.renderer.dispose();
    this.destroyStats();
  }
}
