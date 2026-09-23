/**
 * Messages — HUD 消息 canvas 层（打字动画 + 输入框容器）。
 *
 * 由 gui/screen/game/component/hud/Messages.ts.js
 * 重写为 TS（行为完全一致）。
 */
import * as jsxModule from "gui/jsx/jsx"; // 孪生
import * as UiObjectModule from "gui/UiObject"; // 孪生
import * as UiComponentModule from "gui/jsx/UiComponent"; // 孪生
import * as HtmlContainerModule from "gui/HtmlContainer"; // 孪生
import * as SpriteUtilsModule from "engine/gfx/SpriteUtils"; // 孪生
import * as CanvasUtilsModule from "engine/gfx/CanvasUtils"; // 孪生
import * as HtmlViewModule from "gui/jsx/HtmlView"; // 孪生
import * as HudChatModule from "gui/screen/game/component/hud/HudChat"; // 孪生
import * as ChatMessageModule from "network/chat/ChatMessage"; // 孪生
import * as gservConfigModule from "network/gservConfig"; // 孪生

/* eslint-disable @typescript-eslint/no-explicit-any */

// 孪生 any-shim
const jsx: any = (jsxModule as any).jsx;
const UiObject: any = (UiObjectModule as any).UiObject;
const UiComponent: any = (UiComponentModule as any).UiComponent;
const HtmlContainer: any = (HtmlContainerModule as any).HtmlContainer;
const SpriteUtils: any = SpriteUtilsModule as any;
const CanvasUtils: any = CanvasUtilsModule as any;
const HtmlView: any = (HtmlViewModule as any).HtmlView;
const HudChat: any = (HudChatModule as any).HudChat;
const ChatRecipientType: any = (ChatMessageModule as any).ChatRecipientType;
const RECIPIENT_ALL: any = (gservConfigModule as any).RECIPIENT_ALL;

/** HUD 消息层。 */
export class Messages extends UiComponent {
  /** 2d 上下文。 */
  ctx: CanvasRenderingContext2D;
  /** 纹理。 */
  texture: any;
  /** mesh。 */
  mesh: any;
  /** 输入容器。 */
  inputContainer: any;
  /** 输入组件。 */
  inputComponent: any;
  /** 上次刷新。 */
  lastUpdate: number | undefined;
  /** 上次消息时间。 */
  lastMessageTime: any;
  /** 上次消息数。 */
  lastMessageCount: any;
  /** 上次 composing。 */
  lastComposing: any;

  /** 根对象 + canvas。 */
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
   * 消息 mesh。
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

  /** 隐藏输入容器 + HudChat + mesh。 */
  defineChildren(): any {
    return jsx(
      "fragment",
      null,
      jsx(
        "container",
        { hidden: true, ref: (e: any) => (this.inputContainer = e) },
        jsx(HtmlView, {
          component: HudChat,
          props: {
            strings: this.props.strings,
            messageList: this.props.messages,
            chatHistory: this.props.chatHistory,
            onSubmit: this.props.onMessageSubmit,
            onCancel: this.props.onMessageCancel,
          },
          innerRef: (e: any) => (this.inputComponent = e),
        }),
      ),
      jsx("mesh", { zIndex: this.props.zIndex }, this.mesh),
    );
  }

  /**
   * 30Hz 重绘。
   * @param now 帧时间
   */
  onFrame(now: number): void {
    if (this.lastUpdate && now - this.lastUpdate < 1e3 / 30) return;
    this.lastUpdate = now;
    this.props.messages.prune();
    const list = this.props.messages.getAll();
    const nowMs = Date.now();
    const lastTime = list[list.length - 1]?.time;
    const count = list.length;
    const composing = this.props.messages.isComposing;
    const shouldRedraw =
      this.lastComposing !== composing ||
      this.lastMessageTime !== lastTime ||
      count !== this.lastMessageCount ||
      (lastTime && nowMs - lastTime <= 2e3);
    if (!shouldRedraw) return;
    this.lastMessageTime = lastTime;
    this.lastMessageCount = count;
    this.lastComposing = composing;
    this.drawMessages(composing, list, nowMs);
    this.inputContainer.setVisible(composing);
    this.inputComponent.refresh();
  }

  /**
   * 绘制消息列表。
   * @param composing 输入中
   * @param list 消息
   * @param nowMs 当前时间
   */
  drawMessages(composing: boolean, list: any[], nowMs: number): void {
    this.ctx.clearRect(0, 0, this.props.width, this.props.height);
    const wrapWidth = Math.floor((110 * this.props.width) / 600);
    let animating = false;
    let y = 0;
    let rows = list;
    if (composing) {
      y = 20;
      const target = this.props.chatHistory.lastComposeTarget.value;
      if (
        !(
          target.type === ChatRecipientType.Channel && target.name === RECIPIENT_ALL
        )
      ) {
        rows = [
          {
            color: "gray",
            text: this.props.strings.get("TS:ChatCycleHint", "Tab"),
            animate: false,
            time: Date.now(),
          },
          ...list,
        ];
      }
    }
    for (const msg of rows) {
      const duration = Math.min(1e3, 10 * msg.text.length);
      const progress = msg.animate ? Math.min(1, (nowMs - msg.time) / duration) : 1;
      let budget = Math.round(progress * msg.text.length);
      if (progress < 1) animating = true;
      for (let part of this.wrapText(msg.text, wrapWidth)) {
        if (part.length > budget) {
          part = part.slice(0, budget);
          budget = 0;
        } else {
          budget -= part.length;
        }
        y += this.drawLine(part, msg.color, y);
      }
    }
    this.texture.needsUpdate = true;
    if (animating) this.props.onMessageTick?.();
  }

  /**
   * 画一行。
   * @param text 文本
   * @param color 颜色
   * @param y y
   */
  drawLine(text: string, color: string, y: number): number {
    return CanvasUtils.drawText(this.ctx, text, 0, y, {
      color,
      fontFamily: "'Fira Sans Condensed', Arial, sans-serif",
      fontSize: 14,
      fontWeight: "500",
      paddingTop: 4,
      height: 20,
      backgroundColor: "rgba(0, 0, 0, .75)",
      paddingLeft: 4,
      paddingRight: 4,
    }).height;
  }

  /**
   * 按空格折行。
   * @param text 源
   * @param maxWidth 宽
   */
  wrapText(text: string, maxWidth: number): string[] {
    const parts: string[] = [];
    let rest = text;
    while (rest.length > maxWidth) {
      let cut = rest.slice(0, maxWidth).search(/\s[^\s]*$/);
      if ((cut !== -1 && cut !== 0) || cut === -1) {
        if (cut === -1 || cut === 0) cut = Math.min(rest.length, maxWidth);
      } else {
        cut = Math.min(rest.length, maxWidth);
      }
      parts.push(rest.substr(0, cut));
      rest = rest.slice(cut);
    }
    if (rest.length) parts.push(rest);
    return parts;
  }

  /** 释放资源。 */
  onDispose(): void {
    this.mesh.geometry.dispose();
    this.mesh.material.dispose();
    this.texture.dispose();
  }
}
