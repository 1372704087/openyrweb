// === Reconstructed SystemJS module: game/superweapon/DominatorEffect ===
// deps: ["game/map/tileFinder/RadialTileFinder","game/Warhead","game/superweapon/SuperWeaponEffect","game/event/TriggerAnimEvent","game/GameSpeed","game/Coords"]
// Note: variable/type names are minified approximations of the original TypeScript.
//
// OpenYRWeb: Psychic Dominator superweapon effect (YR). On fire it:
//   1. Plays DominatorFirstAnim immediately (giant Yuri head in sky).
//   2. Waits until DominatorFireAtPercentage of FirstAnim's duration has elapsed.
//   3. At that fire point: detonates the DominatorWarhead (area damage to buildings),
//      captures enemy organic units, dispatches a TriggerAnimEvent for DominatorSecondAnim
//      (ground ring), and the SuperWeaponFxHandler adds the pure-red screen tint.
// This mirrors the vanilla YR sequencing.
//
// NOTE: onTick return convention — return !1 (false) keeps the effect running;
// return !0 (true) marks the effect as finished (per SuperWeaponsTrait line 104:
// "r.onTick(t) && (finish)").

System.register(
  "game/superweapon/DominatorEffect",
  ["game/map/tileFinder/RadialTileFinder", "game/Warhead", "game/superweapon/SuperWeaponEffect", "game/event/TriggerAnimEvent", "game/GameSpeed", "game/Coords"],
  function (e, t) {
    "use strict";
    var n, i, r, s, a, l;
    t && t.id;
    return {
      setters: [
        function (e) {
          n = e;
        },
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
          l = e;
        },
      ],
      execute: function () {
        var d;
        e(
          "DominatorEffect",
          (d = class extends r.SuperWeaponEffect {
            constructor(e, t, i) {
              super(e, t, i);
              this._fireTicksLeft = 0;
              this._hasFired = false;
            }
            onStart(e) {
              var av = e.rules.audioVisual;
              this._hasFired = false;
              // Calculate fire delay from FirstAnim duration * DominatorFireAtPercentage
              var firePct = av.dominatorFireAtPercentage || 100;
              this._fireTicksLeft = Math.floor(60 * firePct / 100); // fallback default
              if (av.dominatorFirstAnim && firePct < 100) {
                try {
                  var animArt = e.art.getAnimation(av.dominatorFirstAnim);
                  if (animArt && animArt.art) {
                    var rateRaw = animArt.art.getNumber("Rate", 60 * a.GameSpeed.BASE_TICKS_PER_SECOND);
                    var endFrame = animArt.art.getNumber("End", 60);
                    var frameCount = endFrame + 1;
                    var rateFPS = rateRaw / 60;
                    var totalTicks = Math.ceil((a.GameSpeed.BASE_TICKS_PER_SECOND / rateFPS) * frameCount);
                    this._fireTicksLeft = Math.floor(totalTicks * firePct / 100);
                  }
                } catch (_) {
                  // fallback already set above
                }
              }
              // Ensure at least 1 tick delay when percentage < 100
              if (firePct < 100 && this._fireTicksLeft < 1) this._fireTicksLeft = 1;
            }
            onTick(e) {
              // onTick return: !1 = keep running, !0 = finished
              if (this._hasFired) return !0; // already fired → done
              if (0 < this._fireTicksLeft) {
                this._fireTicksLeft--;
                return !1; // still waiting → keep running
              }
              // Time to fire — apply warhead damage and capture units
              this._hasFired = !0;
              var t,
                a = e.rules.audioVisual,
                ctx = { player: this.owner };
              // 1. Detonate the Dominator warhead for area damage + visual effects.
              if (a.dominatorWarhead) {
                var o = new i.Warhead(e.rules.getWarhead(a.dominatorWarhead));
                o.detonate(
                  e,
                  a.dominatorDamage,
                  this.tile,
                  0,
                  l.Coords.tile3dToWorld(this.tile.rx + 0.5, this.tile.ry + 0.5, this.tile.z),
                  e.map.getTileZone(this.tile),
                  0,
                  { obj: void 0, getBridge: void 0 },
                  { player: this.owner },
                );
              }
              // 2. Capture enemy organic units in range that survived the blast.
              var d = a.dominatorCaptureRange;
              if (0 < d)
                for (
                  var u = new n.RadialTileFinder(
                      e.map.tiles,
                      e.map.mapBounds,
                      this.tile,
                      { width: 1, height: 1 },
                      0,
                      d,
                      () => !0,
                    );
                  (t = u.getNextTile());

                )
                  for (var c of e.map.getGroundObjectsOnTile(t))
                    !c.isTechno() ||
                      c.isDestroyed ||
                      c.owner === this.owner ||
                      e.alliances.areAllied(c.owner, this.owner) ||
                      c.rules.immuneToPsionics ||
                      c.isBuilding() ||
                      !c.mindControllableTrait ||
                      c.mindControllableTrait.isActive() ||
                      (c.isUnit() && c.tile !== t) ||
                      e.changeObjectOwner(c, this.owner);
              // 3. Dispatch TriggerAnimEvent for SecondAnim (ground halo/ring).
              if (a.dominatorSecondAnim) {
                e.events.dispatch(new s.TriggerAnimEvent(a.dominatorSecondAnim, this.tile));
              }
              return !0; // fired → done (finished)
            }
          }),
        );
      },
    };
  },
);
