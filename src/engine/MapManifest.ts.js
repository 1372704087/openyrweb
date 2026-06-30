// === Reconstructed SystemJS module: engine/MapManifest ===
// deps: ["data/IniFile"]
// Note: variable/type names are minified approximations of the original TypeScript.

System.register("engine/MapManifest", ["data/IniFile"], function (e, t) {
  "use strict";
  var o, i;
  t && t.id;
  return {
    setters: [
      function (e) {
        o = e;
      },
    ],
    execute: function () {
      e(
        "MapManifest",
        (i = class {
          fromIni(t, e) {
            return (
              (this.fileName = t.getString("File") || t.name.toLowerCase() + ".map"),
              (this.uiName = t.getString("Description")),
              (this.maxSlots = t.getNumber("MaxPlayers")),
              (this.official = !0),
              (this.gameModes = e.filter((e) => t.getArray("GameMode").includes(e.mapFilter))),
              this
            );
          }
          getFullMapTitle(e) {
            return this.addTitleSlotsSuffix(e.get(this.uiName), this.maxSlots);
          }
          addTitleSlotsSuffix(e, t) {
            return (e.match(/(\(|（)\s*\d(-\d)?\s*(\)|）)\s*$/) || (e += ` (2${2 < t ? "-" + t : ""})`), e);
          }
          fromMapFile(e, t) {
            var i = e.readAsString();
            let r = e.filename;
            const s = new o.IniFile(this.extractIniSection("Basic", i)).getSection("Basic");
            if (!s) throw new Error(`Map "${r}" is missing the [Basic] section`);
            ((this.fileName = r), (this.uiName = "NOSTR:" + (s.getString("Name") || r.replace(/\.[^.]+$/, ""))));
            i = this.extractIniSection("Waypoints", i);
            let a = i ? new o.IniFile(i).getSection("Waypoints") : void 0;
            ((this.maxSlots = [...(a?.entries.keys() ?? [])].filter((e) => Number(e) < 8).length),
              (this.official = s.getBool("Official")));
            let n = s.getArray("GameMode", void 0, ["standard"]);
            return ((this.gameModes = t.filter((e) => n.includes(e.mapFilter))), this);
          }
          extractIniSection(e, t) {
            var i = t.indexOf(`[${e}]`);
            if (-1 !== i) {
              let e = i + 1;
              for (; e < t.length && ("[" !== t[e] || "\n" !== t[e - 1]); e++);
              return t.slice(i, e);
            }
          }
        }),
      );
    },
  };
});
