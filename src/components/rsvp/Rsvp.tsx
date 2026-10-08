import { Link, Pencil, Send } from 'lucide-react'
import { lazy, Suspense, useEffect, useState } from 'react'
import { features } from '../../data/wedding'
import { useDisclosure } from '../../hooks/useDisclosure'
import { incomingRsvpEditKey, rsvpAvailable, savedRsvpEditKey } from '../../lib/rsvp'
import { rsvpEditUrl, takeRsvpEditKey } from '../../lib/rsvpEditLink'
import { copyText, pageUrl } from '../../lib/share'
import { Button } from '../common/Button'
import { Reveal } from '../common/Reveal'
import { Section } from '../common/Section'
import styles from './Rsvp.module.css'

const RsvpSheet = lazy(() => import('./RsvpSheet'))

const closed = features.rsvpDeadline ? Date.now() > new Date(features.rsvpDeadline).getTime() : false

/** 참석 여부 전달 — 버튼을 누르면 하단 시트 폼이 열립니다. */
export function Rsvp() {
  const sheet = useDisclosure()
  const [editKey, setEditKey] = useState<string | null>(incomingRsvpEditKey)
  const [savedKey, setSavedKey] = useState(savedRsvpEditKey)
  useEffect(() => {
    if (rsvpAvailable && incomingRsvpEditKey !== null && !closed) sheet.show()
    const openEditLink = () => {
      const key = takeRsvpEditKey()
      if (key === null || !rsvpAvailable || closed) return
      setEditKey(key)
      sheet.show()
    }
    window.addEventListener('hashchange', openEditLink)
    return () => window.removeEventListener('hashchange', openEditLink)
  }, [sheet.show])
  if (!rsvpAvailable) return null

  return (
    <Section id="rsvp" eyebrow="R.S.V.P." title="참석 여부 전달" tone="surface" className={styles.section}>
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
            onClick={() => { setEditKey(null); sheet.show() }}
            aria-haspopup="dialog"
          >
            {savedKey ? '새 회신 작성' : '참석 여부 전달하기'}
          </Button>
        )}
      </Reveal>
      {savedKey && !closed && (
        <div className={styles.saved}>
          <p>회신이 전달되었습니다. 변경사항은 기존 회신을 수정해 주세요.</p>
          <Button size="sm" icon={<Pencil size={16} aria-hidden="true" />}
            onClick={() => { setEditKey(savedKey); sheet.show() }} aria-haspopup="dialog">
            이전 회신 수정
          </Button>
          <Button size="sm" icon={<Link size={16} aria-hidden="true" />}
            onClick={() => copyText(rsvpEditUrl(savedKey, pageUrl()), '응답 수정 링크가 복사되었습니다')}>
            응답 수정 링크 복사
          </Button>
          <p>수정 링크를 보관해 주세요. 링크를 가진 사람은 회신을 조회하고 수정할 수 있습니다.</p>
          {import.meta.env.DEV && <p>임시 테스트 주소가 종료되면 수정 링크도 사용할 수 없습니다.</p>}
        </div>
      )}
      {sheet.mounted && (
        <Suspense fallback={null}>
          <RsvpSheet key={editKey ?? 'new'} open={sheet.open} onClose={sheet.hide} editKey={editKey}
            onLoaded={setSavedKey}
            onSaved={(key) => { setSavedKey(key); setEditKey(key); sheet.hide() }} />
        </Suspense>
      )}
    </Section>
  )
}
