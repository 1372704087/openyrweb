// === Reconstructed SystemJS module: data/WavFile ===
// deps: ["wavefile","data/vfs/VirtualFile"]
// Note: variable/type names are minified approximations of the original TypeScript.

System.register("data/WavFile", ["wavefile", "data/vfs/VirtualFile"], function (e, t) {
  "use strict";
  var i, r, s;
  t && t.id;
  return {
    setters: [
      function (e) {
        i = e;
      },
      function (e) {
        r = e;
      },
    ],
    execute: function () {
      e(
        "WavFile",
        (s = class {
          constructor(e) {
            e instanceof Uint8Array ? this.fromRawData(e) : e instanceof r.VirtualFile && this.fromVirtualFile(e);
          }
          fromRawData(e) {
            return ((this.rawData = e), this);
          }
          fromVirtualFile(e) {
            var t = e.stream;
            return ((this.rawData = new Uint8Array(t.buffer, t.byteOffset, t.byteLength)), this);
          }
          getRawData() {
            return this.rawData;
          }
          getData() {
            if (!this.decodedData) {
              if (!this.rawData) throw new Error("No data loaded");
              ((this.decodedData = this.decodeData(this.rawData)), (this.rawData = void 0));
            }
            return this.decodedData;
          }
          setData(e) {
            ((this.rawData = void 0), (this.decodedData = e));
          }
          decodeData(e) {
            let t = new i.WaveFile(e);
            return ("4" === t.bitDepth && t.fromIMAADPCM(), t.toBuffer());
          }
          isRawImaAdpcm() {
            return this.rawData && "4" === new i.WaveFile(this.rawData).bitDepth;
          }
        }),
      );
    },
  };
});
