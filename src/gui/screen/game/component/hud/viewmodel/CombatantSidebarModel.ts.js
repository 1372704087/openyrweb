// === Reconstructed SystemJS module: gui/screen/game/component/hud/viewmodel/CombatantSidebarModel ===
// deps: ["game/rules/TechnoRules","game/player/production/ProductionQueue","engine/type/ObjectType","game/gameobject/trait/DockTrait","gui/screen/game/component/hud/viewmodel/SidebarModel","game/SuperWeapon"]
// Note: variable/type names are minified approximations of the original TypeScript.

System.register(
  "gui/screen/game/component/hud/viewmodel/CombatantSidebarModel",
  [
    "game/rules/TechnoRules",
    "game/player/production/ProductionQueue",
    "engine/type/ObjectType",
    "game/gameobject/trait/DockTrait",
    "gui/screen/game/component/hud/viewmodel/SidebarModel",
    "game/SuperWeapon",
  ],
  function (e, t) {
    "use strict";
    var c, i, h, u, d, r, s, a;
    t && t.id;
    return {
      setters: [
        function (e) {
          c = e;
        },
        function (e) {
          i = e;
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
          r = e;
        },
      ],
      execute: function () {
        ((s = new Map()
          .set(r.SuperWeaponStatus.Charging, d.SidebarItemStatus.Started)
          .set(r.SuperWeaponStatus.Paused, d.SidebarItemStatus.OnHold)
          .set(r.SuperWeaponStatus.Ready, d.SidebarItemStatus.Ready)),
          (a = class extends d.SidebarModel {
            get credits() {
              return Math.floor(this.player.credits);
            }
            get radarEnabled() {
              return !(!this.player.radarTrait || this.player.radarTrait.isDisabled());
            }
            constructor(e, t) {
              (super(t), (this.player = e), (this.rules = t.rules));
            }
            computePurchaseCost(e) {
              return this.game.sellTrait.computePurchaseValue(e, this.player);
            }
            updateAvailableObjects(t) {
              if (!this.player.production) throw new Error("Player is not a combatant");
              var e,
                i,
                r,
                s = this.sortAvailableObjects(this.player.production.getAvailableObjects());
              for (e of this.tabs) ((e.items.length = 0), (e.needsUpdate = !0));
              this.updateSuperWeaponItems();
              for (i of s) {
                var a = t.getObject(i.name, i.type);
                let e = this.tabs[this.getSidebarCategoryForQueueType(this.player.production.getQueueTypeForObject(i))];
                var n = this.player.production.getQueueForObject(i),
                  o = this.player.production.getFactoryTypeForQueueType(n.type),
                  a = {
                    target: { type: d.SidebarItemTargetType.Techno, rules: i },
                    cameo: this.player.production.hasVeteranType(o) && i.trainable ? a.altCameo : a.cameo,
                    disabled: !1,
                    progress: 0,
                    quantity: 0,
                    status: d.SidebarItemStatus.Idle,
                  };
                (e.items.push(a), this.updateSidebarTechnoItem(a, n, this.player.production));
              }
              for (r of this.tabs) this.updateTabFlashing(r);
              this.updateActiveTab();
            }
            updateActiveTab() {
              var e;
              0 !== this.activeTab.items.length ||
                (void 0 !== (e = this.tabs.find((e) => 0 < e.items.length)?.id) && this.selectTab(e));
            }
            updateFromQueue(e) {
              if (!this.player.production) throw new Error("Player is not a combatant");
              let t = this.tabs[this.getSidebarCategoryForQueueType(e.type)];
              t.needsUpdate = !0;
              for (var i of t.items)
                i.target.type === d.SidebarItemTargetType.Techno &&
                  this.player.production.getQueueForObject(i.target.rules) === e &&
                  this.updateSidebarTechnoItem(i, e, this.player.production);
              this.updateTabFlashing(t);
            }
            updateSuperWeapons() {
              (this.updateSuperWeaponItems(), this.updateActiveTab());
            }
            updateSuperWeaponItems() {
              let e = this.player.superWeaponsTrait
                  ?.getAll()
                  .slice()
                  .sort(
                    (e, t) =>
                      1e3 * (e.rules.rechargeTime - t.rules.rechargeTime) + e.name.charCodeAt(0) - t.name.charCodeAt(0),
                  ),
                t = this.tabs[d.SidebarCategory.Armory];
              t.needsUpdate = !0;
              var i = t.items.findIndex((e) => e.target.type === d.SidebarItemTargetType.Techno);
              -1 !== i ? t.items.splice(0, i) : (t.items.length = 0);
              i = e?.map((e) => {
                var t = s.get(e.status);
                if (void 0 === t) throw new Error(`Unhandled super weapon status "${e.status}"`);
                return {
                  target: { type: d.SidebarItemTargetType.Special, rules: e.rules },
                  cameo: e.rules.sidebarImage,
                  disabled: !1,
                  progress: e.getChargeProgress(),
                  quantity: 1,
                  status: t,
                };
              });
              (i && t.items.unshift(...i), this.updateTabFlashing(t));
            }
            updateTabFlashing(e) {
              e.flashing = e.items.some((e) => e.status === d.SidebarItemStatus.Ready);
            }
            updateSidebarTechnoItem(e, t, i) {
              if (e.target.type === d.SidebarItemTargetType.Special)
                throw new Error("Sidebar item must be of type Techno");
              let r = e.target.rules,
                s = [...this.player.buildings],
                a = !1;
              if (Number.isFinite(r.buildLimit)) {
                let e;
                ((e =
                  0 <= r.buildLimit
                    ? (r.type === h.ObjectType.Building ? s : this.player.getOwnedObjectsByType(r.type, !0)).filter(
                        (e) => e.name === r.name,
                      ).length
                    : this.player.getLimitedUnitsBuilt(r.name)),
                  (a = e >= Math.abs(r.buildLimit)));
              }
              this.rules.general.padAircraft.includes(r.name) &&
                ((o = s
                  .filter((e) => e.factoryTrait?.type === c.FactoryType.AircraftType && e.helipadTrait)
                  .reduce((e, t) => e + (t.traits.find(u.DockTrait)?.numberOfDocks ?? 0), 0)),
                (a =
                  a ||
                  [...this.player.getOwnedObjectsByType(h.ObjectType.Aircraft, !0)].filter((e) =>
                    this.rules.general.padAircraft.includes(e.name),
                  ).length >= o));
              let n = i.getFactoryTypeForQueueType(t.type);
              var o = s.filter((e) => e.factoryTrait?.type === n && !e.warpedOutTrait.isActive());
              let l = t.find(r);
              ((e.progress = l.length ? l[0].progress : 0),
                (e.quantity = l.reduce((e, t) => e + t.quantity, 0)),
                (e.status = this.computeStatus(t, l[0])),
                (e.disabled =
                  (1 === t.maxSize && l[0] !== t.getFirst()) ||
                  a ||
                  (!o.length && (!t.currentSize || l[0] !== t.getFirst()))));
            }
            getTabForQueueType(e) {
              return this.tabs[this.getSidebarCategoryForQueueType(e)];
            }
            getSidebarCategoryForQueueType(e) {
              switch (e) {
                case i.QueueType.Structures:
                  return d.SidebarCategory.Structures;
                case i.QueueType.Armory:
                  return d.SidebarCategory.Armory;
                case i.QueueType.Infantry:
                  return d.SidebarCategory.Infantry;
                case i.QueueType.Vehicles:
                case i.QueueType.Ships:
                case i.QueueType.Aircrafts:
                  return d.SidebarCategory.Vehicles;
                default:
                  throw new Error("Unhandled queueType " + i.QueueType[e]);
              }
            }
            computeStatus(e, t) {
              return t
                ? e.getFirst() === t
                  ? e.status === i.QueueStatus.Ready
                    ? d.SidebarItemStatus.Ready
                    : e.status === i.QueueStatus.OnHold
                      ? d.SidebarItemStatus.OnHold
                      : d.SidebarItemStatus.Started
                  : d.SidebarItemStatus.InQueue
                : d.SidebarItemStatus.Idle;
            }
            sortAvailableObjects(e) {
              return [...e].sort((e, t) => {
                var i = this.getObjectTypeSortValue(e),
                  r = this.getObjectTypeSortValue(t);
                return i === r
                  ? e.aiBasePlanningSide === t.aiBasePlanningSide
                    ? e.techLevel === t.techLevel
                      ? e.prerequisite.length < t.prerequisite.length
                        ? -1
                        : 1
                      : e.techLevel < t.techLevel
                        ? -1
                        : 1
                    : (e.aiBasePlanningSide ?? -1) < (t.aiBasePlanningSide ?? -1)
                      ? -1
                      : 1
                  : i - r;
              });
            }
            getObjectTypeSortValue(e) {
              return e.type === h.ObjectType.Aircraft
                ? 1
                : e.type === h.ObjectType.Vehicle
                  ? e.naval
                    ? 2
                    : e.consideredAircraft
                      ? 1
                      : 0
                  : 0;
            }
          }),
          e("CombatantSidebarModel", a));
      },
    };
  },
);
