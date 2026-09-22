/**
 * DropPlayerAction — 掉线玩家处理（仅处理非本地玩家名对应的 player）。
 *
 * process：若目标不是本地玩家且尚未失败，则先再分配资产、再移除全部
 * 资产，标记 dropped 并派发 PlayerDroppedEvent（携带再分配结果）。
 *
 * 由 game/action/DropPlayerAction.ts.js 重写为 TS（行为完全一致）。
 * 两个文件并存期间，本文件才是修改目标：tools/repack.mjs 打包时
 * 优先采用 .ts 模块的编译产物。
 */
import * as ActionTypeModule from "game/action/ActionType"; // 已转换
import * as ActionModule from "game/action/Action"; // 已转换
import * as PlayerDroppedEventModule from "game/event/PlayerDroppedEvent"; // 未转换（any-shim）
export class DropPlayerAction extends ActionModule.Action {
  // 字段一律不带初始化器：孪生构造函数按固定顺序赋值。
  game: any;
  /** 处理时由 Action 队列外部注入（孪生基类无此字段声明）。 */
  player: any;
  localPlayerName: any;

  constructor(game: any, localPlayerName: any) {
    super(ActionTypeModule.ActionType.DropPlayer);
    this.game = game;
    this.localPlayerName = localPlayerName;
  }

  process(): void {
    if (this.localPlayerName === this.player.name) return;
    const player = this.player;
    if (player.defeated) return;
    const redistributed = this.game.redistributeAllPlayerAssets(player);
    this.game.removeAllPlayerAssets(player);
    player.dropped = true;
    this.game.events.dispatch(
      new PlayerDroppedEventModule.PlayerDroppedEvent(player, redistributed),
    );
  }
}
