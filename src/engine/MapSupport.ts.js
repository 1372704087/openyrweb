// === Reconstructed SystemJS module: engine/MapSupport ===
// deps: ["game/rules/Rules","engine/Engine","game/theater/TileSets","engine/TheaterType","engine/type/ObjectType"]
// Note: variable/type names are minified approximations of the original TypeScript.

System.register(
  "engine/MapSupport",
  ["game/rules/Rules", "engine/Engine", "game/theater/TileSets", "engine/TheaterType", "engine/type/ObjectType"],
  function (e, t) {
    "use strict";
    var p, m, f, y, T, i;
    t && t.id;
    return {
      setters: [
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
          y = e;
        },
        function (e) {
          T = e;
        },
      ],
      execute: function () {
        e(
          "MapSupport",
          (i = class {
            static check(e, i) {
              if (e.iniFormat < 4) return i.get("TS:MapUnsupportedGame");
              if (e.startingLocations.length < 2) return i.get("TXT_SCENARIO_TOO_SMALL", e.startingLocations.length);
              if (!m.Engine.supportsTheater(e.theaterType))
                return i.get("TS:MapUnsupportedTheater", y.TheaterType[e.theaterType]);
              var r,
                t,
                s,
                a,
                n,
                o,
                l,
                c = m.Engine.getTheaterIni(m.Engine.getActiveEngine(), e.theaterType);
              let h = new f.TileSets(c);
              if (e.maxTileNum > h.readMaxTileNum()) return i.get("TS:MapUnsupportedTileSet");
              let u = new p.Rules(m.Engine.getRules().clone().mergeWith(e));
              if (!u.hasOverlayId(e.maxOverlayId)) return i.get("TS:MapUnsupportedOverlay", e.maxOverlayId);
              let d = u
                .getIni()
                .getOrderedSections()
                .map((e) => e.name.toLowerCase());
              for (r of u.weaponTypes.values()) {
                if (!u.getIni().getSection(r)) return i.get("TS:MapUnsupportedWeapon", r);
                var g = u.getWeapon(r);
                let e = g.projectile,
                  t = g.warhead;
                if (!e || !t) return i.get("TS:MapUnsupportedWeapon", r);
                if (!d.includes(e.toLowerCase())) return i.get("TS:MapUnsupportedProjectile", e);
                if (!d.includes(t.toLowerCase())) return i.get("TS:MapUnsupportedWarhead", t);
              }
              for (t of [...u.general.baseUnit, ...u.general.harvesterUnit])
                if (t && !u.hasObject(t, T.ObjectType.Vehicle)) return i.get("TS:MapUnsupportedTechno", t);
              for (s of u.general.defaultMirageDisguises)
                if (s && !u.terrainRules.has(s)) return i.get("TS:MapUnsupportedTerrain", s);
              for (a of [
                u.general.engineer,
                u.general.crew.alliedCrew,
                u.general.crew.sovietCrew,
                u.general.alliedDisguise,
                u.general.sovietDisguise,
              ])
                if (a && !u.infantryRules.has(a)) return i.get("TS:MapUnsupportedTechno", a);
              for (n of [u.crateRules.crateImg, u.crateRules.waterCrateImg])
                if (n && !u.overlayRules.has(n)) return i.get("TS:MapUnsupportedOverlay", n);
              for (o of u.buildingRules.values())
                if (o.undeploysInto && !u.hasObject(o.undeploysInto, T.ObjectType.Vehicle))
                  return i.get("TS:MapUnsupportedTechno", o.undeploysInto);
              for (l of [...u.infantryRules.values(), ...u.vehicleRules.values(), ...u.aircraftRules.values()]) {
                if (l.spawns && !u.hasObject(l.spawns, T.ObjectType.Aircraft))
                  return i.get("TS:MapUnsupportedTechno", l.spawns);
                if (l.deploysInto && !u.hasObject(l.deploysInto, T.ObjectType.Building))
                  return i.get("TS:MapUnsupportedTechno", l.deploysInto);
              }
            }
          }),
        );
      },
    };
  },
);
