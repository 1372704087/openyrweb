// === Reconstructed SystemJS module: game/bot/DummyBot ===
// deps: ["game/bot/Bot","game/order/OrderType"]
// Note: variable/type names are minified approximations of the original TypeScript.

System.register("game/bot/DummyBot", ["game/bot/Bot", "game/order/OrderType"], function (t, e) {
  "use strict";
  var i, r, s, a;
  e && e.id;
  return {
    setters: [
      function (e) {
        i = e;
      },
      function (e) {
        r = e;
      },
    ],
    execute: function () {
      var e;
      (((e = s = s || {})[(e.Initial = 0)] = "Initial"),
        (e[(e.Deployed = 1)] = "Deployed"),
        (e[(e.Attacking = 2)] = "Attacking"),
        (e[(e.Defeated = 3)] = "Defeated"),
        (a = class extends i.Bot {
          constructor() {
            (super(...arguments), (this.botState = s.Initial));
          }
          onGameStart(t) {
            var e = t.getTickRate();
            ((this.tickRatio = Math.ceil(e / 5)),
              (this.enemyPlayers = t.getPlayers().filter((e) => e !== this.name && !t.areAlliedPlayers(this.name, e))));
          }
          onGameTick(e) {
            if (e.getCurrentTick() % this.tickRatio == 0)
              switch (this.botState) {
                case s.Initial: {
                  const i = e.getGeneralRules().baseUnit;
                  if (e.getVisibleUnits(this.name, "self", (e) => e.constructionYard).length) {
                    this.botState = s.Deployed;
                    break;
                  }
                  var t = e.getVisibleUnits(this.name, "self", (e) => i.includes(e.name));
                  t.length && this.actionsApi.orderUnits([t[0]], r.OrderType.DeploySelected);
                  break;
                }
                case s.Deployed:
                  break;
                case s.Attacking:
                  e.getVisibleUnits(this.name, "self", (e) => e.isSelectableCombatant).length ||
                    ((this.botState = s.Defeated), this.actionsApi.quitGame());
              }
          }
        }),
        t("DummyBot", a));
    },
  };
});
