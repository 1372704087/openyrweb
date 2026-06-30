// === Reconstructed SystemJS module: game/trait/CrateGeneratorTrait ===
// deps: ["engine/type/ObjectType","engine/type/TerrainType","game/event/CratePickupEvent","game/gameobject/unit/RangeHelper","game/gameobject/unit/ZoneType","game/gameopts/constants","game/GameSpeed","game/map/tileFinder/RadialTileFinder","game/map/tileFinder/RadialBackFirstTileFinder","game/type/PowerupType","game/type/SpeedType","game/trait/interface/NotifyTick","game/type/SuperWeaponType","game/trait/SuperWeaponsTrait","game/gameobject/trait/CloakableTrait","game/Warhead","game/gameobject/unit/CollisionType","game/map/tileFinder/RandomTileFinder","game/map/OreSpread","engine/type/TiberiumType","game/gameobject/trait/TiberiumTrait","game/math/Vector2","game/math/Box2","game/SpecialWarheadType"]
// Note: variable/type names are minified approximations of the original TypeScript.

System.register(
  "game/trait/CrateGeneratorTrait",
  [
    "engine/type/ObjectType",
    "engine/type/TerrainType",
    "game/event/CratePickupEvent",
    "game/gameobject/unit/RangeHelper",
    "game/gameobject/unit/ZoneType",
    "game/gameopts/constants",
    "game/GameSpeed",
    "game/map/tileFinder/RadialTileFinder",
    "game/map/tileFinder/RadialBackFirstTileFinder",
    "game/type/PowerupType",
    "game/type/SpeedType",
    "game/trait/interface/NotifyTick",
    "game/type/SuperWeaponType",
    "game/trait/SuperWeaponsTrait",
    "game/gameobject/trait/CloakableTrait",
    "game/Warhead",
    "game/gameobject/unit/CollisionType",
    "game/map/tileFinder/RandomTileFinder",
    "game/map/OreSpread",
    "engine/type/TiberiumType",
    "game/gameobject/trait/TiberiumTrait",
    "game/math/Vector2",
    "game/math/Box2",
    "game/SpecialWarheadType",
  ],
  function (e, t) {
    "use strict";
    var w, i, a, s, g, r, o, E, l, C, n, c, x, O, A, M, R, P, I, k, B, h, u, N, d;
    t && t.id;
    return {
      setters: [
        function (e) {
          w = e;
        },
        function (e) {
          i = e;
        },
        function (e) {
          a = e;
        },
        function (e) {
          s = e;
        },
        function (e) {
          g = e;
        },
        function (e) {
          r = e;
        },
        function (e) {
          o = e;
        },
        function (e) {
          E = e;
        },
        function (e) {
          l = e;
        },
        function (e) {
          C = e;
        },
        function (e) {
          n = e;
        },
        function (e) {
          c = e;
        },
        function (e) {
          x = e;
        },
        function (e) {
          O = e;
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
          h = e;
        },
        function (e) {
          u = e;
        },
        function (e) {
          N = e;
        },
      ],
      execute: function () {
        (e("UNSUPPORTED_POWERUP_TYPES", [
          C.PowerupType.IonStorm,
          C.PowerupType.Gas,
          C.PowerupType.Pod,
          C.PowerupType.Squad,
        ]),
          (d = class {
            constructor(e) {
              ((this.randomCrateSpawn = e), (this.crates = []), (this.availEdgeTiles = []), (this.allTiles = []));
            }
            init(a) {
              var n = a.map.tiles.getMapSize();
              let o = a.map.tiles,
                l = [],
                c = 0;
              for (let d = 0; d < n.width; ++d) {
                let e,
                  t,
                  i = !1,
                  r = !1;
                for (let s = 0; s < n.height; ++s) {
                  var h = o.getByMapCoords(d, s);
                  if (h && this.canPlaceCrateOnTile(a, h)) {
                    var u = a.map.getTileZone(h) === g.ZoneType.Water;
                    e ? (u || (t = h), (r = u)) : u ? (i = r = !0) : (e = t = h);
                  } else if (e && !h) break;
                }
                e && (l.push(e), t && t !== e && l.push(t), i || r || c++);
              }
              ((this.availEdgeTiles = l),
                (this.allTiles = o.getAll()),
                (this.mapEdgeIsWater = 0 === c),
                (this.minCrates =
                  a.rules.crateRules.crateMinimum *
                  a.gameOpts.humanPlayers.filter((e) => e.countryId !== r.OBS_COUNTRY_ID).length));
            }
            [c.NotifyTick.onTick](t) {
              for (var e of this.crates) (e.ticksLeft--, e.ticksLeft <= 0 && (t.unspawnObject(e.obj), e.obj.dispose()));
              if (((this.crates = this.crates.filter((e) => 0 < e.ticksLeft)), this.randomCrateSpawn))
                for (
                  let e = 0;
                  e < this.minCrates - this.crates.length && this.spawnCrateAtRandom(this.allTiles, t);
                  e++
                );
            }
            spawnCrateAtRandom(e, t) {
              var i = this.chooseSpawnTile(e, t);
              if (i) return this.spawnRandomCrateAt(i, t, 0, !0);
            }
            spawnRandomCrateAt(e, t, i = 0, r = !1) {
              if (
                (!this.canPlaceCrateOnTile(t, e) &&
                  0 < i &&
                  (e =
                    new l.RadialBackFirstTileFinder(
                      t.map.tiles,
                      t.map.mapBounds,
                      e,
                      { width: 1, height: 1 },
                      1,
                      i,
                      (e) => this.canPlaceCrateOnTile(t, e),
                    ).getNextTile() ?? e),
                this.canPlaceCrateOnTile(t, e))
              ) {
                var s = t.map.getTileZone(e, !0) === g.ZoneType.Water,
                  s = this.choosePowerup(s, t.rules.powerups.powerups, t);
                if (s) return this.spawnCrateAt(e, s, t, i, r);
              }
            }
            spawnCrateAt(t, i, r, e = 0, s = !1) {
              if (
                (!this.canPlaceCrateOnTile(r, t) &&
                  0 < e &&
                  (t =
                    new l.RadialBackFirstTileFinder(
                      r.map.tiles,
                      r.map.mapBounds,
                      t,
                      { width: 1, height: 1 },
                      1,
                      e,
                      (e) => this.canPlaceCrateOnTile(r, e),
                    ).getNextTile() ?? t),
                this.canPlaceCrateOnTile(r, t))
              ) {
                var a = r.map.getTileZone(t, !0) === g.ZoneType.Water,
                  n = r.rules.crateRules,
                  a = a ? n.waterCrateImg : n.crateImg;
                let e = r.createObject(w.ObjectType.Overlay, a);
                ((e.overlayId = r.rules.getOverlayId(a)), (e.value = 0), r.spawnObject(e, t));
                n = s
                  ? 60 * n.crateRegen * o.GameSpeed.BASE_TICKS_PER_SECOND * (0.5 + 1.5 * r.generateRandom())
                  : Number.POSITIVE_INFINITY;
                return (this.crates.push({ obj: e, powerup: i, ticksLeft: n }), e);
              }
            }
            chooseSpawnTile(e, t) {
              return (
                t.generateRandom() < (this.mapEdgeIsWater ? 1 / 3 : 2 / 3) &&
                  this.availEdgeTiles.length &&
                  (e = this.availEdgeTiles),
                this.chooseRandomTile(e, t)
              );
            }
            chooseRandomTile(e, t) {
              let i;
              let r = 0;
              for (; (i = e[t.generateRandomInt(0, e.length - 1)]), r++, r < 100 && !this.canPlaceCrateOnTile(t, i););
              if (100 <= r) {
                var s = t.map.tileOccupation.getEmptyTiles();
                if (!s.length) return;
                i = s[t.generateRandomInt(0, s.length - 1)];
              }
              return i;
            }
            canPlaceCrateOnTile(e, t) {
              return (
                e.map.mapBounds.isWithinBounds(t) &&
                !e.map.getGroundObjectsOnTile(t).filter((e) => !e.isSmudge()).length &&
                0 < e.map.terrain.getPassableSpeed(t, n.SpeedType.Amphibious, !1, !1) &&
                t.terrainType !== i.TerrainType.Shore &&
                0 === t.rampType
              );
            }
            choosePowerup(e, t, i) {
              if ((t = e ? t.filter((e) => e.waterAllowed) : t).length) {
                var r,
                  s = t.reduce((e, t) => e + t.probShares, 0),
                  a = i.generateRandomInt(0, s);
                let e = 0;
                for (r of t) if (((e += r.probShares), a < e)) return r;
              }
            }
            peekInsideCrate(t) {
              return this.crates.find((e) => e.obj === t)?.powerup.type;
            }
            pickupCrate(e, t, i) {
              let r = this.crates.find((e) => e.obj === t);
              if (r) {
                (this.crates.splice(this.crates.indexOf(r), 1), i.unspawnObject(r.obj), r.obj.dispose());
                let t = this.grantPowerup(e, r.powerup, r.obj.tile, i);
                var s;
                return (
                  void 0 !== t &&
                    (e.owner.cratesPickedUp++,
                    (s = i.rules.powerups.powerups.find((e) => e.type === t)),
                    i.events.dispatch(new a.CratePickupEvent(s, e.owner, e, r.obj.tile))),
                  this.randomCrateSpawn && this.spawnCrateAtRandom(this.allTiles, i),
                  t
                );
              }
            }
            grantPowerup(t, i, r, s) {
              let a = t.owner,
                n = !1;
              if (a.isCombatant()) {
                if (i.type === C.PowerupType.Unit) {
                  let e;
                  if (![...a.buildings].some((e) => e.rules.constructionYard) && s.rules.crateRules.freeMCV) {
                    let t = s.rules.general.baseUnit;
                    if (
                      !a.getOwnedObjects(!0).some((e) => t.includes(e.name)) &&
                      a.credits >=
                        [...s.rules.ai.buildPower, ...s.rules.ai.buildRefinery]
                          .map((e) => s.rules.getBuilding(e))
                          .filter((e) => e.aiBasePlanningSide === a.country.side)
                          .reduce((e, t) => e + t.cost, 0)
                    ) {
                      var o = t.find((e) => {
                        let t = s.rules.getObject(e, w.ObjectType.Vehicle);
                        return t.isAvailableTo(a.country) && t.hasOwner(a.country);
                      });
                      if (!o) throw new Error("No suitable MCV found for player country " + a.country?.name);
                      e = s.rules.getObject(o, w.ObjectType.Vehicle);
                    }
                  }
                  if (
                    (e ||
                      ((l = (l = s.rules.crateRules.unitCrateType)
                        ? s.rules.hasObject(l, w.ObjectType.Vehicle)
                          ? [s.rules.getObject(l, w.ObjectType.Vehicle)]
                          : []
                        : [...s.rules.vehicleRules.values()].filter(
                            (e) => e.crateGoodie && 0 < s.map.terrain.getPassableSpeed(r, e.speedType, !1, !1),
                          )).length &&
                        (e = l[s.generateRandomInt(0, l.length - 1)])),
                    e)
                  ) {
                    let t = s.createUnitForPlayer(e, a);
                    var l = new E.RadialTileFinder(
                      s.map.tiles,
                      s.map.mapBounds,
                      r,
                      { width: 1, height: 1 },
                      0,
                      3,
                      (e) =>
                        0 < s.map.terrain.getPassableSpeed(e, t.rules.speedType, t.isInfantry(), !1) &&
                        !s.map.terrain.findObstacles({ tile: e, onBridge: void 0 }, t).length,
                    ).getNextTile();
                    l ? (s.spawnObject(t, l), (n = !0)) : (a.removeOwnedObject(t), t.dispose());
                  }
                } else if (i.type === C.PowerupType.Money) {
                  if (!i.data) throw new Error("Money powerup missing data field");
                  var c = Math.floor(Number(i.data) * (0.55 + 2 * s.generateRandom() * 0.45));
                  ((a.credits = Math.max(0, a.credits + c)), 0 < c && (a.creditsGained += c), (n = !0));
                } else if (i.type === C.PowerupType.HealBase) {
                  var e;
                  for (e of a.getOwnedObjects(!0)) e.isDestroyed || e.healthTrait.healToFull(void 0, s);
                  n = !0;
                } else if (i.type === C.PowerupType.Reveal) (s.mapShroudTrait.revealMap(a, s), (n = !0));
                else if (i.type === C.PowerupType.Darkness) (s.mapShroudTrait.resetShroud(a, s), (n = !0));
                else if (i.type === C.PowerupType.Veteran) {
                  if (t.veteranTrait && !t.veteranTrait.isMaxLevel()) {
                    n = !0;
                    var h,
                      u = Number(i.data);
                    for (h of this.getUnitsInCrateRadius(s, r)) h.veteranTrait?.promote(u, s);
                  }
                } else if (i.type === C.PowerupType.Armor) {
                  if (1 === t.crateBonuses.armor) {
                    n = !0;
                    var d,
                      g = Number(i.data);
                    for (d of this.getUnitsInCrateRadius(s, r))
                      1 === d.crateBonuses.armor && (d.crateBonuses.armor = g);
                  }
                } else if (i.type === C.PowerupType.Firepower) {
                  if (1 === t.crateBonuses.firepower) {
                    n = !0;
                    var p,
                      m = Number(i.data);
                    for (p of this.getUnitsInCrateRadius(s, r))
                      1 === p.crateBonuses.firepower && (p.crateBonuses.firepower = m);
                  }
                } else if (i.type === C.PowerupType.Speed) {
                  if (1 === t.crateBonuses.speed) {
                    n = !0;
                    var f,
                      y = Number(i.data);
                    for (f of this.getUnitsInCrateRadius(s, r))
                      1 === f.crateBonuses.speed && (f.crateBonuses.speed = y);
                  }
                } else if (i.type === C.PowerupType.Cloak) {
                  if (!t.cloakableTrait) {
                    n = !0;
                    for (var T of this.getUnitsInCrateRadius(s, r))
                      T.cloakableTrait ||
                        ((T.cloakableTrait = new A.CloakableTrait(T, s.rules.general.cloakDelay)),
                        s.addObjectTrait(T, T.cloakableTrait));
                  }
                } else if (i.type === C.PowerupType.ICBM) {
                  c = [...s.rules.superWeaponRules.values()].find((e) => e.type === x.SuperWeaponType.MultiMissile);
                  if (c && a.superWeaponsTrait && !a.superWeaponsTrait.has(c.name)) {
                    let e = s.createSuperWeapon(c.name, a, !0);
                    ((e.isGift = !0), a.superWeaponsTrait.add(e), (n = !0));
                  }
                } else if (i.type === C.PowerupType.Invulnerability) {
                  var v = [...s.rules.superWeaponRules.values()].find((e) => e.type === x.SuperWeaponType.IronCurtain);
                  v && (s.traits.get(O.SuperWeaponsTrait).activateEffect(v, a, s, r, void 0, !0), (n = !0));
                } else if (i.type === C.PowerupType.Explosion || i.type === C.PowerupType.Napalm) {
                  n = !0;
                  var b = Number(i.data),
                    v =
                      i.type === C.PowerupType.Napalm
                        ? s.rules.combatDamage.flameDamage
                        : s.rules.combatDamage.c4Warhead;
                  let e = new M.Warhead(s.rules.getWarhead(v));
                  e.detonate(
                    s,
                    b,
                    t.tile,
                    t.tileElevation,
                    t.position.worldPosition,
                    t.zone,
                    R.CollisionType.None,
                    s.createTarget(t, t.tile),
                    { player: t.owner, weapon: void 0 },
                    N.SpecialWarheadType.None,
                    void 0,
                    0,
                  );
                } else {
                  if (i.type !== C.PowerupType.Tiberium)
                    return void console.warn(`Unhandled powerup type "${C.PowerupType[i.type]}"`);
                  {
                    let e = new P.RandomTileFinder(s.map.tiles, s.map.mapBounds, r, 2, s, (e) =>
                        B.TiberiumTrait.canBePlacedOn(e, s.map),
                      ),
                      t,
                      i = 0;
                    for (; i++ < 6 && (t = e.getNextTile());) {
                      var S = I.OreSpread.calculateOverlayId(k.TiberiumType.Ore, t);
                      if (void 0 === S) throw new Error("Expected an overlayId");
                      let e = s.createObject(w.ObjectType.Overlay, s.rules.getOverlayName(S));
                      ((e.overlayId = S), (e.value = 3), s.spawnObject(e, t), (n = !0));
                    }
                  }
                }
                if (n) return i.type;
                b = s.rules.powerups.powerups.find((e) => e.type === C.PowerupType.Money && 0 < e.probShares);
                return b ? this.grantPowerup(t, b, r, s) : void 0;
              }
            }
            getUnitsInCrateRadius(e, t) {
              let i = e.rules.crateRules.crateRadius,
                r = new s.RangeHelper(e.map.tileOccupation);
              return e.map.technosByTile
                .queryRange(new u.Box2().setFromCenterAndSize(new h.Vector2(t.rx, t.ry), new h.Vector2(i, i)))
                .filter((e) => e.isUnit() && r.tileDistance(e, t) <= i);
            }
          }),
          e("CrateGeneratorTrait", d));
      },
    };
  },
);
