/**
 * ShpImage — SHP 单帧图像的轻量载体。
 *
 * 保存像素缓冲 imageData（按行主序），以及可选画布偏移 (x, y)
 * 与尺寸。clip 按目标宽高裁剪并返回新实例（不修改原图），
 * 源图越界像素被丢弃、目标缓冲补 0。
 *
 * 由 data/ShpImage.ts.js 重写为 TS（行为完全一致）。两个文件并存期间，
 * 本文件才是修改目标：tools/repack.mjs 打包时优先采用 .ts 模块的编译产物。
 */
export class ShpImage {
  /** 图像高度（默认 1，避免 0 尺寸）。 */
  height: number;
  /** 图像宽度（默认 1，避免 0 尺寸）。 */
  width: number;
  /** 画布上的 X 偏移。 */
  x: number;
  /** 画布上的 Y 偏移。 */
  y: number;
  /** 像素缓冲（行主序）。 */
  imageData: Uint8Array;

  constructor(imageData?: Uint8Array) {
    this.height = 1;
    this.width = 1;
    this.x = 0;
    this.y = 0;
    this.imageData = imageData ?? new Uint8Array(0);
  }

  /**
   * 裁剪到 maxWidth×maxHeight（实际输出尺寸取 min(原尺寸, 目标)）。
   * 目标缓冲始终按 maxWidth×maxHeight 分配，源图越界部分跳过。
   */
  clip(maxWidth: number, maxHeight: number): ShpImage {
    const result = new ShpImage();
    result.width = Math.min(this.width, maxWidth);
    result.height = Math.min(this.height, maxHeight);
    const buf = new Uint8Array(maxWidth * maxHeight);
    let offset = 0;
    for (let row = 0; row < this.height && !(row >= maxHeight); row++) {
      for (let col = 0; col < this.width; col++) {
        if (col >= maxWidth) continue;
        buf[offset++] = this.imageData[row * this.width + col];
      }
    }
    result.imageData = buf;
    result.x = this.x;
    result.y = this.y;
    return result;
  }
}
