// === Reconstructed SystemJS module: game/superweapon/DominatorEffect ===
// deps: ["game/map/tileFinder/RadialTileFinder","game/Warhead","game/superweapon/SuperWeaponEffect"]
// Note: variable/type names are minified approximations of the original TypeScript.
//
// OpenYRWeb: Psychic Dominator superweapon effect (YR). On fire it:
//   1. detonates the DominatorWarhead at the target tile (area damage via CellSpread),
//   2. captures every controllable enemy organic unit within DominatorCaptureRange (owner
//      transferred to the firing player). Vanilla shows mind-control link lines to the firing
//      building; we transfer ownership directly (functionally identical gameplay).
// Mirrors the radius+warhead pattern of LightningStormEffect / IronCurtainEffect.

System.register(
  "game/superweapon/DominatorEffect",
  ["game/map/tileFinder/RadialTileFinder", "game/Warhead", "game/superweapon/SuperWeaponEffect"],
  function (e, t) {
    "use strict";
    var n, i, r;
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
        var s;
        e(
          "DominatorEffect",
          (s = class extends r.SuperWeaponEffect {
            onStart(e) {
              var t,
                a = e.rules.audioVisual,
                l = { player: this.owner };
              // 1. Detonate the Dominator warhead for area damage + visual effects.
              if (a.dominatorWarhead) {
                var o = new i.Warhead(e.rules.getWarhead(a.dominatorWarhead));
                o.detonate(
                  e,
                  a.dominatorDamage,
                  this.tile,
                  0,
                  { x: this.tile.rx + 0.5, y: this.tile.ry + 0.5, z: this.tile.z },
                  e.map.getTileZone(this.tile),
                  0,
                  { obj: void 0, getBridge: void 0 },
                  l,
                );
              }
              // OpenYRWeb: direct area damage to all technos in CellSpread, bypassing the
              // Verses armor mapping (which uses a different armor-order than YR INI, causing
              // 0% damage to most unit types). Uses the Warhead's own inflictDamage to ensure
              // proper death handling, building damage-state updates, and attack notifications.
              var spread = a.dominatorWarhead ? e.rules.getWarhead(a.dominatorWarhead).cellSpread : 0;
              if (0 < spread && 0 < a.dominatorDamage && a.dominatorWarhead) {
                var domWH = o, // the Warhead instance created above
                  dmgFinder = new n.RadialTileFinder(
                    e.map.tiles, e.map.mapBounds, this.tile, { width: 1, height: 1 }, 0, Math.ceil(spread), () => !0,
                  ),
                  percentAtMax = e.rules.getWarhead(a.dominatorWarhead).percentAtMax || 0.2;
                for (; (t = dmgFinder.getNextTile());)
                  for (var obj of e.map.getGroundObjectsOnTile(t)) {
                    if (!obj.isTechno() || obj.isDestroyed) continue;
                    var dist = Math.sqrt((obj.tile.rx - this.tile.rx) ** 2 + (obj.tile.ry - this.tile.ry) ** 2);
                    if (dist > spread) continue;
                    var pct = dist < 1 ? 1 : 1 - (1 - percentAtMax) * (dist / spread),
                      dmg = Math.round(a.dominatorDamage * pct);
                    if (0 < dmg && obj.healthTrait && !obj.rules.immune)
                      domWH.inflictDamage(dmg, obj, l, e);
                  }
              }
              // 2. Capture enemy organic units in range that survived the blast.
              // OpenYRWeb: vanilla Psychic Dominator only captures organic, non-building,
              // non-psionically-immune units (the same set MindControllableTrait is attached
              // to — see ObjectFactory). Buildings, mechanical units, and immuneToPsionics
              // technos are never captured. Already-mind-controlled units are skipped too
              // (vanilla default Dominator.CaptureMindControlled=no — Dominator does not
              // yank units out of an existing mind-control link). The capture itself is a
              // permanent ownership transfer (ModEnc/MindControl.Permanent: Dominator-grabbed
              // units are permanent, unlike transient MasterMind links).
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
                      e.areFriendly(c.owner, this.owner) ||
                      c.rules.immuneToPsionics ||
                      c.isBuilding() ||
                      !c.mindControllableTrait ||
                      // skip units already under a mind-control link (vanilla default)
                      c.mindControllableTrait.isActive() ||
                      (c.isUnit() && c.tile !== t) ||
                      e.changeObjectOwner(c, this.owner);
            }
            onTick(e) {
              return !0;
            }
          }),
        );
      },
    };
  },
);
