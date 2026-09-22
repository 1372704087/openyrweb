/**
 * PlaySpeechExecutor — 播放 EVA 语音。
 *
 * 动作 PlaySpeech：派发 TriggerEvaEvent(params[1]) 由音频系统播放。
 *
 * 由 game/trigger/executor/PlaySpeechExecutor.ts.js 重写为 TS。
 */
import { TriggerEvaEvent } from "game/event/TriggerEvaEvent"; // 孪生
import { TriggerExecutor } from "game/trigger/TriggerExecutor"; // 本组已写

/* eslint-disable @typescript-eslint/no-explicit-any */
export class PlaySpeechExecutor extends TriggerExecutor {
  execute(game: any): void {
    game.events.dispatch(new TriggerEvaEvent(this.action.params[1]));
  }
}
