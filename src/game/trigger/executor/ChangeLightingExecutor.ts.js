// === OpenYRWeb: 更改照明状态动作 (ChangeLightingExecutor) ===
// 动作 52: ChangeLighting — 切换地图环境光照（params[1]=0 变暗 / 1 恢复）。
// 通过 MapLightingTrait.setTargetAmbientIntensity 平滑过渡。
// deps: ["game/trigger/TriggerExecutor"]
// Note: variable/type names are minified approximations of the original TypeScript.

System.register("game/trigger/executor/ChangeLightingExecutor", ["game/trigger/TriggerExecutor"], function (e, t) {
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
      ((r = class extends i.TriggerExecutor {
        execute(e) {
          var on = 0 !== Number(this.action.params[1]);
          e.mapLightingTrait.setTargetAmbientIntensity(on ? 1 : 0.35);
          console.warn(`[OpenYRWeb] ChangeLighting: ${on ? "on" : "off"}`);
        }
      }),
        e("ChangeLightingExecutor", r));
    },
  };
});
