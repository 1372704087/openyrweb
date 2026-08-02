// === Reconstructed SystemJS module: game/gameobject/task/AirstrikeAttackTask ===
// deps: ["game/gameobject/task/system/Task","game/gameobject/task/system/TaskStatus","game/gameobject/unit/RangeHelper","game/gameobject/task/move/MoveInWeaponRangeTask","game/gameobject/unit/FacingUtil","game/gameobject/task/TurnTask","game/GameSpeed","game/Coords","game/math/Vector2","game/math/Vector3","game/event/TriggerSoundFxEvent"]
// Note: Boris airstrike attack task — gets Boris into weapon range and then
// fires the Flare, which triggers the AirstrikeTrait state machine (the vanilla
// AirstrikeClass::Update). The planes are spawned immediately (Execute) or, if
// a strike is already in the air, redirected to the new target (ChangeTarget).
// The trait then manages the planes and the recharge cooldown on its own.

System.register(
  "game/gameobject/task/AirstrikeAttackTask",
  [
    "game/gameobject/task/system/Task",
    "game/gameobject/task/system/TaskStatus",
    "game/gameobject/unit/RangeHelper",
    "game/gameobject/task/move/MoveInWeaponRangeTask",
    "game/gameobject/unit/FacingUtil",
    "game/gameobject/task/TurnTask",
    "game/GameSpeed",
    "game/Coords",
    "game/math/Vector2",
    "game/math/Vector3",
    "game/event/TriggerSoundFxEvent",
  ],
  function (e, t) {
    "use strict";
    var i, r, s, a, n, o, l, c, h, u, v;
    t && t.id;
    return {
      setters: [
        function (e) { i = e; },
        function (e) { r = e; },
        function (e) { s = e; },
        function (e) { a = e; },
        function (e) { n = e; },
        function (e) { o = e; },
        function (e) { l = e; },
        function (e) { c = e; },
        function (e) { h = e; },
        function (e) { u = e; },
        function (e) { v = e; },
      ],
      execute: function () {
        // Airstrike phases
        var Phase = {
          Approaching: 0,    // Boris moving into weapon range
          Firing: 1,         // Flare fired, planes spawned/redirected — done
        };

        var AirstrikeAttackTask = class extends i.Task {
          constructor(game, target, weapon, options) {
            super();
            this.game = game;
            this.target = target;
            this.weapon = weapon;
            this.options = options || {};
            this.phase = Phase.Approaching;
            this.fired = false;
            // OpenYRWeb: set once the walk-into-range task has been created; after it
            // completes (Boris is stationary at the range edge) the flare is fired.
            this._walkDone = false;
            this.rangeHelper = new s.RangeHelper(game.map.tileOccupation);
            this.targetLinesConfig = { pathNodes: [] };
            this.updateTargetLines(target, true);
            this.preventOpportunityFire = true;
            this.preventLanding = true;
          }

          duplicate() {
            return new AirstrikeAttackTask(this.game, this.target, this.weapon, this.options);
          }

          getWeapon() {
            return this.weapon;
          }

          updateTargetLines(target, isAttack) {
            this.targetLinesConfig.target = target.obj;
            this.targetLinesConfig.pathNodes = target.obj ? [] : [{ tile: target.tile, onBridge: target.getBridge() }];
            this.targetLinesConfig.isAttack = isAttack;
          }

          _fire(gameObject) {
            // Firing the Flare triggers the AirstrikeTrait dispatcher (vanilla
            // InfantryClass::SpecialAttack → AirstrikeClass::Update): it either
            // spawns the MiG team (Execute) or redirects the in-flight planes
            // to this new target (ChangeTarget). Both happen instantly.
            var targetObj = this.target.obj;
            var targetTile = targetObj ? targetObj.tile : this.target.tile;
            if (targetObj && (targetObj.isDestroyed || !this.game.isValidTarget(targetObj))) {
              return false;
            }
            // The VoiceSecondaryWeaponAttack line already played in onStart when the
            // order was issued; firing the Flare only triggers the airstrike state
            // machine (spawn/redirect planes).
            gameObject.airstrikeTrait.update(this.game, gameObject, targetObj, targetTile);
            this.fired = true;
            return true;
          }

          onStart(gameObject) {
              if (!gameObject.airstrikeTrait) {
                this.cancel();
                return;
              }
              if (!gameObject.airstrikeTrait.isReady(gameObject)) {
                this.cancel();
                return;
              }
              var targetObj = this.target.obj;
              var targetTile = targetObj ? targetObj.tile : this.target.tile;
              // Vanilla YR: Boris speaks his VoiceSecondaryWeaponAttack line (e.g.
              // BorisAirstrikeVoice) when the airstrike is ordered — immediately,
              // whether he is already in the Flare's range or must walk there first.
              // (Previously the voice only played at the flare throw, so an
              // out-of-range order gave no immediate feedback.)
              var voice = gameObject.rules.voiceSecondaryWeaponAttack;
              if (voice) {
                this.game.events.dispatch(new v.TriggerSoundFxEvent(voice, gameObject.tile));
              }
              // OpenYRWeb: use the standard weapon-range check (footprint-aware,
              // the same one the primary weapon and the MoveInWeaponRangeTask use)
              // so Boris walks fully into the Flare's range before firing.
              if (this.rangeHelper.isInWeaponRange(gameObject, targetObj || targetTile, this.weapon, this.game.rules)) {
                this.phase = Phase.Firing;
                this._fire(gameObject);
              } else {
                this.phase = Phase.Approaching;
              }
            }

          onEnd(gameObject) {
            gameObject.isFiring = false;
          }

          onTick(gameObject) {
              if (this.isCancelling()) {
                return true;
              }
              if (!gameObject.airstrikeTrait) {
                return true;
              }
              if (gameObject.isDestroyed || gameObject.isCrashing) {
                return true;
              }
              // Phase: Firing — the strike has been launched (planes spawned or
              // redirected); the trait manages the planes from here on.
              if (this.phase === Phase.Firing) {
                return true;
              }
              // Phase: Approaching — move Boris into weapon range, then fire.
              var targetObj = this.target.obj;
              var targetTile = targetObj ? targetObj.tile : this.target.tile;
              if (targetObj && (targetObj.isDestroyed || !this.game.isValidTarget(targetObj))) {
                return true;
              }
              // Wait for the walk to finish: the MoveInWeaponRangeTask stops Boris at
              // the first waypoint inside the Flare's range, so firing after it has
              // completed means Boris is already stationary when the flare goes off —
              // cancelling a mid-path walk instead would carry him a few more steps
              // and interrupt the laser guidance.
              var moveChild = this.children.find((e) => e instanceof a.MoveInWeaponRangeTask);
              if (moveChild) {
                return false;
              }
              if (
                this._walkDone ||
                this.rangeHelper.isInWeaponRange(gameObject, targetObj || targetTile, this.weapon, this.game.rules)
              ) {
                this.phase = Phase.Firing;
                this._fire(gameObject);
                return true;
              }
              // Out of range — walk into range. The move task receives the target
              // object/tile, exactly like a normal AttackTask. Passing a Target
              // object here broke MoveTask pathfinding (MoveTask reads
              // targetTile.rx/ry directly, which a Target does not expose), so Boris
              // never walked into range and just fired the Flare from afar.
              var moveTask = new a.MoveInWeaponRangeTask(this.game, targetObj || targetTile, false, this.weapon);
              moveTask.blocking = false;
              this._walkDone = true;
              this.children.push(moveTask);
              return false;
            }

          getTargetLinesConfig() {
            return this.targetLinesConfig;
          }
        };
        e("AirstrikeAttackTask", AirstrikeAttackTask);
      },
    };
  },
);
