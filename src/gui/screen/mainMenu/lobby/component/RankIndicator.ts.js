// === Reconstructed SystemJS module: gui/screen/mainMenu/lobby/component/RankIndicator ===
// deps: ["react","gui/component/Image","network/ladder/PlayerRankType"]
// Note: variable/type names are minified approximations of the original TypeScript.

System.register(
  "gui/screen/mainMenu/lobby/component/RankIndicator",
  ["react", "gui/component/Image", "network/ladder/PlayerRankType"],
  function (e, t) {
    "use strict";
    var s, a, n, o, l;
    t && t.id;
    return {
      setters: [
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
        ((o = new Map()
          .set(n.PlayerRankType.Private, "private")
          .set(n.PlayerRankType.Corporal, "corporal")
          .set(n.PlayerRankType.Sergeant, "sergeant")
          .set(n.PlayerRankType.Lieutenant, "lieutena")
          .set(n.PlayerRankType.Major, "major")
          .set(n.PlayerRankType.Colonel, "colonel")
          .set(n.PlayerRankType.BrigGeneral, "briggenr")
          .set(n.PlayerRankType.General, "general")
          .set(n.PlayerRankType.FiveStarGeneral, "stargen")
          .set(n.PlayerRankType.CommanderInChief, "comchief")),
          e(
            "RANK_LABELS",
            (l = new Map()
              .set(n.PlayerRankType.Private, "GUI:RankPrivate")
              .set(n.PlayerRankType.Corporal, "GUI:RankCorporal")
              .set(n.PlayerRankType.Sergeant, "GUI:RankSergeant")
              .set(n.PlayerRankType.Lieutenant, "GUI:RankLieutenant")
              .set(n.PlayerRankType.Major, "GUI:RankMajor")
              .set(n.PlayerRankType.Colonel, "GUI:RankColonel")
              .set(n.PlayerRankType.BrigGeneral, "GUI:RankBrigGeneral")
              .set(n.PlayerRankType.General, "GUI:RankGeneral")
              .set(n.PlayerRankType.FiveStarGeneral, "GUI:RankFiveStar")
              .set(n.PlayerRankType.CommanderInChief, "GUI:RankCmdInChief")),
          ),
          e("RankIndicator", ({ playerProfile: e, strings: t }) => {
            var i = e?.rankType ?? n.PlayerRankType.None,
              r = e
                ? i !== n.PlayerRankType.None
                  ? e.name + " : " + t.get(l.get(i))
                  : e.name + " : " + t.get("TXT_UNRANKED")
                : void 0;
            return s.default.createElement(
              "div",
              { className: "rank-indicator", "data-r-tooltip": r },
              i !== n.PlayerRankType.None ? s.default.createElement(a.Image, { src: o.get(i) + ".pcx" }) : null,
            );
          }));
      },
    };
  },
);
