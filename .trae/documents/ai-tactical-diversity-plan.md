# Custom AI 战术多样化改造实施计划

## 摘要

本计划基于当前 Custom AI 已实现的中立建筑占领、基础陆/海军进攻、MCV 扩张与基地防御，继续落地“让 AI 更像玩家一样多样化施压”的目标。近期优先完成 **Phase 1（工程师/间谍骚扰与关键建筑占领）** 与 **Phase 2（攻击形式与编成多样化）** 中尚未完成的具体任务：

- 任务 #14：扩展 `EngineerMission` 到敌方关键建筑（建造厂、电厂、矿厂、车厂）。
- 任务 #15：新增 `SpyMission` 并注册间谍单位 `SPY`。
- 任务 #16：重新平衡盟军/苏军/尤里陆军编成，避免单一兵种堆叠。
- 任务 #17：新增 `AirRaidMission`，让空军独立成军。
- 任务 #18：新增 `NavalAssaultMission` 并在 `AttackMissionFactory` 中加入攻击形式选择器。

## 当前架构与现状分析

### 1. 任务调度

- 基类：`src/game/bot/custom-ai/logic/mission/mission.ts.js`（第 55–144 行），任务返回 `requestUnits` / `requestSpecificUnits` / `grabCombatants` / `disbandMission` / `noop`。
- 调度器：`src/game/bot/custom-ai/logic/mission/missionController.ts.js`（第 55–349 行），每 tick 轮询工厂并按优先级分配单位。
- 工厂注册：`src/game/bot/custom-ai/logic/mission/missionFactories.ts.js`（第 52–67 行）。

当前已注册工厂：Expansion、Scouting、Attack、Defence、Engineer、NavalScouting、AmphibiousScouting、AntiShipyard、AntiCoastShip、AntiSub、ReserveRhino、DreadEscort。

### 2. 建筑/单位注册

- `src/game/bot/custom-ai/logic/building/buildingRules.ts.js` 第 151–228 行的 `BUILDING_NAME_TO_RULES` Map 控制生产优先级与最大数量。
- 已注册工程师 `ENGINEER` / `SENGINEER`，但 **未注册间谍 `SPY`**。
- 已注册盟军空军 `JUMPJET` / `ORCA`、苏军空军 `ZEP`；尤里没有空军单位。

### 3. 目标选择可用的 API 属性

来自 `GameApi.getGameObjectData()` / `getUnitData()` 的 `rules`（`TechnoRules.ts.js`）：

- 建筑身份：`constructionYard`、`refinery`、`weaponsFactory`、`radar`、`nukeSilo`。
- 电力：没有 `powerPlant` 布尔值，可通过 `rules.power > 0` 或建筑名识别（盟军 `GAPOWR`、苏军 `NAPOWR`/`NANRCT`、尤里 `YAPOWR`/`NATBNK`）。
- 可占领/渗透：`capturable`、`spyable`、`canBeOccupied`。
- 单位职能：`engineer`、`agent`、`infiltrate`、`harvester`。
- 可用命令：`OrderType.Capture`、`Occupy`、`Enter`、`Attack`、`Move`、`UnloadAll` 等。

### 4. 现有任务局限

- `EngineerMission`（`engineerMission.ts.js` 第 70 行）只扫描 `r.capturable && r.produceCashAmount > 0`，即中立油井/科技建筑，不会主动偷敌方基地。
- `AttackMission`（`attackMission.ts.js` 第 305–324 行）只发起地面进攻，海军仅在陆地 unreachable 或失败两次后回退（第 131–140 行），空军单位不被 `CombatSquad` 视为地面作战单位。
- 陆军编成单一：苏军 `HTNK` 堆叠、盟军 `JUMPJET` 堆叠、尤里已改为 `LTNK`/`BRUTE`/`TELE`/`MIND` 但盟军/苏军仍待调整。

## 拟议修改

### Phase 1：工程师/间谍骚扰与关键建筑占领

#### 1.1 扩展 EngineerMission（任务 #14）

**文件**：`src/game/bot/custom-ai/logic/mission/missions/engineerMission.ts.js`

**修改内容**：

1. 在 `EngineerMissionFactory.maybeCreateMissions` 中，把目标扫描从“仅中立产钱建筑”扩展为：
   - 高价值敌方建筑：`constructionYard`、`weaponsFactory`、`refinery`。
   - 敌方电厂：通过 `rules.power > 0` 或阵营电厂名识别（`GAPOWR`、`NAPOWR`、`NANRCT`、`YAPOWR`、`NATBNK`）。
2. 对目标按价值排序：建造厂 > 车厂/矿厂 > 电厂 > 中立产钱建筑，同价值按距己方基地距离升序。
3. 增加“Rush 模式”：游戏时间前 3 分钟（约 180 秒），若已发现敌方建造厂或电厂，立即以高优先级（priority 150）创建工程师任务。
4. 每个目标只创建一个 mission，避免重复：通过 `missionController.getMissions()` 检查是否已存在同名 `capture-<targetId>` 任务。
5. 工程师派出后 2 秒内若目标被摧毁/占领，任务自动解散（复用 `hasAttemptedCaptureWith` + 目标存活检查）。

**关键代码位置**：

- `engineerMission.ts.js` 第 64–77 行：`EngineerMissionFactory.maybeCreateMissions`。
- `engineerMission.ts.js` 第 41–54 行：`EngineerMission._onAiUpdate`。

#### 1.2 新增 SpyMission（任务 #15）

**文件**：

- 新建 `src/game/bot/custom-ai/logic/mission/missions/spyMission.ts.js`
- `src/game/bot/custom-ai/logic/mission/missionFactories.ts.js`
- `src/game/bot/custom-ai/logic/building/buildingRules.ts.js`

**修改内容**：

1. 在 `buildingRules.ts.js` 的 `BUILDING_NAME_TO_RULES` 中注册：
   - `["SPY", new BasicGround.BasicGroundUnit(1, 0, 0)]`（盟军间谍）。
   - 如后续需要苏军/尤里对应单位，可再注册 `IVAN` / `YURI`（但优先级低，先实现盟军间谍）。
2. 新建 `SpyMission`：
   - 目标选择：敌方 `power > 0` 的电厂（断电）、敌方 `refinery` / 油井（偷钱）、敌方 `weaponsFactory` / `constructionYard`（渗透）。
   - 执行指令：使用 `OrderType.Enter` 或 `Occupy` 让间谍进入目标。
   - 单独编队，不混入 `CombatSquad`；路径上尽量绕开敌方战斗单位（先 `Move` 到目标附近再 `Enter`）。
3. 在 `SpyMissionFactory.maybeCreateMissions` 中每 600 tick 检查一次，最多同时存在 2 个活跃间谍任务，避免一次性派出过多。
4. 在 `missionFactories.ts.js` 中导入并注册 `SpyMissionFactory`。

**关键代码位置**：

- `buildingRules.ts.js` 第 151–228 行：新增 `SPY` 注册。
- `missionFactories.ts.js` 第 2 行 import 列表与第 52–67 行工厂列表。

### Phase 2：攻击形式与编成多样化

#### 2.1 重新平衡陆军编成（任务 #16）

**文件**：

- `src/game/bot/custom-ai/logic/composition/sovietCompositions.ts.js`
- `src/game/bot/custom-ai/logic/composition/alliedCompositions.ts.js`

**修改内容**：

1. **苏军**：避免纯 `HTNK` 堆叠，形成“反装甲 + 反步兵 + 远程 + 防空”比例。
   - 兵营阶段：`E2`（动员兵）5、`FLAKT`（防空步兵）2、`DOG` 1。
   - 重工阶段：`HTNK` 4、`HTK`（防空履带车）2、`V3` 2。
   - 雷达阶段：`APOC` 1。
   - 高科阶段：`APOC` 2、`V3` 3。
2. **盟军**：避免纯 `JUMPJET` 堆叠，明确地面与空中比例。
   - 兵营阶段：`E1` 5。
   - 重工阶段：`MTNK` 4、`FV` 2。
   - 空指/雷达阶段：`JUMPJET` 4、`ORCA` 2。
   - 高科阶段：`MGTK` 3、`SREF` 2。
3. **尤里**：已在前期会话中调整（`INIT` 4、`BRUTE` 4、`LTNK` 6、`YTNK` 2、`TELE` 2、`MIND` 2），本阶段不再改动，仅作为协同参考。

#### 2.2 新增 AirRaidMission（任务 #17）

**文件**：

- 新建 `src/game/bot/custom-ai/logic/mission/missions/airRaidMission.ts.js`
- `src/game/bot/custom-ai/logic/mission/missionFactories.ts.js`

**修改内容**：

1. 新建 `AirRaidMission`：
   - 仅请求空军单位：`JUMPJET` / `ORCA` / `ZEP`（按阵营）。
   - 目标选择：敌方矿车（`harvester`）、电厂（`power > 0`）、防空薄弱建筑（无 `antiAir` 能力）。
   - 攻击方式：使用 `OrderType.Attack` 点杀，不集结成地面 `CombatSquad`。
   - 当空军单位数量不足 4 架时进入 `Preparing` 状态；达到 4 架后进入 `Attacking` 状态。
   - 任务完成后解散，单位回归基地。
2. 新建 `AirRaidMissionFactory`：
   - 每 900 tick 检查一次，且仅当己方有空指/雷达/机场建筑时创建。
   - 每个工厂实例最多同时存在 1 个 `AirRaidMission`。
3. 在 `missionFactories.ts.js` 注册。

#### 2.3 新增 NavalAssaultMission 与攻击形式选择器（任务 #18）

**文件**：

- 新建 `src/game/bot/custom-ai/logic/mission/missions/navalAssaultMission.ts.js`
- `src/game/bot/custom-ai/logic/mission/missionFactories.ts.js`
- `src/game/bot/custom-ai/logic/mission/missions/attackMission.ts.js`

**修改内容**：

1. 新建 `NavalAssaultMission`：
   - 仅请求海军单位（调用现有 `getSovietNavalCompositions` / `getAlliedNavalCompositions` / `getYuriNavalCompositions`）。
   - 目标选择：敌方沿海建筑、船厂、近岸矿厂。
   - 当船厂存在且水域可达敌方基地时即可主动发起，不依赖 `AttackMission` 失败回退。
   - 舰船到位后使用 `OrderType.Attack` 攻击沿海目标。
2. 新建 `NavalAssaultMissionFactory`：
   - 每 1200 tick 检查一次。
   - 条件：己方有船厂、敌方基地与水域相邻、海军单位数量不足时请求补充。
3. 在 `AttackMissionFactory.maybeCreateMissions` 中加入攻击形式选择器：
   - 当 `matchAwareness.shouldAttack()` 为真时，按权重随机选择：
     - 地面进攻：5
     - 空军突袭：2（仅当有空指/机场）
     - 海军突击：2（仅当有船厂且敌方沿海）
   - 选择海军时创建 `NavalAssaultMission`，选择空军时创建 `AirRaidMission`，默认仍创建 `AttackMission`。

## 假设与决策

1. **间谍单位**：先实现盟军 `SPY`；苏军 `TANY`/`IVAN`、尤里 `YURI` 等渗透单位因机制差异较大，放到后续迭代。
2. **路径绕开敌方单位**：第一阶段先通过 `Move` 到目标附近再 `Enter` 实现“伪绕开”；真正的路径威胁规避需要依赖后续地图威胁网格改造。
3. **空军/海军优先级权重**：5:2:2 为初始经验值，后续根据对战测试调整。
4. **工程师 Rush**：仅在前 3 分钟触发，避免中后期工程师无意义送死。
5. **任务共存**：`EngineerMission` 与 `SpyMission` 独立存在，互不占用单位类型，可同时执行。

## 验证步骤

1. **日志验证**：开启 `CustomAiBot` debug 日志，确认：
   - `EngineerMission` 出现 `capture-<enemyBuildingId>` 且目标名包含敌方建筑。
   - `SpyMission` 被创建并请求 `SPY` 单位。
   - `AirRaidMission` / `NavalAssaultMission` 按权重创建。
2. **对战验证**：在常见 1v1 地图（如 Sand Serpent、Heck Freezes Over）与 AI 对战：
   - 观察工程师是否尝试进入敌方电厂/矿厂/车厂/建造厂。
   - 观察间谍是否出现并进入敌方建筑。
   - 观察空军是否独立编队攻击矿车/电厂。
   - 观察海军是否在陆地进攻之外主动从水路施压。
   - 观察陆军编成是否出现混合兵种而非单一堆叠。
3. **回归验证**：
   - 原有 `AttackMission` 失败转海军逻辑不被破坏。
   - MCV 展开与基地防御逻辑正常。
   - 中立建筑占领仍正常工作。

## 建议启动顺序

按任务编号顺序执行：#14 → #15 → #16 → #17 → #18。每完成一个任务即进行日志 + 简短对战验证，再进入下一个任务。
