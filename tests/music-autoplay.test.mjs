import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import test from 'node:test'

const source = readFileSync(new URL('../src/lib/music.ts', import.meta.url), 'utf8')
const body = source.split('  startAutoplay() {')[1].split('\n  toggle()')[0].replace(/},\s*$/, '')
const start = new Function('document', 'Element', 'music', 'status', 'play', body.replace('(event: Event)', '(event)'))

function setup({ muted = false, allowed = false } = {}) {
  const handlers = new Map()
  let calls = 0
  const document = {
    addEventListener: (name, handler) => handlers.set(name, handler),
    removeEventListener: (name) => handlers.delete(name),
  }
  const music = { userMuted: muted }
  const cleanup = start(document, class {}, music, 'idle', async () => { calls++; return allowed })
  return { handlers, music, cleanup, calls: () => calls }
}

test('allowed autoplay removes fallback listeners', async () => {
  const state = setup({ allowed: true })
  await Promise.resolve()
  assert.equal(state.calls(), 1)
  assert.equal(state.handlers.size, 0)
})

test('blocked autoplay retries once on interaction', async () => {
  const state = setup()
  await Promise.resolve()
  state.handlers.get('click')({ target: null })
  assert.equal(state.calls(), 2)
  assert.equal(state.handlers.size, 0)
})

test('saved mute prevents autoplay and retry', () => {
  const state = setup({ muted: true })
  assert.equal(state.calls(), 0)
  assert.equal(state.handlers.size, 0)
})

test('mute selected before interaction is respected', async () => {
  const state = setup()
  await Promise.resolve()
  state.music.userMuted = true
  state.handlers.get('keydown')({ target: null })
  assert.equal(state.calls(), 1)
})
