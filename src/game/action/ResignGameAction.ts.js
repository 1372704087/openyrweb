// === Reconstructed SystemJS module: game/action/ResignGameAction ===
// deps: ["game/action/Action","game/event/PlayerResignedEvent","game/action/ActionType"]
// Note: variable/type names are minified approximations of the original TypeScript.

System.register(
  "game/action/ResignGameAction",
  ["game/action/Action", "game/event/PlayerResignedEvent", "game/action/ActionType"],
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
            (super(s.ActionType.ResignGame), (this.game = e), (this.localPlayerName = t));
          }
          process() {
            if (this.localPlayerName !== this.player.name) {
              let e = this.player;
              var t = this.game.redistributeAllPlayerAssets(e);
              (this.game.removeAllPlayerAssets(e),
                e.isCombatant() && ((e.resigned = !0), this.game.events.dispatch(new r.PlayerResignedEvent(e, t))));
            }
          }
        }),
          e("ResignGameAction", a));
      },
    };
  },
);
