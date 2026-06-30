// === Reconstructed SystemJS module: gui/screen/game/component/hud/viewmodel/SidebarModel ===
// deps: ["gui/screen/game/component/hud/viewmodel/SidebarTab","game/GameSpeed"]
// Note: variable/type names are minified approximations of the original TypeScript.

System.register(
  "gui/screen/game/component/hud/viewmodel/SidebarModel",
  ["gui/screen/game/component/hud/viewmodel/SidebarTab", "game/GameSpeed"],
  function (t, e) {
    "use strict";
    var i, r, s, a, n, o;
    e && e.id;
    return {
      setters: [
        function (e) {
          i = e;
        },
        function (e) {
          r = e;
        },
      ],
      execute: function () {
        var e;
        (((e = s || t("SidebarItemTargetType", (s = {})))[(e.Techno = 0)] = "Techno"),
          (e[(e.Special = 1)] = "Special"),
          ((e = a || t("SidebarItemStatus", (a = {})))[(e.Idle = 0)] = "Idle"),
          (e[(e.InQueue = 1)] = "InQueue"),
          (e[(e.Started = 2)] = "Started"),
          (e[(e.OnHold = 3)] = "OnHold"),
          (e[(e.Ready = 4)] = "Ready"),
          ((e = n || t("SidebarCategory", (n = {})))[(e.Structures = 0)] = "Structures"),
          (e[(e.Armory = 1)] = "Armory"),
          (e[(e.Infantry = 2)] = "Infantry"),
          (e[(e.Vehicles = 3)] = "Vehicles"),
          t(
            "SidebarModel",
            (o = class {
              constructor(e, t) {
                ((this.game = e),
                  (this.replay = t),
                  (this.powerDrained = 0),
                  (this.powerGenerated = 0),
                  (this.sellMode = !1),
                  (this.repairMode = !1),
                  (this.topTextLeftAlign = !1),
                  (this.tabs = [
                    new i.SidebarTab(n.Structures),
                    new i.SidebarTab(n.Armory),
                    new i.SidebarTab(n.Infantry),
                    new i.SidebarTab(n.Vehicles),
                  ]),
                  (this.activeTabId = n.Structures));
              }
              get activeTab() {
                return this.tabs[this.activeTabId];
              }
              get currentGameTime() {
                return Math.floor(this.game.currentTime / 1e3);
              }
              get replayTime() {
                return this.replay ? Math.floor(this.replay.endTick / r.GameSpeed.BASE_TICKS_PER_SECOND) : void 0;
              }
              selectTab(e) {
                this.tabs[e].disabled || (this.activeTabId = e);
              }
            }),
          ));
      },
    };
  },
);
