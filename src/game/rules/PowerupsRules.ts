/**
 * PowerupsRules — 箱子掉落表规则（Powerups 段：类型,概率,动画,数据 逐行解析；未支持类型告警跳过）。
 *
 * 由 game/rules/PowerupsRules.ts.js 机械重写为 TS（语句原样保留，行为完全一致）。
 * 两个文件并存期间，本文件才是修改目标：tools/repack.mjs 打包时优先
 * 采用 .ts 模块的编译产物。
 */
import * as M0_CrateGeneratorTrait from "game/trait/CrateGeneratorTrait";
import * as M1_PowerupType from "game/type/PowerupType";

/* eslint-disable @typescript-eslint/no-explicit-any */

export class PowerupsRules {
  powerups: any;

            constructor() {
              this.powerups = [];
            }
            readIni(ini) {
              for (var [s, a] of ini.entries) {
                let [ini, t, i, r] = a.split(",");
                var n = Number(ini),
                  a = M1_PowerupType.PowerupType[s];
                void 0 !== a
                  ? M0_CrateGeneratorTrait.UNSUPPORTED_POWERUP_TYPES.includes(a) ||
                    this.powerups.push({
                      type: a,
                      probShares: n,
                      animName: "<none>" !== t.toLowerCase() ? t : void 0,
                      waterAllowed: "yes" === i,
                      data: r,
                    })
                  : console.warn(`Unknown powerup "${s}". Skipping.`);
              }
              return this;
            }
          }
