// === Reconstructed SystemJS module: game/superweapon/SpyPlaneEffect ===
// deps: ["game/superweapon/SuperWeaponEffect","engine/type/ObjectType","game/gameobject/unit/ZoneType","game/gameobject/unit/FacingUtil","game/gameobject/task/move/MoveTask","game/gameobject/task/system/CallbackTask","game/math/Vector2","game/Coords","game/event/TriggerSoundFxEvent"]
// Note: variable/type names are minified approximations of the original TypeScript.
//
// OpenYRWeb (2026-08-08): Spy Plane — the Soviet Radar Tower (NARADR) support
// power (SuperWeaponType.SpyPlane=8, [SpyPlaneSpecial]). A recon plane (SPYP)
// flies in from a random map edge, passes over the targeted tile, and takes
// photographs as it flies by (FlyBy — it never slows down). Each photograph
// permanently reveals a circular area (SpyCameraWeapon Damage=6 tiles) around
// the plane's current position for the activating player; the camera snapshot
// sound ([AudioVisual] SpyPlaneCamera) plays every SpyPlaneCameraFrames (16)
// ticks while the plane is within the camera's Range (SpyCameraWeapon Range=20)
// of the target. The plane then exits on the opposite side of the map and is
// destroyed out of sight.

System.register(
  "game/superweapon/SpyPlaneEffect",
  [
    "game/superweapon/SuperWeaponEffect",
    "engine/type/ObjectType",
    "game/gameobject/unit/ZoneType",
    "game/gameobject/unit/FacingUtil",
    "game/gameobject/task/move/MoveTask",
    "game/gameobject/task/system/CallbackTask",
    "game/math/Vector2",
    "game/Coords",
    "game/event/TriggerSoundFxEvent",
  ],
  function (e, t) {
    "use strict";
    var i, s, z, f, m, c, v, C, S;
    t && t.id;
    return {
      setters: [
        function (e) { i = e; },
        function (e) { s = e; },
        function (e) { z = e; },
        function (e) { f = e; },
        function (e) { m = e; },
        function (e) { c = e; },
        function (e) { v = e; },
        function (e) { C = e; },
        function (e) { S = e; },
      ],
      execute: function () {
        var o;
        (((o = o || {})[(o.Spawning = 0)] = "Spawning"),
          (o[(o.EnRoute = 1)] = "EnRoute"));
        // Vanilla YR hardcodes the spy plane aircraft type as SPYP.
        var SPYP_TYPE = "SPYP";
        var r = class extends i.SuperWeaponEffect {
          constructor(e, t, i) {
            super(e, t, i);
            this.state = o.Spawning;
            this.cameraTickCounter = 0;
          }
          onStart(e) {
            // Read the spy plane aircraft rules and its camera weapon to obtain
            // the reveal radius (SpyCameraWeapon Damage) and the distance at
            // which the plane starts taking pictures (SpyCameraWeapon Range).
            var revealRadius = 6;
            var cameraRange = 20;
            try {
              var planeRules = e.rules.getObject(SPYP_TYPE, s.ObjectType.Aircraft);
              if (planeRules && planeRules.primary) {
                var weaponRules = e.rules.getWeapon(planeRules.primary);
                if (weaponRules) {
                  if (weaponRules.damage) revealRadius = weaponRules.damage;
                  if (weaponRules.range && weaponRules.range !== Number.POSITIVE_INFINITY)
                    cameraRange = weaponRules.range;
                }
              }
            } catch (err) {
              console.warn("SpyPlaneEffect: could not read SPYP weapon rules", err);
            }
            this.revealRadius = revealRadius;
            this.cameraRange = cameraRange;
            // Camera cadence/sound from [AudioVisual] (vanilla YR).
            var av = e.rules.audioVisual;
            this.cameraFrames = (av && av.spyPlaneCameraFrames) || 16; // ticks between photos
            this.cameraSound = (av && av.spyPlaneCamera) || "SpyPlaneSnapshot";
          }
          onTick(e) {
            if (this.state === o.Spawning) {
              this.spawnSpyPlane(e);
              this.state = o.EnRoute;
            }
            // Plane destroyed or crashing — finish.
            if (!this.spyPlane || this.spyPlane.isDestroyed || this.spyPlane.isCrashing)
              return !0;
            var tt = this.spyPlane.tile;
            // Out-of-bounds cleanup — destroy the plane once it has clearly
            // left the map (same margin as AirstrikeTrait).
            if (tt) {
              var mapSize = e.map.tiles.getMapSize();
              var exitMargin = 4;
              if (
                tt.rx < -exitMargin ||
                tt.ry < -exitMargin ||
                tt.rx > mapSize.width - 1 + exitMargin ||
                tt.ry > mapSize.height - 1 + exitMargin
              ) {
                e.destroyObject(this.spyPlane, { player: this.spyPlane.owner, obj: this.spyPlane });
                return !0;
              }
            }
            // Camera phase — while the plane is within cameraRange of the
            // target, take a picture every cameraFrames (16) ticks: reveal
            // radius revealRadius around the plane's current position and
            // play the snapshot sound. Photos are spread over time so the
            // plane moves between them, creating a trail of revealed circles.
            if (tt && this.tile) {
              var dx = tt.rx - this.tile.rx;
              var dy = tt.ry - this.tile.ry;
              var dist = Math.sqrt(dx * dx + dy * dy);
              if (dist <= this.cameraRange) {
                this.cameraTickCounter++;
                if (this.cameraTickCounter >= this.cameraFrames) {
                  this.cameraTickCounter = 0;
                  var shroud = e.mapShroudTrait && e.mapShroudTrait.getPlayerShroud(this.owner);
                  if (shroud) shroud.revealAround(tt, this.revealRadius);
                  if (this.cameraSound)
                    e.events.dispatch(new S.TriggerSoundFxEvent(this.cameraSound, tt));
                }
              }
            }
            // Plane reached its exit destination — destroy and finish.
            if (!this.spyPlane.unitOrderTrait.hasTasks()) {
              e.destroyObject(this.spyPlane, { player: this.spyPlane.owner, obj: this.spyPlane });
              return !0;
            }
            return !1;
          }
          spawnSpyPlane(e) {
            var planeRules;
            try {
              planeRules = e.rules.getObject(SPYP_TYPE, s.ObjectType.Aircraft);
            } catch (err) {
              console.warn('SpyPlaneEffect: aircraft type "' + SPYP_TYPE + '" not found');
              return;
            }
            var mapSize = e.map.tiles.getMapSize();
            var target = this.tile;
            // Pick a random edge (N/S/E/W). The plane flies in from that edge,
            // passes over the target, and exits on the opposite side.
            var dir = Math.floor(e.generateRandom() * 4);
            var entryTile, exitTile;
            var offset = 1; // tiles inward from the edge (kept in-bounds)
            var exitOffset = 12; // tiles past the opposite edge
            var tx = Math.max(offset, Math.min(target.rx, mapSize.width - 1 - offset));
            var ty = Math.max(offset, Math.min(target.ry, mapSize.height - 1 - offset));
            if (dir === 0) {
              // North edge -> South exit
              entryTile = e.map.tiles.getByMapCoords(tx, offset) || e.map.tiles.getPlaceholderTile(tx, offset);
              exitTile = e.map.tiles.getPlaceholderTile(tx, mapSize.height - 1 + exitOffset);
            } else if (dir === 1) {
              // South edge -> North exit
              entryTile = e.map.tiles.getByMapCoords(tx, mapSize.height - 1 - offset) || e.map.tiles.getPlaceholderTile(tx, mapSize.height - 1 - offset);
              exitTile = e.map.tiles.getPlaceholderTile(tx, -exitOffset);
            } else if (dir === 2) {
              // East edge -> West exit
              entryTile = e.map.tiles.getByMapCoords(mapSize.width - 1 - offset, ty) || e.map.tiles.getPlaceholderTile(mapSize.width - 1 - offset, ty);
              exitTile = e.map.tiles.getPlaceholderTile(-exitOffset, ty);
            } else {
              // West edge -> East exit
              entryTile = e.map.tiles.getByMapCoords(offset, ty) || e.map.tiles.getPlaceholderTile(offset, ty);
              exitTile = e.map.tiles.getPlaceholderTile(mapSize.width - 1 + exitOffset, ty);
            }
            var plane = e.createUnitForPlayer(planeRules, this.owner);
            e.spawnObject(plane, entryTile);
            plane.position.tileElevation = C.Coords.worldToTileHeight(
              plane.rules.flightLevel ?? e.rules.general.flightLevel,
            );
            plane.zone = z.ZoneType.Air;
            plane.onBridge = !1;
            plane.direction = f.FacingUtil.fromMapCoords(
              new v.Vector2(target.rx - entryTile.rx, target.ry - entryTile.ry),
            );
            // Fly straight through to the opposite edge (FlyBy — no slowdown).
            plane.unitOrderTrait.addTask(
              new m.MoveTask(e, exitTile, !1, { allowOutOfBoundsTarget: !0 }),
            );
            plane.unitOrderTrait.addTask(
              new c.CallbackTask(function () {
                if (!plane.isDestroyed) {
                  e.destroyObject(plane, { player: plane.owner, obj: plane });
                }
              }),
            );
            this.spyPlane = plane;
          }
        };
        e("SpyPlaneEffect", r);
      },
    };
  },
);
