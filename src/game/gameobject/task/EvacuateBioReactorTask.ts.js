// === Reconstructed SystemJS module: game/gameobject/task/EvacuateBioReactorTask ===
// deps: ["game/gameobject/task/system/Task","game/gameobject/task/move/MoveOutsideTask","game/gameobject/task/system/WaitMinutesTask","game/event/BuildingEvacuateEvent"]
//
// OpenYRWeb: serial LIFO drain task for bio reactor "Unload All". Infantry unlimbo inside
// the building footprint, then walk out one at a time via MoveOutsideTask — the same visual
// "walk through the door" that EnterBuildingTask uses in reverse. A simple tick counter
// (not task-children blocking) spaces exits ~1.0 s apart to guarantee one-soldier-at-a-time
// regardless of game speed.

System.register(
  "game/gameobject/task/EvacuateBioReactorTask",
  [
    "game/gameobject/task/system/Task",
    "game/gameobject/task/move/MoveOutsideTask",
    "game/gameobject/task/system/WaitMinutesTask",
    "game/event/BuildingEvacuateEvent",
  ],
  function (e, t) {
    "use strict";
    var i, r, a, n;
    t && t.id;
    return {
      setters: [
        function (e) { i = e; },
        function (e) { r = e; },
        function (e) { a = e; },
        function (e) { n = e; },
      ],
      execute: function () {
        var o;
        ((o = class extends i.Task {
          constructor(game) {
            super();
            this.game = game;
            this._units = [];
            this._exitTile = null;
            this._spawnTile = null;
            this._building = null;
            this._ticksUntilNext = 0; // simple counter — one exit every ~1s
          }
          // e = sourceObject (the bio reactor building)
          onStart(e) {
            var t = e.garrisonTrait;
            if (!t || !t.units.length) return !0;
            this._building = e;
            // LIFO: last in (highest index) is first out.
            this._units = t.units.slice().reverse();
            // Don't clear garrisonTrait.units yet — remove one at a time
            // in onTick so the garrison pip count decrements gradually.
            this._exitTile = this._findExitTile(e);
            // Spawn tile: building center (inside footprint) so MoveOutsideTask
            // can visibly walk the infantry out to the front.
            this._spawnTile = this._findSpawnTile(e);
            return !1;
          }
          // e = sourceObject (the bio reactor building)
          onTick(e) {
            // All infantry evacuated
            if (!this._units.length) return !0;

            // Counter-based spacing: decrement each tick; only pop a unit
            // when the counter reaches 0.  This avoids relying on child-task
            // blocking behaviour which can vary with game-speed and the task
            // runner's tick loop.
            if (--this._ticksUntilNext > 0) return !1;

            var g = this.game;
            var unit = this._units.pop();

            // Remove from garrisonTrait so pip display + power update one at a time
            var gu = this._building.garrisonTrait;
            if (gu) {
              var idx = gu.units.indexOf(unit);
              if (-1 !== idx) gu.units.splice(idx, 1);
            }

            var spawnTile = this._spawnTile;
            var exitTile = this._exitTile;

            if (!spawnTile || !exitTile) {
              g.destroyObject(unit, { player: unit.owner });
              this._ticksUntilNext = 30;
              return !1;
            }

            // Unlimbo right at the exit tile (left side) instead of inside the
            // building.  This guarantees infantry appear on the correct side
            // without any pathfinding through the building footprint.
            g.unlimboObject(unit, exitTile);
            unit.onBridge = g.map.tileOccupation.getBridgeOnTile(exitTile)?.isLowBridge() ?? !1;
            unit.position.tileElevation = 0;

            // Walk to (bRx-2, bRy+2) — 1 tile left, 2 tiles down from exit.
            var dest = g.map.tiles.getByMapCoords(exitTile.rx - 1, exitTile.ry + 2);
            if (!dest || !g.map.mapBounds.isWithinBounds(dest)) dest = exitTile;

            if (unit.unitOrderTrait) {
              unit.unitOrderTrait.addTask(new r.MoveOutsideTask(g, this._building, dest));
            }

            // 每个步兵退出触发一次专属音效
            g.events.dispatch(new n.BuildingEvacuateEvent(this._building, this._building.owner));

            // ~2.0 s at base 15 ticks/sec before the next soldier walks out.
            this._ticksUntilNext = 30;

            return !1;
          }
          // Exit tile: (bRx-1, bRy) — left side of the building.
          _findExitTile(b) {
            var g = this.game;
            var t = g.map.tiles.getByMapCoords(b.tile.rx - 1, b.tile.ry);
            if (t && g.map.mapBounds.isWithinBounds(t)) return t;
            return b.tile;
          }
          // Building center — unlimbo here so MoveOutsideTask renders a walk
          _findSpawnTile(b) {
            var g = this.game;
            var bRx = b.tile.rx;
            var bRy = b.tile.ry;
            var fw = b.art.foundation.width;
            var fh = b.art.foundation.height;
            return g.map.tiles.getByMapCoords(
              bRx + Math.floor(fw / 2),
              bRy + Math.floor(fh / 2),
            ) || b.tile;
          }
          onEnd(e) {
            if (this._building && this._units.length) {
              var g = this.game;
              for (var u of this._units) g.destroyObject(u, { player: u.owner });
              this._units = [];
            }
            this._exitTile = null;
            this._spawnTile = null;
            this._building = null;
          }
        }),
          e("EvacuateBioReactorTask", o));
      },
    };
  },
);
