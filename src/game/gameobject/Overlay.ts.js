// === Reconstructed SystemJS module: game/gameobject/Overlay ===
// deps: ["engine/type/ObjectType","game/gameobject/GameObject","game/map/BridgeOverlayTypes","game/map/OreOverlayTypes","game/gameobject/trait/WallTrait","game/type/LandType"]
// Note: variable/type names are minified approximations of the original TypeScript.

System.register(
  "game/gameobject/Overlay",
  [
    "engine/type/ObjectType",
    "game/gameobject/GameObject",
    "game/map/BridgeOverlayTypes",
    "game/map/OreOverlayTypes",
    "game/gameobject/trait/WallTrait",
    "game/type/LandType",
  ],
  function (e, t) {
    "use strict";
    var r, i, s, a, n, o, l;
    t && t.id;
    return {
      setters: [
        function (e) {
          r = e;
        },
        function (e) {
          i = e;
        },
        function (e) {
          s = e;
        },
        function (e) {
          a = e;
        },
        function (e) {
          n = e;
        },
        function (e) {
          o = e;
        },
      ],
      execute: function () {
        ((l = class extends i.GameObject {
          static factory(e, t, i) {
            let r = new this(e, t, i);
            return (t.wall && ((r.wallTrait = new n.WallTrait()), r.traits.add(r.wallTrait)), r);
          }
          constructor(e, t, i) {
            (super(r.ObjectType.Overlay, e, t, i), (this.radarInvisible = this.rules.radarInvisible));
          }
          isTiberium() {
            return void 0 !== a.OreOverlayTypes.getOverlayTibType(this.overlayId);
          }
          isBridge() {
            return s.BridgeOverlayTypes.isBridge(this.overlayId);
          }
          isXBridge() {
            return s.BridgeOverlayTypes.isXBridge(this.overlayId);
          }
          isHighBridge() {
            return s.BridgeOverlayTypes.isHighBridge(this.overlayId);
          }
          isLowBridge() {
            return s.BridgeOverlayTypes.isLowBridge(this.overlayId);
          }
          isBridgePlaceholder() {
            return s.BridgeOverlayTypes.isBridgePlaceholder(this.overlayId);
          }
          getFoundation() {
            let e = { width: 1, height: 1 };
            return (this.isBridge() && (this.isXBridge() ? (e.height += 2) : (e.width += 2)), e);
          }
          getLandType() {
            return this.rules.wall
              ? o.LandType.Wall
              : this.isTiberium()
                ? o.LandType.Tiberium
                : this.isBridge() && this.isHighBridge()
                  ? o.LandType.Road
                  : this.rules.land;
          }
        }),
          e("Overlay", l));
      },
    };
  },
);
