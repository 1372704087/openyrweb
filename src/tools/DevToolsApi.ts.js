// === Reconstructed SystemJS module: tools/DevToolsApi ===
// deps: []
// Note: variable/type names are minified approximations of the original TypeScript.

System.register("tools/DevToolsApi", [], function (e, t) {
  "use strict";
  var i;
  t && t.id;
  return {
    setters: [],
    execute: function () {
      (e(
        "DevToolsApi",
        (i = class {
          static getPublicNamespace() {
            return (window.r = window.r || Object.create(null));
          }
          static registerCommand(e, t) {
            var i = this.getPublicNamespace();
            i[e]
              ? console.error(`Command ${e} is already registered`)
              : (this.cmdHandlers.set(e, t),
                Object.defineProperty(i, e, { configurable: !0, get: () => this.cmdHandlers.get(e)() }));
          }
          static unregisterCommand(t) {
            if (this.cmdHandlers.has(t)) {
              this.cmdHandlers.delete(t);
              let e = this.getPublicNamespace();
              delete e[t];
            } else console.error(`Command ${t} is not registered`);
          }
          static registerVar(t, e) {
            var i = this.getPublicNamespace();
            i[t]
              ? console.error(`Runtime variable ${t} is already registered`)
              : (this.runtimeVars.set(t, e),
                Object.defineProperty(i, t, {
                  configurable: !0,
                  get: () => this.runtimeVars.get(t).value,
                  set: (e) => {
                    this.runtimeVars.get(t).value = e;
                  },
                }));
          }
          static unregisterVar(t) {
            if (this.runtimeVars.has(t)) {
              this.runtimeVars.delete(t);
              let e = this.getPublicNamespace();
              delete e[t];
            } else console.error(`Runtime variable ${t} is not registered`);
          }
          static listVars() {
            return this.runtimeVars.keys();
          }
          static listCommands() {
            return this.cmdHandlers.keys();
          }
        }),
      ),
        (i.cmdHandlers = new Map()),
        (i.runtimeVars = new Map()));
    },
  };
});
