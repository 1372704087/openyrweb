/**
 * VxlShadowProxy — VXL 单位的实时阴影副本节点（共享几何、隐藏材质）。
 *
 * clone 主体渲染树为低位副本，材质换成全局 hiddenMaterial（不写色深），
 * castShadow=true 供 shadow pass；computeSink 按桥下/地面高度封顶下沉量。
 *
 * 由 engine/renderable/entity/unit/VxlShadowProxy.ts.js 重写为 TS（行为完全一致）。
 * 两个文件并存期间，本文件才是修改目标：tools/repack.mjs 打包时优先采用 .ts 模块的编译产物。
 */
import { Coords } from "game/Coords"; // 已转换

/* eslint-disable @typescript-eslint/no-explicit-any */

/** VXL 阴影代理。 */
export class VxlShadowProxy {
  /** 全局不写颜色/深度材质（仅参与 shadow pass）。 */
  static material: any = new (THREE as any).MeshBasicMaterial({
    colorWrite: false,
    depthWrite: false,
    depthTest: false,
  });
  /** 光照方向水平/垂直分量比（WorldScene directionalLight 近似）。 */
  static readonly SHADOW_OFFSET_PER_HEIGHT: number = Math.hypot(87.012, 195.409) / 204.338;
  /** 阴影偏移上限（0.5 格世界单位）。 */
  static readonly MAX_SHADOW_OFFSET: number = Coords.LEPTONS_PER_TILE * 0.5;
  /** 对应最大投影高度。 */
  static readonly MAX_PROJECTION_HEIGHT: number = VxlShadowProxy.MAX_SHADOW_OFFSET / VxlShadowProxy.SHADOW_OFFSET_PER_HEIGHT;

  /** 所属单位。 */
  gameObject: any;
  /** 阴影副本根节点。 */
  wrap?: any;
  /** [源节点, 克隆节点] 对。 */
  pairs: [any, any][];
  /** 是否启用更新。 */
  enabled: boolean;
  /** 已报告封顶日志。 */
  private static _reported = false;

  /** @param gameObject - 单位 */
  constructor(gameObject: any) {
    this.gameObject = gameObject;
    this.wrap = undefined;
    this.pairs = [];
    this.enabled = false;
  }

  // 影子副本：把主体的渲染节点树克隆一份，几何与主体共享（VXL geometry pool），材质换成
  // 全局共享的 hiddenMaterial —— 主渲染既不写颜色也不写深度，所以人眼看不到它，但它
  // castShadow = true，实时阴影由这份"低位副本"产生，主体自身的实时投影则被关掉。
  // parentNode 挂载点（posObj，单位的世界位置节点）；sourceNode 主体渲染根（tiltObj）。
  /**
   * 创建阴影副本树。
   * @param parentNode - 挂载点（posObj）
   * @param sourceNode - 主体渲染根（tiltObj）
   */
  create3DObject(parentNode: any, sourceNode: any): void {
    if (this.wrap) return;
    const wrap = (this.wrap = new (THREE as any).Object3D());
    wrap.name = "vxl_shadow_proxy";
    wrap.matrixAutoUpdate = false;
    parentNode.add(wrap);
    wrap.updateMatrix();
    const clone = sourceNode.clone(true);
    wrap.add(clone);
    // 克隆树的节点一律改成手动矩阵：影子只在真正变化时重算，避免每帧把整棵子树标脏 ——
    // 否则 InstancedMesh 会每帧重传一遍实例矩阵。
    const pairs: [any, any][] = (this.pairs = []);
    const walk = (src: any, dst: any) => {
      // 只动克隆树：主体节点的 matrixAutoUpdate 必须保持原样（Aircraft 的 tiltObj
      // 依赖它自动合成朝向矩阵）。
      dst.matrixAutoUpdate = false;
      pairs.push([src, dst]);
      for (let i = 0; i < src.children.length; i++) walk(src.children[i], dst.children[i]);
    };
    walk(sourceNode, clone);
    clone.traverse((node: any) => {
      if (node.isMesh) {
        node.material = VxlShadowProxy.material;
        node.castShadow = true;
        node.receiveShadow = false;
        // 这些字段由 BatchedMesh 构造时赋上，clone 不会带过来，但批处理管理器会读。
        node.clippingPlanes = [];
        node.clippingPlanesHash = "";
        node.opacity = 1;
        node.extraLight = new (THREE as any).Vector3();
        node.lightDir = new (THREE as any).Vector3(-1, 0, 0);
        node.paletteIndex = 0;
      }
    });
    this.enabled = false;
    wrap.visible = false;
  }

  /** 开关阴影副本可见性；关闭时重置 y。 */
  setEnabled(enabled: boolean): void {
    this.enabled = enabled;
    if (this.wrap) {
      this.wrap.visible = enabled;
      if (!enabled) {
        this.wrap.position.y = 0;
        this.wrap.updateMatrix();
      }
    }
  }

  // 单位相对地面的净高度 = 绝对高度 − 地面高度。上限取 0.5 格 —— 原版飞行单位的阴影
  // 只略微偏离机体正下方，而 1 格在 ISO 视角下约等于机身长度的 2/3，仍然显眼。
  //
  // ⚠️ 地面高度必须取 tile.z（地形高度层，与 WingedLocomotor/JumpjetLocomotor 的基准一致），
  // 绝不能用 position.tileElevation —— ObjectPosition 在它未被显式赋值时会
  // computeTileElevationFromWorldPos() 从 worldPosition 反算，对飞行单位等于"当前飞行
  // 高度层"，两者相减恒为 0，封顶会完全失效（这个坑踩过一次）。
  /** 计算投影下沉封顶量。 */
  computeSink(): number {
    const obj = this.gameObject;
    const bridgeBelow = obj.position.getBridgeBelow();
    const groundY = Coords.tileHeightToWorld(bridgeBelow ? bridgeBelow.tileElevation : obj.tile.z);
    return Math.max(0, obj.position.worldPosition.y - groundY - VxlShadowProxy.MAX_PROJECTION_HEIGHT);
  }

  /**
   * 分量不同则 set 并返回 true。
   * @param dst - 目标 Vector3
   * @param src - 源 Vector3
   */
  syncVector(dst: any, src: any): boolean {
    if (dst.x === src.x && dst.y === src.y && dst.z === src.z) return false;
    dst.set(src.x, src.y, src.z);
    return true;
  }

  /** 每帧：同步克隆树变换与封顶 y。 */
  update(): void {
    const wrap = this.wrap;
    if (!wrap || !this.enabled) return;
    const pairs = this.pairs;
    for (let i = 0; i < pairs.length; i++) {
      const src = pairs[i][0];
      const dst = pairs[i][1];
      let dirty = false;
      if (dst.visible !== src.visible) {
        dst.visible = src.visible;
        dirty = true;
      }
      if (this.syncVector(dst.position, src.position)) dirty = true;
      if (this.syncVector(dst.rotation, src.rotation)) dirty = true;
      if (this.syncVector(dst.scale, src.scale)) dirty = true;
      if (dirty) dst.updateMatrix();
    }
    const y = -this.computeSink();
    if (y !== wrap.position.y) {
      wrap.position.y = y;
      wrap.updateMatrix();
    }
    // 报告一次实际参数，便于在控制台确认封顶真的生效 —— sink 若恒为 0，说明地面
    // 基准取错了（见 computeSink 的注释），而不是"上限设得太小"。
    if (!VxlShadowProxy._reported) {
      VxlShadowProxy._reported = true;
      console.debug(
        "[VxlShadowProxy] cap active: offset ≤ " +
          (VxlShadowProxy.MAX_SHADOW_OFFSET / Coords.LEPTONS_PER_TILE).toFixed(2) +
          " tile (MAX_SHADOW_OFFSET=" +
          VxlShadowProxy.MAX_SHADOW_OFFSET +
          ", MAX_PROJECTION_HEIGHT=" +
          VxlShadowProxy.MAX_PROJECTION_HEIGHT.toFixed(1) +
          "), current sink=" +
          (-y).toFixed(0),
      );
    }
  }

  /** 脱离父节点并清空状态。 */
  dispose(): void {
    this.wrap?.parent?.remove(this.wrap);
    this.wrap = undefined;
    this.pairs = [];
    this.enabled = false;
  }
}
