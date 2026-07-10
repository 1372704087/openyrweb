// === Reconstructed SystemJS module: game/gameobject/task/MagnetronDragTask ===
// deps: ["game/gameobject/task/system/Task","game/map/tileFinder/RandomTileFinder","game/type/LocomotorType","game/Coords","game/math/Vector2","game/math/Vector3","game/gameobject/unit/ZoneType","game/gameobject/trait/MoveTrait","game/gameobject/task/move/MoveTask","game/event/ObjectLandEvent","game/event/ObjectLiftOffEvent","game/gameobject/common/DeathType","game/type/LandType","game/type/SpeedType","game/gameobject/locomotor/JumpjetLocomotor","game/Warhead","game/gameobject/trait/AttackTrait"]
// 注意：变量/类型名是原始 TypeScript 的精简近似。
//
// OpenYRWeb: 磁电坦克磁场光束拖拽（原版尤里复仇行为还原）。
//
// 原版 YR 行为参考（ModEnc / CnC Wiki 考证）：
//   - IsLocomotor=yes 弹头命中载具后，临时将目标的 Locomotor 替换为 Jumpjet，
//     使其升空并拖向磁电。受害者变为空中单位（zone=Air），可被防空武器攻击，
//     自身武器失效（战斗要塞内部乘员例外）。
//   - 磁电持续开火（ROF=20）时每次命中刷新 locomotor，维持拖拽。磁电停止开火
//     （死亡、新命令、目标被毁、超射程）时 locomotor 失效，受害者坠落。
//   - 受害者被拖到磁电附近后，扔在磁电附近一个随机的、尽量空闲的格子上。
//   - 坠落伤害：坠落单位自身受到 base × FallingDamageMultiplier（默认 1.0）伤害，
//     base = 当前血量（CurrentStrengthDamage=true，默认）或最大血量。
//     落点格子上的地面单位被碾压，伤害值 = 坠落单位的 base 血量。
//   - 非两栖单位落水 → 沉没摧毁；空旷地面 → 安全落地无伤害。
//
// 本引擎实现说明：
//   - 直接编辑受害者位置（不使用真实 Jumpjet locomotor），但正确模拟 zone=Air、
//     事件分发（ObjectLiftOffEvent/ObjectLandEvent）和坠落伤害。
//   - AttackTask 的 magDragging 标志已跳过 canTarget 检查（见 AttackTask.ts.js），
//     因此磁电的纯对地 MagneticBeam 武器在受害者变为 Air 后仍能持续锁定目标。
//   - 拖拽持续判定：检查磁电是否有活跃 AttackTask 指向受害者 —— 近似原版的
//     "持续开火即拖拽"行为。
//   - 自包含：每 tick 直接驱动受害者位置，不派生 MoveTask 子任务。保持
//     moveTrait.moveState = Idle 使 MoveTrait.NotifyTick 休眠。

System.register(
  "game/gameobject/task/MagnetronDragTask",
  [
    "game/gameobject/task/system/Task",
    "game/map/tileFinder/RandomTileFinder",
    "game/type/LocomotorType",
    "game/Coords",
    "game/math/Vector2",
    "game/math/Vector3",
    "game/gameobject/unit/ZoneType",
    "game/gameobject/trait/MoveTrait",
    "game/gameobject/task/move/MoveTask",
    "game/event/ObjectLandEvent",
    "game/event/ObjectLiftOffEvent",
    "game/gameobject/common/DeathType",
    "game/type/LandType",
    "game/type/SpeedType",
    "game/gameobject/locomotor/JumpjetLocomotor",
    "game/Warhead",
    "game/gameobject/trait/AttackTrait",
  ],
  function (e, t) {
    "use strict";
    var s, RTF, lt, C, V2, V3, Z, MT, MV, OLE, OLFE, DT, LL, SP, JJ, WH, AT;
    t && t.id;
    return {
      setters: [
        function (e) { s = e; },
        function (e) { RTF = e; },
        function (e) { lt = e; },
        function (e) { C = e; },
        function (e) { V2 = e; },
        function (e) { V3 = e; },
        function (e) { Z = e; },
        function (e) { MT = e; },
        function (e) { MV = e; },
        function (e) { OLE = e; },
        function (e) { OLFE = e; },
        function (e) { DT = e; },
        function (e) { LL = e; },
        function (e) { SP = e; },
        function (e) { JJ = e; },
        function (e) { WH = e; },
        function (e) { AT = e; },
      ],
      execute: function () {
        var n;
        // 拖拽物理参数。
        var CRUISE_HEIGHT = 500;   // 地面以上 leptons
        var CLIMB_RATE = 20;       // leptons/帧 爬升速度
        var HORIZ_SPEED = 20;      // leptons/帧 水平漂移速度
        var FALL_GRAVITY = 4;      // leptons/帧² 重力加速度
        var DRAG_DIST_TILES = 2;   // 到达此距离内时寻找落点
        var DROP_SEARCH_RADIUS = 2; // 落点搜索半径（格）
        e(
          "MagnetronDragTask",
          (n = class extends s.Task {
            // game、victim（被拖拽载具）、magnetron（开火单位）、warhead（坠落碾压伤害用）。
            constructor(e, t, i, warhead) {
              super(),
                (this.game = e),
                (this.victim = t),
                (this.magnetron = i),
                (this.warhead = warhead),
                (this._tickCount = 0),
                (this._dropped = !1),
                (this._dropping = !1),
                (this._fallSpeed = 0),
                (this._dropTile = null),
                (this._movingToDrop = !1),
                // 安全上限（约 20 秒）。超时但仍在空中时，onEnd 强制落地。
                (this._maxTicks = 300),
                ((this.cancellable = !0), (this.blocking = !0), (this.preventOpportunityFire = !0));
            }
            onStart(unit) {
              var v = this.victim;
              if (!v || v.isDisposed || v.isDestroyed) { this._aborted = !0; return; }
              if (!v.moveTrait || !v.unitOrderTrait) { this._aborted = !0; return; }
              if (v.magnetronDraggedBy) { this._aborted = !0; return; }

              // 原版 YR：IsLocomotor 弹头将受害者的 Locomotor 替换为 Jumpjet，
              // 使其变为空中单位（zone=Air）。受害者可被防空武器攻击，自身武器失效。
              // AttackTask 的 magDragging 标志已跳过 canTarget 检查（见 AttackTask.ts.js），
              // 因此磁电的纯对地 MagneticBeam 武器在受害者变为 Air 后仍能持续锁定目标。
              v.zone = Z.ZoneType.Air;
              v.onBridge = !1;
              try {
                this.game.events.dispatch(new OLFE.ObjectLiftOffEvent(v));
              } catch (err) {}

              v.magnetronDraggedBy = this.magnetron;
              // 反向链接：磁电渲染器使用此引用绘制持续牵引光束
              // （MagnetronBeamPlugin 读取此字段）。
              this.magnetron.magnetronDragging = v;

              // 保持 MoveTrait 休眠，不干扰直接位置编辑。
              try {
                v.moveTrait.locomotor = void 0;
                v.moveTrait.moveState = MT.MoveState.Idle;
                v.moveTrait.velocity && v.moveTrait.velocity.set(0, 0, 0);
              } catch (err) {}
            }
            onTick(unit) {
              if (this._aborted) return !0;
              var v = this.victim;
              if (!v || v.isDisposed || v.isDestroyed) return !0;
              if (++this._tickCount > this._maxTicks) return !0;

              // 坠落阶段 —— 仅驱动重力下落。
              if (this._dropping) {
                return this._descend(v);
              }

              var mag = this.magnetron;
              var magGone = !mag || mag.isDisposed || mag.isDestroyed;
              if (magGone) {
                this._startDrop(mag, v);
                return this._descend(v);
              }
              if (this._isBeamBroken(mag, v)) {
                this._startDrop(mag, v);
                return this._descend(v);
              }

              // 光束活跃：保持磁电视觉上持续开火（连续光束）。
              mag.isFiring = !0;

              // 若正在移向落点格子，继续水平移动。
              if (this._movingToDrop && this._dropTile) {
                this._moveToDropTile(v, mag);
                if (this._dropping) return this._descend(v);
                return !1;
              }

              // 爬升到巡航高度并向磁电水平漂移。
              this._liftAndDrag(v, mag);

              if (this._dropping) return this._descend(v);
              return !1;
            }

            // 磁场光束期间：将受害者提升到巡航高度并水平拉向磁电。
            _liftAndDrag(v, mag) {
              var pos = v.position;
              var beforeTile = v.tile;
              var worldY = pos.worldPosition.y;
              var groundY = this._groundWorldY(v);
              var targetY = groundY + CRUISE_HEIGHT;

              if (worldY < targetY - 0.5) {
                // 爬升阶段：向巡航高度上升。无水平移动，无浮动。
                var dy = Math.min(CLIMB_RATE, targetY - worldY);
                try {
                  pos.moveByLeptons3(new V3.Vector3(0, dy, 0));
                } catch (err) {}
                this._syncTile(v, beforeTile);
                return;
              }

              // 巡航高度 —— 向磁电水平拖拽。
              var dx = 0, dz = 0;
              if (mag && mag.position) {
                var vp = pos.getMapPosition();
                var mp = mag.position.getMapPosition();
                var hx = mp.x - vp.x,
                  hz = mp.y - vp.y;
                var hlen = Math.hypot(hx, hz);
                var minSep = DRAG_DIST_TILES * C.Coords.LEPTONS_PER_TILE;

                // 已拖到磁电附近 —— 寻找随机落点（原版行为）。
                if (hlen <= minSep + 0.01) {
                  this._initiateDrop(v, mag);
                  return;
                }
                var want = Math.max(0, hlen - minSep);
                var step = Math.min(HORIZ_SPEED, want);
                if (hlen > 0.001 && step > 0) {
                  dx = (hx / hlen) * step;
                  dz = (hz / hlen) * step;
                }
              }
              if (dx !== 0 || dz !== 0) {
                try { pos.moveByLeptons3(new V3.Vector3(dx, 0, dz)); } catch (err) {}
              }

              this._syncTile(v, beforeTile);

              // 在巡航高度上叠加波浪浮动效果。
              var floatAmplitude = 30;
              var floatFrequency = 0.02094; // 约 5 秒一个完整起伏周期
              var floatOffset = floatAmplitude * Math.sin(this._tickCount * floatFrequency);
              var finalY = targetY + floatOffset;
              if (finalY < groundY + 10) finalY = groundY + 10;
              try { pos.setAbsoluteElevationWorld(finalY); } catch (err) {}
            }

            // 受害者到达磁电附近：寻找随机空闲落点格子并开始移向该格子。
            // 原版 YR：磁电将目标扔在附近一个随机的、尽量空闲的格子上。
            _initiateDrop(v, mag) {
              var dropTile = this._findDropTile(mag);
              if (dropTile) {
                this._dropTile = dropTile;
                this._movingToDrop = !0;
              } else {
                // 未找到空闲格子 —— 就地坠落。
                this._dropping = !0;
                this._fallSpeed = 0;
                this._startDrop(mag, v);
              }
            }

            // 向落点格子水平移动（巡航高度不变）。
            _moveToDropTile(v, mag) {
              var pos = v.position;
              var beforeTile = v.tile;
              var targetTile = this._dropTile;
              if (!targetTile) {
                this._dropping = !0;
                this._fallSpeed = 0;
                this._startDrop(mag, v);
                return;
              }

              // 计算落点格子的世界坐标中心。
              var targetLeptons = new V2.Vector2(
                targetTile.rx * C.Coords.LEPTONS_PER_TILE + C.Coords.LEPTONS_PER_TILE / 2,
                targetTile.ry * C.Coords.LEPTONS_PER_TILE + C.Coords.LEPTONS_PER_TILE / 2
              );
              var vp = pos.getMapPosition();
              var dx = targetLeptons.x - vp.x;
              var dz = targetLeptons.y - vp.y;
              var hlen = Math.hypot(dx, dz);

              if (hlen <= HORIZ_SPEED + 0.01) {
                // 到达落点格子上方 —— 开始坠落。
                try { pos.moveByLeptons3(new V3.Vector3(dx, 0, dz)); } catch (err) {}
                this._syncTile(v, beforeTile);
                this._dropping = !0;
                this._fallSpeed = 0;
                this._startDrop(mag, v);
                return;
              }

              var step = Math.min(HORIZ_SPEED, hlen);
              if (hlen > 0.001 && step > 0) {
                try {
                  pos.moveByLeptons3(new V3.Vector3((dx / hlen) * step, 0, (dz / hlen) * step));
                } catch (err) {}
              }
              this._syncTile(v, beforeTile);

              // 保持巡航高度 + 浮动。
              var groundY = this._groundWorldY(v);
              var targetY = groundY + CRUISE_HEIGHT;
              var floatAmplitude = 30;
              var floatFrequency = 0.02094;
              var floatOffset = floatAmplitude * Math.sin(this._tickCount * floatFrequency);
              var finalY = targetY + floatOffset;
              if (finalY < groundY + 10) finalY = groundY + 10;
              try { pos.setAbsoluteElevationWorld(finalY); } catch (err) {}
            }

            // 在磁电附近寻找一个随机的空闲地面格子作为落点。
            _findDropTile(mag) {
              try {
                var game = this.game;
                var victim = this.victim;
                var rng = (game.prng && game.prng.generateRandomInt)
                  ? game.prng
                  : {
                      generateRandomInt: function (a, b) {
                        return Math.floor(Math.random() * (b - a)) + a;
                      },
                    };
                var finder = new RTF.RandomTileFinder(
                  game.map.tiles,
                  game.map,
                  mag.tile,
                  DROP_SEARCH_RADIUS,
                  rng,
                  function (tile) {
                    if (!tile) return !1;
                    // 排除被其他地面 techno 占据的格子。
                    var objs = game.map.tileOccupation.getGroundObjectsOnTile(tile);
                    for (var i = 0; i < objs.length; i++) {
                      var o = objs[i];
                      if (o !== victim && o.isTechno && o.isTechno()) return !1;
                    }
                    return !0;
                  },
                  !1, // includeStartTile
                  !0  // checkBounds
                );
                return finder.getNextTile();
              } catch (err) {
                return null;
              }
            }

            // 判断磁电是否已不再主动攻击此受害者。
            // 近似原版"持续开火即拖拽"：AttackTask 存在且以该受害者为目标时光束存活。
            _isBeamBroken(mag, v) {
              if (!mag || mag.isDisposed || mag.isDestroyed) return !0;
              try {
                var uot = mag.unitOrderTrait;
                if (uot) {
                  var tasks = uot.getTasks();
                  for (var ti = 0; ti < tasks.length; ti++) {
                    var t = tasks[ti];
                    if (t && !t.isCancelling() && t.target && t.target.obj === v && typeof t.getWeapon === "function") {
                      return !1;
                    }
                  }
                }
              } catch (err) {}
              return !0;
            }

            // 标记光束断裂：清除磁电拖拽状态，停止视觉光束，
            // 并取消 AttackTask 使磁电不再重新攻击已落地的受害者。
            _startDrop(mag, v) {
              if (!mag || mag.magnetronDragging !== v) return;
              mag.magnetronDragging = void 0;
              mag.isFiring = !1;
              try {
                var uot = mag.unitOrderTrait;
                if (uot) {
                  var tasks = uot.getTasks();
                  for (var ti = 0; ti < tasks.length; ti++) {
                    var t = tasks[ti];
                    if (t && !t.isCancelling() && t.target && t.target.obj === v && typeof t.getWeapon === "function") {
                      t.cancel();
                    }
                  }
                }
                if (mag.attackTrait) {
                  var cur = mag.attackTrait.currentTarget;
                  if (!cur || cur.obj === v) {
                    mag.attackTrait.currentTarget = void 0;
                    mag.attackTrait.attackState = AT.AttackState.Idle;
                  }
                }
              } catch (err) {}
            }

            // 坠落阶段：重力加速下落。
            _descend(v) {
              if (this._dropped) return !0;
              this._dropping = !0;
              var pos = v.position;
              var groundY = this._groundWorldY(v);
              var worldY = pos.worldPosition.y;
              if (worldY > groundY + 0.5) {
                this._fallSpeed += FALL_GRAVITY;
                var step = Math.min(this._fallSpeed, worldY - groundY);
                try {
                  pos.setAbsoluteElevationWorld(worldY - step);
                } catch (err) {}
                return !1;
              }
              try { pos.setAbsoluteElevationWorld(groundY); } catch (err) {}
              this._dropped = !0;
              this._fallSpeed = 0;
              // 原版 YR：落地时恢复 zone=Ground，分发 ObjectLandEvent。
              this._restoreZone(v);
              this._applyDrop(v, this.game);
              return !0;
            }

            // 恢复受害者的 zone 为地面（按落点地形）。
            _restoreZone(v) {
              try {
                var tile = v.tile;
                if (tile) {
                  var lt2 = tile.onBridgeLandType != null ? tile.onBridgeLandType : tile.landType;
                  v.zone = Z.getZoneType(lt2);
                } else {
                  v.zone = Z.ZoneType.Ground;
                }
                this.game.events.dispatch(new OLE.ObjectLandEvent(v));
              } catch (err) {}
            }

            // 受害者所在格子的地面世界 Y 坐标（tile.z），世界单位。
            _groundWorldY(v) {
              var t = v.tile;
              var z = t ? t.z : 0;
              return C.Coords.tileHeightToWorld(z);
            }

            // 在受害者漂移过程中保持其在当前格子上的注册。
            _syncTile(v, beforeTile) {
              try {
                var after = v.tile;
                if (beforeTile && after && (beforeTile.rx !== after.rx || beforeTile.ry !== after.ry)) {
                  this.game.map.tileOccupation.unoccupyTileRange(beforeTile, v);
                  this.game.map.tileOccupation.occupyTileRange(after, v);
                  this.game.map.technosByTile && this.game.map.technosByTile.updateObject(v);
                }
              } catch (err) {}
            }

            // 原版 YR 坠落伤害（ModEnc 考证）：
            //   base = CurrentStrengthDamage ? 当前血量 : 最大血量
            //   自身坠落伤害 = base × FallingDamageMultiplier（默认 1.0）
            //   落点格子地面单位被碾压，伤害 = base（经 CrushWarhead）
            //   非两栖单位落水 → 沉没摧毁
            //   空旷地面 → 安全落地
            _applyDrop(victim, game) {
              try {
                if (!victim || victim.isDisposed || victim.isDestroyed || !victim.healthTrait) return;
                var cd = game.rules && game.rules.combatDamage;
                var multiplier = cd ? cd.fallingDamageMultiplier : 1;
                var useCurrent = cd ? cd.currentStrengthDamage : !0;
                var baseStrength = useCurrent
                  ? victim.healthTrait.getHitPoints()
                  : victim.healthTrait.maxHitPoints;
                var fallDmg = Math.max(1, Math.round(baseStrength * multiplier));

                // 机制 B：碾压所有站在落点格子上的地面 techno。
                var targets = [];
                try {
                  var onTile = game.map.tileOccupation.getGroundObjectsOnTile(victim.tile) || [];
                  for (var oi = 0; oi < onTile.length; oi++) {
                    var o = onTile[oi];
                    if (!o || o === victim || o.isDestroyed) continue;
                    if (!o.isTechno || !o.isTechno()) continue;
                    if (!o.healthTrait) continue;
                    targets.push(o);
                  }
                } catch (err) {}

                if (targets.length) {
                  var crushWhName = (cd && cd.crushWarhead) || "Crush";
                  var crushWh = void 0;
                  try {
                    var whRules = game.rules.getWarhead(crushWhName);
                    if (whRules) crushWh = new WH.Warhead(whRules);
                  } catch (err) {}
                  var attackerInfo = { obj: victim, player: victim.owner, weapon: void 0 };
                  for (var ti = 0; ti < targets.length; ti++) {
                    var target = targets[ti];
                    try {
                      if (target.isInfantry && target.isInfantry())
                        target.infDeathType = 0;
                      target.deathType = DT.DeathType.Crush;
                      if (crushWh && crushWh.computeDamage && crushWh.inflictDamage) {
                        var reduced = crushWh.computeDamage(baseStrength, target, game);
                        crushWh.inflictDamage(reduced, target, attackerInfo, game);
                      } else {
                        target.healthTrait.inflictDamage(baseStrength, attackerInfo, game);
                        if (
                          (target.healthTrait && target.healthTrait.getHitPoints() <= 0) ||
                          target.isDestroyed
                        )
                          this._forceDestroyObject(target, game, attackerInfo);
                      }
                    } catch (err) {}
                  }
                  // 机制 A：坠落载具自身受到坠落伤害。
                  if (!victim.isDestroyed && victim.healthTrait) {
                    try {
                      victim.deathType = DT.DeathType.Crush;
                      victim.healthTrait.inflictDamage(fallDmg, { obj: void 0 }, game);
                      if (
                        (victim.healthTrait && victim.healthTrait.getHitPoints() <= 0) ||
                        victim.isDestroyed
                      )
                        this._forceDestroyObject(victim, game);
                    } catch (err) {}
                  }
                  return;
                }

                // 下方无 techno。非两栖载具在水格上 → 直接摧毁。
                if (
                  victim.tile.landType === LL.LandType.Water &&
                  victim.rules.speedType !== SP.SpeedType.Amphibious
                ) {
                  try {
                    victim.deathType = DT.DeathType.Sink;
                    this._forceDestroyObject(victim, game);
                  } catch (err) {}
                  return;
                }
                // 空旷地面 → 正常安全落地，无伤害。
              } catch (err) {}
            }

            // OpenYRWeb: 安全销毁无 limboData 的 techno 对象。
            // game.destroyObject 强制要求 techno 有 limboData，但被磁电拖拽的单位
            // （zone=Air）并未经过 limbo 流程，直接调用会抛异常。
            _forceDestroyObject(obj, game, attackerInfo) {
              var info = attackerInfo || { obj: void 0 };
              try { game.destroyObject(obj, info); } catch (e) {
                // 回退：手动标记销毁并从世界移除。
                if (!obj || obj.isDestroyed || obj.isDisposed) return;
                try {
                  obj.isDestroyed = !0;
                  if (obj.healthTrait) obj.healthTrait.health = 0;
                  obj.onDestroy(game, info);
                  game.map.tileOccupation.unoccupyTileRange(obj.tile, obj);
                  if (obj.isTechno && obj.isTechno()) {
                    game.unitSelection && game.unitSelection.cleanupUnit(obj);
                    game.map.technosByTile && game.map.technosByTile.remove(obj);
                    if (obj.owner) obj.owner.removeOwnedObject(obj);
                  }
                  game.world.removeObject(obj);
                  game.updatableObjects.delete(obj);
                  obj.onUnspawn(game);
                } catch (e2) {}
              }
            }

            onEnd(unit) {
              var v = this.victim;
              if (!v || v.isDisposed || v.isDestroyed) {
                this._aborted && (this._aborted = !1);
                return;
              }
              // 若受害者仍在空中，强制贴回地面并恢复 zone。
              try {
                if (v.position) {
                  var groundY = this._groundWorldY(v);
                  if (v.position.worldPosition.y > groundY + 0.5)
                    v.position.setAbsoluteElevationWorld(groundY);
                }
                if (v.zone === Z.ZoneType.Air)
                  this._restoreZone(v);
              } catch (err) {}
              // OpenYRWeb: 取消拖拽时走完坠落伤害流程
              // （落水沉没、落建筑碾压、自身坠落伤害），否则直接落地会跳过所有伤害。
              if (!this._dropped) {
                try { this._applyDrop(v, this.game); } catch (err) {}
              }
              // 恢复受害者的移动状态。
              if (v.moveTrait) {
                v.moveTrait.locomotor = void 0;
                v.moveTrait.moveState = MT.MoveState.Idle;
                v.moveTrait.velocity && v.moveTrait.velocity.set(0, 0, 0);
              }
              v.magnetronDraggedBy = void 0;
              // 清除反向链接并取消仍以该受害者为目标的残留 AttackTask。
              if (this.magnetron && this.magnetron.magnetronDragging === v) {
                this.magnetron.magnetronDragging = void 0;
                try {
                  var uot = this.magnetron.unitOrderTrait;
                  if (uot) {
                    var tasks = uot.getTasks();
                    for (var ti = 0; ti < tasks.length; ti++) {
                      var t = tasks[ti];
                      if (t && !t.isCancelling() && t.target && t.target.obj === v && typeof t.getWeapon === "function") {
                        t.cancel();
                      }
                    }
                  }
                  if (this.magnetron.attackTrait) {
                    var cur = this.magnetron.attackTrait.currentTarget;
                    if (!cur || cur.obj === v) {
                      this.magnetron.attackTrait.currentTarget = void 0;
                      this.magnetron.attackTrait.attackState = AT.AttackState.Idle;
                      this.magnetron.isFiring = !1;
                    }
                  }
                } catch (err) {}
              }
              this._aborted = !1;
            }
          }),
        );
      },
    };
  },
);
