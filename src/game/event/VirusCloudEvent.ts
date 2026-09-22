/**
 * VirusCloudEvent — 病毒狙击手毒雾生命周期视觉事件。
 *
 * 由 game/event/VirusCloudEvent.ts.js 重写为 TS（行为完全一致）。
 * 两个文件并存期间，本文件才是修改目标：tools/repack.mjs 打包时优先
 * 采用 .ts 模块的编译产物。
 *
 * VirusCloudTrait 在独立气体粒子创建（action="spawn"，主毒雾或其
 * NextParticle 消散雾）与到期移除（action="remove"）时派发；引擎侧
 * VirusCloudFxHandler 消费这些事件，使视觉效果与确定性游戏逻辑保持同步。
 */
import { EventType } from "game/event/EventType"; // 孪生

export class VirusCloudEvent {
  /** 生命周期动作："spawn" 创建粒子，"remove" 到期移除。 */
  readonly action: any;
  /** 毒雾粒子的唯一标识（锁步内用于区分多团雾）。 */
  readonly cloudId: any;
  /** 毒雾所在地块。 */
  readonly tile: any;
  /** 粒子存活时长（游戏 tick）。 */
  readonly lifetimeTicks: number;
  /** 粒子所在的世界精确坐标（仅 spawn 有效）——雾团出现在受害者站立处，
   *  不吸附到地块中心。 */
  readonly position: any;
  /** 从 md 粒子段解析出的逐粒子视觉配置：{ image, translucency, stateAIAdvance }。 */
  readonly visual: any;
  /** 确定性漂移速度（leptons/游戏 tick，锁步、来自游戏 PRNG）。
   *  特效处理器用 (currentTick - spawnTick) * vel 重算雾团位置，
   *  使视觉始终贴合伤害区域。 */
  readonly vel: any;
  readonly type: number;

  constructor(
    action: any,
    cloudId: any,
    tile: any,
    lifetimeTicks: number,
    position: any,
    visual: any,
    vel: any,
  ) {
    this.action = action;
    this.cloudId = cloudId;
    this.tile = tile;
    this.lifetimeTicks = lifetimeTicks;
    this.position = position;
    this.visual = visual;
    this.vel = vel;
    this.type = EventType.VirusCloud;
  }
}
