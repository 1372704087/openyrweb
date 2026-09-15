/**
 * WaitMinutesTask — 以"游戏分钟"为单位等待的任务。
 *
 * 1 游戏分钟 = 60 游戏秒 = BASE_TICKS_PER_SECOND × 60 × minutes tick。
 * 由 game/gameobject/task/system/WaitMinutesTask.ts.js 重写为 TS（行为
 * 完全一致）。两个文件并存期间，本文件才是修改目标。
 */
import { WaitTicksTask } from "game/gameobject/task/system/WaitTicksTask";
import { GameSpeed } from "game/GameSpeed";

/* eslint-disable @typescript-eslint/no-explicit-any */
export class WaitMinutesTask extends WaitTicksTask {
  constructor(minutes: number) {
    super(Math.floor(GameSpeed.BASE_TICKS_PER_SECOND * minutes * 60));
  }
}
