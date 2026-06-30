// === Reconstructed SystemJS module: game/Traits ===
// deps: []
// Note: variable/type names are minified approximations of the original TypeScript.

System.register("game/Traits", [], function (e, t) {
  "use strict";
  var i;
  t && t.id;
  return {
    setters: [],
    execute: function () {
      e(
        "Traits",
        (i = class {
          constructor() {
            ((this.allTraits = []), (this.traitsByTypeCache = new Map()));
          }
          add(e) {
            (this.allTraits.push(e), this.traitsByTypeCache.clear());
          }
          addToFront(e) {
            (this.allTraits.unshift(e), this.traitsByTypeCache.clear());
          }
          remove(e) {
            var t = this.allTraits.indexOf(e);
            -1 !== t && (this.allTraits.splice(t, 1), this.traitsByTypeCache.clear());
          }
          filter(t) {
            let e = this.traitsByTypeCache.get(t);
            return (
              e ||
                ((e =
                  "function" == typeof t
                    ? this.allTraits.filter((e) => e instanceof t)
                    : this.allTraits.filter((e) => this.traitImplements(e, t))),
                this.traitsByTypeCache.set(t, e)),
              e
            );
          }
          get(e) {
            var t = this.find(e);
            if (!t) throw new Error("No matching trait found");
            return t;
          }
          find(e) {
            return this.filter(e)[0];
          }
          getAll() {
            return this.allTraits;
          }
          traitImplements(e, t) {
            for (var i of Object.getOwnPropertyNames(t)) if (void 0 === e[t[i]]) return !1;
            return !0;
          }
          clear() {
            ((this.allTraits.length = 0), this.traitsByTypeCache.clear());
          }
          dispose() {
            (this.getAll().forEach((e) => e.dispose?.()), this.clear());
          }
        }),
      );
    },
  };
});
