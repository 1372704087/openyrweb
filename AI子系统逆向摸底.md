# AI 子系统逆向摸底（阶段 0）

日期：2026-09-27。目标：为 OpenYRWeb 移植原版 YR（gamemd.exe 1.001）AI 子系统定位函数群、评估工作量、确定移植顺序。

**产物位置**：反编译伪码 `G:\ida-yr-work\out\ai_survey\dec\*.c`（216 个 .c 文件）；结构化数据 `G:\ida-yr-work\out\ai_survey\ai_survey.json`；工具脚本 `G:\ida-yr-work\{extract_yrpp_ai.js, ai_survey.py, ai_houseai_callees.py}`。符号参考统一用 **Phobos YRpp（Phobos-developers/YRpp, phobos-dev 分支）**。

## 一句话结论

**能移植，主入口已全部定位。** AI 核心约 **210 个函数 / 74KB 机器码 / 1.44 万行伪码**，其中真正 AI 专属（剔除 UpdatePower、寻路等已在 TS 侧实现的通用件）约 **8–10k 行伪码**。仓库现有 `src/game/ai` 已覆盖数据解析层和简化版触发/脚本层，缺口集中在：**原版语义的触发条件与权重涨落、小队招募、生产管理、基地选址、超武、难度缩放** 六块。

## 1. 关键定位结果

| 函数 | 地址 | 依据 | 置信度 |
|---|---|---|---|
| **HouseClass::AI**（每 house 每 tick 主入口，3879B/802 行伪码） | `0x4F8440` | 唯一同时调用 AI_BaseConstructionUpdate×3 + AI_VehicleConstructionUpdate + AISupers + Update_FactoriesQueues + TeamTypeClass::CreateTeam 的函数；**零直接调用者（纯虚表调用）** | 高 |
| **TeamClass::AI**（小队逐帧更新+脚本执行，3633B/729 行伪码） | `0x6E9140` | TeamClass 代码区内，调 LiberateMember×6 / AssignMissionTarget×3 / FetchALeader | 高 |
| **AITrigger 评估扫描** | `0x4151E0`（1015B/168 行） | AITrigger 代码区，疑似逐触发器求值入口 | 中 |
| AITriggerTypeClass::ConditionMet（937B/183 行） | `0x41E720` | Phobos YRpp 直接标注 | 高 |

方法论说明：gamemd.exe **未编译 RTTI**（8 个类的 type descriptor 能找到但 COL/vftable 全部为 0），靠 RTTI 挖虚表的方案不可行，已改用调用图定位（已知函数的公共调用者/被调用者反推主入口），本文件地址均可按此法复核。

## 2. 函数清单（按移植集群）

### A. 主入口
| 地址 | 名 | 大小 | 伪码行 |
|---|---|---|---|
| `0x4F8440` | HouseClass::AI | 3879B | 802 |
| `0x6E9140` | TeamClass::AI | 3633B | 729 |

### B. 生产/经济集群（YRpp 有名）
| 地址 | 名 | 大小 | 伪码行 |
|---|---|---|---|
| `0x4FE3E0` | AI_BaseConstructionUpdate（建筑生产+基地） | 1653B | 417 |
| `0x4FEA60` | AI_VehicleConstructionUpdate | 1147B | 213 |
| `0x4FEEE0` / `0x4FF210` | 疑似 AI_Infantry / AI_Aircraft 生产更新（孪生函数，各 805B） | 805B | 144×2 |
| `0x509140` | Update_FactoriesQueues | 361B | 99 |
| `0x4F7870` | CanBuild | 2804B | 536 |
| `0x5051E0` | FirstBuildableFromArray | 291B | 74 |
| `0x505360` | AllPrerequisitesAvailable | 297B | 80 |
| `0x4F83C0` | GetFactoryProducing | — | — |
| `0x50B1D0` | AISupers（超武 AI） | 415B | — |
| `0x5098F0` | AI_TryFireSW | 504B | 99 |
| `0x504790` | UpdateAngerNodes（怒气/难度行为） | 205B | 57 |
| `0x508C30` | UpdatePower | 445B | — |

### C. 小队执行集群（YRpp 有名）
| 地址 | 名 | 大小 | 伪码行 |
|---|---|---|---|
| `0x6F09C0` | TeamTypeClass::CreateTeam（HouseClass::AI 直接调） | 174B | 43 |
| `0x6F1FA0` | ProcessTaskForce | 146B | 37 |
| `0x6F2040` | ProcessAllTaskforces | 37B | 14 |
| `0x6F1320` | CanRecruitUnit | 1202B | 177 |
| `0x6EC3D0` | FetchALeader | 125B | 30 |
| `0x6EA500` | AddMember | 257B | 48 |
| `0x6EA870` | LiberateMember | 532B | 131 |
| `0x6EC3A0` | ScanLimit | 48B | 14 |
| `0x6E9050` | AssignMissionTarget | 239B | 59 |
| `0x6EF4D0` | GetTaskForceMissingMemberTypes | — | — |

### D. 触发集群（YRpp 有名）
| 地址 | 名 | 大小 | 伪码行 |
|---|---|---|---|
| `0x41E720` | ConditionMet（11 类条件的求值） | 937B | 183 |
| `0x41FD60` / `0x41FE20` | RegisterSuccess / RegisterFailure（WeightCurrent 涨落） | 191/187B | 33/29 |
| `0x41EE90` / `0x41EC90` / `0x41EAF0` | Owner/Civilian/EnemyHouseOwns | — | — |
| `0x41F0D0` / `0x41F180` / `0x41F230` | IronCurtainCharged / ChronoSphereCharged / HouseCredits | — | — |
| `0x41F2E0` / `0x41F490` | LoadFromINIList / SaveToINIList | — | — |

### E. 基地/选址相关（HouseClass::AI 的未知 callee，**需阅读伪码定名**）
| 地址 | 大小 | 伪码行 | 初步猜测（读伪码确认） |
|---|---|---|---|
| `0x6F0AB0` | 1288B | 349 | TeamClass 区，紧邻 DestroyAllInstances；疑似队伍清理/再分配 |
| `0x4FD500` | 1074B | 247 | FindBuildingOfType 附近；疑似基地节点/建筑选择 |
| `0x50AF10` | 699B | 124 | AISupers 附近；疑似超武目标选择 |
| `0x42E6F0` | 141B | 33 | HouseClass::BaseClass（基地节点表管理） |
| `0x42F380` | 23B | 15 | FailedToPlaceNode |
| `0x5D3BA0` | 952B | ~200 | 待定名 |
| `0x4ADCD0` | 520B | ~100 | BuildingClass 区，待定名 |

### F. 数据解析锚点（INI 字符串 xref 定位）
`TaskForces` → `0x6E8220`/`0x6E8340`；`TeamTypes` → `0x6F19B0`/`0x6F1AB0`；`ScriptTypes` → `0x691970`（ScriptTypeClass::LoadFromINIList）；`AIDifficulty` → `0x671EA0`。注意：exe 字符串里 **没有** "AITriggerTypes" 的独立 xref（AITrigger 解析可能走别的字符串形式或内联，待查，但 TS 侧解析器已实现，非阻塞）。

## 3. 现状 vs 原版差距（对照 `src/game/ai`）

已有（`AiData.ts` 7 个解析器 + `AiEngine.ts` 788 行）：
- ✅ aimd.ini 解析：GroupWeights/TaskForces/ScriptTypes/TeamTypes/AITriggerTypes/AIDefenseTypes/BuildQueues
- ✅ ActiveTeam 状态机（recruiting → executing → done）、脚本动作执行器（YR 动作码）
- ✅ 简化版触发评估：**只实现了 4 类条件**（时间/单位数/金钱/默认），一次性触发不复位

缺口（按原版函数对号）：
1. **触发语义不完整**：ConditionMet（0x41E720，183 行）有 11 类条件 + 6 档比较器；缺基地数、熟练度、超武充能（IronCurtain/ChronoSphereCharged）、阵营归属等。
2. **权重涨落缺失**：RegisterSuccess/Failure 调整 WeightCurrent（0→Weight 衰减回归），这是原版 AI"打完就收、不无限爆兵"的核心机制；现有实现是 fire-once 布尔。
3. **招募语义是发明的**：原版招募 = CanRecruitUnit（1202B，含 limbo/运输/编队约束）+ GetTaskForceMissingMemberTypes 精确缺员补齐 + FetchALeader 选队长；现有按 TaskForce 数量直接征召。
4. **生产管理整块缺失**：AI 建筑造什么/造几个/电力优先级（AI_BaseConstructionUpdate 417 行）、载具/步兵/飞机四条生产线（AI_VehicleConstructionUpdate + 0x4FEEE0/0x4FF210）、工厂队列调度（Update_FactoriesQueues）、前置判定（CanBuild 536 行）。
5. **基地选址整块缺失**：BaseClass 节点表 + FailedToPlaceNode + 疑似选址簇（0x6F0AB0/0x4FD500）。
6. **超武 AI 缺失**：AISupers + AI_TryFireSW + 疑似目标选择 0x50AF10。
7. **难度缩放缺失**：AIDifficulty 解析锚点 0x671EA0 + 怒气节点 UpdateAngerNodes。

另有 `src/game/bot`（OriginalAiBot/IraqBot/ScenarioTeamBot）是规则替代品，与本次移植目标正交：AiEngine 对齐原版后，bot 层可逐步退役或仅做战役脚本用途。

## 4. 移植批次与工作量估算

伪码行按 ×0.7~0.9 折算 TS 行，另加 30% 测试代码：

| 批次 | 内容 | 输入伪码 | 估 TS | 依赖 |
|---|---|---|---|---|
| 1 | 数据层语义对齐（解析已有，补 Difficulty/难度参数） | ~0.5k | ~0.5k | 无 |
| 2 | 触发层：ConditionMet 全条件 + RegisterSuccess/Failure 权重涨落 + 0x4151E0 扫描节拍 | ~1.5k | ~1.5k | 1 |
| 3 | 小队层：TeamClass::AI + 招募四件套 + CreateTeam/ProcessTaskForce | ~2.5k | ~2.5k | 2 |
| 4 | 生产层：四条 AI 生产线 + 工厂队列 + CanBuild/前置判定 | ~2.5k | ~2.5k | 1 |
| 5 | 基地选址 + 超武 AI + 怒气/难度 | ~2k | ~2k | 4 |

核心总量 **~8–10k TS 行 + parity 测试**。批次 1/2 可独立先行并出可测产物；批次 3 完成后 AI 行为即可达到"原版剧本驱动"的观感；批次 4/5 补齐经济与扩张能力。

## 5. Parity 与验收策略（建议）

- **分层验收，不追整局逐帧**：数据层解析快照全绿；逻辑层单函数单元测试（固定状态输入→期望输出，`dec/*.c` 就是期望行为的规约）；行为层用种子化 RNG 做场景级对齐。
- **随机数**：先核对原版 AI 用哪个 RNG 通道（`Prng.ts` 已有），否则行为层 parity 永远对不上——这是批次 2 开工前必须确认的第一件事。
- **字段偏移桩**：沿用磁电坦克模式（字段偏移进桩环境常量表），HouseClass/TeamClass 的关键字段偏移在阅读伪码时顺手记录。

## 6. 风险

1. `dec/*.c` 是 HexRays 产物，控制流还原有噪声（尤其 TeamClass::AI 729 行），移植时需按语义重构而非逐行翻译——磁电坦克已有成熟经验。
2. HouseClass::AI/TeamClass::AI 均为虚表调用，静态调用图不闭合；后续若要全量调用图，需从 vtable 常量表补边（exe 无 RTTI 但 vftable 常量仍在）。
3. "临时源码 Tt 枚举"参照源已不在 `临时文件/`（目录已空），脚本动作码语义以 `dec` 伪码 + ModEnc 为准。
4. E 组 7 个函数是猜测命名，批次 4/5 开工前先花半天读伪码定名。

## 7. 下一步

1. ~~确认 AI 随机数通道~~ ✅ 已定案（见下方进度更新）。
2. ~~批次 1：数据层对齐~~ ✅ 已完成（见下方进度更新）。
3. 批次 2：ConditionMet + 权重涨落移植（触发层）。

## 8. 进度更新（2026-09-27）

### 随机数通道（批次 2 硬前置，已定案）

RA2/YR 的 RNG **不是红警1的 LCG**（全 exe 搜不到 0x41C64E6D），而是 Phobos YRpp `Randomizer.h` 标注的**表驱动滞回斐波那契 XOR**：`Table[250]`，`Next1/Next2` 两索引环绕，`Table[Next1] ^= Table[Next2]` 递进；方法 `Random()=0x65C780`、`RandomRanged(min,max)=0x65C7E0`（汇编核对过函数体，与 Phobos 布局 `bool+Next1+Next2+Table` 完全吻合）。

AI 的调用通道已按调用点汇编定案：
- **同步通道（gameplay parity 唯一相关）**：`ScenarioClass::Random`（实例=ScenarioClass 全局 `0xA8B230` 解引用 +0xDA），生产四线（0x4FE3E0/0x4FEA60/0x4FEEE0/0x4FF210）、选址（0x4FD500/0x6F0AB0）、触发扫描（0x4151E0）、PickRandomCellInZone 全部走它。
- **非同步通道（仅一处）**：HouseClass::AI 内"每局一次性"初始块（`byte_A8F03C` 门控）用独立全局 Randomizer `0x886B88`（种子源 `0xA8ED94`）。
- TeamClass::AI 本体不直接调 RNG。
- 顺带定案：AI 主循环的 15 帧节拍来自全局帧计数器 `0xA8ED84 % 15`。

### 批次 1 完成：AiData 原版格式对齐

对照真实 `尤里复仇配置文件/aimd.ini`（132 TaskForce / 163 TeamType / 88 ScriptType / 165 AITrigger）修正了三处自创格式偏差，`src/game/ai/AiData.ts` 现在双格式兼容（原版为主，旧自创为回退）：
1. **TaskForce**：原版编号键 `0=count,type[,group]` + `Name=` + 段级 `Group=`（旧实现读 `GroupN=` 键，原版文件一个都读不到）。
2. **TeamType**：修正 4 个大小写错误键（`Autocreate`/`Prebuild`/`AvoidThreats`/`TransportsReturnOnUnload`，IniSection 是 Map 实现、大小写敏感），补齐 14 个原版字段（VeteranLevel/Reinforce/Aggressive/Suicide/IsBaseDefense/OnlyTargetHouseEnemy 等）。
3. **AITriggerType**：实现原版 18 字段全行 CSV（ModEnc 文档 + 真实数据互证），含比较器 hex 解析（前 4 字节 LE=操作数、第 5 字节=算子）、权重三元组、难度开关；键=触发器 ID。旧字段 `condition/value/comparison` 做过渡映射。

验证：编译后模块直接喂真实 aimd.ini，四类全部全量解析成功（132/163/88/165），抽查条目逐字段与源文件吻合；门禁 `test:parity`/`test:boot`/`test:alias-shadow` 全绿。验证脚本 `临时文件/validate_aidata.mjs`。

### 批次 2 完成：触发层移植（2026-09-27）

**依据链补全**：ConditionMet 0x41E720 的唯一调用者 = 0x6F0AB0（即 HouseClass::AI 的直接被调用者，此前误猜为队伍清理——**实为逐 house 触发扫描+加权分布**）；RegisterSuccess/Failure 的唯一调用者 = **TeamClass 析构 0x6E8DE0**（队伍消亡时按 +132 成功标志、按 Team1 匹配登记）。rulesmd.ini [General] 六键与反编译偏移互证：AITriggerSuccessWeightDelta=20(+192)、AITriggerFailureWeightDelta=-50(+200)、AITriggerTrackRecordCoefficient=1(+208)、TeamDelays=2000,2500,3500、TotalAITeamCap=30,30,30(+5068)、AIMinorSuperReadyPercent=.7。

**落地**：
- 新增 `src/game/ai/AiTriggerRuntime.ts`：ConditionMet 全门控（基地防御优先三分支/难度开关/科技/Global-战役互斥）+ 条件 switch（-1..7）+ 六档比较器；RegisterSuccess/Failure 权重公式逐行移植；扫描=权重分布（WeightCurrent 即权重，5000=立即单独点火）。
- `AiEngine` 集成：init 时初始化权重状态并从 rules [General] 载入参数；原版格式触发器（globalFlag=1）走 `checkOriginalTriggers`（TeamDelays[难度] 节拍），旧自创格式保留遗留路径；6 个队伍消亡点接 `finishTeam` 成功/失败登记（脚本走完=成功，招募失败/超时无单位/脚本中断=失败，DestroyTeam=成功）。
- world 适配缺口（电力/超武/目标金钱暂不可查询，给保守缺省：低电力永不成立、超武永不充能）；Team2 跨 house 建队挂起；RNG 用 Math.random 占位（表驱动 RNG 换装后才能谈逐帧 parity）。

**验证**：三道门禁全绿；parity 快照按流程 `--update-snapshots` 更新，新模块带权重公式/扫描门控双探针；端到端冒烟（`临时文件/validate_aidata.mjs`）：真实 aimd.ini 165 触发器 → 扫描 200/200 命中，权重涨落正常。

### 批次 3 完成（第一切片，2026-09-27）：RNG 精确移植 + 招募语义原版化

- **`src/game/ai/Randomizer.ts`**：ScenarioClass::Random 表驱动 RNG 全保真移植——ctor 0x65C6D0（250 项表展开，K1/K2 常数 Feistel 4 轮混合，常数表 IDA 实测 @0x839644/@0x839690，默认种子 0xFFFFFFFF）、Random 0x65C780（XOR 递进）、RandomRanged 0x65C7E0（位长掩码拒绝采样，bit31 不参与探测的原版怪癖保留）。触发扫描 world 已换装（`options.rngSeed` 可注入种子）。**运行时种子源（对局开局如何播种）待接游戏会话后核对，这是逐帧 parity 的最后一块。**
- **`src/game/ai/AiTeamRuntime.ts`**：GetTaskForceMissingMemberTypes 0x6EF4D0 精确移植（缺员=编成行减现有同类型）；FetchALeader 0x6EC3D0 移植（队长评分最高者）；CanRecruitUnit 0x6F1320 为 IDA 合并块函数（外层是 TeamType INI 读取器），按文档语义近似并标注待拆分。AiEngine.updateRecruiting 已改用缺员驱动 + 每缺员条目补一人。
- TeamClass::AI（0x6E9140，729 行）状态机主体未整体移植——是批次 3 第二切片/批次 4 的主要工作。
- 验证：三道门禁全绿，parity 新增 Randomizer（确定性+界内采样）与 AiTeamRuntime（缺员/补员/队长）探针。

### 批次 4 第一切片完成（2026-09-27）：生产层基础函数

- **`src/game/ai/AiProductionRuntime.ts`**：三个基础函数精确移植——AllPrerequisitesAvailable 0x505360（前置逐项 any-of，负数索引 -1..-6 → [General] 替代组 +2248/+2276/+2304/+2332/+2360/+2612）、FirstBuildableFromArray 0x5051E0（country 位掩码 +1740、必须/排除位掩码 +3488/+3492、侧位 +1744）、Update_FactoriesQueues 0x509140（按 AbsID 分发 house 工厂槽位：建筑 +21420/步兵 +21436 与变体 +21452/载具 +21424/飞机 +21432 与 +21428；逐项撤销失效生产；队列空且无在制品挂起工厂）。
- **结构考证**：AI_BaseConstructionUpdate 0x4FE3E0 是**队列管理器**而非决策树——建造队列为 house+22280（16 字节条目）计数 +22292、工厂关联 +22276、待放置节点 +22092；内含前置校验与 RandomRanged 选择。**谁向队列入队（BaseNode/触发需求→建造项的映射）是生产层剩下的核心谜题**，下一轮考证。
- 验证：三道门禁全绿，parity 新增前置 any-of/FirstBuildable/工厂队列三探针。

### 建造队列入队源考证完成（2026-09-27 第二轮）

按立即数 0x5714/0x5710 全 .text 扫描 + 反编译，建造队列（house+22280/+22292）的完整操控图景：

| 函数 | 角色 | 关键语义 |
|---|---|---|
| `0x4FE3E0` AI_BaseConstructionUpdate | 生产驱动 | 从队列头启动生产；+22092 待放置节点时退出 |
| `0x506EF0` | 槽位填充 | 按索引写队列条目 {类型ID(+3576), 选定具体类型}，选择用 FirstBuildableFromArray 扫 [General]+2640 数组；辅助器 sub_5060B0/sub_505FD0 |
| `0x50A5C0` | **动态插队** | 电力不足（GetPowerPercentage）时把电站**插到队列中部**（memcpy 后移+计数++）；也按既有建筑类型（BuildingClass+1312→+3576）追加同类——这就是 AI"缺电秒补电站/被拆了补建筑"的机制本体 |
| `0x4FDD10` | 维护/出售 | 遍历队列退款（house+780 +=），卖建筑（+22392/+22393 标志），FirstBuildable 扫 General+2360（即 -2 前置组） |
| `0x50C210` | 空队重建 | 队列空时（由 0x6E0EF0 在 house+499 触发路径调用）扫己方建筑（+108/+120），匹配 [General]+556 列表，按建筑位置重新入队 |
| `0x6DD8B0`（1039 行） | 待定名 | 触及 count 且调用 CreateTeam——疑似基地重部署/主基地逻辑，下轮定名 |

**结论：AI 造什么不是单一决策树，而是"初始队列 + 动态插队（电力/重建需求）+ 槽位刷新（General 建筑数组）"三源合流**。移植建议按 0x50A5C0（电力插队，最高价值）→ 0x50C210（空队重建）→ 0x506EF0（槽位刷新）顺序切片。

### 建造顺序谜底收口（2026-09-27 第三轮）

0x50A5C0 全读后定性升级：它不只是"电力插队"，而是**基地管理总巡**——重算基地锚点（最新建成的 General+556 组建筑，锚点存 house+21648）→ 空队时调 0x5054B0 建初始队列 → 刷新每条目的建造位置（在同类建筑旁）→ 电力不足插电站 → 按既有建筑补同类。

**0x5054B0（578 行）= 初始建造顺序本体**，机制已定案：按固定顺序遍历 [General] 的 **Prerequisite 组**（FirstBuildableFromArray 逐组选本国可造型号），每组按难度数量（General +1232/+1246 按难度索引）与 RandomRanged 变体挑选入队。**六组键名已在真实 rulesmd.ini 逐字验证**：PrerequisitePower（GAPOWR,NAPOWR,NANRCT,YAPOWR）/ PrerequisiteFactory / PrerequisiteBarracks / PrerequisiteRadar / PrerequisiteTech / PrerequisiteProc（+ProcAlternate=SMIN）。这六组**同时**就是 AllPrerequisitesAvailable 负数索引 -1..-6 的替代组——"前置检查"和"建造顺序"共用同一份数据，组→偏移的精确对应（+2220/+2248/+2276/+2304/+2332/+2360/+2612）下一轮按 0x5054B0 行序逐项核对后即可移植。

### 批次 4 第二切片完成（2026-09-27）：Prerequisite 组驱动的建造队列维护器

`AiProductionRuntime.ts` 新增（纯逻辑+探针，AiApi 生产接线待后续）：
- `PREREQ_GROUP_KEYS` / `NEGATIVE_GROUP_INDEX`：七组键名与 -1..-6 映射定案（-1=Factory…-5=Proc，-6=ProcAlternate；exe 解析 `Prerequisite=<组名>` 时换算，Power 无负索引因前置链显式）。
- `buildInitialQueue`：按 0x5054B0 实测组序（Power→Factory→Radar→Proc→Barracks；Tech 另路）逐组 FirstBuildable 选型入队；按难度数量扩展待对照。
- `maintainPrerequisiteGroups`：六主组"被拆即补"（组失去所有权且队列无该组条目 → 追加）。
- `insertPowerIfLow`：电力不足且队列无电站 → 插入队列中部（原版 memcpy 后移语义）。
- 验证：三道门禁全绿，AiProductionRuntime 探针扩到 4 个（新增初始队列组序/维持补建/电力插队去重）。
### 批次 4 第三切片完成（2026-09-27）：生产接线（建造队列接入对局）

- AiEngine 新增 `updateProduction`（900 tick 节拍=1 游戏分钟，仅原版格式数据源激活）：剪除已建成组条目 → 空队建初始队列 → 缺组补建 → 电力插队 → 上限 8 条。
- **接线点 = `getBuildQueue()`**：原版格式数据源时返回运行时队列（{unitType, priority}），bot 层（OriginalAiBot._handleProduction → actionsApi.queueForProduction/placeBuilding）**零改动**消费；旧自创格式数据源维持原路径。
- `buildProductionWorld` 适配器：电力取真数据（getPlayerData().power.isLowPower）、组列表读 rules [General] 实键、建造所属用 getVisibleUnits(Building) 收集； nation 位掩码暂全放行（列表序兜底，TODO 补规则对象的 country/side 位）。
- 验证：三道门禁全绿。**至此 AI 闭环成型：触发器决定"打谁/何时打"，建造维护器决定"发展什么"，bot 层负责落地执行。**
- 下一步候选：基地选址（0x4FD500/0x50AF10）、超武 AI、CanBuild 精确化、国别位掩码。

### 批次 5 第一切片完成（2026-09-27）：超武 AI

- **`src/game/ai/AiSuperWeaponRuntime.ts`**：AI_TryFireSW 0x5098F0 分发器移植——按原版 SuperWeaponType 编号（引擎枚举 1:1 对齐）分发：0 MultiMissile 点目标（PickIonCannonTarget/PickTargetByType）、2 风暴、5/6 空投、7 心灵支配、9 突变器、8/11 侦察揭谍；**1 铁幕/3 超时空/4 传送/10 护盾 AI 不自动释放**（铁幕/超时空只作为触发器条件 5/6——与触发层考证互洽）。
- **AiEngine 集成**：`updateSuperWeapons` 每 300 tick 从 getAllSuperWeaponData() 取己方就绪超武（status=2 Ready），目标选择=可见敌人建筑优先（近似原版评分，TODO 精确化），经 `actionsApi.activateSuperWeapon(type, tile)` 下发，全程 try 包裹。
- 验证：三道门禁全绿；parity 新增分发探针（类型覆盖/无目标抑制/未充能跳过）。
- 目标评分精确化（PickIonCannonTarget 0x50CBF0 的 291 行评分）与风暴目标缓存（General+3808 冷却）列入后续。

### 批次 5 第二切片完成（2026-09-27）：基地选址移植

- **`src/game/ai/AiPlacementRuntime.ts`**：0x443C60 放置分支移植——`attemptPlacement`（固定位置优先 → BaseClass Cell 候选格遍历 → 无位且在产则撤销建造条目 → sub_45EE70 放置 → 失败计数 FailedToPlaceNode → 非战役超 [General]+3656 难度上限则取消）+ `processPlacementNodes` 主循环（按序尝试，每次至多成功一节点，失败保留重试，超限出队）。
- world 接口：canPlace（地基/地形/占用）、candidateCells（候选格列表）、place、isProducing/cancelCurrentProduction——由引擎侧/AiApi 注入；建筑"放置动作已就绪"接口已有（actionsApi.placeBuilding）。
- 验证：三道门禁全绿，parity 新增两探针（位置选取回退、失败上限取消）。
- 待接：candidateCells 的真实实现（围绕既有基地的螺旋扫描）接 gameApi 地图查询；与 bot 层 _handlePlacement 整合。

### 基地选址链路考证（2026-09-27 第四轮）

- **`BaseClass`（ctor 0x42E6F0）= AI 基地规划容器**：`DynamicVectorClass<BaseNodeClass>` 节点表（容量 10）+ 两个 `Cell` 可用格列表 + 标志/计数。每 house 一份（HouseClass ctor 内嵌构造）。
- **`0x443C60`（1135 行）= AI 基地放置主逻辑**（FailedToPlaceNode 0x42F380 与 GetBuildableCell 0x42EB20 的共同调用者，主逻辑循环区）：遍历 BaseClass 节点 → 用两个 Cell 候选列表（同 0x506EF0 的 5060B0/505F80 辅助器）选格 → PlaceObject 链（45ECA0/45EC90/47C520）尝试放置 → 失败则节点失败计数 +1（FailedToPlaceNode），附带电力百分比检查（509700）与 RandomRanged。
- 排除项：0x4F7140=HouseClass 析构、0x503040=存读档（两者是 +22092 立即数扫描的误报）。
- **选址算法移植=读 0x443C60 的 1135 行**（节点遍历序、Cell 列表构建规则、失败重试节奏），是下一个移植切片；在此之前 bot 层可用"同类建筑旁螺旋扫描"近似。

### 实测修复 2（2026-09-27）：新模块 404——build/ 逐模块布局被全量构建覆盖

客户端是**逐模块 XHR 加载**（index.html `SystemJS.import("main")` → /main、/game/ai/... 无扩展名文件），而 `npm run build` 全量重建只产出单体 bundle 并清掉逐模块文件 → 404。且 repack 按原版模块清单重组，**新增 TS 模块会被丢掉**（不在旧清单里）。

修复：新增 `tools/emit-permodule.mjs`（npm script `emit:modules`）——从 bundle 提取全部模块 + 从 build/ts-modules 补发 bundle 缺失的新模块，写为 `build/<模块名>` 无扩展名文件；Windows 大小写碰撞（Gui vs gui/...、game/Player vs game/player/...）按原部署约定跳过。**以后 `npm run build` 之后必须跑一次 `npm run emit:modules`**（start.ps1 在 build/index.html 存在时会跳过构建，不受影响）。已验证五个新模块 HTTP 200。

### 实测修复 5（2026-09-27）：组序依赖死锁——Factory 卡死在 Refinery 前

第四轮实测：电厂落地后下一组 War Factory 永远不入队（status=0 items=0 持续）。根因：**INITIAL_BUILD_ORDER 把 Factory 排在 Proc 前，而 NAWEAP 前置=POWER+Proc（GAREFN/GAREFN 类），引擎在入队时校验前置、静默拒绝** → 队头死锁，后续组全部被堵。修复：组序改为满足依赖链 Power→Proc→Barracks→Factory→Radar（与真实 RA2 AI 开局一致：电→矿→兵营→重工→雷达）。**通用教训：前置组序必须满足建筑依赖链，否则入队校验会静默卡死队头；组→偏移映射不能想当然，依赖关系以 rulesmd Prerequisite= 实测为准。**

### 实测修复 1（2026-09-27）：MCV 展开/收起循环

实测"冷酷"档发现基地车展开收起死循环。根因两个叠加：
1. **OriginalAiBot._tryDeployMCV 缺 hasCY 守卫**（IraqBot 有、原版 bot 没有）——无条件对 baseUnit 命名的单位反复下达 DeploySelected；
2. **引擎 DeploySelected 是开关语义**（OrderUnitsAction：全员已展开时再下达=收起）+ 10 tick 节流——展开动画窗口内第二条指令把车折回。

修复（终版，经第二轮返工）：加 `r.type === ObjectType.Building` 建筑计数守卫（部署完成即有建筑→停止下达）+ 节流放大至 200 tick 避开展开动画窗口。**第一版曾用 `r.baseNormal` 当判据——该键缺省 true（TechnoRules.ts:488），MCV 自己就是 true，守卫恒挡死致"完全不展开"**；且侦查/进攻的单位过滤也须排除建筑与基地车（见修复 2）。三道门禁全绿。

### 实测修复 2（2026-09-27）：第二折叠源——侦查指令收走基地

第一轮修复后症状变为"展开后几秒收起循环"：真凶是 **`_tryScout` 的 `r.sight >= 8` 过滤会匹配到基地建筑**（建筑 sight 普遍 ≥8），每 600 tick 给基地下达 Move 指令——而 `MoveOrder` 对带 `undeploysInto` 的建筑会追加 `UndeployIntoTask`（收起变回车再移动，MoveOrder.ts:145）。修复：侦查与闲置进攻的过滤都排除建筑（`r.type !== ObjectType.Building`）和基地车（baseUnit 名单）。注意 bundle/repack 会剥离注释，验证服务端代码要用代码级标记（如 ObjectType.Building 出现次数）而非注释文本。

### 批次 5 第三切片完成（2026-09-27）：选址接线（进对局）

- **复用 `iraq/Util.findPlacement`**（己方 baseNormal 建筑外扩矩形收集候选 → 按 anchor 距离排序 → `gameApi.canPlaceBuilding` 校验）作为 candidateCells 的真实实现，不重复造轮子。
- **AiProductionRuntime.spiralCandidates 语义由 findPlacement 承担**；OriginalAiBot._handleProduction 新增"建筑落地"块：Structures 队列 Ready（status==3）→ 取队首类型 → `_findCYTile`（建造厂锚点，缺失回退第一建筑）→ findPlacement → `actionsApi.placeBuilding`。原版 AI 此前只入队不落子，这是补上的缺口。
- IraqBot（硬编码苏军专用）路径不变。
- 验证：三道门禁全绿。**至此建造回路全通：维护器入队 → bot 生产 → Ready → 选址 → 落地。**

### OpenTS 对照与小队补员（2026-09-28）

**OpenTS（D:\OpenTS-main）**：社区开源 TS 2.03 Firestorm 引擎重建（GPL-3.0，ZivDero），986 个 C++ 文件含完整 TS AI 源码——**team.cpp 3903 行（TeamClass 状态机）、teamtype.cpp 1026 行、aitrig.cpp 1041 行、brain.cpp（TS neuron 脑）**。TS 是 RA2 直系祖先，TeamClass::AI/Scan_Limit/Fetch_A_Leader/Can_Add/Recruit 与 gamemd 函数一一对应——cross-reference 大幅降低 TeamClass::AI（0x6E9140，729 行伪码）移植风险。**用法：OpenTS 给结构语义，gamemd 逆向给行为事实；GPL-3 借鉴结构无碍，逐字复制需注意许可证。**

**本轮落地（AiEngine.updateExecuting）**：执行阶段不满员且 Reinforcable 时持续补员（OpenTS team.cpp L551-558 语义 `for each taskforce index: if Quantity < needed → Recruit`）——攻击波损兵后从兵营/重工继续拉人，原版 AI"越打越有"的关键行为。

**OpenTS TeamClass::AI 结构对照（移植路线图）**：
1. Suspended/SuspendTimer 挂起恢复
2. IsAltered → Recalc_Strength（重算满/缺员标志）
3. IsMoving && IsUnderStrength → Regroup
4. !IsMoving && (IsFullStrength || IsForcedActive) → Flag_Into_Action（开始执行脚本）
5. 各任务力槽位缺员 → Recruit(index)（仅非人类队伍）
6. 空队且 (IsHasBeen || 遭遇战且存活超 DissolveUnfilledTeamDelay) → 删除队伍
7. IsMoving && !IsReforming && !IsUnderStrength → IsNextMission → Next_Mission（脚本耗尽 → 删除队伍）
8. TMission 分发（50+ 动作：MOVE/ATTACK/GUARD/LOAD/UNLOAD/PATROL/SPY/SCATTER/LOOP/SUCCESS/BEGIN_PRODUCTION/FIRE_SALE/SELF_DESTRUCT/ION_STORM/RESHROUD/REVEAL/...）——OpenTS 的 TMission_X 处理函数即脚本动作语义的可读权威参照

### 猎物类型选靶（2026-09-28）

script action 0（Attack，aimd 出现 136 次的第一高频）升级：arg=猎物类别（quarry），按类别过滤可见敌人——0/1=任何、2=建筑、3=矿车、4=步兵、5=载具、6=工厂、7=防御建筑、9=电厂、11=科技建筑（类别表见教程 L349-360，与 ModEnc 一致）。AiEngine 新增 `pickTargetByQuarry`，executeAction case 0 改走类别选靶、无匹配回退最近敌人。**注意：可见性仍受迷雾限制——AI 视野外的目标选不到，属原版近似。**

**2026-09-28 增补（Build* 列表 + INIT 修正 + FLAKT 循环修复）**：
1. **AI 开局建造数据源确认为 [General] 的 Build\* 列表**（BuildConst/BuildPower/BuildRefinery/BuildBarracks/BuildTech/BuildWeapons/BuildRadar/BuildNavalYard，教程《AI的艺♂术》+ rulesmd 3065-3080 行实测双验证）——不是 Prerequisite\* 组（那是前置校验用的）。运行时队列已切换到 Build* 数据源，sidePrefix 过滤选本阵营型号。
2. **YTNK**：rules 有节但不在 [Units] 生产索引（YR 已知怪癖），原版静默跳过——生产循环对未知名字 try/catch 跳过。
3. **FLAKT 无限生产循环修复**：bot 对在产单位重复 queueForProduction 会叠加 quantity 拉长生产进度 → 永远造不完 → 无限烧钱。修复=入队前查重。
4. **选址连续失败放弃机制**：同一建筑 3 次 tile=null → unqueueFromProduction 放弃，不再堵死队列。
5. **INIT 是尤里初级信徒（真实单位）**，曾误加跳过致尤里 AI 无基础步兵，已修正。
6. 素材层待办：GAREFNL4/GAGAP_A 贴图缺失、FACTORY_DEPLOYING 动画帧缺失（均不影响功能）。

1. ~~建造队列入队源考证~~ ✅；~~0x50A5C0 电力插队~~ ✅（维护器三合一）；~~超武 AI~~ ✅；~~基地选址链路考证~~ ✅（移植待做）。
2. **基地选址移植**：0x443C60（1135 行）节点遍历/Cell 列表/失败重试。
3. 步兵/飞机孪生 0x4FEEE0/0x4FF210、CanBuild 0x4F7870（536 行）、AI_VehicleConstructionUpdate 0x4FEA60 细节。
4. 怒气/难度（UpdateAngerNodes）、TeamClass::AI 状态机（729 行）、CanRecruitUnit 块拆分、超武目标评分精确化。

### 实测修复 13-14（2026-09-28 长局第二轮）：尤里 AI 建造链死锁 + 阵营选型

- **修复 13（阵营前缀过滤失效）**：Build* 组是跨阵营列表（BuildRadar=GAAIRC,NARADR,AMRADR,NAPSIS），**Yuri 雷达 NAPSIS 是 NA 前缀**——GA/NA/YA 前缀启发式对 Yuri 必失效（过滤空→回退全列表→队首 GAAIRC 盟军雷达造不了→尤里建造链死锁）。修复=generalGroup 的 Build* 过滤改走**引擎原生 isAvailableForProduction**（productionApi 由 OriginalAiBot 注入 AiEngine.engine），前置/阵营/科技一次校验。
- **修复 14（INIT 误跳 + 猎物类型选靶 + 生产查重 + 选址放弃 + Build* 数据源）**：
  - INIT 是尤里初级信徒（真实单位），曾误加跳过致尤里 AI 无基础步兵——已修正只跳 YTNK；
  - script action 0（aimd 第一高频 ×136）实现 quarry 猎物类别选靶（0-11 类别表，教程 L349-360 与 ModEnc 一致）；
  - 生产入队查重（防 quantity 叠加无限拉长生产）+ 选址连续 3 次失败放弃条目（FailedToPlaceNode 语义）；
  - 初始组序数据源切换为 **[AI] 段的 Build* 列表**（BuildPower→BuildBarracks→BuildRefinery→BuildWeapons→BuildRadar，非 Prerequisite* 组、不在 [General]）。
- 全部已部署（门禁全绿）。**教训：阵营判定绝不用名字前缀启发式，一律走引擎生产可用性校验；AI 消费的 rules/aimd 数据引用完整性不可信，逐条容忍缺失。**

### 实测修复 15（2026-09-29 第七轮）：初始链 CY 前初始化 → 混阵营链锁死、三 AI 不造建筑

- **症状**：盟军/尤里 AI bldgs=1 恒定、credits=20000 不动、无限 `queueing NAPOWR` spam、引擎 Q{status=0 size=0}；苏军 AI 推进到 bldgs=4 后卡死、无限 `queueing GAWEAP` spam、adviceB=2/5 恒定。初始链日志 `NAPOWR -> NAHAND -> NAREFN -> GAWEAP -> GAAIRC`（苏盟混链）。
- **根因（三因叠加）**：①updateProduction 初始组序在首个 900t 节拍构建，此时 MCV 未展开——`hasFactoryFor` 对一切建筑为假 → generalGroup 的 isAvailableForProduction 过滤 ok=[]；②`ok.length>0 ? ok : list` **回退原始混阵营列表**（Build* 列表苏军在前）；③initialBuilt=true 只初始化一轮 → 混链永久锁死。引擎 UpdateQueueAction L138 入队校验（同一函数）拒绝跨阵营条目 → 无限排队-被拒循环。苏军 AI 纯靠文件序 NA 在前推进，卡在 GAWEAP（前置 GACNST 不满足）。
- **修复**：①过滤后不回退（全不可产→空表，组由 maintainPrerequisiteGroups 下轮重试）；②初始链门控 `ownedBuildingTypes().size===0` 时 return（对齐原版 0x50A5C0 只在有 CY 后运转）。
- **教训：带 fallback 的过滤器 + 只执行一次的初始化 + 入队点前置校验静默拒绝 = 无日志死锁；一次性初始化必须延迟到其数据依赖（建造厂）可用之后；bot 侧过滤与引擎校验必须同走 isAvailableForProduction，判定分叉必产生无限排队循环。**

### TeamClass::AI 状态机切片（2026-10-01 批次 6）

- **反编译补齐 32 个函数**（batch4/batch4b，`G:\ida-yr-work\out\ai_survey\dec\batch4*.c`）：TMission 0-59 分发器全挂名 + 状态辅助（6EBAD0 编队到位/6EB490 攻击完成/6EEBD0 FindBuildingByType/691500 GetCurrentMission/426630 计时器）。
- **0x6E9140 主循环骨架定案**：挂起计时（+131/+25/+27）→ 房务 → `v13`=is_next（+128 完成标志置位后的下一帧）→ switch(mission 0-64)。**+132=成功标志（只由 49 号置位）→ 析构时 RegisterSuccess/Failure**。0-52 与 TS 2.03 枚举一一对应（tmission.hh）；53-64 为 YR 新增。
- **核心缺口修复：脚本"不等任务完成"**——旧实现每 30t 重下发然后立即 scriptIndex++，整个脚本 30t 撕完。已重构为原版语义：首帧下发（`missionStarted` 门）→ 每 30t 查 `isMissionComplete` → 完成才推进。完成判定：移动/集结类=全员距锚点 ≤CloseEnough（6EBAD0 简化，rulesmd CloseEnough=2.25 格、集结类放宽 6 格）；攻击=目标消亡或 1800t；Guard=15×arg ticks（RA2 15 帧=1 游戏秒）；装卸/部署=90t 观察窗；其余=即时推进。**脚本耗尽=失败登记**（原版只有 49 号置成功标志）。
- **YR 新增高频任务语义定案**（aimd 使用频次）：**53=GatherAtEnemyBase**（×22，6EF700 日志字符串"A %s Team has chosen (%d,%d) for its GatherAtEnemy cell"实锤：选 Group 最大成员→敌基地中心+规则半径偏移落格）；**54=GatherAtBase**（×34，6EFA10 镜像角度+无敌情随机角）；**58=MoveToFriendlyStructure**（×49，6EE5C0 FindFriendlyBuilding：移到己方指定类型建筑旁）；**46/47=Attack/MoveToBuildingWithProperty**（×45/×24，arg 低 16 位=BuildingTypes 索引，实测 GAREFN/GACNST/GAWEAP/GATECH…；**等效类型=敌方同族**，由 [AI] Build* 列表族表实现）；**55=给队伍上超武**（找 Ready 超武）、57=超时空同类（暂占位）。
- **FindBuildingByType 0x6EEBD0 关键语义**：指定 house 的该类型建筑优先，**类型不符但属敌方且同族（如 NAREFN↔GAREFN）按距离评分参选**——AI 进攻波"打精炼厂/打基地/打重工"的真实选靶。
- **落地实现**：ActiveTeam 增加 missionStarted/missionCell/missionTargetId/missionStartTick；executeAction 增加 BuildingTypes 索引表（buildingNameByIndex，[BuildingTypes] 段缓存）+ 族表（buildingFamily，直接复用 [AI] Build* 列表）+ findBuildingByTypeFamily（敌我过滤+最近优先）；aimd 用到的 20 个动作码全部有语义（49×54/58×49/46×45/54×34/53×22/47×24/11×16=Area Guard 粘滞/5=Guard 计时/6=LOOP 跳行 p-1/43=90t 等待）。
- **parity 新增 2 探针**（is_next 首帧下发→等待→到位推进全链；Guard 计时边界+索引表），快照已更新，1317 全绿。

### TeamClass::AI 状态机第二轮细化（2026-10-01 批次 6 续）

- **Attack（0 号，×136 最高频）完成判定精确化**：0x6ED090=leader 按 quarry 找目标→AssignMissionTarget；0x6EB490 完成条件=**队里再无成员处于有效攻击状态**（成员失效分支全不命中→v12==0→+128=1）。等价落地=`teamAllAttacking`（全员 `attackState===Idle`）+目标消亡+1800t 超时兜底。
- **0x6EB490/0x6EBAD0 的持续纠偏行为**：等待期每 8 帧把走神/无目标/未 initiated 的成员重派向队伍目标。近似落地=攻击/移动类任务等待期每 150t 重下发（目标/锚点不变；**补员进队的成员由此获得首条移动指令**，否则 reinforce 塞进来的新单位永远到不了位、移动任务卡死）。
- **DO（11 号，×16 全 arg=11）=粘滞任务**：0x6ED7E0 给成员派 Mission 后不置完成标志，队伍永驻该步（防御队驻守语义）——曾误实现为"advance"立即推进，已改为 isMissionComplete 恒 false。
- **Move（3 号）完成=6EBAD0 regroup**（全员到位），与实现一致；首帧 AssignMissionTarget+leader 寻路落格。
- **findFreeUnits 复核**：发现 isSelectableCombatant 门槛仍在（前轮记录有误），已真正移除——招募只按类型名匹配，工程师/信徒可被招募。
- **rules[1479]/[1480]（6EBAD0 到位距离）**：1479 高置信=CloseEnough（rulesmd=2.25 格）；1480 未定名（53/54 集结用更大半径），实现取 6 格近似。**IDA 于 2026-10-01 01:30 后持续 "Failed to initialize IDA as library (error code 4)"（此前同参数四连发正常；复制 i64 同样失败=库层问题非数据库问题，装机的汉化 Hook DLL 嫌疑），查证搁置待环境恢复。**

### 招募归属登记 + 队伍生命周期收口（2026-10-01 批次 7）

- **跨队抢员根除**：findFreeUnits 只按名字过滤、`canRecruitUnit` 的 `unit.teamName` 检查依赖引擎不存在的字段——**两个队可同时把同一单位登记进各自 unitIds**（指令互踩、到位判定互相污染、finishTeam 重复登记）。落地 `unitTeamOwners: Map<unitId, team>` 归属表：`claimUnit`（无主或本队→true）、`releaseTeam`（解散清空）、招募/补员两处 grab 循环接线（claim 成功才 push）。**原版 CanRecruitUnit 的核心语义就是"无主才可招"（TeamClass 析构把成员打回无主）。**
- **activeTeams 泄漏根除**：done 队只 continue 不出列，无限累积且**触发层活跃队计数虚高挤占 TotalAITeamCap**。updateTeams 开头清扫 done 队；补 L1147（空编成增援队）漏配的 finishTeam。
- finishTeam 重构：先释放成员归属再登记成败（原版析构语义）。parity 新增 2 探针（claim/release 全链 + done 出列），快照同步。

### 超武目标评分（2026-10-01 批次 8，OpenTS 对照移植）

- **来源**：IDA 仍不可用，改用 OpenTS `HouseClass::AI_Ion_Cannon`（house.cpp L8500-8600，注释完整可读）——TS 的超武 AI 选靶是 RA2 PickIonCannonTarget 0x50CBF0 的直系祖先。数值表取 rulesmd [General] AIIonCannon*Value 实测（基地/战工/科技 100、电厂 60,100,100、防御 35、工程师/矿车/MCV 1）。
- **评分语义**：敌方目标底分 1；**一击死门控**（hitPoints ≤ IonCannonDamage=751 才拿 premium——打不死的厚血建筑只值底分，"打了白打"）；建筑底分 3，一击死按 基地 100→战工 100→科技 100→电厂（难度列）→防御 35→其它 4；步兵一击死 2（工程师 1）；载具一击死 矿车/MCV 1、其它 2；**并列目标均匀随机**（rng 同步通道）。
- **接线**：AiSuperWeaponRuntime 新增 scoreIonCannonTarget/pickIonCannonTarget（纯逻辑+IonTargetView 扁平视图）；AiEngine.updateSuperWeapons 的 world 把 pickPointTarget/pickCrowdTarget（核弹/风暴/支配/突变器共用）接到评分器（原 enemyTile 取"第一个可见敌人"删除），IonCannonDamage 从 [General] 原始键读（缺省 400），难度取 engine.options.difficulty（bot 已传数值）。
- parity 探针锁语义（10 类分值+难度列+胜者+空表），1317 全绿。**教训：IDA 断供时 OpenTS 是可读替代源——TS→RA2 有演化但 AI 系函数家族同构，数值表用 rulesmd 实测值回填即可保真。**

### PickIonCannonTarget 真版校对 + 怒气选敌（2026-10-01 批次 8 续）

- **真版校对（dec/yrpp_HouseClass.PickIonCannonTarget_0x50cbf0.c 本就存在！）**：**YR 无一击死门控**（hitPoints 门控是 TS 2.03 行为，OpenTS 注释误导）；建筑分支序=基地→战工(ToBuild==UnitType)→电厂(power>drain)→防御→插/机坪/神庙→科技中心([General] 列表查表)→4；载具 矿车→MCV→2；**步兵/飞机恒 1**（YR 砍掉了 TS 的工程师/小偷特判——数值同为 1 行为等价）；隐形目标 random(0,best+10)；并列均匀随机；**格子未探明→分值清零**（我们用 getVisibleUnits("enemy") 可见性过滤等价）。评分器已按真版重写，探针同步。
- **UpdateAngerNodes 0x504790 移植**（56 行全读）：每 house 一张怒气节点表（+22024，项={house,anger}）；受害时对加害方累加（delta 为引擎内建，rulesmd 无键，取 20 待考证）；选"怒气最高且非自己/非盟友/非观察者"写入 +22016=当前敌人（Trigger 条件、超武、进攻方向共用）。落地：AiTriggerRuntime.addAnger/selectAngriest（纯逻辑）；AiEngine.angerNodes/focusEnemy/noteAnger/updateFocusEnemy（900t 节拍，排除谓词=非自己+存活战斗方近似）；bot 层 _checkBaseAttack 命中时对警报点 6 格内可见敌方单位所属 house 记怒；超武 buildIonViews 仇恨目标优先（focusEnemy 的目标单列，有则只打它，否则退回全体）。
- **教训：①反编译产物先查库存再下 IDA——dec/ 里 yrpp_ 前缀文件早已覆盖 PickIonCannonTarget/UpdateAngerNodes/CanBuild，这轮才发现；②OpenTS 注释描述的是 TS 行为，跨版本借用时必须以真版伪码复核关键分支。**

### CanBuild 校验 + 选址强化（2026-10-01 批次 8 续二）

- **CanBuild 0x4F7870（536 行）校验结论**：Owner/RequiredHouses/ForbiddenHouses 位掩码 + 窃取科技三旗 + SecretLab + 前置链——与 isAvailableForProduction 语义高度重合（我们用引擎原生校验替代是合理近似，ForbiddenHouses 位掩码缺失但 YR 极少使用）。**不再重复移植。**
- **步兵生产线 0x4FEEE0 读毕**（飞机 0x4FF210 同构）：需求驱动生产=招募态队伍 GetTaskForceMissingMemberTypes 缺口 → 扣在产 → CanBuild → 成本≤资金 → 写建议槽 +22100；选型策略=概率(rules+5108×难度)随机候选 vs 最老需求(minTeamFrame)。**与我们 demand loop 结构一致**，差异仅在概率选型/最老优先两处待补（键名待 IDA）。
- **选址强化（"gave up placing GAWEAP"根因）**：findPlacement 候选带 pad=2 恒定——战工 4 格底盘在 pad2 环带几乎必然失败；且 `baseNormal` 过滤把 MCV/车辆（BaseNormal 缺省 true）当候选中心。修复=pad 随目标底盘 max(2, max(fw,fh)) + 中心只认 `r.type===Building`。iraq/Util.ts（IraqBot 共用，行为同向改进）。
- **教训：①工具函数的过滤谓词依赖缺省值布尔（baseNormal）时，必须叠加类型判据；②选址候选带必须按目标尺寸动态放缩，固定 pad 只适合 1×1/2×2。**

### 库存伪码二轮清点（2026-10-01 批次 9，IDA 断供期）

- **CanRecruitUnit 0x6F1320 定案**：实为 **TeamTypeClass INI 读取器**（0x6F1090 合并块，ympp_ 文件名误导）——顺带收获 TeamType 全字段表（+160 Priority/+164..179 十一个布尔含 LooseRecruit/Aggressive/Reinforce/+180 Max/+184 TechLevel/+208 Group/+224 Script/+228 TaskForce）与**缺省语义**：TaskForce 无效→类型无效；Script/TaskForce 未指定→取全局第一个（dword_8B41CC/dword_A8E8D4）。CanRecruitUnit 真身=AddMember 里的 sub_6EA610（待 IDA）。
- **CreateTeam 0x6F09C0**：`Max` 键=**同类型活跃实例第二层上限**（遭遇战按 TeamTypeActiveCount 0x5095D0、战役按类型内 +220 计数，负数=不限）→ spawnTeam 已落地（aimd 实测 135×Max=1/24×2/4×3，矿车队全 Max=1——此前我们无此上限，同型矿车队会堆叠）。
- **LiberateMember 0x6EA870 / AddMember 0x6EA500 / ScanLimit 0x6EC3A0**：成员按 TF 行计数增减（+136..+163）+幂等保护；AddMember=先脱离旧队再入新队并触发 +125 重评估；ScanLimit=清目标+全员任务置空+标记重扫。**与 claimUnit/releaseTeam 语义等价确认。**
- **FindFirstInstance 0x6F1F70**：线性扫活跃队取首个同型——同型队列顺序消费语义。
- **待 IDA 挂账**（批处理 error 4 持续，GUI 正常——疑似汉化 Hook/授权座位占用，待用户关净 IDA 进程）：0x6EA610 入队资格、rules+5108 概率选型键名、rules[1479]/[1480] 键名、怒气增量内建值（0x504790 调用方）、选址 0x443C60 全文。

### IDA 破案 + 挂账清偿（2026-10-01 批次 9 续，新库 gamemd2.i64）

- **error 4 破案**：`idat -L日志` 拿到真实报错=**Database initialization failed with error 4**——batch4c 脚本异常崩溃未正常关库把 .i64 留成脏库（非授权/汉化 Hook）。**重建**：`idat -A -o新库.i64 -S"auto_wait+qexit" gamemd.exe` 后台 1 分钟出 68.8MB 新库，批处理全通。旧库作废（脚本从不在库改名，产物全在盘，零损失）。
- **rules[1479]/[1480] 破案**（GeneralParser 0x66D530 上下文）：5916=**Stray**、5920=**RelaxedStray**、5912=CloseEnough、5924=GuardModeStray。rulesmd 实测 **Stray=2.0 格、RelaxedStray=3.0**（注释直说"Gather commands will use this number instead, allowing for bigger teams"）→ teamArrived 半径修正 2.0/3.0（原近似 2.25/6 过松——集结任务会提前"完成"）。
- **CanRecruitUnit 真身 0x6EA610 读毕**（AddMember 资格检查）：已在队=不合格；死/limbo/异主=不合格；**不在 TF 编成行的类型不可招**（a4 强制位豁免）；行配额=现有<编成行 count；**优先级抢人**：成员已属它队时，新队 TeamType.Priority(+180) 更高才可夺走。落地：claimUnit 支持高优抢人+旧队名册同步移除，探针锁语义。
- **怒气增量谱系**（0x504790 五个调用方）：宣战 MakeEnemy=+1；结盟/停战=**-整节点怒气**（清仇）；**单位死亡=按价值比例**（0x701900，round(攻击者价值×比值)——固定 20 保留待精校）。
- **rules+5108（步兵概率选型）**未在 GeneralParser 命中，可能在 AI 段解析器——挂账。

### 真版校对第二轮 + 怒气价值比落地（2026-10-01 批次 9 终）

- **怒气价值公式（0x701900 单位死亡处）**：`delta = round(Type.威胁值 × 实际伤害 ÷ Type.Cost)`——按伤害占比记怒，打满血=全额、刮痧=小额。落地：bot 层归因增量=血量差 clamp[1,100]（purchaseValue 权重近似）。
- **AttWaypt（1 号，0x6EC9A0）校对**：完成语义与 Attack 同族（队目标消亡=完成，走 6EB490），此前误归移动族——isMissionComplete 已修（有 missionTargetId 走消亡判定，仅格子时到位）。aimd 未用该码，纯正确性修正。
- **Patrol（16 号，0x6ECCE0）**：周期性换 leader 重指目标（rules+2216 double 键×900 帧周期）——非一次到位，与 Move 有别；aimd 未用，近似保留。
- **rules+5108 双解析器（General/AI）均未命中**：该槽是指针（指向难度 int 数组），写入可能来自动态分配的 ini 列表解析，挂账待专查。
- 门禁 1317 全绿。

### 选址 0x443C60 专项收口（2026-10-01 批次 10）

- **定性修正**：0x443C60 全文通读后确认它**不是节点规划/选格决策**，而是**建造者朝落点的移动微调逻辑**（朝目标走 1 格、超半径回拉、+5860..5862 三向墙偏移、PlaceObject 后任务 juggernaut）。survey 旧猜测"AI 基地放置主逻辑"不准。真正的选格决策在 house 虚表 +1236（FindPlaceCell 虚函数）+ BaseClass 节点（0x42E6F0）——依赖建造者单位机制（我们引擎直放无建造者），**不再移植**。
- **基地落点半径表（从二进制直读）**：sub_45EC90=dword_8192B8=[1,2,1,2,2,3,3,3]、sub_45ECA0=dword_819310=[1,1,2,2,3,2,3,5]（+1 当 house+5488）——**原版 AI 建筑落点距基准 1~5 格**，按 house+956（建造风格槽）/+3824（难度）索引。我们 spiral+CY 锚点行为等价。
- **辅助函数定性**：sub_50B730=遭遇战下 house+492||+493（防御建造开关）；sub_65ADC0=遍历 house+57/+58 列表全非零（节点全放置检查）。
- **收口理由**：该函数移植前提（建造者单位）不存在；落点约束已提炼为数值参考；spiral 强化（pad 动态+建筑中心）已修实测痛点。**教训：1135 行大函数先定性"决策层 vs 执行层"再决定啃不啃——执行层逻辑依赖不存在的引擎机制时，提炼其数值约束（半径表）比硬移植更值。**

### 旧自研 AI 清理（2026-10-01 批次 11）

- **iraq/ 四文件删除**（IraqBot/Economy/Military/Util，52KB 自研竞技 bot）：唯一被移植侧引用的 `findPlacement` 迁入 `original/Util.ts`（含 pad 动态化+建筑判据两个修正）；BotFactory `Medium` 档回落 OriginalAiBot("Medium")（与 Easy_Custom/Medium_Custom/Brutal 同构）；BotsLib 去 IraqBot 导出；parity 删 4 条 iraq 条目+改 BotsLib 探针+清快照 key。
- **DummyBot 保留**：简单档"挂机陪练"是产品难度语义（非 AI 算法），Easy 与 Easy_Ori 两档继续区分。
- **AiEngine 旧自创触发路径删除**：checkTriggers 的遗留求值体（自创条件号 0/1/3+GroupWeights 数据源）与 fireTrigger——外部数据源只有原版 aimd.ini（165 触发器全 globalFlag=1），自创格式无回退需求；triggerFired/lastTriggerCheck 字段保留（探针/复位语义引用）。
- **门禁 1314 全绿**（-3=删 4 条 iraq 条目+新增 original/Util 探针）。原版探针锁 findPlacement 行为（pad=底盘、车辆中心排除、命中可放置格）。

### 持续扩张开启（2026-10-01 批次 12）

- **rulesmd [General] 扩张参数组考证**（AI 段 3098-3135 行，注释原话"the base will always try to grow"）：`RefineryRatio=.16/RefineryLimit=4`、`BarracksRatio=.16/BarracksLimit=2`、`WarRatio=.1/WarLimit=2`、`DefenseRatio=.4/DefenseLimit=40`、`AARatio/AALimit`、`TeslaRatio/TeslaLimit`、`HelipadRatio/Limit`、`PowerSurplus=50`、`BaseSizeAdd=3`。目标数=floor(基地建筑总数×ratio) clamp limit。
- **落地**：①`loadExpansionParams`（[General] 真键解析，缺省=failsafe 同值）+`expansionTargetFor`（组→槽位映射 Refinery/Barracks/War）；②clone 判定从"类型 cap 发明值（CLONE_CAPS）"改**组口径**（组候选内 owned+queued 总数 ≥ 目标），pruneSupersededEntries 的 clone 剪除同步改组口径谓词；CLONE_CAPS 降级为无 ratio 语义组（Power/Radar/Tech）的 fallback；③**BASE_GROWTH_ENABLED 开关打开**——2026-10-01 打崩实测（防御建筑 Ready 占死建造厂）的三要素已逐一被治：同格 50 次护栏（批次 5）、findPlacement pad 动态+真建筑过滤（批次 10）、tile=null 3 次放弃。
- **Allied candidates=[] 非 bug**：防御候选按"当前可生产"过滤，首帧兵营未建全不可产，diag 只打一次（首帧快照）故显示空；真实入队时每轮重算。
- parity 新增扩张探针（真键解析/目标公式/组口径 clone 双场景），1314 全绿。**教训：①"ratio of base"的分母=基地建筑总数，小基地时 floor 后目标=1 不驱动复制是原版本义；②曾因选址/护栏未就绪而关闭的功能，先对照"当时卡死清单"逐项确认已被后续修复覆盖，再开开关。**
