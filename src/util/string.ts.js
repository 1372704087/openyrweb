// === Reconstructed SystemJS module: util/string ===
// deps: ["util/Base64"]
// Note: variable/type names are minified approximations of the original TypeScript.

System.register("util/string", ["util/Base64"], function (e, t) {
  "use strict";
  var i;
  t && t.id;
  function r(e) {
    var t = e.length;
    let i = new Uint8Array(t);
    for (let r = 0; r < t; r++) i[r] = e.charCodeAt(r);
    return i;
  }
  function s(e) {
    return e.reduce((e, t) => e + String.fromCharCode(t), "");
  }
  return (
    e("pad", function (e, t = "0000") {
      var i = "" + e;
      return t.substring(0, t.length - i.length) + i;
    }),
    e("equalsIgnoreCase", function (e, t) {
      return e.toLowerCase() === t.toLowerCase();
    }),
    e("binaryStringToUint8Array", r),
    e("base64StringToUint8Array", function (e) {
      return r(i.Base64.decode(e));
    }),
    e("uint8ArrayToBase64String", function (e) {
      return i.Base64.encode(s(e));
    }),
    e("uint8ArrayToBinaryString", s),
    e("utf16ToBinaryString", function (e) {
      var t = e.length;
      let i = "";
      for (let s = 0; s < t; s++) {
        var r = e.charCodeAt(s);
        ((i += String.fromCharCode(r >> 8)), (i += String.fromCharCode(255 & r)));
      }
      return i;
    }),
    e("binaryStringToUtf16", function (e) {
      var t = e.length;
      let i = "";
      for (let s = 0; s < t; s += 2) {
        var r = (e.charCodeAt(s) << 8) + e.charCodeAt(s + 1);
        i += String.fromCharCode(r);
      }
      return i;
    }),
    e("bufferToHexString", function (e) {
      const t = [],
        i = new DataView(e);
      for (let s = 0; s < i.byteLength; s += 4) {
        const a = i.getUint32(s);
        var r = "00000000",
          r = (r + a.toString(16)).slice(-r.length);
        t.push(r);
      }
      return t.join("");
    }),
    {
      setters: [
        function (e) {
          i = e;
        },
      ],
      execute: function () {},
    }
  );
});
