// === Reconstructed SystemJS module: game/GameFactory ===
// deps: ["game/rules/Rules","game/art/Art","data/IniFile","game/Country","game/gameobject/ObjectFactory","game/World","game/GameMap","game/gameopts/GameOpts","game/gameopts/constants","util/typeGuard","game/Alliances","game/PlayerList","game/gameobject/selection/UnitSelection","util/BoxedVar","game/player/PlayerFactory","game/trait/PowerTrait","game/trait/SellTrait","game/trait/RadarTrait","game/trait/ProductionTrait","game/trait/MapShroudTrait","game/Game","game/trait/MapRadiationTrait","game/action/ActionFactory","game/action/ActionFactoryReg","game/trait/SuperWeaponsTrait","game/trait/SharedDetectDisguiseTrait","game/trait/SharedDetectCloakTrait","game/trait/CrateGeneratorTrait","game/trait/StalemateDetectTrait","game/gameopts/GameOptSanitizer","game/gameopts/GameOptRandomGen","game/trait/MapLightingTrait","game/Prng","game/ai/Ai","game/bot/BotFactory","game/BotManager"]
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
      i;
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
                w = new Ee.Ai(s);
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
              return (
                V.forEach((e) => {
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
                L.addPlayer(F.createNeutral(b, "@@NEUTRAL@@")),
                L
              );
            }
          }),
        );
      },
    };
  },
);
