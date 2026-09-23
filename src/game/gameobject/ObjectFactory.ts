/**
 * ObjectFactory — 游戏对象工厂（按 ObjectType 创建对象并组装 trait）。
 *
 * 核心职责（create 方法）：
 *  1) 解析 rules/art：Debris 走 DebrisRules（或 VoxelAnim ObjectArt）；
 *     Projectile 非 inviso 走 getProjectile art、inviso 新建 ObjectArt；
 *     其余 getObject/getAnimation 对称解析。
 *  2) 按 ObjectType 分支调用对应 *\.factory(...)：
 *     Building/Infantry/Vehicle/Aircraft/Terrain/Overlay/Smudge/Projectile/Debris。
 *  3) 注入 id（nextObjectId.value++）与 ObjectPosition；单位 subCell=0、
 *     建筑 setCenterOffset(foundation 中心)。
 *  4) isTechno 时组装一长串战斗/功能 trait（Armed/Attack/UnitOrder/
 *     Deployer/Disguise/Cloak/Sensors/AutoRepair/Veteran/SelfHealing/
 *     Invulnerable/WarpedOut/Temporal/TntCharge/MindControl/AirSpawn/
 *     Airstrike/SpawnDebris/Berserk/Drain/Gattling/Ammo 等），并做
 *     SlaveMiner、BioReactor、DrainWeapon、CAOS 死亡武器等特殊规则挂载。
 *  5) Techno/Overlay/Terrain 解析 strength（含树/桥强度覆盖）挂 HealthTrait；
 *     桥 Overlay 挂 BridgeTrait + 混凝土桥 SpawnDebris。
 *  6) 矿 Overlay 挂 TiberiumTrait；spawnsTiberium 地形挂 TiberiumTreeTrait。
 *  7) 最后把 NotifyTick 实现灌入 cachedTraits.tick 缓存并返回对象。
 *
 * 由 game/gameobject/ObjectFactory.ts.js 重写为 TS（行为完全一致）。
 * 两个文件并存期间，本文件才是修改目标：tools/repack.mjs 打包时优先
 * 采用 .ts 模块的编译产物。
 */
import * as ObjectTypeModule from "engine/type/ObjectType"; // 已转换
import * as BuildingModule from "game/gameobject/Building"; // 已转换
import * as TerrainModule from "game/gameobject/Terrain"; // 已转换
import * as OverlayModule from "game/gameobject/Overlay"; // 已转换
import * as SmudgeModule from "game/gameobject/Smudge"; // 已转换
import * as InfantryModule from "game/gameobject/Infantry"; // 已转换
import * as VehicleModule from "game/gameobject/Vehicle"; // 已转换
import * as AircraftModule from "game/gameobject/Aircraft"; // 已转换
import * as ObjectArtModule from "game/art/ObjectArt"; // 已转换
import * as IniSectionModule from "data/IniSection"; // 已转换
import * as UnitOrderTraitModule from "game/gameobject/trait/UnitOrderTrait"; // 已转换
import * as ObjectPositionModule from "game/gameobject/ObjectPosition"; // 已转换
import * as AttackTraitModule from "game/gameobject/trait/AttackTrait"; // 已转换
import * as ProjectileModule from "game/gameobject/Projectile"; // 已转换
import * as DeployerTraitModule from "game/gameobject/trait/DeployerTrait"; // 已转换
import * as HealthTraitModule from "game/gameobject/trait/HealthTrait"; // 已转换
import * as BridgeTraitModule from "game/gameobject/trait/BridgeTrait"; // 已转换
import * as BridgeOverlayTypesModule from "game/map/BridgeOverlayTypes"; // 已转换
import * as OreOverlayTypesModule from "game/map/OreOverlayTypes"; // 已转换
import * as TiberiumTraitModule from "game/gameobject/trait/TiberiumTrait"; // 已转换
import * as TiberiumTreeTraitModule from "game/gameobject/trait/TiberiumTreeTrait"; // 已转换
import * as AutoRepairTraitModule from "game/gameobject/trait/AutoRepairTrait"; // 已转换
import * as VeteranTraitModule from "game/gameobject/trait/VeteranTrait"; // 已转换
import * as ArmedTraitModule from "game/gameobject/trait/ArmedTrait"; // 已转换
import * as SelfHealingTraitModule from "game/gameobject/trait/SelfHealingTrait"; // 已转换
import * as AmmoTraitModule from "game/gameobject/trait/AmmoTrait"; // 已转换
import * as DisguiseTraitModule from "game/gameobject/trait/DisguiseTrait"; // 已转换
import * as InvulnerableTraitModule from "game/gameobject/trait/InvulnerableTrait"; // 已转换
import * as WarpedOutTraitModule from "game/gameobject/trait/WarpedOutTrait"; // 已转换
import * as TntChargeTraitModule from "game/gameobject/trait/TntChargeTrait"; // 已转换
import * as MindControllableTraitModule from "game/gameobject/trait/MindControllableTrait"; // 已转换
import * as MindControllerTraitModule from "game/gameobject/trait/MindControllerTrait"; // 已转换
import * as TemporalTraitModule from "game/gameobject/trait/TemporalTrait"; // 已转换
import * as CloakableTraitModule from "game/gameobject/trait/CloakableTrait"; // 已转换
import * as AirSpawnTraitModule from "game/gameobject/trait/AirSpawnTrait"; // 已转换
import * as SpawnDebrisTraitModule from "game/gameobject/trait/SpawnDebrisTrait"; // 已转换
import * as DebrisModule from "game/gameobject/Debris"; // 已转换
import * as DebrisRulesModule from "game/rules/DebrisRules"; // 已转换
import * as NotifyTickModule from "game/gameobject/trait/interface/NotifyTick"; // 已转换
import * as SensorsTraitModule from "game/gameobject/trait/SensorsTrait"; // 已转换
import * as SlaveMinerTraitModule from "game/gameobject/trait/SlaveMinerTrait"; // 已转换
import * as GattlingTraitModule from "game/gameobject/trait/GattlingTrait"; // 已转换
import * as BioReactorPowerTraitModule from "game/gameobject/trait/BioReactorPowerTrait"; // 已转换
import * as DrainTraitModule from "game/gameobject/trait/DrainTrait"; // 已转换
import * as SlaveMinerVehicleTraitModule from "game/gameobject/trait/SlaveMinerVehicleTrait"; // 已转换
import * as BerserkTraitModule from "game/gameobject/trait/BerserkTrait"; // 已转换
import * as AirstrikeTraitModule from "game/gameobject/trait/AirstrikeTrait"; // 已转换

/* eslint-disable @typescript-eslint/no-explicit-any */
export class ObjectFactory {
  /** 地图 tile 集合。 */
  tiles: any;
  /** tile 占位管理器。 */
  tileOccupation: any;
  /** 桥管理器。 */
  bridges: any;
  /** 自增 id 计数器（{ value }）。 */
  nextObjectId: { value: number };

  constructor(tiles: any, tileOccupation: any, bridges: any, nextObjectId: { value: number }) {
    this.tiles = tiles;
    this.tileOccupation = tileOccupation;
    this.bridges = bridges;
    this.nextObjectId = nextObjectId;
  }

  /**
   * 创建一个游戏对象并组装其 trait。
   * @param type ObjectType 枚举
   * @param name INI 内部名
   * @param rules 规则容器（rules 层）
   * @param art 美术/规则访问器（art 层，提供 getObject/getAnimation/...）
   * @returns 组装完毕、带 id 与 position 的对象
   */
  create(type: any, name: string, rules: any, art: any): any {
    let rulesObj: any;
    let artObj: any;
    if (type === ObjectTypeModule.ObjectType.Debris) {
      if (rules.hasObject(name, ObjectTypeModule.ObjectType.VoxelAnim)) {
        artObj = art.getObject(name, ObjectTypeModule.ObjectType.VoxelAnim);
        rulesObj = rules.getObject(name, ObjectTypeModule.ObjectType.VoxelAnim);
      } else {
        artObj = art.getAnimation(name);
        rulesObj = new DebrisRulesModule.DebrisRules(
          ObjectTypeModule.ObjectType.Debris,
          art.getIni().getOrCreateSection(name),
        );
      }
    } else if (type === ObjectTypeModule.ObjectType.Projectile) {
      rulesObj = rules.getProjectile(name);
      artObj = rulesObj.inviso
        ? new ObjectArtModule.ObjectArt(ObjectTypeModule.ObjectType.Projectile, rulesObj, new IniSectionModule.IniSection(name))
        : art.getProjectile(name);
    } else {
      rulesObj = rules.getObject(name, type);
      artObj = art.getObject(name, type);
    }

    let obj: any;
    switch (type) {
      case ObjectTypeModule.ObjectType.Building:
        obj = BuildingModule.Building.factory(name, rulesObj, rules, artObj, this.tiles, this.bridges);
        // attach SlaveMinerTrait to buildings with Slaves= (YR Yuri economy).
        if (obj.rules.slaveMiner) {
          obj.slaveMinerTrait = new SlaveMinerTraitModule.SlaveMinerTrait();
          obj.traits.add(obj.slaveMinerTrait);
        }
        // attach BioReactorPowerTrait to buildings with ExtraPower= (Bio Reactor
        // power scaling per garrisoned infantry). Requires the building to be garrisonable,
        // which InfantryAbsorb=yes now also enables (see TechnoRules.canBeOccupied).
        if (obj.rules.extraPower && obj.rules.canBeOccupied) {
          obj.bioReactorPowerTrait = new BioReactorPowerTraitModule.BioReactorPowerTrait();
          obj.traits.add(obj.bioReactorPowerTrait);
        }
        break;
      case ObjectTypeModule.ObjectType.Infantry:
        obj = InfantryModule.Infantry.factory(name, rulesObj, artObj, this.tileOccupation);
        break;
      case ObjectTypeModule.ObjectType.Vehicle:
        obj = VehicleModule.Vehicle.factory(name, rulesObj, artObj, rules, this.tileOccupation);
        // attach SlaveMinerVehicleTrait to the undeployed Slave Miner vehicle
        // (YASLMN) so it proactively seeks ore and deploys (morphs into YAREFN) like
        // vanilla YR, and so a manual move onto ore deploys on arrival. Attached when the
        // vehicle can deploy (DeploysInto=) AND is a SlaveMiner. SlavesNumber may live on
        // either form in mod data, so check the vehicle itself OR its deploy target.
        if (obj.rules.deploysInto) {
          let isSmVeh = !!obj.rules.slaveMiner;
          if (!isSmVeh)
            try {
              const tgt = rules.hasObject(obj.rules.deploysInto, ObjectTypeModule.ObjectType.Building)
                ? rules.getObject(obj.rules.deploysInto, ObjectTypeModule.ObjectType.Building)
                : null;
              isSmVeh = !!(tgt && tgt.slaveMiner);
            } catch (err) {}
          if (isSmVeh) {
            obj.slaveMinerVehicleTrait = new SlaveMinerVehicleTraitModule.SlaveMinerVehicleTrait();
            obj.traits.add(obj.slaveMinerVehicleTrait);
          }
        }
        break;
      case ObjectTypeModule.ObjectType.Aircraft:
        obj = AircraftModule.Aircraft.factory(name, rulesObj, artObj, rules, this.tileOccupation);
        break;
      case ObjectTypeModule.ObjectType.Terrain:
        obj = TerrainModule.Terrain.factory(name, rulesObj, artObj);
        break;
      case ObjectTypeModule.ObjectType.Overlay:
        obj = OverlayModule.Overlay.factory(name, rulesObj, artObj);
        break;
      case ObjectTypeModule.ObjectType.Smudge:
        obj = SmudgeModule.Smudge.factory(name, rulesObj, artObj);
        break;
      case ObjectTypeModule.ObjectType.Projectile:
        obj = ProjectileModule.Projectile.factory(name, rulesObj, artObj, this.tileOccupation);
        break;
      case ObjectTypeModule.ObjectType.Debris:
        obj = DebrisModule.Debris.factory(name, rulesObj, artObj, this.tileOccupation);
        break;
      default:
        throw new Error("Not implemented");
    }

    // 分配 id 与位置组件
    obj.id = this.nextObjectId.value++;
    obj.position = new ObjectPositionModule.ObjectPosition(this.tiles, this.tileOccupation);
    if (obj.isUnit()) obj.position.subCell = 0;
    else if (obj.isBuilding()) obj.position.setCenterOffset(obj.getFoundationCenterOffset());

    let initialAmmo: number;
    if (obj.isTechno()) {
      // 武器挂载
      if (
        obj.rules.primary ||
        obj.rules.secondary ||
        obj.rules.weaponCount ||
        obj.rules.explodes ||
        (obj.garrisonTrait && !obj.bioReactorPowerTrait)
      ) {
        obj.armedTrait = new ArmedTraitModule.ArmedTrait(obj, rules);
        obj.traits.add(obj.armedTrait);
      }
      // Gattling escalation. Technos with IsGattling=yes (and WeaponCount>1)
      // that are NOT gunners (IFV turret swap) advance weapon stage while firing. Gunners
      // use GunnerTrait (driven by transported passenger ifvMode) instead.
      if (obj.rules.isGattling && obj.rules.weaponCount > 1 && !obj.rules.gunner && obj.armedTrait) {
        obj.gattlingTrait = new GattlingTraitModule.GattlingTrait(obj);
        obj.traits.add(obj.gattlingTrait);
      }
      // Floating Disc (DISCUS) drain. (2026-06-30, REVERSED): attach DrainTrait to any unit
      // whose primary or secondary weapon is marked DrainWeapon=yes (vanilla Floating Disc / DISCUS).
      // REVERSED from yrmd.exe: DrainWeapon is a per-weapon flag; the disc's building-
      // attack weapon carries it, so when it strikes a Drainable=yes building the
      // DrainTrait (driven by NotifyAttack/NotifyTick) siphons power/money instead of
      // dealing damage. The earlier `obj.rules.harvester` gate was WRONG — DISCUS is not
      // Harvester=yes in vanilla, so drain never attached.
      if ([obj.primaryWeapon, obj.secondaryWeapon].some((w: any) => w?.rules.drainWeapon)) {
        obj.drainTrait = new DrainTraitModule.DrainTrait();
        obj.traits.add(obj.drainTrait);
      }
      if (obj.rules.ammo !== -1) {
        initialAmmo = obj.rules.initialAmmo;
        obj.ammoTrait = new AmmoTraitModule.AmmoTrait(obj.rules.ammo, initialAmmo !== -1 ? initialAmmo : void 0);
        obj.traits.add(obj.ammoTrait);
      }
      obj.unitOrderTrait = new UnitOrderTraitModule.UnitOrderTrait(obj);
      obj.traits.addToFront(obj.unitOrderTrait);
      if (obj.primaryWeapon || obj.secondaryWeapon || (obj.garrisonTrait && !obj.bioReactorPowerTrait)) {
        obj.attackTrait = new AttackTraitModule.AttackTrait(this.tiles, this.tileOccupation);
        obj.traits.add(obj.attackTrait);
      }
      if ((obj.isInfantry() || obj.isVehicle()) && obj.rules.deployer) {
        obj.deployerTrait = new DeployerTraitModule.DeployerTrait(obj);
        obj.traits.add(obj.deployerTrait);
      }
      if ((obj.isInfantry() || obj.isVehicle()) && obj.rules.canDisguise) {
        obj.disguiseTrait = new DisguiseTraitModule.DisguiseTrait();
        obj.traits.add(obj.disguiseTrait);
      }
      if (obj.rules.cloakable) {
        obj.cloakableTrait = new CloakableTraitModule.CloakableTrait(obj, rules.general.cloakDelay);
        obj.traits.add(obj.cloakableTrait);
      }
      if (obj.rules.sensors) {
        obj.sensorsTrait = new SensorsTraitModule.SensorsTrait();
        obj.traits.add(obj.sensorsTrait);
      }
      obj.autoRepairTrait = new AutoRepairTraitModule.AutoRepairTrait(!obj.isBuilding());
      obj.traits.add(obj.autoRepairTrait);
      if (obj.rules.trainable) {
        obj.veteranTrait = new VeteranTraitModule.VeteranTrait(obj, rules.general.veteran);
        obj.traits.add(obj.veteranTrait);
      }
      if (obj.rules.selfHealing) obj.traits.add(new SelfHealingTraitModule.SelfHealingTrait());
      obj.invulnerableTrait = new InvulnerableTraitModule.InvulnerableTrait();
      obj.traits.add(obj.invulnerableTrait);
      obj.warpedOutTrait = new WarpedOutTraitModule.WarpedOutTrait(obj);
      obj.traits.add(obj.warpedOutTrait);
      obj.temporalTrait = new TemporalTraitModule.TemporalTrait(obj);
      obj.traits.add(obj.temporalTrait);
      if (obj.rules.bombable && !obj.art.toOverlay) {
        obj.tntChargeTrait = new TntChargeTraitModule.TntChargeTrait();
        obj.traits.add(obj.tntChargeTrait);
      }
      if (!obj.rules.immuneToPsionics) {
        obj.mindControllableTrait = new MindControllableTraitModule.MindControllableTrait(obj);
        obj.traits.add(obj.mindControllableTrait);
      }
      // 心灵控制：武器级 InfiniteMindControl=yes 优先，回退单位级 MindControlOverload
      ((mcWeapon: any) => {
        if (mcWeapon) {
          const overload = obj.rules.mindControlOverload || mcWeapon.rules.infiniteMindControl;
          obj.mindControllerTrait = new MindControllerTraitModule.MindControllerTrait(
            obj,
            mcWeapon.rules.damage,
            overload,
          );
          obj.traits.add(obj.mindControllerTrait);
        }
      })([obj.primaryWeapon, obj.secondaryWeapon].find((w: any) => w?.warhead.rules.mindControl));
      if (obj.rules.spawns) {
        obj.airSpawnTrait = new AirSpawnTraitModule.AirSpawnTrait();
        obj.traits.add(obj.airSpawnTrait);
      }
      // AirstrikeTrait — attached to units with AirstrikeTeam > 0 (vanilla
      // Boris). Manages MiG plane spawning, laser designator state, and airstrike
      // cooldown. Boris calls MiGs via his secondary weapon (Flare) on buildings.
      if (obj.rules.airstrikeTeam > 0 && obj.rules.airstrikeTeamType) {
        obj.airstrikeTrait = new AirstrikeTraitModule.AirstrikeTrait();
        obj.traits.add(obj.airstrikeTrait);
      }
      if (obj.rules.maxDebris) obj.traits.add(new SpawnDebrisTraitModule.SpawnDebrisTrait());
      // BerserkTrait — attached to all techno units so they can
      // be affected by Psychedelic=yes warheads (Chaos Drone gas).
      if (!obj.rules.immuneToPsionics) {
        obj.berserkTrait = new BerserkTraitModule.BerserkTrait(obj);
        obj.traits.add(obj.berserkTrait);
      }
      // Chaos Drone releases nerve gas on death.
      if (obj.name === "CAOS" && obj.armedTrait && obj.armedTrait.primaryWeapon)
        obj.armedTrait.deathWeapon = obj.armedTrait.primaryWeapon;
    }

    if (obj.isTechno() || obj.isOverlay() || obj.isTerrain()) {
      const isBridgeOverlay =
        obj.isOverlay() && BridgeOverlayTypesModule.BridgeOverlayTypes.isBridge(rules.getOverlayId(obj.name));
      let strength = obj.rules.strength;
      if (!strength && obj.isTerrain()) strength = rules.general.treeStrength;
      if (isBridgeOverlay) strength = rules.combatDamage.bridgeStrength;
      if (strength || obj.isTechno()) {
        obj.healthTrait = new HealthTraitModule.HealthTrait(
          strength,
          obj,
          rules.audioVisual.conditionYellow,
          rules.audioVisual.conditionRed,
        );
        obj.traits.add(obj.healthTrait);
      }
      if (obj.isOverlay() && isBridgeOverlay) {
        obj.bridgeTrait = new BridgeTraitModule.BridgeTrait(this.bridges);
        obj.traits.add(obj.bridgeTrait);
        if (
          BridgeOverlayTypesModule.BridgeOverlayTypes.getOverlayBridgeType(rules.getOverlayId(obj.name)) ===
          BridgeOverlayTypesModule.OverlayBridgeType.Concrete
        )
          obj.traits.add(new SpawnDebrisTraitModule.SpawnDebrisTrait());
      }
    }

    // 矿 Overlay 挂 TiberiumTrait
    if (obj.isOverlay()) {
      const tibType = OreOverlayTypesModule.OreOverlayTypes.getOverlayTibType(rules.getOverlayId(obj.name));
      if (void 0 !== tibType) {
        const tib = rules.getTiberium(tibType);
        obj.traits.add(new TiberiumTraitModule.TiberiumTrait(obj, tib));
      }
    }
    // 泰伯利亚树
    if (obj.isTerrain() && obj.rules.spawnsTiberium)
      obj.traits.add(new TiberiumTreeTraitModule.TiberiumTreeTrait(obj.rules));
    // 缓存 NotifyTick trait
    obj.cachedTraits.tick.push(...obj.traits.filter(NotifyTickModule.NotifyTick));
    return obj;
  }
}
