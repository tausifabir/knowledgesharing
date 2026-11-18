import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { workingFlow } from '../main/resources/static/patterns-flow.mjs';
import { storyboard, createAnimation } from '../main/resources/static/patterns-animation.mjs';

const input = { type: 'birthday', message: '<img src=x>', addition: ' Extra', recipient: 'Alice', venue: 'Hall', theme: 'Gold', dressCode: 'Formal', weapon: 'Wand', armor: 'Robe', specialAbility: 'Ice', level: '42', comboSkills: 'Freeze' };
const patterns = ['singleton', 'prototype', 'simple-factory', 'factory-method', 'abstract-factory', 'builder', 'character-factory', 'character-builder', 'factory-vs-builder'];
for (const pattern of patterns) {
  const types = ['simple-factory', 'factory-method', 'abstract-factory'].includes(pattern)
    ? ['wedding', 'birthday', 'visiting', 'membership', 'gift', 'playing']
    : pattern.startsWith('character') ? ['warrior', 'mage', 'archer'] : ['wedding', 'birthday'];
  for (const type of types) {
    const values = { ...input, type };
    const steps = storyboard(pattern, values);
    const rows = workingFlow(pattern, values, steps);
    assert.equal(rows.length, steps.length, `${pattern}/${type}: step mismatch`);
    assert.ok(rows.every(row => row.actor && row.action && row.transfer));
    if (pattern === 'builder' || pattern === 'character-builder') {
      assert.ok(rows.slice(1, -1).every(row => row.transfer.includes('same builder reference')));
    }
  }
}
const flow = pattern => workingFlow(pattern, input, storyboard(pattern, input));
assert.match(flow('prototype')[1].transfer, /shared/);
assert.match(flow('prototype')[2].transfer, /new StringBuilder/);
assert.match(flow('factory-method').at(-1).transfer, /does not return the card/);
assert.match(flow('abstract-factory').at(-1).transfer, /Two pairs/);
assert.match(flow('character-factory').at(-1).transfer, /not a Character object/);
assert.match(flow('factory-vs-builder')[0].transfer, /concurrently/);

class Element extends EventTarget {
  children = [];
  attributes = {};
  textContent = '';
  classes = new Set();
  classList = { add: name => this.classes.add(name), toggle: (name, active) => active ? this.classes.add(name) : this.classes.delete(name) };
  append(...children) { children.forEach(child => { child.parentNode = this; }); this.children.push(...children); }
  replaceChildren(...children) { this.children = []; this.append(...children); }
  setAttribute(key, value) { this.attributes[key] = value; }
  getAttribute(key) { return this.attributes[key]; }
  removeAttribute(key) { delete this.attributes[key]; }
  focus() { this.focused = true; }
  click() { if (!this.disabled) this.dispatchEvent(new Event('click')); }
  querySelector() { return null; }
}
const original = { document: globalThis.document, setInterval: globalThis.setInterval, clearInterval: globalThis.clearInterval };
try {
  const ids = ['object-scene', 'animation-caption', 'caption-sizing', 'animation-step', 'animation-play', 'animation-next', 'animation-previous', 'animation-progress', 'animation-restart', 'animation-pace', 'code', 'data-flow', 'simple-view', 'structure-view', 'flow-view', 'simple-tab', 'structure-tab', 'flow-tab'];
  const elements = new Map(ids.map(id => ['#' + id, new Element()]));
  const get = id => elements.get('#' + id);
  const tabs = ['simple', 'structure', 'flow'].map(view => {
    const tab = get(view + '-tab');
    tab.setAttribute('aria-controls', view + '-view');
    return tab;
  });
  const doc = new EventTarget();
  doc.querySelector = selector => elements.get(selector);
  doc.querySelectorAll = () => tabs;
  doc.createElement = () => new Element();
  globalThis.document = doc;
  let tick, delay;
  globalThis.setInterval = (callback, interval) => { tick = callback; delay = interval; return 1; };
  globalThis.clearInterval = () => { tick = undefined; };
  const update = createAnimation();
  update('prototype', input);
  assert.equal(get('data-flow').children.length, 4);
  assert.equal(get('caption-sizing').children.length, 4);
  assert.equal(get('data-flow').children[0].attributes['aria-current'], 'step');
  assert.ok(get('data-flow').children[0].children[2].textContent.includes('<img src=x>'));
  assert.equal(get('data-flow').children[0].children[2].children.length, 0);
  get('animation-next').click();
  const rows = [...get('data-flow').children];
  assert.equal(rows[0].attributes['aria-current'], undefined);
  assert.equal(rows[1].attributes['aria-current'], 'step');
  get('animation-play').click();
  assert.equal(delay, 9000);
  get('flow-tab').click();
  assert.equal(tick, undefined);
  assert.equal(get('flow-view').hidden, false);
  assert.equal(get('simple-view').hidden, true);
  assert.equal(get('structure-view').hidden, true);
  assert.equal(get('flow-tab').tabIndex, 0);
  assert.equal(get('simple-tab').tabIndex, -1);
  assert.equal(get('animation-step').textContent, 'Step 2 of 4');
  assert.deepEqual(get('data-flow').children, rows);
  const key = new Event('keydown', { cancelable: true });
  key.key = 'ArrowRight';
  get('flow-tab').dispatchEvent(key);
  assert.equal(get('simple-view').hidden, false);
  assert.equal(get('simple-tab').focused, true);
  get('animation-pace').value = '12000';
  get('animation-play').click();
  assert.equal(delay, 12000);
  get('animation-pace').dispatchEvent(new Event('change'));
  assert.equal(tick, undefined);
  get('animation-restart').click();
  assert.equal(rows[0].attributes['aria-current'], 'step');
  update('builder', input);
  assert.equal(get('data-flow').children.length, storyboard('builder', input).length);
} finally {
  Object.assign(globalThis, original);
}
const html = readFileSync(new URL('../main/resources/static/patterns.html', import.meta.url), 'utf8');
assert.equal((html.match(/role="tab" /g) || []).length, 3);
assert.equal((html.match(/role="tabpanel" /g) || []).length, 3);
assert.ok(html.includes('id="flow-view"'));
console.log('All nine working flows, safe rendering, synchronized tabs, keyboard navigation, pace, and reset checks passed.');
