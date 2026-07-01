// === Reconstructed SystemJS module: engine/renderable/entity/PipOverlay ===
// deps: ["engine/gfx/TextureAtlas","data/Bitmap","engine/gfx/SpriteUtils","game/Coords","engine/gfx/TextureUtils","game/gameobject/selection/SelectionLevel","game/type/PipColor","util/disposable/CompositeDisposable","engine/gfx/OverlayUtils","engine/renderable/fx/RallyPointFx","engine/renderable/entity/unit/FlyerHelperMode","game/gameobject/unit/ZoneType","engine/gfx/BufferGeometryUtils","engine/gfx/material/PaletteBasicMaterial","engine/gfx/batch/BatchedMesh","game/gameobject/unit/HealthLevel","engine/renderable/entity/unit/DebugLabel","engine/Engine","engine/EngineType","engine/renderable/entity/UnitCastBarSprite","engine/renderable/entity/SecureProgressSprite"]
// Note: variable/type names are minified approximations of the original TypeScript.

System.register(
  "engine/renderable/entity/PipOverlay",
  [
    "engine/gfx/TextureAtlas",
    "data/Bitmap",
    "engine/gfx/SpriteUtils",
    "game/Coords",
    "engine/gfx/TextureUtils",
    "game/gameobject/selection/SelectionLevel",
    "game/type/PipColor",
    "util/disposable/CompositeDisposable",
    "engine/gfx/OverlayUtils",
    "engine/renderable/fx/RallyPointFx",
    "engine/renderable/entity/unit/FlyerHelperMode",
    "game/gameobject/unit/ZoneType",
    "engine/gfx/BufferGeometryUtils",
    "engine/gfx/material/PaletteBasicMaterial",
    "engine/gfx/batch/BatchedMesh",
    "game/gameobject/unit/HealthLevel",
    "engine/renderable/entity/unit/DebugLabel",
    "engine/Engine",
    "engine/EngineType",
    "engine/renderable/entity/UnitCastBarSprite",
    "engine/renderable/entity/SecureProgressSprite",
  ],
  function (e, t) {
    "use strict";
    var i, g, d, p, m, a, u, f, r, s, n, o, y, T, v, b, l, S, w, c, h, E, C, x, O, A, M, R;
    t && t.id;
    return {
      setters: [
        function (e) {
          i = e;
        },
        function (e) {
          g = e;
        },
        function (e) {
          d = e;
        },
        function (e) {
          p = e;
        },
        function (e) {
          m = e;
        },
        function (e) {
          a = e;
        },
        function (e) {
          u = e;
        },
        function (e) {
          f = e;
        },
        function (e) {
          r = e;
        },
        function (e) {
          s = e;
        },
        function (e) {
          n = e;
        },
        function (e) {
          o = e;
        },
        function (e) {
          y = e;
        },
        function (e) {
          T = e;
        },
        function (e) {
          v = e;
        },
        function (e) {
          b = e;
        },
        function (e) {
          l = e;
        },
        function (e) {
          S = e;
        },
        function (e) {
          w = e;
        },
        function (e) {
          c = e;
        },
        function (e) {
          h = e;
        },
      ],
      execute: function () {
        ((E = -1),
          (x = { width: 8, height: 11 }),
          (O = C = 1),
          (A = {
            [0]: a.SelectionLevel.Hover,
            2: a.SelectionLevel.Selected,
            1: a.SelectionLevel.Hover,
            3: a.SelectionLevel.Hover,
            4: a.SelectionLevel.Selected,
            5: a.SelectionLevel.Selected,
            6: a.SelectionLevel.Selected,
          }),
          (M = new Map()
            // OpenYRWeb: YR-only — health-pip texture indices for YR (16/17/18). RA2 entry dropped.
            .set(
              w.EngineType.YurisRevenge,
              new Map().set(b.HealthLevel.Green, 16).set(b.HealthLevel.Yellow, 17).set(b.HealthLevel.Red, 18),
            )),
          e(
            "PipOverlay",
            (R = class R {
              static clearCaches() {
                (R.atlasCache?.dispose(),
                  (R.atlasCache = void 0),
                  R.atlasImageHandles.clear(),
                  [...R.unitHealthTextures.values()].forEach((e) => e.dispose()),
                  R.unitHealthTextures.clear(),
                  R.unitHealthMaterials.forEach((e) => e.dispose()),
                  R.unitHealthMaterials.clear(),
                  [...R.controlGroupTextures.values()].forEach((e) => e.dispose()),
                  R.controlGroupTextures.clear(),
                  R.controlGroupMaterials.forEach((e) => e.dispose()),
                  R.controlGroupMaterials.clear(),
                  [...R.primaryFactoryTextures.values()].forEach((e) => e.dispose()),
                  R.primaryFactoryTextures.clear(),
                  R.primaryFactoryMaterials.forEach((e) => e.dispose()),
                  R.primaryFactoryMaterials.clear(),
                  [...R.powerInfoTextures.values()].forEach((e) => e.dispose()),
                  R.powerInfoTextures.clear(),
                  R.powerInfoMaterials.forEach((e) => e.dispose()),
                  R.powerInfoMaterials.clear());
              }
              constructor(e, t, i, r, s, a, n, o, l, c, h, u, d, g, p, m) {
                ((this.paradropRules = e),
                  (this.audioVisualRules = t),
                  (this.gameObject = i),
                  (this.viewer = r),
                  (this.alliances = s),
                  (this.selectionModel = a),
                  (this.imageFinder = n),
                  (this.palette = o),
                  (this.camera = l),
                  (this.strings = c),
                  (this.flyerHelperOpt = h),
                  (this.hiddenObjectsOpt = u),
                  (this.debugTextEnabled = d),
                  (this.animFactory = g),
                  (this.useSpriteBatching = p),
                  (this.useMeshInstancing = m),
                  (this.lastPrimaryFactory = !1),
                  (this.lastPowerInfo = !1),
                  (this.lastPowerVal = -1),
                  (this.lastDrainVal = -1),
                  (this.invalidatedElements = []),
                  (this.disposables = new f.CompositeDisposable()));
              }
              create3DObject() {
                let t = this.rootObj;
                if (!t) {
                  var e;
                  if (
                    ((t = new THREE.Object3D()),
                    (t.name = "pip_overlay"),
                    (t.matrixAutoUpdate = !1),
                    R.atlasCache ||
                      ((e = this.initTexture()),
                      (R.atlasCache = e),
                      [...R.atlasImageHandles.keys()].forEach((e) => {
                        var t = d.SpriteUtils.createSpriteGeometry(this.buildSpriteGeometry(e));
                        R.geometries.set(e, t);
                      }),
                      (R.material = new T.PaletteBasicMaterial({
                        map: R.atlasCache.getTexture(),
                        palette: m.TextureUtils.textureFromPalette(this.palette),
                        alphaTest: 0.5,
                        flatShading: !0,
                        transparent: !0,
                        depthTest: !1,
                      }))),
                    this.gameObject.isBuilding())
                  ) {
                    ((this.healthBar = this.createBuildingHealthBar(this.gameObject)),
                      t.add(this.healthBar),
                      1 <= this.gameObject.art.height &&
                        ((r = this.selectionBox = this.createBuildingSelectionBox(this.gameObject)), t.add(r)));
                    var i = this.createBuildingOccupationInfo(this.gameObject);
                    if (
                      (i && (t.add(i), (this.pipsSprite = i)),
                      (this.lastPipsDataKey = this.gameObject.garrisonTrait?.units.length),
                      this.gameObject.secureProgressTrait)
                    ) {
                      let e = (this.secureProgressSprite = new h.SecureProgressSprite(
                        this.gameObject,
                        this.camera,
                        this.viewer,
                        this.alliances,
                        this.selectionModel,
                      ));
                      (e.create3DObject(), t.add(e.get3DObject()));
                    }
                  } else {
                    var { healthBarWrapper: r, selectionBox: i } = this.createUnitHealthBar(this.gameObject);
                    if (
                      ((this.healthBar = r),
                      (this.selectionBox = i),
                      t.add(this.healthBar),
                      this.gameObject.castProgressTrait)
                    ) {
                      i = R.pipBrdFile.getImage(1);
                      let e = (this.unitCastBarSprite = new c.UnitCastBarSprite(
                        this.gameObject.castProgressTrait,
                        this.camera,
                        i.width - 2 * C,
                        E,
                        Math.floor(i.height / 2),
                        this.healthBar.position.y,
                      ));
                      (e.create3DObject(), t.add(e.get3DObject()));
                    }
                    if (
                      this.gameObject.art.isVoxel &&
                      (this.gameObject.rules.consideredAircraft || this.gameObject.isAircraft()) &&
                      !this.gameObject.rules.missileSpawn
                    ) {
                      let e = this.animFactory(this.audioVisualRules.flyerHelper);
                      ((this.flyHelper = e), e.create3DObject(), t.add(e.get3DObject()));
                    }
                    if (this.gameObject.isUnit()) {
                      let e = this.animFactory(this.audioVisualRules.behind);
                      (e.setRenderOrder(999995), (this.behindAnim = e));
                    }
                  }
                  if (this.gameObject.debugLabel && this.debugTextEnabled.value) {
                    let e = new l.DebugLabel(
                      this.gameObject.debugLabel,
                      this.gameObject.owner.color.asHex(),
                      this.camera,
                    );
                    ((this.debugLabel = e),
                      e.create3DObject(),
                      (e.get3DObject().renderOrder = 999999),
                      t.add(e.get3DObject()));
                  }
                  ((this.lastHealth = this.gameObject.healthTrait.health),
                    (this.lastOwner = this.gameObject.owner),
                    (this.rootObj = t));
                }
              }
              onCreate(e) {
                this.gameObject.isBuilding() &&
                  this.gameObject.rallyTrait &&
                  ((this.rallyLine = new s.RallyPointFx(
                    this.camera,
                    new THREE.Vector3(),
                    new THREE.Vector3(),
                    new THREE.Color(),
                    999999,
                  )),
                  (this.rallyLine.visible = !1),
                  e.addEffect(this.rallyLine),
                  this.disposables.add(() => this.rallyLine.remove(), this.rallyLine));
              }
              initTexture() {
                ((R.pipBrdFile = this.imageFinder.find("pipbrd", !1)),
                  (R.pipsFile = this.imageFinder.find("pips", !1)),
                  (R.pips2File = this.imageFinder.find("pips2", !1)));
                let e = [R.pipBrdFile, R.pipsFile, R.pips2File],
                  s = [];
                e.forEach((e) => {
                  for (let r = 0; r < e.numImages; r++) {
                    var t = e.getImage(r),
                      i = new g.IndexedBitmap(t.width, t.height, t.imageData);
                    (s.push(i), R.atlasImageHandles.set(t, { bitmap: i, shpFile: e }));
                  }
                });
                let t = new i.TextureAtlas();
                return (t.pack(s), t);
              }
              buildSpriteGeometry(e) {
                if (!R.atlasCache) throw new Error("Must build texture atlas before geometry");
                let t = R.atlasCache;
                var { bitmap: i, shpFile: r } = R.atlasImageHandles.get(e);
                return {
                  texture: t.getTexture(),
                  textureArea: t.getImageRect(i),
                  align: { x: 1, y: -1 },
                  offset: { x: e.x - Math.floor(r.width / 2), y: e.y - Math.floor(r.height / 2) },
                  camera: this.camera,
                  scale: p.Coords.ISO_WORLD_SCALE,
                };
              }
              createBuildingHealthBar(e) {
                var r = e.art.foundation.height,
                  t = e.healthTrait.health,
                  s = 4 * p.Coords.ISO_WORLD_SCALE,
                  a = Math.floor((r * p.Coords.getWorldTileSize()) / s),
                  n = Math.max(1, Math.floor((t / 100) * a));
                let o;
                o =
                  t > 100 * this.audioVisualRules.conditionYellow
                    ? 1
                    : t > 100 * this.audioVisualRules.conditionRed
                      ? 2
                      : 4;
                r = o + "_" + r + "_" + n;
                let l = R.buildingHealthGeoCache.get(r);
                if (!l) {
                  let t = [];
                  var c = R.pipsFile.getImage(0),
                    h = R.pipsFile.getImage(o);
                  for (let i = 0; i < a; i++) {
                    var u = i < n ? h : c;
                    let e = R.geometries.get(u).clone();
                    u = s * i + s / 2;
                    (e.applyMatrix(new THREE.Matrix4().makeTranslation(s, 0, u)), t.push(e));
                  }
                  ((l = y.BufferGeometryUtils.mergeBufferGeometries(t)), R.buildingHealthGeoCache.set(r, l));
                }
                let i = this.useMeshInstancing
                  ? new v.BatchedMesh(l, R.material, v.BatchMode.Instancing)
                  : new THREE.Mesh(l, R.material);
                ((i.matrixAutoUpdate = !1), (i.renderOrder = 999999));
                r = e.art.height || 0.5;
                return ((i.position.y = p.Coords.tileHeightToWorld(r)), i.updateMatrix(), i);
              }
              createUnitHealthBar(e) {
                var t = !e.isInfantry(),
                  i = e.healthTrait.health,
                  r = e.healthTrait.level;
                let s = R.unitHealthTextures.get(t);
                s || ((s = this.createUnitHealthTexture(t)), R.unitHealthTextures.set(t, s));
                var a = R.pipBrdFile.getImage(t ? 0 : 1),
                  n = M.get(S.Engine.getActiveEngine())?.get(r);
                if (void 0 === n) throw new Error(`Unhandled health level "${r}"`);
                ((n = R.pipsFile.getImage(n)),
                  (n = Math.floor((a.width - 2 * C) / n.width)),
                  (i = Math.max(1, Math.floor((i / 100) * n))),
                  (n = (t ? 1 : 0) + "_" + i));
                let o = R.unitHealthGeoCache.get(n);
                o ||
                  ((o = d.SpriteUtils.createSpriteGeometry({
                    texture: s,
                    textureArea: { x: 0, y: (i - 1) * a.height, width: a.width, height: a.height },
                    camera: this.camera,
                    align: { x: 0, y: 0 },
                    scale: p.Coords.ISO_WORLD_SCALE,
                  })),
                  R.unitHealthGeoCache.set(n, o));
                let l = R.unitHealthMaterials.get(t);
                l ||
                  ((l = new T.PaletteBasicMaterial({
                    map: s,
                    palette: m.TextureUtils.textureFromPalette(this.palette),
                    alphaTest: 0.5,
                    flatShading: !0,
                    transparent: !0,
                    depthTest: !1,
                  })),
                  R.unitHealthMaterials.set(t, l));
                let c = this.useSpriteBatching ? new v.BatchedMesh(o, l, v.BatchMode.Merging) : new THREE.Mesh(o, l);
                ((c.matrixAutoUpdate = !1), (c.renderOrder = 999998));
                t = p.Coords.screenDistanceToWorld(Math.floor(a.width / 2) + E, 0);
                (c.applyMatrix(new THREE.Matrix4().makeTranslation(t.x, 0, t.y)), c.updateMatrix());
                t = R.geometries.get(a);
                let h = this.useSpriteBatching
                  ? new v.BatchedMesh(t, R.material, v.BatchMode.Merging)
                  : new THREE.Mesh(t, R.material);
                h.matrixAutoUpdate = !1;
                t = p.Coords.screenDistanceToWorld(Math.floor(R.pipBrdFile.getImage(0).width / 2) + E, 0);
                (h.applyMatrix(new THREE.Matrix4().makeTranslation(t.x, 0, t.y)),
                  h.updateMatrix(),
                  (h.renderOrder = 999997));
                let u = new THREE.Object3D();
                ((u.matrixAutoUpdate = !1), u.add(h), u.add(c));
                a = p.Coords.screenDistanceToWorld(-Math.floor(a.width / 2), 0);
                return (
                  u.applyMatrix(new THREE.Matrix4().makeTranslation(a.x, p.Coords.tileHeightToWorld(2), a.y)),
                  u.updateMatrix(),
                  { healthBarWrapper: u, selectionBox: h }
                );
              }
              createUnitHealthTexture(e) {
                var i = R.pipBrdFile.getImage(e ? 0 : 1);
                let r = M.get(S.Engine.getActiveEngine());
                if (!r) throw new Error("Unhandled engine type " + w.EngineType[S.Engine.getActiveEngine()]);
                var t = R.pipsFile.getImage(r.values().next().value).width,
                  s = Math.floor((i.width - 2 * C) / t);
                let a = new g.IndexedBitmap(i.width, i.height * s);
                for (let d = 1; d <= s; ++d) {
                  var n = (d / s) * 100;
                  let e;
                  e =
                    n > 100 * this.audioVisualRules.conditionYellow
                      ? b.HealthLevel.Green
                      : n > 100 * this.audioVisualRules.conditionRed
                        ? b.HealthLevel.Yellow
                        : b.HealthLevel.Red;
                  n = r.get(e);
                  if (void 0 === n) throw new Error(`Unhandled health level "${e}"`);
                  var o = R.pipsFile.getImage(n),
                    l = new g.IndexedBitmap(o.width, o.height, o.imageData),
                    c = (d - 1) * i.height;
                  for (let t = 0; t < d; t++) {
                    var h = o.width * t;
                    a.drawIndexedImage(l, h + C, c + C);
                  }
                }
                let u = new THREE.DataTexture(a.data, a.width, a.height, THREE.AlphaFormat);
                return (
                  (u.minFilter = THREE.NearestFilter),
                  (u.magFilter = THREE.NearestFilter),
                  (u.flipY = !0),
                  (u.needsUpdate = !0),
                  u
                );
              }
              createBuildingSelectionBox(s) {
                let a = new THREE.Object3D();
                a.matrixAutoUpdate = !1;
                let n = s.art.foundation,
                  o = p.Coords.getWorldTileSize();
                return (
                  [
                    [0, 0],
                    [0, 1],
                    [1, 1],
                    [1, 0],
                  ].forEach(([e, t], i) => {
                    let r = this.createBuildingSelectionCornerMesh();
                    ((r.matrixAutoUpdate = !1),
                      r.position.set(e * o * n.width, p.Coords.tileHeightToWorld(s.art.height), t * o * n.height),
                      (r.rotation.y = (i * Math.PI) / 2),
                      r.scale.set(
                        ((i % 2 == 0 ? n.width : n.height) / 4) * p.Coords.getWorldTileSize(),
                        p.Coords.tileHeightToWorld(s.art.height / 4),
                        ((i % 2 == 0 ? n.height : n.width) / 4) * p.Coords.getWorldTileSize(),
                      ),
                      r.updateMatrix(),
                      a.add(r));
                  }),
                  a
                );
              }
              createBuildingSelectionCornerMesh() {
                var e = [0, 0, 0, 1, 0, 0, 0, 0, 0, 0, -1, 0, 0, 0, 0, 0, 0, 1],
                  t = new Array(e.length).fill(1);
                let i = new THREE.BufferGeometry();
                (i.addAttribute("position", new THREE.BufferAttribute(new Float32Array(e), 3)),
                  i.addAttribute("color", new THREE.BufferAttribute(new Float32Array(t), 3)));
                t = new THREE.LineBasicMaterial({ vertexColors: THREE.VertexColors });
                return (this.disposables.add(i, t), new THREE.LineSegments(i, t));
              }
              createBuildingOccupationInfo(r) {
                if (r.garrisonTrait?.units.length && !this.objectIsOpaqueToViewer()) {
                  var s = r.garrisonTrait.units.length,
                    a = r.rules.maxNumberOccupants;
                  let t = [];
                  var n = 4 * p.Coords.ISO_WORLD_SCALE,
                    o = R.pipsFile.getImage(6),
                    l = R.pipsFile.getImage(7);
                  for (let i = 1; i <= a; i++) {
                    var c = i <= s ? l : o;
                    let e = R.geometries.get(c).clone();
                    c = n * i + n / 2;
                    (e.applyMatrix(
                      new THREE.Matrix4().makeTranslation(c, 0, r.art.foundation.height * p.Coords.getWorldTileSize()),
                    ),
                      t.push(e));
                  }
                  var h = y.BufferGeometryUtils.mergeBufferGeometries(t);
                  let e = this.useSpriteBatching
                    ? new v.BatchedMesh(h, R.material, v.BatchMode.Merging)
                    : new THREE.Mesh(h, R.material);
                  return ((e.matrixAutoUpdate = !1), (e.renderOrder = 999999), e);
                }
              }
              createPipsSprite(s, t, a = !1) {
                if (!this.objectIsOpaqueToViewer()) {
                  let i = [];
                  // OpenYRWeb: YR-only — pip indices are the YR values (13/14).
                  var n = 13,
                    o = 14,
                    l = R.pips2File.getImage(a ? n : 0).width,
                    c = R.pips2File.getImage(a ? o : 0);
                  for (let r = 0; r < t; r++) {
                    let t;
                    if (r < s.length) {
                      var h = s[r];
                      let e = a ? n : 3;
                      (h === u.PipColor.Blue
                        ? (e = 5)
                        : h === u.PipColor.Red
                          ? (e = 4)
                          : h === u.PipColor.Yellow && (e = 2),
                        (t = R.pips2File.getImage(e)));
                    } else t = c;
                    let e = R.geometries.get(t).clone();
                    ((h = l * r + l / 2),
                      (h = p.Coords.screenDistanceToWorld(
                        -Math.floor(R.pipBrdFile.getImage(this.gameObject.isInfantry() ? 1 : 0).width / 2) + h,
                        Math.floor(c.height / 2) + 3,
                      )));
                    (e.applyMatrix(new THREE.Matrix4().makeTranslation(h.x, 0, h.y)), i.push(e));
                  }
                  o = y.BufferGeometryUtils.mergeBufferGeometries(i);
                  let e = this.useSpriteBatching
                    ? new v.BatchedMesh(o, R.material, v.BatchMode.Merging)
                    : new THREE.Mesh(o, R.material);
                  return ((e.renderOrder = 999996), e);
                }
              }
              createControlGroupTexture(e) {
                let t = document.createElement("canvas"),
                  i = t.getContext("2d", { alpha: !1 });
                var r = O,
                  s = x;
                ((t.width = 10 * (s.width + 2 * r)),
                  (t.height = s.height + 2 * r),
                  (i.fillStyle = "#000"),
                  i.fillRect(0, 0, t.width, t.height),
                  (i.strokeStyle = e.asHexString()),
                  (i.fillStyle = e.asHexString()),
                  (i.font = "bold 12px Arial, sans-serif"));
                for (let o = 0; o < 10; o++) {
                  var a = (s.width + 2 * r) * o;
                  (i.strokeRect(0.5 + a, 0.5, s.width + 2 * r - 1, t.height - 1),
                    i.fillText(String(o), a + r + 0.5, s.height));
                }
                let n = new THREE.Texture(t);
                return (
                  (n.minFilter = THREE.NearestFilter),
                  (n.magFilter = THREE.NearestFilter),
                  (n.needsUpdate = !0),
                  n
                );
              }
              createControlGroupSprite(e) {
                let t = this.gameObject.owner.color;
                R.controlGroupTextures.has(t.asHex()) ||
                  ((r = this.createControlGroupTexture(t)), R.controlGroupTextures.set(t.asHex(), r));
                var i = R.controlGroupTextures.get(t.asHex()),
                  r = d.SpriteUtils.createSpriteGeometry({
                    texture: i,
                    textureArea: { x: e * (x.width + 2 * O), y: 0, width: x.width + 2 * O, height: x.height + 2 * O },
                    camera: this.camera,
                    align: { x: 1, y: -1 },
                    scale: p.Coords.ISO_WORLD_SCALE,
                  });
                let s = R.controlGroupMaterials.get(i);
                s ||
                  ((s = new THREE.MeshBasicMaterial({
                    map: i,
                    alphaTest: 0.5,
                    transparent: !0,
                    depthTest: !1,
                    flatShading: !0,
                  })),
                  R.controlGroupMaterials.set(i, s));
                let a = this.useSpriteBatching ? new v.BatchedMesh(r, s, v.BatchMode.Merging) : new THREE.Mesh(r, s);
                return ((a.matrixAutoUpdate = !1), (a.renderOrder = 999996), a);
              }
              createPrimaryFactoryTexture(e) {
                var t = r.OverlayUtils.createTextBox(this.strings.get("TXT_PRIMARY"), {
                  color: e.asHexString(),
                  borderColor: e.asHexString(),
                  backgroundColor: "#000",
                  fontFamily: "'Fira Sans Condensed', Arial, sans-serif",
                  fontSize: 12,
                  fontWeight: "500",
                  paddingTop: 5,
                  paddingBottom: 5,
                  paddingLeft: 2,
                  paddingRight: 4,
                });
                let i = new THREE.Texture(t);
                return (
                  (i.minFilter = THREE.NearestFilter),
                  (i.magFilter = THREE.NearestFilter),
                  (i.needsUpdate = !0),
                  i
                );
              }
              createPrimaryFactorySprite() {
                if (!this.objectIsOpaqueToViewer()) {
                  let e = this.gameObject.owner.color;
                  R.primaryFactoryTextures.has(e.asHex()) ||
                    ((s = this.createPrimaryFactoryTexture(e)), R.primaryFactoryTextures.set(e.asHex(), s));
                  var r = R.primaryFactoryTextures.get(e.asHex()),
                    s = d.SpriteUtils.createSpriteGeometry({
                      texture: r,
                      camera: this.camera,
                      align: { x: 1, y: -1 },
                      offset: { x: -Math.floor(r.image.width / 2), y: -Math.floor(r.image.height / 2) },
                      scale: p.Coords.ISO_WORLD_SCALE,
                    });
                  let t = R.primaryFactoryMaterials.get(r);
                  t ||
                    ((t = new THREE.MeshBasicMaterial({
                      map: r,
                      alphaTest: 0.5,
                      transparent: !0,
                      depthTest: !1,
                      flatShading: !0,
                    })),
                    R.primaryFactoryMaterials.set(r, t));
                  let i = this.useSpriteBatching ? new v.BatchedMesh(s, t, v.BatchMode.Merging) : new THREE.Mesh(s, t);
                  return ((i.renderOrder = 999999), i);
                }
              }
              createPowerInfoTexture(e) {
                var t = r.OverlayUtils.createTextBox(e, {
                  color: this.gameObject.owner.color.asHexString(),
                  borderColor: this.gameObject.owner.color.asHexString(),
                  backgroundColor: "#000",
                  fontFamily: "'Fira Sans Condensed', Arial, sans-serif",
                  fontSize: 14,
                  fontWeight: "500",
                  paddingTop: 5,
                  paddingBottom: 5,
                  paddingLeft: 2,
                  paddingRight: 4,
                });
                let i = new THREE.Texture(t);
                return (
                  (i.minFilter = THREE.NearestFilter),
                  (i.magFilter = THREE.NearestFilter),
                  (i.needsUpdate = !0),
                  i
                );
              }
              createPowerInfoSprite(e) {
                if (!this.objectIsOpaqueToViewer()) {
                  var t = this.createPowerInfoTexture(e),
                    i = d.SpriteUtils.createSpriteGeometry({
                      texture: t,
                      camera: this.camera,
                      align: { x: 1, y: 1 },
                      offset: { x: -Math.floor(t.image.width / 2), y: Math.floor(t.image.height / 2) },
                      scale: p.Coords.ISO_WORLD_SCALE,
                    });
                  let r = new THREE.MeshBasicMaterial({
                    map: t,
                    alphaTest: 0.5,
                    transparent: !0,
                    depthTest: !1,
                    flatShading: !0,
                  });
                  let s = this.useSpriteBatching ? new v.BatchedMesh(i, r, v.BatchMode.Merging) : new THREE.Mesh(i, r);
                  return ((s.renderOrder = 999998), s);
                }
              }
              createVeteranIndicator(t) {
                if (t.veteranLevel) {
                  var i = R.pipsFile.getImage(13 + t.veteranLevel - 1),
                    i = R.geometries.get(i);
                  let e = this.useSpriteBatching
                    ? new v.BatchedMesh(i, R.material, v.BatchMode.Merging)
                    : new THREE.Mesh(i, R.material);
                  return ((e.matrixAutoUpdate = !1), (e.renderOrder = 999996), (e.receiveShadow = !1), e);
                }
              }
              get3DObject() {
                return this.rootObj;
              }
              update(e) {
                let t = this.gameObject;
                if (t.isDestroyed || t.isCrashing) this.rootObj.visible = !1;
                else {
                  t.healthTrait.health !== this.lastHealth &&
                    ((this.lastHealth = t.healthTrait.health), (this.invalidatedElements[0] = !0));
                  let i = this.selectionModel.getSelectionLevel();
                  this.invalidatedElements[0] &&
                    (i >= A[0] || i >= A[3]) &&
                    ((this.invalidatedElements[0] = void 0), this.updateHealthBarSprite(i));
                  var r = this.computePipsDataKey(t);
                  ((this.lastPipsDataKey === r && this.lastOwner === t.owner) ||
                    ((this.lastPipsDataKey = r), (this.invalidatedElements[1] = !0)),
                    this.invalidatedElements[1] &&
                      i >= A[1] &&
                      ((this.invalidatedElements[1] = void 0), this.updatePipsSprite()));
                  r = this.selectionModel.getControlGroupNumber();
                  (this.lastControlGroup !== r && ((this.lastControlGroup = r), (this.invalidatedElements[3] = !0)),
                    this.invalidatedElements[3] &&
                      i >= A[3] &&
                      ((this.invalidatedElements[3] = void 0), this.updateControlGroupSprite(r)));
                  r =
                    t.isBuilding() && !!t.rules.factory && t.owner.production?.getPrimaryFactory(t.rules.factory) === t;
                  ((this.lastPrimaryFactory === r && this.lastOwner === t.owner) ||
                    ((this.lastPrimaryFactory = r), (this.invalidatedElements[4] = !0)),
                    this.invalidatedElements[4] &&
                      i >= A[4] &&
                      ((this.invalidatedElements[4] = void 0), this.updatePrimaryFactorySprite(r)));
                  // OpenYRWeb: show power info overlay for power-generating buildings
                  r = t.isBuilding() && 0 < t.rules.power && !!t.owner?.powerTrait;
                  var pv = r ? t.owner.powerTrait.power : -1,
                    dv = r ? t.owner.powerTrait.drain : -1;
                  ((this.lastPowerInfo === r && this.lastPowerVal === pv && this.lastDrainVal === dv) ||
                    ((this.lastPowerInfo = r), (this.lastPowerVal = pv), (this.lastDrainVal = dv), (this.invalidatedElements[6] = !0)),
                    this.invalidatedElements[6] &&
                      i >= A[6] &&
                      ((this.invalidatedElements[6] = void 0), this.updatePowerInfoSprite(r, pv, dv)));
                  r = (t.isBuilding() && t.rallyTrait?.getRallyPoint()) || void 0;
                  if (
                    ((this.lastRallyPoint === r && this.lastOwner === t.owner) ||
                      ((this.lastRallyPoint = r), (this.invalidatedElements[5] = !0)),
                    this.invalidatedElements[5] &&
                      i >= A[5] &&
                      this.rallyLine &&
                      ((this.invalidatedElements[5] = void 0), this.updateRallyPointLine(r, this.rallyLine)),
                    t.isBuilding()
                      ? (this.secureProgressSprite?.update(e),
                        (r = !t.autoRepairTrait.isDisabled()),
                        this.lastRepairState !== r && ((this.lastRepairState = r), this.updateRepairWrenchSprite(r)))
                      : (this.unitCastBarSprite?.update(e),
                        this.lastVeteranLevel !== t.veteranLevel &&
                          ((this.lastVeteranLevel = t.veteranLevel), this.updateVeteranIndicatorSprite(t))),
                    this.updateFlyerHelper(i, e),
                    this.updateBehindAnim(e),
                    this.updateDebugLabel(),
                    void 0 === this.lastSelectionLevel || this.lastSelectionLevel !== i)
                  ) {
                    this.lastSelectionLevel = i;
                    let e = new Map([
                      [0, this.healthBar],
                      [2, this.selectionBox],
                      [1, this.pipsSprite],
                      [3, this.controlGroupSprite],
                      [4, this.primaryFactorySprite],
                      [5, this.rallyLine],
                      [6, this.powerInfoSprite],
                    ]);
                    e.forEach((e, t) => {
                      e && (e.visible = i >= A[t]);
                    });
                  }
                  ((this.lastOwner = t.owner),
                    (this.lastDebugTextEnabled = this.debugTextEnabled.value),
                    this.repairWrench?.update(e));
                }
              }
              updateFlyerHelper(i, r) {
                if (this.flyHelper && this.gameObject.isUnit()) {
                  let e;
                  switch (this.flyerHelperOpt.value) {
                    case n.FlyerHelperMode.Never:
                      e = !1;
                      break;
                    case n.FlyerHelperMode.Always:
                      e = !0;
                      break;
                    case n.FlyerHelperMode.Selected:
                      e = i >= a.SelectionLevel.Selected;
                      break;
                    default:
                      e = !1;
                  }
                  e = e && this.gameObject.zone === o.ZoneType.Air;
                  let t = this.flyHelper.get3DObject();
                  var s;
                  ((t.visible = e),
                    e &&
                      (this.flyHelper.update(r),
                      (s = -p.Coords.tileHeightToWorld(this.gameObject.tileElevation)) !== t.position.y &&
                        ((t.position.y = s), t.updateMatrix())));
                }
              }
              updateBehindAnim(e) {
                this.behindAnim &&
                  (this.hiddenObjectsOpt.value &&
                  this.gameObject.isSpawned &&
                  this.gameObject.tile.occluded &&
                  this.gameObject.art.canBeHidden &&
                  this.gameObject.zone !== o.ZoneType.Air
                    ? (this.behindAnim?.update(e),
                      this.behindAnim.get3DObject()?.parent ||
                        (this.behindAnim.create3DObject(),
                        this.rootObj.add(this.behindAnim.get3DObject()),
                        this.behindAnim.get3DObject().updateMatrix()))
                    : this.behindAnim.get3DObject()?.parent && this.rootObj.remove(this.behindAnim.get3DObject()));
              }
              updateDebugLabel() {
                if (
                  (this.gameObject.debugLabel !== this.lastDebugLabel ||
                    this.gameObject.owner !== this.lastOwner ||
                    this.debugTextEnabled.value !== this.lastDebugTextEnabled) &&
                  ((this.lastDebugLabel = this.gameObject.debugLabel),
                  this.debugLabel &&
                    (this.rootObj.remove(this.debugLabel.get3DObject()),
                    this.debugLabel.dispose(),
                    (this.debugLabel = void 0)),
                  this.gameObject.debugLabel && this.debugTextEnabled.value)
                ) {
                  let e = new l.DebugLabel(
                    this.gameObject.debugLabel,
                    this.gameObject.owner.color.asHex(),
                    this.camera,
                  );
                  ((this.debugLabel = e),
                    e.create3DObject(),
                    (e.get3DObject().renderOrder = 999999),
                    this.rootObj.add(e.get3DObject()));
                }
              }
              updateRepairWrenchSprite(e) {
                (this.repairWrench && this.rootObj.remove(this.repairWrench.get3DObject()),
                  e &&
                    ((this.repairWrench = this.createRepairWrench()),
                    this.repairWrench &&
                      (this.repairWrench.create3DObject(), this.rootObj.add(this.repairWrench.get3DObject()))));
              }
              updateVeteranIndicatorSprite(e) {
                var t;
                (this.veteranIndicator && this.rootObj.remove(this.veteranIndicator),
                  (this.veteranIndicator = this.createVeteranIndicator(e)),
                  this.veteranIndicator &&
                    (this.rootObj.add(this.veteranIndicator),
                    (t = p.Coords.screenDistanceToWorld(
                      Math.floor(R.pipBrdFile.getImage(e.isInfantry() ? 1 : 0).width / 2) -
                        Math.floor(R.pipsFile.getImage(13).width / 2),
                      0,
                    )),
                    (this.veteranIndicator.position.x = t.x),
                    (this.veteranIndicator.position.y = 0),
                    (this.veteranIndicator.position.z = t.y),
                    this.veteranIndicator.updateMatrix()));
              }
              updateRallyPointLine(e, t) {
                ((t.visible = !1),
                  e &&
                    (this.objectIsOpaqueToViewer() ||
                      ((t.sourcePos = this.gameObject.position.worldPosition),
                      (t.targetPos = p.Coords.tile3dToWorld(e.rx + 0.5, e.ry + 0.5, e.z)),
                      (t.color = new THREE.Color(this.gameObject.owner.color.asHex())),
                      (t.needsUpdate = !0),
                      (t.visible = !0))));
              }
              updatePrimaryFactorySprite(e) {
                var t;
                (this.primaryFactorySprite && this.rootObj.remove(this.primaryFactorySprite),
                  !e || ((t = this.primaryFactorySprite = this.createPrimaryFactorySprite()) && this.rootObj.add(t)));
              }
              updatePowerInfoSprite(e, t, i) {
                this.powerInfoSprite && (this.rootObj.remove(this.powerInfoSprite), (this.powerInfoSprite = void 0));
                if (e && void 0 !== t && void 0 !== i) {
                  var r = this.strings.get("TXT_POWER_DRAIN", t, i),
                    s = this.createPowerInfoSprite(r);
                  s && ((this.powerInfoSprite = s), this.rootObj.add(s));
                }
              }
              updateControlGroupSprite(i) {
                if ((this.controlGroupSprite && this.rootObj.remove(this.controlGroupSprite), void 0 !== i)) {
                  let e = (this.controlGroupSprite = this.createControlGroupSprite(i)),
                    t = this.gameObject;
                  var r;
                  (t.isBuilding()
                    ? ((e.position.x = 1),
                      (e.position.y = p.Coords.tileHeightToWorld(t.art.height - 0.5)),
                      (e.position.z = p.Coords.getWorldTileSize() * t.art.foundation.height))
                    : t.isInfantry()
                      ? ((r = p.Coords.screenDistanceToWorld(
                          -(x.width + 2 * O + R.pipBrdFile.getImage(1).width / 2 + 1),
                          -R.pipBrdFile.height / 2,
                        )),
                        (e.position.x = r.x),
                        (e.position.y = this.healthBar.position.y),
                        (e.position.z = r.y))
                      : ((r = p.Coords.screenDistanceToWorld(
                          -R.pipBrdFile.getImage(0).width / 2,
                          R.pipBrdFile.height / 2,
                        )),
                        (e.position.x = r.x),
                        (e.position.y = this.healthBar.position.y),
                        (e.position.z = r.y)),
                    e.updateMatrix(),
                    this.rootObj.add(e));
                }
              }
              updatePipsSprite() {
                this.pipsSprite && (this.rootObj.remove(this.pipsSprite), (this.pipsSprite = void 0));
                let t = this.gameObject,
                  r;
                if (t.isBuilding()) r = this.createBuildingOccupationInfo(t);
                else if (t.isVehicle()) {
                  let i = [],
                    e = void 0;
                  var s, a;
                  (t.harvesterTrait && 0 < t.rules.storage
                    ? ((e = 5),
                      (a = t.rules.storage),
                      (s = Math.floor((t.harvesterTrait.gems / a) * e)),
                      (a = Math.floor((t.harvesterTrait.ore / a) * e)),
                      i.push(...new Array(s).fill(u.PipColor.Blue), ...new Array(a).fill(u.PipColor.Yellow)))
                    : t.transportTrait && 0 < t.rules.passengers
                      ? ((e = t.rules.passengers),
                        t.transportTrait.units.forEach((e) => {
                          let t = 0;
                          (e.isVehicle() && (i.push(u.PipColor.Blue), t++),
                            i.push(...new Array(e.rules.size - t).fill(e.isVehicle() ? u.PipColor.Red : e.rules.pip)));
                        }))
                      : t.airSpawnTrait &&
                        ((i = new Array(t.airSpawnTrait.availableSpawns).fill(u.PipColor.Yellow)),
                        (e = t.rules.spawnsNumber)),
                    e && (r = this.createPipsSprite(i, e)));
                } else if (
                  // OpenYRWeb: infantry with a cargo trait (SlaveMiner slaves, SLAV). Renders
                  // ore/gems pips exactly like the vehicle harvester branch above. Mirrors the
                  // YR slave ore-carrying pips (PipScale=Tiberium, Storage=4).
                  t.isInfantry() &&
                  t.harvesterTrait &&
                  0 < t.rules.storage
                ) {
                  let i = [],
                    e = 5,
                    a = t.rules.storage,
                    s = Math.floor((t.harvesterTrait.gems / a) * e);
                  a = Math.floor((t.harvesterTrait.ore / a) * e);
                  (i.push(...new Array(s).fill(u.PipColor.Blue), ...new Array(a).fill(u.PipColor.Yellow)),
                    (r = this.createPipsSprite(i, e)));
                } else
                  t.isAircraft() &&
                    t.ammo &&
                    t.name !== this.paradropRules.paradropPlane &&
                    !t.rules.missileSpawn &&
                    (r = this.createPipsSprite(new Array(t.ammo).fill(u.PipColor.Green), t.ammo, !0));
                r && (r.updateMatrix(), this.rootObj.add(r), (this.pipsSprite = r));
              }
              computePipsDataKey(e) {
                let t = void 0;
                return (
                  e.isBuilding()
                    ? (t = e.garrisonTrait?.units.length)
                      : e.isVehicle()
                        ? e.harvesterTrait
                          ? (t = e.harvesterTrait.ore + "_" + e.harvesterTrait.gems)
                          : e.transportTrait
                            ? (t = e.transportTrait.units.length)
                            : e.airSpawnTrait && (t = e.airSpawnTrait.availableSpawns)
                        : e.isInfantry() && e.harvesterTrait
                          ? (t = e.harvesterTrait.ore + "_" + e.harvesterTrait.gems)
                          : e.isAircraft() && (t = e.ammo),
                  t
                );
              }
              updateHealthBarSprite(i) {
                if (this.healthBar) {
                  if ((this.rootObj.remove(this.healthBar), this.gameObject.isBuilding()))
                    this.healthBar = this.createBuildingHealthBar(this.gameObject);
                  else {
                    let { healthBarWrapper: e, selectionBox: t } = this.createUnitHealthBar(this.gameObject);
                    ((this.healthBar = e), (this.selectionBox = t), (t.visible = i >= A[2]));
                  }
                  this.rootObj.add(this.healthBar);
                }
              }
              createRepairWrench() {
                let e = this.animFactory("WRENCH");
                return (e.setRenderOrder(999998), e);
              }
              objectIsOpaqueToViewer() {
                var e = this.viewer.value;
                return (
                  !(!e || e.isObserver) &&
                  !(this.gameObject.owner === e || this.alliances.areAllied(this.gameObject.owner, e))
                );
              }
              dispose() {
                (this.disposables.dispose(),
                  this.unitCastBarSprite?.dispose(),
                  this.secureProgressSprite?.dispose(),
                  this.repairWrench?.dispose(),
                  this.flyHelper?.dispose(),
                  this.behindAnim?.dispose(),
                  this.debugLabel?.dispose(),
                  this.powerInfoSprite && (this.rootObj.remove(this.powerInfoSprite), (this.powerInfoSprite = void 0)),
                  (this.animFactory = void 0));
              }
            }),
          ),
          (R.atlasImageHandles = new Map()),
          (R.geometries = new Map()),
          (R.buildingHealthGeoCache = new Map()),
          (R.unitHealthGeoCache = new Map()),
          (R.unitHealthTextures = new Map()),
          (R.unitHealthMaterials = new Map()),
          (R.controlGroupTextures = new Map()),
          (R.controlGroupMaterials = new Map()),
          (R.primaryFactoryTextures = new Map()),
          (R.primaryFactoryMaterials = new Map()),
          (R.powerInfoTextures = new Map()),
          (R.powerInfoMaterials = new Map()));
      },
    };
  },
);
