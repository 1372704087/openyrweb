/**
 * Debris — 碎片/残骸对象（爆炸后抛射的带物理小块）。
 *
 * 继承 GameObject（ObjectType.Debris）。onSpawn 按规则随机方向/水平速度/
 * 垂直速度/旋转轴/角速度；update 每帧：zSpeed 下坠、按 FacingUtil 方向
 * 推进、CollisionHelper 碰撞；满足反弹条件（Ground/OnBridge 且有弹性、
 * 非水面、|zSpeed|≥1）时反弹，否则 detonate。出界（!isWithinHardBounds）
 * → unspawn。detonate：选爆炸区域与动画（水面取 splashList[0]，否则
 * expireAnim），spawnSmudges，destroyObject 后若有 warhead 则以
 * SpecialWarheadType.None 引爆。
 *
 * 由 game/gameobject/Debris.ts.js 重写为 TS（行为完全一致）。两个文件
 * 并存期间，本文件才是修改目标：tools/repack.mjs 打包时优先采用 .ts
 * 模块的编译产物。
 *
 * 两个文件并存期间，本文件才是修改目标：tools/repack.mjs 打包时优先采用 .ts 模块的编译产物。
 */
import * as GameObjectModule from "game/gameobject/GameObject"; // 已转换
import * as ObjectTypeModule from "engine/type/ObjectType"; // 已转换
import * as ZoneTypeModule from "game/gameobject/unit/ZoneType"; // 已转换
import * as WarheadModule from "game/Warhead"; // 已转换
import * as FacingUtilModule from "game/gameobject/unit/FacingUtil"; // 已转换
import * as AnimTerrainEffectModule from "game/gameobject/common/AnimTerrainEffect"; // 已转换
import * as CollisionHelperModule from "game/gameobject/unit/CollisionHelper"; // 已转换
import * as CollisionTypeModule from "game/gameobject/unit/CollisionType"; // 已转换
import * as Vector3Module from "game/math/Vector3"; // 已转换
import * as math from "util/math"; // 已转换
import * as SpecialWarheadTypeModule from "game/SpecialWarheadType"; // 已转换

/* eslint-disable @typescript-eslint/no-explicit-any */
export class Debris extends GameObjectModule.GameObject {
  /** 存活帧数（与 rules.duration 比较）。 */
  age: number;
  /** 平面运动朝向（度）。 */
  direction: number;
  /** 旋转轴（随机单位向量）。 */
  rotationAxis: any;
  /** 角速度。 */
  angularVelocity: number;
  /** 所在区域（Air/Ground/Water，detonate 时重算）。 */
  zone: any;
  /** 当前速度向量（lepton/tick）。 */
  velocity: any;
  /** 碰撞检测器。 */
  collisionHelper: any;
  /** 水平速度。 */
  xySpeed: number;
  /** 垂直速度（每帧 −1 模拟重力）。 */
  zSpeed: number;
  /** 爆炸动画名（detonate 时写入，供外部读取）。 */
  explodeAnim: string | undefined;

  /** 工厂：new Debris(name, rules, art, tileOccupation)。 */
  static factory(name: string, rules: any, art: any, tileOccupation: any): Debris {
    return new this(name, rules, art, tileOccupation);
  }

  constructor(name: string, rules: any, art: any, tileOccupation: any) {
    super(ObjectTypeModule.ObjectType.Debris, name, rules, art);
    this.age = 0;
    this.direction = 0;
    this.rotationAxis = new Vector3Module.Vector3();
    this.angularVelocity = 0;
    this.zone = ZoneTypeModule.ZoneType.Air;
    this.velocity = new Vector3Module.Vector3();
    this.collisionHelper = new CollisionHelperModule.CollisionHelper(tileOccupation);
  }

  /** 出生：随机初速与旋转参数。 */
  onSpawn(world: any): void {
    super.onSpawn(world);
    this.direction = world.generateRandomInt(0, 359);
    this.xySpeed = math.lerp(0, this.rules.maxXYVel, world.generateRandom());
    this.zSpeed = math.lerp(
      this.rules.minZVel,
      this.rules.maxZVel || 1.5 * this.rules.minZVel,
      world.generateRandom(),
    );
    this.rotationAxis.set(world.generateRandom(), world.generateRandom(), world.generateRandom()).normalize();
    this.angularVelocity = math.lerp(
      this.rules.minAngularVelocity,
      this.rules.maxAngularVelocity,
      world.generateRandom(),
    );
  }

  /** 每帧：超时 detonate；否则位移+碰撞，反弹或 detonate，出界 unspawn。 */
  update(world: any): void {
    super.update(world);
    this.age++;
    if (this.rules.duration && this.age > this.rules.duration) {
      this.velocity.set(0, 0, 0);
      this.detonate(world);
      return;
    }
    --this.zSpeed;
    const dir = FacingUtilModule.FacingUtil.toMapCoords(this.direction).setLength(this.xySpeed);
    const delta = new Vector3Module.Vector3(dir.x, this.zSpeed, dir.y);
    const prevPos = this.position.clone();
    const next = delta.clone().add(this.position.worldPosition);
    if (world.map.isWithinHardBounds(next)) {
      this.position.moveByLeptons3(delta);
      let hit = false;
      const { type, target } = this.collisionHelper.checkCollisions(this.position, prevPos, {
        cliffs: true,
        ground: true,
        shore: false,
        walls: true,
        units: false,
      });
      if (type) {
        // 孪生：(!(bounceCond) || |zSpeed|<1) ? hit : bounce
        const bounceCond =
          [CollisionTypeModule.CollisionType.Ground, CollisionTypeModule.CollisionType.OnBridge].includes(type) &&
          this.rules.elasticity > 0 &&
          world.map.getTileZone(this.tile) !== ZoneTypeModule.ZoneType.Water;
        if (!bounceCond || Math.abs(this.zSpeed) < 1) hit = true;
        else {
          this.zSpeed = -this.zSpeed * this.rules.elasticity;
          this.velocity.y = -this.velocity.y * this.rules.elasticity;
          this.rotationAxis.negate();
        }
      }
      if (hit) {
        this.velocity.set(0, 0, 0);
        if (target && type === CollisionTypeModule.CollisionType.Wall) {
          const wp = target.position.worldPosition;
          this.position.moveByLeptons3(wp.clone().sub(this.position.worldPosition));
        }
        this.detonate(world, type);
      } else this.velocity.copy(delta);
    } else world.unspawnObject(this);
  }

  /**
   * 引爆：选定爆炸动画与区域，刷污渍，销毁自身，有 warhead 则 detonate。
   * @param collisionType 碰撞类型（默认 None）
   */
  detonate(world: any, collisionType: any = CollisionTypeModule.CollisionType.None): void {
    const warheadRules = this.rules.warhead ? world.rules.getWarhead(this.rules.warhead) : void 0;
    this.zone = this.collisionHelper.computeDetonationZone(this.tile, this.tileElevation, collisionType);
    let anim: string | undefined;
    // 孪生：Water ? (e=splashList, a=e[0]) : (e=expireAnim) && has(e) && (a=e)
    if (this.zone === ZoneTypeModule.ZoneType.Water) {
      anim = world.rules.combatDamage.splashList[0];
    } else {
      const expire = this.rules.expireAnim;
      if (expire && world.rules.animationNames.has(expire)) anim = expire;
    }
    this.explodeAnim = anim;

    const effect = new AnimTerrainEffectModule.AnimTerrainEffect();
    // 孪生：(a && n.spawnSmudges(a, this.tile, t), t.destroyObject(this), r){...}
    if (anim) effect.spawnSmudges(anim, this.tile, world);
    world.destroyObject(this);
    if (warheadRules) {
      const warhead = new WarheadModule.Warhead(warheadRules);
      warhead.detonate(
        world,
        this.rules.damage,
        this.tile,
        this.tileElevation,
        this.position.worldPosition,
        this.zone,
        collisionType,
        world.createTarget(void 0, this.tile),
        void 0,
        SpecialWarheadTypeModule.SpecialWarheadType.None,
        void 0,
        this.rules.damageRadius || void 0,
        true,
      );
    }
  }
}
