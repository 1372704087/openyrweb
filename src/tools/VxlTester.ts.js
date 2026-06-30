// === Reconstructed SystemJS module: tools/VxlTester ===
// deps: ["data/Palette","data/VxlFile","engine/gfx/Renderer","engine/renderable/WorldScene","engine/renderable/builder/VxlNonBatchedBuilder","engine/UiAnimationLoop","gui/PointerEvents","util/disposable/CompositeDisposable","tools/CameraZoomControls","util/BoxedVar","engine/renderable/builder/vxlGeometry/VxlGeometryPool","engine/gfx/geometry/VxlGeometryCache","engine/renderable/entity/unit/ShadowQuality","gui/CanvasMetrics"]
// Note: variable/type names are minified approximations of the original TypeScript.

System.register(
  "tools/VxlTester",
  [
    "data/Palette",
    "data/VxlFile",
    "engine/gfx/Renderer",
    "engine/renderable/WorldScene",
    "engine/renderable/builder/VxlNonBatchedBuilder",
    "engine/UiAnimationLoop",
    "gui/PointerEvents",
    "util/disposable/CompositeDisposable",
    "tools/CameraZoomControls",
    "util/BoxedVar",
    "engine/renderable/builder/vxlGeometry/VxlGeometryPool",
    "engine/gfx/geometry/VxlGeometryCache",
    "engine/renderable/entity/unit/ShadowQuality",
    "gui/CanvasMetrics",
  ],
  function (e, t) {
    "use strict";
    var l, s, c, h, a, u, d, i, g, p, m, f, y, T, r, n, o;
    t && t.id;
    return {
      setters: [
        function (e) {
          l = e;
        },
        function (e) {
          s = e;
        },
        function (e) {
          c = e;
        },
        function (e) {
          h = e;
        },
        function (e) {
          a = e;
        },
        function (e) {
          u = e;
        },
        function (e) {
          d = e;
        },
        function (e) {
          i = e;
        },
        function (e) {
          g = e;
        },
        function (e) {
          p = e;
        },
        function (e) {
          m = e;
        },
        function (e) {
          f = e;
        },
        function (e) {
          y = e;
        },
        function (e) {
          T = e;
        },
      ],
      execute: function () {
        ((r = [
          "1tnk.vxl",
          "1tnkbarl.vxl",
          "1tnktur.vxl",
          "2tnk.vxl",
          "2tnkbarl.vxl",
          "2tnktur.vxl",
          "3tnk.vxl",
          "3tnkbarl.vxl",
          "3tnktur.vxl",
          "4tnk.vxl",
          "4tnkbarl.vxl",
          "4tnktur.vxl",
          "aegis.vxl",
          "apache.vxl",
          "apc.vxl",
          "apcw.vxl",
          "art2.vxl",
          "art2barl.vxl",
          "art2tur.vxl",
          "arty.vxl",
          "artybarl.vxl",
          "asw.vxl",
          "axle.vxl",
          "bana.vxl",
          "beag.vxl",
          "bggy.vxl",
          "bike.vxl",
          "bus.vxl",
          "car.vxl",
          "cargocar.vxl",
          "carrier.vxl",
          "cdest.vxl",
          "cdestwo.vxl",
          "cmin.vxl",
          "cmon.vxl",
          "cona.vxl",
          "cop.vxl",
          "cplane.vxl",
          "cruise.vxl",
          "dest.vxl",
          "destwo.vxl",
          "dmisl.vxl",
          "dpod.vxl",
          "dred.vxl",
          "dredwo.vxl",
          "dshp.vxl",
          "euroc.vxl",
          "falc.vxl",
          "flak.vxl",
          "flaktur.vxl",
          "flata.vxl",
          "fortress.vxl",
          "ftnk.vxl",
          "fv.vxl",
          "fvtur.vxl",
          "fvtur1.vxl",
          "fvtur10.vxl",
          "fvtur11.vxl",
          "fvtur12.vxl",
          "fvtur13.vxl",
          "fvtur14.vxl",
          "fvtur2.vxl",
          "fvtur3.vxl",
          "fvtur4.vxl",
          "fvtur5.vxl",
          "fvtur6.vxl",
          "fvtur7.vxl",
          "fvtur8.vxl",
          "fvtur9.vxl",
          "gastank.vxl",
          "gtgcanbarl.vxl",
          "gtgcantur.vxl",
          "gtnk.vxl",
          "gtnkbarl.vxl",
          "gtnktur.vxl",
          "harv.vxl",
          "harvtur.vxl",
          "heli.vxl",
          "hind.vxl",
          "hmec.vxl",
          "hornet.vxl",
          "horv.vxl",
          "htk.vxl",
          "htkbarl.vxl",
          "htktur.vxl",
          "htnk.vxl",
          "htnkbarl.vxl",
          "htnktur.vxl",
          "hvr.vxl",
          "hvrtur.vxl",
          "hwtz.vxl",
          "hyd.vxl",
          "icbm.vxl",
          "jeep.vxl",
          "jeeptur.vxl",
          "laser.vxl",
          "lcrf.vxl",
          "limo.vxl",
          "lpst.vxl",
          "ltnk.vxl",
          "ltnkbarl.vxl",
          "ltnktur.vxl",
          "m113.vxl",
          "m113tur.vxl",
          "mcv.vxl",
          "misl.vxl",
          "mislchem.vxl",
          "mislmlti.vxl",
          "mislorca.vxl",
          "mislsam.vxl",
          "mlrs.vxl",
          "mlrstur.vxl",
          "mmchbarl.vxl",
          "mnly.vxl",
          "monocar.vxl",
          "monoeng.vxl",
          "mrj.vxl",
          "mrjtur.vxl",
          "mtnk.vxl",
          "mtnkbarl.vxl",
          "mtnktur.vxl",
          "mtrb.vxl",
          "mtrs.vxl",
          "mtrt.vxl",
          "orca.vxl",
          "orcab.vxl",
          "orcatran.vxl",
          "outp.vxl",
          "pdplane.vxl",
          "phal.vxl",
          "pick.vxl",
          "piece.vxl",
          "probe.vxl",
          "propa.vxl",
          "ptruck.vxl",
          "pulscan.vxl",
          "repair.vxl",
          "rtnk.vxl",
          "rtnkbarl.vxl",
          "rtnktur.vxl",
          "sam.vxl",
          "sapc.vxl",
          "scrin.vxl",
          "shad.vxl",
          "smcv.vxl",
          "sonic.vxl",
          "sonictur.vxl",
          "sref.vxl",
          "sreftur.vxl",
          "sreftur1.vxl",
          "sreftur2.vxl",
          "sreftur3.vxl",
          "stang.vxl",
          "stnk.vxl",
          "sub.vxl",
          "subt.vxl",
          "subtank.vxl",
          "suvb.vxl",
          "suvw.vxl",
          "taxi.vxl",
          "tire.vxl",
          "tnkd.vxl",
          "tractor.vxl",
          "tran.vxl",
          "trnsport.vxl",
          "trs.vxl",
          "truck2.vxl",
          "trucka.vxl",
          "truckb.vxl",
          "truk.vxl",
          "ttnk.vxl",
          "ttnktur.vxl",
          "tug.vxl",
          "utnk.vxl",
          "v3.vxl",
          "v3rocket.vxl",
          "v3wo.vxl",
          "vlad.vxl",
          "vladwo.vxl",
          "weed.vxl",
          "wini.vxl",
          "wrmn.vxl",
          "zbomb.vxl",
          "zep.vxl",
        ]),
          (n = class {
            constructor(e, t, i, r, s) {
              ((this.builder = new a.VxlNonBatchedBuilder(e, t, i, r, s)), (this.wrapper = new THREE.Object3D()));
            }
            get3DObject() {
              return this.wrapper;
            }
            create3DObject() {
              var e = this.builder.build();
              this.wrapper.add(e);
            }
            update() {
              this.wrapper.rotation.y -= 0.01;
            }
            dispose() {
              this.builder.dispose();
            }
          }),
          e(
            "VxlTester",
            (o = class o {
              static async main(e, t) {
                let i = (this.renderer = new c.Renderer(800, 600));
                (i.init(document.body),
                  i.initStats(document.body),
                  (this.vfs = e),
                  (this.vxlGeometryPool = new m.VxlGeometryPool(new f.VxlGeometryCache())),
                  (this.palette = new l.Palette(e.openFile("unittem.pal"))));
                let r = (this.worldScene = h.WorldScene.factory(
                  { x: 0, y: 0, width: 800, height: 600 },
                  new p.BoxedVar(!0),
                  new p.BoxedVar(y.ShadowQuality.High),
                ));
                (this.disposables.add(r),
                  (r.scene.background = new THREE.Color(14737632)),
                  (r.camera.far += 1e3),
                  r.camera.updateProjectionMatrix());
                let s = new T.CanvasMetrics(i.getCanvas(), window);
                (s.init(), this.disposables.add(s));
                var a = new d.PointerEvents(i, { x: 0, y: 0 }, document, s);
                let n = new g.CameraZoomControls(a, r.cameraZoom);
                (this.disposables.add(n, a), n.init(), this.createFloor(), this.buildBrowser(), i.addScene(r));
                let o = (this.uiAnimationLoop = new u.UiAnimationLoop(i));
                o.start();
              }
              static createFloor() {
                var e = new THREE.PlaneGeometry(1e4, 1e4);
                let t = new THREE.ShadowMaterial();
                t.opacity = 0.5;
                let i = new THREE.Mesh(e, t);
                ((i.rotation.x = -Math.PI / 2),
                  (i.position.y = -100),
                  (i.receiveShadow = !0),
                  this.worldScene.scene.add(i));
              }
              static async selectVxl(e) {
                o.currentVxl && (o.worldScene.remove(o.currentVxl), o.currentVxl.dispose());
                var t = this.vfs.openFile(e),
                  i = new Date().getTime(),
                  r = new s.VxlFile(t),
                  t = new Date().getTime();
                console.log("Parsing took " + (t - i) + "ms");
                r = this.currentVxl = new n(r, void 0, this.palette, this.vxlGeometryPool, o.worldScene.camera);
                o.worldScene.add(r);
              }
              static buildBrowser() {
                let i = (this.listEl = document.createElement("div"));
                ((i.style.position = "absolute"),
                  (i.style.right = "0"),
                  (i.style.top = "0"),
                  (i.style.height = "600px"),
                  (i.style.width = "200px"),
                  (i.style.overflowY = "auto"),
                  i.appendChild(document.createTextNode("Vxl files:")),
                  r.forEach((e) => {
                    let t = document.createElement("a");
                    ((t.style.display = "block"),
                      (t.textContent = e),
                      t.setAttribute("href", "javascript:;"),
                      t.addEventListener("click", () => {
                        (console.log("Selected vxl", e), o.selectVxl(e));
                      }),
                      i.appendChild(t));
                  }),
                  document.body.appendChild(i),
                  setTimeout(() => {
                    o.selectVxl("zep.vxl");
                  }, 50));
              }
              static destroy() {
                (this.renderer.destroy(),
                  this.uiAnimationLoop.destroy(),
                  this.listEl.remove(),
                  this.disposables.dispose());
              }
            }),
          ),
          (o.disposables = new i.CompositeDisposable()));
      },
    };
  },
);
