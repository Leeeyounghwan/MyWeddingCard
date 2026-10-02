import { domAnimation, LazyMotion, MotionConfig } from 'framer-motion'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import './styles/global.css'

const inAppBrowser = /KAKAOTALK|NAVER|FBAN|FB_IAB|Instagram|Line\//i.test(navigator.userAgent)
document.documentElement.toggleAttribute('data-in-app-browser', inAppBrowser)
if (inAppBrowser) {
  const setAppHeight = () => document.documentElement.style.setProperty('--app-height', `${window.innerHeight}px`)
  setAppHeight()
  window.addEventListener('orientationchange', () => setTimeout(setAppHeight, 250), { passive: true })
}

/**
 * 데스크톱 우클릭 '이미지 저장/복사'를 막습니다. (모바일 길게 누르기는 CSS -webkit-touch-callout 로 처리)
 * '청첩장 이미지 저장' 결과물처럼 저장을 허용해야 하는 이미지는 data-allow-save 로 예외 처리합니다.
 */
document.addEventListener('contextmenu', (e) => {
  const target = e.target as HTMLElement | null
  if (target?.tagName === 'IMG' && !target.closest('[data-allow-save]')) e.preventDefault()
})

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    {/* LazyMotion + m 컴포넌트: 필요한 애니메이션 기능만 번들에 포함 (drag/layout 제외) */}
    <LazyMotion features={domAnimation} strict>
      {/* 사용자가 '동작 줄이기'를 켠 경우 이동/확대 애니메이션을 끄고 페이드만 유지 */}
      <MotionConfig reducedMotion={inAppBrowser ? 'always' : 'user'}>
        <App />
      </MotionConfig>
    </LazyMotion>
  </StrictMode>,
)
