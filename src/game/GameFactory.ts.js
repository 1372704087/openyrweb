// === Reconstructed SystemJS module: game/GameFactory ===
// deps: ["game/rules/Rules","game/art/Art","data/IniFile","game/Country","game/gameobject/ObjectFactory","game/World","game/GameMap","game/gameopts/GameOpts","game/gameopts/constants","util/typeGuard","game/Alliances","game/PlayerList","game/gameobject/selection/UnitSelection","util/BoxedVar","game/player/PlayerFactory","game/trait/PowerTrait","game/trait/SellTrait","game/trait/RadarTrait","game/trait/ProductionTrait","game/trait/MapShroudTrait","game/Game","game/trait/MapRadiationTrait","game/action/ActionFactory","game/action/ActionFactoryReg","game/trait/SuperWeaponsTrait","game/trait/SharedDetectDisguiseTrait","game/trait/SharedDetectCloakTrait","game/trait/CrateGeneratorTrait","game/trait/StalemateDetectTrait","game/gameopts/GameOptSanitizer","game/gameopts/GameOptRandomGen","game/trait/MapLightingTrait","game/Prng","game/ai/Ai","game/bot/BotFactory","game/BotManager","game/trait/VirusCloudTrait","game/SideType","extensions/ExtensionHost"]
// Note: variable/type names are minified approximations of the original TypeScript.

System.register(
  "game/GameFactory",
  [
    "game/rules/Rules",
    "game/art/Art",
    "data/IniFile",
    "game/Country",
    "game/gameobject/ObjectFactory",
    "game/World",
    "game/GameMap",
    "game/gameopts/GameOpts",
    "game/gameopts/constants",
    "util/typeGuard",
    "game/Alliances",
    "game/PlayerList",
    "game/gameobject/selection/UnitSelection",
    "util/BoxedVar",
    "game/player/PlayerFactory",
    "game/trait/PowerTrait",
    "game/trait/SellTrait",
    "game/trait/RadarTrait",
    "game/trait/ProductionTrait",
    "game/trait/MapShroudTrait",
    "game/Game",
    "game/trait/MapRadiationTrait",
    "game/action/ActionFactory",
    "game/action/ActionFactoryReg",
    "game/trait/SuperWeaponsTrait",
    "game/trait/SharedDetectDisguiseTrait",
    "game/trait/SharedDetectCloakTrait",
    "game/trait/CrateGeneratorTrait",
    "game/trait/StalemateDetectTrait",
    "game/gameopts/GameOptSanitizer",
    "game/gameopts/GameOptRandomGen",
    "game/trait/MapLightingTrait",
    "game/Prng",
    "game/ai/Ai",
    "game/bot/BotFactory",
    "game/BotManager",
    "game/trait/VirusCloudTrait",
    "game/SideType",
    "extensions/ExtensionHost",
  ],
  function (e, t) {
    "use strict";
    var W,
      z,
      K,
      q,
      $,
      Q,
      Y,
      Z,
      X,
      J,
      ee,
      te,
      ie,
      re,
      se,
      ae,
      ne,
      oe,
      le,
      ce,
      he,
      ue,
      de,
      ge,
      pe,
      me,
      fe,
      ye,
      Te,
      ve,
      be,
      Se,
      we,
      Ee,
      Ce,
      xe,
      Ve,
      i,
      yi,
      xt;
    t && t.id;
    return {
      setters: [
        function (e) {
          W = e;
        },
        function (e) {
          z = e;
        },
        function (e) {
          K = e;
        },
        function (e) {
          q = e;
        },
        function (e) {
          $ = e;
        },
        function (e) {
          Q = e;
        },
        function (e) {
          Y = e;
        },
        function (e) {
          Z = e;
        },
        function (e) {
          X = e;
        },
        function (e) {
          J = e;
        },
        function (e) {
          ee = e;
        },
        function (e) {
          te = e;
        },
        function (e) {
          ie = e;
        },
        function (e) {
          re = e;
        },
        function (e) {
          se = e;
        },
        function (e) {
          ae = e;
        },
        function (e) {
          ne = e;
        },
        function (e) {
          oe = e;
        },
        function (e) {
          le = e;
        },
        function (e) {
          ce = e;
        },
        function (e) {
          he = e;
        },
        function (e) {
          ue = e;
        },
        function (e) {
          de = e;
        },
        function (e) {
          ge = e;
        },
        function (e) {
          pe = e;
        },
        function (e) {
          me = e;
        },
        function (e) {
          fe = e;
        },
        function (e) {
          ye = e;
        },
        function (e) {
          Te = e;
        },
        function (e) {
          ve = e;
        },
        function (e) {
          be = e;
        },
        function (e) {
          Se = e;
        },
        function (e) {
          we = e;
        },
        function (e) {
          Ee = e;
        },
        function (e) {
          Ce = e;
        },
        function (e) {
          xe = e;
        },
        function (e) {
          Ve = e;
        },
        function (e) {
          yi = e;
        },
        function (e) {
          xt = e;
        },
      ],
      execute: function () {
        e(
          "GameFactory",
          (i = class {
            static create(e, t, i, r, s, a, n, o, l, c, h, u, d, g, p, m, f) {
              let y = i.clone().mergeWith(a);
              for (var T of n) y.mergeWith(T);
              y.mergeWith(e);
              var v = r.clone().mergeWith(e.artOverrides ?? new K.IniFile());
              let b = new W.Rules(y, g);
              var S = new z.Art(b, v, e, g),
                // 战役模式: 敌方 AI 使用地图定义的 AI 数据（TeamTypes 等），缺失时回退 aimd.ini
                aiIni = c.campaignId ? e.getAiIni() : void 0,
                w = new Ee.Ai(aiIni || s);
              (b.applySpecialFlags(e.specialFlags), ve.GameOptSanitizer.sanitize(c, b));
              let E = new W.Rules(i),
                C = E.getMultiplayerCountries(),
                x = [...E.getMultiplayerColors().values()],
                O = we.Prng.factory(o, l),
                A = new Y.GameMap(e, t, b, O.generateRandomInt.bind(O));
              var M = new Q.World(),
                R = h.getById(c.gameMode).type,
                P = new te.PlayerList(),
                I = new ee.Alliances(P),
                k = new ie.UnitSelection(),
                B = new re.BoxedVar(1),
                N = new $.ObjectFactory(A.tiles, A.tileOccupation, A.bridges, B),
                j = new de.ActionFactory(),
                v = new Ce.BotFactory(d),
                v = xe.BotManager.factory(j, v, m, f);
              let L = new he.Game(M, A, b, S, w, o, l, c, R, P, k, I, B, N, v);
              (new ge.ActionFactoryReg().register(j, L, void 0),
                L.traits.add(new ae.PowerTrait()),
                (L.sellTrait = new ne.SellTrait(L, b.general)),
                L.traits.add(L.sellTrait),
                L.traits.add(new oe.RadarTrait()));
              let D = new le.ProductionTrait(b, p);
              (L.traits.add(D),
                (L.mapShroudTrait = new ce.MapShroudTrait(A, I)),
                L.traits.add(L.mapShroudTrait),
                (L.mapRadiationTrait = new ue.MapRadiationTrait(A)),
                L.traits.add(L.mapRadiationTrait),
                // Virus sniper toxic cloud. Ticks [VirusGas] damage over a 3x3
                // area per gas particle; Infantry deaths with InfDeath=8 feed new clouds
                // back in (see Warhead.inflictDamage) for the vanilla chain reaction.
                (L.virusCloudTrait = new Ve.VirusCloudTrait(A)),
                L.traits.add(L.virusCloudTrait),
                (L.mapLightingTrait = new Se.MapLightingTrait(b.audioVisual, A.getLighting())),
                L.traits.add(L.mapLightingTrait),
                L.traits.add(new pe.SuperWeaponsTrait()),
                L.traits.add(new me.SharedDetectDisguiseTrait()),
                L.traits.add(new fe.SharedDetectCloakTrait()),
                (L.crateGeneratorTrait = new ye.CrateGeneratorTrait(c.cratesAppear)),
                L.traits.add(L.crateGeneratorTrait),
                u || ((L.stalemateDetectTrait = new Te.StalemateDetectTrait()), L.traits.add(L.stalemateDetectTrait)));
              let F = new se.PlayerFactory(b, c, D.getAvailableObjects()),
                _ = be.GameOptRandomGen.factory(o, l),
                U = _.generateColors(c),
                H = _.generateCountries(c, E),
                G = _.generateStartLocations(c, A.startingLocations),
                V = [...c.humanPlayers, ...c.aiPlayers].filter(J.isNotNullOrUndefined);
              // 战役模式（campaignId）按地图 [Houses] 创建玩家。遭遇战不受影响。
              let campaignHouses = c.campaignId ? e.getHouses() : void 0;
              console.info(
                `[OpenYRWeb] Campaign check: campaignId=${c.campaignId}, singlePlayer=${u}, ` +
                  `houses=${campaignHouses ? campaignHouses.length : "n/a"}`,
              );
              if (campaignHouses && campaignHouses.length) {
                // 参考临时源码（werhd.min.js）：国家/颜色取每个阵营独立 section（[Player House] 的
                // Country=/Color=/Allies= 等）；地图未定义国家时按战役阵营侧兜底（盟军/训练=玩家盟军、
                // 敌方苏军；苏军=玩家苏军、敌方盟军）。
                let campaignSide = (c.campaignId || "").split("-")[0].toLowerCase();
                let humanIsSoviet = campaignSide === "soviet";
                let pickCountry = (side) => {
                  for (let cr of b.countryRules.values()) if (cr.side === side) return cr.name;
                  return "";
                };
                let pickPreferred = (pref, side) => (b.countryRules.has(pref) ? pref : pickCountry(side));
                let humanFallback = humanIsSoviet ? "Russians" : "Americans";
                let enemyFallback = humanIsSoviet ? "Americans" : "Russians";
                let humanSlot = 0;
                let houseIndex = 0;
                // 电脑阵营 startPos = 出生点索引（人类=0，电脑顺次 1..N，供 bot/触发器引用）
                let startLocCount = A.startingLocations ? A.startingLocations.length : 0;
                let aiStartSlot = 0;
                for (let h of campaignHouses) {
                  let cname = h.country;
                  if (!b.countryRules.has(cname)) {
                    // 战役图常见写法：Country= 为空或写阵营别名（Player/BadGuy1），
                    // 此时按战役侧自动选国家属于预期行为，用 info 而非 warn 避免刷屏。
                    let houseBase = h.name.replace(/\s+House$/i, "").trim().toLowerCase();
                    let aliasCountry =
                      !cname ||
                      cname.toLowerCase() === h.name.toLowerCase() ||
                      cname.toLowerCase() === houseBase;
                    let fallback =
                      "human" === h.control
                        ? pickPreferred(humanFallback, humanIsSoviet ? yi.SideType.Nod : yi.SideType.GDI)
                        : "civilian" === h.control
                          ? pickCountry(yi.SideType.Civilian)
                          : pickPreferred(enemyFallback, humanIsSoviet ? yi.SideType.GDI : yi.SideType.Nod);
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
                  let country = q.Country.factory(cname, b);
                  // 颜色：地图 per-house Color=（默认 LightGrey），缺失用第一个可用颜色
                  let color = (h.color && b.colors.get(h.color)) || x[0];
                  if ("human" === h.control) {
                    // 人类玩家必须是可玩国家：不可玩(如 GDI/Nod)会令 isNeutral=true → 非 combatant
                    // → 无 shroud、无胜负判定等异常。
                    if (!country.isPlayable()) {
                      let fix = pickPreferred(humanFallback, humanIsSoviet ? yi.SideType.Nod : yi.SideType.GDI);
                      if (fix && fix !== cname) {
                        console.info(
                          `Campaign house "${h.name}" country "${cname}" is not playable — using "${fix}".`,
                        );
                        country = q.Country.factory(fix, b);
                      }
                    }
                    let info = c.humanPlayers[humanSlot++],
                      pname = info && Z.isHumanPlayerInfo(info) ? info.name : h.name;
                    let hp = F.createCombatant(pname, country, 0, color, !1, void 0);
                    // 标记战役人类阵营：BotManager 为其创建脚本小队引擎（ScenarioTeamBot），
                    // 使 CreateTeam 等触发动作对玩家阵营同样可用（原版 YR 的 Player House 也有 AI 脚本）。
                    (hp.isCampaign = !0),
                      (hp.displayName = pname),
                      (hp.scenarioHouseName = h.name),
                      (hp.scenarioHouseId = 13 + houseIndex),
                      (hp.scenarioPlayerControl = !0),
                      (hp.scenarioIq = h.iq || 0),
                      (hp.scenarioAliases = [h.name, h.country, cname].filter(Boolean)),
                      (hp.scenarioCredits = (h.credits || 0) * 100),
                      (L.addPlayer(hp), L.housePlayers.set(h.name, L.getPlayerByName(pname)));
                    // 地图对象/触发器的 Owner= 常用短名（Player/BadGuy1），把别名也注册进 housePlayers
                    for (let al of [h.name.replace(/\s+House$/i, "").trim(), h.country, cname]) {
                      if (al && !L.housePlayers.has(al)) L.housePlayers.set(al, L.getPlayerByName(pname));
                    }
                  } else if ("computer" === h.control) {
                    // 电脑阵营同样必须是可玩国家：不可玩(如 GDI/Nod/中立)会令
                    // isNeutral=true → 非 combatant → BotManager 不创建 bot →
                    // 无 AiEngine → CreateTeam 触发全部失败（无畏级不攻击等）。
                    if (!country.isPlayable()) {
                      let fix = pickPreferred(enemyFallback, humanIsSoviet ? yi.SideType.GDI : yi.SideType.Nod);
                      if (fix && fix !== cname) {
                        console.info(
                          `Campaign house "${h.name}" country "${cname}" is not playable — using "${fix}".`,
                        );
                        country = q.Country.factory(fix, b);
                      }
                    }
                    let diff =
                      "hard" === c.campaignDifficulty
                        ? Z.AiDifficulty.Brutal
                        : "medium" === c.campaignDifficulty
                          ? Z.AiDifficulty.Medium
                          : Z.AiDifficulty.Easy;
                    // startPos: 电脑阵营按出生点索引顺次分配（临时源码为 void 0，但本工程
                    // bot/AiEngine 会读取 startLocation，必须给有效索引）
                    let pos = startLocCount > 1 ? Math.min(1 + aiStartSlot++, startLocCount - 1) : 0;
                    let cp = F.createCombatant(h.name, country, pos, color, !0, diff);
                    (cp.isCampaign = !0),
                      (cp.displayName = h.name),
                      (cp.scenarioHouseName = h.name),
                      (cp.scenarioHouseId = 13 + houseIndex),
                      (cp.scenarioPlayerControl = !1),
                      (cp.scenarioIq = h.iq || 0),
                      (cp.scenarioAliases = [h.name, h.country, cname].filter(Boolean)),
                      (cp.scenarioCredits = (h.credits || 0) * 100),
                      (L.addPlayer(cp), L.housePlayers.set(h.name, L.getPlayerByName(h.name)));
                    for (let al of [h.name.replace(/\s+House$/i, "").trim(), h.country, cname]) {
                      if (al && !L.housePlayers.has(al)) L.housePlayers.set(al, L.getPlayerByName(h.name));
                    }
                  }
                  houseIndex++;
                }
                L.addPlayer(F.createNeutral(b, "@@NEUTRAL@@"));
                for (let h of campaignHouses)
                  if ("civilian" === h.control) {
                    L.housePlayers.set(h.name, L.getCivilianPlayer());
                    let al = h.name.replace(/\s+House$/i, "").trim();
                    if (al && !L.housePlayers.has(al)) L.housePlayers.set(al, L.getCivilianPlayer());
                  }
                // 结盟：参考临时源码，每个阵营 Allies= 列出的其他阵营建立 Formed 联盟
                for (let h of campaignHouses) {
                  let p = L.housePlayers.get(h.name);
                  if (!p || !p.isCombatant || !p.isCombatant()) continue;
                  for (let an of h.allies) {
                    let ap = L.housePlayers.get(an);
                    if (ap && ap !== p && (!ap.isCombatant || ap.isCombatant()) && !I.areAllied(p, ap)) {
                      try {
                        I.setAlliance(p, ap, ee.AllianceStatus.Formed);
                      } catch (_) {}
                    }
                  }
                }
                L.campaignHouses = campaignHouses;
              } else
                (V.forEach((e) => {
                  let t, i, r;
                  if (
                    (Z.isHumanPlayerInfo(e)
                      ? ((t = e.name), (i = !1))
                      : ((t = L.getAiPlayerName(e)), (i = !0), (r = e.difficulty)),
                    e.countryId !== X.OBS_COUNTRY_ID)
                  ) {
                    var s = H.get(e) ?? e.countryId,
                      a = U.get(e) ?? e.colorId,
                      n = G.get(e) ?? e.startPos;
                    if (s === X.RANDOM_COUNTRY_ID) throw new Error("Random country should have been resolved by now");
                    if (a === X.RANDOM_COLOR_ID) throw new Error("Random color should have been resolved by now");
                    if (n === X.RANDOM_START_POS)
                      throw new Error("Random start location should have been resolved by now");
                    ((s = C[s].name), (s = q.Country.factory(s, b)), (a = x[a]));
                    L.addPlayer(F.createCombatant(t, s, n, a, i, r));
                  } else L.addPlayer(F.createObserver(t, b));
                }),
                  L.addPlayer(F.createNeutral(b, "@@NEUTRAL@@")));
              // attach source extensions (Ares/Phobos) to the live game.
              // Dispatches onMatchStart and wires runtime hooks (onTick/onObjectSpawn/…).
              try {
                xt.ExtensionHost.attachToGame(L);
              } catch (err) {
                console.warn("[ExtensionHost] attachToGame failed", err);
              }
              return L;
            }
          }),
        );
      },
    };
  },
);
