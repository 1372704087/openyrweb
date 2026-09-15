#!/usr/bin/env node
/** 第二轮：剩余英文注释块翻译（含 OpenYRWeb 标志去除）。CRLF 安全 + 已译跳过。 */
import { readFileSync, writeFileSync } from "node:fs";

const TRANS = {
  "src/game/rules/WeaponRules.ts": [
    [
      `              // other purposes without it accidentally drawing the tractor beam.`,
      `              // 其他用途的同时不误触牵引束特效。`,
    ],
    [
      `              // OpenYRWeb (2026-07-06): MagnaBeam parameters for dedicated Magnetron beam rendering.
              // These control the visual appearance of the magnetic tractor beam: colour, alpha,
              // width, wave distortion, pulse/flicker, glow halo, and blending mode.
              // Parsed from weapon INI section (e.g. [MagneticBeam]) to replace the old hardcoded
              // RadBeamFx visual. Defaults match vanilla YR purple-beam appearance.
              // Vanilla YR wave blending (Ares reverse-engineered):
              //   result = c + color * x + c * intensity * x
              //   where c = background pixel, x = wave value along path (0..1)
              // Defaults for Magnetron: Wave.Color=0,0,0, Wave.Intensity=128,0,1024`,
      `              // 磁电牵引束专用渲染参数（2026-07-06 逆向）：控制牵引束的
              // 颜色、透明度、宽度、波形畸变、脉冲/闪烁、光晕与混合模式。
              // 从武器 INI 段（如 [MagneticBeam]）解析，取代旧的硬编码
              // RadBeamFx 表现。缺省值与原版 YR 紫束外观一致。
              // 原版 YR 波形混合公式（Ares 逆向）：
              //   result = c + color * x + c * intensity * x
              //   其中 c = 背景像素，x = 路径上的波形值（0..1）
              // 磁电坦克缺省：Wave.Color=0,0,0，Wave.Intensity=128,0,1024`,
    ],
    [
      `              // Wave direction: vanilla YR defaults IsMagBeam weapons to reverse against vehicles
              // (wave drawn from target→firer). Other wave types default to no reversal.`,
      `              // 波形方向：原版 YR 中 IsMagBeam 武器对载具默认反向绘制
              //（波形从目标→开火者）；其余波形类型默认不反向。`,
    ],
    [
      `              // Vanilla YR: beam color is hardcoded #B000D0 (176,0,208). MagnaBeamColor
              // has no effect in vanilla (ModEnc confirms). We use it as default here.`,
      `              // 原版 YR：束颜色硬编码 #B000D0 (176,0,208)，MagnaBeamColor 在原版中
              // 无效（ModEnc 确认）。本引擎将其用作缺省值。`,
    ],
    [
      `              // Vanilla YR: single-layer flat 2D wave, no glow halo. Default 0 = no halo.`,
      `              // 原版 YR：单层平面 2D 波形、无光晕。缺省 0 = 无光晕。`,
    ],
    [
      `              // OpenYRWeb: DiskLaser=yes enables the Floating Disc ring-laser charge effect.
              // Draws a circle of radius 240 leptons centred at the FLH position, with two
              // arcs charging CW+CCW from the opposite point toward the point nearest the
              // target. When charge completes, a beam fires from the nearest point to target.
              // Vanilla sources: WeaponTypeClass::ReadINI in yrmd.exe, ModEnc DiskLaser page.`,
      `              // DiskLaser=yes：启用漂浮圆盘的环形激光充能特效。以 FLH 位置为圆心
              // 画半径 240 lepton 的圆，两段弧从对面点顺/逆时针充能至最靠近目标的
              // 点；充能完成后从最近点向目标发射激光。出处：yrmd.exe
              // WeaponTypeClass::ReadINI、ModEnc DiskLaser 页。`,
    ],
    [
      `              // OpenYRWeb: Phobos extension. Customisable ring radius in leptons.
              // Default 240 matches vanilla YR hardcoded radius.`,
      `              // Phobos 扩展键：环半径可自定义（lepton）。缺省 240 与原版 YR
              // 硬编码半径一致。`,
    ],
    [
      `              // DiskLaser inner beam colour. Vanilla default (216,0,184) — magenta.`,
      `              // 环激光内束颜色。原版缺省 (216,0,184) —— 品红。`,
    ],
    [
      `              // DiskLaser outer glow colour. Vanilla default (80,0,88) — dark magenta.`,
      `              // 环激光外晕颜色。原版缺省 (80,0,88) —— 暗品红。`,
    ],
    [
      `              // LaserOuterSpread controls how far the outer glow spreads beyond the inner beam.
              // Triple value (R,G,B). Vanilla default (0,0,0) = no outer glow.`,
      `              // LaserOuterSpread 控制外晕超出内束的扩散程度。
              // 三元组 (R,G,B)。原版缺省 (0,0,0) = 无外晕。`,
    ],
    [
      `              // OpenYRWeb: InfiniteMindControl=yes marks a mind-control weapon that has no hard
              // capacity cap — the controller can acquire unlimited targets, but takes escalating
              // overload self-damage when exceeding its safe capacity (weapon Damage). Vanilla YR
              // Mastermind (MIND) uses this behavior; Yuri Clone / Yuri X do not.`,
      `              // InfiniteMindControl=yes：无硬容量上限的心灵控制武器——控制方可无限
              // 获取目标，但超出安全容量（武器 Damage）后受到递增的过载自伤。
              // 原版 YR 中超时空要塞（MIND）有此行为，尤里复制人/X 没有。`,
    ],
    [
      `              // OpenYRWeb: MigAttackCursor=yes marks Boris's Flare weapon. When this weapon
              // targets a building, the cursor changes to AirStrike and an AirstrikeAttackTask
              // is created instead of a normal AttackTask. Vanilla YR uses this flag on Boris's
              // secondary weapon to trigger MiG airstrike calls.`,
      `              // MigAttackCursor=yes：标记鲍里斯的照明弹武器。该武器指向建筑时光标
              // 变为空袭，并创建 AirstrikeAttackTask 而非普通攻击任务。原版 YR 在
              // 鲍里斯副武器上用此标志触发米格空袭呼叫。`,
    ],
  ],
  "src/game/rules/WarheadRules.ts": [
    [
      `              // OpenYRWeb: Airstrike=yes marks the warhead used by Boris's Flare weapon
              // (AirstrikeFlare). When this warhead hits a building, it triggers the MiG
              // airstrike sequence instead of dealing normal damage. Vanilla YR uses this
              // flag on Boris's secondary weapon (Flare → Warhead=AirstrikeFlare).`,
      `              // Airstrike=yes：标记鲍里斯照明弹武器（AirstrikeFlare）使用的弹头。
              // 该弹头命中建筑时触发米格空袭序列而非常规伤害。原版 YR 在鲍里斯
              // 副武器（Flare → Warhead=AirstrikeFlare）上使用此标志。`,
    ],
    [
      `              // 载具时，伤害直接作用于载具而非被碉堡吸收。常见于空军武器。
              // See ModEnc/PenetratesBunker.`,
      `              // 载具时，伤害直接作用于载具而非被碉堡吸收。参见 ModEnc/PenetratesBunker。`,
    ],
  ],
  "src/game/rules/CombatDamageRules.ts": [
    [
      `              // OpenYRWeb: berserk fire-rate multiplier (vanilla YR [CombatDamage] BerserkROFMultiplier).
              // When a unit is berserk (hit by Psychedelic=yes warhead), its ROF is multiplied by this value.
              // Default 0.5 = 2x fire rate (fires twice as fast). Ares docs confirm default 0.5.`,
      `              // 狂乱射速倍率（原版 YR [CombatDamage] BerserkROFMultiplier）：单位被
              // Psychedelic=yes 弹头击中进入狂乱后，射速乘以此值。缺省 0.5 =
              // 双倍射速。Ares 文档确认缺省 0.5。`,
    ],
    [
      `              // OpenYRWeb: Tank Bunker weapon bonus multipliers (vanilla YR [CombatDamage]).
              // BunkerDamageMultiplier: global multiplier to weapon Damage when fired from inside a Tank Bunker.
              // BunkerROFMultiplier: global multiplier to weapon ROF (rate of fire) when inside a Tank Bunker.
              // BunkerWeaponRangeBonus: bonus tiles added to weapon Range when inside a Tank Bunker.`,
      `              // 坦克碉堡武器加成倍率（原版 YR [CombatDamage]）：
              // BunkerDamageMultiplier = 碉堡内开火时武器伤害的全局倍率；
              // BunkerROFMultiplier = 碉堡内射速的全局倍率；
              // BunkerWeaponRangeBonus = 碉堡内射程附加格数。`,
    ],
    [
      `              // OpenYRWeb: Battle Fortress OpenTopped passenger firing bonuses (vanilla YR [CombatDamage]).
              // OpenToppedRangeBonus: bonus tiles added to each passenger's weapon Range when
              //   firing from an OpenTopped=yes transport (ini.g. Battle Fortress, default 2).
              // OpenToppedDamageMultiplier: global multiplier to passenger weapon Damage (default 1.2 = +20%).
              // OpenToppedWarpDistance: if an OpenTopped transport moves this many tiles away from
              //   a Chrono Legionnaire's phased target, the temporal link breaks (default 7).`,
      `              // 战斗要塞敞开运输乘员开火加成（原版 YR [CombatDamage]）：
              // OpenToppedRangeBonus = 乘员从敞开运输车（如战斗要塞，缺省 2 格）
              //   开火时的射程附加格数；
              // OpenToppedDamageMultiplier = 乘员武器伤害的全局倍率（缺省 1.2 = +20%）；
              // OpenToppedWarpDistance = 敞开运输车远离超时空军团兵相位目标至此
              //   格数时断开时间链接（缺省 7）。`,
    ],
    [
      `              // OpenYRWeb: garrisoned-infantry firing bonuses (vanilla YR [CombatDamage]).
              // OccupyWeaponRange: overrides the Range of any weapon fired by an infantry with
              //   Occupier=yes while occupying a building (default 5). A fixed value is needed
              //   because two different occupants may have different weapon ranges — the short
              //   range guy would otherwise make the building stop shooting.
              // OccupyDamageMultiplier: multiplier to weapon Damage while occupying (default 1.2).
              // OccupyROFMultiplier: multiplier to weapon ROF while occupying (default 1.2, larger=faster).`,
      `              // 驻楼步兵开火加成（原版 YR [CombatDamage]）：
              // OccupyWeaponRange = Occupier=yes 步兵驻楼时所有武器射程的覆盖值
              //   （缺省 5）。需要固定值：不同驻员射程不同，否则短射程者会让
              //   建筑停火；
              // OccupyDamageMultiplier = 驻楼期间武器伤害倍率（缺省 1.2）；
              // OccupyROFMultiplier = 驻楼期间射速倍率（缺省 1.2，越大越快）。`,
    ],
  ],
};

let total = 0;
let skipped = 0;
for (const [file, pairs] of Object.entries(TRANS)) {
  const s0 = readFileSync(file, "utf8").replace(/\r\n/g, "\n");
  let s = s0;
  for (const [from, to] of pairs) {
    if (!s.includes(from)) {
      if (s.includes(to)) {
        skipped++;
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
