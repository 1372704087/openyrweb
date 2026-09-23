/**
 * IniParser — 轻量 INI 文本 → JSON 解析器。
 *
 * 特性：
 *  - 行首 ; # 为整行注释；] 后的 // ; # 尾注释被剥离
 *  - [Section] 开节；key=value / 裸 key；key[] 追加为数组
 *  - 键可用 \. 转义字面点号；未转义的嵌套点号会被展开为嵌套对象
 *  - 值可整体加引号；反斜杠转义与 ; # 截断语义见 unsafe()
 *
 * 由 data/IniParser.ts.js 重写为 TS（行为完全一致）。两个文件并存
 * 期间，本文件才是修改目标：tools/repack.mjs 打包时优先采用 .ts 模块
 * 的编译产物。
 */

/** 解析产物：任意深度的对象树。 */
export type IniParsed = Record<string, unknown>;

export class IniParser {
  /** 将整段 INI 文本解析为以节名为顶层键的对象。 */
  parse(text: string): IniParsed {
    const root: IniParsed = {};
    let current = root;
    // [节] 整行，或 key(=value)? 形式
    const lineRe = /^\[([^\]]*)\]\s*$|^([^=]+)(=(.*))?$/i;
    const lines = text.split(/[\r\n]+/g);

    lines.forEach((raw) => {
      if (!raw || raw.match(/^\s*[;#]/)) return; // 空行 / 整行注释
      // 先剥 ] 后的尾注释（仅当本行是节头）
      const line = raw.replace(/]\s*(\/\/|;|#).*$/, ']');
      const m = line.match(lineRe);
      if (!m) return;

      if (m[1] !== undefined) {
        // 节头
        const name = this.unsafe(m[1]);
        current = root[name] = (root[name] as IniParsed) || {};
        return;
      }

      let key = this.unsafe(m[2]);
      const value = m[3] ? this.unsafe(m[4] || '') : '';

      // key[] → 数组累加
      if (key.length > 2 && key.slice(-2) === '[]') {
        key = key.substring(0, key.length - 2);
        if (current[key]) {
          if (!Array.isArray(current[key])) current[key] = [current[key]];
        } else {
          current[key] = [];
        }
      }
      if (Array.isArray(current[key])) (current[key] as unknown[]).push(value);
      else current[key] = value;
    });

    // 将含未转义点号的顶层键展开为嵌套对象
    Object.keys(root)
      .filter((key) => {
        const val = root[key];
        if (!val || typeof val !== 'object' || Array.isArray(val)) return false;
        const parts = this.dotSplit(key);
        let node = root;
        const leaf = parts.pop()!;
        const leafKey = leaf.replace(/\\\./g, '.');
        parts.forEach(function (part) {
          if (!node[part] || typeof node[part] !== 'object') node[part] = {};
          node = node[part] as IniParsed;
        });
        const moved = node !== root || leafKey !== leaf;
        if (moved) node[leafKey] = root[key];
        return moved;
      })
      .forEach((key) => {
        delete root[key];
      });

    return root;
  }

  /**
   * 按未转义点号拆分键。
   * 用 fromCharCode(1)/(2) 构造占位符（避免源码裸控制字符）：
   * 先把字面 SOH 与转义点号换成占位，再按点号 split，最后还原。
   */
  dotSplit(key: string): string[] {
    const P1 = String.fromCharCode(1);
    const P2 = String.fromCharCode(2);
    const LIT = P2 + 'LITERAL' + P1 + 'LITERAL' + P2;
    return key
      .replace(/\x01/g, LIT)
      .replace(/\\\./g, P1)
      .split(/\./)
      .map((part) =>
        part
          .replace(/\x01/g, '\\.')
          .split(LIT)
          .join(P1),
      );
  }

  /** 值是否被成对的 " 或 ' 包裹。 */
  isQuoted(s: string): boolean {
    return (
      (s.charAt(0) === '"' && s.slice(-1) === '"') ||
      (s.charAt(0) === "'" && s.slice(-1) === "'")
    );
  }

  /**
   * 反转义/去引号：成对引号直接剥壳；否则逐字符处理
   * 反斜杠转义（\;# 保留字面，其余反斜杠转义补回 \），遇未转义 ; # 截断。
   */
  unsafe(raw: string): string {
    let s = (raw || '').trim();
    if (this.isQuoted(s)) return s.substr(1, s.length - 2);

    let escaped = false;
    let out = '';
    for (let i = 0, len = s.length; i < len; i++) {
      const ch = s.charAt(i);
      if (escaped) {
        if ('\\;#'.indexOf(ch) !== -1) out += ch;
        else out += '\\' + ch;
        escaped = false;
      } else {
        if (';#'.indexOf(ch) !== -1) break;
        if (ch === '\\') escaped = true;
        else out += ch;
      }
    }
    if (escaped) out += '\\';
    return out.trim();
  }
}
