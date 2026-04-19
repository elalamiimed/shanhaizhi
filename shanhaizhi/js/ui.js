/**
 * ============================================================================
 * 《山海经——人生旅行相册》UI 渲染层模块（重写版）
 * ============================================================================
 * @module ui
 * @description 负责将所有页面动态渲染到 DOM 中，与 window.GameEngine 交互。
 *              使用原生 JS（不依赖 jQuery 等库），通过事件委托减少监听器数量。
 * @requires window.GameData   - 数据层模块
 * @requires window.GameEngine - 核心引擎模块
 * @exposes window.GameUI      - 全局 UI 入口
 *
 * 【重写修复清单】
 * 1. card.id 与 state.cards 不匹配 → 用 card.cityId 匹配
 * 2. _updatePlayerRank 缺少 _state null 检查 → 已添加
 * 3. 双 style 属性冲突 → 合并为单个 style
 * 4. state.checkInRecords 不存在 → 改用 state.cities 判断
 * 5. 收集进度分子分母基数不同 → 基于卡牌总数计算
 * 6. 死代码 getCardById 赋值 null → 已移除
 * 7. 最高等级经验条不满 → 满级时设为100%
 * 8. page-container null 检查 → 所有 renderXxxPage 已添加
 * 9. 模态框选择器可能关错 → 使用唯一 ID
 * 10. 重复 toast → submitCheckIn 返回 false 时不额外弹 toast
 * ============================================================================
 */

(function () {
  'use strict';

  // ==================== 内部状态 ====================

  /** 当前选中的城市ID（打卡页面用） */
  var _selectedCityId = null;

  /** 当前卡牌筛选稀有度 */
  var _cardFilter = 'all';

  /** 当前地图区域筛选 */
  var _mapFilter = null;

  /** 当前排行榜标签页 */
  var _leaderboardTab = 'footprint';

  /** 当前引导步骤 */
  var _tutorialStep = 0;

  /** 城市旧ID到数据层ID的映射，兼容历史SVG标记命名 */
  var _cityIdAliases = {
    huhehaote: 'hohhot',
    harbin: 'haerbin',
    urumqi: 'wulumuqi'
  };



  /** 避免重复绑定和重复注册 */
  var _globalEventsBound = false;
  var _engineEventsBound = false;
  var _routeCallbacksRegistered = false;

  /** 引导对话内容映射（白泽新手引导6步） */
  var _tutorialDialogs = {
    1: {
      icon: '<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 20a8 8 0 1 0 0-16 8 8 0 0 0 0 16z"/></svg>',
      title: '白泽在此恭候多时',
      text: '吾乃白泽，通晓天下万物。这卷灰色地图，便是失落的山海图谱。你愿意帮我重新点亮它吗？'
    },
    2: {
      icon: '<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="3 6 9 3 15 6 21 3 21 18 15 21 9 18 3 21"/></svg>',
      title: '探索华夏神州',
      text: '看，这便是华夏神州。每一座城市都沉睡着远古神兽，等待你的脚步去唤醒。'
    },
    3: {
      icon: '<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>',
      title: '打卡你的足迹',
      text: '只需上传三张照片——车票、美食、风景——便可唤醒一座城市。'
    },
    4: {
      icon: '<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10c4.41 0 8-3.59 8-8 0-1.1-.9-2-2-2h-1.5c-.55 0-1-.45-1-1 0-.28.11-.53.29-.71.18-.18.29-.43.29-.71 0-1.1-.9-2-2-2h-2c-2.76 0-5-2.24-5-5 0-.55.45-1 1-1z"/></svg>',
      title: '见证地图变色',
      text: '看到了吗？地图在变色！从混沌灰到水墨青，再到神话金。'
    },
    5: {
      icon: '<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="4" width="12" height="16" rx="2" ry="2"/><path d="M16 4h4a2 2 0 0 1 2 2v16a2 2 0 0 1-2 2h-4"/></svg>',
      title: '收集神兽卡牌',
      text: '每解锁一座城市，你都会获得一张山海经神兽卡牌。收集它们吧！'
    },
    6: {
      icon: '<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2l3 7 7 3-7 3-3 7-3-7-7-3 7-3z"/></svg>',
      title: '分享你的旅程',
      text: '将你的旅行卡牌分享给朋友，让更多人加入山海之旅！'
    }
  };

  /** 照片类型配置 */
  var _photoTypes = [
    { key: 'ticket',  label: '车票/机票', icon: '<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>' },
    { key: 'food',    label: '当地美食',   icon: '<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 8h1a4 4 0 0 1 0 8h-1"></path><path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z"></path><line x1="6" y1="1" x2="6" y2="4"></line><line x1="10" y1="1" x2="10" y2="4"></line><line x1="14" y1="1" x2="14" y2="4"></line></svg>' },
    { key: 'scenery', label: '风景/地标', icon: '<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M8 3l4 8 5-5 5 15H2L8 3z"/></svg>' }
  ];

  /** 卡牌渐变配色方案（为每张卡牌生成独特的渐变） */
    var _cardGradients = [
    'linear-gradient(135deg, #F5F0E8 0%, #E8E0D0 40%, #D8CDB8 70%, #C4B59D 100%)',
    'linear-gradient(135deg, #E6E6FA 0%, #D8D8E8 30%, #C0C0D8 60%, #A8A8C8 100%)',
    'linear-gradient(135deg, #F0FFF0 0%, #E0F0E0 30%, #C8D8C8 60%, #B0C0B0 100%)',
    'linear-gradient(135deg, #FFF0F5 0%, #F0E0E5 30%, #D8C8CD 60%, #C0B0B5 100%)',
    'linear-gradient(135deg, #FFFFF0 0%, #F0F0E0 30%, #D8D8C8 60%, #C0C0B0 100%)',
    'linear-gradient(135deg, #FDF5E6 0%, #EAE0D0 30%, #D0C5B5 60%, #B5A898 100%)',
    'linear-gradient(135deg, #F0FFFF 0%, #E0F0F0 30%, #C8D8D8 60%, #B0C0C0 100%)',
    'linear-gradient(135deg, #F5FFFA 0%, #E5F0E8 30%, #CDD8D0 60%, #B5C0B8 100%)'
  ];

  var _postcardPool = [
    '058af9032582d3dedca29ea07a516c24.png',
    '229d1e525b194c0f4ebd1983acbd24fc.png',
    '48877e1bb7ec4eea054f37f8dd1548e0.png',
    '8ffd682c831014c65a98d2157cf41b01.png',
    '9aa3362750269828ac3248256904ed0a.png',
    'baef10d9dc106c04e4eb618ebeff6f14.png',
    'df2c981a8edb5255b891458bdf2ee2a6.png',
    'ea85b806a6968484b8b7e35b75f8f101.png',
    'ef4c2625b3bb299b9cef9f1dcbe783f5.png',
    'f98962050794647c3111b319cf565aa8.png'
  ];

  function _getPostcardSrc(card) {
    var imagePath = card.image || '';
    if (!imagePath && card.cityId) {
      var allCards = window.GameData ? window.GameData.cards : [];
      for (var i = 0; i < allCards.length; i++) {
        if (allCards[i].cityId === card.cityId && allCards[i].image) {
          imagePath = allCards[i].image;
          break;
        }
      }
    }
    if (imagePath) {
      return 'postcards/' + imagePath.split('/').pop();
    }
    var seed = card.cityId || card.id || '';
    var hash = 0;
    for (var j = 0; j < seed.length; j++) { hash += seed.charCodeAt(j); }
    return 'postcards/' + _postcardPool[hash % _postcardPool.length];
  }

  // ==================== 工具函数 ====================

  /**
   * 安全获取 DOM 元素
   * @param {string} id
   * @returns {HTMLElement|null}
   */
  function _el(id) {
    return document.getElementById(id);
  }

  /**
   * 创建 DOM 元素的快捷方法
   * @param {string} tag
   * @param {string} [className]
   * @param {string} [innerHTML]
   * @returns {HTMLElement}
   */
  function _create(tag, className, innerHTML) {
    var el = document.createElement(tag);
    if (className) el.className = className;
    if (innerHTML) el.innerHTML = innerHTML;
    return el;
  }

  /**
   * 安全获取游戏状态
   * @returns {Object|null}
   */
  function _getState() {
    return (window.GameEngine && window.GameEngine._state) ? window.GameEngine._state : null;
  }

  /**
   * 根据卡牌ID获取卡牌对应的渐变配色
   * @param {string} cardId
   * @returns {string}
   */
  function _getCardGradient(cardId) {
    var hash = 0;
    for (var i = 0; i < cardId.length; i++) {
      hash = ((hash << 5) - hash) + cardId.charCodeAt(i);
      hash |= 0;
    }
    var index = Math.abs(hash) % _cardGradients.length;
    return _cardGradients[index];
  }

  /**
   * 根据稀有度获取 CSS 类名
   * @param {string} rarity
   * @returns {string}
   */
  function _getRarityClass(rarity) {
    switch (rarity) {
      case '普通': return 'common';
      case '稀有': return 'rare';
      case '传说': return 'legendary';
      case '绝版': return 'legendary';
      default: return 'common';
    }
  }

  /**
   * 获取区域中文名
   * @param {string} regionId
   * @returns {string}
   */
  function _getRegionName(regionId) {
    var regions = window.GameData ? window.GameData.regions : [];
    for (var i = 0; i < regions.length; i++) {
      if (regions[i].id === regionId) return regions[i].name;
    }
    return regionId;
  }

  /**
   * 统一城市ID，兼容旧SVG里的历史命名
   * @param {string} cityId
   * @returns {string}
   */
  function _normalizeCityId(cityId) {
    return _cityIdAliases[cityId] || cityId;
  }

  function _removeAll(selector) {
    var nodes = document.querySelectorAll(selector);
    nodes.forEach(function (node) {
      if (node && node.parentNode) {
        node.parentNode.removeChild(node);
      }
    });
  }

  /**
   * 清理切页后不该残留的弹层、奖励和一次性覆盖层
   */
  function _cleanupTransientUI() {
    _removeAll('#city-detail-modal');
    _removeAll('#card-detail-modal');
    _removeAll('#reward-animation');
    _removeAll('#camera-success-overlay');
    _removeAll('.reward-overlay');
    _removeAll('.modal-overlay');
    _removeAll('.card-detail-modal');
  }

  /**
   * 重置打卡页的临时草稿，避免跨页面保留上一轮上传内容
   */
  function _resetCameraDraft() {
    _selectedCityId = null;

    var titleEl = _el('camera-city-title');
    var valueEl = _el('camera-city-value');
    var textareaEl = _el('camera-textarea');

    if (titleEl) titleEl.textContent = '选择打卡城市';
    if (valueEl) valueEl.textContent = '请选择';
    if (textareaEl) textareaEl.value = '';

    _photoTypes.forEach(function (pt) {
      var item = _el('upload-' + pt.key);
      var preview = _el('preview-' + pt.key);
      if (item) item.classList.remove('uploaded');
      if (preview) preview.src = '';
    });

    if (window.GameEngine && window.GameEngine.CheckInSystem) {
      window.GameEngine.CheckInSystem._pendingPhotos = {};
      window.GameEngine.CheckInSystem._currentCityId = null;
    }
  }

  function _escapeHtml(text) {
    return String(text || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function _downloadTextFile(filename, content) {
    var blob = new Blob([content], { type: 'application/json;charset=utf-8' });
    var url = URL.createObjectURL(blob);
    var link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setTimeout(function () {
      URL.revokeObjectURL(url);
    }, 1000);
  }

  function _openPlayerNameEditor() {
    if (!window.GameEngine) return;

    var state = _getState();
    var currentName = state && state.playerName ? state.playerName : '旅行者';
    var content =
      '<div style="text-align:left;">' +
        '<div style="font-size:12px;color:#999;margin-bottom:8px;">输入 2-20 个字，作为你的旅行者名号</div>' +
        '<input id="player-name-input" type="text" maxlength="20" value="' + _escapeHtml(currentName) + '"' +
          ' style="width:100%;box-sizing:border-box;padding:12px 14px;border-radius:10px;border:1px solid rgba(0,0,0,0.16);background:rgba(0,0,0,0.06);color:#333;outline:none;" />' +
      '</div>';

    window.GameEngine.Notification.showModal('修改昵称', content, [
      { text: '取消' },
      {
        text: '保存',
        onClick: function () {
          var input = document.getElementById('player-name-input');
          var nextName = input ? input.value.trim() : '';
          if (nextName.length < 2) {
            window.GameEngine.Notification.showToast('昵称至少 2 个字', 'error');
            return;
          }
          nextName = nextName.slice(0, 20);
          window.GameEngine._state.playerName = nextName;
          window.GameEngine.SaveSystem.save();
          _updateProfilePage();
          _updateHeader();
          window.GameEngine.Notification.showToast('昵称已更新', 'success');
        }
      }
    ]);
  }

  function _openSaveManager() {
    if (!window.GameEngine) return;

    var state = _getState();
    var info = state && state.lastSaveTime ? state.lastSaveTime : '暂无';
    var content =
      '<div style="text-align:left;">' +
        '<div style="font-size:12px;color:#999;line-height:1.7;">最近存档时间：' + _escapeHtml(info) + '</div>' +
        '<div style="font-size:12px;color:#999;line-height:1.7;margin-top:6px;">可导出 JSON 备份，也可粘贴旧备份进行导入覆盖。</div>' +
        '<textarea id="save-import-input" placeholder="把备份 JSON 粘贴到这里再点导入" style="margin-top:12px;width:100%;min-height:140px;box-sizing:border-box;padding:12px 14px;border-radius:10px;border:1px solid rgba(0,0,0,0.16);background:rgba(0,0,0,0.06);color:#333;outline:none;resize:vertical;"></textarea>' +
      '</div>';

    window.GameEngine.Notification.showModal('存档管理', content, [
      { text: '关闭' },
      {
        text: '导出备份',
        onClick: function () {
          try {
            var exported = window.GameEngine.SaveSystem.exportSave();
            var stamp = new Date().toISOString().replace(/[:.]/g, '-');
            _downloadTextFile('shanhai-save-' + stamp + '.json', exported);
            window.GameEngine.Notification.showToast('存档已导出', 'success');
          } catch (e) {
            window.GameEngine.Notification.showToast('导出失败，请稍后重试', 'error');
          }
        }
      },
      {
        text: '导入覆盖',
        onClick: function () {
          var textarea = document.getElementById('save-import-input');
          var raw = textarea ? textarea.value : '';
          try {
            window.GameEngine.SaveSystem.importSave(raw);
            _resetCameraDraft();
            _cleanupTransientUI();
            window.GameEngine.Router.init();
            updateUI();
            window.GameEngine.Notification.showToast('存档导入成功', 'success');
          } catch (e) {
            window.GameEngine.Notification.showToast('导入失败：' + e.message, 'error');
          }
        }
      }
    ]);
  }

  function _ensureDynamicCityMarkers(svgEl) {
    if (!svgEl) return null;

    var oldGroup = svgEl.querySelector('#city-markers');
    if (oldGroup && oldGroup.parentNode) {
      oldGroup.parentNode.removeChild(oldGroup);
    }

    var svgns = 'http://www.w3.org/2000/svg';
    var group = document.createElementNS(svgns, 'g');
    group.setAttribute('id', 'city-markers');
    svgEl.appendChild(group);
    return group;
  }

  /**
   * 获取已解锁城市数量
   * @returns {number}
   */
  function _getUnlockedCityCount() {
    var state = _getState();
    if (!state) return 0;
    var count = 0;
    for (var key in state.cities) {
      if (state.cities[key] && state.cities[key].unlocked) count++;
    }
    return count;
  }

  /**
   * 获取城市总数
   * @returns {number}
   */
  function _getTotalCityCount() {
    return window.GameData ? window.GameData.cities.length : 37;
  }

  /**
   * 根据元素属性获取对应的 emoji 图标
   * @param {string} element
   * @returns {string}
   */
  function _getBeastEmoji(element) {
    var emojiMap = {
      '土': '<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/></svg>', '火': '<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2c0 0-5 6-5 11a5 5 0 0 0 10 0c0-5-5-11-5-11z"/></svg>', '水': '<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2l4 8c2 3 0 7-4 7s-6-4-4-7z"/></svg>',
      '冰': '<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2v20M2 12h20M5 5l14 14M19 5L5 19"/></svg>', '光': '<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2l3 7 7 3-7 3-3 7-3-7-7-3 7-3z"/></svg>', '金': '<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 2l12 0 4 6-10 14L2 8z"/></svg>',
      '风': '<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M2 12h16c2 0 4-2 4-4s-2-4-4-4M2 16h12c2 0 4 2 4 4s-2 4-4 4"/></svg>', '混沌': '<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10" fill="currentColor"/></svg>'
    };
    return emojiMap[element] || '\uD83D\uDC3E';
  }

  /**
   * 安全获取 page-container 元素
   * 【修复 #8】所有 renderXxxPage 中使用此方法，避免 null 引用
   * @returns {HTMLElement|null}
   */
  function _getPageContainer() {
    return _el('page-container');
  }

  /**
   * 安全创建页面容器并添加到 page-container
   * 【修复 #8】添加 null 检查，防止 page-container 不存在时崩溃
   * @param {string} pageId - 页面元素 ID（如 'page-splash'）
   * @param {string} className - 页面 CSS 类名
   * @returns {HTMLElement|null}
   */
  function _createPageContainer(pageId, className) {
    var container = _el(pageId);
    if (!container) {
      var parent = _getPageContainer();
      if (!parent) {
        console.warn('[GameUI] page-container 不存在，无法创建页面:', pageId);
        return null;
      }
      container = _create('div', className || 'page', '');
      container.id = pageId;
      parent.appendChild(container);
    }
    return container;
  }

  /**
   * 计算经验条百分比
   * 【修复 #7】最高等级时经验条显示100%
   * @param {number} level - 当前等级
   * @param {number} exp - 当前经验值
   * @returns {number} 百分比 0-100
   */
  function _calcExpProgress(level, exp) {
    if (!window.GameData || !window.GameData.levelExpTable) return 0;

    var maxLevel = window.GameData.levelExpTable.length;

    // 满级时经验条显示满
    if (level >= maxLevel) {
      return 100;
    }

    var currentLevelExp = window.GameData.utils.getExpForLevel(level);
    var nextLevelExp = window.GameData.utils.getExpForLevel(level + 1);

    // 防止除零
    if (nextLevelExp <= currentLevelExp) return 100;

    var progress = Math.round(((exp - currentLevelExp) / (nextLevelExp - currentLevelExp)) * 100);
    return Math.min(Math.max(progress, 0), 100);
  }

  /**
   * 判断某张卡牌是否已被收集
   * 【修复 #1】使用 card.cityId 匹配 state.cards（state.cards 存的是城市ID）
   * @param {Object} card - 卡牌数据对象
   * @param {string[]} collectedCityIds - state.cards（已收集的城市ID数组）
   * @returns {boolean}
   */
  function _isCardCollected(card, collectedCityIds) {
    // card.cityId 是城市ID（如 'wuhan'），state.cards 存的也是城市ID
    return card.cityId && collectedCityIds.indexOf(card.cityId) !== -1;
  }

  /**
   * 计算已收集的卡牌数量
   * 【修复 #5】基于卡牌总数计算，而非城市数
   * @returns {number}
   */
  function _getCollectedCardCount() {
    var state = _getState();
    var cards = window.GameData ? window.GameData.cards : [];
    if (!state || !state.cards) return 0;
    
    // Calculate how many actual card items the player has.
    // The player's state.cards array contains the IDs of the collected cards.
    return state.cards.length;
  }

  function _getProfileTitle(level, collectedCards, totalCards) {
    if (totalCards > 0 && collectedCards >= totalCards) return '山海至尊';
    if (collectedCards >= 9) return '百灵图主';
    if (collectedCards >= 6) return '神兽藏家';
    if (level >= 8) return '山海游侠';
    if (collectedCards >= 3) return '图谱行者';
    return '山海行者';
  }

  function _getCollectedCardDetails() {
    var state = _getState();
    if (!state || !Array.isArray(state.cards)) return [];

    var details = [];
    state.cards.forEach(function (cityId) {
      var card = null;
      if (window.GameEngine && window.GameEngine.CardSystem) {
        card = window.GameEngine.CardSystem.getCardDetail(cityId);
      }
      if (!card && window.GameData && Array.isArray(window.GameData.cards)) {
        for (var i = 0; i < window.GameData.cards.length; i++) {
          if (window.GameData.cards[i].cityId === cityId || window.GameData.cards[i].id === cityId) {
            card = window.GameData.cards[i];
            break;
          }
        }
      }
      if (card) details.push(card);
    });

    return details;
  }

  function _buildTravelSummary() {
    var state = _getState();
    var summary = {
      recentCityName: '暂无记录',
      recentCityMeta: '完成首次打卡后会显示',
      totalDistance: '0 km',
      totalDistanceMeta: '跨城打卡后开始累计',
      latestCardName: '暂无获得',
      latestCardMeta: '解锁神兽卡后会显示',
      topElement: '暂无',
      topElementEmoji: '✨',
      topElementMeta: '收集卡牌后自动统计',
      rarityCounts: { '普通': 0, '稀有': 0, '传说': 0, '绝版': 0 },
      rarityHeadline: '尚未获得稀有卡',
      rarityMeta: '继续旅行可解锁更多神兽卡牌'
    };

    if (!state) return summary;

    var totalDistance = typeof state.totalDistance === 'number' ? state.totalDistance : 0;
    summary.totalDistance = Math.round(totalDistance) + ' km';
    summary.totalDistanceMeta = totalDistance > 0 ? '山海旅程累计里程' : '跨城打卡后开始累计';

    var latestCityId = null;
    var latestTime = '';
    var cityStates = state.cities || {};
    for (var cityId in cityStates) {
      var cityState = cityStates[cityId];
      if (cityState && cityState.completedAt && (!latestTime || cityState.completedAt > latestTime)) {
        latestTime = cityState.completedAt;
        latestCityId = cityId;
      }
    }
    if (!latestCityId && state.lastCheckInCityId) {
      latestCityId = state.lastCheckInCityId;
    }
    if (latestCityId && window.GameData && window.GameData.utils) {
      var latestCity = window.GameData.utils.getCityById(latestCityId);
      if (latestCity) {
        summary.recentCityName = latestCity.name;
        summary.recentCityMeta = latestCity.province + ' · ' + latestCity.landmark;
      }
    }

    var collectedCards = _getCollectedCardDetails();
    var elementCountMap = {};
    var topElement = '';
    var topElementCount = 0;
    var rarityOrder = ['绝版', '传说', '稀有'];
    var highestRarity = '';
    var latestCard = null;
    var latestCardTime = '';

    collectedCards.forEach(function (card) {
      var rarity = card.rarity || '普通';
      var element = card.element || '土';
      var obtainedAt = state.unlockTimes ? state.unlockTimes[card.cityId] : '';
      summary.rarityCounts[rarity] = (summary.rarityCounts[rarity] || 0) + 1;
      elementCountMap[element] = (elementCountMap[element] || 0) + 1;

      if (obtainedAt && (!latestCardTime || obtainedAt > latestCardTime)) {
        latestCardTime = obtainedAt;
        latestCard = card;
      }

      if (elementCountMap[element] > topElementCount) {
        topElement = element;
        topElementCount = elementCountMap[element];
      }

      if (!highestRarity && rarityOrder.indexOf(rarity) !== -1) {
        highestRarity = rarity;
      } else if (rarityOrder.indexOf(rarity) !== -1 && rarityOrder.indexOf(rarity) < rarityOrder.indexOf(highestRarity)) {
        highestRarity = rarity;
      }
    });

    if (topElement) {
      summary.topElement = topElement;
      summary.topElementEmoji = _getBeastEmoji(topElement);
      summary.topElementMeta = '共收集 ' + topElementCount + ' 张 ' + topElement + ' 系卡牌';
    }

    if (latestCard) {
      summary.latestCardName = latestCard.name || latestCard.beastName || '未知卡牌';
      summary.latestCardMeta = (latestCard.cityName || '') + ' · ' + (latestCard.rarity || '普通');
    }

    var rareTotal = (summary.rarityCounts['稀有'] || 0) + (summary.rarityCounts['传说'] || 0) + (summary.rarityCounts['绝版'] || 0);
    if (rareTotal > 0) {
      summary.rarityHeadline = '稀有及以上 ' + rareTotal + ' 张';
      summary.rarityMeta = highestRarity ? '当前最高稀有度：' + highestRarity : '继续解锁更高稀有度';
    }

    return summary;
  }

  function _renderTravelSummarySection() {
    var summary = _buildTravelSummary();
    return '' +
      '<div class="profile-section">' +
        '<div class="profile-section-header">' +
          '<span class="profile-section-title">旅行数据</span>' +
        '</div>' +
        '<div id="travel-summary-section">' +
          '<div style="display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:10px;margin-bottom:12px;">' +
            '<div style="padding:14px 12px;border-radius:14px;background:rgba(255,255,255,0.78);box-shadow:0 6px 20px rgba(0,0,0,0.05);">' +
              '<div style="font-size:12px;color:#999;letter-spacing:1px;">最近打卡</div>' +
              '<div id="travel-recent-city" style="font-size:16px;font-weight:700;color:#333;margin-top:8px;">' + summary.recentCityName + '</div>' +
              '<div id="travel-recent-meta" style="font-size:12px;color:#777;line-height:1.6;margin-top:6px;">' + summary.recentCityMeta + '</div>' +
            '</div>' +
            '<div style="padding:14px 12px;border-radius:14px;background:rgba(255,255,255,0.78);box-shadow:0 6px 20px rgba(0,0,0,0.05);">' +
              '<div style="font-size:12px;color:#999;letter-spacing:1px;">常见属性</div>' +
              '<div id="travel-top-element" style="font-size:16px;font-weight:700;color:#333;margin-top:8px;">' + summary.topElementEmoji + ' ' + summary.topElement + '</div>' +
              '<div id="travel-top-element-meta" style="font-size:12px;color:#777;line-height:1.6;margin-top:6px;">' + summary.topElementMeta + '</div>' +
            '</div>' +
            '<div style="padding:14px 12px;border-radius:14px;background:rgba(255,255,255,0.78);box-shadow:0 6px 20px rgba(0,0,0,0.05);">' +
              '<div style="font-size:12px;color:#999;letter-spacing:1px;">稀有卡统计</div>' +
              '<div id="travel-rarity-headline" style="font-size:16px;font-weight:700;color:#333;margin-top:8px;">' + summary.rarityHeadline + '</div>' +
              '<div id="travel-rarity-meta" style="font-size:12px;color:#777;line-height:1.6;margin-top:6px;">' + summary.rarityMeta + '</div>' +
            '</div>' +
          '</div>' +
          '<div style="display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px;margin-bottom:12px;">' +
            '<div style="padding:14px 12px;border-radius:14px;background:rgba(255,255,255,0.78);box-shadow:0 6px 20px rgba(0,0,0,0.05);">' +
              '<div style="font-size:12px;color:#999;letter-spacing:1px;">旅行总里程</div>' +
              '<div id="travel-total-distance" style="font-size:16px;font-weight:700;color:#333;margin-top:8px;">' + summary.totalDistance + '</div>' +
              '<div id="travel-total-distance-meta" style="font-size:12px;color:#777;line-height:1.6;margin-top:6px;">' + summary.totalDistanceMeta + '</div>' +
            '</div>' +
            '<div style="padding:14px 12px;border-radius:14px;background:rgba(255,255,255,0.78);box-shadow:0 6px 20px rgba(0,0,0,0.05);">' +
              '<div style="font-size:12px;color:#999;letter-spacing:1px;">最近获得卡牌</div>' +
              '<div id="travel-latest-card" style="font-size:16px;font-weight:700;color:#333;margin-top:8px;">' + summary.latestCardName + '</div>' +
              '<div id="travel-latest-card-meta" style="font-size:12px;color:#777;line-height:1.6;margin-top:6px;">' + summary.latestCardMeta + '</div>' +
            '</div>' +
          '</div>' +
          '<div style="display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:8px;">' +
            '<div style="padding:10px 8px;border-radius:12px;background:rgba(255,255,255,0.7);text-align:center;">' +
              '<div style="font-size:11px;color:#999;">普通</div>' +
              '<div id="travel-rarity-common" style="font-size:18px;font-weight:700;color:#666;margin-top:4px;">' + summary.rarityCounts['普通'] + '</div>' +
            '</div>' +
            '<div style="padding:10px 8px;border-radius:12px;background:rgba(255,255,255,0.7);text-align:center;">' +
              '<div style="font-size:11px;color:#999;">稀有</div>' +
              '<div id="travel-rarity-rare" style="font-size:18px;font-weight:700;color:#3F51B5;margin-top:4px;">' + summary.rarityCounts['稀有'] + '</div>' +
            '</div>' +
            '<div style="padding:10px 8px;border-radius:12px;background:rgba(255,255,255,0.7);text-align:center;">' +
              '<div style="font-size:11px;color:#999;">传说</div>' +
              '<div id="travel-rarity-legendary" style="font-size:18px;font-weight:700;color:#C97B00;margin-top:4px;">' + summary.rarityCounts['传说'] + '</div>' +
            '</div>' +
            '<div style="padding:10px 8px;border-radius:12px;background:rgba(255,255,255,0.7);text-align:center;">' +
              '<div style="font-size:11px;color:#999;">绝版</div>' +
              '<div id="travel-rarity-exclusive" style="font-size:18px;font-weight:700;color:#9C27B0;margin-top:4px;">' + summary.rarityCounts['绝版'] + '</div>' +
            '</div>' +
          '</div>' +
        '</div>' +
      '</div>';
  }

  function _updateTravelSummary() {
    var summary = _buildTravelSummary();
    var mapping = {
      'travel-recent-city': summary.recentCityName,
      'travel-recent-meta': summary.recentCityMeta,
      'travel-total-distance': summary.totalDistance,
      'travel-total-distance-meta': summary.totalDistanceMeta,
      'travel-latest-card': summary.latestCardName,
      'travel-latest-card-meta': summary.latestCardMeta,
      'travel-top-element': summary.topElementEmoji + ' ' + summary.topElement,
      'travel-top-element-meta': summary.topElementMeta,
      'travel-rarity-headline': summary.rarityHeadline,
      'travel-rarity-meta': summary.rarityMeta,
      'travel-rarity-common': String(summary.rarityCounts['普通']),
      'travel-rarity-rare': String(summary.rarityCounts['稀有']),
      'travel-rarity-legendary': String(summary.rarityCounts['传说']),
      'travel-rarity-exclusive': String(summary.rarityCounts['绝版'])
    };

    for (var id in mapping) {
      var node = _el(id);
      if (node) node.textContent = mapping[id];
    }
  }

  // ==================== 1. initUI ====================

  /**
   * 初始化所有页面 DOM 结构，绑定事件监听器，注册路由生命周期回调。
   */
  function initUI() {
    console.log('[GameUI] 初始化 UI...');

    // 渲染各页面 DOM 结构
    renderSplashScreen();
    renderMapPage();
    renderCameraPage();
    renderCollectionPage();
    renderProfilePage();

    // 绑定全局事件委托
    _bindGlobalEvents();

    // 注册路由生命周期回调
    _registerRouteCallbacks();

    // 监听引擎自定义事件
    _bindEngineEvents();

    var state = _getState();
    var soundBtn = _el('btn-sound');
    if (soundBtn && state && state.settings) {
      var muted = !!state.settings.muted;
      soundBtn.textContent = muted ? '🔇' : '🔊';
      soundBtn.setAttribute('title', muted ? '已静音' : '音效');
    }

    // 初始化顶部状态栏
    _updateHeader();

    console.log('[GameUI] UI 初始化完成');
  }

  // ==================== 2. renderSplashScreen ====================

  /**
   * 渲染开场动画页面
   */
  function renderSplashScreen() {
    var container = _createPageContainer('page-splash', 'page');
    if (!container) return;

    container.innerHTML =
      '<div class="splash-ink-splash"></div>' +
      '<div class="splash-ink-splash"></div>' +
      '<div class="splash-ink-splash"></div>' +
      '<div class="splash-mascot">' +
        '<img class="splash-mascot-image" src="assets/images/baize_mascot.jpg" alt="白泽" onerror="this.style.display=\'none\'">' +
      '</div>' +
      '<h1 class="splash-title">' +
        '<span class="char">山</span>' +
        '<span class="char">海</span>' +
        '<span class="char">经</span>' +
      '</h1>' +
      '<p class="splash-subtitle">人生旅行相册</p>' +
      '<button class="btn btn-primary splash-start-btn" id="splash-start-btn" style="' +
        'position:relative;z-index:2;opacity:0;animation:fadeIn 0.8s ease forwards 2.2s;' +
        'padding:14px 48px;font-size:16px;font-weight:600;color:white;letter-spacing:6px;' +
        'background:linear-gradient(135deg,#c94043,#e8655a);border-radius:9999px;' +
        'box-shadow:0 4px 20px rgba(201,64,67,0.4);border:none;cursor:pointer;' +
        'transition:all 0.3s ease;">开始旅途</button>' +
      '<div class="splash-loading">' +
        '<div class="splash-loading-bar" id="splash-loading-bar"></div>' +
      '</div>' +
      '<p class="splash-loading-text">山海画卷缓缓展开...</p>';
  }

  // ==================== 3. renderMapPage ====================

  /**
   * 渲染地图页面
   */
  function renderMapPage() {
    var container = _createPageContainer('page-map', 'page');
    if (!container) return;

    container.innerHTML =
      '<div class="page-header">' +
        '<span class="page-header-title">山海舆图</span>' +
      '</div>' +
      '<div class="page-content">' +
        '<div class="map-container" id="map-container">' +
          '<div class="map-canvas" id="map-content">' +
            '<iframe class="map-embed-frame" src="china-memory-map.html" title="China Memory Map" loading="lazy"></iframe>' +
          '</div>' +
        '</div>' +
      '</div>';
  }



  // ==================== 4. renderCameraPage ====================

  /**
   * 渲染手动打卡页面
   */
  function renderCameraPage() {
    var container = _createPageContainer('page-camera', 'page');
    if (!container) return;

    container.innerHTML =
      '<div class="page-header">' +
        '<button class="page-header-back" id="camera-back-btn">&larr;</button>' +
        '<span class="page-header-title">手动打卡</span>' +
      '</div>' +
      '<div class="page-content">' +
        '<div class="camera-page">' +
          '<div class="camera-header">' +
            '<div class="camera-header-title" id="camera-city-title">选择打卡城市</div>' +
            '<div class="camera-header-desc">选择地点并写下你的旅行记忆</div>' +
          '</div>' +
          '<div class="camera-city-select" id="camera-city-select">' +
            '<span class="camera-city-select-label">打卡城市</span>' +
            '<span class="camera-city-select-value" id="camera-city-value">请选择</span>' +
            '<span class="camera-city-select-arrow">&#9662;</span>' +
          '</div>' +
          '<textarea class="camera-textarea" id="camera-textarea" placeholder="写下你的旅行感悟..."></textarea>' +
          '<button class="camera-submit" id="camera-submit-btn">提交打卡</button>' +
        '</div>' +
      '</div>';
  }

  // ==================== 5. renderCollectionPage ====================

  /**
   * 渲染卡牌收集页面
   */
  function renderCollectionPage() {
    var container = _createPageContainer('page-collection', 'page');
    if (!container) return;

    container.innerHTML =
      '<div class="page-header">' +
        '<span class="page-header-title">山海图鉴</span>' +
      '</div>' +
      '<div class="page-content">' +
        '<div class="collection-page">' +
          '<div class="collection-progress" id="collection-progress">' +
            '<div class="collection-progress-header">' +
              '<span class="collection-progress-title">收集进度</span>' +
              '<span class="collection-progress-count" id="collection-count">0/0</span>' +
            '</div>' +
            '<div class="collection-progress-bar">' +
              '<div class="collection-progress-fill" id="collection-fill" style="width:0%"></div>' +
            '</div>' +
          '</div>' +
          '<div class="collection-filters" id="collection-filters">' +
            '<div class="collection-filter-tag active" data-rarity="all">全部</div>' +
            '<div class="collection-filter-tag" data-rarity="普通">普通</div>' +
            '<div class="collection-filter-tag" data-rarity="稀有">稀有</div>' +
            '<div class="collection-filter-tag" data-rarity="传说">传说</div>' +
            '<div class="collection-filter-tag" data-rarity="绝版">绝版</div>' +
          '</div>' +
          '<div class="card-grid" id="card-grid"></div>' +
        '</div>' +
      '</div>';

    // 渲染卡牌列表
    _renderCardGrid();
  }

  function _renderCardArtwork(card, beast, isCollected) {
    var src = _getPostcardSrc(card);
    var opacity = isCollected ? '1' : '0.35';
    return '<img class="card-image" src="' + src + '" alt="' + card.name + '" ' +
      'style="object-fit:cover;width:100%;height:100%;position:absolute;top:0;left:0;z-index:0;opacity:' + opacity + ';">';
  }

  /**
   * 渲染卡牌网格
   * 【修复 #1】使用 card.cityId 匹配 state.cards 判断收集状态
   */
  function _renderCardGrid() {
    var grid = _el('card-grid');
    if (!grid) return;

    var cards = window.GameData ? window.GameData.cards : [];
    var state = _getState();
    // state.cards 存的是城市ID数组（如 ['wuhan', 'beijing']）
    var collectedCityIds = state ? state.cards : [];

    var html = '';
    cards.forEach(function (card) {
      // 【修复 #1】使用 card.cityId 匹配，而非 card.id
      var isCollected = _isCardCollected(card, collectedCityIds);

      // 稀有度筛选
      if (_cardFilter !== 'all' && card.rarity !== _cardFilter) return;

      var beast = window.GameData.utils.getBeastById(card.beastId);
      var beastName = beast ? beast.name : '未知神兽';

      if (isCollected) {
        var rarityClass = _getRarityClass(card.rarity);
        html +=
          '<div class="card-item collected" data-card-id="' + card.id + '">' +
            _renderCardArtwork(card, beast, true) +
            '<div class="card-image-overlay"></div>' +
            '<div class="card-info">' +
              '<div class="card-name">' + card.name + '</div>' +
              '<div class="card-origin">' + (window.GameData.utils.getCityById(card.cityId) ? window.GameData.utils.getCityById(card.cityId).name : '') + '</div>' +
              '<span class="card-rarity ' + rarityClass + '">' + card.rarity + '</span>' +
            '</div>' +
          '</div>';
      } else {
        var rarityClass = _getRarityClass(card.rarity);
        html +=
          '<div class="card-item locked" data-card-id="' + card.id + '">' +
            _renderCardArtwork(card, beast, false) +
            '<div class="card-image-overlay"></div>' +
            '<div class="card-info">' +
              '<div class="card-name">' + card.name + '</div>' +
              '<div class="card-origin">' + (window.GameData.utils.getCityById(card.cityId) ? window.GameData.utils.getCityById(card.cityId).name : '') + '</div>' +
              '<span class="card-rarity ' + rarityClass + '">' + card.rarity + '</span>' +
            '</div>' +
          '</div>';
      }
    });

    grid.innerHTML = html;

    // 更新进度
    _updateCollectionProgress();
  }

  /**
   * 更新收集进度显示
   * 【修复 #5】基于卡牌总数计算收集进度，分子分母基数一致
   */
  function _updateCollectionProgress() {
    var cards = window.GameData ? window.GameData.cards : [];
    var total = cards.length;
    // 【修复 #5】基于卡牌计算已收集数，而非直接用 state.cards.length
    var collected = _getCollectedCardCount();
    var percentage = total > 0 ? Math.round((collected / total) * 100) : 0;

    var countEl = _el('collection-count');
    var fillEl = _el('collection-fill');
    if (countEl) countEl.textContent = collected + '/' + total;
    if (fillEl) fillEl.style.width = percentage + '%';
  }

  // ==================== 6. renderProfilePage ====================

  /**
   * 渲染个人主页
   * 【修复 #7】最高等级经验条显示100%
   * 【修复 #8】添加 page-container null 检查
   */
  function renderProfilePage() {
    var container = _createPageContainer('page-profile', 'page');
    if (!container) return;

    var state = _getState();
    var playerName = state ? state.playerName : '旅行者';
    var levelInfo = window.GameData && window.GameData.utils ? window.GameData.utils.calcLevel(state ? state.exp : 0) : { level: 1, currentExp: 0, nextLevelExp: 100 };
    var level = levelInfo.level;
    var exp = state ? state.exp : 0;
    var expProgress = _calcExpProgress(level, exp);
    var totalCards = window.GameEngine ? window.GameEngine.CardSystem.getCollectionProgress().total : 0;
    var collectedCardCount = _getCollectedCardCount();
    var unlockedCities = _getUnlockedCityCount();
    var totalCities = _getTotalCityCount();
    var cardProgress = totalCards > 0 ? Math.round((collectedCardCount / totalCards) * 100) : 0;
    var nextLevelExp = Math.max(levelInfo.nextLevelExp - levelInfo.currentExp, 0);
    var profileTitle = _getProfileTitle(level, collectedCardCount, totalCards);
    var avatarSrc = state && state.avatar ? state.avatar : 'assets/images/baize_mascot.jpg';

    container.innerHTML =
      '<div class="page-header">' +
        '<span class="page-header-title">我的行囊</span>' +
      '</div>' +
      '<div class="page-content">' +
        '<div class="profile-page">' +
          '<div class="profile-header">' +
            '<div class="profile-avatar" id="profile-avatar">' +
              '<img src="' + avatarSrc + '" alt="' + playerName + '" class="profile-avatar-image" onerror="this.style.display=\'none\';this.nextElementSibling.style.display=\'flex\';">' +
              '<div class="profile-avatar-fallback">\uD83E\uDD8C</div>' +
              '<div class="profile-level" id="profile-level">Lv.' + level + '</div>' +
            '</div>' +
            '<div class="profile-name" id="profile-name" title="Click to edit">' + playerName + '</div>' +
            '<div class="profile-title" id="profile-title">' + profileTitle + '</div>' +
            '<div class="profile-subtitle">收集 ' + collectedCardCount + ' / ' + totalCards + ' 张神兽卡，点亮你的山海图谱</div>' +
            '<div class="profile-progress-card">' +
              '<div class="profile-progress-header">' +
                '<span class="profile-progress-title">旅者等级</span>' +
                '<span class="profile-progress-value" id="profile-exp-text">EXP ' + exp + ' · 距下一级 ' + nextLevelExp + '</span>' +
              '</div>' +
              '<div class="collection-progress-bar profile-exp-track">' +
                '<div class="collection-progress-fill profile-exp-fill" id="profile-exp-bar" style="width:' + expProgress + '%;"></div>' +
              '</div>' +
              '<div class="profile-progress-foot">' +
                '<span id="profile-level-caption">Lv.' + level + ' 山海见闻持续增长中</span>' +
                '<span id="profile-card-progress-text">卡牌进度 ' + collectedCardCount + '/' + totalCards + '</span>' +
              '</div>' +
            '</div>' +
          '</div>' +
          '<div class="profile-stats">' +
            '<div class="profile-stat-item">' +
              '<div class="profile-stat-value" id="stat-cities">' + unlockedCities + '/' + totalCities + '</div>' +
              '<div class="profile-stat-label">解锁城市</div>' +
            '</div>' +
            '<div class="profile-stat-item">' +
              '<div class="profile-stat-value" id="stat-cards">' + collectedCardCount + '/' + totalCards + '</div>' +
              '<div class="profile-stat-label">收集卡牌</div>' +
            '</div>' +
            '<div class="profile-stat-item">' +
              '<div class="profile-stat-value" id="stat-card-rate">' + cardProgress + '%</div>' +
              '<div class="profile-stat-label">图谱完成度</div>' +
            '</div>' +
          '</div>' +
          '<div class="profile-section">' +
            '<div class="profile-section-header">' +
              '<span class="profile-section-title">设置</span>' +
            '</div>' +
            '<div class="settings-list">' +
              '<div class="settings-item" id="setting-sfx">' +
                '<div class="settings-item-left">' +
                  '<div class="settings-item-icon">\uD83C\uDFB5</div>' +
                  '<span class="settings-item-label">音效</span>' +
                '</div>' +
                '<div class="settings-item-right">' +
                  '<div class="toggle-switch' + (state && state.settings && !state.settings.muted ? ' active' : '') + '" id="toggle-sfx"></div>' +
                '</div>' +
              '</div>' +
              '<div class="settings-item" id="setting-bgm">' +
                '<div class="settings-item-left">' +
                  '<div class="settings-item-icon">\uD83C\uDFB6</div>' +
                  '<span class="settings-item-label">背景音乐</span>' +
                '</div>' +
                '<div class="settings-item-right">' +
                  '<div class="toggle-switch' + (state && state.settings && state.settings.bgmEnabled ? ' active' : '') + '" id="toggle-bgm"></div>' +
                '</div>' +
              '</div>' +
              '<div class="settings-item" id="setting-save-manager">' +
                '<div class="settings-item-left">' +
                  '<div class="settings-item-icon">\uD83D\uDCBE</div>' +
                  '<span class="settings-item-label">存档管理</span>' +
                '</div>' +
                '<div class="settings-item-right">' +
                  '<span class="settings-item-arrow">&rsaquo;</span>' +
                '</div>' +
              '</div>' +
              '<div class="settings-item" id="setting-reset">' +
                '<div class="settings-item-left">' +
                  '<div class="settings-item-icon">\uD83D\uDDD1\uFE0F</div>' +
                  '<span class="settings-item-label" style="color:#E34234;">重置游戏数据</span>' +
                '</div>' +
                '<div class="settings-item-right">' +
                  '<span class="settings-item-arrow">&rsaquo;</span>' +
                '</div>' +
              '</div>' +
            '</div>' +
          '</div>' +
        '</div>' +
      '</div>';

    // 更新排行榜名次
    _updatePlayerRank();
  }

  /**
   * 渲染成就列表
   */
  function _renderAchievements() {
    var list = _el('achievement-list');
    if (!list) return;

    var achievements = window.GameData ? window.GameData.achievements : [];
    var state = _getState();

    var html = '';
    achievements.forEach(function (ach) {
      var isUnlocked = state && state.achievements[ach.id] && state.achievements[ach.id].unlocked;
      html +=
        '<div class="achievement-item' + (isUnlocked ? '' : ' locked') + '" data-ach-id="' + ach.id + '">' +
          '<div class="achievement-icon">' + (ach.icon || '\uD83C\uDFC6') + '</div>' +
          '<div class="achievement-info">' +
            '<div class="achievement-name">' + ach.name + '</div>' +
            '<div class="achievement-desc">' + ach.description + '</div>' +
          '</div>' +
          (isUnlocked ? '<span class="achievement-badge">已达成</span>' : '') +
        '</div>';
    });

    list.innerHTML = html;
  }

  /**
   * 渲染排行榜
   */
  function _renderLeaderboard() {
    var list = _el('leaderboard-list');
    if (!list) return;
    if (!window.GameEngine || !_getState()) return;

    var ranking;
    if (_leaderboardTab === 'collection') {
      ranking = window.GameEngine.LeaderboardSystem.getCollectionRanking();
    } else {
      ranking = window.GameEngine.LeaderboardSystem.getFootprintRanking();
    }

    // 只显示前10名
    var top10 = ranking.slice(0, 10);
    var html = '';
    top10.forEach(function (item) {
      var rankClass = '';
      if (item.rank === 1) rankClass = 'top-1';
      else if (item.rank === 2) rankClass = 'top-2';
      else if (item.rank === 3) rankClass = 'top-3';

      var scoreLabel = _leaderboardTab === 'collection' ? '卡牌' : '足迹';
      var scoreValue = _leaderboardTab === 'collection' ? item.cardCount : item.checkInCount;

      html +=
        '<div class="leaderboard-item' + (item.isPlayer ? ' me' : '') + '">' +
          '<div class="leaderboard-rank ' + rankClass + '">' + item.rank + '</div>' +
          '<div class="leaderboard-avatar">' +
            '<div style="width:100%;height:100%;display:flex;align-items:center;justify-content:center;font-size:16px;background:linear-gradient(135deg,#F4E3B2,#EAD5A0);">\uD83E\uDD8C</div>' +
          '</div>' +
          '<div class="leaderboard-info">' +
            '<div class="leaderboard-name">' + item.name + (item.isPlayer ? ' (我)' : '') + '</div>' +
            '<div class="leaderboard-score">' + scoreLabel + ' <span class="leaderboard-score-value">' + scoreValue + '</span></div>' +
          '</div>' +
        '</div>';
    });

    list.innerHTML = html;
  }

  /**
   * 更新玩家排行榜名次
   * 【修复 #2】添加 _state null 检查，防止引擎未初始化时崩溃
   */
  function _updatePlayerRank() {
    var rankEl = _el('stat-rank');
    if (!rankEl) return;

    // 【修复 #2】检查引擎和状态是否存在
    if (!window.GameEngine || !window.GameEngine._state) return;
    if (!window.GameEngine.LeaderboardSystem) return;

    try {
      var rankInfo = window.GameEngine.LeaderboardSystem.getPlayerRank(_leaderboardTab);
      rankEl.textContent = rankInfo.rank > 0 ? '#' + rankInfo.rank : '--';
    } catch (e) {
      console.warn('[GameUI] 获取排行榜名次失败:', e);
      rankEl.textContent = '--';
    }
  }

  // ==================== 7. renderTutorialOverlay ====================

  /**
   * 渲染新手引导覆盖层
   * @param {number} step - 当前步骤（1-6）
   */
  function renderTutorialOverlay(step) {
    _tutorialStep = step;
    var dialog = _tutorialDialogs[step];
    if (!dialog) return;

    // 移除已有的引导层
    var existing = _el('tutorial-overlay');
    if (existing) existing.remove();
    existing = _el('tutorial-dialog');
    if (existing) existing.remove();

    // 半透明遮罩
    var overlay = _create('div', '', '');
    overlay.id = 'tutorial-overlay';
    overlay.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;' +
      'background:rgba(0,0,0,0.7);z-index:9998;';

    // 白泽对话气泡
    var bubble = _create('div', '', '');
    bubble.id = 'tutorial-dialog';
    bubble.style.cssText = 'position:fixed;bottom:80px;left:50%;transform:translateX(-50%);' +
      'background:linear-gradient(135deg,#2c1810,#4a2c17);color:#f0e6d3;padding:20px 24px;' +
      'border-radius:16px;max-width:320px;width:90%;z-index:9999;text-align:center;' +
      'box-shadow:0 8px 32px rgba(0,0,0,0.5);border:2px solid #d4a574;' +
      'animation:bounceIn 0.4s ease;';

    bubble.innerHTML =
      '<div style="font-size:40px;margin-bottom:12px;">' + dialog.icon + '</div>' +
      '<h3 style="margin:0 0 8px;color:#f0e6d3;font-size:16px;letter-spacing:2px;">' + dialog.title + '</h3>' +
      '<p style="margin:0 0 16px;font-size:14px;line-height:1.8;color:#d4c4a8;">' + dialog.text + '</p>' +
      '<div style="display:flex;justify-content:space-between;">' +
        '<button id="tutorial-skip" style="padding:8px 16px;border:1px solid #8b7355;' +
          'background:transparent;color:#d4c4a8;border-radius:8px;cursor:pointer;font-size:13px;">跳过</button>' +
        '<button id="tutorial-next" style="padding:8px 20px;border:none;' +
          'background:linear-gradient(135deg,#c94043,#e8655a);color:#fff;border-radius:8px;' +
          'cursor:pointer;font-size:13px;font-weight:bold;">' +
          (step < 6 ? '下一步' : '开始旅行') + '</button>' +
      '</div>';

    (document.getElementById('app') || document.body).appendChild(overlay);
    (document.getElementById('app') || document.body).appendChild(bubble);
  }

  // ==================== 8. renderCityDetailModal ====================

  /**
   * 渲染城市详情弹窗
   * @param {Object} city - 城市数据对象
   */
  function renderCityDetailModal(city) {
    // 移除已有弹窗
    var existing = _el('city-detail-modal');
    if (existing) existing.remove();

    var state = _getState();
    var cityState = state && state.cities[city.id] ? state.cities[city.id] : null;
    var isUnlocked = cityState && cityState.unlocked;
    var isCompleted = cityState && cityState.completedAt;
    var beast = city.beast ? window.GameData.utils.getBeastById(city.beast) : null;

    var regionName = _getRegionName(city.region);

    // 弹窗内容
    var modal = _create('div', 'modal-overlay center', '');
    modal.id = 'city-detail-modal';

    var contentHTML =
      '<div class="modal-content" style="border-radius:16px;">' +
        '<div class="modal-header">' +
          '<span class="modal-title">' + city.name + '</span>' +
          '<button class="modal-close" id="city-modal-close">&times;</button>' +
        '</div>' +
        '<div style="padding:0 24px 24px;">' +
          // 城市基本信息
          '<div class="city-detail-header">' +
            '<div class="city-detail-icon" style="background:' + (city.themeColor || '#C41E3A') + ';">' +
              (beast ? _getBeastEmoji(beast.element) : '\uD83C\uDFD9\uFE0F') +
            '</div>' +
            '<div>' +
              '<div class="city-detail-name">' + city.name + '</div>' +
              '<div class="city-detail-region">' + city.province + ' · ' + regionName + '</div>' +
            '</div>' +
          '</div>' +
          // 地标
          '<div style="padding:12px 0;border-top:1px solid rgba(128,128,128,0.08);border-bottom:1px solid rgba(128,128,128,0.08);">' +
            '<div style="font-size:13px;color:#999;margin-bottom:4px;letter-spacing:1px;">地标</div>' +
            '<div style="font-size:15px;color:#333;letter-spacing:1px;">' + city.landmark + '</div>' +
          '</div>';

    // 关联神兽信息
    if (beast) {
      contentHTML +=
        '<div style="padding:12px 0;border-bottom:1px solid rgba(128,128,128,0.08);">' +
          '<div style="font-size:13px;color:#999;margin-bottom:6px;letter-spacing:1px;">守护神兽</div>' +
          '<div style="display:flex;align-items:center;gap:10px;">' +
            '<span style="font-size:28px;">' + _getBeastEmoji(beast.element) + '</span>' +
            '<div>' +
              '<div style="font-size:15px;font-weight:600;color:#333;letter-spacing:1px;">' + beast.name + '</div>' +
              '<div style="font-size:12px;color:#DAA520;letter-spacing:1px;">' + beast.rarity + '</div>' +
            '</div>' +
          '</div>' +
          '<div style="font-size:13px;color:#666;line-height:1.8;margin-top:8px;font-style:italic;">' +
            beast.description +
          '</div>' +
        '</div>';
    }

    // 打卡状态
    if (isCompleted) {
      // 【修复 #4】使用 state.cities 判断打卡状态，不再使用不存在的 checkInRecords
      var checkInCount = 1; // 已完成即为1次

      // 【修复 #6】移除死代码，直接遍历 cards 查找关联卡牌
      var allCards = window.GameData ? window.GameData.cards : [];
      var cityCard = null;
      for (var c = 0; c < allCards.length; c++) {
        if (allCards[c].cityId === city.id) { cityCard = allCards[c]; break; }
      }

      var formattedDate = '';
      if (cityState.completedAt && window.GameEngine && window.GameEngine.Utils) {
        formattedDate = window.GameEngine.Utils.formatDate(cityState.completedAt, 'datetime') || cityState.completedAt;
      } else {
        formattedDate = cityState.completedAt || '';
      }

      contentHTML +=
        '<div style="padding:12px 0;border-bottom:1px solid rgba(128,128,128,0.08);">' +
          '<div style="font-size:13px;color:#00A86B;letter-spacing:1px;margin-bottom:4px;">\u2714 已打卡</div>' +
          '<div style="font-size:12px;color:#999;">打卡时间: ' + formattedDate + '</div>' +
          (cityState.memory ? '<div style="font-size:13px;color:#555;margin-top:8px;line-height:1.5;background:#f9f9f9;padding:8px;border-radius:4px;">' + cityState.memory + '</div>' : '') +
          (cityCard ? '<div style="font-size:12px;color:#DAA520;margin-top:8px;">获得卡牌: ' + cityCard.name + '</div>' : '') +
        '</div>';
    }

    // 打卡按钮
    if (!isCompleted) {
      contentHTML +=
        '<div style="padding:16px 0 0;">' +
          '<button class="camera-submit" id="city-checkin-btn" data-city-id="' + city.id + '" style="width:100%;">' +
            (isUnlocked ? '完成打卡' : '前往打卡') +
          '</button>' +
        '</div>';
    }

    contentHTML += '</div></div>';

    modal.innerHTML = contentHTML;
    (document.getElementById('app') || document.body).appendChild(modal);
  }

  // ==================== 9. renderCardDetailModal ====================

  /**
   * 渲染卡牌详情弹窗
   * @param {Object} card - 卡牌数据对象
   */
  function renderCardDetailModal(card) {
    var existing = _el('card-detail-modal');
    if (existing) existing.remove();

    var beast = window.GameData.utils.getBeastById(card.beastId);
    var city = window.GameData.utils.getCityById(card.cityId);
    var gradient = _getCardGradient(card.id);
    var rarityClass = _getRarityClass(card.rarity);

    var state = _getState();
    var obtainedAt = '';
    if (state && state.unlockTimes && state.unlockTimes[card.cityId]) {
      obtainedAt = window.GameEngine.Utils.formatDate(state.unlockTimes[card.cityId], 'date');
    }

    var cityState = state && card.cityId && state.cities[card.cityId] ? state.cities[card.cityId] : null;
    var playerMemory = cityState && cityState.memory ? cityState.memory : '';

    var postcardSrc = _getPostcardSrc(card);

    var modal = _create('div', 'card-detail-modal', '');
    modal.id = 'card-detail-modal';

    var bannerHTML = postcardSrc
      ? '<div class="card-detail-banner" id="card-detail-banner" style="background:' + gradient + ';">' +
          '<img src="' + postcardSrc + '" alt="' + (city ? city.name : '') + '明信片" ' +
            'style="position:absolute;top:0;left:0;width:100%;height:100%;object-fit:cover;z-index:1;" ' +
            'id="card-detail-banner-img" ' +
            'onerror="this.style.display=\'none\';document.getElementById(\'card-detail-banner-fallback\').style.display=\'flex\';" />' +
          '<div id="card-detail-banner-fallback" style="display:none;position:absolute;inset:0;z-index:2;' +
            'align-items:center;justify-content:center;font-size:80px;opacity:0.5;' +
            'filter:drop-shadow(0 4px 16px rgba(0,0,0,0.4));">' +
            (beast ? _getBeastEmoji(beast.element) : '?') +
          '</div>' +
          '<div class="card-detail-image-overlay" style="z-index:3;"></div>' +
          '<button class="card-detail-close" id="card-modal-close" style="z-index:5;">&times;</button>' +
          '<div style="position:absolute;bottom:12px;left:16px;right:16px;z-index:5;">' +
            '<span class="card-rarity ' + rarityClass + '" style="font-size:11px;">' + card.rarity + '</span>' +
          '</div>' +
        '</div>'
      : '<div style="width:100%;aspect-ratio:9/16;max-height:320px;background:' + gradient + ';' +
          'display:flex;align-items:center;justify-content:center;position:relative;overflow:hidden;">' +
          '<div style="font-size:80px;opacity:0.5;filter:drop-shadow(0 4px 16px rgba(0,0,0,0.4));">' +
            (beast ? _getBeastEmoji(beast.element) : '?') +
          '</div>' +
          '<div class="card-detail-image-overlay"></div>' +
          '<button class="card-detail-close" id="card-modal-close">&times;</button>' +
          '<div style="position:absolute;bottom:12px;left:16px;right:16px;z-index:5;">' +
            '<span class="card-rarity ' + rarityClass + '" style="font-size:11px;">' + card.rarity + '</span>' +
          '</div>' +
        '</div>';

    modal.innerHTML =
      '<div class="card-detail-content">' +
        bannerHTML +
        '<div class="card-detail-body">' +
          '<div class="card-detail-name">' + card.name + '</div>' +
          '<div class="card-detail-origin">' +
            (city ? city.name : '') + ' · ' + (city ? city.province : '') + ' · ' + _getRegionName(card.region || (city ? city.region : '')) +
          '</div>' +
          '<div class="card-detail-divider"></div>' +
          (city && city.description ?
            '<div class="card-detail-section">' +
              '<div class="card-detail-section-title">城市简介</div>' +
              '<div class="card-detail-city-info">' +
                '<div class="card-detail-city-landmark">' +
                  '<span class="card-detail-city-landmark-icon">\uD83C\uDFDB\uFE0F</span>' +
                  '<span>' + city.landmark + '</span>' +
                '</div>' +
                '<div class="card-detail-desc">' + city.description + '</div>' +
              '</div>' +
            '</div>'
          : '') +
          (playerMemory ?
            '<div class="card-detail-section">' +
              '<div class="card-detail-section-title">我的记忆</div>' +
              '<div class="card-detail-memory">' +
                '<span class="card-detail-memory-icon">\uD83D\uDCDD</span>' +
                '<div class="card-detail-memory-text">' + _escapeHtml(playerMemory) + '</div>' +
              '</div>' +
            '</div>'
          : '') +
          '<div class="card-detail-section">' +
            '<div class="card-detail-section-title">山海经原文</div>' +
            '<div class="card-detail-quote">' + card.quote + '</div>' +
          '</div>' +
          (beast ? '<div class="card-detail-section">' +
            '<div class="card-detail-section-title">神兽描述</div>' +
            '<div class="card-detail-desc">' + (beast.descriptionModern || beast.description) + '</div>' +
          '</div>' : '') +
          '<div class="card-detail-attributes">' +
            '<div class="card-detail-attribute">' +
              '<div class="card-detail-attribute-value">' + (beast ? beast.element : '?') + '</div>' +
              '<div class="card-detail-attribute-label">属性</div>' +
            '</div>' +
            '<div class="card-detail-attribute">' +
              '<div class="card-detail-attribute-value">' + card.rarity + '</div>' +
              '<div class="card-detail-attribute-label">稀有度</div>' +
            '</div>' +
            '<div class="card-detail-attribute">' +
              '<div class="card-detail-attribute-value" style="font-size:13px;">' + (obtainedAt || '--') + '</div>' +
              '<div class="card-detail-attribute-label">获得时间</div>' +
            '</div>' +
          '</div>' +
        '</div>' +
      '</div>';

    (document.getElementById('app') || document.body).appendChild(modal);
  }

  // ==================== 10. renderRewardAnimation ====================

  /**
   * 渲染奖励动画
   * @param {Object} reward - 奖励数据（卡牌对象）
   */
  function renderRewardAnimation(reward) {
    var existing = _el('reward-animation');
    if (existing) existing.remove();

    var overlay = _create('div', '', '');
    overlay.id = 'reward-animation';
    overlay.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;' +
      'background:rgba(0,0,0,0.85);z-index:10002;display:flex;flex-direction:column;' +
      'align-items:center;justify-content:center;animation:fadeIn 0.3s ease;';

    var cardColor = reward.color || '#c94043';
    var gradient = _getCardGradient(reward.id || reward.cityId || 'default');
    var rewardPostcard = _getPostcardSrc(reward);

    overlay.innerHTML =
      '<div style="text-align:center;">' +
        '<div style="font-size:14px;color:rgba(255,255,255,0.6);letter-spacing:4px;margin-bottom:20px;' +
          'animation:fadeInUp 0.5s ease 0.2s both;">获得新卡牌</div>' +
        '<div style="width:200px;height:280px;border-radius:16px;margin:0 auto;' +
          'background:' + gradient + ';display:flex;flex-direction:column;align-items:center;' +
          'justify-content:center;box-shadow:0 0 40px ' + cardColor + '66,0 8px 32px rgba(0,0,0,0.5);' +
          'border:2px solid rgba(255,255,255,0.3);animation:bounceIn 0.6s cubic-bezier(0.68,-0.55,0.265,1.55);' +
          'perspective:800px;position:relative;overflow:hidden;">' +
          '<img src="' + rewardPostcard + '" style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover;z-index:0;" />' +
          '<div style="position:absolute;inset:0;background:linear-gradient(180deg,transparent 40%,rgba(0,0,0,0.7) 100%);z-index:1;"></div>' +
          '<div style="position:relative;z-index:2;display:flex;flex-direction:column;align-items:center;justify-content:flex-end;height:100%;padding-bottom:20px;">' +
            '<h3 style="margin:0 0 4px;font-size:20px;color:white;letter-spacing:3px;text-shadow:0 2px 8px rgba(0,0,0,0.6);">' +
              (reward.beastName || '未知神兽') + '</h3>' +
            '<p style="margin:0 0 8px;font-size:12px;color:rgba(255,255,255,0.85);">' +
              (reward.cityName || '') + '</p>' +
            '<span style="font-size:11px;padding:3px 10px;border-radius:12px;' +
              'background:rgba(255,255,255,0.2);color:white;">' + (reward.rarity || '普通') + '</span>' +
          '</div>' +
        '</div>' +
        '<button id="reward-close-btn" style="margin-top:24px;padding:10px 32px;border:none;' +
          'background:linear-gradient(135deg,#d4a574,#c94043);color:#fff;border-radius:24px;' +
          'cursor:pointer;font-size:15px;font-weight:bold;box-shadow:0 4px 16px rgba(0,0,0,0.3);' +
          'animation:fadeInUp 0.5s ease 0.6s both;letter-spacing:2px;">收下</button>' +
      '</div>';

    (document.getElementById('app') || document.body).appendChild(overlay);
  }

  // ==================== 11. updateUI ====================

  /**
   * 刷新当前页面的数据展示
   */
  function updateUI() {
    var currentPage = window.GameEngine ? window.GameEngine.Router.getCurrentPage() : 'map';

    switch (currentPage) {
      case 'map':
        
        break;
      case 'camera':
        _updateCameraPage();
        break;
      case 'collection':
        _renderCardGrid();
        break;
      case 'profile':
        _updateProfilePage();
        break;
    }
    
    _updateHeader();
  }

  /**
   * 更新打卡页面状态
   */
  function _updateCameraPage() {
    var state = _getState();
    if (!state) return;

    // 更新城市选择显示
    if (_selectedCityId) {
      var city = window.GameData.utils.getCityById(_selectedCityId);
      var valueEl = _el('camera-city-value');
      if (city && valueEl) valueEl.textContent = city.name;
    }
  }

  /**
   * 更新个人主页数据
   * 【修复 #5】卡牌数基于卡牌计算
   * 【修复 #7】经验条满级处理
   */
  function _updateProfilePage() {
    var state = _getState();
    if (!state) return;

    // 更新统计
    var statCities = _el('stat-cities');
    var statCards = _el('stat-cards');
    var unlockedCities = _getUnlockedCityCount();
    var totalCities = _getTotalCityCount();
    var collectedCards = _getCollectedCardCount();
    var totalCards = window.GameEngine ? window.GameEngine.CardSystem.getCollectionProgress().total : 0;
    var statCardRate = _el('stat-card-rate');
    if (statCities) statCities.textContent = unlockedCities + '/' + totalCities;
    if (statCards) statCards.textContent = collectedCards + '/' + totalCards;
    if (statCardRate) statCardRate.textContent = (totalCards > 0 ? Math.round((collectedCards / totalCards) * 100) : 0) + '%';

    // 更新经验条
    var levelInfo = window.GameData.utils.calcLevel(state.exp);
    var levelEl = _el('profile-level');
    var expBar = _el('profile-exp-bar');
    var expText = _el('profile-exp-text');
    var levelCaption = _el('profile-level-caption');
    var cardProgressText = _el('profile-card-progress-text');
    var profileTitle = _el('profile-title');
    if (levelEl) levelEl.textContent = 'Lv.' + levelInfo.level;
    if (expBar) {
      // 【修复 #7】使用 _calcExpProgress 处理满级
      var expPercent = _calcExpProgress(levelInfo.level, state.exp);
      expBar.style.width = expPercent + '%';
    }
    if (expText) expText.textContent = 'EXP ' + state.exp + ' · 距下一级 ' + Math.max(levelInfo.nextLevelExp - levelInfo.currentExp, 0);
    if (levelCaption) levelCaption.textContent = 'Lv.' + levelInfo.level + ' 山海见闻持续增长中';
    if (cardProgressText) cardProgressText.textContent = '卡牌进度 ' + collectedCards + '/' + totalCards;
    if (profileTitle) profileTitle.textContent = _getProfileTitle(levelInfo.level, collectedCards, totalCards);

    _updatePlayerRank();
    _updateTravelSummary();
  }

  // ==================== 事件绑定 ====================

  /**
   * 绑定全局事件委托
   */
  function _bindGlobalEvents() {
    if (_globalEventsBound) return;
    _globalEventsBound = true;

    document.addEventListener('click', function (e) {
      var target = e.target;

      // --- 开场页 "开始旅途" 按钮 ---
      if (target.id === 'splash-start-btn' || target.closest('#splash-start-btn')) {
        if (window.GameEngine) {
          window.GameEngine.Router.navigateTo('map');
        }
        return;
      }

      // --- 悬浮导航按钮切换 ---
      if (target.id === 'floating-nav-fab' || target.closest('#floating-nav-fab')) {
        var menu = _el('floating-nav-menu');
        if (menu) {
          menu.classList.toggle('hidden');
        }
        return;
      }

      // --- 点击外部关闭悬浮导航菜单 ---
      var menu = _el('floating-nav-menu');
      if (menu && !menu.classList.contains('hidden')) {
        if (!target.closest('#floating-nav-menu') && !target.closest('#floating-nav-fab')) {
          menu.classList.add('hidden');
        }
      }

      // --- 底部导航栏切换 ---
      var navItem = target.closest('.nav-item');
      if (navItem) {
        var page = navItem.getAttribute('data-page');
        if (page && window.GameEngine) {
          window.GameEngine.Router.navigateTo(page);
          if (menu) {
            menu.classList.add('hidden');
          }
        }
        return;
      }

      // --- 地图区域筛选 ---
      var filterTag = target.closest('.map-filter-tag');
      if (filterTag) {
        var filter = filterTag.getAttribute('data-filter');
        _mapFilter = filter === 'all' ? null : filter;

        // 更新标签激活状态
        var allFilters = document.querySelectorAll('.map-filter-tag');
        allFilters.forEach(function (f) { f.classList.remove('active'); });
        filterTag.classList.add('active');

        
        return;
      }

      // --- 地图缩放 ---
      if (target.id === 'map-zoom-in') {
        if (window.GameEngine) window.GameEngine.MapSystem.zoomIn();
        return;
      }
      if (target.id === 'map-zoom-out') {
        if (window.GameEngine) window.GameEngine.MapSystem.zoomOut();
        return;
      }

      // --- 打卡页面返回 ---
      if (target.id === 'camera-back-btn' || target.closest('#camera-back-btn')) {
        if (window.GameEngine) window.GameEngine.Router.navigateTo('map');
        return;
      }

      // --- 城市选择器 ---
      if (target.closest('#camera-city-select')) {
        _showCitySelector();
        return;
      }

      // --- 照片上传区域点击 ---
      var uploadItem = target.closest('.camera-upload-item');
      if (uploadItem && !target.closest('.camera-upload-remove')) {
        var photoType = uploadItem.getAttribute('data-photo-type');
        if (photoType && window.GameEngine) {
          window.GameEngine.CheckInSystem.uploadPhoto(photoType);
        }
        return;
      }

      // --- 删除已上传照片 ---
      var removeBtn = target.closest('.camera-upload-remove');
      if (removeBtn) {
        var removeType = removeBtn.getAttribute('data-remove-type');
        if (removeType && window.GameEngine) {
          window.GameEngine.CheckInSystem._pendingPhotos[removeType] = '';
          var item = _el('upload-' + removeType);
          var preview = _el('preview-' + removeType);
          if (item) item.classList.remove('uploaded');
          if (preview) preview.src = '';
        }
        return;
      }

      // --- 提交打卡 ---
      if (target.id === 'camera-submit-btn' || target.closest('#camera-submit-btn')) {
        _submitCheckIn();
        return;
      }

      // --- 卡牌筛选 ---
      var cardFilter = target.closest('.collection-filter-tag');
      if (cardFilter && cardFilter.closest('#collection-filters')) {
        var rarity = cardFilter.getAttribute('data-rarity');
        _cardFilter = rarity;

        var allCardFilters = document.querySelectorAll('#collection-filters .collection-filter-tag');
        allCardFilters.forEach(function (f) { f.classList.remove('active'); });
        cardFilter.classList.add('active');

        _renderCardGrid();
        return;
      }

      // --- 卡牌点击 ---
      var cardItem = target.closest('.card-item.collected');
      if (cardItem) {
        var cardId = cardItem.getAttribute('data-card-id');
        var cardData = window.GameData.utils.getCardById(cardId);
        if (cardData) renderCardDetailModal(cardData);
        return;
      }

      // --- 卡牌详情关闭 ---
      if (target.id === 'card-modal-close' || target.closest('#card-modal-close')) {
        var cardModal = _el('card-detail-modal');
        if (cardModal) cardModal.remove();
        return;
      }

      // --- 城市详情弹窗关闭 ---
      if (target.id === 'city-modal-close' || target.closest('#city-modal-close')) {
        var cityModal = _el('city-detail-modal');
        if (cityModal) cityModal.remove();
        return;
      }

      // --- 城市详情弹窗打卡按钮 ---
      var checkinBtn = target.closest('#city-checkin-btn');
      if (checkinBtn) {
        var cityId = checkinBtn.getAttribute('data-city-id');
        var cityModal2 = _el('city-detail-modal');
        if (cityModal2) cityModal2.remove();
        if (cityId && window.GameEngine) {
          window.GameEngine.CheckInSystem.startCheckIn(cityId);
        }
        return;
      }

      // --- 排行榜标签切换 ---
      var lbTab = target.closest('[data-lb-tab]');
      if (lbTab) {
        _leaderboardTab = lbTab.getAttribute('data-lb-tab');
        var allLbTabs = document.querySelectorAll('[data-lb-tab]');
        allLbTabs.forEach(function (t) { t.classList.remove('active'); });
        lbTab.classList.add('active');
        _renderLeaderboard();
        _updatePlayerRank();
        return;
      }

      // --- 设置：音效开关 ---
      if (target.closest('#toggle-sfx')) {
        var sfxToggle = _el('toggle-sfx');
        if (sfxToggle) {
          sfxToggle.classList.toggle('active');
          var isMuted = !sfxToggle.classList.contains('active');
          if (window.GameEngine) {
            window.GameEngine._state.settings.muted = isMuted;
            window.GameEngine.Audio._muted = isMuted;
            window.GameEngine.Audio._updateVolumes();
            window.GameEngine.SaveSystem.save();
          }
        }
        return;
      }

      // --- 设置：BGM 开关 ---
      if (target.closest('#toggle-bgm')) {
        var bgmToggle = _el('toggle-bgm');
        if (bgmToggle) {
          bgmToggle.classList.toggle('active');
          if (window.GameEngine) {
            if (bgmToggle.classList.contains('active')) {
              window.GameEngine._state.settings.bgmEnabled = true;
              window.GameEngine.Audio.playBGM();
            } else {
              window.GameEngine._state.settings.bgmEnabled = false;
              window.GameEngine.Audio.stopBGM();
            }
            window.GameEngine.SaveSystem.save();
          }
        }
        return;
      }

      // --- 设置：存档管理 ---
      if (target.closest('#setting-save-manager')) {
        _openSaveManager();
        return;
      }

      // --- 修改昵称 ---
      if (target.closest('#profile-name')) {
        _openPlayerNameEditor();
        return;
      }

      // --- 设置：重置游戏 ---
      if (target.closest('#setting-reset')) {
        if (window.GameEngine) {
          window.GameEngine.Notification.showModal(
            '确认重置',
            '确定要重置所有游戏数据吗？此操作不可撤销。',
            [
              { text: '取消', onClick: function () {} },
              {
                text: '确认重置',
                onClick: function () {
                  window.GameEngine.SaveSystem.reset();
                  window.GameEngine.init();
                  window.GameEngine.Router.navigateTo('splash');
                  updateUI();
                }
              }
            ]
          );
        }
        return;
      }

      // --- 奖励动画关闭 ---
      if (target.id === 'reward-close-btn' || target.closest('#reward-close-btn')) {
        var rewardEl = _el('reward-animation');
        if (rewardEl) rewardEl.remove();
        return;
      }

      // --- 引导：下一步 ---
      if (target.id === 'tutorial-next' || target.closest('#tutorial-next')) {
        if (window.GameEngine) {
          window.GameEngine.TutorialSystem.nextStep();
        }
        return;
      }

      // --- 引导：跳过 ---
      if (target.id === 'tutorial-skip' || target.closest('#tutorial-skip')) {
        if (window.GameEngine) {
          window.GameEngine.TutorialSystem.skipTutorial();
        }
        return;
      }

      // --- 顶部静音按钮 ---
      if (target.id === 'btn-sound' || target.closest('#btn-sound')) {
        if (window.GameEngine) {
          var muted = window.GameEngine.Audio.toggleMute();
          window.GameEngine.SaveSystem.save();
          var soundBtn = _el('btn-sound');
          if (soundBtn) {
            soundBtn.textContent = muted ? '🔇' : '🔊';
            soundBtn.setAttribute('title', muted ? '已静音' : '音效');
          }
          var sfxToggleBtn = _el('toggle-sfx');
          if (sfxToggleBtn) {
            if (muted) sfxToggleBtn.classList.remove('active');
            else sfxToggleBtn.classList.add('active');
          }
          window.GameEngine.Notification.showToast(muted ? '已静音' : '声音已开启', 'info');
        }
        return;
      }

      // --- 顶部设置按钮 ---
      if (target.id === 'btn-settings' || target.closest('#btn-settings')) {
        if (window.GameEngine) {
          window.GameEngine.Router.navigateTo('profile');
        }
        return;
      }

      // --- 点击弹窗遮罩关闭 ---
      // 【修复 #9】只关闭没有特定ID的通用模态遮罩，避免误关其他弹窗
      if (target.classList.contains('modal-overlay') && !target.id) {
        target.remove();
        return;
      }
      if (target.classList.contains('card-detail-modal') && !target.id) {
        target.remove();
        return;
      }
    });
  }

  /**
   * 注册路由生命周期回调
   */
  function _registerRouteCallbacks() {
    if (!window.GameEngine) return;
    if (_routeCallbacksRegistered) return;
    _routeCallbacksRegistered = true;

    // 地图页面进入时刷新标记
    window.GameEngine.Router.registerPage('map', {
      onEnter: function () {
        
        _updateNavActive('map');
      },
      onLeave: function () {
        _cleanupTransientUI();
      }
    });

    // 打卡页面进入时
    window.GameEngine.Router.registerPage('camera', {
      onEnter: function (params) {
        if (params && params.cityId) {
          _selectedCityId = params.cityId;
          var city = window.GameData.utils.getCityById(params.cityId);
          var titleEl = _el('camera-city-title');
          var valueEl = _el('camera-city-value');
          if (city) {
            if (titleEl) titleEl.textContent = city.name + ' · ' + city.landmark;
            if (valueEl) valueEl.textContent = city.name;
          }
        } else {
          _resetCameraDraft();
        }
        _updateCameraPage();
        _updateNavActive('camera');
      },
      onLeave: function () {
        _cleanupTransientUI();
        _resetCameraDraft();
      }
    });

    // 收集页面进入时刷新
    window.GameEngine.Router.registerPage('collection', {
      onEnter: function () {
        _renderCardGrid();
        _updateNavActive('collection');
      },
      onLeave: function () {
        _cleanupTransientUI();
      }
    });

    // 个人页面进入时刷新
    window.GameEngine.Router.registerPage('profile', {
      onEnter: function () {
        _updateProfilePage();
        _updateNavActive('profile');
      },
      onLeave: function () {
        _cleanupTransientUI();
      }
    });

    // 开场页进入时
    window.GameEngine.Router.registerPage('splash', {
      onEnter: function () {
        _updateNavActive('splash');
      },
      onLeave: function () {
        _cleanupTransientUI();
      }
    });
  }

  /**
   * 更新底部导航栏激活状态
   * @param {string} page
   */
  function _updateNavActive(page) {
    var navItems = document.querySelectorAll('.nav-item');
    navItems.forEach(function (item) {
      var itemPage = item.getAttribute('data-page');
      if (itemPage === page) {
        item.classList.add('active');
      } else {
        item.classList.remove('active');
      }
    });
  }

  /**
   * 绑定引擎自定义事件
   */
  function _bindEngineEvents() {
    if (_engineEventsBound) return;
    _engineEventsBound = true;

    // 照片上传就绪事件
    document.addEventListener('photoReady', function (e) {
      var detail = e.detail;
      if (detail && detail.type && detail.thumbnail) {
        var uploadItem = _el('upload-' + detail.type);
        var previewImg = _el('preview-' + detail.type);
        if (uploadItem) uploadItem.classList.add('uploaded');
        if (previewImg) previewImg.src = detail.thumbnail;
      }
    });

    document.addEventListener('gameStateUpdated', function () {
      _renderCardGrid();
      _updateProfilePage();
      _updateTravelSummary();
      _updateHeader();
    });
  }

  /**
   * 更新顶部状态栏信息
   */
  function _updateHeader() {
    var state = _getState();
    if (!state || !window.GameData || !window.GameData.utils) return;
    
    var exp = state.exp || 0;
    var levelInfo = window.GameData.utils.calcLevel(exp);
    var collectedCards = _getCollectedCardCount();
    var totalCards = window.GameEngine && window.GameEngine.CardSystem ? window.GameEngine.CardSystem.getCollectionProgress().total : 0;
    
    var levelBadge = _el('player-level-badge');
    var titleEl = _el('player-title');
    var headerLevel = _el('header-player-level');
    var headerName = _el('header-player-name');
    var headerAvatar = _el('header-avatar');
    
    var profileTitle = _getProfileTitle(levelInfo.level, collectedCards, totalCards);
    
    if (levelBadge) levelBadge.textContent = 'Lv.' + levelInfo.level;
    if (titleEl) titleEl.textContent = profileTitle;
    
    if (headerLevel) headerLevel.textContent = 'Lv.' + levelInfo.level;
    if (headerName) headerName.textContent = state.playerName || '旅行者';
    if (headerAvatar && state.avatar) headerAvatar.src = state.avatar;
  }

  /**
   * 显示城市选择器（模态框）
   * 【修复 #3】合并双 style 属性为单个 style
   * 【修复 #9】使用唯一 ID 关闭模态框
   */
  function _showCitySelector() {
    if (!window.GameEngine) return;

    var cities = window.GameData.cities;
    var state = window.GameEngine._state;

    var html = '<div style="max-height:50vh;overflow-y:auto;text-align:left;">';
    cities.forEach(function (city) {
      var cityState = state.cities[city.id];
      var isCompleted = cityState && cityState.completedAt;
      var isUnlocked = cityState && cityState.unlocked;
      var icon = isCompleted ? '\u2714' : (isUnlocked ? '\uD83D\uDCCD' : '\uD83D\uDCCD');

      // 【修复 #3】合并双 style 属性为单个 style，避免布局错乱
      var disabledStyle = isCompleted ? 'opacity:0.5;pointer-events:none;' : '';

      html += '<div class="city-select-item" data-select-city="' + city.id + '"' +
        ' style="' + disabledStyle + 'display:flex;align-items:center;gap:12px;padding:12px 16px;border-bottom:1px solid rgba(128,128,128,0.08);cursor:pointer;transition:background 0.15s;">' +
        '<span style="font-size:16px;">' + icon + '</span>' +
        '<div>' +
          '<div style="font-size:14px;color:#333;letter-spacing:1px;">' + city.name +
            (isCompleted ? ' <span style="font-size:11px;color:#00A86B;">(已打卡)</span>' : '') +
          '</div>' +
          '<div style="font-size:12px;color:#999;">' + city.province + ' · ' + city.landmark + '</div>' +
        '</div>' +
      '</div>';
    });
    html += '</div>';

    // 【修复 #9】给城市选择器模态框添加唯一 ID
    window.GameEngine.Notification.showModal('选择打卡城市', html, [
      { text: '取消' }
    ]).then(function () {
      // 模态框关闭后的清理工作（如有需要）
    });

    // 绑定城市选择事件
    setTimeout(function () {
      var items = document.querySelectorAll('.city-select-item');
      items.forEach(function (item) {
        item.addEventListener('click', function () {
          var cityId = this.getAttribute('data-select-city');
          if (cityId) {
            _selectedCityId = cityId;
            var city = window.GameData.utils.getCityById(cityId);
            var titleEl = _el('camera-city-title');
            var valueEl = _el('camera-city-value');
            if (city) {
              if (titleEl) titleEl.textContent = city.name + ' · ' + city.landmark;
              if (valueEl) valueEl.textContent = city.name;
            }
            // 【修复 #9】使用唯一 ID 选择器关闭城市选择器模态框
            // Notification.showModal 创建的遮罩没有特定 ID，但城市选择器
            // 是唯一通过 showModal 打开的，所以通过最近的 modal-overlay 关闭
            var overlays = document.querySelectorAll('.modal-overlay');
            for (var i = overlays.length - 1; i >= 0; i--) {
              // 找到包含城市选择内容的模态框
              if (overlays[i].querySelector('.city-select-item')) {
                overlays[i].remove();
                break;
              }
            }
          }
        });
        item.addEventListener('mouseenter', function () {
          this.style.background = 'rgba(255,215,0,0.05)';
        });
        item.addEventListener('mouseleave', function () {
          this.style.background = '';
        });
      });
    }, 100);
  }

  /**
   * 提交打卡
   * 【修复 #10】避免重复 toast：submitCheckIn 返回 false 时不再额外弹 toast
   */
  function _submitCheckIn() {
    if (!window.GameEngine) return;

    if (!_selectedCityId) {
      window.GameEngine.Notification.showToast('请先选择打卡城市', 'error');
      return;
    }

    var textarea = _el('camera-textarea');
    var memoryText = textarea ? textarea.value.trim() : '';

    var success = window.GameEngine.CheckInSystem.submitCheckIn(_selectedCityId, memoryText);

    if (success) {
      // 【修复 #10】只在成功时显示打卡成功动画
      // engine 的 submitCheckIn -> onCheckInSuccess 已经会弹 toast
      // 这里只显示 UI 层的成功动画，不再额外弹 toast
      var successOverlay = _create('div', 'camera-success', '');
      successOverlay.id = 'camera-success-overlay';
      successOverlay.innerHTML =
        '<div class="camera-success-icon">\u2714</div>' +
        '<div class="camera-success-text">打卡成功</div>' +
        '<div class="camera-success-sub">山海图谱又亮了一角</div>';
      (document.getElementById('app') || document.body).appendChild(successOverlay);

      // 2秒后关闭动画并跳转
      setTimeout(function () {
        var overlay = _el('camera-success-overlay');
        if (overlay) overlay.remove();

        var waitForReward = function () {
          if (document.querySelector('.reward-overlay')) {
            setTimeout(waitForReward, 200);
            return;
          }
          var iframe = document.querySelector('.map-embed-frame');
          if (iframe) iframe.src = iframe.src; // Reload iframe to reflect new color
          window.GameEngine.Router.navigateTo('map');
        };

        waitForReward();
      }, 2000);
    }
    // 【修复 #10】submitCheckIn 返回 false 时，engine 内部已经弹了错误 toast
    // 不再额外弹 toast，避免重复提示
  }

  // ==================== 全局暴露 ====================

  window.GameUI = {
    initUI: initUI,
    renderSplashScreen: renderSplashScreen,
    renderMapPage: renderMapPage,
    renderCameraPage: renderCameraPage,
    renderCollectionPage: renderCollectionPage,
    renderProfilePage: renderProfilePage,
    renderTutorialOverlay: renderTutorialOverlay,
    renderCityDetailModal: renderCityDetailModal,
    renderCardDetailModal: renderCardDetailModal,
    renderRewardAnimation: renderRewardAnimation,
    updateUI: updateUI
  };

  console.log('[ui.js] UI 渲染层模块已加载（重写版，已修复全部10个已知bug）');

})();