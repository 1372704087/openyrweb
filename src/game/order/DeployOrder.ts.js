// === Reconstructed SystemJS module: game/order/DeployOrder ===
// deps: ["game/order/Order","game/order/OrderType","engine/type/PointerType","game/gameobject/task/morph/DeployIntoTask","game/gameobject/infantry/StanceType","game/gameobject/task/system/CallbackTask","game/event/UnitDeployUndeployEvent","game/event/PrimaryFactoryChangeEvent","game/gameobject/task/EvacuateTransportTask","game/type/SpeedType"]
// Note: variable/type names are minified approximations of the original TypeScript.

System.register(
  "game/order/DeployOrder",
  [
    "game/order/Order",
    "game/order/OrderType",
    "engine/type/PointerType",
    "game/gameobject/task/morph/DeployIntoTask",
    "game/gameobject/infantry/StanceType",
    "game/gameobject/task/system/CallbackTask",
    "game/event/UnitDeployUndeployEvent",
    "game/event/PrimaryFactoryChangeEvent",
    "game/gameobject/task/EvacuateTransportTask",
    "game/type/SpeedType",
  ],
  function (e, t) {
    "use strict";
    var i, r, s, a, n, o, l, c, h, u, d;
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
      ],
      execute: function () {
        ((d = class extends i.Order {
          constructor(e, t) {
            (super(t ? r.OrderType.Deploy : r.OrderType.DeploySelected),
              (this.game = e),
              (this.targeted = t),
              (this.minimapAllowed = !1),
              (this.getPointerType = () => (this.isAllowed() ? s.PointerType.Deploy : s.PointerType.NoDeploy)),
              (this.targetOptional = !t),
              (this.singleSelectionRequired = t));
          }
          isValid() {
            if (this.targeted && (!this.target.obj || this.target.obj !== this.sourceObject)) return !1;
            let e = this.sourceObject;
            return !!(
              (e.isInfantry() && e.deployerTrait && ![n.StanceType.Cheer].includes(e.stance)) ||
              (e.isVehicle() && e.deployerTrait) ||
              (e.isVehicle() && e.rules.deploysInto) ||
              (e.isVehicle() && e.transportTrait) ||
              (e.isBuilding() && e.rules.factory && !e.owner.production?.isPrimaryFactory(e)) ||
              (e.isBuilding() && e.garrisonTrait?.units.length)
            );
          }
          isAllowed() {
            let t = this.sourceObject;
            if (t.isVehicle() && t.transportTrait)
              return !!(
                t.transportTrait.units.length &&
                0 < this.game.map.terrain.getPassableSpeed(t.tile, u.SpeedType.Foot, !1, t.onBridge)
              );
            if ((t.isInfantry() || t.isVehicle()) && t.deployerTrait) return !0;
            if (t.isVehicle() && t.rules.deploysInto) {
              if (t.parasiteableTrait?.isInfested() && !t.parasiteableTrait.beingBoarded) return !1;
              let e = this.game.getConstructionWorker(t.owner);
              if (t.moveTrait.currentWaypoint?.onBridge) return !1;
              var i = t.moveTrait.currentWaypoint?.tile ?? t.tile;
              return e.canPlaceAt(t.rules.deploysInto, i, { ignoreObjects: [t], ignoreAdjacent: !0 });
            }
            if (t.isBuilding() && t.rules.factory) return !0;
            if (t.isBuilding() && t.garrisonTrait?.units.length) return !0;
            throw new Error("Shouldn't reach this point. Missed a case.");
          }
          process() {
            const e = this.sourceObject;
            return e.isVehicle() && e.transportTrait
              ? [new h.EvacuateTransportTask(this.game, !0)]
              : e.isBuilding() && e.rules.factory
                ? void 0
                : e.isVehicle() && e.rules.deploysInto
                  ? [new a.DeployIntoTask(this.game)]
                  : (e.isInfantry() || e.isVehicle()) && e.deployerTrait
                    ? [
                        new o.CallbackTask(() => {
                          (e.deployerTrait.toggleDeployed(),
                            this.game.events.dispatch(
                              new l.UnitDeployUndeployEvent(e, e.deployerTrait.isDeployed() ? "undeploy" : "deploy"),
                            ));
                        }),
                      ]
                    : e.isBuilding() && e.garrisonTrait?.units.length
                      ? [
                          new o.CallbackTask(() => {
                            e.garrisonTrait.evacuate(this.game, !0);
                          }),
                        ]
                      : void 0;
          }
          onAdd(t, e) {
            let i = this.sourceObject;
            if (i.isBuilding() && i.rules.factory)
              return (
                i.owner.production.setPrimaryFactory(i),
                this.game.events.dispatch(new c.PrimaryFactoryChangeEvent(i)),
                !1
              );
            if (i.isVehicle() && i.transportTrait && !e && this.isValid() && this.isAllowed()) {
              let e = t.find((e) => e.constructor === h.EvacuateTransportTask && !e.isCancelling());
              if (e) return (e.forceEvac(), !1);
            }
            return !0;
          }
        }),
          e("DeployOrder", d));
      },
    };
  },
);
