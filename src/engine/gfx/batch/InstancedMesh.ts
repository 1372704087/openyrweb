/**
 * InstancedMesh — 实例化 Mesh（InstancedBufferGeometry 属性 + 矩阵脏检查上传）。
 * 模块级共享 customDepthMaterial / customDistanceMaterial。
 *
 * 由 engine/gfx/batch/InstancedMesh.ts.js 重写为 TS（行为完全一致）。两个
 * 文件并存期间，本文件才是修改目标：tools/repack.mjs 打包时优先采用
 * .ts 模块的编译产物。
 *
 * 两个文件并存期间，本文件才是修改目标：tools/repack.mjs 打包时优先采用 .ts 模块的编译产物。
 */

declare const THREE: any;

/* eslint-disable @typescript-eslint/no-explicit-any */

/** 共享 depth 材质（RGBADepthPacking + INSTANCE_TRANSFORM）。 */
const sharedDepthMaterial = new THREE.MeshDepthMaterial();
sharedDepthMaterial.depthPacking = THREE.RGBADepthPacking;
sharedDepthMaterial.clipping = true;
sharedDepthMaterial.defines = { INSTANCE_TRANSFORM: "" };

/** 共享 distance 材质（ShaderLib.distanceRGBA 克隆）。 */
const distanceShader = THREE.ShaderLib.distanceRGBA;
const distanceUniforms = THREE.UniformsUtils.clone(distanceShader.uniforms);
const distanceDefines = { USE_SHADOWMAP: "", INSTANCE_TRANSFORM: "" };
const sharedDistanceMaterial = new THREE.ShaderMaterial({
  defines: distanceDefines,
  uniforms: distanceUniforms,
  vertexShader: distanceShader.vertexShader,
  fragmentShader: distanceShader.fragmentShader,
  clipping: true,
});

/** InstancedMesh。 */
export class InstancedMesh extends THREE.Mesh {
  maxInstances: number;
  uniformScale: boolean;
  useInstanceColor: boolean;
  instanceMatrixAttributes: any[];
  private _matCacheSize?: number;
  private _matCache?: Float32Array;
  private _matMesh?: any[];
  private _matDirty?: boolean;

  constructor(
    geometry: any,
    material: any,
    maxInstances: number,
    uniformScale: boolean,
    useInstanceColor: boolean = false,
  ) {
    super(new THREE.InstancedBufferGeometry().copy(geometry));
    this.maxInstances = maxInstances;
    this.uniformScale = uniformScale;
    this.useInstanceColor = useInstanceColor;
    this.initAttributes(this.geometry);
    this.material = this.decorateMaterial(material.clone());
    this.frustumCulled = false;
    this.customDepthMaterial = sharedDepthMaterial;
    this.customDistanceMaterial = sharedDistanceMaterial;
  }

  /** 挂 instanceMatrix0..3 + 可选 instanceColor + instanceOpacity 属性。 */
  private initAttributes(geometry: any): void {
    const specs: any[] = [];
    for (let i = 0; i < 4; i++) {
      specs.push({
        name: "instanceMatrix" + i,
        data: new Float32Array(4 * this.maxInstances),
        itemSize: 4,
        normalized: true,
      });
    }
    if (this.useInstanceColor) {
      specs.push({
        name: "instanceColor",
        data: new Uint8Array(3 * this.maxInstances),
        itemSize: 3,
        normalized: true,
      });
    }
    specs.push({
      name: "instanceOpacity",
      data: new Float32Array(this.maxInstances).fill(1),
      itemSize: 1,
      normalized: true,
    });
    for (const { name, data, itemSize, normalized } of specs) {
      const attr = new THREE.InstancedBufferAttribute(data, itemSize, normalized, 1);
      (attr as any).dynamic = true;
      geometry.addAttribute(name, attr);
    }
    this.instanceMatrixAttributes = new Array(4)
      .fill(0)
      .map((_, i) => geometry.getAttribute("instanceMatrix" + i));
  }

  /** 注入 INSTANCE_* defines 到克隆材质。 */
  private decorateMaterial(material: any): any {
    const m = material;
    if (m.defines == null) m.defines = {};
    m.defines.INSTANCE_TRANSFORM = "";
    if (this.uniformScale) m.defines.INSTANCE_UNIFORM = "";
    else delete m.defines.INSTANCE_UNIFORM;
    if (this.useInstanceColor) m.defines.INSTANCE_COLOR = "";
    else delete m.defines.INSTANCE_COLOR;
    m.defines.INSTANCE_OPACITY = "";
    return material;
  }

  setRenderCount(count: number): void {
    if (count > this.maxInstances) throw new RangeError("Exceeded maximum number of instances");
    this.geometry.maxInstancedCount = count;
  }

  /** 按 Matrix4.elements 写 4 个 instanceMatrixN 分量。 */
  setMatrixAt(index: number, matrix: any): void {
    for (let r = 0; r < 4; r++) {
      const base = 4 * r;
      this.instanceMatrixAttributes[r].setXYZW(
        index,
        matrix.elements[base],
        matrix.elements[base + 1],
        matrix.elements[base + 2],
        matrix.elements[base + 3],
      );
    }
  }

  /**
   * 从源 mesh 数组同步实例矩阵/opacity/palette/extraLight/lightDir。
   * 矩阵用 Float32 缓存 + fround 脏检查，避免无谓 GPU 上传。
   */
  updateFromMeshes(meshes: any[]): void {
    const hasPalette = !!meshes[0].material.palette;
    const attrs = this.geometry.attributes;
    const opacityAttr = attrs.instanceOpacity;
    const paletteAttr = attrs.instancePaletteOffset;
    const extraAttr = attrs.instanceExtraLight;
    const lightDirAttr = attrs.instanceLightDir;

    if (this._matCacheSize !== this.maxInstances) {
      this._matCacheSize = this.maxInstances;
      this._matCache = new Float32Array(16 * this.maxInstances);
      this._matMesh = new Array(this.maxInstances);
    }
    this._matDirty = false;

    for (let i = 0, len = meshes.length; i < len; i++) {
      const mesh = meshes[i];
      const mw = mesh.matrixWorld;
      const base = 16 * i;
      let changed = mesh !== this._matMesh![i];
      if (!changed) {
        for (let k = 0; k < 16; k++) {
          if (Math.fround(mw.elements[k]) !== this._matCache![base + k]) {
            changed = true;
            break;
          }
        }
      }
      if (changed) {
        this.setMatrixAt(i, mw);
        this._matMesh![i] = mesh;
        this._matDirty = true;
        for (let k = 0; k < 16; k++) this._matCache![base + k] = mw.elements[k];
      }

      const opacity = mesh.getOpacity();
      if (opacityAttr.getX(i) !== opacity) {
        opacityAttr.setX(i, opacity);
        opacityAttr.needsUpdate = true;
      }
      if (hasPalette) {
        const paletteIndex = mesh.getPaletteIndex();
        if (paletteAttr.getX(i) !== paletteIndex) {
          paletteAttr.setX(i, paletteIndex);
          paletteAttr.needsUpdate = true;
        }
        const extra = mesh.getExtraLight();
        const ex = Math.fround(extra.x);
        const ey = Math.fround(extra.y);
        const ez = Math.fround(extra.z);
        if (
          ex !== extraAttr.getX(i) ||
          ey !== extraAttr.getY(i) ||
          ez !== extraAttr.getZ(i)
        ) {
          extraAttr.setXYZ(i, ex, ey, ez);
          extraAttr.needsUpdate = true;
        }
        if (lightDirAttr) {
          const ld = mesh.getLightDir();
          lightDirAttr.setX(i, Math.fround(ld.x));
          lightDirAttr.setY(i, Math.fround(ld.y));
          lightDirAttr.setZ(i, Math.fround(ld.z));
          lightDirAttr.needsUpdate = true;
        }
      }
    }
    this.setRenderCount(meshes.length);
    if (this._matDirty) {
      for (const attr of this.instanceMatrixAttributes) attr.needsUpdate = true;
    }
  }

  dispose(): void {
    this.geometry.dispose();
    this.material.dispose();
  }
}
