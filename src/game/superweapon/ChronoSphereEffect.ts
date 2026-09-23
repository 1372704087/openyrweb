/**
 * ChronoSphereEffect — 超时空传送超武特效。
 *
 * onStart：在源格 3×3 收集可传送单位（有机且非 teleporter 直接摧毁；
 * 已 warpedOut 跳过），登记 (obj, destTile)。
 * onTick：等待 chronoDelay 后把单位传到目标格；目标不可通行时用
 * RadialTileFinder 找替代格，仍失败则在原地摧毁；落点冲突单位被碾碎；
 * 成功传送到机坪时处理 dock 预订；水上落点标 DeathType.Sink。
 *
 * 由 game/superweapon/ChronoSphereEffect.ts.js 重写为 TS（行为完全
 * 一致）。两个文件并存期间，本文件才是修改目标：tools/repack.mjs 打包时
 * 优先采用 .ts 模块的编译产物。
 */
import { DeathType } from "game/gameobject/common/DeathType"; // 已转换
import { StanceType } from "game/gameobject/infantry/StanceType"; // 已转换
import { ZoneType } from "game/gameobject/unit/ZoneType"; // 已转换
import { RadialTileFinder } from "game/map/tileFinder/RadialTileFinder"; // 已转换
import { MovementZone } from "game/type/MovementZone"; // 已转换
import { SpeedType } from "game/type/SpeedType"; // 已转换
import { SuperWeaponEffect } from "game/superweapon/SuperWeaponEffect"; // 已转换

/* eslint-disable @typescript-eslint/no-explicit-any */

/** 待传送登记项。 */
interface PendingTeleport {
  obj: any;
  destTile: any;
}

export class ChronoSphereEffect extends SuperWeaponEffect {
  /** 目标格（构造第三参是源，第四参是目标）。 */
  private tile2: any;
  /** 待传送单位。 */
  private objectsToTeleport: PendingTeleport[];
  /** 传送延迟倒数。 */
  private delayTicks: number;

  constructor(type: any, owner: any, tile: any, destTile: any) {
    super(type, owner, tile);
    this.tile2 = destTile;
    this.objectsToTeleport = [];
    this.delayTicks = 0;
  }

  onStart(world: any): void {
    this.delayTicks = world.rules.general.chronoDelay;
    const tiles = world.map.tiles;
    for (let oy = -1; oy <= 1; oy++) {
      for (let ox = -1; ox <= 1; ox++) {
        const src = tiles.getByMapCoords(this.tile.rx + ox, this.tile.ry + oy);
        if (src) {
          const onBridge = !!src.onBridgeLandType;
          const dest = tiles.getByMapCoords(this.tile2.rx + ox, this.tile2.ry + oy);
          for (const obj of world.map.getGroundObjectsOnTile(src)) {
            if (!obj.isUnit()) continue;
            if (obj.tile !== src) continue;
            if (obj.onBridge !== onBridge) continue;
            if (obj.isInfantry() && obj.stance === StanceType.Paradrop && 2 < obj.tileElevation) {
              continue;
            }
            if (obj.isDisposed) continue;
            if (obj.invulnerableTrait.isActive()) continue;
            if ((obj.rules.organic && !obj.rules.teleporter) || !dest) {
              world.destroyObject(obj, { player: this.owner });
            } else if (!obj.warpedOutTrait.isActive()) {
              obj.warpedOutTrait.setActive(true, true, world);
              this.objectsToTeleport.push({ obj, destTile: dest });
            }
          }
        }
      }
    }
  }

  onTick(world: any): boolean {
    if (0 < this.delayTicks && this.delayTicks--, this.delayTicks) return false;
    for (const { obj, destTile } of this.objectsToTeleport) {
      if (obj.isSpawned) {
        let movedOntoDock = false;
        let dest: any = destTile;
        let bridge: any = dest ? world.map.tileOccupation.getBridgeOnTile(dest) : void 0;
        let occupants = world.map.getGroundObjectsOnTile(dest);
        const helipad = occupants.find((o: any) => o.isBuilding());
        const hasPadAircraftOnDest = occupants.some((o: any) =>
          world.rules.general.padAircraft.includes(o.name),
        );
        const isPadDockLanding =
          world.rules.general.padAircraft.includes(obj.name) &&
          !!helipad?.helipadTrait &&
          !!helipad.dockTrait?.getAllDockTiles().includes(dest) &&
          !helipad.dockTrait.hasReservedDockAt(helipad.dockTrait.getDockNumberByTile(dest)) &&
          helipad.owner === obj.owner;
        let destroyedHere = false;
        let speedType = obj.rules.speedType;
        const isInf = obj.isInfantry();
        if (obj.rules.movementZone === MovementZone.Fly) speedType = SpeedType.Wheel;
        let inBounds = world.map.mapBounds.isWithinBounds(dest);
        if (!(isPadDockLanding || (world.map.terrain.getPassableSpeed(dest, speedType, isInf, !!bridge) && inBounds))) {
          let relocated = false;
          if (
            !hasPadAircraftOnDest &&
            (0 < world.map.terrain.getPassableSpeed(dest, speedType, isInf, !!bridge, undefined, true) ||
              !inBounds)
          ) {
            if (helipad) movedOntoDock = true;
            const search = new RadialTileFinder(
              world.map.tiles,
              world.map.mapBounds,
              dest,
              { width: 1, height: 1 },
              1,
              15,
              (t: any) =>
                0 < world.map.terrain.getPassableSpeed(t, speedType, isInf, !!t.onBridgeLandType) &&
                !world.map.terrain
                  .findObstacles({ tile: t, onBridge: !!t.onBridgeLandType }, obj).length,
            );
            const next = search.getNextTile();
            if (next) {
              dest = next;
              bridge = world.map.tileOccupation.getBridgeOnTile(dest);
              occupants = world.map.getGroundObjectsOnTile(dest);
              relocated = true;
            }
          }
          if (!relocated) {
            obj.moveTrait.teleportUnitToTile(dest, bridge, true, false, world);
            obj.warpedOutTrait.setActive(false, true, world);
            if (world.map.getTileZone(dest) === ZoneType.Water) obj.deathType = DeathType.Sink;
            world.destroyObject(obj, { player: this.owner });
            destroyedHere = true;
          }
        }
        for (const other of occupants) {
          if (other.isDisposed) continue;
          if (
            other.isUnit() &&
            (!this.objectsToTeleport.some(({ obj: o }) => o === other) ||
              (other.onBridge !== !!bridge && other.tile === dest) ||
              2 < Math.abs(other.tileElevation - obj.tileElevation))
          ) {
            if (other.isInfantry() && other.stance !== StanceType.Paradrop) {
              other.deathType = DeathType.Crush;
            }
            world.destroyObject(other, { player: this.owner, obj });
          }
        }
        if (!destroyedHere) {
          obj.moveTrait.teleportUnitToTile(dest, bridge, true, false, world);
          if (isPadDockLanding && helipad?.dockTrait) {
            const dockIndex = helipad.dockTrait.getAllDockTiles().indexOf(dest);
            helipad.dockTrait.undockUnitAt(dockIndex);
            if (helipad.dockTrait.hasReservedDockAt(dockIndex)) {
              throw new Error("Target building dock is already reserved by another unit");
            }
            helipad.dockTrait.dockUnitAt(obj, dockIndex);
          }
          if (movedOntoDock) {
            obj.warpedOutTrait.setTimed(world.rules.general.chronoDelay, false, world);
          } else {
            obj.warpedOutTrait.setActive(false, true, world);
          }
        }
      }
    }
    return true;
  }
}
