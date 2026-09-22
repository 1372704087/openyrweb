/**
 * ObserveGameAction — 玩家转为观察者。
 *
 * process：先移除该玩家全部资产；若仍是未失败的战斗方且非观察者，
 * 则标记 resigned/defeated/isObserver，派发 Resign/Defeated 事件，
 * 全图揭示迷雾，并在雷达原为关闭时重新打开（派发 RadarOnOffEvent）。
 *
 * 由 game/action/ObserveGameAction.ts.js 重写为 TS（行为完全一致）。
 * 两个文件并存期间，本文件才是修改目标：tools/repack.mjs 打包时
 * 优先采用 .ts 模块的编译产物。
 */
import * as ActionModule from "game/action/Action"; // 已转换
import * as ActionTypeModule from "game/action/ActionType"; // 已转换
import * as RadarOnOffEventModule from "game/event/RadarOnOffEvent"; // 未转换（any-shim）
import * as PlayerResignedEventModule from "game/event/PlayerResignedEvent"; // 未转换（any-shim）
import * as PlayerDefeatedEventModule from "game/event/PlayerDefeatedEvent"; // 未转换（any-shim）
export class ObserveGameAction extends ActionModule.Action {
  // 字段一律不带初始化器：孪生构造函数按固定顺序赋值。
  game: any;
  /** 处理时由 Action 队列外部注入（孪生基类无此字段声明）。 */
  player: any;

  constructor(game: any) {
    super(ActionTypeModule.ActionType.ObserveGame);
    this.game = game;
  }

  process(): void {
    const player = this.player;
    this.game.removeAllPlayerAssets(player);
    if (!player.isCombatant() || player.defeated || player.isObserver) return;
    player.resigned = true;
    player.defeated = true;
    player.isObserver = true;
    this.game.events.dispatch(
      // 孪生只传 target；assetsRedistributed 缺省为 undefined（与 .ts.js 运行时一致）
      new PlayerResignedEventModule.PlayerResignedEvent(player, undefined),
    );
    this.game.events.dispatch(
      new PlayerDefeatedEventModule.PlayerDefeatedEvent(player),
    );
    this.game.mapShroudTrait.getPlayerShroud(player)?.revealAll();
    const radarWasDisabled = player.radarTrait.isDisabled();
    player.radarTrait.setDisabled(false);
    if (radarWasDisabled)
      this.game.events.dispatch(
        new RadarOnOffEventModule.RadarOnOffEvent(player, true),
      );
  }
}
