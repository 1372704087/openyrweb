// === Reconstructed SystemJS module: game/order/AttackOrder ===
// deps: ["game/order/Order","game/order/OrderType","engine/type/PointerType","game/gameobject/task/AttackTask","game/gameobject/unit/RangeHelper","game/order/OrderFeedbackType","game/gameobject/unit/LosHelper","game/type/ArmorType","game/gameobject/task/PlantC4Task","game/gameobject/unit/ZoneType","game/gameobject/task/move/MoveTask","game/type/MovementZone","game/type/LocomotorType"]
// Note: variable/type names are minified approximations of the original TypeScript.

System.register(
  "game/order/AttackOrder",
  [
    "game/order/Order",
    "game/order/OrderType",
    "engine/type/PointerType",
    "game/gameobject/task/AttackTask",
    "game/gameobject/unit/RangeHelper",
    "game/order/OrderFeedbackType",
    "game/gameobject/unit/LosHelper",
    "game/type/ArmorType",
    "game/gameobject/task/PlantC4Task",
    "game/gameobject/unit/ZoneType",
    "game/gameobject/task/move/MoveTask",
    "game/type/MovementZone",
    "game/type/LocomotorType",
  ],
  function (e, t) {
    "use strict";
    var i, r, s, a, n, o, l, c, h, u, d, g, p, m;
    t && t.id;
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
        function (e) {
          g = e;
        },
        function (e) {
          p = e;
        },
      ],
      execute: function () {
        ((m = class extends i.Order {
          constructor(e, { forceAttack: t, noIvanBomb: i } = {}) {
            (super(t ? r.OrderType.ForceAttack : r.OrderType.Attack),
              (this.game = e),
              (this.isC4 = !1),
              (this.forceAttack = !!t),
              (this.ivanBombAllowed = !i || !!t),
              (this.targetOptional = !1),
              (this.feedbackType = o.OrderFeedbackType.None),
              (this.rangeHelper = new n.RangeHelper(this.game.map.tileOccupation)),
              (this.losHelper = new l.LosHelper(this.game.map.tiles, e.map.tileOccupation)));
          }
          getPointerType(e, t) {
            if (!this.isAllowed()) return e ? s.PointerType.NoActionMini : s.PointerType.NoAction;
            if (this.isC4) return s.PointerType.C4;
            var i = this.sourceObject.attackTrait?.selectWeaponVersus(
              this.sourceObject,
              this.target,
              this.game,
              this.forceAttack,
            );
            if (i?.rules.sabotageCursor) return s.PointerType.C4;
            if (this.ivanBombAllowed && this.sourceObject.rules.ivan && i?.warhead.rules.ivanBomb)
              return s.PointerType.Dynamite;
            if (i?.warhead.rules.bombDisarm) return s.PointerType.DefuseBomb;
            if (i && i.rules.damage < 0) return s.PointerType.RepairMove;
            i = t.every((e) => {
              if (!e.attackTrait) return !0;
              var t = e.attackTrait.selectWeaponVersus(e, this.target, this.game, this.forceAttack);
              return (
                !t ||
                (this.rangeHelper.isInWeaponRange(e, this.target.obj || this.target.tile, t, this.game.rules) &&
                  this.losHelper.hasLineOfSight(e, this.target.obj || this.target.tile, t))
              );
            });
            return e ? s.PointerType.AttackMini : i ? s.PointerType.AttackRange : s.PointerType.AttackNoRange;
          }
          isValid() {
            if (!this.sourceObject.attackTrait) return !1;
            if (
              this.forceAttack &&
              this.game.mapShroudTrait
                .getPlayerShroud(this.sourceObject.owner)
                ?.isShrouded(this.target.tile, this.target.obj?.tileElevation) &&
              !this.sourceObject.isBuilding()
            )
              return !1;
            let e = this.target.obj;
            var t = this.game.map.getGroundObjectsOnTile(this.target.tile).find((e) => e.isTerrain());
            if (
              ((this.terminal = !e && !t),
              this.sourceObject.c4 &&
                e?.isBuilding() &&
                e.c4ChargeTrait &&
                (this.forceAttack || !this.game.areFriendly(e, this.sourceObject) || e.cabHutTrait))
            )
              return ((this.isC4 = !0), (this.feedbackType = o.OrderFeedbackType.SpecialAttack), !0);
            if (((this.isC4 = !1), (this.feedbackType = o.OrderFeedbackType.Attack), !this.game.isValidTarget(e)))
              return !1;
            if (!e && t?.rules.immune) return !1;
            if (!(
              e ||
              this.target.tile !== this.sourceObject.tile ||
              (this.sourceObject.isUnit() && this.sourceObject.zone === u.ZoneType.Air)
            ))
              return !1;
            if (e === this.sourceObject) return !1;
            t = this.sourceObject.attackTrait.selectWeaponVersus(
              this.sourceObject,
              this.target,
              this.game,
              this.forceAttack,
            );
            // OpenYRWeb: if the selected weapon is the secondary weapon and the unit
            // has VoiceSecondaryWeaponAttack configured, use the dedicated feedback
            // type so the sound handler plays the correct voice line.
            t &&
              t === this.sourceObject.secondaryWeapon &&
              this.sourceObject.rules.voiceSecondaryWeaponAttack &&
              (this.feedbackType = o.OrderFeedbackType.SecondaryWeaponAttack);
            return (
              !!t &&
              !(!this.ivanBombAllowed && t.warhead.rules.ivanBomb) &&
              !(e?.isBuilding() && e.cabHutTrait && !t.warhead.rules.ivanBomb && !t.warhead.rules.bombDisarm) &&
              !!(
                (this.sourceObject.isUnit() &&
                  this.sourceObject.moveTrait &&
                  !this.sourceObject.moveTrait.isDisabled()) ||
                this.rangeHelper.isInWeaponRange(this.sourceObject, e || this.target.tile, t, this.game.rules)
              ) &&
              !(
                this.sourceObject.airSpawnTrait &&
                t.rules.spawner &&
                !this.game.map.isWithinBounds(this.target.tile)
              ) &&
              (!!this.forceAttack ||
                ((!e?.isBuilding() || !e.hospitalTrait) &&
                  !(!e || !e.healthTrait) &&
                  !e.isDestroyed &&
                  !e.isCrashing &&
                  (!(
                    !e.isOverlay() ||
                    !(t.warhead.rules.wall || (t.warhead.rules.wood && e.rules.armor === c.ArmorType.Wood))
                  ) ||
                    e.isTechno())))
            );
          }
          isAllowed() {
            return !this.sourceObject.attackTrait.isDisabled();
          }
          process() {
            if (this.isC4) return [new h.PlantC4Task(this.game, this.target.obj)];
            var e = this.sourceObject.attackTrait.selectWeaponVersus(
              this.sourceObject,
              this.target,
              this.game,
              this.forceAttack,
            );
            return [new a.AttackTask(this.game, this.target, e, { force: this.forceAttack })];
          }
          onAdd(t, e) {
            let i = this.sourceObject;
            if (!e && i.isUnit() && this.isValid() && this.isAllowed())
              if (i.rules.movementZone === g.MovementZone.Fly) {
                var r,
                  s = t.find(
                    (e) => (e.constructor === d.MoveTask || e.constructor === a.AttackTask) && !e.isCancelling(),
                  );
                let e;
                (s &&
                  (i.moveTrait.currentWaypoint?.tile === this.target.tile ||
                    i.isAircraft() ||
                    s.constructor === a.AttackTask ||
                    ((r = this.sourceObject.attackTrait.selectWeaponVersus(
                      this.sourceObject,
                      this.target,
                      this.game,
                      this.forceAttack,
                    )).projectileRules.vertical &&
                      s.constructor === d.MoveTask &&
                      this.rangeHelper.isInWeaponRange(
                        this.sourceObject,
                        this.target.obj || this.target.tile,
                        r,
                        this.game.rules,
                      ))) &&
                  (e = s),
                  e?.forceCancel(i) && t.splice(t.indexOf(e)));
              } else {
                t.length &&
                  i.isUnit() &&
                  (i.rules.locomotor === p.LocomotorType.Vehicle || i.rules.locomotor === p.LocomotorType.Ship) &&
                  (i.moveTrait.speedPenalty = 0.5);
                let e = t.find((e) => e.constructor === a.AttackTask && !e.isCancelling());
                if (e?.getWeapon().warhead.rules.temporal)
                  return (e.setForceAttack(this.forceAttack), e.requestTargetUpdate(this.target), !1);
              }
            return !0;
          }
        }),
          e("AttackOrder", m));
      },
    };
  },
);
