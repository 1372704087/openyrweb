/**
 * WaypointLines — 多单位路径/路径点连线管理器。
 *
 * 维护 unit → sourceLinePath 与 path → waypointLinePath 两张表；
 * 选择 hash 或 paths/waypoints 变化时整表重建，否则原地更新顶点并
 * 推动各 WaypointLine.update。computeInitialTargetPosition 支持
 * pathNodes / target 两种配置。
 *
 * 由 engine/renderable/entity/WaypointLines.ts.js 重写为 TS（行为完全一致）。
 * 两个文件并存期间，本文件才是修改目标：tools/repack.mjs 打包时优先
 * 采用 .ts 模块的编译产物。
 */
import { Coords } from "game/Coords"; // 已转换
import * as TargetLinesConfigModule from "game/gameobject/task/system/TargetLinesConfig"; // 孪生
import * as arrayUtil from "util/array"; // 已转换
import { WaypointLine } from "engine/renderable/entity/WaypointLine"; // 已转换

/* eslint-disable @typescript-eslint/no-explicit-any */

// 孪生 any-shim：未转换模块的具名导出不可用，取命名空间成员
const configHasTarget: (c: any) => boolean = (TargetLinesConfigModule as any).configHasTarget;

/** 顶点类型（孪生枚举 h）。 */
export enum WaypointLineVertexType {
  Source = 0,
  InitialTarget = 1,
  Waypoint = 2,
}

/** 路径顶点。 */
interface LineVertex {
  type: WaypointLineVertexType;
  enabled: boolean;
  lineHead: boolean;
  obj?: any;
  waypoint?: any;
  position: any;
}

/** 折线路径数据（传给 WaypointLine）。 */
interface LinePathData {
  vertices: LineVertex[];
  verticesNeedUpdate: boolean;
  color: number;
  bgColor: number;
  lineObj?: any;
}

/**
 * 路径连线管理器。
 * 惰性创建外层 Object3D；update 驱动全部子线。
 */
export class WaypointLines {
  /** 单位选择。 */
  unitSelection: any;
  /** 当前玩家。 */
  currentPlayer: any;
  /** 选中中的路径列表。 */
  selectedPaths: any;
  /** 全部路径。 */
  paths: any;
  /** 相机。 */
  camera: any;
  /** path → 上次 waypoints 快照。 */
  lastPathWaypoints = new Map<any, any[]>();
  /** unit → source line。 */
  sourceLinePaths = new Map<any, LinePathData>();
  /** path → waypoint line。 */
  waypointLinePaths = new Map<any, LinePathData>();
  /** 上次选择 hash。 */
  selectionHash: number | undefined;
  /** 上次 paths 快照。 */
  lastPaths: any[] | undefined;
  /** 外层 Object3D。 */
  obj: any;

  /**
   * @param unitSelection - 单位选择
   * @param currentPlayer - 当前玩家
   * @param selectedPaths - 选中路径
   * @param paths - 全部路径
   * @param camera - 相机
   */
  constructor(
    unitSelection: any,
    currentPlayer: any,
    selectedPaths: any,
    paths: any,
    camera: any,
  ) {
    this.unitSelection = unitSelection;
    this.currentPlayer = currentPlayer;
    this.selectedPaths = selectedPaths;
    this.paths = paths;
    this.camera = camera;
  }

  /** 惰性创建外层。 */
  create3DObject(): void {
    if (!this.obj) {
      this.obj = new THREE.Object3D();
      this.obj.name = "waypoint_lines";
      this.obj.matrixAutoUpdate = false;
    }
  }

  /** 外层 Object3D。 */
  get3DObject(): any {
    return this.obj;
  }

  /**
   * 检测变更并重建或原地更新全部线。
   * @param now - 当前时间戳（ms）
   */
  update(now: number): void {
    const hash = this.unitSelection.getHash();
    const selectionChanged = this.selectionHash === void 0 || this.selectionHash !== hash;
    if (selectionChanged) {
      this.selectionHash = hash;
    }

    let pathsChanged = !this.lastPaths || !arrayUtil.equals(this.lastPaths, this.paths);
    if (pathsChanged) {
      this.lastPaths = [...this.paths];
    } else {
      // 检查各 path 的 waypoints 是否变化
      for (const path of this.paths) {
        const prev = this.lastPathWaypoints.get(path);
        if (!prev || !arrayUtil.equals(path.waypoints, prev)) {
          pathsChanged = true;
          this.lastPathWaypoints.set(path, [...path.waypoints]);
          break;
        }
      }
    }

    if (selectionChanged || pathsChanged) {
      let units: any[] = [];
      let selected = this.unitSelection.getSelectedUnits();
      // 单选非己方 → 不画 source 线
      if (selected.length === 1 && selected[0].owner !== this.currentPlayer) {
        selected = [];
      }
      units = this.paths.length
        ? [...new Set([...this.paths.map((p: any) => [...p.units]).flat(), ...selected])]
        : selected;
      units = units.filter((u: any) => u.isSpawned);

      // 销毁旧线
      [...this.sourceLinePaths.values(), ...this.waypointLinePaths.values()].forEach((entry) => {
        const lineObj = entry.lineObj;
        if (lineObj) {
          this.obj.remove(lineObj.get3DObject());
          lineObj.dispose();
        }
      });
      this.sourceLinePaths.clear();
      this.waypointLinePaths.clear();

      // 为每个单位建 source 线
      for (const unit of units) {
        if (unit.isUnit()) {
          const path = this.createSourceLinePath(
            unit,
            this.paths.find((p: any) => p.units.has(unit)),
          );
          this.sourceLinePaths.set(unit, path);
          path.lineObj = new WaypointLine(path, this.camera);
          path.lineObj.create3DObject();
          this.obj.add(path.lineObj.get3DObject());
          path.lineObj.update(now);
        }
      }
      // 为每个路径建 waypoint 线
      for (const path of this.paths) {
        const data = this.createWaypointLinePath(path, this.selectedPaths.includes(path));
        this.waypointLinePaths.set(path, data);
        data.lineObj = new WaypointLine(data, this.camera);
        data.lineObj.create3DObject();
        this.obj.add(data.lineObj.get3DObject());
        data.lineObj.update(now);
      }
    } else {
      // 原地更新
      this.sourceLinePaths.forEach((entry, unit) => {
        this.updateSourceLinePath(
          entry,
          unit,
          this.paths.find((p: any) => p.units.has(unit)),
        );
        entry.lineObj.update(now);
      });
      this.waypointLinePaths.forEach((entry) => {
        this.updateWaypointLinePath(entry);
        entry.lineObj.update(now);
      });
    }
  }

  /**
   * 为单位创建 source → initialTarget(→waypoint) 路径数据。
   * @param unit - 单位
   * @param path - 所属任务路径（可无）
   */
  createSourceLinePath(unit: any, path: any): LinePathData {
    const hasTarget =
      !!unit.unitOrderTrait.targetLinesConfig &&
      configHasTarget(unit.unitOrderTrait.targetLinesConfig);
    // 找到当前应显示的 waypoint（waypointPath 模式或 draft 模式）
    const waypoint = unit.unitOrderTrait.waypointPath
      ? path?.waypoints.find(
          (w: any) =>
            w.original ===
            (unit.unitOrderTrait.currentWaypoint ?? unit.unitOrderTrait.waypointPath.waypoints[0]),
        )
      : path?.waypoints.find((w: any) => w.draft);

    const data: LinePathData = {
      vertices: [],
      verticesNeedUpdate: false,
      color: 10867711,
      bgColor: this.unitSelection.isSelected(unit) ? 16777215 : 0,
    };

    const sourceVertex: LineVertex = {
      type: WaypointLineVertexType.Source,
      enabled: hasTarget || !!waypoint,
      lineHead: true,
      obj: unit,
      position: unit.position.worldPosition.clone(),
    };
    const targetVertex: LineVertex = {
      type: WaypointLineVertexType.InitialTarget,
      enabled:
        hasTarget && (!unit.unitOrderTrait.waypointPath || !unit.unitOrderTrait.currentWaypoint),
      lineHead: true,
      obj: unit,
      position: hasTarget
        ? this.computeInitialTargetPosition(unit.unitOrderTrait.targetLinesConfig).clone()
        : new THREE.Vector3(),
    };
    data.vertices.push(sourceVertex, targetVertex);

    if (waypoint) {
      const wpVertex: LineVertex = {
        type: WaypointLineVertexType.Waypoint,
        enabled: true,
        lineHead: false,
        waypoint,
        position: waypoint.target.getWorldCoords().clone(),
      };
      data.vertices.push(wpVertex);
    }
    return data;
  }

  /**
   * 原地更新 source 路径顶点位置与 enabled。
   * @param data - 路径数据
   * @param unit - 单位
   * @param path - 所属任务路径
   */
  updateSourceLinePath(data: LinePathData, unit: any, path: any): void {
    let waypoint: any;
    if (unit.unitOrderTrait.waypointPath) {
      waypoint = path?.waypoints.find(
        (w: any) =>
          w.original ===
          (unit.unitOrderTrait.currentWaypoint ?? unit.unitOrderTrait.waypointPath.waypoints[0]),
      );
    } else {
      waypoint = path?.waypoints.find((w: any) => w.draft);
    }
    const hasWaypoint = !!waypoint;
    const hasTarget =
      !!unit.unitOrderTrait.targetLinesConfig &&
      configHasTarget(unit.unitOrderTrait.targetLinesConfig);

    for (const vertex of data.vertices) {
      let enabled: boolean | undefined;
      let worldPos: any;
      if (vertex.type === WaypointLineVertexType.Source) {
        enabled = hasWaypoint || hasTarget;
        worldPos = unit.position.worldPosition;
      } else if (vertex.type === WaypointLineVertexType.InitialTarget) {
        enabled =
          hasTarget && (!unit.unitOrderTrait.waypointPath || !unit.unitOrderTrait.currentWaypoint);
        if (hasTarget) {
          worldPos = this.computeInitialTargetPosition(
            vertex.obj.unitOrderTrait.targetLinesConfig,
          );
        }
      } else {
        enabled = hasWaypoint;
        if (waypoint) vertex.waypoint = waypoint;
        worldPos = vertex.waypoint.target.getWorldCoords();
      }
      if (worldPos && !worldPos.equals(vertex.position)) {
        data.verticesNeedUpdate = true;
        vertex.position.copy(worldPos);
      }
      if (enabled !== void 0 && enabled !== vertex.enabled) {
        data.verticesNeedUpdate = true;
        vertex.enabled = enabled;
      }
    }
  }

  /**
   * 为整条任务路径创建 waypoint 折线。
   * @param path - 路径
   * @param selected - 是否选中（白底）
   */
  createWaypointLinePath(path: any, selected: boolean): LinePathData {
    return {
      vertices: path.waypoints.map((w: any) => ({
        type: WaypointLineVertexType.Waypoint,
        enabled: true,
        lineHead: true,
        waypoint: w,
        position: w.target.getWorldCoords().clone(),
      })),
      verticesNeedUpdate: false,
      color: 10867711,
      bgColor: selected ? 16777215 : 0,
    };
  }

  /**
   * 原地更新路径点位置。
   * @param data - 路径数据
   */
  updateWaypointLinePath(data: LinePathData): void {
    for (const vertex of data.vertices) {
      const world = vertex.waypoint.target.getWorldCoords();
      if (!world.equals(vertex.position)) {
        vertex.position.copy(world);
        data.verticesNeedUpdate = true;
      }
    }
  }

  /**
   * 计算初始目标世界位置。
   * @param config - targetLinesConfig
   */
  computeInitialTargetPosition(config: any): any {
    if (config.pathNodes.length) {
      const node = config.pathNodes[0];
      return Coords.tile3dToWorld(
        node.tile.rx + 0.5,
        node.tile.ry + 0.5,
        node.tile.z + (node.onBridge?.tileElevation ?? 0),
      );
    }
    if (config.target) {
      return config.target.position.worldPosition;
    }
    throw new Error("No target and no pathNodes found");
  }

  /** 释放全部子线。 */
  dispose(): void {
    this.sourceLinePaths.forEach((entry) => entry.lineObj?.dispose());
    this.waypointLinePaths.forEach((entry) => entry.lineObj?.dispose());
  }
}
