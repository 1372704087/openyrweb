﻿﻿﻿// === Reconstructed SystemJS module: gui/screen/game/SoundHandler ===
// deps: ["game/order/OrderType","engine/sound/SoundKey","engine/sound/ChannelType","util/disposable/CompositeDisposable","game/event/EventType","util/math","gui/screen/game/worldInteraction/UnitSelectionHandler","util/typeGuard","game/gameobject/Building","game/rules/TechnoRules","util/array","game/rules/general/RadarRules","game/player/production/ProductionQueue","engine/type/ObjectType","game/Coords","game/event/AllianceChangeEvent","game/gameobject/unit/VeteranLevel","game/order/OrderFeedbackType","game/gameopts/constants","game/gameobject/common/DeathType","game/WeaponType","game/gameobject/unit/ZoneType","game/type/SuperWeaponType","game/gameobject/infantry/StanceType","game/type/PowerupType","game/gameobject/unit/HealthLevel","game/trait/StalemateDetectTrait"]
// Note: variable/type names are minified approximations of the original TypeScript.

System.register(
  "gui/screen/game/SoundHandler",
  [
    "game/order/OrderType",
    "engine/sound/SoundKey",
    "engine/sound/ChannelType",
    "util/disposable/CompositeDisposable",
    "game/event/EventType",
    "util/math",
    "gui/screen/game/worldInteraction/UnitSelectionHandler",
    "util/typeGuard",
    "game/gameobject/Building",
    "game/rules/TechnoRules",
    "util/array",
    "game/rules/general/RadarRules",
    "game/player/production/ProductionQueue",
    "engine/type/ObjectType",
    "game/Coords",
    "game/event/AllianceChangeEvent",
    "game/gameobject/unit/VeteranLevel",
    "game/order/OrderFeedbackType",
    "game/gameopts/constants",
    "game/gameobject/common/DeathType",
    "game/WeaponType",
    "game/gameobject/unit/ZoneType",
    "game/type/SuperWeaponType",
    "game/gameobject/infantry/StanceType",
    "game/type/PowerupType",
    "game/gameobject/unit/HealthLevel",
    "game/trait/StalemateDetectTrait",
  ],
  function (e, t) {
    "use strict";
    var a, N, j, l, L, D, o, c, F, _, i, U, r, s, H, G, V, n, W, z, K, q, h, $, Q, u, Y, Z, X, J, ee, te, ie, re, d;
    t && t.id;
    return {
      setters: [
        function (e) {
          a = e;
        },
        function (e) {
          N = e;
        },
        function (e) {
          j = e;
        },
        function (e) {
          l = e;
        },
        function (e) {
          L = e;
        },
        function (e) {
          D = e;
        },
        function (e) {
          o = e;
        },
        function (e) {
          c = e;
        },
        function (e) {
          F = e;
        },
        function (e) {
          _ = e;
        },
        function (e) {
          i = e;
        },
        function (e) {
          U = e;
        },
        function (e) {
          r = e;
        },
        function (e) {
          s = e;
        },
        function (e) {
          H = e;
        },
        function (e) {
          G = e;
        },
        function (e) {
          V = e;
        },
        function (e) {
          n = e;
        },
        function (e) {
          W = e;
        },
        function (e) {
          z = e;
        },
        function (e) {
          K = e;
        },
        function (e) {
          q = e;
        },
        function (e) {
          h = e;
        },
        function (e) {
          $ = e;
        },
        function (e) {
          Q = e;
        },
        function (e) {
          u = e;
        },
        function (e) {
          Y = e;
        },
      ],
      execute: function () {
        ((Z = new Map()
          .set(h.SuperWeaponType.MultiMissile, "EVA_NuclearSiloDetected")
          .set(h.SuperWeaponType.IronCurtain, "EVA_IronCurtainDetected")
          .set(h.SuperWeaponType.ChronoSphere, "EVA_ChronosphereDetected")
          .set(h.SuperWeaponType.LightningStorm, "EVA_WeatherDeviceReady")),
          (X = new Map()
            .set(h.SuperWeaponType.MultiMissile, "EVA_NuclearMissileReady")
            .set(h.SuperWeaponType.IronCurtain, "EVA_IronCurtainReady")
            .set(h.SuperWeaponType.ChronoSphere, "EVA_ChronosphereReady")
            .set(h.SuperWeaponType.LightningStorm, "EVA_LightningStormReady")
            .set(h.SuperWeaponType.ParaDrop, "EVA_ReinforcementsReady")
            .set(h.SuperWeaponType.AmerParaDrop, "EVA_ReinforcementsReady")),
          (J = new Map()
            .set(h.SuperWeaponType.MultiMissile, "EVA_NuclearMissileLaunched")
            .set(h.SuperWeaponType.IronCurtain, "EVA_IronCurtainActivated")
            .set(h.SuperWeaponType.ChronoSphere, "EVA_ChronosphereActivated")
            .set(h.SuperWeaponType.LightningStorm, "EVA_LightningStormCreated")),
          (ee = new Map().set(h.SuperWeaponType.MultiMissile, N.SoundKey.DigSound)),
          (te = new Map().set(h.SuperWeaponType.LightningStorm, "TXT_LIGHTNING_STORM_APPROACHING")),
          (ie = new Map([
            [Q.PowerupType.Veteran, N.SoundKey.CratePromoteSound],
            [Q.PowerupType.Money, N.SoundKey.CrateMoneySound],
            [Q.PowerupType.Reveal, N.SoundKey.CrateRevealSound],
            [Q.PowerupType.Firepower, N.SoundKey.CrateFireSound],
            [Q.PowerupType.Armor, N.SoundKey.CrateArmourSound],
            [Q.PowerupType.Speed, N.SoundKey.CrateSpeedSound],
            [Q.PowerupType.Unit, N.SoundKey.CrateUnitSound],
          ])),
          (re = new Map([
            [Q.PowerupType.Armor, "EVA_UnitArmorUpgraded"],
            [Q.PowerupType.Firepower, "EVA_UnitFirePowerUpgraded"],
            [Q.PowerupType.Speed, "EVA_UnitSpeedUpgraded"],
          ])),
          e(
            "SoundHandler",
            (d = class {
              constructor(e, t, i, r, s, a, n, o) {
                ((this.game = e),
                  (this.worldSound = t),
                  (this.eva = i),
                  (this.sound = r),
                  (this.gameEvents = s),
                  (this.messageList = a),
                  (this.strings = n),
                  (this.player = o),
                  (this.lastAvailableObjectNames = []),
                  (this.lastQueueStatuses = new Map()),
                  (this.triggerSoundHandles = new Map()),
                  (this.disposables = new l.CompositeDisposable()));
              }
              init() {
                this.disposables.add(this.gameEvents.subscribe((e) => this.handleGameEvent(e)));
              }
              dispose() {
                this.disposables.dispose();
              }
              handleGameEvent(r) {
                switch (r.type) {
                  case L.EventType.Cheer:
                    this.sound.play(N.SoundKey.CheerSound, j.ChannelType.Effect);
                    break;
                  case L.EventType.UnitDeployUndeploy: {
                    var t = r.unit,
                      isUndeploy = "undeploy" === r.deployType,
                      e;
                    // OpenYRWeb: slave miners use the unit/building's own
                    // DeploySound=/PackupSound= directly.
                    if (t.rules.slaveMiner) {
                      e = isUndeploy
                        ? (t.rules.packupSound || t.rules.undeploySound || t.rules.deploySound)
                        : (t.rules.deploySound || t.rules.undeploySound);
                    } else {
                      e = isUndeploy ? t.rules.undeploySound : t.rules.deploySound;
                    }
                    e && this.worldSound.playEffect(e, t, t.owner);
                    break;
                  }
                  case L.EventType.ObjectTeleport:
                    e = r;
                    e.isChronoshift &&
                      (e.target.rules.chronoInSound &&
                        this.worldSound.playEffect(e.target.rules.chronoInSound, e.target, e.target.owner),
                      e.target.rules.chronoOutSound &&
                        ((t = H.Coords.tile3dToWorld(e.prevTile.rx + 0.5, e.prevTile.ry + 0.5, e.prevTile.z)),
                        this.worldSound.playEffect(e.target.rules.chronoOutSound, t, e.target.owner)));
                    break;
                  case L.EventType.WeaponFire:
                    var i = r.weapon,
                      s = r.gameObject;
                    if (i.type === K.WeaponType.DeathWeapon && s.isCrashing) break;
                    // Magnetron tractor beam: suppress repeated Report sounds while already dragging.
                    // The continuous beam visual is handled by MagnetronBeamPlugin; pulsing fire sounds
                    // every ROF feel wrong.
                    if (s.magnetronDragging) break;
                    var a = i.rules.report;
                    if (a.length) {
                      // OpenYRWeb: stop previous weapon-fire loop sound for this unit
                      // (e.g. Gattling rapid fire stacks Report sounds if they have Loop control).
                      s.__weaponFireSound && s.__weaponFireSound.isPlaying() && s.__weaponFireSound.stop();
                      (n = r.weapon.warhead.rules.electricAssault ? 0.25 : 1);
                      var h = this.worldSound.playEffect(
                        a[D.getRandomInt(0, a.length - 1)],
                        s.position.worldPosition,
                        s.owner,
                        n,
                      );
                      h && (s.__weaponFireSound = h);
                    }
                    break;
                  case L.EventType.InflictDamage:
                    {
                      let e = r;
                      i = e.target.healthTrait.health;
                      if (i && e.target.isTechno())
                        if (e.target.isBuilding()) {
                          if (e.target.wallTrait) break;
                          var a = (e.damageHitPoints / e.target.healthTrait.maxHitPoints) * 100,
                            s = this.game.rules.audioVisual,
                            n = 100 * s.conditionRed,
                            s = 100 * s.conditionYellow;
                          ((i <= s && s < i + a) || (i <= n && n < i + a)) &&
                            this.worldSound.playEffect(N.SoundKey.BuildingDamageSound, e.target, e.target.owner);
                        } else {
                          var o = e.target.rules.voiceFeedback;
                          e.target.owner === this.player &&
                            o &&
                            0.9 < Math.random() &&
                            this.worldSound.playEffect(o, e.target, e.target.owner);
                        }
                    }
                    break;
                  case L.EventType.RadarEvent:
                    o = r;
                    if (o.radarEventType === U.RadarEventType.BaseUnderAttack)
                      o.target === this.player
                        ? (this.eva.play("EVA_OurBaseIsUnderAttack"),
                          this.sound.play(N.SoundKey.BaseUnderAttackSound, j.ChannelType.Effect))
                        : this.player &&
                          this.game.alliances.areAllied(this.player, o.target) &&
                          (this.eva.play("EVA_OurAllyIsUnderAttack"),
                          this.sound.play(N.SoundKey.BaseUnderAttackSound, j.ChannelType.Effect));
                    else if (o.radarEventType === U.RadarEventType.HarvesterUnderAttack)
                      o.target === this.player && this.eva.play("EVA_OreMinerUnderAttack");
                    else if (o.radarEventType === U.RadarEventType.EnemyObjectSensed && o.target === this.player) {
                      let e = this.game.map
                        .getGroundObjectsOnTile(o.tile)
                        .find((e) => e.isBuilding() && e.superWeaponTrait);
                      e &&
                        (void 0 === (h = e.superWeaponTrait?.getSuperWeapon(e)?.rules.type) ||
                          ((u = Z.get(h)) && this.eva.play(u)));
                    }
                    break;
                  case L.EventType.SuperWeaponReady:
                    var l = r.target;
                    l.owner !== this.player ||
                      ((c = void 0 !== l.rules.type ? X.get(l.rules.type) : void 0) && this.eva.play(c));
                    break;
                  case L.EventType.SuperWeaponActivate:
                    var c,
                      h = r.target,
                      u = r.owner;
                    r.noSfxWarning ||
                      ((l = J.get(h)) && this.eva.play(l, !0),
                      (c = ee.get(h)) &&
                        ((l = r.atTile), this.worldSound.playEffect(c, H.Coords.tile3dToWorld(l.rx, l.ry, l.z), u)));
                    h = te.get(h);
                    h && this.messageList.addSystemMessage(this.strings.get(h), this.player ?? "grey");
                    break;
                  case L.EventType.LightningStormManifest:
                    this.messageList.addSystemMessage(this.strings.get("TXT_LIGHTNING_STORM"), this.player ?? "grey");
                    var d = r.target;
                    this.worldSound.playEffect(N.SoundKey.StormSound, H.Coords.tile3dToWorld(d.rx, d.ry, d.z));
                    break;
                  case L.EventType.WarheadDetonate:
                    r.isLightningStrike && this.worldSound.playEffect(N.SoundKey.LightningSounds, r.position);
                    break;
                  case L.EventType.ObjectLiftOff:
                    var g = r.gameObject,
                      d = g.rules.auxSound1;
                    d && this.worldSound.playEffect(d, g, g.owner);
                    break;
                  case L.EventType.ObjectLand:
                    var p = r.gameObject,
                      g = p.rules.auxSound2;
                    g && this.worldSound.playEffect(g, p, p.owner);
                    break;
                  case L.EventType.ObjectCrashing:
                    var m = r.gameObject,
                      p = m.rules.crashingSound;
                    (p && this.worldSound.playEffect(p, m.position.worldPosition, m.owner),
                      m.owner !== this.player ||
                        ((f = m.rules.voiceCrashing) &&
                          this.worldSound.playEffect(f, m.position.worldPosition, m.owner)));
                    break;
                  case L.EventType.ObjectDestroy:
                    {
                      let t = r.target,
                        i = void 0;
                      if (
                        (t.isUnit() && !t.isInfantry() && t.isCrashing
                          ? (i =
                              t.zone === q.ZoneType.Water
                                ? this.game.rules.audioVisual.impactWaterSound
                                : (t.rules.impactLandSound ?? this.game.rules.audioVisual.impactLandSound))
                          : t.deathType === z.DeathType.Temporal || t.deathType === z.DeathType.None
                            ? (i = void 0)
                            : t.deathType === z.DeathType.Crush
                              ? (i = t.rules.crushSound)
                              : t.isVehicle() && t.zone === q.ZoneType.Water && t.isSinker
                                ? (i = N.SoundKey.SinkingSound)
                                : t.isTechno()
                                  ? ((i = t.rules.dieSound), !i && t.isBuilding() && (i = N.SoundKey.BuildingDieSound))
                                  : t.isProjectile() &&
                                    (t.fromWeapon.warhead.rules.ivanBomb
                                      ? (i = N.SoundKey.BombAttachSound)
                                      : t.fromWeapon.warhead.rules.mindControl &&
                                        (i = N.SoundKey.YuriMindControlSound)),
                        i)
                      ) {
                        let e;
                        (t.isTechno() ? (e = t.owner) : t.isProjectile() && (e = t.fromPlayer),
                          this.worldSound.playEffect(i, t.position.worldPosition, e));
                      }
                      t.isUnit() && !t.rules.spawned && t.owner === this.player && this.eva.play("EVA_UnitLost");
                    }
                    break;
                  case L.EventType.ObjectSpawn:
                    {
                      let e = r.gameObject;
                      e.isTechno() &&
                        e.rules.createSound &&
                        this.worldSound.playEffect(e.rules.createSound, e, e.owner);
                      e.isInfantry() &&
                        e.stance === $.StanceType.Paradrop &&
                        this.worldSound.playEffect(N.SoundKey.ChuteSound, e, e.owner);
                    }
                    break;
                  case L.EventType.ObjectUnspawn:
                    {
                      let e = r.gameObject;
                      e.isBuilding() &&
                        e.rules.spySat &&
                        this.worldSound.playEffect(N.SoundKey.SpySatDeactivationSound, e, e.owner);
                      // OpenYRWeb: play SlavesFreeSound when a Slave Miner is destroyed (liberation)
                      if (e._slavesLiberated) {
                        var freeSound = this.game.rules.general.slavesFreeSound;
                        freeSound && this.worldSound.playEffect(freeSound, e, e.owner);
                      }
                    }
                    break;
                  case L.EventType.ObjectMorph: {
                    let e = r.to;
                    e.isBuilding() && this.worldSound.playEffect(N.SoundKey.BuildingDrop, e, e.owner);
                    break;
                  }
                  case L.EventType.ShipSubmergeChange:
                    this.worldSound.playEffect(N.SoundKey.CloakSound, r.target, r.target.owner);
                    break;
                  case L.EventType.BridgeRepair:
                    r.source === this.player && this.eva.play("EVA_BridgeRepaired");
                    break;
                  case L.EventType.BuildStatusChange:
                    var f = r.target;
                    r.status === F.BuildStatus.BuildDown &&
                      (this.worldSound.playEffect(N.SoundKey.SellSound, f.position.worldPosition, f.owner),
                      !f.poweredTrait || ((m = f.rules.notWorkingSound) && this.worldSound.playEffect(m, f, f.owner)));
                    break;
                  case L.EventType.BuildingPlace:
                    var y = r.target;
                    (this.worldSound.playEffect(N.SoundKey.BuildingSlam, y, y.owner),
                      y.rules.spySat && this.worldSound.playEffect(N.SoundKey.SpySatActivationSound, y, y.owner));
                    break;
                  case L.EventType.BuildingFailedPlace:
                    this.player === r.player && this.eva.play("EVA_CannotDeployHere");
                    break;
                  case L.EventType.ObjectSell: {
                    let e = r.target;
                    (e.rules.wall &&
                      this.worldSound.playEffect(N.SoundKey.SellSound, e.position.worldPosition, e.owner),
                      this.player === e.owner &&
                        this.eva.play(e.isBuilding() ? "EVA_StructureSold" : "EVA_UnitSold", !0));
                    break;
                  }
                  case L.EventType.BuildingRepairFull:
                    var y = r.target,
                      T = r.source;
                    T === this.player && this.worldSound.playEffect(N.SoundKey.BuildingRepairedSound, y, T);
                    break;
                  case L.EventType.BuildingCapture:
                    var v = r.target;
                    v.owner === this.player &&
                      this.eva.play(v.rules.needsEngineer ? "EVA_TechBuildingCaptured" : "EVA_BuildingCaptured");
                    break;
                  case L.EventType.BuildingInfiltration:
                    ((T = r.source), (v = r.target));
                    if (!this.player || this.player.isObserver || v.owner === this.player || T.owner === this.player) {
                      T = v.owner === this.player;
                      v.rules.radar || T || this.eva.play("EVA_BuildingInfiltrated");
                      let e;
                      (v.rules.radar && (e = T ? "EVA_RadarSabotaged" : "EVA_BuildingInfRadarSabotaged"),
                        0 < v.rules.power && (e = T ? "EVA_PowerSabotaged" : "EVA_EnemyBasePoweredDown"),
                        v.rules.storage && (e = T ? "EVA_CashStolen" : "EVA_BuildingInfCashStolen"),
                        (this.game.rules.ai.buildTech.includes(v.name) ||
                          [_.FactoryType.InfantryType, _.FactoryType.UnitType].includes(v.factoryTrait?.type)) &&
                          (e = T ? "EVA_TechnologyStolen" : "EVA_NewTechnologyAcquired"),
                        e && this.eva.play(e));
                    }
                    break;
                  case L.EventType.BuildingGarrison:
                    var b = r.target;
                    (this.worldSound.playEffect(N.SoundKey.BuildingGarrisonedSound, b, b.owner),
                      b.owner === this.player && this.eva.play("EVA_StructureGarrisoned"));
                    break;
                  case L.EventType.BuildingEvacuate:
                    r.player === this.player && this.eva.play("EVA_StructureAbandoned");
                    break;
                  case L.EventType.BuildingRepairStart:
                  case L.EventType.UnitRepairStart:
                    r.target.owner === this.player && this.eva.play("EVA_Repairing");
                    break;
                  case L.EventType.UnitRepairFinish:
                    b = r.target;
                    b.owner === this.player &&
                      (this.eva.play("EVA_UnitRepaired"),
                      r.from.rules.hospital &&
                        this.worldSound.playEffect(this.game.rules.crateRules.healCrateSound, b, b.owner));
                    break;
                  case L.EventType.PlayerDefeated:
                    var S = r.target;
                    (S === this.player && !this.player.isObserver) ||
                      S.resigned ||
                      ((w = S.isAi ? this.strings.get(W.aiUiNames.get(S.aiDifficulty)) : S.name),
                      this.eva.play(S !== this.player ? "EVA_PlayerDefeated" : "EVA_YouHaveLost"),
                      this.messageList.addSystemMessage(this.strings.get("TXT_PLAYER_DEFEATED", w), S));
                    break;
                  case L.EventType.PlayerResigned:
                    this.eva.play("EVA_PlayerResigned");
                    var w = r.target,
                      S = w.isAi ? this.strings.get(W.aiUiNames.get(w.aiDifficulty)) : w.name;
                    (this.messageList.addSystemMessage(
                      w.isObserver ? this.strings.get("TXT_PLAYER_DEFEATED", S) : this.strings.get("TXT_LEFT_GAME", S),
                      w,
                    ),
                      r.assetsRedistributed &&
                        this.messageList.addSystemMessage(this.strings.get("TS:PlayerAssetsSplit", w.name), w));
                    break;
                  case L.EventType.PlayerDropped:
                    var E = r.target;
                    (this.messageList.addSystemMessage(this.strings.get("TXT_CONNECTION_LOST", E.name), "grey"),
                      r.assetsRedistributed &&
                        this.messageList.addSystemMessage(this.strings.get("TS:PlayerAssetsSplit", E.name), E));
                    break;
                  case L.EventType.DeployNotAllowed:
                    r.target.owner === this.player && this.eva.play("EVA_CannotDeployHere");
                    break;
                  case L.EventType.PowerLow:
                    r.target === this.player &&
                      (this.eva.play("EVA_LowPower"),
                      this.messageList.addSystemMessage(this.strings.get("TXT_LOW_POWER"), this.player));
                    break;
                  case L.EventType.RadarOnOff:
                    r.target === this.player &&
                      ((C = r.radarEnabled),
                      this.sound.play(C ? N.SoundKey.RadarOn : N.SoundKey.RadarOff, j.ChannelType.Effect));
                    break;
                  case L.EventType.InsufficientFunds:
                    r.target === this.player && this.eva.play("EVA_InsufficientFunds");
                    break;
                  case L.EventType.RallyPointChange:
                    r.target.owner === this.player && this.eva.play("EVA_NewRallyPointEstablished");
                    break;
                  case L.EventType.PrimaryFactoryChange:
                    r.target.owner === this.player && this.eva.play("EVA_PrimaryBuildingSelected");
                    break;
                  case L.EventType.AllianceChange:
                    {
                      let e = r.alliance;
                      var E = r.changeType,
                        C = r.from;
                      E === G.AllianceEventType.Formed
                        ? (!this.player ||
                          this.player.isObserver ||
                          e.players.has(this.player) ||
                          (this.game.alliances.areAllied(this.player, e.players.first) &&
                            this.game.alliances.areAllied(this.player, e.players.second))
                            ? this.eva.play("EVA_AllianceFormed")
                            : this.eva.play("EVA_EnemyAllianceFormed"),
                          this.messageList.addSystemMessage(
                            this.strings.get("TXT_HAS_ALLIED", e.players.second.name, e.players.first.name),
                            "white",
                          ))
                        : E === G.AllianceEventType.Requested
                          ? (this.player === e.players.first
                              ? this.eva.play("EVA_RequestingAlliance")
                              : this.player === e.players.second && this.eva.play("EVA_AllianceRequested"),
                            this.messageList.addSystemMessage(
                              this.strings.get("TXT_HAS_ALLIED", e.players.first.name, e.players.second.name),
                              "lightgrey",
                            ))
                          : E === G.AllianceEventType.Broken &&
                            (this.eva.play("EVA_AllianceBroken"),
                            this.messageList.addSystemMessage(
                              this.strings.get(
                                "TXT_AT_WAR",
                                C.name,
                                (C === e.players.first ? e.players.second : e.players.first).name,
                              ),
                              "white",
                            ));
                    }
                    break;
                  case L.EventType.UnitPromote:
                    r.target.owner === this.player &&
                      (this.sound.play(
                        r.target.veteranLevel === V.VeteranLevel.Elite
                          ? N.SoundKey.UpgradeEliteSound
                          : N.SoundKey.UpgradeVeteranSound,
                        j.ChannelType.Effect,
                      ),
                      this.eva.play("EVA_UnitPromoted", !0));
                    break;
                  case L.EventType.EnterTransport:
                    var x = r.target,
                      O = x.rules.enterTransportSound;
                    O && this.worldSound.playEffect(O, x, x.owner);
                    break;
                  case L.EventType.LeaveTransport:
                    ((O = r.target), (x = O.rules.leaveTransportSound));
                    x && this.worldSound.playEffect(x, O, O.owner);
                    break;
                  case L.EventType.UnitRecycle:
                    var A = r.target,
                      M = A.rules.dieSound;
                    M && this.worldSound.playEffect(M, A.position.worldPosition, A.owner);
                    break;
                  case L.EventType.CratePickup:
                    {
                      M = r;
                      let e = ie.get(M.target.type);
                      e || M.target.type !== Q.PowerupType.HealBase || (e = this.game.rules.crateRules.healCrateSound);
                      var R = re.get(M.target.type);
                      (this.player &&
                        !this.player.isObserver &&
                        M.player !== this.player &&
                        !this.game.alliances.areAllied(M.player, this.player)) ||
                        (e &&
                          ((A = H.Coords.tile3dToWorld(M.tile.rx, M.tile.ry, M.tile.z)),
                          this.worldSound.playEffect(e, A, M.player)),
                        R && this.eva.play(R));
                    }
                    break;
                  case L.EventType.StalemateDetect:
                    var P = Math.floor(Y.StalemateDetectTrait.graceMinutes);
                    (this.messageList.addSystemMessage(this.strings.get("TS:StalemateWarning", P), "white", 20),
                      this.eva.play(1 < P ? `EVA_${P}MinutesRemaining` : "EVA_1MinuteRemaining"));
                    break;
                  case L.EventType.TriggerSoundFx:
                    var I = r,
                      R = I.tile;
                    if (R) {
                      P = this.worldSound.playEffect(I.soundId, H.Coords.tile3dToWorld(R.rx, R.ry, R.z));
                      if (P) {
                        let e = this.triggerSoundHandles.get(R);
                        (e || ((e = []), this.triggerSoundHandles.set(R, e)), e.push(P));
                      }
                    } else this.sound.play(I.soundId, j.ChannelType.Effect);
                    break;
                  case L.EventType.TriggerStopSoundFx:
                    var k = r.tile,
                      I = this.triggerSoundHandles.get(k);
                    if (I) {
                      for (var B of I) B.isPlaying() && B.stop();
                      this.triggerSoundHandles.delete(k);
                    }
                    break;
                  case L.EventType.TriggerEva:
                    this.eva.play(r.soundId);
                    break;
                  case L.EventType.TriggerText:
                    k = r.label;
                    this.messageList.addSystemMessage(this.strings.get(k), this.player ?? "grey");
                }
              }
              handleOrderPushed(t, i, r) {
                var s = Date.now();
                if (!this.lastFeedbackTime || 250 <= s - this.lastFeedbackTime) {
                  let e = void 0;
                  if (i === a.OrderType.Stop) e = N.SoundKey.StopSound;
                  else if (i === a.OrderType.Guard) e = N.SoundKey.GuardSound;
                  else if (i === a.OrderType.Scatter) e = N.SoundKey.ScatterSound;
                  else
                    switch (r) {
                      case n.OrderFeedbackType.Attack:
                        e = t.rules.voiceAttack;
                        break;
                      case n.OrderFeedbackType.Move:
                        e = t.rules.voiceMove;
                        break;
                      case n.OrderFeedbackType.Capture:
                        e = t.rules.voiceCapture || t.rules.voiceSpecialAttack;
                        break;
                      case n.OrderFeedbackType.SpecialAttack:
                        e = t.rules.voiceSpecialAttack;
                        break;
                      case n.OrderFeedbackType.Enter:
                        e = t.rules.voiceEnter ?? t.rules.voiceMove;
                        break;
                      case n.OrderFeedbackType.None:
                    }
                  e && (this.sound.play(e, j.ChannelType.Effect), (this.lastFeedbackTime = s));
                }
              }
              handleSelectionChangeEvent({ selection: i, queryType: r, veteranLevel: s, healthLevel: a }) {
                if (!i.length || i[0].owner === this.player) {
                  var n,
                    e = Date.now(),
                    t = !this.lastFeedbackTime || 250 <= e - this.lastFeedbackTime;
                  if ((t && (this.lastFeedbackTime = e), r)) {
                    if (t) {
                      let e = i.map((e) => e.rules.voiceSelect).filter(c.isNotNullOrUndefined),
                        t = new Map();
                      (e.forEach((e) => t.set(e, (t.get(e) ?? 0) + 1)),
                        t.forEach((t, i) => {
                          var r = this.sound.getSoundSpec(i);
                          if (r) {
                            var s = Math.min(r.limit, t);
                            for (let e = 0; e < s; e++) this.sound.play(i, j.ChannelType.Effect);
                          }
                        }));
                    }
                    if (i.length || [o.QueryType.Veteran, o.QueryType.Health].includes(r)) {
                      let t;
                      switch (r) {
                        case o.QueryType.OnScreen:
                          t = this.strings.get("Msg:SelAcrossScreen");
                          break;
                        case o.QueryType.OnMap:
                          t = this.strings.get("Msg:SelAcrossMap");
                          break;
                        case o.QueryType.Veteran:
                        case o.QueryType.Health: {
                          if (
                            !i.length &&
                            ((r === o.QueryType.Veteran && void 0 === s) || (r === o.QueryType.Health && void 0 === a))
                          ) {
                            t = this.strings.get("Msg:NavEmpty");
                            break;
                          }
                          let e;
                          if (r === o.QueryType.Veteran)
                            switch (s) {
                              case V.VeteranLevel.Elite:
                                e = this.strings.get("Msg:Elite");
                                break;
                              case V.VeteranLevel.Veteran:
                                e = this.strings.get("Msg:Veteran");
                                break;
                              case V.VeteranLevel.None:
                                e = this.strings.get("Msg:LittleExperience");
                            }
                          else if (r === o.QueryType.Health)
                            switch (a) {
                              case u.HealthLevel.Green:
                                e = this.strings.get("Msg:Healthy");
                                break;
                              case u.HealthLevel.Yellow:
                                e = this.strings.get("Msg:HeavilyDamaged");
                                break;
                              case u.HealthLevel.Red:
                                e = this.strings.get("Msg:Critical");
                            }
                          void 0 !== e &&
                            ((e = e.toUpperCase()),
                            (t = i.length
                              ? ((n = i.reduce((e, t) => e + t.rules.cost, 0)),
                                this.strings.get("Msg:UnitsWorth", i.length, e, n))
                              : this.strings.get("Msg:NoUnitsSel", e)));
                          break;
                        }
                      }
                      t && this.messageList.addUiFeedbackMessage(t);
                    } else this.messageList.addUiFeedbackMessage(this.strings.get("Msg:NothingSelected"));
                  } else
                    !t ||
                      ((t = i.find((e) => e.rules.voiceSelect)?.rules.voiceSelect) &&
                        this.sound.play(t, j.ChannelType.Effect));
                }
              }
              handleAvailableObjectsUpdate(e) {
                var t = e.map((e) => e.name);
                !i.equals(this.lastAvailableObjectNames, t) &&
                  t.length > this.lastAvailableObjectNames.length &&
                  ((this.lastAvailableObjectNames = t), this.eva.play("EVA_NewConstructionOptions"));
              }
              handleProductionQueueUpdate(e) {
                var t = this.lastQueueStatuses.get(e.type);
                if (void 0 === t || e.status !== t)
                  switch ((this.lastQueueStatuses.set(e.type, e.status), e.status)) {
                    case r.QueueStatus.Ready:
                      e.getFirst().rules.type === s.ObjectType.Building
                        ? this.eva.play("EVA_ConstructionComplete")
                        : this.eva.play("EVA_UnitReady");
                      break;
                    case r.QueueStatus.Active:
                      e.getFirst().rules.type === s.ObjectType.Building
                        ? this.eva.play("EVA_Building")
                        : t === r.QueueStatus.Idle && this.eva.play("EVA_Training");
                      break;
                    case r.QueueStatus.OnHold:
                      this.eva.play("EVA_OnHold");
                  }
              }
            }),
          ));
      },
    };
  },
);
