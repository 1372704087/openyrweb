/**
 * CombatDamageRules — 战斗伤害规则（[CombatDamage] 段：弹头引用、铁幕/力盾时长、伊文炸弹、心灵控制、碉堡/敞开运输车/驻楼武器加成参数）。
 *
 * 由 game/rules/CombatDamageRules.ts.js 机械重写为 TS（语句原样保留，行为完全一致）。
 * 两个文件并存期间，本文件才是修改目标：tools/repack.mjs 打包时优先
 * 采用 .ts 模块的编译产物。
 */


/* eslint-disable @typescript-eslint/no-explicit-any */

export class CombatDamageRules {
  ballisticScatter: any;
  bridgeStrength: any;
  c4Delay: any;
  c4Warhead: any;
  crushWarhead: any;
  fallingDamageMultiplier: any;
  currentStrengthDamage: any;
  deathWeapon: any;
  cMislEliteWarhead: any;
  cMislWarhead: any;
  dMislEliteWarhead: any;
  dMislWarhead: any;
  drainMoneyAmount: any;
  drainMoneyFrameDelay: any;
  drainAnimationType: any;
  flameDamage: any;
  ironCurtainDuration: any;
  forceShieldDuration: any;
  forceShieldRadius: any;
  forceShieldBlackoutDuration: any;
  forceShieldPlayFadeSoundTime: any;
  psychicRevealRadius: any;
  ivanDamage: any;
  ivanIconFlickerRate: any;
  ivanTimedDelay: any;
  ivanWarhead: any;
  overloadCount: any;
  overloadDamage: any;
  overloadFrames: any;
  controlledAnimationType: any;
  permaControlledAnimationType: any;
  mindControlAttackLineFrames: any;
  splashList: any;
  v3EliteWarhead: any;
  v3Warhead: any;
  berserkROFMultiplier: any;
  bunkerDamageMultiplier: any;
  bunkerROFMultiplier: any;
  bunkerWeaponRangeBonus: any;
  openToppedRangeBonus: any;
  openToppedDamageMultiplier: any;
  openToppedWarpDistance: any;
  occupyWeaponRange: any;
  occupyDamageMultiplier: any;
  occupyROFMultiplier: any;

          readIni(ini) {
            ((this.ballisticScatter = ini.getNumber("BallisticScatter")),
              (this.bridgeStrength = ini.getNumber("BridgeStrength")),
              (this.c4Delay = ini.getNumber("C4Delay")),
              (this.c4Warhead = ini.getString("C4Warhead")),
              // 原版 YR 键 CrushWarhead（yrmd.exe 中存放于 Rules+0xfac）：载具碾压
              //（驶过或被磁电投放砸到）其他对象时使用的弹头。磁电拖拽落地后的
              // 碾压判定也走这里（已在 FUN_0054ca90 处验证：TakeDamage 弹头 =
              // Rules+0xfac）。缺省 "Crush"，与原版 rulesmd.ini 一致。
              (this.crushWarhead = ini.getString("CrushWarhead", "Crush")),
              // 磁电拖拽落地伤害参数（原版 YR [CombatDamage] ;***Magnetron*** 段）：
              // FallingDamageMultiplier = 坠落伤害 = 载具基础血量 × 此系数（缺省 1.0）；
              // CurrentStrengthDamage = true（缺省）按当前血量计，否则按最大血量计；
              // 由 MagnetronDragTask._applyDrop 在被拖载具落地时使用。
              (this.fallingDamageMultiplier = ini.getNumber("FallingDamageMultiplier", 1)),
              (this.currentStrengthDamage = ini.getBool("CurrentStrengthDamage", !0)),
              (this.deathWeapon = ini.getString("DeathWeapon")),
              (this.cMislEliteWarhead = ini.getString("CMislEliteWarhead")),
              (this.cMislWarhead = ini.getString("CMislWarhead")),
              (this.dMislEliteWarhead = ini.getString("DMislEliteWarhead")),
              (this.dMislWarhead = ini.getString("DMislWarhead")),
              // 漂浮圆盘（DISCUS）吸取配置（原版 YR）：
              // DrainMoneyAmount = 每隔 DrainMoneyFrameDelay tick 从其悬停的
              //   精炼厂/奴隶矿车吸取的资金数；
              // DrainMoneyFrameDelay = 两次吸取的间隔 tick；
              // DrainAnimationType = 被吸取建筑上播放的动画（纯表现）。
              (this.drainMoneyAmount = ini.getNumber("DrainMoneyAmount", 0)),
              (this.drainMoneyFrameDelay = ini.getNumber("DrainMoneyFrameDelay", 0)),
              (this.drainAnimationType = ini.getString("DrainAnimationType")),
              (this.flameDamage = ini.getString("FlameDamage")),
              (this.ironCurtainDuration = ini.getNumber("IronCurtainDuration")),
              // 力盾超武配置（原版键位于 [General]；yrmd.exe 地址：
              // ForceShieldDuration @ 0x0083bc4c、ForceShieldRadius @ 0x0083bc60、
              // ForceShieldBlackoutDuration @ 0x0083bc30）。启用后，以启用格为中心
              // ForceShieldRadius（格）范围内的建筑获得 ForceShieldDuration 帧
              // 临时无敌；代价是启用方电力进入低电力状态
              // ForceShieldBlackoutDuration 帧。与 IronCurtainDuration 同段存放。
              // 注意：ForceShieldRadius 单位是格（原版 YR INI 规范 "in cells"）。
              (this.forceShieldDuration = ini.getNumber("ForceShieldDuration", 0)),
              (this.forceShieldRadius = ini.getNumber("ForceShieldRadius", 0)),
              (this.forceShieldBlackoutDuration = ini.getNumber("ForceShieldBlackoutDuration", 0)),
              // 力盾到期前播放 ForceShieldFading 音效的提前帧数。
              // 原版 YR [General] ForceShieldPlayFadeSoundTime=75。
              (this.forceShieldPlayFadeSoundTime = ini.getNumber("ForceShieldPlayFadeSoundTime", 0)),
              // 心灵揭示小超武半径（原版键位于 [CombatDamage]）：心灵探测器
              //（YAGGNT）解锁的迷你超武，为启用方永久揭开启用格周围圆形区域
              // 的黑雾。缺省 10 格。
              (this.psychicRevealRadius = ini.getNumber("PsychicRevealRadius", 10)),
              (this.ivanDamage = ini.getNumber("IvanDamage")),
              (this.ivanIconFlickerRate = ini.getNumber("IvanIconFlickerRate")),
              (this.ivanTimedDelay = ini.getNumber("IvanTimedDelay")),
              (this.ivanWarhead = ini.getString("IvanWarhead")),
              // 超时空要塞过载分级参数（原版 YR [CombatDamage]）。
              (this.overloadCount = ini.getArray("OverloadCount")),
              (this.overloadDamage = ini.getArray("OverloadDamage")),
              (this.overloadFrames = ini.getArray("OverloadFrames")),
              // 心灵控制的表现反馈动画（原版 YR [CombatDamage]）。
              (this.controlledAnimationType = ini.getString("ControlledAnimationType")),
              (this.permaControlledAnimationType = ini.getString("PermaControlledAnimationType")),
              (this.mindControlAttackLineFrames = ini.getNumber("MindControlAttackLineFrames", 20)),
              (this.splashList = ini.getArray("SplashList")),
              (this.v3EliteWarhead = ini.getString("V3EliteWarhead")),
              (this.v3Warhead = ini.getString("V3Warhead")),
              // 狂乱射速倍率（原版 YR [CombatDamage] BerserkROFMultiplier）：单位被
              // Psychedelic=yes 弹头击中进入狂乱后，射速乘以此值。缺省 0.5 =
              // 双倍射速。Ares 文档确认缺省 0.5。
              (this.berserkROFMultiplier = ini.getNumber("BerserkROFMultiplier", 0.5)),
              // 坦克碉堡武器加成倍率（原版 YR [CombatDamage]）：
              // BunkerDamageMultiplier = 碉堡内开火时武器伤害的全局倍率；
              // BunkerROFMultiplier = 碉堡内射速的全局倍率；
              // BunkerWeaponRangeBonus = 碉堡内射程附加格数。
              // See ModEnc/BunkerDamageMultiplier, ModEnc/Bunkers.
              (this.bunkerDamageMultiplier = ini.getNumber("BunkerDamageMultiplier", 1)),
              (this.bunkerROFMultiplier = ini.getNumber("BunkerROFMultiplier", 1)),
              (this.bunkerWeaponRangeBonus = ini.getNumber("BunkerWeaponRangeBonus", 0)),
              // 战斗要塞敞开运输乘员开火加成（原版 YR [CombatDamage]）：
              // OpenToppedRangeBonus = 乘员从敞开运输车（如战斗要塞，缺省 2 格）
              //   开火时的射程附加格数；
              // OpenToppedDamageMultiplier = 乘员武器伤害的全局倍率（缺省 1.2 = +20%）；
              // OpenToppedWarpDistance = 敞开运输车远离超时空军团兵相位目标至此
              //   格数时断开时间链接（缺省 7）。
              (this.openToppedRangeBonus = ini.getNumber("OpenToppedRangeBonus", 2)),
              (this.openToppedDamageMultiplier = ini.getNumber("OpenToppedDamageMultiplier", 1.2)),
              (this.openToppedWarpDistance = ini.getNumber("OpenToppedWarpDistance", 7)),
              // 驻楼步兵开火加成（原版 YR [CombatDamage]）：
              // OccupyWeaponRange = Occupier=yes 步兵驻楼时所有武器射程的覆盖值
              //   （缺省 5）。需要固定值：不同驻员射程不同，否则短射程者会让
              //   建筑停火；
              // OccupyDamageMultiplier = 驻楼期间武器伤害倍率（缺省 1.2）；
              // OccupyROFMultiplier = 驻楼期间射速倍率（缺省 1.2，越大越快）。
              (this.occupyWeaponRange = ini.getNumber("OccupyWeaponRange", 5)),
              (this.occupyDamageMultiplier = ini.getNumber("OccupyDamageMultiplier", 1.2)),
              (this.occupyROFMultiplier = ini.getNumber("OccupyROFMultiplier", 1.2)));
          }
        }
