/**
 * PlacementMode — 建筑放置模式（预览网格 + 射程圈 + 落点事件）。
 *
 * 由 gui/screen/game/worldInteraction/PlacementMode.ts.js
 * 重写为 TS（行为完全一致）。
 *
 * 两个文件并存期间，本文件才是修改目标：tools/repack.mjs 打包时优先采用 .ts 模块的编译产物。
 */
import { PlacementGrid } from "gui/screen/game/worldInteraction/placementMode/PlacementGrid"; // 孪生
import { circleIntersect } from "util/geometry"; // 已转换
import { EventDispatcher } from "util/event"; // 已转换
import { ObjectType } from "engine/type/ObjectType"; // 已转换

/* eslint-disable @typescript-eslint/no-explicit-any */

// 孪生 any-shim：PlacementGrid 若未转换
const PlacementGridCtor: any = (PlacementGrid as any) ?? PlacementGrid;

/** 建筑放置模式。 */
export class PlacementMode {
  /** 游戏。 */
  game: any;
  /** 玩家。 */
  player: any;
  /** 建造工。 */
  constrWorker: any;
  /** 渲染器。 */
  renderer: any;
  /** EVA。 */
  eva: any;
  /** 放置网格。 */
  placementGrid: any;
  /** 世界场景。 */
  worldScene: any;
  /** 是否防御建筑（有射程圈）。 */
  defenseMode = false;
  /** 已有同类建筑射程圈。 */
  buildingRanges = new Map<any, any>();
  /** 放置请求事件源。 */
  private _onBuildingPlaceRequest = new EventDispatcher();
  /** 当前建筑规则。 */
  currentBuilding: any;
  /** 当前悬停 tile。 */
  currentTile: any;
  /** 上次 tile。 */
  lastTile: any;
  /** 上次刷新。 */
  lastUpdate: number | undefined;
  /** 当前圈半径。 */
  currentRangeCircleRadius: number | undefined;
  /** 网格模型。 */
  placementGridModel: any;
  /** 帧回调。 */
  onFrame: (now: number) => void;

  /** 放置请求事件（原始 dispatcher，与孪生 getter 相同）。 */
  get onBuildingPlaceRequest() {
    return this._onBuildingPlaceRequest;
  }

  /**
   * 工厂：创建网格并挂 model。
   * @param game 游戏
   * @param player 玩家
   * @param renderer 渲染器
   * @param worldScene 场景
   * @param eva EVA
   */
  static factory(game: any, player: any, renderer: any, worldScene: any, eva: any): PlacementMode {
    const worker = game.getConstructionWorker(player);
    const model = {
      tiles: [],
      visible: false,
      rangeIndicator: void 0,
      rangeIndicatorColor: void 0,
    };
    const inst = new this(
      game,
      player,
      worker,
      renderer,
      eva,
      new PlacementGridCtor(model, worldScene.camera, game.map.tiles),
      worldScene,
    );
    inst.placementGridModel = model;
    return inst;
  }

  /**
   * @param game 游戏
   * @param player 玩家
   * @param constrWorker 建造工
   * @param renderer 渲染器
   * @param eva EVA
   * @param placementGrid 网格
   * @param worldScene 场景
   */
  constructor(
    game: any,
    player: any,
    constrWorker: any,
    renderer: any,
    eva: any,
    placementGrid: any,
    worldScene: any,
  ) {
    this.game = game;
    this.player = player;
    this.constrWorker = constrWorker;
    this.renderer = renderer;
    this.eva = eva;
    this.placementGrid = placementGrid;
    this.worldScene = worldScene;
    this.defenseMode = false;
    this.buildingRanges = new Map();
    this._onBuildingPlaceRequest = new EventDispatcher();
    this.onFrame = (now: number) => {
      if (
        this.lastTile !== this.currentTile ||
        !this.lastUpdate ||
        now - this.lastUpdate >= 1e3 / 15
      ) {
        this.lastTile = this.currentTile;
        this.lastUpdate = now;
        if (this.currentBuilding) this.updateGridModel(this.currentBuilding.name);
      }
    };
  }

  /** 把网格挂进场景。 */
  init(): void {
    this.worldScene.add(this.placementGrid);
  }

  /** 卸网格并结束放置。 */
  dispose(): void {
    this.worldScene.remove(this.placementGrid);
    this.placementGrid.dispose();
    this.endConstrMode();
  }

  /** 进入：清状态并订阅帧。 */
  enter(): void {
    this.currentTile = void 0;
    this.lastTile = void 0;
    this.lastUpdate = void 0;
    this.renderer.onFrame.subscribe(this.onFrame);
  }

  /**
   * 设置待建建筑；主厂/径向指示开启防御模式。
   * @param building 规则
   */
  setBuilding(building: any): void {
    this.currentBuilding = building;
    if (building.primary || building.hasRadialIndicator) {
      this.defenseMode = true;
      this.prepareBuildingRanges(building);
    } else {
      this.defenseMode = false;
    }
  }

  /** 当前建筑。 */
  getBuilding(): any {
    return this.currentBuilding;
  }

  /**
   * 悬停更新 tile。
   * @param hover 悬停
   * @param secondary 右键
   */
  hover(hover: any, secondary: boolean): void {
    if (secondary) return;
    const tile = hover?.tile;
    if (tile !== this.currentTile) this.currentTile = tile;
  }

  /**
   * 刷新预览格与射程圈。
   * @param buildingName 建筑名
   */
  updateGridModel(buildingName: string): void {
    const tile = this.currentTile;
    if (tile) {
      const tiles = this.constrWorker.getPlacementPreview(buildingName, tile);
      this.placementGridModel.tiles = tiles;
      this.placementGridModel.visible = true;
      if (this.defenseMode) {
        this.showBuildingRangeOverlays(tile, buildingName);
        this.placementGridModel.rangeIndicator = this.getBuildingRangeCircle(tile, buildingName);
        this.placementGridModel.rangeIndicatorColor = this.player.color.asHex();
      } else {
        this.placementGridModel.rangeIndicator = void 0;
      }
    } else {
      this.placementGridModel.visible = false;
    }
  }

  /**
   * 请求放置；不可放置播 EVA 并结束。
   * @param hover 悬停
   * @param secondary 右键
   */
  execute(hover: any, secondary: boolean): boolean | void {
    if (!this.currentBuilding || secondary) return false;
    const tile = hover?.tile;
    if (!tile) return false;
    if (this.player.production.isAvailableForProduction(this.currentBuilding)) {
      if (!this.constrWorker.canPlaceAt(this.currentBuilding.name, tile)) {
        this.eva.play("EVA_CannotDeployHere");
        return false;
      }
      this._onBuildingPlaceRequest.dispatch(this, {
        rules: this.currentBuilding,
        tile: this.constrWorker.normalizePlacementTile(this.currentBuilding.name, tile),
      });
      this.endConstrMode();
    } else {
      this.endConstrMode();
    }
  }

  /** 取消=结束。 */
  cancel(): void {
    this.endConstrMode();
  }

  /** 清状态并退订帧。 */
  endConstrMode(): void {
    this.defenseMode = false;
    this.placementGridModel.visible = false;
    this.hideBuildingRangeOverlays();
    this.buildingRanges.clear();
    this.currentBuilding = void 0;
    this.renderer.onFrame.unsubscribe(this.onFrame);
  }

  /** 隐藏全部武器射程线。 */
  hideBuildingRangeOverlays(): void {
    this.buildingRanges.forEach((_circle, building) => {
      building.showWeaponRange = false;
    });
  }

  /**
   * 按当前圈决定各建筑是否显示射程。
   * @param tile 中心 tile
   * @param buildingName 建筑名
   */
  showBuildingRangeOverlays(tile: any, buildingName: string): void {
    const circle = this.getBuildingRangeCircle(tile, buildingName);
    this.buildingRanges.forEach((_v, building) => {
      building.showWeaponRange = circleIntersect(circle, _v);
    });
  }

  /**
   * 当前待建建筑的射程圆。
   * @param tile tile
   * @param buildingName 名
   */
  getBuildingRangeCircle(tile: any, buildingName: string): any {
    const foundation = this.game.art.getObject(buildingName, ObjectType.Building).foundation;
    return {
      center: {
        x: tile.rx + (foundation.width % 2 !== 0 ? 0.5 : 0),
        y: tile.ry + (foundation.height % 2 !== 0 ? 0.5 : 0),
      },
      radius: this.currentRangeCircleRadius,
    };
  }

  /**
   * 计算半径并收集己方同类建筑圈。
   * @param building 待建规则
   */
  prepareBuildingRanges(building: any): void {
    const same = [...this.player.buildings].filter((b: any) => b.name === building.name);
    if (building.psychicDetectionRadius) {
      this.currentRangeCircleRadius = building.psychicDetectionRadius;
    } else if (building.gapGenerator) {
      this.currentRangeCircleRadius = building.gapRadiusInCells;
    } else if (building.primary) {
      this.currentRangeCircleRadius = this.game.rules.getWeapon(building.primary).range;
    }
    this.buildingRanges.clear();
    same.forEach((b: any) => {
      const tile = b.tile;
      const foundation = this.game.art.getObject(b.name, ObjectType.Building).foundation;
      const center = { x: tile.rx + foundation.width / 2, y: tile.ry + foundation.height / 2 };
      const radius =
        b.psychicDetectorTrait?.radiusTiles ??
        b.gapGeneratorTrait?.radiusTiles ??
        b.primaryWeapon?.range;
      if (radius) this.buildingRanges.set(b, { center, radius });
    });
  }
}
