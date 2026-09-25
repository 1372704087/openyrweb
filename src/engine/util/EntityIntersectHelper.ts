/**
 * EntityIntersectHelper — 屏幕盒/屏幕点与可渲染实体的相交查询。
 *
 * 由 engine/util/EntityIntersectHelper.ts.js 重写为 TS（行为完全一致）。两个
 * 文件并存期间，本文件才是修改目标：tools/repack.mjs 打包时优先采用 .ts
 * 模块的编译产物。
 *
 * 依赖 util/geometry.rectContainsPoint、MapTileIntersectHelper、RaycastHelper
 * 与 WorldViewportHelper；场景对象仅用到 viewport 与 3D 根对象。
 *
 * THREE.Object3D 未列入 three-global.d.ts 最小声明，本文件以局部 any 别名
 * 对齐运行时行为（不扩展全局 ambient，避免影响其它组）。
 *
 * 两个文件并存期间，本文件才是修改目标：tools/repack.mjs 打包时优先采用 .ts 模块的编译产物。
 */
import * as GeometryUtil from "util/geometry"; // 孪生

/* eslint-disable @typescript-eslint/no-explicit-any */
/** 局部别名：three-global 尚未声明 Object3D。 */
type Object3D = any;

/** 屏幕点。 */
interface Point {
  x: number;
  y: number;
}

/** 轴对齐屏幕矩形（含 x/y 原点与 width/height）。 */
interface Rect {
  x: number;
  y: number;
  width: number;
  height: number;
}

/** 业务对象：是否单位/建筑/销毁/坠毁以及可选相交目标。 */
interface GameObjectLike {
  position: { worldPosition: unknown };
  isDestroyed?: boolean;
  isCrashing?: boolean;
  isUnit(): boolean;
  isBuilding(): boolean;
}

/** 可渲染体：持有业务对象与可选相交网格。 */
interface RenderableLike {
  gameObject: GameObjectLike;
  getIntersectTarget?(): Object3D | Object3D[] | undefined;
}

/** 场景根 Object3D 与屏幕视口。 */
interface SceneLike {
  viewport: Rect;
  get3DObject(): Object3D;
}

/** Raycast 命中项（兼容 THREE.Intersection）。 */
interface RayHit {
  object: Object3D;
  point: Point;
}

/** 渲染管理器：容器、按 id/业务对象查找、按业务对象反查。 */
interface RenderableManagerLike {
  getRenderableContainer(): { get3DObject(): Object3D } | null | undefined;
  getRenderableById(id: unknown): RenderableLike;
  getRenderableByGameObject(gameObject: unknown): RenderableLike;
}

/** 格子相交：屏幕点 → 地图格。 */
interface MapTileIntersectHelperLike {
  getTileAtScreenPoint(point: Point): unknown;
}

/** 射线相交。 */
interface RaycastHelperLike {
  intersect(point: Point, targets: Object3D[], recursive?: boolean): RayHit[];
}

/** 屏幕盒与世界点相交。 */
interface WorldViewportHelperLike {
  intersectsScreenBox(worldPosition: unknown, box: Rect): boolean;
}

/** 最小地图接口。 */
interface MapLike {
  getObjectsOnTile(tile: unknown): GameObjectLike[];
}

/** 屏幕盒/点 → 实体相交查询助手。 */
export class EntityIntersectHelper {
  private map: MapLike;
  private renderableManager: RenderableManagerLike;
  private mapTileIntersectHelper: MapTileIntersectHelperLike;
  private raycastHelper: RaycastHelperLike;
  private scene: SceneLike;
  private worldViewportHelper: WorldViewportHelperLike;

  constructor(
    map: MapLike,
    renderableManager: RenderableManagerLike,
    mapTileIntersectHelper: MapTileIntersectHelperLike,
    raycastHelper: RaycastHelperLike,
    scene: SceneLike,
    worldViewportHelper: WorldViewportHelperLike,
  ) {
    this.map = map;
    this.renderableManager = renderableManager;
    this.mapTileIntersectHelper = mapTileIntersectHelper;
    this.raycastHelper = raycastHelper;
    this.scene = scene;
    this.worldViewportHelper = worldViewportHelper;
  }

  /**
   * 屏幕盒内的全部实体（去重后的 Renderable）。
   * 先 DFS 收集相交网格 → 挂到渲染 id → Set 去重 →
   * 再按世界原点位置与 screenBox 相交过滤。
   */
  getEntitiesAtScreenBox(screenBox: Rect): RenderableLike[] {
    const container = this.renderableManager.getRenderableContainer();
    if (!container) return [];
    const targets = this.collectIntersectTargets(container.get3DObject());
    const unique = new Set<RenderableLike>();
    targets.forEach((obj) => unique.add(this.renderableManager.getRenderableById(this.findRenderableId(obj))));
    return [...unique].filter((renderable) =>
      this.worldViewportHelper.intersectsScreenBox(renderable.gameObject.position.worldPosition, screenBox),
    );
  }

  /**
   * 屏幕点拾取优先级（与孪生一致）：
   * 1) 视口外 → undefined；
   * 2) 任一单位命中 → 直接返回；
   * 3) 有相交网格的建筑命中 → 查格上建筑是否命中：命中则用该建筑 + 建筑命中点，
   *    无 tile / 格上无合格建筑 → undefined（孪生隐式，不回退 buildingHit）；
   * 4) 无单位/建筑 → 返回第一个命中；完全无命中 → undefined。
   */
  getEntityAtScreenPoint(screenPoint: Point): { renderable: RenderableLike; point: Point } | undefined {
    const viewport: Rect = this.scene.viewport;
    if (!GeometryUtil.rectContainsPoint(viewport, screenPoint)) return undefined;
    const container = this.renderableManager.getRenderableContainer();
    if (!container) return undefined;
    const targets = this.collectIntersectTargets(container.get3DObject());
    const hits = this.raycastHelper.intersect(screenPoint, targets, false);
    if (!hits.length) return undefined;

    const candidates = hits.map((hit) => ({
      renderable: this.renderableManager.getRenderableById(this.findRenderableId(hit.object)),
      point: hit.point,
    }));

    const unitHit = candidates.find((c) => c.renderable.gameObject.isUnit());
    if (unitHit) return unitHit;

    const buildingHit = candidates.find(
      (c) => c.renderable.gameObject.isBuilding() && c.renderable.getIntersectTarget?.(),
    );
    if (!buildingHit) return candidates[0];

    const tile = this.mapTileIntersectHelper.getTileAtScreenPoint(screenPoint);
    // 孪生两路径隐式返回 undefined：无 tile / 格上无合格建筑时都不回退 buildingHit
    if (!tile) return undefined;

    const objectOnTile = this.map.getObjectsOnTile(tile).find((obj) => {
      if (!obj.isBuilding()) return false;
      const renderable = this.renderableManager.getRenderableByGameObject(obj);
      return void 0 !== renderable.getIntersectTarget?.();
    });
    if (!objectOnTile) return undefined;

    return { renderable: this.renderableManager.getRenderableByGameObject(objectOnTile), point: buildingHit.point };
  }

  /**
   * DFS 收集可见子树中的相交网格。
   * - 根不可见 → 空数组（含 children 整棵剪枝）。
   * - 带 userData.id：查 Renderable，找不到抛错；对象已销毁/坠毁则跳过本节点；
   *   否则展开 getIntersectTarget（数组 spread / 单值 push / undefined 跳过）。
   * - 再递归可见 children。
   */
  collectIntersectTargets(root: Object3D): Object3D[] {
    const out: Object3D[] = [];
    if (!root.visible) return out;
    if (void 0 !== root.userData.id) {
      const renderable = this.renderableManager.getRenderableById(root.userData.id);
      if (!renderable) throw new Error(`Entity not found (id = "${root.userData.id}")`);
      let target: Object3D | Object3D[] | undefined;
      if (!renderable.gameObject.isDestroyed && !renderable.gameObject.isCrashing) {
        target = renderable.getIntersectTarget?.();
        if (Array.isArray(target)) out.push(...target);
        else if (target) out.push(target);
      }
    }
    root.children.forEach((child: Object3D) => {
      if (child.visible) out.push(...this.collectIntersectTargets(child));
    });
    return out;
  }

  /**
   * 沿 parent 链上溯，找到第一个带 userData.id 的祖先。
   * 与孪生 for 条件一致：先取当前 id 再上移 parent；仅当「当前无 id 且仍
   * 有更上层 parent」时继续。全部无 id 则抛错。
   */
  findRenderableId(object: Object3D): unknown {
    let id: unknown;
    for (; (id = object.userData.id), (object = object.parent!), void 0 === id && object.parent; );
    if (void 0 === id) throw new Error("No attached renderable ID found for Object3D.");
    return id;
  }
}
