/**
 * MindControllableTrait — 可被精神控制 trait。
 *
 * 挂在可被 Mind Controller 控制的单位上：
 *  - controlBy：记录 controller + prevOwner 并把单位换主到控制者阵营；
 *    已有控制者时静默 no-op（原版 CaptureMindControlled=no；早期版本
 *    在此 throw 会拖垮 tick 驱动，现与原版一致且防崩溃）；
 *  - restore：把单位还给 prevOwner（原主已败北则还给平民玩家），
 *    并置 _mindCleared 让 SoundHandler 播放 MindClearedSound；
 *  - onUnspawn：离场时通知控制者清理目标引用；若仍存活且有 limboData
 *    则自动 restore（如被装入运输载具后卸下）。
 *
 * 由 game/gameobject/trait/MindControllableTrait.ts.js 重写为 TS（行为完全一致）。
 * 两个文件并存期间，本文件才是修改目标：tools/repack.mjs 打包时优先
 * 采用 .ts 模块的编译产物。
 */
import * as NotifyUnspawnModule from "game/gameobject/trait/interface/NotifyUnspawn"; // 已转换

export class MindControllableTrait {
  /** 宿主单位引用（dispose 后置 undefined）。 */
  gameObject: any;
  /** 当前控制者单位；undefined=未被控制。 */
  controller?: any;
  /** 被控制前的原归属玩家。 */
  prevOwner?: any;

  constructor(gameObject: any) {
    this.gameObject = gameObject;
  }

  /** 被控制前的原归属玩家。 */
  getOriginalOwner() {
    return this.prevOwner;
  }

  /** 是否正被精神控制。 */
  isActive(): boolean {
    return !!this.controller;
  }

  /** 当前控制者。 */
  getController() {
    return this.controller;
  }

  /**
   * 接受控制：记录 controller/prevOwner 并换主到控制者阵营。
   * 已有控制者时静默返回（防二次控制与 tick 驱动崩溃）。
   */
  controlBy(controller: any, world: any): void {
    if (this.controller) return;
    this.controller = controller;
    this.prevOwner = this.gameObject.owner;
    world.changeObjectOwner(this.gameObject, controller.owner);
  }

  /** 解除控制：还给原主（原主已败北则给平民玩家），清 controller/prevOwner。 */
  restore(world: any): void {
    if (this.prevOwner) {
      let owner = this.prevOwner;
      // 置标志供 SoundHandler 在归还时播放 MindClearedSound。
      this.gameObject._mindCleared = true;
      if (this.prevOwner.defeated) owner = world.getCivilianPlayer();
      world.changeObjectOwner(this.gameObject, owner);
      this.prevOwner = undefined;
      this.controller = undefined;
    }
  }

  /** 离场：通知控制者清理目标；若仍存活且有 limboData 则 restore。 */
  [NotifyUnspawnModule.NotifyUnspawn.onUnspawn](object: any, world: any): void {
    if (this.controller) {
      this.controller.mindControllerTrait.cleanTarget(object);
      if (!object.isDestroyed && object.limboData) this.restore(world);
    }
  }

  /** 释放宿主引用。 */
  dispose(): void {
    this.gameObject = undefined;
  }
}
