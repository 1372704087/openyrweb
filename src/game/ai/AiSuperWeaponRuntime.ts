/**
 * AiSuperWeaponRuntime — 原版超武 AI 移植（批次 5 第一切片）。
 *
 * 依据 gamemd.exe 1.001 反编译：
 * - AI_TryFireSW 0x5098F0：遍历 house 超武列表（+600/+612，+111=可用），
 *   按 SuperWeaponType 分发：
 *   - 0  MultiMissile：点目标（有目标 house 时选点发射；目标选择走
 *     PickIonCannonTarget 0x50CBF0 或 PickTargetByType 0x50D170）
 *   - 2  LightningStorm：Fire_LightningStorm 0x509E00
 *   - 5/6 ParaDrop/AmerParaDrop + 8 SpyPlane + 11 PsychicReveal：0x509CD0
 *     （无目标点自施放类）
 *   - 7  PsychicDominator：Fire_PsyDom 0x50A150
 *   - 9  GeneticMutator：Fire_GenMutator 0x509F60
 *   - 10 ForceShield：带目标缓存与冷却（General+3808）的特殊分支
 *   - 1 IronCurtain / 3 ChronoSphere / 4 ChronoWarp：AI 不自动释放
 *     （铁幕/超时空仅作为 AITrigger 条件 5/6 出现——与触发层考证互洽）
 * - 发射统一经 supermanager（house+596）→ Fire_SW 0x4FAE50。
 *
 * 目标选择（PickIonCannonTarget/PickTargetByType 内部评分）按 world 注入，
 * 本模块只做分发与时机决策。
 */
/* eslint-disable @typescript-eslint/no-explicit-any */

/** 单把超武视图。 */
export interface SuperWeaponView {
  /** 原版类型号（0-11）。 */
  swType: number;
  /** 已充能可用（原版 +111）。 */
  ready: boolean;
}

/** 目标点（tile 坐标）。 */
export interface SuperTarget {
  x: number;
  y: number;
}

/** 超武发射决策的 world 查询。 */
export interface SuperFireWorld {
  /** 是否存在目标 house（原版 house+22016 != -1）。 */
  hasTarget(): boolean;
  /** 点目标选择：kind=1 走基地密集评分（IonCannon 式），其余按类型选点。 */
  pickPointTarget(kind: number): SuperTarget | null;
  /** 自施放类目标（空投落点/己方区域；无则 null=跳过）。 */
  pickSelfCastTarget(): SuperTarget | null;
  /** 心灵支配/突变器类：敌方单位密集点。 */
  pickCrowdTarget(): SuperTarget | null;
}

/** 一条发射指令（swType + 目标点；自施放类 target 可为 null）。 */
export interface SuperFireCommand {
  swType: number;
  target: SuperTarget | null;
}

/** 原版 AI 不自动释放的类型（1 铁幕 / 3 超时空 / 4 传送 / 10 护盾）。 */
const AI_NEVER_FIRE: Record<number, boolean> = { 1: true, 3: true, 4: true, 10: true };

// ============================================================
// 超武目标评分（批次 6：OpenTS HouseClass::AI_Ion_Cannon 对照移植，
// 数值=rulesmd [General] AIIonCannon*Value 实测，难度列 0/1/2）
// ============================================================

/** [General] AIIonCannon*Value 数值表（rulesmd 实测值；缺失键=引擎缺省）。 */
export const ION_CANNON_VALUES = {
  conYard: [100, 100, 100],
  warFactory: [100, 100, 100],
  power: [60, 100, 100],
  techCenter: [100, 100, 100],
  engineer: [1, 1, 1],
  harvester: [1, 1, 1],
  mcv: [1, 1, 1],
  baseDefense: [35, 35, 35],
};

/** 评分视图（引擎侧从 getUnitData+rules 预拼装，纯逻辑层不触碰引擎）。 */
export interface IonTargetView {
  id: any;
  tile: { x: number; y: number };
  hitPoints: number;
  isInfantry: boolean;
  /** 步兵：Engineer=yes。 */
  engineer: boolean;
  /** 载具：Harvester=yes。 */
  harvester: boolean;
  /** 载具：DeploysInto ∈ [AI]BuildConst（MCV）。 */
  isMcv: boolean;
  isBuilding: boolean;
  /** 建筑：ConstructionYard=yes。 */
  constructionYard: boolean;
  /** 建筑：Factory=UnitType（战车工厂）。 */
  warFactory: boolean;
  /** 建筑：Power>0（电厂，power>drain 的近似——非电厂 Power=0）。 */
  powerPlant: boolean;
  /** 建筑：IsBaseDefense=yes。 */
  baseDefense: boolean;
  /** 建筑：TechCenter（YR 新增键，引擎未解析时恒 false）。 */
  techCenter: boolean;
  /** 隐形单位：随机评分防"透视"（原版 Cloak==CLOAKED 分支）。 */
  cloaked: boolean;
}

/**
 * 单目标评分（gamemd 0x50CBF0 真版校对）：**YR 无一击死门控**（那是 TS
 * 2.03 行为），类别直接给分——建筑分支序 基地→战工→电厂(power>drain)→
 * 防御→(插/机坪/神庙)→科技→4；载具 矿车→MCV→2；步兵/飞机恒 1。
 * 真版的"格子未探明→分值清零"由引擎侧仅对可见目标评分等价覆盖。
 */
export function scoreIonCannonTarget(
  v: IonTargetView,
  ionDamage: number,
  difficulty: number,
): number {
  const d = difficulty < 0 ? 0 : difficulty > 2 ? 2 : difficulty;
  let value = 1;
  if (v.isBuilding) {
    if (v.constructionYard) value = ION_CANNON_VALUES.conYard[d];
    else if (v.warFactory) value = ION_CANNON_VALUES.warFactory[d];
    else if (v.powerPlant) value = ION_CANNON_VALUES.power[d];
    else if (v.baseDefense) value = ION_CANNON_VALUES.baseDefense[d];
    else if (v.techCenter) value = ION_CANNON_VALUES.techCenter[d];
    else value = 4;
  } else if (!v.isInfantry) {
    // 载具（步兵/飞机恒 1；工程师/小偷 YR 值表同 1，无特判分支）
    if (v.harvester) value = ION_CANNON_VALUES.harvester[d];
    else if (v.isMcv) value = ION_CANNON_VALUES.mcv[d];
    else value = 2;
  }
  return value;
}

/**
 * AI_Ion_Cannon 选靶主函数：取最高分目标（并列均匀随机）。
 * 隐形目标评分=rng[0, best+10]（原版不透视语义）。
 * @returns 胜者视图或 null（无可打目标）
 */
export function pickIonCannonTarget(
  targets: IonTargetView[],
  ionDamage: number,
  difficulty: number,
  randomRanged: (min: number, max: number) => number,
): IonTargetView | null {
  if (!targets || targets.length === 0) return null;
  let best = 0;
  const winners: IonTargetView[] = [];
  for (let i = 0; i < targets.length; i++) {
    const v = targets[i];
    if (!v) continue;
    let value = scoreIonCannonTarget(v, ionDamage, difficulty);
    if (v.cloaked) value = randomRanged(0, best + 10);
    if (value > best) {
      best = value;
      winners.length = 0;
      winners.push(v);
    } else if (value === best) {
      winners.push(v);
    }
  }
  if (winners.length === 0 || best <= 0) return null;
  return winners[randomRanged(0, winners.length - 1)];
}

/**
 * AI_TryFireSW 0x5098F0 移植：对每把就绪超武按类型分发，产出发射指令。
 * @returns 发射指令列表（调用方经 activateSuperWeapon 执行）
 */
export function tryFireSupers(
  supers: SuperWeaponView[],
  world: SuperFireWorld,
): SuperFireCommand[] {
  const commands: SuperFireCommand[] = [];
  if (!supers) return commands;
  for (let i = 0; i < supers.length; i++) {
    const sw = supers[i];
    if (!sw || !sw.ready) continue;
    if (AI_NEVER_FIRE[sw.swType]) continue;
    switch (sw.swType) {
      case 0: {
        // MultiMissile：需要目标 house，选点发射
        if (!world.hasTarget()) break;
        const kind = 1;
        const target = world.pickPointTarget(kind) || world.pickPointTarget(0);
        if (target) commands.push({ swType: sw.swType, target });
        break;
      }
      case 2: {
        // LightningStorm
        const target = world.pickCrowdTarget();
        if (target) commands.push({ swType: sw.swType, target });
        break;
      }
      case 5:
      case 6:
      case 8:
      case 11: {
        // 空投/侦察/揭谍：自施放
        const target = world.pickSelfCastTarget();
        commands.push({ swType: sw.swType, target });
        break;
      }
      case 7:
      case 9: {
        // 心灵支配/基因突变器：敌方密集点
        const target = world.pickCrowdTarget();
        if (target) commands.push({ swType: sw.swType, target });
        break;
      }
      default:
        break;
    }
  }
  return commands;
}
