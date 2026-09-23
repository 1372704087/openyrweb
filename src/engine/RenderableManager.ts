/**
 * RenderableManager — 世界对象 ↔ 可渲染对象的生命周期管理（八叉树容器）。
 *
 * 由 engine/RenderableManager.ts.js 重写为 TS（行为完全一致）。
 * 两个文件并存期间，本文件才是修改目标：tools/repack.mjs 打包时优先
 * 采用 .ts 模块的编译产物。
 */
import * as OctreeContainerModule from "engine/gfx/OctreeContainer"; // 孪生

const OctreeContainer = (OctreeContainerModule as any).OctreeContainer as any;

/* eslint-disable @typescript-eslint/no-explicit-any */

/** 世界对象最小形状。 */
export interface WorldObjectLike {
  id: any;
  isTechno(): boolean;
  rules?: any;
  position: {
    worldPosition: any;
    onPositionChange: {
      subscribe(fn: (e: { tileChanged: boolean }) => void): void;
      unsubscribe(fn: (e: { tileChanged: boolean }) => void): void;
    };
  };
}

/** 可渲染对象最小形状。 */
export interface RenderableLike {
  onCreate?(manager: RenderableManager): void;
  onRemove?(manager: RenderableManager): void | Promise<void>;
  setPosition(pos: any): void;
  updateLighting(): void;
  dispose?(): void;
}

/** 世界场景最小形状。 */
export interface WorldSceneLike {
  add(o: any): void;
  remove(o: any): void;
  markBatchRebuild?(): void;
  onCameraUpdate: {
    subscribe(fn: () => void): void;
    unsubscribe(fn: () => void): void;
  };
}

/** 世界最小形状。 */
export interface WorldLike {
  getAllObjects(): WorldObjectLike[];
  onObjectSpawned: {
    subscribe(fn: (o: WorldObjectLike) => void): void;
    unsubscribe(fn: (o: WorldObjectLike) => void): void;
  };
  onObjectRemoved: {
    subscribe(fn: (o: WorldObjectLike) => void): void;
    unsubscribe(fn: (o: WorldObjectLike) => void): void;
  };
}

/** 可渲染工厂。 */
export interface RenderableFactoryLike {
  create(obj: WorldObjectLike): RenderableLike;
  createAnim(obj: any): any;
  createTransientAnim(obj: any, container: any): any;
}

/**
 * 可渲染管理器。
 */
export class RenderableManager {
  /** 世界 */
  world: WorldLike;
  /** 世界场景 */
  worldScene: WorldSceneLike;
  /** 相机 */
  camera: any;
  /** 可渲染工厂 */
  renderableFactory: RenderableFactoryLike;
  /** 世界对象 → 可渲染 */
  renderablesByGameObject: Map<WorldObjectLike, RenderableLike>;
  /** 对象 id → 可渲染 */
  renderablesById: Map<any, RenderableLike>;
  /** 世界对象 → 位置变更监听器 */
  positionListeners: Map<WorldObjectLike, (e: { tileChanged: boolean }) => void>;
  /** 八叉树容器（init 创建） */
  container!: any;

  /** 相机更新时重裁剪。 */
  onCameraUpdate = (): void => {
    this.container.cullChildren();
  };

  /** 对象生成：创建可渲染并订阅位置变化。 */
  onWorldObjectSpawned = (t: WorldObjectLike): void => {
    const lightpost = t.isTechno() && t.rules.isLightpost;
    const i = this.createRenderable(t, lightpost ? this.worldScene : this.container);
    i.onCreate?.(this);
    this.worldScene.markBatchRebuild?.();
    const listener = ({ tileChanged }: { tileChanged: boolean }) =>
      this.onObjectPositionChanged(t, tileChanged);
    this.positionListeners.set(t, listener);
    t.position.onPositionChange.subscribe(listener);
  };

  /** 对象移除：退订、延迟/同步销毁可渲染。 */
  onWorldObjectRemoved = (t: WorldObjectLike): void => {
    t.position.onPositionChange.unsubscribe(this.positionListeners.get(t)!);
    this.positionListeners.delete(t);
    const i = this.renderablesByGameObject.get(t)!;
    if (i.onRemove) {
      const e = i.onRemove(this);
      if (e) {
        e.then(() => this.removeAndDisposeRenderable(i, t)).catch((e2) => console.error(e2));
      } else {
        this.removeAndDisposeRenderable(i, t);
      }
    } else {
      this.removeAndDisposeRenderable(i, t);
    }
  };

  constructor(
    world: WorldLike,
    worldScene: WorldSceneLike,
    camera: any,
    renderableFactory: RenderableFactoryLike,
  ) {
    this.world = world;
    this.worldScene = worldScene;
    this.camera = camera;
    this.renderableFactory = renderableFactory;
    this.renderablesByGameObject = new Map();
    this.renderablesById = new Map();
    this.positionListeners = new Map();
  }

  /** 创建八叉树容器、挂到场景并订阅世界事件。 */
  init(): void {
    const e = (this.container = OctreeContainer.factory(this.camera));
    e.autoCull = false;
    this.worldScene.add(e);
    this.worldScene.onCameraUpdate.subscribe(this.onCameraUpdate);
    this.world.getAllObjects().forEach((e2) => this.onWorldObjectSpawned(e2));
    this.world.onObjectSpawned.subscribe(this.onWorldObjectSpawned);
    this.world.onObjectRemoved.subscribe(this.onWorldObjectRemoved);
  }

  /**
   * 按对象 id 查可渲染。
   * @param e - 对象 id
   */
  getRenderableById(e: any): RenderableLike | undefined {
    return this.renderablesById.get(e);
  }

  /**
   * 按世界对象查可渲染。
   * @param e - 世界对象
   */
  getRenderableByGameObject(e: WorldObjectLike): RenderableLike | undefined {
    return this.renderablesByGameObject.get(e);
  }

  /** 取八叉树容器。 */
  getRenderableContainer(): any {
    return this.container;
  }

  /**
   * 对象位置变化时同步可渲染位置；非灯柱则更新八叉树子节点。
   * @param e - 世界对象
   * @param t - 是否 tile 变化（与孪生参数名一致）
   */
  onObjectPositionChanged(e: WorldObjectLike, t: boolean): void {
    const i = this.renderablesByGameObject.get(e)!;
    i.setPosition(e.position.worldPosition);
    if (!(e.isTechno() && e.rules.isLightpost)) {
      this.container.updateChild(i);
    }
  }

  /**
   * 从场景摘除并释放可渲染，删除索引。
   *
   * 在此标记 markBatchRebuild 而非 onWorldObjectRemoved，
   * 以便覆盖 onRemove 返回 Promise 的延迟路径。
   * @param e - 可渲染
   * @param t - 世界对象
   */
  removeAndDisposeRenderable(e: RenderableLike, t: WorldObjectLike): void {
    const i = t.isTechno() && t.rules.isLightpost ? this.worldScene : this.container;
    i.remove(e);
    e.dispose?.();
    this.renderablesByGameObject.delete(t);
    this.renderablesById.delete(t.id);
    this.worldScene.markBatchRebuild?.();
  }

  /**
   * 创建瞬时动画并加入容器。
   * @param e - 动画源对象
   * @param t - 可选初始化回调
   */
  createTransientAnim(e: any, t?: (r: any) => void): any {
    const i = this.renderableFactory.createTransientAnim(e, this.container);
    t?.(i);
    this.container.add(i);
    this.worldScene.markBatchRebuild?.();
    return i;
  }

  /**
   * 创建动画；unlessExternal 为 false 时加入容器。
   * @param e - 动画源
   * @param t - 可选初始化回调
   * @param i - 为 true 时不 add 到容器（孪生默认 !1）
   */
  createAnim(e: any, t?: (r: any) => void, i: boolean = false): any {
    const r = this.renderableFactory.createAnim(e);
    t?.(r);
    if (!i) {
      this.container.add(r);
      this.worldScene.markBatchRebuild?.();
    }
    return r;
  }

  /**
   * 把特效挂到世界场景。
   * @param e - 特效对象（需 setContainer）
   */
  addEffect(e: { setContainer(s: any): void }): void {
    e.setContainer(this.worldScene);
    this.worldScene.add(e);
    this.worldScene.markBatchRebuild?.();
  }

  /** 移除容器与全部订阅，释放所有可渲染。 */
  dispose(): void {
    this.worldScene.remove(this.container);
    this.container = undefined;
    this.worldScene.onCameraUpdate.unsubscribe(this.onCameraUpdate);
    this.world.onObjectSpawned.unsubscribe(this.onWorldObjectSpawned as any);
    this.world.onObjectRemoved.unsubscribe(this.onWorldObjectRemoved as any);
    // 孪生将这两个箭头函数属性置为 undefined（运行时赋值）
    (this as any).onWorldObjectRemoved = undefined;
    (this as any).onWorldObjectSpawned = undefined;
    this.positionListeners.forEach((e, t) => t.position.onPositionChange.unsubscribe(e));
    this.positionListeners.clear();
    this.renderablesById.forEach((e) => e.dispose?.());
  }

  /**
   * 创建并登记可渲染。
   * @param e - 世界对象
   * @param t - 目标父级（容器或场景）
   */
  createRenderable(e: WorldObjectLike, t: any): RenderableLike {
    const i = this.renderableFactory.create(e);
    i.setPosition(e.position.worldPosition);
    t.add(i);
    this.renderablesByGameObject.set(e, i);
    this.renderablesById.set(e.id, i);
    return i;
  }

  /** 刷新全部可渲染照明。 */
  updateLighting(): void {
    for (const e of this.renderablesById.values()) {
      e.updateLighting();
    }
  }
}
