// === Reconstructed SystemJS module: engine/gfx/material/PaletteLambertMaterial ===
// deps: ["engine/gfx/material/paletteShaderLib"]
// Note: variable/type names are minified approximations of the original TypeScript.

System.register(
  "engine/gfx/material/PaletteLambertMaterial",
  ["engine/gfx/material/paletteShaderLib"],
  function (e, t) {
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
          uniforms: THREE.UniformsUtils.merge([THREE.ShaderLib.lambert.uniforms, i.paletteShaderLib.uniforms]),
          vertexShader: THREE.ShaderChunk.meshlambert_vert
            .replace("#include <common>", "#include <common>\n" + i.paletteShaderLib.instanceParsVertex)
            .replace("void main() {", "void main() {\n" + i.paletteShaderLib.instanceVertex),
          fragmentShader: THREE.ShaderChunk.meshlambert_frag
            .replace("#include <common>", "#include <common>\n" + i.paletteShaderLib.paletteColorParsFrag)
            .replace("#include <color_fragment>", "#include <color_fragment>\n" + i.paletteShaderLib.paletteColorFrag)
            .replace(
              "#include <lights_fragment_end>",
              "#include <lights_fragment_end>\n" + i.paletteShaderLib.paletteFullLightFragment,
            ),
        }),
          (r = class extends THREE.MeshLambertMaterial {
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
            constructor({ palette: e, paletteCount: t, paletteOffset: i, extraLight: r, ...s } = {}) {
              (super(s),
                (this.uniforms = THREE.UniformsUtils.clone(a.uniforms)),
                e && (this.palette = e),
                t && (this.paletteCount = t),
                i && (this.paletteOffset = i),
                r && this.extraLight.copy(r),
                (this.vertexShader = a.vertexShader),
                (this.fragmentShader = a.fragmentShader),
                (this.type = "PaletteLambertMaterial"));
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
          e("PaletteLambertMaterial", r));
      },
    };
  },
);
