// === Reconstructed SystemJS module: game/gameobject/trait/DisguiseTrait ===
// deps: ["engine/type/ObjectType","game/event/ObjectDisguiseChangeEvent","game/SideType","game/gameobject/trait/AttackTrait","game/gameobject/trait/interface/NotifyDamage","game/gameobject/trait/interface/NotifySpawn","game/gameobject/trait/interface/NotifyTick","game/gameobject/trait/MoveTrait"]
// Note: variable/type names are minified approximations of the original TypeScript.

System.register(
  "game/gameobject/trait/DisguiseTrait",
  [
    "engine/type/ObjectType",
    "game/event/ObjectDisguiseChangeEvent",
    "game/SideType",
    "game/gameobject/trait/AttackTrait",
    "game/gameobject/trait/interface/NotifyDamage",
    "game/gameobject/trait/interface/NotifySpawn",
    "game/gameobject/trait/interface/NotifyTick",
    "game/gameobject/trait/MoveTrait",
  ],
  function (e, t) {
    "use strict";
    var r, s, i, a, n, o, l, c, h;
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
          i = e;
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
          c = e;
        },
      ],
      execute: function () {
        ((h = class {
          constructor() {
            ((this.isActive = !1), (this.cooldownTicks = 0));
          }
          isDisguised() {
            return this.isActive;
          }
          getDisguise() {
            return this.isActive ? this.disguisedAs : void 0;
          }
          hasTerrainDisguise() {
            return this.getDisguise()?.rules.type === r.ObjectType.Terrain;
          }
          disguiseAs(e, t, i) {
            ((this.disguisedAs = { rules: e.rules, owner: e.owner }),
              (this.isActive = !0),
              i.events.dispatch(new s.ObjectDisguiseChangeEvent(t)));
          }
          revealDisguise(e, t) {
            ((this.cooldownTicks = t.rules.general.infantryBlinkDisguiseTime),
              (this.isActive = !1),
              t.events.dispatch(new s.ObjectDisguiseChangeEvent(e)));
          }
          [o.NotifySpawn.onSpawn](e, t) {
            var i;
            !this.disguisedAs &&
              e.rules.permaDisguise &&
              e.isInfantry() &&
              e.owner.country &&
              (i = this.getDefaultInfantryDisguise(e.owner.country.side, t.rules.general)) &&
              ((i = t.rules.getObject(i, r.ObjectType.Infantry)),
              (this.disguisedAs = { rules: i, owner: e.owner }),
              (this.isActive = !0));
          }
          getDefaultInfantryDisguise(e, t) {
            switch (e) {
              case i.SideType.GDI:
                return t.alliedDisguise;
              case i.SideType.Nod:
                return t.sovietDisguise;
              case i.SideType.ThirdSide:
                return t.thirdDisguise;
              default:
                return;
            }
          }
          [l.NotifyTick.onTick](e, t) {
            e.rules.permaDisguise ||
              (e.attackTrait?.attackState === a.AttackState.JustFired || e.moveTrait.moveState !== c.MoveState.Idle
                ? this.revealDisguise(e, t)
                : 0 < this.cooldownTicks
                  ? this.cooldownTicks--
                  : !this.isActive &&
                    e.rules.disguiseWhenStill &&
                    ((this.isActive = !0),
                    (this.disguisedAs = { rules: this.selectRandomMirageDisguise(t), owner: void 0 }),
                    t.events.dispatch(new s.ObjectDisguiseChangeEvent(e))));
          }
          [n.NotifyDamage.onDamage](e, t) {
            this.revealDisguise(e, t);
          }
          selectRandomMirageDisguise(e) {
            var t = e.rules.general.defaultMirageDisguises;
            if (!t.length) throw new Error("No default mirage disguises are defined");
            t = t[e.generateRandomInt(0, t.length - 1)];
            return e.rules.getObject(t, r.ObjectType.Terrain);
          }
        }),
          e("DisguiseTrait", h));
      },
    };
  },
);
