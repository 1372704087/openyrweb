// === Reconstructed SystemJS module: gui/screen/game/worldInteraction/keyboard/command/SelectNextUnitCmd ===
// deps: ["util/disposable/CompositeDisposable"]
// Note: variable/type names are minified approximations of the original TypeScript.

System.register(
  "gui/screen/game/worldInteraction/keyboard/command/SelectNextUnitCmd",
  ["util/disposable/CompositeDisposable"],
  function (e, t) {
    "use strict";
    var n, i;
    t && t.id;
    return {
      setters: [
        function (e) {
          n = e;
        },
      ],
      execute: function () {
        e(
          "SelectNextUnitCmd",
          (i = class {
            constructor(e, t, i, r, s) {
              ((this.unitSelectionHandler = e),
                (this.mapPanningHelper = t),
                (this.cameraPan = i),
                (this.player = r),
                (this.world = s),
                (this.reverse = !1),
                (this.unitList = []),
                (this.disposables = new n.CompositeDisposable()));
              const a = (e) => {
                e.isTechno() && e.owner === r && this.unitList.push(e);
              };
              (this.world.onObjectSpawned.subscribe(a),
                this.disposables.add(() => this.world.onObjectSpawned.unsubscribe(a)));
            }
            getNextUnit() {
              return (this.generator || (this.generator = this.generate()), this.generator.next().value);
            }
            *generate() {
              for (;;) {
                let i = (this.unitList = this.player
                  .getOwnedObjects()
                  .filter((e) => e.isUnit())
                  .sort(
                    (e, t) =>
                      e.tile.dx +
                      1e3 * e.tile.dy -
                      (t.tile.dx + 1e3 * t.tile.dy) +
                      0.1 * (t.position.subCell - e.position.subCell),
                  ));
                if (i.length) {
                  let e = this.reverse ? i.length : -1,
                    t = this.unitSelectionHandler.getSelectedUnits();
                  var r;
                  for (
                    1 < t.length && t[0].isUnit() && -1 !== (r = i.indexOf(t[0])) && (e = r);
                    this.reverse ? 0 <= --e : ++e < i.length;
                  ) {
                    if (this.unitSelectionHandler.getHash() !== this.lastSelectionHash) {
                      this.lastSelectionHash = this.unitSelectionHandler.getHash();
                      break;
                    }
                    var s = i[e];
                    s.owner === this.player && s.isSpawned && (yield s);
                  }
                } else yield void 0;
              }
            }
            setReverse(e) {
              this.reverse = e;
            }
            execute() {
              var e = this.getNextUnit();
              e &&
                (this.unitSelectionHandler.selectSingleUnit(e),
                (this.lastSelectionHash = this.unitSelectionHandler.getHash()),
                (e = e.tile),
                (e = this.mapPanningHelper.computeCameraPanFromTile(e.rx, e.ry)),
                this.cameraPan.setPan(e));
            }
            dispose() {
              this.disposables.dispose();
            }
          }),
        );
      },
    };
  },
);
