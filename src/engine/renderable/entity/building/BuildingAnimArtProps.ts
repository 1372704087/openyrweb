/**
 * BuildingAnimArtProps — 从建筑 Art INI 读取各 AnimationType 对应动画条目。
 *
 * 模块级表 animPropsMap 把 AnimationType 映射到 INI 键名列表；read() 逐键
 * 解析 BuildingAnimData（含 BUILDUP/UNBUILD 克隆与 Shadow/Reverse 默认），
 * getByType/getAll 供渲染侧查询。
 *
 * 由 engine/renderable/entity/building/BuildingAnimArtProps.ts.js 重写为 TS（行为完全一致）。
 * 两个文件并存期间，本文件才是修改目标：tools/repack.mjs 打包时优先采用 .ts 模块的编译产物。
 */
import { AnimationType } from "engine/renderable/entity/building/AnimationType"; // 已转换
import { IniSection } from "data/IniSection"; // 已转换
import { BuildingAnimData } from "engine/renderable/entity/building/BuildingAnimData"; // 已转换
import { ObjectType } from "engine/type/ObjectType"; // 已转换

/* eslint-disable @typescript-eslint/no-explicit-any */

/** AnimationType → Art INI 键名列表。 */
const animPropsMap: Map<number, string[]> = new Map<number, string[]>()
  .set(AnimationType.IDLE, ["IdleAnim", "IdleAnimTwo", "IdleAnimThree", "IdleAnimFour"])
  .set(AnimationType.PRODUCTION, ["ProductionAnim"])
  .set(AnimationType.SUPER, ["SuperAnim", "SuperAnimTwo", "SuperAnimThree", "SuperAnimFour"])
  .set(AnimationType.ACTIVE, ["ActiveAnim", "ActiveAnimTwo", "ActiveAnimThree", "ActiveAnimFour"])
  .set(AnimationType.SPECIAL, ["SpecialAnim", "SpecialAnimTwo", "SpecialAnimThree", "SpecialAnimFour"])
  .set(AnimationType.FACTORY_DEPLOYING, ["DeployingAnim", "UnderDoorAnim"])
  .set(AnimationType.FACTORY_ROOF_DEPLOYING, ["RoofDeployingAnim", "UnderRoofDoorAnim"])
  .set(AnimationType.BUILDUP, ["Buildup"])
  .set(AnimationType.UNBUILD, ["Buildup"]);

/** 建筑动画 art 属性读取器。 */
export class BuildingAnimArtProps {
  /** AnimationType → 动画数据列表。 */
  animsByType: Map<number, BuildingAnimData[]> = new Map();

  /**
   * 从建筑 art 段与 art 解析器读取全部已注册类型的动画。
   * @param section - 建筑 Art IniSection（IdleAnim 等键）
   * @param art - 需 hasObject/getObject(Animation) 查询动画定义
   */
  read(section: any, art: any): void {
    animPropsMap.forEach((keys, type) => {
      const list: BuildingAnimData[] = [];
      keys.forEach((key) => {
        const name = section.getString(key);
        if (name) {
          const data = new BuildingAnimData();
          data.name = name;
          data.type = type;
          let animDef: any;
          let animArt: any;
          if (art.hasObject(name, ObjectType.Animation)) {
            animDef = art.getObject(name, ObjectType.Animation);
            animArt = animDef.art;
          }
          if (type === AnimationType.BUILDUP || type === AnimationType.UNBUILD) {
            animArt = animArt ? animArt.clone() : new IniSection(name);
            if (!animArt.has("Shadow")) animArt.set("Shadow", "yes");
            if (type === AnimationType.UNBUILD) animArt.set("Reverse", "yes");
          } else if (!animArt) throw new Error(`Missing building anim section "${name}"`);
          data.art = animArt;
          // Vanilla defaults: ActiveAnim/IdleAnim pause on low power (Powered=yes required),
          // and remain visible unless PoweredLight=yes. INI can override via *Powered/*PoweredLight.
          data.pauseWhenUnpowered = section.getBool(key + "Powered", true);
          data.showWhenUnpowered = !section.getBool(key + "PoweredLight", false);
          const damagedName = section.getString(key + "Damaged");
          if (damagedName && art.hasObject(damagedName, ObjectType.Animation)) {
            data.damagedArt = art.getObject(damagedName, ObjectType.Animation).art;
          }
          data.offset = { x: section.getNumber(key + "X"), y: section.getNumber(key + "Y") };
          // read *YSort for isometric depth offset (e.g. SpecialAnimYSort=750).
          // Positive YSort shifts the animation later in the draw order (on top),
          // negative shifts it earlier (behind).
          data.ySort = section.getNumber(key + "YSort", 0);
          let image = animArt.getString("Image");
          image = image || name;
          data.image = image;
          if (data.damagedArt) data.damagedImage = data.damagedArt.getString("Image") || damagedName;
          data.flat = key === "UnderDoorAnim" || key === "UnderRoofDoorAnim" || animArt.getBool("Flat");
          if (animDef) {
            data.translucent = animDef.translucent;
            data.translucency = animDef.translucency;
          }
          list.push(data);
        }
      });
      this.animsByType.set(type, list);
    });
  }

  /**
   * 按 AnimationType 取动画列表；类型未注册时抛错。
   * @param type - AnimationType
   */
  getByType(type: number): BuildingAnimData[] {
    if (!this.animsByType.has(type)) {
      throw new Error(`Animation type "${AnimationType[type]}" has no data`);
    }
    return this.animsByType.get(type)!;
  }

  /** 取全部类型 → 列表映射。 */
  getAll(): Map<number, BuildingAnimData[]> {
    return this.animsByType;
  }
}
