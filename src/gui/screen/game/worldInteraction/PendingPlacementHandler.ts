/**
 * PendingPlacementHandler — 待确认建筑的放置网格预览（事件清除）。
 *
 * 由 gui/screen/game/worldInteraction/PendingPlacementHandler.ts.js
 * 重写为 TS（行为完全一致）。
 */
import { EventType } from "game/event/EventType"; // 已转换
import { CompositeDisposable } from "util/disposable/CompositeDisposable"; // 已转换
import * as PlacementGridModule from "gui/screen/game/worldInteraction/placementMode/PlacementGrid"; // 孪生

/* eslint-disable @typescript-eslint/no-explicit-any */

// 孪生 any-shim
const PlacementGrid: any = (PlacementGridModule as any).PlacementGrid;

/** 待放置网格管理。 */
export class PendingPlacementHandler {
  /** 游戏。 */
  game: any;
  /** 建造工。 */
  constructionWorker: any;
  /** 渲染器。 */
  renderer: any;
  /** 世界场景。 */
  worldScene: any;
  /** 待放置列表。 */
  placements: any[] = [];
  /** 信息 → 网格模型。 */
  gridModels = new Map<any, any>();
  /** 信息 → 网格对象。 */
  grids = new Map<any, any>();
  /** 释放容器。 */
  disposables = new CompositeDisposable();
  /** 帧回调。 */
  onFrame: () => void;

  /**
   * 工厂。
   * @param game 游戏
   * @param player 玩家
   * @param renderer 渲染器
   * @param worldScene 场景
   */
  static factory(game: any, player: any, renderer: any, worldScene: any): PendingPlacementHandler {
    const worker = game.getConstructionWorker(player);
    return new this(game, worker, renderer, worldScene);
  }

  /**
   * @param game 游戏
   * @param constructionWorker 建造工
   * @param renderer 渲染器
   * @param worldScene 场景
   */
  constructor(game: any, constructionWorker: any, renderer: any, worldScene: any) {
    this.game = game;
    this.constructionWorker = constructionWorker;
    this.renderer = renderer;
    this.worldScene = worldScene;
    this.placements = [];
    this.gridModels = new Map();
    this.grids = new Map();
    this.disposables = new CompositeDisposable();
    this.onFrame = () => {
      for (const placement of this.placements) {
        const model = this.gridModels.get(placement);
        if (model) {
          const name = placement.rules.name;
          model.tiles = this.constructionWorker.getPlacementPreview(name, placement.tile, {
            normalizedTile: true,
          });
        }
      }
    };
  }

  /**
   * 推入待放置并加网格。
   * @param info 放置信息
   */
  pushPlacementInfo(info: any): void {
    this.placements.push(info);
    this.addGrid(info);
  }

  /** 订阅帧与放置事件。 */
  init(): void {
    this.renderer.onFrame.subscribe(this.onFrame);
    this.disposables.add(() => this.renderer.onFrame.unsubscribe(this.onFrame));
    this.disposables.add(
      this.game.events.subscribe(EventType.BuildingPlace, (e: any) => {
        this.removePendingPlacement(e.target.tile);
      }),
      this.game.events.subscribe(EventType.BuildingFailedPlace, (e: any) => {
        this.removePendingPlacement(e.tile);
      }),
    );
  }

  /**
   * 按 tile 移除待放置。
   * @param tile 目标 tile
   */
  removePendingPlacement(tile: any): void {
    const idx = this.placements.findIndex((p) => p.tile === tile);
    const info = this.placements[idx];
    if (idx !== -1) {
      this.placements.splice(idx, 1);
      this.removeGrid(info);
    }
  }

  /**
   * 为待放置创建网格。
   * @param info 放置信息
   */
  addGrid(info: any): void {
    const model = {
      tiles: this.constructionWorker.getPlacementPreview(info.rules.name, info.tile, {
        normalizedTile: true,
      }),
      visible: true,
      rangeIndicator: void 0,
      rangeIndicatorColor: void 0,
      showBusy: true,
    };
    const grid = new PlacementGrid(model, this.worldScene.camera, this.game.map.tiles);
    this.worldScene.add(grid);
    this.gridModels.set(info, model);
    this.grids.set(info, grid);
  }

  /**
   * 移除网格。
   * @param info 放置信息
   */
  removeGrid(info: any): void {
    const grid = this.grids.get(info);
    if (grid) {
      this.worldScene.remove(grid);
      grid.dispose();
      this.gridModels.delete(info);
    }
  }

  /** 清理全部。 */
  dispose(): void {
    for (const p of this.placements) this.removeGrid(p);
    this.disposables.dispose();
  }
}
