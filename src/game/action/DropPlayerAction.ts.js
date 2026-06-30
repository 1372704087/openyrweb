// === Reconstructed SystemJS module: game/action/DropPlayerAction ===
// deps: ["game/action/Action","game/action/ActionType","game/event/PlayerDroppedEvent"]
// Note: variable/type names are minified approximations of the original TypeScript.

System.register(
  "game/action/DropPlayerAction",
  ["game/action/Action", "game/action/ActionType", "game/event/PlayerDroppedEvent"],
  function (e, t) {
    "use strict";
    var i, r, s, a;
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
      ],
      execute: function () {
        ((a = class extends i.Action {
          constructor(e, t) {
            (super(r.ActionType.DropPlayer), (this.game = e), (this.localPlayerName = t));
          }
          process() {
            if (this.localPlayerName !== this.player.name) {
              let e = this.player;
              var t;
              e.defeated ||
                ((t = this.game.redistributeAllPlayerAssets(e)),
                this.game.removeAllPlayerAssets(e),
                (e.dropped = !0),
                this.game.events.dispatch(new s.PlayerDroppedEvent(e, t)));
            }
          }
        }),
          e("DropPlayerAction", a));
      },
    };
  },
);
