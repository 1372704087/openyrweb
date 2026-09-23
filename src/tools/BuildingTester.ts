/**
 * tools/BuildingTester — 建筑点看调试页（动画/驻军/损伤/供电/维修）。
 *
 * main：800×600 Renderer + WorldScene（背景 0xc0c0c0）+ Snow 地图 +
 * Rules/Art + 列表/网格 + 选中后组装 RenderableFactory 并延迟
 * 50ms 弹出控制面板（动画按钮、驻军数、损伤档、供电、维修、超时空）。
 *
 * 由 tools/BuildingTester.ts.js 重写为 TS（行为完全一致）。两个文件并存期间，
 * 本文件才是修改目标：tools/repack.mjs 打包时优先采用 .ts 模块的编译产物。
 */
import * as RendererNs from "engine/gfx/Renderer"; // 孪生
import * as EngineNs from "engine/Engine"; // 孪生
import * as IsoCoordsNs from "engine/IsoCoords"; // 孪生
import * as TheaterTypeNs from "engine/TheaterType"; // 已转换
import * as PlayerNs from "game/Player"; // 孪生
import * as DamageTypeNs from "engine/renderable/entity/building/DamageType"; // 孪生
import * as AnimationTypeNs from "engine/renderable/entity/building/AnimationType"; // 孪生
import * as WorldSceneNs from "engine/renderable/WorldScene"; // 孪生
import * as RulesNs from "game/rules/Rules"; // 孪生
import * as MapGridNs from "engine/renderable/entity/map/MapGrid"; // 孪生
import * as BoxedVarNs from "util/BoxedVar"; // 已转换
import * as UiAnimationLoopNs from "engine/UiAnimationLoop"; // 孪生
import * as ImageFinderNs from "engine/ImageFinder"; // 孪生
import * as ArtNs from "game/art/Art"; // 孪生
import * as RenderableFactoryNs from "engine/renderable/entity/RenderableFactory"; // 孪生
import * as ColorNs from "util/Color"; // 已转换
import * as SelectionLevelNs from "game/gameobject/selection/SelectionLevel"; // 孪生
import * as AlliancesNs from "game/Alliances"; // 孪生
import * as PlayerListNs from "game/PlayerList"; // 孪生
import * as ObjectFactoryNs from "game/gameobject/ObjectFactory"; // 孪生
import * as ObjectTypeNs from "engine/type/ObjectType"; // 已转换
import * as PointerEventsNs from "gui/PointerEvents"; // 孪生
import * as CompositeDisposableNs from "util/disposable/CompositeDisposable"; // 已转换
import * as UnitSelectionNs from "game/gameobject/selection/UnitSelection"; // 孪生
import * as CameraZoomControlsNs from "tools/CameraZoomControls"; // 已转换
import * as InfantryNs from "game/gameobject/Infantry"; // 孪生
import * as LightingNs from "engine/Lighting"; // 孪生
import * as TileCollectionNs from "game/map/TileCollection"; // 孪生
import * as TileOccupationNs from "game/map/TileOccupation"; // 孪生
import * as BridgesNs from "game/map/Bridges"; // 孪生
import * as StringsNs from "data/Strings"; // 孪生
import * as AutoRepairTraitNs from "game/gameobject/trait/AutoRepairTrait"; // 孪生
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
import * as mathNs from "util/math"; // 已转换

const Renderer: any = (RendererNs as any).Renderer;
const Engine: any = (EngineNs as any).Engine;
const IsoCoords: any = (IsoCoordsNs as any).IsoCoords;
const TheaterType: any = (TheaterTypeNs as any).TheaterType;
const Player: any = (PlayerNs as any).Player;
const DamageType: any = (DamageTypeNs as any).DamageType;
const AnimationType: any = (AnimationTypeNs as any).AnimationType;
const WorldScene: any = (WorldSceneNs as any).WorldScene;
const Rules: any = (RulesNs as any).Rules;
const MapGrid: any = (MapGridNs as any).MapGrid;
const BoxedVar: any = (BoxedVarNs as any).BoxedVar;
const UiAnimationLoop: any = (UiAnimationLoopNs as any).UiAnimationLoop;
const ImageFinder: any = (ImageFinderNs as any).ImageFinder;
const Art: any = (ArtNs as any).Art;
const RenderableFactory: any = (RenderableFactoryNs as any).RenderableFactory;
const Color: any = (ColorNs as any).Color;
const SelectionLevel: any = (SelectionLevelNs as any).SelectionLevel;
const Alliances: any = (AlliancesNs as any).Alliances;
const PlayerList: any = (PlayerListNs as any).PlayerList;
const ObjectFactory: any = (ObjectFactoryNs as any).ObjectFactory;
const ObjectType: any = (ObjectTypeNs as any).ObjectType;
const PointerEvents: any = (PointerEventsNs as any).PointerEvents;
const CompositeDisposable: any = (CompositeDisposableNs as any).CompositeDisposable;
const UnitSelection: any = (UnitSelectionNs as any).UnitSelection;
const CameraZoomControls: any = (CameraZoomControlsNs as any).CameraZoomControls;
const Infantry: any = (InfantryNs as any).Infantry;
const Lighting: any = (LightingNs as any).Lighting;
const TileCollection: any = (TileCollectionNs as any).TileCollection;
const TileOccupation: any = (TileOccupationNs as any).TileOccupation;
const Bridges: any = (BridgesNs as any).Bridges;
const Strings: any = (StringsNs as any).Strings;
const AutoRepairTrait: any = (AutoRepairTraitNs as any).AutoRepairTrait;
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
const math: any = mathNs;

declare const THREE: any;

export class BuildingTester {
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
  /** 当前建筑。 */
  static currentBuilding: any;
  /** 当前可渲染体。 */
  static currentRenderable: any;
  /** 右侧列表。 */
  static listEl?: HTMLElement;
  /** 控制面板。 */
  static controlsElement?: HTMLElement;
  /** 动画按钮容器。 */
  static animButtonsWrap?: HTMLElement;
  /** 驻军按钮容器。 */
  static occupiedButtonsWrap?: HTMLElement;
  /** 生命周期可释放集合。 */
  static disposables = new CompositeDisposable();

  /**
   * 入口：搭建渲染器/场景/网格/列表并启动循环。
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
      (this.theater = await Engine.loadTheater(TheaterType.Snow)));
    const rules = new Rules(Engine.getRules());
    (this.buildBrowser(rules.buildingRules),
      (this.rules = rules),
      (this.art = new Art(rules, Engine.getArt())),
      (this.images = Engine.getImages()),
      (this.voxels = Engine.getVoxels()),
      (this.voxelAnims = Engine.getVoxelAnims()));
    const metrics = new CanvasMetrics(renderer.getCanvas(), window);
    (metrics.init(), this.disposables.add(metrics));
    const pointer = new PointerEvents(renderer, { x: 0, y: 0 }, document, metrics);
    const zoom = new CameraZoomControls(pointer, worldScene.cameraZoom);
    (this.disposables.add(zoom, pointer), zoom.init(), renderer.addScene(worldScene));
    const loop = (this.uiAnimationLoop = new UiAnimationLoop(renderer));
    (loop.start(), (this.worldScene = worldScene), (this.vxlGeometryPool = new VxlGeometryPool(new VxlGeometryCache())), this.addGrid());
  }

  /** 10×10 网格地板。 */
  static addGrid(): void {
    const grid = new MapGrid({ width: 10, height: 10 });
    const obj = grid.get3DObject();
    const parent = new THREE.Object3D();
    (parent.add(obj), this.worldScene.scene.add(parent));
  }

  /** 创建并展示指定建筑（延迟 50ms 弹出控制面板）。 */
  static selectBuilding(id: string): void {
    if (this.currentRenderable && !this.currentBuilding.isDisposed)
      (this.world.removeObject(this.currentBuilding), this.currentBuilding.dispose());
    let rules: any = this.rules.getBuilding(id);
    const owner = new Player("Player");
    (this.disposables.add(owner),
      (owner.color =
        -1 !== rules.techLevel || rules.constructionYard
          ? this.rules.getMultiplayerColors().get("DarkRed")
          : new Color(255, 255, 255)));
    const playerList = new PlayerList();
    playerList.addPlayer(owner);
    let alliances: any = new Alliances(playerList);
    let selection: any = new UnitSelection();
    let lighting: any = new Lighting();
    this.disposables.add(lighting);
    ((rules = new RenderableFactory(
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
      new Strings({ TXT_PRIMARY: "Primary" }),
      new BoxedVar(FlyerHelperMode.Selected),
      new BoxedVar(false),
      new VxlBuilderFactory(this.vxlGeometryPool, false, this.worldScene.camera),
      new Map(),
    )),
      (selection = new TileCollection([], null, this.rules.general, math.getRandomInt)),
      (alliances = new TileOccupation(selection)),
      (lighting = new MapBounds()),
      (lighting = new Bridges(this.theater.tileSets, selection, alliances, lighting, this.rules)));
    const factory = new ObjectFactory(selection, alliances, lighting, new BoxedVar(1));
    const building = (this.currentBuilding = factory.create(ObjectType.Building, id, this.rules, this.art));
    ((building.owner = owner),
      (building.position.tile = { rx: 1, ry: 1, z: 0, rampType: 0 }),
      building.position.setCenterOffset(building.getFoundationCenterOffset()));
    const world = (this.world = new World());
    const manager = new RenderableManager(world, this.worldScene, this.worldScene.camera, rules);
    (manager.init(), this.disposables.add(manager), world.spawnObject(building));
    const renderable = (this.currentRenderable = manager.getRenderableByGameObject(building));
    (renderable.selectionModel.setSelectionLevel(SelectionLevel.Selected),
      this.currentRenderable.selectionModel.setControlGroupNumber(3),
      setTimeout(() => {
        (this.buildBuildingControls(), this.createAnimButtons(), this.createOccupiedButtons());
      }, 50));
  }

  /** 播放指定建筑动画。 */
  static selectAnimation(type: number): void {
    if (this.currentRenderable) this.currentRenderable.setAnimation(type, performance.now());
  }

  /** 结束当前动画。 */
  static stopCurrentAnimation(): void {
    if (this.currentRenderable) this.currentRenderable.endCurrentAnimation();
  }

  /**
   * 设置损伤档：normal→100，yellow/red→100×condition 系数。
   * 孪生用 BuildingTester.rules（类静态 this.rules）取 audioVisual。
   */
  static setDamageType(type: number): void {
    this.currentBuilding.healthTrait.health = type
      ? 100 *
        (type === DamageType.CONDITION_YELLOW
          ? BuildingTester.rules.audioVisual.conditionYellow
          : BuildingTester.rules.audioVisual.conditionRed)
      : 100;
  }

  /** 通电/断电。 */
  static setActiveState(powered: boolean): void {
    if (this.currentRenderable) this.currentRenderable.setPowered(powered);
  }

  /** 生成全部可用建筑动画按钮（不可用则 disabled + 半透明）。 */
  static createAnimButtons(): void {
    const wrap = this.animButtonsWrap!;
    wrap.innerHTML = "";
    for (const type of [
      AnimationType.IDLE,
      AnimationType.PRODUCTION,
      AnimationType.BUILDUP,
      AnimationType.UNBUILD,
      AnimationType.SUPER_CHARGE_START,
      AnimationType.SPECIAL_REPAIR_START,
      AnimationType.SPECIAL_SHOOT,
      AnimationType.SPECIAL_DOCKING,
      AnimationType.SPECIAL_GRIND,
      AnimationType.FACTORY_DEPLOYING,
      AnimationType.FACTORY_ROOF_DEPLOYING,
    ]) {
      const btn = document.createElement("button");
      if (
        ((btn.innerHTML = AnimationType[type]),
        (btn.style.display = "block"),
        btn.addEventListener("click", () => this.selectAnimation(type)),
        !this.currentRenderable)
      )
        throw new Error("Must build anim buttons after a building is selected");
      const missing = !this.currentRenderable.hasAnimation(type);
      ((btn.disabled = missing), (btn.style.opacity = missing ? ".5" : "1"), wrap.appendChild(btn));
    }
  }

  /** 驻军数量下拉（0..maxNumberOccupants）。 */
  static createOccupiedButtons(): void {
    const wrap = this.occupiedButtonsWrap!;
    wrap.innerHTML = "";
    const select = document.createElement("select");
    ((select.disabled = !this.currentBuilding.garrisonTrait),
      (select.style.display = "block"),
      select.addEventListener("change", () => {
        this.currentBuilding.garrisonTrait.units = new Array(Number(select.value))
          .fill(0)
          .map(() => new Infantry("dummy", this.rules.getObject("E1", ObjectType.Infantry), null));
      }));
    for (let i = 0; i < this.currentBuilding.rules.maxNumberOccupants + 1; i++) {
      const opt = document.createElement("option");
      ((opt.innerHTML = String(i)), (opt.value = String(i)), (opt.selected = 0 === i), select.appendChild(opt));
    }
    wrap.appendChild(select);
  }

  /** 左侧完整控制面板（颜色/选中/动画/驻军/损伤/供电/维修/超时空）。 */
  static buildBuildingControls(): void {
    if (this.controlsElement) document.body.removeChild(this.controlsElement);
    const panel = (this.controlsElement = document.createElement("div"));
    ((panel.style.position = "absolute"),
      (panel.style.left = "0"),
      (panel.style.top = "0"),
      (panel.style.width = "220px"),
      (panel.style.padding = "5px"),
      (panel.style.background = "rgba(255, 255, 255, 0.5)"),
      (panel.style.border = "1px black solid"),
      panel.appendChild(document.createTextNode("Remap color:")));
    const colorMap = new Map(this.rules.getMultiplayerColors());
    colorMap.set("None", new Color(255, 255, 255));
    const colorSelect = document.createElement("select");
    ((colorSelect.style.display = "block"),
      colorSelect.addEventListener("change", () => {
        this.currentBuilding.owner.color = colorMap.get(colorSelect.value);
      }),
      panel.appendChild(colorSelect),
      colorMap.forEach((color: any, name: string) => {
        const opt = document.createElement("option");
        ((opt.innerHTML = name),
          (opt.value = name),
          (opt.selected = color.asHex() === this.currentBuilding.owner.color.asHex()),
          colorSelect.appendChild(opt));
      }),
      panel.appendChild(document.createTextNode("Selection level:")));
    const selWrap = document.createElement("div");
    (panel.appendChild(selWrap),
      [SelectionLevel.None, SelectionLevel.Hover, SelectionLevel.Selected].forEach((level) => {
        const btn = document.createElement("button");
        ((btn.innerHTML = SelectionLevel[level]),
          (btn.disabled = level === SelectionLevel.Selected && !this.currentBuilding.rules.selectable),
          btn.addEventListener("click", () => this.currentRenderable.selectionModel.setSelectionLevel(level)),
          selWrap.appendChild(btn));
      }),
      panel.appendChild(document.createTextNode("Animation type:")));
    const animWrap = (this.animButtonsWrap = document.createElement("div"));
    panel.appendChild(animWrap);
    const stopBtn = document.createElement("button");
    ((stopBtn.innerHTML = "Stop current"),
      (stopBtn.style.display = "block"),
      stopBtn.addEventListener("click", () => this.stopCurrentAnimation()),
      panel.appendChild(stopBtn),
      panel.appendChild(document.createTextNode("Occupants:")));
    const occupiedWrap = (this.occupiedButtonsWrap = document.createElement("div"));
    (panel.appendChild(occupiedWrap), panel.appendChild(document.createTextNode("Damage type:")));
    const normalBtn = document.createElement("button");
    ((normalBtn.innerHTML = "NORMAL"),
      (normalBtn.style.display = "block"),
      normalBtn.addEventListener("click", () => this.setDamageType(DamageType.NORMAL)),
      panel.appendChild(normalBtn));
    const yellowBtn = document.createElement("button");
    ((yellowBtn.innerHTML = "YELLOW"),
      (yellowBtn.style.display = "block"),
      yellowBtn.addEventListener("click", () => this.setDamageType(DamageType.CONDITION_YELLOW)),
      panel.appendChild(yellowBtn));
    const redBtn = document.createElement("button");
    ((redBtn.innerHTML = "RED"),
      (redBtn.style.display = "block"),
      redBtn.addEventListener("click", () => this.setDamageType(DamageType.CONDITION_RED)),
      panel.appendChild(redBtn));
    const destroyedBtn = document.createElement("button");
    ((destroyedBtn.innerHTML = "DESTROYED"),
      (destroyedBtn.style.display = "block"),
      destroyedBtn.addEventListener("click", async () => {
        ((this.currentBuilding.isDestroyed = true),
          (this.currentBuilding.healthTrait.health = 0),
          this.world.removeObject(this.currentBuilding),
          this.currentBuilding.dispose(),
          document.body.removeChild(this.controlsElement!),
          (this.controlsElement = void 0));
      }),
      panel.appendChild(destroyedBtn));
    const repairBtn = document.createElement("button");
    ((repairBtn.innerHTML = "Toggle repair"),
      (repairBtn.style.display = "block"),
      repairBtn.addEventListener("click", () => {
        const trait = this.currentBuilding.traits.get(AutoRepairTrait);
        trait.setDisabled(!trait.isDisabled());
      }),
      panel.appendChild(repairBtn),
      panel.appendChild(document.createTextNode("Powered state:")));
    const inactiveBtn = document.createElement("button");
    ((inactiveBtn.innerHTML = "INACTIVE"),
      (inactiveBtn.style.display = "block"),
      inactiveBtn.addEventListener("click", () => this.setActiveState(false)),
      panel.appendChild(inactiveBtn));
    const activeBtn = document.createElement("button");
    ((activeBtn.innerHTML = "ACTIVE"),
      (activeBtn.style.display = "block"),
      activeBtn.addEventListener("click", () => this.setActiveState(true)),
      panel.appendChild(activeBtn),
      panel.appendChild(document.createTextNode("Warped out:")));
    const warped = document.createElement("input");
    ((warped.type = "checkbox"),
      (warped.style.display = "block"),
      warped.addEventListener("change", (ev) => {
        this.currentBuilding.warpedOutTrait.debugSetActive((ev.target as HTMLInputElement).checked);
      }),
      panel.appendChild(warped),
      document.body.appendChild(panel));
  }

  /**
   * 右侧建筑列表（过滤占位/装饰/赌场/城市前缀），排序后 50ms 自动选第一项。
   * @param buildingRules - 建筑规则映射
   */
  static buildBrowser(buildingRules: Map<string, any>): void {
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
      list.appendChild(document.createTextNode("Building types:")));
    const ids: string[] = [];
    (buildingRules.forEach((_rule, id) => {
      -1 !== ["AMMOCRAT", "GADUMY", "GAGREEN", "CAARMR"].indexOf(id) ||
        /^CASIN/.exec(id) ||
        /^CITY/.exec(id) ||
        ids.push(id);
    }),
      ids.sort(),
      ids.forEach((id) => {
        const link = document.createElement("a");
        ((link.style.display = "block"),
          (link.textContent = id),
          link.setAttribute("href", "javascript:;"),
          link.addEventListener("click", () => {
            (console.log("Selected building", id), this.selectBuilding(id));
          }),
          list.appendChild(link));
      }),
      document.body.appendChild(list),
      setTimeout(() => {
        this.selectBuilding(ids[0]);
      }, 50));
  }

  /** 销毁渲染器/循环/列表/面板并释放 disposable。 */
  static destroy(): void {
    (this.renderer.destroy(),
      this.uiAnimationLoop.destroy(),
      this.listEl.remove(),
      this.controlsElement && (this.controlsElement.remove(), (this.controlsElement = void 0)),
      this.disposables.dispose());
  }
}
