// === OpenYRWeb: 移动并居中视野执行器 (MoveCameraExecutor) ===
// 动作 48 (MoveAndCenterView): 将玩家视野平滑移动到指定路点。
// 参考临时源码（werhd.min.js @2653200）：moveCameraToWaypoint 平滑插值（smoothstep）。
// 实现方式：设置 game.pendingCameraMove，GUI 层（GameScreen）轮询消费并驱动相机动画。
// 路点参数在 params[6]（AZ 编码，readActions 已转成编号），速度参数在 params[1]。
// deps: ["game/trigger/TriggerExecutor"]
// Note: variable/type names are minified approximations of the original TypeScript.

System.register("game/trigger/executor/MoveCameraExecutor", ["game/trigger/TriggerExecutor"], function (e, t) {
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
          var wp = Number(this.action.params[6]);
          if (!e.map.getTileAtWaypoint(wp)) {
            console.warn(`MoveAndCenterView has invalid waypoint ${wp} (${this.getDebugName()}).`);
            return;
          }
          e.pendingCameraMove = { waypoint: wp, speed: Number(this.action.params[1]) || 1 };
          console.debug(`[OpenYRWeb] MoveAndCenterView: pan to waypoint ${wp} (${this.getDebugName()}).`);
        }
      }),
        e("MoveCameraExecutor", r));
    },
  };
});
