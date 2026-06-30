// === Reconstructed SystemJS module: game/gameobject/trait/AirSpawnTrait ===
// deps: ["game/Coords","engine/type/ObjectType","game/Warhead","game/gameobject/unit/CollisionType","game/gameobject/task/move/MoveTask","game/gameobject/task/system/CallbackTask","game/gameobject/task/system/TaskGroup","game/gameobject/unit/FacingUtil","game/gameobject/trait/interface/NotifyDestroy","game/gameobject/trait/interface/NotifyOwnerChange","game/gameobject/trait/interface/NotifySpawn","game/gameobject/trait/interface/NotifyTeleport","game/gameobject/trait/interface/NotifyTick","game/gameobject/trait/interface/NotifyUnspawn","game/gameobject/trait/interface/NotifyWarpChange","game/gameobject/unit/ZoneType"]
// Note: variable/type names are minified approximations of the original TypeScript.

System.register(
  "game/gameobject/trait/AirSpawnTrait",
  [
    "game/Coords",
    "engine/type/ObjectType",
    "game/Warhead",
    "game/gameobject/unit/CollisionType",
    "game/gameobject/task/move/MoveTask",
    "game/gameobject/task/system/CallbackTask",
    "game/gameobject/task/system/TaskGroup",
    "game/gameobject/unit/FacingUtil",
    "game/gameobject/trait/interface/NotifyDestroy",
    "game/gameobject/trait/interface/NotifyOwnerChange",
    "game/gameobject/trait/interface/NotifySpawn",
    "game/gameobject/trait/interface/NotifyTeleport",
    "game/gameobject/trait/interface/NotifyTick",
    "game/gameobject/trait/interface/NotifyUnspawn",
    "game/gameobject/trait/interface/NotifyWarpChange",
    "game/gameobject/unit/ZoneType",
  ],
  function (e, t) {
    "use strict";
    var c, h, l, u, d, g, p, m, i, r, s, a, n, o, f, y, T;
    t && t.id;
    return {
      setters: [
        function (e) {
          c = e;
        },
        function (e) {
          h = e;
        },
        function (e) {
          l = e;
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
          m = e;
        },
        function (e) {
          i = e;
        },
        function (e) {
          r = e;
        },
        function (e) {
          s = e;
        },
        function (e) {
          a = e;
        },
        function (e) {
          n = e;
        },
        function (e) {
          o = e;
        },
        function (e) {
          f = e;
        },
        function (e) {
          y = e;
        },
      ],
      execute: function () {
        ((T = class {
          constructor() {
            ((this.spawns = []), (this.storage = []), (this.missileLaunches = []), (this.nextRegenTicks = []));
          }
          get availableSpawns() {
            return this.storage.length;
          }
          debugSetStorage(e, t) {
            ((this.storage.length = t), this.storage.fill(e, 0, t));
          }
          isLaunchingMissiles() {
            return 0 < this.missileLaunches.length;
          }
          [s.NotifySpawn.onSpawn](e, t) {
            var i = t.rules.getObject(e.rules.spawns, h.ObjectType.Aircraft);
            for (let r = 0; r < e.rules.spawnsNumber; r++) this.pushNewSpawn(i, t, e);
          }
          [o.NotifyUnspawn.onUnspawn](e, t) {
            this.destroySpawns(e, t);
          }
          [i.NotifyDestroy.onDestroy](e, t, i, r) {
            this.destroySpawns(e, t, i, r);
          }
          pushNewSpawn(e, t, i) {
            let r = t.createUnitForPlayer(e, i.owner);
            ((r.limboData = { selected: !1, controlGroup: void 0 }),
              e.missileSpawn && (r.pitch = 90 * t.rules.general.getMissileRules(e.name).pitchInitial),
              this.spawns.push(r),
              this.storage.push(r));
          }
          destroySpawns(e, t, i, r) {
            for (var s of this.spawns)
              s.isDestroyed ||
                (s.isSpawned && !s.rules.missileSpawn && s.crashableTrait
                  ? s.crashableTrait.crash(i)
                  : (s.isSpawned ||
                      (s.armedTrait && (s.armedTrait.deathWeapon = void 0),
                      (s.position.tileElevation = e.position.tileElevation),
                      (s.zone = e.isUnit() ? e.zone : y.ZoneType.Ground),
                      (s.onBridge = !!e.isUnit() && e.onBridge),
                      (s.position.tile = e.tile)),
                    t.destroyObject(s, i, r)));
            ((this.spawns.length = 0), (this.storage.length = 0), (this.missileLaunches.length = 0));
          }
          [n.NotifyTick.onTick](r, s) {
            var t;
            if (
              ((this.spawns = this.spawns.filter((e) => !e.isDestroyed)),
              (this.missileLaunches = this.missileLaunches.filter((e) => !e.missile.isDestroyed)),
              this.spawns.length < r.rules.spawnsNumber)
            ) {
              var i = r.rules.spawnsNumber - this.spawns.length,
                a = s.rules.getObject(r.rules.spawns, h.ObjectType.Aircraft);
              for (let e = 0; e < i; e++)
                (a.missileSpawn && e && void 0 === this.nextRegenTicks[e]
                  ? (this.nextRegenTicks[e] = this.nextRegenTicks[0])
                  : ((t = this.nextRegenTicks)[e] ?? (t[e] = r.rules.spawnRegenRate),
                    0 < this.nextRegenTicks[e] && this.nextRegenTicks[e]--),
                  this.nextRegenTicks[e] <= 0 && this.pushNewSpawn(a, s, r));
              this.nextRegenTicks = this.nextRegenTicks.filter((e) => 0 < e);
            }
            if (this.storage.length) {
              if (
                (this.nextReloadTicks ?? (this.nextReloadTicks = r.rules.spawnReloadRate),
                0 < this.nextReloadTicks && this.nextReloadTicks--,
                this.nextReloadTicks <= 0)
              ) {
                for (var e of this.storage) e.ammoTrait && e.ammoTrait.ammo < e.ammoTrait.maxAmmo && e.ammoTrait.ammo++;
                this.nextReloadTicks = r.rules.spawnReloadRate;
              }
            } else this.nextReloadTicks = void 0;
            for (let l of this.missileLaunches.slice()) {
              var n = s.rules.general.getMissileRules(l.missile.name);
              if (
                (l.pauseFrames ?? (l.pauseFrames = n.pauseFrames),
                0 < l.pauseFrames && l.pauseFrames--,
                l.pauseFrames <= 0)
              ) {
                var o = 90 * n.pitchFinal,
                  n = (90 * (n.pitchFinal - n.pitchInitial)) / n.tiltFrames;
                let i = l.missile;
                if (i.pitch < o) i.pitch = Math.min(o, i.pitch + n);
                else {
                  i.unitOrderTrait.addTask(
                    new p.TaskGroup(
                      new d.MoveTask(s, l.targetTile, !!l.targetBridge),
                      new g.CallbackTask(() => {
                        var e, t;
                        i.isDestroyed ||
                          (s.unspawnObject(i),
                          i.dispose(),
                          (t = c.Coords.vecGroundToWorld(m.FacingUtil.toMapCoords(i.direction).multiplyScalar(1))),
                          (e = l.targetWorldPos.clone().add(t)),
                          (t = s.map.getTileZone(l.targetTile)),
                          l.warhead.detonate(
                            s,
                            l.damage,
                            l.targetTile,
                            l.targetBridge?.tileElevation ?? 0,
                            e,
                            t,
                            l.targetBridge ? u.CollisionType.OnBridge : u.CollisionType.None,
                            l.target,
                            { player: i.owner, obj: r, weapon: void 0 },
                          ));
                      }),
                    ).setCancellable(!1),
                  );
                  n = this.spawns.indexOf(i);
                  if (-1 === n) throw new Error("Missile not found in spawns list");
                  (this.spawns.splice(n, 1), this.missileLaunches.splice(this.missileLaunches.indexOf(l), 1));
                }
              }
            }
          }
          [r.NotifyOwnerChange.onChange](e, t, i) {
            for (var r of this.spawns) r.isDestroyed || i.changeObjectOwner(r, e.owner);
          }
          [f.NotifyWarpChange.onChange](e, t, i) {
            i && this.removeMissileLaunches(t);
          }
          [a.NotifyTeleport.onBeforeTeleport](e, t, i, r) {
            r || this.removeMissileLaunches(t);
          }
          removeMissileLaunches(e) {
            if (this.missileLaunches.length) {
              for (var t of this.missileLaunches) {
                (e.unspawnObject(t.missile), t.missile.dispose());
                t = this.spawns.indexOf(t.missile);
                if (-1 === t) throw new Error("Missile not found in spawns list");
                this.spawns.splice(t, 1);
              }
              this.missileLaunches.length = 0;
            }
          }
          prepareLaunch(r, s, a) {
            if (this.storage.length) {
              let i = this.storage[0];
              if (!i.ammo) return;
              if ((this.storage.shift(), i.missileSpawnTrait)) {
                let e, t;
                var n = r.veteranTrait?.isElite(),
                  o = a.rules;
                if (r.rules.spawns === o.general.v3Rocket.type)
                  ((e = n ? o.combatDamage.v3EliteWarhead : o.combatDamage.v3Warhead),
                    (t = n ? o.general.v3Rocket.eliteDamage : o.general.v3Rocket.damage));
                else {
                  if (r.rules.spawns !== o.general.dMisl.type)
                    throw new Error(`Unhandled missile type "${r.rules.spawns}"`);
                  ((e = n ? o.combatDamage.dMislEliteWarhead : o.combatDamage.dMislWarhead),
                    (t = n ? o.general.dMisl.eliteDamage : o.general.dMisl.damage));
                }
                o = new l.Warhead(a.rules.getWarhead(e));
                (i.missileSpawnTrait.setDamage(t).setWarhead(o).setLauncher(r),
                  this.missileLaunches.push({
                    missile: i,
                    targetTile: (s.obj?.isUnit() ? s.obj : s).tile,
                    targetBridge: s.getBridge(),
                    targetWorldPos: s.getWorldCoords().clone(),
                    target: s,
                    warhead: o,
                    damage: t,
                    pauseFrames: void 0,
                  }));
              } else {
                if (!i.spawnLinkTrait) throw new Error(`Aircraft "${i.name}" must have Spawned=yes to be launchable`);
                i.spawnLinkTrait.setParent(r);
              }
              return i;
            }
          }
          storeAircraft(e, t) {
            if (!this.spawns.includes(e))
              throw new Error(`Object "${e.name}#${e.id}" not found in list of linked spawns`);
            if (e.limboData) throw new Error(`Object "${e.name}#${e.id}" is already in limbo`);
            (t.limboObject(e, { selected: !1, controlGroup: void 0 }), this.storage.push(e));
          }
        }),
          e("AirSpawnTrait", T));
      },
    };
  },
);
