/**
 * Engine — 引擎门面（规则/剧场/VFS/资源集合/地图列表等全局状态）。
 *
 * 由 engine/Engine.ts.js 重写为 TS（行为完全一致）。
 * YR-only：getFileNameVariant 恒为 md 变体；RA2 剧场条目已删除。
 * 两个文件并存期间，本文件才是修改目标：tools/repack.mjs 打包时优先
 * 采用 .ts 模块的编译产物。
 */
import { IniFile } from "data/IniFile"; // 已转换
import { ShpFile } from "data/ShpFile"; // 已转换
import { VxlFile } from "data/VxlFile"; // 已转换
import { TmpFile } from "data/TmpFile"; // 已转换
import { Palette } from "data/Palette"; // 已转换
import { Theater } from "engine/Theater"; // 已转换
import { TheaterType } from "engine/TheaterType"; // 已转换
import { version } from "version"; // 已转换
import { VirtualFileSystem } from "data/vfs/VirtualFileSystem"; // 已转换
import { RealFileSystem } from "data/vfs/RealFileSystem"; // 已转换
import { LazyResourceCollection } from "engine/LazyResourceCollection"; // 已转换
import { WavFile } from "data/WavFile"; // 已转换
import { LazyAsyncResourceCollection } from "engine/LazyAsyncResourceCollection"; // 已转换
import { Mp3File } from "data/Mp3File"; // 已转换
import { mixDatabase } from "engine/mixDatabase"; // 已转换
import { GameResSource } from "engine/gameRes/GameResSource"; // 已转换
import { Crc32 } from "data/Crc32"; // 已转换
import * as GameModesModule from "game/ini/GameModes"; // 孪生
import { binaryStringToUint8Array } from "util/string"; // 已转换
import { MapList } from "engine/MapList"; // 已转换
import { HvaFile } from "data/HvaFile"; // 已转换
import * as MixinRulesTypeModule from "game/ini/MixinRulesType"; // 孪生
import { EngineType } from "engine/EngineType"; // 已转换

const GameModes = (GameModesModule as any).GameModes as any;
const MixinRulesType = (MixinRulesTypeModule as any).MixinRulesType as any;

/* eslint-disable @typescript-eslint/no-explicit-any */

/** 单剧场配置。 */
export interface TheaterEngineSettings {
  type: TheaterType;
  theaterIni: string;
  mixes: string[];
  extension: string;
  newTheaterChar: string;
  isoPaletteName: string;
  unitPaletteName: string;
  overlayPaletteName: string;
  libPaletteName: string;
}

/** RFS 目录设置（相对根目录的固定路径）。 */
export interface RfsSettings {
  menuVideoFileName: string;
  splashImgFileName: string;
  mapDir: string;
  modDir: string;
  musicDir: string;
  tauntsDir: string;
  cacheDir: string;
  replayDir: string;
}

/**
 * 引擎全局门面（全部为静态成员）。
 * 负责 rules/art/ai 加载、剧场挂载、VFS/RFS 初始化、地图列表与 mod 哈希。
 */
export class Engine {
  /** UI 动画速度倍率 */
  static UI_ANIM_SPEED = 2;

  /** 真实文件系统路径设置 */
  static rfsSettings: RfsSettings = {
    menuVideoFileName: "ra2ts_l.webm",
    splashImgFileName: "glsl.png",
    mapDir: "maps",
    modDir: "mods",
    musicDir: "music",
    tauntsDir: "Taunts",
    cacheDir: "cache",
    replayDir: "replays",
  };

  /** 引擎类型 → 可读地图扩展名列表（YR-only） */
  static supportedMapTypes = new Map<EngineType, string[]>([
    // YR-only. RA2 map types dropped.
    [EngineType.YurisRevenge, ["mpr", "map", "yrm"]],
  ]);

  /** SHP 图像集合 */
  static images = new LazyResourceCollection((e: any) => new ShpFile(e));
  /** VXL 体素集合 */
  static voxels = new LazyResourceCollection((e: any) => new VxlFile(e));
  /** HVA 体素动画集合 */
  static voxelAnims = new LazyResourceCollection((e: any) => new HvaFile(e));
  /** WAV 音效集合 */
  static sounds = new LazyResourceCollection((e: any) => new WavFile(e));
  /** MP3 主题集合（异步、默认不写缓存） */
  static themes = new LazyAsyncResourceCollection((e: any) => new Mp3File(e), false);
  /** WAV 喊话集合（异步、默认缓存） */
  static taunts = new LazyAsyncResourceCollection(async (e: any) =>
    new WavFile(new Uint8Array(await e.arrayBuffer())),
  );
  /** INI 集合 */
  static iniFiles = new LazyResourceCollection((e: any) => new IniFile(e));
  /** TMP 地块数据集合 */
  static tileData = new LazyResourceCollection((e: any) => new TmpFile(e));
  /** 调色板集合 */
  static palettes = new LazyResourceCollection((e: any) => new Palette(e));
  /** 已加载剧场缓存 */
  static theaters = new Map<TheaterType, Theater>();

  /** 引擎类型 → 剧场设置表（YR-only，已去掉 RA2 条目） */
  static theaterSettings = new Map<EngineType, TheaterEngineSettings[]>(
    [
      // YR-only. RA2 theater entry dropped (YR's md-named entries cover the
      // shared Temperate/Snow/Urban theaters plus the YR-exclusive NewUrban/Desert/Lunar).
    ] as [EngineType, TheaterEngineSettings[]][],
  ).set(EngineType.YurisRevenge, [
    {
      type: TheaterType.Temperate,
      theaterIni: "temperatmd.ini",
      mixes: ["isotemp.mix", "isotemmd.mix", "temperat.mix", "tem.mix"],
      extension: ".tem",
      newTheaterChar: "T",
      isoPaletteName: "isotem.pal",
      unitPaletteName: "unittem.pal",
      overlayPaletteName: "temperat.pal",
      libPaletteName: "libtem.pal",
    },
    {
      type: TheaterType.Snow,
      theaterIni: "snowmd.ini",
      mixes: ["isosnomd.mix", "snowmd.mix", "isosnow.mix", "snow.mix", "sno.mix"],
      extension: ".sno",
      newTheaterChar: "A",
      isoPaletteName: "isosno.pal",
      unitPaletteName: "unitsno.pal",
      overlayPaletteName: "snow.pal",
      libPaletteName: "libsno.pal",
    },
    {
      type: TheaterType.Urban,
      theaterIni: "urbanmd.ini",
      mixes: ["isourbmd.mix", "isourb.mix", "urb.mix", "urban.mix"],
      extension: ".urb",
      newTheaterChar: "U",
      isoPaletteName: "isourb.pal",
      unitPaletteName: "uniturb.pal",
      overlayPaletteName: "urban.pal",
      libPaletteName: "liburb.pal",
    },
    {
      type: TheaterType.NewUrban,
      theaterIni: "urbannmd.ini",
      mixes: ["isoubnmd.mix", "isoubn.mix", "ubn.mix", "urbann.mix"],
      extension: ".ubn",
      newTheaterChar: "N",
      isoPaletteName: "isoubn.pal",
      unitPaletteName: "unitubn.pal",
      overlayPaletteName: "urbann.pal",
      libPaletteName: "libubn.pal",
    },
    {
      type: TheaterType.Desert,
      theaterIni: "desertmd.ini",
      mixes: ["isodesmd.mix", "desert.mix", "des.mix", "isodes.mix"],
      extension: ".des",
      newTheaterChar: "D",
      isoPaletteName: "isodes.pal",
      unitPaletteName: "unitdes.pal",
      overlayPaletteName: "desert.pal",
      libPaletteName: "libdes.pal",
    },
    {
      type: TheaterType.Lunar,
      theaterIni: "lunarmd.ini",
      mixes: ["isolunmd.mix", "isolun.mix", "lun.mix", "lunar.mix"],
      extension: ".lun",
      newTheaterChar: "L",
      isoPaletteName: "isolun.pal",
      unitPaletteName: "unitlun.pal",
      overlayPaletteName: "lunar.pal",
      libPaletteName: "liblun.pal",
    },
  ]);

  /** 自定义规则 INI 文件名 */
  static customRulesFileName = "rulescd.ini";
  /** 自定义艺术 INI 文件名 */
  static customArtFileName = "artcd.ini";
  /** 自定义多人模式 INI 文件名 */
  static customMpModesFileName = "mpmodescd.ini";
  /** 遮蔽 SHP 文件名 */
  static shroudFileName = "shroud.shp";
  /** Mixin 规则键 → 文件名 */
  static mixinRulesFileNames = new Map<any, string>().set(
    MixinRulesType.NoDogEngiKills,
    "nodogengikills.ini",
  );

  // —— 运行时状态 ——
  static activeEngine?: EngineType;
  static activeTheater?: Theater;
  static activeMod?: string;
  static modHash?: number;
  static mapList?: MapList;
  static rfs?: any;
  static vfs?: any;
  static art?: any;
  static rules?: any;
  static ai?: any;
  static gameResSource?: any;

  /** 语义化版本的前两段（如 "1.2"）。 */
  static getVersion(): string {
    return version.split(".").slice(0, 2).join(".");
  }

  /** 规则加载后的 mod 哈希；未加载则抛错。 */
  static getModHash(): number {
    if (!this.modHash) {
      throw new Error("Rules must be loaded first");
    }
    return this.modHash;
  }

  /** 当前 mod 目录名。 */
  static getActiveMod(): string | undefined {
    return this.activeMod;
  }

  /**
   * 设置当前 mod 目录名。
   * @param e - mod 名
   */
  static setActiveMod(e: string): void {
    this.activeMod = e;
  }

  /**
   * 注入 gameRes 源。
   * @param e - GameResSource
   */
  static initGameResSource(e: any): void {
    this.gameResSource = e;
  }

  /**
   * 初始化真实文件系统并挂根目录。
   * @param e - 根目录 FileSystemDirectoryHandle
   */
  static async initRfs(e: any): Promise<any> {
    const t = (this.rfs = new RealFileSystem());
    t.addRootDirectoryHandle(e);
    return t;
  }

  /**
   * 初始化虚拟文件系统，并为各集合注入 vfs / 查找 music、Taunts 目录。
   * @param e - VFS 构造第一参
   * @param t - VFS 构造第二参
   */
  static async initVfs(e: any, t: any): Promise<any> {
    this.vfs = new VirtualFileSystem(e, t);
    this.iniFiles.setVfs(this.vfs);
    this.palettes.setVfs(this.vfs);
    this.images.setVfs(this.vfs);
    this.voxels.setVfs(this.vfs);
    this.voxelAnims.setVfs(this.vfs);
    this.tileData.setVfs(this.vfs);
    this.sounds.setVfs(this.vfs);
    this.themes.setDir(await this.rfs?.findDirectory(this.rfsSettings.musicDir));
    this.taunts.setDir(await this.rfs?.findDirectory(this.rfsSettings.tauntsDir));
    return this.vfs;
  }

  /**
   * 当前引擎是否支持该剧场。
   * @param t - 剧场类型
   */
  static supportsTheater(t: TheaterType): boolean {
    const e = this.getActiveEngine();
    return this.theaterSettings.get(e)?.some((e2) => e2.type === t) || false;
  }

  /**
   * 取剧场设置；未知引擎或不支持的剧场则抛错。
   * @param e - 引擎类型
   * @param t - 剧场类型
   */
  static getTheaterSettings(e: EngineType, t: TheaterType): TheaterEngineSettings {
    if (!this.theaterSettings.has(e)) {
      throw new Error('Unknown engineType "' + e);
    }
    const i = this.theaterSettings.get(e)!.find((e2) => e2.type === t);
    if (!i) {
      throw new Error(`Unsupported theater "${TheaterType[t]}"`);
    }
    return i;
  }

  /**
   * 加载（或取缓存）剧场并设为 activeTheater。
   * @param e - 剧场类型
   */
  static async loadTheater(e: TheaterType): Promise<Theater> {
    if (!this.rules || !this.art) {
      throw new Error("Rules and art should be loaded first");
    }
    if (this.gameResSource === undefined) {
      throw new Error("No gameResSource is set");
    }
    let t = this.getActiveEngine();
    let i: Theater | undefined;
    let r: any;
    const s = this.getTheaterSettings(t, e);
    if (this.gameResSource !== GameResSource.Cdn) {
      for (const a of s.mixes) {
        await this.vfs.addMixFile(a);
      }
    }
    if (this.theaters.has(e)) {
      i = this.theaters.get(e);
    } else {
      r = this.getTheaterIni(t, e);
      t = this.getTileData() as any;
      i = Theater.factory(e, r, s, t, this.palettes as any);
      this.theaters.set(e, i);
    }
    this.activeTheater = i;
    return i;
  }

  /**
   * 从 VFS 卸载剧场相关 MIX。
   * @param e - 剧场类型
   */
  static unloadTheater(e: TheaterType): void {
    if (this.vfs) {
      let t: any;
      const i = this.getActiveEngine();
      for (t of this.getTheaterSettings(i, e).mixes) {
        this.vfs.removeArchive(t);
      }
    }
  }

  /** 卸载 sidec01 / sidec01cd 中的 pal 与图像缓存。 */
  static unloadSideMixData(): void {
    for (const e of ["sidec01.mix", "sidec01cd.mix"]) {
      let t: any;
      const i = mixDatabase.get(e);
      if (!i) {
        console.warn(`Mix "${e}" not found in mix database`);
        return;
      }
      for (t of i) {
        (t.split(".").pop() === "pal" ? this.palettes : this.images).clear(t);
      }
    }
  }

  /**
   * 取剧场 INI。
   * @param e - 引擎类型
   * @param t - 剧场类型
   */
  static getTheaterIni(e: EngineType, t: TheaterType): any {
    const i = this.getTheaterSettings(e, t).theaterIni;
    return this.getIni(i);
  }

  /** 加载 rules/art/ai 及自定义覆盖，计算 mod 哈希。 */
  static loadRules(): void {
    const e = this.getFileNameVariant("rules.ini");
    const t = this.getFileNameVariant("art.ini");
    const i = this.getFileNameVariant("ai.ini");
    const r = this.iniFiles.get(e);
    const s = this.iniFiles.get(t);
    const a = this.iniFiles.get(i);
    if (!r) {
      throw new Error(`Rules "${e}" not found`);
    }
    if (!s) {
      throw new Error(`Art "${t}" not found`);
    }
    if (!a) {
      throw new Error(`AI "${i}" not found`);
    }
    const customRules = this.iniFiles.get(this.customRulesFileName);
    const customArt = this.iniFiles.get(this.customArtFileName);
    if (!customRules) {
      throw new Error(`Rules "${this.customRulesFileName}" not found`);
    }
    if (!customArt) {
      throw new Error(`Art "${this.customArtFileName}" not found`);
    }
    this.art = s.clone().mergeWith(customArt);
    this.rules = this.patchAudioVisualRules(r.clone().mergeWith(customRules));
    this.ai = a;
    this.modHash = this.computeModHash();
  }

  /**
   * 把 General 中列出的 AudioVisual 键同步到 [AudioVisual]（YR 恒执行）。
   * @param i - 规则 INI（可变，就地 set）
   */
  static patchAudioVisualRules(i: any): any {
    // YR-only engine — this AudioVisual merge always runs.
    {
      const t = i.getSection("General");
      if (t) {
        const e = i.getSection("AudioVisual");
        let r: string;
        for (r of [
          "DamageFireTypes",
          "OreTwinkle",
          "BarrelExplode",
          "BarrelDebris",
          "BarrelParticle",
          "NukeTakeOff",
          "Wake",
          "DropPod",
          "DeadBodies",
          "MetallicDebris",
          "BridgeExplosions",
          "IonBlast",
          "IonBeam",
          "WeatherConClouds",
          "WeatherConBolts",
          "WeatherConBoltExplosion",
          "DominatorWarhead",
          "DominatorDamage",
          "DominatorCaptureRange",
          "DominatorFirstAnim",
          "DominatorSecondAnim",
          "DominatorFireAtPercentage",
          "PsychicDominatorActivateSound",
          "ChronoPlacement",
          "ChronoBeam",
          "ChronoBlast",
          "ChronoBlastDest",
          "WarpIn",
          "WarpOut",
          "WarpAway",
          "IronCurtainInvokeAnim",
          "ForceShieldInvokeAnim",
          "WeaponNullifyAnim",
          "ChronoSparkle1",
          "InfantryExplode",
          "FlamingInfantry",
          "InfantryHeadPop",
          "InfantryNuked",
          "InfantryVirus",
          "InfantryBrute",
          "InfantryMutate",
          "Behind",
          "MoveFlash",
          "Parachute",
          "BombParachute",
          "DropZoneAnim",
          "EMPulseSparkles",
        ]) {
          if (t.has(r)) {
            e?.set(r, t.getString(r));
          }
        }
      }
    }
    return i;
  }

  /** 对规则相关 INI 字节与版本串做 CRC，得到 mod 哈希。 */
  static computeModHash(): number {
    if (!this.vfs) {
      throw new Error("VFS not initialized");
    }
    const e: string[] = [
      this.customRulesFileName,
      this.customArtFileName,
      this.customMpModesFileName,
      this.shroudFileName,
      this.getFileNameVariant("rules.ini"),
      this.getFileNameVariant("art.ini"),
      this.getFileNameVariant("ai.ini"),
      ...this.mixinRulesFileNames.values(),
    ];
    let t: any;
    let i: any;
    let r: string;
    const s = this.theaterSettings.get(this.getActiveEngine());
    if (!s) {
      throw new Error('Unsupported engineType "' + this.getActiveEngine());
    }
    for (t of s) {
      e.push(t.theaterIni);
    }
    const a = this.getMpModes();
    for (i of a.getAll() as any[]) {
      // 孪生: 推入每模式的 rulesOverride（可能为 undefined 时由 vfs.fileExists 抛错路径覆盖）
      e.push((i as any).rulesOverride);
    }
    const n = new Crc32();
    for (r of e) {
      if (!this.vfs.fileExists(r)) {
        throw new Error(`File ${r} not found`);
      }
      const o = this.vfs.openFile(r).stream;
      n.append(new Uint8Array(o.buffer, o.byteOffset, o.byteLength));
    }
    n.append(binaryStringToUint8Array(this.getVersion()));
    return n.get();
  }

  /** 规则 INI；未加载则抛错。 */
  static getRules(): any {
    if (!this.rules) {
      throw new Error("Rules must be loaded first");
    }
    return this.rules;
  }

  /** 艺术 INI；未加载则抛错。 */
  static getArt(): any {
    if (!this.art) {
      throw new Error("Art must be loaded first");
    }
    return this.art;
  }

  /** AI INI；未加载则抛错。 */
  static getAi(): any {
    if (!this.ai) {
      throw new Error("AI must be loaded first");
    }
    return this.ai;
  }

  /**
   * 把扩展名前的点替换为 md.（YR-only，恒返回 md 变体）。
   * @param e - 文件名，如 rules.ini → rulesmd.ini
   */
  static getFileNameVariant(e: string): string {
    // YR-only engine. Always return the "md" variant (rulesmd.ini,
    // artmd.ini, etc.). RA2 support has been dropped — the base game's data still
    // loads (ra2.mix is mounted) but the engine never reads the non-md INI names.
    return e.replace(/\.([^.]+)$/, "md.$1");
  }

  /** 从 mpmodescd.ini 构建 GameModes。 */
  static getMpModes(): any {
    return new GameModes(this.getIni(this.customMpModesFileName), (e: string) => this.getIni(e));
  }

  /**
   * 合并 soundcd + soundmd，并把 rules 中 [AudioVisual] 引用的
   * 声音节段补进结果（部分 mod 直接写在 rulesmd 而不进 soundmd 的 [SoundList]）。
   */
  static getSoundIni(): any {
    const e = this.getIni("soundcd.ini");
    const t = this.getIni(this.getFileNameVariant("sound.ini"));
    const s = t.clone().mergeWith(e);
    // also merge sound sections referenced by [AudioVisual] fields from
    // the rules files. Some mods define new sound sections (e.g. [PsychicDominatorActivate]
    // with Sounds=$spsydom) directly in rulesmd.ini without adding them to soundmd.ini's
    // [SoundList]. We directly look up known [AudioVisual] fields, get the sound section
    // name, and merge that section from the rules INI into the sound INI.
    const soundFields = ["PsychicDominatorActivateSound"];
    try {
      const rulesFiles = [this.getFileNameVariant("rules.ini"), this.customRulesFileName];
      for (const fname of rulesFiles) {
        const rf = this.iniFiles.get(fname);
        if (rf) {
          const av = rf.getSection("AudioVisual");
          if (av) {
            for (const fld of soundFields) {
              const sndName = av.getString(fld);
              if (sndName && !s.getSection(sndName)) {
                const sec = rf.getSection(sndName);
                if (sec) {
                  s.sections.set(sndName, sec.clone());
                }
              }
            }
          }
        }
      }
    } catch (_) {
      // 孪生空 catch：文案合并失败时返回已合并结果
    }
    return s;
  }

  /** 取 ui 变体 INI。 */
  static getUiIni(): any {
    const e = this.getFileNameVariant("ui.ini");
    return this.getIni(e);
  }

  /**
   * 按文件名取 INI；不存在则抛错。
   * @param e - 文件名
   */
  static getIni(e: string): any {
    if (!this.iniFiles.has(e)) {
      throw new Error(`INI file ${e} not found.`);
    }
    return this.iniFiles.get(e);
  }

  /** 从 missions.pkt、各归档同名 .pkt 及 RFS 目录扫描地图列表。 */
  static async loadMapList(): Promise<MapList> {
    if (!this.vfs) {
      throw new Error("File system not initialized");
    }
    let e: any;
    let i: any;
    let r: any;
    const t = this.getMpModes();
    const s = new MapList(t);
    s.addFromIni(this.getIni(this.getFileNameVariant("missions.pkt")));
    for (e of this.vfs.listArchives()) {
      const a = e.toLowerCase().replace(/\.[^.]+$/, "") + ".pkt";
      if (this.vfs.fileExists(a)) {
        s.addFromIni(new IniFile(this.vfs.openFile(a)) as any);
      }
    }
    const n = new MapList(t);
    const o = this.supportedMapTypes.get(this.getActiveEngine());
    if (!o) {
      throw new Error(`No map types defined for engine type "${this.getActiveEngine()}"`);
    }
    if (this.rfs) {
      // eslint-disable-next-line no-await-in-loop
      for await (const l of this.rfs.getEntries()) {
        const lower = l.toLowerCase();
        try {
          if (lower.endsWith(".pkt")) {
            i = new IniFile(await this.rfs.openFile(l, true));
            s.addFromIni(i as any);
          } else if (o.some((ext) => lower.endsWith("." + ext))) {
            r = await this.rfs.openFile(l, true);
            n.addFromMapFile(r);
          }
        } catch (e2) {
          console.warn(`Couldn't read file "${l}"`, e2);
        }
      }
    }
    n.sortByName();
    s.mergeWith(n);
    this.mapList = s;
    return s;
  }

  /** TMP 地块集合。 */
  static getTileData(): LazyResourceCollection {
    return this.tileData;
  }

  /** SHP 图像集合。 */
  static getImages(): LazyResourceCollection {
    return this.images;
  }

  /** VXL 体素集合。 */
  static getVoxels(): LazyResourceCollection {
    return this.voxels;
  }

  /** HVA 体素动画集合。 */
  static getVoxelAnims(): LazyResourceCollection {
    return this.voxelAnims;
  }

  /** 调色板集合。 */
  static getPalettes(): LazyResourceCollection {
    return this.palettes;
  }

  /** WAV 音效集合。 */
  static getSounds(): LazyResourceCollection {
    return this.sounds;
  }

  /** MP3 主题集合。 */
  static getThemes(): LazyAsyncResourceCollection {
    return this.themes;
  }

  /** 喊话集合。 */
  static getTaunts(): LazyAsyncResourceCollection {
    return this.taunts;
  }

  /** 当前引擎类型；未初始化则抛错。 */
  static getActiveEngine(): EngineType {
    if (!this.activeEngine) {
      throw new Error("Engine type not initialized");
    }
    return this.activeEngine;
  }

  /**
   * 设置当前引擎类型。
   * @param e - 引擎类型
   */
  static setActiveEngine(e: EngineType): void {
    this.activeEngine = e;
  }

  /** 最近加载的剧场类型。 */
  static getLastTheaterType(): TheaterType | undefined {
    return this.activeTheater?.type;
  }

  /** 取（或创建）cache 目录；失败时 console.error 并返回 undefined。 */
  static getCacheDir(): any {
    try {
      return this.getOrCreateDir(this.rfsSettings.cacheDir, true);
    } catch (e) {
      console.error("Couldn't get cache directory", [e]);
      return undefined;
    }
  }

  /** 当前 mod 下的 replays 目录（无 mod 时走根级 replayDir）。 */
  static async getReplayDir(): Promise<any> {
    const i = this.getActiveMod();
    if (i) {
      const e = await this.getModDir();
      const t = await e?.getDirectory(i);
      return t?.getOrCreateDirectory(this.rfsSettings.replayDir);
    }
    return this.getOrCreateDir(this.rfsSettings.replayDir);
  }

  /** mods 根目录。 */
  static getModDir(): any {
    return this.getOrCreateDir(this.rfsSettings.modDir);
  }

  /** maps 根目录。 */
  static getMapDir(): any {
    return this.getOrCreateDir(this.rfsSettings.mapDir);
  }

  /**
   * 在 RFS 根下取或建目录。
   * @param e - 相对路径
   * @param t - 是否允许创建（默认 false）
   */
  static async getOrCreateDir(e: string, t: boolean = false): Promise<any> {
    const i = this.rfs?.getRootDirectory();
    if (i) {
      return await i.getOrCreateDirectory(e, t);
    }
    return undefined;
  }

  /** 当前地图列表。 */
  static getMapList(): MapList | undefined {
    return this.mapList;
  }

  /** 清空引擎全部运行时状态与集合。 */
  static destroy(): void {
    this.activeEngine = undefined;
    this.activeTheater = undefined;
    this.activeMod = undefined;
    this.modHash = undefined;
    this.mapList = undefined;
    this.rfs = undefined;
    this.vfs = undefined;
    this.art = undefined;
    this.iniFiles.clear();
    this.images.clear();
    this.palettes.clear();
    this.rules = undefined;
    this.ai = undefined;
    this.theaters.clear();
    this.tileData.clear();
    this.voxels.clear();
    this.voxelAnims.clear();
  }
}
