import assert from 'node:assert/strict';
import { storyboard, createAnimation } from '../main/resources/static/patterns-animation.mjs';
import { snippet } from '../main/resources/static/patterns-snippets.mjs';

const input = { type: 'birthday', message: 'Original', addition: ' + dinner', recipient: 'Alice', venue: 'Garden',
  theme: 'Gold', dressCode: 'Formal', weapon: 'Staff', armor: 'Robe', specialAbility: 'Fireball', level: 10, comboSkills: 'Meteor' };
const patterns = ['singleton', 'prototype', 'simple-factory', 'factory-method', 'abstract-factory', 'builder', 'character-factory', 'character-builder', 'factory-vs-builder'];
for (const pattern of patterns) {
  for (const type of pattern.startsWith('character') ? ['warrior', 'mage', 'archer'] : ['wedding', 'birthday']) {
    const values = { ...input, type };
    const code = snippet(pattern, values);
    const steps = storyboard(pattern, values);
    assert.ok(steps.length >= 3);
    for (const step of steps) {
      assert.ok(step.caption.length > 10);
      const teachingText = [step.caption, ...step.nodes.flatMap(node => [node.label, node.detail])].join(' ');
      assert.doesNotMatch(teachingText, /InvitationFactory|InvitationCard|Whiteboard|\b(?:Wedding|Birthday)(?:Event|Factory|Invitation|Builder)|\b(?:Warrior|Mage|Archer)(?:Creator|Builder)|\b(?:dressCode|specialAbility|comboSkills)\b|\w+\(\)/);
      assert.ok(code.includes(step.match), `${pattern}: highlight missing: ${step.match}`);
      assert.ok(step.nodes.length > 0);
      step.nodes.forEach(node => { assert.equal(typeof node.label, 'string'); assert.equal(typeof node.detail, 'string'); });
    }
  }
}
const copied = storyboard('prototype', input).at(-1).nodes;
assert.ok(copied[0].detail.includes('Original + dinner'));
assert.ok(copied[1].detail.includes('Original + dinner'));
assert.ok(copied[2].detail.includes('Original'));
for (const type of ['wedding', 'birthday', 'visiting', 'membership', 'gift', 'playing']) {
  const steps = storyboard('simple-factory', { ...input, type });
  assert.equal(steps.length, 5);
  assert.ok(steps.every(step => step.nodes.length === 3));
  assert.match(steps[1].nodes[1].detail, new RegExp(`${type[0].toUpperCase() + type.slice(1)} branch: selected`));
  assert.match(steps[2].nodes[2].detail, new RegExp(`New ${type} invitation`));
  assert.match(steps[3].caption, /returns one object/);
}
assert.equal(storyboard('singleton', input).at(-1).nodes[2].detail, 'Original');
assert.ok(storyboard('builder', input).at(-1).nodes[1].detail.includes('Dress Code: Formal'));
assert.ok(!storyboard('builder', { ...input, type: 'wedding' }).at(-1).nodes[1].detail.includes('Dress Code'));
assert.ok(storyboard('character-factory', { ...input, type: 'mage' }).at(-1).nodes[0].detail.includes('Arcane Staff'));

// Minimal DOM/timer stubs exercise playback without launching a browser.
class Element extends EventTarget {
  children = [];
  textContent = '';
  disabled = false;
  attributes = {};
  classes = new Set();
  classList = {
    add: value => this.classes.add(value),
    toggle: (value, active) => active ? this.classes.add(value) : this.classes.delete(value)
  };
  animations = [];
  removeAttribute(key) { delete this.attributes[key]; }
  append(...children) { children.forEach(child => { child.parentNode = this; }); this.children.push(...children); }
  replaceChildren(...children) { this.children = []; this.append(...children); }
  querySelector(selector) { return this.children.find(child => selector === '.object-outgoing' && child.classes.has('object-outgoing')); }
  cloneNode(deep) {
    const clone = new Element();
    clone.textContent = this.textContent;
    if (deep) clone.append(...this.children.map(child => child.cloneNode(true)));
    return clone;
  }
  remove() { this.parentNode.children = this.parentNode.children.filter(child => child !== this); }
  getAnimations() { return this.animations; }
  animate(frames, timing) {
    const animation = { frames, timing, cancel() { this.oncancel?.(); } };
    this.animations.push(animation);
    return animation;
  }
  setAttribute(key, value) { this.attributes[key] = value; }
  click() { if (!this.disabled) this.dispatchEvent(new Event('click')); }
}
const original = { document: globalThis.document, setInterval: globalThis.setInterval, clearInterval: globalThis.clearInterval, matchMedia: globalThis.matchMedia };
try {
  const elements = new Map(['object-scene', 'animation-caption', 'animation-step', 'animation-play', 'animation-next', 'animation-previous', 'animation-progress', 'animation-restart', 'code'].map(id => ['#' + id, new Element()]));
  const doc = new EventTarget();
  doc.querySelector = selector => elements.get(selector);
  doc.createElement = () => new Element();
  globalThis.document = doc;
  let tick, interval;
  globalThis.setInterval = (callback, delay) => { tick = callback; interval = delay; return 1; };
  globalThis.clearInterval = () => { tick = undefined; };
  const update = createAnimation();
  const get = id => elements.get('#' + id);
  update('singleton', input);
  assert.equal(get('animation-step').textContent, 'Step 1 of 4');
  assert.ok(get('code').children.some(line => line.classes.has('code-active')));
  const firstCard = get('object-scene').children[0];
  const firstCodeRow = get('code').children[0];
  assert.equal(firstCodeRow.attributes['data-line'], '1');
  assert.ok(get('code').children.every(row => !row.textContent.includes('\n')));
  assert.equal(get('code').children.length, snippet('singleton', input).split('\n').length);
  assert.equal(get('animation-previous').disabled, true);
  get('animation-next').click();
  assert.equal(get('animation-step').textContent, 'Step 2 of 4');
  assert.equal(get('object-scene').children[0], firstCard);
  assert.equal(get('code').children[0], firstCodeRow);
  const previousNodes = storyboard('singleton', input)[0].nodes;
  const currentNodes = storyboard('singleton', input)[1].nodes;
  currentNodes.forEach((node, position) => {
    const before = previousNodes[position];
    assert.equal(get('object-scene').children[position].classes.has('object-changed'),
      !before || before.label !== node.label || before.detail !== node.detail);
  });
  assert.equal(get('animation-progress').value, 2);
  const content = firstCard.children[0];
  assert.equal(content.animations.at(-1).timing.duration, 1200);
  assert.deepEqual(content.animations.at(-1).frames, [{ opacity: 0 }, { opacity: 1 }]);
  const outgoing = firstCard.querySelector('.object-outgoing');
  assert.equal(outgoing.attributes['aria-hidden'], 'true');
  assert.equal(outgoing.children[1].textContent, previousNodes[0].detail);
  outgoing.animations.at(-1).onfinish();
  assert.equal(firstCard.querySelector('.object-outgoing'), undefined);
  get('animation-previous').click();
  assert.equal(get('animation-step').textContent, 'Step 1 of 4');
  get('animation-next').click();
  get('animation-play').click();
  assert.equal(get('animation-play').textContent, 'Pause');
  assert.equal(interval, 6500);
  tick(); tick();
  assert.equal(get('animation-step').textContent, 'Step 4 of 4');
  assert.equal(get('animation-next').disabled, true);
  assert.equal(tick, undefined);
  get('animation-play').click();
  assert.equal(get('animation-step').textContent, 'Step 1 of 4');
  get('animation-play').click();
  assert.equal(tick, undefined);
  get('animation-play').click();
  update('prototype', input);
  assert.equal(tick, undefined);
  assert.equal(get('animation-step').textContent, 'Step 1 of 4');
  get('animation-next').click();
  get('animation-restart').click();
  assert.equal(get('animation-step').textContent, 'Step 1 of 4');
  get('animation-play').click();
  doc.hidden = true;
  doc.dispatchEvent(new Event('visibilitychange'));
  assert.equal(tick, undefined);
  update('character-factory', input);
  const slots = [...get('object-scene').children];
  const reservedSizes = slots.map(card => card.children[1]);
  assert.equal(slots[2].attributes['aria-hidden'], 'true');
  assert.ok(slots.every(card => card.hidden !== true));
  for (let step = 1; step < 5; step++) get('animation-next').click();
  assert.deepEqual(get('object-scene').children, slots);
  assert.ok(slots.every((card, index) => card.children[1] === reservedSizes[index]));
  assert.equal(slots[1].attributes['aria-hidden'], 'true');
  globalThis.matchMedia = () => ({ matches: true });
  update('singleton', input);
  get('animation-next').click();
  assert.ok(get('object-scene').children.every(card => card.children[0].animations.length === 0));
  assert.ok(get('object-scene').children.every(card => !card.querySelector('.object-outgoing')));
} finally {
  Object.assign(globalThis, original);
}
console.log('All nine storyboards, code highlights, playback, reset, and pause checks passed.');
