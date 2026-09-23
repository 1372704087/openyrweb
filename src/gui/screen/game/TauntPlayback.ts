/**
 * TauntPlayback — 按国家代码播放 taunt 语音文件。
 *
 * 文件名格式：tau{国家两字母}{两位序号}.wav
 *
 * 由 gui/screen/game/TauntPlayback.ts.js 重写为 TS（行为完全一致）。
 */
import * as ChannelTypeModule from "engine/sound/ChannelType"; // 孪生
import { pad } from "util/string"; // 已转换

/* eslint-disable @typescript-eslint/no-explicit-any */

// 孪生 any-shim：取命名空间成员
const ChannelType: any = (ChannelTypeModule as any).ChannelType;

/** 国家名 → 两字母代码。 */
const COUNTRY_CODES = new Map<string, string>()
  .set("Americans", "am")
  .set("French", "fr")
  .set("Germans", "ge")
  .set("British", "br")
  .set("Russians", "ru")
  .set("Confederation", "cu")
  .set("Africans", "li")
  .set("Arabs", "ir")
  .set("Alliance", "ko");

/** taunt 播放器。 */
export class TauntPlayback {
  /** 音频系统。 */
  audioSystem: any;
  /** taunt 资源查找。 */
  taunts: any;

  /**
   * @param audioSystem 音频系统
   * @param taunts taunt 资源
   */
  constructor(audioSystem: any, taunts: any) {
    this.audioSystem = audioSystem;
    this.taunts = taunts;
  }

  /**
   * 播放 taunt。
   * @param player 拥有 country 的对象
   * @param index 序号
   */
  async playTaunt(player: any, index: number): Promise<void> {
    const file = this.getTauntFileName(player.country.name, index);
    const wav = await this.taunts.get(file);
    if (wav) {
      this.audioSystem.playWavFile(wav, ChannelType.Voice);
    } else {
      console.warn(`Taunt file "${file}" not found.`);
    }
  }

  /**
   * 构造 taunt 文件名。
   * @param countryName 国家名
   * @param index 序号
   */
  getTauntFileName(countryName: string, index: number): string {
    return `tau${COUNTRY_CODES.get(countryName)}${pad(index, "00")}.wav`;
  }
}
