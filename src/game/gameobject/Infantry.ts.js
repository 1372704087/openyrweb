// === Reconstructed SystemJS module: game/gameobject/Infantry ===
// deps: ["engine/type/ObjectType","game/gameobject/unit/ZoneType","game/gameobject/infantry/StanceType","game/gameobject/infantry/InfDeathType","game/gameobject/trait/MoveTrait","game/gameobject/trait/SuppressionTrait","game/gameobject/Techno","game/gameobject/trait/IdleActionTrait","game/gameobject/trait/CrashableTrait","game/gameobject/trait/AgentTrait","game/gameobject/unit/CrateBonuses","game/gameobject/trait/CastProgressTrait","game/gameobject/trait/SlaveCargoTrait"]
// Note: variable/type names are minified approximations of the original TypeScript.

System.register(
  "game/gameobject/Infantry",
  [
    "engine/type/ObjectType",
    "game/gameobject/unit/ZoneType",
    "game/gameobject/infantry/StanceType",
    "game/gameobject/infantry/InfDeathType",
    "game/gameobject/trait/MoveTrait",
    "game/gameobject/trait/SuppressionTrait",
    "game/gameobject/Techno",
    "game/gameobject/trait/IdleActionTrait",
    "game/gameobject/trait/CrashableTrait",
    "game/gameobject/trait/AgentTrait",
    "game/gameobject/unit/CrateBonuses",
    "game/gameobject/trait/CastProgressTrait",
    "game/gameobject/trait/SlaveCargoTrait",
  ],
  function (e, t) {
    "use strict";
    var r, s, a, n, o, l, i, c, h, u, d, g, p, m;
    t && t.id;
    return {
      setters: [
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
        function (e) {
          l = e;
        },
        function (e) {
          i = e;
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
        function (e) {
          g = e;
        },
        function (e) {
          m = e;
        },
      ],
      execute: function () {
        ((p = class extends i.Techno {
          get isMoving() {
            return this.moveTrait.isMoving();
          }
          static factory(e, t, i, r) {
            let s = new this(e, t, i);
            return (
              (s.moveTrait = new o.MoveTrait(s, r)),
              s.traits.add(s.moveTrait),
              s.rules.crashable && ((s.crashableTrait = new h.CrashableTrait(s)), s.traits.add(s.crashableTrait)),
              s.rules.fearless || ((s.suppressionTrait = new l.SuppressionTrait()), s.traits.add(s.suppressionTrait)),
              s.rules.agent && ((s.agentTrait = new u.AgentTrait()), s.traits.add(s.agentTrait)),
              s.rules.engineer &&
                ((s.castProgressTrait = new g.CastProgressTrait()), s.traits.add(s.castProgressTrait)),
              (s.idleActionTrait = new c.IdleActionTrait()),
              s.traits.add(s.idleActionTrait),
              // OpenYRWeb: attach a lightweight cargo trait (SlaveCargoTrait) to infantry that
              // carry ore (Storage>0, e.g. SLAV slaves). Exposed as `harvesterTrait` so PipOverlay
              // renders ore pips. The full HarvesterTrait is NOT used because its auto-gather loop
              // would conflict with SlaveGatherTask; this trait is a passive cargo counter only.
              // Slaved infantry (SLAV) must always get a cargo trait with at least 3 storage so the
              // OREGATH mining animation and ore pips work even when rulesmd omits Storage=.
              (s.rules.slaved && (s.rules.storage = Math.max(s.rules.storage || 0, 3))),
              0 < s.rules.storage &&
                ((s.harvesterTrait = new m.SlaveCargoTrait(s.rules.storage)),
                s.traits.add(s.harvesterTrait)),
              s
            );
          }
          constructor(e, t, i) {
            (super(r.ObjectType.Infantry, e, t, i),
              (this.direction = 0),
              (this.onBridge = !1),
              (this.zone = s.ZoneType.Ground),
              (this._stance = a.StanceType.None),
              (this.isFiring = !1),
              (this.isPanicked = !1),
              (this.infDeathType = n.InfDeathType.Gunfire),
              (this.crateBonuses = new d.CrateBonuses()));
          }
          get stance() {
            return this._stance === a.StanceType.None && this.suppressionTrait?.isSuppressed()
              ? a.StanceType.Prone
              : this._stance;
          }
          set stance(e) {
            ((this._stance = e),
              this.moveTrait.setDisabled([a.StanceType.Deployed, a.StanceType.Cheer].includes(e)),
              this.attackTrait?.setDisabled([a.StanceType.Paradrop, a.StanceType.Cheer].includes(e)));
          }
          isUnit() {
            return !0;
          }
          isInfantry() {
            return !0;
          }
        }),
          e("Infantry", p),
          (p.SUB_CELLS = [2, 4, 3]));
      },
    };
  },
);
