// === Reconstructed SystemJS module: engine/renderable/fx/TeslaFx ===
// deps: ["game/Coords"]
// Note: variable/type names are minified approximations of the original TypeScript.

System.register("engine/renderable/fx/TeslaFx", ["game/Coords"], function (e, t) {
  "use strict";
  var r, i;
  t && t.id;
  return {
    setters: [
      function (e) {
        r = e;
      },
    ],
    execute: function () {
      e(
        "TeslaFx",
        (i = class {
          constructor(e, t, i, r, s) {
            ((this.sourcePos = e),
              (this.targetPos = t),
              (this.primaryColor = i),
              (this.secondaryColor = r),
              (this.durationSeconds = s),
              (this.bolts = []),
              (this.boltMeshes = []));
          }
          setContainer(e) {
            this.container = e;
          }
          get3DObject() {
            return this.target;
          }
          create3DObject() {
            if (!this.target) {
              ((this.target = new THREE.Object3D()), (this.target.name = "fx_tesla"));
              var t = this.primaryColor.getHex();
              let e = [t, t, this.secondaryColor.getHex()];
              e.forEach((e) => {
                try {
                  var { mesh: t, bolt: i } = this.createBolt(e);
                  (this.boltMeshes.push(t), this.bolts.push(i), this.target.add(t));
                } catch (e) {
                  console.warn("Couldn't create lightning FX", [e]);
                }
              });
            }
          }
          update(e) {
            this.firstUpdateMillis || (this.firstUpdateMillis = e);
            let t = (e - this.firstUpdateMillis) / 1e3;
            this.timeLeft = Math.max(0, 1 - t / this.durationSeconds);
            try {
              this.bolts.forEach((e) => e.update(t));
            } catch (e) {
              console.warn("Couldn't update lightning FX", [e]);
            }
            this.isFinished() && (this.container.remove(this), this.dispose());
          }
          createBolt(e) {
            var t = this.sourcePos.clone(),
              i = this.targetPos.clone(),
              t = new THREE.LightningStrike({
                sourceOffset: t,
                destOffset: i,
                radius0: 0.3 * r.Coords.ISO_WORLD_SCALE,
                radius1: 0.3 * r.Coords.ISO_WORLD_SCALE,
                isEternal: !0,
                timeScale: 2,
                propagationTimeFactor: 0.05,
                vanishingTimeFactor: 0.95,
                ramification: 0,
                roughness: 0.85,
                straightness: 0.7,
              }),
              i = new THREE.MeshBasicMaterial({ color: e });
            return { mesh: new THREE.Mesh(t, i), bolt: t };
          }
          isFinished() {
            return 0 === this.timeLeft;
          }
          dispose() {
            this.boltMeshes.forEach((e) => {
              (e.geometry.dispose(), e.material.dispose());
            });
          }
        }),
      );
    },
  };
});
