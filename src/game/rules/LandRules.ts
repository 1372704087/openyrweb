/**
 * LandRules — 地表规则（每种地表的可建造性与各速度类型的通行系数；entries 遍历段内所有键，凡 SpeedType 名都登记）。
 *
 * 由 game/rules/LandRules.ts.js 机械重写为 TS（语句原样保留，行为完全一致）。
 * 两个文件并存期间，本文件才是修改目标：tools/repack.mjs 打包时优先
 * 采用 .ts 模块的编译产物。
 */
import * as M0_SpeedType from "game/type/SpeedType";

/* eslint-disable @typescript-eslint/no-explicit-any */

export class LandRules {
  speedModifiers: any;
  buildable: any;

          constructor() {
            this.speedModifiers = new Map();
          }
          readIni(ini) {
            return (
              (this.buildable = ini.getBool("Buildable", !1)),
              [...ini.entries.keys()].forEach((e) => {
                void 0 !== M0_SpeedType.SpeedType[e] && this.speedModifiers.set(M0_SpeedType.SpeedType[e], ini.getNumber(e));
              }),
              this
            );
          }
          getSpeedModifier(e) {
            if (e === M0_SpeedType.SpeedType.Foot && 0 === this.speedModifiers.get(M0_SpeedType.SpeedType.Track)) return 0;
            let t = this.speedModifiers.get(e);
            return (void 0 === t && (t = 1), e !== M0_SpeedType.SpeedType.Track && e !== M0_SpeedType.SpeedType.Wheel && 0 < t && (t = 1), t);
          }
        }
