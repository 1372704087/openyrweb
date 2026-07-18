# 尤里海军 AI 支持实现计划

## Context

Custom AI 中尤里（Yuri/ThirdSide）目前不会建造 `YAYARD`（潜艇基地/船厂），也没有海军行为。根本原因是：

- `attackMission.ts.js` 的 `calculateTargetComposition` 在 `useNaval=true` 时仍对 `ThirdSide` 返回陆地编队 `getYuriComposition`；
- 没有 `yuriNavalCompositions.ts.js`；
- `buildingRules.ts.js` 没有注册尤里海军单位 `BSUB`（雷鸣潜艇）、`YHVR`（悬浮运输艇）；
- 海军任务（侦察、反船厂、反潜）只识别盟军/苏军船厂与舰船，不识别 `YAYARD`/`BSUB`。

本计划让尤里 AI 能够像盟军/苏军一样建造船厂、生产海军单位，并在需要时切换为海军攻击编队。

## Approach

遵循现有盟军/苏军海军模式，新增尤里海军编队文件并补齐注册与任务识别。

### 1. 新增 `g:\openyrweb\src\game\bot\custom-ai\logic\composition\yuriNavalCompositions.ts.js`

与 `alliedNavalCompositions.ts.js` / `sovietNavalCompositions.ts.js` 结构一致，导出 `getNavalCompositions`。

编队逻辑：

- 有 `YAYARD` → `YHVR: 1`（基础海军存在）
- 有 `NAPSIS`（尤里雷达/心灵感应器） → `BSUB: 2`
- 有 `YATECH` → `BSUB: 3`

> `rulesmd.ini` 中 `BSUB` 的 prerequisite 为 `YAYARD,RADAR`，因此必须建造 `NAPSIS` 才能生产。

### 2. 修改 `g:\openyrweb\src\game\bot\custom-ai\logic\building\buildingRules.ts.js`

在尤里区段新增三行注册：

```js
["NAPSIS", new BasicBuild.BasicBuilding(10, 1, 500)],          // 尤里雷达，解锁 BSUB
["BSUB",   new BasicNaval.BasicNavalUnit(12, 2, 8, 0, 4)],    // 雷鸣潜艇
["YHVR",   new BasicNaval.BasicNavalUnit(4,  2, 0, 0, 0)],    // 悬浮运输艇
```

插入位置紧接 `YAYARD` 注册行之后。

### 3. 修改 `g:\openyrweb\src\game\bot\custom-ai\logic\mission\missions\attackMission.ts.js`

- 在 `System.register` 依赖数组中引入 `"game/bot/custom-ai/logic/composition/yuriNavalCompositions"`；
- 添加 setter 引入 `getYuriNavalCompositions`；
- 修改变量声明；
- 重写 `calculateTargetComposition`，使 `useNaval=true` 时 ThirdSide 返回尤里海军编队，陆地模式仍返回原 `getYuriComposition`：

```js
function calculateTargetComposition(gameApi, playerData, matchAwareness, useNaval) {
  if (useNaval === void 0) { useNaval = false; }
  if (!playerData.country) throw new Error("player " + playerData.name + " has no country");

  if (useNaval) {
    if (playerData.country.side === SideType.ThirdSide) {
      return getYuriNavalCompositions(gameApi, playerData, matchAwareness);
    }
    return playerData.country.side === SideType.Nod
      ? getSovietNavalCompositions(gameApi, playerData, matchAwareness)
      : getAlliedNavalCompositions(gameApi, playerData, matchAwareness);
  }

  if (playerData.country.side === SideType.ThirdSide) {
    return getYuriComposition(gameApi, playerData, matchAwareness);
  }
  return playerData.country.side === SideType.Nod
    ? getSovietComposition(gameApi, playerData, matchAwareness)
    : getAlliedCompositions(gameApi, playerData, matchAwareness);
}
```

### 4. 修改 `g:\openyrweb\src\game\bot\custom-ai\logic\mission\missions\navalScoutingMission.ts.js`

将侦察单位列表扩展：

```js
var scoutNames = ["DLPH", "DEST", "SUB", "HYD", "SQD", "BSUB", "YHVR"];
```

### 5. 修改 `g:\openyrweb\src\game\bot\custom-ai\logic\mission\missions\antiShipyardMission.ts.js`

- 将己方/敌方船厂识别从 `GAYARD || NAYARD` 扩展为 `GAYARD || NAYARD || YAYARD`；
- 将 `wantSubs` 参数改为 `requiredUnits` 对象；
- 工厂中根据阵营选择所需单位：
  - `SideType.Nod` → `{ SUB: 3 }`
  - `SideType.ThirdSide` → `{ BSUB: 3 }`
  - 其他 → `{ DLPH: 5 }`

### 6. 修改 `g:\openyrweb\src\game\bot\custom-ai\logic\mission\missions\antiSubMission.ts.js`

- 导入 `SideType`；
- 将敌方潜艇识别列表从 `["SUB", "DLPH", "SQD"]` 扩展为 `["SUB", "DLPH", "SQD", "BSUB"]`；
- 将 `wantSubs` 参数改为 `requiredUnits` 对象；
- 工厂中根据阵营选择所需单位：
  - `SideType.Nod` → `{ SUB: 2 }`
  - `SideType.ThirdSide` → `{ BSUB: 2 }`
  - 其他 → `{ DEST: 1, DLPH: 2 }`

## Critical Files

- `g:\openyrweb\src\game\bot\custom-ai\logic\composition\yuriNavalCompositions.ts.js`（新建）
- `g:\openyrweb\src\game\bot\custom-ai\logic\building\buildingRules.ts.js`
- `g:\openyrweb\src\game\bot\custom-ai\logic\mission\missions\attackMission.ts.js`
- `g:\openyrweb\src\game\bot\custom-ai\logic\mission\missions\navalScoutingMission.ts.js`
- `g:\openyrweb\src\game\bot\custom-ai\logic\mission\missions\antiShipyardMission.ts.js`
- `g:\openyrweb\src\game\bot\custom-ai\logic\mission\missions\antiSubMission.ts.js`

## Potential Pitfalls

1. `NAPSIS` 必须注册：没有它 `BSUB` 不会出现在生产列表中。当前 `YAPSID` 在 `rulesmd.ini` 中不存在，属于无效条目；本次不处理其他尤里防御建筑 ID 错误。
2. `YHVR` 是无武装运输艇，只会被生产并用于侦察/填充编队，不会主动攻击。
3. `BasicNavalUnit.getPriority` 返回 0，因此海军单位不会自动被 `queueController` 生产，仅由任务 `requestUnits` 驱动，与现有盟军/苏军海军一致。
4. `YAYARD` 在水域地图上才能放置；`queueController` 已有 `MAX_PLACEMENT_FAILURES` 机制避免无限卡死。

## Verification

1. 选择有水域的多人地图，让尤里 AI 开局。
2. 开启 AI 日志，检查是否出现：
   - `[NAVAL_DEBUG] 计算尤里海军编队组成`
   - `[NAVAL_DEBUG] 添加雷鸣潜艇 x2`
   - `Decision (Ships): BSUB`
3. 游戏内观察 AI 建造顺序是否包含 `NAPSIS` → `YAYARD` → `BSUB`/`YHVR`。
4. 当敌方有 `YAYARD` 或 `BSUB` 时，观察 `AntiShipyardMission` / `AntiSubMission` 是否生成并请求 `BSUB`。
5. 通过 `CustomAiBot` 的全局调试文本查看生产队列与任务状态。
