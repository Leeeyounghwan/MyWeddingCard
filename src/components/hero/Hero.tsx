import { m, useReducedMotion, useScroll, useTransform, type Variants } from 'framer-motion'
import { useRef } from 'react'
import { bride, groom, media, venue } from '../../data/wedding'
import { asset } from '../../lib/asset'
import { timeEn, wd, weekdayEn } from '../../lib/date'
import styles from './Hero.module.css'

const EASE = [0.22, 1, 0.36, 1] as const
const pad = (n: number) => String(n).padStart(2, '0')

const container: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.2, delayChildren: 0.45 } },
}
const item: Variants = {
  hidden: { opacity: 0, y: 18 },
  show: { opacity: 1, y: 0, transition: { duration: 1.15, ease: EASE } },
}
const petals = Array.from({ length: 9 }, (_, i) => i)

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
          initial={{ scale: 1.16, opacity: 0.92 }}
          animate={{ scale: 1, opacity: 1 }}
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
        <m.p
          className={styles.top}
          initial={{ opacity: 0, y: -8, letterSpacing: '0.6em' }}
          animate={{ opacity: 1, y: 0, letterSpacing: '0.42em' }}
          transition={{ duration: 1.45, delay: 0.25, ease: EASE }}
        >
          Wedding Invitation
        </m.p>

        <m.div className={styles.bottom} variants={container} initial="hidden" animate="show">
          <h1 className={styles.names}>
            <m.span variants={item} className={styles.name}>
              {groom.nameEn}
            </m.span>
            <m.span variants={item} className={styles.name}>
              <em className={styles.amp} aria-hidden="true">
                &amp;
              </em>
              <span className="sr-only">그리고 </span>
              {bride.nameEn}
            </m.span>
          </h1>

          <m.span variants={item} className={styles.rule} aria-hidden="true" />

          <m.p variants={item} className={styles.korean}>
            {groom.name}
            <span className={styles.dot} aria-hidden="true">
              ·
            </span>
            {bride.name}
          </m.p>

          <m.dl variants={item} className={styles.meta}>
            <div>
              <dt className="sr-only">예식일</dt>
              <dd>
                {wd.year}. {pad(wd.month)}. {pad(wd.day)} {weekdayEn}
                {timeEn && <span className={styles.time}> {timeEn}</span>}
              </dd>
            </div>
            <div>
              <dt className="sr-only">예식장</dt>
              <dd className={styles.venue}>
                {venue.nameEn}, {venue.cityEn}
              </dd>
            </div>
          </m.dl>
        </m.div>
      </m.div>

      <m.a
        href="#invitation"
        className={styles.scroll}
        aria-label="아래로 스크롤"
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.85, delay: 2.75, ease: EASE }}
      >
        <span>Scroll</span>
        <span className={styles.scrollLine} aria-hidden="true" />
      </m.a>
    </section>
  )
}
