import { m, useReducedMotion, useScroll, useTransform, type Variants } from 'framer-motion'
import { useRef } from 'react'
import { bride, groom, media } from '../../data/wedding'
import { asset } from '../../lib/asset'
import { wd, weekdayKo } from '../../lib/date'
import styles from './Hero.module.css'

const EASE = [0.22, 1, 0.36, 1] as const

const container: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.2, delayChildren: 0.45 } },
}
const item: Variants = {
  hidden: { opacity: 0, y: 18 },
  show: { opacity: 1, y: 0, transition: { duration: 1.15, ease: EASE } },
}
const petals = Array.from({ length: 12 }, (_, i) => i)

/**
 * 메인 히어로 — 사진 한 장으로 몰입감 있게.
 * 텍스트가 순서대로 떠오르고, 스크롤 시 사진이 은은하게 패럴랙스됩니다.
 */
export function Hero() {
  const ref = useRef<HTMLElement>(null)
  const reduce = useReducedMotion()
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] })
  const imageY = useTransform(scrollYProgress, [0, 1], reduce ? ['0%', '0%'] : ['0%', '18%'])
  const textOpacity = useTransform(scrollYProgress, [0, 0.55], reduce ? [1, 1] : [1, 0])

  return (
    <section ref={ref} className={styles.hero} aria-label="메인">
      <m.div className={styles.media} style={{ y: imageY }}>
        <m.img
          src={asset(media.heroImage)}
          alt={`${groom.name} · ${bride.name} 웨딩 사진`}
          fetchPriority="high"
          decoding="async"
          draggable={false}
          style={{ transformOrigin: 'center 75%' }}
          initial={{ scale: 1.16, opacity: 0.92 }}
          animate={{ scale: 1.28, opacity: 1 }}
          transition={{ duration: 3.6, ease: EASE }}
        />
      </m.div>
      <div className={styles.shade} aria-hidden="true" />
      {!reduce && (
        <div className={styles.petals} aria-hidden="true">
          {petals.map((i) => (
            <span key={i} className={styles.petal} />
          ))}
        </div>
      )}

      <m.div className={styles.inner} style={{ opacity: textOpacity }}>
        <m.div className={styles.bottom} variants={container} initial="hidden" animate="show">
          <m.dl variants={item} className={styles.meta}>
            <div>
              <dt className="sr-only">예식일</dt>
              <dd className={styles.dateKo}>
                {wd.year}년 {wd.month}월 {wd.day}일 {weekdayKo}요일 {wd.hour < 12 ? '오전' : '오후'}{' '}
                {wd.hour % 12 || 12}시
              </dd>
            </div>
            <div>
              <dt className="sr-only">예식장</dt>
              <dd className={styles.venue}>
                <strong className={styles.venueStrong}>웨스턴팰리스 호텔 웨딩</strong>
              </dd>
            </div>
          </m.dl>
        </m.div>
      </m.div>

    </section>
  )
}
