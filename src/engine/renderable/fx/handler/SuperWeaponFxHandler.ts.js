// === Reconstructed SystemJS module: engine/renderable/fx/handler/SuperWeaponFxHandler ===
// deps: ["game/event/EventType","util/disposable/CompositeDisposable","util/math","engine/gfx/lighting/LightningStormFx","game/GameSpeed","game/type/SuperWeaponType","game/Coords"]
// Note: variable/type names are minified approximations of the original TypeScript.

System.register(
  "engine/renderable/fx/handler/SuperWeaponFxHandler",
  [
    "game/event/EventType",
    "util/disposable/CompositeDisposable",
    "util/math",
    "engine/gfx/lighting/LightningStormFx",
    "game/GameSpeed",
    "game/type/SuperWeaponType",
    "game/Coords",
  ],
  function (e, t) {
    "use strict";
    var i, r, s, a, n, o, l, c;
    t && t.id;
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
        function (e) {
          l = e;
        },
      ],
      execute: function () {
        e(
          "SuperWeaponFxHandler",
          (c = class {
            constructor(e, t, i) {
              ((this.game = e),
                (this.renderableManager = t),
                (this.lightingDirector = i),
                (this.disposables = new r.CompositeDisposable()));
            }
            init() {
              this.disposables.add(
                this.game.events.subscribe(i.EventType.LightningStormCloud, (t) => {
                  var e = this.game.rules.audioVisual.weatherConClouds,
                    e = e[s.getRandomInt(0, e.length - 1)],
                    e = this.renderableManager.createTransientAnim(e, (e) => {
                      e.setPosition(t.position);
                    });
                  this.lightingFx?.waitForCloudAnim(e);
                }),
                this.game.events.subscribe(i.EventType.LightningStormManifest, () => {
                  var e = (this.lightingFx = new a.LightningStormFx(
                    this.game.rules.general.lightningStorm.duration / n.GameSpeed.BASE_TICKS_PER_SECOND,
                    this.game.map.getIonLighting(),
                  ));
                  this.lightingDirector.addEffect(e);
                }),
                this.game.events.subscribe(i.EventType.SuperWeaponActivate, (r) => {
                  var e = r.target;
                  if (e === o.SuperWeaponType.IronCurtain)
                    this.renderableManager.createTransientAnim(
                      this.game.rules.audioVisual.ironCurtainInvokeAnim,
                      (e) => {
                        var t = l.Coords.tile3dToWorld(r.atTile.rx + 0.5, r.atTile.ry + 0.5, r.atTile.z);
                        e.setPosition(t);
                      },
                    );
                  else if (e === o.SuperWeaponType.ChronoSphere) {
                    this.disposeChronoSphereAnim();
                    var s = this.game.map.tileOccupation.getBridgeOnTile(r.atTile)?.tileElevation ?? 0;
                    let t = l.Coords.tile3dToWorld(r.atTile.rx + 0.5, r.atTile.ry + 0.5, r.atTile.z + s);
                    ((e = r.atTile2), (s = this.game.map.tileOccupation.getBridgeOnTile(e)?.tileElevation ?? 0));
                    let i = l.Coords.tile3dToWorld(e.rx + 0.5, e.ry + 0.5, e.z + s);
                    (this.renderableManager.createTransientAnim(this.game.rules.audioVisual.chronoBlast, (e) => {
                      e.setPosition(t);
                    }),
                      this.renderableManager.createTransientAnim(this.game.rules.audioVisual.chronoBlastDest, (e) => {
                        e.setPosition(i);
                      }));
                  }
                }),
              );
            }
            createChronoSphereAnim(i) {
              this.chronoSphereAnim = this.renderableManager.createAnim(
                this.game.rules.audioVisual.chronoPlacement,
                (e) => {
                  var t = this.game.map.tileOccupation.getBridgeOnTile(i)?.tileElevation ?? 0,
                    t = l.Coords.tile3dToWorld(i.rx + 0.5, i.ry + 0.5, i.z + t);
                  e.setPosition(t);
                },
              );
            }
            disposeChronoSphereAnim() {
              let e = this.chronoSphereAnim;
              e && (this.renderableManager.getRenderableContainer()?.remove(e), e.dispose());
            }
            dispose() {
              ((this.lightingFx = void 0), this.disposeChronoSphereAnim(), this.disposables.dispose());
            }
          }),
        );
      },
    };
  },
);
