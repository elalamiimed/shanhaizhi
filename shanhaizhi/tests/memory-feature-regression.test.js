const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const projectRoot = path.join(__dirname, '..');
const enginePath = path.join(projectRoot, 'js', 'engine.js');
const mapPath = path.join(projectRoot, 'china-memory-map.html');

function createLocalStorage() {
  const store = Object.create(null);
  return {
    getItem(key) {
      return Object.prototype.hasOwnProperty.call(store, key) ? store[key] : null;
    },
    setItem(key, value) {
      store[key] = String(value);
    },
    removeItem(key) {
      delete store[key];
    }
  };
}

function loadEngine() {
  const context = {
    console,
    setTimeout,
    clearTimeout,
    setInterval,
    clearInterval,
    Math,
    Date,
    JSON,
    Promise,
    CustomEvent: function CustomEvent(type, init) {
      this.type = type;
      this.detail = init ? init.detail : undefined;
    },
    localStorage: createLocalStorage(),
    document: {
      hidden: false,
      body: { appendChild() {} },
      createElement() {
        return {
          style: {},
          appendChild() {},
          addEventListener() {},
          querySelectorAll() { return []; },
          set innerHTML(value) { this._innerHTML = value; },
          get innerHTML() { return this._innerHTML || ''; }
        };
      },
      getElementById() { return null; },
      querySelector() { return null; },
      querySelectorAll() { return []; },
      addEventListener() {},
      dispatchEvent() {}
    }
  };

  context.window = context;
  context.addEventListener = function () {};
  context.window.addEventListener = function () {};
  context.window.document = context.document;
  context.window.localStorage = context.localStorage;
  context.window.GameData = {
    cities: [{ id: 'beijing', name: '北京', beast: 'bize', region: 'beishan' }],
    beasts: [{ id: 'bize', name: '白泽', rarity: '传说', description: '神兽' }],
    cards: [],
    achievements: [],
    utils: {
      calcLevel() { return { level: 1 }; },
      getExpForLevel() { return 0; }
    }
  };

  vm.createContext(context);
  vm.runInContext(fs.readFileSync(enginePath, 'utf8'), context, { filename: enginePath });
  return context.window.GameEngine;
}

function loadMapGlobals() {
  const html = fs.readFileSync(mapPath, 'utf8');
  const scriptMatch = html.match(/<script>([\s\S]*)<\/script>\s*<\/body>/);
  if (!scriptMatch) {
    throw new Error('Failed to extract map script');
  }

  const context = {
    console,
    setTimeout,
    clearTimeout,
    Math,
    Date,
    JSON,
    Promise,
    fetch: async function () {
      throw new Error('fetch not expected in unit test');
    },
    localStorage: createLocalStorage(),
    document: {
      getElementById() {
        return {
          style: {},
          classList: { add() {}, remove() {}, toggle() {} },
          innerHTML: '',
          textContent: ''
        };
      }
    },
    window: null,
    L: {
      divIcon(options) {
        return options;
      }
    }
  };

  context.window = context;
  context.window.parent = null;
  context.window.innerWidth = 1024;
  context.window.innerHeight = 768;
  context.window.addEventListener = function () {};

  vm.createContext(context);
  vm.runInContext(scriptMatch[1], context, { filename: mapPath });
  return context;
}

test('submitCheckIn persists memory even if unlock UI throws', () => {
  const GameEngine = loadEngine();
  let saveCalls = 0;
  const toasts = [];

  GameEngine._state = {
    cities: {},
    cards: [],
    achievements: {},
    totalDistance: 0,
    totalCheckIns: 0,
    lastSaveTime: null,
    settings: {},
    tutorialComplete: false,
    tutorialStep: 0,
    unlockTimes: {},
    lastCheckInCityId: null
  };

  GameEngine.SaveSystem.save = function () {
    saveCalls += 1;
    return true;
  };
  GameEngine.Audio.playCheckInSound = function () {};
  GameEngine.MapSystem.unlockCity = function () {
    throw new Error('map failure');
  };
  GameEngine.CardSystem.generateCard = function () {
    return null;
  };
  GameEngine.AchievementSystem.checkAchievements = function () {};
  GameEngine.Notification.showToast = function (message, type) {
    toasts.push({ message, type });
  };

  const success = GameEngine.CheckInSystem.submitCheckIn('beijing', 'A saved memory');

  assert.equal(success, true);
  assert.equal(GameEngine._state.cities.beijing.memory, 'A saved memory');
  assert.equal(GameEngine._state.cities.beijing.unlocked, true);
  assert.equal(saveCalls, 1);
  assert.ok(toasts.some((entry) => entry.type === 'success'));
});

test('showModal keeps button callback before overlay removal', () => {
  const source = fs.readFileSync(enginePath, 'utf8');
  const showModalStart = source.indexOf('showModal: function (title, content, buttons) {');
  const clickHandlerStart = source.indexOf("btn.addEventListener('click', function () {", showModalStart);
  const clickHandlerEnd = source.indexOf('resolve(idx);', clickHandlerStart);
  const clickHandlerBody = source.slice(clickHandlerStart, clickHandlerEnd);

  const onClickIndex = clickHandlerBody.indexOf("defaultButtons[idx].onClick()");
  const removeIndex = clickHandlerBody.indexOf('overlay.parentNode.removeChild(overlay)');

  assert.notEqual(onClickIndex, -1);
  assert.notEqual(removeIndex, -1);
  assert.ok(onClickIndex < removeIndex, 'button callback should run before overlay removal');
});

test('map unlocked markers render with unlocked class and red accent', () => {
  const mapContext = loadMapGlobals();
  const icon = mapContext.buildMarkerIcon({ id: 'beijing', accent: '#00d4ff' }, true);
  const source = fs.readFileSync(mapPath, 'utf8');

  assert.match(icon.className, /\bunlocked\b/);
  assert.match(icon.html, /#FF0000/);
  assert.match(source, /\.city-core-marker\.unlocked \.city-core-dot/);
});
