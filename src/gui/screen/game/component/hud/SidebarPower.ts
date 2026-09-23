/**
 * SidebarPower — 侧栏电量条（索引色 pip 堆叠 + 高亮闪烁）。
 *
 * 由 gui/screen/game/component/hud/SidebarPower.ts.js
 * 重写为 TS（行为完全一致）。
 *
 * 两个文件并存期间，本文件才是修改目标：tools/repack.mjs 打包时优先采用 .ts 模块的编译产物。
 */
import * as jsxModule from "gui/jsx/jsx"; // 孪生
import * as UiObjectModule from "gui/UiObject"; // 孪生
import * as UiComponentModule from "gui/jsx/UiComponent"; // 孪生
import * as HtmlContainerModule from "gui/HtmlContainer"; // 孪生
import * as BitmapModule from "data/Bitmap"; // 孪生
import * as SpriteUtilsModule from "engine/gfx/SpriteUtils"; // 孪生
import { clamp } from "util/math"; // 已转换
import * as TextureUtilsModule from "engine/gfx/TextureUtils"; // 孪生
import * as HighlightAnimRunnerModule from "engine/renderable/entity/HighlightAnimRunner"; // 孪生
import { BoxedVar } from "util/BoxedVar"; // 已转换
import * as arrayModule from "util/array"; // 孪生
import * as PaletteBasicMaterialModule from "engine/gfx/material/PaletteBasicMaterial"; // 孪生

/* eslint-disable @typescript-eslint/no-explicit-any */

// 孪生 any-shim
const jsx: any = (jsxModule as any).jsx;
const UiObject: any = (UiObjectModule as any).UiObject;
const UiComponent: any = (UiComponentModule as any).UiComponent;
const HtmlContainer: any = (HtmlContainerModule as any).HtmlContainer;
const IndexedBitmap: any = (BitmapModule as any).IndexedBitmap;
const SpriteUtils: any = SpriteUtilsModule as any;
const TextureUtils: any = TextureUtilsModule as any;
const HighlightAnimRunner: any = (HighlightAnimRunnerModule as any).HighlightAnimRunner;
const findReverse: any = (arrayModule as any).findReverse;
const PaletteBasicMaterial: any = (PaletteBasicMaterialModule as any).PaletteBasicMaterial;

/** pip 色槽。 */
enum PipKind {
  /** 空 */
  None = 0,
  /** 绿 */
  Green = 1,
  /** 黄 */
  Yellow = 2,
  /** 红 */
  Red = 3,
  /** 高亮 */
  Highlight = 4,
}

/**
 * 三色计数是否相同。
 * @param a A
 * @param b B
 */
function samePipCount(a: any, b: any): boolean {
  return a.green === b.green && a.yellow === b.yellow && a.red === b.red;
}

/** 侧栏电力条。 */
export class SidebarPower extends UiComponent {
  /** 是否可见。 */
  visible = true;
  /** 高亮动画。 */
  pipHighlightAnimRunner: any;
  /** pip 位图列表。 */
  pips: any[];
  /** 目标位图。 */
  textureBitmap: any;
  /** 纹理。 */
  texture: any;
  /** mesh。 */
  mesh: any;
  /** mesh 事件目标。 */
  meshEvtTarget: any;
  /** 上次耗电。 */
  lastPowerDrained: any;
  /** 上次发电。 */
  lastPowerGenerated: any;
  /** 目标 pip 计数。 */
  targetPipCount: any;
  /** 当前 pip 计数。 */
  pipCount: any;
  /** 上次 pip 更新。 */
  lastPipUpdate: number | undefined;

  /** 构造初始化高亮动画。 */
  constructor(...args: any[]) {
    super(...args);
    this.visible = true;
    this.pipHighlightAnimRunner = new HighlightAnimRunner(
      new BoxedVar(1),
      1,
      2,
      15,
    );
  }

  /** 根对象 + 纹理 mesh。 */
  createUiObject(): any {
    const obj = new UiObject(new THREE.Object3D(), new HtmlContainer());
    obj.setPosition(this.props.x || 0, this.props.y || 0);
    this.pips = this.createPips(this.props.powerImg);
    const width = this.props.powerImg.width;
    const height = this.props.height;
    this.textureBitmap = new IndexedBitmap(width, height);
    this.texture = this.createDataTexture(this.textureBitmap.data, width, height);
    this.mesh = this.createMesh(width, height);
    return obj;
  }

  /**
   * 预取各帧 pip 位图。
   * @param powerImg 电量 SHP
   */
  createPips(powerImg: any): any[] {
    const out: any[] = [];
    for (let i = 0; i < powerImg.numImages; i++) {
      const img = powerImg.getImage(i);
      out.push(new IndexedBitmap(img.width, img.height, img.imageData));
    }
    return out;
  }

  /**
   * Alpha 数据纹理。
   * @param data 数据
   * @param width 宽
   * @param height 高
   */
  createDataTexture(data: any, width: number, height: number): any {
    const texture = new THREE.DataTexture(data, width, height, THREE.AlphaFormat);
    texture.needsUpdate = true;
    texture.minFilter = THREE.NearestFilter;
    texture.magFilter = THREE.NearestFilter;
    return texture;
  }

  /**
   * 调色板材质 mesh。
   * @param width 宽
   * @param height 高
   */
  createMesh(width: number, height: number): any {
    const geometry = SpriteUtils.createRectGeometry(width, height);
    SpriteUtils.addRectUvs(geometry, { x: 0, y: 0, width, height }, { width, height });
    geometry.translate(width / 2, height / 2, 0);
    const material = new PaletteBasicMaterial({
      map: this.texture,
      palette: TextureUtils.textureFromPalette(this.props.palette),
      side: THREE.DoubleSide,
    });
    const mesh = new THREE.Mesh(geometry, material);
    mesh.frustumCulled = false;
    return mesh;
  }

  /** 挂可点 mesh。 */
  defineChildren(): any {
    return jsx(
      "mesh",
      {
        zIndex: this.props.zIndex,
        ref: (e: any) => (this.meshEvtTarget = e),
        onClick: () => {},
      },
      this.mesh,
    );
  }

  /**
   * 计算目标 pip 并逐步靠拢；高亮动画刷纹理。
   * @param now 帧时间
   */
  onFrame(now: number): void {
    const root = this.getUiObject().get3DObject();
    root.visible = this.visible;
    const model = this.props["sidebarModel"];
    const drained = model.powerDrained;
    const generated = model.powerGenerated;
    let resetHighlight = false;
    if (this.lastPowerDrained !== drained || this.lastPowerGenerated !== generated) {
      this.lastPowerDrained = drained;
      this.lastPowerGenerated = generated;
      this.meshEvtTarget.setTooltip(
        this.props.strings.get("TXT_POWER_DRAIN", generated, drained),
      );
      const cap = Math.max(generated, drained);
      const drainRatio = cap ? Math.min(1, drained / cap) : 1;
      const headroom = cap ? Math.min(1, clamp(generated - drained, 0, 100) / cap) : 0;
      const pipH = this.pips[0].height + 1;
      const total = cap ? this.computeHeightFromPowerLevel(Math.max(100, cap)) : 1;
      this.targetPipCount = {
        green: Math.floor(((1 - drainRatio - headroom) * total) / pipH),
        yellow: Math.floor((headroom * total) / pipH),
        red: cap ? Math.floor((drainRatio * total) / pipH) : 1,
      };
      this.pipHighlightAnimRunner.animation.stop();
      resetHighlight = true;
    }
    const target = this.targetPipCount;
    const alreadySame = this.pipCount && samePipCount(this.pipCount, target);
    const needTick =
      !(
        this.lastPipUpdate &&
        !(now - this.lastPipUpdate >= 50) &&
        alreadySame
      );
    // 与孪生一致：有 50ms 节流且计数相同则跳过；否则更新
    const skip =
      this.lastPipUpdate &&
      !(50 <= now - this.lastPipUpdate) &&
      alreadySame;
    if (!skip) {
      this.lastPipUpdate = now;
      if (this.pipCount) {
        const dRed = Math.sign(target.red - this.pipCount.red);
        const dYellow = Math.sign(target.yellow - this.pipCount.yellow);
        const dGreen = Math.sign(target.green - this.pipCount.green);
        if (dRed) {
          if (dRed > 0) {
            if (this.pipCount.yellow > dRed) {
              this.pipCount.yellow = Math.max(0, this.pipCount.yellow - dRed);
            } else {
              this.pipCount.green = Math.max(0, this.pipCount.green - dRed);
            }
          }
        } else if (dYellow) {
          if (dYellow > 0) {
            this.pipCount.green = Math.max(0, this.pipCount.green - dYellow);
          }
        } else {
          this.pipCount.green += dGreen;
        }
        this.pipCount.yellow += dYellow;
        this.pipCount.red += dRed;
      } else {
        this.pipCount = { red: 1, yellow: 0, green: 0 };
      }
      this.updateTexture(this.pipCount, true);
      if (samePipCount(this.pipCount, target)) {
        this.pipHighlightAnimRunner.animate(10);
      }
    }
    if (alreadySame) {
      if (resetHighlight) this.pipHighlightAnimRunner.animate(10);
      if (this.pipHighlightAnimRunner.shouldUpdate()) {
        const before = !!this.pipHighlightAnimRunner.getValue();
        this.pipHighlightAnimRunner.tick(now);
        const after = !!this.pipHighlightAnimRunner.getValue();
        if (after !== before) this.updateTexture(this.pipCount, after);
      }
    }
  }

  /**
   * 按电力上限算条高度比例。
   * @param level 电力水平
   */
  computeHeightFromPowerLevel(level: number): number {
    return (
      clamp(
        (Math.log10((level / 100 + 5) / 5e7) / (level / 100 + 3) + 2) / 2,
        0,
        1,
      ) * this.props.height
    );
  }

  /**
   * 重绘索引纹理。
   * @param counts 计数
   * @param highlight 是否高亮顶格
   */
  updateTexture(counts: any, highlight: boolean): void {
    const pipH = this.pips[0].height;
    const height = this.props.height;
    const step = pipH + 1;
    const layers: any[] = [
      [[PipKind.None, Math.floor(height / pipH), pipH]],
      [
        [PipKind.Red, counts.red, step],
        [PipKind.Yellow, counts.yellow, step],
        [PipKind.Green, counts.green, step],
      ],
    ];
    if (highlight) {
      const lastNonzero = findReverse(layers[1], ([, n]: any) => n > 0);
      if (lastNonzero) lastNonzero[1]--;
      layers[1].push([PipKind.Highlight, 1, step]);
    }
    for (const layer of layers) {
      let y = height - pipH;
      for (const [kind, count, advance] of layer) {
        const pip = this.pips[kind];
        for (let i = 0; i < count; i++) {
          this.textureBitmap.drawIndexedImage(pip, 0, y);
          y -= advance;
        }
      }
    }
    this.texture.needsUpdate = true;
  }

  /** 隐藏。 */
  hide(): void {
    this.visible = false;
  }

  /** 显示。 */
  show(): void {
    this.visible = true;
  }

  /** 释放。 */
  onDispose(): void {
    this.mesh.geometry.dispose();
    this.mesh.material.dispose();
    this.texture.dispose();
  }
}
