import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { factoryGuide, renderFactoryGuide } from '../main/resources/static/patterns-factory.mjs';

for (const pattern of ['simple-factory', 'factory-method', 'abstract-factory', 'character-factory', 'builder', 'character-builder']) {
  const types = pattern === 'simple-factory' ? ['wedding', 'birthday', 'visiting', 'membership', 'gift', 'playing'] : pattern.startsWith('character-') ? ['warrior', 'mage', 'archer'] : ['wedding', 'birthday'];
  for (const [index, type] of types.entries()) {
    const guide = factoryGuide(pattern, { type });
    assert.equal(guide.rows.length, types.length);
    assert.equal(guide.rows.filter(row => row.selected).length, 1);
    assert.equal(guide.rows[index].selected, true);
    guide.rows.forEach(row => assert.equal(row.cells.length, guide.columns.length));
    assert.ok(guide.decision && guide.source);
    assert.ok(guide.flow.length >= 4);
    assert.ok(guide.facts.some(([label]) => label.startsWith('Add a')));
  }
  assert.equal(factoryGuide(pattern, {}).rows[0].selected, true);
}
for (const pattern of ['singleton', 'factory-vs-builder']) {
  assert.equal(factoryGuide(pattern, {}), null);
}
assert.match(factoryGuide('simple-factory', { type: 'birthday' }).flow.at(-1), /"Birthday invitation"/);
for (const type of ['wedding', 'birthday', 'visiting', 'membership', 'gift', 'playing']) {
  const guide = factoryGuide('simple-factory', { type });
  const name = type[0].toUpperCase() + type.slice(1);
  assert.equal(guide.rows.find(row => row.selected).cells[1], `${name}Invitation`);
  assert.ok(guide.flow.at(-1).includes(`${name} invitation`));
}
assert.match(factoryGuide('simple-factory', {}).facts.find(([label]) => label === 'Add a new card type')[1], /20 types/);
assert.match(factoryGuide('factory-method', { type: 'wedding' }).flow.at(-1), /"Prepared: Wedding invitation"/);
assert.match(factoryGuide('abstract-factory', { type: 'birthday' }).flow.at(-1), /"Birthday invitation \+ Birthday envelope"/);
assert.match(factoryGuide('abstract-factory', {}).facts.find(([label]) => label === 'Fresh objects')[1], /own pair/);
assert.match(factoryGuide('character-factory', {}).facts.find(([label]) => label === 'Return value')[1], /String, not a Character object/);
assert.deepEqual(factoryGuide('character-factory', { type: 'mage' }).rows[1].cells, ['MageCreator', 'Arcane Staff', 'Silk Robe', 'Fireball']);

const birthdayBuilder = factoryGuide('builder', { type: 'birthday', recipient: 'Bob', venue: 'Garden', theme: 'Blue', dressCode: 'Formal' });
assert.deepEqual(birthdayBuilder.rows[1].cells, ['BirthdayBuilderInvitation.Builder', 'BirthdayBuilderInvitation', 'recipient, venue, theme, dressCode']);
assert.ok(birthdayBuilder.flow.some(text => text.includes('dressCode("Formal")')));
for (const type of ['wedding', 'birthday']) {
  assert.ok(factoryGuide('builder', { type }).flow.some(text => /calls the public .* constructor/.test(text)));
}
assert.match(birthdayBuilder.flow.at(-1), /Birthday invitation for Bob at Garden \| Theme: Blue \| Dress Code: Formal/);
assert.ok(!factoryGuide('builder', { type: 'wedding' }).flow.some(text => text.includes('dressCode(')));
assert.match(factoryGuide('builder', {}).facts.find(([label]) => label === 'Defaults')[1], /Main Hall/);
assert.match(factoryGuide('builder', {}).facts.find(([label]) => label === 'Creation roles')[1], /no separate Director/);
const mageBuilder = factoryGuide('character-builder', { type: 'mage', weapon: 'Wand', armor: 'Robe', specialAbility: 'Ice', level: '42', comboSkills: 'Freeze' });
assert.ok(mageBuilder.flow.some(text => text.includes('level(42)')));
for (const level of ['', '0', '101', '2.5', 'bad']) {
  const guide = factoryGuide('character-builder', { type: 'mage', level });
  assert.ok(guide.flow.some(text => text.includes('no valid level call')));
}
assert.match(factoryGuide('builder', { type: 'wedding', recipient: ' ', venue: 'Hall', theme: 'Gold' }).flow.at(-1), /no successful product preview/);
assert.match(mageBuilder.flow.at(-1), /new MageBuilder/);
assert.match(mageBuilder.facts.find(([label]) => label === 'Return value')[1], /mutable/);

class Element {
  children = [];
  constructor(tag) { this.tagName = tag; }
  append(...nodes) { this.children.push(...nodes); }
  replaceChildren(...nodes) { this.children = nodes; }
}
const original = globalThis.document;
const ids = ['factory-guide', 'factory-guide-title', 'factory-selected-branch', 'factory-decision', 'factory-families', 'factory-flow', 'factory-facts', 'factory-guide-source'];
const elements = Object.fromEntries(ids.map(id => [`#${id}`, new Element('div')]));
try {
  globalThis.document = { querySelector: id => elements[id], createElement: tag => new Element(tag) };
  renderFactoryGuide('simple-factory', { type: 'birthday' });
  assert.equal(elements['#factory-guide'].hidden, false);
  assert.equal(elements['#factory-selected-branch'].textContent, 'Selected branch: birthday');
  const [caption, head, body] = elements['#factory-families'].children;
  assert.equal(caption.tagName, 'caption');
  assert.ok(head.children[0].children.every(cell => cell.scope === 'col'));
  assert.equal(body.children[0].children[0].textContent, 'Alternative');
  assert.equal(body.children[1].children[0].textContent, 'Selected');
  assert.equal(body.children[1].className, 'factory-selected');
  renderFactoryGuide('character-factory', { type: 'archer' });
  assert.equal(elements['#factory-families'].children[2].children.length, 3);
  assert.equal(elements['#factory-selected-branch'].textContent, 'Selected branch: ArcherCreator');
  elements['#factory-guide'].open = true;
  renderFactoryGuide('builder', { type: 'birthday', recipient: '<img src=x>', venue: 'Hall', theme: 'Gold', dressCode: 'Formal' });
  assert.equal(elements['#factory-guide'].open, true, 'Changing inputs preserves the expanded guide');
  assert.equal(elements['#factory-guide'].hidden, false);
  assert.equal(elements['#factory-selected-branch'].textContent, 'Selected branch: BirthdayBuilderInvitation.Builder');
  assert.match(elements['#factory-guide-title'].textContent, /Builder/);
  assert.ok(elements['#factory-flow'].children.some(node => node.textContent.includes('<img src=x>')));
  assert.ok(elements['#factory-flow'].children.every(node => node.children.length === 0));
  renderFactoryGuide('character-builder', { type: 'mage' });
  assert.equal(elements['#factory-families'].children[2].children.length, 3);
  assert.equal(elements['#factory-selected-branch'].textContent, 'Selected branch: MageBuilder');
  renderFactoryGuide('prototype', { message: 'Original', addition: ' Extra' });
  assert.equal(elements['#factory-guide'].hidden, false);
  assert.equal(elements['#factory-selected-branch'].textContent, 'Selected branch: shallowCopy()');
  assert.equal(elements['#factory-families'].children[2].children.length, 2);
  renderFactoryGuide('singleton', {});
  assert.equal(elements['#factory-guide'].hidden, true);
  renderFactoryGuide('abstract-factory', { type: 'wedding' });
  assert.equal(elements['#factory-guide'].hidden, false);
  assert.equal(elements['#factory-facts'].children.length, 12);
} finally { globalThis.document = original; }

const html = readFileSync(new URL('../main/resources/static/patterns.html', import.meta.url), 'utf8');
for (const id of ids) assert.ok(html.includes(`id="${id}"`), `Missing guide element: ${id}`);
assert.match(html, /<details id="factory-guide"[^>]*hidden>/);
assert.match(html, /class="factory-table-scroll"[^>]*tabindex="0"/);
const script = readFileSync(new URL('../main/resources/static/patterns.js', import.meta.url), 'utf8');
assert.match(script, /import \{ renderFactoryGuide \} from '\.\/patterns-factory\.mjs'/);
assert.match(script, /renderFactoryGuide\(selected\.id, input\)/);
assert.match(script, /\['type', 'Card type', simpleProducts\.map\(product => product\.type\)\]/);
assert.match(script, /fields: examples\.find\(example => example\.id === 'builder'\)\.fields/);
console.log('Factory and builder branches, return values, guide rendering, and page integration passed.');
