/**
 * SuperWeaponTimers — 顶栏超武/停电/倒计时/僵局计时文本。
 *
 * 由 gui/screen/game/component/hud/SuperWeaponTimers.ts.js
 * 重写为 TS（行为完全一致）。
 */
import * as jsxModule from "gui/jsx/jsx"; // 孪生
import * as UiObjectModule from "gui/UiObject"; // 孪生
import * as UiComponentModule from "gui/jsx/UiComponent"; // 孪生
import * as HtmlContainerModule from "gui/HtmlContainer"; // 孪生
import * as SpriteUtilsModule from "engine/gfx/SpriteUtils"; // 孪生
import * as CanvasUtilsModule from "engine/gfx/CanvasUtils"; // 孪生
import { GameSpeed } from "game/GameSpeed"; // 已转换
import { formatTimeDuration } from "util/format"; // 已转换

/* eslint-disable @typescript-eslint/no-explicit-any */

// 孪生 any-shim
const jsx: any = (jsxModule as any).jsx;
const UiObject: any = (UiObjectModule as any).UiObject;
const UiComponent: any = (UiComponentModule as any).UiComponent;
const HtmlContainer: any = (HtmlContainerModule as any).HtmlContainer;
const SpriteUtils: any = SpriteUtilsModule as any;
const CanvasUtils: any = CanvasUtilsModule as any;

/** 超武计时条。 */
export class SuperWeaponTimers extends UiComponent {
  /** 2d 上下文。 */
  ctx: CanvasRenderingContext2D;
  /** 纹理。 */
  texture: any;
  /** mesh。 */
  mesh: any;
  /** 上次刷新。 */
  lastUpdate: number | undefined;
  /** 上次是否有计时。 */
  lastHasTimers: boolean | undefined;

  /** 根对象。 */
  createUiObject(): any {
    const obj = new UiObject(new THREE.Object3D(), new HtmlContainer());
    obj.setPosition(this.props.x || 0, this.props.y || 0);
    const width = this.props.width;
    const height = this.props.height;
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    this.ctx = canvas.getContext("2d", { alpha: true });
    this.texture = this.createTexture(canvas);
    this.mesh = this.createMesh(width, height);
    return obj;
  }

  /**
   * 像素纹理。
   * @param canvas 源
   */
  createTexture(canvas: HTMLCanvasElement): any {
    const texture = new THREE.Texture(canvas);
    texture.needsUpdate = true;
    texture.flipY = false;
    texture.minFilter = THREE.NearestFilter;
    texture.magFilter = THREE.NearestFilter;
    return texture;
  }

  /**
   * mesh。
   * @param width 宽
   * @param height 高
   */
  createMesh(width: number, height: number): any {
    const geometry = SpriteUtils.createRectGeometry(width, height);
    SpriteUtils.addRectUvs(geometry, { x: 0, y: 0, width, height }, { width, height });
    geometry.translate(width / 2, height / 2, 0);
    const material = new THREE.MeshBasicMaterial({
      map: this.texture,
      side: THREE.DoubleSide,
      transparent: true,
    });
    const mesh = new THREE.Mesh(geometry, material);
    mesh.frustumCulled = false;
    return mesh;
  }

  /** 挂 mesh。 */
  defineChildren(): any {
    return jsx("mesh", { zIndex: this.props.zIndex }, this.mesh);
  }

  /**
   * 100ms 节流收集并绘制计时行。
   * @param now 帧时间
   */
  onFrame(now: number): void {
    if (this.lastUpdate && now - this.lastUpdate < 100) return;
    this.lastUpdate = now;
    const rows: any[] = [];
    if (this.props.stalemateDetectTrait?.isStale()) {
      const sec = Math.floor(
        this.props.stalemateDetectTrait.getCountdownTicks() / GameSpeed.BASE_TICKS_PER_SECOND,
      );
      const text =
        this.props.strings.get("TS:StalemateTimer") + "   " + formatTimeDuration(sec, true);
      rows.push({ text, color: "red", flash: true });
    }
    const countdown = this.props.countdownTimer;
    if (countdown.isRunning()) {
      const s = countdown.getSeconds();
      const text =
        (countdown.text !== void 0
          ? this.props.strings.get(countdown.text) + "   "
          : "") + formatTimeDuration(s, true);
      rows.push({
        text,
        color: this.props.localPlayer?.color.asHexString() ?? "white",
        flash: false,
      });
    }
    for (const player of this.props.players) {
      if (player.defeated) continue;
      const weapons = player.superWeaponsTrait?.getAll();
      const blackout =
        (player.powerTrait?.getBlackoutDuration() ?? 0) / GameSpeed.BASE_TICKS_PER_SECOND;
      if (!weapons?.length && !blackout) continue;
      const color = player.color.asHexString();
      const entries: any[] = [];
      if (weapons) {
        for (const sw of weapons) {
          if (sw.rules.showTimer) {
            entries.push({
              seconds: sw.getTimerSeconds(),
              label: this.props.strings.get(sw.rules.uiName),
            });
          }
        }
      }
      if (blackout) {
        entries.push({ seconds: blackout, label: this.props.strings.get("MSG:BlackoutTimer") });
      }
      for (const { seconds, label } of entries) {
        const floor = Math.floor(seconds);
        const text = label + "   " + formatTimeDuration(floor, true);
        rows.push({ text, color, flash: floor === 0 });
      }
    }
    const has = !!rows.length;
    if (has !== this.lastHasTimers || has) {
      this.lastHasTimers = has;
      this.ctx.clearRect(0, 0, this.props.width, this.props.height);
      let y = this.props.height - 20;
      for (const { text, color, flash } of rows) {
        let c = color;
        if (flash) c = Math.floor(now / 1e3) % 2 ? c : "orange";
        y -= this.drawLine(text, c, y);
      }
      this.texture.needsUpdate = true;
    }
  }

  /**
   * 画一行（右对齐底起）。
   * @param text 文本
   * @param color 色
   * @param y y
   */
  drawLine(text: string, color: string, y: number): number {
    return CanvasUtils.drawText(this.ctx, text, 0, y, {
      color,
      fontFamily: "'Fira Sans Condensed', Arial, sans-serif",
      fontSize: 14,
      fontWeight: "500",
      paddingTop: 5,
      height: 22,
      backgroundColor: "rgba(0, 0, 0, .75)",
      textAlign: "right",
      paddingLeft: 4,
      paddingRight: 4,
    }).height;
  }

  /** 释放资源。 */
  onDispose(): void {
    this.mesh.geometry.dispose();
    this.mesh.material.dispose();
    this.texture.dispose();
  }
}
