/**
 * PaletteBasicMaterial — 调色板 Basic 材质（注入 paletteShaderLib 片段）。
 *
 * 由 engine/gfx/material/PaletteBasicMaterial.ts.js 重写为 TS（行为完全一致）。
 * 两个文件并存期间，本文件才是修改目标：tools/repack.mjs 打包时优先
 * 采用 .ts 模块的编译产物。
 */
import { paletteShaderLib } from "engine/gfx/material/paletteShaderLib"; // 已转换

declare const THREE: any;

/* eslint-disable @typescript-eslint/no-explicit-any */

/** 构造参数（调色板相关字段剥离后传给 MeshBasicMaterial）。 */
export interface PaletteBasicMaterialParams {
  palette?: any;
  paletteCount?: number;
  paletteOffset?: number;
  extraLight?: any;
  useVertexColorMult?: boolean;
  [key: string]: any;
}

/** 预拼接的 uniforms + vertex/fragment 源。 */
const paletteBasicShader = {
  uniforms: THREE.UniformsUtils.merge([THREE.ShaderLib.basic.uniforms, paletteShaderLib.uniforms]),
  vertexShader: THREE.ShaderChunk.meshbasic_vert
    .replace(
      "#include <common>",
      "#include <common>\n" +
        [
          paletteShaderLib.instanceParsVertex,
          paletteShaderLib.paletteColorParsVertex,
          paletteShaderLib.vertexColorMultParsVertex,
        ].join("\n"),
    )
    .replace(
      "void main() {",
      "void main() {\n" +
        [paletteShaderLib.instanceVertex, paletteShaderLib.paletteColorVertex, paletteShaderLib.vertexColorMultVertex].join(
          "\n",
        ),
    ),
  fragmentShader: THREE.ShaderChunk.meshbasic_frag
    .replace(
      "#include <common>",
      "#include <common>\n" + [paletteShaderLib.paletteColorParsFrag, paletteShaderLib.vertexColorMultParsFrag].join("\n"),
    )
    .replace(
      "#include <color_fragment>",
      "#include <color_fragment>\n" +
        [paletteShaderLib.paletteColorFrag, paletteShaderLib.paletteBasicLightFragment, paletteShaderLib.vertexColorMultFrag].join(
          "\n",
        ),
    ),
};

/** PaletteBasicMaterial。 */
export class PaletteBasicMaterial extends THREE.MeshBasicMaterial {
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
    return this.uniforms.extraLight.value;
  }
  set extraLight(v: any) {
    this.uniforms.extraLight.value = v;
  }
  set useVertexColorMult(v: boolean) {
    if (v) {
      if (this.defines == null) this.defines = {};
      this.defines.USE_VERTEX_COLOR_MULT = "";
    } else if (this.defines) {
      delete this.defines.USE_VERTEX_COLOR_MULT;
    }
  }

  constructor({
    palette,
    paletteCount,
    paletteOffset,
    extraLight,
    useVertexColorMult,
    ...rest
  }: PaletteBasicMaterialParams = {}) {
    super(rest);
    this.uniforms = THREE.UniformsUtils.clone(paletteBasicShader.uniforms);
    if (palette) this.palette = palette;
    if (paletteCount) this.paletteCount = paletteCount;
    if (paletteOffset) this.paletteOffset = paletteOffset;
    if (extraLight) this.extraLight.copy(extraLight);
    if (useVertexColorMult) this.useVertexColorMult = useVertexColorMult;
    this.vertexShader = paletteBasicShader.vertexShader;
    this.fragmentShader = paletteBasicShader.fragmentShader;
    this.type = "PaletteBasicMaterial";
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
