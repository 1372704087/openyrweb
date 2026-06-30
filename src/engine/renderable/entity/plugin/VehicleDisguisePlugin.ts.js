// === Reconstructed SystemJS module: engine/renderable/entity/plugin/VehicleDisguisePlugin ===
// deps: ["engine/renderable/MapSpriteTranslation","engine/renderable/ShpRenderable","engine/type/ObjectType"]
// Note: variable/type names are minified approximations of the original TypeScript.

System.register(
  "engine/renderable/entity/plugin/VehicleDisguisePlugin",
  ["engine/renderable/MapSpriteTranslation", "engine/renderable/ShpRenderable", "engine/type/ObjectType"],
  function (e, t) {
    "use strict";
    var c, h, s, i;
    t && t.id;
    return {
      setters: [
        function (e) {
          c = e;
        },
        function (e) {
          h = e;
        },
        function (e) {
          s = e;
        },
      ],
      execute: function () {
        e(
          "VehicleDisguisePlugin",
          (i = class {
            constructor(e, t, i, r, s, a, n, o, l, c, h, u) {
              ((this.gameObject = e),
                (this.disguiseTrait = t),
                (this.localPlayer = i),
                (this.alliances = r),
                (this.renderable = s),
                (this.art = a),
                (this.imageFinder = n),
                (this.theater = o),
                (this.camera = l),
                (this.lighting = c),
                (this.gameSpeed = h),
                (this.useSpriteBatching = u),
                (this.lastRenderDisguised = !1),
                (this.canSeeThroughDisguise = !1));
            }
            onCreate() {}
            update(i) {
              if (!this.gameObject.isDestroyed && !this.gameObject.warpedOutTrait.isActive()) {
                let e = this.disguiseTrait.isDisguised();
                e !== this.lastDisguised && ((this.lastDisguised = e), (this.disguisedAt = e ? i : void 0));
                let t = this.localPlayer.value;
                if (
                  (e &&
                    (this.canSeeThroughDisguise =
                      !t ||
                      this.alliances.haveSharedIntel(t, this.gameObject.owner) ||
                      !!t.sharedDetectDisguiseTrait?.has(this.gameObject)),
                  e &&
                    this.canSeeThroughDisguise &&
                    (e =
                      !t?.sharedDetectDisguiseTrait?.has(this.gameObject) &&
                      Math.floor(((i - this.disguisedAt) * this.gameSpeed.value) / 1e3) % 16 <= 3),
                  this.lastRenderDisguised !== e &&
                    ((this.lastRenderDisguised = e),
                    (this.renderable.mainObj.visible = !e),
                    (this.renderable.posObj.visible = !e || this.canSeeThroughDisguise),
                    this.disguiseObj && (this.disguiseObj.visible = !1),
                    e))
                ) {
                  var r = this.disguiseTrait.getDisguise();
                  if (r.rules.type !== s.ObjectType.Terrain)
                    throw new Error("Unsupported disguise type " + s.ObjectType[r.rules.type]);
                  r = this.art.getObject(r.rules.name, s.ObjectType.Terrain);
                  (this.disguiseObj ||
                    ((this.disguiseObj = this.createDisguiseObj(r)),
                    this.renderable.get3DObject().add(this.disguiseObj)),
                    (this.disguiseObj.visible = !0));
                  r = this.lighting
                    .compute(r.lightingType, this.gameObject.tile, this.gameObject.tileElevation)
                    .addScalar(-1);
                  this.disguiseRenderable.setExtraLight(r);
                }
              }
            }
            createDisguiseObj(e) {
              let t = new THREE.Object3D();
              t.matrixAutoUpdate = !1;
              let i = 1,
                r = 1,
                s = new c.MapSpriteTranslation(i, r);
              var { spriteOffset: a, anchorPointWorld: n } = s.compute();
              ((t.position.x = n.x), (t.position.z = n.y), t.updateMatrix());
              var o = this.imageFinder.findByObjectArt(e),
                n = this.theater.getPalette(e.paletteType, e.customPaletteName);
              let l = h.ShpRenderable.factory(o, n, this.camera, a, e.hasShadow);
              return (
                l.setBatched(this.useSpriteBatching),
                this.useSpriteBatching && l.setBatchPalettes([n]),
                l.setFrame(0),
                l.create3DObject(),
                t.add(l.get3DObject()),
                (this.disguiseRenderable = l),
                t
              );
            }
            updateLighting() {
              if (this.disguiseObj?.visible && this.disguiseRenderable) {
                var e = this.disguiseTrait.getDisguise();
                if (e) {
                  if (e.rules.type !== s.ObjectType.Terrain)
                    throw new Error("Unsupported disguise type " + s.ObjectType[e.rules.type]);
                  e = this.art.getObject(e.rules.name, s.ObjectType.Terrain);
                  this.disguiseRenderable.setExtraLight(
                    this.lighting
                      .compute(e.lightingType, this.gameObject.tile, this.gameObject.tileElevation)
                      .addScalar(-1),
                  );
                }
              }
            }
            onRemove() {
              this.disguiseObj && (this.renderable.get3DObject().remove(this.disguiseObj), (this.disguiseObj = void 0));
            }
            getUiNameOverride() {
              if (this.gameObject.disguiseTrait?.hasTerrainDisguise() && !this.canSeeThroughDisguise) return "";
            }
            shouldDisableHighlight() {
              return !!this.gameObject.disguiseTrait?.hasTerrainDisguise() && !this.canSeeThroughDisguise;
            }
            dispose() {
              this.disguiseRenderable?.dispose();
            }
          }),
        );
      },
    };
  },
);
