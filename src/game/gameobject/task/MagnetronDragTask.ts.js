// === Reconstructed SystemJS module: game/gameobject/task/MagnetronDragTask ===
// deps: ["game/gameobject/task/system/Task","game/map/tileFinder/RadialTileFinder","game/type/LocomotorType","game/Coords","game/math/Vector2","game/math/Vector3","game/gameobject/unit/ZoneType","game/gameobject/trait/MoveTrait","game/gameobject/task/move/MoveTask","game/event/ObjectLandEvent","game/event/ObjectLiftOffEvent","game/gameobject/common/DeathType","game/type/LandType","game/type/SpeedType","game/gameobject/locomotor/JumpjetLocomotor","game/Warhead"]
// 注意：变量/类型名是原始 TypeScript 的精简近似。
//
// OpenYRWeb: 磁电坦克磁场光束拖拽。
//
// 行为参考：
//   - TractorBeam 弹头击中目标 → 目标进入可拖拽（Tractable）状态。
//   - 只要磁电持续攻击同一目标，拖拽就保持 —— 无光束超时，无需"刷新"概念。
//     攻击任务存在即拖拽持续。
//   - 磁电可自由移动；移动不会打断拖拽。受害者跟随磁电水平移动（巡航高度不变）。
//   - 磁电停止移动时，目标被拉向磁电当前位置。受害者到达 1 格距离后攻击完成，目标坠落。
//   - 拖拽结束条件：(a) 磁电停止攻击（死亡、新命令、目标被毁），
//     (b) 目标离开攻击范围（攻击任务消失），(c) 目标变为不可拖拽（铁幕、死亡）。
//   - 落点：对下方格子内的地面单位造成碾压伤害（基于受害者血量）+ 自身坠落伤害
//     （可配置倍率，默认 25%）。
//
// 攻击系统无"射程优化自动后退/前进"机制 —— 单位一旦开始攻击就停在原地，
// 除非目标超出最大射程才会追击。不存在"因目标进入最小射程而后退"的问题。
//
// 实现（自包含 —— 不派生 MoveTask 子任务）：
//   每 tick 直接驱动受害者位置（爬升到巡航高度 + 向磁电漂移）。无子任务、
//   无 TaskRunner 阻塞、无嵌套移动风险。MoveTrait.NotifyTick 通过保持
//   moveTrait.moveState = Idle 保持休眠。

System.register(
  "game/gameobject/task/MagnetronDragTask",
  [
    "game/gameobject/task/system/Task",
    "game/map/tileFinder/RadialTileFinder",
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
    var s, r, lt, C, V2, V3, Z, MT, MV, OLE, OLFE, DT, LL, SP, JJ, WH, AT;
    t && t.id;
    return {
      setters: [
        function (e) { s = e; },
        function (e) { r = e; },
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
        // 拖拽物理参数。巡航高度针对本引擎坐标尺度调整。
        var CRUISE_HEIGHT = 500; // 地面以上 leptons
        var CLIMB_RATE = 20;     // leptons/帧 爬升速度
        var HORIZ_SPEED = 20;    // leptons/帧 向磁电漂移速度
        var FALL_GRAVITY = 4;    // leptons/帧² 重力加速度（从巡航高度落地约 15 帧）
        var DRAG_DIST_TILES = 1; // 目标保持在距磁电恰好 1 格
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
                // 安全上限（约 20 秒）。超时但仍在空中时，onEnd 强制落地。
                (this._maxTicks = 300),
                ((this.cancellable = !0), (this.blocking = !0), (this.preventOpportunityFire = !0));
            }
            onStart(unit) {
              var v = this.victim;
              if (!v || v.isDisposed || v.isDestroyed) { this._aborted = !0; return; }
              if (!v.moveTrait || !v.unitOrderTrait) { this._aborted = !0; return; }
              if (v.magnetronDraggedBy) { this._aborted = !0; return; }
              // OpenYRWeb：受害者保持 zone=Ground 用于瞄准。翻转为 zone=Air 会让
              // 磁电的仅对地 MagneticBeam 武器无法重新获取目标，导致 AttackTask
              // 终止并使受害者瞬间坠落。保持 Ground 让磁电持续开火。
              // 悬浮是纯视觉的，通过 elevation 实现。"无法还击"效果由
              // magnetronDraggedBy 标志强制执行（AttackTrait.scanForTarget 提前返回）。
              v.magnetronDraggedBy = this.magnetron;
              // OpenYRWeb 反向链接：磁电渲染器使用此引用绘制持续牵引光束
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

              // 下降阶段激活 —— 仅驱动坠落，跳过所有提升/拖拽/光束逻辑。
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

              // 爬升到巡航高度并向磁电水平漂移。
              // 若已在 1 格距离内，到达后触发坠落，而不是悬停。
              this._liftAndDrag(v, mag);

              // 如果 _liftAndDrag 触发了坠落，驱动它。
              if (this._dropping) {
                return this._descend(v);
              }

              return !1;
            }
            // 磁场光束期间：将受害者提升到巡航高度并水平拉向磁电。
            // 所有移动通过直接编辑受害者位置实现。
            //
            // 行为：磁电移动时受害者跟随。磁电静止且受害者到达 1 格距离时，
            // 攻击完成并触发坠落（不是悬停）。
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

                // 已拖到 1 格距离 —— 攻击完成，触发坠落。
                if (hlen <= minSep + 0.01) {
                  this._dropping = true;
                  this._fallSpeed = 0;
                  this._startDrop(mag, v);
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

              // 同步格子占用（可能将高度重置为地面）。
              this._syncTile(v, beforeTile);

              // 在巡航高度上叠加波浪浮动效果。
              var floatAmplitude = 30;
              var floatFrequency = 0.02094; // 约 5 秒一个完整起伏周期
              var floatOffset = floatAmplitude * Math.sin(this._tickCount * floatFrequency);
              var finalY = targetY + floatOffset;
              // 防止浮动到地面以下。
              if (finalY < groundY + 10) finalY = groundY + 10;
              try { pos.setAbsoluteElevationWorld(finalY); } catch (err) {}
            }
            // 判断磁电是否已不再主动攻击此受害者。
            // 当攻击任务消失时拖拽结束（磁电死亡、收到新命令、
            // 目标被毁等）。磁电移动不打断光束。
            _isBeamBroken(mag, v) {
              if (!mag || mag.isDisposed || mag.isDestroyed) return !0;
              // 检查磁电是否有仍以此受害者为目标的活跃 AttackTask。
              try {
                var uot = mag.unitOrderTrait;
                if (uot) {
                  var tasks = uot.getTasks();
                  for (var ti = 0; ti < tasks.length; ti++) {
                    var t = tasks[ti];
                    if (t && !t.isCancelling() && t.target && t.target.obj === v && typeof t.getWeapon === "function") {
                      return !1; // AttackTask 仍在以该受害者为目标 —— 光束存活。
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
              // 取消以该受害者为目标的 AttackTask，使磁电不再继续攻击已落地的单位。
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
            // 坠落阶段：重力加速下落（TractionFallToEarth 模式）。
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
              this._applyDrop(v, this.game);
              return !0;
            }
            // 受害者所在格子的地面世界 Y 坐标（tile.z + 桥梁），世界单位。
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
            // OpenYRWeb：磁电原版碾压伤害 —— 由 yrmd.exe 逆向还原。
            //
            // 落地时原版执行两个伤害机制：
            //   (B) 落点格子下方的地形单位被碾压，伤害值 = 坠落单位原始血量。
            //       无阵营过滤。
            //   (A) 坠落单位自身受到 Strength × FallingDamageMultiplier 伤害，
            //       通过专用的 FallingDamage 弹头。
            //
            // 我们模拟原版：查询落点格子的地面占用者，通过 CrushWarhead 施加碾压，
            // 然后对坠落受害者自身造成最大血量 25% 的伤害（匹配Tractable DamageFactor 默认值）。
            _applyDrop(victim, game) {
              try {
                if (!victim || victim.isDisposed || victim.isDestroyed || !victim.healthTrait) return;
                var cd = game.rules && game.rules.combatDamage;
                // 自身落地伤害：最大血量 25%（Tractable DamageFactor 默认值）。
                var fallDmg = Math.max(1, Math.round(victim.healthTrait.maxHitPoints * 0.25));
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
                  var victimStrength = victim.healthTrait.maxHitPoints;
                  var attackerInfo = { obj: victim, player: victim.owner, weapon: void 0 };
                  for (var ti = 0; ti < targets.length; ti++) {
                    var target = targets[ti];
                    try {
                      if (target.isInfantry && target.isInfantry())
                        target.infDeathType = 0;
                      target.deathType = DT.DeathType.Crush;
                      if (crushWh && crushWh.computeDamage && crushWh.inflictDamage) {
                        var reduced = crushWh.computeDamage(victimStrength, target, game);
                        crushWh.inflictDamage(reduced, target, attackerInfo, game);
                      } else {
                        target.healthTrait.inflictDamage(victimStrength, attackerInfo, game);
                        if (
                          (target.healthTrait && target.healthTrait.getHitPoints() <= 0) ||
                          target.isDestroyed
                        )
                          game.destroyObject(target, attackerInfo);
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
                        game.destroyObject(victim, { obj: void 0 });
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
                    game.destroyObject(victim, { obj: void 0 });
                  } catch (err) {}
                  return;
                }
                // 空旷地面 → 正常安全落地，无伤害。
              } catch (err) {}
            }
            onEnd(unit) {
              var v = this.victim;
              if (!v || v.isDisposed || v.isDestroyed) {
                this._aborted && (this._aborted = !1);
                return;
              }
              // 若受害者仍在抬升状态，强制贴回地面。
              try {
                if (v.position) {
                  var groundY = this._groundWorldY(v);
                  if (v.position.worldPosition.y > groundY + 0.5)
                    v.position.setAbsoluteElevationWorld(groundY);
                }
              } catch (err) {}
              // 恢复受害者的每个实例的移动状态。
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
