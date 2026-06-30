// === Reconstructed SystemJS module: game/action/ObserveGameAction ===
// deps: ["game/action/Action","game/event/PlayerResignedEvent","game/action/ActionType","game/event/PlayerDefeatedEvent","game/event/RadarOnOffEvent"]
// Note: variable/type names are minified approximations of the original TypeScript.

System.register(
  "game/action/ObserveGameAction",
  [
    "game/action/Action",
    "game/event/PlayerResignedEvent",
    "game/action/ActionType",
    "game/event/PlayerDefeatedEvent",
    "game/event/RadarOnOffEvent",
  ],
  function (e, t) {
    "use strict";
    var i, r, s, a, n, o;
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
      ],
      execute: function () {
        ((o = class extends i.Action {
          constructor(e) {
            (super(s.ActionType.ObserveGame), (this.game = e));
          }
          process() {
            let e = this.player;
            var t;
            (this.game.removeAllPlayerAssets(e),
              !e.isCombatant() ||
                e.defeated ||
                e.isObserver ||
                ((e.resigned = !0),
                (e.defeated = !0),
                (e.isObserver = !0),
                this.game.events.dispatch(new r.PlayerResignedEvent(e)),
                this.game.events.dispatch(new a.PlayerDefeatedEvent(e)),
                this.game.mapShroudTrait.getPlayerShroud(e)?.revealAll(),
                (t = e.radarTrait.isDisabled()),
                e.radarTrait.setDisabled(!1),
                t && this.game.events.dispatch(new n.RadarOnOffEvent(e, !0))));
          }
        }),
          e("ObserveGameAction", o));
      },
    };
  },
);
