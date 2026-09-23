/**
 * GeneralOpts — 通用选项面板（玩法/图形/音量/点唱机）。
 *
 * scrollRate 按 SCROLL_BASE_FACTOR 折算 1–7；对局内禁用模型质量切换。
 *
 * 由 gui/screen/options/component/GeneralOpts.ts.js 重写为 TS。
 * 两个文件并存期间，本文件才是修改目标。
 */
import React from "react"; // 孪生（react 外部依赖）
import { Slider } from "gui/component/Slider"; // 已转换
import { SCROLL_BASE_FACTOR } from "gui/screen/options/GeneralOptions"; // 已转换
import { Select } from "gui/component/Select"; // 已转换
import { Option } from "gui/component/Option"; // 已转换
import { FlyerHelperMode } from "engine/renderable/entity/unit/FlyerHelperMode"; // 已转换
import { ModelQuality } from "engine/renderable/entity/unit/ModelQuality"; // 已转换
import { ShadowQuality } from "engine/renderable/entity/unit/ShadowQuality"; // 已转换
import { Image } from "gui/component/Image"; // 已转换
import { ResolutionSelect } from "gui/screen/options/component/Resolution"; // 孪生（本组内一并转换）
import { ChannelType } from "engine/sound/ChannelType"; // 已转换
import { MusicJukebox } from "gui/screen/options/component/MusicJukebox"; // 孪生（本组内一并转换）

/** 滚动速度 1–7 → 文案 key。 */
const SCROLL_LABELS = new Map<number, string>([
  [1, "TXT_SLOWEST"],
  [2, "TXT_SLOWER"],
  [3, "TXT_SLOW"],
  [4, "TXT_MEDIUM"],
  [5, "TXT_FAST"],
  [6, "TXT_FASTER"],
  [7, "TXT_FASTEST"],
]);

/** 通道 → 音量 label。 */
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
export interface GeneralOptsProps {
  /** i18n。 */
  strings: any;
  /** 通用选项模型。 */
  options: any;
  /** 全屏。 */
  fullScreen: any;
  /** 是否对局内。 */
  inGame?: boolean;
  /** 混音器（可选）。 */
  mixer?: any;
  /** 音乐（可选）。 */
  music?: any;
}

/** 通用选项面板。 */
export const GeneralOpts = ({
  strings: strings,
  options,
  fullScreen,
  inGame,
  mixer,
  music,
}: GeneralOptsProps) =>
  React.createElement(
    "div",
    { className: "opts general-opts" },
    React.createElement(
      "fieldset",
      null,
      React.createElement("legend", null, strings.get("TS:GameplayOpts")),
      React.createElement(
        "div",
        { className: "slider-item" },
        React.createElement(
          "span",
          { className: "label" },
          strings.get("GUI:ScrollRate"),
        ),
        React.createElement(Slider, {
          min: 1,
          max: 7,
          value:
            "" + Math.floor(options.scrollRate.value / SCROLL_BASE_FACTOR),
          getLabel: (v: any) => strings.get(SCROLL_LABELS.get(Number(v))),
          onChange: (e: any) =>
            (options.scrollRate.value =
              Number(e.target.value) * SCROLL_BASE_FACTOR),
        }),
      ),
      React.createElement(
        "div",
        { className: "item", "data-r-tooltip": strings.get("STT:MouseAccel") },
        React.createElement(
          "label",
          null,
          React.createElement(
            "span",
            { className: "label" },
            strings.get("TS:MouseAccel"),
          ),
          React.createElement(
            Select,
            {
              initialValue: "" + Number(options.mouseAcceleration.value),
              onSelect: (e: any) =>
                (options.mouseAcceleration.value = Boolean(Number(e))),
            },
            React.createElement(Option, {
              value: "1",
              label: strings.get("TXT_ON"),
            }),
            React.createElement(Option, {
              value: "0",
              label: strings.get("TXT_OFF"),
            }),
          ),
          React.createElement(
            "span",
            { className: "info", title: strings.get("TS:MouseAccelHint") },
            React.createElement(Image, { src: "info.png" }),
          ),
        ),
      ),
      React.createElement(
        "div",
        {
          className: "item",
          "data-r-tooltip": strings.get("STT:AttackMoveButton"),
        },
        React.createElement(
          "label",
          null,
          React.createElement(
            "span",
            { className: "label" },
            strings.get("TS:AttackMoveButton"),
          ),
          React.createElement(
            Select,
            {
              initialValue: "" + Number(options.rightClickMove.value),
              onSelect: (e: any) =>
                (options.rightClickMove.value = Boolean(Number(e))),
            },
            React.createElement(Option, {
              value: "0",
              label: strings.get("TS:AttackMoveButtonLeft"),
            }),
            React.createElement(Option, {
              value: "1",
              label: strings.get("TS:AttackMoveButtonRight"),
            }),
          ),
        ),
      ),
      React.createElement(
        "div",
        {
          className: "item",
          "data-r-tooltip": strings.get("STT:RightClickScroll"),
        },
        React.createElement(
          "label",
          null,
          React.createElement(
            "span",
            { className: "label" },
            strings.get("TS:RightClickScroll"),
          ),
          React.createElement(
            Select,
            {
              initialValue: "" + Number(options.rightClickScroll.value),
              onSelect: (e: any) =>
                (options.rightClickScroll.value = Boolean(Number(e))),
            },
            React.createElement(Option, {
              value: "1",
              label: strings.get("TXT_ON"),
            }),
            React.createElement(Option, {
              value: "0",
              label: strings.get("TXT_OFF"),
            }),
          ),
        ),
      ),
      React.createElement(
        "div",
        { className: "item", "data-r-tooltip": strings.get("STT:FlyerLabel") },
        React.createElement(
          "span",
          { className: "label" },
          strings.get("TS:FlyerLabel"),
        ),
        React.createElement(
          Select,
          {
            initialValue: "" + options.flyerHelper.value,
            onSelect: (e: any) => (options.flyerHelper.value = Number(e)),
          },
          React.createElement(Option, {
            value: "" + FlyerHelperMode.Always,
            label: strings.get("TS:FlyerAlways"),
          }),
          React.createElement(Option, {
            value: "" + FlyerHelperMode.Selected,
            label: strings.get("TS:FlyerSelected"),
          }),
          React.createElement(Option, {
            value: "" + FlyerHelperMode.Never,
            label: strings.get("TS:FlyerNever"),
          }),
        ),
      ),
      React.createElement(
        "div",
        {
          className: "item",
          "data-r-tooltip": strings.get("STT:IGGameOptCBoxHidden"),
        },
        React.createElement(
          "label",
          null,
          React.createElement(
            "span",
            { className: "label" },
            strings.get("GUI:ShowHidden"),
          ),
          React.createElement("input", {
            type: "checkbox",
            defaultChecked: options.hiddenObjects.value,
            onChange: (e: any) =>
              (options.hiddenObjects.value = e.target.checked),
          }),
        ),
      ),
      React.createElement(
        "div",
        {
          className: "item",
          "data-r-tooltip": strings.get("STT:IGGameOptCBoxTargetLines"),
        },
        React.createElement(
          "label",
          null,
          React.createElement(
            "span",
            { className: "label" },
            strings.get("GUI:TargetLines"),
          ),
          React.createElement("input", {
            type: "checkbox",
            defaultChecked: options.targetLines.value,
            onChange: (e: any) =>
              (options.targetLines.value = e.target.checked),
          }),
        ),
      ),
    ),
    React.createElement(
      "fieldset",
      null,
      React.createElement("legend", null, strings.get("TS:GfxOpts")),
      React.createElement(
        "div",
        { className: "item" },
        React.createElement(
          "span",
          { className: "label" },
          strings.get("TS:Resolution"),
        ),
        React.createElement(ResolutionSelect, {
          resolution: options.graphics.resolution,
          fullScreen,
          strings: strings,
        }),
        React.createElement(
          "span",
          { className: "info", title: strings.get("TS:ResolutionHint") },
          React.createElement(Image, { src: "info.png" }),
        ),
      ),
      React.createElement(
        "div",
        { className: "item", "data-r-tooltip": strings.get("STT:GfxModels") },
        React.createElement(
          "span",
          { className: "label" },
          strings.get("TS:GfxModels"),
        ),
        React.createElement(
          Select,
          {
            disabled: inGame,
            initialValue: "" + options.graphics.models.value,
            onSelect: (e: any) => (options.graphics.models.value = Number(e)),
          },
          React.createElement(Option, {
            value: "" + ModelQuality.High,
            label: strings.get("TS:GfxQualityHigh"),
          }),
          React.createElement(Option, {
            value: "" + ModelQuality.Low,
            label: strings.get("TS:GfxQualityLow"),
          }),
        ),
      ),
      React.createElement(
        "div",
        { className: "item", "data-r-tooltip": strings.get("STT:GfxShadows") },
        React.createElement(
          "span",
          { className: "label" },
          strings.get("TS:GfxShadows"),
        ),
        React.createElement(
          Select,
          {
            initialValue: "" + options.graphics.shadows.value,
            onSelect: (e: any) =>
              (options.graphics.shadows.value = Number(e)),
          },
          React.createElement(Option, {
            value: "" + ShadowQuality.High,
            label: strings.get("TS:GfxQualityHigh"),
          }),
          React.createElement(Option, {
            value: "" + ShadowQuality.Medium,
            label: strings.get("TS:GfxQualityMed"),
          }),
          React.createElement(Option, {
            value: "" + ShadowQuality.Low,
            label: strings.get("TS:GfxQualityLow"),
          }),
          React.createElement(Option, {
            value: "" + ShadowQuality.Off,
            label: strings.get("TS:GfxQualityOff"),
          }),
        ),
      ),
    ),
    mixer &&
      React.createElement(
        "fieldset",
        null,
        React.createElement("legend", null, strings.get("GUI:Sound")),
        React.createElement(
          "div",
          { className: "sound-sliders" },
          [...CHANNEL_LABELS].map(([ch, labelKey]) =>
            React.createElement(
              "div",
              { className: "slider-item", key: ch },
              React.createElement("span", { className: "label" }, strings.get(labelKey)),
              React.createElement(Slider, {
                min: 0,
                max: 10,
                value: "" + 10 * mixer.getVolume(ch),
                onChange: (e: any) =>
                  mixer.setVolume(ch, Number(e.target.value) / 10),
              }),
            ),
          ),
        ),
        music &&
          React.createElement(MusicJukebox, { music, strings: strings }),
      ),
  );
