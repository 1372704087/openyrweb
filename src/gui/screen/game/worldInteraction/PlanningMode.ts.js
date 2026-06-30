// === Reconstructed SystemJS module: gui/screen/game/worldInteraction/PlanningMode ===
// deps: ["game/order/OrderType","engine/sound/SoundKey","engine/sound/ChannelType","engine/type/ObjectType","util/typeGuard","engine/renderable/entity/WaypointLines","game/action/OrderUnitsAction"]
// Note: variable/type names are minified approximations of the original TypeScript.

System.register(
  "gui/screen/game/worldInteraction/PlanningMode",
  [
    "game/order/OrderType",
    "engine/sound/SoundKey",
    "engine/sound/ChannelType",
    "engine/type/ObjectType",
    "util/typeGuard",
    "engine/renderable/entity/WaypointLines",
    "game/action/OrderUnitsAction",
  ],
  function (e, t) {
    "use strict";
    var n, o, l, i, r, s, c, a;
    t && t.id;
    return {
      setters: [
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
          i = e;
        },
        function (e) {
          r = e;
        },
        function (e) {
          s = e;
        },
        function (e) {
          c = e;
        },
      ],
      execute: function () {
        e(
          "PlanningMode",
          (a = class {
            constructor(e, t, i, r, s, a, n, o, l, c) {
              ((this.player = e),
                (this.messageList = t),
                (this.sound = i),
                (this.strings = r),
                (this.worldScene = s),
                (this.unitSelection = a),
                (this.unitSelectionHandler = n),
                (this.renderer = o),
                (this.targetLines = l),
                (this.maxWaypointPathLength = c),
                (this.active = !1),
                (this.paths = []),
                (this.selectedPaths = []),
                (this.selectedUnits = new Set()),
                (this.onFrame = (e) => {
                  (!this.lastUpdate || e - this.lastUpdate > 1e3 / 15) && ((this.lastUpdate = e), this.updatePaths());
                }));
            }
            isActive() {
              return this.active;
            }
            enter() {
              var e;
              this.active ||
                ((this.active = !0),
                this.targetLines.get3DObject() && (this.targetLines.get3DObject().visible = !1),
                this.renderer.onFrame.subscribe(this.onFrame),
                (e = new Set(
                  [
                    ...this.player.getOwnedObjectsByType(i.ObjectType.Infantry),
                    ...this.player.getOwnedObjectsByType(i.ObjectType.Vehicle),
                  ]
                    .map((e) => e.unitOrderTrait.waypointPath)
                    .filter(r.isNotNullOrUndefined),
                )),
                (this.paths = [...e].map((e) => {
                  let i = { original: e, units: new Set(e.units), waypoints: [] };
                  return (
                    e.waypoints.forEach((e) => {
                      var t = {
                        orderType: e.orderType,
                        target: e.target,
                        next: void 0,
                        draft: !1,
                        terminal: e.terminal,
                        original: e,
                      };
                      (i.waypoints.length && (i.waypoints[i.waypoints.length - 1].next = t), i.waypoints.push(t));
                    }),
                    i
                  );
                })),
                (e = this.waypointLines =
                  new s.WaypointLines(
                    this.unitSelection,
                    this.player,
                    this.selectedPaths,
                    this.paths,
                    this.worldScene.camera,
                  )),
                this.worldScene.add(e));
            }
            pushOrder(t, i, r) {
              if (t !== n.OrderType.Deploy)
                if (1 < this.selectedPaths.length)
                  this.handleInvalidCommand(this.strings.get("MSG:PlanningModeHeteroSel"));
                else if (this.selectedUnits.size > c.ORDER_UNIT_LIMIT)
                  this.handleInvalidCommand(this.strings.get("MSG:PlannerMaximum"));
                else {
                  for (var s of this.selectedUnits) {
                    if (s.isBuilding())
                      return void this.handleInvalidCommand(this.strings.get("MSG:PlanningModeNoBuildings"));
                    if (s.isAircraft())
                      return void this.handleInvalidCommand(this.strings.get("MSG:PlanningModeNoAircraft"));
                  }
                  let e = this.selectedPaths[0];
                  var a;
                  (!e &&
                    this.selectedUnits.size &&
                    ((e = { original: void 0, units: new Set(this.selectedUnits), waypoints: [] }),
                    this.paths.push(e),
                    this.selectedPaths.push(e)),
                    e &&
                      (e.waypoints.length !== this.maxWaypointPathLength
                        ? e.waypoints.find((e) => e.target.equals(i))
                          ? this.handleInvalidCommand(this.strings.get("MSG:PlanningModeInvalidNodeX"))
                          : e.waypoints.length &&
                              e.waypoints.slice(e.waypoints[0].draft ? 0 : 1).find((e) => e.terminal)
                            ? this.handleInvalidCommand(this.strings.get("MSG:PostTerminatingCommand"))
                            : ((a = {
                                orderType: t,
                                target: i,
                                terminal: r,
                                next: void 0,
                                draft: !0,
                                original: void 0,
                              }),
                              e.waypoints.length && (e.waypoints[e.waypoints.length - 1].next = a),
                              e.waypoints.push(a),
                              r
                                ? (this.handleInvalidCommand(this.strings.get("MSG:PostTerminatingCommand")),
                                  this.unitSelectionHandler.deselectAll())
                                : this.sound.play(o.SoundKey.AddPlanningModeCommandSound, l.ChannelType.Ui))
                        : this.handleInvalidCommand(this.strings.get("MSG:NodeMaximum"))));
                }
              else this.handleInvalidCommand(this.strings.get("MSG:PlanningModeNoDeploy"));
            }
            exit() {
              let e = this.paths;
              this.active &&
                (this.targetLines.get3DObject() && (this.targetLines.get3DObject().visible = !0),
                this.renderer.onFrame.unsubscribe(this.onFrame),
                (this.active = !1),
                (this.paths = []),
                (this.selectedPaths = []),
                this.selectedUnits.clear(),
                this.waypointLines &&
                  (this.worldScene.remove(this.waypointLines),
                  this.waypointLines.dispose(),
                  (this.waypointLines = void 0)));
              for (var t of e) t.waypoints = t.waypoints.filter((e) => e.draft);
              return e.filter((e) => e.waypoints.length);
            }
            updatePaths() {
              for (let t of this.paths) {
                var e;
                t.original &&
                  (t.original.units.length === t.units.size ||
                    t.waypoints.find((e) => e.draft) ||
                    (t.units = new Set(t.original.units)),
                  0 === t.original.units.length
                    ? (t.waypoints = t.waypoints.filter((e) => e.draft))
                    : (t.waypoints = t.waypoints.filter((e) => e.draft || t.original.waypoints.includes(e.original))),
                  t.waypoints.length ||
                    (this.paths.splice(this.paths.indexOf(t), 1),
                    -1 !== (e = this.selectedPaths.indexOf(t)) && this.selectedPaths.splice(e, 1)));
              }
            }
            updateSelection(e) {
              this.updatePaths();
              let t = [...e],
                i = new Set();
              for (var r of e) for (var s of this.paths) s.units.has(r) && (i.add(s), t.push(...s.units));
              ((this.selectedPaths.length = 0), this.selectedPaths.push(...i));
              var a = new Set(t);
              if ((this.selectedUnits = a).size !== e.length) return [...this.selectedUnits];
            }
            handleInvalidCommand(e) {
              (this.sound.play(o.SoundKey.ScoldSound, l.ChannelType.Ui), this.messageList.addUiFeedbackMessage(e));
            }
            dispose() {
              this.exit();
            }
          }),
        );
      },
    };
  },
);
