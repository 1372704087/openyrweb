// === Reconstructed SystemJS module: engine/renderable/entity/map/MinimapModel ===
// deps: ["game/map/MapShroud"]
// Note: variable/type names are minified approximations of the original TypeScript.

System.register("engine/renderable/entity/map/MinimapModel", ["game/map/MapShroud"], function (e, t) {
  "use strict";
  var r, n, o, l, c, h, u, i;
  t && t.id;
  return {
    setters: [
      function (e) {
        r = e;
      },
    ],
    execute: function () {
      ((n = new THREE.Color("rgb(173, 170, 132)")),
        (o = new Map([
          ["CAKRMW", new THREE.Color("rgb(107, 69, 49)")],
          ["CAFNCW", new THREE.Color(16777215)],
          ["CAFNCB", new THREE.Color(0)],
          ["GASAND", new THREE.Color("rgb(82, 77, 57)")],
        ])),
        (l = new THREE.Color("rgb(90, 89, 82)")),
        (c = new THREE.Color(0)),
        (h = new THREE.Color("rgb(173, 170, 132)")),
        (u = new THREE.Color(0)),
        e(
          "MinimapModel",
          (i = class {
            constructor(e, t, i, r, s, a) {
              ((this.tiles = e),
                (this.tileOccupation = t),
                (this.shroud = i),
                (this.localPlayer = r),
                (this.alliances = s),
                (this.paradropRules = a));
              var n = this.tiles.getMapSize();
              ((this.stride = n.width),
                (this.tileColors = new Uint32Array(n.width * n.height)),
                (this.aboveShroudTiles = new Uint8Array(n.width * n.height)),
                (this.tileWithTechnos = new Uint8Array(n.width * n.height)));
            }
            computeAllColors() {
              this.updateColors(this.tiles.getAll());
            }
            updateColors(e) {
              for (var r of e) {
                let e = -1,
                  t;
                for (var s of this.tileOccupation.getObjectsOnTile(r)) {
                  var a;
                  !(
                    ((s.isTechno() || s.isOverlay() || s.isTerrain()) && !s.radarInvisible) ||
                    (s.isOverlay() && s.isBridge()) ||
                    (s.isBuilding() &&
                      !s.rules.invisibleInGame &&
                      (!s.radarInvisible || (s.rules.canBeOccupied && s.owner.isCombatant())))
                  ) ||
                    ((a =
                      4 * Number(s.isTechno()) +
                      2 * Number(s.isAircraft()) +
                      Number(s.name !== this.paradropRules.paradropPlane)) > e &&
                      ((e = a), (t = s)));
                }
                let i;
                if (t)
                  if ((t.isTechno() || t.isOverlay()) && t.rules.wall) i = o.get(t.name) ?? l;
                  else if (t.isBuilding() && t.isDestroyed && t.rules.leaveRubble) i = c;
                  else if (t.isTechno())
                    if (
                      t.cloakableTrait?.isCloaked() &&
                      this.localPlayer &&
                      !this.alliances.haveSharedIntel(this.localPlayer, t.owner)
                    )
                      i = void 0;
                    else {
                      let e = (t.isInfantry() || t.isVehicle()) && t.disguiseTrait?.getDisguise();
                      i =
                        this.localPlayer &&
                        e &&
                        !this.alliances.haveSharedIntel(this.localPlayer, t.owner) &&
                        !this.localPlayer.sharedDetectDisguiseTrait?.has(t)
                          ? e.owner
                            ? new THREE.Color(e.owner.color.asHex())
                            : n
                          : new THREE.Color(t.owner.color.asHex());
                    }
                  else if (t.isTerrain()) i = n;
                  else {
                    if (!t.isOverlay()) return;
                    i = t.isTiberium() ? h : u;
                  }
                i = i || this.tiles.getTileRadarColor(r);
                r = r.rx + r.ry * this.stride;
                ((this.tileColors[r] = i.getHex()),
                  (this.aboveShroudTiles[r] = t?.name === this.paradropRules.paradropPlane ? 1 : 0),
                  (this.tileWithTechnos[r] = t?.isTechno() ? 1 : 0));
              }
            }
            getTileColor(e) {
              var t = e.rx + e.ry * this.stride;
              if (this.shroud?.getShroudType(e) === r.ShroudType.Unexplored && !this.aboveShroudTiles[t])
                return "#000000";
              let i = new THREE.Color(this.tileColors[t]);
              return (
                this.shroud?.isFlagged(e, r.ShroudFlag.Darken) && !this.tileWithTechnos[t] && i.multiplyScalar(0.35),
                "#" + i.getHexString()
              );
            }
          }),
        ));
    },
  };
});
