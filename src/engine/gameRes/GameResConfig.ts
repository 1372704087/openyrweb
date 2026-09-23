/**
 * GameResConfig — 可序列化的游戏资源配置（来源 + 可选 CDN URL）。
 *
 * 序列化格式（与孪生一致）：
 * - serialize:   `source` 或 `source,encodedCdnUrl`（encodeURI 编码 URL）
 * - unserialize: 拆 "," 后 source=Number(part0)，cdnUrl=decodeURI(part1)（无则 undefined）
 * - 未知枚举值抛 `Unknown game res source "${n}"`
 *
 * 由 engine/gameRes/GameResConfig.ts.js 逆向翻译为 TS（行为完全一致）。
 * 两个文件并存期间，本文件才是修改目标：tools/repack.mjs 打包时优先
 * 采用 .ts 模块的编译产物。
 */
import { GameResSource } from "engine/gameRes/GameResSource"; // 已转换

export class GameResConfig {
  /** 构造时注入的默认 CDN 基地址（config 未带 cdnUrl 时回退）。 */
  defaultCdnBaseUrl: string;
  /** 资源来源（序列化/反序列化后填充；构造时不设）。 */
  source?: GameResSource;
  /** 可选 CDN 根 URL（unserialize 后填充）。 */
  cdnUrl?: string;

  /**
   * @param defaultCdnBaseUrl 默认 CDN 基地址。
   */
  constructor(defaultCdnBaseUrl: string) {
    this.defaultCdnBaseUrl = defaultCdnBaseUrl;
  }

  /**
   * 从 `source[,cdnUrl]` 字符串还原配置。
   *
   * @param data 序列化字符串。
   * @throws Error 未知 GameResSource 数值时抛出。
   */
  unserialize(data: string): void {
    const [srcStr, urlStr] = data.split(",");
    const src = Number(srcStr);
    if (!GameResSource[src]) {
      throw new Error(`Unknown game res source "${src}"`);
    }
    this.source = src;
    this.cdnUrl = urlStr ? decodeURI(urlStr) : undefined;
  }

  /**
   * 序列化为 `source[,encodedCdnUrl]`。
   */
  serialize(): string {
    return this.source + (this.cdnUrl ? "," + encodeURI(this.cdnUrl) : "");
  }

  /**
   * 是否为 CDN 来源。
   */
  isCdn(): boolean {
    return this.source === GameResSource.Cdn;
  }

  /**
   * 取有效 CDN 基地址：优先 cdnUrl，否则回退 defaultCdnBaseUrl。
   */
  getCdnBaseUrl(): string | undefined {
    return this.cdnUrl ?? this.defaultCdnBaseUrl;
  }
}
