// === Reconstructed SystemJS module: gui/screen/mainMenu/component/MenuSlotAnimationRunner ===
// deps: ["data/IniSection","data/ShpFile","engine/Animation","engine/AnimProps","engine/Engine","util/BoxedVar"]
// Note: variable/type names are minified approximations of the original TypeScript.

System.register(
  "gui/screen/mainMenu/component/MenuSlotAnimationRunner",
  ["data/IniSection", "data/ShpFile", "engine/Animation", "engine/AnimProps", "engine/Engine", "util/BoxedVar"],
  function (t, e) {
    "use strict";
    var i, r, s, a, n, o, l, c, h;
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
        function (e) {
          o = e;
        },
      ],
      execute: function () {
        var e;
        (((e = l || t("AnimationType", (l = {})))[(e.None = 0)] = "None"),
          (e[(e.SlideIn = 1)] = "SlideIn"),
          (e[(e.SlideOut = 2)] = "SlideOut"),
          ((e = c || t("MenuButtonState", (c = {})))[(e.Hidden = 0)] = "Hidden"),
          (e[(e.Unlit = 1)] = "Unlit"),
          (e[(e.Normal = 2)] = "Normal"),
          (e[(e.Active = 3)] = "Active"),
          (e[(e.Flashing = 4)] = "Flashing"),
          t(
            "MenuSlotAnimationRunner",
            (h = class {
              constructor(e = 0) {
                ((this.delayFrames = e),
                  (this.buttonState = c.Hidden),
                  (this.collapsed = !0),
                  (this.currentAnimationType = l.None),
                  (this.flashingFrame = 2));
              }
              slideIn() {
                ((this.currentAnimationType = l.SlideIn), this.initAnimation());
              }
              slideOut() {
                ((this.currentAnimationType = l.SlideOut), this.initAnimation());
              }
              initAnimation() {
                var e = new i.IniSection("");
                let t = new a.AnimProps(e, new r.ShpFile());
                t.loopEnd = 5;
                e = new s.Animation(t, new o.BoxedVar(n.Engine.UI_ANIM_SPEED));
                this.animation = e;
              }
              tick(e) {
                let t = this.animation;
                var i = this.currentAnimationType;
                if (
                  (this.buttonState === c.Flashing && (this.flashingFrame = Math.floor(e / 500) % 2 == 0 ? 2 : 4),
                  t && i !== l.None)
                ) {
                  switch (t.getState()) {
                    case s.AnimationState.STOPPED:
                      break;
                    case s.AnimationState.NOT_STARTED:
                      t.start(e, this.delayFrames);
                    case s.AnimationState.RUNNING:
                    default:
                      t.update(e);
                  }
                  t.getState() === s.AnimationState.STOPPED &&
                    ((this.collapsed = i === l.SlideOut), (this.currentAnimationType = l.None));
                }
              }
              shouldUpdate() {
                return !0;
              }
              isStopped() {
                return this.currentAnimationType === l.None;
              }
              getCurrentFrame() {
                if (this.currentAnimationType !== l.None && this.animation.getState() !== s.AnimationState.DELAYED) {
                  var t = this.currentAnimationType === l.SlideIn ? -1 : 1;
                  let e = this.buttonState !== c.Hidden ? 5 : 11;
                  return (-1 == t && (e += 5), e + t * this.animation.getCurrentFrame());
                }
                let e;
                if (this.collapsed) e = this.buttonState === c.Hidden ? 16 : 10;
                else if (this.buttonState === c.Hidden) e = 0;
                else if (this.buttonState === c.Unlit) e = 1;
                else if (this.buttonState === c.Normal) e = 2;
                else if (this.buttonState === c.Active) e = 4;
                else {
                  if (this.buttonState !== c.Flashing) throw new Error(`Unknown buttonState "${this.buttonState}"`);
                  e = this.flashingFrame;
                }
                return e;
              }
            }),
          ));
      },
    };
  },
);
