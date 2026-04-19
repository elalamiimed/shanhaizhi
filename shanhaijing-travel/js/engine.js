/**
 * ============================================================================
 * 《山海经——人生旅行相册》核心引擎模块
 * ============================================================================
 * @module engine
 * @description 游戏核心引擎，负责存档、路由、地图、打卡、卡牌、成就、
 *              排行榜、音效、新手引导、通知等所有核心系统的协调与运行。
 * @requires window.GameData - 数据层模块，提供城市、神兽、成就等静态数据
 * @exposes window.GameEngine - 全局引擎入口
 * ============================================================================
 */

(function () {
  'use strict';

  // ==================== 常量与配置 ====================

  /** 存档在 localStorage 中的键名 */
  var SAVE_KEY = 'shanhai_travel_save';

  /** 自动保存间隔（毫秒） */
  var AUTO_SAVE_INTERVAL = 30000;

  /** 页面列表 */
  var PAGES = ['splash', 'map', 'camera', 'collection', 'profile'];

  /** 打卡照片类型 */
  var PHOTO_TYPES = ['ticket', 'food', 'scenery'];

  /** 打卡照片中文名称映射 */
  var PHOTO_TYPE_LABELS = {
    ticket: '车票/机票',
    food: '当地美食',
    scenery: '风景照'
  };

  /** 五声音阶频率（宫商角徵羽） */
  var PENTATONIC = {
    C4: 261.63, D4: 293.66, E4: 329.63, G4: 392.00, A4: 440.00,
    C5: 523.25, D5: 587.33, E5: 659.25, G5: 783.99, A5: 880.00
  };

  /**
   * 区域传统色映射
   * 【Bug #4 修复】使用 region ID 作为键名，而非中文名
   * data.js 中 region 字段是 ID（如 'dongshan'），不是中文名
   */
  var REGION_COLORS = {
    'dongshan': '#C94043',   // 朱砂红 - 东山经
    'xishan': '#B8860B',     // 敦煌黄 - 西山经
    'nanshan': '#2E8B57',    // 青碧 - 南山经
    'beishan': '#DAA520',    // 琥珀金 - 北山经
    'zhongshan': '#6B8E23',  // 苍翠 - 中山经
    'dahuang': '#FF6347'     // 丹霞橙 - 大荒经
  };

  /**
   * 神兽 emoji 映射表
   * 【Bug #2 修复】data.js 没有 beast.emoji 字段，需在引擎中建立映射
   */
  var BEAST_EMOJI_MAP = {
    'chenghuang': '<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/></svg>',      // 🦌 乘黄
    'jiuweihu': '<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/></svg>',        // 🦊 九尾狐
    'bifang': '<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/></svg>',          // 🐦 毕方
    'shitishou': '<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/></svg>',       // 🐼 食铁兽
    'fuzhu': '<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/></svg>',           // 🦌 夫诸（白鹿）
    'xiangliu': '<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/></svg>',        // 🐍 相柳
    'binglong': '<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/></svg>',        // 🐉 冰龙
    'zhulong': '<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/></svg>',         // 🏮 烛龙
    'bize': '<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/></svg>',            // 🦁 白泽
    'haishenyuxiao': '<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/></svg>',   // 🦅 海神禺猇
    'gudiao': '<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/></svg>',          // 🦅 蛊雕
    'dijiang': '<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/></svg>',         // 🌀 帝江
    'luwu': '<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/></svg>',            // 🐯 陆吾
    'xwangmu': '<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/></svg>',         // 👸 西王母
    'kuafu': '<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/></svg>',           // 🏃 夸父
    'shitiashou': '<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/></svg>'       // 🐼 食铁兽（成都）
  };

  /**
   * 神兽引文映射表
   * 【Bug #5 修复】使用神兽 ID 作为键名，匹配 data.js 中的神兽数据
   */
  var beastQuotes = {
    'chenghuang': [
      '有乘黄，其状如狐，其背上有角，乘之寿二千岁。——《海外西经》',
      '乘黄居于中原深山，非有大德之人不可见。'
    ],
    'jiuweihu': [
      '青丘之山，有兽焉，其状如狐而九尾，其音如婴儿。——《南山经》',
      '九尾狐出，天下太平，子孙繁昌。'
    ],
    'bifang': [
      '有鸟焉，其状如鹤，一足，赤文青质而白喙，名曰毕方。——《西山经》',
      '毕方鸣，天下火。毕方乃火之精灵。'
    ],
    'shitishou': [
      '有兽焉，其状如熊而黑白文，名曰食铁兽。——《中山经》',
      '食铁兽乃蜀地最深处的守护者，力大无穷。'
    ],
    'fuzhu': [
      '有兽焉，其状如白鹿而四角，名曰夫诸，见则其邑大水。——《中次三经》',
      '夫诸通体雪白如玉，四角晶莹剔透，行于水面如履平地。'
    ],
    'xiangliu': [
      '共工之臣曰相柳氏，九首，以食于九山。——《海外北经》',
      '相柳乃上古凶兽，蛇身九首，每首皆有人面。'
    ],
    'binglong': [
      '北荒极寒之地，有冰龙蛰伏，鳞甲如冰晶，吐息成霜雪。——北荒传说',
      '冰龙通体透明如水晶，每百年苏醒一次。'
    ],
    'zhulong': [
      '其瞑乃晦，其视乃明，不食不寝不息，风雨是谒。是烛九阴。——《大荒北经》',
      '烛龙居于西北极远之地的章尾山，呼吸便是四季更替。'
    ],
    'bize': [
      '帝巡狩，至海滨，得白泽神兽。能言，达于万物之情。——《轩辕本纪》',
      '白泽乃万兽之灵，通晓天地间一切精怪鬼魅。'
    ],
    'haishenyuxiao': [
      '北海之渚中，有神，人面鸟身，珥两青蛇，践两赤蛇，名曰禺猇。——《大荒北经》',
      '禺猇乃北海之主，统御四海潮汐。'
    ],
    'gudiao': [
      '水有兽焉，其状如雕而有角，其音如婴儿之音，是食人。——《南次三经》',
      '蛊雕栖于东南沿海的礁石之上，平日蛰伏不动，形如石雕。'
    ],
    'dijiang': [
      '其状如黄囊，赤如丹火，六足四翼，浑敦无面目，是识歌舞，实惟帝江也。——《西山经》',
      '帝江乃混沌之神，其形浑圆如囊，无眼无鼻无口无耳。'
    ],
    'luwu': [
      '昆仑之丘，是实惟帝之下都。神陆吾司之，其神状虎身而九尾，人面而虎爪。——《西山经》',
      '陆吾乃昆仑山之主神，虎身九尾，人面虎爪，威严无比。'
    ],
    'xwangmu': [
      '西王母其状如人，豹尾虎齿而善啸，蓬发戴胜，是司天之厉及五残。——《西山经》',
      '西王母是山海经中最尊贵的女神，居于昆仑之西的玉山之上。'
    ],
    'kuafu': [
      '夸父与日逐走，入日。渴，欲得饮，饮于河、渭，河、渭不足。——《海外北经》',
      '夸父乃北方大荒中的巨人族首领，身长千丈，力能拔山。'
    ],
    'shitiashou': [
      '有兽焉，其状如熊而黑白文，名曰食铁兽。——《中山经》',
      '食铁兽乃蜀地守护者，齿可噬金石，爪可裂山岳。'
    ]
  };

  /** 默认引文（当找不到特定神兽引文时使用） */
  var defaultQuotes = [
    '《山海经》有云：天地混沌，万物有灵。',
    '《山海经》有云：山川之灵，各有所属。',
    '《山海经》有云：上古神兽，镇守四方。',
    '《山海经》有云：行万里路，知天下事。'
  ];

  /** 新手引导步骤定义 */
  var TUTORIAL_STEPS = [
    { id: 'welcome',    title: '欢迎来到山海经世界',   target: null },
    { id: 'map_intro',  title: '探索华夏地图',         target: '#map-container' },
    { id: 'colorize',   title: '见证地图变色',         target: '#map-container' },
    { id: 'card_show',  title: '收集神兽卡牌',         target: '#card-collection' }
  ];

  // ==================== 工具函数（内部） ====================

  /**
   * 生成唯一ID
   * @returns {string}
   */
  function _uid() {
    return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
  }

  /**
   * 深拷贝对象
   * @param {*} obj
   * @returns {*}
   */
  function _deepClone(obj) {
    if (obj === null || typeof obj !== 'object') return obj;
    try {
      return JSON.parse(JSON.stringify(obj));
    } catch (e) {
      return obj;
    }
  }

  /**
   * 安全获取 GameData 中的数据
   * @param {string} path - 点分隔路径，如 'cities'
   * @returns {*}
   */
  function _getData(path) {
    if (!window.GameData) {
      console.warn('[GameEngine] GameData 尚未加载');
      return null;
    }
    var parts = path.split('.');
    var result = window.GameData;
    for (var i = 0; i < parts.length; i++) {
      if (result == null) return null;
      result = result[parts[i]];
    }
    return result;
  }

  // ==================== 1. 存档系统 (SaveSystem) ====================

  /**
   * @namespace SaveSystem
   * @description 管理玩家数据的持久化存储，使用 localStorage 实现。
   */
  var SaveSystem = {
    /** @type {number|null} 自动保存定时器ID */
    _autoSaveTimer: null,

    /**
     * 获取默认的初始存档数据结构
     * @returns {Object} 默认存档
     */
    _getDefaultSave: function () {
      return {
        version: '1.0.0',
        playerName: '旅行者',
        avatar: '',
        level: 1,
        exp: 0,
        /** @type {Object.<string, {unlocked:boolean, checkIn:{ticket:string,food:string,scenery:string}, completedAt:string|null}>} */
        cities: {},
        /** @type {string[]} 已获得的卡牌ID列表 */
        cards: [],
        /** @type {Object.<string, {unlocked:boolean, unlockedAt:string|null}>} */
        achievements: {},
        /** @type {number} 总旅行距离（公里） */
        totalDistance: 0,
        /** @type {number} 总打卡城市数 */
        totalCheckIns: 0,
        /** @type {string|null} 上次保存时间 */
        lastSaveTime: null,
        /** @type {Object} 设置 */
        settings: {
          musicVolume: 0.5,
          sfxVolume: 0.7,
          muted: false,
          bgmEnabled: true
        },
        /** @type {boolean} 新手引导是否完成 */
        tutorialComplete: false,
        /** @type {number} 新手引导当前步骤 */
        tutorialStep: 0,
        /** @type {Object.<string, string>} 城市解锁时间记录 */
        unlockTimes: {},
        /** @type {string|null} 上一次打卡的城市ID（用于距离计算） */
        lastCheckInCityId: null
      };
    },

    /**
     * 保存当前游戏状态到 localStorage
     * @returns {boolean} 是否保存成功
     */
    save: function () {
      try {
        var saveData = _deepClone(GameEngine._state);
        saveData.lastSaveTime = new Date().toISOString();
        localStorage.setItem(SAVE_KEY, JSON.stringify(saveData));
        console.log('[SaveSystem] 存档保存成功', saveData.lastSaveTime);
        return true;
      } catch (e) {
        console.error('[SaveSystem] 存档保存失败:', e);
        return false;
      }
    },

    /**
     * 将任意存档对象规范化为当前版本可用结构
     * @param {Object} saveData
     * @returns {Object}
     */
    _hydrateSave: function (saveData) {
      var defaults = this._getDefaultSave();
      var hydrated = _deepClone(defaults);
      var source = saveData && typeof saveData === 'object' ? saveData : {};

      for (var key in source) {
        if (source[key] !== undefined) {
          hydrated[key] = source[key];
        }
      }

      hydrated.settings = hydrated.settings && typeof hydrated.settings === 'object'
        ? hydrated.settings
        : {};
      for (var settingKey in defaults.settings) {
        if (hydrated.settings[settingKey] === undefined) {
          hydrated.settings[settingKey] = defaults.settings[settingKey];
        }
      }

      if (!Array.isArray(hydrated.cards)) hydrated.cards = [];
      if (!hydrated.cities || typeof hydrated.cities !== 'object') hydrated.cities = {};

      if (!hydrated.achievements || typeof hydrated.achievements !== 'object') hydrated.achievements = {};
      if (!hydrated.unlockTimes || typeof hydrated.unlockTimes !== 'object') hydrated.unlockTimes = {};
      if (typeof hydrated.playerName !== 'string' || !hydrated.playerName.trim()) {
        hydrated.playerName = defaults.playerName;
      } else {
        hydrated.playerName = hydrated.playerName.trim().slice(0, 20);
      }
      if (typeof hydrated.exp !== 'number' || hydrated.exp < 0) hydrated.exp = defaults.exp;
      if (typeof hydrated.level !== 'number' || hydrated.level < 1) hydrated.level = defaults.level;
      if (typeof hydrated.totalDistance !== 'number' || hydrated.totalDistance < 0) hydrated.totalDistance = defaults.totalDistance;
      if (typeof hydrated.totalCheckIns !== 'number' || hydrated.totalCheckIns < 0) hydrated.totalCheckIns = defaults.totalCheckIns;

      // 追溯经验和等级：如果现有经验不符合打卡数和卡牌数，进行修正
      var checkInExp = window.GameData && window.GameData.expSources ? window.GameData.expSources.checkIn.exp : 100;
      var cardCollectExp = window.GameData && window.GameData.expSources ? window.GameData.expSources.cardCollect.exp : 100;
      var expectedExp = (hydrated.totalCheckIns * checkInExp) + (hydrated.cards.length * cardCollectExp);
      
      if (hydrated.exp < expectedExp) {
        hydrated.exp = expectedExp;
      }
      
      // 根据经验重新计算正确的等级
      if (window.GameData && window.GameData.utils) {
        var levelInfo = window.GameData.utils.calcLevel(hydrated.exp);
        hydrated.level = levelInfo.level;
      }

      return hydrated;
    },

    /**
     * 从 localStorage 加载存档，若无存档则初始化默认数据
     * @returns {Object} 当前存档数据
     */
    load: function () {
      try {
        var raw = localStorage.getItem(SAVE_KEY);
        if (raw) {
          var saveData = this._hydrateSave(JSON.parse(raw));
          console.log('[SaveSystem] 存档加载成功');
          return saveData;
        }
      } catch (e) {
        console.error('[SaveSystem] 存档加载失败:', e);
      }
      // 无存档或加载失败，初始化默认数据
      console.log('[SaveSystem] 初始化新存档');
      return this._getDefaultSave();
    },

    /**
     * 导出当前存档为 JSON 文本
     * @returns {string}
     */
    exportSave: function () {
      var saveData = _deepClone(GameEngine._state || this._getDefaultSave());
      saveData.lastSaveTime = new Date().toISOString();
      return JSON.stringify(saveData, null, 2);
    },

    /**
     * 从 JSON 文本导入存档
     * @param {string} raw
     * @returns {Object}
     */
    importSave: function (raw) {
      if (typeof raw !== 'string' || !raw.trim()) {
        throw new Error('存档内容为空');
      }

      var parsed = JSON.parse(raw);
      var saveData = this._hydrateSave(parsed);
      GameEngine._state = saveData;
      this.save();
      console.log('[SaveSystem] 存档导入成功');
      return saveData;
    },

    /**
     * 重置存档，清除所有玩家数据
     * 【Bug #9 修复】重置后先设 _initialized = false，确保 init 可重新执行
     */
    reset: function () {
      try {
        localStorage.removeItem(SAVE_KEY);
        GameEngine._state = this._getDefaultSave();
        // 【Bug #9】重置后标记为未初始化，以便重新 init
        GameEngine._initialized = false;
        console.log('[SaveSystem] 存档已重置');
      } catch (e) {
        console.error('[SaveSystem] 存档重置失败:', e);
      }
    },

    /**
     * 启动自动保存（每30秒保存一次）
     */
    autoSave: function () {
      if (this._autoSaveTimer) {
        clearInterval(this._autoSaveTimer);
      }
      this._autoSaveTimer = setInterval(function () {
        SaveSystem.save();
      }, AUTO_SAVE_INTERVAL);
      console.log('[SaveSystem] 自动保存已启动，间隔 ' + (AUTO_SAVE_INTERVAL / 1000) + ' 秒');
    },

    /**
     * 停止自动保存
     */
    stopAutoSave: function () {
      if (this._autoSaveTimer) {
        clearInterval(this._autoSaveTimer);
        this._autoSaveTimer = null;
        console.log('[SaveSystem] 自动保存已停止');
      }
    }
  };

  // ==================== 2. 页面路由系统 (Router) ====================

  /**
   * @namespace Router
   * @description 管理游戏页面之间的切换与导航，支持过渡动画和生命周期钩子。
   */
  var Router = {
    /** @type {string} 当前页面名称 */
    _currentPage: 'splash',

    /** @type {boolean} 是否正在切换页面（防止重复触发） */
    _transitioning: false,

    /** @type {Object.<string, Function>} 页面生命周期回调注册表 */
    _pageCallbacks: {},

    /**
     * 注册页面的生命周期回调
     * @param {string} pageName - 页面名称
     * @param {Object} callbacks - { onEnter?: Function, onLeave?: Function }
     */
    registerPage: function (pageName, callbacks) {
      if (!this._pageCallbacks[pageName]) {
        this._pageCallbacks[pageName] = {};
      }
      if (callbacks.onEnter) {
        this._pageCallbacks[pageName].onEnter = callbacks.onEnter;
      }
      if (callbacks.onLeave) {
        this._pageCallbacks[pageName].onLeave = callbacks.onLeave;
      }
    },

    /**
     * 导航到指定页面，带过渡动画
     * 【Bug #10 修复】targetPageEl 为 null 时提前 return
     * @param {string} pageName - 目标页面名称（splash/map/camera/collection/profile）
     * @param {Object} [params] - 传递给目标页面的参数
     */
    navigateTo: function (pageName, params) {
      if (this._transitioning) return;
      if (pageName === this._currentPage) return;
      if (PAGES.indexOf(pageName) === -1) {
        console.warn('[Router] 未知页面:', pageName);
        return;
      }

      this._transitioning = true;
      var self = this;
      var prevPage = this._currentPage;

      // 触发离开回调
      if (this._pageCallbacks[prevPage] && this._pageCallbacks[prevPage].onLeave) {
        this._pageCallbacks[prevPage].onLeave();
      }

      // DOM 过渡动画
      var currentPageEl = document.querySelector('.page.active');
      var targetPageEl = document.getElementById('page-' + pageName);

      // 【Bug #10】目标页面元素不存在时提前返回
      if (!targetPageEl) {
        console.warn('[Router] 目标页面元素不存在: page-' + pageName);
        this._transitioning = false;
        return;
      }

      if (currentPageEl) {
        currentPageEl.classList.add('page-exit');
        currentPageEl.classList.remove('page-enter');
      }

      targetPageEl.classList.add('page-enter');
      targetPageEl.classList.remove('page-exit');

      // 同步更新当前页面状态（不等setTimeout）
      self._currentPage = pageName;
      self._transitioning = false; // 同步解锁，允许连续导航

      // 等待过渡动画完成
      setTimeout(function () {
        if (currentPageEl) {
          currentPageEl.classList.remove('active', 'page-exit');
        }
        if (targetPageEl) {
          targetPageEl.classList.add('active');
          targetPageEl.classList.remove('page-enter');
        }

        self._transitioning = false;

        // 触发进入回调
        if (self._pageCallbacks[pageName] && self._pageCallbacks[pageName].onEnter) {
          self._pageCallbacks[pageName].onEnter(params);
        }

        console.log('[Router] 页面切换:', prevPage, '->', pageName);
      }, 400); // 过渡动画时长 400ms
    },

    /**
     * 获取当前页面名称
     * @returns {string}
     */
    getCurrentPage: function () {
      return this._currentPage;
    },

    /**
     * 初始化路由系统，根据当前状态决定显示哪个页面
     */
    init: function () {
      this._transitioning = false; // 重置过渡状态
      var state = GameEngine._state;
      // 【Bug #6】null 安全检查
      if (!state) {
        console.warn('[Router] 引擎状态为空，跳过路由初始化');
        return;
      }
      // 如果新手引导未完成，从欢迎页开始
      if (!state.tutorialComplete) {
        this._currentPage = 'splash';
      } else {
        this._currentPage = 'map';
      }

      // 重置所有页面显示状态，避免 reset/init 后多个页面同时保持 active
      var allPages = document.querySelectorAll('.page');
      allPages.forEach(function (pageEl) {
        pageEl.classList.remove('active', 'page-enter', 'page-exit');
      });

      // 激活初始页面
      var initPageEl = document.getElementById('page-' + this._currentPage);
      if (initPageEl) {
        initPageEl.classList.add('active');
      }

      console.log('[Router] 路由初始化完成，当前页面:', this._currentPage);
    }
  };

  // ==================== 3. 地图系统 (MapSystem) ====================

  /**
   * @namespace MapSystem
   * @description 管理地图的渲染、城市标记、缩放平移以及区域进度展示。
   */
  var MapSystem = {
    /** @type {HTMLElement} 地图容器元素 */
    _mapContainer: null,

    /** @type {HTMLElement} 地图画布/内容元素（用于缩放平移） */
    _mapContent: null,

    /** @type {number} 当前缩放级别 */
    _zoomLevel: 1,

    /** @type {number} 最小缩放 */
    _minZoom: 0.5,

    /** @type {number} 最大缩放 */
    _maxZoom: 3,

    /** @type {number} 缩放步进 */
    _zoomStep: 0.2,

    /** @type {Object} 平移偏移量 {x, y} */
    _panOffset: { x: 0, y: 0 },

    /** @type {boolean} 是否正在拖拽 */
    _isDragging: false,

    /** @type {Object} 拖拽起始位置 */
    _dragStart: { x: 0, y: 0 },

    /** @type {Object} 拖拽起始偏移 */
    _dragStartOffset: { x: 0, y: 0 },

    /** @type {string|null} 当前筛选区域 */
    _currentFilter: null,

    /**
     * 初始化地图系统
     */
    initMap: function () {
      this._mapContainer = document.getElementById('map-container');
      this._mapContent = document.getElementById('map-content');

      if (!this._mapContainer || !this._mapContent) {
        console.warn('[MapSystem] 地图容器元素未找到');
        return;
      }

      this._bindDragEvents();
      this.renderCities();
      console.log('[MapSystem] 地图初始化完成');
    },

    /**
     * 绑定拖拽事件（支持 touch 和 mouse）
     */
    _bindDragEvents: function () {
      var self = this;
      var container = this._mapContainer;

      // --- 鼠标事件 ---
      container.addEventListener('mousedown', function (e) {
        self._isDragging = true;
        self._dragStart = { x: e.clientX, y: e.clientY };
        self._dragStartOffset = _deepClone(self._panOffset);
        container.style.cursor = 'grabbing';
      });

      document.addEventListener('mousemove', function (e) {
        if (!self._isDragging) return;
        var dx = e.clientX - self._dragStart.x;
        var dy = e.clientY - self._dragStart.y;
        self._panOffset.x = self._dragStartOffset.x + dx;
        self._panOffset.y = self._dragStartOffset.y + dy;
        self._applyTransform();
      });

      document.addEventListener('mouseup', function () {
        if (self._isDragging) {
          self._isDragging = false;
          container.style.cursor = 'grab';
        }
      });

      // --- 触摸事件 ---
      container.addEventListener('touchstart', function (e) {
        if (e.touches.length === 1) {
          self._isDragging = true;
          self._dragStart = { x: e.touches[0].clientX, y: e.touches[0].clientY };
          self._dragStartOffset = _deepClone(self._panOffset);
        }
      }, { passive: true });

      container.addEventListener('touchmove', function (e) {
        if (!self._isDragging || e.touches.length !== 1) return;
        var dx = e.touches[0].clientX - self._dragStart.x;
        var dy = e.touches[0].clientY - self._dragStart.y;
        self._panOffset.x = self._dragStartOffset.x + dx;
        self._panOffset.y = self._dragStartOffset.y + dy;
        self._applyTransform();
      }, { passive: true });

      container.addEventListener('touchend', function () {
        self._isDragging = false;
      });

      // --- 滚轮缩放 ---
      container.addEventListener('wheel', function (e) {
        e.preventDefault();
        if (e.deltaY < 0) {
          self.zoomIn();
        } else {
          self.zoomOut();
        }
      }, { passive: false });

      container.style.cursor = 'grab';
    },

    /**
     * 应用缩放和平移变换到地图内容元素
     */
    _applyTransform: function () {
      if (this._mapContent) {
        this._mapContent.style.transform =
          'translate(' + this._panOffset.x + 'px, ' + this._panOffset.y + 'px) scale(' + this._zoomLevel + ')';
      }
    },

    /**
     * 墨卡托投影：将真实经纬度转换为 SVG viewBox 百分比坐标
     * SVG viewBox: 0 0 1000 738，中国经度范围约 73-135，纬度范围约 18-54
     * @param {number} lng - 经度
     * @param {number} lat - 纬度
     * @returns {{x: number, y: number}} 百分比坐标 (0-100)
     */
    mercatorProject: function (lng, lat) {
      // 经度线性映射
      var x = ((lng - 73) / (135 - 73)) * 100;
      // 纬度使用墨卡托投影公式
      var latRad = lat * Math.PI / 180;
      var mercN = Math.log(Math.tan(Math.PI / 4 + latRad / 2));
      var yMin = Math.log(Math.tan(Math.PI / 4 + 18 * Math.PI / 360));
      var yMax = Math.log(Math.tan(Math.PI / 4 + 54 * Math.PI / 360));
      var y = (1 - (mercN - yMin) / (yMax - yMin)) * 100;
      return { x: x, y: y };
    },

    /**
     * 渲染城市标记到地图上
     * @param {string} [filter] - 区域筛选条件，为空则显示全部
     */
    renderCities: function (filter) {
      // 【Bug #6】null 安全检查
      if (!GameEngine._state) return;

      this._currentFilter = filter || null;
      // 城市标记的DOM渲染由 GameUI._renderCityMarkers() 负责
      // 这里只更新筛选状态
      console.log('[MapSystem] 城市筛选:', this._currentFilter || '全部');
    },

    /**
     * 解锁城市，触发变色动画
     * @param {string} cityId - 城市ID
     */
    unlockCity: function (cityId) {
      // 【Bug #6】null 安全检查
      if (!GameEngine._state) return;

      var state = GameEngine._state;
      if (!state.cities[cityId]) {
        state.cities[cityId] = {
          unlocked: false,
          checkIn: { ticket: '', food: '', scenery: '' },
          completedAt: null
        };
      }
      state.cities[cityId].unlocked = true;
      state.unlockTimes[cityId] = new Date().toISOString();

      // 触发变色动画
      var marker = document.querySelector('.city-marker[data-city="' + cityId + '"]');
      if (marker) {
        marker.classList.remove('locked');
        marker.classList.add('unlocking');

        // 动画完成后切换为已解锁样式
        setTimeout(function () {
          marker.classList.remove('unlocking');
          marker.classList.add('unlocked');
        }, 1200);
      }

      console.log('[MapSystem] 城市已解锁:', cityId);
    },

    /**
     * 获取城市状态
     * @param {string} cityId - 城市ID
     * @returns {Object|null} 城市状态数据
     */
    getCityStatus: function (cityId) {
      // 【Bug #6】null 安全检查
      if (!GameEngine._state) return null;
      return GameEngine._state.cities[cityId] || null;
    },

    /**
     * 获取区域进度
     * @param {string} region - 区域ID
     * @returns {{total:number, unlocked:number, percentage:number}}
     */
    getRegionProgress: function (region) {
      // 【Bug #6】null 安全检查
      if (!GameEngine._state) return { total: 0, unlocked: 0, percentage: 0 };

      var cities = _getData('cities');
      if (!cities) return { total: 0, unlocked: 0, percentage: 0 };

      var regionCities = cities.filter(function (c) { return c.region === region; });
      var state = GameEngine._state;
      var unlockedCount = regionCities.filter(function (c) {
        return state.cities[c.id] && state.cities[c.id].unlocked;
      }).length;

      return {
        total: regionCities.length,
        unlocked: unlockedCount,
        percentage: regionCities.length > 0
          ? Math.round((unlockedCount / regionCities.length) * 100)
          : 0
      };
    },

    /**
     * 放大地图
     */
    zoomIn: function () {
      if (this._zoomLevel < this._maxZoom) {
        this._zoomLevel = Math.min(this._zoomLevel + this._zoomStep, this._maxZoom);
        this._applyTransform();
      }
    },

    /**
     * 缩小地图
     */
    zoomOut: function () {
      if (this._zoomLevel > this._minZoom) {
        this._zoomLevel = Math.max(this._zoomLevel - this._zoomStep, this._minZoom);
        this._applyTransform();
      }
    }
  };

  // ==================== 4. 打卡系统 (CheckInSystem) ====================

  /**
   * @namespace CheckInSystem
   * @description 管理旅行打卡流程，包括照片上传、处理、验证和提交。
   */
  var CheckInSystem = {
    /** @type {string|null} 当前正在打卡的城市ID */
    _currentCityId: null,

    /** @type {Object.<string, string>} 临时存储待提交的照片 {type: base64} */
    _pendingPhotos: {},

    /** @type {HTMLInputElement|null} 隐藏的文件输入元素 */
    _fileInput: null,

    /**
     * 【Bug #7 修复】当前照片类型保存在实例变量中，避免闭包捕获问题
     * @type {string|null}
     */
    _currentPhotoType: null,

    /**
     * 开始打卡流程
     * @param {string} cityId - 城市ID
     */
    startCheckIn: function (cityId) {
      this._currentCityId = cityId;
      this._pendingPhotos = {};
      GameEngine.Router.navigateTo('camera', { cityId: cityId });
      console.log('[CheckInSystem] 开始打卡:', cityId);
    },

    /**
     * 调用文件选择器上传照片
     * 【Bug #7 修复】type 通过实例变量 this._currentPhotoType 传递，
     *               而非闭包捕获，避免第二次上传类型错误
     * @param {string} type - 照片类型 'ticket'|'food'|'scenery'
     */
    uploadPhoto: function (type) {
      if (PHOTO_TYPES.indexOf(type) === -1) {
        console.warn('[CheckInSystem] 未知照片类型:', type);
        return;
      }

      // 【Bug #7】保存到实例变量，避免闭包捕获
      this._currentPhotoType = type;

      // 创建或复用文件输入元素
      if (!this._fileInput) {
        this._fileInput = document.createElement('input');
        this._fileInput.type = 'file';
        this._fileInput.accept = 'image/*';
        this._fileInput.style.display = 'none';
        (document.getElementById('app') || document.body).appendChild(this._fileInput);

        var self = this;
        this._fileInput.addEventListener('change', function (e) {
          if (e.target.files && e.target.files[0]) {
            // 【Bug #7】使用实例变量 self._currentPhotoType 获取类型
            self.processPhoto(e.target.files[0], self._currentPhotoType);
          }
          // 重置 input 以便同一类型可再次选择
          e.target.value = '';
        });
      }

      this._fileInput.click();
    },

    /**
     * 处理上传的照片，生成缩略图 base64
     * @param {File} file - 原始文件
     * @param {string} type - 照片类型
     */
    processPhoto: function (file, type) {
      var self = this;
      var reader = new FileReader();

      reader.onload = function (e) {
        var img = new Image();
        img.onload = function () {
          // 生成缩略图（最大宽高 300px）
          var canvas = document.createElement('canvas');
          var maxSize = 300;
          var width = img.width;
          var height = img.height;

          if (width > height) {
            if (width > maxSize) {
              height = Math.round((height * maxSize) / width);
              width = maxSize;
            }
          } else {
            if (height > maxSize) {
              width = Math.round((width * maxSize) / height);
              height = maxSize;
            }
          }

          canvas.width = width;
          canvas.height = height;
          var ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, width, height);

          var thumbnail = canvas.toDataURL('image/jpeg', 0.7);
          self._pendingPhotos[type] = thumbnail;

          console.log('[CheckInSystem] 照片处理完成:', type, '(' + width + 'x' + height + ')');

          // 触发照片已就绪事件（供UI层监听）
          var event = new CustomEvent('photoReady', {
            detail: { type: type, thumbnail: thumbnail }
          });
          document.dispatchEvent(event);
        };
        img.src = e.target.result;
      };

      reader.readAsDataURL(file);
    },

    /**
     * 提交打卡
     * @param {string} cityId - 城市ID
     * @param {string} memoryText - 旅行感悟
     * @returns {boolean} 是否提交成功
     */
    submitCheckIn: function (cityId, memoryText) {
      // 【Bug #6】null 安全检查
      if (!GameEngine._state) {
        console.error('[CheckInSystem] 提交失败：游戏状态未初始化');
        return false;
      }

      // 验证旅行感悟
      if (!memoryText || memoryText.trim() === '') {
        GameEngine.Notification.showToast('请写下你的旅行感悟', 'error');
        console.warn('[CheckInSystem] 提交失败：记忆内容为空', cityId);
        return false;
      }

      var state = GameEngine._state;
      console.log('[CheckInSystem] 提交打卡:', cityId);

      // 初始化城市数据（如不存在）
      if (!state.cities[cityId]) {
        state.cities[cityId] = {
          unlocked: true,
          memory: '',
          completedAt: null
        };
      }

      // 保存打卡数据
      var oldMemory = state.cities[cityId].memory || '';
      var newMemory = memoryText.trim();
      if (oldMemory && oldMemory !== newMemory && oldMemory.indexOf(newMemory) === -1) {
        state.cities[cityId].memory = oldMemory + '\n\n---\n' + newMemory;
      } else {
        state.cities[cityId].memory = newMemory;
      }
      
      state.cities[cityId].completedAt = new Date().toISOString();
      state.cities[cityId].unlocked = true;

      // 更新统计
      state.totalCheckIns = Object.keys(state.cities).filter(function (id) {
        return state.cities[id].completedAt;
      }).length;

      // 增加经验，实现 1 次打卡 = 1 级 (每次获得 100 经验)
      var checkInExp = window.GameData && window.GameData.expSources ? window.GameData.expSources.checkIn.exp : 100;
      GameEngine.addExp(checkInExp, '城市打卡');

      // 【Bug #3 修复】使用 Utils.calculateDistance 计算与上一个打卡城市的距离
      if (state.lastCheckInCityId && state.lastCheckInCityId !== cityId) {
        var distance = GameEngine.Utils.calculateDistance(state.lastCheckInCityId, cityId);
        state.totalDistance += distance;
      }
      state.lastCheckInCityId = cityId;

      // 触发打卡成功回调
      try {
        this.onCheckInSuccess(cityId);
      } catch (err) {
        console.error('[CheckInSystem] 打卡后处理失败:', cityId, err);
        GameEngine.SaveSystem.save();
        GameEngine.Notification.showToast('记忆已保存，但部分奖励展示失败', 'error');
      }

      // 清理临时数据
      this._pendingPhotos = {};
      this._currentCityId = null;

      return true;
    },

    /**
     * 验证打卡三件套是否齐全（单机模式直接通过）
     * @param {string} cityId - 城市ID
     * @returns {boolean}
     */
    validateCheckIn: function (cityId) {
      // 检查三张照片是否都已上传
      var hasTicket = !!this._pendingPhotos.ticket;
      var hasFood = !!this._pendingPhotos.food;
      var hasScenery = !!this._pendingPhotos.scenery;

      // 单机模式：三件套齐全即可通过
      return hasTicket && hasFood && hasScenery;
    },

    /**
     * 打卡成功回调：解锁城市 + 生成卡牌 + 检查成就
     * @param {string} cityId - 城市ID
     */
    onCheckInSuccess: function (cityId) {
      var card = null;

      try {
        GameEngine.Audio.playCheckInSound();
      } catch (err) {
        console.error('[CheckInSystem] 音效播放失败:', cityId, err);
      }

      try {
        GameEngine.MapSystem.unlockCity(cityId);
      } catch (err) {
        console.error('[CheckInSystem] 城市解锁失败:', cityId, err);
      }

      try {
        card = GameEngine.CardSystem.generateCard(cityId);
      } catch (err) {
        console.error('[CheckInSystem] 卡牌生成失败:', cityId, err);
      }

      try {
        GameEngine.AchievementSystem.checkAchievements();
      } catch (err) {
        console.error('[CheckInSystem] 成就检查失败:', cityId, err);
      }

      if (!GameEngine.SaveSystem.save()) {
        GameEngine.Notification.showToast('记忆已写入当前进度，但持久化保存失败', 'error');
      }

      if (typeof document !== 'undefined') {
        document.dispatchEvent(new CustomEvent('gameStateUpdated', {
          detail: {
            type: 'checkin',
            cityId: cityId,
            cardId: card ? card.id : null
          }
        }));
      }

      if (card) {
        try {
          GameEngine.Notification.showReward(card);
        } catch (err) {
          console.error('[CheckInSystem] 奖励弹窗显示失败:', cityId, err);
        }
      }

      GameEngine.Notification.showToast('打卡成功！' + this._getCityName(cityId) + ' 已加入你的旅行足迹', 'success');

      console.log('[CheckInSystem] 打卡成功:', cityId);
    },

    /**
     * 获取某城市的打卡状态
     * @param {string} cityId - 城市ID
     * @returns {{completed:boolean, memory:string, completedAt:string|null}}
     */
    getCheckInStatus: function (cityId) {
      // 【Bug #6】null 安全检查
      if (!GameEngine._state) {
        return { completed: false, memory: '', completedAt: null };
      }

      var cityState = GameEngine._state.cities[cityId];
      if (!cityState) {
        return { completed: false, memory: '', completedAt: null };
      }
      return {
        completed: !!cityState.completedAt,
        memory: cityState.memory || '',
        completedAt: cityState.completedAt
      };
    },

    /**
     * 根据城市ID获取城市名称
     * @param {string} cityId
     * @returns {string}
     */
    _getCityName: function (cityId) {
      var cities = _getData('cities');
      if (!cities) return cityId;
      var city = cities.find(function (c) { return c.id === cityId; });
      return city ? city.name : cityId;
    }
  };

  // ==================== 5. 卡牌系统 (CardSystem) ====================

  /**
   * @namespace CardSystem
   * @description 管理神兽卡牌的生成、收集、详情查看与分享。
   */
  var CardSystem = {
    /** @type {Object.<string, Object>} 卡牌缓存 */
    _cardCache: {},

    _beastAliases: {
      shitiashou: 'shitishou'
    },

    _resolveBeast: function (city) {
      var beasts = _getData('beasts') || [];
      if (!city || !beasts.length) return null;

      var beastId = city.beast;
      if (beastId && this._beastAliases[beastId]) {
        beastId = this._beastAliases[beastId];
        city.beast = beastId;
      }

      var beast = beastId ? beasts.find(function (b) { return b.id === beastId; }) : null;
      if (beast) return beast;

      // For places without a configured beast, assign one deterministically so every unlocked place gets a card.
      var seed = city.id || city.name || 'default';
      var index = 0;
      for (var i = 0; i < seed.length; i++) {
        index += seed.charCodeAt(i);
      }
      beast = beasts[index % beasts.length];
      if (beast) city.beast = beast.id;
      return beast || null;
    },

    ensureCardData: function (cityId) {
      var cities = _getData('cities');
      var cards = _getData('cards');
      if (!cities || !cards) return null;

      var city = cities.find(function (c) { return c.id === cityId; });
      if (!city) return null;

      var beast = this._resolveBeast(city);
      if (!beast) return null;

      var existingCard = cards.find(function (card) { return card.cityId === cityId; });
      if (existingCard) return existingCard;

      var rarityToFrame = {
        '普通': 'wood',
        '稀有': 'bronze',
        '传说': 'gold',
        '绝版': 'diamond'
      };

      var card = {
        id: 'card_' + cityId,
        cityId: cityId,
        beastId: beast.id,
        name: city.name + '·' + beast.name,
        quote: GameEngine.Utils.randomQuote(beast.id),
        rarity: beast.rarity || '普通',
        frameStyle: rarityToFrame[beast.rarity] || 'wood',
        image: ''
      };

      cards.push(card);
      return card;
    },

    /**
     * 根据城市和神兽数据生成卡牌
     * 【Bug #2 修复】使用 BEAST_EMOJI_MAP 获取 emoji
     * 【Bug #4 修复】使用 region ID 获取颜色
     * 【Bug #5 修复】使用神兽 ID 获取引文
     * @param {string} cityId - 城市ID
     * @returns {Object|null} 生成的卡牌数据
     */
    generateCard: function (cityId) {
      // 【Bug #6】null 安全检查
      if (!GameEngine._state) return null;

      this.ensureCardData(cityId);

      var cities = _getData('cities');
      var beasts = _getData('beasts');
      if (!cities || !beasts) return null;

      var city = cities.find(function (c) { return c.id === cityId; });
      if (!city) return null;

      var beast = this._resolveBeast(city);
      if (!beast) return null;

      // 检查是否已拥有该卡牌
      var state = GameEngine._state;
      var existingCard = state.cards.find(function (cid) { return cid === cityId; });
      if (existingCard) {
        console.log('[CardSystem] 卡牌已存在:', cityId);
        return this.getCardDetail(cityId);
      }

      // 生成卡牌数据
      var card = {
        id: cityId,
        cityId: cityId,
        cityName: city.name,
        region: city.region,
        beastId: beast.id,
        beastName: beast.name,
        // 【Bug #2】使用 BEAST_EMOJI_MAP 获取 emoji
        beastEmoji: BEAST_EMOJI_MAP[beast.id] || '',
        beastDesc: beast.description || '',
        rarity: beast.rarity || '普通',
        element: beast.element || '土',
        // 【Bug #5】使用神兽 ID 获取引文
        quote: GameEngine.Utils.randomQuote(beast.id),
        obtainedAt: new Date().toISOString(),
        // 【Bug #4】使用 region ID 获取颜色
        color: REGION_COLORS[city.region] || '#888888'
      };

      // 缓存卡牌
      this._cardCache[cityId] = card;

      // 添加到已收集列表
      state.cards.push(cityId);

      // 集齐全部12张卡牌时，授予满级经验
      var deckCityIds = ['wuhan','hangzhou','kunming','chengdu','sanya','guilin','haerbin','wulumuqi','beijing','shanghai','xiamen','changsha'];
      var allCollected = deckCityIds.every(function(id) { return state.cards.indexOf(id) !== -1; });
      if (allCollected) {
        state.exp = 100000;
        var levelInfo = window.GameData ? window.GameData.utils.calcLevel(100000) : null;
        if (levelInfo) { state.level = levelInfo.level; }
      }

      // 播放获得卡牌音效
      setTimeout(function () {
        GameEngine.Audio.playCardSound();
      }, 500);

      console.log('[CardSystem] 卡牌生成:', card.beastName, '(' + card.rarity + ')');
      return card;
    },

    /**
     * 获取所有已获得的卡牌列表
     * @returns {Object[]} 卡牌数组
     */
    getCards: function () {
      // 【Bug #6】null 安全检查
      if (!GameEngine._state) return [];

      var self = this;
      var state = GameEngine._state;
      return state.cards.map(function (cityId) {
        return self.getCardDetail(cityId);
      }).filter(Boolean);
    },

    /**
     * 获取卡牌详情
     * 【Bug #2 修复】使用 BEAST_EMOJI_MAP 获取 emoji
     * 【Bug #4 修复】使用 region ID 获取颜色
     * 【Bug #5 修复】使用神兽 ID 获取引文
     * @param {string} cardId - 卡牌ID（即城市ID）
     * @returns {Object|null} 卡牌详情
     */
    getCardDetail: function (cardId) {
      // 优先从缓存获取
      if (this._cardCache[cardId]) {
        return this._cardCache[cardId];
      }

      // 从数据层重新构建
      var cities = _getData('cities');
      var beasts = _getData('beasts');
      if (!cities || !beasts) return null;

      var city = cities.find(function (c) { return c.id === cardId; });
      if (!city) return null;

      var beast = beasts.find(function (b) { return b.id === city.beast; });
      if (!beast) return null;

      var card = {
        id: cardId,
        cityId: cardId,
        cityName: city.name,
        region: city.region,
        beastId: beast.id,
        beastName: beast.name,
        // 【Bug #2】使用 BEAST_EMOJI_MAP 获取 emoji
        beastEmoji: BEAST_EMOJI_MAP[beast.id] || '',
        beastDesc: beast.description || '',
        rarity: beast.rarity || '普通',
        element: beast.element || '土',
        // 【Bug #5】使用神兽 ID 获取引文
        quote: GameEngine.Utils.randomQuote(beast.id),
        // 【Bug #4】使用 region ID 获取颜色
        color: REGION_COLORS[city.region] || '#888888'
      };

      this._cardCache[cardId] = card;
      return card;
    },

    /**
     * 获取卡牌收集进度
     * 【Bug #14 修复】total 只统计有 beast 的城市数
     * @returns {{collected:number, total:number, percentage:number}}
     */
    getCollectionProgress: function () {
      // 【Bug #6】null 安全检查
      if (!GameEngine._state) return { collected: 0, total: 0, percentage: 0 };

      // We know there are exactly 12 cards in the deck (data.js cards array length)
      var cards = _getData('cards');
      var total = cards ? cards.length : 12;
      var collected = GameEngine._state.cards.length;
      return {
        collected: collected,
        total: total,
        percentage: total > 0 ? Math.round((collected / total) * 100) : 0
      };
    },

    /**
     * 解锁卡牌（直接添加到收集列表）
     * @param {string} cardId - 卡牌ID
     */
    unlockCard: function (cardId) {
      // 【Bug #6】null 安全检查
      if (!GameEngine._state) return;

      var state = GameEngine._state;
      if (state.cards.indexOf(cardId) === -1) {
        state.cards.push(cardId);
        console.log('[CardSystem] 卡牌已解锁:', cardId);
      }
    }
  };

  // ==================== 6. 成就系统 (AchievementSystem) ====================

  /**
   * @namespace AchievementSystem
   * @description 管理游戏成就的定义、检测、解锁与进度追踪。
   * 【Bug #1 修复】完全重写成就系统，使用 data.js 中的 check(player) 函数
   *               而非 type/target 模式
   */
  var AchievementSystem = {
    /**
     * 检查并解锁新成就
     * 【Bug #1 修复】使用成就的 check(player) 函数判断是否满足条件
     * 不再使用 _calculateProgress / achievement.type / achievement.target
     */
    checkAchievements: function () {
      var achievements = _getData('achievements');
      // 【Bug #6】null 安全检查
      if (!achievements || !GameEngine._state) return [];

      var state = GameEngine._state;
      var newUnlocks = [];

      // 构建 player 对象供 check 函数使用
      var player = {
        cities: Object.keys(state.cities).filter(function (id) {
          return state.cities[id] && state.cities[id].unlocked;
        }),
        cards: state.cards || [],
        achievements: state.achievements ? Object.keys(state.achievements).filter(function (id) {
          return state.achievements[id] && state.achievements[id].unlocked;
        }) : [],
        foodPhotos: [],  // 美食照片（当前存档结构中未单独存储，预留扩展）
        totalDistance: state.totalDistance || 0,
        totalCheckIns: state.totalCheckIns || 0,
        _consecutiveDays: 0,
        _totalDistance: state.totalDistance || 0,
        unlockedRegions: this._getUnlockedRegions()
      };

      achievements.forEach(function (ach) {
        // 跳过已解锁的成就
        if (state.achievements[ach.id] && state.achievements[ach.id].unlocked) {
          return;
        }

        // 【Bug #1】使用 check 函数判断
        if (typeof ach.check === 'function') {
          try {
            if (ach.check(player)) {
              // 解锁成就
              state.achievements[ach.id] = {
                unlocked: true,
                unlockedAt: new Date().toISOString()
              };
              newUnlocks.push(ach);

              // 播放解锁音效
              GameEngine.Audio.playUnlockSound();
              console.log('[AchievementSystem] 成就解锁:', ach.name);
            }
          } catch (e) {
            console.error('[AchievementSystem] 成就检查出错:', ach.id, e);
          }
        }
      });

      // 如果有新解锁的成就，显示通知并保存
      if (newUnlocks.length > 0) {
        var names = newUnlocks.map(function (a) { return a.name; }).join('、');
        GameEngine.Notification.showToast('成就解锁：' + names, 'success');

        // 显示奖励弹窗
        newUnlocks.forEach(function (ach) {
          GameEngine.Notification.showReward({
            type: 'achievement',
            data: ach,
            beastName: ach.name,
            beastEmoji: ach.icon || '',
            beastDesc: ach.description,
            cityName: ach.reward ? (ach.reward.title || '') : '',
            color: '#FFD700',
            rarity: '成就'
          });
        });

        GameEngine.SaveSystem.save();
      }

      return newUnlocks;
    },

    /**
     * 获取已解锁的区域列表
     * @returns {string[]} 已解锁区域ID数组
     * @private
     */
    _getUnlockedRegions: function () {
      if (!GameEngine._state) return [];

      var cities = _getData('cities');
      var regions = _getData('regions');
      if (!cities || !regions) return [];

      var state = GameEngine._state;
      var unlockedRegionIds = [];

      regions.forEach(function (region) {
        var regionCities = cities.filter(function (c) { return c.region === region.id; });
        // 如果区域中至少有一座城市已解锁，则该区域视为已解锁
        var hasUnlocked = regionCities.some(function (c) {
          return state.cities[c.id] && state.cities[c.id].unlocked;
        });
        if (hasUnlocked) {
          unlockedRegionIds.push(region.id);
        }
      });

      return unlockedRegionIds;
    },

    /**
     * 获取所有成就列表（含解锁状态）
     * 【Bug #1 修复】不再使用 _calculateProgress / type / target
     * @returns {Object[]}
     */
    getAchievements: function () {
      var achievements = _getData('achievements');
      // 【Bug #6】null 安全检查
      if (!achievements || !GameEngine._state) return [];

      var state = GameEngine._state;

      return achievements.map(function (ach) {
        var isUnlocked = !!(state.achievements[ach.id] && state.achievements[ach.id].unlocked);
        return {
          id: ach.id,
          name: ach.name,
          icon: ach.icon || '',
          description: ach.description,
          reward: ach.reward || null,
          condition: ach.condition || '',
          unlocked: isUnlocked,
          unlockedAt: isUnlocked ? state.achievements[ach.id].unlockedAt : null
        };
      });
    },

    /**
     * 解锁成就（手动触发，供外部调用）
     * @param {string} achievementId - 成就ID
     */
    unlockAchievement: function (achievementId) {
      // 【Bug #6】null 安全检查
      if (!GameEngine._state) return;

      var state = GameEngine._state;
      if (!state.achievements[achievementId]) {
        state.achievements[achievementId] = { unlocked: false, unlockedAt: null };
      }

      if (!state.achievements[achievementId].unlocked) {
        state.achievements[achievementId].unlocked = true;
        state.achievements[achievementId].unlockedAt = new Date().toISOString();

        // 播放解锁音效
        GameEngine.Audio.playUnlockSound();

        console.log('[AchievementSystem] 成就解锁:', achievementId);
      }
    },

    /**
     * 获取成就进度
     * 【Bug #1 修复】简化进度计算，因为 data.js 使用 check 函数
     *               不再依赖 type/target，进度只返回 0 或 100
     * @param {string} achievementId - 成就ID
     * @returns {{progress:number, target:number, percentage:number, unlocked:boolean}}
     */
    getAchievementProgress: function (achievementId) {
      var achievements = _getData('achievements');
      // 【Bug #6】null 安全检查
      if (!achievements || !GameEngine._state) {
        return { progress: 0, target: 1, percentage: 0, unlocked: false };
      }

      var achievement = achievements.find(function (a) { return a.id === achievementId; });
      if (!achievement) return { progress: 0, target: 1, percentage: 0, unlocked: false };

      var state = GameEngine._state;
      var unlocked = state.achievements[achievementId] && state.achievements[achievementId].unlocked;

      // 【Bug #1】简化：已解锁则 100%，否则 0%
      // 因为 data.js 使用 check 函数，无法精确计算中间进度
      return {
        progress: unlocked ? 1 : 0,
        target: 1,
        percentage: unlocked ? 100 : 0,
        unlocked: unlocked
      };
    }
  };

  // ==================== 7. 排行榜系统 (LeaderboardSystem) ====================

  /**
   * @namespace LeaderboardSystem
   * @description 管理模拟排行榜数据生成与查询，包含足迹榜和图鉴榜。
   */
  var LeaderboardSystem = {
    /** @type {Object[]} 模拟排行榜数据缓存 */
    _mockData: null,

    /** 模拟玩家名称池 */
    _mockNames: [
      '云游四方', '山海行者', '寻龙客', '踏雪寻梅', '追风少年',
      '逍遥游', '青鸟使者', '白泽通灵', '鲲鹏展翅', '凤凰涅槃',
      '九尾灵狐', '麒麟才子', '瑞兽守护', '天马行空', '神龙见首',
      '玄武大帝', '朱雀南飞', '青龙出海', '白虎镇山', '貔貅招财'
    ],

    /**
     * 生成模拟排行榜数据
     * @returns {Object[]} 排行榜数据数组
     */
    generateMockLeaderboard: function () {
      if (this._mockData) return this._mockData;

      var cities = _getData('cities');
      var totalCities = cities ? cities.length : 30;

      var self = this;
      this._mockData = this._mockNames.map(function (name, index) {
        var checkInCount = Math.floor(Math.random() * totalCities) + 1;
        var cardCount = Math.floor(Math.random() * totalCities) + 1;
        var distance = Math.floor(Math.random() * 50000) + 1000;
        return {
          rank: index + 1,
          name: name,
          avatar: '',
          checkInCount: checkInCount,
          cardCount: cardCount,
          distance: distance,
          isPlayer: false
        };
      });

      // 插入当前玩家数据
      var state = GameEngine._state;
      // 【Bug #16】state null 检查
      if (!state) {
        console.warn('[LeaderboardSystem] 引擎未初始化，跳过排行榜生成');
        return this._mockData || [];
      }
      var playerEntry = {
        rank: 0,
        name: state.playerName,
        avatar: state.avatar,
        checkInCount: state.totalCheckIns,
        cardCount: state.cards.length,
        distance: state.totalDistance,
        isPlayer: true
      };

      this._mockData.push(playerEntry);

      console.log('[LeaderboardSystem] 模拟排行榜数据已生成');
      return this._mockData;
    },

    /**
     * 获取足迹榜（按打卡城市数排序）
     * 【Bug #8 修复】排序前先 slice() 创建副本，避免原地修改缓存数据
     * @returns {Object[]}
     */
    getFootprintRanking: function () {
      var data = this.generateMockLeaderboard();
      // 【Bug #8】先创建副本再排序
      var sorted = data.slice().sort(function (a, b) { return b.checkInCount - a.checkInCount; });
      // 重新计算排名
      sorted.forEach(function (item, index) { item.rank = index + 1; });
      return sorted;
    },

    /**
     * 获取图鉴榜（按卡牌收集数排序）
     * 【Bug #8 修复】排序前先 slice() 创建副本
     * @returns {Object[]}
     */
    getCollectionRanking: function () {
      var data = this.generateMockLeaderboard();
      // 【Bug #8】先创建副本再排序
      var sorted = data.slice().sort(function (a, b) { return b.cardCount - a.cardCount; });
      // 重新计算排名
      sorted.forEach(function (item, index) { item.rank = index + 1; });
      return sorted;
    },

    /**
     * 获取当前玩家的排名
     * @param {string} [type='footprint'] - 排行榜类型 'footprint'|'collection'
     * @returns {{rank:number, total:number, score:number}}
     */
    getPlayerRank: function (type) {
      var ranking = type === 'collection'
        ? this.getCollectionRanking()
        : this.getFootprintRanking();

      var player = ranking.find(function (item) { return item.isPlayer; });
      if (!player) return { rank: 0, total: ranking.length, score: 0 };

      return {
        rank: player.rank,
        total: ranking.length,
        score: type === 'collection' ? player.cardCount : player.checkInCount
      };
    }
  };

  // ==================== 8. 音效系统 (AudioSystem) ====================

  /**
   * @namespace AudioSystem
   * @description 使用 Web Audio API 生成程序化音效，不依赖外部音频文件。
   *              包含背景音乐（五声音阶循环旋律）和各种交互音效。
   */
  var AudioSystem = {
    /** @type {AudioContext|null} Web Audio 上下文 */
    _ctx: null,

    /** @type {GainNode|null} 主音量节点 */
    _masterGain: null,

    /** @type {GainNode|null} 背景音乐音量节点 */
    _bgmGain: null,

    /** @type {GainNode|null} 音效音量节点 */
    _sfxGain: null,

    /** @type {number} 背景音乐音量 (0~1) */
    _musicVolume: 0.5,

    /** @type {number} 音效音量 (0~1) */
    _sfxVolume: 0.7,

    /** @type {boolean} 是否静音 */
    _muted: false,

    /** @type {number|null} BGM 定时器 */
    _bgmTimer: null,

    /** @type {boolean} BGM 是否正在播放 */
    _bgmPlaying: false,

    /**
     * 初始化 AudioContext（需要用户交互后调用）
     */
    _initContext: function () {
      if (this._ctx) return;
      try {
        this._ctx = new (window.AudioContext || window.webkitAudioContext)();

        // 创建音量节点链：源 -> sfxGain/bgmGain -> masterGain -> destination
        this._masterGain = this._ctx.createGain();
        this._masterGain.connect(this._ctx.destination);

        this._bgmGain = this._ctx.createGain();
        this._bgmGain.connect(this._masterGain);

        this._sfxGain = this._ctx.createGain();
        this._sfxGain.connect(this._masterGain);

        this._updateVolumes();
        console.log('[AudioSystem] AudioContext 初始化完成');
      } catch (e) {
        console.warn('[AudioSystem] AudioContext 初始化失败:', e);
      }
    },

    /**
     * 更新所有音量节点的增益值
     */
    _updateVolumes: function () {
      if (!this._masterGain) return;
      var masterVol = this._muted ? 0 : 1;
      this._masterGain.gain.value = masterVol;
      if (this._bgmGain) this._bgmGain.gain.value = this._musicVolume;
      if (this._sfxGain) this._sfxGain.gain.value = this._sfxVolume;
    },

    /**
     * 播放单个音符
     * @param {number} frequency - 频率
     * @param {number} startTime - 开始时间（秒）
     * @param {number} duration - 持续时间（秒）
     * @param {string} [type='sine'] - 波形类型
     * @param {GainNode} [gainNode] - 输出节点
     */
    _playNote: function (frequency, startTime, duration, type, gainNode) {
      if (!this._ctx) return;
      type = type || 'sine';
      gainNode = gainNode || this._sfxGain;

      var osc = this._ctx.createOscillator();
      var noteGain = this._ctx.createGain();

      osc.type = type;
      osc.frequency.value = frequency;

      // ADSR 包络
      noteGain.gain.setValueAtTime(0, startTime);
      noteGain.gain.linearRampToValueAtTime(0.3, startTime + 0.05);
      noteGain.gain.linearRampToValueAtTime(0.2, startTime + duration * 0.3);
      noteGain.gain.linearRampToValueAtTime(0, startTime + duration);

      osc.connect(noteGain);
      noteGain.connect(gainNode);

      osc.start(startTime);
      osc.stop(startTime + duration);
    },

    /**
     * 播放背景音乐（五声音阶循环旋律）
     * 使用宫商角徵羽（C D E G A）构成的中国风旋律
     */
    playBGM: function () {
      this._initContext();
      if (!this._ctx || this._bgmPlaying) return;

      this._bgmPlaying = true;

      // 五声音阶旋律序列（频率 + 时值）
      var melody = [
        { freq: PENTATONIC.C4, dur: 0.6 },
        { freq: PENTATONIC.E4, dur: 0.4 },
        { freq: PENTATONIC.G4, dur: 0.6 },
        { freq: PENTATONIC.A4, dur: 0.4 },
        { freq: PENTATONIC.G4, dur: 0.8 },
        { freq: PENTATONIC.E4, dur: 0.4 },
        { freq: PENTATONIC.D4, dur: 0.6 },
        { freq: PENTATONIC.C4, dur: 0.8 },
        { freq: PENTATONIC.D4, dur: 0.4 },
        { freq: PENTATONIC.E4, dur: 0.6 },
        { freq: PENTATONIC.G4, dur: 0.4 },
        { freq: PENTATONIC.A4, dur: 0.6 },
        { freq: PENTATONIC.C5, dur: 0.8 },
        { freq: PENTATONIC.A4, dur: 0.4 },
        { freq: PENTATONIC.G4, dur: 0.6 },
        { freq: PENTATONIC.E4, dur: 1.0 }
      ];

      var self = this;
      var totalDuration = melody.reduce(function (sum, note) { return sum + note.dur; }, 0);

      function playLoop() {
        if (!self._bgmPlaying || !self._ctx) return;

        var now = self._ctx.currentTime;
        var offset = 0;

        melody.forEach(function (note) {
          self._playNote(note.freq, now + offset, note.dur * 0.9, 'sine', self._bgmGain);
          offset += note.dur;
        });

        // 循环播放
        self._bgmTimer = setTimeout(playLoop, totalDuration * 1000);
      }

      playLoop();
      console.log('[AudioSystem] 背景音乐开始播放');
    },

    /**
     * 停止背景音乐
     */
    stopBGM: function () {
      this._bgmPlaying = false;
      if (this._bgmTimer) {
        clearTimeout(this._bgmTimer);
        this._bgmTimer = null;
      }
      console.log('[AudioSystem] 背景音乐已停止');
    },

    /**
     * 打卡成功音效（印章盖章声）
     * 模拟"咚"的一声盖章效果
     */
    playCheckInSound: function () {
      this._initContext();
      if (!this._ctx) return;

      var now = this._ctx.currentTime;

      // 低频"咚"声
      var osc1 = this._ctx.createOscillator();
      var gain1 = this._ctx.createGain();
      osc1.type = 'triangle';
      osc1.frequency.setValueAtTime(150, now);
      osc1.frequency.exponentialRampToValueAtTime(80, now + 0.3);
      gain1.gain.setValueAtTime(0.5, now);
      gain1.gain.exponentialRampToValueAtTime(0.01, now + 0.3);
      osc1.connect(gain1);
      gain1.connect(this._sfxGain);
      osc1.start(now);
      osc1.stop(now + 0.3);

      // 高频"咔"声
      var osc2 = this._ctx.createOscillator();
      var gain2 = this._ctx.createGain();
      osc2.type = 'square';
      osc2.frequency.setValueAtTime(800, now);
      osc2.frequency.exponentialRampToValueAtTime(200, now + 0.05);
      gain2.gain.setValueAtTime(0.2, now);
      gain2.gain.exponentialRampToValueAtTime(0.01, now + 0.05);
      osc2.connect(gain2);
      gain2.connect(this._sfxGain);
      osc2.start(now);
      osc2.stop(now + 0.05);

      console.log('[AudioSystem] 播放打卡音效');
    },

    /**
     * 解锁音效（风铃声）
     * 模拟清脆的风铃声响
     */
    playUnlockSound: function () {
      this._initContext();
      if (!this._ctx) return;

      var now = this._ctx.currentTime;
      // 风铃：连续的高频音符
      var notes = [
        { freq: PENTATONIC.A5, time: 0 },
        { freq: PENTATONIC.E5, time: 0.1 },
        { freq: PENTATONIC.G5, time: 0.2 },
        { freq: PENTATONIC.A5, time: 0.35 },
        { freq: PENTATONIC.C5, time: 0.5 }
      ];

      var self = this;
      notes.forEach(function (note) {
        self._playNote(note.freq, now + note.time, 0.8, 'sine', self._sfxGain);
      });

      console.log('[AudioSystem] 播放解锁音效');
    },

    /**
     * 获得卡牌音效
     * 魔法般的音效，从低到高滑音
     */
    playCardSound: function () {
      this._initContext();
      if (!this._ctx) return;

      var now = this._ctx.currentTime;

      // 滑音效果
      var osc = this._ctx.createOscillator();
      var gain = this._ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(300, now);
      osc.frequency.exponentialRampToValueAtTime(1200, now + 0.4);
      gain.gain.setValueAtTime(0.3, now);
      gain.gain.linearRampToValueAtTime(0.4, now + 0.2);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.6);
      osc.connect(gain);
      gain.connect(this._sfxGain);
      osc.start(now);
      osc.stop(now + 0.6);

      // 闪烁音
      this._playNote(PENTATONIC.C5, now + 0.1, 0.3, 'triangle', this._sfxGain);
      this._playNote(PENTATONIC.E5, now + 0.2, 0.3, 'triangle', this._sfxGain);

      console.log('[AudioSystem] 播放卡牌音效');
    },

    /**
     * 设置音量
     * @param {number} level - 音量级别 (0~1)
     * @param {string} [type='all'] - 'music'|'sfx'|'all'
     */
    setVolume: function (level, type) {
      type = type || 'all';
      level = Math.max(0, Math.min(1, level));

      if (type === 'music' || type === 'all') {
        this._musicVolume = level;
        if (GameEngine._state) GameEngine._state.settings.musicVolume = level;
      }
      if (type === 'sfx' || type === 'all') {
        this._sfxVolume = level;
        if (GameEngine._state) GameEngine._state.settings.sfxVolume = level;
      }

      this._updateVolumes();
      console.log('[AudioSystem] 音量设置:', type, level);
    },

    /**
     * 静音切换
     * @returns {boolean} 切换后的静音状态
     */
    toggleMute: function () {
      this._muted = !this._muted;
      if (GameEngine._state) GameEngine._state.settings.muted = this._muted;
      this._updateVolumes();
      console.log('[AudioSystem] 静音:', this._muted ? '开' : '关');
      return this._muted;
    }
  };

  // ==================== 9. 新手引导系统 (TutorialSystem) ====================

  /**
   * @namespace TutorialSystem
   * @description 管理首次进入游戏时的新手引导流程，以白泽为引导角色。
   */
  var TutorialSystem = {
    /** @type {number} 当前引导步骤索引 */
    _currentStep: 0,

    /** @type {boolean} 引导是否正在进行中 */
    _isActive: false,

    /** @type {HTMLElement|null} 引导遮罩层 */
    _overlay: null,

    /** @type {HTMLElement|null} 引导对话框 */
    _dialog: null,

    /**
     * 开始新手引导
     */
    startTutorial: function () {
      // 【Bug #6】null 安全检查
      if (!GameEngine._state) return;

      var state = GameEngine._state;
      if (state.tutorialComplete) {
        console.log('[TutorialSystem] 引导已完成，跳过');
        return;
      }

      this._currentStep = state.tutorialStep || 0;
      this._isActive = true;
      this._createOverlay();
      this._showStep(this._currentStep);

      console.log('[TutorialSystem] 新手引导开始');
    },

    /**
     * 创建引导遮罩层和对话框
     */
    _createOverlay: function () {
      // 遮罩层
      this._overlay = document.createElement('div');
      this._overlay.className = 'tutorial-overlay';
      this._overlay.id = 'tutorial-overlay';
      this._overlay.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;' +
        'background:rgba(0,0,0,0.7);z-index:9998;display:none;';

      // 对话框
      this._dialog = document.createElement('div');
      this._dialog.className = 'tutorial-dialog';
      this._dialog.id = 'tutorial-dialog';
      this._dialog.style.cssText = 'position:fixed;bottom:80px;left:50%;transform:translateX(-50%);' +
        'background:linear-gradient(135deg,#2c1810,#4a2c17);color:#f0e6d3;padding:20px 24px;' +
        'border-radius:16px;max-width:320px;width:90%;z-index:9999;text-align:center;' +
        'box-shadow:0 8px 32px rgba(0,0,0,0.5);border:2px solid #d4a574;display:none;';

      (document.getElementById('app') || document.body).appendChild(this._overlay);
      (document.getElementById('app') || document.body).appendChild(this._dialog);
    },

    /**
     * 显示指定步骤的引导内容
     * @param {number} stepIndex - 步骤索引
     */
    _showStep: function (stepIndex) {
      if (stepIndex >= TUTORIAL_STEPS.length) {
        this._completeTutorial();
        return;
      }

      var step = TUTORIAL_STEPS[stepIndex];
      var self = this;

      // 引导文本内容
      var dialogContents = [
        // 步骤0：欢迎界面
        '<div style="font-size:40px;margin-bottom:12px;">\uD83E\uDD8C</div>' +
        '<h3 style="margin:0 0 8px;color:#000;">白泽在此恭候多时</h3>' +
        '<p style="margin:0 0 16px;font-size:14px;line-height:1.6;color:#000;">' +
        '吾乃白泽，通晓天下万物。今日起，我将引导你踏上一段山海之旅，' +
        '用你的足迹点亮华夏大地，收集上古神兽的传说。</p>',

        // 步骤1：引导点击地图
        '<div style="font-size:32px;margin-bottom:12px;">\uD83D\uDDFA\uFE0F</div>' +
        '<h3 style="margin:0 0 8px;color:#000;">探索华夏地图</h3>' +
        '<p style="margin:0 0 16px;font-size:14px;line-height:1.6;color:#000;">' +
        '这是你的旅行地图。灰色的城市等待你去探索，' +
        '点击任意城市即可开始打卡之旅。</p>',

        // 步骤2：展示地图变色效果
        '<div style="font-size:32px;margin-bottom:12px;">\uD83C\uDFA8</div>' +
        '<h3 style="margin:0 0 8px;color:#000;">见证地图变色</h3>' +
        '<p style="margin:0 0 16px;font-size:14px;line-height:1.6;color:#000;">' +
        '打卡成功后，城市将焕发色彩！每个区域都有独特的传统色，' +
        '集齐一整片区域，地图将呈现壮丽的色彩画卷。</p>',

        // 步骤3：展示卡牌
        '<div style="font-size:32px;margin-bottom:12px;">\uD83C\uDCCF</div>' +
        '<h3 style="margin:0 0 8px;color:#000;">收集神兽卡牌</h3>' +
        '<p style="margin:0 0 16px;font-size:14px;line-height:1.6;color:#000;">' +
        '每解锁一座城市，你将获得一张山海经神兽卡牌。' +
        '收集全部卡牌，成为真正的山海通灵者！</p>'
      ];

      // 显示遮罩
      if (this._overlay) this._overlay.style.display = 'block';

      // 高亮目标元素（如有）
      if (step.target) {
        this._highlightTarget(step.target);
      }

      // 渲染对话框内容
      if (this._dialog) {
        this._dialog.innerHTML = dialogContents[stepIndex] +
          '<div style="display:flex;justify-content:space-between;margin-top:16px;">' +
          '<button id="tutorial-skip" style="padding:8px 16px;border:1px solid #8b7355;' +
          'background:transparent;color:#d4c4a8;border-radius:8px;cursor:pointer;font-size:13px;">跳过</button>' +
          '<button id="tutorial-next" style="padding:8px 20px;border:none;' +
          'background:linear-gradient(135deg,#c94043,#e8655a);color:#fff;border-radius:8px;' +
          'cursor:pointer;font-size:13px;font-weight:bold;">' +
          (stepIndex < TUTORIAL_STEPS.length - 1 ? '下一步' : '开始旅行') + '</button>' +
          '</div>';

        this._dialog.style.display = 'block';

        // 【Bug #15】getElementById 后检查 null
        var nextBtn = document.getElementById('tutorial-next');
        var skipBtn = document.getElementById('tutorial-skip');

        if (nextBtn) {
          nextBtn.addEventListener('click', function () {
            self.nextStep();
          });
        }
        if (skipBtn) {
          skipBtn.addEventListener('click', function () {
            self.skipTutorial();
          });
        }
      }
    },

    /**
     * 高亮引导目标元素
     * @param {string} selector - CSS选择器
     */
    _highlightTarget: function (selector) {
      var target = document.querySelector(selector);
      if (target && this._overlay) {
        var rect = target.getBoundingClientRect();
        // 在遮罩上创建一个透明"窗口"来高亮目标元素
        this._overlay.style.boxShadow = '0 0 0 9999px rgba(0,0,0,0.75)';
        this._overlay.style.background = 'transparent';
      }
    },

    /**
     * 前进到下一步
     */
    nextStep: function () {
      this._currentStep++;
      // 【Bug #6】null 安全检查
      if (GameEngine._state) {
        GameEngine._state.tutorialStep = this._currentStep;
      }

      if (this._currentStep >= TUTORIAL_STEPS.length) {
        this._completeTutorial();
      } else {
        this._showStep(this._currentStep);
      }

      console.log('[TutorialSystem] 引导步骤:', this._currentStep);
    },

    /**
     * 跳过新手引导
     */
    skipTutorial: function () {
      this._completeTutorial();
      console.log('[TutorialSystem] 引导已跳过');
    },

    /**
     * 完成引导，清理UI
     */
    _completeTutorial: function () {
      this._isActive = false;
      // 【Bug #6】null 安全检查
      if (GameEngine._state) {
        GameEngine._state.tutorialComplete = true;
        GameEngine._state.tutorialStep = TUTORIAL_STEPS.length;
      }

      // 移除遮罩和对话框
      if (this._overlay) {
        this._overlay.style.display = 'none';
        // 【Bug #11】removeChild 安全：检查 parentNode
        if (this._overlay.parentNode) {
          this._overlay.parentNode.removeChild(this._overlay);
        }
        this._overlay = null;
      }
      if (this._dialog) {
        this._dialog.style.display = 'none';
        // 【Bug #11】removeChild 安全：检查 parentNode
        if (this._dialog.parentNode) {
          this._dialog.parentNode.removeChild(this._dialog);
        }
        this._dialog = null;
      }

      // 保存并跳转到地图页
      GameEngine.SaveSystem.save();
      GameEngine.Router.navigateTo('map');

      console.log('[TutorialSystem] 新手引导完成');
    },

    /**
     * 引导是否已完成
     * @returns {boolean}
     */
    isTutorialComplete: function () {
      // 【Bug #6】null 安全检查
      if (!GameEngine._state) return false;
      return GameEngine._state.tutorialComplete;
    }
  };

  // ==================== 10. 通知系统 (NotificationSystem) ====================

  /**
   * @namespace NotificationSystem
   * @description 管理游戏中的提示消息、模态框和奖励弹窗。
   */
  var NotificationSystem = {
    /** @type {HTMLElement|null} Toast 容器 */
    _toastContainer: null,

    /** @type {number} Toast 自动消失时间（毫秒） */
    _toastDuration: 3000,

    /**
     * 初始化通知容器
     */
    _init: function () {
      if (this._toastContainer) return;

      this._toastContainer = document.createElement('div');
      this._toastContainer.id = 'toast-container';
      this._toastContainer.style.cssText = 'position:fixed;top:20px;left:50%;transform:translateX(-50%);' +
        'z-index:10000;display:flex;flex-direction:column;align-items:center;gap:8px;pointer-events:none;';
      (document.getElementById('app') || document.body).appendChild(this._toastContainer);
    },

    /**
     * 显示 Toast 提示消息
     * @param {string} message - 消息文本
     * @param {string} [type='info'] - 消息类型 'success'|'error'|'info'
     */
    showToast: function (message, type) {
      this._init();
      type = type || 'info';

      var colors = {
        success: 'background:linear-gradient(135deg,#2e7d32,#4caf50);color:#fff;',
        error: 'background:linear-gradient(135deg,#c62828,#ef5350);color:#fff;',
        info: 'background:linear-gradient(135deg,#37474f,#607d8b);color:#fff;'
      };

      var icons = {
        success: '\u2713',
        error: '\u2715',
        info: '\u2139'
      };

      var toast = document.createElement('div');
      toast.className = 'toast toast-' + type;
      toast.style.cssText = colors[type] +
        'padding:10px 20px;border-radius:24px;font-size:14px;' +
        'box-shadow:0 4px 12px rgba(0,0,0,0.3);pointer-events:auto;' +
        'opacity:0;transform:translateY(-10px);transition:all 0.3s ease;' +
        'display:flex;align-items:center;gap:8px;max-width:90vw;';
      toast.innerHTML = '<span style="font-weight:bold;">' + (icons[type] || '') + '</span>' +
        '<span>' + message + '</span>';

      this._toastContainer.appendChild(toast);

      // 入场动画
      requestAnimationFrame(function () {
        toast.style.opacity = '1';
        toast.style.transform = 'translateY(0)';
      });

      // 自动消失
      var self = this;
      setTimeout(function () {
        toast.style.opacity = '0';
        toast.style.transform = 'translateY(-10px)';
        setTimeout(function () {
          // 【Bug #11】removeChild 安全：检查 parentNode
          if (toast.parentNode) toast.parentNode.removeChild(toast);
        }, 300);
      }, this._toastDuration);

      console.log('[NotificationSystem] Toast:', type, message);
    },

    /**
     * 显示模态框
     * 【Bug #11 修复】removeChild 前检查 parentNode
     * @param {string} title - 标题
     * @param {string} content - 内容（支持HTML）
     * @param {Array<{text:string, className?:string, onClick?:Function}>} [buttons] - 按钮配置
     * @returns {Promise} 点击按钮后 resolve
     */
    showModal: function (title, content, buttons) {
      return new Promise(function (resolve) {
        // 遮罩
        var overlay = document.createElement('div');
        overlay.className = 'modal-overlay';
        overlay.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;' +
          'background:rgba(0,0,0,0.6);z-index:10001;display:flex;align-items:center;justify-content:center;';

        // 模态框
        var modal = document.createElement('div');
        modal.className = 'modal';
        modal.style.cssText = 'background:linear-gradient(135deg,#F4E3B2,#EAD5A0);color:#4A4A4A;' +
          'padding:24px;border-radius:16px;max-width:360px;width:90%;text-align:center;' +
          'box-shadow:0 16px 48px rgba(0,0,0,0.5);border:1px solid rgba(255,255,255,0.1);' +
          'animation:modalIn 0.3s ease;';

        var html = '<h3 style="margin:0 0 12px;color:#333;font-size:18px;">' + title + '</h3>' +
          '<div style="margin:0 0 20px;font-size:14px;line-height:1.6;color:#666;">' + content + '</div>';

        // 按钮
        var defaultButtons = buttons || [{ text: '确定' }];
        html += '<div style="display:flex;gap:12px;justify-content:center;">';
        defaultButtons.forEach(function (btn, index) {
          var btnStyle = btn.className || '';
          if (!btnStyle) {
            btnStyle = index === 0
              ? 'padding:10px 24px;border:none;background:linear-gradient(135deg,#c94043,#e8655a);' +
                'color:#fff;border-radius:10px;cursor:pointer;font-size:14px;font-weight:bold;'
              : 'padding:10px 24px;border:1px solid #999;background:transparent;' +
                'color:#666;border-radius:10px;cursor:pointer;font-size:14px;';
          }
          html += '<button class="modal-btn" data-index="' + index + '" style="' + btnStyle + '">' + btn.text + '</button>';
        });
        html += '</div>';

        modal.innerHTML = html;
        overlay.appendChild(modal);
        (document.getElementById('app') || document.body).appendChild(overlay);

        // 绑定按钮事件
        modal.querySelectorAll('.modal-btn').forEach(function (btn) {
          btn.addEventListener('click', function () {
            var idx = parseInt(this.getAttribute('data-index'));
            var shouldClose = true;
            if (defaultButtons[idx] && defaultButtons[idx].onClick) {
              shouldClose = defaultButtons[idx].onClick() !== false;
            }
            // 先执行回调再关闭，避免表单类内容在 onClick 中读取时已被移除
            if (shouldClose && overlay.parentNode) {
              overlay.parentNode.removeChild(overlay);
            }
            resolve(idx);
          });
        });

        // 点击遮罩关闭
        overlay.addEventListener('click', function (e) {
          if (e.target === overlay) {
            // 【Bug #11】removeChild 安全：检查 parentNode
            if (overlay.parentNode) {
              overlay.parentNode.removeChild(overlay);
            }
            resolve(-1);
          }
        });
      });
    },

    /**
     * 显示奖励弹窗（卡牌获得动画 / 成就解锁弹窗）
     * 【Bug #11 修复】removeChild 前检查 parentNode
     * @param {Object} reward - 奖励数据（卡牌对象或成就对象）
     * @returns {Promise} 关闭后 resolve
     */
    showReward: function (reward) {
      return new Promise(function (resolve) {
        // 遮罩
        var overlay = document.createElement('div');
        overlay.className = 'reward-overlay';
        overlay.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;' +
          'background:rgba(0,0,0,0.8);z-index:10002;display:flex;align-items:center;justify-content:center;';

        // 卡牌容器
        var cardContainer = document.createElement('div');
        cardContainer.className = 'reward-card';
        cardContainer.style.cssText = 'width:240px;height:340px;border-radius:16px;position:relative;' +
          'perspective:800px;animation:rewardIn 0.8s cubic-bezier(0.34,1.56,0.64,1);';

        // 获取显示数据（兼容卡牌和成就两种类型）
        var rewardColor = reward.color || '#c94043';
        var rewardEmoji = reward.beastEmoji || '';
        var rewardName = reward.beastName || '未知神兽';
        var rewardCity = reward.cityName || '';
        var rewardRegion = reward.region || '';
        var rewardDesc = reward.beastDesc || '';
        var rewardRarity = reward.rarity || '普通';
        
        var rewardImage = '';
        if (reward.cityId && window.GameData && window.GameData.cards) {
          var matchedCard = window.GameData.cards.find(function(c) { return c.cityId === reward.cityId; });
          if (matchedCard && matchedCard.image) {
            rewardImage = matchedCard.image;
          }
        }

        // 如果是成就类型，调整显示
        if (reward.type === 'achievement' && reward.data) {
          rewardEmoji = reward.data.icon || '';
          rewardName = reward.data.name || '';
          rewardDesc = reward.data.description || '';
          rewardCity = reward.data.reward ? (reward.data.reward.title || '') : '';
          rewardRarity = '成就';
          rewardColor = '#FFD700';
          rewardImage = ''; // 成就暂无图片
        }

        // 卡牌正面
        var cardFront = document.createElement('div');
        cardFront.style.cssText = 'width:100%;height:100%;border-radius:16px;padding:20px;' +
          'background:linear-gradient(135deg,' + rewardColor + ',' +
          rewardColor + '88);color:#fff;display:flex;flex-direction:column;' +
          'align-items:center;justify-content:center;text-align:center;' +
          'box-shadow:0 0 40px ' + rewardColor + '66,0 8px 32px rgba(0,0,0,0.5);' +
          'border:2px solid rgba(255,255,255,0.3);position:relative;overflow:hidden;';

        var innerHTML = '';
        if (rewardImage) {
          innerHTML += '<img src="' + rewardImage + '" style="position:absolute;top:0;left:0;width:100%;height:100%;object-fit:cover;z-index:0;opacity:0.8;">';
          innerHTML += '<div style="position:absolute;top:0;left:0;width:100%;height:100%;background:linear-gradient(180deg,transparent 0%,rgba(0,0,0,0.8) 100%);z-index:1;"></div>';
          innerHTML += '<div style="position:relative;z-index:2;display:flex;flex-direction:column;align-items:center;height:100%;justify-content:flex-end;">';
          innerHTML += '<h3 style="margin:0 0 4px;font-size:22px;text-shadow:0 2px 4px rgba(0,0,0,0.8);">' + rewardName + '</h3>';
          innerHTML += '<p style="margin:0 0 8px;font-size:12px;opacity:0.9;text-shadow:0 1px 2px rgba(0,0,0,0.8);">' + rewardCity + (rewardCity && rewardRegion ? ' \u00B7 ' : '') + rewardRegion + '</p>';
          innerHTML += '<p style="margin:0 0 12px;font-size:11px;opacity:0.85;line-height:1.5;padding:0 8px;text-shadow:0 1px 2px rgba(0,0,0,0.8);">' + rewardDesc + '</p>';
          innerHTML += '<span style="font-size:11px;padding:3px 10px;border-radius:12px;background:rgba(255,255,255,0.3);backdrop-filter:blur(4px);">' + rewardRarity + '</span>';
          innerHTML += '</div>';
        } else {
          innerHTML += '<div style="font-size:64px;margin-bottom:12px;">' + rewardEmoji + '</div>' +
          '<h3 style="margin:0 0 4px;font-size:22px;">' + rewardName + '</h3>' +
          '<p style="margin:0 0 8px;font-size:12px;opacity:0.8;">' + rewardCity + (rewardCity && rewardRegion ? ' \u00B7 ' : '') + rewardRegion + '</p>' +
          '<p style="margin:0 0 12px;font-size:11px;opacity:0.7;line-height:1.5;padding:0 8px;">' +
          rewardDesc + '</p>' +
          '<span style="font-size:11px;padding:3px 10px;border-radius:12px;' +
          'background:rgba(255,255,255,0.2);">' + rewardRarity + '</span>';
        }

        cardFront.innerHTML = innerHTML;

        cardContainer.appendChild(cardFront);
        overlay.appendChild(cardContainer);

        // 关闭按钮
        var closeBtn = document.createElement('button');
        closeBtn.textContent = '收下';
        closeBtn.style.cssText = 'margin-top:24px;padding:10px 32px;border:none;' +
          'background:linear-gradient(135deg,#d4a574,#c94043);color:#fff;border-radius:24px;' +
          'cursor:pointer;font-size:15px;font-weight:bold;box-shadow:0 4px 16px rgba(0,0,0,0.3);';
        closeBtn.addEventListener('click', function () {
          // 【Bug #11】removeChild 安全：检查 parentNode
          if (overlay.parentNode) {
            overlay.parentNode.removeChild(overlay);
          }
          resolve();
        });

        var wrapper = document.createElement('div');
        wrapper.style.cssText = 'display:flex;flex-direction:column;align-items:center;';
        wrapper.appendChild(cardContainer);
        wrapper.appendChild(closeBtn);
        overlay.appendChild(wrapper);

        (document.getElementById('app') || document.body).appendChild(overlay);

        // 点击遮罩也可关闭
        overlay.addEventListener('click', function (e) {
          if (e.target === overlay) {
            // 【Bug #11】removeChild 安全：检查 parentNode
            if (overlay.parentNode) {
              overlay.parentNode.removeChild(overlay);
            }
            resolve();
          }
        });

        console.log('[NotificationSystem] 显示奖励弹窗:', rewardName);
      });
    }
  };

  // ==================== 11. 工具函数 (Utils) ====================

  /**
   * @namespace Utils
   * @description 通用工具函数集合，提供日期格式化、距离计算、颜色获取和引文查询等功能。
   */
  var Utils = {
    /**
     * 格式化日期为中文友好格式
     * @param {Date|string} date - 日期对象或ISO字符串
     * @param {string} [format='full'] - 格式类型 'full'|'date'|'time'|'short'
     * @returns {string}
     */
    formatDate: function (date, format) {
      if (!date) return '';
      var d = typeof date === 'string' ? new Date(date) : date;
      if (isNaN(d.getTime())) return '';

      format = format || 'full';
      var year = d.getFullYear();
      var month = d.getMonth() + 1;
      var day = d.getDate();
      var hours = d.getHours();
      var minutes = d.getMinutes();
      var seconds = d.getSeconds();

      var pad = function (n) { return n < 10 ? '0' + n : '' + n; };

      switch (format) {
        case 'full':
          return year + '年' + month + '月' + day + '日 ' + pad(hours) + ':' + pad(minutes) + ':' + pad(seconds);
        case 'date':
          return year + '年' + month + '月' + day + '日';
        case 'time':
          return pad(hours) + ':' + pad(minutes) + ':' + pad(seconds);
        case 'short':
          return month + '/' + day + ' ' + pad(hours) + ':' + pad(minutes);
        default:
          return d.toLocaleString('zh-CN');
      }
    },

    /**
     * 计算两个城市之间的距离（使用 Haversine 公式）
     * 【Bug #3 修复】此方法用于替代不存在的 city.distance 字段
     * @param {string|Object} city1 - 城市ID或城市对象
     * @param {string|Object} city2 - 城市ID或城市对象
     * @returns {number} 距离（公里）
     */
    calculateDistance: function (city1, city2) {
      var cities = _getData('cities');
      if (!cities) return 0;

      // 如果传入的是ID，查找城市对象
      if (typeof city1 === 'string') {
        city1 = cities.find(function (c) { return c.id === city1; });
      }
      if (typeof city2 === 'string') {
        city2 = cities.find(function (c) { return c.id === city2; });
      }

      if (!city1 || !city2 || !city1.lat || !city1.lng || !city2.lat || !city2.lng) {
        return 0;
      }

      // Haversine 公式
      // 注意：data.js 使用相对坐标 0-100，需要转换为实际经纬度
      // lat 0 ≈ 南端（海南 18°N），lat 100 ≈ 北端（黑龙江 53°N）
      // lng 0 ≈ 西端（新疆 73°E），lng 100 ≈ 东端（黑龙江/上海 135°E）
      var lat1 = 18 + (city1.lat / 100) * 35;  // 18°N ~ 53°N
      var lng1 = 73 + (city1.lng / 100) * 62;  // 73°E ~ 135°E
      var lat2 = 18 + (city2.lat / 100) * 35;
      var lng2 = 73 + (city2.lng / 100) * 62;

      var R = 6371; // 地球半径（公里）
      var dLat = this._toRad(lat2 - lat1);
      var dLng = this._toRad(lng2 - lng1);
      var a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(this._toRad(lat1)) * Math.cos(this._toRad(lat2)) *
        Math.sin(dLng / 2) * Math.sin(dLng / 2);
      var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      return Math.round(R * c);
    },

    /**
     * 角度转弧度
     * @param {number} deg
     * @returns {number}
     */
    _toRad: function (deg) {
      return deg * Math.PI / 180;
    },

    /**
     * 获取区域对应的传统色
     * 【Bug #4 修复】使用 region ID 作为键名
     * @param {string} region - 区域ID
     * @returns {string} 十六进制颜色值
     */
    getTraditionalColor: function (region) {
      return REGION_COLORS[region] || '#888888';
    },

    /**
     * 获取神兽相关的山海经引文
     * 【Bug #5 修复】使用神兽 ID 作为键名，匹配 data.js 中的神兽数据
     * @param {string} beastId - 神兽ID
     * @returns {string} 引文文本
     */
    randomQuote: function (beastId) {
      // 【Bug #5】使用神兽 ID 查找引文
      var quotes = beastQuotes[beastId];
      if (!quotes) {
        quotes = defaultQuotes;
      }

      // 随机选取一条引文
      return quotes[Math.floor(Math.random() * quotes.length)];
    },

    /**
     * 获取神兽 emoji
     * @param {string} beastId - 神兽ID
     * @returns {string} emoji 字符
     */
    getBeastEmoji: function (beastId) {
      return BEAST_EMOJI_MAP[beastId] || '';
    }
  };

  // ==================== 引擎主入口 ====================

  /**
   * @namespace GameEngine
   * @description 游戏核心引擎主入口，协调所有子系统的工作。
   */
  var GameEngine = {
    /** @type {Object} 当前游戏状态数据 */
    _state: null,

    /** @type {boolean} 引擎是否已初始化 */
    _initialized: false,

    /** @type {boolean} 全局事件是否已注册 */
    _globalEventsRegistered: false,

    // 暴露各子系统引用
    SaveSystem: SaveSystem,
    Router: Router,
    MapSystem: MapSystem,
    CheckInSystem: CheckInSystem,
    CardSystem: CardSystem,
    AchievementSystem: AchievementSystem,
    LeaderboardSystem: LeaderboardSystem,
    Audio: AudioSystem,
    TutorialSystem: TutorialSystem,
    Notification: NotificationSystem,
    Utils: Utils,

    /**
     * 增加经验并处理升级逻辑
     * @param {number} amount 增加的经验值
     * @param {string} reason 增加经验的原因
     */
    addExp: function(amount, reason) {
      if (!this._state) return;
      var oldLevel = this._state.level || 1;
      this._state.exp = (this._state.exp || 0) + amount;
      
      var levelInfo = window.GameData.utils.calcLevel(this._state.exp);
      this._state.level = levelInfo.level;
      
      console.log('[GameEngine] 获得经验:', amount, reason, '当前总经验:', this._state.exp);
      
      if (this._state.level > oldLevel) {
        console.log('[GameEngine] 恭喜升级! Lv.' + oldLevel + ' -> Lv.' + this._state.level);
        try {
          this.Audio.playUnlockSound();
          if (window.GameUI && window.GameUI.showLevelUpAnimation) {
            window.GameUI.showLevelUpAnimation(this._state.level);
          } else {
            this.Notification.showToast('恭喜升级至 Lv.' + this._state.level + '！', 'success');
          }
        } catch(e) {
          console.error('[GameEngine] 升级展示错误:', e);
        }
      }
      this.SaveSystem.save();
    },

    /**
     * 初始化游戏引擎
     * 加载存档、初始化各子系统、启动自动保存
     */
    init: function () {
      if (this._initialized) {
        console.warn('[GameEngine] 引擎已初始化，请勿重复调用');
        return;
      }

      console.log('[GameEngine] 正在初始化...');

      // 1. 加载存档数据
      this._state = SaveSystem.load();

      // Inject custom cities from save to GameData
      if (this._state && this._state.cities && window.GameData) {
        var beasts = window.GameData.beasts;
        for (var cid in this._state.cities) {
          if (cid.startsWith('custom_')) {
            var city = this._state.cities[cid];
            // Deterministic random based on ID string
            var beastIndex = 0;
            for(var i=0; i<cid.length; i++) beastIndex += cid.charCodeAt(i);
            beastIndex = beastIndex % beasts.length;
            var randomBeast = beasts[beastIndex];
            
            // Add to GameData.cities
            if (!window.GameData.cities.find(function(c) { return c.id === cid; })) {
              window.GameData.cities.push({
                id: cid,
                name: city.name,
                province: '未知',
                region: 'zhongshan',
                lat: 50, lng: 50,
                realLat: city.lat, realLng: city.lng,
                  themeColor: '#FFD700',
                  landmark: '自定义地点',
                  accent: '#FFD700',
                  zoom: 11.8,
                  streets: '自定义足迹 / 旅行记忆',
                  detail: city.memory || '你保存的一段自定义旅行记忆。',
                  beast: randomBeast.id
              });
              
              // Add to GameData.cards
              window.GameData.cards.push({
                id: 'card_' + cid,
                cityId: cid,
                beastId: randomBeast.id,
                name: city.name + '的' + randomBeast.name,
                quote: '旅途中的奇遇。',
                rarity: randomBeast.rarity,
                frameStyle: 'wood',
                image: ''
              });
            }
          }
        }
      }

      // Backfill missing card definitions/unlocks for already completed places.
      if (this._state && this._state.cities) {
        for (var savedCityId in this._state.cities) {
          var savedCity = this._state.cities[savedCityId];
          if (savedCity && savedCity.completedAt) {
            CardSystem.ensureCardData(savedCityId);
            if (this._state.cards.indexOf(savedCityId) === -1) {
              this._state.cards.push(savedCityId);
            }
          }
        }
      }

      // 2. 同步音效设置
      if (this._state.settings) {
        AudioSystem._musicVolume = typeof this._state.settings.musicVolume === 'number' ? this._state.settings.musicVolume : 0.5;
        AudioSystem._sfxVolume = typeof this._state.settings.sfxVolume === 'number' ? this._state.settings.sfxVolume : 0.7;
        AudioSystem._muted = !!this._state.settings.muted;
      }

      // 3. 初始化路由系统
      Router.init();

      // 4. 初始化地图系统
      MapSystem.initMap();

      // 5. 启动自动保存
      SaveSystem.autoSave();

      // 6. 检查是否需要新手引导（由UI层在initUI后触发）
      // 延迟启动引导，等待UI渲染完成
      if (!this._state.tutorialComplete && typeof document !== 'undefined' && document.body) {
        setTimeout(function () {
          TutorialSystem.startTutorial();
        }, 800);
      }

      // 7. 注册全局事件
      this._registerGlobalEvents();

      this._initialized = true;

      if (this._state.settings && this._state.settings.bgmEnabled) {
        AudioSystem.playBGM();
      }

      console.log('[GameEngine] 引擎初始化完成');
      console.log('[GameEngine] 玩家:', this._state.playerName,
        '| 等级:', this._state.level,
        '| 打卡:', this._state.totalCheckIns,
        '| 卡牌:', this._state.cards.length);
    },

    /**
     * 注册全局事件监听
     */
    _registerGlobalEvents: function () {
      if (this._globalEventsRegistered) {
        return;
      }
      this._globalEventsRegistered = true;

      var self = this;

      // 页面可见性变化时保存
      document.addEventListener('visibilitychange', function () {
        if (document.hidden) {
          SaveSystem.save();
        }
      });

      // 页面关闭前保存
      window.addEventListener('beforeunload', function () {
        SaveSystem.save();
      });

      // 首次用户交互时初始化 AudioContext
      var audioInited = false;
      function initAudioOnInteraction() {
        if (!audioInited) {
          AudioSystem._initContext();
          audioInited = true;
        }
      }
      document.addEventListener('click', initAudioOnInteraction, { once: false });
      document.addEventListener('touchstart', initAudioOnInteraction, { once: false });

      // 监听自定义事件：请求保存
      document.addEventListener('requestSave', function () {
        SaveSystem.save();
      });

      // 监听自定义事件：请求重置
      document.addEventListener('requestReset', function () {
        self.Notification.showModal(
          '确认重置',
          '确定要重置所有游戏数据吗？此操作不可撤销。',
          [
            { text: '取消', onClick: function () {} },
            {
              text: '确认重置',
              onClick: function () {
                SaveSystem.reset();
                // 【Bug #9】reset 后 _initialized 已被设为 false，可以直接 init
                self.init();
                self.Router.navigateTo('splash');
              }
            }
          ]
        );
      });
    },

    /**
     * 获取当前游戏状态（只读副本）
     * @returns {Object}
     */
    getState: function () {
      return _deepClone(this._state);
    },

    /**
     * 销毁引擎，释放资源
     */
    destroy: function () {
      SaveSystem.stopAutoSave();
      AudioSystem.stopBGM();
      this._initialized = false;
      console.log('[GameEngine] 引擎已销毁');
    }
  };

  // ==================== 暴露到全局 ====================
  window.GameEngine = GameEngine;

  console.log('[engine.js] 山海经游戏引擎模块已加载');

})();
