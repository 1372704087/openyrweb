/**
 * RobotControlPlugin — 机器人坦克瘫痪电火花（周期 SparkFx）。
 *
 * robotControlTrait.isParalyzed() 时按 2000/gameSpeed 间隔在载具位置
 * 生成白色短时电火花。
 *
 * 由 engine/renderable/entity/plugin/RobotControlPlugin.ts.js 重写为 TS（行为完全一致）。
 * 两个文件并存期间，本文件才是修改目标：tools/repack.mjs 打包时优先采用 .ts 模块的编译产物。
 */
import * as SparkFxModule from "engine/renderable/fx/SparkFx"; // 孪生
import { Coords } from "game/Coords"; // 已转换

// 孪生 any-shim：未转换模块的具名导出不可用，取命名空间成员
const SparkFx: any = (SparkFxModule as any).SparkFx;

/* eslint-disable @typescript-eslint/no-explicit-any */

// Electric spark effect for paralyzed Robot Tanks.
// When the RobotControlTrait reports paralyzed (control center offline/destroyed),
// this plugin periodically spawns SparkFx at the vehicle's position to simulate
// electrical short-circuiting. Sparks are white, short-lived (0.4s), and spawn
// every ~0.8 seconds of game time.
/** 机器人瘫痪电火花插件。 */
export class RobotControlPlugin {
  /** 所属载具。 */
  gameObject: any;
  /** 速度 Ref。 */
  gameSpeed: any;
  /** 上次火花毫秒。 */
  lastSparkMillis = 0;
  /** 渲染管理器。 */
  renderableManager?: any;

  /**
   * @param gameObject - 载具
   * @param gameSpeed - 速度 Ref
   */
  constructor(gameObject: any, gameSpeed: any) {
    this.gameObject = gameObject;
    this.gameSpeed = gameSpeed;
    this.lastSparkMillis = 0;
  }

  /** 注入渲染管理器。 */
  onCreate(renderableManager: any): void {
    this.renderableManager = renderableManager;
  }

  /**
   * 每帧：瘫痪时周期性放电火花。
   * @param tick - 毫秒 tick
   */
  update(tick: number): void {
    if (!this.renderableManager) return;
    if (this.gameObject.isDestroyed) return;
    const paralyzed = this.gameObject.robotControlTrait?.isParalyzed();
    if (!paralyzed) return;
    // Spawn sparks every ~2000ms of real time (adjusted by game speed).
    const interval = 2000 / (this.gameSpeed?.value || 1);
    if (tick - this.lastSparkMillis < interval) return;
    this.lastSparkMillis = tick;
    // Spark origin: vehicle position, slightly above ground.
    const pos = this.gameObject.position.worldPosition.clone();
    pos.y += Coords.tileHeightToWorld(0.5);
    const duration = 0.4;
    const fx = new SparkFx(pos, new (THREE as any).Color(1, 1, 1), duration, this.gameSpeed);
    this.renderableManager.addEffect(fx);
  }

  /** 移除时清引用。 */
  onRemove(_renderableManager?: any): void {
    this.renderableManager = void 0;
  }

  /** dispose 清引用。 */
  dispose(): void {
    this.renderableManager = void 0;
  }
}
