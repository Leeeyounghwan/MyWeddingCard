import { useEffect, useState } from 'react'
import BelowFold from './BelowFold'
import { AdminRsvp } from './components/admin/AdminRsvp'
import { ToastHost } from './components/common/ToastHost'
import { FloatingNav } from './components/floating/FloatingNav'
import { Hero } from './components/hero/Hero'
import { Invitation } from './components/invitation/Invitation'
import { MusicButton } from './components/music/MusicButton'

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

  return (
    <>
      <main>
        <Hero />
        <Invitation />
        <BelowFold />
      </main>
      <MusicButton visible />
      <LargeTextToggle />
      <FloatingNav />
      <ToastHost />
    </>
  )
}

function LargeTextToggle() {
  const [large, setLarge] = useState(() => localStorage.getItem('large-text') === '1')

  useEffect(() => {
    document.documentElement.toggleAttribute('data-large-text', large)
    localStorage.setItem('large-text', large ? '1' : '0')
  }, [large])

  return (
    <button
      type="button"
      className="large-text-toggle"
      aria-pressed={large}
      aria-label={large ? '기본 글씨로 보기' : '큰 글씨로 보기'}
      onClick={() => setLarge((v) => !v)}
    >
      <span className="large-text-toggle__mark" aria-hidden="true">
        Aa
      </span>
      <span className="large-text-toggle__label">{large ? '기본' : '크게'}</span>
    </button>
  )
}
