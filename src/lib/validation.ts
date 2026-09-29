/**
 * 클라이언트 측 1차 검증.
 * ⚠️ 클라이언트 검증은 우회할 수 있으므로 동일한 규칙을 서버(RPC 함수)에서도 다시 검사합니다.
 */

export const LIMITS = {
  name: 20,
  message: 500,
  passwordMin: 4,
  passwordMax: 20,
  memo: 300,
  partyMax: 10,
} as const

/**
 * 기본 금칙어 (부분 일치). 서버의 private.blocked_words 테이블에도 같은 목록을 넣어 두세요.
 * 필요에 따라 추가/삭제하세요.
 */
const BLOCKED = ['시발', '씨발', 'ㅅㅂ', '병신', 'ㅂㅅ', '개새', '좆', '존나', '꺼져', '닥쳐', '미친놈', '미친년', 'fuck', 'shit']

const LINK_RE = /(https?:\/\/|www\.|\.(com|net|kr|io|xyz|co)\b)/i

export function normalize(s: string): string {
  // 제어문자 제거 + 앞뒤 공백 정리 + 3줄 이상 연속 개행 축소
  return s
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F​-‏‪-‮]/g, '')
    .replace(/\r\n?/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim()
}

export function hasBlockedWord(s: string): boolean {
  const compact = s.toLowerCase().replace(/[\s.\-_*~!@#]/g, '')
  return BLOCKED.some((w) => compact.includes(w))
}

export function hasLink(s: string): boolean {
  return LINK_RE.test(s)
}

export function validateGuestbook(input: { name: string; message: string; password: string }): string | null {
  const name = normalize(input.name)
  const message = normalize(input.message)
  if (!name || name.length > LIMITS.name) return `이름을 1~${LIMITS.name}자로 입력해 주세요.`
  if (!message) return '축하 메시지를 입력해 주세요.'
  if (message.length > LIMITS.message) return `메시지는 ${LIMITS.message}자까지 입력할 수 있어요.`
  if (input.password.length < LIMITS.passwordMin || input.password.length > LIMITS.passwordMax)
    return `비밀번호를 ${LIMITS.passwordMin}~${LIMITS.passwordMax}자로 입력해 주세요.`
  if (hasLink(name) || hasLink(message)) return '링크(URL)는 남길 수 없어요.'
  if (hasBlockedWord(name) || hasBlockedWord(message)) return '사용할 수 없는 표현이 포함되어 있어요.'
  return null
}

export const PHONE_RE = /^01[016789]-?\d{3,4}-?\d{4}$/
