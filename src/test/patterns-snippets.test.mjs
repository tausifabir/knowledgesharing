import assert from 'node:assert/strict';
import { snippet, execute } from '../main/resources/static/patterns-snippets.mjs';

const input = {
  type: 'birthday', recipient: 'Alice "A"\nGuest', venue: 'C:\\Hall', theme: 'Gold',
  dressCode: 'Formal', message: 'Hello', addition: ' Dinner', weapon: 'Staff', armor: 'Robe',
  specialAbility: 'Fireball', level: 42, comboSkills: 'Meteor'
};
for (const type of ['wedding', 'birthday']) {
  const data = { ...input, type };
  const family = type === 'birthday' ? 'Birthday' : 'Wedding';
  assert.ok(snippet('simple-factory', data).includes(`create("${type}")`));
  assert.ok(snippet('factory-method', data).includes(`new ${family}Event()`));
  assert.ok(snippet('abstract-factory', data).includes(`new ${family}Factory()`));
  const builder = snippet('builder', data);
  assert.ok(builder.includes(`new ${family}BuilderInvitation.Builder()`));
  assert.ok(builder.includes('.recipient("Alice \\"A\\"\\nGuest")'));
  assert.ok(builder.includes('.venue("C:\\\\Hall")'));
  assert.equal(builder.includes('.dressCode("Formal")'), type === 'birthday');
  const comparison = snippet('factory-vs-builder', data);
  assert.ok(comparison.includes(`create("${type}")`));
  assert.ok(comparison.includes(builder));
}
for (const type of ['wedding', 'birthday', 'visiting', 'membership', 'gift', 'playing']) {
  assert.ok(snippet('simple-factory', { ...input, type }).includes(`create("${type}")`));
  const name = type[0].toUpperCase() + type.slice(1);
  assert.ok(snippet('factory-method', { ...input, type }).includes(`new ${name}Event()`));
  assert.ok(snippet('abstract-factory', { ...input, type }).includes(`new ${name}Factory()`));
}
for (const type of ['warrior', 'mage', 'archer']) {
  const name = type[0].toUpperCase() + type.slice(1);
  assert.ok(snippet('character-factory', { ...input, type }).includes(`new ${name}Creator()`));
  assert.ok(snippet('character-builder', { ...input, type }).includes(`new ${name}Builder()`));
  assert.ok(snippet('character-builder', { ...input, type }).includes('.level(42)'));
}
for (const level of ['', 0, 101, 1.5, 'bad']) {
  assert.ok(snippet('character-builder', { ...input, level }).includes('/* enter level 1–100 */'));
}
assert.ok(snippet('singleton', input).includes('alice.write("Hello")'));
assert.ok(snippet('prototype', input).includes('new StringBuilder("Hello")'));
assert.ok(snippet('prototype', input).includes('.append(" Dinner")'));

const originalFetch = globalThis.fetch;
try {
  const calls = [];
  const signal = new AbortController().signal;
  globalThis.fetch = async (url, options) => {
    calls.push({ url, options });
    return { ok: true, json: async () => ({ explanation: 'Actual server output', output: { Message: url } }) };
  };
  const results = await execute('factory-vs-builder', input, signal);
  assert.deepEqual(calls.map(call => call.url), ['/api/patterns/simple-factory', '/api/patterns/builder']);
  assert.deepEqual(results.map(result => result.pattern), ['simple-factory', 'builder']);
  for (const { options } of calls) {
    assert.deepEqual(JSON.parse(options.body), input);
    assert.equal(options.signal, signal);
  }
  for (const type of ['wedding', 'birthday', 'visiting', 'membership', 'gift', 'playing']) {
    calls.length = 0;
    const result = await execute('simple-factory', { type }, signal);
    assert.equal(calls.length, 1);
    assert.equal(calls[0].url, '/api/patterns/simple-factory');
    assert.deepEqual(JSON.parse(calls[0].options.body), { type });
    assert.equal(result[0].pattern, 'simple-factory');
  }
  calls.length = 0;
  await execute('prototype', input, signal);
  assert.equal(calls.length, 1);
  assert.equal(calls[0].url, '/api/patterns/prototype');
  globalThis.fetch = async () => ({ ok: false, status: 400, json: async () => ({ message: 'Invalid input' }) });
  await assert.rejects(execute('factory-vs-builder', input, signal), /Invalid input/);
  globalThis.fetch = async () => { throw new DOMException('Cancelled', 'AbortError'); };
  await assert.rejects(execute('builder', input, signal), { name: 'AbortError' });
} finally {
  globalThis.fetch = originalFetch;
}
console.log('Snippet and comparison checks passed. No browser required.');
