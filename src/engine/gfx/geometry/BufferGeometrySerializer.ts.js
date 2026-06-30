// === Reconstructed SystemJS module: engine/gfx/geometry/BufferGeometrySerializer ===
// deps: ["data/DataStream"]
// Note: variable/type names are minified approximations of the original TypeScript.

System.register("engine/gfx/geometry/BufferGeometrySerializer", ["data/DataStream"], function (e, t) {
  "use strict";
  var o, i;
  t && t.id;
  return {
    setters: [
      function (e) {
        o = e;
      },
    ],
    execute: function () {
      e(
        "BufferGeometrySerializer",
        (i = class {
          serialize(e) {
            if (Object.keys(e.morphAttributes).length) throw new Error("Morph attributes are not supported");
            if (1 < e.groups.length) throw new Error("Groups are not supported");
            var t,
              i = Object.keys(e.attributes),
              r = e.index,
              s =
                1 +
                22 * i.length +
                Object.values(e.attributes)
                  .map((e) => this.getTypedArrayByteSize(e.array))
                  .reduce((e, t) => e + t, 0) +
                1 +
                (r ? this.getTypedArrayByteSize(r.array) : 0);
            let a = new o.DataStream(new ArrayBuffer(s));
            a.writeUint8(i.length);
            for (t of i) {
              var n = e.getAttribute(t);
              (a.writeCString(t, 20),
                a.writeUint8(n.itemSize),
                a.writeUint8(Number(n.normalized)),
                this.writeTypedArray(a, n.array));
            }
            return (
              a.writeUint8(Number(Boolean(r))),
              r && this.writeTypedArray(a, r.array),
              a.seek(0),
              (a.dynamicSize = !1),
              a.buffer
            );
          }
          unserialize(e) {
            let t = new THREE.BufferGeometry();
            var i,
              r = e.readUint8();
            for (let l = 0; l < r; l++) {
              var s = e.readCString(20),
                a = e.readUint8(),
                n = Boolean(e.readUint8()),
                o = this.readTypedArray(e),
                n = new THREE.BufferAttribute(o, a, n);
              t.addAttribute(s, n);
            }
            return (
              Boolean(e.readUint8()) && ((i = this.readTypedArray(e)), t.setIndex(new THREE.BufferAttribute(i, 1))),
              t
            );
          }
          writeTypedArray(e, t) {
            if ((e.writeUint32(t.length), t instanceof Float32Array)) (e.writeUint8(0), e.writeFloat32Array(t));
            else if (t instanceof Uint32Array) (e.writeUint8(1), e.writeUint32Array(t));
            else {
              if (!(t instanceof Uint16Array)) throw new Error(`Unsupported array type "${t.constructor.name}"`);
              (e.writeUint8(2), e.writeUint16Array(t));
            }
          }
          readTypedArray(e) {
            var t = e.readUint32(),
              i = e.readUint8();
            switch (i) {
              case 0:
                return e.readFloat32Array(t);
              case 1:
                return e.readUint32Array(t);
              case 2:
                return e.readUint16Array(t);
              default:
                throw new Error(`Unsupported array type "${i}"`);
            }
          }
          getTypedArrayByteSize(e) {
            return 5 + e.BYTES_PER_ELEMENT * e.length;
          }
        }),
      );
    },
  };
});
