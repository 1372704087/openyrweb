// === Reconstructed SystemJS module: game/superweapon/GeneticMutatorEffect ===
// deps: ["game/map/tileFinder/RadialTileFinder","game/Warhead","game/superweapon/SuperWeaponEffect","engine/type/ObjectType"]
// Note: variable/type names are minified approximations of the original TypeScript.
//
// OpenYRWeb: Genetic Mutator superweapon effect (YR). Vanilla behaviour:
//   - Kills infantry with infDeathType=Mutate (9), triggering the infantry renderer
//     to play GENDEATH (InfantryMutate) as the death animation
//   - After the GENDEATH animation finishes (detected via _genDeathAnimDone flag),
//     spawns a Brute at the infantry's position during the game-logic onTick
//   - Converts ALL infantry (friendly AND enemy) to Brutes under the activator's control
//   - Non-human infantry (NotHuman=yes) are killed outright (no mutation)
//   - Only a single conversion pass to avoid double-spawn pileup

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
        var a;
        e(
          "GeneticMutatorEffect",
          (a = class extends r.SuperWeaponEffect {
            constructor(e, t, i) {
              super(e, t, i),
                (this._pending = []),
                (this._timeoutTicks = 120);
            }
            onStart(e) {
              var t,
                av = e.rules.audioVisual,
                general = e.rules.general,
                useExplosion = !!general.mutateExplosion,
                whName = useExplosion ? av.mutateExplosionWarhead : av.mutateWarhead,
                cellSpread = useExplosion ? 5 : 1;
              if (whName) {
                try {
                  var whR = e.rules.getWarhead(whName);
                  whR.cellSpread > 0 && (cellSpread = whR.cellSpread);
                } catch (err) {}
              }
              var hasBrute = e.rules.hasObject("BRUTE", o.ObjectType.Infantry);
              if (!hasBrute && !whName) return;
              var finder = new n.RadialTileFinder(
                e.map.tiles, e.map.mapBounds, this.tile,
                { width: 1, height: 1 }, 0, Math.ceil(cellSpread), () => !0,
              );
              for (; (t = finder.getNextTile());)
                for (var u of e.map.getGroundObjectsOnTile(t)) {
                  if (!u.isInfantry() || u.isDestroyed) continue;
                  var dist = Math.sqrt(
                    (u.tile.rx - this.tile.rx) ** 2 + (u.tile.ry - this.tile.ry) ** 2,
                  );
                  if (dist > cellSpread) continue;
                  if (u.rules.isHuman && hasBrute) {
                    // Store everything needed for spawning before destroy
                    this._pending.push({
                      obj: u,
                      tile: u.tile,
                      subCell: u.position.subCell,
                    });
                    u.infDeathType = 9;
                    // OpenYRWeb: record the caster's player color so the GENDEATH
                    // (InfantryMutate) transform anim renders in the caster's faction color
                    // instead of the victim's. Read by Infantry renderable onRemove
                    // when infDeathType=9.
                    u._mutateCasterColor = this.owner.color;
                    e.destroyObject(u, { player: this.owner }, void 0, !0);
                  } else {
                    e.destroyObject(u, { player: this.owner });
                  }
                }
              if (!this._pending.length) return;
            }
            onTick(e) {
              if (!this._pending) return !0;
              var remaining = [];
              for (var p of this._pending) {
                if (!p.obj._genDeathAnimDone) { remaining.push(p); continue; }
                try {
                  var brute = e.createUnitForPlayer(
                    e.rules.getObject("BRUTE", o.ObjectType.Infantry),
                    this.owner,
                  );
                  (brute.direction = 225),
                    (brute.position.subCell = p.subCell),
                    e.spawnObject(brute, p.tile);
                } catch (err) {}
              }
              this._pending = remaining;
              if (remaining.length) {
                this._timeoutTicks--;
                return !1;
              }
              this._pending = null;
              return !0;
            }
          }),
        );
      },
    };
  },
);
