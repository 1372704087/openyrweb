/**
 * ObjectRulesFactory — 对象规则工厂：按 ObjectType 实例化对应规则类（Techno/Overlay/Terrain/Smudge/Debris/通用）。
 *
 * 由 game/rules/ObjectRulesFactory.ts.js 机械重写为 TS（语句原样保留，行为完全一致）。
 * 两个文件并存期间，本文件才是修改目标：tools/repack.mjs 打包时优先
 * 采用 .ts 模块的编译产物。
 */
import * as M0_ObjectType from "engine/type/ObjectType";
import * as M1_ObjectRules from "game/rules/ObjectRules";
import * as M2_TechnoRules from "game/rules/TechnoRules";
import * as M3_OverlayRules from "game/rules/OverlayRules";
import * as M4_TerrainRules from "game/rules/TerrainRules";
import * as M5_SmudgeRules from "game/rules/SmudgeRules";
import * as M6_DebrisRules from "game/rules/DebrisRules";

/* eslint-disable @typescript-eslint/no-explicit-any */

export class ObjectRulesFactory {
            create(e, t, i, r) {
              switch (e) {
                case M0_ObjectType.ObjectType.Aircraft:
                case M0_ObjectType.ObjectType.Building:
                case M0_ObjectType.ObjectType.Infantry:
                case M0_ObjectType.ObjectType.Vehicle:
                  return new M2_TechnoRules.TechnoRules(e, t, r, i);
                case M0_ObjectType.ObjectType.Overlay:
                  return new M3_OverlayRules.OverlayRules(e, t, r);
                case M0_ObjectType.ObjectType.Terrain:
                  return new M4_TerrainRules.TerrainRules(e, t, r);
                case M0_ObjectType.ObjectType.Smudge:
                  return new M5_SmudgeRules.SmudgeRules(e, t, r);
                case M0_ObjectType.ObjectType.VoxelAnim:
                  return new M6_DebrisRules.DebrisRules(e, t, r);
                default:
                  return new M1_ObjectRules.ObjectRules(e, t, r);
              }
            }
          }
