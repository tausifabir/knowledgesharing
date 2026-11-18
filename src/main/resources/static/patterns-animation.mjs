import { snippet } from './patterns-snippets.mjs';
import { structure, renderStructure } from './patterns-structure.mjs';
import { simpleProducts } from './patterns-products.mjs';
import { renderFlow } from './patterns-flow.mjs';

// Teaching snapshots, not a Java debugger. IDs describe references within this preview only.
export function storyboard(pattern, input) {
  const family = ['simple-factory', 'factory-method', 'abstract-factory'].includes(pattern)
    ? (simpleProducts.find(product => product.type === input.type) || simpleProducts[0]).name
    : input.type === 'birthday' ? 'Birthday' : 'Wedding';
  const kind = ({ mage: 'Mage', archer: 'Archer', warrior: 'Warrior' })[input.type] || 'Warrior';
  const node = (label, detail) => ({ label, detail: String(detail ?? '') });
  const step = (caption, match, nodes) => ({ caption, match, nodes });
  const message = input.message ?? '';
  if (pattern === 'singleton') return [
    step('Alice opens the shared board.', 'alice =', [node('Alice', 'Opens this board'), node('Shared board', 'One board for everyone'), node('Bob', 'Not connected yet')]),
    step('Bob opens the same board. No new board is made.', 'bob =', [node('Alice', 'Uses this board'), node('Shared board', 'One board for everyone'), node('Bob', 'Uses this board too')]),
    step('Alice writes her message.', 'alice.write', [node('Alice', 'Writes this message'), node('Shared board', message), node('Bob', 'Uses this board too')]),
    step('Bob reads the same message.', 'bob.read', [node('Alice', message), node('Shared board', message), node('Bob', message)])
  ];
  if (pattern === 'prototype') return [
    step('Start with one invitation card containing a mutable message buffer.', 'InvitationCard template', [node('Original card', message), node('Shallow copy', 'Not created yet'), node('Deep copy', 'Not created yet')]),
    step('Shallow copy creates new card, but reuses existing message reference.', 'shallowCopy', [node('Original card', message), node('Shallow copy', `${message}\n(shares message buffer with Original)`), node('Deep copy', 'Not created yet')]),
    step('Deep copy creates new card AND copies message buffer independently.', 'deepCopy', [node('Original card', message), node('Shallow copy', `${message}\n(shares message buffer with Original)`), node('Deep copy', `${message}\n(owns independent message buffer)`)]),
    step('Append text to shallow copy: Original changes too (shared buffer). Deep copy stays untouched.', '.append(', [node('Original card', `${message}${input.addition ?? ''}\n(mutated via shallow copy)`), node('Shallow copy', `${message}${input.addition ?? ''}\n(mutated)`), node('Deep copy', `${message}\n(independent - untouched)`)])
  ];
  if (pattern === 'factory-vs-builder') return [
    step('Try two ways to make an invitation using the same choices.', 'InvitationFactory.create', [node('Event', family), node('Your choices', `${input.recipient} · ${input.venue} · ${input.theme}`)]),
    step('Factory: choose an event and receive a ready-made invitation. Custom settings are not used.', 'InvitationFactory.create', [node('Event requested', family), node('Ready-made invitation', `${family} invitation`)]),
    step('Builder: collect your choices before making the invitation.', '.recipient(', [node('Settings', `${input.recipient} · ${input.venue} · ${input.theme}`)]),
    step('Factory selects a ready-made invitation. Builder makes a personalized invitation from your settings.', '.build()', [node('Ready-made invitation', `${family} invitation`), node('Personalized invitation', invitationMessage(family, input))])
  ];
  if (pattern === 'builder' || pattern === 'character-builder') {
    const character = pattern === 'character-builder';
    const fields = character ? ['weapon', 'armor', 'specialAbility', 'level', 'comboSkills']
      : ['recipient', 'venue', 'theme', ...(input.type === 'birthday' ? ['dressCode'] : [])];
    const name = character ? `${kind}Builder` : `${family}BuilderInvitation.Builder`;
    const labels = { recipient: 'Recipient', venue: 'Venue', theme: 'Theme', dressCode: 'Dress code', weapon: 'Weapon', armor: 'Armor', specialAbility: 'Special ability', level: 'Level', comboSkills: 'Combo skills' };
    const settings = keys => keys.map(key => `${labels[key]}: ${input[key]}`).join('\n');
    const steps = [step('Start collecting your choices. Nothing has been made yet.', `new ${name}`, [node('Settings', character ? `Character: ${kind}` : `Event: ${family}`)])];
    fields.forEach((field, index) => steps.push(step(`Choose ${labels[field].toLowerCase()}. Keep the earlier choices too.`, `.${field}(`,
      [node('Your choices so far', settings(fields.slice(0, index + 1)))])));
    steps.push(step('All choices are ready. Make a new invitation or character using those settings.', '.build()',
      [node('Settings', settings(fields)), node(character ? 'Finished character' : 'Finished invitation', character ? `${kind}\n${settings(fields)}` : invitationMessage(family, input))]));
    return steps;
  }
  if (pattern === 'simple-factory') {
    const selected = simpleProducts.find(product => product.type === input.type) || simpleProducts[0];
    return [
      step('You choose a card type. The caller asks one central maker without constructing the concrete product.', 'Invitation invitation', [node('Your request', `Card type: ${selected.name}`), node('One central maker', `Choices: ${simpleProducts.map(product => product.type).join(', ')}`), node('Card product', 'Not created yet')]),
      step('One method checks all six choices. Only the requested branch is selected.', 'InvitationFactory.create', [node('Your request', `Card type: ${selected.name}`), node('One central maker', simpleProducts.map(product => `${product.name} branch: ${product === selected ? 'selected' : 'not used'}`).join('\n')), node('Card product', 'Not created yet')]),
      step('The selected branch creates one new product. Every successful request makes a fresh object.', 'InvitationFactory.create', [node('Your request', `Card type: ${selected.name}`), node('One central maker', `Creates the ${selected.type} design`), node('Card product', `New ${selected.type} invitation`)]),
      step('The maker returns one object through the common contract. The caller does not need to know its concrete class.', 'InvitationFactory.create', [node('Your request', 'Receives the card product'), node('One central maker', 'Returns one product, not a matching family'), node('Card product', `${selected.name} design · ready to read`)]),
      step('Read the message. More choices, even 20, still mean Simple Factory when one method selects the product.', 'invitation.message()', [node('Your request', `Message: ${selected.name} invitation`), node('One central maker', 'More branches do not change the pattern'), node('Card product', `${selected.name} invitation`)])
    ];
  }
  if (pattern === 'factory-method') return [
    step('Choose an event organizer. Each organizer knows which invitation to make.', 'InvitingEvent event', [node('Event organizer', `${family} organizer`)]),
    step('Every organizer follows the same preparation steps, but each makes its own kind of invitation.', 'event.prepareInvitation', [node('Shared preparation steps', 'Ask the chosen organizer to make an invitation'), node('Chosen organizer', `Makes a ${family.toLowerCase()} invitation`)]),
    step('The organizer returns prepared message text, not the invitation object.', 'event.prepareInvitation', [node('Finished invitation', `${family} invitation`), node('Message you receive', `Prepared: ${family} invitation`)])
  ];
  if (pattern === 'abstract-factory') return [
    step('Choose one event stationery maker. It can make a whole matching set.', 'EventFactory factory', [node('Stationery maker', `${family} collection`)]),
    step('Ask the maker for an invitation from that collection.', '.createInvitation()', [node('Stationery maker', `${family} collection`), node('Invitation', `${family} invitation`)]),
    step('Ask the same maker for an envelope. It matches the invitation.', '.createEnvelope()', [node('Invitation', `${family} invitation`), node('Matching envelope', `${family} envelope`)]),
    step('Receive a coordinated invitation and envelope, not a mixed set.', 'prepareMatchingSet', [node('Finished matching set', `${family} invitation + ${family} envelope`)])
  ];
  const gear = { Warrior: ['Greatsword', 'Plate Armor', 'Berserk Slash'], Mage: ['Arcane Staff', 'Silk Robe', 'Fireball'], Archer: ['Longbow', 'Leather Armor', 'Eagle Eye'] }[kind];
  return [
    step('Choose a character type. Its equipment maker supplies a matching set.', 'CharacterCreator factory', [node('Equipment maker', `${kind} equipment`)]),
    step('Create the weapon.', '.createWeapon()', [node('Weapon', gear[0])]),
    step('Create matching armor.', '.createArmor()', [node('Weapon', gear[0]), node('Armor', gear[1])]),
    step('Create the family’s special ability.', '.createSpecialAbility()', [node('Weapon', gear[0]), node('Armor', gear[1]), node('Ability', gear[2])]),
    step('Receive the weapon, armor, and ability together as one matching set.', '.spawnCharacter()', [node(`Finished ${kind.toLowerCase()} equipment`, gear.join(' + '))])
  ];
}

function invitationMessage(family, input) {
  return `${family} invitation for ${input.recipient} at ${input.venue} | Theme: ${input.theme}${family === 'Birthday' ? ` | Dress Code: ${input.dressCode}` : ''}`;
}

export function createAnimation() {
  const scene = document.querySelector('#object-scene');
  const caption = document.querySelector('#animation-caption');
  const counter = document.querySelector('#animation-step');
  const play = document.querySelector('#animation-play');
  const next = document.querySelector('#animation-next');
  const code = document.querySelector('#code');
  let steps = [], index = 0, timer;
  let lines = [];
  let cards = [];
  let codeRows = [];
  let highlightStructure = () => {};
  let highlightFlow = () => {};
  const tabs = [...(document.querySelectorAll?.('[role="tab"][data-view]') || [])];
  const pace = document.querySelector('#animation-pace');
  function selectTab(tab) {
    pause();
    tabs.forEach(button => {
      const active = button === tab;
      button.setAttribute('aria-selected', String(active));
      button.tabIndex = active ? 0 : -1;
      document.querySelector(`#${button.getAttribute('aria-controls')}`).hidden = !active;
    });
  }
  tabs.forEach((tab, position) => {
    tab.addEventListener('click', () => selectTab(tab));
    tab.addEventListener('keydown', event => {
      let target;
      if (event.key === 'ArrowRight') target = tabs[(position + 1) % tabs.length];
      if (event.key === 'ArrowLeft') target = tabs[(position + tabs.length - 1) % tabs.length];
      if (event.key === 'Home') target = tabs[0];
      if (event.key === 'End') target = tabs.at(-1);
      if (!target) return;
      event.preventDefault();
      selectTab(target);
      target.focus();
    });
  });
  pace?.addEventListener('change', pause);
  const reducedMotion = () => globalThis.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
  function crossfade(content, update) {
    content.getAnimations?.().forEach(animation => animation.cancel());
    const old = !reducedMotion() && content.animate ? content.cloneNode(true) : null;
    content.parentNode.querySelector('.object-outgoing')?.remove();
    update();
    if (!old) return;
    old.setAttribute('aria-hidden', 'true');
    old.classList.add('object-outgoing');
    content.parentNode.append(old);
    const timing = { duration: 1600, easing: 'ease-in-out' };
    const fade = old.animate([{ opacity: 1 }, { opacity: 0 }], timing);
    fade.onfinish = fade.oncancel = () => old.remove();
    content.animate([{ opacity: 0 }, { opacity: 1 }], timing);
  }
  function pause() {
    clearInterval(timer);
    timer = undefined;
    play.textContent = 'Play';
    play.setAttribute('aria-pressed', 'false');
  }
  function render() {
    const current = steps[index];
    counter.textContent = `Step ${index + 1} of ${steps.length}`;
    caption.textContent = current.caption;
    highlightStructure(current.match);
    highlightFlow(index);
    cards.forEach(({ item, content, title, value }, position) => {
      const data = current.nodes[position];
      const changed = data && (title.textContent !== data.label || value.textContent !== data.detail);
      item.classList.toggle('object-inactive', !data);
      item.setAttribute('aria-hidden', String(!data));
      item.classList.toggle('object-changed', Boolean(changed));
      if (!data || !changed) return;
      const update = () => { title.textContent = data.label; value.textContent = data.detail; };
      if (title.textContent) crossfade(content, update);
      else update();
    });
    codeRows.forEach((row, position) => {
      const active = lines[position].includes(current.match);
      row.classList.toggle('code-active', active);
      if (active) row.setAttribute('aria-current', 'step');
      else row.removeAttribute('aria-current');
    });
    const previous = document.querySelector('#animation-previous');
    if (previous) previous.disabled = index === 0;
    const progress = document.querySelector('#animation-progress');
    if (progress) { progress.max = steps.length; progress.value = index + 1; }
    next.disabled = index === steps.length - 1;
    if (next.disabled) pause();
  }
  play.addEventListener('click', () => {
    if (timer) return pause();
    if (index === steps.length - 1) { index = 0; render(); }
    play.textContent = 'Pause';
    play.setAttribute('aria-pressed', 'true');
    // Reduced motion still permits explicit playback, but without moving transitions.
    const delay = Number(pace?.value || 9000);
    timer = setInterval(() => { index++; render(); }, [6500, 9000, 12000].includes(delay) ? delay : 9000);
  });
  next.addEventListener('click', () => { pause(); if (index < steps.length - 1) { index++; render(); } });
  document.querySelector('#animation-previous')?.addEventListener('click', () => { pause(); if (index > 0) { index--; render(); } });
  document.querySelector('#animation-restart').addEventListener('click', () => { pause(); index = 0; render(); });
  document.addEventListener('visibilitychange', () => { if (document.hidden) pause(); });
  return (pattern, input) => {
    pause();
    index = 0;
    steps = storyboard(pattern, input);
    const captionSizing = document.querySelector('#caption-sizing');
    if (captionSizing) captionSizing.replaceChildren(...steps.map(step => {
      const sample = document.createElement('p');
      sample.textContent = step.caption;
      return sample;
    }));
    highlightFlow = renderFlow(pattern, input, steps);
    if (document.querySelector('#structure-boxes')) highlightStructure = renderStructure(structure(pattern, input));
    lines = snippet(pattern, input).split('\n');
    cards = Array.from({ length: Math.max(...steps.map(step => step.nodes.length)) }, (_, position) => {
      const item = document.createElement('li');
      const content = document.createElement('div');
      content.className = 'object-content';
      const title = document.createElement('strong');
      const value = document.createElement('span');
      content.append(title, value);
      const sizing = document.createElement('div');
      sizing.className = 'object-sizing';
      sizing.setAttribute('aria-hidden', 'true');
      // Reserve the tallest snapshot at this width so steps never resize the grid.
      steps.forEach(step => {
        const data = step.nodes[position];
        if (!data) return;
        const sample = document.createElement('div');
        const heading = document.createElement('strong');
        const detail = document.createElement('span');
        heading.textContent = data.label;
        detail.textContent = data.detail;
        sample.append(heading, detail);
        sizing.append(sample);
      });
      item.append(content, sizing);
      return { item, content, title, value };
    });
    scene.replaceChildren(...cards.map(card => card.item));
    codeRows = lines.map((line, position) => {
      const row = document.createElement('span');
      row.className = 'code-line';
      row.setAttribute('data-line', String(position + 1));
      // One block per line, no trailing newline: prevents doubled rows inside <pre>.
      row.textContent = line || ' ';
      return row;
    });
    code.replaceChildren(...codeRows);
    render();
  };
}
