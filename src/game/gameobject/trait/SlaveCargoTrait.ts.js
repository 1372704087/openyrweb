// === Reconstructed SystemJS module: game/gameobject/trait/SlaveCargoTrait ===
// deps: ["engine/type/TiberiumType"]
// Note: variable/type names are minified approximations of the original TypeScript.
//
// OpenYRWeb: Lightweight cargo trait for SlaveMiner slaves (SLAV infantry). The full
// HarvesterTrait auto-pushes GatherOreTask/ReturnOreTask on spawn/tick/teleport — which
// would conflict with SlaveGatherTask (the slave economy loop). This trait only tracks
// ore/gems cargo (the surface PipOverlay reads to draw ore pips) and exposes the same
// minimal API SlaveGatherTask needs (addBails/empty/getBails/isFull). No NotifySpawn /
// NotifyTick / NotifyOrder / NotifyTeleport — it is purely a passive cargo counter.
// Attached as `harvesterTrait` on SLAV (see Infantry.factory) so PipOverlay renders pips.
//
// OpenYRWeb (2026-06-30, REVERSED): a `status` field was added so the harvest ANIMATION
// works. Vanilla yrmd.exe (FUN_0073ced6) plays the OREGATH.SHP transient anim at a
// Techno's ore tile when its per-slot "is harvesting" flag (+0xe0e) and "actively digging"
// bool (+0x6d2) are set — the SAME mechanism the vehicle HarvesterPlugin uses. In
// OpenYRWeb, HarvesterPlugin watches `harvesterTrait.status === HarvesterStatus.Harvesting`
// (=3). SlaveGatherTask sets this.status = 3 while mining and 0 (Idle) otherwise, and
// RenderableFactory attaches a HarvesterPlugin to enslaved infantry, so the slave shows
// the OREGATH digging particles at its (ore) tile. The literal values mirror HarvesterStatus
// (Idle=0/Harvesting=3) WITHOUT importing HarvesterTrait (avoids pulling GatherOreTask/
// ReturnOreTask into SlaveCargoTrait's dep graph). See re/NOTES.md §6.

System.register("game/gameobject/trait/SlaveCargoTrait", ["engine/type/TiberiumType"], function (e, t) {
  "use strict";
  var r;
  t && t.id;
  return {
    setters: [
      function (e) {
        r = e;
      },
    ],
    execute: function () {
      e(
        "SlaveCargoTrait",
        (class {
          get ore() {
            return this._ore;
          }
          get gems() {
            return this._gems;
          }
          constructor(e) {
            ((this.storage = e),
              (this._ore = 0),
              (this._gems = 0),
              (this.bails = new Map()),
              // OpenYRWeb: harvest-anim driver. Mirrors HarvesterStatus (Idle=0, Harvesting=3).
              // Read by HarvesterPlugin (attached to enslaved infantry in RenderableFactory).
              // Set to Harvesting by SlaveGatherTask during the HARVESTING state.
              (this.status = 0));
          }
          addBails(e, t) {
            (this.bails.set(e, (this.bails.get(e) ?? 0) + t),
              e === r.TiberiumType.Gems ? (this._gems += t) : (this._ore += t));
          }
          getBails() {
            return [...this.bails.entries()];
          }
          isFull() {
            return this.ore + this.gems >= this.storage;
          }
          isEmpty() {
            return !this.ore && !this.gems;
          }
          empty() {
            (this.bails.clear(), (this._ore = this._gems = 0));
          }
          getHash() {
            return 100 * this.ore + this.gems;
          }
        }));
    },
  };
});
