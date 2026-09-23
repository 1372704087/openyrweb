/**
 * TargetLines — 单位目标指示线（攻击橙 / 移动绿 + 端块）。
 *
 * 选择变化时重建全部单位线；否则跟随 src/dest 端点原地改 Geometry
 * 顶点。无配置且非空军则隐藏；showStart 后 1 秒自动 hideAllLines。
 * 空军无配置时用同格双点构造退化线段。
 *
 * 由 engine/renderable/entity/TargetLines.ts.js 重写为 TS（行为完全一致）。
 * 两个文件并存期间，本文件才是修改目标：tools/repack.mjs 打包时优先
 * 采用 .ts 模块的编译产物。
 */
import { Coords } from "game/Coords"; // 已转换
import * as TargetLinesConfigModule from "game/gameobject/task/system/TargetLinesConfig"; // 孪生
import { ZoneType } from "game/gameobject/unit/ZoneType"; // 已转换

/* eslint-disable @typescript-eslint/no-explicit-any */

// 孪生 any-shim：未转换模块的具名导出不可用，取命名空间成员
const cloneConfig: (c: any) => any = (TargetLinesConfigModule as any).cloneConfig;
const configHasTarget: (c: any) => boolean = (TargetLinesConfigModule as any).configHasTarget;
const configsAreEqual: (a: any, b: any) => boolean = (TargetLinesConfigModule as any).configsAreEqual;

/** 单单位线束。 */
interface UnitLineBundle {
  root: any;
  line: any;
  srcLineHead: any;
  destLineHead: any;
}

/**
 * 目标指示线管理器。
 * 惰性创建材质与端块几何；enabled Ref 控制整体可见性。
 */
export class TargetLines {
  /** 当前玩家（可空=全选）。 */
  currentPlayer: any;
  /** 单位选择。 */
  unitSelection: any;
  /** 相机。 */
  camera: any;
  /** 调试全路径 Ref。 */
  debugPaths: any;
  /** 开关 Ref。 */
  enabled: any;
  /** unit → 上次 config 快照。 */
  unitPaths = new Map<any, any>();
  /** unit → 线束。 */
  unitLines = new Map<any, UnitLineBundle>();
  /** 端块几何（类内共享一次）。 */
  lineHeadGeometry: any;

  /** 外层 Object3D。 */
  obj: any;
  /** 攻击线材质。 */
  attackLineMaterial: any;
  /** 移动线材质。 */
  moveLineMaterial: any;
  /** 攻击端块材质。 */
  attackLineHeadMaterial: any;
  /** 移动端块材质。 */
  moveLineHeadMaterial: any;
  /** 上次选择 hash。 */
  selectionHash: number | undefined;
  /** 显示起始时间（1s 后自动隐藏）。 */
  showStart: number | undefined;

  /**
   * @param currentPlayer - 当前玩家
   * @param unitSelection - 单位选择
   * @param camera - 相机
   * @param debugPaths - 调试 Ref
   * @param enabled - 开关 Ref
   */
  constructor(currentPlayer: any, unitSelection: any, camera: any, debugPaths: any, enabled: any) {
    this.currentPlayer = currentPlayer;
    this.unitSelection = unitSelection;
    this.camera = camera;
    this.debugPaths = debugPaths;
    this.enabled = enabled;
    this.lineHeadGeometry = new THREE.PlaneGeometry(
      3 * Coords.ISO_WORLD_SCALE,
      3 * Coords.ISO_WORLD_SCALE,
    );
  }

  /** 惰性创建外层与四套材质。 */
  create3DObject(): void {
    if (!this.obj) {
      this.obj = new THREE.Object3D();
      this.obj.name = "target_lines";
      this.obj.matrixAutoUpdate = false;
      this.attackLineMaterial = new THREE.LineBasicMaterial({
        color: 11337728,
        transparent: true,
        depthTest: false,
        depthWrite: false,
      });
      this.moveLineMaterial = new THREE.LineBasicMaterial({
        color: 43520,
        transparent: true,
        depthTest: false,
        depthWrite: false,
      });
      this.attackLineHeadMaterial = new THREE.MeshBasicMaterial({
        color: 11337728,
        transparent: true,
        depthTest: false,
        depthWrite: false,
      });
      this.moveLineHeadMaterial = new THREE.MeshBasicMaterial({
        color: 43520,
        transparent: true,
        depthTest: false,
        depthWrite: false,
      });
    }
  }

  /** 外层 Object3D。 */
  get3DObject(): any {
    return this.obj;
  }

  /** 强制下次 update 整表重建。 */
  forceShow(): void {
    this.selectionHash = void 0;
  }

  /**
   * 每帧：选择重建 / config 同步 / 端点跟随 / 超时隐藏。
   * @param now - 当前时间戳（ms）
   */
  update(now: number): void {
    this.obj.visible = this.enabled.value;
    if (!this.enabled.value) return;

    const hash = this.unitSelection.getHash();
    if (this.selectionHash === void 0 || this.selectionHash !== hash) {
      this.selectionHash = hash;
      this.hideAllLines();
      this.unitPaths.clear();
      this.disposeUnitLines();
      this.unitSelection.getSelectedUnits().forEach((unit: any) => {
        if (!unit.isUnit()) return;
        if (this.currentPlayer && unit.owner !== this.currentPlayer) return;
        this.unitPaths.set(unit, cloneConfig(unit.unitOrderTrait.targetLinesConfig));
        this.updateLines(unit);
        // 空军恒显示；否则需有 target 才显示
        if (unit.zone === ZoneType.Air || configHasTarget(unit.unitOrderTrait.targetLinesConfig)) {
          this.showLines(unit, now);
        }
      });
      return;
    }

    // 同步阶段
    let rebuilt = false;
    this.unitSelection.getSelectedUnits().forEach((unit: any) => {
      if (!unit.isUnit()) return;
      if (this.currentPlayer && unit.owner !== this.currentPlayer) return;

      const cached = this.unitPaths.get(unit);
      const configEqual = cached && configsAreEqual(cached, unit.unitOrderTrait.targetLinesConfig);
      // config 不变且非 isRecalc 才跳过重建
      if (!configEqual && !unit.unitOrderTrait.targetLinesConfig?.isRecalc) {
        this.unitPaths.set(unit, cloneConfig(unit.unitOrderTrait.targetLinesConfig));
        rebuilt = true;
        this.updateLines(unit);
        if (configHasTarget(unit.unitOrderTrait.targetLinesConfig)) {
          this.showLines(unit, now);
        }
      }

      // 端点跟随
      const lines = this.unitLines.get(unit);
      const srcWorld = unit.position.worldPosition;
      if (lines) {
        const srcChanged = !srcWorld.equals(lines.srcLineHead.position);
        const target = unit.unitOrderTrait.targetLinesConfig?.target;
        const destWorld: any = target ? target.position.worldPosition : void 0;
        const destChanged = destWorld && !destWorld.equals(lines.destLineHead.position);
        if (srcChanged || destChanged) {
          const geom = lines.line.geometry;
          geom.verticesNeedUpdate = true;
          if (srcChanged) {
            geom.vertices[geom.vertices.length - 1].copy(srcWorld);
            lines.srcLineHead.position.copy(srcWorld);
            lines.srcLineHead.updateMatrix();
          }
          if (destWorld && destChanged) {
            geom.vertices[0].copy(destWorld);
            lines.destLineHead.position.copy(destWorld);
            lines.destLineHead.updateMatrix();
          }
        }
      }
    });
    if (rebuilt) return;

    if (this.showStart !== void 0 && now - this.showStart >= 1000) {
      this.hideAllLines();
    }
  }

  /**
   * 显示单位线并记录时间。
   * @param unit - 单位
   * @param now - 时间戳
   */
  showLines(unit: any, now: number): void {
    this.showStart = now;
    this.unitLines.get(unit).root.visible = true;
  }

  /** 隐藏全部线并清除计时。 */
  hideAllLines(): void {
    this.showStart = void 0;
    this.unitLines.forEach((bundle) => (bundle.root.visible = false));
  }

  /**
   * 按 config 重建或销毁单位线。
   * @param unit - 单位
   */
  updateLines(unit: any): void {
    let config = unit.unitOrderTrait.targetLinesConfig;
    if (!config || !configHasTarget(config)) {
      if (unit.zone !== ZoneType.Air) {
        // 非空军无目标 → 销毁
        if (this.unitLines.has(unit)) {
          const bundle = this.unitLines.get(unit);
          this.obj?.remove(bundle.root);
          this.disposeLineObjects(bundle);
          this.unitLines.delete(unit);
        }
        return;
      }
      // 空军：同格双点退化线
      config = {
        pathNodes: [
          { tile: unit.tile, onBridge: void 0 },
          { tile: unit.tile, onBridge: void 0 },
        ],
      };
    }

    const geometry = new THREE.Geometry();
    const nodes = config.pathNodes;
    if (nodes.length) {
      // 非调试只画首尾
      const path = this.debugPaths.value ? nodes : [nodes[0], nodes[nodes.length - 1]];
      path.forEach((node: any) => {
        const world = Coords.tile3dToWorld(
          node.tile.rx + 0.5,
          node.tile.ry + 0.5,
          node.tile.z + (node.onBridge?.tileElevation ?? 0),
        );
        geometry.vertices.push(world);
      });
      // 末点钉到单位世界位置
      geometry.vertices[geometry.vertices.length - 1].copy(unit.position.worldPosition);
    } else {
      // 仅 target：target → unit
      const target = config.target;
      geometry.vertices.push(target.position.worldPosition, unit.position.worldPosition);
    }

    const isAttack = !!config.isAttack;
    const material = isAttack ? this.attackLineMaterial : this.moveLineMaterial;
    const line = new THREE.Line(geometry, material);
    line.matrixAutoUpdate = false;

    const srcHead = this.createLineHead(isAttack);
    srcHead.position.copy(geometry.vertices[geometry.vertices.length - 1]);
    srcHead.matrixAutoUpdate = false;
    srcHead.updateMatrix();

    const destHead = this.createLineHead(isAttack);
    destHead.position.copy(geometry.vertices[0]);
    destHead.matrixAutoUpdate = false;
    destHead.updateMatrix();

    line.renderOrder = srcHead.renderOrder = destHead.renderOrder = 1e6;

    const root = new THREE.Object3D();
    root.matrixAutoUpdate = false;
    root.visible = false;
    root.add(line);
    root.add(srcHead);
    root.add(destHead);

    if (this.unitLines.has(unit)) {
      const old = this.unitLines.get(unit);
      this.obj?.remove(old.root);
      this.disposeLineObjects(old);
    }
    this.unitLines.set(unit, { root, line, srcLineHead: srcHead, destLineHead: destHead });
    this.obj?.add(root);
  }

  /**
   * 创建朝向相机的端块。
   * @param isAttack - 攻击样式
   */
  createLineHead(isAttack: boolean): any {
    const mesh = new THREE.Mesh(
      this.lineHeadGeometry,
      isAttack ? this.attackLineHeadMaterial : this.moveLineHeadMaterial,
    );
    const quat = new THREE.Quaternion().setFromEuler(this.camera.rotation);
    mesh.setRotationFromQuaternion(quat);
    return mesh;
  }

  /** 释放全部单位线几何。 */
  disposeUnitLines(): void {
    [...this.unitLines.values()].forEach((bundle) => this.disposeLineObjects(bundle));
    this.unitLines.clear();
  }

  /**
   * 释放单束线几何。
   * @param bundle - 线束
   */
  disposeLineObjects(bundle: UnitLineBundle): void {
    bundle.line.geometry.dispose();
  }

  /** 释放材质与端块。 */
  dispose(): void {
    this.disposeUnitLines();
    this.attackLineMaterial?.dispose();
    this.attackLineHeadMaterial?.dispose();
    this.moveLineMaterial?.dispose();
    this.moveLineHeadMaterial?.dispose();
    this.lineHeadGeometry.dispose();
  }
}
