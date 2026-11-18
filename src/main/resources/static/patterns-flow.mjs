import { simpleProducts } from './patterns-products.mjs';

// Rows expand the same teaching snapshots as playback, not a separate execution trace.
export function workingFlow(pattern, input, steps) {
  const family = (simpleProducts.find(product => product.type === input.type) || simpleProducts[0]).name;
  const kind = ({ warrior: 'Warrior', mage: 'Mage', archer: 'Archer' })[input.type] || 'Warrior';
  const row = (actor, action, transfer) => ({ actor, action, transfer });
  if (pattern === 'builder' || pattern === 'character-builder') {
    const character = pattern === 'character-builder';
    const builder = character ? `${kind}Builder` : `${family}BuilderInvitation.Builder`;
    const product = character ? `${kind}Builder` : `${family}BuilderInvitation`;
    return steps.map((step, index) => {
      if (index === 0) return row(`Caller to ${builder}`, 'Construct the selected builder.', 'New mutable builder reference; no finished product yet.');
      if (index === steps.length - 1) return row(`${builder} to caller`, 'build() copies collected settings into a new instance.', character
        ? `Returns new ${product}, not the original builder. Strings are immutable; the returned object remains mutable. HTTP validation enforces level 1–100.`
        : `Returns new ${product} after constructor validation. Final String fields stay independent of later builder changes.`);
      const field = step.match.slice(1, -1);
      return row(`Caller to ${builder}`, `${field}(value) stores the input and keeps earlier settings.`, `${field} = ${input[field]}\nReturns the same builder reference for chaining.`);
    });
  }
  const flows = {
    singleton: [
      row('Whiteboard to Alice', 'getInstance() returns the existing INSTANCE.', 'Alice holds the shared board reference; no per-user board.'),
      row('Whiteboard to Bob', 'getInstance() returns that same INSTANCE.', 'alice == bob is true. Both references address one object.'),
      row('Alice to shared board', 'write(message) replaces the shared text.', `message = ${input.message ?? ''}\nVolatile field publishes individual writes; controller synchronizes the full demo sequence.`),
      row('Shared board to Bob', 'read() returns text stored by Alice.', `Returns String: ${input.message ?? ''}\nShared process-wide state, not a copy or private session.`)
    ],
    prototype: [
      row('Caller to template', 'Construct InvitationCard and its mutable StringBuilder.', `guestName = Guest\nmessage = ${input.message ?? ''}`),
      row('Template to shallow copy', 'shallowCopy() constructs a separate outer card.', 'Returns new InvitationCard; message reference stays shared with template.'),
      row('Template to deep copy', 'deepCopy() constructs a card with an independent buffer before mutation.', 'Returns new InvitationCard and new StringBuilder; immutable guestName String can stay shared.'),
      row('Shallow copy to shared buffer', 'append(addition) mutates the buffer used by template and shallow copy.', `addition = ${input.addition ?? ''}\nTemplate and shallow text: ${input.message ?? ''}${input.addition ?? ''}\nDeep text unchanged: ${input.message ?? ''}`)
    ],
    'simple-factory': [
      row('Caller to InvitationFactory', 'Choose one card type.', `type = ${input.type ?? 'wedding'}; no personalization settings.`),
      row('InvitationFactory branch selection', 'create(type) checks the central selection branches.', `Selected branch: ${family}; other branches do not run.`),
      row(`Selected branch to ${family}Card`, `Construct new ${family}Card().`, 'New concrete product reference on each successful call.'),
      row('InvitationFactory to caller', 'Return the selected product through common Invitation contract.', 'Returns one Invitation reference, not a factory or a product family.'),
      row(`${family}Card to caller`, 'message() reads the fixed product text.', `Returns String: ${family} invitation`)
    ],
    'factory-method': [
      row('Caller to concrete event', `Construct ${family}Event as InvitationEvent.InvitingEvent.`, 'Returns creator reference; no card created yet.'),
      row('InvitingEvent to subclass override', 'prepareInvitation() calls createInvitation() using dynamic dispatch.', `${family}Event constructs new ${family}Card and returns Invitation to the inherited workflow.`),
      row('Inherited workflow to caller', 'Read product.message() and prefix the preparation text.', `Returns String: Prepared: ${family} invitation\nprepareInvitation() does not return the card object.`)
    ],
    'abstract-factory': [
      row('Caller to concrete factory', `Construct ${family}Factory through EventFactory.`, 'One factory reference selects the family for both product contracts.'),
      row('Factory to caller', 'createInvitation() creates the card product.', `Returns new ${family}Card as Invitation; message() returns its text.`),
      row('Same factory to caller', 'createEnvelope() creates the matching envelope.', `Returns new ${family}Envelope as Envelope; description() returns its text.`),
      row('Caller through prepareMatchingSet(factory)', 'Pass the factory, not the earlier products. Helper creates another pair.', `Calls both creation methods again. Returns String: ${family} invitation + ${family} envelope\nTwo pairs are created across these preview calls; no matching-set object is returned.`)
    ],
    'character-factory': [
      row('Caller to equipment creator', `Construct ${kind}Creator through CharacterCreator.`, 'One creator reference selects predefined equipment; no custom gear inputs.'),
      row('Creator to caller', 'createWeapon() returns Weapon; name() supplies its label.', 'Product is a lambda implementing Weapon; object identity is unspecified.'),
      row('Same creator to caller', 'createArmor() returns Armor; name() supplies its label.', 'Product is a lambda implementing Armor from the selected family.'),
      row('Same creator to caller', 'createSpecialAbility() returns SpecialAbility; name() supplies its label.', 'Product is a lambda implementing SpecialAbility from the selected family.'),
      row('spawnCharacter() to caller', 'Workflow calls all three creation methods again and joins their names.', 'Returns loadout String, not a Character object. Preview shows separate product calls; server invokes the workflow directly.')
    ],
    'factory-vs-builder': [
      row('Form to two independent requests', 'Run sends the same inputs to Simple Factory and Builder endpoints.', 'Requests run concurrently; this ordered teaching flow is not network timing.'),
      row('Simple Factory to caller', `create(type) returns ${family}Card through Invitation.`, `Consumes type only. message() returns fixed text: ${family} invitation`),
      row('Caller to invitation builder', 'Fluent setters collect recipient, venue, theme, and birthday dress code.', 'Each setter returns the same builder. Factory ignores these custom fields.'),
      row('Builder to caller', `build() returns a new ${family}BuilderInvitation.`, 'message() returns personalized text. UI displays both results only after both requests succeed.')
    ]
  };
  return flows[pattern] || [];
}

export function renderFlow(pattern, input, steps) {
  const list = document.querySelector('#data-flow');
  if (!list) return () => {};
  const rows = workingFlow(pattern, input, steps).map((data, index) => {
    const item = document.createElement('li');
    const actor = document.createElement('strong');
    const action = document.createElement('code');
    const transfer = document.createElement('span');
    const state = document.createElement('span');
    actor.textContent = data.actor;
    action.textContent = data.action;
    transfer.textContent = data.transfer;
    state.className = 'flow-state';
    item.append(actor, action, transfer, state);
    return { item, state, index };
  });
  list.replaceChildren(...rows.map(row => row.item));
  return index => rows.forEach(row => {
    const active = row.index === index;
    row.state.textContent = active ? 'Current step' : row.index < index ? 'Earlier step' : 'Upcoming step';
    if (active) row.item.setAttribute('aria-current', 'step');
    else row.item.removeAttribute('aria-current');
  });
}
