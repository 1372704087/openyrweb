// === Reconstructed SystemJS module: engine/renderable/entity/building/PsychicDetectPlugin ===
// deps: ["engine/renderable/fx/DetectionLineFx"]
// Note: variable/type names are minified approximations of the original TypeScript.

System.register(
  "engine/renderable/entity/building/PsychicDetectPlugin",
  ["engine/renderable/fx/DetectionLineFx"],
  function (e, t) {
    "use strict";
    var d, i;
    t && t.id;
    return {
      setters: [
        function (e) {
          d = e;
        },
      ],
      execute: function () {
        e(
          "PsychicDetectPlugin",
          (i = class {
            constructor(e, t, i, r) {
              ((this.gameObject = e),
                (this.psychicDetectorTrait = t),
                (this.localPlayer = i),
                (this.camera = r),
                (this.lineEffects = new Map()));
            }
            onCreate(e) {
              this.renderableManager = e;
            }
            update(e) {
              if (this.localPlayer.value === this.gameObject.owner) {
                let e = this.psychicDetectorTrait.detectionLines;
                var r,
                  s,
                  t,
                  a,
                  n = e !== this.lastDetectionLines;
                this.lastDetectionLines = e;
                let i = e.map((e) => ({ hash: e.source.id + "_" + (e.target.obj?.id ?? e.target.tile.id), line: e }));
                if (n) {
                  for (let t of this.lineEffects.keys())
                    i.find(({ hash: e }) => e === t) ||
                      (this.disposeLine(this.lineEffects.get(t)), this.lineEffects.delete(t));
                  for (var { line: o, hash: l } of i)
                    this.lineEffects.has(l) ||
                      ((r = o.source.position.worldPosition.clone()),
                      (s = o.target.getWorldCoords().clone()),
                      (o = new THREE.Color(o.source.owner.color.asHex())),
                      (o = new d.DetectionLineFx(this.camera, r, s, o, 1e6)),
                      this.lineEffects.set(l, o),
                      this.renderableManager.addEffect(o));
                }
                for ({ line: t, hash: a } of i) {
                  let e = this.lineEffects.get(a);
                  if (!e) throw new Error("Line hash should have been found");
                  var c = t.source.position.worldPosition.clone(),
                    h = t.target.getWorldCoords().clone(),
                    u = new THREE.Color(t.source.owner.color.asHex());
                  (e.color.equals(u) || (e.color.copy(u), (e.needsUpdate = !0)),
                    e.sourcePos.equals(c) || (e.sourcePos.copy(c), (e.needsUpdate = !0)),
                    e.targetPos.equals(h) || (e.targetPos.copy(h), (e.needsUpdate = !0)));
                }
              } else this.lineEffects.forEach((e) => this.disposeLine(e));
            }
            onRemove() {
              ((this.renderableManager = void 0), this.dispose());
            }
            dispose() {
              this.lineEffects.forEach((e) => this.disposeLine(e));
            }
            disposeLine(e) {
              (e.remove(), e.dispose());
            }
          }),
        );
      },
    };
  },
);
