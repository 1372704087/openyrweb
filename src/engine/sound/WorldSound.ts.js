// === Reconstructed SystemJS module: engine/sound/WorldSound ===
// deps: ["engine/sound/SoundKey","engine/sound/ChannelType","engine/sound/SoundSpecs","util/math","util/geometry","game/map/MapShroud","game/Coords","util/typeGuard"]
// Note: variable/type names are minified approximations of the original TypeScript.

System.register(
  "engine/sound/WorldSound",
  [
    "engine/sound/SoundKey",
    "engine/sound/ChannelType",
    "engine/sound/SoundSpecs",
    "util/math",
    "util/geometry",
    "game/map/MapShroud",
    "game/Coords",
    "util/typeGuard",
  ],
  function (e, t) {
    "use strict";
    var i, g, p, c, l, h, u, d, m;
    t && t.id;
    return {
      setters: [
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
          c = e;
        },
        function (e) {
          l = e;
        },
        function (e) {
          h = e;
        },
        function (e) {
          u = e;
        },
        function (e) {
          d = e;
        },
      ],
      execute: function () {
        (e(
          "WorldSound",
          (m = class m {
            constructor(e, t, i, r, s, a, n, o) {
              ((this.sound = e),
                (this.localPlayer = t),
                (this.shroud = i),
                (this.worldViewportHelper = r),
                (this.mapTileIntersectHelper = s),
                (this.world = a),
                (this.worldScene = n),
                (this.renderer = o),
                (this.soundInstances = []),
                (this.handleObjectRemoved = (t) => {
                  this.soundInstances.forEach((e) => {
                    e.gameObject === t && e.handle.stop();
                  });
                }),
                (this.handleFrame = (e) => {
                  let t = !1;
                  (this.lastViewport && l.rectEquals(this.worldScene.viewport, this.lastViewport)) ||
                    ((this.lastViewport = this.worldScene.viewport), (t = !0));
                  ((!this.lastUpdate || 200 <= e - this.lastUpdate) && (t = !0),
                    t && (this.update(), (this.lastUpdate = e)));
                }),
                (this.noShroudSpecs = m.noShroudKeys
                  .map((e) => {
                    var t = this.sound.getSoundSpec(e);
                    if (t) return t;
                    console.warn(`Sound key "${e}" doesn't have a corresponding sound.ini entry`);
                  })
                  .filter(d.isNotNullOrUndefined)));
            }
            init() {
              (this.renderer.onFrame.subscribe(this.handleFrame),
                this.world.onObjectRemoved.subscribe(this.handleObjectRemoved));
            }
            changeLocalPlayer(e, t) {
              ((this.localPlayer = e), (this.shroud = t));
            }
            dispose() {
              (this.renderer.onFrame.unsubscribe(this.handleFrame),
                this.world.onObjectRemoved.unsubscribe(this.handleObjectRemoved),
                this.soundInstances.forEach((e) => e.handle.stop()));
            }
            update() {
              var e = this.mapTileIntersectHelper.getTileAtScreenPoint({
                x: this.worldScene.viewport.x + this.worldScene.viewport.width / 2,
                y: this.worldScene.viewport.y + this.worldScene.viewport.height / 2,
              });
              if (e) {
                ((this.tileAtViewportCenter = e), this.cleanOldInstances());
                let i = new Map();
                for (var r of this.soundInstances) {
                  var s = r.gameObject?.position.worldPosition ?? r.worldPos;
                  let { volume: e, pan: t } = this.computeVolumeAndPan(r.spec, s, r.player, r.gain);
                  (0 < e && ((s = i.get(r.spec) ?? 0), r.loop && s >= r.spec.limit ? (e = 0) : i.set(r.spec, s + 1)),
                    r.handle.setVolume(e),
                    r.handle.setPan(t),
                    (r.volume = e));
                }
              } else console.warn("No tile found at viewport center. Can't update local sound positions.");
            }
            cleanOldInstances() {
              this.soundInstances = this.soundInstances.filter((e) => e.handle.isPlaying());
            }
            playEffect(e, a, n, o = 1, l) {
              let c = this.sound.getSoundSpec(e);
              if (c && (!c.type.includes(p.SoundType.Player) || n === this.localPlayer)) {
                let e, t;
                a.position ? ((e = a.position.worldPosition), (t = a)) : (e = a);
                var h = c.control.has(p.SoundControl.Loop) || c.control.has(p.SoundControl.Ambient),
                  u = h ? c.loop || Number.POSITIVE_INFINITY : 0;
                h && void 0 !== l && (o = l);
                let { volume: i, pan: r } = this.computeVolumeAndPan(c, e, n, o),
                  s = c.limit;
                if (
                  (h &&
                    c.limit &&
                    ((s = 0),
                    this.cleanOldInstances(),
                    this.soundInstances.filter((e) => e.spec === c && 0 < e.volume).length >= c.limit && (i = 0)),
                  h || i || !c.limit)
                ) {
                  var d =
                      c.control.has(p.SoundControl.Ambient) || c.name.startsWith("_Amb_")
                        ? g.ChannelType.Ambient
                        : g.ChannelType.Effect,
                    u = this.sound.playWithOptions(c, d, i, r, s, u);
                  return (
                    u &&
                      this.soundInstances.push({
                        spec: c,
                        gameObject: t,
                        worldPos: e,
                        player: n,
                        handle: u,
                        gain: o,
                        volume: i,
                        loop: h,
                      }),
                    u
                  );
                }
              }
            }
            computeVolumeAndPan(e, t, i, r = 1) {
              let s = e.volume / 100,
                a = 0;
              var n, o, l;
              return (
                e.type.includes(p.SoundType.Global) && i !== this.localPlayer && (s = e.minVolume / 100),
                (s *= r),
                (e.type.includes(p.SoundType.Screen) || e.type.includes(p.SoundType.Global)) &&
                  ((n = this.worldViewportHelper.distanceToViewportCenter(t)),
                  (a = c.clamp(n.x / (this.worldScene.viewport.width / 2), -1, 1))),
                e.type.includes(p.SoundType.Screen)
                  ? ((o = this.worldViewportHelper.distanceToViewport(t)),
                    (l = (this.worldScene.viewport.height + this.worldScene.viewport.width) / 2 / 3),
                    (s *= THREE.Math.lerp(1, 0, Math.min(1, o / l))))
                  : e.type.includes(p.SoundType.Local) &&
                    (this.tileAtViewportCenter
                      ? ((o = new THREE.Vector2(
                          t.x / u.Coords.LEPTONS_PER_TILE - this.tileAtViewportCenter.rx,
                          t.z / u.Coords.LEPTONS_PER_TILE - this.tileAtViewportCenter.ry,
                        ).length()),
                        (l = e.range * Math.SQRT2) < o
                          ? (s = 0)
                          : (e.vShift && (s *= c.getRandomInt(e.vShift.min, e.vShift.max) / 100),
                            (s *= 1 - Math.min(1, (o / l) ** 2))))
                      : (s = 0)),
                this.noShroudSpecs.includes(e) &&
                  !e.type.includes(p.SoundType.Global) &&
                  this.shroud?.getShroudTypeByTileCoords(
                    Math.floor(t.x / u.Coords.LEPTONS_PER_TILE),
                    Math.floor(t.z / u.Coords.LEPTONS_PER_TILE),
                    Math.floor(u.Coords.worldToTileHeight(t.y)),
                  ) === h.ShroudType.Unexplored &&
                  (s = 0),
                { volume: s, pan: a }
              );
            }
          }),
        ),
          (m.noShroudKeys = [
            i.SoundKey.BuildingSlam,
            i.SoundKey.SellSound,
            i.SoundKey.BuildingGarrisonedSound,
            i.SoundKey.BuildingRepairedSound,
            i.SoundKey.SpySatActivationSound,
            i.SoundKey.SpySatDeactivationSound,
          ]));
      },
    };
  },
);
