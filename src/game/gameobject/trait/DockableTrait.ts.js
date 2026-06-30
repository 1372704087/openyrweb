// === Reconstructed SystemJS module: game/gameobject/trait/DockableTrait ===
// deps: ["game/gameobject/trait/interface/NotifyUnspawn","game/gameobject/trait/interface/NotifyOwnerChange","game/gameobject/trait/interface/NotifyTeleport"]
// Note: variable/type names are minified approximations of the original TypeScript.

System.register(
  "game/gameobject/trait/DockableTrait",
  [
    "game/gameobject/trait/interface/NotifyUnspawn",
    "game/gameobject/trait/interface/NotifyOwnerChange",
    "game/gameobject/trait/interface/NotifyTeleport",
  ],
  function (e, t) {
    "use strict";
    var i, r, s, a;
    t && t.id;
    return {
      setters: [
        function (e) {
          i = e;
        },
        function (e) {
          r = e;
        },
        function (e) {
          s = e;
        },
      ],
      execute: function () {
        ((a = class {
          [i.NotifyUnspawn.onUnspawn](e) {
            (this.undock(e), this.reservedDock?.dockTrait.unreserveDockForUnit(e));
          }
          [r.NotifyOwnerChange.onChange](e) {
            (e.owner !== this.dock?.owner && this.undock(e),
              e.owner !== this.reservedDock?.owner && this.reservedDock?.dockTrait.unreserveDockForUnit(e));
          }
          [s.NotifyTeleport.onBeforeTeleport](e, t, i, r) {
            r || (this.undock(e), this.reservedDock?.dockTrait.unreserveDockForUnit(e));
          }
          undock(e) {
            this.dock && !this.dock.isDisposed && this.dock.dockTrait.undockUnit(e);
          }
          dispose() {
            ((this.dock = void 0), (this.reservedDock = void 0));
          }
        }),
          e("DockableTrait", a));
      },
    };
  },
);
