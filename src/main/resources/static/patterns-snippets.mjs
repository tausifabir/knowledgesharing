// JSON string escapes are valid in Java literals; escape DEL too for readable pasted code.
const literal = value => JSON.stringify(String(value ?? '')).replace(/\u007f/g, '\\u007f');

export function snippet(pattern, input) {
  const family = input.type === 'birthday' ? 'Birthday' : 'Wedding';
  const character = ({ warrior: 'Warrior', mage: 'Mage', archer: 'Archer' })[input.type] || 'Warrior';
  const builder = `new ${family}BuilderInvitation.Builder()\n    .recipient(${literal(input.recipient)})\n    .venue(${literal(input.venue)})\n    .theme(${literal(input.theme)})${input.type === 'birthday' ? `\n    .dressCode(${literal(input.dressCode)})` : ''}\n    .build();`;
  switch (pattern) {
    case 'singleton':
      return `Whiteboard alice = Whiteboard.getInstance();\nWhiteboard bob = Whiteboard.getInstance();\nalice.write(${literal(input.message)});\nbob.read(); // sees Alice’s message\n// alice == bob is true`;
    case 'prototype':
      return `InvitationCard template = new InvitationCard(\n    "Guest", new StringBuilder(${literal(input.message)}));\nInvitationCard shallow = template.shallowCopy();\nInvitationCard deep = template.deepCopy();\nshallow.setGuestName("Alice");\ndeep.setGuestName("Bob");\nshallow.getMessage().append(${literal(input.addition)});`;
    case 'simple-factory':
      return `Invitation invitation =\n    InvitationFactory.create(${literal(input.type)});\ninvitation.message();`;
    case 'factory-method':
      return `InvitationEvent.InvitingEvent event = new ${family}Event();\nevent.prepareInvitation();`;
    case 'abstract-factory':
      return `EventFactory factory = new ${family}Factory();\nfactory.createInvitation();\nfactory.createEnvelope();\nEventFactory.prepareMatchingSet(factory);`;
    case 'builder':
      return builder;
    case 'factory-vs-builder':
      return `// Factory: type selects a fixed product\nInvitationFactory.create(${literal(input.type)}).message();\n\n// Builder: same type, custom settings\n${builder}`;
    case 'character-factory':
      return `CharacterCreator factory = new ${character}Creator();\nfactory.createWeapon();\nfactory.createArmor();\nfactory.createSpecialAbility();\nfactory.spawnCharacter();`;
    case 'character-builder': {
      // Invalid/incomplete number input must not become executable Java in the preview.
      const level = Number(input.level);
      const levelCode = String(input.level).trim() && Number.isInteger(level) && level >= 1 && level <= 100
        ? String(level) : '/* enter level 1–100 */ 10';
      return `new ${character}Builder()\n    .weapon(${literal(input.weapon)})\n    .armor(${literal(input.armor)})\n    .specialAbility(${literal(input.specialAbility)})\n    .level(${levelCode})\n    .comboSkills(${literal(input.comboSkills)})\n    .build();`;
    }
    default:
      throw new Error(`Unknown example: ${pattern}`);
  }
}

export async function execute(pattern, input, signal) {
  const patterns = pattern === 'factory-vs-builder' ? ['simple-factory', 'builder'] : [pattern];
  return Promise.all(patterns.map(async id => {
    const response = await fetch(`/api/patterns/${id}`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(input), signal
    });
    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.message || `Request failed (${response.status}). Check inputs and server.`);
    }
    return { pattern: id, ...await response.json() };
  }));
}
