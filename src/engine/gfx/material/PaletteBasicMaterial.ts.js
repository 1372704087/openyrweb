// === Reconstructed SystemJS module: engine/gfx/material/PaletteBasicMaterial ===
// deps: ["engine/gfx/material/paletteShaderLib"]
// Note: variable/type names are minified approximations of the original TypeScript.

System.register("engine/gfx/material/PaletteBasicMaterial", ["engine/gfx/material/paletteShaderLib"], function (e, t) {
  "use strict";
  var i, n, r;
  t && t.id;
  return {
    setters: [
      function (e) {
        i = e;
      },
    ],
    execute: function () {
      ((n = {
        uniforms: THREE.UniformsUtils.merge([THREE.ShaderLib.basic.uniforms, i.paletteShaderLib.uniforms]),
        vertexShader: THREE.ShaderChunk.meshbasic_vert
          .replace(
            "#include <common>",
            "#include <common>\n" +
              [
                i.paletteShaderLib.instanceParsVertex,
                i.paletteShaderLib.paletteColorParsVertex,
                i.paletteShaderLib.vertexColorMultParsVertex,
              ].join("\n"),
          )
          .replace(
            "void main() {",
            "void main() {\n" +
              [
                i.paletteShaderLib.instanceVertex,
                i.paletteShaderLib.paletteColorVertex,
                i.paletteShaderLib.vertexColorMultVertex,
              ].join("\n"),
          ),
        fragmentShader: THREE.ShaderChunk.meshbasic_frag
          .replace(
            "#include <common>",
            "#include <common>\n" +
              [i.paletteShaderLib.paletteColorParsFrag, i.paletteShaderLib.vertexColorMultParsFrag].join("\n"),
          )
          .replace(
            "#include <color_fragment>",
            "#include <color_fragment>\n" +
              [
                i.paletteShaderLib.paletteColorFrag,
                i.paletteShaderLib.paletteBasicLightFragment,
                i.paletteShaderLib.vertexColorMultFrag,
              ].join("\n"),
          ),
      }),
        (r = class extends THREE.MeshBasicMaterial {
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
            return this.uniforms.extraLight.value;
          }
          set extraLight(e) {
            this.uniforms.extraLight.value = e;
          }
          set useVertexColorMult(e) {
            e
              ? (this.defines ?? (this.defines = {}), (this.defines.USE_VERTEX_COLOR_MULT = ""))
              : this.defines && delete this.defines.USE_VERTEX_COLOR_MULT;
          }
          constructor({
            palette: e,
            paletteCount: t,
            paletteOffset: i,
            extraLight: r,
            useVertexColorMult: s,
            ...a
          } = {}) {
            (super(a),
              (this.uniforms = THREE.UniformsUtils.clone(n.uniforms)),
              e && (this.palette = e),
              t && (this.paletteCount = t),
              i && (this.paletteOffset = i),
              r && this.extraLight.copy(r),
              s && (this.useVertexColorMult = s),
              (this.vertexShader = n.vertexShader),
              (this.fragmentShader = n.fragmentShader),
              (this.type = "PaletteBasicMaterial"));
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
        e("PaletteBasicMaterial", r));
    },
  };
});
