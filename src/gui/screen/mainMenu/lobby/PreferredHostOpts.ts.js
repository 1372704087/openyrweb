// === Reconstructed SystemJS module: gui/screen/mainMenu/lobby/PreferredHostOpts ===
// deps: []
// Note: variable/type names are minified approximations of the original TypeScript.

System.register("gui/screen/mainMenu/lobby/PreferredHostOpts", [], function (e, t) {
  "use strict";
  var i;
  t && t.id;
  return {
    setters: [],
    execute: function () {
      e(
        "PreferredHostOpts",
        (i = class {
          constructor() {
            ((this.gameSpeed = 6),
              (this.credits = 1e4),
              (this.unitCount = 10),
              (this.shortGame = !0),
              (this.superWeapons = !1),
              (this.buildOffAlly = !0),
              (this.mcvRepacks = !0),
              (this.cratesAppear = !1),
              (this.hostTeams = !1),
              (this.destroyableBridges = !0),
              (this.multiEngineer = !1),
              (this.noDogEngiKills = !1),
              (this.instantCapture = !0),
              (this.delayedOils = !1),
              (this.slotsClosed = new Set()));
          }
          serialize() {
            return [
              this.gameSpeed,
              this.credits,
              this.unitCount,
              Number(this.shortGame),
              Number(this.superWeapons),
              Number(this.buildOffAlly),
              Number(this.mcvRepacks),
              Number(this.cratesAppear),
              [...this.slotsClosed].join(","),
              Number(this.hostTeams),
              Number(this.destroyableBridges),
              Number(this.multiEngineer),
              Number(this.noDogEngiKills),
              Number(this.instantCapture),
              Number(this.delayedOils),
            ].join(";");
          }
          unserialize(e) {
            let [t, i, r, s, a, n, o, l, c, h, u = "1", d, g, p = "1", m = "0"] = e.split(";");
            return (
              (this.gameSpeed = Number(t)),
              (this.credits = Number(i)),
              (this.unitCount = Number(r)),
              (this.shortGame = Boolean(Number(s))),
              (this.superWeapons = Boolean(Number(a))),
              (this.buildOffAlly = Boolean(Number(n))),
              (this.mcvRepacks = Boolean(Number(o))),
              (this.cratesAppear = Boolean(Number(l))),
              (this.hostTeams = Boolean(Number(h))),
              (this.destroyableBridges = Boolean(Number(u))),
              (this.multiEngineer = Boolean(Number(d))),
              (this.noDogEngiKills = Boolean(Number(g))),
              (this.instantCapture = Boolean(Number(p))),
              (this.delayedOils = Boolean(Number(m))),
              (this.slotsClosed = new Set(c ? c.split(",").map((e) => Number(e)) : [])),
              this
            );
          }
          applyGameOpts(e) {
            return (
              (this.gameSpeed = e.gameSpeed),
              (this.credits = e.credits),
              (this.unitCount = e.unitCount),
              (this.shortGame = e.shortGame),
              (this.superWeapons = e.superWeapons),
              (this.buildOffAlly = e.buildOffAlly),
              (this.mcvRepacks = e.mcvRepacks),
              (this.cratesAppear = e.cratesAppear),
              (this.hostTeams = !!e.hostTeams),
              (this.destroyableBridges = e.destroyableBridges),
              (this.multiEngineer = e.multiEngineer),
              (this.noDogEngiKills = e.noDogEngiKills),
              (this.instantCapture = e.instantCapture),
              (this.delayedOils = e.delayedOils),
              this
            );
          }
          applyMpDialogSettings(e) {
            return (
              (this.gameSpeed = 6 - e.gameSpeed),
              (this.credits = e.money),
              (this.unitCount = e.unitCount),
              (this.shortGame = e.shortGame),
              (this.mcvRepacks = e.mcvRedeploys),
              (this.cratesAppear = e.crates),
              (this.superWeapons = e.superWeapons),
              (this.destroyableBridges = e.bridgeDestruction),
              (this.multiEngineer = e.multiEngineer),
              this
            );
          }
        }),
      );
    },
  };
});
