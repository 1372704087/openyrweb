/**
 * MapGen — 生成地图表单（地形类型/时间/气候/地图大小/资源/玩家/城市地形）。
 *
 * 布局仿原版"产生地图"对话框：左列标签、右列下拉，玩家行用滑条，
 * 底部 随机挑选（随机化全部参数）/ 生成地图（回传参数）。
 * 随机地图生成器本体尚未实现，本组件只负责收集参数。
 *
 * 新增文件（无孪生）。
 */
import React, { useState } from "react"; // 孪生（react 外部依赖）
import { Select } from "gui/component/Select"; // 已转换
import { Option } from "gui/component/Option"; // 已转换
import { Slider } from "gui/component/Slider"; // 已转换

/** 生成参数取值表条目（value 为稳定 id，label 为字符串表键）。 */
interface MapGenChoice {
  value: string;
  /** i18n 键。 */
  label: string;
}

/** 地形类型（原版 TXT_MAP_*）。 */
const TERRAIN_TYPES: MapGenChoice[] = [
  { value: "inland", label: "TXT_MAP_INLAND" },
  { value: "continent", label: "TXT_MAP_CONTINENT" },
  { value: "archipelago", label: "TXT_MAP_ARCHIPELAGO" },
  { value: "teamContinents", label: "TXT_MAP_TEAM_CONTINENTS" },
  { value: "mountainous", label: "TXT_MAP_MOUNTAINOUS" },
];

/** 时间（原版 TXT_TIME_*）。 */
const TIMES_OF_DAY: MapGenChoice[] = [
  { value: "morning", label: "TXT_TIME_MORNING" },
  { value: "afternoon", label: "TXT_TIME_AFTERNOON" },
  { value: "dusk", label: "TXT_TIME_DUSK" },
  { value: "night", label: "TXT_TIME_NIGHT" },
];

/** 气候（原版 TXT_THEATER_*）。 */
const THEATERS: MapGenChoice[] = [
  { value: "temperate", label: "TXT_THEATER_TEMPERATE" },
  { value: "snow", label: "TXT_THEATER_SNOW" },
];

/** 地图大小（原版 TXT_MAPSIZE_*）。 */
const MAP_SIZES: MapGenChoice[] = [
  { value: "small", label: "TXT_MAPSIZE_SMALL" },
  { value: "medium", label: "TXT_MAPSIZE_MEDIUM" },
  { value: "large", label: "TXT_MAPSIZE_LARGE" },
  { value: "veryLarge", label: "TXT_MAPSIZE_VERY_LARGE" },
];

/** 资源档位（GUI:Low/Medium/High）。 */
const RESOURCES: MapGenChoice[] = [
  { value: "low", label: "GUI:Low" },
  { value: "medium", label: "GUI:Medium" },
  { value: "high", label: "GUI:High" },
];

/** 生成参数集合（与原版"产生地图"对话框字段一一对应）。 */
export interface MapGenOptions {
  terrainType: string;
  timeOfDay: string;
  theater: string;
  mapSize: string;
  resources: string;
  players: number;
  urbanTerrain: boolean;
}

/** 与原版对话框一致的默认参数。 */
export const MapGenDefaultOptions: MapGenOptions = {
  terrainType: "continent",
  timeOfDay: "afternoon",
  theater: "temperate",
  mapSize: "medium",
  resources: "high",
  players: 8,
  urbanTerrain: true,
};

/** 玩家数范围（原版 2-8）。 */
const MIN_PLAYERS = 2;
const MAX_PLAYERS = 8;

function pick<T>(items: T[]): T {
  return items[Math.floor(Math.random() * items.length)];
}

/** 组件 props。 */
export interface MapGenProps {
  /** i18n 字典。 */
  strings: any;
  /** 点击"生成地图"回传当前参数。 */
  onGenerate: (options: MapGenOptions) => void;
}

/** 生成地图表单。 */
export const MapGen = ({ strings, onGenerate }: MapGenProps) => {
  const [options, setOptions] = useState(MapGenDefaultOptions);
  const setOption = (key: string, value: any) =>
    setOptions((o) => ({ ...o, [key]: value }));

  const renderChoiceRow = (
    key: string,
    labelKey: string,
    tooltipKey: string,
    choices: MapGenChoice[],
  ) =>
    React.createElement(
      "div",
      { className: "map-gen-row", key },
      React.createElement(
        "span",
        { className: "map-gen-label" },
        strings.get(labelKey),
      ),
      React.createElement(
        Select,
        {
          initialValue: options[key],
          tooltip: strings.get(tooltipKey),
          onSelect: (value: string) => setOption(key, value),
        },
        choices.map((c) =>
          React.createElement(Option, {
            key: c.value,
            value: c.value,
            label: strings.get(c.label),
          }),
        ),
      ),
    );

  const randomize = () =>
    setOptions((o) => ({
      ...o,
      terrainType: pick(TERRAIN_TYPES).value,
      timeOfDay: pick(TIMES_OF_DAY).value,
      theater: pick(THEATERS).value,
      mapSize: pick(MAP_SIZES).value,
      resources: pick(RESOURCES).value,
      players: MIN_PLAYERS + Math.floor(Math.random() * (MAX_PLAYERS - MIN_PLAYERS + 1)),
      urbanTerrain: Math.random() < 0.5,
    }));

  return React.createElement(
    "div",
    { className: "map-gen-form" },
    renderChoiceRow(
      "terrainType",
      "GUI:Environment",
      "STT:GenerateCBoxEnvironment",
      TERRAIN_TYPES,
    ),
    renderChoiceRow("timeOfDay", "GUI:TimeOfDay", "STT:GenerateCBoxTime", TIMES_OF_DAY),
    renderChoiceRow("theater", "GUI:Theater", "STT:GenerateCBoxTheater", THEATERS),
    renderChoiceRow("mapSize", "GUI:MapSize", "STT:GenerateCBoxMapSize", MAP_SIZES),
    renderChoiceRow("resources", "GUI:Resources", "STT:GenerateCBoxResources", RESOURCES),
    React.createElement(
      "div",
      { className: "map-gen-row slider-item" },
      React.createElement(
        "span",
        { className: "label" },
        strings.get("GUI:Players"),
      ),
      React.createElement(Slider, {
        min: MIN_PLAYERS,
        max: MAX_PLAYERS,
        step: 1,
        value: "" + options.players,
        "data-r-tooltip": strings.get("STT:GenerateSliderNumPlayers"),
        onChange: (e: any) => setOption("players", Number(e.target.value)),
      }),
    ),
    React.createElement(
      "div",
      { className: "map-gen-row map-gen-urban" },
      React.createElement(
        "label",
        null,
        React.createElement("input", {
          type: "checkbox",
          checked: options.urbanTerrain,
          onChange: (e: any) => setOption("urbanTerrain", e.target.checked),
        }),
        " ",
        React.createElement("span", null, strings.get("NOSTR:城市地形")),
      ),
    ),
    React.createElement(
      "div",
      { className: "map-gen-buttons" },
      React.createElement(
        "button",
        {
          className: "dialog-button",
          "data-r-tooltip": strings.get("STT:GenerateButtonSurprise"),
          onClick: randomize,
        },
        strings.get("GUI:SurpriseMe"),
      ),
      React.createElement(
        "button",
        {
          className: "dialog-button",
          "data-r-tooltip": strings.get("STT:ScenarioButtonRandom"),
          onClick: () => onGenerate(options),
        },
        strings.get("GUI:GenerateMap"),
      ),
    ),
  );
};
