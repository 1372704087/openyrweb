// === Reconstructed SystemJS module: game/api/index ===
// deps: ["game/bot/Bot","game/api/EventsApi","game/math/GameMath","game/math/Box2","game/math/Vector2","game/math/Vector3","game/math/Euler","game/math/Quaternion","game/math/Matrix4","game/math/Spherical","game/math/Cylindrical","engine/TheaterType","engine/type/ObjectType","game/gameobject/Building","game/gameobject/infantry/StanceType","game/gameobject/unit/ZoneType","game/gameobject/trait/AttackTrait","game/gameobject/trait/FactoryTrait","game/gameobject/unit/VeteranLevel","game/order/OrderType","game/player/production/ProductionQueue","game/rules/GeneralRules","game/rules/general/RadarRules","game/type/SpeedType","game/WeaponType","game/rules/TechnoRules","data/map/tag/TagRepeatType","engine/type/TerrainType","game/gameobject/infantry/InfDeathType","game/gameobject/unit/VeteranAbility","game/SideType","game/type/ArmorType","game/type/LandTargeting","game/type/LandType","game/type/LocomotorType","game/type/MovementZone","game/type/NavalTargeting","game/type/PipColor","game/type/SuperWeaponType","game/SuperWeapon","game/type/VhpScan"]
// Note: variable/type names are minified approximations of the original TypeScript.

System.register(
  "game/api/index",
  [
    "game/bot/Bot",
    "game/api/EventsApi",
    "game/math/GameMath",
    "game/math/Box2",
    "game/math/Vector2",
    "game/math/Vector3",
    "game/math/Euler",
    "game/math/Quaternion",
    "game/math/Matrix4",
    "game/math/Spherical",
    "game/math/Cylindrical",
    "engine/TheaterType",
    "engine/type/ObjectType",
    "game/gameobject/Building",
    "game/gameobject/infantry/StanceType",
    "game/gameobject/unit/ZoneType",
    "game/gameobject/trait/AttackTrait",
    "game/gameobject/trait/FactoryTrait",
    "game/gameobject/unit/VeteranLevel",
    "game/order/OrderType",
    "game/player/production/ProductionQueue",
    "game/rules/GeneralRules",
    "game/rules/general/RadarRules",
    "game/type/SpeedType",
    "game/WeaponType",
    "game/rules/TechnoRules",
    "data/map/tag/TagRepeatType",
    "engine/type/TerrainType",
    "game/gameobject/infantry/InfDeathType",
    "game/gameobject/unit/VeteranAbility",
    "game/SideType",
    "game/type/ArmorType",
    "game/type/LandTargeting",
    "game/type/LandType",
    "game/type/LocomotorType",
    "game/type/MovementZone",
    "game/type/NavalTargeting",
    "game/type/PipColor",
    "game/type/SuperWeaponType",
    "game/SuperWeapon",
    "game/type/VhpScan",
  ],
  function (t, e) {
    "use strict";
    e && e.id;
    return {
      setters: [
        function (e) {
          t({ Bot: e.Bot });
        },
        function (e) {
          t({ ApiEventType: e.ApiEventType });
        },
        function (e) {
          t({ GameMath: e.GameMath });
        },
        function (e) {
          t({ Box2: e.Box2 });
        },
        function (e) {
          t({ Vector2: e.Vector2 });
        },
        function (e) {
          t({ Vector3: e.Vector3 });
        },
        function (e) {
          t({ Euler: e.Euler });
        },
        function (e) {
          t({ Quaternion: e.Quaternion });
        },
        function (e) {
          t({ Matrix4: e.Matrix4 });
        },
        function (e) {
          t({ Spherical: e.Spherical });
        },
        function (e) {
          t({ Cylindrical: e.Cylindrical });
        },
        function (e) {
          t({ TheaterType: e.TheaterType });
        },
        function (e) {
          t({ ObjectType: e.ObjectType });
        },
        function (e) {
          t({ BuildStatus: e.BuildStatus });
        },
        function (e) {
          t({ StanceType: e.StanceType });
        },
        function (e) {
          t({ ZoneType: e.ZoneType });
        },
        function (e) {
          t({ AttackState: e.AttackState });
        },
        function (e) {
          t({ FactoryStatus: e.FactoryStatus });
        },
        function (e) {
          t({ VeteranLevel: e.VeteranLevel });
        },
        function (e) {
          t({ OrderType: e.OrderType });
        },
        function (e) {
          (t({ QueueType: e.QueueType }), t({ QueueStatus: e.QueueStatus }));
        },
        function (e) {
          t({ PrereqCategory: e.PrereqCategory });
        },
        function (e) {
          t({ RadarEventType: e.RadarEventType });
        },
        function (e) {
          t({ SpeedType: e.SpeedType });
        },
        function (e) {
          t({ WeaponType: e.WeaponType });
        },
        function (e) {
          (t({ FactoryType: e.FactoryType }), t({ BuildCat: e.BuildCat }));
        },
        function (e) {
          t({ TagRepeatType: e.TagRepeatType });
        },
        function (e) {
          t({ TerrainType: e.TerrainType });
        },
        function (e) {
          t({ InfDeathType: e.InfDeathType });
        },
        function (e) {
          t({ VeteranAbility: e.VeteranAbility });
        },
        function (e) {
          t({ SideType: e.SideType });
        },
        function (e) {
          t({ ArmorType: e.ArmorType });
        },
        function (e) {
          t({ LandTargeting: e.LandTargeting });
        },
        function (e) {
          t({ LandType: e.LandType });
        },
        function (e) {
          t({ LocomotorType: e.LocomotorType });
        },
        function (e) {
          t({ MovementZone: e.MovementZone });
        },
        function (e) {
          t({ NavalTargeting: e.NavalTargeting });
        },
        function (e) {
          t({ PipColor: e.PipColor });
        },
        function (e) {
          t({ SuperWeaponType: e.SuperWeaponType });
        },
        function (e) {
          t({ SuperWeaponStatus: e.SuperWeaponStatus });
        },
        function (e) {
          t({ VhpScan: e.VhpScan });
        },
      ],
      execute: function () {},
    };
  },
);
