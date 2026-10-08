const KEY_PATTERN = /^[a-f0-9]{64}$/

export function isRsvpEditKey(value: string): boolean {
  return KEY_PATTERN.test(value)
}

export function createRsvpEditKey(): string {
  return Array.from(crypto.getRandomValues(new Uint8Array(32)), (byte) => byte.toString(16).padStart(2, '0')).join('')
}

export function rsvpEditUrl(key: string, pageUrl: string): string {
  if (!isRsvpEditKey(key)) throw new Error('INVALID_EDIT_LINK')
  const url = new URL(pageUrl)
  url.search = ''
  url.hash = `rsvp-edit=${key}`
  return url.href
}

export function takeRsvpEditKey(): string | null {
  const hash = new URLSearchParams(window.location.hash.slice(1))
  if (!hash.has('rsvp-edit')) return null
  const key = hash.get('rsvp-edit') ?? ''
  hash.delete('rsvp-edit')
  window.history.replaceState(window.history.state, '',
    `${window.location.pathname}${window.location.search}${hash.size ? `#${hash}` : ''}`)
  return key
}
