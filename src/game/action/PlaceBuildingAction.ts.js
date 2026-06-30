// === Reconstructed SystemJS module: game/action/PlaceBuildingAction ===
// deps: ["game/action/Action","data/DataStream","game/event/BuildingPlaceEvent","game/player/production/ProductionQueue","game/rules/TechnoRules","game/gameobject/trait/FactoryTrait","game/action/ActionType","game/event/BuildingFailedPlaceEvent","game/trait/interface/NotifyPlaceBuilding","engine/type/ObjectType"]
// Note: variable/type names are minified approximations of the original TypeScript.

System.register(
  "game/action/PlaceBuildingAction",
  [
    "game/action/Action",
    "data/DataStream",
    "game/event/BuildingPlaceEvent",
    "game/player/production/ProductionQueue",
    "game/rules/TechnoRules",
    "game/gameobject/trait/FactoryTrait",
    "game/action/ActionType",
    "game/event/BuildingFailedPlaceEvent",
    "game/trait/interface/NotifyPlaceBuilding",
    "engine/type/ObjectType",
  ],
  function (e, t) {
    "use strict";
    var i, r, s, o, l, c, a, n, h, u, d;
    t && t.id;
    return {
      setters: [
        function (e) {
          i = e;
        },
        function (e) {
          r = e;
        },
        function (e) {
          s = e;
        },
        function (e) {
          o = e;
        },
        function (e) {
          l = e;
        },
        function (e) {
          c = e;
        },
        function (e) {
          a = e;
        },
        function (e) {
          n = e;
        },
        function (e) {
          h = e;
        },
        function (e) {
          u = e;
        },
      ],
      execute: function () {
        ((d = class extends i.Action {
          constructor(e) {
            (super(a.ActionType.PlaceBuilding), (this.game = e));
          }
          unserialize(e) {
            let t = new r.DataStream(e);
            ((this.buildingRules = this.game.rules.getTechnoByInternalId(t.readUint32(), u.ObjectType.Building)),
              (this.tile = { x: t.readUint16(), y: t.readUint16() }));
          }
          serialize() {
            let e = new r.DataStream(8);
            return (
              e.writeUint32(this.buildingRules.index),
              e.writeUint16(this.tile.x),
              e.writeUint16(this.tile.y),
              e.toUint8Array()
            );
          }
          print() {
            return `Place building ${this.buildingRules.name} at tile (${this.tile.x}, ${this.tile.y})`;
          }
          process() {
            var e = this.game.map.tiles.getByMapCoords(this.tile.x, this.tile.y);
            if (e) {
              var t = this.player;
              const i = this.tryPlaceBuilding(t, e);
              i
                ? (this.game.traits.filter(h.NotifyPlaceBuilding).forEach((e) => {
                    e[h.NotifyPlaceBuilding.onPlace](i, this.game);
                  }),
                  this.game.events.dispatch(new s.BuildingPlaceEvent(i)))
                : this.game.events.dispatch(new n.BuildingFailedPlaceEvent(this.buildingRules.name, t, e));
            } else console.warn(`Tile ${this.tile.x},${this.tile.y} doesn't exist`);
          }
          tryPlaceBuilding(r, s) {
            var a = this.buildingRules;
            if (r.production) {
              let i = r.production.getQueueForObject(a);
              if (i.status === o.QueueStatus.Ready && i.getFirst().rules === a) {
                let t = this.game.getConstructionWorker(r);
                if (r.production.isAvailableForProduction(a) && t.canPlaceAt(a.name, s, { normalizedTile: !0 })) {
                  var n = t.placeAt(a.name, s, !0);
                  (r.addUnitsBuilt(a, 1), i.shift(a, 1));
                  let e = r.production.getPrimaryFactory(l.FactoryType.BuildingType);
                  return (e && (e.factoryTrait.status = c.FactoryStatus.Delivering), n[0]);
                }
              }
            }
          }
        }),
          e("PlaceBuildingAction", d));
      },
    };
  },
);
