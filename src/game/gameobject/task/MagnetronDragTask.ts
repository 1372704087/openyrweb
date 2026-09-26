/**
 * MagnetronDragTask — 磁电坦克磁场光束拖拽任务（原版《尤里的复仇》行为还原）。
 *
 * ── 证据来源 ────────────────────────────────────────────────────────────
 *  - 原版配置：rulesmd.ini 的
 *    `[CombatDamage] ;***Magnetron***` 段（FallingDamageMultiplier /
 *    CurrentStrengthDamage）与 `[Crush]` 弹头（Verses 11 档全 100%）；
 *  - 逆向：gamemd.exe（YR 1.001），伤害算式在 `UnitClass::vftable_1[0]`
 *    （sub_746100；AircraftClass 同槽位为 sub_41BC30），弹头取
 *    `Rules+0xFAC` = CrushWarhead，落点目标取"链接对象、为空则回落到自己"。
 *
 * ── 拖拽流程 ────────────────────────────────────────────────────────────
 *  - IsLocomotor=yes 弹头命中载具后，临时将目标的 Locomotor 替换为 Jumpjet，
 *    使其升空并拖向磁电。受害者变为空中单位（zone=Air），可被防空武器攻击，
 *    自身武器失效（战斗要塞内部乘员例外，仍可对外射击）；
 *  - 磁电持续开火（ROF=20）时每次命中刷新 locomotor，维持拖拽。磁电停止开火
 *    （死亡、新命令、目标被毁、超射程）时 locomotor 失效，受害者坠落；
 *  - 受害者被拖到磁电附近（2 格内）后，扔在磁电附近一个随机的、尽量空闲的格子上。
 *
 * ── 落地伤害（_applyDrop）───────────────────────────────────────────────
 *  1. 被砸者（落点格上的地面 techno）
 *       伤害 = 砸者**落地瞬间**血量 × FallingDamageMultiplier
 *     · base 由 CurrentStrengthDamage 决定：true（缺省）= 当前血量，false = 最大血量
 *     · 经 CrushWarhead 结算；`[Crush]` 的 Verses 全 100% → 与双方装甲类型无关
 *     · 车辆/船 **100%**、建筑 **200%**（建筑 ×2 由 `dmgFor()` 单独给，不来自 Verses）
 *  2. 砸者（被举起的单位）—— 独立的碾压判定，与伤害数值无关
 *     · 落点有**碾不动**的目标（`!canCrushObject`）→ 砸者自己吃同一份伤害，
 *       乘数 1.0 即秒杀 → 坦克砸坦克 = 同归于尽
 *     · 碾得动（坦克砸步兵）→ 砸者安全
 *     · 落在空地（无落点目标）→ 双方都无伤害
 *     · 判据实例：`[LTNK]` Lasher `Crusher=yes`；全表 29 个 `Crusher=yes` /
 *       9 个 `Crushable=yes`
 *
 * ── 落地边界（与坠落伤害并列的分支）─────────────────────────────────────
 *  A. 落点**不可停驻** → 直接秒杀，与坠落伤害是两套逻辑，且不计击杀归属
 *     · 地形：非两栖坦克入水、舰船搁浅、悬崖（`getPassableSpeed <= 0`）
 *     · 障碍：落点上的树木、路灯等 overlay（`findObstacles` 过滤成 overlay）
 *     · 障碍物本身免疫：命中该分支就提前 return，压根不进碾压结算
 *     ⚠ 落点**有建筑**时必须走碾压路径：建筑占用格会让
 *       `Terrain.getPassableSpeed` 因 `isBlockerObject` 返回 0，若不先摘掉建筑
 *       就会被误判成"不可停驻" → 表现为"坦克爆了、建筑零伤害"。
 *       载具不是 blocker，所以坦克砸坦克不受影响。见 `_isUnstandable`。
 *  B. `Crashable=yes` → 走自身坠毁，**不结算落点坠落伤害**
 *     · 名单：JUMPJET / LUNR / DISK / SHAD / HIND / SCHP / SCHD / ZEP
 *       （Rocketeer、飞碟、直升机、基洛夫…）
 *     · 战机（入侵者/黑鹰等，无此标）→ 按普通坠落伤害
 *  C. 落点是**有坦克驻守的坦克碉堡**（`tankBunkerTrait.bunkeredVehicle` 非空）
 *     → 坠落伤害归零：既不打碉堡，也不穿透给内部坦克；坠毁伤害不受此限制
 *  D. 落点是建筑 → 见 A 的 ⚠，走碾压（建筑 200% + 砸者自爆）
 *  E. 落水 → `DeathType.Sink` 沉没摧毁（`_applyDrop` 末尾另留一道兜底）
 *  F. 碾压击杀的经验/计分归**磁电**，不是砸者（`attackerInfo.obj = magnetron`）
 *  G. 战斗要塞等**地面**运输载具在空中被毁 → 乘员幸存落地
 *     （`TransportTrait.onDestroy` 判 `isAircraft()` 而非 `zone === ZoneType.Air`）
 *
 * ── 不复现的两处原版引擎 bug ────────────────────────────────────────────
 *  · 低空（高度 <≈ 208）双倍伤害：本实现每次落地只结算一次，天然不复现；
 *  · `BalloonHover` 的 JumpJet 被拖拽时落到攻击者头上、坠落伤害误用 DeathWeapon
 *    ——资料标注为"错误"，故不照搬，仍走 FallingDamageMultiplier。
 *  注：`DeathWeapon` 的"坠毁伤害"发射链在本引擎尚未落地（`armedTrait.deathWeapon`
 *  目前仅 CAOS 神经毒气与 `selectSpecialWeapon` 的自杀弹头在用），因此
 *  Crashable 单位只做到"不结算落点伤害 + 自身正常销毁"。
 *
 * ── 本引擎实现说明 ──────────────────────────────────────────────────────
 *  - 直接编辑受害者位置（不使用真实 Jumpjet locomotor），但正确模拟 zone=Air、
 *    事件分发（ObjectLiftOffEvent / ObjectLandEvent）和落地碾压结算；
 *  - AttackTask 的 magDragging 标志跳过 canTarget 检查，磁电的纯对地
 *    MagneticBeam 武器在受害者变为 Air 后仍能持续锁定目标；
 *  - 拖拽持续判定：磁电存在指向受害者的活跃 AttackTask（近似"持续开火即拖拽"）；
 *    另含原版拉扯上限——**平面**（x/z）绳长自 `onStart` 的起吸基线拉大超过半格
 *    才断（量纲来自"6×单格对角线"；量 3D 会被爬升高度污染 → 斜坡上误断束）；
 *  - 碾压致死的爆炸必须由 `WarheadDetonateEvent` 提供：`Vehicle.onRemove` 对
 *    `DeathType.Crush` 直接 return（约定由弹头播），否则血量归零后渲染体被直接
 *    摘掉，表现成"死了却没有爆炸动画"；
 *  - `_forceDestroyObject` 无攻击者时必须传 `undefined` 而非 `{obj: undefined}`：
 *    `Game.destroyObject` 靠 `!attacker` 短路跳过计分，传真值会走到
 *    `attacker.player.addUnitsKilled` 抛 TypeError、打断整条销毁链 → 单位凭空消失；
 *  - 自包含：每 tick 直接驱动受害者位置，不派生 MoveTask 子任务；保持
 *    moveTrait.moveState = Idle 使 MoveTrait.NotifyTick 休眠；
 *  - onEnd 在 `_aborted` 时只回滚本任务建立的状态，不动别人的拖拽链接。
 *
 * 拖拽物理参数：巡航高度 500 leptons、爬升 20/tick、水平漂移 20/tick、
 * 重力 4/tick²、拖近到 2 格内寻找落点（半径 2 格搜索）、`_maxTicks = 300` 兜底。
 *
 * 回归由 tests/ts-parity.mjs 的 9 条探针锁住（含落地伤害契约、斜坡起吸、
 * 落地边界四条与建筑落点）。孪生 .ts.js 已删除，本文件是唯一修改目标。
 */
import { Task } from "game/gameobject/task/system/Task"; // 已转换
import * as RandomTileFinderModule from "game/map/tileFinder/RandomTileFinder"; // 未转换（any-shim）
import { Coords } from "game/Coords"; // 已转换
import { Vector2 } from "game/math/Vector2"; // 已转换
import { Vector3 } from "game/math/Vector3"; // 已转换
import { ZoneType, getZoneType } from "game/gameobject/unit/ZoneType"; // 已转换
import { MoveState } from "game/gameobject/trait/MoveTrait"; // 已转换
import * as ObjectLandEventModule from "game/event/ObjectLandEvent"; // 未转换（any-shim）
import * as ObjectLiftOffEventModule from "game/event/ObjectLiftOffEvent"; // 未转换（any-shim）
import { DeathType } from "game/gameobject/common/DeathType"; // 已转换
import { LandType } from "game/type/LandType"; // 已转换
import { SpeedType } from "game/type/SpeedType"; // 已转换
import { Warhead } from "game/Warhead"; // 已转换
import * as WarheadDetonateEventModule from "game/event/WarheadDetonateEvent"; // 未转换（any-shim）
import { AttackState } from "game/gameobject/trait/AttackTrait"; // 已转换

// 拖拽物理参数。
const CRUISE_HEIGHT = 500; // 地面以上 leptons
const CLIMB_RATE = 20; // leptons/帧 爬升速度
const HORIZ_SPEED = 20; // leptons/帧 水平漂移速度
const FALL_GRAVITY = 4; // leptons/帧² 重力加速度
const DRAG_DIST_TILES = 2; // 到达此距离内时寻找落点
const DROP_SEARCH_RADIUS = 2; // 落点搜索半径（格）

// 原版拉扯上限（gamemd.exe WaveClass::Update_Wave 的 dbl_B45D80×6）：
// √(2×256²)×6 ≈ 2172 lepton ≈ 8.5 格。语义是"拖拽持续中距离被拉大才
// 断"（往回拖的绳子长度），不是起吸距离检查——磁电射程 12 格，起吸距离
// 本来就常超 8.5 格，静态检查会在起吸瞬间误断束（v1.0 翻车点）。
// 量纲是**平面**（x/z）距离：来自"单格对角线"，不含高度。用 3D 距离时
// 磁电在低处、受害者爬升到 500 lepton 巡航高度会让距离单调变大，把半格
// 迟滞整段吃掉 → 斜坡地形上爬升到一半就误断束（v1.1 翻车点）。
const BEAM_BREAK_LEPTONS = Math.sqrt(2 * Coords.LEPTONS_PER_TILE * Coords.LEPTONS_PER_TILE) * 6;

/* eslint-disable @typescript-eslint/no-explicit-any */
export class MagnetronDragTask extends Task {
  game: any;
  victim: any;
  magnetron: any;
  _tickCount: number;
  _dropped: boolean;
  _dropping: boolean;
  _fallSpeed: number;
  _dropTile: any;
  _movingToDrop: boolean;
  /** 安全上限（约 20 秒）。超时但仍在空中时，onEnd 强制落地。 */
  _maxTicks: number;
  _aborted: boolean;
  /** 拉扯上限的绳长基线（平面 lepton）：onStart 记起吸距离，之后只降不升。 */
  _minDragDist: number;

  constructor(game: any, victim: any, magnetron: any) {
    super();
    this.game = game;
    this.victim = victim;
    this.magnetron = magnetron;
    this._tickCount = 0;
    this._dropped = false;
    this._dropping = false;
    this._fallSpeed = 0;
    this._dropTile = null;
    this._movingToDrop = false;
    this._maxTicks = 300;
    this._minDragDist = Number.POSITIVE_INFINITY;
    this.cancellable = true;
    this.blocking = true;
    this.preventOpportunityFire = true;
  }

  /**
   * 启动：受害者有效性校验（不存在/已销毁/缺移动特性/已被其它磁电
   * 拖拽 → 中止）；将受害者置为空中单位（zone=Air）并派发升空事件，
   * 建立双向链接（victim.magnetronDraggedBy / magnetron.magnetronDragging，
   * 后者供磁电渲染器绘制持续牵引光束），保持 MoveTrait 休眠。
   */
  onStart(unit: any): void {
    const victim = this.victim;
    if (!victim || victim.isDisposed || victim.isDestroyed) {
      this._aborted = true;
      return;
    }
    if (!victim.moveTrait || !victim.unitOrderTrait) {
      this._aborted = true;
      return;
    }
    if (victim.magnetronDraggedBy) {
      this._aborted = true;
      return;
    }
    // 原版 YR：IsLocomotor 弹头将受害者的 Locomotor 替换为 Jumpjet，
    // 使其变为空中单位。AttackTask 的 magDragging 标志已跳过 canTarget
    // 检查，磁电的纯对地武器在受害者变为 Air 后仍能持续锁定。
    victim.zone = ZoneType.Air;
    victim.onBridge = false;
    try {
      this.game.events.dispatch(new ObjectLiftOffEventModule.ObjectLiftOffEvent(victim));
    } catch (err) {}
    victim.magnetronDraggedBy = this.magnetron;
    // 反向链接：磁电渲染器（MagnetronBeamPlugin）读取此字段绘制光束。
    this.magnetron.magnetronDragging = victim;
    // 绳长基线 = 起吸瞬间的平面距离。此后只有"拖拽中被拉大"才断束：
    // 爬升只改高度、不改平面距离，因此高差不会污染基线。
    try {
      const a = this.magnetron.position.worldPosition;
      const b = victim.position.worldPosition;
      const d = Math.hypot(b.x - a.x, b.z - a.z);
      if (Number.isFinite(d)) this._minDragDist = d;
    } catch (err) {}
    // 保持 MoveTrait 休眠，不干扰直接位置编辑。
    try {
      victim.moveTrait.locomotor = undefined;
      victim.moveTrait.moveState = MoveState.Idle;
      if (victim.moveTrait.velocity) victim.moveTrait.velocity.set(0, 0, 0);
    } catch (err) {}
  }

  /** 每 tick 驱动拖拽/坠落物理（见类注释）。 */
  onTick(unit: any): boolean {
    if (this._aborted) return true;
    const victim = this.victim;
    if (!victim || victim.isDisposed || victim.isDestroyed) {
      return true;
    }
    if (++this._tickCount > this._maxTicks) {
      return true;
    }
    // 坠落阶段——仅驱动重力下落。
    if (this._dropping) {
      return this._descend(victim);
    }
    const magnetron = this.magnetron;
    const magnetronGone = !magnetron || magnetron.isDisposed || magnetron.isDestroyed;
    if (magnetronGone) {
      // 磁电没了 → 断束坠落。
      this._startDrop(magnetron, victim);
      return this._descend(victim);
    }
    if (this._isBeamBroken(magnetron, victim)) {
      this._startDrop(magnetron, victim);
      return this._descend(victim);
    }
    // 光束活跃：保持磁电视觉上持续开火（连续光束）。
    magnetron.isFiring = true;
    // 若正在移向落点格子，继续水平移动。
    if (this._movingToDrop && this._dropTile) {
      this._moveToDropTile(victim, magnetron);
      if (this._dropping) return this._descend(victim);
      return false;
    }
    // 爬升到巡航高度并向磁电水平漂移。
    this._liftAndDrag(victim, magnetron);
    if (this._dropping) return this._descend(victim);
    return false;
  }

  /** 磁场光束期间：将受害者提升到巡航高度并水平拉向磁电。 */
  _liftAndDrag(victim: any, magnetron: any): void {
    const pos = victim.position;
    const beforeTile = victim.tile;
    const worldY = pos.worldPosition.y;
    const groundY = this._groundWorldY(victim);
    const targetY = groundY + CRUISE_HEIGHT;
    if (worldY < targetY - 0.5) {
      // 爬升阶段：向巡航高度上升。无水平移动，无浮动。
      const dy = Math.min(CLIMB_RATE, targetY - worldY);
      try {
        pos.moveByLeptons3(new Vector3(0, dy, 0));
      } catch (err) {}
      this._syncTile(victim, beforeTile);
      return;
    }
    // 巡航高度——向磁电水平拖拽。
    let dx = 0;
    let dz = 0;
    if (magnetron && magnetron.position) {
      const victimPos = pos.getMapPosition();
      const magnetronPos = magnetron.position.getMapPosition();
      // 取不到地图坐标（_tile 为空）会直接抛到 onTick 之外，这里是主要嫌疑点之一。
      if (!victimPos || !magnetronPos) {
        this._syncTile(victim, beforeTile);
        return;
      }
      const hx = magnetronPos.x - victimPos.x;
      const hz = magnetronPos.y - victimPos.y;
      const hlen = Math.hypot(hx, hz);
      const minSep = DRAG_DIST_TILES * Coords.LEPTONS_PER_TILE;
      // 已拖到磁电附近——寻找随机落点（原版行为）。
      if (hlen <= minSep + 0.01) {
        this._initiateDrop(victim, magnetron);
        return;
      }
      const want = Math.max(0, hlen - minSep);
      const step = Math.min(HORIZ_SPEED, want);
      if (hlen > 0.001 && step > 0) {
        dx = (hx / hlen) * step;
        dz = (hz / hlen) * step;
      }
    }
    if (dx !== 0 || dz !== 0) {
      try {
        pos.moveByLeptons3(new Vector3(dx, 0, dz));
      } catch (err) {}
    }
    this._syncTile(victim, beforeTile);
    // 在巡航高度上叠加波浪浮动效果（约 5 秒一个完整起伏周期）。
    const floatAmplitude = 30;
    const floatFrequency = 0.02094;
    const floatOffset = floatAmplitude * Math.sin(this._tickCount * floatFrequency);
    let finalY = targetY + floatOffset;
    if (finalY < groundY + 10) finalY = groundY + 10;
    try {
      pos.setAbsoluteElevationWorld(finalY);
    } catch (err) {}
  }

  /** 受害者到达磁电附近：寻找随机空闲落点并开始移向该格。 */
  _initiateDrop(victim: any, magnetron: any): void {
    const dropTile = this._findDropTile(magnetron);
    if (dropTile) {
      this._dropTile = dropTile;
      this._movingToDrop = true;
    } else {
      // 未找到空闲格子——就地落下。
      this._dropping = true;
      this._fallSpeed = 0;
      this._startDrop(magnetron, victim);
    }
  }

  /** 向落点格子水平移动（巡航高度不变），到格子上方开始坠落。 */
  _moveToDropTile(victim: any, magnetron: any): void {
    const pos = victim.position;
    const beforeTile = victim.tile;
    const targetTile = this._dropTile;
    if (!targetTile) {
      this._dropping = true;
      this._fallSpeed = 0;
      this._startDrop(magnetron, victim);
      return;
    }
    // 落点格子的世界坐标中心。
    const targetLeptons = new Vector2(
      targetTile.rx * Coords.LEPTONS_PER_TILE + Coords.LEPTONS_PER_TILE / 2,
      targetTile.ry * Coords.LEPTONS_PER_TILE + Coords.LEPTONS_PER_TILE / 2,
    );
    const victimPos = pos.getMapPosition();
    if (!victimPos) {
      return;
    }
    const dx = targetLeptons.x - victimPos.x;
    const dz = targetLeptons.y - victimPos.y;
    const hlen = Math.hypot(dx, dz);
    if (hlen <= HORIZ_SPEED + 0.01) {
      // 到达落点格子上方——开始坠落。
      try {
        pos.moveByLeptons3(new Vector3(dx, 0, dz));
      } catch (err) {}
      this._syncTile(victim, beforeTile);
      this._dropping = true;
      this._fallSpeed = 0;
      this._startDrop(magnetron, victim);
      return;
    }
    const step = Math.min(HORIZ_SPEED, hlen);
    if (hlen > 0.001 && step > 0) {
      try {
        pos.moveByLeptons3(new Vector3((dx / hlen) * step, 0, (dz / hlen) * step));
      } catch (err) {}
    }
    this._syncTile(victim, beforeTile);
    // 保持巡航高度 + 浮动。
    const groundY = this._groundWorldY(victim);
    const targetY = groundY + CRUISE_HEIGHT;
    const floatAmplitude = 30;
    const floatFrequency = 0.02094;
    const floatOffset = floatAmplitude * Math.sin(this._tickCount * floatFrequency);
    let finalY = targetY + floatOffset;
    if (finalY < groundY + 10) finalY = groundY + 10;
    try {
      pos.setAbsoluteElevationWorld(finalY);
    } catch (err) {}
  }

  /**
   * 在磁电附近找一个随机的空闲地面格子作为落点。
   * 缺 prng 时用确定性回退（始终取候选下界），避免联机/回放分叉。
   */
  _findDropTile(magnetron: any): any {
    try {
      const game = this.game;
      const victim = this.victim;
      const rng =
        game.prng && game.prng.generateRandomInt
          ? game.prng
          : {
              generateRandomInt: function (a: number, _b: number) {
                return a;
              },
            };
      const finder = new RandomTileFinderModule.RandomTileFinder(
        game.map.tiles,
        game.map,
        magnetron.tile,
        DROP_SEARCH_RADIUS,
        rng,
        (tile: any) => {
          if (!tile) return false;
          // 排除被其他地面 techno 占据的格子。
          const objs = game.map.tileOccupation.getGroundObjectsOnTile(tile);
          for (let i = 0; i < objs.length; i++) {
            const o = objs[i];
            if (o !== victim && o.isTechno && o.isTechno()) return false;
          }
          return true;
        },
        false, // includeStartTile
        true, // checkBounds
      );
      return finder.getNextTile();
    } catch (err) {
      return null;
    }
  }

  /**
   * 判断磁电是否已不再主动攻击此受害者（近似原版"持续开火即拖拽"：
   * 存在以该受害者为目标的活跃 AttackTask 时光束存活）。
   *
   * 另含原版拉扯上限（WaveClass::Update_Wave 的 6×单格对角线 ≈ 8.5 格，
   * 见 _isRopeSnapped）。两段判定各自 try/catch：绳长那段的异常只代表
   * "这一帧不算绳长"，**不能**连坐后面的存活判定——否则一次 TypeError
   * 就会被当成断束，直接把满血坦克摔死。
   */
  _isBeamBroken(magnetron: any, victim: any): boolean {
    if (!magnetron || magnetron.isDisposed || magnetron.isDestroyed) {
      return true;
    }
    let ropeSnapped = false;
    try {
      ropeSnapped = this._isRopeSnapped(magnetron, victim);
    } catch (err) {}
    if (ropeSnapped) {
      let d = "?";
      try {
        const a = magnetron.position.worldPosition;
        const b = victim.position.worldPosition;
        d = Math.hypot(b.x - a.x, b.z - a.z).toFixed(0);
      } catch (e) {}
      return true;
    }
    try {
      const unitOrderTrait = magnetron.unitOrderTrait;
      if (unitOrderTrait) {
        const tasks = unitOrderTrait.getTasks();
        for (let ti = 0; ti < tasks.length; ti++) {
          const t = tasks[ti];
          if (t && !t.isCancelling() && t.target && t.target.obj === victim && typeof t.getWeapon === "function") {
            return false;
          }
        }
      }
      // 没找到"以该受害者为目标的活跃 AttackTask"→ 判死。把现场摊开，
      // 用来分辨到底是任务没了、target 不是这个受害者、还是被挪到
      // attackTrait.opportunityFireTask（不在 unitOrderTrait 队列里）。
      const at = magnetron.attackTrait;
      return true;
    } catch (err) {}
    return true;
  }

  /**
   * 原版拉扯上限：受害者离地后，磁电↔受害者的**平面**（x/z）绳长自
   * `_minDragDist` 基线拉大超过半格即断。
   *
   * 必须量平面而不是 3D：爬升只增加高度，磁电在低处时 3D 距离会随爬升
   * 单调变大，把半格迟滞整段吃掉，导致斜坡地形上起吸到一半就误断束。
   */
  _isRopeSnapped(magnetron: any, victim: any): boolean {
    const pos = victim.position;
    if (!pos || !magnetron.position) return false;
    const worldY = pos.worldPosition.y;
    const groundY = this._groundWorldY(victim);
    // 未离地（含起吸前）没有绳子可言。
    if (!Number.isFinite(worldY) || !Number.isFinite(groundY) || worldY <= groundY + 100) return false;
    const a = magnetron.position.worldPosition;
    const b = pos.worldPosition;
    const dist = Math.hypot(b.x - a.x, b.z - a.z);
    if (!Number.isFinite(dist)) return false;
    if (dist < this._minDragDist) this._minDragDist = dist;
    return dist > BEAM_BREAK_LEPTONS && dist > this._minDragDist + Coords.LEPTONS_PER_TILE / 2;
  }

  /**
   * 标记光束断裂：清除磁电拖拽状态、停止视觉光束，并取消仍以该受害者
   * 为目标的 AttackTask（磁电不再重新攻击已落地的受害者）。
   */
  _startDrop(magnetron: any, victim: any): void {
    if (!magnetron || magnetron.magnetronDragging !== victim) {
      return;
    }
    magnetron.magnetronDragging = undefined;
    magnetron.isFiring = false;
    try {
      const unitOrderTrait = magnetron.unitOrderTrait;
      if (unitOrderTrait) {
        const tasks = unitOrderTrait.getTasks();
        for (let ti = 0; ti < tasks.length; ti++) {
          const t = tasks[ti];
          if (t && !t.isCancelling() && t.target && t.target.obj === victim && typeof t.getWeapon === "function") {
            t.cancel();
          }
        }
      }
      if (magnetron.attackTrait) {
        const currentTarget = magnetron.attackTrait.currentTarget;
        if (!currentTarget || currentTarget.obj === victim) {
          magnetron.attackTrait.currentTarget = undefined;
          magnetron.attackTrait.attackState = AttackState.Idle;
        }
      }
    } catch (err) {}
  }

  /** 坠落阶段：重力加速下落，触地后恢复 zone 并做落地结算。 */
  _descend(victim: any): boolean {
    if (this._dropped) return true;
    this._dropping = true;
    const pos = victim.position;
    const groundY = this._groundWorldY(victim);
    let worldY = pos.worldPosition.y;
    // 兜底：坐标被写成非有限值 → 拉回地面基准，杜绝穿图。
    if (!Number.isFinite(worldY)) {
      worldY = Number.isFinite(groundY) ? groundY + 100 : 500;
      try {
        pos.setAbsoluteElevationWorld(worldY);
      } catch (err) {}
    }
    // 兜底：已低于地面（任何原因）→ 立即贴地，不允许留在地图下面。
    if (Number.isFinite(groundY) && worldY < groundY - 1) {
      this._dropped = true;
      this._fallSpeed = 0;
      try {
        pos.tileElevation = 0;
      } catch (err) {}
      this._restoreZone(victim);
      this._applyDrop(victim, this.game);
      return true;
    }
    if (Number.isFinite(groundY) && worldY > groundY + 0.5) {
      this._fallSpeed += FALL_GRAVITY;
      const step = Math.min(this._fallSpeed, worldY - groundY);
      try {
        pos.setAbsoluteElevationWorld(worldY - step);
      } catch (err) {}
      return false;
    }
    // 贴地走引擎规范路径：tileElevation=0 按 tile 内偏移做斜坡插值，
    // 落点与可视地表一致（tile.z 平铺基准高度在坡地上会陷进地形）。
    this._dropped = true;
    this._fallSpeed = 0;
    try {
      pos.tileElevation = 0;
    } catch (err) {}
    // 原版 YR：落地时恢复 zone=Ground，分发 ObjectLandEvent。
    this._restoreZone(victim);
    this._applyDrop(victim, this.game);
    return true;
  }

  /** 恢复受害者的 zone 为地面（按落点地形，含桥面）。 */
  _restoreZone(victim: any): void {
    try {
      const tile = victim.tile;
      let landType: any = null;
      if (tile) {
        landType = tile.onBridgeLandType != null ? tile.onBridgeLandType : tile.landType;
        victim.zone = getZoneType(landType);
      } else {
        victim.zone = ZoneType.Ground;
      }
      this.game.events.dispatch(new ObjectLandEventModule.ObjectLandEvent(victim));
    } catch (err) {}
  }

  /**
   * 受害者所在处的地面世界高度。走引擎路径（tileElevation=0 → 重算世界
   * 坐标）获得含斜坡插值的贴地高度——tile.z 的平铺基准高度在坡地上偏低，
   * 直接用它当落点会陷进地形。取完立即恢复受害者的绝对高度。
   */
  _groundWorldY(victim: any): number {
    const pos = victim.position;
    if (!pos || !pos.tile) return 0;
    try {
      const abs = pos.worldPosition.y;
      if (!Number.isFinite(abs)) return 0;
      pos.tileElevation = 0;
      const groundY = pos.worldPosition.y;
      pos.setAbsoluteElevationWorld(abs);
      return Number.isFinite(groundY) ? groundY : 0;
    } catch (err) {
      const tile = victim.tile;
      return tile ? Coords.tileHeightToWorld(tile.z) : 0;
    }
  }

  /** 漂移过程中保持受害者在当前格子上的注册（跨格时迁移占据）。 */
  _syncTile(victim: any, beforeTile: any): void {
    try {
      const after = victim.tile;
      if (beforeTile && after && (beforeTile.rx !== after.rx || beforeTile.ry !== after.ry)) {
        this.game.map.tileOccupation.unoccupyTileRange(beforeTile, victim);
        this.game.map.tileOccupation.occupyTileRange(after, victim);
        if (this.game.map.technosByTile) this.game.map.technosByTile.updateObject(victim);
      }
    } catch (err) {
      // 占位迁移失败会让受害者"悬空"在旧格子上，属于要盯的异常。
    }
  }

  /**
   * 落地结算。规则源：rulesmd.ini `[CombatDamage] ;***Magnetron***`
   * （`FallingDamageMultiplier` / `CurrentStrengthDamage` 决定砸下去的伤害量）
   * + gamemd.exe 逆向（`UnitClass::vftable_1[0]` 算出 `base × FallingDamageMultiplier`
   * 后经 `Rules+0xFAC` = CrushWarhead 打给落点对象，**目标为空时回落到对象自己**）：
   *  - base = CurrentStrengthDamage ? 当前血量 : 最大血量；
   *  - 落点地面 techno：CrushWarhead 碾压，伤害 = base × FallingDamageMultiplier
   *    （装甲倍率走 Crush 的 Verses）；
   *  - 落点上有砸者**碾不动**的目标（`!canCrushObject`）→ 砸者自己也吃同一份
   *    伤害（≈自身体量，乘数 1.0 即秒杀）；碾得动（坦克砸步兵）或空地落点
   *    则自身安全——这就是"坦克砸坦克同归于尽、坦克砸步兵安然无恙"的分叉；
   *  - 非两栖落水 → DeathType.Sink 摧毁。
   */
  _applyDrop(victim: any, game: any): void {
    try {
      if (!victim || victim.isDisposed || victim.isDestroyed || !victim.healthTrait) {
        return;
      }
      // ① 原版：落点不可停驻（非两栖坦克落水 / 舰船搁浅 / 悬崖）→ 直接秒杀。
      // 这是与坠落伤害**平行的另一套逻辑**，先于一切碾压结算。
      if (this._isUnstandable(victim, game)) {
        try {
          if (victim.tile && victim.tile.landType === LandType.Water) victim.deathType = DeathType.Sink;
        } catch (err) {}
        this._forceDestroyObject(victim, game);
        return;
      }
      const combatDamage = game.rules && game.rules.combatDamage;
      const multiplier = combatDamage ? combatDamage.fallingDamageMultiplier : 1;
      const useCurrent = combatDamage ? combatDamage.currentStrengthDamage : true;
      const baseStrength = useCurrent ? victim.healthTrait.getHitPoints() : victim.healthTrait.maxHitPoints;
      const crushDamage = Math.max(0, Math.round(baseStrength * (multiplier == null ? 1 : multiplier)));
      // 原版：被砸者吃"砸者落地瞬间的血量"，车辆/船 100%、建筑 200%，
      // 与双方装甲类型无关（[Crush] 的 Verses 11 档全 100%，所以继续走
      // computeDamage 不会引入装甲差异，只补建筑这一档）。
      const dmgFor = (t: any) => (t && t.isBuilding && t.isBuilding() ? crushDamage * 2 : crushDamage);
      // ② Crashable=yes（JUMPJET/HIND/ZEP/DISK 等跳跃机与直升机、基洛夫、
      // 飞碟）砸下走**自身坠毁**，不结算落点坠落伤害；战机（Aircraft，无此标）
      // 按普通坠落伤害。见 rulesmd Crashable 名单。
      const isCrashable = !!(victim.rules && victim.rules.crashable);
      if (isCrashable) {
        // 自身坠毁：不伤落点，只销毁自己（Explodes+DeathWeapon 的单位会由
        // Vehicle.onRemove 跳过通用爆炸，改走它自己的死亡武器）。
        this._forceDestroyObject(victim, game);
        return;
      }
      // 碾压所有站在落点格子上的地面 techno。
      const targets = [];
      try {
        const onTile = game.map.tileOccupation.getGroundObjectsOnTile(victim.tile) || [];
        for (let oi = 0; oi < onTile.length; oi++) {
          const o = onTile[oi];
          if (!o || o === victim || o.isDestroyed) continue;
          if (!o.isTechno || !o.isTechno()) continue;
          if (!o.healthTrait) continue;
          targets.push(o);
        }
      } catch (err) {}
      if (targets.length) {
        const crushWarheadName = (combatDamage && combatDamage.crushWarhead) || "Crush";
        let crushWarhead: any = undefined;
        try {
          const warheadRules = game.rules.getWarhead && game.rules.getWarhead(crushWarheadName);
          if (warheadRules) crushWarhead = new Warhead(warheadRules);
        } catch (err) {}
        // ⑦ 经验/击杀归属磁电：这些击杀是磁电造成的，不是砸者自己打的。
        const killer =
          this.magnetron && !this.magnetron.isDisposed && !this.magnetron.isDestroyed && this.magnetron.owner
            ? this.magnetron
            : victim;
        const attackerInfo = { obj: killer, player: killer.owner, weapon: undefined };
        // 原版规则：落点上有砸者**碾不动**的目标时，砸者自己也要吃同一份伤害
        // （≈自身体量 → 秒杀）；碾得动（坦克砸步兵）或空地则自身安全。
        let crushedBack = false;
        for (let ti = 0; ti < targets.length; ti++) {
          const target = targets[ti];
          try {
            if (target.isInfantry && target.isInfantry()) target.infDeathType = 0;
            // ⑤ 坦克碉堡有坦克驻守 → 这次**坠落伤害**直接归零（既不打碉堡，
            // 也不穿透给里面的坦克）；坠毁伤害不受此限制。
            const bunkered =
              !!(target.isBuilding && target.isBuilding() && target.tankBunkerTrait && target.tankBunkerTrait.bunkeredVehicle);
            if (bunkered) {
              // 落点仍在碉堡上，只是不吃伤害；碾压判定照走（碉堡不可碾）。
            } else {
              target.deathType = DeathType.Crush;
              if (crushWarhead && crushWarhead.computeDamage && crushWarhead.inflictDamage) {
                const reduced = crushWarhead.computeDamage(dmgFor(target), target, game);
                this._playCrushExplosion(crushWarhead, reduced, target, game);
                crushWarhead.inflictDamage(reduced, target, attackerInfo, game);
              } else {
                // 取不到 CrushWarhead 时退回直伤：载具按 Normal 死法走常规爆炸，
                // 免得被 DeathType.Crush 挡掉动画。
                if (target.isVehicle && target.isVehicle()) target.deathType = DeathType.Normal;
                target.healthTrait.inflictDamage(dmgFor(target), attackerInfo, game);
                if ((target.healthTrait && target.healthTrait.getHitPoints() <= 0) || target.isDestroyed) {
                  this._forceDestroyObject(target, game, attackerInfo);
                }
              }
            }
            if (victim.canCrushObject && !victim.canCrushObject(target)) crushedBack = true;
          } catch (err) {}
        }
        if (crushedBack && !victim.isDestroyed && victim.healthTrait) {
          if (crushWarhead && crushWarhead.computeDamage && crushWarhead.inflictDamage) {
            victim.deathType = DeathType.Crush;
            const selfDmg = crushWarhead.computeDamage(dmgFor(victim), victim, game);
            this._playCrushExplosion(crushWarhead, selfDmg, victim, game);
            // 不带 attacker：砸自己不该计入任何一方的击杀统计。
            crushWarhead.inflictDamage(selfDmg, victim, undefined, game);
          } else {
            victim.deathType = DeathType.Normal;
            victim.healthTrait.inflictDamage(dmgFor(victim), { obj: undefined }, game);
            if ((victim.healthTrait && victim.healthTrait.getHitPoints() <= 0) || victim.isDestroyed) {
              this._forceDestroyObject(victim, game);
            }
          }
        }
      }
      // 非两栖载具在水格上 → 直接摧毁（沉没）。有碾压对象时落点仍是该格，同样适用。
      if (
        !victim.isDestroyed &&
        victim.tile &&
        victim.tile.landType === LandType.Water &&
        victim.rules &&
        victim.rules.speedType !== SpeedType.Amphibious
      ) {
        try {
          victim.deathType = DeathType.Sink;
          this._forceDestroyObject(victim, game);
        } catch (err) {}
      }
    } catch (err) {}
  }

  /**
   * 碾压致死的爆炸表现。`Vehicle.onRemove` 对 `DeathType.Crush` 直接 return
   * （约定爆炸由弹头事件提供，避免重播），所以只调 `inflictDamage` 的话，
   * 血量归零后渲染体会被直接摘掉 → 看起来"死了却没爆炸"。这里仿
   * `MoveTrait` 的碾压链路，致死前先派发 `WarheadDetonateEvent`。
   * 非载具（步兵/建筑）不走这条：步兵被碾本就无动画，建筑由
   * `Building.onRemove` 自己播爆炸。
   */
  private _playCrushExplosion(warhead: any, damage: number, target: any, game: any): void {
    try {
      if (!target.isVehicle || !target.isVehicle() || !target.healthTrait) return;
      if (!(damage >= target.healthTrait.getHitPoints())) return;
      const pos = target.position.worldPosition.clone();
      const animName = warhead.pickExplodeAnim(damage, target, ZoneType.Ground, game, false);
      if (animName) {
        game.events.dispatch(new WarheadDetonateEventModule.WarheadDetonateEvent(warhead, pos, animName, false));
      }
    } catch (err) {}
  }

  /**
   * 落点是否**不可停驻**：非两栖坦克落水、舰船搁浅在岸上、落在悬崖/树木等
   * 站不住的地形上。原版把这些当成与坠落伤害平行的独立秒杀。
   *
   * **落点上有建筑时一律返回 false**：建筑占用格本身会让
   * `Terrain.getPassableSpeed` 因 `isBlockerObject` 返回 0，但原版扔到建筑上
   * 走的是"建筑与砸者同时扣血直到一方爆炸"的碾压路径（见 `_applyDrop`），
   * 不是地形秒杀——不摘掉建筑就会出现"坦克爆了、建筑零伤害"。
   *
   * 判定复用寻路同一套接口：
   *  - `terrain.getPassableSpeed(tile, speedType, onBridge, useBridgeLand)` 只看
   *    地形本身（水/崖/树木）；
   *  - `terrain.findObstacles(...)` 再**过滤成 overlay**，避免把落点上的车辆
   *    当成障碍（那些应走碾压）。
   * 障碍物本身免疫坠落伤害：返回 true 就直接 return，根本不进碾压结算，
   * 且 `targets` 只收 `isTechno`，压根不碰 overlay/terrain。
   */
  private _isUnstandable(victim: any, game: any): boolean {
    try {
      const tile = victim.tile;
      const rules = victim.rules;
      if (!tile || !rules || rules.speedType === undefined || rules.speedType === null) return false;
      const terrain = game.map && game.map.terrain;
      if (!terrain) return false;
      const occ = game.map.tileOccupation;
      const objects = occ && typeof occ.getObjectsOnTile === "function" ? occ.getObjectsOnTile(tile) : [];
      for (let i = 0; i < objects.length; i++) {
        const o = objects[i];
        if (o && o !== victim && o.isBuilding && o.isBuilding()) return false;
      }
      // 与 _restoreZone 一致：该格有桥面地表就按桥上处理。
      const onBridge = tile.onBridgeLandType != null;
      if (typeof terrain.getPassableSpeed === "function" && terrain.getPassableSpeed(tile, rules.speedType, onBridge, onBridge) <= 0) {
        return true;
      }
      if (typeof terrain.findObstacles === "function") {
        const obs = terrain.findObstacles({ tile, onBridge }, victim) || [];
        for (let i = 0; i < obs.length; i++) {
          const o = obs[i] && obs[i].obj;
          if (!o || o === victim) continue;
          if (o.isOverlay && o.isOverlay() && !(o.isBridge && o.isBridge())) return true;
        }
      }
      return false;
    } catch (err) {
      return false;
    }
  }

  /**
   * 安全销毁无 limboData 的 techno 对象。game.destroyObject
   * 强制要求 techno 有 limboData，但被磁电拖拽的单位（zone=Air）并未
   * 经过 limbo 流程，直接调用会抛异常——回退为手动标记销毁并从世界移除。
   *
   * attackerInfo 缺省必须传 undefined 而不是 `{obj: undefined}`：
   * Game.destroyObject 用 `!attacker` 短路跳过击杀计分，塞一个真值但
   * 没有 `player` 的对象会走进 `attacker.player.addUnitsKilled(...)` 直接
   * 抛 TypeError，把整条正规销毁链（isDestroyed/onDestroy/事件/计分/unspawn/
   * dispose）整段打断，只剩降级手动移除 → 单位凭空消失、不播死亡表现。
   */
  _forceDestroyObject(obj: any, game: any, attackerInfo?: any): void {
    const info = attackerInfo;
    try {
      game.destroyObject(obj, info);
    } catch (e) {
      if (!obj || obj.isDestroyed || obj.isDisposed) return;
      try {
        obj.isDestroyed = true;
        if (obj.healthTrait) obj.healthTrait.health = 0;
        obj.onDestroy(game, info);
        game.map.tileOccupation.unoccupyTileRange(obj.tile, obj);
        if (obj.isTechno && obj.isTechno()) {
          if (game.unitSelection) game.unitSelection.cleanupUnit(obj);
          if (game.map.technosByTile) game.map.technosByTile.remove(obj);
          if (obj.owner) obj.owner.removeOwnedObject(obj);
        }
        game.world.removeObject(obj);
        game.updatableObjects.delete(obj);
        obj.onUnspawn(game);
      } catch (e2) {
        // 回退也失败 → 对象可能卡在"半销毁"状态（既在世界里又标了 isDestroyed）。
      }
    }
  }

  /**
   * 收尾：`_aborted` 时只回滚本任务可能写入的状态（且不碰别人建立的
   * 拖拽链接）；正常结束时强制落地、结算未完成的坠落、恢复 MoveTrait、
   * 清除双向链接并取消残留 AttackTask。
   */
  onEnd(unit: any): void {
    const victim = this.victim;
    if (this._aborted) {
      // onStart 校验失败：本任务未建立拖拽。绝不 clear 别人的 magnetronDraggedBy。
      if (victim && this.magnetron && this.magnetron.magnetronDragging === victim && victim.magnetronDraggedBy === this.magnetron) {
        this.magnetron.magnetronDragging = undefined;
        victim.magnetronDraggedBy = undefined;
      }
      this._aborted = false;
      return;
    }
    if (!victim || victim.isDisposed || victim.isDestroyed) {
      // 注意：这条 early-return 不清 magnetron.magnetronDragging / isFiring，
      // 会把上一次拖拽的残留链接留到下一次拖拽才被覆盖。
      return;
    }
    try {
      if (victim.position) {
        const groundY = this._groundWorldY(victim);
        const y = victim.position.worldPosition.y;
        // 双向钳制：高于或低于地面都强制贴回（含斜坡插值）。
        if (Number.isFinite(groundY) && Math.abs(y - groundY) > 0.5) {
          victim.position.tileElevation = 0;
        }
      }
      if (victim.zone === ZoneType.Air) this._restoreZone(victim);
    } catch (err) {}
    // 取消/超时：补做一次落地结算（碾压 + 落水），此前未落地时才需要。
    if (!this._dropped) {
      try {
        this._applyDrop(victim, this.game);
      } catch (err) {}
    }
    // 恢复受害者的移动状态。
    if (victim.moveTrait) {
      victim.moveTrait.locomotor = undefined;
      victim.moveTrait.moveState = MoveState.Idle;
      if (victim.moveTrait.velocity) victim.moveTrait.velocity.set(0, 0, 0);
    }
    // 只清本任务建立的正向链接。
    if (victim.magnetronDraggedBy === this.magnetron) {
      victim.magnetronDraggedBy = undefined;
    }
    // 清除反向链接并取消残留 AttackTask。
    if (this.magnetron && this.magnetron.magnetronDragging === victim) {
      this.magnetron.magnetronDragging = undefined;
      try {
        const unitOrderTrait = this.magnetron.unitOrderTrait;
        if (unitOrderTrait) {
          const tasks = unitOrderTrait.getTasks();
          for (let ti = 0; ti < tasks.length; ti++) {
            const t = tasks[ti];
            if (t && !t.isCancelling() && t.target && t.target.obj === victim && typeof t.getWeapon === "function") {
              t.cancel();
            }
          }
        }
        if (this.magnetron.attackTrait) {
          const currentTarget = this.magnetron.attackTrait.currentTarget;
          if (!currentTarget || currentTarget.obj === victim) {
            this.magnetron.attackTrait.currentTarget = undefined;
            this.magnetron.attackTrait.attackState = AttackState.Idle;
            this.magnetron.isFiring = false;
          }
        }
      } catch (err) {}
    }
  }
}
