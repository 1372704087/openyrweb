// === Reconstructed SystemJS module: game/action/ActivateSuperWeaponAction ===
// deps: ["data/DataStream","game/action/Action","game/action/ActionType","game/type/SuperWeaponType","game/trait/SuperWeaponsTrait"]
// Note: variable/type names are minified approximations of the original TypeScript.

System.register(
  "game/action/ActivateSuperWeaponAction",
  [
    "data/DataStream",
    "game/action/Action",
    "game/action/ActionType",
    "game/type/SuperWeaponType",
    "game/trait/SuperWeaponsTrait",
  ],
  function (e, t) {
    "use strict";
    var r, i, s, a, n, o;
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
      ],
      execute: function () {
        ((o = class extends i.Action {
          constructor(e) {
            (super(s.ActionType.ActivateSuperWeapon), (this.game = e));
          }
          unserialize(e) {
            let t = new r.DataStream(e);
            this.superWeaponType = t.readUint8();
            var i = t.readUint8();
            ((this.tile = { x: t.readUint16(), y: t.readUint16() }),
              (this.tile2 = 2 < i ? { x: t.readUint16(), y: t.readUint16() } : void 0));
          }
          serialize() {
            let e = new r.DataStream(6 + (this.tile2 ? 4 : 0));
            return (
              (e.dynamicSize = !1),
              e.writeUint8(this.superWeaponType),
              e.writeUint8(this.tile2 ? 4 : 2),
              e.writeUint16(this.tile.x),
              e.writeUint16(this.tile.y),
              this.tile2 && (e.writeUint16(this.tile2.x), e.writeUint16(this.tile2.y)),
              e.toUint8Array()
            );
          }
          print() {
            return (
              `Activate SuperW ${a.SuperWeaponType[this.superWeaponType]} at tile (${this.tile.x}, ${this.tile.y})` +
              (this.tile2 ? `, (${this.tile2.x}, ${this.tile2.y})` : "")
            );
          }
          process() {
            var e,
              t = this.player,
              i = this.game.map.tiles.getByMapCoords(this.tile.x, this.tile.y);
            i
              ? ((e = this.tile2 ? this.game.map.tiles.getByMapCoords(this.tile2.x, this.tile2.y) : void 0),
                this.game.traits.get(n.SuperWeaponsTrait).activateSuperWeapon(this.superWeaponType, t, this.game, i, e))
              : console.warn(`Tile ${this.tile.x},${this.tile.y} doesn't exist`);
          }
        }),
          e("ActivateSuperWeaponAction", o));
      },
    };
  },
);
