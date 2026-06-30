// === Reconstructed SystemJS module: game/gameobject/trait/SpawnLinkTrait ===
// deps: ["game/gameobject/task/AttackTask","game/gameobject/task/move/MoveTask","game/gameobject/unit/RangeHelper","game/gameobject/trait/AttackTrait","game/gameobject/trait/interface/NotifyTick"]
// Note: variable/type names are minified approximations of the original TypeScript.

System.register(
  "game/gameobject/trait/SpawnLinkTrait",
  [
    "game/gameobject/task/AttackTask",
    "game/gameobject/task/move/MoveTask",
    "game/gameobject/unit/RangeHelper",
    "game/gameobject/trait/AttackTrait",
    "game/gameobject/trait/interface/NotifyTick",
  ],
  function (e, t) {
    "use strict";
    var n, o, l, c, i, r;
    t && t.id;
    return {
      setters: [
        function (e) {
          n = e;
        },
        function (e) {
          o = e;
        },
        function (e) {
          l = e;
        },
        function (e) {
          c = e;
        },
        function (e) {
          i = e;
        },
      ],
      execute: function () {
        ((r = class {
          setParent(e) {
            this.parent = e;
          }
          getParent() {
            return this.parent;
          }
          [i.NotifyTick.onTick](r, s) {
            if (this.parent && r.attackTrait && r.primaryWeapon) {
              let e = this.parent.attackTrait?.currentTarget,
                t = r.unitOrderTrait.getCurrentTask(),
                i = new l.RangeHelper(s.map.tileOccupation);
              var a = this.parent.armedTrait?.getWeapons().find((e) => e.rules.spawner);
              r.ammo &&
              !(e && r.attackTrait.currentTarget
                ? e.equals(r.attackTrait.currentTarget)
                : e === r.attackTrait.currentTarget ||
                  (!e &&
                    this.parent.isUnit() &&
                    (this.parent.unitOrderTrait.getCurrentTask() instanceof o.MoveTask ||
                      this.parent.unitOrderTrait.getCurrentTask() instanceof n.AttackTask))) &&
              (!e || (a && i.isInWeaponRange(this.parent, e.obj ?? e.tile, a, s.rules)))
                ? e && r.primaryWeapon.targeting.canTarget(e.obj, e.tile, s, !0, !1)
                  ? !t || t instanceof o.MoveTask
                    ? (r.unitOrderTrait.cancelAllTasks(),
                      r.unitOrderTrait.addTask(
                        r.attackTrait.createAttackTask(s, e.obj, e.tile, r.primaryWeapon, { force: !0 }),
                      ))
                    : r.attackTrait.attackState !== c.AttackState.Idle && t.requestTargetUpdate(e)
                  : t
                    ? t instanceof o.MoveTask || t.cancel()
                    : this.tryMoveToParent(r, this.parent, s)
                : this.tryMoveToParent(r, this.parent, s);
            }
          }
          tryMoveToParent(t, i, r) {
            if (t.tile !== i.tile) {
              let e = t.unitOrderTrait.getCurrentTask();
              e
                ? e instanceof o.MoveTask && e.updateTarget(i.tile, !!i.isUnit() && i.onBridge)
                : t.unitOrderTrait.addTask(
                    new o.MoveTask(r, i.tile, !!i.isUnit() && i.onBridge, {
                      closeEnoughTiles: 0,
                      strictCloseEnough: !0,
                    }),
                  );
            }
          }
        }),
          e("SpawnLinkTrait", r));
      },
    };
  },
);
