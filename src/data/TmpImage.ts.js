// === Reconstructed SystemJS module: data/TmpImage ===
// deps: []
// Note: variable/type names are minified approximations of the original TypeScript.

System.register("data/TmpImage", [], function (t, e) {
  "use strict";
  var a, r, i;
  e && e.id;
  return {
    setters: [],
    execute: function () {
      var e;
      (((e = a = a || {})[(e.ExtraData = 1)] = "ExtraData"),
        (e[(e.ZData = 2)] = "ZData"),
        (e[(e.DamagedData = 4)] = "DamagedData"),
        (r = (e) => (e < 0 ? e + 256 : e)),
        t(
          "TmpImage",
          (i = class {
            constructor(e, t, i) {
              this.fromStream(e, t, i);
            }
            fromStream(e, t, i) {
              ((this.x = e.readInt32()), (this.y = e.readInt32()), e.readInt32(), e.readInt32());
              var r = e.readInt32();
              ((this.extraX = e.readInt32()),
                (this.extraY = e.readInt32()),
                (this.extraWidth = e.readInt32()),
                (this.extraHeight = e.readInt32()));
              var s = e.readUint32();
              ((this.height = e.readUint8()),
                (this.terrainType = e.readUint8()),
                (this.rampType = e.readUint8()),
                (this.radarLeft = this.readRadarRgb(e.readInt8(), e.readInt8(), e.readInt8())),
                (this.radarRight = this.readRadarRgb(e.readInt8(), e.readInt8(), e.readInt8())),
                e.seek(e.position + 3),
                (this.tileData = new Uint8Array(e.buffer, e.byteOffset + e.position, (t * i) / 2)),
                (e.position += (t * i) / 2),
                (this.hasZData = (s & a.ZData) === a.ZData),
                this.hasZData && (e.position += (t * i) / 2),
                (this.hasExtraData = (s & a.ExtraData) === a.ExtraData),
                this.hasExtraData &&
                  ((s = Math.abs(this.extraWidth * this.extraHeight)),
                  (this.extraData = new Uint8Array(e.buffer, e.byteOffset + e.position, s)),
                  (e.position += s)),
                this.hasZData &&
                  this.hasExtraData &&
                  0 < r &&
                  r < e.byteLength &&
                  (e.position += Math.abs(this.extraWidth * this.extraHeight)));
            }
            readRadarRgb(e, t, i) {
              return new THREE.Color(r(e) / 255, r(t) / 255, r(i) / 255);
            }
          }),
        ));
    },
  };
});
