/**
 * VxlBuilder — VXL 基类：构建 Object3D 根 + 旋转子架 + 各 section mesh。
 *
 * 由 engine/renderable/builder/VxlBuilder.ts.js 重写为 TS（行为完全一致）。
 * 两个文件并存期间，本文件才是修改目标：tools/repack.mjs 打包时优先
 * 采用 .ts 模块的编译产物。
 */
import * as CoordsModule from "game/Coords"; // 孪生

const Coords = (CoordsModule as any).Coords as any;

declare const THREE: any;

/**
 * VXL 构建器基类。
 * build() 缓存 object；按相机 yaw 与 ISO_WORLD_SCALE 统一缩放；
 * 子架做 X=-π/2、Z=+π/2 旋转；首个 section 推导 localBoundingBox（XY 交换）。
 */
export class VxlBuilder {
  protected object?: any;
  protected sections?: Map<string, any>;
  protected localBoundingBox?: any;

  constructor(protected camera: any) {
    this.camera = camera;
  }

  /**
   * 构建（幂等）：返回根 Object3D。
   * 子类需实现 createVxlMeshes()。
   */
  build(): any {
    if (this.object) return this.object;
    const e = (this.object = new THREE.Object3D());
    const i = Math.cos(this.camera.rotation.y) * Coords.ISO_WORLD_SCALE;
    e.scale.set(i, i, i);
    const r = new THREE.Object3D();
    (r.rotation.x = -Math.PI / 2),
      (r.rotation.z = +Math.PI / 2),
      (r.matrixAutoUpdate = false),
      r.updateMatrix(),
      e.add(r);
    const t = (this.sections = this.createVxlMeshes());
    t.forEach((mesh) => {
      (mesh.matrixAutoUpdate = false, r.add(mesh));
      if (!this.localBoundingBox) {
        if (!mesh.geometry.boundingBox) mesh.geometry.computeBoundingBox();
        this.localBoundingBox = new THREE.Box3(
          mesh.geometry.boundingBox.min.clone().multiplyScalar(i),
          mesh.geometry.boundingBox.max.clone().multiplyScalar(i),
        );
        // XY 交换（体素局部 → 世界）
        const tmp = this.localBoundingBox.min.x;
        (this.localBoundingBox.min.x = this.localBoundingBox.min.y),
          (this.localBoundingBox.min.y = tmp);
        const tmpMax = this.localBoundingBox.max.x;
        (this.localBoundingBox.max.x = this.localBoundingBox.max.y),
          (this.localBoundingBox.max.y = tmpMax);
      }
    });
    (e.matrixAutoUpdate = false, e.updateMatrix());
    return e;
  }

  /**
   * 按 section 名取 mesh（须先 build）。
   * @param e - section 名
   */
  getSection(e: string): any {
    if (!this.sections) throw new Error("Vxl object must be built first");
    return this.sections.get(e);
  }

  /** 读取局部包围盒（须先 build）。 */
  getLocalBoundingBox(): any {
    return this.localBoundingBox;
  }

  /** 子类：创建各 section mesh 映射。 */
  protected createVxlMeshes(): Map<string, any> {
    throw new Error("Not implemented");
  }
}
