// === Reconstructed SystemJS module: engine/renderable/entity/map/MapSpriteBatchLayer ===
// deps: ["game/Coords","engine/ImageFinder","engine/renderable/builder/BatchShpBuilder","engine/renderable/builder/ShpAggregator","engine/renderable/MapSpriteTranslation","engine/renderable/ShadowRenderable","util/typeGuard"]
// Note: variable/type names are minified approximations of the original TypeScript.

System.register(
  "engine/renderable/entity/map/MapSpriteBatchLayer",
  [
    "game/Coords",
    "engine/ImageFinder",
    "engine/renderable/builder/BatchShpBuilder",
    "engine/renderable/builder/ShpAggregator",
    "engine/renderable/MapSpriteTranslation",
    "engine/renderable/ShadowRenderable",
    "util/typeGuard",
  ],
  function (e, t) {
    "use strict";
    var n, r, o, s, l, c, i, a;
    t && t.id;
    return {
      setters: [
        function (e) {
          n = e;
        },
        function (e) {
          r = e;
        },
        function (e) {
          o = e;
        },
        function (e) {
          s = e;
        },
        function (e) {
          l = e;
        },
        function (e) {
          c = e;
        },
        function (e) {
          i = e;
        },
      ],
      execute: function () {
        e(
          "MapSpriteBatchLayer",
          (a = class {
            constructor(e, t, i, r, s, a, n, o, l) {
              ((this.label = e),
                (this.spriteUseDepth = i),
                (this.theater = r),
                (this.art = s),
                (this.imageFinder = a),
                (this.camera = n),
                (this.lighting = o),
                (this.shpAggregator = l),
                (this.textureCache = new Map()),
                (this.batchShpSpecsByObject = new Map()),
                (this.batchShpBuilders = new Map()),
                (this.shadowBatchShpBuilders = []),
                (this.batchedObjectRules = new Set(t)),
                (this.aggregatedImageData = this.createAggregatedShpFile(`agg_${e}.shp`)));
            }
            get3DObject() {
              return this.target;
            }
            create3DObject() {
              let e = this.get3DObject();
              e || ((e = new THREE.Object3D()), (e.name = this.label), (e.matrixAutoUpdate = !1), (this.target = e));
            }
            createAggregatedShpFile(e) {
              var t = [...this.batchedObjectRules.values()]
                .map((e) => {
                  var t = this.art.getObject(e.name, e.type);
                  let i;
                  try {
                    i = this.imageFinder.findByObjectArt(t);
                  } catch (e) {
                    if (e instanceof r.ImageFinder.MissingImageError) return;
                    throw e;
                  }
                  return s.ShpAggregator.getShpFrameInfo(i, t.hasShadow);
                })
                .filter(i.isNotNullOrUndefined);
              return this.shpAggregator.aggregate(t, e);
            }
            update(e) {}
            updateLighting() {
              (this.batchShpSpecsByObject.forEach((e, t) => {
                e.main.lightMult?.copy(this.lighting.compute(t.art.lightingType, t.tile));
              }),
                [...this.batchShpBuilders.values()].flat().forEach((e) => e.updateLighting()));
            }
            shouldBeBatched(e) {
              return this.batchedObjectRules.has(e.rules);
            }
            getBatchKey(e) {
              return e.art.paletteType + "_" + e.art.customPaletteName;
            }
            addObject(t) {
              var e = this.getBatchKey(t);
              let i = this.batchShpBuilders.get(e);
              i || ((i = []), this.batchShpBuilders.set(e, i));
              let r = i.find((e) => !e.isFull());
              if (!r) {
                if (!this.get3DObject()) throw new Error("Not implemented");
                {
                  var s = this.theater.getPalette(t.art.paletteType, t.art.customPaletteName);
                  let e = new o.BatchShpBuilder(
                    this.aggregatedImageData.file,
                    s,
                    this.camera,
                    this.textureCache,
                    void 0,
                    void 0,
                    void 0,
                    n.Coords.ISO_WORLD_SCALE,
                  );
                  (i.push(e), this.get3DObject().add(e.build()), (r = e));
                }
              }
              s = this.buildBatchShpSpec(t, this.aggregatedImageData);
              r.add(s);
              let a;
              if (t.art.hasShadow) {
                let t = this.shadowBatchShpBuilders.find((e) => !e.isFull());
                if (!t) {
                  if (!this.get3DObject()) throw new Error("Not implemented");
                  {
                    let e = new o.BatchShpBuilder(
                      this.aggregatedImageData.file,
                      c.ShadowRenderable.getOrCreateShadowPalette(),
                      this.camera,
                      this.textureCache,
                      0.5,
                      !0,
                      void 0,
                      n.Coords.ISO_WORLD_SCALE,
                    );
                    (this.shadowBatchShpBuilders.push(e), this.get3DObject().add(e.build()), (t = e));
                  }
                }
                ((a = this.buildShadowBatchShpSpec(s, this.aggregatedImageData)), t.add(a));
              }
              this.batchShpSpecsByObject.set(t, { main: s, shadow: a });
            }
            buildBatchShpSpec(e, t) {
              var i = e.getFoundation();
              let r = new l.MapSpriteTranslation(i.width, i.height),
                s = e.position.worldPosition.clone(),
                { spriteOffset: a, anchorPointWorld: n } = r.compute();
              ((s.x += n.x), (s.z += n.y));
              var o = this.imageFinder.findByObjectArt(e.art),
                i = t.imageIndexes.get(o);
              if (void 0 === i) throw new Error("SHP file not found in aggregated image data");
              return {
                shpFile: o,
                frameNo: i,
                depth: this.spriteUseDepth(e),
                flat: e.art.flat,
                position: s,
                offset: a.clone().add(e.art.getDrawOffset()),
                lightMult: this.lighting.compute(e.art.lightingType, e.tile),
              };
            }
            buildShadowBatchShpSpec(e, t) {
              var i = t.imageIndexes.get(e.shpFile);
              if (void 0 === i) throw new Error("SHP file not found in aggregated image data");
              return {
                ...e,
                position: e.position.clone().add(new THREE.Vector3(0, 0.1, 0)),
                flat: !0,
                frameNo: i + t.file.numImages / 2,
                lightMult: void 0,
              };
            }
            removeObject(i) {
              const r = this.batchShpSpecsByObject.get(i);
              if (r) {
                var s = this.getBatchKey(i);
                let e = this.batchShpBuilders.get(s),
                  t = e?.find((e) => e.has(r.main));
                if (t) {
                  if (
                    (t.remove(r.main),
                    t.isEmpty() &&
                      1 < e.length &&
                      (this.get3DObject()?.remove(t.build()), t.dispose(), e?.splice(e.indexOf(t), 1)),
                    r.shadow)
                  ) {
                    let e = this.shadowBatchShpBuilders.find((e) => e.has(r.shadow));
                    (e?.remove(r.shadow),
                      e?.isEmpty() &&
                        1 < this.shadowBatchShpBuilders.length &&
                        (this.get3DObject()?.remove(e.build()),
                        e.dispose(),
                        this.shadowBatchShpBuilders.splice(this.shadowBatchShpBuilders.indexOf(e), 1)));
                  }
                  this.batchShpSpecsByObject.delete(i);
                }
              }
            }
            hasObject(e) {
              return this.batchShpSpecsByObject.has(e);
            }
            getObjectFrameCount(e) {
              var t = this.batchShpSpecsByObject.get(e);
              if (!t) throw new Error(`Batch SHP spec for object "${e.name}" not found`);
              return t.main.shpFile.numImages * (t.shadow ? 0.5 : 1);
            }
            setObjectFrame(t, i) {
              const r = this.batchShpSpecsByObject.get(t);
              if (!r) throw new Error(`Batch SHP spec for object "${t.name}" not found`);
              if (!(i >= r.main.shpFile.numImages * (r.shadow ? 0.5 : 1))) {
                var s = this.aggregatedImageData.imageIndexes.get(r.main.shpFile);
                ((r.main.frameNo = s + i),
                  r.shadow && (r.shadow.frameNo = r.main.frameNo + this.aggregatedImageData.file.numImages / 2));
                s = this.getBatchKey(t);
                let e = this.batchShpBuilders.get(s)?.find((e) => e.has(r.main));
                if ((e?.update(r.main), r.shadow)) {
                  let e = this.shadowBatchShpBuilders.find((e) => e.has(r.shadow));
                  e?.update(r.shadow);
                }
              }
            }
            dispose() {
              ([...this.batchShpBuilders.values(), ...this.shadowBatchShpBuilders].flat().forEach((e) => e.dispose()),
                [...this.textureCache.values()].forEach((e) => e.dispose()),
                this.textureCache.clear());
            }
          }),
        );
      },
    };
  },
);
