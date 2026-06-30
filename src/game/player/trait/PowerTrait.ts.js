// === Reconstructed SystemJS module: game/player/trait/PowerTrait ===
// deps: ["game/event/PowerLowEvent","game/event/PowerRestoreEvent","game/event/PowerChangeEvent","game/trait/interface/NotifyPower","util/math"]
// Note: variable/type names are minified approximations of the original TypeScript.

System.register(
  "game/player/trait/PowerTrait",
  [
    "game/event/PowerLowEvent",
    "game/event/PowerRestoreEvent",
    "game/event/PowerChangeEvent",
    "game/trait/interface/NotifyPower",
    "util/math",
  ],
  function (t, e) {
    "use strict";
    var i, r, n, o, s, a, l;
    e && e.id;
    return {
      setters: [
        function (e) {
          i = e;
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
          s = e;
        },
      ],
      execute: function () {
        var e;
        (((e = a || t("PowerLevel", (a = {})))[(e.Low = 0)] = "Low"),
          (e[(e.Normal = 1)] = "Normal"),
          t(
            "PowerTrait",
            (l = class {
              constructor(e) {
                ((this.player = e),
                  (this.power = 0),
                  (this.drain = 0),
                  (this.level = a.Normal),
                  (this.blackoutFrames = 0),
                  (this.powerByObject = new Map()));
              }
              isLowPower() {
                return this.level === a.Low;
              }
              setBlackoutFor(e, t) {
                var i = 0 < this.blackoutFrames;
                ((this.blackoutFrames = e), i || this.updateLevel(t));
              }
              updateBlackout(e) {
                0 < this.blackoutFrames && (this.blackoutFrames--, this.blackoutFrames <= 0 && this.updateLevel(e));
              }
              getBlackoutDuration() {
                return this.blackoutFrames;
              }
              updateFrom(t, i, r) {
                var s = t.rules.power;
                if (s) {
                  if (s < 0) ("add" !== i && "remove" !== i) || (this.drain += "add" === i ? -s : s);
                  else {
                    let e = 0;
                    if ("add" === i) {
                      var a = Math.ceil((s * t.healthTrait.health) / 100);
                      (this.powerByObject.set(t, a), (e = a));
                    } else if ("update" === i || "remove" === i) {
                      a = this.powerByObject.get(t);
                      if (void 0 === a) throw new Error("Cannot update power before add.");
                      e =
                        "update" === i
                          ? ((s = Math.ceil((s * t.healthTrait.health) / 100)), this.powerByObject.set(t, s), s - a)
                          : (this.powerByObject.delete(t), -a);
                    }
                    this.power += e;
                  }
                  (this.updateLevel(r),
                    r.traits.filter(o.NotifyPower).forEach((e) => {
                      e[o.NotifyPower.onPowerChange](this.player, r);
                    }),
                    r.events.dispatch(new n.PowerChangeEvent(this.player, this.power, this.drain)));
                }
              }
              updateLevel(t) {
                var e = this.level;
                ((this.level = this.power >= this.drain && !this.blackoutFrames ? a.Normal : a.Low),
                  this.level !== e &&
                    (e === a.Normal &&
                      this.level === a.Low &&
                      (t.traits.filter(o.NotifyPower).forEach((e) => {
                        e[o.NotifyPower.onPowerLow](this.player, t);
                      }),
                      t.events.dispatch(new i.PowerLowEvent(this.player))),
                    e === a.Low &&
                      this.level === a.Normal &&
                      (t.traits.filter(o.NotifyPower).forEach((e) => {
                        e[o.NotifyPower.onPowerRestore](this.player, t);
                      }),
                      t.events.dispatch(new r.PowerRestoreEvent(this.player)))));
              }
              getHash() {
                return s.fnv32a([this.power, this.drain]);
              }
              debugGetState() {
                return { power: this.power, drain: this.drain };
              }
              dispose() {
                ((this.player = void 0), this.powerByObject.clear());
              }
            }),
          ));
      },
    };
  },
);
