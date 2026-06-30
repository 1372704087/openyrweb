// === Reconstructed SystemJS module: game/gameobject/task/EnterBuildingTask ===
// deps: ["game/gameobject/task/system/Task","game/gameobject/task/move/MoveOutsideTask","game/gameobject/task/move/MoveInsideTask","game/event/EnterObjectEvent","game/gameobject/task/move/MoveNextToTask","game/gameobject/unit/RangeHelper"]
// Note: variable/type names are minified approximations of the original TypeScript.

System.register(
  "game/gameobject/task/EnterBuildingTask",
  [
    "game/gameobject/task/system/Task",
    "game/gameobject/task/move/MoveOutsideTask",
    "game/gameobject/task/move/MoveInsideTask",
    "game/event/EnterObjectEvent",
    "game/gameobject/task/move/MoveNextToTask",
    "game/gameobject/unit/RangeHelper",
  ],
  function (t, e) {
    "use strict";
    var i, r, s, a, n, o, l, c;
    e && e.id;
    return {
      setters: [
        function (e) {
          i = e;
        },
        function (e) {
          r = e;
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
      ],
      execute: function () {
        var e;
        (((e = l = l || {})[(e.Initial = 0)] = "Initial"),
          (e[(e.MovingNear = 1)] = "MovingNear"),
          (e[(e.WaitingForDelay = 2)] = "WaitingForDelay"),
          (e[(e.MovingIn = 3)] = "MovingIn"),
          (e[(e.MovingOut = 4)] = "MovingOut"),
          (c = class extends i.Task {
            constructor(e, t, i = 0) {
              (super(),
                (this.game = e),
                (this.target = t),
                (this.enterDelaySeconds = i),
                (this.state = l.Initial),
                (this.preventOpportunityFire = !1),
                (this.rangeHelper = new o.RangeHelper(this.game.map.tileOccupation)));
            }
            onTick(t) {
              if ((this.isCancelling() && this.state === l.Initial) || t.moveTrait.isDisabled()) return !0;
              if (this.state === l.MovingOut) return !0;
              if (this.state === l.MovingIn && this.children.length)
                return (
                  t.tile === this.lastOutsideTile ||
                    this.game.map.tileOccupation.isTileOccupiedBy(t.tile, this.target) ||
                    (this.lastOutsideTile = t.tile),
                  !1
                );
              var e = this.state !== l.MovingIn && 0 < this.enterDelaySeconds,
                i = this.game.map.tileOccupation.isTileOccupiedBy(t.tile, this.target),
                i = e ? !i && this.rangeHelper.isInTileRange(t.tile, this.target, 0, Math.SQRT2) : i;
              if (this.state === l.Initial)
                if (e) {
                  if (((this.state = l.MovingNear), !i))
                    return (this.children.push(new n.MoveNextToTask(this.game, this.target)), !1);
                } else if (((this.state = l.MovingIn), !i))
                  return (
                    this.children.push(new s.MoveInsideTask(this.game, this.target).setBlocking(!1)),
                    !(this.preventOpportunityFire = !0)
                  );
              if (!i) return !0;
              if (!this.isAllowed(t) || this.isCancelling())
                return (
                  this.state !== l.MovingIn ||
                  (this.children.push(new r.MoveOutsideTask(this.game, this.target, this.lastOutsideTile)),
                  (this.state = l.MovingOut),
                  !1)
                );
              if (this.state === l.MovingNear) {
                this.lastOutsideTile = t.tile;
                let e = t.castProgressTrait;
                if (!e) throw new Error("Enter delay requires a unit with a cast progress trait");
                (e.reset(), e.start(this.enterDelaySeconds), (this.state = l.WaitingForDelay));
              }
              if (this.state !== l.WaitingForDelay)
                return (
                  this.game.events.dispatch(new a.EnterObjectEvent(this.target, t)),
                  !1 !== this.onEnter(t) ||
                    (this.children.push(new r.MoveOutsideTask(this.game, this.target, this.lastOutsideTile)),
                    (this.state = l.MovingOut),
                    !1)
                );
              {
                let e = t.castProgressTrait;
                return (e.isCasting() || e.isCompleted() || e.start(this.enterDelaySeconds), e.isCompleted())
                  ? (e.reset(),
                    (this.state = l.MovingIn),
                    this.children.push(new s.MoveInsideTask(this.game, this.target).setBlocking(!1)),
                    !(this.preventOpportunityFire = !0))
                  : !1;
              }
            }
            onEnd(e) {
              e.castProgressTrait?.reset();
            }
            getTargetLinesConfig(e) {
              return { target: this.target, pathNodes: [] };
            }
          }),
          t("EnterBuildingTask", c));
      },
    };
  },
);
