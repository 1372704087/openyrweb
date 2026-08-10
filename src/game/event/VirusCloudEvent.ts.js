// === Reconstructed SystemJS module: game/event/VirusCloudEvent ===
// deps: ["game/event/EventType"]
// Note: variable/type names are minified approximations of the original TypeScript.

System.register("game/event/VirusCloudEvent", ["game/event/EventType"], function (e, t) {
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
      e(
        "VirusCloudEvent",
        (r = class {
          // OpenYRWeb: Virus sniper toxic cloud visual event. Dispatched by VirusCloudTrait
          // when an independent gas particle is created (action="spawn", main cloud or its
          // NextParticle dissipation cloud) and when it expires (action="remove"). The engine
          // side (VirusCloudFxHandler) consumes these to keep visuals in sync with the
          // deterministic game logic.
          constructor(e, t, s, n, l, h, v) {
            ((this.action = e),
              (this.cloudId = t),
              (this.tile = s),
              (this.lifetimeTicks = n),
              // Exact world position the particle sits at (spawn only) — puffs appear where
              // the victim was standing, not snapped to the tile centre.
              (this.position = l),
              // Per-particle visual config resolved from the md particle section:
              // { image, translucency, stateAIAdvance }.
              (this.visual = h),
              // Deterministic drift velocity in leptons/game-tick (locked-step, from the
              // game PRNG). The fx handler re-derives the puff position from
              // (currentTick - spawnTick) * vel so visuals stay glued to the damage zone.
              (this.vel = v),
              (this.type = i.EventType.VirusCloud));
          }
        }),
      );
    },
  };
});
