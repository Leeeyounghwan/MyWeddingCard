import { Send } from 'lucide-react'
import { lazy, Suspense } from 'react'
import { features } from '../../data/wedding'
import { useDisclosure } from '../../hooks/useDisclosure'
import { rsvpAvailable } from '../../lib/rsvp'
import { Button } from '../common/Button'
import { Reveal } from '../common/Reveal'
import { Section } from '../common/Section'
import styles from './Rsvp.module.css'

const RsvpSheet = lazy(() => import('./RsvpSheet'))

const closed = features.rsvpDeadline ? Date.now() > new Date(features.rsvpDeadline).getTime() : false

/** 참석 여부 전달 — 버튼을 누르면 하단 시트 폼이 열립니다. */
export function Rsvp() {
  const sheet = useDisclosure()
  if (!rsvpAvailable) return null

  return (
    <Section id="rsvp" eyebrow="R.S.V.P." title="참석 여부 전달">
      <Reveal as="p" className={styles.text}>
        축하의 마음으로 참석해 주시는 모든 분들을
        <br />
        정성껏 모실 수 있도록
        <br />
        참석 여부를 미리 알려주시면 감사하겠습니다.
      </Reveal>
      <Reveal className={styles.action} delay={0.15}>
        {closed ? (
          <p className={styles.closed}>참석 여부 회신이 마감되었습니다. 감사합니다.</p>
        ) : (
          <Button
            variant="primary"
            icon={<Send size={15} strokeWidth={1.5} aria-hidden="true" />}
            onClick={sheet.show}
            aria-haspopup="dialog"
          >
            참석 여부 전달하기
          </Button>
        )}
      </Reveal>
      {sheet.mounted && (
        <Suspense fallback={null}>
          <RsvpSheet open={sheet.open} onClose={sheet.hide} />
        </Suspense>
      )}
    </Section>
  )
}
