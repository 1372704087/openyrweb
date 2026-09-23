/**
 * Minimap — 小地图组件（迷雾颜色、视口框、雷达 ping）。
 *
 * 由 gui/screen/game/component/Minimap.ts.js 重写为 TS（行为完全一致）。
 */
import { UiObject } from "gui/UiObject"; // 已转换
import * as SpriteUtilsModule from "engine/gfx/SpriteUtils"; // 孪生
import { rectEquals, pointEquals } from "util/geometry"; // 已转换
import * as MinimapRendererModule from "engine/renderable/entity/map/MinimapRenderer"; // 孪生
import { MapTileIntersectHelper } from "engine/util/MapTileIntersectHelper"; // 已转换
import * as IsoCoordsModule from "engine/IsoCoords"; // 孪生
import { CompositeDisposable } from "util/disposable/CompositeDisposable"; // 已转换
import { EventDispatcher } from "util/event"; // 已转换
import { EventType } from "game/event/EventType"; // 已转换
import { MinimapPing } from "gui/screen/game/component/MinimapPing"; // 已转换
import * as RadarRulesModule from "game/rules/general/RadarRules"; // 孪生
import * as MinimapModelModule from "engine/renderable/entity/map/MinimapModel"; // 孪生
import { GameSpeed } from "game/GameSpeed"; // 已转换

/* eslint-disable @typescript-eslint/no-explicit-any */

// 孪生 any-shim
const SpriteUtils: any = SpriteUtilsModule as any;
const MinimapRenderer: any = (MinimapRendererModule as any).MinimapRenderer;
const IsoCoords: any = IsoCoordsModule as any;
const RadarEventType: any = (RadarRulesModule as any).RadarEventType;
const MinimapModel: any = (MinimapModelModule as any).MinimapModel;

/** 雷达事件配色。 */
const PING_COLORS = new Map<any, { high: number; low: number }>([
  [RadarEventType.EnemyObjectSensed, { high: 16776960, low: 8684544 }],
  [RadarEventType.GenericNonCombat, { high: 65535, low: 33924 }],
]);

/** 小地图。 */
export class Minimap extends UiObject {
  /** 游戏。 */
  game: any;
  /** 本地玩家。 */
  localPlayer: any;
  /** 边框色。 */
  borderColor: any;
  /** 雷达规则。 */
  radarRules: any;
  /** 释放容器。 */
  disposables = new CompositeDisposable();
  /** 待重算 tile。 */
  tilesForRecalc = new Set<any>();
  /** 待重绘 tile。 */
  tilesForRedraw = new Set<any>();
  /** 是否全量重绘。 */
  needsFullRedraw = false;
  /** 活动 ping。 */
  pings: any[] = [];
  /** 点击事件。 */
  private _onClick = new EventDispatcher();
  /** 右键事件。 */
  private _onRightClick = new EventDispatcher();
  /** 进入事件。 */
  private _onMouseOver = new EventDispatcher();
  /** 移动事件。 */
  private _onMouseMove = new EventDispatcher();
  /** 离开事件。 */
  private _onMouseOut = new EventDispatcher();
  /** 迷雾。 */
  shroud: any;
  /** 模型。 */
  minimapModel: any;
  /** 渲染器。 */
  minimapRenderer: any;
  /** 世界场景。 */
  worldScene: any;
  /** tile 相交辅助。 */
  mapTileIntersectHelper: any;
  /** 适配尺寸。 */
  fitSize: any;
  /** mesh。 */
  mesh: any;
  /** 纹理。 */
  texture: any;
  /** 包装对象。 */
  wrapperObj: any;
  /** 画布布局尺寸。 */
  size: any;
  /** 视口框。 */
  viewportOutline: any;
  /** 上次 pan。 */
  lastPan: any;
  /** 上次视口。 */
  lastViewport: any;
  /** 悬停 UV。 */
  queuedHoverUv: any;
  /** 上次 canvas 更新。 */
  lastCanvasUpdate: number | undefined;
  /** 指针事件（setPointerEvents 注入）。 */
  pointerEvents: any;
  /** tile 更新回调。 */
  handleTileUpdate: (e: any) => void;
  /** 迷雾更新回调。 */
  handleShroudUpdate: (e: any, shroud: any) => void;
  /** 对象变化回调。 */
  handleObjectChange: (e: any) => void;
  /** 雷达事件回调。 */
  handleRadarEvent: (e: any) => void;

  /** 点击事件。 */
  get onClick() {
    return this._onClick.asEvent();
  }

  /** 右键事件。 */
  get onRightClick() {
    return this._onRightClick.asEvent();
  }

  /** 鼠标进入。 */
  get onMouseOver() {
    return this._onMouseOver.asEvent();
  }

  /** 鼠标移动。 */
  get onMouseMove() {
    return this._onMouseMove.asEvent();
  }

  /** 鼠标离开。 */
  get onMouseOut() {
    return this._onMouseOut.asEvent();
  }

  /**
   * @param game 游戏
   * @param localPlayer 本地玩家
   * @param borderColor 边框色
   * @param radarRules 雷达规则
   */
  constructor(game: any, localPlayer: any, borderColor: any, radarRules: any) {
    super(new THREE.Object3D());
    this.game = game;
    this.localPlayer = localPlayer;
    this.borderColor = borderColor;
    this.radarRules = radarRules;
    this.disposables = new CompositeDisposable();
    this.tilesForRecalc = new Set();
    this.tilesForRedraw = new Set();
    this.needsFullRedraw = false;
    this.pings = [];
    this._onClick = new EventDispatcher();
    this._onRightClick = new EventDispatcher();
    this._onMouseOver = new EventDispatcher();
    this._onMouseMove = new EventDispatcher();
    this._onMouseOut = new EventDispatcher();
    this.handleTileUpdate = ({ tiles }: any) => {
      tiles.forEach((t: any) => {
        this.tilesForRecalc.add(t);
        this.tilesForRedraw.add(t);
      });
    };
    this.handleShroudUpdate = (e: any, shroud: any) => {
      if (e.type === "incremental") {
        e.coords.forEach((c: any) => {
          for (const t of shroud.findTilesAtShroudCoords(c, this.map.tiles)) {
            this.tilesForRedraw.add(t);
          }
        });
      } else {
        this.needsFullRedraw = true;
      }
    };
    this.handleObjectChange = (e: any) => {
      if (e.target.isSpawned) {
        this.map.tileOccupation
          .calculateTilesForGameObject(e.target.tile, e.target)
          .forEach((t: any) => {
            this.tilesForRecalc.add(t);
            this.tilesForRedraw.add(t);
          });
      }
    };
    this.handleRadarEvent = (event: any) => {
      if (event.target !== this.localPlayer) return;
      const xy = this.minimapRenderer.dxyToCanvas(event.tile.dx, event.tile.dy);
      const colors = PING_COLORS.get(event.radarEventType);
      const ping = new MinimapPing(
        this.radarRules,
        colors?.high ?? 16711935,
        colors?.low ?? 8650884,
      );
      ping.setPosition(
        this.wrapperObj.position.x + xy.x,
        this.wrapperObj.position.y + xy.y,
      );
      this.pings.push({
        obj: ping,
        startTime: void 0,
        duration: this.radarRules.getEventVisibilityDuration(event.radarEventType),
      });
    };
    this.shroud =
      localPlayer && game.mapShroudTrait.getPlayerShroud(localPlayer);
    this.minimapModel = new MinimapModel(
      game.map.tiles,
      game.map.tileOccupation,
      this.shroud,
      localPlayer,
      game.alliances,
      game.rules.general.paradrop,
    );
  }

  /** 地图 getter。 */
  get map(): any {
    return this.game.map;
  }

  /**
   * 设定适配尺寸并必要时重渲。
   * @param size 尺寸
   */
  setFitSize(size: any): void {
    const prev = this.fitSize;
    this.fitSize = size;
    if (size.width !== prev?.width || size.height !== prev?.height) {
      this.forceRerender();
    }
  }

  /** 强制重建 mesh。 */
  forceRerender(): void {
    if (!this.wrapperObj || !this.fitSize) return;
    this.get3DObject().remove(this.wrapperObj);
    this.destroyMesh();
    const { mesh, texture, wrapperObj, canvasLayoutSize } = this.renderMinimap(this.fitSize);
    this.mesh = mesh;
    this.texture = texture;
    this.wrapperObj = wrapperObj;
    this.size = canvasLayoutSize;
    this.get3DObject().add(wrapperObj);
    this.setupListeners(this.mesh);
    this.lastViewport = void 0;
  }

  /**
   * 绑定世界场景以显示视口框。
   * @param worldScene 世界场景
   */
  initWorld(worldScene: any): void {
    this.worldScene = worldScene;
    this.mapTileIntersectHelper = new MapTileIntersectHelper(this.map, worldScene);
  }

  /**
   * 切换本地玩家（迷雾/模型/重渲）。
   * @param player 玩家
   */
  changeLocalPlayer(player: any): void {
    this.localPlayer = player;
    this.shroud?.onChange.unsubscribe(this.handleShroudUpdate);
    this.shroud = this.localPlayer && this.game.mapShroudTrait.getPlayerShroud(this.localPlayer);
    this.shroud?.onChange.subscribe(this.handleShroudUpdate);
    this.minimapModel = new MinimapModel(
      this.game.map.tiles,
      this.game.map.tileOccupation,
      this.shroud,
      this.localPlayer,
      this.game.alliances,
      this.game.rules.general.paradrop,
    );
    this.forceRerender();
  }

  /** 首次渲染并挂事件。 */
  create3DObject(): void {
    super.create3DObject();
    if (this.mesh) return;
    const fit = this.fitSize;
    if (!fit) throw new Error("setFitSize must be called before first render");
    const { mesh, texture, wrapperObj, canvasLayoutSize } = this.renderMinimap(fit);
    this.mesh = mesh;
    this.texture = texture;
    this.wrapperObj = wrapperObj;
    this.size = canvasLayoutSize;
    this.get3DObject().add(wrapperObj);
    this.setupListeners(this.mesh);
    this.map.tileOccupation.onChange.subscribe(this.handleTileUpdate);
    this.disposables.add(() =>
      this.map.tileOccupation.onChange.unsubscribe(this.handleTileUpdate),
    );
    this.shroud?.onChange.subscribe(this.handleShroudUpdate);
    this.disposables.add(
      this.game.events.subscribe(EventType.ObjectOwnerChange, this.handleObjectChange),
      this.game.events.subscribe(EventType.ObjectDisguiseChange, this.handleObjectChange),
      this.game.events.subscribe(EventType.ObjectDestroy, (e: any) => {
        if (!e.target.isBuilding() || !e.target.rules.leaveRubble) return;
        this.map.tileOccupation
          .calculateTilesForGameObject(e.target.tile, e.target)
          .forEach((t: any) => {
            this.tilesForRecalc.add(t);
            this.tilesForRedraw.add(t);
          });
      }),
      this.game.events.subscribe(EventType.RadarEvent, this.handleRadarEvent),
    );
  }

  /**
   * 全量渲染并包装。
   * @param fit 适配尺寸
   */
  renderMinimap(fit: any): any {
    this.minimapRenderer = new MinimapRenderer(
      this.map,
      this.minimapModel,
      fit,
      this.borderColor,
      2,
    );
    this.minimapModel.computeAllColors();
    const full = this.minimapRenderer.renderFull();
    const layout = { width: 0.5 * full.width, height: 0.5 * full.height };
    const pos = this.computeMinimapPosition(fit, layout);
    const texture = this.createTexture(full);
    const mesh = this.createMesh(texture, layout.width, layout.height);
    const wrapper = new THREE.Object3D();
    wrapper.matrixAutoUpdate = false;
    wrapper.position.x = pos.x;
    wrapper.position.y = pos.y;
    wrapper.updateMatrix();
    wrapper.add(mesh);
    return { mesh, texture, wrapperObj: wrapper, canvasLayoutSize: layout };
  }

  /**
   * 居中位置。
   * @param fit 适配
   * @param layout 布局
   */
  computeMinimapPosition(fit: any, layout: any): any {
    return {
      x: Math.floor((fit.width - layout.width) / 2),
      y: Math.floor((fit.height - layout.height) / 2),
    };
  }

  /**
   * 纹理。
   * @param canvas 源
   */
  createTexture(canvas: any): any {
    const texture = new THREE.Texture(canvas);
    texture.needsUpdate = true;
    texture.flipY = false;
    texture.minFilter = THREE.NearestFilter;
    texture.magFilter = THREE.NearestFilter;
    return texture;
  }

  /**
   * mesh。
   * @param texture 纹理
   * @param width 宽
   * @param height 高
   */
  createMesh(texture: any, width: number, height: number): any {
    const geometry = SpriteUtils.createRectGeometry(width, height);
    SpriteUtils.addRectUvs(geometry, { x: 0, y: 0, width, height }, { width, height });
    geometry.translate(width / 2, height / 2, 0);
    const material = new THREE.MeshBasicMaterial({ map: texture, side: THREE.DoubleSide });
    const mesh = new THREE.Mesh(geometry, material);
    mesh.matrixAutoUpdate = false;
    mesh.frustumCulled = false;
    return mesh;
  }

  /**
   * 挂指针监听。
   * @param mesh 目标
   */
  setupListeners(mesh: any): void {
    if (!this.pointerEvents) throw new Error("Must call setPointerEvents before rendering");
    this.disposables.add(
      this.pointerEvents.addEventListener(mesh, "click", (e: any) => {
        const tile = this.computeIntersectionTile(e.intersection.uv);
        if (!tile) return;
        if (e.button === 2 || e.isTouch) {
          this._onRightClick.dispatch(this, tile);
        } else if (e.button === 0) {
          this._onClick.dispatch(this, tile);
        }
      }),
      this.pointerEvents.addEventListener(mesh, "mouseover", () =>
        this._onMouseOver.dispatch(this),
      ),
      this.pointerEvents.addEventListener(mesh, "mousemove", (e: any) => {
        this.queuedHoverUv = e.intersection.uv;
      }),
      this.pointerEvents.addEventListener(mesh, "mouseout", () =>
        this._onMouseOut.dispatch(this),
      ),
    );
  }

  /**
   * UV → tile。
   * @param uv UV
   */
  computeIntersectionTile(uv: any): any {
    return this.canvasCoordsToTile(uv.x * this.size.width, uv.y * this.size.height);
  }

  /**
   * 画布坐标 → tile。
   * @param x x
   * @param y y
   */
  canvasCoordsToTile(x: number, y: number): any {
    const dxy = this.minimapRenderer.canvasToDxy(x, y);
    dxy.x = Math.round(dxy.x);
    dxy.y = Math.round(dxy.y);
    return this.map.tiles.getByDisplayCoords(dxy.x, dxy.y + ((dxy.x % 2) - (dxy.y % 2)));
  }

  /**
   * 30Hz 更新颜色/视口/ping。
   * @param now 帧时间
   */
  update(now: number): void {
    super.update(now);
    if (this.lastCanvasUpdate && now - this.lastCanvasUpdate < 1e3 / 30) return;
    if (this.tilesForRecalc.size) {
      this.minimapModel.updateColors(this.tilesForRecalc);
      this.tilesForRecalc.clear();
    }
    if (this.needsFullRedraw) {
      this.minimapRenderer.renderFull();
      this.texture.needsUpdate = true;
      this.needsFullRedraw = false;
      this.tilesForRedraw.clear();
    }
    if (this.tilesForRedraw.size) {
      this.lastCanvasUpdate = now;
      this.minimapRenderer.renderIncremental(this.tilesForRedraw);
      this.texture.needsUpdate = true;
      this.tilesForRedraw.clear();
    }
    if (this.worldScene) {
      const pan = this.worldScene.cameraPan.getPan();
      const viewport = this.worldScene.viewport;
      const viewportChanged =
        !this.lastViewport || !rectEquals(viewport, this.lastViewport);
      if (!pointEquals(pan, this.lastPan) || viewportChanged) {
        this.lastPan = pan;
        this.lastViewport = viewport;
        const centerTile = this.mapTileIntersectHelper.getTileAtScreenPoint({
          x: viewport.x + viewport.width / 2,
          y: viewport.y + viewport.height / 2,
        });
        if (!centerTile) {
          console.warn("Current pan intersects no map tile");
          return;
        }
        const half = IsoCoords.screenToScreenTile(viewport.width / 2, viewport.height / 2);
        const region = {
          x: centerTile.dx - half.x,
          y: centerTile.dy - half.y,
          width: 2 * half.x,
          height: 2 * half.y,
        };
        if (!this.viewportOutline || viewportChanged) {
          const a = this.minimapRenderer.dxyToCanvas(region.x, region.y);
          const b = this.minimapRenderer.dxyToCanvas(
            region.x + region.width,
            region.y + region.height,
          );
          const size = { width: b.x - a.x, height: b.y - a.y };
          if (this.viewportOutline) {
            this.updateOutlineSize(this.viewportOutline, size.width, size.height);
          } else {
            this.viewportOutline = this.createViewportOutline(size.width, size.height);
            this.viewportOutline.matrixAutoUpdate = false;
            this.wrapperObj.add(this.viewportOutline);
          }
        }
        const outlinePos = this.minimapRenderer.dxyToCanvas(region.x, region.y);
        this.viewportOutline.position.x = Math.max(2, Math.floor(outlinePos.x));
        this.viewportOutline.position.y = Math.max(1, Math.floor(outlinePos.y));
        this.viewportOutline.updateMatrix();
      }
    }
    if (this.queuedHoverUv) {
      const tile = this.computeIntersectionTile(this.queuedHoverUv);
      if (tile) this._onMouseMove.dispatch(this, tile);
      this.queuedHoverUv = void 0;
    }
    this.pings.forEach((entry) => {
      if (entry.startTime) {
        const lifeMs =
          entry.duration /
          ((GameSpeed.BASE_TICKS_PER_SECOND / 1e3) * this.game.speed.value);
        if (now - entry.startTime > lifeMs) {
          this.remove(entry.obj);
          entry.obj.destroy();
          this.pings.splice(this.pings.indexOf(entry), 1);
        }
      } else {
        entry.startTime = now;
        this.add(entry.obj);
      }
    });
  }

  /**
   * 视口线框。
   * @param w 宽
   * @param h 高
   */
  createViewportOutline(w: number, h: number): any {
    const geometry = new THREE.Geometry();
    geometry.vertices.push(
      new THREE.Vector3(0, 0, 0),
      new THREE.Vector3(0, h, 0),
      new THREE.Vector3(w, h, 0),
      new THREE.Vector3(w, 0, 0),
      new THREE.Vector3(0, 0, 0),
    );
    const material = new THREE.LineBasicMaterial({
      color: this.borderColor,
      transparent: true,
      side: THREE.DoubleSide,
    });
    return new THREE.Line(geometry, material);
  }

  /**
   * 更新线框尺寸。
   * @param outline 线
   * @param w 宽
   * @param h 高
   */
  updateOutlineSize(outline: any, w: number, h: number): void {
    const geometry = outline.geometry;
    geometry.vertices[1].set(0, h, 0);
    geometry.vertices[2].set(w, h, 0);
    geometry.vertices[3].set(w, 0, 0);
    geometry.verticesNeedUpdate = true;
  }

  /** 释放。 */
  destroy(): void {
    super.destroy();
    this.destroyMesh();
    this.shroud?.onChange.unsubscribe(this.handleShroudUpdate);
    this.disposables.dispose();
  }

  /** 释放 mesh/纹理/框。 */
  destroyMesh(): void {
    if (this.mesh) {
      this.mesh.geometry.dispose();
      this.mesh.material.dispose();
    }
    this.texture?.dispose();
    this.destroyViewportOutline();
  }

  /** 释放视口框。 */
  destroyViewportOutline(): void {
    if (!this.viewportOutline) return;
    this.wrapperObj?.remove(this.viewportOutline);
    this.viewportOutline.geometry.dispose();
    this.viewportOutline.material.dispose();
    this.viewportOutline = void 0;
  }
}
