/**
 * GameMenuContentArea — 暂停菜单半透明遮罩 + 按分辨率背景图。
 *
 * 由 gui/screen/game/component/hud/GameMenuContentArea.ts.js
 * 重写为 TS（行为完全一致）。
 *
 * 两个文件并存期间，本文件才是修改目标：tools/repack.mjs 打包时优先采用 .ts 模块的编译产物。
 */
import * as jsxModule from "gui/jsx/jsx"; // 孪生
import * as UiComponentModule from "gui/jsx/UiComponent"; // 孪生
import * as UiObjectModule from "gui/UiObject"; // 孪生
import * as HtmlContainerModule from "gui/HtmlContainer"; // 孪生
import * as SpriteUtilsModule from "engine/gfx/SpriteUtils"; // 孪生
import { SideType } from "game/SideType"; // 已转换
import * as EngineModule from "engine/Engine"; // 孪生
import * as EngineTypeModule from "engine/EngineType"; // 孪生

/* eslint-disable @typescript-eslint/no-explicit-any */

// 孪生 any-shim
const jsx: any = (jsxModule as any).jsx;
const UiComponent: any = (UiComponentModule as any).UiComponent;
const UiObject: any = (UiObjectModule as any).UiObject;
const HtmlContainer: any = (HtmlContainerModule as any).HtmlContainer;
const SpriteUtils: any = SpriteUtilsModule as any;
const Engine: any = EngineModule as any;
const EngineType: any = EngineTypeModule as any;

/** 暂停菜单内容区。 */
export class GameMenuContentArea extends UiComponent {
  /**
   * 根 UiObject：定位 viewport 并设 HTML 尺寸。
   * @param props viewport/hidden
   */
  createUiObject({ viewport, hidden }: { viewport: any; hidden?: boolean }): any {
    const obj = new UiObject(new THREE.Object3D(), new HtmlContainer());
    obj.setPosition(viewport.x, viewport.y);
    obj.getHtmlContainer().setSize(viewport.width, viewport.height);
    obj.setVisible(!hidden);
    return obj;
  }

  /** 遮罩 mesh + 背景容器。 */
  defineChildren(): any {
    const { viewport, screenSize, sideType, images, innerRef } = this.props;
    let size = "lg";
    if (screenSize.width < 1024 || screenSize.height < 768) size = "md";
    if (screenSize.width < 800 || screenSize.height < 600) size = "sm";
    // YR-only — engine check always true; keep Yuri-side (ThirdSide) styling.
    const isThird = sideType === SideType.ThirdSide;
    const file = isThird ? `bkgd${size}y.shp` : `bkgd${size}.shp`;
    const pal = isThird ? "uibkgdy.pal" : "uibkgd.pal";
    const img = images.get(file);
    const x = img ? (viewport.width - img.width) / 2 : 0;
    const y = img ? (viewport.height - img.height) / 2 : 0;
    const width = (img || viewport).width;
    const height = (img || viewport).height;
    return jsx(
      "fragment",
      null,
      jsx("mesh", null, this.createMask(viewport)),
      jsx(
        "container",
        { zIndex: 1, x, y, width, height, ref: innerRef },
        img && jsx("sprite", { image: img, palette: pal }),
      ),
    );
  }

  /**
   * 全屏半透明黑遮罩。
   * @param viewport 视口
   */
  createMask(viewport: any): any {
    const geometry = SpriteUtils.createRectGeometry(viewport.width, viewport.height);
    geometry.translate(viewport.width / 2, viewport.height / 2, 0);
    const material = new THREE.MeshBasicMaterial({
      color: 0,
      opacity: 0.75,
      transparent: true,
      side: THREE.DoubleSide,
    });
    const mesh = new THREE.Mesh(geometry, material);
    mesh.frustumCulled = false;
    return mesh;
  }
}
