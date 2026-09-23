/**
 * GeneralRules — [General] 段总规则（全局参数的汇聚点）。
 *
 * 游戏各系统共用的全局参数都在这里：视野/迷雾、建造速度与电力惩罚、
 * 超时空与隐形参数、工程师占领、矿石 harvest、奴隶矿车扫描半径、
 * 空降编队（paradrop 子规则）、雷达/修理/乘员/老兵/光棱/威胁/闪电
 * 风暴/悬浮/导弹三兄弟等子规则（各由 general/* 子类解析），以及六张
 * 前置表（PrerequisitePower/Factory/Barracks/Radar/Tech/Proc，
 * readPrereqCategories 强制全部存在，缺失即抛错）。
 *
 * getMissileRules(type)：按弹体 INI 名在 V3/DMisl/CMisl 三个子规则间
 * 分发，未登记的类型抛错。
 *
 * 由 game/rules/GeneralRules.ts.js 重写为 TS（行为完全一致）。两个文件
 * 并存期间，本文件才是修改目标：tools/repack.mjs 打包时优先采用 .ts
 * 模块的编译产物。
 *
 * 两个文件并存期间，本文件才是修改目标：tools/repack.mjs 打包时优先采用 .ts 模块的编译产物。
 */
import { RadarRules } from "game/rules/general/RadarRules";
import { RepairRules } from "game/rules/general/RepairRules";
import { VeteranRules } from "game/rules/general/VeteranRules";
import { CrewRules } from "game/rules/general/CrewRules";
import { PrismRules } from "game/rules/general/PrismRules";
import { ThreatRules } from "game/rules/general/ThreatRules";
import { ParadropRules } from "game/rules/general/ParadropRules";
import { LightningStormRules } from "game/rules/general/LightningStormRules";
import { V3RocketRules } from "game/rules/general/V3RocketRules";
import { DMislRules } from "game/rules/general/DMislRules";
import { CMislRules } from "game/rules/general/CMislRules";
import { HoverRules } from "game/rules/general/HoverRules";
import { clamp } from "util/math";

/** 前置类别：决定每类建筑的前置表用 [General] 里哪一组键。 */
export enum PrereqCategory {
  /** 电力建筑。 */
  Power = 0,
  /** 生产工厂。 */
  Factory = 1,
  /** 兵营。 */
  Barracks = 2,
  /** 雷达。 */
  Radar = 3,
  /** 科技建筑。 */
  Tech = 4,
  /** 矿厂。 */
  Proc = 5,
}

/** 前置类别 → [General] 中对应前置数组的键名。 */
const PREREQ_CATEGORY_KEYS = new Map<PrereqCategory, string>()
  .set(PrereqCategory.Power, "PrerequisitePower")
  .set(PrereqCategory.Factory, "PrerequisiteFactory")
  .set(PrereqCategory.Barracks, "PrerequisiteBarracks")
  .set(PrereqCategory.Radar, "PrerequisiteRadar")
  .set(PrereqCategory.Tech, "PrerequisiteTech")
  .set(PrereqCategory.Proc, "PrerequisiteProc");

/* eslint-disable @typescript-eslint/no-explicit-any */
export class GeneralRules {
  /** 前置类别 → 前置对象名数组（readPrereqCategories 填充）。 */
  prereqCategories = new Map();

  // ---- 子规则 ----
  /** 乘员（载具被毁逃出单位）。 */
  crew: CrewRules;
  /** DMisl 导弹。 */
  dMisl: DMislRules;
  /** CMisl 巡航导弹。 */
  cMisl: CMislRules;
  /** 悬浮运动学。 */
  hover: HoverRules;
  /** 闪电风暴。 */
  lightningStorm: LightningStormRules;
  /** 空降编队。 */
  paradrop: ParadropRules;
  /** 光棱折射。 */
  prism: PrismRules;
  /** 雷达事件。 */
  radar: RadarRules;
  /** 修理速率。 */
  repair: RepairRules;
  /** AI 威胁系数。 */
  threat: ThreatRules;
  /** V3 火箭。 */
  v3Rocket: V3RocketRules;
  /** 老兵晋升。 */
  veteran: VeteranRules;

  // ---- 视野 / 伪装 ----
  /** 飞行器驱散黑雾的半径。 */
  aircraftFogReveal: any;
  alliedDisguise: any;
  defaultMirageDisguises: any;
  infantryBlinkDisguiseTime: any;
  sovietDisguise: any;
  thirdDisguise: any;

  // ---- 建造 / 电力 ----
  baseUnit: any;
  buildSpeed: any;
  buildupTime: any;
  multipleFactory: any;
  wallBuildSpeedCoefficient: any;
  maximumQueuedObjects: any;
  lowPowerPenaltyModifier: any;
  minLowPowerProductionSpeed: any;
  maxLowPowerProductionSpeed: any;

  // ---- AI 生产扩展开关（NP2.0 / Ares / NPatch 同功能键的统一归一） ----
  /** [General] DisableParallelAIQueues（NP2.0）：yes 禁止 AI 多工厂并行生产。缺省 no。 */
  disableParallelAIQueues: boolean = false;
  /** [General] DisableAIParallelProduction（NPatch 同义键）：yes 禁止 AI 多工厂并行生产。缺省 no。 */
  disableAIParallelProduction: boolean = false;
  /** [GlobalControls] AllowParallelAIQueues（Ares，反极性）：no 禁止 AI 多工厂并行生产。缺省 yes。 */
  allowParallelAIQueues: boolean = true;
  /** [General] EnableAIBuildLimitation（NPatch）：yes 时 AI 生产也受 BuildLimit 约束。缺省 no。 */
  enableAIBuildLimitation: boolean = false;

  // ---- 超时空 ----
  chronoDelay: any;
  chronoDistanceFactor: any;
  chronoHarvTooFarDistance: any;
  chronoMinimumDelay: any;
  chronoRangeMinimum: any;
  chronoTrigger: any;

  // ---- 隐形 / 杂项地形 ----
  cloakDelay: any;
  cliffBackImpassability: any;
  closeEnough: any;
  bridgeVoxelMax: any;
  treeStrength: any;
  revealTriggerRadius: any;
  flightLevel: any;
  parachuteMaxFallRate: any;
  maxWaypointPathLength: any;
  dropPodWeapon: any;
  guardAreaTargetingDelay: any;
  normalTargetingDelay: any;
  padAircraft: any;
  purifierBonus: any;
  refundPercent: any;
  returnStructures: any;
  shipSinkingWeight: any;
  spyMoneyStealPercent: any;
  spyPowerBlackout: any;
  technician: any;
  unitsUnsellable: any;
  /** 基因突变器模式：MutateExplosion=yes 用带 CellSpread 的爆炸弹头，否则 3×3 格 MutateWarhead。 */
  mutateExplosion: any;
  maximumCheerRate: any;

  // ---- 工程师占领 ----
  engineer: any;
  engineerCaptureLevel: any;
  engineerCaptureDelay: any;
  engineerDamage: any;
  engineerAlwaysCaptureTech: any;
  engineerTechSecureTime: any;

  // ---- 采矿 / 奴隶矿车 ----
  harvesterTooFarDistance: any;
  harvesterUnit: any;
  harvestRate: any;
  slaveMinerShortScan: any;
  slaveMinerSlaveScan: any;
  slaveMinerLongScan: any;
  slaveMinerScanCorrection: any;
  slaveMinerKickFrameDelay: any;
  slavesFreeSound: any;
  slaveMinerDeploySound: any;
  slaveMinerUndeploySound: any;

  // ---- 秘密实验室 / 科技医院 ----
  secretInfantry: any;
  secretUnits: any;
  secretBuildings: any;
  selfHealInfantryFrames: any;
  selfHealInfantryAmount: any;
  selfHealUnitFrames: any;
  selfHealUnitAmount: any;

  /**
   * 从 [General] 段读取全部全局键。
   * 注意：原实现没有 return this（返回 undefined）——使用方先实例化、
   * 再单独调用 readIni（忠实保留该约定，勿改成链式）。
   */
  readIni(ini: any): void {
    this.aircraftFogReveal = ini.getNumber("AircraftFogReveal");
    this.alliedDisguise = ini.getString("AlliedDisguise");
    this.baseUnit = ini.getArray("BaseUnit");
    this.bridgeVoxelMax = ini.getNumber("BridgeVoxelMax");
    this.buildSpeed = ini.getFixed("BuildSpeed");
    this.buildupTime = ini.getNumber("BuildupTime");
    this.chronoDelay = ini.getNumber("ChronoDelay");
    this.chronoDistanceFactor = ini.getNumber("ChronoDistanceFactor", 32);
    this.chronoHarvTooFarDistance = ini.getNumber("ChronoHarvTooFarDistance");
    this.chronoMinimumDelay = ini.getNumber("ChronoMinimumDelay");
    this.chronoRangeMinimum = ini.getNumber("ChronoRangeMinimum");
    this.chronoTrigger = ini.getBool("ChronoTrigger", true);
    this.cliffBackImpassability = ini.getNumber("CliffBackImpassability", 2);
    this.cloakDelay = ini.getNumber("CloakDelay");
    this.closeEnough = ini.getNumber("CloseEnough");
    this.crew = new CrewRules().readIni(ini);
    this.defaultMirageDisguises = ini.getArray("DefaultMirageDisguises");
    this.dMisl = new DMislRules().readIni(ini);
    this.cMisl = new CMislRules().readIni(ini);
    // AI 并行生产开关：NP2.0 DisableParallelAIQueues 与 NPatch
    // DisableAIParallelProduction 是同功能键（yes = 禁止 AI 多工厂同步
    // 生产），缺省 no 保持原版多线风格；Ares 的 AllowParallelAIQueues
    // 在 [GlobalControls] 段（见 readGlobalControls），任一"禁止"即生效。
    this.disableAIParallelProduction = ini.getBool("DisableAIParallelProduction");
    this.disableParallelAIQueues = ini.getBool("DisableParallelAIQueues");
    // NPatch EnableAIBuildLimitation=yes：AI 生产同样受 BuildLimit 约束。
    // 本实现在排队与可建判定处直接跳过，不会出现 NPatch 文档警告的
    // 建筑 BuildLimit 反复"生产-退款-重试"死循环。
    this.enableAIBuildLimitation = ini.getBool("EnableAIBuildLimitation");
    this.dropPodWeapon = ini.getString("DropPodWeapon");
    this.engineer = ini.getString("Engineer");
    this.engineerCaptureLevel = ini.getFixed("EngineerCaptureLevel", 0.25);
    this.engineerCaptureDelay = ini.getNumber("EngineerCaptureDelay", 12);
    this.engineerDamage = ini.getFixed("EngineerDamage", 0.437);
    this.engineerAlwaysCaptureTech = ini.getBool("EngineerAlwaysCaptureTech", true);
    this.engineerTechSecureTime = ini.getNumber("EngineerTechSecureTime", 4);
    this.flightLevel = ini.getNumber("FlightLevel");
    this.guardAreaTargetingDelay = ini.getNumber("GuardAreaTargetingDelay");
    this.harvesterTooFarDistance = ini.getNumber("HarvesterTooFarDistance");
    this.harvesterUnit = ini.getArray("HarvesterUnit");
    this.harvestRate = ini.getNumber("HarvestRate", 2 / 60);
    this.slaveMinerShortScan = ini.getNumber("SlaveMinerShortScan", 8);
    this.slaveMinerSlaveScan = ini.getNumber("SlaveMinerSlaveScan", 14);
    this.slaveMinerLongScan = ini.getNumber("SlaveMinerLongScan", 48);
    this.slaveMinerScanCorrection = ini.getNumber("SlaveMinerScanCorrection", 3);
    this.slaveMinerKickFrameDelay = ini.getNumber("SlaveMinerKickFrameDelay", 150);
    this.slavesFreeSound = ini.getString("SlavesFreeSound");
    this.slaveMinerDeploySound = ini.getString("SlaveMinerDeploySound");
    this.slaveMinerUndeploySound = ini.getString("SlaveMinerUndeploySound");
    this.hover = new HoverRules().readIni(ini);
    this.infantryBlinkDisguiseTime = ini.getNumber("InfantryBlinkDisguiseTime");
    this.lightningStorm = new LightningStormRules().readIni(ini);
    this.lowPowerPenaltyModifier = ini.getNumber("LowPowerPenaltyModifier", 1);
    this.minLowPowerProductionSpeed = ini.getFixed("MinLowPowerProductionSpeed", 0.5);
    this.maxLowPowerProductionSpeed = ini.getFixed("MaxLowPowerProductionSpeed", 1);
    // 基因突变器模式（原版 YR [General] MutateExplosion=yes）：true 时
    // 使用带 CellSpread 的 MutateExplosionWarhead，false 用 3×3 格
    // MutateWarhead。
    this.mutateExplosion = ini.getBool("MutateExplosion");
    this.maximumCheerRate = ini.getNumber("MaximumCheerRate");
    this.maximumQueuedObjects = ini.getNumber("MaximumQueuedObjects");
    this.maxWaypointPathLength = ini.getNumber("MaxWaypointPathLength");
    this.multipleFactory = ini.getFixed("MultipleFactory", 1);
    this.normalTargetingDelay = ini.getNumber("NormalTargetingDelay");
    this.padAircraft = ini.getArray("PadAircraft");
    this.parachuteMaxFallRate = ini.getNumber("ParachuteMaxFallRate");
    this.paradrop = new ParadropRules().readIni(ini);
    this.prism = new PrismRules().readIni(ini);
    this.purifierBonus = ini.getNumber("PurifierBonus");
    this.radar = new RadarRules().readIni(ini);
    this.refundPercent = clamp(ini.getNumber("RefundPercent"), 0, 1);
    this.repair = new RepairRules().readIni(ini);
    // 秘密实验室奖励池（原版 YR Secret Lab 段）：占领 CASLAB 后可建造
    // "三列表拼接中的随机一个对象"（步兵 → 载具 → 建筑），地图载入时
    // 抽取一次（见 Game.assignSecretLabBonuses）。
    this.secretInfantry = ini.getArray("SecretInfantry");
    this.secretUnits = ini.getArray("SecretUnits");
    this.secretBuildings = ini.getArray("SecretBuildings");
    // 科技医院全图自愈全局参数：Frames 为两次自愈脉冲的间隔 tick，
    // Amount 为每 tick 每 倍率 的治疗量。
    this.selfHealInfantryFrames = ini.getNumber("SelfHealInfantryFrames", 50);
    this.selfHealInfantryAmount = ini.getNumber("SelfHealInfantryAmount", 1);
    this.selfHealUnitFrames = ini.getNumber("SelfHealUnitFrames", 50);
    this.selfHealUnitAmount = ini.getNumber("SelfHealUnitAmount", 1);
    this.returnStructures = ini.getBool("ReturnStructures");
    this.revealTriggerRadius = Math.min(10, ini.getNumber("RevealTriggerRadius"));
    this.shipSinkingWeight = ini.getNumber("ShipSinkingWeight");
    this.sovietDisguise = ini.getString("SovietDisguise");
    this.spyMoneyStealPercent = ini.getNumber("SpyMoneyStealPercent");
    this.spyPowerBlackout = ini.getNumber("SpyPowerBlackout");
    this.technician = ini.getString("Technician");
    this.thirdDisguise = ini.getString("ThirdDisguise");
    this.threat = new ThreatRules().readIni(ini);
    this.treeStrength = ini.getNumber("TreeStrength");
    this.unitsUnsellable = ini.getBool("UnitsUnsellable");
    this.v3Rocket = new V3RocketRules().readIni(ini);
    this.veteran = new VeteranRules().readIni(ini);
    this.wallBuildSpeedCoefficient = ini.getFixed("WallBuildSpeedCoefficient");
    this.readPrereqCategories(ini);
  }

  /**
   * 读取 [GlobalControls] 段的 Ares 扩展键（由 Rules.readGeneral 在
   * readIni 之后调用；段缺失时保持缺省，即原版并行风格）。
   * AllowParallelAIQueues：是否允许 AI 多工厂并行生产（缺省 yes，
   * 与 NP2.0/NPatch 的 Disable* 键反极性）。
   */
  readGlobalControls(ini: any): void {
    this.allowParallelAIQueues = ini.getBool("AllowParallelAIQueues", true);
  }

  /**
   * 读取六张前置表：任一键在 [General] 中缺失即抛错（这些表是建造
   * 前置判定的硬依赖）。
   */
  readPrereqCategories(ini: any): void {
    for (const [category, key] of PREREQ_CATEGORY_KEYS) {
      if (!ini.has(key)) throw new Error(`Missing prerequisite category ${key} in [General] section`);
      this.prereqCategories.set(category, ini.getArray(key));
    }
  }

  /** 按弹体 INI 名分发到 V3/DMisl/CMisl 子规则；未登记类型抛错。 */
  getMissileRules(type: any): any {
    switch (type) {
      case this.v3Rocket.type:
        return this.v3Rocket;
      case this.dMisl.type:
        return this.dMisl;
      case this.cMisl.type:
        return this.cMisl;
      default:
        throw new Error(`Unsupported missile type "${type}"`);
    }
  }
}
