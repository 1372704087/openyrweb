// === Reconstructed SystemJS module: network/gamestate/ReplayTurnManager ===
// deps: ["game/Game","game/GameSpeed","network/gamestate/replay/TurnActionsReplayEvent","util/event"]
// Note: variable/type names are minified approximations of the original TypeScript.

System.register(
  "network/gamestate/ReplayTurnManager",
  ["game/Game", "game/GameSpeed", "network/gamestate/replay/TurnActionsReplayEvent", "util/event"],
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
        e(
          "ReplayTurnManager",
          (n = class {
            get onReplayEvent() {
              return this._onReplayEvent.asEvent();
            }
            constructor(e, t, i, r) {
              ((this.game = e),
                (this.replay = t),
                (this.actionFactory = i),
                (this.actionLogger = r),
                (this.errorState = !1),
                (this.gameSpeedChanged = !1),
                (this._onReplayEvent = new a.EventDispatcher()),
                (this.onGameSpeedChanged = () => {
                  this.gameSpeedChanged = !0;
                }));
            }
            init() {
              (this.game.desiredSpeed.onChange.subscribe(this.onGameSpeedChanged),
                this.computeGameTurn(this.game.speed.value),
                (this.replayIterator = this.replay.getEvents().values()),
                (this.nextReplayEvent = this.replayIterator.next().value));
            }
            computeGameTurn(e) {
              this.gameTurnMillis = 1e3 / (e * r.GameSpeed.BASE_TICKS_PER_SECOND);
            }
            setErrorState() {
              this.errorState = !0;
            }
            getErrorState() {
              return this.errorState;
            }
            getTurnMillis() {
              return this.gameTurnMillis;
            }
            doGameTurn(e) {
              if (!this.errorState)
                if (this.game.status !== i.GameStatus.Ended) {
                  for (; this.nextReplayEvent && this.nextReplayEvent.tickNo === this.game.currentTick;)
                    (this.nextReplayEvent instanceof s.TurnActionsReplayEvent &&
                      this.processActions(this.nextReplayEvent.payload),
                      this._onReplayEvent.dispatch(this, this.nextReplayEvent),
                      (this.nextReplayEvent = this.replayIterator.next().value));
                  if (this.nextReplayEvent && this.nextReplayEvent.tickNo < this.game.currentTick)
                    throw new Error("Replay event desync");
                  this.replay.endTick + 1 <= this.game.currentTick
                    ? (this.game.status = i.GameStatus.Ended)
                    : (this.game.update(),
                      this.gameSpeedChanged &&
                        ((this.game.speed.value = this.game.desiredSpeed.value),
                        this.computeGameTurn(this.game.speed.value),
                        (this.gameSpeedChanged = !1)));
                } else this.game.speed.value = 0;
            }
            processActions(e) {
              e.forEach(([r, e]) =>
                e.forEach((e) => {
                  let t = this.actionFactory.create(e.id);
                  ((t.player = this.game.getPlayer(r)), t.unserialize(e.params), t.process());
                  var i = t.print();
                  i && this.actionLogger?.debug(`(${t.player.name})@${this.game.currentTick}: ` + i);
                }),
              );
            }
            dispose() {
              this.game.desiredSpeed.onChange.unsubscribe(this.onGameSpeedChanged);
            }
          }),
        );
      },
    };
  },
);
