/**
 * TechnoRules — 单位/建筑通用规则（rulesmd.ini 中 TechnoTypes 段的解析结果）。
 *
 * RA2 里所有"受战斗规则约束"的对象（步兵/载具/飞行器/建筑）共享这一层
 * 规则：造价与科技门槛、电力、生产工厂类型、武器槽（Primary/Secondary/
 * 精英槽/DeathWeapon/OccupyWeapon）、装甲与生命、移动器与速度类型、
 * 目标策略（Land/NavalTargeting）、运输与驻扎、心灵/隐形/伪装、老兵
 * 能力表、出生体（Spawns）、音效语音表……子类（InfantryRules 等）在此
 * 基础上追加各自专属键。
 *
 * 解析流程：构造时经 ObjectRules.parse() 先取通用键，再在 parse() 里按
 * 组读取本层键。多数键有与原版引擎一致的缺省值（部分缺省依赖对象类型，
 * 如建筑的 repairable 默认开启、步兵的 crushable 默认开启）。
 *
 * 本文件同时导出两个建造相关枚举：
 *  - BuildCat    ：建造成品分类（战斗/科技/资源/电力，影响侧栏分组）；
 *  - FactoryType ：生产工厂类型（决定从哪种工厂队列出）。
 *
 * 由 game/rules/TechnoRules.ts.js 重写为 TS（行为完全一致）。两个文件
 * 并存期间，本文件才是修改目标：tools/repack.mjs 打包时优先采用 .ts
 * 模块的编译产物。
 *
 * 两个文件并存期间，本文件才是修改目标：tools/repack.mjs 打包时优先采用 .ts 模块的编译产物。
 */
import { ObjectType } from "engine/type/ObjectType";
import { SideType } from "game/SideType";
import { SpeedType } from "game/type/SpeedType";
import { PipColor } from "game/type/PipColor";
import { PipScale } from "game/type/PipScale";
import { LocomotorType, defaultSpeedsByLocomotor, locomotorTypesByClsId } from "game/type/LocomotorType";
import { MovementZone } from "game/type/MovementZone";
import { ArmorType } from "game/type/ArmorType";
import { LandTargeting } from "game/type/LandTargeting";
import { NavalTargeting } from "game/type/NavalTargeting";
import { ObjectRules } from "game/rules/ObjectRules";
import { WeaponType } from "game/WeaponType";
import { VeteranAbility } from "game/gameobject/unit/VeteranAbility";
import { VhpScan } from "game/type/VhpScan";
import { Vector3 } from "game/math/Vector3";

/** 建造成品分类（侧栏 BuildCategory 分组）。 */
export enum BuildCat {
  /** 战斗单位/防御建筑。 */
  Combat = 0,
  /** 科技建筑。 */
  Tech = 1,
  /** 资源建筑（矿厂等）。 */
  Resource = 2,
  /** 电力建筑。 */
  Power = 3,
}

/** 生产工厂类型（决定该对象从哪条工厂队列生产）。 */
export enum FactoryType {
  None = 0,
  /** 建筑工厂。 */
  BuildingType = 1,
  /** 步兵工厂（兵营）。 */
  InfantryType = 2,
  /** 载具工厂（战车工厂）。 */
  UnitType = 3,
  /** 海军船坞（Factory=UnitType 且 Naval=yes 时自动归入）。 */
  NavalUnitType = 4,
  /** 空军工厂（机场/直升机坪）。 */
  AircraftType = 5,
}

/* eslint-disable @typescript-eslint/no-explicit-any */
export class TechnoRules extends ObjectRules {
  /** 视野上限（Sight= 超出按此截断）。 */
  static MAX_SIGHT = 11;

  // ---- 归属与可用性 ----
  owner: any;
  aiBasePlanningSide: number;
  requiredHouses: any;
  forbiddenHouses: any;
  requiresStolenAlliedTech: boolean;
  requiresStolenSovietTech: boolean;
  requiresStolenThirdTech: boolean;

  // ---- 造价 / 科技 / 电力 ----
  techLevel: number;
  cost: number;
  points: number;
  power: number;
  /** 原版 YR 键：生物反应堆（YAPOWR）加成——InfantryAbsorb=yes 时每驻扎一名步兵，输出额外增加 ExtraPower 电力；驻员变化时由 BioReactorPowerTrait 重算并推给玩家的电网。 */
  extraPower: number;
  powered: boolean;
  /** 原版 YR 键 PoweredUnit=yes：单位（载具/步兵）依赖其前置建筑供电——前置断电/被毁则单位瘫痪（Robot Tank 经 RobotControlTrait 使用）；与建筑的电网 Powered= 是两回事。 */
  poweredUnit: boolean;
  /** 原版 YR 键 PowersUnit=：建筑声明为哪种单位供电（如 GAROBO 填 ROBO），与单位侧 PoweredUnit=yes 配对；RobotControlTrait 扫描己方建筑匹配 powersUnit 判断单位是否可运作。 */
  powersUnit: string;
  prerequisite: any;
  prerequisiteOverride: any;
  soylent: number;
  crateGoodie: boolean;

  // ---- 建造属性 ----
  buildCat: BuildCat;
  adjacent: number;
  baseNormal: boolean;
  buildLimit: number;
  airRangeBonus: number;
  guardRange: number;
  defaultToGuardArea: boolean;
  eligibileForAllyBuilding: boolean;
  numberImpassableRows: number;
  bridgeRepairHut: boolean;
  constructionYard: boolean;
  refinery: boolean;
  unitRepair: boolean;
  unitReload: boolean;
  unitSell: boolean;
  isBaseDefense: boolean;
  superWeapon: string;
  chargedAnimTime: number;

  // ---- 水域 / 特殊经济建筑 ----
  naval: boolean;
  underwater: boolean;
  waterBound: boolean;
  orePurifier: boolean;
  cloning: boolean;
  grinding: boolean;
  /** NP2.0 扩展键：yes 时该单位 AI 不参与多工厂并行生产（仅全局未禁用时生效）。 */
  disableAIParallelProduction: boolean;
  nukeSilo: boolean;
  /** 原版 YR 键：工业工厂（NAINDP）减价乘数——按对象类别降低己方生产造价（如 UnitsCostBonus=0.75 → 载具七五折）；缺省 1（无折扣），在 ProductionTrait.tickQueue 计算单价时生效。 */
  unitsCostBonus: number;
  infantryCostBonus: number;
  aircraftCostBonus: number;
  buildingsCostBonus: number;
  defensesCostBonus: number;

  // ---- 修复 / 出售 / 可返回 ----
  repairable: boolean;
  clickRepairable: boolean;
  unsellable: boolean;
  returnable: boolean;

  // ---- 建筑功能标记 ----
  gdiBarracks: boolean;
  nodBarracks: boolean;
  numberOfDocks: number;
  factory: FactoryType;
  weaponsFactory: boolean;
  helipad: boolean;
  hospital: boolean;
  /** 原版 YR 键：科技医院自愈系数——>0 时该建筑周期性治疗地图上己方全部步兵/单位，见 TechHospitalHealTrait。 */
  infantryGainSelfHeal: number;
  unitsGainSelfHeal: number;
  landTargeting: LandTargeting;
  navalTargeting: NavalTargeting;
  tooBigToFitUnderBridge: boolean;
  infantryAbsorb: boolean;
  canBeOccupied: boolean;
  maxNumberOccupants: number;
  leaveRubble: boolean;
  undeploysInto: string;
  deploysInto: string;
  deployTime: number;
  capturable: boolean;
  /** 原版 YR 键 SecretLab=yes：科技秘密实验室（CASLAB）——占领后可获得地图载入时随机指派的建造奖励，见 GeneralRules.secretInfantry/secretUnits/secretBuildings 与 Game.assignSecretLabBonuses。 */
  secretLab: boolean;
  /** 逐建筑覆盖键（对应原版 BuildingTypeClass::GetSecretProduction）：设置后实验室固定奖励该对象，优先级 SecretInfantry > SecretUnit > SecretBuilding。 */
  secretInfantry: string;
  secretUnit: string;
  secretBuilding: string;
  spyable: boolean;
  needsEngineer: boolean;

  // ---- C4 / 爆炸 / IFV ----
  c4: boolean;
  canC4: boolean;
  eligibleForDelayKill: boolean;
  produceCashStartup: number;
  produceCashAmount: number;
  produceCashDelay: number;
  explosion: any;
  explodes: boolean;
  ifvMode: number;
  turretIndexesByIfvMode: Map<number, number>;

  // ---- 炮塔 ----
  turret: boolean;
  turretCount: number;
  turretSpins: boolean;
  turretAnim: string;
  turretAnimIsVoxel: boolean;
  turretAnimX: number;
  turretAnimY: number;
  turretAnimZAdjust: number;
  isChargeTurret: boolean;
  overpowerable: boolean;

  // ---- 武器槽 ----
  freeUnit: string;
  primary: string;
  secondary: string;
  elitePrimary: string;
  eliteSecondary: string;
  weaponCount: number;
  /** 原版 YR 盖特机炮系统：IsGattling 启用阶段式武器对；WeaponStages 定义阶段数；StageN/EliteStageN 为阶段切换阈值；RateUp/RateDown 控制转速升降。 */
  isGattling: boolean;
  weaponStages: number;
  stageThresholds: number[];
  eliteStageThresholds: number[];
  rateUp: number;
  rateDown: number;
  deathWeapon: string;
  deathWeaponDamageModifier: number;
  occupyWeapon: string;
  eliteOccupyWeapon: string;

  // ---- 老兵能力 / 装甲 / 生命 ----
  veteranAbilities: Set<VeteranAbility>;
  /** 精英能力 = 老兵能力 ∪ EliteAbilities（原版语义：升级只增不减）。 */
  eliteAbilities: Set<VeteranAbility>;
  selfHealing: boolean;
  wall: boolean;
  gate: boolean;
  armor: ArmorType;
  strength: number;

  // ---- 免疫 / 心灵 / 伪装 ----
  immune: boolean;
  immuneToRadiation: boolean;
  immuneToPsionics: boolean;
  /** 原版 YR 键 ImmuneToPoison=yes（步兵）：免疫毒气弹头（Poison=yes，如病毒狙击手的 [VirusGas] 毒雾）；病毒单位自身默认免疫。 */
  immuneToPoison: boolean;
  /** 原版 YR 键：MindControlOverload——超出生武安全容量（Damage=）时改为无限控制并自伤，超时空要塞（MIND）使用。 */
  mindControlOverload: boolean;
  typeImmune: boolean;
  damageSelf: boolean;
  warpable: boolean;

  // ---- 移动 / 动画 ----
  isTilter: boolean;
  walkRate: number;
  idleRate: number;
  noSpawnAlt: boolean;
  crusher: boolean;
  /** 原版 YR 键 OmniCrusher：需 Crusher=yes 才生效；允许碾压常规不可碾压目标（Crushable=no，如载具）；战斗要塞（BFRT）= Crusher+OmniCrusher 双开。 */
  omniCrusher: boolean;
  /** 原版 YR 键 OpenTopped：乘员可从敞开射孔自行开火（BFRT），乘员获得 OpenToppedRangeBonus(+2格) 与 OpenToppedDamageMultiplier(×1.2)；运输车自身武器独立开火。 */
  openTopped: boolean;
  /** 原版 YR 键 OpenTransportWeapon：乘员在敞开式运输车中使用的武器槽（0=主武器 1=副武器 -1=常规判定）；守护者 GGI 填 1 以便在战斗要塞里改用导弹（对空对甲）。 */
  openTransportWeapon: number;
  consideredAircraft: boolean;
  crashable: boolean;
  landable: boolean;
  airportBound: boolean;
  balloonHover: boolean;
  hoverAttack: boolean;
  omniFire: boolean;
  fighter: boolean;
  flightLevel: number;
  locomotor: LocomotorType;
  speedType: SpeedType;
  speed: number;
  movementZone: MovementZone;
  fearless: boolean;

  // ---- 部署 ----
  deployer: boolean;
  deployFire: boolean;
  deployFireWeapon: WeaponType;
  undeployDelay: number;
  fraidycat: boolean;
  isHuman: boolean;
  organic: boolean;
  occupier: boolean;
  /** 原版 YR 键 Bunker=yes（建筑）：坦克碉堡，允许载具进入获得保护。 */
  bunker: boolean;
  /** 原版 YR 键 Bunkerable（载具，默认 yes）：能否进入坦克碉堡；悬浮/飞行移动器默认 no，且需有炮塔或 OmniFire 武器。 */
  bunkerable: boolean;
  engineer: boolean;
  ivan: boolean;
  civilian: boolean;
  agent: boolean;
  infiltrate: boolean;

  // ---- 威胁与索敌 ----
  threatPosed: number;
  specialThreatValue: number;
  canPassiveAquire: boolean;
  canRetaliate: boolean;
  preventAttackMove: boolean;
  opportunityFire: boolean;
  distributedFire: boolean;
  radialFireSegments: number;
  attackCursorOnFriendlies: boolean;
  bombable: boolean;
  trainable: boolean;
  crewed: boolean;
  parasiteable: boolean;
  suppressionThreshold: number;
  reselectIfLimboed: boolean;
  rejoinTeamIfLimboed: boolean;
  weight: number;
  accelerates: boolean;
  accelerationFactor: number;

  // ---- 鲍里斯空袭（原版 YR）：副武器（照明弹）标记建筑后从地图边缘召来米格轰炸 ----
  /** 常规/精英状态呼叫的米格数量。 */
  airstrikeTeam: number;
  eliteAirstrikeTeam: number;
  /** 呼叫的机型（单位 INI 名）。 */
  airstrikeTeamType: string;
  eliteAirstrikeTeamType: string;
  /** 空袭完成后到可再次呼叫的冷却 tick。 */
  airstrikeRechargeTime: number;
  eliteAirstrikeRechargeTime: number;
  teleporter: boolean;

  // ---- 伪装 / 隐形 / 侦测 ----
  canDisguise: boolean;
  disguiseWhenStill: boolean;
  permaDisguise: boolean;
  detectDisguise: boolean;
  detectDisguiseRange: number;
  cloakable: boolean;
  sensors: boolean;
  sensorArray: boolean;
  sensorsSight: number;
  burstDelay: number[];
  vhpScan: VhpScan;

  // ---- pips / 载员 / 弹药 / 存储 ----
  pip: PipColor;
  /** 头顶 pip 刻度类别（载员/弹药/电力/矿石/心灵控制）。 */
  pipScale: PipScale;
  passengers: number;
  gunner: boolean;
  ammo: number;
  initialAmmo: number;
  manualReload: boolean;
  storage: number;

  // ---- 出生体（Spawns） ----
  spawned: boolean;
  spawns: string;
  spawnsNumber: number;
  spawnRegenRate: number;
  spawnReloadRate: number;
  missileSpawn: boolean;

  // ---- 体积 / 视野 / 雷达 ----
  size: number;
  sizeLimit: number;
  sight: number;
  spySat: boolean;
  gapGenerator: boolean;
  gapRadiusInCells: number;
  psychicDetectionRadius: number;
  hasRadialIndicator: boolean;

  // ---- 采矿 / 矿奴 ----
  harvester: boolean;
  /** 原版 YR 键 Drainable=yes：标记可被漂浮圆盘（DISCUS）悬停吸取产出的建筑（精炼厂/奴隶矿车/电厂/供电防御塔）；吸取行为本体在 DrainTrait。 */
  drainable: boolean;
  /** 矿奴经济（尤里奴隶矿车）：出生的矿奴步兵名（原版固定 SLAV）。 */
  slaves: string;
  /** 是否奴隶矿车：声明了 SlavesNumber= 或 Slaves= 即视为是。 */
  slaveMiner: boolean;
  /** 初始矿奴数量（兼容两种拼写：SlavesNumber / InitialSlaves，缺省 4）。 */
  initialSlaves: number;
  /** 被杀矿奴的重生间隔（帧）。 */
  slaveRegenRate: number;
  unloadingClass: string;
  dock: any;

  // ---- 雷达 / 选中 ----
  radar: boolean;
  radarInvisible: boolean;
  revealToAll: boolean;
  selectable: boolean;
  /** 原版 YR 键 Slaved=yes：奴隶矿车派生的矿奴——玩家所有、可被点选，但只能执行自动采集任务（拒绝移动/攻击/停止指令）。 */
  slaved: boolean;
  isSelectableCombatant: boolean;
  invisibleInGame: boolean;
  moveToShroud: boolean;
  leadershipRating: number;

  // ---- 杂项 ----
  unnatural: boolean;
  natural: boolean;
  buildTimeMultiplier: number;
  allowedToStartInMultiplayer: boolean;
  rot: number;

  // ---- 跳跃机（Jumpjet）运动学 ----
  jumpjetAccel: number;
  jumpjetClimb: number;
  jumpjetCrash: number;
  jumpjetDeviation: number;
  jumpjetHeight: number;
  jumpjetNoWobbles: boolean;
  tiltCrashJumpjet: boolean;
  jumpjetSpeed: number;
  jumpjetTurnRate: number;
  jumpjetWobbles: number;
  pitchSpeed: number;
  /** 俯冲角：直接读 INI（原版缺省 20）。此前曾由 PitchSpeed 推导（>=1 → 0），会错误地把黑鹰（PitchSpeed=1.1）的俯冲角清零。 */
  pitchAngle: number;
  damageParticleSystems: any;
  /** 受损冒烟的挂点偏移：INI 顺序为 [x, y, z]，载入时 y/z 轴对调且 z 除以 √2（地图坐标系→世界坐标系换算）。 */
  damageSmokeOffset: Vector3;

  // ---- 碎片 ----
  minDebris: number;
  maxDebris: number;
  debrisTypes: any;
  debrisAnims: any;

  // ---- 灯光（路灯 GALITE 特例） ----
  isLightpost: boolean;
  lightVisibility: number;
  lightIntensity: number;
  lightRedTint: number;
  lightGreenTint: number;
  lightBlueTint: number;

  // ---- 音效 / 语音表 ----
  ambientSound: string;
  createSound: string;
  deploySound: string;
  undeploySound: string;
  packupSound: string;
  voiceSelect: string;
  voiceSelectDeactivated: string;
  voiceMove: string;
  voiceAttack: string;
  voiceFeedback: string;
  voiceSpecialAttack: string;
  voiceSecondaryWeaponAttack: string;
  voiceEnter: string;
  voiceCapture: string;
  voiceCrashing: string;
  crashingSound: string;
  impactLandSound: string;
  auxSound1: string;
  auxSound2: string;
  dieSound: string;
  activateSound: string;
  deactivateSound: string;
  moveSound: string;
  enterWaterSound: string;
  leaveWaterSound: string;
  turretRotateSound: string;
  workingSound: string;
  notWorkingSound: string;
  chronoInSound: string;
  chronoOutSound: string;
  enterTransportSound: string;
  leaveTransportSound: string;

  constructor(type: ObjectType, ini: any, index = -1, generalRules?: any) {
    super(type, ini, index, generalRules);
  }

  parse(): void {
    super.parse();
    this.owner = this.ini.getArray("Owner");
    // AIBasePlanningSide：AI 基地规划所属阵营；未填或不是合法 SideType 名时存 undefined。
    const planningSide = this.ini.getNumber("AIBasePlanningSide");
    this.aiBasePlanningSide = planningSide !== -1 && SideType[planningSide] !== undefined ? planningSide : undefined;
    this.requiredHouses = this.ini.getArray("RequiredHouses");
    this.forbiddenHouses = this.ini.getArray("ForbiddenHouses");
    this.requiresStolenAlliedTech = this.ini.getBool("RequiresStolenAlliedTech");
    this.requiresStolenSovietTech = this.ini.getBool("RequiresStolenSovietTech");
    this.requiresStolenThirdTech = this.ini.getBool("RequiresStolenThirdTech");
    this.techLevel = this.ini.getNumber("TechLevel", -1);
    this.cost = this.ini.getNumber("Cost");
    this.points = this.ini.getNumber("Points");
    this.power = this.ini.getNumber("Power");
    this.extraPower = this.ini.getNumber("ExtraPower");
    this.powered = this.ini.getBool("Powered");
    this.poweredUnit = this.ini.getBool("PoweredUnit");
    this.powersUnit = this.ini.getString("PowersUnit");
    this.prerequisite = this.ini.getArray("Prerequisite");
    this.prerequisiteOverride = this.ini.getArray("PrerequisiteOverride");
    this.soylent = this.ini.getNumber("Soylent");
    this.crateGoodie = this.ini.getBool("CrateGoodie");
    this.buildCat = this.ini.getEnum("BuildCat", BuildCat, BuildCat.Combat);
    this.adjacent = this.ini.getNumber("Adjacent", 1);
    this.baseNormal = this.ini.getBool("BaseNormal", true);
    this.buildLimit = this.ini.getNumber("BuildLimit", Number.POSITIVE_INFINITY);
    this.airRangeBonus = this.ini.getNumber("AirRangeBonus");
    this.guardRange = this.ini.getNumber("GuardRange");
    this.defaultToGuardArea = this.ini.getBool("DefaultToGuardArea");
    this.eligibileForAllyBuilding = this.ini.getBool("EligibileForAllyBuilding");
    this.numberImpassableRows = this.ini.getNumber("NumberImpassableRows");
    this.bridgeRepairHut = this.ini.getBool("BridgeRepairHut");
    this.constructionYard = this.ini.getBool("ConstructionYard");
    this.refinery = this.ini.getBool("Refinery");
    this.unitRepair = this.ini.getBool("UnitRepair");
    this.unitReload = this.ini.getBool("UnitReload");
    this.unitSell = this.ini.getBool("UnitSell");
    this.isBaseDefense = this.ini.getBool("IsBaseDefense");
    this.superWeapon = this.parseWeaponName(this.ini.getString("SuperWeapon"));
    this.chargedAnimTime = this.ini.getNumber("ChargedAnimTime");

    // Naval=yes 除标记水域外，还会把 Factory=UnitType 归入海军船坞队列。
    const navalFlag = this.ini.getBool("Naval");
    this.naval = navalFlag;
    this.underwater = this.ini.getBool("Underwater");
    this.waterBound = this.ini.getBool("WaterBound");
    this.orePurifier = this.ini.getBool("OrePurifier");
    this.cloning = this.ini.getBool("Cloning");
    this.grinding = this.ini.getBool("Grinding");
    // NP2.0 扩展键 DisableAIParallelProduction：yes 时该单位 AI 不能
    // 多线生产（仅在全局 DisableParallelAIQueues=no 时有意义）。
    this.disableAIParallelProduction = this.ini.getBool("DisableAIParallelProduction");
    this.nukeSilo = this.ini.getBool("NukeSilo");
    this.unitsCostBonus = this.ini.getFixed("UnitsCostBonus", 1);
    this.infantryCostBonus = this.ini.getFixed("InfantryCostBonus", 1);
    this.aircraftCostBonus = this.ini.getFixed("AircraftCostBonus", 1);
    this.buildingsCostBonus = this.ini.getFixed("BuildingsCostBonus", 1);
    this.defensesCostBonus = this.ini.getFixed("DefensesCostBonus", 1);

    // 修复/出售缺省依赖对象类型：建筑默认可修复，非建筑在全局规则
    // unitsUnsellable 打开时默认不可卖；Returnable 缺省跟随全局。
    this.repairable = this.ini.getBool("Repairable", this.type === ObjectType.Building);
    this.clickRepairable = this.ini.getBool("ClickRepairable", this.type === ObjectType.Building);
    this.unsellable = this.ini.getBool(
      "Unsellable",
      this.type !== ObjectType.Building && this.generalRules.unitsUnsellable,
    );
    this.returnable = this.ini.getBool("Returnable", this.generalRules.returnStructures);
    this.gdiBarracks = this.ini.getBool("GDIBarracks");
    this.nodBarracks = this.ini.getBool("NODBarracks");
    this.numberOfDocks = this.ini.getNumber("NumberOfDocks");
    // 修理厂至少要有 1 个泊位，否则修理逻辑无从停靠。
    if (this.unitRepair && !this.numberOfDocks) this.numberOfDocks = 1;
    this.factory = this.ini.getEnum("Factory", FactoryType, FactoryType.None);
    if (this.factory === FactoryType.UnitType && navalFlag) this.factory = FactoryType.NavalUnitType;
    this.weaponsFactory = this.ini.getBool("WeaponsFactory");
    this.helipad = this.ini.getBool("Helipad");
    this.hospital = this.ini.getBool("Hospital");
    this.infantryGainSelfHeal = this.ini.getNumber("InfantryGainSelfHeal", 0);
    this.unitsGainSelfHeal = this.ini.getNumber("UnitsGainSelfHeal", 0);
    this.landTargeting = this.ini.getEnumNumeric("LandTargeting", LandTargeting, LandTargeting.LandOk);
    this.navalTargeting = this.ini.getEnumNumeric("NavalTargeting", NavalTargeting, NavalTargeting.UnderwaterNever);
    this.tooBigToFitUnderBridge = this.ini.getBool(
      "TooBigToFitUnderBridge",
      this.type === ObjectType.Building,
    );
    this.infantryAbsorb = this.ini.getBool("InfantryAbsorb");
    // 生物反应堆的驻员吸收隐含允许被占领驻扎。
    this.canBeOccupied = this.ini.getBool("CanBeOccupied") || this.infantryAbsorb;
    this.maxNumberOccupants = this.ini.getNumber("MaxNumberOccupants") || this.ini.getNumber("Passengers");
    this.leaveRubble = this.ini.getBool("LeaveRubble");
    this.undeploysInto = this.ini.getString("UndeploysInto");
    this.deploysInto = this.ini.getString("DeploysInto");
    this.deployTime = this.ini.getNumber("DeployTime");
    this.capturable = this.ini.getBool("Capturable");
    this.secretLab = this.ini.getBool("SecretLab");
    this.secretInfantry = this.ini.getString("SecretInfantry") || undefined;
    this.secretUnit = this.ini.getString("SecretUnit") || undefined;
    this.secretBuilding = this.ini.getString("SecretBuilding") || undefined;
    this.spyable = this.ini.getBool("Spyable");
    this.needsEngineer = this.ini.getBool("NeedsEngineer");
    this.c4 = this.ini.getBool("C4");
    this.canC4 = this.ini.getBool("CanC4", true);
    this.eligibleForDelayKill = this.ini.getBool("EligibleForDelayKill");
    this.produceCashStartup = this.ini.getNumber("ProduceCashStartup");
    this.produceCashAmount = this.ini.getNumber("ProduceCashAmount");
    this.produceCashDelay = this.ini.getNumber("ProduceCashDelay");
    this.explosion = this.ini.getArray("Explosion");
    this.explodes = this.ini.getBool("Explodes");
    this.ifvMode = this.ini.getNumber("IFVMode");
    this.turretIndexesByIfvMode = this.parseTurretIndexes();
    this.turret = this.ini.getBool("Turret");
    this.turretCount = this.ini.getNumber("TurretCount", this.turret ? 1 : 0);
    this.turretSpins = this.ini.getBool("TurretSpins");
    this.turretAnim = this.ini.getString("TurretAnim");
    this.turretAnimIsVoxel = this.ini.getBool("TurretAnimIsVoxel");
    this.turretAnimX = this.ini.getNumber("TurretAnimX");
    this.turretAnimY = this.ini.getNumber("TurretAnimY");
    this.turretAnimZAdjust = this.ini.getNumber("TurretAnimZAdjust");
    this.isChargeTurret = this.ini.getBool("IsChargeTurret");
    this.overpowerable = this.ini.getBool("Overpowerable");
    this.freeUnit = this.ini.getString("FreeUnit");
    this.primary = this.parseWeaponName(this.ini.getString("Primary"));
    this.secondary = this.parseWeaponName(this.ini.getString("Secondary"));
    this.elitePrimary = this.parseWeaponName(this.ini.getString("ElitePrimary"));
    this.eliteSecondary = this.parseWeaponName(this.ini.getString("EliteSecondary"));
    this.weaponCount = this.ini.getNumber("WeaponCount");
    this.isGattling = this.ini.getBool("IsGattling");
    this.weaponStages = this.ini.getNumber("WeaponStages", 1);
    // 阶段阈值数组：Stage1..N / EliteStage1..N，未声明的阶段用 +∞（永不切换）。
    this.stageThresholds = Array.from({ length: this.weaponStages }, (_, i) =>
      this.ini.getNumber("Stage" + (i + 1), Number.POSITIVE_INFINITY),
    );
    this.eliteStageThresholds = Array.from({ length: this.weaponStages }, (_, i) =>
      this.ini.getNumber("EliteStage" + (i + 1), Number.POSITIVE_INFINITY),
    );
    this.rateUp = this.ini.getNumber("RateUp", 1);
    this.rateDown = this.ini.getNumber("RateDown", 1);
    this.deathWeapon = this.parseWeaponName(this.ini.getString("DeathWeapon"));
    this.deathWeaponDamageModifier = this.ini.getNumber("DeathWeaponDamageModifier", 1);
    this.occupyWeapon = this.parseWeaponName(this.ini.getString("OccupyWeapon"));
    this.eliteOccupyWeapon = this.parseWeaponName(this.ini.getString("EliteOccupyWeapon"));
    this.veteranAbilities = new Set(this.ini.getEnumArray("VeteranAbilities", VeteranAbility));
    // 精英能力继承全部老兵能力再叠加 EliteAbilities。
    this.eliteAbilities = new Set([
      ...this.veteranAbilities,
      ...this.ini.getEnumArray("EliteAbilities", VeteranAbility),
    ]);
    this.selfHealing = this.ini.getBool("SelfHealing");
    this.wall = this.ini.getBool("Wall");
    this.gate = this.ini.getBool("Gate");
    this.armor = this.ini.getEnum("Armor", ArmorType, ArmorType.None, true);
    this.strength = Math.floor(this.ini.getNumber("Strength"));
    this.immune = this.ini.getBool("Immune");
    this.immuneToRadiation = this.ini.getBool("ImmuneToRadiation");
    this.immuneToPsionics = this.ini.getBool("ImmuneToPsionics");
    this.immuneToPoison = this.ini.getBool("ImmuneToPoison");
    this.mindControlOverload = this.ini.getBool("MindControlOverload", false);
    this.typeImmune = this.ini.getBool("TypeImmune");
    this.damageSelf = this.ini.getBool("DamageSelf");
    this.warpable = this.ini.getBool("Warpable", true);
    this.isTilter = this.ini.getBool("IsTilter", true);
    this.walkRate = this.ini.getNumber("WalkRate", 1);
    this.idleRate = this.ini.getNumber("IdleRate", 0);
    this.noSpawnAlt = this.ini.getBool("NoSpawnAlt");
    this.crusher = this.ini.getBool("Crusher");
    this.omniCrusher = this.ini.getBool("OmniCrusher");
    this.openTopped = this.ini.getBool("OpenTopped");
    this.openTransportWeapon = this.ini.getNumber("OpenTransportWeapon", -1);
    this.consideredAircraft = this.ini.getBool("ConsideredAircraft");
    this.crashable = this.ini.getBool("Crashable");
    // Landable 先读出（飞行器默认不可点选的判定要用它）。
    const landable = this.ini.getBool("Landable");
    this.landable = landable;
    this.airportBound = this.ini.getBool("AirportBound");
    this.balloonHover = this.ini.getBool("BalloonHover");
    this.hoverAttack = this.ini.getBool("HoverAttack");
    this.omniFire = this.ini.getBool("OmniFire");
    this.fighter = this.ini.getBool("Fighter");
    this.flightLevel = this.ini.getNumber("FlightLevel") || undefined;

    // 移动器解析：建筑缺省 Statue、其余缺省 Chrono；CLSID 无效时告警并
    // 落回缺省。Statue 不解析 SpeedType；其余按移动器缺省 → 类型缺省
    // （飞行器 Winged、载具按碾压 Track/Wheel、步兵 Foot）→ INI 覆盖。
    const clsid = this.ini.getString("Locomotor");
    const defaultLocomotor =
      this.type === ObjectType.Building ? LocomotorType.Statue : LocomotorType.Chrono;
    if (clsid) {
      const mapped = locomotorTypesByClsId.get(clsid);
      if (mapped) {
        this.locomotor = mapped;
      } else {
        console.warn(`Object rules "${this.name}" has invalid Locomotor "${clsid}"`);
        this.locomotor = defaultLocomotor;
      }
    } else {
      this.locomotor = defaultLocomotor;
    }
    if (this.locomotor !== LocomotorType.Statue) {
      let defaultSpeed = defaultSpeedsByLocomotor.get(this.locomotor);
      if (defaultSpeed === undefined) {
        if (this.type === ObjectType.Aircraft || this.consideredAircraft) defaultSpeed = SpeedType.Winged;
        else if (this.type === ObjectType.Vehicle) defaultSpeed = this.crusher ? SpeedType.Track : SpeedType.Wheel;
        else if (this.type === ObjectType.Infantry) defaultSpeed = SpeedType.Foot;
      }
      this.speedType = this.ini.getEnum("SpeedType", SpeedType, defaultSpeed, true);
    }
    // 舰船/载具/超时空基础帧率 65，其余 100（同速值下实际位移不同）。
    const speedFrameRate = [LocomotorType.Ship, LocomotorType.Vehicle, LocomotorType.Chrono].includes(
      this.locomotor,
    )
      ? 65
      : 100;
    this.speed = ObjectRules.iniSpeedToLeptonsPerTick(this.ini.getNumber("Speed"), speedFrameRate);
    this.movementZone = this.ini.getEnum("MovementZone", MovementZone, MovementZone.Normal);
    this.fearless = this.ini.getBool("Fearless");
    this.deployer = this.ini.getBool("Deployer");
    this.deployFire = this.ini.getBool("DeployFire");
    this.deployFireWeapon = this.ini.getNumber("DeployFireWeapon", WeaponType.Secondary);
    this.undeployDelay = this.ini.getNumber("UndeployDelay");
    this.fraidycat = this.ini.getBool("Fraidycat", false);
    this.isHuman = !this.ini.getBool("NotHuman");
    this.organic = this.type === ObjectType.Infantry || this.ini.getBool("Organic");
    this.occupier = this.ini.getBool("Occupier");
    this.bunker = this.ini.getBool("Bunker");
    this.bunkerable = this.ini.getBool("Bunkerable", true);
    this.engineer = this.ini.getBool("Engineer");
    this.ivan = this.ini.getBool("Ivan");
    this.civilian = this.ini.getBool("Civilian");
    this.agent = this.ini.getBool("Agent");
    this.infiltrate = this.ini.getBool("Infiltrate");
    this.threatPosed = this.ini.getNumber("ThreatPosed");
    this.specialThreatValue = this.ini.getNumber("SpecialThreatValue");
    this.canPassiveAquire = this.ini.getBool("CanPassiveAquire", true);
    this.canRetaliate = this.ini.getBool("CanRetaliate", true);
    this.preventAttackMove = this.ini.getBool("PreventAttackMove");
    this.opportunityFire = this.ini.getBool("OpportunityFire");
    this.distributedFire = this.ini.getBool("DistributedFire");
    this.radialFireSegments = this.ini.getNumber("RadialFireSegments");
    this.attackCursorOnFriendlies = this.ini.getBool("AttackCursorOnFriendlies");
    this.bombable = this.ini.getBool("Bombable", true);
    this.trainable = this.ini.getBool("Trainable", this.type !== ObjectType.Building);
    this.crewed = this.ini.getBool("Crewed");
    this.parasiteable = this.ini.getBool("Parasiteable", this.type !== ObjectType.Building);
    this.suppressionThreshold = this.ini.getNumber("SuppressionThreshold");
    this.reselectIfLimboed = this.ini.getBool("ReselectIfLimboed");
    this.rejoinTeamIfLimboed = this.ini.getBool("RejoinTeamIfLimboed");
    this.weight = this.ini.getNumber("Weight");
    this.accelerates = this.ini.getBool("Accelerates");
    this.accelerationFactor = this.ini.getNumber("AccelerationFactor", 0.03);
    this.airstrikeTeam = this.ini.getNumber("AirstrikeTeam", 0);
    this.eliteAirstrikeTeam = this.ini.getNumber("EliteAirstrikeTeam", 0);
    this.airstrikeTeamType = this.ini.getString("AirstrikeTeamType") || undefined;
    this.eliteAirstrikeTeamType = this.ini.getString("EliteAirstrikeTeamType") || undefined;
    this.airstrikeRechargeTime = this.ini.getNumber("AirstrikeRechargeTime", 100);
    this.eliteAirstrikeRechargeTime = this.ini.getNumber("EliteAirstrikeRechargeTime", 50);
    this.teleporter = this.ini.getBool("Teleporter");
    this.canDisguise = this.ini.getBool("CanDisguise");
    this.disguiseWhenStill = this.ini.getBool("DisguiseWhenStill");
    this.permaDisguise = this.ini.getBool("PermaDisguise");
    this.detectDisguise = this.ini.getBool("DetectDisguise");
    this.detectDisguiseRange = this.ini.getNumber("DetectDisguiseRange");
    this.cloakable = this.ini.getBool("Cloakable");
    this.sensors = this.ini.getBool("Sensors");
    this.sensorArray = this.ini.getBool("SensorArray");
    this.sensorsSight = this.ini.getNumber("SensorsSight");
    this.burstDelay = this.parseBurstDelay();
    this.vhpScan = this.ini.getEnum("VHPScan", VhpScan, VhpScan.None, true);
    this.pip = this.ini.getEnum("Pip", PipColor, PipColor.Green, true);
    this.pipScale = this.ini.getEnum("PipScale", PipScale, PipScale.None, true);
    this.passengers = this.ini.getNumber("Passengers");
    this.gunner = this.ini.getBool("Gunner");
    this.ammo = this.ini.getNumber("Ammo", -1);
    this.initialAmmo = this.ini.getNumber("InitialAmmo", -1);
    this.manualReload = this.ini.getBool("ManualReload", this.type === ObjectType.Aircraft);
    this.storage = this.ini.getNumber("Storage");
    this.spawned = this.ini.getBool("Spawned");
    this.spawns = this.ini.getString("Spawns");
    this.spawnsNumber = this.ini.getNumber("SpawnsNumber");
    this.spawnRegenRate = this.ini.getNumber("SpawnRegenRate");
    this.spawnReloadRate = this.ini.getNumber("SpawnReloadRate");
    this.missileSpawn = this.ini.getBool("MissileSpawn");
    this.size = this.ini.getNumber("Size", 1);
    this.sizeLimit = this.ini.getNumber("SizeLimit");
    this.sight = Math.min(TechnoRules.MAX_SIGHT, this.needsEngineer ? 6 : this.ini.getNumber("Sight", 1));
    this.spySat = this.ini.getBool("SpySat");
    this.gapGenerator = this.ini.getBool("GapGenerator");
    this.gapRadiusInCells = this.ini.getNumber("GapRadiusInCells");
    this.psychicDetectionRadius = this.ini.getNumber("PsychicDetectionRadius");
    this.hasRadialIndicator = this.ini.getBool("HasRadialIndicator");
    this.harvester = this.ini.getBool("Harvester");
    this.drainable = this.ini.getBool("Drainable");
    // 矿奴字段：Slaves= 为矿奴单位名（缺省 SLAV）；声明 SlavesNumber= 或
    // Slaves= 都视为奴隶矿车；InitialSlaves= 作为数量兜底拼写。
    this.slaves = this.ini.getString("Slaves") || "SLAV";
    this.slaveMiner = !!this.ini.getString("SlavesNumber") || !!this.ini.getString("Slaves");
    this.initialSlaves = this.ini.getNumber("SlavesNumber", this.ini.getNumber("InitialSlaves", 4));
    this.slaveRegenRate = this.ini.getNumber("SlaveRegenRate", 30);
    this.unloadingClass = this.ini.getString("UnloadingClass");
    this.dock = this.ini.getArray("Dock");
    this.radar = this.ini.getBool("Radar");
    this.radarInvisible = this.ini.getBool("RadarInvisible");
    this.revealToAll = this.ini.getBool("RevealToAll");
    // 不能降落的飞行器不可被选中（强制不可选），其余走 Selectable=（默认可选）。
    this.selectable = !(this.type === ObjectType.Aircraft && !landable) && this.ini.getBool("Selectable", true);
    this.slaved = this.ini.getBool("Slaved");
    this.isSelectableCombatant = this.ini.getBool("IsSelectableCombatant");
    this.invisibleInGame = this.ini.getBool("InvisibleInGame");
    this.moveToShroud = this.ini.getBool("MoveToShroud", this.type !== ObjectType.Aircraft);
    this.leadershipRating = this.ini.getNumber("LeadershipRating", 5);
    this.unnatural = this.ini.getBool("Unnatural");
    this.natural = this.ini.getBool("Natural");
    this.buildTimeMultiplier = this.ini.getFixed("BuildTimeMultiplier", 1);
    this.allowedToStartInMultiplayer = this.ini.getBool("AllowedToStartInMultiplayer", true);
    this.rot = ObjectRules.iniRotToDegsPerTick(this.ini.getNumber("ROT", 0));
    this.jumpjetAccel = this.ini.getNumber("JumpJetAccel", 2);
    this.jumpjetClimb = this.ini.getNumber("JumpjetClimb", 5);
    this.jumpjetCrash = this.ini.getNumber("JumpjetCrash", 5);
    this.jumpjetDeviation = this.ini.getNumber("JumpjetDeviation", 40);
    this.jumpjetHeight = this.ini.getNumber("JumpjetHeight", 500);
    this.jumpjetNoWobbles = this.ini.getBool("JumpjetNoWobbles");
    this.tiltCrashJumpjet = this.ini.getBool("TiltCrashJumpjet");
    this.jumpjetSpeed = this.ini.getNumber("JumpjetSpeed", 14);
    this.jumpjetTurnRate = ObjectRules.iniRotToDegsPerTick(this.ini.getNumber("JumpJetTurnRate", 4));
    this.jumpjetWobbles = this.ini.getNumber("JumpjetWobbles", 0.15);
    this.pitchSpeed = this.ini.getNumber("PitchSpeed", 0.25);
    this.pitchAngle = this.ini.getNumber("PitchAngle", 20);
    this.damageParticleSystems = this.ini.getArray("DamageParticleSystems");
    // DamageSmokeOffset 的 INI 顺序是 [x, y, z]；y/z 对调且除以 √2 完成
    // 地图等轴坐标系到世界坐标系的换算。
    const smokeOffset = this.ini.getNumberArray("DamageSmokeOffset", undefined, [0, 0, 0]);
    this.damageSmokeOffset = new Vector3(smokeOffset[0], smokeOffset[2] / Math.SQRT2, smokeOffset[1]);
    this.minDebris = this.ini.getNumber("MinDebris");
    this.maxDebris = this.ini.getNumber("MaxDebris");
    this.debrisTypes = this.ini.getArray("DebrisTypes");
    this.debrisAnims = this.ini.getArray("DebrisAnims");
    // 路灯是特判的灯光来源（美术图名为 GALITE）。
    this.isLightpost = this.imageName === "GALITE";
    this.lightVisibility = this.ini.getNumber("LightVisibility", 5000);
    this.lightIntensity = this.ini.getNumber("LightIntensity");
    this.lightRedTint = this.ini.getNumber("LightRedTint", 1);
    this.lightGreenTint = this.ini.getNumber("LightGreenTint", 1);
    this.lightBlueTint = this.ini.getNumber("LightBlueTint", 1);
    this.ambientSound = this.ini.getString("AmbientSound") || undefined;
    this.createSound = this.ini.getString("CreateSound") || undefined;
    this.deploySound = this.ini.getString("DeploySound") || undefined;
    this.undeploySound = this.ini.getString("UndeploySound") || undefined;
    this.packupSound = this.ini.getString("PackupSound") || undefined;
    this.voiceSelect = this.ini.getString("VoiceSelect") || undefined;
    this.voiceSelectDeactivated = this.ini.getString("VoiceSelectDeactivated") || undefined;
    this.voiceMove = this.ini.getString("VoiceMove") || undefined;
    this.voiceAttack = this.ini.getString("VoiceAttack") || undefined;
    this.voiceFeedback = this.ini.getString("VoiceFeedback") || undefined;
    this.voiceSpecialAttack = this.ini.getString("VoiceSpecialAttack") || undefined;
    this.voiceSecondaryWeaponAttack = this.ini.getString("VoiceSecondaryWeaponAttack") || undefined;
    this.voiceEnter = this.ini.getString("VoiceEnter") || undefined;
    this.voiceCapture = this.ini.getString("VoiceCapture") || undefined;
    this.voiceCrashing = this.ini.getString("VoiceCrashing") || undefined;
    this.crashingSound = this.ini.getString("CrashingSound") || undefined;
    this.impactLandSound = this.ini.getString("ImpactLandSound") || undefined;
    this.auxSound1 = this.ini.getString("AuxSound1") || undefined;
    this.auxSound2 = this.ini.getString("AuxSound2") || undefined;
    this.dieSound = this.ini.getString("DieSound") || undefined;
    this.activateSound = this.ini.getString("ActivateSound") || undefined;
    this.deactivateSound = this.ini.getString("DeactivateSound") || undefined;
    this.moveSound = this.ini.getString("MoveSound") || undefined;
    this.enterWaterSound = this.ini.getString("EnterWaterSound") || undefined;
    this.leaveWaterSound = this.ini.getString("LeaveWaterSound") || undefined;
    this.turretRotateSound = this.ini.getString("TurretRotateSound") || undefined;
    this.workingSound = this.ini.getString("WorkingSound") || undefined;
    this.notWorkingSound = this.ini.getString("NotWorkingSound") || undefined;
    this.chronoInSound = this.ini.getString("ChronoInSound") || undefined;
    this.chronoOutSound = this.ini.getString("ChronoOutSound") || undefined;
    this.enterTransportSound = this.ini.getString("EnterTransportSound") || undefined;
    this.leaveTransportSound = this.ini.getString("LeaveTransportSound") || undefined;
  }

  /** 武器名规整：空串或 "none" 一律归一化为 undefined（表示无武器）。 */
  parseWeaponName(name: string): string {
    return name && name.toLowerCase() !== "none" ? name : undefined;
  }

  /**
   * IFV 载员变化炮塔映射（仅 Gunner=yes 的单位）：
   * 扫描段落里所有 *TurretWeapon= 键，若同名 *TurretIndex= 存在，
   * 记录 <武器序号, 炮塔索引>，供运兵车换载员时切换炮塔。
   */
  parseTurretIndexes(): Map<number, number> {
    const indexes = new Map();
    if (this.ini.getBool("Gunner")) {
      this.ini.entries.forEach((value: any, key: string) => {
        const match = key.match(/^(.*)TurretWeapon$/i);
        if (match) {
          const indexKey = match[1] + "TurretIndex";
          if (this.ini.has(indexKey)) indexes.set(Number(value), this.ini.getNumber(indexKey));
        }
      });
    }
    return indexes;
  }

  /** 连射间隔表 BurstDelay0..3，未声明的项为 undefined。 */
  parseBurstDelay(): number[] {
    const delays = [];
    for (let i = 0; i < 4; ++i)
      delays.push(this.ini.has("BurstDelay" + i) ? this.ini.getNumber("BurstDelay" + i) : undefined);
    return delays;
  }

  /** 该国家是否能拥有此对象（RequiredHouses 白名单 + ForbiddenHouses 黑名单）。 */
  hasOwner(house: any): boolean {
    return !!this.owner.length && this.owner.indexOf(house.name) !== -1;
  }

  isAvailableTo(house: any): boolean {
    return (
      (!this.requiredHouses.length || this.requiredHouses.indexOf(house.name) !== -1) &&
      this.forbiddenHouses.indexOf(house.name) === -1
    );
  }

  /** 按序号取扩展武器槽名（Weapon1/Weapon2/…）。 */
  getWeaponAtIndex(index: number): string {
    return this.parseWeaponName(this.ini.getString("Weapon" + (index + 1)));
  }

  /**
   * 精英扩展武器槽：EliteWeaponN 缺失或为 none 时回落到普通 WeaponN——
   * 原版语义；否则盖特机炮等 EliteWeaponN 表不全的单位会解析出
   * undefined 导致崩溃。
   */
  getEliteWeaponAtIndex(index: number): string {
    const elite = this.parseWeaponName(this.ini.getString("EliteWeapon" + (index + 1)));
    return elite !== undefined ? elite : this.getWeaponAtIndex(index);
  }
}
