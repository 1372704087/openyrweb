/**
 * AnimTerrainEffect — 动画落点对地形的影响（炸矿 + 生成地面污渍）。
 *
 * 爆炸/动画结束时由世界逻辑调用，做两件事：
 *  - destroyOre：动画带 crater 且格子是泰伯利亚矿 → 按动画名随机/固定
 *    移除若干 bail（S_CLSN* 固定半数上限，否则 1..半数随机），清空后
 *    unspawn 矿垛。
 *  - spawnSmudges：Clear 且无斜坡、在界内、格上无非单位对象 → 若动画
 *    带 crater/scorch，则从 rules.smudgeRules 里筛匹配尺寸/灼烧的污渍
 *    （大污渍需三向邻格齐全），随机取一生成并 spawn。
 *
 * 由 game/gameobject/common/AnimTerrainEffect.ts.js 重写为 TS（行为完全
 * 一致）。两个文件并存期间，本文件才是修改目标：tools/repack.mjs 打包
 * 时优先采用 .ts 模块的编译产物。
 */
import * as ObjectTypeModule from "engine/type/ObjectType"; // 已转换
import * as TileCollectionModule from "game/map/TileCollection"; // 已转换
import * as LandTypeModule from "game/type/LandType"; // 已转换
import * as TiberiumTraitModule from "game/gameobject/trait/TiberiumTrait"; // 已转换

/* eslint-disable @typescript-eslint/no-explicit-any */
export class AnimTerrainEffect {
  /**
   * 炸矿：爆炸动画压掉格上矿垛的若干 bail。
   * @param animName 动画名（用于判断是否 S_CLSN* 固定半数）
   * @param tile 目标格
   * @param world 世界（art/rules/map/unspawnObject/generateRandomInt）
   */
  destroyOre(animName: string, tile: any, world: any): void {
    if (
      tile.landType === LandTypeModule.LandType.Tiberium &&
      // 孪生：hasObject 时 getAnimation，否则 undefined；?.crater 判定
      (world.art.hasObject(animName, ObjectTypeModule.ObjectType.Animation)
        ? world.art.getAnimation(animName)
        : void 0)?.crater
    ) {
      const ore = world.map.getObjectsOnTile(tile).find((o: any) => o.isOverlay() && o.isTiberium());
      if (ore) {
        const half = Math.ceil(TiberiumTraitModule.TiberiumTrait.maxBails / 2);
        const bails = animName.startsWith("S_CLSN") ? half : world.generateRandomInt(1, half);
        const trait = ore.traits.get(TiberiumTraitModule.TiberiumTrait);
        trait.removeBails(bails);
        if (!trait.getBailCount()) world.unspawnObject(ore);
      }
    }
  }

  /**
   * 在动画落点生成地面污渍（弹坑/灼痕）。
   * @param animName 动画名
   * @param tile 目标格
   * @param world 世界（art/rules/map/generateRandomInt/createObject/spawnObject）
   */
  spawnSmudges(animName: string, tile: any, world: any): void {
    if (
      tile.landType === LandTypeModule.LandType.Clear &&
      tile.rampType === 0 &&
      world.map.mapBounds.isWithinBounds(tile) &&
      !world.map.getObjectsOnTile(tile).find((o: any) => !o.isUnit())
    ) {
      const anim = world.art.hasObject(animName, ObjectTypeModule.ObjectType.Animation)
        ? world.art.getAnimation(animName)
        : void 0;
      if (anim?.crater) {
        const size = anim?.forceBigCraters ? 2 : 1;
        const scorch = anim?.scorch;
        // 三向邻格（Bottom/BottomLeft/BottomRight）是否齐全——大污渍需要
        const hasNeighbours = [TileCollectionModule.TileDirection.Bottom,
          TileCollectionModule.TileDirection.BottomLeft,
          TileCollectionModule.TileDirection.BottomRight].every(
          (dir: any) => world.map.tiles.getNeighbourTile(tile, dir),
        );
        let candidates = [...world.rules.smudgeRules.values()].filter(
          (r: any) =>
            ((r.crater && r.width === size && r.height === size) || (scorch && r.burn)) &&
            !((r.width > 1 || r.height > 1) && !hasNeighbours),
        );
        if (candidates.length) {
          const pick = candidates[world.generateRandomInt(0, candidates.length - 1)].name;
          const smudge = world.createObject(ObjectTypeModule.ObjectType.Smudge, pick);
          world.spawnObject(smudge, tile);
        }
      }
    }
  }
}
