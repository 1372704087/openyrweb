// === Reconstructed SystemJS module: game/gameobject/trait/DeployerTrait ===
// deps: ["game/gameobject/infantry/StanceType","game/gameobject/trait/interface/NotifyTick"]
// Note: variable/type names are minified approximations of the original TypeScript.

System.register(
  "game/gameobject/trait/DeployerTrait",
  ["game/gameobject/infantry/StanceType", "game/gameobject/trait/interface/NotifyTick"],
  function (t, e) {
    "use strict";
    var r, i, s, a;
    e && e.id;
    return {
      setters: [
        function (e) {
          r = e;
        },
        function (e) {
          i = e;
        },
      ],
      execute: function () {
        var e;
        (((e = s = s || {})[(e.None = 0)] = "None"),
          (e[(e.PreparingToFire = 1)] = "PreparingToFire"),
          (e[(e.FiringUp = 2)] = "FiringUp"),
          (e[(e.Firing = 3)] = "Firing"),
          (a = class {
            constructor(e) {
              ((this.gameObject = e),
                (this.deployed = !1),
                (this.deployFireDelay = 0),
                (this.deployFireState = s.None),
                (this.fireUpDelay = 0),
                (this.deployFireCount = 0));
            }
            isDeployed() {
              return this.deployed;
            }
            setDeployed(t) {
              var i = this.deployed;
              if ((this.deployed = t) !== i) {
                let e = this.gameObject;
                (e.isInfantry() && (e.stance = t ? r.StanceType.Deployed : r.StanceType.None),
                  t
                    ? ((this.deployFireState = s.PreparingToFire),
                      (i = this.gameObject.armedTrait?.getDeployFireWeapon()),
                      (this.deployWeapon = i?.rules.areaFire ? i : void 0),
                      (this.deployFireDelay =
                        15 + ((i === e.primaryWeapon ? e.secondaryWeapon : e.primaryWeapon)?.getCooldownTicks() ?? 0)),
                      (this.deployFireCount = 0),
                      (this.undeployDelay = this.gameObject.rules.undeployDelay || void 0))
                    : (this.deployFireState === s.FiringUp && (e.isFiring = !1),
                      (this.deployFireState = s.None),
                      (this.deployWeapon = void 0)));
              }
            }
            toggleDeployed() {
              this.setDeployed(!this.isDeployed());
            }
            [i.NotifyTick.onTick](e, t) {
              if (
                void 0 !== this.undeployDelay &&
                (0 < this.undeployDelay && this.undeployDelay--,
                this.undeployDelay <= 0 && [s.None, s.PreparingToFire].includes(this.deployFireState))
              )
                return ((this.undeployDelay = void 0), void this.setDeployed(!1));
              if (this.deployWeapon && this.deployFireState !== s.None) {
                if (this.deployFireState === s.PreparingToFire) {
                  if (0 < this.deployFireDelay-- || 0 === e.ammo) return;
                  if (0 < this.computeDeployFireCooldown(this.deployWeapon, t)) return;
                  ((this.fireUpDelay = Math.max(1, e.art.fireUp)), (this.deployFireState = s.FiringUp));
                }
                if (this.deployFireState === s.FiringUp) {
                  if (((e.isFiring = !0), 0 < this.fireUpDelay--)) return;
                  this.deployFireState = s.Firing;
                }
                var i;
                this.deployFireState === s.Firing &&
                  ((e.isFiring = !1),
                  (i = e.onBridge ? t.map.tileOccupation.getBridgeOnTile(e.tile) : void 0),
                  this.deployWeapon.fire(t.createTarget(i, e.tile), t),
                  this.deployFireCount++,
                  (this.deployWeapon === e.primaryWeapon ? e.secondaryWeapon : e.primaryWeapon)?.resetCooldown(),
                  this.deployWeapon.rules.fireOnce
                    ? ((this.deployFireState = s.None), (this.deployWeapon = void 0))
                    : (this.deployFireState = s.PreparingToFire));
              }
            }
            computeDeployFireCooldown(t, i) {
              if (t.rules.radLevel && t.rules.areaFire) {
                var r = this.gameObject.tile,
                  s = i.mapRadiationTrait.getRadSiteLevel(r);
                if (!s) return 0;
                r = i.rules.radiation;
                let e = Math.max(0, s * r.radDurationMultiple - r.radLevelDelay);
                return (
                  1 === this.deployFireCount &&
                    ((r = r.radDurationMultiple * t.rules.radLevel), (e = Math.max(0, e - Math.floor(0.25 * r)))),
                  e
                );
              }
              return t.getCooldownTicks();
            }
            getHash() {
              return this.deployed ? 1 : 0;
            }
            debugGetState() {
              return { deployed: this.deployed };
            }
            dispose() {
              this.gameObject = void 0;
            }
          }),
          t("DeployerTrait", a));
      },
    };
  },
);
