import { useInView } from 'framer-motion'
import { memo, useEffect, useRef, useState } from 'react'
import { bride, groom } from '../../data/wedding'
import { weddingEnd, weddingStart } from '../../lib/date'
import { Reveal } from '../common/Reveal'
import styles from './Countdown.module.css'

type Phase = 'before' | 'during' | 'after'

function calc(now: number) {
  const phase: Phase = now < weddingStart ? 'before' : now < weddingEnd ? 'during' : 'after'
  const diff = Math.max(0, weddingStart - now)
  return {
    phase,
    days: Math.floor(diff / 86_400_000),
    hours: Math.floor((diff / 3_600_000) % 24),
    minutes: Math.floor((diff / 60_000) % 60),
    seconds: Math.floor((diff / 1000) % 60),
  }
}

const pad = (n: number) => String(n).padStart(2, '0')

/**
 * 예식까지 남은 시간.
 * - 1초마다 이 컴포넌트만 다시 그려지며(다른 섹션은 영향 없음), 화면 밖에서는 타이머를 멈춥니다.
 * - 예식 시작 후 / 종료 후에는 문구가 바뀝니다.
 */
export const Countdown = memo(function Countdown() {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { margin: '100px 0px' })
  const [t, setT] = useState(() => calc(Date.now()))

  useEffect(() => {
    if (!inView) return
    setT(calc(Date.now()))
    const id = window.setInterval(() => setT(calc(Date.now())), 1000)
    return () => window.clearInterval(id)
  }, [inView])

  const units = [
    { label: 'Days', value: String(t.days) },
    { label: 'Hours', value: pad(t.hours) },
    { label: 'Minutes', value: pad(t.minutes) },
    { label: 'Seconds', value: pad(t.seconds) },
  ]

  return (
    <div ref={ref} className={styles.wrap} id="countdown">
      {t.phase === 'before' ? (
        <>
          <Reveal>
            <ul className={styles.units} aria-label={`예식까지 ${t.days}일 ${t.hours}시간 ${t.minutes}분 남음`}>
              {units.map((u, i) => (
                <li key={u.label} className={styles.unit} aria-hidden="true">
                  {i > 0 && <span className={styles.colon}>:</span>}
                  <span className={styles.value}>{u.value}</span>
                  <span className={styles.label}>{u.label}</span>
                </li>
              ))}
            </ul>
          </Reveal>
          <Reveal as="p" className={styles.caption} delay={0.15}>
            {groom.firstName} <span className={styles.heart}>♥</span> {bride.firstName}의 결혼식이{' '}
            {t.days === 0 ? (
              <strong>얼마 남지 않았습니다.</strong>
            ) : (
              <>
                <strong>{t.days}일</strong> 남았습니다.
              </>
            )}
          </Reveal>
        </>
      ) : (
        <Reveal as="p" className={styles.message}>
          {t.phase === 'during' ? '우리의 결혼식이 시작되었습니다.' : '함께해 주셔서 진심으로 감사합니다.'}
        </Reveal>
      )}
    </div>
  )
})
