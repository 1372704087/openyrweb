// === Reconstructed SystemJS module: game/PlayerList ===
// deps: ["game/SideType"]
// Note: variable/type names are minified approximations of the original TypeScript.

System.register("game/PlayerList", ["game/SideType"], function (e, t) {
  "use strict";
  var i, r;
  t && t.id;
  return {
    setters: [
      function (e) {
        i = e;
      },
    ],
    execute: function () {
      e(
        "PlayerList",
        (r = class {
          constructor() {
            this.players = [];
          }
          addPlayer(e) {
            this.players.push(e);
          }
          getPlayerAt(e) {
            if (e >= this.players.length) throw new RangeError(`Player #${e} out of bounds`);
            return this.players[e];
          }
          getPlayerByName(t) {
            var e = this.players.find((e) => e.name === t);
            if (!e) throw new Error(`Player with name "${t}" not found`);
            return e;
          }
          getPlayerNumber(e) {
            var t = this.players.indexOf(e);
            if (-1 === t) throw new Error(`Player ${e.name} not found`);
            return t;
          }
          getCombatants() {
            return this.players.filter((e) => e.isCombatant());
          }
          getNonNeutral() {
            return this.players.filter((e) => !e.isNeutral);
          }
          getCivilian() {
            return this.players.find((e) => e.country?.side === i.SideType.Civilian);
          }
          getAll() {
            return this.players;
          }
        }),
      );
    },
  };
});
