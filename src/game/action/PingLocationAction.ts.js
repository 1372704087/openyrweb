// === Reconstructed SystemJS module: game/action/PingLocationAction ===
// deps: ["game/action/Action","data/DataStream","game/action/ActionType","game/event/PingLocationEvent","game/event/RadarEvent","game/rules/general/RadarRules"]
// Note: variable/type names are minified approximations of the original TypeScript.

System.register(
  "game/action/PingLocationAction",
  [
    "game/action/Action",
    "data/DataStream",
    "game/action/ActionType",
    "game/event/PingLocationEvent",
    "game/event/RadarEvent",
    "game/rules/general/RadarRules",
  ],
  function (e, t) {
    "use strict";
    var i, r, s, a, n, o, l;
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
        ((l = class extends i.Action {
          constructor(e) {
            (super(s.ActionType.PingLocation), (this.game = e));
          }
          unserialize(e) {
            let t = new r.DataStream(e);
            this.tile = { x: t.readUint16(), y: t.readUint16() };
          }
          serialize() {
            let e = new r.DataStream(4);
            return (e.writeUint16(this.tile.x), e.writeUint16(this.tile.y), e.toUint8Array());
          }
          print() {
            return `Ping location at tile (${this.tile.x}, ${this.tile.y})`;
          }
          process() {
            var e = this.player,
              t = this.game.map.tiles.getByMapCoords(this.tile.x, this.tile.y);
            if (t) {
              this.game.events.dispatch(new a.PingLocationEvent(t, e));
              for (var i of [e, ...this.game.alliances.getAllies(e)])
                this.game.events.dispatch(new n.RadarEvent(i, o.RadarEventType.GenericNonCombat, t));
            } else console.warn(`Tile ${this.tile.x},${this.tile.y} doesn't exist`);
          }
        }),
          e("PingLocationAction", l));
      },
    };
  },
);
