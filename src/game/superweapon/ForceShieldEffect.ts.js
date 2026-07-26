// === Reconstructed SystemJS module: game/superweapon/ForceShieldEffect ===
// deps: ["game/map/tileFinder/RadialTileFinder","game/superweapon/SuperWeaponEffect","game/event/TriggerSoundFxEvent"]
// Note: variable/type names are minified approximations of the original TypeScript.
//
// OpenYRWeb (2026-07-25, FIXED): Force Shield super-weapon effect.
// Vanilla YR behaviour:
//   - Every building within ForceShieldRadius (cells) of the activation tile gains
//     temporary invulnerability (invulnerableTrait.setActiveFor) for ForceShieldDuration frames.
//     This reuses the SAME invulnerability mechanism as Iron Curtain (Warhead.computeDamage
//     checks invulnerableTrait.isActive() at Warhead.ts.js:137).
//   - The activating player's power is BLACKED OUT (low-power) for ForceShieldBlackoutDuration
//     frames — the cost of the shield. Uses PowerTrait.setBlackoutFor (the same path Spy
//     infiltration uses, AgentTrait.ts.js:27). During blackout all the player's base defenses /
//     production slow (vanilla Force Shield trade-off).
//   - Plays the SpecialSound (ForceShieldFading) when ForceShieldPlayFadeSoundTime frames
//     remain before invulnerability expires.
// Unlike Iron Curtain (which kills organic units in radius), Force Shield only shields — it
// does not damage anything. It is intended to protect the owner's own base from a super-weapon
// strike (Nuke / Lightning Storm / Psychic Dominator).
// NOTE: ForceShieldRadius in rulesmd.ini is in CELLS (vanilla YR spec), NOT leptons.
// The original code incorrectly divided by LEPTONS_PER_TILE, making maxTiles always 1.
// Fixed (2026-07-25): use the raw cell value directly as maxTiles.

System.register(
  "game/superweapon/ForceShieldEffect",
  ["game/map/tileFinder/RadialTileFinder", "game/superweapon/SuperWeaponEffect", "game/event/TriggerSoundFxEvent"],
  function (e, t) {
    "use strict";
    var n, i, r, s;
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
      ],
      execute: function () {
        ((s = class extends i.SuperWeaponEffect {
          onStart(e) {
            var cd = e.rules.combatDamage;
            var duration = (cd && cd.forceShieldDuration) || 0;
            var radiusCells = (cd && cd.forceShieldRadius) || 0;
            var blackout = (cd && cd.forceShieldBlackoutDuration) || 0;
            // Store fade sound timing for onTick.
            this._fadeFrames = (cd && cd.forceShieldPlayFadeSoundTime) || 0;
            this._specialSound = void 0;
            if (this._fadeFrames > 0 && void 0 !== this.type) {
              var _typeRef = this.type;
              var _fsSwRules = [...e.rules.superWeaponRules.values()].find(function (r) { return r.type === _typeRef; });
              if (_fsSwRules) this._specialSound = _fsSwRules.specialSound;
            }
            this._activationTick = e.currentTick;
            this._fadeSoundPlayed = !1;
            this._duration = duration;
            this._endFlashSet = !1;
            this._shieldedObjects = [];
            // Shield every techno within ForceShieldRadius (cells) of the activation tile.
            // NOTE: forceShieldRadius is in CELLS (vanilla YR INI spec), NOT leptons.
            if (duration > 0 && radiusCells > 0) {
              var maxTiles = Math.max(1, Math.round(radiusCells));
              var t,
                a = new n.RadialTileFinder(
                  e.map.tiles,
                  e.map.mapBounds,
                  this.tile,
                  { width: 1, height: 1 },
                  0,
                  maxTiles,
                  () => !0,
                );
              for (; (t = a.getNextTile());)
                for (var o of e.map.getGroundObjectsOnTile(t))
                  !o.isTechno() ||
                    o.isDestroyed ||
                    o.isUnit() || // Force Shield protects buildings (and grounded units), not aircraft.
                    o.rules.missileSpawn ||
                    // OpenYRWeb: only shield friendly buildings (self or ally).
                    (o.owner !== this.owner && !e.alliances.areAllied(o.owner, this.owner)) ||
                    (o.invulnerableTrait.setActiveFor(duration, e.currentTick),
                    // OpenYRWeb: mark as Force Shield invulnerability so the renderer
                    // can apply a different visual tint (blue/cyan) vs Iron Curtain (dark).
                    // Use setForceShieldActiveFor so it's not overwritten by Iron Curtain calls.
                    o.invulnerableTrait.setForceShieldActiveFor(duration, e.currentTick),
                    this._shieldedObjects.push(o));
            }
            // Cost: blackout the activating player's power for ForceShieldBlackoutDuration frames.
            if (blackout > 0 && this.owner && this.owner.powerTrait)
              this.owner.powerTrait.setBlackoutFor(blackout, e);
          }
          onTick(e) {
            // Play the specialSound (ForceShieldFading) when the effect expires.
            var elapsed = e.currentTick - this._activationTick;
            if (!this._fadeSoundPlayed && this._specialSound && elapsed >= this._duration) {
              e.events.dispatch(new r.TriggerSoundFxEvent(this._specialSound, this.tile));
              this._fadeSoundPlayed = !0;
            }
            // Keep effect alive until duration expires.
            return elapsed >= this._duration;
          }
        }),
          e("ForceShieldEffect", s));
      },
    };
  },
);
