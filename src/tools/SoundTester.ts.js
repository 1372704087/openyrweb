// === Reconstructed SystemJS module: tools/SoundTester ===
// deps: ["util/disposable/CompositeDisposable","data/AudioBagFile","data/IdxFile","engine/Engine"]
// Note: variable/type names are minified approximations of the original TypeScript.

System.register(
  "tools/SoundTester",
  ["util/disposable/CompositeDisposable", "data/AudioBagFile", "data/IdxFile", "engine/Engine"],
  function (e, t) {
    "use strict";
    var i, s, a, n, r;
    t && t.id;
    return {
      setters: [
        function (e) {
          i = e;
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
        (e(
          "SoundTester",
          (r = class r {
            static async main(e, t) {
              ((this.sounds = n.Engine.getSounds()), (this.audioBag = new s.AudioBagFile()));
              var i = e.openFile("audio.bag"),
                r = e.openFile("audio.idx");
              (this.audioBag.fromVirtualFile(i, new a.IdxFile(r.stream)),
                e.addArchive(this.audioBag, "audio.bag"),
                this.buildBrowser());
            }
            static selectSound(e) {
              let i = new AudioContext(),
                r = i.createGain();
              r.gain.value = 0.5;
              var t = new Uint8Array(this.sounds.get(e).getData()).buffer;
              i.decodeAudioData(
                t,
                (e) => {
                  let t = i.createBufferSource();
                  ((t.buffer = e), t.connect(r).connect(i.destination), t.start(0));
                },
                (e) => console.log(e),
              );
            }
            static buildBrowser() {
              let i = (this.listEl = document.createElement("div"));
              ((i.style.position = "absolute"),
                (i.style.right = "0"),
                (i.style.top = "0"),
                (i.style.height = "600px"),
                (i.style.width = "200px"),
                (i.style.overflowY = "auto"),
                (i.style.padding = "5px"),
                (i.style.background = "rgba(255, 255, 255, 0.5)"),
                (i.style.border = "1px black solid"),
                i.appendChild(document.createTextNode("Sound files:")));
              let e = this.audioBag.getFileList();
              (e.forEach((e) => {
                let t = document.createElement("a");
                ((t.style.display = "block"),
                  (t.textContent = e),
                  t.setAttribute("href", "javascript:;"),
                  t.addEventListener("click", () => {
                    r.selectSound(e);
                  }),
                  i.appendChild(t));
              }),
                document.body.appendChild(i));
            }
            static destroy() {
              (this.listEl.remove(), this.disposables.dispose());
            }
          }),
        ),
          (r.disposables = new i.CompositeDisposable()));
      },
    };
  },
);
