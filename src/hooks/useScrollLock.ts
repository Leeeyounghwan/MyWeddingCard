import { useEffect } from 'react'

let locks = 0
let savedY = 0

function lock() {
  if (locks++ > 0) return
  savedY = window.scrollY
  const b = document.body.style
  // iOS Safari 에서도 배경 스크롤이 움직이지 않도록 position: fixed 방식 사용
  b.position = 'fixed'
  b.top = `-${savedY}px`
  b.left = '0'
  b.right = '0'
  b.width = '100%'
  b.overflow = 'hidden'
  document.getElementById('root')?.setAttribute('inert', '')
}

function unlock() {
  if (--locks > 0) return
  locks = 0
  const b = document.body.style
  b.position = b.top = b.left = b.right = b.width = b.overflow = ''
  document.getElementById('root')?.removeAttribute('inert')
  window.scrollTo({ top: savedY, behavior: 'instant' as ScrollBehavior })
}

/**
 * 모달 · 시트 · 인트로가 열려 있는 동안 배경 스크롤을 막고,
 * 배경(#root)을 inert 처리해 키보드 포커스가 뒤로 빠져나가지 않게 합니다.
 * (그래서 모달류는 모두 document.body 에 portal 로 렌더링합니다.)
 */
export function useScrollLock(active: boolean) {
  useEffect(() => {
    if (!active) return
    lock()
    return unlock
  }, [active])
}
