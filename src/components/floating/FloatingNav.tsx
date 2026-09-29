import { AnimatePresence, m } from 'framer-motion'
import { ArrowUp, Share2 } from 'lucide-react'
import { useEffect, useState } from 'react'
import { shareInvitation } from '../../lib/share'
import styles from './FloatingNav.module.css'

/**
 * 하단 우측 최소한의 플로팅 버튼 (공유 · 맨 위로).
 * 히어로를 지난 뒤에만 나타나 첫 화면을 가리지 않습니다.
 */
export function FloatingNav() {
  const [show, setShow] = useState(false)

  useEffect(() => {
    let frame = 0
    const onScroll = () => {
      cancelAnimationFrame(frame)
      frame = requestAnimationFrame(() => setShow(window.scrollY > window.innerHeight * 0.9))
    }
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => {
      cancelAnimationFrame(frame)
      window.removeEventListener('scroll', onScroll)
    }
  }, [])

  return (
    <AnimatePresence>
      {show && (
        <m.nav
          className={styles.nav}
          aria-label="빠른 이동"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 12 }}
          transition={{ duration: 0.35 }}
        >
          <button type="button" className={styles.button} onClick={() => void shareInvitation()} aria-label="청첩장 공유하기">
            <Share2 size={16} strokeWidth={1.5} aria-hidden="true" />
          </button>
          <button
            type="button"
            className={styles.button}
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            aria-label="맨 위로 이동"
          >
            <ArrowUp size={16} strokeWidth={1.5} aria-hidden="true" />
          </button>
        </m.nav>
      )}
    </AnimatePresence>
  )
}
