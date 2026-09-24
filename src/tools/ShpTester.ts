/**
 * tools/ShpTester — 侧边栏/Hud/小地图综合调试页。
 *
 * main：800×600 Renderer + UiScene + 加载 sidec01.mix cameo 库 +
 * Rules/Art/Temperate 地图 + Player/Production 造建筑 + Hud/Minimap +
 * 假电源/资金抖动定时器 + 系统消息循环；destroy 释放 disposables。
 *
 * 由 tools/ShpTester.ts.js 重写为 TS（行为完全一致）。两个文件并存期间，
 * 本文件才是修改目标：tools/repack.mjs 打包时优先采用 .ts 模块的编译产物。
 */
import * as RendererNs from "engine/gfx/Renderer"; // 孪生
import * as UiSceneNs from "gui/UiScene"; // 孪生
import * as HudNs from "gui/screen/game/component/Hud"; // 孪生
import * as EngineNs from "engine/Engine"; // 孪生
import * as SidebarModelNs from "gui/screen/game/component/hud/viewmodel/SidebarModel"; // 孪生
import * as RulesNs from "game/rules/Rules"; // 孪生
import * as ArtNs from "game/art/Art"; // 孪生
import * as CountryNs from "game/Country"; // 孪生
import * as PlayerNs from "game/Player"; // 孪生
import * as WorldNs from "game/World"; // 孪生
import * as ObjectFactoryNs from "game/gameobject/ObjectFactory"; // 孪生
import * as ObjectArtNs from "game/art/ObjectArt"; // 孪生
import * as ObjectTypeNs from "engine/type/ObjectType"; // 已转换
import * as UiAnimationLoopNs from "engine/UiAnimationLoop"; // 孪生
import * as GameNs from "game/Game"; // 孪生
import * as JsxRendererNs from "gui/jsx/JsxRenderer"; // 孪生
import * as CompositeDisposableNs from "util/disposable/CompositeDisposable"; // 已转换
import * as AlliancesNs from "game/Alliances"; // 孪生
import * as PlayerListNs from "game/PlayerList"; // 孪生
import * as PointerNs from "gui/Pointer"; // 孪生
import * as BoxedVarNs from "util/BoxedVar"; // 已转换
import * as TileCollectionNs from "game/map/TileCollection"; // 孪生
import * as TileOccupationNs from "game/map/TileOccupation"; // 孪生
import * as BridgesNs from "game/map/Bridges"; // 孪生
import * as UnitSelectionNs from "game/gameobject/selection/UnitSelection"; // 孪生
import * as GameModeTypeNs from "game/ini/GameModeType"; // 孪生
import * as mathNs from "util/math"; // 已转换
import * as TheaterTypeNs from "engine/TheaterType"; // 已转换
import * as GameMapNs from "game/GameMap"; // 孪生
import * as RadarTraitNs from "game/player/trait/RadarTrait"; // 孪生
import * as MinimapNs from "gui/screen/game/component/Minimap"; // 孪生
import * as ProductionNs from "game/player/production/Production"; // 孪生
import * as CombatantSidebarModelNs from "gui/screen/game/component/hud/viewmodel/CombatantSidebarModel"; // 孪生
import * as MessageListNs from "gui/screen/game/component/hud/viewmodel/MessageList"; // 孪生
import * as MapShroudTraitNs from "game/trait/MapShroudTrait"; // 孪生
import * as SellTraitNs from "game/trait/SellTrait"; // 孪生
import * as MapBoundsNs from "game/map/MapBounds"; // 孪生
import * as mixDatabaseNs from "engine/mixDatabase"; // 孪生
import * as CommandBarButtonTypeNs from "gui/screen/game/component/hud/commandBar/CommandBarButtonType"; // 孪生
import * as CanvasMetricsNs from "gui/CanvasMetrics"; // 孪生
import * as StalemateDetectTraitNs from "game/trait/StalemateDetectTrait"; // 孪生
import * as CountdownTimerNs from "game/CountdownTimer"; // 孪生
import * as IniSectionNs from "data/IniSection"; // 已转换
import * as ChatHistoryNs from "gui/chat/ChatHistory"; // 孪生

const Renderer: any = (RendererNs as any).Renderer;
const UiScene: any = (UiSceneNs as any).UiScene;
const Hud: any = (HudNs as any).Hud;
const Engine: any = (EngineNs as any).Engine;
const SidebarModel: any = SidebarModelNs;
const Rules: any = (RulesNs as any).Rules;
const Art: any = (ArtNs as any).Art;
const Country: any = (CountryNs as any).Country;
const Player: any = (PlayerNs as any).Player;
const World: any = (WorldNs as any).World;
const ObjectFactory: any = (ObjectFactoryNs as any).ObjectFactory;
const ObjectArt: any = (ObjectArtNs as any).ObjectArt;
const ObjectType: any = (ObjectTypeNs as any).ObjectType;
const UiAnimationLoop: any = (UiAnimationLoopNs as any).UiAnimationLoop;
const Game: any = (GameNs as any).Game;
const JsxRenderer: any = (JsxRendererNs as any).JsxRenderer;
const CompositeDisposable: any = (CompositeDisposableNs as any).CompositeDisposable;
const Alliances: any = (AlliancesNs as any).Alliances;
const PlayerList: any = (PlayerListNs as any).PlayerList;
const Pointer: any = (PointerNs as any).Pointer;
const BoxedVar: any = (BoxedVarNs as any).BoxedVar;
const TileCollection: any = (TileCollectionNs as any).TileCollection;
const TileOccupation: any = (TileOccupationNs as any).TileOccupation;
const Bridges: any = (BridgesNs as any).Bridges;
const UnitSelection: any = (UnitSelectionNs as any).UnitSelection;
const GameModeType: any = (GameModeTypeNs as any).GameModeType;
const math: any = mathNs;
const TheaterType: any = (TheaterTypeNs as any).TheaterType;
const GameMap: any = (GameMapNs as any).GameMap;
const RadarTrait: any = (RadarTraitNs as any).RadarTrait;
const Minimap: any = (MinimapNs as any).Minimap;
const Production: any = (ProductionNs as any).Production;
const CombatantSidebarModel: any = (CombatantSidebarModelNs as any).CombatantSidebarModel;
const MessageList: any = (MessageListNs as any).MessageList;
const MapShroudTrait: any = (MapShroudTraitNs as any).MapShroudTrait;
const SellTrait: any = (SellTraitNs as any).SellTrait;
const MapBounds: any = (MapBoundsNs as any).MapBounds;
const mixDatabase: any = (mixDatabaseNs as any).mixDatabase;
const CommandBarButtonType: any = (CommandBarButtonTypeNs as any).CommandBarButtonType;
const CanvasMetrics: any = (CanvasMetricsNs as any).CanvasMetrics;
const StalemateDetectTrait: any = (StalemateDetectTraitNs as any).StalemateDetectTrait;
const CountdownTimer: any = (CountdownTimerNs as any).CountdownTimer;
const IniSection: any = (IniSectionNs as any).IniSection;
const ChatHistory: any = (ChatHistoryNs as any).ChatHistory;

declare const THREE: any;

export class ShpTester {
  /** 生命周期可释放集合。 */
  static disposables = new CompositeDisposable();

  /**
   * 入口：完整搭建对局 HUD 调试场景。
   * @param vfs - 虚拟文件系统
   * @param mapFile - 地图文件对象
   * @param rootEl - HtmlContainer 挂载容器
   * @param strings - 本地化字符串表
   */
  static async main(vfs: any, mapFile: any, rootEl: HTMLElement, strings: any): Promise<void> {
    const renderer = new Renderer(800, 600);
    (renderer.init(rootEl), renderer.initStats(document.body), this.disposables.add(renderer));
    const uiScene = UiScene.factory({ x: 0, y: 0, width: 800, height: 600 });
    (this.disposables.add(uiScene), await vfs.addMixFile("sidec01.mix"));
    const cameoDb = mixDatabase.get("cameo.mix");
    if (!cameoDb) throw new Error("Missing file list database for cameos");
    const rules = new Rules(Engine.getRules());
    const art = new Art(rules, Engine.getArt());
    const theater = await Engine.loadTheater(TheaterType.Temperate);
    const gameMap = new GameMap(mapFile, theater.tileSets, rules, math.getRandomInt);
    const gameOpts = { superWeapons: false, gameSpeed: 5 };
    const country = Country.factory("Americans", rules);
    const player = new Player("Player", country);
    (player.radarTrait = new RadarTrait(),
      (player.production = new Production(player, 10, gameOpts, rules, [
        ...rules.buildingRules.values(),
        ...rules.infantryRules.values(),
      ])),
      this.disposables.add(player));
    const world = new World();
    const playerList = new PlayerList();
    const alliances = new Alliances(playerList);
    const selection = new UnitSelection();
    const tiles = new TileCollection([], null, rules.general, math.getRandomInt);
    const occupation = new TileOccupation(tiles);
    let bounds = new MapBounds();
    const bridges = new Bridges(theater.tileSets, tiles, occupation, bounds, rules);
    let boxedOne = new BoxedVar(1);
    const factory = new ObjectFactory(tiles, occupation, bridges, boxedOne);
    const game = new Game(
      world,
      gameMap,
      rules,
      art,
      null,
      "0",
      0,
      gameOpts,
      GameModeType.Battle,
      playerList,
      selection,
      alliances,
      boxedOne,
      factory,
      null,
    );
    (game.addPlayer(player),
      (game.mapShroudTrait = new MapShroudTrait(gameMap, alliances)),
      game.traits.add(game.mapShroudTrait),
      (game.sellTrait = new SellTrait(game, game.rules.general)),
      game.traits.add(game.sellTrait));
    let shed: any;
    ["GACNST", "GAPOWR", "GAREFN", "GAPILE", "GAAIRC", "GAWEAP", "GATECH", "NACNST", "NAPOWR"].forEach((id) =>
      player.addOwnedObject(factory.create(ObjectType.Building, id, rules, art)),
    );
    const sidebar = new CombatantSidebarModel(player, game);
    ((sidebar.powerDrained = 150), (sidebar.powerGenerated = 300), player.radarTrait.setDisabled(false));
    const powerTimer = setInterval(() => {
      ((sidebar.powerDrained = math.getRandomInt(0, 300)),
        (sidebar.powerGenerated = math.getRandomInt(200, 1e3)),
        console.log(`Set power = ${sidebar.powerGenerated}, drain = ` + sidebar.powerDrained));
    }, 5e3);
    (this.disposables.add(() => clearInterval(powerTimer)), (player.credits = 5e3));
    const creditsTimer = setInterval(() => {
      ((player.credits = math.clamp(player.credits + math.getRandomInt(-1e3, 1e3), 0, 1e6)),
        console.log("Set credits", player.credits));
    }, 5e3);
    this.disposables.add(() => clearInterval(creditsTimer));
    for (shed of player.production.getAvailableObjects()) {
      const objArt = ObjectArt.factory(
        shed.type,
        shed,
        Engine.getArt(),
        Engine.getArt().getSection(shed.imageName) ?? new IniSection(shed.imageName),
      );
      const tab = sidebar.getTabForQueueType(player.production.getQueueTypeForObject(shed));
      tab.items.push({
        target: { type: SidebarModel.SidebarItemTargetType.Techno, rules: shed },
        cameo: objArt.cameo,
        disabled: tab.id === SidebarModel.SidebarCategory.Structures,
        progress: 0,
        quantity: 0,
        status: SidebarModel.SidebarItemStatus.Idle,
      });
    }
    const activeItem = sidebar.activeTab.items[1];
    ((activeItem.disabled = false), (activeItem.progress = 0.75), (activeItem.quantity = 2), (activeItem.status = SidebarModel.SidebarItemStatus.OnHold));
    const infItem = sidebar.tabs[SidebarModel.SidebarCategory.Infantry].items[0];
    ((infItem.quantity = 5), (infItem.progress = 1), (infItem.status = SidebarModel.SidebarItemStatus.Ready));
    const metrics = new CanvasMetrics(renderer.getCanvas(), window);
    (metrics.init(), this.disposables.add(metrics));
    const pointer = Pointer.factory(
      Engine.getImages().get("mouse.shp"),
      Engine.getPalettes().get("mousepal.pal"),
      renderer,
      document,
      metrics,
      new BoxedVar(false),
    );
    (pointer.init(), pointer.lock(), this.disposables.add(pointer), uiScene.add(pointer.getSprite()));
    const jsxRenderer = new JsxRenderer(Engine.getImages(), Engine.getPalettes(), uiScene.camera, pointer.pointerEvents);
    const messageList = new MessageList(rules.audioVisual.messageDuration, 6, player);
    let msgTimer: any;
    const systemMessages = ["txt_low_power", "txt_space_cant_save", "txt_receiving_scenario", "txt_bad_chankey"];
    const pushSystem = () => {
      const text = strings.get(systemMessages[math.getRandomInt(0, systemMessages.length - 1)]);
      (console.log("Add system message:", text),
        messageList.addSystemMessage(
          text,
          "#" + new THREE.Color(Math.random(), Math.random(), Math.random()).getHexString(),
        ),
        (msgTimer = setTimeout(pushSystem, 5e3 * Math.random())));
    };
    ((msgTimer = setTimeout(pushSystem, 5e3 * Math.random())), this.disposables.add(() => clearTimeout(msgTimer)));
    const hud = new Hud(
      player.country.side,
      uiScene.viewport,
      Engine.getImages(),
      Engine.getPalettes(),
      cameoDb,
      sidebar,
      messageList,
      new ChatHistory(),
      new BoxedVar(""),
      new BoxedVar(false),
      void 0,
      [],
      new StalemateDetectTrait(),
      new CountdownTimer(),
      jsxRenderer,
      strings,
      Object.values(CommandBarButtonType).filter((v) => "number" == typeof v),
    );
    const minimap = new Minimap(game, player, hud.getTextColor(), rules.general.radar);
    (minimap.setPointerEvents(pointer.pointerEvents),
      hud.setMinimap(minimap),
      this.disposables.add(minimap),
      uiScene.add(hud),
      hud.onSidebarSlotClick.subscribe((slot: any) => {
        console.log("clicked", slot);
      }),
      hud.onOptButtonClick.subscribe(() => {
        (pointer.unlock(),
          hud.showSidebarMenu([
            {
              label: "Button 1",
              onClick() {
                console.log("button 1 clicked");
              },
            },
            {
              label: "Button 2",
              disabled: true,
              onClick() {
                console.error("button 2 should not trigger onClick");
              },
            },
            {
              label: "Exit",
              isBottom: true,
              onClick() {
                (pointer.lock(), hud.hideSidebarMenu());
              },
            },
          ]));
      }),
      hud.onRepairButtonClick.subscribe(() => {
        player.radarTrait.setDisabled(!player.radarTrait.isDisabled());
      }),
      hud.onCommandBarButtonClick.subscribe((type: any) => {
        console.log("Clicked command bar -> " + CommandBarButtonType[type]);
      }));
    shed = new Date().getTime();
    renderer.addScene(uiScene);
    const loop = new UiAnimationLoop(renderer);
    (this.disposables.add(loop), loop.start());
    const done = new Date().getTime();
    (console.log("Rendering took " + (done - shed) + "ms"),
      rootEl.appendChild(uiScene.getHtmlContainer().getElement()),
      this.disposables.add(() => {
        rootEl.removeChild(uiScene.getHtmlContainer().getElement());
      }));
  }

  /** 释放全部 disposable。 */
  static destroy(): void {
    this.disposables.dispose();
  }
}
