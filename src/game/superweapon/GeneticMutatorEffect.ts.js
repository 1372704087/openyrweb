// === Reconstructed SystemJS module: game/superweapon/GeneticMutatorEffect ===
// deps: ["game/map/tileFinder/RadialTileFinder","game/Warhead","game/superweapon/SuperWeaponEffect","engine/type/ObjectType"]
// Note: variable/type names are minified approximations of the original TypeScript.
//
// OpenYRWeb: Genetic Mutator superweapon effect (YR). Vanilla behaviour (ModEnc/Mutation,
// ModEnc/Using-MakeInfantry-Logic): the firing building's SuperWeapon WeaponType carries a
// warhead with InfDeath=9 (Mutate). When that warhead kills convertible infantry, Warhead
// .inflictDamage spawns a Brute under the attacker instead of leaving a corpse (handled in
// Warhead._mutateInfantryToBrute, gated on infDeath===9 — see Warhead.ts.js).
//
// This effect therefore:
//   (a) PRIMARY: detonates the SuperWeapon's Mutate warhead (InfDeath=9) over the target area
//       so the normal damage+MakeInfantry path transforms eligible infantry, AND
//   (b) FALLBACK: a direct transform pass for any convertible infantry that survived/were
//       missed by the warhead pass (e.g. tiles the CellSpread didn't cover, or 0-damage
//       configs). Guarantees the player-visible outcome matches vanilla even if the mod's
//       Mutate warhead is misconfigured. Mirrors IronCurtainEffect/DominatorEffect iteration.

System.register(
  "game/superweapon/GeneticMutatorEffect",
  [
    "game/map/tileFinder/RadialTileFinder",
    "game/Warhead",
    "game/superweapon/SuperWeaponEffect",
    "engine/type/ObjectType",
  ],
  function (e, t) {
    "use strict";
    var n, i, r, o;
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
          o = e;
        },
      ],
      execute: function () {
        var s;
        e(
          "GeneticMutatorEffect",
          (s = class extends r.SuperWeaponEffect {
            constructor(e, t, i, a) {
              super(e, t, i), (this.weaponType = a);
            }
            onStart(e) {
              var t,
                a = e.rules.audioVisual,
                // Genetic Mutator uses the same capture range notion as the Dominator in YR data;
                // fall back to a sane default if unset.
                l = a.dominatorCaptureRange > 0 ? a.dominatorCaptureRange : 3;
              // (a) PRIMARY — detonate the SuperWeapon's Mutate warhead (InfDeath=9) over the
              // area so the normal MakeInfantry path (Warhead._mutateInfantryToBrute) handles
              // the transform with correct Verses/anim semantics. No-op if WeaponType unset or
              // the weapon/warhead can't be resolved.
              if (this.weaponType) {
                var wpnSection = null;
                try {
                  wpnSection = e.rules.getWeapon(this.weaponType);
                } catch (err) {
                  wpnSection = null;
                }
                if (wpnSection) {
                  var whName = wpnSection.warhead;
                  if (whName) {
                    var whRules = null;
                    try {
                      whRules = e.rules.getWarhead(whName);
                    } catch (err) {
                      whRules = null;
                    }
                    if (whRules) {
                      var warhead = new i.Warhead(whRules),
                        dmg = wpnSection.damage,
                        cellSpread = whRules.cellSpread || l,
                        pctMax = whRules.percentAtMax || 0.2,
                        attackerInfo = { player: this.owner },
                        finder = new n.RadialTileFinder(
                          e.map.tiles,
                          e.map.mapBounds,
                          this.tile,
                          { width: 1, height: 1 },
                          0,
                          Math.ceil(cellSpread),
                          () => !0,
                        );
                      for (; (t = finder.getNextTile());)
                        for (var obj of e.map.getGroundObjectsOnTile(t)) {
                          if (!obj.isInfantry() || obj.isDestroyed) continue;
                          var dist = Math.sqrt(
                            (obj.tile.rx - this.tile.rx) ** 2 + (obj.tile.ry - this.tile.ry) ** 2,
                          );
                          if (dist > cellSpread) continue;
                          var pct = dist < 1 ? 1 : 1 - (1 - pctMax) * (dist / cellSpread),
                            dmgTile = Math.round(dmg * pct);
                          if (0 < dmgTile && obj.healthTrait && !obj.rules.immune)
                            warhead.inflictDamage(dmgTile, obj, attackerInfo, e);
                        }
                    }
                  }
                }
              }
              // (b) FALLBACK — direct transform for any convertible infantry still standing in
              // range that the warhead pass didn't catch. Conservative: skips friendlies, psi-
              // immune, existing Brutes, and (importantly) BRUTE produced by pass (a). Robust
              // against misconfigured/0-damage Mutate warheads.
              let d = new n.RadialTileFinder(
                e.map.tiles,
                e.map.mapBounds,
                this.tile,
                { width: 1, height: 1 },
                0,
                l,
                () => !0,
              );
              for (; (t = d.getNextTile());)
                for (var u of e.map.getGroundObjectsOnTile(t)) {
                  if (
                    !u.isInfantry() ||
                    u.isDestroyed ||
                    u.owner === this.owner ||
                    e.areFriendly(u.owner, this.owner) ||
                    u.rules.immuneToPsionics ||
                    "BRUTE" === u.name ||
                    !e.rules.hasObject("BRUTE", o.ObjectType.Infantry)
                  )
                    continue;
                  var c = e.createUnitForPlayer(e.rules.getObject("BRUTE", o.ObjectType.Infantry), this.owner);
                  (e.spawnObject(c, u.tile),
                    (u.infDeathType = 0),
                    e.destroyObject(u, { player: this.owner }, void 0, !1));
                }
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
