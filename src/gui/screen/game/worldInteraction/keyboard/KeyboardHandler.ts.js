// === Reconstructed SystemJS module: gui/screen/game/worldInteraction/keyboard/KeyboardHandler ===
// deps: ["gui/screen/game/worldInteraction/keyboard/KeyCommandType","gui/screen/game/worldInteraction/keyboard/KeyCommand"]
// Note: variable/type names are minified approximations of the original TypeScript.

System.register(
  "gui/screen/game/worldInteraction/keyboard/KeyboardHandler",
  ["gui/screen/game/worldInteraction/keyboard/KeyCommandType", "gui/screen/game/worldInteraction/keyboard/KeyCommand"],
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
        (e(
          "KeyboardHandler",
          (s = class s {
            constructor(e, t) {
              ((this.keyBinds = e), (this.devMode = t), (this.commands = new Map()), (this.isPaused = !1));
            }
            registerCommand(e, t) {
              if (this.commands.has(e)) throw new Error("Duplicate command " + e);
              this.commands.set(e, t);
            }
            unregisterCommand(e) {
              this.commands.delete(e);
            }
            executeCommand(e) {
              let t = this.commands.get(e);
              t &&
                !this.isPaused &&
                ("function" == typeof t
                  ? t()
                  : t.triggerMode !== r.TriggerMode.KeyDownUp
                    ? t.execute(t.triggerMode === r.TriggerMode.KeyUp)
                    : (t.execute(!1), t.execute(!0)));
            }
            handleKeyDown(i) {
              if (
                ("Backspace" === i.key && (i.preventDefault(), i.stopPropagation()),
                !(i.repeat || (["F5", "F12"].includes(i.key) && this.devMode)))
              ) {
                let t = this.keyBinds.getCommandType(i);
                if ((void 0 === t && (t = this.getNoModCmdType(i.keyCode)), void 0 !== t)) {
                  (i.preventDefault(), i.stopPropagation());
                  let e = this.commands.get(t);
                  e &&
                    !this.isPaused &&
                    ("function" == typeof e ? e() : e.triggerMode !== r.TriggerMode.KeyUp && e.execute(!1));
                }
              }
            }
            handleKeyUp(e) {
              if ("Alt" === e.key) (e.preventDefault(), e.stopPropagation());
              else if (!this.isPaused) {
                let t = this.keyBinds.getCommandType(e);
                if ((void 0 === t && (t = this.getNoModCmdType(e.keyCode)), void 0 !== t)) {
                  let e = this.commands.get(t);
                  !e ||
                    "function" == typeof e ||
                    (e.triggerMode !== r.TriggerMode.KeyUp && e.triggerMode !== r.TriggerMode.KeyDownUp) ||
                    e.execute(!0);
                }
              }
            }
            getNoModCmdType(e) {
              var t = this.keyBinds.getCommandType({ keyCode: e, altKey: !1, ctrlKey: !1, shiftKey: !1, metaKey: !1 });
              if (t) {
                var i = this.commands.get(t);
                if (i && "function" != typeof i && s.anyModifierCommands.includes(t)) return t;
              }
            }
            pause() {
              this.isPaused = !0;
            }
            unpause() {
              this.isPaused = !1;
            }
            dispose() {
              this.commands.clear();
            }
          }),
        ),
          (s.anyModifierCommands = [i.KeyCommandType.PlanningMode]));
      },
    };
  },
);
