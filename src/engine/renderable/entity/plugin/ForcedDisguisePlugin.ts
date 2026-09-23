/**
 * ForcedDisguisePlugin — 强制伪装（本地可透视时还原、敌方显示伪装外观）。
 *
 * 每帧按 localPlayer 是否拥有该对象切换 setDisguise；getUiNameOverride
 * 在不可透视时返回伪装 rules.uiName。
 *
 * 由 engine/renderable/entity/plugin/ForcedDisguisePlugin.ts.js 重写为 TS（行为完全一致）。
 * 两个文件并存期间，本文件才是修改目标：tools/repack.mjs 打包时优先采用 .ts 模块的编译产物。
 */
/* eslint-disable @typescript-eslint/no-explicit-any */

/** 强制伪装插件。 */
export class ForcedDisguisePlugin {
  /** 所属对象。 */
  gameObject: any;
  /** 伪装 art。 */
  disguiseArt: any;
  /** 本地玩家 Ref。 */
  localPlayer: any;
  /** 可 setDisguise 的渲染对象。 */
  renderable: any;
  /** 当前本地是否可透视伪装。 */
  canSeeThroughDisguise?: boolean;

  /**
   * @param gameObject - 对象
   * @param disguiseArt - 伪装 art
   * @param localPlayer - 本地玩家 Ref
   * @param renderable - 渲染对象
   */
  constructor(gameObject: any, disguiseArt: any, localPlayer: any, renderable: any) {
    this.gameObject = gameObject;
    this.disguiseArt = disguiseArt;
    this.localPlayer = localPlayer;
    this.renderable = renderable;
  }

  /** 无初始化。 */
  onCreate(): void {}

  /** 每帧：同步本地透视与 setDisguise。 */
  update(_tick?: number): void {
    if (this.gameObject.isDestroyed || this.gameObject.warpedOutTrait.isActive()) return;
    const prev = this.canSeeThroughDisguise;
    this.canSeeThroughDisguise = this.localPlayer.value === this.gameObject.owner;
    if (this.canSeeThroughDisguise !== prev) {
      if (this.canSeeThroughDisguise) this.renderable.setDisguise(void 0);
      else {
        this.renderable.setDisguise({
          objectArt: this.disguiseArt,
          owner: this.gameObject.owner,
        });
      }
    }
  }

  /** 无移除逻辑。 */
  onRemove(): void {}

  /** 不可透视时用伪装 UI 名。 */
  getUiNameOverride(): string | undefined {
    if (!this.canSeeThroughDisguise) return this.disguiseArt.rules.uiName;
  }

  /** 无资源。 */
  dispose(): void {}
}
