// === Reconstructed SystemJS module: game/gameobject/selection/SelectionLevel ===
// deps: []
// Note: variable/type names are minified approximations of the original TypeScript.

System.register("game/gameobject/selection/SelectionLevel", [], function (t, e) {
  "use strict";
  var i;
  e && e.id;
  return {
    setters: [],
    execute: function () {
      var e;
      (((e = i || t("SelectionLevel", (i = {})))[(e.None = 0)] = "None"),
        (e[(e.Hover = 1)] = "Hover"),
        (e[(e.Selected = 2)] = "Selected"),
        (e[(e.SelectedHover = 3)] = "SelectedHover"));
    },
  };
});
