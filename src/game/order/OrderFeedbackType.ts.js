// === Reconstructed SystemJS module: game/order/OrderFeedbackType ===
// deps: []
// Note: variable/type names are minified approximations of the original TypeScript.

System.register("game/order/OrderFeedbackType", [], function (t, e) {
  "use strict";
  var i;
  e && e.id;
  return {
    setters: [],
    execute: function () {
      var e;
      (((e = i || t("OrderFeedbackType", (i = {})))[(e.None = 0)] = "None"),
        (e[(e.Move = 1)] = "Move"),
        (e[(e.Attack = 2)] = "Attack"),
        (e[(e.Enter = 3)] = "Enter"),
        (e[(e.Capture = 4)] = "Capture"),
        (e[(e.SpecialAttack = 5)] = "SpecialAttack"),
        (e[(e.SecondaryWeaponAttack = 6)] = "SecondaryWeaponAttack"));
    },
  };
});
