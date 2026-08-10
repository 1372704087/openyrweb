// === Reconstructed SystemJS module: game/trait/VirusCloudTrait ===
// deps: ["game/map/tileFinder/RadialTileFinder","game/Warhead","game/trait/interface/NotifyTick","game/event/VirusCloudEvent","game/Coords"]
// Note: variable/type names are minified approximations of the original TypeScript.

System.register(
  "game/trait/VirusCloudTrait",
  [
    "game/map/tileFinder/RadialTileFinder",
    "game/Warhead",
    "game/trait/interface/NotifyTick",
    "game/event/VirusCloudEvent",
    "game/Coords",
  ],
  function (e, t) {
    "use strict";
    var i, r, s, a, c, g;
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
          g = e;
        },
      ],
      execute: function () {
        // OpenYRWeb: Virus sniper toxic cloud. The engine has no YR particle engine, so the
        // cloud is simulated as per-tile damage sources. ALL tuning values come from the
        // vanilla md config instead of being hardcoded here:
        //   [VIRUSD]      SpawnsParticle=VirusCloud1 NumParticles=3  (artmd.ini death anim)
        //   [VirusCloud1] Damage/MaxDC/MaxEC/Image/Warhead/StateAIAdvance/Translucency
        //   [VirusCloud1] NextParticle=VirusCloudD1 -> when the main cloud expires it spawns
        //                 a brand-new independent VirusCloudD1 particle (own MaxEC lifetime,
        //                 own MaxDC damage cadence, own Translucency) at the same spot —
        //                 matching vanilla YR's "successor particle" behaviour.
        //   [VirusGas]    CellSpread=1 InfDeath=8 -> chain reaction
        // Visuals are driven by VirusCloudEvent (spawn/remove) -> VirusCloudFxHandler.
        // Vanilla YR wind table: every frame a Gas particle's map coordinates are modified
        // by WindEffect × this offset, where the row is picked by the wind direction
        // (0=north, clockwise). Each particle re-picks its own direction on its own random
        // schedule (see onTick), so the clouds don't all turn at the same tick.
        var WIND_TABLE_X = [0, 2, 2, 2, 0, -2, -2, -2],
          WIND_TABLE_Y = [-2, -2, 0, 2, 2, 2, 0, -2],
          // Engine-internal: velocity changes by at most this many leptons/tick per game
          // tick (max acceleration/deceleration). This gives the cloud a visible ramp-up,
          // slow turn and ramp-down instead of instant velocity jumps. MUST stay identical
          // to the ACCEL used by VirusCloudFxHandler so visuals track the damage anchor.
          ACCEL = 0.03;
        ((c = class {
          constructor(e) {
            ((this.map = e),
              (this.clouds = new Map()),
              (this.nextCloudId = 1),
              (this._config = void 0),
              (this._warheadCache = new Map()));
          }
          // Engine-internal safety cap — there is no vanilla particle-cap config for the
          // global GasCloudSys, so this stays a code constant to bound chain reactions.
          get maxClouds() {
            return 200;
          }
          // Lazily resolve the particle tuning from the md config. Each particle kind
          // ("main" = the death cloud, "dissipate" = its NextParticle successor) carries its
          // own lifetime/cadence/damage/visual fields read from its rulesmd.ini section.
          getConfig(e) {
            if (void 0 !== this._config) return this._config;
            try {
              let t = e.rules.audioVisual.infantryVirus,
                u = e.art.getAnimation(t),
                n = u.art.getString("SpawnsParticle", "VirusCloud1"),
                o = e.rules.getParticle(n),
                l = o.getString("NextParticle"),
                h = l ? e.rules.getParticle(l) : void 0,
                f = (e, t) => ({
                  damage: e.getNumber("Damage", t.damage),
                  interval: e.getNumber("MaxDC", t.interval),
                  lifetime: e.getNumber("MaxEC", t.lifetime),
                  image: e.getString("Image", t.image),
                  translucency: e.getNumber("Translucency", t.translucency),
                  stateAIAdvance: e.getNumber("StateAIAdvance", 4),
                  windEffect: e.getNumber("WindEffect", t.windEffect),
                  warhead: e.getString("Warhead", t.warhead),
                }),
                // Global wind direction from [General] WindDirection (vanilla: 1 = NE).
                // Drives the 8-way wind table applied to Gas particles.
                dir = e.rules.getIni().getSection("General")?.getNumber("WindDirection", 0) ?? 0;
              this._config = {
                main: f(o, { damage: 5, interval: 30, lifetime: 1000, image: "TXGASG", translucency: 0, windEffect: 0, warhead: "VirusGas" }),
                dissipate: h
                  ? f(h, { damage: 5, interval: 60, lifetime: 50, image: "TXGASG", translucency: 50, windEffect: 0, warhead: "VirusGas" })
                  : void 0,
                particlesPerDeath: u.art.getNumber("NumParticles", 3),
                windDirection: ((dir % 8) + 8) % 8,
              };
            } catch (e) {
              this._config = null;
            }
            return this._config;
          }
          [s.NotifyTick.onTick](e) {
            if (!this.clouds.size) return;
            let t = this.getConfig(e);
            this.clouds.forEach((n, i) => {
              // Each particle re-picks its wind direction on its OWN random schedule
              // (async turns — the clouds don't all swap heading at the same tick), and
              // even a scheduled re-pick doesn't have to turn: half the time the particle
              // keeps its current heading and only reschedules. Only the TARGET velocity
              // changes; the actual velocity ramps toward it (decelerate -> turn ->
              // accelerate) via ACCEL in the drift step below.
              if (0 >= --n.windTicksLeft) {
                if (e.prng.generateRandomInt(0, 1)) {
                  (n.dir = e.prng.generateRandomInt(0, 7)),
                    (n.tx = WIND_TABLE_X[n.dir] * n.pace),
                    (n.tz = WIND_TABLE_Y[n.dir] * n.pace),
                    e.events.dispatch(
                      new a.VirusCloudEvent("vel", i, n.tile, 0, void 0, void 0, { tx: n.tx, tz: n.tz }),
                    );
                }
                // Next re-roll in 45..210 ticks (~0.75-3.5s at 60 tps).
                n.windTicksLeft = 45 + e.prng.generateRandomInt(0, 165);
              }
              // BehavesLike=Gas: the cloud drifts every game tick. Deterministic velocity
              // (game PRNG, locked-step) is stored per particle and the tile anchor follows
              // the cloud, so the damage zone moves with the gas instead of staying at the
              // spawn cell. The visual handler re-derives the same world position from
              // (currentTick - spawnTick) * vel.
              if (n.vel && n.pos) {
                // ACCEL-limited approach toward the wind target: the cloud ramps up from
                // rest, and on a wind change it decelerates, turns and accelerates again
                // instead of instant velocity jumps.
                (n.vel.x += Math.max(-ACCEL, Math.min(ACCEL, n.tx - n.vel.x))),
                  (n.vel.z += Math.max(-ACCEL, Math.min(ACCEL, n.tz - n.vel.z))),
                  (n.pos.x += n.vel.x),
                  (n.pos.y += n.vel.y),
                  (n.pos.z += n.vel.z);
                let c = Math.floor(n.pos.x / g.Coords.LEPTONS_PER_TILE),
                  f = Math.floor(n.pos.z / g.Coords.LEPTONS_PER_TILE);
                if (c !== n.tile.rx || f !== n.tile.ry) {
                  let r2 = this.map.tiles.getByMapCoords(c, f);
                  r2 && (n.tile = r2);
                }
              }
              n.countdown--,
                n.countdown <= 0 &&
                  (this.applyDamage(e, n), (n.countdown = n.interval)),
                n.ticksLeft--,
                n.ticksLeft <= 0 &&
                  (this.clouds.delete(i),
                  e.events.dispatch(new a.VirusCloudEvent("remove", i, n.tile)),
                  // Vanilla: when the main cloud expires it spawns its NextParticle (the
                  // dissipation cloud) as a brand-new independent particle at the same spot.
                  "main" === n.kind && this.spawnParticle(n.tile, n.pos, e, t, "dissipate"));
            });
          }
          // Vanilla: the VIRUSD death anim (InfDeath=8) spawns NumParticles gas particles at
          // the victim's exact position. Only human (non-NotHuman) infantry do so — NotHuman
          // victims play Die1 instead of VIRUSD and release no gas. `e` = victim tile (damage
          // anchor), `t` = exact world position, `i` = game.
          createCloud(e, t, i) {
            if (!e || this.clouds.size >= this.maxClouds) return;
            let s = this.getConfig(i);
            if (!s) return;
            for (let r = 0; r < s.particlesPerDeath; r++) this.spawnParticle(e, t, i, s, "main");
          }
          // Spawn one independent cloud record + its visual event. `kind` selects the md
          // particle config ("main" or "dissipate").
          spawnParticle(e, t, i, s, r) {
            if (this.clouds.size >= this.maxClouds) return;
            let n = s[r];
            if (!n) return;
            let l = this.nextCloudId++,
              h = t?.clone?.() ?? void 0,
              // Vanilla YR Gas drift (reverse-engineered): every frame
              //   mapX += WindEffect × windTableX[windDirection]
              //   mapY += WindEffect × windTableY[windDirection]
              //   height += Velocity        (Gas: "initial velocity might get a minor random
              //                              boost", so a slow deterministic rise)
              // WindEffect comes from the particle's own rulesmd.ini section. VirusCloud1
              // ships with WindEffect=0, so for the requested default behaviour each
              // particle drifts at a StateAIAdvance-paced speed (wind table offset 2
              // leptons ÷ StateAIAdvance 4 = 0.5 leptons/tick) in its OWN random direction
              // (per-particle initial velocity boost — the 3 clouds don't fly as one). With
              // WindEffect>0 the global [General] WindDirection is used instead. Units are
              // leptons/game-tick; reused verbatim by VirusCloudFxHandler.
              we = n.windEffect ?? 0,
              pace = 0 < we ? we : 2 / Math.max(1, n.stateAIAdvance ?? 4),
              wd = 0 < we ? (s.windDirection ?? 0) & 7 : i.prng.generateRandomInt(0, 7),
              rise = 0.15 + i.prng.generateRandomInt(-5, 5) / 100,
              // Wind TARGET velocity (leptons/tick). The cloud starts from rest and ramps
              // toward it (ACCEL-limited), so it never "jumps" into motion.
              tx = WIND_TABLE_X[wd] * pace,
              tz = WIND_TABLE_Y[wd] * pace,
              v = { x: 0, y: rise, z: 0, tx, tz };
            this.clouds.set(l, {
              tile: e,
              pos: h,
              vel: v,
              tx,
              tz,
              pace,
              dir: wd,
              windEffect: we,
              // First wind re-pick after a random 45..210 ticks, then repeats.
              windTicksLeft: 45 + i.prng.generateRandomInt(0, 165),
              kind: r,
              ticksLeft: n.lifetime,
              lifetime: n.lifetime,
              countdown: n.interval,
              interval: n.interval,
              damage: n.damage,
              warhead: n.warhead,
              image: n.image,
              translucency: n.translucency,
              stateAIAdvance: n.stateAIAdvance,
            });
            i.events.dispatch(
              new a.VirusCloudEvent("spawn", l, e, n.lifetime, h, {
                image: n.image,
                translucency: n.translucency,
                stateAIAdvance: n.stateAIAdvance,
              }, v),
            );
          }
          applyDamage(e, t) {
            let s = this.getVirusGasWarhead(e, t.warhead);
            if (!s) return;
            // Vanilla YR area damage ([VirusGas] CellSpread=1, PercentAtMax=1): the warhead's
            // CellSpread selects the candidate cells (CellSpread=1 -> origin + all 8
            // neighbours, i.e. the full 3x3 including diagonals), but a unit is only actually
            // hit when its 3D distance to the cloud anchor is <= CellSpread*256 leptons
            // (ModEnc: "the map's cells are irrelevant in the distance calculation"). So the
            // centre cell and the orthogonal neighbours are hit while diagonal corners usually
            // are not. CellSpread is read from the md config, not hardcoded.
            var a = s.rules.cellSpread;
            if (!(0 < a)) return;
            var f = new i.RadialTileFinder(
              this.map.tiles,
              this.map.mapBounds,
              t.tile,
              { width: 1, height: 1 },
              0,
              Math.ceil(a),
              (e) => !!e,
              !1,
            );
            let r, l;
            // Damage anchor follows the drifting cloud: use the particle's current world
            // position (updated every tick in onTick), falling back to the cell centre.
            var w = t.pos ?? g.Coords.tile3dToWorld(t.tile.rx + 0.5, t.tile.ry + 0.5, t.tile.z);
            for (; (r = f.getNextTile());)
              for (let u of e.map.getGroundObjectsOnTile(r))
                if (u.isUnit() && !u.rules.immuneToPoison && s.canDamage(u, r, u.zone)) {
                  var q = u.position.worldPosition,
                    d =
                      Math.sqrt((q.x - w.x) ** 2 + (q.y - w.y) ** 2 + (q.z - w.z) ** 2) /
                      g.Coords.LEPTONS_PER_TILE;
                  if (d <= a && 0 < (l = s.computeDamage(t.damage, u, e)))
                    s.inflictDamage(l, u, void 0, e, !0);
                }
          }
          getVirusGasWarhead(e, t) {
            let i = t.toLowerCase();
            if (this._warheadCache.has(i)) return this._warheadCache.get(i);
            let s;
            try {
              s = new r.Warhead(e.rules.getWarhead(t));
            } catch (e) {
              s = null;
            }
            return (this._warheadCache.set(i, s), s);
          }
        }),
          e("VirusCloudTrait", c));
      },
    };
  },
);
