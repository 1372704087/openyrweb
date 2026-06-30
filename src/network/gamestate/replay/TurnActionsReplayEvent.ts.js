// === Reconstructed SystemJS module: network/gamestate/replay/TurnActionsReplayEvent ===
// deps: ["data/DataStream","util/string","network/gamestate/replay/ReplayEvent","network/gamestate/replay/ReplayEventType"]
// Note: variable/type names are minified approximations of the original TypeScript.

System.register(
  "network/gamestate/replay/TurnActionsReplayEvent",
  [
    "data/DataStream",
    "util/string",
    "network/gamestate/replay/ReplayEvent",
    "network/gamestate/replay/ReplayEventType",
  ],
  function (e, t) {
    "use strict";
    var i, r, s, a, n;
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
        function (e) {
          a = e;
        },
      ],
      execute: function () {
        ((n = class extends s.ReplayEvent {
          constructor(e, t, i) {
            (super(a.ReplayEventType.TurnActions, i), (this.gameOptsParser = e), (this.gameOptsSerializer = t));
          }
          serialize() {
            let e = new i.DataStream();
            return (
              this.gameOptsSerializer.serializeAllPlayerActions(e, new Map(this.payload)),
              r.uint8ArrayToBase64String(e.toUint8Array())
            );
          }
          unserialize(e) {
            var t = new i.DataStream(r.base64StringToUint8Array(e)),
              t = this.gameOptsParser.parseAllPlayerActions(t);
            this.payload = [...t];
          }
        }),
          e("TurnActionsReplayEvent", n));
      },
    };
  },
);
