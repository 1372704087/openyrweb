// === Reconstructed SystemJS module: engine/renderable/fx/handler/BeaconFxHandler ===
// deps: ["game/event/EventType","util/disposable/CompositeDisposable","game/Coords","engine/sound/SoundKey"]
// Note: variable/type names are minified approximations of the original TypeScript.

System.register(
  "engine/renderable/fx/handler/BeaconFxHandler",
  ["game/event/EventType", "util/disposable/CompositeDisposable", "game/Coords", "engine/sound/SoundKey"],
  function (e, t) {
    "use strict";
    var i, a, n, o, r;
    t && t.id;
    return {
      setters: [
        function (e) {
          i = e;
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
        (0,
          e(
            "BeaconFxHandler",
            (r = class {
              constructor(e, t, i, r, s) {
                ((this.game = e),
                  (this.localPlayer = t),
                  (this.renderableManager = i),
                  (this.renderer = r),
                  (this.worldSound = s),
                  (this.disposables = new a.CompositeDisposable()),
                  (this.beacons = new Map()),
                  (this.handlePingEvent = (r) => {
                    var s = this.localPlayer.value;
                    if (
                      (!s || s.isObserver || r.player === s || this.game.alliances.areAllied(r.player, s)) &&
                      this.canPingLocation(r.player, r.tile)
                    ) {
                      let e = this.beacons.get(r.player);
                      e || ((e = []), this.beacons.set(r.player, e));
                      let t = e.find((e) => e.tile === r.tile);
                      s = r.tile.onBridgeLandType ? this.game.map.tileOccupation.getBridgeOnTile(r.tile) : void 0;
                      let i = n.Coords.tile3dToWorld(
                        r.tile.rx + 0.5,
                        r.tile.ry + 0.5,
                        r.tile.z + (s?.tileElevation ?? 0),
                      );
                      (this.worldSound.playEffect(o.SoundKey.PlaceBeaconSound, i, r.player),
                        t
                          ? (t.startTime = this.now)
                          : ((s = this.renderableManager.createTransientAnim("PBEACON", (e) => {
                              (e.setPosition(i),
                                e.setRenderOrder(1e6),
                                e.remapColor(r.player.color),
                                e.create3DObject());
                            })),
                            e.push({ tile: r.tile, anim: s, startTime: this.now })));
                    }
                  }),
                  (this.handleFrame = (e) => {
                    this.now = e;
                    for (var t of this.beacons.values())
                      for (var i of t.slice())
                        if (void 0 === i.startTime) i.startTime = e;
                        else if (e > i.startTime + 7e3) {
                          i.anim.endAnimationLoop();
                          i = t.indexOf(i);
                          if (-1 === i) throw new Error("Beacon not found in array");
                          t.splice(i, 1);
                        }
                  }));
              }
              init() {
                (this.disposables.add(this.game.events.subscribe(i.EventType.PingLocation, this.handlePingEvent)),
                  this.renderer.onFrame.subscribe(this.handleFrame),
                  this.disposables.add(() => this.renderer.onFrame.unsubscribe(this.handleFrame)));
              }
              canPingLocation(e, t) {
                let i = this.beacons.get(e) ?? [];
                var r = i.reduce((e, t) => Math.max(e, t.startTime ?? 0), 0);
                return (i.length < 3 || i.some((e) => e.tile === t)) && (!this.now || this.now - r >= 1e3 / 3);
              }
              dispose() {
                this.disposables.dispose();
              }
            }),
          ));
      },
    };
  },
);
