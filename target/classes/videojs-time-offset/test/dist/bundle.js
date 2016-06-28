(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){

},{}],2:[function(require,module,exports){
(function (global){
var topLevel = typeof global !== 'undefined' ? global :
    typeof window !== 'undefined' ? window : {}
var minDoc = require('min-document');

if (typeof document !== 'undefined') {
    module.exports = document;
} else {
    var doccy = topLevel['__GLOBAL_DOCUMENT_CACHE@4'];

    if (!doccy) {
        doccy = topLevel['__GLOBAL_DOCUMENT_CACHE@4'] = minDoc;
    }

    module.exports = doccy;
}

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"min-document":1}],3:[function(require,module,exports){
(function (global){
'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _videoJs = (typeof window !== "undefined" ? window['videojs'] : typeof global !== "undefined" ? global['videojs'] : null);

var _videoJs2 = _interopRequireDefault(_videoJs);

// Default options for the plugin.
var defaults = {
  start: 0,
  end: 0,
  page: 1,
  perPageInMinutes: 0
};

/**
 * for fixing buffer status overflow issue
 */
var addStyle = function addStyle() {
  /**
   * Style already included, only include once
   */
  if (document.getElementById('vjs-time-offset-style')) {
    return false;
  }

  var css = '\n    .vjs-time-offset .vjs-load-progress {\n       overflow: hidden;\n    };\n  ';
  var head = document.head || document.getElementsByTagName('head')[0];
  var style = document.createElement('style');

  style.id = 'vjs-time-offset-style';
  style.type = 'text/css';
  if (style.styleSheet) {
    style.styleSheet.cssText = css;
  } else {
    style.appendChild(document.createTextNode(css));
  }

  head.appendChild(style);
};

/**
 * Function to invoke when the player is ready.
 *
 * This is a great place for your plugin to initialize itself. When this
 * function is called, the player will have its DOM and child components
 * in place.
 *
 * @function onPlayerReady
 * @param    {Player} player
 * @param    {Object} [options={}]
 */
var onPlayerReady = function onPlayerReady(player, options) {
  var offsetStart = undefined;
  var offsetEnd = undefined;
  var computedDuration = undefined;

  // trigger ended event only once
  var isEndedTriggered = false;

  /**
   * calc offsetStart and offsetEnd based on options
   * if page params is setted use page values, Otherwise use defaults
   * default perPageInMinutes based on minutes, convert to seconds
   */
  options.perPageInMinutes = options.perPageInMinutes * 60;

  // page is natural number convert it to integer
  options.page = options.page - 1;

  if (options.start > 0) {
    offsetStart = options.start;
  } else {
    offsetStart = options.page * options.perPageInMinutes;
  }

  if (options.end > 0) {
    offsetEnd = options.end;
  } else {
    offsetEnd = (options.page + 1) * options.perPageInMinutes;
  }

  computedDuration = offsetEnd - offsetStart;

  /**
   * For monkey patching take references of original methods
   * We will override original methods
   */
  var __monkey__ = {
    currentTime: player.currentTime,
    remainingTime: player.remainingTime,
    duration: player.duration
  };

  player.addClass('vjs-time-offset');

  addStyle();

  player.remainingTime = function () {
    return player.duration() - player.currentTime();
  };

  player.duration = function () {
    for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    if (offsetEnd > 0) {
      __monkey__.duration.apply(player, args);
      return computedDuration;
    }

    return __monkey__.duration.apply(player, args) - offsetStart;
  };

  player.originalDuration = function () {
    for (var _len2 = arguments.length, args = Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
      args[_key2] = arguments[_key2];
    }

    return __monkey__.duration.apply(player, args);
  };

  player.currentTime = function (seconds) {
    if (typeof seconds !== 'undefined') {
      seconds = seconds + offsetStart;

      return __monkey__.currentTime.call(player, seconds);
    }

    var current = __monkey__.currentTime.call(player) - offsetStart;

    // in safari with hls, it returns floating number numbers, fix it
    if (Math.ceil(current) < 0) {
      player.pause();
      player.currentTime(0);
      return 0;
    }
    return current;
  };

  /**
   * When user clicks play button after partition finished
   * start from beginning of partition
   */
  player.on('play', function () {
    var remaining = player.remainingTime();

    if (remaining <= 0) {
      player.currentTime(0);
      player.play();
    }
  });

  player.on('loadedmetadata', function () {
    var current = player.currentTime();
    var originalDuration = player.originalDuration();

    isEndedTriggered = false;
    // if setted end value isn't correct, Fix IT
    // it shouldn't be bigger than video length
    if (offsetEnd > originalDuration) {
      computedDuration = originalDuration - offsetStart;
    }

    // if setted start value isn't correct, Fix IT
    // it shouldn't be bigger than video length
    if (offsetStart > originalDuration) {
      offsetStart = 0;
      computedDuration = originalDuration;
    }

    if (current < 0) {
      player.currentTime(0);
    }
  });

  player.on('timeupdate', function () {
    var remaining = player.remainingTime();

    if (remaining <= 0) {
      player.pause();
      if (!isEndedTriggered) {
        player.trigger('ended');
        isEndedTriggered = true;
      }
    }
  });
};

/**
 * A video.js plugin.
 *
 * In the plugin function, the value of `this` is a video.js `Player`
 * instance. You cannot rely on the player being in a "ready" state here,
 * depending on how the plugin is invoked. This may or may not be important
 * to you; if not, remove the wait for "ready"!
 *
 * @function time-offset
 * @param    {Object} [options={}]
 *           An object of options left to the plugin author to define.
 */
var timeOffset = function timeOffset(options) {
  var _this = this;

  this.ready(function () {
    onPlayerReady(_this, _videoJs2['default'].mergeOptions(defaults, options));
  });
};

// Register the plugin with video.js.
_videoJs2['default'].plugin('timeOffset', timeOffset);

// Include the version number.
timeOffset.VERSION = '0.0.1';

exports['default'] = timeOffset;
module.exports = exports['default'];

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{}],4:[function(require,module,exports){
(function (global){
'use strict';

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _globalDocument = require('global/document');

var _globalDocument2 = _interopRequireDefault(_globalDocument);

var _qunit = (typeof window !== "undefined" ? window['QUnit'] : typeof global !== "undefined" ? global['QUnit'] : null);

var _qunit2 = _interopRequireDefault(_qunit);

var _sinon = (typeof window !== "undefined" ? window['sinon'] : typeof global !== "undefined" ? global['sinon'] : null);

var _sinon2 = _interopRequireDefault(_sinon);

var _videoJs = (typeof window !== "undefined" ? window['videojs'] : typeof global !== "undefined" ? global['videojs'] : null);

var _videoJs2 = _interopRequireDefault(_videoJs);

var _srcPlugin = require('../src/plugin');

var _srcPlugin2 = _interopRequireDefault(_srcPlugin);

var Player = _videoJs2['default'].getComponent('Player');

_qunit2['default'].test('the environment is sane', function (assert) {
  assert.strictEqual(typeof Array.isArray, 'function', 'es5 exists');
  assert.strictEqual(typeof _sinon2['default'], 'object', 'sinon exists');
  assert.strictEqual(typeof _videoJs2['default'], 'function', 'videojs exists');
  assert.strictEqual(typeof _srcPlugin2['default'], 'function', 'plugin is a function');
});

_qunit2['default'].module('videojs-time-offset', {

  beforeEach: function beforeEach() {

    // Mock the environment's timers because certain things - particularly
    // player readiness - are asynchronous in video.js 5. This MUST come
    // before any player is created; otherwise, timers could get created
    // with the actual timer methods!
    this.clock = _sinon2['default'].useFakeTimers();

    this.fixture = _globalDocument2['default'].getElementById('qunit-fixture');
    this.video = _globalDocument2['default'].createElement('video');
    this.fixture.appendChild(this.video);
    this.player = (0, _videoJs2['default'])(this.video);
  },

  afterEach: function afterEach() {
    this.player.dispose();
    this.clock.restore();
  }
});

_qunit2['default'].test('registers itself with video.js', function (assert) {
  assert.expect(2);

  assert.strictEqual(Player.prototype.timeOffset, _srcPlugin2['default'], 'videojs-time-offset plugin was registered');

  this.player.timeOffset();

  // Tick the clock forward enough to trigger the player to be "ready".
  this.clock.tick(1);

  assert.ok(this.player.hasClass('vjs-time-offset'), 'the plugin adds a class to the player');
});

_qunit2['default'].test('returns manipulated time with correct methods', function (assert) {
  // set fake duration
  this.player.cache_.duration = 40;
  this.player.timeOffset({ start: 10, end: 35 });

  this.clock.tick(1);
  assert.strictEqual(this.player.duration(), 25, 'returns correct manipulated duration');

  assert.strictEqual(this.player.currentTime(), 0, 'returns correct manipulated currentTime');

  assert.strictEqual(this.player.remainingTime(), 25, 'returns correct manipulated currentTime');
});

_qunit2['default'].test('returns manipulated time with correct page methods', function (assert) {
  // set fake duration
  var perPageInMinutes = 5;
  var page = 1;
  var perPageInSeconds = perPageInMinutes * 60;

  this.player.cache_.duration = 400;
  this.player.timeOffset({ page: page, perPageInMinutes: perPageInMinutes });

  this.clock.tick(1);
  assert.strictEqual(this.player.duration(), perPageInSeconds, 'returns correct manipulated duration by page params');

  assert.strictEqual(this.player.currentTime(), 0, 'returns correct manipulated currentTime by page params');

  assert.strictEqual(this.player.remainingTime(), perPageInSeconds, 'returns correct manipulated currentTime by page params');
});

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"../src/plugin":3,"global/document":2}]},{},[4]);
