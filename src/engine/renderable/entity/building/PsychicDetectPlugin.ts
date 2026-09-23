/**
 * PsychicDetectPlugin — 心灵感应探测连线（PsychicDetector）渲染插件。
 *
 * 仅本地玩家拥有检测器时维护 DetectionLineFx 列表：检测线集合变化时增删，
 * 每帧同步端点/颜色；非本地玩家时逐条 dispose（与孪生一致：不 delete 键）。
 *
 * 由 engine/renderable/entity/building/PsychicDetectPlugin.ts.js 重写为 TS（行为完全一致）。
 * 两个文件并存期间，本文件才是修改目标：tools/repack.mjs 打包时优先采用 .ts 模块的编译产物。
 */
import * as DetectionLineFxModule from "engine/renderable/fx/DetectionLineFx"; // 孪生

// 孪生 any-shim：未转换模块的具名导出不可用，取命名空间成员
const DetectionLineFx: any = (DetectionLineFxModule as any).DetectionLineFx;

/* eslint-disable @typescript-eslint/no-explicit-any */

/** 心灵感应探测连线插件。 */
export class PsychicDetectPlugin {
  /** 所属游戏对象（检测器建筑）。 */
  gameObject: any;
  /** 心灵感应检测 trait（detectionLines）。 */
  psychicDetectorTrait: any;
  /** 本地玩家 Ref（.value）。 */
  localPlayer: any;
  /** 相机。 */
  camera: any;
  /** hash → DetectionLineFx。 */
  lineEffects: Map<string, any>;
  /** 渲染管理器（onCreate 注入）。 */
  renderableManager?: any;
  /** 上一帧 detectionLines 数组引用。 */
  lastDetectionLines?: any[];

  /**
   * @param gameObject - 检测器对象
   * @param psychicDetectorTrait - detectionLines 来源
   * @param localPlayer - 本地玩家 Ref
   * @param camera - 相机
   */
  constructor(gameObject: any, psychicDetectorTrait: any, localPlayer: any, camera: any) {
    this.gameObject = gameObject;
    this.psychicDetectorTrait = psychicDetectorTrait;
    this.localPlayer = localPlayer;
    this.camera = camera;
    this.lineEffects = new Map();
  }

  /** 注入渲染管理器。 */
  onCreate(renderableManager: any): void {
    this.renderableManager = renderableManager;
  }

  /** 每帧：同步检测线增删与端点/颜色。 */
  update(_tick?: number): void {
    if (this.localPlayer.value !== this.gameObject.owner) {
      // 孪生 else：只 dispose，不 clear/delete
      this.lineEffects.forEach((fx) => this.disposeLine(fx));
      return;
    }
    const lines: any[] = this.psychicDetectorTrait.detectionLines;
    const changed = lines !== this.lastDetectionLines;
    this.lastDetectionLines = lines;
    const entries = lines.map((line) => ({
      hash: line.source.id + "_" + (line.target.obj?.id ?? line.target.tile.id),
      line,
    }));
    if (changed) {
      for (const hash of [...this.lineEffects.keys()]) {
        if (!entries.find(({ hash: h }) => h === hash)) {
          this.disposeLine(this.lineEffects.get(hash));
          this.lineEffects.delete(hash);
        }
      }
      for (const { line, hash } of entries) {
        if (!this.lineEffects.has(hash)) {
          const srcPos = line.source.position.worldPosition.clone();
          const dstPos = line.target.getWorldCoords().clone();
          const color = new (THREE as any).Color(line.source.owner.color.asHex());
          const fx = new DetectionLineFx(this.camera, srcPos, dstPos, color, 1e6);
          this.lineEffects.set(hash, fx);
          this.renderableManager.addEffect(fx);
        }
      }
    }
    for (const { line, hash } of entries) {
      const fx = this.lineEffects.get(hash);
      if (!fx) throw new Error("Line hash should have been found");
      const c = line.source.position.worldPosition.clone();
      const h = line.target.getWorldCoords().clone();
      const u = new (THREE as any).Color(line.source.owner.color.asHex());
      if (!fx.color.equals(u)) {
        fx.color.copy(u);
        fx.needsUpdate = true;
      }
      if (!fx.sourcePos.equals(c)) {
        fx.sourcePos.copy(c);
        fx.needsUpdate = true;
      }
      if (!fx.targetPos.equals(h)) {
        fx.targetPos.copy(h);
        fx.needsUpdate = true;
      }
    }
  }

  /** 移除时清理。 */
  onRemove(): void {
    this.renderableManager = undefined;
    this.dispose();
  }

  /** dispose 全部连线。 */
  dispose(): void {
    this.lineEffects.forEach((fx) => this.disposeLine(fx));
  }

  /** 移除并 dispose 单条连线。 */
  disposeLine(fx: any): void {
    fx.remove();
    fx.dispose();
  }
}
