// === Reconstructed SystemJS module: game/gameobject/trait/HarvesterTrait ===
// deps: ["game/gameobject/trait/interface/NotifyTick","game/gameobject/task/harvester/ReturnOreTask","game/gameobject/task/harvester/GatherOreTask","game/gameobject/trait/interface/NotifySpawn","game/gameobject/trait/interface/NotifyOwnerChange","game/GameSpeed","game/gameobject/trait/interface/NotifyTeleport","game/gameobject/trait/interface/NotifyOrder","game/order/OrderType","game/type/LandType","engine/type/TiberiumType"]
// Note: variable/type names are minified approximations of the original TypeScript.

System.register(
  "game/gameobject/trait/HarvesterTrait",
  [
    "game/gameobject/trait/interface/NotifyTick",
    "game/gameobject/task/harvester/ReturnOreTask",
    "game/gameobject/task/harvester/GatherOreTask",
    "game/gameobject/trait/interface/NotifySpawn",
    "game/gameobject/trait/interface/NotifyOwnerChange",
    "game/GameSpeed",
    "game/gameobject/trait/interface/NotifyTeleport",
    "game/gameobject/trait/interface/NotifyOrder",
    "game/order/OrderType",
    "game/type/LandType",
    "engine/type/TiberiumType",
  ],
  function (t, e) {
    "use strict";
    var i, s, a, r, n, o, l, c, h, u, d, g, p;
    e && e.id;
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
          r = e;
        },
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
          h = e;
        },
        function (e) {
          u = e;
        },
        function (e) {
          d = e;
        },
      ],
      execute: function () {
        var e;
        (((e = g || t("HarvesterStatus", (g = {})))[(e.Idle = 0)] = "Idle"),
          (e[(e.LookingForOreSite = 1)] = "LookingForOreSite"),
          (e[(e.MovingToOreSite = 2)] = "MovingToOreSite"),
          (e[(e.Harvesting = 3)] = "Harvesting"),
          (e[(e.LookingForRefinery = 4)] = "LookingForRefinery"),
          (e[(e.MovingToRefinery = 5)] = "MovingToRefinery"),
          (e[(e.Docking = 6)] = "Docking"),
          (e[(e.PreparingToUnload = 7)] = "PreparingToUnload"),
          (e[(e.Unloading = 8)] = "Unloading"),
          (p = class {
            get ore() {
              return this._ore;
            }
            get gems() {
              return this._gems;
            }
            constructor(e) {
              ((this.storage = e),
                (this._ore = 0),
                (this._gems = 0),
                (this.bails = new Map()),
                (this.status = g.Idle),
                (this.lastGatherExplicit = !1),
                (this.autoGatherOnNextIdle = !1),
                (this.ticksSinceLastRefineryCheck = 0),
                (this.ticksSinceLastOreCheck = 0));
            }
            addBails(e, t) {
              (this.bails.set(e, (this.bails.get(e) ?? 0) + t),
                e === d.TiberiumType.Gems ? (this._gems += t) : (this._ore += t));
            }
            getBails() {
              return [...this.bails.entries()];
            }
            [r.NotifySpawn.onSpawn](e, t) {
              e.owner.isCombatant() &&
                (t.afterTick(() => {
                  e.unitOrderTrait.addTask(new a.GatherOreTask(t));
                }),
                e.attackTrait?.increasePassiveScanCooldown(1));
            }
            [n.NotifyOwnerChange.onChange](e, t, i) {
              ((!t.isCombatant() && e.owner.isCombatant()) || i.alliances.areAllied(e.owner, t)) &&
                i.afterTick(() => {
                  e.unitOrderTrait.addTask(new a.GatherOreTask(i));
                });
            }
            [i.NotifyTick.onTick](e, t) {
              this.status === g.LookingForRefinery
                ? this.ticksSinceLastRefineryCheck++ > 5 * o.GameSpeed.BASE_TICKS_PER_SECOND &&
                  ((this.ticksSinceLastRefineryCheck = 0),
                  e.unitOrderTrait.hasTasks()
                    ? (this.ticksSinceLastRefineryCheck = -25 * o.GameSpeed.BASE_TICKS_PER_SECOND)
                    : [...e.owner.buildings].some((e) => e.rules.refinery) || this.lastGatherExplicit
                      ? e.unitOrderTrait.addTask(new s.ReturnOreTask(t))
                      : (this.status = g.Idle))
                : this.status === g.LookingForOreSite
                  ? this.ticksSinceLastOreCheck++ > 20 * o.GameSpeed.BASE_TICKS_PER_SECOND &&
                    ((this.ticksSinceLastOreCheck = 0),
                    e.unitOrderTrait.hasTasks() || e.unitOrderTrait.addTask(new a.GatherOreTask(t)))
                  : this.status === g.Idle &&
                    this.autoGatherOnNextIdle &&
                    e.unitOrderTrait.isIdle() &&
                    e.tile.landType === u.LandType.Tiberium &&
                    ((this.autoGatherOnNextIdle = !1), e.unitOrderTrait.addTask(new a.GatherOreTask(t, e.tile, !0)));
            }
            [l.NotifyTeleport.onBeforeTeleport](e, t, i, r) {
              !r &&
                e.owner.isCombatant() &&
                ((this.status = g.Idle),
                (this.lastOreSite = void 0),
                i &&
                  e.rules.teleporter &&
                  t.afterTick(() => {
                    e.unitOrderTrait.addTask(new (this.isFull() ? s.ReturnOreTask : a.GatherOreTask)(t));
                  }));
            }
            [c.NotifyOrder.onPush](e, t) {
              ((this.autoGatherOnNextIdle = [
                h.OrderType.AttackMove,
                h.OrderType.Move,
                h.OrderType.ForceMove,
                h.OrderType.Scatter,
              ].includes(t)),
                [g.LookingForRefinery, g.LookingForOreSite].includes(this.status) && (this.status = g.Idle));
            }
            isFull() {
              return this.ore + this.gems >= this.storage;
            }
            isEmpty() {
              return !this.ore && !this.gems;
            }
            empty() {
              (this.bails.clear(), (this._ore = this._gems = 0));
            }
            getHash() {
              return 100 * this.ore + this.gems;
            }
            debugGetState() {
              return { ore: this.ore, gems: this.gems };
            }
          }),
          t("HarvesterTrait", p));
      },
    };
  },
);
