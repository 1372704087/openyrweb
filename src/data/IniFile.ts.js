// === Reconstructed SystemJS module: data/IniFile ===
// deps: ["data/IniSection","data/IniParser","data/vfs/VirtualFile"]
// Note: variable/type names are minified approximations of the original TypeScript.

System.register("data/IniFile", ["data/IniSection", "data/IniParser", "data/vfs/VirtualFile"], function (e, t) {
  "use strict";
  var r, i, s, a;
  t && t.id;
  return {
    setters: [
      function (e) {
        r = e;
      },
      function (e) {
        i = e;
      },
      function (e) {
        s = e;
      },
    ],
    execute: function () {
      e(
        "IniFile",
        (a = class a {
          constructor(e) {
            ((this.sections = new Map()),
              e instanceof s.VirtualFile
                ? this.fromVirtualFile(e)
                : "object" == typeof e
                  ? this.fromJson(e)
                  : "string" == typeof e && this.fromString(e));
          }
          fromVirtualFile(e) {
            return this.fromString(e.readAsString());
          }
          fromString(e) {
            return this.fromJson(new i.IniParser().parse(e));
          }
          fromJson(e) {
            for (var t in e) {
              var i;
              e.hasOwnProperty(t) && ((i = new r.IniSection(t).fromJson(e[t])), this.sections.set(t, i));
            }
            return this;
          }
          toString() {
            let e = [];
            for (var t of this.sections.values()) e.push(t.toString());
            return e.join("\r\n");
          }
          clone() {
            let i = new a();
            return (
              this.sections.forEach((e, t) => {
                i.sections.set(t, e.clone());
              }),
              i
            );
          }
          getOrCreateSection(e) {
            let t = this.sections.get(e);
            return (t || ((t = new r.IniSection(e)), this.sections.set(e, t)), t);
          }
          getSection(e) {
            return this.sections.get(e);
          }
          getOrderedSections() {
            return [...this.sections.values()];
          }
          mergeWith(e) {
            return (
              e.sections.forEach((e, t) => {
                let i = this.getOrCreateSection(t);
                i.mergeWith(e);
              }),
              this
            );
          }
        }),
      );
    },
  };
});
