import { lazy, Suspense, useCallback, useEffect, useState } from 'react'
import { AdminRsvp } from './components/admin/AdminRsvp'
import { ToastHost } from './components/common/ToastHost'
import { FloatingNav } from './components/floating/FloatingNav'
import { Hero } from './components/hero/Hero'
import { Intro } from './components/intro/Intro'
import { Invitation } from './components/invitation/Invitation'
import { MusicButton } from './components/music/MusicButton'
import { features } from './data/wedding'
import { readStorage, writeStorage } from './lib/storage'

// 첫 화면 아래 섹션은 별도 청크로 분리 → 초기 JS 를 줄이고, 인트로가 재생되는 동안 미리 받아둡니다.
const loadBelowFold = () => import('./BelowFold')
const BelowFold = lazy(loadBelowFold)

const INTRO_KEY = 'intro-seen'
const adminKey = new URLSearchParams(window.location.search).get('admin')

/**
 * 인트로 표시 여부
 *  ?intro   → 항상 표시 (개발 · 확인용)
 *  ?nointro → 항상 생략
 */
function shouldShowIntro(): boolean {
  if (!features.intro) return false
  const params = new URLSearchParams(window.location.search)
  if (params.has('intro')) return true
  if (params.has('nointro')) return false
  if (features.introOncePerSession && readStorage(INTRO_KEY, 'session') === '1') return false
  return true
}

export default function App() {
  if (adminKey !== null) {
    return (
      <>
        <AdminRsvp adminKey={adminKey} />
        <ToastHost />
      </>
    )
  }

  const [showIntro] = useState(shouldShowIntro)
  const [ready, setReady] = useState(!showIntro)

  useEffect(() => {
    if (showIntro) {
      // 새로고침 시 이전 스크롤 위치가 아닌 처음부터 보여주기
      if ('scrollRestoration' in history) history.scrollRestoration = 'manual'
      window.scrollTo(0, 0)
    }
    void loadBelowFold()
  }, [showIntro])

  const handleIntroDone = useCallback(() => {
    writeStorage(INTRO_KEY, '1', 'session')
    setReady(true)
  }, [])

  return (
    <>
      {showIntro && !ready && <Intro onDone={handleIntroDone} />}
      <main>
        <Hero ready={ready} />
        <Invitation />
        <Suspense fallback={<div style={{ minHeight: '100vh' }} />}>
          <BelowFold />
        </Suspense>
      </main>
      <MusicButton visible={ready} />
      <FloatingNav />
      <ToastHost />
    </>
  )
}
