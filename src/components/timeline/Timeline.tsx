import { m, useScroll, useSpring } from 'framer-motion'
import { useRef } from 'react'
import { timeline, timelineTitle } from '../../data/timeline'
import { Photo } from '../common/Photo'
import { ImageReveal, RevealGroup, RevealItem } from '../common/Reveal'
import { Section } from '../common/Section'
import styles from './Timeline.module.css'

/**
 * Our Story — 스크롤을 따라 세로선이 채워지고 이야기가 하나씩 등장합니다.
 * data/timeline.ts 가 비어 있으면 섹션 자체를 렌더링하지 않습니다.
 */
export function Timeline() {
  const listRef = useRef<HTMLOListElement>(null)
  const { scrollYProgress } = useScroll({ target: listRef, offset: ['start 75%', 'end 55%'] })
  const progress = useSpring(scrollYProgress, { stiffness: 120, damping: 30, restDelta: 0.001 })

  if (timeline.length === 0) return null

  return (
    <Section id="story" eyebrow={timelineTitle.eyebrow} title={timelineTitle.title}>
      <div className={styles.list}>
        <span className={styles.track} aria-hidden="true">
          <m.span className={styles.fill} style={{ scaleY: progress }} />
        </span>
        <ol ref={listRef}>
        {timeline.map((ev, i) => {
          const last = i === timeline.length - 1
          return (
            <li key={`${ev.date}-${i}`} className={styles.item} data-last={last || undefined}>
              <span className={styles.dot} aria-hidden="true" />
              <RevealGroup stagger={0.1}>
                <RevealItem as="p" className={styles.date}>
                  {ev.date}
                </RevealItem>
                <RevealItem as="h3" className={styles.title}>
                  {ev.title}
                </RevealItem>
                {ev.description && (
                  <RevealItem as="p" className={styles.desc}>
                    {ev.description}
                  </RevealItem>
                )}
              </RevealGroup>
              {ev.image && (
                <ImageReveal className={styles.image} from="left" delay={0.15}>
                  <Photo src={ev.image} alt={`${ev.date} ${ev.title}`} ratio={4 / 3} />
                </ImageReveal>
              )}
            </li>
          )
        })}
        </ol>
      </div>
    </Section>
  )
}
