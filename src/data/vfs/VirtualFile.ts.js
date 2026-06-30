// === Reconstructed SystemJS module: data/vfs/VirtualFile ===
// deps: ["data/DataStream","data/vfs/IOError"]
// Note: variable/type names are minified approximations of the original TypeScript.

System.register("data/vfs/VirtualFile", ["data/DataStream", "data/vfs/IOError"], function (e, t) {
  "use strict";
  var n, i, r;
  t && t.id;
  return {
    setters: [
      function (e) {
        n = e;
      },
      function (e) {
        i = e;
      },
    ],
    execute: function () {
      e(
        "VirtualFile",
        (r = class {
          static async fromRealFile(t) {
            try {
              const e = new n.DataStream(await t.arrayBuffer());
              return ((e._trimAlloc = () => {}), new this(e, t.name));
            } catch (e) {
              if (e instanceof DOMException)
                throw new i.IOError(`File "${t.name}" could not be read (${e.name})`, { cause: e });
              throw e;
            }
          }
          static fromBytes(e, t) {
            let i = new n.DataStream(e);
            return ((i._trimAlloc = () => {}), new this(i, t));
          }
          static factory(e, t, i = 0, r = e.byteLength) {
            var s = new DataView(e.buffer, e.byteOffset + i, r);
            const a = new n.DataStream(s);
            return ((a._trimAlloc = () => {}), new this(a, t));
          }
          constructor(e, t) {
            ((this.stream = e), (this.filename = t));
          }
          readAsString(e) {
            return (this.stream.seek(0), this.stream.readString(this.stream.byteLength, e));
          }
          getBytes() {
            return new Uint8Array(this.stream.buffer, this.stream.byteOffset, this.stream.byteLength);
          }
          getSize() {
            return this.stream.byteLength;
          }
          asFile(e) {
            return new File([this.getBytes()], this.filename, { type: e });
          }
        }),
      );
    },
  };
});
