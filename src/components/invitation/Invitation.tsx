import { Phone } from 'lucide-react'
import { lazy, Suspense } from 'react'
import { bride, features, groom, invitation } from '../../data/wedding'
import type { Person } from '../../data/types'
import { useDisclosure } from '../../hooks/useDisclosure'
import { Button } from '../common/Button'
import { Reveal, RevealGroup, RevealItem } from '../common/Reveal'
import { Section } from '../common/Section'
import styles from './Invitation.module.css'

const ContactSheet = lazy(() => import('../contact/ContactSheet'))

/** 문구를 빈 줄 기준으로 문단 묶음으로 나눕니다. */
function toParagraphs(lines: string[]): string[][] {
  return lines.reduce<string[][]>(
    (acc, line) => {
      if (line.trim() === '') acc.push([])
      else acc[acc.length - 1].push(line)
      return acc
    },
    [[]],
  ).filter((p) => p.length > 0)
}

function ParentLine({ person, role }: { person: Person; role: string }) {
  const parents = [person.father, person.mother].filter((p) => p.name)
  return (
    <p className={styles.family}>
      {parents.length > 0 ? (
        <>
          <span className={styles.parents}>
            {parents.map((p, i) => (
              <span key={i}>
                {i > 0 && <span className={styles.sep}>·</span>}
                {p.deceased && <span className={styles.deceased}>故 </span>}
                {p.name}
              </span>
            ))}
          </span>
          <span className={styles.relation}>의 {person.relation}</span>
          <strong className={styles.child}>{person.firstName}</strong>
        </>
      ) : (
        <>
          <span className={styles.relation}>{role}</span>
          <strong className={styles.child}>{person.name}</strong>
        </>
      )}
    </p>
  )
}

export function Invitation() {
  const contact = useDisclosure()
  const paragraphs = toParagraphs(invitation.lines)

  return (
    <Section id="invitation" eyebrow={invitation.eyebrow} title={invitation.title} className={styles.section}>
      <Reveal variant="fade" className={styles.ornament}>
        <span aria-hidden="true" />
      </Reveal>

      <div className={styles.letter}>
        {paragraphs.map((para, i) => (
          <RevealGroup key={i} className={styles.paragraph} stagger={0.12}>
            {para.map((line, j) => (
              <RevealItem as="span" key={j} className={styles.line}>
                {line}
              </RevealItem>
            ))}
          </RevealGroup>
        ))}
      </div>

      <Reveal className={styles.families} delay={0.1}>
        <ParentLine person={groom} role="신랑" />
        <ParentLine person={bride} role="신부" />
      </Reveal>

      {features.contact && (
        <Reveal className={styles.actions} delay={0.2}>
          <Button
            variant="outline"
            icon={<Phone size={15} strokeWidth={1.5} aria-hidden="true" />}
            onClick={contact.show}
            aria-haspopup="dialog"
          >
            연락하기
          </Button>
        </Reveal>
      )}

      {contact.mounted && (
        <Suspense fallback={null}>
          <ContactSheet open={contact.open} onClose={contact.hide} />
        </Suspense>
      )}
    </Section>
  )
}
