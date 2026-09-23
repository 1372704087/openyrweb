/**
 * Aircraft — 飞行器渲染件（VXL + 旋翼 + 影子副本 + 高亮/无敌）。
 *
 * 多套调色板 remap（含 berserk 全红）；update 处理 veteran 高亮、
 * invulnerable 脉冲、warp/cloak 半透明、owner 换色、missileSpawn 起飞
 * V3TAKOFF、pitch/yaw/roll 与旋翼旋转；影子交由 VxlShadowProxy。
 *
 * 由 engine/renderable/entity/Aircraft.ts.js 重写为 TS（行为完全一致）。
 * 两个文件并存期间，本文件才是修改目标：tools/repack.mjs 打包时优先
 * 采用 .ts 模块的编译产物。
 */
import { Coords } from "game/Coords"; // 已转换
import { WithPosition } from "engine/renderable/WithPosition"; // 已转换
import * as DebugUtilsModule from "engine/gfx/DebugUtils"; // 孪生
import { getRandomInt } from "util/math"; // 已转换
import { VeteranLevel } from "game/gameobject/unit/VeteranLevel"; // 已转换
import { HighlightAnimRunner } from "engine/renderable/entity/HighlightAnimRunner"; // 已转换
import { AnimationState } from "engine/Animation"; // 已转换
import { DeathType } from "game/gameobject/common/DeathType"; // 已转换
import { ZoneType } from "game/gameobject/unit/ZoneType"; // 已转换
import { InvulnerableAnimRunner } from "engine/renderable/entity/InvulnerableAnimRunner"; // 已转换
import { BoxIntersectObject3D } from "engine/renderable/entity/BoxIntersectObject3D"; // 已转换
import * as RotorHelperModule from "engine/renderable/entity/unit/RotorHelper"; // 孪生
import * as ExtraLightHelperModule from "engine/renderable/entity/unit/ExtraLightHelper"; // 孪生
import * as DebugRenderableModule from "engine/renderable/DebugRenderable"; // 孪生
import * as VxlShadowProxyModule from "engine/renderable/entity/unit/VxlShadowProxy"; // 孪生

/* eslint-disable @typescript-eslint/no-explicit-any */

// 孪生 any-shim：未转换模块的具名导出不可用，取命名空间成员
const DebugUtils: any = (DebugUtilsModule as any).DebugUtils;
const RotorHelper: any = (RotorHelperModule as any).RotorHelper;
const ExtraLightHelper: any = (ExtraLightHelperModule as any).ExtraLightHelper;
const DebugRenderable: any = (DebugRenderableModule as any).DebugRenderable;
const VxlShadowProxy: any = (VxlShadowProxyModule as any).VxlShadowProxy;

/**
 * 飞行器渲染件。
 * 目标为 BoxIntersectObject3D（1×1/3×1 盒体拾取）。
 */
export class Aircraft {
  /** 宿主对象。 */
  gameObject: any;
  /** 规则。 */
  rules: any;
  /** VXL 资源。 */
  voxels: any;
  /** HVA 动画资源。 */
  voxelAnims: any;
  /** 调色板。 */
  palette: any;
  /** 光照。 */
  lighting: any;
  /** 调试线框。 */
  debugFrame: any;
  /** 游戏速度。 */
  gameSpeed: any;
  /** 选择模型。 */
  selectionModel: any;
  /** VXL 工厂。 */
  vxlBuilderFactory: any;
  /** 是否精灵批处理。 */
  useSpriteBatching: any;
  /** 挂载 pip 覆盖。 */
  pipOverlay: any;
  /** 旋翼速度缓存。 */
  rotorSpeeds: any[] = [];
  /** 全部 VXL builder。 */
  vxlBuilders: any[] = [];
  /** 高亮驱动。 */
  highlightAnimRunner: any;
  /** 无敌脉冲驱动。 */
  invulnAnimRunner: any;
  /** 插件。 */
  plugins: any[] = [];
  /** 对象规则。 */
  objectRules: any;
  /** 对象 art。 */
  objectArt: any;
  /** 调试名。 */
  label: string;

  /** 阵营/狂暴等调色板组。 */
  paletteRemaps: any[] = [];
  /** 狂暴全红调色板。 */
  __berserkPalette: any;
  /** 是否处于狂暴（上次）。 */
  __wasBerserk: boolean | undefined;
  /** 上次 owner 色。 */
  lastOwnerColor: any;
  /** 位置组件。 */
  withPosition: any;
  /** 基础光。 */
  baseExtraLight: any;
  /** 当前额外光。 */
  extraLight: any;
  /** 外层拾取盒。 */
  target: any;
  /** 俯仰容器。 */
  tiltObj: any;
  /** 位置容器。 */
  posObj: any;
  /** 旋翼 section。 */
  rotors: any;
  /** 缺图占位。 */
  placeholder: any;
  /** 影子副本。 */
  shadowProxy: any;
  /** 渲染管理器（onCreate 注入）。 */
  renderableManager: any;
  /** 上次 veteran 等级。 */
  lastVeteranLevel: any;
  /** 上次无敌状态。 */
  lastInvulnerable: any;
  /** 上次 warpedOut。 */
  lastWarpedOut: any;
  /** 上次 cloaked。 */
  lastCloaked: any;
  /** 上次 zone。 */
  lastZone: any;
  /** 影子代理是否空影。 */
  _airShadowOn: boolean | undefined;

  /**
   * @param gameObject - 宿主
   * @param rules - 规则
   * @param voxels - VXL
   * @param voxelAnims - HVA
   * @param palette - 调色板
   * @param camera - 相机（孪生第 6 参；本类未直接持有，占位对齐 arity）
   * @param lighting - 光照
   * @param debugFrame - 调试 Ref
   * @param gameSpeed - 游戏速度
   * @param selectionModel - 选择模型
   * @param vxlBuilderFactory - VXL 工厂
   * @param useSpriteBatching - 批处理
   * @param pipOverlay - pip 覆盖
   */
  constructor(
    gameObject: any,
    rules: any,
    voxels: any,
    voxelAnims: any,
    palette: any,
    camera: any,
    lighting: any,
    debugFrame: any,
    gameSpeed: any,
    selectionModel: any,
    vxlBuilderFactory: any,
    useSpriteBatching: any,
    pipOverlay: any,
  ) {
    this.gameObject = gameObject;
    this.rules = rules;
    this.voxels = voxels;
    this.voxelAnims = voxelAnims;
    this.palette = palette;
    this.lighting = lighting;
    this.debugFrame = debugFrame;
    this.gameSpeed = gameSpeed;
    this.selectionModel = selectionModel;
    this.vxlBuilderFactory = vxlBuilderFactory;
    this.useSpriteBatching = useSpriteBatching;
    this.pipOverlay = pipOverlay;
    this.rotorSpeeds = [];
    this.vxlBuilders = [];
    this.highlightAnimRunner = new HighlightAnimRunner(this.gameSpeed);
    this.invulnAnimRunner = new InvulnerableAnimRunner(this.gameSpeed);
    this.plugins = [];
    this.objectRules = gameObject.rules;
    this.objectArt = gameObject.art;
    this.label = "aircraft_" + this.objectRules.name;
    this.init();
  }

  /** 预生成颜色 remap 与 berserk 全红盘，挂位置与光照。 */
  init(): void {
    this.paletteRemaps = [...this.rules.colors.values()].map((c) => this.palette.clone().remap(c));
    this.palette.remap(this.gameObject.owner.color);
    // 预挂全红狂暴盘（r=255，gb 各减 20）
    (() => {
      this.__berserkPalette = this.palette.clone();
      for (let i = 0; i < this.__berserkPalette.colors.length; i++) {
        const color = this.__berserkPalette.colors[i];
        color.r = 255;
        color.g = Math.max(0, color.g - 20);
        color.b = Math.max(0, color.b - 20);
      }
      this.__berserkPalette._hash = this.__berserkPalette.computeHash(this.__berserkPalette.colors);
      this.paletteRemaps.push(this.__berserkPalette);
    })();
    this.lastOwnerColor = this.gameObject.owner.color;
    this.withPosition = new WithPosition();
    this.updateBaseLight();
    this.extraLight = new THREE.Vector3().copy(this.baseExtraLight);
  }

  /** 无环境光 + extraAircraftLight。 */
  updateBaseLight(): void {
    this.baseExtraLight = new THREE.Vector3().setScalar(
      this.lighting.computeNoAmbient(this.objectArt.lightingType, this.gameObject.tile) +
        this.rules.audioVisual.extraAircraftLight,
    );
  }

  /** 刷新插件与基础光。 */
  updateLighting(): void {
    this.plugins.forEach((p) => p.updateLighting?.());
    this.updateBaseLight();
    this.extraLight.copy(this.baseExtraLight);
  }

  /** 外层 Object3D。 */
  get3DObject(): any {
    return this.target;
  }

  /** 射线拾取目标（同 target）。 */
  getIntersectTarget(): any {
    return this.target;
  }

  /** UI 名（可被插件覆盖）。 */
  getUiName(): any {
    const override = this.plugins.reduce((acc, p) => p.getUiNameOverride?.() ?? acc, void 0);
    return override !== void 0 ? override : this.gameObject.getUiName();
  }

  /** 惰性创建盒体 target、子对象、pip。 */
  create3DObject(): void {
    let obj = this.get3DObject();
    if (!obj) {
      obj = new BoxIntersectObject3D(
        new THREE.Vector3(1, 1 / 3, 1).multiplyScalar(
          Coords.LEPTONS_PER_TILE * (this.gameObject.rules.spawned ? 0.5 : 1),
        ),
      );
      obj.name = this.label;
      obj.userData.id = this.gameObject.id;
      this.target = obj;
      obj.matrixAutoUpdate = false;
      this.withPosition.matrixUpdate = true;
      this.withPosition.applyTo(this);
      this.createObjects(obj);
      this.vxlBuilders.forEach((b) => b.setExtraLight(this.extraLight));
      if (this.pipOverlay) {
        this.pipOverlay.create3DObject();
        this.posObj?.add(this.pipOverlay.get3DObject());
      }
    }
  }

  /**
   * 设置位置。
   * @param pos - 位置
   */
  setPosition(pos: any): void {
    this.withPosition.setPosition(pos.x, pos.y, pos.z);
  }

  /** 当前位置。 */
  getPosition(): any {
    return this.withPosition.getPosition();
  }

  /**
   * 注册插件。
   * @param plugin - 插件
   */
  registerPlugin(plugin: any): void {
    this.plugins.push(plugin);
  }

  /** 触发 2 圈高亮（除非插件禁用）。 */
  highlight(): void {
    if (this.plugins.some((p) => p.shouldDisableHighlight?.())) return;
    if (this.highlightAnimRunner.animation.getState() !== AnimationState.RUNNING) {
      this.highlightAnimRunner.animate(2);
    }
  }

  /**
   * 每帧主更新。
   * @param now - 当前时间戳（ms）
   */
  update(now: number): void {
    this.plugins.forEach((p) => p.update(now));
    this.pipOverlay?.update(now);

    // 升 Elite 高亮 30 圈
    if (this.gameObject.veteranLevel !== this.lastVeteranLevel) {
      if (this.gameObject.veteranLevel === VeteranLevel.Elite && this.lastVeteranLevel !== void 0) {
        this.highlightAnimRunner.animate(30);
      }
      this.lastVeteranLevel = this.gameObject.veteranLevel;
    }

    const doHighlight = this.highlightAnimRunner.shouldUpdate();
    const invuln = this.gameObject.invulnerableTrait.isActive();
    const invulnChanged = invuln !== this.lastInvulnerable;
    this.lastInvulnerable = invuln;
    if (this.lastInvulnerable && invulnChanged) {
      this.invulnAnimRunner.animate();
    }
    if (this.invulnAnimRunner.shouldUpdate()) {
      this.invulnAnimRunner.tick(now);
    }
    if (doHighlight || invulnChanged) {
      if (doHighlight) this.highlightAnimRunner.tick(now);
      const invulnVal = invuln ? this.invulnAnimRunner.getValue() : 0;
      const boost = (doHighlight ? this.highlightAnimRunner.getValue() : 0) || invulnVal;
      const ambient = this.lighting.getAmbientIntensity();
      ExtraLightHelper.multiplyVxl(this.extraLight, this.baseExtraLight, ambient, boost);
    }

    // 狂暴调色板切换
    (() => {
      const isBerserk = !!this.gameObject.berserkTrait?.isBerserk();
      if (isBerserk !== this.__wasBerserk) {
        this.__wasBerserk = isBerserk;
        const pal = isBerserk ? this.__berserkPalette : this.palette;
        this.vxlBuilders.forEach((b) => b.setPalette(pal));
        this.placeholder?.setPalette(pal);
      }
    })();

    // warpedOut / cloak 半透明
    const warped = this.gameObject.warpedOutTrait.isActive();
    const warpedChanged = warped !== this.lastWarpedOut;
    this.lastWarpedOut = warped;
    const cloaked = this.gameObject.cloakableTrait?.isCloaked();
    const cloakChanged = cloaked !== this.lastCloaked;
    this.lastCloaked = cloaked;
    if (warpedChanged || cloakChanged) {
      const opacity = warped || cloaked ? 0.5 : 1;
      this.vxlBuilders.forEach((b) => b.setOpacity(opacity));
      this.placeholder?.setOpacity(opacity);
    }

    // owner 换色
    const ownerColor = this.gameObject.owner.color;
    if (this.lastOwnerColor !== ownerColor) {
      this.palette.remap(ownerColor);
      this.lastOwnerColor = ownerColor;
      this.vxlBuilders.forEach((b) => b.setPalette(this.palette));
      this.placeholder?.setPalette(this.palette);
    }

    // 空中导弹起飞动画
    const zone = this.gameObject.zone;
    if (zone !== this.lastZone) {
      if (
        this.gameObject.rules.missileSpawn &&
        zone === ZoneType.Air &&
        this.lastZone !== ZoneType.Air
      ) {
        this.renderableManager.createTransientAnim("V3TAKOFF", (a: any) =>
          a.setPosition(this.withPosition.getPosition()),
        );
      }
      this.lastZone = zone;
    }

    this.updateVxlRotation();
    this.updateShadowProxy();
  }

  /** 按 pitch/yaw/roll 与旋翼速度更新旋转。 */
  updateVxlRotation(): void {
    const { pitch, yaw, roll } = this.gameObject;
    this.tiltObj.rotation.z = THREE.Math.degToRad(roll);
    this.tiltObj.rotation.x = THREE.Math.degToRad(pitch);
    this.tiltObj.rotation.y = THREE.Math.degToRad(yaw);
    if (this.rotors) {
      this.rotors.forEach((section: any, i: number) => {
        this.rotorSpeeds[i] = RotorHelper.computeRotationStep(
          this.gameObject,
          this.rotorSpeeds[i] ?? 0,
          this.objectArt.rotors[i],
        );
        if (this.rotorSpeeds[i]) {
          section.rotateOnAxis(this.objectArt.rotors[i].axis, this.rotorSpeeds[i]);
          section.updateMatrix();
        }
      });
    }
  }

  // 只有真正升空的单位才走影子副本 —— 停在地面时保持主体的实时投影，
  // 避免起飞/降落瞬间出现"两个影子"。
  /** 切换影子代理启用状态。 */
  updateShadowProxy(): void {
    if (!this.shadowProxy) return;
    const airborne = this.gameObject.zone === ZoneType.Air;
    if (airborne !== this._airShadowOn) {
      this._airShadowOn = airborne;
      this.shadowProxy.setEnabled(airborne);
      this.vxlBuilders.forEach((b) => b.setShadow(!airborne));
    }
    if (airborne) this.shadowProxy.update();
  }

  /**
   * 创建 tilt/pos 层与影子代理。
   * @param parent - 父 Object3D
   */
  createObjects(parent: any): void {
    if (this.debugFrame.value) {
      const wire = DebugUtils.createWireframe({ width: 1, height: 1 }, 1);
      wire.translateX(-Coords.getWorldTileSize() / 2);
      wire.translateZ(-Coords.getWorldTileSize() / 2);
      parent.add(wire);
    }

    const tilt = (this.tiltObj = new THREE.Object3D());
    tilt.rotation.order = "YXZ";
    const main = this.createMainObject();
    tilt.add(main);

    const pos = (this.posObj = new THREE.Object3D());
    pos.matrixAutoUpdate = false;
    pos.add(tilt);
    parent.add(pos);

    // 空中单位的阴影偏移随飞行高度线性放大（光源约 46° 斜射，
    // 偏移 ≈ 高度 × 1.047），入侵者/黑鹰这类 FlightLevel=1500 的飞机会偏出约 6 格。
    // 改用"影子副本"：主体不再投影，改由这份被限制在低位的不可见克隆投影，
    // 偏移因此封顶在约 1 格。详见 VxlShadowProxy。
    this.shadowProxy = new VxlShadowProxy(this.gameObject);
    this.shadowProxy.create3DObject(pos, tilt);
  }

  /** 加载 VXL（缺图用 DebugRenderable 占位）。 */
  createMainObject(): any {
    const baseName = this.objectArt.imageName.toLowerCase();
    const vxlName = baseName + ".vxl";
    const vxl = this.voxels.get(vxlName);
    if (!vxl) {
      console.warn(
        `VXL missing for aircraft ${this.objectRules.name}. Vxl file ${vxlName} not found. `,
      );
      this.placeholder = new DebugRenderable(
        { width: 0.5, height: 0.5 },
        this.objectArt.height,
        this.palette,
        { centerFoundation: true },
      );
      this.placeholder.setBatched(this.useSpriteBatching);
      if (this.useSpriteBatching) {
        this.placeholder.setBatchPalettes(this.paletteRemaps);
      }
      this.placeholder.create3DObject();
      return this.placeholder.get3DObject();
    }

    const hva = this.objectArt.noHva ? void 0 : this.voxelAnims.get(baseName + ".hva");
    const palettes = [...this.rules.colors.values()].map((c) => this.palette.clone().remap(c));
    const builder = this.vxlBuilderFactory.create(vxl, hva, palettes, this.palette);
    this.vxlBuilders.push(builder);
    const mesh = builder.build();

    if (this.objectArt.rotors) {
      this.rotors = this.objectArt.rotors.map((rotor: any) => {
        const section = builder.getSection(rotor.name);
        if (!section) {
          throw new Error(
            `Aircraft "${this.objectRules.name}" VXL section "${rotor.name}" not found`,
          );
        }
        return section;
      });
    }
    return mesh;
  }

  /**
   * 创建回调。
   * @param manager - 渲染管理器
   */
  onCreate(manager: any): void {
    this.renderableManager = manager;
    this.plugins.forEach((p) => p.onCreate(manager));
  }

  /**
   * 移除：播爆炸（导弹沿速度延长 bodyLength）。
   * @param manager - 渲染管理器
   */
  onRemove(manager: any): void {
    this.renderableManager = void 0;
    this.plugins.forEach((p) => p.onRemove(manager));
    if (
      this.gameObject.isDestroyed &&
      this.objectRules.explosion.length &&
      this.gameObject.deathType !== DeathType.Temporal &&
      this.gameObject.deathType !== DeathType.None
    ) {
      const explosion = this.objectRules.explosion[getRandomInt(0, this.objectRules.explosion.length - 1)];
      manager.createTransientAnim(explosion, (anim: any) => {
        let pos = this.withPosition.getPosition();
        if (this.gameObject.rules.missileSpawn) {
          pos = pos
            .clone()
            .add(
              this.gameObject.moveTrait.velocity
                .clone()
                .setLength(this.rules.general.getMissileRules(this.gameObject.name).bodyLength),
            );
        }
        anim.setPosition(pos);
      });
    }
  }

  /** 释放插件与资源。 */
  dispose(): void {
    this.plugins.forEach((p) => p.dispose());
    this.pipOverlay?.dispose();
    this.shadowProxy?.dispose();
    this.vxlBuilders.forEach((b) => b.dispose());
    this.placeholder?.dispose();
  }
}
