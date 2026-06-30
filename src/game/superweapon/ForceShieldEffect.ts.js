// === Reconstructed SystemJS module: game/superweapon/ForceShieldEffect ===
// deps: ["game/map/tileFinder/RadialTileFinder","game/Coords","game/superweapon/SuperWeaponEffect"]
// Note: variable/type names are minified approximations of the original TypeScript.
//
// OpenYRWeb (2026-06-30, REVERSED): Force Shield super-weapon effect. REVERSED from yrmd.exe
// (ForceShieldDuration @ 0x0083bc4c, ForceShieldRadius @ 0x0083bc60, ForceShieldBlackoutDuration
// @ 0x0083bc30). When activated:
//   - Every techno (building) within ForceShieldRadius (leptons) of the activation tile gains
//     temporary invulnerability (invulnerableTrait.setActiveFor) for ForceShieldDuration frames.
//     This reuses the SAME invulnerability mechanism as Iron Curtain (Warhead.computeDamage
//     checks invulnerableTrait.isActive() at Warhead.ts.js:137).
//   - The activating player's power is BLACKED OUT (low-power) for ForceShieldBlackoutDuration
//     frames — the cost of the shield. Uses PowerTrait.setBlackoutFor (the same path Spy
//     infiltration uses, AgentTrait.ts.js:27). During blackout all the player's base defenses /
//   production slow (vanilla Force Shield trade-off).
// Unlike Iron Curtain (which kills organic technos in radius), Force Shield only shields — it
// does not damage anything. It is intended to protect the owner's own base from a super-weapon
// strike (Nuke / Lightning Storm / Psychic Dominator).

System.register(
  "game/superweapon/ForceShieldEffect",
  ["game/map/tileFinder/RadialTileFinder", "game/Coords", "game/superweapon/SuperWeaponEffect"],
  function (e, t) {
    "use strict";
    var n, C, i, r;
    t && t.id;
    return {
      setters: [
        function (e) {
          n = e;
        },
        function (e) {
          C = e;
        },
        function (e) {
          i = e;
        },
      ],
      execute: function () {
        ((r = class extends i.SuperWeaponEffect {
          onStart(e) {
            var cd = e.rules.combatDamage;
            var duration = (cd && cd.forceShieldDuration) || 0;
            var radiusLeptons = (cd && cd.forceShieldRadius) || 0;
            var blackout = (cd && cd.forceShieldBlackoutDuration) || 0;
            // Shield every techno within ForceShieldRadius of the activation tile.
            if (duration > 0 && radiusLeptons > 0) {
              var maxTiles = Math.max(1, Math.round(radiusLeptons / C.Coords.LEPTONS_PER_TILE));
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
                    o.invulnerableTrait.setActiveFor(duration, e.currentTick);
            }
            // Cost: blackout the activating player's power for ForceShieldBlackoutDuration frames.
            if (blackout > 0 && this.owner && this.owner.powerTrait)
              this.owner.powerTrait.setBlackoutFor(blackout, e);
          }
          onTick(e) {
            return !0;
          }
        }),
          e("ForceShieldEffect", r));
      },
    };
  },
);
