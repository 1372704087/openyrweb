// === Reconstructed SystemJS module: gui/screen/game/worldInteraction/WorldInteractionFactory ===
// deps: ["engine/util/MapTileIntersectHelper","engine/util/EntityIntersectHelper","gui/screen/game/worldInteraction/UnitSelectionHandler","gui/screen/game/worldInteraction/DefaultActionHandler","gui/screen/game/worldInteraction/WorldInteraction","gui/screen/game/worldInteraction/CameraPanHandler","gui/screen/game/worldInteraction/MapScrollHandler","gui/screen/game/worldInteraction/MapHoverHandler","gui/screen/game/worldInteraction/keyboard/KeyboardHandler","engine/util/RaycastHelper","engine/util/WorldViewportHelper","engine/renderable/entity/TargetLines","gui/screen/game/worldInteraction/MinimapHandler","engine/util/MapPanningHelper","gui/screen/game/worldInteraction/TooltipHandler","gui/screen/game/worldInteraction/ArrowScrollHandler","gui/screen/game/worldInteraction/CustomScrollHandler"]
// Note: variable/type names are minified approximations of the original TypeScript.

System.register(
  "gui/screen/game/worldInteraction/WorldInteractionFactory",
  [
    "engine/util/MapTileIntersectHelper",
    "engine/util/EntityIntersectHelper",
    "gui/screen/game/worldInteraction/UnitSelectionHandler",
    "gui/screen/game/worldInteraction/DefaultActionHandler",
    "gui/screen/game/worldInteraction/WorldInteraction",
    "gui/screen/game/worldInteraction/CameraPanHandler",
    "gui/screen/game/worldInteraction/MapScrollHandler",
    "gui/screen/game/worldInteraction/MapHoverHandler",
    "gui/screen/game/worldInteraction/keyboard/KeyboardHandler",
    "engine/util/RaycastHelper",
    "engine/util/WorldViewportHelper",
    "engine/renderable/entity/TargetLines",
    "gui/screen/game/worldInteraction/MinimapHandler",
    "engine/util/MapPanningHelper",
    "gui/screen/game/worldInteraction/TooltipHandler",
    "gui/screen/game/worldInteraction/ArrowScrollHandler",
    "gui/screen/game/worldInteraction/CustomScrollHandler",
  ],
  function (e, t) {
    "use strict";
    var h, u, d, g, p, m, f, y, T, v, b, S, w, E, C, x, O, i;
    t && t.id;
    return {
      setters: [
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
      ],
      execute: function () {
        e(
          "WorldInteractionFactory",
          (i = class {
            constructor(e, t, i, r, s, a, n, o, l, c, h, u, d, g, p, m, f, y, T) {
              ((this.player = e),
                (this.game = t),
                (this.unitSelection = i),
                (this.renderableManager = r),
                (this.uiScene = s),
                (this.worldScene = a),
                (this.pointer = n),
                (this.renderer = o),
                (this.keyBinds = l),
                (this.generalOptions = c),
                (this.freeCamera = h),
                (this.debugPaths = u),
                (this.devMode = d),
                (this.document = g),
                (this.minimap = p),
                (this.strings = m),
                (this.tooltipTextColor = f),
                (this.tooltipDebugText = y),
                (this.battleControlApi = T));
            }
            create() {
              var e = this.game.map,
                t = this.worldScene,
                i = this.pointer;
              let r = this.renderer;
              var s = new h.MapTileIntersectHelper(e, t),
                a = new v.RaycastHelper(t),
                n = new b.WorldViewportHelper(t),
                o = new u.EntityIntersectHelper(e, this.renderableManager, s, a, t, n),
                l = new d.UnitSelectionHandler(
                  t,
                  this.uiScene,
                  this.player,
                  this.unitSelection,
                  o,
                  this.game.rules.general.veteran.veteranCap,
                ),
                c = g.DefaultActionHandler.factory(
                  this.renderableManager,
                  this.unitSelection,
                  l,
                  this.player,
                  e,
                  this.game,
                  this.game.rules.audioVisual,
                ),
                a = this.player ? this.game.mapShroudTrait.getPlayerShroud(this.player) : void 0,
                n = new T.KeyboardHandler(this.keyBinds, this.devMode),
                o = new y.MapHoverHandler(o, s, e, a, r),
                s = new f.MapScrollHandler(r.getCanvas(), t.cameraPan, i, this.generalOptions.scrollRate, t);
              return new p.WorldInteraction(
                t,
                i,
                i.pointerEvents,
                new m.CameraPanHandler(t.cameraPan, i, this.generalOptions.scrollRate, this.freeCamera, t),
                s,
                o,
                new C.TooltipHandler(
                  o,
                  this.tooltipTextColor,
                  i,
                  this.uiScene,
                  this.renderer,
                  this.strings,
                  this.tooltipDebugText,
                ),
                l,
                c,
                n,
                new x.ArrowScrollHandler(s),
                new O.CustomScrollHandler(s),
                new w.MinimapHandler(this.minimap, e, a, t, new E.MapPanningHelper(e)),
                t.cameraZoom,
                this.document,
                r,
                new S.TargetLines(
                  this.player,
                  this.unitSelection,
                  t.camera,
                  this.debugPaths,
                  this.generalOptions.targetLines,
                ),
                this.generalOptions.rightClickMove,
                this.generalOptions.rightClickScroll,
                this.battleControlApi,
              );
            }
          }),
        );
      },
    };
  },
);
