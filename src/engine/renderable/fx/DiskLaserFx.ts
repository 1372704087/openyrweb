/**
 * DiskLaserFx — 浮碟圆环充能 + 光束特效。
 *
 * 圆环被拆成两段 40° 弧，从目标对侧沿相反角向「对开」到最近点汇合
 * （charge 阶段 70%），短暂 hold 后从最近点向目标发射光束（外晕+内核）。
 * 颜色取 INI innerColor/outerColor 或 houseColor；支持 getSourcePos/
 * getTargetPos 动态跟随移动的射手与目标。
 *
 * 由 engine/renderable/fx/DiskLaserFx.ts.js 重写为 TS（行为完全一致）。
 * 两个文件并存期间，本文件才是修改目标：tools/repack.mjs 打包时优先
 * 采用 .ts 模块的编译产物。
 */
import * as MeshLineModule from "three.meshline"; // 孪生
import { Coords } from "game/Coords"; // 已转换

/* eslint-disable @typescript-eslint/no-explicit-any */

// 孪生 any-shim：未转换模块的具名导出不可用，取命名空间成员
const MeshLineNS: any = MeshLineModule as any;

/** 可选构造参数（键名与孪生 params 对齐）。 */
export interface DiskLaserParams {
  /** 半径（lepton，默认 240）。 */
  radius?: number;
  /** 总时长（秒，默认 1）。 */
  durationSeconds?: number;
  /** 是否用阵营色。 */
  isHouseColor?: boolean;
  /** 阵营色。 */
  houseColor?: any;
  /** 内色 [R,G,B] 0-255。 */
  innerColor?: number[];
  /** 外色 [R,G,B] 0-255。 */
  outerColor?: number[];
  /** 动态射手位置。 */
  getSourcePos?: (() => any) | null;
  /** 动态目标位置。 */
  getTargetPos?: (() => any) | null;
  /** 充能开始回调。 */
  onChargeStart?: (() => void) | null;
  /** 光束开始回调。 */
  onBeamStart?: (() => void) | null;
}

/**
 * 浮碟圆环充能 + 光束。
 * 三阶段：charge → hold → beam。
 */
export class DiskLaserFx {
  /** 起点（FLH）。 */
  _src: any;
  /** 终点。 */
  _dst: any;
  /** 相机。 */
  _camera: any;
  /** 主色。 */
  _color: any;
  /** 拖尾外色。 */
  _outerColor: any;
  /** 环半径。 */
  _radius: number;
  /** 主时长。 */
  _durationSeconds: number;
  /** 充能占比。 */
  _chargeRatio: number = 0.7;
  /** 保持时长。 */
  _holdSeconds: number = 0.08;
  /** 环总段数。 */
  _ringSegments: number = 12;
  /** 每弧段数。 */
  _ringArcSegs: number = 2;
  /** 单弧角度。 */
  _arcAngle: number;
  /** 射手跟随。 */
  _getSourcePos: (() => any) | null;
  /** 目标跟随。 */
  _getTargetPos: (() => any) | null;
  /** 充能回调。 */
  _onChargeStart: (() => void) | null;
  /** 开火回调。 */
  _onBeamStart: (() => void) | null;
  /** 首次 update 时间戳。 */
  _firstMs: number | null = null;
  /** 已 dispose。 */
  _disposed: boolean = false;
  /** 容器。 */
  container: any = null;
  /** 充能是否已开始。 */
  _chargeStarted: boolean = false;
  /** 光束是否已开始。 */
  _beamStarted: boolean = false;
  /** MeshLine resolution。 */
  _resolution: any;
  /** 弧细分段数。 */
  _numRingSegs: number = 32;

  _ring1: any = null;
  _ring2: any = null;
  _ringGlow1: any = null;
  _ringGlow2: any = null;
  _ringCore1: any = null;
  _ringCore2: any = null;
  _trail1: any = null;
  _trail2: any = null;
  _beamMesh: any = null;
  _beamGlowMesh: any = null;
  _group: any = null;

  /** 对侧角（运行时计算）。 */
  _nearestAngle: number = 0;
  /** 最近角（运行时计算）。 */
  _oppositeAngle: number = 0;

  /**
   * @param sourcePos - 枪口世界位置（圆心）
   * @param targetPos - 初始目标位置
   * @param camera - 相机
   * @param params - 可选参数
   */
  constructor(sourcePos: any, targetPos: any, camera: any, params?: DiskLaserParams) {
    this._src = sourcePos.clone();
    this._dst = targetPos.clone();
    this._camera = camera;
    const p = params || {};

    // 颜色：houseColor 或 innerColor（0-255 RGB）
    if (p.isHouseColor && p.houseColor) {
      this._color = p.houseColor.clone();
    } else {
      const c = p.innerColor;
      this._color = new THREE.Color(
        c ? c[0] / 255 : 200 / 255,
        c ? c[1] / 255 : 0,
        c ? c[2] / 255 : 220 / 255,
      );
    }
    const oc = p.outerColor;
    this._outerColor = new THREE.Color(
      oc ? oc[0] / 255 : 80 / 255,
      oc ? oc[1] / 255 : 0,
      oc ? oc[2] / 255 : 88 / 255,
    );

    this._radius = p.radius != null ? p.radius : 240;
    this._durationSeconds = p.durationSeconds != null ? p.durationSeconds : 1.0;
    // 12 段环，每弧约 40°
    this._arcAngle = (((Math.PI * 2) / this._ringSegments) * this._ringArcSegs * 2) / 3;

    this._getSourcePos = p.getSourcePos || null;
    this._getTargetPos = p.getTargetPos || null;
    this._onChargeStart = p.onChargeStart || null;
    this._onBeamStart = p.onBeamStart || null;

    const top = camera.top;
    const right = camera.right / camera.top;
    const height = (2 * top) / Math.cos(camera.rotation.y);
    const width = height * right;
    this._resolution = new THREE.Vector2(width, height).multiplyScalar(
      (top * Math.cos(camera.rotation.x)) / Coords.ISO_WORLD_SCALE,
    );
  }

  /** 注入容器。 */
  setContainer(c: any): void {
    this.container = c;
  }

  /** 外层 Group。 */
  get3DObject(): any {
    return this._group || null;
  }

  /** 惰性创建 Group。 */
  create3DObject(): void {
    if (this._group) return;
    this._group = new THREE.Group();
    this._group.name = "fx_disklaser";
    this._group.frustumCulled = false;
  }

  /**
   * 按时间推进三阶段。
   * @param nowMs - 当前时间戳（ms）
   */
  update(nowMs: number): void {
    if (this._disposed || !this._group) return;
    if (this._firstMs == null) this._firstMs = nowMs;

    if (this._getSourcePos) {
      const newSrc = this._getSourcePos();
      if (newSrc) this._src.copy(newSrc);
    }
    if (this._getTargetPos) {
      const newDst = this._getTargetPos();
      if (newDst) this._dst.copy(newDst);
    }

    const elapsed = (nowMs - this._firstMs) / 1000;
    const totalDur = this._durationSeconds + this._holdSeconds;
    if (elapsed >= totalDur) {
      if (this.container) this.container.remove(this);
      this.dispose();
      return;
    }

    const progress = Math.min(elapsed / totalDur, 1.0);
    const chargeEnd = (this._durationSeconds * this._chargeRatio) / totalDur;
    const holdEnd = chargeEnd + this._holdSeconds / totalDur;

    if (progress < chargeEnd) {
      if (!this._chargeStarted) {
        this._chargeStarted = true;
        if (this._onChargeStart) this._onChargeStart();
      }
      this._rebuildChargePhase(progress / chargeEnd, nowMs);
    } else if (progress < holdEnd) {
      this._rebuildChargePhase(1.0, nowMs);
    } else {
      if (!this._beamStarted) {
        this._beamStarted = true;
        if (this._onBeamStart) this._onBeamStart();
      }
      this._rebuildBeamPhase((progress - holdEnd) / (1 - holdEnd));
    }
  }

  /**
   * 充能：两段弧从对侧对开到最近点。
   * @param chargeProgress - 充能进度 [0,1]
   * @param nowMs - 当前时间戳（闪白用）
   */
  _rebuildChargePhase(chargeProgress: number, nowMs: number): void {
    this._recalcAngles();

    // 对侧 → 最近 的两个方向角距
    const distPos = (this._nearestAngle - this._oppositeAngle + Math.PI * 2) % (Math.PI * 2);
    const distNeg = (this._oppositeAngle - this._nearestAngle + Math.PI * 2) % (Math.PI * 2);

    // 前沿多走一个弧长，使「车尾」在 progress=1 时正好到最近点
    const leadingPos = this._oppositeAngle + chargeProgress * (distPos + this._arcAngle);
    const leadingNeg = this._oppositeAngle - chargeProgress * (distNeg + this._arcAngle);

    const arc1Start = leadingPos - this._arcAngle;
    const arc1End = leadingPos;
    const arc2Start = leadingNeg;
    const arc2End = leadingNeg + this._arcAngle;

    const arcOpacity = 0.5 + chargeProgress * 0.5;

    // 充能末段仅提亮（保色相）
    const color = this._color.clone();
    if (chargeProgress > 0.85) {
      const flash = Math.sin(nowMs * 0.06) * 0.3 + 0.7;
      const hsl: any = {};
      this._color.getHSL(hsl);
      color.setHSL(hsl.h, hsl.s, flash);
    }

    // 轨道 1（+角向）
    this._disposeMesh(this._ring1);
    this._disposeMesh(this._ringGlow1);
    this._disposeMesh(this._ringCore1);
    this._ringGlow1 = this._buildArcMesh(arc1Start, arc1End, this._outerColor, 6, arcOpacity * 0.3);
    this._group.add(this._ringGlow1);
    this._ring1 = this._buildArcMesh(arc1Start, arc1End, color, 2, arcOpacity);
    this._group.add(this._ring1);
    this._ringCore1 = this._buildArcMesh(arc1Start, arc1End, new THREE.Color(1, 1, 1), 1, arcOpacity * 0.3);
    this._group.add(this._ringCore1);

    // 轨道 2（-角向）
    this._disposeMesh(this._ring2);
    this._disposeMesh(this._ringGlow2);
    this._disposeMesh(this._ringCore2);
    this._ringGlow2 = this._buildArcMesh(arc2Start, arc2End, this._outerColor, 6, arcOpacity * 0.3);
    this._group.add(this._ringGlow2);
    this._ring2 = this._buildArcMesh(arc2Start, arc2End, color, 2, arcOpacity);
    this._group.add(this._ring2);
    this._ringCore2 = this._buildArcMesh(arc2Start, arc2End, new THREE.Color(1, 1, 1), 1, arcOpacity * 0.3);
    this._group.add(this._ringCore2);

    // 拖尾（弧已离开对侧才画）
    const trailOpacity = 0.25 + Math.min(chargeProgress, 1) * 0.15;
    const trailColor = this._outerColor.clone();

    const trailPosSpan = arc1Start - this._oppositeAngle;
    if (trailPosSpan > 0.001) {
      this._disposeMesh(this._trail1);
      this._trail1 = this._buildArcMesh(
        this._oppositeAngle,
        arc1Start,
        trailColor,
        1,
        trailOpacity,
        trailPosSpan,
      );
      this._group.add(this._trail1);
    } else {
      this._disposeMesh(this._trail1);
      this._trail1 = null;
    }

    const trailNegSpan = this._oppositeAngle - arc2End;
    if (trailNegSpan > 0.001) {
      this._disposeMesh(this._trail2);
      this._trail2 = this._buildArcMesh(
        arc2End,
        this._oppositeAngle,
        trailColor,
        1,
        trailOpacity,
        -trailNegSpan,
      );
      this._group.add(this._trail2);
    } else {
      this._disposeMesh(this._trail2);
      this._trail2 = null;
    }

    // 充能期无光束
    this._disposeMesh(this._beamMesh);
    this._disposeMesh(this._beamGlowMesh);
  }

  /**
   * 开火：环消失，从最近点到目标发射外晕+内核光束。
   * @param beamProgress - 光束进度 [0,1]
   */
  _rebuildBeamPhase(beamProgress: number): void {
    this._disposeMesh(this._ring1);
    this._disposeMesh(this._ring2);
    this._disposeMesh(this._ringGlow1);
    this._disposeMesh(this._ringGlow2);
    this._disposeMesh(this._ringCore1);
    this._disposeMesh(this._ringCore2);
    this._disposeMesh(this._trail1);
    this._disposeMesh(this._trail2);

    // 快进 → 保持 → 尾部淡出
    let beamOpacity: number;
    if (beamProgress < 0.08) {
      beamOpacity = beamProgress / 0.08;
    } else if (beamProgress < 0.85) {
      beamOpacity = 1.0;
    } else {
      beamOpacity = (1 - beamProgress) / 0.15;
    }

    this._recalcAngles();
    const startPt = this._getCirclePoint(this._nearestAngle);
    const endPt = this._dst.clone();

    // 外晕（宽、半透明）
    this._disposeMesh(this._beamGlowMesh);
    const glowGeom = new THREE.Geometry();
    glowGeom.vertices.push(startPt.clone(), endPt.clone());
    const glowML = new (MeshLineNS.MeshLine as any)();
    glowML.setGeometry(glowGeom);
    const glowMat = new (MeshLineNS.MeshLineMaterial as any)({
      color: this._color,
      lineWidth: 5,
      resolution: this._resolution,
      transparent: true,
      opacity: beamOpacity * 0.3,
      sizeAttenuation: 0,
      blending: THREE.AdditiveBlending,
      depthTest: false,
      depthWrite: false,
    });
    this._beamGlowMesh = new THREE.Mesh(glowML.geometry, glowMat);
    this._beamGlowMesh.frustumCulled = false;
    this._group.add(this._beamGlowMesh);

    // 内核（细、白）
    this._disposeMesh(this._beamMesh);
    const coreGeom = new THREE.Geometry();
    coreGeom.vertices.push(startPt.clone(), endPt.clone());
    const beamML = new (MeshLineNS.MeshLine as any)();
    beamML.setGeometry(coreGeom);
    const beamMat = new (MeshLineNS.MeshLineMaterial as any)({
      color: new THREE.Color(1, 1, 1),
      lineWidth: 2,
      resolution: this._resolution,
      transparent: true,
      opacity: beamOpacity * 0.3,
      sizeAttenuation: 0,
      blending: THREE.AdditiveBlending,
      depthTest: false,
      depthWrite: false,
    });
    this._beamMesh = new THREE.Mesh(beamML.geometry, beamMat);
    this._beamMesh.frustumCulled = false;
    this._group.add(this._beamMesh);
  }

  /** 按当前起终点重算最近/对侧角。 */
  _recalcAngles(): void {
    const dir = new THREE.Vector3().subVectors(this._dst, this._src);
    dir.y = 0;
    if (dir.lengthSq() < 0.001) dir.set(1, 0, 0);
    dir.normalize();
    this._nearestAngle = Math.atan2(dir.z, dir.x);
    this._oppositeAngle = Math.atan2(-dir.z, -dir.x);
  }

  /**
   * 圆上一点。
   * @param angle - XZ 平面角
   */
  _getCirclePoint(angle: number): any {
    return new THREE.Vector3(
      this._src.x + this._radius * Math.cos(angle),
      this._src.y,
      this._src.z + this._radius * Math.sin(angle),
    );
  }

  /**
   * 构建 MeshLine 弧。
   * @param startAngle - 起角
   * @param endAngle - 终角
   * @param color - 颜色
   * @param lineWidth - 线宽
   * @param opacity - 不透明度
   * @param forceSpan - 强制角距（拖尾跨 >180° 时用）
   */
  _buildArcMesh(
    startAngle: number,
    endAngle: number,
    color: any,
    lineWidth: number,
    opacity: number,
    forceSpan?: number,
  ): any {
    const geom = new THREE.Geometry();
    let span = endAngle - startAngle;
    if (forceSpan != null) {
      span = forceSpan;
    } else {
      // 归一到最短带符号角距
      while (span > Math.PI) span -= Math.PI * 2;
      while (span < -Math.PI) span += Math.PI * 2;
    }
    const totalSegs = Math.max(
      2,
      Math.floor((this._numRingSegs * Math.abs(span)) / (Math.PI * 2)),
    );

    for (let i = 0; i <= totalSegs; i++) {
      const t = i / totalSegs;
      geom.vertices.push(this._getCirclePoint(startAngle + span * t));
    }

    const ml = new (MeshLineNS.MeshLine as any)();
    ml.setGeometry(geom);
    const mat = new (MeshLineNS.MeshLineMaterial as any)({
      color: color.clone(),
      lineWidth,
      resolution: this._resolution,
      transparent: true,
      opacity,
      sizeAttenuation: 0,
      blending: THREE.AdditiveBlending,
      depthTest: false,
      depthWrite: false,
    });
    const mesh = new THREE.Mesh(ml.geometry, mat);
    mesh.frustumCulled = false;
    return mesh;
  }

  /**
   * 释放并摘除一个 Mesh。
   * @param mesh - 可空 Mesh
   */
  _disposeMesh(mesh: any): void {
    if (!mesh) return;
    if (mesh.material) mesh.material.dispose();
    if (mesh.geometry) mesh.geometry.dispose();
    if (mesh.parent) mesh.parent.remove(mesh);
  }

  /** 是否已结束。 */
  isFinished(): boolean {
    return this._disposed;
  }

  /** 释放全部网格。 */
  dispose(): void {
    this._disposed = true;
    this._disposeMesh(this._ring1);
    this._disposeMesh(this._ring2);
    this._disposeMesh(this._ringGlow1);
    this._disposeMesh(this._ringGlow2);
    this._disposeMesh(this._ringCore1);
    this._disposeMesh(this._ringCore2);
    this._disposeMesh(this._trail1);
    this._disposeMesh(this._trail2);
    this._disposeMesh(this._beamMesh);
    this._disposeMesh(this._beamGlowMesh);
    this._ring1 = null;
    this._ring2 = null;
    this._ringGlow1 = null;
    this._ringGlow2 = null;
    this._ringCore1 = null;
    this._ringCore2 = null;
    this._trail1 = null;
    this._trail2 = null;
    this._beamMesh = null;
    this._group = null;
  }
}
