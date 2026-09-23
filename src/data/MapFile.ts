/**
 * MapFile — 地图主文件（继承 IniFile，解析 .map 内全部运行时结构）。
 *
 * fromString 流程：校验 [Map]/Theater → 初始化 scenario* Map →
 * readTiles(IsoMapPack5/Format5) → waypoints/zones/结构与单位/地形/
 * overlay/smudge/lighting/tags+triggers → scenario teams → cellTags/
 * variables/startingLocations/specialFlags。
 *
 * 由 data/MapFile.ts.js 重写为 TS（行为完全一致）。两个文件并存期间，
 * 本文件才是修改目标：tools/repack.mjs 打包时优先采用 .ts 模块的编译产物。
 */
import * as MapObjects from "data/mapObjects"; // 本组已写
import { IniFile } from "data/IniFile"; // 已转换
import * as TheaterTypeModule from "engine/TheaterType"; // 未转换（any-shim）
import { base64StringToUint8Array } from "util/string"; // 已转换
import { Format5 } from "data/encoding/Format5"; // 本组已写
import { RgbBitmap } from "data/Bitmap"; // 已转换
import { TagsReader } from "data/map/tag/TagsReader"; // 已转换
import { TriggerReader } from "data/map/trigger/TriggerReader"; // 已转换
import * as DataStreamModule from "data/DataStream"; // 未转换（any-shim）
import * as MapLightingModule from "data/map/MapLighting"; // 未转换（any-shim）
import { CellTagsReader } from "data/map/tag/CellTagsReader"; // 已转换
import * as VariableModule from "data/map/Variable"; // 已转换
import * as SpecialFlagsModule from "data/map/SpecialFlags"; // 未转换（any-shim）

/* eslint-disable @typescript-eslint/no-explicit-any */

/** 剧场类型枚举（any-shim：孪生仅 .ts.js）。 */
const TheaterType: any = TheaterTypeModule.TheaterType;
/** 等距数据流读取器。 */
const DataStream: any = DataStreamModule.DataStream;
/** 光照配置载体。 */
const MapLighting: any = MapLightingModule.MapLighting;
/** 地图变量记录。 */
const Variable: any = VariableModule.Variable;
/** 特殊标志位载体。 */
const SpecialFlags: any = SpecialFlagsModule.SpecialFlags;

/** 地图矩形区域（x,y 起点 + 宽高）。 */
export interface MapRect {
  x: number;
  y: number;
  width: number;
  height: number;
}

/** IsoMapPack 解出的等距 tile。 */
export interface MapTile {
  dx: number;
  dy: number;
  rx: number;
  ry: number;
  z: number;
  tileNum: number;
  subTile: number;
}

/** 路径点（编号 + 等距坐标）。 */
export interface Waypoint {
  number: number;
  rx: number;
  ry: number;
}

/** [Zone] 矩形区域条目。 */
export interface ZoneEntry {
  index: number;
  minX: number;
  minY: number;
  maxX: number;
  maxY: number;
}

/** [Houses] 阵营解析结果。 */
export interface HouseEntry {
  name: string;
  country: string;
  color: string;
  iq: number;
  edge: string;
  credits: number;
  techLevel: number;
  playerControl: boolean;
  allies: string[];
  control: string;
}

/** 场景 ScriptTypes 条目。 */
export interface ScenarioScript {
  id: string;
  index: number;
  actions: { type: number; parameter: number }[];
}

/** 场景 TaskForces 条目。 */
export interface ScenarioTaskForce {
  id: string;
  index: number;
  entries: { count: number; objectName: string }[];
}

/** 场景 TeamTypes 条目。 */
export interface ScenarioTeam {
  id: string;
  index: number;
  houseName: string;
  scriptId: string;
  taskForceId: string;
  tagId?: string;
  waypoint?: number;
  transportWaypoint?: number;
  veteranLevel: number;
  aggressive: boolean;
  annoyance: boolean;
  autocreate: boolean;
  droppod: boolean;
  full: boolean;
  group: number;
  guardSlower: boolean;
  loadable: boolean;
  looseRecruit: boolean;
  max: number;
  onTransOnly: boolean;
  prebuild: boolean;
  priority: number;
  recruiter: boolean;
  reinforce: boolean;
  suicide: boolean;
  techLevel: number;
  transportsReturnOnUnload: boolean;
  useTransportOrigin: boolean;
  areTeamMembersRecruitable: boolean;
  onlyTargetHouseEnemy: boolean;
}

/** 场景 AITriggerTypes 条目。 */
export interface ScenarioAiTrigger {
  id: string;
  raw: string;
  enabled: boolean;
}

export class MapFile extends IniFile {
  /** ART 覆盖段前缀（fromJson 剥离后单独存）。 */
  static artSectionPrefix = "ART";

  /** 完整地图尺寸。 */
  fullSize: MapRect;
  /** 本地（可见）尺寸。 */
  localSize: MapRect;
  /** 剧场类型（any-shim 枚举）。 */
  theaterType: any;
  /** INI 格式版本（NewINIFormat）。 */
  iniFormat: number;
  /** 等距 tile 数组（按 h(dx, dy/2) 索引）。 */
  tiles: MapTile[];
  /** 最大 tile 编号（readTiles 扫描时记录）。 */
  maxTileNum: number;
  /** 路径点列表。 */
  waypoints: Waypoint[];
  /** [Zone] 区域。 */
  zones: ZoneEntry[];
  /** 建筑。 */
  structures: any[];
  /** 载具。 */
  vehicles: any[];
  /** 步兵。 */
  infantries: any[];
  /** 飞行器。 */
  aircrafts: any[];
  /** 地形。 */
  terrains: any[];
  /** 覆盖物。 */
  overlays: any[];
  /** 最大 overlay id。 */
  maxOverlayId: number;
  /** 污渍。 */
  smudges: any[];
  /** 主光照。 */
  lighting: any;
  /** 离子风暴光照。 */
  ionLighting: any;
  /** 标签表。 */
  tags: any;
  /** 触发器列表。 */
  triggers: any[];
  /** 未识别事件类型。 */
  unknownEventTypes: Set<number>;
  /** 未识别动作类型。 */
  unknownActionTypes: Set<number>;
  /** 已知但未实现的事件类型。 */
  unimplementedEventTypes: Set<number>;
  /** 已知但未实现的动作类型。 */
  unimplementedActionTypes: Set<number>;
  /** ScriptTypes 场景脚本。 */
  scenarioScripts: Map<string, ScenarioScript>;
  /** TaskForces 场景特遣队。 */
  scenarioTaskForces: Map<string, ScenarioTaskForce>;
  /** TeamTypes 场景小队。 */
  scenarioTeams: Map<string, ScenarioTeam>;
  /** AITriggerTypes 场景 AI 触发器。 */
  scenarioAiTriggers: Map<string, ScenarioAiTrigger>;
  /** 单元格标签。 */
  cellTags: any;
  /** 全局变量表（编号 → Variable）。 */
  variables: Map<number, any>;
  /** 出生点（waypoint 0..7 投影为坐标）。 */
  startingLocations: { x: number; y: number }[];
  /** 特殊标志位。 */
  specialFlags: any;
  /** ART 覆盖 INI（fromJson 时从顶层剥出）。 */
  artOverrides?: IniFile;

  constructor(input?: any) {
    super(input);
  }


  /** 解析地图字符串并组装全部运行时结构。 */
  fromString(str: string): this {
    super.fromString(str);
    let section = this.getSection("Map");
    if (!section) throw new Error("[Map] section not found");
    let nums = section.getNumberArray("Size");
    this.fullSize = { x: nums[0], y: nums[1], width: nums[2], height: nums[3] };
    nums = section.getNumberArray("LocalSize");
    this.localSize = { x: nums[0], y: nums[1], width: nums[2], height: nums[3] };
    this.theaterType = section.getEnum("Theater", TheaterType, TheaterType.None, true);
    if (this.theaterType === TheaterType.None)
      throw new Error(`Unsupported theater type "${section.getString("Theater")}"`);
    const basic = this.getSection("Basic");
    const iniFormat = (this.iniFormat = basic?.getNumber("NewINIFormat") ?? 0);
    this.scenarioScripts = new Map();
    this.scenarioTaskForces = new Map();
    this.scenarioTeams = new Map();
    this.scenarioAiTriggers = new Map();
    this.readTiles();
    this.readWaypoints(this.getOrCreateSection("Waypoints"));
    this.readZones(this.getOrCreateSection("Zone"));
    this.readStructures(this.getOrCreateSection("Structures"));
    this.readVehicles();
    this.readInfantries();
    this.readAircrafts();
    this.readTerrains(this.getOrCreateSection("Terrain"));
    this.readOverlays();
    this.readSmudges();
    this.readLighting();
    this.readTagsAndTriggers();
    this.readScenarioTeams();
    this.readCellTags(iniFormat);
    this.readVariableNames();
    this.startingLocations = this.readStartingLocations(this.waypoints);
    this.specialFlags = new SpecialFlags().read(this.getOrCreateSection("SpecialFlags"));
    return this;
  }

  /** 从 JSON 载入时剥离 ART 前缀段到 artOverrides。 */
  fromJson(json: any): this {
    if (json[MapFile.artSectionPrefix]) {
      const { [MapFile.artSectionPrefix]: art, ...rest } = json;
      this.artOverrides = new IniFile(art);
      json = rest;
    }
    return super.fromJson(json);
  }

  /** waypoint 编号 &lt;8 的按序号排序后投影为出生坐标。 */
  readStartingLocations(wps: Waypoint[]): { x: number; y: number }[] {
    const out: { x: number; y: number }[] = [];
    for (const w of wps
      .filter((w) => w.number < 8)
      .sort((a, b) => (a.number < b.number ? -1 : 1))) {
      out.push({ x: w.rx, y: w.ry });
    }
    return out;
  }

  /** 读主光照与离子光照（后者强制 forceTint）。 */
  readLighting(): void {
    const section = this.getOrCreateSection("Lighting");
    this.lighting = new MapLighting().read(section);
    this.ionLighting = new MapLighting().read(section, "Ion");
    this.ionLighting.forceTint = true;
  }

  /** 解析 Tags + Triggers/Events/Actions 并回填未实现集合。 */
  readTagsAndTriggers(): void {
    this.tags = new TagsReader().read(this.getOrCreateSection("Tags"));
    const triggerSection = this.getOrCreateSection("Triggers");
    const eventSection = this.getOrCreateSection("Events");
    const actionSection = this.getOrCreateSection("Actions");
    const result = new TriggerReader().read(triggerSection, eventSection, actionSection, this.tags);
    this.triggers = result.triggers;
    this.unknownEventTypes = result.unknownEventTypes;
    this.unknownActionTypes = result.unknownActionTypes;
    this.unimplementedEventTypes = result.unimplementedEventTypes ?? new Set();
    this.unimplementedActionTypes = result.unimplementedActionTypes ?? new Set();
  }

  /** 解析场景内嵌 ScriptTypes/TaskForces/TeamTypes/AITriggerTypes。 */
  readScenarioTeams(): void {
    // 参考临时源码 readScenarioTeams：把地图内嵌的 ScriptTypes/TaskForces/TeamTypes/
    // AITriggerTypes 解析成场景运行时可直接使用的结构。
    this.scenarioScripts.clear();
    this.scenarioTaskForces.clear();
    this.scenarioTeams.clear();
    this.scenarioAiTriggers.clear();
    for (const [index, id] of this.readListedSectionIds("ScriptTypes").entries()) {
      const sc = this.getSection(id);
      if (!sc) continue;
      const actions: { type: number; parameter: number }[] = [];
      for (const raw of this.readNumericEntries(sc)) {
        const [typeStr, paramStr] = raw.split(",").map(Number);
        if (!Number.isFinite(typeStr)) continue;
        actions.push({ type: typeStr, parameter: Number.isFinite(paramStr) ? paramStr : 0 });
      }
      this.scenarioScripts.set(id, { id, index, actions });
    }
    for (const [index, id] of this.readListedSectionIds("TaskForces").entries()) {
      const tf = this.getSection(id);
      if (!tf) continue;
      const entries: { count: number; objectName: string }[] = [];
      for (const raw of this.readNumericEntries(tf)) {
        const [countStr, namePart] = raw.split(",");
        const count = Number(countStr);
        if (Number.isFinite(count) && namePart) entries.push({ count, objectName: String(namePart).trim() });
      }
      this.scenarioTaskForces.set(id, { id, index, entries });
    }
    for (const [index, id] of this.readListedSectionIds("TeamTypes").entries()) {
      const tm = this.getSection(id);
      if (!tm) continue;
      const wp = tm.getString("Waypoint", "").trim();
      const twp = tm.getString("TransportWaypoint", "").trim();
      this.scenarioTeams.set(id, {
        id,
        index,
        houseName: tm.getString("House", "").trim(),
        scriptId: tm.getString("Script", "").trim(),
        taskForceId: tm.getString("TaskForce", "").trim(),
        tagId: this.readTagId(tm.getString("Tag", "None")),
        waypoint: wp ? this.readAlphabeticIndex(wp) : undefined,
        transportWaypoint: twp ? this.readAlphabeticIndex(twp) : undefined,
        veteranLevel: Math.max(0, tm.getNumber("VeteranLevel", 0) - 1),
        aggressive: tm.getBool("Aggressive", false),
        annoyance: tm.getBool("Annoyance", false),
        autocreate: tm.getBool("Autocreate", false),
        droppod: tm.getBool("Droppod", false),
        full: tm.getBool("Full", false),
        group: tm.getNumber("Group", -1),
        guardSlower: tm.getBool("GuardSlower", false),
        loadable: tm.getBool("Loadable", false),
        looseRecruit: tm.getBool("LooseRecruit", false),
        max: tm.getNumber("Max", 0),
        onTransOnly: tm.getBool("OnTransOnly", false),
        prebuild: tm.getBool("Prebuild", false),
        priority: tm.getNumber("Priority", 5),
        recruiter: tm.getBool("Recruiter", false),
        reinforce: tm.getBool("Reinforce", false),
        suicide: tm.getBool("Suicide", false),
        techLevel: tm.getNumber("TechLevel", -1),
        transportsReturnOnUnload: tm.getBool("TransportsReturnOnUnload", false),
        useTransportOrigin: tm.getBool("UseTransportOrigin", false),
        areTeamMembersRecruitable: tm.getBool("AreTeamMembersRecruitable", true),
        onlyTargetHouseEnemy: tm.getBool("OnlyTargetHouseEnemy", false),
      });
    }
    const at = this.getSection("AITriggerTypes");
    const en = this.getSection("AITriggerTypesEnable");
    for (const [id, raw] of at?.entries ?? []) {
      if (typeof raw !== "string") continue;
      const enableVal = en?.entries.get(id);
      const enabled = typeof enableVal === "string" && /^(?:yes|true|1)$/i.test(enableVal);
      this.scenarioAiTriggers.set(id, { id, raw, enabled });
    }
  }

  /** 读取某列表段中的 section id 列表（键为数字的条目值）。 */
  readListedSectionIds(sectionName: string): string[] {
    const sec = this.getSection(sectionName);
    return sec ? this.readNumericEntries(sec) : [];
  }

  /** 过滤键为数字的条目并按数值键排序，返回值列表。 */
  readNumericEntries(section: any): string[] {
    return [...section.entries]
      .filter(([k, v]) => Number.isFinite(Number(k)) && typeof v === "string")
      .sort(([a], [b]) => Number(a) - Number(b))
      .map(([, v]) => v);
  }

  /** AZ 字母串 → 0 基索引（A=0, B=1, …）。 */
  readAlphabeticIndex(s: string): number {
    return s.toUpperCase().split("").reduce((acc, ch) => acc * 26 + ch.charCodeAt(0) - 65 + 1, 0) - 1;
  }

  /** 解析 [CellTags]。 */
  readCellTags(iniFormat: number): void {
    this.cellTags = new CellTagsReader().read(this.getOrCreateSection("CellTags"), iniFormat);
  }

  /** 解析 [VariableNames] 编号 → Variable。 */
  readVariableNames(): void {
    const section = this.getOrCreateSection("VariableNames");
    const map = new Map<number, any>();
    for (const [key, value] of section.entries) {
      const idx = Number(key);
      if (Number.isNaN(idx)) {
        console.warn(`Map [VariableNames] contains non-numeric index "${key}". Skipping.`);
      } else {
        const [name, flag] = String(value).split(",");
        // 孪生: new Variable(name, Boolean(Number(flag)))；Variable 本组已转换为 (string,string)
        // 为保持 MapFile 语义，以 any 调用接受第二参布尔（运行时与孪生一致）
        map.set(idx, new Variable(name, Boolean(Number(flag)) as any));
      }
    }
    this.variables = map;
  }

  /** 解码 IsoMapPack5 → tiles（含缺省 tile 回填）。 */
  readTiles(): void {
    const section = this.getSection("IsoMapPack5");
    if (!section) throw new Error("[IsoMapPack5] section not found");
    const compressed = base64StringToUint8Array(section.getConcatenatedValues());
    const cellCount = (2 * this.fullSize.width - 1) * this.fullSize.height;
    const buffer = new Uint8Array(11 * cellCount + 4);
    Format5.decodeInto(compressed, buffer);
    const stream = new DataStream(buffer.buffer);
    const rowWidth = 2 * this.fullSize.width - 1;
    const height = this.fullSize.height;
    const index = (x: number, y: number) => y * rowWidth + x;
    this.tiles = new Array(rowWidth * height);
    this.maxTileNum = 0;
    for (let i = 0; i < cellCount; i++) {
      const rx = stream.readUint16();
      const ry = stream.readUint16();
      const tileNum = Math.max(0, stream.readInt16());
      this.maxTileNum = Math.max(this.maxTileNum, tileNum);
      stream.readInt16();
      const subTile = stream.readUint8();
      const z = stream.readUint8();
      stream.readUint8();
      const dx = rx - ry + this.fullSize.width - 1;
      const dy = rx + ry - this.fullSize.width - 1;
      if (dx >= 0 && dx < 2 * this.fullSize.width && dy >= 0 && dy < 2 * this.fullSize.height) {
        this.tiles[index(dx, Math.floor(dy / 2))] = { dx, dy, rx, ry, z, tileNum, subTile };
      }
    }
    // 回填缺失 tile（从等距坐标反算 rx/ry）
    for (let y = 0; y < this.fullSize.height; y++) {
      for (let x = 0; x <= 2 * this.fullSize.width - 2; x++) {
        if (!this.tiles[index(x, y)]) {
          const dy = 2 * y + (x % 2);
          const rx = (x + dy) / 2 + 1;
          const ry = dy - rx + this.fullSize.width + 1;
          this.tiles[index(x, y)] = { dx: x, dy, rx, ry, z: 0, tileNum: 0, subTile: 0 };
        }
      }
    }
  }

  /** 解析 [Waypoints]：值 = ry*1000+rx。 */
  readWaypoints(section: any): void {
    this.waypoints = [];
    for (const [key, value] of section.entries) {
      const number = parseInt(key, 10);
      const encoded = parseInt(value, 10);
      if (isNaN(number) || isNaN(encoded)) continue;
      const ry = Math.floor(encoded / 1e3);
      const rx = encoded - 1e3 * ry;
      this.waypoints.push({ number, rx, ry });
    }
  }

  /** 解析 [Zone]：每项 "N=X1,Y1,X2,Y2" 归一化为矩形。 */
  readZones(section: any): void {
    // [Zone] 节：触发器区域，每项格式 "N=X1,Y1,X2,Y2"（单元格坐标）。
    // 引擎按矩形 (minX,minY)-(maxX,maxY) 归一化，供 EnemyInZone 等事件判定。
    this.zones = [];
    for (const [key, value] of section.entries) {
      const parts = value.split(",");
      if (parts.length < 4) {
        console.warn(`Map [Zone] contains invalid entry "${key}=${value}". Skipping.`);
        continue;
      }
      const nums = [Number(parts[0]), Number(parts[1]), Number(parts[2]), Number(parts[3])];
      if (nums.some((n) => Number.isNaN(n))) {
        console.warn(`Map [Zone] contains invalid entry "${key}=${value}". Skipping.`);
        continue;
      }
      const idx = Number(key);
      this.zones.push({
        index: Number.isNaN(idx) ? this.zones.length : idx,
        minX: Math.min(nums[0], nums[2]),
        minY: Math.min(nums[1], nums[3]),
        maxX: Math.max(nums[0], nums[2]),
        maxY: Math.max(nums[1], nums[3]),
      });
    }
  }

  /** 解析 [Structures]（字段数须 &gt;15）。 */
  readStructures(section: any): void {
    this.structures = [];
    for (const [, value] of section.entries) {
      const parts = value.split(",");
      if (parts.length <= 15) continue;
      const s = new MapObjects.Structure();
      s.owner = parts[0];
      s.name = parts[1];
      s.health = Number(parts[2]);
      s.rx = Number(parts[3]);
      s.ry = Number(parts[4]);
      s.tag = this.readTagId(parts[6]);
      s.poweredOn = Boolean(Number(parts[9]));
      this.structures.push(s);
    }
  }

  /** "none" → undefined，否则原样（tag id）。 */
  readTagId(value: string): string | undefined {
    return "none" !== value.toLowerCase() ? value : undefined;
  }

  /** 解析 [Units]（字段数须 &gt;11）。 */
  readVehicles(): void {
    this.vehicles = [];
    const section = this.getSection("Units");
    if (!section) return;
    for (const value of section.entries.values()) {
      const parts = String(value).split(",");
      if (parts.length <= 11) {
        console.warn(`Invalid Vehicle entry: "${value}"`);
        continue;
      }
      const v = new MapObjects.Vehicle();
      v.owner = parts[0];
      v.name = parts[1];
      v.health = Number(parts[2]);
      v.rx = Number(parts[3]);
      v.ry = Number(parts[4]);
      v.direction = Number(parts[5]);
      v.mission = parts[6] || "";
      v.tag = this.readTagId(parts[7]);
      v.veterancy = Number(parts[8]);
      v.onBridge = "1" === parts[10];
      this.vehicles.push(v);
    }
  }

  /** 解析 [Infantry]（字段数须 &gt;8）。 */
  readInfantries(): void {
    this.infantries = [];
    const section = this.getSection("Infantry");
    if (!section) return;
    for (const value of section.entries.values()) {
      const parts = String(value).split(",");
      if (parts.length <= 8) {
        console.warn(`Invalid Infantry entry: "${value}"`);
        continue;
      }
      const inf = new MapObjects.Infantry();
      inf.owner = parts[0];
      inf.name = parts[1];
      inf.health = Number(parts[2]);
      inf.rx = Number(parts[3]);
      inf.ry = Number(parts[4]);
      inf.subCell = Number(parts[5]);
      inf.mission = parts[6] || "";
      inf.direction = Number(parts[7]);
      inf.tag = this.readTagId(parts[8]);
      inf.veterancy = Number(parts[9]);
      inf.onBridge = "1" === parts[11];
      this.infantries.push(inf);
    }
  }

  /** 解析 [Aircraft]（onBridge 取倒数第 4 列）。 */
  readAircrafts(): void {
    this.aircrafts = [];
    const section = this.getSection("Aircraft");
    if (!section) return;
    for (const value of section.entries.values()) {
      const parts = String(value).split(",");
      const ac = new MapObjects.Aircraft();
      ac.owner = parts[0];
      ac.name = parts[1];
      ac.health = Number(parts[2]);
      ac.rx = Number(parts[3]);
      ac.ry = Number(parts[4]);
      ac.direction = Number(parts[5]);
      ac.mission = parts[6] || "";
      ac.tag = this.readTagId(parts[7]);
      ac.veterancy = Number(parts[8]);
      ac.onBridge = "1" === parts[parts.length - 4];
      this.aircrafts.push(ac);
    }
  }

  /** 解析 [Terrain]：键为 rx+ry*1000。 */
  readTerrains(section: any): void {
    this.terrains = [];
    for (const [key, value] of section.entries) {
      const encoded = Number(key);
      if (!isNaN(encoded)) {
        const t = new MapObjects.Terrain();
        t.name = value;
        t.rx = encoded % 1e3;
        t.ry = Math.floor(encoded / 1e3);
        this.terrains.push(t);
      }
    }
  }

  /** 解码 OverlayPack/OverlayDataPack → overlays。 */
  readOverlays(): void {
    this.overlays = [];
    this.maxOverlayId = 0;
    const packSection = this.getSection("OverlayPack");
    if (!packSection) {
      console.warn("[Overlay] section not found. Skipping.");
      return;
    }
    const packBytes = base64StringToUint8Array(packSection.getConcatenatedValues());
    const pack = new Uint8Array(1 << 18);
    Format5.decodeInto(packBytes, pack, 80);
    const dataSection = this.getSection("OverlayDataPack");
    if (!dataSection) {
      console.warn("[OverlayDataPack] section not found. Skipping.");
      return;
    }
    const dataBytes = base64StringToUint8Array(dataSection.getConcatenatedValues());
    const data = new Uint8Array(1 << 18);
    Format5.decodeInto(dataBytes, data, 80);
    for (let y = 0; y < this.fullSize.height; y++) {
      for (let x = 2 * this.fullSize.width - 2; x >= 0; x--) {
        const dy = 2 * y + (x % 2);
        const rx = (x + dy) / 2 + 1;
        const ry = dy - rx + this.fullSize.width + 1;
        const cell = rx + 512 * ry;
        const id = pack[cell];
        if (id === 255) continue;
        const value = data[cell];
        const o = new MapObjects.Overlay();
        o.id = id;
        o.value = value;
        o.rx = rx;
        o.ry = ry;
        this.overlays.push(o);
        this.maxOverlayId = Math.max(this.maxOverlayId, id);
      }
    }
  }

  /** 解析 [Smudge]（字段数须 &gt;2）。 */
  readSmudges(): void {
    this.smudges = [];
    const section = this.getSection("Smudge");
    if (!section) return;
    for (const value of section.entries.values()) {
      const parts = String(value).split(",");
      if (parts.length <= 2) {
        console.warn(`Invalid Smudge entry: "${value}"`);
        continue;
      }
      const s = new MapObjects.Smudge();
      s.name = parts[0];
      s.rx = Number(parts[1]);
      s.ry = Number(parts[2]);
      this.smudges.push(s);
    }
  }

  /** 解码 PreviewPack → RgbBitmap（无段则 undefined）。 */
  decodePreviewImage(): RgbBitmap | undefined {
    const sizeSection = this.getSection("Preview");
    const packSection = this.getSection("PreviewPack");
    if (sizeSection && packSection) {
      const [, , width, height] = sizeSection.getArray("Size").map((v) => Number(v));
      const bytes = base64StringToUint8Array(packSection.getConcatenatedValues());
      const bitmap = new RgbBitmap(width, height);
      Format5.decodeInto(bytes, bitmap.data);
      return bitmap;
    }
    return undefined;
  }

  /** 解析 [Houses] 阵营表（含国家/颜色/控制方式推断）。 */
  getHouses(): HouseEntry[] {
    // RA2/YR 单人任务地图 [Houses] 阵营表。国家/颜色/结盟等属性来自每个阵营的
    // 独立 section（[Player House] 内的 Country=/Color=/IQ=/Credits=/TechLevel=/Allies=），
    // [Houses] 行本身通常是纯阵营名（0=Player House）。
    const result: HouseEntry[] = [];
    const sec = this.getSection("Houses");
    if (!sec) {
      console.warn("[OpenYRWeb] Map has no [Houses] section.");
      return result;
    }
    // [Basic] Player= 标识人类阵营（无匹配时取第一个阵营）
    const humanName = (this.getSection("Basic")?.getString("Player", "") ?? "").trim().toLowerCase();
    // [Countries] 段: CountryName=HouseName → house -> country（部分地图用此格式）
    const houseCountry = new Map<string, string>();
    const csec = this.getSection("Countries");
    if (csec) {
      console.info(
        "[OpenYRWeb] [Countries] section:",
        [...csec.entries].map(([c, h]) => `${c}=${h}`).join(", ") || "(empty)",
      );
      for (const [countryName, houseName] of csec.entries) {
        const hn = String(houseName).trim();
        if (hn && !houseCountry.has(hn.toLowerCase())) houseCountry.set(hn.toLowerCase(), String(countryName).trim());
      }
    } else console.warn("[OpenYRWeb] Map has no [Countries] section.");
    // 大小写不敏感取 section
    const findSection = (name: string) => {
      const s = this.getSection(name);
      if (s) return s;
      const lower = name.toLowerCase();
      return this.getOrderedSections().find((sec) => sec.name.toLowerCase() === lower);
    };
    console.info(
      "[OpenYRWeb] Raw [Houses]:",
      [...sec.entries].map(([k, v]) => `${k}=${v}`).join(", ") || "(empty)",
    );
    let idx = 0;
    let humanAssigned = false;
    for (const [key, value] of sec.entries) {
      if (!/^\d+$/.test(key)) continue;
      const parts = String(value).split(",");
      const name = (parts[0] || "").trim();
      if (!name) continue;
      const psec = findSection(name);
      let country = psec ? psec.getString("Country", "").trim() : "";
      const baseName = name.replace(/\s+House$/i, "").trim().toLowerCase();
      if (!country) {
        // [Countries] 是显式映射（Country=House），优先使用；
        // [Houses] 第二列常见是阵营别名（如 Player/BadGuy1），不是国家代码，不能直接当 Country 用。
        const second = (parts[1] || "").trim();
        country =
          houseCountry.get(name.toLowerCase()) ||
          (second && second.toLowerCase() !== baseName ? second : "") ||
          "";
      }
      const countryLower = country.toLowerCase();
      const color = psec ? psec.getString("Color", "LightGrey").trim() : "";
      const iq = psec ? psec.getNumber("IQ", 0) : 0;
      const edge = psec ? psec.getString("Edge", "").trim() : "";
      const credits = psec ? psec.getNumber("Credits", 0) : 0;
      const techLevel = psec ? psec.getNumber("TechLevel", 0) : 0;
      const playerControl = psec ? psec.getBool("PlayerControl", false) : false;
      const allies = psec ? psec.getArray("Allies", /,\s*/, []) : [];
      const base = name.replace(/\s+House$/i, "").toLowerCase();
      const isHuman =
        !humanAssigned && (idx === 0 || (humanName && (humanName === name.toLowerCase() || humanName === base)));
      if (isHuman) humanAssigned = true;
      let control: string;
      if (parts[7]) control = (parts[7] || "").trim().toLowerCase();
      else if (isHuman) control = "human";
      else if (/civie|civilian|dummy|neutral/i.test(name) || "civilian" === countryLower || "neutral" === countryLower)
        control = "civilian";
      else control = "computer";
      result.push({ name, country, color, iq, edge, credits, techLevel, playerControl, allies, control });
      idx++;
    }
    console.info(
      `[OpenYRWeb] Parsed [Houses]:`,
      result
        .map((h) => `${h.name}(country=${h.country},color=${h.color},control=${h.control},allies=${h.allies.join("|")})`)
        .join(", ") || "(none)",
    );
    return result;
  }

  /** 提取地图内 AI 段为独立 IniFile（无则 undefined）。 */
  getAiIni(): IniFile | undefined {
    // 提取地图定义的 AI 数据（TaskForces/ScriptTypes/TeamTypes/AITriggerTypes 等），
    // 供战役敌方 AI 使用。格式与 aimd.ini 一致（AiData 可直接解析）。
    // 地图无 AI 段时返回 undefined（回退到 aimd.ini）。
    const out = new IniFile();
    const aiSections = [
      "TaskForces",
      "ScriptTypes",
      "TeamTypes",
      "AITriggerTypes",
      "AIDefenseTypes",
      "BuildQueue",
      "BuildQueueGroup",
    ];
    let added = false;
    for (const secName of aiSections) {
      const src = this.getSection(secName);
      if (!src) continue;
      const dst = out.getOrCreateSection(secName);
      for (const [k, v] of src.entries) dst.set(k, v);
      // 复制引用的子段（如 [TeamType名]、[TaskForce名]、[Script名] 的定义段）
      for (const v of src.entries.values()) {
        const childName = String(v).trim();
        if (!childName) continue;
        const child = this.getSection(childName);
        if (child) {
          const cd = out.getOrCreateSection(childName);
          for (const [k2, v2] of child.entries) cd.set(k2, v2);
        }
      }
      added = true;
    }
    return added ? out : undefined;
  }
}
