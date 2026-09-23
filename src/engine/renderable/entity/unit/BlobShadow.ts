/**
 * BlobShadow — 单位脚下椭圆/圆形贴地阴影（Mesh 或 BatchedMesh）。
 *
 * 按 radius 缓存 CircleBufferGeometry；update 在 Air 或 Paradrop 时显示，
 * 并按 tile 高度/桥下高度写 y。几何共享，材质全局半透明黑。
 *
 * 由 engine/renderable/entity/unit/BlobShadow.ts.js 重写为 TS（行为完全一致）。
 * 两个文件并存期间，本文件才是修改目标：tools/repack.mjs 打包时优先采用 .ts 模块的编译产物。
 */
import { Coords } from "game/Coords"; // 已转换
import { ZoneType } from "game/gameobject/unit/ZoneType"; // 已转换
import { StanceType } from "game/gameobject/infantry/StanceType"; // 已转换
import * as BatchedMeshModule from "engine/gfx/batch/BatchedMesh"; // 孪生

// 孪生 any-shim：未转换模块的具名导出不可用，取命名空间成员
const BatchedMesh: any = (BatchedMeshModule as any).BatchedMesh;

/* eslint-disable @typescript-eslint/no-explicit-any */

/** 贴地圆形阴影。 */
export class BlobShadow {
  /** 半径缓存 geometry。 */
  private static geometries: Map<number, any> = new Map();
  /** 全局半透明黑材质。 */
  private static mat: any = new (THREE as any).MeshBasicMaterial({
    color: 0,
    transparent: true,
    opacity: 0.5,
    alphaTest: 0,
  });

  /** 所属单位。 */
  gameObject: any;
  /** 阴影半径。 */
  radius: number;
  /** 是否用 BatchedMesh。 */
  useMeshInstancing: boolean;
  /** 3D 网格。 */
  obj?: any;
  /** 上帧 tile.z。 */
  lastTileZ?: number;
  /** 上帧地面抬升。 */
  lastTileElevation?: number;
  /** 上帧是否桥下。 */
  lastBridgeBelow?: boolean;

  /**
   * @param gameObject - 单位
   * @param radius - 半径
   * @param useMeshInstancing - 批处理开关
   */
  constructor(gameObject: any, radius: number, useMeshInstancing: boolean) {
    this.gameObject = gameObject;
    this.radius = radius;
    this.useMeshInstancing = useMeshInstancing;
  }

  /** 取 3D 对象。 */
  get3DObject(): any {
    return this.obj;
  }

  /** 惰性创建阴影网格。 */
  create3DObject(): void {
    if (!this.obj) {
      let geo = BlobShadow.geometries.get(this.radius);
      if (!geo) {
        geo = new (THREE as any).CircleBufferGeometry(this.radius * Coords.ISO_WORLD_SCALE);
        BlobShadow.geometries.set(this.radius, geo);
      }
      this.obj = new (this.useMeshInstancing ? BatchedMesh : (THREE as any).Mesh)(geo, BlobShadow.mat);
      this.obj.rotation.x = -Math.PI / 2;
      this.obj.matrixAutoUpdate = false;
    }
  }

  /** 每帧：可见性与桥下高度同步。 */
  update(_tick?: number, _frame?: number): void {
    const obj = this.obj;
    const visible =
      this.gameObject.zone === ZoneType.Air ||
      (this.gameObject.isInfantry() && this.gameObject.stance === StanceType.Paradrop);
    obj.visible = visible;
    if (visible) {
      const z = this.gameObject.tile.z;
      const elev = this.gameObject.tileElevation;
      const bridge = !!this.gameObject.tile.onBridgeLandType;
      if (z !== this.lastTileZ || elev !== this.lastTileElevation || bridge !== this.lastBridgeBelow) {
        this.lastTileZ = z;
        this.lastTileElevation = elev;
        this.lastBridgeBelow = bridge;
        const bridgeBelow = this.gameObject.position.getBridgeBelow();
        obj.position.y =
          Coords.tileHeightToWorld(-elev) +
          (bridgeBelow ? Coords.tileHeightToWorld(bridgeBelow.tileElevation) + 0.01 * Coords.ISO_WORLD_SCALE : 0);
        obj.updateMatrix();
      }
    }
  }

  /** 无资源需释放（geometry 材质为静态缓存）。 */
  dispose(): void {}
}
