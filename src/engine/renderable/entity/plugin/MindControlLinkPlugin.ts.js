// OpenYRWeb: renders the mind-control link beam from a controller (e.g. Yuri / Mastermind)
// to each of its controlled targets, AND from a controlled unit back to its controller
// when the controlled unit is selected. Endpoints are refreshed every render frame so the
// beam tracks moving units. The beam is visible when:
//   - Controller is selected (all links shown)
//   - A controlled target is selected (that target's link shown)
//   - Brief flash after initial control (MindControlAttackLineFrames timer)
// Pattern mirrors the comment at the top of MagnetronBeamPlugin.
// deps: ["engine/renderable/fx/MindControlLinkFx", "game/Coords"]

System.register(
  "engine/renderable/entity/plugin/MindControlLinkPlugin",
  ["engine/renderable/fx/MindControlLinkFx", "game/Coords"],
  function (e, t) {
    "use strict";
    var o, C, i;
    t && t.id;
    return {
      setters: [
        function (e) {
          o = e;
        },
        function (e) {
          C = e;
        },
      ],
      execute: function () {
        e(
          "MindControlLinkPlugin",
          (i = class {
            constructor(e, t, i, r, s) {
              ((this.source = e),
                (this.selectionModel = t),
                (this.alliances = i),
                (this.viewer = r),
                (this.camera = s),
                (this.links = new Map()));
            }
            onCreate(e) {
              this.renderableManager = e;
            }
            update(t) {
              if (this.source.isDestroyed || this.source.isCrashing) {
                this.disposeLinks();
                return;
              }
              // OpenYRWeb: CONTROLLER case — show lines from controller to each target.
              if (this.source.mindControllerTrait) this._updateControllerLinks(t);
              // OpenYRWeb: CONTROLLED case — show line from controlled unit back to controller.
              else if (this.source.mindControllableTrait?.isActive()) this._updateControlledLink(t);
              else this.disposeLinks();
            }
            _updateControllerLinks(t) {
              var targets = this.source.mindControllerTrait.getTargets();
              // Remove links for targets no longer controlled.
              for (var [obj, fx] of this.links.entries()) targets.includes(obj) || (fx.removeAndDispose(), this.links.delete(obj));
              // Build visibility flags.
              var controllerSelected =
                  this.selectionModel.isSelected() &&
                  (!this.viewer.value || this.alliances.haveSharedIntel(this.source.owner, this.viewer.value)),
                color = new THREE.Color(this.source.owner.color.asHex()),
                // Use worldPosition directly — MindControlLinkFx adds an arc height internally.
                srcPos = this.source.position.worldPosition.clone();
              for (let target of targets) {
                var flashActive = target._mindControlAttackLineEnd && target._mindControlAttackLineEnd > t,
                  targetSelected =
                    this.selectionModel.isSelected(target) &&
                    (!this.viewer.value || this.alliances.haveSharedIntel(target.owner, this.viewer.value)),
                  visible = controllerSelected || flashActive || targetSelected;
                if (!visible) {
                  // Remove the link when it should not be visible.
                  var existing = this.links.get(target);
                  existing && (existing.removeAndDispose(), this.links.delete(target));
                  continue;
                }
                // Use worldPosition directly — MindControlLinkFx adds an arc height internally.
                var dstPos = target.position.worldPosition.clone();
                // OpenYRWeb: controlled-unit endpoint at head height using art-defined height.
                dstPos.y += C.Coords.tileHeightToWorld(target.art.height);
                let fx = this.links.get(target);
                fx
                  ? fx.updateEndpoints(srcPos, dstPos)
                  : ((fx = new o.MindControlLinkFx(srcPos, dstPos, color, 2, this.camera)),
                    this.links.set(target, fx),
                    this.renderableManager?.addEffect(fx));
              }
            }
            _updateControlledLink(t) {
              var controller = this.source.mindControllableTrait.getController();
              if (!controller || controller.isDestroyed || controller.isCrashing) {
                this.disposeLinks();
                return;
              }
              var isSelected =
                  this.selectionModel.isSelected() &&
                  (!this.viewer.value || this.alliances.haveSharedIntel(this.source.owner, this.viewer.value)),
                controllerSelected =
                  this.selectionModel.isSelected(controller) &&
                  (!this.viewer.value || this.alliances.haveSharedIntel(controller.owner, this.viewer.value)),
                visible = isSelected || controllerSelected;
              if (!visible) {
                this.disposeLinks();
                return;
              }
              var color = new THREE.Color(controller.owner.color.asHex()),
                srcPos = this.source.position.worldPosition.clone(),
                dstPos = controller.position.worldPosition.clone();
              // OpenYRWeb: controlled-unit endpoint at head height using art-defined height.
              srcPos.y += C.Coords.tileHeightToWorld(this.source.art.height);
              // Use a single entry keyed by the controller's unique ID.
              var key = controller;
              let fx = this.links.get(key);
              fx
                ? fx.updateEndpoints(srcPos, dstPos)
                : ((fx = new o.MindControlLinkFx(srcPos, dstPos, color, 2, this.camera)),
                  this.links.set(key, fx),
                  this.renderableManager?.addEffect(fx));
            }
            onRemove() {
              ((this.renderableManager = void 0), this.disposeLinks());
            }
            dispose() {
              this.disposeLinks();
            }
            disposeLinks() {
              (this.links.forEach((e) => e.removeAndDispose()), this.links.clear());
            }
          }),
        );
      },
    };
  },
);
