/**
 * VirusCloudTrait — 病毒狙击手毒云（按格伤害源 + 风漂移 + NextParticle 继承）。
 *
 * 无 YR 粒子引擎，用 per-tile 伤害源模拟：全部调参来自 md
 * （VIRUSD/VirusCloud1/VirusGas）。createCloud 在死者位置 spawn
 * particlesPerDeath 朵 main；寿命尽 spawn dissipate。onTick 按风表+ACCEL
 * 漂移更新 tile 锚点、周期 applyDamage。风向每 45..210 tick 随机重掷。
 * Visual 经 VirusCloudEvent 驱动 VirusCloudFxHandler。
 *
 * 由 game/gameobject/trait/VirusCloudTrait.ts.js →
 * game/trait/VirusCloudTrait.ts.js 重写为 TS（行为完全一致）。两个文件并
 * 存期间，本文件才是修改目标：tools/repack.mjs 打包时优先采用 .ts 模块的
 * 编译产物。
 */
import * as RadialTileFinderModule from "game/map/tileFinder/RadialTileFinder"; // 未转换（any-shim）
import * as WarheadModule from "game/Warhead"; // 未转换（any-shim）
import * as NotifyTickModule from "game/trait/interface/NotifyTick"; // 已转换
import * as VirusCloudEventModule from "game/event/VirusCloudEvent"; // 未转换（any-shim）
import * as CoordsModule from "game/Coords"; // 已转换

/** 8 向风表偏移（0=北，顺时针）。 */
const WIND_TABLE_X = [0, 2, 2, 2, 0, -2, -2, -2];
const WIND_TABLE_Y = [-2, -2, 0, 2, 2, 2, 0, -2];
/** 每 tick 速度最大变化（leptons/tick），须与 VirusCloudFxHandler 一致。 */
const ACCEL = 0.03;

/* eslint-disable @typescript-eslint/no-explicit-any */
export class VirusCloudTrait {
  /** 地图。 */
  map: any;
  /** id → 云状态。 */
  clouds: Map<number, any>;
  /** 下一云 id。 */
  nextCloudId: number;
  /** 惰性 md 配置缓存。 */
  _config: any;
  /** 弹头名小写 → Warhead|null 缓存。 */
  _warheadCache: Map<string, any>;

  constructor(map: any) {
    this.map = map;
    this.clouds = new Map();
    this.nextCloudId = 1;
    this._config = undefined;
    this._warheadCache = new Map();
  }

  /** 引擎内安全上限（无原版 GasCloudSys 粒子上限配置）。 */
  get maxClouds() {
    return 200;
  }

  /**
   * 从 md 惰性解析粒子调参：main（死亡云）与 dissipate（NextParticle
   * 继承者）各自 lifetime/interval/damage/visual；WindDirection 取
   * [General]（%8 归一化）。
   */
  getConfig(world: any) {
    if (this._config !== undefined) return this._config;
    try {
      const virusDeathAnim = world.rules.audioVisual.infantryVirus;
      const deathAnim = world.art.getAnimation(virusDeathAnim);
      const mainName = deathAnim.art.getString("SpawnsParticle", "VirusCloud1");
      const mainRules = world.rules.getParticle(mainName);
      const nextName = mainRules.getString("NextParticle");
      const nextRules = nextName ? world.rules.getParticle(nextName) : undefined;
      const read = (section: any, defaults: any) => ({
        damage: section.getNumber("Damage", defaults.damage),
        interval: section.getNumber("MaxDC", defaults.interval),
        lifetime: section.getNumber("MaxEC", defaults.lifetime),
        image: section.getString("Image", defaults.image),
        translucency: section.getNumber("Translucency", defaults.translucency),
        stateAIAdvance: section.getNumber("StateAIAdvance", 4),
        windEffect: section.getNumber("WindEffect", defaults.windEffect),
        warhead: section.getString("Warhead", defaults.warhead),
      });
      const dir = world.rules.getIni().getSection("General")?.getNumber("WindDirection", 0) ?? 0;
      this._config = {
        main: read(mainRules, {
          damage: 5,
          interval: 30,
          lifetime: 1000,
          image: "TXGASG",
          translucency: 0,
          windEffect: 0,
          warhead: "VirusGas",
        }),
        dissipate: nextRules
          ? read(nextRules, {
              damage: 5,
              interval: 60,
              lifetime: 50,
              image: "TXGASG",
              translucency: 50,
              windEffect: 0,
              warhead: "VirusGas",
            })
          : undefined,
        particlesPerDeath: deathAnim.art.getNumber("NumParticles", 3),
        windDirection: ((dir % 8) + 8) % 8,
      };
    } catch {
      this._config = null;
    }
    return this._config;
  }

  /**
   * 每 tick：各云随机重掷风向（异步）、ACCEL 趋近目标速度、更新 tile
   * 锚点、周期伤害、寿命尽删除并（main）spawn dissipate。
   */
  [NotifyTickModule.NotifyTick.onTick](world: any) {
    if (!this.clouds.size) return;
    const config = this.getConfig(world);
    this.clouds.forEach((cloud, id) => {
      // 每朵云自有随机调度重掷风向；半数保持原向。仅改目标速度，
      // 实际速度经 ACCEL 渐变。
      if (--cloud.windTicksLeft <= 0) {
        if (world.prng.generateRandomInt(0, 1)) {
          cloud.dir = world.prng.generateRandomInt(0, 7);
          cloud.tx = WIND_TABLE_X[cloud.dir] * cloud.pace;
          cloud.tz = WIND_TABLE_Y[cloud.dir] * cloud.pace;
          world.events.dispatch(
            new VirusCloudEventModule.VirusCloudEvent("vel", id, cloud.tile, 0, undefined, undefined, {
              tx: cloud.tx,
              tz: cloud.tz,
            }),
          );
        }
        // 下次重掷 45..210 tick（60tps 约 0.75–3.5s）。
        cloud.windTicksLeft = 45 + world.prng.generateRandomInt(0, 165);
      }
      // BehavesLike=Gas：每 tick 漂移；锚点跟随，伤害区随云移动。
      if (cloud.vel && cloud.pos) {
        cloud.vel.x += Math.max(-ACCEL, Math.min(ACCEL, cloud.tx - cloud.vel.x));
        cloud.vel.z += Math.max(-ACCEL, Math.min(ACCEL, cloud.tz - cloud.vel.z));
        cloud.pos.x += cloud.vel.x;
        cloud.pos.y += cloud.vel.y;
        cloud.pos.z += cloud.vel.z;
        const mx = Math.floor(cloud.pos.x / CoordsModule.Coords.LEPTONS_PER_TILE);
        const my = Math.floor(cloud.pos.z / CoordsModule.Coords.LEPTONS_PER_TILE);
        if (mx !== cloud.tile.rx || my !== cloud.tile.ry) {
          const nextTile = this.map.tiles.getByMapCoords(mx, my);
          if (nextTile) cloud.tile = nextTile;
        }
      }
      cloud.countdown--;
      if (cloud.countdown <= 0) {
        this.applyDamage(world, cloud);
        cloud.countdown = cloud.interval;
      }
      cloud.ticksLeft--;
      if (cloud.ticksLeft <= 0) {
        this.clouds.delete(id);
        world.events.dispatch(
          // 孪生只传 3 参：lifetimeTicks/position/visual/vel 实参为 undefined
          new VirusCloudEventModule.VirusCloudEvent("remove", id, cloud.tile, undefined as any, undefined, undefined, undefined),
        );
        // 原版：main 寿命尽在同点 spawn NextParticle（dissipate）独立云。
        if (cloud.kind === "main") this.spawnParticle(cloud.tile, cloud.pos, world, config, "dissipate");
      }
    });
  }

  /**
   * VIRUSD（InfDeath=8）在死者精确位置 spawn NumParticles 毒云；
   * 仅人类步兵（非 NotHuman）触发。
   * @param tile 伤害锚点格
   * @param worldPos 精确世界坐标
   * @param world 游戏世界
   */
  createCloud(tile: any, worldPos: any, world: any) {
    if (!tile || this.clouds.size >= this.maxClouds) return;
    const config = this.getConfig(world);
    if (!config) return;
    for (let i = 0; i < config.particlesPerDeath; i++) this.spawnParticle(tile, worldPos, world, config, "main");
  }

  /**
   * 生成一朵独立云 + 视觉事件。kind 选 md 段（"main"/"dissipate"）。
   * 风漂移：WindEffect>0 用全局风向，否则 StateAIAdvance 节奏 + 自身随机向。
   */
  spawnParticle(tile: any, worldPos: any, world: any, config: any, kind: "main" | "dissipate") {
    if (this.clouds.size >= this.maxClouds) return;
    const particle = config[kind];
    if (!particle) return;
    const id = this.nextCloudId++;
    const pos = worldPos?.clone?.() ?? undefined;
    const windEffect = particle.windEffect ?? 0;
    const pace = windEffect > 0 ? windEffect : 2 / Math.max(1, particle.stateAIAdvance ?? 4);
    const windDir = windEffect > 0 ? (config.windDirection ?? 0) & 7 : world.prng.generateRandomInt(0, 7);
    const rise = 0.15 + world.prng.generateRandomInt(-5, 5) / 100;
    const tx = WIND_TABLE_X[windDir] * pace;
    const tz = WIND_TABLE_Y[windDir] * pace;
    const vel = { x: 0, y: rise, z: 0, tx, tz };
    this.clouds.set(id, {
      tile,
      pos,
      vel,
      tx,
      tz,
      pace,
      dir: windDir,
      windEffect,
      windTicksLeft: 45 + world.prng.generateRandomInt(0, 165),
      kind,
      ticksLeft: particle.lifetime,
      lifetime: particle.lifetime,
      countdown: particle.interval,
      interval: particle.interval,
      damage: particle.damage,
      warhead: particle.warhead,
      image: particle.image,
      translucency: particle.translucency,
      stateAIAdvance: particle.stateAIAdvance,
    });
    world.events.dispatch(
      new VirusCloudEventModule.VirusCloudEvent("spawn", id, tile, particle.lifetime, pos, {
        image: particle.image,
        translucency: particle.translucency,
        stateAIAdvance: particle.stateAIAdvance,
      }, vel),
    );
  }

  /**
   * 区域伤害：VirusGas CellSpread 选候选格，3D 距离 ≤ spread×256 leptons
   * 才命中；锚点跟随漂移中的 pos。
   */
  applyDamage(world: any, cloud: any) {
    const warhead = this.getVirusGasWarhead(world, cloud.warhead);
    if (!warhead) return;
    const cellSpread = warhead.rules.cellSpread;
    if (!(cellSpread > 0)) return;
    const finder = new RadialTileFinderModule.RadialTileFinder(
      this.map.tiles,
      this.map.mapBounds,
      cloud.tile,
      { width: 1, height: 1 },
      0,
      Math.ceil(cellSpread),
      (t: any) => !!t,
      false,
    );
    let next: any;
    let amount: any;
    const anchor =
      cloud.pos ??
      CoordsModule.Coords.tile3dToWorld(cloud.tile.rx + 0.5, cloud.tile.ry + 0.5, cloud.tile.z);
    while ((next = finder.getNextTile())) {
      for (const ground of world.map.getGroundObjectsOnTile(next)) {
        if (!ground.isUnit() || ground.rules.immuneToPoison) continue;
        if (!warhead.canDamage(ground, next, ground.zone)) continue;
        const p = ground.position.worldPosition;
        const dist =
          Math.sqrt((p.x - anchor.x) ** 2 + (p.y - anchor.y) ** 2 + (p.z - anchor.z) ** 2) /
          CoordsModule.Coords.LEPTONS_PER_TILE;
        if (dist <= cellSpread && (amount = warhead.computeDamage(cloud.damage, ground, world)) > 0) {
          warhead.inflictDamage(amount, ground, undefined, world, true);
        }
      }
    }
  }

  /** 按名缓存 VirusGas 弹头（失败缓存 null）。 */
  getVirusGasWarhead(world: any, name: string) {
    const key = name.toLowerCase();
    if (this._warheadCache.has(key)) return this._warheadCache.get(key);
    let warhead: any;
    try {
      warhead = new WarheadModule.Warhead(world.rules.getWarhead(name));
    } catch {
      warhead = null;
    }
    this._warheadCache.set(key, warhead);
    return warhead;
  }
}
