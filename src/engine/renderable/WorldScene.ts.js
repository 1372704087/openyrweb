// === Reconstructed SystemJS module: engine/renderable/WorldScene ===
// deps: ["util/geometry","engine/gfx/RenderableContainer","engine/renderable/CameraPan","engine/renderable/CameraZoom","engine/type/LightingType","game/Coords","util/event","engine/renderable/entity/unit/ShadowQuality","engine/gfx/batch/MeshBatchManager"]
// Note: variable/type names are minified approximations of the original TypeScript.

System.register(
  "engine/renderable/WorldScene",
  [
    "util/geometry",
    "engine/gfx/RenderableContainer",
    "engine/renderable/CameraPan",
    "engine/renderable/CameraZoom",
    "engine/type/LightingType",
    "game/Coords",
    "util/event",
    "engine/renderable/entity/unit/ShadowQuality",
    "engine/gfx/batch/MeshBatchManager",
  ],
  function (e, t) {
    "use strict";
    var s, i, o, l, r, a, n, c, h, u, d, g, p;
    t && t.id;
    return {
      setters: [
        function (e) {
          s = e;
        },
        function (e) {
          i = e;
        },
        function (e) {
          o = e;
        },
        function (e) {
          l = e;
        },
        function (e) {
          r = e;
        },
        function (e) {
          a = e;
        },
        function (e) {
          n = e;
        },
        function (e) {
          c = e;
        },
        function (e) {
          h = e;
        },
      ],
      execute: function () {
        ((u = 0.8),
          (d = 16e3),
          (g = new Map([
            [c.ShadowQuality.High, 8],
            [c.ShadowQuality.Medium, 4],
            [c.ShadowQuality.Low, 2],
          ])),
          (p = class p extends i.RenderableContainer {
            get onBeforeCameraUpdate() {
              return this._onBeforeCameraUpdate.asEvent();
            }
            get onCameraUpdate() {
              return this._onCameraUpdate.asEvent();
            }
            static factory(e, t, i) {
              let r = new THREE.Scene();
              r.matrixAutoUpdate = !1;
              var s = p.createCamera(e),
                a = new o.CameraPan(t),
                n = new l.CameraZoom(t);
              return new p(r, s, e, a, n, i);
            }
            static getCameraParams(e) {
              var t = a.Coords.ISO_CAMERA_ALPHA,
                i = a.Coords.ISO_CAMERA_BETA,
                r = a.Coords.ISO_WORLD_SCALE;
              return {
                alpha: t,
                beta: i,
                d: (e.height / 2) * a.Coords.COS_ISO_CAMERA_BETA * r,
                aspect: e.width / e.height,
                far: d * r,
              };
            }
            static createCamera(e) {
              var { alpha: t, beta: i, d: r, aspect: s, far: a } = this.getCameraParams(e);
              let n = new THREE.OrthographicCamera(-r * s, r * s, r, -r, 0, a);
              return ((n.rotation.order = "YXZ"), (n.rotation.y = +i), (n.rotation.x = -t), n);
            }
            constructor(e, t, i, r, s, a) {
              (super(e),
                (this.scene = e),
                (this.camera = t),
                (this.viewport = i),
                (this.cameraPan = r),
                (this.cameraZoom = s),
                (this.shadowQuality = a),
                (this.initialized = !1),
                (this.ambientLight = new THREE.AmbientLight(16777215, u)),
                (this.directionalLight = new THREE.DirectionalLight(16777215, 1)),
                (this._onBeforeCameraUpdate = new n.EventDispatcher()),
                (this._onCameraUpdate = new n.EventDispatcher()));
            }
            updateViewport(e) {
              this.viewport = e;
              var { d: t, aspect: i } = p.getCameraParams(e);
              let r = this.camera;
              ((r.left = -t * i), (r.right = t * i), (r.top = t), (r.bottom = -t), r.updateProjectionMatrix());
            }
            updateCamera(e, t) {
              let i = this.camera;
              i.updateMatrix();
              var r = i.matrix.elements;
              let s = new THREE.Vector3();
              (i.position.set(0, 0, 0),
                i.translateZ(d * a.Coords.ISO_WORLD_SCALE),
                s.set(r[0], r[1], r[2]),
                s.multiplyScalar((e.x * (i.right - i.left)) / this.viewport.width / i.zoom),
                i.position.add(s),
                s.set(r[4], r[5], r[6]),
                s.multiplyScalar((-e.y * (i.top - i.bottom)) / this.viewport.height / i.zoom),
                i.position.add(s),
                (i.zoom = t),
                i.updateProjectionMatrix(),
                i.updateMatrixWorld(!1));
            }
            create3DObject() {
              if ((super.create3DObject(), !this.initialized)) {
                ((this.initialized = !0),
                  (this.scene.position.x -= 0.1 * a.Coords.ISO_WORLD_SCALE),
                  (this.scene.position.z -= 0.1 * a.Coords.ISO_WORLD_SCALE),
                  this.scene.updateMatrix());
                var t = new THREE.AxesHelper(a.Coords.LEPTONS_PER_TILE);
                (this.scene.add(t), this.scene.add(this.ambientLight));
                let e = this.directionalLight;
                (e.position.set(-87.012, 204.338, 195.409),
                  this.lightFocusPoint &&
                    ((e.position.x += this.lightFocusPoint.x),
                    (e.position.z += this.lightFocusPoint.y),
                    e.target.position.set(this.lightFocusPoint.x, 0, this.lightFocusPoint.y),
                    e.target.updateMatrixWorld(void 0)),
                  this.updateShadowQuality(e, this.shadowQuality.value),
                  (this.shadowQualityListener = () => this.updateShadowQuality(e, this.shadowQuality.value)),
                  this.shadowQuality.onChange.subscribe(this.shadowQualityListener),
                  this.scene.add(e),
                  this.scene.add(this.camera));
                t = this.meshBatchManager = new h.MeshBatchManager(this);
                (this.add(t), (this.scene.autoUpdate = !1));
              }
            }
            updateShadowQuality(t, i) {
              var r = i !== c.ShadowQuality.Off;
              if ((t.castShadow = r)) {
                var s = a.Coords.ISO_WORLD_SCALE,
                  r = 3500 * s;
                let e = t.shadow.camera;
                ((e.right = r), (e.left = -r), (e.top = r), (e.bottom = -r), (e.near = -4e3 * s), (e.far = 3e3 * s));
                s = g.get(i);
                if (!s) throw new Error(`Unsupported shadow quality "${i}"`);
                ((t.shadow.mapSize.width = 1024 * s), (t.shadow.mapSize.height = 1024 * s));
              }
            }
            setLightFocusPoint(e, t) {
              this.lightFocusPoint = { x: e, y: t };
            }
            applyLighting(e) {
              var t = e.computeTint(r.LightingType.Ambient);
              (this.ambientLight.color.setRGB(t.x, t.y, t.z), this.directionalLight.color.setRGB(t.x, t.y, t.z));
              t = e.getAmbientIntensity();
              ((this.ambientLight.intensity = t * u), (this.directionalLight.intensity = t));
            }
            update(e, t) {
              (super.update(e, t), this._onBeforeCameraUpdate.dispatch(this, e));
              var i = this.cameraZoom.getZoom(),
                r = this.cameraPan.getPan();
              ((s.pointEquals(r, this.lastCameraPan) && this.lastCameraZoom === i) ||
                (this.updateCamera(r, i), (this.lastCameraZoom = i), (this.lastCameraPan = r)),
                this._onCameraUpdate.dispatch(this, e),
                this.scene.updateMatrixWorld(!1),
                this.meshBatchManager.updateMeshes());
            }
            dispose() {
              (this.shadowQualityListener &&
                (this.shadowQuality.onChange.unsubscribe(this.shadowQualityListener),
                (this.shadowQualityListener = void 0)),
                this.directionalLight.shadow.map?.dispose(),
                this.meshBatchManager &&
                  (this.meshBatchManager.dispose(),
                  this.remove(this.meshBatchManager),
                  (this.meshBatchManager = void 0)),
                this.scene.remove(this.ambientLight),
                this.scene.remove(this.directionalLight));
            }
          }),
          e("WorldScene", p));
      },
    };
  },
);
