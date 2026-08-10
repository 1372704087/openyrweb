// === OpenYRWeb: 科技建筑被占领条件 (TechBuildingCapturedCondition) ===
// 事件 24: TechBuildingCaptured — 当 Capturable=yes 的科技建筑被占领时触发。
// 参数: params[1] = 占领方阵营 ID（0 表示任意阵营占领都触发）。
// 实现: 监听 BuildingCaptureEvent（SecureProgressTrait/CaptureBuildingTask 派发，
// 派发时 target.owner 已是新占领方），并按规则 Capturable 标志过滤。
// deps: ["game/event/EventType","game/trigger/TriggerCondition"]
// Note: variable/type names are minified approximations of the original TypeScript.

System.register(
  "game/trigger/condition/TechBuildingCapturedCondition",
  ["game/event/EventType", "game/trigger/TriggerCondition"],
  function (e, t) {
    "use strict";
    var i, r, s;
    t && t.id;
    return {
      setters: [
        function (e) {
          i = e;
        },
        function (e) {
          r = e;
        },
      ],
      execute: function () {
        ((s = class extends r.TriggerCondition {
          constructor(e, t) {
            (super(e, t), (this.houseId = Number(this.event.params[1] || 0)));
          }
          check(e, t) {
            return t
              .filter((e) => {
                if (e.type !== i.EventType.BuildingCapture) return !1;
                let t = e.target;
                return (
                  !!t &&
                  t.rules.capturable &&
                  !t.isDestroyed &&
                  (0 === this.houseId || t.owner?.country?.id === this.houseId)
                );
              })
              .map((e) => e.target);
          }
        }),
          e("TechBuildingCapturedCondition", s));
      },
    };
  },
);
