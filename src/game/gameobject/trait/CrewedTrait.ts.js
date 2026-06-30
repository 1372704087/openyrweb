// === Reconstructed SystemJS module: game/gameobject/trait/CrewedTrait ===
// deps: ["game/gameobject/trait/interface/NotifySell","game/gameobject/trait/interface/NotifyDestroy","game/SideType","engine/type/ObjectType","game/gameobject/task/ScatterTask","game/gameobject/Infantry","game/gameobject/unit/VeteranLevel"]
// Note: variable/type names are minified approximations of the original TypeScript.

System.register(
  "game/gameobject/trait/CrewedTrait",
  [
    "game/gameobject/trait/interface/NotifySell",
    "game/gameobject/trait/interface/NotifyDestroy",
    "game/SideType",
    "engine/type/ObjectType",
    "game/gameobject/task/ScatterTask",
    "game/gameobject/Infantry",
    "game/gameobject/unit/VeteranLevel",
  ],
  function (e, t) {
    "use strict";
    var i, r, d, g, p, m, f, s;
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
      ],
      execute: function () {
        ((s = class {
          [i.NotifySell.onSell](e, t) {
            this.spawnSurvivors(e, t);
          }
          [r.NotifyDestroy.onDestroy](e, t, i, r) {
            r ||
              (i?.obj === e && i.weapon?.rules.suicide) ||
              (e.isVehicle() && e.moveTrait.isMoving()) ||
              e.crashableTrait ||
              this.spawnSurvivors(e, t);
          }
          spawnSurvivors(r, s) {
            var e = s.rules.general.crew,
              t = r.owner.country.side;
            let i, a;
            if (t === d.SideType.GDI) ((i = e.alliedSurvivorDivisor), (a = e.alliedCrew));
            else if (t === d.SideType.Nod) ((i = e.sovietSurvivorDivisor), (a = e.sovietCrew));
            else {
              if (t !== d.SideType.ThirdSide) return;
              ((i = e.thirdSurvivorDivisor), (a = e.thirdCrew));
            }
            let n = s.sellTrait.computeRefundValue(r) / i;
            ((n = 0 < n && n < 1 ? 1 : Math.floor(n)), (n = r.isVehicle() ? Math.min(1, n) : Math.min(5, n)));
            let o = [];
            for (let u = 0; u < n; u++) o.push(a);
            if (0 < o.length) {
              r.rules.constructionYard && (o[o.length - 1] = s.rules.general.engineer);
              var l,
                c = s.map.tiles.getInRectangle(r.tile, r.getFoundation()).filter((e) => s.map.isWithinBounds(e));
              let i = [...c];
              for (l of o) {
                var h = s.rules.getObject(l, g.ObjectType.Infantry);
                if (
                  s.map.terrain.getPassableSpeed(r.tile, h.speedType, !0, !r.isBuilding() && r.onBridge, void 0, !0)
                ) {
                  let e = s.createUnitForPlayer(h, r.owner),
                    t = i.length ? i.splice(s.generateRandomInt(0, i.length - 1), 1)[0] : void 0;
                  ((t = t || c[s.generateRandomInt(0, c.length - 1)]),
                    e.isInfantry() && (e.position.subCell = m.Infantry.SUB_CELLS[0]),
                    e.veteranTrait &&
                      r.owner.canProduceVeteran(e.rules) &&
                      e.veteranTrait.setVeteranLevel(f.VeteranLevel.Veteran),
                    s.spawnObject(e, t),
                    r.isBuilding() &&
                      e.unitOrderTrait.addTask(
                        new p.ScatterTask(s, void 0, { ignoredBlockers: r.isDestroyed ? void 0 : [r] }),
                      ));
                }
              }
            }
          }
        }),
          e("CrewedTrait", s));
      },
    };
  },
);
