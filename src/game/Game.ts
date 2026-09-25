/**
 * Game — 对局核心：玩家/对象生命周期、每 tick 驱动、胜负与锁步哈希。
 *
 * 职责概览：
 *  - 玩家：addPlayer / get* 系列 / areFriendly / 初始结盟 createInitialTeams；
 *  - 对象：create* / spawn / unspawn / limbo / destroy / changeObjectOwner，
 *    并向 traits 广播 NotifySpawn/Unspawn/Destroy/OwnerChange 等；
 *  - 初始化：init 建地图对象、Secret Lab 奖励、初始单位（MCV+StartingUnitsGenerator）、
 *    战役 scenarioTeamRuntime；
 *  - update：Bot → 可更新对象 → NotifyTick → 选中目标可见性 → afterTick →
 *    triggers/countdown → tick++ / currentTime += 1000/15；
 *  - 胜负：checkGameEndConditions / updateDefeatedPlayers / 资产再分配；
 *  - getHash / debugGetState：锁步一致性校验与调试快照。
 *
 * 由 game/Game.ts.js 重写为 TS（行为完全一致）。两个文件并存期间，本文件
 * 才是修改目标：tools/repack.mjs 打包时优先采用 .ts 模块的编译产物。
 */
import { ConstructionWorker } from "game/ConstructionWorker"; // 已转换
import * as GameOptsModule from "game/gameopts/GameOpts"; // 孪生
import { ObjectType } from "engine/type/ObjectType"; // 已转换
import { EventDispatcher } from "util/event"; // 已转换
import * as OreSpreadModule from "game/map/OreSpread"; // 孪生
import { Infantry } from "game/gameobject/Infantry"; // 已转换
import { Alliances, AllianceStatus } from "game/Alliances"; // 已转换
import { BoxedVar } from "util/BoxedVar"; // 已转换
import { StartingUnitsGenerator } from "game/StartingUnitsGenerator"; // 本组已写
import { CardinalTileFinder } from "game/map/tileFinder/CardinalTileFinder"; // 已转换
import { SpeedType } from "game/type/SpeedType"; // 已转换
import { Target } from "game/Target"; // 本组已写
import * as BridgeOverlayTypesModule from "game/map/BridgeOverlayTypes"; // 孪生
import * as MathUtil from "util/math"; // 已转换
import { GameEventBus } from "game/GameEventBus"; // 本组已写
import { ObjectDestroyEvent } from "game/event/ObjectDestroyEvent"; // 已转换
import { PlayerDefeatedEvent } from "game/event/PlayerDefeatedEvent"; // 已转换
import * as GameModeTypeModule from "game/ini/GameModeType"; // 孪生
import { Traits } from "game/Traits"; // 已转换
import * as NotifyTickModule from "game/trait/interface/NotifyTick"; // 已转换
import * as NotifyDestroyModule from "game/trait/interface/NotifyDestroy"; // 已转换
import * as NotifySpawnModule from "game/trait/interface/NotifySpawn"; // 已转换
import * as NotifyUnspawnModule from "game/trait/interface/NotifyUnspawn"; // 已转换
import * as NotifyOwnerChangeModule from "game/trait/interface/NotifyOwnerChange"; // 已转换
import { ObjectOwnerChangeEvent } from "game/event/ObjectOwnerChangeEvent"; // 已转换
import { ObjectUnspawnEvent } from "game/event/ObjectUnspawnEvent"; // 已转换
import * as NotifyTargetDestroyModule from "game/trait/interface/NotifyTargetDestroy"; // 已转换
import { VeteranLevel } from "game/gameobject/unit/VeteranLevel"; // 已转换
import { ObjectSpawnEvent } from "game/event/ObjectSpawnEvent"; // 已转换
import * as OreOverlayTypesModule from "game/map/OreOverlayTypes"; // 孪生
import { Weapon } from "game/Weapon"; // 已转换
import { GameSpeed } from "game/GameSpeed"; // 已转换
import { DeathType } from "game/gameobject/common/DeathType"; // 已转换
import * as BridgesModule from "game/map/Bridges"; // 孪生
import { SuperWeapon } from "game/SuperWeapon"; // 本组已写
import { AllianceChangeEvent, AllianceEventType } from "game/event/AllianceChangeEvent"; // 已转换
import * as NotifyAllianceChangeModule from "game/trait/interface/NotifyAllianceChange"; // 已转换
import * as GameConstantsModule from "game/gameopts/constants"; // 孪生
import { ZoneType, getZoneType } from "game/gameobject/unit/ZoneType"; // 已转换
import { Prng } from "game/Prng"; // 已转换
import { TriggerManager } from "game/trigger/TriggerManager"; // 已转换
import { CountdownTimer } from "game/CountdownTimer"; // 已转换
import { WeaponType } from "game/WeaponType"; // 已转换
import { Warhead } from "game/Warhead"; // 已转换
import * as NotifyObjectTraitAddModule from "game/trait/interface/NotifyObjectTraitAdd"; // 已转换
import { RadarOnOffEvent } from "game/event/RadarOnOffEvent"; // 已转换
import * as GeometryUtil from "util/geometry"; // 已转换
import { WaitTicksTask } from "game/gameobject/task/system/WaitTicksTask"; // 已转换
import * as ScenarioTeamRuntimeModule from "game/scenario/ScenarioTeamRuntime"; // 本组已写

const { AiDifficulty, isHumanPlayerInfo } = GameOptsModule as any;
const { OBS_COUNTRY_ID } = GameConstantsModule as any;

/* eslint-disable @typescript-eslint/no-explicit-any */

/** 对局生命周期状态。 */
export enum GameStatus {
  /** 尚未 start()。 */
  NotStarted = 0,
  /** 进行中。 */
  Started = 1,
  /** 已结束（胜负判定或强制 end）。 */
  Ended = 2,
}

export class Game {
  /** 结束事件（onEnd）。 */
  private _onEnd = new EventDispatcher();
  /** 世界对象容器。 */
  world: any;
  /** 运行时地图。 */
  map: any;
  /** 规则集。 */
  rules: any;
  /** 美术/动画规则。 */
  art: any;
  /** AI 数据。 */
  ai: any;
  /** 对局 id（同时作 Prng seed）。 */
  id: any;
  /** 起始时间戳（Prng 第二 seed）。 */
  startTimestamp: any;
  /** 对局 PRNG。 */
  prng: any;
  /** 局选项。 */
  gameOpts: any;
  /** 局模式类型。 */
  gameModeType: any;
  /** 玩家列表。 */
  playerList: any;
  /** 单位选中。 */
  unitSelection: any;
  /** 结盟状态机。 */
  alliances: any;
  /** 目标速度（秒/tick 目标）。 */
  desiredSpeed: any;
  /** 实际速度。 */
  speed: any;
  /** 下一对象 id 分配器。 */
  nextObjectId: any;
  /** 对象工厂。 */
  objectFactory: any;
  /** Bot 管理器。 */
  botManager: any;
  /** 触发器管理器。 */
  triggers: any;
  /** 战役: 阵营名 → Player。 */
  housePlayers: any;
  /** 战役: [Houses] 原始列表。 */
  campaignHouses: any;
  /** 战役: 场景小队运行时。 */
  scenarioTeamRuntime: any;
  /** AI 聊天消息队列（GUI 消费）。 */
  aiChatMessages: any[] = [];
  /** 触发器锁定玩家输入。 */
  inputLocked: any = false;
  /** 待处理相机移动请求。 */
  pendingCameraMove: any = void 0;
  /** 待处理单元高亮请求。 */
  pendingUnitFlash: any = void 0;
  /** 脚本小队攻击路点目标标记。 */
  attackTargetMarkers: any[] = [];
  /** 可更新对象集合。 */
  updatableObjects = new Set<any>();
  /** 玩家 → 建造工人。 */
  constructionWorkers = new Map<any, any>();
  /** 当前逻辑 tick。 */
  currentTick = 0;
  /** 当前逻辑时间（ms，每 tick +1000/15）。 */
  currentTime = 0;
  /** 回合计时器。 */
  countdownTimer = new CountdownTimer();
  /** tick 后回调队列。 */
  afterTickCallbacks: any[] = [];
  /** 事件总线。 */
  events = new GameEventBus();
  /** 全局 trait 集合。 */
  traits = new Traits();
  /** 调试文本（BoxedVar）。 */
  debugText = new BoxedVar("");
  /** 状态（孪生无字段初始化，start() 前为 undefined——update 守卫靠 `!== NotStarted` 对 undefined 放行）。 */
  status: any;
  /** 本地玩家。 */
  localPlayer: any;
  /** 上次胜负检查时间。 */
  private lastGameEndCheck: any;
  /** 各 trait 字段由 GameFactory 注入。 */
  mapShroudTrait: any;
  mapRadiationTrait: any;
  mapLightingTrait: any;
  virusCloudTrait: any;
  crateGeneratorTrait: any;
  stalemateDetectTrait: any;
  sellTrait: any;

  /** 结束事件（只读）。 */
  get onEnd() {
    return this._onEnd.asEvent();
  }

  constructor(
    world: any,
    map: any,
    rules: any,
    art: any,
    ai: any,
    id: any,
    startTimestamp: any,
    gameOpts: any,
    gameModeType: any,
    playerList: any,
    unitSelection: any,
    alliances: any,
    nextObjectId: any,
    objectFactory: any,
    botManager: any,
  ) {
    this.updatableObjects = new Set();
    this.constructionWorkers = new Map();
    this.currentTick = 0;
    this.currentTime = 0;
    this.countdownTimer = new CountdownTimer();
    this._onEnd = new EventDispatcher();
    this.afterTickCallbacks = [];
    this.events = new GameEventBus();
    this.traits = new Traits();
    this.debugText = new BoxedVar("");
    this.world = world;
    this.map = map;
    this.rules = rules;
    this.art = art;
    this.ai = ai;
    this.id = id;
    this.startTimestamp = startTimestamp;
    this.prng = Prng.factory(id, startTimestamp);
    this.gameOpts = gameOpts;
    this.gameModeType = gameModeType;
    this.playerList = playerList;
    this.unitSelection = unitSelection;
    this.alliances = alliances;
    this.desiredSpeed = new BoxedVar(GameSpeed.computeGameSpeed(gameOpts.gameSpeed));
    this.speed = new BoxedVar(this.desiredSpeed.value);
    this.nextObjectId = nextObjectId;
    this.objectFactory = objectFactory;
    this.botManager = botManager;
    this.triggers = new TriggerManager();
    // 单人战役: 地图 [Houses] 阵营名 -> Player 映射（GameFactory 战役模式填充）
    this.housePlayers = playerList.housePlayers || new Map();
    // 单人战役: 地图 [Houses] 原始列表（按索引访问，Win/Lose 动作用）
    this.campaignHouses = playerList.campaignHouses || void 0;
    // 单人战役: 场景小队运行时（CreateTeam/CreateReinforcement/脚本执行）
    this.scenarioTeamRuntime = void 0;
    // AI聊天消息队列（单机模式用，由BotManager填充，GUI层消费）
    this.aiChatMessages = [];
    // 触发器 DisableUserInput/EnableUserInput 状态: 锁定玩家操控（GUI 层轮询桥接）
    this.inputLocked = false;
    // 触发器 MoveAndCenterView 待处理的相机移动请求（GUI 层轮询消费）
    this.pendingCameraMove = void 0;
    // 触发器 FlashSmall/Medium/Large/FlashTeam 待处理的单元高亮请求（GUI 层轮询消费）
    this.pendingUnitFlash = void 0;
    // 脚本化小队攻击指定路点时的目标标记（GUI 层渲染脉冲光环）
    this.attackTargetMarkers = [];
  }

  /** 加入玩家并创建其建造工人。 */
  addPlayer(player: any): void {
    this.playerList.addPlayer(player);
    this.constructionWorkers.set(player, this.createConstructionWorker(player));
  }

  /** 按序号取玩家。 */
  getPlayer(index: any): any {
    return this.playerList.getPlayerAt(index);
  }

  /** 按名取玩家。 */
  getPlayerByName(name: any): any {
    return this.playerList.getPlayerByName(name);
  }

  /** AI 槽位 → 规范名 @@AI{n}@@（传入槽对象或序号）。 */
  getAiPlayerName(slot: any): string {
    let index: any;
    index = "number" == typeof slot ? slot : this.gameOpts.aiPlayers.indexOf(slot);
    return `@@AI${index + 1}@@`;
  }

  /** 玩家 → 序号。 */
  getPlayerNumber(player: any): any {
    return this.playerList.getPlayerNumber(player);
  }

  /** 全部战斗方。 */
  getCombatants(): any {
    return this.playerList.getCombatants();
  }

  /** 平民玩家。 */
  getCivilianPlayer(): any {
    return this.playerList.getCivilian();
  }

  /** 全部玩家。 */
  getAllPlayers(): any {
    return this.playerList.getAll();
  }

  /** 非中立玩家。 */
  getNonNeutralPlayers(): any {
    return this.playerList.getNonNeutral();
  }

  /** 同属或已结盟则视为友军。 */
  areFriendly(a: any, b: any): boolean {
    return a.owner === b.owner || this.alliances.areAllied(a.owner, b.owner);
  }

  /** 世界容器。 */
  getWorld(): any {
    return this.world;
  }

  /** 为玩家创建建造工人。 */
  createConstructionWorker(player: any): any {
    return new ConstructionWorker(player, this.rules, this.art, this.map, this);
  }

  /** 取玩家建造工人；不存在抛错。 */
  getConstructionWorker(player: any): any {
    const worker = this.constructionWorkers.get(player);
    if (!worker) throw new Error(`No construction worker found for player "${player.name}"`);
    return worker;
  }

  /** 单位选中。 */
  getUnitSelection(): any {
    return this.unitSelection;
  }

  /** 初始化：地图对象、奖励、初始单位、shroud/crate、Bot、触发器、战役运行时。 */
  init(localPlayer: any): void {
    this.localPlayer = localPlayer;
    this.createMapObjects();
    this.assignSecretLabBonuses();
    // 战役地图自带初始单位/基地，不生成遭遇战式基地车
    if (!this.gameOpts.campaignId) this.createPlayerInitialUnits();
    this.map.terrain.computeAllPassabilityGraphs();
    this.mapShroudTrait.init(this);
    this.crateGeneratorTrait.init(this);
    this.playerList.getAll().forEach((p) => (p.credits = p.scenarioCredits ?? this.gameOpts.credits));
    // AI 难度开局资金加成（Brutal +10000 / Medium +5000 / Easy +2000，含 _Ori/_Custom 变体）
    this.playerList.getAll().forEach((p) => {
      if (p.isAi) {
        if (p.aiDifficulty === AiDifficulty.Brutal || p.aiDifficulty === AiDifficulty.Brutal_Ori) p.credits += 10000;
        else if (
          p.aiDifficulty === AiDifficulty.Medium ||
          p.aiDifficulty === AiDifficulty.Medium_Ori ||
          p.aiDifficulty === AiDifficulty.Medium_Custom
        )
          p.credits += 5000;
        else if (
          p.aiDifficulty === AiDifficulty.Easy ||
          p.aiDifficulty === AiDifficulty.Easy_Ori ||
          p.aiDifficulty === AiDifficulty.Easy_Custom
        )
          p.credits += 2000;
      }
    });
    if (this.rules.mpDialogSettings.alliesAllowed) this.createInitialTeams();
    this.botManager.init(this);
    this.triggers.init(this);
    // 战役场景小队运行时（参考临时源码 cQe）
    if (this.gameOpts.campaignId && this.map.getScenarioTeams) {
      this.scenarioTeamRuntime = new ScenarioTeamRuntimeModule.ScenarioTeamRuntime(this, this.map);
      this.traits.add(this.scenarioTeamRuntime);
    }
  }

  /** 标记 Started 并驱动 Bot 开局。 */
  start(): void {
    this.status = GameStatus.Started;
    this.currentTick = 0;
    this.currentTime = 0;
    this.botManager.onGameStart();
  }

  /** 按 teamId 对同队人类/AI 槽位两两建立 Formed 联盟。 */
  createInitialTeams(): void {
    for (let teamId = 0; teamId < this.gameOpts.maxSlots; teamId++) {
      var names = [...this.gameOpts.humanPlayers, ...this.gameOpts.aiPlayers]
        .filter((slot) => slot?.teamId === teamId && slot.countryId !== OBS_COUNTRY_ID)
        .map((slot) => (isHumanPlayerInfo(slot) ? slot.name : this.getAiPlayerName(slot)));
      if (names.length > 1)
        for (let i = 0; i < names.length - 1; i++)
          for (let j = i + 1; j < names.length; j++) {
            var a = this.getPlayerByName(names[i]);
            var b = this.getPlayerByName(names[j]);
            var entry = this.alliances.setAlliance(a, b, AllianceStatus.Formed);
            this.onAllianceChange(entry, a, true);
          }
    }
  }

  /** 创建地图预置地形/覆盖/污痕/科技对象。 */
  createMapObjects(): void {
    var suppressTiberiumSpawns = this.rules.general.harvesterUnit.every(
      (name) =>
        !MathUtil.isBetween(
          this.rules.getObject(name, ObjectType.Vehicle).techLevel,
          0,
          this.rules.mpDialogSettings.techLevel,
        ),
    );
    var initial = this.map.getInitialMapObjects();
    this.createInitialMapTerrains(initial.terrains, suppressTiberiumSpawns);
    this.createInitialMapOverlays(initial.overlays, suppressTiberiumSpawns);
    this.createInitialMapSmudges(initial.smudges);
    this.createInitialMapTechnos(initial.technos);
  }

  /**
   * Secret Lab bonus assignment (vanilla ScenarioClass::
   * GenerateSecretLabBonuses). Called once at map load: enumerates every
   * SecretLab=yes building placed on the map (in map order) and draws a unique
   * pseudo-random bonus for each from the [General] SecretInfantry/SecretUnits/
   * SecretBuildings pool. The draw uses the deterministic game PRNG so all
   * lockstep clients agree. Vanilla quirk kept: if there are more labs than
   * possible bonuses, NO lab grants anything. Labs with a per-building override
   * (SecretInfantry/SecretUnit/SecretBuilding) always grant their override and
   * don't consume a pool entry.
   */
  assignSecretLabBonuses(): void {
    var general = this.rules.general;
    var pool = [
      ...(general.secretInfantry ?? []),
      ...(general.secretUnits ?? []),
      ...(general.secretBuildings ?? []),
    ];
    if (!pool.length) return;
    var labs = this.world.getAllObjects().filter(
      (obj) =>
        obj.isBuilding() &&
        obj.rules.secretLab &&
        !obj.rules.secretInfantry &&
        !obj.rules.secretUnit &&
        !obj.rules.secretBuilding,
    );
    if (!labs.length) return;
    // 原版怪癖保留：奖励池不足时一所实验室都不得到奖励
    if (pool.length < labs.length) return;
    var bag = [...pool];
    for (const lab of labs) {
      var idx = this.prng.generateRandomInt(0, bag.length - 1);
      lab.secretProduction = bag.splice(idx, 1)[0];
    }
  }

  /** 生成地图初始地形。 */
  createInitialMapTerrains(entries: any, suppressTiberiumSpawns: any): void {
    for (const entry of entries) {
      var tile: any;
      var rulesObj: any;
      var name = entry.name;
      if (this.validateMapObjectRulesAndArt(name, ObjectType.Terrain)) {
        tile = this.map.tiles.getByMapCoords(entry.rx, entry.ry);
        if (tile) {
          rulesObj = this.rules.getObject(name, ObjectType.Terrain);
          if (!(suppressTiberiumSpawns && rulesObj.spawnsTiberium)) {
            const obj = this.createObject(ObjectType.Terrain, name);
            this.spawnObject(obj, tile);
          }
        } else console.warn(`Invalid map object location (${entry.rx},${entry.ry})`, entry);
      }
    }
  }

  /** 生成地图初始覆盖物（含高低桥段、矿 spread 校正、占位块）。 */
  createInitialMapOverlays(entries: any, suppressTiberiumSpawns: any): void {
    let lowBridgeValues = new Map<any, any>();
    let headTilesWithHigh = new Map<any, any>();
    var mapRx: any;
    var mapRy: any;
    var bridgeSpec: any;
    var highHeads = this.map.bridges.findMapHighBridgeHeadTiles();
    let headSpecs = this.map.bridges.findBridgeSpecsForHeadTiles([...highHeads]);
    for (const entry of entries) {
      var name = this.rules.getOverlayName(entry.id);
      if (this.validateMapObjectRulesAndArt(name, ObjectType.Overlay)) {
        let obj = this.createObject(ObjectType.Overlay, name); // 孪生：tib 繁殖分支会重新赋值
        obj.overlayId = entry.id;
        obj.value = entry.value;
        let rx = entry.rx;
        let ry = entry.ry;
        if (obj.isBridge() && obj.isHighBridge()) {
          obj.position.tileElevation = 4;
          var headSpec = headSpecs.find((spec) =>
            GeometryUtil.rectContainsPoint(
              { x: spec.start.rx, y: spec.start.ry, ...this.map.bridges.getBridgeSize(spec) },
              { x: rx, y: ry },
            ),
          );
          if (headSpec) {
            var { type, isXBridge, isHigh } = headSpec;
            if (!isHigh) {
              console.warn(`Expected high bridge but found low bridge overlay at location (${rx},${ry})`);
              obj.dispose();
              continue;
            }
            if (isXBridge !== obj.isXBridge()) {
              const expectedId = BridgeOverlayTypesModule.BridgeOverlayTypes.calculateHighBridgeOverlayId(type, isXBridge);
              if (obj.overlayId !== expectedId) {
                obj.overlayId = expectedId;
                obj.name = this.rules.getOverlayName(expectedId);
              }
            }
          }
          // 高桥格按方向偏移映射到低桥占位/逻辑格
          rx += obj.isXBridge() ? 0 : -1;
          ry += obj.isXBridge() ? -1 : 0;
        }
        var tibId: any;
        var tile = this.map.tiles.getByMapCoords(rx, ry);
        if (tile) {
          if (
            (obj.rules.tiberium &&
              (void 0 === (tibId = OreOverlayTypesModule.OreOverlayTypes.getOverlayTibType(entry.id)) ||
                (void 0 !== (tibId = OreSpreadModule.OreSpread.calculateOverlayId(tibId, tile)) &&
                  tibId !== entry.id &&
                  (obj.dispose(),
                  (obj = this.createObject(ObjectType.Overlay, this.rules.getOverlayName(tibId))),
                  (obj.overlayId = tibId),
                  (obj.value = entry.value)))),
            BridgeOverlayTypesModule.BridgeOverlayTypes.isLowBridge(entry.id))
          ) {
            if (!BridgeOverlayTypesModule.BridgeOverlayTypes.isBridgePlaceholder(entry.id)) {
              lowBridgeValues.set(tile, entry.value);
              if (1 === entry.value) headTilesWithHigh.set(tile, obj);
              else obj.dispose();
            }
            // 低桥占位块：孪生此处不处理，统一在段三生成
          } else {
            if (obj.isTiberium())
              if (this.map.getObjectsOnTile(tile).find((o) => o.isTerrain())) {
                obj.dispose();
                continue;
              }
            if (suppressTiberiumSpawns && obj.isTiberium()) obj.dispose();
            else this.spawnObject(obj, tile);
          }
        } else {
          console.warn(`Invalid map object location (${rx},${ry})`, entry);
          obj.dispose();
        }
      }
    }
    // 二段：校验低桥相邻段 value 关系后落格，失败则丢弃（孪生 a/s 语义）
    for (const [tile, obj] of headTilesWithHigh) {
      var isX = obj.isXBridge();
      var left = this.map.tiles.getByMapCoords(tile.rx + (isX ? 0 : -1), tile.ry + (isX ? -1 : 0));
      var right = this.map.tiles.getByMapCoords(tile.rx + (isX ? 0 : 1), tile.ry + (isX ? 1 : 0));
      if (left && right && (0 === lowBridgeValues.get(left) || 2 === lowBridgeValues.get(right))) {
        obj.value = 0;
        this.spawnObject(obj, left);
      } else {
        obj.dispose();
        console.warn(`Invalid bridge segment @${tile.rx},${tile.ry}. Skipping.`);
      }
    }
    // 三段：为所有带头段的桥绑定 bridgeSpec，并铺 placeholder 占位覆盖
    var specs: any;
    var headTiles = [...headTilesWithHigh.keys()].filter(
      (t) => this.map.bridges.getPieceAtTile(t)?.headType !== BridgesModule.BridgeHeadType.None,
    );
    let allSpecs = [...this.map.bridges.findBridgeSpecsForHeadTiles([...headTiles]), ...headSpecs];
    for (specs of allSpecs)
      for (const piece of this.map.bridges.findBridgePieces(specs)) piece.obj.bridgeTrait.bridgeSpec = specs;
    var tile2: any;
    var allBridgeTiles = allSpecs.map((s) => this.map.bridges.findAllBridgeTiles(s)).flat();
    var placeholderId = BridgeOverlayTypesModule.BridgeOverlayTypes.bridgePlaceholderIds[0];
    var placeholderName = this.rules.getOverlayName(placeholderId);
    for (tile2 of allBridgeTiles) {
      const ph = this.createObject(ObjectType.Overlay, placeholderName);
      ph.overlayId = placeholderId;
      this.spawnObject(ph, tile2);
    }
  }

  /** 生成地图初始污痕（焦痕等）。 */
  createInitialMapSmudges(entries: any): void {
    for (const entry of entries) {
      var name = entry.name;
      var tile = this.map.tiles.getByMapCoords(entry.rx, entry.ry);
      if (tile) {
        const obj = this.createObject(ObjectType.Smudge, name);
        this.spawnObject(obj, tile);
      } else console.warn(`Invalid map object location (${entry.rx},${entry.ry})`, entry);
    }
  }

  /** 生成地图初始建筑/单位（Owner 解析、血量、方向、桥、Veterancy、Mission）。 */
  createInitialMapTechnos(entries: any): void {
    let byCountryName = new Map(
      this.playerList
        .getAll()
        .filter((p) => !!p.country)
        .map((p) => [p.country.name, p]),
    );
    const tags = this.map.getTags();
    for (const entry of entries) {
      var name = entry.name;
      if (this.validateMapObjectRulesAndArt(name, entry.type)) {
        var tile = this.map.tiles.getByMapCoords(entry.rx, entry.ry);
        if (tile) {
          // 战役地图的 Owner= 是 [Houses] 阵营名，先按阵营名查找，再回退到国家名
          var owner = this.housePlayers.get(entry.owner) ?? byCountryName.get(entry.owner);
          if (owner) {
            // 中立对象总是创建；非中立对象（玩家/敌方基地与单位）仅战役模式创建
            // （遭遇战开局用 MCV 生成单位，不创建地图预置的非中立对象）。
            if (owner.isNeutral || this.gameOpts.campaignId) {
              const obj = this.createObject(entry.type, name);
              if (entry.tag) obj.tag = tags.find((t) => t.id === entry.tag);
              obj.healthTrait.health = (entry.health / 256) * 100;
              let leaveZeroHealth = false;
              if (!obj.healthTrait.health) {
                if (!obj.isBuilding() || !obj.rules.leaveRubble) {
                  obj.dispose();
                  continue;
                }
                leaveZeroHealth = true;
              }
              if (entry.isInfantry() || entry.isVehicle() || entry.isAircraft()) {
                obj.direction = ((-entry.direction / 256) * 360 + 360) % 360;
                if (entry.isInfantry()) obj.position.subCell = entry.subCell;
                let onBridge = false;
                if (entry.onBridge)
                  if (void 0 === tile.onBridgeLandType)
                    console.warn(
                      `Cannot place unit "${entry.name}" on a bridge because ` +
                        `no bridge was found at ${tile.rx}, ` +
                        tile.ry,
                    );
                  else onBridge = true;
                obj.onBridge = onBridge;
                obj.zone = getZoneType(onBridge ? tile.onBridgeLandType : tile.landType);
                if (onBridge)
                  obj.position.tileElevation +=
                    this.map.tileOccupation.getBridgeOnTile(tile)?.tileElevation ?? 0;
                if (entry.veterancy) obj.veteranTrait?.setRelativeXP(entry.veterancy);
              } else obj.poweredTrait?.setTurnedOn(entry.poweredOn);
              this.changeObjectOwner(obj, owner);
              this.spawnObject(obj, tile);
              if (entry.isInfantry() || entry.isVehicle() || entry.isAircraft())
                this.applyInitialUnitMission(obj, entry);
              if (leaveZeroHealth) this.destroyObject(obj, void 0, true);
            }
          } else console.warn(`Invalid owner "${entry.owner}" for map object`, entry);
        } else console.warn(`Invalid map object location (${entry.rx},${entry.ry})`, entry);
      }
    }
  }

  /** 校验对象有 rules 与 art 段；缺失则 warn 并跳过。 */
  validateMapObjectRulesAndArt(name: any, type: any): boolean {
    if (!this.rules.hasObject(name, type)) {
      console.warn(`Map object '${name}' has no rules section. Skipping.`);
      return false;
    }
    if (!this.art.hasObject(name, type)) {
      console.warn(`Map object '${name}' has no art section. Skipping.`);
      return false;
    }
    return true;
  }

  /** 处理地图初始单位 Mission 字段（sleep/wait/harmless/stop / guard/area guard）。 */
  applyInitialUnitMission(obj: any, entry: any): void {
    // 处理地图初始单位的 Mission 字段（参考临时源码 initializeMapUnit）：
    //   sleep/wait/harmless/stop -> 原地待命（挂超长等待任务，同时阻止被动索敌）
    //   guard/area guard -> 守卫当前位置区域（AttackTrait 被动索敌接管）
    //   attack/hunt -> 保持默认被动索敌攻击
    if (!entry.mission || !obj.unitOrderTrait) return;
    var mission = String(entry.mission).replace(/[ _-]/g, "").toLowerCase();
    if ("sleep" === mission || "harmless" === mission || "wait" === mission || "stop" === mission)
      obj.unitOrderTrait.addTask(new WaitTicksTask(Number.MAX_SAFE_INTEGER));
    else if ("guard" === mission || "areaguard" === mission) {
      obj.guardMode = true;
      obj.guardArea = { tile: obj.tile, onBridge: !!obj.isUnit() && obj.onBridge };
    }
  }

  /** 为每个战斗方创建 MCV 与 StartingUnitsGenerator 初始编成。 */
  createPlayerInitialUnits(): void {
    let countries = this.playerList.getCombatants().map((p) => p.country);
    var candidates = [...this.rules.infantryRules.values(), ...this.rules.vehicleRules.values()].filter(
      (r) =>
        r.allowedToStartInMultiplayer &&
        !r.naval &&
        -1 !== r.techLevel &&
        r.techLevel <= this.rules.mpDialogSettings.techLevel &&
        !this.rules.general.baseUnit.includes(r.name) &&
        countries.some((c) => r.isAvailableTo(c) && r.hasOwner(c)),
    );
    for (const combatant of this.playerList.getCombatants()) {
      var start = this.map.startingLocations[combatant.startLocation];
      var startTile = this.map.tiles.getByMapCoords(start.x, start.y);
      if (!startTile) throw new Error(`Invalid player starting position (${start.x},${start.y})`);
      // Pick the MCV whose Owner list includes this country. baseUnit is an array
      // of vehicle names (AMCV/SMCV/PCV in vanilla YR). Each faction's MCV must
      // declare Owner=...,<CountryName>,... for find() to match it; the deployed
      // ConstructionYard is determined solely by the MCV's DeploysInto= value.
      let mcvName = this.rules.general.baseUnit.find((name) => {
        const r = this.rules.getObject(name, ObjectType.Vehicle);
        return r.isAvailableTo(combatant.country) && r.hasOwner(combatant.country);
      });
      if (!mcvName && this.rules.general.baseUnit.length) mcvName = this.rules.general.baseUnit[0];
      if (!mcvName) throw new Error("No suitable MCV found for player country " + combatant.country?.name);
      let mcvRules = this.rules.getObject(mcvName, ObjectType.Vehicle);
      const mcv = this.createUnitForPlayer(mcvRules, combatant);
      this.spawnObject(mcv, startTile);
      let composition = StartingUnitsGenerator.generate(
        this.gameOpts.unitCount,
        [...this.rules.vehicleRules.keys()],
        candidates,
        combatant.country,
      );
      // Unholy 模式额外把所有 MCV 变体各编入 1 辆
      if (this.gameModeType === GameModeTypeModule.GameModeType.Unholy)
        composition.push(
          ...this.rules.general.baseUnit
            .filter((name) => name !== mcvName)
            .map((name) => ({ name, type: ObjectType.Vehicle, count: 1 })),
        );
      var entryName: any;
      var entryType: any;
      var entryCount: any;
      let tiles: any[] = [];
      let noMoreTiles = false;
      let finder = new CardinalTileFinder(
        this.map.tiles,
        this.map.mapBounds,
        startTile,
        4,
        4,
        (t) =>
          !this.map
            .getGroundObjectsOnTile(t)
            .find((o) => !(o.isSmudge() || (o.isOverlay() && o.isTiberium()))) &&
          this.map.terrain.getPassableSpeed(t, SpeedType.Foot, false, false) > 0,
      );
      const ringFinders = new Map();
      let ringCursor = 0;
      for ({ name: entryName, type: entryType, count: entryCount } of composition) {
        let left = entryCount;
        for (; left > 0; ) {
          let tile: any;
          if (!noMoreTiles) {
            tile = finder.getNextTile();
            if (tile) tiles.push(tile);
            else noMoreTiles = true;
          }
          if (noMoreTiles && tiles.length) {
            var ringTile = tiles[ringCursor];
            let ringFinder = ringFinders.get(ringTile);
            if (!ringFinder) {
              ringFinder = new CardinalTileFinder(
                this.map.tiles,
                this.map.mapBounds,
                ringTile,
                1,
                0,
                (t) =>
                  !this.map
                    .getGroundObjectsOnTile(t)
                    .find((o) => !(o.isSmudge() || (o.isOverlay() && o.isTiberium()))) &&
                  this.map.terrain.getPassableSpeed(t, SpeedType.Foot, false, false) > 0,
              );
              ringFinders.set(ringTile, ringFinder);
            }
            ringCursor = (ringCursor + 1) % tiles.length;
            tile = ringFinder.getNextTile();
          }
          if (tile) {
            var unitRules: any;
            var unit: any;
            const rulesObj = this.rules.getObject(entryName, entryType);
            if (entryType === ObjectType.Vehicle) {
              unit = this.createUnitForPlayer(rulesObj, combatant);
              this.applyInitialVeteran(unit, combatant);
              this.spawnObject(unit, tile);
              left--;
            } else {
              if (entryType !== ObjectType.Infantry) throw new Error("Should not reach this line");
              for (const subCell of Infantry.SUB_CELLS.slice(0, left)) {
                const inf = this.createUnitForPlayer(rulesObj, combatant);
                inf.position.subCell = subCell;
                this.applyInitialVeteran(inf, combatant);
                this.spawnObject(inf, tile);
                left--;
              }
            }
          } else left--;
        }
      }
    }
  }

  /** 初始老兵：全局 initialVeteran → Elite；否则国家已服役单位 → Veteran。 */
  applyInitialVeteran(unit: any, combatant: any): void {
    if (unit.veteranTrait)
      if (this.rules.general.veteran.initialVeteran) unit.veteranTrait.setVeteranLevel(VeteranLevel.Elite);
      else if (combatant.country.hasVeteranUnit(unit.type, unit.name))
        unit.veteranTrait.setVeteranLevel(VeteranLevel.Veteran);
  }

  /** 经 ObjectFactory 创建对象。 */
  createObject(type: any, name: any): any {
    return this.objectFactory.create(type, name, this.rules, this.art);
  }

  /** 创建单位并改属、写入出售估值。 */
  createUnitForPlayer(rulesObj: any, player: any): any {
    if (![ObjectType.Aircraft, ObjectType.Vehicle, ObjectType.Infantry].includes(rulesObj.type))
      throw new Error(`Attempted to create an invalid unit type "${rulesObj.type}"`);
    const unit = this.createObject(rulesObj.type, rulesObj.name);
    this.changeObjectOwner(unit, player);
    unit.purchaseValue = this.sellTrait.computePurchaseValue(unit.rules, player);
    return unit;
  }

  /** 创建弹道并写入来源/目标。 */
  createProjectile(name: any, fromObject: any, fromWeapon: any, target: any, isShrapnel: any): any {
    const projectile = this.createObject(ObjectType.Projectile, name);
    projectile.fromWeapon = fromWeapon;
    projectile.fromObject = fromObject;
    projectile.fromPlayer = fromObject.owner;
    projectile.target = target;
    projectile.isShrapnel = isShrapnel;
    return projectile;
  }

  /** 创建无武器绑定的散落弹丸（speed 由 Weapon.computeSpeed 推算）。 */
  createLooseProjectile(weaponName: any, fromPlayer: any, target: any): any {
    var weaponRules = this.rules.getWeapon(weaponName);
    var projName = weaponRules.projectile;
    var projRules = this.rules.getProjectile(projName);
    var warheadRules = this.rules.getWarhead(weaponRules.warhead);
    const weaponInfo = {
      minRange: 0,
      projectileRules: projRules,
      range: Number.POSITIVE_INFINITY,
      rules: weaponRules,
      speed: Weapon.computeSpeed(weaponRules, projRules),
      type: WeaponType.Primary,
      warhead: new Warhead(warheadRules),
    };
    const projectile = this.createObject(ObjectType.Projectile, projName);
    projectile.fromWeapon = weaponInfo;
    projectile.fromObject = void 0;
    projectile.fromPlayer = fromPlayer;
    projectile.target = target;
    return projectile;
  }

  /** 创建超级武器实例。 */
  createSuperWeapon(name: any, owner: any, oneTimeOnly: any = false): any {
    var rules = this.rules.getSuperWeapon(name);
    return new SuperWeapon(name, rules, owner, oneTimeOnly);
  }

  /** 创建目标包装。 */
  createTarget(obj: any, tile: any): any {
    return new Target(obj, tile, this.map.tileOccupation);
  }

  /** 目标合法性：未生成/坠毁中/非合法目标/隐形建筑则否。 */
  isValidTarget(target: any): boolean {
    if (target) {
      if (!target.isSpawned || target.isCrashing) return false;
      if (!(target.rules.legalTarget || (target.isBuilding() && target.rules.hospital))) return false;
      if (target.isBuilding() && target.rules.invisibleInGame) return false;
    }
    return true;
  }

  /** 生成对象到世界；limbo 中对象须先 unlimbo。 */
  spawnObject(obj: any, tile: any): void {
    if (obj.isTechno() && obj.limboData)
      throw new Error(
        `Object ${obj.name}#${obj.id} is in limbo. Use unlimboObject instead or clear limboData first`,
      );
    this.doSpawnObject(obj, tile);
  }

  /** 退出世界（仍保留 rules/引用，常用于进运输载具）。 */
  unspawnObject(obj: any): void {
    if (obj.isTechno() && obj.owner && obj.owner.removeOwnedObject) obj.owner.removeOwnedObject(obj);
    this.doUnspawnObject(obj);
  }

  /** 挂起 limbo 元数据并移出世界。 */
  limboObject(obj: any, limboData: any): void {
    obj.limboData = limboData;
    this.doUnspawnObject(obj);
  }

  /** 从 limbo 恢复到指定格；可恢复选中与编组。 */
  unlimboObject(obj: any, tile: any, skipSelection: any = false): void {
    const data = obj.limboData;
    if (!data) throw new Error(`Object ${obj.name}#${obj.id} has no limboData attached`);
    obj.limboData = void 0;
    this.doSpawnObject(obj, tile);
    const selection = this.getUnitSelection();
    if (data.selected && !skipSelection) selection.addToSelection(obj);
    if (void 0 !== data.controlGroup) selection.addUnitsToGroup(data.controlGroup, [obj], false);
  }

  /** 实际落世界：写 tile/建筑中心格、占位、更新表、onSpawn/NotifySpawn/事件。 */
  private doSpawnObject(obj: any, tile: any): void {
    var foundation: any;
    var centerRx: any;
    obj.position.tile = tile;
    if (obj.isBuilding()) {
      foundation = obj.art.foundationCenter;
      centerRx = tile.rx + foundation.x;
      foundation = tile.ry + foundation.y;
      obj.centerTile = this.map.tiles.getByMapCoords(centerRx, foundation) ?? this.map.tiles.getPlaceholderTile(centerRx, foundation);
    }
    this.world.spawnObject(obj);
    if (obj.cachedTraits.tick.length || obj.isProjectile() || obj.isDebris() || obj.isTechno())
      this.updatableObjects.add(obj);
    if (obj.isTechno()) this.map.technosByTile.add(obj);
    if (!obj.isProjectile() && !obj.isDebris()) this.map.tileOccupation.occupyTileRange(tile, obj);
    if (obj.art.canHideThings) this.map.tileOcclusion.addOccluder(obj);
    obj.onSpawn(this);
    this.traits.filter(NotifySpawnModule.NotifySpawn).forEach((t) => {
      t[NotifySpawnModule.NotifySpawn.onSpawn](obj, this);
    });
    this.events.dispatch(new ObjectSpawnEvent(obj));
  }

  /** 实际移出世界：释放占位/更新表、onUnspawn/NotifyUnspawn/事件。 */
  private doUnspawnObject(obj: any): void {
    const tile = obj.tile;
    if (!obj.isProjectile() && !obj.isDebris()) this.map.tileOccupation.unoccupyTileRange(tile, obj);
    if (obj.art.canHideThings) this.map.tileOcclusion.removeOccluder(obj);
    if (obj.isTechno()) {
      this.unitSelection.cleanupUnit(obj);
      this.map.technosByTile.remove(obj);
    }
    this.world.removeObject(obj);
    this.updatableObjects.delete(obj);
    obj.onUnspawn(this);
    this.traits.filter(NotifyUnspawnModule.NotifyUnspawn).forEach((t) => {
      t[NotifyUnspawnModule.NotifyUnspawn.onUnspawn](obj, this);
    });
    this.events.dispatch(new ObjectUnspawnEvent(obj));
  }

  /**
   * 销毁对象：计分/丢兵统计 → isDestroyed → onDestroy/NotifyDestroy/
   * NotifyTargetDestroy → ObjectDestroyEvent → 废墟 unspawn 或直接
   * unspawn / limbo 移除 → dispose。
   */
  destroyObject(obj: any, attacker: any, silent: any = false, fromEngine: any = false): void {
    if (obj.isDestroyed) throw new Error(`Object with ID "${obj.id}" is already destroyed`);
    if (obj.isTechno()) {
      // 孪生: (!i || building!combatant || (killed, same|allied|score)), neutral|lost
      const originalOwner = obj.mindControllableTrait?.getOriginalOwner() ?? obj.owner;
      if (!attacker || (obj.isBuilding() && !originalOwner.isCombatant())) {
        // 无攻击者 / 非战斗方建筑：跳过击杀计分（逗号表达式前半短路）
      } else {
        attacker.player.addUnitsKilled(obj.type, 1);
        if (attacker.player !== originalOwner && !this.alliances.areAllied(attacker.player, originalOwner))
          attacker.player.score += obj.rules.points;
      }
      if (!originalOwner.isNeutral) originalOwner.addUnitsLost(obj.type, 1);
    }
    obj.isDestroyed = true;
    if (obj.healthTrait) obj.healthTrait.health = 0;
    obj.onDestroy(this, attacker, silent);
    this.traits.filter(NotifyDestroyModule.NotifyDestroy).forEach((t) => {
      t[NotifyDestroyModule.NotifyDestroy.onDestroy](obj, this, attacker);
    });
    if (attacker?.obj?.traits)
      attacker.obj.traits.filter(NotifyTargetDestroyModule.NotifyTargetDestroy).forEach((t) => {
        t[NotifyTargetDestroyModule.NotifyTargetDestroy.onDestroy](attacker.obj, obj, attacker.weapon, this);
      });
    this.events.dispatch(new ObjectDestroyEvent(obj, attacker, fromEngine));
    if (obj.isBuilding() && obj.rules.leaveRubble && obj.deathType !== DeathType.Temporal) {
      obj.owner.removeOwnedObject(obj);
      this.unitSelection.cleanupUnit(obj);
      const tiles = this.map.tileOccupation.calculateTilesForGameObject(obj.tile, obj);
      this.map.terrain.invalidateTiles(tiles);
      if (obj.art.canHideThings) this.map.tileOcclusion.removeOccluder(obj);
      this.updatableObjects.delete(obj);
      obj.onUnspawn(this);
      this.traits.filter(NotifyUnspawnModule.NotifyUnspawn).forEach((t) => {
        t[NotifyUnspawnModule.NotifyUnspawn.onUnspawn](obj, this);
      });
      this.events.dispatch(new ObjectUnspawnEvent(obj));
    } else if (obj.isSpawned) this.unspawnObject(obj);
    else if (obj.isTechno() && obj.owner) {
      if (!obj.limboData) throw new Error(`Object with ID "${obj.id}" should be in limbo but has no limboData`);
      obj.owner.removeOwnedObject(obj);
    }
    obj.dispose();
  }

  /** 经世界查 id。 */
  getObjectById(id: any): any {
    return this.world.getObjectById(id);
  }

  /**
   * 改属：从旧主移除 → 加入新主 → 平民驻军建筑打 wasCapturedFromCivilian →
   * 旧主不同则广播 NotifyOwnerChange/onOwnerChange/事件；若旧主是本地玩家还取消选中。
   */
  changeObjectOwner(obj: any, newOwner: any): void {
    const oldOwner = obj.owner;
    if (oldOwner && oldOwner.removeOwnedObject) oldOwner.removeOwnedObject(obj);
    newOwner.addOwnedObject(obj);
    // mark garrison buildings as "captured from civilian" when they become
    // civilian-owned. This allows them to flip back to civilian when emptied later.
    // Player-built garrison buildings never get this flag, so they stay player-owned.
    if (obj.garrisonTrait && newOwner === this.getCivilianPlayer()) obj.wasCapturedFromCivilian = true;
    if (oldOwner && oldOwner !== newOwner) {
      this.traits.filter(NotifyOwnerChangeModule.NotifyOwnerChange).forEach((t) => {
        t[NotifyOwnerChangeModule.NotifyOwnerChange.onChange](obj, oldOwner, this);
      });
      obj.onOwnerChange(oldOwner, this);
      this.events.dispatch(new ObjectOwnerChangeEvent(obj, oldOwner));
      if (oldOwner === this.localPlayer && obj.owner !== this.localPlayer) {
        this.unitSelection.removeFromSelection([obj]);
        this.unitSelection.removeUnitsFromGroup([obj]);
      }
    }
  }

  /** 给对象附加 trait 并广播 NotifyObjectTraitAdd。 */
  addObjectTrait(obj: any, trait: any): void {
    obj.addTrait(trait);
    this.traits.filter(NotifyObjectTraitAddModule.NotifyObjectTraitAdd).forEach((t) => {
      t[NotifyObjectTraitAddModule.NotifyObjectTraitAdd.onAdd](obj, trait, this);
    });
  }

  /** 结盟状态变化：派发 AllianceChangeEvent（Formed/Broken）并广播 trait。 */
  onAllianceChange(entry: any, other: any, formed: any): void {
    this.events.dispatch(
      new AllianceChangeEvent(entry, formed ? AllianceEventType.Formed : AllianceEventType.Broken, other),
    );
    this.traits.filter(NotifyAllianceChangeModule.NotifyAllianceChange).forEach((t) => {
      t[NotifyAllianceChangeModule.NotifyAllianceChange.onChange](entry, formed, this);
    });
  }

  /** 主循环一 tick：Bot → 胜负检查 → 对象 update → NotifyTick → 选中清理 → afterTick → 触发器。 */
  update(): void {
    if (this.status === GameStatus.NotStarted) return;
    this.botManager.update(this);
    if (
      this.status !== GameStatus.Ended &&
      (void 0 === this.lastGameEndCheck || this.currentTime - this.lastGameEndCheck >= 1000)
    ) {
      this.checkGameEndConditions();
      this.lastGameEndCheck = this.currentTime;
    }
    for (const obj of [...this.updatableObjects]) if (obj.isSpawned) obj.update(this);
    // 欢呼冷却递减
    this.playerList
      .getCombatants()
      .forEach((p) => (p.cheerCooldownTicks = Math.max(0, p.cheerCooldownTicks - 1)));
    this.traits.filter(NotifyTickModule.NotifyTick).forEach((t) => {
      t[NotifyTickModule.NotifyTick.onTick](this);
    });
    if (this.localPlayer && !this.localPlayer.isObserver && !this.localPlayer.defeated) {
      const selected = this.unitSelection.getSelectedUnits();
      if (1 === selected.length) {
        const unit = selected[0];
        if (unit.isTechno() && unit.owner !== this.localPlayer) {
          const shroud = this.mapShroudTrait.getPlayerShroud(this.localPlayer);
          // 战役玩家 shroud 缺失时防御（国家不可玩导致 isNeutral 未建 shroud 的场景）
          if (!shroud)
            console.warn(
              `[OpenYRWeb] Missing shroud for local player "${this.localPlayer.name}" ` +
                `(isCombatant=${this.localPlayer.isCombatant()}, isNeutral=${this.localPlayer.isNeutral}, ` +
                `country=${this.localPlayer.country?.name ?? "none"})`,
            );
          const anyVisible =
            this.map.tileOccupation
              .calculateTilesForGameObject(unit.tile, unit)
              .find((t) => !shroud || !shroud.isShrouded(t, unit.tileElevation)) || false;
          if (!anyVisible) {
            this.unitSelection.deselectAll();
            this.unitSelection.cleanupUnit(unit);
          }
        }
      }
    }
    for (const cb of this.afterTickCallbacks) cb();
    this.afterTickCallbacks.length = 0;
    this.triggers.update(this);
    this.countdownTimer.update(this);
    this.currentTick++;
    this.currentTime += 1000 / GameSpeed.BASE_TICKS_PER_SECOND;
  }

  /** 注册 tick 后回调（本 tick 结束时执行一次）。 */
  afterTick(cb: any): void {
    this.afterTickCallbacks.push(cb);
  }

  /** 胜负检查：更新被击败者；本地失败或无敌方/多玩家空局则 end。 */
  checkGameEndConditions(): void {
    this.updateDefeatedPlayers(this.playerList.getCombatants());
    if (
      (this.localPlayer?.defeated && !this.localPlayer.isObserver) ||
      (!this.alliances.getHostilePlayers().length &&
        this.gameOpts.humanPlayers.length + this.gameOpts.aiPlayers.filter((s) => !!s).length > 1)
    )
      this.end();
  }

  /** 标记 Ended 并派发 onEnd。 */
  end(): void {
    if (this.status !== GameStatus.Ended) {
      this.status = GameStatus.Ended;
      this._onEnd.dispatch(this, void 0);
    }
  }

  /**
   * 判定战斗方失败：stalemate 倒计时归零则全败；否则 shortGame 下
   * 无有意义建筑且无基地单位（或长局无有意义对象且不在运输中）即败。
   * 战役中非本地玩家无意义目标时不播报；有人类敌对时开全图+雷达恢复。
   */
  updateDefeatedPlayers(combatants: any): void {
    let stalemateDefeat = this.stalemateDetectTrait?.isStale() && 0 === this.stalemateDetectTrait.getCountdownTicks();
    let shortGame = this.gameOpts.shortGame;
    combatants.forEach((p) => {
      let defeated: any;
      let hasSignificant = false;
      if (stalemateDefeat) defeated = true;
      else {
        hasSignificant = shortGame
          ? [...p.getOwnedObjectsByType(ObjectType.Building, true)].some((o) => !o.rules.insignificant) ||
            p.getOwnedObjects(true).some((o) => this.rules.general.baseUnit.includes(o.name))
          : p.getOwnedObjects(true).some((o) => !o.rules.insignificant && !o.limboData?.inTransport);
        defeated = !hasSignificant;
      }
      // 原版战役：非本地玩家只剩无意义建筑/单位时不播报“被击败”，也不判负刷屏
      if (defeated && !(this.gameOpts.campaignId && p !== this.localPlayer && !hasSignificant)) {
        console.warn(
          `[OpenYRWeb] Defeat check: "${p.name}" owned=${p.getOwnedObjects(true).length} ` +
            `sig=${p.getOwnedObjects(true).filter((o) => !o.rules.insignificant).length} ` +
            `buildings=${p.getOwnedObjectsByType(ObjectType.Building, true).length}`,
        );
        p.defeated = true;
        const hasHumanEnemy = this.alliances.getHostilePlayers().some((pair) => !pair.first.isAi || !pair.second.isAi);
        if (hasHumanEnemy) p.isObserver = true;
        this.removeAllPlayerAssets(p);
        this.events.dispatch(new PlayerDefeatedEvent(p));
        if (hasHumanEnemy) {
          this.mapShroudTrait.getPlayerShroud(p)?.revealAll();
          const wasDisabled = p.radarTrait.isDisabled();
          p.radarTrait.setDisabled(false);
          if (wasDisabled) this.events.dispatch(new RadarOnOffEvent(p, true));
        }
      }
    });
  }

  /**
   * 清空玩家资产（两轮，与孪生一致）：
   *  第一轮 getOwnedObjects()：可归还工程师建筑移交平民；
   *    墙 (isBuilding&&wallTrait) 为真时短路不销毁，否则 destroyObject。
   *  第二轮 getOwnedObjects(true)（含 limbo）：limbo 或墙移交平民，其余销毁。
   */
  removeAllPlayerAssets(player: any): void {
    player.getOwnedObjects().forEach((obj) => {
      if (obj.isDestroyed) return;
      if (obj.isBuilding() && obj.rules.returnable && obj.rules.needsEngineer && !obj.garrisonTrait)
        this.changeObjectOwner(obj, this.getCivilianPlayer());
      // 孪生: (isBuilding && wallTrait) || destroyObject —— 墙为真时短路不销毁
      else if (!(obj.isBuilding() && obj.wallTrait)) this.destroyObject(obj, void 0, true);
    });
    player.getOwnedObjects(true).forEach((obj) => {
      if (obj.isDestroyed) return;
      if (obj.limboData?.inTransport || (obj.isBuilding() && obj.wallTrait))
        this.changeObjectOwner(obj, this.getCivilianPlayer());
      else this.destroyObject(obj, void 0, true);
    });
  }

  /** 是否允许资产再分配（强制结盟且禁止中途改盟）。 */
  isAssetRedistributionEnabled(): boolean {
    return this.rules.mpDialogSettings.mustAlly && !this.rules.mpDialogSettings.allyChangeAllowed;
  }

  /** 资产再分配：把退出玩家对象/资金分给非 AI 存活盟友；成功返回 true。 */
  redistributeAllPlayerAssets(player: any): boolean {
    if (player.isObserver) return false;
    if (!this.isAssetRedistributionEnabled()) return false;
    let allies = this.alliances.getAllies(player).filter((a) => !a.isAi && !a.defeated);
    if (allies.length > 0) {
      var receiver: any;
      const sorted = [...allies].sort((a, b) => b.score - a.score);
      receiver = sorted[0];
      for (const obj of player.getOwnedObjects(true)) this.changeObjectOwner(obj, receiver);
      var each: any;
      var remainder: any;
      each = Math.floor(player.credits / allies.length);
      remainder = player.credits % allies.length;
      for (const a of allies) a.credits += each;
      allies[0].credits += remainder;
      return true;
    }
    return false;
  }

  /** 对局 PRNG 区间整数。 */
  generateRandomInt(min: number, max: number): number {
    return this.prng.generateRandomInt(min, max);
  }

  /** 对局 PRNG [0,1)。 */
  generateRandom(): number {
    return this.prng.generateRandom();
  }

  /** 锁步 FNV 散列：PRNG 末次随机 + 对象 id 分配 + 对象/玩家/结盟/trait。 */
  getHash(): number {
    return MathUtil.fnv32a([
      ...new Uint8Array(new Float64Array([this.prng.getLastRandom() ?? 0]).buffer),
      this.nextObjectId.value,
      ...this.world.getAllObjects().map((o) => o.getHash()),
      ...this.playerList.getAll().map((p) => p.getHash()),
      this.alliances.getHash(),
      ...this.traits.getAll().map((t) => t.getHash?.() ?? 0),
    ]);
  }

  /** 调试状态快照（tick/PRNG/对象/玩家/结盟/trait）。 */
  debugGetState(): any {
    return {
      currentTick: this.currentTick,
      lastRandom: this.prng.getLastRandom(),
      nextObjectId: this.nextObjectId.value,
      objects: this.world.getAllObjects().map((o) => o.debugGetState()),
      players: this.playerList.getAll().map((p) => p.debugGetState()),
      alliances: this.alliances.debugGetState(),
      traits: this.traits.getAll().reduce((acc, t) => {
        const state = t.debugGetState?.();
        if (void 0 !== state) acc[t.constructor.name] = state;
        return acc;
      }, {}),
    };
  }

  /** 释放对象/玩家/工人/Bot/触发器/地图/trait。 */
  dispose(): void {
    this.world.getAllObjects().forEach((o) => o.dispose());
    this.playerList.getAll().forEach((p) => p.dispose());
    this.constructionWorkers.forEach((w) => w.dispose());
    this.botManager.dispose();
    this.triggers.dispose();
    this.map.dispose();
    this.traits.dispose();
  }
}
