/**
 * GameFactory — 静态工厂：从 Rules/Art/GameOpts 等拼装一局完整 Game。
 *
 * 流程概览：
 *  1. 合并 INI 覆盖（map overrides + rulesOverrides + mapFile 自身）→ Rules/Art；
 *  2. 按 campaignId 决定 Ai 数据来源（地图 AI 或 aimd.ini）；
 *  3. 建 GameMap / World / PlayerList / Alliances / UnitSelection / ObjectFactory /
 *     BotManager，并 new Game 挂 traits；
 *  4. 战役分支：按地图 [Houses] 创建人类/电脑/平民阵营、别名 housePlayers、
 *     Allies 结盟；遭遇战分支：解析随机国家/颜色/出生点后 createCombatant；
 *  5. 挂 ExtensionHost（Ares/Phobos 等），返回 Game。
 *
 * 由 game/GameFactory.ts.js 重写为 TS（行为完全一致）。两个文件并存期间，
 * 本文件才是修改目标：tools/repack.mjs 打包时优先采用 .ts 模块的编译产物。
 */
import { Rules } from "game/rules/Rules"; // 已转换
import { Art } from "game/art/Art"; // 孪生
import { IniFile } from "data/IniFile"; // 已转换
import { Country } from "game/Country"; // 已转换
import * as ObjectFactoryModule from "game/gameobject/ObjectFactory"; // 孪生
import { World } from "game/World"; // 本组已写
import { GameMap } from "game/GameMap"; // 本组已写
import * as GameOptsModule from "game/gameopts/GameOpts"; // 孪生
import * as GameConstantsModule from "game/gameopts/constants"; // 孪生
import * as TypeGuardModule from "util/typeGuard"; // 已转换
import { Alliances, AllianceStatus } from "game/Alliances"; // 已转换
import { PlayerList } from "game/PlayerList"; // 已转换
import * as UnitSelectionModule from "game/gameobject/selection/UnitSelection"; // 孪生
import { BoxedVar } from "util/BoxedVar"; // 已转换
import { PlayerFactory } from "game/player/PlayerFactory"; // 孪生
import { PowerTrait } from "game/trait/PowerTrait"; // 已转换
import { SellTrait } from "game/trait/SellTrait"; // 已转换
import { RadarTrait } from "game/trait/RadarTrait"; // 已转换
import { ProductionTrait } from "game/trait/ProductionTrait"; // 已转换
import { MapShroudTrait } from "game/trait/MapShroudTrait"; // 已转换
import { Game } from "game/Game"; // 本组已写
import { MapRadiationTrait } from "game/trait/MapRadiationTrait"; // 已转换
import { ActionFactory } from "game/action/ActionFactory"; // 已转换
import { ActionFactoryReg } from "game/action/ActionFactoryReg"; // 已转换
import { SuperWeaponsTrait } from "game/trait/SuperWeaponsTrait"; // 已转换
import { SharedDetectDisguiseTrait } from "game/trait/SharedDetectDisguiseTrait"; // 已转换
import { SharedDetectCloakTrait } from "game/trait/SharedDetectCloakTrait"; // 已转换
import { CrateGeneratorTrait } from "game/trait/CrateGeneratorTrait"; // 已转换
import { StalemateDetectTrait } from "game/trait/StalemateDetectTrait"; // 已转换
import { GameOptSanitizer } from "game/gameopts/GameOptSanitizer"; // 孪生
import { GameOptRandomGen } from "game/gameopts/GameOptRandomGen"; // 孪生
import { MapLightingTrait } from "game/trait/MapLightingTrait"; // 已转换
import { Prng } from "game/Prng"; // 已转换
import { Ai } from "game/ai/Ai"; // 孪生
import * as BotFactoryModule from "game/bot/BotFactory"; // 孪生
import { BotManager } from "game/BotManager"; // 本组已写
import { VirusCloudTrait } from "game/trait/VirusCloudTrait"; // 已转换
import { SideType } from "game/SideType"; // 已转换
import * as ExtensionHostModule from "extensions/ExtensionHost"; // 已转换

// 孪生 any-shim：未转换模块的具名导出不可用，取命名空间成员
const ObjectFactory: any = (ObjectFactoryModule as any).ObjectFactory;
const UnitSelection: any = (UnitSelectionModule as any).UnitSelection;
const BotFactory: any = (BotFactoryModule as any).BotFactory;
const ExtensionHost: any = (ExtensionHostModule as any).ExtensionHost ?? ExtensionHostModule;

const {
  isHumanPlayerInfo,
  AiDifficulty,
} = GameOptsModule as any;
const {
  OBS_COUNTRY_ID,
  RANDOM_COUNTRY_ID,
  RANDOM_COLOR_ID,
  RANDOM_START_POS,
} = GameConstantsModule as any;
const { isNotNullOrUndefined } = TypeGuardModule as any;

/* eslint-disable @typescript-eslint/no-explicit-any */
export class GameFactory {
  /**
   * 拼装一局游戏。
   *
   * 形参顺序与孪生 create(e,t,i,r,s,a,n,o,l,c,h,u,d,g,p,m,f) / GameLoader.createGame 一致：
   * 1 mapFile, 2 tileSets, 3 rulesIni, 4 artIni, 5 aiIni,
   * 6 mapOverrides, 7 rulesOverrides, 8 seed, 9 startTimestamp,
   * 10 gameOpts, 11 gameModes, 12 singlePlayer, 13 botsLib,
   * 14 logger, 15 productionRules, 16 botDebugIndex, 17 actionLogger
   *
   * tileSets 传入 GameMap/TileCollection/Bridges/AutoLat（孪生 create 第 2 参）；
   * gameModeId 取自 gameOpts.gameMode；human 玩家名取自 gameOpts.humanPlayers。
   */
  static create(
    mapFile: any,
    tileSets: any,
    rulesIni: any,
    artIni: any,
    aiIni: any,
    mapOverrides: any,
    rulesOverrides: any,
    seed: any,
    startTimestamp: any,
    gameOpts: any,
    gameModes: any,
    singlePlayer: any,
    botsLib: any,
    logger: any,
    productionRules: any,
    botDebugIndex: any,
    actionLogger: any,
  ): any {
    return GameFactory.createInner(
      mapFile,
      tileSets,
      rulesIni,
      artIni,
      aiIni,
      gameOpts,
      seed,
      startTimestamp,
      gameModes,
      logger,
      singlePlayer,
      botsLib,
      botDebugIndex,
      actionLogger,
      productionRules,
      mapOverrides,
      rulesOverrides,
      gameOpts && gameOpts.campaignId,
    );
  }

  /** 内部实现：参数与孪生 create 对齐（含 tileSets，供 GameMap 使用）。 */
  private static createInner(
    mapFile: any,
    tileSets: any,
    baseRulesIni: any,
    baseArtIni: any,
    defaultAiIni: any,
    gameOpts: any,
    seed: any,
    startTimestamp: any,
    gameModes: any,
    logger: any,
    singlePlayer: any,
    botsLib: any,
    botDebugIndex: any,
    actionLogger: any,
    productionRules: any,
    mapOverrides: any,
    rulesOverrides: any,
    campaignId: any,
  ): any {
    const gameModeId = gameOpts && gameOpts.gameMode;
    const humanPlayers = (gameOpts && gameOpts.humanPlayers) || [];
    // 合并 rules：base + mapOverrides + rulesOverrides[] + mapFile 自身
    let mergedRulesIni = baseRulesIni.clone().mergeWith(mapOverrides);
    for (const ov of rulesOverrides) mergedRulesIni.mergeWith(ov);
    mergedRulesIni.mergeWith(mapFile);
    // Art：base art + map artOverrides（缺失则空 IniFile）
    var artOverrides = baseArtIni.clone().mergeWith(mapFile.artOverrides ?? new IniFile());
    let rules = new Rules(mergedRulesIni, logger);
    var art = new Art(rules, artOverrides, mapFile, logger);
    // 战役模式: 敌方 AI 使用地图定义的 AI 数据（TeamTypes 等），缺失时回退 aimd.ini
    var campaignAiIni = campaignId ? mapFile.getAiIni() : void 0;
    var ai = new Ai(campaignAiIni || defaultAiIni);
    rules.applySpecialFlags(mapFile.specialFlags);
    GameOptSanitizer.sanitize(gameOpts, rules);
    let rawRules = new Rules(baseRulesIni);
    let multiplayerCountries = rawRules.getMultiplayerCountries();
    let multiplayerColors = [...rawRules.getMultiplayerColors().values()];
    let prng = Prng.factory(seed, startTimestamp);
    let gameMap = new GameMap(mapFile, tileSets, rules, prng.generateRandomInt.bind(prng));
    var world = new World();
    var gameModeType = gameModes.getById(gameModeId).type;
    var playerList = new PlayerList();
    var alliances = new Alliances(playerList);
    var unitSelection = new UnitSelection();
    var nextObjectId = new BoxedVar(1);
    var objectFactory = new ObjectFactory(gameMap.tiles, gameMap.tileOccupation, gameMap.bridges, nextObjectId);
    var actionFactory = new ActionFactory();
    var botFactory = new BotFactory(botsLib);
    var botManager = BotManager.factory(actionFactory, botFactory, botDebugIndex, actionLogger);
    let game = new Game(
      world,
      gameMap,
      rules,
      art,
      ai,
      seed,
      startTimestamp,
      gameOpts,
      gameModeType,
      playerList,
      unitSelection,
      alliances,
      nextObjectId,
      objectFactory,
      botManager,
    );
    new ActionFactoryReg().register(actionFactory, game, void 0);
    game.traits.add(new PowerTrait());
    game.sellTrait = new SellTrait(game, rules.general);
    game.traits.add(game.sellTrait);
    game.traits.add(new RadarTrait());
    let productionTrait = new ProductionTrait(rules, productionRules);
    game.traits.add(productionTrait);
    game.mapShroudTrait = new MapShroudTrait(gameMap, alliances);
    game.traits.add(game.mapShroudTrait);
    game.mapRadiationTrait = new MapRadiationTrait(gameMap);
    game.traits.add(game.mapRadiationTrait);
    // Virus sniper toxic cloud. Ticks [VirusGas] damage over a 3x3
    // area per gas particle; Infantry deaths with InfDeath=8 feed new clouds
    // back in (see Warhead.inflictDamage) for the vanilla chain reaction.
    game.virusCloudTrait = new VirusCloudTrait(gameMap);
    game.traits.add(game.virusCloudTrait);
    game.mapLightingTrait = new MapLightingTrait(rules.audioVisual, gameMap.getLighting());
    game.traits.add(game.mapLightingTrait);
    game.traits.add(new SuperWeaponsTrait());
    game.traits.add(new SharedDetectDisguiseTrait());
    game.traits.add(new SharedDetectCloakTrait());
    game.crateGeneratorTrait = new CrateGeneratorTrait(gameOpts.cratesAppear);
    game.traits.add(game.crateGeneratorTrait);
    if (!singlePlayer) {
      game.stalemateDetectTrait = new StalemateDetectTrait();
      game.traits.add(game.stalemateDetectTrait);
    }
    let playerFactory = new PlayerFactory(rules, gameOpts, productionTrait.getAvailableObjects());
    let randomGen = GameOptRandomGen.factory(seed, startTimestamp);
    let colorMap = randomGen.generateColors(gameOpts);
    let countryMap = randomGen.generateCountries(gameOpts, rawRules);
    let startPosMap = randomGen.generateStartLocations(gameOpts, gameMap.startingLocations);
    let slots = [...gameOpts.humanPlayers, ...gameOpts.aiPlayers].filter(isNotNullOrUndefined);
    // 战役模式（campaignId）按地图 [Houses] 创建玩家。遭遇战不受影响。
    let campaignHouses = campaignId ? mapFile.getHouses() : void 0;
    console.info(
      `[OpenYRWeb] Campaign check: campaignId=${campaignId}, singlePlayer=${singlePlayer}, ` +
        `houses=${campaignHouses ? campaignHouses.length : "n/a"}`,
    );
    if (campaignHouses && campaignHouses.length) {
      // 参考临时源码（werhd.min.js）：国家/颜色取每个阵营独立 section（[Player House] 的
      // Country=/Color=/Allies= 等）；地图未定义国家时按战役阵营侧兜底（盟军/训练=玩家盟军、
      // 敌方苏军；苏军=玩家苏军、敌方盟军）。
      let campaignSide = (campaignId || "").split("-")[0].toLowerCase();
      let humanIsSoviet = campaignSide === "soviet";
      let pickCountry = (side: any) => {
        for (const cr of rules.countryRules.values()) if (cr.side === side) return cr.name;
        return "";
      };
      let pickPreferred = (pref: any, side: any) => (rules.countryRules.has(pref) ? pref : pickCountry(side));
      let humanFallback = humanIsSoviet ? "Russians" : "Americans";
      let enemyFallback = humanIsSoviet ? "Americans" : "Russians";
      let humanSlot = 0;
      let houseIndex = 0;
      // 电脑阵营 startPos = 出生点索引（人类=0，电脑顺次 1..N，供 bot/触发器引用）
      let startLocCount = gameMap.startingLocations ? gameMap.startingLocations.length : 0;
      let aiStartSlot = 0;
      for (const h of campaignHouses) {
        let cname = h.country;
        if (!rules.countryRules.has(cname)) {
          // 战役图常见写法：Country= 为空或写阵营别名（Player/BadGuy1），
          // 此时按战役侧自动选国家属于预期行为，用 info 而非 warn 避免刷屏。
          let houseBase = h.name.replace(/\s+House$/i, "").trim().toLowerCase();
          let aliasCountry =
            !cname || cname.toLowerCase() === h.name.toLowerCase() || cname.toLowerCase() === houseBase;
          let fallback =
            "human" === h.control
              ? pickPreferred(humanFallback, humanIsSoviet ? SideType.Nod : SideType.GDI)
              : "civilian" === h.control
                ? pickCountry(SideType.Civilian)
                : pickPreferred(enemyFallback, humanIsSoviet ? SideType.GDI : SideType.Nod);
          if (fallback) {
            if (aliasCountry)
              console.info(
                `Campaign house "${h.name}" country "${h.country || "(none)"}" — using side default "${fallback}".`,
              );
            else
              console.warn(
                `Campaign house "${h.name}" country "${h.country}" not found — falling back to "${fallback}".`,
              );
            cname = fallback;
          } else {
            console.warn(`Campaign house "${h.name}" has unknown country "${h.country}". Skipping.`);
            continue;
          }
        }
        let country = Country.factory(cname, rules);
        // 颜色：地图 per-house Color=（默认 LightGrey），缺失用第一个可用颜色
        let color = (h.color && rules.colors.get(h.color)) || multiplayerColors[0];
        if ("human" === h.control) {
          // 人类玩家必须是可玩国家：不可玩(如 GDI/Nod)会令 isNeutral=true → 非 combatant
          // → 无 shroud、无胜负判定等异常。
          if (!country.isPlayable()) {
            let fix = pickPreferred(humanFallback, humanIsSoviet ? SideType.Nod : SideType.GDI);
            if (fix && fix !== cname) {
              console.info(`Campaign house "${h.name}" country "${cname}" is not playable — using "${fix}".`);
              country = Country.factory(fix, rules);
            }
          }
          let info = humanPlayers[humanSlot++];
          let pname = info && isHumanPlayerInfo(info) ? info.name : h.name;
          let hp = playerFactory.createCombatant(pname, country, 0, color, false, void 0);
          // 标记战役人类阵营：BotManager 为其创建脚本小队引擎（ScenarioTeamBot），
          // 使 CreateTeam 等触发动作对玩家阵营同样可用（原版 YR 的 Player House 也有 AI 脚本）。
          hp.isCampaign = true;
          hp.displayName = pname;
          hp.scenarioHouseName = h.name;
          hp.scenarioHouseId = 13 + houseIndex;
          hp.scenarioPlayerControl = true;
          hp.scenarioIq = h.iq || 0;
          hp.scenarioAliases = [h.name, h.country, cname].filter(Boolean);
          hp.scenarioCredits = (h.credits || 0) * 100;
          game.addPlayer(hp);
          game.housePlayers.set(h.name, game.getPlayerByName(pname));
          // 地图对象/触发器的 Owner= 常用短名（Player/BadGuy1），把别名也注册进 housePlayers
          for (const al of [h.name.replace(/\s+House$/i, "").trim(), h.country, cname]) {
            if (al && !game.housePlayers.has(al)) game.housePlayers.set(al, game.getPlayerByName(pname));
          }
        } else if ("computer" === h.control) {
          // 电脑阵营同样必须是可玩国家：不可玩(如 GDI/Nod/中立)会令
          // isNeutral=true → 非 combatant → BotManager 不创建 bot →
          // 无 AiEngine → CreateTeam 触发全部失败（无畏级不攻击等）。
          if (!country.isPlayable()) {
            let fix = pickPreferred(enemyFallback, humanIsSoviet ? SideType.GDI : SideType.Nod);
            if (fix && fix !== cname) {
              console.info(`Campaign house "${h.name}" country "${cname}" is not playable — using "${fix}".`);
              country = Country.factory(fix, rules);
            }
          }
          let diff =
            "hard" === gameOpts.campaignDifficulty
              ? AiDifficulty.Brutal
              : "medium" === gameOpts.campaignDifficulty
                ? AiDifficulty.Medium
                : AiDifficulty.Easy;
          // startPos: 电脑阵营按出生点索引顺次分配（临时源码为 void 0，但本工程
          // bot/AiEngine 会读取 startLocation，必须给有效索引）
          let pos = startLocCount > 1 ? Math.min(1 + aiStartSlot++, startLocCount - 1) : 0;
          let cp = playerFactory.createCombatant(h.name, country, pos, color, true, diff);
          cp.isCampaign = true;
          cp.displayName = h.name;
          cp.scenarioHouseName = h.name;
          cp.scenarioHouseId = 13 + houseIndex;
          cp.scenarioPlayerControl = false;
          cp.scenarioIq = h.iq || 0;
          cp.scenarioAliases = [h.name, h.country, cname].filter(Boolean);
          cp.scenarioCredits = (h.credits || 0) * 100;
          game.addPlayer(cp);
          game.housePlayers.set(h.name, game.getPlayerByName(h.name));
          for (const al of [h.name.replace(/\s+House$/i, "").trim(), h.country, cname]) {
            if (al && !game.housePlayers.has(al)) game.housePlayers.set(al, game.getPlayerByName(h.name));
          }
        }
        houseIndex++;
      }
      game.addPlayer(playerFactory.createNeutral(rules, "@@NEUTRAL@@"));
      for (const h of campaignHouses)
        if ("civilian" === h.control) {
          game.housePlayers.set(h.name, game.getCivilianPlayer());
          let al = h.name.replace(/\s+House$/i, "").trim();
          if (al && !game.housePlayers.has(al)) game.housePlayers.set(al, game.getCivilianPlayer());
        }
      // 结盟：参考临时源码，每个阵营 Allies= 列出的其他阵营建立 Formed 联盟
      for (const h of campaignHouses) {
        let p = game.housePlayers.get(h.name);
        if (!p || !p.isCombatant || !p.isCombatant()) continue;
        for (const an of h.allies) {
          let ap = game.housePlayers.get(an);
          if (ap && ap !== p && (!ap.isCombatant || ap.isCombatant()) && !alliances.areAllied(p, ap)) {
            try {
              alliances.setAlliance(p, ap, AllianceStatus.Formed);
            } catch (_) {}
          }
        }
      }
      game.campaignHouses = campaignHouses;
    } else {
      slots.forEach((slot: any) => {
        let name: any;
        let isAi: any;
        let difficulty: any;
        if (isHumanPlayerInfo(slot)) {
          name = slot.name;
          isAi = false;
        } else {
          name = game.getAiPlayerName(slot);
          isAi = true;
          difficulty = slot.difficulty;
        }
        if (slot.countryId !== OBS_COUNTRY_ID) {
          var countryId = countryMap.get(slot) ?? slot.countryId;
          var colorId = colorMap.get(slot) ?? slot.colorId;
          var startPos = startPosMap.get(slot) ?? slot.startPos;
          if (countryId === RANDOM_COUNTRY_ID) throw new Error("Random country should have been resolved by now");
          if (colorId === RANDOM_COLOR_ID) throw new Error("Random color should have been resolved by now");
          if (startPos === RANDOM_START_POS)
            throw new Error("Random start location should have been resolved by now");
          var countryName = multiplayerCountries[countryId].name;
          var country = Country.factory(countryName, rules);
          var color = multiplayerColors[colorId];
          game.addPlayer(playerFactory.createCombatant(name, country, startPos, color, isAi, difficulty));
        } else game.addPlayer(playerFactory.createObserver(name, rules));
      });
      game.addPlayer(playerFactory.createNeutral(rules, "@@NEUTRAL@@"));
    }
    // attach source extensions (Ares/Phobos) to the live game.
    // Dispatches onMatchStart and wires runtime hooks (onTick/onObjectSpawn/…).
    try {
      ExtensionHost.attachToGame(game);
    } catch (err) {
      console.warn("[ExtensionHost] attachToGame failed", err);
    }
    return game;
  }
}
