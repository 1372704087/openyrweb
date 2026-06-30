// === Reconstructed SystemJS module: game/superweapon/PsychicRevealEffect ===
// deps: ["game/superweapon/SuperWeaponEffect"]
// Note: variable/type names are minified approximations of the original TypeScript.
//
// OpenYRWeb (2026-06-30): Psychic Reveal — Yuri's map-reveal mini-superweapon, unlocked by
// building the Psychic Sensor (YAGGNT). When activated, it PERMANENTLY reveals a circular area
// of shroud (PsychicRevealRadius tiles) around the activation tile for the activating player.
// Implementation mirrors the RevealAroundWaypointExecutor trigger
// (mapShroudTrait.getPlayerShroud(player).revealAround(tile, radius)), but reveals only for the
// activating player (vanilla: Psychic Reveal is single-player intel, not a global reveal).
// revealAround is permanent (it does not expire — unlike revealTemporarily).

System.register("game/superweapon/PsychicRevealEffect", ["game/superweapon/SuperWeaponEffect"], function (e, t) {
  "use strict";
  var i, r;
  t && t.id;
  return {
    setters: [
      function (e) {
        i = e;
      },
    ],
    execute: function () {
      ((r = class extends i.SuperWeaponEffect {
        onStart(e) {
          var radius = (e.rules.combatDamage && e.rules.combatDamage.psychicRevealRadius) || 10;
          // Permanently reveal the area for the activating player only (single-player intel).
          if (this.owner) {
            var shroud = e.mapShroudTrait && e.mapShroudTrait.getPlayerShroud(this.owner);
            shroud && this.tile && shroud.revealAround(this.tile, radius);
          }
        }
        onTick(e) {
          return !0;
        }
      }),
        e("PsychicRevealEffect", r));
    },
  };
});
