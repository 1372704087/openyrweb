// === Custom AI module: game/ai/AiData ===
// 原版 AIMD.INI 数据结构定义与解析器
// 支持 TaskForce / TeamType / ScriptType / AITriggerType / BuildingType / BuildQueue
System.register("game/ai/AiData", ["game/api/index"], function (e, t) {
  "use strict";
  var GameApi, ObjectType;
  t && t.id;
  return {
    setters: [
      function (x) { GameApi = x.GameApi; ObjectType = x.ObjectType; }
    ],
    execute: function () {

      // ============================================================
      // 数据结构
      // ============================================================

      // 小队构成
      var TaskForce = function (name) {
        this.name = name;
        this.groups = []; // [{unitType, count}]
      };

      // 脚本动作
      var ScriptAction = function (action, target, argument) {
        this.action = action;   // 0=Attack, 1=Move, 2=Guard, 3=Deploy, etc.
        this.target = target;   // 0=base, 1=enemy, 2=target coord
        this.argument = argument || 0;
      };

      // 脚本
      var ScriptType = function (name) {
        this.name = name;
        this.actions = [];
      };

      // 队伍类型
      var TeamType = function (name) {
        this.name = name;
        this.taskForce = null;      // 关联的 TaskForce 名
        this.scriptType = null;     // 关联的 ScriptType 名
        this.aiTrigger = null;      // 关联的 AITriggerType 名
        this.priority = 5;          // 0-10
        this.maxExecuted = 1;       // 同时最多执行次数
        this.mindControlDecision = 0;
        this.loadable = 0;
        this.full = 0;
        this.annoyance = 0;
        this.guardSlower = 0;
        this.avoidThreat = 0;
        this.transportReturn = 0;
        this.recruiter = 1;         // 是否自动招募
        this.autoCreate = 1;        // 触发条件满足时自动创建
        this.prebuilt = 0;
        this.unknown = 0;
        this.group = -1;
      };

      // AI 触发条件
      var AITriggerType = function (name) {
        this.name = name;
        this.condition = 0;     // 0=时间, 1=单位数, 2=科技等级, 3=金钱, etc.
        this.owner = 0;         // 0=self, 1=enemy, 2=ally
        this.house = 0;
        this.comparison = 0;    // 0=less, 1=equal, 2=greater
        this.value = 1;         // 触发阈值
        this.team1 = "";        // 触发的队伍1
        this.team2 = "";        // 触发的队伍2
        this.unknown1 = 0;
        this.techLevel = -1;    // -1=any
        this.unknown2 = 0;
      };

      // 防御建筑配置
      var AIDefenseType = function (name) {
        this.name = name;
        this.building = "";
        this.adjacent = 0;  // 0=不要求相邻
        this.cover = 0;     // 0=不要求掩护
      };

      // 建造队列项
      var BuildQueueItem = function (unitType, priority) {
        this.unitType = unitType;
        this.priority = priority || 0;
      };

      // ============================================================
      // AIMD.INI 解析器
      // ============================================================

      // 解析 GroupWeight 节：返回 techLevel→{weightMax, infantry, vehicle, aircraft, naval, budget}
      var parseGroupWeights = function (aiIni) {
        var result = {};
        var sec = aiIni.getSection("GroupWeights");
        if (!sec) return result;
        for (var i = 0; i <= 10; i++) {
          var val = sec.get(i.toString());
          if (val !== undefined && val !== null) {
            var parts = String(val).split(",");
            result[i] = {
              weightMax: parseInt(parts[0]) || 0,
              infantry: parseInt(parts[1]) || 0,
              vehicle: parseInt(parts[2]) || 0,
              aircraft: parseInt(parts[3]) || 0,
              naval: parseInt(parts[4]) || 0,
              budget: parseInt(parts[5]) || 0
            };
          }
        }
        return result;
      };

      // 解析 TaskForces 节
      var parseTaskForces = function (aiIni) {
        var tasks = {};
        var sec = aiIni.getSection("TaskForces");
        if (!sec) return tasks;
        // TaskForces 节： 0=TF001, 1=TF002, ...
        for (var i = 0; ; i++) {
          var name = sec.get(i.toString());
          if (name === undefined || name === null) break;
          name = String(name).trim();
          var tfSec = aiIni.getSection(name);
          if (!tfSec) continue;
          var tf = new TaskForce(name);
          // 读取 Group1=1,E1, Group2=2,HTK, ...
          for (var g = 1; ; g++) {
            var gv = tfSec.get("Group" + g);
            if (gv === undefined || gv === null) break;
            var parts = String(gv).split(",");
            var count = parseInt(parts[0]) || 1;
            var unitType = (parts[1] || "").trim();
            if (unitType) {
              tf.groups.push({ unitType: unitType, count: count });
            }
          }
          tasks[name] = tf;
        }
        return tasks;
      };

      // 解析 ScriptTypes 节
      var parseScriptTypes = function (aiIni) {
        var scripts = {};
        var sec = aiIni.getSection("ScriptTypes");
        if (!sec) return scripts;
        for (var i = 0; ; i++) {
          var name = sec.get(i.toString());
          if (name === undefined || name === null) break;
          name = String(name).trim();
          var scSec = aiIni.getSection(name);
          if (!scSec) continue;
          var sc = new ScriptType(name);
          // 读取动作: 0=0,1, 1=5,2, 2=49,0 等
          for (var a = 0; ; a++) {
            var av = scSec.get(a.toString());
            if (av === undefined || av === null) break;
            var parts = String(av).split(",");
            var action = parseInt(parts[0]) || 0;
            var target = parseInt(parts[1]) || 0;
            var arg = parts.length > 2 ? parseInt(parts[2]) || 0 : 0;
            sc.actions.push(new ScriptAction(action, target, arg));
          }
          scripts[name] = sc;
        }
        return scripts;
      };

      // 解析 TeamTypes 节
      var parseTeamTypes = function (aiIni) {
        var teams = {};
        var sec = aiIni.getSection("TeamTypes");
        if (!sec) return teams;
        for (var i = 0; ; i++) {
          var name = sec.get(i.toString());
          if (name === undefined || name === null) break;
          name = String(name).trim();
          var tmSec = aiIni.getSection(name);
          if (!tmSec) continue;
          var tm = new TeamType(name);
          tm.taskForce = String(tmSec.get("TaskForce") || "").trim();
          tm.scriptType = String(tmSec.get("Script") || "").trim();
          tm.aiTrigger = String(tmSec.get("AITrigger") || "").trim();
          tm.priority = tmSec.getNumber("Priority", 5);
          tm.maxExecuted = tmSec.getNumber("Max", 1);
          tm.mindControlDecision = tmSec.getNumber("MindControlDecision", 0);
          tm.loadable = tmSec.getNumber("Loadable", 0);
          tm.full = tmSec.getNumber("Full", 0);
          tm.annoyance = tmSec.getNumber("Annoyance", 0);
          tm.guardSlower = tmSec.getNumber("GuardSlower", 0);
          tm.avoidThreat = tmSec.getNumber("AvoidThreat", 0);
          tm.transportReturn = tmSec.getNumber("TransportReturn", 0);
          tm.recruiter = tmSec.getNumber("Recruiter", 1);
          tm.autoCreate = tmSec.getNumber("AutoCreate", 1);
          tm.prebuilt = tmSec.getNumber("Prebuilt", 0);
          tm.group = tmSec.getNumber("Group", -1);
          teams[name] = tm;
        }
        return teams;
      };

      // 解析 AITriggerTypes 节
      var parseAITriggerTypes = function (aiIni) {
        var triggers = {};
        var sec = aiIni.getSection("AITriggerTypes");
        if (!sec) return triggers;
        for (var i = 0; ; i++) {
          var val = sec.get(i.toString());
          if (val === undefined || val === null) break;
          // 格式: condition,owner,house,comparison,value,team1,team2,unknown,techlevel,unknown2
          var parts = String(val).split(",");
          var name = parts[0] || "";
          if (!name) continue;
          var tr = new AITriggerType(name);
          tr.condition = parseInt(parts[1]) || 0;
          tr.owner = parseInt(parts[2]) || 0;
          tr.house = parseInt(parts[3]) || 0;
          tr.comparison = parseInt(parts[4]) || 0;
          tr.value = parseFloat(parts[5]) || 1;
          tr.team1 = (parts[6] || "").trim();
          tr.team2 = (parts[7] || "").trim();
          tr.unknown1 = parseInt(parts[8]) || 0;
          tr.techLevel = parseInt(parts[9]) || -1;
          tr.unknown2 = parseInt(parts[10]) || 0;
          triggers[name] = tr;
        }
        return triggers;
      };

      // 解析 AIDefenseTypes 节
      var parseAIDefenseTypes = function (aiIni) {
        var defs = {};
        var sec = aiIni.getSection("AIDefenseTypes");
        if (!sec) return defs;
        for (var i = 0; ; i++) {
          var val = sec.get(i.toString());
          if (val === undefined || val === null) break;
          var parts = String(val).split(",");
          var name = parts[0] || "";
          if (!name) continue;
          var d = new AIDefenseType(name);
          d.building = parts[1] || "";
          d.adjacent = parseInt(parts[2]) || 0;
          d.cover = parseInt(parts[3]) || 0;
          defs[name] = d;
        }
        return defs;
      };

      // 解析建造队列（BuildQueue / BuildQueueGroup）
      var parseBuildQueues = function (aiIni) {
        var queues = {};
        // 读取 BuildQueueGroup 节
        var bgSec = aiIni.getSection("BuildQueueGroup");
        if (bgSec) {
          for (var gi = 0; ; gi++) {
            var name = bgSec.get(gi.toString());
            if (name === undefined || name === null) break;
            name = String(name).trim();
            var qSec = aiIni.getSection(name);
            if (!qSec) continue;
            var items = [];
            for (var j = 0; ; j++) {
              var uv = qSec.get(j.toString());
              if (uv === undefined || uv === null) break;
              var uparts = String(uv).split(",");
              items.push(new BuildQueueItem(uparts[0].trim(), parseInt(uparts[1]) || 0));
            }
            queues[name] = items;
          }
        }
        // 读取 BuildQueue 节
        var bqSec = aiIni.getSection("BuildQueue");
        if (bqSec) {
          var defaultQueue = [];
          for (var k = 0; ; k++) {
            var bv = bqSec.get(k.toString());
            if (bv === undefined || bv === null) break;
            defaultQueue.push(String(bv).trim());
          }
          if (defaultQueue.length > 0) queues["__default__"] = defaultQueue;
        }
        return queues;
      };

      e("TaskForce", TaskForce);
      e("ScriptAction", ScriptAction);
      e("ScriptType", ScriptType);
      e("TeamType", TeamType);
      e("AITriggerType", AITriggerType);
      e("AIDefenseType", AIDefenseType);
      e("BuildQueueItem", BuildQueueItem);
      e("parseGroupWeights", parseGroupWeights);
      e("parseTaskForces", parseTaskForces);
      e("parseScriptTypes", parseScriptTypes);
      e("parseTeamTypes", parseTeamTypes);
      e("parseAITriggerTypes", parseAITriggerTypes);
      e("parseAIDefenseTypes", parseAIDefenseTypes);
      e("parseBuildQueues", parseBuildQueues);
    },
  };
});
