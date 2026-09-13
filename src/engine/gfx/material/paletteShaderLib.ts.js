// === Reconstructed SystemJS module: engine/gfx/material/paletteShaderLib ===
// deps: []
// Note: variable/type names are minified approximations of the original TypeScript.

System.register("engine/gfx/material/paletteShaderLib", [], function (e, t) {
  "use strict";
  t && t.id;
  return {
    setters: [],
    execute: function () {
      e("paletteShaderLib", {
        // VPL 光照表（voxels.vpl → 256×256 纹理）。模块级字段由 GameRes.loadVpl 填充，
        // PalettePhongMaterial 构造时兜底读取，使 VXL 材质自动获得 VPL 查表光照。
        vplTexture: null,
        vplEnabled: !1,
        uniforms: {
          palette: { type: "t", value: null },
          paletteOffsetCount: { value: [0, 1] },
          extraLight: { value: new THREE.Vector3(0, 0, 0) },
          vplTexture: { type: "t", value: null },
          vplEnabled: { value: !1 },
          vplLightDir: { value: new THREE.Vector3(-1, 0, 0) }, // facing0 体素光 Rz(-45°)·(-0.707,-0.707,0)=(-1,0,0)
        },
        instanceParsVertex: `
#ifdef INSTANCE_TRANSFORM
    attribute float instancePaletteOffset;
    varying float vInstancePaletteOffset;
    attribute vec3 instanceExtraLight;
    varying vec3 vInstanceExtraLight;
    attribute vec3 instanceLightDir;
    varying vec3 vInstanceLightDir;
#endif
// VPL 光照用体素空间原始法线（对齐 vera20k vxl_normals.rs：normal=法线表[normalIndex]，不随 modelMatrix 变换）。
varying vec3 vVplWorldNormal;
`,
        instanceVertex: `
  #ifdef INSTANCE_TRANSFORM
    vInstancePaletteOffset = instancePaletteOffset;
    vInstanceExtraLight = instanceExtraLight;
    vInstanceLightDir = instanceLightDir;
  #endif
  // 原始法线（voxel 空间），对齐 vera20k：光照在体素空间计算，光方向随 facing 旋转。
  vVplWorldNormal = normalize(normal);
`,
        paletteColorParsVertex: `
#ifdef VERTEX_PALETTE_OFFSET
    attribute float vertexPaletteOffset;
    varying float vVertexPaletteOffset;
#endif
`,
        paletteColorVertex: `
  #ifdef VERTEX_PALETTE_OFFSET
    vVertexPaletteOffset = vertexPaletteOffset;
  #endif
`,
        paletteColorParsFrag: `
uniform sampler2D palette;
#ifdef VERTEX_PALETTE_OFFSET
    varying float vVertexPaletteOffset;
#endif
uniform vec2 paletteOffsetCount;
uniform vec3 extraLight;

#ifdef INSTANCE_TRANSFORM
varying float vInstancePaletteOffset;
varying vec3 vInstanceExtraLight;
varying vec3 vInstanceLightDir;
#endif
`,
        vplParsFrag: `
uniform sampler2D vplTexture;
uniform bool vplEnabled;
uniform vec3 vplLightDir;   // 非实例回退：默认 facing0 的体素光 (-1,0,0)；实例路径用 instanceLightDir
varying vec3 vVplWorldNormal;
`,
        paletteColorFrag: `
  float paletteColorIndex;

  #ifdef USE_MAP
  paletteColorIndex = texelColor.a;
  #endif

  #ifdef USE_COLOR
  paletteColorIndex = vColor.r;
  #endif

  float paletteSampleX = (paletteColorIndex * 255.0 + 0.5) / 256.0;

  #ifdef INSTANCE_TRANSFORM
  diffuseColor = texture2D(palette, vec2(paletteSampleX, (vInstancePaletteOffset + 0.5) / paletteOffsetCount.y));
  #elif defined(VERTEX_PALETTE_OFFSET)
  diffuseColor = texture2D(palette, vec2(paletteSampleX, (vVertexPaletteOffset + 0.5) / paletteOffsetCount.y));
  #else
  diffuseColor = texture2D(palette, vec2(paletteSampleX, (paletteOffsetCount.x + 0.5) / paletteOffsetCount.y));
  #endif

  #ifdef INSTANCE_OPACITY
  diffuseColor.a *= vInstanceOpacity * opacity;
  #else
  diffuseColor.a *= opacity;
  #endif
  diffuseColor = clamp(diffuseColor, 0.0, 1.0);
`,
        paletteBasicLightFragment: `
  #ifdef INSTANCE_TRANSFORM
  diffuseColor.rgb += vInstanceExtraLight.rgb * diffuseColor.rgb;
  #else
  diffuseColor.rgb += extraLight.rgb * diffuseColor.rgb;
  #endif

  diffuseColor = clamp(diffuseColor, 0.0, 1.0);
`,
        paletteFullLightFragment: `
  #ifdef INSTANCE_TRANSFORM
  vec3 extraIrradiance = vInstanceExtraLight.rgb;
  #else
  vec3 extraIrradiance = extraLight.rgb;
  #endif

  #if ( NUM_DIR_LIGHTS > 0 ) && defined( RE_Direct )
    #pragma unroll_loop
    for ( int i = 0; i < NUM_DIR_LIGHTS; i ++ ) {
      directionalLight = directionalLights[ i ];
      getDirectionalDirectLightIrradiance( directionalLight, geometry, directLight );

      directLight.color = extraIrradiance;
      RE_Direct( directLight, geometry, material, reflectedLight );
    }
  #endif

  #if defined( RE_IndirectDiffuse )
  RE_IndirectDiffuse( extraIrradiance, geometry, material, reflectedLight );
  #endif
`,
        paletteVplFragment: `
  if (vplEnabled) {
    // VPL 查表光照（对齐 vera20k vxl_normals.rs blinn_phong_pages）：
    //   light = Rz(facing-45°)·(-0.707,-0.707,0)（实例路径 per-unit，随 facing 旋转）
    //   halfway = normalize(light + viewS)，viewS=(0,0,1)，spec 用 Schlick S=3
    //   page = clamp((diffuse + specular) * 16, 0, 255)      ← 无 ambient！
    //   finalIdx = vpl[page*256 + colorIndex]（stale normal 253-255 → ambient page 16）
    //   N = 体素空间原始法线（法线表[normalIndex]），不随 modelMatrix 变换
    vec3 vplN = normalize(vVplWorldNormal);
  #ifdef INSTANCE_TRANSFORM
    vec3 vplL = normalize(vInstanceLightDir);
  #else
    vec3 vplL = normalize(vplLightDir);
  #endif
    vec3 vplV = vec3(0.0, 0.0, 1.0);
    vec3 vplH = normalize(vplL + vplV);
    float vplDiff = max(dot(vplN, vplL), 0.0);
    float vplHdn = dot(vplN, vplH);
    float vplSpec = vplHdn > 0.0 ? vplHdn / (3.0 - vplHdn * 3.0 + vplHdn) : 0.0;
    // 亮度：page 加环境光地板（对齐 C++ 参考 kAmbient）。vplAmbient 越高整体越亮、背光面越不黑。
    // 太亮就调低、太暗就调高。
    const float vplAmbient = 0.25;
    float vplPageF = (vplAmbient + vplDiff + vplSpec * 0.3) * 16.0;
  #ifdef USE_COLOR
    if (vColor.z * 255.0 >= 253.0) vplPageF = 16.0;
  #endif
    float vplPage = clamp(vplPageF, 0.0, 255.0);
    float vplIdx = texture2D(vplTexture, vec2((paletteColorIndex * 255.0 + 0.5) / 256.0, (vplPage + 0.5) / 256.0)).r * 255.0;
  #ifdef INSTANCE_TRANSFORM
    float vplPaletteRow = (vInstancePaletteOffset + 0.5) / paletteOffsetCount.y;
  #elif defined(VERTEX_PALETTE_OFFSET)
    float vplPaletteRow = (vVertexPaletteOffset + 0.5) / paletteOffsetCount.y;
  #else
    float vplPaletteRow = (paletteOffsetCount.x + 0.5) / paletteOffsetCount.y;
  #endif
    vec3 vplColor = texture2D(palette, vec2((vplIdx + 0.5) / 256.0, vplPaletteRow)).rgb;
  #ifdef INSTANCE_TRANSFORM
    // extraLight 明暗（修复：#38）。不用 per-instance 基准（会扰动实例化 attribute 布局致坦克变黑），
    // 改为以常量 vplBaseX ≈ 正常日照基准(≈0.37) 参照：factor = clamp(1+(当前-基准)*gain, floor, 2)。
    // 正常≈1（不破坏已调亮度）、extraLight 降低→暗化、升高→变亮，floor 兜底避免全黑。
    const float vplBaseX = 0.33;
    float vplDim = clamp(1.0 + (vInstanceExtraLight.x - vplBaseX) * 3.0, 0.2, 2.0);
    vplColor *= vplDim;
  #endif
    diffuseColor = vec4(vplColor, diffuseColor.a);
    reflectedLight.directDiffuse = vec3(0.0);
    reflectedLight.directSpecular = vec3(0.0);
    reflectedLight.indirectDiffuse = vec3(0.0);
    reflectedLight.indirectSpecular = vec3(0.0);
    totalEmissiveRadiance = vplColor;
  }
`,
        vertexColorMultParsVertex: `
#ifdef USE_VERTEX_COLOR_MULT
attribute vec4 vertexColorMult;
varying vec4 vVertexColorMult;
#endif
`,
        vertexColorMultVertex: `
  #ifdef USE_VERTEX_COLOR_MULT
  vVertexColorMult = vertexColorMult;
  #endif
`,
        vertexColorMultParsFrag: `
#ifdef USE_VERTEX_COLOR_MULT
varying vec4 vVertexColorMult;
#endif
`,
        vertexColorMultFrag: `
  #ifdef USE_VERTEX_COLOR_MULT
  diffuseColor.rgba *= vVertexColorMult.rgba;
  #endif
`,
      });
    },
  };
});
