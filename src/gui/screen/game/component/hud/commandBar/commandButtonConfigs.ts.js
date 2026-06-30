// === Reconstructed SystemJS module: gui/screen/game/component/hud/commandBar/commandButtonConfigs ===
// deps: ["gui/screen/game/component/hud/commandBar/CommandBarButtonType"]
// Note: variable/type names are minified approximations of the original TypeScript.

System.register(
  "gui/screen/game/component/hud/commandBar/commandButtonConfigs",
  ["gui/screen/game/component/hud/commandBar/CommandBarButtonType"],
  function (e, t) {
    "use strict";
    var i;
    t && t.id;
    return {
      setters: [
        function (e) {
          i = e;
        },
      ],
      execute: function () {
        e("commandButtonConfigs", [
          { type: i.CommandBarButtonType.BugReport, icon: "reportbug.shp", tooltip: (e) => e.get("ts:reportbug") },
          { type: i.CommandBarButtonType.Team01, icon: "button00.shp", tooltip: (e) => e.get("tip:team01") },
          { type: i.CommandBarButtonType.Team02, icon: "button01.shp", tooltip: (e) => e.get("tip:team02") },
          { type: i.CommandBarButtonType.Team03, icon: "button02.shp", tooltip: (e) => e.get("tip:team03") },
          { type: i.CommandBarButtonType.TypeSelect, icon: "button03.shp", tooltip: (e) => e.get("tip:typeselect") },
          { type: i.CommandBarButtonType.Deploy, icon: "button04.shp", tooltip: (e) => e.get("tip:deploy") },
          { type: i.CommandBarButtonType.Guard, icon: "button06.shp", tooltip: (e) => e.get("tip:guard") },
          { type: i.CommandBarButtonType.Beacon, icon: "button07.shp", tooltip: (e) => e.get("tip:beacon") },
          { type: i.CommandBarButtonType.Stop, icon: "button08.shp", tooltip: (e) => e.get("tip:stop") },
          {
            type: i.CommandBarButtonType.PlanningMode,
            icon: "button09.shp",
            tooltip: (e) => e.get("tip:planningmode"),
          },
          { type: i.CommandBarButtonType.Cheer, icon: "button10.shp", tooltip: (e) => e.get("tip:cheer") },
          { type: i.CommandBarButtonType.ReplayRewind, icon: "rewind.shp", tooltip: (e) => e.get("tip:replayrewind") },
          { type: i.CommandBarButtonType.ReplayPlay, icon: "play.shp", tooltip: (e) => e.get("tip:play") },
          { type: i.CommandBarButtonType.ReplayPause, icon: "pause.shp", tooltip: (e) => e.get("tip:pause") },
          { type: i.CommandBarButtonType.ReplaySpeed, icon: "ffwd.shp", tooltip: (e) => e.get("tip:replayspeed") },
        ]);
      },
    };
  },
);
