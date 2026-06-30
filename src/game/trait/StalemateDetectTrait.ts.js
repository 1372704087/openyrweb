// === Reconstructed SystemJS module: game/trait/StalemateDetectTrait ===
// deps: ["game/event/StalemateDetectEvent","game/GameSpeed","game/trait/interface/NotifyDestroy","game/trait/interface/NotifyOwnerChange","game/trait/interface/NotifyPlaceBuilding","game/trait/interface/NotifyProduceUnit","game/trait/interface/NotifyTick"]
// Note: variable/type names are minified approximations of the original TypeScript.

System.register(
  "game/trait/StalemateDetectTrait",
  [
    "game/event/StalemateDetectEvent",
    "game/GameSpeed",
    "game/trait/interface/NotifyDestroy",
    "game/trait/interface/NotifyOwnerChange",
    "game/trait/interface/NotifyPlaceBuilding",
    "game/trait/interface/NotifyProduceUnit",
    "game/trait/interface/NotifyTick",
  ],
  function (e, t) {
    "use strict";
    var r, i, s, a, n, o, l, c;
    t && t.id;
    return {
      setters: [
        function (e) {
          r = e;
        },
        function (e) {
          i = e;
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
          l = e;
        },
      ],
      execute: function () {
        ((c = class c {
          constructor() {
            ((this.stale = !1), (this.allPlayersCredits = new Map()), this.resetCountdown());
          }
          isStale() {
            return this.stale;
          }
          getCountdownTicks() {
            return this.countdownTicks;
          }
          resetCountdown() {
            this.countdownTicks = Math.floor(60 * c.graceMinutes * i.GameSpeed.BASE_TICKS_PER_SECOND);
          }
          clearStale() {
            ((this.stale = !1), this.resetCountdown());
          }
          [l.NotifyTick.onTick](e) {
            0 < this.countdownTicks
              ? this.countdownTicks--
              : this.stale ||
                ((this.stale = !0), this.resetCountdown(), e.events.dispatch(new r.StalemateDetectEvent()));
            for (var t of e.getCombatants()) {
              var i = this.allPlayersCredits.get(t);
              i !== t.credits &&
                (this.allPlayersCredits.set(t, t.credits),
                t.credits > (i ?? 0) && t.production.hasAnyFactory() && this.clearStale());
            }
          }
          [o.NotifyProduceUnit.onProduce]() {
            this.clearStale();
          }
          [n.NotifyPlaceBuilding.onPlace](e) {
            e.wallTrait || this.clearStale();
          }
          [s.NotifyDestroy.onDestroy](e, t, i) {
            !e.isBuilding() ||
              e.owner.isNeutral ||
              e.wallTrait ||
              e.rules.insignificant ||
              (e.owner.defeated && this.stale) ||
              (i?.obj && t.areFriendly(e, i.obj)) ||
              this.clearStale();
          }
          [a.NotifyOwnerChange.onChange](e, t, i) {
            e.isBuilding() && !t.isNeutral && (i.alliances.areAllied(e.owner, t) || this.clearStale());
          }
        }),
          e("StalemateDetectTrait", c),
          (c.graceMinutes = 10));
      },
    };
  },
);
