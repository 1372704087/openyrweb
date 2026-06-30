// === Reconstructed SystemJS module: gui/screen/game/component/hud/SidebarRadarAnimRunner ===
// deps: ["data/IniSection","engine/Animation","engine/AnimProps","engine/Engine","util/BoxedVar"]
// Note: variable/type names are minified approximations of the original TypeScript.

System.register(
  "gui/screen/game/component/hud/SidebarRadarAnimRunner",
  ["data/IniSection", "engine/Animation", "engine/AnimProps", "engine/Engine", "util/BoxedVar"],
  function (t, e) {
    "use strict";
    var i, r, s, a, n, o, l;
    e && e.id;
    return {
      setters: [
        function (e) {
          i = e;
        },
        function (e) {
          r = e;
        },
        function (e) {
          s = e;
        },
        function (e) {
          a = e;
        },
        function (e) {
          n = e;
        },
      ],
      execute: function () {
        var e;
        (((e = o || t("AnimationType", (o = {})))[(e.None = 0)] = "None"),
          (e[(e.RadarOff = 1)] = "RadarOff"),
          (e[(e.RadarOn = 2)] = "RadarOn"),
          t(
            "SidebarRadarAnimationRunner",
            (l = class {
              constructor(e) {
                ((this.shpFile = e), (this.closed = !0), (this.currentAnimationType = o.None));
              }
              radarOff(e = !1) {
                ((this.currentAnimationType = o.RadarOff), e || this.initAnimation());
              }
              radarOn(e = !1) {
                ((this.currentAnimationType = o.RadarOn), e || this.initAnimation());
              }
              initAnimation() {
                var e = new i.IniSection(""),
                  e = new s.AnimProps(e, this.shpFile),
                  e = new r.Animation(e, new n.BoxedVar(a.Engine.UI_ANIM_SPEED));
                this.animation = e;
              }
              tick(e) {
                let t = this.animation;
                var i = this.currentAnimationType;
                if (t && i !== o.None) {
                  switch (t.getState()) {
                    case r.AnimationState.STOPPED:
                      break;
                    case r.AnimationState.NOT_STARTED:
                      t.start(e);
                    case r.AnimationState.RUNNING:
                    default:
                      t.update(e);
                  }
                  t.getState() === r.AnimationState.STOPPED &&
                    ((this.closed = i === o.RadarOff), (this.currentAnimationType = o.None));
                }
              }
              shouldUpdate() {
                return !0;
              }
              isStopped() {
                return this.currentAnimationType === o.None;
              }
              getCurrentFrame() {
                if (!this.animation) return this.currentAnimationType === o.RadarOn ? this.shpFile.numImages - 1 : 0;
                let e = this.currentAnimationType === o.RadarOff ? -1 : 1;
                this.currentAnimationType === o.None && this.closed && (e *= -1);
                let t = 0;
                return (-1 === e && (t = this.animation.props.end), t + e * this.animation.getCurrentFrame());
              }
            }),
          ));
      },
    };
  },
);
