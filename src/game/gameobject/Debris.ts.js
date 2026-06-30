// === Reconstructed SystemJS module: game/gameobject/Debris ===
// deps: ["game/gameobject/GameObject","engine/type/ObjectType","game/gameobject/unit/ZoneType","game/Warhead","game/gameobject/unit/FacingUtil","game/gameobject/common/AnimTerrainEffect","game/gameobject/unit/CollisionHelper","game/gameobject/unit/CollisionType","game/math/Vector3","util/math","game/SpecialWarheadType"]
// Note: variable/type names are minified approximations of the original TypeScript.

System.register(
  "game/gameobject/Debris",
  [
    "game/gameobject/GameObject",
    "engine/type/ObjectType",
    "game/gameobject/unit/ZoneType",
    "game/Warhead",
    "game/gameobject/unit/FacingUtil",
    "game/gameobject/common/AnimTerrainEffect",
    "game/gameobject/unit/CollisionHelper",
    "game/gameobject/unit/CollisionType",
    "game/math/Vector3",
    "util/math",
    "game/SpecialWarheadType",
  ],
  function (e, t) {
    "use strict";
    var i, s, o, l, a, c, n, h, u, r, d, g;
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
          o = e;
        },
        function (e) {
          l = e;
        },
        function (e) {
          a = e;
        },
        function (e) {
          c = e;
        },
        function (e) {
          n = e;
        },
        function (e) {
          h = e;
        },
        function (e) {
          u = e;
        },
        function (e) {
          r = e;
        },
        function (e) {
          d = e;
        },
      ],
      execute: function () {
        ((g = class extends i.GameObject {
          static factory(e, t, i, r) {
            return new this(e, t, i, r);
          }
          constructor(e, t, i, r) {
            (super(s.ObjectType.Debris, e, t, i),
              (this.age = 0),
              (this.direction = 0),
              (this.rotationAxis = new u.Vector3()),
              (this.angularVelocity = 0),
              (this.zone = o.ZoneType.Air),
              (this.velocity = new u.Vector3()),
              (this.collisionHelper = new n.CollisionHelper(r)));
          }
          onSpawn(e) {
            (super.onSpawn(e),
              (this.direction = e.generateRandomInt(0, 359)),
              (this.xySpeed = r.lerp(0, this.rules.maxXYVel, e.generateRandom())),
              (this.zSpeed = r.lerp(
                this.rules.minZVel,
                this.rules.maxZVel || 1.5 * this.rules.minZVel,
                e.generateRandom(),
              )),
              this.rotationAxis.set(e.generateRandom(), e.generateRandom(), e.generateRandom()).normalize(),
              (this.angularVelocity = r.lerp(
                this.rules.minAngularVelocity,
                this.rules.maxAngularVelocity,
                e.generateRandom(),
              )));
          }
          update(t) {
            if ((super.update(t), this.age++, this.rules.duration && this.age > this.rules.duration))
              return (this.velocity.set(0, 0, 0), void this.detonate(t));
            --this.zSpeed;
            var i = a.FacingUtil.toMapCoords(this.direction).setLength(this.xySpeed);
            let r = new u.Vector3(i.x, this.zSpeed, i.y);
            var s = this.position.clone(),
              i = r.clone().add(this.position.worldPosition);
            if (t.map.isWithinHardBounds(i)) {
              this.position.moveByLeptons3(r);
              let e = !1;
              var { type: i, target: s } = this.collisionHelper.checkCollisions(this.position, s, {
                cliffs: !0,
                ground: !0,
                shore: !1,
                walls: !0,
                units: !1,
              });
              if (
                (i &&
                  (!(
                    [h.CollisionType.Ground, h.CollisionType.OnBridge].includes(i) &&
                    0 < this.rules.elasticity &&
                    t.map.getTileZone(this.tile) !== o.ZoneType.Water
                  ) || Math.abs(this.zSpeed) < 1
                    ? (e = !0)
                    : ((this.zSpeed = -this.zSpeed * this.rules.elasticity),
                      (this.velocity.y = -this.velocity.y * this.rules.elasticity),
                      this.rotationAxis.negate())),
                e)
              ) {
                if ((this.velocity.set(0, 0, 0), s && i === h.CollisionType.Wall)) {
                  let e = s.position.worldPosition;
                  this.position.moveByLeptons3(e.clone().sub(this.position.worldPosition));
                }
                this.detonate(t, i);
              } else this.velocity.copy(r);
            } else t.unspawnObject(this);
          }
          detonate(t, i = h.CollisionType.None) {
            var e,
              r = this.rules.warhead ? t.rules.getWarhead(this.rules.warhead) : void 0,
              s = (this.zone = this.collisionHelper.computeDetonationZone(this.tile, this.tileElevation, i));
            let a;
            (s === o.ZoneType.Water
              ? ((e = t.rules.combatDamage.splashList), (a = e[0]))
              : (e = this.rules.expireAnim) && t.rules.animationNames.has(e) && (a = e),
              (this.explodeAnim = a));
            let n = new c.AnimTerrainEffect();
            if ((a && n.spawnSmudges(a, this.tile, t), t.destroyObject(this), r)) {
              let e = new l.Warhead(r);
              e.detonate(
                t,
                this.rules.damage,
                this.tile,
                this.tileElevation,
                this.position.worldPosition,
                s,
                i,
                t.createTarget(void 0, this.tile),
                void 0,
                d.SpecialWarheadType.None,
                void 0,
                this.rules.damageRadius || void 0,
                !0,
              );
            }
          }
        }),
          e("Debris", g));
      },
    };
  },
);
