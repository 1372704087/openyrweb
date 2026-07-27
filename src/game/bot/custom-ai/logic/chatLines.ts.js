// === Custom AI module: game/bot/custom-ai/logic/chatLines ===
// 聊天文本数据（语录/昵称/性格定义），与引擎逻辑分离便于修改
System.register("game/bot/custom-ai/logic/chatLines", [], function (e, t) {
  "use strict";
  t && t.id;
  return {
    setters: [],
    execute: function () {

      var PERSONALITY_TYPES = {
        XIAOXUESHENG: "xiaoxuesheng",
        DAXUESHENG: "daxuesheng",
        YINU: "yinu",
        FOXI: "foxi",
      };
      e("PERSONALITY_TYPES", PERSONALITY_TYPES);

      var PERSONALITY_NAMES = {
        xiaoxuesheng: "小学生",
        daxuesheng: "大学生",
        yinu: "易怒老哥",
        foxi: "佛系玩家",
      };
      e("PERSONALITY_NAMES", PERSONALITY_NAMES);

      // ============================================================
      // 各性格语录
      // ============================================================
      var LINES = {};
      LINES[PERSONALITY_TYPES.XIAOXUESHENG] = {
        greeting: [
          "兄弟们我来了！这把看我乱杀！",
          "对面准备好了吗？我要认真了！",
          "冲冲冲！我最猛！",
          "这把不赢我倒立洗头！",
          "我超强的好吧，对面等着被虐！",
        ],
        praise: [
          "66666！这波操作牛逼啊！",
          "卧槽，这都可以？大神啊！",
          "厉害厉害，我服了！",
          "哇靠，这波好秀！",
          "大哥带带我！",
          "牛逼plus！",
          "这也太强了吧呜呜呜",
        ],
        taunt: [
          "就这？就这？？",
          "菜鸡，会不会玩啊？",
          "哈哈哈你在干嘛呢？",
          "不是吧不是吧，这都能死？",
          "我奶奶玩得都比你好！",
          "太菜了太菜了，我看不下去了",
          "你是在送人头吗兄弟？",
        ],
        winning: [
          "看到没？这就是实力！",
          "无敌是多么寂寞～",
          "我还没用力你就倒下了？",
          "还有谁？？？",
          "这把稳了稳了！",
        ],
        losing: [
          "啊啊啊我不服！再来！",
          "对面开挂了吧？？",
          "我的我的，这波失误了",
          "队友呢队友呢救一下啊！",
          "呜呜呜打不过打不过",
        ],
        attack: [
          "冲啊！！碾碎他们！",
          "看我神兵天降！",
          "全部给我上！",
          "芜湖～起飞！",
        ],
        expand: [
          "嘿嘿我偷偷开个分矿",
          "发育发育，等会一波带走",
          "我的地盘我做主！",
        ],
        superWeapon: [
          "超级武器准备好啦！哈哈等着挨打吧！",
          "大招充能完毕！",
          "龟派气功波！！发射！",
        ],
        scouting: [
          "派个小弟去看看",
          "侦察兵出动！",
          "让我看看对面在干嘛",
        ],
        gg: [
          "GG！玩得开心！",
          "牛逼！这波我服了，下次再来！",
          "呜呜输了输了，不过好好玩！",
          "大佬大佬，加个好友下次一起玩！",
        ],
      };

      LINES[PERSONALITY_TYPES.DAXUESHENG] = {
        greeting: [
          "来了来了，慢慢打不着急。",
          "好久没玩了，试试手。",
          "大家加油，娱乐第一。",
          "这图我熟，看我表演。",
          "稳着来，别浪。",
        ],
        praise: [
          "这波操作拉满啊兄弟！",
          "可以可以，这意识到位了。",
          "好家伙，这都被你抓到了。",
          "6啊，这波我学到了。",
          "你这运营可以的。",
          "漂亮！这个时机抓得好。",
        ],
        taunt: [
          "这波有点绿色啊兄弟。",
          "你在玩啥呢？？",
          "不是，这也能送的吗？",
          "有点下饭了嗷。",
          "感觉你需要练练微操。",
          "你这运营稀碎啊。",
        ],
        winning: [
          "优势局，稳着推就行了。",
          "经济领先太多了，对面没得打。",
          "这把节奏在我这边。",
          "稳了稳了，别浪就行。",
        ],
        losing: [
          "这把有点难打了。",
          "经济被压了，拖一拖。",
          "问题不大，还能打。",
          "没事没事，后面找机会。",
          "我的锅，这波不该上的。",
        ],
        attack: [
          "可以打了，上吧。",
          "这波有优势，冲一波。",
          "集合推进！",
          "时机到了，进攻！",
        ],
        expand: [
          "开个分矿提升经济。",
          "运营起来，多线发展。",
          "资源要跟上。",
        ],
        superWeapon: [
          "超武就绪，对面要难受了。",
          "武器准备好了，给他们点压力。",
          "大招冷却完毕。",
        ],
        scouting: [
          "探探路，看看对面阵容。",
          "视野很重要，侦察一下。",
          "派个单位去逛逛。",
        ],
        gg: [
          "GG，打得不错！",
          "好局好局，学到了。",
          "可以，这把你配赢。",
          "精彩，下次再切磋。",
        ],
      };

      LINES[PERSONALITY_TYPES.YINU] = {
        greeting: [
          "快点开始，别墨迹。",
          "我倒要看看对面什么水平。",
          "别让我等太久。",
          "开搞开搞，别废话。",
        ],
        praise: [
          "行吧，这波算你厉害。",
          "蒙的吧你？",
          "可以，有点东西。",
          "这波是我大意了。",
        ],
        taunt: [
          "你特么在玩什么？？？",
          "菜成这样还玩个毛啊！",
          "会不会玩？不会滚！",
          "你在送人头是吧？",
          "辣鸡！就这水平？",
          "我闭着眼睛都比你强！",
          "你队友是不是想打你？",
        ],
        winning: [
          "就这？就这水平还敢来？",
          "太菜了，一点挑战都没有。",
          "能不能认真打？",
          "你在给我挠痒痒吗？",
        ],
        losing: [
          "这游戏特么有毒吧！",
          "什么鬼？？这也能输？",
          "对面是不是开挂了？",
          "我**你**的！",
          "再来一把！我不信邪！",
        ],
        attack: [
          "给我往死里打！",
          "全部压上去！弄死他们！",
          "上上上！别怂！",
          "碾碎他们！",
        ],
        expand: [
          "开个分矿，经济不能落后。",
          "发展发展，等会教他们做人。",
          "资源得跟上，不然被压。",
        ],
        superWeapon: [
          "超武好了，等着挨揍吧！",
          "哈哈哈让你们见识见识！",
          "大招好了！炸死你们！",
        ],
        scouting: [
          "去看看对面在搞什么鬼。",
          "侦察一下，别被阴了。",
          "派个炮灰去探路。",
        ],
        gg: [
          "这把我认了。",
          "算你狠，下一把！",
          "运气好而已，再来！",
          "GG，不过我不服！",
        ],
      };

      LINES[PERSONALITY_TYPES.FOXI] = {
        greeting: [
          "随缘打，开心就好。",
          "开始了，慢慢来。",
          "一切随缘。",
          "享受游戏，享受过程。",
        ],
        praise: [
          "不错不错，有缘人。",
          "随缘操作，竟然成功了。",
          "可以，这就是命。",
          "妙啊，一切都是最好的安排。",
          "打得好，我服。",
        ],
        taunt: [
          "不要着急，慢慢来。",
          "没事没事，就是个游戏。",
          "输赢不重要，开心就好。",
          "何必呢，都是缘分。",
          "淡定淡定，不急。",
        ],
        winning: [
          "赢了是缘，输了是命。",
          "优势局，随缘推。",
          "一切都在计划之中。",
          "随缘打打就赢了。",
        ],
        losing: [
          "打不过就发育，发育不了就随缘。",
          "输赢乃兵家常事。",
          "没事，这局随缘了。",
          "人生有起有落，游戏也是。",
          "尽力就好，结果不重要。",
        ],
        attack: [
          "可以打打了。",
          "随缘进攻。",
          "时机差不多了。",
          "上吧，随缘。",
        ],
        expand: [
          "开个分矿，随缘发展。",
          "多一个矿多一份快乐。",
          "资源多了心不慌。",
        ],
        superWeapon: [
          "超武好了，一切随缘。",
          "武器准备好了，该来的总会来。",
          "随缘发射。",
        ],
        scouting: [
          "出去走走，看看世界。",
          "探探路，随缘碰运气。",
          "看看对面缘分如何。",
        ],
        gg: [
          "GG，好局好局。",
          "缘起缘灭，下次再战。",
          "打得好，学到了学到了。",
          "随缘随缘，下次再来。",
        ],
      };
      e("LINES", LINES);

      // ============================================================
      // 昵称池
      // ============================================================
      var NICKNAMES = {};
      NICKNAMES[PERSONALITY_TYPES.XIAOXUESHENG] = [
        "电竞小学生", "坑货少年", "王者之弟", "暴走萝莉", "我超勇的",
        "无敌小霸王", "中二病晚期", "闪现送头", "补刀靠缘分", "野区逛该",
      ];
      NICKNAMES[PERSONALITY_TYPES.DAXUESHENG] = [
        "夜班程序员", "考研落榜生", "宿舍熄灯了", "挂科专业户", "论文写完了吗",
        "通宵选手", "食堂干饭王", "选修课睡觉", "实验报告没写", "期末突击队",
      ];
      NICKNAMES[PERSONALITY_TYPES.YINU] = [
        "狂暴老哥", "祖安文科状元", "键盘战神", "心态爆炸", "这游戏真难",
        "血压已拉满", "毁灭吧赶紧的", "老子不玩了", "砸键盘选手", "红温警告",
      ];
      NICKNAMES[PERSONALITY_TYPES.FOXI] = [
        "随缘玩家", "养生达人", "枸杞泡茶", "看淡一切", "佛系青年",
        "莫生气", "一切随缘", "得之我幸", "慈悲为怀", "局局随缘",
      ];
      e("NICKNAMES", NICKNAMES);

      // ============================================================
      // 随机分配函数
      // ============================================================
      var usedNicknames = {};

      var randomPersonality = function (gameApi) {
        var keys = Object.keys(PERSONALITY_TYPES).map(function (k) { return PERSONALITY_TYPES[k]; });
        var idx = gameApi ? gameApi.generateRandomInt(0, keys.length - 1) : Math.floor(Math.random() * keys.length);
        return keys[idx];
      };
      e("randomPersonality", randomPersonality);

      var randomNickname = function (personalityType, gameApi) {
        var pool = NICKNAMES[personalityType] || NICKNAMES[PERSONALITY_TYPES.XIAOXUESHENG];
        var available = pool.filter(function (n) { return !usedNicknames[n]; });
        if (available.length === 0) {
          var idx = gameApi ? gameApi.generateRandomInt(0, pool.length - 1) : Math.floor(Math.random() * pool.length);
          return pool[idx] + "_" + (Math.floor(Math.random() * 999) + 1);
        }
        var idx = gameApi ? gameApi.generateRandomInt(0, available.length - 1) : Math.floor(Math.random() * available.length);
        var name = available[idx];
        usedNicknames[name] = true;
        return name;
      };
      e("randomNickname", randomNickname);
    },
  };
});
