// === Reconstructed SystemJS module: game/Game ===
// deps: ["game/ConstructionWorker","game/gameopts/GameOpts","engine/type/ObjectType","util/event","game/map/OreSpread","game/gameobject/Infantry","game/Alliances","util/BoxedVar","game/StartingUnitsGenerator","game/map/tileFinder/CardinalTileFinder","game/type/SpeedType","game/Target","game/map/BridgeOverlayTypes","util/math","game/GameEventBus","game/event/ObjectDestroyEvent","game/event/PlayerDefeatedEvent","game/ini/GameModeType","game/Traits","game/trait/interface/NotifyTick","game/trait/interface/NotifyDestroy","game/trait/interface/NotifySpawn","game/trait/interface/NotifyUnspawn","game/trait/interface/NotifyOwnerChange","game/event/ObjectOwnerChangeEvent","game/event/ObjectUnspawnEvent","game/trait/interface/NotifyTargetDestroy","game/gameobject/unit/VeteranLevel","game/event/ObjectSpawnEvent","game/map/OreOverlayTypes","game/Weapon","game/GameSpeed","game/gameobject/common/DeathType","game/map/Bridges","game/SuperWeapon","game/event/AllianceChangeEvent","game/trait/interface/NotifyAllianceChange","game/gameopts/constants","game/gameobject/unit/ZoneType","game/Prng","game/trigger/TriggerManager","game/CountdownTimer","game/WeaponType","game/Warhead","game/trait/interface/NotifyObjectTraitAdd","game/event/RadarOnOffEvent","util/geometry"]
// Note: variable/type names are minified approximations of the original TypeScript.

System.register(
  "game/Game",
  [
    "game/ConstructionWorker",
    "game/gameopts/GameOpts",
    "engine/type/ObjectType",
    "util/event",
    "game/map/OreSpread",
    "game/gameobject/Infantry",
    "game/Alliances",
    "util/BoxedVar",
    "game/StartingUnitsGenerator",
    "game/map/tileFinder/CardinalTileFinder",
    "game/type/SpeedType",
    "game/Target",
    "game/map/BridgeOverlayTypes",
    "util/math",
    "game/GameEventBus",
    "game/event/ObjectDestroyEvent",
    "game/event/PlayerDefeatedEvent",
    "game/ini/GameModeType",
    "game/Traits",
    "game/trait/interface/NotifyTick",
    "game/trait/interface/NotifyDestroy",
    "game/trait/interface/NotifySpawn",
    "game/trait/interface/NotifyUnspawn",
    "game/trait/interface/NotifyOwnerChange",
    "game/event/ObjectOwnerChangeEvent",
    "game/event/ObjectUnspawnEvent",
    "game/trait/interface/NotifyTargetDestroy",
    "game/gameobject/unit/VeteranLevel",
    "game/event/ObjectSpawnEvent",
    "game/map/OreOverlayTypes",
    "game/Weapon",
    "game/GameSpeed",
    "game/gameobject/common/DeathType",
    "game/map/Bridges",
    "game/SuperWeapon",
    "game/event/AllianceChangeEvent",
    "game/trait/interface/NotifyAllianceChange",
    "game/gameopts/constants",
    "game/gameobject/unit/ZoneType",
    "game/Prng",
    "game/trigger/TriggerManager",
    "game/CountdownTimer",
    "game/WeaponType",
    "game/Warhead",
    "game/trait/interface/NotifyObjectTraitAdd",
    "game/event/RadarOnOffEvent",
    "util/geometry",
  ],
  function (t, e) {
    "use strict";
    var i,
      a,
      S,
      m,
      w,
      y,
      n,
      f,
      T,
      v,
      b,
      r,
      E,
      s,
      C,
      o,
      l,
      x,
      O,
      c,
      h,
      u,
      d,
      g,
      p,
      A,
      M,
      R,
      P,
      I,
      k,
      B,
      N,
      j,
      L,
      D,
      F,
      _,
      U,
      H,
      G,
      V,
      W,
      z,
      K,
      q,
      $,
      Q,
      Y;
    e && e.id;
    return {
      setters: [
        function (e) {
          i = e;
        },
        function (e) {
          a = e;
        },
        function (e) {
          S = e;
        },
        function (e) {
          m = e;
        },
        function (e) {
          w = e;
        },
        function (e) {
          y = e;
        },
        function (e) {
          n = e;
        },
        function (e) {
          f = e;
        },
        function (e) {
          T = e;
        },
        function (e) {
          v = e;
        },
        function (e) {
          b = e;
        },
        function (e) {
          r = e;
        },
        function (e) {
          E = e;
        },
        function (e) {
          s = e;
        },
        function (e) {
          C = e;
        },
        function (e) {
          o = e;
        },
        function (e) {
          l = e;
        },
        function (e) {
          x = e;
        },
        function (e) {
          O = e;
        },
        function (e) {
          c = e;
        },
        function (e) {
          h = e;
        },
        function (e) {
          u = e;
        },
        function (e) {
          d = e;
        },
        function (e) {
          g = e;
        },
        function (e) {
          p = e;
        },
        function (e) {
          A = e;
        },
        function (e) {
          M = e;
        },
        function (e) {
          R = e;
        },
        function (e) {
          P = e;
        },
        function (e) {
          I = e;
        },
        function (e) {
          k = e;
        },
        function (e) {
          B = e;
        },
        function (e) {
          N = e;
        },
        function (e) {
          j = e;
        },
        function (e) {
          L = e;
        },
        function (e) {
          D = e;
        },
        function (e) {
          F = e;
        },
        function (e) {
          _ = e;
        },
        function (e) {
          U = e;
        },
        function (e) {
          H = e;
        },
        function (e) {
          G = e;
        },
        function (e) {
          V = e;
        },
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
      ],
      execute: function () {
        var e;
        (((e = Q || t("GameStatus", (Q = {})))[(e.NotStarted = 0)] = "NotStarted"),
          (e[(e.Started = 1)] = "Started"),
          (e[(e.Ended = 2)] = "Ended"),
          t(
            "Game",
            (Y = class {
              get onEnd() {
                return this._onEnd.asEvent();
              }
              constructor(e, t, i, r, s, a, n, o, l, c, h, u, d, g, p) {
                ((this.updatableObjects = new Set()),
                  (this.constructionWorkers = new Map()),
                  (this.currentTick = 0),
                  (this.currentTime = 0),
                  (this.countdownTimer = new V.CountdownTimer()),
                  (this._onEnd = new m.EventDispatcher()),
                  (this.afterTickCallbacks = []),
                  (this.events = new C.GameEventBus()),
                  (this.traits = new O.Traits()),
                  (this.debugText = new f.BoxedVar("")),
                  (this.world = e),
                  (this.map = t),
                  (this.rules = i),
                  (this.art = r),
                  (this.ai = s),
                  (this.id = a),
                  (this.startTimestamp = n),
                  (this.prng = H.Prng.factory(a, n)),
                  (this.gameOpts = o),
                  (this.gameModeType = l),
                  (this.playerList = c),
                  (this.unitSelection = h),
                  (this.alliances = u),
                  (this.desiredSpeed = new f.BoxedVar(B.GameSpeed.computeGameSpeed(o.gameSpeed))),
                  (this.speed = new f.BoxedVar(this.desiredSpeed.value)),
                  (this.nextObjectId = d),
                  (this.objectFactory = g),
                  (this.botManager = p),
                  (this.triggers = new G.TriggerManager()));
              }
              addPlayer(e) {
                (this.playerList.addPlayer(e), this.constructionWorkers.set(e, this.createConstructionWorker(e)));
              }
              getPlayer(e) {
                return this.playerList.getPlayerAt(e);
              }
              getPlayerByName(e) {
                return this.playerList.getPlayerByName(e);
              }
              getAiPlayerName(e) {
                let t;
                return ((t = "number" == typeof e ? e : this.gameOpts.aiPlayers.indexOf(e)), `@@AI${t + 1}@@`);
              }
              getPlayerNumber(e) {
                return this.playerList.getPlayerNumber(e);
              }
              getCombatants() {
                return this.playerList.getCombatants();
              }
              getCivilianPlayer() {
                return this.playerList.getCivilian();
              }
              getAllPlayers() {
                return this.playerList.getAll();
              }
              getNonNeutralPlayers() {
                return this.playerList.getNonNeutral();
              }
              areFriendly(e, t) {
                return e.owner === t.owner || this.alliances.areAllied(e.owner, t.owner);
              }
              getWorld() {
                return this.world;
              }
              createConstructionWorker(e) {
                return new i.ConstructionWorker(e, this.rules, this.art, this.map, this);
              }
              getConstructionWorker(e) {
                var t = this.constructionWorkers.get(e);
                if (!t) throw new Error(`No construction worker found for player "${e.name}"`);
                return t;
              }
              getUnitSelection() {
                return this.unitSelection;
              }
              init(e) {
                ((this.localPlayer = e),
                  this.createMapObjects(),
                  this.createPlayerInitialUnits(),
                  this.map.terrain.computeAllPassabilityGraphs(),
                  this.mapShroudTrait.init(this),
                  this.crateGeneratorTrait.init(this),
                  this.playerList.getAll().forEach((e) => (e.credits = this.gameOpts.credits)),
                  this.rules.mpDialogSettings.alliesAllowed && this.createInitialTeams(),
                  this.botManager.init(this),
                  this.triggers.init(this));
              }
              start() {
                ((this.status = Q.Started),
                  (this.currentTick = 0),
                  (this.currentTime = 0),
                  this.botManager.onGameStart());
              }
              createInitialTeams() {
                for (let t = 0; t < this.gameOpts.maxSlots; t++) {
                  var i = [...this.gameOpts.humanPlayers, ...this.gameOpts.aiPlayers]
                    .filter((e) => e?.teamId === t && e.countryId !== _.OBS_COUNTRY_ID)
                    .map((e) => (a.isHumanPlayerInfo(e) ? e.name : this.getAiPlayerName(e)));
                  if (1 < i.length)
                    for (let t = 0; t < i.length - 1; t++)
                      for (let e = t + 1; e < i.length; e++) {
                        var r = this.getPlayerByName(i[t]),
                          s = this.getPlayerByName(i[e]),
                          s = this.alliances.setAlliance(r, s, n.AllianceStatus.Formed);
                        this.onAllianceChange(s, r, !0);
                      }
                }
              }
              createMapObjects() {
                var e = this.rules.general.harvesterUnit.every(
                    (e) =>
                      !s.isBetween(
                        this.rules.getObject(e, S.ObjectType.Vehicle).techLevel,
                        0,
                        this.rules.mpDialogSettings.techLevel,
                      ),
                  ),
                  t = this.map.getInitialMapObjects();
                (this.createInitialMapTerrains(t.terrains, e),
                  this.createInitialMapOverlays(t.overlays, e),
                  this.createInitialMapSmudges(t.smudges),
                  this.createInitialMapTechnos(t.technos));
              }
              createInitialMapTerrains(e, t) {
                for (var i of e) {
                  var r,
                    s,
                    a = i.name;
                  this.validateMapObjectRulesAndArt(a, S.ObjectType.Terrain) &&
                    ((r = this.map.tiles.getByMapCoords(i.rx, i.ry))
                      ? ((s = this.rules.getObject(a, S.ObjectType.Terrain)),
                        (t && s.spawnsTiberium) ||
                          ((a = this.createObject(S.ObjectType.Terrain, a)), this.spawnObject(a, r)))
                      : console.warn(`Invalid map object location (${i.rx},${i.ry})`, i));
                }
              }
              createInitialMapOverlays(e, r) {
                let s = new Map(),
                  a = new Map();
                var n,
                  t,
                  i,
                  o = this.map.bridges.findMapHighBridgeHeadTiles();
                let l = this.map.bridges.findBridgeSpecsForHeadTiles([...o]);
                for (n of e) {
                  var c = this.rules.getOverlayName(n.id);
                  if (this.validateMapObjectRulesAndArt(c, S.ObjectType.Overlay)) {
                    let e = this.createObject(S.ObjectType.Overlay, c);
                    ((e.overlayId = n.id), (e.value = n.value));
                    let t = n.rx,
                      i = n.ry;
                    if (e.isBridge() && e.isHighBridge()) {
                      e.position.tileElevation = 4;
                      var h = l.find((e) =>
                        $.rectContainsPoint(
                          { x: e.start.rx, y: e.start.ry, ...this.map.bridges.getBridgeSize(e) },
                          { x: t, y: i },
                        ),
                      );
                      if (h) {
                        var { type: c, isXBridge: u, isHigh: h } = h;
                        if (!h) {
                          (console.warn(`Expected high bridge but found low bridge overlay at location (${t},${i})`),
                            e.dispose());
                          continue;
                        }
                        u !== e.isXBridge() &&
                          ((d = E.BridgeOverlayTypes.calculateHighBridgeOverlayId(c, u)),
                          e.overlayId !== d && ((e.overlayId = d), (e.name = this.rules.getOverlayName(d))));
                      }
                      ((t += e.isXBridge() ? 0 : -1), (i += e.isXBridge() ? -1 : 0));
                    }
                    var d,
                      u = this.map.tiles.getByMapCoords(t, i);
                    if (u)
                      if (
                        (e.rules.tiberium &&
                          (void 0 === (d = I.OreOverlayTypes.getOverlayTibType(n.id)) ||
                            (void 0 !== (d = w.OreSpread.calculateOverlayId(d, u)) &&
                              d !== n.id &&
                              (e.dispose(),
                              (e = this.createObject(S.ObjectType.Overlay, this.rules.getOverlayName(d))),
                              (e.overlayId = d),
                              (e.value = n.value)))),
                        E.BridgeOverlayTypes.isLowBridge(n.id))
                      )
                        E.BridgeOverlayTypes.isBridgePlaceholder(n.id) ||
                          (s.set(u, n.value), 1 === n.value ? a.set(u, e) : e.dispose());
                      else {
                        if (e.isTiberium())
                          if (this.map.getObjectsOnTile(u).find((e) => e.isTerrain())) {
                            e.dispose();
                            continue;
                          }
                        r && e.isTiberium() ? e.dispose() : this.spawnObject(e, u);
                      }
                    else (console.warn(`Invalid map object location (${t},${i})`, n), e.dispose());
                  }
                }
                for ([t, i] of a) {
                  var g = i.isXBridge(),
                    p = this.map.tiles.getByMapCoords(t.rx + (g ? 0 : -1), t.ry + (g ? -1 : 0)),
                    g = this.map.tiles.getByMapCoords(t.rx + (g ? 0 : 1), t.ry + (g ? 1 : 0));
                  p && g && (0 === s.get(p) || 2 === s.get(g))
                    ? ((i.value = 0), this.spawnObject(i, p))
                    : (i.dispose(), console.warn(`Invalid bridge segment @${t.rx},${t.ry}. Skipping.`));
                }
                var m,
                  o = [...a.keys()].filter(
                    (e) => this.map.bridges.getPieceAtTile(e)?.headType !== j.BridgeHeadType.None,
                  );
                let f = [...this.map.bridges.findBridgeSpecsForHeadTiles([...o]), ...l];
                for (m of f) for (var y of this.map.bridges.findBridgePieces(m)) y.obj.bridgeTrait.bridgeSpec = m;
                var T,
                  o = f.map((e) => this.map.bridges.findAllBridgeTiles(e)).flat(),
                  v = E.BridgeOverlayTypes.bridgePlaceholderIds[0],
                  b = this.rules.getOverlayName(v);
                for (T of o) {
                  let e = this.createObject(S.ObjectType.Overlay, b);
                  ((e.overlayId = v), this.spawnObject(e, T));
                }
              }
              createInitialMapSmudges(e) {
                for (var t of e) {
                  var i = t.name,
                    r = this.map.tiles.getByMapCoords(t.rx, t.ry);
                  r
                    ? ((i = this.createObject(S.ObjectType.Smudge, i)), this.spawnObject(i, r))
                    : console.warn(`Invalid map object location (${t.rx},${t.ry})`, t);
                }
              }
              createInitialMapTechnos(e) {
                let t = new Map(
                    this.playerList
                      .getAll()
                      .filter((e) => !!e.country)
                      .map((e) => [e.country.name, e]),
                  ),
                  i = this.map.getTags();
                for (let n of e) {
                  var r = n.name;
                  if (this.validateMapObjectRulesAndArt(r, n.type)) {
                    var s = this.map.tiles.getByMapCoords(n.rx, n.ry);
                    if (s) {
                      var a = t.get(n.owner);
                      if (a) {
                        if (a.isNeutral) {
                          let t = this.createObject(n.type, r);
                          (n.tag && (t.tag = i.find((e) => e.id === n.tag)),
                            (t.healthTrait.health = (n.health / 256) * 100));
                          let e = !1;
                          if (!t.healthTrait.health) {
                            if (!t.isBuilding() || !t.rules.leaveRubble) {
                              t.dispose();
                              continue;
                            }
                            e = !0;
                          }
                          if (n.isInfantry() || n.isVehicle() || n.isAircraft()) {
                            ((t.direction = ((-n.direction / 256) * 360 + 360) % 360),
                              n.isInfantry() && (t.position.subCell = n.subCell));
                            let e = !1;
                            (n.onBridge &&
                              (void 0 === s.onBridgeLandType
                                ? console.warn(
                                    `Cannot place unit "${n.name}" on a bridge because ` +
                                      `no bridge was found at ${s.rx}, ` +
                                      s.ry,
                                  )
                                : (e = !0)),
                              (t.onBridge = e),
                              (t.zone = U.getZoneType(e ? s.onBridgeLandType : s.landType)),
                              e &&
                                (t.position.tileElevation +=
                                  this.map.tileOccupation.getBridgeOnTile(s)?.tileElevation ?? 0),
                              n.veterancy && t.veteranTrait?.setRelativeXP(n.veterancy));
                          } else t.poweredTrait?.setTurnedOn(n.poweredOn);
                          (this.changeObjectOwner(t, a),
                            this.spawnObject(t, s),
                            e && this.destroyObject(t, void 0, !0));
                        }
                      } else console.warn(`Invalid owner "${n.owner}" for map object`, n);
                    } else console.warn(`Invalid map object location (${n.rx},${n.ry})`, n);
                  }
                }
              }
              validateMapObjectRulesAndArt(e, t) {
                return this.rules.hasObject(e, t)
                  ? !!this.art.hasObject(e, t) || (console.warn(`Map object '${e}' has no art section. Skipping.`), !1)
                  : (console.warn(`Map object '${e}' has no rules section. Skipping.`), !1);
              }
              createPlayerInitialUnits() {
                let e = this.playerList.getCombatants().map((e) => e.country);
                var i = [...this.rules.infantryRules.values(), ...this.rules.vehicleRules.values()].filter(
                  (t) =>
                    t.allowedToStartInMultiplayer &&
                    !t.naval &&
                    -1 !== t.techLevel &&
                    t.techLevel <= this.rules.mpDialogSettings.techLevel &&
                    !this.rules.general.baseUnit.includes(t.name) &&
                    e.some((e) => t.isAvailableTo(e) && t.hasOwner(e)),
                );
                for (let f of this.playerList.getCombatants()) {
                  var l = this.map.startingLocations[f.startLocation],
                    c = this.map.tiles.getByMapCoords(l.x, l.y);
                  if (!c) throw new Error(`Invalid player starting position (${l.x},${l.y})`);
                  // Pick the MCV whose Owner list includes this country. baseUnit is an array
                  // of vehicle names (AMCV/SMCV/PCV in vanilla YR). Each faction's MCV must
                  // declare Owner=...,<CountryName>,... for find() to match it; the deployed
                  // ConstructionYard is determined solely by the MCV's DeploysInto= value.
                  let mcvName = this.rules.general.baseUnit.find((e) => {
                    let t = this.rules.getObject(e, S.ObjectType.Vehicle);
                    return t.isAvailableTo(f.country) && t.hasOwner(f.country);
                  });
                  if (!mcvName && this.rules.general.baseUnit.length)
                    mcvName = this.rules.general.baseUnit[0];
                  if (!mcvName) throw new Error("No suitable MCV found for player country " + f.country?.name);
                  let mcvRules = this.rules.getObject(mcvName, S.ObjectType.Vehicle);
                  ((l = this.createUnitForPlayer(mcvRules, f)), this.spawnObject(l, c));
                  let e = T.StartingUnitsGenerator.generate(
                    this.gameOpts.unitCount,
                    [...this.rules.vehicleRules.keys()],
                    i,
                    f.country,
                  );
                  this.gameModeType === x.GameModeType.Unholy &&
                    e.push(
                      ...this.rules.general.baseUnit
                        .filter((e) => e !== t)
                        .map((e) => ({ name: e, type: S.ObjectType.Vehicle, count: 1 })),
                    );
                  var h, u, d;
                  let r = [],
                    s = !1,
                    a = new v.CardinalTileFinder(
                      this.map.tiles,
                      this.map.mapBounds,
                      c,
                      4,
                      4,
                      (e) =>
                        !this.map
                          .getGroundObjectsOnTile(e)
                          .find((e) => !(e.isSmudge() || (e.isOverlay() && e.isTiberium()))) &&
                        0 < this.map.terrain.getPassableSpeed(e, b.SpeedType.Foot, !1, !1),
                    ),
                    n = new Map(),
                    o = 0;
                  for ({ name: h, type: u, count: d } of e) {
                    let i = d;
                    for (; 0 < i;) {
                      let t;
                      if ((s || ((t = a.getNextTile()), t ? r.push(t) : (s = !0)), s && r.length)) {
                        var g = r[o];
                        let e = n.get(g);
                        (e ||
                          ((e = new v.CardinalTileFinder(
                            this.map.tiles,
                            this.map.mapBounds,
                            g,
                            1,
                            0,
                            (e) =>
                              !this.map
                                .getGroundObjectsOnTile(e)
                                .find((e) => !(e.isSmudge() || (e.isOverlay() && e.isTiberium()))) &&
                              0 < this.map.terrain.getPassableSpeed(e, b.SpeedType.Foot, !1, !1),
                          )),
                          n.set(g, e)),
                          (o = (o + 1) % r.length),
                          (t = e.getNextTile()));
                      }
                      if (t) {
                        var p,
                          m = this.rules.getObject(h, u);
                        if (u === S.ObjectType.Vehicle) {
                          g = this.createUnitForPlayer(m, f);
                          (this.applyInitialVeteran(g, f), this.spawnObject(g, t), i--);
                        } else {
                          if (u !== S.ObjectType.Infantry) throw new Error("Should not reach this line");
                          for (p of y.Infantry.SUB_CELLS.slice(0, i)) {
                            let e = this.createUnitForPlayer(m, f);
                            ((e.position.subCell = p), this.applyInitialVeteran(e, f), this.spawnObject(e, t), i--);
                          }
                        }
                      } else i--;
                    }
                  }
                }
              }
              applyInitialVeteran(e, t) {
                e.veteranTrait &&
                  (this.rules.general.veteran.initialVeteran
                    ? e.veteranTrait.setVeteranLevel(R.VeteranLevel.Elite)
                    : t.country.hasVeteranUnit(e.type, e.name) &&
                      e.veteranTrait.setVeteranLevel(R.VeteranLevel.Veteran));
              }
              createObject(e, t) {
                return this.objectFactory.create(e, t, this.rules, this.art);
              }
              createUnitForPlayer(e, t) {
                if (![S.ObjectType.Aircraft, S.ObjectType.Vehicle, S.ObjectType.Infantry].includes(e.type))
                  throw new Error(`Attempted to create an invalid unit type "${e.type}"`);
                let i = this.createObject(e.type, e.name);
                return (
                  this.changeObjectOwner(i, t),
                  (i.purchaseValue = this.sellTrait.computePurchaseValue(i.rules, t)),
                  i
                );
              }
              createProjectile(e, t, i, r, s) {
                let a = this.createObject(S.ObjectType.Projectile, e);
                return (
                  (a.fromWeapon = i),
                  (a.fromObject = t),
                  (a.fromPlayer = t.owner),
                  (a.target = r),
                  (a.isShrapnel = s),
                  a
                );
              }
              createLooseProjectile(e, t, i) {
                var r = this.rules.getWeapon(e),
                  s = r.projectile,
                  a = this.rules.getProjectile(s),
                  n = this.rules.getWarhead(r.warhead),
                  n = {
                    minRange: 0,
                    projectileRules: a,
                    range: Number.POSITIVE_INFINITY,
                    rules: r,
                    speed: k.Weapon.computeSpeed(r, a),
                    type: W.WeaponType.Primary,
                    warhead: new z.Warhead(n),
                  };
                let o = this.createObject(S.ObjectType.Projectile, s);
                return ((o.fromWeapon = n), (o.fromObject = void 0), (o.fromPlayer = t), (o.target = i), o);
              }
              createSuperWeapon(e, t, i = !1) {
                var r = this.rules.getSuperWeapon(e);
                return new L.SuperWeapon(e, r, t, i);
              }
              createTarget(e, t) {
                return new r.Target(e, t, this.map.tileOccupation);
              }
              isValidTarget(e) {
                if (e) {
                  if (!e.isSpawned || e.isCrashing) return !1;
                  if (!(e.rules.legalTarget || (e.isBuilding() && e.rules.hospital))) return !1;
                  if (e.isBuilding() && e.rules.invisibleInGame) return !1;
                }
                return !0;
              }
              spawnObject(e, t) {
                if (e.isTechno() && e.limboData)
                  throw new Error(
                    `Object ${e.name}#${e.id} is in limbo. Use unlimboObject instead or clear limboData first`,
                  );
                this.doSpawnObject(e, t);
              }
              unspawnObject(e) {
                (e.isTechno() && e.owner && e.owner.removeOwnedObject(e), this.doUnspawnObject(e));
              }
              limboObject(e, t) {
                ((e.limboData = t), this.doUnspawnObject(e));
              }
              unlimboObject(e, t, i = !1) {
                var r = e.limboData;
                if (!r) throw new Error(`Object ${e.name}#${e.id} has no limboData attached`);
                ((e.limboData = void 0), this.doSpawnObject(e, t));
                let s = this.getUnitSelection();
                (r.selected && !i && s.addToSelection(e),
                  void 0 !== r.controlGroup && s.addUnitsToGroup(r.controlGroup, [e], !1));
              }
              doSpawnObject(t, e) {
                var i, r;
                ((t.position.tile = e),
                  t.isBuilding() &&
                    ((r = t.art.foundationCenter),
                    (i = e.rx + r.x),
                    (r = e.ry + r.y),
                    (t.centerTile = this.map.tiles.getByMapCoords(i, r) ?? this.map.tiles.getPlaceholderTile(i, r))),
                  this.world.spawnObject(t),
                  (t.cachedTraits.tick.length || t.isProjectile() || t.isDebris() || t.isTechno()) &&
                    this.updatableObjects.add(t),
                  t.isTechno() && this.map.technosByTile.add(t),
                  t.isProjectile() || t.isDebris() || this.map.tileOccupation.occupyTileRange(e, t),
                  t.art.canHideThings && this.map.tileOcclusion.addOccluder(t),
                  t.onSpawn(this),
                  this.traits.filter(u.NotifySpawn).forEach((e) => {
                    e[u.NotifySpawn.onSpawn](t, this);
                  }),
                  this.events.dispatch(new P.ObjectSpawnEvent(t)));
              }
              doUnspawnObject(t) {
                var e = t.tile;
                (t.isProjectile() || t.isDebris() || this.map.tileOccupation.unoccupyTileRange(e, t),
                  t.art.canHideThings && this.map.tileOcclusion.removeOccluder(t),
                  t.isTechno() && (this.unitSelection.cleanupUnit(t), this.map.technosByTile.remove(t)),
                  this.world.removeObject(t),
                  this.updatableObjects.delete(t),
                  t.onUnspawn(this),
                  this.traits.filter(d.NotifyUnspawn).forEach((e) => {
                    e[d.NotifyUnspawn.onUnspawn](t, this);
                  }),
                  this.events.dispatch(new A.ObjectUnspawnEvent(t)));
              }
              destroyObject(t, i, e = !1, r = !1) {
                if (t.isDestroyed) throw new Error(`Object with ID "${t.id}" is already destroyed`);
                if (t.isTechno()) {
                  let e = t.mindControllableTrait?.getOriginalOwner() ?? t.owner;
                  (!i ||
                    (t.isBuilding() && !e.isCombatant()) ||
                    (i.player.addUnitsKilled(t.type, 1),
                    i.player === e || this.alliances.areAllied(i.player, e) || (i.player.score += t.rules.points)),
                    e.isNeutral || e.addUnitsLost(t.type, 1));
                }
                if (
                  ((t.isDestroyed = !0),
                  t.healthTrait && (t.healthTrait.health = 0),
                  t.onDestroy(this, i, e),
                  this.traits.filter(h.NotifyDestroy).forEach((e) => {
                    e[h.NotifyDestroy.onDestroy](t, this, i);
                  }),
                  i?.obj?.traits.filter(M.NotifyTargetDestroy).forEach((e) => {
                    e[M.NotifyTargetDestroy.onDestroy](i.obj, t, i.weapon, this);
                  }),
                  this.events.dispatch(new o.ObjectDestroyEvent(t, i, r)),
                  t.isBuilding() && t.rules.leaveRubble && t.deathType !== N.DeathType.Temporal)
                ) {
                  (t.owner.removeOwnedObject(t), this.unitSelection.cleanupUnit(t));
                  var s = this.map.tileOccupation.calculateTilesForGameObject(t.tile, t);
                  (this.map.terrain.invalidateTiles(s),
                    t.art.canHideThings && this.map.tileOcclusion.removeOccluder(t),
                    this.updatableObjects.delete(t),
                    t.onUnspawn(this),
                    this.traits.filter(d.NotifyUnspawn).forEach((e) => {
                      e[d.NotifyUnspawn.onUnspawn](t, this);
                    }),
                    this.events.dispatch(new A.ObjectUnspawnEvent(t)));
                } else if (t.isSpawned) this.unspawnObject(t);
                else if (t.isTechno() && t.owner) {
                  if (!t.limboData) throw new Error(`Object with ID "${t.id}" should be in limbo but has no limboData`);
                  t.owner.removeOwnedObject(t);
                }
                t.dispose();
              }
              getObjectById(e) {
                return this.world.getObjectById(e);
              }
              changeObjectOwner(t, e) {
                const i = t.owner;
                (i && i.removeOwnedObject(t),
                  e.addOwnedObject(t),
                  // OpenYRWeb: mark garrison buildings as "captured from civilian" when they become
                  // civilian-owned. This allows them to flip back to civilian when emptied later.
                  // Player-built garrison buildings never get this flag, so they stay player-owned.
                  t.garrisonTrait && e === this.getCivilianPlayer() && (t.wasCapturedFromCivilian = !0),
                  i &&
                    i !== e &&
                    (this.traits.filter(g.NotifyOwnerChange).forEach((e) => {
                      e[g.NotifyOwnerChange.onChange](t, i, this);
                    }),
                    t.onOwnerChange(i, this),
                    this.events.dispatch(new p.ObjectOwnerChangeEvent(t, i)),
                    i === this.localPlayer &&
                      t.owner !== this.localPlayer &&
                      (this.unitSelection.removeFromSelection([t]), this.unitSelection.removeUnitsFromGroup([t]))));
              }
              addObjectTrait(t, i) {
                (t.addTrait(i),
                  this.traits.filter(K.NotifyObjectTraitAdd).forEach((e) => {
                    e[K.NotifyObjectTraitAdd.onAdd](t, i, this);
                  }));
              }
              onAllianceChange(t, e, i) {
                (this.events.dispatch(
                  new D.AllianceChangeEvent(t, i ? D.AllianceEventType.Formed : D.AllianceEventType.Broken, e),
                ),
                  this.traits.filter(F.NotifyAllianceChange).forEach((e) => {
                    e[F.NotifyAllianceChange.onChange](t, i, this);
                  }));
              }
              update() {
                if (this.status !== Q.NotStarted) {
                  (this.botManager.update(this),
                    this.status !== Q.Ended &&
                      (void 0 === this.lastGameEndCheck || 1e3 <= this.currentTime - this.lastGameEndCheck) &&
                      (this.checkGameEndConditions(), (this.lastGameEndCheck = this.currentTime)));
                  for (var e of [...this.updatableObjects]) e.isSpawned && e.update(this);
                  if (
                    (this.playerList
                      .getCombatants()
                      .forEach((e) => (e.cheerCooldownTicks = Math.max(0, e.cheerCooldownTicks - 1))),
                    this.traits.filter(c.NotifyTick).forEach((e) => {
                      e[c.NotifyTick.onTick](this);
                    }),
                    this.localPlayer && !this.localPlayer.isObserver && !this.localPlayer.defeated)
                  ) {
                    var t = this.unitSelection.getSelectedUnits();
                    if (1 === t.length) {
                      let i = t[0];
                      if (i.isTechno() && i.owner !== this.localPlayer) {
                        let t = this.mapShroudTrait.getPlayerShroud(this.localPlayer);
                        this.map.tileOccupation
                          .calculateTilesForGameObject(i.tile, i)
                          .find((e) => !t.isShrouded(e, i.tileElevation)) ||
                          (this.unitSelection.deselectAll(), this.unitSelection.cleanupUnit(i));
                      }
                    }
                  }
                  for (var i of this.afterTickCallbacks) i();
                  ((this.afterTickCallbacks.length = 0),
                    this.triggers.update(this),
                    this.countdownTimer.update(this),
                    this.currentTick++,
                    (this.currentTime += 1e3 / B.GameSpeed.BASE_TICKS_PER_SECOND));
                }
              }
              afterTick(e) {
                this.afterTickCallbacks.push(e);
              }
              checkGameEndConditions() {
                (this.updateDefeatedPlayers(this.playerList.getCombatants()),
                  ((this.localPlayer?.defeated && !this.localPlayer.isObserver) ||
                    (!this.alliances.getHostilePlayers().length &&
                      1 < this.gameOpts.humanPlayers.length + this.gameOpts.aiPlayers.filter((e) => !!e).length)) &&
                    this.end());
              }
              end() {
                this.status !== Q.Ended && ((this.status = Q.Ended), this._onEnd.dispatch(this, void 0));
              }
              updateDefeatedPlayers(e) {
                let r = this.stalemateDetectTrait?.isStale() && 0 === this.stalemateDetectTrait.getCountdownTicks(),
                  s = this.gameOpts.shortGame;
                e.forEach((t) => {
                  let i;
                  if (r) i = !0;
                  else {
                    let e;
                    ((e = s
                      ? ((e = [...t.getOwnedObjectsByType(S.ObjectType.Building, !0)].some(
                          (e) => !e.rules.insignificant,
                        )),
                        e || t.getOwnedObjects(!0).some((e) => this.rules.general.baseUnit.includes(e.name)))
                      : t.getOwnedObjects(!0).some((e) => !e.rules.insignificant && !e.limboData?.inTransport)),
                      (i = !e));
                  }
                  var e;
                  i &&
                    ((t.defeated = !0),
                    (e = this.alliances.getHostilePlayers().some((e) => !e.first.isAi || !e.second.isAi)) &&
                      (t.isObserver = !0),
                    this.removeAllPlayerAssets(t),
                    this.events.dispatch(new l.PlayerDefeatedEvent(t)),
                    e &&
                      (this.mapShroudTrait.getPlayerShroud(t)?.revealAll(),
                      (e = t.radarTrait.isDisabled()),
                      t.radarTrait.setDisabled(!1),
                      e && this.events.dispatch(new q.RadarOnOffEvent(t, !0))));
                });
              }
              removeAllPlayerAssets(e) {
                (e.getOwnedObjects().forEach((e) => {
                  e.isDestroyed ||
                    (e.isBuilding() && e.rules.returnable && e.rules.needsEngineer && !e.garrisonTrait
                      ? this.changeObjectOwner(e, this.getCivilianPlayer())
                      : (e.isBuilding() && e.wallTrait) || this.destroyObject(e, void 0, !0));
                }),
                  e.getOwnedObjects(!0).forEach((e) => {
                    e.isDestroyed ||
                      (e.limboData?.inTransport || (e.isBuilding() && e.wallTrait)
                        ? this.changeObjectOwner(e, this.getCivilianPlayer())
                        : this.destroyObject(e, void 0, !0));
                  }));
              }
              isAssetRedistributionEnabled() {
                return this.rules.mpDialogSettings.mustAlly && !this.rules.mpDialogSettings.allyChangeAllowed;
              }
              redistributeAllPlayerAssets(e) {
                if (e.isObserver) return !1;
                if (!this.isAssetRedistributionEnabled()) return !1;
                let t = this.alliances.getAllies(e).filter((e) => !e.isAi && !e.defeated);
                if (0 < t.length) {
                  var i,
                    r = [...t].sort((e, t) => t.score - e.score)[0];
                  for (i of e.getOwnedObjects(!0)) this.changeObjectOwner(i, r);
                  var s,
                    a = Math.floor(e.credits / t.length),
                    n = e.credits % t.length;
                  for (s of t) s.credits += a;
                  return ((t[0].credits += n), !0);
                }
                return !1;
              }
              generateRandomInt(e, t) {
                return this.prng.generateRandomInt(e, t);
              }
              generateRandom() {
                return this.prng.generateRandom();
              }
              getHash() {
                return s.fnv32a([
                  ...new Uint8Array(new Float64Array([this.prng.getLastRandom() ?? 0]).buffer),
                  this.nextObjectId.value,
                  ...this.world.getAllObjects().map((e) => e.getHash()),
                  ...this.playerList.getAll().map((e) => e.getHash()),
                  this.alliances.getHash(),
                  ...this.traits.getAll().map((e) => e.getHash?.() ?? 0),
                ]);
              }
              debugGetState() {
                return {
                  currentTick: this.currentTick,
                  lastRandom: this.prng.getLastRandom(),
                  nextObjectId: this.nextObjectId.value,
                  objects: this.world.getAllObjects().map((e) => e.debugGetState()),
                  players: this.playerList.getAll().map((e) => e.debugGetState()),
                  alliances: this.alliances.debugGetState(),
                  traits: this.traits.getAll().reduce((e, t) => {
                    var i = t.debugGetState?.();
                    return (void 0 !== i && (e[t.constructor.name] = i), e);
                  }, {}),
                };
              }
              dispose() {
                (this.world.getAllObjects().forEach((e) => e.dispose()),
                  this.playerList.getAll().forEach((e) => e.dispose()),
                  this.constructionWorkers.forEach((e) => e.dispose()),
                  this.botManager.dispose(),
                  this.triggers.dispose(),
                  this.map.dispose(),
                  this.traits.dispose());
              }
            }),
          ));
      },
    };
  },
);
