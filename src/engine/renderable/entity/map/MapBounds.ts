/**
 * MapBounds — 地图边界调试线框（clamped 全图品红 / localSize 黄）。
 *
 * 订阅 mapBounds.onLocalResize 重建 wrapper；setVisible 控制线框显隐。
 *
 * 由 engine/renderable/entity/map/MapBounds.ts.js 重写为 TS（行为完全一致）。
 * 两个文件并存期间，本文件才是修改目标：tools/repack.mjs 打包时优先采用 .ts 模块的编译产物。
 */
import { IsoCoords } from "engine/IsoCoords"; // 已转换
import * as WithVisibilityModule from "engine/renderable/WithVisibility"; // 孪生
import { CompositeDisposable } from "util/disposable/CompositeDisposable"; // 已转换

// 孪生 any-shim：未转换模块的具名导出不可用，取命名空间成员
const WithVisibility: any = (WithVisibilityModule as any).WithVisibility;

/* eslint-disable @typescript-eslint/no-explicit-any */

/** 地图边界调试线。 */
export class MapBounds {
  /** 游戏地图对象。 */
  map: any;
  /** 可见性状态。 */
  withVisibility: any;
  /** 资源清理器。 */
  disposables: CompositeDisposable;
  /** 线框根。 */
  target?: any;
  /** 内容 wrapper。 */
  wrapperObj?: any;
  /** onLocalResize 订阅回调。 */
  private readonly onLocalResizeHandler: () => void;

  /** @param map - 需 mapBounds/onLocalResize */
  constructor(map: any) {
    this.map = map;
    this.withVisibility = new WithVisibility();
    this.disposables = new CompositeDisposable();
    this.onLocalResizeHandler = () => {
      if (this.target && this.wrapperObj) {
        this.target.remove(this.wrapperObj);
        this.wrapperObj = this.build();
        this.target.add(this.wrapperObj);
      }
    };
    map.mapBounds.onLocalResize.subscribe(this.onLocalResizeHandler);
    this.disposables.add(() => map.mapBounds.onLocalResize.unsubscribe(this.onLocalResizeHandler));
  }

  /** 构建双矩形线框组。 */
  build(): any {
    const clamped = this.map.mapBounds.getClampedFullSize();
    const local = this.map.mapBounds.getLocalSize();
    const outer = this.createBoundRect(
      { x: clamped.x, y: clamped.y },
      { x: clamped.x + clamped.width, y: clamped.y + clamped.height },
      16711680,
    );
    outer.matrixAutoUpdate = false;
    const inner = this.createBoundRect(
      { x: local.x, y: local.y },
      { x: local.x + local.width, y: local.y + local.height - 1 },
      255,
    );
    inner.matrixAutoUpdate = false;
    const root = new (THREE as any).Object3D();
    root.matrixAutoUpdate = false;
    root.add(outer);
    root.add(inner);
    return root;
  }

  /**
   * 创建闭合矩形 Line。
   * @param p0 - 左上 screen tile
   * @param p1 - 右下 screen tile
   * @param color - 线色
   */
  createBoundRect(p0: { x: number; y: number }, p1: { x: number; y: number }, color: number): any {
    const r = IsoCoords.screenTileToWorld(p0.x, p0.y);
    const s = IsoCoords.screenTileToWorld(p1.x, p1.y);
    const a = IsoCoords.screenTileToWorld(p1.x, p0.y);
    const n = IsoCoords.screenTileToWorld(p0.x, p1.y);
    const mat = new (THREE as any).LineBasicMaterial({
      color,
      transparent: true,
      depthTest: false,
      depthWrite: false,
    });
    const geometry = new (THREE as any).Geometry();
    geometry.vertices.push(
      new (THREE as any).Vector3(r.x, 0, r.y),
      new (THREE as any).Vector3(n.x, 0, n.y),
      new (THREE as any).Vector3(s.x, 0, s.y),
      new (THREE as any).Vector3(a.x, 0, a.y),
      new (THREE as any).Vector3(r.x, 0, r.y),
    );
    this.disposables.add(geometry, mat);
    const line = new (THREE as any).Line(geometry, mat);
    line.renderOrder = 1e6;
    return line;
  }

  /** 取 3D 对象。 */
  get3DObject(): any {
    return this.target;
  }

  /** 惰性创建根节点；可见时构建 wrapper。 */
  create3DObject(): void {
    if (!this.target) {
      const root = new (THREE as any).Object3D();
      root.matrixAutoUpdate = false;
      root.name = "map_bounds";
      root.visible = this.withVisibility.isVisible();
      this.target = root;
      if (!this.wrapperObj && root.visible) {
        this.wrapperObj = this.build();
        this.target.add(this.wrapperObj);
      }
    }
  }

  /** 无逐帧逻辑。 */
  update(): void {}

  /**
   * 切换线框可见性。
   * @param visible - 目标可见
   */
  setVisible(visible: boolean): void {
    if (visible !== this.withVisibility.isVisible()) {
      this.withVisibility.setVisible(visible);
      if (this.target) {
        if ((this.target.visible = visible)) {
          if (!this.wrapperObj) this.wrapperObj = this.build();
          this.target.add(this.wrapperObj);
        } else if (this.wrapperObj) {
          this.target.remove(this.wrapperObj);
        }
      }
    }
  }

  /** 释放几何/材质。 */
  dispose(): void {
    this.disposables.dispose();
  }
}
