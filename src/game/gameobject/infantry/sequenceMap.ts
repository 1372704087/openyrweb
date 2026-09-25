/**
 * sequenceMap — 步兵动画序列选择（纯函数表：姿态×区域→SequenceType）。
 *
 * 按 ZoneType（水/空/陆）与 StanceType（警戒/卧倒/部署/空降/欢呼）挑选
 * 开火、移动、待机、静止、姿态切换、坠毁、死亡动画序列名；findSequence
 * 按「开火→移动→静止」优先级在可用序列里回退查找。
 *
 * 由 game/gameobject/infantry/sequenceMap.ts.js 重写为 TS（行为完全一
 * 致）。两个文件并存期间，本文件才是修改目标：tools/repack.mjs 打包时
 * 优先采用 .ts 模块的编译产物。
 */
import * as ZoneTypeModule from "game/gameobject/unit/ZoneType"; // 已转换
import * as SequenceTypeModule from "game/art/SequenceType"; // 已转换
import * as StanceTypeModule from "game/gameobject/infantry/StanceType"; // 已转换
import * as InfDeathTypeModule from "game/gameobject/infantry/InfDeathType"; // 已转换

/* eslint-disable @typescript-eslint/no-explicit-any */

/** 开火序列：部署→湿战→飞行→卧倒→站立。 */
export const getFireSequenceBy = (zone: any, stance: any = StanceTypeModule.StanceType.None): any =>
  stance === StanceTypeModule.StanceType.Deployed
    ? SequenceTypeModule.SequenceType.DeployedFire
    : zone === ZoneTypeModule.ZoneType.Water
      ? SequenceTypeModule.SequenceType.WetAttack
      : zone === ZoneTypeModule.ZoneType.Air
        ? SequenceTypeModule.SequenceType.FireFly
        : stance === StanceTypeModule.StanceType.Prone
          ? SequenceTypeModule.SequenceType.FireProne
          : SequenceTypeModule.SequenceType.FireUp;

/** 移动序列：飞行→游泳→爬行→恐慌→行走。 */
export const getMoveSequenceBy = (zone: any, stance: any, panic: boolean): any =>
  zone === ZoneTypeModule.ZoneType.Air
    ? SequenceTypeModule.SequenceType.Fly
    : zone === ZoneTypeModule.ZoneType.Water
      ? SequenceTypeModule.SequenceType.Swim
      : stance === StanceTypeModule.StanceType.Prone
        ? SequenceTypeModule.SequenceType.Crawl
        : panic
          ? SequenceTypeModule.SequenceType.Panic
          : SequenceTypeModule.SequenceType.Walk;

/** 待机序列：部署单条；水域两条湿待机；陆地两条待机；空中无（undefined）。 */
export const getIdleSequenceBy = (zone: any, stance: any = StanceTypeModule.StanceType.None): any =>
  stance === StanceTypeModule.StanceType.Deployed
    ? [SequenceTypeModule.SequenceType.DeployedIdle]
    : zone === ZoneTypeModule.ZoneType.Water
      ? [SequenceTypeModule.SequenceType.WetIdle1, SequenceTypeModule.SequenceType.WetIdle2]
      : zone !== ZoneTypeModule.ZoneType.Air
        ? [SequenceTypeModule.SequenceType.Idle1, SequenceTypeModule.SequenceType.Idle2]
        : void 0;

/** 静止序列：部署→踩水→悬停→卧倒→警戒→空降→持枪。 */
export const getStillSequenceBy = (zone: any, stance: any = StanceTypeModule.StanceType.None): any =>
  stance === StanceTypeModule.StanceType.Deployed
    ? SequenceTypeModule.SequenceType.Deployed
    : zone === ZoneTypeModule.ZoneType.Water
      ? SequenceTypeModule.SequenceType.Tread
      : zone === ZoneTypeModule.ZoneType.Air
        ? SequenceTypeModule.SequenceType.Hover
        : stance === StanceTypeModule.StanceType.Prone
          ? SequenceTypeModule.SequenceType.Prone
          : stance === StanceTypeModule.StanceType.Guard
            ? SequenceTypeModule.SequenceType.Guard
            : stance === StanceTypeModule.StanceType.Paradrop
              ? SequenceTypeModule.SequenceType.Paradrop
              : SequenceTypeModule.SequenceType.Ready;

/** 姿态切换：from 卧倒→Up；to 卧倒→Down；from 部署→Undeploy；to 部署→Deploy；to 欢呼→Cheer；否则 undefined。 */
export const getStanceTransitionSequenceBy = (from: any, to: any): any =>
  from === StanceTypeModule.StanceType.Prone
    ? SequenceTypeModule.SequenceType.Up
    : to === StanceTypeModule.StanceType.Prone
      ? SequenceTypeModule.SequenceType.Down
      : from === StanceTypeModule.StanceType.Deployed
        ? SequenceTypeModule.SequenceType.Undeploy
        : to === StanceTypeModule.StanceType.Deployed
          ? SequenceTypeModule.SequenceType.Deploy
          : to === StanceTypeModule.StanceType.Cheer
            ? SequenceTypeModule.SequenceType.Cheer
            : void 0;

/** 坠毁序列：动画里有 AirDeathStart/AirDeathFalling 才返回，否则 undefined。 */
export const getCrashingSequences = (obj: any): any => {
  const available = [...obj.art.sequences.keys()];
  const list = [SequenceTypeModule.SequenceType.AirDeathStart, SequenceTypeModule.SequenceType.AirDeathFalling].filter(
    (s: any) => available.includes(s),
  );
  if (list.length) return list;
};

/**
 * 死亡序列：
 *  - 坠毁中 → [AirDeathFinish]
 *  - 空中   → [Tumble]
 *  - 水域   → 孪生 (非枪击/爆炸 && isHuman) || (a=[WetDie1,WetDie2])：
 *             左真时 a 保持 undefined；左假时赋值两条 WetDie
 *  - 陆地   → 非枪击且 isHuman：爆炸→[Die2]，其余→a 留空；
 *             否则（枪击或非人类）→[Die1]
 * 过滤到 art 里存在的项；空则返回 undefined。
 */
export const getDeathSequence = (obj: any, deathType: any): any => {
  const zone = obj.zone;
  const isHuman = obj.rules.isHuman;
  const available = [...obj.art.sequences.keys()];
  let list: any;

  if (obj.isCrashing) {
    list = [SequenceTypeModule.SequenceType.AirDeathFinish];
  } else if (zone === ZoneTypeModule.ZoneType.Air) {
    list = [SequenceTypeModule.SequenceType.Tumble];
  } else if (zone === ZoneTypeModule.ZoneType.Water) {
    // 精确复刻 (cond) || (a = [...])：cond 真 → 不赋值；cond 假 → 赋值
    const left =
      ![InfDeathTypeModule.InfDeathType.Gunfire, InfDeathTypeModule.InfDeathType.Explode].includes(deathType) &&
      isHuman;
    if (!left) list = [SequenceTypeModule.SequenceType.WetDie1, SequenceTypeModule.SequenceType.WetDie2];
  } else if (deathType !== InfDeathTypeModule.InfDeathType.Gunfire && isHuman) {
    // 精确复刻 t === Explode && (a = [Die2])：仅爆炸赋值
    if (deathType === InfDeathTypeModule.InfDeathType.Explode) list = [SequenceTypeModule.SequenceType.Die2];
  } else {
    list = [SequenceTypeModule.SequenceType.Die1];
  }

  if (list) {
    list = list.filter((s: any) => available.includes(s));
    if (!list.length) list = void 0;
  }
  return list;
};

/**
 * 死亡特殊动画名（Rules [AudioVisual] 字段或 animationNames[1]）。
 * ExplodeAlt→infantryExplode；Fire→flamingInfantry；Electro→animationNames[1]；
 * HeadExplode→infantryHeadPop；Nuke→infantryNuked；Virus→infantryVirus；
 * Mutate→infantryMutate；YuriDeath(10)→infantryBrute（狂兽人撕裂）。
 */
export const getDeathAnim = (rules: any, deathType: any): any =>
  deathType === InfDeathTypeModule.InfDeathType.ExplodeAlt
    ? rules.audioVisual.infantryExplode
    : deathType === InfDeathTypeModule.InfDeathType.Fire
      ? rules.audioVisual.flamingInfantry
      : deathType === InfDeathTypeModule.InfDeathType.Electro
        ? [...rules.animationNames][1]
        : deathType === InfDeathTypeModule.InfDeathType.HeadExplode
          ? rules.audioVisual.infantryHeadPop
          : deathType === InfDeathTypeModule.InfDeathType.Nuke
            ? rules.audioVisual.infantryNuked
            : deathType === InfDeathTypeModule.InfDeathType.Virus
              ? rules.audioVisual.infantryVirus
              : deathType === InfDeathTypeModule.InfDeathType.Mutate
                ? rules.audioVisual.infantryMutate
                : // InfDeath=10 (vanilla BruteWH). Plays [AudioVisual]
                  // InfantryBrute (BRUTDIE) — the victim is torn apart/flung by a Brute.
                  deathType === InfDeathTypeModule.InfDeathType.YuriDeath
                  ? rules.audioVisual.infantryBrute
                  : void 0;

/**
 * 按「开火→移动→静止」优先级在可用序列里回退查找。
 * 形参位次与孪生一致：3rd=移动门控（isMoving）、4th=开火门控（isFiring）——
 * 调用方 findSequenceBy 传 (zone, stance, isMoving, isFiring, isPanicked)，
 * 门控与位次必须对齐，否则移动播开火帧、开火播走路帧。
 * fire 先查（当前姿态，再回退默认姿态）；move 再查（当前，再回退 None）；
 * 最后 still（当前，再回退默认，再回退 Ground 区默认）。全部落空返回 undefined。
 */
export const findSequence = (
  zone: any,
  stance: any,
  canMove: boolean,
  canFire: boolean,
  panic: boolean,
  available: any[],
): any => {
  const has = (s: any) => -1 !== available.indexOf(s);
  let result;
  if (canFire) {
    result = getFireSequenceBy(zone, stance);
    if (!has(result)) {
      result = getFireSequenceBy(zone);
      if (!has(result)) result = void 0;
    }
  }
  if (result === void 0 && canMove) {
    result = getMoveSequenceBy(zone, stance, panic);
    if (!has(result)) {
      result = getMoveSequenceBy(zone, StanceTypeModule.StanceType.None, panic);
      if (!has(result)) result = void 0;
    }
  }
  if (result === void 0) {
    result = getStillSequenceBy(zone, stance);
    if (!has(result)) {
      result = getStillSequenceBy(zone);
      if (!has(result)) result = getStillSequenceBy(ZoneTypeModule.ZoneType.Ground);
    }
  }
  return result;
};
