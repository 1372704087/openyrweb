// === Reconstructed SystemJS module: network/gamestate/ReplayRecorder ===
// deps: ["game/action/ActionType","network/gamestate/replay/TurnActionsReplayEvent","network/gameopt/Parser","network/gameopt/Serializer","network/gamestate/replay/ChatMessageReplayEvent","network/gamestate/replay/TauntReplayEvent"]
// Note: variable/type names are minified approximations of the original TypeScript.

System.register(
  "network/gamestate/ReplayRecorder",
  [
    "game/action/ActionType",
    "network/gamestate/replay/TurnActionsReplayEvent",
    "network/gameopt/Parser",
    "network/gameopt/Serializer",
    "network/gamestate/replay/ChatMessageReplayEvent",
    "network/gamestate/replay/TauntReplayEvent",
  ],
  function (e, t) {
    "use strict";
    var i, r, s, a, n, o, l;
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
        function (e) {
          n = e;
        },
        function (e) {
          o = e;
        },
      ],
      execute: function () {
        e(
          "ReplayRecorder",
          (l = class {
            constructor(e, t, i, r) {
              ((this.replay = e), (this.playerId = t), (this.humanPlayers = i), (this.actionSerializer = r));
            }
            recordActions(t, i) {
              if (Array.isArray(i)) {
                let e = new r.TurnActionsReplayEvent(new s.Parser(), new a.Serializer(), t);
                ((e.payload = [[this.playerId, i.map((e) => this.actionSerializer.getActionPayload(e))]]),
                  this.replay.writeEvent(e));
              } else if (this.hasActualActions(i)) {
                let e = new r.TurnActionsReplayEvent(new s.Parser(), new a.Serializer(), t);
                ((e.payload = [...i].map(([e, t]) => [e, t])), this.replay.writeEvent(e));
              }
            }
            recordChatMessage(e, t, i) {
              let r = new n.ChatMessageReplayEvent(e);
              ((r.payload = { playerId: this.humanPlayers.findIndex((e) => e.name === t), message: i }),
                this.replay.writeEvent(r));
            }
            recordTaunt(e, t, i) {
              let r = new o.TauntReplayEvent(e);
              ((r.payload = { playerId: this.humanPlayers.findIndex((e) => e.name === t), tauntNo: i }),
                this.replay.writeEvent(r));
            }
            hasActualActions(e) {
              return !![...e.values()].find((e) => e.find((e) => e.id !== i.ActionType.NoAction));
            }
          }),
        );
      },
    };
  },
);
