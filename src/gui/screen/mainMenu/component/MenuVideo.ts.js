// === Reconstructed SystemJS module: gui/screen/mainMenu/component/MenuVideo ===
// deps: ["react","util/disposable/CompositeDisposable"]
// Note: variable/type names are minified approximations of the original TypeScript.

System.register(
  "gui/screen/mainMenu/component/MenuVideo",
  ["react", "util/disposable/CompositeDisposable"],
  function (e, t) {
    "use strict";
    var r, i, s, a;
    t && t.id;
    return {
      setters: [
        function (e) {
          r = e;
        },
        function (e) {
          i = e;
        },
      ],
      execute: function () {
        ((s = new Map([
          ["mp4", "video/mp4"],
          ["webm", "video/webm"],
        ])),
          (a = class extends r.default.Component {
            constructor() {
              (super(...arguments),
                (this.el = null),
                (this.disposables = new i.CompositeDisposable()),
                (this.disposed = !1));
            }
            render() {
              const e = this.props["src"];
              let t, i;
              return (
                "string" == typeof e
                  ? ((i = e), (t = s.get(e.split("?")[0].split(".").pop()) ?? "video/webm"))
                  : ((i = URL.createObjectURL(e)),
                    (t = e.type),
                    this.disposables.add(() => {
                      URL.revokeObjectURL(i);
                    })),
                r.default.createElement("div", {
                  className: "video-wrapper",
                  ref: (e) => (this.el = e),
                  dangerouslySetInnerHTML: {
                    __html: `
            <video style="outline: none;" loop playsinline muted autoplay>
                <source src="${i}" type="${t}" />
            </video>
            <div class="logo" style="opacity: 0;" />
        `,
                  },
                })
              );
            }
            componentDidMount() {
              const t = this.props["src"];
              let i = this.el.querySelector("video"),
                e = this.el.querySelector("div");
              if (t instanceof File && window.MediaSource) {
                let e = async () => {
                  this.applyMediaSourceFallback(i, await t.arrayBuffer());
                };
                (i.querySelector("source").addEventListener("error", e, { once: !0 }),
                  i.addEventListener("loadeddata", () => {
                    i.querySelector("source").removeEventListener("error", e);
                  }));
              }
              i.addEventListener("loadeddata", () => {
                e.style.opacity = "";
              });
            }
            async applyMediaSourceFallback(i, r) {
              if (!this.disposed) {
                let t = new MediaSource();
                t.addEventListener("sourceopen", () => {
                  try {
                    let e = t.addSourceBuffer('video/webm; codecs="vp8"');
                    ((e.mode = "sequence"),
                      e.appendBuffer(r),
                      (this.timeoutId = setTimeout(() => this.processNextSegment(e, i, r), 1e3)),
                      this.disposables.add(() => clearTimeout(this.timeoutId)));
                  } catch (e) {
                    return void ("NotSupportedError" !== e.name && console.error(e));
                  }
                });
                let e = (i.src = URL.createObjectURL(t));
                this.disposables.add(() => {
                  (URL.revokeObjectURL(e), (e = void 0));
                });
              }
            }
            processNextSegment(e, t, i) {
              try {
                !e.updating &&
                  0 < e.buffered.length &&
                  (e.buffered.end(e.buffered.length - 1) - t.currentTime < 10 && e.appendBuffer(i),
                  t.paused && t.play()?.catch((e) => console.error(e)));
              } catch (e) {
                return void console.error(e);
              }
              this.timeoutId = setTimeout(() => this.processNextSegment(e, t, i), 1e3);
            }
            componentWillUnmount() {
              (this.disposables.dispose(), (this.disposed = !0));
            }
          }),
          e("MenuVideo", a));
      },
    };
  },
);
