// === Reconstructed SystemJS module: game/api/EventsApi ===
// deps: ["game/event/EventType"]
// Note: variable/type names are minified approximations of the original TypeScript.

System.register("game/api/EventsApi", ["game/event/EventType"], function (t, e) {
  "use strict";
  var a, n, o, l, i, r, s;
  e && e.id;
  return {
    setters: [
      function (e) {
        i = e;
      },
    ],
    execute: function () {
      var e;
      (((e = r || t("ApiEventType", (r = {})))[(e.ObjectOwnerChange = 0)] = "ObjectOwnerChange"),
        (e[(e.ObjectSpawn = 1)] = "ObjectSpawn"),
        (e[(e.ObjectUnspawn = 2)] = "ObjectUnspawn"),
        (e[(e.ObjectDestroy = 3)] = "ObjectDestroy"),
        t(
          "EventsApi",
          (s = class {
            constructor(e) {
              (a.add(this), n.set(this, void 0), o.set(this, []), __classPrivateFieldSet(this, n, e, "f"));
            }
            subscribe(e, t) {
              let i = void 0,
                r;
              r = "function" == typeof e ? e : ((i = e), t);
              var s = __classPrivateFieldGet(this, n, "f").subscribe((e) => {
                var t = __classPrivateFieldGet(this, a, "m", l).call(this, e);
                !t || (void 0 !== i && i !== t.type) || r(t);
              });
              return (__classPrivateFieldGet(this, o, "f").push(s), s);
            }
            dispose() {
              for (var e of __classPrivateFieldGet(this, o, "f")) e();
              __classPrivateFieldGet(this, o, "f").length = 0;
            }
          }),
        ),
        (n = new WeakMap()),
        (o = new WeakMap()),
        (a = new WeakSet()),
        (l = function (t) {
          switch (t.type) {
            case i.EventType.ObjectOwnerChange:
              return {
                type: r.ObjectOwnerChange,
                prevOwnerName: t.prevOwner.name,
                newOwnerName: t.target.owner.name,
                target: t.target.id,
              };
            case i.EventType.ObjectSpawn:
              return { type: r.ObjectSpawn, target: t.gameObject.id };
            case i.EventType.ObjectUnspawn:
              return { type: r.ObjectUnspawn, target: t.gameObject.id };
            case i.EventType.ObjectDestroy: {
              let e = t;
              return e.target.isProjectile()
                ? void 0
                : {
                    type: r.ObjectDestroy,
                    target: e.target.id,
                    attackerInfo: e.attackerInfo
                      ? {
                          playerName: e.attackerInfo.player.name,
                          objId: e.attackerInfo.obj?.id,
                          weaponName: e.attackerInfo.weapon?.rules.name,
                        }
                      : void 0,
                  };
            }
            default:
              return;
          }
        }));
    },
  };
});
