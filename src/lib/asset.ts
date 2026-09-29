/**
 * public/ 폴더의 파일 경로를 GitHub Pages 하위 경로(base)에 맞게 변환합니다.
 * 예) asset('images/hero.webp') → '/repo-name/images/hero.webp'
 */
export function asset(path: string): string {
  if (!path) return ''
  if (/^(https?:|data:|blob:)/.test(path)) return path
  return `${import.meta.env.BASE_URL}${path.replace(/^\//, '')}`
}
