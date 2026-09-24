#!/usr/bin/env node
/**
 * tools/fix-cjk-fonts.mjs — 在 Fira 字体栈后追加 CJK 系统字体回退。
 * Fira Sans Condensed 无 CJK unicode-range，缺回退时中文会乱码/豆腐块。
 */
import fs from "node:fs";

const OLD = "'Fira Sans Condensed', Arial, sans-serif";
const NEW =
  "'Fira Sans Condensed', 'Microsoft YaHei', 'PingFang SC', 'Noto Sans CJK SC', 'Source Han Sans SC', 'WenQuanYi Micro Hei', Arial, sans-serif";

const files = [
  "vendor/templates/style.css",
  "build/style.css",
  "tools/build.mjs",
  "src/gui/component/UiText.ts",
  "src/gui/screen/game/component/hud/DebugText.ts",
  "src/gui/screen/game/component/hud/Messages.ts",
  "src/gui/screen/game/component/hud/SidebarCard.ts",
  "src/gui/screen/game/component/hud/SuperWeaponTimers.ts",
  "src/gui/screen/game/worldInteraction/Tooltip.ts",
  "src/engine/renderable/entity/unit/DebugLabel.ts",
  "src/engine/renderable/entity/SecureProgressSprite.ts",
  "src/engine/renderable/entity/PipOverlay.ts",
  "res/changelog.html",
];

for (const f of files) {
  if (!fs.existsSync(f)) {
    console.log("skip missing", f);
    continue;
  }
  let s = fs.readFileSync(f, "utf8");
  const before = s.split(OLD).length - 1;
  if (before === 0) {
    if (s.includes("Microsoft YaHei")) console.log("already ok", f);
    else console.log("no match", f);
    continue;
  }
  s = s.split(OLD).join(NEW);
  fs.writeFileSync(f, s);
  console.log("updated", f, "x" + before);
}
