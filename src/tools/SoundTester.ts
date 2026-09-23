/**
 * tools/SoundTester — audio.bag/idx 加载与音效点听调试页。
 *
 * main：打开 audio.bag + audio.idx → AudioBagFile.fromVirtualFile →
 * addArchive → buildBrowser 右侧音效列表；selectSound 用 AudioContext
 * 解码播放（gain 0.5）；destroy 卸列表并 dispose disposables。
 *
 * 由 tools/SoundTester.ts.js 重写为 TS（行为完全一致）。两个文件并存期间，
 * 本文件才是修改目标：tools/repack.mjs 打包时优先采用 .ts 模块的编译产物。
 */
import * as CompositeDisposableNs from "util/disposable/CompositeDisposable"; // 已转换
import * as AudioBagFileNs from "data/AudioBagFile"; // 孪生
import * as IdxFileNs from "data/IdxFile"; // 孪生
import * as EngineNs from "engine/Engine"; // 孪生

const CompositeDisposable: any = (CompositeDisposableNs as any).CompositeDisposable;
const AudioBagFile: any = (AudioBagFileNs as any).AudioBagFile;
const IdxFile: any = (IdxFileNs as any).IdxFile;
const Engine: any = (EngineNs as any).Engine;

export class SoundTester {
  /** 音效键集合（main 内 Engine.getSounds()）。 */
  static sounds: any;
  /** 已加载的 audio.bag。 */
  static audioBag: any;
  /** 右侧列表 DOM。 */
  static listEl?: HTMLElement;
  /** 生命周期可释放集合。 */
  static disposables = new CompositeDisposable();

  /**
   * 入口：装载 bag/idx 并构建浏览器列表。
   * @param vfs - 虚拟文件系统（openFile）
   * @param _runtimeVars - 运行时变量（与孪生一致，签名占位未用）
   */
  static async main(vfs: any, _runtimeVars?: any): Promise<void> {
    (this.sounds = Engine.getSounds()), (this.audioBag = new AudioBagFile());
    const bagFile = vfs.openFile("audio.bag");
    const idxFile = vfs.openFile("audio.idx");
    (this.audioBag.fromVirtualFile(bagFile, new IdxFile(idxFile.stream)),
      vfs.addArchive(this.audioBag, "audio.bag"),
      this.buildBrowser());
  }

  /** 解码并播放指定音效名（gain 0.5）。 */
  static selectSound(name: string): void {
    const ctx = new AudioContext();
    const gain = ctx.createGain();
    gain.gain.value = 0.5;
    const buffer = new Uint8Array(this.sounds.get(name).getData()).buffer;
    ctx.decodeAudioData(
      buffer,
      (decoded) => {
        const source = ctx.createBufferSource();
        (source.buffer = decoded), source.connect(gain).connect(ctx.destination), source.start(0);
      },
      (err) => console.log(err),
    );
  }

  /** 构建右上角音效文件链接列表。 */
  static buildBrowser(): void {
    const list = (this.listEl = document.createElement("div"));
    ((list.style.position = "absolute"),
      (list.style.right = "0"),
      (list.style.top = "0"),
      (list.style.height = "600px"),
      (list.style.width = "200px"),
      (list.style.overflowY = "auto"),
      (list.style.padding = "5px"),
      (list.style.background = "rgba(255, 255, 255, 0.5)"),
      (list.style.border = "1px black solid"),
      list.appendChild(document.createTextNode("Sound files:")));
    const files: string[] = this.audioBag.getFileList();
    (files.forEach((file) => {
      const link = document.createElement("a");
      ((link.style.display = "block"),
        (link.textContent = file),
        link.setAttribute("href", "javascript:;"),
        link.addEventListener("click", () => {
          SoundTester.selectSound(file);
        }),
        list.appendChild(link));
    }),
      document.body.appendChild(list));
  }

  /** 卸列表并释放全部 disposable。 */
  static destroy(): void {
    (this.listEl!.remove(), this.disposables.dispose());
  }
}
