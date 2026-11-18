import { simpleProducts } from './patterns-products.mjs';

// Factory and builder teaching details share one expandable guide layout.
export function factoryGuide(pattern, input) {
  const family = input.type === 'birthday' ? 'Birthday' : 'Wedding';
  const eventRows = ['wedding', 'birthday'].map(type => ({
    selected: type === (input.type || 'wedding'),
    cells: [type, `${type === 'birthday' ? 'Birthday' : 'Wedding'}Invitation`]
  }));
  switch (pattern) {
    case 'simple-factory': {
      const selected = simpleProducts.find(product => product.type === input.type) || simpleProducts[0];
      return {
        title: 'Simple Factory · six choices, one selection point',
        decision: 'Caller passes a type string. InvitationFactory.create(type) centrally selects and constructs one matching card product. Existing Java products retain Invitation names.',
        columns: ['Your request', 'Object created'],
        rows: simpleProducts.map(product => ({ selected: product === selected, cells: [product.type, product.product] })),
        flow: [`Client calls InvitationFactory.create("${selected.type}").`, `The matching branch constructs a new ${selected.product}.`, 'The method returns it through the Invitation interface.', `Client calls message() and receives "${selected.name} invitation".`],
        facts: [
          ['Contract', 'All six products implement Invitation with message(): String. The caller need not construct a concrete class.'],
          ['Lifetime', 'Each successful create() call constructs a fresh product, not a cached or singleton instance.'],
          ['Invalid type', 'Unknown types are rejected; the demo responds with HTTP 400.'],
          ['Add a new card type', 'Implement Invitation and add a branch to InvitationFactory.create(). Update the demo choices too. Selection code grows, but the pattern stays Simple Factory—even with 20 types.'],
          ['Factory Method difference', 'Creator subclasses override a creation method. Adding more product types alone does not require switching to Factory Method.'],
          ['Abstract Factory difference', 'Creates families of related products, such as a wedding invitation and envelope. More individual card choices alone do not make an Abstract Factory.'],
          ['Use when', 'One central creation helper selects a product from an explicit input. Simple Factory is an idiom, not an original GoF pattern.']
        ], source: 'factory/simple/InvitationFactory.java · factory/simple/Invitation.java'
      };
    }
    case 'factory-method': return {
      title: 'Factory Method · subclass supplies the product',
      decision: 'Caller selects an event subclass. The inherited preparation workflow asks that subclass to create its invitation.',
      columns: ['Selected event class', 'Overridden method', 'Created class'],
      rows: eventRows.map(row => ({ selected: row.selected, cells: [`${row.cells[1].replace('Invitation', '')}Event`, 'createInvitation()', row.cells[1]] })),
      flow: [`Client constructs ${family}Event as InvitationEvent.InvitingEvent.`, 'Client calls inherited prepareInvitation().', `prepareInvitation() calls the protected createInvitation() override in ${family}Event.`, `The override returns a new ${family}Invitation.`, `The inherited method calls message() and returns "Prepared: ${family} invitation".`],
      facts: [
        ['Inheritance', `${family}Event extends InvitationEvent.InvitingEvent. The base class owns prepareInvitation(); the subclass owns the creation override.`],
        ['Visibility', 'createInvitation() is protected, so outside callers use prepareInvitation(), not the factory method directly.'],
        ['Add a new event', 'Implement a new Invitation and a new InvitingEvent subclass. The base preparation workflow can remain unchanged; the demo selector/controller still needs the new option.'],
        ['Use when', 'A common workflow should remain stable while subclasses vary the product it uses.']
      ], source: 'factory/method/InvitationEvent.java · factory/method/WeddingEvent.java · factory/method/BirthdayEvent.java'
    };
    case 'abstract-factory': return {
      title: 'Abstract Factory · related products from one family',
      decision: 'Caller chooses one EventFactory implementation. That factory supplies both product types with a consistent event theme.',
      columns: ['Factory class', 'Invitation product', 'Envelope product'],
      rows: ['Wedding', 'Birthday'].map(name => ({ selected: name === family, cells: [`${name}Factory`, `${name}Invitation`, `${name}Envelope`] })),
      flow: [`Client chooses ${family}Factory through EventFactory.`, `createInvitation() returns a new ${family}Invitation implementing Invitation.`, `createEnvelope() returns a new ${family}Envelope implementing Envelope.`, 'prepareMatchingSet(factory) calls both creation methods, then combines message() and description().', `Returned string: "${family} invitation + ${family} envelope".`],
      facts: [
        ['Two contracts', 'Invitation defines message(); Envelope defines description(). EventFactory defines how to create both.'],
        ['Family consistency', 'Use one factory for both products to keep the event theme consistent. Java does not prevent manually mixing products from different factories.'],
        ['Fresh objects', 'Each creation call makes a new product. prepareMatchingSet() creates its own pair; it does not reuse earlier demonstration calls.'],
        ['Add a family', 'Implement the two product classes and an EventFactory for the new event. Existing EventFactory methods need not change.'],
        ['Add a product type', 'Adding a third type, such as a menu, requires changing EventFactory and every concrete factory.'],
        ['Use when', 'Several related product types should vary together as one family.']
      ], source: 'factory/abstraction/EventFactory.java · WeddingFactory.java · BirthdayFactory.java'
    };
    case 'character-factory': {
      const kind = ({ mage: 'Mage', archer: 'Archer', warrior: 'Warrior' })[input.type] || 'Warrior';
      return {
        title: 'Character factory · three matching product roles',
        decision: 'Choose a CharacterCreator subclass. It supplies implementations of three nested functional interfaces.',
        columns: ['Creator', 'Weapon', 'Armor', 'Special ability'],
        rows: [['Warrior', 'Greatsword', 'Plate Armor', 'Berserk Slash'], ['Mage', 'Arcane Staff', 'Silk Robe', 'Fireball'], ['Archer', 'Longbow', 'Leather Armor', 'Eagle Eye']].map(([name, ...gear]) => ({ selected: name === kind, cells: [`${name}Creator`, ...gear] })),
        flow: [`Client selects ${kind}Creator as CharacterCreator.`, 'createWeapon(), createArmor(), and createSpecialAbility() return lambda implementations of Weapon, Armor, and SpecialAbility.', 'Each product exposes name(): String.', 'spawnCharacter() calls the creation methods and combines their name() results into one loadout string.'],
        facts: [
          ['Pattern shape', 'A family-producing abstract factory with an inherited convenience workflow, not just one single-product factory method.'],
          ['No concrete gear classes', 'Products are lambdas implementing nested interfaces; there are no Greatsword or PlateArmor classes in this code.'],
          ['Return value', 'spawnCharacter() returns a String, not a Character object. Lambda object identity is not guaranteed.'],
          ['Add a class', 'Extend CharacterCreator and implement all three creation methods. Add the class to the demo selection separately.']
        ], source: 'exercise/factory/base/CharacterCreator.java · WarriorCreator.java · MageCreator.java · ArcherCreator.java'
      };
    }
    case 'builder': {
      const product = `${family}BuilderInvitation`;
      const builder = `${product}.Builder`;
      const fields = ['recipient', 'venue', 'theme', ...(family === 'Birthday' ? ['dressCode'] : [])];
      const value = field => String(input[field] ?? '');
      const valid = fields.every(field => value(field).trim());
      return {
        title: 'Invitation Builder · caller chooses and configures',
        decision: 'Caller selects WeddingBuilderInvitation.Builder or BirthdayBuilderInvitation.Builder, then supplies individual settings. The builder does not choose an event type itself.',
        columns: ['Builder class', 'build() returns', 'Configuration methods'],
        rows: ['Wedding', 'Birthday'].map(name => ({ selected: name === family, cells: [`${name}BuilderInvitation.Builder`, `${name}BuilderInvitation`, `recipient, venue, theme${name === 'Birthday' ? ', dressCode' : ''}`] })),
        flow: [`Client constructs new ${builder}(); this is configuration state, not the finished invitation.`, ...fields.map(field => `Call ${field}(${JSON.stringify(value(field))}); store the value and return the same builder for chaining.`), `build() calls the public ${product} constructor, which validates the configuration.`, valid ? `Returns a new ${product} with final fields; message() returns "${family} invitation for ${value('recipient')} at ${value('venue')} | Theme: ${value('theme')}${family === 'Birthday' ? ` | Dress Code: ${value('dressCode')}` : ''}".` : 'Incomplete or blank configuration: no successful product preview. Supply every visible field before running.'],
        facts: [
          ['Required value', 'recipient is required. Builder setters collect configuration; the product constructor rejects null or blank values during build().'],
          ['Defaults', 'A new Java builder defaults venue to Main Hall and theme to White; Birthday also defaults dressCode to Casual. The demo explicitly supplies all visible fields, so blank input does not restore a default.'],
          ['Creation roles', `Client code chooses ${builder} and calls its setters. build() invokes the product constructor; there is no separate Director coordinating these steps.`],
          ['Return value', `build() returns a fresh ${product}, not the builder. The product implements Invitation and holds immutable String configuration in final fields.`],
          ['Reuse', 'Fluent setters return the same mutable builder. Reusing it for another build creates another product; earlier invitations keep their own values.'],
          ['Add an option', 'Add a builder field/setter, copy it into the product, validate it, and update message() if needed. Update the demo inputs and preview separately.'],
          ['Add a branch', 'Add a new invitation product and its builder, then extend caller selection. No shared builder interface or Director is required by these examples.']
        ], source: 'builder/WeddingBuilderInvitation.java · builder/BirthdayBuilderInvitation.java'
      };
    }
    case 'character-builder': {
      const kind = ({ warrior: 'Warrior', mage: 'Mage', archer: 'Archer' })[input.type] || 'Warrior';
      const builder = `${kind}Builder`;
      const fields = ['weapon', 'armor', 'specialAbility', 'level', 'comboSkills'];
      const level = Number(input.level);
      const validLevel = String(input.level ?? '').trim() && Number.isInteger(level) && level >= 1 && level <= 100;
      return {
        title: 'Character Builder · configure a mutable loadout',
        decision: 'Caller chooses WarriorBuilder, MageBuilder, or ArcherBuilder. Each class can receive the same custom settings; choosing Mage does not automatically choose mage gear.',
        columns: ['Builder class', 'build() returns', 'Configuration methods'],
        rows: ['Warrior', 'Mage', 'Archer'].map(name => ({ selected: name === kind, cells: [`${name}Builder`, `new ${name}Builder`, 'weapon, armor, specialAbility, level, comboSkills'] })),
        flow: [
          `Client constructs new ${builder}(), inheriting weapon, armor, and specialAbility from CharacterBaseBuilder.`,
          ...fields.map(field => field === 'level'
            ? (validLevel ? `Call level(${level}); set configuration and return the same ${builder} for chaining.` : 'Enter an integer level from 1 to 100 before running; no valid level call is shown yet.')
            : `Call ${field}(${JSON.stringify(String(input[field] ?? ''))}); set configuration and return the same ${builder} for chaining.`),
          `build() copies all five values into a new ${builder}.`,
          `Returns a new ${builder}, separate from the original builder. This exercise uses the same class for building and the resulting mutable object; no separate Character entity is created.`
        ],
        facts: [
          ['Inheritance', 'CharacterBaseBuilder holds common gear settings. Each concrete subclass adds level and comboSkills and overrides fluent methods to retain its concrete return type.'],
          ['Return value', `build() returns a new mutable ${builder}. Its fluent methods can still change it after building; this is not the immutable invitation design.`],
          ['Validation boundary', 'The demo requires nonblank text and integer level 1–100 before execution. These limits belong to the demo; do not assume the Java exercise builder enforces them itself.'],
          ['No automatic loadout', 'Gear values come from the current inputs, not the selected character class. Use Character Factory for predefined matching gear.'],
          ['Add an option', 'For shared gear settings, update CharacterBaseBuilder and each concrete build() copy path. For subclass-only settings, update that subclass and its build() path.'],
          ['Add a branch', 'Add a concrete builder with covariant fluent methods and build(), then extend caller selection and the demo. No separate product hierarchy exists here.']
        ], source: 'exercise/builder/base/CharacterBaseBuilder.java · exercise/builder/WarriorBuilder.java · MageBuilder.java · ArcherBuilder.java'
      };
    }
    case 'prototype': return {
      title: 'Prototype · Shallow copy vs Deep copy',
      decision: 'Choose how internal references are duplicated. Shallow copy copies object fields directly (sharing references). Deep copy recursively duplicates nested mutable objects.',
      columns: ['Copy method', 'Outer object', 'Nested StringBuilder', 'Mutating copy affects original?'],
      rows: [
        { selected: true, cells: ['shallowCopy()', 'New InvitationCard instance', 'Shared reference (same pointer)', 'YES (both point to same buffer)'] },
        { selected: false, cells: ['deepCopy()', 'New InvitationCard instance', 'New StringBuilder(message)', 'NO (completely independent buffer)'] }
      ],
      flow: [
        `Client creates template = new InvitationCard("Guest", new StringBuilder("${input.message ?? 'Wedding at 6 PM.'}")).`,
        'shallowCopy() calls: new InvitationCard(guestName, message) -> outer card is new, message pointer is identical.',
        'deepCopy() calls: new InvitationCard(guestName, new StringBuilder(message)) -> outer card is new, message is freshly cloned.',
        `shallow.getMessage().append("${input.addition ?? ' Dinner included.'}") mutates the shared StringBuilder.`,
        'Result: template sees mutation because of shared reference. Deep copy remains pristine with original text.'
      ],
      facts: [
        ['Shallow copy mechanism', 'Duplicates only primitive values and object references. If a field points to a mutable object (like StringBuilder, List, Date), both instances share that exact object.'],
        ['Deep copy mechanism', 'Duplicates outer object AND constructs independent copies of all reachable mutable objects. Changes to copy cannot leak into original.'],
        ['String vs StringBuilder', 'String is immutable in Java, so shallow copying String is always safe. StringBuilder is mutable, so sharing it introduces side effects across instances.'],
        ['Use Shallow copy when', 'Objects are immutable or shared state is intentional (e.g. read-only configurations, heavy flyweight references).'],
        ['Use Deep copy when', 'Copied instances must be modified independently without corrupting template or other clones.']
      ], source: 'prototype/InvitationCard.java'
    };
    default: return null;
  }
}

export function renderFactoryGuide(pattern, input) {
  const section = document.querySelector('#factory-guide');
  if (!section) return;
  const guide = factoryGuide(pattern, input);
  section.hidden = !guide;
  if (!guide) return;
  const element = (tag, text) => {
    const node = document.createElement(tag);
    node.textContent = text;
    return node;
  };
  document.querySelector('#factory-guide-title').textContent = guide.title;
  document.querySelector('#factory-decision').textContent = guide.decision;
  const selected = guide.rows.find(row => row.selected);
  document.querySelector('#factory-selected-branch').textContent = `Selected branch: ${selected.cells[0]}`;
  const table = document.querySelector('#factory-families');
  const caption = element('caption', 'Available branches · selected branch marked explicitly');
  const head = document.createElement('thead');
  const header = document.createElement('tr');
  for (const label of ['Selection', ...guide.columns]) {
    const cell = element('th', label);
    cell.scope = 'col';
    header.append(cell);
  }
  head.append(header);
  const body = document.createElement('tbody');
  for (const row of guide.rows) {
    const tr = document.createElement('tr');
    tr.className = row.selected ? 'factory-selected' : '';
    tr.append(element('td', row.selected ? 'Selected' : 'Alternative'));
    row.cells.forEach(text => tr.append(element('td', text)));
    body.append(tr);
  }
  table.replaceChildren(caption, head, body);
  document.querySelector('#factory-flow').replaceChildren(...guide.flow.map(text => element('li', text)));
  const facts = document.querySelector('#factory-facts');
  facts.replaceChildren(...guide.facts.flatMap(([label, text]) => [element('dt', label), element('dd', text)]));
  document.querySelector('#factory-guide-source').textContent = guide.source;
}
