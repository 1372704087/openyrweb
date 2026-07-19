// === Reconstructed SystemJS module: game/rules/TechnoRules ===
// deps: ["engine/type/ObjectType","game/SideType","game/type/SpeedType","game/type/PipColor","game/type/PipScale","game/type/LocomotorType","game/type/MovementZone","game/type/ArmorType","game/type/LandTargeting","game/type/NavalTargeting","game/rules/ObjectRules","game/WeaponType","game/gameobject/unit/VeteranAbility","game/type/VhpScan","game/math/Vector3"]
// Note: variable/type names are minified approximations of the original TypeScript.

System.register(
  "game/rules/TechnoRules",
  [
    "engine/type/ObjectType",
    "game/SideType",
    "game/type/SpeedType",
    "game/type/PipColor",
    "game/type/PipScale",
    "game/type/LocomotorType",
    "game/type/MovementZone",
    "game/type/ArmorType",
    "game/type/LandTargeting",
    "game/type/NavalTargeting",
    "game/rules/ObjectRules",
    "game/WeaponType",
    "game/gameobject/unit/VeteranAbility",
    "game/type/VhpScan",
    "game/math/Vector3",
  ],
  function (t, e) {
    "use strict";
    var s, a, n, o, P, l, c, h, u, d, g, p, m, f, y, T, v, b;
    e && e.id;
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
        function (e) {
          o = e;
        },
        function (e) {
          P = e;
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
        function (e) {
          p = e;
        },
        function (e) {
          m = e;
        },
        function (e) {
          f = e;
        },
        function (e) {
          y = e;
        },
      ],
      execute: function () {
        var e;
        (((e = T || t("BuildCat", (T = {})))[(e.Combat = 0)] = "Combat"),
          (e[(e.Tech = 1)] = "Tech"),
          (e[(e.Resource = 2)] = "Resource"),
          (e[(e.Power = 3)] = "Power"),
          ((e = v || t("FactoryType", (v = {})))[(e.None = 0)] = "None"),
          (e[(e.BuildingType = 1)] = "BuildingType"),
          (e[(e.InfantryType = 2)] = "InfantryType"),
          (e[(e.UnitType = 3)] = "UnitType"),
          (e[(e.NavalUnitType = 4)] = "NavalUnitType"),
          (e[(e.AircraftType = 5)] = "AircraftType"),
          (b = class b extends g.ObjectRules {
            constructor(e, t, i, r) {
              super(e, t, i, r);
            }
            parse() {
              (super.parse(), (this.owner = this.ini.getArray("Owner")));
              var e = this.ini.getNumber("AIBasePlanningSide");
              ((this.aiBasePlanningSide = -1 !== e && void 0 !== a.SideType[e] ? e : void 0),
                (this.requiredHouses = this.ini.getArray("RequiredHouses")),
                (this.forbiddenHouses = this.ini.getArray("ForbiddenHouses")),
                (this.requiresStolenAlliedTech = this.ini.getBool("RequiresStolenAlliedTech")),
                (this.requiresStolenSovietTech = this.ini.getBool("RequiresStolenSovietTech")),
                (this.requiresStolenThirdTech = this.ini.getBool("RequiresStolenThirdTech")),
                (this.techLevel = this.ini.getNumber("TechLevel", -1)),
                (this.cost = this.ini.getNumber("Cost")),
                (this.points = this.ini.getNumber("Points")),
                (this.power = this.ini.getNumber("Power")),
                // OpenYRWeb: Bio Reactor (YAPOWR) power-boost. InfantryAbsorb=yes + ExtraPower=
                // means each garrisoned infantry adds ExtraPower to the building's output.
                // BioReactorPowerTrait recomputes total = base Power + (occupants * ExtraPower)
                // and pushes it through the player's PowerTrait whenever garrison changes.
                (this.extraPower = this.ini.getNumber("ExtraPower")),
                (this.powered = this.ini.getBool("Powered")),
                (this.prerequisite = this.ini.getArray("Prerequisite")),
                (this.prerequisiteOverride = this.ini.getArray("PrerequisiteOverride")),
                (this.soylent = this.ini.getNumber("Soylent")),
                (this.crateGoodie = this.ini.getBool("CrateGoodie")),
                (this.buildCat = this.ini.getEnum("BuildCat", T, T.Combat)),
                (this.adjacent = this.ini.getNumber("Adjacent", 1)),
                (this.baseNormal = this.ini.getBool("BaseNormal", !0)),
                (this.buildLimit = this.ini.getNumber("BuildLimit", Number.POSITIVE_INFINITY)),
                (this.airRangeBonus = this.ini.getNumber("AirRangeBonus")),
                (this.guardRange = this.ini.getNumber("GuardRange")),
                (this.defaultToGuardArea = this.ini.getBool("DefaultToGuardArea")),
                (this.eligibileForAllyBuilding = this.ini.getBool("EligibileForAllyBuilding")),
                (this.numberImpassableRows = this.ini.getNumber("NumberImpassableRows")),
                (this.bridgeRepairHut = this.ini.getBool("BridgeRepairHut")),
                (this.constructionYard = this.ini.getBool("ConstructionYard")),
                (this.refinery = this.ini.getBool("Refinery")),
                (this.unitRepair = this.ini.getBool("UnitRepair")),
                (this.unitReload = this.ini.getBool("UnitReload")),
                (this.unitSell = this.ini.getBool("UnitSell")),
                (this.isBaseDefense = this.ini.getBool("IsBaseDefense")),
                (this.superWeapon = this.parseWeaponName(this.ini.getString("SuperWeapon"))),
                (this.chargedAnimTime = this.ini.getNumber("ChargedAnimTime")));
              var t = this.ini.getBool("Naval");
              ((this.naval = t),
                (this.underwater = this.ini.getBool("Underwater")),
                (this.waterBound = this.ini.getBool("WaterBound")),
                (this.orePurifier = this.ini.getBool("OrePurifier")),
                (this.cloning = this.ini.getBool("Cloning")),
              (this.grinding = this.ini.getBool("Grinding")),
              (this.nukeSilo = this.ini.getBool("NukeSilo")),
              // OpenYRWeb: Industrial Plant (NAINDP) cost-bonus fields. A building with these
              // multipliers reduces the production cost of the matching object category for its
              // owner (e.g. NAINDP UnitsCostBonus=0.75 → vehicles cost 75%). Defaults to 1 (no
              // discount) so only buildings that set the keys have any effect. Applied in
              // ProductionTrait.tickQueue when computing each item's creditsEach.
              (this.unitsCostBonus = this.ini.getFixed("UnitsCostBonus", 1)),
              (this.infantryCostBonus = this.ini.getFixed("InfantryCostBonus", 1)),
              (this.aircraftCostBonus = this.ini.getFixed("AircraftCostBonus", 1)),
              (this.buildingsCostBonus = this.ini.getFixed("BuildingsCostBonus", 1)),
              (this.defensesCostBonus = this.ini.getFixed("DefensesCostBonus", 1)),
                (this.repairable = this.ini.getBool("Repairable", this.type === s.ObjectType.Building)),
                (this.clickRepairable = this.ini.getBool("ClickRepairable", this.type === s.ObjectType.Building)),
                (this.unsellable = this.ini.getBool(
                  "Unsellable",
                  this.type !== s.ObjectType.Building && this.generalRules.unitsUnsellable,
                )),
                (this.returnable = this.ini.getBool("Returnable", this.generalRules.returnStructures)),
                (this.gdiBarracks = this.ini.getBool("GDIBarracks")),
                (this.nodBarracks = this.ini.getBool("NODBarracks")),
                (this.numberOfDocks = this.ini.getNumber("NumberOfDocks")),
                this.unitRepair && !this.numberOfDocks && (this.numberOfDocks = 1),
                (this.factory = this.ini.getEnum("Factory", v, v.None)),
                this.factory === v.UnitType && t && (this.factory = v.NavalUnitType),
                (this.weaponsFactory = this.ini.getBool("WeaponsFactory")),
                (this.helipad = this.ini.getBool("Helipad")),
                (this.hospital = this.ini.getBool("Hospital")),
                (this.landTargeting = this.ini.getEnumNumeric(
                  "LandTargeting",
                  u.LandTargeting,
                  u.LandTargeting.LandOk,
                )),
                (this.navalTargeting = this.ini.getEnumNumeric(
                  "NavalTargeting",
                  d.NavalTargeting,
                  d.NavalTargeting.UnderwaterNever,
                )),
                (this.tooBigToFitUnderBridge = this.ini.getBool(
                  "TooBigToFitUnderBridge",
                  this.type === s.ObjectType.Building,
                )),
                (this.infantryAbsorb = this.ini.getBool("InfantryAbsorb")),
                (this.canBeOccupied = this.ini.getBool("CanBeOccupied") || this.infantryAbsorb),
                (this.maxNumberOccupants =
                  this.ini.getNumber("MaxNumberOccupants") || this.ini.getNumber("Passengers")),
                (this.leaveRubble = this.ini.getBool("LeaveRubble")),
                (this.undeploysInto = this.ini.getString("UndeploysInto")),
                (this.deploysInto = this.ini.getString("DeploysInto")),
                (this.deployTime = this.ini.getNumber("DeployTime")),
                (this.capturable = this.ini.getBool("Capturable")),
                (this.spyable = this.ini.getBool("Spyable")),
                (this.needsEngineer = this.ini.getBool("NeedsEngineer")),
                (this.c4 = this.ini.getBool("C4")),
                (this.canC4 = this.ini.getBool("CanC4", !0)),
                (this.eligibleForDelayKill = this.ini.getBool("EligibleForDelayKill")),
                (this.produceCashStartup = this.ini.getNumber("ProduceCashStartup")),
                (this.produceCashAmount = this.ini.getNumber("ProduceCashAmount")),
                (this.produceCashDelay = this.ini.getNumber("ProduceCashDelay")),
                (this.explosion = this.ini.getArray("Explosion")),
                (this.explodes = this.ini.getBool("Explodes")),
                (this.ifvMode = this.ini.getNumber("IFVMode")),
                (this.turretIndexesByIfvMode = this.parseTurretIndexes()),
                (this.turret = this.ini.getBool("Turret")),
                (this.turretCount = this.ini.getNumber("TurretCount", this.turret ? 1 : 0)),
                (this.turretSpins = this.ini.getBool("TurretSpins")),
                (this.turretAnim = this.ini.getString("TurretAnim")),
                (this.turretAnimIsVoxel = this.ini.getBool("TurretAnimIsVoxel")),
                (this.turretAnimX = this.ini.getNumber("TurretAnimX")),
                (this.turretAnimY = this.ini.getNumber("TurretAnimY")),
                (this.turretAnimZAdjust = this.ini.getNumber("TurretAnimZAdjust")),
                (this.isChargeTurret = this.ini.getBool("IsChargeTurret")),
                (this.overpowerable = this.ini.getBool("Overpowerable")),
                (this.freeUnit = this.ini.getString("FreeUnit")),
                (this.primary = this.parseWeaponName(this.ini.getString("Primary"))),
                (this.secondary = this.parseWeaponName(this.ini.getString("Secondary"))),
                (this.elitePrimary = this.parseWeaponName(this.ini.getString("ElitePrimary"))),
                (this.eliteSecondary = this.parseWeaponName(this.ini.getString("EliteSecondary"))),
                (this.weaponCount = this.ini.getNumber("WeaponCount")),
                // OpenYRWeb: Gattling weapon system parameters (vanilla YR). IsGattling enables
                // the stage-based weapon pair system; WeaponStages defines how many phases exist;
                // StageX/EliteStageX are timer thresholds; RateUp/RateDown control spin-up/down.
                // Keep these as expressions (not statements) so the minified comma-expression in
                // parse() stays syntactically valid.
                (this.isGattling = this.ini.getBool("IsGattling")),
                (this.weaponStages = this.ini.getNumber("WeaponStages", 1)),
                (this.stageThresholds = Array.from({ length: this.weaponStages }, (e, t) => this.ini.getNumber("Stage" + (t + 1), Number.POSITIVE_INFINITY))),
                (this.eliteStageThresholds = Array.from({ length: this.weaponStages }, (e, t) => this.ini.getNumber("EliteStage" + (t + 1), Number.POSITIVE_INFINITY))),
                (this.rateUp = this.ini.getNumber("RateUp", 1)),
                (this.rateDown = this.ini.getNumber("RateDown", 1)),
                (this.deathWeapon = this.parseWeaponName(this.ini.getString("DeathWeapon"))),
                (this.deathWeaponDamageModifier = this.ini.getNumber("DeathWeaponDamageModifier", 1)),
                (this.occupyWeapon = this.parseWeaponName(this.ini.getString("OccupyWeapon"))),
                (this.eliteOccupyWeapon = this.parseWeaponName(this.ini.getString("EliteOccupyWeapon"))),
                (this.veteranAbilities = new Set(this.ini.getEnumArray("VeteranAbilities", m.VeteranAbility))),
                (this.eliteAbilities = new Set([
                  ...this.veteranAbilities,
                  ...this.ini.getEnumArray("EliteAbilities", m.VeteranAbility),
                ])),
                (this.selfHealing = this.ini.getBool("SelfHealing")),
                (this.wall = this.ini.getBool("Wall")),
                (this.gate = this.ini.getBool("Gate")),
                (this.armor = this.ini.getEnum("Armor", h.ArmorType, h.ArmorType.None, !0)),
                (this.strength = Math.floor(this.ini.getNumber("Strength"))),
                (this.immune = this.ini.getBool("Immune")),
                (this.immuneToRadiation = this.ini.getBool("ImmuneToRadiation")),
                (this.immuneToPsionics = this.ini.getBool("ImmuneToPsionics")),
                // OpenYRWeb: MindControlOverload — enables infinite mind control with self-damage
                // when exceeding the weapon's Damage (safe capacity). Used by Mastermind (MIND).
                (this.mindControlOverload = this.ini.getBool("MindControlOverload", !1)),
                (this.typeImmune = this.ini.getBool("TypeImmune")),
                (this.damageSelf = this.ini.getBool("DamageSelf")),
                (this.warpable = this.ini.getBool("Warpable", !0)),
                (this.isTilter = this.ini.getBool("IsTilter", !0)),
                (this.walkRate = this.ini.getNumber("WalkRate", 1)),
                (this.idleRate = this.ini.getNumber("IdleRate", 0)),
                (this.noSpawnAlt = this.ini.getBool("NoSpawnAlt")),
                (this.crusher = this.ini.getBool("Crusher")),
                (this.consideredAircraft = this.ini.getBool("ConsideredAircraft")),
                (this.crashable = this.ini.getBool("Crashable")));
              var i = this.ini.getBool("Landable");
              ((this.landable = i),
                (this.airportBound = this.ini.getBool("AirportBound")),
                (this.balloonHover = this.ini.getBool("BalloonHover")),
                (this.hoverAttack = this.ini.getBool("HoverAttack")),
                (this.omniFire = this.ini.getBool("OmniFire")),
                (this.fighter = this.ini.getBool("Fighter")),
                (this.flightLevel = this.ini.getNumber("FlightLevel") || void 0));
              var r = this.ini.getString("Locomotor"),
                e = this.type === s.ObjectType.Building ? l.LocomotorType.Statue : l.LocomotorType.Chrono;
              if (
                (r
                  ? (t = l.locomotorTypesByClsId.get(r))
                    ? (this.locomotor = t)
                    : (console.warn(`Object rules "${this.name}" has invalid Locomotor "${r}"`), (this.locomotor = e))
                  : (this.locomotor = e),
                this.locomotor !== l.LocomotorType.Statue)
              ) {
                let e = l.defaultSpeedsByLocomotor.get(this.locomotor);
                (void 0 === e &&
                  (this.type === s.ObjectType.Aircraft || this.consideredAircraft
                    ? (e = n.SpeedType.Winged)
                    : this.type === s.ObjectType.Vehicle
                      ? (e = this.crusher ? n.SpeedType.Track : n.SpeedType.Wheel)
                      : this.type === s.ObjectType.Infantry && (e = n.SpeedType.Foot)),
                  (this.speedType = this.ini.getEnum("SpeedType", n.SpeedType, e, !0)));
              }
              e = [l.LocomotorType.Ship, l.LocomotorType.Vehicle, l.LocomotorType.Chrono].includes(this.locomotor)
                ? 65
                : 100;
              ((this.speed = g.ObjectRules.iniSpeedToLeptonsPerTick(this.ini.getNumber("Speed"), e)),
                (this.movementZone = this.ini.getEnum("MovementZone", c.MovementZone, c.MovementZone.Normal)),
                (this.fearless = this.ini.getBool("Fearless")),
                (this.deployer = this.ini.getBool("Deployer")),
                (this.deployFire = this.ini.getBool("DeployFire")),
                (this.deployFireWeapon = this.ini.getNumber("DeployFireWeapon", p.WeaponType.Secondary)),
                (this.undeployDelay = this.ini.getNumber("UndeployDelay")),
                (this.fraidycat = this.ini.getBool("Fraidycat", !1)),
                (this.isHuman = !this.ini.getBool("NotHuman")),
                (this.organic = this.type === s.ObjectType.Infantry || this.ini.getBool("Organic")),
                (this.occupier = this.ini.getBool("Occupier")),
                (this.engineer = this.ini.getBool("Engineer")),
                (this.ivan = this.ini.getBool("Ivan")),
                (this.civilian = this.ini.getBool("Civilian")),
                (this.agent = this.ini.getBool("Agent")),
                (this.infiltrate = this.ini.getBool("Infiltrate")),
                (this.threatPosed = this.ini.getNumber("ThreatPosed")),
                (this.specialThreatValue = this.ini.getNumber("SpecialThreatValue")),
                (this.canPassiveAquire = this.ini.getBool("CanPassiveAquire", !0)),
                (this.canRetaliate = this.ini.getBool("CanRetaliate", !0)),
                (this.preventAttackMove = this.ini.getBool("PreventAttackMove")),
                (this.opportunityFire = this.ini.getBool("OpportunityFire")),
                (this.distributedFire = this.ini.getBool("DistributedFire")),
                (this.radialFireSegments = this.ini.getNumber("RadialFireSegments")),
                (this.attackCursorOnFriendlies = this.ini.getBool("AttackCursorOnFriendlies")),
                (this.bombable = this.ini.getBool("Bombable", !0)),
                (this.trainable = this.ini.getBool("Trainable", this.type !== s.ObjectType.Building)),
                (this.crewed = this.ini.getBool("Crewed")),
                (this.parasiteable = this.ini.getBool("Parasiteable", this.type !== s.ObjectType.Building)),
                (this.suppressionThreshold = this.ini.getNumber("SuppressionThreshold")),
                (this.reselectIfLimboed = this.ini.getBool("ReselectIfLimboed")),
                (this.rejoinTeamIfLimboed = this.ini.getBool("RejoinTeamIfLimboed")),
                (this.weight = this.ini.getNumber("Weight")),
                (this.accelerates = this.ini.getBool("Accelerates", !0)),
                (this.accelerationFactor = this.ini.getNumber("AccelerationFactor", 0.03)),
                (this.teleporter = this.ini.getBool("Teleporter")),
                (this.canDisguise = this.ini.getBool("CanDisguise")),
                (this.disguiseWhenStill = this.ini.getBool("DisguiseWhenStill")),
                (this.permaDisguise = this.ini.getBool("PermaDisguise")),
                (this.detectDisguise = this.ini.getBool("DetectDisguise")),
                (this.detectDisguiseRange = this.ini.getNumber("DetectDisguiseRange")),
                (this.cloakable = this.ini.getBool("Cloakable")),
                (this.sensors = this.ini.getBool("Sensors")),
                (this.sensorArray = this.ini.getBool("SensorArray")),
                (this.sensorsSight = this.ini.getNumber("SensorsSight")),
                (this.burstDelay = this.parseBurstDelay()),
                (this.vhpScan = this.ini.getEnum("VHPScan", f.VhpScan, f.VhpScan.None, !0)),
                (this.pip = this.ini.getEnum("Pip", o.PipColor, o.PipColor.Green, !0)),
                // OpenYRWeb: PipScale — determines the type of pips shown below units.
                (this.pipScale = this.ini.getEnum("PipScale", P.PipScale, P.PipScale.None, !0)),
                (this.passengers = this.ini.getNumber("Passengers")),
                (this.gunner = this.ini.getBool("Gunner")),
                (this.ammo = this.ini.getNumber("Ammo", -1)),
                (this.initialAmmo = this.ini.getNumber("InitialAmmo", -1)),
                (this.manualReload = this.ini.getBool("ManualReload", this.type === s.ObjectType.Aircraft)),
                (this.storage = this.ini.getNumber("Storage")),
                (this.spawned = this.ini.getBool("Spawned")),
                (this.spawns = this.ini.getString("Spawns")),
                (this.spawnsNumber = this.ini.getNumber("SpawnsNumber")),
                (this.spawnRegenRate = this.ini.getNumber("SpawnRegenRate")),
                (this.spawnReloadRate = this.ini.getNumber("SpawnReloadRate")),
                (this.missileSpawn = this.ini.getBool("MissileSpawn")),
                (this.size = this.ini.getNumber("Size", 1)),
                (this.sizeLimit = this.ini.getNumber("SizeLimit")),
                (this.sight = Math.min(b.MAX_SIGHT, this.needsEngineer ? 6 : this.ini.getNumber("Sight", 1))),
                (this.spySat = this.ini.getBool("SpySat")),
                (this.gapGenerator = this.ini.getBool("GapGenerator")),
                (this.gapRadiusInCells = this.ini.getNumber("GapRadiusInCells")),
                (this.psychicDetectionRadius = this.ini.getNumber("PsychicDetectionRadius")),
                (this.hasRadialIndicator = this.ini.getBool("HasRadialIndicator")),
                (this.harvester = this.ini.getBool("Harvester")),
                // OpenYRWeb: Drainable=yes marks buildings whose output can be siphoned by a
                // Floating Disc (DISCUS) hovering over them — refineries, slave miners, power
                // plants, and powered base defenses (vanilla YR). Parsed but the drain behaviour
                // itself lives in DrainTrait (attached to Harvester units). See ModEnc/Harvester.
                (this.drainable = this.ini.getBool("Drainable")),
                // OpenYRWeb: SlaveMiner economy (YR Yuri faction). In vanilla YR the Slave Miner
                // (YAREFN building / YASLMN vehicle) is identified by SlavesNumber= (the count of
                // SLAV workers it spawns) plus an optional SlaveRegenRate=. The worker type is the
                // hardcoded SLAV infantry (the rulesmd never names it per-building). We expose both
                // spellings for robustness: SlavesNumber (vanilla YR) and InitialSlaves (fallback).
                // The spawned workers walk to ore, harvest one bail, walk back, and dump (credits +=);
                // killed workers respawn after SlaveRegenRate= frames. See SlaveMinerTrait + SlaveGatherTask.
                ((this.slaves = this.ini.getString("Slaves") || "SLAV"),
                  (this.slaveMiner = !!this.ini.getString("SlavesNumber") || !!this.ini.getString("Slaves")),
                  (this.initialSlaves =
                    this.ini.getNumber("SlavesNumber", this.ini.getNumber("InitialSlaves", 4))),
                  (this.slaveRegenRate = this.ini.getNumber("SlaveRegenRate", 30))),
                (this.unloadingClass = this.ini.getString("UnloadingClass")),
                (this.dock = this.ini.getArray("Dock")),
                (this.radar = this.ini.getBool("Radar")),
                (this.radarInvisible = this.ini.getBool("RadarInvisible")),
                (this.revealToAll = this.ini.getBool("RevealToAll")),
                (this.selectable = !(this.type === s.ObjectType.Aircraft && !i) && this.ini.getBool("Selectable", !0)),
                // OpenYRWeb: Slaved=yes marks units spawned by a Slave Miner (SLAV). Such units
                // are player-owned and may be visually selected, but cannot receive movement /
                // attack / stop orders — they run their automated SlaveGatherTask harvest loop
                // exclusively. Mirrors vanilla YR behaviour for slaves. Checked in the order
                // handler (UnitSelectionHandler / world interaction) to reject commands.
                (this.slaved = this.ini.getBool("Slaved")),
                (this.isSelectableCombatant = this.ini.getBool("IsSelectableCombatant")),
                (this.invisibleInGame = this.ini.getBool("InvisibleInGame")),
                (this.moveToShroud = this.ini.getBool("MoveToShroud", this.type !== s.ObjectType.Aircraft)),
                (this.leadershipRating = this.ini.getNumber("LeadershipRating", 5)),
                (this.unnatural = this.ini.getBool("Unnatural")),
                (this.natural = this.ini.getBool("Natural")),
                (this.buildTimeMultiplier = this.ini.getFixed("BuildTimeMultiplier", 1)),
                (this.allowedToStartInMultiplayer = this.ini.getBool("AllowedToStartInMultiplayer", !0)),
                (this.rot = g.ObjectRules.iniRotToDegsPerTick(this.ini.getNumber("ROT", 0))),
                (this.jumpjetAccel = this.ini.getNumber("JumpJetAccel", 2)),
                (this.jumpjetClimb = this.ini.getNumber("JumpjetClimb", 5)),
                (this.jumpjetCrash = this.ini.getNumber("JumpjetCrash", 5)),
                (this.jumpjetDeviation = this.ini.getNumber("JumpjetDeviation", 40)),
                (this.jumpjetHeight = this.ini.getNumber("JumpjetHeight", 500)),
                (this.jumpjetNoWobbles = this.ini.getBool("JumpjetNoWobbles")),
                (this.tiltCrashJumpjet = this.ini.getBool("TiltCrashJumpjet")),
                (this.jumpjetSpeed = this.ini.getNumber("JumpjetSpeed", 14)),
                (this.jumpjetTurnRate = g.ObjectRules.iniRotToDegsPerTick(this.ini.getNumber("JumpJetTurnRate", 4))),
                (this.jumpjetWobbles = this.ini.getNumber("JumpjetWobbles", 0.15)),
                (this.pitchSpeed = this.ini.getNumber("PitchSpeed", 0.25)),
                (this.pitchAngle = 1 <= this.pitchSpeed ? 0 : 20),
                (this.damageParticleSystems = this.ini.getArray("DamageParticleSystems")));
              i = this.ini.getNumberArray("DamageSmokeOffset", void 0, [0, 0, 0]);
              ((this.damageSmokeOffset = new y.Vector3(i[0], i[2] / Math.SQRT2, i[1])),
                (this.minDebris = this.ini.getNumber("MinDebris")),
                (this.maxDebris = this.ini.getNumber("MaxDebris")),
                (this.debrisTypes = this.ini.getArray("DebrisTypes")),
                (this.debrisAnims = this.ini.getArray("DebrisAnims")),
                (this.isLightpost = "GALITE" === this.imageName),
                (this.lightVisibility = this.ini.getNumber("LightVisibility", 5e3)),
                (this.lightIntensity = this.ini.getNumber("LightIntensity")),
                (this.lightRedTint = this.ini.getNumber("LightRedTint", 1)),
                (this.lightGreenTint = this.ini.getNumber("LightGreenTint", 1)),
                (this.lightBlueTint = this.ini.getNumber("LightBlueTint", 1)),
                (this.ambientSound = this.ini.getString("AmbientSound") || void 0),
                (this.createSound = this.ini.getString("CreateSound") || void 0),
                (this.deploySound = this.ini.getString("DeploySound") || void 0),
                (this.undeploySound = this.ini.getString("UndeploySound") || void 0),
                (this.packupSound = this.ini.getString("PackupSound") || void 0),
                (this.voiceSelect = this.ini.getString("VoiceSelect") || void 0),
                (this.voiceMove = this.ini.getString("VoiceMove") || void 0),
                (this.voiceAttack = this.ini.getString("VoiceAttack") || void 0),
                (this.voiceFeedback = this.ini.getString("VoiceFeedback") || void 0),
                (this.voiceSpecialAttack = this.ini.getString("VoiceSpecialAttack") || void 0),
                (this.voiceSecondaryWeaponAttack = this.ini.getString("VoiceSecondaryWeaponAttack") || void 0),
                (this.voiceEnter = this.ini.getString("VoiceEnter") || void 0),
                (this.voiceCapture = this.ini.getString("VoiceCapture") || void 0),
                (this.voiceCrashing = this.ini.getString("VoiceCrashing") || void 0),
                (this.crashingSound = this.ini.getString("CrashingSound") || void 0),
                (this.impactLandSound = this.ini.getString("ImpactLandSound") || void 0),
                (this.auxSound1 = this.ini.getString("AuxSound1") || void 0),
                (this.auxSound2 = this.ini.getString("AuxSound2") || void 0),
                (this.dieSound = this.ini.getString("DieSound") || void 0),
                (this.moveSound = this.ini.getString("MoveSound") || void 0),
                (this.enterWaterSound = this.ini.getString("EnterWaterSound") || void 0),
                (this.leaveWaterSound = this.ini.getString("LeaveWaterSound") || void 0),
                (this.turretRotateSound = this.ini.getString("TurretRotateSound") || void 0),
                (this.workingSound = this.ini.getString("WorkingSound") || void 0),
                (this.notWorkingSound = this.ini.getString("NotWorkingSound") || void 0),
                (this.chronoInSound = this.ini.getString("ChronoInSound") || void 0),
                (this.chronoOutSound = this.ini.getString("ChronoOutSound") || void 0),
                (this.enterTransportSound = this.ini.getString("EnterTransportSound") || void 0),
                (this.leaveTransportSound = this.ini.getString("LeaveTransportSound") || void 0));
            }
            parseWeaponName(e) {
              return e && "none" !== e.toLowerCase() ? e : void 0;
            }
            parseTurretIndexes() {
              let r = new Map();
              return (
                this.ini.getBool("Gunner") &&
                  this.ini.entries.forEach((e, t) => {
                    var i = t.match(/^(.*)TurretWeapon$/i);
                    i && ((i = i[1] + "TurretIndex"), this.ini.has(i) && r.set(Number(e), this.ini.getNumber(i)));
                  }),
                r
              );
            }
            parseBurstDelay() {
              let e = [];
              for (let t = 0; t < 4; ++t)
                e.push(this.ini.has("BurstDelay" + t) ? this.ini.getNumber("BurstDelay" + t) : void 0);
              return e;
            }
            hasOwner(e) {
              return !!this.owner.length && -1 !== this.owner.indexOf(e.name);
            }
            isAvailableTo(e) {
              return (
                (!this.requiredHouses.length || -1 !== this.requiredHouses.indexOf(e.name)) &&
                -1 === this.forbiddenHouses.indexOf(e.name)
              );
            }
            getWeaponAtIndex(e) {
              return this.parseWeaponName(this.ini.getString("Weapon" + (e + 1)));
            }
            getEliteWeaponAtIndex(e) {
              // OpenYRWeb: fall back to the non-elite WeaponN when EliteWeaponN is absent/none.
              // Vanilla YR uses the corresponding non-elite weapon for elite units if no elite
              // override is defined; without this, an elite gattling with an incomplete
              // EliteWeaponN table would resolve to undefined and break.
              var elite = this.parseWeaponName(this.ini.getString("EliteWeapon" + (e + 1)));
              return void 0 !== elite ? elite : this.getWeaponAtIndex(e);
            }
          }),
          t("TechnoRules", b),
          (b.MAX_SIGHT = 11));
      },
    };
  },
);
