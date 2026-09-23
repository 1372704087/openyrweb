/**
 * CrateGeneratorTrait — 宝箱生成/拾取（edge/allTiles 选点、Powerup 发放）。
 *
 * init 扫地图边可用格；tick 过期 unspawn + randomCrateSpawn 补到 minCrates。
 * grantPowerup 处理 Unit/Money/Heal/Reveal/Darkness/Veteran/Armor/Firepower/
 * Speed/Cloak/ICBM/Invulnerability/Explosion/Napalm/Tiberium，失败回退 Money。
 * UNSUPPORTED_POWERUP_TYPES: IonStorm/Gas/Pod/Squad。
 *
 * 由 game/gameobject/trait/CrateGeneratorTrait.ts.js →
 * game/trait/CrateGeneratorTrait.ts.js 重写为 TS（行为完全一致）。两个文
 * 件并存期间，本文件才是修改目标：tools/repack.mjs 打包时优先采用 .ts 模
 * 块的编译产物。
 *
 * 两个文件并存期间，本文件才是修改目标：tools/repack.mjs 打包时优先采用 .ts 模块的编译产物。
 */
import * as ObjectTypeModule from "engine/type/ObjectType"; // 已转换
import * as TerrainTypeModule from "engine/type/TerrainType"; // 已转换
import * as CratePickupEventModule from "game/event/CratePickupEvent"; // 未转换（any-shim）
import * as RangeHelperModule from "game/gameobject/unit/RangeHelper"; // 未转换（any-shim）
import * as ZoneTypeModule from "game/gameobject/unit/ZoneType"; // 未转换（any-shim）
import * as gameoptsConstantsModule from "game/gameopts/constants"; // 未转换（any-shim）
import * as GameSpeedModule from "game/GameSpeed"; // 已转换
import * as RadialTileFinderModule from "game/map/tileFinder/RadialTileFinder"; // 未转换（any-shim）
import * as RadialBackFirstTileFinderModule from "game/map/tileFinder/RadialBackFirstTileFinder"; // 未转换（any-shim）
import * as PowerupTypeModule from "game/type/PowerupType"; // 未转换（any-shim）
import * as SpeedTypeModule from "game/type/SpeedType"; // 已转换
import * as NotifyTickModule from "game/trait/interface/NotifyTick"; // 已转换
import * as SuperWeaponTypeModule from "game/type/SuperWeaponType"; // 已转换
import * as SuperWeaponsTraitModule from "game/trait/SuperWeaponsTrait"; // 已转换
import * as CloakableTraitModule from "game/gameobject/trait/CloakableTrait"; // 未转换（any-shim）
import * as WarheadModule from "game/Warhead"; // 未转换（any-shim）
import * as CollisionTypeModule from "game/gameobject/unit/CollisionType"; // 未转换（any-shim）
import * as RandomTileFinderModule from "game/map/tileFinder/RandomTileFinder"; // 未转换（any-shim）
import * as OreSpreadModule from "game/map/OreSpread"; // 未转换（any-shim）
import * as TiberiumTypeModule from "engine/type/TiberiumType"; // 未转换（any-shim）
import * as TiberiumTraitModule from "game/gameobject/trait/TiberiumTrait"; // 已转换
import * as Vector2Module from "game/math/Vector2"; // 未转换（any-shim）
import * as Box2Module from "game/math/Box2"; // 未转换（any-shim）
import * as SpecialWarheadTypeModule from "game/SpecialWarheadType"; // 未转换（any-shim）

/** 不支持的 Powerup 类型（行为未实现）。 */
export const UNSUPPORTED_POWERUP_TYPES = [
  PowerupTypeModule.PowerupType.IonStorm,
  PowerupTypeModule.PowerupType.Gas,
  PowerupTypeModule.PowerupType.Pod,
  PowerupTypeModule.PowerupType.Squad,
];

/* eslint-disable @typescript-eslint/no-explicit-any */
export class CrateGeneratorTrait {
  /** 是否随机补箱。 */
  randomCrateSpawn: any;
  /** 在场宝箱 {obj, powerup, ticksLeft}。 */
  crates: any[];
  /** 地图边可用格。 */
  availEdgeTiles: any[];
  /** 全部格。 */
  allTiles: any[];
  /** 地图边是否全水。 */
  mapEdgeIsWater: boolean;
  /** 目标最少箱数。 */
  minCrates: number;

  constructor(randomCrateSpawn: any) {
    this.randomCrateSpawn = randomCrateSpawn;
    this.crates = [];
    this.availEdgeTiles = [];
    this.allTiles = [];
  }

  /** 初始化：扫边格、缓存全图、算 minCrates（非 OBS 玩家 × crateMinimum）。 */
  init(world: any) {
    const size = world.map.tiles.getMapSize();
    const tiles = world.map.tiles;
    const edge: any[] = [];
    let waterEdgeCols = 0;
    for (let x = 0; x < size.width; ++x) {
      let first: any;
      let lastLand: any;
      let sawWater = false;
      let colAllWater = false;
      for (let y = 0; y < size.height; ++y) {
        const tile = tiles.getByMapCoords(x, y);
        if (tile && this.canPlaceCrateOnTile(world, tile)) {
          const isWater = world.map.getTileZone(tile) === ZoneTypeModule.ZoneType.Water;
          if (first) {
            if (!isWater) lastLand = tile;
            sawWater = isWater;
          } else if (isWater) {
            sawWater = colAllWater = true;
          } else {
            first = lastLand = tile;
          }
        } else if (first && !tile) {
          break;
        }
      }
      if (first) {
        edge.push(first);
        if (lastLand && lastLand !== first) edge.push(lastLand);
        if (!sawWater || !colAllWater) waterEdgeCols++;
      }
    }
    this.availEdgeTiles = edge;
    this.allTiles = tiles.getAll();
    this.mapEdgeIsWater = waterEdgeCols === 0;
    this.minCrates =
      world.rules.crateRules.crateMinimum *
      world.gameOpts.humanPlayers.filter((p: any) => p.countryId !== gameoptsConstantsModule.OBS_COUNTRY_ID).length;
  }

  /** 每 tick：过期 unspawn/dispose；randomCrateSpawn 时补到 minCrates。 */
  [NotifyTickModule.NotifyTick.onTick](world: any) {
    for (const crate of this.crates) {
      crate.ticksLeft--;
      if (crate.ticksLeft <= 0) {
        world.unspawnObject(crate.obj);
        crate.obj.dispose();
      }
    }
    this.crates = this.crates.filter((c) => c.ticksLeft > 0);
    if (this.randomCrateSpawn) {
      for (
        let i = 0;
        i < this.minCrates - this.crates.length && this.spawnCrateAtRandom(this.allTiles, world);
        i++
      );
    }
  }

  /** 从候选集中随机选点刷随机宝箱。 */
  spawnCrateAtRandom(tiles: any[], world: any) {
    const tile = this.chooseSpawnTile(tiles, world);
    if (tile) return this.spawnRandomCrateAt(tile, world, 0, true);
  }

  /** 选 Powerup 后在指定点刷箱；不可放则径向找附近格。 */
  spawnRandomCrateAt(tile: any, world: any, radius = 0, regen = false) {
    if (!this.canPlaceCrateOnTile(world, tile) && radius > 0) {
      tile =
        new RadialBackFirstTileFinderModule.RadialBackFirstTileFinder(
          world.map.tiles,
          world.map.mapBounds,
          tile,
          { width: 1, height: 1 },
          1,
          radius,
          (t: any) => this.canPlaceCrateOnTile(world, t),
        ).getNextTile() ??
        tile;
    }
    if (this.canPlaceCrateOnTile(world, tile)) {
      const isWater = world.map.getTileZone(tile, true) === ZoneTypeModule.ZoneType.Water;
      const powerup = this.choosePowerup(isWater, world.rules.powerups.powerups, world);
      if (powerup) return this.spawnCrateAt(tile, powerup, world, radius, regen);
    }
  }

  /**
   * 在 tile 生成 Overlay 箱并登记。
   * @param regen true 时 ticksLeft 按 crateRegen 随机，否则 ∞
   */
  spawnCrateAt(tile: any, powerup: any, world: any, radius = 0, regen = false) {
    if (!this.canPlaceCrateOnTile(world, tile) && radius > 0) {
      tile =
        new RadialBackFirstTileFinderModule.RadialBackFirstTileFinder(
          world.map.tiles,
          world.map.mapBounds,
          tile,
          { width: 1, height: 1 },
          1,
          radius,
          (t: any) => this.canPlaceCrateOnTile(world, t),
        ).getNextTile() ??
        tile;
    }
    if (this.canPlaceCrateOnTile(world, tile)) {
      const isWater = world.map.getTileZone(tile, true) === ZoneTypeModule.ZoneType.Water;
      const crateRules = world.rules.crateRules;
      const imageName = isWater ? crateRules.waterCrateImg : crateRules.crateImg;
      const overlay = world.createObject(ObjectTypeModule.ObjectType.Overlay, imageName);
      overlay.overlayId = world.rules.getOverlayId(imageName);
      overlay.value = 0;
      world.spawnObject(overlay, tile);
      const ticksLeft = regen
        ? 60 * crateRules.crateRegen * GameSpeedModule.GameSpeed.BASE_TICKS_PER_SECOND * (0.5 + 1.5 * world.generateRandom())
        : Number.POSITIVE_INFINITY;
      this.crates.push({ obj: overlay, powerup, ticksLeft });
      return overlay;
    }
  }

  /** 偏向边格选点（边非全水 2/3，全水 1/3）。 */
  chooseSpawnTile(tiles: any[], world: any) {
    let pool = tiles;
    if (world.generateRandom() < (this.mapEdgeIsWater ? 1 / 3 : 2 / 3) && this.availEdgeTiles.length) {
      pool = this.availEdgeTiles;
    }
    return this.chooseRandomTile(pool, world);
  }

  /** 随机试 100 次可放格；失败退回空闲格。 */
  chooseRandomTile(tiles: any[], world: any) {
    let tile: any;
    let tries = 0;
    do {
      tile = tiles[world.generateRandomInt(0, tiles.length - 1)];
      tries++;
    } while (tries < 100 && !this.canPlaceCrateOnTile(world, tile));
    if (tries >= 100) {
      const empty = world.map.tileOccupation.getEmptyTiles();
      if (!empty.length) return;
      tile = empty[world.generateRandomInt(0, empty.length - 1)];
    }
    return tile;
  }

  /** 箱落点：界内、无地面物、两栖可走、非 Shore、无 ramp。 */
  canPlaceCrateOnTile(world: any, tile: any) {
    return (
      world.map.mapBounds.isWithinBounds(tile) &&
      !world.map.getGroundObjectsOnTile(tile).filter((o: any) => !o.isSmudge()).length &&
      world.map.terrain.getPassableSpeed(tile, SpeedTypeModule.SpeedType.Amphibious, false, false) > 0 &&
      tile.terrainType !== TerrainTypeModule.TerrainType.Shore &&
      tile.rampType === 0
    );
  }

  /** 按 probShares 加权选 Powerup；水中仅 waterAllowed。 */
  choosePowerup(isWater: boolean, powerups: any[], world: any) {
    let pool = isWater ? powerups.filter((p) => p.waterAllowed) : powerups;
    if (pool.length) {
      const total = pool.reduce((sum, p) => sum + p.probShares, 0);
      const roll = world.generateRandomInt(0, total);
      let acc = 0;
      for (const powerup of pool) {
        acc += powerup.probShares;
        if (roll < acc) return powerup;
      }
    }
  }

  /** 预览箱内 Powerup 类型。 */
  peekInsideCrate(obj: any) {
    return this.crates.find((c) => c.obj === obj)?.powerup.type;
  }

  /**
   * 拾取：移除箱、发 Powerup、记 cratesPickedUp + 事件；随机模式补刷。
   * @returns 成功发放的 Powerup 类型，失败 undefined
   */
  pickupCrate(unit: any, obj: any, world: any) {
    const crate = this.crates.find((c) => c.obj === obj);
    if (crate) {
      this.crates.splice(this.crates.indexOf(crate), 1);
      world.unspawnObject(crate.obj);
      crate.obj.dispose();
      const granted = this.grantPowerup(unit, crate.powerup, crate.obj.tile, world);
      if (granted !== undefined) {
        unit.owner.cratesPickedUp++;
        const entry = world.rules.powerups.powerups.find((p) => p.type === granted);
        world.events.dispatch(new CratePickupEventModule.CratePickupEvent(entry, unit.owner, unit, crate.obj.tile));
      }
      if (this.randomCrateSpawn) this.spawnCrateAtRandom(this.allTiles, world);
      return granted;
    }
  }

  /**
   * 发放 Powerup 效果；Combatant 才生效。未处理类型告警；
   * 失败且存在正权 Money 时递归回退 Money。
   * @returns 成功的 Powerup 类型，否则（Combatant 外）undefined
   */
  grantPowerup(unit: any, powerup: any, tile: any, world: any) {
    const owner = unit.owner;
    let granted = false;
    if (!owner.isCombatant()) return;
    if (powerup.type === PowerupTypeModule.PowerupType.Unit) {
      let vehicleRules: any;
      // 无建造场且 freeMCV：优先送 baseUnit MCV（够钱买前置才送）。
      if (![...owner.buildings].some((b) => b.rules.constructionYard) && world.rules.crateRules.freeMCV) {
        const baseUnits = world.rules.general.baseUnit;
        const hasAny = owner.getOwnedObjects(true).some((o) => baseUnits.includes(o.name));
        const canAfford =
          owner.credits >=
          [...world.rules.ai.buildPower, ...world.rules.ai.buildRefinery]
            .map((e) => world.rules.getBuilding(e))
            .filter((b) => b.aiBasePlanningSide === owner.country.side)
            .reduce((sum, b) => sum + b.cost, 0);
        if (!hasAny && canAfford) {
          const found = baseUnits.find((name) => {
            const rules = world.rules.getObject(name, ObjectTypeModule.ObjectType.Vehicle);
            return rules.isAvailableTo(owner.country) && rules.hasOwner(owner.country);
          });
          if (!found) throw new Error("No suitable MCV found for player country " + owner.country?.name);
          vehicleRules = world.rules.getObject(found, ObjectTypeModule.ObjectType.Vehicle);
        }
      }
      if (!vehicleRules) {
        let pool: any[] = [];
        const fixed = world.rules.crateRules.unitCrateType;
        if (fixed) {
          if (world.rules.hasObject(fixed, ObjectTypeModule.ObjectType.Vehicle)) {
            pool = [world.rules.getObject(fixed, ObjectTypeModule.ObjectType.Vehicle)];
          }
        } else {
          pool = [...world.rules.vehicleRules.values()].filter(
            (r) => r.crateGoodie && world.map.terrain.getPassableSpeed(tile, r.speedType, false, false) > 0,
          );
        }
        if (pool.length) vehicleRules = pool[world.generateRandomInt(0, pool.length - 1)];
      }
      if (vehicleRules) {
        const spawned = world.createUnitForPlayer(vehicleRules, owner);
        const dest = new RadialTileFinderModule.RadialTileFinder(
          world.map.tiles,
          world.map.mapBounds,
          tile,
          { width: 1, height: 1 },
          0,
          3,
          (t: any) =>
            world.map.terrain.getPassableSpeed(t, spawned.rules.speedType, spawned.isInfantry(), false) > 0 &&
            !world.map.terrain.findObstacles({ tile: t, onBridge: undefined }, spawned).length,
        ).getNextTile();
        if (dest) {
          world.spawnObject(spawned, dest);
          granted = true;
        } else {
          owner.removeOwnedObject(spawned);
          spawned.dispose();
        }
      }
    } else if (powerup.type === PowerupTypeModule.PowerupType.Money) {
      if (!powerup.data) throw new Error("Money powerup missing data field");
      const amount = Math.floor(Number(powerup.data) * (0.55 + 2 * world.generateRandom() * 0.45));
      owner.credits = Math.max(0, owner.credits + amount);
      if (amount > 0) owner.creditsGained += amount;
      granted = true;
    } else if (powerup.type === PowerupTypeModule.PowerupType.HealBase) {
      for (const owned of owner.getOwnedObjects(true)) {
        if (!owned.isDestroyed) owned.healthTrait.healToFull(undefined, world);
      }
      granted = true;
    } else if (powerup.type === PowerupTypeModule.PowerupType.Reveal) {
      world.mapShroudTrait.revealMap(owner, world);
      granted = true;
    } else if (powerup.type === PowerupTypeModule.PowerupType.Darkness) {
      world.mapShroudTrait.resetShroud(owner, world);
      granted = true;
    } else if (powerup.type === PowerupTypeModule.PowerupType.Veteran) {
      if (unit.veteranTrait && !unit.veteranTrait.isMaxLevel()) {
        granted = true;
        const levels = Number(powerup.data);
        for (const u of this.getUnitsInCrateRadius(world, tile)) u.veteranTrait?.promote(levels, world);
      }
    } else if (powerup.type === PowerupTypeModule.PowerupType.Armor) {
      if (unit.crateBonuses.armor === 1) {
        granted = true;
        const value = Number(powerup.data);
        for (const u of this.getUnitsInCrateRadius(world, tile)) {
          if (u.crateBonuses.armor === 1) u.crateBonuses.armor = value;
        }
      }
    } else if (powerup.type === PowerupTypeModule.PowerupType.Firepower) {
      if (unit.crateBonuses.firepower === 1) {
        granted = true;
        const value = Number(powerup.data);
        for (const u of this.getUnitsInCrateRadius(world, tile)) {
          if (u.crateBonuses.firepower === 1) u.crateBonuses.firepower = value;
        }
      }
    } else if (powerup.type === PowerupTypeModule.PowerupType.Speed) {
      if (unit.crateBonuses.speed === 1) {
        granted = true;
        const value = Number(powerup.data);
        for (const u of this.getUnitsInCrateRadius(world, tile)) {
          if (u.crateBonuses.speed === 1) u.crateBonuses.speed = value;
        }
      }
    } else if (powerup.type === PowerupTypeModule.PowerupType.Cloak) {
      if (!unit.cloakableTrait) {
        granted = true;
        for (const u of this.getUnitsInCrateRadius(world, tile)) {
          if (!u.cloakableTrait) {
            u.cloakableTrait = new CloakableTraitModule.CloakableTrait(u, world.rules.general.cloakDelay);
            world.addObjectTrait(u, u.cloakableTrait);
          }
        }
      }
    } else if (powerup.type === PowerupTypeModule.PowerupType.ICBM) {
      const swRules = [...world.rules.superWeaponRules.values()].find(
        (r) => r.type === SuperWeaponTypeModule.SuperWeaponType.MultiMissile,
      );
      if (swRules && owner.superWeaponsTrait && !owner.superWeaponsTrait.has(swRules.name)) {
        const sw = world.createSuperWeapon(swRules.name, owner, true);
        sw.isGift = true;
        owner.superWeaponsTrait.add(sw);
        granted = true;
      }
    } else if (powerup.type === PowerupTypeModule.PowerupType.Invulnerability) {
      const iron = [...world.rules.superWeaponRules.values()].find(
        (r) => r.type === SuperWeaponTypeModule.SuperWeaponType.IronCurtain,
      );
      if (iron) {
        world.traits.get(SuperWeaponsTraitModule.SuperWeaponsTrait).activateEffect(iron, owner, world, tile, undefined, true);
        granted = true;
      }
    } else if (
      powerup.type === PowerupTypeModule.PowerupType.Explosion ||
      powerup.type === PowerupTypeModule.PowerupType.Napalm
    ) {
      granted = true;
      const damage = Number(powerup.data);
      const warheadName =
        powerup.type === PowerupTypeModule.PowerupType.Napalm
          ? world.rules.combatDamage.flameDamage
          : world.rules.combatDamage.c4Warhead;
      const warhead = new WarheadModule.Warhead(world.rules.getWarhead(warheadName));
      warhead.detonate(
        world,
        damage,
        unit.tile,
        unit.tileElevation,
        unit.position.worldPosition,
        unit.zone,
        CollisionTypeModule.CollisionType.None,
        world.createTarget(unit, unit.tile),
        { player: unit.owner, weapon: undefined },
        SpecialWarheadTypeModule.SpecialWarheadType.None,
        undefined,
        0,
      );
    } else if (powerup.type === PowerupTypeModule.PowerupType.Tiberium) {
      const finder = new RandomTileFinderModule.RandomTileFinder(world.map.tiles, world.map.mapBounds, tile, 2, world, (t: any) =>
        TiberiumTraitModule.TiberiumTrait.canBePlacedOn(t, world.map),
      );
      let oreTile: any;
      let i = 0;
      while (i++ < 6 && (oreTile = finder.getNextTile())) {
        const overlayId = OreSpreadModule.OreSpread.calculateOverlayId(TiberiumTypeModule.TiberiumType.Ore, oreTile);
        if (overlayId === undefined) throw new Error("Expected an overlayId");
        const overlay = world.createObject(ObjectTypeModule.ObjectType.Overlay, world.rules.getOverlayName(overlayId));
        overlay.overlayId = overlayId;
        overlay.value = 3;
        world.spawnObject(overlay, oreTile);
        granted = true;
      }
    } else {
      console.warn(`Unhandled powerup type "${PowerupTypeModule.PowerupType[powerup.type]}"`);
      return;
    }
    if (granted) return powerup.type;
    // 失败回退：有正权 Money 则递归。
    const fallback = world.rules.powerups.powerups.find(
      (p) => p.type === PowerupTypeModule.PowerupType.Money && p.probShares > 0,
    );
    if (fallback) return this.grantPowerup(unit, fallback, tile, world);
    return undefined;
  }

  /** 箱半径内可作用单位（crateRadius，含对角距离过滤）。 */
  getUnitsInCrateRadius(world: any, tile: any) {
    const radius = world.rules.crateRules.crateRadius;
    const rangeHelper = new RangeHelperModule.RangeHelper(world.map.tileOccupation);
    return world.map.technosByTile
      .queryRange(
        new Box2Module.Box2()
          .setFromCenterAndSize(new Vector2Module.Vector2(tile.rx, tile.ry), new Vector2Module.Vector2(radius, radius)),
      )
      .filter((u: any) => u.isUnit() && rangeHelper.tileDistance(u, tile) <= radius);
  }
}
