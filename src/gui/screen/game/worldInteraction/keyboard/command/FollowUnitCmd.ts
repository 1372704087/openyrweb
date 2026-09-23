/**
 * FollowUnitCmd — 跟随首个选中单位（暂停平移并持续对准）。
 *
 * 由 gui/screen/game/worldInteraction/keyboard/command/FollowUnitCmd.ts.js
 * 重写为 TS（行为完全一致）。
 *
 * 两个文件并存期间，本文件才是修改目标：tools/repack.mjs 打包时优先采用 .ts 模块的编译产物。
 */
import { CompositeDisposable } from "util/disposable/CompositeDisposable"; // 已转换

/* eslint-disable @typescript-eslint/no-explicit-any */

/** 跟随单位命令。 */
export class FollowUnitCmd {
  /** 单位选择处理器。 */
  unitSelectionHandler: any;
  /** 渲染件管理器。 */
  renderableManager: any;
  /** 世界交互。 */
  worldInteraction: any;
  /** 地图平移辅助。 */
  mapPanningHelper: any;
  /** 镜头平移。 */
  cameraPan: any;
  /** 世界场景。 */
  worldScene: any;
  /** 订阅释放容器。 */
  disposables = new CompositeDisposable();
  /** 当前跟随目标。 */
  unit: any;
  /** 选择变化回调。 */
  handleUserSelectionChange: () => void;
  /** 帧回调（镜头更新前）。 */
  handleFrame: () => void;

  /**
   * @param unitSelectionHandler 选择处理器
   * @param renderableManager 渲染件管理
   * @param worldInteraction 世界交互
   * @param mapPanningHelper 平移辅助
   * @param cameraPan 镜头平移
   * @param worldScene 世界场景
   */
  constructor(
    unitSelectionHandler: any,
    renderableManager: any,
    worldInteraction: any,
    mapPanningHelper: any,
    cameraPan: any,
    worldScene: any,
  ) {
    this.unitSelectionHandler = unitSelectionHandler;
    this.renderableManager = renderableManager;
    this.worldInteraction = worldInteraction;
    this.mapPanningHelper = mapPanningHelper;
    this.cameraPan = cameraPan;
    this.worldScene = worldScene;
    this.disposables = new CompositeDisposable();
    this.handleUserSelectionChange = () => {
      this.updateUnit(void 0);
    };
    this.handleFrame = () => {
      const selected = this.unitSelectionHandler.getSelectedUnits();
      if (this.unit && !selected.includes(this.unit)) {
        this.updateUnit(void 0);
      }
      if (this.unit) this.updatePan(this.unit);
    };
  }

  /** 订阅选择变化与镜头更新前帧。 */
  init(): void {
    this.unitSelectionHandler.onUserSelectionUpdate.subscribe(this.handleUserSelectionChange);
    this.disposables.add(() =>
      this.unitSelectionHandler.onUserSelectionUpdate.unsubscribe(this.handleUserSelectionChange),
    );
    this.worldScene.onBeforeCameraUpdate.subscribe(this.handleFrame);
    this.disposables.add(() => this.worldScene.onBeforeCameraUpdate.unsubscribe(this.handleFrame));
  }

  /** 切换/清除跟随并立即对准。 */
  execute(): void {
    const selected = this.unitSelectionHandler.getSelectedUnits();
    if (this.unit && !selected.includes(this.unit)) {
      this.updateUnit(void 0);
    }
    this.updateUnit(this.unit ? void 0 : selected[0]);
    if (this.unit) this.updatePan(this.unit);
  }

  /**
   * 设置跟随目标；有目标则暂停平移，否则恢复。
   * @param unit 新目标（可空）
   */
  updateUnit(unit: any): void {
    this.unit = unit;
    if (unit) {
      this.worldInteraction.pausePanning();
    } else {
      this.worldInteraction.unpausePanning();
    }
  }

  /**
   * 将镜头对准单位渲染件位置。
   * @param unit 目标单位
   */
  updatePan(unit: any): void {
    const renderable = this.renderableManager.getRenderableByGameObject(unit);
    if (renderable) {
      const pan = this.mapPanningHelper.computeCameraPanFromWorld(renderable.getPosition());
      this.cameraPan.setPan(pan);
    }
  }

  /** 释放订阅并恢复可能被暂停的平移由调用方处理；此处只 dispose。 */
  dispose(): void {
    this.disposables.dispose();
  }
}
