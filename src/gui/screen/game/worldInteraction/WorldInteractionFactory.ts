/**
 * WorldInteractionFactory — 组装选择/默认动作/滚屏/tooltip 等交互栈。
 *
 * 由 gui/screen/game/worldInteraction/WorldInteractionFactory.ts.js
 * 重写为 TS（行为完全一致）。
 *
 * 两个文件并存期间，本文件才是修改目标：tools/repack.mjs 打包时优先采用 .ts 模块的编译产物。
 */
import { MapTileIntersectHelper } from "engine/util/MapTileIntersectHelper"; // 已转换
import { EntityIntersectHelper } from "engine/util/EntityIntersectHelper"; // 已转换
import { UnitSelectionHandler } from "gui/screen/game/worldInteraction/UnitSelectionHandler"; // 孪生
import { DefaultActionHandler } from "gui/screen/game/worldInteraction/DefaultActionHandler"; // 孪生
import { WorldInteraction } from "gui/screen/game/worldInteraction/WorldInteraction"; // 孪生
import { CameraPanHandler } from "gui/screen/game/worldInteraction/CameraPanHandler"; // 已转换
import { MapScrollHandler } from "gui/screen/game/worldInteraction/MapScrollHandler"; // 已转换
import { MapHoverHandler } from "gui/screen/game/worldInteraction/MapHoverHandler"; // 已转换
import { KeyboardHandler } from "gui/screen/game/worldInteraction/keyboard/KeyboardHandler"; // 已转换
import { RaycastHelper } from "engine/util/RaycastHelper"; // 已转换
import { WorldViewportHelper } from "engine/util/WorldViewportHelper"; // 已转换
import { TargetLines } from "engine/renderable/entity/TargetLines"; // 孪生
import { MinimapHandler } from "gui/screen/game/worldInteraction/MinimapHandler"; // 已转换
import { MapPanningHelper } from "engine/util/MapPanningHelper"; // 已转换
import { TooltipHandler } from "gui/screen/game/worldInteraction/TooltipHandler"; // 已转换
import { ArrowScrollHandler } from "gui/screen/game/worldInteraction/ArrowScrollHandler"; // 已转换
import { CustomScrollHandler } from "gui/screen/game/worldInteraction/CustomScrollHandler"; // 已转换

/* eslint-disable @typescript-eslint/no-explicit-any */

// 孪生 any-shim：跨组未完成的模块仍可运行时取命名空间
const UnitSelectionHandlerCtor: any = (UnitSelectionHandler as any)?.UnitSelectionHandler ?? UnitSelectionHandler;
const DefaultActionHandlerCtor: any = (DefaultActionHandler as any)?.DefaultActionHandler ?? DefaultActionHandler;
const WorldInteractionCtor: any = (WorldInteraction as any)?.WorldInteraction ?? WorldInteraction;
const TargetLinesCtor: any = (TargetLines as any)?.TargetLines ?? TargetLines;

/** 世界交互工厂。 */
export class WorldInteractionFactory {
  /** 玩家。 */
  player: any;
  /** 游戏。 */
  game: any;
  /** 单位选择。 */
  unitSelection: any;
  /** 渲染件管理。 */
  renderableManager: any;
  /** UI 场景。 */
  uiScene: any;
  /** 世界场景。 */
  worldScene: any;
  /** 指针。 */
  pointer: any;
  /** 渲染器。 */
  renderer: any;
  /** 键位。 */
  keyBinds: any;
  /** 通用选项。 */
  generalOptions: any;
  /** 自由镜头。 */
  freeCamera: any;
  /** 调试路径。 */
  debugPaths: any;
  /** 开发者模式。 */
  devMode: any;
  /** document。 */
  document: any;
  /** 小地图。 */
  minimap: any;
  /** 字符串。 */
  strings: any;
  /** tooltip 文本色。 */
  tooltipTextColor: any;
  /** tooltip 调试开关。 */
  tooltipDebugText: any;
  /** 战斗控制 API。 */
  battleControlApi: any;

  /**
   * @param player 玩家
   * @param game 游戏
   * @param unitSelection 选择
   * @param renderableManager 渲染件
   * @param uiScene UI 场景
   * @param worldScene 世界场景
   * @param pointer 指针
   * @param renderer 渲染器
   * @param keyBinds 键位
   * @param generalOptions 选项
   * @param freeCamera 自由镜头
   * @param debugPaths 调试路径
   * @param devMode 开发者
   * @param document document
   * @param minimap 小地图
   * @param strings 字符串
   * @param tooltipTextColor tooltip 色
   * @param tooltipDebugText tooltip 调试
   * @param battleControlApi 战斗控制
   */
  constructor(
    player: any,
    game: any,
    unitSelection: any,
    renderableManager: any,
    uiScene: any,
    worldScene: any,
    pointer: any,
    renderer: any,
    keyBinds: any,
    generalOptions: any,
    freeCamera: any,
    debugPaths: any,
    devMode: any,
    document: any,
    minimap: any,
    strings: any,
    tooltipTextColor: any,
    tooltipDebugText: any,
    battleControlApi: any,
  ) {
    this.player = player;
    this.game = game;
    this.unitSelection = unitSelection;
    this.renderableManager = renderableManager;
    this.uiScene = uiScene;
    this.worldScene = worldScene;
    this.pointer = pointer;
    this.renderer = renderer;
    this.keyBinds = keyBinds;
    this.generalOptions = generalOptions;
    this.freeCamera = freeCamera;
    this.debugPaths = debugPaths;
    this.devMode = devMode;
    this.document = document;
    this.minimap = minimap;
    this.strings = strings;
    this.tooltipTextColor = tooltipTextColor;
    this.tooltipDebugText = tooltipDebugText;
    this.battleControlApi = battleControlApi;
  }

  /** 创建完整 WorldInteraction。 */
  create(): any {
    const map = this.game.map;
    const scene = this.worldScene;
    const pointer = this.pointer;
    const renderer = this.renderer;
    const tileIntersect = new MapTileIntersectHelper(map, scene);
    const raycast = new RaycastHelper(scene);
    const viewportHelper = new WorldViewportHelper(scene);
    const entityIntersect = new EntityIntersectHelper(
      map,
      this.renderableManager,
      tileIntersect,
      raycast,
      scene,
      viewportHelper,
    );
    const selectionHandler = new UnitSelectionHandlerCtor(
      scene,
      this.uiScene,
      this.player,
      this.unitSelection,
      entityIntersect,
      this.game.rules.general.veteran.veteranCap,
    );
    const defaultAction = DefaultActionHandlerCtor.factory(
      this.renderableManager,
      this.unitSelection,
      selectionHandler,
      this.player,
      map,
      this.game,
      this.game.rules.audioVisual,
    );
    const shroud = this.player
      ? this.game.mapShroudTrait.getPlayerShroud(this.player)
      : void 0;
    const keyboard = new KeyboardHandler(this.keyBinds, this.devMode);
    const hoverHandler = new MapHoverHandler(
      entityIntersect,
      tileIntersect,
      map,
      shroud,
      renderer,
    );
    const scrollHandler = new MapScrollHandler(
      renderer.getCanvas(),
      scene.cameraPan,
      pointer,
      this.generalOptions.scrollRate,
      scene,
    );
    return new WorldInteractionCtor(
      scene,
      pointer,
      pointer.pointerEvents,
      new CameraPanHandler(
        scene.cameraPan,
        pointer,
        this.generalOptions.scrollRate,
        this.freeCamera,
        scene,
      ),
      scrollHandler,
      hoverHandler,
      new TooltipHandler(
        hoverHandler,
        this.tooltipTextColor,
        pointer,
        this.uiScene,
        this.renderer,
        this.strings,
        this.tooltipDebugText,
      ),
      selectionHandler,
      defaultAction,
      viewportHelper,
      new ArrowScrollHandler(scrollHandler),
      new CustomScrollHandler(scrollHandler),
      new MinimapHandler(
        this.minimap,
        map,
        shroud,
        scene,
        new MapPanningHelper(map),
      ),
      scene.cameraZoom,
      this.document,
      renderer,
      new TargetLinesCtor(
        this.player,
        this.unitSelection,
        scene.camera,
        this.debugPaths,
        this.generalOptions.targetLines,
      ),
      this.generalOptions.rightClickMove,
      this.generalOptions.rightClickScroll,
      this.battleControlApi,
    );
  }
}
