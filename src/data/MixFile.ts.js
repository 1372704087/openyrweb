// === Reconstructed SystemJS module: data/MixFile ===
// deps: ["data/DataStream","data/encoding/Blowfish","data/encoding/BlowfishKey","data/MixEntry","data/vfs/VirtualFile"]
// Note: variable/type names are minified approximations of the original TypeScript.

System.register(
  "data/MixFile",
  ["data/DataStream", "data/encoding/Blowfish", "data/encoding/BlowfishKey", "data/MixEntry", "data/vfs/VirtualFile"],
  function (t, e) {
    "use strict";
    var n, o, l, c, i, r, s;
    e && e.id;
    return {
      setters: [
        function (e) {
          n = e;
        },
        function (e) {
          o = e;
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
        var e;
        (((e = r = r || {})[(e.Checksum = 65536)] = "Checksum"),
          (e[(e.Encrypted = 131072)] = "Encrypted"),
          t(
            "MixFile",
            (s = class {
              constructor(e) {
                ((this.stream = e), (this.headerStart = 84), (this.index = new Map()), this.parseHeader());
              }
              parseHeader() {
                var e = this.stream.readUint32(),
                  t = 0 == (e & ~(r.Checksum | r.Encrypted));
                if (t) {
                  if (0 != (e & r.Encrypted)) return void (this.dataStart = this.parseRaHeader());
                } else this.stream.seek(0);
                this.dataStart = this.parseTdHeader(this.stream);
              }
              parseRaHeader() {
                const e = this.stream;
                var t = e.readUint8Array(80),
                  i = new l.BlowfishKey().decryptKey(t),
                  r = e.readUint32Array(2);
                const s = new o.Blowfish(i);
                let a = new n.DataStream(s.decrypt(r));
                t = a.readUint16();
                (a.readUint32(), (e.position = this.headerStart));
                ((i = 6 + t * c.MixEntry.size), (t = ((3 + i) / 4) | 0), (r = e.readUint32Array(t + (t % 2))));
                a = new n.DataStream(s.decrypt(r));
                i = this.headerStart + i + ((1 + (~i >>> 0)) & 7);
                return (this.parseTdHeader(a), i);
              }
              parseTdHeader(e) {
                var t = e.readUint16();
                e.readUint32();
                for (let r = 0; r < t; r++) {
                  var i = new c.MixEntry(e.readUint32(), e.readUint32(), e.readUint32());
                  this.index.set(i.hash, i);
                }
                return e.position;
              }
              containsFile(e) {
                return this.index.has(c.MixEntry.hashFilename(e));
              }
              openFile(e) {
                var t = this.index.get(c.MixEntry.hashFilename(e));
                if (!t) throw new Error(`File "${e}" not found`);
                return i.VirtualFile.factory(this.stream, e, this.dataStart + t.offset, t.length);
              }
            }),
          ));
      },
    };
  },
);
