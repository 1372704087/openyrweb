/**
 * MenuButtonConfig — 主菜单侧栏按钮配置（type-only 空执行模块）。
 *
 * 孪生 execute 为空，运行时不导出任何值；原 TS 应为
 * { label, isBottom?, onClick } 一类的接口定义。
 *
 * 由 gui/screen/mainMenu/component/viewmodel/MenuButtonConfig.ts.js
 * 重写为 TS（行为完全一致：空导出）。
 */

/** 侧栏按钮配置。 */
export interface MenuButtonConfig {
  /** 按钮文案。 */
  label: string;
  /** 是否贴底（Back 类）。 */
  isBottom?: boolean;
  /** 点击回调。 */
  onClick: () => void;
}
