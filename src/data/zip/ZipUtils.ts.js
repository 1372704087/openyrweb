// === Reconstructed SystemJS module: data/zip/ZipUtils ===
// deps: []
// Note: variable/type names are minified approximations of the original TypeScript.

System.register("data/zip/ZipUtils", [], function (e, t) {
  "use strict";
  var i;
  t && t.id;
  return {
    setters: [],
    execute: function () {
      e(
        "ZipUtils",
        (i = class {
          static createByteArray(e) {
            var t = e.reduce((e, t) => e + (t.size || t.data.length), 0);
            const i = new Uint8Array(t),
              r = new DataView(i.buffer);
            let s = 0;
            return (
              e.forEach((e) => {
                if (void 0 !== e.data.length) (i.set(e.data, s), (s += e.data.length));
                else {
                  switch (e.size) {
                    case 1:
                      r.setInt8(s, parseInt(e.data));
                      break;
                    case 2:
                      r.setInt16(s, parseInt(e.data), !0);
                      break;
                    case 4:
                      r.setInt32(s, parseInt(e.data), !0);
                      break;
                    case 8:
                      r.setBigInt64(s, BigInt(e.data), !0);
                      break;
                    default:
                      throw new Error(
                        "createByteArray: No handler defined for data size " +
                          e.size +
                          " of entry data " +
                          JSON.stringify(e.data),
                      );
                  }
                  s += e.size;
                }
              }),
              i
            );
          }
          static getTimeStruct(e) {
            return (((e.getHours() << 6) | e.getMinutes()) << 5) | (e.getSeconds() / 2);
          }
          static getDateStruct(e) {
            return ((((e.getFullYear() - 1980) << 4) | (e.getMonth() + 1)) << 5) | e.getDate();
          }
        }),
      );
    },
  };
});
