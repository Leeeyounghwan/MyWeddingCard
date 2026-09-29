import { AnimatePresence, m, useReducedMotion } from 'framer-motion'
import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { bride, groom } from '../../data/wedding'
import { useScrollLock } from '../../hooks/useScrollLock'
import { wd } from '../../lib/date'
import { music } from '../../lib/music'
import styles from './Intro.module.css'

const EASE = [0.22, 1, 0.36, 1] as const
const pad = (n: number) => String(n).padStart(2, '0')

/** 시퀀스가 모두 재생된 뒤 자동으로 넘어가기까지의 시간(ms) */
const AUTO_ADVANCE_MS = 4550
const AUTO_ADVANCE_MS_REDUCED = 900

/**
 * 오프닝 연출.
 * 본문은 이 화면 뒤에서 이미 렌더링·로딩되고 있으므로 인트로가 실제 로딩을 늦추지 않습니다.
 * 버튼 없이 재생 후 자동으로 청첩장 메인으로 넘어갑니다.
 * (화면을 탭하면 바로 건너뛸 수 있고, 이 탭은 사용자 제스처이므로 배경음악 자동재생도 그때 함께 시작됩니다.
 *  타이머로 자동 전환되는 경우에는 모바일 브라우저 정책상 배경음악 자동재생이 막힐 수 있어,
 *  이때는 우측 상단 음악 버튼으로 직접 재생할 수 있습니다.)
 */
export function Intro({ onDone }: { onDone: () => void }) {
  const [open, setOpen] = useState(true)
  const dialogRef = useRef<HTMLDivElement>(null)
  const dismissedRef = useRef(false)
  const reduce = useReducedMotion()
  useScrollLock(open)

  useEffect(() => {
    dialogRef.current?.focus({ preventScroll: true })
  }, [])

  useEffect(() => {
    const dismiss = () => {
      if (dismissedRef.current) return
      dismissedRef.current = true
      if (!music.userMuted) void music.play() // 자동 전환 시점엔 사용자 제스처가 없어 재생이 막힐 수 있음(정상)
      setOpen(false)
    }
    const t = window.setTimeout(dismiss, reduce ? AUTO_ADVANCE_MS_REDUCED : AUTO_ADVANCE_MS)

    // 화면을 탭/클릭하거나 키를 누르면 바로 건너뜁니다 — 이 조작은 사용자 제스처이므로 음악 재생이 확실히 시도됩니다.
    const onSkip = (e: Event) => {
      if (e instanceof KeyboardEvent && !['Enter', ' ', 'Escape'].includes(e.key)) return
      window.clearTimeout(t)
      dismiss()
    }
    const dialog = dialogRef.current
    dialog?.addEventListener('click', onSkip)
    dialog?.addEventListener('keydown', onSkip)
    return () => {
      window.clearTimeout(t)
      dialog?.removeEventListener('click', onSkip)
      dialog?.removeEventListener('keydown', onSkip)
    }
  }, [reduce])

  return createPortal(
    <AnimatePresence onExitComplete={onDone}>
      {open && (
        <m.div
          ref={dialogRef}
          tabIndex={-1}
          className={styles.intro}
          role="dialog"
          aria-modal="true"
          aria-label="청첩장 오프닝"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: 0.75, ease: EASE } }}
        >
          <div className={styles.grain} aria-hidden="true" />

          <m.div
            className={styles.content}
            exit={{ opacity: 0, y: -24, filter: 'blur(4px)', transition: { duration: 0.6, ease: EASE } }}
          >
            <m.p
              className={styles.label}
              initial={{ opacity: 0, letterSpacing: '0.6em' }}
              animate={{ opacity: 1, letterSpacing: '0.42em' }}
              transition={{ duration: 1.6, ease: EASE, delay: 0.5 }}
            >
              Wedding Invitation
            </m.p>

            <h1 className={styles.names}>
              <m.span
                className={styles.name}
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1.25, ease: EASE, delay: 1.1 }}
              >
                {groom.nameEn}
              </m.span>
              <m.span
                className={styles.amp}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 1.1, ease: EASE, delay: 1.55 }}
                aria-hidden="true"
              >
                &amp;
              </m.span>
              <span className="sr-only">그리고</span>
              <m.span
                className={styles.name}
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1.25, ease: EASE, delay: 1.9 }}
              >
                {bride.nameEn}
              </m.span>
            </h1>

            <m.p
              className={styles.korean}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1.1, delay: 2.55 }}
            >
              {groom.name} <span aria-hidden="true">·</span> {bride.name}
            </m.p>

            <m.span
              className={styles.line}
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ duration: 1, ease: EASE, delay: 2.9 }}
              aria-hidden="true"
            />

            <m.p
              className={styles.date}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, ease: EASE, delay: 3.25 }}
            >
              {wd.year}. {pad(wd.month)}. {pad(wd.day)}
            </m.p>
          </m.div>
        </m.div>
      )}
    </AnimatePresence>,
    document.body,
  )
}
