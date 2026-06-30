// === Reconstructed SystemJS module: gui/screen/mainMenu/lobby/component/viewmodel/lobby ===
// deps: []
// Note: variable/type names are minified approximations of the original TypeScript.

System.register("gui/screen/mainMenu/lobby/component/viewmodel/lobby", [], function (i, e) {
  "use strict";
  var r, s, a, n;
  e && e.id;
  return {
    setters: [],
    execute: function () {
      var e, t;
      (((e = r || i("LobbyType", (r = {})))[(e.Singleplayer = 0)] = "Singleplayer"),
        (e[(e.MultiplayerHost = 1)] = "MultiplayerHost"),
        (e[(e.MultiplayerGuest = 2)] = "MultiplayerGuest"),
        ((t = s || i("SlotType", (s = {})))[(t.Player = 1)] = "Player"),
        (t[(t.Ai = 2)] = "Ai"),
        (t[(t.Observer = 3)] = "Observer"),
        ((t = a || i("SlotOccupation", (a = {})))[(t.Open = 1)] = "Open"),
        (t[(t.Closed = 2)] = "Closed"),
        (t[(t.Occupied = 3)] = "Occupied"),
        ((t = n || i("PlayerStatus", (n = {})))[(t.NotReady = 1)] = "NotReady"),
        (t[(t.Ready = 2)] = "Ready"),
        (t[(t.Host = 3)] = "Host"));
    },
  };
});
