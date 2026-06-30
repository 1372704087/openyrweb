// === Reconstructed SystemJS module: network/gamestate/LockstepManager ===
// deps: ["data/DataStream","game/action/NoAction","game/Game","util/event","network/gservConfig","game/GameSpeed","network/gamestate/lockstepUtil"]
// Note: variable/type names are minified approximations of the original TypeScript.

System.register(
  "network/gamestate/LockstepManager",
  [
    "data/DataStream",
    "game/action/NoAction",
    "game/Game",
    "util/event",
    "network/gservConfig",
    "game/GameSpeed",
    "network/gamestate/lockstepUtil",
  ],
  function (e, t) {
    "use strict";
    var g, i, r, p, s, a, n, o;
    t && t.id;
    return {
      setters: [
        function (e) {
          g = e;
        },
        function (e) {
          i = e;
        },
        function (e) {
          r = e;
        },
        function (e) {
          p = e;
        },
        function (e) {
          s = e;
        },
        function (e) {
          a = e;
        },
        function (e) {
          n = e;
        },
      ],
      execute: function () {
        (e(
          "LockstepManager",
          (o = class o {
            get onLagStateChange() {
              return this._onLagStateChange.asEvent();
            }
            get onActionsSent() {
              return this._onActionsSent.asEvent();
            }
            get onActionsProcessed() {
              return this._onActionsProcessed.asEvent();
            }
            get onActionsReceived() {
              return this._onActionsReceived.asEvent();
            }
            constructor(e, t, i, r, s, a, n, o, l, c, h, u, d) {
              ((this.game = e),
                (this.gservCon = t),
                (this.gameoptParser = i),
                (this.gameoptSerializer = r),
                (this.actionSerializer = s),
                (this.actionFactory = a),
                (this.inputActions = n),
                (this.onDesync = o),
                (this.actionLogger = l),
                (this.netLogger = c),
                (this.debugLogger = h),
                (this.replayRecorder = u),
                (this.debugGameState = d),
                (this.debugGameStateHistory = []),
                (this.queuedRateChanges = []),
                (this.errorState = !1),
                (this.passiveMode = !1),
                (this.receivedActions = new Map()),
                (this.receivedNetworkTurn = 0),
                (this.lagState = !1),
                (this._onLagStateChange = new p.EventDispatcher()),
                (this._onActionsSent = new p.EventDispatcher()),
                (this._onActionsProcessed = new p.EventDispatcher()),
                (this._onActionsReceived = new p.EventDispatcher()),
                (this.receiveActions = (e) => {
                  let t = new g.DataStream(e);
                  var i = t.readUint32(),
                    r = this.gameoptParser.parseAllPlayerActions(t);
                  ((this.receivedNetworkTurn = i),
                    this.receivedActions.set(i, r),
                    this._onActionsReceived.dispatch(void 0, i));
                }),
                (this.handleGameDesync = () => {
                  (this.setErrorState(), this.onDesync());
                }));
            }
            init() {
              ((this.gameTurnMillis = 1e3 / (this.game.desiredSpeed.value * a.GameSpeed.BASE_TICKS_PER_SECOND)),
                (this.currentNetworkTurn = 0),
                (this.currentSubTurn = 0),
                this.gservCon.onGameActions.subscribe(this.receiveActions),
                this.gservCon.onGameDesync.subscribe(this.handleGameDesync),
                this.debug("Init: gameTurnMillis = " + this.gameTurnMillis));
            }
            canAdvanceNetworkTurn() {
              return this.currentNetworkTurn < 2 || this.receivedActions.has(this.currentNetworkTurn - 2);
            }
            setErrorState() {
              this.errorState = !0;
            }
            getErrorState() {
              return this.errorState;
            }
            setRate(e) {
              if (
                (this.debug(`Recv rate: ${e.rate} (turn ${e.turnNo})`),
                0 === this.currentSubTurn && 0 === this.currentNetworkTurn && 0 === e.turnNo)
              )
                this.updateRate(e.rate);
              else {
                if (e.turnNo < this.currentNetworkTurn - 2)
                  throw new Error("Rate change has turn number more than two turns in the past.");
                this.queuedRateChanges.push(e);
              }
            }
            updateRate(e) {
              ((this.networkTurnMillis = n.computeNetworkTurnMillis(e, this.gameTurnMillis)),
                (this.hashCheckTurnInterval = Math.ceil(o.PREFERRED_HASH_CHECK_MILLIS / this.networkTurnMillis)),
                this.netLogger?.debug(`Rate set to ${e} (${this.networkTurnMillis}ms) @ ` + this.currentNetworkTurn));
            }
            setPassiveMode(e) {
              (this.debug("Send passive: " + e), (this.passiveMode = e), this.gservCon.sendPlayerActive(!e));
            }
            getTurnMillis() {
              return this.gameTurnMillis;
            }
            doGameTurn(e) {
              if (!this.errorState) {
                if (!this.networkTurnMillis) throw new Error("Network turn rate should be set by now.");
                if (this.game.status !== r.GameStatus.Ended) {
                  if (0 === this.currentSubTurn) {
                    var t = this.queuedRateChanges[0];
                    if (
                      (t &&
                        t.turnNo + 2 === this.currentNetworkTurn &&
                        (this.debug(`Process rate ${t.rate} (turn ${t.turnNo})`),
                        this.updateRate(t.rate),
                        this.queuedRateChanges.shift()),
                      !this.canAdvanceNetworkTurn())
                    )
                      return (this.handleCommsLag(!0, e), this.debug("Lag state: " + this.lagState), !1);
                    (this.debug("Advance turn"),
                      this.commsLagStartTime &&
                        0 < e - this.commsLagStartTime &&
                        this.netLogger?.debug(
                          `Waited ${Math.round(e - this.commsLagStartTime)}ms ` + "for other clients to catch up.",
                        ),
                      this.handleCommsLag(!1, e),
                      !this.passiveMode && this.currentNetworkTurn >= this.receivedNetworkTurn && this.sendActions(),
                      2 <= this.currentNetworkTurn &&
                        ((i = this.receivedActions.get(this.currentNetworkTurn - 2)),
                        this.replayRecorder.recordActions(this.game.currentTick, i),
                        this.processActions(i),
                        this.receivedActions.delete(this.currentNetworkTurn - 2),
                        this._onActionsProcessed.dispatch(void 0, this.currentNetworkTurn - 2)),
                      this.game.update(),
                      this.passiveMode ||
                        this.currentNetworkTurn % this.hashCheckTurnInterval != 0 ||
                        this.gservCon.sendGameStateHash(this.currentNetworkTurn, this.game.getHash()),
                      this.networkTurnMillis > this.gameTurnMillis ? this.currentSubTurn++ : this.currentNetworkTurn++);
                  } else
                    (this.debug("Update"),
                      this.game.update(),
                      this.currentSubTurn++,
                      this.currentSubTurn >= this.networkTurnMillis / this.gameTurnMillis &&
                        ((this.currentSubTurn = 0), this.currentNetworkTurn++));
                  var i;
                  this.debugGameState &&
                    ((i = (this.networkTurnMillis / this.gameTurnMillis) * this.hashCheckTurnInterval),
                    this.debugGameStateHistory.length > i && this.debugGameStateHistory.shift(),
                    this.debugGameStateHistory.push(this.game.debugGetState()));
                } else this.game.update();
              }
            }
            handleCommsLag(e, t) {
              e
                ? (this.commsLagStartTime || (this.commsLagStartTime = t),
                  t - this.commsLagStartTime > s.LAG_STATE_THRESH_MILLIS && this.updateLagState(!0))
                : ((this.commsLagStartTime = void 0), this.updateLagState(!1));
            }
            updateLagState(e) {
              e !== this.lagState && ((this.lagState = e), this._onLagStateChange.dispatch(void 0, e));
            }
            sendActions() {
              let e = this.inputActions.dequeueAll();
              e.length || e.push(new i.NoAction());
              var t = this.gameoptSerializer.serializePlayerActions(
                e.map((e) => this.actionSerializer.getActionPayload(e)),
              );
              (this.debug("Send actions: " + t),
                this.gservCon.sendPlayerActions(this.currentNetworkTurn, t),
                this._onActionsSent.dispatch(void 0, this.currentNetworkTurn));
            }
            processActions(e) {
              [...e].forEach(([r, e]) =>
                e.forEach((e) => {
                  let t = this.actionFactory.create(e.id);
                  ((t.player = this.game.getPlayer(r)), t.unserialize(e.params), t.process());
                  var i = t.print();
                  i && this.actionLogger?.debug(`(${t.player.name})@${this.game.currentTick}: ` + i);
                }),
              );
            }
            debug(e) {
              this.debugLogger?.(`${this.currentNetworkTurn}-${this.currentSubTurn}-${this.game.currentTick}: ` + e);
            }
            dispose() {
              (this.setErrorState(),
                this.gservCon.onGameActions.unsubscribe(this.receiveActions),
                this.gservCon.onGameDesync.unsubscribe(this.handleGameDesync));
            }
          }),
        ),
          (o.PREFERRED_HASH_CHECK_MILLIS = 1e3));
      },
    };
  },
);
