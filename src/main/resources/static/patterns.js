import { execute } from './patterns-snippets.mjs';
import { createAnimation } from './patterns-animation.mjs';
import { renderFactoryGuide } from './patterns-factory.mjs';
import { simpleProducts } from './patterns-products.mjs';

const events = ['wedding', 'birthday'];
const characters = ['warrior', 'mage', 'archer'];
const examples = [
  { id: 'singleton', name: 'Singleton', description: 'One whiteboard. Two references. See how one shared instance connects Alice and Bob.',
    fields: [['message', 'Write as Alice', 'Hello from Alice']],
    hint: 'Application-wide state: your message replaces the board shared by all visitors. Do not enter private content.',
    takeaway: 'Alice and Bob reference the exact same Whiteboard, not two objects with equal text.', source: 'singleton/Whiteboard.java' },
  { id: 'prototype', name: 'Prototype', description: 'Copy an invitation, then change its message. Compare a shared reference with an independent deep copy.',
    fields: [['message', 'Template message', 'Wedding at 6 PM.'], ['addition', 'Append to shallow copy', ' Dinner included.']],
    hint: 'Both copies are made before appending to the shallow message. Leading spaces are preserved.',
    takeaway: 'A new outer object does not guarantee independent nested state. shallowCopy() shares StringBuilder; deepCopy() duplicates it.', source: 'prototype/InvitationCard.java' },
  { id: 'simple-factory', name: 'Simple Factory', description: 'Choose among six card types. One central method creates the matching product; adding choices does not change the pattern.',
    fields: [['type', 'Card type', simpleProducts.map(product => product.type)]], hint: 'All six concrete Card classes implement the existing Invitation interface.', takeaway: 'Even 20 card types can remain Simple Factory. Factory Method uses subclass overrides; Abstract Factory creates matching product families, not merely more choices.', source: 'factory/simple/InvitationFactory.java' },
  { id: 'factory-method', name: 'Factory Method', description: 'Let an event subclass choose its invitation while the inherited preparation workflow stays the same.',
    fields: [['type', 'Card type', simpleProducts.map(product => product.type)]], takeaway: 'Each of six event subclasses overrides createInvitation(). prepareInvitation() is inherited from InvitingEvent.', source: 'factory/method/InvitationEvent.java' },
  { id: 'abstract-factory', name: 'Abstract Factory', description: 'Create a matching invitation and envelope from one event family. No mismatched products.',
    fields: [['type', 'Card family', simpleProducts.map(product => product.type)]], takeaway: 'Unlike Simple Factory, EventFactory creates multiple related product types: Invitation and Envelope.', source: 'factory/abstraction/EventFactory.java' },
  { id: 'builder', name: 'Invitation Builder', description: 'Build a personalized invitation step by step. Change individual settings before creating the final product.',
    fields: [['type', 'Event type', events], ['recipient', 'Recipient', 'Alice'], ['venue', 'Venue', 'Main Hall'], ['theme', 'Theme', 'White'], ['dressCode', 'Dress code · birthday only', 'Casual']],
    takeaway: 'Builder configures one product rather than selecting a product family. Wedding has no dress code; Birthday adds that option.', source: 'builder/WeddingBuilderInvitation.java · BirthdayBuilderInvitation.java' },
  { id: 'character-factory', name: 'Character Factory', description: 'Spawn a character with a matching weapon, armor, and special ability using the exercise factories.',
    fields: [['type', 'Character class', characters]], takeaway: 'A WarriorCreator supplies warrior gear. Factory families preserve compatible products without manual configuration.', source: 'exercise/factory/base/CharacterCreator.java' },
  { id: 'character-builder', name: 'Character Builder', description: 'Customize a character loadout, level, and combo skills using the existing fluent exercise builders.',
    fields: [['type', 'Character class', characters], ['weapon', 'Weapon', 'Greatsword'], ['armor', 'Armor', 'Plate Armor'], ['specialAbility', 'Special ability', 'Berserk Slash'], ['level', 'Level · 1–100', 10], ['comboSkills', 'Combo skills', 'Shield Bash + Whirlwind']],
    takeaway: 'These builders also act as product classes. build() creates a new instance with the chosen values; it is not an immutable character model.', source: 'exercise/builder/WarriorBuilder.java · MageBuilder.java · ArcherBuilder.java' }
];
examples.push({
  id: 'factory-vs-builder', name: 'Factory vs Builder',
  description: 'Use one event type to compare a fixed factory product with a personalized builder product.',
  fields: examples.find(example => example.id === 'builder').fields,
  hint: 'Both requests receive the same inputs. Simple Factory uses only type; Builder also uses the custom settings.',
  takeaway: 'Factory selects a product. Builder configures a product. Neither is universally better; choose based on what must vary.',
  source: 'factory/simple/InvitationFactory.java · builder/WeddingBuilderInvitation.java · BirthdayBuilderInvitation.java'
});
const form = document.querySelector('#demo-form');
const output = document.querySelector('#output');
const status = document.querySelector('#status');
const run = document.querySelector('#run');
const updateAnimation = createAnimation();
let selected;
let request;

function message(text) {
  const p = document.createElement('p');
  p.textContent = text;
  output.replaceChildren(p);
}
function clearResult() {
  status.textContent = 'Ready to run';
  status.dataset.error = 'false';
  message('Run the example to see output from the Java controller.');
}
function updatePreview() {
  const field = form.elements.dressCode;
  if (field) {
    field.disabled = form.elements.type.value !== 'birthday';
    field.closest('.field').hidden = field.disabled;
  }
  const input = Object.fromEntries(new FormData(form));
  updateAnimation(selected.id, input);
  renderFactoryGuide(selected.id, input);
}
function selectExample(example) {
  request?.abort();
  request = null;
  run.disabled = false;
  selected = example;
  document.querySelectorAll('nav button').forEach(button => button.setAttribute('aria-pressed', String(button.dataset.id === example.id)));
  for (const [selector, value] of [['#title', example.name], ['#description', example.description], ['#source', example.source], ['#takeaway', example.takeaway], ['#hint', example.hint || 'Change an input, then run the existing Java implementation.'], ['#endpoint', example.id === 'factory-vs-builder' ? '/api/patterns/simple-factory + /api/patterns/builder' : `/api/patterns/${example.id}`]]) {
    document.querySelector(selector).textContent = value;
  }
  const fields = document.querySelector('#fields');
  fields.replaceChildren();
  for (const [name, caption, initial] of example.fields) {
    const wrapper = document.createElement('div');
    wrapper.className = 'field';
    const label = document.createElement('label');
    label.htmlFor = name;
    label.textContent = caption;
    const field = document.createElement(Array.isArray(initial) ? 'select' : 'input');
    field.id = field.name = name;
    if (Array.isArray(initial)) initial.forEach(value => field.add(new Option(value[0].toUpperCase() + value.slice(1), value)));
    else {
      field.type = typeof initial === 'number' ? 'number' : 'text';
      field.defaultValue = initial;
      field.required = true;
      if (field.type === 'number') { field.min = '1'; field.max = '100'; field.step = '1'; }
      else field.maxLength = 500;
    }
    wrapper.append(label, field);
    fields.append(wrapper);
  }
  updatePreview();
  clearResult();
}
examples.forEach((example, index) => {
  const button = document.createElement('button');
  button.type = 'button';
  button.dataset.id = example.id;
  const number = document.createElement('span');
  number.textContent = String(index + 1).padStart(2, '0');
  number.setAttribute('aria-hidden', 'true');
  button.append(number, example.name);
  button.addEventListener('click', () => {
    history.replaceState(null, '', `#${example.id}`);
    selectExample(example);
  });
  document.querySelector('#patterns').append(button);
});
function inputsChanged() {
  request?.abort();
  request = null;
  run.disabled = false;
  updatePreview();
  clearResult();
}
form.addEventListener('input', inputsChanged);
form.addEventListener('change', inputsChanged);
form.addEventListener('reset', () => {
  request?.abort();
  request = null;
  run.disabled = false;
  setTimeout(() => { updatePreview(); clearResult(); }, 0);
});
form.addEventListener('submit', async event => {
  event.preventDefault();
  const input = Object.fromEntries(new FormData(form));
  if ('level' in input) input.level = Number(input.level);
  request?.abort();
  const current = new AbortController();
  request = current;
  run.disabled = true;
  status.textContent = 'Running…';
  status.dataset.error = 'false';
  output.replaceChildren();
  try {
    const results = await execute(selected.id, input, current.signal);
    if (request !== current) return;
    for (const result of results) {
      const section = document.createElement('section');
      if (results.length > 1) {
        const heading = document.createElement('h3');
        heading.textContent = result.pattern === 'simple-factory' ? 'Factory · fixed product' : 'Builder · custom product';
        section.append(heading);
      }
      const list = document.createElement('dl');
      for (const [label, value] of Object.entries(result.output)) {
        const term = document.createElement('dt');
        const detail = document.createElement('dd');
        term.textContent = label;
        detail.textContent = String(value);
        list.append(term, detail);
      }
      const explanation = document.createElement('p');
      explanation.textContent = result.explanation;
      section.append(list, explanation);
      output.append(section);
    }
    status.textContent = 'Completed · Java output';
  } catch (error) {
    if (request !== current || error.name === 'AbortError') return;
    status.textContent = 'Run failed';
    status.dataset.error = 'true';
    message(error instanceof TypeError ? 'Cannot reach server. Check that Spring Boot is running, then retry.' : error.message);
  } finally {
    if (request === current) { request = null; run.disabled = false; }
  }
});
selectExample(examples.find(example => `#${example.id}` === location.hash) || examples[0]);
