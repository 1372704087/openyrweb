// === Reconstructed SystemJS module: RouteHelper ===
// deps: ["util/Base64"]
// Note: variable/type names are minified approximations of the original TypeScript.

System.register("RouteHelper", ["util/Base64"], function (e, t) {
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
      (e(
        "RouteHelper",
        (r = class {
          static getGameRoute(e) {
            return (
              "#/game/" +
              i.Base64.encode(
                JSON.stringify({
                  gameId: e.gameId,
                  gameTimestamp: e.gameTimestamp,
                  gservUrl: e.gservUrl,
                  playerName: e.playerName,
                  gameOpts: e.gameOpts,
                  tournament: e.tournament,
                }),
              )
            );
          }
          static extractGameParams(e) {
            return JSON.parse(i.Base64.decode(e));
          }
        }),
      ),
        (r.modQueryStringName = "mod"));
    },
  };
});
