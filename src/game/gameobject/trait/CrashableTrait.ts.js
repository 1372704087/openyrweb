// === Reconstructed SystemJS module: game/gameobject/trait/CrashableTrait ===
// deps: ["game/event/ObjectCrashingEvent","game/type/LocomotorType","game/gameobject/trait/interface/NotifyTick","game/gameobject/locomotor/JumpjetLocomotor","game/gameobject/locomotor/WingedLocomotor","game/gameobject/trait/interface/NotifyCrash"]
// Note: variable/type names are minified approximations of the original TypeScript.

System.register(
  "game/gameobject/trait/CrashableTrait",
  [
    "game/event/ObjectCrashingEvent",
    "game/type/LocomotorType",
    "game/gameobject/trait/interface/NotifyTick",
    "game/gameobject/locomotor/JumpjetLocomotor",
    "game/gameobject/locomotor/WingedLocomotor",
    "game/gameobject/trait/interface/NotifyCrash",
  ],
  function (e, t) {
    "use strict";
    var o, l, i, c, h, u, r;
    t && t.id;
    return {
      setters: [
        function (e) {
          o = e;
        },
        function (e) {
          l = e;
        },
        function (e) {
          i = e;
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
      ],
      execute: function () {
        ((r = class {
          constructor(e) {
            ((this.gameObject = e), (this.crashingEvtSent = !1), (this.crashState = {}));
          }
          [i.NotifyTick.onTick](i, r) {
            if (i.isCrashing) {
              if (
                (this.crashingEvtSent ||
                  ((this.crashingEvtSent = !0),
                  i.traits.filter(u.NotifyCrash).forEach((e) => e[u.NotifyCrash.onCrash](i, r)),
                  r.events.dispatch(new o.ObjectCrashingEvent(i))),
                i.rules.locomotor !== l.LocomotorType.Jumpjet && i.rules.locomotor !== l.LocomotorType.Aircraft)
              )
                throw new Error("Crashing logic not implemented for locomotor " + l.LocomotorType[i.rules.locomotor]);
              {
                let e;
                if (i.rules.locomotor === l.LocomotorType.Jumpjet)
                  e = c.JumpjetLocomotor.tickCrash(i, r, this.crashState);
                else {
                  if (i.rules.locomotor !== l.LocomotorType.Aircraft)
                    throw new Error(`Unhandled locomotor type "${i.rules.locomotor}"`);
                  if (!i.isAircraft()) throw new Error(`Obj "${i.name}#${i.id} is not an aircraft`);
                  e = h.WingedLocomotor.tickCrash(i, r, this.crashState);
                }
                let t = !1;
                var s,
                  a,
                  n = e.clone().add(i.position.worldPosition);
                (r.map.isWithinHardBounds(n)
                  ? ((a = i.tile),
                    (s = i.tileElevation),
                    i.position.moveByLeptons3(e),
                    i.tile !== a && i.moveTrait.handleTileChange(a, void 0, !1, r),
                    (a =
                      (n = i.tile.onBridgeLandType ? r.map.tileOccupation.getBridgeOnTile(i.tile) : void 0)
                        ?.tileElevation ?? 0),
                    (i.position.tileElevation = Math.max(i.position.tileElevation, a)),
                    i.position.tileElevation === a &&
                      ((i.zone = r.map.getTileZone(i.tile)), (i.onBridge = !!n), (t = !0)),
                    i.tileElevation !== s && i.moveTrait.handleElevationChange(s, r))
                  : (t = !0),
                  t && r.destroyObject(i, this.attackerInfo));
              }
            }
          }
          crash(e) {
            ((this.attackerInfo = e),
              (this.gameObject.isCrashing = !0),
              (this.gameObject.cachedTraits.tick.length = 0),
              (this.gameObject.cachedTraits.tick = [this]));
          }
          dispose() {
            this.gameObject = void 0;
          }
        }),
          e("CrashableTrait", r));
      },
    };
  },
);
