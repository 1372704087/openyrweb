// === Reconstructed SystemJS module: network/gamestate/replay/ReplayEventFactory ===
// deps: ["network/gamestate/replay/ChatMessageReplayEvent","network/gamestate/replay/ReplayEventType","network/gamestate/replay/TauntReplayEvent","network/gamestate/replay/TurnActionsReplayEvent"]
// Note: variable/type names are minified approximations of the original TypeScript.

System.register(
  "network/gamestate/replay/ReplayEventFactory",
  [
    "network/gamestate/replay/ChatMessageReplayEvent",
    "network/gamestate/replay/ReplayEventType",
    "network/gamestate/replay/TauntReplayEvent",
    "network/gamestate/replay/TurnActionsReplayEvent",
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
        e(
          "ReplayEventFactory",
          (n = class {
            constructor(e, t) {
              ((this.gameOptsParser = e), (this.gameOptsSerializer = t));
            }
            create(e, t) {
              switch (e) {
                case r.ReplayEventType.TurnActions:
                  return new a.TurnActionsReplayEvent(this.gameOptsParser, this.gameOptsSerializer, t);
                case r.ReplayEventType.ChatMessage:
                  return new i.ChatMessageReplayEvent(t);
                case r.ReplayEventType.Taunt:
                  return new s.TauntReplayEvent(t);
                default:
                  throw new Error(`Unsupported replay event type "${e}" at game tick "${t}"`);
              }
            }
          }),
        );
      },
    };
  },
);
