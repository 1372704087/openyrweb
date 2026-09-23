/**
 * PalettePhongMaterial — 调色板 Phong 材质（含 VPL 查表光照注入）。
 *
 * 由 engine/gfx/material/PalettePhongMaterial.ts.js 重写为 TS（行为完全一致）。
 * 两个文件并存期间，本文件才是修改目标：tools/repack.mjs 打包时优先
 * 采用 .ts 模块的编译产物。
 */
import { paletteShaderLib } from "engine/gfx/material/paletteShaderLib"; // 已转换

declare const THREE: any;

/* eslint-disable @typescript-eslint/no-explicit-any */

/** 构造参数（调色板/VPL 字段剥离后传给 MeshPhongMaterial）。 */
export interface PalettePhongMaterialParams {
  palette?: any;
  paletteCount?: number;
  paletteOffset?: number;
  extraLight?: any;
  vpl?: any;
  vplEnabled?: boolean;
  lightDir?: any;
  [key: string]: any;
}

/** 预拼接的 uniforms + vertex/fragment 源。 */
const palettePhongShader = {
  uniforms: THREE.UniformsUtils.merge([THREE.ShaderLib.phong.uniforms, paletteShaderLib.uniforms]),
  vertexShader: THREE.ShaderChunk.meshphong_vert
    .replace("#include <common>", "#include <common>\n" + paletteShaderLib.instanceParsVertex)
    .replace("void main() {", "void main() {\n" + paletteShaderLib.instanceVertex),
  fragmentShader: THREE.ShaderChunk.meshphong_frag
    .replace(
      "#include <common>",
      "#include <common>\n" + paletteShaderLib.paletteColorParsFrag + "\n" + paletteShaderLib.vplParsFrag,
    )
    .replace("#include <color_fragment>", "#include <color_fragment>\n" + paletteShaderLib.paletteColorFrag)
    // 先注 paletteFullLightFragment（非 VPL 基路径的唯一照明源：用场景方向光的 N·L 乘材质 extraLight），
    // 再注 paletteVplFragment。VPL 开启时 paletteVplFragment 会把 reflectedLight 清零并令
    // totalEmissiveRadiance=vplColor，从而覆盖 paletteFullLightFragment 的结果；VPL 关闭时
    // 走 paletteFullLightFragment 保住原版实时光照外观。
    .replace(
      "#include <lights_fragment_end>",
      "#include <lights_fragment_end>\n" +
        paletteShaderLib.paletteFullLightFragment +
        "\n" +
        paletteShaderLib.paletteVplFragment,
    ),
};

/** PalettePhongMaterial。 */
export class PalettePhongMaterial extends THREE.MeshPhongMaterial {
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
  get vpl(): any {
    return this.uniforms.vplTexture.value;
  }
  set vpl(v: any) {
    this.uniforms.vplTexture.value = v;
  }
  get vplEnabled(): boolean {
    return this.uniforms.vplEnabled.value;
  }
  set vplEnabled(v: boolean) {
    this.uniforms.vplEnabled.value = v;
  }
  get lightDir(): any {
    return this.uniforms.vplLightDir.value;
  }
  set lightDir(v: any) {
    this.uniforms.vplLightDir.value = v;
  }

  constructor({
    palette,
    paletteCount,
    paletteOffset,
    extraLight,
    vpl,
    vplEnabled,
    lightDir,
    ...rest
  }: PalettePhongMaterialParams = {}) {
    super(rest);
    this.uniforms = THREE.UniformsUtils.clone(palettePhongShader.uniforms);
    if (palette) this.palette = palette;
    if (paletteCount) this.paletteCount = paletteCount;
    if (paletteOffset) this.paletteOffset = paletteOffset;
    if (extraLight) this.extraLight.copy(extraLight);
    if (lightDir) this.lightDir.copy(lightDir);
    else if (paletteShaderLib.vplLightDir) this.lightDir.copy(paletteShaderLib.vplLightDir);
    if (vpl) this.vpl = vpl;
    else if (paletteShaderLib.vplTexture) this.vpl = paletteShaderLib.vplTexture;
    this.vplEnabled = vplEnabled === undefined ? !!paletteShaderLib.vplTexture : vplEnabled;
    this.vertexShader = palettePhongShader.vertexShader;
    this.fragmentShader = palettePhongShader.fragmentShader;
    this.type = "PalettePhongMaterial";
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
