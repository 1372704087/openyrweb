// === Reconstructed SystemJS module: game/gameobject/GameObject ===
// deps: ["engine/type/ObjectType","game/Traits","game/gameobject/trait/interface/NotifyTick","game/gameobject/trait/interface/NotifyDestroy","util/math","game/gameobject/trait/interface/NotifyOwnerChange","game/gameobject/trait/interface/NotifySpawn","game/gameobject/trait/interface/NotifyUnspawn","game/gameobject/trait/interface/NotifyAttack","game/gameobject/common/DeathType"]
// Note: variable/type names are minified approximations of the original TypeScript.

System.register(
  "game/gameobject/GameObject",
  [
    "engine/type/ObjectType",
    "game/Traits",
    "game/gameobject/trait/interface/NotifyTick",
    "game/gameobject/trait/interface/NotifyDestroy",
    "util/math",
    "game/gameobject/trait/interface/NotifyOwnerChange",
    "game/gameobject/trait/interface/NotifySpawn",
    "game/gameobject/trait/interface/NotifyUnspawn",
    "game/gameobject/trait/interface/NotifyAttack",
    "game/gameobject/common/DeathType",
  ],
  function (e, t) {
    "use strict";
    var i, s, r, a, n, o, l, c, h, u, d;
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
          r = e;
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
      ],
      execute: function () {
        e(
          "GameObject",
          (d = class {
            get tile() {
              return this.position.tile;
            }
            get tileElevation() {
              return this.position.tileElevation;
            }
            constructor(e, t, i, r) {
              ((this.traits = new s.Traits()),
                (this.cachedTraits = { tick: [] }),
                (this.isCrashing = !1),
                (this.isDestroyed = !1),
                (this.deathType = u.DeathType.Normal),
                (this.isDisposed = !1),
                (this.isSpawned = !1),
                (this.type = e),
                (this.name = t),
                (this.rules = i),
                (this.art = r));
            }
            getFoundation() {
              return { width: 1, height: 1 };
            }
            isSmudge() {
              return this.type === i.ObjectType.Smudge;
            }
            isOverlay() {
              return this.type === i.ObjectType.Overlay;
            }
            isTerrain() {
              return this.type === i.ObjectType.Terrain;
            }
            isProjectile() {
              return this.type === i.ObjectType.Projectile;
            }
            isDebris() {
              return this.type === i.ObjectType.Debris;
            }
            isBuilding() {
              return !1;
            }
            isInfantry() {
              return !1;
            }
            isVehicle() {
              return !1;
            }
            isAircraft() {
              return !1;
            }
            isUnit() {
              return !1;
            }
            isTechno() {
              return !1;
            }
            update(e) {
              for (var t of this.cachedTraits.tick) t[r.NotifyTick.onTick](this, e);
            }
            onSpawn(t) {
              ((this.isSpawned = !0),
                this.traits.filter(l.NotifySpawn).forEach((e) => {
                  e[l.NotifySpawn.onSpawn](this, t);
                }));
            }
            onUnspawn(t) {
              ((this.isSpawned = !1),
                this.traits.filter(c.NotifyUnspawn).forEach((e) => {
                  e[c.NotifyUnspawn.onUnspawn](this, t);
                }));
            }
            onDestroy(t, i, r) {
              this.traits.filter(a.NotifyDestroy).forEach((e) => {
                e[a.NotifyDestroy.onDestroy](this, t, i, r);
              });
            }
            onOwnerChange(t, i) {
              this.traits.filter(o.NotifyOwnerChange).forEach((e) => {
                e[o.NotifyOwnerChange.onChange](this, t, i);
              });
            }
            onAttack(t, i) {
              this.traits.filter(h.NotifyAttack).forEach((e) => {
                e[h.NotifyAttack.onAttack](this, i, t);
              });
            }
            addTrait(e) {
              (this.traits.add(e), e[r.NotifyTick.onTick] && this.cachedTraits.tick.push(e));
            }
            getUiName() {
              return this.rules.uiName;
            }
            getHash() {
              var e = this.position.worldPosition;
              return n.fnv32a([
                this.id,
                ...new Uint8Array(new Float64Array([e.x || 0, e.y || 0, e.z || 0]).buffer),
                ...this.traits.getAll().map((e) => e.getHash?.() ?? 0),
              ]);
            }
            debugGetState() {
              return {
                id: this.id,
                position: this.position.worldPosition.toArray(),
                traits: this.traits.getAll().reduce((e, t) => {
                  var i = t.debugGetState?.();
                  return (void 0 !== i && (e[t.constructor.name] = i), e);
                }, {}),
              };
            }
            dispose() {
              ((this.isDisposed = !0), this.traits.dispose(), (this.cachedTraits.tick.length = 0));
            }
          }),
        );
      },
    };
  },
);
