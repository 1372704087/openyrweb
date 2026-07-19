// === Reconstructed SystemJS module: game/gameobject/ObjectFactory ===
// deps: ["engine/type/ObjectType","game/gameobject/Building","game/gameobject/Terrain","game/gameobject/Overlay","game/gameobject/Smudge","game/gameobject/Infantry","game/gameobject/Vehicle","game/gameobject/Aircraft","game/art/ObjectArt","data/IniSection","game/gameobject/trait/UnitOrderTrait","game/gameobject/ObjectPosition","game/gameobject/trait/AttackTrait","game/gameobject/Projectile","game/gameobject/trait/DeployerTrait","game/gameobject/trait/HealthTrait","game/gameobject/trait/BridgeTrait","game/map/BridgeOverlayTypes","game/map/OreOverlayTypes","game/gameobject/trait/TiberiumTrait","game/gameobject/trait/TiberiumTreeTrait","game/gameobject/trait/AutoRepairTrait","game/gameobject/trait/VeteranTrait","game/gameobject/trait/ArmedTrait","game/gameobject/trait/SelfHealingTrait","game/gameobject/trait/AmmoTrait","game/gameobject/trait/DisguiseTrait","game/gameobject/trait/InvulnerableTrait","game/gameobject/trait/WarpedOutTrait","game/gameobject/trait/TntChargeTrait","game/gameobject/trait/MindControllableTrait","game/gameobject/trait/MindControllerTrait","game/gameobject/trait/TemporalTrait","game/gameobject/trait/CloakableTrait","game/gameobject/trait/AirSpawnTrait","game/gameobject/trait/SpawnDebrisTrait","game/gameobject/Debris","game/rules/DebrisRules","game/gameobject/trait/interface/NotifyTick","game/gameobject/trait/SensorsTrait"]
// Note: variable/type names are minified approximations of the original TypeScript.

System.register(
  "game/gameobject/ObjectFactory",
  [
    "engine/type/ObjectType",
    "game/gameobject/Building",
    "game/gameobject/Terrain",
    "game/gameobject/Overlay",
    "game/gameobject/Smudge",
    "game/gameobject/Infantry",
    "game/gameobject/Vehicle",
    "game/gameobject/Aircraft",
    "game/art/ObjectArt",
    "data/IniSection",
    "game/gameobject/trait/UnitOrderTrait",
    "game/gameobject/ObjectPosition",
    "game/gameobject/trait/AttackTrait",
    "game/gameobject/Projectile",
    "game/gameobject/trait/DeployerTrait",
    "game/gameobject/trait/HealthTrait",
    "game/gameobject/trait/BridgeTrait",
    "game/map/BridgeOverlayTypes",
    "game/map/OreOverlayTypes",
    "game/gameobject/trait/TiberiumTrait",
    "game/gameobject/trait/TiberiumTreeTrait",
    "game/gameobject/trait/AutoRepairTrait",
    "game/gameobject/trait/VeteranTrait",
    "game/gameobject/trait/ArmedTrait",
    "game/gameobject/trait/SelfHealingTrait",
    "game/gameobject/trait/AmmoTrait",
    "game/gameobject/trait/DisguiseTrait",
    "game/gameobject/trait/InvulnerableTrait",
    "game/gameobject/trait/WarpedOutTrait",
    "game/gameobject/trait/TntChargeTrait",
    "game/gameobject/trait/MindControllableTrait",
    "game/gameobject/trait/MindControllerTrait",
    "game/gameobject/trait/TemporalTrait",
    "game/gameobject/trait/CloakableTrait",
    "game/gameobject/trait/AirSpawnTrait",
    "game/gameobject/trait/SpawnDebrisTrait",
    "game/gameobject/Debris",
    "game/rules/DebrisRules",
    "game/gameobject/trait/interface/NotifyTick",
    "game/gameobject/trait/SensorsTrait",
    "game/gameobject/trait/SlaveMinerTrait",
    "game/gameobject/trait/GattlingTrait",
    "game/gameobject/trait/BioReactorPowerTrait",
    "game/gameobject/trait/DrainTrait",
    "game/gameobject/trait/SlaveMinerVehicleTrait",
  ],
  function (e, t) {
    "use strict";
    var c,
      h,
      u,
      d,
      g,
      p,
      m,
      f,
      y,
      T,
      v,
      b,
      S,
      w,
      E,
      C,
      x,
      O,
      A,
      M,
      R,
      P,
      I,
      k,
      B,
      N,
      j,
      L,
      D,
      F,
      _,
      U,
      H,
      G,
      V,
      W,
      z,
      K,
      q,
      $,
      i,
      SM,
      GT,
      BP,
      DT,
      SV;
    t && t.id;
    return {
      setters: [
        function (e) {
          c = e;
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
        function (e) {
          v = e;
        },
        function (e) {
          b = e;
        },
        function (e) {
          S = e;
        },
        function (e) {
          w = e;
        },
        function (e) {
          E = e;
        },
        function (e) {
          C = e;
        },
        function (e) {
          x = e;
        },
        function (e) {
          O = e;
        },
        function (e) {
          A = e;
        },
        function (e) {
          M = e;
        },
        function (e) {
          R = e;
        },
        function (e) {
          P = e;
        },
        function (e) {
          I = e;
        },
        function (e) {
          k = e;
        },
        function (e) {
          B = e;
        },
        function (e) {
          N = e;
        },
        function (e) {
          j = e;
        },
        function (e) {
          L = e;
        },
        function (e) {
          D = e;
        },
        function (e) {
          F = e;
        },
        function (e) {
          _ = e;
        },
        function (e) {
          U = e;
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
          $ = e;
        },
        function (e) {
          SM = e;
        },
        function (e) {
          GT = e;
        },
        function (e) {
          BP = e;
        },
        function (e) {
          DT = e;
        },
        function (e) {
          SV = e;
        },
      ],
      execute: function () {
        e(
          "ObjectFactory",
          (i = class {
            constructor(e, t, i, r) {
              ((this.tiles = e), (this.tileOccupation = t), (this.bridges = i), (this.nextObjectId = r));
            }
            create(e, t, i, r) {
              let s, a;
              e === c.ObjectType.Debris
                ? (s = i.hasObject(t, c.ObjectType.VoxelAnim)
                    ? ((a = r.getObject(t, c.ObjectType.VoxelAnim)), i.getObject(t, c.ObjectType.VoxelAnim))
                    : ((a = r.getAnimation(t)),
                      new K.DebrisRules(c.ObjectType.Debris, r.getIni().getOrCreateSection(t))))
                : (a =
                    e === c.ObjectType.Projectile
                      ? ((s = i.getProjectile(t)),
                        s.inviso
                          ? new y.ObjectArt(c.ObjectType.Projectile, s, new T.IniSection(t))
                          : r.getProjectile(t))
                      : ((s = i.getObject(t, e)), r.getObject(t, e)));
              let n;
              switch (e) {
                case c.ObjectType.Building:
                  n = h.Building.factory(t, s, i, a, this.tiles, this.bridges);
                  // OpenYRWeb: attach SlaveMinerTrait to buildings with Slaves= (YR Yuri economy).
                  n.rules.slaveMiner && ((n.slaveMinerTrait = new SM.SlaveMinerTrait()), n.traits.add(n.slaveMinerTrait));
                  // OpenYRWeb: attach BioReactorPowerTrait to buildings with ExtraPower= (Bio Reactor
                  // power scaling per garrisoned infantry). Requires the building to be garrisonable,
                  // which InfantryAbsorb=yes now also enables (see TechnoRules.canBeOccupied).
                  n.rules.extraPower &&
                    n.rules.canBeOccupied &&
                    ((n.bioReactorPowerTrait = new BP.BioReactorPowerTrait()), n.traits.add(n.bioReactorPowerTrait));
                  break;
                case c.ObjectType.Infantry:
                  n = p.Infantry.factory(t, s, a, this.tileOccupation);
                  break;
                case c.ObjectType.Vehicle:
                  n = m.Vehicle.factory(t, s, a, i, this.tileOccupation);
                  // OpenYRWeb: attach SlaveMinerVehicleTrait to the undeployed Slave Miner vehicle
                  // (YASLMN) so it proactively seeks ore and deploys (morphs into YAREFN) like
                  // vanilla YR, and so a manual move onto ore deploys on arrival. Attached when the
                  // vehicle can deploy (DeploysInto=) AND is a SlaveMiner. SlavesNumber may live on
                  // either form in mod data, so check the vehicle itself OR its deploy target.
                  if (n.rules.deploysInto) {
                    var _isSmVeh = !!n.rules.slaveMiner;
                    if (!_isSmVeh)
                      try {
                        var _tgt = i.hasObject(n.rules.deploysInto, c.ObjectType.Building)
                          ? i.getObject(n.rules.deploysInto, c.ObjectType.Building)
                          : null;
                        _isSmVeh = !!(_tgt && _tgt.slaveMiner);
                      } catch (err) {}
                    _isSmVeh &&
                      ((n.slaveMinerVehicleTrait = new SV.SlaveMinerVehicleTrait()),
                      n.traits.add(n.slaveMinerVehicleTrait));
                  }
                  break;
                case c.ObjectType.Aircraft:
                  n = f.Aircraft.factory(t, s, a, i, this.tileOccupation);
                  break;
                case c.ObjectType.Terrain:
                  n = u.Terrain.factory(t, s, a);
                  break;
                case c.ObjectType.Overlay:
                  n = d.Overlay.factory(t, s, a);
                  break;
                case c.ObjectType.Smudge:
                  n = g.Smudge.factory(t, s, a);
                  break;
                case c.ObjectType.Projectile:
                  n = w.Projectile.factory(t, s, a, this.tileOccupation);
                  break;
                case c.ObjectType.Debris:
                  n = z.Debris.factory(t, s, a, this.tileOccupation);
                  break;
                default:
                  throw new Error("Not implemented");
              }
              var o;
              if (
                ((n.id = this.nextObjectId.value++),
                (n.position = new b.ObjectPosition(this.tiles, this.tileOccupation)),
                n.isUnit()
                  ? (n.position.subCell = 0)
                  : n.isBuilding() && n.position.setCenterOffset(n.getFoundationCenterOffset()),
                n.isTechno() &&
                  ((n.rules.primary || n.rules.secondary || n.rules.weaponCount || n.rules.explodes || (n.garrisonTrait && !n.bioReactorPowerTrait)) &&
                    ((n.armedTrait = new k.ArmedTrait(n, i)), n.traits.add(n.armedTrait)),
                  // OpenYRWeb: Gattling escalation. Technos with IsGattling=yes (and WeaponCount>1)
                  // that are NOT gunners (IFV turret swap) advance weapon stage while firing. Gunners
                  // use GunnerTrait (driven by transported passenger ifvMode) instead.
                  n.rules.isGattling &&
                    n.rules.weaponCount > 1 &&
                    !n.rules.gunner &&
                    n.armedTrait &&
                    ((n.gattlingTrait = new GT.GattlingTrait(n)), n.traits.add(n.gattlingTrait)),
                  // OpenYRWeb: Floating Disc (DISCUS) drain. Harvester units that are also armed
                  // (vanilla: the Yuri Floating Disc) get a DrainTrait so attacking a Drainable
                  // OpenYRWeb (2026-06-30, REVERSED): attach DrainTrait to any unit whose primary
                  // or secondary weapon is marked DrainWeapon=yes (vanilla Floating Disc / DISCUS).
                  // REVERSED from yrmd.exe: DrainWeapon is a per-weapon flag; the disc's building-
                  // attack weapon carries it, so when it strikes a Drainable=yes building the
                  // DrainTrait (driven by NotifyAttack/NotifyTick) siphons power/money instead of
                  // dealing damage. The earlier `n.rules.harvester` gate was WRONG — DISCUS is not
                  // Harvester=yes in vanilla, so drain never attached.
                  [n.primaryWeapon, n.secondaryWeapon].some((e) => e?.rules.drainWeapon) &&
                    ((n.drainTrait = new DT.DrainTrait()), n.traits.add(n.drainTrait)),
                  -1 !== n.rules.ammo &&
                    ((o = n.rules.initialAmmo),
                    (n.ammoTrait = new N.AmmoTrait(n.rules.ammo, -1 !== o ? o : void 0)),
                    n.traits.add(n.ammoTrait)),
                  (n.unitOrderTrait = new v.UnitOrderTrait(n)),
                  n.traits.addToFront(n.unitOrderTrait),
                  (n.primaryWeapon || n.secondaryWeapon || (n.garrisonTrait && !n.bioReactorPowerTrait)) &&
                    ((n.attackTrait = new S.AttackTrait(this.tiles, this.tileOccupation)), n.traits.add(n.attackTrait)),
                  (n.isInfantry() || n.isVehicle()) &&
                    n.rules.deployer &&
                    ((n.deployerTrait = new E.DeployerTrait(n)), n.traits.add(n.deployerTrait)),
                  (n.isInfantry() || n.isVehicle()) &&
                    n.rules.canDisguise &&
                    ((n.disguiseTrait = new j.DisguiseTrait()), n.traits.add(n.disguiseTrait)),
                  n.rules.cloakable &&
                    ((n.cloakableTrait = new G.CloakableTrait(n, i.general.cloakDelay)),
                    n.traits.add(n.cloakableTrait)),
                  n.rules.sensors && ((n.sensorsTrait = new $.SensorsTrait()), n.traits.add(n.sensorsTrait)),
                  (n.autoRepairTrait = new P.AutoRepairTrait(!n.isBuilding())),
                  n.traits.add(n.autoRepairTrait),
                  n.rules.trainable &&
                    ((n.veteranTrait = new I.VeteranTrait(n, i.general.veteran)), n.traits.add(n.veteranTrait)),
                  n.rules.selfHealing && n.traits.add(new B.SelfHealingTrait()),
                  (n.invulnerableTrait = new L.InvulnerableTrait()),
                  n.traits.add(n.invulnerableTrait),
                  (n.warpedOutTrait = new D.WarpedOutTrait(n)),
                  n.traits.add(n.warpedOutTrait),
                  (n.temporalTrait = new H.TemporalTrait(n)),
                  n.traits.add(n.temporalTrait),
                  n.rules.bombable &&
                    !n.art.toOverlay &&
                    ((n.tntChargeTrait = new F.TntChargeTrait()), n.traits.add(n.tntChargeTrait)),
                  n.rules.immuneToPsionics ||
                    ((n.mindControllableTrait = new _.MindControllableTrait(n)), n.traits.add(n.mindControllableTrait)),
                  ((e) => {
                    if (e) {
                      // OpenYRWeb: use weapon-level InfiniteMindControl=yes flag for overload
                      // behavior; falls back to unit-level MindControlOverload INI field.
                      var _overload = n.rules.mindControlOverload || e.rules.infiniteMindControl;
                      n.mindControllerTrait = new U.MindControllerTrait(n, e.rules.damage, _overload);
                      n.traits.add(n.mindControllerTrait);
                    }
                  })([n.primaryWeapon, n.secondaryWeapon].find((e) => e?.warhead.rules.mindControl)),
                  n.rules.spawns && ((n.airSpawnTrait = new V.AirSpawnTrait()), n.traits.add(n.airSpawnTrait)),
                  n.rules.maxDebris && n.traits.add(new W.SpawnDebrisTrait())),
                n.isTechno() || n.isOverlay() || n.isTerrain())
              ) {
                var l = n.isOverlay() && O.BridgeOverlayTypes.isBridge(i.getOverlayId(n.name));
                let e = n.rules.strength;
                (!e && n.isTerrain() && (e = i.general.treeStrength),
                  l && (e = i.combatDamage.bridgeStrength),
                  (e || n.isTechno()) &&
                    ((n.healthTrait = new C.HealthTrait(
                      e,
                      n,
                      i.audioVisual.conditionYellow,
                      i.audioVisual.conditionRed,
                    )),
                    n.traits.add(n.healthTrait)),
                  n.isOverlay() &&
                    l &&
                    ((n.bridgeTrait = new x.BridgeTrait(this.bridges)),
                    n.traits.add(n.bridgeTrait),
                    O.BridgeOverlayTypes.getOverlayBridgeType(i.getOverlayId(n.name)) ===
                      O.OverlayBridgeType.Concrete && n.traits.add(new W.SpawnDebrisTrait())));
              }
              return (
                !n.isOverlay() ||
                  (void 0 !== (l = A.OreOverlayTypes.getOverlayTibType(i.getOverlayId(n.name))) &&
                    ((l = i.getTiberium(l)), n.traits.add(new M.TiberiumTrait(n, l)))),
                n.isTerrain() && n.rules.spawnsTiberium && n.traits.add(new R.TiberiumTreeTrait(n.rules)),
                n.cachedTraits.tick.push(...n.traits.filter(q.NotifyTick)),
                n
              );
            }
          }),
        );
      },
    };
  },
);
