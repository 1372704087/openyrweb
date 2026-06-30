// === Reconstructed SystemJS module: game/map/BridgeOverlayTypes ===
// deps: ["util/math"]
// Note: variable/type names are minified approximations of the original TypeScript.

System.register("game/map/BridgeOverlayTypes", ["util/math"], function (t, e) {
  "use strict";
  var i, r, s;
  e && e.id;
  return {
    setters: [
      function (e) {
        i = e;
      },
    ],
    execute: function () {
      var e;
      (((e = r || t("OverlayBridgeType", (r = {})))[(e.NotBridge = 0)] = "NotBridge"),
        (e[(e.Concrete = 1)] = "Concrete"),
        (e[(e.Wood = 2)] = "Wood"),
        t(
          "BridgeOverlayTypes",
          (s = class {
            static getOverlayBridgeType(e) {
              return i.isBetween(e, this.minHighBridgeConcreteId, this.maxHighBridgeConcreteId) ||
                i.isBetween(e, this.minLowBridgeConcreteId, this.maxLowBridgeConcreteId)
                ? r.Concrete
                : i.isBetween(e, this.minHighBridgeWoodId, this.maxHighBridgeWoodId) ||
                    i.isBetween(e, this.minLowBridgeWoodId, this.maxLowBridgeWoodId)
                  ? r.Wood
                  : r.NotBridge;
            }
            static isBridge(e) {
              return this.isHighBridge(e) || this.isLowBridge(e);
            }
            static isBridgePlaceholder(e) {
              return this.bridgePlaceholderIds.includes(e);
            }
            static isHighBridge(e) {
              return (
                i.isBetween(e, this.minHighBridgeWoodId, this.maxHighBridgeWoodId) ||
                i.isBetween(e, this.minHighBridgeConcreteId, this.maxHighBridgeConcreteId)
              );
            }
            static isLowBridge(e) {
              return (
                i.isBetween(e, this.minLowBridgeWoodId, this.maxLowBridgeWoodId) ||
                i.isBetween(e, this.minLowBridgeConcreteId, this.maxLowBridgeConcreteId)
              );
            }
            static isXBridge(e) {
              return (
                e === this.minHighBridgeWoodId ||
                e === this.minHighBridgeConcreteId ||
                i.isBetween(e, this.minLowBridgeWoodId, this.minLowBridgeWoodId + 8) ||
                i.isBetween(e, this.minLowBridgeWoodId + 18, this.minLowBridgeWoodId + 21) ||
                i.isBetween(e, this.minLowBridgeConcreteId, this.minLowBridgeConcreteId + 8) ||
                i.isBetween(e, this.minLowBridgeConcreteId + 18, this.minLowBridgeConcreteId + 21)
              );
            }
            static isLowBridgeHead(e) {
              return (
                i.isBetween(e, this.minLowBridgeWoodId + 18, this.minLowBridgeWoodId + 25) ||
                i.isBetween(e, this.minLowBridgeConcreteId + 18, this.minLowBridgeConcreteId + 25)
              );
            }
            static isLowBridgeHeadStart(e) {
              return (
                i.isBetween(e, this.minLowBridgeWoodId + 20, this.minLowBridgeWoodId + 23) ||
                i.isBetween(e, this.minLowBridgeConcreteId + 20, this.minLowBridgeConcreteId + 23)
              );
            }
            static calculateLowBridgeOverlayId(e, t) {
              let i;
              if (e === r.Concrete) i = this.minLowBridgeConcreteId;
              else {
                if (e !== r.Wood) throw new Error("Not implemented");
                i = this.minLowBridgeWoodId;
              }
              return i + (t ? 0 : 9);
            }
            static calculateHighBridgeOverlayId(e, t) {
              let i;
              if (e === r.Concrete) i = this.minHighBridgeConcreteId;
              else {
                if (e !== r.Wood) throw new Error("Not implemented");
                i = this.minHighBridgeWoodId;
              }
              return i + (t ? 0 : 1);
            }
          }),
        ),
        (s.minLowBridgeWoodId = 74),
        (s.maxLowBridgeWoodId = 99),
        (s.minLowBridgeConcreteId = 205),
        (s.maxLowBridgeConcreteId = 230),
        (s.minHighBridgeConcreteId = 24),
        (s.maxHighBridgeConcreteId = 25),
        (s.minHighBridgeWoodId = 237),
        (s.maxHighBridgeWoodId = 238),
        (s.bridgePlaceholderIds = [100, 101, 231, 232]));
    },
  };
});
