import assert from 'node:assert/strict';
import { structure, renderStructure } from '../main/resources/static/patterns-structure.mjs';
import { storyboard } from '../main/resources/static/patterns-animation.mjs';
const patterns = ['singleton', 'prototype', 'simple-factory', 'factory-method', 'abstract-factory', 'builder', 'character-factory', 'character-builder', 'factory-vs-builder'];
const input = { type: 'birthday', message: 'Hello', addition: '!', recipient: 'Alice', venue: 'Hall', theme: 'Gold', dressCode: 'Formal', weapon: 'Staff', armor: 'Robe', specialAbility: 'Fireball', level: 10, comboSkills: 'Meteor' };
for (const pattern of patterns) {
  for (const type of pattern.startsWith('character') ? ['warrior', 'mage', 'archer'] : ['wedding', 'birthday']) {
    const values = { ...input, type };
    const model = structure(pattern, values);
    assert.ok(model.boxes.length >= 2);
    model.boxes.forEach(box => { assert.ok(box.name); assert.ok(box.role); assert.ok(box.members.length); });
    const steps = storyboard(pattern, values);
    for (const { match } of steps) {
      // Simple Factory's declaration is setup, not a call; other steps map to relationships.
      if (pattern === 'simple-factory' && match === 'Invitation invitation') continue;
      assert.ok(model.links.some(link => link.match === match), `${pattern}: missing relationship for ${match}`);
    }
  }
}
assert.ok(structure('simple-factory', input).links.some(link => link.from === 'BirthdayInvitation' && link.relation === 'implements' && link.to === 'Invitation'));
for (const type of ['wedding', 'birthday', 'visiting', 'membership', 'gift', 'playing']) {
  const model = structure('simple-factory', { ...input, type });
  assert.equal(model.boxes.length, 8);
  assert.equal(model.boxes.filter(box => box.role === 'Selected concrete class').length, 1);
  assert.equal(model.boxes[2].name, `${type[0].toUpperCase() + type.slice(1)}Invitation`);
  assert.equal(model.links.filter(link => link.relation === 'implements').length, 6);
}
assert.ok(structure('factory-method', input).links.some(link => link.from === 'BirthdayEvent' && link.relation === 'extends' && link.to === 'InvitationEvent.InvitingEvent'));
assert.ok(structure('character-builder', { ...input, type: 'mage' }).links.some(link => link.from === 'MageBuilder' && link.to === 'CharacterBaseBuilder'));
assert.ok(structure('builder', input).boxes[0].members.includes('dressCode(value)'));
assert.ok(!structure('builder', { ...input, type: 'wedding' }).boxes[0].members.includes('dressCode(value)'));

class Element {
  children = [];
  classes = new Set();
  attributes = {};
  classList = { toggle: (name, active) => active ? this.classes.add(name) : this.classes.delete(name) };
  append(...nodes) { this.children.push(...nodes); }
  replaceChildren(...nodes) { this.children = nodes; }
  setAttribute(name, value) { this.attributes[name] = value; }
  removeAttribute(name) { delete this.attributes[name]; }
}
const original = globalThis.document;
try {
  const boxes = new Element();
  const links = new Element();
  globalThis.document = { querySelector: id => id === '#structure-boxes' ? boxes : links, createElement: () => new Element() };
  const highlight = renderStructure(structure('simple-factory', input));
  highlight('InvitationFactory.create');
  assert.equal(links.children.filter(row => row.classes.has('structure-active')).length, 2);
  assert.equal(links.children[1].attributes['aria-current'], 'step');
  highlight('invitation.message()');
  assert.equal(links.children[1].attributes['aria-current'], undefined);
  assert.equal(links.children[2].attributes['aria-current'], 'step');
  assert.equal(boxes.children[2].children[1].textContent, 'BirthdayInvitation');
} finally { globalThis.document = original; }
console.log('All code structure models and synchronized relationship highlights passed.');
