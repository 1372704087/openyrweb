/**
 * Infantry — 步兵对象。
 *
 * 在 Techno 之上叠加步兵特有状态（朝向/姿态/受压制/恐慌/死亡方式/
 * 箱子加成）与出厂 trait 组装：
 *  - MoveTrait 恒挂载（含九宫格站位移动）；
 *  - CrashableTrait（规则 crashable）：被击毁后可坠毁/翻滚；
 *  - SuppressionTrait（非 fearless）：受压制卧倒；
 *  - AgentTrait（规则 agent）：间谍类渗透单位；
 *  - CastProgressTrait（规则 engineer）：工程师占领读条；
 *  - IdleActionTrait 恒挂载（待机小动作）；
 *  - 带矿石存储（Storage>0）的步兵挂 SlaveCargoTrait（被动载货计数，
 *    命名为 harvesterTrait 供矿石 pip 渲染取用；不走完整 HarvesterTrait
 *    的自动采集循环，避免与矿奴采集任务冲突）。被奴役单位（slaved）
 *    强制至少 3 格存储，保证采矿动画与 pip 在规则缺省 Storage= 时也生效。
 *
 * 静态 SUB_CELLS 声明步兵可用的九宫格占位号（2/4/3 = 右上/左下/右下）。
 *
 * 由 game/gameobject/Infantry.ts.js 重写为 TS（行为完全一致）。两个文件
 * 并存期间，本文件才是修改目标：tools/repack.mjs 打包时优先采用 .ts
 * 模块的编译产物。
 */
import { ObjectType } from "engine/type/ObjectType";
import { ZoneType } from "game/gameobject/unit/ZoneType";
import { StanceType } from "game/gameobject/infantry/StanceType";
import { InfDeathType } from "game/gameobject/infantry/InfDeathType";
import * as MoveTraitModule from "game/gameobject/trait/MoveTrait"; // 未转换（any-shim）：转成真实 .ts 后可改具名导入
import * as SuppressionTraitModule from "game/gameobject/trait/SuppressionTrait"; // 未转换（any-shim）：转成真实 .ts 后可改具名导入
import { Techno } from "game/gameobject/Techno";
import * as IdleActionTraitModule from "game/gameobject/trait/IdleActionTrait"; // 未转换（any-shim）：转成真实 .ts 后可改具名导入
import * as CrashableTraitModule from "game/gameobject/trait/CrashableTrait"; // 未转换（any-shim）：转成真实 .ts 后可改具名导入
import * as AgentTraitModule from "game/gameobject/trait/AgentTrait"; // 未转换（any-shim）：转成真实 .ts 后可改具名导入
import { CrateBonuses } from "game/gameobject/unit/CrateBonuses";
import * as CastProgressTraitModule from "game/gameobject/trait/CastProgressTrait"; // 未转换（any-shim）：转成真实 .ts 后可改具名导入
import * as SlaveCargoTraitModule from "game/gameobject/trait/SlaveCargoTrait"; // 未转换（any-shim）：转成真实 .ts 后可改具名导入

/* eslint-disable @typescript-eslint/no-explicit-any */
export class Infantry extends Techno {
  /** 步兵可用的九宫格占位号。 */
  static SUB_CELLS = [2, 4, 3];

  direction: number;
  onBridge: boolean;
  zone: ZoneType;
  /** 玩家/逻辑设定的基础姿态；对外读取时叠加受压制卧倒修正。 */
  _stance: StanceType;
  isFiring: boolean;
  isPanicked: boolean;
  /** 阵亡表现方式（弹头指定，默认枪击）。 */
  infDeathType: InfDeathType;
  crateBonuses: CrateBonuses;
  // ---- 出厂挂载的 trait（按规则有条件创建） ----
  moveTrait: any;
  crashableTrait: any;
  suppressionTrait: any;
  agentTrait: any;
  castProgressTrait: any;
  idleActionTrait: any;
  /** 被动载货 trait（SlaveCargoTrait），命名沿用 harvesterTrait 供渲染层取用。 */
  harvesterTrait: any;

  constructor(name: string, rules: any, art: any) {
    super(ObjectType.Infantry, name, rules, art);
    this.direction = 0;
    this.onBridge = false;
    this.zone = ZoneType.Ground;
    this._stance = StanceType.None;
    this.isFiring = false;
    this.isPanicked = false;
    this.infDeathType = InfDeathType.Gunfire;
    this.crateBonuses = new CrateBonuses();
  }

  /** 是否正在移动（委托移动 trait）。 */
  get isMoving(): boolean {
    return this.moveTrait.isMoving();
  }

  /**
   * 出厂组装：按规则标志挂载 trait（见类注释）。
   * @param name INI 内部名
   * @param rules 解析后的单位规则
   * @param art 美术规则
   * @param world 游戏世界引用（传入移动器）
   */
  static factory(name: string, rules: any, art: any, world: any): Infantry {
    const infantry = new this(name, rules, art);
    infantry.moveTrait = new MoveTraitModule.MoveTrait(infantry, world);
    infantry.traits.add(infantry.moveTrait);
    if (rules.crashable) {
      infantry.crashableTrait = new CrashableTraitModule.CrashableTrait(infantry);
      infantry.traits.add(infantry.crashableTrait);
    }
    if (!rules.fearless) {
      infantry.suppressionTrait = new SuppressionTraitModule.SuppressionTrait();
      infantry.traits.add(infantry.suppressionTrait);
    }
    if (rules.agent) {
      infantry.agentTrait = new AgentTraitModule.AgentTrait();
      infantry.traits.add(infantry.agentTrait);
    }
    if (rules.engineer) {
      infantry.castProgressTrait = new CastProgressTraitModule.CastProgressTrait();
      infantry.traits.add(infantry.castProgressTrait);
    }
    infantry.idleActionTrait = new IdleActionTraitModule.IdleActionTrait();
    infantry.traits.add(infantry.idleActionTrait);
    // 矿奴载货 trait：给带存储（Storage>0，如 SLAV 矿奴）的步兵挂轻量级
    // 载货 trait 并暴露为 harvesterTrait，矿石 pip 据此渲染。不使用完整
    // HarvesterTrait——其自动采集循环会与矿奴采集任务冲突，这里只做被动
    // 载货计数。被奴役单位（SLAV）即使规则未写 Storage= 也强制至少 3 格，
    // 保证采矿动画与矿石 pip 正常。
    if (rules.slaved) rules.storage = Math.max(rules.storage || 0, 3);
    if (rules.storage > 0) {
      infantry.harvesterTrait = new SlaveCargoTraitModule.SlaveCargoTrait(rules.storage);
      infantry.traits.add(infantry.harvesterTrait);
    }
    return infantry;
  }

  /** 当前姿态：基础姿态为站立但受压制时，表现为卧倒。 */
  get stance(): StanceType {
    return this._stance === StanceType.None && this.suppressionTrait?.isSuppressed()
      ? StanceType.Prone
      : this._stance;
  }

  /**
   * 设定姿态并联动能力开关：部署/欢呼姿态禁用移动；
   * 空降/欢呼姿态禁用攻击（attackTrait 可能未挂载，可选链兜底）。
   */
  set stance(stance: StanceType) {
    this._stance = stance;
    this.moveTrait.setDisabled([StanceType.Deployed, StanceType.Cheer].includes(stance));
    this.attackTrait?.setDisabled([StanceType.Paradrop, StanceType.Cheer].includes(stance));
  }

  isUnit(): boolean {
    return true;
  }

  isInfantry(): boolean {
    return true;
  }
}
