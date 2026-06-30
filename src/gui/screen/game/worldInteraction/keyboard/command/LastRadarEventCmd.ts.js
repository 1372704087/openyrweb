// === Reconstructed SystemJS module: gui/screen/game/worldInteraction/keyboard/command/LastRadarEventCmd ===
// deps: ["game/event/EventType","game/type/SuperWeaponType"]
// Note: variable/type names are minified approximations of the original TypeScript.

System.register(
  "gui/screen/game/worldInteraction/keyboard/command/LastRadarEventCmd",
  ["game/event/EventType", "game/type/SuperWeaponType"],
  function (e, t) {
    "use strict";
    var i, r, s;
    t && t.id;
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
        e(
          "LastRadarEventCmd",
          (s = class {
            constructor(e, t, i) {
              ((this.player = e),
                (this.mapPanningHelper = t),
                (this.cameraPan = i),
                (this.eventHistory = []),
                (this.eventPointer = -1));
            }
            execute() {
              var e, t;
              this.eventHistory.length &&
                (this.lastRun
                  ? ((t = (e = Date.now()) - this.lastRun),
                    (this.lastRun = e),
                    400 < t
                      ? (this.eventPointer = this.eventHistory.length - 1)
                      : (this.eventPointer--,
                        this.eventPointer < 0 && (this.eventPointer = this.eventHistory.length - 1)))
                  : (this.lastRun = Date.now()),
                (t = this.eventHistory[this.eventPointer]) &&
                  ((t = this.mapPanningHelper.computeCameraPanFromTile(t.rx, t.ry)), this.cameraPan.setPan(t)));
            }
            recordEvent(e) {
              (this.eventHistory.push(e),
                (this.eventHistory = this.eventHistory.slice(-8)),
                (this.eventPointer = this.eventHistory.length - 1));
            }
            handleGameEvent(t) {
              switch (t.type) {
                case i.EventType.RadarEvent:
                  t.target === this.player && this.recordEvent(t.tile);
                  break;
                case i.EventType.BridgeRepair:
                  t.source === this.player && this.recordEvent(t.tile);
                  break;
                case i.EventType.ObjectDestroy:
                  {
                    let e = t.target;
                    (e.isUnit() && e.owner === this.player && this.recordEvent(e.tile),
                      e.isProjectile() && e.isNuke && this.recordEvent(e.tile));
                  }
                  break;
                case i.EventType.FactoryProduceUnit:
                  var e = t.target;
                  e.owner === this.player && this.recordEvent(e.tile);
                  break;
                case i.EventType.SuperWeaponActivate:
                  e = t;
                  [r.SuperWeaponType.IronCurtain, r.SuperWeaponType.ChronoSphere].includes(e.target) &&
                    this.recordEvent(e.atTile2 ?? e.atTile);
                  break;
                case i.EventType.LightningStormManifest:
                  this.recordEvent(t.target);
                  break;
                case i.EventType.PingLocation:
                  this.recordEvent(t.tile);
              }
            }
          }),
        );
      },
    };
  },
);
