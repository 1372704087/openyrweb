/**
 * HarvesterPlugin — 采矿车 OREGATH 采集动画（方向切片循环）。
 *
 * status 变为 Harvesting 时创建 transient Anim；按 Facings 与 SHP 帧数
 * 决定全帧循环或按朝向切片；传送时清理。
 *
 * 由 engine/renderable/entity/plugin/HarvesterPlugin.ts.js 重写为 TS（行为完全一致）。
 * 两个文件并存期间，本文件才是修改目标：tools/repack.mjs 打包时优先采用 .ts 模块的编译产物。
 */
import { HarvesterStatus } from "game/gameobject/trait/HarvesterTrait"; // 已转换
import { Coords } from "game/Coords"; // 已转换

/* eslint-disable @typescript-eslint/no-explicit-any */

/** 采矿动画插件。 */
export class HarvesterPlugin {
  /** 所属矿车。 */
  gameObject: any;
  /** 采矿 trait。 */
  harvesterTrait: any;
  /** 渲染管理器。 */
  renderableManager?: any;
  /** 上帧 status。 */
  lastHarvesterStatus?: number;
  /** 采集 Anim。 */
  harvestAnim?: any;

  /**
   * @param gameObject - 矿车
   * @param harvesterTrait - HarvesterTrait
   */
  constructor(gameObject: any, harvesterTrait: any) {
    this.gameObject = gameObject;
    this.harvesterTrait = harvesterTrait;
  }

  /** 注入渲染管理器。 */
  onCreate(renderableManager: any): void {
    this.renderableManager = renderableManager;
  }

  /** 每帧：status 驱动采集动画。 */
  update(_tick?: number): void {
    if (this.gameObject.warpedOutTrait.isActive()) {
      this.disposeHarvAnim();
      this.lastHarvesterStatus = void 0;
      return;
    }
    if (!this.renderableManager) return;
    const status = this.harvesterTrait.status;
    if (status === this.lastHarvesterStatus) return;
    this.lastHarvesterStatus = status;
    this.disposeHarvAnim();
    if (status !== HarvesterStatus.Harvesting) return;
    this.harvestAnim = this.renderableManager.createTransientAnim("OREGATH", (e: any) => {
      const tile = this.gameObject.tile;
      e.setPosition(Coords.tile3dToWorld(tile.rx + 0.5, tile.ry + 0.5, tile.z));
      e.create3DObject();
      const props = e.getAnimProps();
      if (!props) return;
      const shpFile = e.getShpFile();
      if (!shpFile) return;
      // Read Facings from animation art config; ObjectArt defaults to 8.
      // If the SHP has fewer frames than the declared facings (e.g. OREGATH
      // is a non-directional ground spark with Facings=8 default but only a
      // few SHP frames), treat as non-directional and play all frames.
      const facings = Math.max(1, e.objectArt?.facings ?? 1);
      const numImages = shpFile.numImages;
      if (facings <= 1 || numImages < facings) {
        // Non-directional: loop the entire SHP from frame 0
        props.loopStart = props.start = 0;
        props.loopEnd = numImages - 1;
      } else {
        // Directional: pick the slice matching the unit's facing
        const framesPerDir = Math.floor(numImages / facings);
        const dir = (this.gameObject.direction - 45 + 360) % 360;
        const dirIndex = Math.round((dir / 360) * facings) % facings;
        props.loopStart = props.start = dirIndex * framesPerDir;
        props.loopEnd = props.start + framesPerDir - 1;
      }
      props.loopCount = -1;
    });
  }

  /** 清理采集动画。 */
  disposeHarvAnim(): void {
    this.harvestAnim?.remove();
    this.harvestAnim?.dispose();
    this.harvestAnim = void 0;
  }

  /** 移除时清理。 */
  onRemove(): void {
    this.disposeHarvAnim();
  }

  /** dispose 动画。 */
  dispose(): void {
    this.disposeHarvAnim();
  }
}
