/**
 * OrderActionContext — 下达指令时的共享选择上下文（按玩家缓存 UnitSelectionLite）。
 *
 * SelectUnits / OrderUnits 动作共用一份上下文：getOrCreateSelection(player)
 * 懒创建并缓存该玩家的轻量选择集，保证同一局内选择状态连续。
 *
 * 由 game/action/OrderActionContext.ts.js 重写为 TS（行为完全一致）。
 * 两个文件并存期间，本文件才是修改目标：tools/repack.mjs 打包时优先
 * 采用 .ts 模块的编译产物。
 */
import * as UnitSelectionLiteModule from "game/gameobject/selection/UnitSelectionLite"; // 未转换（any-shim）
export class OrderActionContext {
  // 字段一律不带初始化器：孪生构造函数按固定顺序赋值。
  unitSelectionByPlayer: Map<any, any>;

  constructor() {
    this.unitSelectionByPlayer = new Map();
  }

  /** 取玩家对应的选择集，不存在则创建并缓存。 */
  getOrCreateSelection(player: any): any {
    let selection = this.unitSelectionByPlayer.get(player);
    if (!selection) {
      selection = new UnitSelectionLiteModule.UnitSelectionLite(player);
      this.unitSelectionByPlayer.set(player, selection);
    }
    return selection;
  }
}
