/**
 * MindControlLinkPlugin — 心灵控制连线（控制器→目标 / 被控→控制器选中回连）。
 *
 * 每帧刷新 MindControlLinkFx 端点；可见条件：控制器选中、目标选中、
 * 或初次控制闪光（_mindControlAttackLineEnd）。
 *
 * 由 engine/renderable/entity/plugin/MindControlLinkPlugin.ts.js 重写为 TS（行为完全一致）。
 * 两个文件并存期间，本文件才是修改目标：tools/repack.mjs 打包时优先采用 .ts 模块的编译产物。
 */
import * as MindControlLinkFxModule from "engine/renderable/fx/MindControlLinkFx"; // 孪生
import { Coords } from "game/Coords"; // 已转换

// 孪生 any-shim：未转换模块的具名导出不可用，取命名空间成员
const MindControlLinkFx: any = (MindControlLinkFxModule as any).MindControlLinkFx;

/* eslint-disable @typescript-eslint/no-explicit-any */

/** 心灵控制连线插件。 */
export class MindControlLinkPlugin {
  /** 源对象（控制器或被控单位）。 */
  source: any;
  /** 选择模型。 */
  selectionModel: any;
  /** 联盟/情报。 */
  alliances: any;
  /** 观察者 Ref。 */
  viewer: any;
  /** 相机。 */
  camera: any;
  /** 目标/key → FX。 */
  links: Map<any, any>;
  /** 渲染管理器。 */
  renderableManager?: any;

  /**
   * @param source - 源对象
   * @param selectionModel - selectionModel
   * @param alliances - alliances
   * @param viewer - viewer Ref
   * @param camera - 相机
   */
  constructor(source: any, selectionModel: any, alliances: any, viewer: any, camera: any) {
    this.source = source;
    this.selectionModel = selectionModel;
    this.alliances = alliances;
    this.viewer = viewer;
    this.camera = camera;
    this.links = new Map();
  }

  /** 注入渲染管理器。 */
  onCreate(renderableManager: any): void {
    this.renderableManager = renderableManager;
  }

  /**
   * 每帧：按控制器/被控分支更新连线。
   * @param tick - tick
   */
  update(tick: number): void {
    if (this.source.isDestroyed || this.source.isCrashing) {
      this.disposeLinks();
      return;
    }
    // CONTROLLER case — show lines from controller to each target.
    if (this.source.mindControllerTrait) this._updateControllerLinks(tick);
    // CONTROLLED case — show line from controlled unit back to controller.
    else if (this.source.mindControllableTrait?.isActive()) this._updateControlledLink(tick);
    else this.disposeLinks();
  }

  /**
   * 控制器：为每个仍受控目标维护连线。
   * @param tick - tick
   */
  private _updateControllerLinks(tick: number): void {
    const targets: any[] = this.source.mindControllerTrait.getTargets();
    // Remove links for targets no longer controlled.
    for (const [obj, fx] of this.links.entries()) {
      if (!targets.includes(obj)) {
        fx.removeAndDispose();
        this.links.delete(obj);
      }
    }
    // Build visibility flags.
    const controllerSelected =
      this.selectionModel.isSelected() &&
      (!this.viewer.value || this.alliances.haveSharedIntel(this.source.owner, this.viewer.value));
    const color = new (THREE as any).Color(this.source.owner.color.asHex());
    // Use worldPosition directly — MindControlLinkFx adds an arc height internally.
    const srcPos = this.source.position.worldPosition.clone();
    for (const target of targets) {
      const flashActive = target._mindControlAttackLineEnd && target._mindControlAttackLineEnd > tick;
      const targetSelected =
        this.selectionModel.isSelected(target) &&
        (!this.viewer.value || this.alliances.haveSharedIntel(target.owner, this.viewer.value));
      const visible = controllerSelected || flashActive || targetSelected;
      if (!visible) {
        // Remove the link when it should not be visible.
        const existing = this.links.get(target);
        if (existing) {
          existing.removeAndDispose();
          this.links.delete(target);
        }
        continue;
      }
      // Use worldPosition directly — MindControlLinkFx adds an arc height internally.
      const dstPos = target.position.worldPosition.clone();
      // controlled-unit endpoint at head height using art-defined height.
      dstPos.y += Coords.tileHeightToWorld(target.art.height);
      let fx = this.links.get(target);
      if (fx) {
        fx.updateEndpoints(srcPos, dstPos);
      } else {
        fx = new MindControlLinkFx(srcPos, dstPos, color, 2, this.camera);
        this.links.set(target, fx);
        this.renderableManager?.addEffect(fx);
      }
    }
  }

  /**
   * 被控单位：向控制器回连（选中时可见）。
   * @param tick - tick
   */
  private _updateControlledLink(tick: number): void {
    const controller = this.source.mindControllableTrait.getController();
    if (!controller || controller.isDestroyed || controller.isCrashing) {
      this.disposeLinks();
      return;
    }
    const isSelected =
      this.selectionModel.isSelected() &&
      (!this.viewer.value || this.alliances.haveSharedIntel(this.source.owner, this.viewer.value));
    const controllerSelected =
      this.selectionModel.isSelected(controller) &&
      (!this.viewer.value || this.alliances.haveSharedIntel(controller.owner, this.viewer.value));
    const visible = isSelected || controllerSelected;
    if (!visible) {
      this.disposeLinks();
      return;
    }
    const color = new (THREE as any).Color(controller.owner.color.asHex());
    const srcPos = this.source.position.worldPosition.clone();
    const dstPos = controller.position.worldPosition.clone();
    // controlled-unit endpoint at head height using art-defined height.
    srcPos.y += Coords.tileHeightToWorld(this.source.art.height);
    // Use a single entry keyed by the controller's unique ID.
    const key = controller;
    let fx = this.links.get(key);
    if (fx) {
      fx.updateEndpoints(srcPos, dstPos);
    } else {
      fx = new MindControlLinkFx(srcPos, dstPos, color, 2, this.camera);
      this.links.set(key, fx);
      this.renderableManager?.addEffect(fx);
    }
    void tick;
  }

  /** 移除时清理。 */
  onRemove(): void {
    this.renderableManager = void 0;
    this.disposeLinks();
  }

  /** dispose 全部连线。 */
  dispose(): void {
    this.disposeLinks();
  }

  /** 清空并 dispose links。 */
  disposeLinks(): void {
    this.links.forEach((fx) => fx.removeAndDispose());
    this.links.clear();
  }
}
