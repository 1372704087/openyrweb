// === Reconstructed SystemJS module: gui/screen/game/worldInteraction/keyboard/command/SelectTypeByCmd ===
// deps: ["gui/screen/game/worldInteraction/keyboard/KeyCommand","util/disposable/CompositeDisposable"]
// Note: variable/type names are minified approximations of the original TypeScript.

System.register(
  "gui/screen/game/worldInteraction/keyboard/command/SelectTypeByCmd",
  ["gui/screen/game/worldInteraction/keyboard/KeyCommand", "util/disposable/CompositeDisposable"],
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
          "SelectByTypeCmd",
          (s = class {
            constructor(e) {
              ((this.unitSelectionHandler = e),
                (this.triggerMode = i.TriggerMode.KeyDownUp),
                (this.disposables = new r.CompositeDisposable()),
                (this.handleUserSelectionUpdate = (e) => {
                  !e.queryType && this.keyDownTime && this.unitSelectionHandler.selectByType();
                }));
            }
            init() {
              (this.unitSelectionHandler.onUserSelectionUpdate.subscribe(this.handleUserSelectionUpdate),
                this.disposables.add(() =>
                  this.unitSelectionHandler.onUserSelectionUpdate.unsubscribe(this.handleUserSelectionUpdate),
                ));
            }
            execute(e) {
              var t = Date.now();
              e
                ? (this.keyDownTime && t - this.keyDownTime <= 1e3 && this.unitSelectionHandler.selectByType(),
                  (this.keyDownTime = void 0))
                : (this.keyDownTime ?? (this.keyDownTime = t));
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
