// === Reconstructed SystemJS module: engine/renderable/entity/unit/VxlShadowProxy ===
// deps: ["game/Coords"]
// Note: variable/type names are minified approximations of the original TypeScript.

System.register(
  "engine/renderable/entity/unit/VxlShadowProxy",
  ["game/Coords"],
  function (e, t) {
    "use strict";
    var n, i;
    t && t.id;
    return {
      setters: [
        function (e) {
          n = e;
        },
      ],
      execute: function () {
        e(
          "VxlShadowProxy",
          (i = class i {
            constructor(e) {
              this.gameObject = e;
              this.wrap = void 0;
              this.pairs = [];
              this.enabled = !1;
            }
            // 影子副本：把主体的渲染节点树克隆一份，几何与主体共享（VXL geometry pool），材质换成
            // 全局共享的 hiddenMaterial —— 主渲染既不写颜色也不写深度，所以人眼看不到它，但它
            // castShadow = true，实时阴影由这份"低位副本"产生，主体自身的实时投影则被关掉。
            // parentNode 挂载点（posObj，单位的世界位置节点）；sourceNode 主体渲染根（tiltObj）。
            create3DObject(t, e) {
              if (this.wrap) return;
              let r = (this.wrap = new THREE.Object3D());
              ((r.name = "vxl_shadow_proxy"), (r.matrixAutoUpdate = !1), t.add(r), r.updateMatrix());
              let s = e.clone(!0);
              r.add(s);
              // 克隆树的节点一律改成手动矩阵：影子只在真正变化时重算，避免每帧把整棵子树标脏 ——
              // 否则 InstancedMesh 会每帧重传一遍实例矩阵。
              let a = (this.pairs = []);
              const o = (srcNode, dstNode) => {
                // 只动克隆树：主体节点的 matrixAutoUpdate 必须保持原样（Aircraft 的 tiltObj
                // 依赖它自动合成朝向矩阵）。
                dstNode.matrixAutoUpdate = !1;
                a.push([srcNode, dstNode]);
                for (let i = 0; i < srcNode.children.length; i++) o(srcNode.children[i], dstNode.children[i]);
              };
              o(e, s);
              s.traverse((t) => {
                if (t.isMesh) {
                  t.material = i.material;
                  t.castShadow = !0;
                  t.receiveShadow = !1;
                  // 这些字段由 BatchedMesh 构造时赋上，clone 不会带过来，但批处理管理器会读。
                  t.clippingPlanes = [];
                  t.clippingPlanesHash = "";
                  t.opacity = 1;
                  t.extraLight = new THREE.Vector3();
                  t.lightDir = new THREE.Vector3(-1, 0, 0);
                  t.paletteIndex = 0;
                }
              });
              this.enabled = !1;
              r.visible = !1;
            }
            setEnabled(t) {
              this.enabled = t;
              this.wrap &&
                ((this.wrap.visible = t),
                t || ((this.wrap.position.y = 0), this.wrap.updateMatrix()));
            }
            // 单位相对地面的净高度 = 绝对高度 − 地面高度。上限取 0.5 格 —— 原版飞行单位的阴影
            // 只略微偏离机体正下方，而 1 格在 ISO 视角下约等于机身长度的 2/3，仍然显眼。
            //
            // ⚠️ 地面高度必须取 tile.z（地形高度层，与 WingedLocomotor/JumpjetLocomotor 的基准一致），
            // 绝不能用 position.tileElevation —— ObjectPosition 在它未被显式赋值时会
            // computeTileElevationFromWorldPos() 从 worldPosition 反算，对飞行单位等于"当前飞行
            // 高度层"，两者相减恒为 0，封顶会完全失效（这个坑踩过一次）。
            computeSink() {
              var e = this.gameObject,
                t = e.position.getBridgeBelow(),
                r = n.Coords.tileHeightToWorld(t ? t.tileElevation : e.tile.z);
              return Math.max(0, e.position.worldPosition.y - r - i.MAX_PROJECTION_HEIGHT);
            }
            syncVector(e, t) {
              return e.x === t.x && e.y === t.y && e.z === t.z ? !1 : (e.set(t.x, t.y, t.z), !0);
            }
            update() {
              var e = this.wrap;
              if (!e || !this.enabled) return;
              let t = this.pairs;
              for (let i = 0; i < t.length; i++) {
                let r = t[i][0],
                  s = t[i][1],
                  a = !1;
                if (s.visible !== r.visible) ((s.visible = r.visible), (a = !0));
                if (this.syncVector(s.position, r.position)) a = !0;
                if (this.syncVector(s.rotation, r.rotation)) a = !0;
                if (this.syncVector(s.scale, r.scale)) a = !0;
                a && s.updateMatrix();
              }
              var o = -this.computeSink();
              (o !== e.position.y && ((e.position.y = o), e.updateMatrix()),
                // 报告一次实际参数，便于在控制台确认封顶真的生效 —— sink 若恒为 0，说明地面
                // 基准取错了（见 computeSink 的注释），而不是"上限设得太小"。
                i._reported ||
                  ((i._reported = !0),
                  console.debug(
                    "[VxlShadowProxy] cap active: offset ≤ " +
                      (i.MAX_SHADOW_OFFSET / n.Coords.LEPTONS_PER_TILE).toFixed(2) +
                      " tile (MAX_SHADOW_OFFSET=" +
                      i.MAX_SHADOW_OFFSET +
                      ", MAX_PROJECTION_HEIGHT=" +
                      i.MAX_PROJECTION_HEIGHT.toFixed(1) +
                      "), current sink=" +
                      (-o).toFixed(0),
                  )));
            }
            dispose() {
              this.wrap?.parent?.remove(this.wrap);
              this.wrap = void 0;
              this.pairs = [];
              this.enabled = !1;
            }
          }),
          // 影子只负责投影：不写颜色、不写深度，主渲染里等价于不存在，但仍参与 shadow pass。
          (i.material = new THREE.MeshBasicMaterial({ colorWrite: !1, depthWrite: !1, depthTest: !1 })),
          // 光照方向取自 WorldScene 的 directionalLight：position(-87.012, 204.338, 195.409) → target(0,0,0)，
          // 高度 h 产生的水平阴影偏移 = h × (水平分量 / 垂直分量) ≈ h × 1.0468。
          (i.SHADOW_OFFSET_PER_HEIGHT = Math.hypot(87.012, 195.409) / 204.338),
          // 阴影偏移上限 = 0.5 格（世界单位）。调小 = 影子更贴机体正下方，0 = 完全贴正下方；
          // 每格 = Coords.LEPTONS_PER_TILE（256）。默认值对应 MAX_PROJECTION_HEIGHT ≈ 122.3。
          (i.MAX_SHADOW_OFFSET = n.Coords.LEPTONS_PER_TILE * 0.5),
          (i.MAX_PROJECTION_HEIGHT = i.MAX_SHADOW_OFFSET / i.SHADOW_OFFSET_PER_HEIGHT));
      },
    };
  },
);
