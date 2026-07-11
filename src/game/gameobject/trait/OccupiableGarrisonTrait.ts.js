// === Reconstructed SystemJS module: game/gameobject/trait/OccupiableGarrisonTrait ===
// deps: ["game/gameobject/trait/GarrisonTrait","game/gameobject/trait/interface/NotifyDamage","game/gameobject/trait/interface/NotifySell"]

System.register(
  "game/gameobject/trait/OccupiableGarrisonTrait",
  [
    "game/gameobject/trait/GarrisonTrait",
    "game/gameobject/trait/interface/NotifyDamage",
    "game/gameobject/trait/interface/NotifySell",
  ],
  function (e, t) {
    "use strict";
    var i, r, g, n;
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
          g = e;
        },
      ],
      execute: function () {
        ((n = class extends i.GarrisonTrait {
          constructor(e, t, i) {
            super(e, i);
            this.evacThreshold = t;
          }
          canBeOccupied() {
            return this.building.healthTrait.health > 100 * this.evacThreshold;
          }
          [r.NotifyDamage.onDamage](e, t) {
            // 仅平民可驻军建筑在红血时疏散；军事建筑（isBaseDefense）不疏散
            !e.rules.isBaseDefense && e.wasCapturedFromCivilian && e.healthTrait.health <= 100 * this.evacThreshold && this.evacuate(t);
          }
          [g.NotifySell.onSell](e, t) {
            this.evacuate(t);
          }
          _afterEvacuate(e) {
            var t = this.building,
              i = this.units;
            // 疏散后平民归还：当所有驻军离开且建筑原从平民占领而来时，归还给平民
            if (0 === i.length && !t.isDestroyed && t.wasCapturedFromCivilian) {
              e.changeObjectOwner(t, e.getCivilianPlayer());
            }
          }
        }),
          e("OccupiableGarrisonTrait", n));
      },
    };
  },
);
