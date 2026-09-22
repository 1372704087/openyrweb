/**
 * PlaySoundEffectExecutor — 播放音效（non-localized）。
 *
 * 动作 85: PlaySoundEffect — 播放全局音效（音效名不经本地化）。
 * 与动作 19 (PlaySoundFx) 在引擎内走同一事件通道。
 *
 * 由 game/trigger/executor/PlaySoundEffectExecutor.ts.js 重写为 TS。
 */
import { TriggerSoundFxEvent } from "game/event/TriggerSoundFxEvent"; // 孪生
import { TriggerExecutor } from "game/trigger/TriggerExecutor"; // 本组已写

/* eslint-disable @typescript-eslint/no-explicit-any */
export class PlaySoundEffectExecutor extends TriggerExecutor {
  execute(game: any): void {
    game.events.dispatch(new TriggerSoundFxEvent(this.action.params[1], undefined));
  }
}
