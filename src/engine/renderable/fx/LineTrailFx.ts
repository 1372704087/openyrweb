/**
 * LineTrailFx — 线条拖尾特效（THREE.TrailRenderer）。
 *
 * 首次 update 时从 lazyTarget() 解析目标并 initialize/activate 拖尾；
 * timeLeft 未定义则一直存活，requestFinishAndDispose 后按 0.8/gameSpeed 秒
 * 倒计时，归零从容器移除。stopTracking 把 targetObject 钉在最后矩阵。
 *
 * 由 engine/renderable/fx/LineTrailFx.ts.js 重写为 TS（行为完全一致）。
 * 两个文件并存期间，本文件才是修改目标：tools/repack.mjs 打包时优先
 * 采用 .ts 模块的编译产物。
 */
import { ObjectArt } from "game/art/ObjectArt"; // 已转换
import { Coords } from "game/Coords"; // 已转换

/* eslint-disable @typescript-eslint/no-explicit-any */

/**
 * 线条拖尾。
 * 惰性创建；可 requestFinishAndDispose 进入淡出收尾。
 */
export class LineTrailFx {
  /** 目标解析函数（返回 THREE.Object3D 或 undefined）。 */
  lazyTarget: any;
  /** 拖尾颜色。 */
  trailColor: any;
  /** 拖尾衰减步进（越小越长）。 */
  trailDecrement: any;
  /** 游戏速度。 */
  gameSpeed: any;
  /** 相机（用于对齐拖尾平面朝向）。 */
  camera: any;
  /** 是否已尝试创建拖尾。 */
  trailInitialized: boolean = false;

  /** 容器。 */
  container: any;
  /** 占位 Object3D（get3DObject 返回，避免空引用）。 */
  placeholderObj: any;
  /** TrailRenderer 实例。 */
  trail: any | undefined;
  /** 目标最后的世界矩阵（stopTracking 用）。 */
  lastTargetMatrix: any | undefined;
  /** 收尾剩余秒数；undefined 表示永续。 */
  timeLeft: number | undefined;
  /** 上次 update 时间戳。 */
  prevUpdateMillis: number | undefined;

  /**
   * @param lazyTarget - 目标解析函数
   * @param trailColor - 颜色
   * @param trailDecrement - 衰减参数
   * @param gameSpeed - 游戏速度
   * @param camera - 相机
   */
  constructor(lazyTarget: any, trailColor: any, trailDecrement: any, gameSpeed: any, camera: any) {
    this.lazyTarget = lazyTarget;
    this.trailColor = trailColor;
    this.trailDecrement = trailDecrement;
    this.gameSpeed = gameSpeed;
    this.camera = camera;
  }

  /** 注入容器。 */
  setContainer(container: any): void {
    this.container = container;
  }

  /** 占位对象。 */
  get3DObject(): any {
    return this.placeholderObj;
  }

  /** 惰性创建占位 Object3D。 */
  create3DObject(): void {
    if (!this.placeholderObj) {
      this.placeholderObj = new THREE.Object3D();
      this.placeholderObj.name = "fx_linetrail_placeholder";
    }
  }

  /**
   * 每帧：倒计时、惰性建拖尾、advance、超时移除。
   * @param now - 当前时间戳（ms）
   */
  update(now: number): void {
    if (this.timeLeft !== void 0) {
      const prev = this.prevUpdateMillis;
      this.prevUpdateMillis = now;
      if (prev) {
        this.timeLeft = Math.max(0, this.timeLeft - (now - prev) / 1000);
      }
    }
    if (!this.trailInitialized) {
      this.trailInitialized = true;
      const t = this.createTrail(this.trailColor, this.trailDecrement);
      if (t) {
        this.trail = t;
      } else {
        this.timeLeft = 0;
      }
    }
    if (this.trail) {
      this.trail.advance();
      this.lastTargetMatrix = this.trail.targetObject.matrixWorld;
    }
    if (this.isFinished()) {
      this.container.remove(this);
      this.dispose();
    }
  }

  /**
   * 创建 TrailRenderer：段数按 gameSpeed 与 trailDecrement 换算，
   * 片段几何为朝向相机的 0.8×世界单位方平面。
   * @param color - 颜色
   * @param decrement - 衰减参数
   */
  createTrail(color: any, decrement: any): any {
    const target = this.lazyTarget();
    if (target) {
      const trail = new (THREE as any).TrailRenderer(this.container.get3DObject());
      const material = (THREE as any).TrailRenderer.createBaseMaterial();
      material.uniforms.headColor.value.set(color.r, color.g, color.b, 1);
      material.uniforms.tailColor.value.set(color.r, color.g, color.b, 0);
      const segments = Math.floor(
        ((3 / this.gameSpeed.value) * 50) / (decrement / ObjectArt.DEFAULT_LINE_TRAIL_DEC),
      );
      const size = 0.8 * Coords.ISO_WORLD_SCALE;
      let plane = new THREE.PlaneGeometry(size, size);
      const quat = new THREE.Quaternion().setFromEuler(this.camera.rotation);
      plane.applyMatrix(new THREE.Matrix4().makeRotationFromQuaternion(quat));
      trail.initialize(material, segments, false, 0, (plane as any).vertices, target);
      trail.activate();
      return trail;
    }
  }

  /** timeLeft 是否已归零。 */
  isFinished(): boolean {
    return this.timeLeft === 0;
  }

  /** 请求收尾（约 0.8 秒游戏时间后移除）。 */
  requestFinishAndDispose(): void {
    this.timeLeft = 0.8 / this.gameSpeed.value;
  }

  /** 停止跟随目标，钉在最后已见矩阵。 */
  stopTracking(): void {
    if (this.trail && this.lastTargetMatrix) {
      const stub = new THREE.Object3D();
      stub.updateMatrixWorld = () => {};
      stub.matrixWorld = this.lastTargetMatrix;
      this.trail.targetObject = stub;
    }
  }

  /** 释放拖尾资源。 */
  dispose(): void {
    this.trail?.deactivate();
    this.trail?.material.dispose();
    this.trail?.geometry.dispose();
  }
}
