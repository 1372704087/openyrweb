/**
 * PackBuildingTask — 建筑打包（收起）任务。
 *
 * 建筑展开/打包切换的动画阶段：将建筑状态切到 BuildDown（收起），
 * 非墙类建筑随后挂 WaitMinutesTask 等待打包动画完成。
 * 由 game/gameobject/task/morph/PackBuildingTask.ts.js 重写为 TS（行为
 * 完全一致）。两个文件并存期间，本文件才是修改目标。
 */
import { Task } from "game/gameobject/task/system/Task";
import { BuildStatus } from "game/gameobject/Building";
import { WaitMinutesTask } from "game/gameobject/task/system/WaitMinutesTask";

/* eslint-disable @typescript-eslint/no-explicit-any */
export class PackBuildingTask extends Task {
  game: any;

  constructor(game: any) {
    super();
    this.game = game;
  }

  onTick(world: any): boolean {
    if (world.buildStatus !== BuildStatus.BuildDown) {
      world.setBuildStatus(BuildStatus.BuildDown, this.game);
      if (!world.rules.wall) {
        this.children.push(new WaitMinutesTask(this.game.rules.general.buildupTime));
        return false;
      }
    }
    return true;
  }
}
