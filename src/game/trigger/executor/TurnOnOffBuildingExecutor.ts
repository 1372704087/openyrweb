/**
 * TurnOnOffBuildingExecutor — 开启/关闭建筑电源动作。
 *
 * 动作 61/62: TurnOffBuilding / TurnOnBuilding — 对标签目标中的建筑
 * 切换 poweredTrait 开关。
 *
 * 由 game/trigger/executor/TurnOnOffBuildingExecutor.ts.js 重写为 TS
 * （行为完全一致）。两个文件并存期间，本文件才是修改目标：
 * tools/repack.mjs 打包时优先采用 .ts 模块的编译产物。
 *
 * 构造第三参 turnOn：true=开启，false=关闭（工厂注入）。
 * execute 第二参为标签目标集合（与孪生签名一致）。
 */
import { GameObject } from "game/gameobject/GameObject"; // 未转换（any-shim）
import { TriggerExecutor } from "game/trigger/TriggerExecutor"; // 未转换（any-shim）

/* eslint-disable @typescript-eslint/no-explicit-any */
export class TurnOnOffBuildingExecutor extends TriggerExecutor {
  /** 是否开启（true=TurnOn，false=TurnOff）。 */
  turnOn: boolean;

  constructor(action: any, trigger: any, turnOn: boolean) {
    super(action, trigger);
    this.turnOn = turnOn;
  }

  /**
   * 执行：对 targets 中的建筑设置电源开关。
   *
   * @param _world 世界上下文（孪生未使用）。
   * @param targets 标签目标对象列表。
   */
  execute(_world: any, targets: any[]): void {
    for (const obj of targets)
      if (obj instanceof (GameObject as any) && obj.isBuilding())
        obj.poweredTrait?.setTurnedOn(this.turnOn);
  }
}
