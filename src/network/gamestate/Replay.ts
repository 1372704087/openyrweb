/**
 * Replay — 对局回放数据模型：头部/事件序列化与反序列化（.rpl 格式）。
 *
 * 由 network/gamestate/Replay.ts.js 重写为 TS（行为完全一致）。两个文件并存期间，
 * 本文件才是修改目标：tools/repack.mjs 打包时优先采用 .ts 模块的编译产物。
 *
 * 关键语义（勿改）：
 * - 头部三行：RA2TSREPL_vN / ENGINE <ver> [modHash] / <gameId> <ts> <opts>。
 * - 事件行：`tick=type|payload`；结束行：`END <endTick>`；可选 debugInfo Base64 行。
 * - 支持版本：[5, 6]；v<6 的 opts 为 Base64，v6+ 为明文。
 * - flush() 为生成器分片产出文本；serialize() 临时保存 events 再还原。
 */

import { Serializer } from "network/gameopt/Serializer"; // 孪生
import { Parser } from "network/gameopt/Parser"; // 孪生
import { Base64 } from "util/Base64"; // 孪生
import { ReplayEventFactory } from "network/gamestate/replay/ReplayEventFactory"; // 孪生
import { makeTextFileLineIterator } from "util/stream"; // 孪生
import { binaryStringToUtf16, utf16ToBinaryString } from "util/string"; // 孪生
import type { ReplayEvent } from "network/gamestate/replay/ReplayEvent"; // 孪生
import type { GameOptsLike } from "network/gameopt/Serializer"; // 已转换

/** 单局游戏选项的最窄形状（依赖 mapTitle）。 */
export type ReplayGameOpts = GameOptsLike;

/** 解析回放头部的返回值。 */
export interface ReplayHeader {
  /** 回放格式版本号。 */
  replayVersion: number;
  /** 引擎版本（如 "1.006"）。 */
  engineVersion: string;
  /** mod 哈希（v<4 视为 0）。 */
  modHash: number;
  /** 对局 id。 */
  gameId: string;
  /** 对局开始时间戳（ms）。 */
  gameTimestamp: number;
  /** 序列化后的游戏选项。 */
  gameOptsSerialized: string;
}

/** 供 unserialize 恢复的元数据。 */
export interface ReplayMeta {
  /** 回放显示名。 */
  name: string;
  /** 创建/记录时间戳（ms）。 */
  timestamp: number;
}

/** 对局回放。 */
export class Replay {
  /** 文件扩展名。 */
  static readonly extension = ".rpl";
  /** 文件名最大长度（sanitize 后截断）。 */
  static readonly maxNameLength = 128;
  /** ENGINE 行匹配正则。 */
  static readonly engineLineRegex = /^ENGINE \d+\.\d+( \d+)?$/;

  /** 支持的回放格式版本列表。 */
  private static readonly SUPPORTED_VERSIONS: readonly number[] = [5, 6];
  /** 当前写出的回放格式版本。 */
  private static readonly CURRENT_VERSION = 6;

  /** 对局 id。 */
  gameId?: string;
  /** 对局开始时间戳（ms）。 */
  gameTimestamp?: number;
  /** 游戏选项。 */
  gameOpts?: ReplayGameOpts;
  /** 引擎版本。 */
  engineVersion?: string;
  /** mod 哈希。 */
  modHash?: number;
  /** 回放显示名。 */
  name = "";
  /** 记录时间戳（ms）。 */
  timestamp?: number;
  /** 结束 tick（未结束为 undefined）。 */
  endTick?: number;
  /** 可选调试信息（序列化为 Base64 行）。 */
  debugInfo?: string;
  /** 待写出的事件缓冲。 */
  private events: ReplayEvent[] = [];

  /**
   * 将字符串净化为安全文件名片段并截断。
   * @param name 原始名。
   * @param replacement 替换字符（默认 "_"）。
   */
  static sanitizeFileName(name: string, replacement = "_"): string {
    return name
      .replace(/[/?<>\\:*|"]/g, replacement)
      .replace(/[\x00-\x1f\x7f\x80-\x9f]/g, replacement)
      .slice(0, this.maxNameLength);
  }

  /**
   * 初始化回放头部字段并自动生成显示名。
   * @param gameId 对局 id。
   * @param gameTimestamp 对局开始时间戳。
   * @param gameOpts 游戏选项。
   * @param engineVersion 引擎版本。
   * @param modHash mod 哈希。
   */
  init(
    gameId: string,
    gameTimestamp: number,
    gameOpts: ReplayGameOpts,
    engineVersion: string,
    modHash: number,
  ): void {
    this.gameId = gameId;
    this.gameTimestamp = gameTimestamp;
    this.gameOpts = gameOpts;
    this.engineVersion = engineVersion;
    this.modHash = modHash;
    this.name = Replay.sanitizeFileName(
      this.gameOpts.mapTitle + " " + new Date().toISOString().replace(/(\.|,)\d+Z$/, "Z"),
    );
    this.timestamp = Date.now();
  }

  /**
   * 追加一个或多个事件到缓冲。
   * @param events 事件列表。
   */
  writeEvent(...events: ReplayEvent[]): void {
    this.events.push(...events);
  }

  /**
   * 设置结束 tick（标记回放完成）。
   * @param endTick 结束 tick。
   */
  finish(endTick: number): void {
    this.endTick = endTick;
  }

  /** 返回事件缓冲（不拷贝）。 */
  getEvents(): ReplayEvent[] {
    return this.events;
  }

  /**
   * 分片产出回放文本：先头部，再按批产出事件行，最后 END 与可选 debugInfo。
   * 前置条件：gameOpts/engineVersion/modHash 已设置。
   */
  *flush(): Generator<string> {
    if (!this.gameOpts) throw new Error("Game options must be set first");
    if (!this.engineVersion) throw new Error("Engine version is not set");
    if (this.modHash === undefined) throw new Error("Mod hash is not set");

    const serializer = new Serializer();
    let chunk = this.getHeaderTag() + "\n";
    chunk += `ENGINE ${this.engineVersion} ${this.modHash}\n`;
    chunk += [this.gameId, this.gameTimestamp, serializer.serializeOptions(this.gameOpts)].join(" ") + "\n";
    yield chunk;
    chunk = "";

    // 等待 endTick 被 finish() 设置，且事件缓冲排空
    while (this.endTick === undefined || this.events.length) {
      for (const event of this.events) {
        chunk += event.tickNo + "=" + event.type + "|" + (event as ReplayEvent & { serialize(): string }).serialize() + "\n";
      }
      this.events.length = 0;
      yield chunk;
      chunk = "";
    }

    chunk += this.getEndTag() + " " + this.endTick + "\n";
    if (this.debugInfo) {
      chunk += Base64.encode(utf16ToBinaryString(this.debugInfo)) + "\n";
    }
    yield chunk;
  }

  /** 整包序列化为字符串（要求已 finish；flush 期间临时还原 events）。 */
  serialize(): string {
    if (this.endTick === undefined) throw new Error("Replay is not finished");
    let text = "";
    const savedEvents = this.events.slice();
    for (const piece of this.flush()) {
      text += piece;
    }
    this.events = savedEvents;
    return text;
  }

  /**
   * 仅解析头部三行（不解析事件体）。
   * @param source 文本或可迭代字节源。
   */
  async parseHeader(source: string | Uint8Array): Promise<ReplayHeader> {
    let lineIndex = 0;
    let replayVersion: number;
    let engineVersion: string;
    let modHash: number;
    let gameId: string;
    let gameTimestamp: number;
    let gameOptsSerialized: string;

    const lines =
      typeof source === "string" ? source.split("\n") : makeTextFileLineIterator(source as unknown as ReadableStream<Uint8Array>);

    for await (const line of lines as AsyncIterable<string> | string[]) {
      if (lineIndex === 0) {
        replayVersion = this.readReplayVersion(line);
      } else if (lineIndex === 1) {
        if (!line.match(Replay.engineLineRegex)) {
          throw new Error("Missing or invalid game engine version line");
        }
        const parts = line.split(" ");
        engineVersion = parts[1];
        modHash = Number(replayVersion! < 4 ? "0" : parts[2]);
      } else {
        if (lineIndex !== 2) break;
        if (!line.match(/^([a-zA-Z0-9-]+) \d+ .*$/)) {
          throw new Error("Missing or invalid game id/time/opts line");
        }
        const [id, ts, opts] = line.split(" ");
        gameId = id;
        gameTimestamp = Number(ts);
        gameOptsSerialized = replayVersion! < 6 ? Base64.decode(opts) : opts;
      }
      lineIndex++;
    }

    if (lineIndex < 3) throw new Error("Bad replay header");
    return {
      replayVersion: replayVersion!,
      engineVersion: engineVersion!,
      modHash: modHash!,
      gameId: gameId!,
      gameTimestamp: gameTimestamp!,
      gameOptsSerialized: gameOptsSerialized!,
    };
  }

  /**
   * 从整包文本反序列化回放（含事件与 END）。
   * @param data 回放全文。
   * @param meta 恢复用的名称/时间戳。
   */
  unserialize(data: string, meta: ReplayMeta): void {
    const lines = data.split("\n");
    let version = this.readReplayVersion(lines.shift() || "");
    if (!Replay.SUPPORTED_VERSIONS.includes(version)) {
      throw new Error("Unsupported replay version " + version);
    }

    const parser = new Parser();
    const engineLine = lines.shift();
    if (!engineLine || !engineLine.match(Replay.engineLineRegex)) {
      throw new Error("Missing or invalid game engine version line");
    }
    const [, engineVersion, modHashStr] = engineLine.split(" ");

    const idLine = lines.shift();
    if (!idLine) throw new Error("Missing game id/time/opts line");
    const idMatch = idLine.match(/^([a-zA-Z0-9-]+) (\d+) (.*)$/);
    if (!idMatch) throw new Error("Invalid game id/time/opts line");
    let [, gameId, gameTs, optsSerialized] = idMatch;
    if (version < 6) {
      optsSerialized = Base64.decode(optsSerialized);
    }
    const gameOpts = parser.parseOptions(optsSerialized);

    this.init(gameId, Number(gameTs), gameOpts, engineVersion, Number(modHashStr));
    this.name = meta.name;
    this.timestamp = meta.timestamp;

    let line: string | undefined;
    let sawEnd = false;
    while ((line = lines.shift())) {
      if (line.startsWith(this.getEndTag())) {
        sawEnd = true;
        break;
      }
      const eventMatch = line.match(/^(\d+)=(\d+)\|(.+)$/);
      if (!eventMatch) throw new Error(`Invalid event line "${line}"`);
      const [, tickStr, typeStr, payload] = eventMatch;
      const tickNo = Number(tickStr);
      const eventType = Number(typeStr);
      const event = new ReplayEventFactory(parser, new Serializer()).create(eventType, tickNo);
      (event as ReplayEvent & { unserialize(data: string): void }).unserialize(payload);
      this.writeEvent(event);
    }
    if (!sawEnd) throw new Error("Incomplete replay data");

    const endMatch = line!.match(new RegExp(`^${this.getEndTag()} (\\d+)$`));
    if (!endMatch) throw new Error("Invalid end tag");
    this.endTick = Number(endMatch[1]);
    if (lines.length >= 1) {
      this.debugInfo = binaryStringToUtf16(Base64.decode(lines[0]));
    }
  }

  /** 头部魔数标签（当前版本）。 */
  getHeaderTag(): string {
    return "RA2TSREPL_v" + Replay.CURRENT_VERSION;
  }

  /**
   * 从首行解析回放格式版本。
   * @param line 头部首行。
   */
  private readReplayVersion(line: string): number {
    const match = line.match(/^RA2TSREPL_v(\d+)$/);
    if (!match || match.length < 2) throw new Error("Unknown replay format");
    return Number(match[1]);
  }

  /** 事件结束标签。 */
  getEndTag(): string {
    return "END";
  }
}
