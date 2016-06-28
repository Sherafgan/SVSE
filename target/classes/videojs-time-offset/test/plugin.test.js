import document from 'global/document';

import QUnit from 'qunit';
import sinon from 'sinon';
import videojs from 'video.js';

import plugin from '../src/plugin';

const Player = videojs.getComponent('Player');

QUnit.test('the environment is sane', function(assert) {
  assert.strictEqual(typeof Array.isArray, 'function', 'es5 exists');
  assert.strictEqual(typeof sinon, 'object', 'sinon exists');
  assert.strictEqual(typeof videojs, 'function', 'videojs exists');
  assert.strictEqual(typeof plugin, 'function', 'plugin is a function');
});

QUnit.module('videojs-time-offset', {

  beforeEach() {

    // Mock the environment's timers because certain things - particularly
    // player readiness - are asynchronous in video.js 5. This MUST come
    // before any player is created; otherwise, timers could get created
    // with the actual timer methods!
    this.clock = sinon.useFakeTimers();

    this.fixture = document.getElementById('qunit-fixture');
    this.video = document.createElement('video');
    this.fixture.appendChild(this.video);
    this.player = videojs(this.video);
  },

  afterEach() {
    this.player.dispose();
    this.clock.restore();
  }
});

QUnit.test('registers itself with video.js', function(assert) {
  assert.expect(2);

  assert.strictEqual(
    Player.prototype.timeOffset,
    plugin,
    'videojs-time-offset plugin was registered'
  );

  this.player.timeOffset();

  // Tick the clock forward enough to trigger the player to be "ready".
  this.clock.tick(1);

  assert.ok(
    this.player.hasClass('vjs-time-offset'),
    'the plugin adds a class to the player'
  );
});

QUnit.test('returns manipulated time with correct methods', function(assert) {
  // set fake duration
  this.player.cache_.duration = 40;
  this.player.timeOffset({ start: 10, end: 35 });

  this.clock.tick(1);
  assert.strictEqual(
    this.player.duration(),
    25,
    'returns correct manipulated duration'
  );

  assert.strictEqual(
    this.player.currentTime(),
    0,
    'returns correct manipulated currentTime'
  );

  assert.strictEqual(
    this.player.remainingTime(),
    25,
    'returns correct manipulated currentTime'
  );
});

QUnit.test('returns manipulated time with correct page methods', function(assert) {
  // set fake duration
  const perPageInMinutes = 5;
  const page = 1;
  const perPageInSeconds = perPageInMinutes * 60;

  this.player.cache_.duration = 400;
  this.player.timeOffset({ page, perPageInMinutes });

  this.clock.tick(1);
  assert.strictEqual(
    this.player.duration(),
    perPageInSeconds,
    'returns correct manipulated duration by page params'
  );

  assert.strictEqual(
    this.player.currentTime(),
    0,
    'returns correct manipulated currentTime by page params'
  );

  assert.strictEqual(
    this.player.remainingTime(),
    perPageInSeconds,
    'returns correct manipulated currentTime by page params'
  );
});
