/**
 * InfantryDisguisePlugin — 步兵伪装渲染（透视/闪烁伪暴露）。
 *
 * 共享情报可透视；透视后按 (tick*speed/1000)%16<=3 闪烁显示伪装；
 * getUiNameOverride 未透视时返回伪装 UI 名。
 *
 * 由 engine/renderable/entity/plugin/InfantryDisguisePlugin.ts.js 重写为 TS（行为完全一致）。
 * 两个文件并存期间，本文件才是修改目标：tools/repack.mjs 打包时优先采用 .ts 模块的编译产物。
 */
import { ObjectType } from "engine/type/ObjectType"; // 已转换

/* eslint-disable @typescript-eslint/no-explicit-any */

/** 步兵伪装插件。 */
export class InfantryDisguisePlugin {
  /** 所属步兵。 */
  gameObject: any;
  /** 伪装 trait。 */
  disguiseTrait: any;
  /** 本地玩家 Ref。 */
  localPlayer: any;
  /** 联盟/情报。 */
  alliances: any;
  /** 渲染对象。 */
  renderable: any;
  /** art。 */
  art: any;
  /** 速度 Ref。 */
  gameSpeed: any;
  /** 本地是否可透视伪装。 */
  canSeeThroughDisguise = false;
  /** 上帧 disguise 对象。 */
  lastDisguise?: any;
  /** 进入伪装的 tick。 */
  disguisedAt?: number;
  /** 上帧实际渲染的 disguise。 */
  lastRenderDisguise?: any;

  /**
   * @param gameObject - 步兵
   * @param disguiseTrait - DisguiseTrait
   * @param localPlayer - 本地玩家 Ref
   * @param alliances - alliances
   * @param renderable - setDisguise 目标
   * @param art - art
   * @param gameSpeed - 速度 Ref
   */
  constructor(
    gameObject: any,
    disguiseTrait: any,
    localPlayer: any,
    alliances: any,
    renderable: any,
    art: any,
    gameSpeed: any,
  ) {
    this.gameObject = gameObject;
    this.disguiseTrait = disguiseTrait;
    this.localPlayer = localPlayer;
    this.alliances = alliances;
    this.renderable = renderable;
    this.art = art;
    this.gameSpeed = gameSpeed;
    this.canSeeThroughDisguise = false;
  }

  /** 无初始化。 */
  onCreate(): void {}

  /** 每帧：更新伪装可见性与闪烁。 */
  update(tick: number): void {
    if (this.gameObject.isDestroyed || this.gameObject.warpedOutTrait.isActive()) return;
    let disguise = this.disguiseTrait.getDisguise();
    if (disguise !== this.lastDisguise) {
      this.lastDisguise = disguise;
      this.disguisedAt = disguise ? tick : void 0;
    }
    const local = this.localPlayer.value;
    if (disguise) {
      this.canSeeThroughDisguise =
        !local ||
        this.alliances.haveSharedIntel(local, this.gameObject.owner) ||
        !!local.sharedDetectDisguiseTrait?.has(this.gameObject);
    }
    if (disguise && this.canSeeThroughDisguise) {
      disguise = local?.sharedDetectDisguiseTrait?.has(this.gameObject)
        ? void 0
        : Math.floor(((tick - this.disguisedAt!) * this.gameSpeed.value) / 1e3) % 16 <= 3
          ? disguise
          : void 0;
    }
    if (this.lastRenderDisguise !== disguise) {
      this.lastRenderDisguise = disguise;
      if (disguise) {
        const objectArt = this.art.getObject(disguise.rules.name, ObjectType.Infantry);
        this.renderable.setDisguise({ objectArt, owner: disguise.owner });
      } else {
        this.renderable.setDisguise(void 0);
      }
    }
  }

  /** 无移除逻辑。 */
  onRemove(): void {}

  /** 未透视时显示伪装 rules.uiName。 */
  getUiNameOverride(): string | undefined {
    const disguise = this.gameObject.disguiseTrait?.getDisguise();
    if (disguise && !this.canSeeThroughDisguise) return disguise.rules.uiName;
  }

  /** 无资源。 */
  dispose(): void {}
}
