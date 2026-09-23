/**
 * WorldInteraction — 对局世界输入总控（键鼠/模式/默认动作/小地图）。
 *
 * 由 gui/screen/game/worldInteraction/WorldInteraction.ts.js
 * 重写为 TS（行为完全一致）。
 *
 * 两个文件并存期间，本文件才是修改目标：tools/repack.mjs 打包时优先采用 .ts 模块的编译产物。
 */
import { rectContainsPoint } from "util/geometry"; // 已转换
import { PointerType } from "engine/type/PointerType"; // 已转换
import { ActionFilter } from "gui/screen/game/worldInteraction/DefaultActionHandler"; // 已转换
import { isMacFirefox } from "util/userAgent"; // 已转换

/* eslint-disable @typescript-eslint/no-explicit-any */

/** 世界交互总控。 */
export class WorldInteraction {
  /** 世界场景。 */
  worldScene: any;
  /** 指针。 */
  pointer: any;
  /** 指针事件。 */
  pointerEvents: any;
  /** 镜头拖拽。 */
  cameraPanHandler: any;
  /** 地图滚屏。 */
  mapScrollHandler: any;
  /** 地图悬停。 */
  mapHoverHandler: any;
  /** Tooltip。 */
  tooltipHandler: any;
  /** 单位选择。 */
  unitSelectionHandler: any;
  /** 默认动作。 */
  defaultActionHandler: any;
  /** 键盘。 */
  keyboardHandler: any;
  /** 方向键滚屏。 */
  arrowScrollHandler: any;
  /** 自定义滚屏。 */
  customScrollHandler: any;
  /** 小地图处理。 */
  minimapHandler: any;
  /** 镜头缩放。 */
  cameraZoom: any;
  /** document。 */
  document: any;
  /** 渲染器。 */
  renderer: any;
  /** 目标线。 */
  targetLines: any;
  /** 右键移动开关。 */
  rightClickMove: any;
  /** 右键滚屏开关。 */
  rightClickScroll: any;
  /** 战斗控制 API。 */
  battleControlApi: any;
  /** 聊天输入处理器（可选挂载）。 */
  chatTypingHandler: any;

  /** 是否已 init。 */
  initialized = false;
  /** 是否启用。 */
  enabled = true;
  /** 点击起点。 */
  clickOrigin = { x: 0, y: 0 };
  /** 是否可能拖镜。 */
  maybePan = false;
  /** 是否已拖动。 */
  hasDragged = false;
  /** 是否悬停小地图。 */
  isMinimapHover = false;
  /** 选择变化时是否清模式。 */
  clearModeOnSelectionChange = false;
  /** 当前交互模式。 */
  currentMode: any;
  /** 最近修饰键事件。 */
  lastKeyMods: any;
  /** 最近键盘事件。 */
  lastKeyboardEvent: any;
  /** 按下中的鼠标键。 */
  mousePressed: number | undefined;
  /** 最近 mousedown。 */
  lastMouseDownEvent: any;
  /** 是否故障性 Ctrl+右键=左键（mac Firefox）。 */
  hasFaultyCtrlLeftClick = false;
  /** 排队的 mousemove。 */
  queuedMouseMoveEvent: any;
  /** 上次帧时间。 */
  lastFrameTime: number | undefined;
  /** 上次选择哈希。 */
  lastSelectionHash: any;
  /** 上次默认动作更新。 */
  lastDefaultActionUpdate: number | undefined;
  /** 上次双击细节。 */
  lastDefaultModeClickDetails: any;
  /** 小地图悬停 tile。 */
  minimapHoverTile: any;

  /**
   * @param worldScene 世界场景
   * @param pointer 指针
   * @param pointerEvents 指针事件
   * @param cameraPanHandler 镜头拖拽
   * @param mapScrollHandler 滚屏
   * @param mapHoverHandler 悬停
   * @param tooltipHandler tooltip
   * @param unitSelectionHandler 选择
   * @param defaultActionHandler 默认动作
   * @param keyboardHandler 键盘
   * @param arrowScrollHandler 方向滚屏
   * @param customScrollHandler 自定义滚屏
   * @param minimapHandler 小地图
   * @param cameraZoom 缩放
   * @param document document
   * @param renderer 渲染器
   * @param targetLines 目标线
   * @param rightClickMove 右键移动
   * @param rightClickScroll 右键滚屏
   * @param battleControlApi 控制 API
   */
  constructor(
    worldScene: any,
    pointer: any,
    pointerEvents: any,
    cameraPanHandler: any,
    mapScrollHandler: any,
    mapHoverHandler: any,
    tooltipHandler: any,
    unitSelectionHandler: any,
    defaultActionHandler: any,
    keyboardHandler: any,
    arrowScrollHandler: any,
    customScrollHandler: any,
    minimapHandler: any,
    cameraZoom: any,
    document: any,
    renderer: any,
    targetLines: any,
    rightClickMove: any,
    rightClickScroll: any,
    battleControlApi: any,
  ) {
    this.worldScene = worldScene;
    this.pointer = pointer;
    this.pointerEvents = pointerEvents;
    this.cameraPanHandler = cameraPanHandler;
    this.mapScrollHandler = mapScrollHandler;
    this.mapHoverHandler = mapHoverHandler;
    this.tooltipHandler = tooltipHandler;
    this.unitSelectionHandler = unitSelectionHandler;
    this.defaultActionHandler = defaultActionHandler;
    this.keyboardHandler = keyboardHandler;
    this.arrowScrollHandler = arrowScrollHandler;
    this.customScrollHandler = customScrollHandler;
    this.minimapHandler = minimapHandler;
    this.cameraZoom = cameraZoom;
    this.document = document;
    this.renderer = renderer;
    this.targetLines = targetLines;
    this.rightClickMove = rightClickMove;
    this.rightClickScroll = rightClickScroll;
    this.battleControlApi = battleControlApi;
    this.initialized = false;
    this.enabled = true;
    this.clickOrigin = { x: 0, y: 0 };
    this.maybePan = false;
    this.hasDragged = false;
    this.isMinimapHover = false;
    this.clearModeOnSelectionChange = false;
    this.handleSelectionChange = () => {
      if (this.clearModeOnSelectionChange) this.setMode(void 0);
    };
    this.handleKeyDown = (e: any) => {
      this.handleKeyModifierChange(e);
      this.keyboardHandler.handleKeyDown(e);
      this.arrowScrollHandler.handleKeyDown(e);
      this.chatTypingHandler?.handleKeyDown(e);
    };
    this.handleKeyUp = (e: any) => {
      this.handleKeyModifierChange(e);
      this.keyboardHandler.handleKeyUp(e);
      this.arrowScrollHandler.handleKeyUp(e);
      this.chatTypingHandler?.handleKeyUp(e);
      this.tooltipHandler.reset();
    };
    this.handleKeyModifierChange = (e: any) => {
      const prev = this.lastKeyMods;
      this.lastKeyMods = e;
      this.lastKeyboardEvent = e;
      if (this.currentMode) return;
      if (this.maybePan && this.hasDragged) return;
      if (this.mapScrollHandler.isScrolling()) return;
      if (e.repeat) return;
      if (
        e.shiftKey === prev?.shiftKey &&
        e.ctrlKey === prev?.ctrlKey &&
        e.altKey === prev?.altKey
      ) {
        return;
      }
      this.updateDefaultAction(
        this.getCurrentHover(),
        this.unitSelectionHandler.getSelectedUnits(),
        e,
      );
    };
    this.handleMapHoverChange = (hover: any) => {
      this.currentMode?.hover(hover, this.isMinimapHover);
      if (this.isMinimapHover || this.currentMode) return;
      this.updateDefaultAction(
        hover,
        this.unitSelectionHandler.getSelectedUnits(),
        this.lastKeyMods,
      );
    };
    this.handleMouseMove = (e: any) => {
      this.queuedMouseMoveEvent = e;
    };
    this.handleFrame = (now: number) => {
      this.lastFrameTime = now;
      let dirty = false;
      const hash = this.unitSelectionHandler.getHash();
      if (hash !== this.lastSelectionHash && !this.currentMode) {
        this.lastSelectionHash = hash;
        dirty = true;
      }
      const queued = this.queuedMouseMoveEvent;
      if (queued) {
        this.queuedMouseMoveEvent = void 0;
        this.processMouseMove(queued);
      }
      if (
        (!this.lastDefaultActionUpdate || now - this.lastDefaultActionUpdate >= 1e3 / 15) &&
        !this.currentMode &&
        !this.mapScrollHandler.isScrolling() &&
        !(this.hasDragged && this.maybePan)
      ) {
        this.lastDefaultActionUpdate = now;
        dirty = true;
      }
      if (dirty) {
        this.updateDefaultAction(
          this.getCurrentHover(),
          this.unitSelectionHandler.getSelectedUnits(),
          this.lastKeyMods,
        );
      }
    };
    this.handleMouseDown = (e: any) => {
      if (!rectContainsPoint(this.worldScene.viewport, e.pointer)) return;
      if (this.mousePressed !== void 0) return;
      if (this.hasFaultyCtrlLeftClick && e.ctrlKey && e.button === 2) e.button = 0;
      this.mapScrollHandler.cancel();
      this.pointerEvents.intersectionsEnabled = false;
      this.clickOrigin = e.pointer;
      this.mousePressed = e.button;
      this.lastMouseDownEvent = e;
      this.hasDragged = false;
      if ((e.button === 2 && this.isRightClickPanAllowed()) || e.button === 1) {
        this.maybePan = true;
        this.cameraPanHandler.start(e.pointer);
      }
      if (e.button === 2) {
        if (
          !this.isRightClickPanAllowed() &&
          !this.isRightClickMove()
        ) {
          this.unitSelectionHandler.deselectAll();
        }
        this.chatTypingHandler?.endTyping();
      }
    };
    this.handleMouseUp = (up: any) => {
      if (this.hasFaultyCtrlLeftClick && up.ctrlKey && up.button === 2) up.button = 0;
      if (this.mousePressed !== up.button) return;
      if (
        up.isTouch &&
        this.lastKeyMods &&
        this.lastKeyMods !== this.lastKeyboardEvent
      ) {
        up.ctrlKey = this.lastKeyMods.ctrlKey;
        up.shiftKey = this.lastKeyMods.shiftKey;
        up.altKey = this.lastKeyMods.altKey;
      }
      this.pointerEvents.intersectionsEnabled = true;
      this.mousePressed = void 0;
      const wasPan = this.maybePan;
      this.maybePan = false;
      if (wasPan) this.cameraPanHandler.finish();
      if (wasPan && this.hasDragged) {
        this.mapHoverHandler.update(up.pointer, true);
        this.currentMode?.hover(this.getCurrentHover(), this.isMinimapHover);
        return;
      }
      if (this.currentMode) {
        if (up.button === 0) {
          this.mapHoverHandler.update(up.pointer, true);
          if (this.currentMode.execute(this.getCurrentHover(), this.isMinimapHover) !== false) {
            this.currentMode = void 0;
          }
        } else if (up.button === 2 && this.isClickRange(up.pointer)) {
          this.currentMode.cancel?.();
          this.currentMode = void 0;
          this.pointer.setPointerType(PointerType.Default);
        }
        return;
      }
      let boxed = false;
      if (up.button === 0 && this.hasDragged) {
        boxed = this.unitSelectionHandler.finishBoxSelect(up.pointer, !up.shiftKey);
        if (!boxed) this.mapHoverHandler.update(up.pointer, true);
      }
      if (up.button === 0 || up.button === 2) {
        const rightClickMove = this.isRightClickMove();
        const isPrimary = up.button === (rightClickMove ? 2 : 0);
        const inRange = this.isClickRange(up.pointer);
        let doubleClick = false;
        const isLongTouch = inRange && up.isTouch && 500 >= 0
          ? inRange && up.isTouch && up.timeStamp - this.lastMouseDownEvent.timeStamp >= 500
          : false;
        if (up.isTouch) this.mapHoverHandler.update(up.pointer, true);
        const hover = this.mapHoverHandler.getCurrentHover();
        if (inRange) {
          const prev = this.lastDefaultModeClickDetails;
          const detail = {
            mouseUpEvent: up,
            hoverObject: hover?.gameObject,
            selectionHash: this.unitSelectionHandler.getHash(),
            time: Date.now(),
          };
          if (prev) {
            doubleClick =
              detail.mouseUpEvent.button === prev.mouseUpEvent.button &&
              detail.hoverObject === prev.hoverObject &&
              detail.selectionHash === prev.selectionHash &&
              detail.time - prev.time < 500;
          }
          this.lastDefaultModeClickDetails = doubleClick ? void 0 : detail;
        }
        if (
          !isPrimary &&
          (!rightClickMove || !up.shiftKey || up.ctrlKey) &&
          (!rightClickMove || !doubleClick)
        ) {
          if (!inRange) return;
          this.unitSelectionHandler.deselectAll();
        }
        if (
          boxed ||
          (!rightClickMove && !isPrimary) ||
          this.handleDefaultClickAction(rightClickMove, isPrimary, doubleClick, isLongTouch, up, hover)
        ) {
          if (this.lastDefaultModeClickDetails) {
            this.lastDefaultModeClickDetails.selectionHash = this.unitSelectionHandler.getHash();
          }
        }
      }
    };
    this.handleWheel = (e: any) => {
      this.cameraZoom.applyStep(e.wheelDeltaY > 0 ? -0.1 : 0.1);
    };
    this.handleMinimapClick = (tile: any) => {
      this.executeMinimapClickCommand(tile, false);
    };
    this.handleMinimapRightClick = (tile: any) => {
      this.executeMinimapClickCommand(tile, true);
    };
    this.handleMinimapMouseOver = () => {
      this.isMinimapHover = true;
    };
    this.handleMinimapMouseMove = (tile: any) => {
      this.minimapHoverTile = tile;
      const hover = this.minimapHandler.getHover(tile);
      if (this.currentMode) {
        this.currentMode.hover(hover, true);
      } else {
        this.updateDefaultAction(
          hover,
          this.unitSelectionHandler.getSelectedUnits(),
          this.lastKeyMods,
        );
      }
    };
    this.handleMinimapMouseOut = () => {
      this.pointer.setPointerType(PointerType.Default);
      this.isMinimapHover = false;
      this.minimapHoverTile = void 0;
    };
  }

  /** 选择变化回调。 */
  handleSelectionChange: () => void;
  /** keydown。 */
  handleKeyDown: (e: any) => void;
  /** keyup。 */
  handleKeyUp: (e: any) => void;
  /** 修饰键变化。 */
  handleKeyModifierChange: (e: any) => void;
  /** 悬停变化。 */
  handleMapHoverChange: (hover: any) => void;
  /** mousemove 排队。 */
  handleMouseMove: (e: any) => void;
  /** 帧。 */
  handleFrame: (now: number) => void;
  /** mousedown。 */
  handleMouseDown: (e: any) => void;
  /** mouseup。 */
  handleMouseUp: (e: any) => void;
  /** wheel。 */
  handleWheel: (e: any) => void;
  /** 小地图点击。 */
  handleMinimapClick: (tile: any) => void;
  /** 小地图右键。 */
  handleMinimapRightClick: (tile: any) => void;
  /** 小地图进入。 */
  handleMinimapMouseOver: () => void;
  /** 小地图移动。 */
  handleMinimapMouseMove: (tile: any) => void;
  /** 小地图离开。 */
  handleMinimapMouseOut: () => void;

  /** 挂监听并注册到 battleControlApi。 */
  init(): void {
    if (this.initialized) return;
    this.setupHandlers();
    this.worldScene.add(this.targetLines);
    this.initialized = true;
    this.hasFaultyCtrlLeftClick = isMacFirefox();
    this.battleControlApi._setWorldInteraction(this);
    this.battleControlApi._notifyToggle(true);
  }

  /**
   * 更新迷雾引用。
   * @param shroud 迷雾
   */
  setShroud(shroud: any): void {
    this.mapHoverHandler.setShroud(shroud);
    this.minimapHandler.setShroud(shroud);
  }

  /** 订阅指针/键鼠/帧/小地图。 */
  setupHandlers(): void {
    this.pointerEvents.addEventListener("canvas", "mousemove", this.handleMouseMove);
    this.pointerEvents.addEventListener("canvas", "mousedown", this.handleMouseDown);
    this.pointerEvents.addEventListener("canvas", "mouseup", this.handleMouseUp);
    this.pointerEvents.addEventListener("canvas", "wheel", this.handleWheel);
    this.document.addEventListener("keydown", this.handleKeyDown);
    this.document.addEventListener("keyup", this.handleKeyUp);
    this.mapHoverHandler.onHoverChange.subscribe(this.handleMapHoverChange);
    this.renderer.onFrame.subscribe(this.handleFrame);
    this.unitSelectionHandler.onUserSelectionChange.subscribe(this.handleSelectionChange);
    this.minimapHandler.minimap.onClick.subscribe(this.handleMinimapClick);
    this.minimapHandler.minimap.onRightClick.subscribe(this.handleMinimapRightClick);
    this.minimapHandler.minimap.onMouseOver.subscribe(this.handleMinimapMouseOver);
    this.minimapHandler.minimap.onMouseMove.subscribe(this.handleMinimapMouseMove);
    this.minimapHandler.minimap.onMouseOut.subscribe(this.handleMinimapMouseOut);
    this.tooltipHandler.init();
  }

  /** 解绑全部。 */
  teardownHandlers(): void {
    this.pointerEvents.removeEventListener("canvas", "mousemove", this.handleMouseMove);
    this.pointerEvents.removeEventListener("canvas", "mousedown", this.handleMouseDown);
    this.pointerEvents.removeEventListener("canvas", "mouseup", this.handleMouseUp);
    this.pointerEvents.removeEventListener("canvas", "wheel", this.handleWheel);
    this.document.removeEventListener("keydown", this.handleKeyDown);
    this.document.removeEventListener("keyup", this.handleKeyUp);
    this.mapHoverHandler.onHoverChange.unsubscribe(this.handleMapHoverChange);
    this.renderer.onFrame.unsubscribe(this.handleFrame);
    this.unitSelectionHandler.onUserSelectionChange.unsubscribe(this.handleSelectionChange);
    this.unitSelectionHandler.cancelBoxSelect();
    this.minimapHandler.minimap.onClick.unsubscribe(this.handleMinimapClick);
    this.minimapHandler.minimap.onRightClick.unsubscribe(this.handleMinimapRightClick);
    this.minimapHandler.minimap.onMouseOver.unsubscribe(this.handleMinimapMouseOver);
    this.minimapHandler.minimap.onMouseMove.unsubscribe(this.handleMinimapMouseMove);
    this.minimapHandler.minimap.onMouseOut.unsubscribe(this.handleMinimapMouseOut);
    this.tooltipHandler.dispose();
    this.mapScrollHandler.cancel();
    this.arrowScrollHandler.cancel();
    this.customScrollHandler.cancel();
  }

  /** 释放。 */
  dispose(): void {
    if (this.initialized && this.enabled) {
      this.teardownHandlers();
      this.pointer.setPointerType(PointerType.Default);
      this.battleControlApi._setWorldInteraction(void 0);
      this.battleControlApi._notifyToggle(false);
    }
    this.currentMode?.dispose();
    this.mapScrollHandler.dispose();
    this.cameraPanHandler.dispose();
    this.mapHoverHandler.dispose();
    this.unitSelectionHandler.dispose();
    this.chatTypingHandler?.dispose();
    this.keyboardHandler.dispose();
    this.worldScene.remove(this.targetLines);
    this.targetLines.dispose();
    this.tooltipHandler.dispose();
  }

  /**
   * 启用/禁用。
   * @param on 是否启用
   */
  setEnabled(on: boolean): void {
    if (this.enabled === on) return;
    this.enabled = on;
    if (on) {
      this.setupHandlers();
    } else {
      this.teardownHandlers();
      this.cancelMouseUp();
      this.cancelKeyUp();
      this.pointer.setPointerType(PointerType.Default);
      this.chatTypingHandler?.endTyping();
    }
    this.battleControlApi._setWorldInteraction(on ? this : void 0);
    this.battleControlApi._notifyToggle(on);
  }

  /** 是否启用。 */
  isEnabled(): boolean {
    return this.enabled;
  }

  /** 暂停镜头拖拽与滚屏。 */
  pausePanning(): void {
    this.cameraPanHandler.setPaused(true);
    this.mapScrollHandler.setPaused(true);
  }

  /** 恢复镜头。 */
  unpausePanning(): void {
    this.cameraPanHandler.setPaused(false);
    this.mapScrollHandler.setPaused(false);
  }

  /**
   * 切换交互模式。
   * @param mode 新模式（可空）
   */
  setMode(mode: any): void {
    if (this.currentMode !== mode) {
      this.currentMode?.cancel?.();
      this.pointer.setPointerType(PointerType.Default);
    }
    this.currentMode = mode;
    this.clearModeOnSelectionChange = false;
    if (mode) {
      this.unitSelectionHandler.cancelBoxSelect();
      this.unitSelectionHandler.deselectAll();
      this.clearModeOnSelectionChange = true;
      mode.enter();
      this.mapHoverHandler.update(this.pointer.getPosition(), true);
      const hover = this.getCurrentHover();
      if (hover) mode.hover(hover, this.isMinimapHover);
    }
  }

  /** 当前模式。 */
  getMode(): any {
    return this.currentMode;
  }

  /** 最近修饰键。 */
  getLastKeyModifiers(): any {
    return this.lastKeyMods;
  }

  /**
   * 注册键命令。
   * @param command 命令
   * @param handler 处理器
   */
  registerKeyCommand(command: string, handler: any): this {
    this.keyboardHandler.registerCommand(command, handler);
    return this;
  }

  /**
   * 注销键命令。
   * @param command 命令
   */
  unregisterKeyCommand(command: string): this {
    this.keyboardHandler.unregisterCommand(command);
    return this;
  }

  /**
   * 应用修饰键并刷新默认动作。
   * @param mods 事件
   */
  applyKeyModifiers(mods: any): void {
    this.lastKeyMods = mods;
    if (this.currentMode) return;
    if (this.maybePan && this.hasDragged) return;
    if (this.mapScrollHandler.isScrolling()) return;
    this.updateDefaultAction(
      this.getCurrentHover(),
      this.unitSelectionHandler.getSelectedUnits(),
      mods,
    );
  }

  /**
   * 更新默认动作与指针。
   * @param hover 悬停
   * @param selected 选中
   * @param mods 修饰键
   */
  updateDefaultAction(hover: any, selected: any[], mods: any): void {
    const scrolling = this.mapScrollHandler.isScrolling();
    if (hover) {
      this.defaultActionHandler.update(
        hover,
        selected,
        this.isRightClickMove(),
        mods,
        this.isMinimapHover,
      );
      if (!scrolling) {
        this.pointer.setPointerType(
          this.defaultActionHandler.getPointerType(this.isMinimapHover),
        );
      }
    } else if (!scrolling) {
      this.pointer.setPointerType(
        this.isMinimapHover ? PointerType.Mini : PointerType.Default,
      );
    }
    this.lastDefaultActionUpdate = this.lastFrameTime;
  }

  /**
   * 处理排队 mousemove。
   * @param e 事件
   */
  processMouseMove(e: any): void {
    const scrolling = this.mapScrollHandler.isScrolling();
    if (this.mousePressed === void 0) {
      if (!e.isTouch) this.mapScrollHandler.update(e.pointer);
    } else if (
      !this.hasDragged &&
      !this.isClickRange(e.pointer)
    ) {
      this.hasDragged = true;
      if (!this.currentMode && this.mousePressed === 0) {
        this.unitSelectionHandler.startBoxSelect(this.clickOrigin);
      }
    }
    if (
      !this.currentMode ||
      this.mapScrollHandler.isScrolling() ||
      (this.maybePan && this.hasDragged)
    ) {
      // skip mode hover while panning/scrolling
    } else {
      if (!this.isMinimapHover && scrolling) {
        this.pointer.setPointerType(PointerType.Default);
      }
      this.mapHoverHandler.update(e.pointer);
      this.currentMode.hover(this.getCurrentHover(), this.isMinimapHover);
    }
    if (this.mousePressed === void 0) {
      if (!this.mapScrollHandler.isScrolling()) {
        this.mapHoverHandler.update(e.pointer);
        if (!this.currentMode) {
          this.updateDefaultAction(
            this.getCurrentHover(),
            this.unitSelectionHandler.getSelectedUnits(),
            e,
          );
        }
      }
      return;
    }
    const shouldTrack =
      !this.hasDragged ||
      ((this.currentMode ||
        (this.isRightClickMove() && this.mousePressed === 2)) &&
        !this.maybePan);
    if (shouldTrack) {
      this.mapHoverHandler.update(e.pointer);
    } else {
      this.mapHoverHandler.finish();
    }
    if (!this.hasDragged) return;
    if (this.maybePan) {
      this.cameraPanHandler.update(e.pointer, e.isTouch);
    } else if (
      !this.currentMode &&
      !(this.isRightClickMove() && this.mousePressed === 2)
    ) {
      this.pointer.setPointerType(PointerType.Default);
      this.unitSelectionHandler.updateBoxSelect(e.pointer);
    }
  }

  /**
   * 默认模式点击分发。
   * @param rightClickMove 右键移动
   * @param isPrimary 主键
   * @param doubleClick 双击
   * @param longTouch 长按
   * @param up 抬起事件
   * @param hover 悬停
   */
  handleDefaultClickAction(
    rightClickMove: boolean,
    isPrimary: boolean,
    doubleClick: boolean,
    longTouch: boolean,
    up: any,
    hover: any,
  ): boolean {
    if (!hover) return false;
    const selected = this.unitSelectionHandler.getSelectedUnits();
    const filter = rightClickMove
      ? isPrimary
        ? ActionFilter.NoSelect
        : ActionFilter.SelectOnly
      : ActionFilter.All;
    this.defaultActionHandler.execute(
      hover,
      selected,
      filter,
      rightClickMove && !isPrimary,
      doubleClick,
      longTouch ? { ...up, ctrlKey: true } : up,
    );
    return true;
  }

  /** 强制结束按下态。 */
  cancelMouseUp(): void {
    if (this.mousePressed === void 0) return;
    this.pointerEvents.intersectionsEnabled = true;
    this.mousePressed = void 0;
    if (this.maybePan) {
      this.maybePan = false;
      this.cameraPanHandler.finish();
    }
    if (this.currentMode) {
      this.currentMode.cancel?.();
      this.currentMode = void 0;
    }
    this.unitSelectionHandler.cancelBoxSelect();
  }

  /** 合成 keyup 解除卡键。 */
  cancelKeyUp(): void {
    if (this.lastKeyboardEvent?.type !== "keydown") return;
    const e = new KeyboardEvent("keyup", {
      key: this.lastKeyboardEvent.key,
      keyCode: this.lastKeyboardEvent.keyCode,
      ctrlKey: this.lastKeyboardEvent.ctrlKey,
      altKey: this.lastKeyboardEvent.altKey,
      shiftKey: this.lastKeyboardEvent.shiftKey,
      metaKey: this.lastKeyboardEvent.metaKey,
    });
    this.handleKeyUp(e);
  }

  /**
   * 是否在点击阈值内。
   * @param pos 指针
   */
  isClickRange(pos: any): boolean {
    return (
      Math.abs(pos.x - this.clickOrigin.x) <= 7 &&
      Math.abs(pos.y - this.clickOrigin.y) <= 7
    );
  }

  /** 是否允许右键拖镜。 */
  isRightClickPanAllowed(): boolean {
    return this.rightClickScroll.value;
  }

  /** 是否右键移动。 */
  isRightClickMove(): boolean {
    return this.rightClickMove.value;
  }

  /**
   * 小地图点击命令 / 平移。
   * @param tile tile
   * @param secondary 是否右键语义
   */
  executeMinimapClickCommand(tile: any, secondary: boolean): void {
    let handled = false;
    if (secondary === this.isRightClickMove()) {
      const hover = this.minimapHandler.getHover(tile);
      if (this.currentMode) {
        if (this.currentMode.execute(hover, true) !== false) {
          this.currentMode = void 0;
          handled = true;
        }
      } else {
        const selected = this.unitSelectionHandler.getSelectedUnits();
        handled = this.defaultActionHandler.execute(
          hover,
          selected,
          ActionFilter.All,
          false,
          false,
          this.lastKeyMods,
          true,
        );
      }
    }
    if (!handled) this.minimapHandler.panToTile(tile);
  }

  /** 当前悬停（地图或小地图）。 */
  getCurrentHover(): any {
    if (!this.isMinimapHover) return this.mapHoverHandler.getCurrentHover();
    if (!this.minimapHoverTile) return void 0;
    return this.minimapHandler.getHover(this.minimapHoverTile);
  }
}
