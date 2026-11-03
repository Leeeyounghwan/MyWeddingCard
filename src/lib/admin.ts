import { getSupabase, isLocalMock, isSupabaseConfigured } from './supabase'
import { readStorage, writeStorage } from './storage'
import type { GuestbookEntry } from './guestbook'

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

export async function listGuestbookAdmin(adminKey: string): Promise<GuestbookEntry[]> {
  if (isLocalMock) {
    const rows = JSON.parse(readStorage('mock-guestbook') ?? '[]') as Array<GuestbookEntry & { pw?: string }>
    return rows.map(({ pw: _pw, ...entry }) => entry)
  }

  const sb = await getSupabase()
  const { data, error } = await sb.rpc('get_guestbook_admin', { p_key: adminKey })
  if (error) throw error
  return (data ?? []) as GuestbookEntry[]
}

export async function deleteGuestbookAdmin(adminKey: string, id: string): Promise<void> {
  if (isLocalMock) {
    const rows = JSON.parse(readStorage('mock-guestbook') ?? '[]') as Array<GuestbookEntry & { pw?: string }>
    const next = rows.filter((entry) => entry.id !== id)
    if (next.length === rows.length) throw new Error('NOT_FOUND')
    writeStorage('mock-guestbook', JSON.stringify(next))
    return
  }

  const sb = await getSupabase()
  const { data, error } = await sb.rpc('admin_delete_guestbook', { p_key: adminKey, p_id: id })
  if (error) throw error
  if (data === false) throw new Error('NOT_FOUND')
}
