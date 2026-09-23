/**
 * MindControlLinkFx — 心灵控制连线特效（弧线 + 两端朝向相机圆点）。
 *
 * BufferGeometry 折线在起终点间插值 heightTiles 段弧（sin 拱高）；
 * 颜色在 progress 邻域内向白色插值形成脉冲高亮；两端用共享
 * PlaneGeometry 圆点并朝向相机。update 每秒推进 colorAnimProgress。
 *
 * 由 engine/renderable/fx/MindControlLinkFx.ts.js 重写为 TS（行为完全一致）。
 * 两个文件并存期间，本文件才是修改目标：tools/repack.mjs 打包时优先
 * 采用 .ts 模块的编译产物。
 */
import { Coords } from "game/Coords"; // 已转换

/* eslint-disable @typescript-eslint/no-explicit-any */

/**
 * 心灵控制连线。
 * 可 updateEndpoints 热更新起终点。
 */
export class MindControlLinkFx {
  /** 起点。 */
  sourcePos: any;
  /** 终点。 */
  targetPos: any;
  /** 基准颜色。 */
  color: any;
  /** 弧高（tile 单位）。 */
  heightTiles: any;
  /** 相机（可选，用于圆点朝向）。 */
  camera: any;
  /** 颜色脉冲进度 [0,1)。 */
  colorAnimProgress: number = 0;
  /** 上次 update 时间戳（首帧用当前 e 初始化）。 */
  lastUpdate: number | undefined;

  /** 容器。 */
  container: any;
  /** 外层 Group。 */
  group: any;
  /** 折线 Mesh。 */
  lineMesh: any;
  /** 端点圆点材质。 */
  dotMat: any;
  /** 起点圆点。 */
  srcDot: any;
  /** 终点圆点。 */
  dstDot: any;

  /** 类级共享圆点几何。 */
  static _dotGeo: any;

  /**
   * @param sourcePos - 起点
   * @param targetPos - 终点
   * @param color - 颜色
   * @param heightTiles - 弧高（tile）
   * @param camera - 相机
   */
  constructor(sourcePos: any, targetPos: any, color: any, heightTiles: any, camera: any) {
    this.sourcePos = sourcePos;
    this.targetPos = targetPos;
    this.color = color;
    this.heightTiles = heightTiles;
    this.camera = camera;
  }

  /** 注入容器。 */
  setContainer(container: any): void {
    this.container = container;
  }

  /** 外层 Group。 */
  get3DObject(): any {
    return this.group;
  }

  /** 惰性创建折线与两端圆点。 */
  create3DObject(): void {
    if (this.group) return;
    const self = this;
    self.group = new THREE.Group();
    self.group.name = "fx_mclink";

    const material = new THREE.LineBasicMaterial({
      vertexColors: THREE.VertexColors,
      transparent: true,
    });
    self.lineMesh = new THREE.Line(
      self.createLineGeometry(self.sourcePos, self.targetPos, self.heightTiles, self.color, self.colorAnimProgress),
      material,
    );
    self.lineMesh.renderOrder = 1e6;
    self.group.add(self.lineMesh);

    const baseColor = new THREE.Color(self.color);
    self.dotMat = new THREE.MeshBasicMaterial({
      color: baseColor,
      transparent: true,
      depthTest: false,
      depthWrite: false,
    });
    const geo = MindControlLinkFx._dotGeo;
    const yOff = Coords.LEPTONS_PER_TILE / 4;

    self.srcDot = new THREE.Mesh(geo, self.dotMat);
    self.srcDot.renderOrder = 1e6 + 1;
    self.srcDot.position.set(self.sourcePos.x, self.sourcePos.y + yOff, self.sourcePos.z);
    if (self.camera) {
      self.srcDot.setRotationFromQuaternion(new THREE.Quaternion().setFromEuler(self.camera.rotation));
    }
    self.group.add(self.srcDot);

    self.dstDot = new THREE.Mesh(geo, self.dotMat);
    self.dstDot.renderOrder = 1e6 + 1;
    self.dstDot.position.set(self.targetPos.x, self.targetPos.y + yOff, self.targetPos.z);
    if (self.camera) {
      self.dstDot.setRotationFromQuaternion(new THREE.Quaternion().setFromEuler(self.camera.rotation));
    }
    self.group.add(self.dstDot);
  }

  /**
   * 热更新端点（任一变化才重建几何）。
   * @param source - 新起点
   * @param target - 新终点
   */
  updateEndpoints(source: any, target: any): void {
    const changed = !source.equals(this.sourcePos) || !target.equals(this.targetPos);
    this.sourcePos = source;
    this.targetPos = target;
    if (changed && this.lineMesh) {
      this.lineMesh.geometry.dispose();
      this.lineMesh.geometry = this.createLineGeometry(
        this.sourcePos,
        this.targetPos,
        this.heightTiles,
        this.color,
        this.colorAnimProgress,
      );
      if (this.srcDot) {
        this.srcDot.position.set(source.x, source.y + Coords.LEPTONS_PER_TILE / 4, source.z);
      }
      if (this.dstDot) {
        this.dstDot.position.set(target.x, target.y + Coords.LEPTONS_PER_TILE / 4, target.z);
      }
    }
  }

  /**
   * 每帧：推进颜色脉冲并重建折线几何。
   * @param now - 当前时间戳（ms）
   */
  update(now: number): void {
    const self = this;
    if (self.lastUpdate === void 0) {
      self.lastUpdate = now;
    }
    self.colorAnimProgress += (now - self.lastUpdate) / 1000;
    // 折回 [0,1)
    self.colorAnimProgress -= Math.floor(self.colorAnimProgress);
    self.lastUpdate = now;

    self.lineMesh.geometry.dispose();
    self.lineMesh.geometry = self.createLineGeometry(
      self.sourcePos,
      self.targetPos,
      self.heightTiles,
      self.color,
      self.colorAnimProgress,
    );
    if (self.srcDot) {
      self.srcDot.position.set(self.sourcePos.x, self.sourcePos.y + Coords.LEPTONS_PER_TILE / 4, self.sourcePos.z);
    }
    if (self.dstDot) {
      self.dstDot.position.set(self.targetPos.x, self.targetPos.y + Coords.LEPTONS_PER_TILE / 4, self.targetPos.z);
    }
    if (self.camera) {
      const q = new THREE.Quaternion().setFromEuler(self.camera.rotation);
      if (self.srcDot) self.srcDot.quaternion.copy(q);
      if (self.dstDot) self.dstDot.quaternion.copy(q);
    }
  }

  /**
   * 构建弧线 BufferGeometry（position + color）。
   * @param from - 起点
   * @param to - 终点
   * @param height - 弧高（tile 数）
   * @param baseColor - 基准色
   * @param progress - 脉冲进度
   */
  createLineGeometry(from: any, to: any, height: any, baseColor: any, progress: number): any {
    const white = new THREE.Color(16777215);
    // 脉冲窗口：progress 邻域 0.5 宽向白插值
    const pulseCenter = 1.5 * progress;
    const lenTiles = to.clone().sub(from).length() / Coords.LEPTONS_PER_TILE;
    const segments = Math.floor(15 * lenTiles);

    const positions = new Float32Array(3 * segments);
    const colors = new Float32Array(3 * segments);
    const tmp = new THREE.Vector3();

    for (let p = 0; p <= segments; p++) {
      const t = p / segments;
      tmp.lerpVectors(from, to, t);
      // sin 拱高
      tmp.y +=
        Coords.LEPTONS_PER_TILE / 4 +
        height * Coords.LEPTONS_PER_TILE * Math.sin(t * Math.PI);
      positions[3 * p] = tmp.x;
      positions[3 * p + 1] = tmp.y;
      positions[3 * p + 2] = tmp.z;

      let c: any = baseColor;
      if (t < pulseCenter && pulseCenter - 0.5 <= t) {
        c = baseColor.clone().lerp(white, (t - (pulseCenter - 0.5)) / 0.5);
      }
      colors[3 * p] = c.r;
      colors[3 * p + 1] = c.g;
      colors[3 * p + 2] = c.b;
    }

    const geometry = new THREE.BufferGeometry();
    geometry.addAttribute("position", new THREE.BufferAttribute(positions, 3));
    geometry.addAttribute("color", new THREE.BufferAttribute(colors, 3));
    return geometry;
  }

  /** 从容器移除并释放。 */
  removeAndDispose(): void {
    this.container.remove(this);
    this.dispose();
  }

  /** 释放折线与圆点材质。 */
  dispose(): void {
    if (this.lineMesh) {
      this.lineMesh.geometry.dispose();
      this.lineMesh.material.dispose();
    }
    if (this.dotMat) {
      this.dotMat.dispose();
    }
  }
}

// 类级共享圆点几何（孪生 execute 末尾初始化）
MindControlLinkFx._dotGeo = new THREE.PlaneGeometry(
  3 * Coords.ISO_WORLD_SCALE,
  3 * Coords.ISO_WORLD_SCALE,
);
