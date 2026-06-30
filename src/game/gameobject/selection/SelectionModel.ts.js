// === Reconstructed SystemJS module: game/gameobject/selection/SelectionModel ===
// deps: ["game/gameobject/selection/SelectionLevel"]
// Note: variable/type names are minified approximations of the original TypeScript.

System.register(
  "game/gameobject/selection/SelectionModel",
  ["game/gameobject/selection/SelectionLevel"],
  function (e, t) {
    "use strict";
    var i, r;
    t && t.id;
    return {
      setters: [
        function (e) {
          i = e;
        },
      ],
      execute: function () {
        e(
          "SelectionModel",
          (r = class {
            constructor(e) {
              ((this.selectionLevel = i.SelectionLevel.None),
                e.isBuilding() && e.rules.wall
                  ? (this.maxSelectionLevel = i.SelectionLevel.None)
                  : (this.maxSelectionLevel = e.rules.selectable
                      ? i.SelectionLevel.Selected | i.SelectionLevel.Hover
                      : i.SelectionLevel.Hover));
            }
            getSelectionLevel() {
              return this.selectionLevel;
            }
            setSelectionLevel(e) {
              this.selectionLevel = Math.min(this.maxSelectionLevel, e);
            }
            setHover(e) {
              this.setSelectionLevel(
                e ? this.selectionLevel | i.SelectionLevel.Hover : this.selectionLevel & ~i.SelectionLevel.Hover,
              );
            }
            setSelected(e) {
              this.setSelectionLevel(
                e ? this.selectionLevel | i.SelectionLevel.Selected : this.selectionLevel & ~i.SelectionLevel.Selected,
              );
            }
            isHovered() {
              return Boolean(this.selectionLevel & i.SelectionLevel.Hover);
            }
            isSelected() {
              return this.selectionLevel >= i.SelectionLevel.Selected;
            }
            getControlGroupNumber() {
              return this.controlGroupNumber;
            }
            setControlGroupNumber(e) {
              this.controlGroupNumber = e;
            }
          }),
        );
      },
    };
  },
);
