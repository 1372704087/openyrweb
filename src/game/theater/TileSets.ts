/**
 * TileSets — theater.ini 地块集合加载与 LAT/CLAT/桥/悬崖查询。
 *
 * 构造时缓存 General 桥/悬崖集合号；loadTileData 重建 TileSet/TileSetEntry
 * 与动画；isLAT/isCLAT/getLAT/getCLATSet/canConnectTiles 支撑 AutoLat；
 * 高架桥头通过 HighBridgeHeadType 枚举与 General 键反查。
 *
 * 由 game/theater/TileSets.ts.js 重写为 TS（行为完全一致）。两个文件并存期间，
 * 本文件才是修改目标：tools/repack.mjs 打包时优先采用 .ts 模块的编译产物。
 */
import { pad } from "util/string"; // 已转换
import { TileSetEntry } from "game/theater/TileSetEntry"; // 已转换
import { TileSet } from "game/theater/TileSet"; // 已转换
import { TileSetAnim } from "game/theater/TileSetAnim"; // 已转换

/* eslint-disable @typescript-eslint/no-explicit-any */

/** 高架桥头朝向类型。 */
export enum HighBridgeHeadType {
  /** 左上。 */
  TopLeft = 0,
  /** 右下。 */
  BottomRight = 1,
  /** 右上。 */
  TopRight = 2,
  /** 左下。 */
  BottomLeft = 3,
  /** 中段（左上-右下走向）。 */
  MiddleTlBr = 4,
  /** 中段（右上-左下走向）。 */
  MiddleTrBl = 5,
}

/** 桥头类型 → General 中对应 TMP 名列表（模块级，与孪生一致）。 */
const bridgeHeadFiles = new Map<number, string[]>([
  [HighBridgeHeadType.TopLeft, ["BridgeTopLeft1", "BridgeTopLeft2"]],
  [HighBridgeHeadType.BottomRight, ["BridgeBottomRight1", "BridgeBottomRight2"]],
  [HighBridgeHeadType.TopRight, ["BridgeTopRight1", "BridgeTopRight2"]],
  [HighBridgeHeadType.BottomLeft, ["BridgeBottomLeft1", "BridgeBottomLeft2"]],
  [HighBridgeHeadType.MiddleTlBr, ["BridgeMiddle1"]],
  [HighBridgeHeadType.MiddleTrBl, ["BridgeMiddle2"]],
]);

/** theater 地块集合管理器。 */
export class TileSets {
  theaterIni: any;
  tileSets: any[];
  orderedEntries: any[];
  highBridgeSetNums: any;
  cliffSetNums: any;

  constructor(theaterIni: any) {
    this.theaterIni = theaterIni;
    this.tileSets = [];
    this.orderedEntries = [];
    this.highBridgeSetNums = [
      this.getGeneralValue("BridgeSet"),
      this.getGeneralValue("WoodBridgeSet"),
    ];
    this.cliffSetNums = [
      this.getGeneralValue("CliffSet"),
      this.getGeneralValue("WaterCliffs"),
      this.getGeneralValue("DestroyableCliffs"),
    ];
  }

  /** 按全局 tileNum 取条目。 */
  getTile(tileNum: any): any {
    return this.orderedEntries[tileNum];
  }

  /**
   * 取某 tile 的子图图像。
   * @throws tile 不存在或 subTile 越界时抛错（文案与孪生一致）
   */
  getTileImage(tileNum: any, subTile: any, damaged: any): any {
    const entry = this.getTile(tileNum);
    if (!entry) throw new Error(`TileNum ${tileNum} not found`);
    const file = entry.getTmpFile(subTile, damaged);
    if (!file || subTile >= file.images.length) throw new Error(`SubTile ${subTile} not found`);
    return file.images[subTile];
  }

  /** tileNum → 所属 TileSet 下标。 */
  getSetNum(tileNum: any): any {
    const entry = this.orderedEntries[tileNum];
    if (!entry) throw new Error("Invalid tileNum " + tileNum);
    return this.tileSets.indexOf(entry.owner);
  }

  /**
   * setNum → 该集合第一个全局 tileNum；可加 rowOffset（CLAT 掩码用）。
   * 孪生用 some 在匹配下标时累加 r 并停止。
   */
  getTileNumFromSet(setNum: any, rowOffset = 0): any {
    let acc = 0;
    this.tileSets.some((set: any, index: any) => {
      if (index === setNum) {
        acc += rowOffset;
        return true;
      }
      acc += set.entries.length;
      return false;
    });
    return acc;
  }

  /** 读 [General] 键（缺节抛错）。 */
  getGeneralValue(key: any): any {
    const section = this.theaterIni.getSection("General");
    if (!section) throw new Error("Missing [General] section in theather ini");
    return section.getNumber(key);
  }

  /** 重建全部集合与动画。 */
  loadTileData(resourceMap: any, extension: any): void {
    this.tileSets.length = 0;
    this.orderedEntries.length = 0;
    this.initTileSets(resourceMap, extension);
    this.initAnimations();
  }

  /** 扫描 TileSet0000… 累加 TilesInSet 总数。 */
  readMaxTileNum(): any {
    let index = 0;
    let total = 0;
    for (;;) {
      const key = "TileSet" + pad(index, "0000");
      const section = this.theaterIni.getSection(key);
      if (!section) break;
      index++;
      total += section.getNumber("TilesInSet");
    }
    return total;
  }

  /**
   * 逐 TileSet 段建集合，并按 a-z 变体后缀扫描资源图加载 TMP。
   * Bridges 集合跳过大写变体字母段（与孪生条件一致）。
   */
  initTileSets(resourceMap: any, extension: any): void {
    let index = 0;
    let section: any;
    for (;;) {
      const key = "TileSet" + pad(index, "0000");
      section = this.theaterIni.getSection(key);
      if (!section) break;
      index++;
      const set = new TileSet(
        section.getString("FileName"),
        section.getString("SetName"),
        section.getNumber("TilesInSet"),
      );
      this.tileSets.push(set);
      for (let s = 1; s <= set.tilesInSet; s++) {
        const entry = new TileSetEntry(set, s - 1);
        const lowerA = "a".charCodeAt(0);
        for (let ch = lowerA - 1; ch <= "z".charCodeAt(0); ch++) {
          if (!(ch >= lowerA && "Bridges" === set.setName)) {
            let fileName = set.fileName + pad(s, "00");
            if (ch >= lowerA) fileName += String.fromCharCode(ch);
            fileName += extension;
            const file = resourceMap.get(fileName);
            if (!file) break;
            entry.addFile(file);
          }
        }
        set.entries.push(entry);
        this.orderedEntries.push(entry);
      }
    }
  }

  /** 扫描 TileSet 段之后的附加节，按 SetName 匹配装载 TileNAnim。 */
  initAnimations(): void {
    const sections = this.theaterIni.getOrderedSections();
    for (let n = this.tileSets.length; n < sections.length; ++n) {
      const section = sections[n];
      const set = this.tileSets.find((s: any) => s.setName === section.name);
      if (set) {
        for (let e = 1; e <= set.tilesInSet; ++e) {
          const tileKey = "Tile" + pad(e, "00");
          const animKey = tileKey + "Anim";
          const animName = section.getString(animKey);
          if (animName) {
            const anim = new TileSetAnim(
              animName,
              section.getNumber(tileKey + "AttachesTo"),
              section.getNumber(tileKey + "XOffset"),
              section.getNumber(tileKey + "YOffset"),
            );
            set.entries[e - 1].setAnimation(anim);
          } else {
            console.warn(`Missing anim "${animKey}" for tileset ` + set.setName);
          }
        }
      }
    }
  }

  /** 是否 LAT 目标地表（Rough/Sand/Green/Pave）。 */
  isLAT(setNum: any): any {
    return (
      setNum === this.getGeneralValue("RoughTile") ||
      setNum === this.getGeneralValue("SandTile") ||
      setNum === this.getGeneralValue("GreenTile") ||
      setNum === this.getGeneralValue("PaveTile")
    );
  }

  /** 是否 Clear→LAT 过渡集合。 */
  isCLAT(setNum: any): any {
    return (
      setNum === this.getGeneralValue("ClearToRoughLat") ||
      setNum === this.getGeneralValue("ClearToSandLat") ||
      setNum === this.getGeneralValue("ClearToGreenLat") ||
      setNum === this.getGeneralValue("ClearToPaveLat")
    );
  }

  /** CLAT 集合 → 目标 LAT 集合；未知返回 -1。 */
  getLAT(setNum: any): any {
    if (setNum === this.getGeneralValue("ClearToRoughLat")) {
      return this.getGeneralValue("RoughTile");
    } else if (setNum === this.getGeneralValue("ClearToSandLat")) {
      return this.getGeneralValue("SandTile");
    } else if (setNum === this.getGeneralValue("ClearToGreenLat")) {
      return this.getGeneralValue("GreenTile");
    } else if (setNum === this.getGeneralValue("ClearToPaveLat")) {
      return this.getGeneralValue("PaveTile");
    }
    return -1;
  }

  /** LAT 集合 → 对应 CLAT 集合；未知返回 -1。 */
  getCLATSet(setNum: any): any {
    if (setNum === this.getGeneralValue("RoughTile")) {
      return this.getGeneralValue("ClearToRoughLat");
    } else if (setNum === this.getGeneralValue("SandTile")) {
      return this.getGeneralValue("ClearToSandLat");
    } else if (setNum === this.getGeneralValue("GreenTile")) {
      return this.getGeneralValue("ClearToGreenLat");
    } else if (setNum === this.getGeneralValue("PaveTile")) {
      return this.getGeneralValue("ClearToPaveLat");
    }
    return -1;
  }

  /** 两集合能否作为 LAT 邻接（禁止绿-岸/绿-水桥/路系冲突等组合）。 */
  canConnectTiles(a: any, b: any): any {
    if (a === b) return false;
    const green = this.getGeneralValue("GreenTile");
    const pave = this.getGeneralValue("PaveTile");
    const miscPave = this.getGeneralValue("MiscPaveTile");
    const shore = this.getGeneralValue("ShorePieces");
    const waterBridge = this.getGeneralValue("WaterBridge");
    const pavedRoads = this.getGeneralValue("PavedRoads");
    const medians = this.getGeneralValue("Medians");
    return (
      !((a === green && b === shore) || (b === green && a === shore)) &&
      !((a === green && b === waterBridge) || (b === green && a === waterBridge)) &&
      !((a === pave && b === pavedRoads) || (b === pave && a === pavedRoads)) &&
      !((a === pave && b === miscPave) || (b === pave && a === miscPave)) &&
      !((a === pave && b === medians) || (b === pave && a === medians))
    );
  }

  /** 集合内下标 → 高架桥头类型（按 General 键值 = index+1 匹配）。 */
  getHighBridgeHeadType(index: any): any {
    for (const [headType, names] of bridgeHeadFiles) {
      for (const name of names) {
        if (this.getGeneralValue(name) === index + 1) return headType;
      }
    }
  }

  /** 桥头对侧类型；中段与未知值抛错（文案与孪生一致）。 */
  getOppositeHighBridgeHeadType(headType: any): any {
    switch (headType) {
      case HighBridgeHeadType.TopLeft:
        return HighBridgeHeadType.BottomRight;
      case HighBridgeHeadType.TopRight:
        return HighBridgeHeadType.BottomLeft;
      case HighBridgeHeadType.BottomLeft:
        return HighBridgeHeadType.TopRight;
      case HighBridgeHeadType.BottomRight:
        return HighBridgeHeadType.TopLeft;
      case HighBridgeHeadType.MiddleTlBr:
      case HighBridgeHeadType.MiddleTrBl:
        throw new Error("Middle bridge heads can't have opposites");
      default:
        throw new Error("Unhandled headType " + headType);
    }
  }

  /** 是否悬崖集合 tile。 */
  isCliffTile(tileNum: any): any {
    return this.cliffSetNums.includes(this.getSetNum(tileNum));
  }

  /** 是否高架桥端点（非中段）tile。 */
  isHighBridgeBoundaryTile(tileNum: any): any {
    if (this.highBridgeSetNums.includes(this.getSetNum(tileNum))) {
      const entry = this.getTile(tileNum);
      const head = this.getHighBridgeHeadType(entry.index);
      return (
        void 0 !== head &&
        ![HighBridgeHeadType.MiddleTlBr, HighBridgeHeadType.MiddleTrBl].includes(head)
      );
    }
    return false;
  }

  /** 是否高架桥中段 tile。 */
  isHighBridgeMiddleTile(tileNum: any): any {
    if (this.highBridgeSetNums.includes(this.getSetNum(tileNum))) {
      const entry = this.getTile(tileNum);
      const head = this.getHighBridgeHeadType(entry.index);
      return (
        void 0 !== head &&
        [HighBridgeHeadType.MiddleTlBr, HighBridgeHeadType.MiddleTrBl].includes(head)
      );
    }
    return false;
  }
}
