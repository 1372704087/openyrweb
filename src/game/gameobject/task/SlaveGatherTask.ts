/**
 * SlaveGatherTask — 奴隶矿工采矿循环（尤里阵营奴隶矿车的 SLAV 奴隶）。
 *
 * 由单个奴隶步兵驱动的自治状态机（7 态）：
 *  - SEEKING_ORE（找矿）：径向搜索最近的可达矿石格（RadialTileFinder
 *    + 岛屿连通性检查——避免走向隔海的矿），按矿值排序后从最近的
 *    前几格随机选一个；没矿时跟随矿车（载具形态直接寻路，建筑形态
 *    两格两格地蹭近）并定期重扫；
 *  - MOVING_TO_ORE（走向矿）：挂 MoveTask 子任务；矿车移动 >3 格时
 *    重扫；
 *  - IDLE_BEFORE_HARVEST（挖矿前思考）：随机短暂停顿（原版行为），
 *    期间小概率随机转向，并环顾四周寻找价值更高的邻近矿格；
 *  - HARVESTING（采矿）：通过矿石覆盖物的 TiberiumTrait 收集，
 *    装满（Storage）或矿采完 → 转移到相邻矿格或返程；
 *  - RETURNING（返程）：走向矿车当前格（矿车移动 ≥3 格才重新寻路，
 *    防止每格都重规划导致卡死）；
 *  - DUMPING（卸货）：按实际收割组合计价（+矿石精炼机加成、AI 难度
 *    系数）入账，隐藏奴隶约 2 秒（用超时空定时替代销毁/重生）；
 *  - EXITING_MINER（出仓）：找矿车周边空格走出（3 秒超时强制传送），
 *    回到 SEEKING_ORE。
 *
 * 退出（取消/矿车被毁/被解放）时清掉收割动画标志，防止奴隶无限
 * 循环挖掘动作（onEnd）。
 *
 * 锁步：选矿/停顿/转向优先用 game.prng；缺失时确定性回退（取候选
 * 下界、停顿 0、不随机转向），避免联机/回放分叉。
 *
 * 由 game/gameobject/task/SlaveGatherTask.ts.js 重写为 TS（行为完全
 * 一致）。两个文件并存期间，本文件才是修改目标。
 */
import { Task } from "game/gameobject/task/system/Task"; // 已转换
import { MoveTask } from "game/gameobject/task/move/MoveTask"; // 已转换
import { RadialTileFinder } from "game/map/tileFinder/RadialTileFinder"; // 已转换
import { LandType } from "game/type/LandType"; // 已转换
import { WaitMinutesTask } from "game/gameobject/task/system/WaitMinutesTask"; // 已转换
import * as TiberiumTraitModule from "game/gameobject/trait/TiberiumTrait"; // 未转换（any-shim）

/** 锁步安全的整数随机：有 prng 用 prng，否则恒返回下界。 */
function randInt(game: any, a: number, _b: number): number {
  if (game && game.prng && game.prng.generateRandomInt) return game.prng.generateRandomInt(a, _b);
  return a;
}

/* eslint-disable @typescript-eslint/no-explicit-any */
export class SlaveGatherTask extends Task {
  game: any;
  /** 所属的奴隶矿车（建筑形态或载具形态）。 */
  miner: any;
  /** 当前状态（SEEKING_ORE..EXITING_MINER，模块私有常量）。 */
  state: number;
  /** 最后采集的矿石类型（harvesterTrait 缺失时的降级记账字段）。 */
  cargo: any;
  cargoCount: number;
  _returnDoorTile: any;
  /** 采矿节奏：每捆 8 × harvestRate tick。 */
  oreTile: any;
  _moveTargetTile: any;
  _hideTimerStarted: boolean;
  _exitTicks: number;

  constructor(game: any, miner: any) {
    super();
    this.game = game;
    this.miner = miner;
    this.state = 0 /* SEEKING_ORE */;
    this.cargo = undefined;
    this.cargoCount = 0;
    this._returnDoorTile = undefined;
    this.useChildTargetLines = true;
    this.blocking = true;
  }

  /**
   * 找最近的可达矿石格：径向 0~slaveMinerSlaveScan 格，条件为
   * 钻石矿地皮 + 步兵可通行 + 高差 <2 + 与奴隶同岛；按矿值降序后
   * 从最高值的前 5 格随机取一个（多个奴隶自然分散）。
   */
  _findOre(game: any, object: any): any {
    const map = game.map;
    const speedType = object.rules.speedType;
    const isInfantry = true; // 奴隶是步兵
    const islandMap = map.terrain.getIslandIdMap(speedType, isInfantry);
    const homeIsland = islandMap ? islandMap.get(object.tile, object.onBridge) : undefined;
    const candidates = [];
    const finder = new RadialTileFinder(
      map.tiles,
      map.mapBounds,
      object.tile,
      { width: 1, height: 1 },
      0,
      game.rules.general.slaveMinerSlaveScan,
      (tile: any) =>
        tile.landType === LandType.Tiberium &&
        0 < map.terrain.getPassableSpeed(tile, speedType, isInfantry, false) &&
        Math.abs(tile.z - object.tile.z) < 2 &&
        (!islandMap || islandMap.get(tile, false) === homeIsland),
    );
    for (;;) {
      const tile = finder.getNextTile();
      if (!tile) break;
      const overlay = map.getGroundObjectsOnTile(tile).find((obj: any) => obj.isOverlay() && obj.isTiberium());
      // 矿石覆盖物的收集逻辑放在 trait 集合里（不是直接属性）。
      const tiberiumTrait = overlay && overlay.traits ? overlay.traits.get(TiberiumTraitModule.TiberiumTrait) : undefined;
      if (tiberiumTrait && 0 < tiberiumTrait.getBailCount()) candidates.push({ tile, tibTrait: tiberiumTrait });
    }
    if (!candidates.length) return undefined;
    // 按矿值降序（与 GatherOreTask 的价值排序一致，简化版）。
    candidates.sort((x: any, y: any) => (y.tibTrait.rules.value || 0) - (x.tibTrait.rules.value || 0));
    // 最高值里从最近的几格随机选（RadialTileFinder 按距离递增产出，
    // 排序后最前面的就是最近的最高值格），5 个奴隶会自然分散。
    const topValue = candidates[0].tibTrait.rules.value || 0;
    const pool = candidates.filter((c: any) => (c.tibTrait.rules.value || 0) === topValue).slice(0, 5);
    // generateRandomInt 为闭区间 [min,max]：上界须 length-1，否则 pool[length] 越界
    // 读 .tile 抛 TypeError（99e9b31 换锁步随机时引入的 off-by-one）
    return pool[randInt(game, 0, pool.length - 1)].tile;
  }

  /**
   * 在奴隶周围小半径内找价值更高的矿格（挖矿前的"思考"停顿用，
   * 原版行为：奴隶会环顾并可能挪到更好的矿上）。
   */
  _findBetterOreNearby(object: any, range: number): any {
    const map = this.game.map;
    const speedType = object.rules.speedType;
    const isInfantry = true;
    const islandMap = map.terrain.getIslandIdMap(speedType, isInfantry);
    const homeIsland = islandMap ? islandMap.get(object.tile, object.onBridge) : undefined;
    let currentValue = 0;
    // 当前目标矿的价值（用于比较"更好"）。
    if (this.oreTile) {
      const currentOverlay = map.getGroundObjectsOnTile(this.oreTile).find((obj: any) => obj.isOverlay() && obj.isTiberium());
      const currentTrait = currentOverlay && currentOverlay.traits ? currentOverlay.traits.get(TiberiumTraitModule.TiberiumTrait) : undefined;
      if (currentTrait) currentValue = currentTrait.rules.value || 0;
    }
    let bestTile: any;
    let bestValue = currentValue;
    const finder = new RadialTileFinder(map.tiles, map.mapBounds, object.tile, { width: 1, height: 1 }, 2, range, (tile: any) =>
      tile.landType === LandType.Tiberium &&
      0 < map.terrain.getPassableSpeed(tile, speedType, isInfantry, false) &&
      Math.abs(tile.z - object.tile.z) < 2 &&
      (!islandMap || islandMap.get(tile, false) === homeIsland),
    );
    for (;;) {
      const tile = finder.getNextTile();
      if (!tile) break;
      const overlay = map.getGroundObjectsOnTile(tile).find((obj: any) => obj.isOverlay() && obj.isTiberium());
      const tiberiumTrait = overlay && overlay.traits ? overlay.traits.get(TiberiumTraitModule.TiberiumTrait) : undefined;
      if (tiberiumTrait && 0 < tiberiumTrait.getBailCount()) {
        const value = tiberiumTrait.rules.value || 0;
        if (value > bestValue) {
          bestValue = value;
          bestTile = tile;
        }
      }
    }
    return bestTile;
  }

  /**
   * 收尾：任何退出路径都清掉收割/搬运/锁矿标志（取消中
   * 的奴隶如果不清 isHarvesting 会无限循环挖掘动画）。
   */
  onEnd(object: any): void {
    if (object && object.harvesterTrait) object.harvesterTrait.status = 0;
    if (object) object.isHarvesting = false;
    if (object) object.isCarrying = false;
    if (object) object._oreLocked = false;
  }

  /** 每 tick 驱动状态机（见类注释的 7 态说明）。 */
  onTick(object: any): boolean {
    if (this.isCancelling()) return true;
    // 矿车被卖/被毁 → 解放奴隶（任务结束）。
    if (!this.miner || this.miner.isDisposed || this.miner.isDestroyed) return true;
    switch (this.state) {
      case 0 /* SEEKING_ORE */: {
        // 有子任务在跑（如走回矿车的 MoveTask）→ 等它结束再扫矿，
        // 否则奴隶会来回震荡。
        if (this.children.length) return false;
        // 已有货（返程中矿车变形/移动过）→ 先去卸货。
        if (object.harvesterTrait && !object.harvesterTrait.isEmpty()) {
          object.isCarrying = true;
          this.state = 3 /* RETURNING */;
          return false;
        }
        const oreFound = this._findOre(this.game, object);
        if (!oreFound) {
          // 附近没矿。矿车形态：直接寻路跟上（而不是两格两格地蹭）；
          // 矿车部署后 _repointSlaveMiner 会切到新建筑。
          if (this.miner.isVehicle && this.miner.isVehicle()) {
            if (object.tile !== this.miner.tile) {
              this.children.push(new MoveTask(this.game, this.miner.tile, false, { ignoredBlockers: [this.miner] }));
              return false;
            }
            // 已到矿车旁：等待并重扫（矿车可能很快部署）。
            this.children.push(new WaitMinutesTask(1 / 6));
            return false;
          }
          // 建筑形态（不动）：朝建筑走两格后重扫。
          const minerX = this.miner.tile.rx;
          const minerY = this.miner.tile.ry;
          let selfX = object.tile.rx;
          let selfY = object.tile.ry;
          let dx = minerX - selfX;
          let dy = minerY - selfY;
          const dist = Math.abs(dx) + Math.abs(dy);
          if (dist > 2) {
            let step = object.tile;
            if (dist > 0) {
              dx = Math.sign(dx);
              dy = Math.sign(dy);
            }
            for (let sd = 0, rx = selfX, ry = selfY; sd < 2 && (rx !== minerX || ry !== minerY); sd++) {
              let nx: number, ny: number;
              if (dx !== 0) {
                nx = rx + dx;
                ny = ry;
              } else {
                nx = rx;
                ny = ry + dy;
              }
              const candidate = this.game.map.tiles.getByMapCoords(nx, ny);
              if (candidate && 0 < this.game.map.terrain.getPassableSpeed(candidate, object.rules.speedType, true, false)) {
                step = candidate;
                rx = nx;
                ry = ny;
              }
            }
            if (step !== object.tile) {
              this.children.push(new MoveTask(this.game, step, false));
              return false;
            }
          }
          // 距离够近：等待并重试。
          this.children.push(new WaitMinutesTask(1 / 6));
          return false;
        }
        // 找到矿：锁定矿格并走过去。
        this.oreTile = oreFound;
        this._moveTargetTile = oreFound;
        object._oreLocked = true;
        this.state = 1 /* MOVING_TO_ORE */;
        this.children.push(new MoveTask(this.game, oreFound, false));
        return false;
      }
      case 1 /* MOVING_TO_ORE */:
        // 子任务（MoveTask）还在跑 → 等待；矿车是载具且挪了 >3 格 → 重扫。
        if (this.children.length) {
          try {
            if (this.miner && this.miner.isVehicle && this.miner.isVehicle() && this._moveTargetTile && this.miner.tile) {
              const chaseDx = this.miner.tile.rx - this._moveTargetTile.rx;
              const chaseDy = this.miner.tile.ry - this._moveTargetTile.ry;
              if (Math.abs(chaseDx) + Math.abs(chaseDy) > 3) {
                this.children = [];
                this.state = 0 /* SEEKING_ORE */;
                return false;
              }
            }
          } catch (er2) {}
          return false;
        }
        // 原版：到矿格不马上挖——先随机停顿"思考"一下。提前点亮
        // isHarvesting，让矿车的闲置计时在这段停顿（至多 5 秒）里不倒
        // 计时（防止过早收起）。
        object._oreLocked = false;
        object.isHarvesting = true;
        this.state = 6 /* IDLE_BEFORE_HARVEST */;
        this.children.push(new WaitMinutesTask(randInt(this.game, 0, 5) / 60));
        return false;
      case 6 /* IDLE_BEFORE_HARVEST */:
        if (this.children.length) {
          // "思考"时小概率随机转向（仅在有 prng 时，保证锁步确定性）。
          if (this.game.prng && this.game.prng.generateRandomInt && this.game.prng.generateRandomInt(1, 100) <= 5) {
            object.direction = randInt(this.game, 0, 360);
          }
          return false;
        }
        // 挖矿前面向矿格（tile 用 rx/ry；兼容历史 x/y 字段）。
        if (this.oreTile && object.tile) {
          const oreRx = this.oreTile.rx ?? this.oreTile.x;
          const oreRy = this.oreTile.ry ?? this.oreTile.y;
          const selfRx = object.tile.rx ?? object.tile.x;
          const selfRy = object.tile.ry ?? object.tile.y;
          if (oreRx !== selfRx || oreRy !== selfRy) {
            object.direction =
              ((-Math.atan2(oreRy - selfRy, oreRx - selfRx) * 180) / Math.PI - 90 + 720) % 360;
          }
        }
        // 环顾：附近有更高价值矿 → 改道（实现文档承诺的 IDLE 行为）。
        const scanRange = this.game.rules.general.slaveMinerSlaveScan || 4;
        const betterOre = this._findBetterOreNearby(object, scanRange);
        if (betterOre) {
          this.oreTile = betterOre;
          this._moveTargetTile = betterOre;
          object._oreLocked = true;
          this.state = 1 /* MOVING_TO_ORE */;
          this.children.push(new MoveTask(this.game, betterOre, false));
          return false;
        }
        object.isHarvesting = true;
        this.state = 2 /* HARVESTING */;
        this.children.push(new WaitMinutesTask(8 * this.game.rules.general.harvestRate));
        return false;
      case 2 /* HARVESTING */: {
        if (this.children.length) return false;
        // 装满（奴隶 Storage=3）或矿采完为止。
        const cargoFull = object.harvesterTrait
          ? object.harvesterTrait.isFull()
          : (this.cargoCount ?? 0) >= (object.rules.storage ?? 4);
        if (cargoFull) {
          // 容量满 → 返程卸货。
          if (object.harvesterTrait) object.harvesterTrait.status = 0;
          object.isHarvesting = false;
          object.isCarrying = true;
          this.state = 3 /* RETURNING */;
          return false;
        }
        const overlay = this.game.map.getGroundObjectsOnTile(object.tile).find((obj: any) => obj.isOverlay() && obj.isTiberium());
        const tiberiumTrait = overlay && overlay.traits ? overlay.traits.get(TiberiumTraitModule.TiberiumTrait) : undefined;
        if (tiberiumTrait && 0 < tiberiumTrait.getBailCount()) {
          const bailType = tiberiumTrait.collectBail();
          // 防最后一捆崩溃——collectBail() 对矿堆最后一捆返回
          // undefined；只统计非 undefined 的捆（与 GatherOreTask 一致）。
          if (bailType !== undefined) {
            this.cargo = bailType;
            this.cargoCount = (this.cargoCount ?? 0) + 1;
            if (object.harvesterTrait) object.harvesterTrait.addBails(bailType, 1);
          }
          if (tiberiumTrait.getBailCount() <= 0) this.game.unspawnObject(overlay);
          // 还有空间且本格还有矿 → 继续采（按采矿节奏分 tick）。
          if (!object.harvesterTrait?.isFull() && tiberiumTrait && 0 < tiberiumTrait.getBailCount()) {
            this.children.push(new WaitMinutesTask(8 * this.game.rules.general.harvestRate));
            return false;
          }
        }
        // 本格采完（或没矿）且还有空间 → 检查 8 邻格。
        if (object.harvesterTrait) object.harvesterTrait.status = 0;
        object.isHarvesting = false;
        let nextTile: any = undefined;
        const currentTile = object.tile;
        const neighbors = [
          this.game.map.tiles.getByMapCoords(currentTile.rx - 1, currentTile.ry),
          this.game.map.tiles.getByMapCoords(currentTile.rx + 1, currentTile.ry),
          this.game.map.tiles.getByMapCoords(currentTile.rx, currentTile.ry - 1),
          this.game.map.tiles.getByMapCoords(currentTile.rx, currentTile.ry + 1),
          this.game.map.tiles.getByMapCoords(currentTile.rx - 1, currentTile.ry - 1),
          this.game.map.tiles.getByMapCoords(currentTile.rx + 1, currentTile.ry - 1),
          this.game.map.tiles.getByMapCoords(currentTile.rx - 1, currentTile.ry + 1),
          this.game.map.tiles.getByMapCoords(currentTile.rx + 1, currentTile.ry + 1),
        ];
        for (let ni = 0; ni < neighbors.length; ni++) {
          const neighbor = neighbors[ni];
          if (neighbor && neighbor.landType === LandType.Tiberium && 0 < this.game.map.terrain.getPassableSpeed(neighbor, object.rules.speedType, true, false)) {
            const neighborOverlay = this.game.map.getGroundObjectsOnTile(neighbor).find((obj: any) => obj.isOverlay() && obj.isTiberium());
            const neighborTrait = neighborOverlay && neighborOverlay.traits ? neighborOverlay.traits.get(TiberiumTraitModule.TiberiumTrait) : undefined;
            if (neighborTrait && 0 < neighborTrait.getBailCount()) {
              nextTile = neighbor;
              break;
            }
          }
        }
        if (nextTile) {
          this.oreTile = nextTile;
          object._oreLocked = true;
          this.state = 1 /* MOVING_TO_ORE */;
          this.children.push(new MoveTask(this.game, nextTile, false));
          return false;
        }
        // 附近没有可达的矿了 → 带着已采的货返程。
        object.isCarrying = true;
        this.state = 3 /* RETURNING */;
        return false;
      }
      case 3 /* RETURNING */: {
        if (this.children.length) {
          // 走向矿车途中：矿车挪了 ≥3 格才重新寻路（每格都重规划会让
          // 奴隶卡在重复取消/重启的死循环里）。
          if (this.miner && !this.miner.isDisposed && !this.miner.isDestroyed) {
            const miner = this.miner;
            if (
              this._returnDoorTile &&
              (Math.abs(this._returnDoorTile.rx - miner.tile.rx) >= 3 || Math.abs(this._returnDoorTile.ry - miner.tile.ry) >= 3)
            ) {
              this._returnDoorTile = miner.tile;
              this.children = [];
              this.children.push(new MoveTask(this.game, miner.tile, false, { ignoredBlockers: [miner] }));
            }
          }
          return false;
        }
        if (!this.miner || this.miner.isDisposed || this.miner.isDestroyed) return true;
        const miner = this.miner;
        // 走位任务结束（或首次进入）——检查是否真的到了矿车格；
        // 没到（矿车挪了/刚开始返程）→ 朝当前格走。
        if (!this._returnDoorTile || object.tile.rx !== miner.tile.rx || object.tile.ry !== miner.tile.ry) {
          this._returnDoorTile = miner.tile;
          this.children.push(new MoveTask(this.game, miner.tile, false, { ignoredBlockers: [miner] }));
          return false;
        }
        // 已到矿车当前格 → 进入并卸货。
        object._enteringMiner = true;
        this.state = 4 /* DUMPING */;
        return false;
      }
      case 4 /* DUMPING */: {
        if (this.children.length) return false;
        if (!this.miner || this.miner.isDisposed || this.miner.isDestroyed) return true;
        // 矿车挪走了 → 回到返程态（别在旧位置卸货）。
        if (object.tile !== this.miner.tile) {
          object._enteringMiner = undefined;
          this.state = 3 /* RETURNING */;
          return false;
        }
        // 首次：入账并隐藏奴隶约 2 秒（用超时空定时代替销毁/重生）。
        if (!this._hideTimerStarted) {
          this._dump(object);
          object._enteringMiner = undefined;
          object.isCarrying = false;
          this._hideTimerStarted = true;
          if (object.warpedOutTrait) object.warpedOutTrait.setTimed(30, false, this.game);
          this.children.push(new WaitMinutesTask(2 / 60));
          return false;
        }
        // 等待结束：解除隐藏，继续采矿。
        this._hideTimerStarted = false;
        if (object.warpedOutTrait && object.warpedOutTrait.isActive()) object.warpedOutTrait.expire(this.game);
        this.state = 5 /* EXITING_MINER */;
        this._exitTicks = 180;
        return false;
      }
      case 5 /* EXITING_MINER */: {
        if (this.children.length) return false;
        if (!this.miner || this.miner.isDisposed || this.miner.isDestroyed) return true;
        // 超时：约 3 秒出不去 → 强制传送。
        if (this._exitTicks !== undefined && --this._exitTicks <= 0) {
          try {
            const miner = this.miner;
            const map = this.game.map;
            const speedType = object.rules.speedType;
            const foundation = miner.getFoundation();
            const finder = new RadialTileFinder(
              map.tiles,
              map.mapBounds,
              miner.tile,
              foundation,
              1,
              4,
              (tile: any) =>
                0 < map.terrain.getPassableSpeed(tile, speedType, true, false) &&
                Math.abs(tile.z - miner.tile.z) < 2 &&
                !map.terrain.findObstacles({ tile, onBridge: undefined }, object).length,
            );
            const forceTile = finder.getNextTile();
            if (forceTile) {
              object.position = forceTile.center;
              this._exitTicks = undefined;
              this.state = 0 /* SEEKING_ORE */;
              return false;
            }
          } catch (er3) {}
        }
        // 卸完货从矿车里走出来：找矿车周边一个空格走过去再继续采矿。
        const miner = this.miner;
        const map = this.game.map;
        const speedType = object.rules.speedType;
        const exitTile = new RadialTileFinder(
          map.tiles,
          map.mapBounds,
          miner.tile,
          miner.getFoundation(),
          1,
          4,
          (tile: any) =>
            0 < map.terrain.getPassableSpeed(tile, speedType, true, false) &&
            Math.abs(tile.z - miner.tile.z) < 2 &&
            !map.terrain.findObstacles({ tile, onBridge: undefined }, object).length,
        ).getNextTile();
        this.state = 0 /* SEEKING_ORE */;
        if (exitTile) {
          this.children.push(new MoveTask(this.game, exitTile, false));
          return false;
        }
        return false;
      }
    }
    return false;
  }

  /**
   * 卸货入账：按实际收割组合（矿+宝石）计价（harvesterTrait 缺失时
   * 回退到单一 cargo 字段）；每座有电的矿石精炼机按
   * general.purifierBonus 加成（与车辆矿车的 ReturnOreTask 一致）；
   * AI 按难度系数（0→×2，1→×1.5）调整后入账；最后清空货运 trait
   * 让矿石指示灯复位。
   */
  _dump(object: any): void {
    let total = 0;
    try {
      let entries = object.harvesterTrait ? object.harvesterTrait.getBails() : [];
      if (!entries.length && undefined !== this.cargo && 0 < (this.cargoCount ?? 0)) {
        entries = [[this.cargo, this.cargoCount]];
      }
      let base = 0;
      for (const [type, count] of entries) {
        const tiberiumRules = this.game.rules.getTiberium(type);
        base += (tiberiumRules ? tiberiumRules.value : 0) * count;
      }
      total = base;
      // 矿石精炼机加成（原版：矿主每座有电的精炼机加 floor(基础值 ×
      // purifierBonus)），与 ReturnOreTask 一致。
      let purifierCount = 0;
      if (this.miner && this.miner.owner) {
        purifierCount = [...this.miner.owner.buildings].filter(
          (building: any) =>
            building.rules.orePurifier && (!building.poweredTrait || !this.miner.owner.powerTrait?.isLowPower()),
        ).length;
      }
      const bonusRate = this.game.rules.general.purifierBonus || 0;
      if (purifierCount && bonusRate) total += purifierCount * Math.floor(base * bonusRate);
    } catch (err) {}
    if (0 < total && this.miner && this.miner.owner) {
      // AI 难度经济系数：简单 ×2，普通 ×1.5，困难不加成。
      if (this.miner.owner.isAi) {
        total = this.miner.owner.aiDifficulty === 0 ? Math.floor(total * 2) : this.miner.owner.aiDifficulty === 1 ? Math.floor(total * 1.5) : total;
      }
      this.miner.owner.credits += total;
      this.miner.owner.creditsGained += total;
    }
    // 清空货运 trait，让矿石指示灯复位。
    if (object.harvesterTrait) object.harvesterTrait.empty();
    this.cargo = undefined;
    this.cargoCount = 0;
  }
}
