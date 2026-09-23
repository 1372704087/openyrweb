/**
 * MagBeamFx — 磁电光束（CPU 顶点色锯齿波 + 软边脉冲）。
 *
 * 100 段双侧 ribbon，MeshBasicMaterial vertexColors + AdditiveBlending。
 * 每帧按生长进度更新两端位置（可 growFromTarget 反向），并按 screen-space
 * 物理长度 uvx 计算锯齿波调制（最多 6 个脉冲）+ 全局正弦脉冲。
 * duration 到期或 startDying 后 growth 收缩到 0 时 dispose。
 *
 * 由 engine/renderable/fx/MagBeamFx.ts.js 重写为 TS（行为完全一致）。
 * 两个文件并存期间，本文件才是修改目标：tools/repack.mjs 打包时优先
 * 采用 .ts 模块的编译产物。
 */
import { Coords } from "game/Coords"; // 已转换

/* eslint-disable @typescript-eslint/no-explicit-any */

/** 可选构造参数。 */
export interface MagBeamParams {
  /** 波颜色 [r,g,b] 0-255。 */
  waveColor?: number[];
  /** 波强度 [x,y,z]（Ares 式）。 */
  waveIntensity?: number[];
  /** 波是否用阵营色。 */
  waveIsHouseColor?: boolean;
  /** 波是否反向。 */
  _waveReverse?: boolean;
  /** 线半宽（px 当量，默认 3.5）。 */
  width?: number;
  /** 波频率（默认 6）。 */
  waveFrequency?: number;
  /** 波速度（默认 2.2）。 */
  waveSpeed?: number;
  /** 脉冲强度（默认 0.3）。 */
  pulseStrength?: number;
  /** 脉冲速率（默认 3.5）。 */
  pulseRate?: number;
  /** 基础 alpha（默认 0.85）。 */
  alpha?: number;
  /** 持续秒数（null=不自动结束）。 */
  durationSeconds?: number | null;
  /** 主色（覆盖）。 */
  color?: any;
  /** 生长速度（默认 3）。 */
  growthSpeed?: number;
  /** 是否从目标向炮口生长。 */
  growFromTarget?: boolean;
}

/**
 * 磁电光束。
 * 支持热更端点、反向波、生长/收缩动画。
 */
export class MagBeamFx {
  /** 起点（克隆持有）。 */
  sourcePos: any;
  /** 终点（克隆持有）。 */
  targetPos: any;
  /** 相机。 */
  camera: any;

  _waveColor: number[];
  _waveIntensity: number[];
  _waveIsHouseColor: boolean;
  _waveReverse: boolean;
  _width: number;
  _waveFreq: number;
  _waveSpeed: number;
  _pulseStr: number;
  _pulseRate: number;
  _alpha: number;
  _duration: number | null;
  _houseColor: any;

  /** 生长进度 [0,1]。 */
  _growth: number = 0;
  _growthSpeed: number;
  _isDying: boolean = false;
  _growFromTarget: boolean;
  _lastUpdateMs: number | null = null;

  _firstMs: number | null = null;
  _timeLeft: number = 1;
  _disposed: boolean = false;
  container: any = null;
  group: any = null;
  coreMesh: any = null;
  _geom: any = null;
  _beamSegments: number = 100;
  _screenUvx: Float32Array | null = null;
  _screenW: number = 1920;
  _screenH: number = 1080;
  _intensityNorm: any;
  _coreMat: any;

  /**
   * @param sourcePos - 起点
   * @param targetPos - 终点
   * @param camera - 相机
   * @param params - 可选参数
   */
  constructor(sourcePos: any, targetPos: any, camera: any, params?: MagBeamParams) {
    this.sourcePos = sourcePos.clone();
    this.targetPos = targetPos.clone();
    this.camera = camera || null;
    const p = params || {};

    // 原版 YR 波参数（Ares 逆向）
    this._waveColor = p.waveColor || [0, 0, 0];
    this._waveIntensity = p.waveIntensity || [128, 0, 1024];
    this._waveIsHouseColor = !!p.waveIsHouseColor;
    this._waveReverse = !!p._waveReverse;

    this._width = p.width != null ? p.width : 3.5;
    this._waveFreq = p.waveFrequency != null ? p.waveFrequency : 6.0;
    this._waveSpeed = p.waveSpeed != null ? p.waveSpeed : 2.2;
    this._pulseStr = p.pulseStrength != null ? p.pulseStrength : 0.3;
    this._pulseRate = p.pulseRate != null ? p.pulseRate : 3.5;
    this._alpha = p.alpha != null ? p.alpha : 0.85;
    this._duration = p.durationSeconds != null ? p.durationSeconds : null;
    this._houseColor = p.color || null;

    this._growthSpeed = p.growthSpeed != null ? p.growthSpeed : 3.0;
    this._growFromTarget = !!p.growFromTarget;
  }

  /** 注入容器。 */
  setContainer(c: any): void {
    this.container = c;
  }

  /** Group 或核心 Mesh。 */
  get3DObject(): any {
    return this.group || this.coreMesh;
  }

  /** 惰性创建 ribbon 几何与材质。 */
  create3DObject(): void {
    if (this.coreMesh) return;
    this.group = new THREE.Group();
    this.group.name = "fx_magbeam";
    this._geom = this._buildGeometry();

    this._intensityNorm = new THREE.Vector3(
      this._waveIntensity[0] / 256.0,
      this._waveIntensity[1] / 256.0,
      this._waveIntensity[2] / 256.0,
    );

    this._coreMat = new THREE.MeshBasicMaterial({
      vertexColors: true,
      transparent: true,
      depthTest: true, // 被前方单位/建筑遮挡
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      side: THREE.DoubleSide,
    });
    this.coreMesh = new THREE.Mesh(this._geom, this._coreMat);
    this.coreMesh.name = "fx_magbeam_core";
    this.coreMesh.frustumCulled = false;
    this.coreMesh.renderOrder = 0;
    this.group.add(this.coreMesh);

    this._updateGeometry();
  }

  /**
   * 推进寿命、生长动画与颜色。
   * @param nowMs - 当前时间戳（ms）
   */
  update(nowMs: number): void {
    if (this._disposed || !this.coreMesh) return;
    if (this._firstMs == null) this._firstMs = nowMs;
    const elapsed = (nowMs - this._firstMs) / 1000;

    if (this._duration != null) {
      this._timeLeft = Math.max(0, 1 - elapsed / this._duration);
      if (this._timeLeft <= 0) {
        if (this.container) this.container.remove(this);
        this.dispose();
        return;
      }
    }

    // dt 封顶 0.1s，首帧 1/60
    const dt =
      this._lastUpdateMs != null ? Math.min((nowMs - this._lastUpdateMs) / 1000, 0.1) : 1 / 60;
    this._lastUpdateMs = nowMs;
    if (this._isDying) {
      this._growth -= dt * this._growthSpeed;
      if (this._growth <= 0) {
        this._growth = 0;
        if (this.container) this.container.remove(this);
        this.dispose();
        return;
      }
    } else {
      this._growth = Math.min(1, this._growth + dt * this._growthSpeed);
    }

    this._updateGeometry();
    this._updateColors(elapsed);
  }

  /**
   * 热更端点。
   * @param src - 新起点
   * @param dst - 新终点
   */
  updateEndpoints(src: any, dst: any): void {
    if (this._disposed) return;
    this.sourcePos.copy(src);
    this.targetPos.copy(dst);
  }

  /** 切换波方向。 */
  setWaveReverse(reverse: boolean): void {
    this._waveReverse = !!reverse;
  }

  /** 进入收缩收尾。 */
  startDying(): void {
    this._isDying = true;
  }

  /** 复活（恢复生长并重置时钟）。 */
  revive(): void {
    this._isDying = false;
    this._growth = Math.max(this._growth, 0.01);
    this._firstMs = null;
    this._lastUpdateMs = null;
  }

  /** 是否正在收缩。 */
  isDying(): boolean {
    return this._isDying;
  }

  /** 从容器移除并释放（吞掉 remove 异常）。 */
  removeAndDispose(): void {
    if (this.container) {
      try {
        this.container.remove(this);
      } catch {
        /* 孪生吞掉 */
      }
    }
    this.dispose();
  }

  /** 寿命归零或正在死亡且 growth 归零。 */
  isFinished(): boolean {
    return this._timeLeft <= 0 || (this._isDying && this._growth <= 0);
  }

  /** 释放几何与材质。 */
  dispose(): void {
    this._disposed = true;
    if (this._geom) {
      this._geom.dispose();
      this._geom = null;
    }
    if (this.coreMesh) {
      this.coreMesh.material.dispose();
      this.coreMesh = null;
    }
    this.group = null;
    this._screenUvx = null;
    this._lastUpdateMs = null;
  }

  // --- internal ---

  /** 构建 (segs+1)*2 顶点的 ribbon BufferGeometry。 */
  _buildGeometry(): any {
    const segs = this._beamSegments;
    const vcount = (segs + 1) * 2;
    const geom = new THREE.BufferGeometry();
    const positions = new Float32Array(vcount * 3);
    const colors = new Float32Array(vcount * 4);
    const indices = new Uint16Array(segs * 6);

    for (let i = 0; i < segs; i++) {
      const a = i * 2;
      const b = a + 1;
      const c = a + 3;
      const d = a + 2;
      indices[i * 6] = a;
      indices[i * 6 + 1] = b;
      indices[i * 6 + 2] = c;
      indices[i * 6 + 3] = a;
      indices[i * 6 + 4] = c;
      indices[i * 6 + 5] = d;
    }
    geom.addAttribute("position", new THREE.BufferAttribute(positions, 3));
    geom.addAttribute("color", new THREE.BufferAttribute(colors, 4));
    geom.setIndex(new THREE.BufferAttribute(indices, 1));
    return geom;
  }

  /** 按生长进度更新 ribbon 顶点与 screen uvx。 */
  _updateGeometry(): void {
    const src = this.sourcePos;
    const dst = this.targetPos;

    let startPos: any;
    let endPos: any;
    if (this._growFromTarget) {
      // 从目标向炮口生长（拖拽车辆）
      startPos = dst.clone();
      endPos = new THREE.Vector3().lerpVectors(dst, src, this._growth);
    } else {
      // 从炮口向目标生长
      startPos = src.clone();
      endPos = new THREE.Vector3().lerpVectors(src, dst, this._growth);
    }

    let beamDir = new THREE.Vector3().subVectors(endPos, startPos);
    let beamLen = beamDir.length();
    if (beamLen < 0.001) {
      beamDir.subVectors(dst, src);
      beamLen = beamDir.length();
      if (beamLen < 0.001) beamLen = 0.001;
    }
    beamDir.divideScalar(beamLen);

    const camPos = this.camera ? this.camera.position : new THREE.Vector3(0, 1000, 0);
    const beamMid = new THREE.Vector3().addVectors(src, dst).multiplyScalar(0.5);
    // 世界 Y 上方向（地面平行），而非面向摄像机
    const worldUp = new THREE.Vector3(0, 1, 0);
    const right = new THREE.Vector3().crossVectors(beamDir, worldUp);
    if (right.lengthSq() < 0.0001) right.set(1, 0, 0);
    right.normalize();

    this._screenW = (typeof window !== "undefined" && window.innerWidth) || 1920;
    this._screenH = (typeof window !== "undefined" && window.innerHeight) || 1080;
    let halfW: number;

    if (this.camera && this.camera.isPerspectiveCamera) {
      const distance = camPos.distanceTo(beamMid);
      const fov = (this.camera.fov * Math.PI) / 180;
      const worldPerPixel = (2 * distance * Math.tan(fov / 2)) / this._screenH;
      halfW = this._width * worldPerPixel;
    } else if (this.camera && this.camera.top) {
      const worldPerPixel = (2 * this.camera.top) / this._screenH;
      halfW = this._width * worldPerPixel;
    } else {
      halfW = this._width;
    }

    const segs = this._beamSegments;

    // screen-space 物理长度（百像素单位，不归一化）
    if (!this._screenUvx || this._screenUvx.length !== segs + 1) {
      this._screenUvx = new Float32Array(segs + 1);
    }

    let totalScreenLen = 0;
    let prevSX = 0;
    let prevSY = 0;
    let hasPrev = false;
    const ndcToPixelX = this._screenW / 2;
    const ndcToPixelY = this._screenH / 2;

    for (let i = 0; i <= segs; i++) {
      const t = i / segs;
      const pt = new THREE.Vector3().lerpVectors(startPos, endPos, t);

      if (this.camera) {
        const viewPos = pt.clone().applyMatrix4(this.camera.matrixWorldInverse);
        const projPos = new THREE.Vector4(viewPos.x, viewPos.y, viewPos.z, 1.0);
        projPos.applyMatrix4(this.camera.projectionMatrix);
        const sx = projPos.x / projPos.w;
        const sy = projPos.y / projPos.w;

        if (hasPrev) {
          const dx = (sx - prevSX) * ndcToPixelX;
          const dy = (sy - prevSY) * ndcToPixelY;
          totalScreenLen += Math.sqrt(dx * dx + dy * dy);
        }
        this._screenUvx[i] = totalScreenLen / 100.0;
        prevSX = sx;
        prevSY = sy;
        hasPrev = true;
      } else {
        this._screenUvx[i] = t;
      }
    }

    const posAttr = this._geom.getAttribute("position");
    const arr: any = posAttr.array;
    for (let i = 0; i <= segs; i++) {
      const t = i / segs;
      const pt = new THREE.Vector3().lerpVectors(startPos, endPos, t);
      const li = i * 2 * 3;
      const ri = li + 3;
      arr[li] = pt.x - right.x * halfW;
      arr[li + 1] = pt.y - right.y * halfW;
      arr[li + 2] = pt.z - right.z * halfW;
      arr[ri] = pt.x + right.x * halfW;
      arr[ri + 1] = pt.y + right.y * halfW;
      arr[ri + 2] = pt.z + right.z * halfW;
    }
    posAttr.needsUpdate = true;
    this._geom.computeBoundingSphere();
  }

  /**
   * 按锯齿波 + 软边脉冲更新顶点色。
   * @param elapsed - 已过秒数
   */
  _updateColors(elapsed: number): void {
    const segs = this._beamSegments;
    const colorAttr = this._geom.getAttribute("color");
    const arr: any = colorAttr.array;
    const alpha = this._alpha;
    const timeLeft = this._timeLeft;
    const freq = this._waveFreq;
    const speed = this._waveSpeed;
    const pulseStr = this._pulseStr;
    const pulseRate = this._pulseRate;
    const reverse = this._waveReverse;
    const mod = this._intensityNorm;

    let pulse = 1.0 + pulseStr * Math.sin(elapsed * pulseRate * Math.PI * 2);
    if (pulse < 0) pulse = 0;
    if (pulse > 1) pulse = 1;

    for (let i = 0; i <= segs; i++) {
      const uvx = this._screenUvx ? this._screenUvx[i] : i / segs;

      // 锯齿波: fract(uvx*freq - elapsed*speed)
      let wavePos = uvx * freq - elapsed * speed;
      if (reverse) wavePos = -wavePos;
      const cycle = Math.floor(wavePos);
      let saw = wavePos - cycle;

      // 最多 6 个脉冲
      if (cycle < 0 || cycle >= 6) {
        saw = 0;
      }

      // 底色 50%，脉冲占 25%，峰值 +25%，边缘渐变 20%
      const base = 0.5;
      const pulseWidth = 0.25;
      const extra = 0.25;
      const fade = pulseWidth * 0.2;

      let t = 0.0;
      if (saw < fade) {
        t = saw / fade;
      } else if (saw < pulseWidth - fade) {
        t = 1.0;
      } else if (saw < pulseWidth) {
        t = (pulseWidth - saw) / fade;
      }
      const modulation = base + extra * t;

      const x = modulation * pulse * alpha * timeLeft;

      // 紫色光束 + 强度调制
      const r = 0.5 * mod.x * x * 2;
      const g = 0;
      const b = 1.0 * mod.z * x * 2;
      const a = x;

      const ci = i * 2 * 4;
      arr[ci] = r;
      arr[ci + 1] = g;
      arr[ci + 2] = b;
      arr[ci + 3] = a;
      arr[ci + 4] = r;
      arr[ci + 5] = g;
      arr[ci + 6] = b;
      arr[ci + 7] = a;
    }
    colorAttr.needsUpdate = true;
  }
}
