/**
 * Building — 建筑对象。
 *
 * 在 Techno 之上叠加建造状态机与出厂 trait 组装（RA2 建筑的功能差异
 * 全部体现在 trait 组合上，工厂按规则标志逐一挂载）：
 *  - 驻扎类：canBeOccupied → garrisonTrait（InfantryAbsorb 走吸收式
 *    驻扎，其余走可占领驻扎）；生物反应堆的吸收驻扎同时充当
 *    transportTrait（复用战斗要塞的进出载具机制）；
 *  - 占领类：capturable + needsEngineer + 现金产出 → SecureProgressTrait
 *    （工程师驻守倒计时占领）；canC4 且非墙 → C4ChargeTrait（安放 C4）；
 *    eligibleForDelayKill → DelayedKillTrait；
 *  - 生产类：factory 或 cloning → FactoryTrait（克隆罐强制步兵队列）；
 *    numberOfDocks → DockTrait（+helipad/unitRepair/unitReload 子能力）；
 *    factory/cloning/docks 之一 → RallyTrait（集结点）；
 *  - 电力与功能：powered（且 power≠0）或 needsEngineer → PoweredTrait
 *    （断电瘫痪）；superWeapon → SuperWeaponTrait；hospital →
 *    HospitalTrait；infantryGainSelfHeal/unitsGainSelfHeal →
 *    TechHospitalHealTrait（全图自愈，可与经典医院并存）；gapGenerator →
 *    GapGeneratorTrait；psychicDetectionRadius → PsychicDetectorTrait；
 *  - 其他：bridgeRepairHut → CabHutTrait（桥头堡，需桥梁上下文）；
 *    crewed → CrewedTrait；turret → TurretTrait；overpowerable →
 *    OverpoweredTrait；bunker（或 NATBNK）→ TankBunkerTrait（坦克碉堡，
 *    伤害转嫁与进车校验在该 trait 内）；freeUnit → FreeUnitTrait
 *    （定期赠送单位）；produceCashStartup → OilDerrickTrait（油井）；
 *    wall → WallTrait；infantryAbsorb 隐含可驻扎。
 *
 * 建造状态机：BuildUp（建造升起动画）→ Ready（就绪可用）→ BuildDown
 * （变卖/打包收起）。setBuildStatus() 负责切状态、向 NotifyBuildStatus
 * trait 广播（实参顺序：旧状态在前）、并派发 BuildStatusChangeEvent。
 * update() 期间 BuildUp 状态会挂 WaitForBuildUpTask 阻塞其他任务直至
 * 成形，且攻击能力在"未就绪或断电"时被禁用。
 *
 * 由 game/gameobject/Building.ts.js 重写为 TS（行为完全一致）。两个文件
 * 并存期间，本文件才是修改目标：tools/repack.mjs 打包时优先采用 .ts
 * 模块的编译产物。
 */
import { ObjectType } from "engine/type/ObjectType";
import * as InfantryAbsorbTraitModule from "game/gameobject/trait/InfantryAbsorbTrait"; // 未转换（any-shim）：转成真实 .ts 后可改具名导入
import * as OccupiableGarrisonTraitModule from "game/gameobject/trait/OccupiableGarrisonTrait"; // 未转换（any-shim）：转成真实 .ts 后可改具名导入
import * as TurretTraitModule from "game/gameobject/trait/TurretTrait"; // 未转换（any-shim）：转成真实 .ts 后可改具名导入
import { TechnoRules, FactoryType } from "game/rules/TechnoRules";
import { BuildStatusChangeEvent } from "game/event/BuildStatusChangeEvent";
import * as PoweredTraitModule from "game/gameobject/trait/PoweredTrait"; // 未转换（any-shim）：转成真实 .ts 后可改具名导入
import * as FactoryTraitModule from "game/gameobject/trait/FactoryTrait"; // 未转换（any-shim）：转成真实 .ts 后可改具名导入
import * as DockTraitModule from "game/gameobject/trait/DockTrait"; // 未转换（any-shim）：转成真实 .ts 后可改具名导入
import * as FreeUnitTraitModule from "game/gameobject/trait/FreeUnitTrait"; // 未转换（any-shim）：转成真实 .ts 后可改具名导入
import { Techno } from "game/gameobject/Techno";
import * as CrewedTraitModule from "game/gameobject/trait/CrewedTrait"; // 未转换（any-shim）：转成真实 .ts 后可改具名导入
import * as CabHutTraitModule from "game/gameobject/trait/CabHutTrait"; // 未转换（any-shim）：转成真实 .ts 后可改具名导入
import * as OilDerrickTraitModule from "game/gameobject/trait/OilDerrickTrait"; // 未转换（any-shim）：转成真实 .ts 后可改具名导入
import * as WallTraitModule from "game/gameobject/trait/WallTrait"; // 未转换（any-shim）：转成真实 .ts 后可改具名导入
import { Coords } from "game/Coords";
import * as OverpoweredTraitModule from "game/gameobject/trait/OverpoweredTrait"; // 未转换（any-shim）：转成真实 .ts 后可改具名导入
import * as UnitRepairTraitModule from "game/gameobject/trait/UnitRepairTrait"; // 未转换（any-shim）：转成真实 .ts 后可改具名导入
import * as RallyTraitModule from "game/gameobject/trait/RallyTrait"; // 未转换（any-shim）：转成真实 .ts 后可改具名导入
import * as C4ChargeTraitModule from "game/gameobject/trait/C4ChargeTrait"; // 未转换（any-shim）：转成真实 .ts 后可改具名导入
import * as HelipadTraitModule from "game/gameobject/trait/HelipadTrait"; // 未转换（any-shim）：转成真实 .ts 后可改具名导入
import * as UnitReloadTraitModule from "game/gameobject/trait/UnitReloadTrait"; // 未转换（any-shim）：转成真实 .ts 后可改具名导入
import * as WaitForBuildUpTaskModule from "game/gameobject/task/WaitForBuildUpTask"; // 未转换（any-shim）：转成真实 .ts 后可改具名导入
import * as SuperWeaponTraitModule from "game/gameobject/trait/SuperWeaponTrait"; // 未转换（any-shim）：转成真实 .ts 后可改具名导入
import * as GapGeneratorTraitModule from "game/gameobject/trait/GapGeneratorTrait"; // 未转换（any-shim）：转成真实 .ts 后可改具名导入
import * as PsychicDetectorTraitModule from "game/gameobject/trait/PsychicDetectorTrait"; // 未转换（any-shim）：转成真实 .ts 后可改具名导入
import * as HospitalTraitModule from "game/gameobject/trait/HospitalTrait"; // 未转换（any-shim）：转成真实 .ts 后可改具名导入
import * as TechHospitalHealTraitModule from "game/gameobject/trait/TechHospitalHealTrait"; // 未转换（any-shim）：转成真实 .ts 后可改具名导入
import { Vector2 } from "game/math/Vector2";
import * as DelayedKillTraitModule from "game/gameobject/trait/DelayedKillTrait"; // 未转换（any-shim）：转成真实 .ts 后可改具名导入
import { NotifyBuildStatus } from "game/gameobject/trait/interface/NotifyBuildStatus";
import * as SecureProgressTraitModule from "game/gameobject/trait/SecureProgressTrait"; // 未转换（any-shim）：转成真实 .ts 后可改具名导入
import * as TankBunkerTraitModule from "game/gameobject/trait/TankBunkerTrait"; // 未转换（any-shim）：转成真实 .ts 后可改具名导入

/** 建筑建造状态：建造升起 → 就绪 → 拆除收起。 */
export enum BuildStatus {
  /** 建造动画中（不可用）。 */
  BuildUp = 0,
  /** 就绪（功能可用）。 */
  Ready = 1,
  /** 拆除/打包收起动画中。 */
  BuildDown = 2,
}

/* eslint-disable @typescript-eslint/no-explicit-any */
export class Building extends Techno {
  /** 是否显示武器射程圈（玩家悬停/选中切换）。 */
  showWeaponRange: boolean;
  direction: number;
  _buildStatus: BuildStatus;
  lastBuildStatus: BuildStatus;
  /** 秘密实验室的地图随机奖励对象名（地图载入时由 Game 分配；规则内逐建筑覆盖键优先于它）。 */
  secretProduction: string;
  /** 碾磨动画计数：单位进入回收厂（Grinder）期间 >0，渲染层据此播放特殊动画。 */
  _grindingAnimTicks: number;
  /** 精炼厂倒矿触发计数：每次倒矿 +1，按 tick 轻微衰减，渲染器以"上涨"判定新一次倒矿并播放矿石到达动画。 */
  _refineryOrePile: number;
  // ---- 出厂挂载的 trait（按规则有条件创建） ----
  garrisonTrait: any;
  transportTrait: any;
  secureProgressTrait: any;
  c4ChargeTrait: any;
  delayedKillTrait: any;
  cabHutTrait: any;
  crewedTrait: any;
  turretTrait: any;
  overpoweredTrait: any;
  poweredTrait: any;
  factoryTrait: any;
  superWeaponTrait: any;
  dockTrait: any;
  helipadTrait: any;
  unitRepairTrait: any;
  unitReloadTrait: any;
  tankBunkerTrait: any;
  hospitalTrait: any;
  rallyTrait: any;
  wallTrait: any;
  gapGeneratorTrait: any;
  psychicDetectorTrait: any;
  /** 由任务/工厂侧注入（update 中用于挂建造等待任务）。 */
  unitOrderTrait: any;
  attackTrait: any;

  constructor(name: string, rules: TechnoRules, art: any) {
    super(ObjectType.Building, name, rules, art);
    this.showWeaponRange = false;
    this.direction = 0;
    this._buildStatus = BuildStatus.BuildUp;
    this.lastBuildStatus = this.buildStatus;
    this.secretProduction = undefined;
  }

  /** 当前建造状态。 */
  get buildStatus(): BuildStatus {
    return this._buildStatus;
  }

  /**
   * 出厂组装：按规则标志挂载 trait（完整清单见类注释）。
   * @param name INI 内部名
   * @param rules 解析后的建筑规则
   * @param world 游戏世界（读取 audioVisual/general 全局配置）
   * @param art 美术规则（含 Dock 停靠位 dockingOffsets）
   * @param dockContext 透传给 DockTrait 的上下文引用
   * @param bridgeContext 透传给桥头堡 trait（CabHutTrait）的上下文引用
   */
  static factory(
    name: string,
    rules: TechnoRules,
    world: any,
    art: any,
    dockContext: any,
    bridgeContext: any,
  ): Building {
    const building = new this(name, rules, art);
    if (rules.canBeOccupied) {
      building.garrisonTrait = rules.infantryAbsorb
        ? new InfantryAbsorbTraitModule.InfantryAbsorbTrait(building, rules.maxNumberOccupants)
        : new OccupiableGarrisonTraitModule.OccupiableGarrisonTrait(
            building,
            world.audioVisual.conditionRed,
            rules.maxNumberOccupants,
          );
      building.traits.add(building.garrisonTrait);
    }
    // 生物反应堆（InfantryAbsorb）的驻扎 trait 复用战斗要塞的运输进出
    // 机制——同一个 units 容器与装载队列，进出运输任务直接操作它。
    if (rules.infantryAbsorb) building.transportTrait = building.garrisonTrait;
    if (rules.capturable && rules.needsEngineer && (rules.produceCashStartup > 0 || rules.produceCashAmount > 0)) {
      building.secureProgressTrait = new SecureProgressTraitModule.SecureProgressTrait(
        world.general.engineerTechSecureTime,
      );
      building.traits.add(building.secureProgressTrait);
    }
    if (rules.canC4 && !rules.wall) {
      building.c4ChargeTrait = new C4ChargeTraitModule.C4ChargeTrait();
      building.traits.add(building.c4ChargeTrait);
    }
    if (rules.eligibleForDelayKill) {
      building.delayedKillTrait = new DelayedKillTraitModule.DelayedKillTrait();
      building.traits.add(building.delayedKillTrait);
    }
    if (rules.bridgeRepairHut) {
      building.cabHutTrait = new CabHutTraitModule.CabHutTrait(building, bridgeContext);
      building.traits.add(building.cabHutTrait);
    }
    if (rules.crewed) {
      building.crewedTrait = new CrewedTraitModule.CrewedTrait();
      building.traits.add(building.crewedTrait);
    }
    if (rules.turret) {
      building.turretTrait = new TurretTraitModule.TurretTrait();
      building.traits.add(building.turretTrait);
    }
    if (rules.overpowerable) {
      building.overpoweredTrait = new OverpoweredTraitModule.OverpoweredTrait(building);
      building.traits.add(building.overpoweredTrait);
    }
    // 依赖电力的建筑（power≠0）与工程师占领建筑挂断电瘫痪 trait。
    if ((rules.powered && rules.power !== 0) || rules.needsEngineer) {
      building.poweredTrait = new PoweredTraitModule.PoweredTrait(building);
      building.traits.add(building.poweredTrait);
    }
    // 克隆罐强制走步兵工厂队列。
    if (rules.factory || rules.cloning) {
      building.factoryTrait = new FactoryTraitModule.FactoryTrait(
        rules.cloning ? FactoryType.InfantryType : rules.factory,
        rules.cloning,
      );
      building.traits.add(building.factoryTrait);
    }
    if (rules.superWeapon) {
      building.superWeaponTrait = new SuperWeaponTraitModule.SuperWeaponTrait(rules.superWeapon);
      building.traits.add(building.superWeaponTrait);
    }
    if (rules.numberOfDocks) {
      building.dockTrait = new DockTraitModule.DockTrait(building, dockContext, rules.numberOfDocks, art.dockingOffsets);
      building.traits.add(building.dockTrait);
      if (rules.helipad) {
        building.helipadTrait = new HelipadTraitModule.HelipadTrait();
        building.traits.add(building.helipadTrait);
      }
      if (rules.unitRepair || rules.unitReload) {
        building.unitRepairTrait = new UnitRepairTraitModule.UnitRepairTrait();
        building.traits.add(building.unitRepairTrait);
      }
      if (rules.unitReload) {
        building.unitReloadTrait = new UnitReloadTraitModule.UnitReloadTrait();
        building.traits.add(building.unitReloadTrait);
      }
    }
    // 坦克碉堡：Bunker=yes 或原版已知建筑 NATBNK——允许载具进入受保护；
    // 与 DockTrait 并存，伤害转嫁/武器加成/进入校验在 TankBunkerTrait 内。
    if (rules.bunker || rules.name === "NATBNK") {
      building.tankBunkerTrait = new TankBunkerTraitModule.TankBunkerTrait(building);
      building.traits.add(building.tankBunkerTrait);
    }
    if (rules.hospital) {
      building.hospitalTrait = new HospitalTraitModule.HospitalTrait();
      building.traits.add(building.hospitalTrait);
    }
    // 科技医院全图自愈（InfantryGainSelfHeal/UnitsGainSelfHeal）与经典
    // 医院可并存：经典 trait 管"进驻治疗"（队列+弹药），本 trait 管全图
    // 己方步兵/单位周期自愈。
    if (rules.infantryGainSelfHeal > 0 || rules.unitsGainSelfHeal > 0)
      building.traits.add(new TechHospitalHealTraitModule.TechHospitalHealTrait());
    if (rules.factory || rules.cloning || rules.numberOfDocks) {
      building.rallyTrait = new RallyTraitModule.RallyTrait();
      building.traits.add(building.rallyTrait);
    }
    if (rules.freeUnit) building.traits.add(new FreeUnitTraitModule.FreeUnitTrait());
    if (rules.produceCashStartup) building.traits.add(new OilDerrickTraitModule.OilDerrickTrait());
    if (rules.wall) {
      building.wallTrait = new WallTraitModule.WallTrait();
      building.traits.add(building.wallTrait);
    }
    if (rules.gapGenerator) {
      building.gapGeneratorTrait = new GapGeneratorTraitModule.GapGeneratorTrait(rules.gapRadiusInCells);
      building.traits.add(building.gapGeneratorTrait);
    }
    if (rules.psychicDetectionRadius) {
      building.psychicDetectorTrait = new PsychicDetectorTraitModule.PsychicDetectorTrait(
        rules.psychicDetectionRadius,
      );
      building.traits.add(building.psychicDetectorTrait);
    }
    return building;
  }

  isBuilding(): boolean {
    return true;
  }

  /**
   * 秘密实验室授予的可建造对象（对应原版 BuildingClass::GetSecretProduction）：
   * 逐建筑覆盖键（SecretInfantry > SecretUnit > SecretBuilding）优先，
   * 否则回落地图分配的随机奖励；实验室在己方期间玩家即可建造该对象。
   */
  getSecretProduction(): string {
    if (this.rules.secretInfantry) return this.rules.secretInfantry;
    if (this.rules.secretUnit) return this.rules.secretUnit;
    if (this.rules.secretBuilding) return this.rules.secretBuilding;
    return this.secretProduction;
  }

  /** 占位尺寸直接来自美术规则（建筑地形适配）。 */
  getFoundation(): { width: number; height: number } {
    return this.art.foundation;
  }

  /** 占位中心相对左上角原点的偏移（世界坐标，lepton）。 */
  getFoundationCenterOffset(): Vector2 {
    const foundation = this.getFoundation();
    return new Vector2(
      (foundation.width / 2) * Coords.LEPTONS_PER_TILE,
      (foundation.height / 2) * Coords.LEPTONS_PER_TILE,
    );
  }

  update(world: any): void {
    // 碾磨动画计数衰减（进入回收厂的单位碾磨期间由任务侧置值）。
    if ((this._grindingAnimTicks ?? 0) > 0) this._grindingAnimTicks--;
    // 精炼厂倒矿计数衰减：两次倒矿之间缓慢回落，渲染器以计数值上涨
    // 判定"新一次倒矿"并播放矿石到达动画（GAREFNOR）。
    if ((this._refineryOrePile ?? 0) > 0)
      this._refineryOrePile = Math.max(0, this._refineryOrePile - 0.0005);
    // 建造动画未完成且无任务时挂等待任务（短路链保持原副作用顺序）：
    // 未就绪或断电时禁用攻击。
    if (
      this.buildStatus !== BuildStatus.BuildUp ||
      this.unitOrderTrait.hasTasks() ||
      this.unitOrderTrait.addTask(
        new WaitForBuildUpTaskModule.WaitForBuildUpTask(world.rules.general.buildupTime, world),
      )
    ) {
      // 状态已推进或任务已存在：无需处理
    }
    this.attackTrait?.setDisabled(
      this.buildStatus !== BuildStatus.Ready || (!!this.poweredTrait && !this.poweredTrait.isPoweredOn()),
    );
    super.update(world);
  }

  /**
   * 切换建造状态：仅在状态真正变化时向 NotifyBuildStatus trait 广播
   * （实参顺序：旧状态在前，为原实现约定）并经 world.events 派发
   * BuildStatusChangeEvent。
   */
  setBuildStatus(
    status: BuildStatus,
    world: { events: { dispatch(event: BuildStatusChangeEvent): void } },
  ): void {
    this._buildStatus = status;
    const previous = this.lastBuildStatus;
    if (this.buildStatus !== previous) {
      this.lastBuildStatus = this.buildStatus;
      this.traits.filter(NotifyBuildStatus).forEach((trait) => {
        trait[NotifyBuildStatus.onStatusChange](previous, this, world);
      });
      world.events.dispatch(new BuildStatusChangeEvent(this, this.buildStatus));
    }
  }
}
