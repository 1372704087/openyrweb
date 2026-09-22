/**
 * ToggleAllianceAction — 与另一玩家结盟/解盟。
 *
 * 序列化：toPlayer 编号(u8) + toggle(u8 0/1)。process 仅在
 * mpDialogSettings 允许盟友与改盟时执行：Formed 且 toggle=false 则
 * 破盟；Requested 且为对方向己方请求且 toggle=true 则接受（并清理
 * 双方剩余唯一敌人的悬空请求），toggle=false 则撤回己方请求；无盟约
 * 且 toggle=true 且可结盟则发起请求。
 *
 * 由 game/action/ToggleAllianceAction.ts.js 重写为 TS（行为完全一致）。
 * 两个文件并存期间，本文件才是修改目标：tools/repack.mjs 打包时
 * 优先采用 .ts 模块的编译产物。
 */
import { AllianceStatus } from "game/Alliances"; // 已转换
import * as ActionModule from "game/action/Action"; // 已转换
import * as AllianceChangeEventModule from "game/event/AllianceChangeEvent"; // 未转换（any-shim）
import * as ActionTypeModule from "game/action/ActionType"; // 已转换
import * as NotifyAllianceChangeModule from "game/trait/interface/NotifyAllianceChange"; // 未转换（any-shim）
export class ToggleAllianceAction extends ActionModule.Action {
  // 字段一律不带初始化器：孪生构造函数按固定顺序赋值。
  game: any;
  /** 处理时由 Action 队列外部注入（孪生基类无此字段声明）。 */
  player: any;
  toPlayer: any;
  toggle: any;

  constructor(game: any) {
    super(ActionTypeModule.ActionType.ToggleAlliance);
    this.game = game;
  }

  unserialize(data: any): void {
    this.toPlayer = this.game.getPlayer(data[0]);
    this.toggle = Boolean(data[1]);
  }

  serialize(): any {
    return new Uint8Array([
      this.game.getPlayerNumber(this.toPlayer),
      this.toggle ? 1 : 0,
    ]);
  }

  print(): string {
    return (
      `Toggle alliance ${this.toggle ? "on" : "off"} with ` + this.toPlayer.name
    );
  }

  process(): void {
    const dialogSettings = this.game.rules.mpDialogSettings;
    if (!dialogSettings.alliesAllowed || !dialogSettings.allyChangeAllowed)
      return;

    const fromPlayer = this.player;
    const toPlayer = this.toPlayer;
    const toggle = this.toggle;
    const alliances = this.game.alliances;

    if (fromPlayer.defeated || !alliances.canRequestAlliance(toPlayer)) return;

    const alliance = alliances.findByPlayers(fromPlayer, toPlayer);
    if (alliance) {
      if (alliance.status === AllianceStatus.Formed) {
        if (!toggle) {
          alliances.breakAlliance(fromPlayer, toPlayer);
          this.game.onAllianceChange(alliance, fromPlayer, false);
        }
      } else if (alliance.status === AllianceStatus.Requested) {
        if (alliance.players.first === toPlayer) {
          // 对方向己方发起的请求：toggle=true 时接受。
          if (toggle && alliances.canFormAlliance(fromPlayer, toPlayer)) {
            alliances.acceptRequest(toPlayer, fromPlayer);
            this.game.onAllianceChange(alliance, fromPlayer, true);
            // 接受后若某方只剩唯一共同敌人以外的悬空请求，取消之。
            const fromOthers = this.game
              .getCombatants()
              .filter(
                (p: any) =>
                  p !== fromPlayer && !alliances.areAllied(fromPlayer, p),
              );
            if (fromOthers.length === 1) {
              const other = alliances.findByPlayers(fromOthers[0], fromPlayer);
              if (other)
                alliances.cancelRequest(
                  other.players.first,
                  other.players.second,
                );
            }
            const toOthers = this.game
              .getCombatants()
              .filter(
                (p: any) => p !== toPlayer && !alliances.areAllied(toPlayer, p),
              );
            if (toOthers.length === 1) {
              const other = alliances.findByPlayers(toOthers[0], toPlayer);
              if (other)
                alliances.cancelRequest(
                  other.players.first,
                  other.players.second,
                );
            }
          }
        } else if (!toggle) {
          // 己方发出的请求：toggle=false 时撤回。
          alliances.cancelRequest(fromPlayer, toPlayer);
          this.game.events.dispatch(
            new AllianceChangeEventModule.AllianceChangeEvent(
              alliance,
              AllianceChangeEventModule.AllianceEventType.Broken,
              fromPlayer,
            ),
          );
          this.game.traits
            .filter(NotifyAllianceChangeModule.NotifyAllianceChange)
            .forEach((trait: any) => {
              trait[NotifyAllianceChangeModule.NotifyAllianceChange.onChange](
                alliance,
                false,
                this.game,
              );
            });
        }
      }
    } else if (toggle && alliances.canFormAlliance(fromPlayer, toPlayer)) {
      const request = alliances.request(fromPlayer, toPlayer);
      if (request) {
        this.game.events.dispatch(
          new AllianceChangeEventModule.AllianceChangeEvent(
            request,
            AllianceChangeEventModule.AllianceEventType.Requested,
            fromPlayer,
          ),
        );
      }
    }
  }
}
