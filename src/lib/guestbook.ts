import { getSupabase, isSupabaseConfigured, isLocalMock } from './supabase'
import { readStorage, writeStorage } from './storage'
import { normalize } from './validation'

/**
 * 방명록 API.
 * 모든 읽기/쓰기는 Supabase RPC(security definer 함수)를 통해서만 이루어집니다.
 * → 클라이언트는 테이블에 직접 접근할 수 없고, password_hash 컬럼은 절대 조회되지 않습니다.
 */
export interface GuestbookEntry {
  id: string
  name: string
  message: string
  created_at: string
}

export interface GuestbookPage {
  entries: GuestbookEntry[]
  total: number
}

export interface GuestbookApi {
  list(limit: number, offset: number): Promise<GuestbookPage>
  create(input: { name: string; message: string; password: string }): Promise<GuestbookEntry>
  remove(id: string, password: string): Promise<void>
}

type Row = GuestbookEntry & { total_count: number }

const supabaseApi: GuestbookApi = {
  async list(limit, offset) {
    const sb = await getSupabase()
    const { data, error } = await sb.rpc('get_guestbook', { p_limit: limit, p_offset: offset })
    if (error) throw error
    const rows = (data ?? []) as Row[]
    return {
      entries: rows.map(({ total_count: _t, ...e }) => e),
      total: rows[0]?.total_count ?? (offset > 0 ? offset : 0),
    }
  },
  async create({ name, message, password }) {
    const sb = await getSupabase()
    const { data, error } = await sb.rpc('add_guestbook', {
      p_name: normalize(name),
      p_message: normalize(message),
      p_password: password,
    })
    if (error) throw error
    return (Array.isArray(data) ? data[0] : data) as GuestbookEntry
  },
  async remove(id, password) {
    const sb = await getSupabase()
    const { data, error } = await sb.rpc('delete_guestbook', { p_id: id, p_password: password })
    if (error) throw error
    // 비밀번호 불일치는 (시도 횟수 기록을 남기기 위해) 예외가 아닌 false 로 돌아옵니다.
    if (data === false) throw new Error('WRONG_PASSWORD')
  },
}

/* ── 개발용 로컬 모드 (VITE_SUPABASE_* 미설정 + npm run dev 일 때만) ── */
interface MockRow extends GuestbookEntry {
  pw: string
}
const MOCK_KEY = 'mock-guestbook'
const readMock = (): MockRow[] => JSON.parse(readStorage(MOCK_KEY) ?? '[]') as MockRow[]
const saveMock = (rows: MockRow[]) => writeStorage(MOCK_KEY, JSON.stringify(rows))

const mockApi: GuestbookApi = {
  async list(limit, offset) {
    const rows = readMock()
    return { entries: rows.slice(offset, offset + limit).map(({ pw: _pw, ...e }) => e), total: rows.length }
  },
  async create({ name, message, password }) {
    const entry: MockRow = {
      id: crypto.randomUUID?.() ?? String(Date.now()),
      name: normalize(name),
      message: normalize(message),
      created_at: new Date().toISOString(),
      pw: password,
    }
    saveMock([entry, ...readMock()])
    const { pw: _pw, ...e } = entry
    return e
  },
  async remove(id, password) {
    const rows = readMock()
    const target = rows.find((r) => r.id === id)
    if (!target) throw new Error('NOT_FOUND')
    if (target.pw !== password) throw new Error('WRONG_PASSWORD')
    saveMock(rows.filter((r) => r.id !== id))
  },
}

export const guestbookAvailable = isSupabaseConfigured || isLocalMock
export const guestbookApi: GuestbookApi = isLocalMock ? mockApi : supabaseApi
