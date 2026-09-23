/**
 * tools/InfantryTester — 步兵点看调试页（姿态/区域/死亡/转圈动画）。
 *
 * main：800×600 Renderer + WorldScene（背景 0xc0c0c0）+ Snow 地图 +
 * Rules/Art + 列表/网格 + 选中后组装 RenderableFactory 并弹出控制面板；
 * animateInfantry 每 50ms direction+1（mod 360）直至对象销毁。
 *
 * 由 tools/InfantryTester.ts.js 重写为 TS（行为完全一致）。两个文件并存期间，
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
import * as ZoneTypeNs from "game/gameobject/unit/ZoneType"; // 已转换
import * as SpeedTypeNs from "game/type/SpeedType"; // 孪生
import * as StanceTypeNs from "game/gameobject/infantry/StanceType"; // 已转换
import * as InfDeathTypeNs from "game/gameobject/infantry/InfDeathType"; // 已转换
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
import * as mathNs from "util/math"; // 已转换

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
const ZoneType: any = (ZoneTypeNs as any).ZoneType;
const SpeedType: any = (SpeedTypeNs as any).SpeedType;
const StanceType: any = (StanceTypeNs as any).StanceType;
const InfDeathType: any = (InfDeathTypeNs as any).InfDeathType;
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
const math: any = mathNs;

declare const THREE: any;

export class InfantryTester {
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
  /** 世界场景。 */
  static worldScene: any;
  /** 动画循环。 */
  static uiAnimationLoop: any;
  /** 世界。 */
  static world: any;
  /** 当前步兵。 */
  static currentInfantry: any;
  /** 当前可渲染体。 */
  static currentRenderable: any;
  /** 右侧列表。 */
  static listEl?: HTMLElement;
  /** 控制面板。 */
  static controlsEl?: HTMLElement;
  /** 动画超时 id。 */
  static timeoutId: any;
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
    ((this.rules = rules),
      (this.art = new Art(rules, Engine.getArt())),
      (this.images = Engine.getImages()),
      this.buildBrowser(rules.infantryRules));
    const metrics = new CanvasMetrics(renderer.getCanvas(), window);
    (metrics.init(), this.disposables.add(metrics));
    const pointer = new PointerEvents(renderer, { x: 0, y: 0 }, document, metrics);
    const zoom = new CameraZoomControls(pointer, worldScene.cameraZoom);
    (this.disposables.add(zoom, pointer), zoom.init(), renderer.addScene(worldScene));
    const loop = (this.uiAnimationLoop = new UiAnimationLoop(renderer));
    (loop.start(), (this.worldScene = worldScene), this.addGrid());
  }

  /** 10×10 网格。 */
  static addGrid(): void {
    const grid = new MapGrid({ width: 10, height: 10 });
    const obj = grid.get3DObject();
    const parent = new THREE.Object3D();
    (parent.add(obj), this.worldScene.scene.add(parent));
  }

  /** 创建并展示指定步兵。 */
  static selectInfantry(id: string): void {
    if (this.currentInfantry && !this.currentInfantry.isDisposed)
      (this.world.removeObject(this.currentInfantry), this.currentInfantry.dispose());
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
      null,
      null,
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
      new VxlBuilderFactory(new VxlGeometryPool(new VxlGeometryCache()), false, this.worldScene.camera),
      new Map(),
    );
    const tiles = new TileCollection([], null, this.rules.general, math.getRandomInt);
    const occupation = new TileOccupation(tiles);
    let bounds = new MapBounds();
    const bridges = new Bridges(this.theater.tileSets, tiles, occupation, bounds, this.rules);
    const infantry = (this.currentInfantry = new ObjectFactory(tiles, occupation, bridges, new BoxedVar(1)).create(
      ObjectType.Infantry,
      id,
      this.rules,
      this.art,
    ));
    ((infantry.owner = owner), (infantry.position.tile = { rx: 1, ry: 1, z: 0, rampType: 0 }));
    const world = (this.world = new World());
    const manager = new RenderableManager(world, this.worldScene, this.worldScene.camera, factory);
    (manager.init(), this.disposables.add(manager), world.spawnObject(infantry));
    const renderable = (this.currentRenderable = manager.getRenderableByGameObject(infantry));
    (renderable.selectionModel.setSelectionLevel(SelectionLevel.Selected),
      renderable.selectionModel.setControlGroupNumber(3),
      this.buildControls());
  }

  /** 左侧完整控制面板。 */
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
    const colors = new Map(this.rules.getMultiplayerColors());
    const colorSelect = document.createElement("select");
    ((colorSelect.style.display = "block"),
      colorSelect.addEventListener("change", () => {
        this.currentInfantry.owner.color = colors.get(colorSelect.value);
      }),
      panel.appendChild(colorSelect),
      colors.forEach((color: any, name: string) => {
        const opt = document.createElement("option");
        ((opt.innerHTML = name),
          (opt.value = name),
          (opt.selected = color.asHex() === this.currentInfantry.owner.color.asHex()),
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
      this.currentInfantry.veteranTrait &&
        [VeteranLevel.None, VeteranLevel.Veteran, VeteranLevel.Elite].forEach((level) => {
          const btn = document.createElement("button");
          ((btn.innerHTML = VeteranLevel[level]),
            btn.addEventListener("click", () => (this.currentInfantry.veteranTrait.veteranLevel = level)),
            vetWrap.appendChild(btn));
        }),
      panel.appendChild(document.createTextNode("SubCell:")));
    const subCell = document.createElement("select");
    ((subCell.style.display = "block"),
      subCell.addEventListener("change", () => {
        this.currentInfantry.position.subCell = Number(subCell.value);
      }),
      panel.appendChild(subCell));
    for (let h = 0; h < 5; ++h) {
      const opt = document.createElement("option");
      ((opt.innerHTML = "" + h), (opt.value = "" + h), subCell.appendChild(opt));
    }
    (panel.appendChild(document.createTextNode("Zone:")),
      this.createZoneSelect(panel),
      panel.appendChild(document.createTextNode("Stance:")),
      this.createStanceSelect(panel),
      panel.appendChild(document.createTextNode("isMoving:")));
    const moving = document.createElement("input");
    ((moving.type = "checkbox"),
      (moving.style.display = "block"),
      moving.addEventListener("change", (ev) => {
        this.currentInfantry.moveTrait.moveState = (ev.target as HTMLInputElement).checked
          ? MoveTrait.MoveState.Moving
          : MoveTrait.MoveState.Idle;
      }),
      panel.appendChild(moving),
      panel.appendChild(document.createTextNode("isFiring:")));
    const firing = document.createElement("input");
    ((firing.type = "checkbox"),
      (firing.disabled = !this.currentInfantry.rules.primary),
      (firing.style.display = "block"),
      firing.addEventListener("change", (ev) => {
        this.currentInfantry.isFiring = (ev.target as HTMLInputElement).checked;
      }),
      panel.appendChild(firing),
      panel.appendChild(document.createTextNode("isPanicked:")));
    const panicked = document.createElement("input");
    ((panicked.type = "checkbox"),
      (panicked.disabled = !this.currentInfantry.rules.fraidycat),
      (panicked.style.display = "block"),
      panicked.addEventListener("change", (ev) => {
        this.currentInfantry.isPanicked = (ev.target as HTMLInputElement).checked;
      }),
      panel.appendChild(panicked),
      panel.appendChild(document.createTextNode("Warped out:")));
    const warped = document.createElement("input");
    ((warped.type = "checkbox"),
      (warped.style.display = "block"),
      warped.addEventListener("change", (ev) => {
        this.currentInfantry.warpedOutTrait.debugSetActive((ev.target as HTMLInputElement).checked);
      }),
      panel.appendChild(warped),
      this.createDeathSelect(panel),
      document.body.appendChild(panel));
  }

  /** 区域下拉：始终 Ground；可飞行→Air；两栖→Water。 */
  static createZoneSelect(parent: HTMLElement): void {
    const select = document.createElement("select");
    ((select.style.display = "block"),
      select.addEventListener("change", () => {
        this.currentInfantry.zone = Number(select.value);
      }),
      parent.appendChild(select));
    const ground = document.createElement("option");
    if (
      ((ground.value = "" + ZoneType.Ground),
      (ground.innerHTML = ZoneType[ZoneType.Ground]),
      select.appendChild(ground),
      this.currentInfantry.rules.consideredAircraft)
    ) {
      const air = document.createElement("option");
      ((air.value = "" + ZoneType.Air), (air.innerHTML = ZoneType[ZoneType.Air]), select.appendChild(air));
    }
    if (this.currentInfantry.rules.speedType === SpeedType.Amphibious) {
      const water = document.createElement("option");
      ((water.value = "" + ZoneType.Water), (water.innerHTML = ZoneType[ZoneType.Water]), select.appendChild(water));
    }
  }

  /** 姿态下拉：None/Guard/Paradrop/Cheer 恒有；非 fearless→Prone；deployer→Deployed。 */
  static createStanceSelect(parent: HTMLElement): void {
    const select = document.createElement("select");
    ((select.style.display = "block"),
      select.addEventListener("change", () => {
        this.currentInfantry.stance = Number(select.value);
      }),
      parent.appendChild(select));
    const none = document.createElement("option");
    ((none.value = "" + StanceType.None), (none.innerHTML = StanceType[StanceType.None]), select.appendChild(none));
    const guard = document.createElement("option");
    ((guard.value = "" + StanceType.Guard), (guard.innerHTML = StanceType[StanceType.Guard]), select.appendChild(guard));
    const paradrop = document.createElement("option");
    ((paradrop.value = "" + StanceType.Paradrop),
      (paradrop.innerHTML = StanceType[StanceType.Paradrop]),
      select.appendChild(paradrop));
    const cheer = document.createElement("option");
    if (
      ((cheer.value = "" + StanceType.Cheer),
      (cheer.innerHTML = StanceType[StanceType.Cheer]),
      select.appendChild(cheer),
      !this.currentInfantry.rules.fearless)
    ) {
      const prone = document.createElement("option");
      ((prone.value = "" + StanceType.Prone), (prone.innerHTML = StanceType[StanceType.Prone]), select.appendChild(prone));
    }
    if (this.currentInfantry.rules.deployer) {
      const deployed = document.createElement("option");
      ((deployed.value = "" + StanceType.Deployed),
        (deployed.innerHTML = StanceType[StanceType.Deployed]),
        select.appendChild(deployed));
    }
  }

  /** 死亡类型下拉（从 1 起连续枚举到 undefined）+ KILL 按钮。 */
  static createDeathSelect(parent: HTMLElement): void {
    parent.appendChild(document.createTextNode("Death"));
    const select = document.createElement("select");
    let i = 1;
    let name = InfDeathType[i];
    for (; void 0 !== name; ) {
      const opt = document.createElement("option");
      ((opt.innerHTML = name),
        (opt.value = "" + i),
        (opt.disabled =
          !this.currentInfantry.rules.isHuman &&
          ![InfDeathType.Gunfire, InfDeathType.Explode].includes(i)),
        select.appendChild(opt),
        (name = InfDeathType[++i]));
    }
    parent.appendChild(select);
    const killBtn = document.createElement("button");
    ((killBtn.style.display = "block"),
      (killBtn.style.color = "red"),
      (killBtn.innerHTML = "KILL"),
      killBtn.addEventListener("click", async () => {
        ((this.currentInfantry.isDestroyed = true),
          (this.currentInfantry.infDeathType = Number(select.value)),
          this.world.removeObject(this.currentInfantry),
          this.currentInfantry.dispose(),
          document.body.removeChild(this.controlsEl!),
          (this.controlsEl = void 0));
      }),
      parent.appendChild(killBtn));
  }

  /**
   * 右侧步兵列表；50ms 后自动选第一项并启动转圈动画。
   * @param infantryRules - 步兵规则映射
   */
  static buildBrowser(infantryRules: Map<string, any>): void {
    const list = (this.listEl = document.createElement("div"));
    ((list.style.position = "absolute"),
      (list.style.right = "0"),
      (list.style.top = "0"),
      (list.style.height = "600px"),
      (list.style.width = "200px"),
      (list.style.overflowY = "auto"),
      (list.style.padding = "5px"),
      (list.style.width = "200px"),
      (list.style.background = "rgba(255, 255, 255, 0.5)"),
      (list.style.border = "1px black solid"),
      list.appendChild(document.createTextNode("Infantry types:")));
    const ids = [...infantryRules.keys()].filter((id) => this.art.hasObject(id, ObjectType.Infantry)).sort();
    (ids.forEach((id) => {
      const link = document.createElement("a");
      ((link.style.display = "block"),
        (link.textContent = id),
        link.setAttribute("href", "javascript:;"),
        link.addEventListener("click", () => {
          (console.log("Selected infantry", id), this.selectInfantry(id));
        }),
        list.appendChild(link));
    }),
      document.body.appendChild(list),
      setTimeout(() => {
        (this.selectInfantry(ids[0]), this.animateInfantry());
      }, 50));
  }

  /** 每 50ms direction+1（未销毁时）；对象销毁后停止（孪生逻辑原样）。 */
  static animateInfantry(): void {
    (this.currentInfantry.isDisposed ||
      (this.currentInfantry.direction = (this.currentInfantry.direction + 1) % 360),
      setTimeout(() => this.animateInfantry(), 50));
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
