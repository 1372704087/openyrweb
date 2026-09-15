#!/usr/bin/env node
/**
 * 一次性脚本：五个规则类 TS 的英文注释块翻译为中文并去除 OpenYRWeb 标志。
 * 翻译表逐块硬编码（内容为逆向工程考据，保留全部技术细节）。
 */
import { readFileSync, writeFileSync } from "node:fs";

const TRANS = {
  "src/game/rules/SuperWeaponRules.ts": [
    [
      `              // OpenYRWeb (2026-07-25): Force Shield and Psychic Dominator use StartSound/SpecialSound
              // for activation/fading cues (vanilla YR [ForceShieldSpecial]).`,
      `              // 力盾与心灵支配者以 StartSound/SpecialSound 作为启用/消退的提示音
              //（对应原版 YR [ForceShieldSpecial] 的约定）。`,
    ],
  ],
  "src/game/rules/CombatDamageRules.ts": [
    [
      `              // OpenYRWeb: CrushWarhead (vanilla YR [CombatDamage] CrushWarhead=, stored at
              // Rules+0xfac in yrmd.exe). The warhead used when a vehicle crushes (drives over
              // OR is dropped onto) another object. Magnetron drop-crush routes through this
              // (verified @ FUN_0054ca90: TakeDamage warhead = Rules+0xfac). Defaults to "Crush"
              // per vanilla rulesmd.ini.`,
      `              // 原版 YR 键 CrushWarhead（yrmd.exe 中存放于 Rules+0xfac）：载具碾压
              //（驶过或被磁电投放砸到）其他对象时使用的弹头。磁电拖拽落地后的
              // 碾压判定也走这里（已在 FUN_0054ca90 处验证：TakeDamage 弹头 =
              // Rules+0xfac）。缺省 "Crush"，与原版 rulesmd.ini 一致。`,
    ],
    [
      `              // OpenYRWeb: Magnetron drop-damage knobs (vanilla YR [CombatDamage] ;***Magnetron***).
              // FallingDamageMultiplier: final impact damage = falling unit's base HP x this (default 1.0).
              // CurrentStrengthDamage: if true (default), base = current HP; else max HP.
              // Used by MagnetronDragTask._applyDrop when a lifted vehicle lands.`,
      `              // 磁电拖拽落地伤害参数（原版 YR [CombatDamage] ;***Magnetron*** 段）：
              // FallingDamageMultiplier = 坠落伤害 = 载具基础血量 × 此系数（缺省 1.0）；
              // CurrentStrengthDamage = true（缺省）按当前血量计，否则按最大血量计；
              // 由 MagnetronDragTask._applyDrop 在被拖载具落地时使用。`,
    ],
    [
      `              // OpenYRWeb: Floating Disc (DISCUS) drain config (vanilla YR, yrmd.exe strings).
              // DrainMoneyAmount: credits siphoned per DrainMoneyFrameDelay ticks from a
              //   refinery/slave-miner the disc is hovering over.
              // DrainMoneyFrameDelay: tick interval between drains.
              // DrainAnimationType: anim played on the drained building (visual only).`,
      `              // 漂浮圆盘（DISCUS）吸取配置（原版 YR）：
              // DrainMoneyAmount = 每隔 DrainMoneyFrameDelay tick 从其悬停的
              //   精炼厂/奴隶矿车吸取的资金数；
              // DrainMoneyFrameDelay = 两次吸取的间隔 tick；
              // DrainAnimationType = 被吸取建筑上播放的动画（纯表现）。`,
    ],
    [
      `              // OpenYRWeb (2026-06-30, REVERSED): Force Shield super-weapon config (vanilla keys
              // in [General], REVERSED from yrmd.exe: ForceShieldDuration @ 0x0083bc4c,
              // ForceShieldRadius @ 0x0083bc60, ForceShieldBlackoutDuration @ 0x0083bc30).
              // ForceShield: when activated, buildings within ForceShieldRadius (cells) of the
              // activation tile gain temporary invulnerability for ForceShieldDuration frames;
              // the activating player's power is blacked out (low-power) for
              // ForceShieldBlackoutDuration frames as the cost. Co-located with IronCurtainDuration.
              // NOTE: ForceShieldRadius value is in CELLS (vanilla YR INI spec "in cells").`,
      `              // 力盾超武配置（原版键位于 [General]；yrmd.exe 地址：
              // ForceShieldDuration @ 0x0083bc4c、ForceShieldRadius @ 0x0083bc60、
              // ForceShieldBlackoutDuration @ 0x0083bc30）。启用后，以启用格为中心
              // ForceShieldRadius（格）范围内的建筑获得 ForceShieldDuration 帧
              // 临时无敌；代价是启用方电力进入低电力状态
              // ForceShieldBlackoutDuration 帧。与 IronCurtainDuration 同段存放。
              // 注意：ForceShieldRadius 单位是格（原版 YR INI 规范 "in cells"）。`,
    ],
    [
      `              // OpenYRWeb: frames before expiry to play the ForceShieldFading sound.
              // Vanilla YR [General] ForceShieldPlayFadeSoundTime=75.`,
      `              // 力盾到期前播放 ForceShieldFading 音效的提前帧数。
              // 原版 YR [General] ForceShieldPlayFadeSoundTime=75。`,
    ],
    [
      `              // OpenYRWeb (2026-06-30, REVERSED): PsychicReveal super-weapon radius (vanilla key
              // in [CombatDamage], REVERSED from yrmd.exe). Yuri's Psychic Reveal mini-superweapon
              // (unlocked by the Psychic Sensor / YAGGNT) permanently reveals a circular area of
              // shroud around the activation tile for the activating player. Default 10 tiles.`,
      `              // 心灵揭示小超武半径（原版键位于 [CombatDamage]）：心灵探测器
              //（YAGGNT）解锁的迷你超武，为启用方永久揭开启用格周围圆形区域
              // 的黑雾。缺省 10 格。`,
    ],
    [
      `              // OpenYRWeb: Mastermind overload tiers (vanilla YR [CombatDamage]).`,
      `              // 超时空要塞过载分级参数（原版 YR [CombatDamage]）。`,
    ],
    [
      `              // OpenYRWeb: mind-control visual feedback (vanilla YR [CombatDamage]).`,
      `              // 心灵控制的表现反馈动画（原版 YR [CombatDamage]）。`,
    ],
  ],
  "src/game/rules/WarheadRules.ts": [
    [
      `              // OpenYRWeb: IsLocomotor=yes marks the Magnetron's LocomotorBeam warhead. Such a
              // warhead does no normal damage — instead it drags the hit vehicle toward the
              // firing unit (handled in Warhead.detonate). Vanilla YR uses this for the
              // Magnetron (YTNK) primary weapon MagneticBeam (Warhead=LocomotorBeam).`,
      `              // IsLocomotor=yes 标记磁电坦克的 LocomotorBeam 弹头：这类弹头不造成
              // 常规伤害，而是把命中载具拖向开火单位（在 Warhead.detonate 中处理）。
              // 原版 YR 用于磁电坦克（YTNK）主武器 MagneticBeam
              //（Warhead=LocomotorBeam）。`,
    ],
    [
      `              // OpenYRWeb: vanilla YR uses "Psychedelic" as the INI key for the chaos/berserk
              // effect (Chaos Drone gas). We read both "Psychedelic" (vanilla) and "PsychicDamage"
              // (legacy fallback) for compatibility.`,
      `              // 原版 YR 的混乱/狂乱效果（混乱无人机瓦斯）INI 键为 "Psychedelic"；
              // 同时兼容读取 "PsychicDamage"（旧拼写回退）。`,
    ],
    [
      `              // OpenYRWeb: PenetratesBunker=yes (Warheads, default no) — when a warhead with this
              // flag hits a vehicle inside a Tank Bunker, the damage affects the vehicle directly
              // instead of being absorbed by the bunker. Usually set on aircraft weapons.`,
      `              // PenetratesBunker=yes（弹头键，缺省 no）：带此标志的弹头命中坦克碉堡内
              // 载具时，伤害直接作用于载具而非被碉堡吸收。常见于空军武器。`,
    ],
  ],
  "src/game/rules/WeaponRules.ts": [
    [
      `              // OpenYRWeb (2026-06-30, REVERSED): DrainWeapon=yes marks a weapon that, when it
              // strikes a Drainable=yes building, drains power/money instead of dealing damage
              // (vanilla Floating Disc / DISCUS uses this). REVERSED from yrmd.exe: DrainWeapon is
              // a per-weapon boolean parsed in WeaponTypeClass::ReadINI (@ 0x00849470).`,
      `              // DrainWeapon=yes：命中 Drainable=yes 建筑时吸取电力/资金而非造成伤害
              //（漂浮圆盘 DISCUS 使用）。经 yrmd.exe 逆向确认：DrainWeapon 是
              // WeaponTypeClass::ReadINI（@ 0x00849470）解析的逐武器布尔键。`,
    ],
    [
      `              // OpenYRWeb: FireWhileMoving (vanilla YR weapon flag). When=no, the unit must be
              // fully stationary to fire this weapon (vanilla: DiskDrain on the Floating Disc).
              // Default=yes — most weapons can fire while moving.`,
      `              // FireWhileMoving（原版 YR 武器键）：no 时单位必须完全静止才能开火
              //（原版：漂浮圆盘的 DiskDrain）。缺省 yes——多数武器可移动开火。`,
    ],
    [
      `              // OpenYRWeb: IsMagBeam=yes marks a weapon that should render the magnetic tractor
              // beam visual. The actual drag logic additionally requires the weapon's warhead to
              // have IsLocomotor=yes. This lets rulesmd.ini keep IsMagBeam=yes on MagneShake for`,
      `              // IsMagBeam=yes：标记该武器渲染磁电牵引束特效。实际拖拽逻辑还要求
              // 武器弹头带 IsLocomotor=yes。这让 rulesmd.ini 可以继续在 MagneShake 上保留`,
    ],
  ],
  "src/game/rules/AudioVisualRules.ts": [
    [
      `              // OpenYRWeb: berserk unit tint color (vanilla YR [AudioVisual] BerserkColor).
              // Applied as a remap tint to units affected by Psychedelic=yes warhead (Chaos Drone gas).
              // Default is a reddish-purple (255,0,255 in vanilla YR). Format: r,g,b (0-255).`,
      `              // 狂乱单位染色（原版 YR [AudioVisual] BerserkColor）：对中了
              // Psychedelic=yes 弹头（混乱无人机瓦斯）的单位施加重映射染色。
              // 缺省为紫红色（原版 255,0,255）。格式 r,g,b（0-255）。`,
    ],
    [
      `              // OpenYRWeb: YR death anims. Virus (sniper), Mutate (Genetic Mutator transform fx),
              // Brute (the unit spawned by Mutate). Strings preserved by Engine.patchAudioVisualRules.`,
      `              // YR 死亡动画：病毒狙杀（Virus）、基因突变变身特效（Mutate）、
              // 狂兽人（Brute，突变生成单位）。字符串由 Engine.patchAudioVisualRules 保留。`,
    ],
    [
      `              // OpenYRWeb: Psychic Dominator data (SuperWeapon=Type=PsychicDominator). The Dominator
              // mind-controls organic enemy units in DominatorCaptureRange then detonates the
              // DominatorWarhead for damage. Anim/charge strings preserved by patchAudioVisualRules.`,
      `              // 心灵支配者数据（SuperWeapon Type=PsychicDominator）：在
              // DominatorCaptureRange 内心灵控制敌方有机单位，随后引爆
              // DominatorWarhead 造成伤害。动画/充能字符串由 patchAudioVisualRules 保留。`,
    ],
    [
      `              // OpenYRWeb: activation sound for the Psychic Dominator (played when the super
              // weapon fires). Configured via [AudioVisual] DominatorActivateSound= in INI.`,
      `              // 心灵支配者的启用音效（超武发射时播放），经 [AudioVisual]
              // DominatorActivateSound= 配置。`,
    ],
    [
      `              // OpenYRWeb: Genetic Mutator warhead names (vanilla YR [AudioVisual]).
              // MutateWarhead is used when [General] MutateExplosion=no (3x3 cell area);
              // MutateExplosionWarhead is used when MutateExplosion=yes (CellSpread area).`,
      `              // 基因突变器弹头名（原版 YR [AudioVisual]）：[General] MutateExplosion=no
              // 时用 MutateWarhead（3×3 格）；=yes 时用 MutateExplosionWarhead（CellSpread 范围）。`,
    ],
    [
      `              // OpenYRWeb: Mastermind overload death + mind-control release sounds.`,
      `              // 超时空要塞过载致死与解除心灵控制音效。`,
    ],
    [
      `              // OpenYRWeb (2026-07-25): Force Shield invoke animation (vanilla YR [AudioVisual]).
              // Played at the activation tile when Force Shield is deployed. Default FORCSHLD.`,
      `              // 力盾启用动画（原版 YR [AudioVisual]）：力盾展开时在启用格播放。
              // 缺省 FORCSHLD。`,
    ],
    [
      `              // OpenYRWeb (2026-07-25): Force Shield invulnerability color (palette index).
              // Vanilla YR [AudioVisual] ForceShieldColor=6 (blue/cyan tint).`,
      `              // 力盾无敌染色（调色板索引）：原版 YR [AudioVisual]
              // ForceShieldColor=6（蓝/青色调）。`,
    ],
    [
      `              // OpenYRWeb: Boris airstrike voice lines (vanilla YR [AudioVisual]).
              // AirstrikeAttackVoice — "MiG's on the way" (when MiGs spawn; Boris's line).
              // AirstrikeTargetAcquiredSound — "Target acquired!" (when a MiG opens fire).
              // AirstrikeDeathSound — "I'm going down!" / "I won't make it!" (shot down).
              // AirstrikeAbortSound — "Mission Aborted" (airstrike interrupted/cancelled).`,
      `              // 鲍里斯空袭语音（原版 YR [AudioVisual]）：
              // AirstrikeAttackVoice — "米格机已出动"（米格生成时鲍里斯的台词）；
              // AirstrikeTargetAcquiredSound — "目标锁定"（米格开火时）；
              // AirstrikeDeathSound — "我要坠机了"（被击落）；
              // AirstrikeAbortSound — "任务中止"（空袭被打断/取消）。`,
    ],
    [
      `              // OpenYRWeb (2026-08-09): Grinder (Grinding=yes) grind sound (vanilla YR
              // [AudioVisual] EnterGrinderSound=, ini.g. GrinderGrinding). Played while a
              // unit is being recycled; also falls back to the SpecialAnim's Report=.`,
      `              // 碾磨厂音效（Grinding=yes；原版 YR [AudioVisual] EnterGrinderSound=，
              // 例如 GrinderGrinding）：单位被回收碾磨期间播放；同时回落到
              // SpecialAnim 的 Report=。`,
    ],
    [
      `              // OpenYRWeb (2026-08-08): Spy Plane camera sound + cadence (vanilla YR
              // [AudioVisual]). SpyPlaneCamera is played each time the plane takes a
              // picture; SpyPlaneCameraFrames is how often (in ticks) it does so while
              // in the process of photographing the target area.`,
      `              // 侦察机（Spy Plane）拍照音效与节奏（原版 YR [AudioVisual]）：
              // SpyPlaneCamera 每次拍照播放一次；SpyPlaneCameraFrames 为拍照
              // 期间每隔多少 tick 拍一张。`,
    ],
  ],
};

  let total = 0;
  let skipped = 0;
  for (const [file, pairs] of Object.entries(TRANS)) {
  // 文件为 CRLF 行尾：先统一为 LF 再匹配，写回时保留 LF（与 prettier 一致）。
  let s = readFileSync(file, "utf8").replace(/\r\n/g, "\n");
  for (const [from, to] of pairs) {
    if (!s.includes(from)) {
      if (s.includes(to)) {
        skipped++; // 已翻译过（上次运行中断时已完成）
        continue;
      }
      console.error("ANCHOR MISS in " + file + ":\n" + from.split("\n")[0]);
      process.exit(1);
    }
    s = s.replace(from, to);
    total++;
  }
  writeFileSync(file, s);
  console.log(file + ": " + pairs.length + " entries (" + (pairs.length - skipped) + " new)");
  }
  console.log("total translated:", total, "| already done:", skipped);
