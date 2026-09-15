/**
 * ProjectileRules — 弹体规则（[Projectiles] 段条目，继承 ObjectRules：弧线弹道/旋转率/对空对地/隐形弹等）。
 *
 * 由 game/rules/ProjectileRules.ts.js 机械重写为 TS（语句原样保留，行为完全一致）。
 * 两个文件并存期间，本文件才是修改目标：tools/repack.mjs 打包时优先
 * 采用 .ts 模块的编译产物。
 */
import * as M0_ObjectRules from "game/rules/ObjectRules";

/* eslint-disable @typescript-eslint/no-explicit-any */

export class ProjectileRules extends M0_ObjectRules.ObjectRules {
  acceleration: any;
  arcing: any;
  courseLockDuration: any;
  detonationAltitude: any;
  firersPalette: any;
  flakScatter: any;
  inaccurate: any;
  inviso: any;
  isAntiAir: any;
  isAntiGround: any;
  level: any;
  rot: any;
  iniRot: any;
  shadow: any;
  shrapnelWeapon: any;
  shrapnelCount: any;
  subjectToCliffs: any;
  subjectToElevation: any;
  subjectToWalls: any;
  vertical: any;

        parse() {
          super.parse();
          var e = this.ini.getNumber("ROT", 0);
          let t = this.ini.getNumber("Acceleration");
          (1 !== e || t || (t = Number.POSITIVE_INFINITY),
            (t = t || 3),
            (this.acceleration = t),
            (this.arcing = this.ini.getBool("Arcing")),
            (this.courseLockDuration = this.ini.getNumber("CourseLockDuration")),
            (this.detonationAltitude = this.ini.getNumber("DetonationAltitude")),
            (this.firersPalette = this.ini.getBool("FirersPalette")),
            (this.flakScatter = this.ini.getBool("FlakScatter")),
            (this.inaccurate = this.ini.getBool("Inaccurate")),
            (this.inviso = this.ini.getBool("Inviso")),
            (this.isAntiAir = this.ini.getBool("AA")),
            (this.isAntiGround = this.ini.getBool("AG", !0)),
            (this.level = this.ini.getBool("Level")),
            (this.rot = M0_ObjectRules.ObjectRules.iniRotToDegsPerTick(e)),
            (this.iniRot = e),
            (this.shadow = this.ini.getBool("Shadow", !0)),
            (this.shrapnelWeapon = this.ini.getString("ShrapnelWeapon") || void 0),
            (this.shrapnelCount = this.ini.getNumber("ShrapnelCount")),
            (this.subjectToCliffs = this.ini.getBool("SubjectToCliffs")),
            (this.subjectToElevation = this.ini.getBool("SubjectToElevation")),
            (this.subjectToWalls = this.ini.getBool("SubjectToWalls")),
            (this.vertical = this.ini.getBool("Vertical")));
        }
      }
