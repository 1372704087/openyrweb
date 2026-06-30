// === Reconstructed SystemJS module: gui/screen/game/ObserverUi ===
// deps: ["react","util/disposable/CompositeDisposable","engine/sound/SoundKey","engine/sound/ChannelType","gui/screen/game/worldInteraction/keyboard/KeyCommandType","engine/util/MapPanningHelper","gui/screen/game/component/hud/viewmodel/SidebarModel","game/event/EventType","gui/screen/game/component/hud/viewmodel/CombatantSidebarModel","gui/screen/game/worldInteraction/keyboard/command/CenterViewCmd","gui/screen/game/worldInteraction/keyboard/command/FollowUnitCmd","gui/screen/game/component/hud/commandBar/CommandBarButtonType","gui/screen/mainMenu/main/ReportBug","util/event","gui/screen/game/worldInteraction/keyboard/command/SetCameraLocationCmd","gui/screen/game/worldInteraction/keyboard/command/GoToCameraLocationCmd","gui/screen/game/worldInteraction/keyboard/command/CenterBaseCmd","gui/screen/game/worldInteraction/keyboard/command/SelectPlayerCmd","util/BoxedVar"]
// Note: variable/type names are minified approximations of the original TypeScript.

System.register(
  "gui/screen/game/ObserverUi",
  [
    "react",
    "util/disposable/CompositeDisposable",
    "engine/sound/SoundKey",
    "engine/sound/ChannelType",
    "gui/screen/game/worldInteraction/keyboard/KeyCommandType",
    "engine/util/MapPanningHelper",
    "gui/screen/game/component/hud/viewmodel/SidebarModel",
    "game/event/EventType",
    "gui/screen/game/component/hud/viewmodel/CombatantSidebarModel",
    "gui/screen/game/worldInteraction/keyboard/command/CenterViewCmd",
    "gui/screen/game/worldInteraction/keyboard/command/FollowUnitCmd",
    "gui/screen/game/component/hud/commandBar/CommandBarButtonType",
    "gui/screen/mainMenu/main/ReportBug",
    "util/event",
    "gui/screen/game/worldInteraction/keyboard/command/SetCameraLocationCmd",
    "gui/screen/game/worldInteraction/keyboard/command/GoToCameraLocationCmd",
    "gui/screen/game/worldInteraction/keyboard/command/CenterBaseCmd",
    "gui/screen/game/worldInteraction/keyboard/command/SelectPlayerCmd",
    "util/BoxedVar",
  ],
  function (e, t) {
    "use strict";
    var i, p, r, s, o, l, c, a, m, h, u, n, d, f, g, y, T, v, b, S;
    t && t.id;
    return {
      setters: [
        function (e) {
          i = e;
        },
        function (e) {
          p = e;
        },
        function (e) {
          r = e;
        },
        function (e) {
          s = e;
        },
        function (e) {
          o = e;
        },
        function (e) {
          l = e;
        },
        function (e) {
          c = e;
        },
        function (e) {
          a = e;
        },
        function (e) {
          m = e;
        },
        function (e) {
          h = e;
        },
        function (e) {
          u = e;
        },
        function (e) {
          n = e;
        },
        function (e) {
          d = e;
        },
        function (e) {
          f = e;
        },
        function (e) {
          g = e;
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
      ],
      execute: function () {
        e(
          "ObserverUi",
          (S = class {
            get onPlayerChange() {
              return this._onPlayerChange.asEvent();
            }
            constructor(e, t, i, r, s, a, n, o, l, c, h, u, d, g) {
              ((this.game = e),
                (this.player = t),
                (this.sidebarModel = i),
                (this.replay = r),
                (this.renderer = s),
                (this.worldScene = a),
                (this.sound = n),
                (this.worldInteractionFactory = o),
                (this.gameMenu = l),
                (this.runtimeVars = c),
                (this.strings = h),
                (this.renderableManager = u),
                (this.messageBoxApi = d),
                (this.discordUrl = g),
                (this.disposables = new p.CompositeDisposable()),
                (this._onPlayerChange = new f.EventDispatcher()),
                (this.handleProductionQueueUpdate = (e) => {
                  this.sidebarModel instanceof m.CombatantSidebarModel && this.sidebarModel.updateFromQueue(e);
                }));
            }
            init(e) {
              let t = this.worldInteractionFactory.create();
              ((this.worldInteraction = t),
                t.init(),
                this.disposables.add(t),
                this.initKeyboardCommands(t),
                this.initGameEventListeners(),
                this.initHudEventListeners(e));
            }
            handleHudChange(e) {
              this.initHudEventListeners(e);
            }
            dispose() {
              this.disposables.dispose();
            }
            initGameEventListeners() {
              let e = (e) => {
                  this.sidebarModel instanceof m.CombatantSidebarModel &&
                    e.isTechno() &&
                    e.owner === this.player &&
                    (e.isBuilding() ||
                      Number.isFinite(e.rules.buildLimit) ||
                      (e.isVehicle() && e.transportTrait) ||
                      this.game.rules.general.padAircraft.includes(e.name)) &&
                    this.sidebarModel.updateAvailableObjects(this.game.art);
                },
                t = this.game.getWorld();
              (this.sidebarModel instanceof m.CombatantSidebarModel &&
                this.sidebarModel.updateAvailableObjects(this.game.art),
                t.onObjectSpawned.subscribe(e),
                t.onObjectRemoved.subscribe(e),
                this.disposables.add(
                  () => t.onObjectSpawned.unsubscribe(e),
                  () => t.onObjectRemoved.unsubscribe(e),
                ),
                this.disposables.add(
                  this.game.events.subscribe(a.EventType.BuildingInfiltration, (e) => {
                    e.source.owner === this.player &&
                      this.sidebarModel instanceof m.CombatantSidebarModel &&
                      this.sidebarModel.updateAvailableObjects(this.game.art);
                  }),
                ),
                this.disposables.add(
                  this.game.events.subscribe(a.EventType.ObjectOwnerChange, (e) => {
                    e.target.isBuilding() &&
                      (e.prevOwner === this.player || e.target.owner === this.player) &&
                      this.sidebarModel instanceof m.CombatantSidebarModel &&
                      this.sidebarModel.updateAvailableObjects(this.game.art);
                  }),
                ),
                this.player?.production.onQueueUpdate.subscribe(this.handleProductionQueueUpdate),
                this.disposables.add(() =>
                  this.player?.production.onQueueUpdate.unsubscribe(this.handleProductionQueueUpdate),
                ));
              let i = () => {
                this.sidebarModel instanceof m.CombatantSidebarModel && this.sidebarModel.updateSuperWeapons();
              };
              (this.renderer.onFrame.subscribe(i),
                this.disposables.add(() => this.renderer.onFrame.unsubscribe(i)),
                this.disposables.add(
                  this.game.events.subscribe((e) => {
                    e.type === a.EventType.PowerChange &&
                      e.target === this.player &&
                      ((this.sidebarModel.powerGenerated = e.power), (this.sidebarModel.powerDrained = e.drain));
                  }),
                ));
            }
            changePlayer(e) {
              var t;
              e !== this.player &&
                (this.player?.production.onQueueUpdate.unsubscribe(this.handleProductionQueueUpdate),
                (this.player = e),
                this.player?.production.onQueueUpdate.subscribe(this.handleProductionQueueUpdate),
                (t = this.sidebarModel),
                (this.sidebarModel = e
                  ? new m.CombatantSidebarModel(e, this.game)
                  : new c.SidebarModel(this.game, this.replay)),
                this.sidebarModel instanceof m.CombatantSidebarModel &&
                  this.sidebarModel.updateAvailableObjects(this.game.art),
                this.sidebarModel.selectTab(t.activeTab.id),
                (this.sidebarModel.topTextLeftAlign = t.topTextLeftAlign),
                (t = e ? this.game.mapShroudTrait.getPlayerShroud(e) : void 0),
                this.worldInteraction?.setShroud(t),
                this._onPlayerChange.dispatch(this, { player: e, sidebarModel: this.sidebarModel }));
            }
            initHudEventListeners(e) {
              e.onSidebarTabClick.subscribe(() => {
                this.sound.play(r.SoundKey.GUITabSound, s.ChannelType.Ui);
              });
              let t = this.game.rules.audioVisual.creditTicks;
              (e.onCreditsTick.subscribe((e) => {
                this.sound.play("up" === e ? t[0] : t[1], s.ChannelType.CreditTicks);
              }),
                e.onMessagesTick.subscribe(() => {
                  this.sound.play(r.SoundKey.MessageCharTyped, s.ChannelType.Ui);
                }),
                e.onScrollButtonClick.subscribe((e) => {
                  this.sound.play(e ? r.SoundKey.GenericClick : r.SoundKey.ScoldSound, s.ChannelType.Ui);
                }),
                e.onCommandBarButtonClick.subscribe((e) => {
                  switch (e) {
                    case n.CommandBarButtonType.BugReport:
                      if (!this.discordUrl) break;
                      (this.gameMenu.open(),
                        this.messageBoxApi.show(
                          i.createElement(d.ReportBug, { discordUrl: this.discordUrl, strings: this.strings }),
                          this.strings.get("GUI:OK"),
                        ));
                  }
                }));
            }
            initKeyboardCommands(i) {
              let e = i.unitSelectionHandler;
              i.registerKeyCommand(o.KeyCommandType.Options, () => this.gameMenu.open())
                .registerKeyCommand(o.KeyCommandType.Scoreboard, () => this.gameMenu.openDiplo())
                .registerKeyCommand(o.KeyCommandType.VeterancyNav, () => e.selectByVeterancy())
                .registerKeyCommand(o.KeyCommandType.HealthNav, () => e.selectByHealth())
                .registerKeyCommand(
                  o.KeyCommandType.ToggleFps,
                  () => (this.runtimeVars.fps.value = !this.runtimeVars.fps.value),
                );
              let r = new l.MapPanningHelper(this.game.map),
                s = new b.BoxedVar(this.player);
              ([
                o.KeyCommandType.TeamSelect_1,
                o.KeyCommandType.TeamSelect_2,
                o.KeyCommandType.TeamSelect_3,
                o.KeyCommandType.TeamSelect_4,
                o.KeyCommandType.TeamSelect_5,
                o.KeyCommandType.TeamSelect_6,
                o.KeyCommandType.TeamSelect_7,
                o.KeyCommandType.TeamSelect_8,
                o.KeyCommandType.TeamSelect_9,
                o.KeyCommandType.TeamSelect_10,
              ].forEach((e, t) =>
                i.registerKeyCommand(e, new v.SelectPlayerCmd(t, s, r, this.worldScene.cameraPan, this.game)),
              ),
                s.onChange.subscribe((e) => this.changePlayer(e)),
                new Map([
                  [o.KeyCommandType.StructureTab, c.SidebarCategory.Structures],
                  [o.KeyCommandType.DefenseTab, c.SidebarCategory.Armory],
                  [o.KeyCommandType.InfantryTab, c.SidebarCategory.Infantry],
                  [o.KeyCommandType.UnitTab, c.SidebarCategory.Vehicles],
                ]).forEach((e, t) => {
                  i.registerKeyCommand(t, () => {
                    this.sidebarModel.selectTab(e);
                  });
                }));
              let a = new Map();
              ([
                o.KeyCommandType.SetView1,
                o.KeyCommandType.SetView2,
                o.KeyCommandType.SetView3,
                o.KeyCommandType.SetView4,
              ].forEach((e, t) => {
                i.registerKeyCommand(e, new g.SetCameraLocationCmd(this.worldScene.cameraPan, a, t - 1));
              }),
                [
                  o.KeyCommandType.View1,
                  o.KeyCommandType.View2,
                  o.KeyCommandType.View3,
                  o.KeyCommandType.View4,
                ].forEach((e, t) => {
                  i.registerKeyCommand(e, new y.GoToCameraLocationCmd(this.worldScene.cameraPan, a, t - 1));
                }),
                i.registerKeyCommand(o.KeyCommandType.CenterBase, () => {
                  if (this.player) {
                    let e = new T.CenterBaseCmd(this.player, this.game.rules, r, this.worldScene.cameraPan);
                    e.execute();
                  }
                }));
              var t = new h.CenterViewCmd(e, r, this.worldScene.cameraPan);
              i.registerKeyCommand(o.KeyCommandType.CenterView, t);
              let n = new u.FollowUnitCmd(e, this.renderableManager, i, r, this.worldScene.cameraPan, this.worldScene);
              (n.init(), this.disposables.add(n), i.registerKeyCommand(o.KeyCommandType.Follow, n));
            }
          }),
        );
      },
    };
  },
);
