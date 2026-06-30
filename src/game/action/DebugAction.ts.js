// === Reconstructed SystemJS module: game/action/DebugAction ===
// deps: ["data/DataStream","game/action/Action","game/action/ActionType"]
// Note: variable/type names are minified approximations of the original TypeScript.

System.register(
  "game/action/DebugAction",
  ["data/DataStream", "game/action/Action", "game/action/ActionType"],
  function (t, e) {
    "use strict";
    var r, i, s, a, n, o;
    e && e.id;
    return {
      setters: [
        function (e) {
          r = e;
        },
        function (e) {
          i = e;
        },
        function (e) {
          s = e;
        },
      ],
      execute: function () {
        var e;
        (((e = a || t("DebugCommandType", (a = {})))[(e.SetGlobalDebugText = 0)] = "SetGlobalDebugText"),
          (e[(e.SetUnitDebugText = 1)] = "SetUnitDebugText"),
          t(
            "DebugCommand",
            (n = class {
              constructor(e, t) {
                ((this.type = e), (this.params = t));
              }
            }),
          ),
          (o = class extends i.Action {
            constructor(e) {
              (super(s.ActionType.DebugCommand), (this.game = e));
            }
            unserialize(e) {
              let t = new r.DataStream(e);
              var i = t.readUint8();
              i === a.SetUnitDebugText
                ? (this.command = new n(i, { unitId: t.readUint32(), label: t.readCString() || void 0 }))
                : i === a.SetGlobalDebugText
                  ? (this.command = new n(i, { text: t.readCString() }))
                  : console.warn(`Debug command ${i} not implemented`);
            }
            serialize() {
              let e = new r.DataStream();
              if ((e.writeUint8(this.command.type), this.command.type === a.SetUnitDebugText)) {
                var t = this.command.params;
                (e.writeUint32(t.unitId), e.writeCString(t.label || ""));
              } else {
                if (this.command.type !== a.SetGlobalDebugText)
                  throw new Error(`Debug command ${this.command.type} not implemented`);
                t = this.command.params;
                e.writeCString(t.text);
              }
              return e.toUint8Array();
            }
            process() {
              if (this.command.type === a.SetUnitDebugText) {
                var { unitId: t, label: i } = this.command.params;
                if (this.game.getWorld().hasObjectId(t)) {
                  let e = this.game.getObjectById(t);
                  e.isTechno() && (e.debugLabel = i);
                }
              } else
                this.command.type === a.SetGlobalDebugText
                  ? ((i = this.command.params["text"]), (this.game.debugText.value = i))
                  : console.warn(`Debug command ${this.command.type} not implemented`);
            }
          }),
          t("DebugAction", o));
      },
    };
  },
);
