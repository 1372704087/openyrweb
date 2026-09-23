/**
 * tools/VehicleTester — 载具点看调试页（坡度/炮塔/摇晃/矿车/运输）。
 *
 * main：800×600 Renderer + WorldScene（背景 0xc0c0c0）+ Temperate 地图 +
 * Rules/Art + 列表/网格/地板 + 选中后组装 RenderableFactory，矿车加矿、
 * 运输车塞乘员并回填 transport 反向引用；animateVehicle 支持固定朝向
 * 或自动旋转（方向 +1、炮塔 +2）。
 *
 * 由 tools/VehicleTester.ts.js 重写为 TS（行为完全一致）。两个文件并存期间，
 * 本文件才是修改目标：tools/repack.mjs 打包时优先采用 .ts 模块的编译产物。
 */
import * as RendererNs from "engine/gfx/Renderer"; // 孪生
import * as EngineNs from "engine/Engine"; // 孪生
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
import * as rampHeightsNs from "game/theater/rampHeights"; // 已转换
import * as AlliancesNs from "game/Alliances"; // 孪生
import * as PlayerListNs from "game/PlayerList"; // 孪生
import * as SelectionLevelNs from "game/gameobject/selection/SelectionLevel"; // 孪生
import * as VeteranLevelNs from "game/gameobject/unit/VeteranLevel"; // 已转换
import * as ObjectFactoryNs from "game/gameobject/ObjectFactory"; // 孪生
import * as ObjectTypeNs from "engine/type/ObjectType"; // 已转换
import * as PointerEventsNs from "gui/PointerEvents"; // 孪生
import * as CompositeDisposableNs from "util/disposable/CompositeDisposable"; // 已转换
import * as UnitSelectionNs from "game/gameobject/selection/UnitSelection"; // 孪生
import * as CameraZoomControlsNs from "tools/CameraZoomControls"; // 已转换
import * as LightingNs from "engine/Lighting"; // 孪生
import * as TileCollectionNs from "game/map/TileCollection"; // 孪生
import * as MoveTraitNs from "game/gameobject/trait/MoveTrait"; // 孪生
import * as TileOccupationNs from "game/map/TileOccupation"; // 孪生
import * as BridgesNs from "game/map/Bridges"; // 孪生
import * as StringsNs from "data/Strings"; // 孪生
import * as MapBoundsNs from "game/map/MapBounds"; // 孪生
import * as FlyerHelperModeNs from "engine/renderable/entity/unit/FlyerHelperMode"; // 孪生
import * as LightingDirectorNs from "engine/gfx/lighting/LightingDirector"; // 孪生
import * as WorldNs from "game/World"; // 孪生
import * as RenderableManagerNs from "engine/RenderableManager"; // 孪生
import * as VxlBuilderFactoryNs from "engine/renderable/builder/VxlBuilderFactory"; // 孪生
import * as VxlGeometryPoolNs from "engine/renderable/builder/vxlGeometry/VxlGeometryPool"; // 孪生
import * as VxlGeometryCacheNs from "engine/gfx/geometry/VxlGeometryCache"; // 孪生
import * as ShadowQualityNs from "engine/renderable/entity/unit/ShadowQuality"; // 孪生
import * as CanvasMetricsNs from "gui/CanvasMetrics"; // 孪生
import * as ZoneTypeNs from "game/gameobject/unit/ZoneType"; // 已转换
import * as mathNs from "util/math"; // 已转换
import * as NotifyTileChangeNs from "game/gameobject/trait/interface/NotifyTileChange"; // 孪生
import * as TiberiumTypeNs from "engine/type/TiberiumType"; // 已转换

const Renderer: any = (RendererNs as any).Renderer;
const Engine: any = (EngineNs as any).Engine;
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
const rampHeights: any = (rampHeightsNs as any).rampHeights ?? rampHeightsNs;
const Alliances: any = (AlliancesNs as any).Alliances;
const PlayerList: any = (PlayerListNs as any).PlayerList;
const SelectionLevel: any = (SelectionLevelNs as any).SelectionLevel;
const VeteranLevel: any = (VeteranLevelNs as any).VeteranLevel;
const ObjectFactory: any = (ObjectFactoryNs as any).ObjectFactory;
const ObjectType: any = (ObjectTypeNs as any).ObjectType;
const PointerEvents: any = (PointerEventsNs as any).PointerEvents;
const CompositeDisposable: any = (CompositeDisposableNs as any).CompositeDisposable;
const UnitSelection: any = (UnitSelectionNs as any).UnitSelection;
const CameraZoomControls: any = (CameraZoomControlsNs as any).CameraZoomControls;
const Lighting: any = (LightingNs as any).Lighting;
const TileCollection: any = (TileCollectionNs as any).TileCollection;
const MoveTrait: any = MoveTraitNs;
const TileOccupation: any = (TileOccupationNs as any).TileOccupation;
const Bridges: any = (BridgesNs as any).Bridges;
const Strings: any = (StringsNs as any).Strings;
const MapBounds: any = (MapBoundsNs as any).MapBounds;
const FlyerHelperMode: any = (FlyerHelperModeNs as any).FlyerHelperMode;
const LightingDirector: any = (LightingDirectorNs as any).LightingDirector;
const World: any = (WorldNs as any).World;
const RenderableManager: any = (RenderableManagerNs as any).RenderableManager;
const VxlBuilderFactory: any = (VxlBuilderFactoryNs as any).VxlBuilderFactory;
const VxlGeometryPool: any = (VxlGeometryPoolNs as any).VxlGeometryPool;
const VxlGeometryCache: any = (VxlGeometryCacheNs as any).VxlGeometryCache;
const ShadowQuality: any = (ShadowQualityNs as any).ShadowQuality;
const CanvasMetrics: any = (CanvasMetricsNs as any).CanvasMetrics;
const ZoneType: any = (ZoneTypeNs as any).ZoneType;
const math: any = mathNs;
const NotifyTileChange: any = NotifyTileChangeNs;
const TiberiumType: any = (TiberiumTypeNs as any).TiberiumType;

declare const THREE: any;

export class VehicleTester {
  /** 渲染器。 */
  static renderer: any;
  /** 剧场。 */
  static theater: any;
  /** 规则。 */
  static rules: any;
  /** 美术。 */
  static art: any;
  /** 图像集。 */
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
  /** 当前载具。 */
  static currentVehicle: any;
  /** 当前可渲染体。 */
  static currentRenderable: any;
  /** 固定朝向（undefined=自动旋转）。 */
  static fixedDirection?: number;
  /** 默认站立 tile（ramp 可调）。 */
  static tile = { rx: 1, ry: 1, rampType: 0, z: 0 };
  /** 右侧列表。 */
  static listEl?: HTMLElement;
  /** 控制面板。 */
  static controlsEl?: HTMLElement;
  /** 动画超时 id。 */
  static timeoutId: any;
  /** 生命周期可释放集合。 */
  static disposables = new CompositeDisposable();

  /**
   * 入口：搭建渲染器/场景/网格/地板/列表并启动循环。
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
      this.buildBrowser(rules.vehicleRules));
    const metrics = new CanvasMetrics(renderer.getCanvas(), window);
    (metrics.init(), this.disposables.add(metrics));
    const pointer = new PointerEvents(renderer, { x: 0, y: 0 }, document, metrics);
    const zoom = new CameraZoomControls(pointer, worldScene.cameraZoom);
    (this.disposables.add(zoom, pointer), zoom.init(), renderer.addScene(worldScene));
    const loop = (this.uiAnimationLoop = new UiAnimationLoop(renderer));
    (loop.start(),
      (this.worldScene = worldScene),
      (this.vxlGeometryPool = new VxlGeometryPool(new VxlGeometryCache())),
      this.addGrid(),
      this.createFloor());
  }

  /** 10×10 网格。 */
  static addGrid(): void {
    const grid = new MapGrid({ width: 10, height: 10 });
    const obj = grid.get3DObject();
    const parent = new THREE.Object3D();
    (parent.add(obj), this.worldScene.scene.add(parent));
  }

  /** 阴影地板（y=1，renderOrder 2e5）。 */
  static createFloor(): void {
    const geo = new THREE.PlaneGeometry(1e4, 1e4);
    const mat = new THREE.ShadowMaterial();
    mat.opacity = 0.5;
    const mesh = new THREE.Mesh(geo, mat);
    ((mesh.rotation.x = -Math.PI / 2),
      (mesh.receiveShadow = true),
      (mesh.renderOrder = 2e5),
      (mesh.position.y = 1),
      this.worldScene.scene.add(mesh));
  }

  /** 创建并展示指定载具（矿车装矿 / 运输车塞乘员 + transport 回填 + 倾斜刷新）。 */
  static selectVehicle(id: string): void {
    if (this.currentVehicle && !this.currentVehicle.isDisposed)
      (this.world.removeObject(this.currentVehicle), this.currentVehicle.dispose());
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
    const objectFactory = new ObjectFactory(tiles, occupation, bridges, new BoxedVar(1));
    const vehicle = (this.currentVehicle = objectFactory.create(ObjectType.Vehicle, id, this.rules, this.art));
    ((vehicle.owner = owner),
      (vehicle.position.tile = this.tile),
      vehicle.harvesterTrait
        ? (vehicle.harvesterTrait.addBails(TiberiumType.Ore, 5),
          vehicle.harvesterTrait.addBails(TiberiumType.Gems, 10))
        : vehicle.transportTrait &&
          vehicle.transportTrait.units.push(
            objectFactory.create(ObjectType.Vehicle, "FV", this.rules, this.art),
            objectFactory.create(ObjectType.Infantry, "E1", this.rules, this.art),
            objectFactory.create(ObjectType.Infantry, "CLEG", this.rules, this.art),
          ),
      // set transport back-reference for OpenTopped bonus queries.
      vehicle.transportTrait?.units.forEach((passenger: any) => (passenger.transport = vehicle)),
      vehicle.tilterTrait?.[NotifyTileChange.onTileChange](vehicle));
    const world = (this.world = new World());
    const manager = new RenderableManager(world, this.worldScene, this.worldScene.camera, factory);
    (manager.init(), this.disposables.add(manager), world.spawnObject(vehicle));
    const renderable = (this.currentRenderable = manager.getRenderableByGameObject(vehicle));
    (renderable.selectionModel.setSelectionLevel(SelectionLevel.Selected),
      renderable.selectionModel.setControlGroupNumber(3),
      this.buildControls());
  }

  /** 左侧完整控制面板（颜色/选中/老练/坡度/炮塔/移动/开火/摇晃/超时空/朝向/销毁）。 */
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
        this.currentVehicle.owner.color = colors.get(colorSelect.value);
      }),
      panel.appendChild(colorSelect),
      colors.forEach((color: any, name: string) => {
        const opt = document.createElement("option");
        ((opt.innerHTML = name),
          (opt.value = name),
          (opt.selected = color.asHex() === this.currentVehicle.owner.color.asHex()),
          colorSelect.appendChild(opt));
      }),
      panel.appendChild(document.createTextNode("Selection level:")));
    const selWrap = document.createElement("div");
    (panel.appendChild(selWrap),
      [SelectionLevel.None, SelectionLevel.Hover, SelectionLevel.Selected].forEach((level) => {
        const btn = document.createElement("button");
        ((btn.innerHTML = SelectionLevel[level]),
          btn.addEventListener("click", () => this.currentRenderable.selectionModel.setSelectionLevel(level)),
          selWrap.appendChild(btn));
      }),
      panel.appendChild(document.createTextNode("Veteran level:")));
    const vetWrap = document.createElement("div");
    (panel.appendChild(vetWrap),
      this.currentVehicle.veteranTrait &&
        [VeteranLevel.None, VeteranLevel.Veteran, VeteranLevel.Elite].forEach((level) => {
          const btn = document.createElement("button");
          ((btn.innerHTML = VeteranLevel[level]),
            btn.addEventListener("click", () => (this.currentVehicle.veteranTrait.veteranLevel = level)),
            vetWrap.appendChild(btn));
        }),
      panel.appendChild(document.createTextNode("Ramp type:")));
    const rampSelect = document.createElement("select");
    ((rampSelect.style.display = "block"),
      rampSelect.addEventListener("change", () => {
        ((this.tile.rampType = Number(rampSelect.value)),
          this.currentVehicle.tilterTrait?.[NotifyTileChange.onTileChange](this.currentVehicle));
      }),
      panel.appendChild(rampSelect));
    for (let i = 0; i < rampHeights.length; ++i) {
      const opt = document.createElement("option");
      ((opt.innerHTML = "" + i), (opt.value = "" + i), rampSelect.appendChild(opt));
    }
    panel.appendChild(document.createTextNode("Turret #:"));
    const turretSelect = document.createElement("select");
    ((turretSelect.style.display = "block"),
      (turretSelect.disabled = !this.currentVehicle.rules.turret),
      turretSelect.addEventListener("change", () => {
        this.currentVehicle.turretNo = Number(turretSelect.value);
      }),
      panel.appendChild(turretSelect));
    for (let i = 0; i < this.currentVehicle.rules.turretCount; ++i) {
      const opt = document.createElement("option");
      ((opt.innerHTML = "" + i), (opt.value = "" + i), turretSelect.appendChild(opt));
    }
    panel.appendChild(document.createTextNode("isMoving:"));
    const moving = document.createElement("input");
    ((moving.type = "checkbox"),
      (moving.style.display = "block"),
      moving.addEventListener("change", (ev) => {
        const on = (ev.target as HTMLInputElement).checked;
        ((this.currentVehicle.moveTrait.moveState = on ? MoveTrait.MoveState.Moving : MoveTrait.MoveState.Idle),
          this.currentVehicle.rules.consideredAircraft && on
            ? (this.currentVehicle.zone = ZoneType.Air)
            : (this.currentVehicle.zone = this.currentVehicle.rules.naval
                ? ZoneType.Water
                : ZoneType.Ground));
      }),
      panel.appendChild(moving),
      panel.appendChild(document.createTextNode("isFiring:")));
    const firing = document.createElement("input");
    ((firing.type = "checkbox"),
      (firing.style.display = "block"),
      firing.addEventListener("change", (ev) => {
        this.currentVehicle.isFiring = (ev.target as HTMLInputElement).checked;
      }),
      panel.appendChild(firing),
      panel.appendChild(document.createTextNode("isRocking:")));
    const rocking = document.createElement("input");
    if (
      ((rocking.type = "checkbox"),
      (rocking.style.display = "block"),
      rocking.addEventListener("change", (ev) => {
        (ev.target as HTMLInputElement).checked
          ? this.currentVehicle.applyRocking(360 * Math.random(), 1)
          : (this.currentVehicle.rocking = void 0);
      }),
      panel.appendChild(rocking),
      this.currentVehicle.airSpawnTrait)
    ) {
      panel.appendChild(document.createTextNode("hasSpawns:"));
      const spawns = document.createElement("input");
      ((spawns.type = "checkbox"),
        (spawns.style.display = "block"),
        (spawns.checked = !!this.currentVehicle.airSpawnTrait.availableSpawns),
        spawns.addEventListener("change", (ev) => {
          const count = (ev.target as HTMLInputElement).checked ? 1 : 0;
          this.currentVehicle.airSpawnTrait.debugSetStorage(null, count);
        }),
        panel.appendChild(spawns));
    }
    panel.appendChild(document.createTextNode("Warped out:"));
    const warped = document.createElement("input");
    ((warped.type = "checkbox"),
      (warped.style.display = "block"),
      warped.addEventListener("change", (ev) => {
        this.currentVehicle.warpedOutTrait.debugSetActive((ev.target as HTMLInputElement).checked);
      }),
      panel.appendChild(warped),
      panel.appendChild(document.createTextNode("Direction:")));
    const dirWrap = document.createElement("div");
    panel.appendChild(dirWrap);
    const dirRange = document.createElement("input");
    ((dirRange.type = "range"),
      (dirRange.min = "-180"),
      (dirRange.max = "180"),
      (dirRange.value = "0"),
      (dirRange.disabled = void 0 === this.fixedDirection),
      (dirRange.style.verticalAlign = "middle"),
      dirRange.addEventListener("input", () => {
        this.fixedDirection = Number(dirRange.value);
      }),
      dirWrap.appendChild(dirRange));
    const resetBtn = document.createElement("button");
    ((resetBtn.innerHTML = "Reset"),
      (resetBtn.disabled = void 0 === this.fixedDirection),
      (resetBtn.style.verticalAlign = "middle"),
      resetBtn.addEventListener("click", () => {
        void 0 !== this.fixedDirection && ((this.fixedDirection = 0), (dirRange.value = "0"));
      }),
      dirWrap.appendChild(resetBtn));
    const autoRotate = document.createElement("input");
    ((autoRotate.type = "checkbox"),
      (autoRotate.checked = void 0 === this.fixedDirection),
      autoRotate.addEventListener("change", (ev) => {
        ((this.fixedDirection = (ev.target as HTMLInputElement).checked ? void 0 : 0),
          (dirRange.disabled = resetBtn.disabled = void 0 === this.fixedDirection),
          (dirRange.value = "0"));
      }),
      panel.appendChild(autoRotate));
    const label = document.createElement("label");
    ((label.innerHTML = "Auto rotate"), panel.appendChild(label));
    const destroyBtn = document.createElement("button");
    ((destroyBtn.style.display = "block"),
      (destroyBtn.style.color = "red"),
      (destroyBtn.innerHTML = "DESTROY"),
      destroyBtn.addEventListener("click", async () => {
        ((this.currentVehicle.isDestroyed = true),
          this.world.removeObject(this.currentVehicle),
          this.currentVehicle.dispose(),
          document.body.removeChild(this.controlsEl!),
          (this.controlsEl = void 0));
      }),
      panel.appendChild(destroyBtn),
      document.body.appendChild(panel));
  }

  /**
   * 右侧载具列表；50ms 后自动选第一项并启动旋转动画。
   * @param vehicleRules - 载具规则映射
   */
  static buildBrowser(vehicleRules: Map<string, any>): void {
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
      list.appendChild(document.createTextNode("Vehicle types:")));
    const ids = [...vehicleRules.keys()].filter((id) => this.art.hasObject(id, ObjectType.Vehicle)).sort();
    (ids.forEach((id) => {
      const link = document.createElement("a");
      ((link.style.display = "block"),
        (link.textContent = id),
        link.setAttribute("href", "javascript:;"),
        link.addEventListener("click", () => {
          (console.log("Selected vehicle", id), this.selectVehicle(id));
        }),
        list.appendChild(link));
    }),
      document.body.appendChild(list),
      setTimeout(() => {
        (this.selectVehicle(ids[0]), this.animateVehicle());
      }, 50));
  }

  /**
   * 每 50ms 旋转：固定朝向用 fixedDirection，否则 body +1、炮塔 +2（均 mod 360）。
   * 注意：固定朝向分支的取模优先级与孪生 `fixed ?? (dir+1)%360` 一致。
   */
  static animateVehicle(): void {
    ((this.currentVehicle.direction = this.fixedDirection ?? (this.currentVehicle.direction + 1) % 360),
      this.currentVehicle.turretTrait &&
        (this.currentVehicle.turretTrait.facing =
          this.fixedDirection ?? (this.currentVehicle.turretTrait.facing + 2) % 360),
      setTimeout(() => this.animateVehicle(), 50));
  }

  /** 销毁渲染器/循环/列表/面板/超时并释放 disposable。 */
  static destroy(): void {
    (this.renderer.destroy(),
      this.uiAnimationLoop.destroy(),
      this.listEl.remove(),
      this.controlsEl && (this.controlsEl.remove(), (this.controlsEl = void 0)),
      this.timeoutId && (clearTimeout(this.timeoutId), (this.timeoutId = void 0)),
      this.disposables.dispose());
  }
}
