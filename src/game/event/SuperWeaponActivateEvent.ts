/**
 * SuperWeaponActivateEvent — 超级武器激活事件。
 *
 * 由 game/event/SuperWeaponActivateEvent.ts.js 重写为 TS（行为完全一致）。
 * 两个文件并存期间，本文件才是修改目标：tools/repack.mjs 打包时优先
 * 采用 .ts 模块的编译产物。
 */
import { EventType } from "game/event/EventType";

export class SuperWeaponActivateEvent {
  /** 超级武器所属目标（建筑/单位）。 */
  readonly target: any;
  /** 超级武器所属玩家。 */
  readonly owner: any;
  /** 主目标格子坐标。 */
  readonly atTile: any;
  /** 副目标格子坐标（双格/范围武器用）。 */
  readonly atTile2: any;
  /** 是否跳过音效警告提示。 */
  readonly noSfxWarning: boolean;
  readonly type: number;

  constructor(target: any, owner: any, atTile: any, atTile2: any, noSfxWarning: boolean) {
    this.target = target;
    this.owner = owner;
    this.atTile = atTile;
    this.atTile2 = atTile2;
    this.noSfxWarning = noSfxWarning;
    this.type = EventType.SuperWeaponActivate;
  }
}
