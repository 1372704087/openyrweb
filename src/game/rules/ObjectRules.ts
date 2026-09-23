/**
 * ObjectRules — 全部 INI 规则类的基类（GameObject 规则的最小公共集）。
 *
 * RA2 的 rulesmd.ini 中每种对象（单位/建筑/弹丸…）各有一个命名段落，
 * 解析后由本类的子类（TechnoRules/ProjectileRules/…）持有。基类负责：
 *  - 记录段落名（ini）、对象类型（type）与同段索引（index，同名多段时
 *    区分用，缺省 -1）；
 *  - parse() 解析所有对象共有的通用键（可碾压性、是否合法目标、UI 名、
 *    美术图名等）；
 *  - 两个 INI 数值换算静态工具：速度 0-255 刻度 → lepton/tick，
 *    旋转 0-255 刻度 → 度/tick（原版 INI 用 256 刻度表示满速/满圈）。
 *
 * 子类在自己的 parse() 中先调 super.parse() 再追加各自的键。
 *
 * 由 game/rules/ObjectRules.ts.js 重写为 TS（行为完全一致）。两个文件
 * 并存期间，本文件才是修改目标：tools/repack.mjs 打包时优先采用 .ts
 * 模块的编译产物。
 *
 * 两个文件并存期间，本文件才是修改目标：tools/repack.mjs 打包时优先采用 .ts 模块的编译产物。
 */
import { ObjectType } from "engine/type/ObjectType";

/* eslint-disable @typescript-eslint/no-explicit-any */
export class ObjectRules {
  /** Image= 键的哨兵值：显式声明"无图片"。 */
  static IMAGE_NONE = "none";

  /**
   * INI 速度刻度（0-255）→ lepton/tick，封顶 256（一格每 tick）。
   * @param speed INI Speed= 值
   * @param frameRate 该速度类型的基础帧率（GameSpeed 相关换算基数）
   */
  static iniSpeedToLeptonsPerTick(speed: number, frameRate: number): number {
    return Math.min(256, (256 * speed) / frameRate);
  }

  /** INI 旋转刻度（0-255 表示一圈）→ 度/tick。 */
  static iniRotToDegsPerTick(rot: number): number {
    return (rot / 256) * 360;
  }

  type: ObjectType;
  /** 原始 INI 段落包装（getString/getBool 等，含段名 name）。 */
  ini: any;
  /** 同名段落内的序号（-1 = 唯一段）。 */
  index: number;
  generalRules: any;

  // ---- 通用键（所有对象段落均可声明） ----
  alphaImage: string;
  alternateArcticArt: boolean;
  crushable: boolean;
  /** 原版 YR 键：OmniCrushResistant=yes 时不可被 OmniCrusher=yes 单位碾压（优先级高于 OmniCrusher）；对普通 Crusher=yes 且自身 Crushable=yes 的碾压无保护。 */
  omniCrushResistant: boolean;
  crushSound: string;
  dontScore: boolean;
  insignificant: boolean;
  legalTarget: boolean;
  noShadow: boolean;
  uiName: string;

  constructor(type: ObjectType, ini: any, index = -1, generalRules?: any) {
    this.type = type;
    this.ini = ini;
    this.index = index;
    this.generalRules = generalRules;
    this.parse();
  }

  /** 解析全部对象共有的 INI 键；子类覆写时须先 super.parse()。 */
  parse(): void {
    this.alphaImage = this.ini.getString("AlphaImage") || undefined;
    this.alternateArcticArt = this.ini.getBool("AlternateArcticArt");
    this.crushable = this.ini.getBool("Crushable", this.type === ObjectType.Infantry);
    // 原版 YR 键 OmniCrushResistant（英文注释为原始解析说明，保留备查）：
    // When yes, the object cannot be crushed by units with OmniCrusher=yes
    // (OmniCrushResistant trumps OmniCrusher). It does NOT protect against
    // regular Crusher=yes units when Crushable=yes.
    this.omniCrushResistant = this.ini.getBool("OmniCrushResistant");
    this.crushSound = this.ini.getString("CrushSound") || undefined;
    this.dontScore = this.ini.getBool("DontScore");
    this.insignificant = this.ini.getBool("Insignificant");
    this.legalTarget = this.ini.getBool("LegalTarget", true);
    this.noShadow = this.ini.getBool("NoShadow");
    this.uiName = this.ini.getString("UIName");
  }

  /** 段落名即对象 INI 内部名（如 "GI"、"AMRADR"）。 */
  get name(): string {
    return this.ini.name;
  }

  /**
   * 美术图名：Image= 键优先；未声明或声明为 "none" 以外的空值时回落到
   * 段落名（原版约定：图像默认与规则段同名）。
   */
  get imageName(): string {
    let image = this.ini.getString("Image");
    if (!image || image === "null") image = this.name;
    return image;
  }
}
