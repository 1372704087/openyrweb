/**
 * ToggleRepairAction — 切换建筑自动维修开关。
 *
 * 序列化载荷：buildingId(u32)。process 仅在对象为己方、未摧毁、
 * repairable + clickRepairable 且生命未满的建筑时，翻转
 * AutoRepairTrait.disabled；从关到开时派发 BuildingRepairStartEvent。
 *
 * 由 game/action/ToggleRepairAction.ts.js 重写为 TS（行为完全一致）。
 * 两个文件并存期间，本文件才是修改目标：tools/repack.mjs 打包时
 * 优先采用 .ts 模块的编译产物。
 */
import * as DataStreamModule from "data/DataStream"; // 未转换（any-shim）
import * as ActionModule from "game/action/Action"; // 已转换
import * as AutoRepairTraitModule from "game/gameobject/trait/AutoRepairTrait"; // 未转换（any-shim）
import * as ActionTypeModule from "game/action/ActionType"; // 已转换
import * as BuildingRepairStartEventModule from "game/event/BuildingRepairStartEvent"; // 未转换（any-shim）
export class ToggleRepairAction extends ActionModule.Action {
  // 字段一律不带初始化器：孪生构造函数按固定顺序赋值。
  game: any;
  /** 处理时由 Action 队列外部注入（孪生基类无此字段声明）。 */
  player: any;
  buildingId: any;

  constructor(game: any) {
    super(ActionTypeModule.ActionType.ToggleRepair);
    this.game = game;
  }

  unserialize(data: any): void {
    this.buildingId = new DataStreamModule.DataStream(data).readUint32();
  }

  serialize(): any {
    return new DataStreamModule.DataStream(4)
      .writeUint32(this.buildingId)
      .toUint8Array();
  }

  print(): string {
    return "Toggle repair " + this.buildingId;
  }

  process(): void {
    const player = this.player;
    if (!this.game.getWorld().hasObjectId(this.buildingId)) return;
    const building = this.game.getObjectById(this.buildingId);
    if (
      building.isBuilding() &&
      player === building.owner &&
      !building.isDestroyed &&
      building.rules.repairable &&
      building.rules.clickRepairable &&
      building.healthTrait.health !== 100
    ) {
      const repairTrait = building.traits.get(
        AutoRepairTraitModule.AutoRepairTrait,
      );
      repairTrait.setDisabled(!repairTrait.isDisabled());
      if (!repairTrait.isDisabled())
        this.game.events.dispatch(
          new BuildingRepairStartEventModule.BuildingRepairStartEvent(building),
        );
    }
  }
}
