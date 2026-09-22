// === Reconstructed SystemJS module: gui/screen/game/worldInteraction/keyboard/KeyboardHandler ===
// deps: ["gui/screen/game/worldInteraction/keyboard/KeyCommandType","gui/screen/game/worldInteraction/keyboard/KeyCommand"]
// Note: variable/type names are minified approximations of the original TypeScript.

System.register(
  "gui/screen/game/worldInteraction/keyboard/KeyboardHandler",
  ["gui/screen/game/worldInteraction/keyboard/KeyCommandType", "gui/screen/game/worldInteraction/keyboard/KeyCommand"],
  function (e, t) {
    "use strict";
    var i, r, s;
    t && t.id;
    return {
      setters: [
        function (e) {
          i = e;
        },
        function (e) {
          r = e;
        },
      ],
      execute: function () {
        (e(
          "KeyboardHandler",
          (s = class s {
            constructor(e, t) {
              ((this.keyBinds = e), (this.devMode = t), (this.commands = new Map()), (this.isPaused = !1));
              // 把「键位命令注册器」挂到 globalThis，供扩展宿主（extensions/ExtensionHost）在
              // 不引入模块依赖的前提下注册自定义热键命令 —— 避免给这个已有循环依赖的代码库
              // 再加一条模块边（ExtensionHost -> GUI 是反向依赖，容易成环）。
              globalThis.__openyrweb_keyCmdRegistrar = (cmd, fn) => this.registerCommand(cmd, fn);
              // 主动**拉取**扩展已登记的命令处理函数（宿主的 ExtensionHost.registerKeyCommand
              // 把它登记在 globalThis.__openyrweb_keyCommandHandlers）。
              //
              // 为什么必须「构造时拉」而不是「让宿主推」：registrar 是个全局句柄，本 handler
              // 被 dispose 后它**不会被清理**。于是第二局开局时，宿主看到的仍是上一局那个已废弃
              // 的 registrar，命令会被注册进废弃 handler，本局的 commands 表反而是空的 ⇒
              // 不刷新页面就无法使用扩展热键（实测复现过）。每局新建 handler 时拉一次，
              // 天然覆盖「每局重新注册」的需求（且 handler 闭包捕获的是本局的 game）。
              const pending = globalThis.__openyrweb_keyCommandHandlers;
              if (pending && typeof pending.forEach === "function") {
                pending.forEach((fn, cmd) => {
                  if (this.commands.has(cmd)) return;
                  try {
                    this.registerCommand(cmd, fn);
                  } catch (e) {
                    /* 重复注册：忽略（本局已有同命令） */
                  }
                });
              }
              // 注意：keyBinds 实例由 KeyBinds.load() 末尾挂到 globalThis.__openyrweb_keyBinds，
              // 不在这里重复挂 —— 本 handler 要到开局才创建，而扩展补默认键发生在前、
              // 且「键盘设置」页在主菜单，靠这里挂就晚了。
            }
            registerCommand(e, t) {
              if (this.commands.has(e)) throw new Error("Duplicate command " + e);
              this.commands.set(e, t);
            }
            unregisterCommand(e) {
              this.commands.delete(e);
            }
            executeCommand(e) {
              let t = this.commands.get(e);
              t &&
                !this.isPaused &&
                ("function" == typeof t
                  ? t()
                  : t.triggerMode !== r.TriggerMode.KeyDownUp
                    ? t.execute(t.triggerMode === r.TriggerMode.KeyUp)
                    : (t.execute(!1), t.execute(!0)));
            }
            handleKeyDown(i) {
              if (
                ("Backspace" === i.key && (i.preventDefault(), i.stopPropagation()),
                !(i.repeat || (["F5", "F12"].includes(i.key) && this.devMode)))
              ) {
                let t = this.keyBinds.getCommandType(i);
                if ((void 0 === t && (t = this.getNoModCmdType(i.keyCode)), void 0 !== t)) {
                  (i.preventDefault(), i.stopPropagation());
                  let e = this.commands.get(t);
                  e &&
                    !this.isPaused &&
                    ("function" == typeof e ? e() : e.triggerMode !== r.TriggerMode.KeyUp && e.execute(!1));
                }
              }
            }
            handleKeyUp(e) {
              if ("Alt" === e.key) (e.preventDefault(), e.stopPropagation());
              else if (!this.isPaused) {
                let t = this.keyBinds.getCommandType(e);
                if ((void 0 === t && (t = this.getNoModCmdType(e.keyCode)), void 0 !== t)) {
                  let e = this.commands.get(t);
                  !e ||
                    "function" == typeof e ||
                    (e.triggerMode !== r.TriggerMode.KeyUp && e.triggerMode !== r.TriggerMode.KeyDownUp) ||
                    e.execute(!0);
                }
              }
            }
            getNoModCmdType(e) {
              var t = this.keyBinds.getCommandType({ keyCode: e, altKey: !1, ctrlKey: !1, shiftKey: !1, metaKey: !1 });
              if (t) {
                var i = this.commands.get(t);
                if (i && "function" != typeof i && s.anyModifierCommands.includes(t)) return t;
              }
            }
            pause() {
              this.isPaused = !0;
            }
            unpause() {
              this.isPaused = !1;
            }
            dispose() {
              this.commands.clear();
            }
          }),
        ),
          (s.anyModifierCommands = [i.KeyCommandType.PlanningMode]));
      },
    };
  },
);
