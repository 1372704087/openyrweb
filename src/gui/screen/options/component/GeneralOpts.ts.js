// === Reconstructed SystemJS module: gui/screen/options/component/GeneralOpts ===
// deps: ["react","gui/component/Slider","gui/screen/options/GeneralOptions","gui/component/Select","gui/component/Option","engine/renderable/entity/unit/FlyerHelperMode","engine/renderable/entity/unit/ModelQuality","engine/renderable/entity/unit/ShadowQuality","gui/component/Image","gui/screen/options/component/Resolution"]
// Note: variable/type names are minified approximations of the original TypeScript.

System.register(
  "gui/screen/options/component/GeneralOpts",
  [
    "react",
    "gui/component/Slider",
    "gui/screen/options/GeneralOptions",
    "gui/component/Select",
    "gui/component/Option",
    "engine/renderable/entity/unit/FlyerHelperMode",
    "engine/renderable/entity/unit/ModelQuality",
    "engine/renderable/entity/unit/ShadowQuality",
    "gui/component/Image",
    "gui/screen/options/component/Resolution",
  ],
  function (e, t) {
    "use strict";
    var s, a, n, o, l, c, h, u, d, g, p;
    t && t.id;
    return {
      setters: [
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
        function (e) {
          d = e;
        },
        function (e) {
          g = e;
        },
      ],
      execute: function () {
        ((p = new Map([
          [1, "TXT_SLOWEST"],
          [2, "TXT_SLOWER"],
          [3, "TXT_SLOW"],
          [4, "TXT_MEDIUM"],
          [5, "TXT_FAST"],
          [6, "TXT_FASTER"],
          [7, "TXT_FASTEST"],
        ])),
          e("GeneralOpts", ({ strings: t, options: i, fullScreen: e, inGame: r }) =>
            s.createElement(
              "div",
              { className: "opts general-opts" },
              s.createElement(
                "fieldset",
                null,
                s.createElement("legend", null, t.get("TS:GameplayOpts")),
                s.createElement(
                  "div",
                  { className: "slider-item" },
                  s.createElement("span", { className: "label" }, t.get("GUI:ScrollRate")),
                  s.createElement(a.Slider, {
                    min: 1,
                    max: 7,
                    value: "" + Math.floor(i.scrollRate.value / n.SCROLL_BASE_FACTOR),
                    getLabel: (e) => t.get(p.get(Number(e))),
                    onChange: (e) => (i.scrollRate.value = Number(e.target.value) * n.SCROLL_BASE_FACTOR),
                  }),
                ),
                s.createElement(
                  "div",
                  { className: "item", "data-r-tooltip": t.get("STT:MouseAccel") },
                  s.createElement(
                    "label",
                    null,
                    s.createElement("span", { className: "label" }, t.get("TS:MouseAccel")),
                    s.createElement(
                      o.Select,
                      {
                        initialValue: "" + Number(i.mouseAcceleration.value),
                        onSelect: (e) => (i.mouseAcceleration.value = Boolean(Number(e))),
                      },
                      s.createElement(l.Option, { value: "1", label: t.get("TXT_ON") }),
                      s.createElement(l.Option, { value: "0", label: t.get("TXT_OFF") }),
                    ),
                    s.createElement(
                      "span",
                      { className: "info", title: t.get("TS:MouseAccelHint") },
                      s.createElement(d.Image, { src: "info.png" }),
                    ),
                  ),
                ),
                s.createElement(
                  "div",
                  { className: "item", "data-r-tooltip": t.get("STT:AttackMoveButton") },
                  s.createElement(
                    "label",
                    null,
                    s.createElement("span", { className: "label" }, t.get("TS:AttackMoveButton")),
                    s.createElement(
                      o.Select,
                      {
                        initialValue: "" + Number(i.rightClickMove.value),
                        onSelect: (e) => (i.rightClickMove.value = Boolean(Number(e))),
                      },
                      s.createElement(l.Option, { value: "0", label: t.get("TS:AttackMoveButtonLeft") }),
                      s.createElement(l.Option, { value: "1", label: t.get("TS:AttackMoveButtonRight") }),
                    ),
                  ),
                ),
                s.createElement(
                  "div",
                  { className: "item", "data-r-tooltip": t.get("STT:RightClickScroll") },
                  s.createElement(
                    "label",
                    null,
                    s.createElement("span", { className: "label" }, t.get("TS:RightClickScroll")),
                    s.createElement(
                      o.Select,
                      {
                        initialValue: "" + Number(i.rightClickScroll.value),
                        onSelect: (e) => (i.rightClickScroll.value = Boolean(Number(e))),
                      },
                      s.createElement(l.Option, { value: "1", label: t.get("TXT_ON") }),
                      s.createElement(l.Option, { value: "0", label: t.get("TXT_OFF") }),
                    ),
                  ),
                ),
                s.createElement(
                  "div",
                  { className: "item", "data-r-tooltip": t.get("STT:FlyerLabel") },
                  s.createElement("span", { className: "label" }, t.get("TS:FlyerLabel")),
                  s.createElement(
                    o.Select,
                    { initialValue: "" + i.flyerHelper.value, onSelect: (e) => (i.flyerHelper.value = Number(e)) },
                    s.createElement(l.Option, { value: "" + c.FlyerHelperMode.Always, label: t.get("TS:FlyerAlways") }),
                    s.createElement(l.Option, {
                      value: "" + c.FlyerHelperMode.Selected,
                      label: t.get("TS:FlyerSelected"),
                    }),
                    s.createElement(l.Option, { value: "" + c.FlyerHelperMode.Never, label: t.get("TS:FlyerNever") }),
                  ),
                ),
                s.createElement(
                  "div",
                  { className: "item", "data-r-tooltip": t.get("STT:IGGameOptCBoxHidden") },
                  s.createElement(
                    "label",
                    null,
                    s.createElement("span", { className: "label" }, t.get("GUI:ShowHidden")),
                    s.createElement("input", {
                      type: "checkbox",
                      defaultChecked: i.hiddenObjects.value,
                      onChange: (e) => (i.hiddenObjects.value = e.target.checked),
                    }),
                  ),
                ),
                s.createElement(
                  "div",
                  { className: "item", "data-r-tooltip": t.get("STT:IGGameOptCBoxTargetLines") },
                  s.createElement(
                    "label",
                    null,
                    s.createElement("span", { className: "label" }, t.get("GUI:TargetLines")),
                    s.createElement("input", {
                      type: "checkbox",
                      defaultChecked: i.targetLines.value,
                      onChange: (e) => (i.targetLines.value = e.target.checked),
                    }),
                  ),
                ),
              ),
              s.createElement(
                "fieldset",
                null,
                s.createElement("legend", null, t.get("TS:GfxOpts")),
                s.createElement(
                  "div",
                  { className: "item" },
                  s.createElement("span", { className: "label" }, t.get("TS:Resolution")),
                  s.createElement(g.ResolutionSelect, { resolution: i.graphics.resolution, fullScreen: e, strings: t }),
                  s.createElement(
                    "span",
                    { className: "info", title: t.get("TS:ResolutionHint") },
                    s.createElement(d.Image, { src: "info.png" }),
                  ),
                ),
                s.createElement(
                  "div",
                  { className: "item", "data-r-tooltip": t.get("STT:GfxModels") },
                  s.createElement("span", { className: "label" }, t.get("TS:GfxModels")),
                  s.createElement(
                    o.Select,
                    {
                      disabled: r,
                      initialValue: "" + i.graphics.models.value,
                      onSelect: (e) => (i.graphics.models.value = Number(e)),
                    },
                    s.createElement(l.Option, { value: "" + h.ModelQuality.High, label: t.get("TS:GfxQualityHigh") }),
                    s.createElement(l.Option, { value: "" + h.ModelQuality.Low, label: t.get("TS:GfxQualityLow") }),
                  ),
                ),
                s.createElement(
                  "div",
                  { className: "item", "data-r-tooltip": t.get("STT:GfxShadows") },
                  s.createElement("span", { className: "label" }, t.get("TS:GfxShadows")),
                  s.createElement(
                    o.Select,
                    {
                      initialValue: "" + i.graphics.shadows.value,
                      onSelect: (e) => (i.graphics.shadows.value = Number(e)),
                    },
                    s.createElement(l.Option, { value: "" + u.ShadowQuality.High, label: t.get("TS:GfxQualityHigh") }),
                    s.createElement(l.Option, { value: "" + u.ShadowQuality.Medium, label: t.get("TS:GfxQualityMed") }),
                    s.createElement(l.Option, { value: "" + u.ShadowQuality.Low, label: t.get("TS:GfxQualityLow") }),
                    s.createElement(l.Option, { value: "" + u.ShadowQuality.Off, label: t.get("TS:GfxQualityOff") }),
                  ),
                ),
              ),
            ),
          ));
      },
    };
  },
);
