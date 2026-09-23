/**
 * TntFxPlugin — TNT 定时炸弹光标动画（BOMBCURS 进度帧 + 滴答音）。
 *
 * hasCharge/ticksLeft 驱动起始帧与音效；摧毁且 leaveRubble 时清动画停音。
 *
 * 由 engine/renderable/entity/plugin/TntFxPlugin.ts.js 重写为 TS（行为完全一致）。
 * 两个文件并存期间，本文件才是修改目标：tools/repack.mjs 打包时优先采用 .ts 模块的编译产物。
 */
import { ObjectType } from "engine/type/ObjectType"; // 已转换
import { SoundKey } from "engine/sound/SoundKey"; // 已转换

/* eslint-disable @typescript-eslint/no-explicit-any */

/** TNT 光标插件。 */
export class TntFxPlugin {
  /** 所属对象。 */
  gameObject: any;
  /** TNT charge trait。 */
  tntChargeTrait: any;
  /** 每 tick 帧时长。 */
  frameDurationTicks: number;
  /** 渲染对象。 */
  renderable: any;
  /** 图像查找。 */
  imageFinder: any;
  /** art。 */
  art: any;
  /** 联盟。 */
  alliances: any;
  /** 观察者 Ref。 */
  viewer: any;
  /** 世界音效。 */
  worldSound: any;
  /** 动画工厂。 */
  animFactory: any;
  /** 上帧是否有电荷。 */
  lastHasCharge = false;
  /** BOMBCURS 步数。 */
  animStepCount?: number;
  /** 当前光标 Anim。 */
  bombAnim?: any;
  /** 上帧起始帧。 */
  lastStartFrame?: number;
  /** 滴答音句柄。 */
  soundHandle?: any;

  /**
   * @param gameObject - 对象
   * @param tntChargeTrait - TntChargeTrait
   * @param frameDurationTicks - 每 tick 帧时长
   * @param renderable - 渲染对象
   * @param imageFinder - ImageFinder
   * @param art - art
   * @param alliances - alliances
   * @param viewer - viewer Ref
   * @param worldSound - WorldSound
   * @param animFactory - 动画工厂
   */
  constructor(
    gameObject: any,
    tntChargeTrait: any,
    frameDurationTicks: number,
    renderable: any,
    imageFinder: any,
    art: any,
    alliances: any,
    viewer: any,
    worldSound: any,
    animFactory: any,
  ) {
    this.gameObject = gameObject;
    this.tntChargeTrait = tntChargeTrait;
    this.frameDurationTicks = frameDurationTicks;
    this.renderable = renderable;
    this.imageFinder = imageFinder;
    this.art = art;
    this.alliances = alliances;
    this.viewer = viewer;
    this.worldSound = worldSound;
    this.animFactory = animFactory;
    this.lastHasCharge = false;
  }

  /** 预计算 BOMBCURS 步数。 */
  onCreate(): void {
    this.animStepCount = Math.floor(
      this.imageFinder.findByObjectArt(this.art.getObject("BOMBCURS", ObjectType.Animation)).numImages / 2,
    );
  }

  /**
   * 每帧：进度帧与音效同步。
   * @param tick - tick
   */
  update(tick: number): void {
    if (this.gameObject.isDestroyed || this.gameObject.isCrashing) {
      if (this.gameObject.rules.leaveRubble) {
        this.disposeBombAnim();
        this.soundHandle?.stop();
      }
      return;
    }
    const hasCharge = this.tntChargeTrait.hasCharge();
    const chargeChanged = hasCharge !== this.lastHasCharge;
    let startFrame: number;
    if (hasCharge) {
      const progress =
        1 - this.tntChargeTrait.getTicksLeft() / this.tntChargeTrait.getInitialTicks();
      startFrame = Math.floor(2 * progress * (this.animStepCount! - 1));
    } else {
      startFrame = 0;
    }
    const frameChanged = startFrame !== this.lastStartFrame;
    this.bombAnim?.update(tick);
    if (!chargeChanged && !frameChanged) return;
    this.lastHasCharge = hasCharge;
    this.lastStartFrame = startFrame;
    if (hasCharge) {
      if (chargeChanged) {
        this.soundHandle?.stop();
        this.soundHandle = this.worldSound?.playEffect(SoundKey.BombTickingSound, this.gameObject);
      }
      this.disposeBombAnim();
      const chargeOwner = this.gameObject.tntChargeTrait.getChargeOwner();
      if (!this.viewer.value || this.alliances.haveSharedIntel(chargeOwner, this.viewer.value)) {
        const anim = (this.bombAnim = this.animFactory("BOMBCURS"));
        anim.setRenderOrder(999995);
        anim.create3DObject();
        const props = anim.getAnimProps();
        props.loopCount = -1;
        props.start = props.loopStart = startFrame;
        props.end = startFrame + 2 - 1;
        props.loopEnd = props.end;
        props.rate /= this.frameDurationTicks;
        this.renderable.get3DObject()?.add(anim.get3DObject());
      }
    } else {
      this.disposeBombAnim();
      this.soundHandle?.stop();
    }
  }

  /** 从渲染树移除并 dispose 光标动画。 */
  disposeBombAnim(): void {
    if (this.bombAnim?.get3DObject()) {
      this.renderable.get3DObject()?.remove(this.bombAnim.get3DObject());
    }
    this.bombAnim?.dispose();
  }

  /** 移除时清理。 */
  onRemove(): void {
    this.disposeBombAnim();
    this.soundHandle?.stop();
  }

  /** dispose 动画与音效。 */
  dispose(): void {
    this.disposeBombAnim();
    this.soundHandle?.stop();
  }
}
