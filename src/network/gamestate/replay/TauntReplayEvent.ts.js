// === Reconstructed SystemJS module: network/gamestate/replay/TauntReplayEvent ===
// deps: ["network/gamestate/replay/ReplayEvent","network/gamestate/replay/ReplayEventType"]
// Note: variable/type names are minified approximations of the original TypeScript.

System.register(
  "network/gamestate/replay/TauntReplayEvent",
  ["network/gamestate/replay/ReplayEvent", "network/gamestate/replay/ReplayEventType"],
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
        ((s = class extends i.ReplayEvent {
          constructor(e) {
            super(r.ReplayEventType.Taunt, e);
          }
          serialize() {
            return this.payload.playerId + ":" + this.payload.tauntNo;
          }
          unserialize(e) {
            var [t, i] = e.split(":"),
              t = Number(t),
              i = Number(i);
            this.payload = { playerId: t, tauntNo: i };
          }
        }),
          e("TauntReplayEvent", s));
      },
    };
  },
);
