// === Reconstructed SystemJS module: game/gameobject/task/morph/MorphIntoTask ===
// deps: ["game/gameobject/task/system/Task","engine/type/ObjectType","game/gameobject/Building","game/gameobject/task/move/MoveTask","game/event/ObjectMorphEvent","game/gameobject/task/TurnTask","game/gameobject/task/morph/PackBuildingTask","game/event/UnitDeployUndeployEvent"]
// Note: variable/type names are minified approximations of the original TypeScript.

System.register(
  "game/gameobject/task/morph/MorphIntoTask",
  [
    "game/gameobject/task/system/Task",
    "engine/type/ObjectType",
    "game/gameobject/Building",
    "game/gameobject/task/move/MoveTask",
    "game/event/ObjectMorphEvent",
    "game/gameobject/task/TurnTask",
    "game/gameobject/task/morph/PackBuildingTask",
    "game/event/UnitDeployUndeployEvent",
  ],
  function (e, t) {
    "use strict";
    var i, o, r, l, c, s, a, n, h;
    t && t.id;
    return {
      setters: [
        function (e) {
          i = e;
        },
        function (e) {
          o = e;
        },
        function (e) {
          r = e;
        },
        function (e) {
          l = e;
        },
        function (e) {
          c = e;
        },
        function (e) {
          s = e;
        },
        function (e) {
          a = e;
        },
        function (e) {
          h = e;
        },
      ],
      execute: function () {
        ((n = class extends i.Task {
          constructor(e) {
            (super(), (this.game = e));
          }
          onStart(e) {
            if (!this.morphInto) throw new Error("morphInto not set");
            (e.isBuilding() &&
              e.buildStatus !== r.BuildStatus.BuildDown &&
              this.morphInto.type !== o.ObjectType.Building &&
              this.children.push(new a.PackBuildingTask(this.game)),
              e.isVehicle() &&
                this.morphInto.type === o.ObjectType.Building &&
                this.children.push(new s.TurnTask(180)));
          }
          onTick(t) {
            if (!this.morphInto) throw new Error("morphInto not set");
            let e = this.game.getUnitSelection();
            var i = e.isSelected(t),
              cg = e.getOrCreateSelectionModel(t).getControlGroupNumber(),
              s = this.morphInto;
            let a;
            if (s.type === o.ObjectType.Building) {
              if (t.isVehicle() && t.parasiteableTrait?.isInfested() && !t.parasiteableTrait.beingBoarded) return !0;
              var n = t.tile;
              let e = this.game.getConstructionWorker(t.owner);
              if (!e.canPlaceAt(this.morphInto.name, n, { ignoreAdjacent: !0, ignoreObjects: [t] })) return !0;
              // OpenYRWeb: mark slave-miner morph so its SlaveMinerTrait.NotifyUnspawn silently
              // recalls slaves instead of liberating them to the civilian player on a mere
              // deploy/undeploy (the building is being re-spawned as another form, not sold).
              // VEHICLE→BUILDING (deploy): the vehicle holds slaves inside (SlaveMinerVehicleTrait);
              // set its _morphInFlight so it stashes the slave pool on game._pendingMinerSlaves
              // for the new building's SlaveMinerTrait.NotifySpawn to re-enter onto the map.
              if (t.slaveMinerTrait) t.slaveMinerTrait._morphInFlight = !0;
              if (t.slaveMinerVehicleTrait) t.slaveMinerVehicleTrait._stashSlavesForMorph(this.game);
              // Dispatch deploy/undeploy sound BEFORE unspawn (vehicle still alive, can play sound).
              this.game.events.dispatch(
                new h.UnitDeployUndeployEvent(t, "deploy"),
              );
              (this.game.unspawnObject(t),
                t.dispose(),
                ([a] = e.placeAt(this.morphInto.name, n)),
                a.healthTrait.health = t.healthTrait.health);
            } else {
              let e = t.unitOrderTrait.getTasks().filter((e) => e instanceof l.MoveTask);
              if (t.slaveMinerTrait) t.slaveMinerTrait._morphInFlight = !0;
              // Dispatch deploy/undeploy sound BEFORE unspawn (unit still alive, can play sound).
              this.game.events.dispatch(
                new h.UnitDeployUndeployEvent(t, "undeploy"),
              );
              (this.game.unspawnObject(t),
                t.dispose(),
                (a = this.game.createUnitForPlayer(this.morphInto, t.owner)),
                (a.direction = 180),
                (a.healthTrait.health = t.healthTrait.health));
              n = t.art.foundationCenter;
              (this.game.spawnObject(a, this.game.map.tiles.getByMapCoords(t.tile.rx + n.x, t.tile.ry + n.y)),
                e.forEach((e) => a.unitOrderTrait.addTask(e)));
            }
            return (
              (a.purchaseValue = t.purchaseValue),
              (t.replacedBy = a),
              i && e.addToSelection(a),
              void 0 !== cg && e.addUnitsToGroup(cg, [a], !1),
              this.game.events.dispatch(new c.ObjectMorphEvent(t, a)),
              !0
            );
          }
        }),
          e("MorphIntoTask", n));
      },
    };
  },
);
