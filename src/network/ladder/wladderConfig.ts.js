// === Reconstructed SystemJS module: network/ladder/wladderConfig ===
// deps: []
// Note: variable/type names are minified approximations of the original TypeScript.

System.register("network/ladder/wladderConfig", [], function (t, e) {
  "use strict";
  var i, r;
  e && e.id;
  return (
    t("getLadderTypeForQueueType", function (e, t) {
      switch (e) {
        case r.Solo1v1:
          return i.Solo1v1;
        case r.Team2v2:
          return i.Random2v2;
        default:
          throw new Error(`Unhandled queue type "${e}"`);
      }
    }),
    t("getQueueTypeForLadderType", function (e) {
      switch (e) {
        case i.Solo1v1:
          return r.Solo1v1;
        case i.Random2v2:
          return r.Team2v2;
        default:
          throw new Error(`Unhandled ladder type "${e}"`);
      }
    }),
    {
      setters: [],
      execute: function () {
        var e;
        (t("CURRENT_SEASON", "current"),
          t("PREV_SEASON", "prev"),
          t("MAX_LIST_SEARCH_COUNT", 50),
          ((e = i || t("LadderType", (i = {}))).Solo1v1 = "1v1"),
          (e.Random2v2 = "2v2-random"),
          ((e = r || t("LadderQueueType", (r = {}))).Solo1v1 = "1v1"),
          (e.Team2v2 = "2v2"),
          t(
            "teamSizes",
            new Map([
              [r.Solo1v1, 1],
              [r.Team2v2, 2],
            ]),
          ));
      },
    }
  );
});
