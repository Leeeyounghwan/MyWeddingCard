import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { webcrypto } from 'node:crypto'
import { createContext, SourceTextModule, SyntheticModule } from 'node:vm'
import { stripTypeScriptTypes } from 'node:module'
import { test } from 'node:test'

async function setup({ mock = true, rpc = async () => ({ data: [], error: null }), hash = '' } = {}) {
  const storage = new Map()
  const location = { hash, pathname: '/invitation/', search: '?test=1' }
  const replacements = []
  const window = { location, history: { state: null, replaceState: (_state, _title, url) => replacements.push(url) } }
  const mocks = new Map([
    ['./supabase', { isLocalMock: mock, isSupabaseConfigured: !mock, getSupabase: async () => ({ rpc }) }],
    ['./storage', { readStorage: (key) => storage.get(key) ?? null, writeStorage: (key, value) => storage.set(key, value) }],
  ])
  const context = createContext({ window, crypto: webcrypto, URL, URLSearchParams, Uint8Array })
  const modules = new Map()
  function load(name) {
    if (modules.has(name)) return modules.get(name)
    const mockExports = mocks.get(name)
    const module = mockExports
      ? new SyntheticModule(Object.keys(mockExports), function () {
          for (const [key, value] of Object.entries(mockExports)) this.setExport(key, value)
        }, { context })
      : new SourceTextModule(stripTypeScriptTypes(readFileSync(new URL(`../src/lib/${name.slice(2)}.ts`, import.meta.url), 'utf8')), { context })
    modules.set(name, module)
    return module
  }
  const entry = load('./rsvp')
  await entry.link(load)
  await entry.evaluate()
  return { lib: entry.namespace, links: load('./rsvpEditLink').namespace, storage, replacements }
}

const input = { side: 'groom', name: '테스트', attending: true, partySize: 2, meal: 'yes', phone: '010-1234-5678', memo: '' }

test('edit keys are random 256-bit values and edit URLs exclude other parameters', async () => {
  const { links } = await setup()
  const key = links.createRsvpEditKey()
  assert.match(key, /^[a-f0-9]{64}$/)
  assert.notEqual(key, links.createRsvpEditKey())
  assert.equal(links.rsvpEditUrl(key, 'https://example.com/wedding/?admin=secret#gallery'), `https://example.com/wedding/#rsvp-edit=${key}`)
  assert.throws(() => links.rsvpEditUrl('invalid', 'https://example.com/'), /INVALID_EDIT_LINK/)
})

test('incoming keys are removed from the address, including malformed keys', async () => {
  const key = 'a'.repeat(64)
  const valid = await setup({ hash: `#rsvp-edit=${key}` })
  assert.equal(valid.lib.incomingRsvpEditKey, key)
  assert.deepEqual(valid.replacements, ['/invitation/?test=1'])
  const malformed = await setup({ hash: '#rsvp-edit=' })
  assert.equal(malformed.lib.incomingRsvpEditKey, '')
  assert.equal(malformed.replacements.length, 1)
})

test('submit retry and editing preserve one mock response; other keys remain independent', async () => {
  const { lib, storage } = await setup()
  const key = 'b'.repeat(64)
  await lib.submitRsvp(input, key, true)
  await lib.submitRsvp(input, key, true)
  await lib.submitRsvp({ ...input, partySize: 3 }, key, false)
  assert.equal(JSON.parse(storage.get('mock-rsvp')).length, 1)
  assert.equal((await lib.getRsvp(key)).partySize, 3)
  assert.equal((await lib.getRsvp(key)).phone, '01012345678')
  assert.equal(lib.savedRsvpEditKey(), key)
  await lib.submitRsvp(input, 'c'.repeat(64), true)
  assert.equal(JSON.parse(storage.get('mock-rsvp')).length, 2)
  assert.equal((await lib.getRsvp(key)).partySize, 3)
})

test('unknown or malformed edit keys cannot create or retrieve a response', async () => {
  const { lib, storage } = await setup()
  await assert.rejects(lib.submitRsvp(input, 'd'.repeat(64), false), /INVALID_EDIT_LINK/)
  await assert.rejects(lib.getRsvp('d'.repeat(64)), /INVALID_EDIT_LINK/)
  await assert.rejects(lib.getRsvp('invalid'), /INVALID_EDIT_LINK/)
  assert.equal(storage.get('mock-rsvp'), undefined)
})

test('RPC failures do not save a key or report a missing update as success', async () => {
  const { lib, storage } = await setup({ mock: false, rpc: async () => ({ data: null, error: null }) })
  await assert.rejects(lib.submitRsvp(input, 'e'.repeat(64), false), /INVALID_EDIT_LINK/)
  await assert.rejects(lib.getRsvp('e'.repeat(64)), /INVALID_EDIT_LINK/)
  assert.equal(storage.size, 0)
  const network = await setup({ mock: false, rpc: async () => ({ data: null, error: new Error('network') }) })
  await assert.rejects(network.lib.submitRsvp(input, 'f'.repeat(64), true), /network/)
  assert.equal(network.storage.size, 0)
})

test('production requests use keyed RPCs and recover only returned fields', async () => {
  const calls = []
  const key = '1'.repeat(64)
  const { lib } = await setup({ mock: false, rpc: async (method, payload) => {
    calls.push({ method, payload })
    return { error: null, data: method === 'save_rsvp' ? 'response-id' : [{
      side: 'bride', name: '테스트', attending: false, party_size: 0, meal: 'no', phone: null, memo: null,
    }] }
  } })
  await lib.submitRsvp({ ...input, attending: false }, key, true)
  assert.equal(calls[0].method, 'save_rsvp')
  assert.equal(calls[0].payload.p_edit_key, key)
  assert.equal(calls[0].payload.p_create, true)
  assert.equal(calls[0].payload.p_party_size, 0)
  assert.equal(calls[0].payload.p_meal, 'no')
  const restored = await lib.getRsvp(key)
  assert.equal(calls[1].method, 'get_rsvp_by_key')
  assert.equal(restored.side, 'bride')
  assert.equal(restored.phone, '')
  assert.equal(restored.memo, '')
})
