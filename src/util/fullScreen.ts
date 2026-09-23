/**
 * 全屏 API：变更监听 + F11 键进入全屏的便捷绑定。
 *
 * 由 util/fullScreen.ts.js 重写为 TS（行为完全一致）。两个文件并存期间，本文件
 * 才是修改目标：tools/repack.mjs 打包时优先采用 .ts 模块的编译产物。
 */

/** 全屏变更回调：参数为"当前是否处于全屏"。 */
export type FullScreenChangeHandler = (isFullScreen: boolean) => void;

/** 卸载监听的清理函数。浏览器不支持全屏时返回 undefined。 */
export type DisposeFullScreenListener = (() => void) | undefined;

/**
 * 绑定 fullscreenchange + keyup(F11=122) 监听。
 *
 * - 仅当 document.fullscreenEnabled 为真时安装；否则 warn 并返回 undefined。
 * - 进入全屏时立即把节流标志置 false；退出全屏后延迟 100ms 再放开
 *   （防止退出瞬间 F11 立刻被再次捕获，与孪生一致）。
 * - keyup 处理：keyCode 122、节流开启、且当前不在全屏 → requestFullscreen()；
 *   被用户拒绝时仅 console.warn，不向上抛。
 */
export function setupFullScreenChangeListener(
  doc: Document,
  onChange: FullScreenChangeHandler,
): DisposeFullScreenListener {
  if (!doc.fullscreenEnabled) {
    console.warn("Browser fullscreen API not available.");
    return;
  }
  let allowToggle = true;
  const onFullScreenChange = () => {
    const active = !!doc.fullscreenElement;
    if (active) allowToggle = false;
    else setTimeout(() => (allowToggle = true), 100);
    onChange(active);
  };
  const onKeyUp = async (event: KeyboardEvent) => {
    if (event.keyCode === 122 && allowToggle && !doc.fullscreenElement) {
      try {
        await doc.documentElement.requestFullscreen();
      } catch {
        console.warn("Full screen permission denied by user.");
      }
    }
  };
  doc.addEventListener("fullscreenchange", onFullScreenChange);
  doc.addEventListener("keyup", onKeyUp);
  return () => {
    doc.removeEventListener("fullscreenchange", onFullScreenChange);
    doc.removeEventListener("keyup", onKeyUp);
  };
}
