/**
 * RadiationRules — 辐射规则（辐射场的时长/等级/光效颜色/辐射弹头）。
 *
 * 由 game/rules/RadiationRules.ts.js 机械重写为 TS（语句原样保留，行为完全一致）。
 * 两个文件并存期间，本文件才是修改目标：tools/repack.mjs 打包时优先
 * 采用 .ts 模块的编译产物。
 */


/* eslint-disable @typescript-eslint/no-explicit-any */

export class RadiationRules {
  radDurationMultiple: any;
  radApplicationDelay: any;
  radLevelMax: any;
  radLevelDelay: any;
  radLightDelay: any;
  radLevelFactor: any;
  radLightFactor: any;
  radTintFactor: any;
  radColor: any;
  radSiteWarhead: any;

          readIni(ini) {
            ((this.radDurationMultiple = ini.getNumber("RadDurationMultiple")),
              (this.radApplicationDelay = ini.getNumber("RadApplicationDelay")),
              (this.radLevelMax = ini.getNumber("RadLevelMax")),
              (this.radLevelDelay = ini.getNumber("RadLevelDelay")),
              (this.radLightDelay = ini.getNumber("RadLightDelay")),
              (this.radLevelFactor = ini.getNumber("RadLevelFactor")),
              (this.radLightFactor = ini.getNumber("RadLightFactor")),
              (this.radTintFactor = ini.getNumber("RadTintFactor")),
              (this.radColor = ini.getNumberArray("RadColor")),
              (this.radSiteWarhead = ini.getString("RadSiteWarhead")));
          }
        }
