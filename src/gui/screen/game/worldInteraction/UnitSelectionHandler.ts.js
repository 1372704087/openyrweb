// === Reconstructed SystemJS module: gui/screen/game/worldInteraction/UnitSelectionHandler ===
// deps: ["util/geometry","util/math","util/event","util/array","game/gameobject/unit/HealthLevel"]
// Note: variable/type names are minified approximations of the original TypeScript.

System.register(
  "gui/screen/game/worldInteraction/UnitSelectionHandler",
  ["util/geometry", "util/math", "util/event", "util/array", "game/gameobject/unit/HealthLevel"],
  function (t, e) {
    "use strict";
    var a, i, n, l, s, o, r;
    e && e.id;
    return {
      setters: [
        function (e) {
          a = e;
        },
        function (e) {
          i = e;
        },
        function (e) {
          n = e;
        },
        function (e) {
          l = e;
        },
        function (e) {
          s = e;
        },
      ],
      execute: function () {
        var e;
        (((e = o || t("QueryType", (o = {})))[(e.None = 0)] = "None"),
          (e[(e.OnScreen = 1)] = "OnScreen"),
          (e[(e.OnMap = 2)] = "OnMap"),
          (e[(e.Veteran = 3)] = "Veteran"),
          (e[(e.Health = 4)] = "Health"),
          t(
            "UnitSelectionHandler",
            (r = class {
              get onUserSelectionChange() {
                return this._onUserSelectionChange.asEvent();
              }
              get onUserSelectionUpdate() {
                return this._onUserSelectionUpdate.asEvent();
              }
              constructor(e, t, i, r, s, a) {
                ((this.worldScene = e),
                  (this.uiScene = t),
                  (this.player = i),
                  (this.unitSelection = r),
                  (this.entityIntersectHelper = s),
                  (this.veteranCap = a),
                  (this.shouldSelectByTypeOnMap = !1),
                  (this.shouldSelectCombatantsOnMap = !1),
                  (this._onUserSelectionChange = new n.EventDispatcher()),
                  (this._onUserSelectionUpdate = new n.EventDispatcher()),
                  this._onUserSelectionChange.subscribe(() => {
                    ((this.shouldSelectByTypeOnMap = !1), (this.shouldSelectCombatantsOnMap = !1));
                  }),
                  this._onUserSelectionUpdate.subscribe(() => {
                    ((this.selectVeteranState = void 0), (this.selectHealthState = void 0));
                  }));
              }
              addToSelection(t) {
                // OpenYRWeb: `slaved` slaves (SLAV) are unselectable, EXCEPT freed/liberated
                // slaves (SlaveMinerTrait._liberateSlaves sets `liberated=true` on the instance,
                // not the shared rules) which become selectable infantry under their liberator.
                if (t.rules.selectable && !(t.rules.slaved && !t.liberated)) {
                  let e = this.unitSelection.getSelectedUnits();
                  (e.length &&
                    ((t.owner === this.player && !e.find((e) => e.owner !== t.owner)) ||
                      this.unitSelection.deselectAll()),
                    this.unitSelection.addToSelection(t));
                }
              }
              selectSingleUnit(e) {
                var t, i, r;
                e.rules.selectable &&
                  !(e.rules.slaved && !e.liberated) &&
                  ((t = this.unitSelection.getSelectedUnits()).length && this.unitSelection.deselectAll(),
                  this.unitSelection.addToSelection(e),
                  (r = { selection: (i = this.unitSelection.getSelectedUnits()) }),
                  (i.length === t.length && i[0] === t[0]) || this._onUserSelectionChange.dispatch(this, r),
                  this._onUserSelectionUpdate.dispatch(this, r));
              }
              toggleSelection(e) {
                var t;
                e.rules.selectable &&
                  !(e.rules.slaved && !e.liberated) &&
                  (this.unitSelection.isSelected(e)
                    ? this.unitSelection.removeFromSelection([e])
                    : this.addToSelection(e),
                  (t = { selection: this.unitSelection.getSelectedUnits() }),
                  this._onUserSelectionChange.dispatch(this, t),
                  this._onUserSelectionUpdate.dispatch(this, t));
              }
              deselectAll() {
                var e = { selection: [] };
                (this.unitSelection.getSelectedUnits().length &&
                  (this.unitSelection.deselectAll(), this._onUserSelectionChange.dispatch(this, e)),
                  this._onUserSelectionUpdate.dispatch(this, e));
              }
              selectMultipleUnits(e, { queryType: t, veteranLevel: i, healthLevel: r }, s = !0) {
                var a = this.unitSelection.getSelectedUnits();
                (s && this.unitSelection.deselectAll(), e.forEach((e) => this.addToSelection(e)));
                var n = this.unitSelection.getSelectedUnits(),
                  o = { selection: n, queryType: t, veteranLevel: i, healthLevel: r };
                (l.equals(a, n) || this._onUserSelectionChange.dispatch(this, o),
                  this._onUserSelectionUpdate.dispatch(this, o));
              }
              getSelectedUnits() {
                return this.unitSelection.getSelectedUnits();
              }
              startBoxSelect(e) {
                ((this.boxSelectOrigin = e),
                  this.disposeBoxSelect(),
                  (this.selectBox = this.createSelectBox(new THREE.Box2())),
                  this.uiScene.get3DObject().add(this.selectBox));
              }
              updateBoxSelect(e) {
                var t;
                this.boxSelectOrigin &&
                  ((e = this.clampPointerToWorldViewport(e)),
                  (t = new THREE.Box2().setFromPoints([
                    new THREE.Vector2(this.boxSelectOrigin.x, this.boxSelectOrigin.y),
                    new THREE.Vector2(e.x, e.y),
                  ])),
                  this.selectBox.geometry.dispose(),
                  (this.selectBox.geometry = this.createBoxGeometry(t)));
              }
              finishBoxSelect(e, t) {
                if (!this.boxSelectOrigin) return !1;
                var i = this.boxSelectOrigin;
                if (((this.boxSelectOrigin = void 0), this.disposeBoxSelect(), a.pointEquals(e, i))) return !1;
                e = this.clampPointerToWorldViewport(e);
                i = new THREE.Box2().setFromPoints([new THREE.Vector2(i.x, i.y), new THREE.Vector2(e.x, e.y)]);
                let r = this.entityIntersectHelper
                  .getEntitiesAtScreenBox(i)
                  ?.map((e) => e.gameObject)
                  .filter((e) => e.isTechno() && e.rules.selectable && !(e.rules.slaved && !e.liberated) && e.owner === this.player);
                if (!r.length) return !1;
                let s;
                return (
                  (s = 1 === r.length ? [r[0]] : r.filter((e) => !e.isBuilding())),
                  !!s.length && (this.selectMultipleUnits(s, { queryType: o.None }, t), !0)
                );
              }
              cancelBoxSelect() {
                ((this.boxSelectOrigin = void 0), this.disposeBoxSelect());
              }
              createGroup(e) {
                var t = this.unitSelection.getSelectedUnits();
                (1 === t.length && t[0].owner !== this.player) || this.unitSelection.createGroup(e);
              }
              getGroupUnits(e) {
                return this.unitSelection.getGroupUnits(e);
              }
              addGroupToSelection(e) {
                var t = this.getSelectedUnits();
                this.unitSelection.addGroupToSelection(e);
                var i = this.getSelectedUnits(),
                  r = { selection: i };
                (l.equals(i, t) || this._onUserSelectionChange.dispatch(this, r),
                  this._onUserSelectionUpdate.dispatch(this, r));
              }
              selectGroup(e) {
                var t = this.getSelectedUnits();
                this.unitSelection.selectGroup(e);
                var i = this.getSelectedUnits(),
                  r = { selection: i };
                (l.equals(i, t) || this._onUserSelectionChange.dispatch(this, r),
                  this._onUserSelectionUpdate.dispatch(this, r));
              }
              selectByType() {
                let r = this.player ?? this.unitSelection.getSelectedUnits()[0]?.owner;
                if (r) {
                  let t = this.getSelectedUnits().reduce((e, t) => e.add(t.name), new Set()),
                    e = [],
                    i = [];
                  (this.shouldSelectByTypeOnMap ||
                    ((e = this.getOwnedObjectsOnScreen(r)),
                    (i = e.filter((e) => t.has(e.name))),
                    i.every((e) => this.unitSelection.isSelected(e)) && (this.shouldSelectByTypeOnMap = !0)),
                    this.shouldSelectByTypeOnMap && ((e = r.getOwnedObjects()), (i = e.filter((e) => t.has(e.name)))));
                  var s = this.shouldSelectByTypeOnMap ? o.OnMap : o.OnScreen;
                  (i.length
                    ? this.selectMultipleUnits(i, { queryType: s }, !1)
                    : t.size || this.selectMultipleUnits([], { queryType: s }),
                    (this.shouldSelectByTypeOnMap = !0));
                }
              }
              selectCombatants() {
                let t = this.player ?? this.unitSelection.getSelectedUnits()[0]?.owner;
                if (t) {
                  let e = [];
                  e = this.shouldSelectCombatantsOnMap ? t.getOwnedObjects() : this.getOwnedObjectsOnScreen(t);
                  var i,
                    r = e.filter(
                      (e) =>
                        e.isUnit() &&
                        e.rules.selectable &&
                        e.rules.isSelectableCombatant &&
                        e.attackTrait &&
                        !e.rules.harvester,
                    );
                  (r.length
                    ? ((i = this.shouldSelectCombatantsOnMap ? o.OnMap : o.OnScreen),
                      this.selectMultipleUnits(r, { queryType: i }))
                    : this.shouldSelectCombatantsOnMap
                      ? this.selectMultipleUnits([], { queryType: o.OnMap })
                      : ((this.shouldSelectCombatantsOnMap = !0), this.selectCombatants()),
                    (this.shouldSelectCombatantsOnMap = !0));
                }
              }
              selectByVeterancy() {
                let i = this.player ?? this.unitSelection.getSelectedUnits()[0]?.owner;
                if (i) {
                  let t;
                  void 0 === this.selectVeteranState
                    ? ((t = this.veteranCap),
                      (this.vetNavSelectionSet = this.unitSelection.getSelectedUnits()),
                      this.vetNavSelectionSet.length ||
                        (this.vetNavSelectionSet = this.getOwnedObjectsOnScreen(i).filter((e) => e.isUnit())))
                    : ((r = this.veteranCap + 1), (t = (this.selectVeteranState - 1 + r) % r));
                  let e = this.vetNavSelectionSet.filter(
                    (e) => e.rules.selectable && !(e.rules.slaved && !e.liberated) && !e.isDestroyed && !e.isCrashing && !e.limboData && e.owner === i,
                  );
                  var r = e.filter((e) => e.veteranLevel === t);
                  (this.selectMultipleUnits(r, { queryType: o.Veteran, veteranLevel: e.length ? t : void 0 }),
                    (this.selectVeteranState = t));
                }
              }
              selectByHealth() {
                let i = this.player ?? this.unitSelection.getSelectedUnits()[0]?.owner;
                if (i) {
                  let t;
                  var r = Object.keys(s.HealthLevel).filter((e) => !isNaN(Number(e))).length;
                  void 0 === this.selectHealthState
                    ? ((t = r - 1),
                      (this.healthNavSelectionSet = this.unitSelection.getSelectedUnits()),
                      this.healthNavSelectionSet.length ||
                        (this.healthNavSelectionSet = this.getOwnedObjectsOnScreen(i).filter((e) => e.isUnit())))
                    : (t = (this.selectHealthState - 1 + r) % r);
                  let e = this.healthNavSelectionSet.filter(
                    (e) => e.rules.selectable && !(e.rules.slaved && !e.liberated) && !e.isDestroyed && !e.isCrashing && !e.limboData && e.owner === i,
                  );
                  r = e.filter((e) => e.healthTrait.level === t);
                  (this.selectMultipleUnits(r, { queryType: o.Health, healthLevel: e.length ? t : void 0 }),
                    (this.selectHealthState = t));
                }
              }
              getOwnedObjectsOnScreen(t) {
                var e = this.worldScene.viewport,
                  e = new THREE.Box2(
                    new THREE.Vector2(e.x, e.y),
                    new THREE.Vector2(e.x + e.width - 1, e.x + e.height - 1),
                  );
                return this.entityIntersectHelper
                  .getEntitiesAtScreenBox(e)
                  ?.map((e) => e.gameObject)
                  .filter((e) => e.isTechno() && e.owner === t);
              }
              disposeBoxSelect() {
                this.selectBox &&
                  (this.uiScene.get3DObject().remove(this.selectBox),
                  this.selectBox.geometry.dispose(),
                  this.selectBox.material.dispose(),
                  (this.selectBox = void 0));
              }
              clampPointerToWorldViewport(e) {
                var t = this.worldScene.viewport;
                return { x: i.clamp(e.x, t.x, t.x + t.width - 1), y: i.clamp(e.y, t.y, t.y + t.height - 1) };
              }
              getHash() {
                return this.unitSelection.getHash();
              }
              dispose() {
                (this.cancelBoxSelect(),
                  (this._onUserSelectionChange = new n.EventDispatcher()),
                  (this._onUserSelectionUpdate = new n.EventDispatcher()));
              }
              createSelectBox(e) {
                var t = new THREE.LineBasicMaterial({
                    color: 16777215,
                    transparent: !0,
                    depthTest: !1,
                    depthWrite: !1,
                  }),
                  i = this.createBoxGeometry(e);
                return new THREE.Line(i, t);
              }
              createBoxGeometry(e) {
                var t = { x: e.min.x, y: e.min.y },
                  i = { x: e.max.x, y: e.max.y },
                  r = { x: e.max.x, y: e.min.y },
                  s = { x: e.min.x, y: e.max.y };
                let a = new THREE.Geometry();
                return (
                  a.vertices.push(
                    new THREE.Vector3(t.x, t.y, 0),
                    new THREE.Vector3(s.x, s.y, 0),
                    new THREE.Vector3(i.x, i.y, 0),
                    new THREE.Vector3(r.x, r.y, 0),
                    new THREE.Vector3(t.x, t.y, 0),
                  ),
                  a
                );
              }
            }),
          ));
      },
    };
  },
);
