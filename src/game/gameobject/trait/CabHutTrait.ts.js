// === Reconstructed SystemJS module: game/gameobject/trait/CabHutTrait ===
// deps: ["engine/type/ObjectType","game/map/BridgeOverlayTypes","game/gameobject/task/ScatterTask","game/gameobject/unit/ZoneType","game/gameobject/common/DeathType"]
// Note: variable/type names are minified approximations of the original TypeScript.

System.register(
  "game/gameobject/trait/CabHutTrait",
  [
    "engine/type/ObjectType",
    "game/map/BridgeOverlayTypes",
    "game/gameobject/task/ScatterTask",
    "game/gameobject/unit/ZoneType",
    "game/gameobject/common/DeathType",
  ],
  function (e, t) {
    "use strict";
    var c, h, n, o, s, i;
    t && t.id;
    return {
      setters: [
        function (e) {
          c = e;
        },
        function (e) {
          h = e;
        },
        function (e) {
          n = e;
        },
        function (e) {
          o = e;
        },
        function (e) {
          s = e;
        },
      ],
      execute: function () {
        e(
          "CabHutTrait",
          (i = class {
            constructor(e, t) {
              ((this.gameObject = e), (this.bridges = t), (this.checkedClosestBridge = !1));
            }
            canRepairBridge() {
              var e = this.findClosestBridgeBounds();
              return e
                ? this.bridges.canBeRepaired(e)
                : (console.warn(
                    `No bridge associated with hut at ${this.gameObject.tile.rx}, ${this.gameObject.tile.ry}.`,
                  ),
                  !1);
            }
            repairBridge(t, i) {
              var r = this.findClosestBridgeBounds();
              if (!r) throw new Error("No bridge bounds found");
              var e = this.bridges.findDestroyedPieceTiles(r),
                s = r.start.rx !== r.end.rx;
              let a;
              a = r.isHigh
                ? h.BridgeOverlayTypes.calculateHighBridgeOverlayId(r.type, s)
                : h.BridgeOverlayTypes.calculateLowBridgeOverlayId(r.type, s);
              var n,
                o,
                l = t.rules.getOverlayName(a);
              for (n of e) {
                let e = t.createObject(c.ObjectType.Overlay, l);
                ((e.overlayId = a),
                  (e.value = 0),
                  (e.position.tileElevation = r.isHigh ? 4 : 0),
                  t.spawnObject(e, n),
                  this.updateUnitsUnderBridgePiece(n, r, t, i));
              }
              for (o of this.bridges.findBridgePieces(r)) o.obj.bridgeTrait.bridgeSpec = r;
            }
            updateUnitsUnderBridgePiece(e, t, i, r) {
              var s;
              for (let a of this.bridges.getPieceTiles(this.bridges.getPieceAtTile(e)))
                if (t.isHigh) {
                  let e = i.map
                    .getGroundObjectsOnTile(a)
                    .filter(
                      (e) =>
                        e.tile === a && e.isUnit() && !e.unitOrderTrait.hasTasks() && e.rules.tooBigToFitUnderBridge,
                    );
                  e.forEach((e) => e.unitOrderTrait.addTask(new n.ScatterTask(i)));
                } else
                  for (s of i.map.getGroundObjectsOnTile(a))
                    s.isUnit() &&
                      (i.map.terrain.getPassableSpeed(a, s.rules.speedType, s.isInfantry(), !0)
                        ? ((s.zone = o.ZoneType.Ground), (s.onBridge = !0))
                        : s.isDestroyed || i.destroyObject(s, { player: r }));
            }
            demolishBridge(e, t) {
              var i = this.getBridgePieces();
              if (i)
                for (var r of i)
                  (r.obj.isLowBridge() && e.map.getTileZone(r.obj.tile, !0) !== o.ZoneType.Water) ||
                    r.obj.isDestroyed ||
                    ((r.obj.deathType = s.DeathType.Demolish), e.destroyObject(r.obj, t, !0));
            }
            getBridgePieces() {
              var e = this.findClosestBridgeBounds();
              if (e) return this.bridges.findBridgePieces(e);
            }
            findClosestBridgeBounds() {
              return (
                this.checkedClosestBridge ||
                  ((this.checkedClosestBridge = !0),
                  (this.closestBridge = this.bridges.findClosestBridgeSpec(this.gameObject.tile))),
                this.closestBridge
              );
            }
            dispose() {
              this.gameObject = void 0;
            }
          }),
        );
      },
    };
  },
);
