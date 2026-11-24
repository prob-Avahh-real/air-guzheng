const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

/** Mirrors index.html bendString pitch math */
function bendFreq(baseFreq, semis, min = -2, max = 3) {
  const s = Math.max(min, Math.min(max, semis));
  return baseFreq * Math.pow(2, s / 12);
}

function parsePentFromHtml(html) {
  const block = html.match(/const PENT = \[([\s\S]*?)\];/);
  assert.ok(block, 'PENT array missing');
  const freqs = [...block[1].matchAll(/freq:([0-9.]+)/g)].map((m) => Number(m[1]));
  return freqs;
}

describe('air-guzheng press bend', () => {
  it('clamps bend to −2..+3 semitones', () => {
    const base = 440;
    assert.ok(Math.abs(bendFreq(base, 10) - bendFreq(base, 3)) < 1e-9);
    assert.ok(Math.abs(bendFreq(base, -9) - bendFreq(base, -2)) < 1e-9);
  });

  it('raises pitch for positive press', () => {
    assert.ok(bendFreq(440, 2) > 440);
    assert.ok(bendFreq(440, -1) < 440);
  });
});

describe('air-guzheng protocol', () => {
  const protocol = JSON.parse(
    fs.readFileSync(path.join(__dirname, '..', 'protocol', 'air-guzheng.json'), 'utf8')
  );

  it('declares 21-string pentatonic model', () => {
    assert.equal(protocol.model.strings, 21);
    assert.match(protocol.model.tuning, /pentatonic|五声|宫商角徵羽/i);
    assert.equal(protocol.bend_semitones.min, -2);
    assert.equal(protocol.bend_semitones.max, 3);
  });

  it('maps ring to select-only and cane to pluck', () => {
    assert.equal(protocol.gestures.ring.tilt_left_right.action, 'select_string');
    assert.equal(protocol.gestures.cane.tap.action, 'pluck_selected');
    assert.equal(protocol.gestures.touch.hold_horizontal_drag.action, 'press_bend');
    assert.equal(protocol.gestures.cane.tap.accel_spike, 8);
  });
});

describe('air-guzheng HTML core', () => {
  const html = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');

  it('includes brand and watch media query', () => {
    assert.match(html, /空气古筝|Air Guzheng/);
    assert.match(html, /max-width:\s*280px/);
    assert.match(html, /max-height:\s*300px/);
  });

  it('has 21 D-pentatonic strings from D3 to D7', () => {
    const freqs = parsePentFromHtml(html);
    assert.equal(freqs.length, 21);
    assert.ok(Math.abs(freqs[0] - 146.83) < 0.02);
    assert.ok(Math.abs(freqs[freqs.length - 1] - 2349.32) < 0.1);
    assert.ok(freqs.includes(440));
  });

  it('implements pluck, bend, and ring select-only', () => {
    assert.match(html, /function pluckString/);
    assert.match(html, /function bendString/);
    assert.match(html, /liveStrings/);
    assert.match(html, /Ring only selects string/);
    assert.match(html, /DeviceOrientationEvent/);
    assert.match(html, /DeviceMotionEvent/);
  });

  it('keeps www/ bendString in sync', () => {
    const www = fs.readFileSync(path.join(__dirname, '..', 'www', 'index.html'), 'utf8');
    assert.match(www, /function bendString/);
    assert.match(www, /Ring only selects string/);
  });
});
