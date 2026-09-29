import { getSupabase, isSupabaseConfigured, isLocalMock } from './supabase'
import { readStorage, writeStorage } from './storage'
import { normalize } from './validation'

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

const SUBMITTED_KEY = 'rsvp-submitted'

export function rsvpSubmittedName(): string | null {
  return readStorage(SUBMITTED_KEY)
}

export async function submitRsvp(input: RsvpInput): Promise<void> {
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
    const list = JSON.parse(readStorage('mock-rsvp') ?? '[]') as unknown[]
    writeStorage('mock-rsvp', JSON.stringify([...list, { ...payload, at: new Date().toISOString() }]))
  } else {
    const sb = await getSupabase()
    const { error } = await sb.rpc('submit_rsvp', payload)
    if (error) throw error
  }
  writeStorage(SUBMITTED_KEY, payload.p_name)
}
