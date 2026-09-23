/**
 * SidebarTab — 侧栏页签标识类。
 *
 * 由 gui/screen/game/component/hud/viewmodel/SidebarTab.ts.js 重写为 TS
 * （行为完全一致：items/needsUpdate/flashing/id 与 disabled getter）。
 * 两个文件并存期间，本文件才是修改目标。
 */
export class SidebarTab {
  /** 页签内条目。 */
  items: any[] = [];
  /** 是否需要刷新。 */
  needsUpdate = true;
  /** 是否闪烁。 */
  flashing = false;
  /** 页签 id。 */
  id: any;

  /**
   * @param id - 页签 id
   */
  constructor(id: any) {
    this.id = id;
  }

  /** 无条目时禁用。 */
  get disabled(): boolean {
    return !this.items.length;
  }
}
