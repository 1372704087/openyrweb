// === Reconstructed SystemJS module: game/gameobject/task/CaptureBuildingTask ===
// deps: ["game/gameobject/Building","game/event/BuildingCaptureEvent","game/Warhead","game/gameobject/unit/CollisionType","game/gameobject/unit/ZoneType","game/gameobject/task/EnterBuildingTask","game/SpecialWarheadType"]
// Note: variable/type names are minified approximations of the original TypeScript.

System.register(
  "game/gameobject/task/CaptureBuildingTask",
  [
    "game/gameobject/Building",
    "game/event/BuildingCaptureEvent",
    "game/Warhead",
    "game/gameobject/unit/CollisionType",
    "game/gameobject/unit/ZoneType",
    "game/gameobject/task/EnterBuildingTask",
    "game/SpecialWarheadType",
  ],
  function (e, t) {
    "use strict";
    var i, s, a, n, o, r, l, c;
    t && t.id;
    return {
      setters: [
        function (e) {
          i = e;
        },
        function (e) {
          s = e;
        },
        function (e) {
          a = e;
        },
        function (e) {
          n = e;
        },
        function (e) {
          o = e;
        },
        function (e) {
          r = e;
        },
        function (e) {
          l = e;
        },
      ],
      execute: function () {
        ((c = class c extends r.EnterBuildingTask {
          static getCaptureDelaySeconds(e, t) {
            return !(
              e.gameOpts.multiEngineer ||
              e.gameOpts.instantCapture ||
              t.owner.isNeutral ||
              t.rules.needsEngineer
            )
              ? e.rules.general.engineerCaptureDelay
              : 0;
          }
          constructor(e, t) {
            super(e, t, c.getCaptureDelaySeconds(e, t));
          }
          isAllowed(e) {
            return (
              e.rules.engineer &&
              this.target.rules.capturable &&
              !this.target.isDestroyed &&
              this.target.buildStatus !== i.BuildStatus.BuildDown &&
              !this.target.secureProgressTrait?.isActiveFrom(e.owner) &&
              !this.game.areFriendly(e, this.target)
            );
          }
          onEnter(t) {
            if ((this.game.unspawnObject(t), this.game.gameOpts.multiEngineer)) {
              var i = this.game.rules.general;
              if (
                (!this.target.rules.needsEngineer || !i.engineerAlwaysCaptureTech) &&
                this.target.healthTrait.health > 100 * i.engineerCaptureLevel
              ) {
                var r = Math.floor(i.engineerDamage * this.target.healthTrait.maxHitPoints),
                  i = Math.floor(
                    (1 - Math.floor(1 / i.engineerDamage) * i.engineerDamage) * this.target.healthTrait.maxHitPoints,
                  );
                if (0 < (r = Math.min(r, this.target.healthTrait.getHitPoints() - i))) {
                  i = this.game.rules.combatDamage.c4Warhead;
                  let e = new a.Warhead(this.game.rules.getWarhead(i));
                  return void e.detonate(
                    this.game,
                    r,
                    this.target.tile,
                    0,
                    this.target.position.worldPosition,
                    o.ZoneType.Ground,
                    n.CollisionType.None,
                    this.game.createTarget(this.target, this.target.tile),
                    { player: t.owner, obj: t, weapon: void 0 },
                    l.SpecialWarheadType.None,
                    void 0,
                    0,
                  );
                }
              }
            }
            (this.game.gameOpts.delayedOils &&
              this.target.owner.isNeutral &&
              this.target.secureProgressTrait?.start(this.target, t.owner)) ||
              (t.owner.buildingsCaptured++,
              this.game.changeObjectOwner(this.target, t.owner),
              this.game.events.dispatch(new s.BuildingCaptureEvent(this.target)));
          }
        }),
          e("CaptureBuildingTask", c));
      },
    };
  },
);
