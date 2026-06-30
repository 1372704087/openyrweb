// === Reconstructed SystemJS module: engine/Animation ===
// deps: ["util/math"]
// Note: variable/type names are minified approximations of the original TypeScript.

System.register("engine/Animation", ["util/math"], function (t, e) {
  "use strict";
  var r, s, i;
  e && e.id;
  return {
    setters: [
      function (e) {
        r = e;
      },
    ],
    execute: function () {
      var e;
      (((e = s || t("AnimationState", (s = {})))[(e.NOT_STARTED = 0)] = "NOT_STARTED"),
        (e[(e.RUNNING = 1)] = "RUNNING"),
        (e[(e.STOPPED = 2)] = "STOPPED"),
        (e[(e.DELAYED = 3)] = "DELAYED"),
        (e[(e.PAUSED = 4)] = "PAUSED"),
        t(
          "Animation",
          (i = class {
            constructor(e, t) {
              ((this.props = e),
                (this.state = s.NOT_STARTED),
                (this.endLoopFlag = !1),
                (this.playToEndFlag = !1),
                (this.speed = t));
            }
            getState() {
              return this.state;
            }
            start(e, t = 0) {
              ((this.time = e),
                (this.frameNo = this.props.reverse ? this.props.end : this.props.start),
                (this.loopNo = 0),
                (this.delayFrames = t),
                (this.state = t ? s.DELAYED : s.RUNNING));
            }
            pause() {
              this.state === s.RUNNING && (this.state = s.PAUSED);
            }
            unpause() {
              this.state === s.PAUSED && (this.state = s.RUNNING);
            }
            reset() {
              this.state = s.NOT_STARTED;
            }
            stop() {
              this.state = s.STOPPED;
            }
            update(e) {
              var t = (e - this.time) / 1e3,
                i = this.props.rate * this.speed.value,
                i = Math.floor(t * i);
              if (!(i < 1) && ((this.time = e), this.state !== s.PAUSED)) {
                if (0 < this.delayFrames) {
                  if (((this.delayFrames = Math.max(0, this.delayFrames - i)), 0 < this.delayFrames))
                    return void (this.state = s.DELAYED);
                  this.state = s.RUNNING;
                }
                this.computeNextFrame(i) && (this.state = s.STOPPED);
              }
            }
            endLoop() {
              this.endLoopFlag = !0;
            }
            endLoopAndPlayToEnd() {
              ((this.endLoopFlag = !0), (this.playToEndFlag = !0));
            }
            rewind() {
              this.props.reverse
                ? (this.frameNo = this.loopNo ? this.props.loopEnd : this.props.end)
                : (this.frameNo = this.loopNo ? this.props.loopStart : this.props.start);
            }
            getCurrentFrame() {
              return this.frameNo;
            }
            computeNextFrame(e) {
              let t = this.frameNo;
              for (; 0 < e;) {
                var i =
                  this.endLoopFlag && this.playToEndFlag
                    ? this.props.reverse
                      ? this.props.start
                      : this.props.end
                    : this.props.reverse
                      ? this.props.loopStart
                      : this.props.loopEnd;
                if ((!this.props.reverse && t + e <= i) || (this.props.reverse && t - e >= i)) {
                  t += this.props.reverse ? -e : e;
                  break;
                }
                if (-1 !== this.props.loopCount && this.loopNo >= this.props.loopCount - 1)
                  return ((this.frameNo = i), !0);
                if (this.endLoopFlag) return !(this.endLoopFlag = !1);
                ((e -= 1 + (this.props.reverse ? t - i : i - t)),
                  (t = this.props.reverse ? this.props.loopEnd : this.props.loopStart),
                  this.loopNo++,
                  this.props.randomLoopDelay &&
                    ((this.state = s.DELAYED),
                    (this.delayFrames = r.getRandomInt(this.props.randomLoopDelay[0], this.props.randomLoopDelay[1]))));
              }
              return ((this.frameNo = t), !1);
            }
          }),
        ));
    },
  };
});
