/**
 * Pointer — 指针锁 + 光标精灵 + 画布坐标换算。
 *
 * factory 组装 PointerSprite/PointerLock/PointerEvents；onMouseMove 按锁态
 * 累计 movement 或 page 坐标换算并 clamp；setPointerType 切滚动/拖拽/动画帧。
 *
 * 由 gui/Pointer.ts.js 重写为 TS（行为完全一致）。
 * 两个文件并存期间，本文件才是修改目标：tools/repack.mjs 打包时优先采用 .ts 模块的编译产物。
 */
import { PointerLock } from "util/PointerLock"; // 已转换
import { clamp } from "util/math"; // 已转换
import { CompositeDisposable } from "util/disposable/CompositeDisposable"; // 已转换
import { PointerSprite } from "gui/PointerSprite"; // 孪生（本批内一并转换）
import { PointerEvents } from "gui/PointerEvents"; // 孪生（本批内一并转换）
import { PointerType } from "engine/type/PointerType"; // 已转换
import { SimpleRunner } from "engine/animation/SimpleRunner"; // 已转换
import { Animation } from "engine/Animation"; // 已转换
import { AnimProps } from "engine/AnimProps"; // 已转换
import { IniSection } from "data/IniSection"; // 已转换
import { BoxedVar } from "util/BoxedVar"; // 已转换

/* eslint-disable @typescript-eslint/no-explicit-any */

/** 游戏指针。 */
export class Pointer {
  /**
   * 组装完整 Pointer（含 PointerEvents）。
   * @param shpFile - 光标 SHP
   * @param palette - 调色板
   * @param renderer - 渲染器
   * @param document - document
   * @param canvasMetrics - 画布几何
   * @param mouseAcceleration - 鼠标加速开关
   */
  static factory(shpFile: any, palette: any, renderer: any, document: any, canvasMetrics: any, mouseAcceleration: any): any {
    const sprite = PointerSprite.fromShpFile(shpFile, palette);
    sprite.setVisible(false);
    const canvas = renderer.getCanvas();
    const pointerLock = new PointerLock(canvas, document);
    const pointer = new Pointer(pointerLock, sprite, document, canvas, canvasMetrics, mouseAcceleration);
    pointer.pointerEvents = new PointerEvents(renderer, pointer.getPosition(), document, canvasMetrics);
    pointer.disposables.add(pointer.pointerEvents);
    return pointer;
  }

  /** PointerLock。 */
  pointerLock: any;
  /** 光标精灵。 */
  sprite: any;
  /** document。 */
  document: any;
  /** 画布。 */
  canvas: any;
  /** 画布几何。 */
  canvasMetrics: any;
  /** 鼠标加速开关。 */
  mouseAcceleration: any;
  /** 用户是否要求锁定。 */
  userLockMode = false;
  /** 光标是否应可见。 */
  userPointerVisible = true;
  /** 是否已拿到首次指针锁权限。 */
  userPermissionGranted = false;
  /** 画布内坐标。 */
  position = { x: 0, y: 0 };
  /** 一次性回调。 */
  disposables: CompositeDisposable;
  /** 当前指针类型。 */
  pointerType: any = PointerType.Default;
  /** 动画子帧。 */
  pointerSubFrame = 0;
  /** PointerEvents（factory 注入）。 */
  pointerEvents?: any;
  /** mousemove 处理器（ctor 赋值）。 */
  onMouseMove: (ev: any) => void;

  /**
   * @param pointerLock - PointerLock
   * @param sprite - 光标精灵
   * @param document - document
   * @param canvas - 画布
   * @param canvasMetrics - 画布几何
   * @param mouseAcceleration - 加速开关
   */
  constructor(pointerLock: any, sprite: any, document: any, canvas: any, canvasMetrics: any, mouseAcceleration: any) {
    this.pointerLock = pointerLock;
    this.sprite = sprite;
    this.document = document;
    this.canvas = canvas;
    this.canvasMetrics = canvasMetrics;
    this.mouseAcceleration = mouseAcceleration;
    this.userLockMode = false;
    this.userPointerVisible = true;
    this.userPermissionGranted = false;
    this.position = { x: 0, y: 0 };
    this.disposables = new CompositeDisposable();
    this.pointerType = PointerType.Default;
    this.pointerSubFrame = 0;
    this.onMouseMove = (ev: any) => {
      const pos = this.position;
      if (this.pointerLock.isActive()) {
        pos.x = pos.x + ev.movementX;
        pos.y = pos.y + ev.movementY;
      } else {
        pos.x = ev.pageX - this.canvasMetrics.x;
        pos.y = ev.pageY - this.canvasMetrics.y;
      }
      pos.x = clamp(pos.x, 0, this.canvasMetrics.width - 1);
      pos.y = clamp(pos.y, 0, this.canvasMetrics.height - 1);
      this.updateSpritePosition();
    };
  }

  /** 画布内坐标（对象引用）。 */
  getPosition(): { x: number; y: number } {
    return this.position;
  }

  /** 底层 PointerLock。 */
  getPointerLock(): any {
    return this.pointerLock;
  }

  /** 订阅锁态并挂 mousemove。 */
  init(): void {
    this.listenForFirstCanvasClick();
    this.pointerLock.onChange.subscribe((locked: boolean) => {
      this.sprite.setVisible(this.userPointerVisible && locked);
      const retry = () => {
        if (this.userLockMode) {
          this.pointerLock.request({ unadjustedMovement: !this.mouseAcceleration.value }).catch((err: any) => {
            console.warn("Couldn't acquire pointer lock.", err);
            this.canvas.addEventListener("click", retry, { once: true });
          });
        }
      };
      if (!locked) {
        this.canvas.addEventListener("click", retry, { once: true });
        this.disposables.add(() => this.canvas.removeEventListener("click", retry));
      }
    });
    this.document.addEventListener("mousemove", this.onMouseMove, true);
    this.disposables.add(() => this.document.removeEventListener("mousemove", this.onMouseMove, true));
  }

  /** 首次 canvas 点击尝试拿指针锁权限。 */
  listenForFirstCanvasClick(): void {
    const onClick = async () => {
      if (!this.userPermissionGranted) {
        try {
          await this.pointerLock.request({ unadjustedMovement: !this.mouseAcceleration.value });
          if (!this.userLockMode) await this.pointerLock.exit();
          this.userPermissionGranted = true;
        } catch (err) {
          console.warn("Couldn't acquire initial pointer lock", err);
          this.canvas.addEventListener("click", onClick, { once: true });
        }
      }
    };
    this.canvas.addEventListener("click", onClick, { once: true });
    this.disposables.add(() => this.canvas.removeEventListener("click", onClick));
  }

  /** 进入锁定模式。 */
  lock(): void {
    this.userLockMode = true;
    if (this.userPermissionGranted) {
      this.pointerLock.request({ unadjustedMovement: !this.mouseAcceleration.value }).catch((err: any) => {
        console.warn("Couldn't reacquire pointer lock. Will attempt to require lock on next click", err);
        this.userPermissionGranted = false;
        this.listenForFirstCanvasClick();
      });
    }
  }

  /** 退出锁定模式。 */
  unlock(): void {
    this.userLockMode = false;
    this.pointerLock.exit().catch((err: any) => {
      console.error("Couldn't release pointer lock. This should never happen", err);
    });
  }

  /**
   * 设置光标可见（需锁激活）。
   * @param visible - 期望可见
   */
  setVisible(visible: boolean): void {
    this.userPointerVisible = visible;
    this.sprite.setVisible(visible && this.pointerLock.isActive());
  }

  /** 是否锁定模式。 */
  getUserLockMode(): boolean {
    return this.userLockMode;
  }

  /** 光标精灵。 */
  getSprite(): any {
    return this.sprite;
  }

  /**
   * 切换指针类型/动画子帧。
   * @param type - PointerType
   * @param subFrame - 子帧（默认 0）
   */
  setPointerType(type: any, subFrame = 0): void {
    if (this.pointerType === type && this.pointerSubFrame === subFrame) return;
    this.pointerType = type;
    this.pointerSubFrame = subFrame;
    this.sprite.setAnimationRunner(undefined);
    if ([PointerType.Scroll, PointerType.NoScroll, PointerType.Pan].includes(type)) {
      this.sprite.setFrame(type + subFrame);
    } else {
      const start = type;
      const end =
        (Object.keys(PointerType)
          .map(Number)
          .find((n) => !Number.isNaN(n) && type < n) ?? this.sprite.getFrameCount()) - 1;
      this.sprite.setFrame(start);
      if (start < end) {
        const runner = new SimpleRunner();
        const animProps = new AnimProps(new IniSection("dummy"), this.sprite.getFrameCount());
        animProps.loopCount = -1;
        animProps.start = start;
        animProps.loopStart = start;
        animProps.loopEnd = end;
        const animation = new Animation(animProps, new BoxedVar(1.5));
        runner.animation = animation;
        this.sprite.setAnimationRunner(runner);
      }
    }
    this.updateSpritePosition();
  }

  /** 按类型把光标锚到热点并钳到画布内。 */
  updateSpritePosition(): void {
    const pos = { ...this.position };
    const size = this.sprite.getSize();
    const halfW = Math.floor(size.width / 2);
    const halfH = Math.floor(size.height / 2);
    if (this.pointerType > PointerType.Mini) {
      pos.x -= halfW;
      pos.y -= halfH;
    }
    if ([PointerType.Scroll, PointerType.NoScroll, PointerType.Pan].includes(this.pointerType)) {
      pos.x = clamp(pos.x, 0, this.canvasMetrics.width - 1 - size.width);
      pos.y = clamp(pos.y, 0, this.canvasMetrics.height - 1 - size.height);
    }
    this.sprite.setPosition(pos.x, pos.y);
  }

  /** 解绑全部监听。 */
  dispose(): void {
    this.disposables.dispose();
  }
}
