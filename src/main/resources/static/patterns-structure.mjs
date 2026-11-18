import { simpleProducts } from './patterns-products.mjs';

// Names and relationships mirror the existing Java examples, not an execution trace.
export function structure(pattern, input) {
  const family = ['simple-factory', 'factory-method', 'abstract-factory'].includes(pattern)
    ? (simpleProducts.find(product => product.type === input.type) || simpleProducts[0]).name
    : input.type === 'birthday' ? 'Birthday' : 'Wedding';
  const kind = ({ warrior: 'Warrior', mage: 'Mage', archer: 'Archer' })[input.type] || 'Warrior';
  const box = (name, role, members) => ({ name, role, members });
  const link = (from, relation, to, match = '') => ({ from, relation, to, match });
  const invitation = `${family}Card`;
  const product = `${family}BuilderInvitation`;
  const builder = `${product}.Builder`;
  const event = `${family}Event`;
  const factory = `${family}Factory`;
  const character = `${kind}Builder`;
  const creator = `${kind}Creator`;
  switch (pattern) {
    case 'singleton': return {
      boxes: [box('Whiteboard', 'Class · singleton', ['private static final INSTANCE', 'private Whiteboard()', 'getInstance()', 'write(message)', 'read()']), box('alice / bob', 'Two references', ['Both refer to Whiteboard.INSTANCE'])],
      links: [link('alice', 'getInstance() returns', 'Whiteboard.INSTANCE', 'alice ='), link('bob', 'getInstance() returns the same object', 'Whiteboard.INSTANCE', 'bob ='), link('alice', 'calls write(message) on', 'Whiteboard.INSTANCE', 'alice.write'), link('bob', 'calls read() on', 'Whiteboard.INSTANCE', 'bob.read')]
    };
    case 'prototype': return {
      boxes: [box('InvitationCard', 'Class', ['guestName: String', 'message: StringBuilder', 'shallowCopy()', 'deepCopy()']), box('StringBuilder', 'Mutable message', ['append(text)'])],
      links: [link('template', 'is an instance of', 'InvitationCard', 'InvitationCard template'), link('shallow', 'is a new card sharing the message with', 'template', 'shallowCopy'), link('deep', 'is a new card owning a copied', 'StringBuilder', 'deepCopy'), link('shallow.message', 'append() also changes', 'template.message', '.append(')]
    };
    case 'simple-factory': {
      const selected = simpleProducts.find(product => product.type === input.type) || simpleProducts[0];
      return {
        boxes: [box('InvitationFactory', 'Class · central selection', ['static create(type): Invitation', simpleProducts.map(product => product.type).join(' / '), 'unknown type: IllegalArgumentException']), box('Invitation', 'Interface · common product contract', ['message(): String']), ...[selected, ...simpleProducts.filter(product => product !== selected)].map(product => box(product.product, product === selected ? 'Selected concrete class' : 'Alternative concrete class · not created in this run', ['message(): String']))],
        links: [link(selected.product, 'implements', 'Invitation'), link('InvitationFactory', 'creates', selected.product, 'InvitationFactory.create'), link('invitation', 'calls message() on', selected.product, 'invitation.message()'), ...simpleProducts.filter(product => product !== selected).map(product => link(product.product, 'implements', 'Invitation')), link('InvitationFactory.create(type)', 'returns selected object through', 'Invitation', 'InvitationFactory.create')]
      };
    };
    case 'factory-method': return {
      boxes: [box('InvitationEvent.InvitingEvent', 'Abstract nested class', ['protected abstract createInvitation()', 'prepareInvitation()']), box(event, 'Concrete event class', ['overrides createInvitation()']), box(invitation, 'Concrete product · implements Invitation', ['message()'])],
      links: [link(event, 'extends', 'InvitationEvent.InvitingEvent', 'InvitingEvent event'), link('prepareInvitation()', 'calls overridden createInvitation() on', event, 'event.prepareInvitation'), link(event, 'creates', invitation, 'event.prepareInvitation')]
    };
    case 'abstract-factory': return {
      boxes: [box('EventFactory', 'Interface', ['createInvitation()', 'createEnvelope()', 'static prepareMatchingSet(factory)']), box(factory, 'Concrete factory', ['createInvitation()', 'createEnvelope()']), box(invitation, 'Product · implements Invitation', ['message()']), box(`${family}Envelope`, 'Product · implements Envelope', ['description()'])],
      links: [link(factory, 'implements', 'EventFactory', 'EventFactory factory'), link(factory, 'creates', invitation, '.createInvitation()'), link(factory, 'creates', `${family}Envelope`, '.createEnvelope()'), link('EventFactory.prepareMatchingSet()', 'creates and combines', `${invitation} + ${family}Envelope`, 'prepareMatchingSet')]
    };
    case 'builder': return {
      boxes: [box(builder, 'Static nested builder class', ['recipient(value)', 'venue(value)', 'theme(value)', ...(family === 'Birthday' ? ['dressCode(value)'] : []), 'build()']), box(product, 'Concrete product · implements Invitation', ['final configuration fields', 'message()'])],
      links: [link(builder, 'is nested inside', product, `new ${builder}`), ...['recipient', 'venue', 'theme', ...(family === 'Birthday' ? ['dressCode'] : [])].map(field => link(`${field}(value)`, 'stores setting and returns', 'the same builder', `.${field}(`)), link('build()', 'creates a new', product, '.build()')]
    };
    case 'character-factory': return {
      boxes: [box('CharacterCreator', 'Abstract class', ['createWeapon()', 'createArmor()', 'createSpecialAbility()', 'spawnCharacter()']), box(creator, 'Concrete factory class', ['overrides all three creation methods']), box('Weapon / Armor / SpecialAbility', 'Nested functional interfaces', ['name(): String'])],
      links: [link(creator, 'extends', 'CharacterCreator', 'CharacterCreator factory'), ...['Weapon', 'Armor', 'SpecialAbility'].map(name => link(creator, `create${name}() returns implementation of`, name, `.create${name}()`)), link('spawnCharacter()', 'creates products and combines', 'their name() results', '.spawnCharacter()')]
    };
    case 'character-builder': return {
      boxes: [box('CharacterBaseBuilder', 'Base class', ['weapon', 'armor', 'specialAbility', 'fluent setters']), box(character, 'Concrete class · builder and product', ['level', 'comboSkills', 'fluent setters', 'build()'])],
      links: [link(character, 'extends', 'CharacterBaseBuilder', `new ${character}`), ...['weapon', 'armor', 'specialAbility', 'level', 'comboSkills'].map(field => link(`${field}(value)`, 'sets value and returns', 'the same builder', `.${field}(`)), link('build()', 'creates a new instance of', character, '.build()')]
    };
    case 'factory-vs-builder': return {
      boxes: [box('InvitationFactory', 'Factory · selects product', ['static create(type)']), box(invitation, 'Ready-made product · implements Invitation', ['message()']), box(builder, 'Builder · configures product', ['recipient(value)', 'venue(value)', 'theme(value)', ...(family === 'Birthday' ? ['dressCode(value)'] : []), 'build()']), box(product, 'Custom product · implements Invitation', ['message()'])],
      links: [link('InvitationFactory.create(type)', 'creates', invitation, 'InvitationFactory.create'), link('recipient(value)', 'configures', builder, '.recipient('), link(`${builder}.build()`, 'creates', product, '.build()')]
    };
    default: throw new Error(`Unknown pattern: ${pattern}`);
  }
}

export function renderStructure(model) {
  const boxes = document.querySelector('#structure-boxes');
  const links = document.querySelector('#structure-links');
  boxes.replaceChildren(...model.boxes.map(box => {
    const item = document.createElement('li');
    const role = document.createElement('small');
    const name = document.createElement('strong');
    const members = document.createElement('code');
    role.textContent = box.role;
    name.textContent = box.name;
    members.textContent = box.members.join('\n');
    item.append(role, name, members);
    return item;
  }));
  const rows = model.links.map(link => {
    const row = document.createElement('li');
    const from = document.createElement('code');
    const relation = document.createElement('span');
    const to = document.createElement('code');
    from.textContent = link.from;
    relation.textContent = link.relation;
    to.textContent = link.to;
    row.append(from, relation, to);
    return row;
  });
  links.replaceChildren(...rows);
  return match => rows.forEach((row, index) => {
    const active = model.links[index].match === match;
    row.classList.toggle('structure-active', active);
    if (active) row.setAttribute('aria-current', 'step');
    else row.removeAttribute('aria-current');
  });
}
