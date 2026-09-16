/**
 * DockableTrait — 可停靠单位（记录 dock/reservedDock 引用，换主/传送时解除）。
 *
 * 由 game/gameobject/trait/DockableTrait.ts.js 重写为 TS（行为完全一致）。
 * 本文件为修改目标：tools/repack.mjs 打包时优先采用 .ts 模块的编译产物。
 */
import * as NotifyUnspawnModule from "game/gameobject/trait/interface/NotifyUnspawn"; // 已转换
import * as NotifyOwnerChangeModule from "game/gameobject/trait/interface/NotifyOwnerChange"; // 已转换
import * as NotifyTeleportModule from "game/gameobject/trait/interface/NotifyTeleport"; // 未转换（any-shim）

/* eslint-disable @typescript-eslint/no-explicit-any */
export class DockableTrait {
  dock: any;
  reservedDock: any;

  [NotifyUnspawnModule.NotifyUnspawn.onUnspawn](obj: any) {
    this.undock(obj);
    this.reservedDock?.dockTrait.unreserveDockForUnit(obj);
  }
  [NotifyOwnerChangeModule.NotifyOwnerChange.onChange](obj: any) {
    if (obj.owner !== this.dock?.owner) this.undock(obj);
    if (obj.owner !== this.reservedDock?.owner) this.reservedDock?.dockTrait.unreserveDockForUnit(obj);
  }
  [NotifyTeleportModule.NotifyTeleport.onBeforeTeleport](obj: any, _dest: any, _source: any, keepDock: any) {
    if (!keepDock) {
      this.undock(obj);
      this.reservedDock?.dockTrait.unreserveDockForUnit(obj);
    }
  }
  undock(obj: any) {
    if (this.dock && !this.dock.isDisposed) this.dock.dockTrait.undockUnit(obj);
  }
  dispose() {
    this.dock = void 0;
    this.reservedDock = void 0;
  }
}
