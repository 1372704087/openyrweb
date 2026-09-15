/**
 * WeaponRules — 武器规则（[WeaponTypes] 段条目：伤害/射速/弹头引用/波束与激光/磁电束表现参数）。
 *
 * 由 game/rules/WeaponRules.ts.js 机械重写为 TS（语句原样保留，行为完全一致）。
 * 两个文件并存期间，本文件才是修改目标：tools/repack.mjs 打包时优先
 * 采用 .ts 模块的编译产物。
 */
import * as M0_ObjectRules from "game/rules/ObjectRules";

/* eslint-disable @typescript-eslint/no-explicit-any */

export class WeaponRules {
  rules: any;
  ambientDamage: any;
  anim: any;
  areaFire: any;
  burst: any;
  cellRangefinding: any;
  damage: any;
  drainWeapon: any;
  decloakToFire: any;
  fireOnce: any;
  fireWhileMoving: any;
  isAlternateColor: any;
  isElectricBolt: any;
  isHouseColor: any;
  isMagBeam: any;
  waveColor: any;
  waveIntensity: any;
  waveIsHouseColor: any;
  waveReverseAgainstVehicles: any;
  isCustomColor: any;
  magnaBeamColor: any;
  magnaBeamAlpha: any;
  magnaBeamHouseColor: any;
  magnaBeamWidth: any;
  magnaBeamOuterSpread: any;
  magnaBeamWaveAmplitude: any;
  magnaBeamWaveFrequency: any;
  magnaBeamWaveSpeed: any;
  magnaBeamPulse: any;
  magnaBeamPulseRate: any;
  magnaBeamAdditive: any;
  magnaBeamStartAnim: any;
  magnaBeamEndAnim: any;
  magnaBeamAnimScale: any;
  isLaser: any;
  isDiskLaser: any;
  diskLaserRadius: any;
  laserInnerColor: any;
  laserOuterColor: any;
  laserOuterSpread: any;
  isRadBeam: any;
  isSonic: any;
  laserDuration: any;
  limboLaunch: any;
  minimumRange: any;
  name: any;
  neverUse: any;
  omniFire: any;
  infiniteMindControl: any;
  projectile: any;
  radLevel: any;
  range: any;
  report: any;
  revealOnFire: any;
  rof: any;
  sabotageCursor: any;
  migAttackCursor: any;
  spawner: any;
  iniSpeed: any;
  speed: any;
  suicide: any;
  useSparkParticles: any;
  warhead: any;

          constructor(e) {
            ((this.rules = e), this.parse());
          }
          parse() {
            ((this.ambientDamage = this.rules.getNumber("AmbientDamage")),
              (this.anim = this.rules.getArray("Anim")),
              (this.areaFire = this.rules.getBool("AreaFire")),
              (this.burst = this.rules.getNumber("Burst", 1)),
              (this.cellRangefinding = this.rules.getBool("CellRangefinding")),
              (this.damage = this.rules.getNumber("Damage")),
              // DrainWeapon=yes：命中 Drainable=yes 建筑时吸取电力/资金而非造成伤害
              //（漂浮圆盘 DISCUS 使用）。经 yrmd.exe 逆向确认：DrainWeapon 是
              // WeaponTypeClass::ReadINI（@ 0x00849470）解析的逐武器布尔键。
              (this.drainWeapon = this.rules.getBool("DrainWeapon")),
              (this.decloakToFire = this.rules.getBool("DecloakToFire", !0)),
              (this.fireOnce = this.rules.getBool("FireOnce")),
              // FireWhileMoving（原版 YR 武器键）：no 时单位必须完全静止才能开火
              //（原版：漂浮圆盘的 DiskDrain）。缺省 yes——多数武器可移动开火。
              (this.fireWhileMoving = this.rules.getBool("FireWhileMoving", !0)),
              (this.isAlternateColor = this.rules.getBool("IsAlternateColor")),
              (this.isElectricBolt = this.rules.getBool("IsElectricBolt")),
              (this.isHouseColor = this.rules.getBool("IsHouseColor")),
              // IsMagBeam=yes：标记该武器渲染磁电牵引束特效。实际拖拽逻辑还要求
              // 武器弹头带 IsLocomotor=yes。这让 rulesmd.ini 可以继续在 MagneShake 上保留
              // 其他用途的同时不误触牵引束特效。
              (this.isMagBeam = this.rules.getBool("IsMagBeam")),
              // 磁电牵引束专用渲染参数（2026-07-06 逆向）：控制牵引束的
              // 颜色、透明度、宽度、波形畸变、脉冲/闪烁、光晕与混合模式。
              // 从武器 INI 段（如 [MagneticBeam]）解析，取代旧的硬编码
              // RadBeamFx 表现。缺省值与原版 YR 紫束外观一致。
              // 原版 YR 波形混合公式（Ares 逆向）：
              //   result = c + color * x + c * intensity * x
              //   其中 c = 背景像素，x = 路径上的波形值（0..1）
              // 磁电坦克缺省：Wave.Color=0,0,0，Wave.Intensity=128,0,1024
              (this.waveColor = this.rules.getNumberArray("Wave.Color", /,\s*/, [0, 0, 0])),
              (this.waveIntensity = this.rules.getNumberArray("Wave.Intensity", /,\s*/, [128, 0, 1024])),
              (this.waveIsHouseColor = this.rules.getBool("Wave.IsHouseColor")),
              // 波形方向：原版 YR 中 IsMagBeam 武器对载具默认反向绘制
              //（波形从目标→开火者）；其余波形类型默认不反向。
              (this.waveReverseAgainstVehicles = this.rules.getBool("Wave.ReverseAgainstVehicles", !!this.isMagBeam)),
              (this.isCustomColor = this.rules.getBool("IsCustomColor")),
              // 原版 YR：束颜色硬编码 #B000D0 (176,0,208)，MagnaBeamColor 在原版中
              // 无效（ModEnc 确认）。本引擎将其用作缺省值。
              (this.magnaBeamColor = this.rules.getNumberArray("MagnaBeamColor", /,\s*/, [176, 0, 208])),
              (this.magnaBeamAlpha = this.rules.getNumber("MagnaBeamAlpha", 0.85)),
              (this.magnaBeamHouseColor = this.rules.getBool("MagnaBeamHouseColor")),
              (this.magnaBeamWidth = this.rules.getNumber("MagnaBeamWidth", 10.0)),
              // 原版 YR：单层平面 2D 波形、无光晕。缺省 0 = 无光晕。
              (this.magnaBeamOuterSpread = this.rules.getNumber("MagnaBeamOuterSpread", 0)),
              (this.magnaBeamWaveAmplitude = this.rules.getNumber("MagnaBeamWaveAmplitude", 1.8)),
              (this.magnaBeamWaveFrequency = this.rules.getNumber("MagnaBeamWaveFrequency", 6.0)),
              (this.magnaBeamWaveSpeed = this.rules.getNumber("MagnaBeamWaveSpeed", 2.2)),
              (this.magnaBeamPulse = this.rules.getNumber("MagnaBeamPulse", 0.3)),
              (this.magnaBeamPulseRate = this.rules.getNumber("MagnaBeamPulseRate", 3.5)),
              (this.magnaBeamAdditive = this.rules.getBool("MagnaBeamAdditive", !0)),
              (this.magnaBeamStartAnim = this.rules.getString("MagnaBeamStartAnim") || void 0),
              (this.magnaBeamEndAnim = this.rules.getString("MagnaBeamEndAnim") || void 0),
              (this.magnaBeamAnimScale = this.rules.getNumber("MagnaBeamAnimScale", 1.0)),
              (this.isLaser = this.rules.getBool("IsLaser")),
              // DiskLaser=yes：启用漂浮圆盘的环形激光充能特效。以 FLH 位置为圆心
              // 画半径 240 lepton 的圆，两段弧从对面点顺/逆时针充能至最靠近目标的
              // 点；充能完成后从最近点向目标发射激光。出处：yrmd.exe
              // WeaponTypeClass::ReadINI、ModEnc DiskLaser 页。
              (this.isDiskLaser = this.rules.getBool("DiskLaser")),
              // Phobos 扩展键：环半径可自定义（lepton）。缺省 240 与原版 YR
              // 硬编码半径一致。
              (this.diskLaserRadius = this.rules.getNumber("DiskLaser.Radius", 240)),
              // 环激光内束颜色。原版缺省 (216,0,184) —— 品红。
              (this.laserInnerColor = this.rules.getNumberArray("LaserInnerColor", /,\s*/, [216, 0, 184])),
              // 环激光外晕颜色。原版缺省 (80,0,88) —— 暗品红。
              (this.laserOuterColor = this.rules.getNumberArray("LaserOuterColor", /,\s*/, [80, 0, 88])),
              // LaserOuterSpread 控制外晕超出内束的扩散程度。
              // 三元组 (R,G,B)。原版缺省 (0,0,0) = 无外晕。
              (this.laserOuterSpread = this.rules.getNumberArray("LaserOuterSpread", /,\s*/, [0, 0, 0])),
              (this.isRadBeam = this.rules.getBool("IsRadBeam")),
              (this.isSonic = this.rules.getBool("IsSonic")),
              (this.laserDuration = this.rules.getNumber("LaserDuration")),
              (this.limboLaunch = this.rules.getBool("LimboLaunch")),
              (this.minimumRange = this.rules.getNumber("MinimumRange")),
              (this.name = this.rules.name),
              (this.neverUse = this.rules.getBool("NeverUse")),
              (this.omniFire = this.rules.getBool("OmniFire")),
              // InfiniteMindControl=yes：无硬容量上限的心灵控制武器——控制方可无限
              // 获取目标，但超出安全容量（武器 Damage）后受到递增的过载自伤。
              // 原版 YR 中超时空要塞（MIND）有此行为，尤里复制人/X 没有。
              (this.infiniteMindControl = this.rules.getBool("InfiniteMindControl")),
              (this.projectile = this.rules.getString("Projectile")),
              (this.radLevel = this.rules.getNumber("RadLevel")),
              (this.range = this.rules.getNumber("Range")),
              -2 === this.range && (this.range = Number.POSITIVE_INFINITY),
              (this.report = this.rules.getArray("Report")),
              (this.revealOnFire = this.rules.getBool("RevealOnFire", !0)),
              (this.rof = this.rules.getNumber("ROF")),
              (this.sabotageCursor = this.rules.getBool("SabotageCursor")),
              // MigAttackCursor=yes：标记鲍里斯的照明弹武器。该武器指向建筑时光标
              // 变为空袭，并创建 AirstrikeAttackTask 而非普通攻击任务。原版 YR 在
              // 鲍里斯副武器上用此标志触发米格空袭呼叫。
              (this.migAttackCursor = this.rules.getBool("MigAttackCursor")),
              (this.spawner = this.rules.getBool("Spawner")));
            var e = this.rules.getNumber("Speed");
            ((this.iniSpeed = e),
              (this.speed = M0_ObjectRules.ObjectRules.iniSpeedToLeptonsPerTick(e, 100)),
              (this.suicide = this.rules.getBool("Suicide")),
              (this.useSparkParticles = this.rules.getBool("UseSparkParticles")),
              (this.warhead = this.rules.getString("Warhead")));
          }
        }
