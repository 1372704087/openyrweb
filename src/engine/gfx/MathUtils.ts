/**
 * MathUtils — 3D 对象旋转/朝相机平移的静态数学工具。
 *
 * 由 engine/gfx/MathUtils.ts.js 重写为 TS（行为完全一致）。两个文件
 * 并存期间，本文件才是修改目标：tools/repack.mjs 打包时优先采用 .ts
 * 模块的编译产物。
 *
 * 两个文件并存期间，本文件才是修改目标：tools/repack.mjs 打包时优先采用 .ts 模块的编译产物。
 */

declare const THREE: any;

/* eslint-disable @typescript-eslint/no-explicit-any */

/** 可被 rotateObjectAboutPoint 操作的 Object3D 最小形状。 */
export interface Object3DLike {
  position: any;
  parent?: any;
  rotateOnAxis(axis: any, angle: number): void;
}

/** MathUtils 静态工具类。 */
export class MathUtils {
  /**
   * 将 object 的 position 绕 point 沿 axis 旋转 angle（弧度），
   * 并同步自身朝向（rotateOnAxis）。
   * @param convertToWorldSpace 为 true 时先 localToWorld → 旋转 → worldToLocal。
   *   孪生默认参数 `s = !1`，但函数体写 `s = void 0 !== s && s`，故
   *   传 undefined 时按 false 处理（与默认一致）。
   */
  static rotateObjectAboutPoint(
    object: Object3DLike,
    point: any,
    axis: any,
    angle: number,
    convertToWorldSpace: boolean = false,
  ): void {
    const useWorld = (convertToWorldSpace = convertToWorldSpace !== undefined && convertToWorldSpace);
    // 孪生无 object.parent 守卫（缺父节点时抛错暴露绑定问题）
    if (useWorld) object.parent.localToWorld(object.position);
    object.position.sub(point);
    object.position.applyAxisAngle(axis, angle);
    object.position.add(point);
    if (useWorld) object.parent.worldToLocal(object.position);
    object.rotateOnAxis(axis, angle);
  }

  /**
   * 将 object 的朝向设为 camera 当前四元数，再沿 -Z（经 cos(yaw) 缩放）
   * 平移 distance，最后把自身欧拉角重置为 (0,0,0)。
   */
  static translateTowardsCamera(object: any, camera: { rotation: any }, distance: number): void {
    const q = new THREE.Quaternion().setFromEuler(camera.rotation);
    object.setRotationFromQuaternion(q);
    object.translateZ(distance * Math.cos(camera.rotation.y));
    object.setRotationFromEuler(new THREE.Euler(0, 0, 0));
  }
}
