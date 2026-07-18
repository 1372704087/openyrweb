// === Custom AI module: game/bot/custom-ai/logic/mission/missionFactories ===
System.register("game/bot/custom-ai/logic/mission/missionFactories", ["game/api/index", "game/bot/custom-ai/logic/mission/missions/expansionMission", "game/bot/custom-ai/logic/mission/mission", "game/bot/custom-ai/logic/awareness", "game/bot/custom-ai/logic/mission/missions/scoutingMission", "game/bot/custom-ai/logic/mission/missionController", "game/bot/custom-ai/logic/mission/missions/attackMission", "game/bot/custom-ai/logic/mission/missions/defenceMission", "game/bot/custom-ai/logic/common/utils", "game/bot/custom-ai/logic/mission/missions/engineerMission", "game/bot/custom-ai/logic/mission/missions/spyMission", "game/bot/custom-ai/logic/mission/missions/airRaidMission", "game/bot/custom-ai/logic/mission/missions/navalAssaultMission", "game/bot/custom-ai/logic/mission/missions/navalScoutingMission", "game/bot/custom-ai/logic/mission/missions/amphibiousScoutingMission", "game/bot/custom-ai/logic/mission/missions/antiShipyardMission", "game/bot/custom-ai/logic/mission/missions/antiCoastShipMission", "game/bot/custom-ai/logic/mission/missions/antiSubMission", "game/bot/custom-ai/logic/mission/missions/reserveRhinoMission", "game/bot/custom-ai/logic/mission/missions/dreadEscortMission"], function (e, t) {
  "use strict";
  var ExpansionMissionFactory, ScoutingMissionFactory, AttackMissionFactory, DefenceMissionFactory, EngineerMissionFactory, SpyMissionFactory, AirRaidMissionFactory, NavalAssaultMissionFactory, NavalScoutingMissionFactory, AmphibiousScoutingMissionFactory, AntiShipyardMissionFactory, AntiCoastShipMissionFactory, AntiSubMissionFactory, ReserveRhinoMissionFactory, DreadEscortMissionFactory;
  t && t.id;
  return {
    setters: [
      function () {},
      function (B) {
        ExpansionMissionFactory = B.ExpansionMissionFactory;
      },
      function () {},
      function () {},
      function (E) {
        ScoutingMissionFactory = E.ScoutingMissionFactory;
      },
      function () {},
      function (G) {
        AttackMissionFactory = G.AttackMissionFactory;
      },
      function (H) {
        DefenceMissionFactory = H.DefenceMissionFactory;
      },
      function () {},
      function (J) {
        EngineerMissionFactory = J.EngineerMissionFactory;
      },
      function (Ja) {
        SpyMissionFactory = Ja.SpyMissionFactory;
      },
      function (Jb) {
        AirRaidMissionFactory = Jb.AirRaidMissionFactory;
      },
      function (Jc) {
        NavalAssaultMissionFactory = Jc.NavalAssaultMissionFactory;
      },
      function (K) {
        NavalScoutingMissionFactory = K.NavalScoutingMissionFactory;
      },
      function (L) {
        AmphibiousScoutingMissionFactory = L.AmphibiousScoutingMissionFactory;
      },
      function (M) {
        AntiShipyardMissionFactory = M.AntiShipyardMissionFactory;
      },
      function (N) {
        AntiCoastShipMissionFactory = N.AntiCoastShipMissionFactory;
      },
      function (O) {
        AntiSubMissionFactory = O.AntiSubMissionFactory;
      },
      function (P) {
        ReserveRhinoMissionFactory = P.ReserveRhinoMissionFactory;
      },
      function (Q) {
        DreadEscortMissionFactory = Q.DreadEscortMissionFactory;
      },
    ],
    execute: function () {

      var createMissionFactories = function () {
        return [
          new ExpansionMissionFactory(),
          new ScoutingMissionFactory(),
          new AttackMissionFactory(),
          new DefenceMissionFactory(),
          new EngineerMissionFactory(),
          new SpyMissionFactory(),
          new AirRaidMissionFactory(),
          new NavalAssaultMissionFactory(),
          new NavalScoutingMissionFactory(),
          new AmphibiousScoutingMissionFactory(),
          new AntiShipyardMissionFactory(),
          new AntiCoastShipMissionFactory(),
          new AntiSubMissionFactory(),
          new ReserveRhinoMissionFactory(),
          new DreadEscortMissionFactory(),
        ];
      };
      e("createMissionFactories", createMissionFactories);
    },
  };
});
