/**
 * SellTrait — 出售对象 trait（挂在世界侧）。
 *
 * sell(obj)：不可出售建筑跳过；计算退款（Soylent 优先，否则
 * purchaseValue×refundPercent，AI 全额，墙始终 0）；广播 NotifySell；
 * 建筑经 ConstructionWorker.unplace 卸下，单位直接 unspawn；
 * 之后返还 credits、派发 ObjectSellEvent 并 dispose。
 *
 * 由 game/trait/SellTrait.ts.js 重写为 TS（行为完全一致）。
 * 两个文件并存期间，本文件才是修改目标：tools/repack.mjs 打包时
 * 优先采用 .ts 模块的编译产物。
 */
import { ObjectSellEvent } from "game/event/ObjectSellEvent"; // 未转换（any-shim）
import * as NotifySellModule from "game/gameobject/trait/interface/NotifySell"; // 已转换

/* eslint-disable @typescript-eslint/no-explicit-any */
export class SellTrait {
  /** 世界/游戏上下文。 */
  game: any;
  /** General 规则（refundPercent 等）。 */
  generalRules: any;

  constructor(game: any, generalRules: any) {
    this.game = game;
    this.generalRules = generalRules;
  }

  /** 出售对象：退款 + NotifySell + 卸下/unspawn + 事件 + dispose。 */
  sell(obj: any): void {
    if (!obj.isBuilding() || !obj.rules.unsellable) {
      let refund = this.computeRefundValue(obj);
      if (refund) {
        // 墙不可退款（原版：退款恒 0）。
        if (obj.rules.wall) refund = 0;
        obj.traits.filter(NotifySellModule.NotifySell).forEach((trait: any) => {
          trait[NotifySellModule.NotifySell.onSell](obj, this.game);
        });
        if (obj.isBuilding()) {
          this.game.getConstructionWorker(obj.owner).unplace(obj, () => this.afterObjectUnspawned(obj, refund));
        } else {
          this.game.unspawnObject(obj);
          this.afterObjectUnspawned(obj, refund);
        }
      }
    }
  }

  /** 出售后：入账、派发事件、释放对象。 */
  afterObjectUnspawned(obj: any, refund: number): void {
    obj.owner.credits += refund;
    this.game.events.dispatch(new ObjectSellEvent(obj));
    obj.dispose();
  }

  /** 退款额：Soylent 优先，否则 purchaseValue×refundPercent（AI 全额）。 */
  computeRefundValue(obj: any): number {
    let value = 0;
    if (0 < obj.rules.soylent) {
      value = obj.rules.soylent;
    } else if (obj.rules.cost) {
      value = obj.purchaseValue;
      if (!obj.owner.isAi) value = Math.floor(value * this.generalRules.refundPercent);
    }
    return value;
  }

  /** 购买价（与孪生一致：直接取 cost）。 */
  computePurchaseValue(rules: any, _obj?: any): number {
    return rules.cost;
  }

  /** 释放 game 引用。 */
  dispose(): void {
    this.game = void 0;
  }
}
