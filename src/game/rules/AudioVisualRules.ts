/**
 * AudioVisualRules — 音视规则（[AudioVisual] 段：环境光、事件动画与音效、颜色表等全局表现参数）。
 *
 * 由 game/rules/AudioVisualRules.ts.js 机械重写为 TS（语句原样保留，行为完全一致）。
 * 两个文件并存期间，本文件才是修改目标：tools/repack.mjs 打包时优先
 * 采用 .ts 模块的编译产物。
 */


/* eslint-disable @typescript-eslint/no-explicit-any */

export class AudioVisualRules {
  ini: any;
  ambientChangeRate: any;
  ambientChangeStep: any;
  behind: any;
  benderOfSpoons: any;
  berserkColor: any;
  bridgeExplosions: any;
  chronoBeamColor: any;
  chronoBlast: any;
  chronoBlastDest: any;
  chronoPlacement: any;
  chronoSparkle1: any;
  conditionRed: any;
  conditionYellow: any;
  creditTicks: any;
  extraAircraftLight: any;
  extraInfantryLight: any;
  extraUnitLight: any;
  fireNames: any;
  flyerHelper: any;
  gravity: any;
  idleActionFrequency: any;
  impactLandSound: any;
  impactWaterSound: any;
  infantryExplode: any;
  flamingInfantry: any;
  infantryHeadPop: any;
  infantryNuked: any;
  infantryVirus: any;
  infantryMutate: any;
  infantryBrute: any;
  dominatorWarhead: any;
  dominatorDamage: any;
  dominatorCaptureRange: any;
  dominatorFirstAnim: any;
  dominatorSecondAnim: any;
  dominatorFireAtPercentage: any;
  dominatorActivateSound: any;
  mutateWarhead: any;
  mutateExplosionWarhead: any;
  masterMindOverloadDeathSound: any;
  mindClearedSound: any;
  bunkerWallsUpSound: any;
  bunkerWallsDownSound: any;
  ironCurtainInvokeAnim: any;
  forceShieldInvokeAnim: any;
  forceShieldColor: any;
  airstrikeAttackVoice: any;
  airstrikeTargetAcquiredSound: any;
  airstrikeDeathSound: any;
  airstrikeAbortSound: any;
  enterGrinderSound: any;
  spyPlaneCamera: any;
  spyPlaneCameraFrames: any;
  messageDuration: any;
  metallicDebris: any;
  nukeTakeOff: any;
  deadBodies: any;
  wake: any;
  parachute: any;
  moveFlash: any;
  warpOut: any;
  warpAway: any;
  weaponNullifyAnim: any;
  weatherConClouds: any;
  weatherConBoltExplosion: any;
  weatherConBolts: any;

          readIni(ini) {
            ((this.ini = ini),
              (this.ambientChangeRate = ini.getNumber("AmbientChangeRate")),
              (this.ambientChangeStep = ini.getNumber("AmbientChangeStep")),
              (this.behind = ini.getString("Behind")),
              (this.benderOfSpoons = ini.getString("BenderOfSpoons") || void 0),
              // 狂乱单位染色（原版 YR [AudioVisual] BerserkColor）：对中了
              // Psychedelic=yes 弹头（混乱无人机瓦斯）的单位施加重映射染色。
              // 缺省为紫红色（原版 255,0,255）。格式 r,g,b（0-255）。
              (this.berserkColor = ini.getNumberArray("BerserkColor")),
              (this.bridgeExplosions = ini.getArray("BridgeExplosions")),
              (this.chronoBeamColor = ini.getNumberArray("ChronoBeamColor")),
              (this.chronoBlast = ini.getString("ChronoBlast")),
              (this.chronoBlastDest = ini.getString("ChronoBlastDest")),
              (this.chronoPlacement = ini.getString("ChronoPlacement")),
              (this.chronoSparkle1 = ini.getString("ChronoSparkle1")),
              (this.conditionRed = ini.getNumber("ConditionRed")),
              (this.conditionYellow = ini.getNumber("ConditionYellow")),
              (this.creditTicks = ini.getArray("CreditTicks")),
              (this.extraAircraftLight = ini.getNumber("ExtraAircraftLight")),
              (this.extraInfantryLight = ini.getNumber("ExtraInfantryLight")),
              (this.extraUnitLight = ini.getNumber("ExtraUnitLight")));
            let t = ini.getString("DamageFireTypes");
            ((t = t || "FIRE01,FIRE02,FIRE03"),
              (this.fireNames = t.split(/\.|,/).filter((ini) => "" !== ini)),
              (this.flyerHelper = ini.getString("FlyerHelper")),
              (this.gravity = ini.getNumber("Gravity")),
              (this.idleActionFrequency = 60 * ini.getNumber("IdleActionFrequency")),
              (this.impactLandSound = ini.getString("ImpactLandSound") || void 0),
              (this.impactWaterSound = ini.getString("ImpactWaterSound") || void 0),
              (this.infantryExplode = ini.getString("InfantryExplode")),
              (this.flamingInfantry = ini.getString("FlamingInfantry")),
              (this.infantryHeadPop = ini.getString("InfantryHeadPop")),
              (this.infantryNuked = ini.getString("InfantryNuked")),
              // YR 死亡动画：病毒狙杀（Virus）、基因突变变身特效（Mutate）、
              // 狂兽人（Brute，突变生成单位）。字符串由 Engine.patchAudioVisualRules 保留。
              (this.infantryVirus = ini.getString("InfantryVirus")),
              (this.infantryMutate = ini.getString("InfantryMutate")),
              (this.infantryBrute = ini.getString("InfantryBrute")),
              // 心灵支配者数据（SuperWeapon Type=PsychicDominator）：在
              // DominatorCaptureRange 内心灵控制敌方有机单位，随后引爆
              // DominatorWarhead 造成伤害。动画/充能字符串由 patchAudioVisualRules 保留。
              (this.dominatorWarhead = ini.getString("DominatorWarhead")),
              (this.dominatorDamage = ini.getNumber("DominatorDamage", 0)),
              (this.dominatorCaptureRange = ini.getNumber("DominatorCaptureRange", 0)),
              (this.dominatorFirstAnim = ini.getString("DominatorFirstAnim")),
              (this.dominatorSecondAnim = ini.getString("DominatorSecondAnim")),
              (this.dominatorFireAtPercentage = ini.getNumber("DominatorFireAtPercentage", 100)),
              // 心灵支配者的启用音效（超武发射时播放），经 [AudioVisual]
              // DominatorActivateSound= 配置。
              (this.dominatorActivateSound = ini.getString("PsychicDominatorActivateSound") || void 0),
              // 基因突变器弹头名（原版 YR [AudioVisual]）：[General] MutateExplosion=no
              // 时用 MutateWarhead（3×3 格）；=yes 时用 MutateExplosionWarhead（CellSpread 范围）。
              (this.mutateWarhead = ini.getString("MutateWarhead")),
              (this.mutateExplosionWarhead = ini.getString("MutateExplosionWarhead")),
              // 超时空要塞过载致死与解除心灵控制音效。
              (this.masterMindOverloadDeathSound = ini.getString("MasterMindOverloadDeathSound")),
              (this.mindClearedSound = ini.getString("MindClearedSound")),
              (this.bunkerWallsUpSound = ini.getString("BunkerWallsUpSound") || void 0),
              (this.bunkerWallsDownSound = ini.getString("BunkerWallsDownSound") || void 0),
              (this.ironCurtainInvokeAnim = ini.getString("IronCurtainInvokeAnim")),
              // 力盾启用动画（原版 YR [AudioVisual]）：力盾展开时在启用格播放。
              // 缺省 FORCSHLD。
              (this.forceShieldInvokeAnim = ini.getString("ForceShieldInvokeAnim")),
              // 力盾无敌染色（调色板索引）：原版 YR [AudioVisual]
              // ForceShieldColor=6（蓝/青色调）。
              (this.forceShieldColor = ini.getNumber("ForceShieldColor", 6)),
              // 鲍里斯空袭语音（原版 YR [AudioVisual]）：
              // AirstrikeAttackVoice — "米格机已出动"（米格生成时鲍里斯的台词）；
              // AirstrikeTargetAcquiredSound — "目标锁定"（米格开火时）；
              // AirstrikeDeathSound — "我要坠机了"（被击落）；
              // AirstrikeAbortSound — "任务中止"（空袭被打断/取消）。
              (this.airstrikeAttackVoice = ini.getString("AirstrikeAttackVoice") || void 0),
              (this.airstrikeTargetAcquiredSound = ini.getString("AirstrikeTargetAcquiredSound") || void 0),
              (this.airstrikeDeathSound = ini.getString("AirstrikeDeathSound") || void 0),
              (this.airstrikeAbortSound = ini.getString("AirstrikeAbortSound") || void 0),
              // 碾磨厂音效（Grinding=yes；原版 YR [AudioVisual] EnterGrinderSound=，
              // 例如 GrinderGrinding）：单位被回收碾磨期间播放；同时回落到
              // SpecialAnim 的 Report=。
              (this.enterGrinderSound = ini.getString("EnterGrinderSound") || void 0),
              // 侦察机（Spy Plane）拍照音效与节奏（原版 YR [AudioVisual]）：
              // SpyPlaneCamera 每次拍照播放一次；SpyPlaneCameraFrames 为拍照
              // 期间每隔多少 tick 拍一张。
              (this.spyPlaneCamera = ini.getString("SpyPlaneCamera") || void 0),
              (this.spyPlaneCameraFrames = ini.getNumber("SpyPlaneCameraFrames", 16)),
              (this.messageDuration = ini.getNumber("MessageDuration", 10)),
              (this.metallicDebris = ini.getArray("MetallicDebris")),
              (this.nukeTakeOff = ini.getString("NukeTakeOff")),
              (this.deadBodies = ini.getArray("DeadBodies")),
              (this.wake = ini.getString("Wake")),
              (this.parachute = ini.getString("Parachute")),
              (this.moveFlash = ini.getString("MoveFlash")),
              (this.warpOut = ini.getString("WarpOut")),
              (this.warpAway = ini.getString("WarpAway")),
              (this.weaponNullifyAnim = ini.getString("WeaponNullifyAnim")),
              (this.weatherConClouds = ini.getArray("WeatherConClouds")),
              (this.weatherConBoltExplosion = ini.getString("WeatherConBoltExplosion")),
              (this.weatherConBolts = ini.getArray("WeatherConBolts")));
          }
        }
