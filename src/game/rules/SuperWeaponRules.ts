/**
 * SuperWeaponRules — 超级武器规则（[SuperWeaponTypes] 段条目：充能时间/侧栏图/挂接武器）。
 *
 * 由 game/rules/SuperWeaponRules.ts.js 机械重写为 TS（语句原样保留，行为完全一致）。
 * 两个文件并存期间，本文件才是修改目标：tools/repack.mjs 打包时优先
 * 采用 .ts 模块的编译产物。
 */
import * as M0_SuperWeaponType from "game/type/SuperWeaponType";

/* eslint-disable @typescript-eslint/no-explicit-any */

export class SuperWeaponRules {
  index: any;
  disableableFromShell: any;
  isPowered: any;
  name: any;
  preClick: any;
  preDependent: any;
  postClick: any;
  rechargeTime: any;
  showTimer: any;
  sidebarImage: any;
  type: any;
  uiName: any;
  weaponType: any;
  startSound: any;
  specialSound: any;

          constructor(e) {
            this.index = e;
          }
          readIni(ini) {
            return (
              (this.disableableFromShell = ini.getBool("DisableableFromShell")),
              (this.isPowered = ini.getBool("IsPowered", !0)),
              (this.name = ini.name),
              (this.preClick = ini.getBool("PreClick")),
              (this.preDependent = ini.getEnum("PreDependent", M0_SuperWeaponType.SuperWeaponType, void 0)),
              (this.postClick = ini.getBool("PostClick")),
              (this.rechargeTime = ini.getNumber("RechargeTime", 5)),
              (this.showTimer = ini.getBool("ShowTimer")),
              (this.sidebarImage = ini.getString("SidebarImage").toLowerCase()),
              (this.type = ini.getEnum("Type", M0_SuperWeaponType.SuperWeaponType, void 0)),
              (this.uiName = ini.getString("UIName")),
              (this.weaponType = ini.getString("WeaponType") || void 0),
              // 力盾与心灵支配者以 StartSound/SpecialSound 作为启用/消退的提示音
              //（对应原版 YR [ForceShieldSpecial] 的约定）。
              (this.startSound = ini.getString("StartSound") || void 0),
              (this.specialSound = ini.getString("SpecialSound") || void 0),
              this
            );
          }
        }
