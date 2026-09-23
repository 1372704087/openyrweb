/**
 * WorldScene — 世界场景容器（正交相机、光照、阴影质量、mesh 批量）。
 *
 * 由 engine/renderable/WorldScene.ts.js 重写为 TS（行为完全一致）。
 * 两个文件并存期间，本文件才是修改目标：tools/repack.mjs 打包时优先
 * 采用 .ts 模块的编译产物。
 */
import * as geometryModule from "util/geometry"; // 孪生
import * as RenderableContainerModule from "engine/gfx/RenderableContainer"; // 孪生
import * as CameraPanModule from "engine/renderable/CameraPan"; // 孪生
import * as CameraZoomModule from "engine/renderable/CameraZoom"; // 孪生
import * as LightingTypeModule from "engine/type/LightingType"; // 孪生
import * as CoordsModule from "game/Coords"; // 孪生
import * as eventModule from "util/event"; // 孪生
import * as ShadowQualityModule from "engine/renderable/entity/unit/ShadowQuality"; // 孪生
import * as MeshBatchManagerModule from "engine/gfx/batch/MeshBatchManager"; // 孪生

const pointEquals = (geometryModule as any).pointEquals as any;
const RenderableContainer = (RenderableContainerModule as any)
  .RenderableContainer as any;
const CameraPan = (CameraPanModule as any).CameraPan as any;
const CameraZoom = (CameraZoomModule as any).CameraZoom as any;
const LightingType = (LightingTypeModule as any).LightingType as any;
const Coords = (CoordsModule as any).Coords as any;
const EventDispatcher = (eventModule as any).EventDispatcher as any;
const ShadowQuality = (ShadowQualityModule as any).ShadowQuality as any;
const MeshBatchManager = (MeshBatchManagerModule as any)
  .MeshBatchManager as any;

declare const THREE: any;

/** 环境光相对强度（与孪生模块级 u 一致）。 */
const u = 0.8;
/** 远裁剪面倍数（× ISO_WORLD_SCALE）。 */
const d = 16000;
/** 阴影质量 → shadow map 分辨率倍率。 */
const g = new Map<any, number>([
  [ShadowQuality.High, 8],
  [ShadowQuality.Medium, 4],
  [ShadowQuality.Low, 2],
]);

/** 视口尺寸。 */
export interface Viewport {
  width: number;
  height: number;
}

/** 相机参数。 */
export interface CameraParams {
  alpha: number;
  beta: number;
  d: number;
  aspect: number;
  far: number;
}

/**
 * 世界场景：RenderableContainer 子类。
 * 持有 THREE.Scene + 正交相机 + 环境/方向光 + CameraPan/Zoom，
 * 每帧 updateCamera 并驱动 MeshBatchManager（相机静止时跳过重建）。
 */
export class WorldScene extends RenderableContainer {
  scene: any;
  camera: any;
  viewport: Viewport;
  cameraPan: any;
  cameraZoom: any;
  shadowQuality: any;

  private initialized = false;
  ambientLight: any;
  directionalLight: any;
  private _onBeforeCameraUpdate: any;
  private _onCameraUpdate: any;
  private lightFocusPoint?: { x: number; y: number };
  private shadowQualityListener?: () => void;
  private lastCameraPan?: { x: number; y: number };
  private lastCameraZoom?: number;
  private meshBatchManager?: any;

  /** 相机更新前事件。 */
  get onBeforeCameraUpdate(): any {
    return this._onBeforeCameraUpdate.asEvent();
  }

  /** 相机更新后事件。 */
  get onCameraUpdate(): any {
    return this._onCameraUpdate.asEvent();
  }

  /**
   * 工厂：创建 Scene/相机/Pan/Zoom 并返回 WorldScene。
   * @param e - 视口
   * @param t - freeCamera 开关
   * @param i - 阴影质量可观察量
   */
  static factory(e: Viewport, t: any, i: any): WorldScene {
    const r = new THREE.Scene();
    r.matrixAutoUpdate = false;
    const s = WorldScene.createCamera(e);
    const a = new CameraPan(t);
    const n = new CameraZoom(t);
    return new WorldScene(r, s, e, a, n, i);
  }

  /**
   * 由视口尺寸推导正交相机参数。
   * @param e - 视口
   */
  static getCameraParams(e: Viewport): CameraParams {
    const t = Coords.ISO_CAMERA_ALPHA;
    const i = Coords.ISO_CAMERA_BETA;
    const r = Coords.ISO_WORLD_SCALE;
    return {
      alpha: t,
      beta: i,
      d: (e.height / 2) * Coords.COS_ISO_CAMERA_BETA * r,
      aspect: e.width / e.height,
      far: d * r,
    };
  }

  /**
   * 创建并配置正交相机（YXZ 旋转）。
   * @param e - 视口
   */
  static createCamera(e: Viewport): any {
    const { alpha: t, beta: i, d: r, aspect: s, far: a } =
      WorldScene.getCameraParams(e);
    const n = new THREE.OrthographicCamera(
      -r * s,
      r * s,
      r,
      -r,
      0,
      a,
    );
    (n.rotation.order = "YXZ"), (n.rotation.y = +i), (n.rotation.x = -t);
    return n;
  }

  /**
   * @param scene - THREE.Scene
   * @param camera - 正交相机
   * @param viewport - 视口
   * @param cameraPan - 平移控制器
   * @param cameraZoom - 缩放控制器
   * @param shadowQuality - 阴影质量（含 value / onChange）
   */
  constructor(
    scene: any,
    camera: any,
    viewport: Viewport,
    cameraPan: any,
    cameraZoom: any,
    shadowQuality: any,
  ) {
    super(scene);
    (this.scene = scene),
      (this.camera = camera),
      (this.viewport = viewport),
      (this.cameraPan = cameraPan),
      (this.cameraZoom = cameraZoom),
      (this.shadowQuality = shadowQuality),
      (this.initialized = false),
      (this.ambientLight = new THREE.AmbientLight(0xffffff, u)),
      (this.directionalLight = new THREE.DirectionalLight(0xffffff, 1)),
      (this._onBeforeCameraUpdate = new EventDispatcher()),
      (this._onCameraUpdate = new EventDispatcher());
  }

  /**
   * 视口变化时更新相机投影范围。
   * @param e - 新视口
   */
  updateViewport(e: Viewport): void {
    this.viewport = e;
    const { d: t, aspect: i } = WorldScene.getCameraParams(e);
    const r = this.camera;
    (r.left = -t * i),
      (r.right = t * i),
      (r.top = t),
      (r.bottom = -t),
      r.updateProjectionMatrix();
  }

  /**
   * 按 pan 与 zoom 更新相机位置/投影。
   * 沿相机轴平移，再乘 viewport 归一化与 zoom。
   * @param e - pan 点
   * @param t - zoom
   */
  updateCamera(e: { x: number; y: number }, t: number): void {
    const i = this.camera;
    i.updateMatrix();
    const r = i.matrix.elements;
    const s = new THREE.Vector3();
    (i.position.set(0, 0, 0),
      i.translateZ(d * Coords.ISO_WORLD_SCALE),
      s.set(r[0], r[1], r[2]),
      s.multiplyScalar(
        (e.x * (i.right - i.left)) / this.viewport.width / i.zoom,
      ),
      i.position.add(s),
      s.set(r[4], r[5], r[6]),
      s.multiplyScalar(
        (-e.y * (i.top - i.bottom)) / this.viewport.height / i.zoom,
      ),
      i.position.add(s),
      (i.zoom = t),
      i.updateProjectionMatrix(),
      i.updateMatrixWorld(false));
  }

  /** 首次创建：灯光、坐标轴、相机入场景、MeshBatchManager。 */
  create3DObject(): void {
    super.create3DObject();
    if (this.initialized) return;
    (this.initialized = true,
      (this.scene.position.x -= 0.1 * Coords.ISO_WORLD_SCALE),
      (this.scene.position.z -= 0.1 * Coords.ISO_WORLD_SCALE),
      this.scene.updateMatrix());
    let t: any = new THREE.AxesHelper(Coords.LEPTONS_PER_TILE);
    (this.scene.add(t), this.scene.add(this.ambientLight));
    const e = this.directionalLight;
    (e.position.set(-87.012, 204.338, 195.409));
    if (this.lightFocusPoint) {
      (e.position.x += this.lightFocusPoint.x),
        (e.position.z += this.lightFocusPoint.y),
        e.target.position.set(
          this.lightFocusPoint.x,
          0,
          this.lightFocusPoint.y,
        ),
        e.target.updateMatrixWorld(void 0);
    }
    this.updateShadowQuality(e, this.shadowQuality.value);
    this.shadowQualityListener = () =>
      this.updateShadowQuality(e, this.shadowQuality.value);
    this.shadowQuality.onChange.subscribe(this.shadowQualityListener);
    (this.scene.add(e), this.scene.add(this.camera));
    t = this.meshBatchManager = new MeshBatchManager(this);
    (this.add(t), (this.scene.autoUpdate = false));
  }

  /**
   * 按阴影质量更新方向光 shadow camera / mapSize。
   * @param t - 方向光
   * @param i - 质量枚举值
   */
  updateShadowQuality(t: any, i: any): void {
    const r = i !== ShadowQuality.Off;
    t.castShadow = r;
    if (!r) return;
    const s0 = Coords.ISO_WORLD_SCALE;
    const range = 3500 * s0;
    const e = t.shadow.camera;
    (e.right = range),
      (e.left = -range),
      (e.top = range),
      (e.bottom = -range),
      (e.near = -4000 * s0),
      (e.far = 3000 * s0);
    const s = g.get(i);
    if (!s) throw new Error(`Unsupported shadow quality "${i}"`);
    (t.shadow.mapSize.width = 1024 * s), (t.shadow.mapSize.height = 1024 * s);
  }

  /**
   * 设置光照焦点（方向光 target 偏移）。
   * @param e - 世界 x
   * @param t - 世界 y
   */
  setLightFocusPoint(e: number, t: number): void {
    this.lightFocusPoint = { x: e, y: t };
  }

  /**
   * 标记 mesh 批次需要重建。
   * RenderableManager 在可渲染体增删时调用，避免每帧全量重建。
   */
  markBatchRebuild(): void {
    this.meshBatchManager?.markNeedsRebuild();
  }

  /**
   * 应用照明 tint 与强度到环境/方向光。
   * @param e - Lighting 实例
   */
  applyLighting(e: any): void {
    let t = e.computeTint(LightingType.Ambient);
    (this.ambientLight.color.setRGB(t.x, t.y, t.z),
      this.directionalLight.color.setRGB(t.x, t.y, t.z));
    t = e.getAmbientIntensity();
    (this.ambientLight.intensity = t * u),
      (this.directionalLight.intensity = t);
  }

  /**
   * 帧更新：pan/zoom 变化时 updateCamera 并强制批量重建。
   * @param e - 帧 delta
   * @param t - 时间戳
   */
  update(e: number, t: number): void {
    super.update(e, t);
    this._onBeforeCameraUpdate.dispatch(this, e);
    const i = this.cameraZoom.getZoom();
    const r = this.cameraPan.getPan();
    // 相机运动改变可见 mesh 集合 → 强制批量重建；静止则可复用缓存。
    const moved = !(pointEquals(r, this.lastCameraPan) &&
      this.lastCameraZoom === i);
    if (moved) {
      (this.updateCamera(r, i),
        (this.lastCameraZoom = i),
        (this.lastCameraPan = r));
    }
    (this._onCameraUpdate.dispatch(this, e),
      this.scene.updateMatrixWorld(false),
      this.meshBatchManager.updateMeshes(moved));
  }

  /** 释放：阴影监听、shadow map、批量管理器、灯光。 */
  dispose(): void {
    if (this.shadowQualityListener) {
      (this.shadowQuality.onChange.unsubscribe(this.shadowQualityListener),
        (this.shadowQualityListener = void 0));
    }
    this.directionalLight.shadow.map?.dispose();
    if (this.meshBatchManager) {
      (this.meshBatchManager.dispose(),
        this.remove(this.meshBatchManager),
        (this.meshBatchManager = void 0));
    }
    (this.scene.remove(this.ambientLight),
      this.scene.remove(this.directionalLight));
  }
}
