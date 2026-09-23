/**
 * Art — art.ini 美术规则聚合：按对象类型缓存 ObjectArt，并支持地图 Image 覆盖。
 *
 * 构造时 parse() 扫描 rules 中全部对象规则与动画名，按 imageName/段名读取
 * art.ini 段；步兵/车辆/飞行器若地图文件带 Image=，则合并地图段覆盖 art 段。
 * getObject 未命中时回落到空段构造的默认 ObjectArt，并 debug 记日志。
 *
 * 由 game/art/Art.ts.js 重写为 TS（行为完全一致）。两个文件并存期间，
 * 本文件才是修改目标：tools/repack.mjs 打包时优先采用 .ts 模块的编译产物。
 */
import { ObjectArt } from "game/art/ObjectArt"; // 已转换
import { ObjectType } from "engine/type/ObjectType"; // 已转换
import { ObjectRules } from "game/rules/ObjectRules"; // 已转换
import { IniSection } from "data/IniSection"; // 已转换

/* eslint-disable @typescript-eslint/no-explicit-any */

/** art.ini 聚合门面。 */
export class Art {
  rules: any;
  artIni: any;
  mapFile: any;
  logger: any;
  /** ObjectType → (imageName → ObjectArt) */
  objectArt: Map<any, Map<any, any>>;

  constructor(rules: any, artIni: any, mapFile: any, logger: any) {
    this.rules = rules;
    this.artIni = artIni;
    this.mapFile = mapFile;
    this.logger = logger;
    this.objectArt = new Map();
    this.parse();
  }

  /** 该类型下是否已有 name 的美术条目。 */
  hasObject(name: any, type: any): any {
    return this.objectArt.get(type)?.has(name);
  }

  /**
   * 取对象美术；未缓存时构造默认（rules 有则用其段，否则空 ObjectRules）。
   * @param name - 对象/段名
   * @param type - ObjectType
   */
  getObject(name: any, type: any): any {
    if (!name) throw new Error(`Must specify an art name for type "${ObjectType[type]}"`);
    const hit = this.objectArt.get(type)?.get(name);
    if (hit) return hit;
    this.logger?.debug(`Missing art for object "${name}"`);
    return new ObjectArt(
      type,
      this.rules.hasObject(name, type)
        ? this.rules.getObject(name, type)
        : new ObjectRules(type, new IniSection(name)),
      this.artIni.getSection(name) || new IniSection(name),
    );
  }

  /** 按 Animation 类型取美术。 */
  getAnimation(name: any): any {
    return this.getObject(name, ObjectType.Animation);
  }

  /**
   * 取弹丸美术：按 rules 弹丸的 imageName 读 art 段，缺失则空段 + factory。
   */
  getProjectile(name: any): any {
    const rulesObj = this.rules.getProjectile(name);
    const imageName = rulesObj.imageName;
    let section = this.artIni.getSection(imageName);
    if (!section) {
      this.logger?.debug(
        `Image ${imageName} (Projectile: ${name}) has no section in art.ini`,
      );
      section = new IniSection(imageName);
    }
    return ObjectArt.factory(rulesObj.type, rulesObj, this.artIni, section);
  }

  /** 取出 art.ini 本体。 */
  getIni(): any {
    return this.artIni;
  }

  /** 全量解析：对象规则各类型 + 动画名列表。 */
  parse(): void {
    this.rules.allObjectRules.forEach((byType: any, type: any) => {
      const bucket = new Map();
      this.objectArt.set(type, bucket);
      byType.forEach((rulesObj: any) => {
        let section = this.artIni.getSection(rulesObj.imageName);
        const mapSection = this.artIni.getSection(rulesObj.name);
        section = this.applyUnitMapOverrides(
          rulesObj,
          this.mapFile,
          mapSection,
          section,
        );
        if (section) {
          const art = ObjectArt.factory(rulesObj.type, rulesObj, this.artIni, section);
          bucket.set(rulesObj.name, art);
        } else {
          this.logger?.debug(
            `${ObjectType[rulesObj.type]} "${rulesObj.name}" has no art section "${rulesObj.imageName}"`,
          );
        }
      });
    });
    const extras: any[] = [[ObjectType.Animation, this.rules.animationNames]];
    extras.forEach(([type, names]: any) => {
      const bucket = new Map();
      this.objectArt.set(type, bucket);
      names.forEach((animName: any) => {
        const section = this.artIni.getSection(animName);
        if (section) {
          const rulesObj = new ObjectRules(type, new IniSection(animName));
          const art = new ObjectArt(type, rulesObj, section);
          bucket.set(animName, art);
        } else {
          this.logger?.debug(ObjectType[type] + ` "${animName}" has no art section`);
        }
      });
    });
  }

  /**
   * 地图 Image= 覆盖：步兵/车辆/飞行器且地图段含 Image= 时，
   * 以地图段克隆为底再叠 art 段条目（art 优先）。
   */
  applyUnitMapOverrides(rulesObj: any, mapFile: any, mapSection: any, artSection: any): any {
    if (
      [ObjectType.Infantry, ObjectType.Vehicle, ObjectType.Aircraft].includes(rulesObj.type) &&
      !!mapFile?.getSection(rulesObj.name)?.getString("Image") &&
      mapSection
    ) {
      const merged = mapSection.clone();
      artSection?.entries.forEach((value: any, key: any) => {
        merged.set(key, value);
      });
      artSection = merged;
      this.logger?.debug(
        `${ObjectType[rulesObj.type]} "${rulesObj.name}": ` +
          `Using merged art sections ${rulesObj.name} and ` +
          rulesObj.imageName,
      );
    }
    return artSection;
  }
}
