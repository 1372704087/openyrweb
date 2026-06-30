// === Reconstructed SystemJS module: worker/workerHost ===
// deps: ["threads"]
// Note: variable/type names are minified approximations of the original TypeScript.

System.register("worker/workerHost", ["threads"], function (e, t) {
  "use strict";
  var i, r, s;
  t && t.id;
  return {
    setters: [
      function (e) {
        i = e;
      },
    ],
    execute: function () {
      ((s = class {
        constructor(e) {
          this.workerLib = e;
        }
        async decodeWav(e) {
          return this.workerLib.decodeWav(e);
        }
        async generateVxlGeometry(e, t) {
          return this.workerLib.generateVxlGeometry(e.toPlain(), t);
        }
        async compressFile(e, t) {
          return this.workerLib.compressFile(e, t);
        }
      }),
        e("workerHostApi", {
          concurrency: (navigator.hardwareConcurrency || 4) - 1,
          warmUpPool() {
            return (r = r ?? i.Pool(() => i.spawn(new i.Worker("./dist/worker.min.js?v=0.1.0")), this.concurrency));
          },
          queueTask(t) {
            (this.warmUpPool(), r.queue((e) => t(new s(e))));
          },
          async waitForTasks() {
            await r?.completed();
          },
          async dispose() {
            r && (await r.terminate(), (r = void 0));
          },
        }));
    },
  };
});
