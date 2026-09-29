import { meta } from '../data/wedding'
import { toast } from './toast'

/** 클립보드 복사 (구형 브라우저 · 인앱 브라우저 대비 fallback 포함) */
export async function copyText(text: string, successMessage = '복사되었습니다'): Promise<boolean> {
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text)
      toast(successMessage)
      return true
    }
  } catch {
    /* fallback 으로 진행 */
  }
  try {
    const ta = document.createElement('textarea')
    ta.value = text
    ta.setAttribute('readonly', '')
    ta.style.cssText = 'position:fixed;top:0;left:0;opacity:0;font-size:16px;'
    document.body.appendChild(ta)
    ta.select()
    ta.setSelectionRange(0, text.length)
    const ok = document.execCommand('copy')
    document.body.removeChild(ta)
    if (ok) {
      toast(successMessage)
      return true
    }
  } catch {
    /* noop */
  }
  toast('복사에 실패했어요. 길게 눌러 직접 복사해 주세요.')
  return false
}

/** 현재 청첩장 주소 (쿼리 · 해시 제거) */
export function pageUrl(): string {
  return `${location.origin}${location.pathname}`
}

/** Web Share API → 미지원 시 URL 복사 */
export async function shareInvitation(): Promise<void> {
  const data: ShareData = {
    title: meta.title,
    text: `${meta.title}\n${meta.description}`,
    url: pageUrl(),
  }
  if (navigator.share) {
    try {
      await navigator.share(data)
      return
    } catch (e) {
      // 사용자가 공유 시트를 닫은 경우는 조용히 종료
      if ((e as DOMException)?.name === 'AbortError') return
    }
  }
  await copyText(pageUrl(), '청첩장 주소가 복사되었습니다')
}

/** 이미지 파일 공유가 가능한 환경인지 (iOS/Android 최신 브라우저) */
export function canShareFiles(file: File): boolean {
  try {
    return typeof navigator.canShare === 'function' && navigator.canShare({ files: [file] })
  } catch {
    return false
  }
}
