/**
 * PaletteLambertMaterial — 调色板 Lambert 材质（注入 paletteShaderLib 片段）。
 *
 * 由 engine/gfx/material/PaletteLambertMaterial.ts.js 重写为 TS（行为完全一致）。
 * 两个文件并存期间，本文件才是修改目标：tools/repack.mjs 打包时优先
 * 采用 .ts 模块的编译产物。
 */
import { paletteShaderLib } from "engine/gfx/material/paletteShaderLib"; // 已转换

declare const THREE: any;

/* eslint-disable @typescript-eslint/no-explicit-any */

/** 构造参数（调色板相关字段剥离后传给 MeshLambertMaterial）。 */
export interface PaletteLambertMaterialParams {
  palette?: any;
  paletteCount?: number;
  paletteOffset?: number;
  extraLight?: any;
  [key: string]: any;
}

/** 预拼接的 uniforms + vertex/fragment 源。 */
const paletteLambertShader = {
  uniforms: THREE.UniformsUtils.merge([THREE.ShaderLib.lambert.uniforms, paletteShaderLib.uniforms]),
  vertexShader: THREE.ShaderChunk.meshlambert_vert
    .replace("#include <common>", "#include <common>\n" + paletteShaderLib.instanceParsVertex)
    .replace("void main() {", "void main() {\n" + paletteShaderLib.instanceVertex),
  fragmentShader: THREE.ShaderChunk.meshlambert_frag
    .replace("#include <common>", "#include <common>\n" + paletteShaderLib.paletteColorParsFrag)
    .replace("#include <color_fragment>", "#include <color_fragment>\n" + paletteShaderLib.paletteColorFrag)
    .replace(
      "#include <lights_fragment_end>",
      "#include <lights_fragment_end>\n" + paletteShaderLib.paletteFullLightFragment,
    ),
};

/** PaletteLambertMaterial。 */
export class PaletteLambertMaterial extends THREE.MeshLambertMaterial {
  get palette(): any {
    return this.uniforms.palette.value;
  }
  set palette(v: any) {
    this.uniforms.palette.value = v;
  }
  get paletteOffset(): number {
    return this.uniforms.paletteOffsetCount.value[0];
  }
  set paletteOffset(v: number) {
    this.uniforms.paletteOffsetCount.value[0] = v;
  }
  get paletteCount(): number {
    return this.uniforms.paletteOffsetCount.value[1];
  }
  set paletteCount(v: number) {
    this.uniforms.paletteOffsetCount.value[1] = v;
  }
  get extraLight(): any {
    return this.uniforms?.extraLight.value;
  }
  set extraLight(v: any) {
    this.uniforms.extraLight.value = v;
  }

  constructor({ palette, paletteCount, paletteOffset, extraLight, ...rest }: PaletteLambertMaterialParams = {}) {
    super(rest);
    this.uniforms = THREE.UniformsUtils.clone(paletteLambertShader.uniforms);
    if (palette) this.palette = palette;
    if (paletteCount) this.paletteCount = paletteCount;
    if (paletteOffset) this.paletteOffset = paletteOffset;
    if (extraLight) this.extraLight.copy(extraLight);
    this.vertexShader = paletteLambertShader.vertexShader;
    this.fragmentShader = paletteLambertShader.fragmentShader;
    this.type = "PaletteLambertMaterial";
  }

  copy(source: any): this {
    super.copy(source);
    this.fragmentShader = source.fragmentShader;
    this.vertexShader = source.vertexShader;
    this.uniforms = THREE.UniformsUtils.clone(source.uniforms);
    this.palette = source.palette;
    return this;
  }
}
