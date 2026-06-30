// === Reconstructed SystemJS module: game/Alliances ===
// deps: ["util/math"]
// Note: variable/type names are minified approximations of the original TypeScript.

System.register("game/Alliances", ["util/math"], function (t, e) {
  "use strict";
  var i, a, r, s;
  e && e.id;
  return {
    setters: [
      function (e) {
        i = e;
      },
    ],
    execute: function () {
      var e;
      ((a = class {
        constructor(e, t) {
          ((this.first = e), (this.second = t));
        }
        has(e) {
          return this.first === e || this.second === e;
        }
        equals(e) {
          return (
            (this.first === e.first && this.second === e.second) || (this.first === e.second && this.second === e.first)
          );
        }
      }),
        ((e = r || t("AllianceStatus", (r = {})))[(e.Requested = 0)] = "Requested"),
        (e[(e.Formed = 1)] = "Formed"),
        t(
          "Alliances",
          (s = class {
            constructor(e) {
              ((this.playerList = e), (this.alliances = []));
            }
            findByPlayers(e, t) {
              let i = new a(e, t);
              return this.alliances.find((e) => e.players.equals(i));
            }
            filterByPlayer(t) {
              return this.alliances.filter((e) => e.players.first === t || e.players.second === t);
            }
            request(e, t) {
              if (!this.canRequestAlliance(t)) throw new Error(`Player ${t.name} is not a human combatant.`);
              if (this.canFormAlliance(e, t)) {
                if (this.findByPlayers(e, t))
                  throw new Error(
                    "Can't request alliance because an alliance is already pending or formed between " +
                      `${e.name} and ${t.name}.`,
                  );
                return this.setAlliance(e, t, r.Requested);
              }
            }
            cancelRequest(e, t) {
              var i = this.findByPlayers(e, t);
              if (!i || i.status !== r.Requested)
                throw new Error(`There is no pending alliance request for player ${t.name} from player ` + e.name);
              if (i.players.first !== e)
                throw new Error(`Can't cancel request initiated by the other player (${t.name})`);
              this.alliances.splice(this.alliances.indexOf(i), 1);
            }
            acceptRequest(t, i) {
              if (this.canFormAlliance(t, i)) {
                let e = this.findByPlayers(t, i);
                if (!e || e.status !== r.Requested)
                  throw new Error(`There is no pending alliance request for player ${i.name} from player ` + t.name);
                if (e.players.first !== t) throw new Error("Can't accept own alliance request for player " + i.name);
                e.status = r.Formed;
              }
            }
            setAlliance(e, t, i) {
              if (!this.canFormAlliance(e, t))
                throw new Error(`Can't form alliance between players "${e.name}" and "${t.name}"`);
              var r;
              if ((r = this.findByPlayers(e, t)))
                throw new Error(`An alliance already exists between players ${e.name} and ` + t.name);
              return ((r = { players: new a(e, t), status: i }), this.alliances.push(r), r);
            }
            breakAlliance(e, t) {
              var i = this.findByPlayers(e, t);
              if (!i || i.status !== r.Formed)
                throw new Error(`There is no alliance between player ${e.name} and player ` + t.name);
              this.alliances.splice(this.alliances.indexOf(i), 1);
            }
            areAllied(e, t) {
              var i = this.findByPlayers(e, t);
              return !!i && i.status === r.Formed;
            }
            getAllies(t) {
              return this.filterByPlayer(t)
                .filter((e) => e.status === r.Formed)
                .map((e) => (e.players.first === t ? e.players.second : e.players.first));
            }
            haveSharedIntel(e, t) {
              return e.isObserver || t.isObserver || e === t || this.areAllied(e, t);
            }
            canRequestAlliance(e) {
              return e.isCombatant() && !e.isAi;
            }
            canFormAlliance(t, i) {
              let e = this.getHostilePlayers();
              if (0 === e.filter((e) => e.has(t) && !e.has(i)).length) return !1;
              if (0 === e.filter((e) => e.has(i) && !e.has(t)).length) return !1;
              let r = new a(t, i);
              return !!e.filter((e) => !e.equals(r)).length;
            }
            getHostilePlayers() {
              var t,
                i = this.playerList.getCombatants();
              let r = [];
              for (let s = 0; s < i.length; s++)
                for (let e = s + 1; e < i.length; e++)
                  this.getAllies(i[s]).includes(i[e]) || ((t = new a(i[s], i[e])), r.push(t));
              return r;
            }
            getHash() {
              return i.fnv32a(
                this.alliances
                  .map((e) => [
                    this.playerList.getPlayerNumber(e.players.first),
                    this.playerList.getPlayerNumber(e.players.second),
                    e.status,
                  ])
                  .flat(),
              );
            }
            debugGetState() {
              return this.alliances.map((e) => ({
                first: e.players.first,
                second: e.players.second,
                status: e.status,
              }));
            }
          }),
        ));
    },
  };
});
