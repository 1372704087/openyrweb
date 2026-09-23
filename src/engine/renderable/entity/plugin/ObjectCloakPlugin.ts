/**
 * ObjectCloakPlugin — 隐形可见性（本地共享情报可透视时保持显示）。
 *
 * cloaked 且无共享情报时隐藏 3D 对象；状态或透视变化时同步 visible。
 *
 * 由 engine/renderable/entity/plugin/ObjectCloakPlugin.ts.js 重写为 TS（行为完全一致）。
 * 两个文件并存期间，本文件才是修改目标：tools/repack.mjs 打包时优先采用 .ts 模块的编译产物。
 */
/* eslint-disable @typescript-eslint/no-explicit-any */

/** 隐形渲染插件。 */
export class ObjectCloakPlugin {
  /** 所属对象。 */
  gameObject: any;
  /** 本地玩家 Ref。 */
  localPlayer: any;
  /** 联盟/情报。 */
  alliances: any;
  /** 渲染对象。 */
  renderable: any;
  /** 上帧是否可透视。 */
  lastCanSeeThroughCloak = false;
  /** 上帧是否隐形。 */
  lastCloaked?: boolean;

  /**
   * @param gameObject - 对象
   * @param localPlayer - 本地玩家 Ref
   * @param alliances - alliances
   * @param renderable - 渲染对象
   */
  constructor(gameObject: any, localPlayer: any, alliances: any, renderable: any) {
    this.gameObject = gameObject;
    this.localPlayer = localPlayer;
    this.alliances = alliances;
    this.renderable = renderable;
    this.lastCanSeeThroughCloak = false;
  }

  /** 无初始化。 */
  onCreate(): void {}

  /** 每帧：同步隐形/透视可见性。 */
  update(_tick?: number): void {
    const cloaked = !!this.gameObject.cloakableTrait?.isCloaked() && !this.gameObject.isDestroyed;
    const cloakedChanged = cloaked !== this.lastCloaked;
    const seeThrough =
      cloaked &&
      (!this.localPlayer.value ||
        this.alliances.haveSharedIntel(this.localPlayer.value, this.gameObject.owner));
    const seeChanged = seeThrough !== this.lastCanSeeThroughCloak;
    if (cloakedChanged || seeChanged) {
      this.lastCloaked = cloaked;
      this.lastCanSeeThroughCloak = seeThrough;
      this.renderable.get3DObject().visible = !cloaked || seeThrough;
    }
  }

  /** 无移除逻辑。 */
  onRemove(): void {}

  /** 无资源。 */
  dispose(): void {}
}
