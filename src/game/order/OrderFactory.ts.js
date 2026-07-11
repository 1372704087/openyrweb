// === Reconstructed SystemJS module: game/order/OrderFactory ===
// deps: ["game/order/OrderType","game/order/DeployOrder","game/order/MoveOrder","game/order/OccupyOrder","game/order/AttackOrder","game/order/StopOrder","game/order/CheerOrder","game/order/DockOrder","game/order/GatherOrder","game/order/AttackMoveOrder","game/order/RepairOrder","game/order/GuardAreaOrder","game/order/ScatterOrder","game/order/EnterTransportOrder","game/order/CaptureOrder"]
// Note: variable/type names are minified approximations of the original TypeScript.

System.register(
  "game/order/OrderFactory",
  [
    "game/order/OrderType",
    "game/order/DeployOrder",
    "game/order/MoveOrder",
    "game/order/OccupyOrder",
    "game/order/AttackOrder",
    "game/order/StopOrder",
    "game/order/CheerOrder",
    "game/order/DockOrder",
    "game/order/GatherOrder",
    "game/order/AttackMoveOrder",
    "game/order/RepairOrder",
    "game/order/GuardAreaOrder",
    "game/order/ScatterOrder",
    "game/order/EnterTransportOrder",
    "game/order/CaptureOrder",
    "game/order/UnloadAllOrder",
  ],
  function (e, t) {
    "use strict";
    var i, r, s, a, n, o, l, c, h, u, d, g, p, m, f, y, U;
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
        function (e) {
          l = e;
        },
        function (e) {
          c = e;
        },
        function (e) {
          h = e;
        },
        function (e) {
          u = e;
        },
        function (e) {
          d = e;
        },
        function (e) {
          g = e;
        },
        function (e) {
          p = e;
        },
        function (e) {
          m = e;
        },
        function (e) {
          f = e;
        },
        function (e) {
          U = e;
        },
      ],
      execute: function () {
        e(
          "OrderFactory",
          (y = class {
            constructor(e, t) {
              ((this.game = e), (this.map = t));
            }
            create(e, t) {
              switch (e) {
                case i.OrderType.Deploy:
                  return new r.DeployOrder(this.game, !0);
                case i.OrderType.DeploySelected:
                  return new r.DeployOrder(this.game, !1);
                case i.OrderType.ForceMove:
                  return new s.MoveOrder(this.game, this.map, t, !0);
                case i.OrderType.Move:
                  return new s.MoveOrder(this.game, this.map, t);
                case i.OrderType.ForceAttack:
                  return new n.AttackOrder(this.game, { forceAttack: !0 });
                case i.OrderType.Attack:
                  return new n.AttackOrder(this.game, { noIvanBomb: !0 });
                case i.OrderType.PlaceBomb:
                  return new n.AttackOrder(this.game);
                case i.OrderType.AttackMove:
                  return new u.AttackMoveOrder(this.game, this.map);
                case i.OrderType.Capture:
                  return new f.CaptureOrder(this.game);
                case i.OrderType.Occupy:
                  return new a.OccupyOrder(this.game);
                case i.OrderType.Stop:
                  return new o.StopOrder(this.game);
                case i.OrderType.Cheer:
                  return new l.CheerOrder();
                case i.OrderType.Dock:
                  return new c.DockOrder(this.game);
                case i.OrderType.Gather:
                  return new h.GatherOrder(this.game);
                case i.OrderType.Repair:
                  return new d.RepairOrder(this.game);
                case i.OrderType.Guard:
                  return new g.GuardAreaOrder(this.game, !1);
                case i.OrderType.GuardArea:
                  return new g.GuardAreaOrder(this.game, !0);
                case i.OrderType.Scatter:
                  return new p.ScatterOrder(this.game);
                case i.OrderType.EnterTransport:
                  return new m.EnterTransportOrder(this.game);
                case i.OrderType.UnloadAll:
                  return new U.UnloadAllOrder(this.game);
                default:
                  throw new Error("Unhandled order type " + i.OrderType[e]);
              }
            }
          }),
        );
      },
    };
  },
);
