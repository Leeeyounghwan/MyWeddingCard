/**
 * localStorage / sessionStorage 는 사파리 사생활 보호 모드, 인앱 브라우저 등에서
 * 예외를 던질 수 있으므로 항상 이 래퍼를 통해 접근합니다.
 */
type Kind = 'local' | 'session'

const PREFIX = 'wedding:'

function store(kind: Kind): Storage | null {
  try {
    return kind === 'local' ? window.localStorage : window.sessionStorage
  } catch {
    return null
  }
}

export function readStorage(key: string, kind: Kind = 'local'): string | null {
  try {
    return store(kind)?.getItem(PREFIX + key) ?? null
  } catch {
    return null
  }
}

export function writeStorage(key: string, value: string, kind: Kind = 'local'): void {
  try {
    store(kind)?.setItem(PREFIX + key, value)
  } catch {
    /* 저장이 안 되어도 기능에는 지장 없음 */
  }
}

export function removeStorage(key: string, kind: Kind = 'local'): void {
  try {
    store(kind)?.removeItem(PREFIX + key)
  } catch {
    /* noop */
  }
}
