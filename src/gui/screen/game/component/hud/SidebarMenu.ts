/**
 * SidebarMenu — 侧栏菜单按钮列表（sprite 底 + HTML 按钮覆盖）。
 *
 * 由 gui/screen/game/component/hud/SidebarMenu.ts.js
 * 重写为 TS（行为完全一致）。
 */
import * as jsxModule from "gui/jsx/jsx"; // 孪生
import * as MenuButtonModule from "gui/component/MenuButton"; // 孪生
import * as UiObjectModule from "gui/UiObject"; // 孪生
import * as HtmlContainerModule from "gui/HtmlContainer"; // 孪生
import * as HtmlViewModule from "gui/jsx/HtmlView"; // 孪生
import * as UiComponentModule from "gui/jsx/UiComponent"; // 孪生

/* eslint-disable @typescript-eslint/no-explicit-any */

// 孪生 any-shim
const jsx: any = (jsxModule as any).jsx;
const MenuButton: any = (MenuButtonModule as any).MenuButton;
const UiObject: any = (UiObjectModule as any).UiObject;
const HtmlContainer: any = (HtmlContainerModule as any).HtmlContainer;
const HtmlView: any = (HtmlViewModule as any).HtmlView;
const UiComponent: any = (UiComponentModule as any).UiComponent;

/** 侧栏菜单。 */
export class SidebarMenu extends UiComponent {
  /** 根对象。 */
  createUiObject(): any {
    return new UiObject(new THREE.Object3D(), new HtmlContainer());
  }

  /** 逐按钮创建。 */
  defineChildren(): any {
    return this.props.buttons.map((b: any, i: number) => this.createButton(b, i));
  }

  /**
   * 单个按钮：底部按钮贴底。
   * @param config 按钮配置
   * @param index 序号
   */
  createButton(config: any, index: number): any {
    const img = this.props.buttonImg;
    let pos = { x: 0, y: index * img.height };
    if (config.isBottom) {
      pos.y = this.props.menuHeight - img.height;
    }
    const box = { x: pos.x, y: pos.y, width: img.width, height: img.height };
    const ref = jsx.createRef();
    return jsx(
      "fragment",
      null,
      jsx("sprite", {
        image: img,
        palette: this.props.buttonPal,
        x: pos.x,
        y: pos.y,
        ref,
      }),
      jsx(HtmlView, {
        component: MenuButton,
        props: {
          buttonConfig: { label: config.label, disabled: !!config.disabled },
          box: { x: box.x, y: box.y, width: box.width, height: box.height },
          onMouseDown: (_e: any) => {
            ref.current.setFrame(1);
            const up = () => {
              ref.current.setFrame(0);
              document.removeEventListener("mouseup", up);
            };
            document.addEventListener("mouseup", up);
          },
          onClick: (_e: any) => {
            if (config.onClick) config.onClick();
          },
        },
      }),
    );
  }
}
