/**
 * MusicJukebox — 音乐播放列表点唱机（随机/循环 + 列表 + 播放停止）。
 *
 * 由 gui/screen/options/component/MusicJukebox.ts.js 重写为 TS。
 * 两个文件并存期间，本文件才是修改目标。
 */
import { List, ListItem } from "gui/component/List"; // 已转换
import React, { useState } from "react"; // 孪生（react 外部依赖）
import { pad } from "util/string"; // 已转换

/** 组件 props。 */
export interface MusicJukeboxProps {
  /** 音乐控制器。 */
  music: any;
  /** i18n 字典。 */
  strings: any;
}

/** 音乐点唱机。 */
export const MusicJukebox = ({ music, strings: strings }: MusicJukeboxProps) => {
  const [current, setCurrent] = useState(() => music.getCurrentPlaylistItem());
  return React.createElement(
    "div",
    { className: "music-jukebox" },
    React.createElement(
      "div",
      { className: "jukebox-content" },
      React.createElement(
        "div",
        { className: "controls" },
        React.createElement(
          "div",
          null,
          React.createElement(
            "label",
            null,
            React.createElement("input", {
              type: "checkbox",
              defaultChecked: music.getShuffleMode(),
              onChange: (e: any) => music.setShuffleMode(e.target.checked),
            }),
            strings.get("GUI:Shuffle"),
          ),
        ),
        React.createElement(
          "div",
          null,
          React.createElement(
            "label",
            null,
            React.createElement("input", {
              type: "checkbox",
              defaultChecked: music.getRepeatMode(),
              onChange: (e: any) => music.setRepeatMode(e.target.checked),
            }),
            strings.get("GUI:Repeat"),
          ),
        ),
      ),
      React.createElement(
        List,
        { className: "playlist" },
        music
          .getPlaylist()
          .map((item: any, idx: number) =>
            React.createElement(
              ListItem,
              {
                key: item.name,
                selected: item === current,
                onClick: () => setCurrent(item),
              },
              pad(idx + 1, "00"),
              " - ",
              strings.get(item.name),
            ),
          ),
      ),
    ),
    React.createElement(
      "div",
      { className: "jukebox-footer" },
      React.createElement(
        "button",
        {
          className: "dialog-button",
          onClick: () => current && music.selectPlaylistItem(current),
        },
        strings.get("GUI:Play"),
      ),
      React.createElement(
        "button",
        { className: "dialog-button", onClick: () => music.stopPlaying() },
        strings.get("GUI:Stop"),
      ),
    ),
  );
};
