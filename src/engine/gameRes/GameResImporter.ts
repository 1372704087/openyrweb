/**
 * GameResImporter — 从归档 URL / 文件句柄 / 目录导入 YR 所需 MIX 资源。
 *
 * 流程（与孪生一致）：
 * - URL / File：加载 7z-wasm，下载或读入字节，逐个 `7z x` 提取固定 YR MIX 列表
 *   与 taunts 目录，再 importMixArchive（theme* → 音乐转码；langmd.mix → 启动图+视频）；
 * - Directory：RealFileSystemDir 枚举后按名取 MIX 导入，taunts 目录拷贝到 music 旁。
 *
 * 由 engine/gameRes/GameResImporter.ts.js 逆向翻译为 TS（行为完全一致）。
 * 两个文件并存期间，本文件才是修改目标：tools/repack.mjs 打包时优先
 * 采用 .ts 模块的编译产物。
 */
import { MixFile } from "data/MixFile"; // 已转换
import * as Engine from "engine/Engine"; // 孪生（any-shim，未转换）
import * as EngineType from "engine/EngineType"; // 孪生（any-shim，未转换）
import { sleep } from "util/time"; // 已转换
import { ChecksumError } from "engine/gameRes/importError/ChecksumError"; // 已转换
import { FileNotFoundError } from "engine/gameRes/importError/FileNotFoundError"; // 已转换
import { ArchiveExtractionError } from "engine/gameRes/importError/ArchiveExtractionError"; // 已转换
import { VirtualFile } from "data/vfs/VirtualFile"; // 已转换
import * as mixDatabase from "engine/mixDatabase"; // 孪生（any-shim，未转换）
import { Palette } from "data/Palette"; // 已转换
import { ShpFile } from "data/ShpFile"; // 已转换
import * as ImageUtils from "engine/gfx/ImageUtils"; // 孪生（any-shim，未转换）
import { equalsIgnoreCase } from "util/string"; // 已转换
import { VideoConverter } from "engine/gameRes/VideoConverter"; // 已转换
import { InvalidArchiveError } from "engine/gameRes/importError/InvalidArchiveError"; // 已转换
import { FileNotFoundError as VfsFileNotFoundError } from "data/vfs/FileNotFoundError"; // 已转换
import { IOError } from "data/vfs/IOError"; // 已转换
import { RealFileSystemDir } from "data/vfs/RealFileSystemDir"; // 已转换
import { NoWebAssemblyError } from "engine/gameRes/importError/NoWebAssemblyError"; // 已转换
import * as HttpRequestNs from "network/HttpRequest"; // 孪生（any-shim，未转换）
import { ArchiveDownloadError } from "engine/gameRes/importError/ArchiveDownloadError"; // 已转换

/** SystemJS 全局（动态 import 7z-wasm / ffmpeg 用）。 */
declare const SystemJS: { import(specifier: string): Promise<any> };

/** HttpRequest 模块命名空间（孪生导出 HttpRequest / DownloadError）。 */
const HttpRequest: any = (HttpRequestNs as any).HttpRequest;
/** HttpRequest 模块内 DownloadError（孪生导出）。 */
const DownloadError: any = (HttpRequestNs as any).DownloadError;

/** 字节 → MiB（进度文案用）。 */
function toMiB(bytes: number): number {
  return bytes / 1024 / 1024;
}

/**
 * 包装 7z-wasm FS.open：首次创建节点时按预填 knownContentSize 填充
 * contents/usedBytes，并包装 write 同步 usedBytes（与孪生 B() 一致）。
 *
 * @param makeOpen 原始 FS.open 实现。
 * @returns 包装后的 open 工厂。
 */
function withKnownContentSize(makeOpen: (...args: any[]) => any): (...args: any[]) => any {
  return function (this: any, ...openArgs: any[]): any {
    // FS.open 返回 stream，节点在 .node（孪生 a.node.name / a.node.contents）
    const stream: any = makeOpen(...openArgs);
    const known: any = knownSizeByFileName.get(stream.node.name);
    if (known) {
      stream.node.contents = new Uint8Array(known);
      const origWrite = stream.stream_ops.write;
      stream.stream_ops = { ...stream.stream_ops };
      stream.stream_ops.write = ((base: any) =>
        function (this: any, ...writeArgs: any[]) {
          const canChangeLength = writeArgs[4]; // offsetBytes 参数（falsy 时才更新 usedBytes）
          const s: any = writeArgs[0];
          if (!canChangeLength) {
            s.node.usedBytes = s.node.contents.byteLength;
          }
          const n = base(...writeArgs);
          if (!canChangeLength) {
            s.node.usedBytes = n;
          }
          return n;
        })(origWrite);
    }
    return stream;
  };
}

/** 各 MIX 文件的已知字节大小（用于 7z-wasm 预分配，与孪生 d 一致）。 */
const knownSizeByFileName: Map<string, number> = new Map()
  .set("ra2.mix", 281895456)
  .set("ra2md.mix", 204527696)
  .set("language.mix", 53116040)
  .set("langmd.mix", 84883510)
  .set("multi.mix", 25856283)
  .set("multimd.mix", 31264268)
  .set("theme.mix", 76862662)
  .set("thememd.mix", 46859102)
  .set("expandmd01.mix", 4813968);

/** 应用配置（构造注入）。 */
export interface ImporterAppConfig {
  /** CORS 代理解析（hostname → 代理前缀；可能缺省）。 */
  getCorsProxy?(hostname: string): string | undefined;
}

/** 字符串表（构造注入）。 */
export interface ImporterStrings {
  /** 取本地化文案。 */
  get(key: string, ...args: any[]): string;
}

/** Sentry 式异常上报（可选）。 */
export interface ImporterSentry {
  /** 上报异常。 */
  captureException(ex: any): void;
}

/** 进度回调：(statusText?, imageUrl?) 与孪生 h 一致。 */
export type ImportProgressFn = (text?: string, image?: string | Blob | undefined) => void;

export class GameResImporter {
  /** 应用配置。 */
  appConfig: ImporterAppConfig;
  /** 字符串表。 */
  strings: ImporterStrings;
  /** 可选异常上报。 */
  sentry?: ImporterSentry;

  /**
   * @param appConfig 应用配置。
   * @param strings 字符串表。
   * @param sentry 可选异常上报。
   */
  constructor(appConfig: ImporterAppConfig, strings: ImporterStrings, sentry?: ImporterSentry) {
    this.appConfig = appConfig;
    this.strings = strings;
    this.sentry = sentry;
  }

  /**
   * 导入 YR 所需 MIX 列表到目标根目录。
   *
   * @param source URL | FileSystemFileHandle（kind==="file"）| 目录句柄。
   * @param root 目标根目录（FileSystemDirectoryHandle）。
   * @param engineType 引擎类型（YR-only，参数保留与孪生签名一致）。
   * @param onProgress 进度回调。
   */
  async import(source: any, root: any, engineType: any, onProgress: ImportProgressFn): Promise<void> {
    // YR-only：固定导入列表（RA2 基础 + YR 扩展），不做引擎探测。
    const mixList: string[] = [
      "ra2.mix",
      "language.mix",
      "multi.mix",
      "ra2md.mix",
      "langmd.mix",
      "expandmd01.mix",
      "multimd.mix",
    ];
    const themeVariant: string = (Engine as any).Engine.getFileNameVariant("theme.mix");
    mixList.push(themeVariant);
    const optionalMixes = new Set<string>([themeVariant]);
    const tauntsDir: string = (Engine as any).Engine.rfsSettings.tauntsDir;
    const strings = this.strings;

    onProgress(strings.get("ts:import_preparing_for_import"));

    if (source instanceof URL || "file" === source.kind) {
      // ---------- 归档路径（URL 或 File 句柄） ----------
      if (!(window as any).WebAssembly) {
        throw new NoWebAssemblyError("WebAssembly is not available");
      }
      let exitCode: number | undefined;
      // 孪生 quit 回调第二参可能是 string 或带 message 的 Error-like
      let exitMessage: any;
      let sevenZip: any;
      try {
        const mod = await SystemJS.import("7z-wasm");
        sevenZip = await mod({
          quit: (code: number, msg: any) => {
            exitCode = code;
            exitMessage = msg;
          },
        });
      } catch (e: any) {
        if (e.message.match(/Load failed|Failed to fetch/)) {
          throw new DownloadError("Failed to load 7z-wasm", { cause: e });
        }
        if (e instanceof WebAssembly.RuntimeError) {
          throw new IOError("Couldn't load 7z-wasm", { cause: e });
        }
        throw e;
      }

      let archiveBytes: Uint8Array;
      let archiveName: string;
      {
        // 取字节：URL 走下载（可选 CORS 代理 + 进度），File 走 arrayBuffer
        if (source instanceof URL) {
          let received = 0;
          const rawUrl = source.toString();
          const proxy = this.appConfig.getCorsProxy?.(source.hostname);
          let fetchUrl = rawUrl;
          if (proxy) fetchUrl = "" + proxy + encodeURIComponent(rawUrl);
          try {
            archiveBytes = await new HttpRequest().fetchBinary(fetchUrl, void 0, {
              onProgress(delta: number, total: number) {
                received += delta;
                onProgress(
                  total
                    ? strings.get("ts:downloadingpgsize", toMiB(received), toMiB(total), (received / total) * 100)
                    : strings.get("ts:downloadingpgunkn", toMiB(received)),
                );
              },
            });
            archiveName = "archive";
          } catch (e) {
            if (!received && e instanceof DownloadError) {
              throw new ArchiveDownloadError(rawUrl, "Archive download failed", { cause: e });
            }
            throw e;
          }
        } else {
          const file = await source.getFile();
          archiveBytes = new Uint8Array(await file.arrayBuffer());
          archiveName = file.name;
        }
        onProgress(strings.get("ts:import_loading_archive"));
        sevenZip.FS.chdir("/tmp");
        try {
          const fd = sevenZip.FS.open(archiveName, "w+");
          sevenZip.FS.write(fd, archiveBytes, 0, archiveBytes.byteLength, 0, true);
          sevenZip.FS.close(fd);
        } catch (e) {
          if (e instanceof DOMException) {
            throw new IOError(`File "${archiveName}" could not be read (${e.name})`, { cause: e });
          }
          throw e;
        }
      }

      // 包装 FS.open：按 knownSizeByFileName 预分配 contents
      sevenZip.FS.open = withKnownContentSize(sevenZip.FS.open);

      for (const target of [...mixList, tauntsDir]) {
        onProgress(strings.get("ts:import_extracting", target));
        await sleep(100);
        sevenZip.callMain(["x", "-ssc-", "-r", archiveName, target]);
        if (exitCode) {
          if (1 !== exitCode) {
            throw new InvalidArchiveError("7-Zip exited with code " + exitCode, { cause: exitMessage });
          }
          if (exitMessage?.message?.match(/out of memory|allocation/i)) {
            const oom = new RangeError("Out of memory");
            (oom as { cause?: unknown }).cause = exitMessage;
            throw oom;
          }
          throw new ArchiveExtractionError("Archive extraction failed with code " + exitCode, { cause: exitMessage });
        }
        // 向下钻取唯一子目录，直到出现目标文件（或无更多目录）
        let names: string[];
        for (;;) {
          let node = sevenZip.FS.lookupPath(sevenZip.FS.cwd())["node"];
          names = Object.keys(node.contents);
          const others = names.filter((n) => !equalsIgnoreCase(n, target) && n !== archiveName);
          if (1 !== others.length || !sevenZip.FS.lookupPath(others[0]).node.isFolder) break;
          sevenZip.FS.chdir(others[0]);
        }

        if (target !== tauntsDir) {
          // 普通 MIX：读出并导入
          const wanted = target;
          const actualName = names.find((n) => equalsIgnoreCase(n, wanted)) ?? wanted;
          onProgress(strings.get("ts:import_importing", wanted));
          let virtual: any;
          try {
            virtual = this.readFileFromEmFs(sevenZip.FS, actualName);
            sevenZip.FS.unlink(actualName);
          } catch (e: any) {
            if (44 !== e.errno) throw e; // ENOENT
            if (optionalMixes.has(wanted)) {
              // 可选 theme*：thememd 缺失时 YR 扩展 BGM 不可用，info 级提示即可
              console.info(
                `Optional mix "${wanted}" not found - skipping.` +
                  (wanted.toLowerCase() === "thememd.mix"
                    ? " (Yuris Revenge expansion music will be unavailable; base RA2 music still plays.)"
                    : ""),
              );
              continue;
            }
            throw new FileNotFoundError(wanted);
          }
          await this.importMixArchive(virtual, root, onProgress, strings);
        } else {
          // taunts 目录：整目录拷贝
          const dirEntry = names.find((n) => equalsIgnoreCase(n, tauntsDir));
          if (dirEntry) {
            let base = sevenZip.FS.lookupPath(dirEntry)["node"];
            const paths = Object.keys(base.contents).map((n) => dirEntry + "/" + n);
            try {
              const outDir = await root.getOrCreateDirectory(tauntsDir);
              for (const p of paths) {
                onProgress(strings.get("ts:import_importing", p));
                const vf = this.readFileFromEmFs(sevenZip.FS, p);
                sevenZip.FS.unlink(p);
                await outDir.writeFile(vf, vf.filename.toLowerCase());
              }
              sevenZip.FS.rmdir(dirEntry);
            } catch (e: any) {
              if (!(e instanceof DOMException || e instanceof IOError || 44 === e.errno)) throw e;
              console.warn("Failed to copy taunts folder. Skipping.", [e]);
            }
          } else {
            console.warn("Taunts folder not found in archive. Skipping.");
          }
        }
        sevenZip.FS.chdir("/tmp");
      }
      sevenZip.FS.unlink(archiveName);
      // 校验 ra2.mix 可读：IOError 则视为 OPFS 异常 → 刷缓存文案后 reload 挂起
      try {
        await root.openFile("ra2.mix");
      } catch (e) {
        if (e instanceof IOError) {
          onProgress(this.strings.get("GUI:LoadingEx"));
          location.reload();
          await new Promise(() => {});
        }
      }
    } else {
      // ---------- 目录路径 ----------
      const dir = new RealFileSystemDir(source, true);
      const entries = await dir.listEntries();
      for (const name of mixList) {
        onProgress(strings.get("ts:import_importing", name));
        const actual = entries.find((n) => equalsIgnoreCase(n, name)) ?? name;
        let file: any;
        try {
          file = await dir.openFile(actual);
        } catch (e) {
          if (e instanceof VfsFileNotFoundError) {
            if (optionalMixes.has(name)) {
              console.info(
                `Optional mix "${name}" not found - skipping.` +
                  (name.toLowerCase() === "thememd.mix"
                    ? " (Yuris Revenge expansion music will be unavailable; base RA2 music still plays.)"
                    : ""),
              );
              continue;
            }
            throw new FileNotFoundError(name);
          }
          throw e;
        }
        await this.importMixArchive(file, root, onProgress, strings);
      }
      // taunts 目录
      const tauntsEntry = entries.find((n) => equalsIgnoreCase(n, tauntsDir)) ?? tauntsDir;
      let tauntsHandle: any;
      try {
        tauntsHandle = await dir.getDirectory(tauntsEntry);
      } catch (e) {
        if (!(e instanceof VfsFileNotFoundError || e instanceof IOError)) throw e;
        console.warn(`Directory "${tauntsEntry}" not found (${e.name}). Skipping.`, e);
      }
      if (tauntsHandle) {
        try {
          const outDir = await root.getOrCreateDirectory(tauntsDir, true);
          for await (const f of tauntsHandle.getRawFiles()) {
            onProgress(strings.get("ts:import_importing", outDir.name + "/" + f.name));
            await outDir.writeFile(f, f.name.toLowerCase());
          }
        } catch (e) {
          if (!(e instanceof IOError)) throw e;
          console.warn("Failed to copy taunts folder. Skipping.", [e]);
        }
      }
    }
  }

  /**
   * 从 7z-wasm 虚拟 FS 读出文件为 VirtualFile（chmod 后取 usedBytes 视图）。
   *
   * @param fs 7z FS API。
   * @param path 虚拟路径。
   */
  readFileFromEmFs(fs: any, path: string): any {
    fs.chmod(path, 448); // 0o700
    const node = fs.lookupPath(path)["node"];
    const bytes = node.contents.subarray(0, node.usedBytes);
    return VirtualFile.fromBytes(bytes, path.slice(path.lastIndexOf("/") + 1));
  }

  /**
   * 将单个 VirtualFile（MIX/theme/语言包）写入目标目录。
   *
   * - 空 theme*：警告跳过；空其它：ChecksumError。
   * - 非 theme：写入 mix 文件。
   * - theme*：写入后走 importMusic 转码 BGM。
   * - langmd.mix：额外 importSplashImage + importVideo。
   *
   * @param file 源 VirtualFile。
   * @param root 目标根目录。
   * @param onProgress 进度回调。
   * @param strings 字符串表。
   */
  async importMixArchive(file: any, root: any, onProgress: ImportProgressFn, strings: ImporterStrings): Promise<void> {
    const lower = file.filename.toLowerCase();
    const isTheme = lower.match(/^theme[^.]*\.mix$/);
    if (!file.getSize()) {
      if (isTheme) {
        console.warn(`Mix file ${file.filename} is empty. Skipping.`);
        return;
      }
      throw new ChecksumError(`Mix file "${lower}" is empty`, lower);
    }
    if (!isTheme) {
      await root.writeFile(file, lower);
    }
    if (isTheme) {
      const musicDir = (Engine as any).Engine.rfsSettings.musicDir;
      const outDir = await root.getOrCreateDirectory(musicDir, true);
      await this.importMusic(file, outDir, (pct) => onProgress(strings.get("ts:import_importing_pg", lower, pct)));
    } else if (lower === "langmd.mix") {
      // YR-only：语言包固定 langmd.mix，额外导入启动图与过场视频
      onProgress(strings.get("ts:import_importing_long", lower));
      const mix = new MixFile(file.stream);
      const splashBlob = await this.importSplashImage(mix, root);
      onProgress(void 0, splashBlob);
      await this.importVideo(mix, root);
    }
  }

  /**
   * 从 theme*.mix 提取 WAV 并用 ffmpeg 转成 96kbps MP3 写入 music 目录。
   *
   * 任一首失败/缺失仅 console.warn 跳过，不中断整体导入。
   *
   * @param themeFile theme*.mix 的 VirtualFile。
   * @param outDir 音乐输出目录。
   * @param onPercent 进度 0–100 回调。
   */
  async importMusic(themeFile: any, outDir: any, onPercent: (n: number) => void): Promise<void> {
    let mix: MixFile;
    try {
      mix = new MixFile(themeFile.stream);
    } catch (e) {
      console.warn("Failed to read music mix archive. Skipping.");
      console.error(e);
      return;
    }
    const list: string[] | undefined = (mixDatabase as any).mixDatabase.get(themeFile.filename.toLowerCase());
    if (!list) {
      console.warn(`File "${themeFile.filename} not found in mix database. Skipping music import.`);
      return;
    }
    const total = list.length;
    let remaining = total;
    for (const entry of list) {
      onPercent(Math.floor(((total - remaining) / total) * 100));
      remaining--;
      if (!entry.match(/\.wav$/)) {
        throw new Error(`Music file "${entry}" is not a WAV file`);
      }
      const mp3Name = entry.replace(".wav", ".mp3");
      if (mix.containsFile(entry)) {
        const vf = mix.openFile(entry);
        if (vf.stream.byteLength) {
          let mp3Bytes: Uint8Array;
          try {
            const ffmpeg = await this.createFFMpeg();
            ffmpeg.FS(
              "writeFile",
              entry,
              new Uint8Array(vf.stream.buffer, vf.stream.byteOffset, vf.stream.byteLength),
            );
            await ffmpeg.run("-i", entry, "-vn", "-ar", "22050", "-b:a", "96k", mp3Name);
            mp3Bytes = ffmpeg.FS("readFile", mp3Name);
            ffmpeg.FS("unlink", entry);
            ffmpeg.FS("unlink", mp3Name);
          } catch (e) {
            console.warn(`Failed to convert music file "${entry}". Skipping.`);
            console.error(e);
            continue;
          }
          const blob = new Blob([mp3Bytes as BlobPart], { type: "application/octet-stream" });
          try {
            await outDir.writeFile(new File([blob], mp3Name));
          } catch (e) {
            console.warn(`Failed to write music file "${mp3Name}". Skipping.`);
            console.error(e);
            continue;
          }
        } else {
          console.warn(`Music file "${entry}" is empty in the mix archive. Skipping.`);
        }
      } else {
        console.warn(`Music file "${entry} was not found in mix archive. Skipping.`);
      }
    }
  }

  /**
   * 从 langmd.mix 提取 ra2ts_l.bik 并转成 webm 菜单视频写入。
   *
   * @param mix 已打开的 langmd MixFile。
   * @param root 目标根目录。
   * @throws FileNotFoundError 缺少 ra2ts_l.bik 时抛出。
   */
  async importVideo(mix: MixFile, root: any): Promise<void> {
    const ffmpeg = await this.createFFMpeg().catch((e) => {
      if (e.message.match(/Load failed|Failed to fetch/)) {
        throw new DownloadError("Failed to load FFMpeg", { cause: e });
      }
      throw e;
    });
    const srcName = "ra2ts_l.bik";
    const outName = (Engine as any).Engine.rfsSettings.menuVideoFileName;
    if (!mix.containsFile(srcName)) throw new FileNotFoundError(srcName);
    const bik = mix.openFile(srcName);
    const webm = await new VideoConverter().convertBinkVideo(ffmpeg, bik);
    const blob = new Blob([webm as BlobPart], { type: "video/webm" });
    await root.writeFile(new File([blob], outName, { type: "video/webm" }));
  }

  /**
   * 动态加载 @ffmpeg/ffmpeg 并初始化（临时摘掉 window.define 防 AMD 冲突）。
   */
  async createFFMpeg(): Promise<any> {
    const mod = await SystemJS.import("@ffmpeg/ffmpeg");
    const createFFmpeg = mod["createFFmpeg"];
    let instance = createFFmpeg({ corePath: "lib/ffmpeg-core.js?v=1", log: true });
    const savedDefine = (window as any).define;
    (window as any).define = void 0;
    await instance.load();
    (window as any).define = savedDefine;
    return instance;
  }

  /**
   * 从 langmd.mix 提取 glsl.shp + gls.pal 转 PNG 启动图并写入。
   *
   * @param mix langmd MixFile。
   * @param root 目标根目录。
   * @returns PNG Blob（File 构造失败时仍返回 Blob）。
   * @throws FileNotFoundError 缺少 glsl.shp 或 gls.pal 时抛出。
   */
  async importSplashImage(mix: MixFile, root: any): Promise<Blob> {
    const shpName = (Engine as any).Engine.getFileNameVariant("glsl.shp");
    const palName = (Engine as any).Engine.getFileNameVariant("gls.pal");
    if (!mix.containsFile(shpName)) throw new FileNotFoundError(shpName);
    const shp = new ShpFile(mix.openFile(shpName));
    if (!mix.containsFile(palName)) throw new FileNotFoundError(palName);
    const pal = new Palette(mix.openFile(palName));
    const pngBlob: Blob = await ImageUtils.ImageUtils.convertShpToPng(shp, pal);
    const outName = (Engine as any).Engine.rfsSettings.splashImgFileName;
    let outFile: File | undefined;
    try {
      outFile = new File([pngBlob], outName, { type: pngBlob.type });
    } catch (e) {
      console.error("Failed to convert splash image. Skipping.", e);
      const splashErr = new Error(`Failed to convert splash image (type=${pngBlob.type})`);
      (splashErr as { cause?: unknown }).cause = e;
      this.sentry?.captureException(splashErr);
    }
    if (outFile) await root.writeFile(outFile);
    return pngBlob;
  }
}
