/**
 * WarheadRules — 弹头规则（[Warheads] 段条目：verses 威力表、死亡方式、辐射/心灵/时间等特殊标记）。
 *
 * 由 game/rules/WarheadRules.ts.js 机械重写为 TS（语句原样保留，行为完全一致）。
 * 两个文件并存期间，本文件才是修改目标：tools/repack.mjs 打包时优先
 * 采用 .ts 模块的编译产物。
 */
import * as M0_InfDeathType from "game/gameobject/infantry/InfDeathType";

/* eslint-disable @typescript-eslint/no-explicit-any */

export class WarheadRules {
  rules: any;
  verses: any;
  affectsAllies: any;
  animList: any;
  bombDisarm: any;
  bullets: any;
  causesDelayKill: any;
  cellSpread: any;
  conventional: any;
  culling: any;
  delayKillAtMax: any;
  delayKillFrames: any;
  electricAssault: any;
  emEffect: any;
  infDeath: any;
  ivanBomb: any;
  isLocomotor: any;
  makesDisguise: any;
  mindControl: any;
  buildingMindControl: any;
  nukeMaker: any;
  paralyzes: any;
  parasite: any;
  percentAtMax: any;
  proneDamage: any;
  psychicDamage: any;
  radiation: any;
  rocker: any;
  sonic: any;
  temporal: any;
  penetratesBunker: any;
  wallAbsoluteDestroyer: any;
  wall: any;
  wood: any;
  airstrike: any;

          constructor(e) {
            ((this.rules = e), (this.verses = new Map()), this.parse());
          }
          get name() {
            return this.rules.name;
          }
          parse() {
            ((this.affectsAllies = this.rules.getBool("AffectsAllies", !0)),
              (this.animList = this.rules.getArray("AnimList")),
              (this.bombDisarm = this.rules.getBool("BombDisarm")),
              (this.bullets = this.rules.getBool("Bullets")),
              (this.causesDelayKill = this.rules.getBool("CausesDelayKill")),
              (this.cellSpread = this.rules.getNumber("CellSpread")),
              (this.conventional = this.rules.getBool("Conventional")),
              (this.culling = this.rules.getBool("Culling")),
              (this.delayKillAtMax = this.rules.getNumber("DelayKillAtMax")),
              (this.delayKillFrames = this.rules.getNumber("DelayKillFrames")),
              (this.electricAssault = this.rules.getBool("ElectricAssault")),
              (this.emEffect = this.rules.getBool("EMEffect")),
              (this.infDeath = this.rules.getEnumNumeric("InfDeath", M0_InfDeathType.InfDeathType, M0_InfDeathType.InfDeathType.None)),
              (this.ivanBomb = this.rules.getBool("IvanBomb")),
              // IsLocomotor=yes 标记磁电坦克的 LocomotorBeam 弹头：这类弹头不造成
              // 常规伤害，而是把命中载具拖向开火单位（在 Warhead.detonate 中处理）。
              // 原版 YR 用于磁电坦克（YTNK）主武器 MagneticBeam
              //（Warhead=LocomotorBeam）。
              (this.isLocomotor = this.rules.getBool("IsLocomotor")),
              (this.makesDisguise = this.rules.getBool("MakesDisguise")),
              (this.mindControl = this.rules.getBool("MindControl")),
              (this.buildingMindControl = this.rules.getBool("BuildingMindControl")),
              (this.nukeMaker = this.rules.getBool("NukeMaker")),
              (this.paralyzes = this.rules.getNumber("Paralyzes")),
              (this.parasite = this.rules.getBool("Parasite")),
              (this.percentAtMax = this.rules.getNumber("PercentAtMax", 1)),
              (this.proneDamage = this.rules.getFixed("ProneDamage", 1)),
              // 原版 YR 的混乱/狂乱效果（混乱无人机瓦斯）INI 键为 "Psychedelic"；
              // 同时兼容读取 "PsychicDamage"（旧拼写回退）。
              (this.psychicDamage = this.rules.getBool("Psychedelic") || this.rules.getBool("PsychicDamage")),
              (this.radiation = this.rules.getBool("Radiation")),
              (this.rocker = this.rules.getBool("Rocker")),
              (this.sonic = this.rules.getBool("Sonic")),
              (this.temporal = this.rules.getBool("Temporal")),
              // PenetratesBunker=yes（弹头键，缺省 no）：带此标志的弹头命中坦克碉堡内
              // 载具时，伤害直接作用于载具而非被碉堡吸收。参见 ModEnc/PenetratesBunker。
              (this.penetratesBunker = this.rules.getBool("PenetratesBunker")));
            let e = this.rules.getFixedArray("Verses");
            (e.forEach((e, t) => this.verses.set(t, e)),
              (this.wallAbsoluteDestroyer = this.rules.getBool("WallAbsoluteDestroyer")),
              (this.wall = this.rules.getBool("Wall")),
              (this.wood = this.rules.getBool("Wood")),
              // Airstrike=yes：标记鲍里斯照明弹武器（AirstrikeFlare）使用的弹头。
              // 该弹头命中建筑时触发米格空袭序列而非常规伤害。原版 YR 在鲍里斯
              // 副武器（Flare → Warhead=AirstrikeFlare）上使用此标志。
              (this.airstrike = this.rules.getBool("Airstrike")));
          }
        }
