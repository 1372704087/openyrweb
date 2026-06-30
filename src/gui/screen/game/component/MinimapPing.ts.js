// === Reconstructed SystemJS module: gui/screen/game/component/MinimapPing ===
// deps: ["gui/UiObject"]
// Note: variable/type names are minified approximations of the original TypeScript.

System.register("gui/screen/game/component/MinimapPing", ["gui/UiObject"], function (e, t) {
  "use strict";
  var i, r;
  t && t.id;
  return {
    setters: [
      function (e) {
        i = e;
      },
    ],
    execute: function () {
      ((r = class extends i.UiObject {
        constructor(e, t, i) {
          (super(),
            (this.radarRules = e),
            (this.colorLerpFactor = 0),
            (this.hiColor = new THREE.Color(t)),
            (this.lowColor = new THREE.Color(i)),
            (this.matHiColor = this.hiColor.clone()),
            (this.matLowColor = this.lowColor.clone()));
          var r = e.eventMinRadius;
          let s = this.createPingRectLine(r, r, this.matHiColor, this.matLowColor);
          ((s.name = "minimap_ping"),
            (s.scale.x = 15),
            (s.scale.y = 15),
            this.set3DObject(s),
            (this.get3DObject().matrixAutoUpdate = !0));
        }
        createPingRectLine(e, t, i, r) {
          let s = new THREE.Geometry(),
            a = [
              new THREE.Vector3(-0.5 * e, -0.5 * t, 0),
              new THREE.Vector3(-0.5 * e, 0.5 * t, 0),
              new THREE.Vector3(0.5 * e, 0.5 * t, 0),
              new THREE.Vector3(0.5 * e, -0.5 * t, 0),
            ],
            n = [i, r];
          a.forEach((e, t) => {
            (s.vertices.push(e, a[(t + 1) % a.length]), s.colors.push(n[t % 2], n[(t + 1) % 2]));
          });
          var o = new THREE.LineBasicMaterial({ vertexColors: THREE.VertexColors, side: THREE.DoubleSide });
          return new THREE.LineSegments(s, o);
        }
        get3DObject() {
          return super.get3DObject();
        }
        update(e) {
          (super.update(e), this.lastUpdate || (this.lastUpdate = e));
          var t = ((e - this.lastUpdate) / 1e3) * 60;
          this.lastUpdate = e;
          let i = this.get3DObject();
          var r = this.radarRules.eventSpeed / this.radarRules.eventMinRadius;
          ((i.scale.x = Math.max(1, i.scale.x - r * t)),
            (i.scale.y = Math.max(1, i.scale.y - r * t)),
            (i.rotation.z = i.rotation.z + this.radarRules.eventRotationSpeed * t),
            1 === i.scale.x &&
              (i.rotation.z = Math.min(i.rotation.z, (Math.floor(i.rotation.z / (Math.PI / 2)) * Math.PI) / 2)),
            (this.colorLerpFactor = (this.colorLerpFactor + this.radarRules.eventColorSpeed * t) % 2));
          t = Math.min(1, this.colorLerpFactor) - Math.max(0, this.colorLerpFactor - 1);
          (this.matHiColor.copy(this.hiColor).lerp(this.lowColor, t),
            this.matLowColor.copy(this.lowColor).lerp(this.hiColor, t),
            (i.geometry.colorsNeedUpdate = !0));
        }
        destroy() {
          (super.destroy(), this.get3DObject().material.dispose(), this.get3DObject().geometry.dispose());
        }
      }),
        e("MinimapPing", r));
    },
  };
});
