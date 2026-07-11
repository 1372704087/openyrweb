// === Reconstructed SystemJS module: gui/screen/game/CombatantUi ===
// deps: ["react","gui/screen/game/worldInteraction/PlacementMode","game/action/ActionType","util/disposable/CompositeDisposable","engine/sound/SoundKey","engine/sound/ChannelType","game/order/OrderType","game/action/OrderUnitsAction","gui/screen/game/worldInteraction/keyboard/KeyCommandType","engine/util/MapPanningHelper","gui/screen/game/worldInteraction/keyboard/command/SelectGroupCmd","gui/screen/game/worldInteraction/keyboard/command/CenterGroupCmd","gui/screen/game/component/hud/viewmodel/SidebarModel","game/event/EventType","gui/screen/game/worldInteraction/SellMode","gui/screen/game/worldInteraction/keyboard/command/LastRadarEventCmd","game/player/production/ProductionQueue","engine/type/ObjectType","game/action/UpdateQueueAction","gui/screen/game/worldInteraction/RepairMode","gui/screen/game/worldInteraction/keyboard/KeyCommand","gui/screen/game/worldInteraction/PlanningMode","game/order/OrderFeedbackType","gui/screen/game/worldInteraction/keyboard/command/SelectNextUnitCmd","gui/screen/game/worldInteraction/keyboard/command/SetCameraLocationCmd","gui/screen/game/worldInteraction/keyboard/command/GoToCameraLocationCmd","gui/screen/game/worldInteraction/SpecialActionMode","game/SuperWeapon","gui/screen/game/worldInteraction/keyboard/command/CenterViewCmd","gui/screen/game/worldInteraction/keyboard/command/FollowUnitCmd","gui/screen/game/worldInteraction/PendingPlacementHandler","gui/screen/game/component/hud/commandBar/CommandBarButtonType","gui/screen/game/worldInteraction/BeaconMode","gui/screen/mainMenu/main/ReportBug","gui/screen/game/worldInteraction/keyboard/command/CenterBaseCmd","gui/screen/game/worldInteraction/keyboard/command/SelectTypeByCmd"]
// Note: variable/type names are minified approximations of the original TypeScript.

System.register(
  "gui/screen/game/CombatantUi",
  [
    "react",
    "gui/screen/game/worldInteraction/PlacementMode",
    "game/action/ActionType",
    "util/disposable/CompositeDisposable",
    "engine/sound/SoundKey",
    "engine/sound/ChannelType",
    "game/order/OrderType",
    "game/action/OrderUnitsAction",
    "gui/screen/game/worldInteraction/keyboard/KeyCommandType",
    "engine/util/MapPanningHelper",
    "gui/screen/game/worldInteraction/keyboard/command/SelectGroupCmd",
    "gui/screen/game/worldInteraction/keyboard/command/CenterGroupCmd",
    "gui/screen/game/component/hud/viewmodel/SidebarModel",
    "game/event/EventType",
    "gui/screen/game/worldInteraction/SellMode",
    "gui/screen/game/worldInteraction/keyboard/command/LastRadarEventCmd",
    "game/player/production/ProductionQueue",
    "engine/type/ObjectType",
    "game/action/UpdateQueueAction",
    "gui/screen/game/worldInteraction/RepairMode",
    "gui/screen/game/worldInteraction/keyboard/KeyCommand",
    "gui/screen/game/worldInteraction/PlanningMode",
    "game/order/OrderFeedbackType",
    "gui/screen/game/worldInteraction/keyboard/command/SelectNextUnitCmd",
    "gui/screen/game/worldInteraction/keyboard/command/SetCameraLocationCmd",
    "gui/screen/game/worldInteraction/keyboard/command/GoToCameraLocationCmd",
    "gui/screen/game/worldInteraction/SpecialActionMode",
    "game/SuperWeapon",
    "gui/screen/game/worldInteraction/keyboard/command/CenterViewCmd",
    "gui/screen/game/worldInteraction/keyboard/command/FollowUnitCmd",
    "gui/screen/game/worldInteraction/PendingPlacementHandler",
    "gui/screen/game/component/hud/commandBar/CommandBarButtonType",
    "gui/screen/game/worldInteraction/BeaconMode",
    "gui/screen/mainMenu/main/ReportBug",
    "gui/screen/game/worldInteraction/keyboard/command/CenterBaseCmd",
    "gui/screen/game/worldInteraction/keyboard/command/SelectTypeByCmd",
  ],
  function (e, t) {
    "use strict";
    var l, c, p, C, m, f, y, h, T, v, b, S, w, r, u, E, x, O, d, g, A, M, R, P, I, k, i, B, N, j, L, D, F, _, U, H, s;
    t && t.id;
    return {
      setters: [
        function (e) {
          l = e;
        },
        function (e) {
          c = e;
        },
        function (e) {
          p = e;
        },
        function (e) {
          C = e;
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
          h = e;
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
          r = e;
        },
        function (e) {
          u = e;
        },
        function (e) {
          E = e;
        },
        function (e) {
          x = e;
        },
        function (e) {
          O = e;
        },
        function (e) {
          d = e;
        },
        function (e) {
          g = e;
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
          i = e;
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
      ],
      execute: function () {
        e(
          "CombatantUi",
          (s = class {
            constructor(e, t, i, r, s, a, n, o, l, c, h, u, d, g, p, m, f, y, T, v, b, S, w, E) {
              ((this.game = e),
                (this.player = t),
                (this.isSinglePlayer = i),
                (this.actionQueue = r),
                (this.actionFactory = s),
                (this.sidebarModel = a),
                (this.renderer = n),
                (this.worldScene = o),
                (this.soundHandler = l),
                (this.messageList = c),
                (this.sound = h),
                (this.eva = u),
                (this.worldInteractionFactory = d),
                (this.gameMenu = g),
                (this.pointer = p),
                (this.runtimeVars = m),
                (this.speedCheat = f),
                (this.strings = y),
                (this.tauntHandler = T),
                (this.renderableManager = v),
                (this.superWeaponFxHandler = b),
                (this.beaconFxHandler = S),
                (this.messageBoxApi = w),
                (this.discordUrl = E),
                (this.disposables = new C.CompositeDisposable()));
            }
            init(e) {
              let r = this.game.getUnitSelection(),
                t = c.PlacementMode.factory(this.game, this.player, this.renderer, this.worldScene, this.eva);
              ((this.placementMode = t), this.disposables.add(t));
              let s = L.PendingPlacementHandler.factory(this.game, this.player, this.renderer, this.worldScene);
              (s.init(),
                this.disposables.add(s),
                t.onBuildingPlaceRequest.subscribe(({ rules: t, tile: i }) => {
                  (s.pushPlacementInfo({ rules: t, tile: i }),
                    this.pushAction(p.ActionType.PlaceBuilding, (e) => {
                      ((e.buildingRules = t), (e.tile = { x: i.rx, y: i.ry }));
                    }));
                }));
              let i = u.SellMode.factory(this.game, this.player, this.sidebarModel, this.pointer, this.renderer);
              ((this.sellMode = i),
                this.disposables.add(i),
                i.onExecute.subscribe((t) => {
                  this.pushAction(p.ActionType.SellObject, (e) => {
                    e.objectId = t.id;
                  });
                }));
              let a = g.RepairMode.factory(this.game, this.player, this.sidebarModel, this.pointer, this.renderer);
              ((this.repairMode = a), this.disposables.add(a));
              let n = F.BeaconMode.factory(this.pointer, this.renderer);
              ((this.beaconMode = n),
                this.disposables.add(n),
                a.onExecute.subscribe((t) => {
                  (this.pushAction(p.ActionType.ToggleRepair, (e) => {
                    e.buildingId = t.id;
                  }),
                    this.sound.play(m.SoundKey.GenericClick, f.ChannelType.Ui));
                }),
                n.onExecute.subscribe((e) => this.handleBeacon(e)));
              let o = this.worldInteractionFactory.create();
              ((this.worldInteraction = o), o.init(), this.disposables.add(o));
              let l = new M.PlanningMode(
                this.player,
                this.messageList,
                this.sound,
                this.strings,
                this.worldScene,
                r,
                o.unitSelectionHandler,
                this.renderer,
                o.targetLines,
                this.game.rules.general.maxWaypointPathLength,
              );
              ((this.planningMode = l),
                this.disposables.add(l),
                this.disposables.add(() => this.specialMode?.dispose()),
                t.init(),
                this.initKeyboardCommands(o),
                this.initGameEventListeners(),
                this.initGameMenuListeners(),
                this.initHudEventListeners(e, i, a, n, o),
                (this.lastSelectionHash = r.getHash()),
                o.unitSelectionHandler.onUserSelectionChange.subscribe((e) => {
                  if (l.isActive()) {
                    var t = l.updateSelection(e.selection);
                    if (t) for (var i of t) r.addToSelection(i);
                  }
                  ((this.lastSelectionHash = r.getHash()),
                    this.pushAction(p.ActionType.SelectUnits, (e) => {
                      e.unitIds = r.getSelectedUnits().map((e) => e.id);
                    }));
                }),
                o.unitSelectionHandler.onUserSelectionUpdate.subscribe((e) =>
                  this.soundHandler.handleSelectionChangeEvent(e),
                ),
                o.defaultActionHandler.onOrder.subscribe(
                  ({ orderType: e, terminal: t, feedbackType: i, feedbackUnit: r, target: s }) => {
                    l.isActive() ? l.pushOrder(e, s, t) : this.pushOrder(e, s, i, r);
                  },
                ));
            }
            handleHudChange(e) {
              this.worldInteraction &&
                this.initHudEventListeners(e, this.sellMode, this.repairMode, this.beaconMode, this.worldInteraction);
            }
            dispose() {
              this.disposables.dispose();
            }
            initGameEventListeners() {
              let e = (e) => {
                  e.isTechno() &&
                    e.owner === this.player &&
                    (e.isBuilding() ||
                      Number.isFinite(e.rules.buildLimit) ||
                      (e.isVehicle() && e.transportTrait) ||
                      this.game.rules.general.padAircraft.includes(e.name)) &&
                    (this.sidebarModel.updateAvailableObjects(this.game.art),
                    this.soundHandler.handleAvailableObjectsUpdate(this.player.production.getAvailableObjects()));
                },
                t = this.game.getWorld();
              (this.sidebarModel.updateAvailableObjects(this.game.art),
                t.onObjectSpawned.subscribe(e),
                t.onObjectRemoved.subscribe(e),
                this.disposables.add(
                  () => t.onObjectSpawned.unsubscribe(e),
                  () => t.onObjectRemoved.unsubscribe(e),
                ),
                this.disposables.add(
                  this.game.events.subscribe(r.EventType.BuildingInfiltration, (e) => {
                    e.source.owner === this.player && this.sidebarModel.updateAvailableObjects(this.game.art);
                  }),
                ),
                this.disposables.add(
                  this.game.events.subscribe(r.EventType.ObjectOwnerChange, (e) => {
                    !e.target.isBuilding() ||
                      (e.prevOwner !== this.player && e.target.owner !== this.player) ||
                      (this.sidebarModel.updateAvailableObjects(this.game.art),
                      this.soundHandler.handleAvailableObjectsUpdate(this.player.production.getAvailableObjects()));
                  }),
                ),
                this.player.production.onQueueUpdate.subscribe((e) => {
                  this.sidebarModel.updateFromQueue(e);
                  var t = this.placementMode.getBuilding();
                  (t &&
                    !this.player.production.getQueueForObject(t).find(t).length &&
                    this.worldInteraction.setMode(void 0),
                    this.soundHandler.handleProductionQueueUpdate(e));
                }));
              let i = () => {
                (this.sidebarModel.updateSuperWeapons(),
                  this.specialMode &&
                    this.worldInteraction.getMode() === this.specialMode &&
                    !this.player.superWeaponsTrait
                      .getAll()
                      .find((e) => e.rules.type === this.specialMode.superWeaponType) &&
                    (this.worldInteraction.setMode(void 0), this.specialMode.dispose(), (this.specialMode = void 0)));
              };
              (this.renderer.onFrame.subscribe(i),
                this.disposables.add(() => this.renderer.onFrame.unsubscribe(i)),
                this.disposables.add(
                  this.game.events.subscribe((e) => {
                    e.type === r.EventType.PowerChange &&
                      e.target === this.player &&
                      ((this.sidebarModel.powerGenerated = e.power), (this.sidebarModel.powerDrained = e.drain));
                  }),
                ));
            }
            initGameMenuListeners() {
              const e = (t, i) => {
                this.pushAction(p.ActionType.ToggleAlliance, (e) => {
                  ((e.toPlayer = i), (e.toggle = t));
                });
              };
              (this.gameMenu.onToggleAlliance.subscribe(e),
                this.disposables.add(() => this.gameMenu.onToggleAlliance.unsubscribe(e)));
            }
            initHudEventListeners(e, t, i, r, s) {
              (e.onSidebarSlotClick.subscribe((e) => this.handleSidebarSlotClick(e)),
                e.onSidebarTabClick.subscribe(() => {
                  this.sound.play(m.SoundKey.GUITabSound, f.ChannelType.Ui);
                }),
                e.onRepairButtonClick.subscribe(() => {
                  s.isEnabled() &&
                    (this.sidebarModel.repairMode ? s.setMode(void 0) : s.setMode(i),
                    this.sound.play(m.SoundKey.GenericClick, f.ChannelType.Ui));
                }),
                e.onSellButtonClick.subscribe(() => {
                  s.isEnabled() &&
                    (this.sidebarModel.sellMode ? s.setMode(void 0) : s.setMode(t),
                    this.sound.play(m.SoundKey.GenericClick, f.ChannelType.Ui));
                }));
              let a = this.game.rules.audioVisual.creditTicks;
              (e.onCreditsTick.subscribe((e) => {
                this.sound.play("up" === e ? a[0] : a[1], f.ChannelType.CreditTicks);
              }),
                e.onMessagesTick.subscribe(() => {
                  this.sound.play(m.SoundKey.MessageCharTyped, f.ChannelType.Ui);
                }),
                e.onScrollButtonClick.subscribe((e) => {
                  this.sound.play(e ? m.SoundKey.GenericClick : m.SoundKey.ScoldSound, f.ChannelType.Ui);
                }));
              let n = !1,
                o = s.unitSelectionHandler;
              e.onCommandBarButtonClick.subscribe((e) => {
                switch (e) {
                  case D.CommandBarButtonType.BugReport:
                    if (!this.discordUrl) break;
                    (this.gameMenu.open(),
                      this.messageBoxApi.show(
                        l.createElement(_.ReportBug, { discordUrl: this.discordUrl, strings: this.strings }),
                        this.strings.get("GUI:OK"),
                      ));
                    break;
                  case D.CommandBarButtonType.Beacon:
                    s.getMode() !== r && s.setMode(r);
                    break;
                  case D.CommandBarButtonType.Cheer:
                    this.pushOrder(y.OrderType.Cheer, void 0);
                    break;
                  case D.CommandBarButtonType.Deploy:
                    this.handleDeploy();
                    break;
                  case D.CommandBarButtonType.Guard:
                    this.handleGuard();
                    break;
                  case D.CommandBarButtonType.PlanningMode:
                    var t;
                    this.planningMode.isActive()
                      ? ((t = this.planningMode.exit()),
                        this.sound.play(m.SoundKey.EndPlanningModeSound, f.ChannelType.Ui),
                        this.queueOrders(t),
                        n ||
                          (this.messageList.addUiFeedbackMessage(this.strings.get("MSG:PlanningModeIntro3")), (n = !0)))
                      : (this.planningMode.enter(),
                        this.planningMode.updateSelection(s.unitSelectionHandler.getSelectedUnits()),
                        this.sound.play(m.SoundKey.StartPlanningModeSound, f.ChannelType.Ui),
                        n || this.messageList.addUiFeedbackMessage(this.strings.get("MSG:PlanningModeIntro1Button")));
                    break;
                  case D.CommandBarButtonType.Stop:
                    this.handleStop();
                    break;
                  case D.CommandBarButtonType.Team01:
                    this.handleCommandBarTeam(1, o);
                    break;
                  case D.CommandBarButtonType.Team02:
                    this.handleCommandBarTeam(2, o);
                    break;
                  case D.CommandBarButtonType.Team03:
                    this.handleCommandBarTeam(3, o);
                    break;
                  case D.CommandBarButtonType.TypeSelect:
                    o.selectByType();
                    break;
                  default:
                    console.warn("Unhandled command type " + e);
                }
              });
            }
            handleSidebarSlotClick(s) {
              if (this.worldInteraction.isEnabled())
                if (
                  (s =
                    s.isTouch && 0 === s.button && s.touchDuration && 300 < s.touchDuration
                      ? { ...s, shiftKey: !0, button: 2 }
                      : s).target.type !== w.SidebarItemTargetType.Special
                ) {
                  const o = s.target.rules;
                  let r = this.player.production.getQueueForObject(o),
                    e = r.find(o);
                  var a = e.reduce((e, t) => e + t.quantity, 0);
                  let t = !1;
                  if (0 === s.button)
                    if (r.status === x.QueueStatus.Ready && o.type === O.ObjectType.Building)
                      e[0] === r.getFirst()
                        ? (this.placementMode.setBuilding(o), this.worldInteraction.setMode(this.placementMode))
                        : this.eva.play("EVA_UnableToComply");
                    else if (r.status === x.QueueStatus.OnHold && e[0] === r.getFirst())
                      this.pushAction(p.ActionType.UpdateQueue, (e) => {
                        ((e.queueType = r.type), (e.updateType = d.UpdateType.Resume));
                      });
                    else {
                      var n = Math.min(r.maxSize - r.currentSize, r.maxItemQuantity - a);
                      let i = Math.min(s.shiftKey ? 5 : 1, n);
                      if (i <= 0)
                        o.type === O.ObjectType.Building
                          ? this.eva.play("EVA_UnableToComply")
                          : ((t = !0), this.sound.play(m.SoundKey.ScoldSound, f.ChannelType.Ui));
                      else {
                        let t = this.worldInteraction.getLastKeyModifiers()?.ctrlKey ?? !1;
                        this.pushAction(p.ActionType.UpdateQueue, (e) => {
                          ((e.queueType = r.type),
                            (e.updateType = t ? d.UpdateType.AddNext : d.UpdateType.Add),
                            (e.item = o),
                            (e.quantity = i));
                        });
                      }
                    }
                  else {
                    if (2 !== s.button) return;
                    if (r.status === x.QueueStatus.Active && e[0] === r.getFirst())
                      this.pushAction(p.ActionType.UpdateQueue, (e) => {
                        ((e.queueType = r.type), (e.updateType = d.UpdateType.Pause));
                      });
                    else if (
                      e.length &&
                      [x.QueueStatus.Ready, x.QueueStatus.OnHold, x.QueueStatus.Active].includes(r.status)
                    ) {
                      let t = Math.min(a, s.shiftKey ? Number.POSITIVE_INFINITY : 1);
                      0 < t &&
                        (this.pushAction(p.ActionType.UpdateQueue, (e) => {
                          ((e.queueType = r.type),
                            (e.updateType = d.UpdateType.Cancel),
                            (e.item = o),
                            (e.quantity = t));
                        }),
                        this.eva.play("EVA_Canceled"));
                    } else t = !0;
                  }
                  t || this.sound.play(m.SoundKey.GenericClick, f.ChannelType.Ui);
                } else if (0 === s.button) {
                  if (
                    (this.sound.play(m.SoundKey.GenericClick, f.ChannelType.Ui),
                    this.player.superWeaponsTrait?.getAll().find((e) => e.rules === s.target.rules)?.status !==
                      B.SuperWeaponStatus.Ready)
                  )
                    return;
                  void 0 !== s.target.rules.type && this.activateSpecialMode(s.target.rules);
                }
            }
            pushOrder(t, i, e = R.OrderFeedbackType.None, r = void 0) {
              let s = this.game.getUnitSelection();
              var a = s.getHash();
              let n = s.getSelectedUnits(),
                o = this.actionQueue.getLast();
              if (
                o &&
                o instanceof h.OrderUnitsAction &&
                o.orderType === t &&
                !o.queue &&
                a === this.lastSelectionHash
              ) {
                if (!o.target || !i || o.target.equals(i)) return;
                this.actionQueue.dequeueLast();
              }
              (a !== this.lastSelectionHash &&
                ((this.lastSelectionHash = a),
                this.pushAction(p.ActionType.SelectUnits, (e) => {
                  e.unitIds = n.map((e) => e.id);
                })),
                this.pushAction(p.ActionType.OrderUnits, (e) => {
                  ((e.orderType = t), (e.target = i));
                }),
                this.soundHandler.handleOrderPushed(r || n[0], t, e));
            }
            queueOrders(e) {
              if (e.length) {
                for (let i of e) {
                  this.pushAction(p.ActionType.SelectUnits, (e) => {
                    e.unitIds = [...i.units].map((e) => e.id);
                  });
                  for (let t of i.waypoints)
                    this.pushAction(p.ActionType.OrderUnits, (e) => {
                      ((e.orderType = t.orderType), (e.target = t.target), (e.queue = !0));
                    });
                }
                this.pushAction(p.ActionType.SelectUnits, (e) => {
                  e.unitIds = this.worldInteraction.unitSelectionHandler.getSelectedUnits().map((e) => e.id);
                });
              }
            }
            pushAction(e, t) {
              var i = this.actionFactory.create(e);
              (t?.(i), this.actionQueue.push(i));
            }
            activateSpecialMode(r) {
              this.specialMode?.dispose();
              let e = (this.specialMode = i.SpecialActionMode.factory(
                this.game.rules.superWeaponRules,
                r,
                this.superWeaponFxHandler,
                this.pointer,
                this.eva,
              ));
              (e.onExecute.subscribe(({ tile: t, tile2: i }) => {
                this.pushAction(p.ActionType.ActivateSuperWeapon, (e) => {
                  ((e.superWeaponType = r.type),
                    (e.tile = { x: t.rx, y: t.ry }),
                    i && (e.tile2 = { x: i.rx, y: i.ry }));
                });
              }),
                this.worldInteraction.setMode(e));
            }
            initKeyboardCommands(r) {
              let i = r.unitSelectionHandler,
                e = new H.SelectByTypeCmd(i);
              (e.init(),
                this.disposables.add(e),
                r
                  .registerKeyCommand(T.KeyCommandType.Options, () => this.gameMenu.open())
                  .registerKeyCommand(T.KeyCommandType.Scoreboard, () => this.gameMenu.openDiplo())
                  .registerKeyCommand(T.KeyCommandType.DeployObject, () => this.handleDeploy())
                  .registerKeyCommand(T.KeyCommandType.UnloadGarrison, () => this.handleUnloadAll())
                  .registerKeyCommand(T.KeyCommandType.StopObject, () => this.handleStop())
                  .registerKeyCommand(T.KeyCommandType.GuardObject, () => this.handleGuard())
                  .registerKeyCommand(T.KeyCommandType.AllToCheer, () => this.pushOrder(y.OrderType.Cheer, void 0))
                  .registerKeyCommand(T.KeyCommandType.TypeSelect, e)
                  .registerKeyCommand(T.KeyCommandType.CombatantSelect, () => i.selectCombatants())
                  .registerKeyCommand(T.KeyCommandType.VeterancyNav, () => i.selectByVeterancy())
                  .registerKeyCommand(T.KeyCommandType.HealthNav, () => i.selectByHealth()),
                [
                  T.KeyCommandType.TeamCreate_1,
                  T.KeyCommandType.TeamCreate_2,
                  T.KeyCommandType.TeamCreate_3,
                  T.KeyCommandType.TeamCreate_4,
                  T.KeyCommandType.TeamCreate_5,
                  T.KeyCommandType.TeamCreate_6,
                  T.KeyCommandType.TeamCreate_7,
                  T.KeyCommandType.TeamCreate_8,
                  T.KeyCommandType.TeamCreate_9,
                  T.KeyCommandType.TeamCreate_10,
                ].forEach((e, t) => r.registerKeyCommand(e, () => i.createGroup((t + 1) % 10))),
                [
                  T.KeyCommandType.TeamAddSelect_1,
                  T.KeyCommandType.TeamAddSelect_2,
                  T.KeyCommandType.TeamAddSelect_3,
                  T.KeyCommandType.TeamAddSelect_4,
                  T.KeyCommandType.TeamAddSelect_5,
                  T.KeyCommandType.TeamAddSelect_6,
                  T.KeyCommandType.TeamAddSelect_7,
                  T.KeyCommandType.TeamAddSelect_8,
                  T.KeyCommandType.TeamAddSelect_9,
                  T.KeyCommandType.TeamAddSelect_10,
                ].forEach((e, t) => r.registerKeyCommand(e, () => i.addGroupToSelection((t + 1) % 10))));
              let s = new v.MapPanningHelper(this.game.map);
              ([
                T.KeyCommandType.TeamSelect_1,
                T.KeyCommandType.TeamSelect_2,
                T.KeyCommandType.TeamSelect_3,
                T.KeyCommandType.TeamSelect_4,
                T.KeyCommandType.TeamSelect_5,
                T.KeyCommandType.TeamSelect_6,
                T.KeyCommandType.TeamSelect_7,
                T.KeyCommandType.TeamSelect_8,
                T.KeyCommandType.TeamSelect_9,
                T.KeyCommandType.TeamSelect_10,
              ].forEach((e, t) =>
                r.registerKeyCommand(
                  e,
                  new b.SelectGroupCmd((t + 1) % 10, i, r.targetLines, s, this.worldScene.cameraPan),
                ),
              ),
                [
                  T.KeyCommandType.TeamCenter_1,
                  T.KeyCommandType.TeamCenter_2,
                  T.KeyCommandType.TeamCenter_3,
                  T.KeyCommandType.TeamCenter_4,
                  T.KeyCommandType.TeamCenter_5,
                  T.KeyCommandType.TeamCenter_6,
                  T.KeyCommandType.TeamCenter_7,
                  T.KeyCommandType.TeamCenter_8,
                  T.KeyCommandType.TeamCenter_9,
                  T.KeyCommandType.TeamCenter_10,
                ].forEach((e, t) =>
                  r.registerKeyCommand(e, new S.CenterGroupCmd((t + 1) % 10, i, s, this.worldScene.cameraPan)),
                ),
                new Map([
                  [T.KeyCommandType.StructureTab, w.SidebarCategory.Structures],
                  [T.KeyCommandType.DefenseTab, w.SidebarCategory.Armory],
                  [T.KeyCommandType.InfantryTab, w.SidebarCategory.Infantry],
                  [T.KeyCommandType.UnitTab, w.SidebarCategory.Vehicles],
                ]).forEach((i, e) => {
                  r.registerKeyCommand(e, () => {
                    var e;
                    this.sidebarModel.selectTab(i);
                    for (e of this.player.production.getAllQueues().filter((e) => e.status === x.QueueStatus.Ready)) {
                      var t = this.sidebarModel.getTabForQueueType(e.type);
                      if (i === t.id && e.getFirst().rules.type === O.ObjectType.Building) {
                        (this.placementMode.setBuilding(e.getFirst().rules), r.setMode(this.placementMode));
                        break;
                      }
                    }
                  });
                }),
                r.registerKeyCommand(
                  T.KeyCommandType.CenterBase,
                  new U.CenterBaseCmd(this.player, this.game.rules, s, this.worldScene.cameraPan),
                ),
                r.registerKeyCommand(T.KeyCommandType.ToggleSell, () => {
                  this.sidebarModel.sellMode ? r.setMode(void 0) : r.setMode(this.sellMode);
                }),
                r.registerKeyCommand(T.KeyCommandType.ToggleRepair, () => {
                  this.sidebarModel.repairMode ? r.setMode(void 0) : r.setMode(this.repairMode);
                }));
              let t = new E.LastRadarEventCmd(this.player, s, this.worldScene.cameraPan);
              (r.registerKeyCommand(T.KeyCommandType.CenterOnRadarEvent, t),
                this.disposables.add(this.game.events.subscribe((e) => t.handleGameEvent(e))));
              let a = () => {
                this.runtimeVars.cheatsEnabled.value
                  ? r
                      .registerKeyCommand(
                        T.KeyCommandType.BuildCheat,
                        () => (this.speedCheat.value = !this.speedCheat.value),
                      )
                      .registerKeyCommand(T.KeyCommandType.FreeMoney, () => (this.player.credits += 1e4))
                      .registerKeyCommand(T.KeyCommandType.ToggleShroud, () =>
                        this.game.mapShroudTrait.revealMap(this.player, this.game),
                      )
                  : (r
                      .unregisterKeyCommand(T.KeyCommandType.BuildCheat)
                      .unregisterKeyCommand(T.KeyCommandType.FreeMoney)
                      .unregisterKeyCommand(T.KeyCommandType.ToggleShroud),
                    (this.speedCheat.value = !1));
              };
              (a(),
                this.runtimeVars.cheatsEnabled.onChange.subscribe(a),
                this.disposables.add(() => this.runtimeVars.cheatsEnabled.onChange.unsubscribe(a)),
                r.registerKeyCommand(
                  T.KeyCommandType.ToggleFps,
                  () => (this.runtimeVars.fps.value = !this.runtimeVars.fps.value),
                ),
                r.registerKeyCommand(T.KeyCommandType.ToggleAlliance, () => {
                  var e = this.game.rules.mpDialogSettings;
                  if (e.alliesAllowed && e.allyChangeAllowed) {
                    let t = i.getSelectedUnits()[0]?.owner;
                    t &&
                      t !== this.player &&
                      this.game.alliances.canRequestAlliance(t) &&
                      this.pushAction(p.ActionType.ToggleAlliance, (e) => {
                        ((e.toPlayer = t), (e.toggle = !this.game.alliances.areAllied(this.player, t)));
                      });
                  }
                }));
              let n = !1;
              (r.registerKeyCommand(T.KeyCommandType.PlanningMode, {
                triggerMode: A.TriggerMode.KeyDownUp,
                execute: (e) => {
                  var t;
                  e
                    ? ((t = this.planningMode.exit()),
                      this.sound.play(m.SoundKey.EndPlanningModeSound, f.ChannelType.Ui),
                      this.queueOrders(t),
                      n ||
                        (this.messageList.addUiFeedbackMessage(this.strings.get("MSG:PlanningModeIntro3")), (n = !0)))
                    : (this.planningMode.enter(),
                      this.planningMode.updateSelection(r.unitSelectionHandler.getSelectedUnits()),
                      this.sound.play(m.SoundKey.StartPlanningModeSound, f.ChannelType.Ui),
                      n || this.messageList.addUiFeedbackMessage(this.strings.get("MSG:PlanningModeIntro1Key")));
                },
              }),
                r.registerKeyCommand(T.KeyCommandType.ScatterObject, () => {
                  this.planningMode.isActive()
                    ? this.handleInvalidCommand(this.strings.get("MSG:PlanningModeNoScatter"))
                    : this.pushOrder(y.OrderType.Scatter, void 0);
                }));
              let o = new P.SelectNextUnitCmd(i, s, this.worldScene.cameraPan, this.player, this.game.getWorld());
              (r.registerKeyCommand(T.KeyCommandType.NextObject, () => {
                (o.setReverse(!1), o.execute());
              }),
                r.registerKeyCommand(T.KeyCommandType.PreviousObject, () => {
                  (o.setReverse(!0), o.execute());
                }),
                this.disposables.add(o));
              var l = this.game.map.startingLocations[this.player.startLocation],
                l = this.game.map.tiles.getByMapCoords(l.x, l.y);
              let c = s.computeCameraPanFromTile(l.rx, l.ry),
                h = new Map();
              ([
                T.KeyCommandType.SetView1,
                T.KeyCommandType.SetView2,
                T.KeyCommandType.SetView3,
                T.KeyCommandType.SetView4,
              ].forEach((e, t) => {
                r.registerKeyCommand(e, new I.SetCameraLocationCmd(this.worldScene.cameraPan, h, t - 1));
              }),
                [
                  T.KeyCommandType.View1,
                  T.KeyCommandType.View2,
                  T.KeyCommandType.View3,
                  T.KeyCommandType.View4,
                ].forEach((e, t) => {
                  r.registerKeyCommand(e, new k.GoToCameraLocationCmd(this.worldScene.cameraPan, h, t - 1, c));
                }),
                [
                  T.KeyCommandType.Taunt_1,
                  T.KeyCommandType.Taunt_2,
                  T.KeyCommandType.Taunt_3,
                  T.KeyCommandType.Taunt_4,
                  T.KeyCommandType.Taunt_5,
                  T.KeyCommandType.Taunt_6,
                  T.KeyCommandType.Taunt_7,
                  T.KeyCommandType.Taunt_8,
                ].forEach((e, t) => {
                  r.registerKeyCommand(e, () => this.tauntHandler?.sendTaunt(t + 1));
                }),
                r.registerKeyCommand(T.KeyCommandType.PlaceBeacon, () => {
                  r.getMode() !== this.beaconMode && r.setMode(this.beaconMode);
                }));
              l = new N.CenterViewCmd(i, s, this.worldScene.cameraPan);
              r.registerKeyCommand(T.KeyCommandType.CenterView, l);
              let u = new j.FollowUnitCmd(i, this.renderableManager, r, s, this.worldScene.cameraPan, this.worldScene);
              (u.init(), this.disposables.add(u), r.registerKeyCommand(T.KeyCommandType.Follow, u));
              let d = () => this.sound.play(m.SoundKey.SystemError, f.ChannelType.Ui),
                g = [T.KeyCommandType.PageUser, T.KeyCommandType.ScreenCapture];
              g.forEach((e) => r.registerKeyCommand(e, d));
            }
            handleDeploy() {
              this.planningMode.isActive()
                ? this.handleInvalidCommand(this.strings.get("MSG:PlanningModeNoDeploy"))
                : this.pushOrder(y.OrderType.DeploySelected, void 0);
            }
            // OpenYRWeb: Unload all garrisoned infantry from selected bio reactors (LIFO drain).
            handleUnloadAll() {
              if (this.planningMode.isActive()) {
                this.handleInvalidCommand(this.strings.get("MSG:PlanningModeNoDeploy"));
                return;
              }
              this.pushOrder(y.OrderType.UnloadAll, void 0);
            }
            handleStop() {
              this.planningMode.isActive()
                ? this.handleInvalidCommand(this.strings.get("MSG:PlanningModeNoStop"))
                : this.pushOrder(y.OrderType.Stop, void 0);
            }
            handleGuard() {
              this.planningMode.isActive()
                ? this.handleInvalidCommand(this.strings.get("MSG:PlanningModeNoGuardArea"))
                : this.pushOrder(y.OrderType.Guard, void 0);
            }
            handleBeacon(t) {
              this.isSinglePlayer ||
                (this.beaconFxHandler.canPingLocation(this.player, t) &&
                  this.pushAction(p.ActionType.PingLocation, (e) => {
                    e.tile = { x: t.rx, y: t.ry };
                  }));
            }
            handleCommandBarTeam(t, i) {
              let r = i.getGroupUnits(t);
              if (r.length)
                if (i.getSelectedUnits().some((e) => r.includes(e))) {
                  let e = new S.CenterGroupCmd(t, i, new v.MapPanningHelper(this.game.map), this.worldScene.cameraPan);
                  e.execute();
                } else i.selectGroup(t);
              else i.createGroup(t);
            }
            handleInvalidCommand(e) {
              (this.sound.play(m.SoundKey.ScoldSound, f.ChannelType.Ui), this.messageList.addUiFeedbackMessage(e));
            }
          }),
        );
      },
    };
  },
);
