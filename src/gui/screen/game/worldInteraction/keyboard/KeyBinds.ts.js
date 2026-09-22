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
                    [a.KeyCommandType.UnloadGarrison, 512 + "E".charCodeAt(0)],
                  ]))
                    this.addHotKey(i, r);
                  this.loadHotKeys(t);
                }
                this.addHotKey(a.KeyCommandType.Scoreboard, 9);
                // 把本实例挂到 globalThis，供扩展宿主为扩展声明的键位命令补默认键
                // （ExtensionHost.applyExtensionKeyCommands → ensureDefaultKeyBinds）。
                // 必须挂在 load() 末尾：load() 开头会 hotKeys.clear()，挂早了会被清掉。
                // 也不能只靠 KeyboardHandler —— 它要到开局才创建，而「键盘设置」页在主菜单，
                // 那时句柄还不存在，默认键会因此丢失（实测过）。
                globalThis.__openyrweb_keyBinds = this;
                // 扩展声明的默认键位由扩展宿主以纯数据发布在
                // globalThis.__openyrweb_extKeyDefaults（[[命令 id, 位编码], ...]）。
                // 在 load() 末尾补入而不是只在宿主侧补一次：本函数在「键盘设置 → 恢复默认」
                // 时会被再调一次（KeyboardScreen.resetAndReload），必须重新补，
                // 否则扩展的默认键会跟着一起丢。已有绑定的不覆盖（用户改过的键优先）。
                for (const [cmd, code] of globalThis.__openyrweb_extKeyDefaults || []) {
                  if (void 0 === this.getHotKey(cmd)) this.addHotKey(cmd, code);
                }
                // 扩展声明的默认键位（如 AutoLoad 的 Ctrl+D）不再硬编码在这里，
                // 改由扩展自带的 manifest 声明 —— 使扩展保持自包含，新增扩展无需改动本文件。
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
                // 白名单 = 内置枚举 ∪ 扩展运行期注册的命令集
                // （extensions/ExtensionHost 挂到 globalThis.__openyrweb_knownKeyCommands）
                // ⇒ 新增扩展的热键不必再往 KeyCommandType 枚举里加成员。
                var known = globalThis.__openyrweb_knownKeyCommands;
                for (var r of t.entries.keys()) {
                  var s;
                  i.includes(r) || (known && known.has(r))
                    ? ((s = t.getNumber(r)), this.changeHotKey(r, s))
                    : // keyboardmd.ini (shipped inside the user's langmd.mix) contains
                      // Westwood map-editor / debug leftovers (CopyBlock, PasteBlock, FileNew,
                      // FileOpen, FileSave, MultiplayerDebug, ForceLose) that were never part of
                      // the released KeyCommandType enum and have no handler here. They are dead
                      // bindings even in the original PC game. Demote to debug so the console
                      // stays clean while keeping a breadcrumb for diagnosis.
                      console.debug("Unknown keyboard command " + r);
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
