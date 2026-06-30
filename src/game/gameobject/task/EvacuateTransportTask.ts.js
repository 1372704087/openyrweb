// === Reconstructed SystemJS module: game/gameobject/task/EvacuateTransportTask ===
// deps: ["game/event/LeaveTransportEvent","game/gameobject/unit/FacingUtil","game/gameobject/unit/MovePositionHelper","game/gameobject/task/move/MoveTask","game/gameobject/task/ScatterTask","game/gameobject/task/system/Task","game/gameobject/task/TurnTask","game/gameobject/task/system/WaitMinutesTask","game/gameobject/unit/ZoneType","game/gameobject/task/system/CallbackTask","game/gameobject/task/system/WaitTicksTask","game/GameSpeed"]
// Note: variable/type names are minified approximations of the original TypeScript.

System.register(
  "game/gameobject/task/EvacuateTransportTask",
  [
    "game/event/LeaveTransportEvent",
    "game/gameobject/unit/FacingUtil",
    "game/gameobject/unit/MovePositionHelper",
    "game/gameobject/task/move/MoveTask",
    "game/gameobject/task/ScatterTask",
    "game/gameobject/task/system/Task",
    "game/gameobject/task/TurnTask",
    "game/gameobject/task/system/WaitMinutesTask",
    "game/gameobject/unit/ZoneType",
    "game/gameobject/task/system/CallbackTask",
    "game/gameobject/task/system/WaitTicksTask",
    "game/GameSpeed",
  ],
  function (t, e) {
    "use strict";
    var a, b, r, n, o, i, l, c, h, u, d, s, g, p, m;
    e && e.id;
    return {
      setters: [
        function (e) {
          a = e;
        },
        function (e) {
          b = e;
        },
        function (e) {
          r = e;
        },
        function (e) {
          n = e;
        },
        function (e) {
          o = e;
        },
        function (e) {
          i = e;
        },
        function (e) {
          l = e;
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
          s = e;
        },
      ],
      execute: function () {
        var e;
        (((e = g = g || {})[(e.None = 0)] = "None"),
          (e[(e.OnlyPassengers = 1)] = "OnlyPassengers"),
          (e[(e.All = 2)] = "All"),
          (p = 2 * s.GameSpeed.BASE_TICKS_PER_SECOND),
          (m = class extends i.Task {
            constructor(e, t) {
              (super(),
                (this.game = e),
                (this.soft = t),
                (this.evacState = g.None),
                (this.evacTries = 0),
                (this.turnPerformed = !1),
                (this.preventLanding = !1));
            }
            forceEvac() {
              this.evacState = g.All;
            }
            onStart(e) {
              if (!e.transportTrait) throw new Error(`Object "${e.name}" is not a valid transport`);
              var t = e.transportTrait;
              0 < t.units.length &&
                (this.evacState =
                  (this.evacState !== g.OnlyPassengers && 1 !== t.units.length) || !e.rules.gunner
                    ? g.OnlyPassengers
                    : g.All);
            }
            onTick(e) {
              if (this.isCancelling() || this.evacState === g.None) return !0;
              if (e.zone === h.ZoneType.Air)
                return (this.children.push(new u.CallbackTask(() => e.zone !== h.ZoneType.Air)), !1);
              let t = e.transportTrait.units;
              if (!t.length || (e.rules.gunner && 1 === t.length && this.evacState !== g.All)) return !0;
              var i = t[t.length - 1],
                r = this.findValidEvacTarget(e, i);
              if (r && !this.turnPerformed) {
                this.turnPerformed = !0;
                var s = (r.dir + 180) % 360;
                if (e.direction !== s) return (this.children.push(new l.TurnTask(s)), !1);
              }
              return this.evacuateUnit(i, e, r)
                ? (t.pop(), this.children.push(new c.WaitMinutesTask(1 / 60)), !1)
                : !(++this.evacTries <= 3) || (this.children.push(new c.WaitMinutesTask(0.05)), !1);
            }
            evacuateUnit(e, t, i) {
              if (!i)
                return (
                  !this.soft &&
                  ((e.position.tile = t.tile),
                  (e.position.tileElevation = t.tileElevation),
                  (e.onBridge = t.onBridge),
                  (e.zone = t.zone),
                  this.game.destroyObject(e, { player: e.owner }),
                  !0)
                );
              var { spawnNode: r, moveNode: s } = i;
              return (
                (e.position.tileElevation = r.onBridge?.tileElevation ?? 0),
                (e.onBridge = !!r.onBridge),
                (e.zone = this.game.map.getTileZone(r.tile, !r.onBridge)),
                this.game.unlimboObject(e, r.tile),
                e.unitOrderTrait.unmarkNextQueuedOrder(),
                s
                  ? e.unitOrderTrait.addTask(new n.MoveTask(this.game, s.tile, !!s.onBridge))
                  : e.unitOrderTrait.addTask(new o.ScatterTask(this.game)),
                e.unitOrderTrait.addTask(new d.WaitTicksTask(p)),
                this.game.events.dispatch(new a.LeaveTransportEvent(t)),
                !0
              );
            }
            findValidEvacTarget(a, n) {
              let o = this.game.map,
                l = new r.MovePositionHelper(o);
              var c,
                h,
                u,
                d,
                g,
                e = a.onBridge ? o.tileOccupation.getBridgeOnTile(a.tile) : void 0,
                t = (a.direction + 180) % 360;
              let p;
              for (let i = 0; i <= 180; i += 45)
                for (c of i && i < 180 ? [t + i, t - i] : [t + i]) {
                  var m = b.FacingUtil.toMapCoords(c);
                  let t = a.tile,
                    i = e,
                    r;
                  for (let s = 1; s <= 2; s++) {
                    if (2 === s) {
                      if (!r) break;
                      ((t = r.tile), (i = r.onBridge));
                    }
                    var f,
                      y = a.tile.rx + Math.sign(m.x) * s,
                      T = a.tile.ry + Math.sign(m.y) * s,
                      v = o.tiles.getByMapCoords(y, T);
                    if (!v || !o.mapBounds.isWithinBounds(v)) break;
                    let e = [o.tileOccupation.getBridgeOnTile(v)];
                    e[0] && e.push(void 0);
                    for (f of e)
                      if (
                        ((h = v),
                        (u = f),
                        (d = i),
                        (g = t),
                        0 < o.terrain.getPassableSpeed(h, n.rules.speedType, n.isInfantry(), !!u) &&
                          l.isEligibleTile(h, u, d, g) &&
                          !o.terrain.findObstacles({ tile: h, onBridge: u }, n).length)
                      ) {
                        if (1 !== s) return { spawnNode: r, moveNode: { tile: v, onBridge: f }, dir: c };
                        ((r = { tile: v, onBridge: f }), (p = { spawnNode: r, moveNode: void 0, dir: c }));
                      }
                  }
                }
              if (p) return p;
            }
          }),
          t("EvacuateTransportTask", m));
      },
    };
  },
);
