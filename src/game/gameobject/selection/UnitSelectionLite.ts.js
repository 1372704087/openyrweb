// === Reconstructed SystemJS module: game/gameobject/selection/UnitSelectionLite ===
// deps: []
// Note: variable/type names are minified approximations of the original TypeScript.

System.register("game/gameobject/selection/UnitSelectionLite", [], function (e, t) {
  "use strict";
  var i;
  t && t.id;
  return {
    setters: [],
    execute: function () {
      e(
        "UnitSelectionLite",
        (i = class {
          constructor(e) {
            ((this.player = e), (this.selectedUnits = new Set()));
          }
          update(e) {
            var t,
              i = [...e].reverse().find((e) => e.owner !== this.player);
            (i && (e = [i]), this.selectedUnits.clear());
            for (t of e) t.rules.selectable && this.selectedUnits.add(t);
          }
          getSelectedUnits() {
            return [...this.selectedUnits]
              .map((e) => (e.isDisposed && e.replacedBy ? e.replacedBy : e))
              .filter((e) => !e.isDestroyed && !e.isCrashing);
          }
          isSelected(e) {
            return this.selectedUnits.has(e);
          }
        }),
      );
    },
  };
});
