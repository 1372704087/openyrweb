// === Reconstructed SystemJS module: gui/screen/game/worldInteraction/keyboard/command/FollowUnitCmd ===
// deps: ["util/disposable/CompositeDisposable"]
// Note: variable/type names are minified approximations of the original TypeScript.

System.register(
  "gui/screen/game/worldInteraction/keyboard/command/FollowUnitCmd",
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
          "FollowUnitCmd",
          (i = class {
            constructor(e, t, i, r, s, a) {
              ((this.unitSelectionHandler = e),
                (this.renderableManager = t),
                (this.worldInteraction = i),
                (this.mapPanningHelper = r),
                (this.cameraPan = s),
                (this.worldScene = a),
                (this.disposables = new n.CompositeDisposable()),
                (this.handleUserSelectionChange = () => {
                  this.updateUnit(void 0);
                }),
                (this.handleFrame = () => {
                  let e = this.unitSelectionHandler.getSelectedUnits();
                  (this.unit && !e.includes(this.unit) && this.updateUnit(void 0),
                    this.unit && this.updatePan(this.unit));
                }));
            }
            init() {
              (this.unitSelectionHandler.onUserSelectionUpdate.subscribe(this.handleUserSelectionChange),
                this.disposables.add(() =>
                  this.unitSelectionHandler.onUserSelectionUpdate.unsubscribe(this.handleUserSelectionChange),
                ),
                this.worldScene.onBeforeCameraUpdate.subscribe(this.handleFrame),
                this.disposables.add(() => this.worldScene.onBeforeCameraUpdate.unsubscribe(this.handleFrame)));
            }
            execute() {
              let e = this.unitSelectionHandler.getSelectedUnits();
              (this.unit && !e.includes(this.unit) && this.updateUnit(void 0),
                this.updateUnit(this.unit ? void 0 : e[0]),
                this.unit && this.updatePan(this.unit));
            }
            updateUnit(e) {
              (this.unit = e) ? this.worldInteraction.pausePanning() : this.worldInteraction.unpausePanning();
            }
            updatePan(e) {
              let t = this.renderableManager.getRenderableByGameObject(e);
              var i;
              t && ((i = this.mapPanningHelper.computeCameraPanFromWorld(t.getPosition())), this.cameraPan.setPan(i));
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
