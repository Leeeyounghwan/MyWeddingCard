import { m, useInView } from 'framer-motion'
import { Phone } from 'lucide-react'
import { lazy, Suspense, useRef } from 'react'
import { bride, features, groom, invitation } from '../../data/wedding'
import type { Person } from '../../data/types'
import { useDisclosure } from '../../hooks/useDisclosure'
import { Button } from '../common/Button'
import { Reveal, RevealGroup, RevealItem } from '../common/Reveal'
import { Section } from '../common/Section'
import styles from './Invitation.module.css'

const ContactSheet = lazy(() => import('../contact/ContactSheet'))

const flowerPath = 'M-1.901-2.583 C-7.47-12.188 3.432-14.979 3.139-4.109 C3.192-5.95 3.94-7.858 5.741-8.618 C7.152-9.21 8.876-8.602 9.817-7.337 C10.758-6.072 10.944-4.282 10.474-2.752 C10.104-1.569 9.577-.477 8.766.436 C8.487.747 8.185 1.033 7.863 1.288 C7.609 1.496 10.024.074 11.411 1.492 C12.395 2.507 12.683 4.277 12.289 5.659 C12.034 6.541 11.386 7.653 10.551 8.036 C9.6 8.47 8.444 8.597 7.417 8.546 C7.076 8.526 6.735 8.455 6.389 8.46 C6.197 8.46 5.847 8.276 5.813 8.587 C5.794 8.796 5.924 8.985 6.015 9.153 C6.317 9.724 6.572 10.332 6.716 10.964 C6.918 11.847 6.879 12.806 6.37 13.565 C5.924 14.238 5.194 14.627 4.45 14.79 C3.591 14.979 2.684 14.898 1.853 14.621 C.951 14.325.115 13.785-.523 13.04 C-1.233 12.209-1.652 11.148-1.767 10.036 C-1.82 9.49-1.81 8.944-1.743 8.404 C-2.631 10.908-4.45 13.321-7.225 12.882 C-9.692 12.494-11.578 10.75-11.54 8.072 C-11.53 7.644-11.497 7.215-11.382 6.807 C-11.291 6.486-11.118 6.307-10.94 6.047 C-10.503 5.399-9.898 5.012-9.207 4.716 C-8.765 4.532-8.32 4.369-7.858 4.236 C-7.661 4.18-7.465 4.14-7.263 4.099 C-7.138 4.073-6.812 3.925-6.692 3.986 C-9.39 2.583-12.683-.829-10.652-4.287 C-8.439-8.05-3.879-4.802-1.901-2.583 Z'

function FlowerOrnament() {
  const ref = useRef<SVGSVGElement>(null)
  const isInView = useInView(ref, { amount: 0.55 })

  return (
    <svg ref={ref} className={styles.flower} viewBox="0 0 48 48" role="img" aria-label="꽃 장식">
      <m.path d={flowerPath} transform="translate(24 23)" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" initial={false} animate={{ pathLength: isInView ? 1 : 0, opacity: isInView ? 1 : 0 }} transition={{ duration: 0.9, ease: 'easeInOut' }} />
      <m.path d={flowerPath} transform="translate(24 23)" fill="currentColor" initial={false} animate={{ opacity: isInView ? 1 : 0 }} transition={{ duration: 0.45, delay: isInView ? 0.65 : 0, ease: 'easeOut' }} />
      <m.circle cx="24" cy="25" r="2.8" fill="var(--color-background)" initial={false} animate={{ opacity: isInView ? 1 : 0, scale: isInView ? 1 : 0.4 }} transition={{ duration: 0.35, delay: isInView ? 0.78 : 0, ease: 'easeOut' }} />
    </svg>
  )
}

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
        <FlowerOrnament />
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
