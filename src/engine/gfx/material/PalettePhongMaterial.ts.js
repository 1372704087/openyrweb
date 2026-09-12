// === Reconstructed SystemJS module: engine/gfx/material/PalettePhongMaterial ===
// deps: ["engine/gfx/material/paletteShaderLib"]
// Note: variable/type names are minified approximations of the original TypeScript.

System.register("engine/gfx/material/PalettePhongMaterial", ["engine/gfx/material/paletteShaderLib"], function (e, t) {
  "use strict";
  var i, a, r;
  t && t.id;
  return {
    setters: [
      function (e) {
        i = e;
      },
    ],
    execute: function () {
      ((a = {
        uniforms: THREE.UniformsUtils.merge([THREE.ShaderLib.phong.uniforms, i.paletteShaderLib.uniforms]),
        vertexShader: THREE.ShaderChunk.meshphong_vert
          .replace("#include <common>", "#include <common>\n" + i.paletteShaderLib.instanceParsVertex)
          .replace("void main() {", "void main() {\n" + i.paletteShaderLib.instanceVertex),
        fragmentShader: THREE.ShaderChunk.meshphong_frag
          .replace(
            "#include <common>",
            "#include <common>\n" + i.paletteShaderLib.paletteColorParsFrag + "\n" + i.paletteShaderLib.vplParsFrag,
          )
          .replace("#include <color_fragment>", "#include <color_fragment>\n" + i.paletteShaderLib.paletteColorFrag)
          // 先注 paletteFullLightFragment（非 VPL 基路径的唯一照明源：用场景方向光的 N·L 乘材质 extraLight），
          // 再注 paletteVplFragment。VPL 开启时 paletteVplFragment 会把 reflectedLight 清零并令
          // totalEmissiveRadiance=vplColor，从而覆盖 paletteFullLightFragment 的结果；VPL 关闭时
          // 走 paletteFullLightFragment 保住原版实时光照外观。
          .replace(
            "#include <lights_fragment_end>",
            "#include <lights_fragment_end>\n" +
              i.paletteShaderLib.paletteFullLightFragment +
              "\n" +
              i.paletteShaderLib.paletteVplFragment,
          ),
      }),
        (r = class extends THREE.MeshPhongMaterial {
          get palette() {
            return this.uniforms.palette.value;
          }
          set palette(e) {
            this.uniforms.palette.value = e;
          }
          get paletteOffset() {
            return this.uniforms.paletteOffsetCount.value[0];
          }
          set paletteOffset(e) {
            this.uniforms.paletteOffsetCount.value[0] = e;
          }
          get paletteCount() {
            return this.uniforms.paletteOffsetCount.value[1];
          }
          set paletteCount(e) {
            this.uniforms.paletteOffsetCount.value[1] = e;
          }
          get extraLight() {
            return this.uniforms?.extraLight.value;
          }
          set extraLight(e) {
            this.uniforms.extraLight.value = e;
          }
          get vpl() {
            return this.uniforms.vplTexture.value;
          }
          set vpl(e) {
            this.uniforms.vplTexture.value = e;
          }
          get vplEnabled() {
            return this.uniforms.vplEnabled.value;
          }
          set vplEnabled(e) {
            this.uniforms.vplEnabled.value = e;
          }
          get lightDir() {
            return this.uniforms.vplLightDir.value;
          }
          set lightDir(e) {
            this.uniforms.vplLightDir.value = e;
          }
          constructor({ palette: e, paletteCount: t, paletteOffset: n, extraLight: r, vpl: s, vplEnabled: o, lightDir: p, ...l } = {}) {
            (super(l),
              (this.uniforms = THREE.UniformsUtils.clone(a.uniforms)),
              e && (this.palette = e),
              t && (this.paletteCount = t),
              n && (this.paletteOffset = n),
              r && this.extraLight.copy(r),
              p ? this.lightDir.copy(p) : i.paletteShaderLib.vplLightDir && this.lightDir.copy(i.paletteShaderLib.vplLightDir),
              s ? (this.vpl = s) : i.paletteShaderLib.vplTexture && (this.vpl = i.paletteShaderLib.vplTexture),
              (this.vplEnabled = void 0 === o ? !!i.paletteShaderLib.vplTexture : o),
              (this.vertexShader = a.vertexShader),
              (this.fragmentShader = a.fragmentShader),
              (this.type = "PalettePhongMaterial"));
          }
          copy(e) {
            return (
              super.copy(e),
              (this.fragmentShader = e.fragmentShader),
              (this.vertexShader = e.vertexShader),
              (this.uniforms = THREE.UniformsUtils.clone(e.uniforms)),
              (this.palette = e.palette),
              this
            );
          }
        }),
        e("PalettePhongMaterial", r));
    },
  };
});
