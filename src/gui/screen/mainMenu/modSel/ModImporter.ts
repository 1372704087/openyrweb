/**
 * ModImporter — 7z-wasm 解压并导入模组目录。
 *
 * 静态 modFileExtensions=["ini","mix"]；quota 不足提前 alert 并清理；
 * 无 modcd.ini 时提示 unsupported 并让用户命名文件夹。
 *
 * 由 gui/screen/mainMenu/modSel/ModImporter.ts.js 重写为 TS。
 * 两个文件并存期间，本文件才是修改目标。
 */
import { sleep } from "util/time"; // 已转换
import { IOError } from "data/vfs/IOError"; // 已转换
import { ArchiveExtractionError } from "engine/gameRes/importError/ArchiveExtractionError"; // 已转换
import { InvalidArchiveError } from "engine/gameRes/importError/InvalidArchiveError"; // 已转换
import { ModManager } from "gui/screen/mainMenu/modSel/ModManager"; // 孪生（本组内一并转换）
import { ModMeta } from "gui/screen/mainMenu/modSel/ModMeta"; // 孪生（本组内一并转换）
import { BadModArchiveError } from "gui/screen/mainMenu/modSel/BadModArchiveError"; // 孪生（本组内一并转换）
import { IniFile } from "data/IniFile"; // 已转换
import { DuplicateModError } from "gui/screen/mainMenu/modSel/DuplicateModError"; // 孪生（本组内一并转换）
import { VirtualFile } from "data/vfs/VirtualFile"; // 已转换

declare const SystemJS: any;

/* eslint-disable @typescript-eslint/no-explicit-any */

export class ModImporter {
  /** 静态：可接受的模组文件扩展。 */
  static modFileExtensions = ["ini", "mix"];

  /** i18n。 */
  strings: any;
  /** 消息框。 */
  messageBoxApi: any;
  /** storage（navigator.storage）。 */
  storage: any;

  constructor(strings: any, messageBoxApi: any, storage: any) {
    this.strings = strings;
    this.messageBoxApi = messageBoxApi;
    this.storage = storage;
  }

  /** 解压 file 到 modDir，返回 ModMeta（取消/失败返回 void）。 */
  async import(
    file: File,
    modDir: any,
    overwrite: boolean,
    onProgress: (msg: any) => void,
  ): Promise<ModMeta | undefined> {
    let s = this.strings;
    let quitCode: any;
    let quitMsg: any;
    let seven: any;
    try {
      let factory = await SystemJS.import("7z-wasm");
      seven = await factory({
        quit: (code: any, msg: any) => {
          quitCode = code;
          quitMsg = msg;
        },
      });
    } catch (e: any) {
      if (e instanceof WebAssembly.RuntimeError)
        throw new IOError("Couldn't load 7z-wasm", { cause: e });
      throw e;
    }
    onProgress(s.get("ts:import_loading_archive"));
    seven.FS.chdir("/tmp");
    var fileName = file.name;
    try {
      var buf = await file.arrayBuffer();
      var fh = seven.FS.open(fileName, "w+");
      seven.FS.write(fh, new Uint8Array(buf), 0, buf.byteLength, 0, true);
      seven.FS.close(fh);
    } catch (e: any) {
      if (e instanceof DOMException)
        throw new IOError(`File "${fileName}" could not be read (${e.name})`, {
          cause: e,
        });
      throw e;
    }
    onProgress(s.get("ts:import_extracting_archive"));
    await sleep(100);
    seven.callMain(["x", "-ssc-", "-x!*/", fileName, "*.*"]);
    if (quitCode) {
      if (1 !== quitCode)
        throw new InvalidArchiveError("7-Zip exited with code " + quitCode, {
          cause: quitMsg,
        });
      if (quitMsg?.message?.match(/out of memory|allocation/i))
        throw Object.assign(new RangeError("Out of memory"), {
          cause: quitMsg,
        });
      throw new ArchiveExtractionError(
        "Archive extraction failed with code " + quitCode,
        { cause: quitMsg },
      );
    }
    seven.FS.unlink(fileName);
    let node = seven.FS.lookupPath(seven.FS.cwd())["node"];
    let names = Object.keys(node.contents);
    let meta = new ModMeta();
    var nameList = names;
    var cleanup = () => {
      ({ node } = seven.FS.lookupPath(seven.FS.cwd()));
      names = Object.keys(node.contents);
      for (const n of names) seven.FS.unlink(n);
    };
    let totalBytes = 0;
    for (const n of nameList) totalBytes += seven.FS.stat(n).size;
    if (this.storage?.estimate) {
      const est: any = await this.storage.estimate().catch((e) => {
        console.warn("Couldn't get storage estimate", [e]);
      });
      if (est?.quota && est.usage) {
        const free = est.quota - est.usage;
        if (free < totalBytes + 1048576) {
          await this.messageBoxApi.alert(
            s.get(
              "GUI:InstallModStorageFull",
              free / 1024 / 1024,
              totalBytes / 1024 / 1024,
            ),
            s.get("GUI:OK"),
          );
          return void cleanup();
        }
      }
    }
    try {
      let existing = await modDir.listEntries();
      let folder: string;
      if (nameList.includes(ModManager.modMetaFileName)) {
        let raw = this.readFileFromEmFs(
          seven.FS,
          ModManager.modMetaFileName,
        );
        try {
          meta.fromIniFile(new IniFile(raw.readAsString("utf-8")));
        } catch {
          throw new BadModArchiveError("Mod meta file is invalid");
        }
        folder = meta.id!;
        if (!overwrite && existing.find((e) => e.toLowerCase() === folder))
          throw new DuplicateModError(
            `A mod with the id "${meta.id}" already exists`,
          );
      } else {
        if (
          !nameList.some((n) =>
            (ModImporter.modFileExtensions as string[]).includes(
              node.contents[n].name.toLowerCase().split(".").pop() as string,
            ),
          )
        )
          throw new BadModArchiveError(
            "Archive doesn't contain a valid mod",
          );
        if (
          !(await this.messageBoxApi.confirm(
            this.strings.get("GUI:ImportModUnsupportedWarn"),
            this.strings.get("GUI:Continue"),
            this.strings.get("GUI:Cancel"),
          ))
        )
          return void cleanup();
        folder = await this.promptFolderName(existing);
        if (!folder) return void cleanup();
        meta.id = folder;
        meta.name = folder;
      }
      let dir = await modDir.getOrCreateDirectory(folder);
      for await (const fh of dir.getFileHandles()) await dir.deleteFile(fh.name);
      for (const n of nameList) {
        onProgress(s.get("ts:import_importing", n));
        try {
          var vf = this.readFileFromEmFs(seven.FS, n);
          await dir.writeFile(vf);
        } catch (e) {
          await modDir.deleteDirectory(dir.name, true);
          throw e;
        } finally {
          seven.FS.unlink(n);
        }
      }
    } finally {
      cleanup();
    }
    return meta;
  }

  /** 循环让用户输入合法且不冲突的文件夹名。 */
  async promptFolderName(existing: string[]): Promise<string | undefined> {
    let s = this.strings;
    let name: string | undefined;
    for (;;) {
      name = await this.messageBoxApi.prompt(
        s.get("GUI:ImportModFolderPrompt"),
        s.get("GUI:Ok"),
        s.get("GUI:Cancel"),
      );
      if (!name) return;
      if (name.match(ModManager.modIdRegex)) {
        if (!existing.some((e) => e.toLowerCase() === name)) break;
        await this.messageBoxApi.alert(
          s.get("GUI:ImportModFolderExists"),
          s.get("GUI:Ok"),
        );
      } else
        await this.messageBoxApi.alert(
          s.get("GUI:ImportModFolderBadName"),
          s.get("GUI:Ok"),
        );
    }
    return name;
  }

  /** 从 Emscripten FS 读文件为 VirtualFile。 */
  readFileFromEmFs(fs: any, path: string): VirtualFile {
    fs.chmod(path, 448);
    let node = fs.lookupPath(path)["node"];
    var bytes = node.contents.subarray(0, node.usedBytes);
    return VirtualFile.fromBytes(bytes, path.slice(path.lastIndexOf("/") + 1));
  }
}
