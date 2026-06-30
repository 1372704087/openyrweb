// === Reconstructed SystemJS module: game/api/ActionsApi ===
// deps: ["game/action/ActionType","game/action/UpdateQueueAction","game/action/DebugAction"]
// Note: variable/type names are minified approximations of the original TypeScript.

System.register(
  "game/api/ActionsApi",
  ["game/action/ActionType", "game/action/UpdateQueueAction", "game/action/DebugAction"],
  function (e, t) {
    "use strict";
    var l, a, n, c, o, h, u, d, g, r, i;
    t && t.id;
    return {
      setters: [
        function (e) {
          d = e;
        },
        function (e) {
          g = e;
        },
        function (e) {
          r = e;
        },
      ],
      execute: function () {
        (e(
          "ActionsApi",
          (i = class {
            constructor(e, t, i, r, s) {
              (l.add(this),
                a.set(this, void 0),
                n.set(this, void 0),
                c.set(this, void 0),
                o.set(this, void 0),
                h.set(this, void 0),
                __classPrivateFieldSet(this, a, t, "f"),
                __classPrivateFieldSet(this, n, i, "f"),
                __classPrivateFieldSet(this, c, e, "f"),
                __classPrivateFieldSet(this, o, r, "f"),
                __classPrivateFieldSet(this, h, s, "f"));
            }
            placeBuilding(t, i, r) {
              __classPrivateFieldGet(this, l, "m", u).call(this, d.ActionType.PlaceBuilding, (e) => {
                ((e.buildingRules = __classPrivateFieldGet(this, c, "f").rules.getBuilding(t)),
                  (e.tile = { x: i, y: r }));
              });
            }
            sellObject(t) {
              __classPrivateFieldGet(this, l, "m", u).call(this, d.ActionType.SellObject, (e) => {
                e.objectId = t;
              });
            }
            sellBuilding(e) {
              this.sellObject(e);
            }
            toggleRepairWrench(t) {
              __classPrivateFieldGet(this, l, "m", u).call(this, d.ActionType.ToggleRepair, (e) => {
                e.buildingId = t;
              });
            }
            toggleAlliance(t, i) {
              __classPrivateFieldGet(this, l, "m", u).call(this, d.ActionType.ToggleAlliance, (e) => {
                ((e.toPlayer = __classPrivateFieldGet(this, c, "f").getPlayerByName(t)), (e.toggle = i));
              });
            }
            pauseProduction(t) {
              __classPrivateFieldGet(this, l, "m", u).call(this, d.ActionType.UpdateQueue, (e) => {
                ((e.queueType = t), (e.updateType = g.UpdateType.Pause));
              });
            }
            resumeProduction(t) {
              __classPrivateFieldGet(this, l, "m", u).call(this, d.ActionType.UpdateQueue, (e) => {
                ((e.queueType = t), (e.updateType = g.UpdateType.Resume));
              });
            }
            queueForProduction(t, e, i, r) {
              let s = __classPrivateFieldGet(this, c, "f").rules.getObject(e, i);
              __classPrivateFieldGet(this, l, "m", u).call(this, d.ActionType.UpdateQueue, (e) => {
                ((e.queueType = t), (e.updateType = g.UpdateType.Add), (e.item = s), (e.quantity = r));
              });
            }
            unqueueFromProduction(t, e, i, r) {
              let s = __classPrivateFieldGet(this, c, "f").rules.getObject(e, i);
              __classPrivateFieldGet(this, l, "m", u).call(this, d.ActionType.UpdateQueue, (e) => {
                ((e.queueType = t), (e.updateType = g.UpdateType.Cancel), (e.item = s), (e.quantity = r));
              });
            }
            activateSuperWeapon(t, i, r) {
              __classPrivateFieldGet(this, l, "m", u).call(this, d.ActionType.ActivateSuperWeapon, (e) => {
                ((e.superWeaponType = t),
                  (e.tile = { x: i.rx, y: i.ry }),
                  (e.tile2 = r ? { x: r.rx, y: r.ry } : void 0));
              });
            }
            orderUnits(t, i, r, s, a) {
              __classPrivateFieldGet(this, l, "m", u).call(this, d.ActionType.SelectUnits, (e) => {
                e.unitIds = t;
              });
              let n;
              if (r) {
                let e, t;
                if (s) {
                  e = void 0;
                  var o = __classPrivateFieldGet(this, c, "f").map.tiles.getByMapCoords(r, s);
                  if (!o) throw new Error(`No tile found at rx,ry=${r},` + s);
                  ((t = o), a && (e = __classPrivateFieldGet(this, c, "f").map.tileOccupation.getBridgeOnTile(o)));
                } else {
                  if (!__classPrivateFieldGet(this, c, "f").getWorld().hasObjectId(r)) return;
                  ((e = __classPrivateFieldGet(this, c, "f").getObjectById(r)), (t = e.tile));
                }
                n = __classPrivateFieldGet(this, c, "f").createTarget(e, t);
              }
              __classPrivateFieldGet(this, l, "m", u).call(this, d.ActionType.OrderUnits, (e) => {
                ((e.orderType = i), (e.target = n));
              });
            }
            sayAll(e) {
              __classPrivateFieldGet(this, h, "f")?.sayAll(__classPrivateFieldGet(this, o, "f").name, e);
            }
            setGlobalDebugText(t) {
              __classPrivateFieldGet(this, o, "f").getDebugMode() &&
                __classPrivateFieldGet(this, l, "m", u).call(this, d.ActionType.DebugCommand, (e) => {
                  e.command = new r.DebugCommand(r.DebugCommandType.SetGlobalDebugText, { text: t || "" });
                });
            }
            setUnitDebugText(t, i) {
              __classPrivateFieldGet(this, o, "f").getDebugMode() &&
                __classPrivateFieldGet(this, l, "m", u).call(this, d.ActionType.DebugCommand, (e) => {
                  e.command = new r.DebugCommand(r.DebugCommandType.SetUnitDebugText, { unitId: t, label: i });
                });
            }
            quitGame() {
              __classPrivateFieldGet(this, l, "m", u).call(this, d.ActionType.ResignGame);
            }
          }),
        ),
          (a = new WeakMap()),
          (n = new WeakMap()),
          (c = new WeakMap()),
          (o = new WeakMap()),
          (h = new WeakMap()),
          (l = new WeakSet()),
          (u = function (e, t) {
            let i = __classPrivateFieldGet(this, a, "f").create(e);
            ((i.player = __classPrivateFieldGet(this, c, "f").getPlayerByName(
              __classPrivateFieldGet(this, o, "f").name,
            )),
              t?.(i),
              __classPrivateFieldGet(this, n, "f").push(i));
          }));
      },
    };
  },
);
