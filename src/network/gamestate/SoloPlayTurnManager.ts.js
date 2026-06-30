// === Reconstructed SystemJS module: network/gamestate/SoloPlayTurnManager ===
// deps: ["game/action/NoAction","game/Game","game/GameSpeed"]
// Note: variable/type names are minified approximations of the original TypeScript.

System.register(
  "network/gamestate/SoloPlayTurnManager",
  ["game/action/NoAction", "game/Game", "game/GameSpeed"],
  function (e, t) {
    "use strict";
    var i, r, s, a;
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
      ],
      execute: function () {
        e(
          "SoloPlayTurnManager",
          (a = class {
            constructor(e, t, i, r, s) {
              ((this.game = e),
                (this.currentPlayer = t),
                (this.inputActions = i),
                (this.actionLogger = r),
                (this.replayRecorder = s),
                (this.errorState = !1),
                (this.gameSpeedChanged = !1),
                (this.onGameSpeedChanged = () => {
                  this.gameSpeedChanged = !0;
                }));
            }
            init() {
              (this.game.desiredSpeed.onChange.subscribe(this.onGameSpeedChanged),
                this.computeGameTurn(this.game.speed.value));
            }
            computeGameTurn(e) {
              this.gameTurnMillis = 1e3 / (e * s.GameSpeed.BASE_TICKS_PER_SECOND);
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
              if (!this.errorState) {
                if (this.game.status !== r.GameStatus.Ended) {
                  let e = this.inputActions.dequeueAll();
                  (e.length ? this.replayRecorder.recordActions(this.game.currentTick, e) : e.push(new i.NoAction()),
                    this.processActions(e));
                }
                (this.game.update(),
                  this.gameSpeedChanged &&
                    ((this.game.speed.value = this.game.desiredSpeed.value),
                    this.computeGameTurn(this.game.speed.value),
                    (this.gameSpeedChanged = !1)));
              }
            }
            processActions(e) {
              e.forEach((e) => {
                ((e.player = this.currentPlayer), e.process());
                var t = e.print();
                t && this.actionLogger?.debug(`(${e.player.name})@${this.game.currentTick}: ` + t);
              });
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
