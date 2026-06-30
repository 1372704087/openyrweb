// === Reconstructed SystemJS module: gui/screen/game/worldInteraction/keyboard/KeyBinds ===
// deps: ["data/DataStream","data/IniFile","data/vfs/VirtualFile","gui/screen/game/worldInteraction/keyboard/KeyCommandType"]
// Note: variable/type names are minified approximations of the original TypeScript.

System.register(
  "gui/screen/game/worldInteraction/keyboard/KeyBinds",
  [
    "data/DataStream",
    "data/IniFile",
    "data/vfs/VirtualFile",
    "gui/screen/game/worldInteraction/keyboard/KeyCommandType",
  ],
  function (e, t) {
    "use strict";
    var i, s, r, a, n, o;
    t && t.id;
    return {
      setters: [
        function (e) {
          i = e;
        },
        function (e) {
          s = e;
        },
        function (e) {
          r = e;
        },
        function (e) {
          a = e;
        },
      ],
      execute: function () {
        ((n = new Map([
          [98, 40],
          [100, 37],
          [102, 39],
          [104, 38],
        ])),
          e(
            "KeyBinds",
            (o = class o {
              constructor(e, t, i) {
                ((this.configDir = e), (this.persistFileName = t), (this.defaultIni = i), (this.hotKeys = new Map()));
              }
              async load() {
                this.hotKeys.clear();
                let e = !0,
                  t;
                try {
                  this.configDir &&
                    (await this.configDir.containsEntry(this.persistFileName)) &&
                    ((t = new s.IniFile(await this.configDir.openFile(this.persistFileName))),
                    this.loadHotKeys(t),
                    (e = !1));
                } catch (e) {
                  console.log(`Failed to load hotkeys from local file "${this.persistFileName}"`, e);
                }
                if (e) {
                  var i, r;
                  t = this.defaultIni;
                  for ([i, r] of new Map([
                    [a.KeyCommandType.PreviousObject, "M".charCodeAt(0)],
                    [a.KeyCommandType.VeterancyNav, "Y".charCodeAt(0)],
                    [a.KeyCommandType.HealthNav, "U".charCodeAt(0)],
                    [a.KeyCommandType.FreeMoney, 582],
                    [a.KeyCommandType.BuildCheat, 593],
                    [a.KeyCommandType.ToggleFps, 512 + "R".charCodeAt(0)],
                    [a.KeyCommandType.ToggleShroud, 1024 + "S".charCodeAt(0)],
                  ]))
                    this.addHotKey(i, r);
                  this.loadHotKeys(t);
                }
                this.addHotKey(a.KeyCommandType.Scoreboard, 9);
              }
              async saveIni(e) {
                await this.configDir?.writeFile(
                  new r.VirtualFile(new i.DataStream().writeString(e.toString()), this.persistFileName),
                );
              }
              async resetAndReload() {
                (this.configDir &&
                  (await this.configDir.containsEntry(this.persistFileName)) &&
                  (await this.configDir.deleteFile(this.persistFileName)),
                  await this.load());
              }
              loadHotKeys(e) {
                let t = e.getSection(o.iniSection);
                if (!t) throw new Error(`Missing [${o.iniSection}] ini section`);
                let i = Object.keys(a.KeyCommandType);
                for (var r of t.entries.keys()) {
                  var s;
                  i.includes(r)
                    ? ((s = t.getNumber(r)), this.changeHotKey(r, s))
                    : console.warn("Unknown keyboard command " + r);
                }
                return this;
              }
              async save() {
                let e = new s.IniFile(),
                  t = e.getOrCreateSection(o.iniSection);
                for (var [i, r] of this.hotKeys) t.set(r, "" + i);
                await this.saveIni(e);
              }
              addHotKey(e, t) {
                this.hotKeys.set("number" == typeof t ? t : this.getHotKeyCode(t), e);
              }
              changeHotKey(t, e) {
                var i;
                for (i of [...this.hotKeys.entries()].filter(([, e]) => e === t).map(([e]) => e))
                  this.hotKeys.delete(i);
                e && this.addHotKey(t, e);
              }
              getCommandType(e) {
                if (!(255 < e.keyCode)) {
                  var t = this.getHotKeyCode(e);
                  return this.hotKeys.get(t);
                }
              }
              getHotKeyCode(e) {
                let t =
                  (Number(e.metaKey) << 12) +
                  (Number(e.altKey) << 10) +
                  (Number(e.ctrlKey) << 9) +
                  (Number(e.shiftKey) << 8) +
                  e.keyCode;
                var i = n.get(e.keyCode);
                return (i && (t += 2048 - e.keyCode + i), t);
              }
              getHotKey(t) {
                var e,
                  i = [...this.hotKeys.entries()].find(([, e]) => e === t)?.[0];
                if (void 0 !== i) {
                  let t = 255 & i;
                  return (
                    2048 & i &&
                      ((e = [...n].find(([, e]) => e === t)?.[0])
                        ? (t = e)
                        : console.error(`Expected an numpad arrow key code but got ${t} (${i}) instead`)),
                    {
                      keyCode: t,
                      shiftKey: Boolean(256 & i),
                      ctrlKey: Boolean(512 & i),
                      altKey: Boolean(1024 & i),
                      metaKey: Boolean(4096 & i),
                    }
                  );
                }
              }
            }),
          ),
          (o.iniSection = "Hotkey"));
      },
    };
  },
);
