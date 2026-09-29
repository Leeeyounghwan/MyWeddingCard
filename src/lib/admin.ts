import { getSupabase, isLocalMock, isSupabaseConfigured } from './supabase'
import { readStorage } from './storage'

export interface RsvpRow {
  id: string
  side: 'groom' | 'bride'
  name: string
  attending: boolean
  party_size: number
  meal: 'yes' | 'no' | 'undecided'
  phone: string | null
  memo: string | null
  created_at: string
}

export const adminAvailable = isSupabaseConfigured || isLocalMock

type MockRsvp = {
  p_side: RsvpRow['side']
  p_name: string
  p_attending: boolean
  p_party_size: number
  p_meal: RsvpRow['meal']
  p_phone: string | null
  p_memo: string | null
  at: string
}

export async function listRsvps(adminKey: string): Promise<RsvpRow[]> {
  if (isLocalMock) {
    const rows = JSON.parse(readStorage('mock-rsvp') ?? '[]') as MockRsvp[]
    return rows
      .map((r, i) => ({
        id: String(i),
        side: r.p_side,
        name: r.p_name,
        attending: r.p_attending,
        party_size: r.p_party_size,
        meal: r.p_meal,
        phone: r.p_phone,
        memo: r.p_memo,
        created_at: r.at,
      }))
      .reverse()
  }

  const sb = await getSupabase()
  const { data, error } = await sb.rpc('get_rsvp_admin', { p_key: adminKey })
  if (error) throw error
  return (data ?? []) as RsvpRow[]
}
