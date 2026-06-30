// === Reconstructed SystemJS module: gui/screen/mainMenu/modSel/ModMeta ===
// deps: ["gui/screen/mainMenu/modSel/ModManager"]
// Note: variable/type names are minified approximations of the original TypeScript.

System.register("gui/screen/mainMenu/modSel/ModMeta", ["gui/screen/mainMenu/modSel/ModManager"], function (e, t) {
  "use strict";
  var s, i;
  t && t.id;
  return {
    setters: [
      function (e) {
        s = e;
      },
    ],
    execute: function () {
      e(
        "ModMeta",
        (i = class i {
          constructor() {
            ((this.supported = !1), (this.manualDownload = !1));
          }
          fromIniFile(e) {
            var t = e.getSection("General");
            if (!t) throw new Error("Mod meta missing [General] section");
            return (this.fromIniSection(t), this);
          }
          fromIniSection(e) {
            let t = e.getString("ID");
            var i = e.getString("Name");
            if (!t) throw new Error("Mod meta missing ID");
            if (!t.match(s.ModManager.modIdRegex))
              throw new Error(
                `Mod meta has invalid ID "${t}". ` +
                  "ID must contain only alphanumeric characters, dash (-) or underscore (_)",
              );
            if (!i) throw new Error("Mod meta missing Name");
            ((this.id = t),
              (this.name = i),
              (this.supported = !0),
              (this.description = e.getString("Description") || void 0));
            i = e.get("Author");
            i && (this.authors = Array.isArray(i) ? i : [i]);
            let r = e.getString("Website");
            return (
              r && (r.match(/^https?:\/\//) ? (this.website = r) : console.warn(`Invalid mod meta website "${r}"`)),
              (this.version = e.getString("Version") || void 0),
              (this.download = e.getString("Download") || void 0),
              (this.downloadSize = e.getNumber("DownloadSize") || void 0),
              (this.manualDownload = e.getBool("ManualDownload")),
              this
            );
          }
          clone() {
            let e = new i();
            return (
              (e.id = this.id),
              (e.name = this.name),
              (e.supported = this.supported),
              (e.description = this.description),
              (e.authors = this.authors?.slice()),
              (e.website = this.website),
              (e.version = this.version),
              (e.download = this.download),
              (e.downloadSize = this.downloadSize),
              (e.manualDownload = this.manualDownload),
              e
            );
          }
        }),
      );
    },
  };
});
