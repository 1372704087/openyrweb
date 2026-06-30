// === Reconstructed SystemJS module: game/action/ToggleAllianceAction ===
// deps: ["game/action/Action","game/Alliances","game/event/AllianceChangeEvent","game/trait/interface/NotifyAllianceChange","game/action/ActionType"]
// Note: variable/type names are minified approximations of the original TypeScript.

System.register(
  "game/action/ToggleAllianceAction",
  [
    "game/action/Action",
    "game/Alliances",
    "game/event/AllianceChangeEvent",
    "game/trait/interface/NotifyAllianceChange",
    "game/action/ActionType",
  ],
  function (e, t) {
    "use strict";
    var i, o, l, c, r, s;
    t && t.id;
    return {
      setters: [
        function (e) {
          i = e;
        },
        function (e) {
          o = e;
        },
        function (e) {
          l = e;
        },
        function (e) {
          c = e;
        },
        function (e) {
          r = e;
        },
      ],
      execute: function () {
        ((s = class extends i.Action {
          constructor(e) {
            (super(r.ActionType.ToggleAlliance), (this.game = e));
          }
          unserialize(e) {
            ((this.toPlayer = this.game.getPlayer(e[0])), (this.toggle = Boolean(e[1])));
          }
          serialize() {
            return new Uint8Array([this.game.getPlayerNumber(this.toPlayer), this.toggle ? 1 : 0]);
          }
          print() {
            return `Toggle alliance ${this.toggle ? "on" : "off"} with ` + this.toPlayer.name;
          }
          process() {
            var e = this.game.rules.mpDialogSettings;
            if (e.alliesAllowed && e.allyChangeAllowed) {
              var a,
                n = this.player,
                t = this.toPlayer,
                e = this.toggle;
              let i = n,
                r = t,
                s = this.game.alliances;
              if (!n.defeated && s.canRequestAlliance(r)) {
                let t = s.findByPlayers(i, r);
                t
                  ? t.status === o.AllianceStatus.Formed
                    ? e || (s.breakAlliance(i, r), this.game.onAllianceChange(t, i, !1))
                    : t.status === o.AllianceStatus.Requested &&
                      (t.players.first === r
                        ? e &&
                          s.canFormAlliance(i, r) &&
                          (s.acceptRequest(r, i),
                          this.game.onAllianceChange(t, i, !0),
                          1 !== (n = this.game.getCombatants().filter((e) => e !== i && !s.areAllied(i, e))).length ||
                            ((a = s.findByPlayers(n[0], i)) && s.cancelRequest(a.players.first, a.players.second)),
                          1 !== (a = this.game.getCombatants().filter((e) => e !== r && !s.areAllied(r, e))).length ||
                            ((a = s.findByPlayers(a[0], r)) && s.cancelRequest(a.players.first, a.players.second)))
                        : e ||
                          (s.cancelRequest(i, r),
                          this.game.events.dispatch(new l.AllianceChangeEvent(t, l.AllianceEventType.Broken, i)),
                          this.game.traits.filter(c.NotifyAllianceChange).forEach((e) => {
                            e[c.NotifyAllianceChange.onChange](t, !1, this.game);
                          })))
                  : e &&
                    s.canFormAlliance(i, r) &&
                    (e = s.request(i, r)) &&
                    this.game.events.dispatch(new l.AllianceChangeEvent(e, l.AllianceEventType.Requested, i));
              }
            }
          }
        }),
          e("ToggleAllianceAction", s));
      },
    };
  },
);
