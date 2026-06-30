// === Reconstructed SystemJS module: engine/renderable/entity/TargetLines ===
// deps: ["game/Coords","game/gameobject/task/system/TargetLinesConfig","game/gameobject/unit/ZoneType"]
// Note: variable/type names are minified approximations of the original TypeScript.

System.register(
  "engine/renderable/entity/TargetLines",
  ["game/Coords", "game/gameobject/task/system/TargetLinesConfig", "game/gameobject/unit/ZoneType"],
  function (e, t) {
    "use strict";
    var h, u, d, i;
    t && t.id;
    return {
      setters: [
        function (e) {
          h = e;
        },
        function (e) {
          u = e;
        },
        function (e) {
          d = e;
        },
      ],
      execute: function () {
        e(
          "TargetLines",
          (i = class {
            constructor(e, t, i, r, s) {
              ((this.currentPlayer = e),
                (this.unitSelection = t),
                (this.camera = i),
                (this.debugPaths = r),
                (this.enabled = s),
                (this.unitPaths = new Map()),
                (this.unitLines = new Map()),
                (this.lineHeadGeometry = new THREE.PlaneGeometry(
                  3 * h.Coords.ISO_WORLD_SCALE,
                  3 * h.Coords.ISO_WORLD_SCALE,
                )));
            }
            create3DObject() {
              this.obj ||
                ((this.obj = new THREE.Object3D()),
                (this.obj.name = "target_lines"),
                (this.obj.matrixAutoUpdate = !1),
                (this.attackLineMaterial = new THREE.LineBasicMaterial({
                  color: 11337728,
                  transparent: !0,
                  depthTest: !1,
                  depthWrite: !1,
                })),
                (this.moveLineMaterial = new THREE.LineBasicMaterial({
                  color: 43520,
                  transparent: !0,
                  depthTest: !1,
                  depthWrite: !1,
                })),
                (this.attackLineHeadMaterial = new THREE.MeshBasicMaterial({
                  color: 11337728,
                  transparent: !0,
                  depthTest: !1,
                  depthWrite: !1,
                })),
                (this.moveLineHeadMaterial = new THREE.MeshBasicMaterial({
                  color: 43520,
                  transparent: !0,
                  depthTest: !1,
                  depthWrite: !1,
                })));
            }
            get3DObject() {
              return this.obj;
            }
            forceShow() {
              this.selectionHash = void 0;
            }
            update(n) {
              if (((this.obj.visible = this.enabled.value), this.enabled.value)) {
                var e = this.unitSelection.getHash();
                if (void 0 === this.selectionHash || this.selectionHash !== e)
                  return (
                    (this.selectionHash = e),
                    this.hideAllLines(),
                    this.unitPaths.clear(),
                    this.disposeUnitLines(),
                    void this.unitSelection.getSelectedUnits().forEach((e) => {
                      !e.isUnit() ||
                        (this.currentPlayer && e.owner !== this.currentPlayer) ||
                        (this.unitPaths.set(e, u.cloneConfig(e.unitOrderTrait.targetLinesConfig)),
                        this.updateLines(e),
                        (e.zone !== d.ZoneType.Air && !u.configHasTarget(e.unitOrderTrait.targetLinesConfig)) ||
                          this.showLines(e, n));
                    })
                  );
                {
                  let t = !1;
                  if (
                    (this.unitSelection.getSelectedUnits().forEach((e) => {
                      if (e.isUnit() && (!this.currentPlayer || e.owner === this.currentPlayer)) {
                        (this.unitPaths.has(e) &&
                          u.configsAreEqual(this.unitPaths.get(e), e.unitOrderTrait.targetLinesConfig)) ||
                          e.unitOrderTrait.targetLinesConfig?.isRecalc ||
                          (this.unitPaths.set(e, u.cloneConfig(e.unitOrderTrait.targetLinesConfig)),
                          (t = !0),
                          this.updateLines(e),
                          u.configHasTarget(e.unitOrderTrait.targetLinesConfig) && this.showLines(e, n));
                        let i = this.unitLines.get(e),
                          r = e.position.worldPosition;
                        if (i) {
                          var s = !r.equals(i.srcLineHead.position),
                            a = e.unitOrderTrait.targetLinesConfig?.target;
                          let t = a ? a.position.worldPosition : void 0;
                          a = t && !t.equals(i.destLineHead.position);
                          if (s || a) {
                            let e = i.line.geometry;
                            ((e.verticesNeedUpdate = !0),
                              s &&
                                (e.vertices[e.vertices.length - 1].copy(r),
                                i.srcLineHead.position.copy(r),
                                i.srcLineHead.updateMatrix()),
                              t &&
                                a &&
                                (e.vertices[0].copy(t),
                                i.destLineHead.position.copy(t),
                                i.destLineHead.updateMatrix()));
                          }
                        }
                      }
                    }),
                    t)
                  )
                    return;
                }
                void 0 !== this.showStart && 1e3 <= n - this.showStart && this.hideAllLines();
              }
            }
            showLines(e, t) {
              ((this.showStart = t), (this.unitLines.get(e).root.visible = !0));
            }
            hideAllLines() {
              ((this.showStart = void 0), this.unitLines.forEach((e) => (e.root.visible = !1)));
            }
            updateLines(e) {
              let t = e.unitOrderTrait.targetLinesConfig;
              if (!t || !u.configHasTarget(t)) {
                if (e.zone !== d.ZoneType.Air)
                  return void (
                    this.unitLines.has(e) &&
                    ((s = this.unitLines.get(e)),
                    this.obj?.remove(s.root),
                    this.disposeLineObjects(s),
                    this.unitLines.delete(e))
                  );
                t = {
                  pathNodes: [
                    { tile: e.tile, onBridge: void 0 },
                    { tile: e.tile, onBridge: void 0 },
                  ],
                };
              }
              let i = new THREE.Geometry(),
                r = t.pathNodes;
              r.length
                ? (this.debugPaths.value || (r = [r[0], r[r.length - 1]]),
                  r.forEach((e) => {
                    var t = h.Coords.tile3dToWorld(
                      e.tile.rx + 0.5,
                      e.tile.ry + 0.5,
                      e.tile.z + (e.onBridge?.tileElevation ?? 0),
                    );
                    i.vertices.push(t);
                  }),
                  i.vertices[i.vertices.length - 1].copy(e.position.worldPosition))
                : ((a = t.target), i.vertices.push(a.position.worldPosition, e.position.worldPosition));
              var s = !!t.isAttack,
                a = s ? this.attackLineMaterial : this.moveLineMaterial;
              let n = new THREE.Line(i, a);
              n.matrixAutoUpdate = !1;
              let o = this.createLineHead(s);
              (o.position.copy(i.vertices[i.vertices.length - 1]), (o.matrixAutoUpdate = !1), o.updateMatrix());
              let l = this.createLineHead(s);
              (l.position.copy(i.vertices[0]),
                (l.matrixAutoUpdate = !1),
                l.updateMatrix(),
                (n.renderOrder = o.renderOrder = l.renderOrder = 1e6));
              let c = new THREE.Object3D();
              ((c.matrixAutoUpdate = !1),
                (c.visible = !1),
                c.add(n),
                c.add(o),
                c.add(l),
                this.unitLines.has(e) &&
                  ((s = this.unitLines.get(e)), this.obj?.remove(s.root), this.disposeLineObjects(s)),
                this.unitLines.set(e, { root: c, line: n, srcLineHead: o, destLineHead: l }),
                this.obj?.add(c));
            }
            createLineHead(e) {
              let t = new THREE.Mesh(
                this.lineHeadGeometry,
                e ? this.attackLineHeadMaterial : this.moveLineHeadMaterial,
              );
              var i = new THREE.Quaternion().setFromEuler(this.camera.rotation);
              return (t.setRotationFromQuaternion(i), t);
            }
            disposeUnitLines() {
              ([...this.unitLines.values()].forEach((e) => this.disposeLineObjects(e)), this.unitLines.clear());
            }
            disposeLineObjects(e) {
              e.line.geometry.dispose();
            }
            dispose() {
              (this.disposeUnitLines(),
                this.attackLineMaterial?.dispose(),
                this.attackLineHeadMaterial?.dispose(),
                this.moveLineMaterial?.dispose(),
                this.moveLineHeadMaterial?.dispose(),
                this.lineHeadGeometry.dispose());
            }
          }),
        );
      },
    };
  },
);
