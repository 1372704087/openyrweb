/**
 * TransientAnim — 瞬时动画（Anim 子类，播完自动移除）。
 *
 * 构造时额外注入 container；update 在「尚未开始」且 art.report 存在时
 * 播一次音效，随后调父类 update，动画结束后 remove+dispose。
 *
 * 由 engine/renderable/entity/TransientAnim.ts.js 重写为 TS（行为完全一致）。
 * 两个文件并存期间，本文件才是修改目标：tools/repack.mjs 打包时优先
 * 采用 .ts 模块的编译产物。
 */
import * as AnimModuleNs from "engine/renderable/entity/Anim";

/* eslint-disable @typescript-eslint/no-explicit-any */

// any-shim：Anim 尚未有 .ts 重写时走 engine/* export= 命名空间
const Anim: any = (AnimModuleNs as any).Anim ?? AnimModuleNs;

/**
 * 播完即从容器移除的瞬时动画。
 */
export class TransientAnim extends Anim {
  /** 所属容器（remove 用）。 */
  container: any;

  /**
   * 与 Anim 同参，额外第 10 参为 container。
   * @param name - 动画名
   * @param objectArt - art 规则
   * @param extraOffset - 额外偏移
   * @param imageFinder - 图片查找器
   * @param theater - 剧场
   * @param camera - 相机
   * @param debugFrame - 调试帧 Ref
   * @param gameSpeed - 游戏速度
   * @param useSpriteBatching - 是否精灵批处理
   * @param container - 容器
   * @param worldSound - 世界音效
   */
  constructor(
    name: any,
    objectArt: any,
    extraOffset: any,
    imageFinder: any,
    theater: any,
    camera: any,
    debugFrame: any,
    gameSpeed: any,
    useSpriteBatching: any,
    container: any,
    worldSound?: any,
  ) {
    super(
      name,
      objectArt,
      extraOffset,
      imageFinder,
      theater,
      camera,
      debugFrame,
      gameSpeed,
      useSpriteBatching,
      void 0,
      worldSound,
    );
    this.container = container;
  }

  /**
   * 起播音效 + 父类推进 + 结束移除。
   * @param now - 当前时间戳（ms）
   */
  update(now: number): void {
    // 仅在「尚未开始」时尝试 report 音效（worldSound?. 短路与孪生一致；
    // 不额外校验 playEffect 方法存在——孪生缺方法时会抛错暴露绑定问题）
    if (this.isAnimNotStarted()) {
      const report = this.objectArt.report;
      if (report) {
        this.worldSound?.playEffect(report, this.getPosition());
      }
    }
    // 孪生：(!this.isAnimNotStarted() || (report && play…)) 短路后仍执行 super
    // 上面的 if 只在 isAnimNotStarted 为真时播音；若为假直接跳到 super
    super.update(now);
    if (this.isAnimFinished()) {
      this.remove();
      this.dispose();
    }
  }

  /** 从容器移除自身。 */
  remove(): void {
    this.container.remove(this);
  }
}
