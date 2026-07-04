﻿// === Reconstructed SystemJS module: game/rules/GeneralRules ===
// deps: ["game/rules/general/RadarRules","game/rules/general/RepairRules","game/rules/general/VeteranRules","game/rules/general/CrewRules","game/rules/general/PrismRules","game/rules/general/ThreatRules","game/rules/general/ParadropRules","game/rules/general/LightningStormRules","game/rules/general/V3RocketRules","game/rules/general/DMislRules","game/rules/general/HoverRules","util/math"]
// Note: variable/type names are minified approximations of the original TypeScript.

System.register(
  "game/rules/GeneralRules",
  [
    "game/rules/general/RadarRules",
    "game/rules/general/RepairRules",
    "game/rules/general/VeteranRules",
    "game/rules/general/CrewRules",
    "game/rules/general/PrismRules",
    "game/rules/general/ThreatRules",
    "game/rules/general/ParadropRules",
    "game/rules/general/LightningStormRules",
    "game/rules/general/V3RocketRules",
    "game/rules/general/DMislRules",
    "game/rules/general/HoverRules",
    "util/math",
  ],
  function (t, e) {
    "use strict";
    var i, r, s, a, n, o, l, c, h, u, d, g, p, m, f;
    e && e.id;
    return {
      setters: [
        function (e) {
          i = e;
        },
        function (e) {
          r = e;
        },
        function (e) {
          s = e;
        },
        function (e) {
          a = e;
        },
        function (e) {
          n = e;
        },
        function (e) {
          o = e;
        },
        function (e) {
          l = e;
        },
        function (e) {
          c = e;
        },
        function (e) {
          h = e;
        },
        function (e) {
          u = e;
        },
        function (e) {
          d = e;
        },
        function (e) {
          g = e;
        },
      ],
      execute: function () {
        var e;
        (((e = p || t("PrereqCategory", (p = {})))[(e.Power = 0)] = "Power"),
          (e[(e.Factory = 1)] = "Factory"),
          (e[(e.Barracks = 2)] = "Barracks"),
          (e[(e.Radar = 3)] = "Radar"),
          (e[(e.Tech = 4)] = "Tech"),
          (e[(e.Proc = 5)] = "Proc"),
          (m = new Map()
            .set(p.Power, "PrerequisitePower")
            .set(p.Factory, "PrerequisiteFactory")
            .set(p.Barracks, "PrerequisiteBarracks")
            .set(p.Radar, "PrerequisiteRadar")
            .set(p.Tech, "PrerequisiteTech")
            .set(p.Proc, "PrerequisiteProc")),
          t(
            "GeneralRules",
            (f = class {
              constructor() {
                this.prereqCategories = new Map();
              }
              readIni(e) {
                ((this.aircraftFogReveal = e.getNumber("AircraftFogReveal")),
                  (this.alliedDisguise = e.getString("AlliedDisguise")),
                  (this.baseUnit = e.getArray("BaseUnit")),
                  (this.bridgeVoxelMax = e.getNumber("BridgeVoxelMax")),
                  (this.buildSpeed = e.getFixed("BuildSpeed")),
                  (this.buildupTime = e.getNumber("BuildupTime")),
                  (this.chronoDelay = e.getNumber("ChronoDelay")),
                  (this.chronoDistanceFactor = e.getNumber("ChronoDistanceFactor", 32)),
                  (this.chronoHarvTooFarDistance = e.getNumber("ChronoHarvTooFarDistance")),
                  (this.chronoMinimumDelay = e.getNumber("ChronoMinimumDelay")),
                  (this.chronoRangeMinimum = e.getNumber("ChronoRangeMinimum")),
                  (this.chronoTrigger = e.getBool("ChronoTrigger", !0)),
                  (this.cliffBackImpassability = e.getNumber("CliffBackImpassability", 2)),
                  (this.cloakDelay = e.getNumber("CloakDelay")),
                  (this.closeEnough = e.getNumber("CloseEnough")),
                  (this.crew = new a.CrewRules().readIni(e)),
                  (this.defaultMirageDisguises = e.getArray("DefaultMirageDisguises")),
                  (this.dMisl = new u.DMislRules().readIni(e)),
                  (this.dropPodWeapon = e.getString("DropPodWeapon")),
                  (this.engineer = e.getString("Engineer")),
                  (this.engineerCaptureLevel = e.getFixed("EngineerCaptureLevel", 0.25)),
                  (this.engineerCaptureDelay = e.getNumber("EngineerCaptureDelay", 12)),
                  (this.engineerDamage = e.getFixed("EngineerDamage", 0.437)),
                  (this.engineerAlwaysCaptureTech = e.getBool("EngineerAlwaysCaptureTech", !0)),
                  (this.engineerTechSecureTime = e.getNumber("EngineerTechSecureTime", 4)),
                  (this.flightLevel = e.getNumber("FlightLevel")),
                  (this.guardAreaTargetingDelay = e.getNumber("GuardAreaTargetingDelay")),
                  (this.harvesterTooFarDistance = e.getNumber("HarvesterTooFarDistance")),
                  (this.harvesterUnit = e.getArray("HarvesterUnit")),
                  (this.harvestRate = e.getNumber("HarvestRate", 2 / 60)),
                  (this.slaveMinerShortScan = e.getNumber("SlaveMinerShortScan", 8)),
                  (this.slaveMinerSlaveScan = e.getNumber("SlaveMinerSlaveScan", 14)),
                  (this.slaveMinerLongScan = e.getNumber("SlaveMinerLongScan", 48)),
                  (this.slaveMinerScanCorrection = e.getNumber("SlaveMinerScanCorrection", 3)),
                  (this.slaveMinerKickFrameDelay = e.getNumber("SlaveMinerKickFrameDelay", 150)),
                  (this.slavesFreeSound = e.getString("SlavesFreeSound")),
                  (this.slaveMinerDeploySound = e.getString("SlaveMinerDeploySound")),
                  (this.slaveMinerUndeploySound = e.getString("SlaveMinerUndeploySound")),
                  (this.hover = new d.HoverRules().readIni(e)),
                  (this.infantryBlinkDisguiseTime = e.getNumber("InfantryBlinkDisguiseTime")),
                  (this.lightningStorm = new c.LightningStormRules().readIni(e)),
                  (this.lowPowerPenaltyModifier = e.getNumber("LowPowerPenaltyModifier", 1)),
                  (this.minLowPowerProductionSpeed = e.getFixed("MinLowPowerProductionSpeed", 0.5)),
                  (this.maxLowPowerProductionSpeed = e.getFixed("MaxLowPowerProductionSpeed", 1)),
                  (this.maximumCheerRate = e.getNumber("MaximumCheerRate")),
                  (this.maximumQueuedObjects = e.getNumber("MaximumQueuedObjects")),
                  (this.maxWaypointPathLength = e.getNumber("MaxWaypointPathLength")),
                  (this.multipleFactory = e.getFixed("MultipleFactory", 1)),
                  (this.normalTargetingDelay = e.getNumber("NormalTargetingDelay")),
                  (this.padAircraft = e.getArray("PadAircraft")),
                  (this.parachuteMaxFallRate = e.getNumber("ParachuteMaxFallRate")),
                  (this.paradrop = new l.ParadropRules().readIni(e)),
                  (this.prism = new n.PrismRules().readIni(e)),
                  (this.purifierBonus = e.getNumber("PurifierBonus")),
                  (this.radar = new i.RadarRules().readIni(e)),
                  (this.refundPercent = g.clamp(e.getNumber("RefundPercent"), 0, 1)),
                  (this.repair = new r.RepairRules().readIni(e)),
                  (this.returnStructures = e.getBool("ReturnStructures")),
                  (this.revealTriggerRadius = Math.min(10, e.getNumber("RevealTriggerRadius"))),
                  (this.shipSinkingWeight = e.getNumber("ShipSinkingWeight")),
                  (this.sovietDisguise = e.getString("SovietDisguise")),
                  (this.spyMoneyStealPercent = e.getNumber("SpyMoneyStealPercent")),
                  (this.spyPowerBlackout = e.getNumber("SpyPowerBlackout")),
                  (this.technician = e.getString("Technician")),
                  (this.thirdDisguise = e.getString("ThirdDisguise")),
                  (this.threat = new o.ThreatRules().readIni(e)),
                  (this.treeStrength = e.getNumber("TreeStrength")),
                  (this.unitsUnsellable = e.getBool("UnitsUnsellable")),
                  (this.v3Rocket = new h.V3RocketRules().readIni(e)),
                  (this.veteran = new s.VeteranRules().readIni(e)),
                  (this.wallBuildSpeedCoefficient = e.getFixed("WallBuildSpeedCoefficient")),
                  this.readPrereqCategories(e));
              }
              readPrereqCategories(e) {
                for (var [t, i] of m) {
                  if (!e.has(i)) throw new Error(`Missing prerequisite category ${i} in [General] section`);
                  this.prereqCategories.set(t, e.getArray(i));
                }
              }
              getMissileRules(e) {
                switch (e) {
                  case this.v3Rocket.type:
                    return this.v3Rocket;
                  case this.dMisl.type:
                    return this.dMisl;
                  default:
                    throw new Error(`Unsupported missile type "${e}"`);
                }
              }
            }),
          ));
      },
    };
  },
);
