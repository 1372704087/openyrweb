// === Reconstructed SystemJS module: gui/screen/options/component/configurableCmds ===
// deps: ["gui/screen/game/worldInteraction/keyboard/KeyCommandType"]
// Note: variable/type names are minified approximations of the original TypeScript.

System.register(
  "gui/screen/options/component/configurableCmds",
  ["gui/screen/game/worldInteraction/keyboard/KeyCommandType"],
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
        e(
          "configurableCmds",
          new Map([
            [i.KeyCommandType.Options, { label: "txt_options", desc: "txt_options_desc" }],
            [i.KeyCommandType.ToggleAlliance, { label: "txt_alliance", desc: "txt_alliance_desc" }],
            [i.KeyCommandType.PlaceBeacon, { label: "txt_place_beacon", desc: "txt_place_beacon_desc" }],
            [i.KeyCommandType.AllToCheer, { label: "cmnd:allcheer", desc: "cmnd:allcheerdesc" }],
            [i.KeyCommandType.DeployObject, { label: "txt_deploy_object", desc: "txt_deploy_object_desc" }],
            [i.KeyCommandType.Follow, { label: "txt_follow", desc: "txt_follow_desc" }],
            [i.KeyCommandType.GuardObject, { label: "txt_guard", desc: "txt_guard_desc" }],
            [i.KeyCommandType.StopObject, { label: "txt_stop_object", desc: "txt_stop_object_desc" }],
            [i.KeyCommandType.ScatterObject, { label: "txt_scatter", desc: "txt_scatter_desc" }],
            [i.KeyCommandType.CenterBase, { label: "txt_center_base", desc: "txt_center_base_desc" }],
            [i.KeyCommandType.ToggleRepair, { label: "txt_repair_mode", desc: "txt_repair_mode_desc" }],
            [i.KeyCommandType.ToggleSell, { label: "txt_sell_mode", desc: "txt_sell_mode_desc" }],
            [i.KeyCommandType.PreviousObject, { label: "txt_prev_object", desc: "txt_prev_object_desc" }],
            [i.KeyCommandType.NextObject, { label: "txt_next_object", desc: "txt_next_object_desc" }],
            [i.KeyCommandType.TypeSelect, { label: "cmnd:typeselect", desc: "cmnd:typeselectdesc" }],
            [i.KeyCommandType.CombatantSelect, { label: "cmnd:combatantselect", desc: "cmnd:combatantselectdesc" }],
            [i.KeyCommandType.StructureTab, { label: "txt_structure_tab", desc: "txt_structure_tab_desc" }],
            [i.KeyCommandType.DefenseTab, { label: "txt_defense_tab", desc: "txt_defense_tab_desc" }],
            [i.KeyCommandType.InfantryTab, { label: "txt_infantry_tab", desc: "txt_infantry_tab_desc" }],
            [i.KeyCommandType.UnitTab, { label: "txt_unit_tab", desc: "txt_unit_tab_desc" }],
            [i.KeyCommandType.PlanningMode, { label: "cmnd:planningmode", desc: "cmnd:planningmodedesc" }],
            [i.KeyCommandType.CenterOnRadarEvent, { label: "txt_radar_event", desc: "txt_radar_event_desc" }],
            [i.KeyCommandType.HealthNav, { label: "cmnd:healthnavigation", desc: "cmnd:healthnavigationdesc" }],
            [i.KeyCommandType.VeterancyNav, { label: "cmnd:vetnavigation", desc: "cmnd:vetnavigationdesc" }],
            [
              i.KeyCommandType.TeamSelect_1,
              { label: (e) => e.get("txt_select_team", 1), desc: (e) => e.get("txt_select_team_desc", 1) },
            ],
            [
              i.KeyCommandType.TeamSelect_2,
              { label: (e) => e.get("txt_select_team", 2), desc: (e) => e.get("txt_select_team_desc", 2) },
            ],
            [
              i.KeyCommandType.TeamSelect_3,
              { label: (e) => e.get("txt_select_team", 3), desc: (e) => e.get("txt_select_team_desc", 3) },
            ],
            [
              i.KeyCommandType.TeamSelect_4,
              { label: (e) => e.get("txt_select_team", 4), desc: (e) => e.get("txt_select_team_desc", 4) },
            ],
            [
              i.KeyCommandType.TeamSelect_5,
              { label: (e) => e.get("txt_select_team", 5), desc: (e) => e.get("txt_select_team_desc", 5) },
            ],
            [
              i.KeyCommandType.TeamSelect_6,
              { label: (e) => e.get("txt_select_team", 6), desc: (e) => e.get("txt_select_team_desc", 6) },
            ],
            [
              i.KeyCommandType.TeamSelect_7,
              { label: (e) => e.get("txt_select_team", 7), desc: (e) => e.get("txt_select_team_desc", 7) },
            ],
            [
              i.KeyCommandType.TeamSelect_8,
              { label: (e) => e.get("txt_select_team", 8), desc: (e) => e.get("txt_select_team_desc", 8) },
            ],
            [
              i.KeyCommandType.TeamSelect_9,
              { label: (e) => e.get("txt_select_team", 9), desc: (e) => e.get("txt_select_team_desc", 9) },
            ],
            [
              i.KeyCommandType.TeamSelect_10,
              { label: (e) => e.get("txt_select_team", 10), desc: (e) => e.get("txt_select_team_desc", 10) },
            ],
            [
              i.KeyCommandType.TeamCreate_1,
              { label: (e) => e.get("txt_create_team", 1), desc: (e) => e.get("txt_create_team_desc", 1) },
            ],
            [
              i.KeyCommandType.TeamCreate_2,
              { label: (e) => e.get("txt_create_team", 2), desc: (e) => e.get("txt_create_team_desc", 2) },
            ],
            [
              i.KeyCommandType.TeamCreate_3,
              { label: (e) => e.get("txt_create_team", 3), desc: (e) => e.get("txt_create_team_desc", 3) },
            ],
            [
              i.KeyCommandType.TeamCreate_4,
              { label: (e) => e.get("txt_create_team", 4), desc: (e) => e.get("txt_create_team_desc", 4) },
            ],
            [
              i.KeyCommandType.TeamCreate_5,
              { label: (e) => e.get("txt_create_team", 5), desc: (e) => e.get("txt_create_team_desc", 5) },
            ],
            [
              i.KeyCommandType.TeamCreate_6,
              { label: (e) => e.get("txt_create_team", 6), desc: (e) => e.get("txt_create_team_desc", 6) },
            ],
            [
              i.KeyCommandType.TeamCreate_7,
              { label: (e) => e.get("txt_create_team", 7), desc: (e) => e.get("txt_create_team_desc", 7) },
            ],
            [
              i.KeyCommandType.TeamCreate_8,
              { label: (e) => e.get("txt_create_team", 8), desc: (e) => e.get("txt_create_team_desc", 8) },
            ],
            [
              i.KeyCommandType.TeamCreate_9,
              { label: (e) => e.get("txt_create_team", 9), desc: (e) => e.get("txt_create_team_desc", 9) },
            ],
            [
              i.KeyCommandType.TeamCreate_10,
              { label: (e) => e.get("txt_create_team", 10), desc: (e) => e.get("txt_create_team_desc", 10) },
            ],
            [
              i.KeyCommandType.TeamAddSelect_1,
              { label: (e) => e.get("txt_add_select_team", 1), desc: (e) => e.get("txt_add_select_team_desc", 1) },
            ],
            [
              i.KeyCommandType.TeamAddSelect_2,
              { label: (e) => e.get("txt_add_select_team", 2), desc: (e) => e.get("txt_add_select_team_desc", 2) },
            ],
            [
              i.KeyCommandType.TeamAddSelect_3,
              { label: (e) => e.get("txt_add_select_team", 3), desc: (e) => e.get("txt_add_select_team_desc", 3) },
            ],
            [
              i.KeyCommandType.TeamAddSelect_4,
              { label: (e) => e.get("txt_add_select_team", 4), desc: (e) => e.get("txt_add_select_team_desc", 4) },
            ],
            [
              i.KeyCommandType.TeamAddSelect_5,
              { label: (e) => e.get("txt_add_select_team", 5), desc: (e) => e.get("txt_add_select_team_desc", 5) },
            ],
            [
              i.KeyCommandType.TeamAddSelect_6,
              { label: (e) => e.get("txt_add_select_team", 6), desc: (e) => e.get("txt_add_select_team_desc", 6) },
            ],
            [
              i.KeyCommandType.TeamAddSelect_7,
              { label: (e) => e.get("txt_add_select_team", 7), desc: (e) => e.get("txt_add_select_team_desc", 7) },
            ],
            [
              i.KeyCommandType.TeamAddSelect_8,
              { label: (e) => e.get("txt_add_select_team", 8), desc: (e) => e.get("txt_add_select_team_desc", 8) },
            ],
            [
              i.KeyCommandType.TeamAddSelect_9,
              { label: (e) => e.get("txt_add_select_team", 9), desc: (e) => e.get("txt_add_select_team_desc", 9) },
            ],
            [
              i.KeyCommandType.TeamAddSelect_10,
              { label: (e) => e.get("txt_add_select_team", 10), desc: (e) => e.get("txt_add_select_team_desc", 10) },
            ],
            [
              i.KeyCommandType.TeamCenter_1,
              { label: (e) => e.get("txt_center_team", 1), desc: (e) => e.get("txt_center_team_desc", 1) },
            ],
            [
              i.KeyCommandType.TeamCenter_2,
              { label: (e) => e.get("txt_center_team", 2), desc: (e) => e.get("txt_center_team_desc", 2) },
            ],
            [
              i.KeyCommandType.TeamCenter_3,
              { label: (e) => e.get("txt_center_team", 3), desc: (e) => e.get("txt_center_team_desc", 3) },
            ],
            [
              i.KeyCommandType.TeamCenter_4,
              { label: (e) => e.get("txt_center_team", 4), desc: (e) => e.get("txt_center_team_desc", 4) },
            ],
            [
              i.KeyCommandType.TeamCenter_5,
              { label: (e) => e.get("txt_center_team", 5), desc: (e) => e.get("txt_center_team_desc", 5) },
            ],
            [
              i.KeyCommandType.TeamCenter_6,
              { label: (e) => e.get("txt_center_team", 6), desc: (e) => e.get("txt_center_team_desc", 6) },
            ],
            [
              i.KeyCommandType.TeamCenter_7,
              { label: (e) => e.get("txt_center_team", 7), desc: (e) => e.get("txt_center_team_desc", 7) },
            ],
            [
              i.KeyCommandType.TeamCenter_8,
              { label: (e) => e.get("txt_center_team", 8), desc: (e) => e.get("txt_center_team_desc", 8) },
            ],
            [
              i.KeyCommandType.TeamCenter_9,
              { label: (e) => e.get("txt_center_team", 9), desc: (e) => e.get("txt_center_team_desc", 9) },
            ],
            [
              i.KeyCommandType.TeamCenter_10,
              { label: (e) => e.get("txt_center_team", 10), desc: (e) => e.get("txt_center_team_desc", 10) },
            ],
            [i.KeyCommandType.CenterView, { label: "txt_center_view", desc: "txt_center_view_desc" }],
            [i.KeyCommandType.View1, { label: "txt_view_bookmark1", desc: "txt_view_bookmark1_desc" }],
            [i.KeyCommandType.View2, { label: "txt_view_bookmark2", desc: "txt_view_bookmark2_desc" }],
            [i.KeyCommandType.View3, { label: "txt_view_bookmark3", desc: "txt_view_bookmark3_desc" }],
            [i.KeyCommandType.View4, { label: "txt_view_bookmark4", desc: "txt_view_bookmark4_desc" }],
            [i.KeyCommandType.SetView1, { label: "txt_set_bookmark1", desc: "txt_set_bookmark1_desc" }],
            [i.KeyCommandType.SetView2, { label: "txt_set_bookmark2", desc: "txt_set_bookmark2_desc" }],
            [i.KeyCommandType.SetView3, { label: "txt_set_bookmark3", desc: "txt_set_bookmark3_desc" }],
            [i.KeyCommandType.SetView4, { label: "txt_set_bookmark4", desc: "txt_set_bookmark4_desc" }],
            [
              i.KeyCommandType.Taunt_1,
              { label: (e) => e.get("txt_taunt_number", 1), desc: (e) => e.get("txt_taunt_desc", 1) },
            ],
            [
              i.KeyCommandType.Taunt_2,
              { label: (e) => e.get("txt_taunt_number", 2), desc: (e) => e.get("txt_taunt_desc", 2) },
            ],
            [
              i.KeyCommandType.Taunt_3,
              { label: (e) => e.get("txt_taunt_number", 3), desc: (e) => e.get("txt_taunt_desc", 3) },
            ],
            [
              i.KeyCommandType.Taunt_4,
              { label: (e) => e.get("txt_taunt_number", 4), desc: (e) => e.get("txt_taunt_desc", 4) },
            ],
            [
              i.KeyCommandType.Taunt_5,
              { label: (e) => e.get("txt_taunt_number", 5), desc: (e) => e.get("txt_taunt_desc", 5) },
            ],
            [
              i.KeyCommandType.Taunt_6,
              { label: (e) => e.get("txt_taunt_number", 6), desc: (e) => e.get("txt_taunt_desc", 6) },
            ],
            [
              i.KeyCommandType.Taunt_7,
              { label: (e) => e.get("txt_taunt_number", 7), desc: (e) => e.get("txt_taunt_desc", 7) },
            ],
            [
              i.KeyCommandType.Taunt_8,
              { label: (e) => e.get("txt_taunt_number", 8), desc: (e) => e.get("txt_taunt_desc", 8) },
            ],
            [i.KeyCommandType.Delete, { label: "cmnd:delete", desc: "cmnd:deletedesc" }],
            [i.KeyCommandType.PageUser, { label: "txt_pageuser", desc: "txt_pageuser_desc" }],
            [i.KeyCommandType.SidebarPageUp, { label: "txt_sidebar_pgup", desc: "txt_sidebar_pgup_desc" }],
            [i.KeyCommandType.SidebarUp, { label: "txt_sidebar_up", desc: "txt_sidebar_up_desc" }],
            [i.KeyCommandType.SidebarPageDown, { label: "txt_sidebar_pgdn", desc: "txt_sidebar_pgdn_desc" }],
            [i.KeyCommandType.SidebarDown, { label: "txt_sidebar_down", desc: "txt_sidebar_down_desc" }],
            [i.KeyCommandType.ToggleFps, { label: "cmnd:togglefps", desc: "cmnd:togglefpsdesc" }],
          ]),
        );
      },
    };
  },
);
