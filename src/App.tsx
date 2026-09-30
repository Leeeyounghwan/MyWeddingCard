import { lazy, Suspense, useEffect } from 'react'
import { AdminRsvp } from './components/admin/AdminRsvp'
import { ToastHost } from './components/common/ToastHost'
import { FloatingNav } from './components/floating/FloatingNav'
import { Hero } from './components/hero/Hero'
import { Invitation } from './components/invitation/Invitation'
import { MusicButton } from './components/music/MusicButton'

// 첫 화면 아래 섹션은 별도 청크로 분리 → 초기 JS 를 줄입니다.
const loadBelowFold = () => import('./BelowFold')
const BelowFold = lazy(loadBelowFold)

const adminKey = new URLSearchParams(window.location.search).get('admin')

export default function App() {
  if (adminKey !== null) {
    return (
      <>
        <AdminRsvp adminKey={adminKey} />
        <ToastHost />
      </>
    )
  }

  useEffect(() => {
    void loadBelowFold()
  }, [])

  return (
    <>
      <main>
        <Hero />
        <Invitation />
        <Suspense fallback={<div style={{ minHeight: '100vh' }} />}>
          <BelowFold />
        </Suspense>
      </main>
      <MusicButton visible />
      <FloatingNav />
      <ToastHost />
    </>
  )
}
