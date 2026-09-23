/**
 * tools/AircraftTester — 飞行器点看调试页（姿态/选中/老练/超时空）。
 *
 * main：800×600 Renderer + WorldScene（背景 0xc0c0c0）+ Temperate 地图 +
 * Rules/Art + CanvasMetrics/Pointer/CameraZoom + 网格/地板 + 文件列表；
 * selectAircraft 组装 RenderableFactory 全家桶并创建 Aircraft 对象；
 * buildControls 提供颜色/选中级别/老练/姿态滑条/移动/超时空/销毁控件。
 *
 * 由 tools/AircraftTester.ts.js 重写为 TS（行为完全一致）。两个文件并存期间，
 * 本文件才是修改目标：tools/repack.mjs 打包时优先采用 .ts 模块的编译产物。
 */
import * as RendererNs from "engine/gfx/Renderer"; // 孪生
import * as EngineNs from "engine/Engine"; // 孪生
import * as CoordsNs from "game/Coords"; // 孪生
import * as IsoCoordsNs from "engine/IsoCoords"; // 孪生
import * as PlayerNs from "game/Player"; // 孪生
import * as WorldSceneNs from "engine/renderable/WorldScene"; // 孪生
import * as RulesNs from "game/rules/Rules"; // 孪生
import * as MapGridNs from "engine/renderable/entity/map/MapGrid"; // 孪生
import * as BoxedVarNs from "util/BoxedVar"; // 已转换
import * as UiAnimationLoopNs from "engine/UiAnimationLoop"; // 孪生
import * as ImageFinderNs from "engine/ImageFinder"; // 孪生
import * as ArtNs from "game/art/Art"; // 孪生
import * as RenderableFactoryNs from "engine/renderable/entity/RenderableFactory"; // 孪生
import * as TheaterTypeNs from "engine/TheaterType"; // 已转换
import * as AlliancesNs from "game/Alliances"; // 孪生
import * as PlayerListNs from "game/PlayerList"; // 孪生
import * as SelectionLevelNs from "game/gameobject/selection/SelectionLevel"; // 孪生
import * as VeteranLevelNs from "game/gameobject/unit/VeteranLevel"; // 已转换
import * as PointerEventsNs from "gui/PointerEvents"; // 孪生
import * as CompositeDisposableNs from "util/disposable/CompositeDisposable"; // 已转换
import * as UnitSelectionNs from "game/gameobject/selection/UnitSelection"; // 孪生
import * as CameraZoomControlsNs from "tools/CameraZoomControls"; // 已转换
import * as LightingNs from "engine/Lighting"; // 孪生
import * as ObjectFactoryNs from "game/gameobject/ObjectFactory"; // 孪生
import * as TileCollectionNs from "game/map/TileCollection"; // 孪生
import * as ObjectTypeNs from "engine/type/ObjectType"; // 已转换
import * as MoveTraitNs from "game/gameobject/trait/MoveTrait"; // 孪生
import * as TileOccupationNs from "game/map/TileOccupation"; // 孪生
import * as BridgesNs from "game/map/Bridges"; // 孪生
import * as RenderableManagerNs from "engine/RenderableManager"; // 孪生
import * as WorldNs from "game/World"; // 孪生
import * as StringsNs from "data/Strings"; // 孪生
import * as MapBoundsNs from "game/map/MapBounds"; // 孪生
import * as FlyerHelperModeNs from "engine/renderable/entity/unit/FlyerHelperMode"; // 孪生
import * as LightingDirectorNs from "engine/gfx/lighting/LightingDirector"; // 孪生
import * as VxlBuilderFactoryNs from "engine/renderable/builder/VxlBuilderFactory"; // 孪生
import * as VxlGeometryPoolNs from "engine/renderable/builder/vxlGeometry/VxlGeometryPool"; // 孪生
import * as VxlGeometryCacheNs from "engine/gfx/geometry/VxlGeometryCache"; // 孪生
import * as ShadowQualityNs from "engine/renderable/entity/unit/ShadowQuality"; // 孪生
import * as CanvasMetricsNs from "gui/CanvasMetrics"; // 孪生
import * as ZoneTypeNs from "game/gameobject/unit/ZoneType"; // 已转换
import * as mathNs from "util/math"; // 已转换

const Renderer: any = (RendererNs as any).Renderer;
const Engine: any = (EngineNs as any).Engine;
const Coords: any = (CoordsNs as any).Coords;
const IsoCoords: any = (IsoCoordsNs as any).IsoCoords;
const Player: any = (PlayerNs as any).Player;
const WorldScene: any = (WorldSceneNs as any).WorldScene;
const Rules: any = (RulesNs as any).Rules;
const MapGrid: any = (MapGridNs as any).MapGrid;
const BoxedVar: any = (BoxedVarNs as any).BoxedVar;
const UiAnimationLoop: any = (UiAnimationLoopNs as any).UiAnimationLoop;
const ImageFinder: any = (ImageFinderNs as any).ImageFinder;
const Art: any = (ArtNs as any).Art;
const RenderableFactory: any = (RenderableFactoryNs as any).RenderableFactory;
const TheaterType: any = (TheaterTypeNs as any).TheaterType;
const Alliances: any = (AlliancesNs as any).Alliances;
const PlayerList: any = (PlayerListNs as any).PlayerList;
const SelectionLevel: any = (SelectionLevelNs as any).SelectionLevel;
const VeteranLevel: any = (VeteranLevelNs as any).VeteranLevel;
const PointerEvents: any = (PointerEventsNs as any).PointerEvents;
const CompositeDisposable: any = (CompositeDisposableNs as any).CompositeDisposable;
const UnitSelection: any = (UnitSelectionNs as any).UnitSelection;
const CameraZoomControls: any = (CameraZoomControlsNs as any).CameraZoomControls;
const Lighting: any = (LightingNs as any).Lighting;
const ObjectFactory: any = (ObjectFactoryNs as any).ObjectFactory;
const TileCollection: any = (TileCollectionNs as any).TileCollection;
const ObjectType: any = (ObjectTypeNs as any).ObjectType;
const MoveTrait: any = MoveTraitNs;
const TileOccupation: any = (TileOccupationNs as any).TileOccupation;
const Bridges: any = (BridgesNs as any).Bridges;
const RenderableManager: any = (RenderableManagerNs as any).RenderableManager;
const World: any = (WorldNs as any).World;
const Strings: any = (StringsNs as any).Strings;
const MapBounds: any = (MapBoundsNs as any).MapBounds;
const FlyerHelperMode: any = (FlyerHelperModeNs as any).FlyerHelperMode;
const LightingDirector: any = (LightingDirectorNs as any).LightingDirector;
const VxlBuilderFactory: any = (VxlBuilderFactoryNs as any).VxlBuilderFactory;
const VxlGeometryPool: any = (VxlGeometryPoolNs as any).VxlGeometryPool;
const VxlGeometryCache: any = (VxlGeometryCacheNs as any).VxlGeometryCache;
const ShadowQuality: any = (ShadowQualityNs as any).ShadowQuality;
const CanvasMetrics: any = (CanvasMetricsNs as any).CanvasMetrics;
const ZoneType: any = (ZoneTypeNs as any).ZoneType;
const math: any = mathNs;

declare const THREE: any;

export class AircraftTester {
  /** 渲染器。 */
  static renderer: any;
  /** 剧场资源。 */
  static theater: any;
  /** 规则表。 */
  static rules: any;
  /** 美术表。 */
  static art: any;
  /** SHP 图像集。 */
  static images: any;
  /** 体素集。 */
  static voxels: any;
  /** 体素动画集。 */
  static voxelAnims: any;
  /** 世界场景。 */
  static worldScene: any;
  /** VXL 几何池。 */
  static vxlGeometryPool: any;
  /** 动画循环。 */
  static uiAnimationLoop: any;
  /** 世界。 */
  static world: any;
  /** 当前飞机对象。 */
  static currentAircraft: any;
  /** 当前飞机可渲染体。 */
  static currentRenderable: any;
  /** 右侧列表。 */
  static listEl?: HTMLElement;
  /** 左侧控制面板。 */
  static controlsEl?: HTMLElement;
  /** 动画超时 id（destroy 清理）。 */
  static timeoutId: any;
  /** 生命周期可释放集合。 */
  static disposables = new CompositeDisposable();

  /**
   * 入口：搭建渲染器/场景/地板/网格/列表并启动循环。
   * @param _runtimeVars - 运行时变量（签名占位）
   */
  static async main(_runtimeVars?: any): Promise<void> {
    const renderer = (this.renderer = new Renderer(800, 600));
    (renderer.init(document.body), renderer.initStats(document.body));
    const worldScene = WorldScene.factory(
      { x: 0, y: 0, width: 800, height: 600 },
      new BoxedVar(true),
      new BoxedVar(ShadowQuality.High),
    );
    (this.disposables.add(worldScene),
      (worldScene.scene.background = new THREE.Color(12632256)),
      IsoCoords.init({ x: 0, y: 0 }),
      (this.theater = await Engine.loadTheater(TheaterType.Temperate)));
    const rules = new Rules(Engine.getRules());
    ((this.rules = rules),
      (this.art = new Art(rules, Engine.getArt())),
      (this.images = Engine.getImages()),
      (this.voxels = Engine.getVoxels()),
      (this.voxelAnims = Engine.getVoxelAnims()),
      this.buildBrowser(rules.aircraftRules));
    const metrics = new CanvasMetrics(renderer.getCanvas(), window);
    (metrics.init(), this.disposables.add(metrics));
    const pointer = new PointerEvents(renderer, { x: 0, y: 0 }, document, metrics);
    const zoom = new CameraZoomControls(pointer, worldScene.cameraZoom);
    (zoom.init(), this.disposables.add(pointer, zoom), renderer.addScene(worldScene));
    const loop = (this.uiAnimationLoop = new UiAnimationLoop(renderer));
    (loop.start(),
      (this.worldScene = worldScene),
      (this.vxlGeometryPool = new VxlGeometryPool(new VxlGeometryCache())),
      this.addGrid(),
      this.createFloor());
  }

  /** 10×10 网格地板。 */
  static addGrid(): void {
    const grid = new MapGrid({ width: 10, height: 10 });
    const obj = grid.get3DObject();
    const parent = new THREE.Object3D();
    (parent.add(obj), this.worldScene.scene.add(parent));
  }

  /** 阴影接收地板（renderOrder 2e5，不设 y）。 */
  static createFloor(): void {
    const geo = new THREE.PlaneGeometry(1e4, 1e4);
    const mat = new THREE.ShadowMaterial();
    mat.opacity = 0.5;
    const mesh = new THREE.Mesh(geo, mat);
    ((mesh.rotation.x = -Math.PI / 2),
      (mesh.receiveShadow = true),
      (mesh.renderOrder = 2e5),
      this.worldScene.scene.add(mesh));
  }

  /** 创建并展示指定机型（先移除/释放旧的）。 */
  static selectAircraft(id: string): void {
    if (this.currentAircraft)
      (this.world.removeObject(this.currentAircraft), this.currentAircraft.dispose());
    const owner = new Player("Player");
    (this.disposables.add(owner), (owner.color = this.rules.getMultiplayerColors().get("DarkRed")));
    const alliances = new Alliances(new PlayerList());
    const selection = new UnitSelection();
    const lighting = new Lighting();
    this.disposables.add(lighting);
    const factory = new RenderableFactory(
      new BoxedVar(owner),
      selection,
      alliances,
      this.rules,
      this.art,
      void 0,
      new ImageFinder(this.images, this.theater),
      Engine.getPalettes(),
      this.voxels,
      this.voxelAnims,
      this.theater,
      this.worldScene.camera,
      lighting,
      new LightingDirector(lighting, this.renderer, new BoxedVar(1)),
      new BoxedVar(false),
      new BoxedVar(false),
      new BoxedVar(2),
      void 0,
      new Strings(),
      new BoxedVar(FlyerHelperMode.Selected),
      new BoxedVar(false),
      new VxlBuilderFactory(this.vxlGeometryPool, false, this.worldScene.camera),
      new Map(),
    );
    const tiles = new TileCollection([], null, this.rules.general, math.getRandomInt);
    const occupation = new TileOccupation(tiles);
    let bounds = new MapBounds();
    const bridges = new Bridges(this.theater.tileSets, tiles, occupation, bounds, this.rules);
    const aircraft = (this.currentAircraft = new ObjectFactory(tiles, occupation, bridges, new BoxedVar(0)).create(
      ObjectType.Aircraft,
      id,
      this.rules,
      this.art,
    ));
    ((aircraft.owner = owner), (aircraft.position.tile = { rx: 1, ry: 1, z: 0, rampType: 0 }));
    const world = (this.world = new World());
    const manager = new RenderableManager(world, this.worldScene, this.worldScene.camera, factory);
    (manager.init(), this.disposables.add(manager), world.spawnObject(aircraft));
    const renderable = (this.currentRenderable = manager.getRenderableByGameObject(aircraft));
    (renderable.selectionModel.setSelectionLevel(SelectionLevel.None),
      renderable.selectionModel.setControlGroupNumber(3),
      this.buildControls());
  }

  /** 左侧控制面板：颜色/选中/老练/姿态/移动/超时空/销毁。 */
  static buildControls(): void {
    if (this.controlsEl) document.body.removeChild(this.controlsEl);
    const panel = (this.controlsEl = document.createElement("div"));
    ((panel.style.position = "absolute"),
      (panel.style.left = "0"),
      (panel.style.top = "0"),
      (panel.style.width = "200px"),
      (panel.style.padding = "5px"),
      (panel.style.background = "rgba(255, 255, 255, 0.5)"),
      (panel.style.border = "1px black solid"),
      panel.appendChild(document.createTextNode("Remap color:")));
    const colors = this.rules.getMultiplayerColors();
    const colorSelect = document.createElement("select");
    ((colorSelect.style.display = "block"),
      colorSelect.addEventListener("change", () => {
        this.currentAircraft.owner.color = colors.get(colorSelect.value);
      }),
      panel.appendChild(colorSelect),
      colors.forEach((color: any, name: string) => {
        const opt = document.createElement("option");
        ((opt.innerHTML = name),
          (opt.value = name),
          (opt.selected = color.asHex() === this.currentAircraft.owner.color.asHex()),
          colorSelect.appendChild(opt));
      }),
      panel.appendChild(document.createTextNode("Selection level:")));
    const selWrap = document.createElement("div");
    (panel.appendChild(selWrap),
      [SelectionLevel.None, SelectionLevel.Hover, SelectionLevel.Selected].forEach((level) => {
        const btn = document.createElement("button");
        ((btn.innerHTML = SelectionLevel[level]),
          (btn.disabled = !this.currentAircraft.rules.selectable),
          btn.addEventListener("click", () => this.currentRenderable.selectionModel.setSelectionLevel(level)),
          selWrap.appendChild(btn));
      }),
      panel.appendChild(document.createTextNode("Veteran level:")));
    const vetWrap = document.createElement("div");
    (panel.appendChild(vetWrap),
      this.currentAircraft.veteranTrait &&
        [VeteranLevel.None, VeteranLevel.Veteran, VeteranLevel.Elite].forEach((level) => {
          const btn = document.createElement("button");
          ((btn.innerHTML = VeteranLevel[level]),
            btn.addEventListener("click", () => (this.currentAircraft.veteranTrait.veteranLevel = level)),
            vetWrap.appendChild(btn));
        }),
      panel.appendChild(document.createTextNode("Rudder:")));
    const yaw = document.createElement("input");
    ((yaw.style.display = "block"),
      (yaw.type = "range"),
      (yaw.min = "-180"),
      (yaw.max = "180"),
      (yaw.value = "0"),
      yaw.addEventListener("input", () => {
        this.currentAircraft.yaw = Number(yaw.value);
      }),
      panel.appendChild(yaw));
    const pitch = document.createElement("input");
    ((pitch.style.display = "block"),
      (pitch.type = "range"),
      (pitch.min = "-180"),
      (pitch.max = "180"),
      (pitch.value = "0"),
      pitch.addEventListener("input", () => {
        this.currentAircraft.pitch = Number(pitch.value);
      }),
      panel.appendChild(pitch));
    const roll = document.createElement("input");
    ((roll.style.display = "block"),
      (roll.type = "range"),
      (roll.min = "-180"),
      (roll.max = "180"),
      (roll.value = "0"),
      roll.addEventListener("input", () => {
        this.currentAircraft.roll = Number(roll.value);
      }),
      panel.appendChild(roll),
      panel.appendChild(document.createTextNode("Height:")));
    const height = document.createElement("input");
    ((height.type = "range"),
      (height.min = "0"),
      (height.max = "2560"),
      (height.value = "0"),
      (height.style.display = "block"),
      height.addEventListener("input", () => {
        this.currentAircraft.position.tileElevation = Coords.worldToTileHeight(Number(height.value));
      }),
      panel.appendChild(height),
      panel.appendChild(document.createTextNode("isMoving:")));
    const moving = document.createElement("input");
    ((moving.type = "checkbox"),
      (moving.style.display = "block"),
      moving.addEventListener("change", (ev) => {
        const on = (ev.target as HTMLInputElement).checked;
        ((this.currentAircraft.moveTrait.moveState = on ? MoveTrait.MoveState.Moving : MoveTrait.MoveState.Idle),
          (this.currentAircraft.zone = on ? ZoneType.Air : ZoneType.Ground));
      }),
      panel.appendChild(moving),
      panel.appendChild(document.createTextNode("Warped out:")));
    const warped = document.createElement("input");
    ((warped.type = "checkbox"),
      (warped.style.display = "block"),
      warped.addEventListener("change", (ev) => {
        this.currentAircraft.warpedOutTrait.debugSetActive((ev.target as HTMLInputElement).checked);
      }),
      panel.appendChild(warped));
    const destroyBtn = document.createElement("button");
    ((destroyBtn.style.display = "block"),
      (destroyBtn.style.color = "red"),
      (destroyBtn.innerHTML = "DESTROY"),
      destroyBtn.addEventListener("click", async () => {
        ((this.currentAircraft.isDestroyed = true),
          this.world.removeObject(this.currentAircraft),
          this.currentAircraft.dispose(),
          (this.currentAircraft = void 0),
          document.body.removeChild(this.controlsEl!),
          (this.controlsEl = void 0));
      }),
      panel.appendChild(destroyBtn),
      document.body.appendChild(panel));
  }

  /**
   * 右侧机型列表（过滤 art 中存在的 Aircraft）；50ms 后自动选第一项。
   * @param aircraftRules - 机型规则映射
   */
  static buildBrowser(aircraftRules: Map<string, any>): void {
    const list = (this.listEl = document.createElement("div"));
    ((list.style.position = "absolute"),
      (list.style.right = "0"),
      (list.style.top = "0"),
      (list.style.height = "600px"),
      (list.style.width = "200px"),
      (list.style.overflowY = "auto"),
      (list.style.padding = "5px"),
      (list.style.background = "rgba(255, 255, 255, 0.5)"),
      (list.style.border = "1px black solid"),
      list.appendChild(document.createTextNode("Aircraft types:")));
    const ids = [...aircraftRules.keys()].filter((id) => this.art.hasObject(id, ObjectType.Aircraft)).sort();
    (ids.forEach((id) => {
      const link = document.createElement("a");
      ((link.style.display = "block"),
        (link.textContent = id),
        link.setAttribute("href", "javascript:;"),
        link.addEventListener("click", () => {
          (console.log("Selected aircraft", id), this.selectAircraft(id));
        }),
        list.appendChild(link));
    }),
      document.body.appendChild(list),
      setTimeout(() => {
        this.selectAircraft(ids[0]);
      }, 50));
  }

  /** 销毁渲染器/循环/列表/控制面板/超时并释放 disposable。 */
  static destroy(): void {
    (this.renderer.destroy(),
      this.uiAnimationLoop.destroy(),
      this.listEl.remove(),
      this.controlsEl && (this.controlsEl.remove(), (this.controlsEl = void 0)),
      this.timeoutId && (clearTimeout(this.timeoutId), (this.timeoutId = void 0)),
      this.disposables.dispose());
  }
}
