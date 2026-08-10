// === Reconstructed SystemJS module: engine/renderable/fx/handler/VirusCloudFxHandler ===
// deps: ["util/disposable/CompositeDisposable","game/Coords","game/event/EventType","util/math"]
// Note: variable/type names are minified approximations of the original TypeScript.

System.register(
  "engine/renderable/fx/handler/VirusCloudFxHandler",
  ["util/disposable/CompositeDisposable", "game/Coords", "game/event/EventType", "util/math"],
  function (e, t) {
    "use strict";
    var i, r, s, a, n;
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
      ],
      execute: function () {
        // Must stay identical to the ACCEL in VirusCloudTrait (max velocity change per
        // game tick) so the visual integration matches the game-side damage anchor.
        var ACCEL = 0.03;
        e(
          "VirusCloudFxHandler",
          (n = class {
            // OpenYRWeb: Virus sniper toxic cloud visuals. Each game-side gas particle maps
            // to one looping puff using the md-config particle Image (TXGASG by default) —
            // a raw particle SHP with no art.ini entry, so the fallback ObjectArt defaults
            // to LoopCount=1. The handler forces infinite looping (structural: the puff must
            // outlive one animation pass) and derives the churn rate from StateAIAdvance
            // (1 SHP frame per StateAIAdvance game frames) and the opacity from
            // Translucency. The main cloud and its NextParticle (dissipation cloud) are
            // independent particles, each with its own puff, translucency and lifetime.
            // BehavesLike=Gas particles in vanilla YR drift slightly ("minor random boost"
            // to initial velocity), so each puff gets a small random drift + slow rise
            // (visual-only constants — the engine does not simulate WindEffect). Disposed on
            // the matching "remove" event.
            // Advance the puff's simulated velocity and position by `e` game ticks: the
            // velocity ramps toward _vcTarget by at most ACCEL per tick (identical to the
            // game-side integration in VirusCloudTrait), giving a visible acceleration,
            // deceleration and slow turn instead of instant velocity jumps.
            stepPuff(e, t) {
              let vx = e._vcVel.x,
                vz = e._vcVel.z,
                px = e._vcBase.x,
                pz = e._vcBase.z;
              for (let i = 0; i < t; i++) {
                (vx += Math.max(-ACCEL, Math.min(ACCEL, e._vcTarget.x - vx))),
                  (vz += Math.max(-ACCEL, Math.min(ACCEL, e._vcTarget.z - vz))),
                  (px += vx),
                  (pz += vz);
              }
              return { vx, vz, px, pz };
            }
            constructor(e, t) {
              ((this.game = e),
                (this.renderableManager = t),
                (this.disposables = new i.CompositeDisposable()),
                (this.animsByCloud = new Map()),
                (this.handleEvent = (ev) => {
                  if (ev.type !== s.EventType.VirusCloud) return;
                  let c = ev;
                  if (c.action === "spawn") {
                    if (this.animsByCloud.has(c.cloudId)) return;
                    var tileSize = r.Coords.getWorldTileSize(),
                      base = c.position ?? r.Coords.tile3dToWorld(c.tile.rx + 0.5, c.tile.ry + 0.5, c.tile.z);
                    base = new THREE.Vector3(
                      a.getRandomInt(-tileSize / 8, tileSize / 8),
                      0,
                      a.getRandomInt(-tileSize / 8, tileSize / 8),
                    ).add(base);
                    // Per-particle visual config from the md particle section.
                    let v = c.visual ?? {},
                      opacity = 1 - (v.translucency ?? 0) / 100,
                      // Deterministic drift velocity (leptons/game-tick) decided by the game
                      // side (locked-step PRNG). The puff position is re-derived from the
                      // game-tick delta, so visuals stay glued to the game-side damage anchor
                      // instead of drifting on their own. Drift state lives on the puff
                      // (_vcBase/_vcVel/_vcSpawnTick) so a periodic "vel" event can change
                      // heading mid-flight and re-anchor the base without losing position.
                      vel = c.vel ?? { x: 0, y: 0, z: 0 },
                      spawnTick = this.game.currentTick ?? 0,
                      puff = this.renderableManager.createTransientAnim(v.image || "TXGASG", (e) => {
                        e.setPosition(base);
                      }),
                      origUpdate = puff.update.bind(puff);
                    (puff._vcBase = base),
                      (puff._vcVel = new THREE.Vector3(vel.x ?? 0, vel.y ?? 0, vel.z ?? 0)),
                      // Wind target velocity; the actual velocity ramps toward it at ACCEL
                      // per tick (same integration as VirusCloudTrait).
                      (puff._vcTarget = new THREE.Vector3(vel.tx ?? 0, 0, vel.tz ?? 0)),
                      (puff._vcSpawnTick = spawnTick);
                    // The fallback ObjectArt defaults to LoopCount=1 (play once, then
                    // self-remove). Force infinite looping on the first frame by setting
                    // loopCount=-1 DIRECTLY — do not use playRemainingLoops(-1), which
                    // calls endLoopAndPlayToEnd() and stops the animation after the first
                    // pass (Animation.computeNextFrame returns STOPPED when endLoopFlag
                    // is set at the loop boundary). Same pattern as Vehicle/Infantry/TntFx.
                    // Also derive the churn rate from StateAIAdvance (1 SHP frame per
                    // StateAIAdvance game frames at 15 fps base).
                    let looped = !1;
                    (puff.update = (now) => {
                      if (!looped) {
                        (looped = !0),
                          puff.animation &&
                            ((puff.animation.props.loopCount = -1),
                            (puff.animation.props.rate = 15 / Math.max(1, v.stateAIAdvance ?? 4)));
                      }
                      origUpdate(now);
                      let ticks = Math.max(0, (this.game.currentTick ?? 0) - puff._vcSpawnTick),
                        st = this.stepPuff(puff, ticks),
                        pos = new THREE.Vector3(st.px, puff._vcBase.y + puff._vcVel.y * ticks, st.pz);
                      (puff.setPosition(pos), puff.mainObj?.setOpacity(opacity));
                    }),
                      this.animsByCloud.set(c.cloudId, puff);
                  } else if (c.action === "vel") {
                    // Periodic wind change: advance the puff to its current simulated
                    // position/speed, then continue ramping toward the new wind target
                    // (decelerate -> turn -> accelerate), matching the game-side anchor.
                    let e = this.animsByCloud.get(c.cloudId);
                    if (e) {
                      let nt = this.game.currentTick ?? 0,
                        dt2 = Math.max(0, nt - e._vcSpawnTick),
                        st = this.stepPuff(e, dt2),
                        nv = c.vel ?? { tx: 0, tz: 0 };
                      (e._vcVel = new THREE.Vector3(st.vx, e._vcVel.y, st.vz)),
                        (e._vcBase = new THREE.Vector3(st.px, e._vcBase.y + e._vcVel.y * dt2, st.pz)),
                        (e._vcTarget = new THREE.Vector3(nv.tx ?? 0, 0, nv.tz ?? 0)),
                        (e._vcSpawnTick = nt);
                    }
                  } else if (c.action === "remove") {
                    let e = this.animsByCloud.get(c.cloudId);
                    if (e) {
                      (e.remove?.(), e.dispose?.()), this.animsByCloud.delete(c.cloudId);
                    }
                  }
                }));
            }
            init() {
              this.disposables.add(this.game.events.subscribe(this.handleEvent));
            }
            dispose() {
              (this.animsByCloud.forEach((e) => {
                e.remove?.(), e.dispose?.();
              }),
                this.animsByCloud.clear(),
                this.disposables.dispose());
            }
          }),
        );
      },
    };
  },
);
