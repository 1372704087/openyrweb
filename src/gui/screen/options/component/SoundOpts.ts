/**
 * SoundOpts — 音量滑条组 + 可选音乐点唱机。
 *
 * ChannelType → label key 映射；值 0–10 对应 mixer 0–1。
 *
 * 由 gui/screen/options/component/SoundOpts.ts.js 重写为 TS。
 * 两个文件并存期间，本文件才是修改目标。
 */
import React from "react"; // 孪生（react 外部依赖）
import { Slider } from "gui/component/Slider"; // 已转换
import { ChannelType } from "engine/sound/ChannelType"; // 已转换
import { MusicJukebox } from "gui/screen/options/component/MusicJukebox"; // 孪生（本组内一并转换）

/** 通道 → i18n key。 */
const CHANNEL_LABELS = new Map<any, string>([
  [ChannelType.Master, "GUI:MasterVolume"],
  [ChannelType.Music, "GUI:MusicVolume"],
  [ChannelType.Effect, "GUI:SFXVolume"],
  [ChannelType.Voice, "GUI:VoiceVolume"],
  [ChannelType.Ambient, "GUI:AmbientVolume"],
  [ChannelType.Ui, "GUI:UIVolume"],
  [ChannelType.CreditTicks, "GUI:CreditsVolume"],
]);

/** 组件 props。 */
export interface SoundOptsProps {
  /** i18n 字典。 */
  strings: any;
  /** 音乐点唱机（可空）。 */
  music?: any;
  /** 混音器。 */
  mixer: any;
}

/** 声音选项面板。 */
export const SoundOpts = ({ strings: strings, music, mixer }: SoundOptsProps) =>
  React.createElement(
    "div",
    { className: "opts sound-opts" },
    React.createElement(
      "div",
      { className: "sound-sliders" },
      [...CHANNEL_LABELS].map(([ch, key]) =>
        React.createElement(
          "div",
          { className: "slider-item", key: ch },
          React.createElement("span", { className: "label" }, strings.get(key)),
          React.createElement(Slider, {
            min: 0,
            max: 10,
            value: "" + 10 * mixer.getVolume(ch),
            onChange: (e: any) => mixer.setVolume(ch, Number(e.target.value) / 10),
          }),
        ),
      ),
    ),
    music &&
      React.createElement(MusicJukebox, { music, strings: strings }),
  );
