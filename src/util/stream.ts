/**
 * 流式文本迭代工具。
 *
 * 由 util/stream.ts.js 重写为 TS（行为完全一致）。两个文件并存期间，本文件
 * 才是修改目标：tools/repack.mjs 打包时优先采用 .ts 模块的编译产物。
 */

/** 孪生入参形状：File/Blob 类对象，经 `.stream()` 得到 ReadableStream（非裸 RS）。 */
export interface StreamableTextSource {
  stream(): ReadableStream<Uint8Array>;
}

/**
 * 按行迭代 `stream()` 返回的 UTF-8 文本流。
 *
 * 兼容 `\r\n` / `\n` / `\r` 三种换行；跨 chunk 断行通过保留未消费尾部
 * 拼接解决。流结束时若仍有未 yield 的尾部则作为最后一行输出。
 *
 * 取 reader 必须走 `source.stream().getReader()`（与孪生一致）——
 * 不能直接 `source.getReader()`：调用方传入的是 File/Blob（如
 * ReplayStorageFileSystem.getRawFile → Replay.parseHeader）。
 */
export async function* makeTextFileLineIterator(
  source: StreamableTextSource,
): AsyncGenerator<string, void, unknown> {
  const decoder = new TextDecoder("utf-8");
  const reader = source.stream().getReader();
  let { value, done } = await reader.read();
  let text: string = value ? decoder.decode(value, { stream: true }) : "";
  // 全局 + lastIndex 状态复用：匹配到换行后从 lastIndex 继续扫描
  const lineEnd = /\r\n|\n|\r/gm;
  let start = 0;
  for (;;) {
    const match = lineEnd.exec(text);
    if (match) {
      yield text.substring(start, match.index);
      start = lineEnd.lastIndex;
    } else {
      if (done) break;
      // 无匹配：保留 start 之后的未消费片段，读下一 chunk 拼接后重扫
      const rest = text.substr(start);
      ({ value, done } = await reader.read());
      text = rest + (value ? decoder.decode(value, { stream: true }) : "");
      // lastIndex 复位为 0，且 start 一并归零（与孪生 a.lastIndex = 0 一致）
      start = lineEnd.lastIndex = 0;
    }
  }
  if (start < text.length) yield text.substr(start);
}
