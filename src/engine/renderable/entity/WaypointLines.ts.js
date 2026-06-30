// === Reconstructed SystemJS module: engine/renderable/entity/WaypointLines ===
// deps: ["game/Coords","game/gameobject/task/system/TargetLinesConfig","util/array","engine/renderable/entity/WaypointLine"]
// Note: variable/type names are minified approximations of the original TypeScript.

System.register(
  "engine/renderable/entity/WaypointLines",
  [
    "game/Coords",
    "game/gameobject/task/system/TargetLinesConfig",
    "util/array",
    "engine/renderable/entity/WaypointLine",
  ],
  function (t, e) {
    "use strict";
    var i, l, o, c, h, r;
    e && e.id;
    return {
      setters: [
        function (e) {
          i = e;
        },
        function (e) {
          l = e;
        },
        function (e) {
          o = e;
        },
        function (e) {
          c = e;
        },
      ],
      execute: function () {
        var e;
        (((e = h = h || {})[(e.Source = 0)] = "Source"),
          (e[(e.InitialTarget = 1)] = "InitialTarget"),
          (e[(e.Waypoint = 2)] = "Waypoint"),
          t(
            "WaypointLines",
            (r = class {
              constructor(e, t, i, r, s) {
                ((this.unitSelection = e),
                  (this.currentPlayer = t),
                  (this.selectedPaths = i),
                  (this.paths = r),
                  (this.camera = s),
                  (this.lastPathWaypoints = new Map()),
                  (this.sourceLinePaths = new Map()),
                  (this.waypointLinePaths = new Map()));
              }
              create3DObject() {
                this.obj ||
                  ((this.obj = new THREE.Object3D()),
                  (this.obj.name = "waypoint_lines"),
                  (this.obj.matrixAutoUpdate = !1));
              }
              get3DObject() {
                return this.obj;
              }
              update(r) {
                var e = this.unitSelection.getHash(),
                  t = void 0 === this.selectionHash || this.selectionHash !== e;
                t && (this.selectionHash = e);
                let i = !this.lastPaths || !o.equals(this.lastPaths, this.paths);
                if (i) this.lastPaths = [...this.paths];
                else
                  for (var s of this.paths) {
                    var a = this.lastPathWaypoints.get(s);
                    if (!a || !o.equals(s.waypoints, a)) {
                      ((i = !0), this.lastPathWaypoints.set(s, [...s.waypoints]));
                      break;
                    }
                  }
                if (t || i) {
                  let e = [],
                    t = this.unitSelection.getSelectedUnits();
                  (1 === t.length && t[0].owner !== this.currentPlayer && (t = []),
                    (e = this.paths.length ? [...new Set([...this.paths.map((e) => [...e.units]).flat(), ...t])] : t),
                    (e = e.filter((e) => e.isSpawned)),
                    [...this.sourceLinePaths.values(), ...this.waypointLinePaths.values()].forEach((e) => {
                      let t = e.lineObj;
                      t && (this.obj.remove(t.get3DObject()), t.dispose());
                    }),
                    this.sourceLinePaths.clear(),
                    this.waypointLinePaths.clear());
                  for (let i of e)
                    if (i.isUnit()) {
                      let e = this.createSourceLinePath(
                        i,
                        this.paths.find((e) => e.units.has(i)),
                      );
                      (this.sourceLinePaths.set(i, e),
                        (e.lineObj = new c.WaypointLine(e, this.camera)),
                        e.lineObj.create3DObject(),
                        this.obj.add(e.lineObj.get3DObject()),
                        e.lineObj.update(r));
                    }
                  for (var n of this.paths) {
                    let e = this.createWaypointLinePath(n, this.selectedPaths.includes(n));
                    (this.waypointLinePaths.set(n, e),
                      (e.lineObj = new c.WaypointLine(e, this.camera)),
                      e.lineObj.create3DObject(),
                      this.obj.add(e.lineObj.get3DObject()),
                      e.lineObj.update(r));
                  }
                } else
                  (this.sourceLinePaths.forEach((e, t) => {
                    (this.updateSourceLinePath(
                      e,
                      t,
                      this.paths.find((e) => e.units.has(t)),
                    ),
                      e.lineObj.update(r));
                  }),
                    this.waypointLinePaths.forEach((e) => {
                      (this.updateWaypointLinePath(e), e.lineObj.update(r));
                    }));
              }
              createSourceLinePath(t, e) {
                var i = !!t.unitOrderTrait.targetLinesConfig && l.configHasTarget(t.unitOrderTrait.targetLinesConfig);
                let r = t.unitOrderTrait.waypointPath
                    ? e?.waypoints.find(
                        (e) =>
                          e.original ===
                          (t.unitOrderTrait.currentWaypoint ?? t.unitOrderTrait.waypointPath.waypoints[0]),
                      )
                    : e?.waypoints.find((e) => e.draft),
                  s = {
                    vertices: [],
                    verticesNeedUpdate: !1,
                    color: 10867711,
                    bgColor: this.unitSelection.isSelected(t) ? 16777215 : 0,
                  };
                var a = {
                    type: h.Source,
                    enabled: i || !!r,
                    lineHead: !0,
                    obj: t,
                    position: t.position.worldPosition.clone(),
                  },
                  i = {
                    type: h.InitialTarget,
                    enabled: i && (!t.unitOrderTrait.waypointPath || !t.unitOrderTrait.currentWaypoint),
                    lineHead: !0,
                    obj: t,
                    position: i
                      ? this.computeInitialTargetPosition(t.unitOrderTrait.targetLinesConfig).clone()
                      : new THREE.Vector3(),
                  };
                return (
                  s.vertices.push(a, i),
                  r &&
                    ((i = {
                      type: h.Waypoint,
                      enabled: !0,
                      lineHead: !1,
                      waypoint: r,
                      position: r.target.getWorldCoords().clone(),
                    }),
                    s.vertices.push(i)),
                  s
                );
              }
              updateSourceLinePath(i, r, e) {
                var s,
                  a = r.unitOrderTrait.waypointPath
                    ? e?.waypoints.find(
                        (e) =>
                          e.original ===
                          (r.unitOrderTrait.currentWaypoint ?? r.unitOrderTrait.waypointPath.waypoints[0]),
                      )
                    : e?.waypoints.find((e) => e.draft),
                  n = !!a,
                  o = !!r.unitOrderTrait.targetLinesConfig && l.configHasTarget(r.unitOrderTrait.targetLinesConfig);
                for (s of i.vertices) {
                  let e, t;
                  (s.type === h.Source
                    ? ((e = n || o), (t = r.position.worldPosition))
                    : s.type === h.InitialTarget
                      ? ((e = o && (!r.unitOrderTrait.waypointPath || !r.unitOrderTrait.currentWaypoint)),
                        o && (t = this.computeInitialTargetPosition(s.obj.unitOrderTrait.targetLinesConfig)))
                      : ((e = n), a && (s.waypoint = a), (t = s.waypoint.target.getWorldCoords())),
                    t && !t.equals(s.position) && ((i.verticesNeedUpdate = !0), s.position.copy(t)),
                    void 0 !== e && e !== s.enabled && ((i.verticesNeedUpdate = !0), (s.enabled = e)));
                }
              }
              createWaypointLinePath(e, t) {
                return {
                  vertices: e.waypoints.map((e) => ({
                    type: h.Waypoint,
                    enabled: !0,
                    lineHead: !0,
                    waypoint: e,
                    position: e.target.getWorldCoords().clone(),
                  })),
                  verticesNeedUpdate: !1,
                  color: 10867711,
                  bgColor: t ? 16777215 : 0,
                };
              }
              updateWaypointLinePath(t) {
                for (var i of t.vertices) {
                  let e = i.waypoint.target.getWorldCoords();
                  e.equals(i.position) || (i.position.copy(e), (t.verticesNeedUpdate = !0));
                }
              }
              computeInitialTargetPosition(e) {
                if (e.pathNodes.length) {
                  var t = e.pathNodes[0];
                  return i.Coords.tile3dToWorld(
                    t.tile.rx + 0.5,
                    t.tile.ry + 0.5,
                    t.tile.z + (t.onBridge?.tileElevation ?? 0),
                  );
                }
                if (e.target) return e.target.position.worldPosition;
                throw new Error("No target and no pathNodes found");
              }
              dispose() {
                (this.sourceLinePaths.forEach((e) => e.lineObj?.dispose()),
                  this.waypointLinePaths.forEach((e) => e.lineObj?.dispose()));
              }
            }),
          ));
      },
    };
  },
);
