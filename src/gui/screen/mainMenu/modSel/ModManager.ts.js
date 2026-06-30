// === Reconstructed SystemJS module: gui/screen/mainMenu/modSel/ModManager ===
// deps: ["data/IniFile","RouteHelper","gui/screen/mainMenu/modSel/Mod","gui/screen/mainMenu/modSel/ModMeta"]
// Note: variable/type names are minified approximations of the original TypeScript.

System.register(
  "gui/screen/mainMenu/modSel/ModManager",
  ["data/IniFile", "RouteHelper", "gui/screen/mainMenu/modSel/Mod", "gui/screen/mainMenu/modSel/ModMeta"],
  function (e, t) {
    "use strict";
    var n, i, o, l, c;
    t && t.id;
    return {
      setters: [
        function (e) {
          n = e;
        },
        function (e) {
          i = e;
        },
        function (e) {
          o = e;
        },
        function (e) {
          l = e;
        },
      ],
      execute: function () {
        (e(
          "ModManager",
          (c = class c {
            constructor(e, t, i) {
              ((this.location = e), (this.modDir = t), (this.appResourceLoader = i));
            }
            getModDir() {
              return this.modDir;
            }
            async buildModList(e, t) {
              let i = [];
              t = [...(t ?? [])];
              for (let a of e) {
                var r = t.findIndex((e) => e.id === a.id),
                  r = -1 !== r ? t.splice(r, 1)[0] : void 0;
                i.push(new o.Mod(a, r));
              }
              for (var s of t) i.push(new o.Mod(void 0, s));
              return i;
            }
            async listRemote() {
              var e,
                t = await this.appResourceLoader.loadText(c.remoteListFileName);
              let i = new n.IniFile(t),
                r = i.getSection("General");
              if (!r) throw new Error(c.remoteListFileName + " is missing the [General] section");
              let s = [];
              for (e of r.entries.values()) {
                var a = i.getSection(e);
                a
                  ? ((a = new l.ModMeta().fromIniSection(a)), s.push(a))
                  : console.warn(`Mod "${e}" has no INI section`);
              }
              return s;
            }
            async listLocal() {
              let e = [];
              if (this.modDir)
                for await (var t of this.modDir.getEntries()) {
                  t = await this.loadModMeta(t);
                  e.push(t);
                }
              return (e.sort((e, t) => e.name.localeCompare(t.name)), e);
            }
            async loadModMeta(i) {
              let r = new l.ModMeta();
              ((r.id = i), (r.name = i));
              try {
                let e = await this.modDir.getDirectory(i, !0),
                  t = (await e.containsEntry(c.modMetaFileName)) ? await e.getRawFile(c.modMetaFileName) : void 0;
                if (t) {
                  try {
                    r.fromIniFile(new n.IniFile(await t.text()));
                  } catch (e) {
                    (console.warn(`Couldn't parse meta file in mod folder "${i}"`), (r.name = i));
                  }
                  r.id = i;
                }
              } catch (e) {
                console.warn(e);
              }
              return r;
            }
            async deleteModFiles(e) {
              (await this.modDir?.containsEntry(e)) && (await this.modDir.deleteDirectory(e, !0));
            }
            loadMod(e) {
              let t = new URL(this.location.href);
              (e
                ? t.searchParams.set(i.RouteHelper.modQueryStringName, e)
                : t.searchParams.delete(i.RouteHelper.modQueryStringName),
                (this.location.href = t.href));
            }
          }),
        ),
          (c.remoteListFileName = "mods.ini"),
          (c.modMetaFileName = "modcd.ini"),
          (c.modIdRegex = /^[a-z0-9-_]+$/i));
      },
    };
  },
);
