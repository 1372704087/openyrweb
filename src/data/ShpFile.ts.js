// === Reconstructed SystemJS module: data/ShpFile ===
// deps: ["data/encoding/Format3","data/ShpImage","data/vfs/VirtualFile"]
// Note: variable/type names are minified approximations of the original TypeScript.

System.register("data/ShpFile", ["data/encoding/Format3", "data/ShpImage", "data/vfs/VirtualFile"], function (e, t) {
  "use strict";
  var l, d, i, r;
  t && t.id;
  return {
    setters: [
      function (e) {
        l = e;
      },
      function (e) {
        d = e;
      },
      function (e) {
        i = e;
      },
    ],
    execute: function () {
      e(
        "ShpFile",
        (r = class r {
          constructor(e) {
            ((this.height = 0),
              (this.width = 0),
              (this.numImages = 0),
              (this.images = []),
              e instanceof i.VirtualFile && this.fromVirtualFile(e));
          }
          fromVirtualFile(e) {
            this.filename = e.filename;
            let s = e.stream;
            if (0 === s.readInt16()) {
              ((this.width = s.readInt16()), (this.height = s.readInt16()), (this.numImages = s.readInt16()));
              let i = [];
              for (let e = 0; e < this.numImages; ++e) i.push(this.readFrameHeader(s));
              this.images = [];
              for (let r = 0; r < this.numImages; ++r) {
                var { compressionType: a, imageDataStartOffset: n, x: o, y: l, width: c, height: h } = i[r];
                let e = r < this.numImages - 1 ? i[r + 1].imageDataStartOffset : s.byteLength;
                e < n && (e = s.byteLength);
                var u = e - n;
                s.seek(n);
                u = this.readImageData(s, c, h, a, u);
                let t = new d.ShpImage(u);
                ((t.x = o), (t.y = l), (t.width = c), (t.height = h), this.images.push(t));
              }
            }
          }
          readFrameHeader(e) {
            var t = e.readInt16(),
              i = e.readInt16(),
              r = e.readInt16(),
              s = e.readInt16(),
              a = e.readUint8();
            return (
              e.readUint8(),
              e.readUint8(),
              e.readUint8(),
              e.readInt32(),
              e.readInt32(),
              { x: t, y: i, width: r, height: s, compressionType: a, imageDataStartOffset: e.readInt32() }
            );
          }
          readImageData(r, e, s, t, i) {
            var a = e * s;
            if (t <= 1) {
              var n = new Uint8Array(r.buffer, r.byteOffset + r.position, a);
              return ((r.position += a), n);
            }
            if (2 === t) {
              let e = 0,
                t = new Uint8Array(a);
              for (let i = 0; i < s; ++i) {
                var o = r.readUint16() - 2;
                (t.set(new Uint8Array(r.buffer, r.byteOffset + r.position, o), e), (r.position += o), (e += o));
              }
              return t;
            }
            if (3 !== t) return new Uint8Array();
            a = new Uint8Array(r.buffer, r.byteOffset + r.position, i);
            return ((r.position += i), l.Format3.decode(a, e, s));
          }
          getImage(e) {
            if (e < 0 || this.images.length <= e)
              throw new RangeError(
                `Image index out of bounds (file=${this.filename}, index=${e}, length=${this.images.length})`,
              );
            return this.images[e];
          }
          addImage(e) {
            (this.images.push(e), this.numImages++);
          }
          clip(e, t) {
            let i = new r();
            return (
              (i.filename = this.filename),
              (i.width = Math.min(this.width, e)),
              (i.height = Math.min(this.height, t)),
              (i.images = this.images.map((e) => e.clip(i.width, i.height))),
              (i.numImages = this.numImages),
              i
            );
          }
        }),
      );
    },
  };
});
