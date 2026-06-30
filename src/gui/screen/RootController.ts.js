// === Reconstructed SystemJS module: gui/screen/RootController ===
// deps: ["gui/screen/Controller","gui/screen/ScreenType"]
// Note: variable/type names are minified approximations of the original TypeScript.

System.register("gui/screen/RootController", ["gui/screen/Controller", "gui/screen/ScreenType"], function (e, t) {
  "use strict";
  var i, u, r;
  t && t.id;
  return {
    setters: [
      function (e) {
        i = e;
      },
      function (e) {
        u = e;
      },
    ],
    execute: function () {
      ((r = class extends i.Controller {
        constructor(e) {
          (super(), (this.serverRegions = e));
        }
        async goToScreenBlocking(...e) {
          var [t, i] = e;
          return super.goToScreenBlocking(t, i);
        }
        goToScreen(...e) {
          var [t, i] = e;
          return super.goToScreen(t, i);
        }
        async pushScreen(...e) {
          var [t, i] = e;
          return super.pushScreen(t, i);
        }
        createGame(e, t, i, r, s, a, n, o = !1, l = !1, c) {
          if (!this.serverRegions) throw new Error("Server regions must be loaded first");
          let h = "";
          if (!a) {
            if (!i) throw new Error("Game server must be set for a multiplayer game");
            h = i;
          }
          this.goToScreen(u.ScreenType.Game, {
            create: !0,
            gameId: e,
            timestamp: t,
            playerName: r,
            gameOpts: s,
            singlePlayer: a,
            tournament: n,
            mapTransfer: o,
            createPrivateGame: l,
            gservUrl: h,
            returnTo: c,
          });
        }
        joinGame(e, t, i, r, s, a = !1, n) {
          if (!this.serverRegions) throw new Error("Server regions must be loaded first");
          this.goToScreen(u.ScreenType.Game, {
            create: !1,
            gameId: e,
            timestamp: t,
            playerName: r,
            tournament: s,
            mapTransfer: a,
            gservUrl: i,
            returnTo: n,
          });
        }
      }),
        e("RootController", r));
    },
  };
});
