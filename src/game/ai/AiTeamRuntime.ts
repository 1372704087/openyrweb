/**
 * AiTeamRuntime — 原版小队招募语义移植（批次 3）。
 *
 * 依据 gamemd.exe 1.001 反编译（G:\ida-yr-work\out\ai_survey\dec\batch3_*.c）：
 * - GetTaskForceMissingMemberTypes 0x6EF4D0：按 TaskForce 行 (count,type) 减去
 *   现有成员中同类型数 → 输出缺员类型清单（精确移植）。
 * - TeamClass::FetchALeader 0x6EC3D0：在编成员中选"类型队长评分(+1532)最高"者
 *   （需存活、可指挥等资格，资格位按现存字段近似）。
 * - TeamClass::AI 0x6E9140（729 行）：招募/脚本状态机主体，本轮未整体移植；
 *   updateRecruiting 按其招募段语义重组（缺员驱动 + 可招募过滤）。
 * - CanRecruitUnit 0x6F1320：为 IDA 合并块函数（外层是 TeamType INI 读取器
 *   0x6F1090），精确过滤序列待块拆分后精确化；本轮按文档语义近似：
 *   存活、不在运输载具/寄生体内、在地图上、与队伍归属匹配、未被其他小队占用
 *   （除非 AreTeamMembersRecruitable）。
 */
/* eslint-disable @typescript-eslint/no-explicit-any */

/** TaskForce 行：{unitType, count, group?}（AiData.TaskForce.groups 元素）。 */
export interface TaskForceGroup {
  unitType: any;
  count: number;
  group?: number;
}

/** 成员最小视图：world/上层提供的单位查询结果。 */
export interface RecruitUnitView {
  id: any;
  name: any;
  /** 是否可选作队员（存活、非 limbo、在地图上）。 */
  isSelectableCombatant?: boolean;
  /** 是否在被运输/寄生（原版排除项）。 */
  isInsideTransport?: boolean;
  /** 所属小队名（已被某队占用）。 */
  teamName?: string | null;
  /** 类型队长评分（TechnoType+1532，缺省 0）。 */
  leaderRating?: number;
}

/**
 * GetTaskForceMissingMemberTypes 0x6EF4D0 移植。
 * @param groups TaskForce 编成行
 * @param existing 按类型名统计的现有队员数
 * @returns 缺员类型清单（每缺一个补一项，保持行序）
 */
export function getTaskForceMissingMemberTypes(
  groups: TaskForceGroup[],
  existing: Map<any, number>,
): TaskForceGroup[] {
  const missing: TaskForceGroup[] = [];
  if (!groups) return missing;
  for (let g = 0; g < groups.length; g++) {
    const group = groups[g];
    if (!group || !(group.count > 0)) continue;
    const have = existing.get(group.unitType) || 0;
    const need = group.count - have;
    for (let c = 0; c < need; c++) {
      missing.push({ unitType: group.unitType, count: 1, group: group.group });
    }
  }
  return missing;
}

/**
 * CanRecruitUnit 0x6F1320 近似（合并块函数，精确序列待拆分；见文件头注释）。
 */
export function canRecruitUnit(
  unit: RecruitUnitView,
  opts: { areTeamMembersRecruitable?: boolean; teamName?: string },
): boolean {
  if (!unit) return false;
  if (unit.isSelectableCombatant === false) return false;
  if (unit.isInsideTransport) return false;
  if (
    !opts.areTeamMembersRecruitable &&
    unit.teamName &&
    opts.teamName &&
    unit.teamName !== opts.teamName
  ) {
    return false;
  }
  return true;
}

/**
 * TeamClass::FetchALeader 0x6EC3D0 移植：编内选队长评分最高者。
 * 原版资格位（+144 可指挥/+108 存活/+129/+1673）以传入视图字段近似。
 */
export function fetchALeader(units: RecruitUnitView[]): RecruitUnitView | null {
  let best: RecruitUnitView | null = null;
  let bestRating = -1;
  for (let i = 0; i < units.length; i++) {
    const u = units[i];
    if (!u || u.isSelectableCombatant === false) continue;
    const rating = u.leaderRating || 0;
    if (rating > bestRating) {
      best = u;
      bestRating = rating;
    }
  }
  return best;
}

/**
 * 招募一步（TeamClass::AI 招募段重组）：算缺员 → 按类型挑可招募者 → 补员。
 * @returns 本次新招募的单位 id 列表
 */
export function recruitStep(
  groups: TaskForceGroup[],
  currentUnits: RecruitUnitView[],
  candidates: RecruitUnitView[],
  opts: { areTeamMembersRecruitable?: boolean; teamName?: string; max?: number },
): any[] {
  const existing = new Map<any, number>();
  for (const u of currentUnits) {
    existing.set(u.name, (existing.get(u.name) || 0) + 1);
  }
  const missing = getTaskForceMissingMemberTypes(groups, existing);
  if (missing.length === 0) return [];
  const taken = new Set<any>();
  const recruited: any[] = [];
  const cap = opts.max || 30;
  for (const need of missing) {
    if (currentUnits.length + recruited.length >= cap) break;
    for (const cand of candidates) {
      if (taken.has(cand.id)) continue;
      if (cand.name !== need.unitType) continue;
      if (!canRecruitUnit(cand, opts)) continue;
      taken.add(cand.id);
      recruited.push(cand.id);
      break;
    }
  }
  return recruited;
}
