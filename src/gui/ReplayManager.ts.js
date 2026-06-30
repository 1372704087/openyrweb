// === Reconstructed SystemJS module: gui/ReplayManager ===
// deps: ["network/gamestate/Replay","gui/replay/ReplayExistsError"]
// Note: variable/type names are minified approximations of the original TypeScript.

System.register("gui/ReplayManager", ["network/gamestate/Replay", "gui/replay/ReplayExistsError"], function (e, t) {
  "use strict";
  var o, l, i;
  t && t.id;
  return {
    setters: [
      function (e) {
        o = e;
      },
      function (e) {
        l = e;
      },
    ],
    execute: function () {
      e(
        "ReplayManager",
        (i = class {
          constructor(e) {
            this.storage = e;
          }
          async loadList(e = !1) {
            return await this.storage.getManifest(e);
          }
          async loadSerializedReplay(e) {
            return await this.storage.getReplayData(e);
          }
          async loadReplay(e) {
            let t = await this.loadSerializedReplay(e),
              i = new o.Replay();
            return (i.unserialize("string" == typeof t ? t : await t.text(), e), i);
          }
          async saveReplay(e, t = !1) {
            var i = e.name;
            if (!i) throw new Error("Replay is not initialized");
            var r = THREE.Math.generateUUID(),
              s = e.serialize();
            let a = { id: r, name: i, keep: t, timestamp: e.timestamp },
              n = 1;
            for (; await this.storage.hasReplayData(a);)
              (1 < n && (a.name = a.name.replace(/ \(\d+\)$/, "")), (a.name += ` (${++n})`));
            let o = await this.loadList(),
              l = o.filter((e) => !e.keep);
            if (50 < l.length)
              for (var c of l.slice(50)) (await this.storage.deleteReplayData(c), o.splice(o.indexOf(c), 1));
            return (o.unshift(a), await this.storage.saveReplayData(a, s), await this.storage.saveManifest(o), r);
          }
          async keepReplay(t, i) {
            let r = await this.loadList();
            var s = r.find((e) => e.id === t);
            if (s) {
              var a = { ...s, name: o.Replay.sanitizeFileName(i), keep: !0 };
              if (await this.storage.hasReplayData(a))
                throw new l.ReplayExistsError(`A replay with name "${a.name}" already exists`);
              let e = await this.storage.getReplayData(s);
              var n = "string" == typeof e ? e : await e.text();
              (await this.storage.deleteReplayData(s),
                await this.storage.saveReplayData(a, n),
                Object.assign(s, a),
                await this.storage.saveManifest(r));
            }
          }
          async deleteReplay(t) {
            await this.storage.deleteReplayData(t);
            let e = await this.loadList();
            var i = e.findIndex((e) => e.id === t.id);
            -1 !== i && (e.splice(i, 1), await this.storage.saveManifest(e));
          }
          async importReplay(a) {
            return new Promise((r, s) => {
              let e = new FileReader();
              ((e.onload = async (t) => {
                try {
                  var i = a.name.replace(o.Replay.extension, "");
                  let e = new o.Replay();
                  (e.unserialize(t.target.result, { name: i, timestamp: a.lastModified }),
                    await this.saveReplay(e, !0),
                    r(e));
                } catch (e) {
                  s(e);
                }
              }),
                (e.onerror = () => {
                  s(e.error);
                }),
                e.readAsText(a, "utf-8"));
            });
          }
        }),
      );
    },
  };
});
