// === Reconstructed SystemJS module: game/superweapon/LightningStormEffect ===
// deps: ["game/Coords","game/event/LightningStormCloudEvent","game/event/LightningStormManifestEvent","game/gameobject/unit/CollisionType","game/gameobject/unit/RangeHelper","game/GameSpeed","game/map/tileFinder/RandomTileFinder","game/Warhead","game/superweapon/SuperWeaponEffect","game/SpecialWarheadType"]
// Note: variable/type names are minified approximations of the original TypeScript.

System.register(
  "game/superweapon/LightningStormEffect",
  [
    "game/Coords",
    "game/event/LightningStormCloudEvent",
    "game/event/LightningStormManifestEvent",
    "game/gameobject/unit/CollisionType",
    "game/gameobject/unit/RangeHelper",
    "game/GameSpeed",
    "game/map/tileFinder/RandomTileFinder",
    "game/Warhead",
    "game/superweapon/SuperWeaponEffect",
    "game/SpecialWarheadType",
  ],
  function (t, e) {
    "use strict";
    var c, s, h, u, d, a, g, p, i, m, f, r;
    e && e.id;
    return {
      setters: [
        function (e) {
          c = e;
        },
        function (e) {
          s = e;
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
        function (e) {
          a = e;
        },
        function (e) {
          g = e;
        },
        function (e) {
          p = e;
        },
        function (e) {
          i = e;
        },
        function (e) {
          m = e;
        },
      ],
      execute: function () {
        var e;
        (((e = f = f || {})[(e.Approaching = 0)] = "Approaching"),
          (e[(e.Manifesting = 1)] = "Manifesting"),
          (r = class extends i.SuperWeaponEffect {
            constructor() {
              (super(...arguments), (this.state = f.Approaching), (this.clouds = []));
            }
            onStart(e) {
              var t = e.rules.general.lightningStorm;
              ((this.manifestStartTimer = t.deferment),
                (this.manifestEndTimer = t.duration),
                (this.nextDirectHitTimer = 0),
                (this.nextRandomHitTimer = 0));
            }
            onTick(t) {
              if (
                (this.state === f.Approaching &&
                  (0 < this.manifestStartTimer
                    ? this.manifestStartTimer--
                    : ((this.state = f.Manifesting), t.events.dispatch(new h.LightningStormManifestEvent(this.tile)))),
                this.state === f.Manifesting)
              ) {
                var i,
                  s = t.rules.general.lightningStorm;
                if (
                  0 < this.manifestEndTimer &&
                  (this.manifestEndTimer--,
                  0 < this.nextDirectHitTimer && this.nextDirectHitTimer--,
                  this.nextDirectHitTimer <= 0 &&
                    ((this.nextDirectHitTimer = s.hitDelay), this.spawnCloudAt(this.tile, t)),
                  0 < this.nextRandomHitTimer && this.nextRandomHitTimer--,
                  this.nextRandomHitTimer <= 0)
                ) {
                  this.nextRandomHitTimer = s.scatterDelay;
                  var a = Math.floor(s.cellSpread / 2);
                  let i = s.separation,
                    r = new d.RangeHelper(t.map.tileOccupation),
                    e = new g.RandomTileFinder(
                      t.map.tiles,
                      t.map.mapBounds,
                      this.tile,
                      a,
                      t,
                      (t) => !this.clouds.some((e) => r.tileDistance(t, e.tile) < i),
                      !1,
                    );
                  a = e.getNextTile();
                  a && this.spawnCloudAt(a, t);
                }
                for (i of this.clouds.slice())
                  if (0 < i.ticksLeft) {
                    if ((i.ticksLeft--, i.ticksLeft === Math.floor(i.durationTicks / 2))) {
                      var r = s.warhead;
                      let e = new p.Warhead(t.rules.getWarhead(r));
                      var n = i.tile,
                        o = t.map.tileOccupation.getBridgeOnTile(n),
                        l = o?.tileElevation ?? 0,
                        r = t.map.getTileZone(n);
                      e.detonate(
                        t,
                        s.damage,
                        n,
                        l,
                        c.Coords.tile3dToWorld(n.rx + 0.5, n.ry + 0.5, n.z + l),
                        r,
                        o ? u.CollisionType.OnBridge : u.CollisionType.None,
                        t.createTarget(o, n),
                        { player: this.owner, weapon: void 0 },
                        m.SpecialWarheadType.LightningStrike,
                      );
                    }
                  } else this.clouds.splice(this.clouds.indexOf(i), 1);
                if (!this.clouds.length && this.manifestEndTimer <= 0) return !0;
              }
              return !1;
            }
            spawnCloudAt(e, t) {
              var i = t.rules.audioVisual.weatherConClouds,
                i = t.generateRandomInt(0, i.length - 1);
              let r = t.art.getAnimation(t.rules.audioVisual.weatherConClouds[i]);
              ((i = r.art.getNumber("Rate", 60 * a.GameSpeed.BASE_TICKS_PER_SECOND) / 60),
                (i = Math.floor((a.GameSpeed.BASE_TICKS_PER_SECOND / i) * 60)));
              this.clouds.push({ tile: e, durationTicks: i, ticksLeft: i });
              ((i =
                (t.map.tileOccupation.getBridgeOnTile(e)?.tileElevation ?? 0) +
                c.Coords.worldToTileHeight(t.rules.general.flightLevel)),
                (i = c.Coords.tile3dToWorld(e.rx + 0.5, e.ry + 0.5, e.z + i)));
              t.events.dispatch(new s.LightningStormCloudEvent(i));
            }
          }),
          t("LightningStormEffect", r));
      },
    };
  },
);
