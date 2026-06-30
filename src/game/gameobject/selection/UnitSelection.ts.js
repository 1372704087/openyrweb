// === Reconstructed SystemJS module: game/gameobject/selection/UnitSelection ===
// deps: ["game/gameobject/selection/SelectionModel","util/math"]
// Note: variable/type names are minified approximations of the original TypeScript.

System.register(
  "game/gameobject/selection/UnitSelection",
  ["game/gameobject/selection/SelectionModel", "util/math"],
  function (e, t) {
    "use strict";
    var i, r, s;
    t && t.id;
    return {
      setters: [
        function (e) {
          i = e;
        },
        function (e) {
          r = e;
        },
      ],
      execute: function () {
        e(
          "UnitSelection",
          (s = class {
            constructor() {
              ((this.selectedUnits = new Set()),
                (this.selectionModelsByUnit = new Map()),
                (this.groups = new Map()),
                (this.hashNeedsUpdate = !0));
            }
            getOrCreateSelectionModel(e) {
              let t = this.selectionModelsByUnit.get(e);
              return (t || ((t = new i.SelectionModel(e)), this.selectionModelsByUnit.set(e, t)), t);
            }
            deselectAll() {
              (this.selectedUnits.forEach((e) => this.selectionModelsByUnit.get(e)?.setSelected(!1)),
                this.selectedUnits.clear(),
                (this.hashNeedsUpdate = !0));
            }
            addToSelection(e) {
              (this.selectedUnits.add(e),
                this.getOrCreateSelectionModel(e).setSelected(!0),
                (this.hashNeedsUpdate = !0));
            }
            removeFromSelection(e) {
              (e.forEach((e) => {
                (this.selectedUnits.delete(e), this.getOrCreateSelectionModel(e).setSelected(!1));
              }),
                (this.hashNeedsUpdate = !0));
            }
            getSelectedUnits() {
              return [...this.selectedUnits].filter(
                (e) => !e.isDestroyed && !e.isCrashing && !e.isDisposed && e.isSpawned,
              );
            }
            isSelected(e) {
              return this.selectedUnits.has(e);
            }
            cleanupUnit(e) {
              (this.selectionModelsByUnit.delete(e),
                this.selectedUnits.delete(e),
                this.removeUnitsFromGroup([e]),
                (this.hashNeedsUpdate = !0));
            }
            updateHash() {
              this.hash = r.fnv32a([...this.selectedUnits].map((e) => e.id));
            }
            getHash() {
              return (this.hashNeedsUpdate && (this.updateHash(), (this.hashNeedsUpdate = !1)), this.hash);
            }
            createGroup(e) {
              this.addUnitsToGroup(e, this.getSelectedUnits());
            }
            addUnitsToGroup(e, t, i = !0) {
              this.removeUnitsFromGroup(t);
              let r = this.groups.get(e);
              (r || ((r = new Set()), this.groups.set(e, r)),
                i &&
                  ([...r.values()].forEach((e) => this.selectionModelsByUnit.get(e)?.setControlGroupNumber(void 0)),
                  r.clear()));
              for (var s of t) (r.add(s), this.getOrCreateSelectionModel(s).setControlGroupNumber(e));
            }
            addGroupToSelection(e) {
              if (this.groups.has(e)) for (var t of [...this.groups.get(e)]) this.addToSelection(t);
            }
            selectGroup(e) {
              (this.deselectAll(), this.addGroupToSelection(e));
            }
            getGroupUnits(e) {
              return [...(this.groups.get(e) ?? [])];
            }
            removeUnitsFromGroup(e) {
              for (var t of this.groups.values())
                for (var i of e) (t.delete(i), this.selectionModelsByUnit.get(i)?.setControlGroupNumber(void 0));
            }
          }),
        );
      },
    };
  },
);
