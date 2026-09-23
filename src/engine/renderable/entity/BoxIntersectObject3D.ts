/**
 * BoxIntersectObject3D — 带 AABB 盒体的可拾取 Object3D。
 *
 * 扩展 THREE.Object3D；raycast 时把射线变换到父空间，与以本对象
 * position 为中心、boxSize 为尺寸的 Box3 求交，命中则把中心变换回
 * 世界空间并 push 到 intersects。
 *
 * 由 engine/renderable/entity/BoxIntersectObject3D.ts.js 重写为 TS（行为完全一致）。
 * 两个文件并存期间，本文件才是修改目标：tools/repack.mjs 打包时优先
 * 采用 .ts 模块的编译产物。
 */

/* eslint-disable @typescript-eslint/no-explicit-any */

// 模块级复用 scratch（与孪生一致，避免每次 raycast 分配）
const _ray = new THREE.Ray();
const _matrix = new THREE.Matrix4();
const _box = new THREE.Box3();
const _center = new THREE.Vector3();

/**
 * 用本地 AABB 盒参与射线检测的 Object3D。
 */
export class BoxIntersectObject3D extends THREE.Object3D {
  /** 盒体尺寸（以自身 position 为中心）。 */
  boxSize: any;

  /**
   * @param boxSize - 盒体尺寸（Vector3）
   */
  constructor(boxSize: any) {
    super();
    this.boxSize = boxSize;
  }

  /**
   * 射线检测：父空间盒体求交。
   * @param raycaster - 射线检测器
   * @param intersects - 命中结果数组（push）
   */
  raycast(raycaster: any, intersects: any[]): void {
    if (!this.parent) return;
    // 把射线变换到父对象局部空间
    _matrix.getInverse(this.parent.matrixWorld);
    _ray.copy(raycaster.ray).applyMatrix4(_matrix);
    _center.copy(this.position);

    const box = _box.setFromCenterAndSize(_center, this.boxSize);
    if (_ray.intersectsBox(box)) {
      const hit = new THREE.Vector3();
      box.getCenter(hit);
      // 中心变换回世界空间
      hit.applyMatrix4(this.parent.matrixWorld);
      intersects.push({
        distance: raycaster.ray.origin.distanceTo(hit),
        point: hit,
        object: this,
      });
    }
  }
}
