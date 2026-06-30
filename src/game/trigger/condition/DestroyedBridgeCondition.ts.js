// === Reconstructed SystemJS module: game/trigger/condition/DestroyedBridgeCondition ===
// deps: ["game/event/EventType","game/trigger/TriggerCondition"]
// Note: variable/type names are minified approximations of the original TypeScript.

System.register(
  "game/trigger/condition/DestroyedBridgeCondition",
  ["game/event/EventType", "game/trigger/TriggerCondition"],
  function (e, t) {
    "use strict";
    var a, i, r;
    t && t.id;
    return {
      setters: [
        function (e) {
          a = e;
        },
        function (e) {
          i = e;
        },
      ],
      execute: function () {
        ((r = class extends i.TriggerCondition {
          check(s, e) {
            return e
              .filter((e) => {
                if (e.type !== a.EventType.ObjectDestroy) return !1;
                let t = e.target;
                if (!t.isOverlay() || !t.isBridge()) return !1;
                var i = t.bridgeTrait?.bridgeSpec;
                if (!i) return !1;
                let r = s.map.bridges.findAllBridgeTiles(i);
                return r.find((e) => this.targets.includes(e));
              })
              .map((e) => e.target.tile);
          }
        }),
          e("DestroyedBridgeCondition", r));
      },
    };
  },
);
