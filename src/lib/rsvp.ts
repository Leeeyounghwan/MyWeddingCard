import { getSupabase, isSupabaseConfigured, isLocalMock } from './supabase'
import { readStorage, writeStorage } from './storage'
import { normalize } from './validation'
import { isRsvpEditKey, takeRsvpEditKey } from './rsvpEditLink'

export type Side = 'groom' | 'bride'
export type Meal = 'yes' | 'no' | 'undecided'

export interface RsvpInput {
  side: Side
  name: string
  attending: boolean
  partySize: number
  meal: Meal
  phone: string
  memo: string
}

export const rsvpAvailable = isSupabaseConfigured || isLocalMock

const EDIT_KEY = 'rsvp-edit-key'
export const incomingRsvpEditKey = takeRsvpEditKey()

export function savedRsvpEditKey(): string | null {
  const key = readStorage(EDIT_KEY)
  return key && isRsvpEditKey(key) ? key : null
}

interface RsvpRow {
  p_side: Side
  p_name: string
  p_attending: boolean
  p_party_size: number
  p_meal: Meal
  p_phone: string | null
  p_memo: string | null
  editKey?: string
  at: string
}

export async function getRsvp(key: string): Promise<RsvpInput> {
  if (!isRsvpEditKey(key)) throw new Error('INVALID_EDIT_LINK')
  if (isLocalMock) {
    const list = JSON.parse(readStorage('mock-rsvp') ?? '[]') as RsvpRow[]
    const row = list.find((item) => item.editKey === key)
    if (!row) throw new Error('INVALID_EDIT_LINK')
    writeStorage(EDIT_KEY, key)
    return { side: row.p_side, name: row.p_name, attending: row.p_attending,
      partySize: row.p_party_size, meal: row.p_meal, phone: row.p_phone ?? '', memo: row.p_memo ?? '' }
  }
  const sb = await getSupabase()
  const { data, error } = await sb.rpc('get_rsvp_by_key', { p_edit_key: key })
  if (error) throw error
  const row = data?.[0]
  if (!row) throw new Error('INVALID_EDIT_LINK')
  writeStorage(EDIT_KEY, key)
  return { side: row.side, name: row.name, attending: row.attending,
    partySize: row.party_size, meal: row.meal, phone: row.phone ?? '', memo: row.memo ?? '' }
}

export async function submitRsvp(input: RsvpInput, key: string, create: boolean): Promise<void> {
  if (!isRsvpEditKey(key)) throw new Error('INVALID_EDIT_LINK')
  const payload = {
    p_side: input.side,
    p_name: normalize(input.name),
    p_attending: input.attending,
    p_party_size: input.attending ? input.partySize : 0,
    p_meal: input.attending ? input.meal : 'no',
    p_phone: input.phone.replace(/[^0-9]/g, '') || null,
    p_memo: normalize(input.memo) || null,
  }
  if (isLocalMock) {
    const list = JSON.parse(readStorage('mock-rsvp') ?? '[]') as RsvpRow[]
    const index = list.findIndex((row) => row.editKey === key)
    if (index < 0 && !create) throw new Error('INVALID_EDIT_LINK')
    const row = { ...payload, editKey: key, at: new Date().toISOString() }
    if (index < 0) list.push(row)
    else list[index] = row
    writeStorage('mock-rsvp', JSON.stringify(list))
  } else {
    const sb = await getSupabase()
    const { data, error } = await sb.rpc('save_rsvp', { ...payload, p_edit_key: key, p_create: create })
    if (error) throw error
    if (!data) throw new Error('INVALID_EDIT_LINK')
  }
  writeStorage(EDIT_KEY, key)
}
