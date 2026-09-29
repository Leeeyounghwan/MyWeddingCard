import type { SupabaseClient } from '@supabase/supabase-js'

/**
 * Supabase 클라이언트 (지연 로딩)
 *
 * - supabase-js 는 방명록/RSVP 가 실제로 필요해지는 순간에만 다운로드됩니다(Code Splitting).
 * - 여기서 쓰는 키는 브라우저에 공개되어도 되는 anon(publishable) 키입니다.
 *   실제 권한은 DB 의 RLS 와 RPC 함수(supabase/schema.sql)가 통제합니다.
 * - service_role(secret) 키는 절대 VITE_ 환경변수로 넣지 마세요. VITE_ 로 시작하는 값은 전부 번들에 포함됩니다.
 */
const url = import.meta.env.VITE_SUPABASE_URL as string | undefined
const anonKey = (import.meta.env.VITE_SUPABASE_ANON_KEY ?? import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY) as
  | string
  | undefined

export const isSupabaseConfigured = Boolean(url && anonKey)

/** 개발 중 Supabase 설정 전에도 UI 를 확인할 수 있도록 로컬 저장소 모드를 사용합니다. (배포 빌드에서는 비활성) */
export const isLocalMock = !isSupabaseConfigured && import.meta.env.DEV

let clientPromise: Promise<SupabaseClient> | null = null

export function getSupabase(): Promise<SupabaseClient> {
  if (!isSupabaseConfigured) return Promise.reject(new Error('NOT_CONFIGURED'))
  clientPromise ??= import('@supabase/supabase-js').then(({ createClient }) =>
    createClient(url!, anonKey!, {
      auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
    }),
  )
  return clientPromise
}

const ERROR_MESSAGES: Record<string, string> = {
  RATE_LIMITED: '잠시 후 다시 시도해 주세요.',
  INVALID_NAME: '이름을 1~20자로 입력해 주세요.',
  INVALID_MESSAGE: '메시지를 1~500자로 입력해 주세요.',
  INVALID_PASSWORD: '비밀번호를 4~20자로 입력해 주세요.',
  INVALID_INPUT: '입력값을 다시 확인해 주세요.',
  LINK_NOT_ALLOWED: '링크(URL)는 남길 수 없어요.',
  BLOCKED_WORD: '사용할 수 없는 표현이 포함되어 있어요.',
  DUPLICATE: '같은 내용이 이미 등록되었어요.',
  WRONG_PASSWORD: '비밀번호가 일치하지 않아요.',
  NOT_FOUND: '이미 삭제되었거나 존재하지 않는 글이에요.',
  NOT_CONFIGURED: '아직 준비 중인 기능이에요.',
  ADMIN_NOT_CONFIGURED: '관리자 키가 아직 설정되지 않았어요.',
  ADMIN_DENIED: '관리자 키가 올바르지 않아요.',
}

/** 서버(RPC)에서 raise 한 코드 → 사용자 메시지 */
export function toUserMessage(err: unknown): string {
  const raw =
    typeof err === 'object' && err && 'message' in err ? String((err as { message: unknown }).message) : String(err)
  const code = Object.keys(ERROR_MESSAGES).find((k) => raw.includes(k))
  if (code) return ERROR_MESSAGES[code]
  if (/fetch|network/i.test(raw)) return '네트워크 연결을 확인해 주세요.'
  return '잠시 후 다시 시도해 주세요.'
}
