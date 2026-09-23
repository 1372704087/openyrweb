/**
 * GameResultPopup — 胜负结算弹层（grfxtxt.shp 按 type 取帧）。
 *
 * 由 gui/screen/game/component/GameResultPopup.ts.js 重写为 TS（行为完全一致）。
 *
 * 两个文件并存期间，本文件才是修改目标：tools/repack.mjs 打包时优先采用 .ts 模块的编译产物。
 */
import * as jsxModule from "gui/jsx/jsx"; // 孪生
import * as UiObjectModule from "gui/UiObject"; // 孪生
import * as UiComponentModule from "gui/jsx/UiComponent"; // 孪生
import * as HtmlContainerModule from "gui/HtmlContainer"; // 孪生

/* eslint-disable @typescript-eslint/no-explicit-any */

// 孪生 any-shim：未转换模块的具名导出不可用，取命名空间成员
const jsx: any = (jsxModule as any).jsx;
const UiObject: any = (UiObjectModule as any).UiObject;
const UiComponent: any = (UiComponentModule as any).UiComponent;
const HtmlContainer: any = (HtmlContainerModule as any).HtmlContainer;

/** 结算结果类型。 */
export enum GameResultType {
  /** 单机关卡胜利 */
  SpVictory = 0,
  /** 单机关卡失败 */
  SpDefeat = 1,
  /** 多人胜利 */
  MpVictory = 2,
  /** 多人失败 */
  MpDefeat = 3,
}

/** 胜负结算弹层组件。 */
export class GameResultPopup extends UiComponent {
  /**
   * 创建根 UiObject：占满 viewport。
   * @param props 含 viewport
   */
  createUiObject({ viewport }: { viewport: any }): any {
    const obj = new UiObject(new THREE.Object3D(), new HtmlContainer());
    obj.setPosition(viewport.x, viewport.y);
    obj.getHtmlContainer().setSize(viewport.width, viewport.height);
    return obj;
  }

  /** 定义 sprite 子节点，帧号 = GameResultType。 */
  defineChildren(): any {
    const { viewport, type } = this.props as any;
    return jsx("sprite", {
      image: "grfxtxt.shp",
      palette: "grfxtxt.pal",
      ref: (sprite: any) => {
        const size = sprite.getSize();
        sprite.setPosition((viewport.width - size.width) / 2, (viewport.height - size.height) / 2);
      },
      frame: type,
    });
  }
}
