// === Reconstructed SystemJS module: game/gameobject/trait/HealthTrait ===
// deps: ["util/math","game/gameobject/trait/interface/NotifyDamage","game/trait/interface/NotifyHealthChange","game/event/InflictDamageEvent","game/gameobject/trait/interface/NotifyHealthChange","game/gameobject/trait/interface/NotifyHeal","game/gameobject/unit/HealthLevel","game/gameobject/trait/interface/NotifyTick","game/event/HealthChangeEvent"]
// Note: variable/type names are minified approximations of the original TypeScript.

System.register(
  "game/gameobject/trait/HealthTrait",
  [
    "util/math",
    "game/gameobject/trait/interface/NotifyDamage",
    "game/trait/interface/NotifyHealthChange",
    "game/event/InflictDamageEvent",
    "game/gameobject/trait/interface/NotifyHealthChange",
    "game/gameobject/trait/interface/NotifyHeal",
    "game/gameobject/unit/HealthLevel",
    "game/gameobject/trait/interface/NotifyTick",
    "game/event/HealthChangeEvent",
  ],
  function (e, t) {
    "use strict";
    var i, a, r, n, s, o, l, c, h, u;
    t && t.id;
    return {
      setters: [
        function (e) {
          i = e;
        },
        function (e) {
          a = e;
        },
        function (e) {
          r = e;
        },
        function (e) {
          n = e;
        },
        function (e) {
          s = e;
        },
        function (e) {
          o = e;
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
      ],
      execute: function () {
        ((u = class {
          get health() {
            return this._computedHealth;
          }
          set health(e) {
            (this.setHitPoints(0 < e ? Math.max(1, Math.floor((e * this.maxHitPoints) / 100)) : 0),
              (this.projectedHitPoints = this.hitPoints));
          }
          get level() {
            return this.health > 100 * this.conditionYellow
              ? l.HealthLevel.Green
              : this.health > 100 * this.conditionRed
                ? l.HealthLevel.Yellow
                : l.HealthLevel.Red;
          }
          constructor(e, t, i, r) {
            ((this.maxHitPoints = e),
              (this.gameObject = t),
              (this.conditionYellow = i),
              (this.conditionRed = r),
              this.setHitPoints(e),
              (this.projectedHitPoints = this.hitPoints));
          }
          setHitPoints(e) {
            if (e !== Math.floor(e)) throw new Error(`Value ${e} is not an integer`);
            ((this.hitPoints = i.clamp(e, 0, this.maxHitPoints)),
              (this._computedHealth = (this.hitPoints / this.maxHitPoints) * 100));
          }
          getHitPoints() {
            return this.hitPoints;
          }
          getProjectedHitPoints() {
            return this.projectedHitPoints;
          }
          inflictDamage(t, i, r) {
            var e = this.hitPoints,
              s = this.health;
            (this.applyHitPoints(e - t, r),
              e !== this.hitPoints &&
                0 < t &&
                (this.gameObject.traits.filter(a.NotifyDamage).forEach((e) => {
                  e[a.NotifyDamage.onDamage](this.gameObject, r, t, i);
                }),
                r.events.dispatch(new n.InflictDamageEvent(this.gameObject, i, t, this.health, s))));
          }
          healBy(e, i, r) {
            if (e < 0) throw new Error("Can't heal by negative value " + e);
            if (this.hitPoints < this.maxHitPoints) {
              var s = this.hitPoints;
              (this.applyHitPoints(this.hitPoints + e, r), (this.projectedHitPoints = this.hitPoints));
              let t = this.hitPoints - s;
              this.gameObject.traits.filter(o.NotifyHeal).forEach((e) => {
                e[o.NotifyHeal.onHeal]?.(this.gameObject, r, t, i);
              });
            }
          }
          healToFull(i, r) {
            if (this.hitPoints < this.maxHitPoints) {
              var e = this.hitPoints;
              (this.applyHitPoints(this.maxHitPoints, r), (this.projectedHitPoints = this.hitPoints));
              let t = this.hitPoints - e;
              this.gameObject.traits.filter(o.NotifyHeal).forEach((e) => {
                e[o.NotifyHeal.onHeal]?.(this.gameObject, r, t, i);
              });
            }
          }
          applyHitPoints(e, t) {
            let i = this.health;
            (this.setHitPoints(e),
              i !== this.health &&
                (t.traits.filter(r.NotifyHealthChange).forEach((e) => {
                  e[r.NotifyHealthChange.onChange](this.gameObject, t, i);
                }),
                this.gameObject.traits.filter(s.NotifyHealthChange).forEach((e) => {
                  e[s.NotifyHealthChange.onChange](this.gameObject, t, i);
                }),
                t.events.dispatch(new h.HealthChangeEvent(this.gameObject, this.health, i))));
          }
          projectDamage(e) {
            if (e < 0) throw new Error("Projected damage must be positive");
            this.projectedHitPoints = Math.max(-30, this.projectedHitPoints - e);
          }
          [c.NotifyTick.onTick](e, t) {
            t.currentTick % 4 == 0 && (this.projectedHitPoints = Math.min(this.projectedHitPoints + 1, this.hitPoints));
          }
          getHash() {
            return this.hitPoints;
          }
          debugGetState() {
            return { hitPoints: this.hitPoints };
          }
          dispose() {
            this.gameObject = void 0;
          }
        }),
          e("HealthTrait", u));
      },
    };
  },
);
