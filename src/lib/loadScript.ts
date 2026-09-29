const cache = new Map<string, Promise<void>>()

/** 외부 SDK 스크립트를 한 번만 비동기로 로드합니다. */
export function loadScript(src: string): Promise<void> {
  const hit = cache.get(src)
  if (hit) return hit
  const p = new Promise<void>((resolve, reject) => {
    const s = document.createElement('script')
    s.src = src
    s.async = true
    s.onload = () => resolve()
    s.onerror = () => {
      cache.delete(src)
      s.remove()
      reject(new Error(`Failed to load ${src}`))
    }
    document.head.appendChild(s)
  })
  cache.set(src, p)
  return p
}
