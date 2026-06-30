// === Reconstructed SystemJS module: gui/screen/mainMenu/modSel/Mod ===
// deps: ["gui/screen/mainMenu/modSel/ModStatus"]
// Note: variable/type names are minified approximations of the original TypeScript.

System.register("gui/screen/mainMenu/modSel/Mod", ["gui/screen/mainMenu/modSel/ModStatus"], function (e, t) {
  "use strict";
  var i, r;
  t && t.id;
  return {
    setters: [
      function (e) {
        i = e;
      },
    ],
    execute: function () {
      e(
        "Mod",
        (r = class {
          get id() {
            return this.meta.id;
          }
          get name() {
            return this.meta.name;
          }
          get supported() {
            return this.meta.supported;
          }
          constructor(e, t) {
            if (e)
              t && t.version !== e.version
                ? ((this.status = i.ModStatus.UpdateAvailable),
                  (this.meta = e.clone()),
                  (this.meta.download = t.download),
                  (this.meta.downloadSize = t.downloadSize),
                  (this.meta.manualDownload = t.manualDownload),
                  (this.latestVersion = t.version))
                : ((this.status = i.ModStatus.Installed), (this.meta = e), (this.latestVersion = e.version));
            else {
              if (((this.status = i.ModStatus.NotInstalled), !t))
                throw new Error("At least a local or remote meta must be specified");
              ((this.meta = t), (this.latestVersion = t.version));
            }
          }
          isInstalled() {
            return this.status !== i.ModStatus.NotInstalled;
          }
        }),
      );
    },
  };
});
