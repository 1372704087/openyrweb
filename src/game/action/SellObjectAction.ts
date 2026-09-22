/**
 * SellObjectAction — 变卖己方已部署对象。
 *
 * 序列化载荷：objectId(u32)。process 仅在对象存在、为己方 techno、
 * 已部署，且（建筑：Ready 且未被超时空拉出 / 单位：所在 dock 规则
 * 允许 unitSell）时调用 sellTrait.sell。
 *
 * 由 game/action/SellObjectAction.ts.js 重写为 TS（行为完全一致）。
 * 两个文件并存期间，本文件才是修改目标：tools/repack.mjs 打包时
 * 优先采用 .ts 模块的编译产物。
 */
import * as DataStreamModule from "data/DataStream"; // 未转换（any-shim）
import * as ActionTypeModule from "game/action/ActionType"; // 已转换
import * as ActionModule from "game/action/Action"; // 已转换
import { BuildStatus } from "game/gameobject/Building"; // 已转换
import { DockableTrait } from "game/gameobject/trait/DockableTrait"; // 已转换
export class SellObjectAction extends ActionModule.Action {
  // 字段一律不带初始化器：孪生构造函数按固定顺序赋值。
  game: any;
  /** 处理时由 Action 队列外部注入（孪生基类无此字段声明）。 */
  player: any;
  objectId: any;

  constructor(game: any) {
    super(ActionTypeModule.ActionType.SellObject);
    this.game = game;
  }

  unserialize(data: any): void {
    this.objectId = new DataStreamModule.DataStream(data).readUint32();
  }

  serialize(): any {
    return new DataStreamModule.DataStream(4)
      .writeUint32(this.objectId)
      .toUint8Array();
  }

  print(): string {
    return "Sell object " + this.objectId;
  }

  process(): void {
    const player = this.player;
    if (!this.game.getWorld().hasObjectId(this.objectId)) return;
    const obj = this.game.getObjectById(this.objectId);
    if (
      obj.isTechno() &&
      player === obj.owner &&
      obj.isSpawned &&
      (obj.isBuilding()
        ? obj.buildStatus === BuildStatus.Ready &&
          !obj.warpedOutTrait.isActive()
        : obj.traits.find(DockableTrait)?.dock?.rules.unitSell)
    ) {
      this.game.sellTrait.sell(obj);
    }
  }
}
