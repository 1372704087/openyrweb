// === Reconstructed SystemJS module: game/type/LandType ===
// deps: ["engine/type/TerrainType"]
// Note: variable/type names are minified approximations of the original TypeScript.

System.register("game/type/LandType", ["engine/type/TerrainType"], function (t, e) {
  "use strict";
  var i, r, s;
  e && e.id;
  return (
    t("getLandType", function (e) {
      if (!s.has(e)) throw new Error("Unknown terrain type " + e);
      return s.get(e);
    }),
    {
      setters: [
        function (e) {
          i = e;
        },
      ],
      execute: function () {
        var e;
        (((e = r || t("LandType", (r = {})))[(e.Clear = 0)] = "Clear"),
          (e[(e.Road = 1)] = "Road"),
          (e[(e.Rock = 2)] = "Rock"),
          (e[(e.Beach = 3)] = "Beach"),
          (e[(e.Rough = 4)] = "Rough"),
          (e[(e.Railroad = 5)] = "Railroad"),
          (e[(e.Weeds = 6)] = "Weeds"),
          (e[(e.Water = 7)] = "Water"),
          (e[(e.Wall = 8)] = "Wall"),
          (e[(e.Tiberium = 9)] = "Tiberium"),
          (e[(e.Cliff = 10)] = "Cliff"),
          (s = new Map([
            [i.TerrainType.Default, r.Clear],
            [i.TerrainType.Clear, r.Clear],
            [i.TerrainType.Tunnel, r.Cliff],
            [i.TerrainType.Railroad, r.Railroad],
            [i.TerrainType.Rock1, r.Rock],
            [i.TerrainType.Rock2, r.Rock],
            [i.TerrainType.Water, r.Water],
            [i.TerrainType.Shore, r.Beach],
            [i.TerrainType.Pavement, r.Road],
            [i.TerrainType.Dirt, r.Road],
            [i.TerrainType.Rough, r.Rough],
            [i.TerrainType.Cliff, r.Cliff],
          ])));
      },
    }
  );
});
