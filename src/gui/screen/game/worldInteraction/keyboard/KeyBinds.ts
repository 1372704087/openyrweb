/**
 * KeyBinds — 键位绑定表（INI 读写 + 修饰键编码 + 扩展默认键补全）。
 *
 * 由 gui/screen/game/worldInteraction/keyboard/KeyBinds.ts.js
 * 重写为 TS（行为完全一致）。
 *
 * 两个文件并存期间，本文件才是修改目标：tools/repack.mjs 打包时优先采用 .ts 模块的编译产物。
 */
import { DataStream } from "data/DataStream"; // 已转换
import { IniFile } from "data/IniFile"; // 已转换
import { VirtualFile } from "data/vfs/VirtualFile"; // 已转换
import { KeyCommandType } from "gui/screen/game/worldInteraction/keyboard/KeyCommandType"; // 已转换

/* eslint-disable @typescript-eslint/no-explicit-any */

/** 小键盘方向键 → 主键盘方向键 keyCode。 */
const NUMPAD_ARROWS = new Map<number, number>([
  [98, 40],
  [100, 37],
  [102, 39],
  [104, 38],
]);

/** 键位绑定。 */
export class KeyBinds {
  /** 配置目录。 */
  configDir: any;
  /** 持久文件名。 */
  persistFileName: string;
  /** 默认 INI。 */
  defaultIni: any;
  /** 位编码 → 命令。 */
  hotKeys = new Map<number, string>();

  /** INI 段名。 */
  static iniSection = "Hotkey";

  /**
   * @param configDir 配置目录
   * @param persistFileName 文件名
   * @param defaultIni 默认 INI
   */
  constructor(configDir: any, persistFileName: string, defaultIni: any) {
    this.configDir = configDir;
    this.persistFileName = persistFileName;
    this.defaultIni = defaultIni;
    this.hotKeys = new Map();
  }

  /** 加载：优先本地文件，否则内置 + 扩展默认；末尾挂全局。 */
  async load(): Promise<void> {
    this.hotKeys.clear();
    let loaded = false;
    let ini: any;
    try {
      if (
        this.configDir &&
        (await this.configDir.containsEntry(this.persistFileName))
      ) {
        ini = new IniFile(await this.configDir.openFile(this.persistFileName));
        this.loadHotKeys(ini);
        loaded = true;
      }
    } catch (e) {
      console.log(`Failed to load hotkeys from local file "${this.persistFileName}"`, e);
    }
    if (!loaded) {
      ini = this.defaultIni;
      for (const [cmd, code] of new Map<string, number>([
        [KeyCommandType.PreviousObject, "M".charCodeAt(0)],
        [KeyCommandType.VeterancyNav, "Y".charCodeAt(0)],
        [KeyCommandType.HealthNav, "U".charCodeAt(0)],
        [KeyCommandType.FreeMoney, 582],
        [KeyCommandType.BuildCheat, 593],
        [KeyCommandType.ToggleFps, 512 + "R".charCodeAt(0)],
        [KeyCommandType.ToggleShroud, 1024 + "S".charCodeAt(0)],
        [KeyCommandType.UnloadGarrison, 512 + "E".charCodeAt(0)],
      ])) {
        this.addHotKey(cmd, code);
      }
      this.loadHotKeys(ini);
    }
    this.addHotKey(KeyCommandType.Scoreboard, 9);
    // 把本实例挂到 globalThis，供扩展宿主为扩展声明的键位命令补默认键
    // （ExtensionHost.applyExtensionKeyCommands → ensureDefaultKeyBinds）。
    // 必须挂在 load() 末尾：load() 开头会 hotKeys.clear()，挂早了会被清掉。
    // 也不能只靠 KeyboardHandler —— 它要到开局才创建，而「键盘设置」页在主菜单，
    // 那时句柄还不存在，默认键会因此丢失（实测过）。
    (globalThis as any).__openyrweb_keyBinds = this;
    // 扩展声明的默认键位由扩展宿主以纯数据发布在
    // globalThis.__openyrweb_extKeyDefaults（[[命令 id, 位编码], ...]）。
    // 在 load() 末尾补入而不是只在宿主侧补一次：本函数在「键盘设置 → 恢复默认」
    // 时会被再调一次（KeyboardScreen.resetAndReload），必须重新补，
    // 否则扩展的默认键会跟着一起丢。已有绑定的不覆盖（用户改过的键优先）。
    for (const [cmd, code] of ((globalThis as any).__openyrweb_extKeyDefaults || []) as any[]) {
      if (this.getHotKey(cmd) === void 0) this.addHotKey(cmd, code);
    }
    // 扩展声明的默认键位（如 AutoLoad 的 Ctrl+D）不再硬编码在这里，
    // 改由扩展自带的 manifest 声明 —— 使扩展保持自包含，新增扩展无需改动本文件。
  }

  /**
   * 写回 INI。
   * @param ini IniFile
   */
  async saveIni(ini: any): Promise<void> {
    await this.configDir?.writeFile(
      new VirtualFile(
        new DataStream().writeString(ini.toString()),
        this.persistFileName,
      ),
    );
  }

  /** 删本地文件后重载。 */
  async resetAndReload(): Promise<void> {
    if (
      this.configDir &&
      (await this.configDir.containsEntry(this.persistFileName))
    ) {
      await this.configDir.deleteFile(this.persistFileName);
    }
    await this.load();
  }

  /**
   * 从 INI 段解析热键。
   * @param ini INI
   */
  loadHotKeys(ini: any): this {
    const section = ini.getSection(KeyBinds.iniSection);
    if (!section) throw new Error(`Missing [${KeyBinds.iniSection}] ini section`);
    const knownEnum = Object.keys(KeyCommandType);
    // 白名单 = 内置枚举 ∪ 扩展运行期注册的命令集
    // （extensions/ExtensionHost 挂到 globalThis.__openyrweb_knownKeyCommands）
    // ⇒ 新增扩展的热键不必再往 KeyCommandType 枚举里加成员。
    const known = (globalThis as any).__openyrweb_knownKeyCommands;
    for (const name of section.entries.keys()) {
      if (knownEnum.includes(name) || (known && known.has(name))) {
        const code = section.getNumber(name);
        this.changeHotKey(name, code);
      } else {
        // keyboardmd.ini (shipped inside the user's langmd.mix) contains
        // Westwood map-editor / debug leftovers (CopyBlock, PasteBlock, FileNew,
        // FileOpen, FileSave, MultiplayerDebug, ForceLose) that were never part of
        // the released KeyCommandType enum and have no handler here. They are dead
        // bindings even in the original PC game. Demote to debug so the console
        // stays clean while keeping a breadcrumb for diagnosis.
        console.debug("Unknown keyboard command " + name);
      }
    }
    return this;
  }

  /** 序列化并保存。 */
  async save(): Promise<void> {
    const ini = new IniFile();
    const section = ini.getOrCreateSection(KeyBinds.iniSection);
    for (const [code, cmd] of this.hotKeys) section.set(cmd, "" + code);
    await this.saveIni(ini);
  }

  /**
   * 登记：code 可为数字位码或键事件。
   * @param command 命令 id
   * @param code 位码或事件
   */
  addHotKey(command: string, code: number | any): void {
    this.hotKeys.set(typeof code === "number" ? code : this.getHotKeyCode(code), command);
  }

  /**
   * 替换某命令的键（先删旧绑定）。
   * @param command 命令
   * @param code 新位码（0/falsy 删除）
   */
  changeHotKey(command: string, code: number): void {
    for (const oldCode of [...this.hotKeys.entries()]
      .filter(([, cmd]) => cmd === command)
      .map(([c]) => c)) {
      this.hotKeys.delete(oldCode);
    }
    if (code) this.addHotKey(command, code);
  }

  /**
   * 由事件取命令 id。
   * @param e 键事件
   */
  getCommandType(e: any): string | undefined {
    if (e.keyCode > 255) return void 0;
    const key = this.getHotKeyCode(e);
    return this.hotKeys.get(key);
  }

  /**
   * 修饰键 + keyCode 编码（小键盘方向并入 2048 区）。
   * @param e 事件
   */
  getHotKeyCode(e: any): number {
    let code =
      (Number(e.metaKey) << 12) +
      (Number(e.altKey) << 10) +
      (Number(e.ctrlKey) << 9) +
      (Number(e.shiftKey) << 8) +
      e.keyCode;
    const arrow = NUMPAD_ARROWS.get(e.keyCode);
    if (arrow) code += 2048 - e.keyCode + arrow;
    return code;
  }

  /**
   * 反查键描述（含小键盘还原）。
   * @param command 命令
   */
  getHotKey(command: string): any {
    const encoded = [...this.hotKeys.entries()].find(([, cmd]) => cmd === command)?.[0];
    if (encoded === void 0) return void 0;
    let keyCode = 255 & encoded;
    if (encoded & 2048) {
      const numpad = [...NUMPAD_ARROWS].find(([, main]) => main === keyCode)?.[0];
      if (numpad) {
        keyCode = numpad;
      } else {
        console.error(`Expected an numpad arrow key code but got ${keyCode} (${encoded}) instead`);
      }
    }
    return {
      keyCode,
      shiftKey: Boolean(256 & encoded),
      ctrlKey: Boolean(512 & encoded),
      altKey: Boolean(1024 & encoded),
      metaKey: Boolean(4096 & encoded),
    };
  }
}
