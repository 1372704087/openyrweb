// === Reconstructed SystemJS module: data/AudioBagFile ===
// deps: ["data/DataStream","data/vfs/VirtualFile"]
// Note: variable/type names are minified approximations of the original TypeScript.

System.register("data/AudioBagFile", ["data/DataStream", "data/vfs/VirtualFile"], function (e, t) {
  "use strict";
  var h, i, r;
  t && t.id;
  return {
    setters: [
      function (e) {
        h = e;
      },
      function (e) {
        i = e;
      },
    ],
    execute: function () {
      e(
        "AudioBagFile",
        (r = class {
          constructor() {
            this.fileData = new Map();
          }
          fromVirtualFile(e, t) {
            var i, r;
            for ([i, r] of t.entries) {
              var s = this.buildWavData(e.stream, r);
              this.fileData.set(i, s);
            }
            return this;
          }
          getFileList() {
            return [...this.fileData.keys()];
          }
          containsFile(e) {
            return this.fileData.has(e);
          }
          openFile(e) {
            if (!this.containsFile(e)) throw new Error(`File "${e}" not found`);
            return new i.VirtualFile(this.fileData.get(e), e);
          }
          buildWavData(e, t) {
            let i = new h.DataStream();
            var r,
              s,
              a,
              n,
              o = 0 < (1 & t.flags) ? 2 : 1;
            let l = 0;
            (0 < (2 & t.flags)
              ? (i.writeString("RIFF"),
                i.writeUint32(t.length + 36),
                i.writeString("WAVE"),
                i.writeString("fmt "),
                i.writeInt32(16),
                i.writeInt16(1),
                i.writeInt16(o),
                i.writeUint32(t.sampleRate),
                i.writeUint32(2 * o * t.sampleRate),
                i.writeInt16(2 * o),
                i.writeInt16(16),
                i.writeString("data"),
                i.writeUint32(t.length))
              : 0 < (8 & t.flags) &&
                ((r = 11100 * o * ((t.sampleRate / 22050) | 0)),
                (s = t.chunkSize),
                (a = 1017 * (n = Math.max(2, Math.ceil(t.length / s)))),
                (n = n * s),
                (l = n - t.length),
                i.writeString("RIFF"),
                i.writeUint32(52 + n),
                i.writeString("WAVE"),
                i.writeString("fmt "),
                i.writeUint32(20),
                i.writeInt16(17),
                i.writeInt16(o),
                i.writeUint32(t.sampleRate),
                i.writeInt32(r),
                i.writeInt16(s),
                i.writeInt16(4),
                i.writeInt16(2),
                i.writeInt16(1017),
                i.writeString("fact"),
                i.writeUint32(4),
                i.writeInt32(a),
                i.writeString("data"),
                i.writeUint32(n)),
              e.seek(t.offset),
              i.writeUint8Array(e.readUint8Array(t.length)));
            for (let c = 0; c < l; c++) i.writeUint8(0);
            return (i.seek(0), (i._trimAlloc = () => {}), i);
          }
        }),
      );
    },
  };
});
