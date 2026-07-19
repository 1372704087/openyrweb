// === Reconstructed SystemJS module: game/gameobject/Projectile ===
// deps: ["game/gameobject/GameObject","engine/type/ObjectType","game/Weapon","game/WeaponType","game/gameobject/unit/FacingUtil","game/Coords","game/gameobject/unit/ZoneType","game/map/TileOccupation","game/map/tileFinder/RadialTileFinder","game/gameobject/unit/RangeHelper","game/gameobject/unit/TargetUtil","game/math/geometry","game/map/tileFinder/RandomTileFinder","util/math","game/type/MovementZone","game/gameobject/infantry/StanceType","game/gameobject/unit/MovePositionHelper","game/GameSpeed","game/gameobject/unit/VeteranLevel","game/gameobject/task/ScatterTask","game/Warhead","game/rules/ObjectRules","game/gameobject/unit/CollisionHelper","game/gameobject/unit/CollisionType","game/math/Vector2","game/math/Vector3","game/SpecialWarheadType"]
// Note: variable/type names are minified approximations of the original TypeScript.

System.register(
  "game/gameobject/Projectile",
  [
    "game/gameobject/GameObject",
    "engine/type/ObjectType",
    "game/Weapon",
    "game/WeaponType",
    "game/gameobject/unit/FacingUtil",
    "game/Coords",
    "game/gameobject/unit/ZoneType",
    "game/map/TileOccupation",
    "game/map/tileFinder/RadialTileFinder",
    "game/gameobject/unit/RangeHelper",
    "game/gameobject/unit/TargetUtil",
    "game/math/geometry",
    "game/map/tileFinder/RandomTileFinder",
    "util/math",
    "game/type/MovementZone",
    "game/gameobject/infantry/StanceType",
    "game/gameobject/unit/MovePositionHelper",
    "game/GameSpeed",
    "game/gameobject/unit/VeteranLevel",
    "game/gameobject/task/ScatterTask",
    "game/Warhead",
    "game/rules/ObjectRules",
    "game/gameobject/unit/CollisionHelper",
    "game/gameobject/unit/CollisionType",
    "game/math/Vector2",
    "game/math/Vector3",
    "game/SpecialWarheadType",
  ],
  function (t, e) {
    "use strict";
    var i, s, T, v, S, w, c, b, E, C, h, x, O, A, M, R, P, I, r, n, k, a, o, B, N, j, L, D, l;
    e && e.id;
    return {
      setters: [
        function (e) {
          i = e;
        },
        function (e) {
          s = e;
        },
        function (e) {
          T = e;
        },
        function (e) {
          v = e;
        },
        function (e) {
          S = e;
        },
        function (e) {
          w = e;
        },
        function (e) {
          c = e;
        },
        function (e) {
          b = e;
        },
        function (e) {
          E = e;
        },
        function (e) {
          C = e;
        },
        function (e) {
          h = e;
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
          r = e;
        },
        function (e) {
          n = e;
        },
        function (e) {
          k = e;
        },
        function (e) {
          a = e;
        },
        function (e) {
          o = e;
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
      ],
      execute: function () {
        var e;
        (0,
          ((e = D || t("ProjectileState", (D = {})))[(e.Travel = 0)] = "Travel"),
          (e[(e.Impact = 1)] = "Impact"),
          (e[(e.Detonation = 2)] = "Detonation"),
          (l = class extends i.GameObject {
            get fromObject() {
              return this._fromObject;
            }
            set fromObject(e) {
              (this._fromObject = e) &&
                e.veteranTrait &&
                !e.isDestroyed &&
                (this.veteranDamageMult = e.veteranTrait.getVeteranDamageMultiplier());
            }
            get rot() {
              return this.fromWeapon.rules.isSonic ? a.ObjectRules.iniRotToDegsPerTick(this.iniRot) : this.rules.rot;
            }
            get iniRot() {
              return this.fromWeapon.rules.isSonic ? 10 : this.rules.iniRot;
            }
            static factory(e, t, i, r) {
              return new this(e, t, i, r);
            }
            constructor(e, t, i, r) {
              (super(s.ObjectType.Projectile, e, t, i),
                (this.tileOccupation = r),
                (this.state = D.Travel),
                (this.detonationTimer = 0),
                (this.collisionType = B.CollisionType.None),
                (this.direction = 0),
                (this.zone = c.ZoneType.Air),
                (this.isShrapnel = !1),
                (this.isNuke = !1),
                (this.baseDamageMultiplier = 1),
                (this.veteranDamageMult = 1),
                (this.snapToTarget = !1),
                (this.targetLockLost = !1),
                (this.limboTravelTicks = 0),
                (this.homingTravelDistance = 0),
                (this.homingTravelTicks = 0),
                (this.velocity = new j.Vector3()),
                (this.sonicVisitedObjects = new Map()),
                (this.collisionHelper = new o.CollisionHelper(r)));
            }
            onSpawn(a) {
              var e;
              if (
                (super.onSpawn(a),
                (this.initialSelfPosition = this.position.worldPosition.clone()),
                !this.target.obj ||
                  this.fromWeapon.type === v.WeaponType.DeathWeapon ||
                  this.fromWeapon.rules.limboLaunch ||
                  (!this.isHoming() && this.fromWeapon.speed === Number.POSITIVE_INFINITY) ||
                  this.rules.inaccurate ||
                  this.rules.arcing ||
                  this.rules.flakScatter ||
                  (0 < (e = this.computeBaseDamage(a)) &&
                    ((e = this.fromWeapon.warhead.computeDamage(e, this.target.obj, a)),
                    this.target.obj.healthTrait?.projectDamage(e))),
                a.afterTick(() => {
                  let e = new C.RangeHelper(this.tileOccupation);
                  var t = e.distance2(this.target.getWorldCoords(), this) / w.Coords.LEPTONS_PER_TILE;
                  ((this.initialTileDistToTarget = t),
                    (this.maxSpeed = this.computeMaxSpeed(this.fromWeapon.speed, t, a.rules.audioVisual.gravity)));
                }),
                this.isHoming())
              ) {
                if (
                  (1 === this.iniRot &&
                    (this.homingMoveDir = this.target.getWorldCoords().clone().sub(this.position.worldPosition)),
                  this.fromObject?.isAircraft() && this.rules.isAntiGround && !this.rules.isAntiAir)
                ) {
                  let e = this.target.obj;
                  !e?.isVehicle() ||
                    e.isDestroyed ||
                    e.veteranLevel !== r.VeteranLevel.Elite ||
                    e.unitOrderTrait.hasTasks() ||
                    e.unitOrderTrait.addTask(new n.ScatterTask(a));
                }
              } else if (this.rules.vertical) {
                let e = this.position.clone();
                ((e.tileElevation = this.fromWeapon.warhead.rules.nukeMaker
                  ? w.Coords.worldToTileHeight(this.fromWeapon.projectileRules.detonationAltitude)
                  : 0),
                  (this.aimPoint = e.worldPosition.clone()));
              } else {
                let s = this.target.getWorldCoords().clone();
                a.afterTick(() => {
                  let e = this.target.getWorldCoords().clone().sub(s);
                  var t = e.length() > w.Coords.LEPTONS_PER_TILE;
                  let i = t
                    ? s
                    : this.target.obj?.isUnit() &&
                        this.target.obj.moveTrait.velocity.length() &&
                        isFinite(this.maxSpeed)
                      ? this.computeAimPointVersusMovingTarget(
                          this.target.obj,
                          this.maxSpeed,
                          this.position.worldPosition,
                          a.map,
                        )
                      : this.target.getWorldCoords().clone();
                  ((this.aimPoint = i),
                    (this.snapToTarget = !t && isFinite(this.maxSpeed) && !this.fromWeapon.warhead.rules.sonic),
                    (this.rules.inaccurate || this.rules.flakScatter) &&
                      (this.adjustAimForBallisticScatter(a, i), (this.snapToTarget = !1)),
                    !t &&
                      this.rules.arcing &&
                      (this.rules.inaccurate
                        ? ((this.overshootTiles = this.calculateInaccurateBallisticOvershoot(a)),
                          (this.snapToTarget = !1))
                        : this.target.obj?.isVehicle() &&
                          this.target.obj.moveTrait.isMoving() &&
                          ((this.overshootTiles = this.calculateBallisticOvershootVsMoving(a, this.target.obj)),
                          this.overshootTiles && (this.snapToTarget = !1))));
                  let r = i.clone().sub(this.position.worldPosition);
                  r.length() < this.fromWeapon.speed && this.update(a);
                });
              }
            }
            adjustAimForBallisticScatter(e, t) {
              let i = e.rules.combatDamage.ballisticScatter,
                r;
              r = this.rules.flakScatter
                ? (this.rules.inviso && (i *= 2), e.generateRandom() * i)
                : i / 2 + e.generateRandom() * (i / 2);
              let s = r * w.Coords.LEPTONS_PER_TILE;
              this.rules.flakScatter &&
                ((n = t.clone().sub(this.initialSelfPosition).length()),
                (s *= n / (this.fromWeapon.range * w.Coords.LEPTONS_PER_TILE)));
              var a = x.rotateVec2(new N.Vector2(s, 0), e.generateRandomInt(0, 360)),
                n = w.Coords.vecWorldToGround(t)
                  .add(a)
                  .multiplyScalar(1 / w.Coords.LEPTONS_PER_TILE)
                  .floor();
              e.map.tiles.getByMapCoords(n.x, n.y) && t.add(new j.Vector3(a.x, 0, a.y));
            }
            calculateBallisticOvershootVsMoving(e, t) {
              let i = this.target.getWorldCoords().clone().sub(this.initialSelfPosition);
              var r = w.Coords.vecWorldToGround(i),
                s = w.Coords.vecWorldToGround(t.moveTrait.velocity),
                r = x.angleDegBetweenVec2(r, s),
                s = (90 < r ? 180 - r : r) / 90,
                r = i.length() / w.Coords.LEPTONS_PER_TILE,
                s = (s * r) / 5;
              return e.generateRandom() <= s ? 2 * Math.min(1, r / 5) : 0;
            }
            calculateInaccurateBallisticOvershoot(e) {
              return e.generateRandom() <= 0.5 ? 2 : 0;
            }
            update(o) {
              if (void 0 !== this.maxSpeed)
                if ((super.update(o), this.state !== D.Impact)) {
                  var s = this.velocity.clone(),
                    l = this.position.clone();
                  if ((this.velocity.set(0, 0, 0), this.fromWeapon.rules.limboLaunch)) {
                    if (!this.fromObject) throw new Error("Limbo launch projectile must be fired from a unit");
                    if (this.fromObject.isDestroyed) return void o.destroyObject(this);
                  }
                  var c = this.updateSpeed(this.maxSpeed);
                  this.speed = c;
                  let n = this.target.getWorldCoords();
                  if (
                    (this.lastTargetLockPosition &&
                    (this.targetLockLost ||
                      n.clone().sub(this.lastTargetLockPosition).length() >= w.Coords.LEPTONS_PER_TILE)
                      ? ((n = this.lastTargetLockPosition), (this.targetLockLost = !0))
                      : (this.lastTargetLockPosition = n.clone()),
                    this.isHoming())
                  ) {
                    if (
                      this.target.obj?.isUnit() &&
                      (this.target.obj.isDestroyed || this.target.obj.isCrashing || !this.target.obj.isSpawned) &&
                      (this.fromWeapon.rules.limboLaunch || this.homingTravelDistance >= 2 * w.Coords.LEPTONS_PER_TILE)
                    )
                      return void this.detonate(o);
                    if (
                      (this.homingMoveDir ||
                        ((u = S.FacingUtil.toMapCoords(this.direction)),
                        (this.homingMoveDir = new j.Vector3(u.x, 0, u.y)),
                        this.fromObject?.isAircraft() &&
                          ((this.homingMoveDir.y = -9999999), this.homingMoveDir.normalize())),
                      this.fromWeapon.rules.limboLaunch)
                    ) {
                      if (!this.targetLockLost) {
                        if (10 < this.limboTravelTicks)
                          return (
                            this.position.moveToLeptons(this.target.obj.position.getMapPosition()),
                            (this.position.tileElevation = this.target.obj.position.tileElevation),
                            void this.detonate(o)
                          );
                        this.limboTravelTicks++;
                      }
                    } else if (!this.isInHomingRange(n, o)) return void this.detonate(o);
                    let e = new C.RangeHelper(this.tileOccupation);
                    var h = Math.floor(e.distance2(n, this) / w.Coords.LEPTONS_PER_TILE),
                      u = 2 < h && 1 < this.iniRot;
                    let t = n.clone().sub(this.position.worldPosition),
                      i = 0;
                    (this.homingTravelTicks < this.rules.courseLockDuration ||
                      (u
                        ? (x.rotateVec3Towards(
                            this.homingMoveDir,
                            new j.Vector3(t.x, this.homingMoveDir.y, t.z),
                            this.rot,
                          ),
                          this.rules.level ||
                            ((h = A.clamp(Math.floor(this.initialTileDistToTarget) - 1, 0, 2) + A.clamp(h - 2, 0, 3)),
                            (d = this.tileOccupation.getBridgeOnTile(this.tile)?.tileElevation ?? 0),
                            (d = h - (this.position.tileElevation - d)) &&
                              ((g = 0.25 + (6 / this.iniRot) * 0.1),
                              (i = w.Coords.tileHeightToWorld(Math.sign(d) * Math.min(Math.abs(d), g))))))
                        : x.rotateVec3Towards(this.homingMoveDir, t, this.rot)),
                      (this.direction = S.FacingUtil.fromMapCoords(
                        new N.Vector2(this.homingMoveDir.x, this.homingMoveDir.z),
                      )));
                    var d = t.length(),
                      g = Math.min(d, c);
                    ((this.homingTravelDistance += g), this.homingTravelTicks++);
                    let r = !1,
                      s = B.CollisionType.None,
                      a;
                    if (d >= w.Coords.LEPTONS_PER_TILE / 4) {
                      let e = this.homingMoveDir.clone().setLength(g);
                      (i && (e.y += i), g === c && this.velocity.copy(e));
                      var p = e.clone().add(this.position.worldPosition);
                      o.map.mapBounds.isWithinHardBounds(p) ? this.position.moveByLeptons3(e) : (r = !0);
                      var m = this.checkObstacles(l, o);
                      if (((s = m.type), (a = m.target), s)) r = !0;
                      else {
                        let e = n.clone().sub(this.position.worldPosition);
                        var f = e.length();
                        d < f && f < 2 * w.Coords.LEPTONS_PER_TILE && (r = !0);
                      }
                    } else (o.map.isWithinHardBounds(n) && this.position.moveByLeptons3(t), (r = !0));
                    if (r) {
                      if (a && s === B.CollisionType.Wall) {
                        let e = a.position.worldPosition;
                        this.position.moveByLeptons3(e.clone().sub(this.position.worldPosition));
                      }
                      ((this.collisionType = s), this.detonate(o, s));
                    }
                  } else {
                    let t = this.aimPoint.clone().sub(this.position.worldPosition);
                    (this.rules.vertical || (this.direction = S.FacingUtil.fromMapCoords(new N.Vector2(t.x, t.z))),
                      this.rules.arcing && (t.y = 0));
                    p = Math.min(t.length(), c);
                    if ((t.setLength(p), this.rules.arcing)) {
                      let e = w.Coords.vecWorldToGround(
                        this.position.worldPosition.clone().sub(this.initialSelfPosition).add(t),
                      );
                      var m = this.aimPoint.clone().sub(this.initialSelfPosition),
                        a = e.length(),
                        d = w.Coords.vecWorldToGround(m).length(),
                        f = m.y,
                        m = o.rules.audioVisual.gravity;
                      d &&
                        (t.y =
                          (((f / d) * c + ((m / 2) * d) / c) * a) / c -
                          (m * (a / c) * (a / c)) / 2 +
                          this.initialSelfPosition.y -
                          this.position.worldPosition.y);
                    }
                    let e = !1;
                    a = t.clone().add(this.position.worldPosition);
                    o.map.isWithinHardBounds(a) ? this.position.moveByLeptons3(t) : (e = !0);
                    let i = B.CollisionType.None,
                      r;
                    if (
                      (1 <= p
                        ? ((p !== c && !this.overshootTiles) || this.velocity.copy(t),
                          (l = this.checkObstacles(l, o)),
                          (i = l.type),
                          (r = l.target),
                          (i || p < c) && (e = !0))
                        : (e = !0),
                      e)
                    ) {
                      if (i) {
                        if (r && i === B.CollisionType.Wall) {
                          let e = r.isBuilding()
                            ? w.Coords.tile3dToWorld(r.tile.rx + 0.5, r.tile.ry + 0.5, r.tile.z)
                            : r.position.worldPosition;
                          this.position.moveByLeptons3(e.clone().sub(this.position.worldPosition));
                        }
                      } else if (this.overshootTiles) {
                        var y = w.Coords.vecWorldToGround(s).setLength(this.overshootTiles * w.Coords.LEPTONS_PER_TILE);
                        if (
                          (x.rotateVec2(y, o.generateRandomInt(-45, 45)),
                          (a = w.Coords.vecGroundToWorld(y).add(this.position.worldPosition)),
                          !o.map.isWithinHardBounds(a))
                        )
                          return void o.unspawnObject(this);
                        this.position.moveByLeptons(y.x, y.y);
                      } else if (this.snapToTarget && !this.targetLockLost) {
                        if (!o.map.isWithinHardBounds(n)) return void o.unspawnObject(this);
                        this.position.moveByLeptons3(n.clone().sub(this.position.worldPosition));
                      }
                      ((this.collisionType = i),
                        this.isNuke
                          ? ((this.state = D.Impact), (this.detonationTimer = 2.5 * I.GameSpeed.BASE_TICKS_PER_SECOND))
                          : this.fromWeapon.rules.isDiskLaser && !this.isHoming() && !this.rules.inaccurate
                            ? ((this.state = D.Impact),
                              (this.detonationTimer = Math.max(
                                1,
                                Math.floor(this.fromWeapon.rules.laserDuration * 0.7),
                              )))
                            : this.detonate(o, i));
                    }
                  }
                  let e = this.fromWeapon.warhead;
                  if (e.rules.sonic) {
                    var t,
                      i,
                      y = (11 / 30) * w.Coords.LEPTONS_PER_TILE,
                      y = this.position.worldPosition.clone().add(this.velocity.clone().setLength(y)),
                      y = w.Coords.vecWorldToGround(y)
                        .multiplyScalar(1 / w.Coords.LEPTONS_PER_TILE)
                        .floor(),
                      r = o.map.tiles.getByMapCoords(y.x, y.y);
                    if (r && r !== this.fromObject?.tile) {
                      var T,
                        v = o.map.getTileZone(r);
                      for (T of o.map.getGroundObjectsOnTile(r))
                        if (
                          (!T.isUnit() || !T.onBridge) &&
                          (!T.isTechno() ||
                            !T.rules.typeImmune ||
                            T.owner !== this.fromPlayer ||
                            T.name !== this.fromObject?.name) &&
                          (!T.isAircraft() || !T.rules.spawned) &&
                          e.canDamage(T, r, v)
                        ) {
                          let e = this.sonicVisitedObjects.get(T) ?? new Set();
                          (e.add(r), this.sonicVisitedObjects.set(T, e));
                        }
                    }
                    for ([t, i] of this.sonicVisitedObjects)
                      for (var b of i)
                        o.map.tileOccupation.isTileOccupiedBy(b, t) &&
                          t.isSpawned &&
                          ((b =
                            this.fromWeapon.rules.ambientDamage * this.veteranDamageMult * this.baseDamageMultiplier),
                          (b = e.computeDamage(b, t, o)),
                          e.inflictDamage(
                            b,
                            t,
                            { player: this.fromPlayer, weapon: this.fromWeapon, obj: this.fromObject },
                            o,
                            t !== this.target.obj,
                          ));
                  }
                } else 0 < this.detonationTimer ? this.detonationTimer-- : this.detonate(o, this.collisionType);
            }
            isHoming() {
              return !!this.rot && !this.rules.arcing;
            }
            isInHomingRange(t, i) {
              let r = !0,
                s = this.target.obj;
              if (s?.isUnit() && this.fromObject) {
                let e = new C.RangeHelper(this.tileOccupation);
                var a,
                  n = e.computeWeaponRangeVsTarget(this.fromObject, s, this.fromWeapon, i.rules).range;
                this.fromWeapon.rules.limboLaunch
                  ? (r = e.isInRange3(this.initialSelfPosition, t, 0, n + 0.5))
                  : (a = s.moveTrait.velocity.length()) &&
                    (this.fromObject.rules.movementZone === M.MovementZone.Fly
                      ? 5 < this.speed / a &&
                        (r = e.isInRange2(this.initialSelfPosition, this.position.worldPosition, 0, n))
                      : isFinite(this.fromWeapon.speed) &&
                        3.5 < this.fromWeapon.speed / s.rules.speed &&
                        (r = e.isInRange3(this.initialSelfPosition, this.position.worldPosition, 0, n)));
              }
              return r;
            }
            updateSpeed(e) {
              let t;
              return (
                (t =
                  this.isHoming() || this.rules.vertical
                    ? void 0 === this.speed
                      ? Math.min(e, this.rules.acceleration)
                      : Math.min(e, this.speed + this.rules.acceleration)
                    : e),
                t
              );
            }
            computeMaxSpeed(e, t, i) {
              let r = e;
              return (
                this.rules.arcing &&
                  ((r *= (1 + i / 6) / 2), (t = Math.floor(t)), (r *= t <= 8 ? 1 : 1 + (t / 8) * 0.5)),
                this.fromWeapon.warhead.rules.sonic && (r = Math.ceil((t * w.Coords.LEPTONS_PER_TILE) / 21)),
                r
              );
            }
            checkObstacles(e, t) {
              return this.fromWeapon.rules.limboLaunch
                ? { type: B.CollisionType.None }
                : this.collisionHelper.checkCollisions(this.position, e, {
                    cliffs: this.rules.subjectToCliffs,
                    ground: this.isHoming(),
                    shore: this.rules.level,
                    walls: this.rules.subjectToWalls,
                    units:
                      !this.rules.inaccurate &&
                      ((e) => this.fromPlayer !== e && !t.alliances.areAllied(this.fromPlayer, e)),
                  });
            }
            computeBaseDamage(e) {
              var t = this.fromWeapon,
                i = t.warhead;
              let r = t.rules.damage;
              t.type === v.WeaponType.DeathWeapon && i.rules.ivanBomb && (r = e.rules.combatDamage.ivanDamage);
              let s = r * this.baseDamageMultiplier;
              return (
                t.type === v.WeaponType.DeathWeapon &&
                  this.fromObject &&
                  (s *= this.fromObject.rules.deathWeaponDamageModifier),
                (s *= this.veteranDamageMult),
                s
              );
            }
            detonate(o, e = B.CollisionType.None) {
              var i = this.fromWeapon;
              let r = i.warhead;
              var t,
                s = (this.zone = this.collisionHelper.computeDetonationZone(this.tile, this.tileElevation, e));
              let l = this.tile;
              i.type === v.WeaponType.DeathWeapon &&
                r.rules.ivanBomb &&
                (r = new k.Warhead(o.rules.getWarhead(o.rules.combatDamage.ivanWarhead)));
              let a = this.computeBaseDamage(o);
              (o.destroyObject(this), (this.state = D.Detonation));
              let n = this.target.obj,
                c = !1;
              if (r.rules.parasite && n?.isUnit() && l === n.tile && r.canDamage(n, l, s))
                if (n.isInfantry()) a = Number.POSITIVE_INFINITY;
                else if (n.parasiteableTrait && this.fromObject?.isUnit()) {
                  if (!(this.fromWeapon instanceof T.Weapon))
                    throw new Error("Projectile with parasite warhead must have a weapon reference");
                  (n.parasiteableTrait.infest(this.fromObject, this.fromWeapon), (c = !0));
                }
              let h = !0;
              if (
                (c && (h = !1),
                r.rules.sonic && (h = !1),
                r.rules.ivanBomb &&
                  ((h = !1),
                  !n?.isTechno() ||
                    !n.tntChargeTrait ||
                    n.tntChargeTrait.hasCharge() ||
                    n.isDestroyed ||
                    n.warpedOutTrait.isInvulnerable() ||
                    ((t = o.rules.combatDamage.ivanTimedDelay),
                    n.tntChargeTrait.setCharge(t, o.currentTick, { player: this.fromPlayer, obj: this.fromObject }))),
                r.rules.bombDisarm &&
                  ((h = !1),
                  n?.isTechno() && n.tntChargeTrait?.hasCharge() && !n.isDestroyed && n.tntChargeTrait.removeCharge()),
                r.rules.mindControl &&
                  ((h = !1),
                  this.fromObject &&
                    !this.fromObject.isDestroyed &&
                    n?.isTechno() &&
                    n.mindControllableTrait &&
                    !n.mindControllableTrait?.isActive() &&
                    // OpenYRWeb: harvesters (Harvester=yes) cannot be mind-controlled in vanilla YR.
                    !n.rules.harvester &&
                    !o.areFriendly(n, this.fromObject) &&
                    r.canDamage(n, l, s) &&
                    !n.invulnerableTrait.isActive() &&
                    // OpenYRWeb: mind control respects Verses. Controller has 0% against building
                    // armors (Yuri Clone/Mastermind cannot control buildings); ControllerBuilding
                    // has 100% (Yuri X can control buildings).
                    0 < r.rules.verses.get(n.rules.armor) &&
                    this.fromObject.mindControllerTrait.control(n, o)),
                r.rules.temporal &&
                  ((h = !1),
                  this.fromObject &&
                    !this.fromObject.isDestroyed &&
                    n?.isTechno() &&
                    r.canDamage(n, l, s) &&
                    !n.invulnerableTrait.isActive() &&
                    (r.inflictDamage(0, n, { player: this.fromPlayer, weapon: i, obj: this.fromObject }, o),
                    this.fromObject.temporalTrait.updateTarget(n, i, o))),
                r.rules.makesDisguise &&
                  ((h = !1),
                  this.fromObject &&
                    !this.fromObject.isDestroyed &&
                    (this.fromObject.isInfantry() || this.fromObject.isVehicle()) &&
                    n?.isUnit() &&
                    n.type === this.fromObject.type &&
                    this.fromObject.disguiseTrait?.disguiseAs(n, this.fromObject, o)),
                r.rules.electricAssault &&
                  (this.fromObject?.isUnit() &&
                    !this.fromObject.isDestroyed &&
                    n?.isBuilding() &&
                    !n.isDestroyed &&
                    n.overpoweredTrait &&
                    n.owner === this.fromPlayer &&
                    n.overpoweredTrait.chargeFrom(this.fromObject),
                  (h = !1)),
                h &&
                  r.detonate(
                    o,
                    a,
                    l,
                    this.tileElevation,
                    this.position.worldPosition,
                    s,
                    e,
                    this.target,
                    { player: this.fromPlayer, weapon: i, obj: this.fromObject },
                    this.isShrapnel ? L.SpecialWarheadType.Shrapnel : L.SpecialWarheadType.None,
                    this.impactAnim,
                  ),
                r.rules.nukeMaker)
              ) {
                let e;
                ((e = this.fromObject
                  ? ((u = T.Weapon.factory(T.Weapon.NUKE_PAYLOAD_NAME, v.WeaponType.Primary, this.fromObject, o.rules)),
                    o.createProjectile(u.projectileRules.name, this.fromObject, u, this.target, !1))
                  : o.createLooseProjectile(T.Weapon.NUKE_PAYLOAD_NAME, this.fromPlayer, this.target)),
                  (e.isNuke = !0),
                  (e.impactAnim = "NUKEBALL"));
                var u = this.target.tile;
                (e.position.moveToTileCoords(u.rx + 0.5, u.ry + 0.5),
                  (e.position.tileElevation = this.position.tileElevation),
                  o.spawnObject(e, u));
              }
              if (
                this.rules.shrapnelCount &&
                this.rules.shrapnelWeapon &&
                ((this.target.obj
                  ? !this.target.obj.isBuilding()
                  : o.map.getGroundObjectsOnTile(this.target.tile).some((e) => e.isTerrain() || e.isTechno()) &&
                    !i.projectileRules.isAntiAir) ||
                  this.isShrapnel)
              ) {
                let t = o.rules.getWeapon(this.rules.shrapnelWeapon);
                var d,
                  g = o.rules.getProjectile(t.projectile);
                let e = this.rules.shrapnelCount,
                  i = new C.RangeHelper(o.map.tileOccupation),
                  r = new E.RadialTileFinder(
                    o.map.tiles,
                    o.map.mapBounds,
                    l,
                    { width: 1, height: 1 },
                    1,
                    t.range,
                    (e) => i.isInTileRange(l, e, t.minimumRange, t.range),
                  ),
                  s = new Set();
                for (; 0 < Math.floor(e);) {
                  var p,
                    m = r.getNextTile();
                  if (!m) break;
                  for (p of o.map.tileOccupation
                    .getObjectsOnTileByLayer(m, g.isAntiAir ? b.LayerType.Air : b.LayerType.Ground)
                    .filter(
                      (e) =>
                        o.isValidTarget(e) &&
                        (e.isTerrain() ||
                          (e.isTechno() &&
                            e.owner !== this.fromPlayer &&
                            !o.alliances.areAllied(e.owner, this.fromPlayer) &&
                            !(e.isInfantry() && e.stance === R.StanceType.Paradrop))),
                    ))
                    if (
                      !s.has(p) &&
                      (s.add(p), (e = Math.max(0, e - 1 - (p.isTechno() ? 0.5 : 0))), Math.floor(e) <= 0)
                    )
                      break;
                }
                for (d of s) {
                  var f = o.createTarget(d.isTerrain() ? void 0 : d, d.tile);
                  this.createShrapnel(o, f, t.name);
                }
                e = Math.floor(e);
                let a = new O.RandomTileFinder(o.map.tiles, o.map.mapBounds, l, t.range, o, (e) =>
                  i.isInTileRange(l, e, t.minimumRange, t.range),
                );
                for (let n = 0; n < e; n++) {
                  var y = a.getNextTile();
                  if (!y) break;
                  y = o.createTarget(void 0, y);
                  this.createShrapnel(o, y, t.name);
                }
              }
              if (i.rules.limboLaunch && !c && this.fromObject?.isUnit()) {
                let s = this.fromObject;
                r.rules.parasite &&
                  (this.target.obj.isVehicle() || this.target.obj?.isAircraft()) &&
                  this.target.obj.parasiteableTrait &&
                  (this.target.obj.parasiteableTrait.beingBoarded = !1);
                let t, a;
                i = s.rules.movementZone === M.MovementZone.Fly;
                if (i) ((t = l), (a = !1));
                else {
                  let i =
                      this.target.obj.isUnit() && this.target.obj.tile.onBridgeLandType && !this.target.obj.onBridge
                        ? void 0
                        : o.map.tileOccupation.getBridgeOnTile(l),
                    r = new P.MovePositionHelper(o.map),
                    e = new E.RadialTileFinder(o.map.tiles, o.map.mapBounds, l, { width: 1, height: 1 }, 0, 1, (e) => {
                      var t = o.map.tileOccupation.getBridgeOnTile(e);
                      return (
                        0 < o.map.terrain.getPassableSpeed(e, s.rules.speedType, s.isInfantry(), !!t) &&
                        r.isEligibleTile(e, t, i, l) &&
                        (e === l || !o.map.terrain.findObstacles({ tile: e, onBridge: i }, s).length)
                      );
                    });
                  ((t = e.getNextTile()), (a = !!t?.onBridgeLandType));
                }
                t
                  ? (!i &&
                      this.target.obj.isUnit() &&
                      ((s.onBridge = a),
                      (s.position.tileElevation = a
                        ? (o.map.tileOccupation.getBridgeOnTile(t)?.tileElevation ?? 0)
                        : 0)),
                    o.unlimboObject(s, t),
                    s.isInfantry() && (s.position.subCell = this.target.obj.position.subCell),
                    (s.direction = this.direction))
                  : s.owner.removeOwnedObject(s);
              }
            }
            createShrapnel(e, t, i) {
              let r = e.createLooseProjectile(i, this.fromPlayer, t);
              ((r.isShrapnel = !0),
                (r.veteranDamageMult = this.veteranDamageMult),
                r.position.moveToLeptons(this.position.getMapPosition()),
                (r.position.tileElevation = this.position.tileElevation),
                e.spawnObject(r, r.position.tile));
            }
            computeAimPointVersusMovingTarget(t, e, i, r) {
              let s = t.position.worldPosition,
                a = s.clone();
              var n = e,
                o = t.moveTrait.velocity.length();
              if (n < 3 * o) return s.clone();
              let l = h.TargetUtil.computeInterceptPoint(i, n, s, t.moveTrait.velocity);
              if (l.length()) {
                let e = l.clone().sub(s);
                ((n = e.length()), (o = o), (n = o ? Math.ceil(n / o) : 0));
                if (((l = s.clone().add(e.setLength(n * o))), r.isWithinHardBounds(l)))
                  if (t.zone !== c.ZoneType.Air) {
                    l.multiplyScalar(1 / w.Coords.LEPTONS_PER_TILE);
                    let e = t.position.clone();
                    (e.moveToTileCoords(l.x, l.z), (a = e.worldPosition));
                  } else a = l;
                else a = s;
              }
              return a.clone();
            }
          }),
          t("Projectile", l));
      },
    };
  },
);
