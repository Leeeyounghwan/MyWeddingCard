import { m, useReducedMotion } from 'framer-motion'
import { ImageDown, Link2, Share2 } from 'lucide-react'
import { lazy, Suspense } from 'react'
import { bride, ending, groom } from '../../data/wedding'
import { useDisclosure } from '../../hooks/useDisclosure'
import { dotDate } from '../../lib/date'
import { viewportOnce } from '../../lib/motion'
import { copyText, pageUrl, shareInvitation } from '../../lib/share'
import { Photo } from '../common/Photo'
import { Reveal, RevealGroup, RevealItem } from '../common/Reveal'
import styles from './Ending.module.css'

const CardSheet = lazy(() => import('../share/CardSheet'))

/** 글자가 한 자씩 떠오르는 레터링 */
function Lettering({ text }: { text: string }) {
  const reduce = useReducedMotion()
  return (
    <m.p
      className={styles.lettering}
      aria-label={text}
      initial="hidden"
      whileInView="show"
      viewport={viewportOnce}
      variants={{ hidden: {}, show: { transition: { staggerChildren: reduce ? 0 : 0.045, delayChildren: 0.2 } } }}
    >
      {Array.from(text).map((ch, i) => (
        <m.span
          key={i}
          aria-hidden="true"
          variants={{ hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0 } }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        >
          {ch === ' ' ? ' ' : ch}
        </m.span>
      ))}
    </m.p>
  )
}

/** 마지막 장면 — 사진 위 레터링 + 공유/저장 */
export function Ending() {
  const card = useDisclosure()

  return (
    <section id="ending" className={styles.ending} aria-label="맺음말">
      <div className={styles.visual}>
        <Photo src={ending.photo} alt="" className={styles.photo} />
        <div className={styles.shade} aria-hidden="true" />
        <div className={styles.overlay}>
          <Lettering text={ending.eyebrow} />
          <Reveal as="p" className={styles.date} delay={0.9} variant="fade">
            {dotDate}
          </Reveal>
        </div>
      </div>

      <div className={styles.body}>
        <RevealGroup className={styles.names} stagger={0.18}>
          <RevealItem as="p">{groom.name}</RevealItem>
          <RevealItem as="span" className={styles.amp}>
            &amp;
          </RevealItem>
          <RevealItem as="p">{bride.name}</RevealItem>
        </RevealGroup>

        <Reveal className={styles.message} delay={0.2}>
          {ending.lines.map((l, i) => (
            <span key={i}>{l}</span>
          ))}
        </Reveal>

        <Reveal className={styles.actions} delay={0.3}>
          <button type="button" className={styles.action} onClick={() => void shareInvitation()}>
            <Share2 size={18} strokeWidth={1.25} aria-hidden="true" />
            <span>청첩장 공유하기</span>
          </button>
          <button
            type="button"
            className={styles.action}
            onClick={() => copyText(pageUrl(), '청첩장 주소가 복사되었습니다')}
          >
            <Link2 size={18} strokeWidth={1.25} aria-hidden="true" />
            <span>링크 복사</span>
          </button>
          <button type="button" className={styles.action} onClick={card.show} aria-haspopup="dialog">
            <ImageDown size={18} strokeWidth={1.25} aria-hidden="true" />
            <span>청첩장 이미지 저장</span>
          </button>
        </Reveal>

        <p className={styles.footer}>
          {groom.nameEn} &amp; {bride.nameEn} — {dotDate}
        </p>
      </div>

      {card.mounted && (
        <Suspense fallback={null}>
          <CardSheet open={card.open} onClose={card.hide} />
        </Suspense>
      )}
    </section>
  )
}
