/**
 * Vehicle — 载具对象（坦克/采矿车/运输车/舰船等地面与水面机动单位）。
 *
 * 在 Techno 之上叠加载具状态与出厂 trait 组装（全部由规则标志驱动）：
 *  - 恒挂载 MoveTrait；
 *  - crashable → CrashableTrait（被毁后翻滚碎片化）；
 *  - crewed → CrewedTrait（乘员：被毁时逃出步兵）；
 *  - harvester → HarvesterTrait（采矿车，容量取 rules.storage）；
 *  - passengers → TransportTrait（运兵舱），gunner → 追加 GunnerTrait
 *    （IFV 机制：随载员切换武器）；
 *  - turret → TurretTrait（独立炮塔）；
 *  - 非伞降类飞行器（consideredAircraft && !landable 之外）→ DockableTrait；
 *  - parasiteable → ParasiteableTrait（可被恐怖机器人寄生）；
 *  - naval && underwater → SubmergibleTrait（潜艇下潜）；
 *  - Hover 移动器 → HoverBobTrait（悬浮上下浮动表现）；
 *  - 载具/超时空移动器且为体素模型 → TilterTrait（斜坡倾斜表现）；
 *  - powered/poweredUnit 且声明前置 → RobotControlTrait（机器人坦克
 *    与控制中心共生：控制中心离线/被毁则瘫痪，在水上则沉没；trait 每
 *    tick 扫描 owner.buildings 寻找可运作的前置建筑）。
 *
 * 另有船体摇晃表现（applyRocking，被炮弹命中的视觉反馈）与沉没判定
 * （isSinker：非水下单位且超重/非海军 → 死亡时下沉）。
 *
 * 由 game/gameobject/Vehicle.ts.js 重写为 TS（行为完全一致）。两个文件
 * 并存期间，本文件才是修改目标：tools/repack.mjs 打包时优先采用 .ts
 * 模块的编译产物。
 */
import { ObjectType } from "engine/type/ObjectType";
import * as HarvesterTraitModule from "game/gameobject/trait/HarvesterTrait"; // 未转换（any-shim）：转成真实 .ts 后可改具名导入
import * as TransportTraitModule from "game/gameobject/trait/TransportTrait"; // 未转换（any-shim）：转成真实 .ts 后可改具名导入
import * as MoveTraitModule from "game/gameobject/trait/MoveTrait"; // 未转换（any-shim）：转成真实 .ts 后可改具名导入
import * as TurretTraitModule from "game/gameobject/trait/TurretTrait"; // 未转换（any-shim）：转成真实 .ts 后可改具名导入
import { ZoneType } from "game/gameobject/unit/ZoneType";
import * as DockableTraitModule from "game/gameobject/trait/DockableTrait"; // 已转换
import { Techno } from "game/gameobject/Techno";
import * as CrewedTraitModule from "game/gameobject/trait/CrewedTrait"; // 未转换（any-shim）：转成真实 .ts 后可改具名导入
import * as GunnerTraitModule from "game/gameobject/trait/GunnerTrait"; // 未转换（any-shim）：转成真实 .ts 后可改具名导入
import * as ParasiteableTraitModule from "game/gameobject/trait/ParasiteableTrait"; // 未转换（any-shim）：转成真实 .ts 后可改具名导入
import * as CrashableTraitModule from "game/gameobject/trait/CrashableTrait"; // 已转换
import * as SubmergibleTraitModule from "game/gameobject/trait/SubmergibleTrait"; // 未转换（any-shim）：转成真实 .ts 后可改具名导入
import { LocomotorType } from "game/type/LocomotorType";
import * as HoverBobTraitModule from "game/gameobject/trait/HoverBobTrait"; // 未转换（any-shim）：转成真实 .ts 后可改具名导入
import { CrateBonuses } from "game/gameobject/unit/CrateBonuses";
import * as TilterTraitModule from "game/gameobject/trait/TilterTrait"; // 未转换（any-shim）：转成真实 .ts 后可改具名导入
import * as RobotControlTraitModule from "game/gameobject/trait/RobotControlTrait"; // 未转换（any-shim）：转成真实 .ts 后可改具名导入

/** 船体摇晃的持续 tick 数。 */
export const ROCKING_TICKS = 34;

/* eslint-disable @typescript-eslint/no-explicit-any */
export class Vehicle extends Techno {
  direction: number;
  /** 炮塔自转速度（渲染表现）。 */
  spinVelocity: number;
  crateBonuses: CrateBonuses;
  /** 当前炮塔序号（IFV 多炮塔切换用）。 */
  turretNo: number;
  onBridge: boolean;
  /** 死亡时是否下沉（工厂里按规则计算，见 factory）。 */
  isSinker: boolean;
  isFiring: boolean;
  zone: ZoneType;
  /** 被命中后的船体摇晃状态（{剩余tick, 朝向, 幅度}，可为 undefined）。 */
  rocking: any;
  // ---- 出厂挂载的 trait（按规则有条件创建） ----
  moveTrait: any;
  crashableTrait: any;
  crewedTrait: any;
  harvesterTrait: any;
  transportTrait: any;
  gunnerTrait: any;
  turretTrait: any;
  parasiteableTrait: any;
  submergibleTrait: any;
  tilterTrait: any;
  robotControlTrait: any;

  constructor(name: string, rules: any, art: any) {
    super(ObjectType.Vehicle, name, rules, art);
    this.direction = 0;
    this.spinVelocity = 0;
    this.crateBonuses = new CrateBonuses();
    this.turretNo = 0;
    this.onBridge = false;
    this.isSinker = false;
    this.isFiring = false;
    this.zone = rules.naval ? ZoneType.Water : ZoneType.Ground;
  }

  /** 是否正在移动（委托移动 trait）。 */
  get isMoving(): boolean {
    return this.moveTrait.isMoving();
  }

  /**
   * 出厂组装：按规则标志挂载 trait（完整清单见类注释）。
   * @param name INI 内部名
   * @param rules 解析后的单位规则
   * @param art 美术规则
   * @param generalRules 全局规则（船体下沉重量阈值取 shipSinkingWeight）
   * @param world 游戏世界引用（传入移动器）
   */
  static factory(name: string, rules: any, art: any, generalRules: any, world: any): Vehicle {
    const vehicle = new this(name, rules, art);
    // 沉没判定：非水下单位，且超重（≥全局 shipSinkingWeight）或非海军 → 沉。
    vehicle.isSinker = !rules.underwater && (rules.weight >= generalRules.general.shipSinkingWeight || !rules.naval);
    vehicle.moveTrait = new MoveTraitModule.MoveTrait(vehicle, world);
    vehicle.traits.add(vehicle.moveTrait);
    if (rules.crashable) {
      vehicle.crashableTrait = new CrashableTraitModule.CrashableTrait(vehicle);
      vehicle.traits.add(vehicle.crashableTrait);
    }
    if (rules.crewed) {
      vehicle.crewedTrait = new CrewedTraitModule.CrewedTrait();
      vehicle.traits.add(vehicle.crewedTrait);
    }
    if (rules.harvester) {
      vehicle.harvesterTrait = new HarvesterTraitModule.HarvesterTrait(rules.storage);
      vehicle.traits.add(vehicle.harvesterTrait);
    }
    if (rules.passengers) {
      vehicle.transportTrait = new TransportTraitModule.TransportTrait(vehicle);
      vehicle.traits.add(vehicle.transportTrait);
      if (rules.gunner) {
        vehicle.gunnerTrait = new GunnerTraitModule.GunnerTrait();
        vehicle.traits.add(vehicle.gunnerTrait);
      }
    }
    if (rules.turret) {
      vehicle.turretTrait = new TurretTraitModule.TurretTrait();
      vehicle.traits.add(vehicle.turretTrait);
    }
    // 伞降类飞行器（视为飞行且不能降落）不可 Dock（无机场停靠语义）。
    if (!(rules.consideredAircraft && !rules.landable)) vehicle.traits.add(new DockableTraitModule.DockableTrait());
    if (rules.parasiteable) {
      vehicle.parasiteableTrait = new ParasiteableTraitModule.ParasiteableTrait(vehicle);
      vehicle.traits.add(vehicle.parasiteableTrait);
    }
    if (rules.naval && rules.underwater) {
      vehicle.submergibleTrait = new SubmergibleTraitModule.SubmergibleTrait();
      vehicle.traits.add(vehicle.submergibleTrait);
    }
    if (rules.locomotor === LocomotorType.Hover) vehicle.traits.add(new HoverBobTraitModule.HoverBobTrait());
    // 载具/超时空移动器 + 体素模型才做斜坡倾斜表现（SHP 单位无需）。
    if (
      [LocomotorType.Vehicle, LocomotorType.Chrono].includes(rules.locomotor) &&
      art.isVoxel
    ) {
      vehicle.tilterTrait = new TilterTraitModule.TilterTrait();
      vehicle.traits.add(vehicle.tilterTrait);
    }
    // 机器人控制中心（GACSPH）/机器人坦克（ROBOT）共生：带 Powered= 或
    // PoweredUnit= 且声明前置的单位挂此 trait——前置控制中心离线/被毁时
    // 瘫痪（移动/攻击禁用），位于水上则沉没。trait 每 tick 扫描
    // owner.buildings 寻找可运作（就绪且供电）的前置建筑。
    if ((rules.powered || rules.poweredUnit) && rules.prerequisite && rules.prerequisite.length) {
      vehicle.robotControlTrait = new RobotControlTraitModule.RobotControlTrait(vehicle);
      vehicle.traits.add(vehicle.robotControlTrait);
    }
    return vehicle;
  }

  isUnit(): boolean {
    return true;
  }

  isVehicle(): boolean {
    return true;
  }

  /**
   * UI 显示名：IFV（带 GunnerTrait）按当前载员/武器模式显示为
   * "{模式名} {name:内部名}"，其余回落规则 UIName。
   */
  getUiName(): string {
    if (this.gunnerTrait) {
      const specialIndex = this.armedTrait.getSpecialWeaponIndex();
      const modeName = this.gunnerTrait.getUiNameForIfvMode(specialIndex, this.transportTrait?.units[0]?.name);
      const fallback = "name:" + this.name;
      return modeName ? `{${modeName}} {${fallback}}` : fallback;
    }
    return super.getUiName();
  }

  /** 每 tick：推进摇晃倒计时（归零清除），再走通用 tick。 */
  update(world: any): void {
    if (this.rocking) {
      this.rocking.ticksLeft--;
      if (!this.rocking.ticksLeft) this.rocking = undefined;
    }
    super.update(world);
  }

  /** 被命中时触发船体摇晃（已在摇晃中则刷新朝向/幅度并继续剩余时长）；飞行器不受。 */
  applyRocking(facing: number, factor: number): void {
    if (!this.rules.consideredAircraft)
      this.rocking = { ticksLeft: this.rocking?.ticksLeft ?? ROCKING_TICKS, facing, factor };
  }
}
