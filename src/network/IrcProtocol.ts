/**
 * IrcProtocol — IRC 频道名转义/反转义与长度上限。
 *
 * 由 network/IrcProtocol.ts.js 重写为 TS（行为完全一致）。两个文件并存期间，
 * 本文件才是修改目标：tools/repack.mjs 打包时优先采用 .ts 模块的编译产物。
 *
 * 关键语义（勿改）：
 * - escapeChannelName：空格→"_"，%→"%%"，_→"%_"，以及 %b/%n/%r/%=/%- 控制字符转义。
 * - unescapeChannelName：按字符扫描，%X 还原对应序列（未知 X 原样保留），"_"→空格。
 * - MAX_CHANNELNAME_LEN = 30（生成游戏频道名时按此截断）。
 */

/** IRC 协议工具（频道名编码）。 */
export class IrcProtocol {
  /** 频道名最大长度（含生成游戏房名时的截断依据）。 */
  static readonly MAX_CHANNELNAME_LEN = 30;

  /** 将频道名中的特殊字符转义为 IRC 安全形式。 */
  static escapeChannelName(name: string): string {
    return name
      .split("")
      .map((ch) => {
        switch (ch) {
          case " ":
            return "_";
          case "%":
            return "%%";
          case "_":
            return "%_";
          case "\b":
            return "%b";
          case "\n":
            return "%n";
          case "\r":
            return "%r";
          case ":":
            return "%=";
          case ",":
            return "%-";
          default:
            return ch;
        }
      })
      .join("");
  }

  /** 还原 escapeChannelName 之后的频道名。 */
  static unescapeChannelName(name: string): string {
    const chars = name.split("");
    let out = "";
    let i = 0;
    for (; i < chars.length; ) {
      const ch = chars[i++];
      let decoded: string;
      if (ch === "%") {
        const next = chars[i++];
        if (next === "b") decoded = "\b";
        else if (next === "n") decoded = "\n";
        else if (next === "r") decoded = "\r";
        else if (next === "=") decoded = ":";
        else if (next === "-") decoded = ",";
        else decoded = next;
      } else if (ch === "_") {
        decoded = " ";
      } else {
        decoded = ch;
      }
      out += decoded;
    }
    return out;
  }
}
