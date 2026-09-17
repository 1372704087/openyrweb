/**
 * LocomotorFactory — 移动器工厂：按 LocomotorType 实例化对应移动器。
 *
 * Chrono 特例：矿车（harvesterTrait + teleporter）走 DriveLocomotor
 * 而非 ChronoLocomotor（原版矿车不能超时空移动）。
 *
 * 由 game/gameobject/locomotor/LocomotorFactory.ts.js 重写为 TS（行为
 * 完全一致）。两个文件并存期间，本文件才是修改目标。
 */
import { LocomotorType } from "game/type/LocomotorType"; // 已转换
import * as ChronoLocomotorModule from "game/gameobject/locomotor/ChronoLocomotor"; // 本批转换
import * as DriveLocomotorModule from "game/gameobject/locomotor/DriveLocomotor"; // 未转换（any-shim）
import * as FootLocomotorModule from "game/gameobject/locomotor/FootLocomotor"; // 本批转换
import * as HoverLocomotorModule from "game/gameobject/locomotor/HoverLocomotor"; // 未转换（any-shim）
import * as JumpjetLocomotorModule from "game/gameobject/locomotor/JumpjetLocomotor"; // 未转换（any-shim）
import * as MissileLocomotorModule from "game/gameobject/locomotor/MissileLocomotor"; // 未转换（any-shim）
import * as WingedLocomotorModule from "game/gameobject/locomotor/WingedLocomotor"; // 未转换（any-shim）

/* eslint-disable @typescript-eslint/no-explicit-any */
export class LocomotorFactory {
  game: any;

  constructor(game: any) {
    this.game = game;
  }

  /** 按 gameObject 的 rules.locomotor 实例化对应移动器。 */
  create(gameObject: any): any {
    const type = gameObject.rules.locomotor;
    switch (type) {
      case LocomotorType.Infantry:
        return new FootLocomotorModule.FootLocomotor(this.game);
      case LocomotorType.Jumpjet:
        return new JumpjetLocomotorModule.JumpjetLocomotor(this.game);
      case LocomotorType.Vehicle:
      case LocomotorType.Ship:
        return new DriveLocomotorModule.DriveLocomotor(this.game);
      case LocomotorType.Chrono:
        // 矿车（有 harvesterTrait + teleporter）不能超时空移动，走履带。
        return gameObject.isVehicle() && gameObject.harvesterTrait && gameObject.rules.teleporter
          ? new DriveLocomotorModule.DriveLocomotor(this.game)
          : new ChronoLocomotorModule.ChronoLocomotor(this.game);
      case LocomotorType.Aircraft:
        return new WingedLocomotorModule.WingedLocomotor(this.game);
      case LocomotorType.Missile:
        return new MissileLocomotorModule.MissileLocomotor(this.game, this.game.rules.general.getMissileRules(gameObject.name));
      case LocomotorType.Hover:
        return new HoverLocomotorModule.HoverLocomotor(this.game.rules.general.hover);
      default:
        throw new Error("Unhandled locomotor type " + type);
    }
  }
}
