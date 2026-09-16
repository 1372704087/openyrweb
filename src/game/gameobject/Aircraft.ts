/**
 * Aircraft — 飞行器对象（战机/直升机/运输机/巡航导弹）。
 *
 * 在 Techno 之上叠加飞行姿态（pitch/yaw/roll，direction 读写即 yaw）与
 * 出厂 trait 组装（全部由规则标志驱动）：
 *  - airportBound 且声明了 Dock= → AirportBoundTrait（绑定可停靠机场，
 *    弹药/补给回场逻辑依赖它）；
 *  - 非导弹出生体（missileSpawn=no）→ CrashableTrait（被击毁后坠落）；
 *  - spawned（由母体发射/投放）→ 按类型挂 MissileSpawnTrait（导弹，
 *    与母体同生死）或 SpawnLinkTrait（可回收子机，如滴水飞机）；
 *  - MoveTrait 恒挂载；规则声明 Dock= → DockableTrait（可被机场接纳）；
 *  - 可降落（landable）且非空降运输机（paradrop.paradropPlane 指定的
 *    机型，如空降伞兵的 C-17）之外 → UnlandableTrait（不可着陆，
 *    强制保持在飞行高度）；
 *  - parasiteable → ParasiteableTrait（可被恐怖机器人攻击）。
 *
 * 由 game/gameobject/Aircraft.ts.js 重写为 TS（行为完全一致）。两个文件
 * 并存期间，本文件才是修改目标：tools/repack.mjs 打包时优先采用 .ts
 * 模块的编译产物。
 */
import { ObjectType } from "engine/type/ObjectType";
import * as MoveTraitModule from "game/gameobject/trait/MoveTrait"; // 未转换（any-shim）：转成真实 .ts 后可改具名导入
import { ZoneType } from "game/gameobject/unit/ZoneType";
import * as DockableTraitModule from "game/gameobject/trait/DockableTrait"; // 已转换
import { Techno } from "game/gameobject/Techno";
import * as ParasiteableTraitModule from "game/gameobject/trait/ParasiteableTrait"; // 未转换（any-shim）：转成真实 .ts 后可改具名导入
import * as CrashableTraitModule from "game/gameobject/trait/CrashableTrait"; // 已转换
import * as AirportBoundTraitModule from "game/gameobject/trait/AirportBoundTrait"; // 已转换
import * as SpawnLinkTraitModule from "game/gameobject/trait/SpawnLinkTrait"; // 已转换
import * as MissileSpawnTraitModule from "game/gameobject/trait/MissileSpawnTrait"; // 已转换
import { CrateBonuses } from "game/gameobject/unit/CrateBonuses";
import * as UnlandableTraitModule from "game/gameobject/trait/UnlandableTrait"; // 已转换

/* eslint-disable @typescript-eslint/no-explicit-any */
export class Aircraft extends Techno {
  /** 俯仰角（渲染表现，爬升/俯冲）。 */
  pitch: number;
  /** 偏航角（水平朝向，direction 的实际存储）。 */
  yaw: number;
  /** 翻滚角（转向侧倾表现）。 */
  roll: number;
  onBridge: boolean;
  zone: ZoneType;
  crateBonuses: CrateBonuses;
  // ---- 出厂挂载的 trait（按规则有条件创建） ----
  airportBoundTrait: any;
  crashableTrait: any;
  missileSpawnTrait: any;
  spawnLinkTrait: any;
  moveTrait: any;
  parasiteableTrait: any;

  constructor(name: string, rules: any, art: any) {
    super(ObjectType.Aircraft, name, rules, art);
    this.pitch = 0;
    this.yaw = 0;
    this.roll = 0;
    this.onBridge = false;
    this.zone = ZoneType.Ground;
    this.crateBonuses = new CrateBonuses();
  }

  /** 飞行器的朝向即偏航角。 */
  get direction(): number {
    return this.yaw;
  }

  set direction(direction: number) {
    this.yaw = direction;
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
   * @param generalRules 全局规则（读取 paradrop.paradropPlane 识别空降机）
   * @param world 游戏世界引用（传入移动器）
   */
  static factory(name: string, rules: any, art: any, generalRules: any, world: any): Aircraft {
    const aircraft = new this(name, rules, art);
    if (rules.airportBound && rules.dock.length) {
      aircraft.airportBoundTrait = new AirportBoundTraitModule.AirportBoundTrait(rules.dock);
      aircraft.traits.add(aircraft.airportBoundTrait);
    }
    // 导弹出生体没有"坠落"语义（与母体同生死），不挂坠毁 trait。
    if (!rules.missileSpawn) {
      aircraft.crashableTrait = new CrashableTraitModule.CrashableTrait(aircraft);
      aircraft.traits.add(aircraft.crashableTrait);
    }
    if (rules.spawned) {
      if (rules.missileSpawn) {
        aircraft.missileSpawnTrait = new MissileSpawnTraitModule.MissileSpawnTrait();
        aircraft.traits.add(aircraft.missileSpawnTrait);
      } else {
        aircraft.spawnLinkTrait = new SpawnLinkTraitModule.SpawnLinkTrait();
        aircraft.traits.add(aircraft.spawnLinkTrait);
      }
    }
    aircraft.moveTrait = new MoveTraitModule.MoveTrait(aircraft, world);
    aircraft.traits.add(aircraft.moveTrait);
    if (rules.dock.length) aircraft.traits.add(new DockableTraitModule.DockableTrait());
    // 空降运输机（全局规则指名的机型）若声明 landable 可落地；其余飞行器
    // 一律不可着陆。
    if (!(rules.landable && name !== generalRules.general.paradrop.paradropPlane))
      aircraft.traits.add(new UnlandableTraitModule.UnlandableTrait());
    if (rules.parasiteable) {
      aircraft.parasiteableTrait = new ParasiteableTraitModule.ParasiteableTrait(aircraft);
      aircraft.traits.add(aircraft.parasiteableTrait);
    }
    return aircraft;
  }

  isUnit(): boolean {
    return true;
  }

  isAircraft(): boolean {
    return true;
  }
}
